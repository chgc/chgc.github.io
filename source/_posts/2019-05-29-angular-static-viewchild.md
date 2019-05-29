---
layout: post
title: '[Angular] Static Query 是什麼?'
comments: true
typora-root-url: 2019-05-29-angular-static-viewchild/
typora-copy-images-to: 2019-05-29-angular-static-viewchild/
date: 2019-05-29 22:00:12
categories: Angular
tags: Angular
---

Angular 8 在五月底正式釋出，而這次的釋出裡面有一個更新屬於新設定，觀念上是有需要調整的，所以寫了這篇文章釐清一下

<!-- more -->

所謂的 Query 上的改變，是針對 `ViewChild` / `ContentChild` 這一類的 decorator 做額外的設定，以前我們的程式碼會這樣子寫

```typescript
@ViewChild('foo') foo: ElementRef
```

這樣子寫在取得內容的時間點，有時候會是在 `Oninit` 有時候需要在 `ngAfterViewInit` 時才可以取得。稍微分析一下為什麼會有這樣子的時間點上的差異性

1. 當所要查詢的 Element 上沒有任何 `*ngIf` 或是 `*ngFor` 的 directive 時，該 element 一開始就已經存在，不需要再經過 Angular 做額外的判斷 (頁面處理)，這時候就可以在 `OnInit` 這階段取得該 Element 的相關資訊

![1559139325690](1559139325690.png)

2. 當有使用到 `*ngIf` 或是 `*ngFor` 時，就會出現另外一種狀態

![1559139445907](1559139445907.png)

以上就是同一種寫法卻有可能在兩種地方取得物件，這一個問題 Angular 團隊想要透過手動設定的方式來告訴底層的 compiler 在何時取得物件

# 在 Version 8 (過度時期)

當在寫 `@ViewChild` 或是 `@ContentChild` 時，就必須明確的標示第二個參數 `{ static: true | false}`，這參數的設定意義分別為

* 當設定為 `true` 時，只會在 `ngOnInit` 的地方取得 Element 物件

  ![1559139827426](1559139827426.png)

  當設定為 `{ static: true }` 時，在加上 ` ngIf` 的條件，在 `ngAfterViewInit` 的地方依舊取不到該 Element 物件，原因是 Angular Compiler 認定該 Element 為 static ，所以只會在 OnInit 的地方取一次，之後就不會被執行

  ![1559140008278](1559140008278.png)

  所以當遇到這種情形，就必須將 `static` 設定為 `false`

* 當設定為 `false` 時，只會在 `ngAfterViewInit` 的地方取得 Element 物件

  ![1559140094660](1559140094660.png)

  

# 最後

而這一個 API 改變是暫時性的，在 Angular 9 這一個參數的預設值會是 `false`，之後就又會回到一般的使用方式。在下面的參考文件中的後半段，有一些 QA 的內容，如果對於這樣子的設定有問題的，也可以閱讀那邊的回答

# 參考資料

* [Static Query Migration Guide](https://angular.io/guide/static-query-migration)

