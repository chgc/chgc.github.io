---
layout: post
title: '[Dart] List 的操作 reduce 與 fold'
comments: true
typora-root-url: 2020-12-27-dart-reduce-fold/
typora-copy-images-to: 2020-12-27-dart-reduce-fold/
date: 2020-12-27 23:26:33
categories: Flutter
tags: Flutter
---

 每一個語言對於清單的操作，一直都是必須要掌握的能力之一，在 dart 裡面的 List 的操作方法常見又有幾種，而其中的 reduce 與 fold 這兩個操作方式，對我來說是有點特殊的，在此筆記一下

<!-- more -->

# List   的操作

## reduce

Dart 裡的 `reduce` 行為跟 `JavaScript` 的有點差異，先看程式碼再來說明

```dart
List<int> list = [1,2,3,4,5]; 
 
var result = list.reduce((value, element) {
    return value + element;
});

print(result);
```

1. `reduce` 的過程中，資料操作的型別是不能做更換的，表示 value 與 element 的型別會是一致

2. 如果想要操作得資料與想要取的的結果型態不一樣時，要先做轉型後(搭配 map) 再操作

   ```dart
   void main(){
     var carts = [
       Cart(productName: "蘋果", price: 50, amount: 1),
       Cart(productName: '蔬菜', price: 20, amount: 2),
       Cart(productName: '雞肉', price: 60, amount: 3),
       Cart(productName: '雞蛋', price: 10, amount: 10),
    ];
   
    var totalPrice = carts.map((element)=> element.amount * element.price)
      .reduce((value,element)=> value+element);
       
     print(totalPrice);
   }
   
   
   class Cart {
     String productName;
     num price;
     num amount;
     Cart({this.productName, this.price, this.amount});
   }
   ```

   * method  介面

     ```dart
     E reduce(
       E combine(E value, E element)
     )
     ```

     



## fold

上面的第二個範例寫法，如果寫習慣 JavaScript 的人會覺得很囉唆，但其實 JavaScript 的 reduce 等於 Dart 的 fold，一樣先來看程式碼

```dart
void main(){
  var carts = [
    Cart(productName: "Apple", price: 50, amount: 1),
    Cart(productName: '蔬菜', price: 20, amount: 2),
    Cart(productName: '雞肉', price: 60, amount: 3),
    Cart(productName: '雞蛋', price: 10, amount: 10),
 ];

  var totalPrice = carts.fold(0, (prev, element) => prev + element.price * element.amount);
  
  print(totalPrice);
}


class Cart {
  String productName;
  num price;
  num amount;
  Cart({this.productName, this.price, this.amount});
}
```

* fold  的初始值是放在第一個位置

* 後面的使用方式就和 JavaScript  的 reduce 一樣了

* method 介面

  ```dart
  dynamic fold(
    initialValue,
    dynamic combine(previousValue, E element)
  )
  ```

# 小結

這兩個用法都有他試用的情境，根據情境挑適合的方法使用，可以讓程式碼乾淨許多

