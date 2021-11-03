---
title: JavaScript 陣列排序 sort
date: 2021-10-25 18:00:00
tags:
- javascript
categories: 筆記
---

## 預設排序

`array.sort()`是以**字串的 Unicode 編碼位置**來排序陣列中的元素。

```javascript=
let fruit = ['Orange', 'Banana', 'Apple', 'Cherry']
fruit.sort()
console.log(fruit); // [ 'Apple', 'Banana', 'Cherry', 'Orange' ]
```

## 自訂義排序

若用`sort()`來排序「數字」，我們也會得到「照字母排序」的結果。

<!-- more -->

下面的執行結果為`100`排在`25`之前，因為以字母順序來看，`1`是排在`2`之前。

```javascript=
let numbers = [ 25, 3, 100, 67, 45, 7]
numbers.sort()
console.log(numbers); // [ 100, 25, 3, 45, 67, 7 ]
```

### 要如何使用自訂義排序？

在`sort()`帶入`比較方法`，而`比較方法`需要**自己定義**。

原則上：

1. `比較方法`應**傳入兩個參數，用來做比較**。
2. `比較方法`應**回傳正、負值，或是 0，用來決定排序**。

以下面的程式碼為例：

- 如果`compare(a, b)`回傳 **正的值(大於 0)**，就把 a 排在 b **後面**。
- 如果`compare(a, b)`回傳 **負的值(小於 0)**，就把 a 排在 b **前面**。
- 如果`compare(a, b)`回傳 **0**，就不動順序。

```javascript=
let numbers = [ 25, 3, 100, 67, 45, 7]

function compare(a, b) {
  if(a > b) {
    return 1 // 如果 a 大於 b ，就把 a 排在 b 後面
  }

  if (a < b) {
    return -1 // 如果 a 大於 b ，就把 a 排在 b 前面
  }

  return 0 // a = b ，就不動
}

// 把 compare function 傳進去 numbers.sort()
numbers.sort(compare)

console.log(numbers); // [ 3, 7, 25, 45, 67, 100 ]
```

## 簡單應用自訂排序

### 數字由小到大排序

- 當回傳`a - b`是 `4 - 3 = 1`，等於**回傳大於 0**的數字，代表 4 要排在 3 後面。
- 當回傳`a - b`是 `2 - 4 = -2`，等於**回傳小於 0**的數字，代表 2 要排在 4 前面。
- 當回傳`a - b`是 `100 - 100 = 0`，等於**回傳 0**，代表 100 跟 100 不動。

```javascript=
let numbers = [ 2, 4, 3, 100, 1, 100]

function compare(a, b) {
  return a - b
}

// 把 compare function 傳進去 numbers.sort()
numbers.sort(compare)

console.log(numbers); // [ 1, 2, 3, 4, 100, 100 ]
```

### 依照物件的值排序

- `compareName(a, b)` 與 `compareAge(a, b)` 傳入的 a 跟 b，代表 `person` 陣列中的物件
- `compareName(a, b)`比較姓名的方法
  - `a.name` 跟 `b.name`，代表從物件中取出 name 的值
  - 若比較的方法是拿字串進行比較，會根據**第一個不同字元的 ASCII 編碼**進行大小比較。例如： `Banana` 與 `Berry` 比較，第一個位元都是 `B`，就會從第二個位元 `a` 跟 `e` 開始比較。
- `compareAge(a, b)` 比較年齡的方法
  - `a.age` 跟 `b.age`，代表從物件中取出 age 的值

```javascript=
let person = [
  { name : 'Aidan Jackson', age: 75 , phone: '576-7883'},
  { name : 'Mia Abraham', age: 26 , phone: '913-9939'},
  { name : 'Harry King', age: 50 , phone: '173-8232'},
  { name : 'Dean Burton', age: 50 , phone: '394-4192'},
]

// 比較姓名的方法
function compareName(a, b){
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

// 比較年齡的方法
function compareAge(a, b){
  return a.age - b.age
}

// 照姓名排序
let personSortByName = person.sort(compareName)
console.log(personSortByName);

// 照年齡排序
let personSortByAge = person.sort(compareAge)
console.log(personSortByAge);
```

> 小測驗
> 也可以用上述的例子，來做出「照電話號碼排序」的方法喔~

## 參考資料

[JavaScript 数组排序](https://www.w3school.com.cn/js/js_array_sort.asp)
[Array.prototype.sort() - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
