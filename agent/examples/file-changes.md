# Edit files during project creation

After cloning a service starter, there are often demo files to remove, a README to rewrite, defaults to change, and a demo command to delete from `package.json`. When the edits are the same each time, put them in a preset.

> Fictional repository and commands. Replace them with your actual repository and config paths.

### Source files

#### index.js

```
console.log('Service ready')
```

#### demo.js

```
console.log('Sample data')
```

#### README.md

```
# Service starter

A template with sample data.
```

#### .env.example

```
APP_LABEL=Starter
```

#### package.json

```json
{
  "name": "service-starter",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node index.js",
    "demo": "node demo.js"
  }
}
```

### Team service

```bash
pnpm create preset init my-service --from ./presets/service.json
```

#### presets/service.json

```json
{
  "$schema": "https://preset.js.org/schema/preset.schema.json",
  "version": 1,
  "source": {
    "repo": "https://github.com/example/service-starter.git",
    "directory": ""
  },
  "exclude": [
    "demo.js"
  ],
  "write": [
    {
      "path": "README.md",
      "lines": [
        "# Team service",
        "",
        "Run `npm start` to start the service."
      ]
    }
  ],
  "replace": [
    {
      "path": ".env.example",
      "from": "APP_LABEL=Starter",
      "to": "APP_LABEL=Team"
    }
  ],
  "json": [
    {
      "path": "package.json",
      "value": {
        "scripts": {
          "demo": null
        }
      }
    }
  ]
}
```

#### Output directory: my-service

#### index.js

```
console.log('Service ready')
```

#### README.md

```
# Team service

Run `npm start` to start the service.
```

#### .env.example

```
APP_LABEL=Team
```

#### package.json

```json
{
  "name": "my-service",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node index.js"
  }
}
```

## Operation order

1. `exclude` skips `demo.js` during copying, leaving it out of the new project.
2. `write` rewrites `README.md`, with each entry in `lines` becoming one line in the file.
3. `replace` changes `APP_LABEL=Starter` to `APP_LABEL=Team` in `.env.example`.
4. `json` edits `package.json`. Setting `scripts.demo` to `null` removes that command and keeps `scripts.start`.

## Preview the creation plan

Save the config as `presets/service.json`, then add `--dry-run` to see the planned operations:

```bash
pnpm create preset init my-service --from ./presets/service.json --dry-run
```

This step does not download the repository, so it cannot check whether the original text in `replace` exists. After checking the plan, remove `--dry-run` to create the project and inspect the files.

See [Preset Configs](https://preset.js.org/agent/guide/preset-configs.md) for other fields.
