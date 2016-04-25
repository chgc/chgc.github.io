---
layout: post
title: '[ASP.NET MVC]HTMLHelper work with AngularJs'
date: 2014-05-01 07:58
comments: true
categories: "ASP.NET MVC"
tag: "MVC 4"
---
當要在htmlHelper裡面使用angularjs的屬性時, 原本的ng-model變成ng_model, 將 **-** 變成 **_** 即可

例如:
```
@Html.DropDownList("dropdown", (IEnumerable<SelectListItem>)ViewBag.items, new { ng_model = "currentSelect", ng_change = "selectChanges()" })

會產生
<select id="dropdown" name="dropdown" ng-change="selectChanges()" ng-model="currentSelect">
  <options>something</options>*n
</select>
```