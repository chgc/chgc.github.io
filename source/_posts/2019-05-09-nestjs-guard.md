---
layout: post
title: '[NestJS] Guard - Day 05'
comments: true
typora-root-url: 2019-05-09-nestjs-guard/
typora-copy-images-to: 2019-05-09-nestjs-guard/
date: 2019-05-09 00:23:12
categories:
tags:
---

Angular 有 Router Guard，是用來管制是否能進入 Component 的一道關卡，而在 NestJS 內也有一樣的機制，名字也叫做 Guard

<!-- more -->

Guard 的執行順序，會在每一個 middleware 之後，但在 interceptor 或是 pipe 之前，這順序要稍微記一下

# 建立

```
nest g gu <guard name>
```

建立出來 Guard 的基本內容

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
```

* 需要實作 `CanActivate` 介面

* 回傳的結果為布林值，也可以是 Promise 或是 Observable 的格式

  * true: 請求會繼續下去
  * false: 會拒絕連線請求

* 註冊方式與其他 filter/pipe 類似

  ```typescript
  import { Controller, Get, UseGuards } from '@nestjs/common';
  import { AppService } from './app.service';
  import { AuthGuard } from './auth.guard';
  
  @Controller()
  export class AppController {
    constructor(private readonly appService: AppService) {}
  
    @Get()
    @UseGuards(AuthGuard)
    getHello(): string {
      return this.appService.getHello();
    }
  }
  ```

* 當連線被拒絕時，會收到此訊息

  ```json
  {
    statusCode: 403,
    error: "Forbidden",
    message: "Forbidden resource"
  }
  ```



# ExecutionContext

在 `canActivate` 的方法，會有一個 `context` 的變數，其型別為 `ExecutionContext`

```typescript
canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
```

而這一個 `ExecutionContext` 是繼承 `ArgumentsHost`，而這個型別我們也在 `Exception Filter` 那邊有看過，相關細節的部分，可以再回去那個章節閱讀

```typescript
export interface ExecutionContext extends ArgumentsHost {
  getClass<T = any>(): Type<T>;
  getHandler(): Function;
}
```



# 範例: Role-based Auth

既然可以透過回傳 `ture` 或是 `false` 的方式決定是否能進入後續的請求流程，那再搭配其他的設定，不就能做到 Role-based 的權限控管了

官方文件內使用了 `SetMetadata` 與 `Reflection` 的方式來設定每一個 Controller method 的允許角色

```typescript
@Get()
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['admin']) // 設定 metaData
  getHello(): string {
    return this.appService.getHello();
  }
```

在 Guard 的地方可以用這種方式取得所設定的 metaData

```typescript
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get('roles', context.getHandler());
    console.log(roles); // 可以取得 ['admin'] 的資料
    return true;
  }
}
```

既然能取得所設定的 metaData，那後續的動作就可以自由發揮了

# 參考資料

* [官方文件](https://docs.nestjs.com/guards)