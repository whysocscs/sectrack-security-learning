export const LESSON_BLOCK_TYPES = Object.freeze([
  'question',
  'prerequisite-check',
  'explanation',
  'diagram',
  'terminal',
  'http-message',
  'code',
  'comparison',
  'timeline',
  'case',
  'misconception',
  'warning',
  'checkpoint',
  'work-context',
  'practice-link',
  'sources',
  'summary',
])

const blockTypeSet = new Set(LESSON_BLOCK_TYPES)

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
  })

  return errors
}

export function getLessonBlockAnchor(moduleId, block, index) {
  const suffix = block?.id || `${block?.type || 'section'}-${index + 1}`
  return `${moduleId}-${suffix}`
}
