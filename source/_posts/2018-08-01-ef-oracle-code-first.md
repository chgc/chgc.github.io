---
layout: post
title: '[EF6] Oracle with Code First 設定'
comments: true
date: 2018-08-01 15:07:15
categories: Entity Framework 
tags:  Entity Framework 
---

近期有一個案子有可能會用到 Oracle， 所以在還沒有正式開跑之前，先來研究一下如何與 Entity Framework 搭配使用。但由於 EF Core 對 Oracle 的支援必須要等到下半年度才可能會有 Oracle 官方釋出的 drive，所以這邊還是先乖乖地使用 EF6 了。

至於如何架設自己的 Oracle 11g Express 資料庫，就要先從網路上面查詢怎麼架設了。這文章我之後再補

<!-- more -->

# 事前準備

在開始之前，先假設 Oracle 的環境是非常乾淨的，就只能用 system 帳號做連線，我們可以先用 `Oracle SQL Developer` 工具來測試連線，使用 system 的帳號登入後，我們要先新增使用者

## 建立 TableSpace

由於 Oracle 只能有一個資料庫 (Database)，當想要做到多資料庫的格式，就得透過 Tablespace 的方式來完成。Tablespace 可以想程式一個資料表的集合，而使用者也可以指定使用特定的 Tablespace，這表示一個使用者帳號就可以代表是一個資料庫

建立 tablespace 的方法，如果是使用 `Oracle SQL Developer` 者，就需要透過指令的方式來建立，建立後，似乎沒有辦法再改名稱了。所以要小心

```sql
CREATE  TABLESPACE "NewTableSpace" 
DATAFILE 'C:\ORACLEXE\APP\ORACLE\ORADATA\XE\Northwind' SIZE 100 M -- 存放位置與預設初始檔案大小
AUTOEXTEND ON NEXT 10 M -- 當資料大小已經增加到原先設定容量時，是否會自動依據設定增加容量
MAXSIZE UNLIMITED ; -- 檔案無大小上限
```



## 建立使用者

來新增一個使用者，等一下做 EF 時可以用，新增步驟如下

(使用 Oracle SQL Developer Tool)

1. 連線至 Oracle DB

