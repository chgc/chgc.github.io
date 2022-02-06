---
layout: post
title: 'FSharp + Minimal API + MongoDB'
comments: true
typora-root-url: 2022-01-30-fsharp-minimalAPI-mongodb
typora-copy-images-to: 2022-01-30-fsharp-minimalAPI-mongodb
date: 2022-01-30 20:34:35
categories: FSharp
tags: FSharp
---

延續[上一篇](https://blog.kevinyang.net/2022/01/30/fsharp-minimal-api/) 寫的內容，將 MongoDB 的功能加進來，順便練習 F#

<!-- more -->

# Work with MongoDB

.net core 專案不管是 C# 或是 F# 要使用 MongoDB 都需要安裝一個 package `MongoDB.Driver`，安裝完成後就可以連接 MongoDB 了，這邊就假設各位的電腦已經有一個正常運行的 MongoDB，如果沒有，網路上有很多安裝教學

接下來的檔案都是在 `Todo.fs` 內做異動

1. 調整 `Todo` type 定義

   ```fsharp
   type Todo = {
         id: BsonObjectId // mongodb 自己的 key 欄位, 需要 open MongoDB.Bson
         uid: string // 上一篇使用 int, 這裡改用 Guid 當作 uid
         title: string
         isDone: bool }
   ```

2. 增加 property 和 method 到 `ITodoService` type

   ```fsharp
   type ITodoService =  
      abstract mongo: MongoClient
      abstract db: IMongoDatabase
      abstract GetTodos: unit -> Todo seq
      abstract SaveTodo: Todo -> bool
   ```

3. 將缺少的部分實做補齊

   ```fsharp
   let TodoService = 
       { new ITodoService with   
           member __.mongo = MongoClient("your mongodb connection string")
           member __.db = __.mongo.GetDatabase "todos" // 可以換成自己建立的 database 名稱
           member __.GetTodos(): seq<Todo> =
               __.db
                 .GetCollection<Todo>("todos")
                 .Find(Builders.Filter.Empty)
                 .ToEnumerable() |> Seq.cast
                 
           member __.SaveTodo todo =
               let collection = __.db.GetCollection<Todo>("todos")
               let todos = 
                   collection
                       .Find(fun x-> x.uid = todo.uid)
                       .ToEnumerable()
   
               match Seq.isEmpty todos with
               | true -> 
                   collection.InsertOne { todo with
                                           id = BsonObjectId(ObjectId.GenerateNewId())
                                           uid = Guid.NewGuid().ToString() } |> ignore
                   true
               | false -> 
                   let filter = Builders<Todo>.Filter.Eq((fun x -> x.uid), todo.uid)
                   let update =
                       Builders<Todo>.Update
                           .Set((fun x -> x.title), todo.title)
                           .Set((fun x -> x.isDone), todo.isDone)
   
                   collection.UpdateOne(filter, update) |> ignore
                   true
       }
   ```

   * `__.GetTodos()` 這一段我稍微卡到的地方在於 `IEnumerable` 轉型到 `Seq` 的地方，查了一下文件，發現 `IEnumerable` 和 `Seq` 的本質上是一樣的，所以只要使用 `Seq.cast` 的方法轉一下即可
   * MongoDB Collection 的查詢是使用 `Builders.filter` 的方法建立，這裡因為是要全撈，所以就單純使用 `Builders.Filter.Empty`
   * `__.SaveTodo` 的部分，我將建立與更新寫在一起，判斷方式是先用傳進來的 `todo.uid` 去尋找是否有存在的記錄，透過 pattern match 的寫法來區分新增與更新
   * line 24: 建立 `filter` 與 `update` 的定義，`colletion.UpdateOne` 方法需要傳進這兩個定義

4. 修改 `addTodo` 的方法

   ```fsharp
   let private addTodo =
       Func<ITodoService, Todo, bool>
           (fun (todos: ITodoService) (todo) -> todos.SaveTodo todo)
   ```

   有好一段時間沒有寫 C#，熊熊忘記 `Func` 的使用方式，還好後來有想起來，而這邊跟寫 C# 的差異在於 line 3 的部分，如果是 C# 會這樣子寫 `(todos: ITodoService , todo) => {...}`，但在 F# 的世界裡，因為 `Func` 的 signature 是 `Func(a -> b -> c)`，所以才會有 line 3 的寫法出現了，算是 FP 的特性之一。

   BTW，如果想要將 FP 學好，要學會看懂 signature

這樣調整完後，重新執行測試 API ，沒有意外就可以看到資料有儲存到 MongoDB 內了

# 注入 IConfiguration

經過一晚的思考，還是將如何使用 Configuration 的作法補上來，順便熟悉 `Minimal API` 的 DI 機制，接下來會分兩塊來看

1. map func 直接注入 dependency

   ```fsharp
   [<RequireQualifiedAccess>]
   module Home
   
   open System
   open Microsoft.AspNetCore.Builder
   open Microsoft.Extensions.Configuration
   
   let showVersion = 
       let getCurrentVersion (config:IConfiguration) = config["version"]
       Func<IConfiguration, string>(getCurrentVersion)
   
   let registerRoutes (app: WebApplication) =
       app.MapGet("/", showVersion) |> ignore
       app
   ```

   * line 10: 的 `Func` 寫法如同上面的，可以用這樣子的方式取得註冊在 services 內的服務 (framework 幫我們完成)

2. 註冊 service 層的 DI

   ```fsharp
   let TodoService (config: IConfiguration) = 
       { new ITodoService with        
           member __.mongo = MongoClient(config["mongodb"])
           member __.db = __.mongo.GetDatabase "todos"
         ....}
   ```

   * line 1: 在宣告時就表明要給 `IConfiuration`

   ```fsharp
   builder
       .services
       .AddSingleton<Todo.ITodoService>(fun _ -> Todo.TodoService builder.Configuration) |> ignore
   ```

   * 所以在註冊的時候就餵給他 Configuration 就好

這樣子就完成了，這部分的寫法我一開始有點鬼打牆，主要是因為我卡在 C# 版本的觀念，service 的 DI 要從 `constructure` 注入，後來想通其實他就是 function，就直接傳進去就好了。

換另外一個層面來看，當你發現一個 function 要傳入的東西太多時，就要重新思考這段程式碼是否有問題，是不是負責太多事情了。



