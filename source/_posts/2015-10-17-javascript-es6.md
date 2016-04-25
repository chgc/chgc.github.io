---
layout: post
title: '[Javascript] 學ES2015(ES6) & Typescript - 環境準備'
date: 2015-10-17 09:48
comments: true
categories: "Javascript"
tag: "ES2015"
---
# 準備練習環境
1. VSCode
2. Gulp
3. browersync
4. Typescript

## 設定項目
1. tsconfig.json

```
{
	"compilerOptions": {
		"target": "ES5",
		"module": "amd",
		"sourceMap": false,
		"watch": true,
		"outDir": "public/"
	}
}
```

2. tasks.json

```
{
	"version": "0.1.0",
	"command": "gulp",
	"isShellCommand": true,
	"tasks": [
		{
			"taskName": "watch",
			"isBuildCommand": true,
			"showOutput": "silent",
			"problemMatcher": "$tsc"			
		}
	]
}
```

3. gulpfile.js

```
var gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	typescript = require('gulp-tsc');
	
gulp.task('browser-sync',function(){
	browserSync.init({
		server:{
			baseDir:"./"
		}
	})	
})

gulp.task('compile',function(){
	gulp.src(['src/**/*.ts'])
	    .pipe(typescript())
		.pipe(gulp.dest('public/'))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('watch',['browser-sync'],function(){
	gulp.watch(['src/**/*.ts'],['compile']);
});

gulp.task('default',['watch']);
```

gulpfile會做兩件事情
1. 當ts檔案有異動的時候做Compile並輸出到public的資料夾下
2. 透過browsersync更新瀏覽器

這樣子就可以專心來練習javascript了
