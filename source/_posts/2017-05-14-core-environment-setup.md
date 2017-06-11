---
layout: post
title: '[.NET Core] DotNet Core 基本環境設定'
comments: true
date: 2017-05-14 13:49:51
categories: '.NEt Core'
tags: '.NET Core'
---

.NET Core 在近期發布了 2.0 preview，看起來離 2.0 的正式發表也不遠了。是時候可以出手學習一下 .NET Core 這一新架構，但在正式學習之前，還是得把環境設定好。

<!-- more -->

.NET Core 是一個可跨平台的架構，所以在 windows 或是 mac 甚至  Ubuntu 上都可以做開發，微軟講好久的跨平台的口號，終於實踐啦。

開發 .NET Core 的方式基本上有兩種

1. 使用 IDE 
   1. windows版本，直接上 [visual studio 2017](https://www.visualstudio.com/zh-hant/vs/whatsnew/)
   2. mac 版本，可以使用 [visual studio for mac](https://www.visualstudio.com/zh-hant/vs/visual-studio-mac/?rr=https%3A%2F%2Fwww.google.com.tw%2F)
   3. [Jetbrains Rider](https://www.jetbrains.com/rider/)
2. 使用 CLI + [Visual Studio Core](https://code.visualstudio.com/)
   1. [CLI on GitHub](https://github.com/dotnet/core/blob/master/release-notes/download-archives/2.0.0-preview1-download.md)
   2. [穩定版](https://www.microsoft.com/net/core#windowscmd)

安裝步驟不難，把安裝下載下來，執行安裝，完成後即可。之後的學習筆記將會以 CLI 的方式進行。

# 建立第一個專案

當 CLI 安裝完成後，可以使用 `dotnet --info` 的方式得知目前所安裝的版本資訊

![](https://farm5.staticflickr.com/4171/33802930844_6c63f570c6_o.png)

`dotnet --help` 可以知道有那些指令可以使用

![](https://farm5.staticflickr.com/4185/34645600185_df1bbc19af_o.png)

## 建立新專案

CLI 建立專案的順序是

1. 建立一個新的專案用的資料夾
2. 進入開資料夾
3. 執行 `dotnet new [專案類型]`
4. 完成

在 `步驟 3` 所提到的**專案類型**，可以利用 `dotnet new`的指令查詢

![](https://farm5.staticflickr.com/4162/33835675403_5c4239423f_o.png)

這裡可以看到，CLI 提供了一些初始範本可以使用。因為我們要從頭開始學習，所以預設先由最單純的 Console Application 開始

![](https://farm5.staticflickr.com/4178/34604682536_c80ea37a4d_o.png)

專案的檔案結構

![](https://farm5.staticflickr.com/4179/34260096790_fdc395ba3f_o.png)

`programs.cs` 是專案的進入點

```csharp
using System;

namespace study_001
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
        }
    }
}

```

`xxx.csproj` 是專案檔，用來管理該專案的狀態，例如 package 的使用等

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

</Project>

```

## 執行

透過 CLI 將 .NET Core 的程式執行起來，可以下 `dotnet run` 就可以執行了。

![](https://farm5.staticflickr.com/4175/34483688792_7ff357d932_o.png)

## 建置

指令 `dotnet build` 會將程式建置為一個 dll 檔案，並放在 bin 的資料夾下

![](https://farm5.staticflickr.com/4180/33836146513_1b2aebd573_o.png) 

執行該 dll 的方式，執行 `dotnet xxx.dll`

![](https://farm5.staticflickr.com/4177/33803404014_d244fc65f7_o.png)



# Recap

* `dotnet --help` 查詢可使用的指令
* `dotnet --info` 查詢目前 CLI 版本
* `dotnet new <template>` 建立範本專案
* `dotnet restore` 恢復安裝 packages
* `dotnet run` 執行專案程式
* `dotnet build` 建置專案
* `dotnet <xxx>.dll` 執行建置後的 dll 檔案