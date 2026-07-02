# DaoismCode — AI Coding 智能体设计规格

- **状态**：待用户审阅（Draft，待批准）
- **日期**：2026-06-25
- **作者**：jumpingbirds <guodaochong@gmail.com>
- **项目根**：`D:\jumpingbirds\DaoismCode-AI`（greenfield，当前为空目录）

---

## 1. 概述

DaoismCode 是一个运行于终端的 **CLI/TUI 编码智能体**，对标 Claude Code 的核心体验：在一个会话式循环里，让大模型通过**工具调用**自主地读改文件、搜索代码、执行命令，从而完成编码任务。

- **形态**：终端 CLI/REPL（非 IDE 插件、非 Web）
- **语言/运行时**：TypeScript + Node.js（≥ 20）
- **LLM 后端**：智谱 **GLM 系列**，通过用户已有的 **GLM Coding Plan 套餐**接入（OpenAI 兼容端点）
- **名称寓意**：无特殊含义，通用 AI Coding 工具

### 1.1 MVP 目标（第一阶段）
跑通**最小可用 agent 循环**：用户在终端输入编码需求 → GLM 流式回复 + 自主调用工具（读/写/编辑/搜索/执行命令）→ 经权限确认后落地 → 循环直至完成。

### 1.2 非目标（v1 明确不做，留待后期）
LSP 集成、todos、子 agent（subagent）、MCP、会话恢复/持久化、多 provider、补丁(patch)格式、Web/TUI 富前端、插件系统。

---

## 2. 技术栈与工程基线

| 领域 | 选型 | 理由 |
|---|---|---|
| 运行时 | Node.js ≥ 20 | 跨平台、与 Claude Code 同生态 |
| 语言 | TypeScript（`strict: true`） | 类型安全，禁止 `as any` / `@ts-ignore` |
| 包管理 | **pnpm** | 快、省盘、确定性安装 |
| 构建 | **tsup**（esbuild） | 打单文件 CLI，快 |
| CLI 入口 | `commander` | 成熟、带类型 |
| REPL | Node `readline` + 流式打印 | 零重依赖起步 |
| 终端美化 | `chalk`、`ora`、`marked-terminal` | 彩色、spinner、Markdown 渲染 |
| LLM 客户端 | `openai` npm SDK → 指向 GLM 端点 | OpenAI 兼容，支持 function calling 与流式 |
| 命令执行 | `execa` | Promise 化、超时、参数转义可控 |
| 日志 | `pino` → `.daoismcode/logs/` | 结构化、低开销 |
| 校验/质量 | ESLint + Prettier | 统一风格 |
| 测试 | Vitest（MVP 仅给骨架用例） | 快、与 TS 原生集成 |

### 2.1 代码规范约束
- **全部源码必须含详细英文注释**（文件头、函数/类型、复杂逻辑均需注释）。
- 每个源文件头标注：`@author jumpingbirds <guodaochong@gmail.com>`。
- **禁止** `as any`、`@ts-ignore`、`@ts-expect-error`、空 catch。

---

## 3. 架构总览（分层）

```
┌─────────────────────────────────────────────┐
│  CLI 层 (src/cli)                            │
│  commander 入口 → REPL → 渲染 → 权限确认      │
├─────────────────────────────────────────────┤
│  Agent 层 (src/agent)                        │
│  核心循环 loop.ts：LLM <-> Tools 编排         │
│  context.ts：系统提示词 + 消息装配            │
├─────────────────────────────────────────────┤
│  LLM 层 (src/llm)                            │
│  client/stream/config：GLM OpenAI 兼容封装    │
├─────────────────────────────────────────────┤
│  Tools 层 (src/tools)                        │
│  registry + 6 个工具实现 + JSON Schema        │
├─────────────────────────────────────────────┤
│  基础设施 (src/fs, src/shell, src/config, util)│
│  路径安全 / 执行器 / 配置 / diff / 日志        │
└─────────────────────────────────────────────┘
```

### 3.1 目录结构

