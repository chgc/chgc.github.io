---
layout: post
title: '[Laravel] Controllers'
date: 2013-10-17 08:31
comments: true
categories: "Laravel"
tag: "Laravel 4"
---
## Controller
Controllers是用來處理商業邏輯及資料與view之間的介面(負責將資料input//output 給model，與資料庫的溝通就交給model去處理了)

controller需要配合route的設定才可被view呼叫使用。

例如:
route::get('something','someController@someaction')

當使用者跑到 http://website/something時, 就會呼叫route內所對應的controller及action.

發現，這種指定的方式，當頁面很多的時候就會變得很麻煩。 所以laravel的route提供另外一種指定的方式

route::controller('something','someController')

此種設定的方式，適用於restFUL的controller, (get,post,put,delete)四種交換模式的相關動作。

一般而言，只是讀取一個頁面的時候，都是透過 get的method取得回應的。所以在controller內action的命名，
就是用getSomection()為命名的方式，網址就是http://website/something/someaction (小寫, Controller內的action name 是大寫). 如果action的名稱是SomeAction時，**注意 是兩個大寫字母** 網址就會變成 http://website/something/some-action (破折號作為連結的符號)

同理: 如果遇到form post時, 就是呼叫postSomeaction()

以上為controller的基本呼叫方式。

