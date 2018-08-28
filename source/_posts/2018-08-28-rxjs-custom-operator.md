---
layout: post
title: '[Angular] 自訂 RxJS Operator'
comments: true
date: 2018-08-28 09:37:53
categories: Angular
tags: Angular
---

RxJS 6.x 使用 `pipe` 之後，建立 operators 的方法就又更簡單了。不論是重構將部分的動作成一個自訂 operator ，或是整合其他 library 成為另外一個新的 operator，都遠比之前版本簡單，以下提供一些方法及方向供參考

<!-- more -->

# 重構抽離

以常見的 autocomplete 的功能來說，以下是範例程式碼

```typescript
  this.clients = this.searchTerms
      .pipe(
      	debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.clientSearchService.search(term)),
        catchError(error => of([]))
      );  
```

有時候我們可以將幾個動作先抽離成一個單獨的 functions 然後再串接到 pipe 裡面，主要是方便程式碼的閱讀，畢竟太細節的操作步驟並不是我們真的後續維護要看的重點，重構後的程式碼如下

```typescript
const avoidTriggerTooFast = (timeWindow) => 
	obs => obs.pipe(
	    debounceTime(timeWindow),
        distinctUntilChanged(),
     );
this.clients = this.searchTerms
      .pipe(
        this.avoidTriggerTooFast(300),
        switchMap(term => this.clientSearchService.search(term)),
        catchError(error => of([]))
      );
```

重構步驟

1. 建立一個接受一個 Observable 回傳一個 Observable 的 function
2. 將想要抽離的 operators 搬到新方法下
3. 將原本位置替換成新的 function

# 自訂 Operators

既然重構的起手式是 **建立一個接受一個 Observable 回傳一個 Observable 的 function** ，那創造出一個新的 operators 也可以跟隨相同的規則

```typescript
import { Observable, from } from 'rxjs';

const multiply = (multiplyBy) => (source: Observable<any>) => new Observable(observer => {
  return source.subscribe({
    next(n) { observer.next(n * multiplyBy); },
    error(err) { },
    complete() { }
  });
});

const source$ = from([1, 2, 3]);

source$.pipe(multiply(2)).subscribe(console.log);

```

建立步驟

1. 從 `rxjs` 取得 `Observable` 
2. 建立一個接受一個 Observable 回傳一個新的 `Observable` 物件
3. 在 subscribe 處理，`next`、`error` 和 `complete`，將相關的動作對應到上層 (`new Observable()`) 的 observer 

上面是最原始的作法，但我們能發現很多自訂 operators 的動作都是在進行資料轉型，所以我們可以直接透過 `map` 的 operators 來完成相同的動作

```typescript
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

const multiply = (multiplyBy) => map((n: number) => n * multiplyBy);

const source$ = from([1, 2, 3]);

source$.pipe(multiply(2)).subscribe(console.log);

```

這樣的寫法，是否乾淨許多。當然其他內建的 RxJS operators 也可以拿來使用

# 整合 Library

在往進階一點看，如果整合其他的 JS Library 或是自己寫的 helper function 呢? 類似 `lodash` ， 其實做法都一樣，以下給個範例，應該很快就能掌握住方向，

```typescript
import { from } from 'rxjs';
import { filter } from 'rxjs/operators';
import _isNumber from 'lodash/isNumber';

const isNumber = () => filter(_isNumber);

const source$ = from([1, 2, '3']);

source$.pipe(
  isNumber()
).subscribe(console.log);
```



# 結論

其實 RxJS 寫到後面，會使用到一些 FP 的開發技巧，趁著這機會，了解一下 FP 的開發模式，對於寫 RxJS 會有很大的幫助。

# 參考資料

* [Custom RxJS Operators by Example](https://youtu.be/JWjXBWINlzU)