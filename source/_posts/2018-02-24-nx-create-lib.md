---
layout: post
title: '[Angular] Nx 命令篇 - 建立 Lib'
comments: true
date: 2018-02-24 18:10:06
categories: Angular
tags: Angular
---

建立 App 是小事，真正重頭戲是建立 Libs，在 Nx 所提供的架構下，所有的 `NgModule`、`Serivces`、`Utility` 都是放在 Libs 資料夾下，所以建立 libs 的參數相對的多，影響的範圍比較廣，在這篇文章會稍微整理一下

<!-- more -->

# 參數

Nx 建立 Lib 指令後面可使用的參數有

* **name** ： Library 名稱

* **directory**：如果有設定 directory，application的建立路徑為 `<<directory name>>/<<library name>>` 如果沒有設定，建立路徑則是 `<<library name>>`

* **sourceDir**：設定程式碼的存放路徑，這個會接在設定的 `directory` 之後，完整的設定規則如下

  ```typescript
    const name = toFileName(options.name);
    const fullName = options.directory ? `${toFileName(options.directory)}/${name}` : name;
    const fullPath = `libs/${fullName}/${options.sourceDir}`; // 程式碼最終輸出位置
  ```

* **nomodule**：建立一個沒有 NgModule 的 library

* **routing**：需產生路由設定檔

* **lazy**：設定為 lazyloading 的 NgModule

* **parent-module**：將建立的 Library import 到某一個 NgModule 內，需指定所要注入的 NgModule 實際的檔案位置

# 建立 Library

預設建立 Library 都會以 `NgModule` 的方式呈現，這表示，任何所建立的 Library 都會是一個 NgModule，以方便 import 到其他 Module 內。當然也可以設定 `--nomodule` 即可建立沒有 NgModule 的 library

![](https://i.imgur.com/Bv1lSnR.png)

所建立的 library 都會放到 `libs` 資料夾下，這時會發現 Nx 有多產生一個 index.ts 檔案，而這一個 index.ts 檔案會 export NgModule 的內容，之所以會這樣子設定，是方便我們在其他地方進行 imports 時，只需要指到 library 的最上層位置，即可取得內部所開放出來的所有功能，例如 `import { ... } from '@nxdemo/backend'`

此外，Nx 並會在 `.angular-cli.json` 的 `apps` 區塊新增此 library 的相關資訊

![](https://i.imgur.com/K3qt59i.png)

這個動作的用意，這方便我們使用 Angular CLI 的 generator 功能，Angular CLI generator 可以指定所產生的範本是要輸出到哪一個 apps 下

```
ng g service ticket -a=backend
```

上列的指令就可以在剛剛建立的 `BackendModule` 裡，新增一個 `ticket service`

## NgModule with routing

我們也可以透過 `--routing` 的參數，來產生一個含有路由設定檔的 NgModule

```
ng g lib account --routing
```

所產生的 NgModule 會長這樣

![](https://i.imgur.com/dGnzb6A.png)

會建立一個路由設定檔，並注入 `RouterModule` 而上一層的 `index.ts` 檔案內，也同時會輸出路由設定檔

![](https://i.imgur.com/KNin2x1.png)

這個動作允許其他 NgModule 可以很容易地取得目前 NgModule 內的路由設定檔

## parentModule 設定

`parentModule` 參數的設定，可以將目前要建立的 library 注入到其他 NgModule 裡

```
ng g lib profile-setting --routing --parent-module=apps/client/dashboard/src/app/app.module.ts
```

`--parent-module` 需要指定所要注入的 NgModule 實際的檔案位置

![](https://i.imgur.com/XLhW7bg.png)

同時也會將所建立的路由設定檔加入到設定的 `parent-module` 的路由設定檔內

![](https://i.imgur.com/u1qEYBq.png)

## lazy

如果多加上 `--lazy` 的參數時，在更新 `parent-module` 路由檔的方式就會有所差異，而且更新的檔案數量也比較多

![](https://i.imgur.com/jIu3I6e.png)

`parent-module` 的路由設定檔會採 `loadChildren` 的方式將該 NgModule 載入

![](https://i.imgur.com/KUrjeux.png)

因為 `lazy` 的關係，新增的 NgModule 路由設定檔的呈現方式也會有所不同，會直接以 `RouterModule.forChild([])` 的方式呈現

```typescript
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      /* {path: '', pathMatch: 'full', component: InsertYourComponentHere} */
    ])
  ]
})
export class ProfileSettingModule {}

```

* `tslin.json` 檔案也會被異動，會將 lazy load module 新增到 `lazyload` 陣列中以避免該 module 以非 lazy load 的方式被載入

  ```json
   "nx-enforce-module-boundaries": [
        true,
        {
          "lazyLoad": [
            "profile-setting"
          ],
          "allow": []
        }
      ]
  ```

## nomodule

要產生一個簡單的 TypeScript library 時，只要加上 `--nomodule`即可

```
ng g lib helper --nomodule
```

![](https://i.imgur.com/ni4NQDs.png)



# 總結

透過以上建立的方式，可以重新思考 `Feature module`  的規劃方式，也可以將一些與 Angular 無關的商業邏輯獨立成單一 Library，以便之後的重複利用性



# 延伸閱讀

* [Feature Modules](https://angular.io/guide/feature-modules)
* [Lazy Loading Feature Modules](https://angular.io/guide/lazy-loading-ngmodules)