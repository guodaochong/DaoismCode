# 工具列表

> 24 个内置工具。Agent 自主选择调用。

## 只读工具（自动批准）

| 工具 | 说明 |
|---|---|
| `read_file` | 读取 UTF-8 文件，1-based 行号 |
| `glob` | 按 glob 模式查找文件 |
| `grep` | 正则搜索文件内容 |
| `find_code` | **语义代码搜索 — 向量嵌入按含义搜索** |
| `lsp_diagnostics` | TypeScript/JS 诊断（tsserver） |
| `lsp_definition` | 跳转到定义 |
| `lsp_references` | 查找所有引用 |
| `detect_verify` | 自动检测项目的测试/lint/类型检查命令 |
| `run_verify` | **一键运行全部验证（测试+类型检查+lint+编译）** |
| `analyze_impact` | **跨文件影响分析：找出所有引用给定文件/符号的文件** |
| `code_search` | **结构化代码搜索（函数/类/导入/导出/接口/类型/async/try-catch/hook/decorator）** |
| `search_github` | **搜索 GitHub 真实代码示例（grep.app）** |
| `scan_codebase` | **全代码库审计：安全风险/bug/性能/技术债/缺失测试** |
| `analyze_image` | **多模态视觉：分析截图、UI、错误图片** |
| `ask_user` | **交互选择面板 — 单选/多选（方向键+空格+回车）** |
| `update_memory` | **更新长期项目记忆（架构决策、编码规范、已知陷阱）** |
| `web_search` | DuckDuckGo 搜索 |
| `web_fetch` | 抓取 URL，剥离 HTML 转文本 |
| `todo_write` | 创建/更新任务列表 |

## 变更工具（需权限批准）

| 工具 | 说明 |
|---|---|
| `write_file` | 写入/创建文件 |
| `edit_file` | 精确字符串替换，生成 Diff 预览 |
| `bash` | 执行 Shell 命令，阻止破坏性模式 |
| `subagent` | 委派隔离子任务给新 Agent 上下文 |
| `parallel_subagents` | **并行运行最多 4 个独立子任务** |
