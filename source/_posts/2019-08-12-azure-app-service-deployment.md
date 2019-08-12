---
layout: post
title: '[Azure] Deployement Center in App Service'
comments: true
typora-root-url: 2019-08-12-azure-app-service-deployment
typora-copy-images-to: 2019-08-12-azure-app-service-deployment
date: 2019-08-12 10:30:36
categories: Azure
tags:
- Azure
- App Service
---

部屬網站到 Azure App Service 的方式有很多種，而為了讓部屬的動作能連貫且步驟是最少的，就必須整合到 DevOps 之類的服務。App service 針對部屬也有提供幾個不錯的功能，這一篇文章會先從 `Deployement Center` (部署中心) 開始

<!-- more -->

Azure App Service 的部屬中心，支援多種版控服務，像是 Azure Repos、GitHub、Bitbucket、Local Git 還有一些檔案服務等，這篇文章，我們使用 GitHub 來作為持續部署的程式來源

# 基本設定操作

1. 建立 GitHub Repo

2. 建立一個簡單的 Razor Page 網站，並將其推送到  GitHub Repo 上

3. 建立 Azure App Service

4. 點選 部屬中心 (Deployement Center)

   ![1565588656492](1565588656492.png)

5. 選擇原始檔控制，我這裡選擇 GitHub，由於第一次尚未授權，所以要先進行授權

   ![img](SNAGHTML1572a0a5.PNG)

   ![1565589007381](1565589007381.png)

   完成授權，點選【繼續】

   ![1565589189698](1565589189698.png)

6. 選擇【組件提供者】，這邊選擇 **App Service 組件服務** 後，繼續下一步

   ![1565589252725](1565589252725.png)

7. 進入設定頁面，如果選擇不到 Repo 的話，那表示在 GitHub 這邊還需要在設定一些東西

   ![1565589356437](1565589356437.png)

   1. 前往 GitHub ，進入 【Setting】頁面

      ![1565589970877](1565589970877.png)

   2. 進入 【Application】 並選擇 【Authorized OAuth Apps】，找到 Azure App Service

      ![1565590071114](1565590071114.png)

   3. 將尚未授權的 Orgranization ，開放權限 (Grant)

   4. 如果還沒有看到，重新整理畫面，並重新做一次 Deployment Center 的設定畫面，應可以看到相關資訊了

8. 選擇要部屬的 Repo 來源

   ![1565590741348](1565590741348.png)

9. 繼續進入最終步驟，確認完成。

   ![1565590787555](1565590787555.png)

10. 完成設定

    ![1565590831627](1565590831627.png)

11. 第一次部屬成功

    ![1565590951080](1565590951080.png)

12. 執行結果。太棒了，看到畫面

    ![1565591008327](1565591008327.png)

## 第二次  Commit

嘗試修改一些文字並 commit 到 GitHub 上後，觀察看看部屬中心是否有做到自動建置部屬的動作

當 commit push 到 GitHub 上，在部屬中心的頁面上，會發現第二次 Commit 的訊息

![1565591206262](1565591206262.png)

![1565591388557](1565591388557.png)

修改後的畫面

![1565591414880](1565591414880.png)

可以看到順利修改後的結果，這代表整個流程已可以正常運作了

# 退版

有時候在 commit 時，發現上的版本有重大問題需要退版時，透過部屬中心可以快速做到退版的功能，以下是操作步驟

1. 選擇想要退版的 commit 紀錄

   ![1565591661549](1565591661549.png)

2. 點選【重新佈署】

   ![1565591693288](1565591693288.png)

3. 退版成功

   ![1565591759740](1565591759740.png)

就是這麼簡單

# 結論

雖然 GitHub 是很常見好用的程式碼寄放的位置，但如果要跟 Azure App Service 整個的部屬整合更流暢，我相信使用 Azure DevOps 的服務會是最佳選擇

