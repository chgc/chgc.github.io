---
layout: post
title: '[Go] Go 語言學習筆記 - 語法'
comments: true
typora-root-url: 2019-11-25-golang-note-1/
typora-copy-images-to: 2019-11-25-golang-note-1/
date: 2019-11-25 09:45:29
categories: Go
tags: Go
---

Go 這語言出來也好一段時間了，由於本身後端都是用 C# 在開發，一直都沒有很大的動機學習另外一個後端語言。趁著這次 GDG 台中 12 月份的大活動，來學習一波 Go 吧

<!-- more -->

# 歷史

Go 是由 Google 和眾多的貢獻者一起發展的開源專案 ([BSD-style 授權](https://golang.org/LICENSE))

![image-20191125100827886](image-20191125100827886.png)

# 安裝

依官網的[安裝文件]( https://golang.org/doc/install )安裝，基本上是沒有問題的。編輯器的部分可以使用 VS Code + Go 的擴充套建，或是使用[JetBrains GoLand](https://www.jetbrains.com/go/) 編輯器(商用)

# Hello World

第一個 Go 的程式

```go
// hello-world.go
package main

import "fmt"

func main() {
	fmt.Println("Hello, world")
}
```

透過下指令的方式就可以執行 Go 檔案，`go run hello.world.go`

![image-20191125101426094](image-20191125101426094.png)

要將 Go 建置成可以跑執行檔，執行 `go build hello.world.go` 之後，就可以執行 `./hello-word`

![image-20191125101724070](image-20191125101724070.png)

如果要將 Go  打包成全域可使用的話，可透過 `go install ` 的語法，但要使用這個前置條件是 `GOBIN` 的環境變數要設定，windows 就加入一個環境參數 `GOBIN` 並設定一個資料夾即可

![image-20191125104233033](image-20191125104233033.png)



# 基本語法

## packages

go 世界裡，每一個 go 檔案都會歸屬到一個 packages 裡面，就拿上面的 `hello-world` 來看

```go
package main
....
```

要使用其他 package 就需要透過 `import` 

```go
import (
    "fmt"
    "math"
)
```

 當 package 被 import 時，就可以使用該 package  內第一個為大寫的 functions。換句話說，如果 functions  的名稱第一個是小寫的，就不會被 export 出去

![image-20191125121819111](image-20191125121819111.png)

上圖為使用小寫 functions 時會出現的錯誤訊息，當改使用大寫的 functions，則會是這個結果

![image-20191125122001264](image-20191125122001264.png)

## functions

Go 的 functions 也是要定型別的，只是定型別的順序跟常見的  C# 等語言不太一樣

```go
func add(x int, y int) int {
	return x + y
}
```

型別都定義在後方，當連續的參數都是同一型別時，也可以這樣寫

```go
func add(x, y int) int {
    return x + y
}
```

Go 另外一個比較特別的地方就是 function 允許回傳多個值

```go
func swap(x, y string) (string, string){
    return x, y
}

func main(){
    a, b := swap("hello", "world")
    // a=world , b= hello
}
```

換另外一種命名方式回傳 (但不太建議這樣子使用)

```go
func split(sum int) (x, y int) {
	x = sum * 4 / 9
	y = sum - x
	return
}
```

##  variables

可愛的 `var` 又來了

```go
package main
import "fmt"

var c, python, java bool

func main() {
	var i int
	fmt.Println(i, c, python, java)
}
```

設定預設值的方式，就在後面一順序給要的預設值就可以了，Go 會依預設值自行推斷型別

```go
var c, python, java = true, false, "no!"
```

 另外一種簡化的宣告方式，使用 `:=`

```go
// 原本的做法
func main() {
	var result int
	result = add(1, 2)
	fmt.Println(result)
}
// 使用 := 語法糖
func main() {	
    result := add(1, 2)
	fmt.Println(result)
}

```

## basic types

* bool
* string
* int int8 int16 int32 int64
* uint uint8 uint16 uint32 uint64 uintptr
* byte // alias for uint8
* rune // alias for int32, represents a Unicode code point
* float32 float64
* complex64 complex128

### defaultValue

各型別如果沒有給予設值的系統預設值為

* string => ""
* bool => false
* 數字型 => 0

如果要轉型的話，可以這樣子操作 `T(v)` 會將 value `v` 轉換成 `T` 型別

```go
var i int = 42
var f float64 = float64(i)
var u uint = uint(f)
```

### consts

使用 `const` 宣告常數值，常數值不能使用 `:=` 宣告

```go
const Pi = 3.14
```

# 流程控制

## for

for 迴圈的基本起手式，不需要小括弧，但大括弧是必要的

```go
func main() {
	sum := 0
	for i := 0; i < 10; i++ {
		sum += i
	}
	fmt.Println(sum)
}

```

go 版本的 `while`，仍是用 `for` 表示

```go
sum := 1
	for sum < 1000 {
		sum += sum
	}
	fmt.Println(sum)
```

永不停止的寫法，還是用 `for`

```go
for {
    ...
}
```

## if

條件判斷應該是最基本的，只是不需要小括弧，但大括弧是必要的

```go
if x < 0 {
		return sqrt(-x) + "i"
}
```

更懶惰但要習慣的寫法是，在 `if` 內做變數指定

```go
func pow(x, n, lim float64) float64 {
	if v := math.Pow(x, n); v < lim {
		return v
	}
	return lim
}
```

## switch

```go
today := time.Now().Weekday()
switch time.Saturday {
    case today + 0:
    fmt.Println("Today.")
    case today + 1:
    fmt.Println("Tomorrow.")
    case today + 2:
    fmt.Println("In two days.")
    default:
    fmt.Println("Too far away.")
}
```

基本 switch case 都會附上 break (預設隱藏)，當然要寫也是可以的，而 case 的條件也可以是 expression，這樣就不局限必須為一個數值之類的，可以是條件、function 的，以下是一些 switch case 不同的寫法

```go
func myswitch(v int) {
	switch {
	case v > 10:
		fmt.Println("value 大於 10")
	case v == 10:
		fmt.Println("value 等於 10")
	default:
		fmt.Println("value 小於 10")
	}
}
```
![image-20191125181044628](image-20191125181044628.png)

```go
func myswitch(v int) {
	switch {
	case v == 10:
		fallthrough
	case v > 10:
		fmt.Println("數字大於等於 10")
	default:
		fmt.Println("其他數值")
	}
}
```
![image-20191125181816420](image-20191125181816420.png)


* `fallthrough` : 執行完此 case 後，繼續往下走 switch case 判斷

```go
func myswitch(v int) {
	switch v {
	case 0, 1, 2, 3, 4, 5:
		fmt.Println("介於 0 ~ 5 之間")
	case 6, 7, 8, 9, 10:
		fmt.Println("介於 6 ~ 10 之間")
	default:
		fmt.Println("其他數值")
	}
}
```

![image-20191125181317946](image-20191125181317946.png)



## defer

`defer` 會等到周圍的 function 都執行完成後，再執行

```go
package main

import "fmt"

func main() {
	defer fmt.Println("world")

	fmt.Println("hello") // hello world
}

```

既然 defer 會 hold 住 function，那當好幾個 defer 時，又會怎麼執行呢

```go
package main

import "fmt"

func main() {
	fmt.Println("counting")

	for i := 0; i < 10; i++ {
		defer fmt.Println(i)
	}

	fmt.Println("done")
}

```

輸出結果為

![image-20191125144018502](image-20191125144018502.png)

所以 defer 所堆疊起來的 functions，會採後進先出的方式執行，可以讀此[文章]( https://blog.golang.org/defer-panic-and-recover )了解更多

# 參考資料

* [A Tour of Go - Packages, variables, and functions]( https://tour.golang.org/basics/2 )
* [A Tour of Go - Flow control..]( https://tour.golang.org/flowcontrol/1 )