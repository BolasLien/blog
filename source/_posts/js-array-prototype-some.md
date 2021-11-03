---
title: Javascript Array some() 方法
date: 2021-05-28 16:47:07
tags:
- javascript
categories: 筆記
---

針對陣列中的每個元素，執行callback，當`至少一個`元素符合條件，就回傳`true`，否則回傳`false`

<!-- more -->

#### 怎麼寫?
```javascript Array.prototype.some()
const number = [18, 20, 65, 88, 131, 168]

// 判斷{array}是否至少有一個{element}符合{condition}

// 1. 把callback寫成function來使用
// array.some(callback)
function callback(element) {
  return element === 65
}
const boolean1 = number.some(callback)
console.log(boolean1) // true

// 2. 把callback寫在括號內
// array.some(function(element){ return condition })
const boolean2 = number.some(function(element){
  return element < 20
})
console.log(boolean2) // true

// 3. 把callback寫成箭頭函式
// array.some(element => condition)
const boolean3 = number.some(element => element > 200)
console.log(boolean3) // false
```

## 參考
[Array.prototype.some() - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
