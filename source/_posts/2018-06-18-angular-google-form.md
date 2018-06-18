---
layout: post
title: '[Angular] Custom Google Form - Angular Version'
comments: true
date: 2018-06-18 20:30:52
categories: Angular
tags: Angular
---

網路上有許多文章介紹如何自訂表單並與Google Form 串接，很有趣的做法，但 Angular 該怎麼做呢? 這篇文章來整理一下做法

<!-- more -->

Google Form 是一個方便又快速的表單服務，但因為樣式很陽春，相信許多網頁設計師是無法接受的，所以才會有自訂 Google Form 表單樣式的教學出來。而 Angular 也可以做到類似的功能，但有幾個小地方要注意。

# 建立 Google 表單

1. 前往 [Google 表單](https://www.google.com.tw)，建立一個新表單

2. 設計表單

3. 開啟回覆中的 Excel 資料表

   ![](https://i.imgur.com/7FZCa21.png)

4. 這個 Excel 資料表會存放所有的表單結果

# Angular 自訂表單

使用 Angular 的表單功能設計一個我們想要的表單，當設計好之後，就需要將 Google 表單的欄位定應到自訂的欄位了，在 Google 表單欄位的名稱，都是以 `entry.xxxx` 命名的，所以我們只要將 Google 表單的 HTML 拿來分析，並將欄位名稱對應上，送到 `<form>` 的網址，就可以了

![](https://i.imgur.com/Rdi3Pss.png)

要送出的網址如上圖

![](https://i.imgur.com/zKO52gh.png)

對應的欄位名稱如上圖

其他注意事項

1. 要使用 `http.post` 送出
2. 要將表單資料使用 `HttpParams` 包裝起來
3. post header 的 `Content-Type` 要改成 `application/x-www-form-urlencoded `
4. 如果是多選的 `checkbox`，送出的欄位名稱是一樣的
5. 要使用 `HttpParams.append` 
6. `radio` 或是 `checkbox` 資料即顯示名稱

剩下的可以參考 [Sample Code](https://stackblitz.com/edit/google-form?file=src%2Fapp%2Fapp.component.html)



# 參考資料

* [Sample Code](https://stackblitz.com/edit/google-form?file=src%2Fapp%2Fapp.component.html)
* [Google Form Customization](https://blog.webjeda.com/google-form-customize/)