---
layout: post
title: '[Angular2] Router Resolve'
comments: true
date: 2016-12-11 22:10:39
categories: Angular
tags: Angular2
---

Angular 2的Router Config的地方，可以設定data跟resolve. 這篇就簡單的紀錄一下怎麼寫resolve的部分跟怎麼在component裡取得資料

<!-- more -->

# 基本用法

Routes設定的部分

```typescript
{
    path: 'posts',
    component: PostsComponent,
    data : { someProp: propValue},
    resolve: {
        posts: PostsResolver  
    }
  ...
}
```

這裡的可以直接設定data或是resolve的屬性，這兩個屬性都可以透過ActivatedRoute的data取得. 

PostsResolver是實作Resolve

```typescript
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs';

@Injectable()
export class PostsResolver implements Resolve<any>{
    constructor(private http: Http) {   
    }

    resolve(): Observable<any> {
        return this.http.get('https://jsonplaceholder.typicode.com/posts').map(res=>res.json());
    }
}

```

當然在routing-module下必須把這個註冊在provider裡面

```typescript
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
      PostsResolver
  ]
})
export class AppRoutingModule { }

```

以上就是基本的router resolve的做法



那Component裡面怎麼用呢

```typescript
...
export class PostsComponent implements OnInit {

  posts: any[] = [];

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.posts = data.posts;
    })
    // or this way
    this.posts = this.route.snapshot.data['posts'];
  }
}
```

# 進階用法

resolve也可以把參數的部分帶入使用

```typescript
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PostResolver implements Resolve<any>{
    constructor(private http: Http) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        let id = route.params['id'];
        return this.http.get(`https://jsonplaceholder.typicode.com/posts/${id}`)
            .map(res => res.json());
    }
}
```

# 參考資料

[ROUTING & NAVIGATION](https://angular.io/docs/ts/latest/guide/router.html#!#resolve-guard)

[範例程式碼](https://github.com/chgc/blogDemocode-ng2Router-resolve)

