---
title: JavaScript 實作點擊按鈕複製文字功能
date: 2022-03-02 13:51:20
tags:
  - javascript
  - ios
  - clipboard
categories: 前端技術
---

讓使用者可以「點擊按鈕後複製文字」的功能，經常作為分享給好友、優惠碼等活動頁需求上。

本文主要以 [Clipboard API](https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard_API) 來實現，但**IE 並不支援這個 API**，另外也**需要針對 iOS 進行特別處理**。

<!-- more -->

## Clipboard API 介紹

複製文字會用`寫入剪貼簿`的 api，寫法如下:

```javascript
navigator.clipboard.writeText(newClipText)
```

這個函式會回傳一個 promise，可以用`.then`跟`.catch`來定義複製成功及複製失敗要做的事情。

### IE 要怎麼辦?

因為 IE 並不支援`navigator.clipboard`，可以用另外一個寫法來實現:

```javascript
window.clipboardData.setData("Text", newClipText);
```

雖然這個方法全部的瀏覽器都有能使用，但由於它是實驗中的 API，未來有可能會修訂，建議只用來處理 IE。

### 針對 iOS 進行特別處理

iOS 上的瀏覽器不能直接操作剪貼簿，但如果：

##### iOS 版本 >=10

- 可以複製`<input>`、`<textarea>`元素的文字
- 元素內容可以編輯，並且元素沒有 `readonly` 屬性
- 必須在選取的狀態下才能複製

##### iOS 版本 <10

- 沒辦法透過 js 來作到操作剪貼簿的功能，只能讓使用者用手勢來達成「複製文字」的功能。

[詳細可參考這個討論串](https://stackoverflow.com/questions/34045777/copy-to-clipboard-using-javascript-in-ios/34046084#34046084)

## 範例程式碼

完整的程式碼如下：

```html
<input id="copyText" type="text" value="https://www.google.com/">
<button onclick="copyHandler()">點擊複製</button>
```

```javascript
function copyHandler() {
  let shareUrlElement = document.getElementById("copyText");
  shareUrlElement.select();
  shareUrlElement.setSelectionRange(0, 99999);
  let copyUrl = shareUrlElement.value;

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(copyUrl)
      .then((res) => {
        console.log("複製連結成功");
      })
      .catch((rej) => {
        console.log("無法複製連結");
      });
  } else {
    // for IE
    window.clipboardData.setData("Text", copyUrl);
  }
}
```

## 參考資料

[How To Copy to Clipboard](https://www.w3schools.com/howto/howto_js_copy_clipboard.asp)
[如何用 Javascript 複製文字﹍跨瀏覽器相容 iOS＠WFU BLOG](https://www.wfublog.com/2019/02/js-copy-text-ios.html)
[Copy to clipboard using Javascript in iOS - Stack Overflow](https://stackoverflow.com/questions/34045777/copy-to-clipboard-using-javascript-in-ios/34046084#34046084)
[Clipboard API - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard_API)
[ClipboardEvent.clipboardData - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/ClipboardEvent/clipboardData)
