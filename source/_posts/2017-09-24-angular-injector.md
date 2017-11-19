---
layout: post
title: '[Angular] Angular 建立 Injector 的流程'
comments: true
date: 2017-09-24 11:35:35
categories: Angular
tags: Angular
---

Angular 有內建一套 Dependency Injection 框架，可以讓我們簡單的完成 DI 的相關行為，Angular 內部是如何運作建置 Injector 的呢? 讓我們來研究一下

<!-- more -->

# Angular 建立 Injector 的方式

從 `platformBrowserDynamic()` 執行時，就會開始一系列的初始建置 platform 的動作，這其中包含 Injector 的設定，從原始碼整理出的順序是執行 `platformBrowerDynamic()` 事實上就是執行 `createPlatformFactory`的動作。

```typescript
// 進入點
export const platformBrowserDynamic = createPlatformFactory(
    platformCoreDynamic, 'browserDynamic', INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);

// 第二層的 platformCoreDynamic
export const platformCoreDynamic = createPlatformFactory(platformCore, 'coreDynamic', [
  {provide: COMPILER_OPTIONS, useValue: {}, multi: true},
  {provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS]},
]);

// 最底層的 platformCore
export const platformCore = createPlatformFactory(null, 'core', _CORE_PLATFORM_PROVIDERS);
```

`createPlatformFactory` 接受三個參數，

1. parent platform: 這裡就是 `platformCore`
2. platform 的名稱
3. 要註冊至 Injector 的 provider ，型別為 `StaticProvider`

在 `createPlatFormFactory` 裡，如果沒有 parent platform 時，才會建立 Injector，而這裡就是指 platformCore 的部分，也是我們要關注的地方， **Injector.Create**

```typescript
export function createPlatformFactory(
    parentPlatformFactory: ((extraProviders?: StaticProvider[]) => PlatformRef) | null,
    name: string, providers: StaticProvider[] = []): (extraProviders?: StaticProvider[]) =>
    PlatformRef {
  const marker = new InjectionToken(`Platform: ${name}`);
  return (extraProviders: StaticProvider[] = []) => {
    let platform = getPlatform();
    if (!platform || platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
      if (parentPlatformFactory) {
        parentPlatformFactory(
            providers.concat(extraProviders).concat({provide: marker, useValue: true}));
      } else {
        // 建立 Injector
        createPlatform(Injector.create(
            providers.concat(extraProviders).concat({provide: marker, useValue: true})));
      }
    }
    return assertPlatform(marker);
  };
}
```

`Injector` 裡的 create 方法是一個 static method，真正使用到 Injector.create 的地方有三處，其餘的皆測試檔案裡使用。

1. createPlatformFactory
2. compiler_factory
3. TestBed

```typescript
export abstract class Injector {
  static THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
  static NULL: Injector = new _NullInjector();
  ... 
  static create(providers: StaticProvider[], parent?: Injector): Injector {
    return new StaticInjector(providers, parent);
  }
}
```

`StaticInjector` 的程式碼如下

```typescript
export class StaticInjector implements Injector {
  readonly parent: Injector;

  private _records: Map<any, Record>;

  constructor(providers: StaticProvider[], parent: Injector = NULL_INJECTOR) {
    this.parent = parent;    
    // 重點在這裡
    const records = this._records = new Map<any, Record>();
    records.set(
        Injector, <Record>{token: Injector, fn: IDENT, deps: EMPTY, value: this, useNew: false});
    recursivelyProcessProviders(records, providers);
  }

  get<T>(token: Type<T>|InjectionToken<T>, notFoundValue?: T): T;
  get(token: any, notFoundValue?: any): any;
  get(token: any, notFoundValue?: any): any {
   ...
  }

  toString() {
  ...
  }
}
```

由此可以看出 Injector 其實內部是透過 Map 的方式來管理 Providers 的，而 `recursivelyProcessProviders` 是用來將傳入的 providers 陣列註冊到 records 中，以供後續使用。

```typescript
function recursivelyProcessProviders(records: Map<any, Record>, provider: StaticProvider) {
  if (provider) {
    provider = resolveForwardRef(provider);
    if (provider instanceof Array) {
      // if we have an array recurse into the array
      for (let i = 0; i < provider.length; i++) {
        recursivelyProcessProviders(records, provider[i]);
      }
    } else if (typeof provider === 'function') {     
      throw staticError('Function/Class not supported', provider);
    } else if (provider && typeof provider === 'object' && provider.provide) {      
      // 對應 forwardRef decorator
      let token = resolveForwardRef(provider.provide);
      // resolveProvider 是另外一個重點 function，解析各式的 provider 設定
      const resolvedProvider = resolveProvider(provider);
      if (provider.multi === true) {
        // This is a multi provider.
        let multiProvider: Record|undefined = records.get(token);
        if (multiProvider) {
          if (multiProvider.fn !== MULTI_PROVIDER_FN) {
            throw multiProviderMixError(token);
          }
        } else {
          // Create a placeholder factory which will look up the constituents of the multi provider.
          records.set(token, multiProvider = <Record>{
            token: provider.provide,
            deps: [],
            useNew: false,
            fn: MULTI_PROVIDER_FN,
            value: EMPTY
          });
        }
        // Treat the provider as the token.
        token = provider;
        multiProvider.deps.push({token, options: OptionFlags.Default});
      }
      const record = records.get(token);
      if (record && record.fn == MULTI_PROVIDER_FN) {
        throw multiProviderMixError(token);
      }
      records.set(token, resolvedProvider);
    } else {
      throw staticError('Unexpected provider', provider);
    }
  }
}
```

