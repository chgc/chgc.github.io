---
layout: post
title: '[Angular] Secondary routes'
comments: true
date: 2018-10-24 09:49:08
categories: Angular
tags: Angular
---

一般的情況下，`<router-outlet>` 一組就已足夠，但當畫面的複雜度提高，使用一個 `<router-outlet>` 可能會讓程式碼的可維護性降低，如果能在多幾組 `<router-outlet>` 該有多好。而 Angular 的 `<router-outlet>` 確實支援此功能。

<!-- more -->

# 基本

將 `<router-outlet>` 賦予 `name` 的值，就可以創造出第二組或是多組的 routes。但有幾下幾點要注意

1. 每一組 routes 是獨立的。
2. 可以結合其他路由使用
3. 會顯示在指定的 names outlet 裡

## 設定 Routes

但要怎麼設定使用呢? 首先針對路由設定的部分

```typescript
{
  path: 'compose',
  component: ComposeMessageComponent,
  outlet: 'popup'
},
```

* `outlet`:  設定所歸屬的 names outlet，可以多組

## 連結寫法

網頁上連結的寫法

```html
<a [routerLink]="[{ outlets: { popup: ['compose'] } }]">Contact</a>
```

網址列的樣子會是這樣子呈現的

```
.../details(popup: compose)
```

在更複雜一點，假設有多個 names routes 時，又需要怎麼寫，即網址會怎麼呈現呢?

```html
<a [routerLink]="[{ outlets: { popup: ['compose'], detail: ['detail'] } }]">Contact</a>
```

```
.../details(popup:compose//detail:detail)
```



## 清空 secondary routes

要如何清除呢? 單純的將 outlets 裡的 names 指定的路徑清空即可

```html
<a [routerLink]="[{ outlets: { popup: null } }]">Contact</a>
```

```typescript
closePopup() {
  // Providing a `null` value to the named outlet
  // clears the contents of the named outlet
  this.router.navigate([{ outlets: { popup: null }}]);
}
```

更多的細節，可以參考我準備稍微複雜的範例程式碼，[連結在此](https://stackblitz.com/edit/multi-router-outlet)

