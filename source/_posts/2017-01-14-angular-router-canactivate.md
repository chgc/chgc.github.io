---
layout: post
title: '[Angular]Router - CanActivate'
comments: true
date: 2017-01-14 10:23:04
categories: Angular
tags: Angular2
---

通常我們會希望限制某些網址只有某特定的人才可以讀取，Angular的Router提供了一個方法`CanActivte`，可以讓我們能自訂讀取特定網頁的規則

<!-- more -->

# 實作CanActivate

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

# 進階應用

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



#  參考資料

* [ROUTING & NAVIGATION](https://angular.io/docs/ts/latest/guide/router.html#!#can-activate-guard)