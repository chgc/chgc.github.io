---
layout: post
title: '[Angular] Tree Shaking 真的有作用嗎?'
comments: true
date: 2018-11-20 13:53:16
typora-root-url: 2018-11-20-ng-treeshaking
typora-copy-images-to: 2018-11-20-ng-treeshaking
categories: Angular
tags: Angular
---

Angular 在建置輸出時，如果加上 `--prod` 時，會將所有的 bundle 做最小化還有 Tree-Shaking  的行為，將沒有使用的程式碼從 bundle 檔案中移除，但是，實際上輸出結果是否如官方所說，還有什麼細節是需要知道的嗎?

<!-- more -->

為了驗證這一個功能，將進行以下的測試，首先先準備測試環境，測試環境如下

1. 一個 lazy-loading Module，包含一個 DashComponent
2. 一個 sharedModule 包含一個 TitleComponent
3. 一個 service

# 測試項目集

## 測試項目一

這一個測試項目來測試 lazy-loading module 但是 lazy-loading 沒有設定任何的路由設定檔

* page1.module.ts  檔案
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashComponent } from './dash/dash.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DashComponent],
  imports: [CommonModule, SharedModule]
})
export class Page1Module {}
```

* shared.module.ts 檔案內容
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from './title/title.component';

@NgModule({
  declarations: [TitleComponent],
  imports: [CommonModule],
  exports: [TitleComponent]
})
export class SharedModule {}
```

* app.module.ts 檔案內容
```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { DataService } from './data.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```
* app-routing.module.ts
```typescript
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'page1', loadChildren: './page1/page1.module#Page1Module' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

為了方便辨識 Component 是否有被移出 bundle 檔案，所以在 Component 內都新增一個 name 屬性並給予 Component 名稱的文字值，經過 `ng build --prod` 後，產生了一下的檔案，並檢查了 `4.f4517b1f3405740b1d81.js` 檔案內容 (此為 lazy-loading module)

![1542694311076](1542694311076.png)

`4.f4517b1f3405740b1d81.js` 檔案內並沒有包含 `DashComponent` 的文字

![1542694407358](1542694407358.png)

這裡沒有看到 `DashComponent` 的原因是因為在 `Page1Module` 裡並沒有使用到 `DashComponent` 所以即使在 declartion 的地方有宣告，仍不會被包含到 bundle 檔案內

## 測試項目二

延續上述的情境，如果直接在 `DashComponent` 內使用 `TitleComponent`，`TitleComponent` 是否會被包含至檔案內呢?

* dash.component.html

  ```html
  <p>dash works!</p>
  <app-title></app-title>
  ```

再次執行 `ng build --prod`，並檢視輸出內容

![1542694738517](1542694738517.png)

如預期般的沒有被包含進來，因為連 `DashComponent` 都沒有，怎麼可能會有 `TitleComponent`

## 測試項目三

延續上面的環境，將 `Page1Module` 設定路由，並檢查建置後的結果

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashComponent } from './dash/dash.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DashComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashComponent
      }
    ])
  ]
})
export class Page1Module {}

```

檢視 ` 4.461b274d80afee68498a.js` 內容

![1542694930339](1542694930339.png)

![1542694976256](1542694976256.png)

我們可以看到 `TitleComponent` 與 `DashComponent` 都被包含到輸出檔案內，也十分合理。這也表示如果我們將 `<app-title>` 從 `dash.component.html` 中移除，在輸出檔案裡會看不見 `TitleComponent` 地存在的

![1542695151003](1542695151003.png)

![1542695171463](1542695171463.png)

## 測試項目四

