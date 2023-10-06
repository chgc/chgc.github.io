---
layout: post
title: '[Angular] 官方文件的 HttpTestingController 範例遇到 jest 時，結果不是想像的那樣，小心'
comments: true
typora-root-url: 2023-10-06-jest-with-httpTestingController/
typora-copy-images-to: 2023-10-06-jest-with-httpTestingController/
date: 2023-10-06 20:07:29
categories: Angular
tags: Angular
---

今天在寫 http service 測試時，無意間撞到這個問題，分享這個小雷給大家，避免死的不明不白，

這篇 [HTTP client - Test requests](https://angular.io/guide/http-test-requests) 內說明如何使用 `HttpTestingController` 進行 http request 的測試，而因為後期的專案我都是使用 Nx 來建立，Nx 建立的專案是使用  Jest 來跑 Unit Test. 不知道是幸運還是怎樣，竟然遇到超乎預期的結果

<!-- more -->

情境是這樣的，測試一個 server 呼叫  API 回傳的結果是否符合預期，寫法是

```typescript
  callApi() {
    return this.http.get('/data').pipe(
      catchError(() => of([])),
      map((x) => [x])
    );
  }
```

測試程式碼為

```typescript
  it('test api', () => {
    const mockData = { name: 'Kevin' };
    service.callApi().subscribe({
      next: (result) => {
        expect(result).toEqual([]);
      },
    });

    const req = httpTestingController.expectOne('/data');
    req.flush(mockData);

    httpTestingController.verify();
  });
```

上述的測試預期結果會是 fail 的，因為 line: 5 的結果理當為 `[mockData]`，但實際跑完測試的結果卻是 passed

![image-20231006202133288](image-20231006202133288.png)

這時候第一個想法會是非同步的關係，可能要用到 callback 的方式，所以調整了 test case ，調整後如下

```typescript
 it('test api', (done) => {
    const mockData = { name: 'Kevin' };
    service.callApi().subscribe({
      next: (result) => {
        expect(result).toEqual([]);
        done();
      },
    });

    const req = httpTestingController.expectOne('/data');
    req.flush(mockData);

    httpTestingController.verify();
  });
```

確實也讓 test failed 了

![image-20231006202257967](image-20231006202257967.png)

但是接著噴了另外一個錯誤訊息, 竟然說 `done()` 必須要呼叫到，timeout.

![image-20231006202352969](image-20231006202352969.png)

經過一段時間的研究，發現原來是這個原因

> If `done()` is never called, the test will fail (with timeout error), which is what you want to happen.
>
> If the `expect` statement fails, it throws an error and `done()` is not called. If we want to see in the test log why it failed, we have to wrap `expect` in a `try` block and pass the error in the `catch` block to `done`. Otherwise, we end up with an opaque timeout error that doesn't show what value was received by `expect(data)`.

在 jest 內如果 expect 的結果不符合預期，會噴 exception，所以當使用 `done` callback 時，需要用 try catch 包起來

```typescript
 it('test api', (done) => {
    const mockData = { name: 'Kevin' };
    service.callApi().subscribe({
      next: (result) => {
        try {
          expect(result).toEqual([]);
          done();
        } catch (err) {
          done(err);
        }
      },
    });

    const req = httpTestingController.expectOne('/data');
    req.flush(mockData);

    httpTestingController.verify();
  });
});
```

這樣改寫完，timeout 的錯誤訊息就沒有再出現了。看來過往沒有特別留意到這塊，真的是太不小心了。所以寫這篇筆記分享給大家



## 參考資料

- https://jestjs.io/docs/asynchronous#callbacks
