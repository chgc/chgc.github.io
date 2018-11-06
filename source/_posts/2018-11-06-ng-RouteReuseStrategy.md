---
layout: post
title: '[Angular] 該如何使用設定 RouteReuseStrategy'
comments: true
date: 2018-11-06 08:23:52
categories: Angular
tags: Angular
---

Angular 路由機制中，有一個選項是 `routeReuseStrategy`，這一個設定可以讓我們設定路由轉換的過程中，是否要保留 component 並重複使用，而相關的使用方式如下

<!-- more -->

# 設定

首先，先建立一個 Class 並實作 `RouteReuseStrategy` 介面，`RouteReuseStrategy` 介面包含了五個方法需要被實作

```typescript
abstract class RouteReuseStrategy {
  abstract shouldDetach(route: ActivatedRouteSnapshot): boolean
  abstract store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void
  abstract shouldAttach(route: ActivatedRouteSnapshot): boolean
  abstract retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null
  abstract shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean
}
```

* shouldDetach : 判斷路由是否能重複使用
* store : 將脫離的路由內容暫存起來
* shouldAttach : 當路由進入時，可判斷是否還原路由暫存內容
* retrieve : 從 Cache 中取得對應的暫存內容
* shouldReuseRoute : 判斷是否同一路由

基本範例程式

```typescript
import {
  RouteReuseStrategy,
  DefaultUrlSerializer,
  ActivatedRouteSnapshot,
  DetachedRouteHandle
} from '@angular/router';

export class AppRoutingCache implements RouteReuseStrategy {
  public static handlers: { [key: string]: DetachedRouteHandle } = {};

  // 判斷路由是否能重複使用
  public shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // 默認所有的路由設定都可以重複使用
    // 可透過 route.data 的方式來設定重複使用的規則
    return true;
  }

  // 當路由離開時，會觸發此方法
  public store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle
  ): void {
    // 將目前路由內容暫存起來
    AppRoutingCache.handlers[route.routeConfig.path] = handle;
  }

  // 當路由進入時，可判斷是否還原路由的暫存內容
  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return (
      !!route.routeConfig && !!AppRoutingCache.handlers[route.routeConfig.path]
    );
  }
  // 從 Cache 中取得對應的暫存內容
  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (!route.routeConfig) {
      return null;
    }
    return AppRoutingCache.handlers[route.routeConfig.path];
  }

  // 判斷是否同一路由
  public shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    current: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === current.routeConfig;
  }
}

```

# 註冊

將寫好的 class 註冊在 `RootModule` 的 `proivders` 的區塊中即可

```typescript
 providers: [{ provide: RouteReuseStrategy, useClass: AppRoutingCache }],
```

當這樣子設定完成後，Angular 路由機制就會依照我們實作的 `RouteReuseStrategy` 來管理路由的相關資訊，內包含 `ComponentRef` ，效果會是當我們重新返回該路由時，原本輸入的資料還會存在。因為是使用當時離開時的 Component 而不是重新建立一個新的。

實際的操作效果可以參考 [範例程式](https://stackblitz.com/edit/ng-routereusestrategy) 

#  參考資料

* [API](https://angular.io/api/router/RouteReuseStrategy)