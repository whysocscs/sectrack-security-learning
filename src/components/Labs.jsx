import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  Circle,
  Clipboard,
  Code2,
  ExternalLink,
  Eye,
  FileCode2,
  FileText,
  FlaskConical,
  Globe2,
  Lightbulb,
  LockKeyhole,
  Play,
  RefreshCw,
  Save,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { weekContent } from '../courseData'
import { buildXssTrace, findSensitiveData } from '../platformLogic'
import MindmapStudio from './MindmapStudio'

const allLabs = Object.values(weekContent).flatMap((week) => week.labs.map((lab) => ({ ...lab, weekTitle: week.title })))

function findLab(id) { return allLabs.find((lab) => lab.id === id) }

export function LabCatalog({ progress, navigate }) {
  const [weekFilter, setWeekFilter] = useState('all')
  const [scopeFilter, setScopeFilter] = useState('all')
  const visible = allLabs.filter((lab) => (weekFilter === 'all' || lab.week === Number(weekFilter)) && (scopeFilter === 'all' || (scopeFilter === 'local' ? lab.kind !== 'external' : lab.kind === 'external')))
  return (
    <div className="page-width labs-catalog">
      <section className="safety-notice"><ShieldCheck size={20} /><div><strong>실습 범위</strong><p>내장 실습은 브라우저 안의 교육용 데이터만 사용합니다. 외부 실습은 제공 기관이 명시한 계정·대상·기법 범위를 따릅니다.</p></div></section>
      <div className="catalog-toolbar"><div>{['all', '0', '1', '2', '3', '4'].map((item) => <button type="button" key={item} className={weekFilter === item ? 'active' : ''} onClick={() => setWeekFilter(item)}>{item === 'all' ? '전체 주차' : `Week ${item}`}</button>)}</div><label><span>실습 범위</span><select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)}><option value="all">전체</option><option value="local">내부 로컬</option><option value="external">공식 외부</option></select><ChevronDown size={14} /></label></div>
      <div className="lab-catalog-list">{visible.map((lab) => { const state = progress.labs[lab.id]; return <button type="button" key={lab.id} onClick={() => navigate({ page: 'lab', labId: lab.id })}><span className="catalog-week">W{String(lab.week).padStart(2, '0')}</span><span className="catalog-icon">{lab.kind === 'external' ? <ExternalLink size={18} /> : lab.kind.startsWith('xss') ? <Braces size={18} /> : <Terminal size={18} />}</span><span className="catalog-copy"><small>{lab.kind === 'external' ? '공식 외부 실습' : '로컬 안전 실습'} · {lab.estimatedMinutes}분</small><strong>{lab.title}</strong><p>{lab.objective}</p></span><Status state={state?.status || 'not_started'} /><ChevronRight size={18} /></button>})}</div>
    </div>
  )
}

