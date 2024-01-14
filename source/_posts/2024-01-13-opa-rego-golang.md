---

layout: post
title: '[OPA] OPA API in Go'
comments: true
typora-root-url: 2024-01-13-opa-rego-golang/
typora-copy-images-to: 2024-01-13-opa-rego-golang/
date: 2024-01-13 11:09:31
categories: OPA
tags: [OPA, Go]
---

Open Policy Agent (OPA) 的文件上有提到 OPA API，但遇上文件有看沒有懂的情況，就得自己動手做做看才有感覺，這邊記錄實作後的理解

<!-- more -->

Integrate with OPA, Go 可安裝 OPA package, `go install github.com/open-policy-agent/opa v0.60.0` 完成後就具備 `SDK` 和 `rego API` 的能力，這篇指探討 API 的部分

## 程式碼

透過程式碼基本上也有三個元素 1. Policy, 2. Data, 3. Input

```go
import (
	"context"
	"fmt"

	"github.com/open-policy-agent/opa/rego"
	"github.com/open-policy-agent/opa/storage"
	"github.com/open-policy-agent/opa/storage/inmem"
	"github.com/open-policy-agent/opa/util"
)

func main() {
    // Policy
    module := `
    package example.authz

    import rego.v1

    default allow := false

    allow if {
        input.method == "GET"
        input.path == ["salary", input.subject.user]
        data.example.users[_].name = input.subject.user
    }

    allow if is_admin

    is_admin if "admin" in input.subject.groups
    `
    
    data := `{
            "example": {
                "users": [
                    {
                        "name": "alice",
                        "likes": ["dogs", "clouds"]
                    },
                    {
                        "name": "bob",
                        "likes": ["pizza", "cats"]
                    }
                ]
            }
        }`

    var json map[string]interface{}

    err := util.UnmarshalJSON([]byte(data), &json)
    if err != nil {
        // Handle error.
        fmt.Println(err)
    }

    // Manually create the storage layer. inmem.NewFromObject returns an
    // in-memory store containing the supplied data.
    // prepare data
    store := inmem.NewFromObject(json)

    ctx := context.TODO()
    // 初始化 rego 
    query, err := rego.New(
        rego.Query("x = data.example.authz.allow"), // 這裡的 x 對應到 line 88 的 bindings
        rego.Module("example.rego", module),
        rego.Store(store),
        ).PrepareForEval(ctx)

    if err != nil {
        // Handle error.
    }

    // 準備 Input
    input := map[string]interface{}{
        "method": "GET",
        "path": []interface{}{"salary", "bob"},
        "subject": map[string]interface{}{
            "user": "bob",
            "groups": []interface{}{"sales", "marketing"},
        },
    }

    // Eval Input with Policy
    results, err := query.Eval(ctx, rego.EvalInput(input))
	if err != nil {
		fmt.Println(err)
	} else if len(results) == 0 {
		fmt.Println(err)
	}

	v := results[0].Bindings["a"]

	fmt.Println(v)
}
```

但有時候會希望 policy 檔案可以從外部某一個儲存空間取得，寫法就會變成這樣

```go
store := inmem.NewFromObject(json)
// Open a write transaction on the store that will perform write operations.
txn, err := store.NewTransaction(ctx, storage.WriteParams)

query, err := rego.New(
		rego.Query("x = data.example.authz.allow"),
		rego.Load([]string{"./policy"}, nil),
		rego.Store(store),
		rego.Transaction(txn),
	).PrepareForEval(ctx)
```

- `rego.New` 接受多個 Options，表示如果有其他的設定，可以在前面先組好後，再放進 `rego.New` 中
- 透過 `rego.Load` 的方法可以設定讀取檔案的位置 [API 說明](https://pkg.go.dev/github.com/open-policy-agent/opa/rego#Load)，會讀 `*.rego` 、`*.json`、`*.yaml` 檔案
- 假如使用 `rego.Load` 時又有 `rego.Store` 設定，就必須指定 `rego.Transacction`



## Reference

- [Integrating with the Go API](https://www.openpolicyagent.org/docs/latest/integration/#integrating-with-the-go-api)





