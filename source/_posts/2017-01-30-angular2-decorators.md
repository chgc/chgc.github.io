---
layout: post
title: '[Angular] 自訂Decoorators'
comments: true
date: 2017-01-30 15:49:52
categories: Angular
tags: Angular
---

Decorators 是 function 掛有 `@`前綴符號，可以用於 `class`、`paramemter`、`method` 或 `property`的前面。用來提供額外的資訊。

Angular也將Decorators的功能，應用於本身的架構內，例如 `@Component`、`@NgModule`等，本篇文章會討論如果我們也想要自訂Decorators時，我們要怎麼去實作。

<!-- more -->

# 自訂Decorator

就如前言所說的，Decorator是一個function, 如果要使用他時，可以在 class/parameter/method/property前面使用 `@<function>` 就可以了。

一個基本的Decorator會長這樣子

```typescript
export function myDecorator(target){
   ....
}
```

而使用他的方式如下

```typescript
import { myDecorator } from '...';

@myDecorator
export class class1{
  ....
}
```

以上就是最基本的使用方式，在decorator的 target 參數，會取得使用者的class/parameter/method/property的程式碼內容

# 應用情境

## Property Decorators

```typescript
export function ReadOnly(defaultValue) {
    return (target, key: string) => {
        target[key] = defaultValue;
        Object.defineProperty(target, key, { writable: false });
    }
}

@Component({
  ....
})
export class AppComponent {
  @ReadOnly("app works!")
  title: string;

  changeTitle() {
    this.title = 'change app title';
  }
}
```

這個例子，是自訂一個ReadOnly的Decorator，功能是讓所設定到的屬性有預設值並且是唯讀狀態, 無法被修改。

如果試著去修改該屬性，如 #16行要做的事情，就會發生錯誤訊息

![](https://farm1.staticflickr.com/767/31761591604_72a01010a5_o.png)



## Class Decorators 

如果將Decorators應用在Class上，我們就可以改寫/擴充constructor的行為

```typescript
export function log(prefix?: string) {
    return (target) => {
        // save a reference to the original constructor
        var original = target;

        // a utility function to generate instances of a class
        function construct(constructor, args) {
            var c: any = function () {
                return constructor.apply(this, args);
            }
            c.prototype = constructor.prototype;
            return new c();
        }

        // the new constructor behavior
        var f: any = function (...args) {
            console.log(prefix + " - " + original.name);
            return construct(original, args);
        }

        // copy prototype so instanceof operator still works
        f.prototype = original.prototype;

        // return new constructor (will override original)
        return f;
    };
}
```

```typescript
@log("hello world")
@Component({
  ...
})
export class AppComponent {
  ...
}
```

輸出結果

![](https://farm1.staticflickr.com/445/32226359900_be1f10ac0c_o.png)

# 現有Library有使用自訂Decorators的

* [ngrx/effects](https://github.com/ngrx/effects)

  ngrx/store搭配 effects套件，讓angular內在設定redux動作時，變得比較直覺，程式碼也精簡很多

{% youtube Rw9ZQW2z0M8 %}



# 心得

Decorators真的很強大，但是就目前這個階段，我尚未想到到底在哪種情境下是可以使用的，但是早一點知道這個東西的存在也好，因為實作上並不複雜，只是不知道在何時何地會用到他。




# 參考文件

* [ngAir 90 - ngrx with Mike Ryan](https://youtu.be/Rw9ZQW2z0M8)
* [Decorators](https://angular-2-training-book.rangle.io/handout/features/decorators.html)
* [A deep dive on Angular decorators](https://toddmotto.com/angular-decorators)