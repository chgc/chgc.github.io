---
layout: post
title: '[Azure] DocumentDB'
date: 2014-11-03 04:53
comments: true
categories: "Azure"
tag: "Azure"
---
使用Azure新的NoSQL -- DocumentDB(還在preview版本中)

怎們建立網頁上面有說. 這裡只記錄一些操作上的動作

* DocumentDB裡面有分幾個元素 Database, DocumentCollection, document

元素之間的關係

```
Database -> DocumentCollection(with id name=xxxx)  -> document(s)
         -> DocumentCollection(with id name=xxxx)  -> document(s)
```  

* 檢查database是否已存在

```
string dataBaseName = "testDB";
var client = new DocumentClient(new Uri(EndpointUrl), AuthorizationKey);

var database = client.CreateDatabaseQuery().FirstOrDefault(db => db.Id == dataBaseName);

if (database == null)
{
	database = await client.CreateDatabaseAsync(
	new Database
	{
		Id = dataBaseName
	});
}
```
## 這個寫法如果用在webapi上面，會有出現等不到回應的情形發生，所以解決方法是變成同步, 寫法會變成

```
database = client.CreateDatabaseAsync(new Database{Id = dataBaseName}).Result;
```

* 檢查DocumentCollection是否已經建立

從上面知道如果要檢查Database是否已經建立, 要利用CreateDatabaseQuery(), 
同樣的， 如果要檢查Document是否已經建立, 就要用 CreateDocumentCollectionQuery(database.CollectionsLink)

[MSDN -- DocumentServiceQueryable.CreateDatabaseQuery](http://msdn.microsoft.com/en-us/library/azure/microsoft.azure.documents.linq.documentservicequeryable.createdatabasequery.aspx)

[MSDN -- DocumentServiceQueryable.CreateDocumentCollectionQuery Method](http://msdn.microsoft.com/en-us/library/azure/microsoft.azure.documents.linq.documentservicequeryable.createdocumentcollectionquery.aspx)

* 建立Document

new a class object and save into DocumentCollection

```
User _user = new User(){name='abc'};
var document1 = await client.CreateDocumentAsync(documentCollectionLink, _user);

這裡的documentCollectionLink是指
DocumentCollection collection = client.CreateDocumentCollectionQuery(database.SelfLink).FirstOrDefault(db => db.Id == dataBaseName);
或者是剛新增出來的collection 
DocumentCollection collection = client.CreateDocumentCollectionAsync(database.SelfLink,
                new DocumentCollection
                {
                    Id = "some name"
                });  
                
documentCollectionLink = collection.SelfLink;
```

* 更新Document

```
var doc = Client.CreateDocumentQuery<Document>(Favorscollection.DocumentsLink)
                .Where(d => d.Id == id)
                .AsEnumerable()
                .FirstOrDefault();

return Client.ReplaceDocumentAsync(doc.SelfLink, item);
```

* 刪除Document

```
var doc = Client.CreateDocumentQuery<Document>(Favorscollection.DocumentsLink)
                .Where(d => d.Id == id)
                .AsEnumerable()
                .FirstOrDefault();

return Client.DeleteDocumentAsync(doc.SelfLink);
```

* 查詢Document

可以用Linq的語法來做查詢或是用sql的語法也可以

[[DOC] Query DocumentDB](http://azure.microsoft.com/zh-tw/documentation/articles/documentdb-sql-query/)

```
Client.CreateDocumentQuery<viewModel>(Favorscollection.DocumentsLink)
                .Where(m => m.lastName == "xxxx")
                .ToList()
```

