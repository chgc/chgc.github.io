---
layout: post
title: '[Laravel] Blade template'
date: 2013-10-26 08:42
comments: true
categories: "Laravel"
tag: "Laravel 4"
---
two ways to use it

#1 use blade on controller

in controller, you need to assign a template for controller.

```php 
protected $layout = 'layouts.master';
```

and then in each function action. assign whatever need to assign for show content on template. like in blade template. I have a content section. Therefore, i need to set a value or view to "Content"

```php
$this->layout->content = something or View::make('something');
```

in blade template. there are 2 ways to define var.

1. @yield('something')

2. {{something}}

if use first method; then in view, it needs to create a section something. ex

```
@section('content')
xxxx
@endsction
```

for method 2. no need to create a section to contain page content.
