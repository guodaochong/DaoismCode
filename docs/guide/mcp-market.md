# MCP 市场

> 12 个常用 MCP 服务器一键安装——无需手动编辑配置文件。

## 使用方式

在 DaoismCode 中：

```
> 列出可用的 MCP 服务器
→ mcp_market(action='list')

> 安装 Playwright
→ mcp_market(action='install', name='playwright')
→ ✅ Installed playwright to .daoismcode/mcp.json. Restart to activate.
```

## 可用服务器

| 类别 | 服务器 | 描述 |
|---|---|---|
| **文档** | context7 | 最新库文档和代码示例 |
| **浏览器** | playwright | 浏览器自动化、截图、爬虫、测试 |
| **浏览器** | puppeteer | 无头 Chrome 自动化 |
| **开发** | github | GitHub API：仓库、Issue、PR、提交 |
| **数据库** | postgres | PostgreSQL 查询和 schema 检查 |
| **数据库** | sqlite | SQLite 数据库操作 |
| **搜索** | brave-search | Brave Search API 网络搜索 |
| **AI** | memory | 持久化知识图谱记忆 |
| **AI** | sequential-thinking | 复杂问题的逐步推理 |
| **工具** | time | 时区转换和调度 |
| **工具** | fetch | JavaScript 渲染的高级网页抓取 |
| **文件** | filesystem | 沙箱化的扩展文件系统访问 |

## 安装流程

1. Agent 调用 `mcp_market(action='install', name='playwright')`
2. 服务器配置写入 `.daoismcode/mcp.json`
3. 如果服务器需要环境变量，提示用户设置
4. 重启 DaoismCode 后生效

## 配置文件格式

```json
// .daoismcode/mcp.json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-playwright"]
  },
  "github": {
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-github"],
    "env": {
      "GITHUB_TOKEN": ""
    }
  }
}
```
