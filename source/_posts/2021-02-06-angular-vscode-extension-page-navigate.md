---
layout: post
title: '[Angular] Angular 在 VSCode Extension (Webview) 內做頁面切換'
comments: true
typora-root-url: 2021-02-06-angular-vscode-extension-page-navigate/
typora-copy-images-to: 2021-02-06-angular-vscode-extension-page-navigate/
date: 2021-02-06 00:22:09
categories: Angular
tags: Angular
---

繼上一篇環境基礎設定完成後，這篇先來筆記一下要如何做頁面切換，有哪些地方需要留意的

<!-- more -->

首先要知道在 VSCode Extension Webview 的環境並不是一個 web server 而是檔案，所以我們就不能使用預設的路由設定模式，而必須改為 hash 模式 (`HashLocationStrategy`)，設定方式如下

```typescript
 RouterModule.forRoot(routes, {
      useHash: true,
}),
```

在到 `index.html` 的地方，調整 base 路徑的部分

```html
<base href="#">
```

到這邊基本上 Angular 的路由就可以正常運作了

或許會問說，那 LazyLoading 的部分呢? 很抱歉，在 VSCode Extension Webview 內是不能使用的，所以 `loadChildren` 的寫法要改成這樣

```typescript
  { path: 'product', loadChildren: () => ProductModule },
```



