---
title: Preset Configs
description: Configure template sources and file operations with JSON.
order: 4
---

# Preset Configs

Use `preset.json` for templates in monorepo subdirectories or those that need file changes, such as removing tests or replacing the README.

Host the config on a website, then create a project from its URL:

```bash
preset init my-docs --from https://example.com/preset.json
```

Replace the example URL with the actual URL. Create Preset downloads the repository and applies the configured file and dependency changes.

## Write a config

This config copies `apps/starter` from the repository, excludes test files, writes a new README, and replaces workspace dependencies with published versions. `$schema` enables editor completion and validation:

```json
{
  "$schema": "https://preset.js.org/schema/preset.schema.json",
  "version": 1,
  "source": {
    "repo": "https://github.com/company/product.git",
    "directory": "apps/starter"
  },
  "exclude": ["src/app/__tests__", "vitest.config.ts"],
  "write": [
    {
      "path": "README.md",
      "lines": ["# Product Docs", "", "Run `pnpm dev` to begin."]
    }
  ],
  "packageJson": {
    "resolveWorkspace": true
  }
}
```

`source.directory` is relative to the repository root. Other paths are relative to the template directory, so this example processes files inside `apps/starter`.

File operations run in this order:

- `include` selects exact source-relative files or directories; omission selects all.
- `exclude` removes paths from that selection before copying.
- `write` creates or replaces a UTF-8 text file from an array of lines.
- `replace` replaces every exact text match in an existing UTF-8 file.
- `json` applies a recursive merge patch to an existing JSON object; a `null` value removes a key.

With `init`, the generated `package.json.name` is set to the project name.

## Select files with include and exclude

`include` lists exact files or directories relative to `source.directory`. Directories include their descendants; paths are not globs. Omit `include` to select all source files. With both fields present, `exclude` takes precedence. A selected directory is not flattened in the output.

```json
{
  "version": 1,
  "source": {
    "repo": "https://github.com/example/team-resources.git",
    "directory": "skills"
  },
  "include": ["code-review", "testing"],
  "exclude": ["testing/fixtures"]
}
```

An empty or null `include`, a missing selected path, or a selection with no files after exclusions fails. Symbolic links and paths outside the source are rejected. When `include` is present, file operations must stay within that selection and cannot recreate excluded files. Without `include`, existing transformation behavior is unchanged.

Repeat `--include` on `init` or `apply` to replace the entire config selection. Configured exclusions still apply. This option requires a JSON preset; it is not passed to official generators.

```bash
preset apply .agents/skills --from ./skills.json --include code-review --include writing
```

A static website can publish a base JSON config and turn checked items into repeated `--include` arguments. Department presets can keep their selections in JSON.

## Add files to an existing project

```bash
preset apply .agents/skills --from ./skills.json --dry-run
preset apply .agents/skills --from ./skills.json
```

`apply` accepts a local/remote JSON config or a registered private preset backed by a config. It adds missing files, skips identical files, and reports differing content or file types as conflicts before writing anything. On Unix, executable permission differences also count as conflicts. Unrelated files remain intact, and `package.json.name` is not automatically rewritten. Empty directories alone are not installed.

The command prints JSON with `add`, `skip`, and `conflicts`; conflicts produce a nonzero exit status in both normal and dry-run modes. `apply` has no `--yes` or overwrite mode. It rejects symbolic links along destination paths and does not follow them when publishing files. It does not synchronize deletions or automatically update modified files.

Unlike `init --dry-run`, `apply --dry-run` clones the source and runs configured transformations in temporary storage to compare actual files. It may query npm if workspace resolution is enabled, but does not create target directories or modify target files. Normal publication errors roll back this run's additions. Recovery failures report retained paths; forced termination or a system crash can leave partial additions. Avoid editing destination paths concurrently with an apply operation.

## Preview and replace files

Preview the creation plan:

```bash
preset init test-docs --from ./preset.json --dry-run
```

The JSON output lists the target directory, whether existing files would be replaced, the source, file operations, and metadata cleanup. Remote configs are fetched and validated, but previews never clone repositories, query npm versions, or change project files.

Before publishing, create a project from the local config and check the generated files:

```bash
preset init test-docs --from ./preset.json
```

Configs are loaded before any target changes, allowing `preset init . --from ./preset.json`. A nonempty target requires replacement confirmation; use `--yes` to allow replacement in scripts.

Projects are generated in a temporary directory first. If generation fails, existing target files stay intact. Backups are kept until replacement completes, and errors restore the originals. If restoration fails, the error reports the backup location. Forced process termination or a system crash can interrupt recovery.

## Resolve workspace dependencies

Monorepo templates need published versions in place of `workspace:` dependencies to install outside the repository. Set `packageJson.resolveWorkspace` to `true` to query and replace versions through `npm view`.

Queries use the npm configuration, including scoped private registries in `.npmrc`. Use `packageJson.workspaceVersions` to specify a version or range.

This `packageJson` config pins two dependencies and skips their registry queries:

```json
{
  "resolveWorkspace": true,
  "workspaceVersions": {
    "vue": "3.4.38",
    "@company/ui": "1.8.2"
  }
}
```

Resolution covers `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`, and requires a `package.json` in the generated project. Without a pin, `workspace:*` becomes `^<published-version>` and `workspace:~` becomes `~<published-version>`.

## Config validation

Use HTTPS for remote configs and their source repositories. HTTP is also accepted for trusted private networks, with a CLI warning. Remote configs cannot reference local files or SSH repository URLs.

Config files are limited to 1 MiB, with at most 1,000 operations in total across `include`, `exclude`, `write`, `replace`, and `json`. The CLI rejects unknown fields, unsupported versions, paths outside the generated project, and source symlinks. Config values never evaluate JavaScript or invoke a shell. The JSON Schema helps catch errors in the editor; the CLI validates the config again when it runs.

## Blackwork example

[Blackwork](https://github.com/chengpeiquan/blackwork) keeps its documentation template in a monorepo. Its `preset.json` selects the template directory, removes files used only in the monorepo, and resolves published Blackwork package versions. The project maintains both the template and its config.

See the [preset config reference](https://github.com/preset-cli/create-preset/blob/main/docs/preset-configs.md) for more fields and examples.
