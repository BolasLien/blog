---
title: '[HTML]把header做成template'
date: 2020-11-02 12:10:14
tags:
- HTML
categories: 筆記
---

最近在做純靜態的網站，沒有引入Vue或其他的框架，每一次新的頁面的`<header>`都從第一頁複製，在新的頁面貼上，一旦內容要做變更，我就必須再次複製貼上...

覺得這樣的方式實在太蠢了！

後來想到可以用JS的方式放入HTML，只要在不同的頁面抓到標籤是`id=header`就好了。(同理，footer也可以這樣做)
<!-- more -->
{% codeblock index.html lang:html %}
<body>
  <header id="header"></header>
    <div>
    你好這是首頁
    </div>
  <footer id="footer"></footer>
  <script src="script.js"></script>
</body>
{% endcodeblock %}

{% codeblock user.html lang:html %}
<body>
  <header id="header"></header>
    <div>
    你好這是使用者頁
    </div>
  <footer id="footer"></footer>
  <script src="script.js"></script>
</body>
{% endcodeblock %}

{% codeblock script.js lang:js %}
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
{% endcodeblock %}

參考：
[模板字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/template_strings)