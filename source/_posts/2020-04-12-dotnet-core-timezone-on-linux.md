---
layout: post
title: '[.NET Core] Taipei Standard Time 在 Linux 上找不到?'
comments: true
typora-root-url: dotnet-core-timezone-on-linux
typora-copy-images-to: dotnet-core-timezone-on-linux
date: 2020-04-12 00:57:25
categories: 
tags:
---

`.NET Core` 在 Linux 環境上遇到設定時區時，會遇到這一個錯誤訊息 `The time zone ID 'Taipei Standard Time' was **not** found on the local computer.` ，這一個問題在 mac 上也會遇到，主要是因為以前 `.Net` 只能跑在 windows 上，所以不會遇到這個問題，而當現在 `.NET Core` 跑在 Linux 環境上就會遇到這類似的問題

<!-- more -->

解法很簡單，判斷目前跑的環境是什麼，然後給予正確的時區名稱即可

```csharp
using System.Runtime.InteropServices;

string id = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ?
                "Taipei Standard Time" : "Asia/Taipei";
TimeZoneInfo tw = TimeZoneInfo.FindSystemTimeZoneById(id);
```

當這樣子寫完，問題就解決了