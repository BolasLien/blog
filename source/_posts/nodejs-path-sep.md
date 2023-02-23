---
title: nodejs 怎麼處理 Windows 及 Linux 的路徑
date: 2022-09-15 10:54:01
tags:
- nodejs
categories: 筆記
---

最近在逐步把開發環境移到本機上，原本在 Linux 運行好好的程式，到 Windows 上都出錯了

<!-- more -->

## 具體情況

假設原本在 Linux 上的路徑為 `C:/app/index.js`

在 Windows 的路徑就會變成 `C:\\app\\index.js`

google 後找到[這篇](https://zhuanlan.zhihu.com/p/115746564)解釋 Linux 與 Windows 作業系統的路徑斜線(/)、(\\)不同及解法

## node 如何兼容 Linux 與 Windows 的路徑？

主要會用到 node.js 的 [path.sep](https://nodejs.org/api/path.html#pathsep) 這個 api，它會針對不同的平台解析出該平台使用的斜線

在 Linux 的路徑斜線為 `/`
在 Windows 的路徑斜線為 `\`

為了要讓程式正常運行，我們希望把路徑統一為 `C:/app/index.js`
所以要把 Windows 的路徑轉換為 Linux 的路徑格式

```js
// node dependencies
const path = require('path')

// 假設 nodejs 在 windows 取到的路徑為 C:\\app\\index.js
let windowsPath = 'C:\\app\\index.js'

console.log(windowsPath.split(path.sep).join('/')) // C:/app/index.js
```

## 參考資料

[Path | Node.js v18.9.0 Documentation](https://nodejs.org/api/path.html#pathsep)

[Nodejs 小知识--- Linux 与 Windows 下路径分隔符问题](https://zhuanlan.zhihu.com/p/115746564)
