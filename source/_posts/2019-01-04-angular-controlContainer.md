---
layout: post
title: '[Angular] ControlContainer 的應用'
comments: true
typora-root-url: 2019-01-04-angular-controlContainer/
typora-copy-images-to: 2019-01-04-angular-controlContainer/
date: 2019-01-04 10:00:06
categories: Angular
tags: Angular
---

來談談 `ControlContainer` 的用法，根據 API 文件解釋

> A base class for directives that contain multiple registered instances of `NgControl`. Only used by the forms module.

而內建繼承使用的 class 有

-  `AbstractFormGroupDirective`
  - `NgModelGroup`
  - `FormGroupName`
-  `NgForm`
-  `FormGroupDirective`
-  `FormArrayName`

我們又可以如何利用 `ControlContainer` 呢

<!-- more -->

# 場景

其實簡單的一句話，我們可以寫出可以重複使用的 `FormGroupControl`，但由於 Angular 表單有兩種模式，這兩種模式在使用 `ControlContainer` 的用法上有些微的差異，這裡會分別寫出

首先，我們先假設我們有一個表單的區塊，會重複出現在很多地方，那我們是否可以將該區塊抽成一個獨立的 component

```html
<form #myForm="ngForm">
  <div>
    <label>Firstname:</label>
    <input type="text" name="firstName" ngModel>
  </div>
  <div>
    <label>Lastname:</label>
    <input type="text" name="lastName" ngModel>
  </div>
  <fieldset ngModelGroup="address">
    <div>
      <label>Zip:</label>
      <input type="text" name="zip" ngModel>
    </div>
    <div>
      <label>Street:</label>
      <input type="text" name="street" ngModel>
    </div>
    <div>
      <label>City:</label>
      <input type="text" name="city" ngModel>
    </div>
  </fieldset>
</form>
<pre>{{ myForm.value | json }}</pre>
```

假設我想將 `<fieldset>` 的部分抽成獨立的 component 時，該怎麼做呢?

# Template Form

很直覺的是直接建立一個新的 Component 然後把 html 搬進去

```html
  <fieldset ngModelGroup="address">
    <div>
      <label>Zip:</label>
      <input type="text" name="zip" ngModel>
    </div>
    <div>
      <label>Street:</label>
      <input type="text" name="street" ngModel>
    </div>
    <div>
      <label>City:</label>
      <input type="text" name="city" ngModel>
    </div>
  </fieldset>
```

* address.component.html

```html
<form #myForm="ngForm">
  <div>
    <label>Firstname:</label>
    <input type="text" name="firstName" ngModel>
  </div>
  <div>
    <label>Lastname:</label>
    <input type="text" name="lastName" ngModel>
  </div>
  <app-address></app-address>
</form>
<pre>{{ myForm.value | json }}</pre>
```

當我們這樣子搬完後，會看到一個錯誤訊息

![1546568595539](1546568595539.png)

造成這個錯誤訊息的兇手是  `ngModelGroup`

```typescript
export const modelGroupProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => NgModelGroup)
};

@Directive({selector: '[ngModelGroup]', providers: [modelGroupProvider], exportAs: 'ngModelGroup'})
export class NgModelGroup extends AbstractFormGroupDirective implements OnInit, OnDestroy {
     constructor(
      @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: any[],
...
```

根據原始碼，我們需要提供 `ControlContainer`，但這又要從那裡來呢? 當然是從上層 (Host) 的 `NgForm` 提供，所以需要在 `app-address.component.ts` 內加入這一行

```typescript
@Component({
  selector: 'app-address',
  templateUrl: `./app-address.component.html`,
  viewProviders:[{
    provide: ControlContainer, useExisting: NgForm
  }]
})
export class AddressComponent {
}
```

* 請留意：是註冊在 `viewProviders`，而不是 `providers`，其中的差異可以參閱 [[Angular] viewProviders V.S. providers](https://blog.kevinyang.net/2018/01/19/angular-viewproviders-providers/)

當然成註冊後，剛錯誤就會消失，而畫面又回到正常的運作了，[範例程式碼](https://stackblitz.com/edit/angular-controlcontainer-template)

# Reactive Form

上面 `ControlContainer` 的用法就不適用於 Reactive Form 的開發方式了，而 Reactive Form 應該要這樣子寫

```html
<form [formGroup]="formData">
	<input type="text" formControlName="firstName" />
	<address formGroupName="address"></address>
</form>
{{ formData.value | json }}
```

* app.component.html

```typescript
import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';


@Component({
  selector: 'address',
  template: `
    <fieldset [formGroup]="controlContainer.control">
      <div>
        <label>Zip:</label>
        <input type="text" name="zip" formControlName="zip">
      </div>
      <div>
        <label>Street:</label>
        <input type="text" name="street" formControlName="street">
      </div>
      <div>
        <label>City:</label>
        <input type="text" name="city" formControlName="city">
      </div>
    </fieldset>
  `  
})
export class AddressComponent { 
  constructor(private controlContainer: ControlContainer) { }
}
```

* `[formGroup]` 的來源是來自 `ControlContainer`，剩下的行為就一模一樣了

`Reacitve Form` 的開發方式看起來簡單多了，[範例程式碼](https://stackblitz.com/edit/angular-controlcontainer-reactive)

# 參考資料

* [API - ControlContainer](https://angular.io/api/forms/ControlContainer)