2. 其他使用者，滑鼠右鍵開啟選單，選擇建立使用者

   ![](https://i.imgur.com/r6k6eiy.png)

3. 輸入想要新增的使用者名稱與密碼

   ![](https://i.imgur.com/2CXF9Il.png)

4. 選擇剛剛所新增的 TableSpace

   ![](https://i.imgur.com/YVfbsqK.png)

5. 授權角色設定: (依自己的需要設定)

   ![](https://i.imgur.com/dWXidrD.png)

   1. CONNECT：授與使用者可以連線資料庫並執行基本的資料庫操作
   2. RESOURCE：可以讓使用者去建立資料庫的物件，如TABLE. TRIGGER, PROCEDURE
   3. DBA：可以讓使用者存取所有其他使用者的資料庫物件與管理資料庫

6. 系統權限設定: 我這邊基本上先全部開放，(一樣依自己的需求做設定)

   ![](https://i.imgur.com/X0psghQ.png)

7. 完成設定後就按下【套用】執行，完成使用者建立

# 建立 .NET 專案

1. 先建立一個 Console 專案

   ![](https://i.imgur.com/KECe5OQ.png)


## 安裝 Oracle EntityFramework 套件

1. 打開 Nuget 管理工具

   ![](https://i.imgur.com/rzZNSEF.png)

2. 搜尋 `Oracle.ManagedDataAccess.EntityFramework`

   ![](https://i.imgur.com/H2oycF1.png)

3. 安裝 `Oracle.ManagedDataAccess.EntityFramework`，檢查 Reference 是否有安裝成功

   ![](https://i.imgur.com/rcdePlT.png)

※ 在 readme.txt 的內容要稍微看一下

> Note: The 32-bit "Oracle Developer Tools for Visual Studio" download from http://otn.oracle.com/dotnet is 
> required for Entity Framework design-time features. This NuGet download does not enable design-time tools; it 
> only provides run-time support. This version of ODP.NET for Entity Framework supports Oracle Database version 
> 10.2 and higher.

## 設定連線

1. 打開 app.config，在最後面可以看 oracle 連線的相關資訊

   ```
   <oracle.manageddataaccess.client>
     <version number="*">
       <dataSources>
         <dataSource alias="SampleDataSource" descriptor="(DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=ORCL))) "/>
       </dataSources>
     </version>
   </oracle.manageddataaccess.client>
   <connectionStrings>
     <add name="OracleDbContext" providerName="Oracle.ManagedDataAccess.Client"
   connectionString="User Id=oracle_user;Password=oracle_user_password;Data Source=oracle"/>
   </connectionStrings>
   ```

   請依自己的環境做設定調整，例如 HOST 位置、SERVICE_NAME、User ID 、password 等

2. 在 `connectionString` 內提到的 `Data Source` 是指上方的 `<dataSource>` 名稱

   ![](https://i.imgur.com/6qI3wMa.png)

   

## 建立 DbContext

這裡的動作與一般操作 Entity Framework 是一樣的

* `OracleDbContext.cs`

  ```csharp
  using System.Data.Entity;
  
  namespace BlogDemo
  {
    public class OracleDbContext : DbContext
    {
      public DbSet<Employee> Employees { get; set; }
  
      protected override void OnModelCreating(DbModelBuilder modelBuilder)
      {
        // 資料表隸屬位置，Oracle 內是以使用者帳號作為 table schema 的開頭      
        // 例如: BLOG_DEMO.Employees
        // Schema名稱一定要大寫
        modelBuilder.HasDefaultSchema("BLOG_DEMO"); 
      }
    }
  }
  ```

* 建立 `Employee.cs` 檔案

  ```csharp
  namespace BlogDemo
  {
    public class Employee
    {
      public int Id { get; set; }
      public string Name { get; set; }
    }
  }
  ```

* 設定 `program.cs` ，啟動 EF 並塞入一筆資料

  ```csharp
  using System.Data.Entity;
  
  namespace BlogDemo
  {
    internal class Program
    {
      private static void Main(string[] args)
      {
        Database.SetInitializer(new DropCreateDatabaseAlways<OracleDbContext>());
  
        using (OracleDbContext ctx = new OracleDbContext())
        {
          Employee emp = new Employee()
          {
            Name = "Kevin"
          };
  
          ctx.Employees.Add(emp);
          ctx.SaveChanges();
        }
      }
    }
  }
  ```

* 第一次執行，因為 `DropCreateDatabaseAlways` 的關係，所以會建立資料表，**這模式不適合以在開發的系統**，請留意!!

  ![](https://i.imgur.com/OFkgEE4.png)

  * 其他相關設定

    **1. CreateDatabaseIfNotExists** :    預設規則，DB不存在時才建立，若Model與目前存在DB不相符會拋出例外錯誤

    **2. DropCreateDatabaseIfModelChanges** :  DB不存在時建立，若Model與目前存在DB不相符時會自動移除現有DB後再建立新DB

     **3. DropCreateDatabaseAlways** :  無論如何，總是移除現有DB(如果存在的話)，再建立新DB 

## 啟動 migration

1. 開啟 package Manager Console

   ![](https://i.imgur.com/qYRkDD9.png)

   2. 輸入 `Enable-Migrations`，這會啟動 `code first` 模式

      ![](https://i.imgur.com/L7CJlJW.png)

   3. 修改 `Employee` 資料表內容，新增 `address` 欄位

      ```csharp
      public class Employee
      {
          public int Id { get; set; }
          public string Name { get; set; }
          public string Address { get; set; }
      }
      ```

   4. 新增 `migrations` 檔案，`add-migration <filename>`

      ![](https://i.imgur.com/6rjlh5z.png)

      * `201808010850326_table_employee_add_address_field.cs`

        ```csharp
        public partial class table_employee_add_address_field : DbMigration
        {
            public override void Up()
            {
                AddColumn("BLOG_DEMO.Employees", "Address", c => c.String());
            }
        
            public override void Down()
            {
                DropColumn("BLOG_DEMO.Employees", "Address");
            }
        }
        ```

   5. 執行 `Update-Database` ，將異動部分更新到資料庫

      ![](https://i.imgur.com/Wjyvyjm.png)

      ![](https://i.imgur.com/OBShcGB.png)

   6. 完成第一次遷移(migration)更新

   

# 結論

關於 EF 相關的操作方式，請參閱 Entity Framework 的相關文件，這邊只針對 Oracle Entity Framework 要怎麼連線及相關設定的說明。畢竟有些細節的部分與 MSSQL 的連線是不一樣的。

# 參考資料

* [Entity Framework Code First and Code First Migrations for Oracle Database](http://www.oracle.com/webfolder/technetwork/tutorials/obe/db/dotnet/CodeFirst/index.html#overview)
* [ASP.NET MVC + Oracle 11g XE + Entity Framework. Part 2](http://kevintsengtw.blogspot.com/2011/11/aspnet-mvc-oracle-11g-xe-entity_13.html)
* [【EF-Oracle-01】使用 Entity Framework 連結 Oracle 資料庫](https://dotblogs.com.tw/vitochiang/2016/01/19/oracle-manageddataaccess-entityframework)



   

   

​    



