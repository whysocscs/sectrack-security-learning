import {
  activityTypes,
  learningPaths,
  quizzes,
  quizRules,
  weekContent,
} from './courseData.js'
import { validateStructuredReflection } from './validation.js'

export const progressWeights = Object.freeze({
  exploration: 1,
  lesson: 1,
  practice: 2,
  investigation: 2,
  simulation: 2,
  external: 1,
  report: 2,
  assessment: 2,
})

export function isValidActivityType(value) {
  return activityTypes.includes(value)
}

export function isValidLearningPath(value) {
  return learningPaths.includes(value)
}

export function getWeekActivities(week) {
  if (!week) return []
  return [
    ...(Array.isArray(week.modules) ? week.modules : []).map((item) => ({ ...item, source: 'module' })),
    ...(Array.isArray(week.labs) ? week.labs : []).map((item) => ({ ...item, source: 'lab' })),
    ...(week.assessment ? [{ ...week.assessment, source: 'assessment' }] : []),
    ...(week.weeklyRecord ? [{ ...week.weeklyRecord, source: 'record' }] : []),
  ]
}

export function calculateWeekWorkload(week) {
  const items = getWeekActivities(week)
  const byPath = Object.fromEntries(learningPaths.map((path) => [
    path,
    items.filter((item) => item.path === path)
      .reduce((total, item) => total + item.estimatedMinutes, 0),
  ]))
  const byActivityType = Object.fromEntries(activityTypes.map((activityType) => [
    activityType,
    items.filter((item) => item.activityType === activityType)
      .reduce((total, item) => total + item.estimatedMinutes, 0),
  ]))
  return {
    requiredMinutes: byPath.required,
    extensionMinutes: byPath.extension,
    totalMinutes: byPath.required + byPath.extension,
    byPath,
    byActivityType,
    items,
  }
}

function quizState(week, progress) {
  const attempts = progress.quizAttempts?.[week.index]
  const attemptList = Array.isArray(attempts) ? attempts : []
  const latest = attemptList.at(-1) || progress.quizScores?.[week.index]
  if (!latest) return { attempted: false, passed: false }
  const rule = quizRules[week.index]
  const passedFromScore = Number.isFinite(latest.score) && Number.isFinite(rule?.minimumCorrect)
    ? latest.score >= rule.minimumCorrect
    : (Number.isFinite(latest.percent) ? latest.percent >= 80 : false)
  return {
    attempted: true,
    passed: typeof latest.passed === 'boolean' ? latest.passed : passedFromScore,
  }
}

export function isActivityRecorded(state) {
  return ['activity-recorded', 'completed'].includes(state?.status)
}

export function getWeeklyRecordState(progress = {}, weekIndex) {
  const submission = progress.submissions?.[`week-${weekIndex}`]
  if (!submission) return 'not-started'
  if (submission === true) return 'activity-recorded'
  return submission.status || 'activity-recorded'
}

