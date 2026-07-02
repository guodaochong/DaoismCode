# 语义代码搜索

> 按代码"含义"搜索，不是关键词。AST 分块 + 向量嵌入 + 余弦相似度。

## 问题

```
你问: "认证功能是怎么实现的？"

grep "auth"      → 找到 47 个文件 (auth.ts, oauth.ts, author.ts...)
                  → Agent 淹没在误报中，浪费 8 步

find_code("认证功能实现")  → 找到 3 个文件 (auth.ts, middleware.ts, token.ts)
                           → Agent 2 步读到正确的文件
```

## 技术方案

### 第一步：AST 感知分块

按语法结构切割，不是按行：

```
auth.ts (200行)
    ↓
┌─────────────────────────────────────┐
│ Block 1: verifyToken()     [行 1-25] │
│ Block 2: generateToken()   [行 26-50]│
│ Block 3: class AuthManager [行 51-180]│
│ Block 4: refreshToken()    [行181-200]│
└─────────────────────────────────────┘
```

支持 6 种语言：TypeScript/JavaScript、Python、Java、Go、Rust、其他（行级+重叠）。

### 第二步：向量嵌入

每个代码块通过嵌入模型生成向量表征。维度自适应（512/768/1536 均可）。

### 第三步：余弦相似度检索

```
查询: "认证功能实现" → 向量
                    ↓ 余弦相似度
  1. verifyToken      0.94 ← 最相关
  2. AuthManager       0.89
  3. generateToken     0.82
```

## 增量索引

基于文件 mtime 的增量更新，O(n) 批量 IO：

```
首次 /index:  扫描 200 文件 → 分块 → 嵌入 → 保存
后续使用:     检查 mtime → 3 个文件变了 → 只更新这 3 个
```

## Agent 自动使用

连续 3 次 grep/glob 后自动注入提示：

> `[提示] 你已使用 grep/glob 3 次。试试 find_code 进行语义搜索。`

## 命令

```bash
/index                # 构建语义索引
/index --force        # 强制全量重建
/search "查询内容"     # 手动语义搜索
```

Agent 在探索代码库时自动调用 `find_code` 工具。
