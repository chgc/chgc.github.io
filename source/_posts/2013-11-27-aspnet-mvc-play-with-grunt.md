---
layout: post
title: '[ASP.NET MVC] Play with Grunt (typescript ...)'
date: 2013-11-27 02:13
comments: true
categories: 'ASP.NET MVC'
tag: ['MVC 4', 'Javascript']
---

#Grunt
Need: Node.js installed

Install Steps

1. Installing the CLI
   run command

```
npm install -g grunt-cli
```

2. edit package.json and Gruntfile.js

```json
{
  "devDependencies": {
    "grunt": "0.4.1",
    "grunt-ts": "latest"
  }
}
```

### run npm install in command

```javascript
module.exports = function (grunt) {
  // load the task
  grunt.loadNpmTasks('grunt-ts');

  // Configure grunt here

  grunt.initConfig({
    ts: {
      dev: {
        // a particular target
        src: ['app/**/*.ts'], // The source typescript files, http://gruntjs.com/configuring-tasks#files
        html: ['app/**/*.html'], // The source html files, https://github.com/basarat/grunt-ts#html-2-typescript-support
        reference: './reference.ts', // If specified, generate this file that you can use for your reference management
        out: 'app/app.js', // If specified, generate an out.js file which is the merged js file
        watch: 'app',
      },
    },
  });
  grunt.registerTask('default', ['ts:dev']);
};
```

### run grunt in command

這樣子 grunt 就會監控 在 app 資料夾下的 ts 檔案異動，並同時做 complie 的動作，如果有錯誤，會產生 complie error 的訊息。
