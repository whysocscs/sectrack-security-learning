import { mergeProgress } from './platformLogic.js'

export const STORAGE_SCHEMA_VERSION = 3
export const STORAGE_KEY = 'sectrack-orchestrator-v3'
export const LEGACY_STORAGE_KEY = 'sectrack-orchestrator-v2'
export const LEGACY_BACKUP_KEY = 'sectrack-orchestrator-v2-backup'
export const RECOVERY_BACKUP_KEY = 'sectrack-orchestrator-recovery-backup'
export const DEFAULT_APP_VERSION = '0.1.0'

const CURRENT_LEARNING_PLAN_VERSION = 1

export const STORAGE_LIMITS = Object.freeze({
  maxInputBytes: 2 * 1024 * 1024,
  maxFields: 10_000,
  maxStringLength: 100_000,
  maxKeyLength: 256,
  maxDepth: 20,
  maxArrayLength: 10_000,
})

const ENVELOPE_FIELDS = new Set(['schemaVersion', 'generatedAt', 'appVersion', 'data'])

function warning(code, message, detail) {
  return detail ? { code, message, detail } : { code, message }
}

function operationFailure(source, operationWarning, progress = null, details = {}) {
  return {
    ok: false,
    progress,
    source,
    migrated: false,
    canPersist: false,
    recoveryRequired: Boolean(details.recoveryRequired),
    warning: operationWarning,
    ...(details.envelope ? { envelope: details.envelope } : {}),
    ...(details.backupKey ? { backupKey: details.backupKey } : {}),
    ...(details.backupSource ? { backupSource: details.backupSource } : {}),
  }
}

function isRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function utf8ByteLength(value) {
  if (typeof TextEncoder === 'function') return new TextEncoder().encode(value).length

  let bytes = 0
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code < 0x80) bytes += 1
    else if (code < 0x800) bytes += 2
    else if (code >= 0xd800 && code <= 0xdbff && value.charCodeAt(index + 1) >= 0xdc00 && value.charCodeAt(index + 1) <= 0xdfff) {
      bytes += 4
      index += 1
    } else bytes += 3
  }
  return bytes
}

function mergeLimits(overrides) {
  return { ...STORAGE_LIMITS, ...(overrides || {}) }
}

function validateLimits(limits) {
  return Object.values(limits).every((value) => Number.isSafeInteger(value) && value > 0)
}

function validateJsonTree(root, limits) {
  const ancestors = new Set()
  let fieldCount = 0

  function visit(value, depth, path) {
    if (depth > limits.maxDepth) {
      return warning('nesting-too-deep', `데이터 중첩은 ${limits.maxDepth}단계를 넘을 수 없습니다.`, path)
    }

    if (value === null || typeof value === 'boolean') return null
    if (typeof value === 'number') {
      return Number.isFinite(value) ? null : warning('invalid-value', '유한한 숫자만 저장할 수 있습니다.', path)
    }
    if (typeof value === 'string') {
      return value.length <= limits.maxStringLength
        ? null
        : warning('string-too-long', `문자열은 ${limits.maxStringLength}자를 넘을 수 없습니다.`, path)
    }
    if (typeof value !== 'object') {
      return warning('invalid-value', 'JSON으로 표현할 수 없는 값이 포함되어 있습니다.', path)
    }
    if (ancestors.has(value)) return warning('circular-data', '순환 참조가 포함된 데이터는 저장할 수 없습니다.', path)

    ancestors.add(value)
    if (Array.isArray(value)) {
      if (value.length > limits.maxArrayLength) {
        ancestors.delete(value)
        return warning('array-too-long', `배열은 ${limits.maxArrayLength}개 항목을 넘을 수 없습니다.`, path)
      }
      fieldCount += value.length
      if (fieldCount > limits.maxFields) {
        ancestors.delete(value)
        return warning('too-many-fields', `전체 필드와 배열 항목은 ${limits.maxFields}개를 넘을 수 없습니다.`, path)
      }
      for (let index = 0; index < value.length; index += 1) {
        const issue = visit(value[index], depth + 1, `${path}[${index}]`)
        if (issue) {
          ancestors.delete(value)
          return issue
        }
      }
      ancestors.delete(value)
      return null
    }

    if (!isRecord(value)) {
      ancestors.delete(value)
      return warning('invalid-value', '일반 JSON 객체만 저장할 수 있습니다.', path)
    }

    const entries = Object.entries(value)
    fieldCount += entries.length
    if (fieldCount > limits.maxFields) {
      ancestors.delete(value)
      return warning('too-many-fields', `전체 필드와 배열 항목은 ${limits.maxFields}개를 넘을 수 없습니다.`, path)
    }
    for (const [key, nestedValue] of entries) {
      const nestedPath = path ? `${path}.${key}` : key
      if (key.length > limits.maxKeyLength) {
        ancestors.delete(value)
        return warning('field-name-too-long', `필드 이름은 ${limits.maxKeyLength}자를 넘을 수 없습니다.`, nestedPath)
      }
      const issue = visit(nestedValue, depth + 1, nestedPath)
      if (issue) {
        ancestors.delete(value)
        return issue
      }
    }
    ancestors.delete(value)
    return null
  }

  return visit(root, 0, 'data')
}

