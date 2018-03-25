---
layout: post
title: '[.NET Core] Blazor 基本介紹'
comments: true
date: 2018-03-25 09:21:13
categories: .NET Core
tags: .NET Core
---

上一篇介紹了如何安裝 Blazor 範本，這一篇就來分享基本的 Blazor 的檔案及語法結構

<!-- more -->

# 新增 Blazor 專案

1. 新增 `ASP.NET Core Web 應用程式`

   ![](https://i.imgur.com/dqNpI7J.png)

2. 選擇 `Blazor` 類型專案，確定新增

   ![](https://i.imgur.com/cabv0c3.png)

3. 第一次執行

   ![](https://i.imgur.com/GeNjlF9.png)

4. 專案的檔案結構

   ![](https://i.imgur.com/c2sAdCB.png)




# 專案檔案說明

## program.cs

```csharp
class Program
    {
        static void Main(string[] args)
        {
            var serviceProvider = new BrowserServiceProvider(configure =>
            {
                // Add any custom services here
            });

            new BrowserRenderer(serviceProvider).AddComponent<App>("root-app");
        }
    }
```

* ` new BrowserRenderer(serviceProvider).AddComponent<App>("root-app");` 這裡是啟動點，用來設定要將 `BlazorComponent` 產生在 `index.html` 上的哪一個節點，預設的 element 是 `app`，這是可以依 `index.html` 的設定做改變

  ![](https://i.imgur.com/R1btWD1.png)

* `AddComponent<App>` 裡的 `App` 是對應到起始 `BlazorComponent`，檔名即 component 物件名稱

  ![](https://i.imgur.com/EQE9Kqb.png)

* `App2.cshtml` 內的檔案內容，只是一個類似 `<router-outlet>` 的東西，用來顯示對應路由要顯示的 `BlazorComponent`，根據該檔案的內容，之後還會做調整

  ```csharp
  <!--
      Configuring this here is temporary. Later we'll move the app config
      into Program.cs, and it won't be necessary to specify AppAssembly.
  -->
  <Router AppAssembly=typeof(Program).Assembly />

  ```

## Counter.cshtml

 ```csharp
@page "/counter"
<h1>Counter</h1>

<p>Current count: @currentCount</p>

<button @onclick(IncrementCount)>Click me</button>

@functions {
    int currentCount = 0;

    void IncrementCount()
    {
        currentCount++;
    }
}

 ```

* `@page "/counter"` ，`@page` 是用來設定此頁面的路由位置
* `@functions{ ... }` 是頁面功能程式碼撰寫的位置
* `@currentCount` 會對應寫在 `@functions` 內的 `property` 變數
* `@onclick` 是 blazor 對應原生 JavaScript onClick 的寫法，內設定要觸發的 `method`

## Pages/_ViewImports.cshtml

頁面的 `Layout` 會依 `_ViewImports.cshtml` 的設定

```csharp
@layout MainLayout
```

* `@layout` 設定要使用的 Layout 頁面

## Shared/MainLayout.cshtml

```csharp
@implements ILayoutComponent

<div class='container-fluid'>
    <div class='row'>
        <div class='col-sm-3'>
            <NavMenu />
        </div>
        <div class='col-sm-9'>
            @Body
        </div>
    </div>
</div>

@functions {
    public RenderFragment Body { get; set; }
}

```

* `@implements ILayoutComponent` 標示此檔案為實作 `ILayoutComponent`，可被用來設定 `@layout`
* `<Navmenu>` 載入 `NavMenu.cshtml` Component
* `@Body` 是用來顯示 `BlazorComponent` 的地方

## FetchData.cshtml

```csharp
@page "/fetchdata"
@inject HttpClient Http

<h1>Weather forecast</h1>

<p>This component demonstrates fetching data from the server.</p>
...
```

* `@inject` 注入要使用的 service ，Dependency Injection 的用法

 ## Pages/Index.cshtml

```csharp
@page "/"

<h1>Hello, world!</h1>

Welcome to your new app.

<SurveyPrompt Title="How is Blazor working for you?" />
```

* `<SurveyPromt Title="....">`  裡的 `Title` 是該 Component 允許從外部設定屬性欄位

  ```csharp
  // Shared/SurveyPrompt.cshtml
  @functions
  {
      // This is to demonstrate how a parent component can supply parameters
      public string Title { get; set; }
  }

  ```

## wwwroot/Index.html

```html
<body>
    <root-app>Loading...</root-app>

    <script src="css/bootstrap/bootstrap-native.min.js"></script>
    <script type="blazor-boot"></script>
</body>
```

* `<script type="blazor-boot"></script>` 會在建置時間置換成 `<script src="_framework/blazor.js" main="BlazorApp1.dll" entrypoint="BlazorApp1.Program::Main" references="Microsoft.AspNetCore.Blazor.dll,netstandard.dll,..."></script>`



# 總結

Blazor 的語法與結構就目前看起來並不複雜，很期待之後的發展