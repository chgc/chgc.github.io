---
layout: post
title: '[Angular] Microfrontend with Module Federation 筆記'
comments: true
typora-root-url: 2021-09-12-ng-microfrontend-with-webpack-federation/
typora-copy-images-to: 2021-09-12-ng-microfrontend-with-webpack-federation/
date: 2021-09-12 13:37:26
categories: Angular
tags: Angular
---

其實這觀念在去年由 Manfred Steyer (Angular GDE) 提出來，並花很多心力在研究這一塊的作法，一年過去後因為公司上有可能會使用到這樣的情境，所以就先來研究一下，但也因為晚了一年，現在很多工具和環境上已經好很多，而且該採的雷很多前輩都踩過了，這一篇筆記就是稍微整理一下如何從無到有的將 Angular 環境給設定起來

<!-- more -->

# Requirement

- Angular 12 

# 設定

1. 建立一個空的 ng application。

   ```bash
   ng new ng-mfe --create-application=false
   ```

2. 建立一個 host (shell) application

   ```bash
   ng g application shell --routing
   ```

3. 建立一個 remote application

   ```bash
   ng g application mfe1 --routing
   ```

4. 為這兩個 application 加入 `@angular-architects/module-federation` 套件

   ```
   ng add @angular-architects/module-federation --project shell --port 5000
   ng add @angular-architects/module-federation --project mfe1 --port 3000
   ```

   1. 這時候會產生 webpack.config.js 檔案: 用來設定 remote module 使用

到這邊算是基本完成套件的安裝，接下來就是一些 module/component 的設定

1. 在 `mfe1` application 中新增一個 `FlightsModule`

   ```
   ng g m flights --project=mfe --routing
   ```

2. 設定 `webpack.config.js`

   ```javascript
   const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
   const mf = require("@angular-architects/module-federation/webpack");
   const path = require("path");
   const share = mf.share;
   
   const sharedMappings = new mf.SharedMappings();
   sharedMappings.register(
     path.join(__dirname, '../../tsconfig.json'),
     [/* mapped paths to share */]);
   
   module.exports = {
     output: {
       uniqueName: "mfe1",
       publicPath: "auto"
     },
     optimization: {
       runtimeChunk: false
     },   
     resolve: {
       alias: {
         ...sharedMappings.getAliases(),
       }
     },
     plugins: [
       new ModuleFederationPlugin({
         
           // For remotes (please adjust)
           name: "mfe1",
           filename: "remoteEntry.js",
           exposes: {
             "./flightModules": "./projects/mfe1/src/app/flights/flights.module.ts",
           },
           
           shared: share({
             "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
             "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
             "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
             "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
   
             ...sharedMappings.getDescriptors()
           })
           
       }),
       sharedMappings.getPlugin()
     ],
   };
   
   ```

   - line 28: host 載入時的 `remoteName`
   - line 29: webpack 要產生的 file name
   - line 31: expose 的 `module` 名稱及對應的 module 檔案

3. 在 host (shell) 的路由檔設定要 `lazyloading` 路徑

   ```typescript
   import { loadRemoteModule } from '@angular-architects/module-federation';
   ...
   const URL = 'http://localhost:3000/remoteEntry.js';
   
   const routes: Routes = [
     { path: '', component: HomeComponent, pathMatch: 'full' },
     {
       path: 'flights',
       loadChildren: () =>
         loadRemoteModule({
           remoteEntry: URL,
           remoteName: 'mfe1',
           exposedModule: './flightModule',
         }).then((m) => m.FlightsModule),
     },
   ];
   
   @NgModule({
     imports: [RouterModule.forRoot(routes)],
     exports: [RouterModule],
   })
   export class AppRoutingModule {}
   
   ```

   - line 7 ~ 15 是標準 Lazy loading 的寫法，而 line 10 從原本的 `import` 改寫成 `loadRemoteModule` 即可載入遠端的 module 檔案
   - `remoteEmtry` 設定遠端主機位置及參考檔案，檔名為上一個步驟中所設定的檔名
   - `remoteName` 為上一步驟所設定的 `name`
   - `exposedModule` 為上一步驟所設定的 exposes 內的某一個 `key`

最後在調整一下 host 的 `AppComponent` 的 HTML 內容，例如加上連結到 flights module 等，到這邊算完成一個最小完成單位，可以將兩個 applications 跑起來後看一下執行結果

![image-20210912145552814](image-20210912145552814.png)

# 問題探討

看起來一起都很簡單，但仔細思考後，其實還有很多東西要考慮，例如各 module 間的版本如何控制、如何共用狀態、部屬的相依性等，這些都是很實際的問題，等著下一篇筆記再來研究吧



# 參考資料

- [**The Microfrontend Revolution: Module Federation with Angular**](https://www.angulararchitects.io/aktuelles/the-microfrontend-revolution-part-2-module-federation-with-angular/)



