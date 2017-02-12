---
layout: post
title: '[RxJS]使用情境(2)- Component Input watcher'
comments: true
date: 2017-02-12 22:28:53
categories: Angular
tags: 
- Angular
- RxJS
---

另外一個簡單的使用情境：Angular Component的 @Input Value，我要怎麼持續併動態的根據 @Input Value 取得相對應的資料呢?

<!-- more -->

假設我有一個 Component，這個 Component 有一個 @Input() 的 id 欄位，我想要根據這個 id 的值，每 5 秒跟主機要一次資料，但是這個 id 有可能會被改變掉，所以從主機要資料回來的條件，也要跟著改變。以下解法，可以參考看看，並非唯一解法。

```typescript
export class DetailComponent implements OnChanges, OnDestroy {
  @Input() id: number;

  sub$: Subscription;
  subject: Subject<any> = new Subject();
  data: any;

  constructor() { 
   this.sub$ = Observable.combineLatest(
      Observable.timer(0,5000), 
      this.subject, 
      (t, s) => s)
      .concatMap(id => this.getData(id))
      .subscribe(x => this.data = x);
  }

  ngOnChanges() {
    this.subject.next(this.id);
  }

  ngOnDestroy() {
    this.sub$.unsubscribe();
  }

  getData(s) {
    // here can be http call
    return Observable.of(s);
  }

}
```

這裡用到 `combineLatest` 這個 operator，有三個參數要輸入，前兩個接受 Observable，第三個參數是前兩個 Observable 最後一次分別所產生的資料，可以透過第三個參數將兩條 Stream 資料傳出或是傳給下一個 operator 使用。

以上的程式碼，就可以做到每 5 秒取一次資料，再取資料時，會依當下 id 這個欄位作為取資料的條件。