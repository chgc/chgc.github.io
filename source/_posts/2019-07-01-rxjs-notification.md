---
layout: post
title: '[RxJS] Notification '
comments: true
typora-root-url: 2019-07-01-rxjs-notification/
typora-copy-images-to: 2019-07-01-rxjs-notification/
date: 2019-07-01 09:15:17
categories: Angular
tags: Angular
---

RxJS 內除了 `Observable` 之外，還有另外一種物件型別，稱做 `Notification`，什麼是 `Notification` 而他可以做到那些事情，就讓這篇文章來探討一下

<!-- more -->

# 基本介紹

`Notification` 是一個物件可以用來描述 Observable 所送出的事件資訊，例如這次送出的資料狀態是什麼? 是否有資料? 資料又是什麼? 我們可以透過這些資訊來做一些額外的判斷處理。

我們沒有辦法直接取得 `Notification` 類型的資料，需要搭配兩個 `operator` 來完成、`materialize` 與 `dematerialize` 

* `materialize` 是將 `Observable` 送出的事件資料轉換成 `Notification` 物件
* `dematerialize` 是將 `Notification` 轉換為 `Observable` 的事件資料

當然我們也可以直接建立 `Notification` 物件

## 範例

```typescript
 of(1, 2, 'a', 'b')
      .pipe(materialize())
      .subscribe(value => console.log(value));
```

輸出結果

![1561945226547](1561945226547.png)

可以很容易的看到，透過 `materialize` 的方法，可以讓在 `Observable` 間流動的資料用物件的方式呈現相關的資訊，來做一點變化

```typescript
of(1, 2, 'a', 'b')
      .pipe(
        materialize(),
        map(x => (x.kind === 'C' ? x : new Notification(x.kind, x.value + '!')))
      )
      .subscribe(value => console.log(value));
```

* line 4: 透過 map 的方法，來加入一些判斷變化條件

輸出結果

![1561945532051](1561945532051.png)

最後到 `subscribe` 的步驟，維持 `Notification` 的格式是還蠻奇怪的，所以可以使用 `dematerialize` 做轉換

```typescript
of(1, 2, 'a', 'b')
      .pipe(
        materialize(),
        map(x => (x.kind === 'C' ? x : new Notification(x.kind, x.value + '!'))),
        dematerialize()
      )
      .subscribe(value => console.log(value));
```

輸出結果

![1561945668313](1561945668313.png)

# Notification

透過上述的範例，我們能知道一個 `Notification` 至少包含了幾個資訊

1. `kind`: 目前資料的狀態: N (Next), E (Error), C (Complete)
2. `value`: 值/資料
3. `hasValue`: 是否有包含資料
4. `error`: 錯誤訊息

也可以直接使用 `new Notification()` 的方式建立

## 延伸變化

知道 Notification 之後，到底能用在哪裡呢? 例如想不寫 complete function 但又想要在完成時做動作時，這時候就可以利用 Notification 的 kind 來處理

```typescript
range(0, 5)
      .pipe(
        materialize(),
        tap(notifcation => {
          if (notifcation.kind === NotificationKind.COMPLETE) {
            console.log('let do something when complete');
          }
        }),
        dematerialize()
      )
      .subscribe(value => console.log(value));
```

執行結果

![1561950262865](1561950262865.png)

雖然上述的功能，可以利用 `finally` 來完成，但多知道一種變化型，不是很好嗎? 

在深處思考一下以下的情形，是否能用 Notification 寫出 `tap` 的效果， `tap` 本身就接受 3 種狀態的 callback ( `tap<T>(nextOrObserver?: PartialObserver<T> | ((x: T) => vlid), error?: (e:any) => void, complete?: () => void)`)，下面程式碼也可以做到一樣的事情

```typescript
materialize(),
map(noti => {
     noti.accept(v => console.log('extra callback fn', v));
     return noti;
 }),
dematerialize()
```

* `Notification` 的 `accept(nextOrObserver: PartialObserver | ((value: T) => void), error?: (err: any) => void, complete?: () => void)` 

