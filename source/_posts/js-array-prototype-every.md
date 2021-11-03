---
title: Javascript Array every() 方法
date: 2021-05-28 16:47:07
tags:
- javascript
categories: 筆記
---

針對陣列中的每個元素，執行callback，當`全部`元素都符合條件，就回傳`true`，否則回傳`false`

<!-- more -->

## 怎麼寫?
```javascript Array.prototype.every()
const number = [18, 20, 65, 88, 131, 168]

// 判斷{array}是否全部的{element}符合{condition}

// 1. 把callback寫成function來使用
// array.some(callback)
function callback(element) {
  return element === 18
}
const boolean1 = number.every(callback)
console.log(boolean1) // false

// 2. 把callback寫在括號內
// array.some(function(element){ return condition })
const boolean2 = number.every(function(element){
  return element <= 10
})
console.log(boolean2) // false

// 3. 把callback寫成箭頭函式
// array.some(element => condition)
const boolean3 = number.every(element => element < 200)
console.log(boolean3) // true
```

## 參考

[Array.prototype.every() - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/every)

