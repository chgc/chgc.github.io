---
layout: post
title: '[C#] work with xml and xsd'
date: 2014-02-27 02:46
comments: true
categories: "CSharp"
tag: "C#"
---
# 1.在xsd裡描述minOccurs="0"時 , 所建立的xml裡面要手動控制是否輸出value
c#可以用class轉換成xml, 但是在class裡面的property並不是每一個都需要輸出，有些事非必要性的欄位。
這需要在property欄位另外加上一個欄位來做設定

```
  class demo{
  	public string field1;
    public string field2;
    public customEnum field3;
    // 以下這行是關鍵
    [XmlIgnore]
    public bool field3Specified;
  }
```
## 語法是 propertyNameSpecified 

[XmlIgnore] : 功用是在輸出xml時，忽略此欄位

依上列的案例來說，如果 field3Specified=true, 則輸出field3欄位, 如果設定成false, 則不輸出field3

# 2.使用xsd.exe將.xsd檔案轉換成class
在visual studio tools下-> 命令視窗 -> xsd

ref: http://msdn.microsoft.com/en-us/library/x6c1kb0s(v=vs.110).aspx

將.xsd檔案轉換成class的方式為
```
xsd file.xsd /c
```