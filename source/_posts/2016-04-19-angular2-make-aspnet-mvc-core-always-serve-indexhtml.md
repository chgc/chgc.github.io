---
layout: post
title: '[Angular] Make asp.net mvc core always serve index.html'
date: 2016-04-19 06:53
comments: true
categories: "Angular"
tag: "Angular"
---
Angular2的預設route模式是html5，這個在跑到其他頁面後，在重新整理頁面後會出現空白頁面，這是因為找不到Index的入口了。所以解決方式就是要讓MVC Core可以每次都載入Index.html頁面(如果純靜態頁面的方式)

在startup.cs的Configure function, 加入以下程式碼

```cs
app.Use(async (context, next) =>
{
   // 判斷request如果不是api call時，則要讀取index.html
  if (!Path.HasExtension(context.Request.Path.Value) 
       && context.Request.HttpContext.Request.Headers["X-Custom-Header"] != "api"
      && context.Request.HttpContext.Request.Headers["X-Requested-With"] != "XMLHttpRequest")
  {
 	 await context.Response.WriteAsync(System.IO.File.ReadAllText("index.html"));
  }
	await next();
});
```

在Angular2的index.ts裡設定讓所有的request的header都新增 X-Custom-Header=api，讓server判斷是否為api call

```js
import { HTTP_PROVIDERS, BaseRequestOptions, RequestOptions, Headers } from 'angular2/http';

class requestOption extends BaseRequestOptions {
    headers: Headers = new Headers({ 'X-Custom-Header': 'api' });
}


bootstrap(CkDemoApp, [
    ...
    provide(RequestOptions, { useClass: requestOption })
]);
```

這樣子就可以讓Angular2跑到不同頁面時，不會因為重新整理而出現空白的畫面

如果是用Controller/View的方式，設定方法比照舊的設定方式即可