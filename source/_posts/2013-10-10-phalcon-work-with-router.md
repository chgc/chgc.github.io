---
layout: post
title: '[Phalcon] Work with Router'
date: 2013-10-10 15:03
comments: true
categories: "Phalcon"
tag: "Phalcon"
---
# 啟動方式
```
$di->set('router', function () {
    $router = new \Phalcon\Mvc\Router();
    $router->add("/:controller/:action/:params", array(
        'controller' => 1,
        'action' => 2,
        'params' => 3
    ));

    return $router;
});
```
# Defining  Route
| Placeholder | Regular Expression | Usage |
| :------------| :-----------------| :----------- |
| /:module    | /([a-zA-Z0-9_-]+)  |Matches a valid module name with alpha-numeric characters only|
| /:controller| /([a-zA-Z0-9_-]+)  |Matches a valid controller name with alpha-numeric characters only |
| /:action    | /([a-zA-Z0-9_]+)   |Matches a valid action name with alpha-numeric characters only |
|/:params     |(/.*)*              |Matches a list of optional words separated by slashes. Use only this placeholder at the end of a route|
|/:namespace	|/([a-zA-Z0-9_-]+)	|Matches a single level namespace name
|/:int	|/([0-9]+)|	Matches an integer parameter

/:params : 只能放在router的最後面
		

#controller內取得route裡面參數的方式

```
 $this->dispatcher->getParam(0);
 $this->dispatcher->getParam('paraName');
 $this->dispatcher->getParams(); <=array
```

#如果是/?var=value

就用原本$_GET['']的方式取值就可以了