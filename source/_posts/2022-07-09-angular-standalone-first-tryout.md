---
layout: post
title: '[Angular] Standalone Component 第一次接觸'
comments: true
typora-root-url: 2022-07-09-angular-standalone-first-tryout
typora-copy-images-to: 2022-07-09-angular-standalone-first-tryout
date: 2022-07-09 09:13:53
categories: Angular
tags: Angular
---

Angular standalone component 功能在 v14 版本推出 developer preview version (表示不建議使用在 production 環境上)，還是可以先玩弄一下，稍微感覺未來可能的開發模式跟架構會有怎樣的選擇出現 

<!-- more -->

##  基本語法

standalone component 的寫法很簡單，在 component 的 decorator 內新增 `standalone: true` 即可完成設定

```typescript
@Component({
  standalone: true,
  selector: 'photo-gallery',
  imports: [ImageGridComponent],
  template: `
    ... <image-grid [images]="imageList"></image-grid>
  `,
})
export class PhotoGalleryComponent {
  // component logic
}
```

一旦設定成 standalone component ，過往設定在 `NgModule` 的 imports 的其他 `NgModules` 都需要在這邊設定，也包含這 component 內使用的其他 components

而在路由設定這邊新增 `loadComponent` 的功能

```typescript
export const ROUTES: Route[] = [
  {path: 'admin', loadComponent: () => import('./admin/panel.component').then(mod => mod.AdminPanelComponent)},
  // ...
];
```

`loadChildren` 也支援讀取另外一組 route setting

```typescript
export const ROUTES: Route[] = [
  {path: 'admin', loadChildren: () => import('./admin/routes').then(mod => mod.ADMIN_ROUTES)},
  // ...
];

// In admin/routes.ts:
export const ADMIN_ROUTES: Route[] = [
  {path: 'home', component: AdminHomeComponent},
  {path: 'users', component: AdminUsersComponent},
  // ...
];
```



`main.ts` 也可以直接啟動 standalone component

```typescript
import {bootstrapApplication} from '@angular/platform-browser';
import {PhotoAppComponent} from './app/photo.app.component';

bootstrapApplication(PhotoAppComponent);
```



## Dive in a little bit

main.ts

```typescript
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/home/home.component';

import { environment } from './environments/environment';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'demo',
    loadComponent: () =>
      import('./app/demo/demo.component').then((m) => m.DemoComponent),
  },
];

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(RouterModule.forRoot(routes))],
});

```

透過這種方式完全不使用 `NgModule` 來啟動一個 Angular App，而在近期的 AngularAir 看到這樣的嘗試

```typescript
// main.ts
import { enableProdMode } from '@angular/core';
import { AppComponent } from './app/app.component';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

AppComponent.bootstrap();

```

```typescript
// app.component.ts
import { CommonModule } from '@angular/common';
import { Component, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { routes } from './routes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class AppComponent {
  static bootstrap() {
    bootstrapApplication(this, {
      providers: [importProvidersFrom(RouterModule.forRoot(routes))],
    });
  }
 ...
}

```

這改法大幅的降低 main.ts 的複雜度，同時也增加了不少彈性

那 Provider 的部分該怎麼處理，好消息是就跟有 `NgModule` 時的用法是一樣的。





## 參考資料

- [Getting started with standalone component](https://angular.io/guide/standalone-components)
- [範例程式碼](https://stackblitz.com/edit/angular-ivy-2kth3b?file=src%2Fmain.ts,src%2Fapp%2Fapp.component.ts)
