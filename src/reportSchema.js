export const findingStatuses = Object.freeze([
  ['draft', '초안'],
  ['completed', '작성 완료'],
  ['retest_required', '재시험 필요'],
  ['fixed', '수정 확인'],
  ['partially_fixed', '부분 수정'],
  ['archived', '보관'],
])

export const findingProfiles = Object.freeze({
  xss: { id: 'xss', label: 'Cross-Site Scripting (XSS)', implemented: true, cwe: 'CWE-79', mapping: 'WSTG-INPV-01' },
  sqli: { id: 'sqli', label: 'SQL Injection', implemented: false },
  binary: { id: 'binary', label: 'Binary 취약점', implemented: false },
  forensics: { id: 'forensics', label: 'Forensics 분석', implemented: false },
  cloud: { id: 'cloud', label: 'Cloud 구성 취약점', implemented: false },
})

export const commonFindingFields = Object.freeze([
  'findingId', 'title', 'status', 'severity', 'asset', 'environment', 'endpoint', 'method', 'parameter',
  'authPrerequisites', 'summary', 'prerequisites', 'reproductionSteps', 'request', 'response', 'poc',
  'observedResult', 'expectedResult', 'technicalImpact', 'businessImpact', 'likelihoodRationale', 'impactScope',
  'rootCause', 'remediation', 'temporaryMitigation', 'vulnerableCode', 'fixedCode', 'retestProcedure',
  'retestResult', 'references', 'cvssVersion', 'cvssVector', 'cvssScore', 'cwe', 'owaspMapping',
])

export const xssFindingFields = Object.freeze([
  'vulnerabilityType', 'source', 'transforms', 'sink', 'context', 'executionLocation', 'supportingControls',
])

const sensitivePatterns = [
  { id: 'cookie', label: 'Cookie 헤더', regex: /(?:^|\n)Cookie\s*:\s*(?![^\n]*(?:\[REDACTED\]|<redacted>|\*{3}))[^\n]+/i },
  { id: 'set-cookie', label: 'Set-Cookie 헤더', regex: /(?:^|\n)Set-Cookie\s*:\s*(?![^\n]*(?:\[REDACTED\]|<redacted>|\*{3}))[^\n]+/i },
  { id: 'authorization', label: 'Authorization 헤더', regex: /(?:^|\n)Authorization\s*:\s*(?![^\n]*(?:\[REDACTED\]|<redacted>|\*{3}))[^\n]+/i },
  { id: 'api-key', label: 'API Key', regex: /(?:api[_-]?key|x-api-key)\s*[:=]\s*(?!\[REDACTED\]|<redacted>|\*{3})[^\s,;]+/i },
  { id: 'jwt', label: 'JWT 형태 토큰', regex: /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/ },
  { id: 'private-key', label: '개인키', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i },
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
    .replace(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gi, '[REDACTED_PRIVATE_KEY]')
}

export function redactFinding(value) {
  if (typeof value === 'string') return redactSensitive(value)
  if (Array.isArray(value)) return value.map(redactFinding)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactFinding(item)]))
}

function hasNumberedSteps(text = '') {
  const lines = String(text).split('\n').filter((line) => line.trim())
  return lines.length >= 3 && lines.every((line, index) => new RegExp(`^${index + 1}[.)]\\s`).test(line.trim()))
}

function reportText(report) {
  return Object.values(report || {}).flatMap((value) => typeof value === 'string' ? [value] : []).join('\n')
}

