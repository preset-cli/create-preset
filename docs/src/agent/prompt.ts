import { getMessages, type Locale } from '@/locales'

const site = 'https://preset.js.org'

export const getAgentPagePath = (entry: { slugSegments: string[] }) => {
  if (!['guide', 'examples'].includes(entry.slugSegments[0])) return undefined
  return `/agent/${entry.slugSegments.map(encodeURIComponent).join('/')}.md`
}

export const createAgentPrompt = (locale: Locale, pagePath?: string) => {
  const index = `${site}/llms.txt`
  const { prompt } = getMessages(locale).agent
  return [
    `${prompt.index}${index}`,
    ...(pagePath ? [`${prompt.page}${site}${pagePath}`] : []),
    prompt.instructions,
    '',
    prompt.task,
  ].join('\n')
}
