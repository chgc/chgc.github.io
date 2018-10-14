---
layout: post
title: '[Angular] Akita 第一次接觸'
comments: true
date: 2018-10-14 22:10:54
categories: Angular
tags: Angular
---

沒錯，又是另外一套 Angular 狀態管理的工具，這一套 Akita 根據介紹，是融合 Flux + Redux + RxJS 以 OOP 的方式呈現。有別於其他 Redux 風格的狀態管理，是以 FP 的方式完成，就來嘗鮮看看，多一種選擇也不錯

<!-- more -->

# 介紹

什麼是 Akita，Akita 是結合多家的精神，以物件導向的方格完成的狀態管理工具，減少產稱不必要的程式碼，讓習慣物件導向開發模式的人，也可以享受 Flux 風格的狀態管理方式

![](https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LDIcOEJiLYk8yWho34E%2F-LEFMbbD5BNkHxecdUde%2F-LEFMe1nMjDF-0kBdGY5%2Fakita-arc.jpg?alt=media&token=4f72cec7-063d-46f2-b231-48d475235744)

# 安裝 Akita

```
yarn add @datorama/akita

或是

npm install @datorama/akita
```



# 基本元素

(以下範例皆來自官方文件)

## Model

Model 是用來描述 Store 內資料存放的結構。

```typescript
import { ID } from '@datorama/akita';

export type Session = {
  id: ID;
  firstName: string;
  lastName: string;
  token: string;
};

export function createSession({
  id = null, firstName = '', lastName = '', token = ''
}: Partial<Session>) {
  return {
    id,
    firstName,
    lastName,
    token
  };
};
```

官方建議新增 `type` 和 `factory function` ，讓其負責 store 初始值的建立

## Store

`Store` 是一個用來記載狀態的一個物件，建立一個 `store` 物件繼承 `Akita Sotre` 並傳入型別(Model) 被給予初始值

```typescript
import { Store, StoreConfig } from '@datorama/akita';
import { Session } from './session.model';

export interface SessionState {
   token: string;
}

export function createInitialState(): SessionState {
  return {
    token: ''
  };
}

@StoreConfig({ name: 'session' }) // 在 store 要存放的名字
export class SessionStore extends Store<SessionState> {
  constructor() {
    super(createInitialState());
  }
}
```

當建立 `store` 後，當在 `service` 使用時，可以透過 `setState` 的方式來更新 store 內的狀態

```typescript
setState(newStateFn: (state: Readonly<S>) => S)
```

使用範例:

```typescript
import { SessionStore } from './session.store';
import { SessionDataService } from './session-data.service';

export class SessionService {

	constructor(private sessionStore: SessionStore, 
              private sessionDataService: SessionDataService) {}

	login(creds) {
    	this.sessionDataService.login(creds).subscribe(user => {
      	this.sessionStore.setState(state => {
	        return {
    	       ...state,
        	   ...createSession(user)
        	}
      	});
    	});
  	}
}
```

`setState` 的做法比較像是 redux 風格的 reducer，而 Akita 有提供另外一種方法可以快速地更新 Store 的值，

可透過 `update` 的方法來完成，`update(newState: Partial<S>)`

```typescript
import { SessionStore } from './session.store';
import { SessionDataService } from './session-data.service';

export class SessionService {

  constructor(private sessionStore: SessionStore, 
              private sessionDataService: SessionDataService) {}

  login(creds) {
    this.sessionDataService.login(creds).subscribe(user => {
      this.sessionStore.update(createSession(user));
    });
  }
}
```

`update` 也可以接受 callback 方法。(詳情請閱讀官方文件)

也有其他的方法可以使用

* `setLoading(isLoading: boolean)` : 設定 store 的讀取狀態
* `setError(error: any)` 設定 store 的錯誤狀態



## Service

Service 內的使用與一般在寫 Service 是一樣的，只是要將 store class 注入到 service 內使用

```typescript
import { SessionStore } from './session.store';
import { SessionDataService } from './session-data.service';

export class SessionService {

constructor(private sessionStore: SessionStore) {}

login(creds) {
    http.login(creds).subscribe(user => {
      this.sessionStore.update(createSession(user));
    });
  }
}
```



## Query

Akita 的 Query 的地位，等同於 `ngrx` 的 selector，是用來撈取 Store 使用，回傳的型別為 `Observable` 

```typescript
import { Query } from '@datorama/akita';

export class SessionQuery extends Query<Session> {
  isLoggedIn$ = this.select(session => !!session.token);
   
  constructor(protected store: SessionStore) {
    super(store);
  }
}
```

當繼承 `Query<T>` 時，會擁有 `select<R>(project?: (store: S) => R): Observable<R>` 的方法可以使用，雖然在 component 可透過 `select` 的方式讀取 `store` 的狀態，但一般建議是寫在 Query Class 內部，以方便重複使用

* `select()` 方法回傳的 Observable 是會執行 `distinctUntilChanged()` 的，這表示該 `select` 只會當有資料異動時才會被觸發

* `selectOnce()` 行為類似於 `select()` ，但只會被觸發一次

```typescript
this.query.selectOnce(state=> state.key);	
```

* `getSnapshot()` 回傳 store 的 *raw* value

  ```typescript
  this.query.getSnapshot();
  ```

* `selectLoading()` : 取得 store 的 loading 狀態
* `selectError()` 取得 store 的錯誤狀態



# 感想

雖然少了許多不必要的程式碼跟流程，但操作的複雜度似乎需要多花點時間研究，主要是 API 部分需要熟悉，這動作能不能自己刻，這當然是可以的，但透過學習其他的狀態管理工具並了解其背後的設計原理，也是有很大的幫助的。

單純就基本結構元素來看，Akita 所提供的 `store` 是比較關鍵的功能，其他的操作應該是大同小異。初步看來，真正的應用應該會是在 `Entity` 的地方，如何上用 `Entity` 來管理複雜的狀態會是需要思考的部分。

至於實際上怎麼使用，可以先參考[這篇文章](https://engineering.datorama.com/building-a-shopping-cart-in-angular-using-akita-c41f6a6f7255)，先抓個感覺

# 參考資料

* [官方文件](https://netbasal.gitbook.io/akita/)