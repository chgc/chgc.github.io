---
layout: post
title: '[Flutter] Provider'
comments: true
typora-root-url: flutter-provider
typora-copy-images-to: flutter-provider
date: 2019-10-12 12:45:44
categories: Flutter
tags: Flutter
---

Flutter 內狀態管理的方法很多種，先從包裝好的 `provider` package 先研究起，[pub 網址]( https://pub.dev/packages/provider )

<!-- more -->

# Basic


Provider 是 Dependency injection 和 state manager 的混和體，使用 provider 可以讓我們很容易的重複使用 wigdet class，並確保幾件事情

1. 維護姓，單一方向的資料流
2. 測試性，容易 mock service 
3. 健全性，不容易遺忘處理更新事件

Provider 的安裝方式很簡單，在 ` pubspec.yaml ` 的 dependcies 內加入 provider 套件即可。然後再 flutter pub get 安裝

```
dependencies:
  provider: ^3.1.0
```



# 設定方式

如果只需要設定單一 `provider` ，有兩種設定方式

1. 使用 `Provider<T>.value()`

    ```dart
    Provider<String>.value(
      value: 'Hello World',
      child: MaterialApp(
        home: Home(),
      )
    )
    ```

2. 比較複雜的情況，像是要處理 `constructor` 或是 `dispose` 時，可以使用這種設定方式

   ```dart
   Provider<MyComplexClass>(
     builder: (context) => MyComplexClass(),
     dispose: (context, value) => value.dispose()
     child: SomeWidget(),
   )
   ```


不論是哪一種方式，使要是被 provider 包起來的 child widget，都能讀取設定的 provider，但通常我們需要註冊的 service 不只有一個，這時候就可以使用多層 provider 設定的寫法

```dart
MultiProvider(
  providers: [
    Provider<String>.value(value: 'Provider Rocks'),
    Provider(builder: (context) => AppConfig,)
  ],
  child: someWidget,
)
```

# 取用方式

如何在不同的 widget 中取得 provider 內的 services 呢? 有以下幾種做法

1. 在 `build(context)` 下，可以單純的使用 `Provider.of<T>(context)` 的方式取得，因為 `Provider` 就是 `Inheritedwidget` 的實作

   ```dart
   class DemoWidget extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       var title = Provider.of<String>(context);
       return Container(child: Text(title));
     }
   }
   ```

2. 假設 widget 並不是直接放在 `build` 下面時，因為沒有方法直接存取 `context` ，這時候就可以使用 `consumer` 來存取 provider

   ```dart
   class DemoWidget extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       var title = Provider.of<String>(context);
       return Container(child: titleWidget);
     }
   
     Widget titleWidget = Consumer<String>(
       builder: (context, title, child) => Text(title),
     );
   }
   ```

3. 更進一步的可以使用 `selector` 來提升 app 效能，可以設定依某條件才觸發更新

   ```dart
   Selector<List, int>(
     selector: (_, list) => list.length, // 觸發條件
     builder: (_, length, __) {
       return Text('$length');
     }
   )
   ```

假設同時需要存取多個 provider 時，可以這樣子寫，以此類推，最多到 6 個

```dart
  Widget titleWidget = Consumer2<String, AppConfig>(
    builder: (context, title, appConfig, child) => Text(title),
  );
```

# 其他 Provider 類型

除了 Provider 外，還有其他延伸變化類型的 provider

| name                                                         | description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [Provider](https://pub.dartlang.org/documentation/provider/latest/provider/Provider-class.html) | The most basic form of provider. It takes a value and exposes it, whatever the value is. |
| [ListenableProvider](https://pub.dartlang.org/documentation/provider/latest/provider/ListenableProvider-class.html) | A specific provider for Listenable object. ListenableProvider will listen to the object and ask widgets which depend on it to rebuild whenever the listener is called. |
| [ChangeNotifierProvider](https://pub.dartlang.org/documentation/provider/latest/provider/ChangeNotifierProvider-class.html) | A specification of ListenableProvider for ChangeNotifier. It will automatically call `ChangeNotifier.dispose` when needed. |
| [ValueListenableProvider](https://pub.dartlang.org/documentation/provider/latest/provider/ValueListenableProvider-class.html) | Listen to a ValueListenable and only expose `ValueListenable.value`. |
| [StreamProvider](https://pub.dartlang.org/documentation/provider/latest/provider/StreamProvider-class.html) | Listen to a Stream and expose the latest value emitted.      |
| [FutureProvider](https://pub.dartlang.org/documentation/provider/latest/provider/FutureProvider-class.html) | Takes a `Future` and updates dependents when the future completes. |
| [ProxyProvider](https://pub.dev/documentation/provider/latest/provider/ProxyProvider-class.html) | A provider that builds a value based on other providers.(3.0 版新增功能) |

* [完整的 list]( https://pub.dev/documentation/provider/latest/provider/provider-library.html )

