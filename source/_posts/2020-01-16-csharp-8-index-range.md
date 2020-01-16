---
layout: post
title: '[C#] 8.0 新功能 - 索引與範圍'
comments: true
typora-root-url: 2020-01-16-csharp-8-index-range
typora-copy-images-to: 2020-01-16-csharp-8-index-range
date: 2020-01-16 08:32:53
categories: CSharp
tags: CSharp
---

C# 8 提供了許多新語法，很多新語法可以讓我們的程式碼閱讀性提高，但前提是我們要先了解有那些新功能

<!-- more -->

這裡我先挑出一個我最近才用到的好用功能，**陣列索引**

# 索引

早期在操作陣列取值時，使用 `Linq` 應該算是標準解，但假設只是要取陣列最後的幾個項目，使用 `Linq` 似乎又太囉嗦

```csharp
using System;
using System.Linq;

namespace csharp
{
    class Program
    {
        static void Main(string[] args)
        {
            var urls = "https://blog.kevinyang.net/images/4550568.jpg".Split('/');

            var imagesFile = urls.Last();
            var folderName = urls.SkipLast(1).LastOrDefault();
            Console.WriteLine("Image FileName: {0}", imagesFile);
            Console.WriteLine("Folder Name: {0}", folderName);
        }
    }
}
```

執行結果

![image-20200116091222377](image-20200116091222377.png)

如果是使用 C# 8.0 的新語法，就可以這樣子寫

```csharp
using System;

namespace csharp
{
    class Program
    {
        static void Main(string[] args)
        {
            var urls = "https://blog.kevinyang.net/images/4550568.jpg".Split('/');

            var imagesFile = urls[^1];
            var folderName = urls[^2];
            Console.WriteLine("Image FileName: {0}", imagesFile);
            Console.WriteLine("Folder Name: {0}", folderName);
        }
    }
}
```

## 說明

新語法，當使用 `^` ，索引計算起點就會從最後面開始起算，圖解如下

```csharp
var words = new string[]
{
                // index from start    index from end
    "The",      // 0                   ^9
    "quick",    // 1                   ^8
    "brown",    // 2                   ^7
    "fox",      // 3                   ^6
    "jumped",   // 4                   ^5
    "over",     // 5                   ^4
    "the",      // 6                   ^3
    "lazy",     // 7                   ^2
    "dog"       // 8                   ^1
};              // 9 (or words.Length) ^0
```

# 範圍

既然知道如何使用索引表示，接下來是另外一個新功能，`範圍` 。這一個功能在某些語言已經存在一段時間了

**語法表示**

> Array[StartIndex .. EndIndex(不包含 End Index 的值)]

**範例** (延續上面的 `words` 陣列)

```csharp
var lazyDogs = words[^2..^0]; // ["lazy", "dog"]
var firstThreeWords = words[0..3] // ["The", "quick", "brown"]
```

當不指定開始或結束索引時，就會是為最頭至最尾

```csharp
var allwords = words[..]; // ["The", "quick", "brown", "fox", "jumped", "over", "the", "lazy", "dog"]
var firstThreeWords = words[..3];  // ["The", "quick", "brown"]
var skipFirstThree = words[3..]; // ["fox", "jumped", "over", "the", "lazy", "dog"]
```

當然也可以先決定 `Range` 型別後，在放到陣列中

```csharp
var range0 = 1..2;
var range1 = new Range(1, 2); // 1..2
var range2 = Range.StartAt(3); // 3..
var range3 = Range.EndAt(3); // ..3
Console.WriteLine(String.Join(',', words[range0])); // ["quick"]
Console.WriteLine(String.Join(',', words[range1])); // ["quick"]
Console.WriteLine(String.Join(',', words[range2])); // ["fox", "jumped", "over", "the", "lazy", "dog"]
Console.WriteLine(String.Join(',', words[range3]));  // ["The", "quick", "brown"]
```

以下型別都有支援索引和範圍的新功能

* 陣列
* 字串
* Span<T>
* ReadOnlySpan<T>

# 參考資料

* [C# 8.0 索引和範圍](https://docs.microsoft.com/zh-tw/dotnet/csharp/whats-new/csharp-8#indices-and-ranges)
* [索引和範圍的類型支援](https://docs.microsoft.com/zh-tw/dotnet/csharp/tutorials/ranges-indexes#type-support-for-indices-and-ranges)