```
daoismcode-ai/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── README.md
├── src/
│   ├── index.ts                 # CLI 入口（commander: daoism [repl|run "<prompt>"]）
│   ├── cli/
│   │   ├── repl.ts              # 交互式 REPL 主循环
│   │   ├── input.ts             # 输入处理（含多行、退出指令）
│   │   ├── render.ts            # 流式 token 打印 + Markdown 渲染
│   │   └── permission.ts        # y/n/all/edit 确认提示
│   ├── agent/
│   │   ├── loop.ts              # 核心 agent 循环
│   │   ├── context.ts           # 系统提示词 + 会话消息装配
│   │   └── types.ts             # Tool / Message / AgentResult 类型
│   ├── llm/
│   │   ├── client.ts            # OpenAI 兼容客户端构造
│   │   ├── stream.ts            # chat.completions 流式封装（聚合 tool_calls）
│   │   └── config.ts            # model / baseURL / key 解析
│   ├── tools/
│   │   ├── registry.ts          # 工具注册 + 分发 + 权限声明
│   │   ├── schema.ts            # 各工具参数 JSON Schema
│   │   ├── read.ts              # read_file
│   │   ├── write.ts             # write_file
│   │   ├── edit.ts              # edit_file（精确字符串替换）
│   │   ├── glob.ts              # glob（按名找文件）
│   │   ├── grep.ts              # grep（内容搜索）
│   │   └── bash.ts              # bash（执行 shell 命令）
│   ├── fs/
│   │   ├── paths.ts             # 路径安全（锁定项目根、拒 ..）
│   │   └── reader.ts            # 带行号读取、截断
│   ├── shell/
│   │   └── runner.ts            # execa 封装：超时、cwd、stdout/stderr/exit
│   ├── config/
│   │   └── index.ts             # env + rc 文件合并
│   └── util/
│       ├── log.ts               # pino logger
│       └── diff.ts              # 为 edit 生成彩色 unified diff
└── docs/superpowers/specs/2026-06-25-daoismcode-design.md  # 本文档
```

---

## 4. 核心 Agent 循环（系统心脏）

### 4.1 循环算法
```
agentLoop(userInput):
  messages = [systemPrompt, ...history, {role:user, content:userInput}]
  tools    = registry.schemas()
  for step in 1..MAX_STEPS (默认 25):                 # 步数预算，防死循环
    resp = llm.streamChat({ model, messages, tools }) # GLM 原生 function calling
    流式打印 assistant 文本 token；缓冲聚合 tool_calls
    messages.push(assistantMessage)
    if 无 tool_calls: return FINAL_TEXT               # 纯文本 = 最终回答，结束
    for tc in tool_calls:
       result = executeTool(tc, permissionGate)       # 经权限门
       messages.push({ role:"tool", tool_call_id:tc.id, content:result })
    # 继续下一轮，把工具结果回喂给模型
  return STEP_BUDGET_EXHAUSTED                         # 安全退出
```

### 4.2 关键设计点
- **多 tool_call 批处理**：GLM 单轮可返回多个 `tool_calls`，全部执行后一次性回喂，再进下一轮。
- **错误即结果**：工具执行失败时，错误信息作为 `tool` 消息内容回传（**不抛异常打断循环**），让模型自行纠正。
- **双重预算**：步数上限（25）+ 单轮 Token 上限，防止失控。
- **流式聚合**：流式 `delta` 中 `tool_calls` 分片到达，需按 `index` 聚合成完整调用后再执行。
- **终止条件**：模型本轮只产文本、不调工具 ⇒ 视为完成。
- **LLM API 错误处理**：与工具错误不同，LLM 调用层的错误（鉴权失败 401、限流 429、网络超时）**不回喂给模型**，而是：可重试错误（429/网络）按指数退避重试 ≤3 次；不可重试错误（401/400）向用户报错并终止本轮循环，保留会话以便用户修正后继续。

---

## 5. 工具集（MVP 共 6 个）

每个工具：`name` + JSON Schema 参数 + `execute()` + `requiresPermission`。

| 工具 | 入参 | 需确认 | 行为 |
|---|---|---|---|
| `read_file` | `path`, `offset?`, `limit?` | 否 | 返回带行号内容；超长截断 |
| `glob` | `pattern`, `path?` | 否 | 按模式返回匹配文件路径列表 |
| `grep` | `pattern`, `include?`, `path?`, `output_mode?(content\|files\|count)` | 否 | 正则内容搜索 |
| `write_file` | `path`, `content` | **是** | 创建/覆盖文件（自动建父目录） |
| `edit_file` | `path`, `oldString`, `newString`, `replaceAll?` | **是** | 精确替换；`oldString` 未找到或多次命中(未设 replaceAll) ⇒ 拒绝并报错；确认前展示彩色 diff |
| `bash` | `command`, `workdir?`, `timeout?` | **是** | 执行 shell，返回 `stdout/stderr/exitCode`；默认超时 120s |

