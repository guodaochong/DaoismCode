# 快速开始

## 前置要求

| 工具 | 版本 | 用途 |
|---|---|---|
| **Bun** | ≥ 1.3 | TUI 运行时 + 独立编译 |
| **Node** | ≥ 20 | Agent 核心、测试、readline CLI |
| **pnpm** | ≥ 9 | 包管理 |

## 安装

```bash
git clone https://github.com/jumpingbirds/DaoismCode-AI.git
cd DaoismCode-AI
pnpm install
```

## 配置

DaoismCode 是 **Provider 无关**的。任何提供 OpenAI 兼容 `/v1/chat/completions` 端点的服务商都可以接入。

```bash
# 创建配置文件
mkdir -p .daoismcode
cat > .daoismcode/config.json << 'EOF'
{
  "provider": "自定义",
  "baseURL": "https://your-api-endpoint/v1",
  "apiKey": "YOUR-API-KEY",
  "model": "your-flagship-model",
  "enableRouting": true
}
EOF
```

### 配置项说明

| 字段 | 说明 | 示例 |
|---|---|---|
| `provider` | Provider 标识 | `"自定义"`, `"openai"`, `"deepseek"`, `"ollama"` |
| `baseURL` | API 端点 | `"https://api.example.com/v1"` |
| `apiKey` | API 密钥 | `"sk-xxxxx"` |
| `model` | 默认模型 | `"gpt-4o"`, `"deepseek-chat"` |
| `enableRouting` | 开启智能路由 | `true` / `false` |

### 配置优先级

```
1. CLI 参数               --model, --base-url, --provider
2. 环境变量               DAOISM_API_KEY, DAOISM_PROVIDER, ...
3. 项目配置               .daoismcode/config.json (gitignored)
4. 用户配置               ~/.daoismcoderc.json
```

## 启动 TUI

```bash
pnpm tui
```

你会看到：

```
◈ "The Tao that can be told is not the eternal Tao."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ⛩️化神境 · auto routing

  ┌──────────────────────────────────────────────┐
  │ Message DaoGPT... (type / for commands)      │
  └──────────────────────────────────────────────┘
```

## 构建独立可执行文件

```bash
pnpm build:exe    # → dist/daoism.exe (103 MB, 零运行时依赖)
```

构建完成后，将 `dist/daoism.exe` 复制到任何位置运行即可。无需 Bun，无需 Node，无需 `node_modules`。

## 下一步

- [四境智能路由](/guide/smart-routing) — 了解六引擎如何动态选模型
- [自主工程循环](/guide/agentic-loop) — Plan-Execute-Verify-Fix 循环
- [语义代码搜索](/guide/semantic-search) — 按含义搜索代码
- [工具列表](/guide/tools) — 24 个内置工具一览
- [命令列表](/guide/commands) — 23 个斜杠命令一览
