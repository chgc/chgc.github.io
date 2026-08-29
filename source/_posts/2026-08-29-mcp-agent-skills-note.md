---
layout: post
title: '[MCP] MCP 與 Agent Skills：prompts、resources 與本地 skills'
comments: true
date: '2026-08-29 10:00:00'
categories: 'MCP'
tags: ['mcp', 'agent-skills', 'mcp-resources', 'mcp-prompts', 'claude-code']
description: 'MCP 學習筆記：Agent Skills 與 MCP 的關係、prompts + resources 實作與本地 skills 生成。'
---

# MCP 與 Agent Skills 筆記：prompts、resources 與本地 skills 生成

這篇是從 [MCP Remote Server 新規格筆記](/2026/08/29/mcp-remote-server-note/) 拆出來的內容面：當服務不只是暴露 tools，還想提供「給 AI 看的指令與知識」時，skills、prompts、resources 這三者的關係，以及怎麼實作。核心問題只有一個——**skills 這種東西，能不能透過 MCP 提供？**

<!-- more -->

## 先釐清：Agent Skills 與 MCP 是兩個標準

常被問到但其實是兩個標準：**Agent Skills（`SKILL.md`）是 client 端的機制**（agentskills.io 的開放標準），不是 MCP protocol 的一部分。MCP server 能提供的是協議原生的三種 primitive，其中 **prompts 最接近 skills**：

| 想要的效果                  | 做法                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 給 AI 的操作指引 / 指令模板 | **prompts**（`prompts/list`、`prompts/get`）——server 定義結構化 instructions，使用者端常以 slash command 取用，2026-07-28 規格仍保留 |
| 給 AI 的知識文件 / 參考資料 | **resources**——把說明文件當 resource 暴露                                                                                            |
| 讓 AI 執行事情              | **tools**                                                                                                                            |

- 一個 skill 概念上 ≈ `prompts`（指令）+ `resources`（知識）+ `tools`（執行）的組合，這是通用方案，所有 MCP client 都懂
- MCP 官方文件的 `build-with-agent-skills` 是**反向**：用 Agent Skills 引導 agent 幫我們建 server（`mcp-server-dev` plugin），是開發工具不是 server 內容
- 想給 Claude Code 使用者「SKILL.md 一起交付」的體驗，走 **plugin** 打包（plugin 可以同時含 skills + MCP server 註冊），但那只服務特定 client

## 方向一：把 API 使用指南做成 prompts + resources（Go 實作）

對想開放給「任何 AI 工具」的服務擁有者來說：先用 **prompts + resources** 把 API 使用指南做成 server 內容，通用性最高；特定工具的進階體驗之後再加。

兩者的分工是：**prompts 放「固定的操作流程模板」**（例如「用我們的報表工具分析某張報表」這種引導），**resources 放「知識文件」**（API 使用指南、認證方式、錯誤碼對照、rate limit 規則）。以官方 go-sdk 為例：

```go
// --- prompts：引導 AI 完成固定流程，使用者端常以 slash command 觸發 ---
server.AddPrompt(&mcp.Prompt{
	Name:        "analyze-report",
	Title:       "分析報表",
	Description: "引導 AI 用報表工具分析指定報表",
	Arguments: []*mcp.PromptArgument{
		{Name: "report_id", Description: "要分析的報表 ID", Required: true},
	},
}, func(ctx context.Context, req *mcp.GetPromptRequest) (*mcp.GetPromptResult, error) {
	id := req.Params.Arguments["report_id"] // 使用者填入的參數
	return &mcp.GetPromptResult{
		Description: "報表分析引導",
		Messages: []*mcp.PromptMessage{
			{Role: "user", Content: &mcp.TextContent{
				Text: fmt.Sprintf("請用 list_reports / get_report 工具分析報表 %s，重點看趨勢與異常。", id),
			}},
		},
	}, nil)
})

// --- resources：把知識文件當內容提供，client 可以當附件加進對話 ---
server.AddResource(&mcp.Resource{
	Name:        "api-guide",
	Title:       "API 使用指南",
	Description: "ACME Analytics API 的完整使用指南（認證、錯誤碼、rate limit 與範例）",
	MIMEType:    "text/markdown",
	URI:         "embedded:guide/api", // URI scheme 自己設計，官方範例慣用 embedded:
}, func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
	if req.Params.URI != "embedded:guide/api" {
		return nil, mcp.ResourceNotFoundError(req.Params.URI) // 官方建議的回法
	}
	return &mcp.ReadResourceResult{Contents: []*mcp.ResourceContents{
		{URI: req.Params.URI, MIMEType: "text/markdown", Text: apiGuideMD}, // apiGuideMD 可用 //go:embed 包成二進位
	}}, nil
})

// --- resource template：依參數展開的動態文件（RFC 6570） ---
server.AddResourceTemplate(&mcp.ResourceTemplate{
	Name:        "guide-section",
	MIMEType:    "text/markdown",
	URITemplate: "embedded:guide/{section}",
}, guideSectionHandler)
```

