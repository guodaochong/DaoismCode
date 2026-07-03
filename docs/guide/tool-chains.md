# 工具链学习

> DaoismCode 记住哪些工具序列成功、哪些失败——然后在系统提示词中推荐已验证的最优路径。

## 工作原理

每次 agent 运行结束时，记录使用的工具序列和结果：

```
read_file → analyze_impact → edit_file → run_verify  ✓ 成功 (8步)
grep → grep → grep → edit_file                        ✗ 失败 (15步)
find_code → read_file → edit_file → lsp_diagnostics → run_verify  ✓ 成功 (7步)
```

这些数据持久化到 `.daoismcode/tool-chains.json`，按成功率排序。

## 系统提示词注入

启动时，排名前 5 的已验证工具链被注入系统提示词：

```
## PROVEN TOOL CHAINS (from your past success)
  - read_file→analyze_impact→edit_file→run_verify (95% success, ~8 steps)
  - find_code→read_file→edit_file→lsp_diagnostics→run_verify (92% success, ~7 steps)
  - read_file→edit_file→run_verify (88% success, ~6 steps)
```

Agent 从自身历史中学习——以及你项目的特定模式。

## 数据存储

```json
// .daoismcode/tool-chains.json
{
  "chains": {
    "read_file→analyze_impact→edit_file→run_verify": {
      "successCount": 19,
      "failCount": 1,
      "avgSteps": 8,
      "lastUsed": "2026-07-03"
    }
  }
}
```

最多保留 50 条记录，按使用频率排序后裁剪。

## 所有退出路径覆盖

工具链记录覆盖 agent 循环的**所有退出路径**：
- 正常完成 ✅
- 用户中断 (abort) ✅
- 步数预算耗尽 ✅

确保学习数据不会因为异常退出而产生偏差。
