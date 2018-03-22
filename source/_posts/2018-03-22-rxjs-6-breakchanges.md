---
layout: post
title: '[Angular] RxJS 6 的 Breaking Changes 整理'
comments: true
date: 2018-03-22 16:07:53
categories: Angular
tags: Angular
---

Angular 6 將會把 RxJS 一起升級到 6 版，在 RxJS 6 版有許多的 breaking changes，這些 breaking changes 有許多是為了簡化開發時的寫法所做的改變，所以不要太緊張，就慢慢的了解就可以了。

<!-- more -->

# RxJS 6 Breaking Changes 列表

- **webSocket**: `webSocket` creator function now exported from `rxjs/websocket` as `websocket`.
- **IteratorObservable**: IteratorObservable no longer share iterator between subscription
- **utils**: Many internal use utilities like `isArray` are now hidden under `rxjs/internal`, they are implementation details and should not be used.
- **testing observables**: `HotObservable` and `ColdObservable`, and other testing support types are no longer exported directly.
- **creation functions**: All create functions such as of, from, `combineLatest` and `fromEvent` should now be imported from `rxjs/create`.
- **types and interfaces**: Can no longer explicitly import types from `rxjs/interfaces`, import them from `rxjs` instead
- **symbols**: Symbols are no longer exported directly from modules such as `rxjs/symbol/observable `please use `Symbol.observable` and `Symbol.iterator` (polyfills may be required)
- **deep imports**: Can no longer deep import top-level types such as `rxjs/Observable`, `rxjs/Subject`, `rxjs/ReplaySubject`, et al. All imports should be done directly from `rxjs`, for example: `import \{ Observable, Subject \} from 'rxjs'`;
- **schedulers**: Scheduler instances have changed names to be suffixed with `Scheduler`, (e.g. `asap` -> `asapScheduler`)
- **operators**: Pipeable operators must now be `imported from rxjs` like so: `import { map, filter, switchMap } from 'rxjs/operators';`. No deep imports.
- **ajax**: Ajax observable should be imported from `rxjs/ajax`.
- **ajax**: will no longer execute a CORS request by default, you must opt-in with the crossDomain flag in the config.
- **Observable**: You should no longer deep import custom Observable implementations such as `ArrayObservable` or `ForkJoinObservable`.
- **_throw**: _throw is now exported as `throwError`
- **operators**: Deep imports to `rxjs/operator/*` will no longer work. Again, pipe operators are still where they were.
- **error handling**: Unhandled errors are no longer caught and rethrown, rather they are caught and scheduled to be thrown, which causes them to be reported to window.onerror or process.on('error'), depending on the environment. Consequently, teardown after a synchronous, unhandled, error will no longer occur, as the teardown would not exist, and producer interference cannot occur
- **distinct**: Using `distinct` requires a `Set` implementation and must be polyfilled in older runtimes
- **asap**: Old runtimes must polyfill Promise in order to use ASAP scheduling.
- **groupBy**: Older runtimes will require Map to be polyfilled to use `groupBy`
- **TypeScript**: IE10 and lower will need to polyfill `Object.setPrototypeOf`
- **operators removed**: Operator versions of static observable creators such as `merge`, `concat`, `zip`, `onErrorResumeNext`, and `race` have been removed. Please use the static versions of those operations. e.g. `a.pipe(concat(b, c)) becomes concat(a, b, c)`.
- **rxjs**: `rxjs/create` items are now exported from `rxjs`
- **throwError**: Observable.throw no longer available in TypeScript without a cast
- **empty**: `empty()` without a scheduler will return the same instance every time.
- **empty**: In TypeScript, `empty()` no longer accepts a generic argument, as it returns `Observable<never>`
- **never**: `never() `always returns the same instance
- **never**: TypeScript typing for `never()` is now `Observable<never>` and the function no longer requires a generic type.
- **never**: no longer exported. Use the `NEVER` constant instead.
- **Symbol.observable**: RxJS will no longer be polyfilling Symbol.observable. That should be done by an actual polyfill library. This is to prevent duplication of code, and also to prevent having modules with side-effects in rxjs.
- **bindCallback**: removes result selector, use `map` instead: `bindCallback(fn1, fn2)()` becomes `bindCallback(fn1)().pipe(map(fn2))`
- **Symbol.iterator**: We are no longer polyfilling Symbol.iterator. That would be done by a proper polyfilling library
- **Observable.if**: TypeScript users using `Observable.if` will have to cast `Observable` as any to get to if. It is a better idae to just use `iif` directly via `import { iif } from 'rxjs';`
- **bindNodeCallback**: resultSelector removed, use `map` instead: `bindNodeCallback(fn1, fn2)()` becomes `bindNodeCallback(fn1)().pipe(map(fn2))`
- **Rx.ts**: importing from `rxjs/Rx` is no longer available. Upcoming backwards compat solution will allow that
- **fromEvent**: result selector removed, use `map` instead: `fromEvent(target, 'click', fn)` becomes `fromEvent(target, 'click').pipe(map(fn))`
- **last**: no longer accepts `resultSelector` argument. To get this same functionality, use `map`.
- **first**: no longer supports `resultSelector` argument. The same functionality can be achieved by simply mapping either before or after `first` depending on your use case.
- **exhaustMap**: `resultSelector` no longer supported, to get this functionality use: `source.pipe(exhaustMap(x => of(x + x).pipe(map(y => x + y))))`
- **switchMap|switchMapTo**: `switchMap` and `switchMapTo` no longer take `resultSelector` arguments, to get the same functionality use `switchMap` and `map` in combination: `source.pipe(switchMap(x => of(x + x).pipe(y => x + y)))`.
- **mergeMapTo**: `mergeMapTo` no longer accepts a resultSelector, to get this functionality, you'll want to use `mergeMap` and `map` together: `source.pipe(mergeMap(() => inner).pipe(map(y => x + y)))`
- **fromEventPattern**: no longer supports a result selector, use `map` instead: `fromEventPattern(fn1, fn2, fn3)` becomes `fromEventPattern(fn1, fn2).pipe(map(fn3))`

#  重點整理

1. Import 位置簡化

   1. creation functions 現在改由 `rxjs` import

      ```typescript
      import { of, from } from 'rxjs';
      ```

   2. types and interfaces 現在改由 `rxjs` import

2. 語法調整

   1. `_if` 修改成 `iif`
   2. `_throw` 修改成 `throwError`
   3. `asap ` 修改成 `asapScheduler ` 等

2. 擁有 `resultSelector` 的 `operators` 都被拔掉了，建議改搭配使用 `map`，例如

   ```typescript
   source.pipe(mergeMap((x)=> of(x+x).pipe(y=> x=y)))
   ```

3. Pipeable operators 必須從 `rxjs/operators` 引用

4.  importing from `rxjs/Rx` 無法繼續使用. 但會提供 `rxjs-compat` 套件做向下相容

