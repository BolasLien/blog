---
title: '[HTML]把header做成template'
date: '2020-11-02T12:10:14+08:00'
description: 介紹如何用 HTML template 標籤製作可重用的 header 元件，告別每個頁面重複複製貼上的困擾。
tags:
  - html
---

最近在做純靜態的網站，沒有引入Vue或其他的框架，每一次新的頁面的`<header>`都從第一頁複製，在新的頁面貼上，一旦內容要做變更，我就必須再次複製貼上...

覺得這樣的方式實在太蠢了！

後來想到可以用JS的方式放入HTML，只要在不同的頁面抓到標籤是`id=header`就好了。(同理，footer也可以這樣做)
```html
<body>
  <header id="header"></header>
    <div>
    你好這是首頁
    </div>
  <footer id="footer"></footer>
  <script src="script.js"></script>
</body>
```

```html
<body>
  <header id="header"></header>
    <div>
    你好這是使用者頁
    </div>
  <footer id="footer"></footer>
  <script src="script.js"></script>
</body>
```

```js
/* header的樣板 */
let header = `<div class="nav">
    <div class="nav-item">
        <a href="index.html">首頁</a>
    </div>
    <div class="nav-item">
        <a href="index.html">使用者頁</a>
    </div>
</div>`

document.getElementById('header').innerHTML = header

// 同理，footer也可以這樣做
```

參考：
[模板字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/template_strings)
