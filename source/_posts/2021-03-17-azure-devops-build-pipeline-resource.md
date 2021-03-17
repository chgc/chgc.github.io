---
layout: post
title: '[Azure DevOps] Pipeline 建置時跨 Repo 情境下該如何處理呢?'
comments: true
typora-root-url: 2021-03-17-azure-devops-build-pipeline-resource
typora-copy-images-to: 2021-03-17-azure-devops-build-pipeline-resource
date: 2021-03-17 22:51:35
categories: Azure DevOps
tags: Azure DevOps
---

在工作上遇到一個情況就是一個系統的前後端是分在兩個 Repository 的，但前端的檔案需要被包進後端的程式中做後續的發佈，就在思考該如何處理這個問題，終於想出一個還不錯簡單的方式

<!-- more -->

在 Pipeline 建置時，可以將打包出來的結果 Publish 成 Pipeline Artifact，yaml 的寫法如下

```yaml
- task: PublishBuildArtifacts@1
  inputs:
    artifactName: 'ngApp'
    PathtoPublish: '$(System.DefaultWorkingDirectory)/dist/front-website'
```

* `artifactName` : 打包出來的檔案名稱
* `PathtoPublish`：要打包的檔案資料夾位置

到後端的 Repository 的 Pipeline 的 Task 中，可以利用 `Download Pipeline Artifact` 的 Task 來下載某一個專案下的某一個 Pipeline 發佈的 Artifact，這一個任務可以將編譯建置後的結果跨專案的使用，真的很方便

![image-20210317230842327](image-20210317230842327.png)

```yaml
steps:
- task: DownloadPipelineArtifact@2
  displayName: 'Download Pipeline Artifact'
  inputs:
    buildType: specific
    project: '<project-id>'
    definition: 13
    specificBuildWithTriggering: true
    allowPartiallySucceededBuilds: true
    artifactName: ngAPP
    targetPath: '$(System.DefaultWorkingDirectory)/backend/wwwroot'
```

* `targetPath` 下載目標路徑

由於可能會有先後順序的問題，這時候也可以搭配 Triggers 中的 `Build completion ` 來做到 Pipeline 間的連動

![image-20210317231019398](image-20210317231019398.png)

途中的設定執行的順序是，當 `FrontCode` Pipeline 完成後會觸發執行 `PipelineTest` 的 Pipeline 。



