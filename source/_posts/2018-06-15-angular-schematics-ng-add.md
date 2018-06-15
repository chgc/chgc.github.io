---
layout: post
title: '[Angular] 如何寫出一個可以被 ng add 使用的 schematics?'
comments: true
date: 2018-06-15 10:09:00
categories: Angular
tags: Angular
---

Angular CLI 6 新增了一個指令 `ng add <library>` ，我們可以透過這個指令來安裝各式各樣的 schematics 套件，進而擴充 Angular CLI 的功能。如果想要寫一個自己的 schematics 又可以透過 `ng add` 來安裝。這一篇文章的內容或許是一個開始

<!-- more -->

# Angular CLI

`schematics` 可以視為一個指令產生範本的任務集合，所以 Angular CLI 也是透過指令的方式去執行某一個 schematics 裡面的某一個動作。所以在開始寫之前，須了解 Angular CLI 的 ng add 到底做了哪些動作

預設 CLI 所使用的命令清單中，有一個 `add.ts` ，這個命令就是這次的主角，他的執行步驟有

1. 檢查 ng add 後面使否有輸入引述，需要提供要安裝的套件名稱

2. npm install 套件

3. 解析是否有相關設定引數是要給 schematics 命令使用的

4. 建立執行命令設定

   ```typescript
      const runOptions = {
         schematicOptions: options, 
         workingDir: this.project.root,
         collectionName, // 集合名稱
         schematicName: 'ng-add', // 執行命令
         allowPrivate: true,
         dryRun: false, // 實際產生檔案
         force: false,
       };
   ```

5. 執行 schematics 命令

# 自訂 Schematics

根據上面的執行命令，可以得知 CLI 的 ng add 是會執行 `ng-add` 的指令，所以只要在自己的 schematics collection 內新增 ng-add 就可以了，但在哪之前，先建立一個全新空的 schematics 吧

1. 如果沒有安裝 schematics CLI 的，可以透過這指令安裝

   ```
   npm install -g @angular-devkit/schematics
   ```

2. 安裝完成後，可以執行 `schematics --help` 看看有沒有安裝成功

   ![](https://i.imgur.com/88xzjTx.png)

3. 建立空的 schematics 

   ```
   schematics blank <yourSchematicsName>
   ```

   ![](https://i.imgur.com/FD8AtPV.png)

4. 進入剛剛建立好的資料夾內，eg `/postDemo`

5. 打開熟悉的編輯器，並修改以下內容

   1. `collection.json`，將原本的指令興改成 `ng-add`

      ```json
      {
        "$schema": "../node_modules/@angular-devkit/schematics/collection-schema.json",
        "schematics": {
          "post-demo": {
            "description": "A blank schematic.",
            "factory": "./post-demo/index#postDemo"
          }
        }
      }
      // 修改成
      {
        "$schema": "../node_modules/@angular-devkit/schematics/collection-schema.json",
        "schematics": {
          "ng-add": {
            "description": "A blank schematic.",
            "factory": "./ng-add/index#ngAdd"
          }
        }
      }
      ```

      * factory 後面內容的 `#ngAdd` 是指要執行的 function

   2. 將原本的 `post-demo` 資料夾名稱修改成 `ng-add`

   3. 將 `ng-add/index.ts` 檔案裡的 function 名稱修改成 `ngAdd`

   到這裡已經完成 CLI 執行 ng-add 的基本型，再來就是可以把想要在 `ng add` 時要做的工作寫在這邊就可以了

   

# 加碼補充

Angular CLI 的另外一個指令 `ng update` ，做法類似，詳細的設計可以參考 Angular Material 2 的 schematics update，[source code](https://github.com/angular/material2/blob/master/src/lib/schematics/update/update.ts)

![](https://i.imgur.com/e0hmtRV.png)

# 參考資料

* [ngcli-wallaby](https://github.com/chgc/ngcli-wallaby)
* [Angular Material 2](https://github.com/angular/material2/blob/master/src/lib/schematics/update/update.ts)
* [schematics README](https://github.com/angular/angular-cli/blob/master/packages/schematics/schematics/blank/project-files/README.md)