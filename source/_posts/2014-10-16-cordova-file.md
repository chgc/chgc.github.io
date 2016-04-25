---
layout: post
title: '[ngCordova] Move File'
date: 2014-10-16 03:37
comments: true
categories: "Library"
tag: "ngCordova"
---
When move file in ngCordova or Cordova, it will need 2 plugins.

1. cordova plugin add org.apache.cordova.file
2. cordova plugin add org.apache.cordova.file-transfer

basic usage.

```
$cordovaFile.downloadFile(source, filepath, true, {}).then(function(result) {
            // Success! 
        }, function(err) {
            // Error
        }, function(progress) {
            // constant progress updates
        });
```
 
 it's same as
 
```
var fileTransfer = new FileTransfer();
var uri = encodeURI(source);
fileTransfer.download(uri,filePath,
function (entry) {
// success
},
function (error) {
// error
},
trustAllHosts, options);
```

if you want to use it with $cordovaCamera.getPicture(), you will need to resolve FILE_URI first, and use it as source.

```
function getImageFileName(image) {
        window.resolveLocalFileSystemURL(image,
            function(entry) {
                var uri = entry.toURL();
                entry.file(function(file) {
                    var fileName = file.name;
                });
            });
    }
```
[API Document#File Entry](http://docs.phonegap.com/en/3.3.0/cordova_file_file.md.html#FileEntry)

another problem is filepath. 
basePath can find it by below code. and filepath need a filename at the end.

```
$cordovaFile.createDir(directory, false).then(function(entry) {
            // Success! 
            alert(entry.toURL());
        }, function(err) {
            // An error occured. Show a message to the user
        });
```

