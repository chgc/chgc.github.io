---
layout: post
title: '[C#]  編碼慣例'
date: 2014-02-19 05:35
comments: true
categories: "CSharp"
tag: "C#"
---
節錄於MSDN

* 使用預設的程式碼編輯器設定 (智慧型縮排、四個字元縮排、將定位點儲存為空格)。
* 每行只撰寫一個陳述式。
* 每行只撰寫一個宣告。
* 如果連續行沒有自動縮排，則會將它們縮排一個定位停駐點 (四個空格)。
* 在方法定義與屬性定義之間加入至少一個空白行。
* 使用括號在運算式中撰寫子句，如下列程式碼所示。
```
if ((val1 > val2) && (val1 > val3))
{
    // Take appropriate action.
}
```

#註解慣例

* 將註解放到另一行，不放在程式碼行的結尾。
* 以大寫字母做為註解文字開頭。
* 以句號結束註解文字。
* 在註解分隔符號 (//) 與註解文字之間插入一個空格，如下列範例所示。

```
// The following declaration creates a query. It does not run
// the query.
```

* 不在註解周圍建立格式化的星號區塊。

#語言方針

* 當指派右邊的變數型別很明顯，或是不需要精確的型別時，使用隱含型別的區域變數。
* 指派右邊的型別不明顯時，不要使用 var。
* 不要倚賴變數名稱來指定變數的型別。 它可能是不正確的。
* 避免使用 var 取代 dynamic。
* 使用隱含型別判斷 for 和 foreach 迴圈中迴圈變數的型別。
* 進行比較時，若要略過不必要的比較以避免例外狀況並提升效能，請使用 && 取代 &，以及使用 || 取代 |。
* 使用簡潔的物件執行個體化形式搭配隱含型別，如以下宣告中所示。
* 使用物件初始設定式簡化物件建立。
```
var instance1 = new ExampleClass();

// Object initializer.
var instance3 = new ExampleClass { Name = "Desktop", ID = 37414, 
    Location = "Redmond", Age = 2.3 };

```
#＃ LINQ查詢

* 使用有意義的名稱做為查詢變數的名稱。 下列範例會使用 seattleCustomers 代表位於西雅圖的客戶。
* 使用多個 from 子句，而不要使用 join 子句來存取內部集合。 例如，Student 物件集合中，每一個物件都可能包含考試分數集合。 執行下列查詢時，會傳回每一個高於 90 分的分數，以及得到該分數的學生名字。


