# 反思记忆系统

> 双层记忆：Reflexion 记录失败教训，Project Memory 记录项目知识。越用越聪明。

## 架构

```
┌──────────────┐  ┌──────────────────┐
│  Reflexion   │  │  Project Memory  │
│              │  │                  │
│  记录: 失败   │  │  记录: 架构      │
│  容量: 30条   │  │  容量: 无限      │
│  文件:        │  │  文件:           │
│  reflexion.md │  │  project-memory  │
│              │  │  .json           │
└──────┬───────┘  └────────┬─────────┘
       └───────┬───────────┘
               ▼
     自动注入系统提示 (每次对话)
```

## Reflexion — 失败学习

每次测试失败，Agent 自动记录：

```
[2026-07-02] TypeError: Cannot read undefined
  → 原因: 异步函数未 await
  → 修复: 添加 await 关键字
  → 教训: 所有 async 函数返回值必须 await
```

下次任务启动时，历史教训自动注入系统提示：

```
## 历史教训 — 请勿重复
1. async函数返回值必须await
2. TypeScript strict模式下null检查必须显式
```

最多累积 30 条，超出后自动淘汰最旧的。

## Project Memory — 项目知识

首次运行时自动扫描项目并初始化：

```json
{
  "projectName": "my-app",
  "language": "TypeScript",
  "framework": "Next.js 14",
  "buildCommand": "pnpm build",
  "testCommand": "pnpm test",
  "architecture": {
    "src/app/": "App Router pages",
    "src/components/": "React components"
  },
  "conventions": ["Use named exports only"],
  "pitfalls": ["Don't import from src/app in src/lib"]
}
```

通过 `update_memory` 工具随时更新。

## 两者互补

| | Reflexion | Project Memory |
|---|---|---|
| **记录什么** | 怎么失败了（战术） | 项目是什么样的（战略） |
| **防止什么** | 重复犯错 | 缺乏项目上下文 |
| **更新方式** | 自动（失败时） | 手动 + 自动（首次扫描） |
| **容量** | 30 条 | 无限 |
