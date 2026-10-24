import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { buildAgentDocs, toMarkdown } from '../build-agent-docs.mjs'

const options = { commands: {}, fixtures: {}, links: new Map([['/guide/example', '/agent/guide/example.md']]) }

test('rewrites documentation links without changing fenced example content', () => {
  const example = '```md\n[Sample](/guide/example)\n<CustomComponent />\n```'
  const input = `[Guide](/guide/example#heading)\n\n${example}\n\n[Schema](/schema/preset.schema.json)`
  const output = toMarkdown(input, options)
  assert.ok(output.includes('[Guide](https://preset.js.org/agent/guide/example.md#heading)'))
  assert.ok(output.includes(example))
  assert.ok(output.includes('[Schema](https://preset.js.org/schema/preset.schema.json)'))
})

test('fails on unsupported MDX instead of silently omitting information', () => {
  for (const input of ['<NewExample />', '<ExampleExplorer example="missing" />', '<PackageManagerCommands mode="unknown" />', '<PackageManagerCommands mode={mode} />']) {
    assert.throws(() => toMarkdown(input, options))
  }
})

test('publishes one English documentation set with resolving links and current example data', async (t) => {
  const output = await mkdtemp(join(tmpdir(), 'preset-agent-docs-'))
  t.after(() => rm(output, { recursive: true, force: true }))
  const pages = await buildAgentDocs(output)
  const fixtures = JSON.parse(await readFile(new URL('../../src/examples/fixtures.json', import.meta.url), 'utf8'))
  const commands = JSON.parse(await readFile(new URL('../../src/mdx/package-manager-commands.json', import.meta.url), 'utf8'))
  const outputs = new Set(pages.map((page) => page.path))
  outputs.add('/llms.txt')
  outputs.add('/llms-full.txt')
  const quickstart = await readFile(join(output, 'agent/guide/getting-started.md'), 'utf8')
  for (const group of Object.values(commands)) {
    for (const { command } of group) assert.ok(quickstart.includes(command))
  }
  const index = await readFile(join(output, 'llms.txt'), 'utf8')
  assert.ok(index.length < 6000, 'index stays concise')
  const bundle = await readFile(join(output, 'llms-full.txt'), 'utf8')
  for (const page of pages) {
    assert.ok(index.includes(`https://preset.js.org${page.path}`))
    assert.ok(bundle.includes(page.markdown))
  }
  for (const [name, fixture] of Object.entries(fixtures)) {
    const markdown = await readFile(join(output, `agent/examples/${name}.md`), 'utf8')
    for (const preset of fixture.presets) {
      assert.ok(markdown.includes(JSON.stringify(preset.config, null, 2)))
      for (const content of Object.values(preset.outputFiles)) assert.ok(markdown.includes(content.trimEnd()))
    }
    for (const content of Object.values(fixture.sourceFiles)) assert.ok(markdown.includes(content.trimEnd()))
  }
  for (const path of outputs) {
    const content = await readFile(join(output, path), 'utf8')
    assert.doesNotMatch(content, /<(PackageManagerCommands|ExampleExplorer)\b/)
    for (const match of content.matchAll(/\]\(https:\/\/preset\.js\.org([^\s)#]+)(?:#[^\s)]*)?\)/g)) {
      const target = match[1]
      if (target === '/schema/preset.schema.json') continue
      assert.ok(outputs.has(target), `unresolved generated link in ${path}: ${target}`)
    }
  }
  // Content removal must not leave obsolete published pages behind.
  const stale = join(output, 'agent/removed.md')
  await writeFile(stale, 'obsolete')
  await mkdir(join(output, 'zh'), { recursive: true })
  await writeFile(join(output, 'zh/llms.txt'), 'obsolete')
  await writeFile(join(output, 'zh/llms-full.txt'), 'obsolete')
  await buildAgentDocs(output)
  for (const path of ['agent/removed.md', 'zh/llms.txt', 'zh/llms-full.txt', 'agent/en', 'agent/zh']) {
    await assert.rejects(access(join(output, path)))
  }
})
