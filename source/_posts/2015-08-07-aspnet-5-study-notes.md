---
layout: post
title: '[ASP.NET 5] 學習筆記'
date: 2015-08-07 14:33
comments: true
categories: "ASP.NET MVC"
tag: "MVC CORE" 
---
##需求
- Visual Studio 2015

##Note
#### 所有的參考都需要手動加入, 所以新功課會是了解每一個參考裡面有的功能是什麼        
    1. Microsoft.AspNet.Diagnostics => MiddleWare to handle request(ex: welcomepage, errorpage)
    2. Microsoft.AspNet.StaticFiles => 顯示靜態網頁

Microsoft.AspNet.Diagnostics Example
``` 
// app.useXXXXX
      app.UseWelcomePage();
      app.UseErrorPage();
```

#### project.json
網站所有的設定都會在這個檔案裏面做設定, 包含dependencies, webroot, exclude, frameworks, etc.

##### Commands
![](https://farm1.staticflickr.com/260/20362531726_fc27690c27_o.png)

#### 新增MVC功能

* project.json
   add "Microsoft.AspNet.Mvc" to dependencies
* startup.cs

```cs
 public void ConfigureServices(IServiceCollection services)
 {
		services.AddMvc();
		services.Configure<MvcOptions>(options => { });
 }
 
 public void Configure(IApplicationBuilder app)
 {   
		app.UseMvc();
 }
```

如果要設定mvc route時, 在startup.cs的configure裡(in c# 6 syntax)

```cs
 app.UseMvc(routes=>
            {
                routes.MapRoute(
                    name: "Default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
```

#### 建立Configuration
* dependence:
    "Microsoft.Framework.Configuration.UserSecrets"
* Useage:

```cs
 public Startup(IHostingEnvironment env, IApplicationEnvironment appEnv)
 {
    // 設定ConfiurationBuilder
  var configurationBuilder = new ConfigurationBuilder(appEnv.ApplicationBasePath);
   configurationBuilder.AddJsonFile("config.json");
   configurationBuilder.AddEnvironmentVariables();
   // 必須執行Build才能建立Configuration物件
   var config = configurationBuilder.Build(); 
   // Build後
   var value = config.get("key");	      
 }
```

#### 使用TagHelpers
如果想要使用MVC內建的TagHelper, 幾個需要加入的dependencies
```
"Microsoft.AspNet.Mvc.TagHelpers": "6.0.0-rc1-final",
"Microsoft.AspNet.Tooling.Razor": "1.0.0-rc1-final" <= 在vs編輯時會將tag的部分顯示成不同的顏色及其他功能
```


然後在_ViewImports.cshtml加入
```
@addTagHelper "*, Microsoft.AspNet.Mvc.TagHelpers"
```
