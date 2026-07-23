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
  assert.deepEqual(parseHash('#/learn/week/0/careers'), { page: 'week', week: 0, tab: 'careers' })
  assert.deepEqual(parseHash('#/labs/w0-map'), { page: 'lab', labId: 'w0-map' })
  assert.deepEqual(parseHash('#/admin'), { page: 'insights', legacyRoute: true })
  assert.deepEqual(parseHash('#/bad/path'), { page: 'not-found', path: 'bad/path' })
  const sectionRoute = { ...moduleRoute, sectionId: 'w3-http-checkpoint-1' }
  assert.equal(routeToHash(sectionRoute), '#/learn/week/3/concepts/w3-http/section/w3-http-checkpoint-1')
  assert.deepEqual(parseHash(routeToHash(sectionRoute)), sectionRoute)
  assert.equal(parseHash('#/learn/week/3/concepts/w3-http/extra').page, 'not-found')
})

test('malformed encoded module ids become recoverable not-found routes without throwing', () => {
  for (const malformed of ['%', '%E0%A4%A', '%ZZ']) {
    const hash = `#/learn/week/3/concepts/${malformed}`
    assert.doesNotThrow(() => parseHash(hash))
    assert.deepEqual(parseHash(hash), {
      page: 'not-found',
      path: `learn/week/3/concepts/${malformed}`,
      reason: 'malformed-uri-component',
    })
  }

  const koreanRoute = { page: 'week', week: 3, tab: 'concepts', moduleId: '한국어 모듈' }
  assert.deepEqual(parseHash(routeToHash(koreanRoute)), koreanRoute)
})

test('next task contains an exact route for module, quiz, and weekly record', () => {
  const weeks = [{ index: 1, modules: [{ id: 'm1', title: '첫 개념', duration: 20 }], labs: [], weeklyRecord: { id: 'w1-record' } }]
  const moduleTask = getNextTask(weeks, mergeProgress({ learningPlanVersion: 1 }))
  assert.deepEqual(moduleTask.route, { page: 'week', week: 1, tab: 'concepts', moduleId: 'm1' })

  const quizTask = getNextTask(weeks, mergeProgress({ learningPlanVersion: 1, modulesRead: { m1: true } }))
  assert.equal(quizTask.type, 'quiz')
  assert.deepEqual(quizTask.route, { page: 'week', week: 1, tab: 'quiz' })

  const recordTask = getNextTask(weeks, mergeProgress({ learningPlanVersion: 1, modulesRead: { m1: true }, quizScores: { 1: { percent: 100 } } }))
  assert.equal(recordTask.type, 'record')
  assert.deepEqual(recordTask.route, { page: 'week', week: 1, tab: 'record' })

  const stillRecordTask = getNextTask(weeks, mergeProgress({
    learningPlanVersion: 1,
    modulesRead: { m1: true },
    quizScores: { 1: { percent: 100 } },
    submissions: { 'week-1': { status: 'recorded' } },
  }))
  assert.equal(stillRecordTask.type, 'record')

  const reviewTask = getNextTask(weeks, mergeProgress({
    learningPlanVersion: 1,
    modulesRead: { m1: true },
    quizScores: { 1: { percent: 100 } },
    submissions: { 'week-1': { status: 'evidence-ready' } },
  }))
  assert.equal(reviewTask.type, 'review')
})

test('next task accepts activity-recorded and legacy completed lab states, including the Week 0 map', () => {
  const weekZero = [{ index: 0, modules: [], labs: [] }]
  const weekOne = [{
    index: 1,
    modules: [],
    labs: [{ id: 'lab-1', title: '로컬 실습', estimatedMinutes: 10 }],
  }]

  assert.equal(getNextTask(weekZero, mergeProgress()).id, 'w0-map')
  assert.equal(getNextTask(weekZero, mergeProgress({ labs: { 'w0-map': { status: 'activity-recorded' } } })).type, 'quiz')
  assert.equal(getNextTask(weekZero, mergeProgress({ labs: { 'w0-map': { status: 'completed' } } })).type, 'quiz')
  assert.equal(getNextTask(weekOne, mergeProgress({ labs: { 'lab-1': { status: 'attempted' } } })).id, 'lab-1')
  assert.equal(getNextTask(weekOne, mergeProgress({ labs: { 'lab-1': { status: 'activity-recorded' } } })).type, 'quiz')
  assert.equal(getNextTask(weekOne, mergeProgress({ labs: { 'lab-1': { status: 'completed' } } })).type, 'quiz')
})

test('completed curriculum falls back to the final available week review', () => {
  const weeks = [{ index: 15, title: 'AI Agent 보안', modules: [], labs: [] }]
  const next = getNextTask(weeks, mergeProgress({ learningPlanVersion: 1, quizScores: { 15: { percent: 100 } } }))

  assert.equal(next.type, 'review')
  assert.equal(next.week, 15)
  assert.equal(next.id, 'review-week-15')
  assert.deepEqual(next.route, { page: 'week', week: 15, tab: 'concepts' })
})

