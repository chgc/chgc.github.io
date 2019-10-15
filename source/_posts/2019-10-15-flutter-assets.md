---
layout: post
title: '[Flutter] 靜態檔案'
comments: true
typora-root-url: 2019-10-15-flutter-assets/
typora-copy-images-to: 2019-10-15-flutter-assets/
date: 2019-10-15 13:58:43
categories: Flutter
tags: Flutter
---

Flutter 處理靜態檔案的方法，特別針對圖檔的處理算是很完整又簡單，筆記如下

<!-- more -->

# 靜態檔案

Flutter 是透過設定 `pubspec.yaml` 的 `assets` 區塊來決定哪些靜態檔案或是資料夾下的靜態檔案要被包到 Flutter 專案內

```yaml
flutter:
  assets:
    - assets/my_icon.png
    - assets/background.png
    - assets/docs/
```

* 可以直接設定靜態檔案名稱
* 設定資料夾名稱 (結尾要有 `/`)，則會包含第一層內的所有靜態檔案

單針對影像檔的處理方式有更彈性的作法，由於手機設備的螢幕大小都不太一樣，為了讓圖片顯示得更清楚，都會針對不同的解析度而輸出相對應的圖檔，所以如果採用上述的打包規則，設定規則會超級囉嗦。

針對這一塊，Flutter 的彈性處理方式是，他會根據圖檔的檔名，往下找一樣檔名的檔案並一起打包進來，假設圖檔的存放結構如下

```
.../assets/images/background.png
.../assets/images/dark/background.png
.../assets/images/my_icon.png
```

這時候我的 `pubspec.yaml`  是這樣子設定

```yaml
flutter:
  assets:
  	- assets/images/background.png
```

Flutter 會連同 `assets/images/dark/background.png` 檔案一起打包進來，同理套用在資料夾模式，真的很彈性。

透過這樣的機制，就可以很輕鬆的處理多尺寸圖片的問題了，資料夾的命名依放大比例命名 (ex: `/2.0x/image.png`，`/3.0x/image`)，沒放在資料夾內的圖檔為 base ration (1倍)

## 讀取靜態檔案

* 讀取文字

  ```dart
  import 'dart:async' show Future;
  import 'package:flutter/services.dart' show rootBundle;
  
  Future<String> loadAsset() async {
    return await rootBundle.loadString('assets/config.json');
  }
  ```

* 讀取圖檔

  ```dart
  var imageData = await rootBundle.load('assets/images/ReceiptRaw_1.jpg'); // Future<ByteData>
  var image = Image.memory(imageData);
  ```

  更簡單的方式是使用 widget 讀取，當使用會針對解析度改變會處理的 widget，會自己載入合適的圖檔

  ```dart
  AssetImage('graphics/background.png')
  ```

## 打包 package 的靜態檔案

當要使用 package 的圖檔時，則需要這樣子設定

```yarml
flutter:
  assets:
  	- backgrounds/background1.png
    - packages/fancy_backgrounds/backgrounds/background1.png
```

當使用 `AssetImage` 時，就可以指定要載入哪一個 `package` 

```dart
AssetImage('backgrounds/background1.png', package: 'fancy_backgrounds')
```



# 參考資料

* [Assets and images]( https://flutter.dev/docs/development/ui/assets-and-images )

