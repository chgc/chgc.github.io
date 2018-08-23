---
layout: post
title: '[Angular] Angular CLI - angular.json 檔說明'
comments: true
date: 2018-08-23 11:08:08
categories: Angular
tags: Angular
---

Angular CLI 6 版以後的設定檔大改版，現在終於有時間可以仔細看一下與了解內部是如何運行的。所以就讓我們來看一下 `angular.json` 檔案吧

<!-- more -->

# angular.json  設定檔 

##  基本設定

* `$schema` ：`angular.json` 定義檔的位置

* `version` ：`版本設定`

* `newProjectRoot`： 設定新專案產生的路徑位置

* `defaultProject`： CLI 指令預設執行的 project 名稱

* `projects`：各專案的設定檔設定位置，會在下面章節詳細說明

* `cli`：一些關於 CLI 設定

  ```json
  "cli": {
      "defaultCollection": "@ionic/schematics-angular",
      "packageManager": "yarn",
      "warnings": {
        "versionMismatch": false,
        "typescriptMismatch": false
      }
    }
  ```

  * `defaultCollection` ：指定預設使用的 `schematics` 範本
  * `packageManager` ：安裝 package 時要使用的套件管理工具，有 `npm`、`cnpm` 和 `yarn` 三種可以設定
  * `warnings` ：可設定是否要提示版本不符合的警示訊息
    * `versionMismatch` 全域 Angular CLI 版本與本地的版本不同時，是否要顯示提示訊息
    * `typescriptMismatch` TypeScript 版本不符合時，是否要顯示提示訊息

* `schematics`：`schematics` 範本命令預設參數設定位置

  ```json
  "schematics": {
      "@schematics/angular:component": {
        "changeDetection": 'OnPush'
      }    
    }
  ```

  * `schematics-package:schematics-name` : 可設定該命令可設定的預設值，以下是 `@schematics/angular` 常用可設定的命令 

  * `@schematics/angular:component`

    ```json
    {
        "inlineStyle": {
            "description": "Specifies if the style will be in the ts file.",
            "type": "boolean",
            "default": false,
            "alias": "s"
        },
        "inlineTemplate": {
            "description": "Specifies if the template will be in the ts file.",
            "type": "boolean",
            "default": false,
            "alias": "t"
        },
        "viewEncapsulation": {
            "description": "Specifies the view encapsulation strategy.",
            "enum": ["Emulated", "Native", "None"],
            "type": "string",
            "alias": "v"
        },
        "changeDetection": {
            "description": "Specifies the change detection strategy.",
            "enum": ["Default", "OnPush"],
            "type": "string",
            "default": "Default",
            "alias": "c"
        },
        "prefix": {
            "type": "string",
            "format": "html-selector",
            "description": "The prefix to apply to generated selectors.",
            "alias": "p"
        },
        "styleext": {
            "description": "The file extension to be used for style files.",
            "type": "string",
            "default": "css"
        },
        "spec": {
            "type": "boolean",
            "description": "Specifies if a spec file is generated.",
            "default": true
        },
        "flat": {
            "type": "boolean",
            "description": "Flag to indicate if a dir is created.",
            "default": false
        },
        "skipImport": {
            "type": "boolean",
            "description": "Flag to skip the module import.",
            "default": false
        },
        "selector": {
            "type": "string",
            "format": "html-selector",
            "description": "The selector to use for the component."
        },
        "module":  {
            "type": "string",
            "description": "Allows specification of the declaring module.",
            "alias": "m"
        },
        "export": {
            "type": "boolean",
            "default": false,
            "description": "Specifies if declaring module exports the component."
        }
    }
    ```

  * `@schematics/angular:directive`

    ```json
    {
        "prefix": {
            "type": "string",
            "format": "html-selector",
            "description": "The prefix to apply to generated selectors.",
            "default": "app",
            "alias": "p"
        },
        "spec": {
            "type": "boolean",
            "description": "Specifies if a spec file is generated.",
            "default": true
        },
        "skipImport": {
            "type": "boolean",
            "description": "Flag to skip the module import.",
            "default": false
        },
        "selector": {
            "type": "string",
            "format": "html-selector",
            "description": "The selector to use for the directive."
        },
        "flat": {
            "type": "boolean",
            "description": "Flag to indicate if a dir is created.",
            "default": true
        },
        "module":  {
            "type": "string",
            "description": "Allows specification of the declaring module.",
            "alias": "m"
        },
        "export": {
            "type": "boolean",
            "default": false,
            "description": "Specifies if declaring module exports the directive."
        }
    }
    ```

  * `@schematics/angular:module`

    ```json
    {
        "routing": {
            "type": "boolean",
            "description": "Generates a routing module.",
            "default": false
        },
        "routingScope": {
            "enum": ["Child", "Root"],
            "type": "string",
            "description": "The scope for the generated routing.",
            "default": "Child"
        },
        "spec": {
            "type": "boolean",
            "description": "Specifies if a spec file is generated.",
            "default": true
        },
        "flat": {
            "type": "boolean",
            "description": "Flag to indicate if a dir is created.",
            "default": false
        },
        "commonModule": {
            "type": "boolean",
            "description": "Flag to control whether the CommonModule is imported.",
            "default": true,
            "visible": false
        },
        "module":  {
            "type": "string",
            "description": "Allows specification of the declaring module.",
            "alias": "m"
        }
    }
    ```

  * `@schematics/angular:service`

    ```json
    {
        "flat": {
            "type": "boolean",
            "default": true,
            "description": "Flag to indicate if a dir is created."
        },
        "spec": {
            "type": "boolean",
            "default": true,
            "description": "Specifies if a spec file is generated."
        }
    }
    ```

  * `@schematics/angular:pipe`

    ```json
    {
        "flat": {
            "type": "boolean",
            "default": true,
            "description": "Flag to indicate if a dir is created."
        },
        "spec": {
            "type": "boolean",
            "default": true,
            "description": "Specifies if a spec file is generated."
        },
        "skipImport": {
            "type": "boolean",
            "default": false,
            "description": "Allows for skipping the module import."
        },
        "module": {
            "type": "string",
            "default": "",
            "description": "Allows specification of the declaring module.",
            "alias": "m"
        },
        "export": {
            "type": "boolean",
            "default": false,
            "description": "Specifies if declaring module exports the pipe."
        }
    }
    ```

  * `@schematics/angular:class`

    ```json
    {
        "spec": {
            "type": "boolean",
            "default": true,
            "description": "Specifies if a spec file is generated."
        }
    }
    ```


