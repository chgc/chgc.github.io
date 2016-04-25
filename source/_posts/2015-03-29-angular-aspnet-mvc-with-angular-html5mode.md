---
layout: post
title: '[Angular] ASP.NET MVC with angular Html5Mode'
date: 2015-03-29 09:30
comments: true
categories: "Angular"
tag: "Angular"
---
經過一段時間的實驗. 在別的framework找到可以讓backend的route支援angular html5mode了.
基本方式是如果我路由規則沒有定義的，全部指向index頁面(有ng-view的)

所以基於這個原則. mvc的路由規則就要稍微調整一下.
將原本的DefaultApp修改一下
```
// 舊
 routes.MapRoute(
                name: "DefaultApp",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
// 新
 routes.MapRoute(
                name: "DefaultApp",
                url: "app/{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
```

然後新增
```
    routes.Add(new SingleRoute());
```
SingleRoute Class
```
public class SingleRoute : RouteBase
    {
        public override RouteData GetRouteData(HttpContextBase httpContext)
        {
            var data = new RouteData(this, new MvcRouteHandler());
            data.Values.Add("controller", "Home");
            data.Values.Add("action", "Index");
            return data;
        }

        public override VirtualPathData GetVirtualPath(RequestContext requestContext, RouteValueDictionary values)
        {
            return null;
        }
    }
```

Client angular side:
```
 $stateProvider
          .state('state1', {
              url: "/state1",
              templateUrl: "app/Home/state1" <= mvc route rule
         })
 $locationProvider.html5Mode(true).hashPrefix('!')
 
```

以上
