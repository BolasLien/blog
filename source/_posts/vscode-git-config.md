---
title: vscode切換git帳號
date: 2020-12-15 15:37:07
tags:
- vscode
- git
categories:
---
在vscode裡面如果沒有設定使用者，就無法正常的使用git功能。
或是有時候有切換帳號的需求，就用指令來解決吧!!
## 記得打開終端機(termial)，並且cd到你要設定的目錄下

<!-- more -->
### 查看git使用者及信箱
```bash
$git config user.name
$git config user.email
```

### 修改git使用者及信箱
```bash
$git config user.name "username"
$git config user.email "user@email.com"
```

