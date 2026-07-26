import { Buffer } from 'node:buffer'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

export const AUTHORING_ENDPOINT = '/__sectrack_authoring/overrides'
export const PAGE_TEXT_AUTHORING_ENDPOINT = '/__sectrack_authoring/page-text'
export const OVERRIDES_RELATIVE_PATH = 'src/content/localContentOverrides.json'

const editableModuleFields = new Set(['title', 'summary', 'learningQuestion'])
const localHostnames = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
const maximumBodyBytes = 2 * 1024 * 1024

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isSafeModuleId(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,99}$/iu.test(value)
}

function isSafeRouteKey(value) {
  return typeof value === 'string'
    && value.length > 1
    && value.length <= 500
    && value.startsWith('#/')
    && ![...value].some((character) => character.codePointAt(0) <= 31)
}

function isSafeSelector(value) {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 2000
    && !/[{},]/u.test(value)
}

function sanitizePageTextEntry(candidate) {
  if (!isRecord(candidate)) throw new Error('페이지 문구 정보가 올바르지 않습니다.')
  if (!isSafeRouteKey(candidate.routeKey)) throw new Error('페이지 경로가 올바르지 않습니다.')
  if (!isSafeSelector(candidate.selector)) throw new Error('화면 요소 선택자가 올바르지 않습니다.')
  if (!Number.isInteger(candidate.nodeIndex) || candidate.nodeIndex < 0 || candidate.nodeIndex > 100) {
    throw new Error('문구 위치가 올바르지 않습니다.')
  }
  if (typeof candidate.baseText !== 'string' || typeof candidate.text !== 'string') {
    throw new Error('원문과 수정 문구는 문자열이어야 합니다.')
  }
  if (!candidate.baseText.trim()) throw new Error('공백뿐인 문구는 수정 대상으로 저장할 수 없습니다.')
  if (candidate.baseText.length > 200_000 || candidate.text.length > 200_000) {
    throw new Error('한 문구는 20만 자를 초과할 수 없습니다.')
  }
  return {
    routeKey: candidate.routeKey,
    selector: candidate.selector,
    nodeIndex: candidate.nodeIndex,
    baseText: candidate.baseText,
    text: candidate.text,
  }
}

function assertSafeJson(value, path = 'payload') {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeJson(item, `${path}[${index}]`))
    return
  }
  if (!isRecord(value)) throw new Error(`${path}에 JSON으로 저장할 수 없는 값이 있습니다.`)

  for (const [key, child] of Object.entries(value)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) {
      throw new Error(`${path}에 허용되지 않는 키가 있습니다.`)
    }
    assertSafeJson(child, `${path}.${key}`)
  }
}

function sanitizeModuleFields(candidate) {
  if (!isRecord(candidate)) throw new Error('모듈 정보가 올바르지 않습니다.')
  const sanitized = {}
  for (const [key, value] of Object.entries(candidate)) {
    if (!editableModuleFields.has(key)) continue
    if (typeof value !== 'string') throw new Error(`${key} 값은 문자열이어야 합니다.`)
    if (!value.trim() && key !== 'learningQuestion') throw new Error(`${key} 값을 비워 둘 수 없습니다.`)
    sanitized[key] = value
  }
  if (!sanitized.title || !sanitized.summary) {
    throw new Error('모듈 제목과 요약은 필수입니다.')
  }
  return sanitized
}

function sanitizeBlocks(candidate) {
  if (!Array.isArray(candidate) || candidate.length === 0 || candidate.length > 200) {
    throw new Error('학습 블록은 1개 이상 200개 이하여야 합니다.')
  }
  candidate.forEach((block, index) => {
    if (!isRecord(block) || typeof block.type !== 'string' || !block.type.trim()) {
      throw new Error(`${index + 1}번째 학습 블록의 유형이 올바르지 않습니다.`)
    }
  })
  assertSafeJson(candidate, 'blocks')
  return globalThis.structuredClone(candidate)
}

export function updateOverrideDocument(document, payload) {
  if (!isRecord(document) || document.version !== 1 || !isRecord(document.modules)) {
    throw new Error('override 파일 형식이 올바르지 않습니다.')
  }
  if (!isRecord(payload) || !isSafeModuleId(payload.moduleId)) {
    throw new Error('모듈 ID가 올바르지 않습니다.')
  }

  return {
    ...document,
    version: 1,
    modules: {
      ...document.modules,
      [payload.moduleId]: {
        module: sanitizeModuleFields(payload.module),
        blocks: sanitizeBlocks(payload.blocks),
      },
    },
  }
}

export function removeModuleOverride(document, moduleId) {
  if (!isRecord(document) || document.version !== 1 || !isRecord(document.modules)) {
    throw new Error('override 파일 형식이 올바르지 않습니다.')
  }
  if (!isSafeModuleId(moduleId)) throw new Error('모듈 ID가 올바르지 않습니다.')
  const modules = { ...document.modules }
  delete modules[moduleId]
  return { ...document, version: 1, modules }
}

