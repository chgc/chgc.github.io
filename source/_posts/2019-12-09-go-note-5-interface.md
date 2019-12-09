---
layout: post
title: '[Go] Go 語言學習筆記 Part 5 - interface'
comments: true
typora-root-url: 2019-12-09-go-note-5-interface
typora-copy-images-to: 2019-12-09-go-note-5-interface
date: 2019-12-09 15:37:14
categories: Go
tags: Go
---

繼續上次的 Method, Go 內的 interface  也是很重要的一個環節, 尤其跟 method 間的關係更是緊密

<!-- more -->

# 基本宣告

Interce 是用來定義 method signatures, 換句話說, 如果是這個型別(interface) 的值, 就會有所規範的 method 可以使用

```go
type Abser interface {
	Abs() float64
}
```

這樣的描述跟原本常見的 interface 會有些差異, 主要原因還是因為 Go 沒有 class 造成的

```go
func main() {
	var a Abser
	f := MyFloat(-math.Sqrt2)
	v := Vertex{3, 4}

	a = f  // a MyFloat implements Abser, see line 17~24
	a = &v // a *Vertex implements Abser, See line 26~32

	// In the following line, v is a Vertex (not *Vertex)
	// and does NOT implement Abser.
	a = v // 這行會壞掉

	fmt.Println(a.Abs())
}


type MyFloat float64

func (f MyFloat) Abs() float64 {
	if f < 0 {
		return float64(-f)
	}
	return float64(f)
}

type Vertex struct {
	X, Y float64
}

func (v *Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}
```

* 在上述程式碼提到 line 11 行會壞掉, 主要原因是 Abs() 方法只有在 struct Vertex 上面實做 (Pointer type), 而沒有再 value type 上面實做。這也是為什麼會發生錯誤的原因

## nil

interface 當被指定時, 預設值是 `nil` , 而所宣告的 method  還是可以被呼叫, 只是是透過 `nil receiver` 罷了

```go

type I interface {
	M()
}

type T struct {
	S string
}

func (t *T) M() {
	if t == nil {
		fmt.Println("<nil>")
		return
	}
	fmt.Println(t.S)
}

func main() {
	var i I

	var t *T
	i = t // t 此時為 nil
	describe(i) // output (<nil>, *main.T)
	i.M() // <nil>
}
```

但如果只有單純的宣告卻沒有指定值時 (如 line 22), 就會出現以下的錯誤訊息

```go
type I interface {
	M()
}

func main() {
	var i I
    describe(i) // output: (<nil>, <nil>)
    i.M() // error: panic: runtime error: invalid memory address or nil pointer dereference
}

```

# Type switches

在介紹 Type switches 之前, 要先了解兩個東西, 1. empty interface, 2. type assertions

## Empty interface

empty interface 就字面上意思, 是沒有宣告任何 method 的 interface, 在 go 裡面會這樣子表示

```go
// interface{}

func main() {
	var i interface{}
    describe(i) // output: <nil>, <nil>

	i = 42
    describe(i) // output: 42, int

	i = "hello"
    describe(i) // output: hello,string
}

func describe(i interface{}) {
	fmt.Printf("(%v, %T)\n", i, i)
}
```

透過上面的範例, 得知我們可以透過 empty interface 來取得變數的值及型別兩種資訊

## Type assertions

既然知道型別, 那是否可以直接做條件判斷了, 在 go 裡面是可以做到的

```go
	var i interface{} = "hello"

	s := i.(string)
	fmt.Println(s)

	s, ok := i.(string) 
	fmt.Println(s, ok) // "hello", true

	f, ok := i.(float64) // f: 0, ok:false
	fmt.Println(f, ok)

	f = i.(float64) // 噴錯
	fmt.Println(f)
```

* 如果 i 的值是 `string` 型別的話, s 就會等於 i 的值 
* 但如果不是, 就會噴錯。但這樣子就太蠢了, 所以 go 提供了第二個值可以接, 當這一個有接起來, 效果就等於 try catch. 執行時就不會噴錯了

## switches

透過前面兩地的特性, 再搭配 switch 就可以做到型別的判斷了

```go

type Vertex struct {
	name string
}

func do(i interface{}) {
	switch v := i.(type) {
	case int:
		fmt.Printf("Twice %v is %v\n", v, v*2)
	case string:
		fmt.Printf("%q is %v bytes long\n", v, len(v))
	case Vertex:
		fmt.Printf("Vertex %v", v)
	default:
		fmt.Printf("I don't know about type %T!\n", v)
	}
}

func main() {
	do(21)
	do("hello")
	do(true)
	do(Vertex{"Go"})
}
```

* `i.(type)` 只能搭配 switch 使用

# 參考資料

* [interface 文件](https://tour.golang.org/methods/9)