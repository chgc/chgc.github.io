---
layout: post
title: '[ASP.NET Core] Identity - Part 1 使用 Google 登入'
comments: true
date: 2018-05-31 11:03:19
categories: '.NET Core'
tags: '.NET Core'
---

ASP.NET Core 有提供身分~~認證~~ 管理的功能，叫做 `Identity`，此外也有提供多種的驗證方式，但許多時候因為建立專案時就已經有包含進去了，通常很容易忽略如何從無到有的新增步驟，此篇文章特意整理相關的資訊

<!-- more -->

這篇會分兩部分，一是建立 Identity 的環境，二是如何使用 Google OAuth 的方式登入


# 前置環境設定


要新增 `Identity` 的功能到 asp.net core 的程式裡，需要在 `Startup.cs` 先做以下的設定

1. 預設前置條件，設定 Entity Framework，因為 Identity 預設需要  EF 的支援

   a. EF Core 預設已經包含在 `Microsoft.AspNetCore.All ` 的套件包內，所以不需要另外安裝

   b. 設定連線字串，儲存參數的方式有很多種，這裡先用最簡單(但不推薦)的方式處理，細節請參閱。建立一個 `appsettings.json` 檔案，並將資料庫連線字串存放在此

   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Data Source=<DB_IPAddress>;DataBase=<DBName>;Persist Security Info=True;User ID=<UserName>;Password=<UserPassword>"
     },
   }
   
   ```

   c. service 加入 EF 服務

   ```c#
   public void ConfigureServices(IServiceCollection services)
   {
         // Add framework services.
         services.AddDbContext<StreamDbContext>(options =>
             options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));
       ...
   }
   ```

   d. 建立 `StreamDbContext` ，並繼承 `IdentityDbContext<TUser>`

   ```c#
   using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
   using Microsoft.EntityFrameworkCore;
   using stream_tools.Models;
   
   namespace stream_tools
   {
     public class StreamDbContext : IdentityDbContext<ApplicationUser>
   
     {
       public StreamDbContext(DbContextOptions<StreamDbContext> options) : base(options) { }
   
     }
   }
   
   ```

   e. 使用 EF migration 更新資料表結構

   ```
   // 建立 Identity Store 所需要的資料表
   dotnet ef migrations add <migration-name>
   // 更新至資料庫
   dotnet ef database update
   ```

   f. 更新完成後，會多出以下的資料表

   ![](https://i.imgur.com/J5m4r9Y.png)

2. 在 `ConfigureServices` 的地方加入 `Identity` 的服務

   ```c#
   using Microsoft.AspNetCore.Identity;
   ...
   public class Startup
   {
       // 可取得設定檔內容
       public IConfiguration Configuration { get; set; }
       public Startup(IConfiguration configuration)
       {
           Configuration = configuration;
       }
       public void ConfigureServices(IServiceCollection services)
        {
            ...
            services.AddIdentity<ApplicationUser, IdentityRole>()
               .AddEntityFrameworkStores<StreamDbContext>()
               .AddDefaultTokenProviders();
       }
   }    
   ```

3. 建立 `ApplicationUser` Class

   ```c#
   using Microsoft.AspNetCore.Identity;
   
   namespace stream_tools.Models
   {
     public class ApplicationUser : IdentityUser
     {
   	// 資訊擴充使用
     }
   }
   
   ```

4. 在 Configure 的地方啟動服務

   ```c#
   public void Configure(IApplicationBuilder app, IHostingEnvironment env)
   {
         ...
         app.UseAuthentication();
   	  ...
    }
   ```

5. 因為需要 MVC 來提供頁面，所以也順便加入 MVC 的功能

   ```c#
   public void ConfigureServices(IServiceCollection services)
    {
        ...
        services.AddMvc();
   }    
   public void Configure(IApplicationBuilder app, IHostingEnvironment env)
   {
         ...
         app.UseMvc();
   	  ...
    }
   ```


# 設定 Google API

1. 首先前往 [https://console.developers.google.com/projectselector/apis/library](https://console.developers.google.com/projectselector/apis/library) ，開立新專案或選取舊專案

   ![](https://i.imgur.com/3d6hj5L.png)

2. 開啟 `Google+ API` 供登入使用

   ![](https://i.imgur.com/iMtIhKO.png)

3. 點選憑證，並新增 OAuth 

   ![](https://i.imgur.com/QbelfRd.png)

4. 選擇 **網路應用程式**，並填入以下資訊

   ![](https://i.imgur.com/TopW4ty.png)

5. 這裡須留意的是 已授權的重新導向 URI，Identity 預設的路由是 `signin-google` ，所以只需要替換前面的 port 號碼即可

6. 確定後會取得一份 client_id 和 secret 的資訊，我們需要將這資訊儲存到上面所建立的 `appsetting.json` 檔案內

   ![](https://i.imgur.com/JEuLonQ.png)

# 設定 Google 登入

1. 在官網的文件中，文件將 **用戶端 ID** 與 **用戶端密碼**，分別使用 `Authentication:Google:ClientId` 與 `Authentication:Google:ClientSecret`

   ```json
   {
     ...
     "Authentication:Google:ClientId": "用戶端 ID",
     "Authentication:Google:ClientSecret": "用戶端密碼"
   }
   
   ```

2. 加入新的 Authentication 方式

   ```c#
   public void ConfigureServices(IServiceCollection services)
   {      
       services.AddAuthentication().AddGoogle(googleOptions =>
       {
           googleOptions.ClientId = Configuration["Authentication:Google:ClientId"];
           googleOptions.ClientSecret = Configuration["Authentication:Google:ClientSecret"];
       });
   }      
   ```

   當然除了 google 之外，還有其他的服務可以使用，其他資訊補充在下面的參考資料內

到這邊為止，基礎設定已經完成了。現在是在頁面上要怎麼使用，Controller 的動作又是如何呢?

# Controller - View

## View

如果是使用 Razor 的方式要產生第三方登入選項的方式，其實很簡單，只要透過 `SignInManager.GetExternalAuthenticationSchemesAsync()` 的方式就可以取得有開啟的選項

```csharp
@using stream_tools.Models
@inject SignInManager<ApplicationUser> SignInManager
<form asp-action="ExternalLogin" asp-route-returnurl="@ViewData["ReturnUrl"]" method="post" class="form-horizontal">
  <div>
    <p>
      @{
        var loginProviders = (await SignInManager.GetExternalAuthenticationSchemesAsync()).ToList();
      }

      @foreach (var provider in loginProviders)
      {
        <button type="submit" class="btn btn-default" name="provider" value="@provider.Name" title="Log in using your @provider.DisplayName account">@provider.Name</button>
      }
    </p>
  </div>
