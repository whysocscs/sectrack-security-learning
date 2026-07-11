export const STORAGE_KEY = 'sectrack-orchestrator-v2'

export const initialProgress = {
  modulesRead: {},
  labs: {},
  submissions: {},
  quizScores: {},
  mastery: {},
  mindmap: { statuses: {}, notes: {}, customNodes: [], interests: [] },
  roeAnswers: {},
  baseline: {},
  evidence: {},
  reports: {},
}

export function mergeProgress(value) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    ...initialProgress,
    ...source,
    modulesRead: { ...initialProgress.modulesRead, ...(source.modulesRead || {}) },
    labs: { ...initialProgress.labs, ...(source.labs || {}) },
    submissions: { ...initialProgress.submissions, ...(source.submissions || {}) },
    quizScores: { ...initialProgress.quizScores, ...(source.quizScores || {}) },
    mastery: { ...initialProgress.mastery, ...(source.mastery || {}) },
    mindmap: {
      ...initialProgress.mindmap,
      ...(source.mindmap || {}),
      statuses: { ...initialProgress.mindmap.statuses, ...(source.mindmap?.statuses || {}) },
      notes: { ...initialProgress.mindmap.notes, ...(source.mindmap?.notes || {}) },
      customNodes: Array.isArray(source.mindmap?.customNodes) ? source.mindmap.customNodes : [],
      interests: Array.isArray(source.mindmap?.interests) ? source.mindmap.interests : [],
    },
    roeAnswers: { ...initialProgress.roeAnswers, ...(source.roeAnswers || {}) },
    baseline: { ...initialProgress.baseline, ...(source.baseline || {}) },
    evidence: { ...initialProgress.evidence, ...(source.evidence || {}) },
    reports: { ...initialProgress.reports, ...(source.reports || {}) },
  }
}

export function serializeProgress(progress) {
  return JSON.stringify(mergeProgress(progress), null, 2)
}

export function parseProgress(raw) {
  if (!raw) return mergeProgress()
  try {
    return mergeProgress(typeof raw === 'string' ? JSON.parse(raw) : raw)
  } catch {
    return mergeProgress()
  }
}

export function calculateWeekProgress(week, progress) {
  if (!week) return 0
  const moduleCount = week.modules?.length || 0
  const labCount = week.labs?.length || 0
  const quizCount = 1
  const submissionCount = 1
  const total = moduleCount + labCount * 2 + quizCount + submissionCount
  if (!total) return 0
  const modules = (week.modules || []).filter((item) => progress.modulesRead[item.id]).length
  const labs = (week.labs || []).reduce((sum, item) => sum + (progress.labs[item.id]?.status === 'completed' ? 2 : progress.labs[item.id] ? 1 : 0), 0)
  const quiz = (progress.quizScores[week.index]?.percent || 0) >= 80 ? 1 : 0
  const submitted = progress.submissions[`week-${week.index}`] ? 1 : 0
  return Math.round(((modules + labs + quiz + submitted) / total) * 100)
}

export function getNextTask(weeks, progress) {
  for (const week of weeks) {
    for (const module of week.modules || []) {
      if (!progress.modulesRead[module.id]) return { type: 'module', week: week.index, id: module.id, title: module.title, label: '개념 읽기' }
    }
    for (const lab of week.labs || []) {
      if (progress.labs[lab.id]?.status !== 'completed') return { type: 'lab', week: week.index, id: lab.id, title: lab.title, label: '실습' }
    }
    if ((progress.quizScores[week.index]?.percent || 0) < 80) return { type: 'quiz', week: week.index, id: `quiz-${week.index}`, title: `${week.index}주차 이해 확인`, label: '퀴즈' }
    if (!progress.submissions[`week-${week.index}`]) return { type: 'submission', week: week.index, id: `submit-${week.index}`, title: `${week.index}주차 증거 제출`, label: '제출' }
  }
  return { type: 'review', week: 4, id: 'review-week-4', title: 'Week 4 XSS 복습', label: '복습' }
}

