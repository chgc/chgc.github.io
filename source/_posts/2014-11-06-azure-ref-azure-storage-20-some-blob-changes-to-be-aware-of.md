---
layout: post
title: '[Azure] Azure Storage 2.0 – Some blob changes to be aware of -Ref'
date: 2014-11-06 15:29
comments: true
categories: "Azure"
tag: "Azure"
---
Reference Website Url
http://happyfunpartytime.com/2012/11/azure-storage-2-0-some-blob-changes-to-be-aware-of/

大綱:

如果從官網上面抄下來的範例如果直接貼在vs裡面，會出現錯誤，那根據原本字面上的意思來找相類似的method來用

```
CloudBlob thumbnailBlob = objContainer.GetBlobReference(filename);
```

換成

```
var thumbnailBlob = objContainer.GetBlobReferenceFromServer(filename);
```

結果，一直給我跑404.

這GetBlobReserenceFromServer的用意是去server上面找filename的blob reference回來. 所以當我們要建立新的blob, 這就文不對題了。 所以要改用

```
CloudBlockBlob blob = objContainer).GetBlockBlobReference(filename);
```

這樣子就okey了.

```
blob.UploadFile(fileData.LocalFileName);
```
 
---
---

這個也改掉了, 要改成

```
CloudBlockBlob.UploadFromFile(filenameWithPath, FileMode)
```

CloudBlockBlob也有提供不同的上傳方式，請參閱[MSDN](http://msdn.microsoft.com/en-us/library/microsoft.windowsazure.storage.blob.cloudblockblob_methods.aspx)