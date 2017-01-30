---
layout: post
title: "[Angular]Rxjs的Observers"
comments: true
date: 2016-05-10 16:59:03
categories: Angular
tags: Angular
---

Angular2裡面有用到[RxJS](https://github.com/Reactive-Extensions/RxJS)的Extensions. 那這個Extendsion會帶給Angular2怎樣的幫助，來研究一下Http的程式碼吧

<!-- more -->

## Angular2 Http Code

[source code - http.ts](https://github.com/angular/angular/blob/master/modules/%40angular/http/src/http.ts)

```javascript
import {Response} from './static_response';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class Http {
  constructor(protected _backend: ConnectionBackend, protected _defaultOptions: RequestOptions) {}
	get(url: string, options?: RequestOptionsArgs): Observable<Response> {
         ....
  }
}

```

所以在執行Http.get(...)所回傳的結果是 **Observable<Response>**，因為這樣子的關係，我們就可以使用RxJS Observers的方法 [參考網址](http://reactivex.io/documentation/observable.html)

## Subscribe Method

```javascript
myObservable.subscribe(OnNext,onError,onCompleted);
```

**`onNext`**

An Observable calls this method whenever the Observable emits an item. This method takes as a parameter the item emitted by the Observable.

**`onError`**

An Observable calls this method to indicate that it has failed to generate the expected data or has encountered some other error. It will not make further calls to `onNext` or `onCompleted`. The `onError`method takes as its parameter an indication of what caused the error.

**`onCompleted`**

An Observable calls this method after it has called `onNext` for the final time, if it has not encountered any errors.

## 應用方式

Http.call完之後，也可以加工response的結果。[方法](http://reactivex.io/documentation/operators.html)可以串聯起來, Demo Code如下

```javascript
this.http.get('xxx')
    .map(res => res.text())
    .subscribe(
      data => this.randomQuote = data,
      err => this.logError(err),
      () => console.log('Random Quote Complete')
    );
```



## 多個Http Request時的處理方式

如果想要同時間執行多個Http Request，但是又要等所有的Request都完成後再將資料對應到變數上，那要怎麼寫，這時候就需要使用 **Observable.forkJoin**，程式碼如下

```javascript
Observable.forkJoin(
        this.http.get('/app/books.json').map((res:Response) => res.json()),
        this.http.get('/app/movies.json').map((res:Response) => res.json())
    ).subscribe(
      data => {
        this.books = data[0]
        this.movies = data[1]
      },
      err => console.error(err)
    );
```

