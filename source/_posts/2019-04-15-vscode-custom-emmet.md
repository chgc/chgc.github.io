---
layout: post
title: '[VS Code] 自訂 Emmet 範本'
comments: true
typora-root-url: 2019-04-15-vscode-custom-emmet/
typora-copy-images-to: 2019-04-15-vscode-custom-emmet/
date: 2019-04-15 12:01:13
categories: VSCode
tags: VSCode
---

今天朋友在問到，要如何修改 VS Code 內 Emmet 的預設範本。一開始想說是沒有辦法修改預設的，應該也沒有辦法覆蓋吧，所以稍微在網路上找了一下，果然沒有找到相關的資料，但其實在官方文件內有提到自訂範本的事情，那就來看看怎麼修改吧

<!-- more -->

首先，先根據[這裡](https://code.visualstudio.com/docs/editor/emmet#_using-custom-emmet-snippets)的說明，將自訂 `snippet.json` 檔案所處的資料夾位置，設定到 `settings` 裡 `emmet.extensionsPath` 的地方

![1555301445272](1555301445272.png)

我這裡先用 html 的部分做說明，CSS 依循一樣的規則，VS Code Emmet 內建所使用的 HTML Snippet 是使用這一份 [html.json](https://github.com/emmetio/snippets/blob/master/html.json)，假設我們想要修改 `!` 所產生出來的預設 html 範本內容，我們只需要重新定義一個 `doc` 即可 (原始定義如下)

```json
"doc": "html[lang=${lang}]>(head>meta[charset=${charset}]+meta:vp+meta:edge+title{${1:Document}})+body",
	"!|html:5": "!!!+doc",
```

而自訂 `snippet.json` 的內容如下

```json
{
  "html": {
    "snippets": {
      "doc": "html[lang=${lang}]>(head>meta[charset=${charset}]+meta:vp+meta:edge+title{${1:Documentttt}})+body"
    }
  }
}

```

我們只需要重新定義 `doc` 即可達到我們的需求，同樣的，如果想要擴充 Emmet 的功能，直接在此編寫即可

剩下的就看各位的想像力了

# 參考資料

* [html.json](https://github.com/emmetio/snippets/blob/master/html.json)
* [css.json](https://github.com/emmetio/snippets/blob/master/css.json)
* [VS Code - Using custom Emmet snippets](https://code.visualstudio.com/docs/editor/emmet#_using-custom-emmet-snippets)