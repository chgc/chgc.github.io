---
layout: post
title: '[Angular] Angular Material Datepicker 遇到民國年'
comments: true
typora-root-url: 2020-03-23-material-datepicker-taiwan
typora-copy-images-to: 2020-03-23-material-datepicker-taiwan
date: 2020-03-23 08:33:51
categories: Angular
tags: Angular
---

上周接到一個很討厭的需求，對方想要日期選擇時可以用民國年，其實有在處理日期選擇元件的人多少都會遇到這個需求，基本上就是討厭，但該做的還是要做，那 Angular Material Datepicker 要怎麼處理呢?

<!-- more -->

其實也不複雜，因為 Angular Material Datepicker 有提供 `DateAdapter` 的介面可以實做，但又因為從頭做起太痛苦了，只好借用現有的 `MomenetDateAdapter` 來擴充了，以下是幾個地方需要調整

1. parse: 處理使用者輸入日期時，要轉換成對的時間
2. format: 將日期顯示成要顯示的樣子
3. getYearName: 在選擇年的頁面顯示

# 擴充

## 前置作業

因為是要擴充 `MomentDateAdapter`，所以比較保險的方式，是擴充 `momenet`，讓其可以幫忙處理民國年，網路上面是有一個 `momenet-taiwan` 的 plugin，但由於 `Moment` 在 Angular 內的取得方式不太一樣，所以該套件不能直接使用，但裡面所寫的程式碼是可以拿來直接使用，該段程式碼的基本概念是拿 moment 物件直接在上面擴充新功能，相關的程式碼可以參考這個 [Gist](https://gist.github.com/chgc/7a3f73f34386eb0009fff0ff9c091eb4)

在 `MomentDateAdapter` 的部分就直接繼承

```typescript
@Injectable()
export class MyMomentDateAdapter extends MomentDateAdapter {
}
..

@NgModule({
    ...
    providers:[
        ...
        {
          provide: DateAdapter,
          useClass: MyMomentDateAdapter,
          deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        }
    ]
})

```

## format

`DateAdapter` 的 format 是用來處理顯示的樣式，其樣式可以透過 `MAT_DATE_FORMATS` 做設定，介面如下

```typescript
type MatDateFormats = {
    parse: {
        dateInput: any;
    };
    display: {
        dateInput: any;
        monthYearLabel: any;
        dateA11yLabel: any;
        monthYearA11yLabel: any;
    };
}
```

所以 `format` 的方法除了原本的日期值外，還會有 `displayFormat` 的資訊傳入

```typescript
format(date: Moment, displayFormat: string): string {
    date = this.clone(date);
    if (!this.isValid(date)) {
      throw Error('MomentDateAdapter: Cannot format invalid date.');
    }
    return date.format(displayFormat);
}
```

根據我們的需求只需要改變回傳的文字即可，由於我們上面已經有寫好 `moment` 民國年的擴充方法，所以只要將 moment 加工一下拿來使用即可

```typescript
import * as _moment from 'moment';
import { MomentFactory } from './moment-factory';
...

@Injectable()
export class MyMomentDateAdapter extends MomentDateAdapter {
    moment = MomentFactory(_moment);
    ...
    format(date: Moment, displayFormat: string): string {
        date = this.clone(date);
        if (!this.isValid(date)) {
          throw Error('MomentDateAdapter: Cannot format invalid date.');
        }
        return this.moment(date).format(displayFormat);
	}
}
```

經過這樣子的調整後就可以

## parse

parse 的功能是將使用者輸入的文字轉換成日期型，所以這裡的功能是將輸入的民國年文字轉換成西元年的日期型

```typescript

@Injectable()
export class MyMomentDateAdapter extends MomentDateAdapter {
  moment = MomentFactory(_moment);
  constructor(
    @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string,
    @Optional() @Inject(MAT_MOMENT_DATE_ADAPTER_OPTIONS)
    private options?: MatMomentDateAdapterOptions
  ) {
    super(dateLocale, options);
    this.setLocale(dateLocale || this.moment.locale());
  }

  parse(value: any, parseFormat: string | string[]): Moment | null {
    if (value && typeof value === 'string') {
      return this.createMoment(value, parseFormat, this.locale);
    }
    return value ? this.createMoment(value).locale(this.locale) : null;
  }

  private createMoment(
    date: _moment.MomentInput,
    format?: _moment.MomentFormatSpecification,
    locale?: string
  ): Moment {
    const { strict, useUtc }: MatMomentDateAdapterOptions = this.options || {};
    return useUtc
      ? this.moment.utc(date, format, locale, strict)
      : this.moment(date, format, locale, strict);
  }
  ...
}

```

看起來程式碼比較多，但其實就是將文字轉換成日期型而已

## getYearName

`getYearName` 這一個比較討厭，因為在原本的設計並沒有將這一個顯示的格式做成動態設定，必須手動寫死，這一個方法是用來顯示年度選擇的那個頁面

```typescript
 getYearName(date: Moment): string {
    return this.moment(this.clone(date)).format('tYY');
 }
```

對應到 `Material Datepicker` 的程式碼是

```typescript
 /** Creates an MatCalendarCell for the given year. */
  private _createCellForYear(year: number) {
    let yearName = this._dateAdapter.getYearName(this._dateAdapter.createDate(year, 0, 1));
    return new MatCalendarCell(year, yearName, yearName, this._shouldEnableYear(year));
  }
```

* [source code](https://github.com/angular/components/blob/master/src/material/datepicker/multi-year-view.ts#L243-L246)



# 完整程式碼

```typescript
import { Inject, Injectable, Optional } from '@angular/core';
import {
  MatMomentDateAdapterOptions,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { Moment } from 'moment';
import { MomentFactory } from './extend-factory';

@Injectable()
export class MyMomentDateAdapter extends MomentDateAdapter {
  moment = MomentFactory(_moment);
  constructor(
    @Optional()
    @Inject(MAT_DATE_LOCALE)
    dateLocale: string,
    @Optional()
    @Inject(MAT_MOMENT_DATE_ADAPTER_OPTIONS)
    private options?: MatMomentDateAdapterOptions
  ) {
    super(dateLocale, options);
    this.setLocale(dateLocale || this.moment.locale());
  }

  getYearName(date: Moment): string {
    return this.moment(this.clone(date)).format('tYY');
  }

  parse(value: any, parseFormat: string | string[]): Moment | null {
    if (value && typeof value === 'string') {
      return this.createMoment(value, parseFormat, this.locale);
    }
    return value ? this.createMoment(value).locale(this.locale) : null;
  }

  format(date: Moment, displayFormat: string): string {
    date = this.clone(date);
    if (!this.isValid(date)) {
      throw Error('MomentDateAdapter: Cannot format invalid date.');
    }
    return this.moment(date).format(displayFormat);
  }

  private createMoment(
    date: _moment.MomentInput,
    format?: _moment.MomentFormatSpecification,
    locale?: string
  ): Moment {
    const { strict, useUtc }: MatMomentDateAdapterOptions = this.options || {};
    return useUtc
      ? this.moment.utc(date, format, locale, strict)
      : this.moment(date, format, locale, strict);
  }
}
```



# 參考資料

* [moment-taiwan](https://github.com/bradwoo8621/moment-taiwan)

  

