---
layout: post
title: '[Angular2] Transclusion'
comments: true
date: 2016-11-13 09:52:31
categories: Angular
tags: Angular2


---

Angular1有Transclusion, 那Angular2該怎麼做呢?

<!-- more -->

# View & Content

在介紹Angular2的Transclusion之前，有兩個名詞要介紹，就是 `View` 和 `Content`

```html
<app-card> <= View    
    <card-header></card-header> <!-- one of the Contents -->
    <div class="card-footer"></div> <!-- one of the Contents -->
</app-card>
```

所以 `View`和 `Content` 的關係是 `Content` 是存在於 `View` 裡面，而 `View` 就是最外層的 element

# ngContent

而Angular2的Transclusion就是利用Contents來完成，先來看一段程式碼

```typescript
@Component({
  selector: 'app-card',
  template: `
    <ng-content select="card-header"></ng-content>
    <h2>Card Info </h2>    
    <ng-content select=".card-footer"></ng-content>
  `
})
export class HeroParentComponent{}
```

介紹 `<ng-content select="<selector>"></ng-content>`，Angular2透過偉大的selector，就可以將資料或是要顯示的內容放到對的位置

app-card這個component的template, 我們定義了兩個ng-content，分別是針對`<card-header>` tag element, 另外一個是針對claass含有` card-footer`的element. 而在外部使這`app-card` 就可以在content area來提供這部分的資料，使用範例

```html
<app-card>
    <card-header>
      <h1>This is Card Header</h1>
   </card-header>
    <div class="card-footer">
      This is a card footer
  </div>
</app-card>
```

#  NO_ERRORS_SCHEMA

這時候到頁面上觀看結果時，在Console的地方會出現錯誤訊息

![](https://farm6.staticflickr.com/5831/22770583938_e741cf1f0a_o.png)

這裡的錯誤訊息是指，template parser不認識 `<card-header>` 這個標籤，所以丟出錯誤訊息。這裡需要再 ngModule的地方再多設定一個參數

```typescript
import { NO_ERRORS_SCHEMA  } from '@angular/core';
...
schemas: [ NO_ERRORS_SCHEMA ]
```

`NO_ERRORS_SCHEMA` 表示 Defines a schema that will allow any property on any element.

最終結果

![](https://farm6.staticflickr.com/5651/25313550289_bd9a2cf181_o.png)



# 延伸閱讀

- [Angular 2 Transclusion using ng-content](https://scotch.io/tutorials/angular-2-transclusion-using-ng-content)
- [ng_module metadata](https://github.com/angular/angular/blob/1cf5f5fa38ea672a972313049c9de2db6024441d/modules/%40angular/core/src/metadata/ng_module.ts)
