---
layout: post
title: '[Angular] 使用 Windows Authentication 的三兩事'
comments: true
typora-root-url: 2019-04-11-ng-windows-auth/
typora-copy-images-to: 2019-04-11-ng-windows-auth/
date: 2019-04-11 10:52:41
categories: Angular
tags: Angular
---

Angular 使用 Windows Authentication，聽起來沒什麼，但是加上 CORS 就是不同的故事了

※ 這篇文章的後端是使用 ASP.NET Core MVC ，但要處理的問題是一樣的，觀念通用

<!-- more -->

Angular 的 HttpClient 在發送請求時，如果在同一個網址下 (同一個網站)，自然會付上 cookie，但遇到不同站點下時又想要帶 cookie 時，該怎麼處理，這時候就必須將 `withCredentials` 開啟，這是 `XMLHttpRequest` 內的屬性，用途是指示了是否該使用類似cookies,authorization headers(頭部授權)或者TLS客戶端證書這一類資格證書來創建一個跨站點訪問控制（cross-site `Access-Control`）請求。這裡是基本用法，當然如果要全域套用時，就會寫成 Http interceptor

```typescript
this.http.get('https://localhost:44369/api/values', {
        withCredentials: true
      })
      .subscribe(data => console.log(data));
```

Angular 端這樣子就可以算是設定完成了

問題是後端要怎麼設定，會遇到幾個問題

1. CORS
2. Web 授權設定

# 簡單情境

當 Angular  的 Http 請求只有單純的設定 `withCredentials: true` 時，後端的設定就很單純，(這裡就假設已經會新增一個基本的 ASP.NET Core MVC 網站)

1. 開啟 `windowsAuthentication` 的方法有兩種

   1. 直接修改 `Properties/launchSettings.json`

      ```json
      {
        "iisSettings": {
          "windowsAuthentication": true, // 設定為 true
          "anonymousAuthentication": false,
          "iisExpress": {
            "applicationUrl": "http://localhost:11235",
            "sslPort": 44369
          }
        },
         ....
      }
      ```

   2. 透過 UI 的方式設定

      ![1554953527168](1554953527168.png)

   3. 在 API 的 Controller 的地方，加上 `[Authorize]` 

2. 啟動 `CORS`

   1. 在 `Startup.cs` 檔案新增以下程式碼

      ```csharp
      public void ConfigureServices(IServiceCollection services)
      {
                  services.AddCors(o => o.AddPolicy("CORSPolicy", builder =>
                  {
                      builder.AllowAnyOrigin()
                             .AllowAnyMethod()
                             .AllowAnyHeader()
                             .AllowCredentials()
                             .WithOrigins("http://localhost:4200");
                  }));
      }
      
      public void Configure(IApplicationBuilder app, IHostingEnvironment env)
      {
          	...
              app.UseCors("CORSPolicy");
          	...
      }
      ```

   2. `.WithOrigins("http://localhost:4200")` 這一行很重要，當 CORS + `withCredentials: true` 時，沒有這一行就會噴出錯誤訊息

      ![1554953778917](1554953778917.png)

   3. 在 API 的 Controller 的地方，加上 `[EnableCors("CORSPolicy")]` 

   4. 相關關於 ASP.NET Core MVC 如何加上 CORS 的文章，網路很多，搜尋一下應該很容易就找到了

3. 當上述的兩的步驟完成後，應可以完成最基本的 Windows 驗證功能

4. 至於之後驗證要做到多細，就與處理登入驗證的做法是一樣的了

# 稍微複雜情境

在實做的過程中發現了一個問題，當我的 Http 請求寫成這樣時，後端設定就變複雜許多

```typescript
this.http
      .get('https://localhost:44369/api/values', {
        headers: new HttpHeaders({
          'Access-Control-Allow-Origin': '*'
        }),
        withCredentials: true
      })
      .subscribe(data => console.log(data));
```

瀏覽器在請求時，因為會先發 `Options` 的 preflight 請求，但這時發的請求是不會有任何 credentials 的，當然後端會直接擋掉

![1554954488888](1554954488888.png)

這時候後端的設定要調整一下，要允許匿名登入，設定方式跟上面開啟 `windowsAuthentication` 類似，只要將 `anonymousAuthentication` 設定為真，或是將 `啟動匿名驗證` 打勾

![1554954644800](1554954644800.png)

當這樣子設定完後，重新啟動後端服務，當打開 `https://localhost:44369/api/values`  網址時會出現以下的錯誤畫面

![1554954728393](1554954728393.png)

只好再來調整一下 `Startup.cs` 的程式了

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // 新增這行
    services.AddAuthentication(IISDefaults.AuthenticationScheme);

    services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
}
```


當修改完成後，重新整理一次網頁，之前的錯誤訊息就會消失了，打開 `Networking` 的地方，就會看到兩次對後端的請求都是正常的

![1554955062068](1554955062068.png)



# 參考資料

* [設定 Windows 驗證](<https://docs.microsoft.com/zh-tw/aspnet/core/security/authentication/windowsauth?view=aspnetcore-2.2&tabs=visual-studio>)
* [XMLHttpRequest.withCredentials](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/withCredentials)

