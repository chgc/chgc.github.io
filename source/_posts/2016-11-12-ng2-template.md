---
layout: post
title:  '[Angular] Template Tag'
comments: true
date: 2016-11-12 20:04:00
categories: Angular
tags: Angular
---

Angular2裡面有提供一個 `*` 的語法糖, 這個語法糖是用來表示 `<template>` 標籤. 例如  `*ngIf` 、 `*ngFor` 等, 而這篇就來討論怎麼利用 `<template>`

<!-- more -->

# Template Tag

來先看一段Code吧

```typescript
import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'my-dynamic-component',
  template: `<div>Hello world</div>`
})
export class MyDynamicComponent{  
}

@Component({
  selector: 'app-root',  
  template: `
  <div>
    <template #target></template>
    <h1>{{title}}</h1>
  </div>
` 
})

export class AppComponent {
  @ViewChild('target', {read: ViewContainerRef}) target: ViewContainerRef;

  title = 'app works!';
  constructor(private cfr: ComponentFactoryResolver){   
  }

  ngAfterViewInit(){
     let myFactory = this.cfr.resolveComponentFactory(MyDynamicComponent);
     let compRef = this.target.createComponent(myFactory);
     
  }
}

```

這段Code有幾個地方要解釋一下的是

1. `<template>`是一個placeholder, 像是註記符號，讓angular2知道說要將template注入到哪一個位置
2.  [ViewContainerRef](https://angular.io/docs/ts/latest/api/core/index/ViewContainerRef-class.html) 是代表容器的位置
3.  [ComponentFactoryResolver](https://angular.io/docs/ts/latest/api/core/index/ComponentFactoryResolver-class.html)是動態產生Component的一個Factory Class

動態產生Component不會在此探討，會留在以後來做討論. 重點是 `<template>` 這個所產生出來的結果

![](https://farm6.staticflickr.com/5442/22755425268_a8f09f0faf_o.png)

紅色框起來的就是在上面 `<template>` 的所在位置，而所要產生的html會在下方被注入。同樣的運作原理適用於 Rotuer

以上就是介紹 '<template>' 的基本用途，接下來就是進階的用法了



# template tag dances with data

單純的顯示HTML多無聊啊，來個動態顯示資料吧

```typescript
import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `

  <template #nametag let-y>
    <div>Hello {{ y.name }}</div>
  </template>
  
  <div [ngTemplateOutlet]="nametag" [ngOutletContext]="myContext"></div>
  <div [ngTemplateOutlet]="nametag" [ngOutletContext]="myContext2"></div>
`
})

export class AppComponent {
  name = 'kevin';
  myContext = { '$implicit': {name: 'kevin'}};
  myContext2 = { '$implicit': {name: 'Jeff'}};
}

```

## 名詞解釋

1. [[ngTemplateOutlet]](https://angular.io/docs/ts/latest/api/common/index/NgTemplateOutlet-directive.html) : Inserts an embedded view from a prepared `TemplateRef`
2. [ngOutletContext]: should be an object, the object's keys will be the local template variables available within the `TemplateRef`.
   * Note: using the key `$implicit` in the context object will set it's value as default.
3. let-(alias): let- 是將ngOutletContext所傳進去的object中的$implicit給予一個別名，使 `<template>` 內可以使用該資料. 

所以上面的程式就可以將不同的資料放到相同的 `<template>` 裡但又不用新增一個component來處理，工作就減少很多了，是不是很方便，而這個也是  `*ngFor`  等的基本寫法

![](https://farm6.staticflickr.com/5655/25298597749_867061bf20_o.png)



# 自訂Directive

```typescript
import {
  Component, Directive, Input, TemplateRef,
  ViewContainerRef, EmbeddedViewRef, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Directive({
  selector: '[rxContext][rxContextOn]'
})
export class RxContext {
  @Input() rxContextOn: Observable<any>;

  _viewRef: EmbeddedViewRef<any>;

  constructor(private templateRef: TemplateRef<any>,
    private vcr: ViewContainerRef) {    
  }

  ngOnInit() {
    // console.log(this.rxContextOn);

    this.rxContextOn.subscribe(state => {
      console.log(state);
      if (!this._viewRef) {
        this._viewRef = this.vcr.createEmbeddedView(this.templateRef, { '$implicit': state });
      }
      this._viewRef.context.$implicit = state;      
    });
  }
}


@Component({
  selector: 'app-root',  
  template: `        
      <div *rxContext="let user on userStream">
        <h2>{{ user.name }}</h2>
      </div>
`
})

export class AppComponent {
  userStream = Observable.of({
    name: 'kevin',
    age: 35
  }).concat(Observable.timer(3000).mapTo({ name: 'Jeff', age: 30 }));
}

```

一段一段的來解釋吧

```html
<div *rxContext="let user on userStream">
   <h2>{{ user.name }}</h2>
</div>
```

我們知道 `*` 會被更換成 `<template>` ，所以上面的那段code會替換成

```html
<template rxContext let-user [rxContextOn]="userStream">
   <div>
       <h2>{{ user.name }}</h2>
   </div>
<template>
```

所以我們需要一個叫 rxContext的directive，和 rxContextOn的屬性

```typescript
@Directive({
  selector: '[rxContext][rxContextOn]'
})
export class RxContext {
  @Input() rxContextOn: Observable<any>;
   _viewRef: EmbeddedViewRef<any>;

  constructor(private templateRef: TemplateRef<any>,
    private vcr: ViewContainerRef) {    
  }
}
```

這裡的rxContextOn型別設定為Observable是因為我們會傳入一個Observable的物件進去，這裡請依實際狀況調整

## 名詞解釋

1. [TemplateRef](https://angular.io/docs/ts/latest/api/core/index/TemplateRef-class.html) : Represents an Embedded Template that can be used to instantiate Embedded Views.
2. [ViewContainerRef](https://angular.io/docs/ts/latest/api/core/index/ViewContainerRef-class.html): Represents a container where one or more Views can be attached.
3. createEmbeddedView(templateRef: TemplateRef<C>, context?: C, index?: number) : EmbeddedViewRef<C>



因為Directive本身是不會有任何的template的，所以這裡所要操作的template會是指使用到該directive的 html element.

```typescript
 ngOnInit() {
   this.rxContextOn.subscribe(state => {   
      if (!this._viewRef) {
        this._viewRef = this.vcr.createEmbeddedView(this.templateRef, { '$implicit': state });
      }
      this._viewRef.context.$implicit = state;      
    });
  }
```

因為rxContextOn所傳入的資料是Observable型別的資料，所以必須透過subscribe才能將資料產生出來。當資料產生出來後，再把資料塞回到template中，這樣子就完成最基本的directive了

# 延伸閱讀

* [ngFor](https://github.com/angular/angular/blob/2.1.2/modules/%40angular/common/src/directives/ng_for.ts#L23-L167)
* [ngIf](https://github.com/angular/angular/blob/2.1.2/modules/%40angular/common/src/directives/ng_if.ts#L9-L51)

