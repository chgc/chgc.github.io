---
layout: post
title:  '[Angular]angular.io官網程式碼學習筆記004'
comments: true
date: 2017-06-19 09:18:33
categories: Angular
tags: Angular
---

這篇會研讀 `<aio-nav-menu>` 及 `<aio-select>` component，就是這一區塊

![](https://farm5.staticflickr.com/4234/35007784610_d8f3bb54a1_o.png)

<!-- more -->

# template

```html
<md-sidenav [ngClass]="{'collapsed': !isSideBySide }" #sidenav class="sidenav" [opened]="isOpened" [mode]="mode"
    (open)="updateHostClasses()" (close)="updateHostClasses()">
    <aio-nav-menu *ngIf="!isSideBySide" [nodes]="topMenuNarrowNodes" [currentNode]="currentNodes?.TopBarNarrow"
      [isWide]="false"></aio-nav-menu>
    <aio-nav-menu [nodes]="sideNavNodes" [currentNode]="currentNodes?.SideNav" [isWide]="isSideBySide"></aio-nav-menu>
   ...
</md-sidenav>
```

* 這裡的 `<aio-nav-menu>`有兩個，依 `isSideBySide` 變數來決定要顯示哪一個，這兩個不會同時存在，判斷的規則是根據視窗大小

```typescript
private sideBySideWidth = 992;

@HostListener('window:resize', ['$event.target.innerWidth'])
onResize(width) {
  this.isSideBySide = width > this.sideBySideWidth;
  ...
}
```

* nodes 的取法，請參閱[這篇文章](http://blog.kevinyang.net/2017/06/15/angular-aio-code-study-002/)

  ```typescript
  this.navigationService.navigationViews.subscribe(views => {
    ...
    this.topMenuNodes = views['TopBar'] || [];
    this.topMenuNarrowNodes = views['TopBarNarrow'] || this.topMenuNodes;
  });
  ```

  ​

# NavMenuComponent

```html
<aio-nav-item *ngFor="let node of filteredNodes" [node]="node" [selectedNodes]="currentNode?.nodes" [isWide]="isWide">
</aio-nav-item>
```

```typescript
export class NavMenuComponent {
  @Input() currentNode: CurrentNode;
  @Input() isWide = false;
  @Input() nodes: NavigationNode[];
  get filteredNodes() { return this.nodes ? this.nodes.filter(n => !n.hidden) : []; }
}
```

# NavItemComponent

## ngOnChanges

```typescript
@Input() isWide = false;
@Input() level = 1;
@Input() node: NavigationNode;
@Input() selectedNodes: NavigationNode[];

ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedNodes'] || changes['node'] || changes['isWide']) {
      if (this.selectedNodes) {
        const ix = this.selectedNodes.indexOf(this.node);
        this.isSelected = ix !== -1; // this node is the selected node or its ancestor
        this.isExpanded = this.isSelected || // expand if selected or ...
          // preserve expanded state when display is wide; collapse in mobile.
          (this.isWide && this.isExpanded);
      } else {
        this.isSelected = false;
      }
    }
    this.setClasses();
}
```

* `ngOnChanges` 的 `changes` 內會包含所有 `@Input` 的變數

## 小技巧

* 如果想要定義的型別，不確定裡面的型態會如何，可以裡用這樣子定義

  ```typescript
  classes: {[index: string]: boolean };
  ```

  這樣定義的資料格式會是 `{ 'level-1': true, collapsed: false}` 

  在 template 上面的用法，f其實還聰明的

  ```html
  [ngClass]="classes"
  ```

# aio-select

* Component 檔案位置: `src/app/shared/select`

* 此 Component 使用 ul 來模擬 select-option的效果

* Version 資訊的來源

  ```typescript
   // Compute the version picker list from the current version and the versions in the navigation
      // map
  combineLatest(
      this.navigationService.versionInfo.map(versionInfo => ({title: versionInfo.raw, url: null})),
      this.navigationService.navigationViews.map(views => views['docVersions']),
      (currentVersion, otherVersions) => [currentVersion, ...otherVersions])
    .subscribe(versions => {
    this.docVersions = versions;
    this.currentDocVersion = this.docVersions[0];
  });
  ```

  * 利用 [`combineLatest`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-combineLatest) 來將兩組資料源合併成一個新的資料源

* `onDocVersionChange` 會跳至所選擇的版本網址

## 小技巧

* `HostListener`搭配 `document:event` 就可以監聽到全域事件
* `constructor`內所取得的 `ElementRef` 就是 `Component` 本身的 DOM 





