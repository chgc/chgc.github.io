---
layout: post
title: '[RxJS]使用情境(3)- 利用 BehaviorSubject 來管理使用者登入狀態'
comments: true
date: 2017-02-26 20:09:35
categories: Angular
tags: Angular
---

RxJS 裡的 Subject 有 4 種類型，Subject、BehaviorSubject、ReplaySubject 和 AsyncSubject，每一種類型的 Subject 都有各自的特性及使用時機，這次會使用 `BehaviorSubject`來管理使用者的登入狀態

<!-- more -->

# BehaviorSubject

BehaviorSubject  與一般的 Subject 有什麼不一樣，差別有兩個

1. BehaviorSubject 可以給予初始值
2. 每一個 Observer 都可以在註冊的當下，立刻取得目前 BehavoirSubject 的值 (以下皆簡稱為 Subject)

這兩種特性，就非常適合用在使用者登入狀態管理的這種情境

# 使用情境

使用者登入基本上，狀態就兩種，登入與尚未登入，而每一個頁面都可以在取得該使用者目前的登入狀態。也可以即時知道已登入的使用者登出的時間點。

根據上列的描述，我們會實作一個 UserService，用來執行跟管理使用者的登入，登出行為及狀態。

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class UserService {
    isLoginSubject = new BehaviorSubject<boolean>(this.hasToken());

    /**
     * 如果有取得token，表示使用者有登入系統
     * @returns {boolean}
     */
    private hasToken() : boolean {
      return !!localStorage.getItem('token');
    }

    /**
    *  登入使用者，並通知所有訂閱者
    */
    login() : void {
      localStorage.setItem('token', 'JWT');
      this.isLoginSubject.next(true);
    }

    /**
    * 登出使用者，並通知所有訂閱者
    */
    logout() : void {
      localStorage.removeItem('token');
      this.isLoginSubject.next(false);
    }

    /**
    *
    * @returns {Observable<T>}
    */
    isLoggedIn() : Observable<boolean> {
     return this.isLoginSubject.asObservable();
    }
}
```

Component 的使用方式

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";
import { Observable } from "rxjs";

@Component({
  selector: 'app-main-nav',
  template: `
    <ul>
      <li *ngIf="!(isLoggedIn | async)" (click)="authService.login()>
        <a>Login</a>
      </li>
      <li *ngIf="(isLoggedIn | async)" (click)="authService.logout()">
        <a>Logout</a>
      </li>
    </ul>
  `
})
export class MainNavComponent implements OnInit {
  isLoggedIn : Observable<boolean>;

  constructor( public userService : UserService ) {
    this.isLoggedIn = userService.isLoggedIn();
  }
}
```

這樣子就完成了一個陽春型的使用者登入狀態管理 service。

# 最後

其實，善用 Subject 與 Subscribe 的特性，可以讓 Component 裡的程式碼減少很多，Component之間的溝通也變得很簡單。



# 參考資料

- [BehaviroSubject](http://reactivex.io/rxjs/manual/overview.html#behaviorsubject)