function isIsoTimestamp(value) {
  if (typeof value !== 'string' || !value) return false
  const milliseconds = Date.parse(value)
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value
}

function validateEnvelope(envelope, limits) {
  if (!isRecord(envelope)) return warning('invalid-envelope', '가져오기 최상위 값은 객체여야 합니다.')

  const fields = Object.keys(envelope)
  const unknownField = fields.find((field) => !ENVELOPE_FIELDS.has(field))
  if (unknownField) return warning('unknown-envelope-field', '지원하지 않는 최상위 필드가 있습니다.', unknownField)
  const missingField = [...ENVELOPE_FIELDS].find((field) => !Object.hasOwn(envelope, field))
  if (missingField) return warning('missing-envelope-field', '필수 최상위 필드가 없습니다.', missingField)
  if (envelope.schemaVersion !== STORAGE_SCHEMA_VERSION) {
    return warning('unsupported-schema-version', `스키마 버전 ${STORAGE_SCHEMA_VERSION} 데이터만 가져올 수 있습니다.`)
  }
  if (!isIsoTimestamp(envelope.generatedAt)) {
    return warning('invalid-generated-at', 'generatedAt은 유효한 ISO 8601 시각이어야 합니다.')
  }
  if (typeof envelope.appVersion !== 'string' || !envelope.appVersion || envelope.appVersion.length > limits.maxStringLength) {
    return warning('invalid-app-version', 'appVersion은 비어 있지 않은 제한 길이 문자열이어야 합니다.')
  }
  if (!isRecord(envelope.data)) return warning('invalid-data', 'data 필드는 객체여야 합니다.')
  return validateJsonTree(envelope.data, limits)
}

function validateLearningPlanMarker(envelope) {
  if (!Object.hasOwn(envelope.data, 'learningPlanVersion')) {
    return warning(
      'missing-learning-plan-version',
      'v3 저장 데이터에 학습 계획 버전 표지가 없습니다. 원본을 보존했으며 명시적으로 복구하기 전까지 자동 저장을 중지해야 합니다.',
    )
  }
  if (envelope.data.learningPlanVersion !== CURRENT_LEARNING_PLAN_VERSION) {
    return warning(
      'unsupported-learning-plan-version',
      `학습 계획 버전 ${String(envelope.data.learningPlanVersion)}은 현재 버전 ${CURRENT_LEARNING_PLAN_VERSION}과 자동 병합할 수 없습니다. 원본을 보존했으며 명시적으로 복구해야 합니다.`,
    )
  }
  return null
}

