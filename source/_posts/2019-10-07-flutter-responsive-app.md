---
layout: post
title: '[Flutter] Responsive Apps'
comments: true
typora-root-url: 2019-10-07-flutter-responsive-app
typora-copy-images-to: 2019-10-07-flutter-responsive-app
date: 2019-10-07 12:00:21
categories: Flutter
tags: Flutter
---

由於手機或是相關的設備，螢幕尺寸都不一樣，這時候就必須有所謂的響應式的設計，而 Flutter 內野有提供相對應的方法來幫助我們完成這件事情

<!-- more -->

# LayoutBuilder

`LayoutBuilder` 起手式

```dart
LayoutBuilder(builder: (context, constraints) {
    // Code here
},)
```

* context: `BuildContext`，這裡取得的 context 等同於 build 方法的 context。
* constraints:  `BoxConstraints` 型別，內包含許多顯示畫面的相關資訊，就可以透過這資訊來決定畫面要怎麼處理

範例程式

```dart
LayoutBuilder(
    builder: (context, constraints) {
        if(constraints.maxWidth > 600) {
            getWideLayout();
        } else {
            getNormalLayout();
        }
    },
)
```



# MediaQuery

如果不透過 LayoutBuilder，也可以透過 `MediaQuery.of` 的方法來取得相關資訊

```dart
Widget build(BuildContext context) {    
    MediaQueryData media = MediaQuery.of(context);
    ...
}        
```

MediaQueryData 包含許多資訊，細節內容可以參閱[官方文件](https://api.flutter.dev/flutter/widgets/MediaQueryData-class.html)

# AspectRatio

另外一個很實用的 widget，顯示圖片時，因為圖片本身有所謂的長寬比例，而在做放大縮小時，理論上也應該按一定比例做縮放，這時候就可以使用 `AspectRatio` 來完成

```dart
AspectRation(
	aspectRatio: 3 / 2,
    child: MyWidget()
)
```

* `aspectRatio` 可以指定數字，或是用 width / height 的方式表示

# 使用範例

在其幾篇有介紹到 `GridView.count` 的使用方法，由於 `count` 是很明確的指定每一個 row 的顯示數量，這時候當設備是直立顯示與橫向使用，可使用的寬度就是不一樣，這裡就可以使用 `MediaQuery` 來做到動態設定 count  的功能

```dart
final Orientation orientation = MediaQuery.of(context).orientation;
...
GridView.count(
    crossAxisCount: (orientation == Orientation.portrait) ? 2 : 3,
    mainAxisSpacing: 4.0,
    crossAxisSpacing: 4.0,
    padding: const EdgeInsets.all(4.0),
    childAspectRatio: (orientation == Orientation.portrait) ? 1.0 : 1.3,
    children: photos.map<Widget>((Photo photo) {
        return GridDemoPhotoItem(
            photo: photo,
            tileStyle: _tileStyle,
            onBannerTap: (Photo photo) {
                setState(() {
                    photo.isFavorite = !photo.isFavorite;
                });
            },
        );
    }).toList(),
),
```



# 參考資料

* [LayoutBuilder](https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html)
* [MediaQuery](https://api.flutter.dev/flutter/widgets/MediaQuery-class.html)
* [AspectRatio](https://api.flutter.dev/flutter/widgets/AspectRatio-class.html)