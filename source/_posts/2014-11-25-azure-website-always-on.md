---
layout: post
title: '[Azure] Website Always On'
date: 2014-11-25 06:39
comments: true
categories: "Azure"
tag: "Azure"
---
當mvc website第一次讀取的速度都會很慢，這個原因是因為要做complie的動作，
那如何避免這個現象發生呢, 
1. 將azure website的規格升級到basic以上的規格並開啟alowasy on.
2. 寫webjob(請參考這篇文章http://wp.sjkp.dk/windows-azure-websites-and-cloud-services-slow-on-first-request/)
3. 利用http://www.thecloudup.com/, 幫你做第二點事情(免費)