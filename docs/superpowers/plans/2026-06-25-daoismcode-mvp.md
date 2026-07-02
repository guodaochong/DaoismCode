# DaoismCode MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working terminal CLI coding agent (`daoism`) that runs an agentic loop against ZhipuAI GLM (Coding Plan) with 6 tools, streaming output, and a write/command permission gate.

**Architecture:** Layered TS app — CLI → Agent loop → LLM (OpenAI-compatible client to GLM coding endpoint) → Tools. The agent loop streams a chat completion, aggregates fragmented `tool_calls` from SSE deltas, executes tools (read-only auto, write/cmd via confirmation), feeds results back, and loops until the model emits text-only or the step budget is hit.

**Tech Stack:** TypeScript (strict), Node.js ≥20, pnpm, tsup, commander, openai SDK, execa, fast-glob, chalk/ora/marked-terminal, pino, vitest.

**Spec:** `docs/superpowers/specs/2026-06-25-daoismcode-design.md`

**Conventions:** Every `.ts` file starts with a header comment block: file purpose + `@author jumpingbirds <guodaochong@gmail.com>`. Detailed English comments throughout. No `as any`/`@ts-ignore`. TDD for logic-bearing modules; straightforward create for config/gluet.

**Checkpoint note:** Repo is not git-initialized and commits were not requested. Each task ends with a **Save Checkpoint** (files saved) instead of `git commit`. Task 0 optionally initializes git if desired.

---

## File Structure (what each file owns)

**Config/scaffold (Milestone 0):**
- `package.json` — deps + scripts (dev/build/lint/typecheck/test)
- `tsconfig.json` — strict TS config
- `tsup.config.ts` — build to `dist/daoism.js` (ESM, shebang)
- `.eslintrc.cjs`, `.prettierrc`, `.gitignore`, `.npmrc`, `README.md`

**Foundations (Milestone 1):**
- `src/config/index.ts` — merge CLI flags > env > `.daoismcode/config.json` > `~/.daoismcoderc.json` > defaults; resolve apiKey/baseURL/model/maxSteps/skipPermissions.
- `src/util/log.ts` — pino logger writing to `.daoismcode/logs/`.
- `src/util/diff.ts` — unified diff generator (for edit confirmation display).
- `src/fs/paths.ts` — path safety: resolve under project root, reject `..`/absolute escapes.
- `src/fs/reader.ts` — read file with line-number prefix, offset/limit, truncation.
- `src/shell/runner.ts` — execa wrapper: timeout, cwd, capture stdout/stderr/exitCode.

**LLM (Milestone 2):**
- `src/llm/config.ts` — typed `LlmConfig` + loader (delegates to `config/`).
- `src/llm/client.ts` — construct `OpenAI` client with `baseURL`/`apiKey`.
- `src/llm/stream.ts` — `streamChat()`: stream text + aggregate `tool_calls` by index; return `{content, toolCalls}`.

**Tools (Milestone 3):**
- `src/agent/types.ts` — shared types: `Tool`, `ToolResult`, `Message`, `PermissionGate`, `ToolContext`.
- `src/tools/schema.ts` — JSON Schemas (OpenAI `tools` shape) for the 6 tools.
- `src/tools/registry.ts` — register tools, dispatch by name, expose schemas + permission flags.
- `src/tools/read.ts`, `write.ts`, `edit.ts`, `glob.ts`, `grep.ts`, `bash.ts` — tool executors.
- `src/tools/index.ts` — barrel.

**Agent (Milestone 4):**
- `src/agent/context.ts` — system prompt + message assembly.
- `src/agent/loop.ts` — core `agentLoop()`: stream → execute tools → feed back → repeat; step budget; LLM API error retry.

**CLI (Milestone 5):**
- `src/cli/permission.ts` — interactive y/n/a/e gate (in-memory allowlist).
- `src/cli/render.ts` — stream token print + markdown render of final text.
- `src/cli/input.ts` — readline input + multi-line + exit commands.
- `src/cli/repl.ts` — REPL session tying loop+render+permission.
- `src/index.ts` — commander entry: `daoism [repl|run "<prompt>"] [flags]`.

**Tests:** co-located `*.test.ts` next to modules (vitest).

---

## Milestone 0 — Scaffold

### Task 0 (optional): Initialize git
**Files:** (repo root)

- [ ] **Step 1:** Run `git init` (only if user wants version control). If skipped, all later "Save Checkpoint" = files written, no commit.

### Task 0.1: package.json
**Files:** Create `package.json`

- [ ] **Step 1:** Create `package.json`:

```json
{
  "name": "daoismcode",
  "version": "0.1.0",
  "description": "Terminal CLI coding agent powered by GLM",
  "author": "jumpingbirds <guodaochong@gmail.com>",
  "license": "MIT",
  "type": "module",
  "bin": { "daoism": "./dist/daoism.js" },
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsup",
    "lint": "eslint \"src/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "engines": { "node": ">=20" },
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^12.1.0",
    "execa": "^9.5.1",
    "fast-glob": "^3.3.2",
    "marked": "^14.1.3",
    "marked-terminal": "^7.2.1",
    "openai": "^4.73.0",
    "ora": "^8.1.1",
    "pino": "^9.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    "tsup": "^8.3.5",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2:** Run `pnpm install`. Expected: lockfile created, deps installed.

### Task 0.2: tsconfig.json
**Files:** Create `tsconfig.json`

- [ ] **Step 1:** Create:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2023"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

> Note: `noUncheckedIndexedAccess` is on — array/object index accesses return `T | undefined`; always narrow. This enforces safety without `as any`.

### Task 0.3: tsup.config.ts
**Files:** Create `tsup.config.ts`

- [ ] **Step 1:** Create:

```ts
/**
 * DaoismCode build configuration.
 * Bundles the CLI into a single ESM file with a shebang so it can be
 * executed directly as the `daoism` binary.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  // Emit the built file as `dist/daoism.js` to match the `bin` field.
  outExtension: () => ({ js: '.js' }),
  banner: { js: '#!/usr/bin/env node' },
});
```

- [ ] **Step 2:** Add a `postbuild` rename: edit `package.json` scripts so `build` runs `tsup && mv dist/index.js dist/daoism.js` (tsup names output after entry). Or simpler — change entry handling. **Decision:** set tsup `entry` to a virtual name. Simpler fix: add script:

```json
"build": "tsup && node -e \"require('fs').renameSync('dist/index.js','dist/daoism.js')\""
```

> Windows note: use `fs.renameSync` via node (cross-platform) rather than `mv`.

### Task 0.4: lint/format/ignore
**Files:** Create `.eslintrc.cjs`, `.prettierrc`, `.gitignore`, `.npmrc`

- [ ] **Step 1:** `.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
  env: { node: true, es2022: true },
  rules: { 'no-unused-vars': 'error', 'no-undef': 'error' },
};
```

- [ ] **Step 2:** `.prettierrc`: `{ "singleQuote": true, "printWidth": 100, "trailingComma": "all" }`
- [ ] **Step 3:** `.gitignore`: `node_modules/`, `dist/`, `.daoismcode/logs/`, `*.log`
- [ ] **Step 4:** `.npmrc`: `auto-install-peers=true`
- [ ] **Step 5:** **Save Checkpoint.**

### Task 0.5: README stub
**Files:** Create `README.md`

- [ ] **Step 1:** Minimal README (title, one-line description, `pnpm install`/`pnpm dev`, env vars `DAOISM_API_KEY`/`DAOISM_MODEL`). Expanded later.

---

## Milestone 1 — Foundations (TDD)

### Task 1.1: fs/paths.ts (path safety)
**Files:** Create `src/fs/paths.ts`, test `src/fs/paths.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/fs/paths.test.ts
import { test, expect } from 'vitest';
import { safeResolve, PathEscapeError } from './paths.js';

test('resolves path inside root', () => {
  const root = process.cwd();
  const p = safeResolve(root, 'src/index.ts');
  expect(p.startsWith(root)).toBe(true);
});

test('rejects parent escape', () => {
  const root = process.cwd();
  expect(() => safeResolve(root, '../../etc/passwd')).toThrow(PathEscapeError);
});

test('rejects absolute outside root', () => {
  const root = process.cwd();
  expect(() => safeResolve(root, '/etc/passwd')).toThrow(PathEscapeError);
});
```

- [ ] **Step 2: Run** `pnpm test src/fs/paths.test.ts` → Expected FAIL (module not found).
- [ ] **Step 3: Implement**

```ts
/**
 * Path safety helpers. All file tools MUST route target paths through
 * safeResolve() so the agent cannot touch files outside the project root.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import path from 'node:path';

export class PathEscapeError extends Error {
  constructor(target: string) {
    super(`Path "${target}" escapes project root`);
    this.name = 'PathEscapeError';
  }
}

/**
 * Resolve `target` relative to `root` and verify the result is inside `root`.
 * Throws PathEscapeError on any escape (.. traversal or absolute outside root).
 */
