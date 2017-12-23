---
layout: post
title: '[Angular] Pipe'
comments: true
date: 2017-05-13 10:16:55
categories: Angular
tags: Angular
---

Angular Pipe 是一個很強大的資料顯示轉型的工具，可以透過 Pipe 的幫忙，將原始資料轉換成我們想要顯示的樣式，且不會異動到原始資料的內容。

Angular 有內建了一些 Pipe 像是 `DatePipe`、 `UpperCasePipe`、`LowerCasePipe`、 `CurrencyPipe` 和 `PercentPipe`及其他的 [Pipe](https://angular.io/docs/ts/latest/api/#!?query=pipe)。當然 Angular 也允許讓我們自訂 Pipe 的功能。

<!-- more -->


先從內建的 Pipe 介紹起

# 內建 Pipe

在詳細介紹內建 `Pipe `之前，有一點要注意的是，如果有使用到 `DatePipe` 和 `CurrencyPipe` 時，要在舊版瀏覽器上正常運作的話，需要額外再加上一個 polyfill 的 library

```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en"></script>
```



## DatePipe

### 功能

將日期根據當地的顯示規則顯示

### 使用方式

> date_expression | date[:format]

### 說明

- `date_expression` 必須是日期型別的物件或是數字(milliseconds) 或是 [ISO文字](https://www.w3.org/TR/NOTE-datetime)

- `format` 可以用來調整要顯示的日期格式，可以使用的格式說明如下

  - `'short'`: 相當於  `'yMdjm'` (例如  `9/3/2010, 12:05 PM` for `en-US`)
  - `'medium'`: 相當於 `'yMMMdjms'` (例如 `Sep 3, 2010, 12:05:08 PM` for `en-US`)
  - `long`: 相當於 `MMMM d, y, h:mm:ss a z` (例如 `June 15, 2015 at 9:03:01 AM GMT+1`)
  - `'full'`: 相當於 `'EEEE, MMMM d, y, h:mm:ss a zzzz'` (例如 `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00`)
  - `'fullDate'`: 相當於  `'yMMMMEEEEd'` (例如  `Friday, September 3, 2010` for `en-US`)
  - `'shortDate'`: 相當於  `'yMd'` (例如  `9/3/2010` for `en-US`)
  - `'longDate'`: 相當於  `'yMMMMd'` (例如  `September 3, 2010` for `en-US`)
  - `'mediumDate'`: 相當於 `'yMMMd'` (例如  `Sep 3, 2010` for `en-US`)
  - `'fullDate'`: 相當於  `'EEEE, MMMM d, y'` (例如   `Monday, June 15, 2015`)
  - `'shortTime'`: 相當於  `'jm'` (例如  `12:05 PM` for `en-US`)
  - `'mediumTime'`: 相當於 `jms'` (例如  `12:05:08 PM` for `en-US`)
  - `'longTime'`: 相當於  `'h:mm:ss a z'` (例如 `9:03:01 AM GMT+1`)
  - `'fullTime'`: 相當於  `'h:mm:ss a zzzz'` (例如 `9:03:01 AM GMT+01:00`)

  | 描述       | 符號   | 短表示         | 長表示                            | 數值      | 2位數       |
  | -------- | ---- | ----------- | ------------------------------ | ------- | --------- |
  | ear      | G    | GGG(AD)     | GGGG<br/>(Anno Domini)         |         |           |
  | year     | y    |             |                                | y(2015) | yy(15)    |
  | month    | M    | MMM(Sep)    | MMMM<br/>(September)           | M(9)    | MM(09)    |
  | day      | d    |             |                                | d(3)    | dd(03)    |
  | weekday  | E    | EEE(Sun)    | EEEE<br/>(Sunday)              |         |           |
  | hour     | j    |             |                                | j(13)   | jj(13)    |
  | hour12   | h    |             |                                | h(1 PM) | hh(01 PM) |
  | hour24   | H    |             |                                | h(13)   | HH(13)    |
  | minute   | m    |             |                                | m(5)    | mm(05)    |
  | second   | s    |             |                                | s(9)    | ss(09)    |
  | timezone | z    |             | z <br/>(Pacific Standard Time) |         |           |
  | timezone | Z    | Z(GMT-8:00) |                                |         |           |
  | timezone | a    | a(PM)       |                                |         |           |

### 範例

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>DatePipe</h1>
    <p>{{ dateObj | date }}</p>
    <p>{{ dateObj | date:'medium' }} </p>
    <p>{{ dateObj | date:'shortTime' }}</p>
    <p>{{ dateObj | date:'mmss' }}</p>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  dateObj = new Date();
}
```

顯示結果

![](https://farm5.staticflickr.com/4159/34581824156_b21fe3eecf_o.png)

## UpperCasePipe

### 功能

將所有英文字轉換成大寫

### 使用方式
> string_expression | uppercase

### 範例

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>UpperCase</h1>
    <p>{{ display | uppercase }}</p>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  display = 'this is upperCase testcase';
}
```

顯示結果

![](https://farm5.staticflickr.com/4187/33813227533_255dea8cb8_o.png)

## LowerCasePipe

### 功能

將所有英文字轉換成小寫

### 使用方式

string_expression | lowercase

### 範例

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>LowerCasePipe</h1>
    <p>{{ display | lowercase }}</p>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  display = 'this is LOWERCASE testcase';
}
```

顯示結果

![](https://farm5.staticflickr.com/4165/34623295465_458e50f4b6_o.png)



## TitleCasePipe

### 功能

將每一個英文單字的第一個字母變成大寫

### 使用方式

string_expression | titlecase

### 範例

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>TitleCasePipe</h1>
    <p>{{ display | titlecase }}</p>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  display = 'this is TILECASE testcase';
}
```

顯示結果

![](https://farm5.staticflickr.com/4183/34581944296_a977159858_o.png)

## CurrencyPipe

### 功能

將數字根據當地貨幣的顯示規則顯示

### 使用方式
> number_expression | currency[:currencyCode[:symbolDisplay[:digitInfo]]]

### 說明

- 只接收數字型別的資料
- `currencyCode` 是 [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 貨幣代碼，例如  `USD` 代表美金， `TWD` 代表新台幣。
- `symbolDisplay` 是布林值，用來決定是否顯示貨幣符號或是貨幣代碼
  - `true` 使用符號 (例如 `$`).
  - `false` (預設): 使用貨幣代碼 (e.g. `USD`).
- `digitInfo` 請參閱[`DecimalPipe`](https://angular.io/docs/ts/latest/api/common/index/DecimalPipe-pipe.html) 的說明.

### 範例

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>CurrencyPipe</h1>
    <p>A: {{a | currency:'USD':false}}</p>
    <p>B: {{b | currency:'USD':true:'4.2-2'}}</p>
    <p>C: {{c | currency:'TWD':false}}</p>
    <p>D: {{d | currency:'TWD':true:'4.2-2'}}</p>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  a: number = 0.259;
  b: number = 1.3495;
  c: number = 15000;
  d: number = 20000;
}
```

顯示結果

![](https://farm5.staticflickr.com/4178/34623423285_752310283f_o.png)


## PercentPipe

### 功能

將數字根據當地顯示規則顯示百分比

### 使用方式
> number_expression | percent[:digitInfo]

### 說明

- 只接收數字型別的資料
- `digitInfo` 請參閱[`DecimalPipe`](https://angular.io/docs/ts/latest/api/common/index/DecimalPipe-pipe.html) 的說明.

### 範例

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>PercentPipe</h1>
    <p>A: {{a | percent}}</p>
    <p>B: {{b | percent:'4.3-5'}}</p>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  a: number = 0.259;
  b: number = 1.3495;
}
```

顯示結果

![](https://farm5.staticflickr.com/4175/34582068606_8f95ef28c1_o.png)


## DecimalPipe

### 功能

將數字根據當地顯示規則顯示

### 使用方式
> number_expression | number[:digitInfo]

### 說明

- 只接收數字型別的資料

- `digitInfo` 以文字形式來設定數字顯示規則

  ```
  {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
  ```

  - `minIntegerDigits`  是整數最小顯示位數，預設為 `1`.
  - `minFractionDigits` 是小數點後最小顯示位數，預設為 `0`.
  - `maxFractionDigits` 是小數點後最大顯示位數，預設為 `3`

### 範例

```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>DecimalPipe</h1>
    <p>e (no formatting): {{e}}</p>
    <p>e (3.1-5): {{e | number:'3.1-5'}}</p>
    <p>pi (no formatting): {{pi}}</p>
    <p>pi (3.5-5): {{pi | number:'3.5-5'}}</p>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  pi: number = 3.141592;
  e: number = 2.718281828459045;
}
```

顯示結果

![](https://farm5.staticflickr.com/4157/34461393612_3e66c3de42_o.png)


## JsonPipe

### 功能

將值轉換成 JSON 文字

### 使用方式

expression | json

### 說明

- 使用 `JSON.stringify` 的方法將值轉換成文字

### 範例

​```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <h1>JsonPipe</h1>
    <p>Without JSON pipe:</p>
    <pre>{{object}}</pre>
    <p>With JSON pipe:</p>
    <pre>{{object | json}}</pre>
  </div>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  object: Object = {
    foo: 'bar',
    baz: 'qux',
    nested: {xyz: 3, numbers: [1, 2, 3, 4, 5]}
  };
}
```

顯示結果

![](https://farm5.staticflickr.com/4180/34288536410_a1b29ab000_o.png)


## SlicePipe

### 功能

建立新的清單或是切割後的部分文字

### 使用方式

array_or_string_expression | slice:start[:end]

### 說明

- 只接收陣列或是文字型的資料
- `start` 是切割的開始位置
  - 如果是 `正整數` 則會回傳該位置以後的資料或文字。
  - 如果是 `負整數` 則會從資料或文字結尾往回計算開始位置，在回傳該位置之後的資料或文字。
  - 如果是 `正整數` 而且該整數大於陣列或是文字長度時，則會回傳空的陣列或文字。
  - 如果是 `負整數` 而且該整數大於陣列或是文字長度時，則會回傳整個陣列或文字。
- `end` 是切割的結束位置
  - 如果是沒有給予任何數字時，則回傳到結尾的所有資料。
  - 如果是 `正整數` 則回傳結束位置前的所有資料或文字。
  - 如果是 `負整數`  則會從資料或文字結尾往回計算結束位置，並回傳結束位置前的所有資料或文字。
- 所有的行為都是基於 `Array.prototype.slice()` 和 `String.prototype.slice()` 的基礎上。
- 如果操作的對象是一個陣列，每次都會回傳一個全新的陣列
- 如果操作的資料是空值，Pipe 會回傳空值

### 範例

​```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <h1>SlicePipe</h1>
    <h2>操作陣列</h2>
    <ul>
      <li *ngFor="let i of collection | slice:1:3">{{i}}</li>
    </ul>
    <h2>操作文字</h2>
    <p>{{str}}[0:4]: '{{str | slice:0:4}}' - 預期輸出為 'abcd'</p>
    <p>{{str}}[4:0]: '{{str | slice:4:0}}' - 預期輸出為 ''</p>
    <p>{{str}}[-4]: '{{str | slice:-4}}' - 預期輸出為 'ghij'</p>
    <p>{{str}}[-4:-2]: '{{str | slice:-4:-2}}' - 預期輸出為 'gh'</p>
    <p>{{str}}[-100]: '{{str | slice:-100}}' - 預期輸出為 'abcdefghij'</p>
    <p>{{str}}[100]: '{{str | slice:100}}' - 預期輸出為 ''</p>
  </div>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  collection: string[] = ['a', 'b', 'c', 'd'];
  str: string = 'abcdefghij';
}
```

顯示結果

![](https://farm5.staticflickr.com/4170/34512030522_8b45394b1e_o.png)



## AsyncPipe

### 功能

從非同步動作 (Promise/Observable) 中取出資料

### 使用方式

observable_or_promise_expression | async

### 說明

`async` pipe 會訂閱一個 `Observable` 或是 `Promise` 物件，並獲取最後發生的資料。當有新的資料產生時，`async` pipe 會提示 `ChangeDetector` 要檢查 `Component` 的值。

當 `Comoponent` 被摧毀時，通常是離開該 `Component`的時候，`async` 會自動取消訂閱 ( unsubscribe)，避免潛在的記憶體洩漏問題。

### 範例

```typescript
import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <h1>AsyncPipe</h1>
    <div><code>observable|async</code>: Time: {{ time | async }}</div>
  </div>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  time = new Observable<string>((observer: Subscriber<string>) => {
    setInterval(() => observer.next(new Date().toString()), 1000);
  });
}

```

顯示結果

![](https://farm5.staticflickr.com/4191/34673947075_be9600bd26_o.png)

## I18nPluralPipe & I18nSelectPipe

由於這兩個 Pipe 跟多國語系功能有關係，且皆處於 `Experimental` 階段，故在次先不做說明。


# 自訂 Pipe

透過 CLI 產生 `Pipe` 是最快的，指令是

​```typescript
ng g p "pipeName"
```

所產生出來的基本架構是


​```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'exponential'
})
export class ExponentialPipe implements PipeTransform {

  transform(value: number, exponent: string): number {
    let exp = parseFloat(exponent);
    return Math.pow(value, isNaN(exp) ? 1 : exp);
  }
}
```

- `transform` function 所回傳的值，會用來顯示在畫面上
- 第一個參數 `value` 是所要轉換的資料來源
- 第二個之後的參數可以用來接 Template 傳給 `pipe` 的參數值

如果要傳入多個參數的時後，transform 的地方值直接加上第3的參數或是使用 ...args 也是可以，而在 template 的使用方式則是 {% raw %}{{ value | xxpipe: 1_arg: 2_arg: 3:arg }}{% endraw %} 以此類推。


# Pipe 與 ChangeDetection

Angular 會透過 `change detection` 方法執行的過程中，去檢查 data-bound值的變化，而 `change detection` 會在每一次 DOM Eevent 後被觸發，例如按下鍵盤的鍵，滑鼠的移動，伺服器的回應等事件，這個過程是需要付出相對的成本，為了效能，Angular會盡量降低 `change detection` 的次數

所以 Pipe 會採用最簡單又快速的判斷規則，[ChangeDetectionStrategy.OnPush](https://angular.io/docs/ts/latest/api/core/index/ChangeDetectionStrategy-enum.html)。

這表示當 Pipe 如果用在陣列上，就有機會出現不在預期內的顯示結果，如以下的範例

```typescript
import {Pipe, PipeTransform} from '@angular/core';

import {Flyer} from './app.component';

@Pipe({name: 'flyingHeroes'})
export class FlyingHeroesPipe implements PipeTransform {
  transform(allHeroes: Flyer[]) {
    return allHeroes.filter(hero => hero.canFly);
  }
}
```

component

```typescript
@Component({
  selector: 'app-root',
  template: `
     <input type="text" #box
          (keyup.enter)="addHero(box.value); box.value=''"
          placeholder="hero name">
    <button (click)="reset()">Reset</button>
    <div *ngFor="let hero of heroes | flyingHeroes">
      {{hero.name}}
    </div>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  heroes: any[] = [];
  canFly = true;
  constructor() {
    this.reset();
  }

  addHero(name: string) {
    name = name.trim();
    if (!name) {
      return;
    }
    let hero = {name, canFly: this.canFly};

    // this.heroes.push(hero); // 這個不會更新畫面，因為不符合 OnPush 的條件
    
    this.heroes = [...this.heroes, hero]; // 因會產生一個新的 Array Object, 所以會觸發 CD
  }

  reset() {
    this.heroes = HEROS.slice();
  }
}
```



# Pure and Impure Pipes

Angular 的 Pipe 預設皆為 `Pure`，如果需要設定為 `Impure`的話，請這樣子設定
```typescript
@Pipe({
  name: 'flyingHeroesImpure',
  pure: false
})
...
```

至於什麼是 `Pure Pipe` ，什麼是 `Impure Pipe`

## Pure Pipe

這裡所指的 `Pure`，至針對 `Pipe` 所要轉換的值是否為 `Pure Change`，所謂的 `Pure Change` 是改變 primitive input value( String, Number, Boolean, Symbol) 或是改變  Object 參考的位址 (Date, Array, Function, Object)。

這規則與 [ChangeDetectionStrategy.OnPush](https://angular.io/docs/ts/latest/api/core/index/ChangeDetectionStrategy-enum.html) 是一樣的。在上面的例子中，因為 `heroes` 是一個陣列物件，如果是 `push`的行為並不會改變該陣列所參考的位址 (ByReference)，必須重新建立一個新的陣列物件，才會改變參考位址。



## Impure Pipe

`Impure Pipe` 就是 `Pure`的相反，也是 `ChangeDetectionStrategy` 預設的執行方式，只要有資料異動，就會觸發改變。

來調整一下上面的範例，來讓 array.push 也可以做到畫面更新顯示的功能。

```typescript
import {Pipe, PipeTransform} from '@angular/core';

import {Flyer} from './app.component';

@Pipe({name: 'flyingHeroes', pure: false})
export class FlyingHeroesPipe implements PipeTransform {
  transform(allHeroes: Flyer[]) {
    return allHeroes.filter(hero => hero.canFly);
  }
}
```

當這樣子設定為 `Impure`時，下面的 `push` 就可以使用而且畫面也會更新


```typescript

addHero(name: string) {
    name = name.trim();
    if (!name) {
      return;
    }
    let hero = {name, canFly: this.canFly};

    this.heroes.push(hero); 
  }
  
```

# 參考資料

- [官方文件](https://angular.io/docs/ts/latest/guide/pipes.html)
- [ngx-translate](http://www.ngx-translate.com/)


