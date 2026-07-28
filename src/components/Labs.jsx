import React, { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Circle,
  ExternalLink,
  Eye,
  Lightbulb,
  LockKeyhole,
  Play,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { weekContent } from '../courseData'
import { buildXssTrace } from '../platformLogic'
import { recordHintUsage } from '../learningModel'
import { isActivityRecorded } from '../learningModel'
import { getLearningTextLength, normalizeLearningText, validateLearningText } from '../validation'
import { loadDeepGuideModules } from '../content/deepGuideLoader'
import MindmapStudio from './MindmapStudio'

const allLabs = Object.values(weekContent).flatMap((week) => week.labs.map((lab) => ({ ...lab, weekTitle: week.title })))
const supportedLabKinds = new Set([
  'mindmap', 'roe', 'baseline', 'linux-shell', 'path', 'sequence', 'permission', 'pipeline',
  'request-editor', 'http-baseline', 'tool-triangle', 'http-label', 'timeline', 'cookie',
  'source-sink', 'threat-model', 'xss-reflected', 'xss-stored', 'xss-dom', 'xss-filtering',
  'xss-packet-classifier',
  'report-evidence', 'external', 'guided-observation',
  'patch-review',
])

function findLab(id) { return allLabs.find((lab) => lab.id === id) }
function isSupportedLabKind(kind) { return supportedLabKinds.has(kind) }

function LabKindIcon({ kind }) {
  if (kind === 'external') return <ExternalLink size={18} />
  if (kind === 'guided-observation' || kind === 'report-evidence' || kind === 'patch-review') return <Eye size={18} />
  if (String(kind).startsWith('xss')) return <Braces size={18} />
  return <Terminal size={18} />
}

export function LabCatalog({ progress, navigate }) {
  const [weekFilter, setWeekFilter] = useState('all')
  const [scopeFilter, setScopeFilter] = useState('all')
  const weekOptions = [...new Set(allLabs.map((lab) => lab.week))].sort((left, right) => Number(left) - Number(right))
  const visible = allLabs.filter((lab) => (weekFilter === 'all' || lab.week === Number(weekFilter)) && (scopeFilter === 'all' || (scopeFilter === 'local' ? lab.kind !== 'external' : lab.kind === 'external')))
  return (
    <div className="page-width labs-catalog">
      <section className="safety-notice"><ShieldCheck size={20} /><div><strong>실습 범위</strong><p>내장 실습은 브라우저 안의 교육용 데이터만 사용합니다. 외부 실습은 제공 기관이 명시한 계정·대상·기법 범위를 따릅니다.</p></div></section>
      <div className="catalog-toolbar"><div>{['all', ...weekOptions.map(String)].map((item) => <button type="button" key={item} className={weekFilter === item ? 'active' : ''} onClick={() => setWeekFilter(item)}>{item === 'all' ? '전체 주차' : `Week ${item}`}</button>)}</div><label><span>실습 범위</span><select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)}><option value="all">전체</option><option value="local">내부 로컬</option><option value="external">공식 외부</option></select><ChevronDown size={14} /></label></div>
      <div className="lab-catalog-list">{visible.map((lab) => { const state = progress.labs[lab.id]; return <button type="button" key={lab.id} onClick={() => navigate({ page: 'lab', labId: lab.id })}><span className="catalog-week">W{String(lab.week).padStart(2, '0')}</span><span className="catalog-icon"><LabKindIcon kind={lab.kind} /></span><span className="catalog-copy"><small>{lab.path === 'extension' ? '심화' : lab.kind === 'external' ? '공식 외부 실습' : '필수 핵심'}</small><strong>{lab.title}</strong><p>{lab.objective}</p></span><Status state={state?.status || 'not_started'} /><ChevronRight size={18} /></button>})}</div>
    </div>
  )
}

