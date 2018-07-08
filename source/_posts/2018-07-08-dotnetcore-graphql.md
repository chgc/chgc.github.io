---
layout: post
title: '[.NET Core]GraphQL 超新手篇'
comments: true
date: 2018-07-08 22:15:44
categories: .NET Core
tags: .NET Core
---

又再一次向 GraphQL 挑戰，什麼是 GraphQL，可以快速閱讀一下這篇文章 [2018 GraphQL 漸進式導入的架構](https://medium.com/@evenchange4/2018-graphql-%E6%BC%B8%E9%80%B2%E5%BC%8F%E5%B0%8E%E5%85%A5%E7%9A%84%E6%9E%B6%E6%A7%8B-aeb2603f2223)，ASP.NET Core 又該如何設定呢? 這裡先簡單的記錄一下，關於更細節的設定，就待以後再來研究了

<!-- more -->

# 測試環境

* ASP.NET Core 2.x 版
* 套件 `GraphQL`
* 前端使用 Angular 來呼叫 `GraphQL`

# 後端

## 套件安裝

* 安裝 `GraphQL for .NET`

  ```
  dotnet add package GraphQL
  ```

## 基本設定

1. 建立 `Schema`：GraphQL 解析的進入點，定義 `Query` 與 `Mutation`

```csharp
public class CaptionSchema: Schema
{
    public CaptionSchema(Func<Type, GraphType> resolveType) : base(resolveType)
    {
      Query = (CaptionQuery)resolveType(typeof(CaptionQuery));
    }
}
```

2. 建立 `ObjectGraphType`，設定可以查詢的欄位及資料撈取的方式

```csharp
   public class CaptionQuery : ObjectGraphType
       {
           public CaptionQuery(ICaptionRepository captionRepository)
           {
               // 資料回傳型別
               Field<ListGraphType<CaptionType>>(
                 "captions", // 查詢命令的名稱
        		 arguments: new QueryArguments(
                       new QueryArgument<NonNullGraphType<IntGraphType>> {Name = "id", Description = "Category id"}
                  ),// 查詢參數
                 resolve: context =>{ ... } // 準備回傳資料
           }
       }
```

3. 定義 `CaptionType` ，回傳的資料型別

```csharp
   public class CaptionType: ObjectGraphType<Caption>
   {
       public CaptionType(StreamDbContext dbContext)
       {
         Field(x => x.Id).Description("Caption Id");
         Field(x => x.Uid).Description("User Unique ID");
         
         // 可以使用 Query 裡面的定義方式建立其他關連欄位
         Field<ListGraphType<ProductType>>(
                   "products", 
                   resolve: context => productRepository.GetProductsWithByCategoryIdAsync(context.Source.Id).Result.ToList()
               );
       }
   }
```

4. 註冊到 `Startup.cs`

```csharp
   public void ConfigureServices(IServiceCollection services)
   {
         ...
         services.AddMvc();
   
         // Register GraphQL QueryModel/Schema
         services.AddScoped<CaptionQuery>();
         services.AddTransient<CaptionType>();  
         services.AddTransient<ICaptionRepository, CaptionRepository>();         
         services.AddScoped<IDocumentExecuter, DocumentExecuter>();
         var sp = services.BuildServiceProvider();
         services.AddScoped<ISchema>(_ => new CaptionSchema(type => (GraphType)sp.GetService(type)) { Query = sp.GetService<CaptionQuery>() });
   
   }
```

5. 為 GraphQL 建立 API EndPoint 

```csharp
[Route("graphql")]
public class GraphQLController : ControllerBase
{
    private readonly IDocumentExecuter _documentExecuter;
    private readonly ISchema _schema;

    public GraphQLController(IDocumentExecuter documentExecuter, ISchema schema)
    {
        _documentExecuter = documentExecuter;
        _schema = schema;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody]GraphQLQuery query)
    {
        if (query == null) { throw new ArgumentNullException(nameof(query)); }

        var executionOptions = new ExecutionOptions { Schema = _schema, Query = query.Query, UserContext = HttpContext.User };

        try
        {
        	var result = await _documentExecuter.ExecuteAsync(executionOptions).ConfigureAwait(false);

            if (result.Errors?.Count > 0)
            {
                return BadRequest(result);
            }
      	  	return Ok(result);
        }
        catch (Exception ex)
        {
        	return BadRequest(ex);
        }
    }
}
```

6. 建立 `GraphQLQuery.cs`

```csharp
using Newtonsoft.Json.Linq;
...
public class GraphQLQuery
{
    public string OperationName { get; set; }
    public string NamedQuery { get; set; }
    public string Query { get; set; }
    public JObject Variables { get; set; } 
}
```

​	*　有些文章的 `Variables` 會用 string 型別，但這個在使用 Angular 呼叫時，會出現問題，必須改成 `JObject` 才不會有問題

到這邊為止，可以算大致上完成 GraphQL 在 asp.net core 後端的設定，以上的範例在 `resolve` 裡的程式碼實作，可以直接使用 EF 來讀取，或是透過 Repository 的方式來存取都可以



# 前端

## 套件安裝

```
npm install apollo-angular apollo-angular-link-http apollo-link apollo-client apollo-cache-inmemory graphql-tag graphql --save
```

或是

```
yarn add apollo-angular apollo-angular-link-http apollo-link apollo-client apollo-cache-inmemory graphql-tag graphql
```

## Angular 設定

在 `app.modules.ts` 新增以下設定

1. import ` ApolloModule` 和 `HttpLinkModule`

2. 在 `constructor` 的地方設定 `apollo`

   ```typescript
   import { ApolloModule, Apollo } from 'apollo-angular';
   import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
   import { InMemoryCache } from 'apollo-cache-inmemory';
   ...
   export class AppModule {
     constructor(apollo: Apollo, httpLink: HttpLink) {
       apollo.create({
         link: httpLink.create({ uri: '[URL]' }),
         cache: new InMemoryCache()
       });
     }
   }
   ```

## Angular 發出第一次 query

先在 component 寫第一次的 GraphQL query

1. `constructor` 注入 `apollo` 服務

2. 建立查詢語法

   ```typescript
    this.apollo
         .query<any[]>({
           query: gql`
             query {
               captions {
                 id
                 label
                 colorClass
               }
             }
           `
         })
         .subscribe(value => console.log(value));
   ```

   由於 `apollo` 建立出來的 query 指令是 Observable 型別, 後續的做法就跟 HttpClient 的 get 等相同了

3. 當執行這一段理論上就可以從後端撈取所設定的資料集了



# 結論

剛開始在碰 GraphQL 時，最麻煩的是摸索設定的階段，一旦設定完成後，後續模組的設定，難度上就還好了。只是還是得規劃一下，希望用怎樣的資料結構讓前端做查詢，畢竟後端沒有設定的欄位，前端是沒有辦法做查詢的，如果前端查詢到後端沒有設定到的欄位時，就會出現錯誤訊息

當然就目前這階段，我並沒有辦法說 GraphQL 的好壞或是適用情境，但至少先完成環境的設置。之後要進一步的研究就比較容易了



# 參考資料

* [GraphQL sample project in ASP.NET Core 2.0 ](https://github.com/GokGokalp/ASP.NET-Core-2.0-GraphQL-Sample)
* [Introduction to GraphQL and Designing Simple Query API with ASP.NET Core 2.0](http://www.gokhan-gokalp.com/en/introduction-to-graphql-and-designing-simple-query-api-with-aspnet-core-2-0/)
* [graphql-dotnet](https://github.com/graphql-dotnet/graphql-dotnet)
* [apollo-angular](https://github.com/apollographql/apollo-angular)
* [2018 GraphQL 漸進式導入的架構](https://medium.com/@evenchange4/2018-graphql-%E6%BC%B8%E9%80%B2%E5%BC%8F%E5%B0%8E%E5%85%A5%E7%9A%84%E6%9E%B6%E6%A7%8B-aeb2603f2223)
* [Why GraphQL: Advantages, Disadvantages & Alternatives](https://www.robinwieruch.de/why-graphql-advantages-disadvantages-alternatives/)