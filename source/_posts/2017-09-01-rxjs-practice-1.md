---
layout: post
title: '[RxJS] 練習曲(1) - pull to refresh'
comments: true
date: 2017-09-01 09:54:30
categories: Angular
tags:
- Angular
- RxJS
---

跟著 [Ben Lesh](https://twitter.com/BenLesh) 在 Google [分享範例](https://www.youtube.com/watch?v=DBai5EEFioI)，從頭練習一次。這個範例是利用 RxJS 來實做 **Pull To Refresh** 的功能。

<!-- more -->

Pull To Refresh 這個效果在很多的手機 App 上面常看到，例如 FB、Twitter 等

![](http://i.imgur.com/SEPYv2G.gif)

這一個練習，就是要透過 RxJS 來實作這一個功能出來

# 實作步驟

## 1.先建立讀取使用者資料的 service

假的使用者資料 API 可以從我架設的 RandomAPI 位置取得

> API 網址 : https://randomapi.azurewebsites.net/api/users

建立 `UserFeedService`

```typescript
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/catch';

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

const api = 'https://randomapi.azurewebsites.net/api/users';

@Injectable()
export class UserFeedService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]|{}> {
    return this.http.get<any[]>(api)
        .map(users => users.slice(0, 10))
        .catch(err => {
          console.log('an error occured', err);
          return Observable.empty();
        });
  }
}

```

這裡我們使用  `HttpClient` ，記得在 `AppModule` 載入 `HttpClientModule`

## 2.建立新的 Component 用來顯示使用者資料

建立 `LatestUsersComponent`，並將 component 加到 app.component.html 裡

```typescript
import {Component, OnInit} from '@angular/core';
import {UserFeedService} from '../user-feed.service';

@Component({
  selector: 'app-latest-users',
  template: `
  <h3>Latest Users</h3>
  <div>
    <article *ngFor="let user of (users$ | async)">
      <h4>{{ user.first }} {{ user.last }}</h4>
      <p>Joined: {{ user.created | date: 'yyyy/MM/dd' }}</p>
      <p>Balance: {{ user.balance | currency: 'USD': true }}</p>
      <p>Contact: {{ user.address }}, {{ user.email }}</p>
    </article>
  </div>
  `,
  styles: []
})
export class LatestUsersComponent {
  users$ = this.userFeedService.getUsers();
  constructor(private userFeedService: UserFeedService) {}
}

```



## 3.定時重新讀取使用者資料

> 希望每 10 秒鐘，重新撈一次資料

在 `LatestUsersComponent` 裡面在多一個 Observable 用來觸發 `getUsers()`

```typescript
...
export class LatestUsersComponent {
  updateUsersTrigger$ = Observable.timer(0, 10000);
  users$ = this.updateUsersTrigger$
               .switchMap(() => this.userFeedService.getUsers());
  ...
}
```

這樣的改寫，當註冊當下 ( async piple ) 會先呼叫一次 `getUsers()`，在之後每 10 秒會觸發 `getUsers()` 

## 4.建立 LoadNotifyService

接下來要準備實作 `pull to refresh` 的功能，我們需要兩個通知器，一個負責**請求讀取資料**，另一個是**回傳資料讀取完成 **，這個通知器可以使用 `Subject` 來實作即可

建立 `LoadNotifyService`

```typescript
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class LoadNotifyService {
  requestLoad$ = new Subject<any>();
  loadComplete$ = new Subject<any>();
}
```

## 5. 將通知功能加入到 LatestUsersComponent

`updateUsersTrigger$` 現在除了每 10 秒會發出一次資料，當有人請求更新資料時，也會發出一筆資料。當 `getUsers()` 完成讀取資料時，會發出 `loadComplete$` 的通知

```typescript
export class LatestUsersComponent {
  updateUsersTrigger$ =
      Observable.timer(0, 10000).merge(this.loadNotifyService.requestLoad$);
  users$ =
      this.updateUsersTrigger$.switchMap(() => this.userFeedService.getUsers())
          .do(this.loadNotifyService.loadComplete$);

  constructor(
      private userFeedService: UserFeedService,
      private loadNotifyService: LoadNotifyService) {}
}
```

## 6.建立新的 Component 來負責 **pull to refresh** 的功能

建立 `PullToRefreshComponent` 並加到 `LatestUsersComponent` 裡

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-pull-to-refresh',
  template: `
  <div style="position: absolute; top: 0; left: 50%">
    <div style="margin-left: -35px">
      <svg width="70px" height="70">
        <circle cy="35" cx="35" r="35" fill="lightgrey"></circle>
        <circle cy="15" cx="35" r="10" fill="black"></circle>
      </svg>
    </div>
  </div>
  `,
  styles: []
})
export class PullToRefreshComponent {
  constructor() {}
}