export function updatePageTextOverrideDocument(document, payload) {
  if (!isRecord(document) || document.version !== 1 || !isRecord(document.modules)) {
    throw new Error('override 파일 형식이 올바르지 않습니다.')
  }
  const entry = sanitizePageTextEntry(payload)
  const pageText = isRecord(document.pageText) ? document.pageText : {}
  const currentEntries = Array.isArray(pageText[entry.routeKey]) ? pageText[entry.routeKey] : []
  const matchingIndex = currentEntries.findIndex((item) => (
    item.selector === entry.selector
    && item.nodeIndex === entry.nodeIndex
    && item.baseText === entry.baseText
  ))
  const nextEntries = [...currentEntries]
  if (matchingIndex >= 0) nextEntries[matchingIndex] = entry
  else nextEntries.push(entry)
  if (nextEntries.length > 2000) throw new Error('한 페이지에 저장할 수 있는 문구 수를 초과했습니다.')

  return {
    ...document,
    version: 1,
    pageText: {
      ...pageText,
      [entry.routeKey]: nextEntries,
    },
  }
}

export function removePageTextOverride(document, payload) {
  if (!isRecord(document) || document.version !== 1 || !isRecord(document.modules)) {
    throw new Error('override 파일 형식이 올바르지 않습니다.')
  }
  const entry = sanitizePageTextEntry({ ...payload, text: payload?.text || '' })
  const pageText = isRecord(document.pageText) ? document.pageText : {}
  const currentEntries = Array.isArray(pageText[entry.routeKey]) ? pageText[entry.routeKey] : []
  const nextEntries = currentEntries.filter((item) => !(
    item.selector === entry.selector
    && item.nodeIndex === entry.nodeIndex
    && item.baseText === entry.baseText
  ))
  const nextPageText = { ...pageText }
  if (nextEntries.length) nextPageText[entry.routeKey] = nextEntries
  else delete nextPageText[entry.routeKey]
  return { ...document, version: 1, pageText: nextPageText }
}

async function readOverrideDocument(filePath) {
  const source = await readFile(filePath, 'utf8')
  const document = JSON.parse(source)
  if (!isRecord(document) || document.version !== 1 || !isRecord(document.modules)) {
    throw new Error('override 파일 형식이 올바르지 않습니다.')
  }
  return document
}

async function writeOverrideDocument(filePath, document) {
  await mkdir(dirname(filePath), { recursive: true })
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`
  try {
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8')
    await rename(temporaryPath, filePath)
  } finally {
    await unlink(temporaryPath).catch(() => {})
  }
}

function requestHostname(request) {
  const host = request.headers.host || ''
  if (host.startsWith('[')) return host.slice(0, host.indexOf(']') + 1).toLowerCase()
  return host.split(':')[0].toLowerCase()
}

function isLocalRequest(request) {
  return localHostnames.has(requestHostname(request))
}

function hasSameOrigin(request) {
  const origin = request.headers.origin
  if (!origin) return false
  try {
    return new globalThis.URL(origin).host === request.headers.host
  } catch {
    return false
  }
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > maximumBodyBytes) throw new Error('저장할 내용이 2MB를 초과했습니다.')
    chunks.push(chunk)
  }
  const source = Buffer.concat(chunks).toString('utf8')
  return JSON.parse(source || '{}')
}

function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

export function localContentAuthoringPlugin() {
  return {
    name: 'sectrack-local-content-authoring',
    apply: 'serve',
    configureServer(server) {
      const filePath = resolve(server.config.root, OVERRIDES_RELATIVE_PATH)
      server.middlewares.use(async (request, response, next) => {
        const pathname = new globalThis.URL(request.url || '/', 'http://localhost').pathname
        const isModuleEndpoint = pathname === AUTHORING_ENDPOINT
        const isPageTextEndpoint = pathname === PAGE_TEXT_AUTHORING_ENDPOINT
        if (!isModuleEndpoint && !isPageTextEndpoint) {
          next()
          return
        }
        if (!isLocalRequest(request)) {
          sendJson(response, 403, { error: '이 편집 API는 localhost에서만 사용할 수 있습니다.' })
          return
        }

        try {
          if (request.method === 'GET') {
            sendJson(response, 200, await readOverrideDocument(filePath))
            return
          }
          if (!['POST', 'DELETE'].includes(request.method) || !hasSameOrigin(request)) {
            sendJson(response, 403, { error: '같은 localhost 화면에서 보낸 저장 요청만 허용합니다.' })
            return
          }

          const payload = await readJsonBody(request)
          const current = await readOverrideDocument(filePath)
          const updated = isPageTextEndpoint
            ? request.method === 'POST'
              ? updatePageTextOverrideDocument(current, payload)
              : removePageTextOverride(current, payload)
            : request.method === 'POST'
              ? updateOverrideDocument(current, payload)
              : removeModuleOverride(current, payload.moduleId)
          await writeOverrideDocument(filePath, updated)
          server.watcher.emit('change', filePath)
          sendJson(response, 200, {
            ok: true,
            changedFile: OVERRIDES_RELATIVE_PATH,
            ...(isModuleEndpoint ? { moduleId: payload.moduleId } : { routeKey: payload.routeKey }),
          })
        } catch (error) {
          sendJson(response, 400, { error: error instanceof Error ? error.message : '저장하지 못했습니다.' })
        }
      })
    },
  }
}
