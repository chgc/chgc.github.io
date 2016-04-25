---
layout: post
title: '[Laravel] Download file, but server doenst have php_fileinfo'
date: 2015-03-12 15:22
comments: true
categories: "Laravel"
tag: "Laravel 4" 
---
Response::Download() in Laravel 4.x needs php_fileinfo extension. Sometimes web hosting server doesn't have that extension on, althought it's default for php 5.4.

so the way to work around is make a response, and add header to it. See code below

```
$file = File::get($filepath);
$response = Response::make($file, 200);
$response->header('Content-Type', $item->mime);
$response->header('Content-Disposition','attachment;filename="'.$filename.'"');
return $response;
```