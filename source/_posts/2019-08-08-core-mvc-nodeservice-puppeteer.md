---
layout: post
title: '[.NET Core] 使用 nodeservice 來串接 puppeteer 服務'
comments: true
typora-root-url: 2019-08-08-core-mvc-nodeservice-puppeteer/
typora-copy-images-to: 2019-08-08-core-mvc-nodeservice-puppeteer/
date: 2019-08-08 13:30:48
categories: .NET Core
tags: .NET Core
---

ASP.NET Core MVC 有提供一個 `nodeservice` 的服務，這一個服務可以將 .NET Core 與 JavaScript 的程式碼整個傳接起來，怎麼使用，下面再來介紹

另外一個要使用的套件叫做 `Puppeteer`，這一個套件是 Google 出的，可以讓我們創造出 headless 的瀏覽器環境，功能之強大，需要另外寫文章介紹，這邊只是做個配角

<!-- more -->

# NodeServices

不管底層怎麼運作，先來知道怎麼使用吧，如果你的 .NET Core  版本有維持在最新版的話，在建立一個 MVC  專案時，只需要在 `startup.cs` 內新增這一行即可完成加入 `NodeServices` 的功能

```csharp
public void ConfigureServices(IServiceCollection services)
{
    ...
    services.AddNodeServices();
    ...
}
```

加入完成後，基本上就可以使用 nodeServices 了

接下來就是使用 npm 來準備 node service 的開發環境，不一定要使用 `TypeScript`，在專案根目錄下，執行 `npm init -y` 來建立一個簡單的 `package.json` 檔案

## 新增第一個 script 檔案

在專案中開一個資料夾來放 JavaScript/TypeScript 檔案，如果是新增 TypeScript 檔案，Visual Studio 基本上會詢問你是否要安裝 TypeScriptBuild 的套件，這邊就依各位的口味做選擇了。

新增 `hello-world.ts`

```typescript
declare var module: any;

type Callback = (error: any, result: any) => void;

function helloWorld (callback: Callback, name: string) {
    callback(null, `Hello ${name}`);
}

module.exports = helloWorld;
```

`NodeServices` 可以透過 `InvokeAsync<T>` 的方法執行某個檔案中預設 export 的方法，當然在同一個檔案可以同時公開多個方法，這時候就需要使用另外一個方法

* export 出去的 function ，第一個參數一定是 callback，這個 callback 的型別是 `(error, result) => void`

Controller 的部分，當然需要將 `NodeSerivces` 注入進來使用

```csharp
private INodeServices _nodeservices;
public ValuesController(INodeServices nodeservices) {
    _nodeservices = nodeservices;
}
```

執行 JS 的方法

```csharp
[HttpGet]
public async Task<ActionResult<string>> Get()
{
    var result = await _nodeservices.InvokeAsync<string>("./Scripts/hello-world", "Kevin");
    return result;
}
```

* InvokeAsync<T>(`<file path>` , 要傳入的參數)

當呼叫該 api 時，就會回傳 `Hello Kevin` 的文字在畫面上

## 一個 JS 檔案多個方法

當然一個 JS/TS 檔案內可以有多個可執行且公開的方法

```typescript
declare var module: any;

function add(callback, a: number, b: number) {
    callback(null, a + b);
}

function subtract(callback, a: number, b: number) {
    callback(null, a - b);
}

module.exports = {
    add, subtract
}

```

在這情形下，`NodeServices` 提供另外一個方法來呼叫執行

```csharp
 public async Task<ActionResult<long>> Get()
 {
     var result = await _nodeservices.InvokeExportAsync<long>("./Scripts/fns", "add", 2,1);
     result = await _nodeservices.InvokeExportAsync<long>("./Scripts/fns", "subtract", result, 3);
     return result;
 }
```

* `InvokeExportAsync<T>(<file path>, <export function name>, args)`

到這邊我們已經知道基本 NodeServices 的使用方法

# 情境應用

手上有一個案子，需要用到 `Puppeteer` 將 SPA 的網頁產生靜態檔案，除了使用 rendertron 外，似乎也可以使用 `Puppeteer`  這個解決方案，畢竟不是所有人都有辦法架設 rendertron 的服務

快速簡單的介紹 `Puppeteer` ，Puppeteer 就是 Headless Chrome Node API，結束

