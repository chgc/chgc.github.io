---
layout: post
title: '[RxJS]使用情境(1)-FB爬文'
comments: true
date: 2017-01-08 11:06:23
categories: Angular
tags:
- Angular2
- RxJS
---

這一篇利用Facebook的GraphAPI+RxJS的方式，來爬Facebook的文章. 基本流程是

- 步驟1: 先從一個粉絲頁的id 
- 步驟2: 再從粉絲頁去按讚的id擴展下去
  - 步驟2-1: 讀取該粉絲頁的文章(post)
  - 步驟2-2: 如果還有下一頁，根據paging.next的url重複步驟2-2
- 步驟3: 第二個粉絲頁重複步驟1
- 步驟4: 將讀取的post顯示在畫面上

<!-- more -->

#  Facebook Graph API

facebook提供GraphAPI的方式可以撈到Facebook Page的相關資料，例如他有按讚的其他專頁，該專頁發佈的文章，利用這樣的特性，就可以利用一個粉絲專頁擴展下去

相關的訊息可以到 [facebook for developers](https://developers.facebook.com/)查詢

# AngularFire2

我利用AngularFire2的Facebook Auth的方式取得accessToken, 詳細使用方式，請參閱[GitHub Repo](https://github.com/angular/angularfire2)

這裡就不多解釋

# 範例程式碼

## 基本功能

### 組合GraphSQL的查詢網址

```typescript
combineUrl(id, fields) {
    return `https://graph.facebook.com/v2.8/${id}?fields=${fields}&access_token=${this.accessToken}`;
  }
```

### 查詢粉絲團有按過的讚

```typescript
// 查詢按讚資料
queryLikes(id) {
  let url = this.combineUrl(id, 'likes');
  return this.http.get(url).map(res => res.json())
    .mergeMap(data => {
    if (data.likes)
      return Observable.from(data.likes.data);
    else
      return Observable.empty();
  })
}
```

* `mergemap` return new Observable

* `Observable.from`將一個Array轉換成一個一個的資料

  ```typescript
  var arr = [1,2,3];
  Observable.from(arr).subscribe(data=>{
    console.log(data);
  })
  // output: 1
  // output: 2
  // output: 3
  ```

* `Observable.empty()`回傳一個完成狀態的空Observable

#### queryLikes(id)回傳的資料格式

```json
{
  "likes": {
    "data": [
      {
        "name": "Microsoft Visual Studio",
        "id": "102038129831681"
      },
      {
        "name": "Microsoft Taiwan",
        "id": "395317217235059"
      },
      ...
    ],
    "paging": {
      "cursors": {
        "before": "MTAyMDM4MTI5ODMxNjgx",
        "after": "MTk5MTgyNTMzNDUzMjU4"
      }
    }
  },
  ...
}
```



### 查詢粉絲頁發佈的文章

```typescript
// 查詢文章
queryPost(id) {
  let url = this.combineUrl(id, 'posts');
  console.log(url);
  return this.http.get(url).map(res => res.json())
    .map(data => data.posts);
   .expand(data => {
     if (data.paging.next) {
       return this.queryNextPage(data.paging.next);
     } else {
       return Observable.empty();
     }
   });
}
```

* （**重點**) `expand` 遞迴產生新的Observable

  expand會將內部回傳的Observable產生新的一條資料流

  ```javascript
  a().expand(data=>{
    if(condition)
       return 'complete state Observable';
    else
       return b();
  })
  ---->b().expand(data=>{
        if(condition)
           return 'complete state Observable';
        else
           return b();
      })----> b().expand(data=>{
                if(condition)
                   return 'complete state Observable';
                else
                   return b();
            })
      ....
  ```

  所以基本上，就把expand的運作方式跟遞迴方法的運作方式是一樣的

#### 回傳結果

```json
{
  "posts": {
    "data": [
      {
        "message": "Today's Xamarin Snack Pack Show w/ James Montemagno -  http://spr.ly/61898OAJ1 - how to get started using Xamarin Workbooks, Interactive documentation tool for exploring a myriad of topics, from the basics of the C# language to fundamentals of computer science and advanced topics surrounding mobile application development.",
        "created_time": "2017-01-07T00:26:03+0000",
        "id": "102038129831681_1188325814536235"
      },
      {
        "message": "Connect(); // 2016 Session On Demand: SQL Server on Linux: use SQL Tools with SQL Server, http://spr.ly/61898O4PU

Learn about working with SQL Tools from your platform of choice with SQL Server on Linux. We'll show you how to use SQL Server Management Studio (SSMS) and SQL Server Data Tools (SSDT) with SQL Server on Linux. We'll also show you new cross-platform SQL tooling experiences that are available now in Visual Studio Code on Linux, macOS, and Windows.",
        "created_time": "2017-01-06T20:35:03+0000",
        "id": "102038129831681_1188219874546829"
      }
      ...
    ],
    "paging": {
      "previous": "https://graph.facebook.com/v2.8/102038129831681/posts?since=1483748763&access_token=EAACEdEose0cBABoGAAqt7WETzqNjXUZBtq6o79mxOdkxrSpwSRp8zTiJHgbGv17AdWXf6mDZBNiZAGmcGjfdVVsghNgGTBjc6ldlAZB2dxwXxSvm9LvEe17bcUqZA5mVztwYjik3uGUnAxT49AjiL0TCYxVx2PUOhKMbOasAIhwZDZD&limit=25&__paging_token=enc_AdBPC2zAP0PXPi25e6aNZBdZA84vevZAF0d7ZB2Y3rMxwaza4UOBaMY90NY8Wk7XHLYHBooiINQQGGdgCeGDoB47yE13L7q7C6HqQMIeKZBnYAGdDZBQZDZD&__previous=1",
      "next": "https://graph.facebook.com/v2.8/102038129831681/posts?access_token=EAACEdEose0cBABoGAAqt7WETzqNjXUZBtq6o79mxOdkxrSpwSRp8zTiJHgbGv17AdWXf6mDZBNiZAGmcGjfdVVsghNgGTBjc6ldlAZB2dxwXxSvm9LvEe17bcUqZA5mVztwYjik3uGUnAxT49AjiL0TCYxVx2PUOhKMbOasAIhwZDZD&limit=25&until=1482769022&__paging_token=enc_AdBrD7ij1AmakbpdTZBZBWlkHTnuLKyUa2CCa0h6nhojVTa2SDOb3Bg5nJaUBkDjZC2Azk51C4o9DadNDveK5OuKHFsPU7blZBdDP5DTGFt5bysmvAZDZD"
    }
  },
  ...
}
```



### 如果還有下一頁資料時，繼續讀取的方法

```typescript
// 查詢下一頁的文章
queryNextPage(url) {
  return this.http.get(url).map(res => res.json());
}
```

## 開始執行

```typescript
start(){
  let startId = 'xxxxx';
  this.queryLikes(startId)
        .expand((page: any) => {
          if (page && !this.cancelling)
            return this.queryLikes(page.id).delay(3000);
          else
            return Observable.empty();
        })
        .take(10)
        .mergeMap(page => {
          return this.queryPost(page.id)
        })
        .subscribe(posts => {
          this.list = [...this.list, ...posts.data];
        })
}
```

這樣子就可以爬出很多文章了.

* 小備註: take(10) 只是我用來限制撈資料的次數而已