export function LabPage({ labId, progress, updateProgress, navigate, notify }) {
  const lab = findLab(labId)
  const state = progress.labs[labId] || {}
  const labPageRef = useRef(null)

  useEffect(() => {
    if (!lab || state.status) return
    updateProgress((current) => ({ ...current, labs: { ...current.labs, [labId]: { openedAt: new Date().toISOString(), hintLevel: 0 } } }))
  }, [labId])

  useEffect(() => {
    const root = labPageRef.current
    if (!root) return undefined
    const sync = () => root.querySelectorAll('pre').forEach((element, index) => {
      const overflowing = element.scrollWidth > element.clientWidth + 1
      if (overflowing) {
        element.tabIndex = 0
        element.setAttribute('role', 'region')
        if (!element.getAttribute('aria-label')) element.setAttribute('aria-label', `${lab?.title || '실습'} 코드 영역 ${index + 1}`)
      } else if (element.dataset.alwaysFocusable !== 'true') {
        element.removeAttribute('tabindex')
        element.removeAttribute('role')
        element.removeAttribute('aria-label')
      }
    })
    sync()
    window.addEventListener('resize', sync)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(sync) : null
    if (observer) observer.observe(root)
    return () => { window.removeEventListener('resize', sync); observer?.disconnect() }
  })

  if (!lab) return <div className="page-width"><div className="empty-state"><Terminal size={24} /><strong>실습을 찾을 수 없습니다.</strong><button className="button secondary" type="button" onClick={() => navigate({ page: 'labs' })}>실습실로</button></div></div>

  const updateLab = (patch) => updateProgress((current) => ({ ...current, labs: { ...current.labs, [lab.id]: { ...(current.labs[lab.id] || {}), ...patch } } }))
  const derivedPassed = lab.id === 'w0-map'
    ? Object.keys(progress.mindmap.statuses).length >= 10 && Object.values(progress.mindmap.notes).filter((item) => String(item).length >= 5).length >= 3 && progress.mindmap.interests.length >= 2
    : lab.id === 'w0-baseline' ? Object.keys(progress.baseline).length >= 6
      : lab.id === 'w0-roe' ? Object.keys(progress.roeAnswers).length >= roeCases.length : false
  const supportedKind = isSupportedLabKind(lab.kind)
  const validationPassed = supportedKind && Boolean(state.validationPassed || derivedPassed)
  const tone = state.tone || 'teal'

  const complete = () => {
    if (!supportedKind) {
      notify('이 실습 유형은 아직 지원되지 않아 완료 처리할 수 없습니다.')
      return
    }
    if (!validationPassed) {
      notify(lab.activityType === 'assessment' ? '이해 확인을 먼저 완료하세요.' : '실습 결과 확인 조건을 먼저 충족하세요.')
      return
    }
    updateLab({ status: 'activity-recorded', recordedAt: new Date().toISOString() })
    notify('실습 완료 상태를 저장했습니다.')
  }

  return (
    <div ref={labPageRef} className={`page-width lab-page lab-tone-${tone}`}>
      <button className="back-link" type="button" onClick={() => navigate({ page: 'labs' })}><ArrowLeft size={16} />실습실</button>
      <header className="lab-header">
        <div><span>WEEK {String(lab.week).padStart(2, '0')} · {activityTypeLabels[lab.activityType]?.kicker || 'LEARNING ACTIVITY'}</span><h2>{lab.title}</h2><p>{lab.objective}</p></div>
        <div><Status state={isActivityRecorded(state) ? 'activity-recorded' : state.openedAt ? 'in-progress' : 'not_started'} /><span>{lab.path === 'extension' ? '심화' : lab.kind === 'external' ? '외부 실습' : '필수 핵심'}</span><fieldset className="lab-tone-picker"><legend className="sr-only">실습 화면 색상</legend>{[['teal', '청록'], ['blue', '청색'], ['amber', '호박색'], ['rose', '적색']].map(([value, label]) => <label className={tone === value ? 'active' : ''} key={value} title={`${label} 색상`}><input type="radio" name={`lab-tone-${lab.id}`} value={value} checked={tone === value} onChange={() => updateLab({ tone: value })} /><i /><span className="sr-only">{label} 색상</span></label>)}</fieldset></div>
      </header>
      <div className="lab-scope"><ShieldCheck size={18} /><div><strong>안전한 실습 범위</strong><p>{lab.safeScope}</p></div></div>

      <div className="lab-meta-grid"><section><h3>선수지식</h3><ul>{lab.prerequisites.length ? lab.prerequisites.map((item) => <LabPrerequisite key={item} item={item} navigate={navigate} />) : <li>별도 선수지식 없음</li>}</ul></section><section><h3>필요한 도구</h3><ul>{lab.requiredTools.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>성공 조건</h3><ul>{lab.successCriteria.map((item) => <li key={item}>{item}</li>)}</ul></section></div>

      <div className="lab-work-layout">
        <div className="lab-workbench">
          <LabWorkArea lab={lab} state={state} updateLab={updateLab} progress={progress} updateProgress={updateProgress} notify={notify} />
        </div>
        <aside className="lab-coach-column">{['practice', 'investigation'].includes(lab.activityType) && lab.hints?.length > 0 && <HintCoach lab={lab} state={state} updateLab={updateLab} updateProgress={updateProgress} />}<ResultCheck activityType={lab.activityType} passed={validationPassed} criteria={lab.successCriteria} /></aside>
      </div>

      <footer className="lab-complete-footer"><div><strong>{!supportedKind ? '실습 유형 미지원' : isActivityRecorded(state) ? '실습 완료' : validationPassed ? `${resultLabel(lab.activityType)} 완료` : `${resultLabel(lab.activityType)} 전`}</strong><p>{!supportedKind ? '검증과 완료 처리는 지원되는 실습 유형에서만 가능합니다.' : '실습 안의 판별 결과만 확인하면 완료할 수 있습니다.'}</p></div><button className="button primary" type="button" disabled={isActivityRecorded(state) || !supportedKind} onClick={complete}>{isActivityRecorded(state) ? <><Check size={16} />실습 완료</> : <>완료 저장<ArrowRight size={16} /></>}</button></footer>
    </div>
  )
}

function LabWorkArea({ lab, state, updateLab, progress, updateProgress, notify }) {
  const validate = (result = {}) => updateLab({ validationPassed: true, validation: result, validatedAt: new Date().toISOString() })
  switch (lab.kind) {
    case 'mindmap': return <MindmapStudio progress={progress} updateProgress={updateProgress} notify={notify} />
    case 'roe': return <RoeLab progress={progress} updateProgress={updateProgress} onPass={validate} />
    case 'baseline': return <BaselineLab progress={progress} updateProgress={updateProgress} onPass={validate} />
    case 'linux-shell': return <LinuxShellLab lab={lab} state={state} updateLab={updateLab} onPass={validate} />
    case 'path': return <PathLab state={state} updateLab={updateLab} onPass={validate} />
    case 'sequence': return <SequenceLab state={state} updateLab={updateLab} onPass={validate} variant="ssh" />
    case 'permission': return <PermissionLab state={state} updateLab={updateLab} onPass={validate} />
    case 'pipeline': return <PipelineLab state={state} updateLab={updateLab} onPass={validate} />
    case 'request-editor': return <RequestEditorLab state={state} updateLab={updateLab} onPass={validate} />
    case 'http-baseline': return <HttpBaselineLab state={state} updateLab={updateLab} onPass={validate} />
    case 'tool-triangle': return <ToolTriangleLab state={state} updateLab={updateLab} onPass={validate} />
    case 'http-label': return <HttpLabelLab state={state} updateLab={updateLab} onPass={validate} />
    case 'timeline': return <SequenceLab state={state} updateLab={updateLab} onPass={validate} variant="http" />
    case 'cookie': return <CookieLab state={state} updateLab={updateLab} onPass={validate} />
    case 'source-sink': return <SourceSinkLab state={state} updateLab={updateLab} onPass={validate} />
    case 'threat-model': return <ThreatModelLab state={state} updateLab={updateLab} onPass={validate} />
    case 'xss-reflected':
    case 'xss-stored':
    case 'xss-dom':
    case 'xss-filtering': return <XssLab lab={lab} state={state} updateLab={updateLab} onPass={validate} />
    case 'xss-packet-classifier': return <XssPacketClassifierLab lab={lab} state={state} updateLab={updateLab} onPass={validate} />
    case 'report-evidence': return <ReportEvidenceLab lab={lab} state={state} updateLab={updateLab} onPass={validate} />
    case 'external': return <ExternalLab lab={lab} state={state} updateLab={updateLab} onPass={validate} />
    case 'guided-observation': return <GuidedObservationLab lab={lab} state={state} updateLab={updateLab} onPass={validate} />
    case 'patch-review': return <PatchReviewLab lab={lab} state={state} updateLab={updateLab} onPass={validate} />
    default: return <UnsupportedLab />
  }
}

function LabPrerequisite({ item, navigate }) {
  const module = Object.values(weekContent).flatMap((week) => week.modules || []).find((candidate) => candidate.id === item)
  if (!module) return <li>{item}</li>
  const week = Object.values(weekContent).find((candidate) => candidate.modules?.some((entry) => entry.id === item))
  return <li><button className="lab-prerequisite-link" type="button" onClick={() => navigate({ page: 'week', week: week.index, tab: 'concepts', moduleId: module.id })}>{module.title}</button></li>
}

function HintCoach({ lab, state, updateLab, updateProgress }) {
  const level = state.hintLevel || 0
  const labels = ['개념 회상', '관찰 지점', '다음 행동']
  const next = () => {
    const nextLevel = Math.min(3, level + 1)
    updateLab({ hintLevel: nextLevel })
    updateProgress((current) => recordHintUsage(current, { activityId: lab.id, stage: labels[nextLevel - 1] || `stage-${nextLevel}` }))
  }
  return <section className="hint-coach"><header><Lightbulb size={18} /><div><span>RULE-BASED COACH</span><h3>단계별 힌트</h3></div></header><p>결과 대신 다음에 확인할 대상을 한 단계씩 제시합니다.</p>{lab.hints.map((hint, index) => <div className={`hint-step ${index < level ? 'open' : ''}`} key={hint}><span>{index + 1}</span><div><small>Hint {index + 1} · {labels[index]}</small>{index < level ? <p>{hint}</p> : <strong>아직 열지 않음</strong>}</div></div>)}<button type="button" disabled={level >= 3} onClick={next}>{level >= 3 ? '모든 힌트를 확인함' : `Hint ${level + 1} 열기`}<ChevronRight size={15} /></button>{level > 0 && <div className="coach-next"><strong>다음 확인 항목</strong><p>제안한 지점을 확인한 뒤 나온 출력과 처음 가설이 같은지 비교하세요.</p></div>}</section>
}

function ResultCheck({ activityType, passed, criteria }) {
  const label = resultLabel(activityType)
  return <section className={`validation-box ${passed ? 'passed' : ''}`}><header>{passed ? <CheckCircle2 size={18} /> : <Circle size={18} />}<strong>{passed ? `${label} 완료` : `${label} 전`}</strong></header><ul>{criteria.map((item) => <li key={item}>{item}</li>)}</ul>{activityType === 'external' && <p>체크 항목은 학습자 자기 확인이며 이 사이트가 외부 플랫폼 결과를 판정하지 않습니다.</p>}</section>
}

const activityTypeLabels = {
  practice: { kicker: 'PRACTICE', recordDescription: '수행 순서, 관찰 결과와 원리를 기록하고 다시 시도할 때 확인할 점을 남깁니다.' },
  investigation: { kicker: 'INVESTIGATION', recordDescription: '처음 가설과 실제 관찰을 분리하고 결과 차이와 결론을 기록합니다.' },
  simulation: { kicker: 'SIMULATION', recordDescription: '예상, 바꾼 상태, 실제 변화와 초기화 여부를 기록합니다.' },
  external: { kicker: 'OFFICIAL EXTERNAL ACTIVITY', recordDescription: '외부 플랫폼의 범위, 목표, 사용 도구, 원리와 결과를 본인이 확인해 기록합니다.' },
  assessment: { kicker: 'ASSESSMENT', recordDescription: '' },
}

function resultLabel(activityType) {
  return ({ practice: '결과 확인', investigation: '관찰 확인', simulation: '변화 관찰', external: '자기 확인', assessment: '이해 확인' })[activityType] || '결과 확인'
}

const roeCases = [
  ['bandit', '공식 Bandit 서버에서 제공된 계정으로 해당 레벨을 해결한다.', 'allow', '제공 기관이 대상과 계정을 명시한 교육 범위입니다.'],
  ['school', '허가 없이 학교 홈페이지에 자동 취약점 스캐너를 실행한다.', 'deny', '공개된 서비스라도 명시적 허가가 없으면 테스트할 수 없습니다.'],
  ['local', '로컬 DVWA·WebGoat에서 테스트 계정으로 XSS를 확인한다.', 'allow', '의도적으로 취약한 로컬 교육 환경입니다.'],
  ['cookie', '실습 제출 스크린샷에 실제 세션 Cookie를 그대로 노출한다.', 'mask', '증거는 필요한 최소 범위만 남기고 Cookie·토큰·개인정보를 마스킹해야 합니다.'],
  ['time', '테스트 대상과 기법은 승인됐지만 가능한 시간대가 계획서에 없다.', 'confirm', '기술이 허용돼도 시간·변경 창·중단 조건이 불명확하면 담당자 확인이 먼저입니다.'],
  ['minimal', '범위 내 취약점을 무해한 PoC로 재현하고 필요한 최소 증거만 수집한다.', 'allow', '허가 범위와 최소 영향·최소 수집 원칙을 지켰습니다.'],
]

function RoeLab({ progress, updateProgress, onPass }) {
  const answers = progress.roeAnswers
  const [checked, setChecked] = useState(false)
  const score = roeCases.filter(([id, , answer]) => answers[id] === answer).length
  const choose = (id, value) => { setChecked(false); updateProgress((current) => ({ ...current, roeAnswers: { ...current.roeAnswers, [id]: value } })) }
  const verify = () => { setChecked(true); if (score >= 5) onPass({ score, total: roeCases.length }) }
  return <section className="roe-lab"><header><span>CLASSIFY</span><h2>ROE 사례 판별</h2><p>기술 수준이 아니라 허가·범위·영향·시간·데이터 처리를 기준으로 판단합니다.</p></header>{roeCases.map(([id, text, answer, reason], index) => <article key={id}><span>{String(index + 1).padStart(2, '0')}</span><p>{text}</p><div><button type="button" className={answers[id] === 'allow' ? 'selected' : ''} onClick={() => choose(id, 'allow')}>허용</button><button type="button" className={answers[id] === 'deny' ? 'selected' : ''} onClick={() => choose(id, 'deny')}>금지</button><button type="button" className={answers[id] === 'confirm' ? 'selected' : ''} onClick={() => choose(id, 'confirm')}>확인 필요</button><button type="button" className={answers[id] === 'mask' ? 'selected' : ''} onClick={() => choose(id, 'mask')}>마스킹 후 기록</button></div>{checked && <small className={answers[id] === answer ? 'correct' : 'wrong'}>{answers[id] === answer ? '판단 일치' : '다시 확인'} · {reason}</small>}</article>)}<footer><span>{checked ? `${score} / ${roeCases.length} · ${score >= 5 ? '통과' : '재시도'}` : '모든 사례를 분류하세요.'}</span><button className="button primary" type="button" disabled={Object.keys(answers).length < roeCases.length} onClick={verify}>판단 확인<CheckCircle2 size={16} /></button></footer></section>
}

const baselineFields = [['linux', 'Linux 터미널'], ['http', 'HTTP 요청·응답'], ['html', 'HTML·JavaScript'], ['git', 'Git'], ['report', '보안 보고서'], ['interest', '가장 관심 있는 분야']]
function BaselineLab({ progress, updateProgress, onPass }) {
  const values = progress.baseline
  const update = (id, value) => updateProgress((current) => ({ ...current, baseline: { ...current.baseline, [id]: value } }))
  useEffect(() => { if (Object.keys(values).length >= 6) onPass({ completed: true }) }, [Object.keys(values).length])
  return <section className="baseline-lab"><header><span>BASELINE</span><h2>현재 경험 기록</h2><p>성적이나 순위에 반영하지 않습니다. 추천할 선수 개념을 고르는 데만 사용합니다.</p></header><div>{baselineFields.map(([id, label], index) => <label key={id}><span><b>{String(index + 1).padStart(2, '0')}</b><strong>{label}</strong></span><select value={values[id] || ''} onChange={(event) => update(id, event.target.value)}><option value="">선택</option>{id === 'interest' ? <><option>웹·AppSec</option><option>시스템·Pwn</option><option>관제·사고대응</option><option>포렌식·악성코드</option><option>클라우드·산업 보안</option><option>아직 모르겠음</option></> : <><option>경험 없음</option><option>한 번 따라 해봄</option><option>도움 없이 기본 작업 가능</option><option>다른 사람에게 설명 가능</option></>}</select><ChevronDown size={14} /></label>)}</div><footer><span>{Object.keys(values).length} / 6 응답</span>{Object.keys(values).length >= 6 && <Status state="completed" text="진단 완료" />}</footer></section>
}

const linuxFs = {
  '/': { type: 'dir', entries: ['home', 'etc', 'tmp'] },
  '/home': { type: 'dir', entries: ['bandit0'] },
  '/home/bandit0': { type: 'dir', entries: ['readme', 'FLAG1.txt', 'spaces in this filename', '-file07', '.FLAG2.txt', 'inhere'] },
  '/home/bandit0/inhere': { type: 'dir', entries: ['notes.txt', '.hidden', 'maybehere'] },
  '/home/bandit0/inhere/maybehere': { type: 'dir', entries: ['evidence.log'] },
  '/home/bandit0/readme': { type: 'file', kind: 'UTF-8 Unicode text', content: 'SecTrack Linux training shell.\nThis filesystem is read-only.' },
  '/home/bandit0/FLAG1.txt': { type: 'file', kind: 'ASCII text', content: 'FLAG{linux_observation_01}' },
  '/home/bandit0/.FLAG2.txt': { type: 'file', kind: 'ASCII text', content: 'FLAG{hidden_file_02}' },
  '/home/bandit0/spaces in this filename': { type: 'file', kind: 'ASCII text', content: 'Quotes keep a filename with spaces as one argument.' },
  '/home/bandit0/-file07': { type: 'file', kind: 'ASCII text', content: 'Use -- before a filename that begins with a hyphen.' },
  '/home/bandit0/inhere/notes.txt': { type: 'file', kind: 'UTF-8 Unicode text', content: 'Observation comes before a conclusion.' },
  '/home/bandit0/inhere/.hidden': { type: 'file', kind: 'ASCII text', content: 'A leading dot only changes normal listing behavior.' },
  '/home/bandit0/inhere/maybehere/evidence.log': { type: 'file', kind: 'ASCII text', content: 'status=normal\nsecurity_flag=FLAG{find_then_grep_03}\nowner=bandit0' },
  '/etc': { type: 'dir', entries: ['issue'] }, '/etc/issue': { type: 'file', kind: 'ASCII text', content: 'SecTrack training Linux' }, '/tmp': { type: 'dir', entries: [] },
}

const linuxTasks = [
  { id: 'flag1', number: 1, title: '보이는 파일', body: '홈 디렉터리의 일반 파일 목록에서 첫 번째 FLAG 파일을 찾아 내용을 확인합니다.', flag: 'FLAG{linux_observation_01}' },
  { id: 'flag2', number: 2, title: '숨김 파일', body: '일반 목록에는 보이지 않는 두 번째 FLAG 파일을 찾아 내용을 확인합니다.', flag: 'FLAG{hidden_file_02}' },
  { id: 'flag3', number: 3, title: '하위 경로의 기록', body: '파일 경로 후보를 찾은 뒤 내용에서 security_flag가 있는 줄을 검색합니다.', flag: 'FLAG{find_then_grep_03}' },
]

const commandCtfFs = {
  '/': { type: 'dir', entries: ['home', 'tmp'] },
  '/home': { type: 'dir', entries: ['analyst'] },
  '/home/analyst': { type: 'dir', entries: ['README.md', '.briefing', 'evidence'] },
  '/home/analyst/README.md': { type: 'file', kind: 'ASCII text', content: 'Incident archive training. Observe first; do not execute unknown files.' },
  '/home/analyst/.briefing': { type: 'file', kind: 'ASCII text', content: 'Mission token: FLAG{hidden_briefing_01}' },
  '/home/analyst/evidence': { type: 'dir', entries: ['archive', 'notes.txt'] },
  '/home/analyst/evidence/notes.txt': { type: 'file', kind: 'UTF-8 Unicode text', content: 'The file name is only a clue. Confirm its format before reading.' },
  '/home/analyst/evidence/archive': { type: 'dir', entries: ['packet.bin', 'dispatch.log'] },
  '/home/analyst/evidence/archive/packet.bin': { type: 'file', kind: 'ASCII text', content: 'Recovered note: FLAG{format_before_read_02}' },
  '/home/analyst/evidence/archive/dispatch.log': { type: 'file', kind: 'ASCII text', content: '2026-07-13 status=closed\n2026-07-13 ACCESS_CODE=FLAG{find_then_grep_03}\n2026-07-13 owner=training' },
  '/tmp': { type: 'dir', entries: [] },
}

const commandCtfTasks = [
  { id: 'briefing', number: 1, title: '숨김 브리핑', body: '`ls -al`로 숨김 파일을 확인한 뒤 첫 번째 FLAG를 읽습니다.', flag: 'FLAG{hidden_briefing_01}', requiredCommands: ['ls', 'cat'] },
  { id: 'format', number: 2, title: '형식 확인', body: '확장자가 아닌 `file` 결과를 확인한 뒤 두 번째 FLAG를 읽습니다.', flag: 'FLAG{format_before_read_02}', requiredCommands: ['file', 'cat'] },
  { id: 'dispatch', number: 3, title: '사건 기록', body: '`find`로 경로를 찾고 `grep`으로 ACCESS_CODE 줄을 검색합니다.', flag: 'FLAG{find_then_grep_03}', requiredCommands: ['find', 'grep'] },
]

const linuxShellScenarios = {
  treasure: { id: 'treasure', user: 'bandit0', home: '/home/bandit0', title: '파일 시스템 보물찾기', intro: 'SecTrack Linux Lab · 읽기 전용\nhelp를 입력하면 지원 명령을 확인할 수 있습니다.', fs: linuxFs, tasks: linuxTasks },
  'command-ctf': { id: 'command-ctf', user: 'analyst', home: '/home/analyst', title: '사건 기록 CTF', intro: 'Incident archive CTF · 읽기 전용\n목록, 형식, 경로, 텍스트 순서로 관찰하세요.', fs: commandCtfFs, tasks: commandCtfTasks },
}

function shellArgs(input) {
  const matches = input.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
  return matches.map((item) => item.replace(/^['"]|['"]$/g, ''))
}

function LinuxShellLab({ lab, state, updateLab, onPass }) {
  const scenario = linuxShellScenarios[lab.scenario] || linuxShellScenarios.treasure
  const { fs, tasks, home, user } = scenario
  const [cwd, setCwd] = useState(home)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([{ output: scenario.intro }])
  const inputRef = useRef(null)
  const solved = state.solved || {}
  const observedCommands = new Set(state.observedCommands || [])
  const revealedFlags = state.revealedFlags || {}
  useEffect(() => {
    setCwd(home)
    setInput('')
    setHistory([{ output: scenario.intro }])
  }, [scenario.id, home, scenario.intro])
  const resolve = (raw = '.') => {
    if (raw === '~') return home
    const parts = raw.startsWith('/') ? [] : cwd.split('/').filter(Boolean)
    raw.replace(/^~\/?/, `${home}/`).split('/').forEach((part) => { if (!part || part === '.') return; if (part === '..') parts.pop(); else parts.push(part) })
    return `/${parts.join('/')}`
  }
  const completeInput = () => {
    const parts = input.split(/\s+/)
    const partial = parts.pop() || ''
    const commands = ['pwd', 'ls', 'cd', 'file', 'cat', 'less', 'stat', 'head', 'tail', 'find', 'grep', 'man', 'whoami', 'history', 'help', 'clear']
    const candidates = parts.length === 0 ? commands.filter((item) => item.startsWith(partial)) : (fs[cwd]?.entries || []).filter((item) => item.startsWith(partial) && (partial.startsWith('.') || !item.startsWith('.')))
    if (candidates.length === 1) setInput([...parts, candidates[0] + (fs[resolve(candidates[0])]?.type === 'dir' ? '/' : '')].join(' '))
  }
  const execute = (raw) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    if (trimmed === 'clear') { setHistory([]); setInput(''); return }
    const [command, ...args] = shellArgs(trimmed)
    let output = ''
    let nextCwd = cwd
    if (command === 'help') output = '지원 명령: pwd, ls [-alh] [경로], cd [경로], file 파일, cat·less 파일, stat 파일, head [-n N] 파일, tail [-n N] 파일, find [경로] -type f, grep [-in] 패턴 파일, man 명령, whoami, history, clear'
    else if (command === 'pwd') output = cwd
    else if (command === 'whoami') output = user
    else if (command === 'history') output = history.filter((item) => item.command).map((item, index) => `${index + 1}  ${item.command.replace(/^.*\$ /, '')}`).join('\n')
    else if (command === 'ls') {
      const options = args.filter((item) => item.startsWith('-')).join('')
      const target = args.find((item) => !item.startsWith('-')) || '.'
      const path = resolve(target); const entry = fs[path]
      if (!entry) output = `ls: cannot access '${target}': No such file or directory`
      else if (entry.type === 'file') output = target
      else {
        const showAll = options.includes('a'); const long = options.includes('l')
        const names = showAll ? ['.', '..', ...entry.entries] : entry.entries.filter((name) => !name.startsWith('.'))
        output = long ? names.map((name) => { const item = fs[`${path === '/' ? '' : path}/${name}`]; const mode = name === '.' || name === '..' || item?.type === 'dir' ? 'drwxr-x---' : '-rw-r-----'; return `${mode} 1 ${user} training ${options.includes('h') ? '68B' : '68'} Jul 11 10:30 ${name}` }).join('\n') : names.join('  ')
      }
    } else if (command === 'cd') {
      const target = args[0] || '~'; const path = resolve(target); const entry = fs[path]
      if (!entry) output = `cd: ${target}: No such file or directory`
      else if (entry.type !== 'dir') output = `cd: ${target}: Not a directory`
      else nextCwd = path
    } else if (['cat', 'less', 'file', 'stat', 'head', 'tail'].includes(command)) {
      const fileArg = args.filter((item, index) => !(item === '-n' || (index > 0 && args[index - 1] === '-n'))).find((item) => !item.startsWith('-'))
      if (!fileArg) output = `${command}: missing file operand`
      else { const path = resolve(fileArg); const entry = fs[path]; if (!entry) output = `${command}: ${fileArg}: No such file or directory`; else if (entry.type === 'dir') output = command === 'file' ? `${fileArg}: directory` : `${command}: ${fileArg}: Is a directory`; else if (command === 'file') output = `${fileArg}: ${entry.kind}`; else if (command === 'stat') output = `  File: ${fileArg}\n  Size: ${entry.content.length}\tBlocks: 8\nAccess: (0640/-rw-r-----)  Uid: ${user}  Gid: training`; else { const lines = entry.content.split('\n'); const nIndex = args.indexOf('-n'); const count = nIndex >= 0 ? Number(args[nIndex + 1]) || 10 : 10; output = command === 'head' ? lines.slice(0, count).join('\n') : command === 'tail' ? lines.slice(-count).join('\n') : entry.content } }
    } else if (command === 'find') {
      const target = args.find((item) => !item.startsWith('-')) || '.'; const path = resolve(target); const entry = fs[path]
      if (!entry) output = `find: '${target}': No such file or directory`
      else output = Object.entries(fs).filter(([filePath, item]) => item.type === 'file' && (path === '/' || filePath.startsWith(`${path}/`))).map(([filePath]) => path === cwd ? `.${filePath.slice(path.length)}` : filePath).join('\n')
    } else if (command === 'grep') {
      const values = args.filter((item) => !item.startsWith('-')); const [pattern, target] = values
      if (!pattern || !target) output = 'grep: usage: grep [-in] 패턴 파일'
      else { const entry = fs[resolve(target)]; if (!entry) output = `grep: ${target}: No such file`; else if (entry.type !== 'file') output = `grep: ${target}: Is a directory`; else { const insensitive = args.some((item) => item.includes('i')); const withLine = args.some((item) => item.includes('n')); const matches = entry.content.split('\n').map((line, index) => [line, index + 1]).filter(([line]) => (insensitive ? line.toLowerCase() : line).includes(insensitive ? pattern.toLowerCase() : pattern)); output = matches.map(([line, number]) => `${withLine ? `${number}:` : ''}${line}`).join('\n') } }
    } else if (command === 'man') {
      const pages = { ls: 'ls [옵션] [파일 또는 디렉터리...]\n-a 숨김 이름 포함, -l 상세 목록, -h 읽기 쉬운 크기', file: 'file [옵션] 파일...\n확장자가 아닌 내용 특징과 매직 값을 바탕으로 형식 후보를 봅니다.', find: 'find [시작 경로] [조건...]\n-type f 일반 파일, -name 패턴 이름 조건', grep: 'grep [옵션] 패턴 [파일...]\n-i 대소문자 무시, -n 줄 번호' }
      output = pages[args[0]] || `man: ${args[0] || '명령'}: 이 가상 셸에는 간단한 도움말만 있습니다.`
    } else output = `${command}: command not found\nhelp로 지원 명령을 확인하세요.`
    observedCommands.add(command)
    const newlyRevealedFlags = { ...revealedFlags }
    tasks.forEach((task) => { if (output.includes(task.flag)) newlyRevealedFlags[task.id] = true })
    const newlySolved = { ...solved }
    tasks.forEach((task) => {
      const commandsReady = !task.requiredCommands || task.requiredCommands.every((required) => observedCommands.has(required))
      if (newlyRevealedFlags[task.id] && commandsReady) newlySolved[task.id] = true
    })
    setCwd(nextCwd); setHistory((current) => [...current, { command: `${user}@sectrack:${cwd}$ ${trimmed}`, output }]); setInput('')
    const nextObservedCommands = [...observedCommands]
    if (JSON.stringify(newlySolved) !== JSON.stringify(solved) || JSON.stringify(newlyRevealedFlags) !== JSON.stringify(revealedFlags) || JSON.stringify(nextObservedCommands) !== JSON.stringify(state.observedCommands || [])) {
      updateLab({ solved: newlySolved, revealedFlags: newlyRevealedFlags, observedCommands: nextObservedCommands })
      if (Object.keys(newlySolved).length === tasks.length) onPass({ flags: tasks.length })
    }
  }
  return <section className="linux-shell-lab"><header><div><span>SIMULATED SHELL</span><h2>{scenario.title}</h2><p>실제 운영체제가 아닌 읽기 전용 파일 시스템입니다.</p></div><code>Tab 자동완성 · help로 명령 확인</code></header><div className="linux-task-strip">{tasks.map((task) => <article className={solved[task.id] ? 'solved' : ''} key={task.id}><span>{task.number}</span><div><strong>{task.title}</strong><p>{task.body}</p></div>{solved[task.id] ? <CheckCircle2 size={18} /> : <Circle size={18} />}</article>)}</div><div className="terminal-window" onClick={() => inputRef.current?.focus()}><div className="terminal-title"><i /><i /><i /><span>sectrack — bash</span></div><div className="terminal-body">{history.map((item, index) => <div key={`${item.command || 'intro'}-${index}`}>{item.command && <strong>{item.command}</strong>}{item.output && <pre>{item.output}</pre>}</div>)}<form onSubmit={(event) => { event.preventDefault(); execute(input) }}><label htmlFor="linux-command">{user}@sectrack:{cwd}$</label><input ref={inputRef} id="linux-command" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Tab') { event.preventDefault(); completeInput() } }} autoComplete="off" spellCheck="false" /></form></div></div></section>
}

const pathQuestions = [
  ['현재 위치 `/home/student`에서 `/home/student/notes/todo.txt`를 상대 경로로 읽기', ['cat notes/todo.txt', 'cat /notes/todo.txt', 'cd todo.txt'], 0],
  ['현재 위치 `/var/log`에서 홈 디렉터리로 이동', ['cd home', 'cd ~', 'cd ./home'], 1],
  ['현재 위치 `/home/student/projects`에서 상위 디렉터리 목록 보기', ['ls ..', 'ls /..', 'ls .'], 0],
  ['공백이 있는 `weekly report.txt` 읽기', ['cat weekly report.txt', 'cat "weekly report.txt"', 'cat weekly* report'], 1],
  ['하이픈으로 시작하는 `-note` 읽기', ['cat -note', 'cat -- -note', 'cat /- note'], 1],
  ['어디서 실행해도 `/etc/issue` 읽기', ['cat etc/issue', 'cat ../etc/issue', 'cat /etc/issue'], 2],
]
function PathLab({ state, updateLab, onPass }) {
  const answers = state.answers || {}; const [checked, setChecked] = useState(false)
  const score = pathQuestions.filter(([, , answer], index) => answers[index] === answer).length
  const verify = () => { setChecked(true); if (score >= 5) onPass({ score, total: 6 }) }
  return <section className="choice-lab"><header><span>PATH REPAIR</span><h2>경로 오류 6개</h2><p>현재 위치를 기준으로 실행 결과가 맞는 명령을 고릅니다.</p></header>{pathQuestions.map(([question, options, answer], index) => <article key={question}><div><span>{index + 1}</span><strong>{question}</strong></div><div>{options.map((option, optionIndex) => <button type="button" key={option} className={answers[index] === optionIndex ? 'selected' : ''} onClick={() => { setChecked(false); updateLab({ answers: { ...answers, [index]: optionIndex } }) }}><code>{option}</code></button>)}</div>{checked && <small className={answers[index] === answer ? 'correct' : 'wrong'}>{answers[index] === answer ? '정답 · 기준 경로가 맞습니다.' : '현재 위치와 `/` 시작 여부를 다시 확인하세요.'}</small>}</article>)}<footer><span>{checked ? `${score} / 6` : `${Object.keys(answers).length} / 6 선택`}</span><button className="button primary" type="button" disabled={Object.keys(answers).length < 6} onClick={verify}>결과 확인</button></footer></section>
}

const sequences = {
  ssh: ['사용자명·호스트·포트 확인', 'TCP 연결 시작', '서버 호스트 키 지문 확인', '사용자 인증', '원격 셸 명령 실행', 'exit로 연결 종료'],
  http: ['URL 파싱', 'DNS로 IP 확인', 'TCP 연결', 'TLS 핸드셰이크', 'HTTP 요청 전송', '서버 애플리케이션 처리', 'HTTP 응답 수신', 'HTML 파싱·DOM 렌더링'],
}
function SequenceLab({ state, updateLab, onPass, variant }) {
  const correct = sequences[variant]
  const [items, setItems] = useState(() => state.order || [...correct].sort((a, b) => (a.length % 5) - (b.length % 5)))
  const [checked, setChecked] = useState(false)
  const move = (index, direction) => { const next = [...items]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setItems(next); setChecked(false); updateLab({ order: next }) }
  const verify = () => { const passed = items.every((item, index) => item === correct[index]); setChecked(true); if (passed) onPass({ order: items }) }
  return <section className="sequence-lab"><header><span>ORDER THE FLOW</span><h2>{variant === 'ssh' ? 'SSH 연결 흐름' : '웹 요청 타임라인'}</h2><p>위·아래 버튼으로 실행 순서를 정리합니다.</p></header><div>{items.map((item, index) => <article key={item} className={checked && item === correct[index] ? 'correct' : checked ? 'wrong' : ''}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`${item} 위로`}><ArrowUp size={15} /></button><button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`${item} 아래로`}><ArrowDown size={15} /></button></article>)}</div>{checked && <p className={items.every((item, index) => item === correct[index]) ? 'sequence-result correct' : 'sequence-result wrong'}>{items.every((item, index) => item === correct[index]) ? '전체 흐름이 맞습니다.' : '표시된 위치를 다시 정리하세요.'}</p>}<footer><button className="button primary" type="button" onClick={verify}>순서 확인<CheckCircle2 size={16} /></button></footer></section>
}

const permissionRows = [
  ['-rw-r-----', '640', '소유자는 읽기·쓰기, 그룹은 읽기, 기타는 권한 없음'],
  ['drwxr-x---', '750', '소유자는 목록·변경·진입, 그룹은 목록·진입, 기타는 접근 불가'],
  ['-rwx------', '700', '소유자만 읽기·쓰기·실행'],
]
function PermissionLab({ state, updateLab, onPass }) {
  const answers = state.answers || {}; const [checked, setChecked] = useState(false)
  const score = permissionRows.filter(([, answer], index) => answers[index] === answer).length
  const verify = () => { setChecked(true); if (score === 3) onPass({ score: 3 }) }
  return <section className="permission-lab"><header><span>MODE PARSER</span><h2>권한 문자열 해석</h2><p>파일 유형 뒤의 9글자를 소유자·그룹·기타로 나눠 숫자로 바꿉니다.</p></header>{permissionRows.map(([mode, answer, explanation], index) => <article key={mode}><code>{mode}</code><div>{['600', '640', '700', '750', '755'].map((option) => <button type="button" key={option} className={answers[index] === option ? 'selected' : ''} onClick={() => { setChecked(false); updateLab({ answers: { ...answers, [index]: option } }) }}>{option}</button>)}</div>{checked && <p className={answers[index] === answer ? 'correct' : 'wrong'}><strong>{answers[index] === answer ? '해석 일치' : `정답 ${answer}`}</strong>{explanation}</p>}</article>)}<aside><strong>최소 권한 검토</strong><p>모든 사용자에게 쓰기 권한을 주는 `666`보다 실제 읽기 주체를 기준으로 소유자·그룹을 정하고 필요한 비트만 남깁니다.</p></aside><footer><button className="button primary" type="button" disabled={Object.keys(answers).length < 3} onClick={verify}>권한 확인</button></footer></section>
}

const sampleLogs = ['10.0.0.4 GET / 200', '10.0.0.8 GET /admin 403', '10.0.0.4 GET /missing 404', '10.0.0.9 GET /missing 404', '10.0.0.4 POST /login 401', '10.0.0.7 GET /missing 404']
const pipelineStages = [
  { command: 'grep " 404" access.log', output: sampleLogs.filter((line) => line.endsWith('404')).join('\n') },
  { command: '... | cut -d" " -f3', output: '/missing\n/missing\n/missing' },
  { command: '... | sort', output: '/missing\n/missing\n/missing' },
  { command: '... | uniq -c', output: '3 /missing' },
]
function PipelineLab({ state, updateLab, onPass }) {
  const stage = state.stage || 0
  const runNext = () => { const next = Math.min(pipelineStages.length, stage + 1); updateLab({ stage: next }); if (next === pipelineStages.length) onPass({ pipeline: pipelineStages.map((item) => item.command).join(' | ') }) }
  return <section className="pipeline-lab"><header><span>PIPELINE BUILDER</span><h2>404 경로 빈도 요약</h2><p>처음부터 한 줄로 쓰지 않고 각 단계의 입출력을 확인합니다.</p></header><div className="log-source"><span>access.log</span><pre>{sampleLogs.join('\n')}</pre></div><div className="pipeline-stage-list">{pipelineStages.map((item, index) => <article className={index < stage ? 'done' : index === stage ? 'current' : ''} key={item.command}><span>{index + 1}</span><div><code>{item.command}</code>{index < stage ? <pre>{item.output}</pre> : <p>{index === stage ? '이 단계를 실행할 차례입니다.' : '이전 단계 실행 후 공개됩니다.'}</p>}</div>{index < stage && <CheckCircle2 size={17} />}</article>)}</div><footer><button className="button primary" type="button" disabled={stage >= pipelineStages.length} onClick={runNext}>{stage >= pipelineStages.length ? '파이프라인 완성' : `단계 ${stage + 1} 실행`}<Play size={15} /></button></footer></section>
}

const httpBaselineFields = [
  ['url', 'URL', '요청 대상 경로'],
  ['method', 'Method', 'HTTP 동작'],
  ['headers', 'Headers', 'Content-Type·Accept·Cookie 등 메타데이터'],
  ['body', 'Body', '빈 줄 아래 메시지 데이터'],
  ['status', 'Status', '서버가 처리 결과로 보낸 상태선'],
  ['redaction', '마스킹', 'Cookie·Authorization·개인정보를 원문 대신 [REDACTED]로 기록'],
]

function HttpBaselineLab({ state, updateLab, onPass }) {
  const checked = state.checked || {}
  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] }
    updateLab({ checked: next })
    if (httpBaselineFields.every(([field]) => next[field])) onPass({ baselineFields: Object.keys(next).filter((field) => next[field]) })
  }
  return <section className="http-baseline-lab"><header><span>NORMAL REQUEST BASELINE</span><h2>CodeCureLAB 프로필 조회</h2><p>고정된 정상 메시지를 읽는 실습입니다. 값을 바꾸거나 외부 요청을 보내지 않습니다.</p></header><div className="http-baseline-message"><section><span>REQUEST</span><pre>{'GET /api/profile HTTP/1.1\nHost: training.local\nAccept: application/json\nCookie: cc_session=[REDACTED]\n\n'}</pre></section><section><span>RESPONSE</span><pre>{'HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: no-store\n\n{"id":"student-102","displayName":"training-user"}'}</pre></section></div><div className="baseline-field-checks">{httpBaselineFields.map(([id, label, description]) => <label key={id}><input type="checkbox" checked={Boolean(checked[id])} onChange={() => toggle(id)} /><span><strong>{label}</strong><small>{description}</small></span></label>)}</div><footer><span>{Object.values(checked).filter(Boolean).length} / {httpBaselineFields.length} 기준선 항목</span>{httpBaselineFields.every(([id]) => checked[id]) && <strong><CheckCircle2 size={16} />정상 기준선 저장</strong>}</footer></section>
}

