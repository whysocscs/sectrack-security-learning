import { calculateProgressBreakdown } from './learningModel.js'
import {
  findSensitiveData,
  redactSensitive,
  reportQualityScore,
  reportToMarkdown,
  validateFinding,
} from './reportSchema.js'

export { findSensitiveData, redactSensitive, reportQualityScore, reportToMarkdown }

export const STORAGE_KEY = 'sectrack-orchestrator-v2'

export const initialProgress = {
  modulesRead: {},
  moduleNotes: {},
  moduleChecks: {},
  labs: {},
  activityRecords: {},
  submissions: {},
  quizScores: {},
  quizAttempts: {},
  conceptEvidence: {},
  hintUsage: {},
  mastery: {},
  conceptMastery: {},
  masteryEvidence: {},
  confidence: {},
  reviewStates: {},
  mindmap: {
    statuses: {},
    notes: {},
    customNodes: [],
    interests: [],
    roleInterests: [],
    conceptMastery: {},
    confidence: {},
    reviewIntent: {},
    view: {
      mode: 'roles',
      selectedNodeId: null,
      rootMode: 'expanded',
      expandedGroups: {},
      zoom: 100,
      inspectorWidth: 360,
    },
  },
  roeAnswers: {},
  baseline: {},
  evidence: {},
  reports: {},
  settings: {
    fontScale: '100',
    sidebarMode: 'expanded',
    displayName: '',
  },
  lastActivityAt: null,
}

export function mergeProgress(value) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    ...initialProgress,
    ...source,
    modulesRead: { ...initialProgress.modulesRead, ...(source.modulesRead || {}) },
    moduleNotes: { ...initialProgress.moduleNotes, ...(source.moduleNotes || {}) },
    moduleChecks: { ...initialProgress.moduleChecks, ...(source.moduleChecks || {}) },
    labs: { ...initialProgress.labs, ...(source.labs || {}) },
    activityRecords: { ...initialProgress.activityRecords, ...(source.activityRecords || {}) },
    submissions: { ...initialProgress.submissions, ...(source.submissions || {}) },
    quizScores: { ...initialProgress.quizScores, ...(source.quizScores || {}) },
    quizAttempts: { ...initialProgress.quizAttempts, ...(source.quizAttempts || {}) },
    conceptEvidence: { ...initialProgress.conceptEvidence, ...(source.conceptEvidence || {}) },
    hintUsage: { ...initialProgress.hintUsage, ...(source.hintUsage || {}) },
    mastery: { ...initialProgress.mastery, ...(source.mastery || {}) },
    conceptMastery: { ...initialProgress.conceptMastery, ...(source.conceptMastery || {}) },
    masteryEvidence: { ...initialProgress.masteryEvidence, ...(source.masteryEvidence || {}) },
    confidence: { ...initialProgress.confidence, ...(source.confidence || {}) },
    reviewStates: { ...initialProgress.reviewStates, ...(source.reviewStates || {}) },
    mindmap: {
      ...initialProgress.mindmap,
      ...(source.mindmap || {}),
      statuses: { ...initialProgress.mindmap.statuses, ...(source.mindmap?.statuses || {}) },
      notes: { ...initialProgress.mindmap.notes, ...(source.mindmap?.notes || {}) },
      customNodes: Array.isArray(source.mindmap?.customNodes) ? source.mindmap.customNodes : [],
      interests: Array.isArray(source.mindmap?.interests) ? source.mindmap.interests : [],
      roleInterests: Array.isArray(source.mindmap?.roleInterests) ? source.mindmap.roleInterests : [],
      conceptMastery: { ...initialProgress.mindmap.conceptMastery, ...(source.mindmap?.conceptMastery || {}) },
      confidence: { ...initialProgress.mindmap.confidence, ...(source.mindmap?.confidence || {}) },
      reviewIntent: { ...initialProgress.mindmap.reviewIntent, ...(source.mindmap?.reviewIntent || {}) },
      view: {
        ...initialProgress.mindmap.view,
        ...(source.mindmap?.view || {}),
        expandedGroups: { ...initialProgress.mindmap.view.expandedGroups, ...(source.mindmap?.view?.expandedGroups || {}) },
      },
    },
    roeAnswers: { ...initialProgress.roeAnswers, ...(source.roeAnswers || {}) },
    baseline: { ...initialProgress.baseline, ...(source.baseline || {}) },
    evidence: { ...initialProgress.evidence, ...(source.evidence || {}) },
    reports: { ...initialProgress.reports, ...(source.reports || {}) },
    settings: { ...initialProgress.settings, ...(source.settings || {}) },
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
  return week ? calculateProgressBreakdown(week, progress).percent : 0
}

