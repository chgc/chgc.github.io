---
layout: post
title: '[ASP.NET MVC] 利用OData+EF做分頁'
date: 2014-03-19 01:31
comments: true
categories: "ASP.NET MVC"
tag: "MVC 4"
---
當網頁要讀取一個很大量的資料時，通常都會透過分頁的方式來顯示資料。
如果透過WebApi+OData的特性來做分頁，作法很單純
設定 WebApiConfig.cs
```
//加入
config.EnableQuerySupport();
```

假設原本的API寫法如下
```
  [Route("api/Customer")]
  public IEnumerable<customers> Getcustomers()
  {            
     return db.customers.AsEnumerable();
  } 
```
改成
```
[Route("api/Customer")]        
public IQueryable<customers> Getcustomers()
{            
   return db.customers.AsQueryable();
}
```

那在client端要呼叫api的url中，在加上OData的查詢語法來取得所要的資料區段，來達成分頁的效果

|指令|說明|範例|
| ------------ | :----------- | :----------- |
|top|結果挑出最前面的幾筆|?$top=3|
|skip|	 略過幾筆。可用於分頁顯示|	 ?$skip=10|
|orderby|	 排序	 |?$orderby=SupplierID,ProductID|
|filter|	 篩選	  ||
| 	 |gt : > , 大於	 |$filter=ProductID gt 10|
| 	 |lt :  < , 小於	 |$filter=ProductID lt 10|
| 	 |ge : >=, 大於等於	 |$filter=ProductID ge 10|
| 	 |le : <=, 小於等於	 |$filter=ProductID le 10|
| 	 |eq : =, 等於	 |$filter=ProductID eq 10|
| 	 |ne : <>, 不等於	 |$filter=ProductID ne 10|
   
   參考資料: http://msdn.microsoft.com/en-us/library/windowsazure/gg312156.aspx
   
#### 如果要利用OData取得所有的資料筆數時，上述的寫法沒有辦法做到，所以要稍微改寫一下原本的寫法
   
```  
   [Route("api/Customer")]   
    public PageResult<customers> Getcustomers(ODataQueryOptions<customers> options)
        {           
            var results = options.ApplyTo(db.customers.AsQueryable());
            return new PageResult<customers>(
               results as IEnumerable<customers>, // Items
               Request.GetNextPageLink(), // NextPageLink
               Request.GetInlineCount()); // Count
        }        
```
   
   要傳入的東西是一樣的，但是回傳的結果會變成
   
```
   {
      "Items":[data....],
      "NextPageLink": null,
      "Count": 12345
   }
```
   
   所以在接收時要再調整

### 當$filter的查詢欄位是guid時
 所送出的值前面要加上 **guid** 的關鍵字
```
?$filter=field eq guid'<value>'
```