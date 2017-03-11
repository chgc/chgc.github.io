---
layout: post
title: '[Angular] Custom Validator'
comments: true
date: 2017-03-10 14:12:25
categories: Angular
tags: Angular
---

Angular 內建的表單驗證項目其實不多，網路上雖然也有人寫好的驗證擴充套件可以使用。但是，真正強大的是 Angular 允許我們自訂驗證規則，且很容易的套用到系統內，當然也可以簡單的讓其他專案使用。

這裡將會介紹 Custom Validator 的幾種實做方式

<!-- more -->

# 什麼是 Validator

Validator 是用來做資料驗證的，資料驗證的結果只會有兩種，`null` 或 `錯誤訊息`，Angular 內建的 validator 有這些

1. required: 必填欄位
2. minLength: 最短長度
3. maxLength: 最長長度
4. pattern: regex 驗證

內建的表單驗證功能真的很少，所以是否有其他人寫好的驗證規則可以使用呢? 其實是有的，[GitHub 連結](https://github.com/yuyang041060120/ng2-validation) 在此

如果想自己自訂驗證規則，要怎麼寫呢? 

# 自訂 Validator

##  Version 1

最簡單的 Validator 就是一個 function，但是這樣子的寫法，只能在 Reactive Form (model-driven) 下使用

```typescript
export function validateEmail(c: FormControl) {
  let EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
 
  return EMAIL_REGEXP.test(c.value) ? null : {
    validateEmail: {
      valid: false
    }
  };
}

ngOnInit() {
  this.form = new FormGroup({
    ...
    email: new FormControl('', validateEmail)
  });
}
```

如果要在 template-driven 表單下也可以使用這個驗證方法的話，又該怎麼辦?

##  Version 2

我們可以透過 `directive` 的方式將我們自訂的驗證規則給 template-driven 表單使用，在需要被驗證的 `FormControl` 上，加上我們設定的屬性即可，所以我們需要來建立一個 `directive`，建立步驟如下

使用 CLI 的指令

```typescript
ng generate directive emailValidator
```

所產生出來的程式碼會長這樣

```typescript
import { Directive } from '@angular/core';

@Directive({
  selector: '[appEmailValidator]'
})
export class EmailValidatorDirective {

  constructor() { }

}	
```

稍微調整一下 Class 的名稱，讓這個更容易辨識，並將之前寫好的 validateEmail 方法搬進來

```typescript
import { Directive } from '@angular/core';
import { NG_VALIDATORS, FormControl } from '@angular/forms';

export function validateEmail(c: FormControl) {
  ...
}

@Directive({
  selector: '[validateEmail][ngModel]',
  providers:[
    { provide: NG_VALIDATORS, useValue: validateEmail, multi: true }
  ]
})
export class EmailValidator {}

```
selector 的部分，`[valiateEmail]` 和 `[ngModel]`，表示要使用這個 directive 的條件是 element 裡需要同時擁有這兩個 attribute 才會生效，範例如下

```html
<form #myForm="ngForm" novalidate>
  <input type="email" name="email" ngModel validateEmail  #email="ngModel">
  {{ email.errors | json }}
</form>
```

##  Version 3

上面的寫法，雖然是可以跑，但是，程式碼看起來就有點散落在四處，有沒有可以把驗證的規則包在 `directive` 裡面呢? 

```typescript
import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
  selector: '[validateEmail][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, 
     useExisting: forwardRef(() => EmailValidator), 
     multi: true }
  ]
})
export class EmailValidator implements Validator {
  validator: Function;

  constructor() { }

  validate(c: FormControl) {
    let EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return EMAIL_REGEXP.test(c.value) ? null : {
      validateEmail: {
        valid: false
      }
    };
  }
}
```

修正了幾個地方

1.  class  需要實作 `Validator`
2.  使用 `useExisting` 來設定 `provider`
3.  使用 [forwardRef](https://angular.io/docs/ts/latest/api/core/index/forwardRef-function.html) 來避免初始時 NG_VALIDATORS token 尚未產生的錯誤
4.  使用 multi 來擴充 `NG_VALIDTORS `的功能
5.  將原本的驗證 function 的程式碼搬進  validate 裡面

到這個階段，template-driven的表單已經可以使用了，可是， model-driven的表單就不能直接在樣版上使用，原因是 selector 裡並沒有給予 `formControlName` 使用的條件，所以，再來將缺少的部分補上

## Version 4

```typescirpt
import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
   selector: '[validateEmail][ngModel],[formControlName][ngModel],[formControl][ngModel]',
  providers: [
   ...
  ]
})
export class EmailValidator implements Validator {
  ...
  validate(c: AbstractControl) {
    ...
  }
}
```

以上就是一個自訂驗證的基本型的寫法

# 顯示結果

![](https://content.screencast.com/users/chgc/folders/Snagit/media/42deda5a-1d4e-4159-b2ac-4111afdedab5/03.10.2017-23.05.GIF)



# 補充資訊

* provide 的部分有兩種可以設定 `NG_VALIDATORS` 和 `NG_ASYNC_VALIDATORS`，class 的 validator 的寫法是一樣的，唯一的差別是回傳的型別， `NG_ASYNC_VALIDATORS` 可以回傳 Promise/Observable 的型別。可參讀延伸閱讀的第一篇文章

# 延伸閱讀

* [ Create Async Validator Directive](https://netbasal.com/angular-2-forms-create-async-validator-directive-dd3fd026cb45#.kqtmuxumh)
* [How to Implement a Custom Validator Directive (Confirm Password) in Angular 2](https://scotch.io/tutorials/how-to-implement-a-custom-validator-directive-confirm-password-in-angular-2)
* [FORWARD REFERENCES IN ANGULAR](https://blog.thoughtram.io/angular/2016/03/14/custom-validators-in-angular-2.html)


