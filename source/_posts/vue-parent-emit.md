---
title: Vue元件溝通-觸發父元件的事件(parent.$emit)
date: 2021-02-18 11:53:15
tags:
- vue
categories:
- [筆記, vue]
---
經由子元件來觸發父件的事件
把事件綁在父元件裡`this.$on('say-hi')`
子元件呼叫這個事件的時候要寫成`this.$parent.$emit('say-hi')`
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
    this.$parent.$emit('say-hi')
  }
}

/* 父元件 */
<div id="parent">
  <span>父元件</span>
  <child></child>
</div>

...
mounted(){
  this.$on('say-hi', this.sayHi)
},
methods: {
  sayHi(){
    alert('Hi~~')
  }
}

...
```

## 寫法上的差別
我寫了一個[codepen](https://codepen.io/bolaslien/pen/zYoxLJg)，可以觀察`觸發子元件的事件`與`觸發父元件的事件`這兩個差別

### 參考資料
https://stackoverflow.com/questions/45144483/difference-between-this-parent-emit-and-this-emit
