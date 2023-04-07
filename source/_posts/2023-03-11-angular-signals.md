---
layout: post
title: '[Angular] Signals 嘗鮮'
comments: true
typora-root-url: 2023-03-11-angular-signals/
typora-copy-images-to: 2023-03-11-angular-signals/
date: 2023-03-11 09:45:03
categories: Angular
tags: Angular
---

Angular 嘗試在下一世代中加入新的 reactive 機制，試圖找到取代 zone.js 的方式，因此引進了 `signals` 來試試看是否能成為下一代 change detection 的選擇。想要嘗試的朋友可以安裝 `angular cli v16` 的版本

<!-- more -->

## 什麼是 Signals

Signals 不是 Angular team 創造出來的 library，而是引用其他 framework 內所有使用的一個機制，如果沒記錯應該是來自 `[SolidJS](https://www.solidjs.com/tutorial/introduction_signals)`

> *Signals* are the cornerstone of reactivity in Solid. They contain values that change over time; when you change a signal's value, it automatically updates anything that uses it.

## 如何在 Angular 內使用 Signals 

### 建立 signal 物件

```typescript
import { Component, signal } from '@angular/core';

@Component({....})
export class AppComponent {
  count = signal(0);
}
```

`signal` 介面

```typescript
function signal<T>(initialValue: T, equal?: ValueEqualityFn<T>): SettableSignal<T>
```

### 顯示

要取得 signal 物件值的方式很直接，直接當 function 使用即可，接續上面的範例

```html
{{ count() }} 
```

這樣就可以在 html 上顯示 count 的值了，或許會問不要在 html render 時寫 function call 嗎，會有效能問題，這裡這樣使用是沒有問題的 (之前有聽 angular team 說為什麼不會有問題，但我忘記理由了)

### 更新

當建立一個 signal 物件後，更新值得方式有三種，`set` 、`update`  和 `mutate`

- set: Directly set the signal to a new value, and notify any dependents.

  ```typescript
  set(value: T): void;
  ```

  

- update: Update the value of the signal based on its current value, and notify any dependents.

  ```typescript
  update(updateFn: (value: T) => T): void;
  ```

  

- mutate: Update the current value by mutating it in-place, and notify any dependents.

  ```typescript
  mutate(mutatorFn: (value: T) => void): void;
  ```

### 範例

```typescript
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    Count: {{ count() }}
    <button (click)="increase()">+</button>
    <button (click)="reset()">reset</button>
  `,
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class AppComponent {
  count = signal(0);

  reset() {
    this.count.set(0);
  }

  increase() {
    this.count.update((c) => ++c);
  }
}

```

## 進階用法

開頭有提到 signals 是一個 reactive library，當然不會只有這種單一值的使用情境，一定會有錯綜複雜的使用情境，這時候會怎麼使用呢

```typescript
import { Component, signal, computed } from '@angular/core';
@Component({
 ...
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
	...
  `,
  ...
})
export class AppComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);
  ...
}
```

`computed` 可以讓我們與其他 signal 作互動結合，當 computed 內的 signal 值改變時，此 computed 結果也會跟著改變，使用上算直覺

```typescript
export declare function computed<T>(computation: () => T, equal?: ValueEqualityFn<T>): Signal<T>;
```

除了 computed，還有一個是 `effect`

```typescript
export declare function effect(effectFn: () => void): Effect;
```

須留意的是兩者回傳的物件是不一樣的，`computed` 會回傳一個新的 `Signal` 物件，但 `effect` 是回傳一個 `Effect` 物件，這 Effect 型別的物件可以允許我們停用 `effect` ，類似 Observable.subscribe 會回傳 subscription 的概念

```typescript
  ngOnInit() {
    effect(() => {
      console.log(this.count());
    });
  }
```

## RxJS 怎麼辦?

Signal 的使用方式與 RxJS 其實有很大部分是重疊的，但 RxJS 有很好用的 operators，這時候該怎麼辦呢? 是否有方法能結合兩者。在 GitHub 上面有一個 PR 就是要解決這個問題，Angular team 提供兩個 function，`fromSignal` 和 `fromObservable`，這過這兩個 function  可以將 Observable 和 Signal 物件做彼此轉換，我是覺得這樣就可保留相當的彈性了，當然也要等實際使用在產品才能知道會有那些坑



## 參考資料

- [[Watch This Space] Angular Reactivity with Signals](https://github.com/angular/angular/discussions/49090)
- [Angular & signals. Everything you need to know.](https://dev.to/this-is-angular/angular-signals-everything-you-need-to-know-2b7g)

