---
layout: post
title: '[Angular] Add E2E Testing from zero to one with cyrpess'
comments: true
typora-root-url: 2022-01-27-angular-e2e-cypress/
typora-copy-images-to: 2022-01-27-angular-e2e-cypress/
date: 2022-01-27 20:40:33
categories: Angular
tags: Angular
---

Angular 在 12 版之類就將 protactor E2E framework 從 CLI 起始專案中移除，主要原因是大家習慣用來做 E2E 測試的工具，Protractor 已經不是主流，是 cypress，為了這個原因，Angular 團隊決定把這選擇權還回開發者手上，讓開發者決定自己的 E2E 測試。

<!-- more -->

# 初始環境

當然有強大 angular schematics，cypress 也有出可以快速設定測試環境的套件，以下是如何安裝及執行第一個 E2E 測試的步驟

1. 當起始一個新的 Agnular 專案，已經看不到 E2E 的資料夾了

   ![image-20220127205749466](image-20220127205749466.png)

2. 好家在有 `ng add` 的功能，cypress 的套件安裝可以透過 `ng add @cypress/schematic` 來完成，這個會執行以下工作

   ✅ Install Cypress

   ✅ Add npm scripts for running Cypress in `run` mode and `open` mode

   ✅ Scaffold base Cypress files and directories

   ✅ Provide the ability to add new e2e files easily using `ng-generate`

   ✅ Optional: prompt you to add or update the default `ng e2e` command to use Cypress.

   ![image-20220127210133452](image-20220127210133452.png)

3. 當跑完後就可以執行 `ng e2e` 將 cypress 執行起來並執行第一個預設測試，但如果在沒有任何修改下，會測試錯誤

   ![image-20220127210434231](image-20220127210434231.png)

4. 就來修改一下 e2e 測試讓他綠燈

   ```typescript
   describe('My First Test', () => {
     it('Visits the initial project page', () => {
       cy.visit('/')
       cy.contains('Welcome')
       cy.contains('e2e-study app is running!')
     })
   })
   
   ```

   ![image-20220127210600806](image-20220127210600806.png)

5. 這樣就完成 cypress e2e 測試環境了

# cypress-schematics 介紹

1. To run Cypress in `open` mode within your project:

   ```
   ng run {project-name}:cypress-open
   ```

2. To run Cypress headlessly via `run` mode within your project:

    ```
    ng run {project-name}:cypress-run
    ```

3. If you have chosen to add or update the `ng e2e` command, you can also run Cypress in `open` mode using this:

    ```
    ng e2e
    ```

4. To generate new e2e spec files:

    ```
    ng generate @cypress/schematic:e2e
    ```

更多設定參數可以到這[連結](https://github.com/cypress-io/cypress/tree/develop/npm/cypress-schematic#builder-options-)仔細研究 (angular.json)



# 參考資料

- [cypress schematics](https://github.com/cypress-io/cypress/tree/develop/npm/cypress-schematic)