export function calculateProgressBreakdown(week, progress = {}, options = {}) {
  const path = options.path || 'required'
  const modules = week.hideModuleProgress ? [] : (week.modules || []).filter((item) => path === 'all' || item.path === path)
  const labs = (week.labs || []).filter((item) => path === 'all' || item.path === path)
  const quiz = quizState(week, progress)
  const recordKey = `week-${week.index}`
  const recordDrafted = Boolean(progress.evidence?.[recordKey])
  const recordState = getWeeklyRecordState(progress, week.index)
  const recordCompleted = recordState === 'evidence-ready'
  const items = [
    ...modules.map((item) => ({
      id: item.id,
      activityType: item.activityType,
      status: progress.modulesRead?.[item.id] ? 'completed' : 'not_started',
      earned: progress.modulesRead?.[item.id] ? progressWeights.lesson : 0,
      available: progressWeights.lesson,
    })),
    ...labs.map((item) => {
      const status = progress.labs?.[item.id]?.status || 'not_started'
      const weight = progressWeights[item.activityType]
      return {
        id: item.id,
        activityType: item.activityType,
        status,
        earned: isActivityRecorded({ status }) ? weight : 0,
        available: weight,
      }
    }),
  ]
  if (week.assessment && (path === 'all' || week.assessment.path === path)) {
    items.push({ id: week.assessment.id, activityType: 'assessment', status: quiz.passed ? 'completed' : quiz.attempted ? 'attempted' : 'not_started', earned: quiz.passed ? 2 : quiz.attempted ? 1 : 0, available: 2 })
  }
  if (week.weeklyRecord && (path === 'all' || week.weeklyRecord.path === path)) {
    items.push({ id: week.weeklyRecord.id, activityType: 'report', status: recordCompleted ? 'completed' : recordDrafted ? 'attempted' : 'not_started', earned: recordCompleted ? 2 : recordDrafted ? 1 : 0, available: 2 })
  }
  const earned = items.reduce((total, item) => total + item.earned, 0)
  const available = items.reduce((total, item) => total + item.available, 0)
  return {
    weekIndex: week.index,
    path,
    percent: available ? Math.round((earned / available) * 100) : 0,
    earned,
    available,
    reading: { completed: modules.filter((item) => progress.modulesRead?.[item.id]).length, total: modules.length },
    activityAttempts: { completed: labs.filter((item) => progress.labs?.[item.id]).length, total: labs.length },
    activityCompletions: { completed: labs.filter((item) => isActivityRecorded(progress.labs?.[item.id])).length, total: labs.length },
    understandingCheck: quiz,
    weeklyRecord: { drafted: recordDrafted, completed: recordCompleted, state: recordState },
    items,
  }
}

function answerFor(answers, question, index) {
  if (Array.isArray(answers)) return answers[index]
  return answers?.[question?.id] ?? answers?.[index]
}