export function validateCvssVector(version, vector) {
  if (!String(vector || '').trim()) return { valid: true, empty: true, reason: '' }
  const value = String(vector).trim()
  const definitions = {
    '4.0': {
      prefix: 'CVSS:4.0', required: ['AV', 'AC', 'AT', 'PR', 'UI', 'VC', 'VI', 'VA', 'SC', 'SI', 'SA'],
      allowed: { AV: 'NALP', AC: 'LH', AT: 'NP', PR: 'NLH', UI: 'NPA', VC: 'HLN', VI: 'HLN', VA: 'HLN', SC: 'HLN', SI: 'HLN', SA: 'HLN' },
    },
    '3.1': {
      prefix: 'CVSS:3.1', required: ['AV', 'AC', 'PR', 'UI', 'S', 'C', 'I', 'A'],
      allowed: { AV: 'NALP', AC: 'LH', PR: 'NLH', UI: 'NR', S: 'UC', C: 'HLN', I: 'HLN', A: 'HLN' },
    },
  }
  const definition = definitions[version]
  if (!definition) return { valid: false, empty: false, reason: '지원하는 CVSS Version은 4.0과 3.1입니다.' }
  const parts = value.split('/')
  if (parts.shift() !== definition.prefix) return { valid: false, empty: false, reason: `${definition.prefix}로 시작해야 합니다.` }
  const metrics = {}
  for (const part of parts) {
    const [metric, metricValue, ...rest] = part.split(':')
    if (!metric || !metricValue || rest.length || metrics[metric]) return { valid: false, empty: false, reason: '중복되거나 형식이 잘못된 metric이 있습니다.' }
    metrics[metric] = metricValue
  }
  for (const metric of definition.required) {
    if (!metrics[metric]) return { valid: false, empty: false, reason: `필수 metric ${metric}이 없습니다.` }
    if (!definition.allowed[metric].includes(metrics[metric])) return { valid: false, empty: false, reason: `${metric}:${metrics[metric]} 값이 유효하지 않습니다.` }
  }
  return { valid: true, empty: false, reason: '' }
}

export function validateCommonFinding(report = {}) {
  const warnings = findSensitiveData(reportText(report))
  const cvss = validateCvssVector(report.cvssVersion, report.cvssVector)
  const score = report.cvssScore === '' || report.cvssScore == null ? null : Number(report.cvssScore)
  const cvssScoreValid = score == null || (Number.isFinite(score) && score >= 0 && score <= 10)
  return [
    { id: 'title', group: 'common', label: '제목에서 위치·유형·핵심 영향을 알 수 있다', pass: String(report.title || '').length >= 20 && Boolean(report.vulnerabilityType) },
    { id: 'target', group: 'common', label: '자산·대상 위치·입력 경로가 명시됐다', pass: Boolean(report.asset && report.endpoint && (report.parameter || report.source)) },
    { id: 'steps', group: 'common', label: '재현 단계가 번호 순서이며 3단계 이상이다', pass: hasNumberedSteps(report.reproductionSteps) },
    { id: 'observation', group: 'common', label: '관찰 결과와 기대 결과를 구분했다', pass: Boolean(report.observedResult && report.expectedResult) },
    { id: 'impact', group: 'common', label: '기술 영향과 비즈니스 영향을 구분했다', pass: Boolean(report.technicalImpact && report.businessImpact) },
    { id: 'root-cause', group: 'common', label: '근본 원인이 신뢰 경계와 빠진 통제를 설명한다', pass: String(report.rootCause || '').length >= 35 },
    { id: 'fix', group: 'common', label: '근본 수정과 구체적인 변경 근거가 있다', pass: Boolean(String(report.remediation || '').length >= 30 && (report.fixedCode || report.temporaryMitigation)) },
    { id: 'materials', group: 'common', label: '요청·응답·코드 또는 분석 자료가 있다', pass: Boolean(report.request || report.response || report.vulnerableCode || report.poc) },
    { id: 'redaction', group: 'common', label: '자격 증명과 비밀정보가 마스킹됐다', pass: warnings.length === 0, detail: warnings.map((item) => item.label).join(', ') },
    { id: 'retest', group: 'common', label: '수정 후 같은 조건의 재시험 절차가 있다', pass: String(report.retestProcedure || '').length >= 30 },
    { id: 'severity', group: 'common', label: '심각도에 가능성 또는 영향 근거가 있다', pass: Boolean(report.severity && String(report.likelihoodRationale || '').length >= 25) },
    { id: 'classification', group: 'common', label: 'CWE와 테스트 표준 매핑이 있다', pass: /^CWE-\d+$/.test(report.cwe || '') && String(report.owaspMapping || '').trim().length >= 5 },
    { id: 'cvss', group: 'common', label: '입력한 CVSS Vector와 Score 형식이 유효하다', pass: cvss.valid && cvssScoreValid, detail: cvss.reason || (!cvssScoreValid ? 'CVSS Score는 0부터 10 사이여야 합니다.' : '') },
  ]
}

