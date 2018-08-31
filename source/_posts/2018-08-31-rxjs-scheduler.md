---
layout: post
title: '[RxJS] Scheduler'
comments: true
date: 2018-08-31 08:37:59
categories: Angular
tags: Angular
---

來探討 RxJS 的 Scheduler 吧

<!-- more -->

# 前言

在開始探討 RxJS 的 scheduler 機制之前，要先談談 JavaScript 本身的三個機制 `Event Loop` 、`Micro Task` 和 `Macro Task`。

我們知道 JavaScript 處理 `function ` 的方式是將要執行的 `function ` 放到 stack 中，如果遇到非同步動作時，JavaScript 會將其非同步執行結束後的 `callback function` 放到 `Queue` 中，等待 stack 的動作全部完成後(即清空)，再來執行 queue 裡的工作，而將 queue 裡的工作轉到 stack 的人就是 `event loop`。所以我們可以說 `event loop` 的工作是監控 `stack` 與 `queue` ，並決定什麼時候要將 queue 的工作拉到 stack 內處理。

更多關於 Event loop 運行方式，可以看這個影片

{% youtube 8aGhZQkoFbQ%} 

實際上 `Event loop` 內在分細一點，針對不同的非同步行為，有著執行的優先順序。這裡要介紹 `Micro Task` 與 `Macro Task` ，簡單的說，就是將上述的 Queue 在分成兩種 Queue，一個是記載著 `Micro Task` 的 (這裡我們先稱為 `Micro Task Queue`)，另外一個是記載著 `Macro Task` (這裡我們先稱為 `Macro Task Queue`)。 在每一個事件循環，會先處理記載 `Micro Task` 的 Queue，然後當 `Micro Task Queue` 清空後，才會處理 `Macro Task Queue` 。

那些動作是 `Micro Task`，哪些又是 `Macro Task` 呢?

* `Micro Task`
  * `process.nextTick()`
  * `promise`
  * `Object.observe`
  * `MutaionObserver`
* `Macro Task`
  * `setImmediate`
  * `setTimeout`
  * `setInterval`

```typescript
setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');

```

執行結果

![](https://i.imgur.com/ydKKr52.png)



# RxJS Scheduler

RxJS 裡面的 Scheduler 有幾種，而我們可以透過改變 scheduler 來改變執行順序。RxJS Scheduler 有以下幾種，還記得我們上面提到的 Micro 和 Macro Task 嗎? 每一個 Scheduler 也有相對應的類別

* `queueScheduler`：`Sync queue`，將任務放到 `queue` 中，如果有設定 delay，行為跟 `async` 一樣
* `asapScheduler`： `Micro Task` 
* `asyncScheduler`：`Macro Task`，與 `setTimeout` 的相同。
* `animationFrameScheduler`：`paint event` ，根據每一個 frame 做觸發

讓我們直接來看 code 好了

```typescript
import { of, range, interval, asapScheduler, asyncScheduler, animationFrameScheduler, queueScheduler } from 'rxjs';
import { observeOn, subscribeOn } from 'rxjs/operators';

// observeOn 可以被使用多次，控制 emission
range(0, 42).pipe(observeOn(queueScheduler));

// subscribeOn 只會被使用一次，控制 subscription
of(42).pipe(subscribeOn(asapScheduler));

// 可用引數的方式設定 scheduler，很容易改變
interval(1000, asyncScheduler)
interval(0, animationFrameScheduler)

```

scheduler 的執行順序

```typescript
import { of, merge, asapScheduler, asyncScheduler, queueScheduler, animationFrameScheduler } from 'rxjs';
import { filter, startWith, observeOn } from 'rxjs/operators';

const delay = 0;
const async$ = of('async')
  .pipe(observeOn(asyncScheduler, delay));

const asap$ = of('asap')
  .pipe(observeOn(asapScheduler, delay));

const queue$ = of('queue')
  .pipe(observeOn(queueScheduler, delay));

const animate$ = of('animate')
  .pipe(observeOn(animationFrameScheduler, delay));

merge(async$, asap$, queue$, animate$)
  .pipe(filter(x => !!x))
  .subscribe(console.log);

console.log('after subscription')
```

執行結果

![](https://i.imgur.com/MF9RTd7.png)

這次，我們將 scheduler 加上 delay 的設定，在看一次跑出來的結果

```typescript
import { of, merge, asapScheduler, asyncScheduler, queueScheduler, animationFrameScheduler } from 'rxjs';
import { filter, startWith, observeOn } from 'rxjs/operators';

const delay = 1;
const async$ = of('async')
  .pipe(observeOn(asyncScheduler, delay));

const asap$ = of('asap')
  .pipe(observeOn(asapScheduler, delay));

const queue$ = of('queue')
  .pipe(observeOn(queueScheduler, delay));

const animate$ = of('animate')
  .pipe(observeOn(animationFrameScheduler, delay));


merge(async$, asap$, queue$, animate$)
  .pipe(filter(x => !!x))
  .subscribe(console.log);

console.log('after subscription')
```

執行結果

![](https://i.imgur.com/mPk6oXs.png)

整個執行順序大改變，十分有趣的結果。根據結果可以推測，當加上 delay 時，全部的 scheduler 都會轉變成 `asyncScheduler`的行為模式。

# Dive In

底層 scheduler 到底是怎麼運作的，scheduler 會包含 4 個元素

* scheduler：建立並執行 `action` 
* work：一段可以被執行的程式
* action：執行 `work`，回傳  `subscription`
* subscription：用來取消 observable

## Work

一段可以被執行的程式碼

```typescript
(state)=> { 
	console.log('state:', state);
}
```

## Action

建立 Action 可透過 `scheduler.schedule(work, delay, state)` 的方式，且會根據 delay 決定執行時間，並回傳 `subscription`

```typescript
asyncScheduler.schedule((state)=> console.log(state), 0, 42);
```

## Subscription

Subscription 是用來取消 Observable 的物件，本身也可以加入其他的 subscription，當本身執行 `unsubscription` 時，加到本體的其他 subscription 也會執行 `unsubscription`

```typescript
const sub = new Subscription();
const sub1 = queueScheduler.schedule((state)=> console.log(state), 0, 42);
const sub2 = queueScheduler.schedule((state)=> console.log(state), 0, '123');

sub.add(sub1);
sub.add(sub2);
sub.unsubscribe();
```

# Reacp

為什麼要了解 scheduler，透過 scheduler 我們可以寫出很多有趣的東西。使用 work 搭配 scheduler，可以更有彈性的非同步與同步的工作整合在一起，表示並一定要使用 operators，也可以享受 RxJS 的好處


# 參考資料

* [observeOn](https://rxjs-dev.firebaseapp.com/api/operators/observeOn)
* [subscribeOn](https://rxjs-dev.firebaseapp.com/api/operators/subscribeOn)





