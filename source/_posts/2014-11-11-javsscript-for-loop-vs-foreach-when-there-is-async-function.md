---
layout: post
title: '[Javsscript] for loop VS forEach when there is async function'
date: 2014-11-11 04:05
comments: true
categories: "Javascript"
tag: "Javascript"
---
今天在檢查一段程式的時候，再跑一段根據array的資料新增或更新到資料庫中，卻發現都是更新同一筆紀錄
原本的寫法

```
for(var i=0; i < arr.length; i++){
	db.insert(xxx).then(function(){
     ...
     all insert the same record
  })
}
```
這是因為javascript async non-blocking的關係，所以資料庫新增自己跑自己的，for迴圈跑自己的，當新增時要取資料庫裡面資料時，會取到不對的值

解法：用array.forEach來替代for loop

```
arr.forEach(function(item,idx){
	db.insert(xxx).then(function(){
  		...
  })
});
```

當我改寫成這樣子後，就正常了