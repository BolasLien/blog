---
title: webpack 打包速度救星 esbuild-loader
date: 2022-10-26 21:30:11
tags:
  - webpack
categories:
  - 前端工程
---

最近在優化公司專案用的 webpack，查資料查到[這篇文章](https://blog.logrocket.com/webpack-or-esbuild-why-not-both/)，

一看到 webpack 可以使用 esbuild 來提升速度，很興奮地跳下去實驗了

<!-- more -->

## 關於我遇到的問題

今年微軟終於不再支援 IE，公司方面也跟進不支援 IE 瀏覽器。

以目前公司的專案為例：

原本開發模式的編譯速度為 4 分多鐘，生產模式因為還有程式碼壓縮及其他設定的關係，則需要花更多的時間才能編譯完。

於是我嘗試調整 webpack 設定，主要都在針對 babel-loader 的設定在做測試，但即使不再相容 IE 了，開發模式的編譯速度也只少了 1 分鐘。

總覺得只進步 1 分鐘的成果仍然不是很好...

另外也一邊研究別的打包工具，如果可以調整專案架構的話，或許有機會使用 `vite`，但那又是更大的工...

直到我遇到了 esbuild-loader

### 實測數據

以下是透過調整 `webpack.config.js` 得出來的數據。

| 差異項目 | babel-loader    | esbuild-loader  | 成果                 |
| -------- | --------------- | --------------- | -------------------- |
| 花費時間 | 4 mins, 13 secs | 1 mins, 26 secs | 省下 2 mins, 47 secs |
| 檔案大小 | 100%            | 67%             | 瘦身 33 %            |

## 快速開始

取代 babel-loader 來提升打包速度的救星：[esbuild-loader](https://github.com/privatenumber/esbuild-loader)

> 使用 esbuild-loader 取代 babel-loader 的條件：支援 ES6

#### 1. 安裝

```bash
npm i -D esbuild-loader
```

#### 2. 把 babel-loader 設定改為 esbuild-loader 設定

```javascript
// webpack.config.js
  module.exports = {
    module: {
      rules: [
-       {
-         test: /\.js$/,
-         use: 'babel-loader',
-       },
+       {
+         test: /\.js$/,
+         loader: 'esbuild-loader',
+         options: {
+           loader: 'jsx',  // Remove this if you're not using JSX
+           target: 'es2015'  // Syntax to compile to (see options below for possible values)
+         }
+       },

        ...
      ],
    },
  }

```

#### 3. 開始體驗 🎉

使用平常啟動 webpack 的指令，例如 `npm run dev`，來體驗更快的打包速度吧！

## 問題集

### esbuild-loader 為什麼快？

esbuild-loader 調用 esbuild 的 transform api 來轉譯。

大多數前端工具是用 js 實作的，運作的時候需要先解析後才能讓機器執行。
而 esbuild 是用 go 寫的，可以直接在編譯階段就讓機器執行了，所以比起 js，少了一段需要解析程式的工作。另外 go 擁有多線程的優勢，盡可能調用 cpu 的性能，而不像 js 是單線程的語言。

> 詳細可參考資料 [Esbuild 为什么那么快](https://zhuanlan.zhihu.com/p/379164359)

### 若使用到 ES2015 以上的 api，程式會異常嗎？

以`?.`這個語法為例，實測轉譯如下，程式可以正常執行

```javascript
// 原始碼
let foodApple = desk.food?.apple

// 編譯後
let foodApple = (_a = desk.food) == null ? void 0 : _a.apple
```

## 結論

esbuild-loader 可以取代 babel-loader 進行 js 轉譯，打包速度提升一倍，並且縮小檔案大小。缺點是只支援 ES6 以上的語法。

實際使用後打包速度雖然沒有快到飛起來，但也是我目前用過超快的 webpack 打包速度了。

這樣看下來 webpack 又可以再戰三年、五年了吧。