export function getNextTask(weeks, progress) {
  for (const week of weeks) {
    for (const module of (week.modules || []).filter((item) => item.path !== 'extension')) {
      if (!progress.modulesRead[module.id]) return { type: 'module', week: week.index, id: module.id, title: module.title, label: '개념 읽기', estimatedMinutes: module.duration, route: { page: 'week', week: week.index, tab: 'concepts', moduleId: module.id } }
    }
    for (const lab of (week.labs || []).filter((item) => item.path !== 'extension')) {
      if (progress.labs[lab.id]?.status !== 'completed') return { type: 'lab', week: week.index, id: lab.id, title: lab.title, label: lab.kind === 'external' ? '공식 외부 활동' : '실습', estimatedMinutes: lab.estimatedMinutes, route: { page: 'lab', labId: lab.id } }
    }
    const latestQuiz = progress.quizAttempts?.[week.index]?.at(-1) || progress.quizScores[week.index]
    const quizPassed = latestQuiz?.passed ?? (latestQuiz?.percent || 0) >= 80
    if (!quizPassed) return { type: 'quiz', week: week.index, id: `quiz-${week.index}`, title: `${week.index}주차 이해 확인`, label: '이해 확인', estimatedMinutes: week.quizMinutes || 15, route: { page: 'week', week: week.index, tab: 'quiz' } }
    if (!progress.submissions[`week-${week.index}`]) return { type: 'record', week: week.index, id: `record-${week.index}`, title: `${week.index}주차 학습 정리`, label: '주차 정리', estimatedMinutes: week.recordMinutes || 25, route: { page: 'week', week: week.index, tab: 'record' } }
  }
  return { type: 'review', week: 4, id: 'review-week-4', title: 'Week 4 XSS 복습', label: '복습', estimatedMinutes: 20, route: { page: 'week', week: 4, tab: 'concepts' } }
}

export function validateReport(report = {}) {
  return validateFinding(report)
}

