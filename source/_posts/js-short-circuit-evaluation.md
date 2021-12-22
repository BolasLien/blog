---
title: JS 用邏輯判斷 ||(OR) 及 &&(AND) 來改寫 if (短路求值 Short-circuit evaluation)
date: 2021-06-18 16:13:53
tags:
- javascript
categories:
- [筆記, javascript]
---

先講結論：`||`、 `&&` 可以幫助程式碼變得更短。
* 用 `||`、 `&&` 來改寫if
* 用 `||` 來設定變數的預設值
* 用 `&&` 來檢查物件屬性是否存在

<!-- more -->

## ||(OR) 及 &&(AND) 介紹

`||`(OR) 在判斷多個條件中，只要一個為`true`時，就會回傳`true`。
```javascript
let a = 2
let b = 4

console.log(a > 1 || b > 2) // true
console.log(a > 3 || b > 2) // true
console.log(a > 1 || b > 5) // true
console.log(a > 3 || b > 5) // false
```

`&&`(AND) 在判斷多個條件中，必須全部為`true`時，才會回傳 `true`。
```javascript
let a = 2
let b = 4

console.log(a > 1 && b > 2) // true
console.log(a > 3 && b > 2) // false
console.log(a > 1 && b > 5) // false
console.log(a > 3 && b > 5) // false
```

然而我們可以用OR、AND去處理非Boolean的物件。在Javascript中，非Boolean的物件是可以被判斷為`真值(truthy)`，但除了幾個物件是有被定義為`假值(falsy)`：
* `null`
* `NaN`
* `0`
* `空字串 ("" 或 '' 或 ``)`
* `undefined`


在if裡面，`真值(truthy)可以轉換為true，假值(falsy)可以轉換為false`來進行OR或AND判斷。

舉例來說，我們可以判斷宣告的變數裡面有沒有值。
```javascript
let a = null // falsy
let b = '12345' // truthy

if(a || b) {
  console.log('其中一個有東西!!') // 其中一個有東西!!
}
```

但不在if裡面，直接印出來的話會發生甚麼事情?
```javascript
let a = null // falsy
let b = '12345' // truthy

console.log(a || b) // 12345
```

為何這個例子印出了`12345`，而不是`true`？因為OR、AND可以處理非Boolean的物件，所以稍微修改一下一開始的解釋：
* `||`(OR) 在判斷多個條件中，只要一個為 ~~`true`~~ `真值(truthy)` 時，就會回傳 ~~`true`~~ `該物件`。
* `&&`(AND) 在判斷多個條件中，必須全部為 ~~`true`~~ `真值(truthy)` 時，才會回傳 ~~`true`~~ `該物件`。

## 短路求值 Short-circuit evaluation

短路求值在維基百科的解釋：
> 只有當第一個運算數的值無法確定邏輯運算的結果時，才對第二個運算數進行求值。例如，當AND的第一個運算數的值為false時，其結果必定為false；當OR的第一個運算數為true時，最後結果必定為true，在這種情況下，就不需要知道第二個運算數的具體值。

在MDN的解釋：
> The logical AND expression is evaluated left to right, it is tested for possible "short-circuit" evaluation using the following rule:
>
> ` (some falsy expression) && expr ` is short-circuit evaluated to the falsy expression;
>
> Short circuit means that the expr part above is not evaluated,

> The logical OR expression is evaluated left to right, it is tested for possible "short-circuit" evaluation using the following rule:
>
> ` (some truthy expression) || expr ` is short-circuit evaluated to the truthy expression.
>
> Short circuit means that the expr part above is not evaluated,

大概翻譯：
* AND 表達式是從左計算到右，在短路求值的計算中，如果左邊的表達式計算出來是 `假值(falsy)` ，那右邊的表達式就不會計算(執行)。
* OR 表達式是從左計算到右，在短路求值的計算中，如果左邊的表達式計算出來是 `真值(truthy)` ，那右邊的表達式就不會計算(執行)。

依照這樣的邏輯，我們就可以用來改寫if，或是更進階的應用。

### 額外補充

AND跟OR的優先順序是AND優先，如果混著用的話就會先做AND

```javascript from MDN
true || false && false      // returns true, because && is executed first
(true || false) && false    // returns false, because operator precedence cannot apply
```

## 短路求值應用

如果data沒有資料的時候，要印出「沒有data」的訊息。
```javascript
let data = null

// if的寫法
if (!data) {
  console.log('沒有data') // 沒有data
}

// || 的寫法
data || console.log('沒有data') // 沒有data
```

如果data有資料的時候，要把資料印出來。
```javascript
let data = '12345'

// if的寫法
if(data) {
  console.log(data) // 12345
}

// &&的寫法
data && console.log(data) // 12345
```

不知道data有沒有值，沒有的話就給預設值。
```javascript
function getData(data) {
  data = data || { bar: 456}

  console.log(data)
}

getData() // {bar: 456}
getData({ foo: 123 }) // {foo: 123}
```

如果person有job的屬性，就要印出person的job。
```javascript
const person1 = {
  name: 'Amy',
  age: '38',
  job: 'teacher'
}

const person2 = {
  name: 'Betty',
  age: '18',
}

function getPersonJob(person) {
  person.job && console.log(`${person.name} 的工作是 ${person.job}`)
}

getPersonJob(person1) // Amy 的工作是 teacher
getPersonJob(person2)
```

## 延伸閱讀

[Logical AND (&&) - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND)
[Logical OR (||) - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR)
[短路求值](https://zh.wikipedia.org/wiki/%E7%9F%AD%E8%B7%AF%E6%B1%82%E5%80%BC)
[JavaScript基本功修練：Day9 - 短路求值與條件運算子的應用](https://ithelp.ithome.com.tw/articles/10243261)
[JavaScript: What is short-circuit evaluation? | by Brandon Morelli | codeburst](https://codeburst.io/javascript-what-is-short-circuit-evaluation-ff22b2f5608c)
[JS 中 if / if...else...替换方式](https://segmentfault.com/a/1190000015809529)

