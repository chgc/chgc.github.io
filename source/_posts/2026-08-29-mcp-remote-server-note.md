---
layout: post
title: '[MCP] Remote MCP Server 新規格筆記（2026-07-28）'
comments: true
date: '2026-08-29 09:00:00'
categories: 'MCP'
tags: ['mcp', 'model-context-protocol', 'api', 'ai-integration', 'developer-experience']
description: 'MCP 2026-07-28 規格學習筆記，以把自家 API 開放給 AI 工具為例。'
---

# MCP Remote Server 新規格筆記（2026-07-28）：把自家 API 開放給 AI 工具

前陣子一直在想一件事：自己手上這套 API service，要怎麼讓開發者在 Claude、Cursor 這些 AI 工具裡直接使用？其實答案已經很明顯——MCP（Model Context Protocol）。而且規格最近又大改版了，網路上的文章大多還停在舊版，趁周末把官方文件從頭讀了一遍，這篇就把重點筆記下來，順便站在「想要提供 remote MCP server 給開發者整合」的服務擁有者角度，整理該注意哪些事。

<!-- more -->

## 為什麼是現在：規格演進很快

MCP（Model Context Protocol）是 Anthropic 在 2024/11 開源的協定，簡單講就是讓 AI 工具（client）透過統一介面呼叫外部服務（server）的工具、資源、prompt。到目前為止官方發布過的規格 revision 有：

| Revision       | 重點                                                       |
| -------------- | ---------------------------------------------------------- |
| 2024-11-05     | 原始版，遠端傳輸走 HTTP+SSE                                |
| 2025-03-26     | 引入 Streamable HTTP，取代 HTTP+SSE；加入 tool annotations |
| 2025-06-18     | 新增 elicitation、experimental tasks                       |
| 2025-11-25     | 版本化政策的雛形                                           |
| **2026-07-28** | **重大改版：完全 stateless**                               |

整個生態的採用速度也很快：OpenAI（2025/3）、Google DeepMind（2025/5）、Microsoft 都相繼宣布支援，主流工具幾乎都當了 MCP client。也就是說，現在開放自家的 API 給 AI 工具，已經不是「要不要」的問題，而是「跟哪個世代」的問題——因為 2026-07-28 這版真的改很大。

## 2026-07-28 重點：MCP 變成 stateless

這版最大的變革，就是把過去「先 initialize 握手建立 session」的模型整個拿掉。官方 changelog 引用了三個 SEP（Specification Enhancement Proposal），我拆成三點來看：

### 1. 沒有 session、沒有 initialize（SEP-2567 / SEP-2575）

過去的流程是 client 先送 `initialize`，server 回 `InitializeResult`，然後才開始 `tools/list` 等呼叫；遠端還會帶 `Mcp-Session-Id` header 維持 session。2026-07-28 起通通移除：

