import { resolveLocale } from '@/locales'
import { readFile } from 'node:fs/promises'
import { compile } from '@blackwork/machine/server'
import { mergeDocsComponents } from '@blackwork/docs/runtime'
import { DefaultDocsShell, type DefaultDocsShellProps } from '@blackwork/docs/theme'
import { CopyAgentPrompt } from './copy-agent-prompt'
import { getAgentPagePath } from './prompt'

export const AgentDocsPage = async ({ config, entry, source }: Omit<DefaultDocsShellProps, 'children' | 'headings'>) => {
  const content = entry.loadSource ? await entry.loadSource() : await readFile(entry.sourcePath, 'utf8')
  const compiled = await compile(content, {
    format: entry.format === 'mdx' ? 'mdx' : 'markdown',
    includeHtml: false,
    components: mergeDocsComponents(config?.mdx?.components),
  })

  // Blackwork 0.6 exposes header metadata only for the content layout.
  // Keep its docs shell/navigation; CSS positions the utility beside its title.
  return (
    <DefaultDocsShell config={config} entry={entry} source={source} headings={compiled.headings}>
      <div className="not-prose" data-agent-actions="">
        <CopyAgentPrompt locale={resolveLocale(entry.locale)} pagePath={getAgentPagePath(entry)} />
      </div>
      {compiled.jsxElement}
    </DefaultDocsShell>
  )
}
