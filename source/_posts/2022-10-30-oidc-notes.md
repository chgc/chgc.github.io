---
layout: post
title: '[OIDC] 瞭解 OIDC 的表層'
comments: true
typora-root-url: 2022-10-30-oidc-notes
typora-copy-images-to: 2022-10-30-oidc-notes
date: 2022-10-30 08:21:43
categories: Keycloak
tags: Keycloak
---

Keycloak 提供了幾種 protocols，OpenID Connect (OIDC)、OAuth 2.0 and SAML。雖然 OIDC & OAuth 2.0 已存在一段時間，但因為沒有使用實做上的情境，所以都沒有花時間去瞭解背後的運作原理，一樣利用週末的時間來做一下功課

<!-- more -->

根據閱讀多篇文件瞭解，OIDC 是基於 OAuth 2.0 發展出來的，看起來得先看 OAuth 2.0 是什麼

![image-20221030104933158](image-20221030104933158.png)

## OAuth 2.0

OAuth 2.0 基本上處理 Authorization 的部分，用來控制授權**誰**能存取**資源**，有四個基本元素

1. **authorization server**: 用來發 access token 的 server
2. **resource owner**: 有權限能存取資料的使用者
3. **client**: 將 access token 傳給系統服務的應用程式
4. **resource server**: 接受 access token 並驗證其合法性

其他名詞

1. **authorization grant**: 授權範圍
2. **access token**: 由 `authorization server` 發出，會在發請求時附加在進去給 `resource server`
3. **redirect URI**: 登入後要轉回的路徑

### 授權流程

1. Authorization Code

   ![image-20221030091611632](image-20221030091611632.png)

   這算是比較常見的模式，登入畫面會由 `authorization server` 提供，透過 `redirect URI` 的方式帶著 `authorization code` 回到 `client` 端供後面使用

   > 這流程也是 Keycloak JavaScript adapter 預設行為

   

2. Implicit

   ![image-20221030091931055](image-20221030091931055.png)

   使用場景是 SPA 或是純前端系統，與 `Authorization Code` 模式的差異在於 `access token` 的取得方式，

   > 這模式比較不安全，"透過 URI Fragment 來傳 Access Token ，所以可能會外洩"

3. Resource Owner Password Credentials

   ![image-20221030092328110](image-20221030092328110.png)

   這比較像是過往的 server side 網頁服務

4. Client Credentials

   ![image-20221030092618674](image-20221030092618674.png)

   適用場景: machine-to-machine (M2M) applications  

(圖片出自: [[筆記] 認識 OAuth 2.0：一次了解各角色、各類型流程的差異](https://medium.com/%E9%BA%A5%E5%85%8B%E7%9A%84%E5%8D%8A%E8%B7%AF%E5%87%BA%E5%AE%B6%E7%AD%86%E8%A8%98/%E7%AD%86%E8%A8%98-%E8%AA%8D%E8%AD%98-oauth-2-0-%E4%B8%80%E6%AC%A1%E4%BA%86%E8%A7%A3%E5%90%84%E8%A7%92%E8%89%B2-%E5%90%84%E9%A1%9E%E5%9E%8B%E6%B5%81%E7%A8%8B%E7%9A%84%E5%B7%AE%E7%95%B0-c42da83a6015))

## OIDC

瞭解基本 OAuth 2.0 後，那 OIDC 又是什麼，一開始提到 `OIDC 是基於 OAuth 2.0 發展出來的`

先提一下 `OAuth 2.0` 只有做 `Authorization` 的部分，並沒有涵蓋`Authentication` 的部分，這兩者的差異是什麼呢?

* Authorization: 授權使用範圍
* Authentication: 使用者認證，使用者是否存在及使用者是誰，都算在認證的範圍內

![image-20221030093943446](image-20221030093943446.png)

(圖片來源: https://openid.net/connect/)

整個的流程大概會是這樣

![image-20221030094329195](image-20221030094329195.png)

一些會出現在 OIDC 的名詞

- **End User**: Human participant.
- **Replying Party (RP)**: OAuth 2.0 Client application requiring End-User Authentication and Claims from an OpenID Provider.
- **OpenID Provider (OP)**: OAuth 2.0 Authorization Server that is capable of Authenticating the End-User and providing Claims to a Relying Party about the Authentication event and the End-User.
- **ID Token**: [JSON Web Token (JWT)](https://openid.net/specs/openid-connect-core-1_0.html#JWT) [JWT] that contains Claims about the Authentication event. It MAY contain other Claims.
- **UserInfo Endpoint**: Protected Resource that, when presented with an Access Token by the Client, returns authorized information about the End-User represented by the corresponding Authorization Grant. The UserInfo Endpoint URL MUST use the `https` scheme and MAY contain port, path, and query parameter components.

### 常見 flow

1. **Authorization Code**
2. **Implicit**: with Id_token
3. **Hybrid**:  Authorization Code+ Implicit 



## 參考資料

- [OAuth 2.0 and OpenID Connect (in plain English)](https://www.youtube.com/watch?v=996OiexHze0&t=2s)
- [深入淺出 OpenID Connect (一)](https://kimlin20011.medium.com/%E6%B7%B1%E5%85%A5%E6%B7%BA%E5%87%BA-openid-connect-%E4%B8%80-8701bbf00958)
