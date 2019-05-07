---
layout: post
title: '[NestJS] Pipe - Day 04'
comments: true
typora-root-url: 2019-05-07-nestjs-pipe/
typora-copy-images-to: 2019-05-07-nestjs-pipe/
date: 2019-05-07 23:21:36
categories: Angular
tags:
- Angular
- NestJS
---

昨天提到 `Exception Filter`，今天來談談 `Pipe`，`Pipe` 在 `NestJS` 裡面有兩個比較常見的使用情境， 1. 轉型 2. 驗證。至於怎麼完成呢?

<!-- more -->

根據官網的圖，`Pipe` 是落在這一個象限內。
![Pipe_1](/Pipe_1.png)

而常見的使用情境有

1. 轉型 (Transformation)
2. 驗證 (Validation)

# 建立與註冊

CLI 指令

```
nest g pi <pipe name>
```

```typescript
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}

```

是否有一種熟悉的感覺，就跟 Angular 的 Pipe 語法很類似，沒錯，基本上就是類似的運行方式，而註冊方式與註冊 `Exception Filter` 雷同

```typescript
...
@Controller('products')
export class ProductsController {
  @Post()
  @UsePipes(ValidatePipe)
  create(@Body('some data') body: ProductModel, @Res() response: Response) {
    return response.status(HttpStatus.CREATED).send(body);
  }
  ...
}

```

# Pipe 詳解

```typescript
transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
```

`transform` 函式內有兩個參數，一個是`value` 另一個是 `metadata`，以下為 `metadata` 的格式

```typescript
export interface ArgumentMetadata {
  readonly type: 'body' | 'query' | 'param' | 'custom';
  readonly metatype?: Type<any>;
  readonly data?: string;
}
```

實際取得的資訊如下

![1557243358947](1557243358947.png)

重新看一下使用 `Pipe` 的 Controller

```typescript
  @Post()
  @UsePipes(ValidatePipe)
  create(@Body('abc') body: ProductModel, @Res() response: Response) {
    return response.status(HttpStatus.CREATED).send(body);
  }
```

* `@Body()` :  `@Body`可設定要從 `Body` 取哪一個值，類似 pluck 的功能，而相關的資訊會顯示在 Pipe 的 metadata.data，但必須為文字，如果不傳，metadata 的 data 會收到 `undefined`，
* 參數型別，`body: ProductModel` ，後面的型別會顯示在 `metatype` 上,
* `metadata.type` 會顯示接受到的資料是來自哪裡

既然可以取道完整的資料，就可以做到轉型或是驗證的功能。轉型比較簡單，我們先來看怎麼做

## 轉型

其實就將要改變的資料回傳回去就可以了

![1557244166904](1557244166904.png)

![1557244186484](1557244186484.png)

## 驗證

既然能轉型，就能做到驗證，因為驗證資料格式的方法有很多種，這裡我們就簡單示範一下

![1557244358019](1557244358019.png)

執行結果

![1557244390580](1557244390580.png)

![1557244418440](1557244418440.png)



# 結論

官方也有提供一些內建的 Pipe 可以直接使用，例如 `ValiationPipe` 和 `ParseIntPipe` ，至於詳細的用法，可以參考官方文件 ([連結在此](https://docs.nestjs.com/pipes#the-built-in-validationpipe))，真的可以花點時間看一下 `ValidationPipe` 的部分，可以省去不少資料驗證的工作

# 參考資料

* [官方文件](https://docs.nestjs.com/pipes)



