---
layout: post
title: '[Angular] Angular FormGroup Value 之被忽略的細節'
comments: true
typora-root-url: 2020-05-06-angular-formgroup-value
typora-copy-images-to: 2020-05-06-angular-formgroup-value
date: 2020-05-06 15:57:13
categories: Angular
tags: Angular
---

當在操作 Angular  表單時，於最後送出表單資料到 API 時，常見的使用方法為 `formGroup.value` 或是 `formGroup.getRawValue()` 兩種方法，關於 `getRawValue()` 大概也不用多贅述了。但你知道 `FormGroup` 的 value 取得資料的規則嗎 ?

<!-- more -->

# FormGroup.value

一般來說，`FormGroup` 的 value 會將該群組下的控制項資料取出，如下

```typescript
formData1 = new FormGroup({
    firstName: new FormControl("Kevin"),
    lastName: new FormControl("Yang"),
});

console.log(formData1.value); // {firstName: 'Kevin', lastName: 'Yang'}
```

而第一個新手常會踩到的雷，會這遇到 `FormControl` 狀態是 `Disabed` 時，`FormGroup` 取出的值就不會是全部了

```typescript
formData1 = new FormGroup({
    firstName: new FormControl({value:"Kevin", disabled: true}),
    lastName: new FormControl("Yang"),
});

console.log(formData1.value); // {lastName: 'Yang'}
console.log(formData1.getRawValue()); // {firstName: 'Kevin', lastName: 'Yang'}
```

官方文件說明

> For an enabled `FormGroup`, the values of enabled controls as an object with a key-value pair for each member of the group.

到這邊都還算正常，但你知道當 `FormGroup` 狀態為 `Disabled` 時，就會取出所有控制項的值嗎?

```typescript
formData1 = new FormGroup({
    firstName: new FormControl({value:"Kevin", disabled: true}),
    lastName: new FormControl("Yang"),
});
formData1.disable();
console.log(formData1.value); // {firstName: 'Kevin', lastName: 'Yang'}
```

根據官網的說明

> For a disabled `FormGroup`, the values of all controls as an object with a key-value pair for each member of the group.

但如果是這樣子的結構，會取得怎樣的值呢?

```typescript
formData1 = new FormGroup({
    firstName: new FormControl({value:"Kevin", disabled: true}),    
});

console.log(formData1.value); // ??
```

在第五行會顯示 `{firstName: 'Kevin'}`，這是一件我剛開始也覺得很困惑的現象，為什麼明明 `FormControl` 是 `disabled`  的狀態，但為什麼還能取得呢?

## 原始碼解析

在 `FormGroup`  class 內有一個方法是在判斷目前 `FormGroup` 下的控制項是否全部為 `Disabled` ，如果是自己本身的狀態也會被設定為 `Disabled`

```typescript
 _allControlsDisabled(): boolean {
    for (const controlName of Object.keys(this.controls)) {
      if (this.controls[controlName].enabled) {
        return false;
      }
    }
    return Object.keys(this.controls).length > 0 || this.disabled;
}
```

* [source code](https://github.com/angular/angular/blob/master/packages/forms/src/model.ts#L1631-L1638)

因為這一個關係，上面那一個問題就會使用 `FormGroup` 為 Disabled 時的規則運行

# 參考資料

* [Angular API](https://angular.io/api/forms/AbstractControl#properties)