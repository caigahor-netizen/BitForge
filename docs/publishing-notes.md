# 发布 Obsidian 技术笔记到 BitForge

网站域名：`https://caigahor.com`。中文笔记位于 `/zh/notes/`。

## 每篇文章的流程

1. 从 Obsidian 仓库选取要发布的 `.md` 文件。当前 MCU 笔记在本机的 `C:\Users\c2334\Documents\obsidian\MCU\MCU`；`欢迎.md` 是 Obsidian 默认欢迎页，不发布。
2. 审核技术事实、适用芯片型号、代码示例和结论。优化标题与措辞，先让作者确认修改稿。不要直接覆盖 Obsidian 原文。
3. 将确认后的正文保存到 `src/content/zh/notes/<英文短名>.md`。文件名就是页面路径中的文章 ID。开头需要符合 `src/content.config.ts` 的 frontmatter：

   ```yaml
   ---
   title: 文章标题
   description: 一句话摘要
   category: 嵌入式
   pubDate: 2026-09-25
   ---
   ```

   修改已发布文章时，可增加 `updatedDate: YYYY-MM-DD`。正文无需再写一级标题，页面模板会显示 frontmatter 的 `title`。
4. 运行 `npm run build`。确认输出包含 `/zh/notes/<英文短名>/index.html`，并检查文章页、中文笔记列表和 `/zh/rss.xml`。若本地沙箱出现 `spawn EPERM`，需要在允许构建的环境中重跑；这是本地进程权限问题。
5. 只暂存本次发布相关文件，检查 `git diff --cached --check`，提交并推送到 `origin main`。不要顺手提交工作区里其他未跟踪文件。
6. Cloudflare 已连接 GitHub 仓库 `caigahor-netizen/BitForge`。推送后，在 **Workers 和 Pages → bitforge → 部署** 查看生产构建。当前构建命令为 `npm run build`，部署命令为 `npx wrangler deploy`，根目录为 `/`。本机无需登录 Wrangler 来触发这条自动流水线。
7. 等构建和部署都显示成功后，访问 `https://caigahor.com/zh/notes/<英文短名>/`，同时确认文章出现在 [中文笔记列表](https://caigahor.com/zh/notes/) 中。部署进行中时新路径可能暂时返回 404；先核对 Cloudflare 的构建状态，再判断是否发布失败。

## 本次发布记录（2026-09-25）

- 来源：`软件控制硬件的本质以GPIO输出为例.md`。
- 发布文章：[从一行 C 代码到引脚电平：以 STM32F1 的 GPIO 输出为例](https://caigahor.com/zh/notes/stm32f1-gpio-output/)。
- Git 提交：`211b352`（`feat: publish STM32F1 GPIO article`）。
- Cloudflare 生产构建 `#009f98ab` 成功，截图显示总耗时约 5 分 25 秒。文章地址随后返回 HTTP 200。
- 本次只有中文版；语言切换会返回英文笔记列表，不会指向不存在的英文文章。
