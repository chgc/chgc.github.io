---
layout: post
title: '[EF] Connection resiliency'
date: 2015-06-12 09:50
comments: true
categories: "Entity Framework"
tag: "Entity Framework"
---
    - connection retry policy
    - works great with async
    - four modes
        - DefaultExcutionStrategy
        - DefaultSqlExecutionStrategy
        - DbExecutionStrategy
        - SqlAzureExecutionStrategy
    - throws RetryLimitExceededException
    
##Configuration

```
public class MyConfiguration : DbConfiguration 
{ 
    public MyConfiguration() 
    { 
        SetExecutionStrategy("System.Data.SqlClient", 
        () => new SqlAzureExecutionStrategy(1, TimeSpan.FromSeconds(30))); 
    } 
}
```
[MSDB](https://msdn.microsoft.com/zh-tw/library/system.data.entity.sqlserver.sqlazureexecutionstrategy(v=vs.113).aspx)

[參考網址](https://msdn.microsoft.com/en-us/data/dn456835.aspx)