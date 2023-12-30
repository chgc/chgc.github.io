---
layout: post
title: '[gRPC] 重新學習 gRPC 系列 - 2'
comments: true
typora-root-url: 2023-12-30-backto-grpc-note2/
typora-copy-images-to: 2023-12-30-backto-grpc-note2/
date: 2023-12-30 10:21:25
categories: gRPC
tags: gRPC
---

了解 `proto` 的基本語法後，就可以來用一個程式語言實作 gRPC 服務了，本篇就用 Golang 來作範例吧，練習內容是根據官方文件所提供的教學內容，細節可以到[這邊](https://grpc.io/docs/languages/go/quickstart/)閱讀。

<!-- more -->

# 練習一

Golang 環境如何安裝這邊就不說明了。需要安裝 `Protobuf Compiler`([安裝連結](https://github.com/protocolbuffers/protobuf#protobuf-compiler-installation))，如果環境沒有安裝 C++，也可以下載預先 compile 好的執行檔，並設定好環境參數 ([步驟說明](https://grpc.io/docs/protoc-installation/#install-pre-compiled-binaries-any-os))，如果一切設定正確，在命令視窗內應可執行 `protoc` 指令了

練習題目: 建立一個 address book，功能是可以從檔案中存取聯絡資訊，聯絡資訊包含姓名、ID、Email、連絡電話

## 初始化專案

1. 建立一個新的資料夾

2. 執行 `go mod init <project name>` 指令

3. 建立 `addressbook.proto` 檔案

   ```protobuf
   syntax = "proto3";
   
   package tutorial;
   
   import "google/protobuf/timestamp.proto";
   
   option go_package = "./tutorialpb";
   
   message Person {
       string name = 1;
       int32 id = 2;
       string email = 3;
       repeated PhoneNumber phones = 4;
       google.protobuf.Timestamp last_updated = 5;
   
       message PhoneNumber {
           string number = 1;
           PhoneType type = 2;
       }
   }
   
   enum PhoneType {
     PHONE_TYPE_UNSPECIFIED = 0;
     PHONE_TYPE_MOBILE = 1;
     PHONE_TYPE_HOME = 2;
     PHONE_TYPE_WORK = 3;
   }
   
   message AddressBook {
       repeated Person people = 1;
   }
   ```

   - 123

4. 安裝 `go install google.golang.org/protobuf/cmd/protoc-gen-go@latest`

5. 開啟命令視窗，執行 `protoc -I=. --go_out . addressbook.proto` 指令，即可看到程式碼產生再 `tutorialpb` 的資料夾下

##  實作

1. 建立 `main.go`

2. 引用剛剛產生的程式碼，其內容會包含

   1. An `AddressBook` structure with a `People` field.
   2. A `Person` structure with fields for `Name`, `Id`, `Email` and `Phones`.
   3. A `Person_PhoneNumber` structure, with fields for `Number` and `Type`.
   4. The type `Person_PhoneType` and a value defined for each value in the `Person.PhoneType` enum.

   ```go
   package main
   
   import (
   	pb "go-grpc/tutorialpb"
   )
   
   func main() {
   	p := pb.Person{
   		Id:    1234,
   		Name:  "John Doe",
   		Email: "jdoe@example.com",
   		Phones: []*pb.Person_PhoneNumber{
   			{Number: "555-4321", Type: pb.PhoneType_PHONE_TYPE_HOME},
   		},
   	}
   }
   ```



### Writing a Message

```go
package main

import (
	"fmt"
	pb "go-grpc/tutorialpb"
	"log"
	"os"

	"google.golang.org/protobuf/proto"
)

func main() {
	fname := "adress"
	
    // 讀取檔案內容
	in, err := os.ReadFile(fname)
	if err != nil {
		if os.IsNotExist(err) {
			fmt.Printf("%s: File not found.  Creating new file.\n", fname)
		} else {
			log.Fatalln("Error reading file:", err)
		}
	}

    // 建立 Person 物件
	p := pb.Person{
		Id:    1234,
		Name:  "John Doe",
		Email: "jdoe@example.com",
		Phones: []*pb.Person_PhoneNumber{
			{Number: "555-4321", Type: pb.PhoneType_PHONE_TYPE_HOME},
		},
	}
	
	book := &pb.AddressBook{}

    // 將檔案內容放進 AddressBook 物件內
	if err := proto.Unmarshal(in, book); err != nil {
		log.Fatalln("Failed to parse address book:", err)
	}

    // 新增聯絡人
	book.People = append(book.People, &p)

    // Marshal & 儲存回檔案中
	out, err := proto.Marshal(book)
	if err != nil {
		log.Fatalln("Failed to encode address book:", err)
	}

	if err := os.WriteFile(fname, out, 0644); err != nil {
		log.Fatalln("Failed to write address book:", err)
	}
}

```



### Reading a Message

```go
package main

import (
	pb "go-grpc/tutorialpb"
	"log"
	"os"

	"google.golang.org/protobuf/proto"
)

func main() {
	fname := "adress"

	in, err := os.ReadFile(fname)
	if err != nil {
		log.Fatalln("Error reading file:", err)
	}

	book := &pb.AddressBook{}

	if err := proto.Unmarshal(in, book); err != nil {
		log.Fatalln("Failed to parse address book:", err)
	}

    // 列出聯絡簿資訊
	for _, p := range book.People {
		log.Println("Person ID", p.Id)
		for _, pn := range p.Phones {
			switch pn.Type {
			case pb.PhoneType_PHONE_TYPE_HOME:
				log.Println("Home Number", pn.Number)
			case pb.PhoneType_PHONE_TYPE_WORK:
				log.Println("Work Number", pn.Number)
			case pb.PhoneType_PHONE_TYPE_MOBILE:
				log.Println("Cell Number", pn.Number)
			}
		}
	}
}

```



# 練習二

練習題目: 建立一個可以回 Hello World 的  gRPC Service

- 安裝 protocol compiler plugins

  ```bash
  go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
  go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
  ```

  

- 建立 `helloWorld.proto`

  ```protobuf
  syntax = "proto3";
  
  package helloWorld;
  
  option go_package = "./helloWorldpb";
  
  service Greeter {
      rpc SayHello(HelloReqeust) returns (HelloResponse){}
  }
  
  message HelloResponse {
      string message = 1;
  }
  
  message HelloReqeust {
      string name = 1;
  }
  ```

- 執行 ` protoc --go_out=. --go-grpc_out=. helloworld.proto`，會產生兩個檔案

  - ***.pb.go\*** 包含用於 protobuf 消息的序列化/反序列化的程式
  - ***_grpc.pb.go\*** 包含 gRPC 服務器和客戶端的程式

- 建立 `server/server.go`，建立 gRPC Server 需要完成兩件事情

  - 實作定義在 proto 檔中的 service interface
  - 啟動 gRPC server，設定 service

  ```go
  package main
  
  import (
  	"context"
  	"flag"
  	"fmt"
  	"log"
  	"net"
  
  	pb "go-grpc/helloWorldpb"
  
  	"google.golang.org/grpc"
  )
  
  var (
  	port = flag.Int("port", 50051, "The server port")
  )
  
  // 實作 Greeter gRPC
  type server struct {
  	pb.UnimplementedGreeterServer
  }
  
  func (s *server) SayHello(ctx context.Context, in *pb.HelloReqeust) (*pb.HelloResponse, error) {
  	return &pb.HelloResponse{Message: "Hello World " + in.GetName()}, nil
  }
  
  
  func main() {    
  	flag.Parse()
      // service port 設定
  	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
  	if err != nil {
  		log.Fatalf("failed to listen: %v", err)
  	}
      // 建立一個空的 gRPC Server
  	s := grpc.NewServer()
      
      // 註冊 Greeter Service
  	pb.RegisterGreeterServer(s, &server{})
  	log.Printf("server listening at %v", lis.Addr())
      
      // 啟動 gRPC Server
  	if err := s.Serve(lis); err != nil {
  		log.Fatalf("failed to serve: %v", err)
  	}
  }
  
  ```

- 建立 `client/client.go`

  ```go
  package main
  
  import (
  	"context"
  	"flag"
  	"log"
  	"time"
  
  	pb "go-grpc/helloWorldpb"
  
  	"google.golang.org/grpc"
  	"google.golang.org/grpc/credentials/insecure"
  )
  
  const (
  	defaultName = "world"
  )
  
  var (
  	addr = flag.String("addr", "localhost:50051", "the address to connect to")
  	name = flag.String("name", defaultName, "Name to greet")
  )
  
  func main() {
  	flag.Parse()
  	// 建立 gRPC 連線
  	conn, err := grpc.Dial(*addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
  	if err != nil {
  		log.Fatalf("did not connect: %v", err)
  	}
  	defer conn.Close()
      
      // 建立 Client
  	c := pb.NewGreeterClient(conn)
  
  	// Contact the server and print out its response.
  	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
  	defer cancel()
      // 呼叫 gRPC Service 方法
  	r, err := c.SayHello(ctx, &pb.HelloReqeust{Name: *name})
  	if err != nil {
  		log.Fatalf("could not greet: %v", err)
  	}
  	log.Printf("Greeting: %s", r.GetMessage())
  }
  
  ```

  



# 參考資料 

- [Go Tutorials - 1](https://protobuf.dev/getting-started/gotutorial)
- [Go Tutorials -  2](https://grpc.io/docs/languages/go/quickstart/)

