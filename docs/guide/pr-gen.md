# 自动 PR 生成 /pr

> 从 git diff 到可发布的 PR 描述，只需一条命令。

## 使用方式

```bash
/pr              # 对比 main 分支
/pr develop      # 对比 develop 分支
```

## 输出格式

```
## Refactor: Replace manual token validation with middleware

### Summary
Replaces ad-hoc token checks across 4 API routes with a centralized
`verifyToken` middleware, reducing duplication and improving security.

### Changes
- Added `src/auth/middleware.ts` — `verifyToken` Express middleware
- Refactored 4 route handlers to use middleware instead of inline checks
- Updated `auth.test.ts` with 6 new test cases

### Testing
- `npm test` — all 42 tests pass
- Manual: verified login/logout/refresh-token flows

### Risk Assessment
- Breaking change: `GET /api/profile` now requires `Authorization` header
```

## 工作原理

1. `git diff --stat base...HEAD` — 获取变更统计
2. `git log base..HEAD --oneline` — 获取 commit 历史
3. `git diff base...HEAD --unified=3` — 获取完整 diff（截断到 15K）
4. 将 commit 历史 + diff stat + 完整 diff 发送给 LLM
5. LLM 按 PR_PROMPT 格式输出：标题 → 摘要 → 变更清单 → 测试步骤 → 风险评估

## 无 API Key 时的降级

如果没有配置 LLM client，会输出纯模板格式（commit 列表 + diff stat），不调用 LLM。
