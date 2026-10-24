import { getMessages, type Locale } from '@/locales'
import type { CSSProperties } from 'react'
import type { ExampleFile, FileChange } from './code-types'
import styles from './code-view.module.css'

export const ChangeMark = ({ change, locale }: { change: FileChange; locale: Locale }) => {
  return <span data-change={change} className={styles.mark}>{getMessages(locale).changes[change]}</span>
}

export const CodeView = ({ file, side = 'output', compact = false }: {
  file: ExampleFile
  side?: 'source' | 'config' | 'output'
  compact?: boolean
}) => {
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
