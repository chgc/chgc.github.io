---
layout: post
title: '[C#] Collection'
comments: true
date: 2018-10-04 08:40:56
categories: CSharp
tags: CSharp
---

C# 的集合種類有很多種，每一種集合都有不同的特性，趁著在看 `ImmutableList` 將這個區塊的資訊整理一下。C# 跟及何有關的命名空間，都會放在 `System.Collections` 下

<!-- more -->

# 集合的種類

## System.Collections 

因為不指定型別，所以都會以 `Object` 的類型儲存，常用的類別有

| 類別      | 描述                                                         |
| --------- | ------------------------------------------------------------ |
| ArrayList | 會視需要動態增加大小的物件陣列。(對應 List)                  |
| Hashtable | 根據索引鍵的雜湊程式碼，所整理的索引鍵/值組集合 (對應 Dictionary) |
| Queue     | 具有先進先出(FIFO)特性的清單                                 |
| Stack     | 具有先進後出(LIFO)特性的清單                                 |


## System.Collections.Generic

在這一個命名空間下的集合都屬泛型集合，常見的有

| 類別                     | 描述                                       |
| ------------------------ | ------------------------------------------ |
| Dictionary<TKey, TValue> | KeyValue Pair 集合                         |
| List<T>                  | 依照索引存取的物件清單，可搜尋、排序、修改 |
| Queue<T>                 | 具有先進先出(FIFO)特性的清單               |
| SortedList<TKey, TValue> | 根據 Key 值排序的 KeyValue 集合            |
| Stack<T>                 | 具有先進後出(LIFO)特性的清單               |

## System.Collections.Concurrent

針對多執行緒情境所設計的集合，包含 `BlockingCollection<T>` 、`ConcurrentDictionary<TKey, TValue>` 、`ConcurrentQueue<T>` 和 `ConcurrentStack<T>`


## System.Collections.Immutable

> 涉及多個執行緒時，要控制好可變狀態會是個挑戰。 一般作法是利用可在不同執行緒之間自由傳遞的不可變狀態。 不可變的集合不同於唯讀集合，因為集合的提供者或消費者無法變更不可變的集合，這點和唯讀集合並不相同。 例如，如果您要列舉唯讀集合，該集合有可能會在其他執行緒上變更，而導致資料損毀。 如果您是使用不可變的集合，就不會發生這種情形。

根據 MSDN 的說明，使用不可變的集合有以下的優點

* 安心共用集合，消費者可以確保集合永遠不會變更。
* 在多執行緒應用程式中提供隱含的執行緒安全性 (不需要鎖定，即可存取集合)。
* 依照函式程式設計作法進行。
* 在列舉期間修改集合，並可確保原始集合不會變更。

一樣有上述的 `List`、`Dictionary`、`HashSet` 等集合，只是變成 `ImmutableList<T>`、`ImmutableDictionary<TKey, TValue>`、`ImmutableHashSet<T>`。

# 各集合的詳細說明

## ArrayList

透過新增、移除，可以動態改變陣列大小。實作 `IList` 界面

範例程式碼

```c#
 // Creates and initializes a new ArrayList.
ArrayList myAL = new ArrayList();
myAL.Add("Hello");
myAL.Add("World");
myAL.Add("!");
```

關於 `ArrayList`，有些事情是需要知道的

