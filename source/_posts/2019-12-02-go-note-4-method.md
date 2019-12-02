---
layout: post
title: '[Go] Go 語言學習筆記 Part 3- Methods'
comments: true
typora-root-url: 2019-12-02-go-note-4-method
typora-copy-images-to: 2019-12-02-go-note-4-method
date: 2019-12-02 09:31:59
categories: Go
tags: Go
---

Go 的 Methods 功能很強， 但也很多要注意的地方，就仔細地跟著官網的文件學習了。

<!-- more -->

# 基本

Go  本身沒有並沒有 Class 語法, 但我們卻可以針對型別去擴充功能。Method 也是一種 function 但有特定寫法

```go
func (v T) <func name> <return type> {
    ....
}

// 範例
type Vertex struct {
	X, Y float64
}

func (v Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}
```

與一般 function  差異在於 `function name` 的前面指定作用的型別 `(v Type)`, 這樣子定義完成後, 我們就可以直接使用

```go
func main() {
	v := Vertex{3, 4}
	fmt.Println(v.Abs()) // 使用 Methods
}
```

一開始就有提到 Method 也是 function, 那為什麼要刻意在區分出來呢, 這個在後面會提到, 到就這裡先用標準 function 寫出同樣功能吧

```go
func Abs(v Vertax) float64{
    return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

func main() {
	v := Vertex{3, 4}
	fmt.Println(Abs(v))
}
```

既然 Method 是可以在型別上做擴充功能, 原生型別是否可行呢?  答案是不行的

![image-20191202104204601](image-20191202104204601.png)

Method 只能宣告在 local type 上, 所以當要在處理類似的動作, 就必須做 type 宣告 

```go
type MyFloat float64 // 給予 alias type

func (f MyFloat) Abs() float64 {
	if f < 0 {
		return float64(-f)
	}
	return float64(f)
}

func main() {
	f := MyFloat(-math.Sqrt2)
	fmt.Println(f.Abs())
}

```

# Pointer

```go
package main

import (
	"fmt"
	"math"
)

type Vertex struct {
	X, Y float64
}

func (v Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

func (v *Vertex) Scale(f float64) {
	v.X = v.X * f
	v.Y = v.Y * f
}

func main() {
	v := Vertex{3, 4}
	v.Scale(10)
	fmt.Println(v.Abs())
}

```

* 16 行的 method 使用 `*` 來描述 `Scale` 是定義在 `*T` 上, 表示這個 method  的操作會直接反應回操作實體上

* 當第 23 執行時, v 裡面的 x 會這樣子變動

  ```go
  v := Vertex{3, 4}
  v.Scale(10) // {30 40}
  
  func (v *Vertex) Scale(f float64) {
  	v.X = v.X * f  // v.X = 3 * 10
  	v.Y = v.Y * f  // v.Y = 4 * 10
  }
  ```

* 接下來的第 24 行的執行結果就是  $$\sqrt{30 \times 30 + 40 \times 40} = 50$$

回到上一段提到的 Methods 也是 functions, 但這兩者對於 Pointers 的處理方式是一樣的嗎? 先用 function 的方式寫出一樣的功能

```go
...
func Scale(v *Vertex, f float64) {
	v.X = v.X * f
	v.Y = v.Y * f
}

func main() {
	v := Vertex{3, 4}
	Scale(&v, 10)
	fmt.Println(v.Abs())
}
```

到這邊的寫法是一樣的, 但當將 function 裡的 `*` 給移除後, 就會發生錯誤訊息

![image-20191202111227821](image-20191202111227821.png)

但 methods 是否會有同樣的問題呢? 

```go
func (v Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

func (v Vertex) Scale(f float64) {
	v.X = v.X * f
	v.Y = v.Y * f
}

func main() {
	v := Vertex{3, 4}
	v.Scale(10)
    fmt.Println(v)
	fmt.Println(v.Abs()) // 5
}
```

* 雖然將第 5 行的 `*` 給移除掉是不會壞掉, 但是第 13 行的執行結果就完全不一樣了
* 來看一下執行的順序
  1. line 12 的 Scale 的是取得 Value Receiver 的副本, 所以任何改變都不會影響本體
  2. line 13 印出來的結果還是 {3 4}
  3. 當然 line 14  的結果是 5
  4. 如果要將該 method 改成與原本的結果一樣, 就必須將 v 回傳
* 所以加上加 Pointer (`*`) 雖然 method 都不會壞掉, 但意義上是全然不同的

換另外一個方向來看, 當使用的 Value 本體是否為 Pointer 呢? function 一定會壞掉, function 本身就是那麼嚴謹

```go
func main() {
	v := Vertex{3, 4}
	fmt.Println(v.Abs())
    p := &v
    fmt.Println(p.Abs()) // 等同 (p*).Abs()
}

```

## 選擇  value or pointer Receiver

簡單說, 選擇 pointer receiver 的理由就是為了快, 因為不會多產生一個副本, 針對越大的 struct 效果越明顯, 另外一個決定點, 是否要共用資料 (side effect or not) 如果不想要, 就使用 value receiver, 反之, 使用 pointer receiver

一般來說為了維護一致性, 並不會混和 value 和 pointer 一起使用





 