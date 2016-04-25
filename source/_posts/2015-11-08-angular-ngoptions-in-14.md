---
layout: post
title: '[Angular] ngOptions in 1.4'
date: 2015-11-08 14:53
comments: true
categories: "Angular"
tag: "Angular"
---
之前沒有特別留意ngOptions在1.4版裡面修正了一些東西，包含track by的用法
先簡單的描述一下狀況
```
$scope.options = [
         {id:1,display:"1"},
         {id:2,display:"2"},
         {id:3,display:"3"},
         {id:4,display:"4"},
         {id:5,display:"5"}
       ] ;
       
$scope.selected = 3;

// html
<select ng-options="m.id as m.display for m in options" 
       ng-model="selected"></select>
```
這種寫法應該算是很常見的用法

但是這樣子的寫法經過1.4版處理後, 仔細去看他的html會變成
```
<select ng-options="m.id as m.display for m in options" ng-model="selected">
    <option label="1" value="number:1">1</option>
    <option label="2" value="number:2">2</option>
    <option label="3" value="number:3" selected="selected">3</option>
	  <option label="4" value="number:4">4</option>
		<option label="5" value="number:5">5</option>
</select>
```
竟然多了型別..>"<, 這表示如果我的$scope.selected = '3'時，就會選不到東西了

好吧，那如果用track by呢
```
<select ng-options="m.id as m.display for m in options track by m.id" 
       ng-model="selected"></select>
```

DOM
```
<select ng-options="m.id as m.display for m in options track by m.id" ng-model="selected">
      <option value="?" selected="selected"></option>
      <option label="1" value="1">1</option>
      <option label="2" value="2">2</option>
      <option label="3" value="3">3</option>
      <option label="4" value="4">4</option>
      <option label="5" value="5">5</option>
</select>
```
這樣子看起來正常多了，但是$scope.selected的值不管是使用 3 or "3" 都選不到東西. 只有給他options裡面的某一個object他才會被選定。
所以看起來track by是用 for m的m當作選定的值，那 select as label不就沒用了，沒用就拿掉他
```
<select ng-options="m.display for m in options track by m.id" 
       ng-model="selected"></select>
```
DOM
```
<select ng-options="m.id as m.display for m in options track by m.id" ng-model="selected">
      <option value="?" selected="selected"></option>
      <option label="1" value="1">1</option>
      <option label="2" value="2">2</option>
      <option label="3" value="3">3</option>
      <option label="4" value="4">4</option>
      <option label="5" value="5">5</option>
</select>
```
看起來都一樣了

結論
用track by: select裡的ng-model會是以object的型態呈現, 不需要再寫select as xxxx了.
不用track by: 就看所表示的select是怎樣的型態，ng-model就是怎樣的型態，但是多了型別的判斷


