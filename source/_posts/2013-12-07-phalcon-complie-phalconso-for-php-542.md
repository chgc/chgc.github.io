---
layout: post
title: '[Phalcon] Complie Phalcon.so for php 5.4.2'
date: 2013-12-07 16:10
comments: true
categories: "Phalcon"
tag: "Phalcon"
---
緣由：Bluhost決定將所有的php版本升級到5.4.20, 那這樣子的行為會讓phalcon.so（php 5.3.27版本) 失效，然後問Bluehost, 他們不會提供降級的服務，也不會幫忙complie phalcon.so..所以，自己做。

作法：設定一個跟網頁空間一樣的環境, same os and php version, 然後在編譯phalcon, 成功編譯後上傳phalcon.so到主機上面。

步驟：
我是選擇centos6版，下載與主機服務商一樣作業位元的作業系統. (64bit or 32bit)
1. http://isoredirect.centos.org/centos/6/isos/x86_64/ <= 64位元的版本
2. 用Vmware將centos裝起來. 
3. 安裝完成後，用root的帳號登入，開啟terminal window
4. 由於第一次安裝，所以先執行 ```yum update``` 讓系統先將所有的套件更新到最新的狀態
5. ```yum groupinstall "Development Tools"``` 安裝一些跟開發有關係的元件，例如 git (必須安裝)
6. 安裝rpm yum repository information, 因為php5.4是在不同的repository. 安裝方式如下
   ```rpm -Uvh http://mirror.webtatic.com/yum/el6/latest.rpm```
7. 可以用 ```yum list | grep php``` 顯示跟php有關的套件。php54w就是我們要安裝的套件
8. 要安裝以下套件 ```yum install php54w php54w-mysql php54w-devel```
9. 利用git取得phalcon ```git clone --depth=1 git://github.com/phalcon/cphalcon.git```
10. ```cd cphalcon/build```
11. ```./install```
12. 如果complie成功, 會出現下面的畫面
![2013-12-8 上午 12-38-32.png](http://user-image.logdown.io/user/4862/blog/4871/post/165992/pIQa0NU7TnS8y1vSpiA5_2013-12-8%20%E4%B8%8A%E5%8D%88%2012-38-32.png)
13. complie完後的檔案可以在build/modules/紅色框起來的資料夾下面看到
![2013-12-8 上午 12-39-07.png](http://user-image.logdown.io/user/4862/blog/4871/post/165992/Qbwn0tyLTWqy6AOx2dGO_2013-12-8%20%E4%B8%8A%E5%8D%88%2012-39-07.png)
14. 將phalcon.so複製到網頁空間主機php放extensions的資料夾下，並編輯php.ini啟動phalcon.so
15. 打完收工