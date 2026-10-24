# Extract a project from a monorepo

The docs starter lives in `apps/docs` and the component library in `packages/ui`. A new docs site only needs the starter, but copying that directory still leaves test files to remove and `workspace:` dependencies to fix.

The config below handles those steps together: take files from `apps/docs`, exclude `src/__tests__`, and set the component library dependency to a specific version.

> Fictional repository and commands. Replace them with your actual repository and config paths.

### Source files

#### apps/docs/src/page.ts

```
import { Button } from '@example/ui'

export const action = Button({ label: 'Get started' })
```

#### apps/docs/package.json

```json
{
  "name": "docs-starter",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@example/ui": "workspace:*"
  }
}
```

#### apps/docs/src/__tests__/page.test.ts

```
// Tests used while maintaining this starter.
```

#### packages/ui/package.json

```json
{
  "name": "@example/ui",
  "version": "1.2.3"
}
```

#### pnpm-workspace.yaml

```
packages:
  - apps/*
  - packages/*
```

### Standalone docs

```bash
pnpm create preset init my-docs --from ./presets/docs.json
```

#### presets/docs.json

```json
{
  "$schema": "https://preset.js.org/schema/preset.schema.json",
  "version": 1,
  "source": {
    "repo": "https://github.com/example/product.git",
    "directory": "apps/docs"
  },
  "exclude": [
    "src/__tests__"
  ],
  "packageJson": {
    "resolveWorkspace": true,
    "workspaceVersions": {
      "@example/ui": "1.2.3"
    }
  }
}
```

#### Output directory: my-docs

#### src/page.ts

```
import { Button } from '@example/ui'

export const action = Button({ label: 'Get started' })
```

#### package.json

```json
{
  "name": "my-docs",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@example/ui": "1.2.3"
  }
}
```

## Subdirectory and file exclusions

With `source.directory` set to `apps/docs`, that directory's contents become the new project's root files. Neither `packages/ui` nor the repository's root `pnpm-workspace.yaml` is copied.

Paths in `exclude` start from the selected directory too. Use `src/__tests__`, without the `apps/docs` prefix.

## Workspace dependency conversion

Enable `packageJson.resolveWorkspace` and set `@example/ui` to `1.2.3` in `workspaceVersions`. The generated `package.json` uses that version in place of `workspace:*`, with no registry lookup for this package.

`@example/ui` is an example name. Use a published package and version that the environment can install. This changes the dependency version; it does not copy or bundle the component source from `packages/ui`.

Without a specified version, the CLI queries `npm view` using the current npm registry settings. See [Resolve workspace dependencies](https://preset.js.org/agent/guide/preset-configs.md#resolve-workspace-dependencies) for the full rules.
