---
title: 如何切換Node版本(windows10)
date: 2020-08-28 16:03:47
tags:
- node.js
categories: 筆記
---
1. 安裝nvm
[在此下載](https://github.com/coreybutler/nvm-windows)
建議安裝到`C:\`底下，因為有的Windows使用者名稱是中文的，可能會沒辦法正常運行
<!-- more -->
2. cmd指令
* 查詢可安裝的Node版本
```bash
$ nvm list available
```

* 安裝你要的版本號
```bash
$ nvm install <version>
```

* 查詢已經安裝的Node有哪些版本
```bash
$ nvm list
```

* 使用你要的Node版本號
```bash
$ nvm use <version>
```
3. enjoy~