* 設計用來保存物件的異質集合，不保證最佳效能，官方建議使用 `List<Object>`

  * 效能討論，可參閱 [List<T>](https://docs.microsoft.com/zh-tw/dotnet/api/system.collections.generic.list-1?view=netframework-4.7.2) 主題

* 不保證排序，需透過 `Sort` 的方式來進行排序，如果要確保順序，使用 `SortedSet<T>` 類別

* 由於是動態產生，所以每一次增加 `ArrayList` 數量都會重新配置(指增不減)，為了減少使用空間，使用 `TrimToSize` 或是明確指定陣列大小，可以解決空間浪費的問題

* 可透過整數索引取值，從 `0` 開始

* 接受 `null` 並可以重複

* 不支援多維

* 需透過 `Cast<T>` 才可以使用 Linq

  ```
  myAL.Cast<string>().FirstOrDefault(x => x == "!");
  ```

## Hashtable

根據索引鍵的雜湊程式碼，所整理的索引鍵/值組集合

範例程式

```c#
Hashtable openWith = new Hashtable();
openWith.Add("txt", "notepad.exe");
openWith.Add("bmp", "paint.exe");
openWith.Add("dib", "paint.exe");
openWith.Add("rtf", "wordpad.exe");
```

關於 `Hashtbale`，有些事情是需要知道的

* Key 不能是 `null`

* Key 值物件必須是不可變的

* `foreach` 取的值是 `DictionaryEntry` 型別，只允許讀取 (read only)

  ```c#
  foreach(DictionaryEntry de in myHashtable)
  {
      // ...
  }
  ```

## Queue

先進先出 (FIFO) 集合

範例程式

```c#
Queue myQ = new Queue();
myQ.Enqueue("Hello");
myQ.Enqueue("World");
myQ.Enqueue("!");

WriteLine(myQ.Peek()); // Hello
myQ.Dequeue(); // 移除 Hello
WriteLine(myQ.Peek()); // World
myQ.Dequeue(); // 移除 World
WriteLine(myQ.Peek()); // !
myQ.Dequeue(); // 移除 !
WriteLine(myQ.Peek()); // 出現錯誤，因為 Queue 已經是 Empty 了
```

關於 `Queue`，有些事情是需要知道的

* 三個主要作業
  * `Enqueue` : 新增至結尾
  * `Dequeue`: 移除最舊的項目
  * `Peek`: 傳回最舊的項目
* 可透過 `TrimToSize` 來節省沒在使用的配置空間
* 允許 `null` 並允許重複項目

## Stack 

後進先出 (LIFO) 非泛型集合

範例程式

```c#
// Creates and initializes a new Stack.
Stack myStack = new Stack();
myStack.Push("Hello");
myStack.Push("World");
myStack.Push("!");

WriteLine(myStack.Count); // 3
WriteLine(myStack.Pop()); // !
WriteLine(myStack.Count); // 2
WriteLine(myStack.Peek());// World
WriteLine(myStack.Count); // 2
WriteLine(myStack.Pop()); // World
WriteLine(myStack.Count); // 1
```

關於 `Stack`，有些事情是需要知道的

* 三個主要作業
  * `Push` : 將物件插入 `Stack` 的頂端。
  * `Pop`: 移除並傳回在  `Stack`  頂端的物件
  * `Peek`: 傳回  `Stack`  頂端的物件而不需移除它

# List<`T`>的延伸

List<T> 可以透過方法來轉換成不同的集合類型，而其中的 `ReadOnlyCollection` 與 `ImmutableList` 我比較想拿出來比較

這兩著在本質上還是有差異的，範例程式

```c#
var list = new List<string>() { "a", "b" };
var readonlyList = list.AsReadOnly();
var immutableList = list.ToImmutableList();

WriteLine("List Count: " + list.Count); // 2
WriteLine("ReadonlyList Count: " + readonlyList.Count); // 2
WriteLine("ImmutableList Count: " + immutableList.Count); // 2

list.Add("c");

WriteLine("List Count: " + list.Count); // 3
WriteLine("ReadonlyList Count: " + readonlyList.Count); // 3
WriteLine("ImmutableList Count: " + immutableList.Count); // 2

immutableList = immutableList.Add("3");

WriteLine("List Count: " + list.Count); // 3
WriteLine("ReadonlyList Count: " + readonlyList.Count); // 3
WriteLine("ImmutableList Count: " + immutableList.Count); // 3
```

根據上面的執行結果，我們可以得知，一但轉換成 `ImmutableList` 時，就與原本的 List 是脫離關係的，不論原本的集合做怎樣的變更，`ImmutableList` 都不會改變。但 `ReadonlyCollection` 卻不是這樣，`ReadonlyCollection` 會跟 `List` 一起連動。只是他不能被修改而已。

那什麼時候要用 `ReadonlyCollection` 什麼時候要用 `ImmutableList` ? 其實可以看 `ImmutableList` 的是用情境，就大概知道哪些狀況下要使用 `ImmutableList`了

# 結論

C# 內的集合類別很多種，也有針對不同的情境設計實作集合類別，有空的時候，是可以花點時間讀一下官方文件，並熟悉 LINQ 的操作，LINQ 對於集合的操作能力可是很厲害的，可以用少少的程式碼完成很多工作，而且閱讀性也不會太差。

