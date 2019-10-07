---
layout: post
title: '[Flutter] interactivity 互動 - stateful widget'
comments: true
typora-root-url: 2019-10-07-flutter-interactivity/
typora-copy-images-to: 2019-10-07-flutter-interactivity/
date: 2019-10-07 19:53:49
categories: Flutter
tags: Flutter
---

一個 App 加減都會有互動，有互動就需要面對狀態管理的課題，而 Flutter 針對狀態管理又有幾套實作的方式，這一個學習筆記將從基本元素開始看起，`stateful widget`

<!-- more -->

# stateless 與 stateful widgets

Flutter 內的 widget 有兩種，無狀態和有狀態的 widget，`stateless widget` 基本上會長這樣

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter layout demo!',
      home: Scaffold(
        appBar: AppBar(
          title: Text('Flutter layout demo'),
        ),
        // Change to buildColumn() for the other column example
        body: Center(child: buildRow()),
      ),
    );
  }

```

而 `stateful widget` 會稍微複雜一點，基本架構會這樣，會由兩個 class 組成

```dart
class FavoriteWidget extends StatefulWidget {
  @override
  _FavoriteWidgetState createState() => _FavoriteWidgetState();
}

class _FavoriteWidgetState extends State<FavoriteWidget> {
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}

```

而狀態就可以存放在 state class 內，這裡面的狀態，在 widget 沒有被摧毀前，都會存在著，至於避免狀態隨著 widget 消失而消失的方法，這個下一篇再來探討

```dart
class _FavoriteWidgetState extends State<FavoriteWidget> {
  bool _isFavorited = true;
  int _favoriteCount = 41;
  // ···
}
```

但不論是 `stateless` 或是 `stateful` widget 都是透過 `build` 方法產生要顯示的 UI 畫面，在 `stateful widget` 內如果要更新 UI 時，可以透過 `setState` 來觸發 `build` 方法

```dart
class _FavoriteWidgetState extends State<FavoriteWidget> {
  // ···
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: EdgeInsets.all(0),
          child: IconButton(
            icon: (_isFavorited ? Icon(Icons.star) : Icon(Icons.star_border)),
            color: Colors.red[500],
            onPressed: _toggleFavorite,
          ),
        ),
        SizedBox(
          width: 18,
          child: Container(
            child: Text('$_favoriteCount'),
          ),
        ),
      ],
    );
  }
    
  void _toggleFavorite() {
      setState(() {
        if (_isFavorited) {
          _favoriteCount -= 1;
          _isFavorited = false;
        } else {
          _favoriteCount += 1;
          _isFavorited = true;
        }
      });
    }
}

```



## more about stateful widget

如果要從外部傳資料到 stateful widget 時，又會怎麼處理呢? 繼續使用上面的範例

```dart
class FavoriteWidget extends StatefulWidget {
  final String name;    
  FavoriteWidget({this.name}); //
       
  @override
  _FavoriteWidgetState createState() => _FavoriteWidgetState();
}

class _FavoriteWidgetState extends State<FavoriteWidget> {
  @override
  Widget build(BuildContext context) {
    print($widget.name); //
    return Container();
  }
}

```

* line 3: 透過建構式的方式將值從外部傳入
* line 12: 可以透過 `widget.xxx` 的方法取得 widget 的變數

# 參考資料

* [How Stateful Widgets Are Used Best - Flutter Widgets 101 Ep. 2](https://www.youtube.com/watch?v=AqCMFXEmf3w)
* [Adding interactivity](https://flutter.dev/docs/development/ui/interactive)