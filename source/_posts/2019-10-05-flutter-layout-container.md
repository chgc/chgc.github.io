---
layout: post
title: '[Flutter] Layout Widget - Container'
comments: true
typora-root-url: 2019-10-05-flutter-layout-container/
typora-copy-images-to: 2019-10-05-flutter-layout-container/
date: 2019-10-05 17:34:39
categories: Flutter
tags: Flutter
---

Flutter 有幾個基本的 Layout Widget ，例如 `Container`、`GridView`、`ListView`、`Stack`，Material Wdigets 也有 `Card` 和 `ListTile` 這幾種，這一篇先探索 `Container`，`Container` 算是最常使用的 layout widget，因為像是 padding、margins、borders 等效果都是由這一個 widget 來設定的

<!-- more -->

# Container

Container 的設定項目有

* child: 指定一個 widget

* alignment: 

  * Aligment 設定，九宮格 ，topLeft、topCenter、topRight、centerLeft、center、centerRight、bottomLeft、bottomCenter 及 bottomRight

* constraints: 動態計算值後並設定到屬性內

  ```dart
  Container(
    constraints: BoxConstraints.expand(
      height: Theme.of(context).textTheme.display1.fontSize * 1.1 + 200.0,
    ),
   ...
  }    
  ```

  

* width: 寬度

* height: 高度

* decoration: 使用 BoxDecoration 來做設定背景

  * BoxDecooration 可設定以下屬性
    * color: 設定顏色
    * image: DecorationImage class
    * border: Border class

* foregroundDecoration: 前景顏色，填滿  padding 內的區塊

* margin & padding

  * 可使用 `EdgeInsets` class 設定

* transform: 可使用 `Matrix4` 來做轉換效果

```dart
 Container(
        color: Colors.pink[100],
        child: Container(
          alignment: Alignment.bottomRight, // 右下對齊
          decoration: BoxDecoration(
            color: Colors.blue, // 背景顏色
            image: DecorationImage(
              image: NetworkImage('https://picsum.photos/300'), // 背景圖
            ),
            border: Border.all(color: Colors.yellow, width: 5), // 邊框線
            borderRadius: BorderRadius.all(Radius.circular(10)), // 邊框圓角
          ),
          foregroundDecoration: BoxDecoration(
            color: Colors.green[50].withOpacity(0.5) // 前景蓋了一層綠色半透明
          ),
          height: 400, // 高度
          width: 400, // 寬度
          padding: EdgeInsets.all(50), // 上下左右各 padding 50
          margin: EdgeInsets.fromLTRB(50, 40, 30, 20), // Margin 邊框設定
          child: Image.network('https://picsum.photos/150'), // context widget
          transform: Matrix4.rotationZ(0.1), // 轉換效果
        ),
      );
```

顯示效果

![1570274905690](1570274905690.png)



## Margin Padding Border 關係圖

![1570272641129](1570272641129.png)

# 參考資料

* [Container Class](https://api.flutter.dev/flutter/widgets/Container-class.html)
* [BoxDecoration](https://api.flutter.dev/flutter/painting/BoxDecoration-class.html)
* [DecorationImage](https://api.flutter.dev/flutter/painting/DecorationImage-class.html)

