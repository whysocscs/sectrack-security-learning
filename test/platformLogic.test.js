import test from 'node:test'
import assert from 'node:assert/strict'
import { completedExampleReport } from '../src/reportData.js'
import {
  buildXssTrace,
  findSensitiveData,
  getNextTask,
  mergeProgress,
  parseHash,
  parseProgress,
  redactSensitive,
  reportQualityScore,
  routeToHash,
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

test('week tabs and modules round-trip while invalid routes stay explicit', () => {
  const moduleRoute = { page: 'week', week: 3, tab: 'concepts', moduleId: 'w3-http' }
  assert.equal(routeToHash(moduleRoute), '#/learn/week/3/concepts/w3-http')
  assert.deepEqual(parseHash(routeToHash(moduleRoute)), moduleRoute)
  assert.deepEqual(parseHash('#/learn/week/3/quiz'), { page: 'week', week: 3, tab: 'quiz' })
  assert.deepEqual(parseHash('#/learn/week/3/not-a-tab'), { page: 'not-found', path: 'learn/week/3/not-a-tab' })
  assert.deepEqual(parseHash('#/labs/w0-map'), { page: 'mindmap', compatibilityRoute: true })
  assert.deepEqual(parseHash('#/admin'), { page: 'insights', legacyRoute: true })
  assert.deepEqual(parseHash('#/bad/path'), { page: 'not-found', path: 'bad/path' })
})

test('next task contains an exact route for module, quiz, and weekly record', () => {
  const weeks = [{ index: 1, modules: [{ id: 'm1', title: '첫 개념', duration: 20 }], labs: [] }]
  const moduleTask = getNextTask(weeks, mergeProgress())
  assert.deepEqual(moduleTask.route, { page: 'week', week: 1, tab: 'concepts', moduleId: 'm1' })

  const quizTask = getNextTask(weeks, mergeProgress({ modulesRead: { m1: true } }))
  assert.equal(quizTask.type, 'quiz')
  assert.deepEqual(quizTask.route, { page: 'week', week: 1, tab: 'quiz' })

  const recordTask = getNextTask(weeks, mergeProgress({ modulesRead: { m1: true }, quizScores: { 1: { percent: 100 } } }))
  assert.equal(recordTask.type, 'record')
  assert.deepEqual(recordTask.route, { page: 'week', week: 1, tab: 'record' })
})
