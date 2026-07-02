# 🏛️ Multi-Agent Collaboration `/team`

> **多智能体协作** — 架构师 → 前端 + 后端 → 测试 → 审查，全自动 SOP 流水线。

## 问题

复杂功能需要多个专业角色配合：架构设计、前端实现、后端实现、测试编写、代码审查。人工协调耗时且容易遗漏。

## 解决方案

`/team` 命令启动 5 角色协作流水线：

```
/team 实现一个带JWT认证的用户注册登录系统
/team build a REST API with CRUD for blog posts
/team 添加实时通知功能（WebSocket + Redis）
```

### SOP 流水线（MetaGPT 启发）

```
┌─────────────┐
│  🏗️ Architect │ ──▶ 设计文档（JSON 结构化）
└──────┬───────┘
       │ 设计文档 + 技术栈
       ▼
┌──────┴───────┐
│  并行执行      │
│  ┌──────────┐ │
│  │🎨 Frontend│ │ ──▶ 前端代码
│  └──────────┘ │
│  ┌──────────┐ │
│  │⚙️ Backend │ │ ──▶ 后端代码
│  └──────────┘ │
└──────┬───────┘
       │ 前端 + 后端代码
       ▼
┌─────────────┐
│  🧪 Tester   │ ──▶ 测试代码
└──────┬──────┘
       │ 前端 + 后端 + 测试
       ▼
┌─────────────┐
│  📋 Reviewer │ ──▶ 审查报告 + 裁决
└──────┬──────┘
       │
       ├─ APPROVE ──▶ ✅ 写入文件，完成
       │
       └─ REQUEST_CHANGES ──▶ 🔄 回到实现阶段（最多 2 轮）
```

### 技术栈自动检测

启动时自动读取 `package.json`（或 `go.mod` / `Cargo.toml` / `requirements.txt`），识别：

| 检测项 | 示例 |
|---|---|
| 前端框架 | React, Vue, Svelte, Next.js |
| 后端框架 | Express, Fastify, Koa, NestJS |
| 测试框架 | Vitest, Jest, Mocha |
| ORM | Prisma, TypeORM |
| 样式 | Tailwind |
| 语言 | TypeScript |

检测到的技术栈会注入每个角色的 system prompt，确保生成的代码与项目一致。

### 上下文压缩

当实现代码很长（超过 15K 字符）时，自动调用 LLM 分块压缩：
- 每 48K 字符为一块
- 每块独立摘要（保留文件路径、函数签名、API 契约）
- 摘要合并后传给下游角色

### 设计文档解析

架构师的 JSON 输出会被解析为结构化文档：

```json
{
  "summary": "JWT 认证系统",
  "components": [
    { "name": "AuthService", "files": ["src/auth/service.ts"] }
  ],
  "apiContracts": [
    { "endpoint": "POST /api/login", "input": "credentials", "output": "JWT" }
  ],
  "dataFlow": ["request → validate → authenticate → sign JWT → response"],
  "risks": ["Token 刷新竞态"],
  "testStrategy": "Mock 数据库，测试 happy path + 错误路径"
}
```

### 裁决解析（4 策略）

| 策略 | 检查位置 | 方法 |
|---|---|---|
| 1. 显式 VERDICT | 前 5 行 | `VERDICT: APPROVE` 或 `VERDICT: REQUEST_CHANGES` |
| 2. JSON 结构化 | 全文 | `"verdict": "approve"` |
| 3. Emoji 启发式 | 最后 3 行 | `✅` 无 `❌` = approve |
| 4. 严重度计数 | 全文 | critical 数 > pass 数 = changes |

### 文件写入

| 行为 | 说明 |
|---|---|
| ✅ 创建 | 新文件 |
| ✏️ 覆盖 | 内容变化时覆盖已有文件 |
| ⏭️ 跳过 | 内容完全相同 |
| ⚠️ 冲突 | 前端和后端写入同一路径（后写覆盖） |
| 🚫 拦截 | 路径穿越防护（`../../../` 被阻止） |

### 实时进度

TUI 显示每个阶段的实时状态：

```
🛠️ team-architect    [R1] 🏗️ Architect is designing (stack: React, Express, TypeScript)...
```

### 错误隔离

前端和后端使用 `Promise.allSettled` 并行执行：
- 一侧失败不影响另一侧
- 两侧都失败则终止流水线
- 失败的 agent 代码置空（不会把错误信息当代码传给下游）

## 输出示例

```
🏛️ Multi-Agent Collaboration Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Pipeline: Architect → Frontend + Backend (parallel) → Tester → Reviewer
🔄 Iterations: 2 (approved)
📁 Created: 5 · ✏️ Overwritten: 2

📋 Stage Log:
  [R0] 🏗️ Architect is designing (stack: React, Express, TypeScript)...
  [R1] Round 1: Frontend + Backend implementing in parallel...
  [R1] Round 1: Tester is writing tests...
  [R1] Round 1: Reviewer is evaluating...
  [R1] ❌ Reviewer requested changes. Will iterate...
  [R2] Round 2: Frontend + Backend implementing in parallel...
  [R2] Round 2: Tester is writing tests...
  [R2] Round 2: Reviewer is evaluating...
  [R2] ✅ Reviewer APPROVED on round 2!

📋 Review Report:
VERDICT: APPROVE

All components implemented correctly...
```
