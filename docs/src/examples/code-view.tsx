import type { CSSProperties } from 'react'
import type { ExampleFile, FileChange } from './code-types'
import styles from './code-view.module.css'

export const changeLabels: Record<'zh' | 'en', Record<FileChange, string>> = {
  zh: { unchanged: '保留', modified: '修改', added: '新增', removed: '排除', outside: '未选取' },
  en: { unchanged: 'Kept', modified: 'Edited', added: 'Added', removed: 'Excluded', outside: 'Not selected' },
}

export function ChangeMark({ change, locale }: { change: FileChange; locale: 'zh' | 'en' }) {
  return <span data-change={change} className={styles.mark}>{changeLabels[locale][change]}</span>
}

export function CodeView({ file, side = 'output', compact = false }: {
  file: ExampleFile
  side?: 'source' | 'config' | 'output'
  compact?: boolean
}) {
  return (
    <pre tabIndex={0} aria-label={file.path} className={`${styles.code} ${compact ? styles.compact : ''}`}>
      <code>
        {file.lines.map((line, index) => (
          <span key={index} className={styles.line} data-edit={file.changedLines.includes(index) ? side : undefined}>
            <span className={styles.number} aria-hidden="true">{index + 1}</span>
            <span>{line.map((token, tokenIndex) => (
              <span key={tokenIndex} className={styles.token} style={{ '--code-light': token.light, '--code-dark': token.dark } as CSSProperties}>{token.text}</span>
            ))}{line.length === 0 ? ' ' : ''}{'\n'}</span>
          </span>
        ))}
      </code>
    </pre>
  )
}
