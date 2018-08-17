---
layout: post
title: '[TypeScript] Compiler API 第一次接觸'
comments: true
date: 2018-08-17 10:22:51
categories: 'TypeScript'
tags: 'TypeScript'
---

TypeScript 提供了編譯 (compiler) 的 API 出來，可以讓我們用程式的方式建立或是編輯 ts 檔案。但為什麼要了解 TypeScript 的 Compiler API 呢? 主要原因是當在寫 Angular Schematics 時，加減都會碰到編輯 TypeScript 檔案的時候，這時候透過 TS Compiler API 來操作會比較保險一點，但這主題有點大，這一篇文章就稍微了解一下如何入門就好

<!-- more -->

# 環境準備

環境的準備很簡單，基本上安裝 TypeScript 1.6 版本以上的都可以，目前的版本是 3.0

```
npm install -g typescript
```

# 起手式

```typescript
import * as ts from 'typescript';
const printer: ts.Printer = ts.createPrinter();
const sourceFile: ts.SourceFile = ts.createSourceFile(
  'test.ts',
  'const x  :  number = 42',
  ts.ScriptTarget.ES2015,
  true,
  ts.ScriptKind.TS
);
console.log(sourceFile);

console.log(printer.printFile(sourceFile));

```

**執行結果**

第一個 console.log 結果

![](https://i.imgur.com/ow99byk.png)

第二個 console.log 結果

![](https://i.imgur.com/FZztdwD.png)

**程式碼說明**

* line 1：從 typescript 載入所有並指定別名

* line 2：建立 Printer，用來列印內容用

* line 3：`createSourceFile` 建立 `SourceFile`

  ```typescript
  function createSourceFile(fileName: string, sourceText: string, languageVersion: ScriptTarget, setParentNodes?: boolean, scriptKind?: ScriptKind): SourceFile;
  ```

  * `sourceFile` 的檔名
  * `sourceText` 檔案內容
  * `languageVersion` TypeScript 版本

# Node factories

TypeScript Compiler API 內件很多建立的方法，

![](https://i.imgur.com/FSC8x4V.png)

以下舉出幾個 method 的用法集效果

* `createAdd` ：將兩個 `ts.Expression` 用 `+` 串接在一起

  ```typescript
  const add = ts.createAdd(ts.createLiteral(42), ts.createLiteral(50));
  const result = printer.printNode(ts.EmitHint.Unspecified, add, sourceFile);
  ```

  ![](https://i.imgur.com/Gg1sqGE.png)

* `createArrayLiteral` ：建立 array 

  ```typescript
  const display = ts.createArrayLiteral(
   /* elements?: ReadonlyArray<Expression> */ [ts.createLiteral('a'), ts.createLiteral('b')],
   /* multiLine?: boolean */ true
  );
  ```

  ![](https://i.imgur.com/x9TIckN.png)

* `createArrowFunction `： 建立 arrow function

  ```typescript
  const arrowFunction = ts.createArrowFunction(
    /*  modifiers */ [],
    /*  typeParameters */ [],
    /*  parameters */ [
      ts.createParameter(
        [],
        [],
        undefined,
        'x',
        undefined,
        ts.createTypeReferenceNode('number', [])
      )
    ],
    /* type  */ ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    /* equalsGreaterThanToken  */ undefined,
    /* body  */ ts.createLiteral(42)
  );
  ```

  ![](https://i.imgur.com/pcHrhT6.png)

* `createArrayTypeNode `：建立某型別陣列型別

  ```typescript
  ts.createArrayTypeNode(
    ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
  );
  ```

  ![](https://i.imgur.com/hol9kgm.png)

* `createAsExpression `：建立 `as 型別` 的程式碼

  ```typescript
  const display = ts.createAsExpression(
    ts.createObjectLiteral([
      ts.createPropertyAssignment('name', ts.createLiteral('Kevin'))
    ]),
    ts.createTypeReferenceNode('Person', undefined)
  );
  ```

  ![](https://i.imgur.com/v3DN9fH.png)

* `createAssignment`： 建立指定程式碼

  ```typescript
  ts.createAssignment(
    ts.createIdentifier('firstName'),
    ts.createLiteral('Kevin')
  );
  ```

  ![](https://i.imgur.com/yCLcpd4.png)

* `createVariableDeclarationList ` ：建立變數

  ```typescript
  ts.createVariableDeclarationList(
    [ts.createVariableDeclaration('name', undefined, ts.createLiteral('yooo'))],
    ts.NodeFlags.Const
  );
  ```

  ![](https://i.imgur.com/FNVgKP4.png)

在 TypeScript  Compiler 裡面有超級多方法可以用來建立 typescript 的程式碼，但因為在網路上並沒有看到完整的 API 文件，這個就要慢慢花時間一個一個得看了

# AST

AST 是 Abstract Syntax Tree  的縮寫，基本上就是將 TypeScript 檔案的內容轉換成樹狀結構的資料格式，可以透過分析 AST 的結構，進而做一些有趣的變化，但這邊就先針對結構做些了解，結構如下圖

![](https://i.imgur.com/ZPU0fLP.png)

`sourceFile` (例如透過 `ts.createSourceFile` 建立) 內的所有訊息都會被轉換成 node 資訊 (同時也是一份 `sourceFile`)，每一個 node 資訊都會包含一個 `kind`  的類別，而這個類別與 `ts.SyntaxKind` 是對應上的，當然 TypeScript 內也有一些內建的方法來判斷目前的 node  是屬於哪種性質的，例如，使用 `ts.isVariableDeclarationList` 就可以判斷這一個 node 是否為宣告變數的程式，或是透過 `node.kind === ts.SyntaxKind.xxxx` 來判斷

![](https://i.imgur.com/keAMfzF.png)

 TypeScript 編譯的步驟(如上圖)大致上是這樣子，我們可以在中間加上轉換外掛的功能，然後將輸出的結果變成我們想要的，可以在 `tsconfig` 內做設定

```typescript
import * as ts from 'typescript';

const printer: ts.Printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed
});
const sourceFile: ts.SourceFile = ts.createSourceFile(
  'test.ts',
  `import * as ts from 'typescript'';
  `,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
);

visit(sourceFile);

function visit(node: ts.Node) {
  if (node.kind === ts.SyntaxKind.ImportDeclaration) {
    console.log('變數定義', node.kind);
  }
  node.forEachChild(visit);
}

```

這裡提供一個簡單的程式碼做個開始，在搭配上一小結的建立方法，就可以改變最終的輸出結果了

# 參考文件

* [Using the Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API)
* [AST Explorer ](https://astexplorer.net/)
* [How to Write a TypeScript Transform ](https://dev.doctorevidence.com/how-to-write-a-typescript-transform-plugin-fc5308fdd943)
* [Angular Schematics ast-utils](https://github.com/angular/angular-cli/blob/master/packages/schematics/angular/utility/ast-utils.ts)