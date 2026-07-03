# 神经仪表盘 /dash

> 赛博朋克风格实时 Web 仪表盘。在终端输入 `/dash`，浏览器打开 `http://localhost:9527`。

## 启动

```
/dash
→ 📊 Dashboard started at http://localhost:9527
  Open in your browser to view budget, routing, lessons, and memory stats.
  Runs in background (unref) — will not block exit.
```

## 九大模块

| 模块 | 仙侠名 | 内容 |
|---|---|---|
| **境界能量** | REALM ENERGY | 四个 SVG 环形进度图——每个模型的预算使用率（筑基/金丹/元婴/化神各自颜色） |
| **渡劫流** | TASK FLOW | 最近任务类型彩色标签 + 项目信息（语言/框架/测试/构建） |
| **道行** | LEARNING METRICS | 四个大数字磁贴：教训数 / 已知坑点 / 架构决策 / 工具链数 |
| **元神** | MODEL MATRIX | 所有模型的速度、上下文窗口、每百万 token 成本 |
| **心魔** | ERROR PATTERNS | 递归失败类别的条形图（按频率排序，颜色按严重度） |
| **法宝** | TOOL CHAINS | 可视化工具序列链 + 成功率 |
| **悟道** | REFLEXION LOG | 最近 15 条教训的滚动列表 |
| **灵脉** | SYSTEM TELEMETRY | 平台、CPU、内存（RSS）、运行时间、运行时版本 |
| **实时指示** | — | 心跳脉冲 + LIVE 标签 + 3 秒自动刷新 |

## 视觉效果

- **赛博朋克暗黑底** `#05050f` + 径向霓虹渐变光晕
- **滚动网格背景** 50px 方格无限滚动动画
- **玻璃拟态卡片** `backdrop-filter: blur(20px)` + 半透明边框
- **霓虹辉光** 所有数值/环形图带发光阴影
- **Logo 脉动** 道字 logo 每 2 秒呼吸式发光
- **加载动画** 启动时旋转环 + "INITIALIZING NEURAL LINK"
- **响应式布局** 自动适配手机/平板/桌面

## 安全

- 绑定 `127.0.0.1`（仅本机可访问，不暴露到网络）
- `server.unref()` 确保不阻止进程退出

## API 端点

| 端点 | 数据 |
|---|---|
| `/api/overview` | 全量数据（预算/任务/教训/记忆/模式/链/系统） |
| `/api/lessons` | Reflexion 教训全文 |
| `/api/memory` | 项目记忆 JSON |
| `/api/tool-chains` | 工具链学习数据 |
| `/api/error-patterns` | 错误模式分类统计 |
