import assert from 'node:assert/strict'
import test from 'node:test'
import { quizzes, weekContent } from '../src/courseData.js'
import {
  calculateProgressBreakdown,
  evaluateQuizAttempt,
  getQuizPresentation,
} from '../src/learningModel.js'
import { getNextTask } from '../src/platformLogic.js'
import {
  isLowInformationText,
  normalizeLearningText,
  validateLearningText,
  validateStructuredReflection,
} from '../src/validation.js'

test('learning text validation rejects invisible, repetitive, and duplicate evidence', () => {
  assert.equal(
    normalizeLearningText('\u00a0\uff21\uff30\uff29\u200b\u2060  \uc2e0\ub8b0\u3000\uacbd\uacc4\ufeff'),
    'API \uc2e0\ub8b0 \uacbd\uacc4',
  )
  assert.match(
    validateLearningText('\u00a0\u200b\u200c\u2060\ufeff\u3000', { minLength: 8, label: '\uadfc\uac70' }),
    /\uc785\ub825/,
  )
  assert.equal(isLowInformationText('\ubcf4\uc548\ubcf4\uc548\ubcf4\uc548\ubcf4\uc548', { minLength: 8 }), true)
  assert.match(
    validateLearningText('\ubcf4\uc548\ubcf4\uc548\ubcf4\uc548\ubcf4\uc548', { minLength: 8, label: '\uadfc\uac70' }),
    /\ubc18\ubcf5 \ubb38\uc790/,
  )
  assert.equal(validateLearningText('\uc11c\ub85c \ub2e4\ub978 \uad00\ucc30\uacfc \uadfc\uac70\ub97c \uc5f0\uacb0\ud55c\ub2e4.', { minLength: 8 }), '')

  const duplicateEvidence = '\uc0ac\uc6a9\uc790 \uc785\ub825\uc774 \uc11c\ubc84\ub97c \uac70\uccd0 \ud654\uba74\uc73c\ub85c \uc804\ub2ec\ub418\ub294 \uc815\uc0c1 \ud750\ub984\uc744 \uad00\ucc30\ud588\ub2e4.'
  const reflection = {
    normalFlow: duplicateEvidence,
    trustBoundary: duplicateEvidence.replace('\uc0ac\uc6a9\uc790 ', '\uc0ac\uc6a9\uc790\u200b\u00a0'),
    failurePoint: '\ucd9c\ub825 \ucee8\ud14d\uc2a4\ud2b8\ub97c \uad6c\ubd84\ud558\uc9c0 \uc54a\uc740 \ub80c\ub354\ub9c1 \uc9c0\uc810\uc5d0\uc11c \ub370\uc774\ud130\uac00 \ucf54\ub4dc\ub85c \ud574\uc11d\ub410\ub2e4.',
    patchRemediation: '\ud14d\uc2a4\ud2b8 \ucd9c\ub825\uc740 textContent\ub85c \ubc14\uafb8\uace0 \uad00\ub828 \ubcf4\uc548 \ud5e4\ub354\ub97c \ubcf4\uc870 \ud1b5\uc81c\ub85c \uc801\uc6a9\ud588\ub2e4.',
    retest: '\ub3d9\uc77c\ud55c \uc5ed\ud560\uacfc \uc785\ub825 \uacbd\ub85c\uc5d0\uc11c \uc815\uc0c1 \ud14d\uc2a4\ud2b8 \ud45c\uc2dc\uc640 \uc2e4\ud589 \ucc28\ub2e8\uc744 \ub2e4\uc2dc \ud655\uc778\ud588\ub2e4.',
  }
  const duplicateResult = validateStructuredReflection(reflection)
  assert.equal(duplicateResult.valid, false)
  assert.match(duplicateResult.fieldErrors.normalFlow, /\ub2e4\ub978 \ud56d\ubaa9\uacfc \uac19\uc740 \ubb38\uc7a5/)
  assert.match(duplicateResult.fieldErrors.trustBoundary, /\ub2e4\ub978 \ud56d\ubaa9\uacfc \uac19\uc740 \ubb38\uc7a5/)
  assert.deepEqual(Object.keys(duplicateResult.fieldErrors).sort(), ['normalFlow', 'trustBoundary'])

  assert.equal(validateStructuredReflection({
    ...reflection,
    trustBoundary: '\ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c \uc2dc\uc791\ud55c \uac12\uc774 \uc11c\ubc84 \ud15c\ud50c\ub9bf\uc73c\ub85c \ub118\uc5b4\uac00\ub294 \uad6c\uac04\uc744 \uc2e0\ub8b0 \uacbd\uacc4\ub85c \ud45c\uc2dc\ud588\ub2e4.',
  }).valid, true)
})

