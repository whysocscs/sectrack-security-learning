import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  completedExampleReport,
  emptyReport,
  normalizeReportFindingId,
  reportWorkspace,
} from '../src/reportData.js'
import {
  createDraftFromSample,
  findingStatuses,
  getFindingStatusLabel,
  normalizeFindingStatus,
  redactFinding,
  reportStructureScore,
  reportToMarkdown,
  transitionFindingStatus,
  validateCommonFinding,
  validateCvssVector,
  validateFinding,
  validateXssFinding,
} from '../src/reportSchema.js'

test('common and XSS validators are separate and the completed example passes both', () => {
  assert.equal(validateCommonFinding(completedExampleReport).every((check) => check.pass), true)
  assert.equal(validateXssFinding(completedExampleReport).every((check) => check.pass), true)
  assert.equal(validateFinding(completedExampleReport).every((check) => check.pass), true)
  assert.equal(reportStructureScore(completedExampleReport), 100)
  assert.equal(completedExampleReport.status, 'review-approved')
  assert.ok(completedExampleReport.reviewedBy)
  assert.match(completedExampleReport.reviewedAt, /^\d{4}-\d{2}-\d{2}T/)

  const nonXss = { ...completedExampleReport, profile: 'sqli', vulnerabilityType: 'SQL Injection', title: '검색 API의 id 입력이 SQL 구조를 변경해 데이터 조회 범위가 확대됨' }
  assert.equal(validateCommonFinding(nonXss).find((check) => check.id === 'title').pass, true)
  assert.equal(validateFinding(nonXss).at(-1).id, 'profile-unavailable')
  assert.equal(validateFinding(nonXss).at(-1).pass, false)
})

