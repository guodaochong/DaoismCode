# 智能符号跳转 /jump

> 用自然语言找到任何函数、类或方法——无需记住文件路径。

## 使用方式

```
/jump authentication handler
→ ƒ src/auth/middleware.ts:42  verifyToken(req, res, next)
→ ƒ src/auth/handler.ts:18    handleLogin(req, res)
→ m src/api/routes.ts:67      router.post('/login', handleLogin)

🎯 Smart jump: "authentication handler" (3 matches)
```

## 工作原理

1. 使用 TypeScript Compiler API 解析项目中所有 TS/JS 文件的 AST
2. 提取所有函数、类、方法、接口、箭头函数
3. 按关键词匹配评分：名称完全匹配 +10，名称包含 +3，签名包含 +1
4. 按分数排序，返回前 15 个结果

## 符号类型

| 图标 | 类型 | 示例 |
|---|---|---|
| `ƒ` | 函数 | `function handleAuth() {}` |
| `C` | 类 | `class AuthService {}` |
| `m` | 方法 | `authService.login()` |
| `I` | 接口 | `interface User {}` |
| `→` | 箭头函数 | `const handler = () => {}` |

## 与其他搜索的区别

| 方式 | 速度 | 精度 | 需要网络 |
|---|---|---|---|
| `/jump` (AST) | ⚡ 极快 | 高（理解代码结构） | 否 |
| `find_code` (语义) | 中等 | 最高（理解语义） | 是（embedding API） |
| `grep` (正则) | 快 | 低（纯文本匹配） | 否 |

`/jump` 是日常导航的最佳选择——比语义搜索快（无 embedding 往返），比 grep 精确（理解代码结构）。