- 每個 JSON-RPC request 都要在 `_meta` 帶上協定版本、client 能力與身分：

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/list",
  "params": {
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": { "name": "MyClient", "version": "1.0.0" },
      "io.modelcontextprotocol/clientCapabilities": {}
    }
  }
}
```

- 對應注意的點：
  1. server 在 result 的 `_meta` 回 `io.modelcontextprotocol/serverInfo` 表明身分
  2. 版本不符就回 `UnsupportedProtocolVersionError`，錯誤碼 `-32022`
  3. 官方的錯誤碼政策：`-32000`~`-32019` 留給實作自訂，`-32020`~`-32099` 是 MCP spec 保留區

我的理解是：這對我們這種「要扛多租戶、要水平擴展」的服務其實是好事——沒有 session 就沒有黏著性（stickiness），load balancer 可以隨便打，每一台 instance 都是無狀態的。真的需要跨 request 的狀態時，官方建議由 server 發出 handle（識別碼）當 tool 參數帶回傳（SEP-2567），不要依賴連線狀態。

### 2. 新增 `server/discover`，server 必須實作

stateless 化之後，「宣告能力與身分」這件原本由 `initialize` 握手做的事，改由一個唯讀 RPC 承接：client 可以在發任何其他 request 之前，先問 server「你支援哪些版本、有什麼能力、你是誰」。

Request 除了標準的 `_meta` 之外沒有任何參數（client 身分與能力就放在 `_meta`）：

```json
{
  "jsonrpc": "2.0",
  "id": "discover-1",
  "method": "server/discover",
  "params": {
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": { "name": "MyClient", "version": "1.0.0" },
      "io.modelcontextprotocol/clientCapabilities": {}
    }
  }
}
```

Response 的完整欄位長這樣：

```json
{
  "jsonrpc": "2.0",
  "id": "discover-1",
  "result": {
    "resultType": "complete",
    "supportedVersions": ["2026-07-28"],
    "capabilities": { "tools": {}, "resources": {} },
    "_meta": {
      "io.modelcontextprotocol/serverInfo": { "name": "acme-analytics-mcp", "version": "1.0.0" }
    },
    "instructions": "ACME Analytics 的 MCP server，提供報表查詢與資料分析工具。",
    "ttlMs": 3600000,
    "cacheScope": "public"
  }
}
```

- 對應注意的點：
  1. `supportedVersions`：列出自 server 支援的協定版本，client 之後每個 request 從中選一個（我們全新服務直接 `["2026-07-28"]`）；版本不符時 server 回 `UnsupportedProtocolVersionError`（`-32022`）並附上 `supported` 清單，client 再挑雙方都支援的版本重試——因為 stateless，這個流程發生在「每一個 request」而非連線建立時
  2. `capabilities`：tools / resources / prompts 等能力宣告，client 不用逐個 probe 就能知道 server 提供什麼；Claude Code 這類 client 開場也會自己打 `tools/list`、`prompts/list`、`resources/list` 再做一次完整發現，discover 比較像「快速總覽」
  3. `instructions`：**給 LLM 看的自然語言說明**（不是給人類開發者看的文件）——在 Claude Code 裡它 session 開場就載入、作用類似 skill 的觸發條件，決定 agent「何時該搜尋這個 server 的工具」，所以值得花時間寫好
  4. `ttlMs` / `cacheScope`：caching 提示。`ttlMs` 是快取新鮮度（毫秒，`0` = 立即失效，語意類似 HTTP `Cache-Control: max-age`）；`cacheScope` 分 `"public"`（回應不含使用者特定資料、可跨使用者共用）與 `"private"`（含私有資料，只能同一個授權 context 重用）——工具清單、文件這類 discover 回應幾乎都是 `public`，被 gateway / proxy 快取時是免費的效能優化
  5. `serverInfo` 是 server **自報**身分，協定不會驗證——官方明確說 client 不該用它做安全決策，只用於顯示、log、除錯

對 client 來說呼叫 `server/discover` 是 OPTIONAL，主要有兩個用途：一次請求拿完整資訊（不用分開打 `tools/list` + `prompts/list` + `resources/list`）；stdio 上的 modern/legacy 相容性探測（我們全新服務用不到）。用官方 go-sdk v1.7.0+ 的話這個 RPC 已內建（`mcp/server.go` 的 discover handler），`ServerOptions.Instructions` 填的內容就會出現在這裡，`ttlMs`/`cacheScope` 也會自動給預設值，不用自己寫。

### 3. MRTR：server 不再主動發 request（SEP-2322）

以前 server 想要更多資訊（例如 `sampling/createMessage`、`roots/list`、`elicitation/create`）會主動送 request 給 client。新版改成 Multi Round-Trip Requests 模式：server 在 result 裡回 `resultType: "input_required"`，把需要的請求裝在 `inputRequests` 欄位，client 再 retry 原 request 並補上 `inputResponses`。

- 對應注意的點：
  1. 所有 result 都必須帶 `resultType` 欄位（`"complete"` 或 `"input_required"`）
  2. 這代表 protocol 的 request/response 流變得非常單純：永遠是 client 發起、server 回應，中間要索取資訊就「卡關」互動一次

另外兩件也值得知道：`ping`、`logging/setLevel` 移除了（log level 改由 `_meta` 的 `io.modelcontextprotocol/logLevel` 每個 request 單獨指定），experimental tasks 則移出核心、改為官方 extension（`io.modelcontextprotocol/tasks`，用 `tasks/get` polling）。Streamable HTTP 上沒有 client 端 notification，取消就是關閉 SSE stream。

## 基本款：架一台 Streamable HTTP server

遠端 server 現在就是一個很單純的 HTTP service，官方要求：

1. 只提供一個 HTTP endpoint（MCP endpoint），只支援 POST，例如 `https://example.com/mcp`
2. 每個 JSON-RPC request 就是一個 HTTP POST
3. response 可以是一個 JSON object，或是 scoped 的 SSE stream（`Accept` header 要同時列 `application/json` 和 `text/event-stream`）
4. request 是 notification 時回 `202 Accepted`
5. 每個 POST 都要帶 metadata header（含 `MCP-Protocol-Version`）

安全面有一個容易忽略但官方強制的要求：**server 必須驗證 `Origin` header**，防止 DNS rebinding 攻擊，invalid 就回 403。這在自建的時候很容易漏掉。

以官方 Go SDK（`github.com/modelcontextprotocol/go-sdk`，需要 **v1.7.0 以上**才支援 `2026-07-28`）為例，快速起一個 server 大概長這樣：

```go
package main

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/modelcontextprotocol/go-sdk/mcp" // v1.7.0+
)

// ListReportsParams 對應工具的 inputSchema，SDK 會自動從 struct 產生 JSON Schema
// jsonschema tag 裡的描述就是給 AI 看的參數說明

type ListReportsParams struct {
	Page int `json:"page" jsonschema:"第幾頁，從 1 開始"`
}

// listReports 是工具 handler：輸入會自動驗證，回傳的 error 會自動包成 tool error
func listReports(ctx context.Context, req *mcp.CallToolRequest, params *ListReportsParams) (*mcp.CallToolResult, any, error) {
	reports, err := fetchReports(ctx, params.Page) // 呼叫你原本的 service layer
	if err != nil {
		return nil, nil, err
	}
	return nil, reports, nil
}

func main() {
	server := mcp.NewServer(&mcp.Implementation{
		Name:    "acme-analytics-mcp",
		Version: "1.0.0",
	}, &mcp.ServerOptions{
		Instructions: "ACME Analytics 的 MCP server，提供報表查詢與資料分析工具。", // 會出現在 server/discover 回傳，是給 AI 看的說明
		// SupportedProtocolVersions: []string{"2026-07-28"}, // 想鎖定版本時再開
	})

	readOnly := true // annotations 的 ReadOnlyHint/DestructiveHint 是指標欄位，先宣告變數再取位址
	mcp.AddTool(server, &mcp.Tool{
		Name:        "list_reports",
		Title:       "List reports",
		Description: "列出目前使用者有權限的報表清單",
		Annotations: &mcp.ToolAnnotations{ReadOnlyHint: &readOnly},
	}, listReports)

	// 第二個參數是 factory：每個 request 都可以回傳不同的 server instance
	handler := mcp.NewStreamableHTTPHandler(func(req *http.Request) *mcp.Server {
		return server // 多租戶/動態工具就從這裡依 req 挑選或建立 server
	}, nil)

	log.Printf("MCP server listening on :8000")
	log.Fatal(http.ListenAndServe(":8000", originCheck(handler)))
}

// originCheck 驗證 Origin header，防 DNS rebinding——這是 2026-07-28 規定的 MUST
func originCheck(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" && !isAllowedOrigin(origin) {
			w.WriteHeader(http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func isAllowedOrigin(origin string) bool {
	// 以你自己的服務網域白名單實作
	return strings.HasSuffix(origin, ".acme.example.com") || origin == "https://claude.ai"
}
```

