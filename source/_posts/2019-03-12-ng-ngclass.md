---
layout: post
title: '[Angular] ngClass with JavaScript Set'
comments: true
typora-root-url: ng-ngclass
typora-copy-images-to: ng-ngclass
date: 2019-03-12 11:03:19
categories: Angular
tags: Angular
---

Angular 的 `ngClass` 可以讓我們用 `Object` 的方式來動態設定 css class，其實我們還可以使用另外一種方式來控制 `ngClass`

<!-- more -->

# Set

JavaScript 的 `set` 可以讓我們儲存任何資料，而且能確保該資料是唯一的，表示一個 set 裡面不會有重複的資料。基本用法如下

```javascript
const set1 = new Set([1, 2, 3, 4, 5]);

set1.has(1); // true
set1.add(1); // set1 還是只有一個 1
set1.delete(1); // 將 1 從 set1 中移除
set1.has(1); // false
```



# ngClass

在官方 API 文件中，提到 ngClass 可以接受 `string`、`Array`、`Object` 這三種格式的資料

```typescript
<some-element [ngClass]="'first second'">...</some-element>

<some-element [ngClass]="['first', 'second']">...</some-element>

<some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>

<some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>

<some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
```

但其實，在程式碼內的型別定義卻多看到一個 `Set<String>` 的型別，這真的是一個好消息。因為我們就可以透過操作 `set` 的方式來控制顯示樣式

```typescript
  @Input()
  set ngClass(value: string|string[]|Set<string>|{[klass: string]: any}) {
  }
```



# DEMO

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <button (click)="showBlue()">Show Blue Text</button>
    <button (click)="removeBlue()">Remove Blue Color</button>

    <p [ngClass]="setClasses">
      Start editing to see some magic happen :)
    </p>
  `,
  styles: [
      ` .blue {
          color: blue;
      }`]
})
export class AppComponent {
  setClasses = new Set();

  showBlue() {
    this.setClasses.add('blue');
  }

  removeBlue() {
    this.setClasses.delete('blue');
  }
}

```

上面的範例程式碼簡單的顯示出透過操作 `set` 的方式就能控制要顯示的樣式，會比直接操作陣列來的簡單太多了，提供給各位參考看看



# 參考資料

* [stackblitz 範例程式碼](https://stackblitz.com/edit/ng-class-with-set?file=src%2Fapp%2Fapp.module.ts)
* [Set](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Set)