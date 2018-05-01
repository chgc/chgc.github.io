---
layout: post
title: '[Angular] 與 Firebase 共舞'
comments: true
date: 2018-04-30 21:38:54
categories: Angular
tags: Angular
---

Firebase 存在於這世上已經有幾年的時間了，後來有併入到 Google 的旗下。而這一年來 Firebase 的功能與服務，不論是威力或是廣度都遠比剛出道時，來的強大許多。

這一次透過寫一個 side project 來重新探索 Firebase 的威力

<!-- more -->

# 環境準備

※ 這裡預先假設你已經有一個 Angular 的專案，如果沒有的話，可以透過 Angular CLI 產生

※ 於 Firebase 的後臺管理建立一個新的專案

Angular 有一個套件 `Angularfire2` ，將 Firebase 會用到的功能包起來，能讓我們簡單的使用. 安裝使用方式如下

1. 安裝 [Angularfire2](https://github.com/angular/angularfire2)

   ```
   npm install firebase angularfire2 --save
   ```

2. 取得 Firebase 專案的設定檔

   ![](https://i.imgur.com/wVEtABl.png)

   ![](https://i.imgur.com/7QzHpJc.png)

   ![](https://i.imgur.com/X32u83T.png)

   複製紅色框起來的設定檔的部分

3. 將 `AngularFireModule` 加到 `app.module.ts` 裡

   ```typescript
   export const config = {
       apiKey: "...",
       authDomain: "...",
       databaseURL: "...",
       projectId: "...",
       storageBucket: "...",
       messagingSenderId: "..."
     };

   @NgModule({
     ...
     imports: [
       BrowserModule,    
       AngularFireModule.initializeApp(config),    
     ],  
     bootstrap: [AppComponent]
   })
   export class AppModule {}
   ```

   * 也可以將 `config` 的部分放到 `environement` 檔案內做管理

4. 完成基本設定



# Firebase 常用功能

Firebase 除了提供 Realtime 資料庫外，也多了 `Authentication` 、`Cloud Firestore`、`Hosting`、`Stroage` 與 `Functions` 的服務，這裡就先介紹  `Authentication` 、`Cloud Firestore`、`Hosting` 與 `Functions`

在開始之前，要先安裝 [firebase-tools](https://github.com/firebase/firebase-tools)，這工具可以協助我們開發及部屬 Firebase 的功能

## 安裝 Firebase Tools

1. 安裝 Firebase-tools (如果之前有裝過，這個步驟可以跳過)

   ```
   npm install -g firebase-tools
   ```

2. 到 Angular 專案下，執行 `firebase init` 進行第一次環境初始化設定，跟著畫面上的步驟依序執行，完成後就會產生一個 `.firebase.json` 與 `.firebaserc` 的檔案，分別記載相關的環境參數供後續的部屬使用

## Authentication

使用者登入授權是一件很麻煩的事情，尤其是要使用各種方式登入，例如使用 Google、GitHub、Facebook 等帳號登入，光是串聯這一些就會有想放棄的念頭，好加在 Firebase 的 authentication 幫我們處理這一塊的事情，我們只需要將環境參數設定完，就可以直接使用

![](https://i.imgur.com/e1rwBHb.png)

於 Authentication 的區塊有四個選項

1. 使用者：目前有登入註冊到 Firebase 專案下的使用者有哪些

2. 登入方式：設定要連接的授權服務

   ![](https://i.imgur.com/eyCv6Xs.png)

   * 設定要使用的登入授權方式

   ![](https://i.imgur.com/om58TH0.png)

   * 紀錄允許使用 Authentication 的網域名稱

3. 範本：寄信通知的內容範本

   ![](https://i.imgur.com/LBXp8Nx.png)

4. 用量：統計`電話驗證實例` 的使用量

   ![](https://i.imgur.com/JGSzPa3.png)

所以後台的畫面就這些，而要如何開啟個服務的登入授權呢，基本上裡面的設定步驟都寫得很詳細，跟著做就不會錯



回到 Angular 程式內，我們要怎麼寫才能使用這些服務呢? 基本寫法如下

1. 注入 `AngularFireAuthModule` 到 `AppModule` 內

2. 建立一個 service 或是直接在 component 寫都可以

   ```typescript
   import { Injectable } from '@angular/core';
   import { AngularFireAuth, AngularFireAuthProvider } from 'angularfire2/auth';
   import * as firebase from 'firebase/app';
   import { User } from '@firebase/auth-types';
   import { Router } from '@angular/router';

   @Injectable()
   export class AuthService {
     authState = this.afAuth.authState;
     constructor(public afAuth: AngularFireAuth, private router: Router) {}

     // 使用匿名登入
     signInAnonymously() {
       return this.afAuth.auth.signInAnonymously()
           .then(this.redirectToPopup());
     }
      
     // 使用 Google 登入
     signInWithGoogle() {
       return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
           .then(this.redirectToPopup());
     }

     // 使用 GitHub 登入
     signInWithGithub() {
       return this.afAuth.auth.signInWithPopup(new firebase.auth.GithubAuthProvider())
           .then(this.redirectToPopup());
     }

     // 登出
     signOut() {
       this.afAuth.auth.signOut();
     }
       
     private redirectToPopup() {
       return () => this.router.navigate(['/popup']);
     }
   }

   ```

   * 基本上各服務商的登入寫法都差不多，詳細的設定可以參考[這裡](https://firebase.google.com/docs/reference/js/firebase.auth.Auth)

3. 那要怎麼判斷使用者有沒有登入呢?

   ```typescript
   this.authService.authState.subscribe(user => {
       // user 登入資訊物件      
   });
   ```

   如果使用者有登入的話，`user` 就會包含相關的登入資訊，如果沒有就會收到 `null` 值

以上就是基本的 Authentication 的用法



## Database

Firebase 有兩種資料庫類型，但皆屬於 NoSQL 類型的資料庫，可是兩者的應用情境是不相同的

1. Realtime Database：為所有連結的用戶端即時存儲及同步處理資料
2. Cloud Firestore：新一代即時資料庫擁有更強大的查詢撼動調整資源配置功能

兩者的比較表可參考[說明文件](https://firebase.google.com/docs/firestore/rtdb-vs-firestore?authuser=0)

這裡只會介紹 `Firestore` 資料庫

### Firestore

Firestore 主要分為兩種類型的資料，`document` 與 `collection`，顧名思義 `document` 就是單一筆紀錄，而 `collection` 是包含許多 `documents`

`collection` 對於每一個 `document` 都會有一個 id 的鍵值，用來讀取之用，這一個 ID 可以是自己建立，或是由 firebase 產生給你，須為唯一值

`document` 除了 `field` 外，裡面還可以建立 `collection` ，每一個 document 的檔案大小是有限制的，請參閱[說明文件](https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields)

欄位型別有這些

![](https://i.imgur.com/ekzCNiv.png)

資料預設的排序順序為

1. Null values
2. Boolean values
3. Integer and floating-point values, sorted in numerical order
4. Date values
5. Text string values
6. Byte values
7. Cloud Firestore references
8. Geographical point values
9. Array values
10. Map values

關於資料庫的設計規劃方式，可能要留在以後的文章做討論了

### Angular 程式

Angular 內要如何操作 collection 和 document 呢? 首先要先 import `AngularFirestoreModule` 到 `AppModule` 裡

#### 基本操作

1. Collection 

* 基本撈資料的方式

```typescript
import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

export interface Item { name: string; }

@Component({
  selector: 'app-root',
  template: `
    <ul>
      <li *ngFor="let item of items | async">
        {{ item.name }}
      </li>
    </ul>
  `
})
export class AppComponent {
  private itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;
  constructor(private afs: AngularFirestore) {
    this.itemsCollection = afs.collection<Item>('items');
    this.items = this.itemsCollection.valueChanges();
  }
  addItem(item: Item) {
    this.itemsCollection.add(item);
  }
}
```

* 新增 document 至  collection 中

  ```typescript
   addItem(item: Item) {
      this.itemsCollection.add(item);
   }
  ```
  	* 如果要更新 document 裡面的某一筆紀錄時，則需要針對 document 做操作，這部分會在下面做說明

2. Document 的操作

* 讀取特定的 document

  ```typescript
  @Component({
    selector: 'app-root',
    template: `
      <div>
        {{ (item | async)?.name }}
      </div>
    `
  })
  export class AppComponent {
    private itemDoc: AngularFirestoreDocument<Item>;
    item: Observable<Item>;
    constructor(private afs: AngularFirestore) {
      this.itemDoc = afs.doc<Item>('items/1');
      this.item = this.itemDoc.valueChanges();
    }
  }

  ```

* 新增

  ```typescript
  create(item: Item){
  	this.itemDoc = afs.doc<Item>('items/1').set(item)
  }
  ```

* 修改

  ```typescript
  update(item: Item) {
      this.itemDoc.update(item);
    }
  ```

* 刪除

  ```typescript
  delete(item: Item) {
      this.itemDoc.delete();
  }
  ```

* 新增或修改

  ```typescript
  createOrUpdate(item: Item){
  	this.itemDoc = afs.doc<Item>('items/1').set(item,{ merge: true})
  }
  ```



`valueChanges` V.S. `snapshotChanges`

一般正常使用時，使用 `valueChanges` 已經足夠了，但如果我們需要獲取到更多資訊，例如 document 的 ID 時，這時候就得透過 `snapshotChanges` 才可以取得，以下示範如何取得 document ID

```typescript
import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

export interface Shirt { name: string; price: number; }
export interface ShirtId extends Shirt { id: string; }

@Component({
  selector: 'app-root',
  template: `
    <ul>
      <li *ngFor="let shirt of shirts | async">
        {{ shirt.name }} is {{ shirt.price }}
      </li>
    </ul>
  `
})
export class AppComponent {
  private shirtCollection: AngularFirestoreCollection<Shirt>;
  shirts: Observable<ShirtId[]>;
  constructor(private readonly afs: AngularFirestore) {
    this.shirtCollection = afs.collection<Shirt>('shirts');
    
    this.shirts = this.shirtCollection.snapshotChanges()
        .pipe(map((actions:DocumentSnapshot[]) => {
      		return actions.map(a => {
                const data = a.payload.doc.data() as Shirt;
                const id = a.payload.doc.id;
                return { id, ...data };
              });        
    		})
       );
  }
}
```

回傳型別介面

* valueChanges：回傳所定義的 document 型別

* snapshotChanges

  ```typescript
  interface DocumentSnapshot {
    exists: boolean;
    ref: DocumentReference;
    id: string;
    metadata: SnapshotMetadata;
    data(): DocumentData;
    get(fieldPath: string): any;
  }
  ```

* stateChanges、auditTrail

  ```typescript
  interface DocumentChangeAction {
    //'added' | 'modified' | 'removed';
    type: DocumentChangeType;
    payload: DocumentChange;
  }

  interface DocumentChange {
    type: DocumentChangeType;
    doc: DocumentSnapshot;
    oldIndex: number;
    newIndex: number;
  }
  ```

更多的資訊可參閱此[文件](https://github.com/angular/angularfire2/blob/master/docs/firestore/collections.md)

#### 進階查詢

在查詢資料時，當然可以使用 Firebase 所提供的查詢方式，配合使用。當然操作並不能像 SQL 一樣的有彈性，所以在規劃如何存放資料時，同時也要思考要如才能查詢到自己想要的資料

```typescript
afs.collection('items', ref => ref.where('size', '==', 'large'))
```

查詢的條件就放在 collection 的第二個參數的地方。

如果要組合多種的查詢條件時，可以這樣子寫

```typescript
afs.collection('items', ref => ref.where('size', '==', 'large')
              					 .where('color', '==', 'red'))
```

但還是有很多限制，詳細的說明，可參閱[官網文件](https://firebase.google.com/docs/firestore/query-data/queries)，務必要詳讀，官網文件內提出很多不能使用得查詢組合

以下是可使用的查詢方法

| method       | purpose                                                      |
| ------------ | ------------------------------------------------------------ |
| `where`      | Create a new query. *Can be chained to form complex queries.* |
| `orderBy`    | Sort by the specified field, in descending or ascending order. |
| `limit`      | Sets the maximum number of items to return.                  |
| `startAt`    | Results start at the provided document (inclusive).          |
| `startAfter` | Results start after the provided document (exclusive).       |
| `endAt`      | Results end at the provided document (inclusive).            |
| `endBefore`  | Results end before the provided document (exclusive).        |

## Hosting

透過 firebase tools 建立專案環境時，就會填入一些相關的資訊，例如，要上傳的網站檔案的資料夾位置，是否為 SPA 網站等資訊，當這些都設定完成後，可以透過一行指令即可完成網站部屬動作

```
firebase deploy --only hosting
```

管理後台也會有相關的部屬/用量紀錄，當然也可以綁定自己的網域名稱

![](https://i.imgur.com/tT7HsTY.png)

## Functions 

什麼是 Functions ? Firebase 的 Functions 可以針對 Firebase 服務行為而被觸發的小程序，例如我希望當 Cloud Firestore 有新增資料時，幫我將某些資料整理到另外一個 collection 裡面，這時候，就可以透過 `functions` 來幫忙處理，這裡就簡單地提供個範例做參考

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

exports.autoLikes = functions.firestore
  .document('videoDetails/{videoId}/shareBy/{shareId}')
  .onCreate((snapshot, context) => {
    const videoId = context.params.videoId;
    const videoRef = admin
      .firestore()
      .collection('videos')
      .doc(videoId);

    return videoRef
      .get()
      .then(doc => {
        const likes = doc.get('likes') || 0;
        const data = {
          likes: likes + 1
        };
        return videoRef.update(data);
      })
      .catch(err => console.log(err));
  });

```

程式碼說明

* exports.<<function name>> 這個會顯示在後台的 functions 列表中

  ![](https://i.imgur.com/9oKSj7B.png)

* `functions.firestore.document('videoDetails/{videoId}/shareBy/{shareId}').onCreate`：當某一個 document 或是 collection 發生 `create`, `update`, `delete`, and `write` 事件時 (這裡可以指定觸發事件)

* 取得網址變數

  ```typescript
  可透過 { params } 的方式設定變數名稱
  const videoId = context.params.videoId;
  ```

  ​

* 在之後的程式碼就寫要執行的動作

* admin，可以不受權限控制存取 firebase 服務

  ```typescript
  import * as admin from 'firebase-admin';
  admin.initializeApp();

  ...
   admin.firestore()
        .collection('videos')
        .doc(videoId);

  ```

  ​

# Recap

Firebase 的功能很多也很強大，這裡沒有辦法全部都介紹到，例如權限的控制、檔案上傳的部分

如果想要快速建立出產品的試水溫，又不想要搞一堆後端的基礎建設，Firebase 是一個不錯的選擇



# 延伸閱讀

* [AngularFire2](https://github.com/angular/angularfire2)
* [Firebase Tools](https://github.com/firebase/firebase-tools)
* [Angular Firebase Youtube頻道](https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA)
* [Firebase 官方文件](https://firebase.google.com/docs/web/setup?authuser=0)
* [Collections, documents, and fields Limitation](https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields)
* [Perform Simple and Compound Queries in Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/queries)
* [Cloud Firestore Trigger Functions](https://firebase.google.com/docs/functions/firestore-events?authuser=0)
* [Firebase Functions](https://firebase.google.com/docs/functions)
