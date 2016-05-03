---
layout: post
title: [Coding4Fun] Build my own Markdown editor - Part I
comments: true
date: 2016-05-03 09:06:36
categories: Coding4Fun
tags: Coding4Fun
---

因為找不到自己想要的Markdown編輯器，所以自己來寫一個.

想要的功能

* Live preview like [Typora](https://www.typora.io/)
* Auto-upload image to [Flickr](http://flickr.com/)
* Be able to work with [Hexo](https://hexo.io/zh-tw/)

<!-- more -->

# 開發環境

* JavaScript
* [CodeMirror](https://codemirror.net/)
* [ExpressJS](http://expressjs.com/)
* [node-flickrapi](https://github.com/Pomax/node-flickrapi)
* [Visual Studio Code](https://code.visualstudio.com/)

# 撞牆期

## [CodeMirror](CodeMirror)

### 設定CodeMirror

新增一頁html, 引用CodeMirror.js和CodeMirror.css. 

app.js

```javascript
 //================
  var codeConfig = {
    autofocus: true,
    lineNumbers: true,
    styleActiveLine: true,
    mode: "gfm", // Markdown Edit Mode, 需要另外引用gfm和markdown.js
    lineWrapping: true    
  };

  var editor = CodeMirror(document.getElementById("editor"), codeConfig);
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Markdown Editor</title>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="lib/codemirror/lib/codemirror.css">
    <style>
        .CodeMirror {
            border: 1px solid #eee;
            width: 80%;
            height: auto;
            margin: 0 auto;
        }       
    </style>
</head>

<body>
    <h1>CodeMirror Markdown Editor</h1>
    <div id="editor">
    </div>  
</body>
<script src="lib/node_modules/jquery/dist/jquery.min.js"></script>
<script src="lib/codemirror/lib/codemirror.js"></script>
<script type="text/javascript" src="lib/codemirror/mode/markdown/markdown.js"></script>
<script type="text/javascript" src="lib/codemirror/addon/mode/overlay.js"></script>
<script type="text/javascript" src="lib/codemirror/addon/selection/active-line.js"></script>
<script type="text/javascript" src="lib/codemirror/mode/gfm/gfm.js"></script>
<!--highlight Javascript Syntax-->
<script type="text/javascript" src="lib/codemirror/mode/javascript/javascript.js"></script>
<script src="app.js"></script>
</html>
```

顯示畫面

![](https://farm8.staticflickr.com/7678/26783417845_b60a071a13_o.png)

### 轉換Markdown

這裡所使用到的轉換Library是[showdown](https://github.com/showdownjs/showdown)

index.html

```html
<div id="preview" class="preview"></div>   

<script src="lib/node_modules/showdown/dist/showdown.min.js"></script>
```

app.js

```javascript
 var converter = new showdown.Converter({
    literalMidWordUnderscores: true,
  });

 // livepreview
  editor.on('update', function (instance) {
    $("#preview").html(converter.makeHtml(instance.getValue()));
  });
```

這樣子就會邊打字邊顯示結果，但是到這裡，還是跟大部分的Markdown Editor一樣，是分兩個視窗分別顯示Markdown及輸出結果，但如何表現得跟Typora一樣，仍在研究中



### 拖拉照片

CodeMirror支援Drag&Drop, 也可以設定允許的檔案類別，設定方式如下

```javascript
var codeConfig = {
    autofocus: true,
    lineNumbers: true,
    styleActiveLine: true,
    mode: "gfm",
    lineWrapping: true,
    allowDropFileTypes: ["image/png", "image/jpeg", "image/gif"] //允許上傳的圖片類型:png,jpg,gif
  };
```

可以利用editor.on('',function(){})來處理動作

```javascript

```

這裡可以取得拖拉到editor裡的檔案有哪些

還有些額外的問題，如果將照片拖拉到非editor的地方，瀏覽器會直接顯示該照片，這不是我要的現象，所以我要將非editor的地方的drag&drop給關掉

```javascript
 window.onload = function () {
    var body = document; //target any DOM element here

    if (body.addEventListener) //(Mozilla)
    {
      body.addEventListener('dragenter', preventDrag, true); //precursor for drop event
      body.addEventListener('dragover', preventDrag, true); //precursor for drop event
      body.addEventListener('drop', preventDrag, true);
    }
    else if (body.attachEvent) //(IE)
    {
      body.attachEvent('ondragenter', preventDrag);
      body.attachEvent('ondragover', preventDrag);
      body.attachEvent('ondrop', preventDrag);
    }
  }
  
  function preventDrag(event) {
    if (event.type == 'dragenter' || event.type == 'dragover' || //if drag over event -- allows for drop event to be captured, in case default for this is to not allow drag over target
      event.type == 'drop') //prevent text dragging -- IE and new Mozilla (like Firefox 3.5+)
    {
      if (event.target.className.trim() != "CodeMirror-line") {        
        if (event.stopPropagation) //(Mozilla)
        {
          event.preventDefault();
          event.stopPropagation(); //prevent drag operation from bubbling up and causing text to be modified on old Mozilla (before Firefox 3.5, which doesn't have drop event -- this avoids having to capture old dragdrop event)
        }
        return false; //(IE)
      }
    }
  }  
```



<< 待續 >>

------

# 程式碼

[GitHub](https://github.com/chgc/markdown)