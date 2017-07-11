---
layout: post
title: '[Angular]angular.io官網程式碼學習筆記006'
comments: true
date: 2017-07-11 11:19:14
categories: Angular
tags: Angular
---

最近很多人在瘋 Angular 測試，那官網程式學習筆記006 就來看官方是怎麼寫測試，這次只會先看 Angular Team 是怎麼測試service 類的程式碼

<!-- more -->

# 研究對象

`document.service.spec.ts` 是這次研讀的對象，這是一個單純的 service，他的功能很簡單 (程式行數 100 行內)，就是將文件顯示到畫面上。

`document.service.ts` 的程式碼

```typescript
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { DocumentContents } from './document-contents';
export { DocumentContents } from './document-contents';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';

...

@Injectable()
export class DocumentService {

  private cache = new Map<string, Observable<DocumentContents>>();

  currentDocument: Observable<DocumentContents>;

  constructor(
    private logger: Logger,
    private http: Http,
    location: LocationService) {
    // Whenever the URL changes we try to get the appropriate doc
    this.currentDocument = location.currentPath.switchMap(path => this.getDocument(path));
  }
  ...
}
```

* 這一個 service 有注入 3 個東西，`Logger`、`Http`、`LocationService` ，這些在測試程式碼內也是需要被處理的

#  spec

## 初始化

Angular Team 為了這個 `document.service`  另外寫了兩個 function 來建立要測試的實體

```typescript
function createInjector(initialUrl: string) {
  return ReflectiveInjector.resolveAndCreate([
      DocumentService,
      { provide: LocationService, useFactory: () => new MockLocationService(initialUrl) },
      { provide: ConnectionBackend, useClass: MockBackend },
      { provide: RequestOptions, useClass: BaseRequestOptions },
      { provide: Logger, useClass: MockLogger },
      Http,
  ]);
}

function getServices(initialUrl: string = '') {
  const injector = createInjector(initialUrl);
  return {
    backend: injector.get(ConnectionBackend) as MockBackend,
    locationService: injector.get(LocationService) as MockLocationService,
    docService: injector.get(DocumentService) as DocumentService,
    logger: injector.get(Logger) as MockLogger
  };
}

describe('DocumentService', () => {

  it('should be creatable', () => {
    const { docService } = getServices();
    expect(docService).toBeTruthy();
  });
  ...
}
```

* 利用 `ReflectiveInjector` 建立 `Injector`，當建立 `Injector` 時，也同時會處理 DI 的部分

* 透過 `Injector.get` 的方式取得 `provider` 的實體 

* `const { docService } = getServices()` 是 Object 解構子的寫法

* `MockLogger` 是共用的測試 Mock 模型

  ```typescript
  import { Injectable } from '@angular/core';

  @Injectable()
  export class MockLogger {

    output = {
      log: [],
      error: [],
      warn: []
    };

    log(value: any, ...rest) {
      this.output.log.push([value, ...rest]);
    }

    error(value: any, ...rest) {
      this.output.error.push([value, ...rest]);
    }

    warn(value: any, ...rest) {
      this.output.warn.push([value, ...rest]);
    }
  }
  ```

* 利用巢狀 `describe`的方式將要測試的項目分組，提供更好的閱讀體驗

## 測試 Http

```typescript
 docService.currentDocument.subscribe();
```

* 這動作會觸發 `fetchDocument` 的私有方法，但這裡並不直接測試 `fetchDocument`，而是間接測試中間過程可能引發的變化

* `fetchDocument` 會做 `http.get` 的行為，所以利用 `MockBackend` 可以取得呼叫 `Http` 時的相關資訊

  ```typescript
  it('should fetch a document for the initial location', () => {
    const { docService, backend } = getServices('initial/doc');
    const connections = backend.connectionsArray;
    docService.currentDocument.subscribe();

    expect(connections.length).toEqual(1);
    expect(connections[0].request.url).toEqual(CONTENT_URL_PREFIX + 'initial/doc.json');
    expect(backend.connectionsArray[0].request.url).toEqual(CONTENT_URL_PREFIX + 'initial/doc.json');
  });
  ```

* `docService.currentDocument` 裡面有包含一個 `switchMap` ，所以當路徑變化時，也會重新取得文件內容

  * 測試程式碼

    ```typescript
    it('should emit a document each time the location changes', () => {
      let latestDocument: DocumentContents;
      const doc0 = { contents: 'doc 0', id: 'initial/doc' };
      const doc1 = { contents: 'doc 1', id: 'new/doc'  };
      const { docService, backend, locationService } = getServices('initial/doc');
      const connections = backend.connectionsArray;

      docService.currentDocument.subscribe(doc => latestDocument = doc);
      expect(latestDocument).toBeUndefined();

      connections[0].mockRespond(createResponse(doc0));
      expect(latestDocument).toEqual(doc0);

      locationService.go('new/doc');
      connections[1].mockRespond(createResponse(doc1));
      expect(latestDocument).toEqual(doc1);
    });
    ```

  * `createResponse` 用來建立模擬回傳結果的一個方法

    ```typescript
    function createResponse(body: any) {
      return new Response(new ResponseOptions({ body: JSON.stringify(body) }));
    }
    ```

  * 利用 `locationService.go` 來做網址的切換

* 模擬 `Http Fail` 的狀況

  ```typescript
  connections[0].mockError(new Response(new ResponseOptions({ status: 404, statusText: 'NOT FOUND'})) as any);
  ```

  `mockError` 會造成 `Http` 呼叫產生 `Exception`

* `mockBackend.connectionsArray` 

  * 這一個陣列會在執行任何 `Http` 呼叫後，才會有值
  * 使用陣列的原因是，如果一個動作裡面有呼叫多個 `Http` 時，就可以針對個別的 Connection 給予不同的`mockRespond`
  * 使用這種方式，可以減少 `subscribe` 的次數，以接近同步的方式寫測試



# 重點回顧

* 測試 `service` 不一定需要使用 `TestBed` 的方式來建立 `serivce` 實體，可以透過 `ReflectiveInjector.resolveAndCreate([])` 的方式建立 `Injector` ，進而使用 `injector.get`  的方式取得 `service` 實體
* 如果要測試 `HttpClient` ，可以透過 `MockBackend` 內建的模組來模擬回傳結果或錯誤結果
* 利用 `mockBackend.connectionsArray` 的方式取得每次 `Http` 呼叫時所建立的連線，並給予相對應的模擬資料 ，須留意取得的順序



# 程式碼

* [document.service.ts](https://github.com/angular/angular/blob/master/aio/src/app/documents/document.service.ts)
* [document.service.spec.ts](https://github.com/angular/angular/blob/master/aio/src/app/documents/document.service.spec.ts)