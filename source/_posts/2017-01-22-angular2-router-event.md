---
layout: post
title: '[Angular] Router Event'
comments: true
date: 2017-01-22 00:03:47
categories: Angular
tags: Angular2
---

Router Event到底可以怎麼應用，來探討一下吧

<!-- more -->

# enableTracing

 RouterModule.forRoot 的第二個參數裡，可以透過 enableTracing: true，將路由事件的變化，顯示在console上

```typescript
RouterModule.forRoot(routes,{ enableTracing: true })
```

在console上的顯示結果

![](https://c1.staticflickr.com/1/613/32449847065_d060e8e4bf_o.png)

# Router

也可以從Router的Event內取得跟上面一樣的資訊

```typescript
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  ...
  constructor(private router: Router) {
    router.events.filter(event => event instanceof NavigationEnd)
    .pairwise().subscribe(event => {
      console.log(event);
    });
  }
}

```

router.events是屬於持續發生的事件，所以這個監控路由變化的時間點需寫在最上層的component裡，不然就沒有辦法取得旅遊的變化，或是有重複subscribe的情形發生

這裡的程式碼所使用了`filter`來過濾router event的，我只允許NavigationEnd Event通過，

`pairwise()`是讓Observable的資料，兩個兩個一組的輸出，輸出效果如下

```text
----1----2----3----4----5----6|
---------12---23---34---45---56|
```

而這一段的程式碼可以讓我們知道路由的變化，例如 知道是從那一個頁面切到目前的頁面。

# Navigation Event

每一次導覽的事件，到最後只會有三種狀態：成功，取消，失敗. 有兩種方式可以觀察

1. router.events 觀察者會有以下幾種事件類型產生

- `NavigationStart` when navigation stars.
- `NavigationEnd` when navigation succeeds.
- ` NavigationCancel` when navigation is canceled.
- ` NavigationError` when navigation fails.

另外一種是直接呼叫 router.navigate 或是 router.naigateByUrl，這兩種方法會回傳Promise

- resolve true = navigation succeeds
- resolve false = navigation gets canceled.
- reject = navigation fails

但這個並不是這此次的討論範圍內

# 應用篇

利用上述的特性，我們可以將其加以應用，以下有幾個範例可以參考

## Show Spinner

在頁面轉換間，顯示spinner

```typescript
function isStart(e: Event): boolean { 
  return e instanceof NavigationStart;
}

function isEnd(e: Event): boolean {
  return e instanceof NavigationEnd ||
         e instanceof NavigationCancel || 
         e instanceof NavigationError;
}
```

```typescript
router.events
.filter(e => isStart(e) || isEnd(e)) // Returns Observable<boolean>.
.map(e => isStart(e)) // Returns Observable<boolean>.
.distinctUntilChanged() 
subscribe(showSpinner => { 
  if (showSpinner) {
		spinner.show(); } 
  else {
        spinner.hide();
  }
});
```

## Custom Error Handler

自訂如果頁面導覽失敗時，可以自訂錯誤訊息

```typescript
function treatCertainErrorsAsCancelations(error) { if (error isntanceof CancelException) {
return false; //cancelation } else {
throw error; }
}
@NgModule({
  imports: [RouterModule.forRoot(ROUTES, {errorHandler: treatCertainErrorsAsCanc\
elations})]
})
class MailModule {}
```

