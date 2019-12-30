---
layout: post
title: '[.NET Core] Angular in Clean Architecture - 學習筆記'
comments: true
typora-root-url: 2019-12-30-angular-in-cleanArchitecture/
typora-copy-images-to: 2019-12-30-angular-in-cleanArchitecture/
date: 2019-12-30 10:18:07
categories: .NET core
tags: .NET core
---

繼上一篇 [學習使用 CleanArchitecture 開發 -  筆記 1](https://blog.kevinyang.net/2019/12/27/asp-net-CleanArchitecture-note1/)，依習慣先從畫面往底層看回去，而這專案範本使用 Angular 作為前端開發框架，那就來看看裡面有哪些東西或是技巧是可以偷學的

<!-- more -->

# 學習筆記

##authorize service

這一專案的 `authorize service` 使用 `oidc-client` 來和後端 .NET Core 的 `IdentityServer` 做溝通。這一個 Library`oidc-client` 支援 OpenID Connect (OIDC)  和 OAuth2 協定的 JS library，程式碼的位置 `src/api-authoriztion/authorize.service.ts` 

* 要建立一個 `UserManager` ，需要一個 Configuration 

  ```typescript
      const response = await fetch(ApplicationPaths.ApiAuthorizationClientConfigurationUrl);
      if (!response.ok) {
        throw new Error(`Could not load settings for '${ApplicationName}'`);
      }
      const settings: any = await response.json();
      settings.automaticSilentRenew = true;
      settings.includeIdTokenInSilentRenew = true;
      this.userManager = new UserManager(settings);
  ```

  1. line 1: 跟後端要 Configuration 設定檔，回傳結果如下

     ```json
     {
     authority: "https://localhost:44312",
     client_id: "newMember.WebUI",
     redirect_uri: "https://localhost:44312/authentication/login-callback",
     post_logout_redirect_uri: "https://localhost:44312/authentication/logout-callback",
     response_type: "code",
     scope: "newMember.WebUIAPI openid profile"
     }
     ```

  2. line 8:  初始化 `UserManager`

* `UserManager` 有許多 events 可以掛 callback ([API](https://github.com/IdentityModel/oidc-client-js/wiki#events))，而這邊是針對 `userSignedOut` 的部分做了一些處理

  ```typescript
  this.userManager.events.addUserSignedOut(async () => {
        await this.userManager.removeUser();
        this.userSubject.next(null);
  });
  ```

* 關於使用者的登入及註冊都交給後端的 `ASP.NET Core Idenetity` 去處理了 (這是另外一個大坑要填)

## LoginComponent

`LoginComponent` 的目的並不是用來顯示而是負責處理相對應的行為，例如登入應該要顯示後端的登入畫面等，而因為網址會有分前端管理的跟後端管理的區別，而 Angular 內建的 Router 並沒有辦法直接導覽到非 Angular 網址的地方，所以這裡的處理方式為

```typescript
  private redirectToApiAuthorizationPath(apiAuthorizationPath: string) {    
    const redirectUrl = `${window.location.origin}${apiAuthorizationPath}`;
    window.location.replace(redirectUrl);
  }
```

這裡使用 `window.location.replace` 的目的是為了確保使用者按下返回鍵是回到正確的位置而不是 `loginComponent` 的對應網址

## LogoutComponent

* 透過 `[state]='{ local: true }'`來傳遞額外的狀態，而在程式碼內則需要從 `window.history.state` 中取得

  ```typescript
   if (!!window.history.state.local) {
       ...
   }
  ```

如果想要學習如何在後端網頁跟 Angular 間做網頁切換的， 是可以從 `LoginComponent` 和 `LogoutComponent` 學習，因為這兩個 Component 本身不做任何顯示，所有的動作在 `ngOnInit` 就被執行了



# API Service

這專案範本的 API Service 是由 `NSwag toolchain` 根據 Swagger 的 API JSON 自動產生的，這部分就看個人喜好了，但我個人的偏好是喜歡自己寫，至少程式碼看起來會乾淨很多

關於 NSwag 的資訊，可以 [參考此網站](https://github.com/RicoSuter/NSwag)



# 參考資料

* [oidc-client](https://github.com/IdentityModel/oidc-client-js)