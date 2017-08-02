---
layout: post
title: '[Angular] Protractor'
comments: true
date: 2017-08-02 09:07:47
categories: Angular
tags: Angular
---

Protractor 也是一個出自 Google 之手的 E2E 測試框架，當初是為了測試 AngularJS 所開發出來的 E2E，當然也可以用來測試其他的一般網站，跟 Angular 2 (廢言)。雖然 Protractor 出來很久了，但是一直都沒有仔細的去研究怎麼使用，這篇文章就來記錄一些。

(不談怎麼設定環境，因為 Angular CLI 已經幫我們處理好了)

<!-- more -->

#  目的

E2E 是利用程式來模擬使用者操作網頁的動作，測試網頁程式有符合預期的實際操作流程與結果



# 語法

## browser

跟瀏覽器有關的行為，可透過這物件控制，列出幾個常用的方法

* [get](http://www.protractortest.org/#/api?view=ProtractorBrowser.prototype.get)：網址改變

* [getCurrentUrl](http://www.protractortest.org/#/api?view=webdriver.WebDriver.prototype.getCurrentUrl)：取得目前的網址

* [wait](http://www.protractortest.org/#/api?view=webdriver.WebDriver.prototype.wait)：等到條件符合後，在繼續執行

* [getTitle](http://www.protractortest.org/#/api?view=webdriver.WebDriver.prototype.getTitle)： 取得網頁的 `<title>` 內容

* [takeScreenshot](http://www.protractortest.org/#/api?view=webdriver.WebDriver.prototype.takeScreenshot)：擷取網頁畫面，範例程式如下

```typescript
  // at the top of the test spec:
  const fs = require('fs');

  // abstract writing screen shot to a file
  function writeScreenShot(data, filename) {
    const stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
  }

  ...
  it('should have selected', () => {
    page.navigateTo();
    browser.takeScreenshot().then(function(png) {
      writeScreenShot(png, 'exception.png');
    });    
  })
```




## by

`by` 是定位器 (locator)，用來搜尋 element 使用的，常用的方法有

* 單一 element
  * [css](http://www.protractortest.org/#/api?view=webdriver.By.css)：使用 `CSS Selector` 來定位 element
  * [id](http://www.protractortest.org/#/api?view=webdriver.By.id)：利用 Id 來定位 element
* 一個或多個 elements
  * [linkText](http://www.protractortest.org/#/api?view=webdriver.By.linkText)：利用連結文字來定位 elements
  * [partialLinkText](http://www.protractortest.org/#/api?view=webdriver.By.partialLinkText)：利用**部分**連結文字來定位 elements 
  * [name](http://www.protractortest.org/#/api?view=webdriver.By.name)：利用 name 來定位 elements
  * [className](http://www.protractortest.org/#/api?view=webdriver.By.className)：利用 css class 來定位 elements
  * [tagName](http://www.protractortest.org/#/api?view=webdriver.By.tagName)：利用 tag name 來定位 elements
  * [xpath](http://www.protractortest.org/#/api?view=webdriver.By.xpath)：利用 xpath 來定位 elements (可透過瀏覽器取得該元件的 xpath)
* 尋找按鈕(button) - 建議使用 `by.css` 取代
  - [buttonText](http://www.protractortest.org/#/api?view=ProtractorBy.prototype.buttonText): 用按鈕名稱找 `button`
  - [partialButtonText](http://www.protractortest.org/#/api?view=ProtractorBy.prototype.partialButtonText)：根據部分按鈕名稱找 `button`



## element

element 需要搭配 locator 使用，進而取得想要的 HTMLElement。常用方法([完整文件](http://www.protractortest.org/#/api?view=ElementFinder))如下

* element(locator)
  * [isPresent](http://www.protractortest.org/#/api?view=ElementFinder.prototype.isPresent)：是否有符合條件的 element
  * [click](http://www.protractortest.org/#/api?view=webdriver.WebElement.prototype.click)：執行 click 動作
  * [sendKeys](http://www.protractortest.org/#/api?view=webdriver.WebElement.prototype.sendKeys)：送出鍵盤動作。例如：打字到 Input 上
  * [getAttribute](http://www.protractortest.org/#/api?view=webdriver.WebElement.prototype.getAttribute)： 取得 element 的 屬性值
  * [getText](http://www.protractortest.org/#/api?view=webdriver.WebElement.prototype.getText)： 取得 `innerText`
  * [isEnabled](http://www.protractortest.org/#/api?view=webdriver.WebElement.prototype.isEnabled)：判斷 element 是否有 disabled 屬性
  * [isSelected](http://www.protractortest.org/#/api?view=webdriver.WebElement.prototype.isSelected)：判斷 element 是否 selected 屬性
  * [submit](http://www.protractortest.org/#/api?view=webdriver.WebElement.prototype.submit)： 執行 Form submit 動作
  * [clear](http://www.protractortest.org/#/api?view=webdriver.WebElement.prototype.clear)：清除 value 欄位
  * [isDisplayed](http://www.protractortest.org/#/api?view=webdriver.WebElement.prototype.isDisplayed)：判斷 element 是否有顯示在畫面上 ，可能被設定 visibility 被設定為 false
* element.all(locator)
  - [get](http://www.protractortest.org/#/api?view=ElementArrayFinder.prototype.get)：使用 `ElementArrayIndex` 取得特定位置的 element
  - [count](http://www.protractortest.org/#/api?view=ElementArrayFinder.prototype.count)：符合條件的 element 數量
  - [isPresent](http://www.protractortest.org/#/api?view=ElementArrayFinder.prototype.isPresent)：是否有符合條件的 element



# 小技巧

## 加快 E2E 的測試速度

#### 關掉 serve

預設的 E2E 是會先執行 `serve` 後在進行測試，可是這樣子的預設行為，都會因為 `server` 的建置時間而拖慢測試速度。所以可以將這兩個動作分別執行。 E2E 可以關掉 `serve`的動作，指令如下

> ng e2e --serve=false

以上的設定方式，當執行 `ng e2e`時，就只會單純跑測試了。

#### 使用 chrome headless

修改 protractor.conf.js，新增 `chromeOptions` 區塊內容，這樣的設定在執行 e2e 時，就不會跳出瀏覽器了

```typescript
...
 capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: [ "--headless", "--disable-gpu", "--window-size=1920, 1080" ]
    }
 },
 ...
```

 詳細說明請參閱[燈哥的文章](http://oomusou.io/protractor/protractor-headless-chrome/)



## 使用 PageObject

一個頁面上的 Element 很多，大多數的時間，這些 Element 都因為不同的操作流程而被重複操作著，這時候利用 PageObject 的方式將 Element 封裝。

```typescript
import {browser, by, element} from 'protractor';

export class NgRPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}
```

使用方式如下

```typescript
import {NgRPage} from './app.po';

describe('ng-r App', () => {
  let page: NgRPage;

  beforeEach(() => {
    page = new NgRPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('todos');
  });
});
```

##  element 與 element.all 的混搭

`element(locator)` 只能取回單一元素，但是可以串接下去的。例如說，我想要取得某個 select options 的值，寫法可以有兩種

```typescript
// method 2
element(by.css('ul>li'));  
// method 2
element(by.name('sel')).all(by.css('li'))
```

我個人是比較喜歡第二種的寫法，比較清爽一點


# 參考資料

* [Protractor API](http://www.protractortest.org/#/api)
* [pageobject.io/](http://pageobject.io/)
* [如何使 Protractor 跑 Headless Chrome?](http://oomusou.io/protractor/protractor-headless-chrome/)