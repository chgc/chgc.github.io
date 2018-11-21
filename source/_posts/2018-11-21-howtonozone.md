---
layout: post
title: '[Angular] 如何寫出沒有 ngZone 的 Angular 程式'
comments: true
typora-root-url: 2018-11-21-howtonozone
typora-copy-images-to: 2018-11-21-howtonozone
date: 2018-11-21 10:02:19
categories: Angular
tags: Angular
---

Angular 5 提供可以關掉不使用 ngZone 的開關，透過這種寫法就可以關掉 ngZone

```typescript
platformBrowserDynamic()
  .bootstrapModule(AppModule, { ngZone: 'noop' })
  .catch(err => console.error(err));
```

但關掉後，會發現很多原本很自然的行為全部都不見了，那該怎麼辦呢?

<!-- more -->

# Change Detection 機制



# ngZone



