'use client'

import { useId, useState } from 'react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from 'blackwork'
import type { ExampleFile, ExampleView } from './code-types'
import { Callout } from '@/mdx/components/callout'
import { CommandBlock } from '@/mdx/components/command-block'
import { ChangeMark, CodeView } from './code-view'

type Locale = 'en' | 'zh'

const labels = {
  zh: {
    source: '源文件', config: 'Preset 配置', output: '生成结果',
    files: '文件列表', edition: '生成版本', command: '创建命令',
    noteTitle: '示例说明',
    note: '下方只演示文件变化，不会运行命令。试用前，先替换示例仓库地址，再把 JSON 保存到命令指定的路径。',
  },
  en: {
    source: 'Source', config: 'Preset config', output: 'Output',
    files: 'Files', edition: 'Edition', command: 'Create command',
    noteTitle: 'Example note',
    note: 'The files below show the source, config, and expected output; no commands run here. To try it locally, replace the example repository URL and save the JSON at the path in the command.',
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
  const panels = [
    { id: 'source', title: copy.source, files: preset.source, root: data.repository },
    { id: 'config', title: copy.config, files: preset.config, root: 'presets' },
    { id: 'output', title: copy.output, files: preset.output, root: preset.target },
  ] as const

  return (
    <div data-preset-example="" className="not-prose my-8 min-w-0">
      <Callout title={copy.noteTitle}>{copy.note}</Callout>
      {data.presets.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <label htmlFor={selectId} className="font-medium">{copy.edition}</label>
          <Select
            value={presetIndex}
            items={data.presets.map((item, index) => ({ value: index, label: item.label[locale] }))}
            onValueChange={(value) => {
              if (value !== null) setPresetIndex(value)
            }}
          >
            <SelectTrigger id={selectId} className="w-auto min-w-36 max-w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {data.presets.map((item, index) => (
                <SelectItem key={item.id} value={index}>{item.label[locale]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      <CommandBlock key={preset.id} command={preset.command} locale={locale} />
    </div>
  )
}