- 對應注意的點：
  1. `server/discover`、`resultType`、版本不符回 `-32022` 這些新規格細節，官方 go-sdk v1.7.0+ 都已經在內部實作（`mcp/server.go` 裡有 SEP-2575 的 discover handler），你不用自己刻——SDK README 有版本對照表：v1.7.0+ = `2026-07-28`
  2. HTTP 層的 `Accept` / `MCP-Protocol-Version` header 處理由 SDK 的 streamable handler 完成，**但 Origin 驗證不會自動做**，要用 middleware 自己包（上面 `originCheck`）
  3. `ToolAnnotations` 的 `ReadOnlyHint` / `DestructiveHint` 是指標欄位、`IdempotentHint` 是普通 bool，第一次寫很容易被這個差異卡一下；annotation 是給 client 的 UX 用，不是權限控制
  4. `ServerOptions.Instructions` 會出現在 `server/discover` 的回傳——放一段給 AI 看的說明，會明顯改善首次接線的體驗
  5. 動手時照官方 `examples/http/main.go` 抄最快，一支檔案同時示範 Streamable HTTP 的 server 與 client
  6. 舊版教學常見的 `initialize`／session 流程全部不用寫，全新服務直接以 `2026-07-28` 世代實作

## 進階款：認證（OAuth 2.1）

對 remote server 來說，認證是「服務擁有者」最需要傷腦筋的地方。官方規格基於 OAuth 2.1（draft）的一整套組合：

- resource server = 我們的 MCP server
- MCP client 扮演 OAuth client，代表 resource owner（也就是開發者的使用者）取得 access token
- 用 RFC9728（Protected Resource Metadata）做 authorization server discovery——**server 必須實作**，client 用它找到 AS 的位址

規格要求的東西不少，我只列服務擁有者一定要知道的：

1. MCP server 必須實作 RFC9728：在 401 回應的 `WWW-Authenticate` header 帶 `resource_metadata` 參數告知 metadata 位置（或提供 well-known URI），client 由此 discover authorization server
2. authorization server 至少要提供 RFC8414（OAuth AS metadata）或 OIDC discovery 之一
3. 動態 client registration（RFC7591）在新版已棄用，改推 Client ID Metadata Documents——對我們來說，意思是「先跟開發者註冊、給一組 client id」的流程會更常態化
4. 也可以用 resource indicators（RFC8707）讓同一個 token 綁定特定 MCP server
5. stdio（本地）情境不要套 OAuth，直接吃環境變數憑證就好

另一個考量點：OAuth 2.1 + PKCE 這套對「小規模內部服務」其實有點重。如果只是給自己團隊用，或還沒要公開給外部開發者，可以先不開認證（spec 說 authorization 是 OPTIONAL），配你的既有 gateway 擋住就好，等真的要開放再上。

## 工具設計：靜態 vs 動態

MCP server 主要價值就是工具（tools）。實作上有兩種做法：

- **靜態工具**：啟動時就註冊固定清單，適合工具數量固定、所有使用者權限相同的場景
- **動態工具**：`tools/list` 時依目前使用者身分即時回傳不同清單——`tools/call` 前的權限檢查、個人化的工具集，都很適合動態做法

對我們這種多租戶服務，動態工具幾乎是標配：免費方案只給 read-only 工具，付費用戶多幾個寫入工具，彈性很大。官方 Go SDK 的 `NewStreamableHTTPHandler` 第二個參數就是 factory——每個 request 都可以回傳不同的 server instance，實務上把認證 middleware 解析出的使用者資訊放到 request context，factory 再依它挑選或建立對應工具集的 server，就做到動態工具了。完整範例如下：