在上列的程式碼中，有幾個重點

1. forwardRef：Allows to refer to references which are not yet defined.

   ```typescript
   export function resolveForwardRef(type: any): any {
     if (typeof type === 'function' && type.hasOwnProperty('__forward_ref__') &&
         type.__forward_ref__ === forwardRef) {
       return (<ForwardRefFn>type)();
     } else {
       return type;
     }
   }
   ```

2. resolveProvider：分析 provider 的註冊是否合法

   ```typescript
   function resolveProvider(provider: SupportedProvider): Record {
     const deps = computeDeps(provider);
     let fn: Function = IDENT;
     let value: any = EMPTY;
     let useNew: boolean = false;
     let provide = resolveForwardRef(provider.provide);
     if (USE_VALUE in provider) {
       // We need to use USE_VALUE in provider since provider.useValue could be defined as undefined.
       value = (provider as ValueProvider).useValue;
     } else if ((provider as FactoryProvider).useFactory) {
       fn = (provider as FactoryProvider).useFactory;
     } else if ((provider as ExistingProvider).useExisting) {
       // Just use IDENT
     } else if ((provider as StaticClassProvider).useClass) {
       useNew = true;
       fn = resolveForwardRef((provider as StaticClassProvider).useClass);
     } else if (typeof provide == 'function') {
       useNew = true;
       fn = provide;
     } else {
       throw staticError(
           'StaticProvider does not have [useValue|useFactory|useExisting|useClass] or [provide] is not newable',
           provider);
     }
     return {deps, fn, useNew, value};
   }
   ```

到這裡，已經可以看出 Inector 的運作模式，但到這個階段也同時建立 Application-Wild 層級的 Injector，預設在 platform 層級所註冊的 provider 有下列幾項

1.  {provide: ResourceLoader, useClass: CachedResourceLoader, deps: []}
2.  {provide: COMPILER_OPTIONS, useValue: {}, multi: true}
3.  **{provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS]}**
4.  {provide: PLATFORM_ID, useValue: 'unknown'}
5.  **{provide: PlatformRef, deps: [Injector]}** 
6.  {provide: TestabilityRegistry, deps: []}
7.  {provide: Console, deps: []}

之前有提過 Injector.create 除了測試檔案外，只有三個地方會出現，而 `CompilerFactory` 是其中一個，這裡我們可以知道 `CompilerFactory` 是使用 `JitCompilerFactory` 來編譯 Component，這裡另外建立一個 Injector，所以這裡所註冊的 Provider 會限制於在此層級使用

```typescript
export class JitCompilerFactory implements CompilerFactory {
  private _defaultOptions: CompilerOptions[];
  constructor(defaultOptions: CompilerOptions[]) {
    const compilerOptions: CompilerOptions = {
      useJit: true,
      defaultEncapsulation: ViewEncapsulation.Emulated,
      missingTranslation: MissingTranslationStrategy.Warning,
      enableLegacyTemplate: false,
    };

    this._defaultOptions = [compilerOptions, ...defaultOptions];
  }
  createCompiler(options: CompilerOptions[] = []): Compiler {
    const opts = _mergeOptions(this._defaultOptions.concat(options));   
    const injector = Injector.create([
      COMPILER_PROVIDERS, {
        provide: CompilerConfig,
        useFactory: () => {
          return new CompilerConfig({
            // let explicit values from the compiler options overwrite options
            // from the app providers
            useJit: opts.useJit,
            jitDevMode: isDevMode(),
            // let explicit values from the compiler options overwrite options
            // from the app providers
            defaultEncapsulation: opts.defaultEncapsulation,
            missingTranslation: opts.missingTranslation,
            enableLegacyTemplate: opts.enableLegacyTemplate,
            preserveWhitespaces: opts.preserveWhitespaces,
          });
        },
        deps: []
      },
      opts.providers !
    ]);
    return injector.get(Compiler);
  }
}
```

在 `JitCompilerFactory` 內的 `createCompiler` 函式會在 `bootstrapModule` 時被執行，`bootstrapModule` 是 `platformBrowserDynamic()` 建立後的下一個動作，`bootstrapModule` 定義在 `PlatformRef` 中

```typescript
platformBrowserDynamic().bootstrapModule(AppModule);
```

```typescript
  bootstrapModule<M>(
      moduleType: Type<M>, compilerOptions: (CompilerOptions&BootstrapOptions)|
      Array<CompilerOptions&BootstrapOptions> = []): Promise<NgModuleRef<M>> {
    const compilerFactory: CompilerFactory = this.injector.get(CompilerFactory);
    const options = optionsReducer({}, compilerOptions);
    // 建立另外一個新的 Injector
    const compiler = compilerFactory.createCompiler([options]);

    return compiler.compileModuleAsync(moduleType)
        .then((moduleFactory) => this.bootstrapModuleFactory(moduleFactory, options));
  }
```



# 結論

了解 Angular 底層 DI 的運作原理後，雖然對實際開發沒有什麼實質上的效益 XD，純粹滿足好奇心而已