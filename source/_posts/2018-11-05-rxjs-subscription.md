---
layout: post
title: '[RxJS] Subscription'
comments: true
date: 2018-11-05 08:27:07
categories: Angular
tags: Angular
---

在 RxJS  裡在建立 Observable 時，都會回傳一個 subscription 物件，而這一個物件允許我們手動取消 Observable 的動作，其實 Subscription 裡還有其他細節的。這一篇文章就來探討 Subscription。

<!-- more -->

# 介面

```typescript
export interface SubscriptionLike extends Unsubscribable {
  unsubscribe(): void;
  readonly closed: boolean;
}
```

這一個介面定義是 RxJS 6.x 版，也是我們常見的使用方法，但事實上在 Subscription 內還有兩個 method 是沒有定義，而這一個問題在 RxJS 7 版有被修正

```typescript
// RxJS 7 版的 Subscription 介面
export interface Subscription {
  unsubscribe(): void;
  add(...teardowns: TeardownLogic[]): void;
  remove(...teardowns: TeardownLogic[]): void;
  readonly closed: boolean;
}
```

# 基本功能

## unsubscribe

`unsubscribe` 應該不需要多解釋了，就是將 Observable 給取消訂閱，當 Observable 被取消訂閱時就會停止運作了。這裡有一個觀念要知道，一個 Observable 被 unsubscribe 時，是不會進到 `complete` 階段的，如果有什麼動作是希望在 Observable 完成時或是被取消時執行的話，就必須使用 `finalize` 這一個 operator，`finalize` 會在 complete 之後執行

## closed

當 subscription 被 unsubscribe 時，closed 這一個屬性就會被標示成 `true`，可以利用這個來判斷 subscription 的狀態

# 進階功能

管理 Observable 的 subscription 是一件大工程，常見的管理方式，就是利用 `takeUntil` 來做管理

```typescript
someMethod(){
    obs.pipe(takeUntil(this.destroy$)).subscribe();
}
ngOnDestroy(){
    this.destroy$.next();    
}
```

這裡介紹另外一種管理方式，我們也可以透過 Subscription 來做管理，使用方式是先建立一個空的 Subscription，然後透過 `add` 和 `remove` 的方式來管理

```typescript
import { Subscription, interval } from 'rxjs';
// 建立空的 Subscription 物件
const sub = new Subscription();
```

## add

將 Observable 的 subscription 加入至 Subscription 物件裡，使用方法如下

```typescript
const obsSub = interval(1000).subscribe();
sub.add(obsSub);
```



## remove

將 Observable 的 subscription 從 Subscription 物件裡移除，使用方法如下

```typescript
sub.remove(obsSub);
```

## unsubscribe

當要取消所有 Observable 的動作時，這時候只需要將 Subscription 物件做 unsubscribe，任何註冊在此 Subscription 物件裡的 subscription 也同時會執行 unsubscribe 的動作

```typescript
const sub = new Subscription();

someMethod(){
    this.sub.add(obs.subscribe());
}
ngOnDestroy(){
    this.sub.unsubscribe();
}
```



# 秘密篇

在深入研究 RxJS Subscription 的程式碼，發現 `add` 這一個方法是接受 `TeardownLogic` 型別的物件，而 `TeardownLogic` 的介面是

```typescript
export type TeardownLogic = Unsubscribable | Function | void;
```

沒錯，我們也可以 add `Function`  至 Subscription 內，而這執行的時機點就是在 Subscription  unsubscribe 時，執行順序會依 `add` 的順序，這一個祕密將為我們打開另外一道門，將 RxJS 的寫法提供更彈性的寫法

```typescript
const sub = new Subscription();

someMethod(){
    this.sub.add(obs.subscribe());
    this.sub.add(()=>{
        console.log('do something after unsubscribe');
    })
}
ngOnDestroy(){
    this.sub.unsubscribe();
    // 會將 observable unsubscribe 
    // 並 console.log 'do something after unsubscribe'
}
```

# FYI

目前 RxJS 6 的 Subscription 種類只有一種，但在 RxJS 7 有推出另外一種 Subscription，可以說是原本 Subscription 的延伸版本，但在 RxJS 7 定版前，先不介紹這一個 Subscription ，等有進一步消息時，在另外寫文章介紹