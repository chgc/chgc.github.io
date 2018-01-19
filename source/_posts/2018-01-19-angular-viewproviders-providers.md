---
layout: post
title: '[Angular] viewProviders V.S. providers'
comments: true
date: 2018-01-19 08:15:25
categories: Angular
tags: Angular
---

Angular Component 的 metadata 資訊內有兩個可以設定 `providers` 的地方，分別是 `viewProviders` 和 `providers` ，這兩者都可以註冊 providers 但有些微的差異

<!-- more -->

我們知道 Angular 的 `Injection System` ，讓 component / service / directive 等可以在 `constructor` 的地方注入想要使用的服務，根據服務註冊的地方，Angular 會提供一樣或是不一樣的服務實體，到這個地方，是我們所熟知的運作方式

當然我們也可以在 component 註冊服務，已提供本身跟與本身有關的子物件使用，在閱讀 API 文件時，發現 component 有兩個註冊服務的方法，`providers` 與 `viewProviders` 這兩者在說明分別為

* `providers`  list of providers available to this component and its children
* `viewProviders` list of providers available to this component and its view children

看起來很像，但到底差異在哪裡呢? 主要差異是在於子 component 的呈現方式會因不同註冊服務的方式而有所不同

# 基本環境設定

來解釋一下，但先準備一下程式環境

```typescript
// AppComponent 的樣版
<div class="col-md-3">
	<app-parent></app-parent>
</div>
<div class="col-md-3">
	<app-parent></app-parent>
</div>

// ParentComponet
import { Component, OnInit } from '@angular/core';
import { SimpleService } from '../simple.service';
@Component({
  selector: 'app-parent',
  template: `
    <h4>Parent Component</h4>
    <input type="text" [(ngModel)]="simpleService.name" />
  `,
  styleUrls: ['./parent.component.css']
})
export class ParentComponent {
  constructor(public simpleService: SimpleService) { }
}

// ChildComponent
import { Component, OnInit } from '@angular/core';
import { SimpleService } from '../simple.service';
@Component({
  selector: 'app-child',
  template: `
    Child Component <br/>
    value: {{ simpleService.name }}
  `,
  styleUrls: ['./child.component.css']
})
export class ChildComponent {
  constructor(public simpleService: SimpleService) { }
}

// SimpleService
import { Injectable } from '@angular/core';

@Injectable()
export class SimpleService {
  name: string;
}
```

# NgModule.providers

```typescript
@NgModule({
  ...
  providers: [SimpleService]
})
export class AppModule { }

```



在初始狀態， `SimpleService` 是註冊在 `app.module.ts` 內，畫面是這樣

![](https://i.imgur.com/tPrc6Uc.png)

不論在左邊或是右邊的 Parent Component 輸入資料時，Child Component 都會顯示所輸入的資料

![](https://i.imgur.com/c8fTLFW.gif)

這時 service 取得的順序

![](https://i.imgur.com/TDQ27YH.png)

(圖片擷取至[codecraft.tv](https://codecraft.tv))

# Component.providers

這時當 `ParentComponent` 註冊 `SimpleService` 到 `providers` 內時，會有怎樣的效果呢

```typescript
import { Component, OnInit } from '@angular/core';
import { SimpleService } from '../simple.service';
@Component({
  selector: 'app-parent',
  template: `
    <h4>Parent Component</h4>
    <input type="text" [(ngModel)]="simpleService.name" />
    <br/>
    <app-child></app-child>
	<!--或是這種方式-->
    <!--<ng-content></ng-content>-->
  `,
  providers: [SimpleService],  
  styleUrls: ['./parent.component.css']
})
export class ParentComponent {

  constructor(public simpleService: SimpleService) { }
}
```

執行結果

![](https://i.imgur.com/Gq5CFo8.gif)

 service 取得的順序

![](https://i.imgur.com/J3vmOVb.png)

(圖片擷取至[codecraft.tv](https://codecraft.tv))

# Component.viewProviders

如果將 `SimpleService` 註冊到 `viewProviders` 時，並子 component 是透過 `<ng-content>` 映射到 `ParentComponent` 時

```typescript
import { Component, OnInit } from '@angular/core';
import { SimpleService } from '../simple.service';
@Component({
  selector: 'app-parent',
  template: `
    <h4>Parent Component</h4>
    <input type="text" [(ngModel)]="simpleService.name" />
    <br/>
    <ng-content></ng-content>
  `,  
  viewProviders: [SimpleService],
  styleUrls: ['./parent.component.css']
})
export class ParentComponent {

  constructor(public simpleService: SimpleService) { }
}
```

```html
// app-component.html
<app-parent>
  <app-child></app-child>
</app-parent>
```

執行結果

![](https://i.imgur.com/15sElSa.gif)

 service 取得的順序

![](https://i.imgur.com/m3eu0oU.png)

(圖片擷取至[codecraft.tv](https://codecraft.tv))

# Recap

`component.providers` 與 `component.viewProviders` 最大的差異如上述的實驗，是在 `<ng-content></ng-content>` 處理的部分，而這裡就是說明時提到的` its view children` 的意思了。表示如沒有在 template 上面看到，就不在 `viewProviders` 的管轄範圍內，可以透過準備好的[範例程式](https://stackblitz.com/edit/viewprovider-providers?file=app%2Fparent%2Fparent.component.ts)，自己動手玩看看，比較有感覺。

Angular 的 DI 機制是很強大的，可以利用這樣的特行來滿足一些特需的效果 (暫時還想不到使用情境)，但至少不用因為註冊上的觀念誤解造成找不到資料的窘境出現

# 參考資料

* [stackblitz demo code](https://stackblitz.com/edit/viewprovider-providers?file=app%2Fparent%2Fparent.component.ts)
* [NgModule.providers vs Component.providers vs Component.viewProviders](https://codecraft.tv/courses/angular/dependency-injection-and-providers/ngmodule-providers-vs-component-providers-vs-component-viewproviders/)