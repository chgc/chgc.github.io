---
layout: post
title: '[RxJS] Config.onUnhandledError'
comments: true
typora-root-url: 2022-09-18-rxjs-config/
typora-copy-images-to: 22-09-18-rxjs-config/
date: 2022-09-18 22:46:59
categories: Angular
tags: Angular
---

今天心血來潮跑去 `RxJS` 官網晃了一下，無意間看到一個我從沒注意到的好功能，特地寫一篇文章記錄一下，我們在寫 Angular 時會去寫一個 global 的 error handle，主要目的是為了那些未被處理的 exception，而 `RxJS` 也有一樣的功能，那就是 `config`

<!-- more -->

先貼上一段 code，直接用程式碼說明

```typescript
import { config, throwError } from 'rxjs';

config.onUnhandledError = (err) => console.warn(err);

throwError(() => 'error without handle').subscribe();
throwError(() => 'error with handle').subscribe({
  error: (err) => console.error(err),
});

```

執行效果如下圖

![image-20220918225327395](image-20220918225327395.png)

光看到這樣是否就覺得有使用他的地方了，而實際在 Angular 內會怎麼使用呢? 因為 `config` 是 global 設定，所以可以在 root module 定義，剩下的就會自己處理了，十分方便

![image-20220918230230345](image-20220918230230345.png)



## 參考資料

- [RxJS config](https://rxjs.dev/api/index/interface/GlobalConfig)