```

## 7.實作往 Pull To Refresh 動作

先來分析一下要實作功能會有哪些動作

1. `touchstart`
2. `tocuhmove`
3. 計算移動的距離，決定是否出發撈資料的請求
4. 如果符合條件，則發出請求
5. `touchend `
6. 如果有發出撈資料的請求時，等待完成讀取資料動作，並恢復初始狀態
7. 如果沒有發出撈資料的請求，恢復初始狀態

步驟1，需要先將 `touchstart`、`touchmove` 和 `touchend` 事件轉換成 Observable

```typescript
touchstart$ = Observable.fromEvent<TouchEvent>(document, 'touchstart');
touchend$ = Observable.fromEvent<TouchEvent>(document, 'touchend');
touchmove$ = Observable.fromEvent<TouchEvent>(document, 'touchmove');
```

步驟2，計算開始後手指滑動的距離

```typescript
 drag$ = this.touchstart$.switchMap(start => {
    let pos = 0;
    return this.touchmove$
        .map(move => move.touches[0].pageY - start.touches[0].pageY)
        .do(p => pos = p)
        .takeUntil(this.touchend$);
  });
```

步驟3，判斷是否要發出通知，如果已經發出請求通知，停止 Observable

```typescript
drag$ = this.touchstart$ 
    .switchMap(start => {
      let pos = 0
      return this.touchmove$
        .map(move => move.touches[0].pageY - start.touches[0].pageY)
        .do(p => pos = p)
        .takeUntil(this.touchend$)
        .concat(Observable.defer(() => this.tweenObservable(pos, 0, 200)))
    })
    .do(p => {
      if (p >= window.innerHeight / 2) {
        this.loadNotification.requestLoad$.next()
      }
    })
    .takeWhile(p => p < window.innerHeight / 2)
```

步驟4，當上述動作完成時，Observable 本身會停止，可透過 `repeat()` 重新啟動

```typescript
drag$ = this.touchstart$
            .switchMap(start => {
              let pos = 0;
              return this.touchmove$
                  .map(move => move.touches[0].pageY - start.touches[0].pageY)
                  .do(p => pos = p)
                  .takeUntil(this.touchend$);
            })
            .do(p => {
              if (p >= window.innerHeight / 2) {
                this.loadNotification.requestLoad$.next();
              }
            })
            .takeWhile(p => p < window.innerHeight / 2)
            .repeat();
```

步驟5，記錄目前所在位置，加上動畫功能，將該 Observable  綁定到 template 上

```typescript
currentPos = 0;
position$: Observable<number> = this.drag$
    .merge(this.completeAnimation$)
    .startWith(0)
    .do(pos => this.currentPos = pos)

positionTranslate3d$: Observable<string> = this.position$.map(p => `translate3d(0, ${p - 70}px, 0)`)
```

```html
<div style="position: absolute; top: 0; left: 50%">
  <div style="margin-left: -35px" [style.transform]="positionTranslate3d$ | async">
    <svg width="70px" height="70">
      <circle cy="35" cx="35" r="35" fill="lightgrey"></circle>
      <circle cy="15" cx="35" r="10" fill="black"></circle>
    </svg>
  </div>
