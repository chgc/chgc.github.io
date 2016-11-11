---
layout: post
title: '[Angular2]Component Interaction'
comments: true
date: 2016-11-11 21:42:08
categories: Angular
tags: Angular2
---

Component在Angular2的世界裡是很多變也很重要的。在一個網站裡會存在很多Component，如何讓Component與Component之間做交流，當然也是一個很重要的課題

<!-- more -->

# 從父元件傳資料至子元件

Component可以對外定義可以接收資料的欄位. 利用[@Input decorations](https://angular.io/docs/ts/latest/guide/template-syntax.html#inputs-outputs) 

```typescript
@Component({
  selector: 'hero-child',
  template: `
    <h3>{{hero.name}} says:</h3>
    <p>I, {{hero.name}}, am at your service, {{masterName}}.</p>
  `
})
export class HeroChildComponent {
  @Input() hero: Hero;
  @Input('master') masterName: string;
}
```

從父元件使用這個子元件的方式

```html
<hero-child [hero]="hero" [master]="master"></hero-child>
```

## 細節說明

### @Input

@Input的Interface, @Input可以在小括號內指定對外的property name.

```typescript
export interface Input {
    /**
     * Name used when instantiating a component in the template.
     */
    bindingPropertyName?: string;
}
```

而接續在@input() 後面的是在該Component內所使用的變數，也可以指定型別給他。當然也可以分成兩行寫

```typescript
@Input()
private hero: Hero;	
```

或是自訂Setter/Getter

```typescript
  private _name: string = '<no name set>';
  @Input()
  set name(name: string) {
    this._name = (name && name.trim()) || '<no name set>';
  }
  get name() { return this._name; }
```



### @Output

如果想要從元件內的值往外傳的時候，可以使用 [@Output decoration](https://angular.io/docs/ts/latest/guide/template-syntax.html#inputs-outputs), 但是@Ouput只限定於Event

```typescript
 export class VoterComponent {
  @Input()  name: string;
  @Output() onVoted = new EventEmitter<boolean>();
  
  vote(agreed: boolean) {
    this.onVoted.emit(agreed);  
  }
}
```

父元件使用這個子元件的方式

```html
<my-voter (onVoted)="onVoted($event)"></my-voter>	
```

```typescript
export class VoteTakerComponent {
  agreed = 0;
  disagreed = 0;  
  onVoted(agreed: boolean) {
    agreed ? this.agreed++ : this.disagreed++;
  }
}
```

[EventEmitter](https://angular.io/docs/ts/latest/api/core/index/EventEmitter-class.html)的emit([value])會將值讓註冊在該屬性欄位的方法知道。

### ngOnChanges

當Input的值被改變時，會觸發ngOnChanges事件。更多關於 `ngOnChanges` ，請參閱 [LifeCycle Hooks](https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html) 

```typescript
ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      let from = JSON.stringify(changedProp.previousValue);
      let to =   JSON.stringify(changedProp.currentValue);
      log.push( `${propName} changed from ${from} to ${to}`);
    }
    this.changeLog.push(log.join(', '));
  }
```

[read more](https://angular.io/docs/ts/latest/cookbook/component-communication.html#!#parent-to-child-on-changes)



# 父元件操作子元件的屬性及方法

父元件可以透過給予子元件一個RefId後，直接使用子元件內的方法與屬性

```typescript
import { Component }                from '@angular/core';
import { CountdownTimerComponent }  from './countdown-timer.component';

@Component({
  selector: 'countdown-parent-lv',
  template: `
  <h3>Countdown to Liftoff (via local variable)</h3>
  <button (click)="timer.start()">Start</button>
  <button (click)="timer.stop()">Stop</button>
  <div class="seconds">{{timer.seconds}}</div>
  <countdown-timer #timer></countdown-timer>
  `  
})
export class CountdownLocalVarParentComponent {}
```

或父元件可以透過@ViewChild來操作子元件的方法與屬性

```typescript
import { Component }                from '@angular/core';
import { CountdownTimerComponent }  from './countdown-timer.component';

@Component({
  selector: 'countdown-parent-lv',
  template: `
  <h3>Countdown to Liftoff (via local variable)</h3>
  <button (click)="start()">Start</button>
  <button (click)="stop()">Stop</button>
  <div class="seconds">{{timer.seconds}}</div>
  <countdown-timer #timer></countdown-timer>
  `
})
export class CountdownLocalVarParentComponent {
  // this
  @ViewChild('timer')
    private timer: CountdownTimerComponent;
  // or this
  @ViewChild(CountdownTimerComponent)
    private timer: CountdownTimerComponent;

  start(){
    this.timer.start();
  }

  stop(){
    this.timer.stop();
  }
}
```

# 透過Service的方式讓父與子元件互相溝通

這個需要使用到RxJS的[Object](http://blog.kevinyang.net/2016/10/06/rx-subject/)來達成這個功能。

```typescript
import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
@Injectable()
export class MissionService {
  // Observable string sources
  private missionAnnouncedSource = new Subject<string>();
  private missionConfirmedSource = new Subject<string>();
  // Observable string streams
  missionAnnounced$ = this.missionAnnouncedSource.asObservable();
  missionConfirmed$ = this.missionConfirmedSource.asObservable();
  // Service message commands
  announceMission(mission: string) {
    this.missionAnnouncedSource.next(mission);
  }
  confirmMission(astronaut: string) {
    this.missionConfirmedSource.next(astronaut);
  }
}
```

利用subscribe和執行service的方法來達成訊息交換的功能



# 結語

Component與Component之間的溝通方式基本上並不困難，但是很多情形是有太多Component與資料間的相依關係讓事情變得很複雜，所以如何最好Component的規劃是一個需要經驗的課題，只好不斷的從實做中整理出規則。



# Reference

- [Angular2 Cookbook - Component Interaction](https://angular.io/docs/ts/latest/cookbook/component-communication.html)
- [RxJS - Subject](http://reactivex.io/rxjs/manual/overview.html#subject)

