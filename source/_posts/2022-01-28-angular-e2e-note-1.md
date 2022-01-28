---
layout: post
title: '[Angular] Cypress E2E with TodoMVC 筆記 01'
comments: true
typora-root-url: 2022-01-28-angular-e2e-note-1
typora-copy-images-to: 2022-01-28-angular-e2e-note-1
date: 2022-01-28 21:15:41
categories: Angular
tags: Angular
---

建立好 E2E 的環境後，就拿 TodoMVC 的樣板來做練習，以下為練習實作中的筆記

<!-- more -->

# 準備要測試的 TodoMVC

1. 將 TodoMVC  的 template 和 css 搬進 Angular 專案中

   ![image-20220128213454445](image-20220128213454445.png)

2. 建立一個練行用的 e2e spec file

   ```typescript
   describe('Main', () => {
     it('Visits the initial project page', () => {
       cy.visit('/');
       cy.contains('Welcome');
       cy.contains('e2e-study app is running!');
     });
   });
   
   ```

   

3. 執行 ng e2e，預期會看到測試失敗

   ![image-20220128213434694](image-20220128213434694.png)

4. 將測試檔案修正成綠燈

   ```typescript
   describe('Main', () => {
     it('Visits the initial project page', () => {
       cy.visit('/');
       cy.contains('todos');
     });
   });
   ```

   ![image-20220128213610960](image-20220128213610960.png)

## 測試案例 1

檢查 Todo List 筆數是否為兩筆

1. html 結構

   ```html
   <section class="main">
       <input id="toggle-all" class="toggle-all" type="checkbox">
       <label for="toggle-all">Mark all as complete</label>
       <ul class="todo-list">
           <!-- These are here just to show the structure of the list items -->
           <!-- List items should get the class `editing` when editing and `completed` when marked as completed -->
           <li class="completed">
               <div class="view">
                   <input class="toggle" type="checkbox" checked>
                   <label>Taste JavaScript</label>
                   <button class="destroy"></button>
               </div>
               <input class="edit" value="Create a TodoMVC template">
           </li>
           <li>
               <div class="view">
                   <input class="toggle" type="checkbox">
                   <label>Buy a unicorn</label>
                   <button class="destroy"></button>
               </div>
               <input class="edit" value="Rule the web">
           </li>
       </ul>
   </section>
   ```

2. 測試案例 - 紅燈

   ```typescript
   it('has two todo item in the list', () => {
       cy.visit('/');
       cy.get('.todo-list').then((ele) => {
           expect(ele.children.length).to.equal(1);
       });
   });
   ```

   ![image-20220128214335209](image-20220128214335209.png)

3. 綠燈

   ```typescript
   it('has two todo item in the list', () => {
       cy.visit('/');
       cy.get('.todo-list').then((ele) => {
           expect(ele.children.length).to.equal(2);
       });
   });
   ```

4. 查了一下官方文件，有另外一種更乾淨的寫法

   ```typescript
   it('has two todo item in the list', () => {
       cy.visit('/');    
       cy.get('.todo-list').children().should('have.length', 2);
   });
   ```

   

## 測試案例 2

新增 Todo，列表會多一筆紀錄

1. 先重構一下 spec code，發現在兩個 test case 內有重複的 code，將其移到 `beforeEach` 內

   ```typescript
   describe('Main', () => {
     beforeEach(() => {
       cy.visit('/');
     });
   
     it('Visits the initial project page', () => {
       cy.contains('todos');
     });
   
     it('has two todo item in the list', () => {
       cy.get('.todo-list').children().should('have.length', 2);
     });
   });
   
   ```

2. 在 input 地方輸入並按下 enter，期待會看到 3 筆 (預設 2 筆 + 新增 1 筆)，預期失敗，因為沒有實作功能

   ```typescript
     it('add new todo, list should have 3 items', () => {
       cy.get('.new-todo').type('abc').type('{enter}');
       cy.get('.todo-list').children().should('have.length', 3);
     });
   ```

