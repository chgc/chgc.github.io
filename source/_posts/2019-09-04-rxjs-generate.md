---
layout: post
title: '[RxJS] generate'
comments: true
typora-root-url: 2019-09-04-rxjs-generate/
typora-copy-images-to: 2019-09-04-rxjs-generate/
date: 2019-09-04 13:55:48
categories: Angular
tags: Angular
---

`generate` 是 RxJS 裡面的 for loop 方法，這樣的描述應該夠簡單明瞭了

<!-- more -->

# 基本用法

這是 JavaScript for loop 的寫法

```javascript
for(let i=0; i< 100; ++i){
    ...
}
```

而這是 RxJS 使用 generate 的寫法

```typescript
generate(0, x=> x< 100, x=> ++x)
```

generate 介面

```typescript
generate<T, S>(initialStateOrOptions: S | GenerateOptions<T, S>, condition?: ConditionFunc<S>, iterate?: IterateFunc<S>, resultSelectorOrObservable?: (ResultFunc<S, T>) | SchedulerLike, scheduler?: SchedulerLike): Observable<T>
```

# 變化用法

## with resultSelector

```typescript
const source = generate(0, x => x < 10, x => ++x, x => x + '!!');

source.subscribe({
  next: v => console.log(v)
})
```

輸出結果

![1567578743411](1567578743411.png)

## 串接其他 observable

* with from

  ```typescript
  const source = from(['a', 'b', 'c']).pipe(
    concatMap((value) => generate(0, x => x < 3, x => ++x, x => value + '-' + x))
  )
  
  source.subscribe({
    next: v => console.log(v)
  })
  ```

  ![1567579046848](1567579046848.png)

* double generate

  ```typescript
  const source = of(['a', 'b', 'c', 'd']).pipe(
    concatMap((value) => generate(0, x => x < value.length, x => ++x, x => value[x] + '-' + x)),
    concatMap((value) => generate(0, y => y < 3, y => ++y, y => value + '-' + y))
  )
  
  source.subscribe({
    next: v => console.log(v)
  })
  ```

  ![1567579775214](1567579775214.png)

## range 效果

RxJS 裡面原本就有一個 `range` 的  observable，但是卻沒有辦法設定 step，這時候就可以使用 generate 來完成這件事情

```typescript
const source = generate(0, x => x < 10, x => x + 2)

source.subscribe({
  next: v => console.log(v)
})
```

![1567580096145](1567580096145.png)

# 參考資料

* [Generate API](https://rxjs.dev/api/index/function/generate)