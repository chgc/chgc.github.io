---
layout: post
title: '[Angular] Angular 4 - Universal with Asp.Net Core'
comments: true
date: 2017-03-26 14:51:07
categories: Angular
tags: Angular
---

Angular 4 將 Universal 的功能整合到 `@angular/platform-server` 裡，而至目前(2017/3/26) dotnet cli 所提供的 SPA 樣板尚未更新至最新版，如果在這個時間點想要更新到最新版時，就需要手動更新部分的檔案內容，這篇文章就是這描述這些異動，或是在未來的時間，就不需要這麼麻煩了

<!-- more -->

# 引言
以下的操作步驟，有可能在未來的版本更新後就不需要了，請詳閱相關的說明文件。

# 步驟1: package.json

手動更新 package.json 的內容

## scripts

```typescript
"scripts": {
    "test": "karma start ClientApp/test/karma.conf.js",
    "postinstall": "npm run build:webpack",
    "build:webpack": "npm run webpack-vendor && npm run webpack",
    "webpack": "webpack --progress",
    "webpack-vendor": "webpack --config webpack.config.vendor.js --progress"
 }
```

## Dependencies

### 替換

```typescript
"@angular/common": "^2.4.5",
"@angular/compiler": "^2.4.5",
"@angular/core": "^2.4.5",
"@angular/forms": "^2.4.5",
"@angular/http": "^2.4.5",
"@angular/platform-browser": "^2.4.5",
"@angular/platform-browser-dynamic": "^2.4.5",
"@angular/platform-server": "^2.4.5",
"@angular/router": "^3.4.5",
```

將上列的 @angular 模組的版本更換成下列的版本

```typescript
"@angular/animations": "^4.0.0",
"@angular/common": "^4.0.0",
"@angular/compiler": "^4.0.0",
"@angular/compiler-cli": "^4.0.0",
"@angular/core": "^4.0.0",
"@angular/forms": "^4.0.0",
"@angular/http": "^4.0.0",
"@angular/platform-browser": "^4.0.0",
"@angular/platform-browser-dynamic": "^4.0.0",
"@angular/platform-server": "^4.0.0",
"@angular/router": "^4.0.0",
"@angular/tsc-wrapped": "^0.5.0",
```

### 移除

```typescript
"angular2-platform-node": "~2.0.11",
"angular2-universal": "^2.1.0-rc.1",
"angular2-universal-patch": "^0.2.1",
"angular2-universal-polyfills": "^2.1.0-rc.1",
```



# 步驟2: webpack.config.vendor.ts

## 移除

將下列的兩項 library 給刪除掉

```typescript
entry: {
            vendor: [
                'angular2-universal',
                'angular2-universal-polyfills',
              ]
}
```




# 步驟3: 異動 ClientApp 

## 異動

### boot-client.ts

```typescript
import './polyfills/browser.polyfills';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppBrowserModule } from './app/browser-app.module';

const rootElemTagName = 'app'; // Update this if you change your root component selector

// Enable either Hot Module Reloading or production mode
if (module['hot']) {
    module['hot'].accept();
    module['hot'].dispose(() => {
        // Before restarting the app, we create a new root element and dispose the old one
        const oldRootElem = document.querySelector(rootElemTagName);
        const newRootElem = document.createElement(rootElemTagName);
        oldRootElem.parentNode.insertBefore(newRootElem, oldRootElem);
        platform.destroy();
    });
} else {
    enableProdMode();
}

// Boot the application, either now or when the DOM content is loaded
const platform = platformBrowserDynamic();
const bootApplication = () => { platform.bootstrapModule(AppBrowserModule); };
if (document.readyState === 'complete') {
    bootApplication();
} else {
    document.addEventListener('DOMContentLoaded', bootApplication);
}
```

* 移除 `import 'angular2-universal-polyfills/browser'`
* 移除 `import { platformUniversalDynamic } from 'angular2-universal';`
* 新增 `import './polyfills/browser.polyfills';`
* 新增 `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';`
* 修正 `platform` 的建立方式，從 `platformUniversalDynamic` 更換成  `platformBrowserDynamic`
* 修正 bootstrapMoudle，從 `AppModule` 更換成 `AppBrowserModule`

### boot-server.ts

```typescript
import './polyfills/server.polyfills';
import { enableProdMode } from '@angular/core';
import { INITIAL_CONFIG } from '@angular/platform-server';
import { createServerRenderer, RenderResult } from 'aspnet-prerendering';
// Grab the (Node) server-specific NgModule
import { AppServerModule } from './app/server-app.module';
// Temporary * the engine will be on npm soon (`@universal/ng-aspnetcore-engine`)
import { ngAspnetCoreEngine } from './polyfills/temporary-aspnetcore-engine';

enableProdMode();

export default createServerRenderer(params => {

    // Platform-server provider configuration
    const providers = [{
        provide: INITIAL_CONFIG,
        useValue: {
            document: '<app></app>', // Our Root application document
            url: params.url
        }
    }];

    return ngAspnetCoreEngine(providers, AppServerModule).then(response => {
        return ({
            html: response.html,
            globals: response.globals
        });
    });
});
```

### app/app.module.ts

```typescript
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';

import { AppComponent } from './components/app/app.component'
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { FetchDataComponent } from './components/fetchdata/fetchdata.component';
import { CounterComponent } from './components/counter/counter.component';

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        NavMenuComponent,
        CounterComponent,
        FetchDataComponent,
        HomeComponent
    ],
    imports: [
        CommonModule,
        HttpModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'counter', component: CounterComponent },
            { path: 'fetch-data', component: FetchDataComponent },
            { path: '**', redirectTo: 'home' }
        ])
    ]
})
export class AppModule {
}

```

