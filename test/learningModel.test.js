import test from 'node:test'
import assert from 'node:assert/strict'
import { activityTypes, quizzes, quizRules, weekContent } from '../src/courseData.js'
import {
  calculateProgressBreakdown,
  calculateWeekWorkload,
  getConceptResultEvidence,
  getConceptTitle,
  getQuizRetryCount,
  recordConceptReflection,
  recordHintUsage,
  recordQuizAttempt,
  validateLearningData,
} from '../src/learningModel.js'

test('Week 0-4 activities, paths, workloads, and references are valid', () => {
  assert.deepEqual(activityTypes, ['exploration', 'lesson', 'practice', 'investigation', 'simulation', 'external', 'report', 'assessment'])
  assert.deepEqual(Object.values(weekContent).map((week) => {
    const workload = calculateWeekWorkload(week)
    assert.equal(workload.totalMinutes, week.estimatedMinutes)
    return [workload.requiredMinutes, workload.extensionMinutes]
  }), [[250, 0], [420, 120], [390, 265], [650, 35], [640, 120]])
  assert.deepEqual(validateLearningData(), { valid: true, errors: [] })
})

test('quiz pools use explicit rules and complete concept metadata', () => {
  for (const [weekIndex, pool] of Object.entries(quizzes)) {
    assert.equal(pool.length, 6)
    assert.equal(quizRules[weekIndex].minimumCorrect, 5)
    for (const question of pool) {
      assert.ok(question.conceptIds.length)
      assert.ok(question.difficulty)
      assert.ok(question.remediationModuleIds.length)
    }
  }
})

test('progress is explainable and remains separate from mastery', () => {
  const base = { modulesRead: { 'w1-shell': true }, labs: { 'w1-path': { status: 'attempted' } }, mastery: { 'w1-shell': 'mastered' } }
  const changedMastery = { ...base, mastery: { 'w1-shell': 'not_started' } }
  const first = calculateProgressBreakdown(weekContent[1], base)
  const second = calculateProgressBreakdown(weekContent[1], changedMastery)
  assert.deepEqual(first, second)
  assert.deepEqual(first.reading, { completed: 1, total: 6 })
  assert.equal(first.activityAttempts.completed, 1)
  assert.equal(first.activityCompletions.completed, 0)
})

test('hint usage never changes mastery', () => {
  const progress = { mastery: { 'w4-taint': 'proficient' } }
  const next = recordHintUsage(progress, { activityId: 'w4-reflected', stage: 'observation', usedAt: '2026-07-11T00:00:00.000Z' })
  assert.deepEqual(next.mastery, progress.mastery)
  assert.equal(next.hintUsage['w4-reflected'].count, 1)
})

test('quiz attempts retain per-concept evidence and retry count', () => {
  const answers = Object.fromEntries(quizzes[2].map((question) => [question.id, question.answer]))
  answers.w2q1 = 1
  const first = recordQuizAttempt({ mastery: { 'w2-permissions': 'familiar' } }, { weekIndex: 2, answers, attemptedAt: '2026-07-11T00:00:00.000Z' })
  const second = recordQuizAttempt(first, { weekIndex: 2, answers: Object.fromEntries(quizzes[2].map((question) => [question.id, question.answer])), attemptedAt: '2026-07-11T00:05:00.000Z' })
  assert.equal(getConceptResultEvidence(second, 'w2-permissions')[0].correct, false)
  assert.equal(getConceptResultEvidence(second, 'w2-permissions').at(-1).correct, true)
  assert.equal(getQuizRetryCount(second, 2), 1)
  assert.deepEqual(second.mastery, first.mastery)
  assert.equal(getConceptTitle('w2-permissions'), '소유권과 권한')
})

test('self explanation, mastery, confidence, and review state stay separate', () => {
  const progress = recordConceptReflection({}, {
    conceptId: 'w3-session',
    explanation: '세션 ID는 서버의 세션 상태를 찾는 식별자다.',
    confidence: 'medium',
    reviewState: 'later',
    masteryLevel: 'explain',
    recordedAt: '2026-07-11T01:00:00.000Z',
  })
  assert.equal(progress.conceptEvidence['w3-session'].selfExplanation.source, 'self-explanation')
  assert.equal(progress.conceptMastery['w3-session'], 'explain')
  assert.equal(progress.confidence['w3-session'], 'medium')
  assert.equal(progress.reviewStates['w3-session'], 'later')
  assert.equal(progress.moduleChecks['w3-session'].explanation, '세션 ID는 서버의 세션 상태를 찾는 식별자다.')

  const answers = Object.fromEntries(quizzes[3].map((question) => [question.id, question.answer]))
  const afterQuiz = recordQuizAttempt(progress, { weekIndex: 3, answers, attemptedAt: '2026-07-11T01:05:00.000Z' })
  assert.equal(afterQuiz.conceptEvidence['w3-session'].selfExplanation.text, '세션 ID는 서버의 세션 상태를 찾는 식별자다.')
  assert.ok(afterQuiz.conceptEvidence['w3-session'].quizResults.length)
})
