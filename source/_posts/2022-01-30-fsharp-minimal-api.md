---
layout: post
title: 'FSharp 也要走 minimal API 風'
comments: true
typora-root-url: 2022-01-30-fsharp-minimal-api
typora-copy-images-to: 2022-01-30-fsharp-minimal-api
date: 2022-01-30 13:33:56
categories: FSharp
tags: FSharp
---

Minimal API 推出後，很多人慢慢能接受這樣的風格了，而 F# 當然也要來一波，以下是簡單跟風過程

<!-- more -->

# 基本型

透過 VS2022 建立一個空專案，語言選擇 F#，就完成了 

![image-20220130135421055](image-20220130135421055.png)

![image-20220130135458674](image-20220130135458674.png)

後面就下一步到整個專案建立起來，然後就會看到一個很乾淨的 program.fs 了

```fsharp
open System
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)
    let app = builder.Build()

    app.MapGet("/", Func<string>(fun () -> "Hello World!")) |> ignore

    app.Run()

    0 // Exit code
```

將專案執行起來後就可以看 Hello World! 的顯示

![image-20220130141201938](image-20220130141201938.png)

# 來點變化

新增一個 `HOme.fs` 的檔案，然後將 root request 的動作搬到新檔案中，然後多點變化

```fsharp
// Home.fs
module Home

open System
open Microsoft.AspNetCore.Builder

let showTime = 
    let getCurrentTime () = DateTime.Now
    Func<DateTime>(getCurrentTime)

let registerRoutes (app: WebApplication) =
    app.MapGet("/", showTime) |> ignore
    app
```

而原本的 `Program.fs` 就可以改成這樣

```fsharp
open System
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)
    let app = builder.Build()

	// Changing
    app
    |> Home.registerRoutes
    |> ignore
    
    app.Run()

    0 // Exit code
```

這樣是不是就乾淨很多了，在來多寫一個 add/get items 的小功能

```fsharp
// Todo.fs
[<RequireQualifiedAccess>]
module Todo

open System
open Microsoft.AspNetCore.Builder

type Todo = 
    { id: int
      title: string
      isDone: bool}

let mutable private todos = []

type ITodoService = 
   abstract GetTodos: unit -> Todo seq

let TodoService = { new ITodoService with
                       member this.GetTodos(): seq<Todo> =
                         todos |> List.toSeq  }

let private getTodos = 
    Func<ITodoService, Todo seq>
        (fun (todos: ITodoService) -> todos.GetTodos())

let private addTodo =
    Func<Todo, bool>
        (fun todo -> 
            todos <- todo:: todos
            true)

let registerRoutes (app: WebApplication) =
    app.MapGet("/todos", getTodos) |> ignore
    app.MapPost("/todos", addTodo) |> ignore
    app
```

`Program.fs`

```fsharp
open System
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.DependencyInjection // 註冊 service 需要的 namespace

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)
    // 註冊 service
    builder
        .Services
        .AddSingleton<Todo.ITodoService>(fun _ -> Todo.TodoService) |> ignore

    let app = builder.Build()
   
    app
    |> Home.registerRoutes
    |> Todo.registerRoutes
    |> ignore

    
    app.Run()

    0 // Exit code


```

## 測試

寫完後就可以用 postman 來測試一下

1. Query Items

   ![image-20220130144502653](image-20220130144502653.png)

2. Add Item

   ![image-20220130144622387](image-20220130144622387.png)

   新增成功後在查詢看有沒有存進去

   ![image-20220130144654827](image-20220130144654827.png)

# 小結

同樣的架構在 F# 有可以試用，這是個好消息，之後會再嘗試接上 mongo了，此篇文章的程式碼是參考 [Github Repo](https://github.com/AngelMunoz/NetSixSamples/tree/main/Newishfs)，也會在平日的晚上找時間開 F# 讀書會，有興趣的可以 follow 一下





