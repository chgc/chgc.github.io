---
layout: post
title: '[Web] Local Storage'
date: 2014-07-18 01:32
comments: true
categories: "HTML"
tag: "HTML"
---
javascript基本操作html5的 local storage方法
![image_thumb.png](http://user-image.logdown.io/user/4862/blog/4871/post/210650/xi3DOygTnagKxZHig8Yw_image_thumb.png)

```
// set item val
window.localstorage.setItem(key,value);
window.localstorage.getItem(key);
window.localstorage.removeItem(key);
window.localstorage.clear();
```

如果要把array object存入到localstorage裡面，需要把object轉換成文字.所以可透過json的方法來處理
```
JSON.stringify(object);
JSON.parse(value);
```

ref:

http://www.w3schools.com/html/html5_webstorage.asp

http://blog.roodo.com/rocksaying/archives/15967715.html
