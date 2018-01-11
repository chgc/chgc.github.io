---
layout: post
title: '[Angular] 建立 Schematics Collection'
comments: true
date: 2018-01-11 11:13:09
categories: Angular
tags: Angular
---

之前的文章介紹了 Schematics，現在就來自己建立一個 Schematics collection，我們希望建立出來的 collection 可以保留原有 Angular CLI 的功能，並擴充自己想要的樣板

<!-- more -->

# 基本設定

1. 先建立一個資料夾

2. 新增 `package.json` 檔案，請依基本的 `npm` 專案方式設定，新增下列設定

   ```json
    "schematics": "./collection.json",
   ```

3. 建立 `collection.json` 檔案，並新增以下內容

   ```json
   {
     "schematics": {
       "class": {
         "aliases": ["cl"],
         "extends": "@schematics/angular:class"
       },

       "component": {
         "aliases": ["c"],
         "extends": "@schematics/angular:component"
       },

       "directive": {
         "aliases": ["d"],
         "extends": "@schematics/angular:directive"
       },

       "enum": {
         "aliases": ["e"],
         "extends": "@schematics/angular:enum"
       },

       "guard": {
         "aliases": ["g"],
         "extends": "@schematics/angular:guard"
       },

       "interface": {
         "aliases": ["i"],
         "extends": "@schematics/angular:interface"
       },

       "module": {
         "aliases": ["m"],
         "extends": "@schematics/angular:module"
       },

       "pipe": {
         "aliases": ["p"],
         "extends": "@schematics/angular:pipe"
       },

       "service": {
         "aliases": ["s"],
         "extends": "@schematics/angular:service"
       }
     }
   }
   ```

到這個步驟時，已經將 Angular CLI 既有的功能移植到我們的 collections 內了。接下來就將目前的檔案簽入到 GitHub 上，npm 可以設定 `devDependencies` 程式碼來源為 GitHub Repo，指定的方式是

```json
 "<<package name>>": "<<GitHub account>>/<<repo name>>",
```

在新的或是既有的 Angular 專案，只要 Angular CLI 版本是在 1.4 版以上，都可以設定 `collection`，可修改 `.angular-cli.json` 檔案，設定方式如下

```json
 "defaults": {    
    "schematics": {
      "collection": "<<package name>>" // 這裡指定你所安裝的 package 名稱
    }
   ...
  }
```

當完成以上步驟時，我們還是可以正常的使用 Angular CLI 的指令，但是觸發的指令清單是根據我們版本的 collection，不在是預設的範本了，換句話說，我們可以更換指令，例如說 ng g component 的縮寫，希望從 `c` 改成 `comp` ，這是可行的，只要修改 `collection.json` 對應的 `alias` 即可

```json
// 修改前
"component": {
      "aliases": ["c"],
      "extends": "@schematics/angular:component"
    },

// 修改後
 "component": {
      "aliases": ["comp"],
      "extends": "@schematics/angular:component"
    },
```

# 自訂範本

上一段我們完成沿用 Angular CLI 所提供的功能，現在要來製作自己的樣板了，基本的操作步驟是

1. 在 `collection.json` 內新增一個指令區塊

   ```json
   "feature":{
      "factory": "./src/feature",
     "schema": "./src/feature/schema.json",
     "description": "Create a feature module"
   }
   ```

2. 建立 `feature` 資料夾，並在資料夾內新增 `index.ts` 和 `schema.json` 兩個檔案

3. `schema.json` 內可設定建立 feature 時所需的參數，相對的也要建立 `schema.d.ts` 檔案

   ```json
   {
     "$schema": "http://json-schema.org/schema",
     "id": "SchematicsSchematicSchema",
     "title": "Schematic Options Schema",
     "type": "object",
     "properties": {
       "name": {
         "type": "string",
         "description": "The name for the new feature module."
       },
       "sourceDir": {
         "type": "string",
         "format": "path",
         "description": "The path of the source directory.",
         "default": "src",
         "visible": false
       },
       "prefix": {
         "type": "string",
         "format": "html-selector",
         "description": "The prefix to apply to generated selectors.",
         "alias": "p"
       },
       "selector": {
         "type": "string",
         "format": "html-selector",
         "description": "The selector to use for the component."
       }
     },
     "required": ["name"]
   }

   ```

   ```typescript
   export interface Schema {
     sourceDir?: string;
     /**
      * The name for the new feature module.
      */
     name: string;
     /**
      * The prefix to apply to generated selectors.
      */
     prefix?: string;
     /**
      * The selector to use for the component.
      */
     selector?: string;
   }

   ```

4. `index.ts` 內容

   ```typescript
   import {
     Rule,
     SchematicsException,
     apply,
     Tree,
     SchematicContext,
     branchAndMerge,
     chain,
     mergeWith,
     move,
     template,
     url
   } from '@angular-devkit/schematics';
   import * as stringUtils from '../strings';
   import { Schema as FeatureOptions } from './schema';

   function buildSelector(options: FeatureOptions) {
     let selector = stringUtils.dasherize(options.name);
     if (options.prefix) {
       selector = `${options.prefix}-${selector}`;
     }

     return selector;
   }

   export default function(options: FeatureOptions): Rule {
     options.selector = options.selector || buildSelector(options);
     const sourceDir = options.sourceDir;
     if (!sourceDir) {
       throw new SchematicsException(`sourceDir option is required.`);
     }

     return (host: Tree, context: SchematicContext) => {
       const templateSource = apply(url('./files'), [
         template({
           ...stringUtils,
           ...options
         }),
         move(sourceDir)
       ]);

       return chain([branchAndMerge(chain([mergeWith(templateSource)]))])(host, context);
     };
   }

   ```

5. 相關的程式碼請參閱 [GitHub Repo](https://github.com/chgc/demo-schematics)


