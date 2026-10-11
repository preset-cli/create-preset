import Link from 'next/link'
import { exampleCopy } from './copy'

export function ExampleList({ locale = 'en' }: { locale?: 'en' | 'zh' }) {
  const copy = exampleCopy[locale]
  const prefix = locale === 'zh' ? '/zh' : ''

  return (
    <div className="not-prose my-8 divide-y divide-border">
      {copy.scenarios.map((scenario) => (
        <div key={scenario.id} className="py-6 first:pt-0">
          <h2 className="text-lg font-semibold">
            <Link
              href={`${prefix}/examples/${scenario.id}`}
              className="underline decoration-border underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {scenario.title}
            </Link>
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{scenario.after}</p>
        </div>
      ))}
    </div>
  )
}
