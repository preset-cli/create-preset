'use client'

import { useId, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'blackwork'
import type { ExampleFile, ExampleView } from './code-types'
import { ChangeMark, CodeView } from './code-view'

type Locale = 'en' | 'zh'

const labels = {
  zh: {
    source: '源文件', config: 'Preset 配置', output: '生成结果',
    files: '文件列表', edition: '生成版本', command: '创建命令',
    note: '示例仓库为虚构地址。替换仓库地址，将配置保存到命令中的本地路径后再运行。生成结果是对应配置的静态演示。',
  },
  en: {
    source: 'Source', config: 'Preset config', output: 'Output',
    files: 'Files', edition: 'Edition', command: 'Create command',
    note: 'Repository URLs are placeholders. Replace the repository URL and save the config at the local path used below before running. Output files are a static demonstration of the selected preset.',
  },
}

function FilePanel({ files, locale, root, side }: {
  files: ExampleFile[]
  locale: Locale
  root: string
  side: 'source' | 'config' | 'output'
}) {
  const [selected, setSelected] = useState(files[0].path)
  const file = files.find((item) => item.path === selected) ?? files[0]
  const panelId = useId()

  return (
    <div className="grid min-w-0 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <nav aria-label={labels[locale].files} className="min-w-0 border-b border-border bg-muted/30 p-3 md:border-r md:border-b-0">
        <p className="mb-2 break-all px-2 font-mono text-xs leading-5 text-muted-foreground">{root}/</p>
        <ul className="flex flex-col gap-1">
          {files.map(({ path, change }) => (
            <li key={path}>
              <button
                type="button"
                onClick={() => setSelected(path)}
                aria-pressed={selected === path}
                aria-controls={panelId}
                className="flex w-full items-baseline justify-between gap-2 rounded-md px-2 py-2 text-left font-mono text-xs leading-5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 aria-pressed:bg-muted aria-pressed:font-semibold"
              >
                <span className={`min-w-0 break-all ${change === 'removed' ? 'line-through opacity-60' : ''}`}>{path}</span>
                {side !== 'config' && <ChangeMark change={change} locale={locale} />}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div id={panelId} className="min-w-0">
        <p className="border-b border-border px-4 py-3 font-mono text-xs break-all text-muted-foreground">{selected}</p>
        <div className="min-h-64"><CodeView file={file} side={side} /></div>
      </div>
    </div>
  )
}

export function ExampleExplorerClient({ data, locale }: { data: ExampleView; locale: Locale }) {
  const copy = labels[locale]
  const [presetIndex, setPresetIndex] = useState(0)
  const preset = data.presets[presetIndex]
  const selectId = useId()
  const command = `pnpm create preset init ${preset.target} --from ./presets/${preset.id}.json`
  const panels = [
    { id: 'source', title: copy.source, files: preset.source, root: data.repository },
    { id: 'config', title: copy.config, files: preset.config, root: 'presets' },
    { id: 'output', title: copy.output, files: preset.output, root: preset.target },
  ] as const

  return (
    <div data-preset-example="" className="not-prose my-8 min-w-0">
      <p className="mb-4 text-sm leading-6 text-muted-foreground">{copy.note}</p>
      {data.presets.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <label htmlFor={selectId} className="font-medium">{copy.edition}</label>
          <select
            id={selectId}
            value={presetIndex}
            onChange={(event) => setPresetIndex(Number(event.target.value))}
            className="max-w-full rounded-md border border-border bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {data.presets.map((item, index) => <option key={item.id} value={index}>{item.label[locale]}</option>)}
          </select>
        </div>
      )}
      <Tabs defaultValue="source" className="min-w-0 gap-0 overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto border-b border-border p-2">
          <TabsList aria-label={locale === 'zh' ? '示例步骤' : 'Example steps'}>
            {panels.map((panel) => <TabsTrigger key={panel.id} value={panel.id}>{panel.title}</TabsTrigger>)}
          </TabsList>
        </div>
        {panels.map((panel) => (
          <TabsContent key={panel.id} value={panel.id} className="mt-0 min-w-0">
            <FilePanel key={`${data.id}-${preset.id}-${panel.id}`} files={panel.files} locale={locale} root={panel.root} side={panel.id} />
          </TabsContent>
        ))}
      </Tabs>
      <p className="mt-5 mb-2 text-sm font-medium">{copy.command}</p>
      <pre tabIndex={0} aria-label={copy.command} className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs leading-6 sm:text-sm"><code>{command}</code></pre>
    </div>
  )
}
