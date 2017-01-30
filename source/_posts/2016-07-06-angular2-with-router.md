---
layout: post
title: "[Angular] Angular CLI (beta9) 手動加入Router"
comments: true
date: 2016-07-06 10:33:22
categories:  Angular
tags:  Angular
---

Angular2的Route的新版持續在開發中，目前已經到了beta階段了，可是Angular2的CLI只是單純的有更新@angular/router的版本而已，但是內建的樣版卻沒有更新，所以只好手動了。


<!-- more -->

# 基本新增步驟

1. 新增一個app.routers.ts檔案

   ```typescript
   import { provideRouter, RouterConfig } from '@angular/router';
   import { ProfileComponent } from './profile';

   export const routes: RouterConfig = [
     { path: 'profile', component: ProfileComponent },
     {
       path: '',
       redirectTo: '/profile',
     }
   ];

   export const APP_ROUTER_PROVIDERS = [
     provideRouter(routes)
   ];	
   ```

2. 手動更新 index.ts 檔案，將app.routers加入
   ```typescript
   export * from './app.routers';
   ```

3. import `APP_ROUTER_PROVIDERS` 到 main.ts裡
   ```typescript
   import { AppComponent, environment, APP_ROUTER_PROVIDERS } from './app/';
   ...
   bootstrap(AppComponent,[APP_ROUTER_PROVIDERS]);
   ```

4. 修改 app.component.html 檔案
   ``` html
   <nav>
     <a [routerLink]="['/profile']">profile</a>
   </nav>
   <router-outlet></router-outlet>
   ```

# 注意事項

因為Angular CLI(Beta9)的@Angular/Router版本目前是在alpha階段，所以文件裡面有些Router的設定有可能還不存在，例如說 ` pathMatch: 'full'` 但基本的設定方式都是沒有問題的

實際跑起來的畫面如下

![](https://farm8.staticflickr.com/7291/28040799221_43163b7050_o.png)

# 進一步的看@Angular/Router

新版的Router在讀取html/css檔案時，是採lazyLoading，表示除非到那個頁面，不然不會事先下載該檔案。(前提: 是使用systemjs的方式)請看下面的影片

[![路由切換時網路的狀況](https://img.youtube.com/vi/6OWRPws68Uw/0.jpg)](https://www.youtube.com/watch?v=6OWRPws68Uw)

# 如何將`ROUTER_DIRECTIVES`註冊成全域

為了要完成這個動作，我們需要兩個東西 'provide`, `PLATFORM_DIRECTIVES'

- provide的功能是建立一個Proivder
- PLATFORM_DIRECTIVES的功能是一個Directives容器，可以供應在專案下所有的Components可以使用
> PLATFORM_DIRECTIVES: A token that can be provided when bootstrapping an application to make an array of directives available in every component of the application.

利用上述的兩個東西，就可以在main.ts下，將`ROUTER_DIRECTIVES`給註冊到全域下
```
import { provide, PLATFORM_DIRECTIVES, enableProdMode } from '@angular/core';
...
bootstrap(AppComponent,
  [ provide(PLATFORM_DIRECTIVES,
      {
        useValue: [ROUTER_DIRECTIVES],
        multi: true
      })
  ]);
```
完成後，以後再components裡面就不用在`import { ROUTER_DIRECTIVES } from '@angular/router'`了

# 相關連結

* [官方文件](https://angular.io/docs/ts/latest/guide/router.html)
* [CLI-package.json - beta9](https://github.com/angular/angular-cli/blob/v1.0.0-beta.9/addon/ng2/blueprints/ng2/files/package.json)
* [@Agnular/Route - Changelog](https://github.com/angular/angular/blob/master/modules/%40angular/router/CHANGELOG.md)
* [API DOC- provide](https://angular.io/docs/ts/latest/api/core/index/provide-function.html)
* [API DOC- PLATFORM_DIRECTIVES](https://angular.io/docs/ts/latest/api/core/index/PLATFORM_DIRECTIVES-let.html)
* [github repo](https://github.com/chgc/demo-angular2-router)




