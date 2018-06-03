---
layout: post
title: [ASP.NET Core] Identity - Part 2 整合 firebase 的登入驗證服務
comments: true
date: 2018-06-03 22:00:50
categories: '.NET Core'
tags: '.NET Core'
---

上一篇文章介紹了 Google 登入的行為，但是如果遇到前後端分離的狀況，似乎就有點不適合了，聽說 firebase 這登入的功能與前端整合的不錯，是否能透過 firebase 來完成呢? 

<!-- more -->

答案是**可以**的，透過 JWT Token 的驗證模式就可以達到我們所需的功能，相關的運作流程可參考此圖

![](https://i.imgur.com/SG1wqqd.png)

(圖片來自 https://blog.markvincze.com/secure-an-asp-net-core-api-with-firebase/)

# 前端設定

當透過 firebase 登入成功後，我們可以取得 `idToken`，(注意，不是 accessToken)。如果是透過 `AngularFireAuth` 套件登入時，可以透過以下的方式取得

```typescript
this.afAuth.idToken.subscribe(token => {
      this.idToken = token;      
});
```

當然也需要將這一個 token 隨著每一次的 http request 送出到 api 端供驗證使用，可以建立一個 `HttpInterceptor` 來處理這一件事情

```typescript
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.authService.idToken}`
      }
    });
    return next.handle(request);
  }
}
```

也需要將 `HttpInterceptor` 註冊到 `AppModule` 下，這裡需要注意的是，`HttpClientModule` 只能在 Root Module 註冊一次，不然 `Httpinterceptor` 會失效

```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [
   ...
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

```

# 後端設定

後端的設定其實還蠻容易的，因為有人已經將要設定的部分包裝成一個 Extension 套件，只要安裝並在 `Startup.cs` 內設定就可以完成了，操作步驟如下

* 安裝 套件

  ```
  Install-Package AspNetCore.Firebase.Authentication
  // 或是
  dotnet add package AspNetCore.Firebase.Authentication
  ```

* 在 `Startup.cs` 內新增

  ```c#
  public void ConfigureServices(IServiceCollection services)
  {
    ...
    var FirebaseAuthentication_Issuer = "https://securetoken.google.com/<firebase project id>";    
    var FirebaseAuthentication_Audience = "<firebase project id>";
    services.AddFirebaseAuthentication(FirebaseAuthentication_Issuer,
                                       FirebaseAuthentication_Audience);
  }
  
  public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
  {
       ...
        app.UseAuthentication();
  }
  ```

* 注意:   `app.UseAuthentication()` 必須在 `app.UseMvc()` 之前

到這邊就已經完成了整個的驗證設定了，在 `Web API` 的部分，與一般的設定是相同的，在需要控管的 API 前面加上 `[Authorize] ` 就可以了

## 取得Token資料

如何從 Token 內取得資訊呢，以下提供幾個取得資料的範例

```c#
var tokenInfo = HttpContext.User;

var uid = tokenInfo.FindFirst("user_id");
var name = tokenInfo.FindFirst("name");
var email = tokenInfo.FindFirst(ClaimTypes.Email);
```

可以透過 debug 的模式去看 `HttpContext.User.Claims` 內所包含的資訊，這些資訊應該會與前端傳來的 token 資訊差不多，那這時就可以透過 `findFirst` 的方法取得資料，取出來的只是一個資料物件，真正的值需要在用 `.Value` 來取得，例如 `email.Value`



# Recap

透過第三方與各大平台進行第三方的登入驗證，真的很簡單又快速。如果想要再跟 Identity 做整合的話，也是可以快速結合。提供此方法給大家參考看看

下列的參考資料的第一篇文章的做法，不知道哪裡設定上有問題，一直會取得 401 的錯誤，而單純的使用套件就過了。但文章內的其他概念說明是可以閱讀的



# 參考資料

* [Secure an ASP.NET Core api with Firebase](https://blog.markvincze.com/secure-an-asp-net-core-api-with-firebase/)
* [AspNetCore.Firebase.Authentication](https://bitbucket.org/RAPHAEL_BICKEL/aspnetcore.firebase.authentication)