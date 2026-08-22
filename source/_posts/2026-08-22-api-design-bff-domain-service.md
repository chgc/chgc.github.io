---
layout: post
title: '[API Design] 這支 API 到底在服務誰？BFF 與 Domain Service 的分層思考'
comments: true
date: '2026-08-22 00:00:00'
categories: 'API Design'
tags: ['REST', 'gRPC', 'BFF', 'API 設計']
---

最近設計 API 時，同事之間又為了「REST 還是 action 導向」吵了一場。REST 純粹主義者搬出 Fielding 2000 年的博士論文，說 `POST /orders` 才是正義；商業派搬出 Netflix 的 use-case 主張，說資源導向在大規模下會逼客戶端用一堆請求才能完成一件「事」，`POST /checkout` 才是正義。

兩邊都對，也都不對。真正的問題從來不是「選哪一種風格」，而是——

**這支 API 到底在服務誰？**

把 API 分成「BFF 層」與「Domain Service 層」兩個維度來看，答案會清楚很多，這篇就是把整理的過程筆記下來。

<!-- more -->

## 先回到論戰的起源

### 資源導向（REST）是怎麼來的

Roy Fielding 在 2000 年的博士論文定義 REST，核心約束是 **uniform interface**：用資源（名詞）辨識事物、用標準 HTTP 方法表達操作、狀態由 hypermedia 驅動。Richardson Maturity Model（2008）把「REST 程度」分成 0 到 3 級，從把 HTTP 當傳輸管線，到用對資源、用對 verb、最後加上 hypermedia controls。

資源導向的優勢很清楚：**穩定、可快取、可預測**。GitHub 和 Stripe 這種大型公開 API 都以資源為核心——但請注意，即使它們也保留了動作型端點：Stripe 的 `charge capture`、`refund`，GitHub 的 git refs 操作。連資源導向的先驅都無法完全迴避「動作」，看到這個其實鬆了一口氣，不是只有我們遇到這個問題。

### 商業意圖導向是怎麼來的

另一方陣營主張 API 應該表達「使用者想完成的事」，而不是「資料長什麼樣」。Netflix 的 Daniel Jacobson 從 2014 年起公開倡導 use-case 導向的 edge API，理由很實際：一個「結帳」流程在資源導向下要按順序打好幾支 API，任何一個環節失敗都要客戶端自己兜；而動作導向一支 `POST /checkout` 就搞定。

gRPC（2015）把這個思路推到極致：service 裡定義的就是 method，`PlaceOrder()`、`CapturePayment()`，完全不管名詞。它在內部微服務通訊中成了主流——這不是巧合，自己在寫 gRPC 的時候其實也是這樣，service 上定義的就是「動作」。

## BFF 層：貼近 UI，商業意圖是出發點

BFF（Backend for Frontend）是 Sam Newman 2015 年提出的模式：每一種 client（Web、iOS、Android）各自擁有一層專屬 API，負責**資料塑形（shaping）與聚合**。它存在的唯一理由，是讓前端用最少的來回、最貼合 UI 的形狀拿到資料。

既然如此，BFF 的 API 設計就應該從「使用者的 user story」出發：

```http
# 資源導向的做法（前端要自己編排多次呼叫）
POST /orders
POST /orders/{id}/payments
GET  /orders/{id}/tracking

# 商業意圖導向的做法（一支 API 對應一個 use case）
POST /checkout
```

- UI 上的一個按鈕、一個畫面、一個流程，對應 BFF 的一支 API（或一個 GraphQL mutation）
- BFF 不該暴露 `GET /customers/{id}/addresses` 這種「資料瀏覽」式介面，因為 UI 在乎的是「把這筆訂單結帳、寄出、確認」這個商業事件，不是資料庫表長相

判斷標準很簡單：**把 UI 畫面上的操作翻成一句話，如果那句話是動詞，BFF 就該是動作。**

> 註：GraphQL 之所以在 BFF 位置大受歡迎，正是因為它把「商業資料需求」交給 client 宣告，本質上就是商業意圖導向的一種極致形式。

## Domain Service 層：貼近領域模型，資源是地基

Domain Service 是領域的骨幹：訂單、付款、庫存、客戶。它的消費者**不是某個 UI，而是多個上游系統**——BFF、其他服務、批次作業、第三方整合都可能呼叫它。

因此這層的 API 必須：

- **以資源（名詞）為核心**：`POST /orders`、`GET /orders/{id}`、`PUT /orders/{id}/status`。資源是領域事實（aggregate），命名穩定，不隨 UI 改版而變
- **可重用**：一支 `POST /orders` 可能同時服務 Web 結帳、App 下單、內部補單系統
- **動作是例外，不是常態**：怎麼判斷「拆得掉還是拆不掉」？
  - 「把訂單狀態改成已出貨」是改單一欄位，拆得掉 → `PUT /orders/{id}/status`
  - 「結帳」涉及庫存扣減、訂單建立、金流授權、發票開立——橫跨多個資源的狀態轉移，拆不掉 → 用動作

