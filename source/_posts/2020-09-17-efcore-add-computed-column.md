---
layout: post
title: '[EF Core] 新增一個計算欄位 (Computed Column)'
comments: true
typora-root-url: 2020-09-17-efcore-add-computed-column
typora-copy-images-to: 2020-09-17-efcore-add-computed-column
date: 2020-09-17 12:23:28
categories: 'Entity Framework'
tags: 'Entity Framework'
---

當使用 EF Code First 設計資料表時，如果有一個欄位是要設定計算公式時，程式碼該如何寫呢?

<!-- more -->

以下幾個步驟

1. 在欄位上標記欄位屬於 `computed` 性質

   ```csharp
   [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
   public int CalculatedField {
       get; private set;
   }
   ```

2. 新增 `migration` 

   ```
   add-migration xxxx-xxxx
   ```

3. 打開剛建立的 `migration` 檔案並找到剛剛所指定的欄位

   ```csharp
   migrationBuilder.CreateTable(
                   name: "Demo",
                   columns: table => new
                   {
                       // 刪除原本產生的欄位
                      CalculatedField = table.Column<int>(nullable: false, defaultValue: 0),
                   },
   );
   migrationBuilder.Sql("ALTER TABLE dbo.Demo ADD CalculatedField AS ([你的計算規則])");      
   ```

4. 打完收工

以上是我目前的作法，能正常運作。如果有更好的寫法，也歡迎在下面留言分享討論

# 額外補充

如果想要透過 EF Migration 來新增 Store Procedure 的話，可以這樣子寫

1. 將 store procedure 的 SQL 檔案放在某資料夾下，並將 SQL 檔案設定為 `內嵌資源 (EmbeddedResource)`

2. 新增一個空的 migration 後加入以下的程式碼

   ```csharp
   protected override void Up(MigrationBuilder migrationBuilder)
           {
               var assembly = Assembly.GetExecutingAssembly();
               var resourceNames =
                           assembly.GetManifestResourceNames().                        
                           Where(str=> str.Contains("[sp file name].sql"));
               foreach (string resourceName in resourceNames)
               {
                   using (Stream stream = assembly.GetManifestResourceStream(resourceName))
                   using (StreamReader reader = new StreamReader(stream))
                   {
                       string sql = reader.ReadToEnd();
                       migrationBuilder.Sql(sql);
                   }
               }
           }
   
           protected override void Down(MigrationBuilder migrationBuilder)
           {
               migrationBuilder.Sql("DROP PROCEDURE [SP Name]");
           }
   ```

3. 當進行 database 更新時，就會將該 SP 新增到資料庫中