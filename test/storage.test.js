import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LEGACY_BACKUP_KEY,
  LEGACY_STORAGE_KEY,
  RECOVERY_BACKUP_KEY,
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

  removeItem(key) {
    this.operations.push({ type: 'remove', key })
    this.values.delete(key)
  }
}

class FirstV3WriteMismatchStorage extends MemoryStorage {
  constructor(entries = {}) {
    super(entries)
    this.corruptNextV3Write = true
  }

  setItem(key, value) {
    if (key === STORAGE_KEY && this.corruptNextV3Write) {
      this.corruptNextV3Write = false
      super.setItem(key, `${String(value)}x`)
      return
    }
    super.setItem(key, value)
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
    data: { learningPlanVersion: 1, ...data },
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
  assert.deepEqual(storedEnvelope.data.learningPlanMigration.storageSource, { source: 'legacy-v2', schemaVersion: 2 })
})

test('only an explicit v2 source remaps later week progress', () => {
  const raw = JSON.stringify({
    quizScores: { 3: { percent: 80 } },
    evidence: { 'week-3': { command: 'http' } },
    submissions: { 'week-3': { status: 'recorded' } },
    futureLegacyData: { retained: true },
  })
  const storage = new MemoryStorage({ [LEGACY_STORAGE_KEY]: raw })

  const result = createAdapter(storage).load()

  assert.equal(result.ok, true)
  assert.equal(result.progress.quizScores[2].percent, 80)
  assert.equal(result.progress.quizScores[3], undefined)
  assert.deepEqual(result.progress.evidence['week-2'], { command: 'http' })
  assert.equal(result.progress.evidence['week-3'], undefined)
  assert.deepEqual(result.progress.submissions['week-2'], { status: 'recorded' })
  assert.deepEqual(result.progress.futureLegacyData, { retained: true })
  assert.equal(storage.getItem(LEGACY_BACKUP_KEY), raw)
})

test('malformed v2 stays untouched and blocks migration and later saves', () => {
  const raw = '{"modulesRead":'
  const storage = new MemoryStorage({ [LEGACY_STORAGE_KEY]: raw })
  const adapter = createAdapter(storage)

  const loaded = adapter.load()

  assert.equal(loaded.ok, false)
  assert.equal(loaded.canPersist, false)
  assert.equal(loaded.recoveryRequired, true)
  assert.equal(loaded.warning.code, 'malformed-v2')
  assert.equal(storage.getItem(LEGACY_STORAGE_KEY), raw)
  assert.equal(storage.getItem(LEGACY_BACKUP_KEY), null)
  assert.equal(storage.getItem(STORAGE_KEY), null)

  const saved = adapter.save({ modulesRead: { accidental: true } })
  assert.equal(saved.ok, false)
  assert.equal(saved.canPersist, false)
  assert.equal(saved.recoveryRequired, true)
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
  assert.equal(loaded.recoveryRequired, true)
  assert.equal(saved.ok, false)
  assert.equal(saved.warning.code, 'malformed-v3')
  assert.equal(storage.getItem(STORAGE_KEY), raw)
  assert.deepEqual(storage.operations, [])
})

