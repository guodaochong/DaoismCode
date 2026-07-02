<div align="center">

# 道 DaoismCode

### 是生万象 — All Things Arise

**The world's first terminal-native AI coding agent with a six-engine smart model router, a self-reflecting agentic loop, semantic code search, and zero FFI dependencies.**

📖 **文档站**: [https://guodaochong.github.io/DaoismCode/](https://guodaochong.github.io/DaoismCode/)

[Smart Routing](#-smart-model-routing-v3) · [Vision](#-multimodal-vision--paste) · [Agentic Loop](#-agentic-loop--plan-execute-verify-fix) · [Sisyphus](#-sisyphus-mode) · [Parallel Agents](#-parallel-sub-agents) · [Reflexion](#-reflexion-memory) · [Semantic Search](#-semantic-code-search--index--search-find_code) · [Test Gen](#-auto-test-generation--test) · [Code Review](#-code-review--review) · [Git Archaeology](#-git-archaeology--why) · [Flow Trace](#-code-flow-tracing--flow) · [Guardian](#-background-code-guardian--guard) · [Multi-Agent Team](#-multi-agent-collaboration--team) · [Architecture](#-architecture)

</div>

---

## Overview

**DaoismCode** is not another code generator. It is a fully autonomous software engineer that lives in your terminal.

It plans tasks, writes code, runs tests, reads failures, fixes bugs, learns from mistakes, and only declares "done" when every check passes — all without leaving your console. No IDE plugins. No browser tabs. No FFI crashes.

**Powered by [LUOBIN-PI](https://github.com/jumpingbirds).** Backend: ZhipuAI GLM Coding Plan.

### What Makes It Different

| | DaoismCode | Claude Code | Cursor | Devin |
|---|---|---|---|---|
| **Model Routing** | Six-engine smart router (95% accuracy) | Single model | Single model | Single model |
| **Multimodal Vision** | GLM-4.6V (Golden Core) + `/paste` clipboard | ✅ | ✅ | ✅ |
| **Agentic Loop** | Plan → Execute → Verify → Fix (self-correcting) | Basic loop | Basic loop | Advanced loop |
| **Sisyphus Mode** | 500 steps + unlimited fixes + auto-continue | ❌ | ❌ | ❌ |
| **Parallel Agents** | Auto-detect + parallel_subagents (up to 4x) + quality control | ❌ | ❌ | ❌ |
| **Self-Reflection** | Reflexion memory (learns from failures) + Project Memory (architecture/pitfalls) | ❌ | ❌ | ❌ |
| **TDD Mode** | Test-first enforcement | ❌ | ❌ | ❌ |
| **Test Generation** | `/test` — auto-generate + auto-fix + run | ❌ | ❌ | ❌ |
| **Code Review** | `/review` — 6-dimension automated review | ❌ | Partial | Partial |
| **Codebase Scan** | `/scan` — security/bugs/performance/debt/missing tests | ❌ | ❌ | ❌ |
| **Impact Analysis** | Cross-file dependency tracking (JS/TS/Python/Java) | ❌ | ❌ | Partial |
| **Semantic Search** | GLM embedding-3 vector search (find code by meaning) | ❌ | ❌ | ❌ |
| **Interactive Decisions** | `ask_user` — single & multi-select keyboard panel | ❌ | ❌ | ❌ |
| **Structural Search** | `code_search` — 10 patterns, 6 languages | ❌ | ❌ | ❌ |
| **GitHub Search** | `search_github` — real-world code examples | ❌ | ❌ | ❌ |
| **Git Archaeology** | `/why` — blame analysis + hotspot + LLM report | ❌ | ❌ | ❌ |
| **Flow Tracing** | `/flow` — AST call graph + cross-file + cycle detection | ❌ | ❌ | ❌ |
| **Code Guardian** | `/guard` — 13 security rules + perf + dead code + typesafety | ❌ | Partial | ❌ |
| **Multi-Agent Team** | `/team` — Architect→FE+BE→Tester→Reviewer pipeline | ❌ | ❌ | Partial |
| **Git Safety Net** | Auto-snapshot + diff guard + rollback | ❌ | ❌ | ❌ |
| **Completion Gate** | 5-dimensional verification before "done" | Manual | Manual | Partial |
| **Renderer** | Custom ANSI (pure TS, zero FFI) | Terminal | Electron IDE | Browser |
| **Deployment** | Single 103 MB standalone `.exe` | npm package | Desktop app | Cloud SaaS |
| **Session Security** | AES-256-GCM + gzip, machine-bound | Plaintext | Local DB | Cloud |
| **Tool Execution** | Parallel (`Promise.all`) | Sequential | Sequential | Sequential |
| **Cost Efficiency** | ~56% savings via auto-routing | Full price | Full price | Subscription |

---

## Quickstart

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Bun** | ≥ 1.3 | TUI runtime + standalone compilation |
| **Node** | ≥ 20 | Agent core, tests, readline CLI |
| **pnpm** | ≥ 9 | Package management |

### Development Setup

```bash
git clone https://gitee.com/luobinguodaochong/daoism-code.git
cd daoism-code
pnpm install

# Configure your API key
echo '{ "provider": "glm", "model": "glm-5.2", "apiKey": "YOUR-KEY" }' > .daoismcode/config.json

# Launch the TUI
pnpm tui
```

### Build Standalone Executable

```bash
pnpm build:exe    # → dist/daoism.exe (103 MB, zero runtime deps)
```

Deploy anywhere — copy the single `.exe` and run. No Bun, no Node, no `node_modules`.

---

## 🧭 Smart Model Routing v3

> **Six intelligent engines** working in concert to route every message — and every execution step — to the optimal model. ~95% routing accuracy, ~56% cost savings.

Most AI coding agents use one model for everything. DaoismCode's router is different: it analyzes each message with six overlapping intelligence layers, then selects the cheapest model that can handle the job.

### Three Realms

The GLM Coding Plan provides four models, each mapped to a cultivation realm:

| Realm | Model | Role | Context | Strength |
|---|---|---|---|---|
| 🟫 **Foundation** (筑基) | GLM-4.7 | Entry | 128K | Lightning-fast, handles simple queries and searches |
| 🟨 **Golden Core** (金丹) | GLM-4.6V | Vision | 128K | Multimodal — analyzes screenshots, UI, error images |
| 🟦 **Nascent Soul** (元婴) | GLM-5-Turbo | Mid-tier | 128K | Balanced reasoning and safe fallback |
| 🟪 **Spirit Transformation** (化神) | GLM-5.2 | Flagship | **1M** | Coding SOTA, global #2 on LMArena (after Claude) |

### Six Intelligence Engines

```
                    ┌─────────────────────────────┐
  User message ────▶│  ① Weighted Scoring Engine   │
                    │  (CN/EN keywords + code detect)│
                    └────────────┬────────────────┘
                                 │ Confidence < 0.45?
                    ┌────────────▼────────────────┐
                    │  ② Tool-Call Feedback        │◀── Last turn used edit_file?
                    │  (Infer type from tool history)│
                    └────────────┬────────────────┘
                                 │ Still unsure?
                    ┌────────────▼────────────────┐
                    │  ③ Context Awareness         │◀── Last 3 turns all "coding"?
                    │  (Continue session context)   │
                    └────────────┬────────────────┘
                                 │ Still unsure?
                    ┌────────────▼────────────────┐
                    │  ④ LLM-Assisted Classification│
                    │  (Foundation realm 0.3s judge)│
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │  ⑤ Complexity + Budget Guard  │◀── >300 chars? >85% quota?
                    │  (Auto-upgrade / downgrade)   │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │  ⑥ Multi-Step Hybrid Routing  │◀── Per-step dynamic switch
                    │  (Re-selects model each step) │
                    └────────────┬────────────────┘
                                 │
                                 ▼
                    ⛩️ Optimal realm selected
```

#### ① Weighted Scoring Engine

No more "first keyword match wins." All categories are scored simultaneously:

```
Message: "Check the bug in auth.ts and optimize performance"

Scores:
  coding:   1.5    (file path auth.ts +1.5)
  review:   1.8    (bug ×0.9 + optimize ×0.9)
  planning: 0
  search:   0
                    ↓
  Winner: review (1.8)  →  Spirit Transformation
```

**Detection dimensions:** 50+ CN/EN keywords (weighted 0.7–1.0), code blocks (` ``` ` +3), inline code (+1.5), file paths (+1.5), syntax keywords (+3).

#### ② Tool-Call Feedback

What tools the agent used last turn is the strongest signal for the current task:

| Last Tools | Inferred Type | Routes To |
|---|---|---|
| `edit_file` `write_file` `bash` | coding | Spirit Transformation |
| `read_file` `glob` `grep` `web_search` | search | Foundation |
| Mixed | Majority vote | Dynamic |

#### ③ Context Awareness

Remembers the last 3 turns. When a message is ambiguous, continues the session context:

```
Turn 1: "Implement login feature"        → coding → Spirit
Turn 2: "Add password reset too"         → coding → Spirit
Turn 3: "Hmm, also captcha"              → Ambiguous... but last 3 = coding
       → Continue context → coding → Spirit ✓
```

#### ④ LLM-Assisted Classification

When rule-based confidence is low, the Foundation realm performs a 0.3-second quick classification:

```
Message: "Um, help me with that thing"   (confidence 0.2)
     ↓
Foundation (GLM-4.7) 0.3s verdict: "coding"
     ↓
Routes to Spirit Transformation · Source: llm
```

#### ⑤ Complexity + Budget Guard

- **Complexity upgrade:** Message > 300 chars → auto-upgrade to Spirit Transformation regardless of type.
- **Budget downgrade:** Any realm > 85% quota → auto-downgrade to a cheaper realm.

#### ⑥ Multi-Step Hybrid Routing

A single task may span multiple steps. Each step re-selects its model based on the previous step's tool calls:

```
Task: "Search for login code, then add 2FA"

  Step 1: glob + grep (search)     → Foundation  (cheap, sufficient)
  Step 2: read_file (read code)    → Foundation
  Step 3: edit_file (write code!)  → Auto-upgrade to Spirit (coding tool detected)
  Step 4: bash (run tests)         → Spirit Transformation
  Step 5: Reply to user            → Spirit Transformation
```

### Routing Source Labels

The TUI shows how the routing decision was made:

```
⛩️ Spirit · coding · rules     ← Rule engine decided
⛩️ Spirit · coding · tools     ← Inferred from tool history
⛩️ Spirit · coding · context   ← Continued from session context
⛩️ Spirit · coding · llm       ← LLM-assisted classification
```

### Cost Comparison

| Mode | 100 requests cost | Savings |
|---|---|---|
| All Spirit Transformation (no routing) | ¥5.00 | — |
| **Smart Routing v3** | **¥2.20** | **56% ↓** |

### Configuration

```json
{
  "provider": "glm",
  "model": "glm-5.2",
  "enableRouting": true
}
```

---

## 🔄 Agentic Loop — Plan → Execute → Verify → Fix

> DaoismCode is not a code generator. It is an autonomous engineer that **writes, verifies, self-corrects, and only delivers when all checks pass.**

Inspired by the architectures of Devin, SWE-Agent, and Claude Code — then pushed further with Reflexion memory and Git-native safety.

### The Loop

```
User Task
    │
    ▼
┌─ PLAN ──────────────────────────────┐
│ 1. todo_write — decompose the task   │
│ 2. read_file / grep / glob — explore │
└──────────────┬───────────────────────┘
               ▼
┌─ EXECUTE (TDD preferred) ───────────┐
│ 3. Write test (defines behavior)     │
│ 4. Run test (SHOULD fail — validates)│
│ 5. Write code (minimum to pass)      │
│ 6. git stash create ← safety net     │
└──────────────┬───────────────────────┘
               ▼
┌─ VERIFY (mandatory) ────────────────┐
│ 7. detect_verify → find commands     │
│ 8. Run test suite                    │
│ 9. Run type checking (tsc/mypy)      │
│ 10. Run linting                      │
└──────────────┬───────────────────────┘
               │
      ┌────────┴────────┐
      ✅ ALL PASS        ❌ FAIL
      │                  │
      ▼                  ▼
┌─ COMPLETION GATE ─ ┌─ FIX (self-correction, max 3 rounds) ─┐
│ - Tests passed?    │ 11. Read error output                  │
│ - Type check OK?   │ 12. Analyze root cause                 │
│ - No debug residue?│ 13. Fix code                           │
│ - Diff reasonable? │ 14. Record lesson in Reflexion         │
│ - Verified?        │ 15. Re-run verification → loop         │
└────────────────────┘ └────────────────────────────────────────┘
               │
               ▼
         ✅ DELIVERED
```

### Three Enforcement Mechanisms

#### Verification Blocking

If the agent writes code but **tries to say "done" without running tests**, the loop refuses to end:

> `[SYSTEM] You modified code but have NOT verified it. Run the project test suite and type checks NOW.`

#### Failure Reflection Injection

When tests fail, the loop automatically injects a structured prompt:

> `[SYSTEM] Verification FAILED (attempt 1/3). Analyze the error output above, identify the root cause, and fix it. Do NOT declare "done" until all checks pass.`

#### Retry Limit

Maximum **3 fix attempts** (75% of improvements come from the first 2 rounds). After 3 rounds, the agent reports remaining errors honestly.

---

## 🧠 Reflexion Memory

> The agent learns from every failure. Past lessons are automatically loaded into the system prompt for all future tasks.

### How It Works

```
Round 1: Write code → Test fails "TypeError: Cannot read undefined"
         ↓ Auto-writes to .daoismcode/reflexion.md
         [2026-06-29] TypeError: Cannot read... → Always verify with: npm test

Next task: System prompt auto-loads lessons
           "## PAST LESSONS — do NOT repeat these"
           Agent sees historical lessons → avoids repeating mistakes
```

The Reflexion file accumulates up to 30 lessons, each capturing the error summary and the corrective action. Over time, the agent gets smarter about your specific project's pitfalls.

---

## 🛡️ Multi-Dimensional Completion Gate

> "done" is not what the agent says. "done" is what the verification proves.

Five gates must ALL pass before the agent is allowed to finish:

| Gate | Check | Blocks If |
|---|---|---|
| **Tests** | Test suite exits 0 | Any test fails |
| **Type Check** | `tsc --noEmit` / `mypy` clean | Type errors exist |
| **Debug Residue** | No `console.log` / `print` / `debugger` in new code | Leftover debug statements |
| **Diff Scope** | `git diff --stat` shows focused changes | > 500 insertions (possible accidents) |
| **Verified** | At least one verification command ran | Code written but never tested |

If any gate fails, the loop continues — the agent must fix the issue before it can declare completion.

---

## 🔒 Git-Native Safety Net

> Before the agent touches your code, it creates a Git snapshot. If everything goes wrong, it can roll back.

| Mechanism | When | What |
|---|---|---|
| **Snapshot** | First `edit_file` / `write_file` of a task | `git stash create` — captures pre-change state |
| **Diff Guard** | Before declaring "done" | `git diff --stat` — blocks if changes are suspiciously large |
| **Rollback** | If fix attempts exhausted | Restore from snapshot (manual or automatic) |

This means you can let the agent make aggressive changes with confidence — the safety net catches catastrophic failures.

---

## 🚀 Parallel Sub-Agents

> Large tasks with independent parts are automatically detected and executed in parallel — up to 4x faster. Zero user intervention required.

### Auto-Detection

The agent doesn't wait for you to say "parallel." It analyzes your message in real-time and detects independent tasks:

```
You: "帮我实现注册、登录、密码重置三个功能"
         ↓ [Code-level auto-detection]
         ✓ 3 independent task verbs detected (实现/登录/密码重置)
         ✓ No dependency keywords (然后/之后/基于)
         ↓ [Auto-injected into agent context]
         Agent sees: "3 independent tasks detected. Use parallel_subagents."
         ↓
         🚀 3 sub-agents launched simultaneously
```

### Detection Patterns

| Pattern | Example | Triggered |
|---|---|---|
| Numbered list | `1. 注册 2. 登录 3. 重置` | ✅ |
| Semicolon list | `实现注册; 添加登录; 创建重置` | ✅ |
| Comma list (3+) | `实现注册、添加登录、创建重置` | ✅ |
| Multi-verb | `实现注册 和 添加登录` | ✅ |
| Sequential deps | `先修复bug，然后写测试` | ❌ (has "然后") |
| Single task | `修复这个bug` | ❌ |

### Execution

```
🚀 3 parallel sub-agents completed in 12.3s (3/3 succeeded)

✅ Task 1: 实现用户注册功能 (5 steps)
   Created src/api/register.ts...

✅ Task 2: 实现用户登录功能 (4 steps)
   Created src/api/login.ts...

✅ Task 3: 实现密码重置功能 (6 steps)
   Created src/api/reset.ts...
```

### Safety Mechanisms

| Mechanism | What It Does |
|---|---|
| **Permission lock** | Serializes permission prompts — prevents `permPending` race condition deadlock |
| **120s timeout** | Each sub-agent auto-killed after 2 minutes — prevents infinite hangs |
| **Depth limit** | Sub-agents cannot spawn further sub-agents (max depth 2) |
| **File conflict warning** | System prompt forbids parallel tasks touching the same file |

### Speed Comparison

```
Sequential: Task1(8s) → Task2(6s) → Task3(10s) = 24s total
Parallel:   max(8s, 6s, 10s)             = 10s total   ← 58% faster
```

---

## 👁️ Multimodal Vision `/paste`

> Screenshot an error, paste it, get a diagnosis. Screenshot a UI, paste it, get code. Powered by GLM-4.6V (Golden Core realm).

### Usage

```
1. Win+Shift+S to capture a screenshot (goes to clipboard)
2. Type /paste in DaoismCode
3. Agent auto-switches to Golden Core (GLM-4.6V), analyzes the image, returns diagnosis + fix
```

### Capabilities

| Scenario | Example |
|---|---|
| 🔍 **Error diagnosis** | Screenshot error dialog → analyze cause → generate fix |
| 🎨 **UI → Code** | Screenshot design → generate HTML/CSS/React |
| 🐛 **Bug diagnosis** | Screenshot broken layout → identify CSS issue |
| 📊 **Chart analysis** | Screenshot chart → extract data and trends |
| 🏗️ **Diagram understanding** | Architecture diagram → understand component relationships |

The agent uses the `analyze_image` tool internally — it reads the image, base64-encodes it, and sends it to GLM-4.6V via the Coding Plan endpoint (no extra cost).

### Manual Usage

```
User: "分析 error.png 这个报错"
→ Agent calls analyze_image({ path: "error.png", prompt: "分析这个错误..." })
```

---

## 🔄 Sisyphus Mode `/sisyphus`

> Never give up. 500 steps, unlimited fix attempts, auto-continue when budget exhausts. The agent keeps pushing until the task is done.

### Usage

```
/sisyphus    ← toggle on/off (persists across restarts)
```

| Parameter | Normal Mode | Sisyphus Mode |
|---|---|---|
| Step budget | 50 | **500** |
| Fix attempts | 3 | **Unlimited (∞)** |
| Budget exhausted | Stops | **Auto-continue (up to 3 rounds = 1500 total steps)** |
| Status bar | `⛩️化神境` | `🔄⛩️化神境` |

The only way to stop: all todos completed, user presses `/stop`, or 1500 steps consumed.

---

## 🧪 Auto Test Generation `/test`

> Point it at any source file. It analyzes the code, generates comprehensive unit tests, auto-fixes failures (up to 2 rounds), and runs them — all in one command.

### Usage

```
/test src/utils/calc.ts
```

### How It Works

```
/test src/utils/calc.ts
     ↓
[Read source] → Analyze exported functions, classes, methods
     ↓
[Detect framework] → vitest / jest / pytest / cargo test / go test
     ↓
[Spirit Transformation (GLM-5.2)] → Generate test code:
  · Happy path — normal valid inputs with expected outputs
  · Edge cases — null, undefined, empty, zero, negative, MAX_VALUE
  · Error cases — invalid types, out-of-range, missing params
  · Boundary — off-by-one, exactly at limits
     ↓
[Write test file] → src/utils/calc.test.ts
     ↓
[Auto-run tests] → vitest run / pytest / cargo test
     ↓
✅ 8 tests generated and passing!
```

### Supported Frameworks

| Language | Framework | Test File |
|---|---|---|
| TypeScript/JavaScript | vitest, jest | `*.test.ts` |
| Python | pytest | `tests/*_test.py` |
| Rust | `#[test]` | `*_test.rs` |
| Go | `testing.T` | `*_test.go` |

---

## 📋 Code Review `/review`

> Six-dimension automated code review. Analyzes your git diff and delivers a structured review — bugs, security, performance, code quality, breaking changes, and test coverage.

### Usage

```
/review
```

### Six Review Dimensions

| Dimension | What It Catches |
|---|---|
| 🐛 **Bugs & Logic** | Off-by-one, null access, unhandled edge cases, race conditions, resource leaks |
| 🔒 **Security** | Injection (SQL/XSS/command), hardcoded secrets, missing input validation, auth gaps |
| ⚡ **Performance** | O(n²) complexity, unnecessary allocations, N+1 queries, blocking in async |
| 🎨 **Code Quality** | Naming, dead code, empty catch, magic numbers, inconsistent patterns |
| 💥 **Breaking Changes** | Changed signatures, removed exports, modified interfaces, config format changes |
| 🧪 **Test Coverage** | Are changes tested? Edge cases covered? Existing tests need updating? |

### Output Format

```
📋 Code Review Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verdict: ⚠️ APPROVE WITH NOTES

Files reviewed: 3 | Lines changed: +45/-12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 Critical (must fix before merge):
  1. [auth.ts:42] token may be undefined — no null guard

🟡 Warnings (should fix):
  1. [router.ts:15] Unused import

🔵 Suggestions (nice to have):
  1. [utils.ts:8] Extract magic number to named constant

✅ Good practices observed:
  - Proper error handling
  - Clear naming
```

Reviews are powered by Spirit Transformation (GLM-5.2) and automatically load Reflexion lessons to prevent recurring issues.

---

## 🔎 Semantic Code Search `/index` `/search` `find_code`

> The agent understands what your code *means*, not just what it says. Vector embedding search powered by GLM embedding-3 finds relevant code by semantic intent — even when no keywords match.

### The Problem with Keyword Search

```
You: "How does authentication work?"

grep "auth"     → finds 47 files (auth.ts, oauth.ts, author.ts, authority.ts...)
glob "**/*auth*" → finds 23 files
                 → Agent drowns in false positives, reads 10 wrong files, wastes 8 steps

find_code("authentication work") → finds 3 files (auth.ts, middleware.ts, token.ts)
                                → Agent reads the RIGHT files in 2 steps
```

### How It Works

```
/index              → Scans codebase → chunks by AST (function/class/method)
                    → Generates 512-dim embedding per chunk (GLM embedding-3)
                    → Saves to .daoismcode/embeddings.json

find_code("query")  → Embeds the query → cosine similarity vs all chunks
                    → Returns top-K matches with file path + line range + score

/search "query"     → Manual semantic search (same engine, user-triggered)
```

### Technical Details

| Component | Implementation |
|---|---|
| **Embedding model** | GLM embedding-3 (512 dimensions) |
| **Chunking** | AST-aware (function/class/method boundaries) — 6 languages |
| **Index format** | JSON, mtime-based incremental updates |
| **Similarity** | Cosine similarity, top-K retrieval |
| **Auto-indexing** | Lazy — builds index on first `find_code` call if missing |
| **Cost** | Zero — included in GLM Coding Plan, no separate billing |

### Supported Languages for Chunking

| Language | Chunk Boundaries |
|---|---|
| TypeScript / JavaScript | `function`, `class`, `method`, `arrow function` |
| Python | `def`, `class`, `async def` |
| Java | `public/private method`, `class` |
| Go | `func`, `type struct` |
| Rust | `fn`, `impl`, `struct` |
| Other | Line-based with overlap |

### Agent Integration

The agent auto-uses `find_code` when exploring unfamiliar codebases. The loop injects a hint after 3 consecutive `grep`/`glob` calls if `find_code` hasn't been used:

> `[TIP] You've used grep/glob 3 times. Try find_code for semantic search — it finds code by meaning, not keywords.`

---

## 🔍 Cross-File Impact Analysis

> Before changing an exported function, the agent knows exactly which files will break. No more "I changed one function and three files stopped compiling."

### How It Works

When the agent modifies code, it calls `analyze_impact` to trace all dependent files:

```
User: "Change verifyToken's signature from string to Token object"

Agent:
  1. analyze_impact("src/auth.ts", "verifyToken")
     → Finds 5 dependent files
  2. edit auth.ts       → change signature
  3. edit router.ts     → update call site
  4. edit middleware.ts → update call site
  5. edit api/login.ts  → update call site
  6. tsc --noEmit       → ✅ all pass
```

### Language Support

| Language | Import Detection | Symbol Tracing | LSP Cross-Check |
|---|---|---|---|
| **JS/TS** | ESM, CJS, re-exports | ✅ Precise | ✅ tsserver |
| **Python** | `from X import Y`, `import X` | ✅ Precise | — |
| **Java** | `import com.example.*`, static | ✅ Precise | — |
| **Other** | Generic import patterns | Basic | — |

### Loop Integration

The Agentic Loop enforces impact awareness:
- After editing code, if the agent hasn't run `analyze_impact`, it receives a reminder before being allowed to declare "done"
- This prevents the #1 source of bugs: changing a function without updating its callers

---

## 🔍 Git Archaeology `/why`

> **Code archaeology** — reconstruct design intent, evolution, and risk signals from git history.

Most tools show *who* changed a line. DaoismCode tells you *why* it exists, how it evolved, and whether it's risky.

### How It Works

```
/why src/auth/login.ts:handleLogin
```

1. **`git blame --line-porcelain`** → line-by-line state machine parser extracts commit/author/date/summary
2. **Hotspot detection** → top 5 commits by lines touched
3. **Stability analysis** → 🔥 unstable (15+ commits) / ✅ stable (< 3)
4. **Revert detection** → scans for `revert`, `回退`, `rollback`
5. **`git show`** → extracts actual diffs from hotspot commits
6. **LLM report** → generates Chinese archaeology report (origin, evolution, design decisions, risks)

### Output

```
📍 代码考古: src/auth/login.ts:handleLogin
🔥 稳定性: 高频变更 (不稳定)
⚠️ 争议: 检测到 2 次回退提交

🗓️ 起源: 2024-01-15, commit a1b2c3d — 解决初始登录安全性
🔧 演进: 23 次提交, 热点: d4e5f6a, g7h8i9j
💡 设计: JWT + Refresh Token 双令牌策略
⚠️ 风险: 频繁变更 + 2次回退
```

---

## 🌊 Code Flow Tracing `/flow`

> **Call graph tracer** — trace complete execution paths from any function, using TypeScript Compiler API AST.

```
/flow handleLogin
```

### Engine

| File Type | Engine | Precision |
|---|---|---|
| TS / JS | **TypeScript Compiler API (AST)** | Exact |
| Python / Go / Rust | Regex + indentation/brace analysis | Approximate |

### Output

```
📍 Call Flow: handleLogin
🔬 TypeScript Compiler API (AST)
✓ verified: 4  ~ approximate: 1  ? inferred: 0

└─ [✓] ⏩handleLogin() {1 arg(s)} [src/auth/login.ts:12]
   ├─ [✓] authenticate() {1 arg(s)} [src/auth/service.ts:45]
   │  ├─ [✓] db.query() {2 arg(s)} [src/db/client.ts:89]
   │  └─ [✓] crypto.compare() {2 arg(s)} [node:crypto]
   ├─ [✓] generateToken() [src/auth/jwt.ts:8]
   └─ [~] logActivity() [src/utils/log.ts:23]

📊 7 functions · depth 5 · 6 unique
```

### Confidence Labels

| Label | Meaning |
|---|---|
| `[✓]` | AST verified — TypeChecker confirmed definition location |
| `[~]` | Name matched — found in index but definition unconfirmed |
| `[?]` | LLM inferred — dynamic dispatch resolved by LLM |

### Detection Coverage

Direct calls, method calls (`obj.method()`), dynamic index (`obj[key]()`), constructors (`new Class()`), tagged templates (`sql\`...\``), with async badges (⏩), call counts (×N), and parameter hints.

---

## 🛡️ Background Code Guardian `/guard`

> **Static analysis guardian** — 13 security rules + performance + dead code + type safety + complexity, with incremental scanning.

```
/guard
```

### 13 AST Security Rules

| Rule | Severity |
|---|---|
| `eval()`, `innerHTML=`, exec injection, hardcoded credentials | 🔴 Critical |
| Path traversal, `Object.assign`, `__proto__`, SSRF, open redirect, `Math.random()` | 🟡 Warning |
| Timing attack (non-constant-time password comparison) | 🔵 Info |
| SQL injection, command injection (regex) | 🔴 Critical |

### Additional Checks

- **Performance**: `async forEach/map`, N+1 query patterns
- **Dead code**: AST import resolution (not text search) — detects unused exports
- **Complexity**: Cyclomatic complexity (branches + switch + `&&`/`||` + params > 5), threshold 10
- **Type safety**: Integrates `ts-service.ts` `getDiagnostics()` for real TS errors
- **Test gaps**: Source files without corresponding test files

### Incremental Scanning

```
File change → MD5 hash → Compare with stored hash → Skip if unchanged
                                                    → Rescan if changed
```

- Hashes persisted to `.daoismcode/.guardian-hashes.json` (cross-session)
- `.guardianignore` support (path-boundary matching + glob wildcards)

---

## 🏛️ Multi-Agent Collaboration `/team`

> **5-role SOP pipeline** (MetaGPT-inspired): Architect → Frontend + Backend (parallel) → Tester → Reviewer, with up to 2 iteration rounds.

```
/team 实现一个带JWT认证的用户注册登录系统
```

### Pipeline

```
🏗️ Architect ──▶ Design doc (JSON: components, API contracts, data flow, risks)
      │
      ▼
🎨 Frontend ──┐
              ├──▶ Parallel execution (Promise.allSettled + error isolation)
⚙️ Backend  ──┘
      │
      ▼
🧪 Tester ──▶ Tests (happy path + edge cases + error cases)
      │
      ▼
📋 Reviewer ──▶ VERDICT: APPROVE or REQUEST_CHANGES
                    │                    │
                    │              ┌─────┘
                    ▼              ▼
              ✅ Write files   🔄 Iterate (max 2 rounds)
```

### Features

- **Tech stack auto-detection**: Reads `package.json` → React/Vue/Express/NestJS/Prisma/Tailwind...
- **Context compression**: Chunks > 48K chars are independently summarized by LLM, then merged
- **4-strategy verdict parsing**: VERDICT line → JSON → emoji heuristic → severity count
- **Path traversal protection**: LLM-generated paths validated against project root
- **Conflict detection**: Frontend + Backend writing same path → warning
- **Real-time progress**: TUI shows `[R1] 🏗️ Architect is designing...`

Configurable lifecycle hooks that make the agent work like a senior engineer — automatically formatting, linting, testing, and notifying without manual intervention.

### Events

| Event | Trigger | Can Block |
|---|---|---|
| `PreToolUse` | Before any tool executes | ✅ (exit code 2) |
| `PostToolUse` | After any tool completes | ❌ |
| `PostEdit` | After `edit_file` / `write_file` | ❌ |
| `PreCommit` | Before git auto-commit | ✅ |
| `SessionStart` | On TUI launch | ❌ |
| `OnStop` | After agent turn completes | ❌ |

### Configuration

Create `.daoismcode/hooks.json`:

```json
{
  "PostEdit": [
    {
      "match": ["**/*.ts", "**/*.tsx", "**/*.js"],
      "run": "prettier --write {{file}}",
      "onError": "warn",
      "timeout": 15000
    }
  ],
  "PreCommit": [
    {
      "run": "tsc --noEmit",
      "onError": "block"
    }
  ]
}
```

### Template Variables

| Variable | Expands to | Example |
|---|---|---|
| `{{file}}` | File path being edited | `src/auth.ts` |
| `{{tool}}` | Tool name | `edit_file` |
| `{{ext}}` | File extension | `ts` |
| `{{cwd}}` | Working directory | `/home/user/project` |

---

## 🔗 MCP Integration

DaoismCode supports the **Model Context Protocol (MCP)** — a standardized way to connect external tools and services.

### Configuration

Create `.daoismcode/mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

### Features

- **Auto-reconnect** — MCP servers reconnect after crashes (5 retries, exponential backoff)
- **Streamable HTTP** — Both stdio and HTTP transport supported
- **Resources** — Access external resources through standardized interface
- **Tool exposure** — MCP tools appear as native DaoismCode tools

---

## 🎨 The TUI

A full-screen terminal interface built on a custom ANSI renderer — no Ink, no SolidJS, no native FFI. Pure `process.stdout.write()` with ANSI escape sequences.

```
◈ "The Tao that can be told is not the eternal Tao."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ◇ DaoismGPT
    I'll fix the bug in the auth handler.

  ✎ edit_file auth.ts ✓
  🔌 prettier auth.ts ✓ formatted              ← PostEdit hook
  ✓ verify · no errors

  ┌─ auth.ts ── -3 +5 ──────────────────────────┐
  │+ 42   if (!token) throw new Error('no token')│
  │- 43   return handler(req)                    │
  │+ 43   return verifyToken(token)              │
  └──────────────────────────────────────────────┘

  ⬢ git commit · a1b2c3d · 2 files changed       ← PreCommit passed

  ⛩️Spirit·routing ↑2.1k ↓0.8k · 3% ████░░░░░░  Powered by LUOBIN-PI    DaoismCode v0.1.0
  ┌──────────────────────────────────────────────┐
  │ Message DaoGPT... (type / for commands)      │
  └──────────────────────────────────────────────┘
```

### Features

| Feature | Description |
|---|---|
| **Realm picker** | `/model` → ↑↓ select realm, Enter to confirm |
| **Routing stats** | `/routing` → cost breakdown by realm + recommendations |
| **Syntax-highlighted code blocks** | Rounded border frame, full syntax coloring |
| **Diff preview** | Red/green unified diff with line numbers |
| **Tool cards** | Per-tool icons + colors |
| **Context compression** | `/compact` + auto-compact at 80% context window |
| **Token meter** | Cumulative tokens + context usage bar |
| **Streaming** | Token-by-token with rainbow animation |
| **Auto-verify** | Runs `tsc` / `py_compile` after edits |
| **Git auto-commit** | Stages and commits after successful task |
| **Todo panel** | Task breakdown with status tracking |
| **Session picker** | Browse and restore saved sessions |
| **Permission gate** | `[y]allow [n]deny [a]allow-all [e]deny` |
| **CJK support** | Display-width-aware padding for Chinese/Japanese/Korean |
| **Mouse scroll** | Wheel-scroll through history |

---

## ⚙️ Configuration

DaoismCode is **provider-neutral**. Any OpenAI-compatible endpoint works.

### Provider Presets

| `DAOISM_PROVIDER` | Default Model | Endpoint |
|---|---|---|
| `glm` *(default)* | `glm-5.2` | `open.bigmodel.cn/api/coding/paas/v4` |
| `openai` | `gpt-4o-mini` | `api.openai.com/v1` |
| `deepseek` | `deepseek-chat` | `api.deepseek.com` |
| `ollama` | `qwen2.5-coder` | `localhost:11434/v1` |

### Resolution Priority

```
1. CLI flags              --model, --base-url, --provider
2. Environment variables  DAOISM_API_KEY, DAOISM_PROVIDER, DAOISM_MODEL, ...
3. Project config         .daoismcode/config.json   (gitignored)
4. User config            ~/.daoismcoderc.json
5. Provider preset        defaults from the table above
```

---

## 🏗️ Architecture

```
src/
├── agent/              Core agentic loop — the brain
│   ├── loop.ts           Plan → Execute → Verify → Fix loop
│   ├── context.ts        System prompt, TDD rules, Reflexion injection
│   ├── run.ts            Wires LLM client + retry/backoff + step routing
│   ├── session.ts        Multi-session save/restore (project-keyed)
│   ├── profile.ts        ProjectProfile scanner (~300 token brief)
│   ├── reflexion.ts      Failure memory — learns from mistakes
│   ├── project-memory.ts Long-term project knowledge (auto-init + persistence)
│   ├── git-guard.ts      Git snapshot + diff guard + rollback
│   ├── review.ts         Six-dimension code review (/review)
│   ├── test-gen.ts       Auto test generation (/test) + auto-fix loop
│   └── parallel-detect.ts  Auto-detect parallel task opportunities
│
├── search/             Semantic code search engine
│   ├── chunker.ts        AST-aware code chunking (6 languages)
│   └── embeddings.ts     GLM embedding-3 vector storage + cosine similarity
│
├── router/             Six-engine smart model routing
│   └── index.ts          Scoring + context + tools + LLM + budget + multi-step
│
├── hooks/              Lifecycle hooks system
│   └── index.ts          6 events, glob matching, templates, injection
│
├── tools/              27 tools — single source of truth
│   ├── registry.ts       Tool name → executor mapping
│   ├── schema.ts         OpenAI tool schemas
│   ├── read / write / edit / bash / glob / grep
│   ├── lsp_*.ts           diagnostics / definition / references
│   ├── detect_verify.ts  Auto-detect test/lint/typecheck commands
│   ├── run_verify.ts    Declarative verification (auto-detect + run all)
│   ├── analyze_impact.ts Cross-file dependency impact analysis
│   ├── code_search.ts   Structural code search (10 patterns)
│   ├── search_github.ts GitHub code search (grep.app API)
│   ├── analyze_image.ts Multimodal vision (GLM-4.6V)
│   ├── ask_user.ts      Interactive user selection panel (single+multi)
│   ├── scan_codebase.ts Full codebase security/bug/debt audit
│   ├── update_memory.ts Long-term project memory management
│   ├── parallel_subagents.ts Multi-agent parallel execution
│   ├── semantic_search.ts  Semantic vector search (find_code, GLM embedding-3)
│   ├── web-search / web-fetch
│   ├── todo / subagent
│   └── ...
│
├── tui/                Custom ANSI renderer — zero FFI
│   ├── run.ts            Main TUI: input, streaming, diff, hooks, git, tokens
│   ├── theme.ts          Color palette (OpenCode-derived)
│   └── win32.ts          Windows console mode fix
│
├── llm/                OpenAI-compatible streaming client
├── lsp/                TypeScript LanguageService
├── config/             Provider-neutral config resolution
├── init/               /init system (25+ language project scanner)
├── mcp/                MCP client (stdio + HTTP, auto-reconnect)
├── shell/              Command runner (execa wrapper)
├── fs/                 Path safety (safeResolve) + file reader
└── util/               serialize (AES-256-GCM), diff (LCS), log, datahome
```

---

## Tool Reference

### Read-only (auto-approved)

| Tool | Description |
|---|---|
| `read_file` | Read UTF-8 file with 1-based line numbers. |
| `glob` | Find files by glob pattern. Path escape protection. |
| `grep` | Search file contents by regex. |
| `lsp_diagnostics` | TypeScript/JS diagnostics via tsserver. |
| `lsp_definition` | Go-to-definition via tsserver. |
| `lsp_references` | Find all references via tsserver. |
| `web_search` | DuckDuckGo instant answers. No API key required. |
| `web_fetch` | Fetch URL, strip HTML to text. |
| `detect_verify` | Auto-detect project test/lint/typecheck/build commands. |
| `run_verify` | **Run ALL verification (test+typecheck+lint+compile) in one call. MANDATORY before "done".** |
| `analyze_impact` | **Cross-file impact analysis: find ALL files that import or reference a given file/symbol.** |
| `code_search` | **Structural code search (function/class/import/export/interface/type/async/try-catch/hook/decorator).** |
| `search_github` | **Search real-world code examples from GitHub (via grep.app).** |
| `analyze_image` | **Multimodal vision: analyze screenshots, UI, error images via GLM-4.6V.** |
| `ask_user` | **Interactive selection panel — single or multi-select (arrow keys + Space + Enter).** |
| `scan_codebase` | **Full codebase audit: security risks, bugs, performance, tech debt, missing tests.** |
| `git_archaeology` | **Git code archaeology: blame parsing + hotspot detection + stability analysis + LLM report.** |
| `trace_flow` | **Call graph tracing: AST call graph + cross-file resolution + cycle detection.** |
| `guardian_scan` | **Code guardian: 13 security rules + performance + dead code + type safety + complexity.** |
| `update_memory` | **Update long-term project memory (architecture decisions, conventions, pitfalls).** |
| `find_code` | **Semantic code search — vector embedding (GLM embedding-3) finds code by meaning, not keywords.** |
| `todo_write` | Create/update task list with session-level persistence. |

### Mutating (permission-gated)

| Tool | Description |
|---|---|
| `write_file` | Write/create a file. |
| `edit_file` | Surgical string replacement. Generates diff preview. |
| `bash` | Execute shell command. Destructive patterns blocked. |
| `subagent` | Delegate an isolated sub-task to a fresh agent context. |
| `parallel_subagents` | **Run up to 4 independent sub-tasks in parallel (Promise.all).** |

---

## Security Model

### Permission Gate

All mutating tools require explicit user approval:

```
[y] allow once   [n] deny   [a] allow all   [e] deny
```

### Session Encryption

Sessions are serialized via **AES-256-GCM** with a **machine-bound key** derived from `hostname:username` (scrypt). Files are gzip-compressed before encryption.

```
File layout: [magic 4B] [IV 12B] [authTag 16B] [ciphertext...]
```

### Path Safety

- All file operations are constrained to the project root
- `glob` and `read_file` reject path traversal (`../` escapes)
- `bash` blocks destructive patterns (`rm -rf`, `format`) and guards protected paths

---

## Commands

| Command | Description |
|---|---|
| `/paste` | **Paste clipboard screenshot → auto-analyze via GLM-4.6V** |
| `/sisyphus` | **Toggle Sisyphus mode (500 steps + unlimited fixes + auto-continue)** |
| `/test <file>` | **Auto-generate unit tests + auto-fix + run + verify** |
| `/review` | **Six-dimension code review (bugs/security/perf/style/breaking/tests)** |
| `/scan` | **Full codebase audit (security/bugs/performance/debt/missing tests)** |
| `/why <file:symbol>` | **Git archaeology — blame parsing + hotspot + stability + LLM report** |
| `/flow <function>` | **Call graph tracing — AST call graph + cross-file + cycle detection** |
| `/guard` | **Code guardian — 13 security rules + perf + dead code + type safety** |
| `/team <task>` | **Multi-agent collaboration — Architect→FE+BE→Tester→Reviewer pipeline** |
| `/cost` | **Token usage + cost stats + routing savings** |
| `/index` | **Build semantic search index (GLM embedding-3, AST chunking)** |
| `/search <query>` | **Semantic code search — find by meaning, not keywords** |
| `/model` | Realm picker — ↑↓ select Foundation / Golden Core / Nascent Soul / Spirit (4 realms) |
| `/model 1\|2\|3\|4` | Quick switch to Foundation / Golden Core / Nascent Soul / Spirit |
| `/model auto` | Enable smart routing |
| `/routing` | Routing stats (cost by realm + recommendations) |
| `/compact` | Compress conversation context |
| `/sessions` | List saved sessions |
| `/resume <id>` | Restore a previous session (todo list auto-restores) |
| `/clear` | Clear conversation and start fresh |
| `/stop` | Interrupt the current agent step |
| `/init` | Auto-generate `Daoism.md` from project scanner |
| `/hooks` | Show configured hooks |
| `/mcp` | Show connected MCP servers |
| `/undo` `/redo` | Undo/redo last turn |
| `/help` | Show available commands |
| `/exit` | Quit |

---

## Development

```bash
pnpm install          # Install dependencies
pnpm tui              # Run TUI (Bun) — main interface
pnpm dev              # Readline REPL (Node/tsx) — fallback
pnpm test             # Run vitest suite
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm build            # Bundle readline CLI → dist/daoism.js
pnpm build:exe        # Compile standalone exe → dist/daoism.exe
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun ≥ 1.3 (TUI), Node ≥ 20 (CLI/tests) |
| Language | TypeScript 5.7, strict mode |
| LLM Client | `openai` SDK (provider-neutral) |
| Renderer | Custom ANSI — zero dependencies |
| LSP | TypeScript tsserver (via `typescript` programmatic API) |
| Search | `fast-glob`, regex `grep` |
| Shell | `execa` |
| Logging | `pino` |
| Testing | `vitest` |
| Build | `tsup` (CLI), `bun build --compile` (exe) |

---

## Roadmap

- [x] ~~Smart Model Routing v3 (six engines)~~
- [x] ~~Agentic Loop (Plan-Execute-Verify-Fix)~~
- [x] ~~Multimodal Vision (`/paste` + GLM-4.6V)~~
- [x] ~~Sisyphus Mode (500 steps + unlimited fixes)~~
- [x] ~~Reflexion Memory~~
- [x] ~~TDD Mode~~
- [x] ~~Git-native Safety Net~~
- [x] ~~Multi-dimensional Completion Gate~~
- [x] ~~MCP Protocol Support~~
- [x] ~~Hooks System~~
- [x] ~~Auto Test Generation (`/test`)~~
- [x] ~~Code Review (`/review`)~~
- [x] ~~Cross-File Impact Analysis~~
- [x] ~~Parallel Sub-Agents (auto-detect + parallel execution)~~
- [x] ~~Structural Code Search~~
- [x] ~~GitHub Code Search~~
- [x] ~~Interactive Decision Panel (`ask_user` single + multi-select)~~
- [x] ~~Codebase Scan (`/scan`)~~
- [x] ~~Long-term Project Memory (auto-init + `update_memory`)~~
- [x] ~~Declarative Verification (`run_verify`)~~
- [x] ~~Sisyphus Mode (500 steps + unlimited fixes + auto-continue)~~
- [x] ~~ReAct Reasoning (every 5 steps reflection)~~
- [x] ~~Self-Evaluation (5-dimension gate before "done")~~
- [x] ~~Sub-agent Quality Control~~
- [x] ~~Semantic Code Search (GLM embedding-3, vector similarity)~~
- [ ] Git evolution history ("why was this code written?")
- [ ] Multi-language LSP (Python, Go, Rust)
- [ ] Cost tracking (`/cost` command)

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT © jumpingbirds \<guodaochong@gmail.com\>

---

<div align="center">

**道生一，一生二，二生三，三生万物。**

*The Dao produces one; one produces two; two produces three; three produces all things.*

**Built with ❤️ by [jumpingbirds](https://github.com/jumpingbirds)**

</div>