拆不掉的動作，在資源導向下有個官方的折衷寫法，Google 稱之為 custom methods：

```http
POST /v1/payments/pay_123:capture
POST /v1/orders/ord_456:refund
```

- `POST /payments/{id}:capture` 這種語法是 Google AIPs 的 custom methods 模式（AIP-121 規定資源導向設計，AIP-136 明確認可 custom methods）
- 這就是大型企業承認「純 CRUD 不夠用」的官方折衷，看到自己也覺得安心，大家最後都走到類似的地方

領域層選擇資源導向，不是為了信仰，而是為了**穩定與可預測**：資源一多，客戶端與團隊之間溝通的「詞彙」就固定了；多個消費端也不必為了新 UI 改版而追著 domain API 改。

## 實用決策框架：設計一支 API 前，先問五個問題

| 問題 | 偏向商業意圖（BFF） | 偏向資源導向（Domain） |
|---|---|---|
| 1. 消費者只有一個 UI 嗎？ | 是 → 動作命名，直接服務該畫面 | 否，多個系統共用 → 資源命名 |
| 2. 這支 API 是否對應一個明確 user story？ | 是（結帳、註冊） | 否（查詢、更新單一狀態） |
| 3. 操作可以拆成標準 CRUD 語意嗎？ | 拆不掉 → 動作 | 可以 → 資源 |
| 4. 資料的生命週期與領域一致嗎？ | 資料是 UI 的臨時投影 | 資料就是領域事實 |
| 5. 這層會被幾個 team 當作契約使用？ | 少數，改版成本低 | 多數，契約必須穩定 |

簡單記法：**BFF 回答「使用者要做什麼」，Domain 回答「系統裡有什麼」。**

## 平衡一下：三個真實存在的反方觀點

**1.「連 Domain Service 都該商業意圖導向」**——Jacobson 主張 use-case 優先適用於所有層。

> 反駁：Netflix 的 edge API 確實動作化很成功，但 Netflix 的 domain 是「推薦/串流」這種本質上是服務的領域；針對訂單、帳務這種以狀態轉移為核心的領域，資源模型反而讓稽核、重試、並行控制更容易表達。

**2.「動作導向就是偽 REST，一律資源化」**——Fielding 陣營認為不遵守 uniform interface 的 API 都是披著 HTTP 的 RPC。

> 反駁：技術上說得對，但它把「表達商業意圖」的需求丟回給呼叫端：客戶端被迫用多個請求自行拼出商業事件，延遲與錯誤處理成本全部落在最脆弱的環節。資源化是手段，不是目的。

**3.「GraphQL 一個 schema 取代 BFF + Domain 分層」**

> 反駁：GraphQL 解決的是「資料塑形」，不是「領域契約」；把 GraphQL 直接對到資料庫/領域層，會把查詢權力下放給所有 client，難以做權限、稽核與領域不變量控管。GraphQL 放在 BFF 位置最理想，取代不了 Domain 層。

## 小結

API 設計的爭論之所以吵不完，是因為雙方其實在講不同的層。

- **BFF 層**：以商業意圖為出發點。一支 API 對應一個 user story，動作命名、資料塑形、聚合編排，GraphQL 也很好
- **Domain Service 層**：以資源為出發點。名詞核心、穩定可重用，動作是例外（custom methods），因為它的消費者是多個契約方

整理完才發現，答案其實不複雜：下次再有人問「REST 還是 action？」——別急著站隊。先反問一句：**這支 API 服務誰？** 答案是 UI 的使用者，就走商業意圖；答案是領域的契約方，就走資源。答案出來，設計原則就出來了。

## 參考資料

- [Fielding 博士論文（Architectural Styles and the Design of Network-based Software Architectures, 2000）](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)
- [Richardson Maturity Model（Martin Fowler, 2010）](https://martinfowler.com/articles/richardsonMaturityModel.html)
- [Sam Newman - Pattern: Backend For Frontend (2015)](https://samnewman.io/patterns/architectural/bff/)
- [Netflix TechBlog - API Design（Daniel Jacobson 的 use-case 主張）](https://netflixtechblog.com/)
- [Google AIP-121（Resource-oriented design）](https://google.aip.dev/121)
- [Google AIP-136（Custom methods）](https://google.aip.dev/136)
- [gRPC 官方文件](https://grpc.io/docs/)
- [GraphQL 官方文件](https://graphql.org/learn/)
