---
layout: post
title: '[Angular] Angular Material Table API 筆記'
comments: true
date: 2018-09-19 14:13:25
categories: Angular
tags: 
- Angular
- Angular Material
---

Angular Material Table 很好用，但是文件資訊不足是痛點。整理一些會用的到的 API 。之後可以少一點痛苦

<!-- more -->

Angular Material Table 可以操作的 selector 大概有以下這些

# matTable

預設 `ChangeDetection` 策略為 `onPush`

* trackBy：用法與 `*ngFor` 的 trackBy 是相同的

* dataSource：餵資料給 table，可以餵食的資料格式有三種 

  * Simple data array (each object represents one table row)
    * 如果資料異動，可透過 `renderRows()` 的方法來處發化面更新
    * 如果是 data array 的參考改變 (assign new array)，則 table 會自動更新。
  * Stream that emits a data array each time the array changes
  *  `DataSource` object that implements the connect/disconnect interface.

* `multiTemplateDataRows`：設定允許多行呈現。預設值為 `false`

  * 如果設定為 false ，顯示資料的地方只能一行，但可配合 `matRowDef` 的 `when` 來決定要顯示哪一個 row 設定

  * 設定為 `true` 時，可以多行顯示

    ```html
    <table mat-table [dataSource]="dataSource" class="mat-elevation-z8" multiTemplateDataRows="true">
    	<!-- Position Column -->
    	<ng-container matColumnDef="position">
    		<th mat-header-cell *matHeaderCellDef rowspan="2"> No. </th>
    		<td mat-cell *matCellDef="let element" rowspan="2"> {{element.position}} </td>
    	</ng-container>
    
    	<!-- Name Column -->
    	<ng-container matColumnDef="name">
    		<th mat-header-cell *matHeaderCellDef colspan="3"> Name </th>
    		<td mat-cell *matCellDef="let element"  colspan="3"> {{element.name}} </td>
    	</ng-container>
    
    	<!-- Weight Column -->
    	<ng-container matColumnDef="weight">
    		<th mat-header-cell *matHeaderCellDef> Weight </th>
    		<td mat-cell *matCellDef="let element"> {{element.weight}} </td>
    	</ng-container>
    
    	<!-- Symbol Column -->
    	<ng-container matColumnDef="symbol">
    		<th mat-header-cell *matHeaderCellDef> Symbol </th>
    		<td mat-cell *matCellDef="let element"> {{element.symbol}} </td>
    	</ng-container>
    
    	<!-- Symbol Column -->
    	<ng-container matColumnDef="tt">
    		<th mat-header-cell *matHeaderCellDef> Symbol </th>
    		<td mat-cell *matCellDef="let element"> {{element.symbol}} </td>
    	</ng-container>
    
    	<tr mat-header-row *matHeaderRowDef="['position', 'name']"></tr>
      <tr mat-header-row *matHeaderRowDef="['weight', 'symbol']"></tr>
    	<tr mat-row *matRowDef="let row; columns: ['position', 'name'];"></tr>
    	<tr mat-row *matRowDef="let row; columns: ['weight', 'symbol']"></tr>
    </table>
    ```

    ![](https://i.imgur.com/B5QPZyE.png)


# matHeaderCellDef

* 繼承 `cdkHeaderCellDef`

* `*cdkHeaderCellDef` 指定目前所在 element 為要顯示在  header 區塊的內容

# matCellDef

* 會根據 `multiTemplateDataRows` 決定回傳的內容

  * `true`: 回傳 `CdkCellOutletMultiRowContext`

    ```typescript
    export interface CdkCellOutletMultiRowContext<T> {
      /** Data for the row that this cell is located within. */
      $implicit?: T;
    
      /** Index of the data object in the provided data array. */
      dataIndex?: number;
    
      /** Index location of the rendered row that this cell is located within. */
      renderIndex?: number;
    
      /** Length of the number of total rows. */
      count?: number;
    
      /** True if this cell is contained in the first row. */
      first?: boolean;
    
      /** True if this cell is contained in the last row. */
      last?: boolean;
    
      /** True if this cell is contained in a row with an even-numbered index. */
      even?: boolean;
    
      /** True if this cell is contained in a row with an odd-numbered index. */
      odd?: boolean;
    }
    ```

  * `false`:  回傳 `CdkCellOutletRowContext`

    ```typescript
    export interface CdkCellOutletRowContext<T> {
      /** Data for the row that this cell is located within. */
      $implicit?: T;
    
      /** Index of the data object in the provided data array. */
      index?: number;
    
      /** Length of the number of total rows. */
      count?: number;
    
      /** True if this cell is contained in the first row. */
      first?: boolean;
    
      /** True if this cell is contained in the last row. */
      last?: boolean;
    
      /** True if this cell is contained in a row with an even-numbered index. */
      even?: boolean;
    
      /** True if this cell is contained in a row with an odd-numbered index. */
      odd?: boolean;
    }
    ```


# matHeaderRowDef

* 繼承 `CdkHeaderRowDef`
* columns：要顯示的欄位名稱
* 'sticky': 是否要固定表頭

# matRowDef

- 繼承 `CdkRowDef`

- columns：要顯示的欄位名稱

- 'when': 設定要顯示 row 的條件

  - 如果 `multiTemplateDataRows` 為 false, `matRowDef` 只能有一個沒有設定 `when`

    ```typescript
    when: (index: number, rowData: T) => boolean;
    ```


# matColumnDef

* 繼承 `CdkColumnDef`
* `name` : 設定欄位名稱
*  `sticky` 、`stickyEnd` 可以使用，固定 column



# 參考資料

* [Angular Material CDK Table Source Code](https://github.com/angular/material2/tree/master/src/cdk/table)