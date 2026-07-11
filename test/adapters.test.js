import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLocalLearningInsights } from '../src/adapters/analytics.js'
import { getLocalLearningGuidance } from '../src/adapters/feedback.js'

test('local analytics contains only supplied browser-state events', () => {
  const weeks = { 1: { index: 1, labs: [{ id: 'lab-a', relatedConceptIds: ['concept-a'] }] } }
  const insights = buildLocalLearningInsights({
    labs: { 'lab-a': { status: 'attempted', hintLevel: 2 } },
    moduleNotes: { 'concept-a': '메모', empty: '' },
    submissions: {},
    lastActivityAt: '2026-07-11T00:00:00.000Z',
  }, weeks)

  assert.equal(insights.attemptedLabs, 1)
  assert.equal(insights.moduleNoteCount, 1)
  assert.deepEqual(insights.conceptFriction, [{ conceptId: 'concept-a', hintSteps: 2, weekIds: [1], labIds: ['lab-a'] }])
  assert.equal(Object.hasOwn(insights, 'learners'), false)
})

test('local guidance identifies itself as a rule rather than reviewer feedback', () => {
  assert.deepEqual(getLocalLearningGuidance({ type: 'quiz', title: '이해 확인' }), {
    source: 'local-rule',
    title: '이해 확인',
    body: '오답은 관련 개념으로 돌아갈 수 있는 복습 신호로 사용합니다.',
  })
})
