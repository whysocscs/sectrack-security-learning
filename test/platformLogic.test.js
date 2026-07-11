import test from 'node:test'
import assert from 'node:assert/strict'
import { completedExampleReport } from '../src/reportData.js'
import {
  buildXssTrace,
  findSensitiveData,
  mergeProgress,
  parseHash,
  parseProgress,
  redactSensitive,
  reportQualityScore,
  serializeProgress,
  validateReport,
} from '../src/platformLogic.js'

test('mind-map status, note, custom node survive export and import', () => {
  const progress = mergeProgress({
    mindmap: {
      statuses: { xss: 'explain' },
      notes: { xss: '브라우저 컨텍스트별로 방어가 다르다.' },
      customNodes: [{ id: 'custom-space', label: '우주 보안', branchId: 'industry' }],
      interests: ['offensive', 'engineering'],
    },
  })
  const restored = parseProgress(serializeProgress(progress))
  assert.equal(restored.mindmap.statuses.xss, 'explain')
  assert.match(restored.mindmap.notes.xss, /브라우저 컨텍스트/)
  assert.equal(restored.mindmap.customNodes[0].label, '우주 보안')
  assert.deepEqual(restored.mindmap.interests, ['offensive', 'engineering'])
})

test('XSS trace exposes source, sink, context, and execution separately', () => {
  const trace = buildXssTrace('xss-dom', 'poc')
  assert.equal(trace.source, 'location.hash')
  assert.equal(trace.sink, 'result.innerHTML')
  assert.equal(trace.context, 'HTML body DOM')
  assert.match(trace.execution, /고정 문자열/)
})

test('completed report passes validation while unmasked secrets are detected', () => {
  const checks = validateReport(completedExampleReport)
  assert.equal(checks.every((item) => item.pass), true)
  assert.equal(reportQualityScore(completedExampleReport), 100)
  const unsafe = 'Cookie: session=real-secret\nAuthorization: Bearer abc.def.ghi'
  assert.deepEqual(findSensitiveData(unsafe).map((item) => item.id), ['cookie', 'authorization'])
  const redacted = redactSensitive(unsafe)
  assert.match(redacted, /Cookie: \[REDACTED\]/)
  assert.match(redacted, /Authorization: \[REDACTED\]/)
})

test('core hash routes resolve to roadmap, week, lab, and report editor', () => {
  assert.deepEqual(parseHash('#/learn'), { page: 'learn' })
  assert.deepEqual(parseHash('#/learn/week/4'), { page: 'week', week: 4 })
  assert.deepEqual(parseHash('#/labs/w4-reflected'), { page: 'lab', labId: 'w4-reflected' })
  assert.deepEqual(parseHash('#/reports/new'), { page: 'report-editor', reportId: 'local-xss-draft' })
})
