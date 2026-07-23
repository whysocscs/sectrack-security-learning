import test from 'node:test'
import assert from 'node:assert/strict'
import { recordFields, evaluateActivityRecord } from '../src/activityRecordModel.js'
import { weekContent } from '../src/courseData.js'

const labs = Object.values(weekContent).flatMap((week) => week.labs)

function confirmations(lab) {
  return {
    masked: true,
    scopeConfirmed: lab.activityType === 'external',
    resetConfirmed: lab.activityType === 'simulation',
    criteriaConfirmed: (lab.successCriteria || []).map((_, index) => index),
    rubricConfirmed: (lab.rubric || []).map((_, index) => index),
  }
}

function validRecord(lab) {
  const fields = recordFields[lab.activityType] || recordFields.practice
  return {
    ...confirmations(lab),
    ...Object.fromEntries(fields.filter((field) => field.required).map((field, index) => [
      field.id,
      `${index + 1}번째 ${field.label} 항목에서 합성 화면의 고유한 상태 변화와 다음 확인 조건을 기록했습니다.`,
    ])),
  }
}

test('every learner-visible lab rejects one repeated generic record and accepts a distinct structured record', () => {
  for (const lab of labs.filter((item) => !['assessment', 'exploration'].includes(item.activityType))) {
    const fields = recordFields[lab.activityType] || recordFields.practice
    const repeated = {
      ...confirmations(lab),
      ...Object.fromEntries(fields.filter((field) => field.required).map((field) => [field.id, '모든 필드에 똑같이 복사한 의미 없는 공통 기록입니다.'])),
    }
    assert.equal(evaluateActivityRecord(lab, repeated).valid, false, `${lab.id} must reject duplicated evidence`)
    assert.deepEqual(evaluateActivityRecord(lab, validRecord(lab)).fieldErrors, {}, `${lab.id} must accept its complete structured fixture`)
  }
})

test('activity record validation rejects whitespace, repeated characters, unchecked criteria, and visible secrets', () => {
  const lab = labs.find((item) => item.activityType === 'investigation')
  const fields = recordFields[lab.activityType].filter((field) => field.required)
  const whitespace = { ...confirmations(lab), ...Object.fromEntries(fields.map((field) => [field.id, '\u200b\u00a0   '])) }
  assert.equal(evaluateActivityRecord(lab, whitespace).valid, false)

  const repeated = { ...confirmations(lab), ...Object.fromEntries(fields.map((field, index) => [field.id, `${index}가가가가가가가가가가가가가가가가`])) }
  assert.equal(evaluateActivityRecord(lab, repeated).valid, false)

  const unchecked = { ...validRecord(lab), criteriaConfirmed: [] }
  assert.ok(evaluateActivityRecord(lab, unchecked).fieldErrors.criteriaConfirmed)

  const sensitive = validRecord(lab)
  sensitive[fields[0].id] = 'Authorization: Bearer actual-training-secret-value'
  assert.ok(evaluateActivityRecord(lab, sensitive).fieldErrors.sensitive)
})
