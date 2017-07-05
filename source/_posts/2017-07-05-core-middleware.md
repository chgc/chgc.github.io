---
layout: post
title: '[.NET Core] Middleware'
comments: true
date: 2017-07-05 11:50:57
categories: .NET Core
tags: .NET Core
---

`Middleware`  在 `.NET Core` 裡也是一個很重要的機制，來學習吧

<!-- more -->

# 什麼是 middleware?

`middleware` 就像逆滲透的濾水器，自來水 (Request) 要沿著管路m (pipeline) 經過多層的濾心 (middleware) 後，就能得到乾淨的水 (Response)。

![](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware/_static/request-delegate-pipeline.png)

簡單看一下在 .NET Core 內是怎麼使用的

```csharp
public void Configure(IApplicationBuilder app)
{
    app.UseExceptionHandler("/Home/Error"); // Call first to catch exceptions
                                            // thrown in the following middleware.
  
    app.UseStaticFiles();                   // Return static files and end pipeline.

    app.UseIdentity();                     // Authenticate before you access
                                           // secure resources.

    app.UseMvcWithDefaultRoute();          // Add MVC to the request pipeline.
}
```

這樣子系統就會依設定的順序，依序的執行



# IApplicationBuilder

```csharp
public interface IApplicationBuilder
{
    ...
    //
    // Summary:
    //     /// Adds a middleware delegate to the application's request pipeline. ///
    //
    // Parameters:
    //   middleware:
    //     The middleware delgate.
    //
    // Returns:
    //     The Microsoft.AspNetCore.Builder.IApplicationBuilder.
    IApplicationBuilder Use(Func<RequestDelegate, RequestDelegate> middleware);
}
```

這裡跟 middleware 有關的，就是最後一個 `Use`，如果想要加入 `middleware` ，就是透過 `Use` 這方法加入(方法之一)，用以下簡的程式碼做個範例

```csharp
public void Configure(IApplicationBuilder app)
{
  app.Use((context, next) =>
          {
            this.list.Clear();
            this.list.Add(context.Request.Host.Host);
            return next();
          });
  app.Use(async (context, next) =>
          {
            //Do some work here
            context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
            //Pass the request on down to the next pipeline (Which is the MVC middleware)
            await next.Invoke();
          });
  app.Use((context, next) =>
          {
            this.list.Add("pipe 2");
            return next();
          });

  app.Use(async (context, next) =>
          {
            await context.Response.WriteAsync(string.Join(" || ", this.list));
          });

  app.Use((context, next) =>
          {
            this.list.Add("pipe 3");
            return next();
          });
}

```

這樣的執行結果如下

![](https://farm5.staticflickr.com/4241/35561134662_911c938442_o.png)

重點整理

* context 的變數是代表 `HttpContext` 本體
* 可以從 `context` 裡取得 `Request`的資訊，也可以增加 `Response Headers`的內容
* 如果在 `middleware` 間有異動到 `Response`時，之後的 `middleware` 就會失效
* 可以使用 `return next()` 或是 `await next.Invoke()` 兩種方式執行下一個 `middleware`
* `middleware` 是有順序性的，**要留意!!**



# 進階用法：Map、MapWhen

> 針對不同的網址，給予不同的 Response Header

如果想要做到上述的情境，就可以利用 `Map` 這方法，寫法如下

```csharp
app.Map("/api/post", HandlePath2);
app.Map("/api", HandlePath1);
```

或是這樣子寫也是可以的

```csharp
app.Map("/api", apiLevel =>
{
    apiLevel.Map("/post", HandlePath2);
    apiLevel.Map("", HandlePath1);
});
```

```csharp
private static void HandlePath1(IApplicationBuilder app)
{
  app.Use(async (context, next) =>
          {
            //Do some work here
            context.Response.Headers.Add("X-Content-Type-Options", "api");
            //Pass the request on down to the next pipeline (Which is the MVC middleware)
            await next.Invoke();
          });
  app.Use(async (context, next) =>
          {
            await context.Response.WriteAsync("API Page");
          });
}
```

另外一種寫法是使用 `MapWhen`

```csharp
 app.MapWhen(context => context.Request.Query.ContainsKey("branch"),
                               HandleBranch);
```

**注意事項 : ** 

1. 如果使用 `Map` 的話，就會與主線脫離關係了，變成是獨立的執行環境。這點要留意。
2. `Run`、`Map`、`MapWhen` 皆是 `IApplicationBuilder` 的擴充方法



#  內建 Middleware

| Middleware                               | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| [Authentication](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity) | Provides authentication support.         |
| [CORS](https://docs.microsoft.com/en-us/aspnet/core/security/cors) | Configures Cross-Origin Resource Sharing. |
| [Response Caching](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/middleware) | Provides support for caching responses.  |
| [Response Compression](https://docs.microsoft.com/en-us/aspnet/core/performance/response-compression) | Provides support for compressing responses. |
| [Routing](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing) | Defines and constrains request routes.   |
| [Session](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/app-state) | Provides support for managing user sessions. |
| [Static Files](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/static-files) | Provides support for serving static files and directory browsing. |
| [URL Rewriting Middleware](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/url-rewriting) | Provides support for rewriting URLs and redirecting requests. |



# 自訂 Middleware 

自訂 `middleware` 有兩種寫法，一種是如一開始使用 `Use` 的方式來寫，另外一種，就是寫成 `Middleware` 的元件，如同內建的 `middleware`

基本架構如下

```csharp
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.Threading.Tasks;

namespace Demo
{
    public class MyDemoMiddleware
    {
        private readonly RequestDelegate _next;

        public MyDemoMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext context)
        {            
            // Call the next delegate/middleware in the pipeline
            return this._next(context);
        }
    }
}
```

要使用自己所寫的 `middleware`時，有兩種方式

1. 擴充 `IApplicationBuilder` 的方法，使用 `Extension Methods` 的方式。

   ```csharp
   public static IApplicationBuilder UseRequestCulture(this IApplicationBuilder builder)
   {  
     return builder.UseMiddleware<MyDemoMiddleware>();
   }
   ```

2. 利用 `UseMiddleware` 的方式加入

   ```csharp
   public void Configure(IApplicationBuilder app)
   {
     ...
     app.UseMiddleware<MyDemoMiddleware>();
     ...
   }
   ```





# 參考資料

* [Middleware](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware)