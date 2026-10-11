import { cache } from 'react'
import { createHighlighter } from 'shiki'
import fixtures from './fixtures.json'
import { changedLines, sourceChange } from './changes'
import type { ExampleFile, ExampleView } from './code-types'

let highlighter: ReturnType<typeof createHighlighter> | undefined

async function highlight(path: string, content: string): Promise<ExampleFile['lines']> {
  highlighter ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['json', 'typescript', 'javascript', 'markdown', 'yaml', 'dotenv'],
  })
  const syntax = await highlighter
  const lang = path.endsWith('.json') ? 'json'
    : path.endsWith('.ts') ? 'typescript'
    : path.endsWith('.js') ? 'javascript'
    : path.endsWith('.md') ? 'markdown'
    : path.endsWith('.yaml') ? 'yaml'
    : path.startsWith('.env') ? 'dotenv' : 'text'
  return syntax.codeToTokensWithThemes(content.replace(/\n$/, ''), {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
  }).map((line) => line.map((token) => ({
    text: token.content,
    light: token.variants.light.color,
    dark: token.variants.dark.color,
  })))
}

export const getExampleView = cache(async (id: keyof typeof fixtures): Promise<ExampleView> => {
  const fixture = fixtures[id]
  const sourceFiles: Record<string, string> = fixture.sourceFiles
  return {
    id,
    repository: fixture.repo.split('/').pop()!.replace('.git', ''),
    presets: await Promise.all(fixture.presets.map(async (preset) => {
      const outputFiles = preset.outputFiles as Record<string, string>
      const directory = preset.config.source.directory
      const prefix = directory ? `${directory}/` : ''
      const configText = JSON.stringify(preset.config, null, 2)
      // The homepage labels this as an excerpt; the full config remains in Examples.
      const excerpt = {
        source: { directory },
        ...Object.fromEntries(Object.entries(preset.config).filter(([key]) =>
          !['$schema', 'version', 'source'].includes(key),
        )),
      }
      return {
        id: preset.id,
        label: preset.label,
        target: preset.target,
        directory,
        source: await Promise.all(Object.entries(sourceFiles).map(async ([path, content]) => {
          const change = sourceChange(path, content, directory, outputFiles)
          return { path, lines: await highlight(path, content), change: change.kind, changedLines: change.lines }
        })),
        config: [{ path: `${preset.id}.json`, lines: await highlight('preset.json', configText), change: 'unchanged' as const, changedLines: [] }],
        excerpt: { path: `${preset.id}.json`, lines: await highlight('preset.json', JSON.stringify(excerpt, null, 2)), change: 'unchanged' as const, changedLines: [] },
        output: await Promise.all(Object.entries(outputFiles).map(async ([path, content]) => {
          const original = sourceFiles[`${prefix}${path}`]
          const lines = await highlight(path, content)
          return {
            path,
            lines,
            change: original === undefined ? 'added' as const : original === content ? 'unchanged' as const : 'modified' as const,
            changedLines: original === undefined ? lines.map((_, index) => index) : changedLines(original, content).after,
          }
        })),
      }
    })),
  }
})
