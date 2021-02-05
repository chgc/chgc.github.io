---
layout: post
title: '[Angular] 把 Angular 網站放到 VSCode Extension 內'
comments: true
typora-root-url: 2021-02-05-ng-vscode-extension-webview\
typora-copy-images-to: 2021-02-05-ng-vscode-extension-webview\
date: 2021-02-05 21:33:51
categories: Angular
tags: Angular
---

前幾天我分享了一個 YouTube  的影片，該影片大致上的內容是如何使用 VSCode Extension 使用 Webview API，既然可以用 webview 的方式來呈現網頁，那顯示一個 Angular App 也是很正常的事情，但環境設定上要怎麼調整呢? 這篇筆記就來整理一下

<!-- more -->

# 環境設定

1. 首先先建立一個 Angular 的專案 (這應該不用講要用什麼指令了吧)

2. 打開 `package.json`，新增以下內容

   ```json
   "publisher": "publisher-name",
   "engines": {
       "vscode": "^1.53.0"
   },
   "categories": [
       "Other"
   ],
   "activationEvents": [
       "onCommand:angular-webview.start"
   ],
   "main": "./dist/ext-src/extension.js",
   "contributes": {
       "commands": [
           {
               "command": "angular-webview.start",
               "title": "Open Webview",
               "category": "CK"
           }
       ]
   },
   "repository": {
       "type": "git",
       "url": "#"
   }
   ```

   * `categories` 、`activationEvents`、`contributes` 的區塊內容請配合 VS Code Extension 開發規範做調整

   ```json
    "devDependencies": {
        ...
       "@types/vscode": "^1.53.0",
       "vscode-test": "^1.5.0",
       "vsce": "^1.83.0"
    }
   ```

   * 修改完後記得要執行 `npm install`

   ```json
    "scripts": {
   	...
       // 修改
       "build": "ng build --prod --output-hashing none && tsc -p tsconfig.extension.json",
       // 新增指令
       "package": "vsce package",
       "vscode:prepublish": "npm run build && tsc -p tsconfig.extension.json"
     },
   ```

3. 新增 `.vscodeignore` 檔案 (可根據狀況調整)

   ```
   *
   !dist
   .vscode
   e2e
   ext-src
   node_modules
   src
   ```

4. 新增 `.vscode` 資料夾並新增 `launch.json` 檔案

   ```json
   {
   	"version": "0.2.0",
   	"configurations": [
   		{
   			"name": "Run Extension",
   			"type": "extensionHost",
   			"request": "launch",
   			"args": [
   				"--extensionDevelopmentPath=${workspaceFolder}"
   			],
   			"outFiles": [
   				"${workspaceFolder}/out/**/*.js"
   			],
   		},
   	]
   }
   ```

