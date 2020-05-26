---
layout: post
title: '[Blazor] 自動重新整理 (auto reload)'
comments: true
typora-root-url: 2020-04-04-blazor-reload-after-save
typora-copy-images-to: 2020-04-04-blazor-reload-after-save
date: 2020-04-04 10:48:07
categories: Blazor
tags: Blazor
---

在開發 Blazor 時，最常遇到的問題是儲存完程式後，還需要手動重新更新瀏覽器的頁面，除了那個提示畫面很礙眼外，竟然還要手動，以下是一個小技巧可以自動更新頁面

<!-- more -->

除了保哥寫的這篇文章外，[如何讓 ASP.NET Core Blazor Server 在斷線時不影響頁面瀏覽](https://blog.miniasp.com/post/2020/01/14/ASPNET-Core-Blazor-Server-Hide-Reconnect-Modal)。在 `_Host.cshtml` 的頁面下加入這段程式碼就可以做到自動更新

```html
<script>
    Blazor.defaultReconnectionHandler._reconnectCallback = function (d) {
        document.location.reload();
    }
</script> 
```

我是放在 `<script src="_framework/blazor.server.js"></script>` 的後面。當加上這段程式碼後，畫面就會在連線重新連上時自動更新畫面

如果想限定加入這段 script 的時機點，可以搭配 `<environment include="Development">` 使用

