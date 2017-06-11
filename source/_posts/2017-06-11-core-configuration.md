---
layout: post
title: '[.NET Core] 加入設定參數'
comments: true
date: 2017-06-11 20:20:05
categories: '.NET Core'
tags: '.NET Core'
---

.NET Core 提供多種參數設定資料的來源，例如: Json 檔案、ini 檔案或使用 Azure 的 KeyValue 設定檔。雖然預設啟動的 web 環境，已經有載入  `appsetting.json` 及 `appsettings.[environment].json` 設定檔，但是如果要自行設定，或是其他 Controller 要使用參數設定，又該怎麼處理呢?

<!-- more -->

# Startup.cs

設定檔可以透過 `ConfigurationBuilder`建立，以下為簡單的基本架構

```csharp
public class Startup
{
  public IConfigurationRoot Configuration { get; set; }
  public Startup(IHostingEnvironment env)
  {            
    var builder = new ConfigurationBuilder()
      .SetBasePath(env.ContentRootPath)                        
      .AddJsonFile("appsettings.json", optional: true);

    Configuration = builder.Build();    
  }
}
```

如 [這篇筆記](http://blog.kevinyang.net/2017/05/15/core-web-mvc-001/)，在 `constructor` 可以取得 `IHostingEnvironment` 的服務，這個 `env` 提供了目前程式系統的基本環境，例如根目錄的資訊

ConfigurationBuilder 提供多種設定檔來源的選擇

## Add

新增符合 `IConfigurationSource` 格式的自訂設定檔



## AddAzureKeyValue

使用 [Azure KeyValue](https://azure.microsoft.com/zh-tw/services/key-vault/) 服務，作為參數設定檔的資料來源，基本程式架構如下

```csharp
  builder.AddAzureKeyVault(
            $"https://{Vault}.vault.azure.net/",
            "ClientId",
            "ClientSecret");
```
`AddAzurekeyValue` 也提供  `IKeyVaultSecretManager` ，實作方式範本如下

```csharp
public class EnvironmentSecretManager : IKeyVaultSecretManager
{
    private readonly string _appNamePrefix;

    public EnvironmentSecretManager(string appName)
    {
        _appNamePrefix = appName + "-";
    }

    public bool Load(SecretItem secret)
    {
        return secret.Identifier.Name.StartsWith(_appNamePrefix);
    }

    public string GetKey(SecretBundle secret)
    {
        return secret.SecretIdentifier.Name.Substring(_appNamePrefix.Length);
    }
}
```

```csharp
builder.AddAzureKeyVault(
    $"https://{config["Vault"]}.vault.azure.net/",
    config["ClientId"],
    config["ClientSecret"],
    new EnvironmentSecretManager(env.ApplicationName));
```



## AddCommandLine

利用 command line 的方式，將參數設定值，傳入至系統內

```csharp
public static IConfigurationBuilder AddCommandLine(
  this IConfigurationBuilder configurationBuilder, 
  string[] args, IDictionary<string, string> switchMappings);
```

```csharp
public static Dictionary<string, string> GetSwitchMappings(
    IReadOnlyDictionary<string, string> configurationStrings)
    {
        return configurationStrings.Select(item =>
            new KeyValuePair<string, string>(
                "-" + item.Key.Substring(item.Key.LastIndexOf(':') + 1),
                item.Key))
                .ToDictionary(
                    item => item.Key, item => item.Value);
    }
    public static void Main(string[] args = null)
    {
        var dict = new Dictionary<string, string>
            {
                {"Profile:MachineName", "Rick"},
                {"App:MainWindow:Left", "11"}
            };

        var builder = new ConfigurationBuilder();
        builder.AddInMemoryCollection(dict)
              .AddCommandLine(args, GetSwitchMappings(dict));
        Configuration = builder.Build();
        ...
    }
```

```
dotnet run /Profile:MachineName=Bob /App:MainWindow:Left=1234
```

`AddCommandLine` 也可以搭配 `AddInMemoryCollection` 一起使用，如上述的程式碼



## AddDockerSecrets

使用 Docker Secrets 作為參數設定檔的資料來源

```csharp
var builder = new ConfigurationBuilder()
            .AddDockerSecrets()
```



## AddEnvironmentVariables

使用系統環境變數作為參數設定檔的資料來源

```csharp
  var builder = new ConfigurationBuilder()
                    .AddEnvironmentVariables();
```



## AddIniFile

使用 ini 檔案作為參數設定檔的資料來源

```csharp
  var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)            
            .AddJsonFile("appsettings.ini", optional: true);
```



## AddInMemoryCollection

使用自訂的 Dictionary 作為參數設定檔的資料來源

```csharp
var dict = new Dictionary<string, string>
            {
                {"Profile:MachineName", "Rick"},
                {"App:MainWindow:Left", "11"}
            };

var builder = new ConfigurationBuilder()
                 .AddInMemoryCollection(dict)
```



## AddJsonFile

使用 Json 檔案作為參數設定檔的資料來源

```csharp
  var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)            
            .AddJsonFile("appsettings.json", optional: true);
```



## AddUserSecrets

使用UserSecrets作為參數設定檔的資料來源，這一個檔案並不會存在於專案資訊裡，實際的檔案會存放在於開發者的電腦內，故這個功能在預設模式下，只有處於開發模式下才會被開啟。

```csharp
 var builder = new ConfigurationBuilder()            
            .AddUserSecrets<Startup>();
```

至於他的實際的存放位置是在哪裡，在 `專案.csproj` 裡會存放一組 `UserSecretsId` ，這組 ID 會是資料夾的名稱

* windows

  >  C:\Users\<userName>\AppData\Roaming\Microsoft\UserSecrets\<UserSecretsId>

* 非windows

  >  ~/.microsoft/usersecrets/<userSecretsId>/secrets.json

  ​

## AddXmlFile

使用 xml 檔案作為參數設定檔的資料來源

```csharp
  var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)            
            .AddJsonFile("appsettings.xml", optional: true);
```



# 註冊至Service內

將 `Configuration` 加入到 service 內

```csharp
public void ConfigureServices(IServiceCollection services)
{
  services.Configure<MyOptions>(Configuration);
}
```

* `MyOptions` 是 Configuration 的格式定義

使用方式如下，在 Controller 的地方，利用 IOptions 的方式取得在 `Startup.cs` 內加入至 services 內的設定檔

```csharp
private MyOptions _myOptions = null;

public HomeController(IOptions<MyOptions> options)
{        
  this._myOptions = options.Value;
}
public IActionResult Index()
{
  string option1 = this._myOptions.Option1;
  int Option2 = this._myOptions.Option2;
  return View();
}

```

# Recap

dotnet Core 提供很多種方式可以取得或是設定設定檔，其他地方如果要使用，是透過注入的方式取得，這樣子的模式，在管理設定檔上，就變得非常有彈性了。




# 參考資料

* [Azure Key Vault configuration provider](https://docs.microsoft.com/en-us/aspnet/core/security/key-vault-configuration)
* [Configuration](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration)
* [Accessing Docker Swarm Secrets from ASP.NET Core](http://www.jamessturtevant.com/posts/Acessing-Docker-Swarm-Secrets-From-ASPNET-Core/)
* [Creating a custom ConfigurationProvider in ASP.NET Core to parse YAML](https://andrewlock.net/creating-a-custom-iconfigurationprovider-in-asp-net-core-to-parse-yaml/)