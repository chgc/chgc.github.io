---
layout: post
title: '[Angular] App-Shell'
comments: true
date: 2018-07-19 10:42:06
categories: Angular
tags: Angular
---

Angular CLI 在後期的版本，提供了建立 `app shell` 的功能，何謂 `app shell` ，基本上就是透過 universal 的功能，先將首頁的畫面，產生靜態的 DOM 內容並新增到 `index.html` 的頁面中，並透過 `app-shell component` (只是單純的 component) 顯示等待訊息。

為什麼要這樣子做，主要理由是讓使用者可以在第一時間得知他所開啟的網站，是有在執行的

<!-- more -->

那 Angular CLI 如何透過指令的方式，來完成建置 app shell 的效果呢?

# 操作步驟

為了方便展示，這裡我們重新建立一個全新的專案

```
ng new shell-demo --routing
```

當建立完成時，在執行以下的指令來新增 app-shell 的功能

```
ng g app-shell --client-project <project name> -universal-project server-app
```

* <project name> 需要換成自己要的專案名稱，已這裡的範例是 shell-demo

 ## 檢視變更檔案

* `angular.json`

  ```json
  "server": {
      "builder": "@angular-devkit/build-angular:server",
      "options": {
          "outputPath": "dist/shell-demo-server",
          "main": "src/main.server.ts",
          "tsConfig": "src/tsconfig.server.json"
      }
  },
  "app-shell": {
      "builder": "@angular-devkit/build-angular:app-shell",
      "options": {
          "browserTarget": "shell-demo:build",
          "serverTarget": "shell-demo:server",
          "route": "shell"
      }
  }
  ```

  在所指定的 client-project 下新增這兩個指令，而在之後的建置指令，會執行 `app-shell` 這個指令

  在 app-shell 指令內，分別設定了 `browserTarget` 和 `serverTarget` 要執行的指令是什麼

  * 指定執行命令的方式 `<projectName>:<architect 內的 指令名稱>:<command 內的 configuration>` 例如 `shell-demo:build`

* `main.ts` 修改 `bootstrap` 的時機點，會等 index.html 頁面內容讀取完成後再啟動 Angular App

  ```typescript
  document.addEventListener('DOMContentLoaded', () => {
    platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.log(err));
  });
  ```

* `app.module.ts` 新增 universal 相關的 NgModule 設定

  ```typescript
   imports: [
      BrowserModule.withServerTransition({ appId: 'serverApp' }),
      AppRoutingModule,
      RouterModule
    ],
  ```

比較重要的檔案變更就是上述的這幾的檔案

## 建置 app-shell 的方式

由於內建的 cli 指令並沒有針對建置 app-shell，所以必須透過 `ng run` 的方式來執行

```
ng run shell-demo:app-shell
```

* ng run 後面所接的指令，如我上面所描述的指令格式，例如 `ng build`，對等同於 `ng run shell-demo:build`

當執行完成後，在 `dist` 的資料夾可以看到兩個資料夾，一個是原本就會產生的網站資料夾，另外一個是 universal 用的資料夾

![](https://i.imgur.com/zmlf9JU.png)

在輸出的 `index.html` 的內容，就會看到首頁的靜態 DOM 內容，這裡所產生的內容是從 `app.module` 所定義的 `bootstrap` component 來的

![](https://i.imgur.com/ID85bhx.png)

當執行起來時，使用者就可以很快速地看到網站內容，然後再等 Angular 的應用程式被啟動起來。就對使用者來說，使用體驗就會變好了

## 執行結果

![](https://i.imgur.com/ABjKM7S.gif)

# 結論

透過 App-shell 對於使用者體驗，是有某種程度上的幫助，畢竟一開始就可以看到一些網站內容，而不是一個 loading 的畫面。



