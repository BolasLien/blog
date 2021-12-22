---
title: CSS Flexbox 屬性及用法
date: 2021-07-05 15:41:56
tags:
- css
categories:
- [筆記, css]
---
## Flexbox 是什麼？

早期用 Box model 排版的時候，要用很多種方式來避免畫面跑版，但隨著時代進步，不同的裝置有不同的解析度，若每個裝置都要重新設計版面也太麻煩了！於是 Flexbox 就誕生啦！

Flexbox 解決了早期的排版問題，能夠隨著不同裝置來變化排版，可以自適應不同裝置的長寬稱為響應式布局（RWD）。

網路上有很多解釋 Flexbox 的文章，這裡主要說明 Flexbox 相關的屬性及用法。

<!-- more -->

## 開始使用

設定`display:flex;`的元素是`flex container`，其子元素為`flex item`。

```html
<style>
.container{
  /*  parent set display:flex;  */
  display:flex;
}
</style>

<body>
  <!-- parent is flex container -->
  <div class="container">
    <!-- chird is flex item -->
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
  </div>
</body>
```

## 屬性介紹

下面屬性如果是`預設值`，會帶有⚙齒輪符號

## flex container 的相關屬性

設定在`display:flex;`同一個元素內的屬性

---

### flex-direction 方向

在畫面上要橫的還是直的

`row`⚙ 橫的，由左到右的
`row-reverse` 橫的，由右到左的
`column` 直的，由上到下的
`colume-reverse` 直的，由下到上的

---

### flex-wrap 換行

全部item的寬度如果超過 container 的寬度，要不要換行

`nowrap`⚙ 不換行
`wrap` 要換行。當 flex container 的寬度沒辦法容納所有 flex item，就把 flex item 換行

---

### justify-content 水平對齊

決定 item 之間的水平對齊方式

`flex-start`⚙ 齊頭
`flex-end` 齊尾
`center` 置中
`space-between` 頭尾對齊，item 均分剩餘寬度
`space-around` 頭尾分一個寬度，item 均分剩餘寬度
`space-evenly` item均分剩餘寬度

---

### align-items 垂直對齊

決定 item 之間的垂直對齊方式

`normal`⚙ 基本上跟stretch一樣
`flex-start` 齊頭
`flex-end` 齊尾
`center` 置中
`stretch` 如果 item 沒有設定 height，就把item 拉伸到跟容器一樣高

## flex item 的相關屬性

設定在`子元素`的屬性

---

### flex-grow 增長係數

有剩餘空間的時候怎麼分配

`0`⚙ 不影響 width
`1` flex item width 占用1倍的剩餘空間，數字越大佔越多

[flex-grow 怎麼分配剩餘空間](#flex-grow-怎麼分配剩餘空間)

---

### flex-shrink 收縮係數

空間不夠的時候怎麼分配

`0` flex item width 不要收縮，會直接爆出去
`1`⚙ flex item width 有超出空間，就縮至超出空間的1倍。數字越大，收縮的比例越高

[flex-shrink 怎麼收縮不夠的空間](#flex-shrink-怎麼收縮不夠的空間)

---

### flex-basis 基本寬度

跟 width 很像，但如果有設定 flex-basis 的話，優先度會高於 width

`auto`⚙ 內容決定寬度
`150px` width 設為 150px。要注意的是，如果`flex-direction: column;`的時候，flex-basis就不是 width 而是 hight 。

[設定 flex item 的寬](#設定-flex-item-的寬)

---

### flex 縮寫屬性

```css
/* 順序 grow shrink basis */
flex: 0 1 150px;

/* flex:0 1 150px; 等於下列 */
flex-grow:0;
flex-shrink:1;
flex-basis:150px;
```

## Flexbox 怎麼設定長寬

### 設定 flex item 的寬

- 沒有設定 width 會怎樣？
內容會決定寬度。
- 設定了 width 會怎樣？
width 決定寬度最大值
width 會是 flex item 的最大寬度，也就是說寬度可以小於設定的 width ，但不會大於 width
但如果想要固定 width 的話，可以用`flex-wrap:wrap;`來固定
- 設定 flex-grow 會怎樣?
會依照 flex-grow 去分配 flex item 應該佔多少比例的寬，來填滿剩餘空間。
如果有做 flex-basis 的設定，就等於是做寬度的最小值

### 設定 flex item 的高

- 沒有設定 height 會怎樣?
內容會決定高度。
- 設定了 height 會怎樣?
height 決定固定的高度。

### 結論

在使用 flex 做排版的時候：

- flex container
要設定`display:flex;`跟`flex-wrap:wrap;`
- flex item
寬的設定 要設定 width ，或是設定 flex-grow, flex-basis
高的設定 要設定 height

## flex-grow 怎麼分配剩餘空間

假設 flex container 的寬為 1000px
並有兩個 flex item，box1 跟 box2

- flex-grow 分別為 3 跟 1
- flex-basis 皆為 100px
1. 先計算剩餘寬度

> 剩餘的寬度 = container width - box 的寬加總
= 1000px - 200px = 800px

1. 接著把剩餘寬度分配給 box1 及 box2

> 分配寬度 = flex container 剩餘寬度 * flex-grow / flex-grow 加總
box1 分配到的寬度 = 800px * 3 / (1+3) = 600px
box2 分配到的寬度 = 800px * 1 / (1+3) = 200px

1. 最後分配到的寬度再加回 box 的寬

> flex item 寬度 = 分配寬度 + 原寬度
box1 寬度 = 600px + 100px = 700px
box2 寬度 = 200px + 100px = 300px

## flex-shrink 怎麼收縮不夠的空間

假設 flex container 的寬為 1000px
並有三個 flex item，box1 跟 box2 跟 box3

- flex-shrink 分別為 1 跟 2 跟 3
- width 各為 400
1. 先計算超出多少

> 超出的寬度 = 三個 box 的寬加總 - flex container 的寬
= 1200px - 1000px = 200px

1. 計算三個 box 個別收縮多少

> 收縮寬度 =  flex container 超出寬度 * flex-shrink / flex-shrink 加總
box1 要收縮的寬度 = 200px * 1 / (1+2+3) = 33.34px
box2 要收縮的寬度 = 200px * 2 / (1+2+3) = 66.66px
box3 要收縮的寬度 = 200px * 3 / (1+2+3) = 100px

1. 把算好的收縮再扣回寬度

> box1 寬度 = 400 - 33.33 = 366.66px
box2 寬度 = 400 - 66.66 = 333.34px
box3 寬度 = 400 - 100 = 300px

## 延伸閱讀

[A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)