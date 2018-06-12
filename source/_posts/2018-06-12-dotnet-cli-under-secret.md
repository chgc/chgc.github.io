---
layout: post
title: '[.NET Core] dotnet cli 命令到底是怎麼運行的?'
comments: true
date: 2018-06-12 11:36:08
categories: '.NET Core'
tags: '.NET Core'
---

如果長期有在追 dotnet cli 的人，就知道在某一個時間點，微軟將 dotnet cli 的設定檔從 project.json 轉回 project.csproj 的格式，主要是要讓建置的動作轉回使用 MSBuild 引擎

<!-- more -->

根據 [文件](https://docs.microsoft.com/zh-tw/dotnet/core/tools/cli-msbuild-architecture) 有提到，雖然下的指令是 `dotnet publish -o pub -c Release` 但事實上是執行 `dotnet msbuild /t:Publish /p:OutputPath=pub /p:Configuration=Release `，這樣就引起我的好奇，其他的指令是否也是做同樣的事情。

幸好現在 dotnet core 相關的程式都有放到 GitHub 上，我們可以很容易地了解整體的運作方式

# 執行

此篇就用 `dotnet build ` 為例

* dotnet build 指令的程式碼，可以在[這裡](https://github.com/dotnet/cli/tree/master/src/dotnet/commands/dotnet-build)看到

  * [BuildCommandParser.cs](https://github.com/dotnet/cli/blob/master/src/dotnet/commands/dotnet-build/BuildCommandParser.cs) 將 `build` 指另註冊在 dotnet 命令清單的起始點

  * [BuildCommand.cs](https://github.com/dotnet/cli/blob/master/src/dotnet/commands/dotnet-build/BuildCommand.cs) 是將在命令視窗裡所下的指令做參數的解析並轉換成 msbuild 的建置參數

    ```csharp
    ...
    var appliedBuildOptions = result["dotnet"]["build"];
    
    msbuildArgs.Add($"-consoleloggerparameters:Summary");
    
    if (appliedBuildOptions.HasOption("--no-incremental"))
    {
        msbuildArgs.Add("-target:Rebuild");
    }
    else
    {
        msbuildArgs.Add("-target:Build");
    }
    
    msbuildArgs.AddRange(appliedBuildOptions.OptionValuesToBeForwarded());
    
    msbuildArgs.AddRange(appliedBuildOptions.Arguments);
    
    bool noRestore = appliedBuildOptions.HasOption("--no-restore");
    ...
    ```

  * 由於 `build` 命令所使用的 `BuildCommand` 是繼承 `RestoringCommand ` [source code](https://github.com/dotnet/cli/blob/4883d9643bfb604fef52ae7e53d6a5ee11557fe0/src/dotnet/commands/RestoringCommand.cs) 來的，所以預設有 `restore` 的動作，這也是為什麼在文件上說，在建置前不需要執行 `dotnet restore` 的原因了。

  * 最後當執行 `cmd.Execute()` 時，會執行 [MSBuildForwardingApp.cs](https://github.com/dotnet/cli/blob/4883d9643bfb604fef52ae7e53d6a5ee11557fe0/src/dotnet/commands/dotnet-msbuild/MSBuildForwardingApp.cs) 裡的  Execute 方法，在之後的細節就是根據當下的執行環境找到對的執行檔執行命令，有興趣的可以在從這邊繼續追

    

  以上就是簡單描述當 dotnet cli 命令執行時，到底做哪些事情的筆記

  

# 參考資料

* [.NET Core 工具中變更的高階概觀](https://docs.microsoft.com/zh-tw/dotnet/core/tools/cli-msbuild-architecture)
* [dotnet cli repo](https://github.com/dotnet/cli)
* [適用於 .NET Core 之 csproj 格式的新增項目](https://docs.microsoft.com/zh-tw/dotnet/core/tools/csproj)

