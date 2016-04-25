---
layout: post
title: '[HTML] 讓span可以focus'
date: 2015-03-26 02:31
comments: true
categories: "HTML"
tag: "HTML"
---
HTML裡有也Element是沒有辦法focus, 原因是因為它們預設的tabindex是-1
所以要讓他們能focus, 只要改變tabindex=0. 就可以了

```
    <span tabindex=0>something</span>
```