---
title: 設定 git 使用者及信箱
date: 2020-12-15 15:37:07
tags:
- git
categories: 筆記
---
在vscode裡面如果沒有設定使用者，就無法正常的使用git功能。
或是有時候有切換使用者的需求，就用指令來解決吧!!
## 記得打開終端機(termial)，並且cd到你要設定的目錄下

<!-- more -->
### 查看git使用者及信箱
{% codeblock terminal lang:shell %}
$ git config user.name
$ git config user.email
{% endcodeblock %}

### 修改git使用者及信箱
{% codeblock terminal lang:shell %}
$ git config user.name "username"
$ git config user.email "user@email.com"
{% endcodeblock %}

