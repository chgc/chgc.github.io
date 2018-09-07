---
layout: post
title: '[Angular] Service Worker Update'
comments: true
date: 2018-09-07 10:08:25
categories: Angular
tags: Angular
---

Angular 所提供的 `@angualr/pwa` 套件，可以讓我們快速地完成加入 service worker 並建立起 PWA 網站。但由於 service worker 會將內容暫存住，要用怎樣的方法才能讓 service worker 更新暫存內容呢?

<!-- more -->

Angular 很好心的有想到這一部份，提供了內建 API 可以使用。相關的使用方法請繼續閱讀下去 

# SwUpdate

Angular 提供了 `SwUpdate` 的 service 可以讓我們透過程式碼的方式來更新 service 內容， `SwUpdate` 包含了四個動作

* `available`：唯讀屬性，`Observable<UpdateAvailableEvent>` 型別，如果有新版本可以被更新，會發出事件

  ```typescript
  constructor(updates: SwUpdate) {
      updates.available.subscribe(event => {
        console.log('current version is', event.current);
        console.log('available version is', event.available);
      });
  }
  ```

* `activated`：唯讀屬性，`Observable<UpdateActivatedEvent>` 型別，當有新版本被更新時，會發出事件

  ```typescript
  constructor(updates: SwUpdate) {  
      updates.activated.subscribe(event => {
        console.log('old version was', event.previous);
        console.log('new version is', event.current);
      });
    }
  ```

* `isEnabled`：判斷 service worker 是否有啟動

* `checkForUpdate()`：要求 service worker 檢查是否有新版本可以更新

  ```typescript
   constructor(updates: SwUpdate) {
      interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate());
    }
  ```

* `activateUpdate()`：要求 service worker 進行新版本更新動作

  ```typescript
    updates.available.subscribe(event => {
        if (promptUser(event)) {
          updates.activateUpdate().then(() => document.location.reload());
        }
      });
  ```

  在文件中，有提到這一個動作可能會讓 `lazy-loading`  的模組壞掉。

  > Doing this could break lazy-loading into currently running apps, especially if the lazy-loaded chunks use filenames with hashes, which change every version.



# 範例

此段程式碼是 **Angular Taiwan 2018 活動網站** 使用的程式碼，就當作此篇文章的範例程式碼

```typescript
 if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        const snackBarRef = this.snackBar.open(
          this.translate.instant('needUpdate'),
          '',
          {
            duration: 1500,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
        snackBarRef.afterDismissed().subscribe(() => {
          window.location.reload();
        });
      });
    }
```

# 結論

在 [angular.io](https://angular.io/guide/service-worker-intro) 關於 Service Workers 的內容寫得很詳細，建議大家花點時間閱讀，會對 Service Worker 有更進一步的了解

# 參考資料

* [Service worker communication](https://angular.io/guide/service-worker-communications)
* [API](https://angular.io/api/service-worker/SwUpdate)