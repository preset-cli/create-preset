import en from './en.json'
import zh from './zh.json'
import { defaultLocale, type Locale } from './config'

export type { Locale } from './config'
export type Messages = typeof en

const messages = { en, zh } satisfies Record<Locale, Messages>

export const resolveLocale = (locale?: string): Locale => {
  const language = locale?.toLowerCase().split(/[-_]/)[0] ?? defaultLocale
  return Object.hasOwn(messages, language) ? language as Locale : defaultLocale
}

export const getMessages = (locale?: string): Messages => messages[resolveLocale(locale)]
