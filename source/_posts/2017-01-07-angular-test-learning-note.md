---
layout: post
title: '[Angular] 學習筆記(2) - Angular 2 — Testing Guide'
comments: true
date: 2017-01-07 11:53:07
categories: Angular
tags: 
- Angular
- 學習筆記
---

[Angular 2 — Testing Guide](https://medium.com/google-developer-experts/angular-2-testing-guide-a485b6cb1ef0#.gyor9igx8)的閱讀筆記，這篇文章是由 [Gerard Sans](https://medium.com/@gerard.sans)撰寫的

這篇文章包含Angular Application的基本單元測試，像是Components, Services, Http and Pipes. 

該文章有提供另外一個[**Testing Checklist**](https://medium.com/google-developer-experts/angular-2-testing-guide-a485b6cb1ef0#8ea4) 幫助建立測試

<!-- more -->

# Jasmine的基本介紹

Jasmine有幾個基本的元素

* Suites - `describe(title:string, function)` : 基本容器. 用來裝 Specs. 
* Specs - `it(title:string, function)`: 基本測試單位，裡面可以包含一個或多個expectations
* expectations - `expect(actual).toBe(expected)` 用來比對測試結果與預期結果
* Matchers - 預先設定的運算式, Eg. `toBe(expected)`, `toEqual(expected)`,  [更多](https://github.com/JamieMason/Jasmine-Matchers)

Jasmine有提供4個handlers，來處理一些在測試前或是測試後可以額外執行的動作

* `beforeEach`, `afterEach ` 於每一個 `spec` 前後執行
* `beforeAll`,`afterAll` 於每一個 `Suit` 前後執行

可以透過上列的方式避免重複程式碼的產生

# Angular 測試

* **TestBed**: 在測試裡面建立ngModule，設定方式與一般設定ngModule一樣，提供方法讓測試案例裡可以取得想要測試的component/service等

  ```typescript
  @NgModule({
    declarations: [ ComponentToTest ] 
    providers: [ MyService ]
  }) 

  mockMyService = {};

  class AppModule { }
  TestBed.configureTestingModule({
    declarations: [ ComponentToTest ],
    providers: [ 
    	{provide: MyService, useValue: mockMyService}
    ]  
  });
  //get instance from TestBed (root injector)
  let service = TestBed.get(MyService);
  ```

* **Inject**: 允許我們在TestBed Level取得dependencies

  ```typescript
  it('should return ...', inject([MyService], service => { 
    service.foo();
  }));
  ```

* **Component Injector**: 允許我們在Component Level取得dependencies

  ```typescript
  @Component({ 
    providers: [ MyService ] 
  }) 
  class ComponentToTest { }
  let fixture = TestBed.createComponent(ComponentToTest);
  let service = fixture.debugElement.injector.get(MyService);
  ```

  如果DI是在Component裡面定義的話，只能透過上述方法才能取得. `TestBed.get`或是`Inject`是取不到的

1. service測試的範例程式

   ```typescript

   describe('Service: LanguagesService', () => {
     let service;

     beforeEach(() => TestBed.configureTestingModule({
       providers: [ LanguagesService ]
     }));

     beforeEach(inject([LanguagesService], s => {
       service = s;
     }));

     it('should return available languages', () => {
       expect(service.get()).toContain('en');
     });
   });
   ```

2. 產生component的方式

   ```typescript
   // synchronous
     beforeEach(() => {
       fixture = TestBed.createComponent(MyTestComponent);
     });

   // asynchronous 
     beforeEach(async(() => {
       TestBed.configureTestingModule({
         declarations: [ MyTestComponent ],
       }).compileComponents(); // compile external templates and css
     }));
   ```

   用非同步的方式產生component, 這方式同時間會產生`zone`來負責所有非同步的行為

## Testing Checklist

1. 需要決定測試的種類: Isoldated, shallow or integration [參閱](http://blog.kevinyang.net/2017/01/05/angular2-ssw-testing-angular2-note/)
2. 應該使用 `Mocks`、`Stubs` or `Spies`?
3. 同步或非同步?

# 測試範例

## Component

要測試的Component

```typescript
// Usage:    <greeter name="Joe"></greeter> 
// Renders:  <h1>Hello Joe!</h1>
@Component({
  selector: 'greeter',
  template: `<h1>Hello {{name}}!</h1>`
})
export class Greeter { 
  @Input() name;
}
```

Angular建議使用TestBed來產生component

```typescript
describe('Component: Greeter', () => {
  let fixture, greeter, element, de;
  
  //setup
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ Greeter ]
    });

    fixture = TestBed.createComponent(Greeter);
    greeter = fixture.componentInstance;  // to access properties and methods
    element = fixture.nativeElement;      // to access DOM element
    de = fixture.debugElement;            // test helper
  });
  
  //specs
  it('should render `Hello World!`', async(() => {
    greeter.name = 'World';
    //trigger change detection
    fixture.detectChanges();
    fixture.whenStable().then(() => { 
      expect(element.querySelector('h1').innerText).toBe('Hello World!');
      expect(de.query(By.css('h1')).nativeElement.innerText).toBe('Hello World!');
    });
  }));
}) 
```

fixture是用來讀取component的方法. 他有下列的方法

```typescript
abstract class ComponentFixture {
  debugElement;       // test helper 
  componentInstance;  // to access properties and methods
  nativeElement;      // to access DOM element
  detectChanges();    // trigger component change detection
}
```

* ` whenStable`是當所有非同步的行為都完成後，會執行`whenStable`，這時，就可以取得應有的結果
* 其他讀取搜尋debugElement的方式: 
  * query(By.all())
  * query(By.directive(MyDirective))

## Service

要測試的serivce範例

```typescript
//a simple service
export class LanguagesService {
  get() {
    return ['en', 'es', 'fr'];
  }
}
```

類似測試Component的方式，一樣使用TestBed來產生Service. 

```typescript
describe('Service: LanguagesService', () => {
  let service;

  beforeEach(() => TestBed.configureTestingModule({
    providers: [ LanguagesService ]
  }));

  beforeEach(inject([LanguagesService], s => {
    service = s;
  }));

  it('should return available languages', () => {
    let languages = service.get();
    expect(languages).toContain('en');
    expect(languages).toContain('es');
    expect(languages).toContain('fr');
    expect(languages.length).toEqual(3);
  });
});
```



## Using Http

通常在測試階段不會做任何HTTP call. 但是還是簡單介紹一下，因為這時需要使用到HttpModule

要測試的Service程式碼

```typescript
export class LanguagesServiceHttp {
  constructor(private http:Http) { }
  
  get(){
    return this.http.get('api/languages.json')
      .map(response => response.json());
  }
}
```

測試

```typescript
describe('Service: LanguagesServiceHttp', () => {
  let service;
  
  //setup
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpModule ], // 如果有相依其他的Module, 在此定義
    providers: [ LanguagesServiceHttp ]
  }));
  
  beforeEach(inject([LanguagesServiceHttp], s => {
    service = s;
  }));
  
  //specs
  it('should return available languages', async(() => {
    service.get().subscribe(x => { 
      expect(x).toContain('en');
      expect(x).toContain('es');
      expect(x).toContain('fr');
      expect(x.length).toEqual(3);
    });
  }));
}) 
```



## Using MockBackend

由於測試時不呼叫真實的後端API, 就會寫一個假的來模擬替代真實的呼叫

```typescript
describe('MockBackend: LanguagesServiceHttp', () => {
  let mockbackend, service;

  //setup
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      providers: [
        LanguagesServiceHttp,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    })
  });
    
  beforeEach(inject([LanguagesServiceHttp, XHRBackend], (_service, _mockbackend) => {
    service = _service;
    mockbackend = _mockbackend;
  }));

  //specs
  it('should return mocked response (async)', async(() => {
    let response = ["ru", "es"];
    // 模擬後端Response的結果
    mockbackend.connections.subscribe(connection => {
      connection.mockRespond(new Response({body: JSON.stringify(response)}));
    });
    service.get().subscribe(languages => {
      expect(languages).toContain('ru');
      expect(languages).toContain('es');
      expect(languages.length).toBe(2);
    });
  }));  
})
```



## Directive

因為Directive沒有view, 而且是相依在dom上，所以必須建立一個component容器來測試directive

```typescript
// Example: <div log-clicks></div>
@Directive({
  selector: "[log-clicks]"
})
export class logClicks {
  counter = 0;
  @Output() changes = new EventEmitter();
  
  @HostListener('click', ['$event.target'])
  clicked(target) { 
    console.log(`Click on [${target}]: ${++this.counter}`);
    //we use emit as next is marked as deprecated
    this.changes.emit(this.counter);
  }
}
```

測試

```typescript
// 用來測試Directive的容器Component
@Component({ 
  selector: 'container',
  template: `<div log-clicks (changes)="changed($event)"></div>`,
  directives: [logClicks]
})
export class Container {  
  @Output() changes = new EventEmitter();
  
  changed(value){
    this.changes.emit(value);
  }
}

describe('Directive: logClicks', () => {
  let fixture;
  let container;
  let element;  

  //setup
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ Container, logClicks ]
    });

    fixture = TestBed.createComponent(Container);
    container = fixture.componentInstance; // to access properties and methods
    element = fixture.nativeElement;       // to access DOM element
  });
  
  //specs
  it('should increment counter', fakeAsync(() => {
    let div = element.querySelector('div');
    //set up subscriber
    container.changes.subscribe(x => { 
      expect(x).toBe(1);
    });
    //trigger click on container
    div.click();
    //execute all pending asynchronous calls
    tick();
  }));
}) 
```

* `fakeAsync` 所有的非同步行為會被暫停直到 呼叫`tick`
* `fakeAsync` / `tick` 不能跟XHR一起使用

## Pipe

Pipe很容易測試，很單純的Class

```typescript
import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
  name: 'capitalise'
})
export class CapitalisePipe implements PipeTransform {
  transform(value: string): string {
    if (typeof value !== 'string') {
      throw new Error('Requires a String as input');
    }
    return value.toUpperCase();
  }
}
```

測試

```typescript
describe('Pipe: CapitalisePipe', () => {
  let pipe;
  
  //setup
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ CapitalisePipe ]
  }));
  
  beforeEach(inject([CapitalisePipe], p => {
    pipe = p;
  }));
  
  //specs
  it('should work with empty string', () => {
    expect(pipe.transform('')).toEqual('');
  });
  
  it('should capitalise', () => {
    expect(pipe.transform('wow')).toEqual('WOW');
  });
  
  it('should throw with invalid values', () => {
    //must use arrow function for expect to capture exception
    expect(()=>pipe.transform(undefined)).toThrow();
    expect(()=>pipe.transform()).toThrow();
    expect(()=>pipe.transform()).toThrowError('Requires a String as input');
  });
}) 
```



## Routes

```typescript
@Component({
  selector: 'my-app',
  template: `<router-outlet></router-outlet>`
})
class TestComponent { }

@Component({
  selector: 'home',
  template: `<h1>Home</h1>`
})
export class Home { }

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [
    BrowserModule, RouterModule.forRoot(routes),
  ],
  declarations: [TestComponent, Home],
  bootstrap: [TestComponent],
  exports: [TestComponent] 
})
export class AppModule {}
```

測試

```typescript
import { RouterTestingModule } from '@angular/router/testing';

describe('Router tests', () => {
  //setup
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AppModule
      ]
    });
  });
  // 3 way to test Router
  // async
  it('can navigate to home (async)', async(() => {
    let fixture = TestBed.createComponent(TestComponent);
    TestBed.get(Router)
      .navigate(['/home'])
        .then(() => {
          expect(location.pathname.endsWith('/home')).toBe(true);
        }).catch(e => console.log(e));
  }));
  
  // fakeAsync/tick
  it('can navigate to home (fakeAsync/tick)', fakeAsync(() => {
    let fixture = TestBed.createComponent(TestComponent);
    TestBed.get(Router).navigate(['/home']);
    fixture.detectChanges();
    //execute all pending asynchronous calls
    tick();    
    expect(location.pathname.endsWith('/home')).toBe(true);
  }));
  
  // done
  it('can navigate to home (done)', done => {
    let fixture = TestBed.createComponent(TestComponent);
    TestBed.get(Router)
      .navigate(['/home'])
        .then(() => {
          expect(location.pathname.endsWith('/home')).toBe(true);
          done();
        }).catch(e => console.log(e));
  });
});
```



## Observables

如何測試`Observable`

```typescript
describe('Observable: basic observable', () => {
  var basic$;
  
  //setup
  beforeEach(() => {
    basic$ = new Observable(observer => {
      //pushing values
      observer.next(1);
      observer.next(2);
      observer.next(3);
      //complete stream
      observer.complete(); 
    });
  })
  
  //specs
  it('should create the expected sequence (async)', async(() => {
    let expected = [1,2,3], 
      index = 0;
    basic$
      .subscribe({
        next: x => expect(x).toEqual(expected[index++]),
        error: e => console.log(e)
      });
  }));
});
```



## EventEmitters

```typescript
@Component({
  selector: 'counter',
  template: `
    <div>
      <h1>{{counter}}</h1>
      <button (click)="change(1)">+1</button>
      <button (click)="change(-1)">-1</button>
    </div>`
})
export class Counter {
  @Output() changes = new EventEmitter();
  
  constructor(){
    this.counter = 0;
  }
  
  change(increment) {
    this.counter += increment;
    //we use emit as next is marked as deprecated
    this.changes.emit(this.counter);
  }
}
```

測試方式類似Observable

```typescript
describe('EventEmitter: Counter', () => {
  let counter;
  
  //setup
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ Counter ]
  }));
  
  beforeEach(inject([Counter], c => {
    counter = c;
  }))
  
  //specs
  it('should increment +1 (async)', async(() => {
    counter.changes.subscribe(x => { 
      expect(x).toBe(1);
    });
    counter.change(1);
  }));

  it('should decrement -1 (async)', async(() => {
    counter.changes.subscribe(x => { 
      expect(x).toBe(-1);
    });
    counter.change(-1);
  }));
}) 
```

