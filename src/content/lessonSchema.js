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
  'mechanism',
  'code-trace',
  'patch-analysis',
  'impact-map',
  'technology-primer',
  'patch-lineage',
])

export const CODE_EVIDENCE_KINDS = Object.freeze([
  'official-source',
  'official-patch',
  'official-remediation',
  'standards-derived',
  'educational-model',
])

export const GENERIC_CODE_SOURCE_TYPES = Object.freeze([
  'actual-project-source',
  'official-upstream-patch',
  'official-remediation',
  'standards-derived-model',
  'educational-reconstruction',
  'author-guidance',
])

const blockTypeSet = new Set(LESSON_BLOCK_TYPES)
const codeEvidenceKindSet = new Set(CODE_EVIDENCE_KINDS)
const genericCodeSourceTypeSet = new Set(GENERIC_CODE_SOURCE_TYPES)
const genericCodeBlockTypeSet = new Set(['terminal', 'http-message', 'code'])
const officialGenericSourceTypeSet = new Set(['actual-project-source', 'official-upstream-patch', 'official-remediation', 'standards-derived-model'])
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

function hasSource(value) {
  return isRecord(value) && hasText(value.label) && hasText(value.url)
}

function hasTextList(value, { allowEmpty = false } = {}) {
  return Array.isArray(value) && (allowEmpty || value.length > 0) && value.every(hasText)
}

export function getCheckpointMinimumLength(block) {
  if (Number.isInteger(block?.minimumLength) && block.minimumLength > 0) return block.minimumLength
  const promptMinimum = hasText(block?.prompt) ? block.prompt.match(/(\d+)\s*자\s*이상/) : null
  return promptMinimum ? Number(promptMinimum[1]) : 20
}

export function validateCheckpointAnswer(block, answer) {
  const minimumLength = getCheckpointMinimumLength(block)
  const text = typeof answer === 'string' ? answer.trim().replace(/\s+/gu, ' ') : ''
  if (!text) return { valid: false, minimumLength, reason: '답을 입력해 주세요.' }
  if (text.length < minimumLength) return { valid: false, minimumLength, reason: `근거를 포함해 ${minimumLength}자 이상으로 적어 주세요. 현재 ${text.length}자입니다.` }

  const compact = text.replace(/[^\p{L}\p{N}]/gu, '')
  const normalized = text.toLocaleLowerCase('ko-KR')
  const repeatedFragment = /^(.{1,12})(?:\s*\1){2,}$/u.test(normalized)
  const placeholderOnly = /^(?:모름|몰라|몰라요|없음|없다|해당\s*없음|n\/?a|none|test|asdf|dummy)[.!?\s]*$/iu.test(normalized)
  if (placeholderOnly || repeatedFragment || (compact.length >= minimumLength && new Set(compact).size <= 2)) {
    return { valid: false, minimumLength, reason: '같은 글자나 임시 표현을 반복하기보다, 관찰한 값과 그 값이 뜻하는 바를 함께 적어 주세요.' }
  }
  return { valid: true, minimumLength, reason: '' }
}

function normalizeLessonBlock(block) {
  if (!isRecord(block)) return block
  const normalized = { ...block }
  if (genericCodeBlockTypeSet.has(block.type) && !hasText(block.sourceType)) normalized.sourceType = 'educational-reconstruction'
  if (block.type === 'checkpoint') {
    const isChoice = Array.isArray(block.options) && block.options.length > 0
    if (!isChoice) normalized.minimumLength = getCheckpointMinimumLength(block)
    if (isChoice && !Array.isArray(block.optionRationales)) {
      const correctOption = block.options[block.answer]
      normalized.optionRationales = block.options.map((option, optionIndex) => (
        optionIndex === Number(block.answer)
          ? block.explanation || `“${option}”이(가) 이 문항의 핵심 조건과 일치합니다.`
          : `선택한 “${option}”보다 “${correctOption || '제시된 정답'}”이(가) 질문의 조건에 맞습니다. ${block.explanation || '앞의 정상 흐름과 관찰값을 다시 대조해 보세요.'}`
      ))
    }
  }
  return normalized
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
  const blocks = Array.isArray(module.blocks) && module.blocks.length ? module.blocks : legacyBlocks(module)
  return blocks.map(normalizeLessonBlock)
}