test('all 16 quiz presentations keep stable identities, rationales, and balanced correct positions', () => {
  const weekIndexes = Object.keys(quizzes).map(Number).sort((left, right) => left - right)
  assert.deepEqual(weekIndexes, Array.from({ length: 16 }, (_, index) => index))
  assert.deepEqual(Object.keys(weekContent).map(Number).sort((left, right) => left - right), weekIndexes)

  const questionIds = new Set()
  const optionIds = new Set()
  const correctPositions = [0, 0, 0]

  for (const weekIndex of weekIndexes) {
    const pool = quizzes[weekIndex]
    const productionPresentation = getQuizPresentation(weekIndex, pool)
    const repeatedPresentation = getQuizPresentation(weekIndex, pool)
    const alternatePresentation = getQuizPresentation(weekIndex, pool, 'learning-integrity-alternate-seed')

    assert.deepEqual(repeatedPresentation, productionPresentation)
    assert.equal(productionPresentation.length, pool.length)

    for (let questionIndex = 0; questionIndex < pool.length; questionIndex += 1) {
      const source = pool[questionIndex]
      const presented = productionPresentation[questionIndex]
      const alternate = alternatePresentation[questionIndex]

      assert.equal(questionIds.has(source.id), false, `duplicate question id: ${source.id}`)
      questionIds.add(source.id)
      assert.equal(presented.id, source.id)
      assert.equal(alternate.id, source.id)
      assert.equal(presented.answerId, source.answerId)
      assert.equal(alternate.answerId, source.answerId)
      assert.equal(source.optionIds.length, 3)
      assert.equal(source.optionRationales.length, source.optionIds.length)
      assert.ok(source.optionIds.includes(source.answerId))
      assert.deepEqual(
        presented.options.map((option) => option.id).sort(),
        [...source.optionIds].sort(),
      )
      assert.deepEqual(
        alternate.options.map((option) => option.id).sort(),
        [...source.optionIds].sort(),
      )

      for (const option of presented.options) {
        assert.equal(optionIds.has(option.id), false, `duplicate option id: ${option.id}`)
        optionIds.add(option.id)
        assert.equal(validateLearningText(option.rationale, { minLength: 10, label: `${option.id} \uadfc\uac70` }), '')
      }
      correctPositions[presented.answer] += 1
    }

    for (let position = 0; position < 3; position += 1) {
      const samePositionAnswers = Object.fromEntries(
        productionPresentation.map((question) => [question.id, question.options[position].id]),
      )
      assert.equal(
        evaluateQuizAttempt(weekIndex, samePositionAnswers, productionPresentation).passed,
        false,
        `week ${weekIndex} passed by selecting only position ${position}`,
      )
    }
  }

  assert.equal(questionIds.size, 102)
  assert.equal(optionIds.size, 306)
  assert.deepEqual(correctPositions, [34, 34, 34])
})

