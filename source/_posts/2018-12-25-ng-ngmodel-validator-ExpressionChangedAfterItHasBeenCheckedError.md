---
當layout: post
title: '[Angular] 有些關於 NgModel 的事情'
comments: true
typora-root-url: 2018-12-25-ng-ngmodel-validator-ExpressionChangedAfterItHasBeenCheckedError/
typora-copy-images-to: 2018-12-25-ng-ngmodel-validator-ExpressionChangedAfterItHasBeenCheckedError/
date: 2018-12-25 09:15:49
categories: Angular
tags: Angular
---

`NgModel` 如果沒寫好，很容易出現 `ExpressionChangedAfterItHasBeenCheckedError` 的錯誤訊息，但這一個錯誤訊息可能也不是 `NgModel` 直接造成的。只好又將 source code 翻出來看了

<!-- more -->

# 緣由

有人在 FB 社群上詢問，問什麼以下的程式碼會出現 `ExpressionChangedAfterItHasBeenCheckedError` 的錯誤訊息

```typescript
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'my-app',
  styles: [`
    .error {
      background-color: yellow
    }
  `],
  template: `
    <div>
      <button type="button" (click)="addOne()">Add One Person</button>
    </div>

    <div>
      <ng-container *ngFor="let x of people; let i=index;">
        <div>
          <button type="button" (click)="delete(i)">Delete</button>
          Age: <input name="age_{{i}}" [(ngModel)]="x.age" required #age="ngModel" [ngClass]="{'error': age.errors}">
        </div>
      </ng-container>
    </div>
  `,
})
export class AppComponent  {

  people = [];

  addOne() {
    this.people.push({});
  }

  delete(i: number) {
    this.people.splice(i, 1);
  }

}
```

![1545717434680](1545717434680.png)

當點下 `Add One Person` 後，就會出現以下的錯誤訊息，但到底為什麼呢?

![1545717378276](1545717378276.png)

這個錯誤訊息的產生是因為 `[ngClass]` 造成的，先說解法。

1. 使用 Reactive Form 寫
2. 使用 `[class.error]` 代替 `[ngClass]="{'error': age.errors }"`
3. 自訂 `ng-invalid` 的 class 樣式

# 追追追

這一切都要從 Angular 是如何將 Component / Directive 產生出來說起，所有的 Component 和 Directive 的 constructor 都是在 `ApplicationRef.tick()` 事件前，所以我們就得來看 `NgModule` 這一個 Directive 到底做了哪些事情

```typescript
Directive({
  selector: '[ngModel]:not([formControlName]):not([formControl])',
  providers: [formControlBinding],
  exportAs: 'ngModel'
})
export class NgModel extends NgControl implements OnChanges,
    OnDestroy {
  public readonly control: FormControl = new FormControl();    
  ...

 constructor(@Optional() @Host() parent: ControlContainer,
              @Optional() @Self() @Inject(NG_VALIDATORS) validators: Array<Validator|ValidatorFn>,
              @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: Array<AsyncValidator|AsyncValidatorFn>,
              @Optional() @Self() @Inject(NG_VALUE_ACCESSOR)
              valueAccessors: ControlValueAccessor[]) {
                super();
                this._parent = parent;
                this._rawValidators = validators || [];
                this._rawAsyncValidators = asyncValidators || [];
                this.valueAccessor = selectValueAccessor(this, valueAccessors);
              }
    ...
}
```

* 任何 `NgModel` 都會建立一個 `FormControl`，這個時間點尚未進行任何 `FormControl`  的驗證與更新

在第一次的 `tick()` 發生時，會做以下的事情

```typescript
  tick(): void {
    if (this._runningTick) {
      throw new Error('ApplicationRef.tick is called recursively');
    }

    const scope = ApplicationRef._tickScope();
    try {
      this._runningTick = true;
      this._views.forEach((view) => view.detectChanges());
      if (this._enforceNoNewChanges) {
        this._views.forEach((view) => view.checkNoChanges());
      }
    } catch (e) {
      // Attention: Don't rethrow as it could cancel subscriptions to Observables!
      this._zone.runOutsideAngular(() => this._exceptionHandler.handleError(e));
    } finally {
      this._runningTick = false;
      wtfLeave(scope);
    }
  }
```

