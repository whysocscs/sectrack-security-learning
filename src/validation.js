const INVISIBLE_PATTERN = /[\u200B-\u200D\u2060\uFEFF]/g
const UNICODE_SPACE_PATTERN = /\s+/gu

export function normalizeLearningText(value = '') {
  return String(value)
    .normalize('NFKC')
    .replace(INVISIBLE_PATTERN, '')
    .replace(UNICODE_SPACE_PATTERN, ' ')
    .trim()
}

function compactText(value = '') {
  return normalizeLearningText(value).replace(UNICODE_SPACE_PATTERN, '')
}

export function getLearningTextLength(value = '') {
  return [...compactText(value)].length
}

export function isLowInformationText(value = '', { minLength = 1 } = {}) {
  const normalized = normalizeLearningText(value)
  const compact = compactText(normalized)
  if ([...compact].length < minLength) return true
  if (!compact) return true
  const characters = [...compact]
  const unique = new Set(characters)
  if (characters.length >= 8 && unique.size < 3) return true
  for (let size = 1; size <= Math.min(12, Math.floor(characters.length / 2)); size += 1) {
    const unit = characters.slice(0, size).join('')
    if (unit.repeat(Math.ceil(characters.length / size)).slice(0, characters.length) === compact && characters.length >= Math.max(8, size * 3)) return true
  }
  return false
}

export function validateLearningText(value, {
  minLength = 1,
  label = '입력',
  required = true,
} = {}) {
  const normalized = normalizeLearningText(value)
  if (!normalized) return required ? `${label}: 내용을 입력하세요.` : ''
  const length = getLearningTextLength(normalized)
  if (length < minLength) return `${label}: 공백 제외 ${minLength}자 이상 작성하세요. 현재 ${length}자입니다.`
  if (isLowInformationText(normalized, { minLength })) return `${label}에 반복 문자 대신 서로 다른 관찰과 근거를 작성하세요.`
  return ''
}

export function findDuplicateMeaningfulFields(entries = []) {
  const groups = new Map()
  for (const entry of entries) {
    const normalized = normalizeLearningText(entry.value).toLocaleLowerCase('ko-KR')
    if (!normalized) continue
    const current = groups.get(normalized) || []
    current.push(entry.id)
    groups.set(normalized, current)
  }
  return [...groups.values()].filter((ids) => ids.length > 1)
}

export function validateStructuredReflection(reflection = {}) {
  const fields = [
    ['normalFlow', '정상 동작', 20],
    ['trustBoundary', '신뢰 경계', 20],
    ['failurePoint', '실패 지점', 20],
    ['patchRemediation', '패치·완화', 20],
    ['retest', '재시험', 20],
  ]
  const fieldErrors = {}
  for (const [id, label, minLength] of fields) {
    const error = validateLearningText(reflection[id], { minLength, label })
    if (error) fieldErrors[id] = error
  }
  for (const ids of findDuplicateMeaningfulFields(fields.map(([id]) => ({ id, value: reflection[id] })))) {
    for (const id of ids) fieldErrors[id] = '다른 항목과 같은 문장을 반복하지 말고 이 단계에서 확인한 고유한 근거를 작성하세요.'
  }
  return { valid: Object.keys(fieldErrors).length === 0, fieldErrors }
}