const toolTriangleChecks = [
  ['curl', 'curl은 명령줄에서 재현 가능한 정상 요청 기준선을 남긴다.'],
  ['devtools', 'DevTools Network는 브라우저가 실제로 만든 요청, initiator, 실행 후 브라우저 맥락을 관찰한다.'],
  ['burp', 'Burp는 명시된 training 범위에서 선택 요청을 기록하고 비교하는 도구다.'],
  ['fields', '세 도구에서 URL, method, headers, body, status, response body를 공통 비교한다.'],
  ['redaction', 'Cookie, Authorization, 개인정보는 값 대신 [REDACTED]로 기록한다.'],
  ['handoff', 'Week 4에서는 이 요청의 입력이 어떤 Source·Transform·Sink·Context로 이어지는지 확인한다.'],
]

function ToolTriangleLab({ state, updateLab, onPass }) {
  const checked = state.checked || {}
  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] }
    updateLab({ checked: next })
    if (toolTriangleChecks.every(([field]) => next[field])) onPass({ verified: toolTriangleChecks.map(([field]) => field) })
  }
  return <section className="tool-triangle-lab"><header><span>HTTP TOOL TRIANGLE</span><h2>같은 정상 요청, 다른 관찰 지점</h2><p>세 패널은 고정된 CodeCureLAB training 메시지입니다. 실제 네트워크 요청이나 값 변경을 수행하지 않습니다.</p></header><div className="tool-triangle-grid"><section><span>CURL · BASELINE</span><pre>{'$ curl -i https://training.local/api/profile\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{"id":"student-102"}'}</pre><p>명령과 원문 기준선을 남긴다.</p></section><section><span>DEVTOOLS · BROWSER</span><pre>{'Request URL: https://training.local/api/profile\nMethod: GET\nInitiator: profile.js\nStatus: 200\nCookie: [REDACTED]'}</pre><p>브라우저가 만든 요청과 initiator를 본다.</p></section><section><span>BURP · IN-SCOPE</span><pre>{'Proxy history\nGET /api/profile\nHost: training.local\nCookie: [REDACTED]\n\nRepeater: compare a selected training request'}</pre><p>허가된 요청을 기록·비교한다.</p></section></div><div className="tool-triangle-checks">{toolTriangleChecks.map(([id, label]) => <label key={id}><input type="checkbox" checked={Boolean(checked[id])} onChange={() => toggle(id)} /><span>{label}</span></label>)}</div><footer><span>{Object.values(checked).filter(Boolean).length} / {toolTriangleChecks.length} 비교 항목</span>{toolTriangleChecks.every(([id]) => checked[id]) && <strong><CheckCircle2 size={16} />Tool Triangle 기록 완료</strong>}</footer></section>
}

