---
layout: post
title: '[Angular] 自訂雙向繫結 - 簡易版'
comments: true
date: 2017-08-15 14:00:30
categories: Angular
tags: Angular
---

在上一篇介紹 Two-way Binding 的文章裡，有提到 `[()]` 的運作原理，我們也可以利用這原理，來寫自己的雙向繫結屬性，使用的場景會是 `Component`

<!-- more -->

# 自訂雙向繫結的功能 - 陽春版

重新複習一下，Angular 的編譯器，會將 `[()]` 轉換成 `[name]="expression"` 跟  `(nameChange)="expression = $event"` 的型態，所以在 `Component` 需要設定 `@Input('name')` 與 `@Output('nameChange')` 這兩個項目

```typescript
@Component({
  selector: 'custom-counter',
  template: `
    <button (click)="decrement()">-</button>
    <span>{{counter}}</span>
    <button (click)="increment()">+</button>
  `
})
export class CustomCounterComponent {

  counterValue = 0;

  @Input()
  get counter() {
    return this.counterValue;
  }

  set counter(value) {
    this.counterValue = value;
  }

  decrement() {
    this.counter--;
  }

  increment() {
    this.counter++'
  }
}
```

在外部使用這個 Component 時

```html
<custom-counter [counter]="someValue"></custom-counter>
```

這時如果讓這個 counter 也有雙向繫結的效果時，`custom-counter` Component 的程式碼要稍微改一下

```typescript
@Component({
  selector: 'custom-counter',
  template: `
    <button (click)="decrement()">-</button>
    <span>{{counter}}</span>
    <button (click)="increment()">+</button>
  `
})
export class CustomCounterComponent {

  counterValue = 0;
  @Output() counterChange = new EventEmitter<number>();
  
  @Input()
  get counter() {
    return this.counterValue;
  }
	
  set counter(value) {
    this.counterValue = value;
    this.counterChange.emit(this.counterValue);
  }

  decrement() {
    this.counter--;
  }

  increment() {
    this.counter++'
  }
}
```

這樣子修正完後，`counter` 這個對外的屬性，就可以使用 `[()]` 來做到雙向繫結的效果

```html
<custom-counter [(counter)]="someValue"></custom-counter>
<p>counterValue = {{ someValue }}</p>
```



# [範例程式](https://stackblitz.com/edit/custom-twoway-bindings-simple?embed=1&file=app/custom-counter.component.ts)

