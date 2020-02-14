---
layout: post
title: '[Angular] 不要在 Angular template expression 中使用 function，這是不好的'
comments: true
typora-root-url: 2020-02-14-angular-dont-use-function-in-template-expression
typora-copy-images-to: 2020-02-14-angular-dont-use-function-in-template-expression
date: 2020-02-14 09:56:54
categories: Angular
tags: Angular
---

Angular 原本的顯示效能，在沒有刻意調教的情況下，已經有不錯的表現，但如果有不當的寫法出現，依然可造成如 AngularJS 一樣顯示效能低落的問題，這是可以避免的狀況，只要稍微多留意一些

這一篇文章將會針對 HTML Template 的部分，一個小地方沒留意，就可以大大的拖累整個顯示效能

<!-- more -->

Angular 顯示變數到畫面上的方式，基本語法如下

```html
{{ some-variable }}
```

當資料稍微複雜一點或是想要顯示組合文字時，有能會使用 function 來代替變數，而這一個動作將會造成很大的效能問題，這裡有一個簡單的範例程式來展示使用 function 會造成 Angular Change Detector 過勞

```typescript
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { User } from '../data';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  @Input() user: User;

  calculateFullNameCounter = 0;

  fullName() {
    this.calculateFullNameCounter++;
    return `${this.user.name}(${this.user.username})`;
  }
}

```

```html
<p>使用者: <strong>{{ fullName() }}</strong></p>
<p class="amount">計次: <span>{{ calculateFullNameCounter }}</span></p>
```

* `AppComponent`

```typescript
import { Component } from '@angular/core';
import { users } from './data';
@Component({
  selector: 'app-root',
  template: `
    <button (click)="next()">下一位</button>
    <button (click)="justclick()">只是一個觸發 CD 的按鈕</button>
    <app-user [user]="currentUser"></app-user>
  `,
  styles: []
})
export class AppComponent {
  title = 'nofninexpression';
  users = users;
  currentUser;
  currentIndex = 0;

  ngOnInit() {
    this.currentUser = this.users[this.currentIndex];
  }

  next() {
    ++this.currentIndex;
    if (this.currentIndex >= this.users.length) {
      this.currentIndex = 0;
    }
    this.currentUser = this.users[this.currentIndex];
  }

  justclick() {}
}

```

* 執行結果 ([範例程式碼](https://stackblitz.com/edit/angular-fcetcv))

![image-20200214113647591](image-20200214113647591.png)

當按下上方的【只是一個觸發 CD 的按鈕】，會發現計次的數字又多跳了好幾個 (請忽略這個錯誤，這個錯誤是為了要顯示數字而造成的)，但到底為什麼?

Angular 的 Change Detection 會決定畫面上那一部分的內容需要被重新產生，所以他會比較這次的值與上一次的值是否相同，如果有不同時，就會重新顯示該區塊的畫面，但是 Change Detection 卻沒有辦法確認 function 回傳值是否與上次相同，故每一次都會被重新顯示畫面，整個 App 或是該 Component 被觸發了 100 次 CD (Change Detection)，那 function 就會被執行 100 次

或許你會想使用 `onPush` 是否會有幫助 ([範例程式碼](https://stackblitz.com/edit/angular-vmeija?file=src%2Fapp%2Fuser%2Fuser.component.ts))? 而答案是確實會有幫助，在 Component 的 `ChangeDetection 策略` 設定為 `onPush` 時，確實只會讓 Component  本身與外界做隔離，但是，如果是 Component 本身的 CD 觸發時，例如按鈕的 click 等事件，所以還不是一個最佳的解法

以下提供兩種思考方向，來解決上述的問題

# 解決方案

## 手動

所謂的手動，是指事先將資料加工並儲存到另外一個變數上，不論是原本的 data model  或是額外的變數都可以，在畫面顯示該變數即可

```typescript
...
@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {
  @Input() user: User;

  calculateFullNameCounter = 0;
  calculateDisplayFullNameCounter = 0;
  fullName;
  ngOnChanges(change: SimpleChanges) {
    if (change.user) {
      this.fullName = this.transformData();
    }
  }

  displayfullName(){
    this.calculateDisplayFullNameCounter++;
    return `${this.user.name}(${this.user.username})`;
  }

  transformData() {
    this.calculateFullNameCounter++;
    return `${this.user.name}(${this.user.username})`;
  }

  onMouseMove() {}
}

```

```html
<h1>使用 function 顯示欄位</h1>
<p>使用者: <strong>{{ displayfullName() }}</strong></p>
<p class="amount">計次: <span>{{ calculateDisplayFullNameCounter }}</span></p>

<h1>手動整理顯示欄位</h1>
<p>使用者: <strong>{{ fullName }}</strong></p>
<p class="amount">計次: <span>{{ calculateFullNameCounter }}</span></p>

<h1>Trigger change detection</h1>
<p (mousemove)="onMouseMove()" class="hover-area">移動滑鼠觸發 CD </p>
```

可到[這裡](https://stackblitz.com/edit/angular-5wa324?file=src%2Fapp%2Fuser%2Fuser.component.html)看執行結果，會發現當手動先處理顯示欄位時，不論 CD 被觸發多少次，計次都不會增加，除了切換至下一位使用者

## Pipe

另外一種方式是透過 `Pipe` 的方式顯示，因為 `Pipe` 預設的行為是 pure 的，等同於 `onPush`，所以只有在串接的值有異動時才會被觸發執行

```typescript
import { Pipe, PipeTransform } from "@angular/core";
import { User } from "../data";

@Pipe({
  name: "displayFull"
})
export class DisplayFullPipe implements PipeTransform {
  transform(user: User): any {
    console.log('pipe been trigger')
    return `${user.name}(${user.username})`;
  }
}
```

```html
...
<h1>使用 Pipe 顯示欄位</h1>
<p>使用者: <strong>{{ user | displayFull }}</strong></p>
<p class="amount">計次: <span>請看 console </span></p>
...
```

當開啟 F12 看 Console 紀錄時，也只會看到 pipe 被觸發的時間點是 Input 的 User 資料改變時

* [範例程式碼](https://stackblitz.com/edit/angular-8qsqdr)

# 結論

雖然在 Template 上寫 Function 顯示很快速，但這就是一種技術債，當要還的時候還是得還，一開始就乖乖地寫不就好了，但如果要我選預設的處理方式，大概會是手動先將資料處理完成後，在來顯示，而 Pipe 的使用時機點是通用方法可以共用時，例如換行符號的更換等



# 參考資料

* [完整範例程式碼]()(https://stackblitz.com/edit/angular-8qsqdr)