export function validateXssFinding(report = {}) {
  return [
    { id: 'xss-flow', group: 'xss', label: 'Source·Transform·Sink·Context가 모두 있다', pass: Boolean(report.source && report.transforms && report.sink && report.context) },
    { id: 'xss-execution', group: 'xss', label: '마커 반사와 실행 확인을 구분했다', pass: Boolean(report.executionLocation && /(실행|마커|DOM|브라우저)/.test(`${report.observedResult || ''} ${report.executionLocation || ''}`)) },
    { id: 'xss-defense', group: 'xss', label: '출력 컨텍스트에 맞는 근본 방어가 있다', pass: /(인코딩|escape|escaping|textContent|createTextNode|Sanitizer|직렬화|allowlist|안전한 Sink|auto-escape)/i.test(`${report.remediation || ''} ${report.fixedCode || ''}`) },
    { id: 'xss-supporting-control', group: 'xss', label: 'CSP·Cookie를 근본 수정과 구분했다', pass: Boolean(report.supportingControls) && /(보조|근본|실행 자체|대신하지)/.test(`${report.supportingControls} ${report.temporaryMitigation || ''}`) },
  ]
}

export function validateFinding(report = {}) {
  const profileId = report.profile || 'xss'
  const profile = findingProfiles[profileId]
  const common = validateCommonFinding(report)
  if (profile?.implemented && profileId === 'xss') return [...common, ...validateXssFinding(report)]
  return [...common, { id: 'profile-unavailable', group: profileId, label: `${profile?.label || profileId} 전용 검사는 아직 제공하지 않는다`, pass: false, detail: '공통 Finding 필드만 저장할 수 있습니다.' }]
}

export function reportQualityScore(report) {
  const checks = validateFinding(report)
  return Math.round((checks.filter((item) => item.pass).length / checks.length) * 100)
}

const copiedBlankFields = new Set([
  'title', 'asset', 'endpoint', 'parameter', 'authPrerequisites', 'summary', 'prerequisites', 'source', 'transforms',
  'sink', 'context', 'executionLocation', 'reproductionSteps', 'request', 'response', 'poc', 'observedResult',
  'expectedResult', 'technicalImpact', 'businessImpact', 'likelihoodRationale', 'impactScope', 'rootCause',
  'remediation', 'vulnerableCode', 'fixedCode', 'temporaryMitigation', 'supportingControls', 'retestProcedure',
  'retestResult', 'references', 'cvssVector', 'cvssScore',
])

export function createDraftFromSample(sample = {}, template = {}) {
  const next = { ...template }
  for (const key of new Set([...Object.keys(sample), ...Object.keys(template)])) {
    if (copiedBlankFields.has(key)) next[key] = ''
    else if (key in sample) next[key] = sample[key]
  }
  return { ...next, id: 'local-xss-draft', findingId: 'W4-XSS-002', status: 'draft', updatedAt: new Date().toISOString() }
}

export function reportToMarkdown(input = {}) {
  const report = redactFinding(input)
  return `# ${report.findingId || 'Finding'} · ${report.title || '제목 미작성'}

- 상태: ${report.status || 'draft'}
- 유형: ${report.vulnerabilityType || '-'}
- 심각도: ${report.severity || '미평가'}
- CVSS: ${report.cvssVersion || '-'} ${report.cvssVector || '-'} (${report.cvssScore || '점수 미입력'})
- CWE: ${report.cwe || '-'}
- 테스트 표준: ${report.owaspMapping || '-'}
- 자산: ${report.asset || '-'}
- 대상: \`${report.method || ''} ${report.endpoint || ''}\`
- 입력: ${report.parameter || report.source || '-'}
- 인증 전제: ${report.authPrerequisites || '-'}

## 요약

${report.summary || '-'}

## 데이터 흐름

- Source: ${report.source || '-'}
- Transform: ${report.transforms || '-'}
- Sink: ${report.sink || '-'}
- Context: ${report.context || '-'}
- 실행 위치: ${report.executionLocation || '-'}

## 재현 단계

${report.reproductionSteps || '-'}

## 요청·응답 또는 분석 자료

\`\`\`http
${report.request || '-'}
\`\`\`

\`\`\`http
${report.response || '-'}
\`\`\`

## 관찰 결과와 기대 결과

### 관찰 결과
${report.observedResult || '-'}

### 기대 결과
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

### 취약 코드·설정
\`\`\`
${report.vulnerableCode || '-'}
\`\`\`

### 수정 코드·설정
\`\`\`
${report.fixedCode || '-'}
\`\`\`

### 보조 통제
${report.supportingControls || '-'}

## 재시험

${report.retestProcedure || '-'}

결과: ${report.retestResult || '미수행'}

## 참고 자료

${report.references || '-'}
`
}
