---
layout: post
title: '[Flutter] Layout 思維'
comments: true
typora-root-url: 2019-10-05-flutter-layout-01/
typora-copy-images-to: 2019-10-05-flutter-layout-01/
date: 2019-10-05 08:21:17
categories: Flutter
tags: Flutter
---

這一類的 UI Framework 最需要掌握的是 UI Component (Widget) 的操作，尤其是排版的部分，要如何生出自己想要的畫面，就決定於排版技巧的熟悉度，就像網頁切版，如果 CSS 不熟，就無法切出漂亮有可用的版型，同理，Flutter 也需要先從 Layout Widget 跟設計思維學起

<!-- more -->

# Layout 思維

Flutter 有提供很多種用來排版的 Widget，但要使用哪一種會比較合適，這既需要對每一個 Layout Widget 的特性做深入的了解，但這之前，總要知道如何安排畫面，才能選到對的 Widget。這裡有一個官網文件提供的圖

![1570243349615](1570243349615.png)

這是一個算常見的產品介紹畫面，當看到這畫面時，會思考要怎麼呈現。根據圖上面所標示的，可以知道第一層是使用 `Row` 來呈顯左右兩欄的畫面，而第一欄使用 `Column Widget` 來顯示其他資訊，而第二欄是使用 `Image Widget` 來顯示畫面。

再來第一欄的產品資訊使用 `Column Widget` ，所以物件會是由上而下的呈現，細節設計思維的部分可以參閱下圖

![1570243368663](1570243368663.png)

所以綜合這些資訊，我們可以理解成 Flutter 的畫面是從左上到右下，由上而下，由左而右採 S 型移動。這樣理解後，就可以幫我們選擇合適的 layout widget 了

# Layout Widget 屬性

## Aligning Widgets

`Row` 和 `Column` widget 內有可以設定排序物件的屬性，`mainAxisAligment` 和 ``crossAxisAlignment`

![1570243387835](1570243387835.png)

而 `mainAxisAlignment` 有提供下列的選項可以使用

* start (預設值)

  ![1570249691644](1570249691644.png)

* center

  ![1570248054188](1570248054188.png)

* end

  ![1570248078641](1570248078641.png)

* spaceAround: 頭尾的空白大小是中間空白的一半

  ![1570248128083](1570248128083.png)

* spaceBetween

  ![1570248154754](1570248154754.png)

* spaceEvenly

  ![1570248184243](1570248184243.png)



  

`crossAxisAlignment` 有提供以下的選項可使用

* center(預設值)

  ![1570248054188](1570248054188.png)

* baseline: 須設定 `textBaseline` 屬性

  ![1570249395817](1570249395817.png)

* 沒設定 baseline 時

  ![1570249591807](1570249591807.png)

* end

  ![1570248907202](1570248907202.png)

* start

  ![1570248936450](1570248936450.png)

* stretch: 塞滿畫面

## Sizing

使用 `Expanded widget` 可以避免原始圖檔太大造成 App 產生畫面時的錯誤

* 使用前

  ![1570249918702](1570249918702.png)

* 使用後

  ![1570249929541](1570249929541.png)

設定 `flex` 的效果

```dart
Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Expanded(
            child: Image.network('https://picsum.photos/300'),
          ),
          Expanded(
            flex: 2,
            child: Image.network('https://picsum.photos/800'),
          ),
          Expanded(
            flex: 3,
            child: Image.network('https://picsum.photos/600'),
          )
        ],
      );
```



![1570250111924](1570250111924.png)

# 小結

很多排法跟 css flex 很像，在觀念銜接上是很快速的。基本上沒什麼大問題，下一篇筆記會針對 layout widget 做研究