#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { prepareRelease, binaryNames } = require('./prepare-release');

const root = path.join(__dirname, '..');
const binaryMap = {
  'darwin-arm64': 'preset-darwin-arm64',
  'darwin-x64': 'preset-darwin-x64',
  'linux-x64': 'preset-linux-x64',
  'linux-arm64': 'preset-linux-arm64',
  'win32-x64': 'preset-win-x64.exe',
};
const binaryName = binaryMap[`${process.platform}-${process.arch}`];
assert(binaryName, 'Unsupported smoke-test platform');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'preset-package-'));
// Test the npm distribution even when pnpm runs this script. Invoke npm through
// Node to avoid shell-specific quoting and Windows .cmd resolution.
const nodeDirectory = path.dirname(process.execPath);
const npmCli = [
  process.env.npm_execpath,
  path.join(nodeDirectory, 'node_modules/npm/bin/npm-cli.js'),
  path.resolve(nodeDirectory, '../lib/node_modules/npm/bin/npm-cli.js'),
].find((file) => file && /^npm(?:-cli)?\.(?:c?js|mjs)$/.test(path.basename(file)) && fs.existsSync(file));
assert(npmCli, 'The npm CLI bundled with Node.js is required for package verification');

function run(program, args, cwd) {
  const result = spawnSync(program, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, PRESET_LANG: 'en-US' },
    timeout: 120000,
  });
  assert(!result.error, result.error && result.error.message);
  assert.strictEqual(result.status, 0, `${program} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

try {
  const artifacts = path.join(temporary, 'artifacts');
  fs.mkdirSync(artifacts);
  const incomplete = path.join(temporary, 'incomplete');
  assert.throws(() => prepareRelease({ binaryDirectory: artifacts, outputDirectory: incomplete }), /Missing release binaries/);
  assert(!fs.existsSync(incomplete));
  // Simulate all five downloaded artifacts, including their lost permissions.
  // Only the host binary is executed; each platform runs this check in CI.
  for (const name of binaryNames) {
    const downloaded = path.join(artifacts, name, name);
    fs.mkdirSync(path.dirname(downloaded), { recursive: true });
    fs.copyFileSync(path.join(root, 'binaries', binaryName), downloaded);
    fs.chmodSync(downloaded, 0o644);
  }
  const distribution = path.join(temporary, 'dist');
  prepareRelease({ binaryDirectory: artifacts, outputDirectory: distribution });
  if (process.platform !== 'win32') {
    for (const name of binaryNames.filter((name) => !name.endsWith('.exe'))) {
      assert.strictEqual(fs.statSync(path.join(distribution, 'binaries', name)).mode & 0o777, 0o755);
    }
  }
  const version = require(path.join(root, 'package.json')).version;
  assert.strictEqual(run(process.execPath, ['bin/preset.js', '--version'], distribution).trim(), `preset ${version}`);
  const packed = JSON.parse(run(process.execPath, [npmCli, 'pack', '--json', '--ignore-scripts'], distribution))[0];
  for (const required of ['bin/preset.js', 'schema/preset.schema.json', ...binaryNames.map((name) => `binaries/${name}`)]) {
    assert(packed.files.some((file) => file.path === required), `Package is missing ${required}`);
  }
  for (const config of ['pnpm-lock.yaml', 'pnpm-workspace.yaml', '.npmrc']) {
    assert(!packed.files.some((file) => file.path === config), `Package includes development config ${config}`);
  }
  const consumer = path.join(temporary, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'preset-smoke',
    private: true,
    scripts: {
      'smoke:preset': 'preset --version',
      'smoke:create-preset': 'create-preset --version',
    },
  }));
  run(process.execPath, [npmCli, 'install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', path.join(distribution, packed.filename)], consumer);
  for (const name of ['preset', 'create-preset']) {
    // npm runs the actual installed bin shim using the platform's own runner.
    const result = run(process.execPath, [npmCli, '--silent', 'run', `smoke:${name}`], consumer);
    assert.strictEqual(result.trim(), `preset ${version}`);
  }
  const wrapper = path.join(consumer, 'node_modules/create-preset/bin/preset.js');
  assert(run(process.execPath, [wrapper, '--list'], consumer).includes('vite'));
  const preview = JSON.parse(run(process.execPath, [wrapper, 'init', 'demo', '--from', 'vite', '--dry-run'], consumer));
  assert.strictEqual(preview.source.id, 'vite');
  assert(!fs.existsSync(path.join(consumer, 'demo')));
  const source = path.join(temporary, 'skill-source');
  fs.mkdirSync(path.join(source, 'skills', 'review'), { recursive: true });
  fs.mkdirSync(path.join(source, 'skills', 'writing'), { recursive: true });
  fs.writeFileSync(path.join(source, 'skills', 'review', 'SKILL.md'), 'review');
  fs.writeFileSync(path.join(source, 'skills', 'writing', 'SKILL.md'), 'writing');
  run('git', ['init', '--quiet'], source);
  run('git', ['add', '.'], source);
  run('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', 'commit', '--quiet', '-m', 'fixture'], source);
  const config = path.join(consumer, 'skills.json');
  fs.writeFileSync(config, JSON.stringify({
    version: 1,
    source: { repo: require('url').pathToFileURL(source).href, directory: 'skills' },
    include: ['writing'],
  }));
  const args = [wrapper, 'apply', '.agents/skills', '--from', config, '--include', 'review'];
  const applyPreview = JSON.parse(run(process.execPath, [...args, '--dry-run'], consumer));
  assert.strictEqual(applyPreview.add.length, 1);
  assert(!fs.existsSync(path.join(consumer, '.agents')));
  run(process.execPath, args, consumer);
  assert.strictEqual(fs.readFileSync(path.join(consumer, '.agents/skills/review/SKILL.md'), 'utf8'), 'review');
  assert(!fs.existsSync(path.join(consumer, '.agents/skills/writing')));
  const repeated = JSON.parse(run(process.execPath, args, consumer));
  assert.strictEqual(repeated.skip.length, 1);
  console.log('Package smoke passed: artifact permissions, tarball contents, installed commands, include selection and repeatable apply.');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
