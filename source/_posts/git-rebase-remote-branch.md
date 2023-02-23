---
title: Git 同步對齊 fork 專案跟原始專案的 commit
date: 2021-05-12 12:13:44
tags:
- git
categories: 筆記
---
## 使用fork的方式進行開發
開發到一個段落時，如果直接推送自己的東西進master，未來要合併回原始專案的時候，很有機會遇到衝突(可能錯過了一些commit導致)；所以先跟原始專案做"對齊"的動作，再推送自己開發的東西會比較保險

## 情境
* bbb從`aaa/project`fork出來`bbb/project`進行開發

* `aaa/project`的master分支有10個commit。

* 本地的master分支有5個原始commit，3個開發產生的commit。

* bbb想要把本地的master分支，跟`aaa/project`的commit保持一致，再把自己開發的東西一起推送到`bbb/project`。

## 步驟
1. 設定原始專案為上游分支
```bash
git remote add upstream aaa/project.git
```
2. 抓取原始專案的異動
```bash
git fetch upstream
```
3. 切到master分支
```bash
git checkout master
```
4. 把upstream/master合併到master分支
```bash
git rebase upstream/master
```
> 如果有異動還沒推，先stash起來，做完rebase後再取出

5. 推送
```push
git push
```



## 參考資料
[Git中同步主干的代码到fork分支里](https://www.datarelab.com/blog/Technical_literature/776.html)
[【狀況題】怎麼跟上當初 fork 專案的進度？](https://gitbook.tw/chapters/github/syncing-a-fork.html)
[Stash（暫存）](https://backlog.com/git-tutorial/tw/reference/stash.html)