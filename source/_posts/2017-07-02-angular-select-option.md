---
layout: post
title: '[Angular] Angular 下拉選單的隱藏菜單`
comments: true
date: 2017-07-02 17:53:01
categories: Angular
tags: Angular
---

看完 Sam 所寫的 [如何使用 Angular 實作下拉選單?](http://oomusou.io/angular/angular-select/)，其實 Angular 針對 Select 這個控制項，有提供一些額外的功能，這邊文章就來整理一下這控制項的隱藏菜單

<!-- more -->

# 隱藏菜單

## ngValue

AngularJS 有提供 `ngOptions` 的方法，可以讓我們把 `Object` 當作 `Option` 的值，當我們做下拉選單選擇時，就可以取得所選取的物件資料，十分的方便。但在 Angular 裡面應該要怎麼寫才能有同樣的效果。

Angular 如果想要達到同樣的效果，就需要將 `Object資料` 塞到 `ngValue` 內即可達到一樣的效果

```typescript
import {Component} from '@angular/core';
 
@Component({
  selector: 'example-app',
  template: `
    <form #f="ngForm">
      <select name="state" ngModel>
        <option value="" disabled>Choose a state</option>
        <option *ngFor="let state of states" [ngValue]="state">
          {{ state.abbrev }}
        </option>
      </select>
    </form>
    
     <p>Form value: {{ f.value | json }}</p>
     <!-- example value: {state: {name: 'New York', abbrev: 'NY'} } -->
  `,
})
export class SelectControlComp {
  states = [
    {name: 'Arizona', abbrev: 'AZ'},
    {name: 'California', abbrev: 'CA'},
    {name: 'Colorado', abbrev: 'CO'},
    {name: 'New York', abbrev: 'NY'},
    {name: 'Pennsylvania', abbrev: 'PA'},
  ];
}
```



## compareWith

當使用 `Object` 當作資料時，要怎麼設定下拉選單所選取的值呢，這時候可以透過 `compareWith` 的方法來實現

```typescript
classs AppComponent{
  ...
  compareFn(c1: Country, c2: Country): boolean {
      return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}
```

template 的部分是

```html
<select [compareWith]="compareFn"  [(ngModel)]="selectedCountries">
    <option *ngFor="let country of countries" [ngValue]="country">
        {{country.name}}
    </option>
</select>
```

透過自訂的方式來決定要依什麼條件來選取下拉選單的選項

* 注意: compareWith 是監聽 `change` 事件，因為 `input`  事件在 Firefox 和 IE 上是不會被觸發的。



# 參考資料

* [SelectControlValueAccessor](https://angular.io/api/forms/SelectControlValueAccessor)