---
layout: post
title: '[Angular] 自訂 Decorator 使用範例'
comments: true
typora-root-url: 2022-06-11-angular-custom-decorators-demo
typora-copy-images-to: 2022-06-11-angular-custom-decorators-demo
date: 2022-06-11 16:21:54
categories: Angular
tags: Angular
---

距離上一篇關於 decorator 的文章已經是 2017 一月份的事情了，時間過真快，那時候來不知道能拿 decorator 做什麼，現在終於有一個還不錯的使用情境

<!-- more -->

## 讓程式碼講話

開發 app 有時候會希望記錄某功能的使用量，常見的作法就是打一發 API 做記錄的動作，而這其實是可以透過 decorator 的方式封裝起來，然後讓任何需要記錄的 function 使用，以下就用程式碼說話了

```typescript
import { AppModule } from '../app.module';
import { LogService } from '../my-feature/log.service';

export function Logger(typeName: string) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const service = AppModule?.injector?.get(LogService);
      if (!!service) {
        service.recordUsage(typeName);
      }
    };

    return originalMethod.apply(this, arguments);
  };
}

```

- line 4: 如果想要 decorator 能接受外部傳進來的值，就可以在這邊定義
- line 10: 保留被 decorated 的 function，等等在第 line 19 會用到
- line 12: 覆寫原本的 function
- line 13: 從 `AppModule` 取得 injector，可透過 injector 拿到有註冊到 `RootModule`的 service
- line 19: 繼續執行原本 function 的行為

```typescript
...
export class AppModule {
  static injector: Injector;
  constructor(injector: Injector) {
    AppModule.injector = injector;
  }
}
```

- 建立一個 static 變數讓自訂的 decorator 內可以使用

基本上，上面就已經完成了一個 Decorator 的開發了，當然那個 `logService` 就是自行發揮了

至於如何使用，範例如下

```typescript
  @Logger('AppComponent')
  c(msg: string) {
    console.info('clicked', msg);
  }
```



## 參考資料

- [TypeScript Decorator](https://www.typescriptlang.org/docs/handbook/decorators.html)
