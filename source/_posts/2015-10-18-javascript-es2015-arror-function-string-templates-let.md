---
layout: post
title: '[Javascript] ES2015 - Arrow function, String templates, let, const'
date: 2015-10-18 11:46
comments: true
categories: "Javascript"
tag: "ES2015" 
---
在ES2015裡面，幾個比較大的改變Part1
## Arrow Function
人真的可以在懶惰一點，為了不要寫__function__這幾個字，就有 ()=>{} 的出現。這就是Arror Function
跟Lambda的表示法很像, 真的用法也是跟那個一樣

```
// Old
var old = function(n) {
    return n * n;
};

// with Arror Functions express 1
let new_1 = (n) => n * n;

// with arror function express 2
let new_2 = (n) => {
	return n * n;
};
```

另外一個要注意的是Arrow Scope的問題, 

```
var hendrik = {
    this.name = "Hendrik";
    
    sayHello: (names) => {
        names.forEach((name)=>{
          console.log(`${this.name} greets ${name}`);
        });
    }
}
hendrik.sayHello(['frikkie']);
// output 
// hendrik greets frikkie
```

## String templates
最快樂的事情非屬這個, 文字串的組合可以用 ` (鍵盤左上角流水符號的那個鍵), 可以讓你多行編輯文字字串
在配合 ${變數} 來將變數顯示在文字裡面。 這樣子就不用一堆的 '加號' 來串文字了，超快樂的

```
// old
function sayHello(name, surname){
    console.log('hello there ' + name + ' ' + surname + ', the time is now ' + new Date());
}

// new way 
function sayHello_new(name, surname){
    console.log(`hello there ${name} ${surname}, 
    the time is now ${new Date()}`);
}

```

FYI: 新版的C#/VB.net也有將此功能加入，已經可以不用string.format + 無數的{流水號}了

## Let
**非常重要** 要將使用var來定義變數的改用let來定義變數, 這樣子就可以避免同樣名稱的變數在不同的scope被覆蓋的情形發生

```
//=== old ===
 var 
     name = 'Fido',
     breed = 'schnauzer',
     owners = ['Hendrik', 'Alice']
 ;
 
 console.log(name + '(' + breed + '):');
 
 for(var i = 0; i < owners.length; i++){
     var name = owners[i];
 
     console.log('Owner ' + name);
}

console.log(name);
//output
// Fido(schnauzer):
// Owner Hendrik
// Owner Alice
// Alice (被改變掉了)

//=== new ===
let fname = 'Fido',
    breed = 'schnauzer',
    owners = ['Hendrik', 'Alice']
;

console.log(`${fname} (${breed}):`);

for(let i = 0; i < owners.length; i++){
    let fname = owners[i];
    console.log(`Owner ${fname}`);
}

console.log(fname);
// output:
// Fido (schnauzer):
// Owner Hendrik
// Owner Alice
// Fido
```

## const
常數，當變數一旦被指定為const時，就不可以被改變了
```
const pi = Math.PI;

pi = 123;
// this will cause error message
```