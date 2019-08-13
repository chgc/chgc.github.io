---
layout: post
title: '[.NET Core] gRPC with Visual Studio 2019 and .NET Core 3'
comments: true
typora-root-url: 2019-04-08-grpc-chat-server/
typora-copy-images-to: 2019-04-08-grpc-chat-server/
date: 2019-04-08 09:10:44
categories: .NET Core
tags: .NET Core
---

微軟在去年年底發出一篇關於 .NET Core 3.0 會包含哪些新功能 ([文章由此去](<https://msdn.microsoft.com/en-us/magazine/mt848631.aspx>))，而其中提到了 gRPC 專案將會成為 first-class support for .NET developers.

> A common question from customers is how to have an RPC (as in .NET Remoting and Windows Communication Foundation) experience on .NET Core. We are contributing to the gRPC ([grpc.io](http://grpc.io/)) project to ensure gRPC will have first-class support for .NET developers.

而在 2019 年 .NET Core 3.0 preview 及 Visual Studio 2019 的釋出 (註: 必須使用 Visual Studio 2019 開發)，就將 gRPC Service 的專案範本內建了，真的從零到一個可以運行的 gRPC service 只需要幾個步驟就完成了，與早期那個什麼都需要自己刻的時代，整個幸福太多了。

<!-- more -->

# gRPC 簡介

但開始介紹如何開發 gRPC 前，要先稍微了解 gRPC 是什麼? 

[gRPC](http://www.grpc.io/)是一個高性能、通用的開源RPC框架，其由Google主要面向移動應用開發並基於HTTP/2協議標準而設計，基於ProtoBuf (Protocol Buffers)序列化協議開發，且支持眾多開發語言。 



![Concept Diagram](landing-2.svg)

更多的細節，可以在 [grpc.io](https://grpc.io/docs/guides/) 的網站上找到，建議可以好好的閱讀過後，在進行開發會比較順利



# 開發

## 環境準備

* .NET Core 3.0 ：要安裝 preview 3 的版本，支援程度會比較高，[下載網頁](https://dotnet.microsoft.com/download/dotnet-core/3.0)

* Visual Studio 2019: [下載網址](https://visualstudio.microsoft.com/zh-hant/vs/)，可以下載 Community 版本的 (免費)

  * 因為 Visual Studio 2019 正式版預設是不支援使用 .NET Core SDK Preview 版本，所以要手動開啟

    ![1554781422715](1554781422715.png)

    ![1554781465103](1554781465103.png)

  * 確定後，關閉重啟 Visual Studio 即可使用 .NET Core SDK 預覽版本

# 建立新專案

1. 開啟 VS 2019

2. 建立新專案

   ![1554781107356](1554781107356.png)

3. 選擇 【ASP.NET Core Web 應用程式】，下一步

   ![1554781164014](1554781164014.png)

4. 設定專案名稱及專案儲存位置後，點選【建立】

   ![1554781245650](1554781245650.png)

5. 選擇 【ASP.NET Core 3.0】，方可看到 gRPC Service 專案範本

   ![1554781566463](1554781566463.png)

6. 選擇 【gRPC Service】專案範本後，點選【建立】

   ![1554781620367](1554781620367.png)

7. 等待建立專案

   ![1554781653394](1554781653394.png)

8. 完成專案建立後，會看到這兩個專案被建立在同一個方案下

   ![1554781734084](1554781734084.png)

9. 這時候已經完成建立一個可以被執行的 gRPC 專案了，包含 Server 與 Client 端的程式碼



# 專案檔案解說

* 專案檔 (xxx.csproj)：在 VS2019 已經不需要將專案先卸載後才能看 csproj 檔案，可以直接開啟看，十分方便
    * 經保哥提醒，在 VS2017 就有這個功能了，看我多久沒寫後端了

  ```xml
  <Project Sdk="Microsoft.NET.Sdk.Web">
  
    <PropertyGroup>
      <TargetFramework>netcoreapp3.0</TargetFramework>
    </PropertyGroup>
  
     // 定義 proto 檔案的讀取位置
     // 在 Client 端也有此設定，所以 server 與 client 是共用同一份 proto 檔案
    <ItemGroup>
      <Protobuf Include="..\Protos\*.proto" GrpcServices="Server" />
      <Content Include="@(Protobuf)" LinkBase="" />
    </ItemGroup>
  
      // gRPC 相關的套件
    <ItemGroup>
      <PackageReference Include="Grpc.AspNetCore.Server" Version="0.1.19-pre1" />
      <PackageReference Include="Google.Protobuf" Version="3.6.1" />
  
      <PackageReference Include="Grpc.Tools" Version="1.19.0-pre1" PrivateAssets="All" />
    </ItemGroup>
  
  </Project>
  
  ```

  ![1554782483949](1554782483949.png)

* `Startup.cs` 

  ```csharp
  public void ConfigureServices(IServiceCollection services)
  {
      // 加入 gRPC 服務
      services.AddGrpc();
  }
  
  public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
  {
      ...
      // 設定 gPRC 實做 proto 的 service 
      app.UseRouting(routes =>
                     {                       
                         routes.MapGrpcService<GreeterService>();
                     });
  }
  ```

* `greet.proto`：gRPC  通訊的合約規範檔，當每次重建專案時，Visual Studio 會依據此檔案將相關的程式碼產生出來 (Code Gen)

  ```
  syntax = "proto3";
  
  package Greet;
  
  // 定義 Greeter service 內有哪些方法可以使用
  // 可依 gRPC 的各種溝通模式定義之
  service Greeter {
    // Sends a greeting
    rpc SayHello (HelloRequest) returns (HelloReply) {}
  }
  
  // 定義 Response 與 Request 的資料型別及結構
  // The request message containing the user's name.
  message HelloRequest {
    string name = 1;
  }
  
  // The response message containing the greetings.
  message HelloReply {
    string message = 1;
  }
  ```

* `Services/GreeterService.cs` ： 實做部分

  ```csharp
  using System;
  using System.Collections.Generic;
  using System.Linq;
  using System.Threading.Tasks;
  using Greet;
  using Grpc.Core;
  
  namespace gRPCDemo
  {
      // 繼承 Greeter.GreeterBase (根據 proto 檔案所產生的檔案)
      public class GreeterService : Greeter.GreeterBase
      {
          public override Task<HelloReply> SayHello(HelloRequest request, ServerCallContext context)
          {
              return Task.FromResult(new HelloReply
              {
                  Message = "Hello " + request.Name
              });
          }
      }
  }
  ```

  ![1554783284157](1554783284157.png)

* Client 端的使用方式

  ```csharp
  using System;
  using System.Collections.Generic;
  using System.IO;
  using System.Linq;
  using System.Threading.Tasks;
  using Greet;
  using Grpc.Core;
  
  namespace gRPCDemo
  {
      public class Program
      {
          static async Task Main(string[] args)
          {
              // Include port of the gRPC server as an application argument
              var port = args.Length > 0 ? args[0] : "50051"; // 預設連接 port
  
              // 建立連接頻道
              var channel = new Channel("localhost:" + port, ChannelCredentials.Insecure);
              // 建立 client 實體
              var client = new Greeter.GreeterClient(channel);
  		   
              // 呼叫使用 client 的方法
              // service Greeter {
   		   //   rpc SayHello (HelloRequest) returns (HelloReply) {}
  		   // }
              var reply = await client.SayHelloAsync(new HelloRequest { Name = "GreeterClient" });
              Console.WriteLine("Greeting: " + reply.Message);
  
              // 關閉連線
              await channel.ShutdownAsync();
  
              Console.WriteLine("Press any key to exit...");
              Console.ReadKey();
          }
      }
  }
  
  ```

# 實做 Chat Server

既然已經知道基本 gRPC Server 與 Client 端的檔案結構，那就來弄一個簡單的通訊軟體

1. 修改 greet.proto 檔名至 chat.proto

2. 修改 chat.proto 內容

   ```
   syntax = "proto3";
   
   package Chat;
   
   service ChatRoom {
     rpc join (stream Message) returns (stream Message) {}    
   }
   
   message Message {
     string user = 1;
     string text = 2;
   }
   ```

3. 在 Services 資料夾下，新增 `ChatService.cs ` 檔案

   ```csharp
   using System.Collections.Generic;
   using System.Threading.Tasks;
   using Chat;
   using Grpc.Core;
   
   namespace chatwithgrpc
   {
       public class ChatService: ChatRoom.ChatRoomBase
       {        
           public override async Task join(IAsyncStreamReader<Message> requestStream, IServerStreamWriter<Message> responseStream, ServerCallContext context)
           {
               if (!await requestStream.MoveNext()) return;            
   
               do
               {
                   // TODO: handle request chat message
               } while (await requestStream.MoveNext());
           }
       }
   }
   
   ```

4. 因為要記錄連上 gRPC 服務的連線 (就是  `IServerStreamWriter<Message> responseStream` 的部分)，所以需要另外建立一個 service 並註冊成 `Singleton` 模式，這裡就先建立一個服務叫做 `ChatRoom.cs`

   ```csharp
   // Startup.cs 檔案，註冊 ChatRoom 服務
   public void ConfigureServices(IServiceCollection services)
   {
       services.AddGrpc();
       services.AddSingleton<Server.ChatRoom>(); // add this line
   }
   ```

   * `ChatRoom.cs`
   ```csharp
   using Chat;
   using Grpc.Core;
   using System;
   using System.Collections.Generic;
   using System.Collections.Concurrent;
   using System.Linq;
   using System.Threading.Tasks;
   
   namespace chatwithgrpc.Server
   {
       public class ChatRoom
       {
   
           private ConcurrentDictionary<string, IServerStreamWriter<Message>> users = new ConcurrentDictionary<string, IServerStreamWriter<Message>>();
   
           public void join(string name, IServerStreamWriter<Message> response) => users.TryAdd(name, response);
   
           public void Remove(string name)  => users.TryRemove(name, out var s);
   
           public async Task BroadcastMessageAsync(Message message) => await BroadcastMessages(message);
   
           // 將某 Client 的請求內容，傳送到其他 Client 端去
           private async Task BroadcastMessages(Message message)
           {
               foreach (var user in users.Where(x => x.Key != message.User))
               {
                   var item = await SendMessageToSubscriber(user, message);
                   if (item != null)
                   {
                       Remove(item?.Key);
                   };
               }
           }
   	           
           private async Task<Nullable<KeyValuePair<string, IServerStreamWriter<Message>>>> SendMessageToSubscriber(KeyValuePair<string, IServerStreamWriter<Message>> user, Message message)
           {
               try
               {
                   // 將訊息送到 Client 端
                   await user.Value.WriteAsync(message);
                   return null;
               }
               catch (Exception ex)
               {
                   Console.WriteLine(ex);
                   return user;
               }
           }
       }
   }
   
   ```

5. 在 `ChatService.cs` 內注入 `ChatRoom` 並完成相關實做

   ```csharp
   using System.Collections.Generic;
   using System.Threading.Tasks;
   using Chat;
   using Grpc.Core;
   
   namespace chatwithgrpc
   {
       public class ChatService: ChatRoom.ChatRoomBase
       {
           private readonly Server.ChatRoom _chatroomService;
   
           public ChatService(Server.ChatRoom chatRoomService)
           {
               _chatroomService = chatRoomService;
           }
   
           public override async Task join(IAsyncStreamReader<Message> requestStream, IServerStreamWriter<Message> responseStream, ServerCallContext context)
           {
               if (!await requestStream.MoveNext()) return;
   
               do
               {
                   _chatroomService.Join(requestStream.Current.User, responseStream);
                   await _chatroomService.BroadcastMessageAsync(requestStream.Current);
               } while (await requestStream.MoveNext());
   
               _chatroomService.Remove(context.Peer);
   
           }
       }
   }
   ```

   1. line 19: 第一次 join 時，並不會收到任何由 client 傳來的請求，所以就加個條件排除第一次
   2. line 21~25 : 當 client 發出任何請求時，處理其請求內容，這裡就是廣播到其他有連線到 gRPC 服務的 client 端

6.  到這裡後端的實做可以算是完成了，接下來換寫 Client 端

7. `Program.cs`

   ```csharp
   public class Program
       {
           static async Task Main(string[] args)
           {
               Console.WriteLine("請輸入使用者姓名");
               var userName = Console.ReadLine();
               // Include port of the gRPC server as an application argument
               var port = args.Length > 0 ? args[0] : "50051";
   
               var channel = new Channel("localhost:" + port, ChannelCredentials.Insecure);
               var client = new ChatRoom.ChatRoomClient(channel);
   
               using (var chat = client.join())
               {               
                   _ = Task.Run(async () =>
                   {
                       while (await chat.ResponseStream.MoveNext(cancellationToken: CancellationToken.None))
                       {
                           var response = chat.ResponseStream.Current;
                           Console.WriteLine($"{response.User}: {response.Text}");
                       }
                   });
   				                
                   await chat.RequestStream.WriteAsync(new Message { User = userName, Text = $"{userName} has joined the room" });
   
                   string line;
                   while ((line = Console.ReadLine()) != null)
                   {
                       if (line.ToLower() == "bye")
                       {
                           break;
                       }
                       await chat.RequestStream.WriteAsync(new Message { User = userName, Text = line });
                   }
                   await chat.RequestStream.CompleteAsync();
               }
   
               Console.WriteLine("Disconnecting");
               await channel.ShutdownAsync();
           }
       }
   ```

   1. line 13: 建立與 server 端串流 (streaming) 連線
   2. line 15~22: 處理由 server 端回傳的訊息，這裡是由其他 Client 端所傳送的聊天訊息
   3. line 24: 對 Server 端發出第一次 Request
   4. line 27~34: 持續讀取 Console 畫面上的輸入訊息後，發訊息給 Server 端
   5. line 35: 結束由 `join` 建立的串流連線
   6. line 38: 關閉與 gRPC 服務的連線

8. 如果這時後直接執行 Server 與 Client 端時，會發現 Client 會很容易斷線。這是因為 gRPC 有預設 request timeout 的時間，這可以在 Server 端的 `Program.cs` 內做設定

   ```csharp
    public static IHostBuilder CreateHostBuilder(string[] args) =>
               Host.CreateDefaultBuilder(args)
                   .ConfigureWebHostDefaults(webBuilder =>
                   {
                       webBuilder.UseStartup<Startup>();
                       webBuilder.ConfigureKestrel((context, options) =>
                       {
                           // 增加此設定避免閒置斷線的問題
                           options.Limits.MinRequestBodyDataRate = null;
                       });
                   });
   ```

   

## 執行效果

![2019-04-09_14-00-48](2019-04-09_14-00-48.gif)



# 參考資料

* [grpc.io](https://grpc.io/)
* [gRPC C# Quick Start](https://grpc.io/docs/quickstart/csharp.html)
* [gRPC for .NET GitHub](https://github.com/grpc/grpc-dotnet)
* [簡單聊天功能 Repo](https://github.com/chgc/grpc-dotnetcore-3-chat)