function normalizeEnvelope(envelope, limits) {
  const issue = validateEnvelope(envelope, limits)
  if (issue) return { ok: false, warning: issue }

  const markerIssue = validateLearningPlanMarker(envelope)
  if (markerIssue) {
    return {
      ok: false,
      warning: markerIssue,
      recoveryRequired: true,
      envelope,
      progress: mergeProgress(envelope.data),
    }
  }

  const progress = mergeProgress(envelope.data)
  const normalized = { ...envelope, data: progress }
  const normalizedIssue = validateEnvelope(normalized, limits)
  if (normalizedIssue) return { ok: false, warning: normalizedIssue }

  let text
  try {
    text = JSON.stringify(normalized, null, 2)
  } catch {
    return { ok: false, warning: warning('serialization-failed', '데이터를 JSON으로 변환하지 못했습니다.') }
  }
  if (utf8ByteLength(text) > limits.maxInputBytes) {
    return { ok: false, warning: warning('input-too-large', `데이터는 ${limits.maxInputBytes}바이트를 넘을 수 없습니다.`) }
  }
  return { ok: true, envelope: normalized, progress, text }
}

function parseEnvelopeText(raw, limits) {
  if (typeof raw !== 'string') {
    return { ok: false, warning: warning('invalid-input-type', '가져오기 데이터는 JSON 문자열이어야 합니다.') }
  }
  if (utf8ByteLength(raw) > limits.maxInputBytes) {
    return { ok: false, warning: warning('input-too-large', `가져오기 데이터는 ${limits.maxInputBytes}바이트를 넘을 수 없습니다.`) }
  }

  let envelope
  try {
    envelope = JSON.parse(raw)
  } catch {
    return { ok: false, warning: warning('invalid-json', 'JSON 형식을 읽을 수 없습니다.') }
  }
  return normalizeEnvelope(envelope, limits)
}

function parseLegacyText(raw, limits) {
  if (utf8ByteLength(raw) > limits.maxInputBytes) {
    return { ok: false, warning: warning('input-too-large', `기존 데이터는 ${limits.maxInputBytes}바이트를 넘을 수 없습니다.`) }
  }

  let legacyData
  try {
    legacyData = JSON.parse(raw)
  } catch {
    return { ok: false, warning: warning('invalid-json', '기존 v2 JSON 형식을 읽을 수 없습니다.') }
  }
  if (!isRecord(legacyData)) {
    return { ok: false, warning: warning('invalid-legacy-data', '기존 v2 데이터의 최상위 값은 객체여야 합니다.') }
  }
  const issue = validateJsonTree(legacyData, limits)
  if (issue) return { ok: false, warning: issue }

  const progress = mergeProgress(legacyData, { migrationSource: 'legacy-v2' })
  const mergedIssue = validateJsonTree(progress, limits)
  if (mergedIssue) return { ok: false, warning: mergedIssue }
  return { ok: true, progress }
}

function timestampFrom(now) {
  try {
    const value = typeof now === 'function' ? now() : now
    const date = value instanceof Date ? value : new Date(value)
    return Number.isFinite(date.getTime()) ? { ok: true, value: date.toISOString() } : { ok: false }
  } catch {
    return { ok: false }
  }
}

function buildEnvelope(progress, appVersion, now, limits) {
  const generatedAt = timestampFrom(now)
  if (!generatedAt.ok) {
    return { ok: false, warning: warning('invalid-clock', '내보내기 생성 시각을 만들 수 없습니다.') }
  }
  return normalizeEnvelope({
    schemaVersion: STORAGE_SCHEMA_VERSION,
    generatedAt: generatedAt.value,
    appVersion,
    data: mergeProgress(progress),
  }, limits)
}

