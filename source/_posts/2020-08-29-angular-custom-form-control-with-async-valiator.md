---
layout: post
title: '[Angular] 如何寫具有非同步驗證的 Angular 自訂表單物件`
comments: true
typora-root-url: 2020-08-29-angular-custom-form-control-with-async-valiator
typora-copy-images-to: 2020-08-29-angular-custom-form-control-with-async-valiator
date: 2020-08-29 20:14:05
categories: Angular
tags: Angular
---

前幾天有人在論壇問了一個自訂表單非同步驗證的問題，這問題是當一個自訂表單物件內有非同步驗證時，外部使用者無法正確地取得該表單物件的驗證狀態，這問題我一開始想說應該不難，但也花了我快一天的時間才釐清要怎麼寫一個具有非同步驗證的自訂表單物件，方法如下

<!-- more -->

# 同步驗證

我們都知道 Angular `FormControl` 的驗證有分同步與分同步兩種方式，下面是同步驗證的寫法

```typescript
@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.css"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UserComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: UserComponent,
      multi: true
    }
  ]
})
export class UserComponent implements OnInit, ControlValueAccessor, Validator {
  firstName = new FormControl("", [Validators.required]);
  onChange: (e) => {};
  onTouched: () => {};
  constructor() {}

  ngOnInit() {
    this.firstName.valueChanges.subscribe({
      next: value => {
        if (this.onChange) {
          this.onChange(value);
          this.onTouched();
        }
      }
    });
  }
    
  writeValue(obj: any) {
    this.firstName.patchValue(obj);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  validate() {    
    return this.firstName.errors;
  }
}
```

# 分同步驗證

非同步驗證在 `FormControl` 的驗證狀態是 `PENDING`  <--> `VALID/INVALID` 間切換，由於非同步與同步要實作的方法都是同一個，所以當非同步與同步驗證同時存在時，要以非同步為準，不然整個驗證都只會取得同步驗證的

```typescript
@Component({
   ...
    providers: [
    ...
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: UserComponent,
      multi: true
    }
  ]
})
export class UserComponent implements OnInit, ControlValueAccessor, Validator {
  firstName = new FormControl("", [Validators.required], [this.asyncValidator]);
  onChange: (e) => {};
  onTouched: () => {};

  constructor() {}

  asyncValidator(c: AbstractControl) {
    return of(c.value === "123").pipe(
      delay(500),
      map(b => (b ? null : { nomatch: true }))
    );
  }
  ...
  validate() {
    return this.firstName.errors;
  }
}

```

一旦註冊成 `NG_ASYNC_VALIDATORS` 時，外部使用這一個自訂 `FormControl` 的 status 就會處在 `PENDING` ，而其原因是因為 `validate`  的方法沒有回傳一個完成的訊號，基於這一個理由，我們需要調整 `validate` 的實作方式

```typescript
validate() {
    return this.firstName.statusChanges.pipe(      
      filter(status => status !== "PENDING"),
      map(status => this.firstName.errors),      
      first()
    );
  }
```

完整程式碼如下

```typescript
import { Component, OnInit } from "@angular/core";
import {
  ControlValueAccessor,
  Validator,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  NG_ASYNC_VALIDATORS,
  Validators,
  AbstractControl
} from "@angular/forms";
import { FormControl } from "@angular/forms";
import { of } from "rxjs";
import { filter, tap, map, delay, first } from "rxjs/operators";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.css"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UserComponent,
      multi: true
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: UserComponent,
      multi: true
    }
  ]
})
export class UserComponent implements OnInit, ControlValueAccessor, Validator {
  firstName = new FormControl("", [Validators.required], [this.asyncValidator]);
  onChange: (e) => {};
  onTouched: () => {};

  constructor() {}

  asyncValidator(c: AbstractControl) {
    return of(c.value === "123").pipe(
      delay(500),
      map(b => (b ? null : { nomatch: true }))
    );
  }

  ngOnInit() {
    this.firstName.valueChanges.subscribe({
      next: value => {
        if (this.onChange) {
          this.onChange(value);
          this.onTouched();
        }
      }
    });
  }

  writeValue(obj: any) {
    this.firstName.patchValue(obj);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  validate() {
    return this.firstName.statusChanges.pipe(
      filter(status => status !== "PENDING"),
      map(status => this.firstName.errors),      
      first()
    );
  }
}

```



# 參考資料

[stackbliz](https://stackblitz.com/edit/angular-ivy-qdvfuj?file=src%2Fapp%2Fuser%2Fuser.component.ts)

