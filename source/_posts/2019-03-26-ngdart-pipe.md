---
layout: post
title: '[AngularDart] Pipe'
comments: true
typora-root-url: ngdart-pipe
typora-copy-images-to: ngdart-pipe
date: 2019-03-26 08:39:37
categories: Angular
tags: Angular
---

[上一篇](<https://blog.kevinyang.net/2019/03/25/ngdart-component/>) 提到在 Angular Dart 版本的 Component 如果要使用到 `ngIf` 這一類的 `directive` 時，需要在該 `component` 將 `coreDirectives` 加到 `component` 的 `metadata` 內，而要使用內建 `pipe` 或是自訂 `pipe` 時，也需要比照辦理，但唯一的差異是必須分別加

<!-- more -->

# 內建 Pipe

AngularDart 內建的 Pipe 有以下幾個

* [AsyncPipe](https://webdev.dartlang.org/api/angular/angular/AsyncPipe-class)
* [CurrencyPipe](https://webdev.dartlang.org/api/angular/angular/CurrencyPipe-class)
* [DatePipe](https://webdev.dartlang.org/api/angular/angular/DatePipe-class)
* [DecimalPipe](https://webdev.dartlang.org/api/angular/angular/DecimalPipe-class)
* [JsonPipe](https://webdev.dartlang.org/api/angular/angular/JsonPipe-class)
* [LowerCasePipe](https://webdev.dartlang.org/api/angular/angular/LowerCasePipe-class)
* [PercentPipe](https://webdev.dartlang.org/api/angular/angular/PercentPipe-class)
* [ReplacePipe](https://webdev.dartlang.org/api/angular/angular/ReplacePipe-class)
* [SlicePipe](https://webdev.dartlang.org/api/angular/angular/SlicePipe-class)
* [UpperCasePipe](https://webdev.dartlang.org/api/angular/angular/UpperCasePipe-class)

# 自訂 Pipe

自訂 Pipe 的方式也很簡單，只需要實做 `PipeTransform` 介面即可，以下有一個簡單的範例

```dart
import 'dart:math' as math;
import 'package:angular/angular.dart';

/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 |  exponentialStrength:10}}
 *   formats to: 1024
 */
@Pipe('exponentialStrength')
class ExponentialStrengthPipe extends PipeTransform {
  num transform(num value, num exponent) => math.pow(value ?? 0, exponent ?? 1);
}
```

當寫完自訂 pipe 要在 `component` 使用時，務必記得要在 component  的 `pipes` 加入該 pipe class，不然會出現編譯錯誤的訊息

既然是自訂 Pipe，就一定會遇到 `pure` 與 `impure` pipe 的問題，因為 Dart 語言每一個型別都是 `Object` ，所以要稍微留意一下這部分，像是 List 的操作，就必須留意 `pure` 與 `impure` 的設定

設定為 `impure` 的方式為

```dart
@Pipe('flyingHeroes', pure: false)
```

# AsyncPipe

AsyncPipe 在 Angular 可以用來接 Promise 或是 Observable，而在 AngularDart 內，可以接 Future 或是 Stream 型別的資料，使用方法是一樣的

```dart
import 'dart:async';
import 'package:angular/angular.dart';

@Component(
  selector: 'hero-message',
  template: '''
    <h2>Async Hero Message and AsyncPipe</h2>
    <p>Message: {{ message | async }}</p>
    <button (click)="resend()">Resend</button>
  ''',
  pipes: [commonPipes],
)
class HeroAsyncMessageComponent {
  static const _msgEventDelay = Duration(milliseconds: 500);

  Stream<String> message;

  HeroAsyncMessageComponent() {
    resend();
  }

  void resend() {
    message =
        Stream.periodic(_msgEventDelay, (i) => _msgs[i]).take(_msgs.length);
  }

  List<String> _msgs = <String>[
    'You are my hero!',
    'You are the best hero!',
    'Will you be my hero?'
  ];
}
```

# 參考文件

* [Pipes](https://webdev.dartlang.org/angular/guide/pipes)

