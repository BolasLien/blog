---
title: JavaScript 閉包 Closure
date: 2022-06-02 10:05:18
tags:
- javascript
categories: 筆記
---

當 function 執行完之後，會進行記憶體釋放，也就是說 function 內的變數就再也找不到了。
但如果希望留住 function 內的資料狀態，可以透過閉包的手法。

<!-- more -->

### 如何做出閉包?

- 宣告一個 function `functionA`
- `functionA` 裡面宣告要保留的資料 `count = 0`，接著回傳 `functionB`
- `functionB` 裡面做 `count = count + 1`，並回傳 `count`
- 宣告一個變數 `a`，把 `functionA()` 賦予值給這個變數 `a`

```javascript
function functionA() {
  var count = 0
  return function functionB() {
    count = count + 1
    return count
  }
}

var a = functionA()

console.log(a()) // 1
console.log(a()) // 2
console.log(a()) // 3
```

最後我們就得到了變數 `a`，`a` 的值是 `functionB(){ ... return count }`，所以 `a` 現在也是一個 function 了。
接著我們執行 `a()` 的時候，會得到 `functionB` 回傳的值；如果連續執行三次 `a()`，分別會得到 1、2、3。

執行結果居然不是 1、1、1，這是為什麼？

### 成為閉包的關鍵

將「`functionA` 執行的結果」賦予值給 `a`，此時 `a` 的值是 「`functionB` 這個函式」。因為 `functionB` 執行的時候會用到 `count`，造成「`functionA` 一直處在執行中，執行不完無法釋放」，所以 `count` 的狀態就被保留下來了。

> 由於「`functionA` 一直處在執行中，執行不完無法釋放」，讓 count 的資料狀態可以保留下來，也就意味著記憶體會一直被佔用。

### 實用的閉包

- 再宣告一個變數 `b`，把 `functionA()` 賦予值給這個變數 `b`

```javascript
// 前略
var b = functionA()

console.log(b()) // 1
console.log(b()) // 2
console.log(b()) // 3
```

跟先前宣告的變數 `a` 一樣，`b` 的值是 `functionB(){ ... return count }`，再連續執行三次 `b()`，分別會得到 1、2、3。

這裡會發現 `a` 跟 `b` 的雖然都是 `functionB(){ ... return count }`，但**執行的結果不會共享**。

這是因為宣告 a 跟 b 的時候，是「各自」指向`functionA` 執行的結果，所以資料狀態就獨立出來了。

> 以上程式碼用白話來說就是：
> a 跟 b 各自拿到了「同樣規格」的計數器
> a 按了三次，分別顯示 1、2、3
> b 按了三次，分別顯示 1、2、3

如此一來，更可以透過閉包的手法，來產出「同樣功能規格」的 function，給不同的對象使用。

## 最後來個範例情境

有一間熱炒 99 元的餐廳，每次計算金額的時候都會看每桌點了幾盤，由於熱炒店常常會有加點的情形，所以每次加點都還需要再次計算金額。

[Codepen](https://codepen.io/bolaslien/pen/qBxYVyP?editors=0012)

<iframe height="300" style="width: 100%;" scrolling="no" title="Closure" src="https://codepen.io/bolaslien/embed/qBxYVyP?default-tab=js%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/bolaslien/pen/qBxYVyP">
  Closure</a> by BolasLien (<a href="https://codepen.io/bolaslien">@bolaslien</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## 參考資料

[閉包 Closure - 函式以及 This 的運作 - 六角學院 js 核心篇](https://www.hexschool.com/courses/js-core.html)
[重新認識 JavaScript: Day 19 閉包 Closure](https://ithelp.ithome.com.tw/articles/10193009)
[JavaScript Scope Chain 與 Closure](https://bolaslien.github.io/blog/2021/08/26/js-scope-chain-and-closure/)
