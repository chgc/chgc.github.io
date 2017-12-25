---
layout: post
title: '[Angular] Rendertron'
comments: true
date: 2017-12-25 10:38:34
categories: Angular
tags: Angular
---

什麼是 `rendertron` ? `rendertron` 是 Google Chrome 團隊推出的另外一個新工具，這工具可以讓 PWA 網站遇到網路爬蟲或是分享到 twitter/Facebook 時，可以產出靜態頁面的效果。換句算說，這工具可以讓我們不用額外處理 Service Side Rendering 卻可以得到相同的效果 (僅局限於網路爬蟲或是 Rich Content Sharing時)。

<!-- more -->

#  簡介

`rendertron` 是如何運作的呢? 其實 rendertron 是透過 Headless Chrome 來讀取 PWA 網站並回傳所產生出來的結果，因為是使用瀏覽器來產生 DOM，所以通常在實作 Server Side Rendering 時會遇到的問題都不會發生，例如 `document` 物件不存在。

另外一個好處是，因為是使用瀏覽器來產生 DOM，所以任何前端技術都可以使用!! 因為是透過 proxy middleware 的方式來完成的，middleware 的設定方是根據文件，看起來並不複雜

# Middleware

根據官方文件有 3 種設定使用的方式

1. [Express.js middleware](https://github.com/GoogleChrome/rendertron/blob/master/middleware)
2. [Firebase functions](https://github.com/justinribeiro/pwa-firebase-functions-botrender) (Community maintained)
3. [ASP.net core middleware](https://github.com/galamai/AspNetCore.Rendertron) (Community maintained)

上述的三種方式都是使用同一個原理，那就判斷發出請求的對象是使用者還是網路爬蟲，如果是網路爬蟲，則使用 rendertron 所生的內容，如果是使用者，則直接輸出預設的內容

![](https://i.imgur.com/zjfodpF.png)

![](https://i.imgur.com/KBQa1RE.png)

## ASP.NET Core MVC

就以 ASP.NET Core MVC 來說，安裝使用方式如下

1. 安裝 `Galamai.AspNetCore.Rendertron` 套件

2. 新增 `Startup.cs`

   1. services 加入 `AddRendertron`

      ```csharp
      public void ConfigureServices(IServiceCollection services)
      {
          // Add rendertron services
          services.AddRendertron(options =>
          {
              // use http compression
              options.AcceptCompression = true;
          });
      }
      ```

   2. 設定並使用 `Rendertron`

      ```csharp
      // Use Rendertron middleware
      // 指定 rendertron 服務的位置
      app.UseRendertron(proxyUrl: "http://rendertron:8080/render/"); 成ㄕ

      ```

3. 完成設定，這樣子就可以使用了

# 安裝

## 本地端

```
git clone https://github.com/GoogleChrome/rendertron.git
cd rendertron
npm install
```

從 Github 將程式碼抓下來後，執行 npm install 後，即可透過 `npm start` 將 rendertron 執行起來

## 使用 docker image

```
docker build -t rendertron . --no-cache=true
docker run -it -p 8080:8080 --name rendertron-container rendertron
```

開啟網頁

```
http://localhost:8080/
```

停止 container

```
docker kill rendertron-container
```

清除 container

```
docker rm -f $(docker ps -a -q)
```



# 參考資料

[rendertron](https://github.com/GoogleChrome/rendertron)