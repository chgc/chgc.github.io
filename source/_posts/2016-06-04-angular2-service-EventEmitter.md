---
layout: post
title: '[Angular2]Service&EventEmitter'
comments: true
date: 2016-06-04 22:06:25
categories: Angular
tags: Angular2
---

在Angular2裡面如何做一個全域型的變數然後當其更新時，讓所有有用到的人都知道。這時候就要用EventEmitter了

<!-- more -->

EventEmitter是什麼? 官方文件裡尚未仔細描述他的用途，但是我覺得他有點類似Angular1的 $broadcast，以下是EventEmitter所提供的method

``` typescript
class EventEmitter {
	constructor(isAsync?: boolean)
	emit(value: T)
	next(value: any)
	subscribe(generatorOrNext?: any, error?: any, complete?: any) : any
}
```

如何用呢?

```typescript
// 註冊方
open: EventEmitter<any> = new EventEmitter();

open.emit(<value>);
          
// 使用方
open.subscribe((value)=>{
  ....
})
```

當emit被呼叫時，subscribe就會接收到通知，然後就會進行subscribe第一個function的動作。

利用這個特性，可以在service裡面寫全域變數。程式碼如下

``` typescript
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import {
  AngularFire,
  AuthMethods,
  FirebaseAuthState,
  AuthProviders } from 'angularfire2';


@Injectable()
export class AuthService {

  currentUser: FirebaseAuthState;
  checkLogin: EventEmitter<any> = new EventEmitter();
  
  constructor(private af: AngularFire) {
  }

  /** 判斷使用者是否已經有登入 */
  get isLogin(): boolean {
    ...
  }
  
  /** 用Email登入 */
  login(cred): Observable<FirebaseAuthState> {
    let ob = Observable.fromPromise(this.af.auth.login(cred, {
      provider: AuthProviders.Password,
      method: AuthMethods.Password,
    }));
    return ob.do((data) => {      
      this.setUser(data);
    })
  }

  /** 用Facebook登入 */
  fbLogin() {
    ...
  }
  
  /** 登出 */
  logout() {
    localStorage.removeItem('objUser');
    this.currentUser = undefined;
    this.af.auth.logout();
    this.checkLogin.emit(this.isLogin);
  }

  private setUser(user) {
    localStorage.setItem('objUser', JSON.stringify(user));
    this.currentUser = user;
    this.checkLogin.emit(this.isLogin);
  }
}
```





但是，Provider Inject的位置要注意(請參考[Angular 2 Components and Providers: Classes, Factories & Values](https://www.sitepoint.com/angular-2-components-providers-classes-factories-values/))，根據實驗，如果Component各自DI service as provider. 當其一的service值有改變而且有廣播時，另外一個service是收不到的，看起來應該是不同的Instance造成的現象，所以必須在往上一層注入服務.



# 參考文件

- [EventEmitter](https://angular.io/docs/ts/latest/api/core/index/EventEmitter-class.html)
- [Angular 2 Components and Providers: Classes, Factories & Values](https://www.sitepoint.com/angular-2-components-providers-classes-factories-values/)



