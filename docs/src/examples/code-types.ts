import type { HighlightedCommand } from '@/mdx/components/command-block'

export type FileChange = 'unchanged' | 'modified' | 'added' | 'removed' | 'outside'

export interface CodeToken {
  text: string
  light?: string
  dark?: string
}

export interface ExampleFile {
  path: string
  lines: CodeToken[][]
  change: FileChange
  changedLines: number[]
}

export interface PresetView {
  id: string
  label: { en: string; zh: string }
  target: string
  command: HighlightedCommand
  directory: string
  source: ExampleFile[]
  config: ExampleFile[]
  excerpt: ExampleFile
  output: ExampleFile[]
}

export interface ExampleView {
  id: string
  repository: string
  presets: PresetView[]
}