3. 實作功能

   * app.component.ts

   ```typescript
   import { Component } from '@angular/core';
   import { v4 as uuidv4 } from 'uuid';
   
   type Todo = {
     id: string;
     content: string;
     isComplete: boolean;
   };
   @Component({
     selector: 'app-root',
     templateUrl: './app.component.html',
     styleUrls: ['./app.component.css'],
   })
   export class AppComponent {
     todos: Todo[] = [];
   
     addTodo(ele: HTMLInputElement) {
       this.todos.push({
         id: uuidv4(),
         content: ele.value,
         isComplete: false,
       });
       ele.value = '';
     }
   }
   ```

   * app.component.html

   ```html
      <header class="header">
         <h1>todos</h1>
         <input class="new-todo" placeholder="What needs to be done?" autofocus #newTodo (keyup.enter)="addTodo(newTodo)">
       </header>
       <!-- This section should be hidden by default and shown when there are todos -->
       <section class="main">
         <input id="toggle-all" class="toggle-all" type="checkbox">
         <label for="toggle-all">Mark all as complete</label>
         <ul class="todo-list">
           ...
           <li *ngFor="let todo of todos">
             <div class="view">
               <input class="toggle" type="checkbox">
               <label>{{ todo.content }}</label>
               <button class="destroy"></button>
             </div>
             <input class="edit" [value]="todo.content">
           </li>
         </ul>
       </section>
   ```

     

4. 重新執行測試就會看到綠燈了

5. 整理 html 並配合調整測試檔案

   ```typescript
   describe('Main', () => {
     beforeEach(() => {
       cy.visit('/');
     });
   
     it('Visits the initial project page', () => {
       cy.contains('todos');
     });
   
     it('has two todo item in the list', () => {
       cy.get('.todo-list').children().should('have.length', 0);
     });
   
     it('add new todo, list should have 3 items', () => {
       cy.get('.new-todo').type('abc').type('{enter}');
   
       cy.get('.todo-list').children().should('have.length', 1);
     });
   });
   
   ```

   ```html
   <header class="header">
       <h1>todos</h1>
       <input class="new-todo" placeholder="What needs to be done?" autofocus #newTodo (keyup.enter)="addTodo(newTodo)">
   </header>
   <!-- This section should be hidden by default and shown when there are todos -->
   <section class="main">
       <input id="toggle-all" class="toggle-all" type="checkbox">
       <label for="toggle-all">Mark all as complete</label>
       <ul class="todo-list">
           <!-- These are here just to show the structure of the list items -->
           <!-- List items should get the class `editing` when editing and `completed` when marked as completed -->          
           <li *ngFor="let todo of todos">
               <div class="view">
                   <input class="toggle" type="checkbox">
                   <label>{{ todo.content }}</label>
                   <button class="destroy"></button>
               </div>
               <input class="edit" [value]="todo.content">
           </li>
       </ul>
   </section>
   ```

# 小技巧

有時候在定位 HTMLElement 的時候會很麻煩，不像這個範例很單純，這時候就可透過 attribute 的方式來標註，根據這份 [best practice](https://docs.cypress.io/guides/references/best-practices#Selecting-Elements) 內提到，我們可以使用 `data-cy`、`data-test`、`data-testid` 來標註，就可以很精準地拿到我們想要的 element.

```html
<input class="new-todo" placeholder="What needs to be done?" autofocus #newTodo (keyup.enter)="addTodo(newTodo)" data-cy="newTodo">
```

```typescript
// 原本寫法
cy.get('.new-todo').type('abc').type('{enter}');
// 改為以下寫法
cy.get('[data-cy=newTodo]').type('abc').type('{enter}');
```

# Reference

- Cypress API

  - [should](https://docs.cypress.io/api/commands/should): Create an assertion. Assertions are automatically retried until they pass or time out.

  - [type](https://docs.cypress.io/api/commands/type): Type into a DOM element.

  - [children](https://docs.cypress.io/api/commands/children): Get the children of each DOM element within a set of DOM elements.

  - [get](https://docs.cypress.io/api/commands/get) : Get one or more DOM elements by selector or [alias](https://docs.cypress.io/guides/core-concepts/variables-and-aliases).

    
