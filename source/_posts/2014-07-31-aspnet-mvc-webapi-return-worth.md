---
layout: post
title: '[ASP.NET MVC]WebApi回傳值得表示'
date: 2014-07-31 01:42
comments: true
categories: "ASP.NET MVC"
tag: "MVC 4"
---
asp.net mvc webapi 2 提供了 IHttpActionResult 這個界面

這個界面的效果基本上是跟HttpResponseMessage是一樣的
但是在回傳值的表示有些微的不一樣,以下是整理表

| IHttpActionResult | HttpResponseMessage Request.CreateResponse(HttpStatusCode) |
| ----------------- | ------------------- |
| Ok() | HttpStatusCode.OK |
| InternalServerError() | HttpStatusCode.InternalServerError |
| NotFound() | HttpStatusCode.NotFound |

more on http://msdn.microsoft.com/zh-tw/library/system.web.http.apicontroller_methods(v=vs.118).aspx

這樣子寫起來就乾淨很多了