function stableHash(value) {
  let hash = 2166136261
  for (const character of String(value)) {
    hash ^= character.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededShuffle(values, seed) {
  const result = [...values]
  let state = stableHash(seed) || 1
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const target = state % (index + 1)
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

export function getQuizPresentation(weekIndex, questions = quizzes[weekIndex], seed = 'sectrack-course-v1') {
  const pool = Array.isArray(questions) ? questions : []
  // Rotate the remainder by week as well as shuffling it, so small weekly pools do
  // not accumulate a course-wide A/B bias while each learner keeps stable choices.
  const positions = seededShuffle(pool.map((_, index) => (index + Number(weekIndex || 0)) % 3), `${seed}:${weekIndex}:positions`)
  return pool.map((question, questionIndex) => {
    const options = question.options.map((label, optionIndex) => ({
      id: question.optionIds?.[optionIndex] || `${question.id}-option-${optionIndex + 1}`,
      label: typeof label === 'string' ? label : label.label,
      rationale: question.optionRationales?.[optionIndex]
        || (optionIndex === question.answer ? `정답 근거: ${question.explanation}` : `“${typeof label === 'string' ? label : label.label}”은 이 문항의 조건과 맞지 않습니다. ${question.explanation}`),
      originalIndex: optionIndex,
    }))
    const answerId = question.answerId || options[question.answer]?.id
    const correctOption = options.find((option) => option.id === answerId)
    const distractors = seededShuffle(options.filter((option) => option.id !== answerId), `${seed}:${question.id}:distractors`)
    const target = Math.min(positions[questionIndex] ?? 0, options.length - 1)
    const ordered = [...distractors]
    ordered.splice(target, 0, correctOption)
    return { ...question, options: ordered, answerId, answer: target }
  })
}

export function evaluateQuizAttempt(weekIndex, answers, questions = quizzes[weekIndex]) {
  const rule = quizRules[weekIndex]
  const questionPool = Array.isArray(questions) ? questions : []
  const questionResults = questionPool.map((question, index) => {
    const conceptIds = Array.isArray(question?.conceptIds) ? question.conceptIds : []
    const remediationModuleIds = Array.isArray(question?.remediationModuleIds) ? question.remediationModuleIds : []
    const selectedAnswer = answerFor(answers, question, index)
    const selectedId = typeof selectedAnswer === 'number'
      ? question.optionIds?.[selectedAnswer] ?? question.options?.[selectedAnswer]?.id ?? selectedAnswer
      : selectedAnswer
    const answerId = question.answerId ?? question.optionIds?.[question.answer] ?? question.options?.[question.answer]?.id ?? question.answer
    return {
      questionId: question?.id,
      conceptIds: [...conceptIds],
      difficulty: question?.difficulty,
      remediationModuleIds: [...remediationModuleIds],
      selectedAnswer: selectedId,
      correct: selectedId === answerId,
    }
  })
  const score = questionResults.filter((result) => result.correct).length
  const hasValidRule = Number.isFinite(rule?.minimumCorrect) && Array.isArray(rule.requiredQuestionIds)
  const allCoreCorrect = hasValidRule && rule.requiredQuestionIds.every((id) => questionResults.some((result) => result.questionId === id && result.correct))
  return {
    score,
    total: questionResults.length,
    percent: questionResults.length ? Math.round((score / questionResults.length) * 100) : 0,
    passed: hasValidRule && score >= rule.minimumCorrect && allCoreCorrect,
    questionResults,
  }
}

export function evaluateWeeklyEvidence(evidence = {}) {
  return validateStructuredReflection(evidence.reflection || evidence)
}

export function recordQuizAttempt(progress = {}, input, suppliedAnswers) {
  const config = input && typeof input === 'object' ? input : { weekIndex: input, answers: suppliedAnswers }
  const weekIndex = Number(config.weekIndex)
  const result = evaluateQuizAttempt(weekIndex, config.answers, config.questions ?? quizzes[weekIndex])
  const storedAttempts = progress.quizAttempts?.[weekIndex]
  const previousAttempts = Array.isArray(storedAttempts) ? storedAttempts : []
  const attemptNumber = previousAttempts.length + 1
  const attemptedAt = config.attemptedAt || new Date().toISOString()
  const attempt = { ...result, attemptNumber, retryCount: attemptNumber - 1, attemptedAt }
  const conceptEvidence = { ...(progress.conceptEvidence || {}) }
  for (const questionResult of result.questionResults) {
    for (const conceptId of questionResult.conceptIds) {
      const previousEvidence = conceptEvidence[conceptId] || {}
      const previous = previousEvidence.quizResults || []
      const evidence = { source: 'quiz', weekIndex, attemptNumber, attemptedAt, ...questionResult }
      conceptEvidence[conceptId] = { ...previousEvidence, quizResults: [...previous, evidence], latestQuizResult: evidence }
    }
  }
  return {
    ...progress,
    quizAttempts: { ...(progress.quizAttempts || {}), [weekIndex]: [...previousAttempts, attempt] },
    quizScores: { ...(progress.quizScores || {}), [weekIndex]: attempt },
    conceptEvidence,
  }
}

export function getQuizRetryCount(progress, weekIndex) {
  const attempts = progress.quizAttempts?.[weekIndex]
  return Math.max(0, (Array.isArray(attempts) ? attempts.length : 0) - 1)
}

export function getConceptResultEvidence(progress, conceptId) {
  return progress.conceptEvidence?.[conceptId]?.quizResults || []
}

export function recordConceptReflection(progress = {}, {
  conceptId,
  explanation,
  confidence,
  reviewState,
  masteryLevel,
  recordedAt,
} = {}) {
  if (!conceptId) return progress
  const timestamp = recordedAt || new Date().toISOString()
  const previousEvidence = progress.conceptEvidence?.[conceptId] || {}
  const next = {
    ...progress,
    moduleChecks: {
      ...(progress.moduleChecks || {}),
      [conceptId]: {
        ...(progress.moduleChecks?.[conceptId] || {}),
        ...(explanation !== undefined ? { explanation } : {}),
        ...(confidence !== undefined ? { confidence } : {}),
        ...(reviewState !== undefined ? { reviewState } : {}),
        ...(masteryLevel !== undefined ? { masteryLevel } : {}),
        updatedAt: timestamp,
      },
    },
    conceptEvidence: {
      ...(progress.conceptEvidence || {}),
      [conceptId]: {
        ...previousEvidence,
        ...(explanation !== undefined ? {
          selfExplanation: { source: 'self-explanation', text: explanation, recordedAt: timestamp },
        } : {}),
      },
    },
    lastActivityAt: timestamp,
  }
  if (confidence !== undefined) next.confidence = { ...(progress.confidence || {}), [conceptId]: confidence }
  if (reviewState !== undefined) next.reviewStates = { ...(progress.reviewStates || {}), [conceptId]: reviewState }
  if (masteryLevel !== undefined) next.conceptMastery = { ...(progress.conceptMastery || {}), [conceptId]: masteryLevel }
  return next
}

export function recordHintUsage(progress = {}, { activityId, stage, usedAt } = {}) {
  const previous = progress.hintUsage?.[activityId] || { count: 0, stages: [] }
  return {
    ...progress,
    hintUsage: {
      ...(progress.hintUsage || {}),
      [activityId]: { count: previous.count + 1, stages: [...previous.stages, stage], lastUsedAt: usedAt || new Date().toISOString() },
    },
  }
}

export function getConceptTitle(conceptId, weeks = weekContent) {
  for (const week of Object.values(weeks)) {
    const module = week.modules?.find((item) => item.id === conceptId)
    if (module) return module.title
  }
  return null
}

export function validateLearningData(weeks = weekContent) {
  const errors = []
  const weekList = Object.values(weeks || {}).filter((week) => week && typeof week === 'object')
  const moduleIds = new Set(weekList.flatMap((week) => (Array.isArray(week.modules) ? week.modules : []).map((item) => item?.id).filter(Boolean)))
  const activityWeeks = new Map()
  for (const week of weekList) {
    for (const item of getWeekActivities(week)) {
      if (!isValidActivityType(item.activityType)) errors.push(`${item.id}: invalid activity type`)
      if (!isValidLearningPath(item.path)) errors.push(`${item.id}: invalid path`)
      if (item.id) {
        const previousWeek = activityWeeks.get(item.id)
        if (activityWeeks.has(item.id)) errors.push(`duplicate activity id ${item.id}: weeks ${previousWeek} and ${week.index}`)
        else activityWeeks.set(item.id, week.index)
      }
    }
    const calculated = calculateWeekWorkload(week)
    if (calculated.requiredMinutes !== week.requiredMinutes || calculated.extensionMinutes !== week.extensionMinutes) errors.push(`${week.id}: workload mismatch`)
    const questionPool = quizzes[week.index]
    const rule = quizRules[week.index]
    const expectsQuiz = week.disableAssessment !== true && week.assessment !== null
    if (expectsQuiz && !Array.isArray(questionPool)) errors.push(`${week.id}: missing quiz definition`)
    if (expectsQuiz && (!rule || typeof rule !== 'object')) errors.push(`${week.id}: missing quiz rule definition`)
    for (const question of (Array.isArray(questionPool) ? questionPool : [])) {
      if (!question || typeof question !== 'object') {
        errors.push(`${week.id}: malformed quiz question`)
        continue
      }
      const references = [
        ...(Array.isArray(question.conceptIds) ? question.conceptIds : []),
        ...(Array.isArray(question.remediationModuleIds) ? question.remediationModuleIds : []),
      ]
      if (!Array.isArray(question.conceptIds) || !Array.isArray(question.remediationModuleIds)) errors.push(`${question.id || week.id}: malformed quiz references`)
      for (const id of references) {
        if (!moduleIds.has(id)) errors.push(`${question.id}: unknown reference ${id}`)
      }
    }
    for (const coverage of week.contextCoverage || []) {
      for (const id of (Array.isArray(coverage.moduleIds) ? coverage.moduleIds : [])) if (!moduleIds.has(id)) errors.push(`${coverage.id}: unknown module ${id}`)
      for (const id of (Array.isArray(coverage.labIds) ? coverage.labIds : [])) if (!(Array.isArray(week.labs) ? week.labs : []).some((lab) => lab.id === id)) errors.push(`${coverage.id}: unknown lab ${id}`)
    }
  }
  return { valid: errors.length === 0, errors }
}
