---
layout: post
title: '[Angular] 跳過 Http Interceptor'
comments: true
typora-root-url: 2022-06-12-angular-skip-interceptor
typora-copy-images-to: 2022-06-12-angular-skip-interceptor
date: 2022-06-12 14:02:50
categories: Angular
tags: Angular
---

Angular Http Interceptor 使用情境很多，例如加 header token、處理 response error 等，但有時候如果真的有 http request 想要跳過 interceptor 這層該怎麼處理，以下是處理手法

<!-- more -->

## 程式碼

這裡會利用 `HttpBackend` 來完成

> Interceptors sit between the `HttpClient` interface and the `HttpBackend`.
>
> When injected, `HttpBackend` dispatches requests directly to the backend, without going through the interceptor chain.

`HttpClient` 原始碼

```typescript
@Injectable()
export class HttpClient {
  constructor(private handler: HttpHandler) {}
    ...
}
```

`HttpBackend` interface

```typescript
abstract class HttpBackend implements HttpHandler {
  abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>
}
```



範例程式

```typescript
import {HttpBackend, HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SkipInterceptorService {
  private httpClient: HttpClient;
  constructor(private handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }
}
```

手動建立一個 `HttpClient`，之後透過這個 `httpClient` 的 request 就不會經過 Interceptor 那層，就是這麼簡單

## 參考資料

- [Angular API - HttpBackend](https://angular.io/api/common/http/HttpBackend)
