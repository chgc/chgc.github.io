---
layout: post
title: '看完 Uncle Bob 談 AI 時代的軟體基本功，我整理了五個還在用的觀點'
comments: true
date: '2025-08-29 11:00:00'
categories: 'AI'
tags: ['uncle-bob', 'ai-agents', 'coding-agent', 'mutation-testing', 'deep-modules']
---

# 看完 Uncle Bob 談 AI 時代的軟體基本功，我整理了五個還在用的觀點

前陣子把 Matt Pocock 訪談 Uncle Bob（Robert C. Martin）的影片完整看完，大概一個小時的內容，主題是「AI 時代軟體基本功還重不重要」。老實說，裡面有幾個觀點跟我自己用 coding agent 的體感完全一致，也有一些是我正在動手衡量、驗證的主題，所以趁記憶清楚整理成這篇筆記。影片是 LIVE: Uncle Bob on Software Fundamentals in the Age of AI（Matt Pocock 主持，約 57 分鐘）。

<!-- more -->

一句話先講結論：**軟體基本功在 AI 時代沒有過時，反而是駕馭 agent 的唯一方法**——只是做法換了：與其用提示詞「引導」agent，不如用自動化檢查「約束」agent。

## 為什麼壞程式碼對 agent 也是災難

訪談中 Matt 問了一個很關鍵的問題：agent 又快又能動，為什麼要在意壞 code？不能直接 push through 讓 bug 消失嗎？（影片 10:30）

Uncle Bob 的回答是他在去年 12 月開始認真用 coding agent 時的第一手觀察（10:52–12:10）：

> 「我讓小 Grock agent 做事，它會留下一堆殘局；我沒清理就讓它做下一件事，它留下更多殘局……然後我注意到它變慢了、卡住了——它會進入一種模式：改 A 無意中弄壞 B，修 B 又弄壞 C，開始繞圈子。」

> 「它們跟人類一樣受 messy code 影響。也許承受度的門檻不同，但門檻是存在的。程式可以亂到某個程度，agent 就再也不行了——我真的遇過 agent 直接放棄，有一個說：『我再也處理不了了。』」（意譯）

這個觀察跟我自己的體感一致，我把它整理成三層機制：

- **Context 成本層**：壞 code 代表更多重複、死碼、過長的函式。agent 是生成式模型，讀進去的每一行都是成本，而且它騙不過自己——要改對，就得真的讀懂。context 消耗越快，越早掉進所謂的「dumb zone」（context window 前段約 150k tokens 比較聰明，越往後 attention 越稀釋，這是訪談中 Matt 引用 Dex Hardy 的說法，15:16）。
- **錯誤複合層**：壞 code 的隱藏耦合（重複程式碼、繞經全域狀態）讓副作用不可見，於是 agent 修 A 弄壞 B、修 B 弄壞 C，迭代次數呈複合成長。人類可以靠意志和經驗臨時克服髒 code；agent 沒有意志，只有硬上限。
- **回饋訊號層**：壞 code 的測試通常也壞——少、脆弱、耦合實作細節，覆蓋率與突變分數低。測試是 agent 的「確定性羅盤」，羅盤失靈，它就不知道自己做對了沒有、何時該停。

一句話：**壞 code 對人類是慢性疲勞，對 agent 是急性中毒。**

## 與其寫規則進 prompt，不如把規則變成檢查

訪談後半段我最喜歡的部分。Matt 指出現在主流做法是把規則一股腦灌進 CLAUDE.md / AGENTS.md（他叫 steering，12:24），Uncle Bob 則是改用自動化檢查（deterministic tools）。

為什麼要這樣？Uncle Bob 說他自己早期也是 steering 派：「我的早期 prompt 寫著要 TDD、要 clean code、程式碼該長這樣，最後變成一份 5–10 頁的文件，我甚至可以把整本 Clean Code 餵進去」（12:55）。然後他發現（13:18）：

> 「模型把那些規則當成《神鬼奇航》裡的海盜法典——比較像是 guideline，may follow。」

背後有技術原因：**lost in the middle** 現象（Liu et al., arXiv:2307.03172）——context 變長時，開頭與結尾的內容最有能見度，中段的會被忽略；而且規則清單一旦夠長，連開頭那幾條也會被擠進中段「消失」。確定性工具不會這樣消失——checker 的輸出是「事實」（通過／失敗），不是「建議」，模型沒有選擇性忽略的空間。

