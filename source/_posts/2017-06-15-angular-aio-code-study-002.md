---
layout: post
title: '[Angular]angular.io官網程式碼學習筆記002'
comments: true
date: 2017-06-15 20:06:32
categories: Angular
tags: Angular
---

繼續[筆記001](http://blog.kevinyang.net/2017/06/15/angular-aio-code-study-001/)，繼續研究下去。這篇會研讀 `<aio-top-menu>` component

<!-- more -->

# aio-top-menu

component 所在路徑 `src/app/layout/top-menu`

```typescript
import { Component, Input } from '@angular/core';
import { NavigationNode } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-top-menu',
  template: `
    <ul role="navigation">
      <li *ngFor="let node of nodes"><a class="nav-link" [href]="node.url" [title]="node.title">{{ node.title }}</a></li>
    </ul>`
})
export class TopMenuComponent {
  @Input() nodes: NavigationNode[];

}
```

* 由 `app.component.ts` 提供要顯示的資料

```typescript
export interface NavigationNode {
  url?: string;
  title?: string;
  tooltip?: string;
  hidden?: string;
  children?: NavigationNode[];
}
```

# app.component.ts

提供 `<aio-top-menu>`的資料來源是  `navigationService.navigationViews` 

```typescript
this.navigationService.navigationViews.subscribe(views => {
      ...
      this.topMenuNodes = views['TopBar']  || [];
      ...      
});
```

在 `navigationService` 內的 `navigationView` 方法如下

```typescript
const navigationInfo = this.fetchNavigationInfo();
this.navigationViews = this.getNavigationViews(navigationInfo);
```

##  fetchNavigationInfo

```typescript
const navigationPath = CONTENT_URL_PREFIX + 'navigation.json';

private fetchNavigationInfo(): Observable<NavigationResponse> {
  const navigationInfo = this.http.get(navigationPath)
  .map(res => res.json() as NavigationResponse)
  .publishLast();
  navigationInfo.connect();
  return navigationInfo;
}
```

其實這段很有趣，以下是程式碼裡的註解，詳細說明為什麼他們要這樣子寫

> Get an observable that fetches the `NavigationResponse` from the server.
> We create an observable by calling `http.get` but then publish it to share the result
> among multiple subscribers, without triggering new requests.
> We use `publishLast` because once the http request is complete the request observable completes.
> If you use `publish` here then the completed request observable will cause the subscribed  observables to complete too.
> We `connect` to the published observable to trigger the request immediately.
> We could use `.refCount` here but then if the subscribers went from 1 -> 0 -> 1 then you would get another request to the server.
> We are not storing the subscription from connecting as we do not expect this service to be destroyed.

* `publishLast()` 只會記錄 Observable **完成後**的值。
* `connect()` 會立即執行 Obervable。

透過這兩個 Operator 的組合就可以避免重複發出 request，又可以保留最後的資料。

------

```typescript
export type NavigationResponse = {__versionInfo: VersionInfo } & { [name: string]: NavigationNode[]|VersionInfo };
```

這種 `type` 的定義方式為 TypeScript 的 `Intersection Types`，意思是指，指定到這種型別的，就必須同時符合第一種型別及第二種型別。

在這 function 內所取得的資料來源 (generated/navigation.json)，是符合這種格式的。



## getNavigationViews

繼上一段取完資料後的 Observable，接著會傳進這個 function，這 function 的功能是將關於 View 的部分抽離出來

```typescript
private getNavigationViews(navigationInfo: Observable<NavigationResponse>): Observable<NavigationViews> {
    const navigationViews = navigationInfo
      .map(response => {
        const views = Object.assign({}, response);
        Object.keys(views).forEach(key => {
          if (key[0] === '_') { delete views[key]; }
        });
        return views as NavigationViews;
      })
      .publishLast();
    navigationViews.connect();
    return navigationViews;
}
```

* `Object.assign({}, response)`  將原有的資料複製成一份全新的
* `map` 裡的行為是將 __versionInfo 的部分從既有的資料中刪除
* 使用 `publishLast()` 跟 `connect()` 的理由同上一段
* 回傳的結果，就只會剩下 `NavigationViews` 而已

```typescript
export interface NavigationViews {
  [name: string]: NavigationNode[];
}
```

------

接著回到 `app.component.ts` ，在 subscribe 之後就可以取得 `NavigationViews` 了

```typescript
this.navigationService.navigationViews.subscribe(views => {
      ...
      this.topMenuNodes = views['TopBar']  || [];
      ...      
});
```

所以 `topmenuNodes` 就透過 KeyValue 的形式從 NavigationViews 中取出並讓 `<aio-top-menu>` 做顯示的動作



# 參考資料

* [rx-subject](http://blog.kevinyang.net/2016/10/06/rx-subject/#behaviorsubject-replaysubject-asyncsubject-與-publish-的關係)