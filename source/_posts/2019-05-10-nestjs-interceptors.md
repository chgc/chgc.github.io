---
layout: post
title: '[NestJS] Interceptors - Day 06'
comments: true
typora-root-url: 2019-05-10-nestjs-interceptors/
typora-copy-images-to: 2019-05-10-nestjs-interceptors/
date: 2019-05-10 22:29:48
categories:
tags:
---

Interceptor 是 NestJS 內唯一可以雙向影響的服務，至於有哪些用途，就先來看官網的文件

<!-- more -->

![Interceptors_1](Interceptors_1.png)

# 基本型

Nest CLI 指令

```
nest g in <interceptor name>
```

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle();
  }
}

```

* context: 內包含所接紹的 Request / Response 等資訊
* next: 可以串接/改變傳出去的內容，為 Observable

**簡單範例**

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    consoole.log('Before')
   const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
     );
  }
}

```

註冊方式與之前的 `Pipe` 、`Fitler` 等一樣

```typescript
@Controller('products')
export class ProductsController {
  @Get()
  @UseInterceptors(LoggingInterceptor)
  getAll(@Res() response: Response, @Query() query) {
    return response.status(HttpStatus.OK).json([1, 2, 3]);  
  }

  ...
}
```

輸出結果

![1557548376599](1557548376599.png)

# 進階應用

因為 intercetpor 需要回傳 Observable 型別，這表示任何可以跟 Observable 串的 Operators 都可以使用，或可以直接回傳另外一個 Observable

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { of } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {    
     return of('這跟原本 Controller 回傳的內容不一樣')
  }
}
```

或是這樣子使用

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { of } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {    
     return next.handle().pipe(catchError(()=>  throwError(new BadGatewayException())),
  }
}
```



# 執行順序

從一開始到現在也看了很多不同介於 Client 與 Server 端的服務，但相互的執行順序又是如何，就簡單做一個測試

```typescript
// tslint:disable-next-line:max-classes-per-file
@Controller('products')
export class ProductsController {
  @Get()
  @UseInterceptors(LoggingInterceptor)
  @UseFilters(HttpExceptionFilter)
  @UsePipes(ValidatePipe)
  @UseGuards(AuthGuard)
  getAll(@Res() response: Response, @Query() query) {
    return response.status(HttpStatus.OK).json([1, 2, 3]);
    // throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}

```

`middleware` 是註冊在 App.module，執行結果

![1557550471551](1557550471551.png)



# Recap

這邊可以算是 NestJS 基本的運作，但還有更多的內容等著去開發。例如如何連結資料庫等，就繼續探索下去吧



# 參考資料

* [官方文件](https://docs.nestjs.com/interceptors)