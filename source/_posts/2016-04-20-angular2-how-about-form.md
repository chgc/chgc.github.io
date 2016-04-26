---
layout: post
title: '[Angular2] How about Form?'
date: 2016-04-20 06:14
comments: true
categories: "Angular"
tag: "Angular2"
---
在Angular2的Form, 可以使用[(ngModel)]的方式或是使用 ngFormModel的方式(如下)。 ngModel就不多描述，用法跟Angular1.x一樣

```html
<form [ngFormModel]="form" (submit)="add($event)">
            <div class="col col-4 mr2">
                <label class="label">類別</label>
                <select class="select" ngControl="category">
                    <option value="">--選擇--</option>
                    <option value="類別1">類別1</option>
                    <option value="類別2">類別2</option>
                </select>
                <div *ngIf="!category.valid" class="red">
                    類別 Required
                </div>
            </div>
            <div class="col col-4 mr2">
                <label class="label">金額</label>
                <input class="input" type="number"
                       ngControl="amon" />
                <div *ngIf="!amon.valid" class="red">
                    金額 Required
                </div>
            </div>
            <div class="col col-3 mt3">
                <button class="btn btn-primary" type="submit" [disabled]="!form.valid">新增</button>
            </div>
        </form>
```
js的部分如下
```js
import { Component } from 'angular2/core';
import {FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, Control} from 'angular2/common';

@Component({
    selector: 'ck-book',
    directives: [FORM_DIRECTIVES],
    template: require('./book.html')
})
export class CkBookPage {
    private form: ControlGroup;
    private amon: Control;
    private category: Control;
    private books = [];

    constructor(private builder: FormBuilder) {

        this.amon = new Control("", Validators.required);
        this.category = new Control("", Validators.required);
                
        this.form = builder.group({
            category: this.category,
            amon: this.amon
        });
    }

    add(event) {
        console.log(this.form.value);        
        let _value = Object.assign({}, this.form.value);
        _value.date = new Date();
        this.books.push(_value);
        
        event.preventDefault();
    }
};

```

有幾個新東西出現. ngFormModel, ngControl. 這些都包含在FORM_DIRECTIVES裡. 

FormBuilder是用來組合東西給ngFormModel用, 是把Control包在一起 builder.group({ ... controls})
Control是配合ngControl使用. 初始是 new Control('default value', validator, asyncValidator)

這樣的設定方式，可以讓Form上的動作都在javascript裡面設定。單純html的程式碼

### 小問題(till Verstion Beta15)
1. input[type=number]空白時，預設的值會變成NaN. 但是這個被判斷是有值得，所以Validator.required是真的.
這個問題在github上有被提出來也被解決了，但是就到目前為止，修正未包含在裡面. 所以必須手動修改程式碼, 修改方式如下
修改檔案
檔案位置: angular2\src\common\forms\directives\number_value_accessor.js

```
NumberValueAccessor.prototype.registerOnChange = function (fn) {
        this.onChange = function (value) { fn(lang_1.NumberWrapper.parseFloat(value)); };
    };
change to 
NumberValueAccessor.prototype.registerOnChange = function (fn) {
        this.onChange = function (value) { fn(value == '' ? null : lang_1.NumberWrapper.parseFloat(value)); };
    };
```

[Github commit log](https://github.com/kara/angular/commit/54b45225ae7c23fd5cad12fb1412a6339f6f27fa)

2. date format設定. 原本 book.date | date:"yyyy-MM-dd"這樣子的寫法輸出的結果會是 2016-04-20. 但是現在的版本locale是被寫死的(en-US), 所以也是要進程式碼手動修改.
檔案位置: angular2\src\common\pipes
```
// var defaultLocale = 'en-US'; 修改這裡。參數可以參考moment.js網站
var defaultLocale = 'zh-TW';
```


### 參考文章
- [custom-validators](http://blog.thoughtram.io/angular/2016/03/14/custom-validators-in-angular-2.html)
- [template-driven-forms](http://blog.thoughtram.io/angular/2016/03/21/template-driven-forms-in-angular-2.html)
- [ngBook2- Form](http://blog.ng-book.com/the-ultimate-guide-to-forms-in-angular-2/)
- [learnangular2](http://learnangular2.com/forms/)

