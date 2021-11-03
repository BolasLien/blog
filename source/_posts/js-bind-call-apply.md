---
title: JavaScript Bind Call Apply
date: 2021-08-24 17:33:00
tags:
- JavaScript
categories: 筆記
---
認識 bind, call, apply 這三個方法之前，先說說 `function` 與 `this`。

### function 是 object
在 JavaScript 裡，幾乎所有的東西都是 object，function 也不例外。
<!-- more -->
### this keyword
`this` 就是 this 所在的 object，下面的例子，this.age 的 this 指的就是 Bolas 這個物件。
```js
let Bolas = {
  age: 18,
  sayAge() {
    console.log("Bolas's age is " + this.age + " years old")
  }
}
```

雖然 function 也是 object，但如果 `this` 在 function 裡， this 指的是 `window`
```js
function hello(){
  console.log(this)
}

hello() // window
```
---
## Bind, Call, Apply 的用途
如果我們需要改變 function 的 this，可以用 function 繼承的方法：bind, call, apply，來達到改變 this 的指向。
這三個方法的用途都是在重新綁定 function 的 this，差別在於寫法不一樣。

## 實際應用
- 有各種放錢 money 的地方：口袋 pocket、皮夾 wallet、銀行 bank
- 有查詢 money 的功能：getMoney()
- 有更新 money 的功能：updateMoney()

我們如果直接使用 getMoney 或 updateMoney 會因為 `this` 是指向 `window` 而無法正常使用。
接下來要用到 bind, call, apply 來改變 this。
```js
let pocket = {
  money: 325,
}

let wallet = {
  money: 2000,
}

let bank = {
  money: 300400,
}

// 查詢
function getMoney() {
  console.log(this.money)
}

// 更新
function updateMoney(location, numberOfMoney) {
  let total = this.money + numberOfMoney
  console.log(`${location}原本有${this.money}元。存了${numberOfMoney}進去，現在有${total}元。`)
  this.money = total
}
```

### bind 的寫法
用 bind 來改變 this 指向皮夾 wallet。
> bind 會需要用新的變數來裝，會寫比較多程式碼。

```js
// Function.prototype.bind() 寫法
// let newFunction = originFunction.bind(thisArg)
// newFunction(parameter1, parameter2, ...);

// 查詢
let checkWalletMoney = getMoney.bind(wallet)
checkWalletMoney() // 2000

// 更新
let updateMoneyIntoWallet = updateMoney.bind(wallet)
updateMoneyIntoWallet('皮夾', 300) // 皮夾原本有2000元。存了300進去，現在有2300元。
```

### call 的寫法
用 call 來改變 this 指向口袋 pocket。
> 個人覺得是最方便的寫法
```js
// Function.prototype.call() 寫法
// originFunction.call(thisArg, parameter1, parameter2, ...)

// 查詢
getMoney.call(pocket) // 325

// 更新
updateMoney.call(pocket, "口袋", 500) // 口袋原本有325元。存了500進去，現在有825元。
```

### apply 的寫法
用 apply 來改變 this 指向銀行 bank。
> 要注意的是 apply 接受的參數為陣列，所以要把帶入的參數用陣列裝起來
```js
// Function.prototype.apply() 寫法
// originFunction.apply(thisArg, [parameter1, parameter2, ...])
// *** parameter is an array

// 查詢
getMoney.apply(bank) // 300400

// 更新
updateMoney.apply(bank, ["銀行", 80000]) // 銀行原本有300400元。存了80000進去，現在有380400元。
```