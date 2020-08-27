---
title: 如何做一個Line機器人
date: 2020-04-29 09:20:43
tags: 
- node.js
- line-bot
---
## 前置作業
1. [Heroku](https://www.heroku.com/) 註冊帳號
2. [Node.js](https://nodejs.org/) 到官網下載14.0.0，再直接安裝
3. [Line Developers](https://developers.line.biz/zh-hant/)
  * 用Line帳號登入Line Developers
  * 建立一個provider
  * 建立一個MessageAPI
  * 用Line加好友
4. [ngrok](https://ngrok.com/)
  * 用github登入
  * 下載ngrok
> ngrok是用來轉發http內容跟line機器人溝通，我們自己在開發的時候用來測試的
<!-- more -->

## 專案設定
### Node.js安裝套件
1. 打開VSCode，為這個機器人建立一個專案目錄
2. 打開VSCode終端機(推薦使用Cmd)：
* 移動到你的專案目錄，如圖
 ![](https://i.imgur.com/vJhUtRl.png)
* npm init 初始化你的專案目錄
`會產生package.json`
> 如果你的package.json已有記錄你裝的套件，你可以用`npm install`指令來安裝所有套件
* 編輯package.json，加入兩個指令
```json
{
...
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
...
}
```

* 安裝nodemon套件 `npm install -g nodemon`
> -g 全域安裝
> modemon 存檔的時候就會幫忙重新啟動node.js
* 安裝環境設定檔套件`npm install dotenv`
* 安裝line機器人套件`npm install linebot`
* 安裝API套件`npm install request`、`npm install request-promise`
* 安裝node.js的程式碼風格格式化的套件`npm install -g eslint`
* F1=>Create eslint...
`終端機要在你的專案目錄`
* 終端機會自動出現eslint初始化，照圖片回答即可
![](https://i.imgur.com/x90QjZz.png)

* 有上傳Git的話，記得把`node_modules/`加入.gitignore清單

### ENV環境設定檔
* VSCode安裝DotEnv套件
* 專案目錄下建立.env檔案，內容寫入如下(變數裡面的自己去LineDevelop找)
```
CHANNEL_ID=""
CHANNEL_SECRET=""
CHANNEL_ACCESS_TOKEN=""
PORT=3000
```
* 有上傳Git的話，記得把.env加入.gitignore清單

### ESlint設定
* VSCode 鍵盤F1=>搜尋setting=>喜好設定:開啟設定(JSON)
![](https://i.imgur.com/553WDYm.png)

* 在setting.json內加入這一行
```json
{
...
"editor.codeActionsOnSave": {"source.fixAll.eslint": true}
...
}
```
### 機器人設定
1. 在專案目錄下建立index.js
輸入這些東西
![](https://i.imgur.com/26XH5Ua.png)

2. LineDevelopers裡面去把自動回應關閉
![](https://i.imgur.com/WkIl1oC.png)
![](https://i.imgur.com/x2o2OvF.png)

3. 設定ngrok
* ngrok.exe放到專案目錄
* 在終端機裡面輸入Ngrok提供的指令`ngrok authtoken ...`(記得./要拿掉)
![](https://i.imgur.com/P1IdLF1.png)
* 在終端機裡面輸入`ngrok http 3000`啟用ngrok http連線
* 開另一個新的終端機輸入`npm run dev`啟用node.js
>dev是`npm nodemon index.js`指令

* 把ngrok給的https路徑貼到MessageAPI的URL，如果成功的話打開Use Webhook(可能要等一下才能驗證)
![](https://i.imgur.com/TOFIhLW.png)
![](https://i.imgur.com/nMg7NdO.png)


### 撈API
寫成下面這樣，當使用者跟機器人說話，機器人會回應kktix第一個活動的標題。
**需要import request-promise 套件**
![](https://i.imgur.com/dPdyfPt.png)


### 相關連結
[npm linebot](https://www.npmjs.com/package/linebot)
[npm request-promise](https://www.npmjs.com/package/request-promise)


### heroku設定
#### 這是一個雲端伺服器，用來存放機器人，Heroku自己有https，所以不用擔心ngrok換網址了
* 登入後，建立一個App
![](https://i.imgur.com/aruTbWh.png)
* 在這個app的後台的Deploy頁面，選用github連動，選擇到自己的儲存庫
![](https://i.imgur.com/KnDhbZE.png)
* 到setting頁面設定Config Vars
![](https://i.imgur.com/NjEis81.png)
* 部屬你的機器人，點Deploy branch，成功之後點view按鈕，把給的網址複製起來
![](https://i.imgur.com/iVG9IKj.png)
* 貼到LineDevelopers的MessageAPI的Webhook URL
![](https://i.imgur.com/Cxvkyfg.png)

## 相關套件

### 解析HTML - cheerio
如果你想撈的資料是沒有API的話，可以用cheerio去解析HTML
搭配request-promise可以拿到的HTML資料，配合利用JQ語法解析
[cheerio](https://github.com/cheeriojs/cheerio)

### 解析XML - XML2js

### 排程 node-schedule
可以指定機器人每天幾點去做事情(撈資料之類的)
