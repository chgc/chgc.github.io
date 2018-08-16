---
layout: post
title: '[Angular] Schematics 內檔案系統基本操作 '
comments: true
date: 2018-08-16 09:02:11
categories: Angular
tags: Angular
---

Schematics 跟檔案操作的元素有三種，分別是 `Tree`、`Rule`、`Source` ，但這三個元素到底是什麼? 又各自有哪些方法可以使用呢?

<!-- more -->

# 基本簡介

檔案系統的操作可以算是 Schematics 內核心的功能之一，也是大部分我們希望 schematics 幫我們處理的事情。所以熟悉 schematics 的檔案操作方式，在寫自己的 schematics 會輕鬆很多。

# 檔案系統操作

## 型別

* Tree： 是檔案系統的結構描述，包含檔案的狀態與改變檔案的規則 (`Rule`) 
* Source： 是一個建立空的新 `Tree`，常見的方法有 `Url(path)`
* Rule： 是描述要如何改變 `Tree`，所以 `Rule` 會回傳一個包含改變規則的 `Tree`

## 方法

### Tree

當第一次建立空的 schematics 時，會看到這一段程式碼

```typescript
export function blogdemo(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return tree;
  };
}
```

這裡取得的 `Tree` 會是當下的檔案系統，所以會包含目前目錄下的所有檔案與資料夾，當然也可以針對那些檔案去做操作，可使用的方法有

* `branch(): Tree` ：複製一份目前 `Tree` 狀態的 Tree 物件
* `merge(other: Tree, strategy?: MergeStrategy): void` ：合併兩個 `Tree` 物件，可決定合併衝突時的解決方式
  * `MergeStrategy` 有以下選項
    * `AllowOverwriteConflict`
    * `AllowCreationConflict `
    * `AllowDeleteConflict`
    * `Default`
    * `Error`：如果2個檔案存在於相同的位置就會丟出錯誤訊息
    * `ContentOnly`：只有內容衝突時才可以被覆寫
    * `Overwrite`：包含 `AllowOverwriteConflict`、`AllowCreationConflict`、`AllowDeleteConflict`，根據最後的異動做覆蓋
* `root: DirEntry` (唯讀)：取得目前的資料夾資訊 (`FileSystemDirEntry` 型別)
* `read(path: string): Buffer | null`：讀取檔案並用 binary  的方式呈現
* `exists(path: string): boolean`：檢查檔案是否存在
* `get(path: string): FileEntry | null`：取得檔案 ( `FileEntry` 型別)
* `getDir(path: string): DirEntry` ：取得某資料夾的資訊 (`FileSystemDirEntry` 型別)
* `visit(visitor: FileVisitor): void`：拜訪目前 Tree 下的所有檔案 (list through folders)
* `overwrite(path: string, content: Buffer | string): void`：複寫特定位置的檔案內容
* `beginUpdate(path: string): UpdateRecorder`：開始修改某個檔案
* `commitUpdate(record: UpdateRecorder): void`：確認修改內容，需與 `beginUpate` 配合使用
* `create(path: string, content: Buffer | string): void`：建立檔案並給予檔案內容
* `delete(path: string): void`：刪除檔案
* `rename(from: string, to: string): void`：重新命名檔案
* `apply(action: Action, strategy?: MergeStrategy): void`：套用規則，但無法在 `HostTree` 使用
* `actions: Action[] (readonly)`：列出該 `Tree` 目前所有的 actions，每一個 action 會有以下資訊
  * `kind`：動作種類
    * `c`：建立
    * `d`：刪除
    * `o`：複寫
    * `r`：重新命名
  * `path` ：路徑(from)
  * `to`：路徑 (to)
  * `content`：異動內容

基本上，屬於 `Tree` 型別的資料，都有上述的方法可以使用。在操作檔案系統時，`Tree` 是一個很重要的觀念，可以想像程他跟 Git 的 commit history 有雷同的運作方式。而所有的異動與規則，最終都得回到 Tree 上

### Source

Source 如上頭所介紹的，是用來建立一個全新空的檔案系統，有以下的方法可以產生 Source

