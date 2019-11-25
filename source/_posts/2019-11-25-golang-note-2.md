---
layout: post
title: '[Go] Go 語言學習筆記 - 語言 part 2'
comments: true
typora-root-url: 2019-11-25-golang-note-2
typora-copy-images-to: 2019-11-25-golang-note-2
date: 2019-11-25 20:04:36
categories: Go
tags: Go
---

上一篇簡單快速的介紹 Go 最基礎最簡單的部分，這一篇要進入比較進階一點的地方，更多跟語言有關的筆記介紹如下

<!-- more -->

# Pointers

Pointer 的作用是讓變數可以參考某一個變數的記憶體位置，預設值為 `nil`，語法是 `*T` 是指到 T 的位址(memory address)，`&` 是產生 `pointer` 的運算式

```go
...
func main() {
	i, j := 42, 2701

	p := &i
	fmt.Println(*p) // 42
	*p = 21
	fmt.Println(i) // 21

	p = &j
	*p = *p / 37
	fmt.Println(j) // 73
}
```

# Structs

可以利用 `struct` 來當作一個資料模型

```go
...
type Vertex struct {
	X int // field
	Y int
}

func main() {
	fmt.Println(Vertex{1, 2})
}

```

可以將 `structs` 視為一個 data object，當然就可以做到這件事情

```go
...
// Vertex Model
type Vertex struct {
	X int
	Y int
}

func main() {
	v := Vertex{1, 2}
	v.X = 4
    fmt.Println(v) // output: {4 2}
}

```

當 `strcut` 遇上 `pointer` 時，由於 `*` 寫起來很麻煩，所以當是一個 struct point 時， `*` 就可以不用寫

```go
...
type Vertex struct {
	X int
	Y int
}

func main() {
	v := Vertex{1, 2}
	p := &v
    p.X = 5
    fmt.Println(v) // output {5 2}
}

```

如果還是要加 `*` 的話，還是可以加，寫法如下

```go
func main() {
	v := Vertex{1, 2}
	p := &v
    (*p).X = 5 // 加 * 的寫法 (*T).field
    ...
}
```

定義完 `strcut` 後，建立 struct 實體的方式除了直接一開始就先給值之外，還可以這樣子寫

```go
type Vertex struct {
	X, Y int
}

v1 := Vertex{1, 2}  // has type Vertex
v2 := Vertex{X: 1}  // Y:0 is implicit
v3 := Vertex{}      // X:0 and Y:0
p  := &Vertex{1, 2} // has type *Vertex

```

# Arrays

陣列的操作，在任何程式語言都應該被好好熟悉並掌握，在 Go 裡面宣告陣列的方式比較不一樣，宣告方視為 `[n]T`  is an array of `n` values of type `T`，範例

```go
func main(){
    var a [2]string
    a[0] = "Hello"
    a[1] = "world"
    fmt.Println(a[0], a[1]) // output: Hello World
    fmt.Println(a) // output: [Hello World]
    
    primes := [6]int{2, 3, 5, 7, 11, 13} //  宣告後直接賦予值
	fmt.Println(primes)
}
```

* Go 在開發時，會立刻針對型別做檢查

* 如果陣列初始值長度大於宣告的，也會出現錯誤提示

  ![image-20191125211743398](image-20191125211743398.png)

# Slices

## 設定方法 1

Array 是一個有固定長度的陣列，而 slices 是沒有固定長度的陣列，宣告使用方式為

```go
q := []int{2, 3, 5, 7, 11, 13}

// strcut slices
s := []struct {
		i int
		b bool
	}{
		{2, true},
		{3, false},
		{5, true},
		{7, true},
		{11, false},
		{13, true},
	}
```

## 設定方法 2

 slices 可透過這語法`array[lowIndex: highIndex]`，包含 `lowIndex` 但不包含 `highIndex`，從一個陣列中取出某一部分的陣列資料

```go
func main() {
	primes := [6]int{2, 3, 5, 7, 11, 13}
	s := primes[1:3]
    fmt.Println(primes, s) // output: [2,3,5,7,11,13] [3,5]
}

```

**注意** 非常重要，slice 出來的陣列，並不是複製體，而是參考到原本的來源陣列，這表示，改動 slice 出來的陣列，是會影響到原本的資料，測試程式碼如下

```go
func main() {
	primes := [6]int{2, 3, 5, 7, 11, 13}
	s := primes[1:3] // 由上面得知是 [3,5]
	s[0] = 1 // 修改後變成 [1,5]
    fmt.Println(primes, s) // output: [2,1,5,7.11.13] [1,5]
}
```

當沒有設 `lowIndex` 或 `highIndex` 時，Go 內的預設值會是 

* `lowIndex` : 0
* `highIndex`: 陣列長度

```go
func main() {
	primes := [6]int{2, 3, 5, 7, 11, 13}
    s := primes[:3] // output: [2 3 5]
    p := primes[4:] // output: [11 13]
	fmt.Println(s, p) 
}
```

## slices 資訊 (重要觀念)

如果想要得知目前 `slice` 長度跟複製的陣列來源長度，可以透過 `len()` 和 `cap()` 兩個方法取得

* `len()` : slice 出來的陣列長度
* `cap()`: slice 來源的陣列長度

```go
func main() {
	s := []int{2, 3, 5, 7, 11, 13}
    printSlice(s) // len: 6, cap: 6, s: [2 3 5 7 11 13]

	// Slice the slice to give it zero length.
	s = s[:0]
    printSlice(s) // len: 0, cap: 6, s: [], cap_s: [2 3 5 7 11 13]

	// Extend its length.
    s = s[:4] 
	printSlice(s) // len: 4, cap: 6, s: [2 3 5 7], cap_s: [2 3 5 7 11 13]

	// Drop its first two values.
    s = s[2:]
    printSlice(s) // len: 2 cap: 4, s: [5 7], cap_s: [5 7 11 13]
    
    s = s[:4]
    printSlice(s) // len: 4 cap: 4, s: [5 7 11 13], cap_s: [5 7 11 13]
}
```

## 預設值

而一個 `slices` 沒有設定初始值時，預設值就是 `nil`

## 使用 make 建立 slices

`make` 是 go 內建的方法之一，可以透過 `make` 來建立一個動態長度的陣列, slices. 語法是

> make( []T, len, cap)

```go
func main(){
    a := make([]int, 0, 5)
    fmt.Println(a, len(a), cap(a)) // output: [] 0 5
}
```

## 多維陣列

這應該就不用多解釋了

```go
board := [][]string{
		[]string{"_", "_", "_"},
		[]string{"_", "_", "_"},
		[]string{"_", "_", "_"},
	}
```

## 擴增

透過 `append( s []T, vs ...T)` 的方式增加 slices 內的資料筆數，slices 會根據需要長大

```go
func main() {
	var a []int
	a = append(a, 0, 1, 2)
	fmt.Println(a, len(a), cap(a))
}
```

## range

range 是一種 for loop slices 的用法，直接看程式碼比較快

```go
func main() {
	for i, v := range pow {
		fmt.Println(i, v)
	}
}
```

![image-20191125222622273](image-20191125222622273.png)

由圖片得知, `range` 會回傳目前所在的 index 和 value (複製本)

如果只想值，不想取得 index 時，第一個 index 可以用 `_` 來代替

```go
for _, v := range pow {
    fmt.Println(v)
}
```

如果只是想要取得 index 的話，那可直接省略 `, v` 的部分

```go
for i := range pow {
    fmt.Println(i)
}
```



## 延伸閱讀

更多關於 slices 的資訊，可以閱讀[這篇文章]( https://blog.golang.org/go-slices-usage-and-internals )

