---
layout: post
title: '[Angular] HttpInterceptor 應用 - 日期轉換'
comments: true
typora-root-url: 2019-08-22-angular-http-inteceptor-practice-1/
typora-copy-images-to: 2019-08-22-angular-http-inteceptor-practice-1/
date: 2019-08-22 16:11:30
categories: Angular
tags: Angular
---

呼叫後端 API 當遇到回傳資料欄位是日期時，我們所拿到的都是文字格式的日期資料，這時候就必須多做一次轉換才能變成日期型別，因為 TypeScript 並不會因為將 Model Class 欄位標示為日期格式，就會自動轉換，並不會好嗎，這樣太為難 TypeScript 了。

所以看起來最省事的解法是在 http request 時就解結掉，這樣就不需要到處寫日期轉換

<!-- more -->

既然是要在 Http 層處理，`HttpInterceptor` 就是個好選擇，也懶得解釋了，程式碼自己看

```typescript
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export class JsonInterceptor implements HttpInterceptor {
  private utcRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
  private dateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)$/;
  private zoneRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)([+-])(\d{2}):(\d{2})$/;

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.convertDates(event.body);
        }
      })
    );
  }

  private convertDates(object: Object) {
    if (!object || !(object instanceof Object)) {
      return;
    }

    if (object instanceof Array) {
      for (const item of object) {
        this.convertDates(item);
      }
    }

    for (const key of Object.keys(object)) {
      const value = object[key];

      if (value instanceof Array) {
        for (const item of value) {
          this.convertDates(item);
        }
      }

      if (value instanceof Object) {
        this.convertDates(value);
      }

      if (typeof value === 'string') {
        let a;
        if (typeof value === 'string') {
          a = this.utcRegex.exec(value);
          if (a) {
            object[key] = new Date(
              Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6])
            );
            continue;
          }
          a = this.dateRegex.exec(value);
          if (a) {
            object[key] = new Date(
              +a[1],
              +a[2] - 1,
              +a[3],
              +a[4],
              +a[5],
              +a[6]
            );
            continue;
          }
          a = this.zoneRegex.exec(value);
          if (a) {
            const dir = a[7] === '+' ? -1 : 1;
            object[key] = new Date(
              Date.UTC(
                +a[1],
                +a[2] - 1,
                +a[3],
                +a[4] + dir * a[8],
                +a[5] + dir * a[9],
                +a[6]
              )
            );
            continue;
          }
        }
      }
    }
  }
}

```

記得在 `App.module` 的地方註冊 `Http Interceptor`

```typescript
{
      provide: HTTP_INTERCEPTORS,
      useClass: JsonInterceptor,
      multi: true
    },
```

