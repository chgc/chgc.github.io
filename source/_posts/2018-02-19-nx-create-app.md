---
layout: post
title: '[Angular] Nx 命令篇 - 建立 App'
comments: true
date: 2018-02-19 09:01:44
categories: Angular
tags: Angular
---

Nx 工具提供兩個建立新範本的指令、`ng g app <<name>>` 和 `ng g lib <<name>>`，這一篇文章來看建立 application 的命令

<!-- more -->

# Create App

在建立 Application 時，可以有以下的參數可以使用

(注意：透過 `ng g app -h` 取得說明，其中有些參數是無法使用的)

* name (必填)：要建立的 Application 名稱
* npmScope
* directory：如果有設定 directory，application的建立路徑為 `{{direcotry}}/{{name}}` 如果沒有設定，建立路徑則是 `{{name}}` 
* sourceDir：預設值為 `src`，程式碼產生位置，例如: `apps/{{ directory }}/src`
* inlineStyle：設定使用 `inlineStyle`
* inlineTemplate：設定使用 `inlineTemplate`
* viewEncapsulation：設定 `viewEncapsulation`，可設定 `Emulated`、`Native` 和 `None`
* changeDetection：設定 `changeDetection`，可設定 `Default` 及 `onPush` ，預設值為 `Default`
* routing：產生 Routing 區段程式碼，例如 `<router-outlet></router-outlet>`
* skipTests：取消產生測試檔案
* prefix：設定 prefix 文字，預設值為 `app`
* style：設定 css 的檔案類型，預設值為 `css`

當建立 application 時，除了新增檔案外，還會異動 `.angular-cli.json` 檔案，異動區塊有 `lint` 及 `apps` ，本篇文章建立範例時所執行指令為

> ng g app dashboard --directory=client

* lint section

  ```json
  {
        "project": "apps/client/dashboard/src/tsconfig.app.json",
        "exclude": "**/node_modules/**"
      },
      {
        "project": "apps/client/dashboard/e2e/tsconfig.e2e.json",
        "exclude": "**/node_modules/**"
      }
  ```

* apps section

  ```json
  {
        "name": "client/dashboard",
        "root": "apps/client/dashboard/src",
        "outDir": "dist/apps/client/dashboard",
        "assets": [
          "assets",
          "favicon.ico"
        ],
        "index": "index.html",
        "main": "main.ts",
        "polyfills": "polyfills.ts",
        "test": "../../../../test.js",
        "tsconfig": "tsconfig.app.json",
        "testTsconfig": "../../../../tsconfig.spec.json",
        "prefix": "app",
        "styles": [
          "styles.css"
        ],
        "scripts": [],
        "environmentSource": "environments/environment.ts",
        "environments": {
          "dev": "environments/environment.ts",
          "prod": "environments/environment.prod.ts"
        }
      }

  ```

* 新增檔案清單

  ![](https://i.imgur.com/Ffwh3Wt.png)

  ![](https://i.imgur.com/xTJeuDQ.png)

* app.module.ts：預設載入 `NxModule.forRoot()`，預設注入 `DataPersistence` provider

  ```typescript
  @NgModule({})
  export class NxModule {
    static forRoot(): ModuleWithProviders {
      return { ngModule: NxModule, providers: [DataPersistence] };
    }
  }
  ```

  ​

# 延伸閱讀

* [DataPersistence](https://nrwl.io/nx/guide-data-persistence)