---
title: JavaScript 什麼是強制轉型(type coercion)、以及如何轉型？
date: 2021-11-02 15:11:07
tags:
  - javascript
  - js
  - js coercion
  - js type
  - type coercion
  - type conversion
categories:
---

## 強制轉型是在轉什麼?

「轉型」就是將資料型別**轉換成另一種**資料型別。

<!-- more -->

### JavaScript 資料型別

- [基本型別 Primitive](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Data_structures)
  - Boolean
  - Null
  - Undefined
  - Number
  - String
  - Symbol
- 物件型別
  - Object
  - Array

### 轉型的規則

以下的表格為輸入的資料型別及轉型後的結果：

#### ToBoolean

| 輸入的資料型別 | 轉為 Boolean 的結果                                           |
| -------------- | ------------------------------------------------------------- |
| Undefined      | 回傳 `false`                                                  |
| Null           | 回傳 `false`                                                  |
| Boolean        | 輸入什麼就回傳什麼                                            |
| Number         | 如果是`+0` `-0` 或 `NaN` 就回傳 `false`，否則就回傳 `true`    |
| String         | 如果是空字串就回傳 `false`(因為字串長度為 0)，否則回傳 `true` |
| Symbol         | 回傳 `true`                                                   |
| Object         | 回傳 `true`                                                   |

#### ToNumber

| 輸入的資料型別 | 轉為 Number 的結果                                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Undefined      | 回傳 `NaN`                                                                                                                                   |
| Null           | 回傳 `0`                                                                                                                                     |
| Boolean        | 如果是 `true` 就回傳 `1`，如果是 `false` 就回傳 `0`                                                                                          |
| Number         | 輸入什麼就回傳什麼                                                                                                                           |
| String         | 如果可以轉數字就回傳 `轉數字後的資料`，否則回傳 `NaN`                                                                                        |
| Symbol         | 拋出 TypeError                                                                                                                               |
| Object         | 執行下列步驟來產生回傳值 <br> 1. 用 `valueOf()` 取得基本型別值，接著用 `toString()` 轉為字串 <br> 2. 把轉字串的值再轉數字，回傳 `轉型後的值` |

#### ToString

