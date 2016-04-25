---
layout: post
title: '[EF6] BulkInsert'
date: 2014-05-13 15:30
comments: true
categories: "Entity Framework"
tag: "EF6"
---
## 處理狀況
當要同一時間新增大量資料時，如果單純用EF的新增方式，速度會讓人吐血。
所以需要透過BulkInsert的方式處理，但是又不想自己另外寫ado的方式處理，所以就要透過extenstion的方式，
讓EF的功能加強一下


##安裝 EntityFramework.BulkInsert-ef6 

[Nuget](https://www.nuget.org/packages/EntityFramework.BulkInsert-ef6/6.0.2.7)

##參考文件

http://efbulkinsert.codeplex.com/


##(用法)Demo Code

```
using(context db = new context()){
     // 原本會用
     // db.tables.AddRange(entities);
     // 改用
     db.BulkInsert(entities);
     
     db.SaveChanges();
}
```

##執行結果
__非常快速__