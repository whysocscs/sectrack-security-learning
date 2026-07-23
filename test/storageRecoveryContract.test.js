import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LEGACY_BACKUP_KEY,
  LEGACY_STORAGE_KEY,
  RECOVERY_BACKUP_KEY,
  STORAGE_KEY,
  STORAGE_SCHEMA_VERSION,
  createStorageAdapter,
} from '../src/storage.js'

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]))
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null },
    setItem(key, value) { values.set(key, String(value)) },
    removeItem(key) { values.delete(key) },
    snapshot() { return Object.fromEntries(values) },
  }
}

function adapterFor(storage) {
  return createStorageAdapter({
    storage,
    appVersion: 'contract-test',
    now: () => new Date('2026-07-15T00:00:00.000Z'),
  })
}

test('fresh storage writes a marked v3 envelope and loads it without changing learner state', () => {
  const storage = memoryStorage()
  const adapter = adapterFor(storage)
  const fresh = adapter.load()
  assert.equal(fresh.ok, true)
  assert.equal(fresh.source, 'empty')
  assert.equal(fresh.canPersist, true)

  const saved = adapter.save({ modulesRead: { 'w1-shell': true }, reports: { sample: { status: 'draft' } } })
  assert.equal(saved.ok, true)
  const envelope = JSON.parse(storage.getItem(STORAGE_KEY))
  assert.equal(envelope.schemaVersion, STORAGE_SCHEMA_VERSION)
  assert.equal(envelope.appVersion, 'contract-test')
  assert.equal(envelope.data.modulesRead['w1-shell'], true)

  const reloaded = adapter.load()
  assert.equal(reloaded.ok, true)
  assert.equal(reloaded.source, 'v3')
  assert.equal(reloaded.progress.modulesRead['w1-shell'], true)
  assert.equal(reloaded.progress.reports.sample.status, 'draft')
})

test('corrupt, unmarked, and future v3 values are preserved and block automatic overwrite', () => {
  const cases = [
    ['corrupt JSON', '{not-json', 'malformed-v3'],
    [
      'unmarked learning plan',
      JSON.stringify({ schemaVersion: STORAGE_SCHEMA_VERSION, generatedAt: '2026-07-15T00:00:00.000Z', appVersion: 'unmarked', data: {} }),
      'missing-learning-plan-version',
    ],
    ['future schema marker', JSON.stringify({ schemaVersion: STORAGE_SCHEMA_VERSION + 1, generatedAt: '2026-07-15T00:00:00.000Z', appVersion: 'future', data: {} }), 'malformed-v3'],
  ]

  for (const [label, raw, warningCode] of cases) {
    const storage = memoryStorage({ [STORAGE_KEY]: raw })
    const adapter = adapterFor(storage)
    const loaded = adapter.load()
    assert.equal(loaded.ok, false, label)
    assert.equal(loaded.canPersist, false, label)
    assert.equal(loaded.recoveryRequired, true, label)
    assert.equal(loaded.warning.code, warningCode, label)

    const save = adapter.save({ modulesRead: { overwritten: true } })
    assert.equal(save.ok, false, label)
    assert.equal(save.canPersist, false, label)
    assert.equal(storage.getItem(STORAGE_KEY), raw, `${label} must remain byte-for-byte intact`)
  }
})

test('legacy v2 migration creates an exact backup before a marked v3 value', () => {
  const legacyRaw = JSON.stringify({ modulesRead: { 'w1-shell': true }, settings: { fontScale: '150' } })
  const storage = memoryStorage({ [LEGACY_STORAGE_KEY]: legacyRaw })
  const loaded = adapterFor(storage).load()

  assert.equal(loaded.ok, true)
  assert.equal(loaded.source, 'v2')
  assert.equal(loaded.migrated, true)
  assert.equal(storage.getItem(LEGACY_STORAGE_KEY), legacyRaw)
  assert.equal(storage.getItem(LEGACY_BACKUP_KEY), legacyRaw)
  const envelope = JSON.parse(storage.getItem(STORAGE_KEY))
  assert.equal(envelope.schemaVersion, STORAGE_SCHEMA_VERSION)
  assert.equal(envelope.data.modulesRead['w1-shell'], true)
  assert.equal(envelope.data.settings.fontScale, '150')
})

test('recovery requires explicit confirmation, preserves a byte-exact backup, and then resumes persistence', () => {
  const raw = '{malformed-original'
  const storage = memoryStorage({ [STORAGE_KEY]: raw })
  const adapter = adapterFor(storage)
  const loaded = adapter.load()
  const recovery = adapter.exportRawRecovery()
  const replacement = adapterFor(memoryStorage()).exportData({ modulesRead: { 'w1-shell': true } })

  assert.equal(loaded.ok, false)
  assert.equal(recovery.ok, true)
  assert.equal(recovery.text, raw)
  assert.equal(recovery.recoveryRequired, true)

  const unconfirmed = adapter.replaceFromRecovery(replacement.text)
  assert.equal(unconfirmed.ok, false)
  assert.equal(unconfirmed.warning.code, 'recovery-confirmation-required')
  assert.equal(storage.getItem(STORAGE_KEY), raw)

  const replaced = adapter.replaceFromRecovery(replacement.text, { confirmed: true })
  assert.equal(replaced.ok, true)
  assert.equal(storage.getItem(RECOVERY_BACKUP_KEY), raw)
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).schemaVersion, STORAGE_SCHEMA_VERSION)
  assert.equal(adapter.load().progress.modulesRead['w1-shell'], true)
})
