import { URL } from 'node:url'
import { conceptRegistry } from '../src/content/conceptRegistry.js'
import { loadDeepGuideModules, supportsDeepGuide } from '../src/content/deepGuideLoader.js'
import {
  officialResources,
  objectiveEvidence,
  quizRules,
  quizzes,
  weekContent,
} from '../src/courseData.js'
import {
  CODE_EVIDENCE_KINDS,
  GENERIC_CODE_SOURCE_TYPES,
  LESSON_BLOCK_TYPES,
  getLessonBlocks,
  validateLessonModule,
} from '../src/content/lessonSchema.js'
import { parseHash, routeToHash } from '../src/platformLogic.js'

export const EXPECTED_CONTENT_INVENTORY = Object.freeze({
  weeks: 16,
  modules: 90,
  blocks: 975,
  usedBlockTypes: 27,
  declaredBlockTypes: 28,
  labs: 46,
  quizQuestions: 102,
  checkpoints: 148,
  quizRoutes: 16,
  recordRoutes: 15,
  conceptLinks: 20,
  objectiveMappings: 60,
})

const codeArtifactTypes = new Set([
  'terminal',
  'http-message',
  'code',
  'command-guide',
  'code-trace',
  'patch-analysis',
])

const genericCodeArtifactTypes = new Set(['terminal', 'http-message', 'code'])

