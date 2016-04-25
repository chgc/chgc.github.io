---
layout: post
title: '[MVC Core] Run with Docker'
date: 2016-03-27 14:43
comments: true
categories: "ASP.NET MVC"
tag: ["MVC Core", "Docker"]
---
基於Docker安裝步驟變簡單了，所以是時候來玩Docker了.
在MVC Core的目錄下，新增一個檔案Dockfile, 內容如下
```
FROM microsoft/aspnet:1.0.0-rc1-update1

COPY . /app
WORKDIR /app
RUN ["dnu", "restore"]

EXPOSE 5000/tcp
ENTRYPOINT ["dnx", "-p", "project.json", "web","--server.urls", "http://0.0.0.0:5000"]
```
**server.urls 需要指定到0.0.0.0:port, 不然在docker run起來的時候，網頁會說Refused to Connect
server.urls的設定方式可以參考[這裡](http://docs.asp.net/en/latest/fundamentals/servers.html)

開啟命令視窗，到有Dockerfile檔案的資料夾並執行下列指令
```
docker build -t <imageName> .
```
上列指令這會建立一個docker image file
接下來就要讓所建立出來的Image執行起來, 執行下列指令
```
docker run -t -d -p 5000:5000 <imageName>
```
詳細的Docker指令用法，請參閱官方網站