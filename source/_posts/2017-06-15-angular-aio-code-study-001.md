---
layout: post
title: '[Angular]angular.io官網程式碼學習筆記001`
comments: true
date: 2017-06-15 10:01:35
categories: Angular
tags: Angular
---

近期 [angular.io](https://angular.io) 換新版，使用 Angular 4 重新撰寫官方網站，速度非常的快，所以就想要從官方出手寫的程式碼學習 Angular 程式碼可以怎麼寫，所以接下來的一系列學習筆記將圍繞的這個主題，程式碼可以從 [github](https://github.com/angular/angular) 下載

<!-- more -->

# main.ts

```typescript
platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {
  if (environment.production && 'serviceWorker' in (navigator as any)) {
    const appRef: ApplicationRef = ref.injector.get(ApplicationRef);
    appRef.isStable.first().subscribe(() => {
      (navigator as any).serviceWorker.register('/worker-basic.min.js');
    });
  }
});
```

`bootstrapModule` 完成後會回傳一個 `NgModuleRef`，可以透過 `ngModuleRef` 的  `injector` 取得 `ApplicationRef`，利用這樣子的寫法，可以將 `service-worker` 注入到網頁裡。原本這一段是寫在 index.html 裡，但透過這樣子的方式註冊，更有彈性，例如我們可以設定只有在 `production`模式下才要註冊 `service-worker`。

# app.component.ts

## template html

使用 Angular Materia 2 當作專案樣式



### gotop anchor

```html
<div id="top-of-page"></div>
```

* GoTOP的錨點



### loading bar

```html
<div *ngIf="isFetching" class="progress-bar-container">
  <md-progress-bar mode="indeterminate" color="warn"></md-progress-bar>
</div>
```

* 顯示條件: `isFetching`是 `true`時
* `<md-progress-bar>` 是一個 materia2 橫向進度顯示物件
* `mode` 可以有以下的參數設定， 共 4 種顯示模式
  * `determinate`: 標準的進度表，從 0 ~ 100 %
  * `indeterminate`: 用來顯示有事情正在進行中
  * `buffer`: 可以同時顯示兩種進度，例如撥放影片時，顯示緩衝讀取進度，與影片撥放進度
  * `query`: 顯示兩種狀態模式，預設顯示樣式為 `indeterminate`反過來的樣式，值到另外一種狀態發生時，就會切換至 `determinate` 模式
* 顏色 `color` 參數
  * Primary
  * Accent
  * Warn
* `Value` 用來設定進度的百分比
* `bufferValue` 用來設定 `buffer`模式下的緩衝進度百分比



### top-menu

```html

<md-toolbar color="primary" class="app-toolbar">
  <button class="hamburger" [class.starting]="isStarting" md-button
    (click)="sidenav.toggle()" title="Docs menu">
    <md-icon [ngClass]="{'sidenav-open': !isSideBySide }" svgIcon="menu"></md-icon>
  </button>
  <a class="nav-link home" href="/"><img src="{{ homeImageUrl }}" title="Home" alt="Home"></a>
  <aio-top-menu *ngIf="isSideBySide" [nodes]="topMenuNodes"></aio-top-menu>
  <aio-search-box class="search-container" #searchBox (onSearch)="doSearch($event)" (onFocus)="doSearch($event)"></aio-search-box>
</md-toolbar>
<aio-search-results #searchResults *ngIf="showSearchResults" (resultSelected)="hideSearchResults()"></aio-search-results>
```

* `<md-toobar>` 可用來當作 `headers`、`titles`、 或 `actions`  的容器
* 可透過 `color` 設定背景顏色: Primary、Accent、Warn
* `<aio-top-menu>` 、`<aio-search-box>`、`<aio-search-results>` 皆為自訂的 component
* `<aio-search-box>`  的行為
  * onFocus: 會根據目前搜尋視窗內的值，進行搜尋的動作
  * onSearch: 每一次 `keyUp` 都會被觸發一次



### content display

```html
<md-sidenav-container class="sidenav-container" [class.starting]="isStarting" [class.has-floating-toc]="hasFloatingToc" role="main">

  <md-sidenav [ngClass]="{'collapsed': !isSideBySide }" #sidenav class="sidenav" [opened]="isOpened" [mode]="mode" (open)="updateHostClasses()" (close)="updateHostClasses()">
    <aio-nav-menu *ngIf="!isSideBySide" [nodes]="topMenuNarrowNodes" [currentNode]="currentNodes?.TopBarNarrow" [isWide]="false"></aio-nav-menu>
    <aio-nav-menu [nodes]="sideNavNodes" [currentNode]="currentNodes?.SideNav" [isWide]="isSideBySide"></aio-nav-menu>

    <div class="doc-version" title="Angular docs version {{currentDocVersion?.title}}">
      <aio-select (change)="onDocVersionChange($event.index)" [options]="docVersions" [selected]="docVersions && docVersions[0]"></aio-select>
    </div>
  </md-sidenav>

  <section class="sidenav-content" [id]="pageId" role="content">
    <aio-doc-viewer [doc]="currentDocument" (docRendered)="onDocRendered()"></aio-doc-viewer>
    <aio-dt [on]="dtOn" [(doc)]="currentDocument"></aio-dt>
  </section>

</md-sidenav-container>
```

* `<md-sidenav-container>` 是用來包 `<md-sidenav>` 及主要顯示內容的容器
* [<md-sidenav>](https://material.angular.io/components/component/sidenav)是顯示側邊選單物件
* `<aio-nav-menu>`、`<aio-select>`、`<aio-doc-viewer>` 及 `<aio-dt>` 皆為自訂 component



### toc

```html
<div *ngIf="hasFloatingToc" class="toc-container" [style.max-height.px]="tocMaxHeight" (mousewheel)="restrainScrolling($event)">
  <aio-toc></aio-toc>
</div>
```

* 針對 `mousewheel` 事件進行判斷，限制頁面滾動的行為
* `<aio-toc>` 為自訂 component

### footer

```html
<footer>
  <aio-footer [nodes]="footerNodes" [versionInfo]="versionInfo" ></aio-footer>
</footer>
```

* `<aio-footer>` 為自訂 component



## class AppComponent

### constructor

注入所需的 `service`

* DocumentService
* ElementRef
* LocationService
* NavigationService
* ScrollService
* SearchService
* SwUpdateNotificationsService
* TocService

### ngOnInit

* 判斷是否有支援 serviceWorker，如果有，則初始化 'search-worker'

```typescript
 // Do not initialize the search on browsers that lack web worker support
if ('Worker' in window) {
  this.searchService.initWorker('app/search/search-worker.js');
  this.searchService.loadIndex();
}
```

* 調整顯示大小，並設定 `<md-sidenav-container>` 的 `class.has-floating-toc` 屬性

```typescript
...
private showFloatingToc = new BehaviorSubject(false);
...
ngOnInit(){
  this.onResize(window.innerWidth);
  ...
  const hasNonEmptyToc = this.tocService.tocList.map(tocList => tocList.length > 0);
  combineLatest(hasNonEmptyToc, this.showFloatingToc)
        .subscribe(([hasToc, showFloatingToc]) => this.hasFloatingToc = hasToc && showFloatingToc);
}

@HostListener('window:resize', ['$event.target.innerWidth'])
onResize(width) {
  this.isSideBySide = width > this.sideBySideWidth;
  this.showFloatingToc.next(width > this.showFloatingTocWidth);
}

```

* 監控並註冊目前所在的 document

```typescript
export interface DocumentContents {
  /** The unique identifier for this document */
  id: string;
  /** The HTML to display in the doc viewer */
  contents: string;
}
//==========================================
currentDocument: DocumentContents;

ngOnInit(){
  ...
    this.documentService.currentDocument.subscribe(doc => {
      this.currentDocument = doc;
      this.setPageId(doc.id);
      this.setFolderId(doc.id);
      this.updateHostClasses();
    });
  ...
}  

setPageId(id: string) {
    // Special case the home page
    this.pageId = (id === 'index') ? 'home' : id.replace('/', '-');
}

setFolderId(id: string) {
    // Special case the home page
    this.folderId = (id === 'index') ? 'home' : id.split('/', 1)[0];
}

// 更新本身component的class
 @HostBinding('class')
  hostClasses = '';

updateHostClasses() {
    const sideNavOpen = `sidenav-${this.sidenav.opened ? 'open' : 'closed'}`;
    const pageClass = `page-${this.pageId}`;
    const folderClass = `folder-${this.folderId}`;
    const viewClasses = Object.keys(this.currentNodes || {}).map(view => `view-${view}`).join(' ');

    this.hostClasses = `${sideNavOpen} ${pageClass} ${folderClass} ${viewClasses}`;
}
```

`documentService.currentDocument`

```typescript
 this.currentDocument = location.currentPath.switchMap(path => this.getDocument(path));

private getDocument(url: string) {
    const id = url || 'index';
    this.logger.log('getting document', id);
    if ( !this.cache.has(id)) {
      this.cache.set(id, this.fetchDocument(id));
    }
    return this.cache.get(id);
}
```

* 監控網址變化，並執行相對應的動作

```typescript
ngOnInit(){
  ...   
  this.locationService.currentPath.subscribe(path => {
    if (path === this.currentPath) {
      // scroll only if on same page (most likely a change to the hash)
      this.autoScroll();
    } else {
      // don't scroll; leave that to `onDocRendered`
      this.currentPath = path;

      // Start progress bar if doc not rendered within brief time
      clearTimeout(this.isFetchingTimeout);
      this.isFetchingTimeout = setTimeout(() => this.isFetching = true, 200);
    }
  });
  ...
}  
  
autoScroll() {
    this.scrollService.scroll();
}
```

* 監控瀏覽的狀態，細部的功能檢視會在看 `navigationService` 時研究

```typescript
/**
 * A map of current nodes by view.
 * This is needed because some urls map to nodes in more than one view.
 * If a view does not contain a node that matches the current url then the value will be undefined.
 */
export interface CurrentNodes {
  [view: string]: CurrentNode;
}
```

```typescript
// <<md-sidenav> 物件
@ViewChild(MdSidenav)
  sidenav: MdSidenav;

currentNodes: CurrentNodes;

ngOnInit(){
  ...   
  this.navigationService.currentNodes.subscribe(currentNodes => {
      this.currentNodes = currentNodes;

      // Preserve current sidenav open state by default
      let openSideNav = this.sidenav.opened;
      // const sideNavView = 'SideNav';
      const isSideNavDoc = !!currentNodes[sideNavView];

      if (this.isSideNavDoc !== isSideNavDoc) {
        // View type changed. Is it now a sidenav view (e.g, guide or tutorial)?
        // Open if changed to a sidenav doc; close if changed to a marketing doc.
        openSideNav = this.isSideNavDoc = isSideNavDoc;
      }
      // May be open or closed when wide; always closed when narrow
      this.sideNavToggle(this.isSideBySide ? openSideNav : false);
  });
  
    // Compute the version picker list from the current version and the versions in the navigation map
    combineLatest(
      this.navigationService.versionInfo.map(versionInfo => ({ title: versionInfo.raw, url: null })),
      this.navigationService.navigationViews.map(views => views['docVersions']),
      (currentVersion, otherVersions) => [currentVersion, ...otherVersions])
      .subscribe(versions => {
        this.docVersions = versions;
        this.currentDocVersion = this.docVersions[0];
      });

    this.navigationService.navigationViews.subscribe(views => {
      this.footerNodes  = views['Footer']  || [];
      this.sideNavNodes = views['SideNav'] || [];
      this.topMenuNodes = views['TopBar']  || [];
      this.topMenuNarrowNodes = views['TopBarNarrow'] || this.topMenuNodes;
    });

    this.navigationService.versionInfo.subscribe( vi => this.versionInfo = vi );
  ...
}  
  
sideNavToggle(value?: boolean) {
    this.sidenav.toggle(value);
 }
```

* 啟動 `swUpdateNotification`

```typescript
ngOnInit(){
  ...
  this.swUpdateNotifications.enable();
  ...
}
```



### onClick

```typescript
@HostListener('click', ['$event.target', '$event.button', '$event.ctrlKey', '$event.metaKey', '$event.altKey'])
onClick(eventTarget: HTMLElement, button: number, ctrlKey: boolean, metaKey: boolean, altKey: boolean): boolean {

  // Hide the search results if we clicked outside both the "search box" and the "search results"
  if (!this.searchElements.some(element => element.nativeElement.contains(eventTarget))) {
    this.hideSearchResults();
  }

  // Show developer source view if the footer is clicked while holding the meta and alt keys
  if (eventTarget.tagName === 'FOOTER' && metaKey && altKey) {
    this.dtOn = !this.dtOn;
    return false;
  }

  // Deal with anchor clicks; climb DOM tree until anchor found (or null)
  let target = eventTarget;
  while (target && !(target instanceof HTMLAnchorElement)) {
    target = target.parentElement;
  }
  if (target instanceof HTMLAnchorElement) {
    return this.locationService.handleAnchorClick(target, button, ctrlKey, metaKey);
  }

  // Allow the click to pass through
  return true;
}
```

監聽頁面上所有的 `click`事件

* 如果在 `search box` 外的地方點擊，會把搜尋結果的區塊隱藏起來。

* win+alt+click on `footer` (1)的地方，會切換顯示/隱藏頁面內容的原始碼(2)

  ![](https://farm5.staticflickr.com/4214/35189085881_94d86e10ae_o.png)

* 處理連結錨點



### onDocRendered

```typescript
onDocRendered() {
  // Stop fetching timeout (which, when render is fast, means progress bar never shown)
  clearTimeout(this.isFetchingTimeout);

  // Put page in a clean visual state
  this.scrollService.scrollToTop();

  // Scroll 500ms after the doc-viewer has finished rendering the new doc
  // The delay is to allow time for async layout to complete
  setTimeout(() => {
    this.autoScroll();
    this.isStarting = false;
    this.isFetching = false;
  }, 500);
}
```

觸發時機點是在`<aio-doc-viewer>`的 `docRendered` output 事件

```html
<aio-doc-viewer [doc]="currentDocument" (docRendered)="onDocRendered()"></aio-doc-viewer>
```



### onDocVersionChange

```typescript
onDocVersionChange(versionIndex: number) {
  const version = this.docVersions[versionIndex];
  if (version.url) {
    this.locationService.go(version.url);
  }
}
```

觸發時機點是在`<aio-select>`下拉選單選擇完後

```typescript
 <aio-select (change)="onDocVersionChange($event.index)" [options]="docVersions" [selected]="docVersions && docVersions[0]"></aio-select>
```



### onScroll

根據滾動的狀態，決定 ToC 的高度

```typescript
// Dynamically change height of table of contents container
@HostListener('window:scroll')
onScroll() {
  if (!this.tocMaxHeightOffset) {
    // Must wait until now for md-toolbar to be measurable.
    const el = this.hostElement.nativeElement as Element;
    this.tocMaxHeightOffset =
      el.querySelector('footer').clientHeight +
      el.querySelector('md-toolbar.app-toolbar').clientHeight +
      44; //  margin
  }

  this.tocMaxHeight = (document.body.scrollHeight - window.pageYOffset - this.tocMaxHeightOffset).toFixed(2);
}
```

```html
<div *ngIf="hasFloatingToc" class="toc-container" [style.max-height.px]="tocMaxHeight"...>
  <aio-toc></aio-toc>
</div
```

### restrainScrolling

限制滑鼠滾輪在 ToC 範圍內的滾動頁面的功能

```typescript
// Restrain scrolling inside an element, when the cursor is over it
  restrainScrolling(evt: WheelEvent) {
    const elem = evt.currentTarget as Element;
    const scrollTop = elem.scrollTop;

    if (evt.deltaY < 0) {
      // Trying to scroll up: Prevent scrolling if already at the top.
      if (scrollTop < 1) {
        evt.preventDefault();
      }
    } else {
      // Trying to scroll down: Prevent scrolling if already at the bottom.
      const maxScrollTop = elem.scrollHeight - elem.clientHeight;
      if (maxScrollTop - scrollTop < 1) {
        evt.preventDefault();
      }
    }
  }
```

```html
<div *ngIf="hasFloatingToc" class="toc-container" ... (mousewheel)="restrainScrolling($event)">
  <aio-toc></aio-toc>
</div>
```

### onKeyUp

使用鍵盤控制頁面功能

* 使用 `/` 進入 `searchbox`
* 使用 `ESC` 取消搜尋結果，並重新將焦點設定於 `searchbox`上

```typescript
@HostListener('document:keyup', ['$event.key', '$event.which'])
onKeyUp(key: string, keyCode: number) {
  // forward slash "/"
  if (key === '/' || keyCode === 191) {
    this.focusSearchBox();
  }
  if (key === 'Escape' || keyCode === 27 ) {
    // escape key
    if (this.showSearchResults) {
      this.hideSearchResults();
      this.focusSearchBox();
    }
  }
}
```

## 筆記

* 有很多事件都被註冊於 app.component 內，主要的原因是 `app.component` 為 `root component` ，除非把網頁關掉，否哲永遠不會被摧毀掉。

* `services` 與 `component` 之間的溝通，大多數都使用 RxJS 的 Subject 作為溝通的橋樑，這樣子 component 或是其他 child component 都可以被通知有資料異動

* `HostListener` 善用第二個參數，只取出需要的屬性即可，即可將程式碼的可讀性大幅的提升

* 適當的使用 `get` 寫法，簡化變數的長度或將判斷邏輯封裝

* 商業邏輯的部分盡量封裝到 `service` 內

* 顯示區塊拆成子 `component` ，透過 `@Input`、`@Output`、`services` 的方式做溝通

* `ViewChildren`的 selector 可以同時撈取多格範本變數(Template Reference Variable)

  ```typescript
   @ViewChildren('searchBox, searchResults', {read: ElementRef})
   searchElements: QueryList<ElementRef>;
  ```

  ​

# 參考資料

* [NgModuleRef](https://angular.io/api/core/NgModuleRef)
* [ApplicationRef](https://angular.io/api/core/ApplicationRef)
* [material2](https://github.com/angular/material2)