5. 新增 `ext-src` 資料夾，並在該資料夾下新增 `extension.ts` 檔案

   ```typescript
   import * as fs from 'fs';
   import * as path from 'path';
   import * as vscode from 'vscode';
   
   /**
    * Manages webview panels
    */
   class WebPanel {
     /**
      * Track the currently panel. Only allow a single panel to exist at a time.
      */
     public static currentPanel: WebPanel | undefined;
   
     private static readonly viewType = 'angular';
   
     private readonly panel: vscode.WebviewPanel;
     private readonly extensionPath: string;
     private readonly builtAppFolder: string;
     private disposables: vscode.Disposable[] = [];
   
     public static createOrShow(extensionPath: string) {
       const column = vscode.window.activeTextEditor
         ? vscode.window.activeTextEditor.viewColumn
         : undefined;
   
       // If we already have a panel, show it.
       // Otherwise, create angular panel.
       if (WebPanel.currentPanel) {
         WebPanel.currentPanel.panel.reveal(column);
       } else {
         WebPanel.currentPanel = new WebPanel(
           extensionPath,
           column || vscode.ViewColumn.One
         );
       }
       return WebPanel.currentPanel;
     }
   
     private constructor(extensionPath: string, column: vscode.ViewColumn) {
       this.extensionPath = extensionPath;
       this.builtAppFolder = 'dist';
   
       // Create and show a new webview panel
       this.panel = vscode.window.createWebviewPanel(
         WebPanel.viewType,
         'My Angular Webview',
         column,
         {
           // Enable javascript in the webview
           enableScripts: true,
   
           // And restrict the webview to only loading content from our extension's `media` directory.
           localResourceRoots: [
             vscode.Uri.file(path.join(this.extensionPath, this.builtAppFolder)),
           ],
         }
       );
   
       // Set the webview's initial html content
       this.panel.webview.html = this._getHtmlForWebview();
   
       // Listen for when the panel is disposed
       // This happens when the user closes the panel or when the panel is closed programatically
       this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
   
       // Handle messages from the webview
       this.panel.webview.onDidReceiveMessage(
         (message: any) => {
           switch (message.command) {
             case 'alert':
               vscode.window.showErrorMessage(message.text);
               return;
           }
         },
         null,
         this.disposables
       );
     }
   
     public dispose() {
       WebPanel.currentPanel = undefined;
   
       // Clean up our resources
       this.panel.dispose();
   
       while (this.disposables.length) {
         const x = this.disposables.pop();
         if (x) {
           x.dispose();
         }
       }
     }
   
     /**
      * Returns html of the start page (index.html)
      */
     private _getHtmlForWebview() {
       // path to dist folder
       const appDistPath = path.join(this.extensionPath, 'dist/cklab');
       const appDistPathUri = vscode.Uri.file(appDistPath);
   
       // path as uri
       const baseUri = this.panel.webview.asWebviewUri(appDistPathUri);
   
       // get path to index.html file from dist folder
       const indexPath = path.join(appDistPath, 'index.html');
   
       // read index file from file system
       let indexHtml = fs.readFileSync(indexPath, { encoding: 'utf8' });
   
       // update the base URI tag
       indexHtml = indexHtml.replace(
         '<base href="/">',
         `<base href="${String(baseUri)}/">`
       );
   
       return indexHtml;
     }
   }
   
   export function activate(context: vscode.ExtensionContext) {
     context.subscriptions.push(
       vscode.commands.registerCommand('angular-webview.start', () => {
         WebPanel.createOrShow(context.extensionPath);
       })
     );
   }
   
   // this method is called when your extension is deactivated
   export function deactivate() {}
   
   ```

   * line 99: 請根據自己 Angular 專案輸出資料夾路徑做調整
   * line 123: 跟著 `package.json` 的指令註冊一起調整命令名稱

6. 新增 `tsconfig.extension.json` 檔案

   ```json
   {
     "compilerOptions": {
       "module": "commonjs",
       "target": "es6",
       "outDir": "dist",
       "lib": [
         "es6",
         "dom"
       ],
       "sourceMap": true,
       "rootDir": ".",
       "strict": true
     },
     "include": [
       "ext-src"
     ],
     "exclude": [
       "node_modules/*", 
       ".vscode/*"
     ]
   }
   ```

到這邊應算是完成最基本的 VS Code Extension 環境的設定，如何看是否有設定成功，可以執行以下步驟

1. 開 Terminal 執行 `npm run build`

2. 按 F5 進入 Debug 模式，這時候會開啟一個新的 VS Code 視窗

3. 執行所設定的啟動指令，以這個範例來說就是 `CK: Open Webview`

   ![image-20210205215343080](image-20210205215343080.png)

4. 成功後的顯示畫面

   ![image-20210205215408533](image-20210205215408533.png)

至於在 VS Code Webview 的環境下，Angular 開發上有什麼需要注意的事項，這部分就留到下一篇筆記了

#  打包套件

如果都寫完要發布成可以安裝的擴充套件時，可以執行 `npm run package` 就會產生一個 `VSIX` 的安裝檔案



# 參考資料

* [How to Code a VSCode Extension](https://www.youtube.com/watch?v=a5DX5pQ9p5M)
* [VSCode Extension Get Started](https://code.visualstudio.com/api/get-started/your-first-extension)
* [VSCode Webview API](https://code.visualstudio.com/api/extension-guides/webview)