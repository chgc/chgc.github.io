---
layout: post
title: '[Angular] Two-way Binding 的運作方式'
comments: true
date: 2017-08-14 08:36:38
categories: Angular
tags: Angular
---

Angular 的雙向繫結與 AngularJS 的雙向繫結運作原理是完全不同的，所以就沒有 AngularJS 會遇到效能問題。所以 Angular 的雙向繫結到底是怎麼運作的呢?

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
1. 檢查是否有註冊過，如果沒有，執行 `_setUpControl` 的方法
```typescript
ngOnChanges(changes: SimpleChanges) {
    this._checkForErrors();
    if (!this._registered) this._setUpControl(); // <== 關鍵方法
    if ('isDisabled' in changes) {
        this._updateDisabled(changes);
    }

    if (isPropertyUpdated(changes, this.viewModel)) {
        this._updateValue(this.model);
        this.viewModel = this.model;
    }
}
```  
2.  `setUpControl`是在 ./shared 內實作的，主要功能是設定 `Control` 的一些事件註冊，而其中的這段程式碼，會執行 `viewToModelUpdate`

```typescript
private _setUpControl(): void {
    this._isStandalone() ? this._setUpStandalone() :
                        this.formDirective.addControl(this);
    this._registered = true;
}

private _isStandalone(): boolean {
    return !this._parent || !!(this.options && this.options.standalone);
}

private _setUpStandalone(): void {
    setUpControl(this._control, this); // <== 關鍵
    this._control.updateValueAndValidity({emitEvent: false});
}
```
3. 因為 `setUpControl` 內有註冊異動事件(`registerOnChange`) 時會觸發原本 `ngModel` 內的 `viewToModelUpdate` 方法

`shared.ts`
```typescript
export function setUpControl(control: FormControl, dir: NgControl): void {
  ...
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    dir.viewToModelUpdate(newValue);
    control.markAsDirty();
    control.setValue(newValue, {emitModelToViewChange: false});
  });
  ...
}  
```
4. 所以當資料異動時，就會更新到 `ngModel` 所設定的變數

`ng_model.ts` 
```typescript
viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
}
```
### NG_VALUE_ACCESSOR
這個 provide 是讓 `ngModleChange` 所使用的 `$event` 不需要再寫成 `$event.target.value` 的魔法使，內部細節如下

![](http://i.imgur.com/Qsb228V.png)

`NG_VALUE_ACCESSOR` 在各類型的 `Control` 都有一份 `value accessor` ，而針對 `ngModel` 我們需留意的是 `DEFAULT_VALUE_ACCESSOR`

```typescript
export const DEFAULT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DefaultValueAccessor),
  multi: true
};
```

`DefaultValueAccessor`

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
在 `DefaultValueAccessor` 的 `registerOnChange` 與 `onChange` 間關係是，`ngModel` 會經 `setUpControl` 的方法將自訂方法透過 `registerOnChange` 註冊到 `onChange` 上，

`DefaultValueAccessor` 的 `@Directive` 的宣告的地方，有註冊當 `(input)` 事件發生時，會觸發 `_handleInput($event.target.value)`

```typescript
_handleInput(value: any): void {
    if (!this._compositionMode || (this._compositionMode && !this._composing)) {
        this.onChange(value);
    }
}
```

經過這一串的折騰，魔法就出現了，`ngModle` 的 `ngModelChange` 的 `EventEmiiter` 就會觸發回傳資料到頁面上，這也就是為什麼 `(ngModelChange)` 的 `$event` 不需要加上 target.value，又可以取道異動的資料

## Recap
以下是雙向繫結相關的流程順序
1. `[ngModel]`時會觸發 `ngOnChanges` 事件
2. 在 `ngOnChanges` 時，會執行 `setUpControl()` 方法
3. 在 `setupControl()` 內會註冊 `DefaultValueAccess` 執行 `registerOnChange`，並將 callback function 傳入
4. 透過 `registerOnChanges` 傳入的 callback function 會被綁定到 `onChanges` 上
5. 當 `(input)` 事件被觸發時，會執行 `_handleInput($event.target.value)` 的方法
6. 將傳入 `_handleInput(value)` 的值傳給註冊在 `onChange` 的 callback function
7. callback function 會執行 `ngModel` 裡的 `viewToModelUpdate(newValue)` 方法
8. 最後將 `viewToModelUpdate` 所接受到的值，透過 `ngModelChange` 的 EventEmiiter emit 稻葉面上
9. 完成整個雙向繫結的動作