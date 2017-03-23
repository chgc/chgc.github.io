---
layout: post
title: '[Angular] 結構性 Directive'
comments: true
date: 2017-03-23 09:04:32
categories: Angular
tags: Angular
---

Angular 的 `directive` 真的很厲害，幾乎什麼都能做，除了可以擴充原本 element 的功能外，也還可以做到結構上的控制變化，而這一類型的稱為 `Structural directive`

<!-- more -->

> Structural directives—change the DOM layout by adding and removing DOM elements.

我們可以透過這一款的 directive 來新增或移除 DOM element。但在這之前，需要重新介紹 `*` 這一個語法糖

# asterisk (*)

`*` 會用 `<ng-template>` 將 directive 所處的 element  包起來。[^註1]


```html
<div *ngIf="hero" >{{hero.name}}</div>

// 上述將會轉換成下述

<ng-template  [ngIf]="hero" >
	<div>{{hero.name}}</div>
</ng-template>
```

ng-template 裡的內容可以透過 `TemplateRef` 取得

[^註1]: Angular 4 以後，原本的`<template>` 會使用 `<ng-template>` 替代

# 簡易版

```typescript
@Directive({ selector: '[myIf]'})
export class MyIfDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) { }

  @Input() set myIf(condition: boolean) {
    if (condition) {
      // 新增 DOM
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // 移除 DOM
      this.viewContainer.clear();
    }
  }
}
```

使用 directive 的方式

```html
<div *myIf='condition'></div>
```

* `templteRef` 的部分，請參閱上一區段的說明


* `ViewContainerRef` 是指目前 `directive`的所在位置

透過這兩個物件，就可以完成 `structural directive`的實作，其實並不困難



# 稍微進階版

我們也可以將 service 注入到 directive 裡面，透過 RxJS 的幫助，可以讓 directive 處於自動監測的狀態，當全域某特定變數改變時，directive 也會跟著改變。聽起來很神奇，那時做起來會很困難嗎?

```typescript
@Directive({ selector: '[isAuth]'})
export class MyIfDirective {
  user$ : Subscription;
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
    private userService: UserService) { }

  
  ngOnInit() {
    this.user$ = this.userService.user
      .do(() => this.viewContainer.clear())
      .filter(user => user.isLogin)
      .subscribe(() => {
        this.viewContainer.createEmbeddedView(this.templateRef);
      });
  }

  ngOnDestroy() {
    this.user$.unsubscribe();
  }
}
```

打完收工，夠簡單了吧。這寫法跟我們在寫 Component 根本就沒有差別，這就是 Angular 的優點，程式碼格式的一致性很高。



# 參考閱讀

* [STRUCTURAL DIRECTIVES](https://angular.io/docs/ts/latest/guide/structural-directives.html)



