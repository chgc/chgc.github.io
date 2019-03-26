---
layout: post
title: '[AngularDart] HttpClient'
comments: true
typora-root-url: ngdart-httpclient
typora-copy-images-to: ngdart-httpclient
date: 2019-03-26 14:05:22
categories: Angular
tags: Angular
---

AngularDart 需要呼叫 API 

AngularDart 需要呼叫 API 

當需要呼叫 API  時，該如何處理? Angular  有 HttpClient 可以使用，那 AngularDart 呢? 好家在的是 Dart 有 `http` 的 library 可以使用，只要在 `pubspec.yaml` 裡面加上 `http: ^0.11.0` 的 package，再調整一下程式碼，就可以呼叫 API 了

<!-- more -->

# 設定

設定 HTTP Service 的方式很簡單，只要在 `main.dart` 做一下設定即可完成

```dart
import 'package:angular/angular.dart';
import 'package:http/browser_client.dart';
import 'package:http/http.dart';
import 'package:helloNgDart/app_component.template.dart' as ng;

import 'main.template.dart' as self;

@GenerateInjector([
  ClassProvider(Client, useClass: BrowserClient),
])
final InjectorFactory injector = self.injector$Injector;

void main() {
  runApp(ng.AppComponentNgFactory, createInjector: injector);
}

```

* 如果在 VSCode 上面開發時，`self.injector$Injector` 會出現紅色底線，但是在編譯時卻不會發現任何錯誤，主要的原因是因為 `main.template.dart` 會在編譯時產出，那時候就不會有任何錯誤
  * [Issue](https://github.com/dart-lang/angular/issues/1716)

# 使用

```dart
import 'dart:convert';
import 'package:angular/angular.dart';
import 'package:http/http.dart';

@Component(
  selector: 'my-app',
  template: '''    
    {{ todo | async | json }}
    ''',
  directives: [],  
  pipes: [AsyncPipe, JsonPipe],
)
class AppComponent implements OnInit {
  final Client _http;
  var todo;  

  AppComponent(this._http);
    
  @override
  ngOnInit() {    
    todo = getAll();
  }

  Future getAll() async {
    try {
      return _http
          .get('https://jsonplaceholder.typicode.com/todos/1')
          .then((resp) => json.decode(resp.body));
    } catch (e) {
        errorMessage = e.toString();
    }
  }
}

```

* 在 `constructor` 的地方注入 `Client` (需 import `package:http/http.dart`)
* `http.get` 會回傳 `Future<Response>` 的資料，可以透過 `.then` 的方式做後續的處理
* `json.decode` 可以做 JSON 文字轉為物件的動作，(來源: `dart:convert`)
* 記得要處理 Exception

## Send data

```dart
static final _headers = {'Content-Type': 'application/json'};

Future<Hero> create(String name) async {
    try {
      final response = await _http.post(_heroesUrl,
          headers: _headers, body: json.encode({'name': name}));
      return Hero.fromJson(_extractData(response));
    } catch (e) {
      throw _handleError(e);
    }
  }
```



# Http Client 介面

`BrowserClient` 常用的方法有

* get(dynamic url, { Map<String, String> headers }) → Future<Response>
* post(dynamic url, { Map<String, String> headers, dynamic body, Encoding encoding }) → Future<Response>
* put(dynamic url, { Map<String, String> headers, dynamic body, Encoding encoding }) → Future<Response>
* patch(dynamic url, { Map<String, String> headers, dynamic body, Encoding encoding }) → Future<Response>
* delete(dynamic url, { Map<String, String> headers }) → Future<Response>
* head(dynamic url, { Map<String, String> headers }) → Future<Response>

# 參考資料

* [HTTP Client](https://webdev.dartlang.org/angular/guide/server-communication)