---
title: CSS 選擇器權重 Specificity
date: 2020-12-21 18:07:34
tags:
- css
categories: 前端
---

## CSS 選擇器是如何判斷要套用哪個樣式?
常會遇到寫了樣式卻沒有被套用，而樣式沒被套用有兩個可能
1. 沒有選對元素
2. 選對了元素，但蓋不掉之前的樣式
以下就來講 `選對了元素，但蓋不掉之前的樣式`

<!-- more -->

## CSS 有一個規則叫做 Specificity
### Specificity 有三種
* id (1,0,0)
* class (0,1,0)
* tag (0,0,1)

規則：`#id` > `.class` > `<tag>`
簡單來說，如果要蓋樣式的話，用`#id`會蓋掉`.class`及`<tag>`樣式，用`.class`會蓋掉`<tag>`樣式。
但如果你用`.class`要蓋`.class`的話，就是寫在後面的蓋前面的。

### Specificity 組合
你可以在寫樣式的時候去組合Specificity，這樣更好做樣式覆蓋。
{% codeblock lang:html %}
<!-- CSS的部分 -->
<style>
  <!-- h1=(0,0,1) -->
  h1{
   color:black;
  }

  <!-- .text=(0,1,0) -->
  .text{
   color:blue;
  }

  <!-- h1.red=(0,1,1)  -->
  h1.red{
   color:red;
  }
</style>

<!-- HTML的部分，H1的文字呈現為color:red; -->
<h1 class="text red">文字</h1>
{% endcodeblock %}

### 但是，行內樣式 (inline-style)
遇到行內樣式，你就算用了`#id`一樣蓋不掉。
{% codeblock lang:html %}
<!-- CSS的部分 -->
<style>
  <!-- h1=(0,0,1) -->
  h1{
   color:black;
  }

  <!-- .text=(0,1,0) -->
  .text{
   color:blue;
  }

  <!-- #title=(1,0,0) -->
  #title{
   color:yellow;
  }

  <!-- h1.red=(0,1,1)  -->
  h1.red{
   color:red;
  }
</style>

<!-- HTML的部分，H1的文字呈現為color:green; -->
<h1 id="title" class="text red" style="color:green;">文字</h1>
{% endcodeblock %}

### 還有 !important
除非在你的樣式加上`!important`。另外，`!important`也可以在inline-style中使用。
{% codeblock lang:html %}
<!-- CSS的部分 -->
<style>
  <!-- h1=(0,0,1) -->
  h1{
   color:black;
  }

  <!-- .text=(0,1,0) -->
  .text{
   color:blue;
  }

  <!-- #title=(1,0,0) -->
  #title{
   color:yellow !important;
  }

  <!-- h1.red=(0,1,1)  -->
  h1.red{
   color:red;
  }
</style>

<!-- HTML的部分，H1的文字呈現為color:yellow; -->
<h1 id="title" class="text red" style="color:green;">文字</h1>

<!-- HTML的部分，H1的文字呈現為color:green; -->
<h1 id="title" class="text red" style="color:green !important;">文字</h1>
{% endcodeblock %}

## 總結
* 基本規則是 `#id` > `.class` > `<tag>`。
* 把其他狀況都考慮進來的話 `!important` > `inline-style` > `#id` > `.class` > `<tag>`

