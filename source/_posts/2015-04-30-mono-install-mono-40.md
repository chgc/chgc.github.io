---
layout: post
title: '[Mono] Install Mono'
date: 2015-04-30 08:46
comments: true
categories: "Note"
tag: "Mono"
---
取得最新的Mono
http://www.mono-project.com/download/

Building Mono From a Git Source Code Checkout

To build Mono in 64 bit mode instead use:
```
PATH=$PREFIX/bin:$PATH
git clone https://github.com/mono/mono.git
cd mono
./autogen.sh --prefix=$PREFIX --disable-nls
make
make install
```