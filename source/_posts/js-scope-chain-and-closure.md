---
title: JavaScript Scope Chain 與 Closure
date: 2021-08-26 17:39:17
tags:
- JavaScript
categories: 筆記
---
#### Scope 到底是指哪裡？
Scope 是變數的有效範圍。

`function 裡面`是 local，指的是在 local 這個範圍裡面有效。

`function 外面`是 global，指的是在 global 這個範圍裡面有效。

<!-- more -->

#### 所以 Scope chain 是指？

Scope chain 像是一張地圖。

Scope chain 生成在程式的創建階段，所以在執行之前就已經決定好 function 的作用域。換句話說，程式碼寫完就決定好作用域了。

如果使用了 function 外面宣告的變數，JavaScript 還是能依照 Scope chain 去 function 外面找到正確的變數來使用。如果外面還是找不到，就去外面的外面 ... 直到找到它，找不到的話就拋出錯誤。

#### 那 closure 呢？
要理解 closure 要先知道作用域是已經決定好的了。

我們知道在 function 裡面的變數對 function 外面的作用域是沒有意義的，它會在呼叫 function 的時候創建，function 執行完之後釋放掉。所以不管我們呼叫幾次，function 裡面的變數都會重新建立。

舉個例子，在 function 裡面宣告一個變數 count，每次呼叫`counter()`，`count` 的值都會從 `0` 開始。
```js
function counter(){
  let count = 0;
  count = count + 1
  return count
}

console.log(counter()) // 1
console.log(counter()) // 1
console.log(counter()) // 1
```

我們也知道 function 裡面可以使用 function 外面的變數，因為該變數的作用域是 global 了，它不會隨著 function 執行完之後被釋放掉。

試著把 count 移到 global。每次呼叫 `counter()` ， `count` 的值都會累加。
```js
let count = 0;
function counter(){
  count = count + 1
  return count
}

console.log(counter()) // 1
console.log(counter()) // 2
console.log(counter()) // 3
```
但如果不希望 count 的值暴露在 global，又希望 count 的值會累加，可以怎麼做？

用第一個例子，把 `return count` 的地方，用 `return function(){}` 包起來；再把 `counter()` 存成一個變數 `myCounter`。
```js
function counter(){
  let count = 0
  // 用 return function(){} 包起來
  return function(){
    count = count + 1
    return count
  }
}

// 再把 counter() 存成一個變數 myCounter
let myCounter = counter()

// 神奇的事情發生了
console.log(myCounter()); // 1
console.log(myCounter()); // 2
console.log(myCounter()); // 3
```
所以為什麼 count 可以累加了？
來看 `let myCounter = counter()` 這一行發生了什麼事。
1. 執行 `counter()`
2. `function counter()` 的作用域被產生了
3. 回傳 `function(){...}`
4. **存到了 myCounter**

正常來說 function 執行完就釋放了，但是把 `執行counter()` 存入 myCounter 變數，讓 function counter 沒有被釋放掉，而是被保留下來了。所以後續我們執行 myCounter 的時候，就會讓 count 累加。

這個現象就叫做 closure。

### 參考

[閉包](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Closures)
[重新介紹JavaScript](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/A_re-introduction_to_JavaScript#closures)
[function closures](https://www.w3schools.com/js/js_function_closures.asp)
[重新認識 JavaScript: Day 19 閉包 Closure](https://ithelp.ithome.com.tw/articles/10193009)
[所有的函式都是閉包：談 JS 中的作用域與 Closure](https://github.com/aszx87410/blog/issues/35)

