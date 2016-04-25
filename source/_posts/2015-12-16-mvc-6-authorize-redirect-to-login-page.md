---
layout: post
title: '[MVC 6] Authorize Redirect to Login Page'
date: 2015-12-16 13:23
comments: true
categories: "ASP.NET MVC"
tag: "MVC Core"
---
http://docs.asp.net/en/latest/security/authorization/simple.html
這裡描述怎麼設定頁面授權的方式，~~可是卻都沒有提到如果說沒授權的人要頁面轉至登入畫面的方式~~

經過網頁上的查詢及測試後. 在1.0.0-rc1-update1的版本裡，設定方式如下

1. startup.cs
```
public void ConfigureServices(IServiceCollection services)
{
    services.AddAuthentication();           
    .....
}

 public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    app.UseCookieAuthentication(options =>
    {
        options.LoginPath = "/Home/Login";
        options.AutomaticAuthenticate = true;
        options.AutomaticChallenge = true;
    });
    ....
}
```
到這裡為止就可以做出跟以前一樣遇到沒有授權的頁面就轉到登入畫面了

###參數說明

重點在於AutomaticAuthenticate 及 AutomaticChallenge 這兩個參數
他的說明如下:
1. AutomaticAuthenticate: If true the authentication middlleware alter the request user coming in. If false the authentication middleware will only provide identity when explicitly indicated by the AuthenticationScheme.
2. AutomaticChallenge: If true the authentication middleware should handle automatic challenge. If false the authentication middleware will only alter responses when explicitly indicated by the AuthenticationScheme.

這裡出現另外一個參數 AuthenticationScheme
AuthenticationScheme: The AuthenticationScheme in the options corresponds to the logical name for a particular authentication scheme. A different value may be assigned in order to use the same authentication middleware type more than once in a pipepline.

這表示在Controller裡的[Authorize]可以指定AuthenticationScheme, 就可以做出很有彈性的權限設定轉址或是其他後續動作了
```
[Authorize(ActiveAuthenticationSchemes ="abc")]
public IActionResult Index(){}
```

##update
設定頁面授權的方式在這裡 http://docs.asp.net/en/latest/security/authentication/cookie.html

### Reference
[ASP.NET 5/MVC 6 自訂使用Claim驗証](http://blueprogram.blogspot.tw/2015/12/aspnet-5mvc-6-claim.html)
