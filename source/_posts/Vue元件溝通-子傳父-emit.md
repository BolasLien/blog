---
title: Vue元件溝通-子傳父($emit)
date: 2020-10-13 16:18:16
tags:
- vue
categories:
- [筆記, vue]
---
常常忘記子傳父($emit)的寫法，這裡筆記一下
子件的事件被觸發的時候要做事
把事件綁在template上`@click-child`
<!-- more -->
```javascript=
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
