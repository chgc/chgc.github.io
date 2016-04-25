---
layout: post
title: '[Devexpress] How to bind a objec to bindingsource in WEB xtrareport'
date: 2015-07-01 01:00
comments: true
categories: "Library"
tag: "Devexpress"
---
Bindingsource物件是屬於winform的，所以在web環境下的design time是沒有辦法直接設定物件到datasource的屬性裡
所以這部分需要手動加進去，作法是進入 xxx.Designer.cs的InitializeComponent()加入


```
   this.bindingSource1.DataSource = typeof(Object); // replace with the object you want
```

這樣子回到設計模式就會出現可以設定的binding物件了

^^