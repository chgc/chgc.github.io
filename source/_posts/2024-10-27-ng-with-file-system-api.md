---
layout: post
title: '[Angular] work with File System API'
comments: true
typora-root-url: 2024-10-27-ng-with-file-system-api/
typora-copy-images-to: 2024-10-27-ng-with-file-system-api/
date: 2024-10-27 10:06:28
categories: Angular
tags: Angular
---

Web API 提供的服務涵蓋很廣，File System API 已經推出一段時間，主要功能是讓瀏覽器能經過使用者授權後，與使用者本機的檔案系統做互動，這篇筆記就是將一些如何使用 File system API 記錄下來

<!-- more -->

> 本筆記將使用 Angular v19-next 作為練習環境

## Typescript Types

首先，因為 typescript 還不認得 File System API. 所以必須要手動安裝設定對應的 types 

```bash
npm i -D @types/wicg-file-system-access
```

接下來在  `tsconfig.json` 內增修以下

```json
 "compilerOptions": {
     ...
	"types": [
      "@types/wicg-file-system-access"
    ]
 }
```



## Directory

### 開啟 DirectoryPicker

```typescript
async broweFolders() {
  const dirHandler = await (<any>window).showDirectoryPicker();
  console.log(dirHandler);
}
```

```html
<button (click)="broweFolders()">Browe</button>
```

當按下按鈕時，會跳出挑選資料夾的 Dialog，選擇完要開啟的資料夾後，Console log 的地方應該會看到很簡單的資訊

![image-20241027110411084](image-20241027110411084.png)

1. 回傳的型別為 `FileSystemDirectoryHandle`

2. 顯示資料夾名稱

3. `showDirectoryPicker` 支援傳入參數 in Object

   1. `startIn`
      1. `desktop`：使用者的桌面目錄 (如果有的話)。
      2. `documents`：通常儲存使用者建立文件的目錄。
      3. `downloads`：通常儲存下載檔案的目錄。
      4. `music`：通常用來儲存音訊檔案的目錄。
      5. `pictures`：相片和其他靜態圖片的儲存目錄。
      6. `videos`：通常儲存影片或電影的目錄。
   2. `id` : 指定不同檔案選擇器的用途識別用。為什麼會有指定 id 的情境，因為根據預設，每個檔案挑選器會在最後記住的位置開啟，為了避免此情形，就可以透過設定 id 的方式來區分

   

當有了這一個 `directoryHandler`, 就可以做一些有趣的事情

### 列出資料夾下的檔案及資料夾

```typescript
async listFolderItems(entry: FileSystemDirectoryHandle) {
    const items = [];
    for await (const handle of entry.values()) {
      items.push(handle);
    }
    return items;
}
```

因為 `directoryHandler` 的  values 回傳的是 `AsyncIterableIterator`，可搭配 for await 的新語法取得所有的值，如果不知道 Iterator & Generator 的朋友，可以回去看一下相關的文件。

```typescript
  async broweFolders() {
    const dirHandler = await (<any>window).showDirectoryPicker();
    console.log(dirHandler);
    this.items = await this.listFolderItems(dirHandler);
    console.log(this.items);
  }
```

```html
<button (click)="broweFolders()">Browe</button>
<hr />
<ul>
  @for (item of items; track item) {
    <li>{{ item.kind }} - {{ item.name }}</li>
  }
</ul>
```

這樣輸出的結果如下

![image-20241027111010266](image-20241027111010266.png)

![image-20241027111030755](image-20241027111030755.png)

到這邊應該還算單純，當然如果想要取得所有檔案(包含子資料夾下)，就會動到遞迴的

```typescript
getAllFilesFromDirectory(dirHandler: FileSystemDirectoryHandle){
	for await (const fileHandle of this.getFilesRecursively(dirHandler)) {
	  console.log(fileHandle);
	}
}    

async *getFilesRecursively(entry: FileSystemHandle): AsyncGenerator<any> {
    if (entry.kind === 'file') {
      const file = await (<FileSystemFileHandle>entry).getFile();
      if (file !== null) {
        yield file;
      }
    } else if (entry.kind === 'directory') {
      for await (const handle of (<FileSystemDirectoryHandle>entry).values()) {
        yield* this.getFilesRecursively(handle);
      }
    }
  }
```

### 建立資料夾

```typescript
  async createFolder() {
    if (this.dirHandler === undefined) return;
    const subHandler = await this.dirHandler.getDirectoryHandle(
      `Folder_${Math.floor(Math.random() * 10)}`,
      { create: true },
    );
    console.log(subHandler);
  }
```

透過 `getDirectoryHandle` + `{create: true}` 就可以在所選取的 root directory 下建立資料夾，如果遇到資料夾名稱一樣的，基本上就會回傳已存在的 directory，所以我們可以這樣理解，當要取得某個 `DirectoryHandle時，如果不存在就建立一個新的。

### 刪除資料夾

```typescript
await directoryHandle.removeEntry('Old Stuff', { recursive: true });
// or
await directoryHandle.remove(); 
```



## File

### 取得檔案相對路徑

```typescript
  async getRelativePath(entry: FileSystemFileHandle) {
    if (this.dirHandler === undefined) return '';
    const relativePaths = await this.dirHandler.resolve(entry);
    console.log(relativePaths); // 回傳陣列: ["My Documents", "My Notes.txt"]
    return relativePaths?.join('/');
  }
```

### 刪除檔案

```typescript
await directoryHandle.removeEntry('Abandoned Projects.txt');
// or 
await fileHandle.remove();
```



### 讀取檔案

```typescript
  async read(handler: FileSystemHandle) {
    if (handler.kind === 'file') {
      const fileHandler = handler as FileSystemFileHandle;
      const content = await fileHandler.getFile().then((file) => file.text());
      console.log(content);
    }
  }
```

### 建立檔案

```typescript
  async save() {
    if (this.dirHandler === undefined || this.fileContent.length === 0) return;
    const fileName = `notes_${new Date().toDateString()}`;
    const fileHandler = await this.dirHandler.getFileHandle(fileName, {
      create: true,
    });
	...
  }
```



### 回寫檔案

```typescript
  async save() {
    if (this.dirHandler === undefined || this.fileContent.length === 0) return;
    const fileName = `notes_${new Date().toDateString()}`;
    const fileHandler = await this.dirHandler.getFileHandle(fileName, {
      create: true,
    });
    // create wrtiable and save content
    const writeable = await fileHandler.createWritable();
    await writeable.write(this.fileContent);
    await writeable.close();
    this.fileContent = '';
  }
```





## Reference

- [MDN File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- [AsyncIterableIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator)
- [for await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
