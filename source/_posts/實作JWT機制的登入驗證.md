---
title: 實作JWT機制的登入驗證
date: 2020-08-18 12:09:18
tags:
- token
- jwt
- nodejs
- Express
categories: 筆記
---
## 運作流程

1. Client登入請求
2. Server接到請求，確定登入後簽發Token給Client
3. Client收到Response，並記下Token
4.
     * Client=>需要驗證的操作都要帶Token給Server
     * Server=>需要驗證的操作都要解析Token確認是本人
<!-- more -->

## Server
### 環境及套件
Node.js + Express
jsonwebtoken

### 簽發Token
#### 寫法
```javascript=
const token = jwt.sign(playload, secret, options)
```
`playload`:你要塞的資料，通常會塞用戶資訊之類的
`secret`:密鑰，自訂一的字串，解析的時候也會用到
`options`:可以加一些設定在這個簽章裡

### 解析Token
#### 寫法
```javascript=
const verify = jwt.verify(token, secret)
```
`token`:簽發出去的token
`secret`:密鑰，自定義的字串
> jwt.verify()必須在try catch裡才可以正常執行

## Client
### 登入
#### 寫法
```javascript=
this.axios
.post(API + 'login' ,{ account, password})
.then(response => {
  // 登入請求成功
  // 從response取出token存起來，之後需要驗證的請求都可以拿來用
})
.catch(error=>{
  // 登入請求失敗的話要做的事情
})
```

### 使用Token的情境
當Client向Server請求訂單資料，Client需在請求的Header中攜帶Token，讓Server解析用戶資料

#### 寫法
```javascript=
this.axios
.get(API + '/order' ,{ headers: { Authorization: 'Bearer '+ token } })
.then(response => {
  // 請求成功的話要做的事情
})
.catch(error=>{
  // 請求失敗的話要做的事情
})
```
> 習慣上會把Token放在header的Authorization裡面