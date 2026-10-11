import type fixtures from './fixtures.json'
import { getExampleView } from './highlight.server'
import { ExampleExplorerClient } from './example-explorer-client'

export async function ExampleExplorer({ example, locale = 'en' }: {
  example: keyof typeof fixtures
  locale?: 'en' | 'zh'
}) {
  return <ExampleExplorerClient key={example} data={await getExampleView(example)} locale={locale} />
}
