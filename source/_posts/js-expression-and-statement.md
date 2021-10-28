---
title: 何謂表達式(Expression)與陳述式(Statement)?
date: 2021-10-27 16:25:52
tags:
- javascript
- js
- js foundation
categories: 六角JS直播班
---

## JavaScript 怎麼理解我們輸入的東西?
就跟我們的對話一樣，透過「單詞」拼湊出來「一句話」，這樣我們就可以知道對方想要表達的事情是什麼。

而 JavaScript 則是分析你寫的程式碼是「表達式」還是「陳述式」，來知道你想要做的事情是什麼。

<!-- more -->

### 用中文對話來理解
#### 表達式範例
```
小明: 你今年幾歲?
小華: 12 歲
```

「你今年幾歲」、「你的生日幾月幾號」、「你知道桌上有幾個東西嗎?」這種一定有**答案**的句子，我們可以說這是**表達式**。

#### 陳述式範例
```
小美: 你像一隻貓咪，我猜不透你！
小華: (已讀不回)
```

「你是貓咪」、「你很累的樣子」、「你如果看到西瓜」這種**描述**的句子，我們可以說這是**陳述式**。

#### 日常對話
```
媽媽: 你去幫我買西瓜，如果看到西瓜，就買三個西瓜，沒有的話，就買三個雞蛋
小華: 好!
```

在日常對話中，會出現「表達式」跟「陳述式」混用的情形，寫程式也是一樣會有混用的情形。

## JavaScript 是哪些東西構成表達式與陳述式?
**表達式**有哪些「形式」？[詳細可以看這](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Operators)
* 值
* 賦予值
* 各種運算子(算術運算子、相等運算子、關係運算子、邏輯運算子、三元運算子)
* 呼叫函式


**陳述式**有哪些「形式」？[詳細可以看這](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Statements)
* 宣告(var, function)
* 流程控制(Block, if else, switch)
* 迴圈(for, for...in)
* 其他(import, export)

### 差異
表達式：在JS中描述結果的語法，比如說**運算結果**、或是**給變數賦予值**。
陳述式：在JS中描述一件事情的語法，比如說**流程控制**、**宣告一個變數**。

### 試試看
```javascript=
1 + 1; // 1 + 1有運算結果，所以是表達式。

var a = 1;
// var a = 1 陳述式與表達式都有。
// var a 是宣告一個變數a，是描述一件事，所以是陳述式。
// a = 1 是給a賦予1這個值，是描述一個結果，所以是表達式。

if(isRaining === true) {
  withUmbrella();
}
// isRaining === true 有一個判斷的結果，所以是表達式
// if(){} 是在說，如果成立就做甚麼...所以是陳述式
// withUmbrella() 是表達式，因為執行一個function會回傳結果，所以是表達式
```

## 參考
[JavaScript 表達式觀念及運用 - JS Expression | 卡斯伯 Blog - 前端，沒有極限](https://wcc723.github.io/development/2020/09/17/js-expression/)
[運算式與運算子 - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Operators)
[陳述式與宣告 - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Statements)