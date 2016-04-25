---
layout: post
title: '[Laravel] Study Note.'
date: 2013-10-16 08:56
comments: true
categories: "Laravel"
tag: "Laravel 4"
---
#database config path 

/app/config/database.php

#star up path

serverName/laravel/public

-------------

#php artisan migrate
這裡migrate的觀念與EntityFramework 5 Code First的觀念相同。

## migrate:install
安裝Migration table, 會在資料庫中創建一個migrateion table, 紀錄migration版本

## migrate:make somethingsomething
建立新版的資料庫異動檔案

## migrate
執行資料庫格式升級 --> function up()

## migrate:rollback
執行資料庫格式降級 --> function down()

## migrate table file location : app/database/migrations/

```php 升級動作
function up(){
// create new table
Schema::table('users', function($table)
 {
 $table->create();
 $table->increments('id');//id fields with AUTO_INCREMENT
 $table->string('email');//email field with varchar(255)
 $table->string('real_name',100);//real_field with varchar(100)
 $table->string('password');
 $table->timestamps();// created_at,updated_at timestamps(2 fields)
 });
} 
```
```php 降級動作
function down(){
	//Drop Table
	Schema::drop('users');
} 
```
-------------



