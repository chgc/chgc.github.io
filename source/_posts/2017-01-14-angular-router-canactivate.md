---
layout: post
title: '[Angular]Router Guards'
comments: true
date: 2017-01-14 10:23:04
categories: Angular
tags: Angular2
---

通常我們會希望限制某些網址只有某特定規則者才可以進入或離開，Angular的Router提供了一系列的個方法來幫助我們

<!-- more -->

Angular的Router提供了一系列的方法，可以讓我們來決定是否允許使用者進入或是離開頁面

- [CanActivate](https://angular.io/docs/ts/latest/guide/router.html#can-activate-guard) : 避免瀏覽到該網址
- [CanActivateChild](https://angular.io/docs/ts/latest/guide/router.html#can-activate-child-guard) : 避免瀏覽到子網址
- [CanDeactivate](https://angular.io/docs/ts/latest/guide/router.html#can-deactivate-guard) : 避免離開目前的網址
- [Resolve](https://angular.io/docs/ts/latest/guide/router.html#resolve-guard) : 在前往瀏覽網頁前先預載資料
- [CanLoad](https://angular.io/docs/ts/latest/guide/router.html#can-load-guard) : 避免載入非同步的路由設定

# CanActivate

```typescript
import { Injectable }     from '@angular/core';
import { CanActivate }    from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate() {
    console.log('AuthGuard#canActivate called');
    return true;
  }
}
```

這是基本的CanActivate的程式架構，而在Route的地方，設定的方式如下

```typescript
const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard]
  }];  
```

* canActivate回傳true時，可以進入，回傳false時，無法進入

## 進階應用

`canActivate`接受Observable型態的function，範例如下

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
     return Observable.of(true).delay(1000)
        .do(val => {
            if(val == false){
                 this.router.navigate(['/login']);
            }
         });
  }
}
```

# CanActivateChild

```typescript
@Injectable()
export class AuthGuardService implements CanActivate {

  constructor() { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('AuthGuard#canActivate called');
    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard#canActivateChild called');
    return this.canActivate(route, state);
  }
}
```

Route Config的地方

```typescript
{
    path: 'page1', component: Page1Component,   
    canActivateChild: [
      AuthGuardService
    ],
    children: [
      { path: '', component: Page1DetailComponent }
    ]
  }
```

這樣的設定方式，會讓每一個child Route都會跑canActivate的方法，就不需要一個一個的設定了，非常方便



# CanDeactivate


`canDeactivate`比較特殊，可以搭配Component一起使用

```typescript
import { Injectable }    from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable }    from 'rxjs/Observable';

export interface CanComponentDeactivate {
 canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: Page2Component, 
                 route: ActivatedRouteSnapshot, 
                 state: RouterStateSnapshot) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
```

* Component需Implements上述的`CanComponentDeactivate` Interface, 才可以讓CanDeactivateGuard作用
* 當canDeactivate() 回傳 false時，則無法離開該頁面，回傳 true時，才可以離開

# Resolve

請參考[[Angular2] Router Resolve](http://blog.kevinyang.net/2016/12/11/ng2-router-resolve/)

# CanLoad

* `CanLoad`會封住`PRELOAD`的功能，我們需要使用`PRELOAD`來增加效能，所以這裡建議使用CanActivate來控制

* 至於Preloading Strategy就待下回分曉

  ​

#  參考資料

* [ROUTING & NAVIGATION](https://angular.io/docs/ts/latest/guide/router.html#!#can-activate-guard)