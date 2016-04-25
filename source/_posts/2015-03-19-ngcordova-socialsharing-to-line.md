---
layout: post
title: '[ngCordova] socialSharing - to Line'
date: 2015-03-19 00:54
comments: true
categories: "Library"
tag: "ngCordova"
---
when use ngCordova socialSharing plugin. there is a method 'canShareVia' which can share to specific social application by it's appPackageName.

To Line(http://line.me) the packageName is **jp.naver.line.android**

```
var lineAppPackageName = 'jp.naver.line.android';
$cordovaSocialSharing
            .shareVia(lineAppPackageName, content, subject, null, '')
            ...
```