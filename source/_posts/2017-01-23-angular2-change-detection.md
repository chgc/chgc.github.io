---
layout: post
title: '[Angular] Change Detection'
comments: true
date: 2017-01-23 10:21:04
categories: Angular
tags: Angular2
---

![](https://farm1.staticflickr.com/740/32472149965_a7d79c9969_o.png)

Angular會讓View上面的結果與Model的值同步，大部分的時候，我們並不需要去管 `change detection`怎麼運作的，但是，了解 `change detection`並在適當的時候選擇對的 `change detection strategy`，可以增加系統的效能

<!-- more -->

# 何時會觸發change detection

* DOM Events (click, keyup, etc)
* AJAX Requests
* Timers (setTimeout(), setInterval())

## Zone

Angular透過Zone來監控上述行為的變化



# 運作原理

![](https://farm1.staticflickr.com/640/32352266961_1eeb7fba5a_o.png)

Angular在runtime的時候會為每一個component建立一個`Change Detector` 

![](https://farm1.staticflickr.com/689/31630339334_175106c15d_o.png)

Change Detector的運行方向是 Top -> Down，在Default模式下，不論是否有改變，仍會繼續往下檢查

![](https://farm1.staticflickr.com/358/32095374120_6656c40dcf_o.png)

![](https://farm1.staticflickr.com/663/31662279353_4ac2e09719_o.png)

而在 `OnPush`模式下，如果該節點沒有發生異動時，就不會往下檢查了

![](https://farm1.staticflickr.com/437/32480298545_a7aafccf9e_o.png)

# JS101: Value Types & Reference Types比較

在進入Change Detection Strategy之前，先重新溫習一下Value Types和Reference Type

## Value Types (Stack Memory)

包含以下類別

- string
- number
- boolean
- null
- undefined

特性

1. Stack Memory
2. Immutable
3. compared by value
4. copied by value

## Reference Types (Heap Memory)

包含以下類別

- object
- array
- function

特性

1. Heap Memory
2. mutable
3. compared by reference
4. copied by reference

# Change Detection Strategies

 `Default`和 `OnPush` 細節部份，可參考這篇[[Angular2] ChangeDetectionStrategy](http://blog.kevinyang.net/2016/06/05/angular2-ChangeDetectionStrategy/)

根據上面的運作原理，我們可以針對個別的Change Detector做策略上的設定，例如下面的圖

![](https://farm1.staticflickr.com/753/32328351742_3920853cee_o.png)



## OnPush

`OnPush`的設定方法如下列程式碼

```typescript
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  ...
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComponent {
  @Input() movie;
  ...
}

```

當該Component的`changeDetection`被設定為`ChangeDetectionStrategy.OnPush`時，這個Component的檢查關注點就只會在 @Input的這個物件上，所以如果想要讓該Component的 `DoCheck`被觸發，就必須重新指定新的Input Value。

而這裡應用的的原理是，單獨改變Object內的值而不重新給予一個新的Object，在檢查時，將舊object和異動後的object比較後，結果為兩個是同一個object，所以視為無異動(Reference value的特性)

```javascript
var obj1 = {title: 'kevin'};
var obj2 = obj1;
obj2.title = 'KEVIN';
console.log(obj1 == obj2);
> true
obj2 = {title: 'KEVIN'};
console.log(obj1 == obj2);
> false
```



# 結論

**用正確的ChangeDetectionStrategy，減少系統檢查資料異動狀態的次數，就可以大大的提升系統的效能。**



