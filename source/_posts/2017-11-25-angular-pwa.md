---
layout: post
title: '[Angular] 利用 Angular CLI 1.6 建立 PWA 網站'
comments: true
date: 2017-11-25 09:59:34
categories: Angular
tags: Angular
---

Angular CLI 1.6 預設內建 service-worker 功能，只要在建立時加個參數，就可以將 service-worker 設定起來，就是這麼方便，但細節設定呢?

<!-- more -->

**!! 請注意，以下的內容必須使用 Angular CLI 1.6 板材可以使用**



# 基本

當安裝完 Angular CLI  1.6 後，`ng new` 的指令參數增加了 `—service-worker` ，建立包含 service-worker 的專案所需要打的指令，可依自己的需求調整參數

```
ng new <project name> --service-worker
```

當新增這參數後，CLI會幫我們做以下的事情

1. 安裝 `npm install @angular/service-worker` 

2. `.angular-cli.json` 內開啟 `service-worker: true` 的設定

3. 在 `app.module.ts` 內註冊 `ngsw-worker.js` 檔案

   ```typescript
   ...
   import { ServiceWorkerModule } from '@angular/service-worker';
   ...
   @NgModule({
     declarations: [
       AppComponent
     ],
     imports: [
       BrowserModule,
       AppRoutingModule,
       environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : []
     ],
     providers: [],
     bootstrap: [AppComponent]
   })
   export class AppModule { }
   		
   ```

4. 建立`ngsw-config.json`檔案，`ng build —prod` 後產生的 ngsw.json 會根據這個 json 檔案內容

   ```json
   {
     "index": "/index.html",
     "assetGroups": [{
       "name": "app",
       "installMode": "prefetch",
       "resources": {
         "files": [
           "/favicon.ico",
           "/index.html"
         ],
         "versionedFiles": [
           "/*.bundle.css",
           "/*.bundle.js",
           "/*.chunk.js"
         ]
       }
     }, {
       "name": "assets",
       "installMode": "lazy",
       "updateMode": "prefetch",
       "resources": {
         "files": [
           "/assets/**"
         ]
       }
     }]
   }
   ```

   ​


service worker 只會在 `ng build —prod` 的時候被產生出來，所以就讓我們做第一次的建置

```
ng build --prod
```

![](https://c1.staticflickr.com/5/4573/38630850271_3f41c6ff70_o.png)

到這個步驟，最基本的 PWA 網站就算完成了

**注意: 請勿在 `ng server` 模式下測試 Angular Service Worker**

![](https://c1.staticflickr.com/5/4557/38574717996_000cf7d782_o.png)

![](https://c1.staticflickr.com/5/4555/37913342274_716cdc2a1a_o.png)



# 設定檔

關於 `service worker` 相關的設定項目，都可以在 `ngsw-config.json` 內設定，包含 cacheing 的方式跟時間等

```typescript

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @experimental
 */
export declare type Glob = string;
/**
 * @experimental
 */
export declare type Duration = string;
/**
 * A top-level Angular Service Worker configuration object.
 *
 * @experimental
 */
export interface Config {
    appData?: {};
    index: string;
    assetGroups?: AssetGroup[];
    dataGroups?: DataGroup[];
}
/**
 * Configuration for a particular group of assets.
 *
 * @experimental
 */
export interface AssetGroup {
    name: string;
    installMode?: 'prefetch' | 'lazy';
    updateMode?: 'prefetch' | 'lazy';
    resources: {
        files?: Glob[];
        versionedFiles?: Glob[];
        urls?: Glob[];
    };
}
/**
 * Configuration for a particular group of dynamic URLs.
 *
 * @experimental
 */
export interface DataGroup {
    name: string;
    urls: Glob[];
    version?: number;
    cacheConfig: {
        maxSize: number;
        maxAge: Duration;
        timeout?: Duration;
        strategy?: 'freshness' | 'performance';
    };
}
```

上列的介面定義檔說明了很詳細，對於 DataGroup 內的 cacheConfig strategy 有兩個可以選擇

1. freshness: network first mode
2. performance: cache first mode



# Recap

Angular CLI 1.6 版讓我們可以很容易地將 service-worker 的功能加到專案內，而 service worker 的功能不只有離線瀏覽的功能，還有 push notification 的功能，或是如何利用程式碼的方式更新 service worker cache 的內容，將在下一篇文章中說明

