---
title: Vue元件溝通-子傳父($emit)
date: '2020-10-13T16:18:16+08:00'
description: 介紹 Vue.js 元件溝通中子傳父的 emit 機制，附完整程式碼範例說明使用方式。
tags:
  - vue
---
常常忘記子傳父($emit)的寫法，這裡筆記一下
子件的事件被觸發的時候要做事
把事件綁在template上`@click-child`
```javascript
/* 子元件 */
<div id="child">
  <span>子元件</span>
  <button @click="clickButton">Click!</button>
</div>

...
methods: {
  clickButton(){
    this.$emit('click-child')
  }
}

/* 父元件 */
<div id="parent">
  <span>父元件</span>
  <child @click-child="sayHi"></child>
</div>

...
methods: {
  sayHi(){
    alert('Hi~~')
  }
}

...
```

> $emit用 `kebab-case` 命名法比較好，原因是vue會把大小寫全部轉成小寫，可能會造成變數名稱有問題
