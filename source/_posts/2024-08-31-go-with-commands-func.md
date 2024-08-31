---
layout: post
title: [GO] 用做一個 CLI 工具
comments: true
typora-root-url: 2024-08-31-go-with-commands-func/
typora-copy-images-to: 2024-08-31-go-with-commands-func/
date: 2024-08-31 10:23:44
categories: Go
tags: Go
---

工作上常使用的 CLI 工具，例如 `Ollama` 的指令，這樣的效果如何在 Go 裡面實踐呢? 利用練習的機會把相關的流程紀錄一下

![image-20240831103322975](/image-20240831103322975.png)



<!-- more -->

## 基本款

這裡會使用 cobra library 做 CLI 工具的基底，程式碼架構如下

![image-20240831105241225](image-20240831105241225.png)

1. `main.go`  主要進入點
2. `cmds/root.go` 建立 `RootCommand`
3. `cmds/run` 這邊就可以依自己的需求將要執行的 `RunCommand` 分別放

提到兩個名詞

1. `RootCommand` : CMD 容器，可以想成是用來註冊執行命令
2. `RunCommand` : 真正提供功能的命令

### 建立 RootCommand

```go
package cmds

import "github.com/spf13/cobra"

func NewRootCommand() *cobra.Command {
	return &cobra.Command {
		Use: "cky",
		Short: "CKY first CLI",
		Long: "This is first CKY CLI for study purpose",
	}
}
```

程式碼本身很簡單，`Use` 是 CLI help 中會顯示的的起點名稱，例如這邊我設定成 `cky`，在 help 訊息會顯示 `Use "cky [ccommand] ..."` ，基於這樣的原因在 build go 執行檔時，output 名稱會跟這邊相同，在使用上的體驗會是一致的。

### 執行 Command

```go
// main.go
package main

import (
	"os"

	"cky.cmds/cmds"
)

func main() {
	rootCmd := cmds.NewRootCommand()
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}
```

在還沒有加入任何 `RunCommand` 時，執行 `main.go` 會直接顯示 `RootCommand` 的 Long (長版本的說明文字)

![image-20240831110257594](image-20240831110257594.png)

### 新增 RunCommand

```go
// cmds/run/run.go
package run

import (
	"fmt"
	"github.com/spf13/cobra"
)

func NewRunCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use: "run",
		Short: "run run",
		Long: "Run Run",
		Run: run,
	}
	return cmd
}

func run(_ *cobra.Command, _ []string) {
	fmt.Print("Run command executed")
}
```

附加到 `RootCommand` 上 

```go
// main.go
package main

import (
	"os"

	"cky.cmds/cmds"
	"cky.cmds/cmds/run"
)

func main() {
	rootCmd := cmds.NewRootCommand()

    // 註冊 RunCommand
	runCmd := run.NewRunCommand()
	rootCmd.AddCommand(runCmd)

	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}
```

執行結果

![image-20240831110441352](image-20240831110441352.png)

With `run` command

![image-20240831110505007](image-20240831110505007.png)

### Build 執行檔後的執行效果

> go build -o cky main.go

```bash
./cky help
```

![image-20240831110637372](image-20240831110637372.png)

```bash
./cky run
```

![image-20240831110657582](image-20240831110657582.png)

## 進階款

建立一個陽春版的 CLI 就是這麼簡單，但如果能傳個參數就能發會更大的效用，假設我希望印出使用者傳進去的參數，這時該怎麼做呢? 

我們可以透過 `Flags()` 的方式來達成這目的

```go
// cmds/run/run.go
func NewRunCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use: "run",
		Short: "run run",
		Long: "Run Run",
		Run: run,
	}
    // add greetings flag
	cmd.Flags().StringP("greeting", "g", "a", "b")

	return cmd
}
```

![image-20240831113548641](image-20240831113548641.png)

取得 flags 值得方式

```go
// cmds/run/run.go
func run(cmd *cobra.Command, args []string) {
    greeting, _ := cmd.Flags().GetString("greeting")
	fmt.Printf("Run command executed: Greeting: %s", greeting)
}
```



執行效果

![image-20240831114608119](image-20240831114608119.png)

## 小結

cobra library 提供的功能其實更多，這邊是簡單快速的先過一下基本用法，更多的使用方式，可以參閱下面的參考資料

這樣的好處是什麼，當打包成 image 時，就可以使用命令的方式來執行對應的功能，就不需要製作成不同的 image，在 runtime 的靈活度大幅提升，維護成本降低。



## 參考資料

- [cobra user guide](https://github.com/spf13/cobra/blob/main/site/content/user_guide.md)
- [How to add flags to a CLI tool built with Go and Cobra](https://dev.to/divrhino/adding-flags-to-a-command-line-tool-built-with-go-and-cobra-34f1)
- [Go 每日一库之 cobra](https://darjun.github.io/2020/01/17/godailylib/cobra/)







