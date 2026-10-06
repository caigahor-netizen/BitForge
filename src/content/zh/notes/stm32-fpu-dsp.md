---
title: STM32 的 FPU 与 DSP 指令：float 为什么能算得更快？
description: 了解 STM32 的单精度与双精度 FPU、浮点编译配置和 DSP 指令，避开 float 与 double 混用的性能陷阱，并用 CMSIS-DSP 实现信号处理算法。
category: 嵌入式
pubDate: 2026-10-06
---

写 STM32 程序时，我们经常会用到电压换算、PID、滤波和姿态解算。代码里同样写着乘法和加法，为什么不同芯片的执行速度会差很多？这就涉及浮点运算单元 FPU，以及用于信号处理的 DSP 指令。

先纠正一个名称：这里说的是“单精度”，不是“单角度”。精度描述数字能保留多少有效信息，与角度单位没有关系。

## 1. FPU 是什么？

FPU 是 Floating-Point Unit，即**浮点运算单元**。它是处理器内用于执行浮点运算的硬件，能够加速所支持精度的加、减、乘、除、平方根等操作。

例如，运行时计算：

```c
float voltage_from_adc(unsigned int adc)
{
    return (float)adc * (3.3f / 4095.0f);
}
```

编译器通常会预先算出括号中的常量，运行时主要进行类型转换和乘法。芯片有合适的 FPU，且工程配置正确时，这些操作可以使用硬件浮点指令。

**没有 FPU 的芯片也能使用 float。**区别在于，浮点运算通常需要编译器提供的软件例程，通过整数指令完成，耗时往往更长。FPU 是计算能力，不是允许声明某种变量的开关。

