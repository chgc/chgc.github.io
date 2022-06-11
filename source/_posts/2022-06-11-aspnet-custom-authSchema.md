---
layout: post
title: '[.NET Core] 自訂 Authentication handler'
comments: true
typora-root-url: 2022-06-11-aspnet-custom-authSchema
typora-copy-images-to: 2022-06-11-aspnet-custom-authSchema
date: 2022-06-11 11:22:37
categories: '.NET Core '
tags: '.NET Core '
---

asp.net core 有很多 authentication 的方法，但有時候想要自訂驗證規則時，該怎麼做，跟著官方文件做完一次後，將自己理解的版本筆記下來

<!-- more -->

# 自訂 Authentication

一開始在思考這題時，繞了幾個圈，但理解後其實不難，就是實做一個 `AuthenticationHandler`

```csharp
public class ApiAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
     
        public ApiAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock) : base(options, logger, encoder, clock)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // 回傳驗證結果
        }
    }
```

實做完上面後，就可以回到 `program.cs` 內做註冊的動作

```csharp
builder.Services.AddAuthentication("Basic")
    .AddScheme<AuthenticationSchemeOptions, ApiAuthHandler>("Basic", o => { });    
    .AddScheme<AuthenticationSchemeOptions, AnotherApiAuthHandler>("SchemaName", o => { });
```

而這裡也允許新增多組 schema，在 API Controller 的地方也可以指定要使用哪一組 schema 做驗證

```csharp
[Authorize(AuthenticationSchemes = "SchemaName")]
public void SomeFunction() { }
```





# 參考文件

- [MyNinjaAuthHandler.cs](https://github.com/referbruv/CustomSchemeNinja/blob/main/CustomSchemeNinjaApi/Providers/AuthHandlers/MyNinjaAuthHandler.cs)
- [Basic Authentication](https://jasonwatmore.com/post/2019/10/21/aspnet-core-3-basic-authentication-tutorial-with-example-api#basic-authentication-handler-cs)

