---
layout: post
title: '[Angular] 啟用 strictNullChecks'
comments: true
date: 2017-04-13 13:58:03
categories: Angular
tags: 
 - Angular
 - Typescript
---

Typescript 2.0 新增了一個功能 `strictNullChecks` ，這一功能的主要目的是將 `null` 與 `undefined` 視為不同的型別。在這個選項啟動時， Typescript 會去檢查所有有可能發生 `null` 的程式碼，在下面會看到當開啟時，需要調整的項目有哪些。這樣的嚴謹模式，可以大大的降低一些例外的發生

而 Angular 所使用的 Typescript 版本也是 2.0 以後的版本，爾當然支援這樣的功能，以下我就拿一個手上練習的專案將該功能該起後，所遇到的一些狀況跟解決方式。

<!-- more -->

# 前言

> # Null- and undefined-aware types
>
> TypeScript has two special types, Null and Undefined, that have the values `null` and `undefined` respectively. Previously it was not possible to explicitly name these types, but `null` and `undefined` may now be used as type names regardless of type checking mode.
>
> The type checker previously considered `null` and `undefined` assignable to anything. Effectively, `null` and `undefined` were valid values of *every* type and it wasn't possible to specifically exclude them (and therefore not possible to detect erroneous use of them).



# Angular 環境設定

在 `tsconfig.json` 內開啟 strictNullChecks 功能，由於 Angular 主程式內還有部分的程式碼還沒有辦法通過 `strictNullChecks` 的檢查，所以必須再多開啟 `skipLibCheck` 的選項

```json
{
    "compileOnSave": false,
    "compilerOptions": {
        ...
        "strictNullChecks": true,
        "skipLibCheck": true,
        ...
    }
}
```



# 檢查開始

當執行 `npm start` 時，Typescript 就會開始做檢查的動作了，在最近更新的 Visual Studio Code 支援從 Terminal 直接開啟該檔案的功能，`Ctrl + Click`  就可以開啟了。

第一次的檢查，會跳出很多紅色的錯誤。就一個一個看吧


## 錯誤 1: Type any[] is not assignable to type never[]

![](https://farm4.staticflickr.com/3839/33966106616_47d4595064_o.png)

圖片中的 errMessage 是發生錯誤的地方。造成這個錯誤的原因是 errMessage 在定義時，並沒有宣告型別，而是直接給予一個空陣列。

![](https://farm3.staticflickr.com/2870/33878082021_5228371f40_o.png)

**修正方式 :**  明確的給予型別，即可修正此類型的錯誤

```typescript
let errMessage: string[] = [];
for (const prop in obj) {
  if (obj.hasOwnProperty(prop)) {
    if (Array.isArray(obj[prop])) {
      errMessage = [...errMessage, ...obj[prop]];
    }
  }
}
```

 

## 錯誤 2: Argument of Type .... is not assignable to type '..'

![](https://farm4.staticflickr.com/3942/33966175946_d3fb790e8a_o.png)

![](https://farm3.staticflickr.com/2825/33966186516_b0bca33e9c_o.png)

這裡的 AuthConfig 接受的參數型別是 `IAuthConfigOptional`，而程式碼裡所傳入的 Object 並未指定型別。

![](https://farm3.staticflickr.com/2819/33966196546_d41c75867c_o.png)

**修正方式 :** 給予正確的型別

```typescript
return new AuthHttp(new AuthConfig(<IAuthConfigOptional>{
        tokenName: 'token',
        noJwtError: true,
        tokenGetter: (() => localStorage.getItem('token')),
    }), http, options);
```



## 錯誤 3: Object is possibly null

![](https://farm3.staticflickr.com/2848/33878182561_27142d36fe_o.png)

在這裡的錯誤訊息是指，這段程式碼有可能因為某一個Object是 null 時，後續的程式碼就無法繼續下去，所以必須先排除 null 的狀態，才能確保後續的動作是正常的。而這個行為，在 Typescript 2.0 稱為 `Control flow based type analysis` [^2]

[^2]: TypeScript 2.0 implements a control flow-based type analysis for local variables and parameters. Previously, the type analysis performed for type guards was limited to `if` statements and `?:` conditional expressions and didn't include effects of assignments and control flow constructs such as `return` and `break` statements. With TypeScript 2.0, the type checker analyses all possible flows of control in statements and expressions to produce the most specific type possible (the *narrowed type*) at any given location for a local variable or parameter that is declared to have a union type.

這裡有幾種修正方式

1.  告訴 Typescript, 這裡有可能發生 null 的 Object 是不會有 null 值的情形，需使用 `!`  [^1]

```typescript
    const number = this.document.body.scrollTop;
           if (number > 130) {
               this.document!.getElementById('control-panel')!.classList.add('panel-fixed');
           } else {
               this.document!.getElementById('control-panel')!.classList.remove('panel-fixed');
           }           
```


2.  根據 Type 來控制流程

```typescript
   if (this.document === null) {
     return;
   }
   const number = this.document.body.scrollTop;
   const panel = this.document.getElementById('control-panel');
   if (panel === null) {
     return;
   }
   if (number > 130) {
     panel.classList.add('panel-fixed');
   } else {
     panel.classList.remove('panel-fixed');
   }
```

## 錯誤4: Type 'null' is not assignable to type 'file | undefined'

![](https://farm3.staticflickr.com/2937/34007884075_3ffb7190eb_o.png)

**修正方式 :** 這個錯誤其實很簡單，就是不要指定 null 到變數上即可


```typescript
photo.file = undefined;
```



# 結論

透過這一系列的型別設定檢查，雖然在開發時期，因為型別的指定會降低開發的速度，可是當系統越來越龐大時，可以在開發時期確保程式不會壞掉。就投報率的角度來說，是非常值得投資的。



# 參考資料

[TypeScript 2.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html)



[^1]: A new `!` post-fix expression operator may be used to assert that its operand is non-null and non-undefined in contexts where the type checker is unable to conclude that fact. Specifically, the operation `x!` produces a value of the type of `x`with `null` and `undefined` excluded. Similar to type assertions of the forms `<T>x` and `x as T`, the `!` non-null assertion operator is simply removed in the emitted JavaScript code.