結論是兩句話（14:56）：**把初始 prompt 砍到絕對最小值，保住前段的優先權；其餘全部交給事後的確定性工具。**

我自己對這個觀點很有共鳴，也在這樣做。實務上我會用這個轉換公式：每次想加一條規則進 CLAUDE.md，先問「這條能不能變成 checker？」能 → 做成工具＋CI 閘門；不能（純品味、專案脈絡）→ 才進 prompt，而且保持極短。

| 想立的規則         | steering 寫法（會被軟化）     | deterministic 寫法（不可消失）                 |
| ------------------ | ----------------------------- | ---------------------------------------------- |
| 函式要小、別太複雜 | 「請保持函式短小」            | CRAP 工具門檻 + CI fail-on                     |
| 依賴只能單向流動   | 「遵循乾淨的分層架構」        | ArchUnit / dependency-cruiser + fail-on-cycles |
| 不要註解掉的程式碼 | 「不要留 commented-out code」 | linter 規則 + CI                               |
| 測試要真的有用     | 「寫有意義的測試」            | 突變測試 + mutation score 閘門                 |
| 別把密鑰提交       | 「不要把 secret 放進 repo」   | gitleaks + CI                                  |

連 Anthropic 自己也是同方向：《Effective context engineering for AI agents》（2025-09-29）主張 context 是有限資源、記憶檔要精簡、聲明式、普遍適用。

## 兩個「人類做不動、agent 做剛好」的舊工具：CRAP 與突變測試

訪談中 Uncle Bob 講到他把兩個過去因為「太慢」而被擱置的舊技術重新搬出來用，因為 agent 快、又不覺得工作無聊。這兩個工具我之前的筆記有深入整理過，這裡快速帶過。

**CRAP 分數**（Change Risk Analysis and Prediction，Alberto Savoia 2007 提出）：把迴圈複雜度與測試覆蓋率混成一個數字：

> CRAP(m) = CC² × (1 − cov/100)³ + CC

沒測試的高複雜度函式，分數會以複雜度的平方級別爆炸。原始的「crappy」門檻是 30；而 Uncle Bob 用 agent 後，把門檻當成「品質契約」在調：人類 < 4、agent < 6、現在他的 crap4java repo 已經推到 8.0（超過就 exit code 2，CI 會擋）。訪談原文：「人類我壓在 4 以下，agent 我設 6，正在考慮推到 8」（32:34）。

**突變測試（Mutation Testing）**：1971 年由 Richard Lipton 提出，1978 年 DeMillo/Lipton/Sayward 發表經典論文，1980 年 Timothy Budd 才做出第一個工具。概念很簡單：把程式碼自動「種」進一些小蟲（例如把 `<` 翻成 `>`），再跑測試——測試掛掉代表突變體被殺（killed），測試照過代表突變體存活（survived），存活越多代表測試越虛。**100% 行覆蓋率不等於測試有效**，突變測試打的就是這個盲點。

過去為什麼沒人用？成本。Uncle Bob 說他 2000 年左右跑過一次：測試套件跑 4 分鐘 × 數百次突變 = 跑一整夜（07:31）。現在 agent 跑同樣的工作大概 30 分鐘（08:20），而且他把這關交給流水線裡的「hardener」agent，要求「絕對無情地」補到 100% 覆蓋率並消滅所有存活突變體。

順帶一提，Uncle Bob 把這兩個工具都開源了，而且都有 Go 版：`unclebob/crap4go`（自動跑 go test + coverprofile 再分析）、`unclebob/mutate4go`（支援 differential mutation——把「上次測試日期＋函式 hash」寫進檔案尾端，下次只測變更過的函式，正好對應訪談中「agent 只改 5 分鐘內小事」的哲學）。另外還有 `unclebob/dependency-checker`（宣告誰能依賴誰，違反就 exit 1）與 `unclebob/arch-view`（互動式 UML 架構檢視器，可以一路點到原始碼）。他的 `negative-test-experiment`（8 個獨立 Hunt the Wumpus 實作 × CRAP）也很適合當「對照實驗」的原型。

## Deep Modules：小介面讓 agent 讀得少、懂得多

