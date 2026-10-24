# Reuse skills across projects

Code review, documentation, and testing often use the same skills across projects. Keeping them in one shared repository saves finding and copying each folder whenever a new project needs them.

This example keeps three skills in the `skills` directory of `team-resources`. One config includes all three. The other uses `exclude` to leave out `testing` when it is not needed.

> Fictional repository and commands. Replace them with your actual repository and config paths.

### Source files

#### skills/code-review/SKILL.md

```
---
name: code-review
description: Review code changes for correctness and edge cases.
---

Read the diff. Report concrete problems with file references.
```

#### skills/writing/SKILL.md

```
---
name: writing
description: Edit project documentation for clarity.
---

Use short, direct sentences. Keep commands and API names accurate.
```

#### skills/testing/SKILL.md

```
---
name: testing
description: Check changed behavior with focused tests.
---

Read the project test commands. Cover the changed behavior and failure paths.
```

### All skills

```bash
pnpm create preset init .agents/skills --from ./presets/skills.json
```

#### presets/skills.json

```json
{
  "$schema": "https://preset.js.org/schema/preset.schema.json",
  "version": 1,
  "source": {
    "repo": "https://github.com/example/team-resources.git",
    "directory": "skills"
  }
}
```

#### Output directory: .agents/skills

#### code-review/SKILL.md

```
---
name: code-review
description: Review code changes for correctness and edge cases.
---

Read the diff. Report concrete problems with file references.
```

#### writing/SKILL.md

```
---
name: writing
description: Edit project documentation for clarity.
---

Use short, direct sentences. Keep commands and API names accurate.
```

#### testing/SKILL.md

```
---
name: testing
description: Check changed behavior with focused tests.
---

Read the project test commands. Cover the changed behavior and failure paths.
```

### Without testing

```bash
pnpm create preset init .agents/skills --from ./presets/skills-without-testing.json
```

#### presets/skills-without-testing.json

```json
{
  "$schema": "https://preset.js.org/schema/preset.schema.json",
  "version": 1,
  "source": {
    "repo": "https://github.com/example/team-resources.git",
    "directory": "skills"
  },
  "exclude": [
    "testing"
  ]
}
```

#### Output directory: .agents/skills

#### code-review/SKILL.md

```
---
name: code-review
description: Review code changes for correctness and edge cases.
---

Read the diff. Report concrete problems with file references.
```

#### writing/SKILL.md

```
---
name: writing
description: Edit project documentation for clarity.
---

Use short, direct sentences. Keep commands and API names accurate.
```

## Target directory

Run the example command from the project root with a new or empty `.agents/skills` directory as the target. For example, `skills/code-review/SKILL.md` in the repository becomes `.agents/skills/code-review/SKILL.md` in the project.

If the agent reads skills from another location, change the target path in the command. Several projects can use this repository without an npm package for distribution.

## Existing skills

Use `apply` to add skills while preserving the existing directory:

```bash
pnpm create preset apply .agents/skills --from ./presets/skills.json --include code-review --include writing
```

Repeated `--include` arguments replace the config's selection. Configured `exclude` paths still apply. Omit `--include` to use the config's list, or select all source files if it has no list.

Add `--dry-run` to generate temporary files and compare them before installation. Identical files are skipped. Different content, file types, or Unix executable permissions are reported as conflicts before any target writes. Resolve conflicts manually; `apply` does not overwrite or delete existing files. `init` still replaces a nonempty target after confirmation.

Create Preset does not sync updates automatically or link skills into other agents' directories. See [Preset configs](https://preset.js.org/agent/guide/preset-configs.md) for selection and rollback details.

Each preset reads one source repository. Skills from several repositories need collecting in one repository before this config can distribute them together.
