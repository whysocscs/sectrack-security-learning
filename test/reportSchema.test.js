import test from 'node:test'
import assert from 'node:assert/strict'
import { completedExampleReport, emptyReport } from '../src/reportData.js'
import {
  createDraftFromSample,
  redactFinding,
  reportToMarkdown,
  validateCommonFinding,
  validateCvssVector,
  validateFinding,
  validateXssFinding,
} from '../src/reportSchema.js'

test('common and XSS validators are separate and the completed example passes both', () => {
  assert.equal(validateCommonFinding(completedExampleReport).every((check) => check.pass), true)
  assert.equal(validateXssFinding(completedExampleReport).every((check) => check.pass), true)
  assert.equal(validateFinding(completedExampleReport).every((check) => check.pass), true)

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
})
