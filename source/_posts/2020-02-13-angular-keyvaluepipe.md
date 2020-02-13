---
layout: post
title: '[Angular] 使用 KeyValuePipe 的小地雷'
comments: true
typora-root-url: 2020-02-13-angular-keyvaluepipe\
typora-copy-images-to: 2020-02-13-angular-keyvaluepipe\
date: 2020-02-13 08:32:18
categories: Angular
tags: Angular
---

Angular 6 版推出了 KeyValue Pipe，可以讓我們在 HTML 上使用 ngFor 跑 Object 或是 Map 型態的資料，但是，這裡面有一個小雷，一個不注意就會踩進去，那就是**排序**

<!-- more -->

但這一個雷在官網的 API 文件中有提到，以下是說明

> The output array will be ordered by keys. By default the comparator will be by Unicode point value. You can optionally pass a compareFn if your keys are complex types.

在不讀文件就使用，會讓你 debug 到天荒地老。但這表示我們可以傳入排序的比較函式了，以下是使用方式

```
{{ input_expression | keyvalue [: compareFn] }}
```

* input 值須為 { [key: string | number] : V } | Map
* compareFn: (a:keyValue, b: keyValue) => number

# 範例

```html
import { Component } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
    <h1>Display Object Value</h1>
    <pre>      
      {{ data | json }}
    </pre>
    <ul>
      <li *ngFor="let item of (data | keyvalue)">
        {{ item.key }}
      </li>
    </ul>
  `
})
export class AppComponent {
  name = "Angular";
  data = {
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false
  };
}
```

執行結果

![image-20200213085812920](image-20200213085812920.png)

可以發現物件的顯示順序已經依 key 值的字母做排序了

這時候加入 compareFn 看看，可以取到哪些資訊

```typescript
 compareFn(a, b) {
    console.log(a, b);
    return 0;
}
```

template 的地方也將 compareFn 加上

```html
<ul>
    <li *ngFor="let item of (data | keyvalue: compareFn)">
        {{ item.key }}
    </li>
</ul>
```

console.log 出來的結果是

![image-20200213090105707](image-20200213090105707.png)

從這裡可以得知 a 為新值，而 b 為舊值，這裡就可以使用我們寫陣列排需規則的方式來寫，稍微複習陣列排序的寫法規則

1. 當 compareFunction 回傳的值小於 0 ，則 a 會排在 b 之前
2. 當 compareFunction 回傳的值大於 0 ，則 a 會排在 b 之後
3. 當 compareFunction 回傳的值等於 0 ，則 a 與 b 的順序不會改變



# 小結

使用之前詳讀使用說明書

# 參考資料

* [Arrary.prototype.sort](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
* [KeyValue](https://angular.io/api/common/KeyValue)
* [KeyValuePipe](https://angular.io/api/common/KeyValuePipe)
* [範例程式碼](https://stackblitz.com/edit/angular-94dxtk?file=src%2Fapp%2Fapp.component.ts)