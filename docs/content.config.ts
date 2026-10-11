import { type DocsContentConfig } from '@blackwork/docs'

export const docsContentConfig = {
  root: 'src/contents',
  defaultLocale: 'en',
  enableDefaultLocaleRedirect: true,
  locales: {
    en: {
      code: 'en',
      lang: 'en-US',
      label: 'English',
    },
    zh: {
      code: 'zh',
      lang: 'zh-CN',
      label: '简体中文',
    },
  },
  sections: {
    showcase: { layout: 'content' },
    examples: {
      layout: 'docs',
      sidebar: [
        {
          type: 'group',
          label: { en: 'Examples', zh: '使用示例' },
          items: [
            { type: 'item', href: '/examples', label: { en: 'Overview', zh: '示例概览' } },
            { type: 'item', href: '/examples/variants', label: { en: 'Template variants', zh: '同一模板，不同版本' } },
            { type: 'item', href: '/examples/skills', label: { en: 'Shared skills', zh: '复用常用 Skills' } },
            { type: 'item', href: '/examples/monorepo', label: { en: 'Extract from a monorepo', zh: '提取 monorepo 子项目' } },
            { type: 'item', href: '/examples/file-changes', label: { en: 'Edit files during creation', zh: '创建时调整文件' } },
          ],
        },
      ],
    },
    guide: {
      layout: 'docs',
      sidebar: [
        {
          type: 'group',
          label: {
            en: 'Start here',
            zh: '开始使用',
          },
          items: [
            {
              type: 'item',
              href: '/guide/getting-started',
              label: {
                en: 'Quickstart',
                zh: '快速开始',
              },
            },
            {
              type: 'item',
              href: '/guide/official-generators',
              label: {
                en: 'Official generators',
                zh: '官方脚手架',
              },
            },
          ],
        },
        {
          type: 'group',
          label: {
            en: 'Configuration reference',
            zh: '配置参考',
          },
          items: [
            {
              type: 'item',
              href: '/guide/private-presets',
              label: {
                en: 'Private presets',
                zh: '私有 Preset',
              },
            },
            {
              type: 'item',
              href: '/guide/preset-configs',
              label: {
                en: 'Preset configs',
                zh: 'Preset 配置',
              },
            },
          ],
        },
        {
          type: 'group',
          label: {
            en: 'Migration',
            zh: '版本迁移',
          },
          items: [
            {
              type: 'item',
              href: '/guide/migration',
              label: {
                en: 'Migration to 1.0',
                zh: '迁移到 1.0',
              },
            },
          ],
        },
      ],
    },
  },
} satisfies DocsContentConfig
