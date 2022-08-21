---
layout: post
title: '[Obsidian] 使用 Obsidian 來寫 Docusaurus Doc & Blog'
comments: true
typora-root-url: 2022-08-21-use-obsidian-to-maintian-docusaurus
typora-copy-images-to: 2022-08-21-use-obsidian-to-maintian-docusaurus
date: 2022-08-21 14:50:54
categories: 其他
tags: Obsidian
---

使用 Obsidian 來寫 `Docusaurus` 似乎也是個好選擇，以下是我嘗試後的一些設定方式

<!-- more -->

## 環境設定

因為 Obsidian 可以將資料夾視為一個 Vault，我們可以將 `Docusaurus` 下的 Doc & Blog 兩個資料夾設定為兩個 vault 使用，這篇文章會使用 `blog` 來做示範

### Open Folder as Vault

將 blog 資料夾開啟，這時候會在 `blog` 資料夾下新增 `.obsidian` 的資料夾，所以在 `.gitignore` 需要設定排除 `.obsidian` 資料夾，既然都開啟 `.gitignore` 了，順便排除 `@Templates` 資料夾  (可自行命名，是用來存放 Obsidian Template 的地方，等等會講到)

### 安裝 community plugin

這裡需要安裝兩個 plugin

1. Custom attachment Location: 方便我們貼圖時可以將圖片動態指定我們設定的位置，以下是我設定的方式 (可自行設定)

   ![image-20220821151228868](image-20220821151228868.png)

   因為貼圖路徑的關係，還有一個地方需要配合調整，在 `Files & Links` 的地方

   ![image-20220821151341432](image-20220821151341432.png)

   Step 2 需要將連結的格式改為相對路徑，這樣 `docusaurus` 才能正常判讀檔案位置，當然就不能使用 `wikilinks` 的格式，所幸這些設定檔都是跟著 Vault 走，所以修改不會影響到其他人

2. mdx as md: 因為 `docusurus` 支援 md 和 mdx 兩種文件格式，所以 Obsidian 需要安裝這個才可以看到兩種檔案格式

## 設定 Templates


剛剛在前面 `.gitignore` 時多排除一個 `@Templates` 的資料夾，當然現在要多新增一個 `@Templates` 的資料夾在 Blog 資料夾(Vault) 內，並多做以下兩點設定

1. Template 為 Core Plugin，預設是開啟狀態，所以 Settings 內可以看到 `Templates` 的選單

   ![image-20220821152120598](image-20220821152120598.png)

2. 設定 Hotkey，這裡可以依各人喜好設定

   ![image-20220821152234652](image-20220821152234652.png)

當這些設定完成後，這時候我們就可以來新增一個 Blog Template 供後面新增時使用，在 `@Templates` 資料夾下新增一個 `Note`，名稱自取

![image-20220821152401960](image-20220821152401960.png)

在該篇 Note 內，輸入以下內容，這些內容就可以在之後新增 Notes 時透過 Insert template 的方式將內容加入

```markdown
---
slug: 
title: {{title}}
authors: []
tags: []
---
```

能用變數說明

- `{{title}}`: 目前這篇 Note 的標題
- `{{date}}` 和 `{{time}}` 是日期變數 - (memo: 這邊沒有使用到)

### 使用方式

1. 新增一篇 Note 並輸入標題
2. 使用 Hotkey 來新增 Template，當有多個 templates 時，會出現選單讓我們選擇要套用哪一個

### `Templater plugin`

這個 plugin 很強大，可以允許我們寫 script 來處理各種 template 樣式，這邊有一個[介紹影片](https://www.youtube.com/watch?v=1eUxQo6Dy7k)，[plugin 文件](https://silentvoid13.github.io/Templater/introduction.html)，當然如果使用 `Templater plugin` 剛剛寫的 template 要做些調整

```markdown
---
slug: 
title: '<% tp.file.title %>'
authors: []
tags: []
---
```

另外要留意的是 Hotkey 的部分，`Templater` 有自己的 Hotkey 設定，所以這邊會建議只使用一套，就看哪一套適合自己的寫作節奏

![image-20220821154520713](image-20220821154520713.png)

![image-20220821154534208](image-20220821154534208.png)



## 小結

當上述這些設定完成後，`Dousaurus` 的 Doc 或 Blog 的編寫就會更貼近一般文書編輯的模式，圖片，表格等都可以使用 Obsidian 強大的功能來完成編輯







