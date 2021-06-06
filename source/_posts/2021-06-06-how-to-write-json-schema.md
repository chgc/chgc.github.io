---
layout: post
title: '[How-to] 如何寫一份 JSON Schema'
comments: true
typora-root-url: 2021-06-06-how-to-write-json-schema/
typora-copy-images-to: 2021-06-06-how-to-write-json-schema/
date: 2021-06-06 10:49:01
categories: How-to
tags: How-to
---

當要驗證 JSON 資料格式是否正確，有幾種做法  

1. 丟給後端去驗證
2. 寫個 JSON Schema 做驗證(前端就可以先檢查了)

JSON Schema 是什麼？他有點像以前 XSD (用來描述 XML 結構的檔案，也有驗證的效果)，除了可以用來驗證 JSON 資料格式是否正確，也可以用來驗證 YAML 檔案的格式。

<!-- more -->

# 基本語法

所以如何寫一個 JSON Schema，我們需要寫另外一份 JSON 來描述未來想要驗證的 JSON 資料格式為何，型態為何，可以輸入得資料有哪些等，下面就跟大家一起整理相關的語法筆記 (部分範例來自 JSON Schema 網站，連結在參考資料)

假設有一個 JSON 資料長這樣

```json
{
  "productId": 1,
  "productName": "A green door",
  "price": 12.50,
  "tags": [ "home", "green" ]
}
```

一個基本的 JSON schema 長這樣 

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/product.schema.json",
  "title": "Product",
  "description": "A product in the catalog",
  "type": "object"
   ...
}
```

* keyword
  * `$schema`: 參考的 JSON schema 是哪一個版本
  * `$id`: 這份 JSON schema 存放的位置
* annotation
  * `title`，`description` 描述說明此份 schema 的用途
* validation keyword
  * `type` : 資料格式型態，可以描述的型態有 `null`、 `boolean`、 `object`、 `array`、 `number`、 `string`、 `integer`  

上面是設定跟說明這份 schema 的用途，類似 metadata，至於如何描述資料結構，描述方法如下

```json
{
  ...
  "properties": {
    "productId": {
      "description": "The unique identifier for a product",
      "type": "integer"
    },
    "productName": {
      "description": "Name of the product",
      "type": "string"
    }
  },
  "required": [ "productId", "productName" ]
}
```

* validation keyword
  * `properties` 用來描述此 `Object` 內有哪些欄位
  * `required` 用來設定哪些欄位是必填的

## 更多語法

```json
"price": {
    "description": "The price of the product",
    "type": "number",
    "exclusiveMinimum": 0
}
```

* 數字型別
* 不能是 0 (用 [`exclusiveMinimum`](https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.5) 規則排除)

```json
 "tags": {
     "description": "Tags for the product",
     "type": "array",
     "items": {
         "type": "string"
     },
     "minItems": 1,
     "uniqueItems": true
 }
```

* 此為陣列型別的欄位
* 陣列 內得資料格式，使用 [`items`](https://json-schema.org/draft/2020-12/json-schema-core.html#rfc.section.10.3.1.2) 定義
* 至少要有一筆資料 ([`minItems`](https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.2) 來設定最少筆數)
* 且不能重複 ([`uniqueItems`](https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.3) 檢查)

## Nesting data structures

不難，一樣式套用上面的規則，做法是一樣的

```json
"dimensions": {
    "type": "object",
    "properties": {
        "length": {
            "type": "number"
        },
        "width": {
            "type": "number"
        },
        "height": {
            "type": "number"
        }
    },
    "required": [ "length", "width", "height" ]
}
```

## References schema

```json
"warehouseLocation": {
    "description": "Coordinates of the warehouse where the product is located.",
    "$ref": "https://example.com/geographical-location.schema.json"
}
```

- `$ref` 指定 schema 的參考路徑，可以是外部或內部 ([spec](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-8.2.4))

  - 外部參考: 使用 URI Reference

  - 內部參考: 使用 `#/路徑` 的方式，搭配 `$defs` 使用

    ![image-20210606115417347](image-20210606115417347.png)



