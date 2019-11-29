---
layout: post
title: '[Go] Go 語言學習筆記 - 語言 part 3'
comments: true
typora-root-url: 2019-11-29-golang-note-3
typora-copy-images-to: 2019-11-29-golang-note-3
date: 2019-11-29 14:53:14
categories: Go
tags: Go
---

繼續研究 Go，這次會涵蓋 `Map` 和 `Functions`

<!-- more -->

# Map

Map 是一個 Key Value 形式的格式，當沒有給予初始值時，預設值為 `nil`，一樣可以使用 `make` 建立

```go
func main() {
	var m map[string]int
	if m == nil {
        fmt.Println("is nil") // output: is nil
	}
    m = make(map[string]int)
    fmt.Println(m) // output: map[]
	
    m["first"] = 1
    fmt.Println(m) // output: map[first:1]
    fmt.Println(m["first"]) // output: 1
}
```

給予初始值的方式與 struct 雷同，但須要多給 key 值

```go
type Vertex struct {
	Lat, Long float64
}

var m = map[string]Vertex{
	"Bell Labs": Vertex{
		40.68433, -74.39967,
	},
	"Google": Vertex{
		37.42202, -122.08408,
	},
}
// 也可以這樣
var m = map[string]Vertex{
	"Bell Labs": {40.68433, -74.39967},
	"Google":    {37.42202, -122.08408},
}
```

修改 Map 資料的方式也很直覺，直接根據 Key 值修改資料即可

```go
func main() {
	m := make(map[string]int)

	m["Answer"] = 42
	fmt.Println("The value:", m["Answer"])

	m["Answer"] = 48
	fmt.Println("The value:", m["Answer"])

	delete(m, "Answer")
	fmt.Println("The value:", m["Answer"])

    v, ok := m["Answer"] // 第二個回傳值: 判斷 key 值是否存在
    fmt.Println("The value:", v, "Present?", ok) // output: 0 Present?: false
}

```

# Functions

Go  裡面的 Function 也是一種型別，表示我們可以將 Function 傳入一個 Function 或是回傳一個 Function。

 ```go
func compute(fn func(float64, float64) float64) float64 {
	return fn(3, 4)
}

func main() {
	hypot := func(x, y float64) float64 {
		return math.Sqrt(x*x + y*y)
	}
	fmt.Println(hypot(5, 12))

	fmt.Println(compute(hypot))
	fmt.Println(compute(math.Pow))
}

 ```

Function Closures 好像也是基本了

```go
func adder() func(int) int {
	sum := 0
	return func(x int) int {
		sum += x
		return sum
	}
}

func main() {
	pos := adder()
	for i := 0; i < 10; i++ {
		fmt.Println(
            pos(i), // output: 1 3 6 10 ...			
		)
	}
}
```



# 小結

 到這篇筆記為止，應該都算是 Go  的基礎篇，接下來的筆記都算是比較進階的內容。期待進入 Go 的進階世界