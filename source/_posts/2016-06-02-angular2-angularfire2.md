---
layout: post
title: "[Angular2]AngularFire2
comments: true
date: 2016-06-02 15:44:30
categories: Angular
tags: Angular2
---

Angular2也有一個給Firebase使用的Library, 必計是自家的服務，有相對的AngularFire也是正常的，

目前AngularFire2只支援Firebase SDK V2版本，V3版本還在路上。所以在firebase所建立的專案必須要由舊介面建立後再轉至新Console介面，才可以使用。

<!-- more -->

# 前置

Demo的專案都是以Angular CLI所產生出來的架構

# 安裝

[安裝文件](https://github.com/angular/angularfire2/blob/master/docs/1-install-and-setup.md)

## 修正項目

開啟 `angular-cli-build.js` 檔案，這修正是為了build for production時會產生的錯誤

```javascript
 'angularfire2/**/*.js',
  修改成
 'angularfire2/**/*.+(js|js.map)',
```



# 使用方式
##一些程式碼
### main.js

```typescript
bootstrap(KeepthingsAppComponent,
  [
    FIREBASE_PROVIDERS,
    defaultFirebase('https://<project-name>.firebaseio.com'),    
  ]);
```

### App.Component.js

```typescript
import { AngularFire, FirebaseListObservable } from 'angularfire2';
```

```typescript
class AppComponent{
   items: FirebaseListObservable<any[]>;
   constructor(af: AngularFire) {
       this.items = af.database.list('/items');
   }
} 

```

AngularFire所取回的list是Observable的物件，所以也可以套用RxJS的Operator. 基本上Firebase的運作方式是沒有改變的

## API

| Method            |                                          |
| ----------------- | ---------------------------------------- |
| push(value:any)   | Creates a new record on the list, using the Realtime Database's push-ids. |
| update(key,value) |                                          |
| remove(key)       | Deletes the item by key. If no parameter is provided, the entire list will be deleted. |

上述的三種Method都會回傳Promise, 所以後續的接法為 then((data)=>{...}).catch((err)=>{...})

## Authentication
FireBase提供多種使用者認證的方式，從基本的Email/password, 到各個大型的OAuth
![https://farm8.staticflickr.com/7500/27341215391_a7899fa7ea_o.png](https://farm8.staticflickr.com/7500/27341215391_a7899fa7ea_o.png)

在程式裡面也可以同時間存在多種登入的方式，只要配合後台的設定

```typescript
// Anonymous
af.auth.login({
  provider: AuthProviders.Anonymous,
  method: AuthMethods.Anonymous,
})

// Email and password
af.auth.login({
  provider: AuthProviders.Password,
  method: AuthMethods.Password,
})

// Social provider redirect
af.auth.login({
  provider: AuthProviders.Twitter,
  method: AuthMethods.Redirect,
})

// Social provider popup
af.auth.login({
  provider: AuthProviders.Github,
  method: AuthMethods.Popup,
})
```

### 注意

在測試Facebook的Login功能時，一直將新後台所提供的Redirect Url設定到 Facebook裡，但是一直都不能正常的運作，最後才想到，新後台所提供的網址是給SDK V3所使用的，所以我必須要去找SDK V2的版本，更新成V2版本的Url就可以正常的使用了。



# 結語

AngularFire2在使用上非常的直覺，彈性也很大。先不論Firebase這個強大的後端服務，就前端可以搭配RxJS的操作，就讓人覺得很快樂。



# 參考文件

- [Angularfire2](https://github.com/angular/angularfire2)
- [Firebase](https://www.firebase.com/)
- [RxJS](http://reactivex.io/rxjs/)