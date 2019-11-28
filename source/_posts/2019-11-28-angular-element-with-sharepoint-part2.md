---
layout: post
title: '[Angular] Angular Element as SharePoint WebPart - Connect Data'
comments: true
typora-root-url: 2019-11-28-angular-element-with-sharepoint-part2
typora-copy-images-to: 2019-11-28-angular-element-with-sharepoint-part2
date: 2019-11-28 08:30:56
categories: Angular
tags:
- Angular
- O365
---

[上一篇]( https://blog.kevinyang.net/2019/11/27/angular-element-with-sharepoint/ ) 介紹了如何使用 Angular Element 建立 SharePoint 的 WebPart，但如果不串接資料，這功能就太弱了，所以這篇就來記錄一下，如何使用內建的方法來取得 SharePoint 或是 MS Graph 的資料

<!-- more -->

但由於使用 Graph API 需要在環境設定權限等，這篇就不做這部分的範例 (也找不到相關的資料.QQ)

要連接 SharePoint 的資料，我們可以透過 `@pnp` 的套件來完成，[官方說明文件]( https://pnp.github.io/pnpjs/documentation/getting-started/ )

# 安裝

可以使用的套件有這些，可以選擇安裝自己需要的部分即可

```
npm install @pnp/logging @pnp/common @pnp/odata @pnp/sp @pnp/graph --save
```

# 初始啟動

文件上有提供三種啟動方式，這裡我就舉其中一種方法，在 WebPart 的程式裡，加入這些程式碼

```javascript
  public onInit(): Promise<void> {
    return super.onInit().then(_ => {
      // other init code may be present
      sp.setup({
        spfxContext: this.context
      });
    });
  }
```

# 取 SharePoint 資料

在 Angular Element Component 單純使用 `@pnp/sp` 包裝好的 api，就可以很輕鬆地取得相關的資訊

```typescript
import { sp } from '@pnp/sp';
...
ngOnInit() {
    this.webLists = sp.web.lists.get();
}
```

```html
<ul>
  <li *ngFor="let item of webLists | async">
    {{ item.Title }}
  </li>
</ul>
```

更多 `@pnp/sp` Library API 可以閱讀[此文件]( https://pnp.github.io/pnpjs/sp/docs/ )

# 測試

由於 `@pnp/sp` 內有包 `context` 這物件，而這物件只有在真正的 `SharePoint` 環境才會存在，那我們也不可能每次都要打包上傳到正式環境，基於這裡由。其實在當執行 `gulp serve` 時，除了本機會啟動一個測試用的環境外，也會試著遠端連線到 SharePoint Server (不確定這邊的原理是什麼)，但可以透過開啟 ` https://{sharepoint-site-name}.sharepoint.com/_layouts/15/workbench.aspx ` 來進行遠端測試

![image-20191128111304460](image-20191128111304460.png)

可以看到正式環境擁有的 App，當然也可以找到我們正在寫的 WebPart，找到後加入到頁面上，就可以看到撈出來的資料有正常的顯示到畫面上了

![image-20191128111415289](image-20191128111415289.png)

# 小結

這段我其實卡很久，都卡在 context 為什麼都取不到，結果後來發現要使用遠端的測試環境，就可以正常地做到測試了。

另外還是想要解決的是使用 Graph API 這段，因為我們可以透過 MS Graph API 取到更多 O365 上有的資訊



# 參考資料

[Connect your client-side web part to SharePoint (Hello World part 2)]( https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/connect-to-sharepoint )