---
layout: post
title: '[AngularJS] 混亂的html5mode'
date: 2014-11-12 02:32
comments: true
categories: "AngularJS"
tag: "AngularJS"
---
Angular裡面有一個方法可以把# (hash tag) 給拿掉，那就是將html5mode開啟

```
$locationProvider.html5Mode(true).hashPrefix('!')

// 這應該會要求設定<base href="/">
```

但是如果angular route是架構在asp.net mvc上面，那就會有route打架的情形發生, 或著reload page會出現頁面錯誤的訊息
網路上面的資訊也有很多種版本，以下我也提供一下我的版本

主要重點, asp.net的routeConfig裡面也要同時間定義angular route的部份，但是controller/action是指到index page

```RouteConfig.cs
 routes.MapRoute("member_edit",
              "member/edit/{.Catchall}",
              new { controller = "Home", action = "Index" },
              namespaces: new[] { "Demo.Areas.member.Controllers" });
```

```route.js
	    .state('main.edit', {
                url: 'edit/:id',
                views: {
                    'list@main': {
                        controller: 'editFavorController',
                        controllerAs: 'vm',
                        templateUrl: 'Home/EditFavor'
                    }
                }
          })
```

這樣子的設定, 可以讓其他頁面直接用網址的方式開啟那個頁面(請搜尋 deep link angualr)

當設定完成後，卻又發現另外一個問題，問題是, 我在選單連結的部份，有一些是要跑mvc本身的actionlink的動作, 但是angular會先處理 < a > 的動作，所以要跳過這個動作，可以利用 **window.location.replace** 來處理