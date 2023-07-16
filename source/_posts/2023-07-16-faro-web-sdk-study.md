---
layout: post
title: '[Grafana] Faro Web SDK 學習筆記'
comments: true
typora-root-url: 2023-07-16-faro-web-sdk-study/
typora-copy-images-to: 2023-07-16-faro-web-sdk-study/
date: 2023-07-16 10:25:17
categories: Grafana
tags: Grafana
---

Grafana 提供了許多工具讓維運團隊能很清楚的知道系統的相關狀態，針對網頁相關效能的監控，也有提供相關的 solution，就是 [Faro](https://grafana.com/oss/faro/)

![grafana faro](https://grafana.com/static/assets/img/grafana-faro-oss-dashboard-thm.jpg)

Grafana Faro 的運作方式如下圖，

![how does grafana faro work](https://grafana.com/static/assets/img/diagrams/grafana-oss-faro-diagram.svg)

前端開發可以透過提供的 SDK 將相關資訊傳到後面的 Agent/Collect ，就完成了。只是 SDK 雖然簡單套用，裡面有很多細節設定是需要深入研究的，這篇就是這些設定的學習筆記

<!-- more -->

## Faro Web SDK

`@grafana/faro-web-sdk` provides instrumentations, metas and transports for use in web applications，安裝使用方法如下

1. 安裝 `faro-web-sdk`

   ```
   npm i @grafana/faro-web-sdk
   ```

2. initialize

   ```typescript
   import { initializeFaro } from '@grafana/faro-web-sdk';
   
   const faro = initializeFaro({
     url: 'https://collector-host:12345/collect',
     apiKey: 'secret',
     app: {
       name: 'frontend',
       version: '1.0.0',
     },
   });
   ```

   1. `url`: Grafana Agent 的位置
   2. `apiKey`: 對應到 Grafana Agent 的 `integrations.app_agent_receiver_configs` 下的 `server.api_key` 設定
   3. `app`:  Web Application 的 meta 資訊，會用於 Grafana Dashboard 上

3. 當這樣設定完成後，開啟網頁時，在 network 的地方就會看到 SDK post 相關資訊到設定的 agent 位置

### 基本用法

當遇到需要手動推送資訊時，SDK 也有提供對應的 API 接口

1. 手動推送 log

   ```typescript
   // send a log message
   // by default info, warn and error levels are captured.
   // trace, debug and log are not
   console.info('Hello world', 123);
   // or
   faro.api.pushLog(['Hello world', 123], { level: LogLevel.Debug });
   
   // log with context
   faro.api.pushLog(['Sending update'], {
     context: {
       payload: thePayload,
     },
     level: LogLevel.TRACE,
   });
   ```

2. 手動送 Exception

   ```typescript
   faro.api.pushError(new Error('everything went horribly wrong'));
   ```

3. 手動送 Event

   ```typescript
   faro.api.pushEvent('navigation', { url: window.location.href });
   ```

4. 手動送 `meaurement`

   ```typescript
   faro.api.pushMeasurement({
     type: 'cart-transaction',
     values: {
       delay: 122,
       duration: 4000,
     },
   });
   ```

5. pause/resume Faro

   ```typescript
   // pause faro, preventing events from being sent
   faro.pause();
   
   // resume sending events
   faro.unpause();
   ```

### 學習筆記

1. Faro SDK 預設會忽略短時間內相同訊息的事件，不會每一筆都往後面送，如果想要改變這行為，可以設定 `dedupe: false` (`dedupe`: A flag for toggling deduplication filter)

2. 預設是採 batch sending 的模式，每 250 ms 或是每 50 筆送一次，這些數值也可以設定

   ![image-20230716114843343](image-20230716114843343.png)

3. 上一段提到的手動送資訊到後面的 API，都有額外的參數可以設定，細節可以參閱[這邊](https://github.com/grafana/faro-web-sdk/tree/main/packages/core#api)

4. 很多 SDK 的使用細節說明都寫在 `faro-core` 的地方，[README](https://github.com/grafana/faro-web-sdk/blob/main/packages/core/README.md) 有此去

5. 預設有提供 `faro-react`，其他 framework 如果想要實作類似的效果，可以參考 react 的版本，包含的項目有

   1. Error Boundary - Provides additional stacktrace for errors
   2. Component Profiler - Capture every re-render of a component, the un/mounting time etc.
   3. Router (v4-v6) integration - Send events for all route changes
   4. SSR support

   以 Angular 來說，應該也可以做到 1~3 點，但我還沒有自己動手實作過，先暫定可以好了

## 小結

Faro 提供的是 `RUM` (Real User Monitoring) 的相關資訊，除了 Grafana，Kibana 和 Sentry 都有提供類似的功能，只是因為自家的 Monitor stack 是 Grafana 為主，所以選擇 Faro 只是為了讓使用的工程師不用在工具中切來切去

前端效能調教水很深，收集到的這些資訊並不會有 Web 在產生畫面的相關資訊，那些需要回到瀏覽器上做分析，背後的 web vita API 可以參考這一個套件 [web-vitals](https://www.npmjs.com/package/web-vitals)





## Reference

- [Faro Web SDK](https://github.com/grafana/faro-web-sdk)
- [Web Vitals](https://web.dev/vitals/)





