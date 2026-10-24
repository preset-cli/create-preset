# One template, different editions

The basic edition does not need analytics; the team edition does. Everything else is the same. With a separate template for each, every shared bug needs fixing twice.

Keep the complete source, including analytics, and add a config that removes it for the basic edition. Below, `basic.json` removes the analytics file and its references in the entry point. `team.json` keeps them.

> Fictional repository and commands. Replace them with your actual repository and config paths.

### Source files

#### starter/src/main.ts

```
import { track } from './analytics'

track('app-started')
console.log('Hello')
```

#### starter/src/analytics.ts

```
export function track(event: string) {
  console.log('[analytics]', event)
}
```

#### starter/package.json

```json
{
  "name": "app-starter",
  "version": "1.0.0",
  "private": true
}
```

### Basic

```bash
pnpm create preset init my-basic-app --from ./presets/basic.json
```

#### presets/basic.json

```json
{
  "$schema": "https://preset.js.org/schema/preset.schema.json",
  "version": 1,
  "source": {
    "repo": "https://github.com/example/app-starter.git",
    "directory": "starter"
  },
  "exclude": [
    "src/analytics.ts"
  ],
  "replace": [
    {
      "path": "src/main.ts",
      "from": "import { track } from './analytics'\n\ntrack('app-started')\n",
      "to": ""
    }
  ]
}
```

#### Output directory: my-basic-app

#### src/main.ts

```
console.log('Hello')
```

#### package.json

```json
{
  "name": "my-basic-app",
  "version": "1.0.0",
  "private": true
}
```

### Team

```bash
pnpm create preset init my-team-app --from ./presets/team.json
```

#### presets/team.json

```json
{
  "$schema": "https://preset.js.org/schema/preset.schema.json",
  "version": 1,
  "source": {
    "repo": "https://github.com/example/app-starter.git",
    "directory": "starter"
  }
}
```

#### Output directory: my-team-app

#### src/main.ts

```
import { track } from './analytics'

track('app-started')
console.log('Hello')
```

#### src/analytics.ts

```
export function track(event: string) {
  console.log('[analytics]', event)
}
```

#### package.json

```json
{
  "name": "my-team-app",
  "version": "1.0.0",
  "private": true
}
```

## Template differences

Both configs take files from `starter`. The basic edition adds two steps:

- `exclude` leaves out `src/analytics.ts`.
- `replace` removes the import and call from `src/main.ts`, so the entry point no longer refers to the deleted file.

The team edition keeps both files. In each edition, the generated `package.json` name matches the target directory: `my-basic-app` or `my-team-app`.

Shared fixes go into the source repository once. New projects use the selected preset when created; projects already generated need updating separately.

## Text replacement rules

`replace` matches exact text. After editing the entry point, check the config's `from` value too. Creation fails if that text can no longer be found.

This works for small, explicit file differences. Any references that need removing must be listed in the config. The CLI does not analyze module references or convert TypeScript automatically.

See [Preset Configs](https://preset.js.org/agent/guide/preset-configs.md) for more operations.
