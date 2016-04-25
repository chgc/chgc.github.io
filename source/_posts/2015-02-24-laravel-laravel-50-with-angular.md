---
layout: post
title: '[Laravel] Laravel 5.0 with Angular'
date: 2015-02-24 03:57
comments: true
categories: "Laravel"
tag: "laravel 5"
---
之前有寫過一篇有關[[Laravel] Laravel with Angular](http://cky.logdown.com/posts/248326/laravel-laravel-with-angular "[Laravel] Laravel with Angular"), 但是這個方法在Laravel 5.0裡面是不合用的

所以laravel 5.0的作法如下
在 app/Exceptions/Handler.php 裡修改render function
```
public function render($request, Exception $e)
	{
		if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException)
			return response()->view('index')->header('Content-Type', 'text/html');
		return parent::render($request, $e);
	}
```

這個效果等於laravel 4.x的app::missing
