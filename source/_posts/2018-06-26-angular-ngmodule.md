---
layout: post
title: '[Angular] NgModule'
comments: true
date: 2018-06-26 09:17:02
categories: Angular
tags: Angular
---

Angular 的 NgModule 是架構中的核心元件，為什麼這麼說呢? 因為 NgModule 不論是要執行 AOT 或是 LazyLoading 或是製作Library ，都是以 NgModule 為單位，至於 NgModule 到底有哪些事情是我們需要知道的呢? 

<!-- more -->

# 什麼是 NgModule

`NgModule` 是 Angular 內管理元件的工具，他負責管理元件間、服務相依性的關係，也控制其他 NgModule 對自己的存取權限。`NgModule` 是透過 metadata (decorator) 來描述所管理的 `component` 、`directive`、`pipe`、`NgModules` 等

以下是一個簡單 NgModule 的範例程式

```typescript
@NgModule({
  imports: [
    BrowserModule,
    ContactModule,
    CoreModule.forRoot({userName: 'Miss Marple'}),
    AppRoutingModule
  ],
  providers: [],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

至於 NgModule 與 application dependency injectors  間的關係，會在下面做說明。簡單的來說，於 NgModules provider 內註冊的服務，都會被註冊到 Application 層級

**補充資訊**

Angular 內的物件層級由上而下為，而在相關位置都可以取到以下物件的參考物件，例如 `ApplicationRef`

1. Platform
2. Application
3. NgModule
4. Directive / Component

# NgModule VS ES2015 Modules

 Angular 有使用到 NgModule 與 ES2015 Modules。 NgModule 與 ES2015 Module 是一樣的嗎? 

答案是，他們是不一樣的東西

ES2016 Module 是以實體檔案為單位來管理程式碼，並透過 `export` 關鍵字來控制要對外公開的功能

```typescript
export class AppComponent { ... }
```

在其他檔案要使用到 `AppComponent` 時，必須透過 `import` 來載入

```typescript
import { AppComponent } from './app.component';
```

NgModule 是以 Class 搭配 `@NgModule` 修飾器來管理元件，並透過 `export` 來管理要對外公開的元件

# NgModule 與 Dependency Injection 的關係

Angular 的 DI 系統的偉大已經不是一兩句話可以描述的，但 Angular DI 還是有很多細節要留意，不然會有鬼打牆的現象出現。先從基本的註冊服務的行為開始說起，Angular 在 Application 層級，有一個 `Injector` 中樞服務，這一個服務是用來管理所有註冊的 service，當在 class 中有使用到有註冊的 service，就會從 Injector 中將該實體注入到該 class 中，預設的註冊模式是 `singleton`

Injector 在 Application 層級，那要怎麼註冊服務呢? Application 又沒有開可以註冊服務的窗口出來。這時候就是 `NgModules` 要上場了. 記得 `NgModules` 有一個 `providers` 的區塊可以做註冊 service 至 Injector 吧，這裡的運作流程是

1. 當 `platformBrowserDynamic()` 啟動後，就會跟著啟動所指定的 `NgModule` (也是所謂的 Root Module)。
2. 將 Root Module 內所設定的 provider 驗證並加入到 Injector Tree 中
3. 將 Root Module 內所 import 的 NgModule 的 provider 驗證加入到 Injector Tree 中

每一次的 NgModule 的 import 都會產生一份新的 providers 清單，這也是為什麼在官方文件提到，如果想要 service 維持 `singleton` ，就必須將 service 註冊在 `Core Module` 且只會在 Root Module import。( `providedIn` 不在此範圍內)



# 啟動 NgModule 的模式

## JIT (Just In Time compilation)

Dynamic bootstrapping 是指 Angular 程式碼是在瀏覽器端才進行編譯工作。瀏覽器動態啟動是件成本很高的動作，所以不建議使用在正式環境上，會影響第一次頁面打開的執行速度，建議發佈上線時，要採用 AOT 模式



## AOT (Ahead Of Time compilation)

何謂 AOT 模式，簡單的說，就是將編譯的動作挪至建置時間完成。AOT 有哪些好處

1. Faster rendering，因為程式已經先編譯過了，所以到瀏覽器端就只剩下執行了，執行速度會變快
2. Fewer asynchronous requests，將 HTML 與 CSS 編譯至 JavaScript 中了，不須要在從主機端下載 HTML 與 CSS 檔案
3. Smaller Angular framework download size，因為不需要將 Angular Compiler 的程式包到瀏覽器端，但並表示總的檔案大小是比較小的，因為 HTML Template 的部分也被編譯成 JavaScript 了
4. Detect template errors earlier，由於會先將 Template 編譯，可以先檢查出 Template 與 Component Class 間的錯誤，例如 template 裡有使用到未定義的方法或是變數
5. Better security，因為第二點的理由，可以避免一些 Injection 攻擊

### 比較 JIT 與 AOT 產生的檔案內容

JIT 版本的 `app.component.ts`

![](https://i.imgur.com/Otu37dB.png)

AOT 版本的 `app.component.ts`

![](https://i.imgur.com/yWZ0m9D.png)

發現 AOT 版本的 template 等資訊都不見了，這一部分的資訊被編譯成 `ngfactory` 的內容

![](https://i.imgur.com/wpZtzxz.png)

AOT 會將 Template 的部份解析並轉換成程式的一部分，而非用原本的型態呈現

另外一點 AOT 與 JIT 模式的差異是在於**啟動方式**

JIT 的啟動方式 

```typescript
platformBrowserDynamic().bootstrapModule(AppModule);
```

AOT 的啟動方式

```typescript
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
```

由於現在很多工作都被 Angular CLI 做掉了，但還是得了解一下這兩者在啟動的方法還是有所不同的



### 延伸閱讀

而完整的運作流程可以在 [官方文件](https://angular.io/guide/aot-compiler#how-aot-works) 裡找到，在文件中也點出哪一些寫法是不被 AOT 支援的，要多留意

# Lazy Loading

何謂 Lazy Loading? 是將程式碼切割成不同的實體檔案，然後在需要時才將該檔案下載到瀏覽器中執行。這樣的做法，可以減少第一次載入的檔案大小，是效能調教的技巧之一

那怎麼才能做到 lazy loading 的效果呢? 可透過路由設定檔來控制

```typescript
const routes: Routes = [
  {
    path: 'customers',
    loadChildren: 'app/customers/customers.module#CustomersModule'
  }, 
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];
```

利用 `loadChildren` 的方式指定要載入的 `NgModules` 的位置，建置工具就可以知道這一個 NgModules 是需要被單獨產生的

另外一種比較進階的技巧，可參閱這篇文章，[[Angular] 手動創造出 Lazy Loading 的效果](https://blog.kevinyang.net/2017/11/08/manual-lazy-loading/)，如果要搭配動態顯示 Component 時，需要留意所要建立的 Component 是隸屬在哪一個 NgModules 裡，不然會出現錯誤訊息，抱怨說找不到該 Component，(參考 [Issue](https://forum.angular.tw/t/topic/978/8))

# 結語

關於 NgModules 的資訊真的好多好多，無法單純的用一篇文章就可以涵蓋，官方文件就有單獨的一個單元來解釋 NgModules 的大小事，真心推薦一定要閱讀，NgModules 用得好不好，對系統的架構是有很大的影響的

# 參考資料

* [NgModules](https://angular.io/guide/ngmodules)
* [ES6 In Depth: Modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/)
* [viewProviders vs provider](https://blog.kevinyang.net/2018/01/19/angular-viewproviders-providers/)
* [AOT](https://angular.io/guide/aot-compiler)