# 進階語法

* [`additionalProperties`](https://json-schema.org/draft/2020-12/json-schema-core.html#rfc.section.10.3.2.3): 是否有其他額外的欄位，`false` 時，JSON 得資料必須符合 schema 所定義的 `properties`
* [`patternProperties`](https://json-schema.org/draft/2020-12/json-schema-core.html#rfc.section.10.3.2.2): 用 Regex 來描述 Property 名稱規則及對應得資料格式
* [`oneOf`](https://json-schema.org/draft/2020-12/json-schema-core.html#rfc.section.10.2.1.3) 符合定義規則的其中一項
  * MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
  * An instance validates successfully against this keyword if it validates successfully against exactly one schema defined by this keyword's value.
* [`$defs`](https://json-schema.org/draft/2020-12/json-schema-core.html#rfc.section.8.2.4) 搭配 `$ref` 使用 (舊版名稱為: `definitions`)
  * MUST be an object. Each member value of this object MUST be a valid JSON Schema.
  * reserves a location for schema authors to inline re-usable JSON Schemas into a more general schema.
*  [`enum`](https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.1.2): 設定可以使用的值有哪些
  *  MUST be an array and at least one element.
  * An instance validates successfully against this keyword if its value is equal to one of the elements in this keyword's array value.
* [`pattern`](https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.3.3): 使用 Regex 設定可以輸入資料的格式 (format)

完整範例

```json
{
  "$id": "https://example.com/entry-schema",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "description": "JSON Schema for an fstab entry",
  "type": "object",
  "required": [ "storage" ],
  "properties": {
    "storage": {
      "type": "object",
      "oneOf": [
        { "$ref": "#/$defs/diskDevice" },
        { "$ref": "#/$defs/diskUUID" },
        { "$ref": "#/$defs/nfs" },
        { "$ref": "#/$defs/tmpfs" }
      ]
    },
    "fstype": {
      "enum": [ "ext3", "ext4", "btrfs" ]
    },
    "options": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string"
      },
      "uniqueItems": true
    },
    "readonly": {
      "type": "boolean"
    }
  },
  "$defs": {
    "diskDevice": {
      "properties": {
        "type": {
          "enum": [ "disk" ]
        },
        "device": {
          "type": "string",
          "pattern": "^/dev/[^/]+(/[^/]+)*$"
        }
      },
      "required": [ "type", "device" ],
      "additionalProperties": false
    },
    "diskUUID": {
      "properties": {
        "type": {
          "enum": [ "disk" ]
        },
        "label": {
          "type": "string",
          "pattern": "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
        }
      },
      "required": [ "type", "label" ],
      "additionalProperties": false
    },
    "nfs": {
      "properties": {
        "type": { "enum": [ "nfs" ] },
        "remotePath": {
          "type": "string",
          "pattern": "^(/[^/]+)+$"
        },
        "server": {
          "type": "string",
          "oneOf": [
            { "format": "hostname" },
            { "format": "ipv4" },
            { "format": "ipv6" }
          ]
        }
      },
      "required": [ "type", "server", "remotePath" ],
      "additionalProperties": false
    },
    "tmpfs": {
      "properties": {
        "type": { "enum": [ "tmpfs" ] },
        "sizeInMB": {
          "type": "integer",
          "minimum": 16,
          "maximum": 512
        }
      },
      "required": [ "type", "sizeInMB" ],
      "additionalProperties": false
    }
  }
}
```

想要知道更多 JSON Schema 語法的寫法，可以到 `JSON Schema Store` 內去瞭解，裡面列出很多現在常用的服務，很多都是用來驗證 YAML 格式是否正確，或是閱讀這篇[文件](https://json-schema.org/understanding-json-schema/)

# 參考資料

1. [JSON Schema](https://json-schema.org/)
2. [JSON Schema specification](https://json-schema.org/specification.html)
3. [JSON Schema Store](https://www.schemastore.org/json/)

