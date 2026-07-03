# 插件系统

> 在 `.daoismcode/plugins/` 目录放一个 `.ts` 或 `.js` 文件——启动时自动加载，获得自定义工具、命令和 hook。

## 快速开始

```typescript
// .daoismcode/plugins/my-plugin.ts
export default {
  name: 'my-plugin',
  commands: [{
    name: '/deploy',
    description: 'Deploy to staging',
    async execute(args: string, ctx) {
      // 你的自定义逻辑
      return 'Deployed to staging!';
    }
  }],
  tools: [{
    name: 'run_migrations',
    requiresPermission: true,
    async execute(args, ctx) {
      // 执行数据库迁移
      return { content: 'Migrations complete', isError: false };
    }
  }],
  hooks: {
    PostEdit: async (ctx) => {
      // 编辑后自动格式化
      return { injected: null, blocked: false };
    }
  }
}
```

重启 DaoismCode → 你的 `/deploy` 命令和 `run_migrations` 工具立即可用。

## 插件接口

```typescript
interface Plugin {
  name: string;
  tools?: Tool[];           // 自定义工具（注册到 registry）
  commands?: Array<{        // 自定义命令（注册到 TUI）
    name: string;
    description: string;
    execute: (args: string, ctx: ToolContext) => Promise<string>;
  }>;
  hooks?: Record<string, (ctx: unknown) => Promise<unknown>>;
}
```

## 使用场景

- **团队工作流**：`/deploy`、`/ticket`、`/review-pr`
- **自定义检查**：PostEdit hook 自动运行 prettier/eslint
- **集成工具**：连接内部 API、CI 系统、部署平台
- **代码生成**：项目专属模板生成器

## 安全警告

⚠️ 插件文件在启动时**作为代码执行**。只安装你信任的插件。DaoismCode 的系统提示词中包含安全规则：

```
NEVER write files to .daoismcode/plugins/ unless explicitly asked by the user.
Plugin files are executed as code on next startup.
```

Agent 不会自动创建插件文件，除非你明确要求。
