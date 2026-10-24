import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseFrontmatter } from '@blackwork/machine'

const root = fileURLToPath(new URL('../', import.meta.url))
const site = 'https://preset.js.org'
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'))

const codeBlock = (content, language = '') => {
  const longest = Math.max(2, ...(content.match(/`+/g) ?? []).map((run) => run.length))
  const fence = '`'.repeat(longest + 1)
  return `${fence}${language}\n${content.trimEnd()}\n${fence}`
}

const renderExample = (fixture) => {
  const files = (entries) => Object.entries(entries).map(([path, content]) =>
    `#### ${path}\n\n${codeBlock(content, path.endsWith('.json') ? 'json' : '')}`,
  ).join('\n\n')
  return [
    '> Fictional repository and commands. Replace them with your actual repository and config paths.',
    '### Source files',
    files(fixture.sourceFiles),
    ...fixture.presets.flatMap((preset) => [
      `### ${preset.label.en}`,
      codeBlock(`pnpm create preset init ${preset.target} --from ./presets/${preset.id}.json`, 'bash'),
      `#### presets/${preset.id}.json`,
      codeBlock(JSON.stringify(preset.config, null, 2), 'json'),
      `#### Output directory: ${preset.target}`,
      files(preset.outputFiles),
    ]),
  ].join('\n\n')
}

// These are the only interactive blocks in the exported guides/examples.
// Reject new MDX constructs instead of silently publishing incomplete docs.
export const toMarkdown = (body, { commands, fixtures, links }) => {
  let fence
  return body.split('\n').map((line) => {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/)
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined
      return line
    }
    if (marker) {
      fence = marker[1]
      return line
    }
    const component = line.match(/^\s*<(PackageManagerCommands|ExampleExplorer)\b([^<>]*?)\s*\/>\s*$/)
    if (component) {
      const attrs = Object.fromEntries([...component[2].matchAll(/(\w+)="([^"]*)"/g)].map((match) => [match[1], match[2]]))
      const allowed = component[1] === 'PackageManagerCommands' ? ['mode', 'locale'] : ['example', 'locale']
      const remaining = component[2].replace(/\w+="[^"]*"/g, '').trim()
      if (remaining || Object.keys(attrs).some((key) => !allowed.includes(key))) throw new Error(`Unsupported MDX attributes: ${line}`)
      if (component[1] === 'PackageManagerCommands') {
        const group = commands[attrs.mode ?? 'create']
        if (!group) throw new Error(`Unknown command mode: ${attrs.mode}`)
        return group.map(({ label, command }) => `${label}:\n\n${codeBlock(command, 'bash')}`).join('\n\n')
      }
      const fixture = fixtures[attrs.example]
      if (!fixture) throw new Error(`Unknown example: ${attrs.example}`)
      return renderExample(fixture)
    }
    if (/^\s*(?:<\/?[A-Za-z]|import\s|export\s|\{)/.test(line)) throw new Error(`Unsupported MDX in agent docs: ${line}`)
    // Rewrite prose links only: example code must remain byte-for-byte intact.
    return line.replace(/\]\(([^\s)]+)\)/g, (match, href) => {
      const [path, hash] = href.split('#')
      const target = links.get(path.replace(/\/$/, ''))
      if (target) return `](${site}${target}${hash ? `#${hash}` : ''})`
      if (href.startsWith('/') && !href.startsWith('//')) return `](${site}${href})`
      return match
    })
  }).join('\n').trim() + '\n'
}

export const buildAgentDocs = async (output = resolve(root, 'public')) => {
  const [commands, fixtures, pkg] = await Promise.all([
    readJson('src/mdx/package-manager-commands.json'),
    readJson('src/examples/fixtures.json'),
    readJson('../package.json'),
  ])
  const pages = []
  for (const section of ['guide', 'examples']) {
    const directory = resolve(root, 'src/contents/en', section)
    for (const filename of (await readdir(directory)).filter((name) => /\.mdx?$/.test(name)).sort()) {
      const { frontmatter, body } = parseFrontmatter(await readFile(resolve(directory, filename), 'utf8'))
      const slug = `${section}/${filename.replace(/\.mdx?$/, '')}`
      pages.push({ section, title: frontmatter.title, description: frontmatter.description, order: frontmatter.order ?? 0, body,
        href: `/${slug}`, path: `/agent/${slug}.md` })
    }
  }
  for (const name of ['preset-configs', 'private-presets']) {
    const body = await readFile(resolve(root, `${name}.md`), 'utf8')
    pages.push({ section: 'reference', title: name, body, href: `https://github.com/preset-cli/create-preset/blob/main/docs/${name}.md`, path: `/agent/reference/${name}.md` })
  }
  const links = new Map(pages.map((page) => [page.href, page.path]))
  for (const page of pages.filter((page) => page.section === 'reference')) links.set(`${page.title}.md`, page.path)
  const rendered = pages.map((page) => ({ ...page, markdown: toMarkdown(page.body, { commands, fixtures, links }) }))

  // This directory is generated exclusively by this script; remove stale pages.
  await rm(resolve(output, 'agent'), { recursive: true, force: true })
  // Remove files generated by the previous bilingual implementation.
  for (const path of ['zh/llms.txt', 'zh/llms-full.txt']) {
    await rm(resolve(output, path), { force: true })
  }
  const write = async (path, content) => {
    const target = resolve(output, `.${path}`)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, content)
  }
  for (const page of rendered) await write(page.path, page.markdown)
  const guides = rendered.filter((page) => page.section !== 'reference').sort((a, b) => a.order - b.order)
  const list = (section) => guides.filter((page) => page.section === section).map((page) => `- [${page.title}](${site}${page.path}): ${page.description}`).join('\n')
  const index = [
    '# Create Preset',
    '> Create projects with official generators and declarative JSON presets, or apply selected files to existing projects.',
    `CLI version: ${pkg.version}. Start with Getting Started, then read only the references or examples needed for the task. Links below provide plain text without website navigation.`,
    '## Guides', list('guide'),
    '## Examples', list('examples'),
    '## Reference',
    `- [Preset config reference](${site}/agent/reference/preset-configs.md): Complete field and execution rules.`,
    `- [Private preset manifest](${site}/agent/reference/private-presets.md): Full manifest format.`,
    `- [JSON Schema](${site}/schema/preset.schema.json): Preset validation schema.`,
    '## Optional',
    `- [Full documentation](${site}/llms-full.txt): Combined guides, examples and references. Prefer individual pages for smaller context.`,
  ].join('\n\n') + '\n'
  await write('/llms.txt', index)
  const bundle = [...guides, ...rendered.filter((page) => page.section === 'reference')]
  await write('/llms-full.txt', `# Create Preset ${pkg.version}\n\n` + bundle.map((page) => `Source: ${site}${page.path}\n\n${page.markdown}`).join('\n---\n\n'))
  return rendered
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const pages = await buildAgentDocs()
  console.log(`[preset-agent-docs] Generated ${pages.length} Markdown pages and an English index/bundle`)
}
