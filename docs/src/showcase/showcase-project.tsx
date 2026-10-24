import { getMessages, type Locale } from '@/locales'
import { Badge, Button, Card, CardContent, CardHeader } from 'blackwork/rsc'

export const ShowcaseProject = ({ locale = 'en' }: { locale?: Locale }) => {
  const text = getMessages(locale).showcase

  return (
    <section
      className="not-prose my-8"
      aria-labelledby="blackwork-starter-title"
    >
      <Card className="gap-0 overflow-hidden p-0">
        <figure className="m-0 border-b border-border">
          <img
            src="/showcase/blackwork-docs-starter-light.jpg"
            alt={text.screenshot}
            width={1280}
            height={720}
            className="block h-auto w-full dark:hidden"
          />
          <img
            src="/showcase/blackwork-docs-starter-dark.jpg"
            alt={text.screenshot}
            width={1280}
            height={720}
            className="hidden h-auto w-full dark:block"
          />
          <figcaption className="px-6 py-3 text-xs text-muted-foreground">
            {text.caption}
          </figcaption>
        </figure>
        <CardHeader className="pt-6">
          <h2 id="blackwork-starter-title" className="text-xl font-semibold">
            Blackwork Docs Starter
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {text.description}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {[text.category, 'Next.js', 'Blackwork', 'MDX'].map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="glass-primary">
              <a href={text.createHref}>{text.create}</a>
            </Button>
            <Button asChild variant="outline">
              <a
                href="https://github.com/chengpeiquan/blackwork/blob/main/presets/docs-starter.json"
                target="_blank"
                rel="noopener noreferrer"
              >
                {text.source}
              </a>
            </Button>
            <Button asChild variant="ghost">
              <a
                href={text.websiteHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {text.website}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
