'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from 'blackwork'
import { ArrowRight, FileCode2, FolderOpen, SlidersHorizontal } from 'lucide-react'
import { exampleCopy } from '@/examples/copy'
import type { ExampleFile, ExampleView, PresetView } from '@/examples/code-types'
import { CodeView, ChangeMark } from '@/examples/code-view'
import styles from './scenario-demo.module.css'

const ui = {
  zh: {
    tabs: ['模板重复维护', '复用 Skills', '提取子项目', '调整文件'],
    source: '源文件', config: '配置差异', output: '生成结果',
    excerpt: '关键配置节选', edition: '切换生成版本',
    sourceHint: '琥珀色标出需要处理的内容', outputHint: '绿色标出生成时改写的行',
    footnote: '虚构仓库演示 · 不会在浏览器中执行命令',
    view: '查看完整示例', browse: '选择一个场景，看看文件如何变化。',
  },
  en: {
    tabs: ['Template variants', 'Shared skills', 'Monorepo projects', 'File changes'],
    source: 'Source files', config: 'Preset rules', output: 'Generated files',
    excerpt: 'Config excerpt', edition: 'Choose an edition',
    sourceHint: 'Amber marks content to change', outputHint: 'Green marks rewritten lines',
    footnote: 'Fictional repository · Commands are not run in the browser',
    view: 'Explore the example', browse: 'Choose a scenario to see what happens to the files.',
  },
}

function FileRows({ files, locale, directory = '' }: { files: ExampleFile[]; locale: 'en' | 'zh'; directory?: string }) {
  return (
    <ul className={styles.files}>
      {files.map((file) => (
        <li key={file.path} data-change={file.change}>
          <FileCode2 size={13} aria-hidden="true" />
          <span className={styles.path} title={file.path}>{directory && file.path.startsWith(`${directory}/`) ? file.path.slice(directory.length + 1) : file.path}</span>
          <ChangeMark change={file.change} locale={locale} />
        </li>
      ))}
    </ul>
  )
}

function Demonstration({ data, locale }: { data: ExampleView; locale: 'en' | 'zh' }) {
  const [selected, setSelected] = useState(0)
  const preset: PresetView = data.presets[selected]
  const copy = ui[locale]
  const focusPath = data.id === 'monorepo' ? 'package.json'
    : data.id === 'file-changes' ? '.env.example'
    : data.id === 'skills' ? 'code-review/SKILL.md' : 'src/main.ts'
  const sourceFile = preset.source.find((file) => file.path === `${preset.directory ? `${preset.directory}/` : ''}${focusPath}`)!
  const outputFile = preset.output.find((file) => file.path === focusPath)!

  return (
    <div className={styles.workbench}>
      <div className={styles.toolbar}>
        <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          <FolderOpen size={15} aria-hidden="true" />
          <span className="truncate">{data.repository}</span>
        </div>
        <div role="group" aria-label={copy.edition} className="flex flex-wrap gap-1">
          {data.presets.map((edition, index) => (
            <Button key={edition.id} size="sm" variant={selected === index ? 'secondary' : 'ghost'} aria-pressed={selected === index} onClick={() => setSelected(index)}>
              {edition.label[locale]}
            </Button>
          ))}
        </div>
      </div>
      <div className={styles.pipeline}>
        <section className={styles.pane} aria-label={copy.source}>
          <div className={styles.step}><span>01</span><h4>{copy.source}</h4><ArrowRight size={15} aria-hidden="true" /></div>
          <div className={styles.root}>{data.repository}/</div>
          <FileRows files={preset.source} locale={locale} />
          <div className={styles.codeTitle}>{focusPath}</div>
          <CodeView file={sourceFile} side="source" compact />
        </section>
        <section className={`${styles.pane} ${styles.rules}`} aria-label={copy.config}>
          <div className={styles.step}><span>02</span><h4>{copy.config}</h4><SlidersHorizontal size={15} aria-hidden="true" /></div>
          <div className={styles.root}>{preset.id}.json <span className="font-sans opacity-60">/ {copy.excerpt}</span></div>
          <CodeView file={preset.excerpt} side="config" compact />
        </section>
        <section className={styles.pane} aria-label={copy.output}>
          <div className={`${styles.step} ${styles.outputStep}`}><span>03</span><h4>{copy.output}</h4><span className="ml-auto font-mono text-xs">{preset.output.length} {locale === 'zh' ? '个文件' : 'files'}</span></div>
          <div className={styles.root}>{preset.target}/</div>
          <FileRows files={preset.output} locale={locale} />
          <div className={styles.codeTitle}>{focusPath}</div>
          <CodeView file={outputFile} side="output" compact />
        </section>
      </div>
      <div className={styles.legend}>
        <span><i className={styles.amber} />{copy.sourceHint}</span>
        <span><i className={styles.green} />{copy.outputHint}</span>
      </div>
      <div className={styles.command}>
        <span aria-hidden="true">$</span>
        <pre tabIndex={0} aria-label={locale === 'zh' ? '示例命令' : 'Example command'}><code>pnpm create preset init {preset.target} --from ./presets/{preset.id}.json</code></pre>
      </div>
    </div>
  )
}

export function ScenarioDemo({ locale, examples }: { locale: 'en' | 'zh'; examples: ExampleView[] }) {
  const copy = exampleCopy[locale]
  const text = ui[locale]
  const prefix = locale === 'zh' ? '/zh' : ''

  return (
    <section id="scenarios" aria-labelledby="scenarios-title" className={styles.section}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>SOURCE → PRESET → PROJECT</p>
          <h2 id="scenarios-title">{copy.title}</h2>
        </div>
        <p>{text.browse}</p>
      </div>
      <Tabs defaultValue="variants" className="gap-0">
        <TabsList aria-label={copy.all} className={styles.tabs}>
          {copy.scenarios.map((scenario, index) => (
            <TabsTrigger value={scenario.id} key={scenario.id} className={styles.tab}>
              <span className={styles.tabNumber} aria-hidden="true">0{index + 1}</span>{text.tabs[index]}
            </TabsTrigger>
          ))}
        </TabsList>
        {copy.scenarios.map((scenario, index) => (
          <TabsContent value={scenario.id} key={scenario.id} className="mt-0 min-w-0">
            <div className={styles.intro}>
              <h3>{scenario.title}</h3>
              <div className={styles.comparison}>
                <p><span>{copy.before}</span>{scenario.before}</p>
                <p><span>{copy.after}</span>{scenario.after}</p>
              </div>
            </div>
            <Demonstration data={examples[index]} locale={locale} />
            <div className={styles.caption}>
              <p>{text.footnote}</p>
              <Link href={`${prefix}/examples/${scenario.id}`}>{text.view}<ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
