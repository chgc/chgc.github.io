---
layout: post
title: '[Laravel] Laravel with Angular'
date: 2015-01-05 03:35
comments: true
categories: "Laravel"
tag: "Laravel"
---
當laravel想要好好的跟angular在一起時，Route都是他們之間的第三者。
前一陣子有發現一個還不錯的方式可以讓Laravel的Route失效。那就是利用

````
App::missing(function($exception)
{	
	return View::make('index');
});
```

這樣子的設定，就可以不用讓Laravel一直回傳index頁面. 如果需要其他路由設定時，就直接在上面新增即可.

當這樣子設定時，html頁面就可以放在public folder下面，不用使用blade template. 好處是，不用再多學習blade的語法。angular的操作也比較直覺。