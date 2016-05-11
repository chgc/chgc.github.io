---
layout: post
title: "[Angular2]What's Structural Directives"
comments: true
date: 2016-05-10 20:10:18
categories: Angular
tags: Angular2
---

Angular2 Directives - Structural Directives : 改變DOM element的Directive。常見的structural directives有 ngIf, ngSwitch, ngFor
用法如下.

<!-- more -->
```html
<div *ngIf="hero">{{hero}}</div>
<div *ngFor="let hero of heroes">{{hero}}</div>
<div [ngSwitch]="status">
  <template [ngSwitchWhen]="'in-mission'">In Mission</template>
  <template [ngSwitchWhen]="'ready'">Ready</template>
  <template ngSwitchDefault>Unknown</template>
</div>
```


## `<template>` Tag

在Angular2外，`<template>`預設CSS是設定為display: none. 其內容是不會顯示，在Angular2內是會被移除然後被該位置會被置換成`<script></script>`

在一開始的Code裡，ngIf和ngFor的前面有一個`*`, 而在`ngSwitchWhen`卻是用 `<template>`和`[ngSwitchWhen]`組合要顯示的文字。而這一個 `*` 的使用會帶來一些神奇的效果。下面繼續來研究

## 星號 (*) 的效果

常見的範例

```html
<p *ngIf="condition">	
    condition is true and ngIf is true.
</p>
```

在ngIf前面的 ***** 是一個很神奇的東西，他可以讓我們少寫`<template>` tag，如果不要寫 `*` 的話，那程式碼就要寫成這樣

```html
<template [ngIf]="condition">
  <p>
    condition is true and ngIf is true.
  </p>
</template>
```

```html
<!-- Examples (A) and (B) are the same -->

<!-- (A) *ngFor div -->
<div *ngFor="let hero of heroes">{{ hero }}</div>

<!-- (B) ngFor with template -->
<template ngFor let-hero [ngForOf]="heroes">
  <div>{{ hero }}</div>
</template>
```

所以 `*` 的確省去很多工作，來改寫一下 以下的程式碼

```html
<div [ngSwitch]="status">
  <template [ngSwitchWhen]="'in-mission'">In Mission</template>
  <template [ngSwitchWhen]="'ready'">Ready</template>
  <template ngSwitchDefault>Unknown</template>
</div>
```

用 * 來修改一下程式碼

```html
<div [ngSwitch]="status">
  <span *ngSwitchWhen="'in-mission'">In Mission</span>
  <span *ngSwitchWhen="'ready'">Ready</span>
  <span *ngSwitchDefault>Unknown</span>
</div>
```

## 參考

* [Angular2 Doc: Structural Directives](https://angular.io/docs/ts/latest/guide/structural-directives.html)