在這個測試項目中，我們將路由設定檔拿掉，但將 `DashComponent` 註冊在 `entryComponent` 的地方，來觀察一下結果

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashComponent } from './dash/dash.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DashComponent],
  imports: [CommonModule, SharedModule],
  entryComponents: [DashComponent]
})
export class Page1Module {}
```

![1542695327617](1542695327617.png)

檢視輸出內容時，發現當 Component 註冊到 entryComponents 時，即使沒有任何人使用到該 Component，仍會被輸出

![1542695408610](1542695408610.png)

## 測試項目五

當 `SharedModule` 內的 Component 在不同的 Module 中都被使用到，該 component 程式碼會輸出成幾份? 答案: 一份

在這個測試裡，我將 `<app-title>` 同時在 `app.component.html` 與 `dash.component.html`  都有引用，根據輸出檔案的內容，只能在 `main.4a9a348ca69cdb67065f.js` 檔案內找到 `TitleComponent`

![1542695635457](1542695635457.png)

![1542695691873](1542695691873.png)

![1542695715510](1542695715510.png)

(2018/11/21 Updated) 有朋友在留言提到，如果是在兩個 lazy-loading module 裡使用 sharedModule 的 component 時 (沒有在 app.component.html 內使用到)，會被輸出至 common 的 bundle 檔案中，當然有圖有真相

![1542761970966](1542761970966.png)

![1542762028166](1542762028166.png)



## 測試項目六

Service 新的註冊方式 `provideIn` 是否真的能被 tree-shake 掉呢?

* data.service.ts

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  name = 'DataService';
  constructor() {}
}
```

首先不在任何的 component 內注入 DataService，觀察輸出後的結果

![1542696035595](1542696035595.png)

![1542696068072](1542696068072.png)

![1542696095017](1542696095017.png)

在這兩個檔案內都找不到 `DataService` 的影子，看起來真的被排除了。

## 測試項目七

這帶來另外一下一個問題，如果將 `DataSerivce` 在 `Page1Module` 時，`DataService` 會在哪裡出現呢?

* dash.component.ts

```typescript
import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css']
})
export class DashComponent implements OnInit {
  name = 'DashComponent';
  constructor(private dataService: DataService) {}

  ngOnInit() {}
}
```

![1542696529718](1542696529718.png)

![1542696555362](1542696555362.png)

![1542696573709](1542696573709.png)

`DataService` 會被註冊在 Lazy-loading Module 裡。

但當 `app.component.ts` 裡也有注入 `DataService` 時，程式碼出現的地方也會不一樣，將會出現在 `main` 的檔案中

## 測試項目八

如果在兩個不同的 lazy-loading 內都有使用到 `DataService` 時， DataService 會出現在哪裡呢? 答案是會出現在 `common` 裡

![1542697090255](1542697090255.png)

![1542697114967](1542697114967.png)

可是當在 `app.component.ts` 注入 `DataService` 時，`DataService` 又會回到 `main` 的檔案中

![1542697301193](1542697301193.png)

![1542697327260](1542697327260.png)

## 測試項目九

將 `DataService` 註冊在 `AppModule` 的 `providers` 裡，且不在任何的 component 內使用，再來看輸出結果

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { DataService } from './data.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

* data.service.ts

```typescript
import { Injectable } from '@angular/core';

@Injectable()
export class DataService {
  name = 'DataService';
  constructor() {}
}
```

建置輸出結果可以看出，不論是否有被使用，都會被輸出

![1542697487067](1542697487067.png)

![1542697517027](1542697517027.png)

## 測試項目十

在 Angular 外部寫 function 後，在 Angular component 內使用，會出現什麼事情?

```typescript
import { Component } from '@angular/core';
import { DataService } from './data.service';

function TreeShakingTest() {
  console.log('TreeShakingTest Function');
  return 'return from TreeShakingTest Function';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'treeshakingtest';

  constructor() {
    console.log(TreeShakingTest());
  }
}

```

建置後的結果為

![1542698639343](1542698639343.png)

![1542698676495](1542698676495.png)

最終的輸出結果十分有趣，直接將 function 轉換到 Angular 內部了

# 結論

這一篇文章所整理的結果，在效能調整上十分重要，我們知道 main.js 檔案算是一開始要載入的檔案，為了減少 main.js 檔案的大小，service 的註冊與使用就很小心，因為一個不小心就會增加 main.js 的檔案大小，同樣的在 app.component.html 內使用其他 component 時，也會造成 main.js 檔案變大。

另外，我們也不用多擔心 sharedModule 過多的載入會造成檔案肥大，因為如果真的沒有使用到，是不會被輸出的，可以安心使用