* line 9: `detectChanges` 會執行 `checkAndUpdateView` 方法

  * `checkAndUpdateView` 內的 `execComponentViewsAction` 會觸發 `OnChanges` 事件

  * 但 `Services.updateDirectives` 卻是在 `execComponentViewsAction`  之前，所以 `[ngClass]` 這時候接受到的值是 `null`

  * `NgModel` `OnChanges` 事件

    ```typescript
    gOnChanges(changes: SimpleChanges) {
        this._checkForErrors();
        if (!this._registered) this._setUpControl();
        if ('isDisabled' in changes) {
            this._updateDisabled(changes);
        }
    
        if (isPropertyUpdated(changes, this.viewModel)) {
            this._updateValue(this.model);
            this.viewModel = this.model;
        }
    }
    ```

    * line 3: 判斷是否為第一次執行，如果是，又會判斷是否是 `standalone`。如果是 `standalong ` 或是沒有上層的 `ngForm`  的話，則會立刻執行 `formControl.updateValueAndValidity({emitEvent: false})`， 取得 `controls.errors`
    * 如果不是前一種情形，則會將此 `NgModel` 加入到 `ngForm.controls` 裡

* line10: 是當處在 `devMode` 時，`_enforceNoNewChanges` 的值會是 `true` (主要錯誤發生點是在這一階段發生的)

  * 執行 `checkNoChangesView` 方法
  * 執行到 `updateDirectives` 然後噴錯，因為 `[ngClass]`  這時候已經能正常地取得 controls.error 的值
  * 因為上面的值在一次 `tick` 週期內被異動了，所以就噴出 `ExpressionChangedAfterItHasBeenCheckedError`  錯誤訊息了

# 重新整理一次流程

1. `Component Constructor` 

2. `NgModel Constructor`

3. `ApplicationRef.tick()`

4. `view.detectChanges()`

5. `checkAndUpdateView`

   ```typescript
   export function checkAndUpdateView(view: ViewData) {
     if (view.state & ViewState.BeforeFirstCheck) {
       view.state &= ~ViewState.BeforeFirstCheck;
       view.state |= ViewState.FirstCheck;
     } else {
       view.state &= ~ViewState.FirstCheck;
     }
     shiftInitState(view, ViewState.InitState_BeforeInit, ViewState.InitState_CallingOnInit);
     markProjectedViewsForCheck(view);
     Services.updateDirectives(view, CheckType.CheckAndUpdate);
     execEmbeddedViewsAction(view, ViewAction.CheckAndUpdate);
     execQueriesAction(
         view, NodeFlags.TypeContentQuery, NodeFlags.DynamicQuery, CheckType.CheckAndUpdate);
     let callInit = shiftInitState(
         view, ViewState.InitState_CallingOnInit, ViewState.InitState_CallingAfterContentInit);
     callLifecycleHooksChildrenFirst(
         view, NodeFlags.AfterContentChecked | (callInit ? NodeFlags.AfterContentInit : 0));
   
     Services.updateRenderer(view, CheckType.CheckAndUpdate);
   
     execComponentViewsAction(view, ViewAction.CheckAndUpdate);
     execQueriesAction(
         view, NodeFlags.TypeViewQuery, NodeFlags.DynamicQuery, CheckType.CheckAndUpdate);
     callInit = shiftInitState(
         view, ViewState.InitState_CallingAfterContentInit, ViewState.InitState_CallingAfterViewInit);
     callLifecycleHooksChildrenFirst(
         view, NodeFlags.AfterViewChecked | (callInit ? NodeFlags.AfterViewInit : 0));
   
     if (view.def.flags & ViewFlags.OnPush) {
       view.state &= ~ViewState.ChecksEnabled;
     }
     view.state &= ~(ViewState.CheckProjectedViews | ViewState.CheckProjectedView);
     shiftInitState(view, ViewState.InitState_CallingAfterViewInit, ViewState.InitState_AfterInit);
   }
   ```

   * line 21: 觸發 `NgModel.ngOnChanges` 事件

6. 開發模式下: `view.checkNoChanges()`

7. `service.checkNoChangesView()`

   ```typescript
   export function checkNoChangesView(view: ViewData) {
     markProjectedViewsForCheck(view);
     Services.updateDirectives(view, CheckType.CheckNoChanges);
     execEmbeddedViewsAction(view, ViewAction.CheckNoChanges);
     Services.updateRenderer(view, CheckType.CheckNoChanges);
     execComponentViewsAction(view, ViewAction.CheckNoChanges);
     view.state &= ~(ViewState.CheckProjectedViews | ViewState.CheckProjectedView);
   }
   ```

上述就是一個 `tick()` 會做的事情，只要在一個 tick 循環內出現 `ViewModel` 不一致的情形，都會噴錯

