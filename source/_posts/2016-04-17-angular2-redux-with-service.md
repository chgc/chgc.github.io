---
layout: post
title: '[Angular] play with Redux part 2'
date: 2016-04-17 12:15
comments: true
categories: "Angular"
tag: "Angular" 
---
在Part 1提到在aciton裡面，如果有需要呼叫api的行為，都會發生這個階段
目前有發現有兩種方式可以處理api. 
1. angular的service(http call)
2. [fetch api](https://github.com/github/fetch)

如果利用第二種方式處理api call時，可以直接寫在action裡面。但是如果想要利用angular的service方式時，就要繞一下路了
但是，還是先簡單的寫一下fetch的方式

```js
export function loadTodo() {
	 return dispatch => {
        return fetch('api/Values')
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                return ({
                    type: TODO_INIT,
                    payload: data
                });
            })
            .then((action) => {
                dispatch(action);
            })
    }
}
```

利用service的code如下
```js
import {Injectable, Inject } from 'angular2/core';

import {Http, Response} from 'angular2/http';
import 'rxjs/Rx';
import {TODO_INIT} from '../constants';

@Injectable()
export class TodoService {
    constructor(
        @Inject('ngRedux') private store,
        private http: Http) {

    }

    loadTodo() {
        return this.http.get('api/Values')
            .map((res) => { return res.json() })
            .map((d) => ({
                type: TODO_INIT,
                payload: d
            }))
            .subscribe((action) => {
                this.store.dispatch(action);
            })
    }
}
```
