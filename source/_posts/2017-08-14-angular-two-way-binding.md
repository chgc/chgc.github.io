---
layout: post
title: '[Angular] Two-way Binding 的運作方式'
comments: true
date: 2017-08-14 08:36:38
categories: Angular
tags: Angular
---

Angular 的雙向繫結與 AngularJS 的雙向繫結運作原理是完全不同的，目前看起來是沒有 AngularJS 會遇到效能問題。那 Angular 的雙向繫結到底是怎麼運作的呢?

<!-- more -->

# 如何使用 雙向繫結 (Two-way Binding)

以下的三種寫法都可以達到雙向繫結的效果

## 方法1
使用 `[()]` 的寫法

```typescript
<input [(ngModel)]="username">

<p>Hello {{username}}!</p>
```
## 方法2

將 `[]` `()` 分開寫

```typescript
<input [ngModel]="username" (ngModelChange)="username = $event">

<p>Hello {{username}}!</p>
```
## 方法3
不使用 `ngModel` 

```typescript
<input [value]="username" (input)="username = $event.target.value">

<p>Hello {{username}}!</p>
```



# ngModel
`ngModel` 是 Angular 所提供的 Directive，主要用途是用來簡化雙向繫結的寫法，程式碼可以參閱[這裡](https://github.com/angular/angular/blob/master/packages/forms/src/directives/ng_model.ts)

## 程式碼說明
### ngOnChanges

第一次 Input Change 時，註冊 Control 等相關事件，註冊流程如下
1. 檢查是否有註冊過，如果沒有，執行 `_setUpControl` 的方法，`setUpControl`是在 `./shared.ts` 內實作的，主要功能是 `Control` 的事件註冊。

```typescript
ngOnChanges(changes: SimpleChanges) {
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
...
private _setUpControl(): void {
    this._isStandalone() ? this._setUpStandalone() :
                        this.formDirective.addControl(this);
    this._registered = true;
}

private _isStandalone(): boolean {
    return !this._parent || !!(this.options && this.options.standalone);
}

private _setUpStandalone(): void {
    setUpControl(this._control, this); 
    this._control.updateValueAndValidity({emitEvent: false});
}
```

2.  `setUpControl` 內有許多事件註冊行為，而跟 two-way binding 有關的事件是 ` dir.valueAccessor!.registerOnChange`，這裡會傳入一個 callback function

```typescript
export function setUpControl(control: FormControl, dir: NgControl): void {
  ...
  setUpViewChangePipeline(control, dir);
  ...
}  
  
  
function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    control._pendingValue = newValue;
    control._pendingDirty = true;

    if (control.updateOn === 'change') updateControl(control, dir); // 觸發更新
  });
}
  
function updateControl(control: FormControl, dir: NgControl): void {
  dir.viewToModelUpdate(control._pendingValue);
  if (control._pendingDirty) control.markAsDirty();
  control.setValue(control._pendingValue, {emitModelToViewChange: false});
}
```

4. 而當 Input 欄位有資料輸入時，就會觸發事件並將回傳值發送到到頁面上

`ng_model.ts` 

```typescript
viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
}
```

# NG_VALUE_ACCESSOR
這個 provider 是讓 `ngModleChange` 接受 `$event` 而不是 `$event.target.value` 的魔法使，內部細節如下

![](http://i.imgur.com/Qsb228V.png)

在各類型的 `Control` 都會有一份 `NG_VALUE_ACCESSOR` ，而針對 `ngModel` 我們需留意的是 `DEFAULT_VALUE_ACCESSOR` ，檔案是 `default_value_accessor.ts`

(使用 multi 的 DI 設定方式並不是這篇文章的重點，只要知道這樣子設定，可以讓 Provider 使用同一個名稱但又可同時存在不互相影響)

```typescript
export const DEFAULT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DefaultValueAccessor),
  multi: true
};
```


```typescript
@Directive({
  selector:
      'input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]',
  host: {
    '(input)': '_handleInput($event.target.value)',
    '(blur)': 'onTouched()',
    '(compositionstart)': '_compositionStart()',
    '(compositionend)': '_compositionEnd($event.target.value)'
  },
  providers: [DEFAULT_VALUE_ACCESSOR]
})
export class DefaultValueAccessor implements ControlValueAccessor {  
  onChange = (_: any) => {};
  onTouched = () => {};

  /** Whether the user is creating a composition string (IME events). */
  private _composing = false;

  constructor(
      private _renderer: Renderer, private _elementRef: ElementRef,
      @Optional() @Inject(COMPOSITION_BUFFER_MODE) private _compositionMode: boolean) {
    if (this._compositionMode == null) {
      this._compositionMode = !_isAndroid();
    }
  }

  writeValue(value: any): void {
    const normalizedValue = value == null ? '' : value;
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', normalizedValue);
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  ...

  _handleInput(value: any): void {
    if (!this._compositionMode || (this._compositionMode && !this._composing)) {
      this.onChange(value);
    }
  }

  ...
}
```
`DefaultValueAccessor` 裡 `registerOnChange` 與 `onChange` 的關係是，`ngModel` 會經 `setUpControl` 的方法將自訂方法透過 `registerOnChange` 註冊到 `onChange` 上，

`DefaultValueAccessor` 的 `@Directive` 的宣告的地方，有註冊 `(input)` 事件發生時會觸發的方法， `_handleInput($event.target.value)`

```typescript
_handleInput(value: any): void {
    if (!this._compositionMode || (this._compositionMode && !this._composing)) {
        this.onChange(value);
    }
}
```

經過這一串的折騰，魔法就出現了，`ngModle` 的 `@Output('ngModelChange')` 會收到並發送資料到頁面上，這也就是為什麼 `(ngModelChange)` 的 `$event` 不需要加上 target.value，又可以取得異動的資料

# Recap
以下是雙向繫結相關的流程順序
1. `[ngModel]`時會觸發 `ngOnChanges` 事件
2. 在 `ngOnChanges` 時，會執行 `setUpControl()` 方法
3. 在 `setupControl()` 內會註冊 `DefaultValueAccess` 執行 `registerOnChange`，並將 callback function 傳入
4. 透過 `registerOnChanges` 傳入的 callback function 會被綁定到 `onChanges` 上
5. 當 `(input)` 事件被觸發時，會執行 `_handleInput($event.target.value)` 的方法
6. 將傳入 `_handleInput(value)` 的值傳給註冊在 `onChange` 的 callback function
7. callback function 會執行 `ngModel` 裡的 `viewToModelUpdate(newValue)` 方法
8. 最後將 `viewToModelUpdate` 所接受到的值，透過 `ngModelChange` 的 EventEmiiter emit 值到頁面上
9. 完成整個雙向繫結的動作