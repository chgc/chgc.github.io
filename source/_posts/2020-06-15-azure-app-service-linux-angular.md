---
layout: post
title: '[Azure] 將 Angular 網站放在 App Service Linux Version 上'
comments: true
typora-root-url: 2020-06-15-azure-app-service-linux-angular
typora-copy-images-to: 2020-06-15-azure-app-service-linux-angular
date: 2020-06-15 19:51:01
categories: 
- Angular
- Azure
tags:
- Angular
- Azure
---

要將 Angular 放在 Azure 上面的方法有很多種，而今天要介紹的是其中一種，App Service(Linux Version)

<!-- more -->

在 Azure 上面，使用 Linux 版本的價錢可以比 Windows 版本便宜許多，但如果想要放靜態網站時又該怎麼呢? 其實可以簡單透過 npm 上面的一個套件 [serve](https://www.npmjs.com/package/serve) 來完成，這樣就不用自己寫一個 Http Server。但如果是要給 Production 環境使用，還是建議使用正統的 http server 寫法

在 App Service 上面可以這樣子設定

![image-20200615211052044](/image-20200615211052044.png)

可以透過啟動指令的方式來啟動我們想要執行的程式，所以如果是 node epxress 的情況下，就會是 `node ./index.js ` 之類的

而部屬的動作就將 Angular build 出的專案資料夾內的檔案上傳到 App Service 即可

