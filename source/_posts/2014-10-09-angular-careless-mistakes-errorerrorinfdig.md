---
layout: post
title: '[AngularJS] 粗心的錯誤 Error: error:infdig'
date: 2014-10-09 06:18
comments: true
categories: "AngularJS"
tag: "AngularJS"
---
angular在寫ng-repeat的時後, 因為想要利用 filter的功能將過濾後的資料集拿到不同區塊使用, 把function 寫到ng-repeat裡面。 像是
```
ng-repeat="item in processData((items | filter: someCondition))"
```

這一個粗心的錯誤會讓angular產生**Error: error:infdig,Infinite $digest Loop**的錯誤訊息

這個訊息的產生原因是當ng-repeat每跑一次, 會觸發processData fuction => 因為值改變，所以又會觸發$digest. 然後當$digest的次數太多之後，就會發生錯誤訊息, 執行效率也會變得非常的不好。

所以回到angularjs的頁面裡找到這個[https://docs.angularjs.org/error/$rootScope/infdig]()

下面的說明就有提到這個現象. 
> Since getUsers() returns a new array, Angular determines that the model is different on each $digest cycle, resulting in the error. The solution is to return the same array object if the elements have not changed:

解決的方式就是不要在ng-repeat裡面寫function. 但如果要達到相同的效果, 可以先將過濾後的結果存到一個變數中, 然後在去操作那個變數就不會產生這個錯誤了

```
ng-repeat="item in (someVar = items | filter: someCondition)"
```


