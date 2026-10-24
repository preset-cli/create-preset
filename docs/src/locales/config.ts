export const defaultLocale = 'en'

export const localeDefinitions = {
  en: { code: 'en', lang: 'en-US', label: 'English' },
  zh: { code: 'zh', lang: 'zh-CN', label: '简体中文' },
} as const

export type Locale = keyof typeof localeDefinitions
