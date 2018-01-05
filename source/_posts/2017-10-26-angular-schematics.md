---
layout: post
title: '[Angular] Angular Schematics'
comments: true
date: 2017-10-26 09:28:12
categories: Angular
tags: Angular
---

Angular CLI 1.4 版以後，樣板的產生器就改使用 `@angular-devkit/schematics` ，而在 10 月初，`Nrwl.io` 也推出 nx 版的 schematics 樣版集合，所以什麼是 `schematics` ，我們可以利用他來做什麼樣的事情呢?

<!-- more -->

# 簡介

`@angular/schematics` 是包含在 `@angular/devkit` 內，他是一個定義樣板的架構，類似 ember cli 內的 blueprint，利用 json 設定檔及預設的檔案範本，可以利用指令產生出我們所設定的檔案內容

`schematics` 有分兩個部分，`@angular-devkit/schematics` 屬於 runner，而 `@schematics/angular` 屬於範本集合 (Angular CLI 所使用的範本集合)。

![](https://i.imgur.com/XODMSSU.png)

# 架構

## collection.json

如之前所說，`schematics` 是一個集合，所有的定義項目都可以在 `collection.json` 內看到，也可以說是集合的進入點

```json
{
  "schematics": {
    "application": {
      "factory": "./application",
      "schema": "./application/schema.json",
      "description": "Create an Angular application."
    },
    "class": {
      "aliases": [ "cl" ],
      "factory": "./class",
      "description": "Create a class.",
      "schema": "./class/schema.json"
    },
    "component": {
      "aliases": [ "c" ],
      "factory": "./component",
      "description": "Create an Angular component.",
      "schema": "./component/schema.json"
    },
    ...
  }
}
```

`collection.json` 檔案的第一層是 `schemtaics`，在這一個節點下，就是各指令的定義檔，例如 `application`、`class` 或 `component` 等，都會對應一個資料夾

以 `class` 為例

```json
 "class": {
      "aliases": [ "cl" ],
      "factory": "./class",
      "description": "Create a class.",
      "schema": "./class/schema.json"
    },
```

* aliases: 指令的縮寫，例如 `ng generate class` 也可以使用縮寫代替 `ng generate cl`
* factory: 所有的邏輯存放的所在地
* description: 資訊描述
* schema: 參數設定檔

## schema.json

進入 `class` 資料夾，並開啟 `schema.json` 檔案，內容如下

```json
{
  "$schema": "http://json-schema.org/schema",
  "id": "SchematicsAngularClass",
  "title": "Angular Class Options Schema",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "appRoot": {
      "type": "string"
    },
    "path": {
      "type": "string",
      "default": "app"
    },
    "sourceDir": {
      "type": "string",
      "default": "src"
    },
    "spec": {
      "type": "boolean",
      "description": "Specifies if a spec file is generated.",
      "default": false
    },
    "type": {
      "type": "string",
      "description": "Specifies the type of class.",
      "default": ""
    }
  },
  "required": [
    "name"
  ]
}

```

在 `properties` 下可以定義所有的變數的型別、描述及預設值，`requried` 設定必須輸入的欄位

## index.ts

 `index.ts` 檔案會是 `factory` 所指定的資料夾下首先會被執行的檔案

```typescript
import { Schema as ClassOptions } from './schema';
```

`Schema` 是針對 `schema.json` 的 properties 區塊定義項目的介面檔，主要功能是提供 `index.ts` 內使用

```typescript
export interface Schema {
    name: string;
    appRoot?: string;
    path?: string;
    sourceDir?: string;
    /**
     * Specifies if a spec file is generated.
     */
    spec?: boolean;
    /**
     * Specifies the type of class.
     */
    type?: string;
}
```

基本架構

```typescript

export default function (options: ClassOptions): Rule {
  options.type = !!options.type ? `.${options.type}` : '';
  options.path = options.path ? normalize(options.path) : options.path;
  const sourceDir = options.sourceDir;
  if (!sourceDir) {
    throw new SchematicsException(`sourceDir option is required.`);
  }
  // 範本存放的位置
  const templateSource = apply(url('./files'), [
    options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
    // 建立範本
    template({
      ...stringUtils,
      ...options as object,
    }),
    // 移動建立後的檔案到指定的位置
    move(sourceDir),
  ]);

  // 合併新建立的檔案與既有檔案
  return chain([
    branchAndMerge(chain([
      mergeWith(templateSource),
    ])),
  ]);
}
```

## files  資料夾

會看到 `__name@dasherize____type__.ts` 的檔案，這裡看到的 `__name` (兩個底線) 會對應到 `schema.json`  properties 所定義的變數名稱 `name` ，同樣的 `__type` 也相對應於 `type` 的參數，同樣的規則，是用於資料夾名稱

![](https://i.imgur.com/iZ83a3z.png)

`@dasherize` 是一個函式，接受後面的引數並處理後回結果，這段的效果等同於 `dasherize(type)`

但實際的傳入的值是透過 `index.ts` 內的 `template` 傳入的參數集合 (如下註解)

```typescript
template({
      ...stringUtils,
      ...options as object, // 傳入的參數集合
    }),
```

在該檔案內的內容，可以看到 `name` ，同樣的代表的 `name` 變數

```typescript
export class <%= classify(name) %> {
}
```

`classify` 函式的效果是將 `someFunction` 主換成 `SomeFunction`

# 自訂 schematics 集合 

目前最快的方式，是直接複製 @schematics/angular 來改，但其實 @angular/dev-kit 有提供命令的方式來建立~~(還在研究中，等研究出來後在寫另外一篇文章分享)~~ 請參考下一段

```
$ cd ~/n/lib/node_modules/@angular/cli/node_modules/ (angular cli 全域的安裝位置)
$ mkdir -p @custom/myangular
$ cp -R @schematics/angular/* @custom/myangular/ 
```

上述的指令，等同於直接在全域的 Angular CLI 下建立一個新的 schematics 範本集合

當在執行 `ng new` 時，可以加上 `--collection` 來設定要使用的 schematics

```
ng new --collection=@custom/myangular myapp
```

# 創建 schematic

@angular/dev-kit 有提供建立的指令，在這之前需先安裝三個工具

```
npm i -g @angular-devkit/schematics
npm i -g @schematics/schematics
npm i -g rxjs
```

安裝完成後，即可透過 `schematics` 的指令建立範本集，預設有兩種範本 `blank` 和 `schematic` 。建立指令

```
// schematic template
schematics @schematics/schematics:schematic --name <<collection name>>
// blank template
schematics @schematics/schematics:blank --name <<collection name>>
```

建立後的專案結構

![](https://i.imgur.com/hN4xSJq.png)

之後就可按上面所介紹的方式建立自己的範本，當然也可參考其他人的 schematics ，例如 `nx` 或是 `ngrx`，我相信之後會有更多各式各樣的範本出來

# 參考資料

* [ngAir 134 - Angular Schematics with Mike Brocchi](https://youtu.be/ZKyz0lb0GjA)
* [angular/devkit](https://github.com/angular/devkit)
* [ngrx schematic](https://github.com/ngrx/schematics-builds)