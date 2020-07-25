---
layout: post
title: '[Angular] 幫 moment.js 套件瘦身'
comments: true
typora-root-url: 2020-07-25-angular-moment-localte-is-too-fat
typora-copy-images-to: 2020-07-25-angular-moment-localte-is-too-fat
date: 2020-07-25 12:21:38
categories: Angular
tags: Angular
---

長久以來，使用 moment.js 這一個時間套件讓我很掙扎，畢竟他很好用但很肥，主要肥胖的地方都是一堆用不到的 locale.

今天終於下定決心要來解決這個問題，經過兩分鐘的搜尋後，以下是解法

<!-- more -->

1.  在 `src` 資料夾下建立一個 locale 空的資料夾
2.  在 `angular.json` 的 `fileReplacements` 內多新增下面設定

```json
{
  "replace": "node_modules/moment/locale/",
  "with": "src/locale/"
}
```

當這樣子設定完成後，ng build --prod 時會出現 `\moment\locale\af.js" does not exist.` 找不到的錯誤訊息，沒關係這個不會影響到我們的程式執行。

經過這樣子的調整後，整個 moment locale 的部分就會被拔掉，瞬間瘦了快 400kb 的大小，可以算是瘦身成功

