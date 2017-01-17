---
layout: post
title: '[Angular]Laravel 5.3邂逅'
comments: true
date: 2017-01-15 16:04:06
categories: Angular
tags: 
- Angular2
- Laravel5
---

Laravel 5.x版以後樣板的部分就內建使用Vue.js的方法。

假設今天我想要使用Angular CLI方式搭配Laravel的方式來開發，那又應該怎麼做呢，以下提供一個方式，歡迎討論

<!-- more -->

# 建立Laravel專案

* 修改路由設定檔，routes/web.php

  ```php
  <?php

  /*
  |--------------------------------------------------------------------------
  | Web Routes
  |--------------------------------------------------------------------------
  |
  | Here is where you can register web routes for your application. These
  | routes are loaded by the RouteServiceProvider within a group which
  | contains the "web" middleware group. Now create something great!
  |
  */

  // put all your REST routes inside api-group
  Route::group(['prefix' => 'api'], function() {
    
  });

  Auth::routes();
  // this route is for Angular and it should be placed after all other back end routes
  // just keep it at the bottom
  Route::get('/{any}', function ($any) {
      return view('welcome');
  })->where('any', '.*');
  ```

  ​



# 建立Angular專案

## 使用CLI來建立專案

在laravel的根目錄下，執行以下指令

```text
ng new <projectName> --routing --skip-commit
```

或是，自己新增一個存放的資料夾後並切換到該資料夾下，執行以下指令

```text
ng init <projectName> --routing --skip-commit
```

執行完後，一個Angular的專案就建置完成了



## 設定proxy.conf.json

* 新增`proxy.config.json`檔案，依Laravel serve的網站位置做修改

  ```json
  {
    "/api": {
      "target": "http://localhost:8000",
      "secure": false
    }
  }
  ```

* 修改`pageage.json`的`scripts`部分

  ```json
  "scripts": {
      "start": "ng serve --proxy-config proxy.conf.json",
      ...
   }
  ```

  ​

## 設定angular-cli.json

* 將laravel專案的public資料夾下的檔案都複製到angular專案的src資料夾下
  * index.php
  * .htaccess
  * robots.txt
  * web.config
* 將那些檔案都新增到`angular-cli.json`的`assets`區段內
* 設定`outDir`到laravel的publich資料夾路徑



# 開發時期

在開發時期，因為上述的設定方式，已經讓前端與後端完全的切割了，所以在開發時期就可以分別開發。

* Angular的網站可以透過npm start的方式去執行ng serve with proxy config的動作，由於proxy會將api相關的呼叫，對應到laravel的網站去，所以在呼叫api的部分，就不需要額外去指定host url的部分
* Laravel後端的部分，就專心於API資料的提供等動作



# 部屬Laravel專案

* 如果要部署的時候，Angular可以透過以下的指令將Angular的程式bundle/AOT輸出到所設定的輸出目錄下 

  ```text
  ng build --prod --aot --output-hashing=media
  ```

  * —output-hasing的參數是在angular-cli beta25.5版以後提供的，可以設定所輸出的bundle是否要加上hash值

* 輸出到Laravel專案的public資料夾下會有一個index.html的檔案，將該檔案的內容複製到laravel起始頁面的blade.php檔案(預設: welcome.blade.php) (第一次修改即可)

* 依Laravel部署網站的方式部署即可

