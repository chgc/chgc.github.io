---
layout: post
title: '[RxJS] Pipe 的延伸應用'
comments: true
typora-root-url: 2019-08-19-angular-rxjs-practice-2/
typora-copy-images-to: 2019-08-19-angular-rxjs-practice-2/
date: 2019-08-19 09:36:06
categories: Angular
tags: Angular
---

昨天在重構手上一個案子的程式碼，其中有一個功能是在讀取資料時，要顯示 loading 的圖示，這算是一個很常見的需求，但要怎麼寫才能寫得漂亮，這是我目前得到的答案

<!-- more -->

# LoadingComponent

這個案子我使用 Angular Material (`MatProgressSpinnerModule` ) 的 `mat-progress-spinner` 和 `MatDialog` 來完成，簡單的說，就是當讀取時，使用 `MatDialog` 來開啟 `LoadingComponent`，沒什麼特殊的技巧，最多是 css 的設定

```css
.transparent .mat-dialog-container {
  box-shadow: none;
  background: rgba(0, 0, 0, 0.0);
}
```

監控是否開啟 `LoadingComponet` 的程式

```typescript
this.loadingService.isLoading$.subscribe(isLoading => {
      if (isLoading) {
        this.dialogRef = this.dialog.open(LoadingComponent, {
          height: '200px',
          width: '200px',
          panelClass: 'transparent',
          disableClose: true
        });
      } else {
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
    });
```

# LoadingService

比較特殊的處理是在 `LoadingService` 的地方，這裡我有用到 TypeScript 多型的手法

```typescript

  load<T>(): UnaryFunction<T, T>;
  load<T, A>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
  load<T, A, B>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>
  ): UnaryFunction<T, B>;
  load<T, A, B, C>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>
  ): UnaryFunction<T, C>;
  load<T, A, B, C, D>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>
  ): UnaryFunction<T, D>;
  load<T, A, B, C, D, E>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>
  ): UnaryFunction<T, E>;
  load<T, A, B, C, D, E, F>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>
  ): UnaryFunction<T, F>;
  load<T, A, B, C, D, E, F, G>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>
  ): UnaryFunction<T, G>;
  load<T, A, B, C, D, E, F, G, H>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>
  ): UnaryFunction<T, H>;
  load<T, A, B, C, D, E, F, G, H, I>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>
  ): UnaryFunction<T, I>;
  load<T, A, B, C, D, E, F, G, H, I>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    ...fns: UnaryFunction<any, any>[]
  ): UnaryFunction<T, {}>;
  /* tslint:enable:max-line-length */

  load(...operations: OperatorFunction<any, any>[]): UnaryFunction<any, any> {
    return pipe(
      tap(() => this.begin()),
      pipeFromArray(operations),
      tap(() => this.finish())
    );
  }
```

我建立了一個 load 方法，這一個方法的使用方式跟我們在使用 pipe 的方式是一樣的，只是我在最前面跟最後面加上 loading 的開關，這樣的寫法雖然囉嗦，卻可以保留型別推導的能力，至於實際要怎麼使用呢? 範例如下

```typescript
 combineLatest([favGroup$, searchField$, paginator$])
      .pipe(
        this.loadingService.load(
          switchMap(() => this.api.randomUsr()),
          map(users=> users.slice(0,9)),
          ...
        )
      )
      .subscribe({
        next: (data) => {
          ...
        }
      });
```

這樣封裝起來，在任何需要的地方，都只需要呼叫同一個方法即可達到 loading 顯示的效果

