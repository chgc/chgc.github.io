---
layout: post
title: '[Angular] 如何取得所處上層的 Component 元件 ?'
comments: true
typora-root-url: '2019-02-27-ng-get-parent-component/'
typora-copy-images-to: '2019-02-27-ng-get-parent-component/'
date: 2019-02-27 09:50:06
categories: Angular
tags: Angular
---

我們知道 Angular 的系統是透過 Component 的方式堆疊起來的，而 Component 與 Component 的溝通方式有幾種，1. 透過 `@Input` 和 `@Output` ，2. 透過 `service` 的方式，或是 3. 直接將上層 `Component` 注入到目前的 `Component` 內使用。

但通常我是不建議使用第 3 種方式，可是，在某些情境下，還是得必須這樣子處理，而且還需要動態的取得上層的 `Component`，這篇文章就是分享如何取得上層 `Component`

<!-- more -->

取得上層 `Component` 的方式，我們會透過 `Injector` 機制來完成，以下介紹兩種方式可以達到一樣的效果

# 情境描述

> 當 Input 離開時，需要觸發執行某些動作，但又不想要每一個 Component 都要處理這一類的工作，所以希望能用一個 general 的解法來完成這需求

# 正規解

根據情境，看起來又是一個可透過 RxJS 來完成的需求，但我要怎麼知道我目前的 Input 離開時，要讓那一個 `Component` 工作呢? 所以只要能取得目前觸發的 Input 是在哪一個 Component 內，就可以完成這需求了。

## 初版

* directive

```typescript
import { Directive, HostListener } from '@angular/core';
import { ControlService } from './control.service';

@Directive({
  selector: 'input'
})
export class InputFocusDirective {  

  @HostListener('blur', ['$event'])
  inputBlur(event) {
    const { name, value } = event.target;
    this.service.inputEvent$.next({
      type: 'blur',      
      name, value
    })
  }
  
  constructor(private service: ControlService) { }
}
```

* service

```typescript
@Injectable()
export class ControlService {
  inputEvent$ = new Subject();
  constructor() { }
}
```

* app.component.ts

```typescript
import { Component, forwardRef } from '@angular/core';
import { ControlService } from './control.service';
import { ParentComponent } from './parent-component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'my-app',
   template: `
    <hello title="{{ name }}"></hello>
    <form name="test">
      <input name="firstName" [(ngModel)]="firstName" />
    </form>
    <p>
      Start editing to see some magic happen :)
    </p>  
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name = 'AppComponent';
  firstName;

  constructor(private service: ControlService) {
    service.inputEvent$    
    .subscribe((x: any) => {
      console.log(x);
    });
  }
}

```

上述的寫法，只要在任何 `Component` 內的 `<input>` 離開時都會觸發並廣播訊息到所有註冊者

## 第二版

接下來就是加入觸發者所處的 Component 資訊就可以做過濾判斷了，但在這之前，先建立一個通用的 `ParentComponent` 

* parent-component.ts

```typescript
export abstract class ParentComponent {
}
```

* app.component.ts

```typescript
import { Component, forwardRef } from '@angular/core';
import { ParentComponent } from './parent-component';

@Component({
 ...
 providers: [
    { provide: ParentComponent, useExisting: forwardRef(() => AppComponent) }
  ]
})
export class AppComponent {
  ...
}

```


* 說明

  * 利用 Injector 取 provider 的順序特性，我們就能利用該特性取得目前觸發 directive 事件元件的隸屬 component
  * `forwardRef`: Allows to refer to references which are not yet defined.
  * `useExisting`: 使用已經建立的 instance，這能確保取得的 instance 不是全新的


* directive

```typescript
import { Directive, HostListener } from '@angular/core';
import { ControlService } from './control.service';

@Directive({
  selector: 'input'
})
export class InputFocusDirective {  

  @HostListener('blur', ['$event'])
  inputBlur(event) {
    const { name, value } = event.target;
    this.service.inputEvent$.next({
      type: 'blur',      
      comp: this.parent,
      name, value
    })
  }
  
  constructor(private service: ControlService, private parent: ParentComponent) { }
}
```

* 程式碼說明
  * 將 `ParentComponent` 注入後，在事件觸發時將 `Component` 的資訊傳入
* app.component.ts

```typescript
@Component(...)
export class AppComponent {
  constructor(private service: ControlService) {
    service.inputEvent$
    .pipe(filter((x:any)=> x.comp === this))
    .subscribe((x: any) => {
      console.log(x)
    });
  }
}
```

* 程式碼說明
  * 因為 `inputEvent$` 內傳回的資訊已經有包含 `Component` 的資訊，所以可以透過 `filter` 的 operators 來過濾廣播訊息

## 完成需求

```typescript
export class AppComponent {
  
  constructor(private service: ControlService) {
    service.inputEvent$
    .pipe(filter((x:any)=> x.comp === this))
    .subscribe((x: any) => {      
      (x.comp as AppComponent).show(x.value);
    });
  }

  show(value) {
    console.log(value);
  }
}
```



[範例程式碼](https://stackblitz.com/edit/angular-w71sa3?file=src%2Fapp%2Fapp.component.ts)

# 暗黑解

※ **注意**: 此暗黑解法十分黑暗，心臟不夠強的千萬不要用，所以我不會做任何解釋

```typescript
import { Directive, HostListener, Injector } from '@angular/core';
import { ControlService } from './control.service';

@Directive({
  selector: 'input'
})
export class InputFocusDirective {
  
  @HostListener('blur', ['$event'])
  inputBlur(event) {
    const { name, value } = event.target;
    this.service.inputEvent$.next({
      type: 'blur',
      comp: this.injector['view'].component,
      name, value
    })
  }

  constructor(private service: ControlService, private injector: Injector) { }

}
```

* [範例程式碼](https://stackblitz.com/edit/angular-7owayq?file=src%2Fapp%2Finput-focus.directive.ts)