function RequestEditorLab({ state, updateLab, onPass }) {
  const [quantity, setQuantity] = useState(state.quantity ?? 1)
  const [result, setResult] = useState(state.result || null)
  const request = `POST /api/order HTTP/1.1\nHost: training.local\nContent-Type: application/json\nCookie: TRAINING_SESSION=[REDACTED]\n\n{"item":"SEC-BOOK","quantity":${quantity}}`
  const run = () => {
    const valid = Number(quantity) >= 1 && Number(quantity) <= 5
    const next = valid ? { status: 201, body: `{"accepted":true,"quantity":${quantity},"total":${quantity * 12000}}` } : { status: 400, body: '{"error":"quantity must be between 1 and 5"}' }
    setResult(next); updateLab({ quantity: Number(quantity), result: next, changed: Number(quantity) !== 1 })
    if (Number(quantity) !== 1) onPass({ original: 1, modified: Number(quantity), responseStatus: next.status })
  }
  return <section className="request-editor-lab"><header><span>LOCAL REQUEST EDITOR</span><h2>클라이언트 값 하나 바꾸기</h2><p>정상 요청을 기준선으로 두고 `quantity`만 변경합니다. 서버는 UI 제한과 별도로 범위를 검증합니다.</p></header><div className="request-split"><div><div className="editor-title"><span>REQUEST</span><label>quantity <input type="number" min="-10" max="500" value={quantity} onChange={(event) => { setQuantity(event.target.value); setResult(null) }} /></label></div><pre>{request}</pre><button className="button primary" type="button" onClick={run}><Play size={15} />로컬 요청 실행</button></div><div><div className="editor-title"><span>RESPONSE</span>{result && <b>HTTP {result.status}</b>}</div>{result ? <pre>{`HTTP/1.1 ${result.status} ${result.status === 201 ? 'Created' : 'Bad Request'}\nContent-Type: application/json\n\n${result.body}`}</pre> : <div className="editor-empty">요청을 실행하면 응답이 표시됩니다.</div>}</div></div>{Number(quantity) !== 1 && <div className="request-diff"><span>DIFF</span><code>- "quantity": 1</code><code>+ "quantity": {quantity}</code><p>브라우저 입력 제한은 요청 변조를 막지 못합니다. 서버의 `1 ≤ quantity ≤ 5` 검증이 신뢰 경계입니다.</p></div>}</section>
}

const httpLines = [
  ['POST /login HTTP/1.1', '요청선'], ['Host: training.local', '요청 헤더'], ['Content-Type: application/json', '요청 헤더'], ['{"id":"student","password":"[REDACTED]"}', '요청 본문'],
  ['HTTP/1.1 302 Found', '상태선'], ['Set-Cookie: TRAINING_SESSION=[REDACTED]; HttpOnly; Secure; SameSite=Lax', '응답 헤더'], ['Location: /dashboard', '응답 헤더'], ['{"next":"/dashboard"}', '응답 본문'],
]
function HttpLabelLab({ state, updateLab, onPass }) {
  const answers = state.answers || {}; const [checked, setChecked] = useState(false)
  const score = httpLines.filter(([, answer], index) => answers[index] === answer).length
  const verify = () => { setChecked(true); if (score >= 7) onPass({ score, total: 8 }) }
  return <section className="http-label-lab"><header><span>MESSAGE ANATOMY</span><h2>HTTP 메시지 라벨링</h2><p>방향, 첫 줄, 빈 줄 위·아래를 기준으로 분류합니다.</p></header><div>{httpLines.map(([line, answer], index) => <label className={checked ? (answers[index] === answer ? 'correct' : 'wrong') : ''} key={`${line}-${index}`}><span>{index < 4 ? 'REQ' : 'RES'}</span><code>{line}</code><select value={answers[index] || ''} onChange={(event) => { setChecked(false); updateLab({ answers: { ...answers, [index]: event.target.value } }) }}><option value="">라벨 선택</option><option>요청선</option><option>요청 헤더</option><option>요청 본문</option><option>상태선</option><option>응답 헤더</option><option>응답 본문</option></select><ChevronDown size={13} /></label>)}</div><footer><span>{checked ? `${score} / 8` : `${Object.keys(answers).length} / 8 라벨`}</span><button className="button primary" type="button" disabled={Object.keys(answers).length < 8} onClick={verify}>라벨 확인</button></footer></section>
}

function CookieLab({ state, updateLab, onPass }) {
  const settings = state.settings || { secure: true, httpOnly: true, sameSite: 'Lax' }
  const set = (field, value) => updateLab({ settings: { ...settings, [field]: value }, observed: false })
  const observe = () => { updateLab({ observed: true }); onPass({ settings }) }
  return <section className="cookie-lab"><header><span>COOKIE ATTRIBUTES</span><h2>TRAINING_SESSION 속성 실험</h2><p>각 속성이 영향을 주는 조건과 막지 못하는 영역을 구분합니다.</p></header><div className="cookie-controls"><label><input type="checkbox" checked={settings.secure} onChange={(event) => set('secure', event.target.checked)} /><span><strong>Secure</strong><small>HTTPS 요청에서만 전송</small></span></label><label><input type="checkbox" checked={settings.httpOnly} onChange={(event) => set('httpOnly', event.target.checked)} /><span><strong>HttpOnly</strong><small>JavaScript 쿠키 읽기 제한</small></span></label><label><span><strong>SameSite</strong><small>교차 사이트 전송 정책</small></span><select value={settings.sameSite} onChange={(event) => set('sameSite', event.target.value)}><option>Strict</option><option>Lax</option><option>None</option></select><ChevronDown size={14} /></label></div><div className="cookie-observations"><div><span>HTTP 요청</span><strong>{settings.secure ? 'Cookie 전송 안 함' : 'Cookie 전송 가능'}</strong><small>Secure가 {settings.secure ? '켜져' : '꺼져'} 있습니다.</small></div><div><span>document.cookie</span><strong>{settings.httpOnly ? 'TRAINING_SESSION 보이지 않음' : 'TRAINING_SESSION 읽기 가능'}</strong><small>HttpOnly는 XSS 실행 자체를 막지 않습니다.</small></div><div><span>외부 사이트의 top-level GET</span><strong>{settings.sameSite === 'Strict' ? '전송 제한' : settings.sameSite === 'Lax' ? '일부 전송 가능' : '전송 가능'}</strong><small>SameSite={settings.sameSite}</small></div><div><span>같은 Origin의 사용자 동작</span><strong>속성과 무관하게 권한 검증 필요</strong><small>서버 측 인가를 대신하지 않습니다.</small></div></div><footer><button className="button primary" type="button" onClick={observe}><Eye size={15} />관찰표 저장</button></footer></section>
}

