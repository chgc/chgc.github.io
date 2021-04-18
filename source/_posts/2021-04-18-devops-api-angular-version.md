---
layout: post
title: '[Azure DevOps] 用 API 來建立 WorkItems - Angular 篇'
comments: true
typora-root-url: 2021-04-18-devops-api-angular-version
typora-copy-images-to: 2021-04-18-devops-api-angular-version
date: 2021-04-18 20:01:51
categories: 
- Azure DevOps
- Angular
tags: 
- Azure DevOps
- Azure DevOps
---

當網路速度慢遇上要大量開  Work Items 時，就會有一種想下班的念頭，還好 Azure DevOps 有提供 API 可以讓我們用程式來建立 Work Items，雖然剛開始有點小麻煩，但弄通後就還好，所以這邊就筆記一下起手式

<!-- more -->

# OAuth

當呼叫 API 時，還是得通過驗證才能操作 API，這邊可以簡單的透過建立 `Personal access tokens` 的方式來完成權限控管及驗證等功能，至於如何在 Azure DevOps 建立 PAT，我相信網路上已經有很多文章在講怎麼操作了

每一個操作的 API 也有說明所需的權限，範例
![image-20210418201316995](image-20210418201316995.png)



#  API 操作

 這邊我使用 Angular 作為範例程式 ，先用一個 API 的操作來說明

## 取得 iterations

* [API - Work - Iterations](https://docs.microsoft.com/en-us/rest/api/azure/devops/work/iterations/list?view=azure-devops-rest-6.0)

根據 API 文件得知，呼叫 `https://dev.azure.com/{organization}/{project}/{team}/_apis/work/teamsettings/iterations?api-version=6.0` 可以取得開 project 下的 iterations 資訊，

程式碼的部分如下(以下的程式碼會產生錯誤)

```typescript
baseUrl = '`https://dev.azure.com/{organization}/{project}'; 
getIterations() {
    return this.http.get(`${this.baseUrl}/work/teamsettings/iterations?api-version=${this.apiVersion}`);    
  }
```

* `organization` 和 `project` 請配合自己的 DevOps 專案修改
* 這段程式碼當在呼叫 API 時會出現錯誤，原因是沒有授權的關係

來調整一下呼叫的 header 資訊，加入之前所建立的 PAT

```typescript
 getIterations() {
    return this.http.get(
      `${this.baseUrl}/work/teamsettings/iterations?api-version=${this.apiVersion}`,
      {
        headers: new HttpHeaders({
          Authorization: `Basic ${btoa(`PAT:${this.token}`)}`,
        }),
      }
    );    
  }
```

* Headers 的部分加入 `Authorization` 的內容
* PAT 需要轉換成 Base64 的格式
* `PAT:${token}` 的 `PAT:` 是必要的
* 重新執行即可取回所要的資訊 

每次呼叫 API 時後面都要加上 `api-version` 資訊，其實有點麻煩，這資訊可以改放到 headers 內

```typescript
 new HttpHeaders({
      Authorization: `Basic ${btoa(`PAT:${this.token}`)}`,
      'X-TFS-FedAuthRedirect': 'Suppress',
      'api-version': '6.0',
});
```



## 建立 Work Item

* [API - Work Items - Create](https://docs.microsoft.com/en-us/rest/api/azure/devops/wit/work%20items/create?view=azure-devops-rest-6.0)

> POST https://dev.azure.com/{organization}/{project}/_apis/wit/workitems/${type}?api-version=6.0

第一次看到 `${type}` 的時候，我也搞不懂要放入什麼，經過一陣亂測試，終於知道要放什麼東西了 ，在網頁上面要新增一個 Work Item 時，可以選得類別會依開發模式來決定，基本操作都是一樣的

![image-20210418205023231](image-20210418205023231.png)

如果要建立一個 `Task`，網址會是

`https://dev.azure.com/{organization}/{project}/_apis/wit/workitems/$Task`

如果是 `Issue`，網址則會是

`https://dev.azure.com/{organization}/{project}/_apis/wit/workitems/$Issue`

這樣子說明應該可以瞭解 `${type}` 要怎麼改了

另外一個要注意的地方是 Request Body 的 Content-Type 需要設定為 `application/json-patch+json`

![image-20210418205307166](image-20210418205307166.png)

```typescript
new HttpHeaders({
    Authorization: `Basic ${btoa(`PAT:${this.token}`)}`,
    'api-version': this.apiVersion,
    'Content-Type': 'application/json-patch+json'
})
```

範例程式

```typescript
createWorkItem() {
    return this.http.post(`${this.baseUrl}/wit/workitems/$Task`, [
      {
        path: '/fields/System.Title',
        op: 'add',
        value: 'Title here',
      },
      {
        path: '/fields/System.Description',
        op: 'add',
        value: 'desc here',
      },
      {
        path: '/fields/Microsoft.VSTS.Common.Priority',
        op: 'add',
        value: '1',
      },
      {
        path: '/fields/System.IterationPath',
        op: 'add',
        value: 'apiDemo\\w001',
      },
    ], {
        headers: new HttpHeaders({
            Authorization: `Basic ${btoa(`PAT:${this.token}`)}`,
            'api-version': this.apiVersion,
            'Content-Type': 'application/json-patch+json'
        })
    });
  }
```

* 可以修改的 path ，可參閱 [API - work item fields](https://docs.microsoft.com/en-us/rest/api/azure/devops/wit/work%20item%20types%20field/list?view=azure-devops-rest-6.0)，但不是所有的欄位都可以設定，這部分就請各位自己測試了

## Update Work Item

* [API - Work Item Update](https://docs.microsoft.com/en-us/rest/api/azure/devops/wit/work%20items/update?view=azure-devops-rest-6.0)

> PATCH https://dev.azure.com/{organization}/_apis/wit/workitems/{id}?api-version=6.0

用一個 Related Work 的範例來說明更新 Work Item

```typescript
  addLink(parent, ...childrend) {
    return this.http.patch(`${this.baseUrl}/wit/workitems/${parent}`, [
      ...childrend.map((id) => {
        return {
          op: 'add',
          path: '/relations/-',
          value: {
            rel: 'System.LinkTypes.Related',
            url: `${this.baseUrl}/wit/workItems/${id}`,
            attributes: {
              comment: 'adding another task',
            },
          },
        };
      }),
    ],  {
        headers: new HttpHeaders({
            Authorization: `Basic ${btoa(`PAT:${this.token}`)}`,
            'api-version': this.apiVersion,
            'Content-Type': 'application/json-patch+json'
        })
    });
  }
```

在 API 文件中有提供更多範例可以參考

# 參考資料

* [azure-devops-rest](https://docs.microsoft.com/en-us/rest/api/azure/devops/wit/?view=azure-devops-rest-6.0)