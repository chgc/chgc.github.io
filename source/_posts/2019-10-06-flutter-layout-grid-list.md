---
layout: post
title: '[Flutter] Layout - GridView and ListView'
comments: true
typora-root-url: 2019-10-06-flutter-layout-grid-list/
typora-copy-images-to: 2019-10-06-flutter-layout-grid-list/
date: 2019-10-06 20:40:16
categories: Flutter
tags: Flutter
---

當畫面內容很長時，既需要可以滾動 (scrollable)，基本上有兩種可以用 `Gridview` 和 `ListView`，稍微紀錄一下使用的方式

<!-- more -->

# GridView

GridView 有兩種決定每一列能放多少項目的方式

1. GridView.count: 設定 `crossAxisCount` 來指定每一列要放多少欄，
2. GridView.extent: 設定 `maxCrossAxisExtent` 來讓 widget 自行計算每一列可以放多少欄

其他可以用的設定屬性

1. padding: GridView 外圍的距離
2. `mainAxisSpacing` 橫向的寬度
3. `crossAxisSpacing` 縱向的寬度
4. children 要放入 GridView 的 widgets
5. `childAspectRatio` 放大比例
6. `dragStartBehavior` 設定活動的觸發時間點
   1. `DragStartBehavior.start `: 當拖拉事件發生時才設定初始位置
   2. `DragStartBehaviro.down` : 當按到畫面時就設定初始位置

![1570370406789](1570370406789.png)

## 範例程式

```dart
Widget _buildGrid() => GridView.extent(
    maxCrossAxisExtent: 150,
    padding: const EdgeInsets.all(4),
    mainAxisSpacing: 4,
    crossAxisSpacing: 4,
    children: _buildGridTileList(30));

List<Container> _buildGridTileList(int count) => List.generate(
    count, (i) => Container(child: Image.asset('images/pic$i.jpg')));
```



# ListView

ListView 就很單純是清單列表

1. `scrollDirection` :  設定滾動方向
   1. Axis.verticle 垂直滾動
   2. Axis.horizontal: 水平滾動

假設在每一個 listItem 中間顯示分隔線，ListView 也有提供方法做到這件事情，範例程式碼如下

```dart
ListView.separated(
        shrinkWrap: true,
        itemCount: 15,
        itemBuilder: (BuildContext context, int index) =>
            Container(child: Image.network('https://picsum.photos/400')),
        separatorBuilder: (BuildContext context, int index) => const Divider(
          color: Colors.red,
          thickness: 8,
        ),
      );
```

![1570371431161](1570371431161.png)

## Lifecycle

ListView 有一個需要注意的地方是，他並不是所有的清單內的項目都會被建立，只有在顯示範圍內的才會變建立出來，而離開視線範圍的，就會被摧毀，細節說明可以參閱[此文件 的 Child elements' lifecycle section] (https://api.flutter.dev/flutter/widgets/ListView-class.html)

## 範例程式

```dart
Widget _buildList() => ListView(
      children: [
        _tile('CineArts at the Empire', '85 W Portal Ave', Icons.theaters),
        _tile('The Castro Theater', '429 Castro St', Icons.theaters),
        _tile('Alamo Drafthouse Cinema', '2550 Mission St', Icons.theaters),
        _tile('Roxie Theater', '3117 16th St', Icons.theaters),
        _tile('United Artists Stonestown Twin', '501 Buckingham Way',
            Icons.theaters),
        _tile('AMC Metreon 16', '135 4th St #3000', Icons.theaters),
        Divider(),
        _tile('Kescaped_code#39;s Kitchen', '757 Monterey Blvd', Icons.restaurant),
        _tile('Emmyescaped_code#39;s Restaurant', '1923 Ocean Ave', Icons.restaurant),
        _tile(
            'Chaiya Thai Restaurant', '272 Claremont Blvd', Icons.restaurant),
        _tile('La Ciccia', '291 30th St', Icons.restaurant),
      ],
    );

ListTile _tile(String title, String subtitle, IconData icon) => ListTile(
      title: Text(title,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            fontSize: 20,
          )),
      subtitle: Text(subtitle),
      leading: Icon(
        icon,
        color: Colors.blue[500],
      ),
    );
```



# 小結

當然除了這兩個 widget 之外，其他還有所謂的 `table` 或是 `DataTable` widget，但這部分就留到後面在探索了，關於 Layout 相關的 widget，就可參閱這份[文件](https://flutter.dev/docs/development/ui/widgets/layout)，裡面有更詳細的說明

# 參考資料

* [GridView]()(https://api.flutter.dev/flutter/widgets/GridView-class.html)
* [ListView](https://api.flutter.dev/flutter/widgets/ListView-class.html)