test('legacy Week 1 and 2 progress merges into the new Week 1 without losing records', () => {
  const progress = mergeProgress({
    quizScores: { 1: { percent: 100 }, 2: { percent: 100 }, 3: { percent: 80 } },
    evidence: { 'week-1': { command: 'pwd' }, 'week-2': { command: 'grep' }, 'week-3': { command: 'http' } },
    submissions: {
      'week-1': { status: 'draft', updatedAt: '2026-07-10T10:00:00.000Z' },
      'week-2': { status: 'recorded', completedAt: '2026-07-11T10:00:00.000Z' },
      'week-3': true,
    },
    conceptEvidence: { 'w3-http': { quizResults: [{ weekIndex: 3 }], latestQuizResult: { weekIndex: 3 } } },
  }, { migrationSource: 'legacy-v2' })

  assert.equal(progress.learningPlanVersion, 1)
  assert.deepEqual(progress.quizScores[1].migratedFromWeeks, [1, 2])
  assert.equal(progress.quizScores[2].percent, 80)
  assert.deepEqual(progress.evidence['week-1'].mergedLinuxToolRecord, { command: 'grep' })
  assert.deepEqual(progress.evidence['week-2'], { command: 'http' })
  assert.deepEqual(progress.submissions['week-1'], {
    status: 'draft',
    updatedAt: '2026-07-10T10:00:00.000Z',
    mergedLinuxToolRecord: { status: 'recorded', completedAt: '2026-07-11T10:00:00.000Z' },
  })
  assert.equal(progress.submissions['week-2'], true)
  assert.deepEqual(progress.learningPlanMigration.linuxWeekMerge.weeklySubmissions, {
    week1: { status: 'draft', updatedAt: '2026-07-10T10:00:00.000Z' },
    week2: { status: 'recorded', completedAt: '2026-07-11T10:00:00.000Z' },
  })
  assert.equal(progress.conceptEvidence['w3-http'].latestQuizResult.weekIndex, 2)
  assert.deepEqual(progress.learningPlanMigration.storageSource, { source: 'legacy-v2', schemaVersion: 2 })
})

test('current progress never remaps week keys without an explicit legacy source', () => {
  const progress = mergeProgress({
    quizScores: { 3: { percent: 80 } },
    evidence: { 'week-3': { command: 'http' } },
    submissions: { 'week-3': { status: 'recorded' } },
    conceptEvidence: { 'w3-http': { latestQuizResult: { weekIndex: 3 } } },
    futureData: { retained: true },
    quizSeeds: { 3: 'stable-week-3-seed' },
  })

  assert.equal(progress.learningPlanVersion, 1)
  assert.equal(progress.quizScores[3].percent, 80)
  assert.equal(progress.quizScores[2], undefined)
  assert.deepEqual(progress.evidence['week-3'], { command: 'http' })
  assert.equal(progress.evidence['week-2'], undefined)
  assert.deepEqual(progress.submissions['week-3'], { status: 'recorded' })
  assert.equal(progress.conceptEvidence['w3-http'].latestQuizResult.weekIndex, 3)
  assert.deepEqual(progress.futureData, { retained: true })
  assert.equal(progress.quizSeeds[3], 'stable-week-3-seed')
})

test('retired Week 1 Linux modules and labs remain preserved while overlapping concepts map to the consolidated reader', () => {
  const progress = mergeProgress({
    learningPlanVersion: 1,
    modulesRead: { 'w2-permissions': true, 'w2-text': true },
    moduleNotes: { 'w2-permissions': { text: '640은 그룹 읽기' } },
    moduleChecks: { 'w2-binary': { answer: 'Base64는 인코딩' } },
    conceptEvidence: { 'w2-text': { selfExplanation: { text: 'find 뒤 grep' } } },
    labs: { 'w1-path': { status: 'completed' }, 'w2-bandit': { status: 'attempted' } },
    activityRecords: { 'w1-path': { procedure: 'pwd' } },
  }, { migrationSource: 'legacy-v2' })

  assert.equal(progress.modulesRead['w1-permission'], true)
  assert.equal(progress.modulesRead['w1-navigation'], true)
  assert.deepEqual(progress.moduleNotes['w1-permission'], { text: '640은 그룹 읽기' })
  assert.deepEqual(progress.moduleChecks['w1-navigation'], { answer: 'Base64는 인코딩' })
  assert.equal(progress.conceptEvidence['w1-navigation'].selfExplanation.text, 'find 뒤 grep')
  assert.equal(progress.labs['w1-path'].status, 'completed')
  assert.equal(progress.learningPlanMigration.weekOneContentConsolidation.retiredLabs['w2-bandit'].lab.status, 'attempted')
  assert.equal(progress.learningPlanMigration.weekOneContentConsolidation.retiredModules['w2-permissions'].read, true)
})