* `url(path: String)`

  ```typescript
  // src/blogdemo/index.ts
  export function blogdemo(_options: any): Rule {
    return (tree: Tree, context: SchematicContext) => {
      // 根據 index.ts 的位置為出發點
      const files = url('./')(context) as Tree;
      // 列出該 Tree 下的所有檔案    
      files.visit(v => console.log(v));
      return tree;
    };
  }
  ```

  執行結果

  ![](https://i.imgur.com/RJOiBYL.png)

* `apply(source: Source, rules: Rule[])`：套用規則到 `Source` 上，並回傳經處理後的 `Source`

  ```typescript
  export function blogdemo(_options: any): Rule {
    return (tree: Tree, context: SchematicContext) => {
      const filterRule = filter(x => x.endsWith('ts'));
      const files = apply(url('./'), [filterRule])(context) as Observable<Tree>;
      files.subscribe(tree => {
        tree.visit(f => console.log(f));
      });
      return tree;
    };
  }
  ```

  ![](https://i.imgur.com/dYhIUIM.png)

* `source(tree: Tree)`：將 `Tree` 轉換成 `Source` 型別

  ```typescript
  export function blogdemo(_options: any): Rule {
    return (tree: Tree, context: SchematicContext) => {
      const filterRule = filter(x => x.endsWith('ts'));
      const files = apply(source(tree), [filterRule])(context) as Observable<
        Tree
      >;
      files.subscribe(tree => {
        tree.visit(f => console.log(f));
      });
      return tree;
    };
  }
  ```

* `empty()`： 回傳一個空的 `Tree`

* `asSource (rule: Rule)` 將規則轉換成 `source`

這邊會發現我在 `source` 物件後面加上 `(context)` ，這個動作是將 `source` 型別進行處理並會回傳 `Tree | Observable<Tree>` 型別的資料，之後的操作就跟操作 `Tree` 是一模一樣的

```typescript
export type Source = (context: SchematicContext) => Tree | Observable<Tree>;
```



### Rule

* `chain(rules: Rule[]): Rule` ： 將 Rule 串接在一起
* `mergeWith(source: Source, strategy: MergeStrategy = MergeStrategy.Default): Rule ` 將 `source` 與 `Tree` 做合併 (直接修改)
* `noop() : Rule`：回傳沒有任何動作的 `Rule` 
* `filter(predicate: FilePredicate<boolean>): Rule `：過濾規則
* `branchAndMerge(rule: Rule, strategy = MergeStrategy.Default): Rule `：與目前的 Tree (複製) 合併並回傳一份新的 Tree
* `partitionApplyMerge(predicate: FilePredicate<boolean>, ruleYes: Rule , ruleNo?: Rule): Rule`：根據條件執行對應的 `Rule`
* `forEach(operator: FileOperator): Rule `：批次直型傳進的 `FileOperator ` 
* `move(from: string, to?: string): Rule `：移動檔案至資料夾
* `rename(match: FilePredicate<boolean>, to: FilePredicate<string>): Rule `：將符合條件的檔案更換名稱
* `externalSchematic<OptionT extends object>(collectionName: string, schematicName: string, options: OptionT): Rule `：執行第三方 schematics 的命令
* `schematic<OptionT extends object>(schematicName: string, options: OptionT): Rule `：執行其他的 schematics 命令
* `template<T>(options: T): Rule `：樣板套用，包含檔案內容與檔名路徑的部分轉換
* `pathTemplate<T extends PathTemplateData>(options: T): Rule `：轉換檔名路徑至對應的內容
* `contentTemplate<T>(options: T): Rule `：轉換檔名內容的變數至對應的內容



```typescript
export type Rule = (tree: Tree, context: SchematicContext) => Tree | Observable<Tree> | Rule | void;
```



# 總結

`Tree`、`source` 與 `Rule` 間的關係其實很密切，將這三者的控制弄熟之後，就可以寫出功能很強大的 schematics，而不是單純的從別人的 schematics 複製貼上，卻不懂每一個動作的意義。

# 參考資料

* [Schematics](https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/schematics/README.md)