export function LabPage({ labId, progress, updateProgress, navigate, notify }) {
  const lab = findLab(labId)
  const state = progress.labs[labId] || {}
  const evidence = progress.evidence[labId] || {}

  useEffect(() => {
    if (!lab || state.status) return
    updateProgress((current) => ({ ...current, labs: { ...current.labs, [labId]: { status: 'attempted', startedAt: new Date().toISOString(), hintLevel: 0 } } }))
  }, [labId])

  if (!lab) return <div className="page-width"><div className="empty-state"><Terminal size={24} /><strong>실습을 찾을 수 없습니다.</strong><button className="button secondary" type="button" onClick={() => navigate({ page: 'labs' })}>실습실로</button></div></div>

  const updateLab = (patch) => updateProgress((current) => ({ ...current, labs: { ...current.labs, [lab.id]: { ...(current.labs[lab.id] || {}), ...patch } } }))
  const updateEvidence = (patch) => updateProgress((current) => ({ ...current, evidence: { ...current.evidence, [lab.id]: { ...(current.evidence[lab.id] || {}), ...patch, updatedAt: new Date().toISOString() } } }))
  const derivedPassed = lab.id === 'w0-map'
    ? Object.keys(progress.mindmap.statuses).length >= 10 && Object.values(progress.mindmap.notes).filter((item) => String(item).length >= 5).length >= 3 && progress.mindmap.interests.length >= 2
    : lab.id === 'w0-baseline' ? Object.keys(progress.baseline).length >= 6
      : lab.id === 'w0-roe' ? Object.keys(progress.roeAnswers).length >= 5 : false
  const validationPassed = Boolean(state.validationPassed || derivedPassed)

  const complete = () => {
    const readyEvidence = lab.kind === 'mindmap' || (String(evidence.observation || '').trim().length >= 20 && String(evidence.explanation || '').trim().length >= 30)
    if (!validationPassed || !readyEvidence) {
      notify('성공 조건과 관찰·원리 설명을 먼저 채워주세요.')
      return
    }
    updateLab({ status: 'completed', completedAt: new Date().toISOString() })
    updateProgress((current) => ({
      ...current,
      mastery: {
        ...current.mastery,
        ...Object.fromEntries(lab.relatedConceptIds.map((id) => [id, current.mastery[id] === 'mastered' ? 'mastered' : (state.hintLevel || 0) >= 3 ? 'familiar' : 'proficient'])),
      },
    }))
    notify('실습을 완료했습니다. 증거는 자동 저장됩니다.')
  }

  return (
    <div className="page-width lab-page">
      <button className="back-link" type="button" onClick={() => navigate({ page: 'labs' })}><ArrowLeft size={16} />실습실</button>
      <header className="lab-header">
        <div><span>WEEK {String(lab.week).padStart(2, '0')} · {lab.kind === 'external' ? 'OFFICIAL EXTERNAL LAB' : 'LOCAL SAFE LAB'}</span><h2>{lab.title}</h2><p>{lab.objective}</p></div>
        <div><Status state={state.status || 'attempted'} /><span><Clock3Icon />{lab.estimatedMinutes}분</span></div>
      </header>
      <div className="lab-scope"><ShieldCheck size={18} /><div><strong>안전한 실습 범위</strong><p>{lab.safeScope}</p></div></div>

      <div className="lab-meta-grid"><section><h3>선수지식</h3><ul>{lab.prerequisites.length ? lab.prerequisites.map((item) => <li key={item}>{item}</li>) : <li>별도 선수지식 없음</li>}</ul></section><section><h3>필요한 도구</h3><ul>{lab.requiredTools.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>성공 조건</h3><ul>{lab.successCriteria.map((item) => <li key={item}>{item}</li>)}</ul></section></div>

      <div className="lab-work-layout">
        <main className="lab-workbench">
          <LabWorkArea lab={lab} state={state} updateLab={updateLab} progress={progress} updateProgress={updateProgress} notify={notify} />
        </main>
        <aside className="lab-coach-column"><HintCoach lab={lab} state={state} updateLab={updateLab} /><ValidationBox passed={validationPassed} criteria={lab.successCriteria} /></aside>
      </div>

      <EvidencePanel lab={lab} evidence={evidence} updateEvidence={updateEvidence} warnings={findSensitiveData(`${evidence.commands || ''}\n${evidence.observation || ''}`)} />
      <footer className="lab-complete-footer"><div><strong>{state.status === 'completed' ? '실습 완료' : validationPassed ? '자동 검증 통과' : '자동 검증 대기'}</strong><p>완료 후에도 증거와 설명을 수정할 수 있습니다.</p></div><button className="button primary" type="button" disabled={state.status === 'completed'} onClick={complete}>{state.status === 'completed' ? <><Check size={16} />완료됨</> : <>실습 완료 표시<ArrowRight size={16} /></>}</button></footer>
    </div>
  )
}

function LabWorkArea({ lab, state, updateLab, progress, updateProgress, notify }) {
  const validate = (result = {}) => updateLab({ validationPassed: true, validation: result, validatedAt: new Date().toISOString() })
  switch (lab.kind) {
    case 'mindmap': return <MindmapStudio progress={progress} updateProgress={updateProgress} notify={notify} />
    case 'roe': return <RoeLab progress={progress} updateProgress={updateProgress} onPass={validate} />
    case 'baseline': return <BaselineLab progress={progress} updateProgress={updateProgress} onPass={validate} />
    case 'linux-shell': return <LinuxShellLab state={state} updateLab={updateLab} onPass={validate} />
    case 'path': return <PathLab state={state} updateLab={updateLab} onPass={validate} />
    case 'sequence': return <SequenceLab state={state} updateLab={updateLab} onPass={validate} variant="ssh" />
    case 'permission': return <PermissionLab state={state} updateLab={updateLab} onPass={validate} />
    case 'pipeline': return <PipelineLab state={state} updateLab={updateLab} onPass={validate} />
    case 'request-editor': return <RequestEditorLab state={state} updateLab={updateLab} onPass={validate} />
    case 'http-label': return <HttpLabelLab state={state} updateLab={updateLab} onPass={validate} />
    case 'timeline': return <SequenceLab state={state} updateLab={updateLab} onPass={validate} variant="http" />
    case 'cookie': return <CookieLab state={state} updateLab={updateLab} onPass={validate} />
    case 'source-sink': return <SourceSinkLab state={state} updateLab={updateLab} onPass={validate} />
    case 'threat-model': return <ThreatModelLab state={state} updateLab={updateLab} onPass={validate} />
    case 'xss-reflected':
    case 'xss-stored':
    case 'xss-dom':
    case 'xss-filtering': return <XssLab lab={lab} state={state} updateLab={updateLab} onPass={validate} />
    case 'external': return <ExternalLab lab={lab} state={state} updateLab={updateLab} onPass={validate} />
    default: return <GenericLab lab={lab} onPass={validate} />
  }
}

function HintCoach({ lab, state, updateLab }) {
  const level = state.hintLevel || 0
  const labels = ['개념 회상', '관찰 지점', '다음 행동']
  const next = () => updateLab({ hintLevel: Math.min(3, level + 1) })
  return <section className="hint-coach"><header><Lightbulb size={18} /><div><span>RULE-BASED COACH</span><h3>단계별 힌트</h3></div></header><p>결과 대신 다음에 확인할 대상을 한 단계씩 제시합니다.</p>{lab.hints.map((hint, index) => <div className={`hint-step ${index < level ? 'open' : ''}`} key={hint}><span>{index + 1}</span><div><small>Hint {index + 1} · {labels[index]}</small>{index < level ? <p>{hint}</p> : <strong>아직 열지 않음</strong>}</div></div>)}<button type="button" disabled={level >= 3} onClick={next}>{level >= 3 ? '모든 힌트를 확인함' : `Hint ${level + 1} 열기`}<ChevronRight size={15} /></button>{level > 0 && <div className="coach-next"><strong>다음 확인 항목</strong><p>제안한 지점을 확인한 뒤 나온 출력과 처음 가설이 같은지 비교하세요.</p></div>}</section>
}

function ValidationBox({ passed, criteria }) {
  return <section className={`validation-box ${passed ? 'passed' : ''}`}><header>{passed ? <CheckCircle2 size={18} /> : <Circle size={18} />}<strong>{passed ? '자동 검증 통과' : '자동 검증 대기'}</strong></header><ul>{criteria.map((item) => <li key={item}>{item}</li>)}</ul></section>
}

function EvidencePanel({ lab, evidence, updateEvidence, warnings }) {
  return <section className="evidence-panel"><header><div><span>EVIDENCE</span><h2>실습 증거</h2><p>관찰과 결론을 분리하고, 다른 사람이 같은 조건에서 따라 할 수 있게 적습니다.</p></div><span className="autosave"><Save size={14} />입력 시 자동 저장</span></header>{warnings.length > 0 && <div className="redaction-warning"><AlertTriangle size={17} /><span><strong>마스킹이 필요한 값이 보입니다.</strong><small>{warnings.map((item) => item.label).join(', ')}</small></span></div>}<div className="evidence-fields"><label><span>명령·요청·조작 순서</span><textarea rows="6" value={evidence.commands || ''} onChange={(event) => updateEvidence({ commands: event.target.value })} placeholder="1. 실행한 명령 또는 조작\n2. 변경한 값 하나\n3. 재시험 순서" /></label><label><span>관찰 결과 <em>20자 이상</em></span><textarea rows="6" value={evidence.observation || ''} onChange={(event) => updateEvidence({ observation: event.target.value })} placeholder="화면·출력·응답·DOM에서 실제로 확인한 사실만 적으세요." /></label><label><span>원리 설명 <em>30자 이상</em></span><textarea rows="6" value={evidence.explanation || ''} onChange={(event) => updateEvidence({ explanation: event.target.value })} placeholder="왜 이런 결과가 나왔는지 Source·처리·출력 또는 권한·경로를 연결하세요." /></label></div><label className="evidence-mask"><input type="checkbox" checked={Boolean(evidence.masked)} onChange={(event) => updateEvidence({ masked: event.target.checked })} /><span>Cookie, Authorization, 비밀번호, API Key, 개인정보를 `[REDACTED]`로 처리했습니다.</span></label></section>
}

const roeCases = [
  ['bandit', '공식 Bandit 서버에서 제공된 계정으로 해당 레벨을 해결한다.', 'allow', '제공 기관이 대상과 계정을 명시한 교육 범위입니다.'],
  ['school', '허가 없이 학교 홈페이지에 자동 취약점 스캐너를 실행한다.', 'deny', '공개된 서비스라도 명시적 허가가 없으면 테스트할 수 없습니다.'],
  ['local', '로컬 DVWA·WebGoat에서 테스트 계정으로 XSS를 확인한다.', 'allow', '의도적으로 취약한 로컬 교육 환경입니다.'],
  ['cookie', '실습 제출 스크린샷에 실제 세션 Cookie를 그대로 노출한다.', 'deny', '증거에서도 자격 증명과 개인정보는 마스킹해야 합니다.'],
  ['minimal', '범위 내 취약점을 무해한 PoC로 재현하고 필요한 최소 증거만 수집한다.', 'allow', '허가 범위와 최소 영향·최소 수집 원칙을 지켰습니다.'],
]

function RoeLab({ progress, updateProgress, onPass }) {
  const answers = progress.roeAnswers
  const [checked, setChecked] = useState(false)
  const score = roeCases.filter(([id, , answer]) => answers[id] === answer).length
  const choose = (id, value) => { setChecked(false); updateProgress((current) => ({ ...current, roeAnswers: { ...current.roeAnswers, [id]: value } })) }
  const verify = () => { setChecked(true); if (score >= 4) onPass({ score, total: 5 }) }
  return <section className="roe-lab"><header><span>CLASSIFY</span><h2>허용과 금지 사례</h2><p>기술 수준이 아니라 허가·범위·영향·데이터 처리를 기준으로 판단합니다.</p></header>{roeCases.map(([id, text, answer, reason], index) => <article key={id}><span>{String(index + 1).padStart(2, '0')}</span><p>{text}</p><div><button type="button" className={answers[id] === 'allow' ? 'selected' : ''} onClick={() => choose(id, 'allow')}>허용</button><button type="button" className={answers[id] === 'deny' ? 'selected' : ''} onClick={() => choose(id, 'deny')}>금지</button></div>{checked && <small className={answers[id] === answer ? 'correct' : 'wrong'}>{answers[id] === answer ? '판단 일치' : '다시 확인'} · {reason}</small>}</article>)}<footer><span>{checked ? `${score} / 5 · ${score >= 4 ? '통과' : '재시도'}` : '모든 사례를 분류하세요.'}</span><button className="button primary" type="button" disabled={Object.keys(answers).length < 5} onClick={verify}>판단 확인<CheckCircle2 size={16} /></button></footer></section>
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

function shellArgs(input) {
  const matches = input.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
  return matches.map((item) => item.replace(/^['"]|['"]$/g, ''))
}

function LinuxShellLab({ state, updateLab, onPass }) {
  const [cwd, setCwd] = useState('/home/bandit0')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([{ output: 'SecTrack Linux Lab · 읽기 전용\nhelp를 입력하면 지원 명령을 확인할 수 있습니다.' }])
  const inputRef = useRef(null)
  const solved = state.solved || {}
  const resolve = (raw = '.') => {
    if (raw === '~') return '/home/bandit0'
    const parts = raw.startsWith('/') ? [] : cwd.split('/').filter(Boolean)
    raw.replace(/^~\/?/, '/home/bandit0/').split('/').forEach((part) => { if (!part || part === '.') return; if (part === '..') parts.pop(); else parts.push(part) })
    return `/${parts.join('/')}` || '/'
  }
  const completeInput = () => {
    const parts = input.split(/\s+/)
    const partial = parts.pop() || ''
    const commands = ['pwd', 'ls', 'cd', 'file', 'cat', 'stat', 'head', 'tail', 'find', 'grep', 'whoami', 'history', 'help', 'clear']
    const candidates = parts.length === 0 ? commands.filter((item) => item.startsWith(partial)) : (linuxFs[cwd]?.entries || []).filter((item) => item.startsWith(partial) && (partial.startsWith('.') || !item.startsWith('.')))
    if (candidates.length === 1) setInput([...parts, candidates[0] + (linuxFs[resolve(candidates[0])]?.type === 'dir' ? '/' : '')].join(' '))
  }
  const execute = (raw) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    if (trimmed === 'clear') { setHistory([]); setInput(''); return }
    const [command, ...args] = shellArgs(trimmed)
    let output = ''
    let nextCwd = cwd
    if (command === 'help') output = '지원 명령: pwd, ls [-alh] [경로], cd [경로], file 파일, cat 파일, stat 파일, head [-n N] 파일, tail [-n N] 파일, find [경로] -type f, grep [-in] 패턴 파일, whoami, history, clear'
    else if (command === 'pwd') output = cwd
    else if (command === 'whoami') output = 'bandit0'
    else if (command === 'history') output = history.filter((item) => item.command).map((item, index) => `${index + 1}  ${item.command.replace(/^.*\$ /, '')}`).join('\n')
    else if (command === 'ls') {
      const options = args.filter((item) => item.startsWith('-')).join('')
      const target = args.find((item) => !item.startsWith('-')) || '.'
      const path = resolve(target); const entry = linuxFs[path]
      if (!entry) output = `ls: cannot access '${target}': No such file or directory`
      else if (entry.type === 'file') output = target
      else {
        const showAll = options.includes('a'); const long = options.includes('l')
        const names = showAll ? ['.', '..', ...entry.entries] : entry.entries.filter((name) => !name.startsWith('.'))
        output = long ? names.map((name) => { const item = linuxFs[`${path === '/' ? '' : path}/${name}`]; const mode = name === '.' || name === '..' || item?.type === 'dir' ? 'drwxr-x---' : '-rw-r-----'; return `${mode} 1 bandit0 bandit0 ${options.includes('h') ? '68B' : '68'} Jul 11 10:30 ${name}` }).join('\n') : names.join('  ')
      }
    } else if (command === 'cd') {
      const target = args[0] || '~'; const path = resolve(target); const entry = linuxFs[path]
      if (!entry) output = `cd: ${target}: No such file or directory`
      else if (entry.type !== 'dir') output = `cd: ${target}: Not a directory`
      else nextCwd = path
    } else if (['cat', 'file', 'stat', 'head', 'tail'].includes(command)) {
      const fileArg = args.filter((item, index) => !(item === '-n' || (index > 0 && args[index - 1] === '-n'))).find((item) => !item.startsWith('-'))
      if (!fileArg) output = `${command}: missing file operand`
      else { const path = resolve(fileArg); const entry = linuxFs[path]; if (!entry) output = `${command}: ${fileArg}: No such file or directory`; else if (entry.type === 'dir') output = command === 'file' ? `${fileArg}: directory` : `${command}: ${fileArg}: Is a directory`; else if (command === 'file') output = `${fileArg}: ${entry.kind}`; else if (command === 'stat') output = `  File: ${fileArg}\n  Size: ${entry.content.length}\tBlocks: 8\nAccess: (0640/-rw-r-----)  Uid: bandit0  Gid: bandit0`; else { const lines = entry.content.split('\n'); const nIndex = args.indexOf('-n'); const count = nIndex >= 0 ? Number(args[nIndex + 1]) || 10 : 10; output = command === 'head' ? lines.slice(0, count).join('\n') : command === 'tail' ? lines.slice(-count).join('\n') : entry.content } }
    } else if (command === 'find') {
      const target = args.find((item) => !item.startsWith('-')) || '.'; const path = resolve(target); const entry = linuxFs[path]
      if (!entry) output = `find: '${target}': No such file or directory`
      else output = Object.entries(linuxFs).filter(([filePath, item]) => item.type === 'file' && (path === '/' || filePath.startsWith(`${path}/`))).map(([filePath]) => path === cwd ? `.${filePath.slice(path.length)}` : filePath).join('\n')
    } else if (command === 'grep') {
      const values = args.filter((item) => !item.startsWith('-')); const [pattern, target] = values
      if (!pattern || !target) output = 'grep: usage: grep [-in] 패턴 파일'
      else { const entry = linuxFs[resolve(target)]; if (!entry) output = `grep: ${target}: No such file`; else if (entry.type !== 'file') output = `grep: ${target}: Is a directory`; else { const insensitive = args.some((item) => item.includes('i')); const withLine = args.some((item) => item.includes('n')); const matches = entry.content.split('\n').map((line, index) => [line, index + 1]).filter(([line]) => (insensitive ? line.toLowerCase() : line).includes(insensitive ? pattern.toLowerCase() : pattern)); output = matches.map(([line, number]) => `${withLine ? `${number}:` : ''}${line}`).join('\n') } }
    } else output = `${command}: command not found\nhelp로 지원 명령을 확인하세요.`
    const newlySolved = { ...solved }
    linuxTasks.forEach((task) => { if (output.includes(task.flag)) newlySolved[task.id] = true })
    setCwd(nextCwd); setHistory((current) => [...current, { command: `bandit0@sectrack:${cwd}$ ${trimmed}`, output }]); setInput('')
    if (JSON.stringify(newlySolved) !== JSON.stringify(solved)) { updateLab({ solved: newlySolved }); if (Object.keys(newlySolved).length === 3) onPass({ flags: 3 }) }
  }
  return <section className="linux-shell-lab"><header><div><span>SIMULATED SHELL</span><h2>bandit0@sectrack</h2><p>실제 운영체제가 아닌 읽기 전용 파일 시스템입니다.</p></div><code>Tab 자동완성 · ↑ 기록은 history</code></header><div className="linux-task-strip">{linuxTasks.map((task) => <article className={solved[task.id] ? 'solved' : ''} key={task.id}><span>{task.number}</span><div><strong>{task.title}</strong><p>{task.body}</p></div>{solved[task.id] ? <CheckCircle2 size={18} /> : <Circle size={18} />}</article>)}</div><div className="terminal-window" onClick={() => inputRef.current?.focus()}><div className="terminal-title"><i /><i /><i /><span>sectrack — bash</span></div><div className="terminal-body">{history.map((item, index) => <div key={`${item.command || 'intro'}-${index}`}>{item.command && <strong>{item.command}</strong>}{item.output && <pre>{item.output}</pre>}</div>)}<form onSubmit={(event) => { event.preventDefault(); execute(input) }}><label htmlFor="linux-command">bandit0@sectrack:{cwd}$</label><input ref={inputRef} id="linux-command" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Tab') { event.preventDefault(); completeInput() } }} autoComplete="off" spellCheck="false" /></form></div></div></section>
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

function XssLab({ lab, state, updateLab, onPass }) {
  const data = xssData[lab.kind]
  const [mode, setMode] = useState(state.mode || 'marker')
  const trace = buildXssTrace(lab.kind, mode)
  const runs = state.runs || {}
  const setAndRun = (nextMode) => {
    setMode(nextMode)
    const nextRuns = { ...runs, [nextMode]: true }
    updateLab({ mode: nextMode, runs: nextRuns })
    if (nextRuns.marker && nextRuns.poc && nextRuns.fixed) onPass({ trace: lab.kind, marker: true, harmlessPoc: true, retest: true })
  }
  const framePolicy = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:">'
  const previewContent = mode === 'fixed'
    ? `${framePolicy}<main style="font:16px system-ui;padding:24px"><p>${escapeHtml(data.preview)}</p><small style="color:#2e7d5b">텍스트로 렌더링 · 실행 없음</small></main>`
    : mode === 'poc'
      ? `${framePolicy}<main style="font:16px system-ui;padding:24px"><div style="border:2px solid #c97a20;padding:16px"><strong>TRAINING_POC 실행 표시</strong><p>고정된 무해한 시뮬레이션입니다.</p></div></main>`
      : `${framePolicy}<main style="font:16px system-ui;padding:24px"><p>${escapeHtml(data.preview)}</p><small>고유 마커 위치만 확인</small></main>`
  return <section className="xss-lab"><header><div><span>TRAINING-ONLY · XSS TRACE</span><h2>{data.title}</h2><p>{data.note}</p></div><div className="xss-mode"><button type="button" className={mode === 'marker' ? 'active' : ''} onClick={() => setAndRun('marker')}>1. 마커</button><button type="button" className={mode === 'poc' ? 'active' : ''} onClick={() => setAndRun('poc')}>2. 무해한 PoC</button><button type="button" className={mode === 'fixed' ? 'active' : ''} onClick={() => setAndRun('fixed')}>3. 수정 재시험</button></div></header><div className="xss-simulation-note"><LockKeyhole size={17} /><p>사용자 페이로드를 실행하지 않습니다. 미리보기는 `sandbox` iframe에서 고정된 결과만 보여주며 네트워크 전송·쿠키 접근·키 입력 수집 기능이 없습니다.</p></div><div className="xss-three-panel"><section><header><span>INPUT · HTTP</span><strong>요청과 응답</strong></header><pre><code>{data.request}</code></pre><div className="response-block"><span>RESPONSE / STORAGE</span><pre>{data.response}</pre></div></section><section><header><span>DATA FLOW</span><strong>Source → Sink</strong></header><div className="xss-flow"><FlowStep index="01" label="Source" value={trace.source} /><FlowStep index="02" label="전송" value={trace.transport} /><FlowStep index="03" label="처리" value={trace.transform} /><FlowStep index="04" label="Sink" value={trace.sink} /><FlowStep index="05" label="Context" value={trace.context} /><FlowStep index="06" label="실행·영향" value={trace.execution} last /></div></section><section><header><span>ISOLATED PREVIEW</span><strong>렌더링 결과</strong></header><iframe title={`${data.title} 격리 미리보기`} sandbox="" srcDoc={previewContent} /><dl><div><dt>취약점 존재</dt><dd>{mode === 'fixed' ? '재시험에서 제거됨' : 'Source가 위험 Sink에 도달'}</dd></div><div><dt>영향 확인</dt><dd>{mode === 'poc' ? '고정 문자열 표시만 확인' : mode === 'fixed' ? '실행 없음' : '아직 확인하지 않음'}</dd></div></dl></section></div>{lab.kind === 'xss-dom' && <div className="dom-compare"><section><span>SERVER RESPONSE HTML</span><pre><code>{data.response}</code></pre></section><ArrowRight size={18} /><section><span>EXECUTED DOM</span><pre><code>{mode === 'fixed' ? '<div id="result">&lt;고정 입력&gt;</div>' : '<div id="result">[브라우저가 만든 DOM]</div>'}</code></pre></section></div>}<div className="code-diff" aria-label="취약 코드와 수정 코드 비교"><section><span>VULNERABLE</span><pre><code>{data.vulnerable}</code></pre></section><section><span>FIXED</span><pre><code>{data.fixed}</code></pre></section></div><footer className="xss-run-status">{['marker', 'poc', 'fixed'].map((item, index) => <span className={runs[item] ? 'done' : ''} key={item}>{runs[item] ? <Check size={14} /> : index + 1}{item === 'marker' ? '마커 위치' : item === 'poc' ? '무해한 실행' : '수정 재시험'}</span>)}</footer></section>
}

function FlowStep({ index, label, value, last }) { return <div className="flow-step"><span>{index}</span><div><small>{label}</small><strong>{value}</strong></div>{!last && <ArrowDown size={15} />}</div> }

function ExternalLab({ lab, state, updateLab, onPass }) {
  const isBandit = lab.id.includes('bandit')
  const [confirmed, setConfirmed] = useState(state.confirmed || { scope: false, masked: false, record: false })
  const update = (id, checked) => { const next = { ...confirmed, [id]: checked }; setConfirmed(next); updateLab({ confirmed: next }); if (Object.values(next).every(Boolean)) onPass({ manualChecklist: true }) }
  const links = lab.externalLinks || [{ label: '공식 Bandit 열기', url: 'https://overthewire.org/wargames/bandit/' }]
  return <section className="external-lab"><header><ExternalLink size={20} /><div><span>OFFICIAL TRAINING PLATFORM</span><h2>{isBandit ? 'OverTheWire Bandit' : lab.title}</h2><p>외부 계정이 필요할 수 있습니다. 플랫폼 내부에서는 외부 서버에 요청을 보내거나 정답을 자동 수집하지 않습니다.</p></div></header><div className="external-meta"><div><small>제공 기관</small><strong>{lab.provider || 'OverTheWire'}</strong></div><div><small>난이도</small><strong>입문</strong></div><div><small>예상 시간</small><strong>{lab.estimatedMinutes}분</strong></div><div><small>외부 계정</small><strong>{isBandit ? '제공 계정 사용' : '플랫폼별 확인'}</strong></div></div><div className="external-link-row">{links.map((link) => <a className="button primary" href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label}<ExternalLink size={16} /></a>)}</div><section><h3>플랫폼 내부 제출 요구사항</h3><label><input type="checkbox" checked={confirmed.scope} onChange={(event) => update('scope', event.target.checked)} /><span>제공 기관이 지정한 Lab·호스트·계정과 문제 범위만 사용했습니다.</span></label><label><input type="checkbox" checked={confirmed.masked} onChange={(event) => update('masked', event.target.checked)} /><span>비밀번호, Cookie와 자격 증명을 `[REDACTED]`로 처리했습니다.</span></label><label><input type="checkbox" checked={confirmed.record} onChange={(event) => update('record', event.target.checked)} /><span>{isBandit ? '레벨별 목표·명령·원리·막힌 지점·힌트 사용·결과 증거' : 'Lab별 Source·Transform·Sink·Context·수정 방향'}를 기록했습니다.</span></label></section></section>
}

function GenericLab({ lab, onPass }) { return <section className="generic-lab"><FlaskConical size={24} /><h2>{lab.title}</h2><p>{lab.objective}</p><button className="button primary" type="button" onClick={() => onPass({ manual: true })}>관찰 완료</button></section> }

function Status({ state, text }) {
  const labels = { not_started: '미시작', attempted: '시도함', completed: '완료' }
  return <span className={`lab-status lab-status-${state}`}><i />{text || labels[state] || state}</span>
}

function Clock3Icon() { return <span aria-hidden="true">약</span> }

function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;') }
