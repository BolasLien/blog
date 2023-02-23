---
title: img 標籤與 background-image 屬性的差別
date: 2022-07-19 23:55:07
tags:
- 切版
categories: 前端技術
---

## 使用時機

- 如果需要放純圖片，用 img 標籤
- 如果在圖片前面還可以有其他的元素，用 background 屬性

<!-- more -->

## img 標籤

- 不設定寬高的話，會直接填滿父層盒模型。也因為這樣有可能會超出螢幕寬度，可以下`max-width:100%`來限制不要超出畫面
- 預設 `display:inline-block`，仔細觀察的話會發現底部會多出約 2~3px 的空間，解決方式是下面兩種擇一

1. display 設為 block
2. vertical-align 設為 middle

## background-image 屬性

- 如果容器沒有東西就會看不到，需要去定義高度

## background-image 模擬 img 的滿版方法

- 簡單來說是用 padding 去撐出高度
  舉例 圖片尺寸 1170(寬) 780(高) 780 / 1170 = 0.6666666667

```css
.background {
  background-image: url(xxxx);
  padding-top: 66.67%;
  background-size: cover;
  background-position: center center;
}
```

## 參考資料

[六角學院 - img 標籤 與 background-image 的使用上差異](https://www.youtube.com/watch?v=zvXgWFfQB2Y)
