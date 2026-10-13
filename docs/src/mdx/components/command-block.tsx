'use client'

import type { CSSProperties } from 'react'
import { CodeBlock } from '@blackwork/machine/runtime'

export interface HighlightedCommand {
  text: string
  lines: { text: string; light?: string; dark?: string }[][]
}

export function CommandBlock({ command, locale = 'en' }: {
  command: HighlightedCommand
  locale?: 'en' | 'zh'
}) {
  return (
    <CodeBlock
      language="bash"
      rawCode={command.text}
      copyLabel={locale === 'zh' ? '复制命令' : 'Copy command'}
      copiedLabel={locale === 'zh' ? '已复制' : 'Copied'}
      aria-label={locale === 'zh' ? '命令' : 'Command'}
      tabIndex={0}
      className="shiki"
    >
      <code>
        {command.lines.map((line, index) => (
          <span key={index}>
            {index > 0 && '\n'}
            {line.map((token, tokenIndex) => (
              <span key={tokenIndex} style={{ color: token.light, '--shiki-dark': token.dark } as CSSProperties}>{token.text}</span>
            ))}
          </span>
        ))}
      </code>
    </CodeBlock>
  )
}
