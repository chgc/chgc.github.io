---
layout: post
title: '[.NET Core] Dependency Injection'
comments: true
date: 2017-06-13 10:25:07
categories: '.NET Core'
tags: '.NET Core'
---

.NET Core web 專案, a.k.a ASP.NET Core, 內建了 Dependency Injection 機制，不需要再另外安裝套件才可使用 DI 了。事實上，.NET Core的專案要擴充功能，也都是利用 DI 來新增至系統內。例如 `.AddMvc()`

<!-- more -->

# 內建服務

初始時，就已經有以下的服務

![](https://farm5.staticflickr.com/4242/34890280460_72c9e84e8d_o.png)

ASP.NET 也內建許多服務，像是 `MVC`, `EntityFramework`，而這一類的新增方式是透過 `AddServiceName` 的模式新增至 `IServiceCollection` 中。

```csharp
// This method gets called by the runtime. Use this method to add services to the container.
public void ConfigureServices(IServiceCollection services)
{
    // Add framework services.
    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

    services.AddIdentity<ApplicationUser, IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

    services.AddMvc();

}
```



# 註冊服務

當自己所開發的功能想要註冊系統內，也需要走一樣的路徑。是需要被加到 `ServiceCollection` 內。但根據生命週期的差異，所使用的註冊方式也會有所不一樣

## AddTransient

`Transient` : 服務在每次被執行時，都會建立一個新的執行實體。這模式很適合 `lightweight`、`stateless`的服務。

```csharp
services.AddTransient<IOperationTransient, Operation>();
```



## AddScoped

`Scoped` : 服務會在被要求時建立一次，而在這次要求期間，服務不論執行幾次，都不會再次被重新建立。

```csharp
services.AddScoped<IOperationScoped, Operation>();
```



## AddSingleton

`Singleton` 會在第一次呼叫時被建立或是在 `ConfigureServies` 內被執行，之後程序如果有執行到這一個服務時，基本上都是使用相同的實體

```csharp
services.AddSingleton<IOperationSingleton, Operation>();
services.AddSingleton<IOperationSingletonInstance>(new Operation(Guid.Empty)); // 立即執行
```



# 參考資料

* [Dependency Injection](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection)

