---
title: Javascript Array findIndex() 方法
date: 2021-05-28 16:47:07
tags:
- javascript
categories: 筆記
---

針對陣列中的每個元素，執行callback，回傳`一個`符合條件的元素的`索引值`，否則回傳`-1`

<!-- more -->

## 怎麼寫?
```javascript Array.prototype.findIndex()
const employee = [
  {name:'Amy',department:'AD', phone:1000},
  {name:'Betty',department:'IT', phone:1200},
  {name:'Mary',department:'PM', phone:1300},
  {name:'Susan',department:'MIS', phone:1400},
  {name:'Bill',department:'MIS', phone:1405},
]

// 從{array}找符合{condition}的{element}的索引值

// 1. 把callback寫成function來使用
// array.findIndex(callback)
function callback(element){
  return element.phone === 1200
}

const index1 = employee.findIndex(callback)
console.log(index1) // 1

// 2. 把callback寫在括號內
// array.findIndex(function(element){ return condition })
const index2 = employee.findIndex(function(element){
  return element.department === 'MIS'
})
console.log(index2) // 3

// 3. 把callback寫成箭頭函式
// array.findIndex(element => condition)
const index3 = employee.findIndex(element => element.name === 'Bill')
console.log(index3) // 4
```

## 參考
[Array.prototype.findIndex() - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
