---
layout: post
title: '[Angular] CLI 進度顯示遇上字體檔的雷 (windows 限定)'
comments: true
date: 2018-06-19 23:17:44
categories: Angular
tags: Angular
---

不確定從哪一版 CLI 開始，當執行 `ng serve` 時，命令視窗的進度表，就會出現很混亂的數字後，才會正常的顯示編譯結果，想說一開始就算了，GitHub 上也找不到相關的 Issue，就這樣子擺著。今天實在受不了，就開始追到底是什麼原因造成這神奇的現象

<!-- more -->

這神奇的現象，用簡單的影片表示一下 (使用字型: 細明體)

{% youtube z_a13DhNcMI %}

# 開始追蹤

當然一開始是從 Angular CLI 下手，但很不幸的，Angular CLI 所使用的進度顯示是透過 Webpack 的 `ProgressPlugin` 來完成的

```typescript
...
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
...
if (buildOptions.progress) {
    extraPlugins.push(new ProgressPlugin({ profile: buildOptions.verbose, colors: true }));
}
```

只好前往 `ProgressPlugin` 探索了，還好 `ProgressPlugin`  只是單純一隻 js 檔案，應該很容易找 (才怪)

```javascript
const defaultHandler = (percentage, msg, ...args) => {
		let state = msg;
		const details = args;
		if (percentage < 1) {
			percentage = Math.floor(percentage * 100);
			msg = `${percentage}% ${msg}`;
			if (percentage < 100) {
				msg = ` ${msg}`;
			}
			if (percentage < 10) {
				msg = ` ${msg}`;
			}
			for (let detail of details) {
        if (!detail) continue;
				if (detail.length > 40) {
          detail = `…${detail.substr(detail.length - 39)}`;
				}
				msg += ` ${detail}`;
			}
		}
		if (profile) {
			state = state.replace(/^\d+\/\d+\s+/, "");
			if (percentage === 0) {
				lastState = null;
				lastStateTime = Date.now();
			} else if (state !== lastState || percentage === 1) {
				const now = Date.now();
				if (lastState) {
					const stateMsg = `${now - lastStateTime}ms ${lastState}`;
					goToLineStart(stateMsg);
					process.stderr.write(stateMsg + "\n");
					lineCaretPosition = 0;
				}
				lastState = state;
				lastStateTime = now;
			}
		}
		goToLineStart(msg);
		process.stderr.write(msg);
	};

	const goToLineStart = nextMessage => {
    let str = "";
		for (; lineCaretPosition > nextMessage.length; lineCaretPosition--) {
			str += "\b \b";
		}
		for (var i = 0; i < lineCaretPosition; i++) {
			str += "\b";
		}
    lineCaretPosition = nextMessage.length;
		if (str) process.stderr.write(str);
	};

	return defaultHandler;
};
```

這是很接近尾巴的搜尋結果，我知道畫面顯示出亂子，一定是這裡面的某一行有問題。經過 1 個小時的驗證，上述的程式碼並沒有錯，但是有抓到一個關鍵點，當我把 `…` 換成其他符號時，執行結果就會很漂亮的顯示進度表，

這樣應該既是這個符號在作怪，但到底是哪裡出錯了。最後與保哥研究的結果，竟然是字型的關係

# 觀察結果

我電腦 windows 下命令視窗所使用的字型是預設字型，**細明體**，就我自己的了解，細明體應該是等寬字型，所謂的等寬字型是指，英文數字在畫面上所顯示的寬度是一樣的，而中文字因為是兩個字元，所以是兩個英文字的寬度

![](https://i.imgur.com/ifbXijB.png)

同樣的文字換成新細明體就會視不同的顯示方式

![](https://i.imgur.com/cnPiOzT.png)

`Fira Code` 字型

![](https://i.imgur.com/cDR8duI.png)

到這裡，我們知道字型的不同，對於每一個字寬度的認定是不同的，而 webpack 的 `ProgressPlugin` 是使用字串長度做一些黑魔法的事情，(刪除原本的顯示文字，並在原本位置上顯示新的文字)

而 `…` 在不同字體上的顯示方式又是如何呢?

* 新細明體

  ![](https://i.imgur.com/X4FzpxW.png)

* 細明體

  ![](https://i.imgur.com/s7ZdpwO.png)

* Fira Code

  ![](https://i.imgur.com/RUB96ij.png)

沒錯，細明體的 `…` 竟然被判斷成全型字(兩個字元)，難怪在計算要刪除文字長度跟顯示時會出亂子，兇手就是你

驗證一下，將命令視窗的字型改成【點陣字體】後再跑一次，看看會不會正常

{% youtube eGH8dKdlB1I %}



# 解決方案

1. 無視他，既然知道是字型的問題而非程式問題，可以選擇無視他
2. 修正命令視窗的預設字體，設定方式可以參考保哥這篇 [讓你的命令提示字元或 WSL 擁有一個美麗等寬的字型設定](https://blog.miniasp.com/post/2017/12/06/Microsoft-YaHei-Mono-Chinese-Font-for-Command-Prompt-and-WSL.aspx)



# 參考資料

* [「細明體」和「新細明體」差在哪裡？](http://funidea.shu.edu.tw/media/show/id/722)
* [讓你的命令提示字元或 WSL 擁有一個美麗等寬的字型設定](https://blog.miniasp.com/post/2017/12/06/Microsoft-YaHei-Mono-Chinese-Font-for-Command-Prompt-and-WSL.aspx)