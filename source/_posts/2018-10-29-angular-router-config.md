---
layout: post
title: '[Angular] RouterModule Options 篇'
comments: true
date: 2018-10-29 14:42:06
categories: Angular
tags: Angular
---

Angular 的路由功能很強大，內建也提供很多路由上會用到的功能，但是你知道 `RouterModule` 有哪些選項可以設定嗎?

<!-- more -->

# RouterModule 選項

## enableTracing

`enabledTracing` 可以開啟路由變更時的所有事件，並 console.log 出來，設定方式是

`enabledTracking: true`

## useHash

有時候主機環境不允許我們設定 rewrite URL 規則時，就必須使用 hash 的方式來呈現網址的變化，設定方式是

`useHash: true`

## initialNavigation

設定初始路由瀏覽是否要開啟，設定方式

```
initialNavigation:  true | false | 'enabled' | 'disabled' | 'legacy_enabled' | 'legacy_disabled';
```

*  `true`、`false` 、`legacy_enabled` 、`legacy_disabled` 在 Angular v4 時就被標示為 `deprecated`
* `enabled`: 在 root component 建立前，會先開始初始瀏覽事件，在初始瀏覽事件未完成前，整個啟動流程會被 block 住
* `disabled`: initial navigation 不會被執行，但是監聽 location 會在 root component 建立前設定好

## errorHandler

可以指定路由發生錯誤時，應該要如何處理的，設定自己的錯誤處理程序

`errorHandler: ErrorHandler`

```typescript
function treatCertainErrorsAsCancelations(error) { 
    if (error isntanceof CancelException) {
		return false; //cancelation 
    } else {
		throw error; 
    }
}

@NgModule({
  imports: [RouterModule.forRoot(ROUTES, {
      errorHandler: treatCertainErrorsAsCancelations
  })]
})
class MailModule {}
```

## preloadingStrategy

設定 preloading 策略，針對延遲載入模組的相關處理動做，詳細細節可以參閱 [PreloadingStrategy](https://angular.io/api/router/PreloadingStrategy)

## onSameUrlNavigation

當瀏覽到相同網址時的處理行為，設定方式

`onSameUrlNavigation: 'reload' | 'ignore'`

預設的行為是當遇到相同網址時，並不會重新觸發重整動作，當有需要重整動作時，可以設定為 `reload`

```typescript
export class Page2Component implements OnInit, OnDestroy {

  constructor(private router: Router) {    
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log(event);
        // when onSameUrlNavigation: 'reload'，會重新觸發 router event
      }
    });
  }

  ngOnInit() {
    console.log('page2 init')
  }

  ngOnDestroy() {
    console.log('page2 destroy')
  }
}
```

* 這部分需要留意的是，只有 router 事件會被重新執行一次，而非整個 Component 被 destroy 掉在重新建立

## scrollPositionRestoration

` scrollPositionRestoration?: 'disabled'|'enabled'|'top';`

當開啟時，在操作瀏覽器上下頁時，會保留之前瀏覽畫面的位置

## anchorScrolling

`anchorScrolling: 'disabled': 'enabled'`

目前預設值為 `disabled`，當開啟時，會有 anchor 的效果

```html
<li><a routerLink="/page2" [fragment]="'a'">Page 2 with anchor A</a></li>
```

這樣的連結會跳到 page2 頁 `id='2'` 的地方

## scrollOffset

設定 scroll offset 的值，可以給予數字，或是 function

```typescript
scrollOffset?: [number, number]|(() => [number, number]);
```

* [number, number] => [left, top]

這背後其實是去執行 [ViewportScroller](https://angular.io/api/common/ViewportScroller) 的 `setOffset` 的方法，當進行 `scrollToElement` 時，會將設定的 offset 值帶入進算

```typescript
  private scrollToElement(el: any): void {
    const rect = el.getBoundingClientRect();
    const left = rect.left + this.window.pageXOffset;
    const top = rect.top + this.window.pageYOffset;
    const offset = this.offset();
    this.window.scrollTo(left - offset[0], top - offset[1]);
  }
```

## paramsInheritanceStrategy

`paramsInheritanceStrategy?: 'emptyOnly'|'always';`

設定路由 params 、data、resolve data 的合併方式

* `emptyOnly` 預設值，只會繼承沒有 path 或是 component 設定的路由

  ```typescript
  {
        path: 'page3/:id', children: [
          { path: 'b', component: Page3Component } // 取得到 id
        ]
      }
  ```

  ```typescript
  {
        path: 'page3/:id', 
        component: EmptyComponent,
        children: [
          { path: 'b', component: Page3Component } // 取不到 id
        ]
      },
  ```

* `always` 一律繼承

  ```typescript
  {
        path: 'page3/:id', 
        component: EmptyComponent,
        children: [
          { path: 'b', component: Page3Component } // 取得到 id
        ]
  },
  ```

## urlUpdateStrategy

何時更新瀏覽器 URL

`  urlUpdateStrategy?: 'deferred'|'eager';`

* deferred 預設值，當路由事件跑完後才會更新瀏覽器網址
* `eager` 在事前開始前更新瀏覽器網址

## malformedUriErrorHandler

當網址瀏覽發生錯誤時，可以自訂 redirect 網址

```typescript
 malformedUriErrorHandler:
      // redirects the user to `/invalid-uri`
      (error: URIError, urlSerializer: UrlSerializer, url: string) => urlSerializer.parse('/invalid-uri')
```

# 亮點設定

1. onSameUrlNavigation
2. scrollPositionRestoration
3. anchorScrolling
4. paramsInheritanceStrategy

這些選項設定是我認為在開發時，有可能會用的到的選項。

# 參考資料

* [範例程式碼](https://stackblitz.com/edit/angular-router-option)
* [Angular Source Code](https://github.com/angular/angular/blob/master/packages/router/src/router_module.ts)

* [What's new in Angular 6.1?](https://blog.ninja-squad.com/2018/07/26/what-is-new-angular-6.1/)