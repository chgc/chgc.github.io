---
layout: post
title: '[Angular] EventManager'
comments: true
date: 2017-04-19 11:28:27
categories: Angular
tags: Angular
---

EventManager 是一個很強大的 Angular 內建功能。預設有開啟三種 Event，`Dom`、`Key`、`HammerGestures` Plugin可以使用。EventManager 可以讓我們很簡單的控制全域 (window)  的事件。

<!-- more -->

# EventManager

EventManager 的 Class 如下

```typescript
class EventManager {
  constructor(plugins: EventManagerPlugin[], _zone: NgZone)
  addEventListener(element: HTMLElement, eventName: string, handler: Function) : Function
  addGlobalEventListener(target: string, eventName: string, handler: Function) : Function
  getZone() : NgZone
}
```

constructor 所指的 plugins 項目，在 browser 一開始讀取時，就已經在 provider 的地方設定好了

![](https://farm3.staticflickr.com/2909/34131483385_dec465902e_o.png)

![](https://farm4.staticflickr.com/3933/33320171663_cb29e7749d_o.png)

根據文件，我們可以使用 `addGlobalEventListener` 的方式來註冊事件到某一個對象上，所以如果要將 `keyup` 事件註冊到 `windows`物件上，那我們可以這樣子寫

```typescript
constructor(private eventManger: EventManager) {
    this.eventManger.addGlobalEventListener('window', 'keyup.enter', (e: KeyboardEvent) => {
      // do something here
    });
}
```

# 範例

 `ctrl+a`全選的功能，也可以透過這個方式給覆寫掉

```typescript
this.eventManger.addGlobalEventListener('window', 'keydown.control.a', (e: KeyboardEvent) => {
      e.preventDefault();
    });

this.eventManger.addGlobalEventListener('window', 'keyup.control.a', (e: KeyboardEvent) => {
      // do soemthing..
    });
```

# 其他說明

那至於 EventManager 會使用哪一個 EventPlugin，他自己會去判斷。

![](https://farm3.staticflickr.com/2813/33974350672_0a52ccdacb_o.png)



# 參考資料

[source code](https://github.com/angular/angular/blob/4.0.0/packages/platform-browser/src/dom/events/event_manager.ts#L17-L61)