</form>

```

* `loginProviders` 清單內的 provider ，內容如下

  ![](https://i.imgur.com/yhPJD5V.png)

* 所以當按下按鈕時，就會做 Form Post 的動作到 `Account/ExternalLogin` 的 Action

## Controller (重點)

```csharp
[HttpPost]
public IActionResult ExternalLogin(string provider, string returnUrl = null)
{
  // Request a redirect to the external login provider.
  var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Account", new { returnUrl });
  var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
  return Challenge(properties, provider);
}
```
* 當此 Action 接受到前面頁面 Post 動作時，就會先將登入成功後要轉址的位址轉成 Url 的方式，這裡就會回到 `Account/ExternalLoginCallback` 的地方
* `signInManager.ConfigureExternalAuthenticationProperties` 再將額外的資訊包成一個 property 後再送給 `Challenge method` 最後續的行為
* `signInManager` 是一個用來控制使用者登入的 API，文件連結已列在下面的參考文件中
* `Challenge` 是 ControllerBase 裡的方法之一，會建立出一個 `ChallengeResult` ，ChellengerResult is an [ActionResult](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.actionresult?view=aspnetcore-2.1) that on execution invokes AuthenticationManager.ChallengeAsync.
* `provider` 的值，就如上圖所顯示的，只是將 name 的值傳進來，而這裡是帶入 `Google` 
* 當執行後就會跑到Google 登入帳號的畫面，當完成 Google 帳號登入後，就會回到 `Account/ExternalLoginCallback` 的地方

```csharp
 public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null, string remoteError = null)
    {      
      if (remoteError != null)
      {
        ErrorMessage = $"Error from external provider: {remoteError}";
        return RedirectToAction(nameof(Login));
      }
     
      var info = await _signInManager.GetExternalLoginInfoAsync();
      if (info == null)
      {
        return RedirectToAction(nameof(Login));
      }

      // Sign in the user with this external login provider if the user already has a login.
      var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false, bypassTwoFactor: true);
      if (result.Succeeded)
      {
        // 使用者帳號已存在，可以直接前往目的地
        return RedirectToLocal(returnUrl);
      }
      if (result.IsLockedOut)
      {
        // 使用者帳號被鎖定
        return RedirectToAction(nameof(Lockout));
      }
      else
      {
        // If the user does not have an account, then ask the user to create an account.
        ViewData["ReturnUrl"] = returnUrl;
        ViewData["LoginProvider"] = info.LoginProvider;
        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        return View("ExternalLogin", new ExternalLoginViewModel { Email = email });
      }
    }
