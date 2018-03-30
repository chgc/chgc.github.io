---
layout: post
title: '[Angular] 第一次體驗 NGXS'
comments: true
date: 2018-03-30 09:34:54
categories: Angular
tags: Angular
---

沒錯，又是另外一套 State management 工具，這套叫做 `NGXS` ，為什麼會想嘗試這一套呢? 主要是他的語法與 Angular 現有的寫法及運作方式幾乎是一樣的，學習門檻變得很低，而且，重點是要產生的檔案變得非常的少!!

<!-- more -->

# 安裝 NGXS

安裝 `NGXS` 的方式很簡單，透過 npm 安裝 `@ngxs/store` 即可

```
npm install @ngxs/store
```

在 `app.module.ts` 將 `NgxsModule` imports 進來

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, 
            NgxsModule.forRoot([]) // 用來註冊 state 用
           ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

```

* 當遇到 lazy loading modules 時，在該 module 下會使用 `NgxsModule.forFeature([])`來註冊 state；即使所有的 module 都是 lazy load 的話，在 root module 下，還是得註冊 `NgxsModule.forRoot([])`

到這個步驟時，NGXS 已經加入到 angular 專案裡了

# 建立 State

NGXS 的 State  是一個單純的 class  檔案，可以透過  `ng g cl <<state file name>>` 來產生，作者建議的檔案名稱是 `[stateName].state.ts` ，就此篇練習的目的，建立一個 `todos.state.ts` 檔案，Class 名稱為 `TodosState`

```typescript
export class TodoItem {
  constructor(public content: string) {}
}

export interface TodosStateModel {
  dataset: TodoItem[];
}

@State<TodosStateModel>({
  name: 'todos',
  defaults: {
    dataset: []
  }
})
export class TodosState {}
```

* `@State` decorator 用來描述 `state` 的狀態
  * `@State<T>` ：定義此 state 的資料型別
  * `name`：該 state 在 store 裡的名稱
  * `defaults`: 資料存放位置，(預設值)
* 用來描述 `@State` 的型別，建議在最後加上 Model，例如 `TodoStateModel`

完成建立 state 時，這時候在到 `app.module.ts` 內註冊到 `NgxsModule.forRoot([])` 內

```typescript
...
import { TodosState } from './todos.state';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, 
            NgxsModule.forRoot([TodosState]) // 註冊 state
           ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

```

# 建立 Action

要設定可以 dispatch 的 action，在 NGXS 的架構下，是不需要額外新增檔案的，直接寫在 state class 下即可

```typescript
export class ADDTODO {
  payload: TodoItem;
  constructor(name: string) {
    this.payload = new TodoItem(name);
  }
}

@State<TodosStateModel>({
  name: 'todos',
  defaults: {
    dataset: []
  }
})
export class TodosState {
    constructor(){
    	// 可以透過 constrcutor 將 service 注入進來
  	}
    
    @Action(ADDTODO)
 	addTodo({ getState, setState }: StateContext<TodosStateModel>, { payload }: ADDTODO) {
        const state = getState();
        setState({
          ...state,
          dataset: [...state.dataset, payload]
        });
  	}
}
```

* `@Action` 內傳的 Class ，是用來定義此 Action 的名稱，在 store dispatch 時，就是根據 class 來決定所要執行的動作

* `addTodo(StateContenxt<T>, ActionClass? )`

  * 第一個參數是取得可操作目前 state 的 context 物件，內有的方法有
    * `getState():T` 取得目前 state 的值
    * `setState(val:T):any` 重設目前 state 的值(重新建立一個新的state)
    * `patchState(valu: Partial<T>)` 更新目前 state 的值
    * `dispatch(actions)` 觸發 action
  * 第二個參數是取得 Action 對應的 Class 實體，NGXS 是透過這樣子的方式傳遞資料的

* 由於 `State` 本身是活在 Angular 的 DI 機制下，所以也可以在 `constructor` 的注入其他 service，所以當要呼叫 api 時，也可以直接寫在 action function 就可以了，不需要額外在建立檔案

  ```typescript
  constructor(private service: ApiService) {}

    @Action(ADDTODO)
    addTodo({ getState, setState }: StateContext<TodosStateModel>, { payload }: ADDTODO) {
      return this.service.someApiCall().pipe(
        tap(() => {
          const state = getState();
          setState({
            ...state,
            dataset: [...state.dataset, payload]
          });
        })
      );
    }
  ```

  # 使用 Store

  當 State class 寫完後，接下來就可以在各個地方透過 store 的方式做執行 action 及取得資料的行為了

  ```typescript
  import { Component } from '@angular/core';
  import { Store, Select } from '@ngxs/store';
  import { Observable } from 'rxjs/observable';
  import { TodoItem } from './todos.state';

  @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
  export class AppComponent {
    title = 'app';
    @Select('todos.dataset') todos: Observable<TodoItem[]>;

    constructor(private store: Store) {}
  }

  ```

  * `@Select` 該 decorator 允許我們透過 path 的設定取到特定的 state 資料，而取得的資料型態為 Observable

    * 如果不想要這樣子寫，可以透過 store.select 的方式做設定，結果是一樣的

      ```typescript
      export class AppComponent {  
        todos: Observable<TodoItem[]>;

        constructor(private store: Store) {
          this.todos = store.select(state => state.todos.dataset);
        }
      }
      ```

  * 執行 action 的動作，一樣是透過 `store.dispatch` 來執行，可以傳入一個或是多個(用陣列傳) actions，而 `dispatch` 是一個 observable，並會回傳 action 後的 state 狀況，這表示我們可以用 RxJS 的方式最很多變化

    ```html
    <ul>
      <li *ngFor="let item of todos | async">
        {{ item.content }}
      </li>
    </ul>
    <input type="text" #f />
    <button (click)="addTodo(f)">Add Todo</button>

    ```

    `app.component.ts` 

    ```typescript
      addTodo(input) {
        this.store.dispatch(new ADDTODO(input.value)).subscribe(state => {
          console.log(state);
          input.value = '';
        });
      }
    ```

    ![](https://i.imgur.com/mbH2lYr.png)



# Recap

NGXS 是以 Angular 的角度重新思考 Redux 風格的 state management，個人是覺得這樣的模式大幅降低學習及編寫的門檻，而 NGXS 內還有更多的功能都有在電子書上說到，有興趣的人真的可以動手玩看看，寫起來跟寫  Angular service 真的沒什麼差異。

# 延伸閱讀

* [NGXS GitBook](https://ngxs.gitbooks.io/ngxs/)
* [範例程式](https://stackblitz.com/edit/ngxs-simple-demo?file=app%2Fapp.component.ts)

