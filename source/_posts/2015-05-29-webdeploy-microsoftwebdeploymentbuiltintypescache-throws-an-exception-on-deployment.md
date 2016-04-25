---
layout: post
title: '[WebDeploy] Microsoft.Web.Deployment.BuiltinTypesCache Throws an Exception on Deployment '
date: 2015-05-29 12:30
comments: true
categories: "Visual Studio"
tag: "Visual Studio"
---
when use vs2013 deploy website to azure. 

error message
```
The type initializer for 'Microsoft.Web.Microsoft.Web.Deployment.DeploymentManager' threw an exception.  The type initializer for 'Microsoft.Web.Microsoft.Web.Deployment.BuiltinTypesCache' threw an exception.
```

fix:

uninstall __dbsqlpackage provider__ . this packages no longer support.