---
layout: post
title: '[Angular] Router 的 resetConfig 方法'
comments: true
date: 2017-03-03 20:11:37
categories: Angular
tags: Angular
---

這次要介紹的是 Router 的 resetConfig 方法，這個方法可以讓我們動態的設定路由。以下就詳細的介紹一下

<!-- more -->

# resetConfig

> resetConfig(config: Routes) : void
>

Resets the configuration used for navigation and generating links.

```typescript
router.resetConfig([
 { path: 'team/:id', component: TeamCmp,
   children: [
       { path: 'simple', component: SimpleCmp },
       { path: 'user/:name', component: UserCmp }
 	]}
]);
```

我們可以透過這樣子的方式，重新設定路由的規則。

這裡有個地方要注意的是，如果所指定的 component 沒有在現有的路由規則中使用時，則需要再 `ngModule `的設定檔內的 `entryComponents` 設定，而這裡也跟要動態產生 component 的情況是一樣的。



# 進階使用法

那可不可以從 server 端下載路由的設定檔，答案是可以的，但是這裡需要留意的是，從 server 取下來的設定檔，裡面的 component 是文字型態，而路由設定檔的 component 是不能接受文字，只能接受 `componentType` 型態

所以要從 Angular 的應用程式裡面取得 componentType 的方式，可以參考以下的程式碼

```typescript
import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
...
class AppComponent implements OnInit {

  factories = [];
  constructor(private http: Http, 
              private router: Router, 
              private resolver: ComponentFactoryResolver) {
    // resolver['_factories'] 可取到 ngModule 裡 bootstrap, 
    // entryComponents 裡定義的 Component
    this.factories = Array.from(this.resolver['_factories'].values());
  }

  ngOnInit() {
	...    
    this.http.get('./routes.json').map(res => res.json())
      .subscribe(data => {
        ...
        this.router.resetConfig(this.processRoute(data));
      })
  }
  
  processRoute(routes: any[]) {
    let _finalRoutes = [];
    routes.forEach(r => {
      // 根據 componentType 的名稱取回對應的 componentType
      let factory: any = this.factories.find((x: any) =>{
        return x.componentType.name === r.component;
      });
      _finalRoutes.push({
        path: r.path,
        component: factory.componentType
      })
    })
    return _finalRoutes;
  }
}
```

以上的寫法，就可以完成從 server 端取得路由設定檔後並更新 Angular 應用程式的路由設定檔，希望這段程式碼對你們有幫助



# 參考資料

[API](https://angular.io/docs/ts/latest/api/router/index/Router-class.html#!#resetConfig-anchor)