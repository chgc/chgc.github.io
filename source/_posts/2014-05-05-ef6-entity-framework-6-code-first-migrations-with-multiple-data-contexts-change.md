---
layout: post
title: '[EF6] Entity Framework 6 Code First Migrations with Multiple Data Contexts (轉)'
date: 2014-05-05 04:15
comments: true
categories: "Entity Framework"
tag: "EF6"
---
Ref: http://www.dotnet-tricks.com/Tutorial/entityframework/2VOa140214-Entity-Framework-6-Code-First-Migrations-with-Multiple-Data-Contexts.html

## 如何動態產生Database

如果利用Code first的方式，搭配DbMigration即可完成工作

* DBContext.cs

```DBContext.cs
public class DemoContext : DbContext
    {
        public DemoContext() { }
        public DemoContext(string ConnectionString)
            : base(ConnectionString)
        {            
            Database.SetInitializer(new CustomInitializer());
            Database.Initialize(true);
        }        
        public DbSet<Blog> Blogs { get; set; }
    }
```

* CustomInitializer.cs

```c#
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Migrations;
    using System.Data.Entity.Migrations.Infrastructure;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<DemoContext>
    {        
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
            MigrationsDirectory = @"Migration";
        }
      

        protected override void Seed(DemoContext context)
        {            
        }
    }

    class CustomInitializer : IDatabaseInitializer<DemoContext>
    {
        public void InitializeDatabase(DemoContext context)
        {
            if (!context.Database.Exists() || !context.Database.CompatibleWithModel(false))
            {
                var configuration = new Configuration();
                configuration.TargetDatabase = new DbConnectionInfo(context.Database.Connection.ConnectionString, "System.Data.SqlClient");
                var migrator = new DbMigrator(configuration);                
                migrator.Update();                
            }
        }
    }
```

* client端

```
using (var db = new AtaBookContext(connection1)){}
using (var db = new AtaBookContext(connection2)){}
```

connection1和connection2分別指到不同的資料庫，EF就會根據連線字串的設定產生相對應的資料庫