---
layout: post
title: '[讀書筆記][閱讀中] 網站可靠性工程工作手冊｜導入SRE的實用方法'
comments: true
typora-root-url: 2023-06-24-books-The-Site-Reliability-Workbook/
typora-copy-images-to: 2023-06-24-books-The-Site-Reliability-Workbook/
date: 2023-06-24 16:08:07
categories: Reading
tags: Reading
---

 SRE 真的需要大量的閱讀跟實做，累積經驗才可以得到 SRE 的精髓，只好認真 K 書了

這篇為 `網站可靠性工程工作手冊｜導入SRE的實用方法` 這本書的讀書筆記，線上閱讀版跟翻譯書的連結如下

- 原文書: [The Site Reliability Workbook](https://sre.google/workbook/table-of-contents/)
- 翻譯書: [網站可靠性工程工作手冊｜導入SRE的實用方法 (The Site Reliability Workbook)](https://www.tenlong.com.tw/products/9789865026011)

讀書筆記跟實務上遇到的經驗都會整理一起

<!-- more -->

## 實施 SLO
- 沒有 SLO 就沒有 SRE
- SLI 是一種指標，鑑別服務水準
- 度量的比例當作 CLI, 例如: 良好事件的數量除以事件總數
- SLI 因為是比例－所以數值範圍會是 0 ~ 100%
- SLO 是目標百分比, 犯錯預算是 100% - SLO
- 制訂 SLI 時，可以用規格和實做兩個層面制訂
	- 規格: 覺得對使用者重要的服務產出之評估，是各自獨立不受量測方式影響。例如: 訪問首頁 100 ms 內能載入的比例
	- 實做: SLI 規格測量方法
- SLO 需選擇適當的時窗
- SLO 是服務 external user，是與利害關係人間的協議，SLO 需要被文件化且公開
- 建立 error budget 政策 & dashboard
- 建立 SLO 遵從度報告 (Dashboard)
- SLO 目標持續改進, 可用 SLO 決策 metrics 來判斷接下來要調整的方向

參考文件:

- [Example SLO Document](https://sre.google/workbook/slo-document/)
- [Example Error Budget Policy](https://sre.google/workbook/error-budget-policy/)
