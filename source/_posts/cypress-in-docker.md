---
title: 用Docker跑Cypress
date: 2020-12-15 16:14:16
tags:
- testing
- cypress
categories: 前端
---

執行這些步驟之前，你必須要先有cypress的測試目錄喔。
或是可以[從這裡抓我做的專案](https://github.com/BolasLien/docker-cypress-testing)

<!-- more -->
## 安裝 (for Windows)
[由此下載安裝程式](https://hub.docker.com/editions/community/docker-ce-desktop-windows/)
1. 點兩下安裝
2. 安裝完畢後會自動執行，或是請你重新啟動電腦
3. 安裝docker成功!

## 抓cypress/included的映像檔(image)
[cypress/included](https://hub.docker.com/r/cypress/included)
我是抓6.1.0這個版本
{% codeblock terminal lang:shell %}
$ docker pull cypress/included:6.1.0
{% endcodeblock %}

## 在你的測試目錄裡執行測試
{% codeblock terminal lang:shell %}
# 這是linux指令
$ docker run -it -v $PWD:/e2e -w /e2e cypress/included:6.1.0

# 這是windows power shell指令
$ docker run -it -v ${PWD}:/e2e -w /e2e cypress/included:6.1.0

# 這是windows commader指令
$ docker run -it -v %cd%:/e2e -w /e2e cypress/included:6.1.0
{% endcodeblock %}
### 最後，在你的cypress資料夾裡面會有screenshot跟video的目錄，可以看到紀錄!

參考：
[Install Docker Desktop on Windows](https://docs.docker.com/docker-for-windows/install/)
[Run Cypress with a single Docker command](https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command/?fireglass_rsn=true#fireglass_params&tabid=a44032357a1fe072&application_server_address=witie65.echome.tw&popup=true&is_right_side_popup=false&start_with_session_counter=1)
[Cypress Docker Images](https://github.com/cypress-io/cypress-docker-images)