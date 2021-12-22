---
title: Git 原理與版本控制知識
date: 2021-02-24 16:53:03
tags:
- git
categories:
- [筆記, git]
---
看了高見龍的影片[《你知道Git是怎麼一回事嗎》](https://www.youtube.com/watch?v=LgTf7m5B0xA)，學習Git的原理，趁著記憶猶新來寫一下筆記。

<!-- more -->

## 我的收穫
這部影片釐清了我的Git觀念，也解釋了我一直搞不清楚為何效能比SVN好。推薦給平常有再使用Git、但實際上不知道Git是怎麼運作的人看這部影片。

## 版本控制
### 先定義什麼是版本?
* 目錄或檔案的變化，每一次的變化就叫做一個版本。

### Git跟其他版本控制軟體的差異
* Git只在乎檔案內容，不在乎目錄或檔案名稱
* 有的版本控制是在比對檔案來記錄差異；而對Git來說，只要沒有變化的檔案就會是先前的版本。

## Git怎麼知道檔案有變化?
### 先講`SHA1演算法`
* Git使用`SHA1演算法`來確認檔案內容的變化。
  * SHA1會輸出40個16進位字元組成的字串來`輸出Git物件檔名`
  * 輸入一樣的內容，就會有一樣的輸出值。輸入不一樣的內容，就會有不一樣的輸出值。
  * 有可能會發生碰撞(輸入不一樣的內容卻輸出一樣的值)，但機率非常非常小
  * Git裡面的blob計算公式=>`'blob'+1個空白+內容長度+Null結束字符+輸入內容`
  * 在Git裡面每個物件都有自己的SHA1

### 再講`Git物件有4種type`
* blob放跟檔案有關的資訊，檔案內容有變化blob就會有變化。
* tree放跟目錄有關的資訊，blob有變化，tree也會有變化。
* commit放跟提交有關的資訊，tree有變化，commit也會有變化。
* tag放跟tag有關的資訊，commit有變化，tag也會有變化。
> 這裡的"變化"是指SHA1值被改變了

### 運作原理
當被Git追蹤的檔案內容發生變化，blob的SHA1值就會不一樣，tree跟commit也會跟著不一樣。
> 因為Git只在乎檔案內容，不在乎目錄或檔案名稱

## 關於分支
* 其實分支不是copy一份檔案來改，而是某一個branch指向某一個commit物件
* HEAD是指向某一個branch，通常可以當作`當前的branch`
* 切分支的時候，是把repo的東西搬一份到工作目錄
* checkout跟merge就是分支跟HEAD移來移去而已

## rebase v.s. merge
* rebase是把檔案複製一份放到要rebase的分支，然後放棄原先的線，與rebase的分支成為同一條線
* merge是從兩條線合併為一條新的線

## master可以刪掉嗎?
  * 可以，但是你不能branch在master的時候這麼做，必須先切到別的分支

## 把還沒合併的分支刪掉
  1. `rev-parse 分支` 算出分支的SHA1值
  2. `git branch -D 分支` 強制把還沒合併的分支刪掉，`-d`會有保護
  3. `git branch new_分支 SHA1值` 開一個新的分支，並指定SHA1
  4. 東西就復活在這個新的分支了

## 把hard reset掉的東西救回來
  1. `git reset HEAD~2 --herd` 強制倒退兩個commit，並且刪除commit
  2. `git reflog` 顯示之前的操作，找到被刪除的commit節點
  3. `git reset 被刪除的commit節點 --herd` 強制回到被刪除的commit

## 標籤(tag)
  * 不會隨著commit前進，但branch會
  * 留下來的是tag，跟你走的是branch

## git資源回收(garbage collection)
  * 當物件數太多的時候，git會自動做gc，但也有手動觸發的方式
  * `git count-objects` 現在有幾個東西
  * `git gc` 打包垃圾，會收在objects/pack裡面
  * `tree .git` 可以看到.git資料夾的目錄