---
layout: post
title: '[Angular] Capacitor'
comments: true
date: 2018-04-02 23:26:02
categories: Angular
tags: Angular
---

什麼是 Capacitor ? Capacitor 是 Ionic 團隊所開發出來的新開發框架，再次證明他們的野心

> Capacitor is a cross-platform app runtime that makes it easy to build web apps that run natively on iOS, Android, Electron, *and* the web. We call these apps "Native Progressive Web Apps" and they represent the next evolution beyond Hybrid apps.

但是否如他們所說的那麼強大呢? 一定要動手玩看看才知道

<!-- more -->

# 測試步驟

1. 透過 Angular CLI 建立一個標準的 Angular 專案

   ` ng new appCapacitor`

2. 在 Angular 專案資料夾下，安裝 `@capacitor/core` 和 `@capacitor/cli`

   `npm install --save @capacitor/core @capacitor/cli`

3. 執行 `Capacitor` 初始化，這動作會建立一個 json 的設定檔

   `npx cap init`

   1. 如果不知道 `npx` 是什麼的，請參閱這篇[文章](https://robin-front.github.io/2017/07/14/introducing-npx-an-npm-package-runner/)
   2. 輸入一些基本資料後，即完成設定動作，完成後的畫面如下

   ![](https://i.imgur.com/2apRkeu.png)

4. 配合 Angular CLI 的建置輸出路徑修改 `capacitor.config.json` 檔案

   ```json
   {
     "appId": "cky.demo.app",
     "appName": "App",
     "bundledWebRuntime": false,
     "webDir": "dist"
   }
   ```

5. 開始第一次 `build —prod`

6. 因為第一次想用 PWA 的方式呈現，可透過 `npx cap serve` 來啟動 web server

   1. 如果想要跑成 iOS 的格式，指令為 `npx cap open ios` (需要有 xcode 才可以跑)
   2. 如果想要跑成 Android 的格式，指令為 `npx cap open android`

7. 跑起來的畫面就跟預設的畫面是一樣的，只是網址變成 `http://localhost:3333`

   ![](https://i.imgur.com/ExGjmJY.png)

# 使用套件(Plugin)

來試試看現成的 Geolocation API (內建的) 能不能正常使用，在程式碼上會不會很難處理

因為已經有裝 `@capacitor/core`，所以可以透過 `import { Plugin } from '@capacitor/core'` 來取得現有內建的 [API](https://capacitor.ionicframework.com/docs/apis/)

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Observable } from 'rxjs/Observable';
import { bindCallback } from 'rxjs/observable/bindCallback';
import { map } from 'rxjs/operators';

const { Geolocation, Modals, App } = Plugins;

@Component({
  selector: 'app-root',
  template: `
	<button (click)="currentLocation()">顯示目前位置</button>
	`,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  coords: Coordinates;
  ngOnInit() {
     App.addListener('backButton', () => {
      Plugins.App.exitApp();
    });
      
    this.watchPosition().subscribe(coords => {
      this.coords = coords;
    });
  }

  watchPosition(): Observable<any> {
    const watch = bindCallback(Geolocation.watchPosition)({});
    return watch.pipe(map(pos => pos.coords));
  }

  async currentLocation() {
    const position = await Geolocation.getCurrentPosition();
    Modals.alert({
      title: '目前位置',
      message: `lat: ${position.coords.latitude}, long: ${position.coords.longitude}`
    });
  }
}

```

* 利用 `bindCallback` 的方法將 api 轉換成 `Observable` 型別
* Chrome 在版本 50 以後就不允許 http 跑 Geolocation 了，所以如果要測試這段，這部分可能就要自己摸索了

# 部屬到 Android 設備上

假設 Android 開發環境已經準備好了 ( 使用 Android Studio )，Capacitor 只需要透過幾個指令，就可以將 Android 部屬目標加上去，以下是相關的指令及對應的功能

1. `npx cap add android` 將 `Android platform`  加入到目前的專案下 

   ![](https://i.imgur.com/e8QpqT9.png)

2. `npx cap sync` 同步 `dependency` 和 `web` 內容

3. `npx cap copy` 複製 `web` 內容

4. `npx cap open android` 開啟 `Android Studio` 並執行建置動作

* 如果 `Android Studio` 不是安裝在預設路徑下時，可以在 `capacitor.config.json` 內設定實際的安裝位置

  ```json
  {
   ...
    "windowsAndroidStudioPath": "D:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe"
  }

  ```

## 實際測試/部屬到 Android 

因為我們需要將網頁建置後的結果複製到 Android 的專案下，所以在執行 `npx cap sync` 之前，記得要做 `ng build --prod` 的動作

基本流程如下

1. `ng build --prod`  建置 web 專案
2. `npca cap sync` 同步 web 專案及 dependency 元建至 Android 專案下
3. `npx cap open android` 開啟 Android Studio 進行後續的測試部屬，如果 Android Studio 已經開啟時，就不需要執行這行指令

## 執行結果



# 總結

目前看起來 Ionic 的新架構 `Capacitor` 的確可以擺脫以前的 ionic 的開發方式，讓使用者用自己熟悉的 JavaScript framework 做開發，而不用侷限使用  Angular，個人還蠻期待後續的發展的



# 延伸閱讀 

* [ Capacitor Documentation](https://capacitor.ionicframework.com/docs/)
