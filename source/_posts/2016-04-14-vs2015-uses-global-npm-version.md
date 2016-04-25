---
layout: post
title: '[VS2015] 使用全域的NPM'
date: 2016-04-14 04:03
comments: true
categories: "Visual Studio"
tag: "VS2015"
---
今天透過Visual studio 2015 執行webpack時，竟然返回錯誤訊息。
<img class="center" src="https://farm2.staticflickr.com/1718/26146425130_3a49b949a2_o.png">
我確定該webpack.config.js是可以跑的，但是為什麼在Visual studio 2015裡面執行卻是不行的，結果發現理由是node跟npm的版本有關係
我的webpack.config.js裡面有下'use strict'; 然後有使用到**const**, 所以VS就不開心了. 因為所使用的node版本不認識ES2015的東西.

解決方式是讓visual studio執行npm command時，使用本機電腦所使用的版本而不是Visual studio本身所用的版本, 將 ** $(PATH)**移到最上面
<img class="center" src="https://farm2.staticflickr.com/1602/25814380984_079d4fab3d_o.png">

這樣子的設定就可以讓VS在執行npm時，就會按照上圖的順序去找執行