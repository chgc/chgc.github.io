---
layout: post
title: '[HowTo] asp.net core 設定 Configuration 的方法'
comments: true
typora-root-url: 2022-06-05-howto-dotnet-configuration/
typora-copy-images-to: 2022-06-05-howto-dotnet-configuration/
date: 2022-06-05 22:43:08
categories: '.NET Core'
tags: '.NET Core'
---

Quick note for setting configuration  in .net core. 

<!-- more -->

透過建立 Class 來作為 Configuration 的容器

```csharp
public class MongoConnectionOptions
{
    public const string name = "MongoConnection";

    public string ConnectionString { get; set; } = String.Empty;
    public string Database { get; set; } = String.Empty;
}
```

1. line 3: 單純是方便設定使用 (Option)
2. line 5 ~ 6 需與 `appsettings.json` 想設定的 section 內的欄位一致

`appsettings.json` 依此範例內會有一個 `MongoConnection` 的 section 並且有 `ConnectionString` 和 `Database` 的設定

```json
{
    "MongoConnection": {
        "ConnectionString":"",
        "Database":""
    }
}
```

預設 asp.net core 新建的範本，會使用 top function 的模式建立，所以 `program.cs` 檔案會變成這樣

```csharp
using apiWithMongo.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<MongoConnectionOptions>(builder.Configuration.GetSection(MongoConnectionOptions.name));

builder.Services.AddControllers();
...
    

```

* 透過 line 6 的寫法，我們可以將 `appsettings.json` 內的某一個 section 值與 class 關連設定起來

設定完成後，在任何地方如果要使用這組設定值時，可以透過 `IOptions<T>` 的方式取得

```csharp
public class Demo 
{
    private readonly MongoConnectionOptions _options;
    public Demo(IOptions<MongoConnectionOptions> options){
        _options = options.Value;
    }
}
```



## Reference

- [Options pattern in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options?view=aspnetcore-6.0&WT.mc_id=DOP-MVP-5002594)
- [在 ASP.NET Core Configuration 中使用 array](https://blog.yowko.com/aspdotnet-core-config-array/)