function resolveBrowserStorage(configuredStorage) {
  if (configuredStorage !== undefined) return configuredStorage
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

function hasStorageInterface(storage) {
  return Boolean(storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function')
}

function readItem(storage, key) {
  try {
    const value = storage.getItem(key)
    return { ok: true, value: value == null ? null : String(value) }
  } catch {
    return { ok: false, warning: warning('storage-read-failed', '브라우저 저장소를 읽을 수 없습니다.', key) }
  }
}

function writeItem(storage, key, value) {
  try {
    storage.setItem(key, value)
    return { ok: true }
  } catch {
    return { ok: false, warning: warning('storage-write-failed', '브라우저 저장소에 쓸 수 없습니다.', key) }
  }
}

function removeItem(storage, key) {
  if (typeof storage.removeItem !== 'function') {
    return { ok: false, warning: warning('storage-remove-unavailable', '브라우저 저장소에서 항목을 제거할 수 없습니다.', key) }
  }
  try {
    storage.removeItem(key)
    return { ok: true }
  } catch {
    return { ok: false, warning: warning('storage-remove-failed', '브라우저 저장소에서 항목을 제거할 수 없습니다.', key) }
  }
}

function malformedStorageWarning(version, issue) {
  return warning(
    `malformed-${version}`,
    `${version} 저장 데이터가 손상되었거나 지원 범위를 벗어났습니다. 원본을 보존했으며 복구 전까지 자동 저장을 중지해야 합니다.`,
    { reason: issue.code, message: issue.message, detail: issue.detail },
  )
}

function storedRecoveryWarning(version, parsed) {
  return parsed.recoveryRequired ? parsed.warning : malformedStorageWarning(version, parsed.warning)
}

function ensureLegacyBackup(storage, raw) {
  const existingBackup = readItem(storage, LEGACY_BACKUP_KEY)
  if (!existingBackup.ok) return existingBackup
  if (existingBackup.value !== null && existingBackup.value !== raw) {
    return {
      ok: false,
      warning: warning('legacy-backup-conflict', '기존 v2 백업이 현재 원본과 달라서 v3 저장을 중지했습니다.'),
    }
  }
  if (existingBackup.value === null) {
    const written = writeItem(storage, LEGACY_BACKUP_KEY, raw)
    if (!written.ok) return written
    const verified = readItem(storage, LEGACY_BACKUP_KEY)
    if (!verified.ok) return verified
    if (verified.value !== raw) {
      return { ok: false, warning: warning('legacy-backup-failed', '기존 v2 원본의 정확한 백업을 확인하지 못했습니다.') }
    }
  }
  return { ok: true }
}

function ensureRecoveryBackup(storage, raw) {
  const existingBackup = readItem(storage, RECOVERY_BACKUP_KEY)
  if (!existingBackup.ok) return existingBackup
  if (existingBackup.value !== null && existingBackup.value !== raw) {
    return {
      ok: false,
      warning: warning('recovery-backup-conflict', '기존 복구 백업이 현재 원본과 달라서 교체를 중지했습니다.'),
    }
  }
  if (existingBackup.value === null) {
    const written = writeItem(storage, RECOVERY_BACKUP_KEY, raw)
    if (!written.ok) return written
    const verified = readItem(storage, RECOVERY_BACKUP_KEY)
    if (!verified.ok) return verified
    if (verified.value !== raw) {
      return { ok: false, warning: warning('recovery-backup-failed', '손상된 저장 원본의 byte-exact 백업을 확인하지 못했습니다.') }
    }
  }
  return { ok: true }
}

function findRecoveryRecord(storage, limits) {
  const current = readItem(storage, STORAGE_KEY)
  if (!current.ok) return current
  if (current.value !== null) {
    const parsed = parseEnvelopeText(current.value, limits)
    if (parsed.ok) {
      return { ok: false, recoveryRequired: false, warning: warning('recovery-not-required', '현재 v3 저장 데이터는 정상입니다. 일반 가져오기를 사용하세요.') }
    }
    return {
      ok: true,
      key: STORAGE_KEY,
      raw: current.value,
      source: 'v3',
      parsed,
      warning: storedRecoveryWarning('v3', parsed),
    }
  }

  const legacy = readItem(storage, LEGACY_STORAGE_KEY)
  if (!legacy.ok) return legacy
  if (legacy.value === null) {
    return { ok: false, recoveryRequired: false, warning: warning('recovery-source-missing', '복구할 저장 원본이 없습니다.') }
  }
  const parsedLegacy = parseLegacyText(legacy.value, limits)
  if (parsedLegacy.ok) {
    return { ok: false, recoveryRequired: false, warning: warning('recovery-not-required', '기존 v2 저장 데이터는 정상이며 일반 migration으로 불러올 수 있습니다.') }
  }
  return {
    ok: true,
    key: LEGACY_STORAGE_KEY,
    raw: legacy.value,
    source: 'v2',
    parsed: parsedLegacy,
    warning: malformedStorageWarning('v2', parsedLegacy.warning),
  }
}

function restoreRecoveryRecord(storage, recovery) {
  if (recovery.key === STORAGE_KEY) {
    const restored = writeItem(storage, STORAGE_KEY, recovery.raw)
    if (!restored.ok) return restored
    const verified = readItem(storage, STORAGE_KEY)
    if (!verified.ok) return verified
    return verified.value === recovery.raw
      ? { ok: true }
      : { ok: false, warning: warning('recovery-rollback-failed', '교체 실패 뒤 기존 v3 원본을 복원하지 못했습니다.') }
  }

  const removed = removeItem(storage, STORAGE_KEY)
  if (!removed.ok) return removed
  const verified = readItem(storage, STORAGE_KEY)
  if (!verified.ok) return verified
  return verified.value === null
    ? { ok: true }
    : { ok: false, warning: warning('recovery-rollback-failed', '교체 실패 뒤 임시 v3 데이터를 제거하지 못했습니다.') }
}

function preflightWrite(storage, limits) {
  const current = readItem(storage, STORAGE_KEY)
  if (!current.ok) return current
  if (current.value !== null) {
    const parsed = parseEnvelopeText(current.value, limits)
    return parsed.ok
      ? { ok: true, migrated: false }
      : { ok: false, recoveryRequired: true, warning: storedRecoveryWarning('v3', parsed) }
  }

  const legacy = readItem(storage, LEGACY_STORAGE_KEY)
  if (!legacy.ok) return legacy
  if (legacy.value === null) return { ok: true, migrated: false }

  const parsedLegacy = parseLegacyText(legacy.value, limits)
  if (!parsedLegacy.ok) return { ok: false, recoveryRequired: true, warning: malformedStorageWarning('v2', parsedLegacy.warning) }
  const backup = ensureLegacyBackup(storage, legacy.value)
  return backup.ok ? { ok: true, migrated: true } : backup
}

export function createStorageAdapter(options = {}) {
  const configuredStorage = options.storage
  const appVersion = options.appVersion ?? DEFAULT_APP_VERSION
  const now = options.now ?? (() => new Date())
  const limits = mergeLimits(options.limits)

  if (!validateLimits(limits)) throw new TypeError('Storage limits must be positive safe integers.')

  function getStorage() {
    const storage = resolveBrowserStorage(configuredStorage)
    return hasStorageInterface(storage) ? storage : null
  }

  function load() {
    const storage = getStorage()
    if (!storage) {
      return operationFailure('unavailable', warning('storage-unavailable', '이 브라우저에서는 로컬 저장소를 사용할 수 없습니다.'), mergeProgress())
    }

    const current = readItem(storage, STORAGE_KEY)
    if (!current.ok) return operationFailure('v3', current.warning, mergeProgress())
    if (current.value !== null) {
      const parsed = parseEnvelopeText(current.value, limits)
      if (!parsed.ok) {
        return operationFailure(
          'v3',
          storedRecoveryWarning('v3', parsed),
          parsed.progress || mergeProgress(),
          { recoveryRequired: true, envelope: parsed.envelope },
        )
      }
      return {
        ok: true,
        progress: parsed.progress,
        envelope: parsed.envelope,
        source: 'v3',
        migrated: false,
        canPersist: true,
        recoveryRequired: false,
        warning: null,
      }
    }

    const legacy = readItem(storage, LEGACY_STORAGE_KEY)
    if (!legacy.ok) return operationFailure('v2', legacy.warning, mergeProgress())
    if (legacy.value === null) {
      return {
        ok: true,
        progress: mergeProgress(),
        envelope: null,
        source: 'empty',
        migrated: false,
        canPersist: true,
        recoveryRequired: false,
        warning: null,
      }
    }

    const parsedLegacy = parseLegacyText(legacy.value, limits)
    if (!parsedLegacy.ok) {
      return operationFailure('v2', malformedStorageWarning('v2', parsedLegacy.warning), mergeProgress(), { recoveryRequired: true })
    }
    const backup = ensureLegacyBackup(storage, legacy.value)
    if (!backup.ok) return operationFailure('v2', backup.warning, parsedLegacy.progress, { recoveryRequired: true })

    const migratedEnvelope = buildEnvelope(parsedLegacy.progress, appVersion, now, limits)
    if (!migratedEnvelope.ok) return operationFailure('v2', migratedEnvelope.warning, parsedLegacy.progress)
    const written = writeItem(storage, STORAGE_KEY, migratedEnvelope.text)
    if (!written.ok) return operationFailure('v2', written.warning, parsedLegacy.progress)

    return {
      ok: true,
      progress: migratedEnvelope.progress,
      envelope: migratedEnvelope.envelope,
      source: 'v2',
      migrated: true,
      canPersist: true,
      recoveryRequired: false,
      warning: null,
    }
  }

  function save(progress) {
    const prepared = buildEnvelope(progress, appVersion, now, limits)
    if (!prepared.ok) return operationFailure('v3', prepared.warning)

    const storage = getStorage()
    if (!storage) {
      return operationFailure('unavailable', warning('storage-unavailable', '이 브라우저에서는 로컬 저장소를 사용할 수 없습니다.'), prepared.progress)
    }
    const preflight = preflightWrite(storage, limits)
    if (!preflight.ok) return operationFailure('v3', preflight.warning, prepared.progress, { recoveryRequired: preflight.recoveryRequired })

    const written = writeItem(storage, STORAGE_KEY, prepared.text)
    if (!written.ok) return operationFailure('v3', written.warning, prepared.progress)
    return {
      ok: true,
      progress: prepared.progress,
      envelope: prepared.envelope,
      source: 'v3',
      migrated: preflight.migrated,
      canPersist: true,
      recoveryRequired: false,
      warning: null,
    }
  }

  function exportData(progress) {
    const prepared = buildEnvelope(progress, appVersion, now, limits)
    if (!prepared.ok) return operationFailure('export', prepared.warning)
    return {
      ok: true,
      progress: prepared.progress,
      envelope: prepared.envelope,
      text: prepared.text,
      source: 'export',
      migrated: false,
      canPersist: true,
      recoveryRequired: false,
      warning: null,
    }
  }

  function importData(raw) {
    const parsed = parseEnvelopeText(raw, limits)
    if (!parsed.ok) return operationFailure('import', parsed.warning)

    const storage = getStorage()
    if (!storage) {
      return operationFailure('unavailable', warning('storage-unavailable', '이 브라우저에서는 로컬 저장소를 사용할 수 없습니다.'), parsed.progress)
    }
    const preflight = preflightWrite(storage, limits)
    if (!preflight.ok) return operationFailure('import', preflight.warning, parsed.progress, { recoveryRequired: preflight.recoveryRequired })

    const written = writeItem(storage, STORAGE_KEY, parsed.text)
    if (!written.ok) return operationFailure('import', written.warning, parsed.progress)
    return {
      ok: true,
      progress: parsed.progress,
      envelope: parsed.envelope,
      source: 'import',
      migrated: preflight.migrated,
      canPersist: true,
      recoveryRequired: false,
      warning: null,
    }
  }

  function exportRawRecovery() {
    const storage = getStorage()
    if (!storage) {
      return operationFailure('unavailable', warning('storage-unavailable', '이 브라우저에서는 로컬 저장소를 사용할 수 없습니다.'))
    }
    const recovery = findRecoveryRecord(storage, limits)
    if (!recovery.ok) {
      return operationFailure(
        'recovery-export',
        recovery.warning,
        null,
        { recoveryRequired: Boolean(recovery.recoveryRequired) },
      )
    }
    return {
      ok: true,
      progress: recovery.parsed?.progress || null,
      envelope: recovery.parsed?.envelope || null,
      text: recovery.raw,
      source: 'recovery-export',
      backupSource: recovery.source,
      migrated: false,
      canPersist: false,
      recoveryRequired: true,
      warning: null,
    }
  }

  function commitRecoveryReplacement(raw, parsed, operationSource) {
    const storage = getStorage()
    if (!storage) {
      return operationFailure('unavailable', warning('storage-unavailable', '이 브라우저에서는 로컬 저장소를 사용할 수 없습니다.'), parsed.progress)
    }

    const recovery = findRecoveryRecord(storage, limits)
    if (!recovery.ok) {
      return operationFailure(
        operationSource,
        recovery.warning,
        parsed.progress,
        { recoveryRequired: Boolean(recovery.recoveryRequired) },
      )
    }

    const backup = ensureRecoveryBackup(storage, recovery.raw)
    if (!backup.ok) {
      return operationFailure(
        operationSource,
        backup.warning,
        parsed.progress,
        { recoveryRequired: true, backupKey: RECOVERY_BACKUP_KEY, backupSource: recovery.source },
      )
    }

    const written = writeItem(storage, STORAGE_KEY, raw)
    if (!written.ok) {
      return operationFailure(
        operationSource,
        written.warning,
        parsed.progress,
        { recoveryRequired: true, backupKey: RECOVERY_BACKUP_KEY, backupSource: recovery.source },
      )
    }

    const verified = readItem(storage, STORAGE_KEY)
    if (!verified.ok || verified.value !== raw) {
      const restored = restoreRecoveryRecord(storage, recovery)
      const verificationWarning = restored.ok
        ? warning('recovery-write-verification-failed', '복구 데이터의 byte-exact 저장을 확인하지 못해 기존 원본으로 되돌렸습니다.')
        : restored.warning
      return operationFailure(
        operationSource,
        verificationWarning,
        parsed.progress,
        { recoveryRequired: true, backupKey: RECOVERY_BACKUP_KEY, backupSource: recovery.source },
      )
    }

    return {
      ok: true,
      progress: parsed.progress,
      envelope: parsed.envelope,
      source: operationSource,
      backupKey: RECOVERY_BACKUP_KEY,
      backupSource: recovery.source,
      migrated: false,
      canPersist: true,
      recoveryRequired: false,
      warning: null,
    }
  }

  function replaceFromRecovery(raw, confirmation = {}) {
    if (confirmation.confirmed !== true) {
      return operationFailure(
        'recovery-replace',
        warning('recovery-confirmation-required', '원본 내보내기 안내를 확인한 뒤 명시적으로 교체를 승인해야 합니다.'),
        null,
        { recoveryRequired: true },
      )
    }
    const parsed = parseEnvelopeText(raw, limits)
    if (!parsed.ok) {
      return operationFailure('recovery-replace', parsed.warning, parsed.progress || null, { recoveryRequired: true, envelope: parsed.envelope })
    }
    return commitRecoveryReplacement(raw, parsed, 'recovery-replace')
  }

  function resetAfterRecovery(confirmation = {}) {
    if (confirmation.confirmed !== true) {
      return operationFailure(
        'recovery-reset',
        warning('recovery-confirmation-required', '원본 내보내기 안내를 확인한 뒤 명시적으로 초기화를 승인해야 합니다.'),
        null,
        { recoveryRequired: true },
      )
    }
    const prepared = buildEnvelope(mergeProgress(), appVersion, now, limits)
    if (!prepared.ok) return operationFailure('recovery-reset', prepared.warning)
    return commitRecoveryReplacement(prepared.text, prepared, 'recovery-reset')
  }

  return Object.freeze({
    load,
    save,
    exportData,
    importData,
    exportRawRecovery,
    replaceFromRecovery,
    resetAfterRecovery,
  })
}

export const storageAdapter = createStorageAdapter()

export function loadProgress() {
  return storageAdapter.load()
}

export function saveProgress(progress) {
  return storageAdapter.save(progress)
}

export function exportProgress(progress) {
  return storageAdapter.exportData(progress)
}

export function importProgress(raw) {
  return storageAdapter.importData(raw)
}

export function exportRawRecovery() {
  return storageAdapter.exportRawRecovery()
}

export function replaceFromRecovery(raw, confirmation) {
  return storageAdapter.replaceFromRecovery(raw, confirmation)
}

export function resetAfterRecovery(confirmation) {
  return storageAdapter.resetAfterRecovery(confirmation)
}
