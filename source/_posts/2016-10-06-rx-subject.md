---
layout: post
title: '[RxJS] Subject'
comments: true
date: 2016-10-06 19:53:18
categories: Angular
tags: Angular2, RxJS
---



> A Subject is like an Observable, but can multicast to many Observers. Subjects are like EventEmitters: they maintain a registry of many listeners.

這表示Subject是 Observable，也是Observer。
但是這篇文章是在整理每種類型的Subject

<!-- more -->

RxJS 的 Subject類型除了基本型`Subject`, 還有以下幾種類型的Subject `BehaviorSubject`, `ReplaySubject`, and `AsyncSubject`

## Subject

程式碼

```javascript
var source = Rx.Observable.interval(1000).take(5)
               .do(function(value){ console.log('source' + value);})

var subject = new Rx.Subject(); // 0 is the initial value

var ObserverA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}

var ObserverB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

source.subscribe(subject);



subject.subscribe(ObserverA);
 console.log('ObserverA subscribed');

setTimeout(function(){
  subject.subscribe(ObserverB);
  console.log('ObserverB subscribed');
},2000)
```

執行結果

![](https://farm6.staticflickr.com/5096/30150932965_855e132fdb_o.png)



## BehaviorSubject

> BehaviorSubjects are useful for representing "values over time". For instance, an event stream of birthdays is a Subject, but the stream of a person's age would be a BehaviorSubject.

BehaviorSubject會記錄**最後一次的值**，當後來註冊進來的subscriber可以知道當下的值是什麼

所以BehaviorSubject在建立時，需要指定一個初始值

程式碼如下

```javascript
var source = Rx.Observable.interval(1000).take(5)
               .do(function(value){ console.log('source ' + value);})

var subject = new Rx.BehaviorSubject(0); // 0 is the initial value

var ObserverA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}

var ObserverB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

source.subscribe(subject);

subject.subscribe(ObserverA);
 console.log('ObserverA subscribed');

setTimeout(function(){
  subject.subscribe(ObserverB);
  console.log('ObserverB subscribed');
},2000)


```

執行結果

![](https://farm6.staticflickr.com/5096/30066617701_c3e230b51c_o.png)



## ReplaySubject

> A `ReplaySubject` records multiple values from the Observable execution and replays them to new subscribers.

ReplaySubject有點類似於BehaviorSubject，可以取得subscribe之前的值，只是可以取不只一個。類似回播的功能

ReplaySubject在建立時有幾個參數可以設定，

```javascript
var subject = new Rx.ReplaySubject(bufferSize, windowTime);
```

- bufferSize: ReplaySubject可以儲存 x 數量的值
- windowTime: ReplaySubject取最後  x milliseconds 期間的值

程式碼 (with no windowTime參數)

```javascript
var source = Rx.Observable.interval(500).take(7)
               .do(function(value){ console.log('source ' + value);})

var subject = new Rx.ReplaySubject(3); // 0 is the initial value

var ObserverA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}

var ObserverB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

source.subscribe(subject);

subject.subscribe(ObserverA);
 console.log('ObserverA subscribed');

setTimeout(function(){
  subject.subscribe(ObserverB);
  console.log('ObserverB subscribed');
},2000)
```

執行結果

![](https://farm6.staticflickr.com/5697/29522601444_8f8e39f9cd_o.png)

程式碼 (with windowTime參數)

```javascript
var source = Rx.Observable.interval(500).take(7)
               .do(function(value){ console.log('source ' + value);})

// source: 0--1--2--3--4--5--6-----
//      A: 0--1--2--3--4--5--6-----
//              |---|: windowTime 
//      B:         23--4--5--6-----
var subject = new Rx.ReplaySubject(3, 700); // 0 is the initial value

var ObserverA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}

var ObserverB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

source.subscribe(subject);

subject.subscribe(ObserverA);
 console.log('ObserverA subscribed');

setTimeout(function(){
  subject.subscribe(ObserverB);
  console.log('ObserverB subscribed');
},2000)
```

執行結果

![](https://farm6.staticflickr.com/5243/30116188896_400cfb7143_o.png)



## AsyncSubject

AsyncSubject只會記錄 Observable **完成後**的值。

程式碼

```
var source = Rx.Observable.interval(500).take(7)
               .do(function(value){ console.log('source ' + value);})

var subject = new Rx.AsyncSubject(); // 0 is the initial value

var ObserverA = {
  next: function(value){ console.log('A next '+ value);	},
  error: function(error){ console.error('A error '+ error);   },
  complete: function(){ console.log('A Complete');}
}

var ObserverB = {
  next: function(value){ console.log('B next '+ value);	},
  error: function(error){ console.error('B error '+ error);   },
  complete: function(){ console.log('B Complete');}
}

source.subscribe(subject);

subject.subscribe(ObserverA);
 console.log('ObserverA subscribed');

setTimeout(function(){
  subject.subscribe(ObserverB);
  console.log('ObserverB subscribed');
},2000)
```



執行結果

![](https://farm6.staticflickr.com/5216/29522454703_b9511f0241_o.png)



## BehaviorSubject、ReplaySubject、AsyncSubject 與 Publish 的關係

在[前一篇](http://blog.kevinyang.net/2016/10/06/rxjs-multicast)提到說 publish 是 multicast的變化型，而multicast裡可以建立各式的Subject，那publish相對應的又是什麼，對照表如下

| Subject Type       | Multicasting  Operator                |
| ------------------ | ------------------------------------- |
| Rx.Subject         | publish()                             |
| Rx.BehaviorSubject | publishBehavior(initValue)            |
| Rx.ReplaySubject   | publishReplay(bufferSize, windowTime) |
| Rx.AsyncSubject    | publishLast()                         |



##  參考網址

- [BehaviorSubject](http://reactivex.io/rxjs/manual/overview.html#behaviorsubject)
- [ReplaySubject](http://reactivex.io/rxjs/manual/overview.html#ReplaySubject)
- [AsyncSubject](http://reactivex.io/rxjs/manual/overview.html#AsyncSubject)
