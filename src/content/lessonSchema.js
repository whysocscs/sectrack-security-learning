import { hasConcept } from './conceptRegistry.js'

export const LESSON_BLOCK_TYPES = Object.freeze([
  'question',
  'prerequisite-check',
  'explanation',
  'diagram',
  'terminal',
  'http-message',
  'code',
  'comparison',
  'command-guide',
  'timeline',
  'case',
  'cve-case',
  'misconception',
  'warning',
  'checkpoint',
  'work-context',
  'practice-link',
  'sources',
  'summary',
  'concept-ref',
  'evidence-board',
  'retest',
])

const blockTypeSet = new Set(LESSON_BLOCK_TYPES)
const deepGuideArchetypes = new Set(['원리 해설형', '흐름 추적형', '사례 판정형', '도구 관찰형', '방어·재시험형'])
const deepGuideFields = [
  'archetype',
  'learningQuestion',
  'observableOutcome',
  'prerequisiteConceptIds',
  'newConceptIds',
  'evidenceObjects',
  'failurePoint',
  'impactConditions',
  'controls',
  'retestMatrix',
  'transferGate',
]

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function legacyBlocks(module) {
  const blocks = []
  if (hasText(module.summary)) blocks.push({ type: 'explanation', title: '핵심 개요', paragraphs: [module.summary] })
  if (Array.isArray(module.paragraphs) && module.paragraphs.length) {
    blocks.push({ type: 'explanation', title: '읽기', paragraphs: module.paragraphs })
  }
  if (Array.isArray(module.terms) && module.terms.length) {
    blocks.push({ type: 'comparison', title: '용어', columns: ['용어', '설명'], rows: module.terms })
  }
  if (Array.isArray(module.points) && module.points.length) blocks.push({ type: 'summary', title: '핵심 정리', bullets: module.points })
  if (Array.isArray(module.steps) && module.steps.length) blocks.push({ type: 'timeline', title: '순서', items: module.steps })
  return blocks
}

export function getLessonBlocks(module) {
  if (!isRecord(module)) return []
  return Array.isArray(module.blocks) && module.blocks.length ? module.blocks : legacyBlocks(module)
}

export function validateLessonModule(module) {
  const errors = []
  if (!isRecord(module)) return ['모듈은 객체여야 합니다.']
  if (!hasText(module.id)) errors.push('모듈 ID가 필요합니다.')
  if (!hasText(module.title)) errors.push('모듈 제목이 필요합니다.')

  const blocks = getLessonBlocks(module)
  if (!blocks.length) errors.push('새 blocks 또는 호환 가능한 기존 콘텐츠 필드가 필요합니다.')

  const blockIds = new Set()
  blocks.forEach((block, index) => {
    if (!isRecord(block) || !blockTypeSet.has(block.type)) {
      errors.push(`${index + 1}번째 블록 유형이 지원되지 않습니다.`)
      return
    }
    if (block.id) {
      if (!hasText(block.id)) errors.push(`${index + 1}번째 블록 ID가 비어 있습니다.`)
      if (blockIds.has(block.id)) errors.push(`${index + 1}번째 블록 ID가 중복됩니다.`)
      blockIds.add(block.id)
    }
    if (block.type === 'checkpoint' && (!hasText(block.id) || !hasText(block.prompt))) {
      errors.push(`${index + 1}번째 checkpoint에는 ID와 질문이 필요합니다.`)
    }
    if (block.type === 'sources' && !Array.isArray(block.items)) errors.push(`${index + 1}번째 sources에는 items 배열이 필요합니다.`)
    if (block.type === 'cve-case') {
      if (!hasText(block.cve) || !hasText(block.classification) || !hasText(block.cause) || !hasText(block.condition) || !hasText(block.patch) || !hasText(block.followOn)) {
        errors.push(`${index + 1}번째 cve-case에는 cve, classification, cause, condition, patch, followOn이 필요합니다.`)
      }
      if (!Array.isArray(block.facts) || !block.facts.length) errors.push(`${index + 1}번째 cve-case에는 facts 배열이 필요합니다.`)
      if (!Array.isArray(block.sources) || !block.sources.length || block.sources.some((source) => !hasText(source?.label) || !hasText(source?.url))) {
        errors.push(`${index + 1}번째 cve-case에는 label과 url을 가진 sources 배열이 필요합니다.`)
      }
    }
    if (block.type === 'command-guide' && !Array.isArray(block.commands)) errors.push(`${index + 1}번째 command-guide에는 commands 배열이 필요합니다.`)
    if (block.type === 'concept-ref') {
      if (!Array.isArray(block.conceptIds) || !block.conceptIds.length) errors.push(`${index + 1}번째 concept-ref에는 conceptIds 배열이 필요합니다.`)
      else block.conceptIds.forEach((conceptId) => {
        if (!hasConcept(conceptId)) errors.push(`${index + 1}번째 concept-ref의 개념 ID가 등록되어 있지 않습니다: ${conceptId}`)
      })
    }
    if (block.type === 'evidence-board') {
      if (!Array.isArray(block.sections) || !block.sections.length || block.sections.some((section) => !hasText(section?.label) || !Array.isArray(section?.items) || !section.items.length)) {
        errors.push(`${index + 1}번째 evidence-board에는 이름과 항목을 가진 sections가 필요합니다.`)
      }
    }
    if (block.type === 'retest') {
      if (!Array.isArray(block.rows) || !block.rows.length || block.rows.some((row) => !hasText(row?.label) || !hasText(row?.check) || !hasText(row?.expected))) {
        errors.push(`${index + 1}번째 retest에는 label, check, expected를 가진 rows가 필요합니다.`)
      }
    }
  })

  if (module.contentLevel === 'deep-guide-v2') {
    deepGuideFields.forEach((field) => {
      const value = module[field]
      const allowsEmptyArray = field === 'prerequisiteConceptIds'
      if (Array.isArray(value) ? (!allowsEmptyArray && value.length === 0) : !hasText(value)) errors.push(`deep-guide-v2 모듈에는 ${field}이 필요합니다.`)
    })
    if (!deepGuideArchetypes.has(module.archetype)) errors.push('deep-guide-v2 모듈의 archetype이 허용된 유형이 아닙니다.')
    ;['prerequisiteConceptIds', 'newConceptIds'].forEach((field) => (module[field] || []).forEach((conceptId) => {
      if (!hasConcept(conceptId)) errors.push(`deep-guide-v2 모듈의 ${field}에 등록되지 않은 개념이 있습니다: ${conceptId}`)
    }))
    const headings = blocks.map((block) => block.title).filter(hasText)
    if (new Set(headings).size !== headings.length) errors.push('deep-guide-v2 모듈의 블록 제목은 반복되지 않아야 합니다.')
    if (!blocks.some((block) => block.type === 'concept-ref')) errors.push('deep-guide-v2 모듈에는 concept-ref 블록이 필요합니다.')
    if (!blocks.some((block) => block.type === 'sources')) errors.push('deep-guide-v2 모듈에는 sources 블록이 필요합니다.')
  }

  return errors
}

export function getLessonBlockAnchor(moduleId, block, index) {
  const suffix = block?.id || `${block?.type || 'section'}-${index + 1}`
  return `${moduleId}-${suffix}`
}
