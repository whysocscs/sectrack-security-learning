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
  learningPlanVersion: 1,
  weekOneContentVersion: 1,
  modulesRead: {},
  moduleNotes: {},
  moduleChecks: {},
  labs: {},
  activityRecords: {},
  submissions: {},
  quizScores: {},
  quizAttempts: {},
  quizSeeds: {},
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
  weekZero: {
    selectedDomainIds: [],
    viewedRoleIds: [],
    selectedRoleIds: [],
    selectedPortfolioIds: [],
    view: {
      evidenceSection: 'market',
      selectedFamilyId: null,
      selectedRoleId: null,
      selectedPostingId: null,
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

const LINUX_WEEK_MERGE_VERSION = 1
const WEEK_ONE_CONTENT_CONSOLIDATION_VERSION = 1

function remapWeekIndex(value) {
  const index = Number(value)
  if (!Number.isInteger(index) || index < 3 || index > 16) return value
  return index - 1
}

function remapWeekKey(key) {
  const match = /^week-(\d+)$/.exec(key)
  if (!match) return key
  const index = Number(match[1])
  return `week-${remapWeekIndex(index)}`
}

function remapNumericRecord(record = {}) {
  return Object.entries(record).reduce((next, [key, value]) => {
    if (Number(key) === 2) return next
    next[String(remapWeekIndex(key))] = value
    return next
  }, {})
}

function remapWeeklyRecord(record = {}) {
  return Object.entries(record).reduce((next, [key, value]) => {
    if (key === 'week-2') return next
    next[remapWeekKey(key)] = value
    return next
  }, {})
}

function mergeLinuxSubmission(weekOneSubmission, weekTwoSubmission) {
  if (weekOneSubmission === undefined) return weekTwoSubmission
  if (weekTwoSubmission === undefined) return weekOneSubmission
  if (weekOneSubmission && typeof weekOneSubmission === 'object') {
    return { ...weekOneSubmission, mergedLinuxToolRecord: weekTwoSubmission }
  }
  return {
    status: weekOneSubmission === true ? 'recorded' : 'migrated',
    legacyWeekOneSubmission: weekOneSubmission,
    mergedLinuxToolRecord: weekTwoSubmission,
  }
}

function latestQuizResult(attempts, scores, weekIndex) {
  const entries = attempts?.[weekIndex]
  return (Array.isArray(entries) ? entries.at(-1) : null) || scores?.[weekIndex] || null
}

function isPassedQuiz(result) {
  if (!result || typeof result !== 'object') return false
  if (typeof result.passed === 'boolean') return result.passed
  return Number(result.percent) >= 80
}

function remapConceptEvidence(conceptEvidence = {}) {
  return Object.fromEntries(Object.entries(conceptEvidence).map(([conceptId, evidence]) => {
    if (!evidence || typeof evidence !== 'object') return [conceptId, evidence]
    const remapResult = (result) => result && typeof result === 'object' && Object.hasOwn(result, 'weekIndex')
      ? { ...result, weekIndex: remapWeekIndex(result.weekIndex) }
      : result
    return [conceptId, {
      ...evidence,
      quizResults: Array.isArray(evidence.quizResults) ? evidence.quizResults.map(remapResult) : evidence.quizResults,
      latestQuizResult: remapResult(evidence.latestQuizResult),
    }]
  }))
}

function migrateMergedLinuxWeek(value, migrationSource) {
  const source = value && typeof value === 'object' ? value : {}
  if (source.learningPlanVersion === LINUX_WEEK_MERGE_VERSION) return source

  const oldWeekOneAttempts = source.quizAttempts?.[1]
  const oldWeekTwoAttempts = source.quizAttempts?.[2]
  const oldWeekOneScore = source.quizScores?.[1]
  const oldWeekTwoScore = source.quizScores?.[2]
  const oldWeekOneResult = latestQuizResult(source.quizAttempts, source.quizScores, 1)
  const oldWeekTwoResult = latestQuizResult(source.quizAttempts, source.quizScores, 2)
  const completedBothLinuxChecks = isPassedQuiz(oldWeekOneResult) && isPassedQuiz(oldWeekTwoResult)
  const remappedAttempts = remapNumericRecord(source.quizAttempts)
  const remappedScores = remapNumericRecord(source.quizScores)

  if (completedBothLinuxChecks) {
    const migratedAttempt = {
      score: 12,
      total: 12,
      percent: 100,
      passed: true,
      attemptNumber: 1,
      retryCount: 0,
      attemptedAt: oldWeekTwoResult?.attemptedAt || oldWeekOneResult?.attemptedAt || new Date(0).toISOString(),
      migratedFromWeeks: [1, 2],
      questionResults: [],
    }
    remappedAttempts['1'] = [migratedAttempt]
    remappedScores['1'] = migratedAttempt
  } else {
    delete remappedAttempts['1']
    delete remappedScores['1']
  }

  const remappedEvidence = remapWeeklyRecord(source.evidence)
  const remappedSubmissions = remapWeeklyRecord(source.submissions)
  const legacyWeekTwoEvidence = source.evidence?.['week-2']
  const legacyWeekOneEvidence = source.evidence?.['week-1']
  const legacyWeekOneSubmission = source.submissions?.['week-1']
  const legacyWeekTwoSubmission = source.submissions?.['week-2']
  if (legacyWeekOneEvidence || legacyWeekTwoEvidence) {
    remappedEvidence['week-1'] = {
      ...(legacyWeekOneEvidence || {}),
      ...(legacyWeekTwoEvidence ? { mergedLinuxToolRecord: legacyWeekTwoEvidence } : {}),
    }
  }
  if (legacyWeekOneSubmission !== undefined || legacyWeekTwoSubmission !== undefined) {
    remappedSubmissions['week-1'] = mergeLinuxSubmission(legacyWeekOneSubmission, legacyWeekTwoSubmission)
  }

  const legacyQuizAttempts = {}
  const legacyQuizScores = {}
  const legacyWeeklyRecords = {}
  const legacyWeeklySubmissions = {}
  if (oldWeekOneAttempts !== undefined) legacyQuizAttempts.week1 = oldWeekOneAttempts
  if (oldWeekTwoAttempts !== undefined) legacyQuizAttempts.week2 = oldWeekTwoAttempts
  if (oldWeekOneScore !== undefined) legacyQuizScores.week1 = oldWeekOneScore
  if (oldWeekTwoScore !== undefined) legacyQuizScores.week2 = oldWeekTwoScore
  if (legacyWeekOneEvidence !== undefined) legacyWeeklyRecords.week1 = legacyWeekOneEvidence
  if (legacyWeekTwoEvidence !== undefined) legacyWeeklyRecords.week2 = legacyWeekTwoEvidence
  if (legacyWeekOneSubmission !== undefined) legacyWeeklySubmissions.week1 = legacyWeekOneSubmission
  if (legacyWeekTwoSubmission !== undefined) legacyWeeklySubmissions.week2 = legacyWeekTwoSubmission
  const hasLegacyLinuxProgress = Object.keys(legacyQuizAttempts).length > 0
    || Object.keys(legacyQuizScores).length > 0
    || Object.keys(legacyWeeklyRecords).length > 0
    || Object.keys(legacyWeeklySubmissions).length > 0

  return {
    ...source,
    learningPlanVersion: LINUX_WEEK_MERGE_VERSION,
    quizAttempts: remappedAttempts,
    quizScores: remappedScores,
    submissions: remappedSubmissions,
    evidence: remappedEvidence,
    conceptEvidence: remapConceptEvidence(source.conceptEvidence),
    ...(hasLegacyLinuxProgress ? {
      learningPlanMigration: {
        ...(source.learningPlanMigration || {}),
        linuxWeekMerge: {
          version: LINUX_WEEK_MERGE_VERSION,
          sourceStorageVersion: 2,
          source: migrationSource,
          quizAttempts: legacyQuizAttempts,
          quizScores: legacyQuizScores,
          weeklyRecords: legacyWeeklyRecords,
          weeklySubmissions: legacyWeeklySubmissions,
        },
      },
    } : {}),
  }
}

function migrateConsolidatedWeekOne(value, migrationSource) {
  const source = value && typeof value === 'object' ? value : {}
  if (source.weekOneContentVersion === WEEK_ONE_CONTENT_CONSOLIDATION_VERSION) return source

  const moduleAliases = {
    'w2-permissions': 'w1-permission',
    'w2-text': 'w1-navigation',
    'w2-binary': 'w1-navigation',
  }
  const retiredModuleIds = ['w2-permissions', 'w2-text', 'w2-binary', 'w2-http-tools']
  const retiredLabIds = ['w1-path', 'w1-ssh-flow', 'w2-permission-lab', 'w2-log-lab', 'w2-http-lab', 'w2-bandit']
  const mapAliases = (record = {}) => {
    const next = { ...record }
    Object.entries(moduleAliases).forEach(([legacyId, activeId]) => {
      if (record[legacyId] !== undefined && next[activeId] === undefined) next[activeId] = record[legacyId]
    })
    return next
  }
  const retiredRecords = Object.fromEntries(retiredModuleIds.map((id) => {
    const record = {
      ...(source.modulesRead?.[id] !== undefined ? { read: source.modulesRead[id] } : {}),
      ...(source.moduleNotes?.[id] !== undefined ? { notes: source.moduleNotes[id] } : {}),
      ...(source.moduleChecks?.[id] !== undefined ? { checks: source.moduleChecks[id] } : {}),
      ...(source.mastery?.[id] !== undefined ? { mastery: source.mastery[id] } : {}),
      ...(source.conceptMastery?.[id] !== undefined ? { conceptMastery: source.conceptMastery[id] } : {}),
      ...(source.conceptEvidence?.[id] !== undefined ? { conceptEvidence: source.conceptEvidence[id] } : {}),
    }
    return Object.keys(record).length ? [id, record] : null
  }).filter(Boolean))
  const retiredLabs = Object.fromEntries(retiredLabIds.map((id) => {
    const record = {
      ...(source.labs?.[id] !== undefined ? { lab: source.labs[id] } : {}),
      ...(source.activityRecords?.[id] !== undefined ? { activityRecord: source.activityRecords[id] } : {}),
      ...(source.evidence?.[id] !== undefined ? { evidence: source.evidence[id] } : {}),
    }
    return Object.keys(record).length ? [id, record] : null
  }).filter(Boolean))

  return {
    ...source,
    weekOneContentVersion: WEEK_ONE_CONTENT_CONSOLIDATION_VERSION,
    modulesRead: mapAliases(source.modulesRead),
    moduleNotes: mapAliases(source.moduleNotes),
    moduleChecks: mapAliases(source.moduleChecks),
    mastery: mapAliases(source.mastery),
    conceptMastery: mapAliases(source.conceptMastery),
    conceptEvidence: mapAliases(source.conceptEvidence),
    ...(Object.keys(retiredRecords).length || Object.keys(retiredLabs).length ? {
      learningPlanMigration: {
        ...(source.learningPlanMigration || {}),
        weekOneContentConsolidation: {
          version: WEEK_ONE_CONTENT_CONSOLIDATION_VERSION,
          sourceStorageVersion: 2,
          source: migrationSource,
          retiredModules: retiredRecords,
          retiredLabs,
        },
      },
    } : {}),
  }
}

export function mergeProgress(value, options = {}) {
  const input = value && typeof value === 'object' ? value : {}
  const migratedLegacy = options.migrationSource === 'legacy-v2'
    ? migrateConsolidatedWeekOne(migrateMergedLinuxWeek(input, options.migrationSource), options.migrationSource)
    : null
  const source = migratedLegacy
    ? {
        ...migratedLegacy,
        learningPlanMigration: {
          ...(migratedLegacy.learningPlanMigration || {}),
          storageSource: { source: options.migrationSource, schemaVersion: 2 },
        },
      }
    : input
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
    quizSeeds: { ...initialProgress.quizSeeds, ...(source.quizSeeds || {}) },
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
    weekZero: {
      ...initialProgress.weekZero,
      ...(source.weekZero || {}),
      selectedDomainIds: Array.isArray(source.weekZero?.selectedDomainIds) ? source.weekZero.selectedDomainIds : [],
      viewedRoleIds: Array.isArray(source.weekZero?.viewedRoleIds) ? source.weekZero.viewedRoleIds : [],
      selectedRoleIds: Array.isArray(source.weekZero?.selectedRoleIds) ? source.weekZero.selectedRoleIds : [],
      selectedPortfolioIds: Array.isArray(source.weekZero?.selectedPortfolioIds) ? source.weekZero.selectedPortfolioIds : [],
      view: { ...initialProgress.weekZero.view, ...(source.weekZero?.view || {}) },
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
  const availableWeeks = Array.isArray(weeks) ? weeks.filter((week) => week && typeof week === 'object') : []
  const state = progress && typeof progress === 'object' ? progress : {}
  const activityRecorded = (activityId) => ['activity-recorded', 'completed'].includes(state.labs?.[activityId]?.status)
  const latestQuizAttempt = (weekIndex) => {
    const attempts = state.quizAttempts?.[weekIndex]
    return (Array.isArray(attempts) ? attempts.at(-1) : undefined) || state.quizScores?.[weekIndex]
  }
  for (const week of availableWeeks) {
    if (week.index === 0) {
      if (!activityRecorded('w0-map')) return { type: 'lab', week: 0, id: 'w0-map', title: '나의 보안 지도 만들기', label: '나의 보안 지도', estimatedMinutes: 0, route: { page: 'week', week: 0, tab: 'map' } }
      const latestQuiz = latestQuizAttempt(0)
      const quizPassed = latestQuiz?.passed ?? (latestQuiz?.percent || 0) >= 80
      if (!quizPassed) return { type: 'quiz', week: 0, id: 'quiz-0', title: 'Week 0 이해 확인', label: '이해 확인', estimatedMinutes: 0, route: { page: 'week', week: 0, tab: 'quiz' } }
      continue
    }
    for (const module of (Array.isArray(week.modules) ? week.modules : []).filter((item) => item?.path !== 'extension')) {
      if (!state.modulesRead?.[module.id]) return { type: 'module', week: week.index, id: module.id, title: module.title, label: '개념 읽기', estimatedMinutes: module.duration, route: { page: 'week', week: week.index, tab: 'concepts', moduleId: module.id } }
    }
    for (const lab of (Array.isArray(week.labs) ? week.labs : []).filter((item) => item?.path !== 'extension')) {
      if (!activityRecorded(lab.id)) return { type: 'lab', week: week.index, id: lab.id, title: lab.title, label: lab.kind === 'external' ? '공식 외부 활동' : '실습', estimatedMinutes: lab.estimatedMinutes, route: { page: 'lab', labId: lab.id } }
    }
    const latestQuiz = latestQuizAttempt(week.index)
    const quizPassed = latestQuiz?.passed ?? (latestQuiz?.percent || 0) >= 80
    if (!quizPassed) return { type: 'quiz', week: week.index, id: `quiz-${week.index}`, title: `${week.index}주차 이해 확인`, label: '이해 확인', estimatedMinutes: week.quizMinutes || 15, route: { page: 'week', week: week.index, tab: 'quiz' } }
    if (week.weeklyRecord && state.submissions?.[`week-${week.index}`]?.status !== 'evidence-ready') return { type: 'record', week: week.index, id: `record-${week.index}`, title: `${week.index}주차 학습 정리`, label: '주차 정리', estimatedMinutes: week.recordMinutes || 25, route: { page: 'week', week: week.index, tab: 'record' } }
  }
  const finalWeek = availableWeeks.reduce((latest, week) => (
    !latest || Number(week.index) > Number(latest.index) ? week : latest
  ), null)
  if (!finalWeek) return { type: 'review', week: null, id: 'review', title: '학습 내용 복습', label: '복습', estimatedMinutes: 20, route: { page: 'learn' } }
  return { type: 'review', week: finalWeek.index, id: `review-week-${finalWeek.index}`, title: `${finalWeek.index}주차 ${finalWeek.title || '학습 내용'} 복습`, label: '복습', estimatedMinutes: 20, route: { page: 'week', week: finalWeek.index, tab: 'concepts' } }
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

function safeDecodeURIComponent(value) {
  try {
    return { ok: true, value: decodeURIComponent(value) }
  } catch {
    return { ok: false, value: null }
  }
}

export function parseHash(hash = '') {
  const clean = String(hash).replace(/^#\/?/, '').replace(/\/$/, '')
  if (!clean) return { page: 'home' }
  const parts = clean.split('/')
  if (parts[0] === 'learn' && parts[1] === 'week' && /^\d+$/.test(parts[2] || '')) {
    if (!parts[3]) return { page: 'week', week: Number(parts[2]) }
    const week = Number(parts[2])
    const tabs = week === 0 ? ['overview', 'concepts', 'labs', 'glossary', 'careers', 'map', 'quiz'] : ['overview', 'concepts', 'labs', 'quiz', 'record']
    const hasSectionRoute = parts.length === 7 && parts[3] === 'concepts' && parts[4] && parts[5] === 'section' && parts[6]
    if (!tabs.includes(parts[3]) || (parts[4] && parts[3] !== 'concepts') || (parts.length > 5 && !hasSectionRoute)) return { page: 'not-found', path: clean }
    if (!parts[4]) return { page: 'week', week, tab: parts[3] }
    const decodedModuleId = safeDecodeURIComponent(parts[4])
    const decodedSectionId = hasSectionRoute ? safeDecodeURIComponent(parts[6]) : { ok: true, value: null }
    if (!decodedModuleId.ok || !decodedSectionId.ok) return { page: 'not-found', path: clean, reason: 'malformed-uri-component' }
    return {
      page: 'week',
      week,
      tab: parts[3],
      moduleId: decodedModuleId.value,
      ...(decodedSectionId.value ? { sectionId: decodedSectionId.value } : {}),
    }
  }
  if (parts[0] === 'learn' && parts[1] === 'week') return { page: 'not-found', path: clean }
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
    const sectionPath = tab === 'concepts' && route.moduleId && route.sectionId ? `/section/${encodeURIComponent(route.sectionId)}` : ''
    const modulePath = tab === 'concepts' && route.moduleId ? `/${encodeURIComponent(route.moduleId)}${sectionPath}` : ''
    return `#/learn/week/${route.week}/${tab}${modulePath}`
  }
  if (route.page === 'lab') return `#/labs/${route.labId}`
  if (route.page === 'report-editor') return route.reportId === 'local-xss-draft' ? '#/reports/new' : `#/reports/${route.reportId}`
  if (route.page === 'insights') return '#/insights'
  return `#/${route.page}`
}