## 專案設定

Angular CLI 6.x 針對多專案的設定方式，有很大的改變，但彈性也相對的自由。以下為設定說明 

* `root`：專案根目錄
* `sourceRoot`：專案檔案的位置，如靜態檔案， `index.html` 等
* `projectType`：專案類型，有 `application` 與 `library` 兩種
* `prefix`：selector 的 prefix 設定，預設 `app`
* `schematics`：`schematics` 範本命令預設參數設定位置，設定方式如最上層的 schematics 設定
* `architect`：建置、測試等執行指令設定
  * `targetName` 命令名稱
    * `builder`  命令會使用的 builder 名稱，`package-name:builder-name`
    * `options` builder 所需要的執行參數設定
    * `configurations` 延伸 builder 參數設定
      * `configurationName` 參數設定

###  CLI 指令執行流程

```json
 "build": {
     "builder": "@angular-devkit/build-angular:browser",
     "options": {
         "progress": false,
         "outputPath": "www",
         "index": "src/index.html",
         "main": "src/main-user.ts",
         "polyfills": "src/polyfills.ts",
         "tsConfig": "src/tsconfig.app.json",
         "assets": [
             ...
         ],
             "styles": [
             ...
         ],
         "scripts": []
     },
     "configurations": {
         "production": {
             ...
         }
         }
     },
     "serve": {
         "builder": "@angular-devkit/build-angular:dev-server",
         "options": {
             "browserTarget": "app:build"
         },
         "configurations": {
             "production": {
                 "browserTarget": "app:build:production"
             }
         }
     }
```

當我們下 `ng serve` 的指令時，Angular CLI 實際執行命令的流程如下

1. 因為沒有指定 `project` 名稱，所以會使用 `defaultProject`  (預設為：`app`)
2. 執行 `ng run app:serve` 指令 。
   * `ng run projectName:architect-targetName:configuration-configurationName`
3. 因為 server  內的 options 的 `browserTarget` 設定使用 `app:build` 指令，還要看 `build` 指令所設定的內容
4. 完成指令動作

### 內建  builder

* [@angular-devkit/build-angular:app-shell](https://github.com/angular/angular-cli/blob/v6.0.0-rc.8/packages/%40angular/cli/lib/config/schema.json#L489-L520) 
* [@angular-devkit/build-angular:browser](https://github.com/angular/angular-cli/blob/v6.0.0-rc.8/packages/%40angular/cli/lib/config/schema.json#L521-L906)
* [@angular-devkit/build-angular:dev-server](https://github.com/angular/angular-cli/blob/v6.0.0-rc.8/packages/%40angular/cli/lib/config/schema.json#L907-L1028)
* [@angular-devkit/build-angular:extract-i18n](https://github.com/angular/angular-cli/blob/v6.0.0-rc.8/packages/%40angular/cli/lib/config/schema.json#L1029-L1064)
* [@angular-devkit/build-angular:karma](https://github.com/angular/angular-cli/blob/v6.0.0-rc.8/packages/%40angular/cli/lib/config/schema.json#L1065-L1267)
* [@angular-devkit/build-angular:protractor](https://github.com/angular/angular-cli/blob/v6.0.0-rc.8/packages/%40angular/cli/lib/config/schema.json#L1268-L1323)
* [@angular-devkit/build-angular:server](https://github.com/angular/angular-cli/blob/v6.0.0-rc.8/packages/%40angular/cli/lib/config/schema.json#L1324-L1518)
* [@angular-devkit/build-angular:tslint](https://github.com/angular/angular-cli/blob/v6.0.0-rc.8/packages/%40angular/cli/lib/config/schema.json#L1519-L1594)

# 結論

Angular CLI 新版的設定檔的架構，可以讓我們很容易的建立要執行的指令與工作流程，當然也可以自訂 `builder`，花點時間了解一下，在開發上會更順暢