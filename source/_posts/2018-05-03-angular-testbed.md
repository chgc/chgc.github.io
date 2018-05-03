---
layout: post
title: '[Angular] TestBed 之 override 系列'
comments: true
date: 2018-05-03 21:05:58
categories: Angular
tags: Angular
---

Angular TestBed 是 Angular 團隊提供用來設定測試環境的方法，TestBed 可以讓我們用最簡單的方式設定好一個測試用的 NgModule，除了常見的幾個方法外，還提供一系列的 override 的方法，但是卻沒有相關的文件說明，所以這篇文章就是來解釋如何使用 override 方法

<!-- more -->

# 介紹 TestBed Override 系列

根據官方文件, TestBed 提供的 override 方法有

1. `overrideModule`
2. `overrideComponent`
3. `overrideDirective`
4. `overridePipe`
5. `overrideTemplate`
6. `overrideTemplateUsingTestingModule`
7. `overrideProvider`

以下就先以 `overrideModule` 與 `overrideProvider` 作範例，其他會在後面在說明

## OverrideModule

```typescript
@NgModule({
  declarations: [DemoComponent],
  providers: [
    {
      provide: ActivatedRoute,
      useValue: {
        data: of({ actionType: 'abc' })
      }
    }
  ]
})
class SomeModule {}

describe('DemoComponent', () => {
  let component: DemoComponent;
  let fixture: ComponentFixture<DemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ imports: [SomeModule] });
  }));

  describe('原始 module 測試', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DemoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('actionType should equal abc', async(() => {
      expect(component.actionType).toBe('abc');
    }));
  });

  describe('override 後 module 測試', () => {
    beforeEach(() => {
      TestBed.overrideModule(SomeModule, {
        set: {
          providers: [
            {
              provide: ActivatedRoute,
              useValue: {
                data: of({ actionType: '123' })
              }
            }
          ]
        }
      });
    });
    
     beforeEach(() => {
      fixture = TestBed.createComponent(DemoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('actionType should equal 123', async(() => {
      expect(component.actionType).toBe('123');
    }));
  });
```



以 `overrideModule`的字面上來解釋，就是可以複寫第一次所設定的 `TestingModule` 的內容，由於 `overrideModule` 需要指定要複寫的 module 名稱，所以先建立一個初始  `NgModule` 後，在 `TestingModule` 時將其 import 進來。執行的結果會是一樣的

這裡需要留意的是 `TestBed.createComponent` 的時間點，一旦 component 被建立後，就無法被複寫了，這裡要注意

## overrideProvider

 但我們只想更換 `provider` 的部分，真的有需要寫的那麼複雜嗎? `TestBed` 有提供 `overrideProvider` 的方法可以使用，寫法如下

```typescript
describe('DemoComponent', () => {
  let component: DemoComponent;
  let fixture: ComponentFixture<DemoComponent>;

  beforeEach(async(() => {
        TestBed.configureTestingModule({
      declarations: [DemoComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ actionType: 'abc' })
          }
        }
      ]
    });
  }));

  describe('原使 module 測試', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DemoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('actionType should equal abc', async(() => {
      expect(component.actionType).toBe('abc');
    }));
  });

  describe('修正後的 provider 測試', () => {
    beforeEach(() => {
      TestBed.overrideProvider(ActivatedRoute, {
        useValue: {
          data: of({ actionType: 'def' })
        }
      });
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(DemoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('actionType should equal def', async(() => {
      expect(component.actionType).toBe('def');
    }));
  });
});
```



## overrideComponent

`overrideComponent` 也是另外一個很常見的測試技巧，尤其是在測試 `directive`的時候，這技巧就非常實用

```typescript
@Component({
  selector: 'app-host-comp',
  template: ''
})
class HostComponent {}

describe('HighlightDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [HostComponent, HighlightDirective]
      });
    })
  );

  function createComponent() {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  }

  it('should highlight with cyan', () => {
    TestBed.overrideComponent(HostComponent, {
      set: { template: `<p highlight="cyan">empty</p>` }
    });
    createComponent();
    const de = fixture.debugElement.query(By.css('p'));
    expect(de.nativeElement.style.backgroundColor).toBe('cyan');
  });

  it('should highlight with yellow', () => {
    TestBed.overrideComponent(HostComponent, {
      set: { template: `<p highlight>empty</p>` }
    });
    createComponent();
    const de = fixture.debugElement.query(By.css('p'));
    expect(de.nativeElement.style.backgroundColor).toBe('yellow');
  });
});
```

## overrideTemplate

如果只是想要替換 template 的部分，有更簡便的寫法，可使用 `TestBed.OverrideTemplate(<Component>, <template string>)` 來達成一樣的效果

```typescript
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DemoComponent } from './demo.component';
@Component({
  selector: 'app-host-comp',
  template: ''
})
class HostComponent {}

describe('DemoComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let app: HostComponent;

  function createComponent() {
    fixture = TestBed.createComponent(HostComponent);
    app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HostComponent, DemoComponent]
    });
  }));

  it(`testing overrideTemplate`, async(() => {
    TestBed.overrideTemplate(HostComponent, `<app-demo title="app2"></app-demo>`);
    createComponent();
    expect(fixture.nativeElement.querySelector('p').innerText).toEqual('app2');
  }));
});

```



# 結論

TestBed 是一個很方便的工具，除了使用 spyObject 的方式，這一種方式也不錯，分享給大家



# 延伸閱讀

* [TestBed](https://angular.io/api/core/testing/TestBed)
* [Directive Testing](https://angular.io/guide/testing#attribute-directive-testing)