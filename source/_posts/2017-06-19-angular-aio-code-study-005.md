---
layout: post
title: '[Angular]angular.io官網程式碼學習筆記005'
comments: true
date: 2017-06-19 14:39:30
categories: Angular
tags: Angular
---

`<aio-doc-viewer>`  Component 是顯示主要內容的區域，來研讀一下是如何動態抽換顯示內容的

<!-- more -->

`<aio-doc-viewer>` 預設的 template 是空白的，所以並沒有預設的 html template, `<aio-doc-viewer>` 是類似 placeholder 的角色，用來定位內容顯示位置用

# 初始值

```typescript
const initialDocViewerElement = document.querySelector('aio-doc-viewer');
const initialDocViewerContent = initialDocViewerElement ? initialDocViewerElement.innerHTML : '';
```

這兩行是定義在 class DocViewerComponent，主要的用途是避免畫面閃爍

# constructor

constructor 共注入了以下幾個 provider

* ComponentFactoryResolver：用來動態產生 component 的方法
* ElementRef：當下 Component 的 DOM 參考
* EmbeddedComponents：可以動態載入的自訂component 陣列
* Injector：可以手動取得 provider 的方法
* Title：用來更新網頁標題的服務
* TocService：自訂的 service，負責 TOC 區塊的相關行為

## 建立 components

```typescript
interface EmbeddedComponentFactory {
  contentPropertyName: string;
  factory: ComponentFactory<any>;
}

private embeddedComponentFactories: Map<string, EmbeddedComponentFactory> = new Map();

constructor(...){
  ...
  for (const component of embeddedComponents.components) {
    const factory = componentFactoryResolver.resolveComponentFactory(component);
    const selector = factory.selector;
    const contentPropertyName = this.selectorToContentPropertyName(selector);
    this.embeddedComponentFactories.set(selector, { contentPropertyName, factory });
  }
}
```

根據預先設定好的 components 陣列，分別動態建立 componentFactory，供之後顯示使用

### selectorToContentPropertyName

```typescript
private selectorToContentPropertyName(selector: string) {
    return selector.replace(/-(.)/g, (match, $1) => $1.toUpperCase()) + 'Content';
}
```

 執行效果:

```typescript
selector = 'aio-doc-viewer';
selectorToContentPropertyName(selector); //輸出結果: aioDocViewerContent
```



# 觸發點 - set doc

當外部指定新的 `DocumentContents` 至 `DocViewerComponent` 時，需要執行的工作

```typescript
@Output()
docRendered = new EventEmitter();

@Input()
set doc(newDoc: DocumentContents) {
  this.ngOnDestroy();
  if (newDoc) {
    this.build(newDoc);
    this.docRendered.emit();
  }
}
```

* 先清空現有的狀態
* 重新建置要顯示的內容
* 當建置完成後，透過 `docRendered` 發出完成通知



## ngOndestory

```typescript
ngOnDestroy() {
  // destroy these components else there will be memory leaks
  this.embeddedComponents.forEach(comp => comp.destroy());
  this.embeddedComponents.length = 0;
}
```

* 摧毀產生的 `componennts`
* 將 `embeddedComponents` 清空



## build

```typescript
private build(doc: DocumentContents) {

  // security: the doc.content is always authored by the documentation team
  // and is considered to be safe
  this.hostElement.innerHTML = doc.contents || '';

  if (!doc.contents) { return; }

  this.addTitleAndToc(doc.id);

  // TODO(i): why can't I use for-of? why doesn't typescript like Map#value() iterators?
  this.embeddedComponentFactories.forEach(({ contentPropertyName, factory }, selector) => {
    const embeddedComponentElements = this.hostElement.querySelectorAll(selector);

    // cast due to https://github.com/Microsoft/TypeScript/issues/4947
    for (const element of embeddedComponentElements as any as HTMLElement[]){
      // hack: preserve the current element content because the factory will empty it out
      // security: the source of this innerHTML is always authored by the documentation team
      // and is considered to be safe
      element[contentPropertyName] = element.innerHTML;
      this.embeddedComponents.push(factory.create(this.injector, [], element));
    }
  });
}
```

* 調整網頁的抬頭並建立 TOC 樣版
* 由於官網的 docContent 都是預先產生的，所以這裡認定為無安全性的問題。實務上也請盡量避免直接操作 DOM，以避免不必要的問題
* 根據 content html 的內容，決定要產生哪些 component
* 透過在 constructor 存入的 `componentFactory` 來建立 `component`，並將建立後的 `componentRef` 存入至 `embeddedComponents` 陣列中



## addTitleAndToc

```typescript
private addTitleAndToc(docId: string) {
  this.tocService.reset();
  let title = '';
  const titleEl = this.hostElement.querySelector('h1');
  // Only create TOC for docs with an <h1> title
  // If you don't want a TOC, add "no-toc" class to <h1>
  if (titleEl) {
    title = titleEl.innerText.trim();
    if (!/(no-toc|notoc)/i.test(titleEl.className)) {
      this.tocService.genToc(this.hostElement, docId);
      titleEl.insertAdjacentHTML('afterend', '<aio-toc class="embedded"></aio-toc>');
    }
  }
  this.titleService.setTitle(title ? `Angular - ${title}` : 'Angular');
}
```

* 透過 `insertAdjacentHTML ` 將內容新增到想要的位置

# DoCheck

```typescript
private embeddedComponents: ComponentRef<any>[] = [];

ngDoCheck() {
    this.embeddedComponents.forEach(comp => comp.changeDetectorRef.detectChanges());
}
```

* 每次當畫面上有觸發 `Check` 動作時，執行每一個動態產生的 `componentRef`  的 `changeDetectorRef` 的 `detectChagnes` (功能: 檢查是否有資料異動)
* `ChangeDetectorRef` 是的功能是用來檢查資料異動並同步頁面與程式。在每一個 Component 都會有自己的 ChangeDetector。



# 參考資料

* [ComponentFactoryResolver](https://angular.io/api/core/ComponentFactoryResolver)
* [ComponentFactory](https://angular.io/api/core/ComponentFactory)
* [Injector](https://angular.io/api/core/Injector)
* [Title](https://angular.io/api/platform-browser/Title)
* [ComponentRef](https://angular.io/api/core/ComponentRef)
* [ChangeDetectorRef](http://localhost:4200/api/core/ChangeDetectorRef)
* [insertAdjacentHTML](https://developer.mozilla.org/zh-TW/docs/Web/API/Element/insertAdjacentHTML)