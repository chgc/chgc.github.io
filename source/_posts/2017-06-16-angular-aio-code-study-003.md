---
layout: post
title: '[Angular]angular.io官網程式碼學習筆記003'
comments: true
date: 2017-06-16 10:00:22
categories: Angular
tags: Angular
---

繼續[筆記002](http://blog.kevinyang.net/2017/06/15/angular-aio-code-study-002/)，繼續研究下去。這篇會研讀 `<aio-search-box>` 與 `<aio-search-result>` component

<!-- more -->

# aio-search-box

## 檔案位置

>  src/app/search/search-box

## search-box.component

```typescript
@Component({
  selector: 'aio-search-box',
  template: `<input #searchBox
    type="search"
    aria-label="search"
    placeholder="Search"
    (input)="doSearch()"
    (keyup)="doSearch()"
    (focus)="doFocus()"
    (click)="doSearch()">`
})
export class SearchBoxComponent implements OnInit {
 ...
}

```

### ngOnInit

如果網址有類似這種情況時 `https://angular.io/?search=xxxxxx`， 會預先使用網址的查詢條件並執行搜尋

```typescript
ngOnInit() {
    const query = this.locationService.search()['search'];
    if (query) {
      this.query = query;
      this.doSearch();
    }
}
```

locationService.search() 的程式碼如下

```typescript
search(): { [index: string]: string; } {
    const search = {};
    const path = this.location.path();
    const q = path.indexOf('?');
    if (q > -1) {
      try {
          const params = path.substr(q + 1).split('&');
          params.forEach(p => {
            const pair = p.split('=');
            if (pair[0]) {
              search[decodeURIComponent(pair[0])] = pair[1] && decodeURIComponent(pair[1]);
            }
          });
      } catch (e) { /* don't care */ }
    }
    return search;
}
```

### doSearch()

```typescript
private searchSubject = new Subject<string>();

@Output() onSearch = this.searchSubject.distinctUntilChanged();

doSearch() {
    this.searchSubject.next(this.query);
}
```

* `searchSubject` 是 @Output，所以會將查詢條件輸出並觸發 `app.component.ts` 的搜尋功能

  * `app.component.ts` 的 `doSearch(query)` 會執行 `searchService.search(query)` 的動作，並判斷是否要顯示 `aio-search-result` 

    ```typescript
    doSearch(query) {
        this.searchService.search(query);
        this.showSearchResults = !!query;
    }
    ```

* 另外一個要注意的地方是，這一個 `@Output onSearch` 是使用 Subject 的方式作為溝通介面，以下幾點原因

  * `EventEmitter` 的本質原本就是 `Subject`，所以使用 `Subject` 做替換是沒有問題的
  * 直接使用 Subject 而不使用 `EventEmitter` 的好處是，可以搭配 RxJS 的 Operator，例如 `distinctUntilChanged`
  * 使用 [distinctUntilChanged](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-distinctUntilChanged) 可以減少不必要的執行查詢的動作



### doFocus()

```typescript
@Output() onFocus = new EventEmitter<string>();
doFocus() {
  this.onFocus.emit(this.query);
}

focus() {
  this.searchBox.nativeElement.focus();
}
```

* 當停駐於這個物件時，也會觸發搜尋功能
* `focus()` 是公開方法，可以讓游標停留在搜尋欄位。



 ### 小技巧

```typescript
@ViewChild('searchBox') searchBox: ElementRef;

private get query() { return this.searchBox.nativeElement.value; }
private set query(value: string) { this.searchBox.nativeElement.value = value; }
```

使用 getter / setter 的方式，來簡化程式碼的撰寫，這個專案內，這技巧到處都可以看到。





# aio-search-result

## 檔案位置

>  src/app/search/search-results

## search-results.component

### 樣板

```html
<div class="search-results">
  <div *ngIf="searchAreas.length; then searchResults; else notFound"></div>
</div>

<ng-template #searchResults>
  <h2 class="visually-hidden">Search Results</h2>
  <div class="search-area" *ngFor="let area of searchAreas">
    <h3>{{area.name}} ({{area.pages.length + area.priorityPages.length}})</h3>
    <ul class="priority-pages" >
      <li class="search-page" *ngFor="let page of area.priorityPages">
        <a class="search-result-item" href="{{ page.path }}" (click)="onResultSelected(page)">
          <span class="symbol {{page.type}}" *ngIf="area.name === 'api'"></span>{{ page.title }}
        </a>
      </li>
    </ul>
    <ul>
      <li class="search-page" *ngFor="let page of area.pages">
        <a class="search-result-item" href="{{ page.path }}" (click)="onResultSelected(page)">
          <span class="symbol {{page.type}}" *ngIf="area.name === 'api'"></span>{{ page.title }}
        </a>
      </li>
    </ul>
  </div>
</ng-template>

<ng-template #notFound>
  <p>No results found.</p>
</ng-template>

```

* 利用 `ngIf then else` 搭配 `<ng-template>` 加樣版變數來控制要顯示的內容區塊

### ngOnInit

```typescript
ngOnInit() {
    this.resultsSubscription = this.searchService.searchResults
        .subscribe(search => this.searchAreas = this.processSearchResults(search));
}
```

* 註冊 searchService的 searchResults
* 當有資料產生時經過 `processSearchResults` 處理後，再將其結果顯示

### ngOnDestory

```typescript
ngOnDestroy() {
    this.resultsSubscription.unsubscribe();
}
```

* 取消`searchService.searchResults` 的訂閱

### processSearchRestuls

```typescript
export interface SearchResults {
  query: string;
  results: SearchResult[];
}

export interface SearchResult {
  path: string;
  title: string;
  type: string;
  titleWords: string;
  keywords: string;
}
```

```typescript
private processSearchResults(search: SearchResults) {
    const searchAreaMap = {};
    search.results.forEach(result => {
      if (!result.title) { return; } // bad data; should fix
      const areaName = this.computeAreaName(result) || this.defaultArea;
      const area = searchAreaMap[areaName] = searchAreaMap[areaName] || [];
      area.push(result);
    });
    const keys = Object.keys(searchAreaMap).sort((l, r) => l > r ? 1 : -1);
    return keys.map(name => {
      let pages: SearchResult[] = searchAreaMap[name];

      // Extract the top 5 most relevant results as priorityPages
      const priorityPages = pages.splice(0, 5);
      pages = pages.sort(compareResults);
      return { name, pages, priorityPages };
    });
}
// Split the search result path and use the top level folder, if there is one, as the area name.
private computeAreaName(result: SearchResult) {
  if (this.topLevelFolders.indexOf(result.path) !== -1) {
    return result.path;
  }
  const [areaName, rest] = result.path.split('/', 2);
  return rest && areaName;
}

// outside class
function compareResults(l: {title: string}, r: {title: string}) {
  return l.title.toUpperCase() > r.title.toUpperCase() ? 1 : -1;
}
```

* 將結果依組別並字母排序顯示

