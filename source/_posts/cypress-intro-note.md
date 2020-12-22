---
title: Cypress入門筆記(上)
date: 2020-12-18 14:42:13
tags:
- e2e testing
categories: 測試
---
最近在學習測試，選擇了Cypress這個工具，如果你寫過JQuery，你對他的語法會很快上手。
以下是研讀官方文件所記錄的筆記，有些理解可能不正確(畢竟母語不是英文)
[Introduction to Cypress](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html)

<!-- more -->

# 查詢元素
## Cypress像JQuery的部分
抓DOM的方式跟JQuery很像

## Cypress不像JQuery的部分
JQuery找不到東西的時候會變成一個空的`$()`
Cypress則是會自動重新找，直到找到、或是找太久timeout了

# 命令鏈(Chains of Commands)
## 跟元素的互動
你可以抓DOM之後，對其做事
```js
// 找到input標籤，然後在裡面輸入"this is a book"
cy
  .get('input')
  .type('this is a book')
```

## Asserting About Elements
你可以抓DOM之後斷言(Assert)
```js
// 找到input標籤，斷言沒有'小明'這個值
// 當input裡面沒有小明，結果為pass
cy
  .get('input')
  .should('not.have.value', '小明')
```

## Subject Management
* 每一條命令都是`cy.[command]`來起頭
* 有些方法會產生null，就沒辦法串下一句。例如`cy.clearCookies()`
* 有些方法可以一直串下去。例如`cy.contains()`

## 每個命令都是異步執行
* 但還是可以做同步執行的事情，只是你要寫在`.then()`裡面

## 命令是有順序的
* 為了讓你做完一條再執行下一條

## 命令相似Promise
* 對cypress來說，每條命令都是把promise串下一個promise

## 命令不相似Promise
* 複數個Promise可以並行，但複數個命令不能並行
* 為了保證每次運行的時候都能正確的執行相同的命令才設計成這樣的

## 無須返回命令的值
* 因為命令是絕對有順序的Promise，所以你做完就做完了

## 你不能用`.catch`來抓失敗的命令
* 你不能拋出失敗然後使命令繼續執行
* 只能是通過一條命令，或是一條失敗的命令，就不執行後面的命令了。

