---
layout: post
title: '[Angular] ng-repeat 結束時觸發其他動作'
date: 2014-02-20 06:26
comments: true
categories: "Angular"
tag: "Angular"
---
如果想要知道ng-repeat什麼時候結束，可以透過$last的值知道最後的值是什麼，但是如果要觸發另外一個method..就..需要另外寫directive來處理這類的事情

參閱網路上的資料整理成以下的code

因為是用typescript寫的，如果要轉換，就自行在轉換吧

directive:

```
directives.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});
```

controller:
```
// 監控 attr.onFinishRender(傳進去的值)=>這裡用scrollToEnd
this.$scope.$on('scrollToEnd', () => {
             // do whatever you want                
            });
```

html
```
<div ng-repeat="item in items" on-finish-render="scrollToEnd">
blah blah balh
</div>
```


## 同場加映

忘了從那一版開始
ng-repeat有 __ng-repeat-start__ and __ng-repeat-end__
用法是, 可以更漂亮的處理要repeat的樣板
```
<header ng-repeat-start="item in items">
  Header {{ item }}
</header>
<div class="body">
  Body {{ item }}
</div>
<footer ng-repeat-end>
  Footer {{ item }}
</footer>
```
可上官網上面參閱用法  http://code.angularjs.org/1.2.10/docs/api/ng.directive:ngRepeat

