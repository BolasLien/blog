---
title: JavaScript 變數作用域 Variable Scope
date: 2021-07-14 12:45:02
tags:
- javascript
categories: 筆記
---
## 變數的作用域（Scope）

作用域是指變數的有效範圍。

常聽到的**全域變數（global variable）**通常是指：**全域變數**是不在任何`function(){}`內的變數，換句話說，**全域變數**是在任何地方都可以用的變數。

跟**全域變數**相反，`function(){}`內的變數稱為**區域變數（local variable）**。

<!-- more -->

## 詞法作用域（Lexical Scope）

變數的作用域在程式碼寫完的當下就確定了。

用範例的執行過程來說，執行 `fnA()` 時，會先查找 function 內是否有 `a` 這個變數，沒有的話就向 `function fnA(){}`外查找（不是從執行 `fnA()` 的地方向外查找），所以`function fnA(){}` 向外找到的`a`印出來為 0。

所以，即使沒有呼叫`fnA()`，`function fnA(){}`裡面的`a`在寫完的當下就已經確定是 0 了。

```js
var a = 0;

function fnA(){
	console.log(a); // 0
}

function fnB(){
	var a = 1;
	fnA();
}

fnB();
```

## 函式作用域（Function Scope）

var 變數的作用域在 `function(){}` 內。

在`function(){}`內可以向`function(){}`外查找其它變數（詞法作用域）。但從`function(){}`外要找`function(){}`內的變數，則會因為變數的作用域只在`function(){}`內有效，所以會取不到。

```js
var b = 0;

function fn(){
	var a = 1;
	console.log(b); // 0
}

fn()
console.log(a) // a is not defined
```

# 區塊作用域（Block Scope）

let/const 變數的作用域在 `{}` 內。

`{}`、`function(){}`、`if{}`、`for(){}`這種大括號`{}`的地方，都算是區塊作用域。

var 與 let/const 的差別在於，`{}`外可以取到 var 的值，`{}`外不能取到 let/const 的值。

範例的`{}`可以執行，但只有區塊作用域的用途，無任何功能。

```js
{
	var a = 0;
}
console.log(a) // 0

{
	let b = 0;
}
console.log(b) // b is not defined
```

## 參考資料

[JavaScript Scope](https://www.w3schools.com/js/js_scope.asp)

[Scope（作用域） - 术语表 | MDN](https://developer.mozilla.org/zh-CN/docs/Glossary/Scope)

[區塊 - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Statements/block)

[JavaScript: Introduction to Scope (function scope, block scope)](https://dev.to/sandy8111112004/javascript-introduction-to-scope-function-scope-block-scope-d11)

[六角學院 JS 核心筆記 (三)【執行環境與作用域】- 語法作用域 (Lexical Scope)](https://jenifers001d.github.io/2020/06/20/JavaScript/hexschool-JS-core-3/)