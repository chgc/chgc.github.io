---
layout: post
title: '[Bot] 來寫Bot吧...讓我想起 MSN Bot了'
date: 2016-04-01 01:53
comments: true
categories: "BOT"
tag: "botframework"
---
先從基本的開始，跟著下面的文章做，就可以完成基本的Bot功能了
http://docs.botframework.com/connector/getstarted/#navtitle

**注意事項**

1. 當在新增【My Bot】時，Endpoint的網址一定要用**https**, 不然之後在測試Bot Connector時會出現403, 無法授權等奇怪的狀況. 

2. 如果使用web chat embed code時，要把他們所提供網址裡的s=[secret] 改成 t=[secret]


###程式基本的運作方式

Bot在與Bot Connector之間的溝通是透過傳遞Message.
這個Message裡面會包含很多資訊，也可以保留狀態(所以可以建立一連串的問題，就像在執行npm init時會問一堆問題一樣)
[網站參考](http://docs.botframework.com/connector/message-types/#navtitle)

總結: 一切都是在玩弄Message這個物件阿.