1. 安裝 `puppeteer`

   ```
   npm i puppeteer
   // or
   npm i puppeteer-core
   ```

   * `puppeteer` 會下載最新版的 Chromium 到電腦上，檔案很大(~170MB Mac, ~282MB Linux, ~280MB Win)，但能確保 API 能跑
   * `puppeteer-core`  不會下載 Chromium，可以使用本機上安裝的 Chrome 也可以連接遠端的 puppeteer services，像是 [http://browserless.io](http://browserless.io/)

2. 新增 `render.ts` 檔案

   ```typescript
   const puppeteer = require('puppeteer');
   
   module.exports = async function (callback, url) {
       try {
           const browser = await puppeteer.launch()
           const page = await browser.newPage();
           await page.goto(url, { waitUntil: 'networkidle2' });
           const content = await page.content();
           callback(null, content);
           await browser.close();
       } catch (ex) {
           callback(null, ex);
       }
   }
   ```

   * line 5: 啟動 puppeteer
   * line 6: 開啟新頁籤
   * line 7: 前往某網址，並等到該網頁的連線請求低於某一種程度 (`networkidle2`)，還有其他模式
   * line 8: 取得該網頁的內容 (HTML)
   * line 9: 回傳結果
   * line 10: 關閉 puppeteer

3. 建立 Middleware，篩選需要執行 `render` 方法的對象，新增 `PuppeteerMiddleware.cs`

   ```csharp
   using Microsoft.AspNetCore.Builder;
   using Microsoft.AspNetCore.Http;
   using Microsoft.AspNetCore.Http.Extensions;
   using Microsoft.AspNetCore.NodeServices;
   using System.Linq;
   using System.Threading.Tasks;
   
   namespace nodeservices_demo.Extensions
   {
       public static class PuppeteerMiddlewareExtension
       {
           public static IApplicationBuilder UsePeppeteerRenderer(this IApplicationBuilder builder)
           {
               return builder.UseMiddleware<PuppeteerMiddleware>();
           }
       }
   
       public class PuppeteerMiddleware
       {
           string[] BotUserAgents = new string[]
         {
               "W3C_Validator",
               "baiduspider",
               "bingbot",
               "embedly",
               "facebookexternalhit",
               "linkedinbo",
               "outbrain",
               "pinterest",
               "quora link preview",
               "rogerbo",
               "showyoubot",
               "slackbot",
               "twitterbot",
               "vkShare"
         };
   
           private readonly RequestDelegate _next;
           private readonly INodeServices _nodeServices;
           public PuppeteerMiddleware(RequestDelegate next, INodeServices nodeServices)
           {
               _next = next;
               _nodeServices = nodeServices;
           }
   
           public Task Invoke(HttpContext context)
           {
   
               if (IsNeedRender(context))
               {
                   return InvokeRender(context);
               }
               else
               {
                   return _next(context);
               }
           }
   
           private bool IsNeedRender(HttpContext context)
           {
               var userAgent = context.Request.Headers["User-agent"].ToString().ToLowerInvariant();
               return BotUserAgents.Any(x => userAgent.Contains(x.ToLowerInvariant()));
           }
   
           private async Task InvokeRender(HttpContext context)
           {
               var cancellationToken = context.RequestAborted;
               var result = await _nodeServices.InvokeAsync<string>("./Scripts/render", context.Request.GetDisplayUrl());
               await context.Response.WriteAsync(result, cancellationToken);
           }
       }
   }
   
   ```

4. 使用 middleware

   ```csharp
   public void Configure(IApplicationBuilder app, IHostingEnvironment env)
   {
     	...
       app.UsePeppeteerRenderer();
     	...
   }
   ```

至於如何測試，我們可以透過 `curl` 這指令來完成

```
curl -D - <url> -A <user-agent>
```

範例

```
curl -D - https://2019.angular.tw -A bingbot
```



# 結論

ASP.NET Core 所提供的 `NodeServices` 可以讓我們使用很多前端好用的套件工具，就自己的感覺，我認為開發者的發揮空間又更大了

此外，Puppeteer 這套件的功能之強大，並不是這一篇能涵蓋的，之後再利用幾篇來介紹這一個工具



# 參考資料

* [NodeServices](https://github.com/aspnet/JavaScriptServices/tree/master/src/Microsoft.AspNetCore.NodeServices)
* [Puppeteer](https://github.com/GoogleChrome/puppeteer)
* 