訪談中 Matt 提到 John Ousterhout 的「深模組」概念（29:47），Uncle Bob 完全買單（30:32）。深模組 = 小介面、大實作：外面的人只要理解那個小介面，複雜度全部藏在裡面。經典例子是 Unix file I/O——open/read/write/close 共幾個 call，藏住磁碟配置、buffer、權限。

為什麼對 agent 特別有用？因為模型**可以只讀介面＋測試就理解一個模組**，不必把整個實作載進 context。深模組＝契約少＝agent 的思考成本低、出錯面小；淺模組（寬介面、沒藏東西）＝一堆契約要讀，agent 在裡面打轉的機率大增。Uncle Bob 的回應很有意思：「那是危險也是優勢——模型靠介面的名稱與結構猜行為，只要程式一致就沒問題」（30:40）。換句話說，**介面誠實（名稱與行為一致）是 agent 時代的硬需求**。

順帶一提，Ousterhout《A Philosophy of Software Design》第二版（2021）新增了與《Clean Code》的比較章節，附錄還有與 Uncle Bob 的辯論——訪談 31:04 講的就是這篇。兩邊對「函式長度」與「註解」的意見真的差很多，有興趣可以找來看。

## 給 junior 的學習路徑：先寫一年程式，再把自己當 agent

訪談最後 Matt 問：AI 吃掉所有戰術性工作後，新手要怎麼學策略性程式設計？Uncle Bob 的回答跟我帶 junior 的想法幾乎一致（46:12 起）：

1. **先寫一年真正的程式碼**（46:58）：讓你知道 agent 到底在處理什麼。「你無法徹底失去程式碼」（48:09）。
2. **進公司後「把自己當成 agent」**（47:16）：接受跟 agent 一樣的任務、過一樣的確定性工具閘門。用幾個月處於「極度沒生產力但學超多」的狀態，走完這個 gauntlet，才有資格自己帶一個 agent。
3. **學會認出「打轉」（thrash）**（50:59）：他怎麼發現 agent 在犯錯？不是看到髒程式碼，是看到 agent 打轉——「我認得那種挣扎，因為我親身經歷過。而新手進來根本認不出挣扎。」這是我覺得整段訪談最精華的一句話。
4. **讀舊書**（51:33）：Tom DeMarco、Ed Yourdon、《The Pragmatic Programmer》。70、80 年代寫的書要過濾掉過時部分，但「那些教訓就是在那時候學到的」。

Matt 補了一個很棒的觀察：傳統上策略性程式設計的**回饋迴路極長**——換公司的人永遠看不到自己的錯誤，因為錯誤在九個月後才顯現。AI 把迴路壓縮到分鐘級，新手第一次有機會親眼目睹自己的策略錯誤（50:20）。

## 小結

這次訪談的收穫，老實說不是我學到了多驚人的新東西——反而比較像「我憑感覺在做的事，有一個 50 年經驗的人幫我講出了道理」：用確定性檢查約束 agent、保持介面小且誠實、讓 junior 用最短的回饋迴路去養策略直覺。

如果你的團隊已經開始用 coding agent，我個人覺得可以立刻動手的三件事：把 CLAUDE.md 砍到極短、把規則改寫成 CI 閘門、然後量一下「同一個任務在乾淨與髒亂 codebase 上的 agent 成功率差多少」。最後這件事我還在實驗中，等有數據再來分享。

## 參考資料

- 訪談影片：[LIVE: Uncle Bob on Software Fundamentals in the Age of AI](https://www.youtube.com/watch?v=zcLPGC-tvgk)（Matt Pocock 主持，時間戳見內文）
- [Lost in the Middle: How Language Models Use Long Contexts（Liu et al., arXiv:2307.03172）](https://arxiv.org/abs/2307.03172)
- Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)（2025-09-29）
- Alberto Savoia, [The Code C.R.A.P. Metric Hits the Fan](https://web.archive.org/web/20200929233315/https://www.artima.com/weblogs/viewpost.jsp?thread=215899)（2007）
- [Mutation testing（Wikipedia）](https://en.wikipedia.org/wiki/Mutation_testing)、[PIT](https://pitest.org/)、[Stryker](https://stryker-mutator.io/)
- Uncle Bob 工具：github.com/unclebob/{crap4java, crap4go, mutate4go, dependency-checker, arch-view, negative-test-experiment, swarm-forge}
- John Ousterhout, [A Philosophy of Software Design](https://web.stanford.edu/~ouster/cgi-bin/book.php)（2nd ed. 2021）
