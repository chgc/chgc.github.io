---
layout: post
title: '[Angular2] play with Redux part 1'
date: 2016-04-15 07:09
comments: true
categories: "Angular"
tag: "Angular2"
---
Redux是根據Facebook的flux所產出的一個架構. 簡單介紹請參考[這裡](https://youtu.be/s9AC8KTcce8)

簡單的動作及資料流程如下
![Untitled Diagram.png](http://user-image.logdown.io/user/4862/blog/4871/post/710542/PhIpkTcMTvOGWU1XGjfY_Untitled%20Diagram.png)

複雜一點的流程圖如下
![moreDetailReduxFlow.png](http://user-image.logdown.io/user/4862/blog/4871/post/710542/6Or79jM8QmuFVuhUhrJu_moreDetailReduxFlow.png)

每一個階段都有他應該要做的事情
    - Action: 處理資料，呼叫API, 任何有可能產生副作用的行為都在這階段處理, 通常都是回傳JSON object.       
    - Reducer: 根據Action傳來的動作和資料，來決定與原本的資料(In Store)的關係，例如、新增、更新、移除或過濾等,回傳要顯示在View上面的資料
    
##程式碼
@Component程式的基本架構
```js
import {
    Component,    
    Inject,
    ApplicationRef
} from 'angular2/core';

import * as TodoAction from '../../actions/ToDo';


@Component({
    selector: 'ck-todo-app',    
    template: require('./TodoPage.html')
})
export class CkTodoApp {
    private disconnect: Function;
    private unsubscribe: Function;
        
    private items: any;
    private task: any;

    constructor(
        @Inject('ngRedux') private ngRedux,
        private applicationRef: ApplicationRef) {       
    }    

    ngOnInit() {
        this.disconnect = this.ngRedux.connect(
            this.mapStateToThis,
            this.mapDispatchToThis)(this);

        this.unsubscribe = this.ngRedux.subscribe(() => {
            this.applicationRef.tick();
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
        this.disconnect();
    }

   // 註冊store到變數上
    mapStateToThis(state) {
        return {
            items: state.todo,
            task: state.newtodo
        };
    }
   
    // 註冊功能到這個Class裡
    mapDispatchToThis(dispatch) {
        return {
            add: (task) => dispatch(TodoAction.add(Object.assign({}, task))),
            remove: (task) => dispatch(TodoAction.remove(task))
        };
    }
};
```
TodoPage.html
```html
<div class="clearfix mx-auto col-8">
    <h3>TODO App</h3>
    <div class="clearfix mxn2">
        <input type="text" [(ngModel)]="task.content" class="input inline-block" />
        <button class="btn btn-primary inline-block" (click)="add(task)">Add</button>
    </div>
    <div class="clearfix mxn2">
        <ul class="list-reset" *ngFor="#item of items">
            <li>{{ item.content }} <span (click)="remove(item)">x</span></li>
        </ul>
    </div>
</div>
```

###註冊Store as provider in Angular2 application
```js
import { enableProdMode, provide } from 'angular2/core';
import { bootstrap} from 'angular2/bootstrap';
import { ROUTER_PROVIDERS, APP_BASE_HREF } from 'angular2/router';
import { CkDemoApp } from './containers/main-app';

// 註冊redux store用
import configureStore from './store/configure-store';
const provider = require('ng2-redux').provider;
const store = configureStore({});

declare let __PRODUCTION__: any;

if (__PRODUCTION__) {
    enableProdMode();
}

bootstrap(CkDemoApp, [
    provider(store),
    ROUTER_PROVIDERS,
    provide(APP_BASE_HREF, { useValue: '/' })
]);
```

store/configureStore
```js
///<reference path="./dev-types.d.ts"/>

import {createStore, applyMiddleware, compose} from 'redux';
import {fromJS} from 'immutable';
import ReduxThunk from 'redux-thunk';
import rootReducer from '../reducers';
const persistState = require('redux-localstorage');

function configureStore(initialState) {
    const store = compose(
        _getMiddleware()
    )(createStore)(rootReducer, initialState);

    return store;
}

function _getMiddleware() {
    let middleware = [
        ReduxThunk
    ];

    if (__DEV__) {
        middleware = [...middleware];
    }

    return applyMiddleware(...middleware);
}

export default configureStore;

```

## 設定ACTIONs
actions/Todo
```js
import { TODO_ADD, TODO_REMOVE } from '../constants';
export function add(task) {
    return {
        type: TODO_ADD,
        data: task
    }
}

export function remove(task) {
    return {
        type: TODO_REMOVE,
        data: task
    }
}
```

### 設定可以使用的Reducers
reducers/index
```js
import { combineReducers } from 'redux';
// reducer functions
import {todo, newtodo} from './todo';

// 下面的名稱是要存取store資料時的名稱
// ex. state.todo
export default combineReducers({
    todo,
    newtodo
});

```

reducers/todo.ts
```js
import { fromJS, List } from 'immutable';
import { TODO_ADD, TODO_REMOVE } from '../constants';

const INITIAL_STATE = List<any>();

// todo Reducer
export function todo(state = INITIAL_STATE, action: any = { type: '' }) {
    switch (action.type) {
        case TODO_ADD:
            return state.push(action.data);
        case TODO_REMOVE:
            return state.remove(state.indexOf(action.data));
        default:
            return state;
    }
}

// newtodo Reducer
export function newtodo(state = { content: '' }, action: any = { type: '' }) {
    switch (action.type) {
        case TODO_ADD:
            return { content: '' };
        default:
            return state;
    }
}
```

[CODE](https://github.com/chgc/Angular2WithRedux)



參考資料:
    - [Angular 2 — Introduction to Redux](https://medium.com/google-developer-experts/angular-2-introduction-to-redux-1cf18af27e6e#.yjn4pou3u)
    - [Angular 2 and Redux](http://ngcourse.rangle.io/handout/redux/index.html)
    - [redux](https://github.com/reactjs/redux)
    - [ng2-redux](https://github.com/wbuchwalter/ng2-redux)
    - [immutable.js](https://facebook.github.io/immutable-js/)
    - [work with service](http://onehungrymind.com/build-better-angular-2-application-redux-ngrx/)

