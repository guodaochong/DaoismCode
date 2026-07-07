import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'DaoismCode',
  description: '道 — 终端原生的 AI 全自动软件工程师',

  base: '/DaoismCode/',

  head: [
    ['meta', { name: 'theme-color', content: '#7c3aed' }],
    ['meta', { property: 'og:title', content: 'DaoismCode — 是生万象' }],
    ['meta', { property: 'og:description', content: '终端原生的 AI 全自动软件工程师 · 六引擎智能路由 · 自主验证循环 · 语义代码搜索' }],
    ['meta', { property: 'og:type', content: 'website' }],
  ],

  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    siteTitle: '道 DaoismCode',

    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '四境智能路由', link: '/guide/smart-routing' },
          { text: '自主工程循环', link: '/guide/agentic-loop' },
          { text: '语义代码搜索', link: '/guide/semantic-search' },
          { text: '并行子智能体', link: '/guide/parallel-agents' },
          { text: '反思记忆系统', link: '/guide/reflexion-memory' },
          { text: '多模态视觉', link: '/guide/vision' },
          { text: 'Sisyphus 模式', link: '/guide/sisyphus' },
          { text: 'Git 考古 /why', link: '/guide/git-archaeology' },
          { text: '调用链追踪 /flow', link: '/guide/flow-trace' },
          { text: '代码守护者 /guard', link: '/guide/guardian' },
          { text: '多智能体协作 /team', link: '/guide/team' },
          { text: '增量上下文压缩', link: '/guide/incremental-compaction' },
          { text: '工具链学习', link: '/guide/tool-chains' },
          { text: '智能跳转 /jump', link: '/guide/smart-jump' },
          { text: 'PR生成 /pr', link: '/guide/pr-gen' },
          { text: '目标/时间循环', link: '/guide/goal-loop' },
          { text: '保存即修复 /watch', link: '/guide/watch' },
          { text: '神经仪表盘 /dash', link: '/guide/dashboard' },
          { text: '插件系统', link: '/guide/plugins' },
          { text: 'MCP市场', link: '/guide/mcp-market' },
        ],
      },
      {
        text: '参考',
        items: [
          { text: '工具列表 (31)', link: '/guide/tools' },
          { text: '命令列表 (36)', link: '/guide/commands' },
          { text: '技术白皮书', link: '/technical-report' },
        ],
      },
      { text: 'GitHub', link: 'https://github.com/jumpingbirds/DaoismCode-AI' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
          ],
        },
        {
          text: '核心能力',
          items: [
            { text: '四境智能路由', link: '/guide/smart-routing' },
            { text: '自主工程循环', link: '/guide/agentic-loop' },
            { text: '语义代码搜索', link: '/guide/semantic-search' },
            { text: '并行子智能体', link: '/guide/parallel-agents' },
            { text: '反思记忆系统', link: '/guide/reflexion-memory' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '多模态视觉', link: '/guide/vision' },
            { text: 'Sisyphus 模式', link: '/guide/sisyphus' },
            { text: 'Git 考古 /why', link: '/guide/git-archaeology' },
            { text: '调用链追踪 /flow', link: '/guide/flow-trace' },
            { text: '代码守护者 /guard', link: '/guide/guardian' },
            { text: '多智能体协作 /team', link: '/guide/team' },
          ],
        },
        {
          text: '智能进化',
          items: [
            { text: '增量上下文压缩', link: '/guide/incremental-compaction' },
            { text: '工具链学习', link: '/guide/tool-chains' },
            { text: '智能跳转 /jump', link: '/guide/smart-jump' },
            { text: 'PR生成 /pr', link: '/guide/pr-gen' },
            { text: '目标驱动/时间驱动循环', link: '/guide/goal-loop' },
            { text: '保存即修复 /watch', link: '/guide/watch' },
            { text: '神经仪表盘 /dash', link: '/guide/dashboard' },
            { text: '插件系统', link: '/guide/plugins' },
            { text: 'MCP市场', link: '/guide/mcp-market' },
          ],
        },
        {
          text: '参考',
          items: [
            { text: '工具列表 (31)', link: '/guide/tools' },
            { text: '命令列表 (36)', link: '/guide/commands' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jumpingbirds/DaoismCode-AI' },
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
            },
          },
        },
      },
    },

    outline: {
      label: '本页导航',
      level: [2, 3],
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    lastUpdatedText: '最后更新',

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 jumpingbirds',
    },

    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
  },
})
