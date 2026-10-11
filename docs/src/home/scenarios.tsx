import { getExampleView } from '@/examples/highlight.server'
import { ScenarioDemo } from './scenario-demo'

export async function HomeScenarios({ locale }: { locale: 'en' | 'zh' }) {
  const examples = await Promise.all(
    (['variants', 'skills', 'monorepo', 'file-changes'] as const).map(getExampleView),
  )
  return <ScenarioDemo locale={locale} examples={examples} />
}