### 5.1 路径安全
- 所有文件工具锁定**项目根目录**；规范化后若包含 `..` 越界或落在根外 ⇒ 拒绝。
- 项目根 = CLI 启动时的 `process.cwd()`（可用 `--cwd` 覆盖）。

---

## 6. 权限模型

- 工具声明 `requiresPermission: boolean`。
- **只读**（read/glob/grep）：自动执行。
- **写/命令**（write/edit/bash）：执行前弹交互确认：
  - `[y]es` 允许一次 / `[n]o` 拒绝 / `[a]ll` 本会话全放行（仅内存） / `[e]dit` 拒绝并提示用户改
- `bash` 执行前**完整打印命令**。
- `--dangerously-skip-permissions`（默认关）或配置可切全自动模式。
- 会话级白名单仅存内存，**不落盘**。

---

## 7. 配置与 GLM 接入

### 7.1 配置来源（优先级由高到低）
1. CLI flag（`--model`、`--base-url`、`--cwd` 等）
2. 进程环境变量
3. 项目 `.daoismcode/config.json`
4. 用户 `~/.daoismcoderc.json`
5. 内置默认

### 7.2 关键配置项
| 项 | 环境变量 | 默认 |
|---|---|---|
| API Key | `DAOISM_API_KEY` | 无（必填） |
| Provider | `DAOISM_PROVIDER` | `glm`（可选 glm/openai/deepseek/ollama；见 7.3） |
| Base URL | `DAOISM_BASE_URL` | 由 provider 预设决定（glm→`https://open.bigmodel.cn/api/coding/paas/v4`）；显式覆盖优先 |
| Model | `DAOISM_MODEL` | 由 provider 预设决定（glm→`glm-5.2`）；显式覆盖优先 |
| 最大步数 | `DAOISM_MAX_STEPS` | `25` |
| 跳过权限 | `DAOISM_SKIP_PERMISSIONS` | `false` |

### 7.3 GLM Coding Plan 融合说明（API 事实已核实，来源 docs.bigmodel.cn / docs.z.ai）
- **端点（已核实）**：Coding Plan 走**专用端点** `https://open.bigmodel.cn/api/coding/paas/v4`（CN）/ `https://api.z.ai/api/coding/paas/v4`（国际）。⚠️ **Coding Plan 的 Key 只能用于 coding 端点**，打到标准端点 `.../api/paas/v4/` 会返回 401——故 §7.2 默认 Base URL 设为 coding 端点。
- **鉴权（已核实）**：`Authorization: Bearer <API_KEY>`，OpenAI 兼容。
- **函数调用（已核实）**：原生支持 OpenAI 风格 `tools` + `tool_choice`，响应含 `tool_calls`；流式 `delta` 按 `index` 分片聚合（与 OpenAI 一致），§4.2 的流式聚合逻辑可直接套用。
- **模型 ID（待探测）**：候选 `glm-4.6` / `glm-4.5` 等；套餐内确切可用别名实现时用用户 Key 做一次最小探测调用确认后写入默认。

### 7.4 首次运行
- 无 API Key ⇒ 打印获取指引（bigmodel.cn 控制台）并以非零码退出。

---

## 8. 系统提示词（精简版，落入 `agent/context.ts`）

> 你是 DaoismCode，一个 agentic 编码助手。规则：
> 1. 修改代码前，先用 `read_file` / `grep` / `glob` 探索相关文件。
> 2. 修改**已存在**文件优先用 `edit_file`，而非整体 `write_file`。
> 3. 不得编造文件内容；不确定就先读。
> 4. 所有文件操作限定在项目根目录内。
> 5. 用 `bash` 执行测试/构建以验证结果。
> 6. 完成后用简短文字总结改动。
> 7. 需求不清时，先向用户提问。

---

## 9. CLI 命令面

```
daoism                      # 启动交互式 REPL（默认）
daoism run "<prompt>"       # 单次执行：跑一轮 agent 后退出（便于脚本化）
daoism --model <id>         # 覆盖模型
daoism --cwd <path>         # 指定项目根
daoism --dangerously-skip-permissions
daoism config               # 查看/初始化配置
daoism --version | --help
```

- 二进制名：**`daoism`**（通过 package.json `bin` 字段 + `pnpm link` 本地启用；发布 npm 后支持 `npx daoism`，属后期）。

---

## 10. MVP 成功标准（Definition of Done）