const sensitivePatterns = [
  { id: 'cookie', label: 'Cookie 헤더', regex: /(?:^|\n)Cookie\s*:\s*(?![^\n]*(?:\[REDACTED\]|<redacted>|\*{3}))[^^\n]+/i },
  { id: 'set-cookie', label: 'Set-Cookie 헤더', regex: /(?:^|\n)Set-Cookie\s*:\s*(?![^\n]*(?:\[REDACTED\]|<redacted>|\*{3}))[^^\n]+/i },
  { id: 'authorization', label: 'Authorization 헤더', regex: /(?:^|\n)Authorization\s*:\s*(?![^\n]*(?:\[REDACTED\]|<redacted>|\*{3}))[^^\n]+/i },
  { id: 'api-key', label: 'API Key', regex: /(?:api[_-]?key|x-api-key)\s*[:=]\s*(?!\[REDACTED\]|<redacted>|\*{3})[^\s,;]+/i },
  { id: 'jwt', label: 'JWT 형태 토큰', regex: /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/ },
]

export function findSensitiveData(text = '') {
  return sensitivePatterns.filter((pattern) => pattern.regex.test(String(text))).map(({ id, label }) => ({ id, label }))
}

export function redactSensitive(text = '') {
  return String(text)
    .replace(/(^|\n)(Cookie\s*:)\s*[^\n]+/gi, '$1$2 [REDACTED]')
    .replace(/(^|\n)(Set-Cookie\s*:)\s*[^\n]+/gi, '$1$2 [REDACTED]')
    .replace(/(^|\n)(Authorization\s*:)\s*[^\n]+/gi, '$1$2 [REDACTED]')
    .replace(/((?:api[_-]?key|x-api-key)\s*[:=]\s*)[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[REDACTED_JWT]')
}

function hasNumberedSteps(text = '') {
  const lines = String(text).split('\n').filter((line) => line.trim())
  return lines.length >= 3 && lines.every((line, index) => new RegExp(`^${index + 1}[.)]\\s`).test(line.trim()))
}

export function validateReport(report = {}) {
  const combinedEvidence = [report.request, report.response, report.vulnerableCode, report.fixedCode].filter(Boolean).join('\n')
  const warnings = findSensitiveData(combinedEvidence)
  return [
    { id: 'title', label: '제목에서 위치·유형·핵심 영향을 알 수 있다', pass: String(report.title || '').length >= 25 && /XSS/i.test(report.title || '') },
    { id: 'endpoint', label: 'Endpoint와 입력 Parameter가 명시됐다', pass: Boolean(report.endpoint && (report.parameter || report.source)) },
    { id: 'flow', label: 'Source·Transform·Sink·Context가 모두 있다', pass: Boolean(report.source && report.transforms && report.sink && report.context) },
    { id: 'steps', label: '재현 단계가 번호 순서이며 3단계 이상이다', pass: hasNumberedSteps(report.reproductionSteps) },
    { id: 'observation', label: '관찰 결과와 기대 결과를 구분했다', pass: Boolean(report.observedResult && report.expectedResult) },
    { id: 'impact', label: '기술 영향과 비즈니스 영향을 구분했다', pass: Boolean(report.technicalImpact && report.businessImpact) },
    { id: 'root-cause', label: '근본 원인이 입력·출력 위치와 빠진 통제를 설명한다', pass: String(report.rootCause || '').length >= 35 && /(출력|인코딩|escaping|sink|컨텍스트|검증|innerHTML|템플릿)/i.test(report.rootCause || '') },
    { id: 'fix', label: '개선안과 수정 코드 또는 구체적 변경이 있다', pass: Boolean(String(report.remediation || '').length >= 30 && (report.fixedCode || /(textContent|인코딩|escaping|Sanitizer|DOMPurify|매개변수)/i.test(report.remediation || ''))) },
    { id: 'evidence', label: '요청·응답 또는 코드 증거가 있다', pass: Boolean(report.request || report.response || report.vulnerableCode) },
    { id: 'redaction', label: 'Cookie·Authorization·Token이 마스킹됐다', pass: warnings.length === 0, detail: warnings.map((item) => item.label).join(', ') },
    { id: 'retest', label: '수정 후 재시험 절차가 있다', pass: String(report.retestProcedure || '').length >= 30 },
    { id: 'severity', label: '심각도에 가능성 또는 영향 근거가 있다', pass: Boolean(report.severity && String(report.likelihoodRationale || '').length >= 25) },
  ]
}

export function reportQualityScore(report) {
  const checks = validateReport(report)
  const passed = checks.filter((item) => item.pass).length
  return Math.round((passed / checks.length) * 100)
}

export function reportToMarkdown(report = {}) {
  return `# ${report.findingId || 'Finding'} · ${report.title || '제목 미작성'}

- 상태: ${report.status || 'draft'}
- 심각도: ${report.severity || '미평가'}
- 자산: ${report.asset || '-'}
- Endpoint: \`${report.method || ''} ${report.endpoint || ''}\`
- 입력: ${report.parameter || report.source || '-'}
- 인증 전제: ${report.authPrerequisites || '-'}

## 요약

${report.summary || '-'}

## 데이터 흐름

- Source: ${report.source || '-'}
- Transform: ${report.transforms || '-'}
- Sink: ${report.sink || '-'}
- Context: ${report.context || '-'}

## 재현 단계

${report.reproductionSteps || '-'}

## HTTP Request

\`\`\`http
${redactSensitive(report.request || '')}
\`\`\`

## HTTP Response

\`\`\`http
${redactSensitive(report.response || '')}
\`\`\`

## 관찰 결과

${report.observedResult || '-'}

## 기대 결과

${report.expectedResult || '-'}

## 영향

### 기술적 영향
${report.technicalImpact || '-'}

### 비즈니스 영향
${report.businessImpact || '-'}

### 가능성·범위
${report.likelihoodRationale || '-'}

${report.impactScope || '-'}

## 근본 원인

${report.rootCause || '-'}

## 개선 권고

${report.remediation || '-'}

### 취약 코드
\`\`\`
${report.vulnerableCode || '-'}
\`\`\`

### 수정 코드
\`\`\`
${report.fixedCode || '-'}
\`\`\`

## 재시험

${report.retestProcedure || '-'}

결과: ${report.retestResult || '미수행'}

## 참고 자료

${report.references || '-'}
`
}

export function buildXssTrace(kind, mode = 'marker') {
  const traces = {
    'xss-reflected': {
      source: 'GET /search?q=UNIQUE_MARKER', transport: 'Query parameter q', transform: 'Controller → server template', sink: 'unescaped template output', context: 'HTML body', execution: mode === 'poc' ? '현재 검색 결과를 연 학습자 브라우저에서 고정 문자열 표시' : '마커 반사만 확인 · 실행 미확인',
    },
    'xss-stored': {
      source: 'POST /board · title/body', transport: 'Request body → training store', transform: '저장 → 목록 재조회 → template', sink: 'unescaped board item', context: 'HTML body', execution: mode === 'poc' ? '게시글 목록을 연 다른 역할의 브라우저에서 고정 문자열 표시' : '저장·재조회 확인 · 실행 미확인',
    },
    'xss-dom': {
      source: 'location.hash', transport: '브라우저 내부 fragment', transform: 'decodeURIComponent → render()', sink: 'result.innerHTML', context: 'HTML body DOM', execution: mode === 'poc' ? '페이지를 연 브라우저에서 DOM 변경 시 고정 문자열 표시' : 'Source에서 Sink 도달 확인 · 실행 미확인',
    },
    'xss-filtering': {
      source: '게시글 입력', transport: '클라이언트 또는 서버 필터', transform: '특정 문자열 제거', sink: 'unescaped HTML output', context: 'HTML body / attribute 가능', execution: mode === 'poc' ? '고정된 교육 예시로 필터 구조 실패 표시' : '필터 전·후 문자열 차이만 확인',
    },
  }
  return traces[kind] || traces['xss-reflected']
}

export function parseHash(hash = '') {
  const clean = String(hash).replace(/^#\/?/, '').replace(/\/$/, '')
  if (!clean) return { page: 'home' }
  const parts = clean.split('/')
  if (parts[0] === 'learn' && parts[1] === 'week' && /^\d+$/.test(parts[2] || '')) return { page: 'week', week: Number(parts[2]) }
  if (parts[0] === 'labs' && parts[1]) return { page: 'lab', labId: parts.slice(1).join('/') }
  if (parts[0] === 'reports' && parts[1] === 'new') return { page: 'report-editor', reportId: 'local-xss-draft' }
  if (parts[0] === 'reports' && parts[1]) return { page: 'report-editor', reportId: parts[1] }
  const known = ['home', 'learn', 'mindmap', 'labs', 'reports', 'resources', 'progress', 'admin']
  return { page: known.includes(parts[0]) ? parts[0] : 'home' }
}

export function routeToHash(route) {
  if (route.page === 'home') return '#/'
  if (route.page === 'week') return `#/learn/week/${route.week}`
  if (route.page === 'lab') return `#/labs/${route.labId}`
  if (route.page === 'report-editor') return route.reportId === 'local-xss-draft' ? '#/reports/new' : `#/reports/${route.reportId}`
  return `#/${route.page}`
}
