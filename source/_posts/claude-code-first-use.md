---
title: 從觀望 Claude Code 到一頭栽進去 - EP1｜第一次就爆 token？
date: 2025-08-02 14:27:12
tags:
  - Claude Code
  - Claude
  - AI Coding
  - AI 開發工具
  - 開發心得
categories: claude code
---

> 📌 本文為系列文「從觀望 Claude Code 到一頭栽進去」的第一篇。
> 系列將分享我從觀望到愛不釋手的 Claude Code 使用心得，包括省 token、優化流程、寫 MR、產出技術文件與工具比較。
> 👉 [完整系列文章列表請點這裡](/blog/categories/claude-code/)


原本買了保哥的課程：[AI 程式設計代理人開發全攻略：從入門到實戰](https://learn.duotify.com/courses/openai-codex-cli/refer/IQBSEO43)，跟完課程的 Claude Code 直播後，我其實還是有點猶豫要不要再多花一筆錢訂閱 Claude Pro。不過觀察到身邊的免費仔們紛紛開始課金，我就想：「嗯，好吧，那我也刷看看一個月 20 鎂的訂閱費。」

<!-- more -->

結果第一次用 Claude Code，我 1.5 小時就把 token 燒光，真的太快太猛了。

後來回去翻保哥課程的 Discord 和 Line 群的討論，才懂了要**避免在同一個 Session 裡做太多不相關的事**，不然上下文會越疊越厚，不只 token 爆掉，結果也會不太好。因為這樣我養成**事情做完就`/clear`** 的習慣。

但實際開發還是會遇到一些使用上的小障礙。有時跟還沒講完需求，Claude Code 就會直接生成 Todo 開始改 Code，這時候只能趕快**用 ESC 打斷他**，再跟他補充說明。

後來回看直播，才發現保哥其實有教過可以用 **Shift + Tab 切 Plan Mode** 先討論，再搭配以前常用 Github Copilot 時的開發技巧：**先確認對方有沒有理解我的需求，確定 OK 才開始寫程式**，透過這樣的方式就可以大幅提升 Claude Code 的準確率跟產出品質了。

用了幾天後我發現，這個錢真的花得很值得。我不只省下了時間，同時也從 Claude Code 的來回討論中學到很多東西。跟半年前用 Github Copilot 的開發體驗比起來，爽度又更上一層樓了。

我從「觀望 Claude Code」變成「沒有 Claude Code 就不太想寫程式」了。

在寫這篇文章的時候，覺得還有很多使用 Claude Code 的方式可以分享，預計把這篇文章當作系列文的第一篇，下次會想分享我是怎麼用 Claude Code 優化我的開發流程。

> **推薦課程｜AI 程式設計代理人開發全攻略：從入門到實戰**
> 保哥把 Claude Code、OpenAI Codex Cli、Gemini CLI 的應用都講得很清楚，像這篇提到的 `/clear`、切換 Plan Mode、用 ESC 打斷 Claude Code，在直播裡都有實際展示用法。
> 👉 如果你有興趣可以透過 [這個推薦連結](https://learn.duotify.com/courses/openai-codex-cli/refer/IQBSEO43) 註冊課程，還可以延長**一個月的觀看時間**。
