'use client'

import { getMessages, type Locale } from '@/locales'

import type { CSSProperties } from 'react'
import { CodeBlock } from '@blackwork/machine/runtime'

export interface HighlightedCommand {
  text: string
  lines: { text: string; light?: string; dark?: string }[][]
}

export const CommandBlock = ({ command, locale = 'en' }: {
  command: HighlightedCommand
  locale?: Locale
}) => {
  const copy = getMessages(locale).common
  return (
    <CodeBlock
      language="bash"
      rawCode={command.text}
      copyLabel={copy.copyCommand}
      copiedLabel={copy.copied}
      aria-label={copy.command}
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