* 移除 `UniversalModule`
* 移除 `bootstrap` 區塊
* 新增 `CommonModule`、`HttpModule`



## 新增檔案

### browser-app.module.ts

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppModule } from './app.module';
import { AppComponent } from './components/app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule.withServerTransition({
            appId: 'my-app-id'
        }),
        AppModule
    ]
})
export class AppBrowserModule {
}
```

### server-app.module.ts

```typescript
import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule  } from '@angular/platform-browser/animations';

import { AppModule } from './app.module';
import { AppComponent } from './components/app/app.component';


@NgModule({
    bootstrap: [ AppComponent ],
    imports: [
        NoopAnimationsModule,
        BrowserModule.withServerTransition({
            appId: 'my-app-id'
        }),
        ServerModule,
        AppModule
    ]
})
export class AppServerModule {   
}
```

### polyfills/temporary-aspnetcore-engine.ts

```typescript
/*  ********* TEMPORARILY HERE **************
 * - will be on npm soon -
 *   import { ngAspnetCoreEngine } from `@universal/ng-aspnetcore-engine`;
 */

import { Type, NgModuleRef, ApplicationRef, Provider } from '@angular/core';
import { platformDynamicServer, PlatformState } from '@angular/platform-server';

export function ngAspnetCoreEngine(
    providers: Provider[],
    ngModule: Type<{}>
): Promise<{ html: string, globals: { styles: string, title: string, meta: string, [key: string]: any } }> {

    return new Promise((resolve, reject) => {

        const platform = platformDynamicServer(providers);

        return platform.bootstrapModule(<Type<{}>>ngModule).then((moduleRef: NgModuleRef<{}>) => {

            const state: PlatformState = moduleRef.injector.get(PlatformState);
            const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

            appRef.isStable
                .filter((isStable: boolean) => isStable)
                .first()
                .subscribe((stable) => {

                    // Fire the TransferCache
                    const bootstrap = moduleRef.instance['ngOnBootstrap'];
                    bootstrap && bootstrap();

                    // The parse5 Document itself
                    const AST_DOCUMENT = state.getDocument();

                    // Strip out the Angular application
                    const htmlDoc = state.renderToString();
                    console.log(htmlDoc);
                    const APP_HTML = htmlDoc.substring(
                        htmlDoc.indexOf('<body>') + 6,
                        htmlDoc.indexOf('</body>')
                    );

                    // Strip out Styles / Meta-tags / Title
                    const STYLES = [];
                    const META = [];
                    const LINKS = [];
                    let TITLE = '';

                    const STYLES_STRING = htmlDoc.substring(
                        htmlDoc.indexOf('<style ng-transition'),
                        htmlDoc.lastIndexOf('</style>') + 8
                    );

                    // console.log(AST_DOCUMENT);

                    const HEAD = AST_DOCUMENT.head;

                    let count = 0;

                    for (let i = 0; i < HEAD.children.length; i++) {
                        let element = HEAD.children[i];

                        console.log(element.name);
                        console.log(element.children);


                        if (element.name === 'title') {
                            TITLE = element.children[0].data;
                        }

                        // Broken after 4.0 (worked in rc)
                        // if (element.name === 'style') {
                        //     let styleTag = '<style ';
                        //     for (let key in element.attribs) {
                        //         styleTag += `${key}="${element.attribs[key]}">`;
                        //     }

                        //     styleTag += `${element.children[0].data}</style>`;
                        //     STYLES.push(styleTag);
                        // }

                        if (element.name === 'meta') {
                            count = count + 1;
                            console.log(`\n\n\n ******* Meta count = ${count}`);
                            let metaString = '<meta';
                            for (let key in element.attribs) {
                                metaString += ` ${key}="${element.attribs[key]}"`;
                            }
                            META.push(`${metaString} />\n`);
                        }

                        if (element.name === 'link') {
                            let linkString = '<link';
                            for (let key in element.attribs) {
                                linkString += ` ${key}="${element.attribs[key]}"`;
                            }
                            LINKS.push(`${linkString} />\n`);
                        }
                    }

                    resolve({
                        html: APP_HTML,
                        globals: {
                            styles: STYLES_STRING,
                            title: TITLE,
                            meta: META.join(' '),
                            links: LINKS.join(' ')
                        }
                    });

                    moduleRef.destroy();

                });
        }).catch(err => {
            reject(err);
        });

    });
}
```

### polyfills/browswer.polyfills.ts

```typescript
import 'zone.js/dist/zone';
import 'reflect-metadata';

import './rx-imports';
```

### polyfills/server.polyfills.ts

```typescript
import 'es6-promise';
import 'es6-shim';
import 'reflect-metadata';

import 'zone.js';

import './rx-imports';
```

### polyfills/rx-imports.ts

```typescript
/* -=- RxJs imports -=-
 * 
 * Here you can place any RxJs imports so you don't have to constantly 
 * import them throughout your App :)
 */

// Observable
import 'rxjs/Observable';
import 'rxjs/Observable/throw';

// Subject
import 'rxjs/Subject';

// Operators
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
```



# 步驟四: npm install

重新執行 `npm install`，由於我們在一開始有新增一個 `postinstall`的工作，所以在安裝完後，npm 會跟著執行我們所設定的動作。



# 步驟五: dotnet run

重新將 asp.net core 跑起來，看看有沒有發生什麼錯誤



------
# 結論

以上就是手動升級需要異動的項目，希望之後 SPA Template 更新後，就不需要這麼麻煩了。