STM32F407 明确具有单精度 FPU 和 DSP 指令扩展，可以作为理解这两个功能的例子。[ST：STM32F407 产品说明](https://www.st.com/content/st_com/en/products/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus/stm32-high-performance-mcus/stm32f4-series/stm32f407-417/stm32f407zg.html)

## 2. 单精度、双精度与 float、double

在 STM32 常用 C/C++ 工具链的通常配置下，对应关系如下：

| 项目 | 单精度 | 双精度 |
| --- | --- | --- |
| C/C++ 类型 | `float` | `double` |
| 存储大小 | 32 位，4 字节 | 64 位，8 字节 |
| 十进制有效数字，粗略理解 | 约 6～7 位 | 约 15～16 位 |
| 常量写法 | `3.14f` | `3.14` |
| 硬件加速条件 | 支持单精度运算的 FPU | 支持双精度运算的 FPU |

这里的“有效数字”包含整数部分，**不代表小数点后固定有 7 位或 16 位**。数值越大，相邻可表示数之间的间隔通常也越大。例如 binary32 能连续精确表示整数直到 16777216，但不能精确表示 16777217。

浮点数也无法精确表示所有十进制小数，`0.1f` 通常只是近似值。双精度能减小许多舍入误差，但并不让所有计算都完全精确。Arm 文档说明了这两种浮点格式及其对应的 C 类型。[Arm：浮点数据表示](https://documentation-service.arm.com/static/5f21f7a6d105c7750ae02f36?token=)

**变量类型决定用什么精度表达和计算；FPU 决定哪些运算能由硬件加速。**

如果芯片只有单精度 FPU，仍可以声明 `double`，只是双精度算术通常需要软件完成。不能因为程序成功运行，就认为它使用了硬件双精度。

## 3. STM32 有双精度 FPU 吗？

有，但必须看具体型号。

| 示例型号 | FPU 能力 |
| --- | --- |
| STM32F407 | 单精度 |
| STM32F746 | 单精度 |
| STM32F767 | 单精度和双精度 |

F746 和 F767 同样使用 Cortex-M7，却不具有相同的浮点能力。因此，不能写成“所有 Cortex-M7 都支持硬件双精度”，也不能只看“STM32F7”这个系列名来判断。应查具体芯片的数据手册；ST 的 AN4044 也列出了上述不同实现。[ST：AN4044，FPU 实现对比](https://www.st.com/resource/en/application_note/an4044-floating-point-unit-demonstration-on-stm32-microcontrollers-stmicroelectronics.pdf)

## 4. FPU 需要专门开启吗？

需要同时满足三个条件：**芯片有这个硬件、启动代码允许访问、编译器生成对应指令。**

以 STM32F4 为例，ST 官方 `system_stm32f4xx.c` 的 `SystemInit()` 已包含条件启用代码，核心操作是设置 CPACR，允许访问 CP10、CP11。正常工程可能已经完成这一步，应先检查，不能一概认为必须手动补代码。[ST：STM32F4 系统初始化源码](https://github.com/STMicroelectronics/cmsis-device-f4/blob/master/Source/Templates/system_stm32f4xx.c)

它不像普通外设那样只需打开一个 RCC 时钟。仅允许访问 FPU，但仍按软件浮点方式编译，程序也不会自动变快。

对于 STM32F407，GCC 的一组典型目标选项是：

```text
-mcpu=cortex-m4 -mthumb -mfpu=fpv4-sp-d16 -mfloat-abi=hard
```

这组参数针对上述芯片，其他型号应使用其对应配置。三个容易混淆的选项含义是：

| 浮点 ABI 选项 | 含义 |
| --- | --- |
| `soft` | 浮点运算通过软件库调用实现 |
| `softfp` | 允许生成硬件浮点指令，但使用软件浮点的函数传参约定 |
| `hard` | 允许生成硬件浮点指令，并使用相应的浮点寄存器传参约定 |

**softfp 不等于没有用 FPU。**使用 `hard` 时，还要保证链接的库与工程 ABI 兼容。ABI 可以理解为函数之间传参数、返回结果时共同遵守的规则。[GCC：ARM 编译选项](https://gcc.gnu.org/onlinedocs/gcc/ARM-Options.html)

## 5. 一个常见坑：变量是 float，表达式却用了 double

```c
float scale_bad(float x)
{
    return x * 0.1;    // 0.1 是 double，表达式按 double 运算
}

float scale_f32(float x)
{
    return x * 0.1f;   // 0.1f 是 float，表达式按 float 运算
}
```

第一种写法会在语言语义上把 `x` 转换成 `double`，计算后再把结果转换成 `float`。在只有单精度 FPU 的芯片上，这可能引入软件双精度运算与转换开销；最终生成什么代码还要看编译优化。

注意，单独写 `float x = 0.1;` 时，常量转换通常能在编译时完成，不应声称每次这样的初始化都会调用软件双精度运算。

标准数学函数也有类型区别：

```c
#include <math.h>

float calc(float x)
{
    return sinf(x) + sqrtf(x);
}
```

`sinf`、`sqrtf` 对应 `float`，`sin`、`sqrt` 对应 `double`。使用单精度数据时，应注意选对函数。

不过，**sinf 不意味着 CPU 有一条“求正弦”的 FPU 指令**。以这里讨论的 M4/M7 FPU 为例，平方根有相应硬件指令；正弦、余弦等通常仍由数学库算法实现，内部基础浮点运算可受益于 FPU。编译器是否直接把 `sqrtf` 变成硬件指令，还受工具链和数学语义设置影响。

## 6. 开启之后，效果明显吗？

关键在于程序的时间花在哪里。

| 工作负载 | 可以期待的效果 |
| --- | --- |
| 大量运行时浮点乘加、矩阵计算、滤波 | 相比软件浮点，计算部分可能明显加快 |
| 高频控制中的 PID、姿态解算 | 可能缩短计算时间，但需测量真实算法 |
| 偶尔做一次电压换算 | 单次运算可以变快，整体变化可能很小 |
| 主要等待串口、I²C、延时或外部器件 | FPU 对主要瓶颈通常帮助不大 |
| 只有单精度 FPU，却大量使用 double | 无法直接获得硬件双精度加速 |

不能给所有程序统一承诺“快十倍”或“一个周期完成”。ST 提供了用于比较软硬件浮点表现的演示工程，但其结果属于特定硬件、算法和工具链条件。[ST：X-CUBE-FPUDEMO](https://www.st.com/en/embedded-software/x-cube-fpudemo.html)

举一个纯假设的计算：若原程序耗时 100 μs，其中浮点计算占 80 μs，其他部分占 20 μs；浮点部分加快到原来的十分之一后，总时间为 `8 + 20 = 28 μs`，整体约快 3.6 倍。这说明计算部分的加速倍数，不等于整个程序的加速倍数。

实际验证可以分两步：

1. **确认用了什么指令。**在目标函数反汇编中检查 `VADD.F32`、`VMUL.F32` 等；`__aeabi_fmul`、`__aeabi_dmul` 等调用可作为检查软件浮点路径的线索。要看具体计算，不能仅凭程序里出现过一条 FPU 指令下结论。
2. **测量算法耗时。**固定主频、输入、优化等级和内存条件，用可用的 DWT 周期计数器或硬件定时器计时。使用运行时输入并保留结果，避免整个计算被编译器提前算完或删除，也不要把 `printf` 放进计时区间。

若比较 `soft` 和 `hard` 工程，应分别完整构建并链接兼容库。本文没有连接开发板实测，因此不提供虚构的周期数。

## 7. DSP 指令是什么？

DSP 是 Digital Signal Processing，即数字信号处理。STM32 参数中的“DSP 指令”，通常表示 CPU 指令集里包含适合信号处理的操作，**不代表芯片内另有一颗独立 DSP 处理器**。

以 Cortex-M4/M7 的经典 DSP 扩展为例，常见能力包括：

- **乘加：**对滤波和点积中反复出现的 `sum += a * b` 提供高效操作。
- **打包并行运算：**把多个较窄整数放入寄存器，一条指令处理多个数据通道。
- **饱和运算：**结果超出范围时限制到边界，适合某些音频和定点算法。

例如 `SMLAD` 把两个寄存器分别看作两个有符号 16 位数，概念上完成：

```text
result = accumulator + a0 × b0 + a1 × b1
```

它一次完成两组乘积并累加。CMSIS 提供 `__SMLAD` 等 intrinsic，允许在 C 中表达对应操作；`SMLAD` 本身不是饱和累加，算法仍需考虑溢出。[Arm：SIMD 指令 intrinsic 文档](https://arm-software.github.io/CMSIS_6/main/Core/group__intrinsic__SIMD__gr.html)

DSP 指令一般不需要像 FPU 那样设置 CPACR 开关；前提是内核支持，且编译目标、代码或库使用了这些指令。普通 C 循环也不保证自动变成最佳 DSP 指令序列。

## 8. FPU 和 DSP 指令有什么区别？

| 比较 | FPU | 经典 M4/M7 DSP 指令扩展 |
| --- | --- | --- |
| 主要作用 | 加速所支持的浮点运算 | 加速整数、定点乘加及打包运算等 |
| 常见数据 | `float`，以及硬件支持时的 `double` | 8/16/32 位整数，Q15、Q31 等定点格式 |
| 常见用途 | 浮点控制、矩阵、数值计算 | 定点滤波、音频、相关与点积 |
| 软件使用方式 | 编译器生成浮点指令 | 编译器、intrinsic 或优化库 |

“数字信号处理”这个领域本身既能用浮点，也能用定点；不能把 DSP 算法与某一类 DSP 指令画等号。一个浮点滤波算法可以主要依赖 FPU，而定点版本可能利用整数 DSP 指令。[ST：AN4841，使用 CMSIS 进行数字信号处理](https://www.st.com/resource/en/application_note/an4841-digital-signal-processing-for-stm32-microcontrollers-using-cmsis-stmicroelectronics.pdf)

## 9. 怎样最快用起来？

如果是浮点 PID 或电压计算，先确认芯片能力和 FPU 配置，检查常量的 `f` 后缀以及数学函数类型，然后测量关键函数。

如果是 FIR/IIR 滤波、FFT、矩阵或向量处理，可以先用 Arm 的 **CMSIS-DSP**。它提供相应算法及多种数据格式实现，具体优化路径取决于目标处理器、库版本和构建选项。[Arm：CMSIS-DSP 概览](https://arm-software.github.io/CMSIS-DSP/main/)

例如，工程已经正确集成 CMSIS-DSP 时，可以计算向量点积：

```c
#include "arm_math.h"

float32_t a[4] = {1.0f, 2.0f, 3.0f, 4.0f};
float32_t b[4] = {5.0f, 6.0f, 7.0f, 8.0f};
float32_t result;

void calculate_dot_product(void)
{
    arm_dot_prod_f32(a, b, 4, &result);
    // result = 1*5 + 2*6 + 3*7 + 4*8 = 70
}
```

`f32` 表示 32 位浮点版本。这个例子演示 API 用法，只有 4 个元素并不适合证明性能优势；调用开销也需要计入。仅包含 `arm_math.h` 不够，还需要编译或链接对应实现。[Arm：向量点积 API](https://arm-software.github.io/CMSIS-DSP/main/group__BasicDotProd.html)

实际选型时，可以先以满足精度要求的 `float` 实现算法，再测性能。精度不足时分析误差来源并考虑 `double`；确有吞吐量或存储压力时，再评估 Q15/Q31 定点实现。定点数通过约定缩放比例，用整数编码小数，需要额外管理量化、缩放和溢出，并非天然更快或更准确。
