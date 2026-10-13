import { Tabs, TabsContent, TabsList, TabsTrigger } from 'blackwork'
import { highlightCommand } from '../command-highlight.server'
import { CommandBlock } from './command-block'

const commands = {
  create: [
    { id: 'pnpm', label: 'pnpm', command: 'pnpm create preset' },
    { id: 'npm', label: 'npm', command: 'npm create preset' },
    { id: 'yarn', label: 'Yarn', command: 'yarn create preset' },
    { id: 'bun', label: 'Bun', command: 'bun create preset' },
  ],
  install: [
    { id: 'pnpm', label: 'pnpm', command: 'pnpm add -g create-preset' },
    { id: 'npm', label: 'npm', command: 'npm install -g create-preset' },
    { id: 'yarn', label: 'Yarn Classic', command: 'yarn global add create-preset' },
    { id: 'bun', label: 'Bun', command: 'bun add -g create-preset' },
  ],
} as const

export async function PackageManagerCommands({
  mode = 'create',
  locale = 'en',
}: {
  mode?: keyof typeof commands
  locale?: 'en' | 'zh'
}) {
  const highlightedCommands = await Promise.all(commands[mode].map(async (item) => ({
    ...item,
    highlighted: await highlightCommand(item.command),
  })))

  return (
    <Tabs defaultValue="pnpm" className="not-prose my-4 min-w-0">
      <TabsList aria-label={locale === 'zh' ? '包管理器' : 'Package manager'}>
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
