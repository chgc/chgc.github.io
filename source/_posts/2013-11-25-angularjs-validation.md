---
layout: post
title: '[AngularJs] Validation'
date: 2013-11-25 06:10
comments: true
categories: "Angular"
tag: "Angular"
---
#Form Validation with angularJs
Basic:
in .js
$scope.form = {}
$scope.form.$valid ==> 判斷form(name="form")內的物件是否有驗證有錯誤的物件存在

用法:
formName.inputFieldName.property

**Unmodified form**
A boolean property that tells us if the user has modified the form. This is true if the user hasn't touched the form, and false if they have:
```
formName.inputFieldName.$pristine;
```

**Modified form**
A boolean property if and only if the user has actually modified the form. This is set regardless of validations on the form:
```
formName.inputFieldName.$dirty
```

**Valid form**
A boolean property that tells us that the form is valid or not. If the form is currently valid, then this will be true:

```
formName.inputFieldName.$valid
```
**Invalid form**
A boolean property that tells us that the form is invalid. If the form is currently invalid, then this will be true:
```
formName.inputFieldName.$invalid
```

The last two properties are particularly useful for showing or hiding DOM elements. They are also very useful when setting a class on a particular form.

**Errors**
Another useful property that AngularJS makes available to us is the $error object. This object contains all of the validations on a particular form and if they are valid or invalid. To get access to this property, use the following syntax:
```
formName.inputfieldName.$error
```

###Addtional CSS classes
ng-valid Is set if the form is valid.
ng-invalid Is set if the form is invalid.
ng-pristine Is set if the form is pristine.
ng-dirty Is set if the form is dirty.

##Input Validation
```
<input
       ng-model="{string}"
       [name="{string}"]
       [required]
       [ng-required="{boolean}"]
       [ng-minlength="{number}"]
       [ng-maxlength="{number}"]
       [ng-pattern="{string}"]
       [ng-change="{string}"]>
</input>
```
####可驗證項目(內建)
requried
ng-minlength
ng-maxlength

####$error所對應的項目
formName.inputfieldName.$error.requried
formName.inputfieldName.$error.minlength
formName.inputfieldName.$error.maxlength