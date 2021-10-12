---
title: JavaScript 變數 Variables var let const
date: 2021-08-04 21:43:35
tags:
  - js
  - javascript
  - variable
categories: 筆記
---
### 定義

**變數**是用來儲存**值**的一個容器。

舉個例子，用 JavaScript 來表示蘋果價格為 25 元

<!-- more -->

```js
var applePrice = 25
```

### 變數的命名規則

- 變數必須是唯一的名稱。`例如 applePrice 代表的是蘋果價格，它就不會同時是是香蕉價格或鳳梨價格。`
- 可以很簡短。`例如 x 或 y`；或是很具體的描述。`例如 applePrice`
- 開頭第一個字必須是大小寫字母（letter）、底線（\_）、錢符號（$），其餘可以包含大小寫字母、數字（0-9）、底線、錢符號。`例如 isOpen 或 $price 與 _pchome24H`
- **區分大小寫（case secsitive）。**`例如 A 和 a 是不同的變數`
- **保留字**不能當作變數名稱，`例如 null 或 const`

### 變數宣告

在 JavaScript 中有三種宣告的方式：

- `var` 宣告可改變值的變數，作用域在`function(){}內`，如果不在任何`function(){}內`宣告 var 變數，這個變數就會變成全域物件的屬性，或稱**全域變數**。
- `let` 宣告可改變值的區域變數，或稱**區塊變數**，作用域在`{}內`。
- `const` 宣告不可以改變值的常數，因為不可以改變值，所以宣告的時候就必須賦值。

---

## var/let/const 的差異

### 重複宣告

var 可以重複宣告，let / const 不可以重複宣告

```js
// 重複宣告 var 變數，可以正常運行
var a = 0
var a = 1
console.log(a) // 1

// 重複宣告 let 變數，會得到錯誤
let a = 0
let a = 1 // Identifier 'a' has already been declared
console.log(a)

// function 帶的參數視為已宣告的變數，這時再用let宣告一次，會得到錯誤
function fn(b) {
  let b = 0 // Identifier 'b' has already been declared
}
fn(1)
```

### 先宣告後賦值

可以先宣告 var / let 變數之後才賦值。但 const 宣告的時候必須同時賦值，否則會出錯。

```js
var a;
a = 1;
console.log(a) // 1

let b;
b = 1;
console.log(b); // 1

const c; // Uncaught SyntaxError: Missing initializer in const declaration
c = 1;
console.log(c);
```

### 重新賦值

var / let 可以重新賦值，const 不可以重新賦值

```js
// 宣告 let 變數 a = 0
let a = 0
a = 1 // 重新賦值 a = 1
a = 2 // 重新賦值 a = 2
console.log(a) // 2

// 宣告 const 變數 b = 0
const b = 0

// 重新賦值 b = 1，會得到錯誤
b = 1 // Assignment to constant variable.
```

### 作用域

var 在 `function內`，let / const 在`{}內`

關於變數的作用域，我有另外寫[一篇文章：JavaScript 變數作用域 Variable Scope](https://bolaslien.github.io/blog/2021/07/14/js-variable-scope/)

```js
// 在 block 內宣告變數，在 block 外取值
{
  var a = 0
  let b = 0
}
console.log(a) // 0
console.log(b) // b is not defined

// 在 function 內宣告變數，在 block 外取值
function fn() {
  var c = 0
  let d = 0
}
console.log(c) // c is not defined
console.log(d) // d is not defined
```

### window 物件

如果在最外層宣告變數，var 變數可以在 window 這個物件裡找到，let / const 變數不會在 window 裡找到。

```js
var a1 = 0
let a2 = 1
console.log(window)
```

![](https://i.imgur.com/PtD1aFJ.png)

---

## 額外的議題討論

剛接觸 JavaScript 的時候，最不習慣的地方是變數宣告的地方，因為以前用 C# ，必須在宣告變數的時候也指定好型別，要讓 C# 知道「這是一個正整數的變數」。

```csharp
int a = 0;
```

而 JavaScript 是一個弱型別的程式語言，做變數宣告的時候並不需要先定義變數的型別，只需要讓 JavaScript 知道「這是一個變數」即可。

```js
var a = 0
```

JavaScript 還有一個神奇的地方，居然沒有宣告變數也可以用！

```js
a = 1
console.log(a) // 1
```

### JavaScript 真的可以不用宣告變數？

在其它程式語言裡，使用未經過宣告的變數是會出錯的，但是在 JavaScript 卻不是這樣。

以瀏覽器來說，不會出錯的原因在於：這樣的操作是發生在 window 這個物件裡。

所以並不是「使用未經宣告的變數」不會出錯**，**而是這樣的操作對 JavaScript 來說，是**在 window 物件裡添加了一個屬性並使用它**。

以為是「使用未宣告的變數」，其實是使用了一個**全域物件的屬性（或稱全域變數）**。

### 全域汙染的問題

舉個例子，在不知道 init.js 及 main.js 的內容的情況下，要怎麼知道 a 是從哪裡開始產生的？要怎麼知道 a 是在哪裡被改變了？萬一又有其他的地方需要用到 a ，而 a 這個值不正確該怎麼辦？這個 a 已經造成**全域汙染**的問題了！

透過這個範例可以知道，在不同的地方用了全域變數，會產生**全域汙染**的問題。

```html
<script src="init.js"></script>
<script src="main.js"></script>
<script>
  console.log(a) // 1
</script>
```

```js
// init.js
function fn() {
  a = 0
}
fn()

// main.js
function fnB() {
  a = 1
}
fnB()
```

通常為了避免全域汙染，建議使用宣告變數的方式，把變數的範圍侷限住，以免產生一連串的問題。

```html
<script src="init.js"></script>
<script src="main.js"></script>
<script>
  console.log(a) // Uncaught ReferenceError: a is not defined
</script>
```

```js
// init.js
function fn() {
  var a = 0
}
fn()

// main.js
function fnB() {
  var a = 1
}
fnB()
```

### 全域變數有宣告跟沒宣告差別在哪？

對 window 物件來說 a 是 window 物件裡的屬性，a 可以用 delete 指令刪除

而 b 雖然也是 window 物件裡的屬性，但它同時是經過宣告的變數，會被當作**全域物件裡無法配置（non-configurable）的屬性**，所以無法用 delete 來刪除。

```js
a = 0
delete window.a
console.log(window)
console.log(a) // a is not defined

var b = 1
delete window.b
console.log(window)
console.log(b) // 1
```
---
## 參考資料

[語法與型別 - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Grammar_and_types)

[JavaScript 那個 let, const, var 到底差在哪？](https://www.youtube.com/watch?v=FGdKdn_CnWo)

[JavaScript Variables](https://www.w3schools.com/js/js_variables.asp)

[var - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Statements/var)
