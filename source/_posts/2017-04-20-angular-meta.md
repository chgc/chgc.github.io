---
layout: post
title: '[Angular] Meta 與 Route'
comments: true
date: 2017-04-20 16:24:14
categories: Angular
tags: Angular
---

Angular 4 版內建了 Meta 的服務，雖然目前還是標示 EXPERIMENTAL (表示未來有可能會有 break change)，但還是先來玩看看，希望能和路由設定檔綁在一起。

<!-- more -->

# 路由設定

我們知道 Route 的設定檔裡面可以設定 data 或是透過 resolve 來預先處理非同步的資料取得行為 ( 例如 call API)，可參閱[這篇文章](http://blog.kevinyang.net/2016/12/11/ng2-router-resolve/)

假設，我們的路由設定檔，長這樣

```typescript
{
    path: '',
    component: HomeComponent,
    data: {
      meta: [
        {name: 'twitter:title', content: 'Good Morning Harwood'},
        {property: 'og:title', content: 'Good Morning Harwood'}
      ]
    }
  },
  {
    path: 'about',
    component: AboutComponent,
    data: {
      meta: [
        {name: 'twitter:title', content: 'About Us'},
        {property: 'og:title', content: 'About Us'}
      ]
    }
  }
```

以上的設定，就可以透過 `Router` 和 `ActivatedRoute`的方式取得 data 下 meta 的資訊。而這些資訊就是要設定到 `<head></head>` 間的訊息

# Meta

```typescript

class Meta {
  constructor(_doc: any)
  addTag(tag: MetaDefinition, forceCreation?: boolean) : HTMLMetaElement
  addTags(tags: MetaDefinition[], forceCreation?: boolean) : HTMLMetaElement[]
  getTag(attrSelector: string) : HTMLMetaElement
  getTags(attrSelector: string) : HTMLMetaElement[]
  updateTag(tag: MetaDefinition, selector?: string) : HTMLMetaElement
  removeTag(attrSelector: string) : void
  removeTagElement(meta: HTMLMetaElement) : void
}
```

雖然有這麼多功能，比較需要提的是 `updateTag` 這一個包含新增的功能，他會判斷如果你想要更新的MetaDefiniton 不存在時，就會幫你建立一個。



# 實作範例

路由設定檔關於 meta 資料這邊就先略過，可以參照上面的路由設定範例，這段範例的主要目的，要讓  Angular 可以自動更新 Meta 資訊，我先把程式貼出來，在一行行的解釋

```typescript
constructor(
      private metaService: Meta, 
      private router: Router,
      private activatedRoute: ActivatedRoute) {
    this.router.events.filter(event => (event instanceof NavigationEnd))
        .switchMap(() => {
          const snapshot = this.activatedRoute.snapshot;
          let child = snapshot.firstChild;
          while (child.firstChild !== null) {
            child = child.firstChild;
          }
          return Observable.from(child.data.meta);
        })
        .do((meta: any) => this.metaService.updateTag(meta))
        .subscribe();
  };
```

這段程式碼我是放在 `app.module.ts`的地方，因為那邊只會被執行一次，所以放在那邊是最合適的。

```typescript
this.router.events.filter(event => (event instanceof NavigationEnd))
```

這我之前有寫過，就參讀[這篇文章](http://blog.kevinyang.net/2017/01/22/angular2-router-event/) 吧



```typescript
.switchMap(() => {
  const snapshot = this.activatedRoute.snapshot;
  let child = snapshot.firstChild;
  while (child.firstChild !== null) {
    child = child.firstChild;
  }
  return Observable.from(child.data.meta);
})
```

為什麼要取snapShot，因為 snapShot 是當時的值，透過這種方式取得的資料就不是 Observable 型別了。透過 while 的方式取得 data 區段的資料。然後將 meta 的陣列轉換成 stream 的模式



```typescript
.do((meta: any) => this.metaService.updateTag(meta))
```

依前一個 Operator 傳回的結果，一個一個的更新 meta 資訊

```typescript
.subscribe();
```

執行上面的工作。

# 執行結果

{%  youtube  IJw4KLpozQA %}

