---
layout: post
title: '[Angular] CDK 系列 - Portal'
comments: true
date: 2017-12-02 09:54:02
categories: Angular
tags: Angular
---

Angular Material 團隊在前一陣子推出 Angular CDK 的套件，什麼是 Angular CDK ? 簡單的說就是 Angular material 2 底層在使用的功能而樣式的部分就留給我們自己設計。

> The goal of the CDK is to give developers more tools to build awesome components for the web. This will be especially useful for projects that want to take advantage of the features of Angular Material without adopting the Material Design visual language. — **Angular Team**

<!-- more -->

# Introduction

CDK 這一系列的文章就會記錄探索 CDK 功能的筆記，今天會先從 Portal 開始看起。

`Portal` 是什麼 ? Portal 是一個可以讓我們動態載入 Component 的一個功能。跟 `ngComponentOutlet` 要達到的效果是一樣的，但是 `Portal` 又額外提供一些功能能讓我們做延伸的應用

Angular CDK裡的 Portal 有兩個元素

1. `Portal`  是用來包 template 或是 component 的
2. `PortalHost`  是顯示 portal 的地方，可以附加在網頁上的任何地方，例如 `document.body`

![](https://i.imgur.com/hBGkmW7.png)



# 基本用法

當要使用 Portal 相關的 directive 時，需要 import `PortalModule`

```typescript
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, PortalModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

```html
<div class="demo-portal-outlet">
  <ng-template [cdkPortalOutlet]="selectedPortal"></ng-template>
</div>
<button type="button" (click)="selectedPortal = programmingJoke">
  Programming joke
</button>

<button type="button" (click)="selectedPortal = mathJoke">
  Math joke
</button>
<ng-template cdk-portal>
  <p> - Why don't jokes work in octal?</p>
  <p> - Because 7 10 11.</p>
</ng-template>

<div *cdk-portal>
  <p> - Did you hear about this year's Fibonacci Conference? </p>
  <p> - It's going to be as big as the last two put together. </p>
</div>

```

```typescript
import { Component, ViewChildren, QueryList } from '@angular/core';
import { Portal, CdkPortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChildren(CdkPortal) templatePortals: QueryList<Portal<any>>;
  selectedPortal: Portal<any>;

  get programmingJoke() {
    return this.templatePortals.first;
  }

  get mathJoke() {
    return this.templatePortals.last;
  }
}

```

當按鈕按下時，就會將 `<ng-template [cdkPortalOutlet]="selectedPortal"></ng-template>` 換成我們想要顯示的內容，同樣的，如果要將 Component 顯示在同一個位置，可以這樣子寫

```typescript
 get scienceJoke() {
    return new ComponentPortal(ScienceJoke);
 }
```

使用 `ComponentPortal` 來將 `component` 包起來後，就可以顯示在 `cdkPortalOutlet` 的所在位置了



# 進階用法

假使說，不想要透過 `ckdPortalOutlet` 的方式，是否有辦法透過程式的方式，動態插入到畫面上呢? 

`cdk/portal`有提供另外一個方法叫做 PortalHost，可以透過這一個物件來將 Portal 顯示在我們所指定的位置上

app.component.ts
```typescript
...
private bodyPortalHost: DomPortalHost;

constructor(
  private componentFactory: ComponentFactoryResolver,
  private appRef: ApplicationRef,
  private injector: Injector
) {}

ngAfterViewInit() {
    this.bodyPortalHost = new DomPortalHost(
      document.querySelector('#display'),
      this.componentFactory,
      this.appRef,
      this.injector
    );
  }
setDisplayPort(displayPortal) {
  if (this.bodyPortalHost.hasAttached) {
    this.bodyPortalHost.detach();
  }
  this.bodyPortalHost.attach(displayPortal);
}
```
index.html
```html
...
<div id="display"></div>
<app-root></app-root>
...
```
app.component.html
```html
<button type="button" (click)="setDisplayPort(programmingJoke)">
  Programming joke
</button>

<button type="button" (click)="setDisplayPort(mathJoke)">
  Math joke
</button>
<ng-template cdk-portal>
  <p> - Why don't jokes work in octal?</p>
  <p> - Because 7 10 11.</p>
</ng-template>

<div *cdk-portal>
  <p> - Did you hear about this year's Fibonacci Conference? </p>
  <p> - It's going to be as big as the last two put together. </p>
</div>

```

當按鈕按下時，就會將所要顯示的 `ng-template` 透過 DomPortalHost 的方式插入到所指定的位置，而這個位置不侷限於 Angular 的頁面上，可以指到任何地方，只要能取到該 HTMLElement 即可

![](https://i.imgur.com/y6UZWEt.png)

這裡需要留意的是 一個`DomPortalHost` 一次只能顯示一個 `Portal` ，當要顯示不同 `Portal` 時，就必須先將之前的移除 (`detach()`)

## 相關API

* `hasAttached` 判斷 DomHostPortal 是否有附加任何的 Portal
* `attach` 附加 Portal 至 DomHostPortal 上
* `detach` 從 DomHostPortal 上移除 Portal
* `dispose`清除 DomHostPortal 物件

# 參考資料

* [Angular CDK - Portal](https://material.angular.io/cdk/portal/overview)