test('only evidence-ready records complete progress and opened or attempted labs earn zero', () => {
  const labWeek = {
    index: 8,
    title: '\ud65c\ub3d9 \uc0c1\ud0dc \uacc4\uc57d',
    modules: [],
    labs: [{
      id: 'integrity-lab',
      title: '\uad6c\uc870\ud654 \uad00\ucc30 \ud65c\ub3d9',
      activityType: 'practice',
      path: 'required',
      estimatedMinutes: 10,
    }],
    assessment: null,
    weeklyRecord: null,
  }

  for (const labState of [
    { openedAt: '2026-07-15T00:00:00.000Z' },
    { status: 'attempted', openedAt: '2026-07-15T00:00:00.000Z' },
  ]) {
    const progress = { labs: { 'integrity-lab': labState } }
    const breakdown = calculateProgressBreakdown(labWeek, progress)
    assert.equal(breakdown.earned, 0)
    assert.equal(breakdown.percent, 0)
    assert.deepEqual(breakdown.activityCompletions, { completed: 0, total: 1 })
    assert.equal(breakdown.items[0].earned, 0)
    assert.equal(getNextTask([labWeek], progress).id, 'integrity-lab')
  }

  const recordWeek = {
    index: 8,
    title: '\uc8fc\ucc28 \uae30\ub85d \uc0c1\ud0dc \uacc4\uc57d',
    modules: [],
    labs: [],
    assessment: null,
    weeklyRecord: {
      id: 'w8-record',
      activityType: 'report',
      path: 'required',
      estimatedMinutes: 25,
    },
  }
  const evidence = {
    'week-8': {
      reflection: {
        normalFlow: '\uc785\ub825\uc774 \uc11c\ubc84 \uac80\uc99d\uacfc \ucd9c\ub825 \ucc98\ub9ac\ub97c \uac70\uccd0 \ud14d\uc2a4\ud2b8\ub85c \ud45c\uc2dc\ub418\ub294 \uc815\uc0c1 \ud750\ub984\uc744 \ud655\uc778\ud588\ub2e4.',
        trustBoundary: '\ube0c\ub77c\uc6b0\uc800 \uc785\ub825\uc774 \uc11c\ubc84 \ud15c\ud50c\ub9bf\uc73c\ub85c \ub118\uc5b4\uac00\ub294 \uad6c\uac04\uc744 \uc2e0\ub8b0 \uacbd\uacc4\ub85c \ud45c\uc2dc\ud588\ub2e4.',
        failurePoint: '\uc0ac\uc6a9\uc790 \uac12\uc744 HTML\ub85c \ud574\uc11d\ud558\ub294 \ucd9c\ub825 \uc9c0\uc810\uc5d0\uc11c \uc548\uc804\ud55c \ub370\uc774\ud130 \uacbd\uacc4\uac00 \uae68\uc9c0\ub294 \uac83\uc744 \uad00\ucc30\ud588\ub2e4.',
        patchRemediation: '\ucd9c\ub825\uc744 textContent\ub85c \ubc14\uafb8\uace0 \uc11c\ubc84 \uac80\uc99d\uacfc \ubcf4\uc548 \ud5e4\ub354\ub97c \ubcf4\uc870 \ud1b5\uc81c\ub85c \uc801\uc6a9\ud588\ub2e4.',
        retest: '\ub3d9\uc77c\ud55c \uc5ed\ud560\uacfc \uc785\ub825 \uacbd\ub85c\uc5d0\uc11c \uc815\uc0c1 \ud45c\uc2dc\uc640 \ucf54\ub4dc \ud574\uc11d \ucc28\ub2e8\uc744 \ub2e4\uc2dc \ud655\uc778\ud588\ub2e4.',
      },
    },
  }
  const passedQuiz = { 8: { passed: true, percent: 100 } }

  for (const status of ['draft', 'activity-recorded', 'recorded', 'completed']) {
    const progress = {
      evidence,
      quizScores: passedQuiz,
      submissions: { 'week-8': { status } },
    }
    const breakdown = calculateProgressBreakdown(recordWeek, progress)
    assert.equal(breakdown.weeklyRecord.completed, false, `${status} must not complete the record`)
    assert.notEqual(breakdown.items[0].status, 'completed')
    assert.ok(breakdown.percent < 100)
    assert.equal(getNextTask([recordWeek], progress).type, 'record')
  }

  const evidenceReadyProgress = {
    evidence,
    quizScores: passedQuiz,
    submissions: { 'week-8': { status: 'evidence-ready' } },
  }
  const completed = calculateProgressBreakdown(recordWeek, evidenceReadyProgress)
  assert.deepEqual(completed.weeklyRecord, { drafted: true, completed: true, state: 'evidence-ready' })
  assert.equal(completed.items[0].status, 'completed')
  assert.equal(completed.earned, completed.available)
  assert.equal(completed.percent, 100)
  assert.equal(getNextTask([recordWeek], evidenceReadyProgress).type, 'review')
})