</div>
```

到這個步驟時，畫面已經可以往下拉的效果，而且也可以送出重新讀取資料的請求了

![](http://i.imgur.com/vjL13RV.png)

步驟6: 當放掉或當資料讀取完成後，要恢復至初始狀態

先處理資料讀取完成後，恢復至初始狀態

```typescript
completeAnimation$ = this.loadNotification.loadComplete$
    .map(() => this.currentPos)
    .switchMap(currentPos => this.tweenObservable(currentPos, 0 , 200));

...

position$: Observable<number> = this.drag$
    .merge(this.completeAnimation$)
    .startWith(0)
    .do(pos => this.currentPos = pos);

private tweenObservable(start, end, time) {
  const emissions = time / 10;
  const step = (start - end) / emissions;

  return Observable.timer(0, 10)
      .map(x => start - step * (x + 1))
      .take(emissions);
}
```

在來處理未觸發資料讀取請求時，當手指頭離開畫面時，也需要恢復初始狀態

```typescript
drag$ = this.touchstart$ 
    .switchMap(start => {
      let pos = 0
      return this.touchmove$
        .map(move => move.touches[0].pageY - start.touches[0].pageY)
        .do(p => pos = p)
        .takeUntil(this.touchend$)
        .concat(Observable.defer(() => this.tweenObservable(pos, 0, 200))) // 恢復初始狀態
    })
    .do(p => {
      if (p >= window.innerHeight / 2) {
        this.loadNotification.requestLoad$.next()
      }
    })
    .takeWhile(p => p < window.innerHeight / 2)
    .repeat()
```



## 8.實作轉圈圈的動作

其實到階段 7 時，Pull To Refresh 的功能已經完成了，在多一點讀取時的 loading 效果，讓圈圈旋轉吧

```typescript
// Start rotating when a request is made and spin until it completes
rotate$: Observable<number> =
    this.loadNotification.requestLoad$.switchMap(() => {
      let rot = 0;
      return this.tweenObservable(0, 360, 500)
          .repeat()
          .do(r => rot = r)
          .takeUntil(this.loadNotification.loadComplete$)
          .concat(Observable.defer(
              () => this.tweenObservable(rot, 360, 360 - rot)));
    });

rotateTransform$: Observable<string> =
    this.rotate$.map(r => `rotate(${r}deg)`);
```

```html
<div style="position: absolute; top: 0; left: 50%">
  <div style="margin-left: -35px" [style.transform]="positionTranslate3d$ | async">
    <svg width="70px" height="70" [style.transform]="rotateTransform$ | async">
      <circle cy="35" cx="35" r="35" fill="lightgrey"></circle>
      <circle cy="15" cx="35" r="10" fill="black"></circle>
    </svg>
  </div>
</div>
```

# 完整程式碼

## pull-to-refresh.component.ts

```typescript
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/repeat';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/concat';

import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {LoadNotifyService} from '../load-notify.service';

@Component({
  selector: 'app-pull-to-refresh',
  template: `
  <div style="position: absolute; top: 0; left: 50%">
    <div style="margin-left: -35px" [style.transform]="positionTranslate3d$ | async">
      <svg width="70px" height="70" [style.transform]="rotateTransform$ | async">
        <circle cy="35" cx="35" r="35" fill="lightgrey"></circle>
        <circle cy="15" cx="35" r="10" fill="black"></circle>
      </svg>
    </div>
  </div>
  `,
  styles: []
})
export class PullToRefreshComponent {
  currentPos = 0;
  touchstart$ = Observable.fromEvent<TouchEvent>(document, 'touchstart');
  touchend$ = Observable.fromEvent<TouchEvent>(document, 'touchend');
  touchmove$ = Observable.fromEvent<TouchEvent>(document, 'touchmove');

