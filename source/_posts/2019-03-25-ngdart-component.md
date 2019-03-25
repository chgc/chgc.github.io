---
layout: post
title: '[AngularDart] Component'
comments: true
typora-root-url: '2019-03-25-ngdart-component/'
typora-copy-images-to: '2019-03-25-ngdart-component/'
date: 2019-03-25 09:14:47
categories: Angular
tags: Angular
---

Angular Dart 裡沒有 `NgModule`，在官方文件裡提到的 `Module` 是指每一個 Component  的檔案，這可以從 `main.dart` 看出來

```dart
import 'package:angular/angular.dart';
import 'package:helloNgDart/app_component.template.dart' as ng;

void main() {
  runApp(ng.AppComponentNgFactory);
}

```



<!-- more -->

# 基本架構

基本 Angular Library 都是從 `package:angular/angular.dart` 來的，如果需要其他的功能，例如 Http ，則需要引用其他的 library。一個基本的 `Component` 會有 class 本體與 metadata 的部分，既有的 lifecyle hooks 依然存在，像是 OnInit、OnDestory 等。

```dart
@Component(
  selector: 'hero-list',
  templateUrl: 'hero_list_component.html',
  directives: [coreDirectives, formDirectives, HeroDetailComponent],
  providers: [ClassProvider(HeroService)],
)
class HeroListComponent implements OnInit {
  List<Hero> heroes;
  Hero selectedHero;
  final HeroService _heroService;

  HeroListComponent(this._heroService);

  void ngOnInit() async {
    heroes = await _heroService.getAll();
  }

  void selectHero(Hero hero) {
    selectedHero = hero;
  }
}
```

硬要說 Angular 與 AngularDart Component 的差異，應該是在 directives 與 providers 的部分，因為 AngularDart 版本並沒有 `NgModule` 這一個元素，所以服務的部分必須定義在 Component 這一個層級，同樣的內建的 `directive` ，像是 `ngIf` 、`ngFor` 等，都必須額外在 `directives` 的地方註冊，連使用到的 `component` 也必須被註冊。

## Directive

如果需要使用到 `NgClass`、`NgFor`、`NgIf`、`NgTemplateOutlet`、`NgStyle`、`NgSwitch`、`NgSwitchWhen`、`NgSwitchDefault` 的，需要加入 `coreDirectives` 至 directives 。

如果需要使用到 `NgModel` 時，需要加入 `formDirectives` 至 directives。並需加入 `angular_forms: 2.1.1` 套件

# Dependency Injection

AngularDart 版本的 Dependency Injection，基本運作原理與 Angular 版本是一樣的，所以我們只需要將 AppComponent 視為 RootComponent(RootModule)，任何 service 註冊在這一層的，都是 root level service，註冊 Service 的方式為

```dart
@Component(
    ...
    providers: [ClassProvider(DataService)])
```

對應到 Angular 的註冊方式

| 使用方式           | Angular                                                      | AngularDart                                      |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------ |
| Class Provider     | [Logger]                                                     | ClassProvider(Logger)                            |
| Use-Class Provider | [{provide: Logger, useClass: BetterLogger}]                  | ClassProvider(Logger, useClass: BetterLogger)    |
| Exisiting Provider | [{provide, useExisting: BetterLogger}]                       | ExistingProvider(Logger, BetterLogger)           |
| Value Provider     | [{ provide: Logger, useValue: silentLogger }]                | ValueProvider(Logger, silentLogger)              |
| Factory Provider   | { provide: HeroService,useFactory: heroServiceFactory, deps: [Logger, UserService]} | FactoryProvider(HeroService, heroServiceFactory) |

## Token 使用法

| 使用方式 | Angular                                                      | AngularDart                                             |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| Token    | export const APP_CONFIG = new InjectionToken<AppConfig>('app.config'); | const appTitleToken = OpaqueToken<String>('app.title'); |
| 註冊     | [{ provide: APP_CONFIG, useValue: 'app config content'}]     | ValueProvider.forToken(appTitleToken, appTitle)         |
| 取得     | constructor(@Inject(APP_CONFIG) config: AppConfig) { this.title = config.title; } | AppComponent(@Inject(appTitleToken) this.title); AppComponent(@appTitleToken this.title); |



# 範例程式

* app_component.dart

  ```dart
  import 'package:angular/angular.dart';
  import 'package:helloNgDart/app-detail.component.dart';
  import './services/data.service.dart';
  
  @Component(
      selector: 'my-app',
      template: '''
      <h1>Hello {{name}}</h1>
      <app-detail></app-detail>
      <hr/>
      <div *ngFor="let item of list">
      {{ item }}
      </div>
      ''',
      directives: [coreDirectives, AppDetailComponent],
      providers: [ClassProvider(DataService)])
  class AppComponent {
    var name = 'Angular';
    final DataService service;
    var list;
    AppComponent(this.service) {
      this.list = this.service.list;
    }
  }
  
  ```

  

* app-detail.component.dart

  ```dart
  import 'package:angular/angular.dart';
  import './services/data.service.dart';
  import 'package:angular_forms/angular_forms.dart';
  
  @Component(
    selector: 'app-detail',
    template: '''
    {{ name }}
    <input [(ngModel)]="t" />
    <button (click)="add()">Add</button>  
    ''',
    directives: [formDirectives],
  )
  class AppDetailComponent {
    var name = "App Detail Component";
    var t;
    final DataService service;
  
    AppDetailComponent(this.service);
  
    add() {
      this.service.add(this.t);
    }
  }
  
  ```

  

* services/data.service.dart

  ```dart
  class DataService {
    var list = ['1', '2', '3'];
  
    add(value) {
      this.list.add(value);
    }
  }
  
  ```

* pubspec.yaml

  ```yaml
  name: helloNgDart
  description: An absolute bare-bones web app.
  
  environment:
    sdk: '>=2.1.0 <3.0.0'
  
  dependencies:
    angular: ^5.0.0
    angular_forms: 2.1.1
  
  dev_dependencies:
    build_runner: ^1.1.2
    build_web_compilers: ^1.0.0
    pedantic: ^1.0.0
  
  ```

  

# 結論

Angular Dart 的基本開發觀念是，每一個 Component 都是獨立個體，除了 provider 的部分，其餘的部分都需要各自設定，而這一部分是和 Angular (TS版) 有很大的差異性的

# 參考資料

* [Architecture](https://webdev.dartlang.org/angular/guide/architecture)
* [angular library API](https://webdev.dartlang.org/api?package=angular)
* [Dependecy Injection](https://webdev.dartlang.org/angular/guide/dependency-injection#factory-providers)