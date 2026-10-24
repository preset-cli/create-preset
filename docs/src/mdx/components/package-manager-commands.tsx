import { getMessages, type Locale } from '@/locales'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'blackwork'
import { highlightCommand } from '../command-highlight.server'
import { CommandBlock } from './command-block'
import commands from '../package-manager-commands.json'

export const PackageManagerCommands = async ({
  mode = 'create',
  locale = 'en',
}: {
  mode?: keyof typeof commands
  locale?: Locale
}) => {
  const highlightedCommands = await Promise.all(commands[mode].map(async (item) => ({
    ...item,
    highlighted: await highlightCommand(item.command),
  })))

  return (
    <Tabs defaultValue="pnpm" className="not-prose my-4 min-w-0">
      <TabsList aria-label={getMessages(locale).common.packageManager}>
        {commands[mode].map(({ id, label }) => (
          <TabsTrigger key={id} value={id}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {highlightedCommands.map(({ id, highlighted }) => (
        <TabsContent key={id} value={id}>
          <CommandBlock command={highlighted} locale={locale} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
