---
layout: post
title: '[Angular] monorepo 架構是否可行? '
comments: true
date: 2018-01-08 10:39:35
categories: Angular
tags: Angular
---

目前的管理程式碼，大致上可以分成兩種方式， mono 與 multiple repositories，通常是採 Multiple Repo，每一個系統都有自己的 repository 做版控，各自管理自己的套件版本，這聽起來很合理，但目前比較大型的軟體公司，像是 Google 、Facebook、Twitter 等。都是採取 mono repo 的開發模式(請留意上述公司都有自己一套的開發流程)

**※沒有哪一種方法好，哪一種方法不好。都有各自的優缺點 !** 

<!-- more -->

第一個問題是什麼是 Mono Repo?  Mono Repo 是將各應用程式及相關的程式碼都放在同一個 Repo 下做管理，讓程式碼共用的複雜度降低，這裡有一部在 YouTube 上面的影片，說明 Google 內部是如何使用 Mono Repo 跟為什麼要這樣子做

{% youtube W71BTkUbdqE%}

這樣子有什麼樣的好處呢? 在提好處之前，先來看 Multiple Repositories 的好處有哪些

1. Clean ownership
2. Better scale
3. Narrow Clones

這些好處看起來沒有什麼問題，既然沒有問題，為什麼會有 Mono Repo 這種模式出來呢? 主要原因我想是當系統或是產品線變大時，有些底層重複性高的程式碼，變的很難管理。想想看，在後端寫 C# 專案時，從原本的單一專案，延伸出 n-tier 的架構，是為了怎樣的原因。

我想要表達的是，Mono Repo 的出現就是為了要解決 Multiple Repositories 的問題，而 Mono Repo 的好處有

1. Better developer testing - 開發者可以立即知道自己修改的程式碼會不會造成其他系統出錯
2. Reduced code complexity - 因為程式碼都在一起，所以初階工程是可以很容易取得並了解公司內標準的程式編寫原則
3. Effective code reviews 
4. Sharing of common components
5. Easy refactoring

但沒有什麼東西是完美的，一定會有缺點的

Mono Repo 最大的問題是有沒有合適的工具做 CI/CD，當程式越大，建置測試的時間就會越久，所以要如何區分異動的程式碼所影響的範圍，而只針對影響範圍作測試的工作，以降低建置測試時間，這都是開發工具及環境設定要面對的問題。

另外一個問題是程式碼的健康程度，會影響 Mono Repo 所能帶出的效益。因為一個地方寫壞，有可能會造成整個系統的崩壞，Better developer testing 是一把雙刃劍，就看是從哪一個角度來看了

總結，兩種模式都有各自的優缺點，該如何結合兩者的優點，減少缺點，有什麼方式是 Angular 可以拿來用的，我覺得是值得思考的

# 延伸閱讀

* [Why Google Stores Billions of Lines of Code in a Single Repository](https://research.google.com/pubs/pub45424.html)
* [CI/CD FOR MICROSERVICES USING MONOREPOS](http://blog.shippable.com/ci/cd-of-microservices-using-mono-repos)