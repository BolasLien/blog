---
title: putty使用ssh登入遠端無須密碼
date: 2020-09-21 15:48:45
tags:
- putty
- ssh
- linux
categories: 筆記
---
1. 先用putty登入遠端

2. 生成金鑰，一直enter到完成
```bash
$ssh-keygen
```
<!-- more -->
3. 讀取金鑰，金鑰的內容會輸出在畫面上，先把它複製起來
```bash
$cat ~/.ssh/id_rsa.pub
```

4. 編輯authorized_keys，貼上剛剛複製的內容，Ctrl + X 存檔
```bash
$nano ~/.ssh/authorized_key
```

5. 設定權限
```bash
$chmod 700 .ssh
$chmod 600 .ssh/authorized_keys
```

6. 把.ssh資料夾的id_rsa下載到本地端，用puttyGen讀取成功後，Save private key至`C:\Users\{username}\.ssh`

7. 開啟putty進行登入設定
 7-1. 左邊選單Connection->SSH->Auth，選擇到剛剛存的Private key
 7-2. 左邊選單Session，Host Name改為 登入帳號@ip 例如 abc@127.1.2.12

8. Open，以後都不需要輸入帳號密碼囉！