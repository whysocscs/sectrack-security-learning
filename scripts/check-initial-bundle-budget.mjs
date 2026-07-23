/* global console, process */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { brotliCompressSync, gzipSync } from 'node:zlib'

export const DEFAULT_INITIAL_GRAPH_GZIP_BUDGET_BYTES = 450 * 1024
export const DEFAULT_INITIAL_JS_RAW_ASSET_BUDGET_BYTES = 500 * 1024

function parsePositiveInteger(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new TypeError(`Budget must be a positive integer, received ${value}`)
  return parsed
}

function localAssetPath(reference) {
  if (!reference || /^(?:data:|https?:|\/\/)/i.test(reference)) return null
  const clean = reference.split(/[?#]/, 1)[0]
  return decodeURIComponent(clean.replace(/^\//, ''))
}

export function discoverInitialAssets(html) {
  const references = []
  for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) references.push({ reference: match[1], reason: 'module-entry' })
  for (const match of html.matchAll(/<link\b([^>]+)>/gi)) {
    const attributes = match[1]
    const rel = attributes.match(/\brel=["']([^"']+)["']/i)?.[1]?.toLowerCase()
    const href = attributes.match(/\bhref=["']([^"']+)["']/i)?.[1]
    if (href && (rel === 'modulepreload' || rel === 'stylesheet')) references.push({ reference: href, reason: rel })
  }

  const unique = new Map()
  for (const item of references) {
    const assetPath = localAssetPath(item.reference)
    if (assetPath && !unique.has(assetPath)) unique.set(assetPath, { ...item, assetPath })
  }
  return [...unique.values()]
}

function assetKind(assetPath) {
  if (/\.m?js$/i.test(assetPath)) return 'js'
  if (/\.css$/i.test(assetPath)) return 'css'
  return 'other'
}

export function inspectInitialBundle({
  distDir = path.resolve('dist'),
  graphGzipBudgetBytes = DEFAULT_INITIAL_GRAPH_GZIP_BUDGET_BYTES,
  jsRawAssetBudgetBytes = DEFAULT_INITIAL_JS_RAW_ASSET_BUDGET_BYTES,
} = {}) {
  const normalizedGraphGzipBudget = parsePositiveInteger(graphGzipBudgetBytes, DEFAULT_INITIAL_GRAPH_GZIP_BUDGET_BYTES)
  const normalizedJsRawAssetBudget = parsePositiveInteger(jsRawAssetBudgetBytes, DEFAULT_INITIAL_JS_RAW_ASSET_BUDGET_BYTES)
  const indexPath = path.join(distDir, 'index.html')
  const errors = []
  if (!existsSync(indexPath)) {
    return {
      pass: false,
      errors: [`Missing ${indexPath}. Run the production build first.`],
      graphGzipBudgetBytes: normalizedGraphGzipBudget,
      jsRawAssetBudgetBytes: normalizedJsRawAssetBudget,
      totals: { raw: 0, gzip: 0, brotli: 0, jsRaw: 0, jsGzip: 0, jsBrotli: 0 },
      assets: [],
    }
  }

  const html = readFileSync(indexPath, 'utf8')
  const discovered = discoverInitialAssets(html)
  const assets = []
  const root = path.resolve(distDir)
  for (const item of discovered) {
    const absolutePath = path.resolve(root, item.assetPath)
    if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
      errors.push(`Initial asset escapes dist: ${item.reference}`)
      continue
    }
    if (!existsSync(absolutePath)) {
      errors.push(`Missing initial asset: ${item.assetPath}`)
      continue
    }
    const bytes = readFileSync(absolutePath)
    assets.push({
      path: item.assetPath,
      reason: item.reason,
      kind: assetKind(item.assetPath),
      raw: bytes.length,
      gzip: gzipSync(bytes, { level: 9 }).length,
      brotli: brotliCompressSync(bytes).length,
    })
  }

  const sum = (items, field) => items.reduce((total, item) => total + item[field], 0)
  const jsAssets = assets.filter((asset) => asset.kind === 'js')
  const totals = {
    raw: sum(assets, 'raw'),
    gzip: sum(assets, 'gzip'),
    brotli: sum(assets, 'brotli'),
    jsRaw: sum(jsAssets, 'raw'),
    jsGzip: sum(jsAssets, 'gzip'),
    jsBrotli: sum(jsAssets, 'brotli'),
  }

  if (jsAssets.length === 0) errors.push('No initial JavaScript entry or modulepreload asset was found in dist/index.html.')
  if (totals.gzip > normalizedGraphGzipBudget) errors.push(`Initial HTML-linked graph gzip size ${totals.gzip} bytes exceeds budget ${normalizedGraphGzipBudget} bytes.`)
  for (const asset of jsAssets) {
    if (asset.raw > normalizedJsRawAssetBudget) errors.push(`Initial JavaScript asset ${asset.path} raw size ${asset.raw} bytes exceeds per-asset budget ${normalizedJsRawAssetBudget} bytes.`)
  }

  return {
    pass: errors.length === 0,
    errors,
    graphGzipBudgetBytes: normalizedGraphGzipBudget,
    jsRawAssetBudgetBytes: normalizedJsRawAssetBudget,
    totals,
    assets,
  }
}

function formatBytes(bytes) {
  return `${bytes.toLocaleString('en-US')} B`
}

export function formatBundleBudget(result) {
  const lines = [
    `SecTrack initial bundle budget ${result.pass ? 'PASS' : 'FAIL'}`,
    `initial JS: raw ${formatBytes(result.totals.jsRaw)} · gzip ${formatBytes(result.totals.jsGzip)} · brotli ${formatBytes(result.totals.jsBrotli)}`,
    `all HTML-linked assets: raw ${formatBytes(result.totals.raw)} · gzip ${formatBytes(result.totals.gzip)}`,
    `HTML-linked graph gzip budget: ${formatBytes(result.graphGzipBudgetBytes)}`,
    `initial JS raw per-asset budget: ${formatBytes(result.jsRawAssetBudgetBytes)}`,
    ...result.assets.map((asset) => `- ${asset.reason} ${asset.path}: raw ${formatBytes(asset.raw)} · gzip ${formatBytes(asset.gzip)}`),
    ...result.errors.map((error) => `ERROR: ${error}`),
  ]
  return lines.join('\n')
}

function parseArguments(argv) {
  const options = {
    distDir: path.resolve('dist'),
    graphGzipBudgetBytes: parsePositiveInteger(process.env.SECTRACK_INITIAL_GRAPH_GZIP_BUDGET_BYTES, DEFAULT_INITIAL_GRAPH_GZIP_BUDGET_BYTES),
    jsRawAssetBudgetBytes: parsePositiveInteger(process.env.SECTRACK_INITIAL_JS_RAW_ASSET_BUDGET_BYTES, DEFAULT_INITIAL_JS_RAW_ASSET_BUDGET_BYTES),
    json: false,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--json') options.json = true
    else if (argument === '--dist') options.distDir = path.resolve(argv[++index])
    else if (argument === '--graph-gzip-budget') options.graphGzipBudgetBytes = parsePositiveInteger(argv[++index])
    else if (argument === '--js-raw-asset-budget') options.jsRawAssetBudgetBytes = parsePositiveInteger(argv[++index])
    else throw new TypeError(`Unknown argument: ${argument}`)
  }
  return options
}

const isDirectExecution = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url

if (isDirectExecution) {
  try {
    const options = parseArguments(process.argv.slice(2))
    const result = inspectInitialBundle(options)
    console.log(options.json ? JSON.stringify(result, null, 2) : formatBundleBudget(result))
    if (!result.pass) process.exitCode = 1
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

export const scriptPath = fileURLToPath(import.meta.url)
