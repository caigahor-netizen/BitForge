---
title: 用 systemd-networkd 配置静态 IP
description: 面向无头 Linux 的最小可复现网络配置
category: Linux
pubDate: 2025-07-30
---

## 最小示例

对于希望每次启动都固定在同一地址的无头机器：

```ini
# /etc/systemd/network/10-eth0.network
[Match]
Name=eth0

[Network]
Address=192.168.1.50/24
Gateway=192.168.1.1
DNS=1.1.1.1
```

然后执行 `networkctl reload`。声明式、可检查，而且能和系统其余配置一起放进同一个仓库做版本管理。

*占位笔记——更多网络相关文章待补充。*
