---
layout: post
title: '[Angular] Tree-shakable providers'
comments: true
date: 2018-04-10 20:26:14
categories: Angular
tags: Angular
---

Angular 6 將 tree-shaking 觸手擴大到 provider 了，提供了新的設定方法讓 service 也可以被 tree-shaking 掉了，這對於最後產生出來的 bundle 檔案大小，會有很大的幫助。

<!-- more -->

# 緣由

根據官方文件的說法，註冊在 NgModule 下的 service 都無法被 tree-shaking 掉，主要是 Angular  無法判斷該 service 是否有在任何地方被使用著，任何地方都可能透過 `injector.get` 的方式取得 service，也是因為這個原因 Angular 必須把 service 包到 NgModule 裡。

目前的寫法 ( Angular 5.x ~ 2 版 )，就是 non-tree-shakable service

```typescript
import { Injectable, NgModule } from '@angular/core';

@Injectable()
export class Service {
  doSomething(): void {
  }
}

@NgModule({
  providers: [Service],
})
export class ServiceModule {
}
```

為了解決這個問題， service 本身必須包含如何建構實體的相關資訊，這樣才可以從 `moduleFactory` 脫離，也才讓 `ngc` 或是相關工具決定是否要包含 service 的程式碼



# 建立 tree-shakable providers

Angular 團隊為了這件事情，他們修改了 `@Injectable` 的介面，多了兩個項目可以設定

```typescript
@Injectable({ 
  providedIn?: Type<any> | 'root' | null
  factory: () => any
})
```

## `Singleton Service` 設定方式

```typescript
@Injectable({
  providedIn: 'root' 
})
export class Service {
  constructor(private dep: string) {
  }
}
```

* 當 `providedIn` 設定為 `root` 時，這表示該 service 會被註冊為 `singleton service`

## 註冊在 root 以外的地方 

另外一種情境是 service 是註冊在某一個 `NgModules` 下且不一定要是 `singleton` ，這時候的設定方式是

```typescript
@Injectable({
  providedIn: HeroModule
})
export class Service {
  constructor(private dep: string) {
  }
}
```

這樣子設定後，在每一次有引用到 `HeroModule` 時，都會建立一個 Service 實體

## Factory 模式

`@Injectable` 另外一個 `useFactory`  (這裡我還不確定最後的寫法是怎樣，原始碼內有點混亂，但基本概念是一樣的)

```typescript
@Injectable({
  providedIn: 'root',
  useFactory: (logger: Logger, userService: UserService) =>
      new HeroService(logger, userService.user.isAuthorized),
  deps: [Logger, UserService],
})
export class HeroService {
  // #docregion internals
  constructor(
    private logger: Logger,
    private isAuthorized: boolean) { }
    ...
}    
```



# 結論

根據目前 Angular CLI 走的方向，這種設定方式將會是預設的模式，除非有其他 DI 的特需需求，不然 NgModules 的 providers 應該會是空空的。某種程度上是好事，只是要花點時間習慣

