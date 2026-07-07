# Goal-Driven & Time-Driven Loops

> Inspired by [Claude Code's loop taxonomy](https://claude.com/blog/getting-started-with-loops).

DaoismCode supports two advanced loop types that go beyond the standard turn-based agentic loop:

## 🎯 Goal-Driven Loop `/goal`

### The Problem

The standard agentic loop lets the agent decide when it's "done." But agents often declare success prematurely — editing a file without verifying, or claiming tests pass without running them.

### The Solution

`/goal` adds an independent evaluator that verifies the goal is ACTUALLY achieved before allowing the agent to stop.

### Usage

```
/goal fix all TypeScript errors, stop after 3
```

The goal is set **and the agent starts working immediately** — no need to type the task separately. The goal description IS the task. After the agent declares "done", the evaluator kicks in.

1. **Quantitative verification** auto-runs
2. **Evaluator model** checks achievement
3. If not achieved → agent goes back to work with specific feedback
4. Repeat until goal met (≥70% confidence) or max attempts

### Natural Language Support

All of these work:

```
/goal get all tests passing, stop after 5
/goal 修复所有类型错误, 最多3次
/goal Lighthouse score >= 90, try 5 times
/goal fix the auth bug, max 3 attempts
```

### Quantitative Verification

DaoismCode reads your `package.json` to detect the correct commands:

| Goal mentions | Auto-detected command |
|---|---|
| "tests pass" / "测试通过" | `npm test` / `pnpm test` / `yarn test` (reads lockfile) |
| "type errors" / "类型错误" | `npm run typecheck` / `npx tsc --noEmit` |
| "lint" / "eslint" | `npm run lint` / `npx eslint src` |
| `pytest` | `python -m pytest` |
| `cargo test` | `cargo test` |
| `go test` | `go test ./...` |

Commands run cross-platform via `execa` (no `bash` dependency).

### Quantitative Override

If ALL quantitative checks FAIL but the evaluator says "achieved" → **forced override to FAIL**. The evaluator cannot lie about test results.

### Adaptive Evaluator Model

| Goal complexity | Evaluator model | Cost |
|---|---|---|
| Simple (tests, typecheck, lint) | glm-4.7 (筑基) | Cheap |
| Complex (architecture, security, refactor) | glm-5.2 (化神) | Full |

### Confidence Threshold

Even if the evaluator says "achieved", confidence must be ≥70%. Low-confidence "achievements" send the agent back for stronger evidence.

### Cross-Attempt Learning

Each attempt's evaluation is recorded. The evaluator sees previous attempts and:
- Avoids repeating the same feedback
- Suggests DIFFERENT approaches
- References relevant past lessons via `findRelevantLesson()`

---

## 🔄 Time-Driven Loop `/loop`

### The Problem

Some tasks are recurring: check CI status, monitor PR reviews, watch for test failures. You don't want to manually re-run these.

### The Solution

`/loop` runs a full agent (with all tools) on a recurring interval. Not just a chat bot — a complete autonomous agent that can read, edit, verify, and fix.

### Usage

```
/loop 5m check CI status and fix failures, stop when all tests pass
/loop 30s run tests and report failures
/loop 1h check for dependency updates
```

### Full Agent Per Iteration

Each tick runs `runAgent()` with all 31 tools — the loop can actually **fix** problems, not just report them.

### State Accumulation

Each iteration knows what happened before:

```
Iteration 1: "CI is running, 3 tests failing"
Iteration 2: [sees previous] "Still running. Last check: 3 tests failing."
Iteration 3: "CI completed. Fixed 2 of 3 failures. 1 remaining: test_auth.py"
Iteration 4: "Fixed the last failure. All tests passing."
→ Stop condition met. Loop ends.
```

### Adaptive Interval

| Situation | Interval behavior |
|---|---|
| Normal operation | Base interval (e.g., 5m) |
| Consecutive "no change" (1×) | Base × 1.5 |
| Consecutive "no change" (2×) | Base × 2.0 |
| Consecutive "no change" (3×) | Skip iteration entirely, reset |
| Consecutive errors (3×) | Interval doubles |
| Activity detected | Reset to base |

### Model Downgrade

| Situation | Model | Steps |
|---|---|---|
| Routine check (no action keywords) | glm-4.7 (筑基, cheap) | 5 |
| Action needed (fix/error/fail detected) | glm-5.2 (化神, full) | 15, 2 fix attempts |

This saves ~70% token cost compared to always using glm-5.2.

### Smart Stop Conditions

```
/loop 5m check CI, stop when tests pass
/loop 10m monitor PR, stop when merged
/loop 1m check build, stop when done
/loop 30s check status, stop when 完成
```

Custom conditions use string matching (case-insensitive, no regex injection).

### Safety

- **Destructive command blocking**: `rm -rf`, `format`, `del /f`, `git push --force`, `git reset --hard` are blocked in loop mode
- **Autonomous safety prompt**: system prompt explicitly forbids destructive actions in background loops
- **Minimum interval**: 10 seconds (prevents API abuse)
- **`.unref()` timers**: loops don't block process exit

### Management

```
/loop         — show active loops with iteration count
/loop stop    — cancel all loops
/stop         — cancel loops + abort current agent + clear goals
```

---

## Loop Taxonomy Comparison

| Loop type | Trigger | Stop condition | DaoismCode primitive |
|---|---|---|---|
| **Turn-based** | User prompt | Agent judges completion | Standard agentic loop |
| **Goal-based** | `/goal` + task | Evaluator + quantitative check | `/goal` command |
| **Time-based** | `/loop` + interval | Stop condition or cancel | `/loop` command |
| **Proactive** | Schedule + event | Per-task goal | `/guard watch` + `--ci` mode |

## See Also

- [Agentic Loop](./agentic-loop) — The core Plan-Execute-Verify-Fix loop
- [Smart Routing](./smart-routing) — How models are selected per task
- [Reflexion Memory](./reflexion-memory) — How the agent learns from mistakes
- [Commands](./commands) — Full command reference
