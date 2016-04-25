---
layout: post
title: '[Javascript] ES2015 - Classes, Class inheritance'
date: 2015-10-26 15:37
comments: true
categories: "Javascript"
tag: "Javascript" 
---
## Classes
Class的組成元素:

1. Constructor
2. Prototype methods: 



3. Static methods: 不需要New class就可以使用, 類似C#的Static

```
class Polygon {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
  
  get area() {
    return this.calcArea()
  }

  calcArea() {
    return this.height * this.width;
  }
  
  static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.sqrt(dx*dx + dy*dy);
   }
    
}
```
**Hoisting: Class並沒有Hoisting特性，所以需要先定義才可以使用，這點須注意**

## Class inheritance
Class也可以有繼承的性質
範例
```
class Animal { 
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(this.name + ' makes a noise.');
  }
}

class Dog extends Animal {
  speak() {
    console.log(this.name + ' barks.');
  }
}
```

### Super的用法
Super用來呼叫Parent的function

```
class Cat { 
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(this.name + ' makes a noise.');
  }
}

class Lion extends Cat {
  speak() {
    super.speak(); // <= this call Cat's speak function
    console.log(this.name + ' roars.');
  }
}
```