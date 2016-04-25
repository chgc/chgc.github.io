---
layout: post
title: '[Angular2] css style '
date: 2016-04-25 01:40
comments: true
categories: "Angular"
tag: "Angular2"
---
Angular2 Component styles有三種模式
    1. ViewEncapsulation.None: 適用於全部頁面(No Shadow DOM)
    2. ViewEncapsulation.Native: 僅套用於Shadow DOM自己本身
    3. ViewEncapsulation.Emulated: 預設行為。 會自動將每個component給予一個名稱，讓各compoent裡面的style會各自獨立
    
先來看第1,2種，看看style會被放在哪一個位置
1. ViewEncapsulation.None

```js
@Component({
    selector: 'ck-book',
    template: require('./book.html'),
    styles: [`
        h3 {
           color: red
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class CkBookPage {}
```

![](https://farm2.staticflickr.com/1645/26627939205_43b19d3144_o.png)

2.ViewEncapsulation.Native

```js
@Component({
    selector: 'ck-book',
    template: require('./book.html'),
    styles: [`
        h3 {
           color: red
        }
    `],
    encapsulation: ViewEncapsulation.Native
})
export class CkBookPage {}
```

![](https://farm2.staticflickr.com/1453/26022315254_564ea8044a_o.png)

注意到ViewEncapsulation.Native將ViewEncapsulation.None的和本身定義的Style都包含在Shadow DOM裡面，這表示該Componenet與外面已經分開了. 本身所定義的css樣式不會影響到別人了

3.  ViewEncapsulation.Emulated為預設行為，會自動將每個Component給予一個名稱，然後在產生html時會將各Componet裡
定義的style加上該名稱，讓css不會互相影響. 

```js
@Component({
    selector: 'ck-book',
    template: require('./book.html'),
    styles: [`
        h3 {
           color: red
        }
    `],
    encapsulation: ViewEncapsulation.Emulated
})
```
```html
		<style>h3[_ngcontent-jfs-3] {
           color: red
     }</style>
      <div _ngcontent-jfs-3 class="clearfix mx-auto col-8">
          <h3 _ngcontent-jfs-3>Booking</h3>
  		....
```

![](https://farm2.staticflickr.com/1489/26534950052_6d97a87c71_o.png)

## 參考
- [shadow-dom-strategies-in-angular2](http://blog.thoughtram.io/angular/2015/06/29/shadow-dom-strategies-in-angular2.html)
- [Controlling how Styles are Shared with View Encapsulation](https://egghead.io/lessons/angular-2-controlling-how-styles-are-shared-with-view-encapsulation)