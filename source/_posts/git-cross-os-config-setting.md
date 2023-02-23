---
title: Git 跨平台開發 未修改的檔案出現異動(換行警告、檔案權限)
date: 2021-12-21 15:54:58
tags:
- git
categories: 筆記
---

嘗試把一個大專案從 SVN 移到 Git 時，發現從 Windows 環境作 `git clone` 的時候，檔案會莫名奇妙的有異動，而這個異動卻從文件比對看不出有差異。

過程中試了很多方法才終於解決，以下是完整的過程，文章最後紀錄跨平台開發的情境下應該做哪些 Git 設定。

<!-- more -->

## 換行警告 "warning: LF will be replaced by CRLF ..."

在還不知道原因的時候，想說有異動就 `git add` + `git commit`，應該就沒問題了吧，**結果從 A 電腦提交，B 電腦 clone 下來，又產生了異動**。

後來觀察到 `git add` 時會有警告訊息：

```bash=
warning: LF will be replaced by CRLF ... The file will have its original line endings in your working directory.
```

原來是因為文字檔的換行格式在 Linux 跟 Windows 不同，而貼心的 Git 會自動這樣做：

- 在 `git clone` 的時候，Git 會依照作業系統自動轉換文字檔的換行格式，Windows 換行方式是 CRLF 格式，Linux 是 LF 格式。
- 在 `git add` 的時候，Git 會自動把文字檔轉成 LF 的格式（所以就會看到上述的警告）。

### LF 跟 CRLF 換行格式

電腦如果要看得懂文字檔是在哪裡換行，會在文字檔換行的地方加入換行字元。

- 在 Windows 系統，換行字元是`\r\n`(CRLF)
- 在 Linux 系統，換行字元是`\r`(LF)

因為開發環境同時有 Linux 跟 Windows，在不同的系統上編輯文字檔就會產生不同的換行格式，所以**必須統一換行的格式**。

最後選擇統一使用 LF 格式，因為：

- Git 本身是以 LF 為主
- 工作上主要使用 Linux 為開發機

使用指令：

- core.autocrlf {option}

  - `true` commit 的時候把 CRLF 轉為 LF ，checkout 的時候轉換為 CRLF
  - `input` commit 的時候把 CRLF 轉為 LF，checkout 的時候不轉換
  - `false` 不自動轉換

- core.safecrlf {option}
  - `true` 專案**不可以** CRLF 跟 LF 混用
  - `false` 專案可以 CRLF 跟 LF 混用
  - `warn` 專案可以 CRLF 跟 LF 混用，有 CRLF 跟 LF 混用的情況會跳警告

## 100755 → 100644 ?

以為問題已經解決，用任何的編輯器去檢查都確定是 LF 格式了，沒想到還是會出現異動...

後來我在 Gitlab commit 紀錄裡面發現了 `100755 → 100644` 寫在檔案路徑後面
![](https://i.imgur.com/TJGoJHe.png)

拿去 Google 後才發現，原來 Git 連**檔案權限**都要管，最後是把 Git 的權限追蹤設定關起來就完整解決了。

使用指令：

- core.filemode
  - false 忽略檔案權限變更
  - true 自動修正檔案權限

## 跨平台開發的 Git 設定

windows:

```bash=
cd {project}                                 # 移到專案目錄
git config core.filemode false               # 忽略檔案權限變更
git config --global core.autocrlf true       # 自動修正換行符
git config --global core.safecrlf false      # 忽略換行字元警告
```

linux:

```bash=
cd {project}                                 # 移到專案目錄
git config core.filemode false               # 忽略檔案權限變更
git config --global core.autocrlf input      # 取出時轉為LF
git config --global core.safecrlf false      # 忽略換行字元警告
```

## 參考

[Git 在 Windows 平台處理斷行字元 (CRLF) 的注意事項](https://blog.miniasp.com/post/2013/09/15/Git-for-Windows-Line-Ending-Conversion-Notes)
[Git 提示“warning: LF will be replaced by CRLF”](https://blog.csdn.net/weixin_43670802/article/details/105602815)
[令人困擾的 Git Autocrlf](https://blog.opasschang.com/confusing-git-autocrlf/)
[Git Autocrlf 與 Safecrlf](https://shunnien.github.io/2018/06/03/git-autocrlf-and-safecrlf/)
[git 关于文件权限修改引起的冲突及忽略文件权限的办法](https://www.jianshu.com/p/38c71ff4a83d)
[git tips: 设置 filemode，避免 NTFS 文件权限变更引起的修改](https://www.jianshu.com/p/3b0a9904daca)