const sourceSinkExamples = [
  ['const value = location.hash.slice(1);\nresult.innerHTML = value;', '위험', 'location.hash → innerHTML'],
  ['const value = input.value;\nresult.textContent = value;', '안전', 'form input → textContent'],
  ['const name = localStorage.getItem("name");\ndocument.write(name);', '위험', 'localStorage → document.write'],
  ['const data = await response.json();\nlabel.append(document.createTextNode(data.title));', '안전', 'API response → createTextNode'],
  ['const next = new URLSearchParams(location.search).get("next");\nlink.href = next;', '위험', 'query → URL 속성, scheme 검증 없음'],
]
function SourceSinkLab({ state, updateLab, onPass }) {
  const answers = state.answers || {}; const [checked, setChecked] = useState(false)
  const score = sourceSinkExamples.filter(([, answer], index) => answers[index] === answer).length
  const verify = () => { setChecked(true); if (score >= 4) onPass({ score, total: 5 }) }
  return <section className="source-sink-lab"><header><span>TAINT TRACE</span><h2>Source → Sink 5개</h2><p>외부 데이터가 마지막에 전달되는 API와 브라우저 컨텍스트를 확인합니다.</p></header>{sourceSinkExamples.map(([code, answer, flow], index) => <article key={code}><span>{String(index + 1).padStart(2, '0')}</span><pre><code>{code}</code></pre><div><button type="button" className={answers[index] === '안전' ? 'selected' : ''} onClick={() => { setChecked(false); updateLab({ answers: { ...answers, [index]: '안전' } }) }}>안전한 흐름</button><button type="button" className={answers[index] === '위험' ? 'selected' : ''} onClick={() => { setChecked(false); updateLab({ answers: { ...answers, [index]: '위험' } }) }}>위험한 흐름</button></div>{checked && <p className={answers[index] === answer ? 'correct' : 'wrong'}><strong>{answers[index] === answer ? '판단 일치' : `정답: ${answer}`}</strong>{flow}</p>}</article>)}<footer><span>{checked ? `${score} / 5` : 'Source와 Sink를 표시한 뒤 판단하세요.'}</span><button className="button primary" type="button" disabled={Object.keys(answers).length < 5} onClick={verify}>흐름 확인</button></footer></section>
}