export function safeResolve(root: string, target: string): string {
  const resolved = path.isAbsolute(target) ? target : path.resolve(root, target);
  const rel = path.relative(root, resolved);
  // Empty rel === root itself; otherwise must not start with '..' and must not be absolute.
  if (rel === '') return resolved;
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new PathEscapeError(target);
  return resolved;
}
```

- [ ] **Step 4: Run** → Expected PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 1.2: util/diff.ts
**Files:** Create `src/util/diff.ts`, test `src/util/diff.ts.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { unifiedDiff } from './diff.js';

test('produces add/remove lines', () => {
  const d = unifiedDiff('a\nb\nc', 'a\nX\nc');
  expect(d).toContain('-b');
  expect(d).toContain('+X');
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** — minimal LCS-based line diff returning a string of `- ` / `+ ` / `  ` lines:

```ts
/**
 * Minimal line-level unified diff generator used to preview edit_file changes.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
export function unifiedDiff(oldText: string, newText: string): string {
  const a = oldText.split('\n');
  const b = newText.split('\n');
  const m = a.length, n = b.length;
  // dp table for LCS length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const out: string[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { out.push(`  ${a[i]}`); i++; j++; }
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) { out.push(`- ${a[i]}`); i++; }
    else { out.push(`+ ${b[j]}`); j++; }
  }
  while (i < m) { out.push(`- ${a[i]}`); i++; }
  while (j < n) { out.push(`+ ${b[j]}`); j++; }
  return out.join('\n');
}
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 1.3: fs/reader.ts
**Files:** Create `src/fs/reader.ts`, test `src/fs/reader.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { formatWithLineNumbers } from './reader.js';

test('prefixes 1-based line numbers', () => {
  expect(formatWithLineNumbers(['foo', 'bar'])).toBe('1: foo\n2: bar');
});
test('respects offset and limit', () => {
  const lines = ['a', 'b', 'c', 'd'];
  expect(formatWithLineNumbers(lines, 2, 2)).toBe('2: b\n3: c');
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * File reading helpers. formatWithLineNumbers produces Claude-Code-style
 * "N: <line>" output with optional offset/limit for paging large files.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
export function formatWithLineNumbers(lines: string[], offset = 1, limit?: number): string {
  const start = Math.max(1, offset) - 1; // 0-based slice start
  const end = limit !== undefined ? start + limit : lines.length;
  return lines
    .slice(start, end)
    .map((line, idx) => `${start + idx + 1}: ${line}`)
    .join('\n');
}
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 1.4: shell/runner.ts
**Files:** Create `src/shell/runner.ts`, test `src/shell/runner.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { runCommand } from './runner.js';

test('captures stdout and exit code 0', async () => {
  const r = await runCommand('echo hello', { cwd: process.cwd() });
  expect(r.exitCode).toBe(0);
  expect(r.stdout.trim()).toBe('hello');
}, 10000);

test('captures non-zero exit', async () => {
  const r = await runCommand('node -e "process.exit(3)"', { cwd: process.cwd() });
  expect(r.exitCode).toBe(3);
}, 10000);
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * Shell command runner built on execa. Returns captured stdout/stderr/exitCode.
 * Never throws on non-zero exit — the exit code is data the agent reasons about.
 * Throws only on timeout or spawn failure.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import { execa } from 'execa';

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface RunOptions {
  cwd: string;
  timeoutMs?: number;
}

export async function runCommand(command: string, opts: RunOptions): Promise<RunResult> {
  const result = await execa(command, {
    cwd: opts.cwd,
    timeout: opts.timeoutMs ?? 120_000,
    shell: true,
    reject: false, // do not throw on non-zero exit
  });
  return { stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode ?? -1 };
}
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 1.5: config/index.ts
**Files:** Create `src/config/index.ts`, test `src/config/index.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { resolveConfig } from './index.js';

test('env overrides defaults', () => {
  const c = resolveConfig({
    env: { DAOISM_API_KEY: 'k', DAOISM_MODEL: 'glm-4.5' },
    cwd: process.cwd(),
  });
  expect(c.apiKey).toBe('k');
  expect(c.model).toBe('glm-4.5');
  expect(c.baseUrl).toContain('coding'); // coding-plan default
});

test('missing api key yields null', () => {
  const c = resolveConfig({ env: {}, cwd: process.cwd() });
  expect(c.apiKey).toBeNull();
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * Configuration resolution. Priority (high→low): flags arg > env > project
 * .daoismcode/config.json > ~/.daoismcoderc.json > built-in defaults.
 * The default baseUrl points at the Coding-Plan-specific endpoint because
 * Coding-Plan keys return 401 on the standard /api/paas/v4/ endpoint.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface AppConfig {
  apiKey: string | null;
  baseUrl: string;
  model: string;
  maxSteps: number;
  skipPermissions: boolean;
  cwd: string;
}

export interface ResolveInput {
  env: NodeJS.ProcessEnv;
  cwd: string;
  flags?: Partial<AppConfig>;
}

// Provider presets — any OpenAI-compatible endpoint. Adding a provider = one
// line here. Resolved via DAOISM_PROVIDER (default 'glm'); explicit
// DAOISM_BASE_URL / DAOISM_MODEL always override the preset.
const PROVIDERS = {
  glm: { baseUrl: 'https://open.bigmodel.cn/api/coding/paas/v4', model: 'glm-5.2' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  deepseek: { baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  ollama: { baseUrl: 'http://localhost:11434/v1', model: 'qwen2.5-coder' },
} as const;
type ProviderName = keyof typeof PROVIDERS;

const DEFAULT_PROVIDER: ProviderName = 'glm';
const DEFAULT_MAX_STEPS = 25;

function readJson(file: string): Record<string, unknown> | null {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
  } catch {
    /* ignore malformed rc */
  }
  return null;
}

export function resolveConfig(input: ResolveInput): AppConfig {
  const project = readJson(path.join(input.cwd, '.daoismcode', 'config.json')) ?? {};
  const user = readJson(path.join(os.homedir(), '.daoismcoderc.json')) ?? {};
  const merged: Record<string, unknown> = { ...user, ...project };

  const pick = (keys: string[], from: Record<string, unknown>): unknown | undefined => {
    for (const k of keys) if (from[k] !== undefined) return from[k];
    return undefined;
  };

  const envKeys = (e: NodeJS.ProcessEnv) => ({
    apiKey: e.DAOISM_API_KEY,
    baseUrl: e.DAOISM_BASE_URL,
    model: e.DAOISM_MODEL,
    provider: e.DAOISM_PROVIDER,
    maxSteps: e.DAOISM_MAX_STEPS,
    skipPermissions: e.DAOISM_SKIP_PERMISSIONS,
  });
  const e = envKeys(input.env);

  const providerRaw =
    (input.flags?.provider as string | undefined) ??
    (e.provider as string | undefined) ??
    (pick(['provider'], merged) as string | undefined) ??
    DEFAULT_PROVIDER;
  const provider: ProviderName =
    providerRaw in PROVIDERS ? (providerRaw as ProviderName) : DEFAULT_PROVIDER;

  const apiKey =
    (input.flags?.apiKey as string | undefined) ??
    (e.apiKey as string | undefined) ??
    (pick(['apiKey', 'api_key'], merged) as string | undefined) ??
    null;
  const baseUrl =
    (input.flags?.baseUrl as string | undefined) ??
    (e.baseUrl as string | undefined) ??
    (pick(['baseUrl', 'base_url'], merged) as string | undefined) ??
    PROVIDERS[provider].baseUrl;
  const model =
    (input.flags?.model as string | undefined) ??
    (e.model as string | undefined) ??
    (pick(['model'], merged) as string | undefined) ??
    PROVIDERS[provider].model;
  const maxStepsRaw =
    (input.flags?.maxSteps as number | undefined) ??
    (e.maxSteps ? Number(e.maxSteps) : undefined) ??
    (pick(['maxSteps', 'max_steps'], merged) as number | undefined);
  const skipPermissionsRaw =
    (input.flags?.skipPermissions as boolean | undefined) ??
    (e.skipPermissions === 'true' ? true : e.skipPermissions === 'false' ? false : undefined) ??
    (pick(['skipPermissions'], merged) as boolean | undefined);

  return {
    apiKey: apiKey ?? null,
    baseUrl,
    model,
    maxSteps: maxStepsRaw ?? DEFAULT_MAX_STEPS,
    skipPermissions: skipPermissionsRaw ?? false,
    cwd: input.flags?.cwd ?? input.cwd,
  };
}
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 1.6: util/log.ts
**Files:** Create `src/util/log.ts` (no unit test — thin wrapper)

- [ ] **Step 1: Implement**

```ts
/**
 * Structured logger writing to .daoismcode/logs/<date>.log via pino.
 * Silent on the console; purely for debugging agent runs.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import fs from 'node:fs';
import path from 'node:path';
import pino, { type Logger } from 'pino';

let _logger: Logger | null = null;

export function initLogger(cwd: string): Logger {
  if (_logger) return _logger;
  const dir = path.join(cwd, '.daoismcode', 'logs');
  fs.mkdirSync(dir, { recursive: true });
  const dest = fs.createWriteStream(path.join(dir, `${new Date().toISOString().slice(0, 10)}.log`), { flags: 'a' });
  _logger = pino({ level: 'info' }, dest);
  return _logger;
}

export function log(): Logger {
  if (!_logger) return pino({ level: 'silent' });
  return _logger;
}
```

- [ ] **Step 2: Save Checkpoint.**

---

## Milestone 2 — LLM Layer

### Task 2.1: llm/types + client
**Files:** Create `src/llm/client.ts`

- [ ] **Step 1: Implement**

```ts
/**
 * OpenAI-compatible LLM client pointed at the GLM Coding-Plan endpoint.
 * We use the official `openai` SDK so streaming + tool_calls wire formats
 * are handled identically to OpenAI Chat Completions.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import OpenAI from 'openai';
import type { AppConfig } from '../config/index.js';

export function makeClient(cfg: AppConfig): OpenAI {
  if (!cfg.apiKey) throw new Error('DAOISM_API_KEY is not set. Get one at https://open.bigmodel.cn .');
  return new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseUrl });
}
```

### Task 2.2: llm/stream.ts (critical — tool_call aggregation)
**Files:** Create `src/llm/stream.ts`, test `src/llm/stream.test.ts`

- [ ] **Step 1: Write failing test** (synthetic chunk sequence, no network)

```ts
import { test, expect } from 'vitest';
import { aggregateToolCalls } from './stream.js';
import type { ChatCompletionStreamEventDelta } from './stream.js';

test('assembles fragmented tool_calls by index', () => {
  const deltas: ChatCompletionStreamEventDelta[] = [
    { tool_calls: [{ index: 0, id: 'call_1', type: 'function', function: { name: 'read', arguments: '' } }] },
    { tool_calls: [{ index: 0, function: { arguments: '{"path":' } }] },
    { tool_calls: [{ index: 0, function: { arguments: '"a.ts"}' } }] },
    { tool_calls: [{ index: 1, id: 'call_2', type: 'function', function: { name: 'grep', arguments: '{}' } }] },
  ];
  const out = aggregateToolCalls(deltas);
  expect(out).toHaveLength(2);
  expect(out[0]!.function.name).toBe('read');
  expect(out[0]!.function.arguments).toBe('{"path":"a.ts"}');
  expect(out[1]!.function.name).toBe('grep');
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * Streaming chat completion + tool_call aggregation.
 *
 * GLM streams OpenAI-compatible SSE deltas. A single tool call arrives
 * fragmented across many deltas, each carrying a slice of function.arguments
 * keyed by `index`. aggregateToolCalls() reconstructs complete calls.
 *
 * streamChat() drives the stream, prints text tokens as they arrive (via the
 * provided onToken callback), and returns the fully assembled assistant turn.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import type OpenAI from 'openai';
import type { ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';

// Re-export the delta type so tests can construct synthetic chunks without
// importing the full SDK message type.
export type ChatCompletionStreamEventDelta = {
  content?: string | null;
  tool_calls?: Array<{
    index: number;
    id?: string;
    type?: 'function';
    function?: { name?: string; arguments?: string };
  }> | null;
};

export type AccumulatedToolCall = ChatCompletionMessageToolCall;

/**
 * Reconstruct complete tool calls from a sequence of streamed deltas.
 * Pure function — trivially testable without network access.
 */
export function aggregateToolCalls(deltas: ChatCompletionStreamEventDelta[]): AccumulatedToolCall[] {
  const acc: AccumulatedToolCall[] = [];
  for (const d of deltas) {
    if (!d.tool_calls) continue;
    for (const tc of d.tool_calls) {
      const existing = acc[tc.index];
      if (!existing) {
        acc[tc.index] = {
          id: tc.id ?? '',
          type: 'function',
          function: { name: tc.function?.name ?? '', arguments: tc.function?.arguments ?? '' },
        };
      } else {
        if (tc.id) existing.id = tc.id;
        if (tc.function?.name) existing.function.name += tc.function.name;
        if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
      }
    }
  }
  return acc.filter(Boolean);
}

export interface StreamedTurn {
  content: string;
  toolCalls: AccumulatedToolCall[];
}

export interface StreamChatParams {
  client: OpenAI;
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools: OpenAI.Chat.Completions.ChatCompletionTool[];
  onToken?: (token: string) => void;
}

/**
 * Stream one assistant turn. Accumulates content + tool_calls, invoking
 * onToken for each text fragment so the CLI can render incrementally.
 */
export async function streamChat(params: StreamChatParams): Promise<StreamedTurn> {
  const stream = await params.client.chat.completions.create({
    model: params.model,
    messages: params.messages,
    tools: params.tools,
    stream: true,
  });

  let content = '';
  const deltas: ChatCompletionStreamEventDelta[] = [];
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;
    if (typeof delta.content === 'string' && delta.content) {
      content += delta.content;
      params.onToken?.(delta.content);
    }
    if (delta.tool_calls && delta.tool_calls.length > 0) {
      deltas.push({
        content: delta.content,
        tool_calls: delta.tool_calls.map((tc) => ({
          index: tc.index,
          id: tc.id,
          type: 'function',
          function: { name: tc.function?.name, arguments: tc.function?.arguments },
        })),
      });
    }
  }
  return { content, toolCalls: aggregateToolCalls(deltas) };
}
```

- [ ] **Step 4: Run** `pnpm test src/llm/stream.test.ts` → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 2.3: Model-ID probe (manual, needs real key)
**Files:** Create `src/llm/probe.ts`

- [ ] **Step 1: Implement** a tiny script that lists/tries models with the user's key to confirm the exact Coding-Plan model id:

```ts
/**
 * One-off helper to confirm which model IDs are usable under the current
 * Coding-Plan key. Run with: DAOISM_API_KEY=... pnpm tsx src/llm/probe.ts
 * Prints the first model that answers a trivial tool-call request.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import { makeClient } from './client.js';
import { resolveConfig } from '../config/index.js';

async function main() {
  const cfg = resolveConfig({ env: process.env, cwd: process.cwd() });
  const client = makeClient(cfg);
  const candidates = ['glm-4.6', 'glm-4.5', 'glm-4-plus'];
  for (const m of candidates) {
    try {
      const r = await client.chat.completions.create({
        model: m,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      });
      console.log('OK', m, '->', r.choices[0]?.message?.content);
    } catch (e) {
      console.log('FAIL', m, '->', (e as Error).message);
    }
  }
}
void main();
```

- [ ] **Step 2:** (Manual, at execution time with real key) Run probe; record working model id; if not `glm-4.6`, update `DEFAULT_MODEL` in `src/config/index.ts`.
- [ ] **Step 3: Save Checkpoint.**

---

## Milestone 3 — Tools

### Task 3.1: agent/types.ts (shared types)
**Files:** Create `src/agent/types.ts`

- [ ] **Step 1: Implement**

```ts
/**
 * Shared agent/tool type definitions.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import type { ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';

export interface ToolContext {
  /** Absolute project root; all file ops are constrained under it. */
  cwd: string;
  /** Ask the user to approve a mutating action. Returns true if allowed. */
  requestPermission: (description: string) => Promise<boolean>;
}

/** Result returned by every tool executor. */
export interface ToolResult {
  /** Loosely structured text/JSON fed back to the model as the tool message. */
  content: string;
  /** True if the tool errored (still fed back; the model may self-correct). */
  isError: boolean;
}

export interface Tool {
  name: string;
  /** Executes the tool with already-parsed JSON arguments. */
  execute: (args: unknown, ctx: ToolContext) => Promise<ToolResult>;
  /** Whether this tool mutates state and needs user approval. */
  requiresPermission: boolean;
}

/** Parsed call extracted from an accumulated ChatCompletionMessageToolCall. */
export interface ParsedToolCall {
  id: string;
  name: string;
  args: unknown;
}

export function parseToolCall(tc: ChatCompletionMessageToolCall): ParsedToolCall {
  let args: unknown = {};
  try {
    args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
  } catch {
    args = { __raw: tc.function.arguments };
  }
  return { id: tc.id, name: tc.function.name, args };
}
```

### Task 3.2: tools/schema.ts
**Files:** Create `src/tools/schema.ts`

- [ ] **Step 1: Implement** — OpenAI `tools` array with JSON schemas for the 6 tools:

```ts
/**
 * JSON-Schema definitions for the 6 MVP tools, in the OpenAI
 * `tools` request shape. Kept in one place so the agent loop and the
 * tool registry share a single source of truth.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

const str = (description: string) => ({ type: 'string', description } as const);

export const TOOL_SCHEMAS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read a UTF-8 text file under the project root, with 1-based line numbers.',
      parameters: {
        type: 'object',
        properties: {
          path: str('Project-relative file path.'),
          offset: { type: 'number', description: '1-based line to start at (default 1).' },
          limit: { type: 'number', description: 'Max lines to return.' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'glob',
      description: 'Find files by glob pattern (e.g. "src/**/*.ts").',
      parameters: {
        type: 'object',
        properties: { pattern: str('Glob pattern.'), path: str('Optional sub-directory.') },
        required: ['pattern'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'grep',
      description: 'Search file contents by regular expression.',
      parameters: {
        type: 'object',
        properties: {
          pattern: str('JavaScript regular expression source.'),
          include: str('Glob filter for file paths, e.g. "*.ts".'),
          path: str('Directory to search (default project root).'),
          output_mode: { type: 'string', enum: ['content', 'files', 'count'], description: 'Default "content".' },
        },
        required: ['pattern'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Create or overwrite a file (creates parent directories). Mutating.',
      parameters: {
        type: 'object',
        properties: { path: str('Project-relative file path.'), content: str('Full file content.') },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'edit_file',
      description: 'Replace an exact string in a file. Mutating. Refuses if the target is absent or ambiguous unless replaceAll is set.',
      parameters: {
        type: 'object',
        properties: {
          path: str('Project-relative file path.'),
          oldString: str('Exact text to replace (must occur at least once).'),
          newString: str('Replacement text.'),
          replaceAll: { type: 'boolean', description: 'Replace every occurrence.' },
        },
        required: ['path', 'oldString', 'newString'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bash',
      description: 'Execute a shell command. Mutating. Returns stdout/stderr/exitCode.',
      parameters: {
        type: 'object',
        properties: {
          command: str('Shell command line.'),
          workdir: str('Working directory (default project root).'),
          timeout: { type: 'number', description: 'Timeout in ms (default 120000).' },
        },
        required: ['command'],
      },
    },
  },
];
```

### Task 3.3: tools/read.ts
**Files:** Create `src/tools/read.ts`, test `src/tools/read.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { readFileTool } from './read.js';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

test('reads file with line numbers', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-'));
  fs.writeFileSync(path.join(dir, 'a.txt'), 'foo\nbar');
  const r = await readFileTool.execute({ path: 'a.txt' }, { cwd: dir, requestPermission: async () => true });
  expect(r.isError).toBe(false);
  expect(r.content).toContain('1: foo');
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * read_file tool. Auto-approved (read-only).
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import fs from 'node:fs';
import { safeResolve, PathEscapeError } from '../fs/paths.js';
import { formatWithLineNumbers } from '../fs/reader.js';
import type { Tool, ToolResult } from '../agent/types.js';

async function execute(args: unknown, ctx: { cwd: string }): Promise<ToolResult> {
  const a = args as { path: string; offset?: number; limit?: number };
  let abs: string;
  try {
    abs = safeResolve(ctx.cwd, a.path);
  } catch (e) {
    return { content: (e as PathEscapeError).message, isError: true };
  }
  try {
    const text = fs.readFileSync(abs, 'utf8');
    const lines = text.split('\n');
    return { content: formatWithLineNumbers(lines, a.offset, a.limit), isError: false };
  } catch (e) {
    return { content: `Failed to read ${a.path}: ${(e as Error).message}`, isError: true };
  }
}

export const readFileTool: Tool = { name: 'read_file', execute, requiresPermission: false };
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 3.4: tools/write.ts
**Files:** Create `src/tools/write.ts`, test `src/tools/write.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { writeFileTool } from './write.js';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

test('writes file when approved', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-'));
  let asked = '';
  const r = await writeFileTool.execute(
    { path: 'sub/x.txt', content: 'hi' },
    { cwd: dir, requestPermission: async (d) => { asked = d; return true; } }
  );
  expect(r.isError).toBe(false);
  expect(fs.readFileSync(path.join(dir, 'sub', 'x.txt'), 'utf8')).toBe('hi');
  expect(asked).toContain('write_file');
});

test('refuses when denied', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-'));
  const r = await writeFileTool.execute(
    { path: 'x.txt', content: 'hi' },
    { cwd: dir, requestPermission: async () => false }
  );
  expect(r.isError).toBe(true);
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * write_file tool. Mutating — gated by requestPermission.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import fs from 'node:fs';
import path from 'node:path';
import { safeResolve, PathEscapeError } from '../fs/paths.js';
import type { Tool, ToolResult, ToolContext } from '../agent/types.js';

async function execute(args: unknown, ctx: ToolContext): Promise<ToolResult> {
  const a = args as { path: string; content: string };
  let abs: string;
  try {
    abs = safeResolve(ctx.cwd, a.path);
  } catch (e) {
    return { content: (e as PathEscapeError).message, isError: true };
  }
  const desc = `write_file: ${path.relative(ctx.cwd, abs)} (${a.content.length} bytes)`;
  if (!(await ctx.requestPermission(desc))) {
    return { content: 'User denied write_file.', isError: true };
  }
  try {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, a.content, 'utf8');
    return { content: `Wrote ${a.content.length} bytes to ${a.path}.`, isError: false };
  } catch (e) {
    return { content: `Failed to write: ${(e as Error).message}`, isError: true };
  }
}

export const writeFileTool: Tool = { name: 'write_file', execute, requiresPermission: true };
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 3.5: tools/edit.ts
**Files:** Create `src/tools/edit.ts`, test `src/tools/edit.test.ts`

- [ ] **Step 1: Write failing test** (not-found, ambiguous, replaceAll, happy path)

```ts
import { test, expect } from 'vitest';
import { editFileTool } from './edit.js';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const mk = (text: string) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-'));
  fs.writeFileSync(path.join(dir, 'f.txt'), text);
  return dir;
};
const allow = async () => true;

test('replaces single occurrence', async () => {
  const dir = mk('a\nb\nc');
  await editFileTool.execute({ path: 'f.txt', oldString: 'b', newString: 'B' }, { cwd: dir, requestPermission: allow });
  expect(fs.readFileSync(path.join(dir, 'f.txt'), 'utf8')).toBe('a\nB\nc');
});
test('errors when not found', async () => {
  const dir = mk('a\nb');
  const r = await editFileTool.execute({ path: 'f.txt', oldString: 'z', newString: 'Z' }, { cwd: dir, requestPermission: allow });
  expect(r.isError).toBe(true);
  expect(r.content).toContain('not found');
});
test('errors on ambiguous without replaceAll', async () => {
  const dir = mk('x\nx');
  const r = await editFileTool.execute({ path: 'f.txt', oldString: 'x', newString: 'y' }, { cwd: dir, requestPermission: allow });
  expect(r.isError).toBe(true);
  expect(r.content).toContain('am');
});
test('replaceAll replaces every occurrence', async () => {
  const dir = mk('x\nx');
  await editFileTool.execute({ path: 'f.txt', oldString: 'x', newString: 'y', replaceAll: true }, { cwd: dir, requestPermission: allow });
  expect(fs.readFileSync(path.join(dir, 'f.txt'), 'utf8')).toBe('y\ny');
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * edit_file tool. Mutating — gated. Performs exact-string replacement and
 * refuses on absence or ambiguity (unless replaceAll). Shows a unified diff
 * in the permission description so the user can preview the change.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import fs from 'node:fs';
import path from 'node:path';
import { safeResolve, PathEscapeError } from '../fs/paths.js';
import { unifiedDiff } from '../util/diff.js';
import type { Tool, ToolResult, ToolContext } from '../agent/types.js';

async function execute(args: unknown, ctx: ToolContext): Promise<ToolResult> {
  const a = args as { path: string; oldString: string; newString: string; replaceAll?: boolean };
  let abs: string;
  try {
    abs = safeResolve(ctx.cwd, a.path);
  } catch (e) {
    return { content: (e as PathEscapeError).message, isError: true };
  }
  let original: string;
  try {
    original = fs.readFileSync(abs, 'utf8');
  } catch (e) {
    return { content: `Failed to read ${a.path}: ${(e as Error).message}`, isError: true };
  }
  const occurrences = original.split(a.oldString).length - 1;
  if (occurrences === 0) return { content: `edit_file: oldString not found in ${a.path}.`, isError: true };
  if (occurrences > 1 && !a.replaceAll) {
    return { content: `edit_file: oldString is ambiguous (${occurrences} matches) in ${a.path}; set replaceAll:true to replace all.`, isError: true };
  }
  const updated = a.replaceAll
    ? original.split(a.oldString).join(a.newString)
    : original.replace(a.oldString, a.newString);
  const desc = `edit_file: ${path.relative(ctx.cwd, abs)}\n${unifiedDiff(original, updated)}`;
  if (!(await ctx.requestPermission(desc))) {
    return { content: 'User denied edit_file.', isError: true };
  }
  try {
    fs.writeFileSync(abs, updated, 'utf8');
    return { content: `Edited ${a.path} (${occurrences} occurrence(s)).`, isError: false };
  } catch (e) {
    return { content: `Failed to write: ${(e as Error).message}`, isError: true };
  }
}

export const editFileTool: Tool = { name: 'edit_file', execute, requiresPermission: true };
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 3.6: tools/glob.ts
**Files:** Create `src/tools/glob.ts`, test `src/tools/glob.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { globTool } from './glob.js';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

test('matches ts files', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-'));
  fs.writeFileSync(path.join(dir, 'a.ts'), ''); fs.writeFileSync(path.join(dir, 'b.txt'), '');
  const r = await globTool.execute({ pattern: '*.ts' }, { cwd: dir, requestPermission: async () => true });
  expect(r.content).toContain('a.ts');
  expect(r.content).not.toContain('b.txt');
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * glob tool — find files by pattern. Read-only.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import fastGlob from 'fast-glob';
import path from 'node:path';
import type { Tool, ToolResult, ToolContext } from '../agent/types.js';

async function execute(args: unknown, ctx: ToolContext): Promise<ToolResult> {
  const a = args as { pattern: string; path?: string };
  const base = a.path ? path.resolve(ctx.cwd, a.path) : ctx.cwd;
  try {
    const matches = await fastGlob(a.pattern, { cwd: base, dot: false });
    const sorted = matches.slice().sort();
    return { content: sorted.length ? sorted.join('\n') : 'No matches.', isError: false };
  } catch (e) {
    return { content: `glob failed: ${(e as Error).message}`, isError: true };
  }
}

export const globTool: Tool = { name: 'glob', execute, requiresPermission: false };
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 3.7: tools/grep.ts
**Files:** Create `src/tools/grep.ts`, test `src/tools/grep.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { grepTool } from './grep.js';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

test('content mode returns matching line', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-'));
  fs.writeFileSync(path.join(dir, 'a.txt'), 'hello\nworld');
  const r = await grepTool.execute({ pattern: 'wor' }, { cwd: dir, requestPermission: async () => true });
  expect(r.content).toContain('a.txt');
  expect(r.content).toContain('world');
});
test('files mode returns file list', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-'));
  fs.writeFileSync(path.join(dir, 'a.txt'), 'hello');
  const r = await grepTool.execute({ pattern: 'hel', output_mode: 'files' }, { cwd: dir, requestPermission: async () => true });
  expect(r.content.trim()).toBe('a.txt');
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * grep tool — regex content search. Read-only.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import fastGlob from 'fast-glob';
import fs from 'node:fs';
import path from 'node:path';
import type { Tool, ToolResult, ToolContext } from '../agent/types.js';

type Mode = 'content' | 'files' | 'count';

async function execute(args: unknown, ctx: ToolContext): Promise<ToolResult> {
  const a = args as { pattern: string; include?: string; path?: string; output_mode?: Mode };
  const mode: Mode = a.output_mode ?? 'content';
  const base = a.path ? path.resolve(ctx.cwd, a.path) : ctx.cwd;
  let regex: RegExp;
  try {
    regex = new RegExp(a.pattern);
  } catch (e) {
    return { content: `Invalid regex: ${(e as Error).message}`, isError: true };
  }
  try {
    const files = await fastGlob(a.include ?? '**/*', { cwd: base, dot: false, onlyFiles: true });
    const out: string[] = [];
    const matchedFiles: string[] = [];
    let total = 0;
    for (const rel of files.sort()) {
      const abs = path.resolve(base, rel);
      let text: string;
      try {
        text = fs.readFileSync(abs, 'utf8');
      } catch {
        continue; // skip binary/unreadable
      }
      const lines = text.split('\n');
      let fileHit = false;
      lines.forEach((line, i) => {
        if (regex.test(line)) {
          total++;
          fileHit = true;
          if (mode === 'content') out.push(`${rel}:${i + 1}: ${line}`);
        }
      });
      if (fileHit) matchedFiles.push(rel);
    }
    if (mode === 'files') return { content: matchedFiles.join('\n') || 'No matches.', isError: false };
    if (mode === 'count') return { content: String(total), isError: false };
    return { content: out.join('\n') || 'No matches.', isError: false };
  } catch (e) {
    return { content: `grep failed: ${(e as Error).message}`, isError: true };
  }
}

export const grepTool: Tool = { name: 'grep', execute, requiresPermission: false };
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 3.8: tools/bash.ts
**Files:** Create `src/tools/bash.ts`, test `src/tools/bash.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { bashTool } from './bash.js';

test('runs command when approved', async () => {
  const r = await bashTool.execute(
    { command: 'echo hi' },
    { cwd: process.cwd(), requestPermission: async () => true }
  );
  expect(r.isError).toBe(false);
  expect(r.content).toContain('hi');
});
test('refuses when denied', async () => {
  const r = await bashTool.execute(
    { command: 'echo hi' },
    { cwd: process.cwd(), requestPermission: async () => false }
  );
  expect(r.isError).toBe(true);
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * bash tool. Mutating — gated. The full command is included in the
 * permission description so the user sees exactly what will run.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import path from 'node:path';
import { runCommand } from '../shell/runner.js';
import type { Tool, ToolResult, ToolContext } from '../agent/types.js';

async function execute(args: unknown, ctx: ToolContext): Promise<ToolResult> {
  const a = args as { command: string; workdir?: string; timeout?: number };
  const workdir = a.workdir ? path.resolve(ctx.cwd, a.workdir) : ctx.cwd;
  if (!(await ctx.requestPermission(`bash: ${a.command}`))) {
    return { content: 'User denied bash.', isError: true };
  }
  try {
    const r = await runCommand(a.command, { cwd: workdir, timeoutMs: a.timeout });
    const body = `exit: ${r.exitCode}\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}`;
    return { content: body, isError: r.exitCode !== 0 };
  } catch (e) {
    return { content: `bash failed: ${(e as Error).message}`, isError: true };
  }
}

export const bashTool: Tool = { name: 'bash', execute, requiresPermission: true };
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 3.9: tools/registry.ts
**Files:** Create `src/tools/registry.ts`, test `src/tools/registry.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { test, expect } from 'vitest';
import { registry } from './registry.js';

test('exposes all 6 tools', () => {
  const names = registry.schemas().map((t) => t.function.name).sort();
  expect(names).toEqual(['bash', 'edit_file', 'glob', 'grep', 'read_file', 'write_file']);
});
test('dispatches by name', async () => {
  const t = registry.get('read_file');
  expect(t?.requiresPermission).toBe(false);
});
test('unknown tool returns undefined', () => {
  expect(registry.get('nope')).toBeUndefined();
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * Tool registry: maps tool names -> executors and exposes the OpenAI tool
 * schemas. Single source of truth wiring tools into the agent loop.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import type { Tool } from '../agent/types.js';
import { TOOL_SCHEMAS } from './schema.js';
import { readFileTool } from './read.js';
import { writeFileTool } from './write.js';
import { editFileTool } from './edit.js';
import { globTool } from './glob.js';
import { grepTool } from './grep.js';
import { bashTool } from './bash.js';

const TOOLS: Record<string, Tool> = {
  read_file: readFileTool,
  write_file: writeFileTool,
  edit_file: editFileTool,
  glob: globTool,
  grep: grepTool,
  bash: bashTool,
};

export const registry = {
  schemas(): ChatCompletionTool[] {
    return TOOL_SCHEMAS;
  },
  get(name: string): Tool | undefined {
    return TOOLS[name];
  },
};
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

---

## Milestone 4 — Agent

### Task 4.1: agent/context.ts
**Files:** Create `src/agent/context.ts`

- [ ] **Step 1: Implement**

```ts
/**
 * System prompt + conversation assembly for the agent loop.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const SYSTEM_PROMPT = `You are DaoismCode, an agentic coding assistant running in the user's terminal.
Rules:
1. Before editing code, explore with read_file / grep / glob.
2. Prefer edit_file over write_file for existing files.
3. Never fabricate file contents; read first when unsure.
4. All file operations are constrained to the project root.
5. Use bash to run tests/builds to verify your changes.
6. Summarize changes briefly when done.
7. If a requirement is unclear, ask the user first.`;

export function buildMessages(userInput: string): ChatCompletionMessageParam[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userInput },
  ];
}
```

### Task 4.2: agent/loop.ts (critical)
**Files:** Create `src/agent/loop.ts`, test `src/agent/loop.test.ts`

- [ ] **Step 1: Write failing test** — drive the loop with a FAKE streamer (no network) that returns one tool_call then a final text:

```ts
import { test, expect } from 'vitest';
import { agentLoop } from './loop.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// A fake streamer simulating: turn1 -> tool_call(read_file); turn2 -> final text.
function fakeStreamer() {
  let calls = 0;
  return async () => {
    calls++;
    if (calls === 1) {
      return {
        content: '',
        toolCalls: [
          { id: 'c1', type: 'function' as const, function: { name: 'read_file', arguments: '{"path":"x"}' } },
        ],
      };
    }
    return { content: 'DONE', toolCalls: [] };
  };
}

test('runs tool then terminates on text-only turn', async () => {
  const seen: string[] = [];
  const result = await agentLoop({
    initialMessages: [{ role: 'user', content: 'do it' }] as ChatCompletionMessageParam[],
    streamChat: fakeStreamer(),
    tools: [],
    maxSteps: 5,
    onToken: (t) => seen.push(t),
    ctx: { cwd: process.cwd(), requestPermission: async () => true },
  });
  expect(result.finalText).toBe('DONE');
  expect(seen.join('')).toBe('DONE');
  expect(result.steps).toBe(2);
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**

```ts
/**
 * The core agentic loop. Streams one assistant turn per iteration, executes
 * any tool calls, feeds results back, and repeats until the model emits a
 * text-only turn (done) or the step budget is exhausted.
 *
 * Tool errors are returned to the model (not thrown) so it can self-correct.
 * LLM/API errors are retried (429/network) or surfaced to the user (401/400).
 *
 * `streamChat` is injected so the loop is fully testable without network.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import { parseToolCall, type ToolContext, type ToolResult } from './types.js';
import { registry } from '../tools/registry.js';

export interface StreamChatFn {
  (params: {
    messages: ChatCompletionMessageParam[];
    tools: ChatCompletionTool[];
  }): Promise<{ content: string; toolCalls: import('openai/resources/chat/completions').ChatCompletionMessageToolCall[] }>;
}

export interface AgentLoopParams {
  initialMessages: ChatCompletionMessageParam[];
  streamChat: StreamChatFn;
  tools: ChatCompletionTool[];
  maxSteps: number;
  onToken?: (token: string) => void;
  ctx: ToolContext;
}

export interface AgentLoopResult {
  finalText: string;
  steps: number;
  budgetExhausted: boolean;
}

export async function agentLoop(p: AgentLoopParams): Promise<AgentLoopResult> {
  const messages: ChatCompletionMessageParam[] = [...p.initialMessages];
  let lastText = '';
  for (let step = 1; step <= p.maxSteps; step++) {
    const turn = await p.streamChat({ messages, tools: p.tools });
    const assistantMsg: ChatCompletionMessageParam = {
      role: 'assistant',
      content: turn.content || null,
      tool_calls: turn.toolCalls.length ? turn.toolCalls : undefined,
    };
    messages.push(assistantMsg);
    if (turn.content) lastText = turn.content;

    if (turn.toolCalls.length === 0) {
      return { finalText: lastText, steps: step, budgetExhausted: false };
    }
    for (const tc of turn.toolCalls) {
      const parsed = parseToolCall(tc);
      const tool = registry.get(parsed.name);
      let result: ToolResult;
      if (!tool) {
        result = { content: `Unknown tool: ${parsed.name}`, isError: true };
      } else {
        result = await tool.execute(parsed.args, p.ctx);
      }
      messages.push({ role: 'tool', tool_call_id: parsed.id, content: result.content });
    }
  }
  return { finalText: lastText, steps: p.maxSteps, budgetExhausted: true };
}
```

- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Save Checkpoint.**

### Task 4.3: Wire real streamChat adapter
**Files:** Create `src/agent/run.ts`

- [ ] **Step 1: Implement** — adapt `streamChat` (LLM) to the loop's injected signature, adding retry for 429/network:

```ts
/**
 * Wires the real LLM client into the agent loop and applies the API-error
 * retry policy (exponential backoff on 429/network; immediate surface on
 * 401/400). Bridges src/llm/stream.ts -> src/agent/loop.ts.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import type OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { streamChat as llmStreamChat } from '../llm/stream.js';
import { registry } from '../tools/registry.js';
import { agentLoop, type AgentLoopResult } from './loop.js';
import type { ToolContext } from './types.js';
import { initLogger } from '../util/log.js';

const MAX_RETRIES = 3;

function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0;
  const tryOnce = async (): Promise<T> => {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      const msg = (e as Error).message;
      const retriable = /429|rate|network|timeout|econnreset|fetch failed/i.test(msg);
      if (!retriable || attempt >= MAX_RETRIES) throw e;
      await new Promise((r) => setTimeout(r, 2 ** attempt * 500));
      return tryOnce();
    }
  };
  return tryOnce();
}

export async function runAgent(params: {
  client: OpenAI;
  model: string;
  initialMessages: ChatCompletionMessageParam[];
  onToken?: (t: string) => void;
  ctx: ToolContext;
  maxSteps: number;
}): Promise<AgentLoopResult> {
  const tools = registry.schemas();
  initLogger(params.ctx.cwd);
  return agentLoop({
    initialMessages: params.initialMessages,
    tools,
    maxSteps: params.maxSteps,
    onToken: params.onToken,
    ctx: params.ctx,
    streamChat: async (sp: { messages: ChatCompletionMessageParam[]; tools: ChatCompletionTool[] }) =>
      withRetry(() => llmStreamChat({ client: params.client, model: params.model, messages: sp.messages, tools: sp.tools, onToken: params.onToken })),
  });
}
```

- [ ] **Step 2: Save Checkpoint.**

---

## Milestone 5 — CLI

### Task 5.1: cli/permission.ts
**Files:** Create `src/cli/permission.ts`

- [ ] **Step 1: Implement**

```ts
/**
 * Interactive permission gate. Mutating tools call requestPermission();
 * the user answers y/n/a/e. "a" allowlists everything for the session
 * (in-memory only, never persisted).
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import chalk from 'chalk';

let allowAll = false;

export function resetPermissionState(): void {
  allowAll = false;
}

export async function requestPermission(description: string): Promise<boolean> {
  if (allowAll) return true;
  const rl = readline.createInterface({ input, output });
  console.log(chalk.cyan('\n--- permission required ---'));
  console.log(description);
  const ans = (await rl.question(chalk.yellow('Approve? [y]es / [n]o / [a]ll / [e]dit: '))).trim().toLowerCase();
  rl.close();
  switch (ans) {
    case 'y':
      return true;
    case 'a':
      allowAll = true;
      return true;
    case 'n':
    case 'e':
    default:
      return false;
  }
}
```

### Task 5.2: cli/render.ts
**Files:** Create `src/cli/render.ts`

- [ ] **Step 1: Implement**

```ts
/**
 * Output rendering: stream raw tokens live, then pretty-print the final
 * assistant message as terminal Markdown.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import { marked } from 'marked';
import markedTerminal from 'marked-terminal';
import chalk from 'chalk';

marked.setOptions({ renderer: new markedTerminal() });

export function renderToken(token: string): void {
  process.stdout.write(token);
}

export function renderFinal(text: string): void {
  process.stdout.write('\n');
  try {
    console.log(marked.parse(text) as string);
  } catch {
    console.log(text);
  }
}

export function info(msg: string): void {
  console.log(chalk.dim(msg));
}
```

### Task 5.3: cli/repl.ts
**Files:** Create `src/cli/repl.ts`

- [ ] **Step 1: Implement**

```ts
/**
 * Interactive REPL: read user input line-by-line, run the agent loop,
 * render streamed + final output, repeat.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import chalk from 'chalk';
import type OpenAI from 'openai';
import { buildMessages } from '../agent/context.js';
import { runAgent } from '../agent/run.js';
import { renderToken, renderFinal, info } from './render.js';
import { requestPermission } from './permission.js';
import type { AppConfig } from '../config/index.js';

export async function startRepl(cfg: AppConfig, client: OpenAI): Promise<void> {
  const rl = readline.createInterface({ input, output, prompt: chalk.green('daoism> ') });
  info(`DaoismCode • model=${cfg.model} • cwd=${cfg.cwd}  (Ctrl+C to exit)`);
  rl.prompt();
  rl.on('line', async (line) => {
    const text = line.trim();
    if (!text) return rl.prompt();
    try {
      const result = await runAgent({
        client,
        model: cfg.model,
        initialMessages: buildMessages(text),
        ctx: { cwd: cfg.cwd, requestPermission: cfg.skipPermissions ? async () => true : requestPermission },
        maxSteps: cfg.maxSteps,
        onToken: renderToken,
      });
      renderFinal(result.finalText);
      if (result.budgetExhausted) info(chalk.yellow('Step budget exhausted; stopping.'));
    } catch (e) {
      console.error(chalk.red(`Error: ${(e as Error).message}`));
    }
    rl.prompt();
  });
  rl.on('SIGINT', () => {
    console.log('\nbye.');
    process.exit(0);
  });
}
```

### Task 5.4: src/index.ts (commander entry)
**Files:** Create `src/index.ts`

- [ ] **Step 1: Implement**

```ts
#!/usr/bin/env node
/**
 * DaoismCode CLI entry. Parses args, resolves config, builds the LLM client,
 * and dispatches to either the interactive REPL or a one-shot `run`.
 * @author jumpingbirds <guodaochong@gmail.com>
 */
import { Command } from 'commander';
import { resolveConfig } from './config/index.js';
import { makeClient } from './llm/client.js';
import { startRepl } from './cli/repl.js';
import { buildMessages } from './agent/context.js';
import { runAgent } from './agent/run.js';
import { renderToken, renderFinal, info } from './cli/render.js';
import { requestPermission } from './cli/permission.js';

const program = new Command();

program
  .name('daoism')
  .description('Terminal CLI coding agent powered by GLM')
  .version('0.1.0')
  .option('--model <id>', 'GLM model id')
  .option('--base-url <url>', 'LLM base URL')
  .option('--cwd <path>', 'project root', process.cwd())
  .option('--dangerously-skip-permissions', 'auto-approve all tools', false);

program
  .command('run <prompt>')
  .description('Run a single prompt non-interactively')
  .action(async (prompt: string) => {
    const opts = program.opts();
    const cfg = resolveConfig({ env: process.env, cwd: process.cwd(), flags: opts });
    const client = makeClient(cfg);
    const result = await runAgent({
      client,
      model: cfg.model,
      initialMessages: buildMessages(prompt),
      ctx: { cwd: cfg.cwd, requestPermission: cfg.skipPermissions ? async () => true : requestPermission },
      maxSteps: cfg.maxSteps,
      onToken: renderToken,
    });
    renderFinal(result.finalText);
    if (result.budgetExhausted) info('Step budget exhausted; stopping.');
    process.exit(result.budgetExhausted ? 1 : 0);
  });

program.action(async () => {
  // default: REPL
  const opts = program.opts();
  const cfg = resolveConfig({ env: process.env, cwd: process.cwd(), flags: opts });
  if (!cfg.apiKey) {
    console.error('DAOISM_API_KEY is not set. Get one at https://open.bigmodel.cn and export DAOISM_API_KEY=...');
    process.exit(1);
  }
  const client = makeClient(cfg);
  await startRepl(cfg, client);
});

program.parseAsync(process.argv).catch((e: unknown) => {
  console.error((e as Error).message);
  process.exit(1);
});
```

- [ ] **Step 2: Save Checkpoint.**

### Task 5.5: Integration smoke test (manual, needs key)
**Files:** (no new file)

- [ ] **Step 1:** `pnpm typecheck && pnpm lint && pnpm test` → all green.
- [ ] **Step 2:** `pnpm build` → `dist/daoism.js` produced.
- [ ] **Step 3 (manual, with real key):** `set DAOISM_API_KEY=... && pnpm dev` → REPL starts, model streams. If 401, re-run probe (Task 2.3) and fix `DEFAULT_MODEL`/baseUrl.
- [ ] **Step 4 (manual):** Ask it: "list the .ts files in src and read index.ts" → should use glob+read. Then "add a comment to index.ts" → should propose edit_file, you approve `[y]`.
- [ ] **Step 5:** Verify Definition of Done (spec §10) all met.

---

## Self-Review

**1. Spec coverage:**
- §1 CLI/TUI ✓ (M5) · TS/Node ✓ (M0) · GLM Coding Plan ✓ (M2 + coding endpoint default in M1.5)
- §3 layered arch ✓ (file map) · §4 agent loop ✓ (M4.2) incl. multi-tool batch, error-as-result, step budget, LLM API retry (M4.3) · §4.2 stream aggregation ✓ (M2.2)
- §5 6 tools ✓ (M3.3–3.8) · path safety ✓ (M1.1, used by read/write/edit/glob/grep)
- §6 permission model ✓ (M3.4/3.5/3.8 + M5.1) incl. y/n/a/e + skip flag
- §7 config precedence ✓ (M1.5) · coding endpoint default ✓ (M1.5) · first-run no-key exit ✓ (M5.4)
- §8 system prompt ✓ (M4.1) · §9 CLI surface ✓ (M5.4: repl default + run + flags)
- §10 DoD ✓ (M5.5)
- §11 constraints (English comments, author header, no as-any) ✓ (conventions + strict tsconfig)

**2. Placeholder scan:** None. All code blocks complete. `Task 2.3`/`5.5` model-ID probe & smoke test are intentionally manual (require real key) — not placeholders, they are verification gates.

**3. Type consistency:** `Tool`/`ToolResult`/`ToolContext` defined in `agent/types.ts` (M3.1) and used consistently across tools & loop. `StreamChatFn` (loop) matches `run.ts` adapter. `AccumulatedToolCall` = SDK `ChatCompletionMessageToolCall`. `AppConfig` fields (`apiKey`/`baseUrl`/`model`/`maxSteps`/`skipPermissions`/`cwd`) used consistently in client/repl/index.

No gaps found. Plan ready.

---

## Amendments (2026-06-25) — AUTHORITATIVE, override earlier GLM-specific text

**A1 — Provider-neutral LLM layer (NOT hardcoded to GLM).** The LLM layer is
provider-agnostic: the `openai` SDK hits ANY OpenAI-compatible endpoint. A
`PROVIDERS` preset map (already inserted into Task M1.5 `src/config/index.ts`)
selects default baseUrl+model per provider via `DAOISM_PROVIDER` (default `glm`).
Explicit `DAOISM_BASE_URL` / `DAOISM_MODEL` / `DAOISM_API_KEY` ALWAYS override
the preset. Required follow-throughs:
- Add `provider: ProviderName` to the `AppConfig` interface and the returned object.
- `src/llm/client.ts` (M2) must contain ZERO GLM-specific code — it only builds
  an OpenAI client from resolved `baseUrl`/`apiKey`. Update its header comment to
  say "provider-neutral".
- `makeClient(cfg)` is unchanged in shape.

**A2 — Default model = `glm-5.2`** (Coding-Plan model). Anywhere the plan still
reads `glm-4.6`, use `glm-5.2`. The `glm` preset already sets this.

**A3 — Multi-provider support is IN v1 scope** (supersedes spec §13 which listed
it out-of-scope). Non-OpenAI-compatible *native* providers (Anthropic/Google
native SDKs) remain future work — they'd need an adapter; the OpenAI-compatible
abstraction already covers GLM / OpenAI / DeepSeek / Moonshot / local Ollama &
vLLM.

**A4 — Config test update.** The M1.5 test `env overrides defaults` should assert
`cfg.provider === 'glm'` by default and that setting `DAOISM_PROVIDER='openai'`
yields `cfg.baseUrl` containing `api.openai.com`.
