---
title: Javascript Array slice() 方法
date: 2021-05-27 18:06:58
tags:
- js
- javascript
- array
- 陣列操作
categories: 筆記
---

`拷貝`陣列的資料。
* 會回傳新的陣列，不會改變原始陣列。

<!-- more -->

## 怎麼寫?
```javascript Array.prototype.slice()
const fruit = ['apple','banana','coconut','durian','grape','kiwi']

// array.slice(start,end)
// 拷貝{start}到{end}之前的資料(不包含end)
const array1 = fruit.slice(0,3)
console.log(array1) // ["apple", "banana", "coconut"]

// array.slice(start)
// 拷貝{start}之後所有資料
const array2 = fruit.slice(2)
console.log(array2) // ["coconut", "durian", "grape", "kiwi"]

// array.slice(-n)
// 拷貝倒數{-n}個資料
const array3 = fruit.slice(-2)
console.log(array3) // ["grape", "kiwi"]
```
> 若`slice(n)`的`n`為`0`或是`undefined`，則會從0開始拷貝陣列。

## 參考
[Array.prototype.slice() - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)