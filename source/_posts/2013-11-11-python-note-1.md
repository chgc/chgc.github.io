---
layout: post
title: '[python]筆記1'
date: 2013-11-11 14:47
comments: true
categories: "Python"
tag: "Python"
---
#String

string可以用 '' or "" 在 ''裡面可以用", 在"" 裡面可以用'

string連結的方式 + or 空白

但是如果是要連結變數和文字，則需要使用 +。數字和文字不可以做連接。

string[x] 可以直接將文字轉成陣列, 然後直接讀取

``` python
>>> word = 'Python'
>>> word[0]  # character in position 0
'P'
>>> word[5]  # character in position 5
'n'
>>> word[-1]  # last character
'n'
>>> word[-2]  # second-last character
'o'
>>> word[-6]
'P'
>>> word[0:2]  # characters from position 0 (included) to 2 (excluded)
'Py'
>>> word[2:5]  # characters from position 2 (included) to 5 (excluded)
'tho'
>>> word[:2] + word[2:]
'Python'
>>> word[:4] + word[4:]
'Python'
>>> word[:2]  # character from the beginning to position 2 (excluded)
'Py'
>>> word[4:]  # characters from position 4 (included) to the end
'on'
>>> word[-2:] # characters from the second-last (included) to the end
'on'
>>> word[::-1] # reverse a string
'nohtyp'
>>> len(word) # length of a string
6

+---+---+---+---+---+---+
 | P | y | t | h | o | n |
 +---+---+---+---+---+---+
 0   1   2   3   4   5   6
-6  -5  -4  -3  -2  -1
```

輸出文字:
1. v2.7 : print 'xxxxx'
2. v3.3 : print('xxxx')
 
文字重複顯示
```
>>> 'something'*3
'somethingsomethingsomething'
```

#Number
計算方式: 先乘除後加減，有內算到外，有左到右

number分interger and float, 區分方法是有沒有使用小數點

\+ - * : 加，減，乘

除有兩個方法:
1. / : 傳回 float
2. //: 傳回 integer

% : 傳回餘數
** : 次方
```
>>> 7/4
1.75
>>> 7//4
1
>>> 7%4
3
>>> 2**10
1024
```

a = b: 將b值指定給a

在interactive mode，可以利用 _ 取得上次的值
```
>>> 1+2
3
>>> 1+_
4
```

# Lists
```
>>> squares = [1, 2, 4, 9, 16, 25]
>>> squares
[1, 2, 4, 9, 16, 25]
>>> squares[1]
2
>>> squares[-1]
25
```

基本操作可以參考string的部分，一樣可以使用 + 做lists的連結

```
list.append(value) # add value to the list
```

二維陣列
```
>>> a = ['a', 'b', 'c']
>>> n = [1, 2, 3]
>>> x = [a, n]
>>> x
[['a', 'b', 'c'], [1, 2, 3]]
>>> x[0]
['a', 'b', 'c']
>>> x[0][1]
'b'
```
