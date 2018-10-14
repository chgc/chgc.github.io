---
layout: post
title: '[Angular] Angular Component Host Style'
comments: true
date: 2018-10-14 20:26:20
categories: Angular
tags: Angular
---

Angular 內有提供針對 Component 本體樣式描述的特別語法，分別是 `:host` 與 `:host-context` 這兩者使用，可以讓 Component 的樣式更模組化。而這篇文章就針對這兩者的用法做說明

<!-- more -->

# :host

`:host` 可用來描述本體 component 的樣式呈現方式，例如

```css
:host{
  display: block;
  height: 100px;
  background: grey;
}
```

這樣就可以針對 `Component` 本身做樣式設定

![](https://i.imgur.com/5AWX7Fv.png)

如果想要透過外部做額外的樣式複寫，這時候可以搭配 `:host(selector)` 的方式做設定

```css
:host(.active){
  background: red;
}
```

外部 html 的部分，當加上 `class="active"` 時，就會套用此樣式規則

```html
<app-counter class="active"></app-counter>
```

![](https://i.imgur.com/OzWjUMT.png)

# :host-context

進一步來看，如果想要依更外層的 `class` 來做判斷呢? 這時候可以使用 `:host-context(selector)` 的方式做設定

```css
:host-context(.theme-light) {
  background-color: #eef;
}
```

```html
<div class="theme-light">
	<app-counter class="active"></app-counter>
</div>
```

![](https://i.imgur.com/Du1T9Ah.png)

# 套用順序

`:host` 與 `:host-context` 的套用順序，會依 css style 內所寫的順序，最後面所設定的會優先套用。



# 參考資料

* [範例程式](https://stackblitz.com/edit/angular-host-style?file=src%2Fapp%2Fcounter%2Fcounter.component.css)