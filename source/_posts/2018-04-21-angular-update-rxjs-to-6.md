---
layout: post
title: '[Angular] 如何從 RxJS 5.x 升級至 RxJS 6?'
comments: true
date: 2018-04-21 09:06:01
categories: Angular
tags: Angular
---

RxJS 6 提供了更便利的 import 方式，而且套件檔案變小，也可以被 tree-shaking. 但是要如何快速地將 RxJS 5.x 版升級到 RxJS 6 版 ? 以下是升級步驟

<!-- more -->

1. 升級 RxJS 至 5.5,1 (最新版)

2. 更新至 RxJS 6

   1. RxJS 6 正式版尚未釋出時
      1. `npm install rxjs@rc`
      2. `npm install rxjs-compat@rc` 這套件的功能是讓 RxJS 6 可以向下相容
   2. RxJS 6 正式版釋出後
      1. `npm install rxjs`
      2. `npm install rxjs-compat `
   3. 使用 Angular CLI 6 1 
      1. `ng update rxjs`

3. `npm install rxjs-tslint`

4. 建立 `migrate.tslint.json`

   ```json
   {
     "rulesDirectory": ["node_modules/rxjs-tslint"],
     "rules": {
       "update-rxjs-imports": true,
       "migrate-to-pipeable-operators": true,
       "collapse-rxjs-imports": true
     }
   }
   ```

5. 執行 tslint-fix (可能需要多跑幾次)

    `./node_modules/.bin/tslint -c migrate.tslint.json --project src/tsconfig.app.json --fix`

6. 修正 `tslint.json`，將 `rxjs` 從 `"import-blacklist"` 中移除

7. 移除 `rxjs-compat`

8. 建置整個專案確定升級成功

9. 完成整個升級 RxJS