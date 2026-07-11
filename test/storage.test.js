import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LEGACY_BACKUP_KEY,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  STORAGE_LIMITS,
  STORAGE_SCHEMA_VERSION,
  createStorageAdapter,
} from '../src/storage.js'

const FIXED_TIME = '2026-07-11T03:04:05.000Z'

class MemoryStorage {
  constructor(entries = {}) {
    this.values = new Map(Object.entries(entries))
    this.operations = []
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null
  }

  setItem(key, value) {
    const text = String(value)
    this.operations.push({ type: 'set', key, value: text })
    this.values.set(key, text)
  }
}

function createAdapter(storage, options = {}) {
  return createStorageAdapter({
    storage,
    appVersion: 'test-app-1.2.3',
    now: () => new Date(FIXED_TIME),
    ...options,
  })
}

function envelopeWith(data, overrides = {}) {
  return JSON.stringify({
    schemaVersion: STORAGE_SCHEMA_VERSION,
    generatedAt: FIXED_TIME,
    appVersion: 'test-app-1.2.3',
    data,
    ...overrides,
  })
}

test('valid v2 is backed up exactly before migration and is never changed', () => {
  const legacy = {
    modulesRead: { 'w0-intro': true },
    mindmap: { notes: { xss: '컨텍스트를 먼저 확인한다.' } },
    moduleNotes: { 'w0-intro': '기존 학습 메모' },
    futureLegacyData: { retained: true, constructor: 'lesson-field' },
  }
  const raw = `  ${JSON.stringify(legacy, null, 2)}\n`
  const storage = new MemoryStorage({ [LEGACY_STORAGE_KEY]: raw })

  const result = createAdapter(storage).load()

  assert.equal(result.ok, true)
  assert.equal(result.source, 'v2')
  assert.equal(result.migrated, true)
  assert.equal(result.canPersist, true)
  assert.equal(storage.getItem(LEGACY_STORAGE_KEY), raw)
  assert.equal(storage.getItem(LEGACY_BACKUP_KEY), raw)
  assert.deepEqual(storage.operations.map(({ key }) => key), [LEGACY_BACKUP_KEY, STORAGE_KEY])

  const storedEnvelope = JSON.parse(storage.getItem(STORAGE_KEY))
  assert.equal(storedEnvelope.schemaVersion, STORAGE_SCHEMA_VERSION)
  assert.equal(storedEnvelope.generatedAt, FIXED_TIME)
  assert.equal(storedEnvelope.appVersion, 'test-app-1.2.3')
  assert.equal(storedEnvelope.data.modulesRead['w0-intro'], true)
  assert.equal(storedEnvelope.data.moduleNotes['w0-intro'], '기존 학습 메모')
  assert.deepEqual(storedEnvelope.data.futureLegacyData, { retained: true, constructor: 'lesson-field' })
  assert.deepEqual(storedEnvelope.data.reports, {})
})

test('malformed v2 stays untouched and blocks migration and later saves', () => {
  const raw = '{"modulesRead":'
  const storage = new MemoryStorage({ [LEGACY_STORAGE_KEY]: raw })
  const adapter = createAdapter(storage)

  const loaded = adapter.load()

  assert.equal(loaded.ok, false)
  assert.equal(loaded.canPersist, false)
  assert.equal(loaded.warning.code, 'malformed-v2')
  assert.equal(storage.getItem(LEGACY_STORAGE_KEY), raw)
  assert.equal(storage.getItem(LEGACY_BACKUP_KEY), null)
  assert.equal(storage.getItem(STORAGE_KEY), null)

  const saved = adapter.save({ modulesRead: { accidental: true } })
  assert.equal(saved.ok, false)
  assert.equal(saved.canPersist, false)
  assert.equal(saved.warning.code, 'malformed-v2')
  assert.equal(storage.getItem(LEGACY_STORAGE_KEY), raw)
  assert.equal(storage.getItem(STORAGE_KEY), null)
  assert.deepEqual(storage.operations, [])
})

test('malformed v3 stays untouched and blocks default autosaves', () => {
  const raw = '{"schemaVersion":3,"generatedAt":"not-a-date"}'
  const storage = new MemoryStorage({ [STORAGE_KEY]: raw })
  const adapter = createAdapter(storage)

  const loaded = adapter.load()
  const saved = adapter.save({})

  assert.equal(loaded.ok, false)
  assert.equal(loaded.warning.code, 'malformed-v3')
  assert.equal(loaded.canPersist, false)
  assert.equal(saved.ok, false)
  assert.equal(saved.warning.code, 'malformed-v3')
  assert.equal(storage.getItem(STORAGE_KEY), raw)
  assert.deepEqual(storage.operations, [])
})

