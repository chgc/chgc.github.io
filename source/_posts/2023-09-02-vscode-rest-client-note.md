---
layout: post
title: '[VSCode] Rest Client Extension'
comments: true
typora-root-url: 2023-09-02-vscode-rest-client-note/
typora-copy-images-to: 2023-09-02-vscode-rest-client-note/
date: 2023-09-02 22:30:17
categories: VSCode
tags: VSCode
---

除了 Postman，在 VS Code 內還有其他類似的套件可以選擇，例如本篇筆記的主角 `Rest Client`

<!-- more -->

![image-20230902223304534](image-20230902223304534.png)

可以從 VS Code 的 extension market 內搜尋並安裝，使用方式也很簡單，只要檔名的結果是 `.http` 或是 `.rest` 都是 `Rest Client` 可以支援的檔案類型，先用一個簡單的範例作展示

![image-20230902223629295](image-20230902223629295.png)

真的很簡單使用，但當然不只有這樣，這篇筆記會記錄我在使用上的一些心得或技巧

## 筆記心得

1. `Content-Type` 設定: 在做 POST 或是 PUT 時會傳 JSON 格式為 body 內容，這時候就需要設定  `Content-Type`，設定方式如下

   ```
   POST https://jsonplaceholder.typicode.com/todos
   Content-Type: application/json
   ```

2. 可使用 `###` 來分隔 Request 內容

3. `#` 或是 `//` 可用來寫註解
   ![image-20230902225112808](image-20230902225112808.png)

4. 自定義變數

   1. Environment variables 可定義在 VS Code setting 內，這種變數可以跨檔案使用

   2. File variables: 定義在 `.http` 檔案內

   3. Request variables: 將 Request 的內容存在 `Request variable` 內，供同一個檔案內的其他 request 使用，`# @name <<request name>>`  或是 `// @name <<request name>>` 定義 request variable

   4. 透過 `# @prompt {var1} {description}` 或是 `// @prompt {var1} {description}` 定義，可讓使用者輸入變數值
      ![image-20230902231230878](image-20230902231230878.png)

   5. 透過 `{{ variable }}` 來使用 variable

   6. 範例

      ```
      // File variable
      @baseUrl = https://example.com/api 
      
      // Request variable
      # @name login
      POST {{baseUrl}}/api/login HTTP/1.1
      Content-Type: application/x-www-form-urlencoded
      
      name=foo&password=bar
      
      // 使用 Request variable
      @authToken = {{login.response.headers.X-AuthToken}}
      ```

5. 設定 Response Preview 內容，在 VS Code 設定檔內，可以設定 `previewOption`

   | Option   | Description                         |
   | -------- | ----------------------------------- |
   | full     | Default. Full Response is previewed |
   | headers  | Only response header                |
   | body     | Only response body                  |
   | exchange | Preview the whole HTTP exchange     |

   ![image-20230902232818215](image-20230902232818215.png)



## Reference

- [VSCode Extension: Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

  
