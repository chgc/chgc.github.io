---
layout: post
title: '[HowTo] 讀取 WebAPI 資料到 Excel 表內`
comments: true
typora-root-url: 2022-07-16-excel-load-webapi/
typora-copy-images-to: 2022-07-16-excel-load-webapi/
date: 2022-07-16 12:14:24
categories: Office
tags: Office
---

週五突然想到 Excel 是否能載入 JSON 檔案或是 WebAPI 的資料，因為 PowerBI 可以做到，想說 Excel 應該也可以，所以就來試試看

<!-- more -->

一樣的，我們拿 `[JSONPlaceholder](https://jsonplaceholder.typicode.com/)` 所提供的 API 來當作範例資料，使用 https://jsonplaceholder.typicode.com/posts 這組資料

## 步驟

1. 建立一個空的 Excel 檔案

2. 選擇 `資料` Tab 內的`從 web`

   ![image-20220716125829631](image-20220716125829631.png)

3. 將文章一開始的網址貼入到 URL 內後按下『確定』

   ![image-20220716125919160](image-20220716125919160.png)

4. 會開啟存取 Web 內容的視窗，這邊如果 API 有相關權限設定，可在這邊進行設定

   ![image-20220716130028794](image-20220716130028794.png)

5. 確認後下『連接』，Excel 會去呼叫 API 並取回資料

6. 取得資料後會開啟 Power Query 編輯器

   ![image-20220716130216544](image-20220716130216544.png)

   這時候我們就需要針對取回得資料作一些轉換的設定

   1. 點 『到表格』

      ![image-20220716130621219](image-20220716130621219.png)

   2. 無分隔符號，直接按下『確定』

      ![image-20220716130659427](image-20220716130659427.png)

   3. 這時候畫面會轉換成以下圖片

      ![image-20220716130731882](image-20220716130731882.png)

   4. 點選 Column1 旁邊的小圖示，這個動作會開啟另外一個視窗來設定要展開哪些欄位

      ![image-20220716130806821](image-20220716130806821.png)

      ![image-20220716130847323](image-20220716130847323.png)

   5. 如果確認後沒問題就可以按下『確定』。備註: 如果不想要使用原始資料行列名稱當前置詞，可以把設定取消掉

   6. 瀏覽資料，確認無誤後按下『關閉並載入』即可在 Excel 上看到資料了

      ![img](/SNAGHTML34f9708.PNG)

   7. 最終成果

      ![image-20220716131228238](image-20220716131228238.png)

      如果想要手動更新 API 得資料，單純點選這個圖示即可，或是上方的『重新整理』

      ![image-20220716131326794](image-20220716131326794.png)



## 修改 Query

如果想要回頭編輯 Query 的方式，可以從這個地方將 Power Query 編輯器開啟

![image-20220716131657411](image-20220716131657411.png)