```go
// --- 1. 認證 middleware：解析開發者身分，放進 request context ---
type ctxKey string

const userKey ctxKey = "mcp-user"

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		user, err := resolveUser(token) // 你服務自己的 token → user 解析
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), userKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// --- 2. factory：依使用者回傳「工具集不同」的 server instance ---
var (
	mu      sync.Mutex
	servers = map[string]*mcp.Server{}
)

func serverFor(req *http.Request) *mcp.Server {
	user, _ := req.Context().Value(userKey).(string)

	mu.Lock()
	defer mu.Unlock()
	if s, ok := servers[user]; ok {
		return s // 第一次見到才建立，之後直接回傳同一個
	}

	s := mcp.NewServer(&mcp.Implementation{
		Name:    "acme-analytics-mcp",
		Version: "1.0.0",
	}, &mcp.ServerOptions{Instructions: "ACME Analytics 的 MCP server。"})

	// 每個使用者都有的工具：handler 用 closure 帶住 user，不用再從 context 撈
	mcp.AddTool(s, &mcp.Tool{
		Name:        "list_reports",
		Description: "列出目前使用者有權限的報表清單",
	}, func(ctx context.Context, req *mcp.CallToolRequest, params *ListReportsParams) (*mcp.CallToolResult, any, error) {
		reports, err := fetchReportsFor(ctx, user, params.Page)
		if err != nil {
			return nil, nil, err
		}
		return nil, reports, nil
	})

	// 有權限的使用者才給寫入工具 → tools/list 回傳的列表本身就不同
	if hasPermission(user, "reports:delete") {
		destructive := true
		mcp.AddTool(s, &mcp.Tool{
			Name:        "delete_report",
			Description: "刪除指定的報表（不可回復）",
			Annotations: &mcp.ToolAnnotations{DestructiveHint: &destructive},
		}, deleteReport)
	}

	servers[user] = s
	return s
}

// --- 3. 接上 HTTP（factory 取代「固定回傳一個 server」的寫法） ---
func main() {
	handler := mcp.NewStreamableHTTPHandler(serverFor, nil)
	log.Fatal(http.ListenAndServe(":8000", authMiddleware(originCheck(handler))))
}
```

- 對應注意的點：
  1. factory 每個 HTTP request 都會被呼叫，所以用 `map + mutex` 快取「第一次見到才建立、之後回傳同一個 instance」，避免每次 request 重建
  2. handler 用 closure 帶住 `user`（per-user instance 的最大好處），不同使用者的工具與權限天然隔離；`tools/list` 回傳的列表因使用者而異
  3. 記憶體提醒：這個 map 會隨使用者成長，量大要有 eviction 策略；折衷方案是「共用一個 server + 權限判斷放 handler 內」（回到靜態工具的寫法）
  4. 認證沿用 RFC6750 的 Bearer token——OAuth 下 client 的 access token 就是放在 `Authorization: Bearer` header，middleware 解析後塞進 context

另外 2025-03-26 起工具可以帶 `annotations`：

```json
{
  "name": "delete_report",
  "title": "Delete report",
  "description": "刪除指定的報表（不可回復）",
  "inputSchema": { "type": "object", "properties": { "report_id": { "type": "string" } } },
  "annotations": {
    "destructiveHint": true,
    "idempotentHint": false,
    "readOnlyHint": false
  }
}
```

- 對應注意的點：
  1. `destructiveHint: true` 會讓 client 在使用者授權流程上特別謹慎（例如 Claude 會要求確認）
  2. `readOnlyHint` 標記純查詢工具，可降低誤用風險
  3. annotation 是給 client 的使用者體驗用的，不是權限控制，真正的權限還是要在 server 端把關

老話一句：工具 description 要寫清楚參數意義、回傳結構、發生錯誤時的表示方式。AI 不會看文件，它只看你給的 schema 跟 description。

## 開發者視角：coding agent 怎麼用這個 server

