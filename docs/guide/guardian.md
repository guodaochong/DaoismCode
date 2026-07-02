# 🛡️ Background Code Guardian `/guard`

> **后台代码守护者** — 实时静态分析，13 条安全规则 + 性能检测 + 死代码发现 + 类型安全 + 增量扫描。

## 问题

代码审查通常发生在 PR 阶段 — 太晚了。安全漏洞、性能陷阱、死代码应该在**写代码的那一刻**就被发现。

## 解决方案

`/guard` 命令一键扫描整个代码库，也可以启动后台文件监听器实时守护。

```
/guard              # 全量扫描
```

### 检测维度

| 维度 | Emoji | 严重级别 |
|---|---|---|
| 🔒 安全漏洞 | 🔴 critical / 🟡 warning | eval, XSS, 注入, 凭证, 原型污染... |
| ⚡ 性能问题 | 🟡 warning / 🔵 info | async forEach, N+1 查询 |
| 💀 死代码 | 🔵 info | 未使用的导出, console.log, TODO |
| 🧠 复杂度 | 🔵 info | 圈复杂度 > 10 |
| 🧪 测试覆盖 | 🔵 info | 缺少测试文件的源文件 |
| 📝 类型安全 | 🔴/🟡 | TS 编译错误和警告 |

### 13 条 AST 安全规则

| 规则 | 严重级别 | 说明 |
|---|---|---|
| `eval()` | 🔴 critical | 任意代码执行风险 |
| `innerHTML =` | 🔴 critical | XSS 注入风险 |
| `exec()` 模板字符串 | 🔴 critical | 命令注入风险 |
| 凭证硬编码 | 🔴 critical | `password = "secret123"` |
| 路径穿越 | 🟡 warning | `fs.readFile(\`../${userInput}\`)` |
| `Object.assign` | 🟡 warning | 原型污染风险 |
| `__proto__` / `constructor` | 🔴 critical | 原型链访问 |
| 动态 `fetch()` | 🟡 warning | SSRF 风险 |
| 动态 `redirect()` | 🟡 warning | 开放重定向风险 |
| `Math.random()` | 🟡 warning | 非密码学安全随机数 |
| 时序攻击 | 🔵 info | 密码明文比较 `==` |
| SQL 注入（正则） | 🔴 critical | `SELECT ... ${var}` |
| 命令注入（正则） | 🔴 critical | `exec(\`... ${var}\`)` |

### 性能规则

| 规则 | 说明 |
|---|---|
| `async forEach/map` | 应使用 `for...of` + `await` |
| N+1 查询 | 循环内嵌套数组方法调用 |

### 死代码检测

使用 AST import 解析（非文本搜索）：
- 扫描所有 `import` 声明（NamedImports、NamespaceImport、默认导入）
- 扫描 re-export（`export ... from`）
- 与导出列表交叉比对
- 未出现在任何 import 中的导出 = 死代码

### 类型安全检测

集成 TypeScript LanguageService：
- 调用 `getSyntacticDiagnostics()` + `getSemanticDiagnostics()`
- 获取真实的 TS 编译错误和警告
- 结果上限 50 条（避免刷屏）

### 增量扫描

```
文件变更 ──▶ MD5 哈希 ──▶ 与上次比对 ──▶ 未变则跳过
                                    └─▶ 变化则重新扫描
                                         └─▶ 持久化到 .daoismcode/.guardian-hashes.json
```

- 哈希存储在 `.daoismcode/.guardian-hashes.json`，跨会话持久化
- 每个 `cwd` 独立加载，不会串项目
- 只扫描内容变化的文件

### .guardianignore

在项目根目录创建 `.guardianignore`，支持：

```gitignore
# 精确文件
src/generated.ts

# 目录前缀（匹配该目录下所有文件）
test/**

# glob 通配符
*.spec.ts
```

### 输出示例

```
🛡️ Guardian Report
═══════════════════════════════════════════════════
📊 Total: 8 findings · 🔴 2 critical · 🟡 3 warning · 🔵 3 info

🔒 Security:
  🔴 src/auth.ts:23 — eval() — arbitrary code execution risk
  🔴 src/config.ts:5 — Hardcoded credential in variable "apiKey"
  🟡 src/api.ts:67 — Path traversal risk: dynamic path in fs operation
  🟡 src/utils.ts:12 — Object.assign — potential prototype pollution
  🟡 src/ssr.ts:34 — SSRF risk: dynamic URL in fetch()

⚡ Performance:
  🟡 src/data.ts:89 — async forEach() — use for...of with await instead

💀 Dead Code:
  🔵 src/legacy.ts:1 — Exported "oldHelper" is not imported by any other file
  🔵 src/debug.ts:15 — Debug logging left in code

🧠 Complexity:
  🔵 src/parser.ts:45 — High cyclomatic complexity (14)
```

### 正则 Fallback

对于 Python / Go / Rust 文件，使用正则规则覆盖：
- 凭证检测
- SQL 注入
- 命令注入
- 路径穿越
- console.log / TODO / FIXME
