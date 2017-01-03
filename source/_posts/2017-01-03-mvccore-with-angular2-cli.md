---
layout: post
title: '[Angular] 與ASP.NET Core合體'
comments: true
date: 2017-01-03 16:13:00
categories: Angular
tags: Angular2, 'MVC Core'
---

Angular可以說是一個很稱職的前端Framework，那後端的架構又有什麼選擇呢? 其實ASP.NET MVC Core是一個不錯的選擇。架構很輕，在搭配無敵強大的Visual Studio與Azure超級無縫的接軌。可以說是不二人選，但是. Angular CLI的專案要怎麼跟MVC Core的專案結合呢? 以下使用Visual Studio 2017RC+ Core 1.1.0版來做Demo.

<!-- more -->

# 使用 WebAPI 的專案範本建立新專案

![](https://farm6.staticflickr.com/5547/31953873981_b8b9152a9a_o.png)

![](https://farm6.staticflickr.com/5793/31923537982_a7642c97dc_o.png)

按下 OK 後就會是一個含有WebAPI範例的MVC Core的網站了，這時候會發現project.json已經消失了，因為我門是使用Visual Studio 2017建立的關係([Project.json for ASP.NET Core is going away](http://www.talkingdotnet.com/news-project-json-asp-net-core-going-away/))，接下來就是透過NuGet來升級MVC Core的版本到1.1.0的版本。

![](https://farm1.staticflickr.com/292/31696729150_c6080119be_o.png)

![](https://farm1.staticflickr.com/283/32071852495_c4451bf851_o.png)

## 502的錯誤排除

如果第一次執行後，出現502的錯誤，請確認環境是否有安裝.NET Core 1.1的Library，安裝後應可排除問題

[下載位置](https://www.microsoft.com/net/download/core#/current/runtime)

## 設定路由

在startup.cs裡，修改`Configure`的部分 

可能需要多安裝  `Microsoft.AspNetCore.StaticFiles`套件

```c#
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            ...

            app.Use(async (context, next)=>{
                await next();
                if (context.Response.StatusCode == 404 &&
                !Path.HasExtension(context.Request.Path.Value) &&
                !context.Request.Path.Value.StartsWith("/api/"))
                {
                    context.Request.Path = "/index.html";
                    await next();
                }
            });

            app.UseMvc();
            app.UseStaticFiles();
        }
```



# 建立一個空的專案，當Angular CLI的家

![](https://farm1.staticflickr.com/365/32072006795_56248d7537_o.png)

![](https://farm1.staticflickr.com/262/31954080811_d36ea416b5_o.png)

然後將一些用不到的檔案，例如: program.cs給刪除掉，也可進入到nuget看看有沒有安裝什麼Library

一切清乾淨後，就要來建立Angular CLI專案了

## 建立Angular專案



開啟命令視窗，執行ng init --name `<projectName>`

![](https://farm1.staticflickr.com/538/31697154630_57a67af0fa_o.png)

完成後，有幾個設定檔的地方要做調整

1. angular-cli.json的 outDir要修改到 mvc core project的wwwroot資料夾的位置

   ```
   "outDir": "../WebApplication1/wwwroot"
   ```

   ​

2. 新增 proxy.conf.json檔案，定義後端Api server的位置，簡化Angular呼叫API的網址的複雜度

   ​

   ![](https://farm6.staticflickr.com/5758/32033512876_4887ce08f3_o.png)

   ​

```json
{
  "/api": {
    "target": "http://localhost:22846",
    "secure": false
  }
}
```



3 修改 package.json的Scripts的部分

```
"start": "ng serve --proxy-config proxy.conf.json",
```

##  

# 開發時期的執行方式

執行的方式. 前端如果要開始開發的話，下指令 `npm start`，開發時期網頁的網址要以Angular CLI的網址為主

而後端就靠Visual Studio來幫忙囉



# 部屬

透過 Angualr CLI的build指令，就可以將Angualr的專案，根據angular-cli.json的輸出路徑的設定，將所有的ts程式碼轉譯後bundle在一起，輸出到wwwroot的路徑下，由於一開始在Startup.cs裡面就有設定，如果路徑不是api開頭的，就全部轉址到index.html去，也是Angular App的開始頁面.

![](https://farm1.staticflickr.com/512/32033977686_c7b0087e91_o.png)

![](https://farm6.staticflickr.com/5582/31262432143_968c8efb66_o.png)

ng build後，單獨執行MVC Core的網站，最後的呈現結果

![](https://farm6.staticflickr.com/5685/31954954071_d96d2508ae_o.png)



# 參考資料

[Angular2 CLI with ASP.NET Core application - tutorial](https://devblog.dymel.pl/2016/10/25/angular2-cli-with-aspnet-core-application-tutorial/)