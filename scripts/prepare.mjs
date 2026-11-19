import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const shell = process.platform === 'win32'

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell })
  if (result.status) process.exit(result.status ?? 1)
}

function tryRun(cmd, args) {
  spawnSync(cmd, args, { stdio: 'inherit', shell })
}

// Git/GitHub installs ship without `dist/` (gitignored). Build so package exports resolve.
if (!existsSync('dist/src/index.js')) {
  run('yarn', ['build'])
}

// Husky only for a developer checkout of this repo (has husky installed).
if (existsSync('.git') && existsSync('node_modules/husky')) {
  tryRun('husky', [])
}
