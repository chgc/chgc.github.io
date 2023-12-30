---
layout: post
title: '[gRPC] 重新學習 gRPC 系列 - 1'
comments: true
typora-root-url: 2023-12-30-backto-grpc-note1/
typora-copy-images-to: 2023-12-30-backto-grpc-note1/
date: 2023-12-30 07:31:34
categories: gRPC
tags: gRPC
---

距離上一次碰 gRPC 已經是 4 年前的事情了，現在又有機會接觸到 gRPC，趁這次機會重新將 gRPC 相關的東西了解一次

什麼是 gPRC，根據官網的說明

> ## A high performance, open source universal RPC framework

為什麼選擇 gPRC 呢

> gRPC is a modern open source high performance Remote Procedure Call (RPC) framework that can run in any environment. It can efficiently connect services in and across data centers with pluggable support for load balancing, tracing, health checking and authentication. It is also applicable in last mile of distributed computing to connect devices, mobile applications and browsers to backend services.

這表示 gRPC 是一個可以在各種語言/環境中，做到高效且擴充性佳的框架，十分有趣。繼續研讀下去

<!-- more -->

# Introduction

![image-20231230081207638](image-20231230081207638.png)

這張圖說明了 gRPC Server 與 Client 間的溝通模式，基於 Proto 的定義，以 Protocol Buffer 格式來進行雙方的溝通。

## protocol Buffers

gRPC 需定義 `.proto` 的文件，再透過工具就可以產生對應語言的程式碼，了解 `proto` 的語法是必須的

```protobuf
syntax = "proto3";

// The greeter service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```

* line 1: 宣告 proto 語法版本，如果不宣告，預設會使用 `proto2` 語法
* 宣告 proto 語法版本有些限制，1) 必須是第一行 2) 不可以有註解說明
* line 4 - 7: 定義 gRPC Service 有哪些方法可以使用，接受的參數格式及回傳格分別為什麼, PascalCase 命名法
* line 10 - 17 是定義 `message` 格式，可以想成是在定義 data model

### Message Type

```protobuf
syntax = "proto3";

message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 results_per_page = 3;
}
```

- `SearchRequest` 有定義三個欄位，分別為 string `query`, 兩個 integers (`page_number`, `results_per_page`)，使用 [scalar types](https://protobuf.dev/programming-guides/proto3/#scalar)

- 後面的數字定義，可使用範圍為 1 到 536,870,911，不能使用的數字區間限制有 

  1. 系統預設的保留區段 19,000 到 19,999
  2. 被 Extension 規範的範圍 ([Link](https://protobuf.dev/programming-guides/extension_declarations/))

- 一個 message 定義內的數字不能重複

- 一旦 message 有被使用，就不能更改數字

- 數字修改的行為意思，等同欄位被刪除

- 為了 message size，效能考量，數字應從 1 開始使用，size 規則為 1 到 15 會使用 1 byte，而 16 到 2047 會占用 2 bytes。(Ref: [Message Structure](https://protobuf.dev/programming-guides/encoding/#structure))

- message 可以定義在單一 `proto` 檔案或多個，但會建議一個 `proto` 檔案內的 message 定義不應該太多

- 註解 syntax :  `//` 或是 `/*....*/` 

- 如果要刪除欄位，需要 `reserve` 原本欄位使用的數字，已避免未來被誤用

  ```protobuf
  message Foo {
    reserved 2, 15, 9 to 11;
    reserved "foo", "bar";
  }
  ```

- 可定義及使用 `Enum` 型別

  ```protobuf
  enum Corpus {
    CORPUS_UNSPECIFIED = 0;
    CORPUS_UNIVERSAL = 1;
    CORPUS_WEB = 2;
    CORPUS_IMAGES = 3;
    CORPUS_LOCAL = 4;
    CORPUS_NEWS = 5;
    CORPUS_PRODUCTS = 6;
    CORPUS_VIDEO = 7;
  }
  
  message SearchRequest {
    string query = 1;
    int32 page_number = 2;
    int32 results_per_page = 3;
    Corpus corpus = 4;
  }
  ```

  - Enum 定義時必須要有 0，因為 Enum 型別的預設值是 0

- 如果 Enum  內有出現值重複的需求，這時候需要設定 `allow_alias = true`

  ```protobuf
  enum EnumAllowingAlias {
    option allow_alias = true;
    EAA_UNSPECIFIED = 0;
    EAA_STARTED = 1;
    EAA_RUNNING = 1;
    EAA_FINISHED = 2;
  }
  
  enum EnumNotAllowingAlias {
    ENAA_UNSPECIFIED = 0;
    ENAA_STARTED = 1;
    // ENAA_RUNNING = 1;  // Uncommenting this line will cause a warning message.
    ENAA_FINISHED = 2;
   }
  ```

- 有 Nested Types

  ```protobuf
  message SearchResponse {
    message Result {
      string url = 1;
      string title = 2;
      repeated string snippets = 3;
    }
    repeated Result results = 1;
  }
  
  message SomeOtherMessage {
    SearchResponse.Result result = 1;
  }
  ```



# 參考網站

- [gPRC](https://grpc.io/)
- [Protocal Language Guide (proto 3)](https://protobuf.dev/programming-guides/proto3/)
- [Protocol Buffers Documentation - Style Guide](https://protobuf.dev/programming-guides/style/)
- [Proto Best Practices](https://protobuf.dev/programming-guides/dos-donts/)
