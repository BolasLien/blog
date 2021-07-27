---
title: CSS height 的單位有什麼差別？
date: 2021-07-08 15:03:59
tags:
  - css
categories: 筆記
---

要讓`height`可以有效果，`height`的設定必須是**絕對單位（px, rem...）**。例如：

```css
div {
  height: 300px;
}
```

<!-- more -->

但是**只是**設定`%`的話，會看起來沒效果，原因是`%`是一個**相對單位**（相對於父層的幾％）

```css
div {
  height: 30%;
}
```

也因為`%`不是一個絕對單位，所以如果父層沒有指定高度的話，就等於高度沒有設定，即是 0 的不管幾 %，都是 0 。

有一個例外是`<html>`是可以設定`%`的。當`<html>`設定`height`為 100% 的時候，代表`<html>`是視窗高度的 100% 。

```css
html {
  height: 100%;
}
```

所以如果要讓高度是「視窗高度的幾 % 」的話，就要先把父層都先定義好。

```html
<html>

<head>
  <style>
    html,
    body {
      height: 100%;
    }

    div {
      height: 30%;
    }
  </style>
</head>

<body>
  <div></div>
</body>

</html>
```

另外，有一個跟「視窗高度的幾 % 」一樣效果的**絕對單位**，不需設定父層的高度，直接這樣設定就好。

```html
<html>

<head>
  <style>
    div {
      height: 30vh;
    }
  </style>
</head>

<body>
  <div></div>
</body>

</html>
```
