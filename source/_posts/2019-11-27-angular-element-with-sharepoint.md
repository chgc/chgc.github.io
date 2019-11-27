---
layout: post
title: '[Angular] Angular Element as SharePoint WebPart'
comments: true
typora-root-url: 2019-11-27-angular-element-with-sharepoint
typora-copy-images-to: 2019-11-27-angular-element-with-sharepoint
date: 2019-11-27 14:33:26
categories: Angular
tags: 
- Angular
- O365
---

Angular Element 的使用情境是什麼? 關於這個問題的答案有很多，在去年年初(2018/2) Angular 團隊的 Rob 在 歐洲一場 SharePoint 的活動內介紹了這一段， [影片](https://youtu.be/qdC1SVdLM3c)，SharePoint 這產品在台灣除了一些大公司或是老公司中還可以看到外，基本上很難在聽到他的名字，可是在國外，SharePoint 還是有很多使用者的。而 WebPart 允許我們使用不同的技術 + sharepoint 提供的 sdk 來做畫面顯示及資料串接。

<!-- more -->

當然我們也可以使用 HTML + CSS + JavaScript 才做到這件事情，而有一群使用 SharePoint 的社群推出一套基於 `@microsoft/generator-sharepoint` 的 yeoman ，擴充出來的另外一個 SharePoint 套件，`@pnp/generator-spfx`，這一個產生器內支援了 Angular / Vue / React 等前端框架，裡用這些框架來開發 SharePoint 的 WebPart / extendsion / library 等，這一篇筆記就是來記錄如何使用 `@pnp/generator-spfx` 來建立第一個 Angular Element as WebPart in SharePoint

# 環境要求

* node 版本: 10.x 版 。很重要， 目前  `@microsoft/generator-sharepoint` 還不支援 Node 12.x 版，會在 `node-sass` 的地方壞掉
* `yeoman` 套件
* `gulp` 工具
* `Angular CLI` 版本: 6、7、8，但這邊我們可以手動修改讓他支援 9 版

# 工具安裝

```
npm i -g yo gulp @pnp/generator-spfx
```

這邊假設以經安裝過 `@angular/cli` 了

# 建立專案

1. 建立一個空的資料夾並進入到該資料夾

2. 執行 `yo` 指令

   ![image-20191127145057422](image-20191127145057422.png)

3. 選擇 `@pnp/spfx` 產生器

4. 選擇要建立的範本，這邊先選取 `SharePoint Online only` 

   ![image-20191127145153250](image-20191127145153250.png)

5. 選擇要使用的前端框架

   ![image-20191127145248584](image-20191127145248584.png)

   * 假設看到 Angular Elements 是 Disabled 狀態時，這是因為安裝的 `@angular/cli` 版本沒有落在 `@pnp/generator-spfx` 內所設定的 `@angular/cli` 版本，這裡需要手動去改一下程式，修改步驟如下

   * windows 版可以到 `  %UserProfile%\AppData\Roaming\npm\node_modules\@pnp\generator-spfx` 資料夾下，修改以下檔案

     * `app/promptConfig.js` ，約 第19 行的地方，新增 `||  ngVersion.version.startsWith('9')`

       ```javascript
       // support for Angular 6/7/8
               if (ngVersion.version.startsWith('6') ||
                   ngVersion.version.startsWith('7') ||
                   ngVersion.version.startsWith('8') || 
                   ngVersion.version.startsWith('9')) { 
       
                   angularVersion = ` (uses @angular/cli ${ ngVersion.version})`;
       
                   return false;
               };
       ```

     * `generators/angularelements/index.js` 約第 83 行的地方，新增 `||  ngVersion.version.startsWith('9')`，記得要將第二段的條件用小括弧包起來

       ```javascript
       if (ngVersion.version !== undefined &&
                   (ngVersion.version.startsWith("8")|| 
                   ngVersion.version.startsWith('9'))) {
           ...
       }    
       ```

   * 完成後，重新執行步驟二，執行 `yo`，就可以看到 Angular Elements 被開啟了

     ![image-20191127150220003](image-20191127150220003.png)

6. 選擇是否安裝其他 Library，預設 Enter 下一步

   ![image-20191127150329720](image-20191127150329720.png)

7. 選擇 TypeScript 版本，我本身是喜歡越新版的 TypeScirpt 越好

   ![image-20191127150407163](image-20191127150407163.png)

8. 其他檢查套件安裝，直接 Enter 下一步

   ![image-20191127150435725](image-20191127150435725.png)

9. 是否安裝 pipeline 設定，Enter 下一步

   ![image-20191127150524771](image-20191127150524771.png)

10. 開始設定專案相關資訊，就依畫面上提示的輸入即可

    ![image-20191127150631222](image-20191127150631222.png)

11. 進入 SharePoint 專案的設定階段，基本上都是依文字說明選擇自己要的設定，但當第二個問題 Enter 下一步後，會停住

     ![img](/SNAGHTML474593cc.PNG) 

     這邊理論上會問專案要建立在**目前的資料夾**呢，還是**建立新的資料夾**，不確定為什麼會空白，在多按一次 Enter 就會繼續往下走，而專案會建立在目前所在的資料夾內

12. 選擇要建立的 component 類型，選擇 `WebPart` 後 Enter 下一步

    ![image-20191127151023184](image-20191127151023184.png)

13. 輸入 `WebPart` 的名稱等相關資訊

    ![image-20191127151153037](image-20191127151153037.png)

14. 接下來就是漫長的安裝過程

    ![image-20191127152652831](image-20191127152652831.png)

15. 完成後，可以檢視目前的資料夾，會有兩個資料夾，一個是 Angular 專案，一個是 SPFx 專案。

16. 最後，如果從沒有安裝過開發憑證，可先進入 SPFx 專案資料夾內，執行 `gulp trust-dev-cert`

    ![image-20191127153041838](image-20191127153041838.png)

17. 測試是否有安裝成功，需要執行以下兩個步驟

    1. 進入 Angular  專案資料夾，執行 `npm run bundle` 指令

    2. 進入 SPFx  專案資料夾，執行 `gulp serve` ，看看是否能正常地啟動起測試用的網頁

       ![image-20191127153736116](image-20191127153736116.png)

       ![image-20191127153750416](image-20191127153750416.png)

       能看到這些畫面，就代表環境及專案都建立成功了，就可以往下一階段進行了



# 程式碼架構

## Angular 專案

採用 Angular Element 的方式來完成，所以在 `app.module.ts` 的地方可以看到註冊 custom Element  的程式碼

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { HelloWorldWebPartComponent } from './hello-world-web-part/hello-world-web-part.component';

@NgModule({
  declarations: [
    HelloWorldWebPartComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  entryComponents: [HelloWorldWebPartComponent]
})
export class AppModule {
  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    const el = createCustomElement(HelloWorldWebPartComponent, { injector: this.injector });
    customElements.define('app-hello-world-web-part', el);
  }
}

```

* Component 本身的 Selector 只會在 Angular 內部環境生效，對外是吃 customElements 這邊定義的名稱
* 如果是 Angular CLI 的版本，第 15 行的 `entryComponents` 可以不用在寫了 (可移除)

## SPFx 專案

 `src/webparts/helloWorld` 資料夾內是我們要看的部分

### webpart

* `HelloWorldWebPart.ts`

```typescript
import "ng-element-webpart/dist/ngElementWebpart/bundle"; // 引用 Angular 建置 bundle 出來的檔案

export default class HelloWorldWebPart extends BaseClientSideWebPart<
  IHelloWorldWebPartProps
> {
  public render(): void {
    this.domElement.innerHTML = `<app-hello-world-web-part description="${this.properties.description}"></app-hello-world-web-part>`;
  }
  ...
}  
```

* `render` 是用來顯示 WebParts 畫面的方法

另外一種寫法

```typescript
export default class HelloWorldWebPart extends BaseClientSideWebPart<
  IHelloWorldWebPartProps
> {
  public render(): void {
    const baseEl = customElements.get("app-hello-world-web-part");
    const element = new baseEl();
    element.description = this.properties.description;
    this.domElement.appendChild(element);
  }
    ...
}
```

 WebParts 屬性的設定

```typescript
export default class HelloWorldWebPart extends BaseClientSideWebPart<
  IHelloWorldWebPartProps
> {
...

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
....
}
```

* 這邊程式碼的寫法有支援 i18n 多國語系，要搭配 loc 資料夾內的檔案一起看，有興趣的可以去對應一下

### manifest.json

* `HelloWorldWebPart.manifest.json` WebPart 在 SharePoint  內要顯示的資訊設定檔

  ```json
  ...
  
    "preconfiguredEntries": [
      {
        "groupId": "5c03119e-3074-46fd-976b-c60198311f70", // Other
        "group": { "default": "Other" },
        "title": { "default": "HelloWorld-2" }, // 顯示在 WebParts 清單內的名稱
        "description": { "default": "HelloWorld description" },
        "officeFabricIconFontName": "Page",
        "properties": {
          "description": "HelloWorld-2" // 屬性預設值
        }
      }
    ]
  
  ```

  

# 參考資料

* [PnP/generator-SPFx - Angular Elements]( https://pnp.github.io/generator-spfx/howtos/angularelements/ )