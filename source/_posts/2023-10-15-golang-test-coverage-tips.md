---
layout: post
title: '[Go] VSCode 內的 Test Coverage 設定小技巧'
comments: true
typora-root-url: 2023-10-15-golang-test-coverage-tips/
typora-copy-images-to: 2023-10-15-golang-test-coverage-tips/
date: 2023-10-15 11:43:40
categories: Go
tags: Go
---

VSCode 應該是很多人的主開發工具，尤其在這個一個人要身兼多語言開發時，VSCode 真的是個不錯的選擇，而 Go 在 VSCode 上的開發體驗，搭配 [Go Exntesion](https://marketplace.visualstudio.com/items?itemName=golang.Go) 後，真的沒什麼好挑剔的，但還是有些設定需要做調整，這篇會筆記一些近期針對測試部分所做的設定調整。

<!-- more -->

## 調整 Coverage 的顯示方式

1. 開啟 Coverage 的顯示，先講效果
   ![image-20231015115046331](image-20231015115046331.png)

   從畫面的左邊就可以知道有哪些程式尚未被覆蓋到，在撰寫 test case 時是很直覺的，設定方式如下

   ```json
   "go.coverOnSave": true,
   "go.coverageDecorator": {
       "type": "gutter", // 預設是 hightlight
       "coveredHighlightColor": "rgba(64,128,128,0.5)",
       "uncoveredHighlightColor": "rgba(128,64,64,0.25)",
       "coveredGutterStyle": "blockgreen",
       "uncoveredGutterStyle": "blockred"
   }
   ```

   - `coverOnSave`: 設定為 `true` 時，在 save 檔案時會執行 `go test -coverprofile`
   - `go.coverageDecorator.type` 有兩種模式，`highlight` 和 `gutter`，自己是比較偏愛 `gutter` 的模式，各位可以自己玩看看

   

   ## 額外發現

   原來 Go extension 內有支援 generate unit test  的功能，這樣還有什麼理由不寫測試呢

   ![image-20231015123047230](image-20231015123047230.png)

   或是用 command Palette 方式執行

   ![image-20231015123120869](image-20231015123120869.png)

   

   
