---
layout: post
title: '[Angular] Outputs & Inputs'
date: 2016-01-14 15:15
comments: true
categories: "Angular"
tag: "Angular"
---
Angular 在 Components之間的值得傳遞方式分割成Inputs和Outputs.
寫法如下
```
@Components({
     ....,
     inputs:['init'],
     outputs:['finish'] 
})
export class xxx(){
	okEvent: EventEmitter<any> = new EventEmitter();
  
  ok(){
     // this should match the type define in EventEmitter
     this.okEvent.emit('the value want to pass');
  }
}

// in another components
<ddd (finish)="finish($event)" [init]="value pass in"></ddd>

$event => will catch the return value
```
另外一種寫法
```
import { Component, View, Input, Output, EventEmitter } from 'angular2/angular2';

@Components({
     ....
})
export class xxx(){
  @Input() init;
  // @Output(alias name)
  @Output('finish') okEvent:EventEmitter<Any> = new EventEmitter();

  
  ok(){
     // this should match the type define in EventEmitter if use typescript
     this.okEvent.emit('the value want to pass');
  }
}

// in another components
<ddd (finish)="finish($event)" [init]="value pass in"></ddd>

$event => will catch the return value
```