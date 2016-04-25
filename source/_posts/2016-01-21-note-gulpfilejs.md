---
layout: post
title: '[Note] Gulpfile.js <my version!>'
date: 2016-01-21 05:54
comments: true
categories: "Note"
tag: "Gulp"
---
目前開發所需的gulpfile.js版本
工作流程 for angular 1.x開發
[typescript]->[javascript]->[webpack]->bundle.js
```
'use strict';

var gulp = require('gulp'),
    tsc = require('gulp-typescript'),
    inject = require('gulp-inject'),
    tsProject = tsc.createProject('tsconfig.json'),
    webpack = require('webpack'),
    gulpWebpack = require('webpack-stream'),
    ngAnnotatePlugin = require('ng-annotate-webpack-plugin'),
    path = require('path');

gulp.task('compile-ts', function () {
    var sourceTsFiles = ['./app/src/**/*.ts',                //path to typescript files
                         './app/typings/**/*.ts']; //reference to library .d.ts files


    var tsResult = gulp.src(sourceTsFiles)
                       .pipe(tsc(tsProject));

    tsResult.dts.pipe(gulp.dest('./app/dist'));
    return tsResult.js.pipe(gulp.dest('./app/dist'));
});

 gulp.task('gen-ts-refs', function () {
     var target = gulp.src('./app/src/app.d.ts');
     var sources = gulp.src(['./app/src/**/*.ts'], { read: false });
     return target.pipe(inject(sources, {
         starttag: '//{',
         endtag: '//}',
         transform: function (filepath) {
             if (filepath.indexOf('index') > -1) { return; }
             if (filepath.indexOf('app.d.ts') > -1) { return; }
             return '/// <reference path="../..' + filepath + '" />';
         }
     })).pipe(gulp.dest('./app/src/'));
 });

gulp.task('watch', function () {
    gulp.watch(['./app/src/**/*.ts'], ['webpack']);
});

gulp.task('webpack', ['compile-ts'], function () {
    return gulp.src('./app/dist/app.js')
      .pipe(gulpWebpack({          
          entry: {
              bundled: './app/dist/app.js',
              commands: './app/dist/libs.js'
          },
          output: {
              filename: '[name].js',
          },
          resolve: {
              // this tells Webpack where actually to find lodash because you'll need it in the ProvidePlugin
              alias: {
                  lodash: path.resolve(__dirname, './node_modules/lodash'),
                  angular: path.resolve(__dirname, './node_modules/angular')
              },
              extensions: ['', '.js']
          },
          module: {
              loaders: [
                  { test: /[\/]angular\.js$/, loader: "exports?angular" }
              ]
          },
          plugins: [
              new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
              // this tells Webpack to provide the "_" variable globally in all your app files as lodash.
              new webpack.ProvidePlugin({
                  _: "lodash",
              }),
              new ngAnnotatePlugin({
                  add: true
              })
              // new webpack.optimize.CommonsChunkPlugin('common.js'),
              //new webpack.optimize.UglifyJsPlugin({
              //    compress: {
              //        warnings: false
              //    },
              //    output: { comments: false }
              //})

          ]
      }))
      .pipe(gulp.dest('./Scripts'));
})

gulp.task('default', ['watch']);
```

package.json
```
...
"devDependencies": {
    "gulp": "^3.9.0",
    "gulp-inject": "^3.0.0",
    "gulp-typescript": "^2.10.0",
    "gulp-tsd": "^0.0.4",
    "tsd": "^0.6.5",
    "typescript": "^1.7.5",
    "ng-annotate-webpack-plugin": "^0.1.2",
    "path": "^0.11.14",
    "webpack": "^1.11.0",
    "webpack-stream": "^2.1.0"
  },
  "dependencies": {
    "angular": "^1.4.8",
    "lodash": "^4.0.0"
  }
```

需要disable visual studio裡面對於typescript的compile，編輯csproj的第一個<PropertyGroup>
```
加入這個讓vs不要在Build的時候編譯Typescript
<TypeScriptCompileBlocked>true</TypeScriptCompileBlocked>
```
另外需要
```
<PropertyGroup Condition=" '$(Configuration)|$(Platform)' == 'Debug|AnyCPU' ">
在這個項目下，增加
<TypeScriptModuleKind>commonjs</TypeScriptModuleKind>
```