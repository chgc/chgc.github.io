---
layout: post
title: '[Angular] 如何測試含有 delay 的 observable?'
comments: true
date: 2018-05-18 23:08:13
categories: Angular
tags: Angular
---

Angular 內要測試 Observable 的方式有很多種，但有一種東西很難測，就是當遇到控制時間相關的 operators 出現時，測試就變得很有趣了。這篇文章整理一下如何測試這一類的 observable

<!-- more -->

# 前題

這裡有一個需要被測試的動作，這裡我需要測試在 n 秒後，我一開始 push 到陣列裡面的資料，是否會被移出陣列，當 `this.message$.next(...)` 的時候，就會同時間觸發一個 `remover$` (定時器，用來移除資料用)。所以問題是，我要如何測試這段程式碼邏輯呢?

```typescript
message$ = this.service.message$;
messages: CommandModel[] = [];
tasks$ = new Subject<Observable<any>>();
remover$ = of('').pipe(
    delay(environment.delayTime),
    tap(() => this.messages.shift())
);
...
this.tasks$.pipe(mergeMap(task => task)).subscribe();
this.message$
    .pipe(tap(value => this.messages.push({ ...value })))
    .subscribe(value => {
    this.tasks$.next(this.remover$);
});
```

RxJS 6 版以後，提供了一個 `TestScheduler ` 可以讓我們來做 Observable 的測試，這裡整理出如何測試 `delay` 這一個東西，(~~花了我一個下午，看了 n 篇文章後，整理出來的結果~~)

# TestScheduler

在講實際測試程式碼前，有幾個東西需要介紹一下

```typescript
 const testScheduler = new TestScheduler((actual, expected) => {
    // 這裡寫 jasmine 的 expect 的比較程式碼
    // expect(component.messages.length).toBe(0);
 });
```

當建立完 `TestScheduler` 後會回傳一個物件，再來就可以透過這一個物件來跑我們要測試的 observable

```typescript
testScheduler.run(({ cold, expectObservable }) => {
	// marble testing 的程式碼寫在這邊
    
});
```

當執行 `.run((...)=>{})` 的 callback functions 會有一個系列的參數可以使用

```typescript
testScheduler.run(helpers => {
  const { cold, hot, expectObservable, expectSubscriptions, flush } = helpers;
  // use them
});
```

## API

* `hot(marbleDiagram: string, values?: object, error?: any)` - 建立一個 `Hot observable ` (像 Subject)，當測試開始時，預設行為是一個已經啟動的 observable， 與 cold 的差異是 hot 可以使用 `^` 這個符號`^` 是用來標示 `Zero frame` 的位置，這一個位置是 observable 真正開始的位置.
* `cold(marbleDiagram: string, values?: object, error?: any)` - 建立一個 `Cold Observable` ，測試開始時，observable 才會被啟動.
* `expectObservable(actual: Observable<T>).toBe(marbleDiagram: string, values?: object, error?: any)` - 排程一個 assertion 給 `TestScheduler.flushes` 執行.
* `expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]).toBe(subscriptionMarbles: string)` - 類似 `expectObservable` ，`cold()` 和 `hot()` 都會回傳一個含有型別為 `SubscriptionLog[]` 的`subscriptions` 的 observable，將該  `subscriptions` 傳給 `expectSubscriptions`  去比較是否有符合 `subscriptionsMarbles` marble diagram 所給予的期待值. 
* `flush()` - 立即執行虛擬時間，但因為 `run()` 當 callback 回傳時就會自動更新，所以比較少使用，但在某些特殊情況下，還是會手動觸發 flush 的動作

## 驗證測試程式碼

以下是我用來測試 `delay` 的程式碼

```typescript
import { TestScheduler } from 'rxjs/testing';
...

it('should clear out meesages array after 3 sec', () => {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(component.messages.length).toBe(0);
    });

    testScheduler.run(({ cold, expectObservable }) => {
      const input = cold('-a--|');
      const output = input.pipe(tap(v => component.message$.next({} as any)));
      const expected = '-- 2999ms a ---|';
      expectObservable(component.remover$).toBe(expected);
    });
});
```

## 彈珠圖符號說明

有看到在 `cold` 裡面的文字，那個既是所謂的彈珠圖表示法，以下是符號的說明

* `' '` 空白: 水平空白會被忽略，可用來與其他的彈珠圖對齊使用
* `'-'` frame: 1 個frame 代表一個單位的虛擬時間的流逝，可設定每一個 frame 的時間長度.
* `[0-9]+[ms|s|m]` 時間進行: 可利用數字搭配時間單位來表示一個長時間的虛擬時間的進行，時間單位有 `ms` (milliseconds), `s` (seconds), or `m` (minutes) ，數字與單位中間沒有任何空白 e.g. `a 10ms b`
* `'|'` 完成(complete): 表示一個成功完成的事件，會觸發 `complete() ` 事件.
* `'#'` 錯誤(error): 表示發生錯誤發生，會觸發 `error()` 事件.
* `[a-z0-9]` e.g. `'a'`  任何英文數字符號，代表 next() 時會送出的值.
* `'()'` 同步群組(sync groupings): 在同一個時間點需要呈現多個事件時，可利用 `()` 的方式包起來，在小括弧內的事件，都是發生在同一個時間點的
* `'^'` subscription point: (hot 限定)

其他更細節的說明，可以參考下面的參考文件了



# 參考文件

* [marble-testing](https://github.com/ReactiveX/rxjs/blob/master/doc/marble-testing.md)
* [angular.io - testing](https://angular.io/guide/testing#component-marble-tests)