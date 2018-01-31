---
layout: post
title: '[Angular] @Attribute`
comments: true
date: 2018-01-31 10:15:05
categories: Angular
tags: Angular
---

Angular 的 Decorator 裡，有一個 `@Attribute`，但官方文件並沒有介紹這一個 decorator 的用法，所以在此介紹一下

<!-- more -->

# 基本寫法

`@Attribute` 可讓 component 擁有一個一次性的 attribute 屬性可供傳入常數值使用

而基本的使用方式及設定程式碼如下，這裡的 age 就是透過 `@Attribute` 建立出來的

```html
<hello name="{{ name }}" age="30"></hello>
```

```typescript
import { Component, Input, Attribute } from '@angular/core';

@Component({
  selector: 'hello',
  template: `<h1>Hello {{name}}! My age is {{ age }}</h1>`,
  styles: [`h1 { font-family: Lato; }`]
})
export class HelloComponent  {
  @Input() name: string;
  constructor(@Attribute('age') private age){
  }
}

```

透過這種方式定義出來的 `attribute` 是不能使用任何 binding 的形式傳值，只能直接給予值，並只能在 `constructor` 設定。

# 使用情境

假設有一個共用的元件，希望可以從外部直接指定使用方式，而這一個設定是不會改變的，那這時候使用 `@Attribute` 來設定就很合適。

```typescript
import { Component, Attribute } from '@angular/core';

export type ButtonType = 'primary' | 'secondary';

@Component({
  selector: 'app-button',
  template: `
    <button [ngClass]="type">
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  constructor(@Attribute('type') public type: ButtonType = 'primary') { }
}
```

```html
<app-button type="secondary">Action Button</app-button>
```



# 延伸閱讀

* [Getting to Know the @Attribute Decorator in Angular](https://netbasal.com/getting-to-know-the-attribute-decorator-in-angular-4f7c9fb61243)