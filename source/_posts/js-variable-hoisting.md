---
title: JavaScript 變數提升 Variable Hoisting
date: 2021-07-13 12:35:22
tags:
- js
- javascript
- hoisting
- glossary
categories: 筆記
---
## 變數的提升（Hoisting）

在其他程式語言裡面，程式碼是**逐步執行**的，所以「把要做的事情放在宣告之前」，就會出錯。

但在 JavaScript 並不會出錯，因為**執行程式碼之前**，會先把宣告的函式或變數放到記憶體中，直到程式執行的時候，函式或變數就已經存在了。（感覺像是宣告的東西被**提升**到要做的事情之前，但實際不是）

要做的事情放在宣告之前，仍然可以繼續執行的現象叫做**提升（Hoisting）**。

<!-- more -->

```js
sayHello() // Hello!

function sayHello(){
  console.log("Hello!");
}
```

## var 的提升（Hoisting）

在宣告 var 變數之前取用值，會得到 `undefined` 。

要注意的是，變數只有**宣告**（宣告指的是`var a;`）會被提升，因為變數本身還沒有到執行階段，還沒有被**賦值**（賦值指的是`a=0;`），所以在宣告之前就取值，我們會得到 `undefined` 。

用範例的執行過程來說，JavaScript 在程式執行之前，先把 `a` 放到記憶體中，並給予值 `undefined`；在執行階段的時候，由於 `a` 這個變數還沒執行到 `a = 0` 就被取用了，所以取到的值是 `undefined` 。

```js
console.log(a) // undefined
var a = 0;
console.log(a) // 0
```

## let/const 的提升（Hoisting）

在宣告 let/const 變數之前取用值，會直接拋出 Error。

雖然宣告的變數在執行之前已經放到記憶體了，但 JavaScript 並不會把 let/const 的值定為`undefined`，而是暫時不讓你存取。

以結果來看，let/const 確實有 Hoisting 的效果，因為並不是找不到宣告的 let/const 變數，只是暫時不能被存取。這種「從宣告變數到初始化完成之前還不能存取」的限制，叫做暫時死區(TDZ - temporal dead zone)。

```js
console.log(a) // Cannot access 'a' before initialization
let a = 0;
console.log(a)
```

## 參考資料

[我知道你懂 hoisting，可是你了解到多深？](https://blog.techbridge.cc/2018/11/10/javascript-hoisting/)

[let - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Statements/let#emulating_private_members)

[var - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)

[Day22【ES6 小筆記】變數提升（Hoisting）與暫時死區（TDZ） - iT 邦幫忙::一起幫忙解決難題，拯救 IT 人的一天](https://ithelp.ithome.com.tw/articles/10219518)

[理解ES6中的暫時死區(TDZ) | Eddy 思考與學習](https://eddychang.me/es6-tdz/)

[提升（Hoisting） - 術語表 | MDN](https://developer.mozilla.org/zh-TW/docs/Glossary/Hoisting#%E4%BA%86%E8%A7%A3%E6%9B%B4%E5%A4%9A)