import { cache } from 'react'
import { createHighlighter } from 'shiki'
import type { HighlightedCommand } from './components/command-block'

let highlighter: ReturnType<typeof createHighlighter> | undefined

export const highlightCommand = cache(async (text: string): Promise<HighlightedCommand> => {
  highlighter ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['bash'],
  })
  const syntax = await highlighter
  return {
    text,
    lines: syntax.codeToTokensWithThemes(text, {
      lang: 'bash',
      themes: { light: 'github-light', dark: 'github-dark' },
    }).map((line) => line.map((token) => ({
      text: token.content,
      light: token.variants.light.color,
      dark: token.variants.dark.color,
    }))),
  }
})
