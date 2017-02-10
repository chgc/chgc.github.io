---
layout: post
title: '[Angular] Preloading策略'
comments: true
date: 2017-01-21 10:21:13
categories: Angular
tags: Angular
---

Angular有提供`loadChildren`的Lazy loading的模式，也有提供`preloadingStrategy`的策略模式可供設定，每種設定的方式會影響`loadChildren`的行為，當然也可以自訂preloading的規則

<!-- more -->

# 使用前提

1. 使用ngModule來分類封裝程式
2. 使用router的loadChildren的方法

# Router loadChildren的預設行為 

預設lazy loading的行為是直到該頁面有被執行時，才會將該部分的js檔案從伺服器端下載到本機，這樣的方法，大大的降低第一次讀取頁面時，所下載的js檔案大小，但是這也帶出另外一個問題，假設我所指定的lazy loading的module是一個很大的module, 那我們原本想要避免的問題，仍存在著。

基於上述理由，Angular提供PreloadingStrategy的設定，讓我們來決定loadChildren的行為，可以設定的方式如下

1. `NoPreloading` <預設值>
2. ` PreloadAllModules `
3. 自訂PreloadingStrategy

# PreloadAllModules

如同在觀看Youtube影片時，Youtube在我們觀看的時候，仍會在背景持續的下載該影片後續的內容到我們的電腦上(那條灰色的進度條)，這樣子的模式，讓我們在觀看影片時，不會有任何lag的情形發生

而`PreloadAllModules`也是提供一樣的效果，Angular在第一個頁面顯示後，才會陸續的將其他lazyLoading的module下載到本機上，這樣子的話，當使用者瀏覽到該地方時，就不需要再等待下載的時間了，使用者也就不會感受到停頓的感覺。

```typescript
@NgModule({
  imports: [
    RouterModule.forRoot(routes,
    { preloadingStrategy: PreloadAllModules })
  ],
  ...
})
export class AppRoutingModule { }
```



# 自訂PreloadingStrategy

那如果我想要的效果是，有些事先載入，有些不要的時候，這時我們也可以自訂PreloadingStategy

```typescript
@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preloadedModules: string[] = [];

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data && route.data['preload']) {
      return load();
    } else {
      return Observable.of(null);
    }
  }
}
```

上述的規則是，如果路由設定的data有指定preload，而且該值為真實，則會執行預先載入，反之，則不會。

```typescript
@NgModule({
  imports: [
    RouterModule.forRoot(routes,
    { preloadingStrategy: SelectivePreloadingStrategy })
  ],
  providers: [
    SelectivePreloadingStrategy
  ]
  ...
})
export class AppRoutingModule { }
```

# 結論

如果想要提升效能跟使用者體驗的話，善用`NgModule` 、`Lazy Loading`與`preloadingStrategy`就可以達到非常好的效果

# 參考資料

* [ROUTING & NAVIGATION](https://angular.io/docs/ts/latest/guide/router.html)