---
layout: post
title: '[Angular] ChangeDetector 之 markForCheck 篇'
comments: true
date: 2017-08-09 08:56:21
categories: Angular
tags: Angular
---

Angular 的 Change Detection 機制，問題： 在使用 `onPush` 策略時，一定都要重新傳新物件才能出發更新嗎? 答案：**不用**

<!-- more -->

ChangeDetecotrRef 提供了一些方法，允許我們手動觸發檢查更新機制，而 `markForCheck` 是其中一個

# markForCheck

`markForCheck` 的用途，當呼叫這個方法時，就是告訴 `ChangeDetector` ，請檢查我，因為我有資料異動了。當下次有事件觸發 `ChangeDetection`時，就會檢查並更新 Model 資料到 View 上。

以下提供幾個可能使用情境



# 使用情境

## setTimeout、setInterval

可以從我之前寫的[文章](https://blog.kevinyang.net/2017/01/23/angular2-change-detection/)溫習一下什麼是 `ChangeDetectionStrategy.OnPush`

當 Component 的 `changeDetection` 設定為 `ChangeDetectionStrategy.OnPush`，如果有使用 `setTimeout` 時，就必須配合 `markForCheck()` 的方法來更新 View 的顯示。

```typescript
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent  {
  vcard = [{name: 'Kevin'}];  
  constructor(public cd: ChangeDetectorRef) {}

  ngOnInit() {
    setTimeout(() => {
      this.vcard.push({name: 'Jeff'});
      // this.cd.markForCheck(); // you can comment/uncomment this line to see the difference
    }, 2000);
  }  
}

```

這裡有簡單的程式碼，可以到[這裡](https://stackblitz.com/edit/markforcheck-settimeo)實際執行看看，取消註解後看看執行的結果。

## Input as DataStream

當 `@Input` 的資料型態為 Observable 再加上 `onPush` 時，也會有 `setTimeout`、`setInterval` 的情況出現，所以這時候也必須依賴 `markForCheck` 來執行顯示更新

```typescript
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-v-card',
  templateUrl: './v-card.component.html',
  styleUrls: ['./v-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VCardComponent implements OnInit {
  @Input() data: Observable<any>;
  info: any;
  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.data.subscribe(data => {
      this.info = data;
      // this.cd.markForCheck();
    });
  }
}
```

這裡有簡單的程式碼，可以到[這裡](https://stackblitz.com/edit/markforcheck-datastream)實際執行看看，取消註解後看看執行的結果。

#  參考資料

* [API - ChangeDetectorRef](https://angular.io/api/core/ChangeDetectorRef#markForCheck)