const officialEvidenceKinds = new Set([
  'official-source',
  'official-patch',
  'official-remediation',
  'standards-derived',
])

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isHttpUrl(value) {
  if (!hasText(value)) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function duplicateValues(values) {
  const seen = new Set()
  const duplicates = new Set()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}

function addError(errors, code, path, message) {
  errors.push({ code, path, message })
}

function checkExact(errors, actual, expected, code, label) {
  if (actual !== expected) addError(errors, code, 'inventory', `${label}: expected ${expected}, received ${actual}`)
}

export function buildContentInventory({
  weeks = weekContent,
  questionSets = quizzes,
  objectiveEvidenceMap = objectiveEvidence,
} = {}) {
  const weekList = Object.values(weeks).sort((left, right) => left.index - right.index)
  const modules = weekList.flatMap((week) => week.modules.map((module) => ({ week, module })))
  const blocks = modules.flatMap(({ week, module }) => getLessonBlocks(module).map((block, index) => ({
    week,
    module,
    block,
    index,
  })))
  const rawBlocks = modules.flatMap(({ week, module }) => (Array.isArray(module.blocks) ? module.blocks : []).map((block, index) => ({
    week,
    module,
    block,
    index,
  })))
  const labs = weekList.flatMap((week) => week.labs.map((lab) => ({ week, lab })))
  const questions = Object.entries(questionSets).flatMap(([weekIndex, items]) => items.map((question) => ({
    weekIndex: Number(weekIndex),
    question,
  })))
  const checkpoints = blocks.filter(({ block }) => block.type === 'checkpoint')
  const blockTypes = [...new Set(blocks.map(({ block }) => block.type))].sort()
  const codeArtifacts = blocks.filter(({ block }) => codeArtifactTypes.has(block.type))

  return {
    weekList,
    modules,
    blocks,
    rawBlocks,
    labs,
    questions,
    checkpoints,
    blockTypes,
    codeArtifacts,
    stats: {
      weeks: weekList.length,
      modules: modules.length,
      blocks: blocks.length,
      usedBlockTypes: blockTypes.length,
      declaredBlockTypes: LESSON_BLOCK_TYPES.length,
      labs: labs.length,
      quizQuestions: questions.length,
      checkpoints: checkpoints.length,
      quizRoutes: Object.keys(questionSets).length,
      recordRoutes: weekList.filter((week) => week.weeklyRecord).length,
      conceptLinks: Object.keys(conceptRegistry).length,
      objectiveMappings: Object.values(objectiveEvidenceMap).flat().length,
      codeArtifacts: codeArtifacts.length,
    },
  }
}

export async function loadContractWeeks(weeks = weekContent) {
  const loaded = await Promise.all(Object.values(weeks)
    .sort((left, right) => left.index - right.index)
    .map(async (week) => ({
      ...week,
      modules: supportsDeepGuide(week.index)
        ? await loadDeepGuideModules(week.index, week.modules)
        : week.modules,
    })))
  return Object.fromEntries(loaded.map((week) => [week.index, week]))
}

export function buildRouteManifest({ weeks = weekContent } = {}) {
  const weekList = Object.values(weeks).sort((left, right) => left.index - right.index)
  return {
    weeks: weekList.map((week) => ({
      week: week.index,
      title: week.title,
      hash: `#/learn/week/${week.index}/overview`,
    })),
    modules: weekList.flatMap((week) => week.modules.map((module) => ({
      week: week.index,
      id: module.id,
      title: module.title,
      hash: `#/learn/week/${week.index}/concepts/${encodeURIComponent(module.id)}`,
    }))),
    labs: weekList.flatMap((week) => week.labs.map((lab) => ({
      week: week.index,
      id: lab.id,
      title: lab.title,
      hash: `#/labs/${encodeURIComponent(lab.id)}`,
    }))),
    quizzes: weekList.filter((week) => week.assessment).map((week) => ({
      week: week.index,
      id: week.assessment.id,
      title: week.assessment.title,
      hash: `#/learn/week/${week.index}/quiz`,
    })),
    records: weekList.filter((week) => week.weeklyRecord).map((week) => ({
      week: week.index,
      id: week.weeklyRecord.id,
      title: week.weeklyRecord.title,
      hash: `#/learn/week/${week.index}/record`,
    })),
  }
}

function validateRouteContracts(errors, inventory, manifest) {
  const moduleIds = new Set(inventory.modules.map(({ module }) => module.id))
  const labIds = new Set(inventory.labs.map(({ lab }) => lab.id))

  inventory.weekList.forEach((week) => {
    const path = `week[${week.index}]`
    if (week.id !== `week-${week.index}`) addError(errors, 'WEEK_ID', path, `expected week-${week.index}, received ${week.id}`)
    if (week.route !== undefined && week.route !== `/learn/week/${week.index}`) addError(errors, 'WEEK_ROUTE', path, `expected /learn/week/${week.index}, received ${week.route}`)
  })

  for (const entry of manifest.modules) {
    const parsed = parseHash(entry.hash)
    const expected = { page: 'week', week: entry.week, tab: 'concepts', moduleId: entry.id }
    if (JSON.stringify(parsed) !== JSON.stringify(expected)) {
      addError(errors, 'MODULE_ROUTE_PARSE', entry.hash, `expected ${JSON.stringify(expected)}, received ${JSON.stringify(parsed)}`)
    }
    if (routeToHash(expected) !== entry.hash) addError(errors, 'MODULE_ROUTE_ROUNDTRIP', entry.hash, `routeToHash returned ${routeToHash(expected)}`)
  }

  for (const entry of manifest.labs) {
    const parsed = parseHash(entry.hash)
    if (parsed.page !== 'lab' || parsed.labId !== entry.id) addError(errors, 'LAB_ROUTE_PARSE', entry.hash, `received ${JSON.stringify(parsed)}`)
    if (routeToHash({ page: 'lab', labId: entry.id }) !== entry.hash) addError(errors, 'LAB_ROUTE_ROUNDTRIP', entry.hash, 'lab route does not round-trip')
  }

  for (const entry of [...manifest.quizzes, ...manifest.records]) {
    const tab = manifest.quizzes.includes(entry) ? 'quiz' : 'record'
    const parsed = parseHash(entry.hash)
    if (parsed.page !== 'week' || parsed.week !== entry.week || parsed.tab !== tab) addError(errors, 'WEEK_ACTIVITY_ROUTE', entry.hash, `received ${JSON.stringify(parsed)}`)
  }

  for (const [conceptId, concept] of Object.entries(conceptRegistry)) {
    const path = `conceptRegistry.${conceptId}`
    if (!moduleIds.has(concept.firstIntroducedIn)) addError(errors, 'CONCEPT_TARGET', path, `unknown firstIntroducedIn ${concept.firstIntroducedIn}`)
    const parsed = parseHash(concept.coreAnchor)
    if (parsed.page !== 'week' || parsed.tab !== 'concepts' || !moduleIds.has(parsed.moduleId)) addError(errors, 'CONCEPT_ANCHOR', path, `coreAnchor must resolve to a known canonical concept route, received ${concept.coreAnchor}`)
    for (const relatedId of concept.relatedIds || []) {
      if (!conceptRegistry[relatedId]) addError(errors, 'CONCEPT_RELATED', path, `unknown related concept ${relatedId}`)
    }
  }

  for (const { week, lab } of inventory.labs) {
    const path = `week[${week.index}].labs.${lab.id}`
    if (lab.week !== week.index) addError(errors, 'LAB_WEEK', path, `expected week ${week.index}, received ${lab.week}`)
    for (const moduleId of lab.relatedConceptIds || []) {
      if (!moduleIds.has(moduleId)) addError(errors, 'LAB_REFERENCE', path, `unknown related module ${moduleId}`)
    }
  }

  for (const { week, module, block, index } of inventory.blocks) {
    const path = `week[${week.index}].modules.${module.id}.blocks[${index}]`
    if (block.type === 'practice-link') {
      if (block.labIds !== undefined && !Array.isArray(block.labIds)) addError(errors, 'PRACTICE_LINK_SHAPE', path, 'practice-link labIds must be an array when provided')
      for (const labId of block.labIds || []) {
        if (!labIds.has(labId)) addError(errors, 'PRACTICE_LINK_REFERENCE', path, `unknown lab ${labId}`)
      }
    }
    if (block.type === 'concept-ref') {
      for (const conceptId of block.conceptIds || []) {
        if (!conceptRegistry[conceptId]) addError(errors, 'BLOCK_CONCEPT_REFERENCE', path, `unknown concept ${conceptId}`)
      }
    }
  }
}

function validateLearningObjectives(errors, inventory) {
  for (const week of inventory.weekList) {
    if (!Array.isArray(week.objectives) || week.objectives.length === 0 || week.objectives.some((objective) => !hasText(objective))) {
      addError(errors, 'WEEK_OBJECTIVES', `week[${week.index}]`, 'week objectives must be a non-empty text array')
    }
  }

  for (const { week, lab } of inventory.labs) {
    const path = `week[${week.index}].labs.${lab.id}`
    if (!hasText(lab.objective)) addError(errors, 'LAB_OBJECTIVE', path, 'lab objective is required')
    if (!Array.isArray(lab.relatedConceptIds) || lab.relatedConceptIds.length === 0) addError(errors, 'LAB_OBJECTIVE_MAPPING', path, 'relatedConceptIds must map the lab objective to at least one module')
  }
}

function extractWeekNumbers(value) {
  if (typeof value === 'string') return [...value.matchAll(/Week\s*0*(\d+)/gi)].map((match) => Number(match[1]))
  if (Array.isArray(value)) return value.flatMap(extractWeekNumbers)
  if (isRecord(value)) return Object.values(value).flatMap(extractWeekNumbers)
  return []
}

function validateLearnerWeekReferences(errors, inventory) {
  for (const week of inventory.weekList) {
    const prerequisiteNumbers = extractWeekNumbers(week.prerequisites)
    for (const referencedWeek of prerequisiteNumbers) {
      if (referencedWeek >= week.index) addError(errors, 'WEEK_REFERENCE_PREREQUISITE', `week[${week.index}].prerequisites`, `Week ${referencedWeek} cannot be a prerequisite of display Week ${week.index}`)
    }

    const expectedNext = inventory.weekList.find((candidate) => candidate.index === week.index + 1)
    if (expectedNext && !week.next.startsWith(`Week ${expectedNext.index} ·`)) {
      addError(errors, 'WEEK_REFERENCE_NEXT', `week[${week.index}].next`, `expected display Week ${expectedNext.index}, received ${week.next}`)
    }

    for (const { lab } of inventory.labs.filter((entry) => entry.week.index === week.index)) {
      for (const referencedWeek of extractWeekNumbers(lab.prerequisites)) {
        if (referencedWeek >= week.index) addError(errors, 'WEEK_REFERENCE_LAB_PREREQUISITE', `week[${week.index}].labs.${lab.id}`, `Week ${referencedWeek} is not an earlier display week`)
      }
      for (const referencedWeek of extractWeekNumbers(lab.nextRecommendations)) {
        if (referencedWeek > week.index + 1) addError(errors, 'WEEK_REFERENCE_LAB_NEXT', `week[${week.index}].labs.${lab.id}`, `Week ${referencedWeek} skips the next display week`)
      }
    }

    // From the web-foundation week onward, module and weekly-record handoffs may
    // cite earlier material or the immediate next week, but not a legacy number
    // two or more positions ahead. Week 00–01 intentionally contain a roadmap.
    if (week.index >= 2) {
      const handoffText = [...week.modules.map((module) => module.blocks), week.recordBlueprint]
      for (const referencedWeek of extractWeekNumbers(handoffText)) {
        if (referencedWeek > week.index + 1) addError(errors, 'WEEK_REFERENCE_CONTENT', `week[${week.index}]`, `Week ${referencedWeek} is beyond the immediate display handoff`)
      }
    }
  }
}

function validateObjectiveEvidence(errors, inventory, evidenceMap) {
  const coveredModuleIds = new Set(Object.values(evidenceMap).flat().flatMap((entry) => entry.explanationModuleIds || []))
  for (const { week, module } of inventory.modules) {
    if (!coveredModuleIds.has(module.id)) addError(errors, 'OBJECTIVE_MODULE_COVERAGE', `week[${week.index}].modules.${module.id}`, 'every module must teach at least one learner-visible objective')
  }

  for (const week of inventory.weekList) {
    const entries = evidenceMap[week.index]
    const modules = new Map(inventory.modules.filter((entry) => entry.week.index === week.index).map((entry) => [entry.module.id, entry.module]))
    const labs = new Map(inventory.labs.filter((entry) => entry.week.index === week.index).map((entry) => [entry.lab.id, entry.lab]))
    const checkpoints = new Map(inventory.checkpoints
      .filter((entry) => entry.week.index === week.index)
      .map((entry) => [entry.block.id, entry.module.id]))
    const questions = new Map(inventory.questions
      .filter((entry) => entry.weekIndex === week.index)
      .map((entry) => [entry.question.id, entry.question]))

    if (!Array.isArray(entries) || entries.length !== week.objectives.length) {
      addError(errors, 'OBJECTIVE_EVIDENCE_COUNT', `week[${week.index}]`, `expected ${week.objectives.length} mappings, received ${entries?.length ?? 0}`)
      continue
    }

    entries.forEach((entry, index) => {
      const path = `objectiveEvidence[${week.index}][${index}]`
      const expectedId = `w${week.index}-objective-${index + 1}`
      if (entry.id !== expectedId) addError(errors, 'OBJECTIVE_EVIDENCE_ID', path, `expected ${expectedId}, received ${entry.id}`)
      if (entry.objective !== week.objectives[index]) addError(errors, 'OBJECTIVE_EVIDENCE_TEXT', path, 'objective text must match the learner-visible objective exactly')
      for (const [field, values] of Object.entries({
        explanationModuleIds: entry.explanationModuleIds,
        practiceEvidenceIds: entry.practiceEvidenceIds,
        assessmentQuestionIds: entry.assessmentQuestionIds,
      })) {
        if (!Array.isArray(values) || values.length === 0) addError(errors, 'OBJECTIVE_EVIDENCE_LAYER', path, `${field} must contain at least one evidence ID`)
        for (const duplicate of duplicateValues(values || [])) addError(errors, 'OBJECTIVE_EVIDENCE_DUPLICATE', path, `${field}: ${duplicate}`)
      }

      const explanationIds = new Set(entry.explanationModuleIds || [])
      for (const moduleId of explanationIds) {
        if (!modules.has(moduleId)) addError(errors, 'OBJECTIVE_EXPLANATION_REFERENCE', path, `unknown same-week module ${moduleId}`)
      }
      for (const evidenceId of entry.practiceEvidenceIds || []) {
        const lab = labs.get(evidenceId)
        const checkpointModuleId = checkpoints.get(evidenceId)
        if (!lab && !checkpointModuleId) {
          addError(errors, 'OBJECTIVE_PRACTICE_REFERENCE', path, `unknown same-week lab/checkpoint ${evidenceId}`)
        } else if (lab && !(lab.relatedConceptIds || []).some((moduleId) => explanationIds.has(moduleId))) {
          addError(errors, 'OBJECTIVE_PRACTICE_ALIGNMENT', path, `${evidenceId} does not reference an explanation module`)
        } else if (checkpointModuleId && !explanationIds.has(checkpointModuleId)) {
          addError(errors, 'OBJECTIVE_PRACTICE_ALIGNMENT', path, `${evidenceId} belongs to unaligned module ${checkpointModuleId}`)
        }
      }
      for (const questionId of entry.assessmentQuestionIds || []) {
        const question = questions.get(questionId)
        if (!question) addError(errors, 'OBJECTIVE_ASSESSMENT_REFERENCE', path, `unknown same-week quiz question ${questionId}`)
        else if (!(question.conceptIds || []).some((moduleId) => explanationIds.has(moduleId))) {
          addError(errors, 'OBJECTIVE_ASSESSMENT_ALIGNMENT', path, `${questionId} does not reference an explanation module`)
        }
      }
    })
  }
}

function validateBlockContracts(errors, inventory) {
  const allowedTypes = new Set(LESSON_BLOCK_TYPES)
  const allowedEvidenceKinds = new Set(CODE_EVIDENCE_KINDS)
  const checkpointIds = inventory.checkpoints.map(({ block }) => block.id)
  for (const duplicate of duplicateValues(checkpointIds)) addError(errors, 'DUPLICATE_CHECKPOINT_ID', 'blocks', duplicate)

  for (const { week, module } of inventory.modules) {
    const moduleErrors = validateLessonModule(module)
    for (const message of moduleErrors) addError(errors, 'LESSON_SCHEMA', `week[${week.index}].modules.${module.id}`, message)
  }

  for (const { week, module, block, index } of inventory.rawBlocks) {
    if (!genericCodeArtifactTypes.has(block?.type)) continue
    const path = `week[${week.index}].modules.${module.id}.rawBlocks[${index}]`
    if (!hasText(block.sourceType)) addError(errors, 'RAW_CODE_PROVENANCE', path, `${block.type} must explicitly declare sourceType before normalization`)
    else if (!GENERIC_CODE_SOURCE_TYPES.includes(block.sourceType)) addError(errors, 'RAW_CODE_PROVENANCE', path, `unsupported sourceType ${block.sourceType}`)
  }

  for (const { week, module, block, index } of inventory.blocks) {
    const path = `week[${week.index}].modules.${module.id}.blocks[${index}]`
    if (!allowedTypes.has(block.type)) addError(errors, 'BLOCK_TYPE', path, `unsupported block type ${block.type}`)

    if (codeArtifactTypes.has(block.type) && block.evidenceKind !== undefined) {
      if (!allowedEvidenceKinds.has(block.evidenceKind)) addError(errors, 'CODE_PROVENANCE', path, `evidenceKind must be one of ${CODE_EVIDENCE_KINDS.join(', ')}`)
      if (officialEvidenceKinds.has(block.evidenceKind) && (!isRecord(block.source) || !hasText(block.source.label) || !isHttpUrl(block.source.url))) {
        addError(errors, 'CODE_SOURCE', path, `${block.evidenceKind} requires an official source label and URL`)
      }
    }

    const sources = [
      ...(block.type === 'sources' ? block.items || [] : []),
      ...(block.type === 'cve-case' ? block.sources || [] : []),
      ...(isRecord(block.source) ? [block.source] : []),
    ]
    for (const source of sources) {
      if (!hasText(source?.label) || !isHttpUrl(source?.url)) addError(errors, 'EVIDENCE_URL', path, `invalid evidence source ${JSON.stringify(source)}`)
    }

    if (block.type === 'checkpoint') {
      if (!hasText(block.id) || !hasText(block.prompt)) addError(errors, 'CHECKPOINT_ID_PROMPT', path, 'checkpoint ID and prompt are required')
      if (Array.isArray(block.options) && block.options.length > 0) {
        if (block.options.length < 2 || block.options.some((option) => !hasText(option))) addError(errors, 'CHECKPOINT_OPTIONS', path, 'choice checkpoint options must contain at least two labels')
        if (!Number.isInteger(block.answer) || block.answer < 0 || block.answer >= block.options.length) addError(errors, 'CHECKPOINT_ANSWER', path, `answer index ${block.answer} is outside the option list`)
        if (!hasText(block.explanation)) addError(errors, 'CHECKPOINT_EXPLANATION', path, 'choice checkpoint explanation is required')
      }
    }
  }
}

function validateQuizContracts(errors, inventory, rules) {
  const moduleIds = new Set(inventory.modules.map(({ module }) => module.id))
  const questionIds = inventory.questions.map(({ question }) => question.id)
  for (const duplicate of duplicateValues(questionIds)) addError(errors, 'DUPLICATE_QUIZ_ID', 'quizzes', duplicate)

  for (const { weekIndex, question } of inventory.questions) {
    const path = `quizzes[${weekIndex}].${question.id || 'unknown'}`
    if (!hasText(question.id) || !hasText(question.question) || !hasText(question.explanation)) addError(errors, 'QUIZ_TEXT', path, 'id, question, and explanation are required')
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.some((option) => !hasText(option))) addError(errors, 'QUIZ_OPTIONS', path, 'at least two text options are required')
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= (question.options?.length || 0)) addError(errors, 'QUIZ_ANSWER_POSITION', path, `answer index ${question.answer} is outside the option list`)
    if (!Array.isArray(question.optionIds) || question.optionIds.length !== question.options?.length || question.optionIds.some((id) => !hasText(id))) {
      addError(errors, 'QUIZ_OPTION_IDS', path, 'optionIds must preserve every option position')
    } else {
      for (const duplicate of duplicateValues(question.optionIds)) addError(errors, 'QUIZ_OPTION_ID_DUPLICATE', path, duplicate)
      if (question.answerId !== question.optionIds[question.answer]) addError(errors, 'QUIZ_ANSWER_ID', path, `answerId ${question.answerId} does not match option position ${question.answer}`)
    }
    if (!Array.isArray(question.optionRationales) || question.optionRationales.length !== question.options?.length || question.optionRationales.some((rationale) => !hasText(rationale))) {
      addError(errors, 'QUIZ_RATIONALES', path, 'optionRationales must provide a non-empty rationale for every option position')
    }
    if (!Array.isArray(question.conceptIds) || question.conceptIds.length === 0) addError(errors, 'QUIZ_OBJECTIVE_MAPPING', path, 'conceptIds must map the question to at least one objective module')
    if (!Array.isArray(question.remediationModuleIds) || question.remediationModuleIds.length === 0) addError(errors, 'QUIZ_REMEDIATION_MAPPING', path, 'remediationModuleIds must include at least one direct review destination')
    for (const moduleId of [...question.conceptIds || [], ...question.remediationModuleIds || []]) {
      if (!moduleIds.has(moduleId)) addError(errors, 'QUIZ_MODULE_REFERENCE', path, `unknown module ${moduleId}`)
    }
  }

  for (const week of inventory.weekList) {
    const path = `quizRules[${week.index}]`
    const questions = inventory.questions.filter((entry) => entry.weekIndex === week.index).map(({ question }) => question)
    const rule = rules[week.index]
    if (!isRecord(rule)) {
      addError(errors, 'QUIZ_RULE', path, 'quiz rule is required')
      continue
    }
    const poolIds = questions.map((question) => question.id)
    if (JSON.stringify(rule.poolQuestionIds) !== JSON.stringify(poolIds)) addError(errors, 'QUIZ_RULE_POOL', path, 'poolQuestionIds must match the exported question order exactly')
    if (rule.questionsPerAttempt !== questions.length) addError(errors, 'QUIZ_RULE_COUNT', path, `expected ${questions.length}, received ${rule.questionsPerAttempt}`)
    if (!Number.isInteger(rule.minimumCorrect) || rule.minimumCorrect < 1 || rule.minimumCorrect > questions.length) addError(errors, 'QUIZ_RULE_THRESHOLD', path, `invalid minimumCorrect ${rule.minimumCorrect}`)
    for (const questionId of rule.requiredQuestionIds || []) {
      if (!poolIds.includes(questionId)) addError(errors, 'QUIZ_RULE_REQUIRED', path, `unknown required question ${questionId}`)
    }
  }
}

