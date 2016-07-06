---
layout: post
title: "[ASP.NET MVC] MVC Core with SqlClient on MAC"
comments: true
date: 2016-06-22 19:34:01
categories: "ASP.NET MVC"
tags: "MVC Core"
---

.Net Core 終於支援使用SqlClien的物件了(但不確定是從什麼時候開始的), 那就來試試看怎麼在mac的環境上連到sql server撈資料了

<!-- more -->

# 使用Library

* "System.Data.SqlClient": "4.1.0-rc2-24027"
* "Dapper": "1.50.0-rc2b"

Yes. Dapper也支援CoreClr了，可喜可賀



# 使用方式

同原本在.Net4.x的用法 with Dapper

```C#
using (SqlConnection cn = new SqlConnection(_config.Default))
{
  var data = await cn.QueryAsync<Supplier>("select top 10 * from Suppliers");
  return View(data);
}
```





# 所遇到的問題

## 無法連線到SqlServer

![](https://c2.staticflickr.com/8/7676/27223659083_0af2217275_o.png)

**問題描述** : 發生連線字串正確，卻沒有辦法連線到sql server, 但是透過navicat卻可以正常的瀏覽該資料庫的內容

**主機環境:** SQL Server R2 2008 Express，沒有更新到最新的SP

**解決方式:**  將SQL Server R2 2008 更新到SP3即可修正問題，參考資料[github issue](https://github.com/dotnet/corefx/issues/6467)