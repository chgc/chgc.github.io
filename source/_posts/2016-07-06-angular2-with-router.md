---
layout: post
title: "[Angular2] Angular CLI 手動加入Router"
comments: true
date: 2016-07-06 10:33:22
categories:  Angular
tags:  Angular2
---

Angular2的Route的新版持續在開發中，目前已經到了beta階段了，可是Angular2的CLI只是單純的有更新@angular/router的版本而已，但是內建的樣版卻沒有更新，所以只好手動了。

[參考文件](https://angular.io/docs/ts/latest/guide/router.html)

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






