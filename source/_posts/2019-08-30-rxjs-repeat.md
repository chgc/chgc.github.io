---
layout: post
title: '[RxJS] 探討 repeat'
comments: true
typora-root-url: 2019-08-30-rxjs-repeat
typora-copy-images-to: 2019-08-30-rxjs-repeat
date: 2019-08-30 09:40:57
categories: Angular
tags: Angular
---

來探討一下 RxJS 的 `repeat` 這個 operator

<!-- more -->

# repeat 的功能

> `repeat` 的功能是當一個 `Observable` 完成時，會重新再 `subscribe` `n` 次

使用的方式是

```typescript
obs.pipe(retry()).subscribe();
```

* `repeat(count: number: -1)` 當不給重複的次數時，將會一直有作用

![repeat marble diagram](repeat.png)

# 基本範例

```typescript
import { of } from 'rxjs';
import { repeat, delay } from 'rxjs/operators';

const source = of('Repeat message');
const example = source.pipe(repeat(3));
example.subscribe(x => console.log(x));

// Results
// Repeat message
// Repeat message
// Repeat message
```

# 探討

根據上面的簡單介紹，可以知道 `repeat` 的用法。延伸思考，`repeat` 的作用範圍是如何定義，而 Observable 所傳出的值是否如果我們所預期的呢? 如果搭配其他的 operator 是否有先後順序的問題?

先來一個簡單的問題，重複取十次值

```typescript
const source = () => new Promise((resolve)=> resolve(Math.random()*10));

from(source())
.pipe(
  repeat(10)
)
.subscribe({
  next: value=> console.log(value)
});
```

## 順序重要嗎?

根據實驗，順序其實不重要，都會被重新 subscribe

## Observable 的值呢

根據實驗，repeat 所使用的 observable 值是第一次發生的結果，這表示，如果想要做到每一次重新啟動都要觸發 source observable 時，就必須使用不同的寫法

![1567137814105](1567137814105.png)

* 解法1: 如果想要的效果可以使用 interval 完成，改用 interval + mergeMap(or other map) + take 來完成

  ![1567137918853](1567137918853.png)

* 解法2: 使用 `defer` 來包 Observable/Promise

  ```typescript
  const source = () => new Promise((resolve) => resolve(Math.random() * 10));
  
  defer(() => from(source()))
    .pipe(
      repeat(10)
    )
    .subscribe({
      next: value => console.log(value)
    });
  ```

  ![1567137859126](1567137859126.png)

  

## 啟動範圍

`repeat` 會重新 subscribe 所歸屬的 Observable

![1567138639858](1567138639858.png)

  

# 小結

每一個 operator 都有可以細細品嘗的細節，跟 repeat 類似的 operator 有 `repeatWhen` 、`retry`、`retryWhen` ，也都可以去看看了解一下