const threatFields = [['asset', '보호할 자산', '검색 기록, 로그인한 사용자 데이터, 검색 결과 무결성'], ['inputs', '사용자 입력 지점', 'q query, 검색 필터, 정렬 값'], ['boundary', '신뢰 경계', '브라우저 ↔ 서버, 애플리케이션 ↔ DB'], ['surface', '예상 공격 표면', '검색어 출력, API query, 오류 메시지'], ['controls', '필요한 통제', '출력 인코딩, 매개변수화, 서버 인가, 로그']]
function ThreatModelLab({ state, updateLab, onPass }) {
  const fields = state.fields || {}
  const update = (id, value) => { const next = { ...fields, [id]: value }; updateLab({ fields: next }); if (Object.values(next).filter((item) => item.trim().length >= 15).length === 5) onPass({ fields: 5 }) }
  return <section className="threat-model-lab"><header><span>MINI THREAT MODEL</span><h2>로컬 검색 페이지</h2><p>취약점 이름부터 고르지 않고 자산과 데이터 흐름에서 공격 표면을 찾습니다.</p></header><div className="threat-diagram"><span>브라우저<small>q, Cookie</small></span><ArrowRight size={18} /><span>검색 API<small>인증·입력 처리</small></span><ArrowRight size={18} /><span>Database<small>문서·권한</small></span></div>{threatFields.map(([id, label, placeholder], index) => <label key={id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{label}</strong><textarea rows="3" value={fields[id] || ''} onChange={(event) => update(id, event.target.value)} placeholder={placeholder} /></div></label>)}</section>
}

const xssPacketLabData = {
  reflected: {
    kicker: 'REFLECTED XSS · HTTP REQUEST/RESPONSE',
    title: '현재 요청의 값이 같은 응답에 반사되는 지점 찾기',
    description: '요청 query와 바로 이어지는 HTTP 응답을 비교해 브라우저가 값을 텍스트와 HTML 중 무엇으로 해석하는지 확인합니다.',
    exampleTitle: 'Reflected XSS가 발생하는 한 요청',
    examplePanels: [
      { label: '01 · HTTP REQUEST', content: 'GET /search?q=%3Cimg%20src%3Dx%20onerror%3D%22document.body.dataset.training%3Dtriggered%22%3E HTTP/1.1\nHost: training.local\nAccept: text/html\nCookie: training_session=[REDACTED]\nUser-Agent: TrainingBrowser/1.0' },
      { label: '02 · HTTP RESPONSE', content: 'HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\nCache-Control: no-store\n\n<div id="result">\n  검색어: <img src=x onerror="document.body.dataset.training=triggered">\n</div>' },
    ],
    triggerCode: 'result.innerHTML = `검색어: ${query}`',
    triggerBody: 'Source인 query가 HTML을 해석하는 Sink인 innerHTML로 들어갑니다. 응답의 요소와 이벤트 속성이 일반 글자가 아니라 HTML 문법으로 파싱되는 순간이 실패 지점입니다.',
    trace: [
      ['Source', '요청 query parameter `q`'],
      ['Transform', 'URL decoding과 검색 결과 문장 결합'],
      ['Sink', '`innerHTML`에 문자열 전달'],
      ['Browser interpretation', 'HTML parser가 요소와 이벤트 속성으로 해석'],
    ],
    cases: [
      { id: 'plain-search', label: '패킷 A', answer: 'normal', packet: 'GET /search?q=week02 HTTP/1.1\nHost: training.local\nAccept: text/html\nCookie: training_session=[REDACTED]\n\nHTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\n\n<div id="result">검색어: week02</div>', reason: '입력값이 일반 텍스트로 표시되고 새 HTML 요소나 실행 속성이 만들어지지 않습니다.' },
      { id: 'encoded-markup', label: '패킷 B', answer: 'normal', packet: 'GET /search?q=%3Cb%3Eweek02%3C%2Fb%3E HTTP/1.1\nHost: training.local\nAccept: text/html\n\nHTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\n\n<div id="result">검색어: &lt;b&gt;week02&lt;/b&gt;</div>', reason: '요청에는 HTML 문법 문자가 있지만 응답에서 엔티티로 인코딩되어 화면의 텍스트로 남습니다.' },
      { id: 'reflected-handler', label: '패킷 C', answer: 'malicious', packet: 'GET /search?q=%3Cimg%20src%3Dx%20onerror%3D%22document.body.dataset.training%3Dtriggered%22%3E HTTP/1.1\nHost: training.local\nAccept: text/html\nCookie: training_session=[REDACTED]\n\nHTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\n\n<div id="result">검색어: <img src=x onerror="document.body.dataset.training=triggered"></div>', reason: 'query 값이 응답 HTML에 그대로 반사되어 브라우저가 `img` 요소와 이벤트 처리 속성으로 해석할 수 있습니다.' },
    ],
  },
  stored: {
    kicker: 'STORED XSS · WRITE/READ FLOW',
    title: '저장 요청과 나중의 조회 응답 사이에서 XSS 지점 찾기',
    description: '작성자의 저장 요청과 피해자의 조회 요청을 분리하고, 저장된 값이 최종 응답에서 어떤 문맥으로 출력되는지 확인합니다.',
    exampleTitle: '저장된 댓글이 나중의 화면에서 실행 문맥이 되는 흐름',
    examplePanels: [
      { label: '01 · SAVE REQUEST', content: 'POST /api/comments HTTP/1.1\nHost: training.local\nContent-Type: application/json\nCookie: training_session=[REDACTED]\n\n{"body":"<img src=x onerror=\\"document.body.dataset.training=triggered\\">"}' },
      { label: '02 · SAVE RESPONSE', content: 'HTTP/1.1 201 Created\nContent-Type: application/json\n\n{"commentId":42,"status":"saved"}' },
      { label: '03 · LATER VIEW RESPONSE', content: 'GET /posts/7 HTTP/1.1\nHost: training.local\nCookie: training_session=[REDACTED]\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<li class="comment"><img src=x onerror="document.body.dataset.training=triggered"></li>' },
    ],
    triggerCode: 'commentList.insertAdjacentHTML("beforeend", storedComment.body)',
    triggerBody: '저장 자체가 실행을 만들지는 않습니다. 나중의 조회에서 DB의 comment.body가 HTML Sink로 들어가고 피해자 브라우저가 요소와 이벤트 속성으로 해석하는 순간 Stored XSS가 성립합니다.',
    trace: [
      ['Source', '댓글 작성 요청의 JSON `body`'],
      ['Storage', '서버 DB의 comment record'],
      ['Sink', '조회 화면의 `insertAdjacentHTML`'],
      ['Victim browser', '나중의 방문에서 저장값을 HTML로 해석'],
    ],
    cases: [
      { id: 'stored-plain', label: '패킷 A', answer: 'normal', packet: 'POST /api/comments HTTP/1.1\nContent-Type: application/json\n\n{"body":"좋은 설명입니다."}\n\nGET /posts/7 HTTP/1.1\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<li class="comment">좋은 설명입니다.</li>', reason: '저장된 일반 문장이 조회 화면에서도 텍스트로 표시되며 실행 가능한 HTML 문법이 만들어지지 않습니다.' },
      { id: 'stored-encoded', label: '패킷 B', answer: 'normal', packet: 'POST /api/comments HTTP/1.1\nContent-Type: application/json\n\n{"body":"<b>중요</b>"}\n\nGET /posts/7 HTTP/1.1\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<li class="comment">&lt;b&gt;중요&lt;/b&gt;</li>', reason: '저장값에 태그 모양이 있어도 조회 응답에서 출력 인코딩되어 일반 텍스트로 남습니다.' },
      { id: 'stored-handler', label: '패킷 C', answer: 'malicious', packet: 'POST /api/comments HTTP/1.1\nContent-Type: application/json\nCookie: training_session=[REDACTED]\n\n{"body":"<img src=x onerror=\\"document.body.dataset.training=triggered\\">"}\n\nGET /posts/7 HTTP/1.1\nCookie: victim_session=[REDACTED]\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<li class="comment"><img src=x onerror="document.body.dataset.training=triggered"></li>', reason: '작성자의 값이 저장됐다가 다른 조회 응답에 인코딩 없이 포함되어 피해자 브라우저의 HTML 문맥에서 해석됩니다.' },
    ],
  },
  dom: {
    kicker: 'DOM-BASED XSS · CLIENT-SIDE FLOW',
    title: 'HTTP 응답 밖의 브라우저 Source와 DOM Sink 찾기',
    description: 'fragment가 서버 요청에 보이지 않는다는 점과, 응답을 받은 뒤 클라이언트 JavaScript가 live DOM을 바꾸는 과정을 분리합니다.',
    exampleTitle: '서버 응답은 고정이지만 실행 후 DOM이 달라지는 흐름',
    examplePanels: [
      { label: '01 · ADDRESS/REQUEST', content: 'Browser URL:\nhttps://training.local/preview#%3Cimg%20src%3Dx%20onerror%3D%22document.body.dataset.training%3Dtriggered%22%3E\n\nHTTP request:\nGET /preview HTTP/1.1\nHost: training.local\n\n#fragment는 요청에 포함되지 않음' },
      { label: '02 · HTTP RESPONSE', content: 'HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\n\n<div id="preview"></div>\n<script src="/static/preview.js"></script>' },
      { label: '03 · CLIENT CODE/LIVE DOM', content: 'const value = decodeURIComponent(location.hash.slice(1));\npreview.innerHTML = value;\n\nLive DOM:\n<div id="preview"><img src="x" onerror="document.body.dataset.training=triggered"></div>' },
    ],
    triggerCode: 'preview.innerHTML = decodeURIComponent(location.hash.slice(1))',
    triggerBody: '서버 응답 원문에는 fragment 값이 없습니다. 브라우저의 location.hash가 Source가 되고 innerHTML이 Sink가 되어, 실행 후 live DOM에서 요소와 이벤트 속성이 만들어지는 순간이 실패 지점입니다.',
    trace: [
      ['Browser Source', '`location.hash`의 fragment 값'],
      ['Transform', '`decodeURIComponent`로 문자열 변환'],
      ['DOM Sink', '`preview.innerHTML`에 전달'],
      ['Live DOM', '브라우저가 새 요소와 이벤트 속성을 생성'],
    ],
    cases: [
      { id: 'dom-text', label: '흐름 A', answer: 'normal', packet: 'Browser URL: https://training.local/preview#week02\n\nGET /preview HTTP/1.1\nHost: training.local\n\nHTTP/1.1 200 OK\n\n<div id="preview"></div>\n<script>preview.textContent = decodeURIComponent(location.hash.slice(1))</script>\n\nLive DOM: <div id="preview">week02</div>', reason: 'fragment 값은 브라우저에서 읽지만 textContent에 전달되어 텍스트 노드로만 만들어집니다.' },
      { id: 'dom-api-text', label: '흐름 B', answer: 'normal', packet: 'Browser URL: https://training.local/profile?name=%3Cb%3Ekim%3C%2Fb%3E\n\nHTTP/1.1 200 OK\n\n<span id="name"></span>\n<script>name.append(document.createTextNode(new URLSearchParams(location.search).get("name")))</script>\n\nLive DOM: <span id="name">&lt;b&gt;kim&lt;/b&gt;</span>', reason: '외부 값이 createTextNode를 거쳐 텍스트 노드가 되므로 태그 모양이 HTML 요소로 해석되지 않습니다.' },
      { id: 'dom-inner-html', label: '흐름 C', answer: 'malicious', packet: 'Browser URL: https://training.local/preview#%3Cimg%20src%3Dx%20onerror%3D%22document.body.dataset.training%3Dtriggered%22%3E\n\nGET /preview HTTP/1.1\nHost: training.local\n\nHTTP/1.1 200 OK\n\n<div id="preview"></div><script src="preview.js"></script>\n\npreview.js: preview.innerHTML = decodeURIComponent(location.hash.slice(1))\nLive DOM: <div id="preview"><img src="x" onerror="document.body.dataset.training=triggered"></div>', reason: 'HTTP 응답 원문에는 값이 없지만 location.hash가 innerHTML로 들어가 live DOM에서 실행 문맥이 만들어집니다.' },
    ],
  },
}

function XssPacketClassifierLab({ lab, state, updateLab, onPass }) {
  const packetLab = xssPacketLabData[lab.packetVariant] || xssPacketLabData.reflected
  const xssPacketCases = packetLab.cases
  const answers = state.packetAnswers || {}
  const checked = Boolean(state.packetChecked)
  const answeredAll = xssPacketCases.every((packet) => answers[packet.id])
  const score = xssPacketCases.filter((packet) => answers[packet.id] === packet.answer).length
  const choose = (packetId, value) => updateLab({
    packetAnswers: { ...answers, [packetId]: value },
    packetChecked: false,
    packetOutcome: null,
    validationPassed: false,
    validation: null,
    validatedAt: null,
  })
  const verify = () => {
    const passed = answeredAll && score === xssPacketCases.length
    updateLab({ packetChecked: true, packetOutcome: passed ? 'passed' : 'retry', packetCheckedAt: new Date().toISOString() })
    if (passed) onPass({ score, total: xssPacketCases.length, classified: xssPacketCases.map((packet) => packet.id) })
  }

  return <section className="xss-packet-lab">
    <header><div><span>TRAINING-ONLY · {packetLab.kicker}</span><h2>{packetLab.title}</h2><p>{packetLab.description}</p></div><ShieldCheck size={24} /></header>
    <section className="xss-packet-example">
      <header><span>WORKED EXAMPLE</span><h3>{packetLab.exampleTitle}</h3><p>아래 문자열은 실행하지 않는 정적 교육 자료이며 Cookie 값은 마스킹했습니다.</p></header>
      <div className="xss-packet-grid">
        {packetLab.examplePanels.map((panel) => <article key={panel.label}><span>{panel.label}</span><pre><code>{panel.content}</code></pre></article>)}
      </div>
      <div className="xss-trigger-line"><strong>터지는 지점</strong><code>{packetLab.triggerCode}</code><p>{packetLab.triggerBody}</p></div>
      <ol className="xss-packet-trace">{packetLab.trace.map(([label, body], index) => <li key={label}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{label}</strong><p>{body}</p></div></li>)}</ol>
    </section>
    <fieldset className="xss-packet-test">
      <legend>패킷 판별 테스트 · 정상 2개, 악성 1개</legend>
      <p>요청 문자열만 보고 판단하지 말고 응답에서 값이 텍스트로 남았는지 HTML 문법으로 해석되는지 확인하세요.</p>
      {xssPacketCases.map((packet) => {
        const correct = answers[packet.id] === packet.answer
        return <article className={checked ? (correct ? 'correct' : 'wrong') : ''} key={packet.id}>
          <header><strong>{packet.label}</strong>{checked && <span>{correct ? <><Check size={14} />판단 일치</> : <><AlertTriangle size={14} />다시 확인</>}</span>}</header>
          <pre><code>{packet.packet}</code></pre>
          <div><label><input type="radio" name={`${packet.id}-classification`} checked={answers[packet.id] === 'normal'} onChange={() => choose(packet.id, 'normal')} /><span>정상</span></label><label><input type="radio" name={`${packet.id}-classification`} checked={answers[packet.id] === 'malicious'} onChange={() => choose(packet.id, 'malicious')} /><span>악성</span></label></div>
          {checked && <p>{packet.reason}</p>}
        </article>
      })}
      <footer><p aria-live="polite">{checked ? `${score} / ${xssPacketCases.length} · ${score === xssPacketCases.length ? '모든 패킷을 정확히 판별했습니다.' : '응답의 출력 문맥을 다시 확인하세요.'}` : '세 패킷을 모두 분류한 뒤 결과를 확인하세요.'}</p><button className="button primary" type="button" disabled={!answeredAll} onClick={verify}>판별 결과 확인<CheckCircle2 size={16} /></button></footer>
    </fieldset>
  </section>
}

const xssData = {
  'xss-reflected': {
    title: '검색어 반사', sourceLabel: 'GET query q', request: 'GET /search?q=UNIQUE_MARKER HTTP/1.1\nHost: training.local', vulnerable: 'return `<section>검색 결과: ${q}</section>`;', fixed: 'return <section>검색 결과: {q}</section>; // auto-escape', response: '<section>검색 결과: UNIQUE_MARKER</section>', preview: '검색 결과: UNIQUE_MARKER', transform: '요청 파싱 → 템플릿 렌더링', note: '현재 요청의 q가 같은 응답에 포함됩니다.',
  },
  'xss-stored': {
    title: '게시글 저장', sourceLabel: 'POST body title', request: 'POST /board HTTP/1.1\nContent-Type: application/json\n\n{"title":"UNIQUE_MARKER"}', vulnerable: 'list.innerHTML += `<li>${post.title}</li>`;', fixed: 'const li = document.createElement("li");\nli.textContent = post.title;\nlist.append(li);', response: 'DB: { title: "UNIQUE_MARKER" }\nGET /board → <li>UNIQUE_MARKER</li>', preview: '게시글 목록 · UNIQUE_MARKER', transform: '입력 → training store → 재조회 → 목록 렌더링', note: '작성 시점과 목록을 연 피해자 실행 시점이 다릅니다.',
  },
  'xss-dom': {
    title: 'fragment와 innerHTML', sourceLabel: 'location.hash', request: 'GET /dom-fragment HTTP/1.1\nHost: training.local\n\n#UNIQUE_MARKER는 서버 요청에 포함되지 않음', vulnerable: 'const value = decodeURIComponent(location.hash.slice(1));\nresult.innerHTML = value;', fixed: 'const value = decodeURIComponent(location.hash.slice(1));\nresult.textContent = value;', response: '<div id="result"></div>\n<script src="render.js"></script>', preview: '실행 후 DOM · <div id="result">UNIQUE_MARKER</div>', transform: 'fragment 읽기 → decodeURIComponent → render()', note: '서버 응답 원문에는 fragment 값이 없을 수 있습니다.',
  },
  'xss-filtering': {
    title: '잘못된 필터', sourceLabel: '게시글 본문', request: 'POST /board HTTP/1.1\n\n{"body":"[고정 교육 예시]"}', vulnerable: 'const filtered = input.replace("script", "");\npreview.innerHTML = filtered;', fixed: 'preview.textContent = input;\n// HTML이 필요하면 검증된 Sanitizer 정책 사용', response: '필터는 특정 소문자 문자열만 제거\n브라우저가 해석하는 전체 HTML 문법은 그대로 남음', preview: '문자열 블랙리스트는 컨텍스트 분리를 대신하지 못함', transform: '특정 문자열 제거 → HTML 출력', note: '우회 문자열 목록이 아니라 검증 위치와 파서 차이를 봅니다.',
  },
}

const xssContextData = {
  attribute: {
    label: 'HTML Attribute', title: '따옴표 속성 컨텍스트',
    request: 'GET /profile?label=UNIQUE_MARKER HTTP/1.1\nHost: training.local',
    response: '<input placeholder="UNIQUE_MARKER">', preview: 'placeholder = UNIQUE_MARKER',
    vulnerable: 'input.outerHTML = `<input placeholder="${label}">`;',
    fixed: 'input.setAttribute("placeholder", label);\n// 프레임워크의 안전한 속성 바인딩도 사용 가능',
    note: 'HTML 본문과 속성 값은 파서 컨텍스트가 다릅니다. 고정 마커가 따옴표 안에서 어떻게 해석되는지만 비교합니다.',
    comparison: '허용된 속성에 DOM API로 값을 설정하고, 이벤트 처리 속성처럼 코드로 해석되는 위치에는 신뢰할 수 없는 값을 넣지 않습니다.',
  },
  url: {
    label: 'URL · Scheme', title: 'URL 속성과 scheme allowlist',
    request: 'GET /link?next=UNIQUE_MARKER HTTP/1.1\nHost: training.local',
    response: '<a id="next-link">다음 페이지</a>', preview: '차단된 scheme · 안전한 링크를 만들지 않음',
    vulnerable: 'nextLink.href = next;',
    fixed: 'const url = new URL(next, location.origin);\nif (["http:", "https:"].includes(url.protocol)) nextLink.href = url.href;',
    note: 'HTML 인코딩만으로 URL scheme이 안전해지지 않습니다. URL 파싱 뒤 허용할 scheme과 origin을 별도로 검사합니다.',
    comparison: '고정 예시는 실제 링크를 만들지 않고 `https:` 또는 상대 경로가 허용되는 판단 결과만 표시합니다.',
  },
  'js-data': {
    label: 'JavaScript Data', title: 'JavaScript 코드와 데이터 분리',
    request: 'GET /dashboard HTTP/1.1\nHost: training.local\n\nprofile.name = UNIQUE_MARKER',
    response: '<script type="application/json" id="profile-data">{"name":"UNIQUE_MARKER"}</script>', preview: 'profile.name = UNIQUE_MARKER · 텍스트 출력',
    vulnerable: 'const name = "${profile.name}"; // inline script 문자열 결합',
    fixed: 'const data = JSON.parse(document.querySelector("#profile-data").textContent);\nlabel.textContent = data.name;',
    note: '서버 데이터를 실행 코드 문자열에 결합하지 않고 JSON 데이터로 직렬화한 뒤 안전한 DOM API로 출력합니다.',
    comparison: '`JSON.stringify` 하나만 믿지 않고 HTML parser 경계와 script 종료 문자열 처리까지 프레임워크 지침을 따릅니다.',
  },
  sanitizer: {
    label: 'Sanitizer', title: 'Sanitizer 정책 적용 전·후',
    request: 'POST /preview HTTP/1.1\nContent-Type: application/json\n\n{"content":"[고정 서식 예시 + UNIQUE_MARKER]"}',
    response: 'policy: 허용 태그 strong, em, p\n제거: 이벤트 속성, 허용되지 않은 URL scheme', preview: '허용된 고정 서식과 UNIQUE_MARKER만 남음',
    vulnerable: 'preview.innerHTML = content;',
    fixed: 'const clean = sanitizer.sanitizeFor("div", content);\npreview.replaceChildren(clean);',
    note: 'HTML 기능이 반드시 필요할 때만 검증된 Sanitizer와 좁은 정책을 사용합니다. 일반 텍스트에는 textContent가 우선입니다.',
    comparison: '고정 입력의 정책 적용 전·후를 비교하고, 라이브러리 버전·정책 변경 뒤 회귀 테스트가 필요함을 기록합니다.',
  },
  csp: {
    label: 'CSP', title: '실행 차단과 원인 제거 구분',
    request: 'GET /search?q=UNIQUE_MARKER HTTP/1.1\nHost: training.local',
    response: "Content-Security-Policy: default-src 'self'; script-src 'nonce-training'\n\n<div id=\"result\">UNIQUE_MARKER</div>", preview: 'CSP 차단 로그와 안전한 Sink 재시험을 별도로 확인',
    vulnerable: 'result.innerHTML = value; // 위험 Sink는 그대로 남아 있음',
    fixed: 'result.textContent = value; // 원인을 제거\n// CSP는 보조 통제로 계속 운영',
    note: 'CSP가 특정 실행을 막아도 신뢰할 수 없는 데이터가 위험 Sink에 도달하는 원인은 남을 수 있습니다.',
    comparison: 'PoC 단계는 CSP 차단 상태, 수정 재시험은 위험 Sink 제거 상태입니다. 두 결과를 같은 의미로 쓰지 않습니다.',
  },
}

const xssContextOptions = [
  ['body', 'HTML Body'], ['attribute', 'Attribute'], ['url', 'URL'], ['js-data', 'JS Data'], ['sanitizer', 'Sanitizer'], ['csp', 'CSP'],
]

function XssLab({ lab, state, updateLab, onPass }) {
  const baseData = xssData[lab.kind]
  const [mode, setMode] = useState(state.mode || 'marker')
  const [contextMode, setContextMode] = useState(state.contextMode || 'body')
  const data = contextMode === 'body' ? { ...baseData, label: 'HTML Body', comparison: '입력이 HTML body에서 텍스트인지 마크업인지 구분하고, 기본 escaping 또는 안전한 텍스트 Sink로 수정합니다.' } : xssContextData[contextMode]
  const trace = buildXssTrace(lab.kind, mode, contextMode)
  const runs = state.runs || {}
  const contextsViewed = state.contextsViewed || { body: true }
  const setAndRun = (nextMode) => {
    setMode(nextMode)
    const nextRuns = { ...runs, [nextMode]: true }
    updateLab({ mode: nextMode, runs: nextRuns })
    if (nextRuns.marker && nextRuns.poc && nextRuns.fixed) onPass({ trace: lab.kind, marker: true, harmlessPoc: true, retest: true })
  }
  const changeContext = (nextContext) => {
    setContextMode(nextContext)
    updateLab({ contextMode: nextContext, contextsViewed: { ...contextsViewed, [nextContext]: true } })
  }
  const framePolicy = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:">';
  const previewContent = mode === 'fixed'
    ? `${framePolicy}<main style="font:16px system-ui;padding:24px"><p>${escapeHtml(data.preview)}</p><small style="color:#2e7d5b">텍스트로 렌더링 · 실행 없음</small></main>`
    : mode === 'poc'
      ? `${framePolicy}<main style="font:16px system-ui;padding:24px"><div style="border:2px solid #c97a20;padding:16px"><strong>${contextMode === 'csp' ? 'CSP_BLOCKED 표시' : 'TRAINING_POC 실행 표시'}</strong><p>고정된 무해한 시뮬레이션입니다.</p></div></main>`
      : `${framePolicy}<main style="font:16px system-ui;padding:24px"><p>${escapeHtml(data.preview)}</p><small>고유 마커 위치만 확인</small></main>`
  return <section className="xss-lab"><header><div><span>TRAINING-ONLY · XSS TRACE</span><h2>{baseData.title}</h2><p>{data.title} · {data.note}</p></div><div className="xss-mode"><button type="button" className={mode === 'marker' ? 'active' : ''} onClick={() => setAndRun('marker')}>1. 마커</button><button type="button" className={mode === 'poc' ? 'active' : ''} onClick={() => setAndRun('poc')}>2. 무해한 PoC</button><button type="button" className={mode === 'fixed' ? 'active' : ''} onClick={() => setAndRun('fixed')}>3. 수정 재시험</button></div></header><div className="xss-context-tabs" role="group" aria-label="XSS 출력 컨텍스트">{xssContextOptions.map(([id, label]) => <button type="button" aria-pressed={contextMode === id} className={contextMode === id ? 'active' : ''} key={id} onClick={() => changeContext(id)}>{contextsViewed[id] && <Check size={13} />}{label}</button>)}</div><div className="xss-simulation-note"><LockKeyhole size={17} /><p>사용자 페이로드를 실행하지 않습니다. 미리보기는 `sandbox` iframe에서 고정된 결과만 보여주며 네트워크 전송·쿠키 접근·키 입력 수집 기능이 없습니다.</p></div><div className="xss-three-panel"><section><header><span>INPUT · HTTP</span><strong>요청과 응답</strong></header><pre><code>{data.request}</code></pre><div className="response-block"><span>RESPONSE / STORAGE</span><pre>{data.response}</pre></div></section><section><header><span>DATA FLOW</span><strong>Source → Sink</strong></header><div className="xss-flow"><FlowStep index="01" label="Source" value={trace.source} /><FlowStep index="02" label="전송" value={trace.transport} /><FlowStep index="03" label="처리" value={trace.transform} /><FlowStep index="04" label="Sink" value={trace.sink} /><FlowStep index="05" label="Context" value={trace.context} /><FlowStep index="06" label="실행·영향" value={trace.execution} last /></div></section><section><header><span>ISOLATED PREVIEW</span><strong>렌더링 결과</strong></header><iframe title={`${data.title} 격리 미리보기`} sandbox="" srcDoc={previewContent} /><dl><div><dt>취약점 원인</dt><dd>{mode === 'fixed' ? '재시험에서 위험 Sink 제거' : 'Source가 위험 Sink에 도달'}</dd></div><div><dt>영향 확인</dt><dd>{mode === 'poc' ? (contextMode === 'csp' ? 'CSP 차단과 원인 잔존을 구분' : '고정 문자열 표시만 확인') : mode === 'fixed' ? '실행 없음' : '아직 확인하지 않음'}</dd></div></dl></section></div>{lab.kind === 'xss-dom' && contextMode === 'body' && <div className="dom-compare"><section><span>SERVER RESPONSE HTML</span><pre><code>{data.response}</code></pre></section><ArrowRight size={18} /><section><span>EXECUTED DOM</span><pre><code>{mode === 'fixed' ? '<div id="result">&lt;고정 입력&gt;</div>' : '<div id="result">[브라우저가 만든 DOM]</div>'}</code></pre></section></div>}<div className="xss-context-guidance"><strong>{data.title}</strong><p>{data.comparison}</p></div><div className="code-diff" aria-label="취약 코드와 수정 코드 비교"><section><span>VULNERABLE</span><pre><code>{data.vulnerable}</code></pre></section><section><span>FIXED</span><pre><code>{data.fixed}</code></pre></section></div><footer className="xss-run-status">{['marker', 'poc', 'fixed'].map((item, index) => <span className={runs[item] ? 'done' : ''} key={item}>{runs[item] ? <Check size={14} /> : index + 1}{item === 'marker' ? '마커 위치' : item === 'poc' ? '무해한 실행' : '수정 재시험'}</span>)}</footer></section>
}

function FlowStep({ index, label, value, last }) { return <div className="flow-step"><span>{index}</span><div><small>{label}</small><strong>{value}</strong></div>{!last && <ArrowDown size={15} />}</div> }

function normalizeGuidedObservationScenario(scenario) {
  if (!scenario || typeof scenario !== 'object' || Array.isArray(scenario)) return null
  if (!Array.isArray(scenario.steps) || scenario.steps.length === 0) return null

  const steps = scenario.steps.map((step) => {
    if (typeof step === 'string' && step.trim()) return step.trim()
    if (!step || typeof step !== 'object' || Array.isArray(step)) return null
    const title = typeof step.title === 'string' ? step.title.trim() : ''
    const body = typeof step.body === 'string' ? step.body.trim() : ''
    return title && body ? `${title}: ${body}` : title || body || null
  })
  if (steps.some((step) => !step)) return null
  if (!Array.isArray(scenario.evidenceOptions) || scenario.evidenceOptions.length === 0) return null

  const optionIds = new Set()
  const evidenceOptions = []
  for (const option of scenario.evidenceOptions) {
    if (!option || typeof option !== 'object' || Array.isArray(option) || typeof option.id !== 'string' || !option.id.trim() || typeof option.label !== 'string' || !option.label.trim() || optionIds.has(option.id)) return null
    optionIds.add(option.id)
    evidenceOptions.push({ id: option.id, label: option.label, detail: typeof option.detail === 'string' && option.detail.trim() ? option.detail.trim() : null })
  }

  if (!Array.isArray(scenario.correctEvidenceIds) || scenario.correctEvidenceIds.some((id) => typeof id !== 'string' || !optionIds.has(id))) return null
  const correctEvidenceIds = [...new Set(scenario.correctEvidenceIds)]
  if (correctEvidenceIds.length !== scenario.correctEvidenceIds.length) return null

  const artifacts = Array.isArray(scenario.artifacts) ? scenario.artifacts.map((artifact) => {
    if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) return null
    const title = typeof artifact.title === 'string' ? artifact.title.trim() : ''
    const body = typeof artifact.body === 'string' ? artifact.body.trim() : ''
    const code = typeof artifact.code === 'string' ? artifact.code.trim() : ''
    return title && (body || code) ? { title, body, code } : null
  }) : []
  if (artifacts.some((artifact) => !artifact)) return null

  const reflection = scenario.reflection && typeof scenario.reflection === 'object' && !Array.isArray(scenario.reflection)
    ? {
      prompt: typeof scenario.reflection.prompt === 'string' ? scenario.reflection.prompt.trim() : '',
      minimumLength: Number.isInteger(scenario.reflection.minimumLength) ? scenario.reflection.minimumLength : 0,
    }
    : null
  if (reflection && (!reflection.prompt || reflection.minimumLength < 20)) return null

  return {
    steps,
    evidenceOptions,
    correctEvidenceIds,
    artifacts,
    reflection,
    conclusion: typeof scenario.conclusion === 'string' && scenario.conclusion.trim() ? scenario.conclusion : null,
  }
}

