---
layout: post
title: '[MVC] 當MVC遇上exe檔(需要讀取網路磁碟機時)'
date: 2015-07-13 11:15
comments: true
categories: "ASP.NET MVC"
tag: "MVC 5"
---
最近要寫一個api，其功能需要呼叫一個exe執行檔然後取得該檔回傳的dbf檔案
但是該執行檔又需要讀取網路磁碟機的檔案。這IIS就會卡住了。不管權限怎麼設定都過不去。

所以只好繞路解決了. 解法是: 建立另外一個selfhost的webapi (console mode), 在該api下執行該執行檔就可以正常運作了，因為不是透過IIS. 然後網站去呼叫那個自行運作的webapi取回結果.

雖然有點麻煩，但是至少解決問題了。(浪費我兩天的生命)

關於selft的webapi建立方式，請參考[webapi selfhost](http://www.asp.net/web-api/overview/older-versions/self-host-a-web-api)