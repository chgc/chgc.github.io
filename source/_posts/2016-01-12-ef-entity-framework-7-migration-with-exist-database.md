---
layout: post
title: '[EF] Entity Framework Core 1.0 - Migration with Exist Database'
date: 2016-01-12 02:12
comments: true
categories: "Entity Framework"
tag: "EF Core"
---
After Scaffold from existing datbase, and then add migration at first time.

![](https://farm2.staticflickr.com/1598/24326751835_e0c5dcabcc_o.png)

EF will create something like above. But in first migration will have everything that already existed in database. therefore, delete that file and add migration again. Now this time. you will get an empty migration file. WHy? because ContextModelSnapShot. It seems EF will compare all model files with snapshot file. and find the differences to create migration content file.

And Now it switch to Code first mode. ^^


[EF 7 Doc](https://ef.readthedocs.org/en/latest/getting-started/index.html)