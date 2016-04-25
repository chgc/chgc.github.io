---
layout: post
title: '[ASP.NET MVC] ADD TYPESCRIPT Complier'
date: 2013-11-27 02:06
comments: true
categories: "ASP.NET MVC"
tag: "MVC 4"
---
# In projectname.csproj 新增
```
 <PropertyGroup Condition="'$(Configuration)' == 'Debug'">
    <TypeScriptTarget>ES3</TypeScriptTarget>
    <TypeScriptIncludeComments>true</TypeScriptIncludeComments>
    <TypeScriptSourceMap>true</TypeScriptSourceMap>
    <TypeScriptModuleKind>AMD</TypeScriptModuleKind>
  </PropertyGroup>
  <PropertyGroup Condition="'$(Configuration)' == 'Release'">
    <TypeScriptTarget>ES3</TypeScriptTarget>
    <TypeScriptIncludeComments>false</TypeScriptIncludeComments>
    <TypeScriptSourceMap>false</TypeScriptSourceMap>
    <TypeScriptModuleKind>AMD</TypeScriptModuleKind>
  </PropertyGroup>
  <Import Project="$(VSToolsPath)\TypeScript\Microsoft.TypeScript.targets" />
```  
  在重新載入專案