前面都是站在「架 server」的角度，這節換成開發者（連線方）的角度，看完比較知道要怎麼設計文件化。開發者把 URL 加進 agent 後，agent 會**自動發現**你暴露的東西——實際「看懂並整合你的 API」靠 4 個來源：

| 來源                                              | 在 agent 端的呈現                                                                                                | 你該怎麼準備                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **server instructions**（`server/discover` 回傳） | session 啟動時就載入，像 skills 的觸發條件，決定 agent「何時該找你的工具」                                       | 寫清楚：這 server 做什麼、適合哪些任務                                                         |
| **tools**                                         | 預設 **tool search**：只有工具名稱先載入，完整定義（description + schema）等需要時才抓；呼叫前會跟使用者要核准   | name / description 精簡準確——**instructions 與 tool description 都會被截斷在 2KB**，重點放前面 |
| **resources**                                     | 開發者用 `@` 引用：`@acme:embedded:guide/api`，自動 attach 進對話（跟 @ 檔案一樣，autocomplete 是 fuzzy search） | 指南寫 markdown、命名直覺好搜                                                                  |
| **prompts**                                       | 使用者以 slash command 觸發（user-controlled）                                                                   | 做法見另一篇筆記：[MCP 與 Agent Skills](/2026/08/29/mcp-agent-skills-note/)                    |

以 Claude Code 為例，開發者的流程是：

```bash
# 1. 一行指令接上你的 server
claude mcp add --transport http acme https://analytics.example.com/mcp

# 2. session 啟動時，agent 自動送 discovery：tools/list、prompts/list、resources/list
# 3. 用 /mcp 看連線狀態，之後就能在對話裡直接叫你的工具
```

agent 理解你 API 的時機（三個場景）：

1. **「幫我們接 ACME Analytics API」**——agent 會 `@` 引用你的 `api-guide` 資源（讀懂認證、錯誤碼、rate limit 規範）再產出整合程式碼
2. **「列出最近的報表」**——agent 直接呼叫 `list_reports`，每次呼叫 client 都會先跟開發者核准；有 `destructiveHint` 的工具還會多一層確認
3. **卡住時**——agent 可以再 `@` 引用指南或呼叫資源相關工具補上下文

補充兩個開發者端的小知識：Claude Code 會自動重連掉線的 remote server（指數退避，最多五次）；server 送 `list_changed` 通知時，agent 會自動刷新工具清單，不用斷線重加。

## 小結

結論先講：MCP 新版規格對「服務擁有者」其實是友善的。stateless 化讓架構變簡單、水平擴展容易；`server/discover` 讓版本相容有明確的溝通管道；思維上跟 REST API 越來越像，寫過 OpenAPI 服務的人上手會很快。但代價就是「規格變動快」這點必須正視——2026-07-28 直接把 handshake 拿掉，2024、2025 年自建的 server 通通要遷移，決策上建議把「追蹤規格版本」排進例行工作，第一版先鎖定你能掌握的 client 範圍就好。

畢竟 MCP 的核心價值在於：開發者不用再自己寫客製化整合，在 AI 工具裡設定一個 URL 就能用你的服務。對我們這種想降低整合門檻的服務提供者來說，這個投資還算值得。

## 參考資料

- [MCP Specification — Key Changes (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [MCP Specification — Versioning and Compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning)
- [MCP Specification — Streamable HTTP Transport](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)
- [MCP Specification — Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
- [MCP Specification — server/discover](https://modelcontextprotocol.io/specification/2026-07-28/server/discover)
- [MCP Go SDK（官方，v1.7.0+ 支援 2026-07-28）](https://github.com/modelcontextprotocol/go-sdk)
- [MCP Go SDK — examples/http（Streamable HTTP server + client 範例）](https://github.com/modelcontextprotocol/go-sdk/tree/main/examples/http)
- [MCP Documentation Index](https://modelcontextprotocol.io/llms.txt)
