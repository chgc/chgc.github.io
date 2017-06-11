---
layout: post
title: '[Angular] Animation 4.2版 = wow'
comments: true
date: 2017-06-11 09:31:53
categories: Angular
tags: Angular
---

Animation 在  4.2 版以後，整個功能強度往上跳了好幾級，我對 Animation 本身真的沒什麼研究，但是還是盡量整理了一下，新增的功能有哪些(目前尚無完整的文件)

<!-- more -->

# 新增功能

Animation在 4.2 版以後有增加了許多功能，以下一一的整理，如果有遺漏或是不正確的地方，還請指教

## animation

animation 方法讓我們可以使用傳入變數來修改動畫的參數。範例程式碼

```typescript
export declare function animation(steps: AnimationMetadata | AnimationMetadata[], options?: AnimationOptions | null): AnimationReferenceMetadata;
```

```typescript
export let flyIn = animation(
    [
      ...
      group([
        animate(
            '0.3s 0.1s ease',
            style({transform: 'translateX(0px)', width: '{{width}}px'})),
        animate('0.3s ease', style({opacity: 1}))
      ])
    ],
    {params: {width: 120}});
```

透過上述的方式，可以將 animation單獨的抽離出來，也可以給予參數的能力，如果使用這個 animation並沒有帶入任何參數值時，就會使用預設值。

## useAnimation

如果要使用單獨抽離的 animation 時，可以使用 `useAnimation` ，第一個參數是要使用的 animation 名稱，如果使用的 animation 允使使用參數來改變內建的變數，那就可以設定於第二個參數位置

```typescript
export declare function useAnimation(animation: AnimationReferenceMetadata, options?: AnimationOptions | null): AnimationAnimateRefMetadata;
```

```typescript
export var easeOut = animation([
  animate('100ms ease-out')
]);

...  
animations: [trigger(
      'heroState',
      [
        ...
        transition('void => *', [useAnimation(flyIn, {params: {width: 100}})]),      
        ...
      ])]
```

## query

這也是另外一個強大的新功能，這功能允許使用類似 jquery 的 query 功能，透過這個可以快速地針對特定的 HTMLElement 加上動畫

```typescript
animations: [trigger(
      'flyInOut',
      [
       ...
        transition(':enter', [group([
              useAnimation(flyIn, {params: {width: 100}}),
              query('p',
                [
                  style({ opacity: 0 }),
                  animate(4000, style({ opacity: 1 }))
                ])
            ])
        ])
        ...
      ])]
```

```html
<ul>
  <li *ngFor="let hero of heroes" [@flyInOut]="'in'">
    <p>{{hero.name}}</p>
  </li>
</ul>

```

## animateChild

`animateChild` 搭配 `query`的使用，可以觸發內層元件的動畫事件。

```typescript
@Component({
  selector: 'parent-child-component',
  animations: [
    trigger('parentAnimation', [
      transition('false => true', [
        query('header', [
          style({ opacity: 0 }),
          animate(500, style({ opacity: 1 }))
        ]),
        query('@childAnimation', [
          animateChild()
        ])
      ])
    ]),
    trigger('childAnimation', [
      transition('false => true', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ])
    ])
  ]
})
class ParentChildCmp {
  exp: boolean = false;
}
```

```html
<div [@parentAnimation]="exp">
  <header>Hello</header>
  <div [@childAnimation]="exp">
      one
  </div>
  <div [@childAnimation]="exp">
      two
  </div>
  <div [@childAnimation]="exp">
      three
  </div>
</div>
```

## stagger

`stagger` 這個方法可以去設定再跑 ngFor 時，可以讓動畫一筆一筆的跑

```typescript
export declare function stagger(timings: string | number, animation: AnimationMetadata | AnimationMetadata[]): AnimationStaggerMetadata;
```

```typescript
@Component({
   templateUrl: 'list.component.html',
   animations: [
      trigger('listAnimation', [
        transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(100, [
            animate('0.5s', style({ opacity: 0 }))
          ], {optional: true})
        ]),
        query(':enter', [
          style({ opacity: 0 }),
          stagger(100, [
            animate('0.5s', style({ opacity: 1 }))
          ], {optional: true})
        ])
      ])
    ])
  ]
 })
 class ListComponent {
   items = [];

   showItems() {
     this.items = [0,1,2,3,4];
   }

   hideItems() {
     this.items = [];
   }

   toggle() {
     this.items.length ? this.hideItems() : this.showItems();
   }
 }
```

```html
 <button (click)="toggle()">Show / Hide Items</button>
  <hr />
  <div [@listAnimation]="items.length">
    <div *ngFor="let item of items">
      {{ item }}
   </div>
 </div>
```



## AnimationBuilder

`AnimationBuilder` 的 `build` 方法會產生一個 `AnimationFactory`，而 `AnimationFactory` 的 `create` 方法可以產生一個 `AnimationPlayer`，這個 `AnimationPlayer` 是可以被撥放，暫停或停止。這模式可以讓我們用程式碼的方式，建立與 decorator 內 animations 區塊相同功能出來，且可以手動控制執行動畫的時間點。

```typescript
...
export class HeroListComponent {
  constructor(private _builder: AnimationBuilder) {}
  ...
  makeAnimation(element: any) {
    // first build the animation
    const myAnimation = this._builder.build(
        [style({opacity: 0}), animate('0.3s 0.2s ease', style({opacity: 1}))]);

    // then create a player from it
    const player = myAnimation.create(element);
    player.play();
  }
}
```

# 總結

Angular 4.2 版大大的加強 animation 的功能，或許還有些新功能我沒有注意到，但是上述的這些新用法，就已經足以玩出很多種變化。

尤其是讓動畫的效果可以重複使用，對於前端設計者，就可以專注於動畫的設計，而其他對於 animation 不熟悉的人，也可以簡單的使用已經設計好的動畫效果。

非常期待一些大師發布 angular animation 作品，可以讓我們簡單的使用設計好的動畫效果。