```

* 當登入動作完成後回到 `ExternalLoginCallback` Action 時會收到兩個資訊，一個是遠端授權的錯誤訊息，一個是登入成功後要轉址的位置
* 取得第三方授權請求的附加資訊，可透過 ` var info = await _signInManager.GetExternalLoginInfoAsync();` 的方式取得更多的資訊
  * 舉例，如果要取得 email，取得方法是 `info.Principal.FindFirstValue(ClaimTypes.Email);`
  * `ClaimTypes` 的 Enum 還有更多其他的項目可以使用
* `var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false, bypassTwoFactor: true);`
  * `ExternalLoginSignInAsync` 的方法是當透過外部驗證方式成功後，回到系統內時，執行內部的登入動作，而回傳的結果，可用來判斷該使用者的狀況是否能繼續往下走

# 參數設定

* CallbackPath: 這個參數的值是設定 Google API 在 **重新導向 URI** 的內容，預設是 `/signin-google`，如果想要改變時，可以修改這個設定

  ```csharp
  services.AddAuthentication().AddGoogle(googleOptions =>
              {
              	googleOptions.CallbackPath = new PathString("/someurl-you-want");
                  ...
              });
  ```

* Scope: 在登入 Google 帳號時，我們可以透過 Scope 設定要向登入者取得額外的資訊，設定方式是

  ```
  services.AddAuthentication().AddGoogle(googleOptions =>
              {
              	googleOptions.Scope.Add('..');
                  ...
              });
  ```

  

# 結論

到這邊可以算是一個完整的第三方驗證的流程，我認為這裡的流程即使改成使用 web api 的方式，應該也是可以做到一樣的效果，這部分等我實作出來後，在分享出來



# 參考資料

* [[.NET Core] Web MVC 001 - program.cs](https://blog.kevinyang.net/2017/05/15/core-web-mvc-001/)
* [安全存放裝置的開發工作中 ASP.NET Core 應用程式密碼](https://docs.microsoft.com/zh-tw/aspnet/core/security/app-secrets?view=aspnetcore-2.1&tabs=windows)
* [EF Core .NET Command-line Tools](https://docs.microsoft.com/zh-tw/ef/core/miscellaneous/cli/dotnet)
* [Introduction to Identity on ASP.NET Core](https://docs.microsoft.com/zh-tw/aspnet/core/security/authentication/identity?view=aspnetcore-2.1&tabs=visual-studio%2Caspnetcore2x)
* [identity-without-entity-framework](https://markjohnson.io/articles/asp-net-core-identity-without-entity-framework/)
* [ASP.NET Core 中的 Facebook、Google 及外部提供者驗證](https://docs.microsoft.com/zh-tw/aspnet/core/security/authentication/social/?view=aspnetcore-2.1)
* API DOC
  * [Source Code](https://github.com/aspnet/Security/tree/dev/src/Microsoft.AspNetCore.Authentication.Google)
  * [SignInManager API Doc](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.signinmanager-1?view=aspnetcore-2.1)
  * [ChallengeResult](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.challengeresult?view=aspnetcore-2.1)



