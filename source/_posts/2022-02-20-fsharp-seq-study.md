---
layout: post
title: '[FSharp] Seq Study'
comments: true
typora-root-url: 2022-02-20-fsharp-seq-study
typora-copy-images-to: 2022-02-20-fsharp-seq-study
date: 2022-02-20 11:23:23
categories: FSharp
tags: FSharp
---

最近在練習 F# 時，發現自己對於 F# Collection 操作不熟悉，尤其是 Seq 的部分，特地拉出單章刻意練習

<!-- more -->

來自官網的介紹

> 「 *序列* 」（sequence）是一種元素的邏輯系列，全都是一種類型。 當您有大量的資料收集，但不一定會預期使用所有元素時，序列特別有用。 個別順序元素只會在必要時計算，因此在不使用所有元素的情況下，序列可以提供比清單更佳的效能。 順序是以類型表示 `seq<'T>` ，這是的別名 [IEnumerable](https://docs.microsoft.com/zh-tw/dotnet/api/system.collections.generic.ienumerable-1) 。 因此，任何實介面的 .NET 型別都 [IEnumerable](https://docs.microsoft.com/zh-tw/dotnet/api/system.collections.generic.ienumerable-1) 可以用來做為序列。 [Seq 模組](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html)可支援涉及序列的操作。

# Notes

## 建立 Seq

F# 建立 range 數列的方式可以透過 `..` 的方式來完成，例如 `[ 1 .. 3 ]` 就能產生 `[ 1;2;3 ]` 的 List，要表示 step n 時，可以這樣子表示 `[ 1..2..5]` 就會得到 `[1;3;5]`，同樣的表示法套用在 seq 上會是這樣子寫

```fsharp
seq { 1..2..5 }
```

更進一步可以透過程式的方式產生 seq 的內容

```fsharp
seq { for i in 1 .. 10 -> i * i }
// or
seq { for i in 1.. 10 do i * i}
```

另外一種會遇到的情況是想將一個 seq 展開並放入到另外一個 seq 時，可以使用 `yield!` 的關鍵字 ，其效果跟 JavaScript 的 flatMap 是一樣的

```fsharp
seq {
    for _ in 1..10 do
        yield! seq { 1; 2; 3; 4; 5}
}
```

文件中提到一點就是如果運算是中有使用到 `yield!` 時，其他回傳值就必須使用 `yield`

## 轉換

可以透過兩種方式來將 `List` or `Array` 轉換成 `seq`

```fsharp
// Convert an array to a sequence by using a cast.
let seqFromArray1 = [| 1 .. 10 |] :> seq<int>
// let seqFromArray1 = Seq.cast [| 1 .. 10 |]

// Convert an array to a sequence by using Seq.ofArray.
let seqFromArray2 = [| 1 .. 10 |] |> Seq.ofArray
```

## 搜尋

常用的方法有  [Seq. exists](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html#exists)、 [array.exists2](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html#exists)、 [seq. find](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html#find)、 [findIndex](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html#findIndex)、 [Seq. pick](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html#pick)、 [tryFind](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html#tryFind) 和 [array.tryfindindex](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html#tryFindIndex)

## Obtaining Subsequences

- 常看到的有 `Seq.filter` 、`Seq.choose`，跟 List 的版本功能一樣但運作方式不同，filtering 和 choosing 的行為只會針對當下的 seq element

- 取 n 筆記錄的方法有 `Seq.take` 或是 `Seq.truncate` 兩者的差異是要處理的 seq 內是否有足夠得資料比數，如果資料比數不夠時，`Seq.take` 會傳回 `System.InvalidOperationException` 的例外狀況，而 `Seq.truncate` 不會發生

- `Seq.takeWhile` 取值直到第一個不吻合條件發生
- `Seq.skip` 跳過 n  筆記錄
- `Seq.skipWhil` skip until first element tor which the predicate return false

```fsharp
// takeWhile
let mySeqLessThan10 = Seq.takeWhile (fun elem -> elem < 10) mySeq
mySeqLessThan10 |> printSeq

// skip
let mySeqSkipFirst5 = Seq.skip 5 mySeq
mySeqSkipFirst5 |> printSeq

// skipWhile
let mySeqSkipWhileLessThan10 = Seq.skipWhile (fun elem -> elem < 10) mySeq
mySeqSkipWhileLessThan10 |> printSeq
```

## Transforming Sequences

發現很多用法跟 RxJS 好像

```fsharp
let printSeq seq1 = Seq.iter (printf "%A ") seq1; printfn ""
let seqPairwise = Seq.pairwise (seq { for i in 1 .. 10 -> i*i })
printSeq seqPairwise
// output
(1, 4) (4, 9) (9, 16) (16, 25) (25, 36) (36, 49) (49, 64) (64, 81) (81, 100) 
```

[Seq.windowed](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html#windowed) 用法跟 `Seq.pairwise` 很像，只是他可以指定每組的數量

```fsharp
let seqNumbers = [ 1.0; 1.5; 2.0; 1.5; 1.0; 1.5 ] :> seq<float>
let seqWindows = Seq.windowed 3 seqNumbers
let seqMovingAverage = Seq.map Array.average seqWindows
printfn "Initial sequence: "
printSeq seqNumbers // 1.0 1.5 2.0 1.5 1.0 1.5
printfn "\nWindows of length 3: "
printSeq seqWindows // [|1.0; 1.5; 2.0|] [|1.5; 2.0; 1.5|] [|2.0; 1.5; 1.0|] [|1.5; 1.0; 1.5|]
printfn "\nMoving average: "
printSeq seqMovingAverage // 1.5 1.666666667 1.5 1.333333333
```

# API Study

## Seq.collect

[API](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html#collect)

```fsharp
let d = "AB\nDE"

d.Split [| '\n' |]
|> Seq.collect (Seq.skip 1 >> Seq.take 1)
|> printfn "%A"

// output:
// seq ['B'; 'E']
```



# 參考資料

* [sequences](https://docs.microsoft.com/zh-tw/dotnet/fsharp/language-reference/sequences)
* [fsharp collections seqmodule](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-seqmodule.html)
