---
layout: post
title: '[Angular] Angular 網站與 CDN 共舞'
comments: true
date: 2017-07-15 19:14:05
categories: Angular
tags: Angular
---

今天去參加社群的分享活動時，有人問到怎麼讓 Angular 的網站也可以使用 CDN 來加快網站的開啟方式。當下想到的方式是手動改 index.html，但事實上， Angular CLI 有提供更方便的方式。

<!-- more -->

# 設定方式

## .angular-cli.json

Angular CLI 提供 `deployUrl` 的參數，該參數所設定的網址會影響 index.html 內的 `main.bundle.js`、`vendor.bundle.js`、 css 裡面的圖片等網址，這些網址會被加上 `deployUrl` 所設定的網址

所以透過這個參數，就可以很簡單的將 CDN 的位置，加到現有的 `script` 的 `src` 裡。

## 建置指令掛參數

> ng build --deploy-url='CDN  網址'

或是

> ng build -d 'CDN 網址'



# 其他注意事項

* 網址需要是 `/` 結尾，這樣子 lazyLoading 時才不會出錯

* 每一次部屬都需要讓 CDN 先清除(purge)原本就有的快取檔

* 每一次的 CDN 更新都需要蠻長的一段時間

  ​

# 總結

利用 `deployUrl` 可以快速地將 CDN 的網址整合到建置的過程中，但還是有很多需要研究的部分，例如 css 裡的圖檔網址的位置是否也會跟著改變。這部分的研究結果之後再補上。

