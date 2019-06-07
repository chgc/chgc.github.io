---
layout: post
title: '[Angular] Web worker'
comments: true
typora-root-url: 2019-06-07-angular-web-worker/
typora-copy-images-to: 2019-06-07-angular-web-worker/
date: 2019-06-07 10:18:40
categories: Angular
tags: Angular
---

Angular CLI 8 提供建立 web worker 的指令，這一個指令能幫助我們建立相關的檔案及修正相關要調整的設定，剩下的就是功能實作及在何處使用 web worker 了。 

Web worker 是什麼?  我們都知道 JavaScript 基本上是一個單執行緒的語言，web worker 可以讓我們多開一條執行緒，這樣子的好處就是可以將高計算的工作放到 worker 內運算，善用現代電腦的強大硬體。

<!-- more -->

# 概述

Web Worker 一旦被建立起來後，就會一直運行，所以在使用上要留意關閉的時機點，避免資源浪費，Web Worker 可以讓我們多開戰場，但還是有其使用上的限制，有以下幾點需要留意的

1. **必須來至相同的網址**:  web worker 的程式不能跨網域的讀取
2. **DOM操作限制**: 
   1. 不能使用:  `doucment`、`window`、`parent`  物件
   2. 可以使用: `navigator` 、`location`
3. **溝通**: `Worker` 與 `Main Thread` 不能直接溝通，必須透過 `Message` 來溝通
4. **腳本限制**: 不能使用 `alert()` 和 `confirm()` 但可以使用 `XMLHttpRequest` 
5. **檔案限制**: 不能讀取本機檔案 (`file://`)，但可以讀取網路上的

# 基本用法

## Main Thread

### 建立

```typescript
const worker = new Worker('worker.js')
```

### 傳遞訊息

```typescript
worker.postMessage(data);
```

`postMessage` 就是 `Main Thread` 與 `Worker` 間傳遞訊息的方法

### 接受訊息

```typescript
worker.onmessage = (event)=> {
    // code here
}
```

### 關閉

```typescript
worker.terminate();
```

### Worker 例外狀況處理

```typescript
worker.onerror = (error)=>{
    // handle exception here
}
```



## Worker

### 接受訊息

```typescript
saddEventListener('message', ({ data }) => {
    // code here
});
```

### 傳送訊息

```typescript
 postMessage(data);
```

透過 `postMessage` 的方法可以從 `worker` 傳送訊息到 `Main Thread` 

### 引用 Library

在 worker 內一樣可以使用 JavaScript Library, 引用方式如下

```typescript
importScripts('script.js');

importScripts('script1.js', 'script2.js');
```

### 錯誤處理

```typescript
addEventListener('error', function (event) {
  // handle exception here
});
```

### 關閉

Worker 也可以自我關閉

```typescript
close();
```



# Angular 用法

## 建立 worker 檔案

透過 Angular CLI 可以快速的建立及設定相關的環境，指令是

```
ng g webWorker <worker-name>
```

該指令會做以下的幾件事情

1. 新增 `<worker-name>.worker.ts` 檔案
2. 新增 `tsconfig.worker.json` 檔案
3. 更新  `tsconfig.app.json` 檔案，排除 `worker.ts` 檔案
4. 更新 `angular.json` 檔案，新增讀取 worker 相關的設定

 ## 使用 Web Worker

在 Angular 內不論是 component 或是 service 都可以使用，基本使用方式為

```typescript
 if (typeof Worker !== 'undefined') {
      const worker = new Worker('./my-worker.worker', { type: 'module' });
	 // 監聽訊息
     // 不使用 rxjs
      worker.onmessage = ({ data }) => {        
        console.log('got message back:', data);
      };
 
     // 使用 rxjs
      fromEvent<any>(worker, 'message').subscribe(({ data }) => {
        console.log('rxjs version:', data);
      });

      
      worker.postMessage('Hello');
    }
```

* line 2: 建立 worker，第二個參數可以設定以下的項目 (Optional)
  * **type**: 指定建立的類型， 預設為 `classic` ，可設定的選項是 `classic` 和 `module`
    * 設定為 `module` 類型時 ，可以使用 `import {} from xxx` 語法
  * **credentials**: 指定 `credentials` 類型，可設定的選項有 `omit` 、`same-origin`、`include`，如果 `type` 的設定為 `classic` 時，此設定為 `omit` (不需要 credentials)
  * **name**: 設定 workder 名稱，通常使用於 Debugging 時期 (IE、Safari 不支援)
* line 5~12: 兩種監聽 `Worker` 傳回訊息的方式
  * 基本寫法
  * 使用 rxjs 的方式
* line 15: 送訊息到 worker

# 應用範例

假設我想要做一個定期撈資料的功能，這一個功能雖然可以在 service 內寫 timer 定期去完成。如果想要放到 web worker 內，又該如何完成了，又不能再 web worker 內使用 `httpClient` 的物件。

這裡有幾個選擇，既然可以使用 `import ` 的方式載入第三方的套件，這裡就用 rxjs 內的 ajax 物件來做示範

* my.worker.ts

```typescript
/// <reference lib="webworker" />
import { takeUntil, concatMap } from 'rxjs/operators';
import { timer, Subject } from 'rxjs';
import { ajax } from 'rxjs/ajax';

const destory$ = new Subject();
const queryGithub = () =>
  ajax.getJSON('https://api.github.com/users?per_page=5');

const longPolling = () =>
  timer(1000, 1000).pipe(
    concatMap(() => queryGithub()),
    takeUntil(destory$)
  );

addEventListener('message', ({ data }) => {
  switch (data) {
    case 'start':
      longPolling().subscribe(value => postMessage(value));
      break;
    case 'stop':
      destory$.next();
      break;
  }
});

```

* app-component.ts

```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="start()">start</button>
    <button (click)="stop()">stop</button>
  `
})
export class AppComponent implements OnInit {
  title = 'ngWorker';
  private worker: Worker;

  ngOnInit() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('./my.worker', { type: 'module' });
      // 監聽訊息
      this.worker.onmessage = ({ data }) => {
        console.log('Data:', data);
      };
    }
  }

  start() {
    if (!this.worker) {
      return;
    }
    this.worker.postMessage('start');
  }

  stop() {
    if (!this.worker) {
      return;
    }
    this.worker.postMessage('stop');
  }
}

```



# Web Worker 與 Service Worker 的差異

以下兩張圖快速解釋 Web Worker 與 Service Worker 各自負責的事情

## Web Worker

![web-worker](web-worker.jpg)

## Service Worker

![service-worker](service-worker.jpg)