---
layout: post
title: '[Angular] ngIf 跟他的新朋友 else 和 then'
comments: true
date: 2017-04-19 09:00:36
categories: Angular
tags: Angular
---

Angular 4 將原本的 `ngIf` 的功能給擴充了。多了兩個新朋友 `else` 跟 `then`，就讓我們了解一下用法跟使用情境

<!-- more -->

# else

`else` 比較好理解。就是當 `ngIf` 的條件還是假的時候，就顯示`else`所指定的 `<ng-template>`，先比較之前的寫法與使用 `else`寫法的差異。

## 舊寫法

```html
<div>
  <strong>UserName:</strong>
    <span *ngIf="user|async">
    	{{ (user|asnyc)?.name }}
    </span>    
</div>
```

這樣的寫法個問題，因為 `async` 跑了兩次，所以 user 這個 Observable 也就被執行了兩次 (該Observable沒有設定為multicast的模式)，站在效能的角度來看，並不是很好。

新版的 `ngIf else`的語法就可以幫我們解決這個問題。

## 新寫法

```html
<div>
  <strong>UserName:</strong>
    <span *ngIf="user|async as _user; else elseTmpl">
    	{{ _user.name }}
    </span>
    <ng-template #elseTmpl>
      loading user...
    </ng-template>
</div>
```

*  這個 `as` 可以讓我們將前面的資料儲存成一個變數 (storing the value locally)，供自己的 template 使用。這範例裡 _user 變數就是會儲存 `user`  subscribe 回來的結果，而 `as` 的語法，也可以使用在 `ngFor`的情境[^1]

  [^1]: *ngFor="let user of users | async as _users"

執行效果如下

{%  youtube  AVG4E8mzOzI %}



# then

那 `then` 又是怎麼一回事呢? 我們知道 三元條件運算 的用法 ` condition? true: false` ，而  `then` 在這邊是指 條件為真的情形，就顯示所指定的 `<ng-template>`。

```typescript
@Component({
  selector: 'ng-if-then-else',
  template: `
    <button (click)="show = !show">{{show ? 'hide' : 'show'}}</button>
    <button (click)="switchPrimary()">Switch Primary</button>
    show = {{show}}
    <br>
    <div *ngIf="show; then thenBlock; else elseBlock">this is ignored</div>
    <ng-template #primaryBlock>Primary text to show</ng-template>
    <ng-template #secondaryBlock>Secondary text to show</ng-template>
    <ng-template #elseBlock>Alternate text while primary text is hidden</ng-template>
`
})
class NgIfThenElse implements OnInit {
  thenBlock: TemplateRef<any> = null;
  show: boolean = true;
  @ViewChild('primaryBlock')
  primaryBlock: TemplateRef<any> = null;
  @ViewChild('secondaryBlock')
  secondaryBlock: TemplateRef<any> = null;
  switchPrimary() {
    this.thenBlock = this.thenBlock === this.primaryBlock ? this.secondaryBlock : this.primaryBlock;
  }
  ngOnInit() { this.thenBlock = this.primaryBlock; }
}
```

執行效果如下

{%  youtube  e5JyDE7kCR8 %}



# 參考資料

* [NgIf](https://angular.io/docs/ts/latest/api/common/index/NgIf-directive.html)

  ​