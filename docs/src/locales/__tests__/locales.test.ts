import { describe, expect, test } from 'vitest'
import en from '../en.json'
import zh from '../zh.json'
import { getMessages, resolveLocale } from '../index'
import { defaultLocale, localeDefinitions } from '../config'

const getShape = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(getShape)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, getShape(item)]))
  }
  expect(typeof value).toBe('string')
  expect((value as string).trim().length).toBeGreaterThan(0)
  return 'string'
}

describe('shared website locales', () => {
  test('keeps both dictionaries complete, including nested messages and lists', () => {
    expect(getShape(zh)).toEqual(getShape(en))
    expect(zh.examples.scenarios.map(({ id }) => id)).toEqual(en.examples.scenarios.map(({ id }) => id))
    for (const locale of Object.keys(localeDefinitions)) {
      expect(resolveLocale(locale)).toBe(locale)
    }
  })

  test.each([
    ['en-US', 'en'], ['zh-CN', 'zh'], ['ZH_cn', 'zh'],
    [undefined, defaultLocale], ['fr', defaultLocale], ['__proto__', defaultLocale],
  ])('resolves %s with the common fallback', (input, expected) => {
    expect(resolveLocale(input)).toBe(expected)
    expect(getMessages(input)).toBe(expected === 'zh' ? zh : en)
  })
})