- 對應注意的點：
  1. `AddPrompt` 的 handler 回 `GetPromptResult`，內容是 `Messages`（role + content）；`Arguments` 讓使用者觸發時填參數，在 handler 裡用 `req.Params.Arguments` 取值
  2. `AddResource` 的 handler 回 `ReadResourceResult.Contents`，找不到資源就回 `mcp.ResourceNotFoundError(uri)`（官方特別註記這個寫法）
  3. `MIMEType: "text/markdown"` 是重點——文件用 markdown 寫，AI 讀起來最順
  4. 2026-07-28 規格中 prompts 是 **user-controlled**：由使用者主動觸發（常呈現為 slash command），不是 AI 自己決定要用的；所以別期待 AI 會自動跑去讀指南，指南類知識要放 resources 才容易被帶進對話
  5. resource template 用 RFC 6570 的 URI 樣板，適合「文件很多、不想逐筆註冊」的情境
  6. 完整可抄的範例在官方 [examples/server/everything/main.go](https://github.com/modelcontextprotocol/go-sdk/blob/main/examples/server/everything/main.go)（prompt、embedded resource、resource template 三個都有）

## 方向二：把 resources 變成開發者本地的 skills（反向模式）

另一個方向也很值得知道：**不是把 SKILL.md 放進 server，而是讓 coding agent 讀取 server 的 resources，在開發者本地生成 SKILL.md**。技術上成立，因為 resources 內容就是 markdown、agent 有寫檔能力、而且 Claude Code 對 skills 目錄有 hot-reload（新增 `SKILL.md` 當下 session 就生效）：

```
1. agent 讀 resource    →  @acme:embedded:guide/api（API 整合指南）
2. 開發者指示            →  「把 ACME 的整合方式做成一個 skill」
3. agent 生成            →  .claude/skills/acme-api/SKILL.md（+ references/ 範例檔）
4. 之後任何 session      →  skill 描述觸發 → 載入 SKILL.md → 依指示呼叫 MCP server 的工具
```

本地 skills 三層路徑（Claude Code 慣例）：`~/.claude/skills/<name>/SKILL.md`（個人）、`.claude/skills/<name>/SKILL.md`（專案，可 commit 共享給團隊）、`<plugin>/skills/<name>/SKILL.md`（隨 plugin 分發）。分工是：**skill 負責知識與觸發條件，MCP tools 負責執行**；skill 資料夾加了 `.claude-plugin/plugin.json` 還能跟 MCP server 設定一起打包成 plugin。

提醒三點：這是 **agent 驅動的模式，不是協定標準化的機制**（沒有標準會把 skill 推送給 client）；resources 來自第三方、skill 又是會自動觸發的持久化指令，生成前要開發者核准、事後 review（防 prompt injection）；資料會變的內容別寫死進 skill，放 resources 維持動態，skill 只留穩定知識（認證慣例、觸發規則）。

## 小結

對服務擁有者來說，務實的順序是：先把 API 使用指南做成 **resources + prompts**（所有 MCP client 通用），再視開發者需求，讓 agent 把資源內容轉成本地 **skills**（Claude Code 生態的進階體驗）。server 不必親自「發送」skill——把內容做好，agents 自然會把它變成 skill。

## 參考資料

- [Agent Skills 標準（agentskills.io）](https://agentskills.io/)
- [Model Context Protocol — Prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts)
- [Model Context Protocol — Resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources)
- [Model Context Protocol — Build with Agent Skills](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-with-agent-skills.md)
- [Claude Code — Skills](https://code.claude.com/docs/en/skills)
- [MCP Go SDK — examples/server/everything（prompt / resource / resource template 範例）](https://github.com/modelcontextprotocol/go-sdk/blob/main/examples/server/everything/main.go)
