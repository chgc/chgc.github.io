---
layout: post
title: "[Angular] ChangeDetectionStrategy"
comments: true
date: 2016-06-05 10:30:35
categories: Angular
tags: Angular
---

Angular2裡面偵測改變的方法有全新的方式，用來提升整體的效能，那針對Component對於偵測改變有一個屬性可以設定，那就是透過 `ChangeDetectionStrategy`

<!-- more -->

根據[官方文件](https://angular.io/docs/js/latest/api/core/ChangeDetectionStrategy-enum.html), ChangeDetectionStrategy有幾種方式

1. CheckOnce
2. Checked
3. CheckAlways
4. Detached
5. OnPush
6. Default

這篇只專注於Default與OnPush這兩種

# Change Detection Strategy

## Default

Example Code

```html
<movie [title]="title" [actor]="actor"></movie>
```

```typescript
title: string = "Movie 1";
actor: Actor =new Actor( 'Bruce', 'Willis');
```

針對movie這個component, 它接收兩種值，一個是string型別的title, 另外一個是Actor型別的物件。

Movie Component會在什麼時機點更新要顯示的內容呢? 如果 ChangeDetectionStrategy是設定在Default的時候，那就是只要傳入的值有異動時，就更新顯示的內容。換句話說, 即使修改actor物件裡面的property, 也會觸發。

## onPush

可是換到onPush的時候就有點不一樣了，他不會將修改actor屬性視為值的異動，只會當一個全新的Actor物件被建立時，才會觸發更新。

這樣的好處是，減少detect Dirty Change的次數. 就預設的方式，如果我的Actor物件裡面有很多屬性，那當每一次其中一個屬性的值被異動時，都會觸發畫面的更新，那就太累了。而onPush是會等一個全新物件被建立時，才會出發。所以只要用要更新的值去建立一個新的物件就好了，這樣子只會被觸發一次。當然效能就會大大的提升

# Immutable

Immuatable是另外一個議題。他的主要精神是。每一次的動作，都會產生一個新的物件，並不會直接修改原始物件內的值，或是使用參址的方式處理資料. 更詳細的內容可以參閱[RxJS](http://reactivex.io/rxjs/)和[Immutable](https://facebook.github.io/immutable-js/)

# 參考文件

- [ChangeDetectionStrategy](https://angular.io/docs/js/latest/api/core/ChangeDetectionStrategy-enum.html)

- [Change Detection Strategy: OnPush](http://ngcourse.rangle.io/handout/change-detection/change_detection_strategy_onpush.html)

  ​