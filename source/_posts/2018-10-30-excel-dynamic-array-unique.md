---
layout: post
title: '[O365] Excel 新功能 - Dynamic Array Functions'
comments: true
date: 2018-10-30 13:52:00
categories: O365
tags: O365
---

使用 O365 的好處是，所使用的 Excel 等相關應用程式， 都是處於最新的功能狀態。如果心臟夠大顆，也可以加入 Insider 計畫取得更新的功能，例如這篇文章要介紹的 Dynamic Array Function。

<!-- more -->

介紹幾個跟 Dynamic Array 相關的新函數 ，這些新函數能在篩選資料上可以簡化以往要用很複雜的公式才能完成的功能

# UNIQUE

顧名思義，根據清單排除重複出現的資料，留下沒有重複的清單

函示的使用方法

`=UNIQUE(array,[by_col],[occurs_once])`

* array 指定套用的清單範圍
* by_col: 設定比較條件，根據 row 時為 FALSE，根據 col 時為 TRUE
* occurs_once: 設定 True 時，只會顯示出現一次的項目，設定 False 時，顯示不重複清單

![](https://i.imgur.com/uTpOG9B.png)

如果在篩選後的清單中，誤輸入不存在的項目時，會出現 `#SPILL!` 的錯誤訊息

![](https://i.imgur.com/5FuoosW.png)

排除的方法是將顯示的文字刪除後即可恢復正常

# SORT

`=SORT(array, [sort_index], [sort_order],[by_col])`

* array: 設定要排序的清單
* [sort_order]: 排序欄位的 index (起於 index 1)
* [sort_order]: 排序方法，1 : 遞增; -1: 遞減
* [by-col]: 設定比較條件，根據 row 時為 FALSE，根據 col 時為 TRUE

如果 Array 是動態產生出來的，可以搭配 `# ` 使用 (Dynamic Array Reference)，這樣子當動態清單長度改變時，函示所使用的清單範圍也會跟著改變

![](https://i.imgur.com/pkXYNfE.png)



# FILTER

FILTER 提供動態過濾資料來源的功能，過濾的清單的欄位會跟資料來源一樣，而且是動態的列出清單。

`=FILTER(資料來源，資料來源內要比較的欄位)`

![](https://i.imgur.com/KCzXifB.png)



# RANDARRAY

`=RANDARRAY([row],[col])` 

回傳設定介於 0 和 1 之間的亂數陣列清單

![](https://i.imgur.com/mNms3ZU.png)



# SEQUENCE

`=SEQUENCE(row,[col],[start],[step])`

根據設定產生數字序列表

* row: 列數
* col: 行數
* start: 起始數字
* step: 間隔數字

![](https://i.imgur.com/uxPbrqn.png)



還有另外兩個 `SINGLE` 與 `SORTBY` 有興趣的也可以參閱官方文件，

要請留意的是，本篇文章所介紹的功能，在這個時間點(2018/10/30) 都還是屬於 insider 的範圍內，尚未正式釋出到正式版中

# 參考文件

* [SORTBY](https://support.office.com/zh-tw/article/sortby-%E5%87%BD%E6%95%B8-cd2d7a62-1b93-435c-b561-d6a35134f28f?NS=EXCEL&Version=90&SysLcid=1028&UiLcid=1028&AppVer=ZXL900&HelpId=xlmain11.chm60678&ui=zh-TW&rs=zh-TW&ad=TW)
* [SINGLE](https://support.office.com/zh-tw/article/%E5%96%AE%E4%B8%80%E5%87%BD%E6%95%B8-7ca229ca-13ae-420b-928e-2ef52a3805ff?NS=EXCEL&Version=90&SysLcid=1028&UiLcid=1028&AppVer=ZXL900&HelpId=xlmain11.chm60657&ui=zh-TW&rs=zh-TW&ad=TW)







