---
layout: post
title: '[Angular] 如何設定開發時期的 SignalR proxy 檔'
comments: true
typora-root-url: 2019-10-17-angular-proxy-with-signalr
typora-copy-images-to: 2019-10-17-angular-proxy-with-signalr
date: 2019-10-17 10:13:35
categories: Angular
tags: Angular
---

Angular 在開發時期有提供 `proxy` 的檔案供我們設定 `reverse proxy` ，以避免 CORS 所產生的問題，而 API 的設定上是沒有問題的，那遇到 `SignalR ` 又該怎麼辦呢?

<!-- more -->

首先要先了解 `SignalR` 是跑在什麼協定上，`SignalR` (這裡提的 `SignalR` 是用最新版的 `@microsoft/signalr`) 預設是跑在 `websocket` 上，既然知道是跑在 `websocket` 上，proxy 設定檔就變簡單了，以下是基本範例

```json
{
  ...
  "/messageHub": {
    "target": "<your url>",  
    "ws": true // 這是關鍵設定
  }
}

```

當加上 line:5 後，一切問題就解決了。

# 進階設定

當要設定的網址很多時，可以怎樣設定呢? 可以使用 `context` 來設定，範例如下

```json
{
  "context": ["/messageHub", "/api"],
  "target": "<your url>",
  "secure": false,
  "changeOrigin": true,
  "ws": true
}
```