export function buildXssTrace(kind, mode = 'marker', contextMode = 'body') {
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
  const contextTraces = {
    attribute: {
      source: '프로필 표시값 UNIQUE_MARKER', transport: '응답 데이터 → DOM 속성 바인딩', transform: '문자열 결합 또는 안전한 DOM API', sink: 'HTML attribute 값', context: 'quoted HTML attribute', execution: mode === 'poc' ? '고정 예시에서 속성 경계 해석 차이만 표시' : mode === 'fixed' ? '안전한 속성 API로 텍스트 값 설정' : '마커의 속성 위치만 확인',
    },
    url: {
      source: '이동 URL 설정값', transport: '설정값 → 링크 생성', transform: 'URL 파싱과 scheme allowlist', sink: 'anchor href', context: 'URL attribute / scheme', execution: mode === 'poc' ? '고정된 차단 예시로 허용하지 않은 scheme 표시' : mode === 'fixed' ? 'https와 상대 경로만 허용' : 'URL 문자열과 scheme을 분리해 확인',
    },
    'js-data': {
      source: '서버가 전달한 표시 이름', transport: '응답 → 클라이언트 초기 데이터', transform: 'JSON 직렬화와 데이터 파싱', sink: 'JavaScript data value', context: 'script data / JavaScript string', execution: mode === 'poc' ? '코드 실행 없이 고정 데이터 경계 실패를 표시' : mode === 'fixed' ? 'application/json 데이터 블록을 파싱해 textContent로 출력' : '응답 원문에서 데이터 위치만 확인',
    },
    sanitizer: {
      source: '허용된 서식 입력', transport: '입력 → HTML 미리보기', transform: '고정 Sanitizer policy 전·후', sink: 'preview.innerHTML', context: 'sanitized HTML body', execution: mode === 'poc' ? '고정 입력의 제거·보존 항목만 비교' : mode === 'fixed' ? '정책을 통과한 고정 서식만 렌더링' : 'Sanitizer 전 입력 구조를 확인',
    },
    csp: {
      source: '고정 교육용 입력', transport: '응답 → HTML 파서', transform: '위험 Sink 유지 + CSP 실행 정책', sink: 'result.innerHTML', context: 'HTML body with CSP', execution: mode === 'poc' ? 'CSP가 고정 실행 표시를 차단하지만 위험 Sink는 남아 있음' : mode === 'fixed' ? 'textContent로 Sink를 제거해 CSP와 무관하게 실행되지 않음' : '마커 도달과 CSP 정책을 각각 확인',
    },
  }
  return contextMode === 'body' ? (traces[kind] || traces['xss-reflected']) : (contextTraces[contextMode] || traces[kind] || traces['xss-reflected'])
}

export function parseHash(hash = '') {
  const clean = String(hash).replace(/^#\/?/, '').replace(/\/$/, '')
  if (!clean) return { page: 'home' }
  const parts = clean.split('/')
  if (parts[0] === 'learn' && parts[1] === 'week' && /^\d+$/.test(parts[2] || '')) {
    if (!parts[3]) return { page: 'week', week: Number(parts[2]) }
    const tabs = ['overview', 'concepts', 'labs', 'quiz', 'record']
    if (!tabs.includes(parts[3]) || (parts[4] && parts[3] !== 'concepts') || parts.length > 5) return { page: 'not-found', path: clean }
    return { page: 'week', week: Number(parts[2]), tab: parts[3], ...(parts[4] ? { moduleId: decodeURIComponent(parts[4]) } : {}) }
  }
  if (parts[0] === 'learn' && parts[1] === 'week') return { page: 'not-found', path: clean }
  if (parts[0] === 'labs' && parts[1] === 'w0-map' && parts.length === 2) return { page: 'mindmap', compatibilityRoute: true }
  if (parts[0] === 'labs' && parts[1]) return { page: 'lab', labId: parts.slice(1).join('/') }
  if (parts[0] === 'reports' && parts[1] === 'new') return { page: 'report-editor', reportId: 'local-xss-draft' }
  if (parts[0] === 'reports' && parts[1]) return { page: 'report-editor', reportId: parts[1] }
  if (parts[0] === 'admin' && parts.length === 1) return { page: 'insights', legacyRoute: true }
  const known = ['home', 'learn', 'mindmap', 'labs', 'reports', 'resources', 'progress', 'insights']
  return known.includes(parts[0]) && parts.length === 1 ? { page: parts[0] } : { page: 'not-found', path: clean }
}

export function routeToHash(route) {
  if (route.page === 'home') return '#/'
  if (route.page === 'week') {
    const tab = route.tab || 'overview'
    const modulePath = tab === 'concepts' && route.moduleId ? `/${encodeURIComponent(route.moduleId)}` : ''
    return `#/learn/week/${route.week}/${tab}${modulePath}`
  }
  if (route.page === 'lab') return `#/labs/${route.labId}`
  if (route.page === 'report-editor') return route.reportId === 'local-xss-draft' ? '#/reports/new' : `#/reports/${route.reportId}`
  if (route.page === 'insights') return '#/insights'
  return `#/${route.page}`
}
