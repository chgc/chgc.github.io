---
layout: post
title: '[Angular] 手動創造出 Lazy Loading 的效果'
comments: true
date: 2017-11-08 14:57:32
categories: Angular
tags: Angular
---

一般提起 Angular 的 Lazy Loading 時，第一個反應都是透過網址的方式來實作，但是否有方法可以借用 `RouterModule` 的幫助來產生 chunk 檔案，然後手動作載入的動作呢? 答案是可以的

<!-- more -->

# 環境設定

其實在 `RouterModule` 底層在執行 Lazy Loading 效果的方法，是藉由 [NgModuleFactoryLoader](https://angular.io/api/core/NgModuleFactoryLoader) 來完成的， 而底下有一個 subclass 叫做 [SystemJsNgModuleLoader](https://angular.io/api/core/SystemJsNgModuleLoader)，這一個是我們所需要的 `NgModuleLoader`，**將其註冊在 module providers 區區塊內**，所以 Module Loader 有了，那要怎麼註冊 module 成為可以延遲載入的 module 呢? 

方法有兩個

1. 使用 `RouterModule.forChild(routes)` 的方式註冊 modules

   ```typescript
   const routes: Route[] = [
     { loadChildren: 'app/lazy1/lazy1.module#Lazy1Module' },
     { loadChildren: 'app/lazy2/lazy2.module#Lazy2Module' }
   ];

   @NgModule({
     declarations: [AppComponent],
     imports: [BrowserModule, FormsModule, RouterModule.forChild(routes)],
     providers: [SystemJsNgModuleLoader],
     bootstrap: [AppComponent]
   })
   export class AppModule {}

   ```

2. 使用 [provideRoutes](https://angular.io/api/router/provideRoutes) 的方式註冊 modules

   ```typescript
   const routes: Route[] = [
     { loadChildren: 'app/lazy1/lazy1.module#Lazy1Module' },
     { loadChildren: 'app/lazy2/lazy2.module#Lazy2Module' }
   ];

   @NgModule({
     declarations: [AppComponent],
     imports: [BrowserModule, FormsModule],
     providers: [provideRoutes(routes), SystemJsNgModuleLoader],
     bootstrap: [AppComponent]
   })
   export class AppModule {}
   ```

上述的兩種方式都可以達到一樣的效果

![](https://i.imgur.com/GRMdckF.png)



# 使用方式

## constructor

環境設定好後，該如何使用呢? 這裡以 `app.component.ts` 為例，首先先在 `constructor` 載入 `SystemJsNgModuleLoader`

```typescript
constructor(private moduleLoader: SystemJsNgModuleLoader) {}
```

## template

範例我使用的 html 如下

```html
<button (click)="go('lazy1')">GO TO Lazy1</button>
<button (click)="go('lazy2')">GO TO Lazy2</button>
<!-- <div #container></div> -->
<ng-container *ngComponentOutlet="OtherModuleComponent;
ngModuleFactory: myModule;"></ng-container>

```

HTML說明

* `ngComponentOutlet` 支援使用 `ngModuleFactory` 的方法產生 Component，
* 兩個按鈕都按下後，會將各 Module 所指定的 `EntryComponent` 顯示在 `ng-conainer` 的地方

## lazy module

其中一個 `LazyModule` 的程式碼如下

```typescript
@NgModule({
  imports: [CommonModule],
  declarations: [Lazy1Component],
  entryComponents: [Lazy1Component]
})
export class Lazy1Module {
  static entry = Lazy1Component;
}

```

需要留意的是，由於我們會動態載入 `component` ，所以該 `component` 需要被註冊在 `entryComponents` 的區塊內。

另外於 `Lazy1Module` 的 區塊內設定一個 static property ，等一下在載入 module's component 時會用到

## go method

```typescript
const modules = {
  lazy1: 'app/lazy1/lazy1.module#Lazy1Module',
  lazy2: 'app/lazy2/lazy2.module#Lazy2Module'
};
...
OtherModuleComponent = undefined;
myModule: NgModuleFactory<any>;

go(moduleName) {
  const path: string = modules[moduleName];
  this.moduleLoader.load(path).then((moduleFactory: NgModuleFactory<any>) => {
    const entryComponent = (<any>moduleFactory.moduleType).entry;
    this.myModule = moduleFactory;
    this.OtherModuleComponent = entryComponent;
  });
}
```

還記得在 `constructor` 所注入的 `SystemJsNgModuleLoader`，該 class 只有一個 `load` 函式，這一個 load 函式接受一個引數，是用來指定要載入的 module 位置，這個位置會跟 `AppModule` 所設定的一樣。

```typescript
load(path: string): Promise<NgModuleFactory<any>>
```

當成功載入時，會回傳一個 `NgModuleFactory` ，這個 `NgModuleFactory` 就可以直接指定給 `ngComponentOutlet` 使用，而 component 的部分，可以由剛剛所設定的靜態變數 entry 取得，一樣指定給 `ngComponentOutlet` 使用。

這樣子就完成手動載入 `NgModule` 的功能了，是不是很簡單!!!

# 延伸應用

Angular 在 Multi Page Application 的應用情境下，可以利用這樣的模式，動態的載入所需要的 `NgModule` 並啟用 `Component`

```typescript
 ngDoBootstrap(appRef: ApplicationRef) {
    const widgets = document.querySelectorAll('[data-module-path]');
    for (const i in widgets) {
      if (widgets.hasOwnProperty(i)) {
        const modulePath = widgets[i].getAttribute('data-module-path');
        if (modulePath) {
          this.moduleLoader.load(modulePath).then((moduleFactory: NgModuleFactory<any>) => {
            const entryComponent = (<any>moduleFactory.moduleType).entry;
            const ngModuleRef = moduleFactory.create(this.injector);
            const compFactory = ngModuleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
            // 這裡的selector 就會跟 app-root 一樣
            if (document.querySelector(compFactory.selector)) {
              appRef.bootstrap(compFactory);
            }
          });
        }
      }
    }
  }
```

```html
   <app-root data-module-path="./lazy1/lazy1.module#Lazy1Module">
   </app-root>
   <app-root data-module-path="./lazy2/lazy2.module#Lazy2Module">
   </app-root>
```



# 參考資料

* [stackblitz live demo](https://stackblitz.com/edit/angular-ndkgan)
* [GitHub Repo](https://github.com/chgc/manual_load_module)
* [ngComponentOutlet](https://angular.io/api/common/NgComponentOutlet)
* [NgModuleFactoryLoader](https://angular.io/api/core/NgModuleFactoryLoader) 
* [SystemJsNgModuleLoader](https://angular.io/api/core/SystemJsNgModuleLoader)
* [Angular 2 in a multi-page application](https://blog.novatec-gmbh.de/angular-2-in-a-multi-page-application/)