1. `pnpm dev`（或 `daoism`）能启动交互式 REPL，GLM 回复**流式**打印。
2. 给定任务「找到做 X 的文件并修 bug」，agent 能 `grep → read_file → edit_file(经确认) → 完成`。
3. 能用 `bash` 执行测试命令并读取结果。
4. GLM 函数调用循环**正确终止**（纯文本结束 / 步数预算兜底）。
5. 所有写操作与命令执行**均经权限确认门**。
6. `pnpm build` 产出可用 CLI；`pnpm lint`、`pnpm typecheck` 通过。

---

## 11. 约束记录
- 代码全部**详细英文注释**。
- 作者署名：`jumpingbirds <guodaochong@gmail.com>`。
- 类型安全：禁 `as any` / `@ts-ignore`。

## 12. 待确认 / 风险（Open Items）
| 项 | 说明 | 处置 |
|---|---|---|
| ~~端点/Base URL~~（已解决） | Coding Plan 用专用 coding 端点，标准端点会 401 | ✅ 已核实并写入默认（§7.2/7.3） |
| 套餐内确切模型 ID | 需用 Key 探测 | 实现阶段探测后写入默认 |
| GLM 工具调用稳定性 | 偶发格式异常 | 预留 ReAct 降级接口（v1 不实现） |
| Windows shell 差异 | `execa` 在 Win 下的行为 | MVP 以 Win 为主，跨平台尽力 |
| 会话历史 Token 增长 | 长任务历史可能超出模型上下文窗 | v1 不做自动裁剪；靠步数预算(25)与单轮 Token 上限约束；超出时由模型/API 报错，提示用户开新会话（裁剪留后期） |

## 13. 范围外（v1 不做）
LSP、todos、子 agent、MCP、会话持久化、补丁格式、Web/TUI 富前端、插件系统、自动更新。（多 provider 已纳入 v1，见下方 Amendment A3）

---

## Amendments (2026-06-25) — AUTHORITATIVE

**A1 — Provider-neutral LLM 层（不写死 GLM）。** LLM 层 provider 无关：`openai` SDK 打任意 OpenAI 兼容端点。`src/config/index.ts` 内 `PROVIDERS` 预设表按 `DAOISM_PROVIDER`（默认 `glm`）选默认 baseUrl+model；显式 `DAOISM_BASE_URL`/`DAOISM_MODEL`/`DAOISM_API_KEY` 永远覆盖预设。`src/llm/client.ts` 含零 GLM 专属代码。

**A2 — 默认模型 = `glm-5.2`**（Coding Plan 模型）。glm 预设即 `{baseUrl: coding 端点, model: 'glm-5.2'}`。

**A3 — 多 provider 支持纳入 v1 范围**（取代原 §13 的"范围外"）。非 OpenAI 兼容的原生 provider（Anthropic/Google 原生 SDK）仍属后期（需适配器）；OpenAI 兼容抽象已覆盖 GLM/OpenAI/DeepSeek/Moonshot/本地 Ollama 与 vLLM。

**A4 — TUI 引擎迁移 Ink → @opentui/solid + Bun；品牌重命名**（后期，权威）。
- UI 层从 Ink(React)整体迁移到 **`@opentui/solid`**（OpenCode 同款渲染引擎，SolidJS）。原 Ink 组件与 `react`/`ink-*` 依赖已移除。
- `@opentui` 原生渲染器需 **Bun**（Node 无法加载其 FFI），故 TUI 经 `bun src/tui/run.tsx` 运行（`pnpm tui`）。原 readline REPL（`pnpm dev` / `daoism` 二进制）作为 Node 端 fallback 保留。
- TUI 特性：全屏接管控制台、纯色 `#0a0a0a` 底、OpenCode 配色、渐变 ASCII logo（`DAOISM`/`CODE` 双色）、Markdown + 语法高亮、工具卡片、In-TUI 权限确认（y/n/a/e）。
- **品牌重命名（仅展示，底层 API 不变）**：`glm` provider 在 UI 显示为 **DaoGPT**、`glm-5.2` 显示为 **DGPT5.3**（见 `src/tui/theme.ts` 的 `displayName` 映射）。
- 致谢行：**Powered by LUOBIN-PI**。
- 左上角英文 ASCII 标语 `ALL THINGS ARISE`（原道家句"是生万象"英译；CJK 无法用 ascii_font，故取英文）。
- §13 中"Web/TUI 富前端"一项现实质完成（TUI 已落地）；其余范围外项不变。
