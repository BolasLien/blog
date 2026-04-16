---
title: Javascript Array splice() 方法
date: '2021-05-27T18:06:58+08:00'
description: 介紹 JavaScript Array.splice() 方法，對陣列進行刪除或插入資料的操作方式與範例。
tags:
  - javascript
---

對陣列做`刪除`或`插入`資料。
* 會改變原始陣列的內容


## 怎麼寫?
```javascript Array.prototype.splice()
const fruit = ['apple','banana','coconut','durian','grape','kiwi']

// array.splice(start,n)
// 從第{start}開始，刪除{n}筆資料
fruit.splice(1,2)
console.log(fruit) // ['apple','durian','grape','kiwi']

// array.splice(start,0,item)
// 在{start}的位置插入{item}
fruit.splice(1,0,'cherry')
console.log(fruit) // ['apple','cherry','durian','grape','kiwi']

// array.splice(start,n,item)
// 從第{start}開始，刪除{n}筆資料，並在{start}的位置插入{item}
fruit.splice(1,2,'berry')
console.log(fruit) // ["apple", "berry", "grape", "kiwi"]
```

## 參考

[Array.prototype.splice() - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
