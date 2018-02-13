---
layout: post
title: '[Angular] Nx 環境設定介紹'
comments: true
date: 2018-02-13 20:47:34
categories: Angular
tags: Angular
---

上一篇 Nx 介紹了如何安裝工具及可執行的指令，這一篇來介紹一下 workspace 的架構

<!-- more -->

# Workspace 架構

Nx 預設的專案架構有兩個空的資料夾，分別為 `apps` 與 `libs`

![](https://i.imgur.com/CMu4Pqo.png)

而我們熟悉的 CLI 專案，則會透過建立 app 的指令產生再 apps 的資料夾下，指令如下

```
ng g app <<application name>>
```



![](https://i.imgur.com/9mJrRqD.png)

執行完指令，Nx 會產生一系列預設的檔案，及更新 `.angular-cli.json` 檔案，產生出來的檔案就是我們很熟悉的 CLI 專案有的相關檔案

![](https://i.imgur.com/JGVdgov.png)



# 設定檔

## angular-cli.json

當打開 `.angular-cli.json` 時，會發現內容與 Angular CLI 所產生的設定檔，有些許的不一樣，就一一來解釋

```json
{
    "$schema": "./node_modules/@nrwl/schematics/src/schema.json",
    ...
}
```

這一行是設定此 JSON 格式描述檔的位置，由於 Nx 是一個多 App 的開發環境，所以在設定上當然會與常見的設定檔內容會有所不同

```json
{
    ...
    "project": {
    "name": "nxdemo",
    "npmScope": "nxdemo",
    "latestMigration": "20180130-angular-devkit-schematics"
  },
  ...
}
```

描述專案的資訊

1. 專案名稱
2. Libs 的 npm namespace 名稱
3. Nx 的版本，在之後做升級時比較使用

```json
{
    ...
    "defaults": {
    "schematics": {
      "collection": "@nrwl/schematics",
      "postGenerate": "npm run format",
      "newProject": [
        "app",
        "lib"
      ]
    },
    ...
}
```

`defaults` 區塊所描述的資訊有

1. 指定要使用的 `schematics` 
2. 當產生檔案後要執行的檔案
3. 當建立新專案時，要執行的 collection 名稱

另外是，當新增 app 時，會 apps 內新增 app 的相關資訊

```json
{
    ...
    "apps": [
    {
      "name": "app-one",
      "root": "apps/app-one/src",
      "outDir": "dist/apps/app-one",
      "assets": [
        "assets",
        "favicon.ico"
      ],
      "index": "index.html",
      "main": "main.ts",
      "polyfills": "polyfills.ts",
      "test": "../../../test.js",
      "tsconfig": "tsconfig.app.json",
      "testTsconfig": "../../../tsconfig.spec.json",
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
  ]
    ...
}
```

## tsconfig.json

在初始時，`tsconfig.json` 內會包含一個路徑別名的設定，這一行的設定會讓我們在使用模組時，簡化注入時要標示的來源路徑

```json
 "paths": {
      "@nxdemo/*": [
        "libs/*"
      ]
    }
```



## tslint.json

在 `tslint.json` 的最後也多加上了這一個檢查條件，細部的功能會在後面介紹

```json
"nx-enforce-module-boundaries": [
      true,
      {
        "lazyLoad": [],
        "allow": []
      }
    ]
```



## package.json

多新增了幾個 Nx 專屬的指令

```json
"apps:affected": "./node_modules/.bin/nx affected apps",
"build:affected": "./node_modules/.bin/nx affected build",
"e2e:affected": "./node_modules/.bin/nx affected e2e",
"affected:apps": "./node_modules/.bin/nx affected apps",
"affected:build": "./node_modules/.bin/nx affected build",
"affected:e2e": "./node_modules/.bin/nx affected e2e",
"format": "./node_modules/.bin/nx format write",
"format:write": "./node_modules/.bin/nx format write",
"format:check": "./node_modules/.bin/nx format check",
"nx-migrate": "./node_modules/.bin/nx migrate",
"nx-migrate:check": "./node_modules/.bin/nx migrate check",
"nx-migrate:skip": "./node_modules/.bin/nx migrate skip",
"postinstall": "./node_modules/.bin/nx migrate check"
```



# 延伸閱讀

* [Nx Workspace]https://nrwl.io/nx/guide-nx-workspace)