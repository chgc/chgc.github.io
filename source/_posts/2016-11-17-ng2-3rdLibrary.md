---
layout: post
title: '[Angular2] 3rd Library的安裝筆記
comments: true
date: 2016-11-17 22:16:54
categories: Angular
tags: Angular2
---

Angular CLI要安裝第三方套件，看起來簡單，可是好像又有什麼地方需要設定，特此寫這篇方便以後查考

<!-- more -->
# 注意事項
- 如果是修正到angular-cli.json檔案時，需要重啟ng serve才會生效

# 套件

## Lodash

```text
npm install lodash --save
npm install @types/lodash --save-dev
```

在需要使用到lodash的component裡，還需要做import的動作

```typescript
import * as _ from 'lodash';
```

## Font Awesome

```text
npm install font-awesome --save
```
在Angular-cli.json下，將font-awesome的css及 font file都加進來

```json
"apps":[{
  ...
   "styles": [
              "../node_modules/font-awesome/css/font-awesome.css"
          ],
  ...
  }]
```

```json
 "addons": [
        "../node_modules/font-awesome/fonts/*.+(otf|eot|svg|ttf|woff|woff2)"
    ]
```

## hammer.js
angular materia 2 如果要使用 md-slide-toggle and md-slider, 需要額外再多安裝hammer.js

```text
npm install hammerjs --save
```

```json
"apps":[{
  ...
   "scripts": [
            "../node_modules/hammerjs/hammer.min.js"
        ]
  ...
  }]
```

## AngularFire2
```text
npm install firebase angularfire2 --save
```
