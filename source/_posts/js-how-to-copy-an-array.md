---
title: JavaScript 如何複製陣列？
date: 2021-09-01 17:29:22
tags:
- javascript
- js
- object
- array
categories:
---
做陣列資料裡的時候，有時候不希望異動到原始的資料，所以會將資料複製一份來用。

但問題是，在 JavaScript ，如果直接把陣列賦值給新的變數來用，一樣會改到原本的資料。

<!-- more -->
舉個例子，宣告一個變數 `copy`，並且把已存在的陣列 `fruit` 賦值給 `copy`，並且在 `copy` 新增一筆資料。
```js
let fruit = ["apple","banana"];
let copy = fruit;

copy.push("cherry")
console.log(fruit); // ["apple", "banana", "cherry"]
console.log(copy); // ["apple", "banana", "cherry"]
```

會發現原本的陣列 `fruit` 也多出了一筆資料。

這是因為 JavaScript 裡面，只要變數存的資料類型是物件，那這個變數就是指向物件的記憶體位置，而不是值。

另外，即使資料是 Array ，但對 JavaScript 來說 Array 也是物件，所以 `copy`、`fruit` 都指向了同一個記憶體位置，所以改動了 `copy` 等於改動 `fruit`。

```js
let fruit = ["apple","banana"];

console.log(typeof fruit) // object
```

## 複製陣列的方法
- `Array.from()` 這個方法會建立一個新陣列。
-  展開運算子 `...` 這個寫法是把物件展開，做成陣列的話，用`[]`包起來。

```js
let fruit = ["apple","banana"];
let copy1 = Array.from(fruit);
let copy2 = [ ...fruit ];

copy1.push("cherry")
copy2.push("coconut")
console.log(fruit); // ["apple", "banana"]
console.log(copy1); // ["apple", "banana", "cherry"]
console.log(copy2); // ["apple", "banana", "coconut"]
```