function hasExactEvidenceSelection(selectedEvidenceIds, correctEvidenceIds) {
  const selected = [...new Set(Array.isArray(selectedEvidenceIds) ? selectedEvidenceIds.filter((id) => typeof id === 'string') : [])]
  return selected.length === correctEvidenceIds.length && selected.every((id) => correctEvidenceIds.includes(id))
}

function avoidLeadingAnswerPattern(options, correctIds) {
  const ordered = [...options]
  const count = correctIds.length
  const leadingOnly = count > 0 && ordered.slice(0, count).every((option) => correctIds.includes(option.id))
  if (!leadingOnly) return ordered
  const distractorIndex = ordered.findIndex((option) => !correctIds.includes(option.id))
  if (distractorIndex > 0) ordered.unshift(...ordered.splice(distractorIndex, 1))
  return ordered
}

function GuidedObservationLab({ lab, state, updateLab, onPass }) {
  const scenario = normalizeGuidedObservationScenario(lab.scenario)
  if (!scenario) return <section className="generic-lab" role="alert"><AlertTriangle size={24} /><h2>관찰 시나리오를 확인할 수 없습니다.</h2><p>필수 단계나 증거 데이터가 올바르지 않아 이 실습은 완료 처리할 수 없습니다.</p></section>

  const optionIds = new Set(scenario.evidenceOptions.map((option) => option.id))
  const selectedEvidenceIds = [...new Set(Array.isArray(state.selectedEvidenceIds) ? state.selectedEvidenceIds.filter((id) => typeof id === 'string' && optionIds.has(id)) : [])]
  const checked = Boolean(state.guidedObservationChecked)
  const exactMatch = hasExactEvidenceSelection(selectedEvidenceIds, scenario.correctEvidenceIds)
  const displayedEvidenceOptions = avoidLeadingAnswerPattern(scenario.evidenceOptions, scenario.correctEvidenceIds)
  const reflection = normalizeLearningText(state.guidedObservationReflection || '')
  const reflectionReady = !scenario.reflection || !validateLearningText(reflection, { minLength: scenario.reflection.minimumLength, label: '연결 근거' })
  const conclusion = scenario.conclusion || '선택한 관찰 근거를 기준으로 방어 조치를 적용한 뒤, 같은 합성 조건에서 재시험해 예상한 변화가 재현되는지 확인합니다.'
  const toggleEvidence = (id, selected) => {
    const next = selected ? [...selectedEvidenceIds, id] : selectedEvidenceIds.filter((selectedId) => selectedId !== id)
    updateLab({
      selectedEvidenceIds: next,
      guidedObservationChecked: false,
      validationPassed: false,
      validation: null,
      validatedAt: null,
    })
  }
  const verify = () => {
    const passed = exactMatch && reflectionReady
    updateLab({
      guidedObservationChecked: true,
      guidedObservationOutcome: passed ? 'passed' : 'retry',
      guidedObservationCheckedAt: new Date().toISOString(),
    })
    if (passed) onPass({ evidenceIds: selectedEvidenceIds, conclusion, ...(scenario.reflection ? { reflection } : {}) })
  }

  return <section className="generic-lab guided-observation-lab">
    <header><Eye size={24} /><div><span>GUIDED OBSERVATION</span><h2>합성 데이터 관찰</h2><p>이 실습은 브라우저에 포함된 합성 교육 데이터만 읽습니다. 외부 네트워크 요청, 실제 대상 접근, 사용자 데이터 수집은 수행하지 않습니다.</p></div></header>
    <section><h3>읽기 순서</h3><ol>{scenario.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol></section>
    {scenario.artifacts.length > 0 && <section className="guided-observation-artifacts"><h3>합성 관찰 전사</h3><p>아래 전사는 이 실습 안에서만 사용하는 고정 교육 자료입니다. 표시된 사실만 근거로 선택하세요.</p>{scenario.artifacts.map((artifact) => <article key={artifact.title}><h4>{artifact.title}</h4>{artifact.body && <p>{artifact.body}</p>}{artifact.code && <pre><code>{artifact.code}</code></pre>}</article>)}</section>}
    <fieldset>
      <legend>관찰한 증거 선택</legend>
      <p>읽기 순서에서 직접 확인한 사실만 고르세요. 추측이나 결론 자체는 증거로 선택하지 않습니다.</p>
      {displayedEvidenceOptions.map((option) => <label key={option.id}><input type="checkbox" checked={selectedEvidenceIds.includes(option.id)} onChange={(event) => toggleEvidence(option.id, event.target.checked)} /><span><strong>{option.label}</strong>{option.detail && <small>{option.detail}</small>}</span></label>)}
    </fieldset>
    {scenario.reflection && <section className="guided-observation-reflection"><h3>연결 근거</h3><label><span>{scenario.reflection.prompt}</span><textarea aria-label="연결 근거" rows="5" value={reflection} onChange={(event) => updateLab({ guidedObservationReflection: event.target.value, guidedObservationChecked: false, validationPassed: false, validation: null, validatedAt: null })} placeholder={`최소 ${scenario.reflection.minimumLength}자 이상으로 합성 자료 안의 근거만 연결해 적으세요.`} /></label><small>{getLearningTextLength(reflection)} / {scenario.reflection.minimumLength}자</small></section>}
    <section aria-live="polite"><h3>결과 판정</h3>{checked ? <p>{exactMatch && reflectionReady ? '선택한 증거와 연결 근거가 관찰 시나리오와 일치합니다.' : !exactMatch ? '선택한 증거 집합이 일치하지 않습니다. 읽기 순서와 증거의 직접성을 다시 확인하세요.' : `연결 근거를 ${scenario.reflection.minimumLength}자 이상으로 보완하세요.`}</p> : <p>증거를 선택한 뒤 결과를 판정하세요.</p>}<button className="button primary" type="button" onClick={verify}>결과 판정<CheckCircle2 size={16} /></button></section>
    <section><h3>방어·재시험 결론</h3><p>{conclusion}</p></section>
  </section>
}

function PatchReviewLab({ lab, state, updateLab, onPass }) {
  const [loadState, setLoadState] = useState({ status: 'loading', patch: null, lineage: null })
  useEffect(() => {
    let active = true
    const week = weekContent[lab.week]
    if (!week) {
      setLoadState({ status: 'error', patch: null, lineage: null })
      return () => { active = false }
    }
    loadDeepGuideModules(week.index, week.modules).then((modules) => {
      if (!active) return
      const module = modules.find((item) => item.id === lab.patchReview?.sourceModuleId)
      const patch = module?.blocks?.find((block) => block.type === 'patch-analysis') || null
      const lineage = module?.blocks?.find((block) => block.type === 'patch-lineage' && block.cve === lab.patchReview?.cve) || null
      setLoadState(patch && lineage ? { status: 'ready', patch, lineage } : { status: 'error', patch: null, lineage: null })
    }).catch(() => {
      if (active) setLoadState({ status: 'error', patch: null, lineage: null })
    })
    return () => { active = false }
  }, [lab.week, lab.patchReview?.cve, lab.patchReview?.sourceModuleId])

  if (loadState.status === 'loading') return <section className="generic-lab" role="status"><Eye size={24} /><h2>공식 패치 발췌를 불러오는 중입니다.</h2><p>이 주차의 실제 source와 patch 계보를 같은 콘텐츠 계약에서 읽고 있습니다.</p></section>
  if (loadState.status === 'error') return <section className="generic-lab" role="alert"><AlertTriangle size={24} /><h2>패치 판독 자료를 확인할 수 없습니다.</h2><p>학습 모듈의 patch-analysis와 patch-lineage가 모두 준비돼야 이 실습을 완료할 수 있습니다.</p></section>

  const { patch, lineage } = loadState
  const choice = state.patchInvariantChoice || ''
  const rationale = normalizeLearningText(state.patchRationale || '')
  const rationaleReady = !validateLearningText(rationale, { minLength: 40, label: '패치 판독 근거' })
  const checked = Boolean(state.patchReviewChecked)
  const correct = choice === 'restored-invariant'
  const evidenceLabel = patch.evidenceKind === 'official-patch'
    ? '공식 upstream patch의 실제 코드 발췌'
    : patch.evidenceKind === 'official-remediation'
      ? '공식 공급자 remediation 기록 · source diff 비공개'
      : '교육용 구조 모델 · 실제 제품 source 아님'
  const choices = [
    { id: 'log-only', label: '경고 로그가 추가되면 원인이 남아 있어도 패치가 끝난다.' },
    { id: 'restored-invariant', label: lineage.invariant.after },
    { id: 'version-only', label: 'version 문자열만 바뀌면 실제 artifact와 정상 기능은 확인하지 않아도 된다.' },
  ]
  const openComparison = () => updateLab({ patchComparisonViewed: true, patchReviewChecked: false, validationPassed: false, validation: null, validatedAt: null })
  const updateChoice = (value) => updateLab({ patchInvariantChoice: value, patchReviewChecked: false, validationPassed: false, validation: null, validatedAt: null })
  const updateRationale = (value) => updateLab({ patchRationale: value, patchReviewChecked: false, validationPassed: false, validation: null, validatedAt: null })
  const verify = () => {
    const passed = Boolean(state.patchComparisonViewed) && correct && rationaleReady
    updateLab({ patchReviewChecked: true, patchReviewOutcome: passed ? 'passed' : 'retry', patchReviewCheckedAt: new Date().toISOString() })
    if (passed) onPass({ cve: lineage.cve, invariant: lineage.invariant.after, rationale, evidenceKind: patch.evidenceKind })
  }

  return <section className="patch-review-lab">
    <header><Eye size={24} /><div><span>PATCH DIFF WORKSHOP</span><h2>{lineage.cve} 실제 수정 근거 읽기</h2><p>코드를 실행하지 않고 공개 source 발췌, 공급자 remediation, patch 계보를 읽어 보안 결정이 어떻게 달라졌는지 설명합니다.</p></div></header>
    <div className={`patch-review-provenance evidence-${patch.evidenceKind}`}><strong>{evidenceLabel}</strong><a href={patch.source?.url} target="_blank" rel="noreferrer">공식 근거 열기<ExternalLink size={14} /></a><p>{patch.limitation}</p></div>
    <button className="button secondary" type="button" onClick={openComparison}>{state.patchComparisonViewed ? <><Check size={16} />수정 전·후 비교를 읽음</> : <>수정 전·후 비교 열기<Eye size={16} /></>}</button>
    {state.patchComparisonViewed && <div className="patch-review-code-grid"><section><h3>{patch.before.label}</h3><pre data-always-focusable="true" tabIndex="0" role="region" aria-label={`${patch.before.label} 코드`}><code>{patch.before.code}</code></pre></section><section><h3>{patch.after.label}</h3><pre data-always-focusable="true" tabIndex="0" role="region" aria-label={`${patch.after.label} 코드`}><code>{patch.after.code}</code></pre></section></div>}
    <section className="patch-review-changes"><h3>실제 변경이 맡은 역할</h3><ol>{patch.changes.map((change) => <li key={change}>{change}</li>)}</ol></section>
    <fieldset className="patch-review-invariant"><legend>수정 뒤 지켜야 할 불변조건</legend><p>위 코드와 계보가 직접 지지하는 문장을 하나 고르세요.</p>{choices.map((item) => <label key={item.id}><input type="radio" name={`${lab.id}-invariant`} checked={choice === item.id} onChange={() => updateChoice(item.id)} /><span>{item.label}</span></label>)}</fieldset>
    <section className="patch-review-regression"><h3>공개 근거와 회귀 시험 연결</h3><div role="table" aria-label={`${lineage.cve} 회귀 시험`}><div role="row"><span role="columnheader">시험</span><span role="columnheader">기대 결과</span><span role="columnheader">이유</span></div>{patch.regressionTests.map((test) => <div role="row" key={test.case}><strong role="cell">{test.case}</strong><span role="cell">{test.expected}</span><span role="cell">{test.reason}</span></div>)}</div></section>
    <section className="patch-review-rationale"><h3>줄 변화와 시험을 연결하기</h3><label><span>실제 수정 줄 하나와 회귀 시험 하나를 골라, 왜 같은 불변조건을 확인하는지 40자 이상으로 설명하세요.</span><textarea rows="5" value={state.patchRationale || ''} onChange={(event) => updateRationale(event.target.value)} aria-invalid={checked && !rationaleReady ? 'true' : undefined} /></label><small>{getLearningTextLength(rationale)} / 40자</small></section>
    <section className="patch-review-result" aria-live="polite"><h3>판정</h3><p>{checked ? !state.patchComparisonViewed ? '수정 전·후 비교를 먼저 여세요.' : !correct ? '선택한 문장은 실제 patch가 복원한 불변조건과 맞지 않습니다.' : !rationaleReady ? '줄 변화와 회귀 시험의 관계를 40자 이상으로 적으세요.' : '공식 근거, 불변조건, 회귀 시험을 올바르게 연결했습니다.' : '비교를 읽고 불변조건과 근거를 작성한 뒤 판정하세요.'}</p><button className="button primary" type="button" onClick={verify}>패치 판독 결과 확인<CheckCircle2 size={16} /></button></section>
  </section>
}

function ReportEvidenceLab({ lab, state, updateLab, onPass }) {
  const scenario = lab.scenario
  const categories = Array.isArray(scenario?.categories) ? scenario.categories : []
  const statements = Array.isArray(scenario?.statements) ? scenario.statements : []
  if (!categories.length || !statements.length || !scenario?.reflection) return <section className="generic-lab" role="alert"><AlertTriangle size={24} /><h2>보고서 활동 구성을 확인할 수 없습니다.</h2><p>문장 분류 데이터가 없어서 결과를 판정할 수 없습니다.</p></section>

  const assignments = state.reportEvidenceAssignments || {}
  const reflection = String(state.reportEvidenceReflection || '')
  const allAssigned = statements.every((statement) => assignments[statement.id])
  const exactMatch = allAssigned && statements.every((statement) => assignments[statement.id] === statement.id)
  const reflectionReady = !validateLearningText(reflection, { minLength: scenario.reflection.minimumLength, label: '분류 근거' })
  const checked = Boolean(state.reportEvidenceChecked)
  const updateAssignment = (statementId, categoryId) => updateLab({
    reportEvidenceAssignments: { ...assignments, [statementId]: categoryId },
    reportEvidenceChecked: false,
    validationPassed: false,
    validation: null,
    validatedAt: null,
  })
  const verify = () => {
    const passed = exactMatch && reflectionReady
    updateLab({ reportEvidenceChecked: true, reportEvidenceOutcome: passed ? 'passed' : 'retry', reportEvidenceCheckedAt: new Date().toISOString() })
    if (passed) onPass({ assignments, reflection: reflection.trim() })
  }

  return <section className="report-evidence-lab">
    <header><ClipboardCheck size={24} /><div><span>REPORT EVIDENCE WORKSHOP</span><h2>Finding 문장을 근거에 맞게 분리하기</h2><p>모든 문장은 이 실습을 위해 만든 합성 사례입니다. 직접 확인한 사실, 그 사실에서 이어지는 영향 판단, 원인과 수정·재시험 계획을 한 칸에 섞지 않습니다.</p></div></header>
    <section className="report-evidence-rubric"><h3>분류 기준</h3><dl>{categories.map((category) => <div key={category.id}><dt>{category.label}</dt><dd>{category.id === 'fact' ? '직접 관찰한 변화' : category.id === 'impact' ? '조건이 붙은 영향 해석' : category.id === 'condition' ? '영향 판단을 위해 확인할 전제' : category.id === 'root-cause' ? '문제가 생긴 코드·경로' : category.id === 'control' ? '수정할 통제' : '수정 뒤 비교할 항목'}</dd></div>)}</dl></section>
    <fieldset className="report-evidence-statements">
      <legend>문장 분류</legend>
      <p>문장을 읽고 가장 알맞은 보고서 항목을 고르세요. 각 항목은 한 번씩 사용합니다.</p>
      {statements.map((statement, index) => <label key={statement.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{statement.label}</strong><select aria-label={`${index + 1}번 문장 분류`} value={assignments[statement.id] || ''} onChange={(event) => updateAssignment(statement.id, event.target.value)}><option value="">항목 선택</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select><ChevronDown size={14} /></label>)}
    </fieldset>
    <section className="report-evidence-reflection"><h3>근거 설명</h3><label><span>{scenario.reflection.prompt}</span><textarea aria-label="분류 근거" rows="5" value={reflection} onChange={(event) => updateLab({ reportEvidenceReflection: event.target.value, reportEvidenceChecked: false, validationPassed: false, validation: null, validatedAt: null })} placeholder={`최소 ${scenario.reflection.minimumLength}자 이상으로, 합성 사례 안에서 확인한 근거를 적으세요.`} /></label><small>{getLearningTextLength(reflection)} / {scenario.reflection.minimumLength}자</small></section>
    <section className="report-evidence-result" aria-live="polite"><h3>결과 판정</h3><p>{checked ? exactMatch && reflectionReady ? '문장 구분과 근거 설명이 모두 맞습니다. 이 구조를 Finding 초안에도 유지하세요.' : !allAssigned ? '모든 문장에 항목을 선택하세요.' : !exactMatch ? '사실·영향·조건·원인·수정·재시험의 경계를 다시 확인하세요.' : `근거 설명을 ${scenario.reflection.minimumLength}자 이상으로 보완하세요.` : '문장을 분류하고 근거 설명을 적은 뒤 결과를 판정하세요.'}</p><button className="button primary" type="button" onClick={verify}>결과 판정<CheckCircle2 size={16} /></button></section>
  </section>
}

function ExternalLab({ lab, state, updateLab, onPass }) {
  const isBandit = lab.id.includes('bandit')
  const [confirmed, setConfirmed] = useState(state.confirmed || { scope: false, masked: false })
  const update = (id, checked) => { const next = { ...confirmed, [id]: checked }; setConfirmed(next); updateLab({ confirmed: next }); if (next.scope && next.masked) onPass({ manualChecklist: true }) }
  const links = lab.externalLinks || [{ label: '공식 Bandit 열기', url: 'https://overthewire.org/wargames/bandit/' }]
  return <section className="external-lab"><header><ExternalLink size={20} /><div><span>OFFICIAL TRAINING PLATFORM</span><h2>{isBandit ? 'OverTheWire Bandit' : lab.title}</h2><p>외부 계정이 필요할 수 있습니다. 이 사이트는 외부 서버에 요청을 보내거나 정답·결과를 가져오지 않습니다.</p></div></header><div className="external-meta"><div><small>제공 기관</small><strong>{lab.provider || 'OverTheWire'}</strong></div><div><small>경로</small><strong>{lab.path === 'extension' ? '심화' : '필수 핵심'}</strong></div><div><small>외부 계정</small><strong>{isBandit ? '제공 계정 사용' : '플랫폼별 확인'}</strong></div></div><div className="external-link-row">{links.map((link) => <a className="button primary" href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label}<ExternalLink size={16} /></a>)}</div><section><h3>플랫폼 내부 완료 확인</h3><label><input type="checkbox" checked={confirmed.scope} onChange={(event) => update('scope', event.target.checked)} /><span>제공 기관이 지정한 Lab·호스트·계정과 문제 범위만 사용했습니다.</span></label><label><input type="checkbox" checked={confirmed.masked} onChange={(event) => update('masked', event.target.checked)} /><span>비밀번호, Cookie와 자격 증명을 `[REDACTED]`로 처리했습니다.</span></label><p>이 체크는 외부 결과 판정이 아니라 학습자 자기 확인입니다.</p></section></section>
}

function UnsupportedLab() { return <section className="generic-lab" role="status"><AlertTriangle size={24} /><h2>이 실습 유형은 아직 지원되지 않습니다.</h2><p>검증과 완료 처리는 지원되는 실습 유형에서만 가능합니다.</p></section> }

function Status({ state, text }) {
  const labels = { not_started: '미시작', attempted: '시도함', 'in-progress': '진행 중', completed: '완료', 'activity-recorded': '완료' }
  return <span className={`lab-status lab-status-${state}`}><i />{text || labels[state] || state}</span>
}


function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;') }
