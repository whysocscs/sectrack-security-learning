import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  DEFAULT_INITIAL_GRAPH_GZIP_BUDGET_BYTES,
  DEFAULT_INITIAL_JS_RAW_ASSET_BUDGET_BYTES,
  discoverInitialAssets,
  inspectInitialBundle,
} from '../scripts/check-initial-bundle-budget.mjs'

test('initial bundle discovery counts only HTML-linked entry, preload, and stylesheet assets', async (context) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'sectrack-bundle-budget-'))
  context.after(() => rm(directory, { recursive: true, force: true }))
  await mkdir(path.join(directory, 'assets'))
  await writeFile(path.join(directory, 'index.html'), `
    <link rel="stylesheet" href="/assets/app.css">
    <link rel="modulepreload" href="/assets/vendor.js">
    <script type="module" src="/assets/app.js"></script>
  `)
  await writeFile(path.join(directory, 'assets/app.css'), 'body { color: #123; }')
  await writeFile(path.join(directory, 'assets/vendor.js'), 'export const vendor = true;')
  await writeFile(path.join(directory, 'assets/app.js'), 'import("./lazy.js"); console.log("entry");')
  await writeFile(path.join(directory, 'assets/lazy.js'), 'console.log("lazy");')

  const result = inspectInitialBundle({
    distDir: directory,
    graphGzipBudgetBytes: DEFAULT_INITIAL_GRAPH_GZIP_BUDGET_BYTES,
    jsRawAssetBudgetBytes: DEFAULT_INITIAL_JS_RAW_ASSET_BUDGET_BYTES,
  })
  assert.equal(result.pass, true)
  assert.deepEqual(result.assets.map((asset) => asset.path).sort(), ['assets/app.css', 'assets/app.js', 'assets/vendor.js'])
  assert.ok(result.totals.jsGzip > 0)
  assert.equal(result.assets.some((asset) => asset.path.endsWith('lazy.js')), false)
})

test('initial bundle budget fails closed for a missing entry and an exceeded graph gzip budget', async (context) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'sectrack-bundle-budget-'))
  context.after(() => rm(directory, { recursive: true, force: true }))
  await mkdir(path.join(directory, 'assets'))
  await writeFile(path.join(directory, 'index.html'), '<script type="module" src="/assets/app.js"></script>')
  await writeFile(path.join(directory, 'assets/app.js'), Array.from({ length: 400 }, (_, index) => `export const value${index} = "${index}-${String(index).padStart(5, '0')}";`).join('\n'))

  const exceeded = inspectInitialBundle({ distDir: directory, graphGzipBudgetBytes: 32 })
  assert.equal(exceeded.pass, false)
  assert.match(exceeded.errors.join('\n'), /graph gzip size .* exceeds budget/)

  const assets = discoverInitialAssets('<script type="module" src="/assets/missing.js"></script>')
  assert.deepEqual(assets.map((asset) => asset.assetPath), ['assets/missing.js'])
  await writeFile(path.join(directory, 'index.html'), '<script type="module" src="/assets/missing.js"></script>')
  const missing = inspectInitialBundle({ distDir: directory, graphGzipBudgetBytes: 32 })
  assert.equal(missing.pass, false)
  assert.match(missing.errors.join('\n'), /Missing initial asset|No initial JavaScript/)
})

test('initial bundle budget rejects one oversized raw JavaScript asset even when it compresses well', async (context) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'sectrack-bundle-budget-'))
  context.after(() => rm(directory, { recursive: true, force: true }))
  await mkdir(path.join(directory, 'assets'))
  await writeFile(path.join(directory, 'index.html'), '<script type="module" src="/assets/app.js"></script>')
  await writeFile(path.join(directory, 'assets/app.js'), '0'.repeat(2_048))

  const result = inspectInitialBundle({
    distDir: directory,
    graphGzipBudgetBytes: 1_024,
    jsRawAssetBudgetBytes: 1_024,
  })
  assert.equal(result.totals.gzip < result.graphGzipBudgetBytes, true)
  assert.equal(result.pass, false)
  assert.match(result.errors.join('\n'), /raw size .* exceeds per-asset budget/)
})
