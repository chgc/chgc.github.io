---
layout: post
title: '[ASP.NET MVC]OData PageResult v4'
date: 2014-07-31 10:28
comments: true
categories: "ASP.NET MVC"
tag: "MVC 4"
---
```
ODataHttpRequestMessageExtensions.GetNextPageLink 和 
ODataHttpRequestMessageExtensions.GetInlineCount 都過時了..
```

要改用

```
Request.ODataProperties().NextLink,
Request.ODataProperties().TotalCount
```


ODataProperties 需要使用 
**System.Web.Http.OData.Extensions** 或 **System.Web.OData.Extensions** 命名空間