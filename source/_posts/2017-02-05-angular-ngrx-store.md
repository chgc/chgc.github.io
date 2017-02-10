---
layout: post
title: "[Angular] 使用 ngrx/store 來實做 Redux Style's App"
comments: true
date: 2017-02-05 19:12:36
categories: Angular
tags: Angular
---

Angular 裡面有許多管理 Application State 的方法 ，`ngrx` 是其中一種。ngrx 提供幾個 libraries 可以讓將 RxJS 與 Redux Style 結合在一起。



<!-- more -->

# 設定

為每一個資料集建立一個 Reducer Function，這個 Reducer 就負責用來更新 Store 內的資料。而各個 Reducer  集合起來就是整個應用程式的資料狀態了。下面為Reducer的範例程式

```typescript
// counter.ts
import { ActionReducer, Action } from '@ngrx/store';

export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const RESET = 'RESET';

export function counterReducer(state: number = 0, action: Action) {
    switch (action.type) {
        case INCREMENT:
            return state + 1;

        case DECREMENT:
            return state - 1;

        case RESET:
            return 0;

        default:
            return state;
    }
}
```

在 AppModule 下，將Reducer註冊到 Store裡，範例如下

```typescript
import { NgModule } from '@angular/core'
import { StoreModule } from '@ngrx/store';
import { counterReducer } from './counter';

@NgModule({
  imports: [
    BrowserModule,
    StoreModule.provideStore({ counter: counterReducer })
  ]
})
export class AppModule {}
```

在 Component 要讀取 store內的資料時，程式碼如下

```typescript
import { Store } from '@ngrx/store';

...

class MyAppComponent {
    counter: Observable<number>;

    constructor(private store: Store<AppState>){
        this.counter = store.select('counter');
    }

    ...
}

```

這裡要留意的是， store.select 出來的物件是 Observable 物件。

操作資料的方式，可以透過以下的方式做操作

```typescript
interface Action {
	  type: string;
	  payload?: any;
}

store.dispatch(<ACTION>action);
```



```typescript
...

class MyAppComponent {
    constructor(private store: Store<AppState>){
      ...    
    }

    increment(){      
        this.store.dispatch({ type: INCREMENT });
    }
}
```

## Redux的運作流程

> Action -> Dispatch -> Reducer -> Store -> View

基本的動作流程是，在 Controller的 method 裡去 Dispatch an Action，之後所有的Reducer都會判斷是否有定義該 Action 行為，如果有的話，就執行該區塊的會重新指定新的資料到 Store 裡。

# 實際範例

## AppModule


```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppRoutingModule } from './app-routing.module';

import { PostReducer } from './post.reducer';
import { MyEffects } from './post.effects';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ...
    StoreModule.provideStore({
      posts: PostReducer
    }),
    EffectsModule.runAfterBootstrap(MyEffects)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

這裡需要自己寫幾個 Function

1. PostReducer
2. PostEffects

## AppComponent

```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './Models/app-state.model';
import { Posts, Post, PostComment } from './Models/post.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works!';

  posts: Observable<Posts>;
  post: Observable<Post>;
  comment: Observable<PostComment>;

  constructor(private store: Store<AppState>){
    this.posts = store.select(state=> state.posts);
    // or 你也可以這樣子寫
    // this.posts = store.select('posts');
    ...
  }

  ngOnInit(){
    this.store.dispatch({type: "QUERY"});
  }
    
  display(post: Post){
    this.store.dispatch({ type: "DETAIL", payload: post });
  }

}

```

```html
<h1>
  {{title}}
</h1>
<hr>
<ul>
  <li *ngFor="let post of (posts | async).list">
    <span (click)="display(post)">{{ post | json }}</span>
  </li>
</ul>
<div>
  {{ post | async | json }}  
</div>
<div>
  {{ comment | async | json }}
</div>

```

`AppComponent`裡面有兩個動作，

1. 當 OnInit 時，取得 Post 清單。 
2. 當點選 Post 時，顯示 Post 的詳細資料及 Comment 資料

這裡會搭配 @ngrx/effects 一起使用，@ngrx/effects 是用來處理任何side-effect的事情，包括 API Call等，這部分的程式碼會寫在 `PostEffects`裡

## PostEffects

```typescript
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Posts, Post} from './Models/post.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';

@Injectable()
export class PostEffects {
  constructor(private actions$: Actions, private http: Http) { }

  @Effect() posts$: Observable<Action> = this.actions$
  .ofType("QUERY")
  .switchMap(action=> {
      return this.http.get('https://jsonplaceholder.typicode.com/posts')
            .map(res=>({type: 'QUERY_SUCCESS', payload: { list: res.json()}}));
  })

  @Effect() comments$: Observable<Action> = this.actions$
  .ofType('DETAIL')
  .switchMap(action =>         this.http.get(`https://jsonplaceholder.typicode.com/posts/${action.payload.id}/comments`)
                    .map(res => ({ 
                        type: 'COMMENT', 
                        payload: { detail: action.payload, comment: res.json()}
                    }))
  );
}
```

@ngrx 提供了`effects`的 library， 用來處理 side-effect，搭配 RxJS 的 Operator，來組合 service 或是其他的行為，透過這樣子的方式，可以讓資料處理上單純化。

## PostReducer

```typescript
import { Action } from '@ngrx/store';
import { Posts, Post } from './Models/post.model';

const initState: Posts = {
    list: <Post[]>[],
    detail: <Post>{},
    comment: undefined
};

export function PostReducer(state: Posts = initState, action: Action) {
    switch (action.type) {
        case "QUERY_SUCCESS":
            return Object.assign({}, state, action.payload);
       case "COMMENT":
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}
```

Reducer 是用來更新 Store 的一個 function，每一個的更新是透過給予一個新的值，而不是修改既有的值，這樣子可以避免一些 JavaScript mutable 的問題產生。



# 結論

@ngrx/store 真的提供一個很簡易但容易管理的 Application State 管理機制。或許在以後的文章可以有更實務上的應用情境。

其實，Redux 也有類似的處理機制，相關的內容可以參閱以下的網址



# 參考資料

- [ngrx/store](https://github.com/ngrx/store)
- [ngrx/effects](https://github.com/ngrx/effects)
- [angular-redux/store](https://github.com/angular-redux/store)
- [Side-Effect Management Using Epics](https://github.com/angular-redux/store/blob/master/docs/epics.md)