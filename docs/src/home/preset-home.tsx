import {
  buildHeaderNavigation,
  buildLocaleLinks,
  type DocEntry,
  type DocsSource,
  type NormalizedDocsConfig,
} from '@blackwork/docs'
import {
  createHomeData,
  DefaultDocsHeader,
} from '@blackwork/docs/theme'
import { Button, Card, CardContent, CardHeader } from 'blackwork/rsc'
import { Boxes, Zap, Terminal, Layers, SlidersHorizontal, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { DocsHeaderSearchAction } from '@/search/docs-search'
import { PackageManagerCommands } from '@/mdx/components/package-manager-commands'
import { PresetFooter } from '@/site/footer'
import { DocsSiteLink } from '@/site/docs-link'
import { cn } from '@/utils/class-name'
import { getMessages, resolveLocale } from '@/locales'
import { HomeScenarios } from './scenarios'
import { SourceDiagram } from './source-diagram'
import styles from './preset-home.module.css'

const githubUrl = 'https://github.com/preset-cli/create-preset'
const featureIcons = [Boxes, Zap, Terminal, Layers, SlidersHorizontal, KeyRound]

export const PresetHome = ({
  config,
  entry,
  source,
}: {
  config: NormalizedDocsConfig
  entry: DocEntry
  source: DocsSource
}) => {
  const locale = resolveLocale(entry.locale)
  const { home: copy, examples } = getMessages(locale)
  const examplesHref = `${locale === 'zh' ? '/zh' : ''}/examples/variants`
  const home = createHomeData({ config, locale: entry.locale, source })
  const navigation = buildHeaderNavigation({
    config,
    currentHref: entry.href,
    locale: entry.locale,
    source,
  })
  const localeLinks = buildLocaleLinks({ config, entry, source })
  const badge = typeof home.badge === 'object' ? home.badge : undefined
  const startLink = (large = false) => (
    <Button
      asChild
      variant={config.theme.appearance === 'glass' ? 'glass-primary' : 'default'}
      size="lg"
      className={cn(
        'rounded-full',
        large ? 'h-12 w-60 text-xl' : 'h-10 w-30',
      )}
    >
      <Link href={home.primaryAction.href}>{home.primaryAction.label}</Link>
    </Button>
  )

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <DefaultDocsHeader
        appearance={config.theme.appearance}
        homeHref={home.homeHref}
        siteTitle={home.title}
        siteDescription={home.description}
        navigation={navigation}
        localeLinks={localeLinks}
        labels={copy.labels}
        LinkComponent={DocsSiteLink}
        socialLinks={[
          {
            type: 'github',
            link: githubUrl,
            label: 'GitHub',
            ariaLabel: copy.sourceCode,
          },
        ]}
        headerActions={
          <DocsHeaderSearchAction
            homeHref={home.homeHref}
            siteTitle={home.title}
            navigation={navigation}
            localeLinks={localeLinks}
          />
        }
      />
      <main
        className="w-full flex-1"
        data-docs-region="home-shell"
        data-pagefind-body=""
      >
        <span hidden data-pagefind-filter={`locale:${entry.locale}`} />
        <section className={styles.hero} aria-labelledby="home-title" data-docs-region="home-hero">
          <div className={styles.heroInner}>
            <div>
              <div className={styles.brand}>
                <img src="/logo-compact.svg" alt={copy.logo} width={858} height={623} className="h-auto w-12" fetchPriority="high" />
                <span>{home.title}</span>
                <span className={styles.brandRule} aria-hidden="true" />
                <span className={styles.brandNote}>{copy.hero.brandNote}</span>
              </div>
              <h1 id="home-title" className={styles.title}>
                {copy.hero.title}<br /><span>{copy.hero.question} <span className="inline-block">{copy.hero.answer}</span></span>
              </h1>
              <p className={styles.description}>
                {copy.hero.description}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild size="lg"><a href="#scenarios">{copy.hero.bestPractices} <span aria-hidden="true">↓</span></a></Button>
                <Button asChild variant="outline" size="lg"><Link href={home.primaryAction.href}>{home.primaryAction.label}</Link></Button>
              </div>
              <div className={styles.heroMeta}>
                {badge && <a href={badge.href} target="_blank" rel="noreferrer" className={styles.badgeLink}><img src={badge.src} alt={badge.alt} width={100} height={20} className="h-5 w-auto" /></a>}
                <Link href={examplesHref}>{examples.all} <span aria-hidden="true">↗</span></Link>
                <a href={githubUrl} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <SourceDiagram locale={locale} />
          </div>
        </section>

        <div className="mx-auto w-11/12 max-w-6xl pb-12 md:pb-16">
          <HomeScenarios locale={locale} />
          <section
            className="my-12 md:my-16"
            aria-label={copy.featuresLabel}
            data-docs-region="home-highlights"
          >
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {copy.features.map((feature, index) => {
                const Icon = featureIcons[index]
                return (
                  <li key={feature.title}>
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                          </div>
                          <h2 className="text-balance text-base font-semibold">
                            {feature.title}
                          </h2>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-pretty text-sm leading-6 text-muted-foreground">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </li>
                )
              })}
            </ul>
          </section>

          <section aria-labelledby="usage-title" className="space-y-4 pt-4">
            <h2
              id="usage-title"
              className="border-t border-border pt-6 text-balance text-2xl font-semibold"
            >
              {copy.usageTitle}
            </h2>
            <p className="text-pretty leading-7 text-muted-foreground">
              {copy.usageDescription}
            </p>
            <PackageManagerCommands locale={locale} />
          </section>

          <section aria-labelledby="preview-title" className="mt-12 space-y-4">
            <h2
              id="preview-title"
              className="border-t border-border pt-6 text-balance text-2xl font-semibold"
            >
              {copy.previewTitle}
            </h2>
            <p className="text-pretty leading-7 text-muted-foreground">
              {copy.previewDescription}
            </p>
            <figure>
              <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100">
                <div
                  className="flex items-center gap-2 border-b border-neutral-700 px-4 py-3"
                  aria-hidden="true"
                >
                  <span className="size-3 rounded-full bg-neutral-500" />
                  <span className="size-3 rounded-full bg-neutral-500" />
                  <span className="size-3 rounded-full bg-neutral-500" />
                  <span className="ml-2 font-mono text-xs text-neutral-400">
                    create-preset
                  </span>
                </div>
                <pre
                  className="overflow-x-auto p-6 font-mono text-sm leading-7 sm:p-8 sm:text-base"
                  tabIndex={0}
                  aria-label={copy.previewTitle}
                >
                  <code>
                    {'$ pnpm create preset\n\n'}
                    <span className="text-emerald-400">create-preset</span>
                    {'\n'}
                    <span className="text-neutral-400">
                      {copy.terminalDescription}
                    </span>
                    {'\n\n'}
                    {copy.projectName}
                    {': my-preset-app\n'}
                    {copy.selectStack}
                    {': Vue\n'}
                    {copy.selectPreset}
                    {':\n'}
                    <span className="text-emerald-400">
                      {'❯ '}
                      {copy.vueStarter}
                      {' ↗'}
                    </span>
                    {'\n  Nuxt ↗'}
                  </code>
                </pre>
              </div>
              <figcaption className="mt-3 text-pretty text-sm leading-6 text-muted-foreground">
                {copy.previewCaption}
              </figcaption>
            </figure>
          </section>
          <div className="mt-8 flex justify-center">{startLink(true)}</div>
        </div>
      </main>
      <PresetFooter />
    </div>
  )
}
