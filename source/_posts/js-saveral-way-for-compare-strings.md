---
title: JavaScript 比對字串的幾個方法
date: 2021-03-25 11:04:05
tags:
- javascript
categories: 筆記
---

在處理要允許的host時，用到了幾個方法做了筆記，以下也會提到一些要注意的地方。

## 直接用 ===
```javascript=
let allowHost = 'google.com'
if(windows.location.host === allowHost)
{
  //....
}
```
windows.location.host要跟條件「絕對一致」的話，直接用`===`來判斷吧；但是如果不是...那就繼續看下去吧。

<!-- more -->

## 是否含有某個字串 [String.prototype.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes)
```javascript=
let allowHost = 'google.com'
if(windows.location.host.includes(allowHost))
{
  //....
}
```
可以把字串丟入`includes()`進行處理，若windows.location.host裡面有包含跟條件一致的字串，會回傳`ture`，但如果找不到就會回傳`false`。


> 遺憾的是IE並不支援`includes()`

所以我們必須繼續看下去。

## 找到字串所在的索引值 [String.prototype.indexOf()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf)
```javascript=
let allowHost = 'google.com'
if(windows.location.host.indexOf(allowHost) >= 0)
{
  //....
}

// or

if(windows.location.host.indexOf(allowHost) !== -1)
{
  //....
}
```
把字串丟入`indexOf()`進行處理，若windows.location.host裡面有包含跟條件一致的字串，會回傳第一個被找到的`索引值`，但如果都找不到就會回傳`-1`。

為了支援大部分的瀏覽器會使用`indexOf()`來做比對，但如果要比對的host是個陣列的話，可以再搭配`some()`來做處理。

## 要比對陣列裡的元素，搭配 [Array.prototype.some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
```javascript=
let allowHost = ['google.com','yahoo.com','github.com']
if(allowHost.some(e=> window.location.host.indexOf(e) >= 0))
{
  //....
}

// or

if(allowHost.some(e=> window.location.host.indexOf(e) !== -1))
{
  //....
}
```
使用`some()`可以尋訪陣列中的每個元素，需要給`some()`一個callback來進行處理，只要有一個符合條件的callback就會回傳`ture`，都沒有符合就回傳`false`。

如此一來就可以判斷多個host。

