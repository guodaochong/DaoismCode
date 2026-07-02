# 🌊 Code Flow Tracing `/flow`

> **调用链追踪** — 从一个函数出发，自动绘制完整的调用图谱。

## 问题

你想理解一个函数的完整执行路径：

```typescript
async function handleLogin(req: Request) {
  const user = await authenticate(req.body);     // → 数据库查询
  const token = generateToken(user);              // → JWT 签名
  logActivity(user.id, 'login');                  // → 日志系统
  return { token, user };
}
```

手动追踪 `authenticate` → `db.query` → `crypto.compare`... 既耗时又容易遗漏跨文件调用。

## 解决方案

`/flow` 命令自动构建调用图：

```
/flow handleLogin
/flow user registration flow
```

### 引擎

| 文件类型 | 引擎 | 精度 |
|---|---|---|
| TypeScript / JavaScript | **TypeScript Compiler API (AST)** | 精确 |
| Python / Go / Rust | 正则 + 缩进/花括号分析 | 近似 |
| 混合项目 | AST + 正则混合 | 混合 |

### 工作流程

```
1. 扫描所有源文件，建立函数索引
2. 定位入口函数（精确名匹配 → 模糊搜索 → LLM 猜测）
3. BFS 广度优先遍历（maxDepth = 5）：
   ├─ AST 提取函数体内所有调用
   ├─ TypeChecker 跨文件解析定义
   ├─ LLM 批量解析动态分发（仅 depth < 3）
   └─ 循环检测（visited Set）
4. 渲染树形调用图
```

### 输出示例

```
📍 Call Flow: handleLogin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔬 TypeScript Compiler API (AST)
✓ verified: 4  ~ approximate: 1  ? inferred: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Legend: [✓]=AST-resolved  [~]=name-matched  [?]=LLM-inferred
└─ [✓] ⏩handleLogin() {1 arg(s)} [src/auth/login.ts:12]
   ├─ [✓] authenticate() {1 arg(s)} [src/auth/service.ts:45]
   │  ├─ [✓] db.query() {2 arg(s)} [src/db/client.ts:89]
   │  └─ [✓] crypto.compare() {2 arg(s)} [node:crypto]
   ├─ [✓] generateToken() {1 arg(s)} [src/auth/jwt.ts:8]
   ├─ [~] logActivity() [src/utils/log.ts:23]
   └─ [✓] sendResponse() {1 arg(s)} [src/utils/http.ts:15]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 7 functions · depth 5 · 6 unique
```

### 置信度标签

| 标签 | 含义 | 来源 |
|---|---|---|
| `[✓]` | AST 验证 | TypeScript TypeChecker 确认了定义位置 |
| `[~]` | 名称匹配 | 函数名在索引中找到，但无法确认定义 |
| `[?]` | LLM 推断 | 动态分发，LLM 根据上下文推测目标 |

### 特殊标记

| 标记 | 含义 |
|---|---|
| `⏩` | 异步函数（async） |
| `×N` | 在父函数中被调用 N 次 |
| `{N arg(s)}` | 调用时传递了 N 个参数 |
| `(cycle)` | 循环引用检测 |

## AST 检测的调用类型

| 调用类型 | 示例 | 检测方式 |
|---|---|---|
| 直接调用 | `foo()` | `CallExpression` + `Identifier` |
| 方法调用 | `obj.method()` | `PropertyAccessExpression` |
| 动态索引 | `obj[key]()` | `ElementAccessExpression` |
| 构造函数 | `new Class()` | `NewExpression` |
| 标签模板 | `sql\`SELECT...\`` | `TaggedTemplateExpression` |

## 技术细节

- **TypeChecker 跨文件解析**：通过 `checker.getSymbolAtLocation()` 追踪到定义所在的文件和行号
- **LLM 动态分发解析**：对 `inferred` 级别的调用，批量（10个/批）发送给 LLM 解析目标函数
- **循环检测**：使用 `name@file` 作为唯一标识，遇到已访问节点标记 `(cycle)`
- **深度限制**：BFS 最大深度 5 层，LLM 解析仅在前 3 层触发
- **多语言 fallback**：Python 用缩进分析函数体，Go/Rust 用花括号深度