| 輸入的資料型別 | 轉為 String 的結果                                                                                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Undefined      | 回傳 `'undefined'`                                                                                                                                                                                                                                                              |
| Null           | 回傳 `'null'`                                                                                                                                                                                                                                                                   |
| Boolean        | 如果是 `true` 就回傳 `'true'`<br> 如果是 `false` 就回傳 `'false'`                                                                                                                                                                                                               |
| Number         | 1. 如果是 NaN 就回傳 `'NaN'`<br>2. 如果是 +0 或 -0 就回傳 `'0'`<br>3. 如果是 `小於零` 就回傳 `負數字串`。例如：`-100` 轉型後為`'-100'`<br>4. 如果是 無限大 就回傳 `'Infinity'`<br>[點我看更多](https://262.ecma-international.org/6.0/#sec-tostring-applied-to-the-number-type) |
| String         | 輸入什麼就回傳什麼                                                                                                                                                                                                                                                              |
| Symbol         | 拋出 TypeError                                                                                                                                                                                                                                                                  |
| Object         | 執行下列步驟來產生回傳值 <br> 1. 用 `toString()` 轉為字串，如果無法轉字串就用`valueOf()`，再將結果`toString()`轉型 <br> 2. 回傳 `轉型後的值`                                                                                                                                    |

> 💡 [詳細規則請點此看文件](https://262.ecma-international.org/6.0/#sec-type-conversion)，不過我想大部分的人應該不會看...
>
> ![](https://i.imgur.com/6HWsM9I.png)

### 發生「強制轉型」的情境

- 使用 JavaScript 的方法，把變數轉換為另一個型別。
- 把不同資料型別的變數拿來做運算，JavaScript 會~~很貼心的~~把變數轉換為同一個型別，才進行運算。

> 💡 使用 JavaScript 方法來轉型，稱為「顯式轉型」(explicit type coercion)；
> 💡 JavaScript 幫你轉，稱為「隱式轉型」(implicit type coercion)

## 顯式轉型 explicit type coercion (使用 JavaScript 方法來轉型)

如果我們希望把現在的資料型別，轉換成另一種資料型別，就可用 JavaScript 提供的方法來「手動」轉換。

### String

使用 `String()` 來把數字轉字串。

- 可以把數字、值、變數，甚至是表達式轉成字串。

> 💡 把表達式轉字串的執行順序是先算完再轉型，所以把表達式轉型會得到運算結果的字串。

```javascript=
let x = 5           // x 原本是數字
String(x)           // '5' 把變數轉為字串
String(123)         // '123' 把值轉為字串
String(100 + 200)   // '300' 把表達式轉為字串
```

另外，用 `toString()` 的結果也是一樣。

```javascript=
let x = 5               // x 原本是數字
x.toString()            // '5' 把變數轉為字串
(123).toString()        // '123' 把值轉為字串
(100 + 200).toString()  // '300' 把表達式轉為字串
```

其他資料型別

```javascript=
String(null)       // 'null'
String(undefined)  // 'undefined'
String(true)       // 'true'
String(false)      // 'false'
String([])         // ''
String({})         // '[object Object]'
```

### Number

使用 `Number()` 來把字串轉數字。

- 如果是**數字的字串**，會轉為**數字**
- 如果是**空字串**，會轉為**0**
- 如果**不是上面兩種**，就會轉為**NaN**

```javascript=
Number('123')     // 123
Number('3.1415')  // 3.1415
Number('')        // 0
Number('hello')   // NaN
```

其他資料型別

```javascript=
Number(null)       // 0
Number(undefined)  // NaN
Number(true)       // 1
Number(false)      // 0
Number([])         // 0
Number({})         // NaN
```

### Boolean

用 `Boolean()` 轉型為布林值

- 只要不是 **falsy**，都回傳 `true`

> 💡 [falsy 是什麼？](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)

```javascript=
// falsy values
Boolean('')         // false
Boolean(0)          // false
Boolean(-0)         // false
Boolean(NaN)        // false
Boolean(null)       // false
Boolean(undefined)  // false
Boolean(false)      // false

// number
Boolean(123)  // true
Boolean(-123) // true

// string
Boolean('123')    // true
Boolean('hello')  // true

// 空陣列、空物件
Boolean({})   // true
Boolean([])   // true
```

用 `Number()` 來把布林值轉為數字

```javascript=
Number(true)  // 1
Number(false) // 0
```

用 `String()` 來把布林值轉為字串

```javascript=
String(true)  // 'true'
String(false) // 'false'
```

### Date

把 Date 物件轉型

- 轉成數字會得到 **timestamp**
- 轉成文字會得到 **ISO 8601 格式的字串**
- 轉成布林值會得到 `true`

> 💡 [淺談 JavaScript 中的時間與時區處理](https://blog.techbridge.cc/2020/12/26/javascript-date-time-and-timezone/)

```javascript=
let d = new Date()

// 1. 使用 Number() 來把日期轉數字。
Number(d) // 1635415168807

// Date 物件本身就有的 getTime() 也可以得到一樣的結果。
d.getTime() // 1635415168807


// 2. 使用 String() 來把日期轉字串。
String(d) // 'Thu Oct 28 2021 17:59:28 GMT+0800 (台北標準時間)'

// 用 toString() 的結果也是一樣。
d.toString() // 'Thu Oct 28 2021 17:59:28 GMT+0800 (台北標準時間)'


// 3. 使用 Boolean() 來把日期轉布林值。
Boolean(d) // true
```

## 隱式轉型 implicit type coercion (JavaScript 幫你轉型)

如果把兩個不同資料型別的變數進行運算，JavaScript 會避免發生錯誤而自動把型別進行轉換，確保程式可以繼續執行，但對開發者來說，~~JavaScript 的貼心~~很容易造成預期外的結果。

### 自動轉型成 String 的時機

字串跟其他資料型別做`+`的運算，會把另一個資料型別轉為字串，**回傳結果為字串**。

> 💡 會與 [String.concat()](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/String/concat) 的結果一樣

```javascript=
'2' + 345              // '2345'
'2' + true             // '2true'
'2' + null             // '2null'
'2' + undefined        // '2undefined'
'2' + NaN              // '2NaN'
'2' + {}               // '2[object Object]'
'2' + []               // '2'

"2".concat(345)        // '2345'
"2".concat(true)       // '2true'
"2".concat(null)       // '2null'
"2".concat(undefined)  // '2undefined'
"2".concat(NaN)        // '2NaN'
"2".concat({})         // '2[object Object]'
"2".concat([])         // '2'
```

### 自動轉型成 Number 的時機

使用[算術運算子](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Expressions_and_Operators#%E7%AE%97%E8%A1%93%E9%81%8B%E7%AE%97%E5%AD%90) `+`、`-`、`*`、`/`、`%` 來做運算，會把「符號前後」的資料都轉型為數字來做運算，**回傳的結果為數字**。
⚠ 如果`+`前後的值**有一個是字串**，則都**轉為字串做運算**，**回傳結果為字串**。

```javascript=
// 轉為數字
1 + 123          // 124
true + 123       // 124,  true 轉為 1
null + 123       // 123,  null 轉為 0
undefined + 123  // NaN,  undefined 轉為 NaN

// 轉為字串
[] + 123         // '123'    [] 轉型的時候，觸發toString()方法，優先轉為字串。
{} + 123         // '[object Object]123'   {} 轉型的時候，觸發toString()方法，優先轉為字串。
'2' + 345        // '2345'   其中一個資料是字串，所以 345 轉為 '345'
```

使用[比較運算子](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Expressions_and_Operators#%E6%AF%94%E8%BC%83%E9%81%8B%E7%AE%97%E5%AD%90) `>`、`<`、`>=`、`<=`、`==`、`!=` 來做運算，會把「符號前後」的資料都轉型為數字來做運算，**回傳的結果為布林值**。
⚠ 如果`==` 或 `!=` 前後的值**都是字串**，運算時**不會**轉成數字。
⚠ 如果`==` 前後的值是 `null` 或 `undefined`，運算時**不會**轉成數字。

```javascript=

123 >= '345'      // false  '345' 轉為 345
123 >= true       // true   true 轉為 1
123 >= null       // true   null 轉為 0
123 >= undefined  // false  undefined 轉為 NaN
123 >= NaN        // false  NaN 也是數字，沒有轉型直接比較
123 >= {}         // false  {} 先轉為 '[object Object]'，再轉為 NaN
123 >= []         // true   [] 先轉為 ''，再轉為 0

// 字串做「相等比較」不會轉型成數字
'123' == '456'          // false
'123' != '456'          // true

// null 及 undefined 比較
null == 0               // false, null 只會等於 null 或 undefined
null == null            // true
undefined == undefined  // true
null == undefined       // true
```

### 自動轉型成 Boolean 的時機

使用[邏輯運算子](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Expressions_and_Operators#%E9%82%8F%E8%BC%AF%E9%81%8B%E7%AE%97%E5%AD%90)(`||`、`&&`、`!`)來做運算，會把「符號前後」的資料都轉型為**真值 truthy** 或**假值 falsy** 來做運算，**回傳的結果為布林值**。

## 試試看

💪 試著解釋下列結果為何? 符號前後轉型為何?

```javascript=
'2' / 345
'2' / true
'2' / null
'2' / undefined
'2' / NaN
'2' / {}
'2' / []

'2' + [2, 3]
'2' - [2, 3]
'2' * [2, 3]
'2' / [2, 3]

123 <= '345'
123 <= true
123 <= null
123 <= undefined
123 <= NaN
123 <= {}
123 <= []

1 == '1'
1 == true
1 == null
1 == undefined
1 == NaN
1 == {}
1 == []
```

## 參考資料

[JavaScript type coercion explained](https://www.freecodecamp.org/news/js-type-coercion-explained-27ba3d9a2839/)

[JavaScript Type Conversions](https://www.w3schools.com/js/js_type_conversion.asp)

[ECMAScript 2015 Language Specification – ECMA-262 6th Edition](https://262.ecma-international.org/6.0/#sec-type-conversion)

[Expressions and operators - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Expressions_and_Operators)

[你懂 JavaScript 嗎？#8 強制轉型（Coercion） | Summer。桑莫。夏天](https://cythilya.github.io/2018/10/15/coercion/)

[JS 中的 {} + {} 與 {} + [] 的結果是什麼？ | Eddy 思考與學習](https://eddychang.me/js-object-plus-object)

[前端工程研究：關於 JavaScript 中物件的 valueOf 方法 | The Will Will Web](https://blog.miniasp.com/post/2013/07/11/Front-end-Research-JavaScript-valueOf-method)
