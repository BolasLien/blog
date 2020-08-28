---
title: 用Hexo建部落格踩到的坑
date: 2020-08-28 13:55:28
tags: 
- Hexo
- Blog
categories: 筆記
---
在職訓的時候寫了markdown的筆記想說要找地方放出來，正好在待業中的階段可以練一下自架markdown的blog

查了些資料後，決定選擇[Hexo](https://hexo.io/zh-tw/)，~~小聲地說是因為作者是台灣人，當然要支持一下~~
<!-- more -->
# 樣式的選擇

架設的過程中看了很多樣式，本來決定要用NexT，但架設出來的樣式不是我最順眼的

後來又找到Minos，可是我想要可以顯示頭像等一些資訊的側邊攔

沒想到與Minos同一個作者有另一個主題叫做icarus，並且有完整的中文建置教學

所以最後就決定用[icarus](https://blog.zhangruipeng.me/hexo-theme-icarus/)

# 本站的Logo

本站的中心思想：喜歡coding，喜歡解決問題

所以用上了我的英文名字`Bolas`，搭配寫程式會用到的分號`;`

用AI畫了這樣的圖

![](https://bolaslien.github.io/blog/img/logo.png)

# 再來說踩到的坑

* 繼續閱讀/閱讀更多/more
在還不熟悉Hexo的架構下，我的文章內容是整篇都顯示出來，查了很多關鍵字，才找到可以用 `<!-- more -->`來決定文章預覽的範圍。

* 佈署
好不容易把部落格的內容調整好了，在`hexo s`下可以正常顯示，在`hexo g`打包出來的index.html卻不正常(css不見或是整個畫面沒東西)..

### 為了發布出去，我除錯用了快一整天的時間。

* 先是懷疑套件有問題，解除安裝跟重新安裝了好多次
=> 沒用

* 懷疑icarus使用的套件會讓打包有問題，重新架了最原始的hexo
=> 一樣壞掉

* 查到資料，好像是node版本的問題，只好去裝nvm，把node從原本的14.9.0降到12.18.3
=> 本地打包出來的東西一樣有問題，很神奇的是上github就沒事了

# 最後總結一下

也不知道有沒有人跟我一樣，反正我就記錄一下

### 環境設定
* Node: 12.18.3
* hexo: 5.1.1
* hexo-cli: 4.2.0

### 佈署方式
* 利用`Hexo d`來發佈到Github [怎麼設定看這篇文章](https://blackmaple.me/hexo-tutorial/)