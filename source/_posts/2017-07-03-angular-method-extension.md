---
layout: post
title: '[Angular] Extension Method'
comments: true
date: 2017-07-03 10:55:12
categories: Angular
tags: Angular
---

如果有寫 C# 的人，多少都會寫到擴充方法(Extension Method) ，在 JavaScript 裡面也有雷同的功能，就是直接擴充 `prototype` 的功能，而 TypeScript 也同理，這裡整理 3 種擴充方法的寫法，並將擴充方法加入到 Angular 專案內使用

<!-- more -->

# 擴充

* 情境：要讓文字有可以直接轉述字型的功能，不想自己在寫 `parseFloat` 了

我目前想到的寫法有以下三種

## 寫法一 直接擴充 prototype

```typescript
String.prototype.toNumber = function():number {
      return parseFloat(this);
    }
```

這樣的寫法作為直接

## 寫法二 Object.assign

```typescript
Object.assign(String.prototype, {
  toNumber(): number {
    return parseFloat(this);
  }
});
```



## 寫法三 Object.defineProperty

```typescript
Object.defineProperty(String.prototype, 'toNumber', {
  value(): number {
    return parseFloat(this);
  }
})
```

使用這種方式，可以有更多的彈性來設定物件的功能。可參閱[API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)文件



# 加入至 Angular 專案中

以上的三種方式都可以達到目的，就依個人喜好選擇了。現在問題是，如何將寫好的擴充方法，加入至 Angular 專案裡。

基本上，只要有網站也載入該擴充功能，整個網站底層就會直接生效，但在開發時期，會遇到的錯誤提示是 `TypeScript` 編譯器不認識擴充的功能，這時候，就需要再 `typings.d.ts` 內加上所擴充的功能

```typescript
interface String {
  toNumber(): number;
}
```

當這樣子將擴充方法的定義補上後，TypeScript 編譯器就會認識我們所擴充的功能了，之後就是開心的寫程式了。



# 參考資料

* [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
* [Object.defineProperty()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)