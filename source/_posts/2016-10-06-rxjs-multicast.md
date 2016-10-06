---
layout: post
title: '[RxJS] MultiCasting'
comments: true
date: 2016-10-06 15:25:12
categories: Angular
tags: Angular2, RxJS
---

我們都知道RxJS的Observeable會在subscribe的時候才會執行，所以每一次的subscribe都會執行一次，但是，某些情況下我們並不想要那樣子做，而在RxJS裡面有一個MultiCasting的觀念，主要是用來處理一個Observeable多個Observe的情況時，而不重複執行Observable.  這篇會整理一下關於MultiCasting的相關觀念

<!-- more -->

假設情境

```javascript
var source = Rx.Observable.interval(1000).take(5)

var ObserveA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}

source.subscribe(ObserveA);

var ObserveB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

setTimeout(function(){
  	source.subscribe(ObserveB);
},2000);

```

這樣子跑出來的結果如下

![](https://farm6.staticflickr.com/5795/29518602483_4ecbc90b77_o.png)

## Subject

Observe A和Observe B都有各自己的結果, 如果，我們想要Observe A和Observe B共用同一個資料流的話，該怎麼處理? 這時候就要借用RxJS裡面的 Subject 這個類型的幫助了

官網是這樣子定義Subject的

> A Subject is like an Observable, but can multicast to many Observers. Subjects are like EventEmitters: they maintain a registry of many listeners.

用法如下

```javascript
var source = Rx.Observable.interval(1000).take(5)
var subject = Rx.Subject.create();

var ObserveA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}

subject.subscribe(ObserveA);

source.subscribe(subject);

var ObserveB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

setTimeout(function(){
  	subject.subscribe(ObserveB);
},2000);

```

![](https://farm8.staticflickr.com/7570/30062998941_a312d6c600_o.png)

這樣Observe A與Observe B就共用同一個資料流的資料了, 但是每次都這樣子寫有點麻煩.

## multicast

可以使用multicast的方式將Object.create的方式包起來, 程式碼如下

```javascript
var source = Rx.Observable.interval(1000).take(5)
               .multicast(Rx.Subject.create())

var ObserveA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}
source.connect();

source.subscribe(ObserveA);

var ObserveB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

setTimeout(function(){
  	source.subscribe(ObserveB);
},2000);
```

使用multicast這個operator, 必須使用 .connect() 來執行 Observable了，因為，這裡的 `source.subscribe` 是針對Subject做subscribe而非Observable本身.

## publish

publish為mulitcast的變化型, 在mulitcast裡面需要給予一個Rx.Subject, 例如

```javascript
.multicast(new Rx.Subject())
// 可以替換成
.publish()

// 或是
.multicast(new Rx.ReplaySubject())
// 可以替換成
.publishReplay()
```



## refCount

可是，這樣子寫又有點麻煩，有沒有自動開始結束的寫法. 其實是有的，那就是 `refCount`

refCount: 啟動條件: subscribe的observe數量大於0時。停止條件: subscribe的observe數量等於0時

> recCount makes the multicasted Observable automatically start executing when the first subscriber arrives, and stop executing when the last subscriber leaves.

程式碼如下
```javascript
var source = Rx.Observable.interval(1000)
               .do(x => console.log('souce '+ x))
               .publish()
               .refCount()

var ObserveA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}

var subA = source.subscribe(ObserveA);

var ObserveB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

var subB
setTimeout(function(){
  	subB = source.subscribe(ObserveB);
},2000);

setTimeout(function(){
  subA.unsubscribe();
  console.log('unsubscribe A');
},5000)

setTimeout(function(){
  subB.unsubscribe();
  console.log('unsubscribe B');
},7000)
```

執行結果如下

![](https://farm6.staticflickr.com/5148/29518843843_e15cd6bc2e_o.png)



## share

RxJS有提供更簡便的寫法 `share` ，share是`publish`,` refCount` 這兩個operator的簡寫，程式碼如下

```javascript
var source = Rx.Observable.interval(1000)
               .do(x => console.log('souce '+ x))
               .share()

var ObserveA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}

var subA = source.subscribe(ObserveA);

var ObserveB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

var subB
setTimeout(function(){
  	subB = source.subscribe(ObserveB);
},2000);

setTimeout(function(){
  subA.unsubscribe();
  console.log('unsubscribe A');
},5000)

setTimeout(function(){
  subB.unsubscribe();
  console.log('unsubscribe B');
},7000)
```

執行結果是一樣的

## 結論

以上為最基本的multicast的幾種用法，但是這都只是基本款而已，因為RxJS裡面的Subject有好幾種，每一種類型的Subject所呈現的結果又都不一樣，這就待下一篇再來討論