---
layout: post
title: '[Angular] Router in 7: 一些新功能'
comments: true
typora-root-url: 2018-12-24-ng-router-new-feature/
typora-copy-images-to: 2018-12-24-ng-router-new-feature/
date: 2018-12-24 10:46:19
categories: Angular
tags: Angular
---

Angular 7 版以後 (7.1~7.2)，在 Router 的部份又新增了不少功能，一起來看看到底新增了那些功能吧

<!-- more -->

# Allow guards to return UrlTree

* 適用版本: 7.1

* 功能: 允許在 Router Guards 內回傳 UrlTree 物件，來達到轉址功能，一但轉址就會取消既有的瀏覽行為

* Interface

  ```typescript
  interface CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  }
  ```

* 用法範例

  ```typescript
  @Injectable()
  class CanActivateTeam implements CanActivate {
    constructor(private permissions: Permissions, private currentUser: UserToken, 
                private router: Router) {}
   
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
          if(!this.permissions.canActivate(this.currentUser, route.params.id))
          {
              return this.router.createUrlTree(['/login']);   
          }
          return false;    
    }
  }
  ```



# runGuardsAndResolvers

在設定 RouterConfig 時，可以設定何時要觸發 `Guards` 和 `Resolver` ，目前有的選項有

```typescript
type RunGuardsAndResolvers = 'pathParamsChange' | 'paramsChange' | 'paramsOrQueryParamsChange' | 'always' |  ((from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean);
```

設定方式

```typescript
const routes: Route[] = [
  { path: '', component: AppComponent, runGuardsAndResolvers: 'always' }
];
```

* `runGuardsAndResolvers: 'always'` 可以與 RouterModule 的 ` onSameUrlNavigation: 'reload'` 搭配使用，即可做到同一網址瀏覽可以重跑 `Guards` 與 `Resolvers` 的動作
* 版本 7.1 新增 `pathParamsChange` 模式
* 版本 7.2 新增 `pathParamsOrQueryParamsChange` 模式
* 版本 7.2 新增 `predicate function` 模式: 可以自訂觸發規則

# Allow passing state to routerLink

* 適用版本: 7.2

* 功能: 允許在 routerLink 上傳 data object as state

* 用法:

  ```html
   <a [routerLink]="['/user/bob']" [state]="{tracingId: 123}">
      link to user component
   </a>
  ```

  ```typescript
  router.events.pipe(filter(e => e instanceof NavigationStart)).subscribe(e => {
      const transition = router.getCurrentTransition();
      tracingService.trace({id: transition.extras.state});
   });
  ```



# 參考資料

* [Changelog](https://github.com/angular/angular/blob/master/CHANGELOG.md)

