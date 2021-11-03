---
title: Javascript Array find() 方法
date: 2021-05-28 16:47:07
tags:
- javascript
categories: 筆記
---

針對陣列中的每個元素，執行callback，回傳`一個`符合條件的元素的`值`，否則回傳`undefined`

<!-- more -->

## 怎麼寫?
```javascript Array.prototype.find()
const employee = [
  {name:'Amy',department:'AD', phone:1000},
  {name:'Betty',department:'IT', phone:1200},
  {name:'Mary',department:'PM', phone:1300},
  {name:'Susan',department:'MIS', phone:1400},
  {name:'Bill',department:'MIS', phone:1405},
]

// 從{array}找符合{condition}的{element}的值

// 1. 把callback寫成function來使用
// array.find(callback)
function callback(element) {
  return element.phone === 1200
}
const value1 = employee.find(callback)
console.log(value1) // {name: "Betty", department: "IT", phone: 1200}

// 2. 把callback寫在括號內
// array.find(function(element){ return condition })
const value2 = employee.find(function(element){
  return element.department === 'MIS'
})
console.log(value2) // {name: "Susan", department: "MIS", phone: 1400}

// 3. 把callback寫成箭頭函式
// array.find(element => condition)
const value3 = employee.find(element => element.name === 'Bill')
console.log(value3) // {name: "Bill", department: "MIS", phone: 1405}
```

## 參考
[Array.prototype.find() - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
