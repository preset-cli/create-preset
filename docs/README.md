# preset.js.org

The official documentation website for [Create Preset](https://github.com/preset-cli/create-preset), built with the Blackwork docs starter.

The website is maintained in this repository's `docs/` directory. Its source
was imported from `preset-cli/website` at commit `808bc8e`.

## Development

Use Node.js 22.13 or later and the pnpm version pinned in `package.json`.

```bash
cd docs
pnpm install
pnpm dev
```

The development server runs at <http://localhost:3300>.

## Verification

```bash
pnpm test
pnpm lint
pnpm build
pnpm start
```

Keep tests in a nearby `__tests__/` directory, such as
`src/locales/__tests__/locales.test.ts` or `scripts/__tests__/agent-docs.test.mjs`,
rather than beside production files. `pnpm test` runs all source tests with Vitest
and script tests with Node.js.

`pnpm build` writes the static site and Pagefind search index to `.next-static`.
Development and production builds copy `../schema/preset.schema.json` into the
public site, so the CLI and website share one schema source.

## UI translations

Shared interface messages live in `src/locales/en.json` and `zh.json`, grouped
by module (`home`, `examples`, `search`, `agent`, etc.). Components and helpers
read them through `getMessages(locale)` from `@/locales`; this works in both
Server and Client Components without a provider:

```ts
const { agent } = getMessages(locale)
```

Add new interface copy to the same module in both JSON files. English defines
the TypeScript message shape; type checks and locale tests catch missing fields.
`src/locales/config.ts` owns the supported language definitions and default
language used by the docs framework. `resolveLocale` accepts region tags such
as `zh-CN` and falls back to English for unsupported languages.

Markdown/MDX articles remain in `src/contents/<locale>`. The docs framework's
navigation/theme configuration keeps its native localized-label format.

## Agent documentation

`pnpm dev` and `pnpm build` generate one English `/llms.txt` index,
`/llms-full.txt` bundle, and Markdown pages under `/agent/`. The guides and
examples come from `src/contents/en`; full references come from the two reference
documents in this directory. Command tabs and interactive examples expand from
the same command data and fixtures used by the website. Generated files are not
committed. After editing content during development, run `pnpm build:agent-docs`
to refresh them; production builds always regenerate them.

The homepage's secondary links and guide/example titles offer a localized **Copy for AI**
button. Prompts follow the website language but always link to the same English
index and corresponding English Markdown page. All prompts use
the public production domain so they can be shared outside the current browser.
The task placeholder is intended to be filled in before sending to an agent.

When adding interactive MDX to guides or examples, add a plain Markdown renderer
in `scripts/build-agent-docs.mjs`. Unsupported blocks fail generation rather than
silently dropping useful content. Keep prose links outside code blocks: exported
links resolve to the published Markdown pages, while sample code is preserved.

## Social previews

Every canonical page gets Open Graph and X Card metadata from its existing
frontmatter title and description. The build generates a matching 1200 × 630
PNG under `/og/` using a shared text layout and the bundled Noto Sans SC font.
English and Chinese pages have separate previews; `/en/` aliases share the
canonical English preview. No per-page image configuration or image server is
required. Run `pnpm dev` to preview images locally, or inspect the PNG files in
`.next-static/og/` after `pnpm build`.

## Deployment

The [Pages workflow](../.github/workflows/website.yml) validates pull requests and
builds documentation changes merged into `main`. It publishes the static files
to `gh-pages`, retaining the branch's commit history and replacing old files.
Set **Settings → Pages → Source** to **Deploy from a branch**, then select
**gh-pages** and **/(root)**. GitHub Pages deploys the published branch.

The workflow uses the repository's `ACCESS_TOKEN` secret to push the generated
files and trigger the Pages deployment. The token needs write access to this
repository. Pull requests only build and verify the website.

Each build checks the homepages, guide, search index, schema, agent docs and `CNAME`, and
keeps a `website-static` download artifact for seven days. After publication,
inspect `gh-pages` for `index.html`, `zh/`, `_next/`, `pagefind/`, `schema/`,
`CNAME` and `.nojekyll`. The deployment commit includes the source commit SHA.
Use **Actions → Deploy website → Run workflow → main** to publish manually.

For the move from `preset-cli/website` to `preset-cli/create-preset`, update the
existing `preset` entry in js.org's `cnames_active.js`:

```js
"preset": "preset-cli.github.io/create-preset",
```

When switching the domain, remove `preset.js.org` from the old repository's Pages
settings, then assign it to this repository. Keep the old repository until the
new site is verified. After the DNS update, check both languages, guide links,
search, favicon, and `/schema/preset.schema.json`, then enable HTTPS.

The site uses root-relative asset URLs for `preset.js.org`. Its temporary project
URL is `https://preset-cli.github.io/create-preset/`.
