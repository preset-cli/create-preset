import type { FileChange } from './code-types'

export function codeLines(content: string) {
  return content.replace(/\n$/, '').split('\n')
}

// Match lines in order, so a removed import does not mark every later line as changed.
export function changedLines(before: string, after: string) {
  const left = codeLines(before)
  const right = codeLines(after)
  const lengths = Array.from({ length: left.length + 1 }, () =>
    new Array<number>(right.length + 1).fill(0),
  )
  for (let i = left.length - 1; i >= 0; i--) {
    for (let j = right.length - 1; j >= 0; j--) {
      lengths[i][j] = left[i] === right[j]
        ? lengths[i + 1][j + 1] + 1
        : Math.max(lengths[i + 1][j], lengths[i][j + 1])
    }
  }
  const removed: number[] = []
  const added: number[] = []
  let i = 0
  let j = 0
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      i++
      j++
    } else if (j < right.length && (i === left.length || lengths[i][j + 1] > lengths[i + 1][j])) {
      added.push(j++)
    } else {
      removed.push(i++)
    }
  }
  return { before: removed, after: added }
}

export function sourceChange(
  path: string,
  content: string,
  directory: string,
  output: Record<string, string>,
): { kind: FileChange; lines: number[] } {
  const prefix = directory ? `${directory}/` : ''
  if (!path.startsWith(prefix)) return { kind: 'outside', lines: [] }
  const next = output[path.slice(prefix.length)]
  if (next === undefined) return { kind: 'removed', lines: codeLines(content).map((_, index) => index) }
  if (next === content) return { kind: 'unchanged', lines: [] }
  return { kind: 'modified', lines: changedLines(content, next).before }
}