test('CVSS vector validation supports declared 3.1 and 4.0 base metrics', () => {
  assert.equal(validateCvssVector('3.1', 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N').valid, true)
  assert.equal(validateCvssVector('4.0', 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N').valid, true)
  assert.equal(validateCvssVector('4.0', 'CVSS:4.0/AV:N').valid, false)
})

test('sample copy keeps structure but blanks learner-specific answers', () => {
  const draft = createDraftFromSample(completedExampleReport, emptyReport)
  for (const field of ['title', 'asset', 'endpoint', 'reproductionSteps', 'request', 'response', 'poc', 'observedResult', 'technicalImpact', 'businessImpact', 'rootCause', 'remediation', 'fixedCode', 'retestResult']) {
    assert.equal(draft[field], '', field)
  }
  assert.equal(draft.profile, 'xss')
  assert.equal(draft.cwe, 'CWE-79')
  assert.equal(draft.status, 'draft')
  assert.equal(draft.findingId, 'W03-XSS-002')
  assert.equal(draft.reviewedBy, '')
  assert.equal(draft.reviewedAt, '')
})

test('automatic checks can reach structure-ready but only a human review can approve', () => {
  assert.deepEqual(findingStatuses, [
    ['draft', '초안'],
    ['structure-ready', '구조 점검 통과'],
    ['review-approved', '사람 검토 승인'],
  ])
  assert.equal(normalizeFindingStatus('completed'), 'structure-ready')
  assert.equal(normalizeFindingStatus('reviewed'), 'review-approved')
  assert.equal(getFindingStatusLabel('completed'), '구조 점검 통과')

  const draft = { ...completedExampleReport, status: 'draft', reviewedBy: '', reviewedAt: '' }
  const structured = transitionFindingStatus(draft, 'structure-ready', { actor: 'automatic' })
  assert.equal(structured.ok, true)
  assert.equal(structured.report.status, 'structure-ready')
  assert.equal(structured.report.reviewedBy, '')

  const automaticApproval = transitionFindingStatus(structured.report, 'review-approved', {
    actor: 'automatic',
    reviewedBy: '자동 점검',
    reviewedAt: '2026-07-15T00:00:00.000Z',
  })
  assert.equal(automaticApproval.ok, false)
  assert.equal(automaticApproval.report.status, 'structure-ready')

  const humanApproval = transitionFindingStatus(structured.report, 'review-approved', {
    actor: 'human-reviewer',
    reviewedBy: '담당 교수자',
    reviewedAt: '2026-07-15T00:00:00.000Z',
  })
  assert.equal(humanApproval.ok, true)
  assert.equal(humanApproval.report.status, 'review-approved')
  assert.equal(humanApproval.report.reviewedBy, '담당 교수자')
  assert.equal(validateFinding(humanApproval.report).every((check) => check.pass), true)

  const forgedApproval = validateFinding({ ...structured.report, status: 'review-approved' })
  assert.equal(forgedApproval.find((check) => check.id === 'status').pass, false)
})

test('whitespace and repetitive low-information fields cannot become structure-ready', () => {
  const lowInformation = {
    ...completedExampleReport,
    status: 'draft',
    reviewedBy: '',
    reviewedAt: '',
    title: '가'.repeat(40),
    asset: '\u00a0\u200b\u200c',
    rootCause: '원인'.repeat(40),
    remediation: '수정'.repeat(40),
    fixedCode: 'x'.repeat(20),
    retestProcedure: '재시험'.repeat(30),
    likelihoodRationale: '근거'.repeat(30),
    source: '값'.repeat(20),
    transforms: '변환'.repeat(20),
    sink: '출력'.repeat(20),
    context: '문맥'.repeat(20),
  }
  const checks = validateFinding(lowInformation)
  const transition = transitionFindingStatus(lowInformation, 'structure-ready', { actor: 'automatic' })

  assert.equal(checks.find((check) => check.id === 'title').pass, false)
  assert.equal(checks.find((check) => check.id === 'target').pass, false)
  assert.equal(checks.find((check) => check.id === 'root-cause').pass, false)
  assert.equal(checks.find((check) => check.id === 'xss-flow').pass, false)
  assert.equal(transition.ok, false)
  assert.equal(transition.report.status, 'draft')

  const copiedNarrative = '합성 화면에서 확인한 하나의 문장을 모든 보고서 항목에 그대로 복사했습니다.'
  const duplicated = { ...completedExampleReport, status: 'draft', reviewedBy: '', reviewedAt: '', rootCause: copiedNarrative, remediation: copiedNarrative, retestProcedure: copiedNarrative }
  assert.equal(validateFinding(duplicated).find((check) => check.id === 'distinct-evidence').pass, false)
  assert.equal(transitionFindingStatus(duplicated, 'structure-ready', { actor: 'automatic' }).ok, false)
})

test('Week 03 report data and UI labels share one source of truth without a nested main', () => {
  const reportsSource = readFileSync(new URL('../src/components/Reports.jsx', import.meta.url), 'utf8')

  assert.equal(reportWorkspace.weekLabel, 'WEEK 03')
  assert.equal(emptyReport.findingId, 'W03-XSS-001')
  assert.equal(completedExampleReport.findingId, 'W03-XSS-001')
  assert.equal(normalizeReportFindingId('W4-XSS-007'), 'W03-XSS-007')
  assert.doesNotMatch(reportsSource, /WEEK 04|W4-XSS|품질 점검|품질 체크리스트|AUTO CHECK/)
  assert.doesNotMatch(reportsSource, /<main className="report-form"/)
  assert.match(reportsSource, /<section className="report-form" aria-labelledby="report-form-title"/)
  assert.match(reportsSource, /reportWorkspace\.weekLabel/)
})

test('redaction and Markdown export cover every report string field', () => {
  const unsafe = {
    ...completedExampleReport,
    summary: 'Authorization: Bearer real-secret',
    rootCause: 'Cookie: session=real-secret',
    nested: { note: 'x-api-key=secret-value' },
  }
  const redacted = redactFinding(unsafe)
  assert.match(redacted.summary, /Authorization: \[REDACTED\]/)
  assert.match(redacted.rootCause, /Cookie: \[REDACTED\]/)
  assert.match(redacted.nested.note, /x-api-key=\[REDACTED\]/)
  const markdown = reportToMarkdown(unsafe)
  assert.doesNotMatch(markdown, /real-secret|secret-value/)
  assert.match(markdown, /상태: 사람 검토 승인/)
  assert.match(markdown, /SecTrack 교육 콘텐츠 검토자/)
})
