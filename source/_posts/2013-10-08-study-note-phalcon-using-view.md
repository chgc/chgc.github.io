---
layout: post
title: '[Phalcon] Using View'
date: 2013-10-08 14:38
comments: true
categories: "Phalcon"
tag: "Phalcon"
---
#Hierarchical Rendering
Phalcon當在使用View的時候，執行的順序是
1. app/views/index.volt
2. app/views/layouts/指定.volt(有[指定時][1]，才會發生)
3. {% raw %}app/views/layouts/{{controllerName}}.volt{% endraw %} 
4. {% raw %}app/views/{{controllerName}}/xxx.volt{% endraw %}

依造這種順序，
{% raw %}
在index.volt裡面的{{content()}}，就會去呼叫app/views/layouts裡面的內容, 然後再app/views/layouts裡面的{{content()}}就是呼叫app/views/{{controllerName}}/xxx.volt的內容
{% endraw %}

在Controller裡面所設定的變數，則上述三種xxx.volt都可以用

[1]: 如果要指定template時, 可以用下列的方式設定, 這樣子就會去讀取app/views/layouts/common.volt的內容了, 
```
		public function initialize()
    {
        $this->view->setTemplateAfter('common');
    }
```
{% raw %}
這一個指定template的動作，執行順序會插在app/views/index.volt跟app/views/layouts/{{controllerName}}.volt中間
{% endraw %}

- - -

#Using Partials

如果想要在view中間插入partials的方式很簡單

如果是使用volt語法的: 

```
{{ partial(view path) }}
//with parameters 
{{ partial(view path, ['links': $links]) }}
```

一般的語法

```
<?php $this->partial(view path) ?>
//with parameters 
<?php $this->partial(view path, array('id' => $site->id, 'size' => 'big')) ?>
```



