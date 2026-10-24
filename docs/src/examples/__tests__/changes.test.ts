import { describe, expect, test } from 'vitest'
import { changedLines, sourceChange } from '../changes'

describe('example change annotations', () => {
  test('does not mark retained lines after a removed import', () => {
    expect(changedLines("import './analytics'\nstart()\n", 'start()\n')).toEqual({ before: [0], after: [] })
  })

  test('matches repeated lines in order when content is inserted', () => {
    expect(changedLines('a\nb\na\n', 'a\nx\nb\na\n')).toEqual({ before: [], after: [1] })
  })

  test('highlights the two sides of a replacement', () => {
    expect(changedLines('APP=Starter\n', 'APP=Team\n')).toEqual({ before: [0], after: [0] })
  })

  test('distinguishes excluded files from files outside the selected directory', () => {
    expect(sourceChange('apps/docs/test.ts', 'test()\n', 'apps/docs', {})).toEqual({ kind: 'removed', lines: [0] })
    expect(sourceChange('apps/docs-other/test.ts', 'test()\n', 'apps/docs', {})).toEqual({ kind: 'outside', lines: [] })
  })
})
