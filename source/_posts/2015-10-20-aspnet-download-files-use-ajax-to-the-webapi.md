---
layout: post
title: '[ASP.NET] 透過ajax的方式向webapi下載檔案'
date: 2015-10-20 10:53
comments: true
categories: "ASP.NET MVC"
tag: "MVC 5"
---
現在SPA的網站越來越盛行，下載檔案的功能在ajax下是有點麻煩，但是感謝HTML5下的Blob功能。網路上就有相對應的js功能出來
所以，引用這位大大的程式 (https://github.com/eligrey/FileSaver.js)，其相關限制都有在該專案上描述

所以使用方法如下
(Client端)
```
$http.post('api url', query, { responseType: 'arraybuffer' }).then(function (response) {        
            var filename = (filename);
            var expectedMediaType = (file-Content-Type);
            openSaveAsDialog(filename, response.data, expectedMediaType);
});      
                
function openSaveAsDialog(filename, content, mediaType) {
        var blob = new Blob([content], { type: mediaType });
        saveAs(blob, filename);
}
```

**重點** : responseType 要設定為 arraybuffer

(Server端)
Webapi要回傳的httpresponseMessage內容如下, 不好意思程式碼是VB, 因為這個專案是用VB開發的，但是基本觀念的一樣的
```
 Dim response As HttpResponseMessage = New HttpResponseMessage()
        ' _ms 是 MemoryStream, 這裡是因為要將NPOI所產生的excel檔做下載, 然而我將NPOI所產生出來的東西
        ' 存入到 MemoryStream裡, 重點是ByteArrayContent
        Dim _filename as string = (filename)
        If _ms IsNot Nothing Then
            response.Content = New ByteArrayContent(_ms.ToArray())
        End If
        response.Content.Headers.ContentType = New Headers.MediaTypeHeaderValue("application/octet-stream")
        response.Content.Headers.ContentDisposition = New Headers.ContentDispositionHeaderValue("attachment") With {.FileName = HttpUtility.UrlPathEncode(_filename)}
        Return Task.FromResult(response)
```

以上的動作就可以讓ajax的call直接做下載檔案的動作，就不用另外產生一個form然後做post到新視窗後再下載了 ^^