test('partial v3 data is merged with defaults without dropping unknown data', () => {
  const storage = new MemoryStorage({
    [STORAGE_KEY]: envelopeWith({
      modulesRead: { partial: true },
      moduleNotes: { partial: '자동 저장할 메모' },
      futureData: { nested: ['kept'] },
    }),
  })

  const result = createAdapter(storage).load()

  assert.equal(result.ok, true)
  assert.equal(result.source, 'v3')
  assert.equal(result.progress.modulesRead.partial, true)
  assert.equal(result.progress.moduleNotes.partial, '자동 저장할 메모')
  assert.deepEqual(result.progress.futureData, { nested: ['kept'] })
  assert.deepEqual(result.progress.labs, {})
  assert.deepEqual(result.progress.mindmap.statuses, {})
  assert.deepEqual(result.progress.mindmap.notes, {})
  assert.deepEqual(result.progress.mindmap.customNodes, [])
  assert.deepEqual(result.progress.mindmap.interests, [])
  assert.equal(result.progress.mindmap.view.mode, 'roles')
})

test('export and import round-trip progress with required envelope metadata', () => {
  const progress = {
    modulesRead: { 'w2-http': true },
    moduleNotes: { 'w2-http': '요청과 응답을 분리해서 기록' },
    reports: { draft: { title: '로컬 보고서 초안' } },
    customFutureField: { enabled: true },
  }
  const exported = createAdapter(new MemoryStorage()).exportData(progress)

  assert.equal(exported.ok, true)
  const decoded = JSON.parse(exported.text)
  assert.equal(decoded.schemaVersion, STORAGE_SCHEMA_VERSION)
  assert.equal(decoded.generatedAt, FIXED_TIME)
  assert.equal(decoded.appVersion, 'test-app-1.2.3')

  const targetStorage = new MemoryStorage()
  const targetAdapter = createAdapter(targetStorage)
  const imported = targetAdapter.importData(exported.text)
  const loaded = targetAdapter.load()

  assert.equal(imported.ok, true)
  assert.equal(imported.source, 'import')
  assert.equal(loaded.ok, true)
  assert.deepEqual(loaded.progress, exported.progress)
  assert.equal(loaded.progress.moduleNotes['w2-http'], '요청과 응답을 분리해서 기록')
  assert.deepEqual(loaded.progress.customFutureField, { enabled: true })
})

test('import rejects oversized input and recursively oversized strings without writing', () => {
  const sizeStorage = new MemoryStorage()
  const sizeAdapter = createAdapter(sizeStorage, { limits: { maxInputBytes: 512 } })
  const oversized = sizeAdapter.importData('x'.repeat(513))

  assert.equal(oversized.ok, false)
  assert.equal(oversized.warning.code, 'input-too-large')
  assert.equal(sizeStorage.getItem(STORAGE_KEY), null)
  assert.deepEqual(sizeStorage.operations, [])

  const stringStorage = new MemoryStorage()
  const stringAdapter = createAdapter(stringStorage)
  const longString = envelopeWith({
    reports: { draft: { nested: { body: '가'.repeat(STORAGE_LIMITS.maxStringLength + 1) } } },
  })
  const rejectedString = stringAdapter.importData(longString)

  assert.equal(rejectedString.ok, false)
  assert.equal(rejectedString.warning.code, 'string-too-long')
  assert.match(rejectedString.warning.detail, /reports\.draft\.nested\.body/)
  assert.equal(stringStorage.getItem(STORAGE_KEY), null)
  assert.deepEqual(stringStorage.operations, [])
})

test('recursive field limits reject deeply accumulated object fields', () => {
  const fields = {}
  for (let index = 0; index < STORAGE_LIMITS.maxFields; index += 1) fields[`field-${index}`] = true
  const storage = new MemoryStorage()

  const result = createAdapter(storage).importData(envelopeWith({ nested: fields }))

  assert.equal(result.ok, false)
  assert.equal(result.warning.code, 'too-many-fields')
  assert.equal(storage.getItem(STORAGE_KEY), null)
})
