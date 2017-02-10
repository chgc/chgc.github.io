---
layout: post
title: '[Angular] 學習筆記(1) - Techniques and practices for testing Angular 2'
comments: true
date: 2017-01-05 23:55:32
categories: Angular
tags: 
- Angular
- 學習筆記
---

這是Youtube影片([Techniques and practices for testing Angular 2](https://youtu.be/RjrIK__PepU))的觀看筆記

這影片前半段是在介紹Angular2內可以使用的測試方法，由簡單的小範例逐一介紹各方法

<!-- more -->

# 影片筆記

## 工具

* karma - test runner

* jasmine - test library

  ```typescript
  // syntax example
  describe('Component: payment', ()=>{
    it('should instantiate a component', ()=>{
      execpt(1+1).toEqual(2);
    })
    it('should instantiate a component', ()=>{
      execpt(1+1).toEqual(2);
    })
  })
  ```

* [wallaby.js](https://wallabyjs.com/) - not free

  display unit test result and status inline the code.

* angular-cli

  * has test ability build-in
  * test command 
    * ng test
    * ng e2e

* protractor(e2e)

## 為什麼要測試

因為越來愈多的商業邏輯都往前端走，所以前端的測試就越來越重要了



## 測試的種類

- Unit tests: Test certain functions, areas of units of code

- e2e test: Runs the real application in the browser and simulateds user behavior

  ​



## Unit Tests的型態

1. Isolated:

   1.  No HTML template

2. Shallow: 
   1. HTML template
   2. No Child components

3. integrated
   1. Test the entire app

      ​



## Isolated tests

* jasmine test file is : *.spec.ts(js)

```typescript
describe('Component: payment component', ()=>{
  it('should add numbers correctly', ()=>{
    execpt(1+1).toEqual(2);
  })
  ...
})
```

```typescript
import { PaymentComponent } from './payment.component';

describe('Component: payment component', ()=>{
  it('should have correct title', ()=>{
     const component = new PaymentComponent(null);
    execpt(component.formTitle).toEqual('Payment Form');
  });
  
  // this is something should test
  it('should return validate valid credit card number', ()=>{
    const component = new PaymentComponent(null);
    let regex = new RegExp(component.CREDIT_CARD_NUMBER_PATTERN);
    let result = regex.test('aa');
    execpt(result).toEqual(true);
  })
})
```



## Shollow tests - Mocking and Spy's

- Mock Service

  ```
  mockPaymentService = {
    processPayment : ()=>{};
  }
  ```

- Jasmine Spy

  - spyOn(Object, 'method name')
  - .and.
  - except(spy).toHaveBeenCalled, etc.

```typescript
import { PaymentComponent } from './payment.component';

describe('Component: payment component', ()=>{
  let component: PaymentComponent;
  mockPaymentService: any;
  
  beforeEach(()=>{
    mockPaymentService = {
      processPayment: ()=>{
        
      }
    }
    component = new PaymentCompoent(mockPaymentService);
  })
  ...
  
  it('should call the payment service.processmethod on submit',()=>{
	let spy = spyOn(mockPaymentService, 'processPayment');
    commponent.processPayment(); // => method to run PaymentService.processPayment
    except(spy).toHaveBeenCalled();
  })  
})

```



## Shollow test - TestBed and Dom access

```typescript
// 基本設定
TestBed.configureTestingModule({
  declarations:[
    PaymentComponent
  ],
  imports:[
    FormsModule
  ],
  pvoiders:[
    {provide: PaymentService, useValue: mockPaymentService}
  ]
});
// 基本用法
fixgure = TestBed.createComponent(PaymentComponent);
component = fixture.componentInstance;
mockPaymentService = TestBed.get(PaymentServie);

// 取得template內某一個物件的nativeElement(HTMLElement)
let nativeButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;

```

範例程式

```typescript
import { PaymentComponent } from './payment.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

describe('Component: payment component', ()=>{
  let component: PaymentComponent;
  let mockPaymentService: any;
  let fixture: ComponentFixture<PaymentComponent>;
  
  beforeEach(()=>{
    mockPaymentService = {
      processPayment: ()=>{
        
      }
    }
    
  	TestBed.configureTestingModule({
      declarations:[
        PaymentComponent
      ],
      imports:[
        FormsModule
      ],
      providers:[
        {provide: PaymentService, useValue: mockPaymentService}
      ]
  	})
    
    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    mockPaymentSerivce = TestBed.get(PaymentService);
  })
  ...
  it('should purchase button enabled if credit card valid',()=>{
	component.payment.creditCardNumber = '1234123412341234';
    fixture.detectChanges();
    let nativeButtonElement = fixture.debugElement.query(By.css('button'))
                                     .nativeElement;
    // 等非同步動作完成後
    fixture.whenStable().then(()=>{
      // 重新觸發detectChanges()
	  fixture.detectChanges();
      execpt(nativeButtonElement.disabled).toEqual(false);
    })
  })  
})
```



## e2e 

```typescript
import { element, by, browser } from 'protractor';

describe('page: payment Form',async ()=>{
  it('should a active button with a valid form',()=>{
    browser.get('./');
    
    element(by.css('input')).sendKeys('1234123412341234');
    
    let submitButton = element(by.css('button'));
    let isDisabled = await submitButton.getAttribute('disabled'); // return promise;
    except(isDisabled).toEqual(null);
  })
});
```



# 其他筆記

## 設定wallaby.js環境

1. 在專案下新增wallaby.js檔案

   ```typescript
   var wallabyWebpack = require('wallaby-webpack');

   var webpackPostprocessor = wallabyWebpack({
     entryPatterns: [
       'src/wallabyTest.js',
       'src/**/*spec.js'
     ],

     module: {
       loaders: [
         {test: /\.css$/, loader: 'raw-loader'},
         {test: /\.html$/, loader: 'raw-loader'},
         {test: /\.js$/, loader: 'angular2-template-loader', exclude: /node_modules/},
         {test: /\.json$/, loader: 'json-loader'},
         {test: /\.styl$/, loaders: ['raw-loader', 'stylus-loader']},
         {test: /\.less$/, loaders: ['raw-loader', 'less-loader']},
         {test: /\.scss$|\.sass$/, loaders: ['raw-loader', 'sass-loader']},
         {test: /\.(jpg|png)$/, loader: 'url-loader?limit=128000'}
       ]
     }
   });

   var compilerOptions = require('./src/tsconfig.json').compilerOptions;

   module.exports = function (wallaby) {

     return {
       files: [
         {pattern: 'src/**/*.ts', load: false},
         {pattern: 'src/**/*.d.ts', ignore: true},
         {pattern: 'src/**/*.css', load: false},
         {pattern: 'src/**/*.html', load: false},
         {pattern: 'src/**/*spec.ts', ignore: true}
       ],

       tests: [
         {pattern: 'src/**/*spec.ts', load: false}
       ],

       testFramework: 'jasmine',

       compilers: {
         '**/*.ts': wallaby.compilers.typeScript(compilerOptions)
       },

       postprocessor: webpackPostprocessor,

       setup: function () {
         window.__moduleBundler.loadTests();
       },

       debug: true
     };
   };
   ```

2. 在 `src`資料夾下新增  `wallabyTest.ts`

   ```typescript
   import './polyfills.ts';

   import 'zone.js/dist/long-stack-trace-zone';
   import 'zone.js/dist/proxy.js';
   import 'zone.js/dist/sync-test';
   import 'zone.js/dist/jasmine-patch';
   import 'zone.js/dist/async-test';
   import 'zone.js/dist/fake-async-test';
   ```


   var testing = require('@angular/core/testing');
   var testingBrowser = require('@angular/platform-browser-dynamic/testing');

   testing.getTestBed().initTestEnvironment(
       testingBrowser.BrowserDynamicTestingModule,
       testingBrowser.platformBrowserDynamicTesting());
   ```

3. 執行 `npm install wallaby-webpack angular2-template-loader --save-dev`.

4. 在Visual Studio Code安裝Wallaby.ts的Extension

5. 執行Wallaby




   ```