function validateEvidenceResources(errors) {
  for (const [index, resource] of officialResources.entries()) {
    if (!hasText(resource.title) || !hasText(resource.provider) || !isHttpUrl(resource.url)) addError(errors, 'OFFICIAL_RESOURCE', `officialResources[${index}]`, 'title, provider, and HTTP(S) URL are required')
  }
}

export async function validateContentContracts({
  weeks = weekContent,
  questionSets = quizzes,
  rules = quizRules,
  objectiveEvidenceMap = objectiveEvidence,
  expected = EXPECTED_CONTENT_INVENTORY,
} = {}) {
  const errors = []
  const loadedWeeks = await loadContractWeeks(weeks)
  const inventory = buildContentInventory({ weeks: loadedWeeks, questionSets, objectiveEvidenceMap })
  const manifest = buildRouteManifest({ weeks: loadedWeeks })

  for (const [key, expectedValue] of Object.entries(expected)) checkExact(errors, inventory.stats[key], expectedValue, `COUNT_${key.toUpperCase()}`, key)

  const expectedWeekIndexes = Array.from({ length: expected.weeks }, (_, index) => index)
  const actualWeekIndexes = inventory.weekList.map((week) => week.index)
  if (JSON.stringify(actualWeekIndexes) !== JSON.stringify(expectedWeekIndexes)) addError(errors, 'WEEK_INDEXES', 'inventory', `expected ${expectedWeekIndexes.join(',')}, received ${actualWeekIndexes.join(',')}`)

  for (const [kind, values] of Object.entries({
    module: inventory.modules.map(({ module }) => module.id),
    lab: inventory.labs.map(({ lab }) => lab.id),
  })) {
    for (const duplicate of duplicateValues(values)) addError(errors, `DUPLICATE_${kind.toUpperCase()}_ID`, 'inventory', duplicate)
  }

  validateRouteContracts(errors, inventory, manifest)
  validateLearningObjectives(errors, inventory)
  validateLearnerWeekReferences(errors, inventory)
  validateObjectiveEvidence(errors, inventory, objectiveEvidenceMap)
  validateBlockContracts(errors, inventory)
  validateQuizContracts(errors, inventory, rules)
  validateEvidenceResources(errors)

  return {
    valid: errors.length === 0,
    errors,
    stats: inventory.stats,
    manifest,
  }
}

export function formatContentValidation(result, { maxErrors = 80 } = {}) {
  const stats = Object.entries(result.stats).map(([key, value]) => `${key}=${value}`).join(' · ')
  if (result.valid) return `SecTrack content validation PASS\n${stats}`
  const visible = result.errors.slice(0, maxErrors).map((error, index) => `${index + 1}. [${error.code}] ${error.path}: ${error.message}`)
  const remainder = result.errors.length - visible.length
  return [
    `SecTrack content validation FAIL (${result.errors.length} errors)`,
    stats,
    ...visible,
    ...(remainder > 0 ? [`... ${remainder} additional errors omitted`] : []),
  ].join('\n')
}
