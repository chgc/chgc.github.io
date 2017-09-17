---
layout: post
title: '[Angular]與DOTNET MVC CORE 整合'
comments: true
date: 2017-09-17 15:31:45
categories: Angular
tags:
- Angular
- .NET Core
---

.NET Core 所提供的 Angular SPA 範本，用起來都覺得卡卡的，所以只好自己來整一個給 Angular 所使用的架構，跟著以下的步驟，就可以整理出我覺得還滿意的 .NET MVC Core 的程式架構

<!-- more -->

# 操作步驟

## 建立 ASP.NET Core Web 應用程式 

首先，先用 Visual Studio 2017 建立一個  ASP.NET Core Web 應用程式

![](https://i.imgur.com/k6myBB4.png)

![](https://i.imgur.com/VsRyXAX.png)

按下【確定】建立新專案，當建立完成後，即可獲得一個已經可執行的 ASP.NET Core 的 Web 應用程式了

![](https://i.imgur.com/QGTO1hG.png)

## 建立 Angular 專案

打開命令視窗，並切換至專案目錄下

![](https://i.imgur.com/bEBfa3c.png)

執行 `ng new clientApp` 命令，透過 `Angulra CLI` 的方式將 Angular 專案建立起來

![](https://i.imgur.com/T5hqm1I.png)

 建立完成後即可在 Visual Studio 的專案下看到剛剛所建立的 clientApp 資料夾

## 修改 .angular-cli.json

由於 Angular 的專案希望是由 MVC 這邊顯示，所以在建置的過程中，需要將 `.angular-cli.json` 內的設定做些微的調整

1. 修改輸出路徑
2. 增加 deployUrl
3. 產生一個 script.html，用來接受 CLI 建置後的檔案路徑

```json
"apps": [
    {
      "root": "src",
      "outDir": "../wwwroot/dist",
      "deployUrl": "/dist/",
      "assets": [
        "assets",
        "favicon.ico"
      ],
      "index": "script.html",
      "main": "main.ts",
      "polyfills": "polyfills.ts",
      "test": "test.ts",
      "tsconfig": "tsconfig.app.json",
      "testTsconfig": "tsconfig.spec.json",
      "prefix": "app",
      "styles": [
        "styles.css"
      ],
      "scripts": [],
      "environmentSource": "environments/environment.ts",
      "environments": {
        "dev": "environments/environment.ts",
        "prod": "environments/environment.prod.ts"
      }
    }
  ],
```

## 修改 app.module.ts

由於啟動的 component 不一定會存在顯示頁面上，所以必須在 app.module.ts 的地方調整一下啟動方式

1. 先將 AppComponent 從 bootstrap 區塊移動到 entryComponents 的地方

   ```typescript
   @NgModule({
     declarations: [AppComponent, HomeComponent, EmptyComponent],
     imports: [BrowserModule, RouterModule.forRoot(routes)],
     entryComponents: [AppComponent]
   })
   ...
   ```

   ​

2. 在 AppModule Class 內新增 ngDobootstrap 函式

   ```typescript
   ngDoBootstrap(app: ApplicationRef) {
         if (document.querySelector('app-root')) {
           app.bootstrap(AppComponent);
         }
     }
   ```

   ​

## 修改 _layout.cshtml

將在 `.angular-cli.json` 所設定輸出的 html 檔案加入到 `_layout.cshmtl` 內

```html
@Html.Partial("~/wwwroot/dist/script.html")
```

## 修改 Startup.cs

新增一條新的路由給 Angular 使用

```csharp
 app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute("spa-fallback", new { controller = "Home", action = "Angular" });
            });
```

## 新增 Home/Angular 

在 `HomeController` 內新增 Angular Action

```csharp
 public IActionResult Angular()
 {
   return View();
 }
```

並將相對應的 View 檔案也建立起來，並新增 Angular 的 root component 

```html
<app-root></app-root>
```

基本上經這個幾個步驟的設定，已經將 Angular 的專案整合到 ASP.NET Core Web 專案內了



# 路由

關於路由部分，由於 Angular 與 MVC 本身都有自己的路由系統，而這兩個系統都會作用，所以要稍微留意

通常一個頁面有可能是純的 Razor 頁面，或是 Angular 所 render 的頁面，當 MVC 的路由系統找不到時，就會導向 Home/Angular 的頁面，這時候 Angular 的路由機制就會接手處理，一個頁面只有一種產生方式還算是單純

但如果同一個網址，後端與前端都有符合條件的路由時，又該怎麼辦，在這情形下有分兩種處理方式

1. 啟動 app-root 後再由此產生對應的 component
2. 直接使用 component



##啟動 app-root 後再由此產生對應的 component

例如 ~/home/about 頁面內，在前端的路由檔內也有對應的設定

```typescript

const routes: Routes = [
  { path: 'dash', loadChildren: 'app/dash/dash.module#DashModule' },
  { path: 'home/about', component: HomeComponent },
  { path: '**', component: EmptyComponent }
];
```

```html
<h1>About</h1>
<app-root></app-root>
```

這樣的設定方式，顯示結果如下

![](https://i.imgur.com/zgi1bJa.png)



##直接使用 component 

直接使用 component 時，就必須將該 component 註冊到 `entryComponents` 內，並於 `ngDoBootstrap` 時判斷是否有該 element的存在，假設在 Home/Index 頁面有一個 `<app-menu></app-menu>` 的 element，那就需要將 `MenuComponent` 註冊到 `entryComponents` 的區塊內

```html
Index Page
<app-menu></app-menu>
```

App.Module.ts 檔案需要調整的內容如下

```typescript
@NgModule({
  declarations: [AppComponent, HomeComponent, EmptyComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), MenuModule],
  entryComponents: [AppComponent, MenuComponent]
})
export class AppModule {  
  ngDoBootstrap(app: ApplicationRef) {
      if (document.querySelector('app-root')) {
        app.bootstrap(AppComponent);
      }
      if (document.querySelector('app-menu')) {
        app.bootstrap(MenuComponent);
      }
    });
  }
}
```

由於這樣子的設定方式，當需要動態顯示的 Components 一多時，就會變得很難管哩，所以稍微調整一下寫法，讓後續的新增動作簡化些

```typescript
const entryComponents = [AppComponent, MenuComponent];

const routes: Routes = [
  { path: 'dash', loadChildren: 'app/dash/dash.module#DashModule' },
  { path: 'home/about', component: HomeComponent },
  { path: '**', component: EmptyComponent }
];

@NgModule({
  declarations: [AppComponent, HomeComponent, EmptyComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), MenuModule],
  entryComponents: [...entryComponents]
})
export class AppModule {
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}
  ngDoBootstrap(app: ApplicationRef) {
    entryComponents.forEach((component: any) => {
      const factory = this.componentFactoryResolver.resolveComponentFactory(component);
      if (document.querySelector(factory.selector)) {
        app.bootstrap(factory);
      }
    });
  }
}

```

* componentFactoryResolver : 會將 Component Type 建立成 componentFactory 以供後續使用
* ApplicationRef.bootstrap 接受 componentFactory 或是 Type 的方式啟動



# 結語

基本上到這裡的設定算是很基本的設定方式，這樣的整合方式可以說是 MPA (Multi-Page Application) 與 SPA (Single Page Application ) 的整合，對於開發專案時的彈性是很大的，而且也可以避免一些前後端分離要留意的點，例如 API CORS 的問題

如果要顯示的頁面很簡單，可以直接使用 Razor 的方式完成，如果要處理的頁面使用者操作比較複雜，這時候使用 Angular 的方式來處理頁面動作，可以很漂亮的完成工作。

但是要留意的地方，這個架構只是眾多解決方案的其中一個，所以要仔細評估各專案的性質，選擇最適合的架構，開發起來會省很多力氣



# 參考資料

* [GitHub Repo](https://github.com/chgc/coremvc_angular_new_structure)