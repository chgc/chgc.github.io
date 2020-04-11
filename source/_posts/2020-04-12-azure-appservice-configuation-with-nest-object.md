---
layout: post
title: '[Azure] 該如何設定 JSON 物件到 App Servie Configuration 中'
comments: true
typora-root-url: 2020-04-12-azure-appservice-configuation-with-nest-object/
typora-copy-images-to: 2020-04-12-azure-appservice-configuation-with-nest-object/
date: 2020-04-12 01:07:31
categories: Azure
ags: App Service
---

我們都知道 Production 的設定檔應該要放在 Azure App Service 或是其他相關的地方，不應該將該設定檔簽入到版控中，但是，當愈到這種設定檔時，App Service 該如何設定呢?

```json
 "AzureAdB2C": {
    "Instance": "https://xxx.xxxx/",
    "ClientId": "...",
    "CallbackPath": "...",
    "Domain": "...",
    "SignUpSignInPolicyId": "..."
  }
```



<!-- more -->

在 `.NET Core` 的程式碼內，可以透過 `:` 的方式取得階層型態的設定檔，例如 `AzureAdB2C:Instance`，但是在 Linux 的 App Service 是不能使用冒號，所以要用兩個底線代替冒號

> In a default Linux container or a custom Linux container, any nested JSON key structure in the app setting name like `ApplicationInsights:InstrumentationKey` needs to be configured in App Service as `ApplicationInsights__InstrumentationKey` for the key name. In other words, any `:` should be replaced by `__` (double underscore).

![image-20200412011534339](image-20200412011534339.png)

# 參考資料

* [Configure an App Service app in the Azure portal](https://docs.microsoft.com/zh-tw/azure/app-service/configure-common)