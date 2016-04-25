---
layout: post
title: '[Javascript] ES2015 - Destructuring'
date: 2015-10-18 13:08
comments: true
categories: "Javascript"
tag: "ES2015"
---
# Destructuring
可以將值從陣列或是物件裡取出並設定到變數上

## syntax
```
[a, b] = [1, 2]
[a, b, ...rest] = [1, 2, 3, 4, 5]
{a, b} = {a:1, b:2}
```

## Destructuring arrays
```
var foo = ["one", "two", "three"];

// without destructuring
var one   = foo[0];
var two   = foo[1];
var three = foo[2];

// with destructuring
var [one, two, three] = foo;
```
其他用法
1.Multiple-value returns

```
function f() {
    return [1, 2];
}
var a, b;
[a, b] = f();
console.log("A is " + a + " B is " + b);
```
   
2.Ignoring some returned values

```
function f() {
    return [1, 2, 3];
}
var a, b;
[a, ,b] = f();
console.log("A is " + a + " B is " + b);
// A is 1 B is 3
```

3.衍伸用法: Pulling values from a regular expression match
```
var url = "https://developer.mozilla.org/en-US/Web/JavaScript";

var parsedURL = /^(\w+)\:\/\/([^\/]+)\/(.*)$/.exec(url);
var [, protocol, fullhost, fullpath] = parsedURL;

console.log(protocol); // logs "https"
```


## Destructuring objects
```
var o = {p: 42, q: true};
var {p, q} = o;

console.log(p); // 42
console.log(q); // true 
```

另外一種用法, 將物件裡的值設定到新的變數名稱上
```
// syntax
// {object.propertyName: VariableName} = object

// Assign new variable names
var o = {p: 42, q: true};
var {p: foo, q: bar} = o;

console.log(foo); // 42
console.log(bar); // true  
```
衍生用法: Function argument defaults
```
var [missing = true] = [];
console.log(missing);
// true

var { message: msg = "Something went wrong" } = {};
console.log(msg);
// "Something went wrong"

var { x = 3 } = {};
console.log(x);
// 3

function removeBreakpoint({ url, line, column }={}) {
  // ...
}
```

```
function drawES6Chart({size = 'big', cords = { x: 0, y: 0 }, radius = 25} = {}) 
{
  console.log(size, cords, radius);
  // do some chart drawing
}

drawES6Chart({
  cords: { x: 18, y: 30 },
  radius: 30
});
```
另外一種情境 Module (non-ES6) loading
```
const { Loader, main } = require('toolkit/loader');
```

REF: [Several demos and usages for ES6 destructuring.](https://gist.github.com/mikaelbr/9900818)