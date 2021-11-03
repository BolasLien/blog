---
title: Cypress入門筆記(下)
date: 2020-12-22 11:01:33
tags:
- testing
- cypress
categories: 測試
---
這裡是下半部分的學習筆記，文章最後有一個自己的總結。
以下是研讀官方文件所記錄的筆記，有些理解可能不正確(畢竟母語不是英文)
[Introduction to Cypress](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html)

<!-- more -->

# 斷言(Assertions)
> 斷言是描述`元素`、`物件`、`應用程式`的理想狀態。

舉個例子：
> `<button>`按下去後， 他會有active的class

Cypress寫成：
```js
cy
  .get('button')
  .click()
  .should('have.class','active')
```
另外，如果.active是2秒後才加入button的話，測試仍然能通過！
```js
// even though we are adding the class
// after two seconds...
// this test will still pass!
$('button').on('click', (e) => {
  setTimeout(() => {
    $(e.target).addClass('active')
  }, 2000)
})
```
因為Cypress是`非同步處理`，他會等待測試通過(或是timeout使測試失敗)。

## 斷言的時機
有時候最好的測試是不需要斷言，但是沒有明確的斷言就有可能使測試失敗。
> 但是Cypress有預設的斷言機制，所以不需要每個命令都要有斷言

## 斷言的預設值
你不需要.should()或.and()，它會自動幫你斷言
- `cy.visit()` 期望回傳200
- `cy.request()` 期望收到回應
- `cy.contains()` 期望從DOM找得到內容
- `cy.get()` 期望抓得到DOM
- `.find()` 期望抓得到DOM
- `.type()` 期望可以輸入
- `.click()` 期望可以按下
- `.its()` 期望可以找到property

你也有可能期望相反的狀態，所以你可以這樣寫：
```js
cy
  .get('button')
  .should('not.exist')
```

## 斷言的寫法
有兩種
1. 隱式`.should()`跟`.and()`
他把斷言都丟進cypress的機制裏面去處理了，所以你可以利用命令鍊把它串起來，寫法相對簡短一些
```js
cy
  .get('#header a')
  .should('have.class', 'active')
  .and('have.attr', 'href', '/users')
```

2. 顯式`expect`
如果要寫得很明確，知道每一步在幹嘛，或是針對同一個主題，你有多個斷言
```js
cy.get('tbody tr:first').should(($tr) => {
  expect($tr).to.have.class('active')
  expect($tr).to.have.attr('href', '/users')
})
```

# 超時(Timeouts)
所有的命令都有可能超時。
所有的斷言，無論是自己寫的還是預設的，都有相同的超時值。

## 超時的應用
1. 預設斷言
```js
cy.get('.mobile-nav')
```
找.mobile-nav
- 然後等4秒內看有沒有這個DOM

2. 加上其他的斷言
```js
cy
  .get('.mobile-nav')
  .should('be.visible')
  .and('contain', 'Home')
```
找.mobile-nav
- 然後等4秒看有沒有這個DOM
- 然後等4秒看能不能訪問它
- 然後等4秒看它有沒有Home這個文字

3. 修改超時
```js
cy
  .get('.mobile-nav', { timeout: 10000 })
  .should('be.visible')
  .and('contain', 'Home')
```
找.mobile-nav
- 然後等10秒看有沒有這個DOM
- 然後等10秒看能不能訪問它
- 然後等10秒看它有沒有Home這個文字

## 預設超時
- `cy.visit()` 因為他需要等頁面都家載完，預計會需要很多時間，所以預設是60秒
- `cy.exec()` 因為執行系統的命令，例如設定資料庫初始化，可能會花很多時間，所以預設60秒
- `cy.wait()` 實際上有兩種超時，5秒等路由別名，30秒等伺服器回應。
- 大部分包含DOM的命令，都預設等4秒

# 總結
建議第一次寫Cypress可以先閱讀官方的[Introduction to Cypress](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html)開始。
你就可以知道：
- 它是如何查詢DOM
- 甚麼是命令鍊(chains of commands)
- 甚麼是斷言(Assertions)
- 命令中的超時機制