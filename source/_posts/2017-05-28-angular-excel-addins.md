---
layout: post
title: '[Angular] 開發 Excel 增益集'
comments: true
date: 2017-05-28 20:52:12
categories: Angular
tags:
- Angular
- Office
---

Office 2016 的增益集，讓我們可以使用 javascript + html 來開發。既然可以使用 Jquery，那 Angular 應該是沒有問題的，這是使用 Angular 實作 Excel 增益集的筆記

<!-- more -->

# 建立 Angular 專案

使用 Angular CLI 建立新專案，如果有需要使用路由的，記得要將 `LocationStrategy` 設定為 `HashLocationStrategy`

## 安裝 @types

> npm install --save-dev @types/office-js

## main.ts

```typescript
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

declare const Office: any;

Office.initialize = function() {
  platformBrowserDynamic().bootstrapModule(AppModule);
};

```

`platformBrowser` 這段一定要包在 function() {..} 裡面。

## index.html

```html
... 
<script src="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-2.1.4.min.js"></script>
  <script src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js" type="text/javascript"></script>

  <link rel="stylesheet" href="https://appsforoffice.microsoft.com/fabric/1.0/fabric.min.css">
  <link rel="stylesheet" href="https://appsforoffice.microsoft.com/fabric/1.0/fabric.components.min.css">
...
```

新增這四行到 `<head>` 內

## app.component.ts

這裡的程式，我是先用官方提供的範例翻寫的。詳細的 API 部分，請參閱官方文件

```typescript
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import {ApplicationRef, Component} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '用Angular寫Excel Addin!!';
  data = [];

  constructor(private appRef: ApplicationRef, private http: Http) {}

  loadData() {
    return this.http.get('https://jsonplaceholder.typicode.com/posts')
        .map((res: Response) => res.json());
  }
  clickMe() {
    // Run a batch operation against the Excel object model
    this.loadData()
        .mergeMap(
            (data: any[]) => {return Observable.from(Excel.run((ctx) => {
              // Create a proxy object for the active worksheet
              const sheet: Excel.Worksheet =
                  ctx.workbook.worksheets.getActiveWorksheet();
              sheet.getRange().clear();
              // sheet.charts.items.forEach(c => c.delete());

              if (sheet) {
                // Queue commands to set the report title in the worksheet
                sheet.getRange('A1').values = [['Quarterly Sales Report']];
                sheet.getRange('A1').format.font.name = 'Century';
                sheet.getRange('A1').format.font.size = 26;
              }

              // Create an array containing sample data
              let values = [
                ['Product', 'Qtr1', 'Qtr2', 'Qtr3', 'Qtr4'],
                ['Frames', 5000, 7000, 6544, 4377],
                ['Saddles', 400, 323, 276, 651],
                ['Brake levers', 12000, 8766, 8456, 9812],
                ['Chains', 1550, 1088, 692, 853],
                ['Mirrors', 225, 600, 923, 544],
                ['Spokes', 6005, 7634, 4589, 8765]
              ];

              // Queue a command to write the sample data to the specified
              // range in the worksheet and bold the header row
              const range = sheet.getRange('A2:E8');
              range.values = values;
              sheet.getRange('A2:E2').format.font.bold = true;

              // Queue a command to add a new chart
              const chart = sheet.charts.add('ColumnClustered', range, 'auto');
              // Queue commands to set the properties and format the chart
              chart.setPosition('G1', 'L10');
              chart.title.text = 'Quarterly sales chart';
              chart.legend.position = 'right'
              chart.legend.format.fill.setSolidColor('white');
              chart.dataLabels.format.font.size = 15;
              chart.dataLabels.format.font.color = 'black';
              const points = chart.series.getItemAt(0).points;
              points.getItemAt(0).format.fill.setSolidColor('pink');
              points.getItemAt(1).format.fill.setSolidColor('indigo');

              const i = 12;
              this.data = data;
              values = data.reduce((preValue, d) => {
                return [...preValue, [d.userId, d.id, d.title, d.body]];
              }, []);

              sheet.getRange(`A${i + 1}:D${i + data.length}`).values = values;
              // Run the queued commands, and return a promise to indicate
              // task completion
              return ctx.sync();
            }))})
        .subscribe(
            () => {
              this.appRef.tick();
              console.log('Success!');
            },
            error => {

            });
  }
}
```

###  loadData()

這個 method 主要是用來驗證 CORS 的情況下， 是否還可以在 Excel 裡正常的運作。

### Excel.run

> Ｅxcel.run((ctx) => {　... }) 

這段是準備要在Excel上顯示的資料

### ctx.sync()

準備好的內容，更新同步到 Excel 的 activateSheet 上

------

到這邊為止，已經完成了 Angular 端最基本的環境設定

# 新增 Manifest.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
    <!--Created:cb85b80c-f585-40ff-8bfc-12ff4d0e34a9-->
    <OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="TaskPaneApp">
      <Id>534a9c82-e492-4b03-a0df-7e6e97815039</Id>
      <Version>1.0.0.0</Version>
      <ProviderName>Microsoft</ProviderName>
      <DefaultLocale>en-US</DefaultLocale>
      <DisplayName DefaultValue="Angular App Sample" />
      <Description DefaultValue="Angular App Sample"/>
      <Capabilities>
        <Capability Name="Workbook" />
      </Capabilities>
      <DefaultSettings>
        <SourceLocation DefaultValue="https://localhost:4200" />
      </DefaultSettings>
      <Permissions>ReadWriteDocument</Permissions>
    </OfficeApp>
```

Manifest 的進階說明，請參閱這篇[文件](https://dev.office.com/docs/add-ins/overview/add-in-manifests)



# Excel 的環境設定

要在 Excel 內新增我們自己開發的增益集，首先

1. 建立一個分享資料夾

2. 將設定好的 Manifest.xml 搬進去，記得每一個增益集的 manifest 檔名都要不一樣

3. 將分享資料夾的位置新增到 Excel 裡面去

   1. 檔案 --> 選項

      ![](https://farm5.staticflickr.com/4220/34905439666_74bcded75e_o.png)

   2. 信任中心

      ![](https://farm5.staticflickr.com/4222/34782185172_5d669b534e_o.png)

   3. 受信任的增益集目錄

      ![](https://farm5.staticflickr.com/4222/34782226082_c62009d9e7_o.png)

   4. 確定完成

4.  插入 -> 我的增益集 -> 共享資料夾 

   1. 可以看到自己寫的增益集了

      ![](https://farm5.staticflickr.com/4272/34905548796_0b4b678254_o.png)

   2. 選擇要安裝的增益集

      ![](https://farm5.staticflickr.com/4271/34813937441_7e6b889bf5_o.png)

5. 安裝完成後，即可看到所建立的增益集畫面在螢幕的右側出現

   ![](https://farm5.staticflickr.com/4222/34905598216_6213f0269e_o.png)

   這時右側的操作，就可以直接反應在左側 Excel 工作表內了。

   ![](https://farm5.staticflickr.com/4268/34135385293_2969d33e26_o.png)





# 參閱資料

* [Manifest]()
* [Tips for creating Office Add-ins with Angular 2](https://dev.office.com/docs/add-ins/develop/add-ins-with-angular2)
* [Excel JavaScript API programming overview](https://dev.office.com/docs/add-ins/excel/excel-add-ins-javascript-programming-overview)
* [Build your first Excel add-in](https://dev.office.com/docs/add-ins/excel/build-your-first-excel-add-in)
* [Office Add-ins XML manifest](https://dev.office.com/docs/add-ins/overview/add-in-manifests)

