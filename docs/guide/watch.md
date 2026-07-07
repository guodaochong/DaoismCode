# Auto-Fix on Save `/watch`

> 保存即修复——真正的 24/7 结对编程搭档。

`/watch` 是 DaoismCode 独有的实时文件监控功能。你保存文件，它自动检测错误、修复、提交。Cursor 做内联补全，Copilot 做代码建议，但都不在保存时自主修复。

## 快速开始

```
/watch              监控所有源文件
/watch src/**/*.ts  只监控 TypeScript
/watch stop         停止
/watch status       查看修复统计
```

## 工作流

```
你保存文件 (Ctrl+S)
       ↓
  2 秒去抖（防频繁保存风暴）
       ↓
  自动验证（按文件类型选命令）
  ┌────────────────────────────────┐
  │ .ts/.tsx/.js/.jsx → tsc        │
  │ .py               → py_compile │
  │ .go               → go build   │
  │ .rs               → cargo check│
  └────────────────────────────────┘
       ↓
  有错误？
  ├── 没有 → 结束，等你下次保存
  └── 有   → 提取当前文件的错误行
       ↓
  Agent 自动修复（glm-5.2, 8步上限, 2次修复）
  Prompt: "只修这些错误，别动无关代码"
       ↓
  修复成功？
  ├── 成功 → 自动 git commit "fix(watch): auto-fix xxx.ts"
  └── 失败 → 通知你，不改文件，不提交
```

## 智能化设计

### 精准验证
不是每次都跑全套测试。按文件类型选最快的验证命令——TypeScript 文件只跑 `tsc --noEmit`，Python 文件只跑 `py_compile`，秒级完成。

### 错误提取
从验证输出中只提取当前文件的错误行（按文件名过滤），不把全部输出喂给 agent。减少 token 消耗，提高修复精度。

### 最小化修复
Agent 的 prompt 明确说：

> Fix ONLY these errors. Do NOT refactor or change unrelated code. Make the minimal possible change.

防止 agent 趁机重构无关代码。

### 破坏性命令拦截
监控模式下自动阻止：`rm -rf`、`format`、`git push --force`、`git reset --hard`。

## 技术细节

| 参数 | 值 | 说明 |
|---|---|---|
| 轮询间隔 | 3 秒 | mtime 轮询，不依赖 `fs.watch`（跨平台一致） |
| 去抖 | 2 秒 | 最后一次保存后 2 秒才触发验证 |
| 最大步数 | 8 | 每次 fix 的 agent 步数上限 |
| 最大修复 | 2 | 每次最多修复尝试 2 轮 |
| Timer | `.unref()` | 不阻塞进程退出 |

### 监控的文件类型

`.ts` `.tsx` `.js` `.jsx` `.py` `.go` `.rs` `.java` `.c` `.cpp` `.rb` `.php` `.vue` `.svelte`

### 忽略的目录

`node_modules` `.git` `dist` `build` `.daoismcode` `__pycache__` `.next` `.nuxt` `target` `vendor` `.cache`

## 使用场景

### 场景 1：快速迭代
你在写 TypeScript，频繁保存。每次保存有类型错误，agent 自动修好。你只管写逻辑，类型问题自动消失。

### 场景 2：重构安全网
你在重构一个模块，改了一个函数签名。保存后，所有调用处的类型错误被自动修复。

### 场景 3：新手辅助
你在学 Python，写了语法错误。保存后 agent 自动修正缩进、冒号、导入。

## 管理命令

| 命令 | 效果 |
|---|---|
| `/watch` | 启动监控（所有源文件） |
| `/watch src/**` | 启动监控（指定模式） |
| `/watch stop` | 停止监控 |
| `/watch status` | 查看文件数、修复次数、成功率 |
| `/stop` | 停止监控 + 取消所有 loop + 中断 agent |

## 与其他功能配合

- **`/watch` + `/goal`**: 设一个目标（如"所有测试通过"），然后 `/watch` 监控。每次保存都向目标推进一步。
- **`/watch` + `/dash`**: Dashboard 实时显示修复统计。
- **`/watch` + `/loop`**: `/loop` 定期检查大问题，`/watch` 实时修小问题。

## See Also

- [目标驱动/时间驱动循环](./goal-loop) — `/goal` 和 `/loop`
- [自主工程循环](./agentic-loop) — 核心 Plan-Execute-Verify-Fix 循环
- [命令列表](./commands) — 完整命令参考