  completeAnimation$ =
      this.loadNotification.loadComplete$.map(() => this.currentPos)
          .switchMap(currentPos => this.tweenObservable(currentPos, 0, 200))

  drag$ = this.touchstart$
              .switchMap(start => {
                let pos = 0;
                return this.touchmove$
                    .map(move => move.touches[0].pageY - start.touches[0].pageY)
                    .do(p => pos = p)
                    .takeUntil(this.touchend$)
                    .concat(Observable.defer(
                        () => this.tweenObservable(pos, 0, 200)));
              })
              .do(p => {
                if (p >= window.innerHeight / 2) {
                  this.loadNotification.requestLoad$.next();
                }
              })
              .takeWhile(p => p < window.innerHeight / 2)
              .repeat();
  position$: Observable<number> = this.drag$.merge(this.completeAnimation$)
                                      .startWith(0)
                                      .do(pos => this.currentPos = pos);


  positionTranslate3d$: Observable<string> =
      this.position$.map(p => `translate3d(0, ${p - 70}px, 0)`);

  // 開始轉圈圈直到資料讀取完成
  rotate$: Observable<number> =
      this.loadNotification.requestLoad$.switchMap(() => {
        let rot = 0;
        return this.tweenObservable(0, 360, 500)
            .repeat()
            .do(r => rot = r)
            .takeUntil(this.loadNotification.loadComplete$)
            .concat(Observable.defer(
                () => this.tweenObservable(rot, 360, 360 - rot)));
      });

  rotateTransform$: Observable<string> =
      this.rotate$.map(r => `rotate(${r}deg)`);
  constructor(private loadNotification: LoadNotifyService) {}

  private tweenObservable(start, end, time) {
    const emissions = time / 10;
    const step = (start - end) / emissions;

    return Observable.timer(0, 10)
        .map(x => start - step * (x + 1))
        .take(emissions);
  }
}
```

## latest-users.component.ts

```typescript
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/do';
import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {LoadNotifyService} from '../load-notify.service';
import {UserFeedService} from '../user-feed.service';

@Component({
  selector: 'app-latest-users',
  template: `
  <app-pull-to-refresh></app-pull-to-refresh>

  <h3>Latest Users</h3>
  <div>
    <article *ngFor="let user of (users$ | async)">
      <h4>{{ user.first }} {{ user.last }}</h4>
      <p>Joined: {{ user.created | date: 'yyyy/MM/dd' }}</p>
      <p>Balance: {{ user.balance | currency: 'USD': true }}</p>
      <p>Contact: {{ user.address }}, {{ user.email }}</p>
    </article>
  </div>
  `,
  styles: []
})
export class LatestUsersComponent {
  updateUsersTrigger$ =
      Observable.timer(0, 10000).merge(this.loadNotifyService.requestLoad$);
  users$ =
      this.updateUsersTrigger$.switchMap(() => this.userFeedService.getUsers())
          .do(this.loadNotifyService.loadComplete$);

  constructor(
      private userFeedService: UserFeedService,
      private loadNotifyService: LoadNotifyService) {}
}
```

## user-feed.service.ts

```typescript
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/catch';

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

const api = 'https://randomapi.azurewebsites.net/api/users';

@Injectable()
export class UserFeedService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]|{}> {
    return this.http.get<any[]>(api)
        .map(users => users.slice(0, 10))
        .catch(err => {
          console.log('an error occured', err);
          return Observable.empty();
        });
  }
}

```

## load-notify.service.ts

```typescript
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class LoadNotifyService {
  requestLoad$ = new Subject<any>();
  loadComplete$ = new Subject<any>();
}

```

## app.component.html

```html
<h1>Super Cool App</h1>
<app-latest-users></app-latest-users>
```

# 參考資料

* [stackblitz demo](https://stackblitz.com/edit/angular-rxjs-pull-to-refresh?embed=1&file=main.ts)
* [GitHub Repo](https://github.com/chgc/rxjs-practice1-pull-to-refresh)