function hasDisplayItem(value) {
  return hasText(value) || (isRecord(value) && (hasText(value.label) || hasText(value.title)))
}

export function validateLessonBlock(candidate, index = 0) {
  const errors = []
  const block = normalizeLessonBlock(candidate)
  const prefix = `${index + 1}번째`
  if (!isRecord(block) || !blockTypeSet.has(block.type)) return [`${prefix} 블록 유형이 지원되지 않습니다.`]

  if (block.id !== undefined && !hasText(block.id)) errors.push(`${prefix} 블록 ID가 비어 있습니다.`)

  if (['question', 'prerequisite-check'].includes(block.type) && !hasText(block.body) && !hasText(block.prompt)) {
    errors.push(`${prefix} ${block.type}에는 body 또는 prompt가 필요합니다.`)
  }
  if (block.type === 'explanation') {
    const validParagraphs = Array.isArray(block.paragraphs) && block.paragraphs.length > 0 && block.paragraphs.every(hasText)
    if (!validParagraphs && !hasText(block.body)) errors.push(`${prefix} explanation에는 비어 있지 않은 paragraphs 또는 body가 필요합니다.`)
  }
  if (block.type === 'diagram') {
    const nodes = block.nodes || block.items
    if (!Array.isArray(nodes) || !nodes.length || nodes.some((node) => !hasDisplayItem(node))) errors.push(`${prefix} diagram에는 문자열 또는 label을 가진 nodes가 필요합니다.`)
  }
  if (genericCodeBlockTypeSet.has(block.type)) {
    const artifact = block.command || block.message || block.code
    if (!hasText(artifact)) errors.push(`${prefix} ${block.type}에는 표시할 code, command 또는 message가 필요합니다.`)
    if (!genericCodeSourceTypeSet.has(block.sourceType)) errors.push(`${prefix} ${block.type}의 sourceType이 허용된 자료 유형이 아닙니다.`)
    if (officialGenericSourceTypeSet.has(block.sourceType) && !hasSource(block.source)) errors.push(`${prefix} ${block.sourceType} ${block.type}에는 label과 url을 가진 source가 필요합니다.`)
    if (block.annotations !== undefined && !hasTextList(block.annotations)) errors.push(`${prefix} ${block.type}의 annotations는 비어 있지 않은 문자열 배열이어야 합니다.`)
  }
  if (block.type === 'comparison') {
    const validColumns = hasTextList(block.columns)
    const validRows = Array.isArray(block.rows) && block.rows.length > 0 && block.rows.every((row) => (
      Array.isArray(row) && row.length === block.columns?.length && row.every((cell) => typeof cell === 'string' || typeof cell === 'number')
    ))
    if (!validColumns || !validRows) errors.push(`${prefix} comparison에는 columns 길이와 맞는 2차원 rows 배열이 필요합니다.`)
  }
  if (block.type === 'command-guide') {
    if (!Array.isArray(block.commands) || !block.commands.length || block.commands.some((command) => (
      !isRecord(command) || !hasText(command.syntax) || !hasText(command.purpose)
      || (command.options !== undefined && (!Array.isArray(command.options) || command.options.some((option) => !isRecord(option) || !hasText(option.flag) || !hasText(option.description))))
    ))) errors.push(`${prefix} command-guide에는 syntax, purpose와 유효한 options를 가진 commands가 필요합니다.`)
  }
  if (block.type === 'timeline') {
    const items = block.items || block.steps
    if (!Array.isArray(items) || !items.length || items.some((item) => !hasDisplayItem(item))) errors.push(`${prefix} timeline에는 문자열 또는 title을 가진 items가 필요합니다.`)
  }
  if (block.type === 'case') {
    if (!hasText(block.body)) errors.push(`${prefix} case에는 body가 필요합니다.`)
    if (block.facts !== undefined && !hasTextList(block.facts)) errors.push(`${prefix} case의 facts는 비어 있지 않은 문자열 배열이어야 합니다.`)
  }
  if (block.type === 'cve-case') {
    if (!hasText(block.cve) || !hasText(block.classification) || !hasText(block.cause) || !hasText(block.condition) || !hasText(block.patch) || !hasText(block.followOn)) {
      errors.push(`${prefix} cve-case에는 cve, classification, cause, condition, patch, followOn이 필요합니다.`)
    }
    if (!hasTextList(block.facts)) errors.push(`${prefix} cve-case에는 문자열 facts 배열이 필요합니다.`)
    if (!Array.isArray(block.sources) || !block.sources.length || block.sources.some((source) => !hasSource(source))) errors.push(`${prefix} cve-case에는 label과 url을 가진 sources 배열이 필요합니다.`)
  }
  if (block.type === 'misconception' && !hasTextList(block.items)) errors.push(`${prefix} misconception에는 문자열 items가 필요합니다.`)
  if (block.type === 'warning' && !hasText(block.body)) errors.push(`${prefix} warning에는 body가 필요합니다.`)
  if (block.type === 'checkpoint') {
    if (!hasText(block.id) || !hasText(block.prompt)) errors.push(`${prefix} checkpoint에는 ID와 질문이 필요합니다.`)
    const isChoice = Array.isArray(block.options) && block.options.length > 0
    if (isChoice) {
      if (block.options.length < 2 || block.options.some((option) => !hasText(option)) || !Number.isInteger(block.answer) || block.answer < 0 || block.answer >= block.options.length) {
        errors.push(`${prefix} 선택형 checkpoint에는 두 개 이상의 선택지와 범위 안의 answer가 필요합니다.`)
      }
      if (!Array.isArray(block.optionRationales) || block.optionRationales.length !== block.options.length || block.optionRationales.some((rationale) => !hasText(rationale))) {
        errors.push(`${prefix} 선택형 checkpoint에는 각 선택지와 대응하는 optionRationales가 필요합니다.`)
      }
    } else if (!Number.isInteger(block.minimumLength) || block.minimumLength < 1) {
      errors.push(`${prefix} 서술형 checkpoint에는 양의 정수 minimumLength가 필요합니다.`)
    }
  }
  if (block.type === 'work-context' && !hasText(block.body)) errors.push(`${prefix} work-context에는 body가 필요합니다.`)
  if (block.type === 'practice-link') {
    if (!Array.isArray(block.labIds) || block.labIds.some((labId) => !hasText(labId))) errors.push(`${prefix} practice-link에는 문자열 labIds 배열이 필요합니다.`)
  }
  if (block.type === 'sources') {
    if (!Array.isArray(block.items) || !block.items.length || block.items.some((item) => !hasSource(item))) errors.push(`${prefix} sources에는 label과 url을 가진 items가 필요합니다.`)
  }
  if (block.type === 'summary' && !hasTextList(block.bullets)) errors.push(`${prefix} summary에는 문자열 bullets가 필요합니다.`)
  if (block.type === 'concept-ref') {
    if (!hasTextList(block.conceptIds)) errors.push(`${prefix} concept-ref에는 conceptIds 배열이 필요합니다.`)
    else block.conceptIds.forEach((conceptId) => {
      if (!hasConcept(conceptId)) errors.push(`${prefix} concept-ref의 개념 ID가 등록되어 있지 않습니다: ${conceptId}`)
    })
  }
  if (block.type === 'evidence-board') {
    if (!Array.isArray(block.sections) || !block.sections.length || block.sections.some((section) => !isRecord(section) || !hasText(section.label) || !hasTextList(section.items))) {
      errors.push(`${prefix} evidence-board에는 label과 문자열 items를 가진 sections가 필요합니다.`)
    }
  }
  if (block.type === 'retest') {
    if (!Array.isArray(block.rows) || !block.rows.length || block.rows.some((row) => !isRecord(row) || !hasText(row.label) || !hasText(row.check) || !hasText(row.expected))) {
      errors.push(`${prefix} retest에는 label, check, expected를 가진 rows가 필요합니다.`)
    }
  }
  if (block.type === 'mechanism') {
    if (!hasText(block.situation)) errors.push(`${prefix} mechanism에는 기능이 필요한 상황이 필요합니다.`)
    if (!Array.isArray(block.terms) || !block.terms.length || block.terms.some((term) => !isRecord(term) || !hasText(term.term) || !hasText(term.meaning) || !hasText(term.contrast))) errors.push(`${prefix} mechanism에는 term, meaning, contrast를 가진 용어가 필요합니다.`)
    if (!Array.isArray(block.stages) || block.stages.length < 3 || block.stages.some((stage) => !isRecord(stage) || !hasText(stage.label) || !hasText(stage.actor) || !hasText(stage.input) || !hasText(stage.action) || !hasText(stage.output))) errors.push(`${prefix} mechanism에는 label, actor, input, action, output을 가진 세 단계 이상의 정상 흐름이 필요합니다.`)
    if (!isRecord(block.trustBoundary) || !hasText(block.trustBoundary.before) || !hasText(block.trustBoundary.decision) || !hasText(block.trustBoundary.after) || !hasText(block.trustBoundary.failure)) errors.push(`${prefix} mechanism에는 before, decision, after, failure를 가진 trustBoundary가 필요합니다.`)
  }
  if (block.type === 'code-trace') {
    if (!codeEvidenceKindSet.has(block.evidenceKind)) errors.push(`${prefix} code-trace의 evidenceKind가 허용되지 않습니다.`)
    if (!hasText(block.language) || !hasText(block.code)) errors.push(`${prefix} code-trace에는 language와 code가 필요합니다.`)
    if (!Array.isArray(block.trace) || !block.trace.length || block.trace.some((step) => !isRecord(step) || !hasText(step.lines) || !hasText(step.before) || !hasText(step.action) || !hasText(step.after))) errors.push(`${prefix} code-trace에는 lines, before, action, after를 가진 trace가 필요합니다.`)
    if (['official-source', 'official-patch', 'official-remediation', 'standards-derived'].includes(block.evidenceKind) && !hasSource(block.source)) errors.push(`${prefix} ${block.evidenceKind} code-trace에는 공식 source가 필요합니다.`)
  }
  if (block.type === 'patch-analysis') {
    if (!codeEvidenceKindSet.has(block.evidenceKind)) errors.push(`${prefix} patch-analysis의 evidenceKind가 허용되지 않습니다.`)
    if (!isRecord(block.before) || !hasText(block.before.label) || !hasText(block.before.code) || !isRecord(block.after) || !hasText(block.after.label) || !hasText(block.after.code)) errors.push(`${prefix} patch-analysis에는 label과 code를 가진 before와 after가 필요합니다.`)
    if (!hasTextList(block.changes)) errors.push(`${prefix} patch-analysis에는 문자열 changes가 필요합니다.`)
    if (!Array.isArray(block.regressionTests) || !block.regressionTests.length || block.regressionTests.some((row) => !isRecord(row) || !hasText(row.case) || !hasText(row.expected) || !hasText(row.reason))) errors.push(`${prefix} patch-analysis에는 case, expected, reason을 가진 regressionTests가 필요합니다.`)
    if (['official-source', 'official-patch', 'official-remediation', 'standards-derived'].includes(block.evidenceKind) && !hasSource(block.source)) errors.push(`${prefix} ${block.evidenceKind} patch-analysis에는 공식 source가 필요합니다.`)
    if (!hasText(block.limitation)) errors.push(`${prefix} patch-analysis에는 확인 범위의 limitation이 필요합니다.`)
  }
  if (block.type === 'impact-map') {
    if (!Array.isArray(block.dimensions) || block.dimensions.length < 3 || block.dimensions.some((dimension) => !isRecord(dimension) || !hasText(dimension.label) || !hasText(dimension.impact) || !hasText(dimension.condition))) errors.push(`${prefix} impact-map에는 label, impact, condition을 가진 세 영향 차원이 필요합니다.`)
    const access = block.access
    if (!isRecord(access) || !hasText(access.authentication) || !hasText(access.interaction) || !hasText(access.network) || !hasText(access.defaultExposure) || !hasText(access.protections)) errors.push(`${prefix} impact-map에는 authentication, interaction, network, defaultExposure, protections를 가진 access가 필요합니다.`)
    if (!hasTextList(block.attackerControls) || !hasTextList(block.notControlled)) errors.push(`${prefix} impact-map에는 문자열 attackerControls와 notControlled가 필요합니다.`)
  }
  if (block.type === 'technology-primer') {
    if (!hasText(block.technology) || !hasText(block.oneLine) || !hasText(block.whyItExists) || !hasText(block.whereItRuns) || !hasText(block.courseConnection)) {
      errors.push(`${prefix} technology-primer에는 technology, oneLine, whyItExists, whereItRuns, courseConnection이 필요합니다.`)
    }
    if (!hasTextList(block.normalFlow) || block.normalFlow.length < 3) errors.push(`${prefix} technology-primer에는 세 단계 이상의 normalFlow가 필요합니다.`)
    if (!Array.isArray(block.terms) || block.terms.length < 2 || block.terms.some((term) => !isRecord(term) || !hasText(term.term) || !hasText(term.meaning))) {
      errors.push(`${prefix} technology-primer에는 term과 meaning을 가진 두 개 이상의 용어가 필요합니다.`)
    }
    if (!hasSource(block.source)) errors.push(`${prefix} technology-primer에는 공식 source가 필요합니다.`)
  }
  if (block.type === 'patch-lineage') {
    if (!hasText(block.cve)) errors.push(`${prefix} patch-lineage에는 CVE가 필요합니다.`)
    if (!isRecord(block.codeAvailability) || !['public', 'partial', 'not-public'].includes(block.codeAvailability.status) || !hasText(block.codeAvailability.explanation)) {
      errors.push(`${prefix} patch-lineage에는 public, partial, not-public 중 하나의 status와 explanation이 필요합니다.`)
    }
    if (!Array.isArray(block.milestones) || block.milestones.length < 2 || block.milestones.some((milestone) => (
      !isRecord(milestone) || !hasText(milestone.date) || !hasText(milestone.label) || !hasText(milestone.summary)
      || (milestone.source !== undefined && !hasSource(milestone.source))
    ))) errors.push(`${prefix} patch-lineage에는 date, label, summary와 선택적 source를 가진 두 단계 이상의 milestones가 필요합니다.`)
    if (!isRecord(block.invariant) || !hasText(block.invariant.before) || !hasText(block.invariant.after)) errors.push(`${prefix} patch-lineage에는 before와 after를 가진 invariant가 필요합니다.`)
    if (!hasTextList(block.operationalActions)) errors.push(`${prefix} patch-lineage에는 operationalActions가 필요합니다.`)
  }

  return errors
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
    errors.push(...validateLessonBlock(block, index))
    if (isRecord(block) && block.id) {
      if (blockIds.has(block.id)) errors.push(`${index + 1}번째 블록 ID가 중복됩니다.`)
      blockIds.add(block.id)
    }
  })

  if (['deep-guide-v2', 'deep-guide-v3'].includes(module.contentLevel)) {
    deepGuideFields.forEach((field) => {
      const value = module[field]
      const allowsEmptyArray = field === 'prerequisiteConceptIds'
      if (Array.isArray(value) ? (!allowsEmptyArray && value.length === 0) : !hasText(value)) errors.push(`심화 가이드 모듈에는 ${field}이 필요합니다.`)
    })
    if (!deepGuideArchetypes.has(module.archetype)) errors.push('심화 가이드 모듈의 archetype이 허용된 유형이 아닙니다.')
    ;['prerequisiteConceptIds', 'newConceptIds'].forEach((field) => (module[field] || []).forEach((conceptId) => {
      if (!hasConcept(conceptId)) errors.push(`심화 가이드 모듈의 ${field}에 등록되지 않은 개념이 있습니다: ${conceptId}`)
    }))
    const headings = blocks.map((block) => block.title).filter(hasText)
    if (new Set(headings).size !== headings.length) errors.push('심화 가이드 모듈의 블록 제목은 반복되지 않아야 합니다.')
    if (!blocks.some((block) => block.type === 'concept-ref')) errors.push('심화 가이드 모듈에는 concept-ref 블록이 필요합니다.')
    if (!blocks.some((block) => block.type === 'sources')) errors.push('심화 가이드 모듈에는 sources 블록이 필요합니다.')
  }

  if (module.contentLevel === 'deep-guide-v3') {
    if (!blocks.some((block) => ['mechanism', 'code-trace', 'patch-analysis', 'impact-map', 'evidence-board', 'retest'].includes(block.type))) {
      errors.push('deep-guide-v3 모듈에는 흐름·코드·패치·영향·재시험 중 하나 이상의 심화 블록이 필요합니다.')
    }
    const cveBlocks = blocks.filter((block) => block.type === 'cve-case')
    cveBlocks.forEach((block) => {
      if (!hasText(block.productRole) || !hasText(block.weakness) || !hasText(block.affectedVersions) || !hasText(block.fixedVersions)) {
        errors.push(`deep-guide-v3의 ${block.cve || 'CVE'} 카드에는 제품 역할, 실패 유형, 영향 버전, 수정 버전이 필요합니다.`)
      }
    })
    if (cveBlocks.length && !blocks.some((block) => block.type === 'patch-analysis')) errors.push('CVE가 있는 deep-guide-v3 모듈에는 patch-analysis가 필요합니다.')
    if (cveBlocks.length && !blocks.some((block) => block.type === 'impact-map')) errors.push('CVE가 있는 deep-guide-v3 모듈에는 impact-map이 필요합니다.')
  }

  if (module.contentLevel === 'concept-code-cve-v1') {
    if (!blocks.some((block) => ['mechanism', 'code-trace', 'patch-analysis', 'impact-map', 'retest'].includes(block.type))) {
      errors.push('concept-code-cve-v1 모듈에는 정상 흐름·코드 추적·패치·영향·재시험 중 하나 이상의 심화 블록이 필요합니다.')
    }
    const cveBlocks = blocks.filter((block) => block.type === 'cve-case')
    cveBlocks.forEach((block) => {
      if (!hasText(block.productRole) || !hasText(block.weakness) || !hasText(block.affectedVersions) || !hasText(block.fixedVersions)) {
        errors.push(`concept-code-cve-v1의 ${block.cve || 'CVE'} 카드에는 제품 역할, 실패 유형, 영향 버전, 수정 버전이 필요합니다.`)
      }
    })
    if (cveBlocks.length && !blocks.some((block) => block.type === 'patch-analysis')) errors.push('CVE가 있는 concept-code-cve-v1 모듈에는 patch-analysis가 필요합니다.')
    if (cveBlocks.length && !blocks.some((block) => block.type === 'impact-map')) errors.push('CVE가 있는 concept-code-cve-v1 모듈에는 impact-map이 필요합니다.')
  }

  if (module.contentLevel === 'case-dossier-v1') {
    if (!blocks.some((block) => block.type === 'technology-primer')) errors.push('case-dossier-v1 모듈에는 technology-primer가 필요합니다.')
    if (!blocks.some((block) => block.type === 'cve-case')) errors.push('case-dossier-v1 모듈에는 cve-case가 필요합니다.')
    if (!blocks.some((block) => block.type === 'impact-map')) errors.push('case-dossier-v1 모듈에는 impact-map이 필요합니다.')
    if (!blocks.some((block) => block.type === 'sources')) errors.push('case-dossier-v1 모듈에는 sources가 필요합니다.')
  }

  if (module.contentLevel === 'patch-workshop-v1') {
    if (!blocks.some((block) => block.type === 'patch-analysis')) errors.push('patch-workshop-v1 모듈에는 patch-analysis가 필요합니다.')
    if (!blocks.some((block) => block.type === 'patch-lineage')) errors.push('patch-workshop-v1 모듈에는 patch-lineage가 필요합니다.')
    if (!blocks.some((block) => block.type === 'practice-link')) errors.push('patch-workshop-v1 모듈에는 practice-link가 필요합니다.')
    if (!blocks.some((block) => block.type === 'sources')) errors.push('patch-workshop-v1 모듈에는 sources가 필요합니다.')
  }

  return errors
}

export function getLessonBlockAnchor(moduleId, block, index) {
  const suffix = block?.id || `${block?.type || 'section'}-${index + 1}`
  return `${moduleId}-${suffix}`
}
