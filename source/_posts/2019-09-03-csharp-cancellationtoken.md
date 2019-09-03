---
layout: post
title: '[ASP.NET MVC] WebAPI with CancellationToken'
comments: true
typora-root-url: 2019-09-03-csharp-cancellationtoken/
typora-copy-images-to: 2019-09-03-csharp-cancellationtoken/
date: 2019-09-03 08:29:50
categories: ASP.NET MVC
tags: ASP.NET MVC
---

這裡是 WebAPI 用非同步的寫法

```csharp
public async Task<ActionResult> SomeItem(int id) {
    ....
}
```

但如果想要搭配 RxJS 的 switchMap 使用，這樣子是不夠的。我們需要使用 CancellationToekn 的協助

<!-- more -->

先簡單介紹什麼是 `switchMap` ，前端 RxJS  的 `switchMap` 的作用是當快速發出 request 時，會將之前的 request 全部 cancel 掉，只保留最後一次的 request，所以當打開開發者工具時，在 Network 下可以看到 `cancel` 的狀態，但這一個現象只是前段處理，如果後端沒有處理取消行為，所有的 request 還是會全部跑完，只是前端最後不理會而已。

如果 RxJS 的 `switchMap` 是這樣的功能，那後端要怎麼處理呢? 好家在 C# 有對應的處理方式，那就是使用 `CancellationToken`，基本寫法是這樣

```csharp
public async Task<ActionResult> ShowItem(int id, CancellationToken cancellationToken)
{
    return await rep.getItem(id).FirstOrDefaultAsync(cancellationToken);
}
```

其實就這麼簡單，C# 的 async 方法基本上可接受 `CancellationToken`，傳進去就可以，當前端發出取消請求，後面的行為也會跟著被取消。

