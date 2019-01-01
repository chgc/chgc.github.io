---
layout: post
title: '[Angular] 測試含有 debounceTime 的程式碼'
comments: true
typora-root-url: 2019-01-01-angular-testing-debounceTime/
typora-copy-images-to: 2019-01-01-angular-testing-debounceTime/
date: 2019-01-01 11:16:00
categories: Angular
tags: Angular
---

Angular 在測試非同步的程式碼，有提供 `fakeAsync` 與 `tick` 的方法，可以讓我們手動控制時間的快慢，進而做到程式碼的測試，可是，這個寫法遇到 RxJS 時間相關的 operators 就會出問題，那又該如何處理呢?

<!-- more -->

雖然在官方文件內寫了很多如何測試非同步的方法，但是我發現這一個方法比較不容易出錯，也可以在 wallaby.js 的測試環境下正常運作，在此筆記分享

假設我有一段程式碼要測試

```typescript
this.searchBox.valueChanges
      .pipe(                
        debounceTime(500)        
      )
      .subscribe(value => {        
        this.searchInput = value;
      });
```

這一個行為是在 `searchBox` 在停止動作後的 `500ms` 才會觸發 emit value 的事件，屬於時間類的 operators, 在 spec 內可以這樣子寫

```typescript
it('測試 Searchox', done => {
    let FakeAsyncTestZoneSpec = (Zone as any)['FakeAsyncTestZoneSpec'];
    let testZoneSpec = new FakeAsyncTestZoneSpec('name');
    let fakeAsyncTestZone = Zone.current.fork(testZoneSpec);

    fakeAsyncTestZone.run(() => {
        component.searchBox.setValue('something');
        testZoneSpec.tick(500);
        expect(component.searchInput).toBe('something');
        done();
    });
});
```

※上述寫法必須在 zone.js `0.8.26` 版本才能使用



# 延伸閱讀

* [Angular Testing](https://angular.io/guide/testing#async-test-with-fakeasync)