test('marker-less valid v3 is preserved byte-exact and enters recovery without remapping Week 03', () => {
  const raw = `  ${JSON.stringify({
    schemaVersion: STORAGE_SCHEMA_VERSION,
    generatedAt: FIXED_TIME,
    appVersion: 'test-app-1.2.3',
    data: {
      quizScores: { 3: { percent: 80 } },
      evidence: { 'week-3': { command: 'http' } },
      submissions: { 'week-3': { status: 'recorded' } },
      futureData: { nested: ['kept'] },
    },
  }, null, 2)}\n`
  const storage = new MemoryStorage({ [STORAGE_KEY]: raw })
  const adapter = createAdapter(storage)

  const loaded = adapter.load()
  const saved = adapter.save({ quizScores: { 2: { percent: 100 } } })
  const exported = adapter.exportRawRecovery()

  assert.equal(loaded.ok, false)
  assert.equal(loaded.warning.code, 'missing-learning-plan-version')
  assert.equal(loaded.recoveryRequired, true)
  assert.equal(loaded.canPersist, false)
  assert.equal(loaded.progress.quizScores[3].percent, 80)
  assert.equal(loaded.progress.quizScores[2], undefined)
  assert.deepEqual(loaded.progress.evidence['week-3'], { command: 'http' })
  assert.deepEqual(loaded.progress.submissions['week-3'], { status: 'recorded' })
  assert.deepEqual(loaded.progress.futureData, { nested: ['kept'] })
  assert.equal(saved.ok, false)
  assert.equal(saved.recoveryRequired, true)
  assert.equal(exported.ok, true)
  assert.equal(exported.text, raw)
  assert.equal(exported.backupSource, 'v3')
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

test('retired Week 03 XSS activity records remain in local storage', () => {
  const storage = new MemoryStorage({
    [STORAGE_KEY]: envelopeWith({
      labs: {
        'w4-report-evidence': { status: 'completed', completedAt: FIXED_TIME },
        'w4-filtering': { status: 'attempted', completedAt: FIXED_TIME },
      },
      activityRecords: {
        'w4-report-evidence': { reflection: '기존 학습 기록' },
        'w4-filtering': { reflection: '기존 필터 비교 기록' },
      },
    }),
  })

  const result = createAdapter(storage).load()

  assert.equal(result.ok, true)
  assert.equal(result.progress.labs['w4-report-evidence'].status, 'completed')
  assert.equal(result.progress.labs['w4-filtering'].status, 'attempted')
  assert.equal(result.progress.activityRecords['w4-report-evidence'].reflection, '기존 학습 기록')
  assert.equal(result.progress.activityRecords['w4-filtering'].reflection, '기존 필터 비교 기록')
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

test('confirmed recovery replace backs up corrupt raw exactly and preserves valid unknown fields', () => {
  const corruptRaw = '  {"schemaVersion":3,"generatedAt":"not-a-date"}\n'
  const replacementRaw = ` ${envelopeWith({
    quizScores: { 3: { percent: 80 } },
    customFutureField: { nested: ['preserved'] },
  })}\n`
  const storage = new MemoryStorage({ [STORAGE_KEY]: corruptRaw })
  const adapter = createAdapter(storage)

  const exportedRaw = adapter.exportRawRecovery()
  const blockedImport = adapter.importData(replacementRaw)
  const unconfirmed = adapter.replaceFromRecovery(replacementRaw)
  const invalid = adapter.replaceFromRecovery('{bad-json', { confirmed: true })

  assert.equal(exportedRaw.ok, true)
  assert.equal(exportedRaw.text, corruptRaw)
  assert.equal(exportedRaw.backupSource, 'v3')
  assert.equal(blockedImport.ok, false)
  assert.equal(blockedImport.recoveryRequired, true)
  assert.equal(unconfirmed.warning.code, 'recovery-confirmation-required')
  assert.equal(invalid.warning.code, 'invalid-json')
  assert.equal(storage.getItem(STORAGE_KEY), corruptRaw)
  assert.deepEqual(storage.operations, [])

  const replaced = adapter.replaceFromRecovery(replacementRaw, { confirmed: true })
  const loaded = adapter.load()

  assert.equal(replaced.ok, true)
  assert.equal(replaced.source, 'recovery-replace')
  assert.equal(replaced.canPersist, true)
  assert.equal(replaced.recoveryRequired, false)
  assert.equal(replaced.backupKey, RECOVERY_BACKUP_KEY)
  assert.equal(replaced.backupSource, 'v3')
  assert.equal(storage.getItem(RECOVERY_BACKUP_KEY), corruptRaw)
  assert.equal(storage.getItem(STORAGE_KEY), replacementRaw)
  assert.equal(loaded.ok, true)
  assert.equal(loaded.progress.quizScores[3].percent, 80)
  assert.deepEqual(loaded.progress.customFutureField, { nested: ['preserved'] })
  assert.equal(adapter.save({ ...loaded.progress, lastActivityAt: FIXED_TIME }).ok, true)
})

test('confirmed recovery reset writes a fresh current envelope after an exact backup', () => {
  const corruptRaw = '{"schemaVersion":3,"generatedAt":"not-a-date"}'
  const storage = new MemoryStorage({ [STORAGE_KEY]: corruptRaw })
  const adapter = createAdapter(storage)

  const unconfirmed = adapter.resetAfterRecovery()
  assert.equal(unconfirmed.warning.code, 'recovery-confirmation-required')
  assert.equal(storage.getItem(STORAGE_KEY), corruptRaw)
  assert.deepEqual(storage.operations, [])

  const reset = adapter.resetAfterRecovery({ confirmed: true })
  const loaded = adapter.load()

  assert.equal(reset.ok, true)
  assert.equal(reset.source, 'recovery-reset')
  assert.equal(reset.canPersist, true)
  assert.equal(reset.recoveryRequired, false)
  assert.equal(storage.getItem(RECOVERY_BACKUP_KEY), corruptRaw)
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).data.learningPlanVersion, 1)
  assert.equal(loaded.ok, true)
  assert.deepEqual(loaded.progress.quizScores, {})
  assert.equal(adapter.save({ ...loaded.progress, lastActivityAt: FIXED_TIME }).ok, true)
})

test('recovery replacement rolls back when byte-exact read-back verification fails', () => {
  const corruptRaw = '{"schemaVersion":3,"generatedAt":"not-a-date"}'
  const replacementRaw = envelopeWith({ customFutureField: { retained: true } })
  const storage = new FirstV3WriteMismatchStorage({ [STORAGE_KEY]: corruptRaw })
  const adapter = createAdapter(storage)

  const result = adapter.replaceFromRecovery(replacementRaw, { confirmed: true })

  assert.equal(result.ok, false)
  assert.equal(result.warning.code, 'recovery-write-verification-failed')
  assert.equal(result.recoveryRequired, true)
  assert.equal(storage.getItem(RECOVERY_BACKUP_KEY), corruptRaw)
  assert.equal(storage.getItem(STORAGE_KEY), corruptRaw)
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
