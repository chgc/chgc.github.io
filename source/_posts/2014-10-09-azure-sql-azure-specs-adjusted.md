---
layout: post
title: '[Azure] SQL Azure 規格調整比較'
date: 2014-10-09 06:30
comments: true
categories: "Azure"
tag: "Azure"
---
今天在將資料庫搬到Azure的環境上面，然後遇到了一個選擇的困擾.
原本SQL Azure的規格有兩種. Web和Business
新的規格有三種Basic, Standard, Premium. 
相關的規格說明請參閱[http://azure.microsoft.com/zh-tw/pricing/details/sql-database/]()

所以我就先試試看Basic方案，結果：速度一個慢, 但是比Web規格便宜 （真的不建議使用，用這個不如用S0)
Web的速度只有Premium 2可以跟的上, 價錢就是一個不可思議

那S0呢? 我嘗試後的結果是在可以接受的範圍內。但是價錢比Web貴了一點.
之後的規格，基本上就是價錢決定效能。

那我又想說如果自己用VM架設sql server呢..哈, 更貴. Orz. 直接放棄不考慮

最後只好還是繼續用要被淘汰的Web規格。然後抱著希望說等明年Web規格退休後，Azure可以提供更優價錢可以接受的選項。