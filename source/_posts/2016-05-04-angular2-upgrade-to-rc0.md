---
layout: post
title: "[Angular2]升級到RC"
comments: true
date: 2016-05-04 08:39
categories: Angular
tags: Angular2
---

Angular發佈RC了，來升級吧

<!-- more -->

[Changelog](https://github.com/angular/angular/blob/master/CHANGELOG.md#200-rc0-2016-05-02)

# 升級Angular2 RC

## NPM安裝命令

```
npm install --save @angular/core @angular/compiler @angular/common @angular/platform-browser @angular/platform-browser-dynamic rxjs@5.0.0-beta.6 zone.js@0.6.12
```

RC版本，將各Module都拆開了，這表示，可以只安裝自己需要的部分，就不用全部都包進來了

如果出現下面的畫面，更新npm後就可以修正問題了

![](https://farm8.staticflickr.com/7123/26802139945_49ab0ab1c8_o.png)

## 修改import namespace

例如

- `angular2/core` -> `@angular/core`
- `angular2/compiler` -> `@angular/compiler`
- `angular2/common` -> `@angular/common`
- `angular2/platform/browser` -> `@angular/platform-browser` (applications with precompiled templates) + `@angular/platform-browser-dynamic` (applications that compile templates on the fly)
- `angular2/platform/server` -> `@angular/platform-server`
- `angular2/testing` -> `@angular/core/testing` (it/describe/..) + `@angular/compiler/testing` (TestComponentBuilder) + `@angular/platform-browser/testing`
- `angular2/upgrade` -> `@angular/upgrade`
- `angular2/http` -> `@angular/http`
- `angular2/router` -> `@angular/router-deprecated` (snapshot of the component router from beta.17 for backwards compatibility)
- new package: `@angular/router` - component router with several [breaking changes](https://docs.google.com/document/d/1WLSNV3V1AKdwLwRiLuN7JqbPBKQ_S5quRlcT5LPIldw/edit#heading=h.blfh5ya9sf5r)


但是有些東西還是有換位置

- import { bootstrap }    from '@angular/platform-browser-dynamic'; -->'angular2/platform/browser';
- import { APP_BASE_HREF } from '@angular/common'; --> from 'angular2/http'

## 更新其他有用到ng2的Library

這部分可能會有些問題，因為RC是近期的發佈的，有可能部分的Library還沒有跟著更新，所以在使用上會出現問題。

## 更新Build tool config if need

ex: Webpack

## 測試升級後的結果

# 語法調整

## *ngFor (change in 2.0.0-beta.17)

```javascript
// 原本的ngFor用法為
*ngFor="#item of items"
// 修正為
*ngFor="let item of items"
```

## Pipe (change in 2.0.0-beta.16)

針對Argument的處理方式改變

```javascript
//原本的
 transform(todos, args) {        
    // 傳進來的args為array
    ...       
}
// 升級後
transform(todos, args) { 
  // 傳進來的args變成傳給他什麼就是什麼
  ...
}
    
```

