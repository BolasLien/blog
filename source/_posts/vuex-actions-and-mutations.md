---
title: vuex actions與mutations的差異
date: 2020-12-11 18:14:37
tags:
- vue
- vuex
categories: 筆記
---

一開始看不懂vuex為何要分mutation跟action兩個寫法，後來查閱了一些資料、加上問公司的前輩，雖然明白了，但還沒辦法體會。

目前先記錄下來，不保證以下內容是正確的觀念。
<!-- more -->

## mutation是同步處理，action是異步處理
vuex有個很重要的原則，必須由mutation來改變state，所以如果讓mutation可以異步處理的話，就很難追蹤正確的值。
[點這裡查看官方怎麼說](https://vuex.vuejs.org/guide/mutations.html#mutations-must-be-synchronous)


### 假設一個簡單的情境：
`A商品加入購物車後，state被改變了。`

action確實類似mutation，但是其實是設計來「可以」做異步處理。

用mutation的話，相當於直接更動state的值；如果在一個.vue做的話，我可能會直接做完異步處理，成功的話再mutation。

但今天如果很多地方都可以加入購物車，我就必須封裝「加入購物車」的方法，然後在各處引用...

那不如一開始就寫在actions裡面，每次都叫這個action去處理就好了。

[這裡可以看官方舉的加入購物車的例子](https://vuex.vuejs.org/guide/actions.html#dispatching-actions)


看完官方的文件後，真正的結論是
**mutation「必須」是同步處理，action「可以」是異步處理**



## 其他人的理解

mutation在乎的是state，action在乎的是要執行的事情
https://stackoverflow.com/questions/39299042/vuex-action-vs-mutations

