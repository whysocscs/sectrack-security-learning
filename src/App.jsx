import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Gauge,
  GraduationCap,
  Library,
  ListChecks,
  LockKeyhole,
  Map,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  Search,
  ShieldCheck,
  Terminal,
  UserRoundCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { concepts } from './conceptData'
import { masteryLabels, officialResources, quizzes, roadmap, weekContent } from './courseData'
import { industryDomains, jobCaptures, kisaRoles, marketJobs, workLanes } from './weekZeroData'
import { completedExampleReport, emptyReport, publicReportResources } from './reportData'
import {
  STORAGE_KEY,
  calculateWeekProgress,
  getNextTask,
  mergeProgress,
  parseHash,
  parseProgress,
  routeToHash,
  validateReport,
} from './platformLogic'
import MindmapStudio from './components/MindmapStudio'
import { LabCatalog, LabPage } from './components/Labs'
import { ReportEditor, ReportsPage } from './components/Reports'

const navItems = [
  { page: 'home', label: '홈', icon: BookOpen },
  { page: 'learn', label: '16주 로드맵', icon: GraduationCap },
  { page: 'mindmap', label: '마인드맵', icon: Map },
  { page: 'labs', label: '실습실', icon: Terminal },
  { page: 'reports', label: '보고서', icon: FileCheck2 },
  { page: 'resources', label: '리소스', icon: Library },
  { page: 'progress', label: '내 진도', icon: Gauge },
]

const pageMeta = {
  home: ['내 학습', '오늘 할 항목과 복습할 개념을 확인합니다.'],
  learn: ['16주 로드맵', 'Week 0은 사전 준비이며 Week 1부터 정규 과정입니다.'],
  week: ['주차 학습', '개념, 실습, 증거와 이해 확인을 한 흐름으로 진행합니다.'],
  mindmap: ['보안 전체 지도', '기술·직무·산업을 연결하고 현재 이해 상태를 기록합니다.'],
  labs: ['실습실', '로컬 또는 명시적으로 허가된 교육 환경만 사용합니다.'],
  lab: ['실습', '관찰 결과를 남기고 단계형 힌트로 막힌 지점을 확인합니다.'],
  reports: ['취약점 보고서', '발견 사실을 재현 가능한 Finding으로 바꿉니다.'],
  'report-editor': ['Finding 편집기', 'Source부터 재시험까지 근거가 이어지는지 점검합니다.'],
  resources: ['리소스', '과정에서 사용한 공식 문서와 로컬 참고 자료입니다.'],
  progress: ['내 진도', '완료 여부와 개념 숙련도를 따로 확인합니다.'],
  admin: ['운영자', '완료율보다 막힌 개념과 증거 품질을 먼저 봅니다.'],
}

function readInitialProgress() {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY))
  } catch {
    return mergeProgress()
  }
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const [progress, setProgress] = useState(readInitialProgress)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    if (!window.location.hash) window.history.replaceState(null, '', '#/')
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      setToast('브라우저 저장 공간이 부족해 변경 내용을 저장하지 못했습니다.')
    }
  }, [progress])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const navigate = (next) => {
    const nextHash = routeToHash(next)
    setMenuOpen(false)
    if (window.location.hash === nextHash) setRoute(next)
    else window.location.hash = nextHash
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateProgress = (updater) => {
    setProgress((current) => mergeProgress(typeof updater === 'function' ? updater(current) : { ...current, ...updater }))
  }

  const meta = pageMeta[route.page] || pageMeta.home
  const currentWeek = route.page === 'week' ? weekContent[route.week] : null

  return (
    <div className="app-shell">
      <Sidebar route={route} navigate={navigate} open={menuOpen} close={() => setMenuOpen(false)} progress={progress} />
      <div className="app-frame">
        <Topbar
          title={currentWeek ? `Week ${String(currentWeek.index).padStart(2, '0')} · ${currentWeek.title}` : meta[0]}
          subtitle={currentWeek ? currentWeek.summary : meta[1]}
          onMenu={() => setMenuOpen(true)}
          navigate={navigate}
        />
        <main className="main-content" id="main-content">
          {route.page === 'home' && <HomePage progress={progress} navigate={navigate} />}
          {route.page === 'learn' && <RoadmapPage progress={progress} navigate={navigate} />}
          {route.page === 'week' && currentWeek && <WeekPage week={currentWeek} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={setToast} />}
          {route.page === 'week' && !currentWeek && <NotFound navigate={navigate} />}
          {route.page === 'mindmap' && <MindmapStudio progress={progress} updateProgress={updateProgress} notify={setToast} fullPage />}
          {route.page === 'labs' && <LabCatalog progress={progress} navigate={navigate} />}
          {route.page === 'lab' && <LabPage labId={route.labId} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={setToast} />}
          {route.page === 'reports' && <ReportsPage progress={progress} navigate={navigate} />}
          {route.page === 'report-editor' && <ReportEditor reportId={route.reportId} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={setToast} />}
          {route.page === 'resources' && <ResourcesPage />}
          {route.page === 'progress' && <ProgressPage progress={progress} navigate={navigate} />}
          {route.page === 'admin' && <AdminPage progress={progress} />}
        </main>
      </div>
      {toast && <div className="toast" role="status"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  )
}

function Sidebar({ route, navigate, open, close, progress }) {
  const availableWeeks = Object.values(weekContent)
  const total = Math.round(availableWeeks.reduce((sum, week) => sum + calculateWeekProgress(week, progress), 0) / availableWeeks.length)
  const active = route.page === 'week' ? 'learn' : route.page === 'lab' ? 'labs' : route.page === 'report-editor' ? 'reports' : route.page
  return (
    <>
      {open && <button className="sidebar-backdrop" type="button" onClick={close} aria-label="메뉴 닫기" />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-head">
          <button className="brand" type="button" onClick={() => navigate({ page: 'home' })}>
            <span className="brand-symbol"><ShieldCheck size={19} /></span>
            <span><strong>SECTRACK</strong><small>16주 보안 기초 트랙</small></span>
          </button>
          <button className="icon-button sidebar-close" type="button" onClick={close} aria-label="메뉴 닫기"><PanelLeftClose size={19} /></button>
        </div>
        <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
        <nav className="primary-nav" aria-label="주요 메뉴">
          <span className="nav-label">LEARNING</span>
          {navItems.map(({ page, label, icon: Icon }) => (
            <button type="button" key={page} className={active === page ? 'active' : ''} onClick={() => navigate({ page })}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
          <span className="nav-label nav-label-spaced">MANAGEMENT</span>
          <button type="button" className={active === 'admin' ? 'active' : ''} onClick={() => navigate({ page: 'admin' })}>
            <UsersRound size={18} /><span>운영자</span>
          </button>
        </nav>
        <section className="sidebar-progress" aria-label="MVP 학습 진행률">
          <div><span>Week 0~4 진행</span><strong>{total}%</strong></div>
          <ProgressBar value={total} />
          <p>현재 과정</p>
          <strong>Week 04 · XSS</strong>
        </section>
        <div className="sidebar-user"><span className="avatar">김</span><span><strong>김보안</strong><small>학습자 · 운영자</small></span></div>
      </aside>
    </>
  )
}

function Topbar({ title, subtitle, onMenu, navigate }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button type="button" className="icon-button mobile-menu" onClick={onMenu} aria-label="메뉴 열기"><Menu size={20} /></button>
        <div><h1>{title}</h1><p>{subtitle}</p></div>
      </div>
      <div className="topbar-actions">
        <button type="button" className="icon-button" aria-label="알림"><Bell size={18} /><i className="notification-dot" /></button>
        <button type="button" className="quiet-command" onClick={() => navigate({ page: 'progress' })}><UserRoundCheck size={16} />내 진도</button>
      </div>
    </header>
  )
}

function HomePage({ progress, navigate }) {
  const weeks = Object.values(weekContent)
  const next = getNextTask(weeks, progress)
  const week = weekContent[next.week]
  const progressValues = weeks.map((item) => calculateWeekProgress(item, progress))
  const submitted = Object.keys(progress.submissions).length
  const reviewed = Object.values(progress.mastery).filter((value) => ['proficient', 'mastered'].includes(value)).length
  const openNext = () => next.type === 'lab' ? navigate({ page: 'lab', labId: next.id }) : navigate({ page: 'week', week: next.week })
  return (
    <div className="home-layout page-width">
      <section className="home-main">
        <div className="today-panel">
          <div className="section-kicker"><span>TODAY</span><Status text={next.label} tone="progress" /></div>
          <div className="today-copy">
            <div><small>지금 할 항목 하나</small><h2>{next.title}</h2><p>{week.summary}</p></div>
            <button className="button primary" type="button" onClick={openNext}>이어서 하기<ArrowRight size={16} /></button>
          </div>
          <div className="today-meta">
            <span><BookOpen size={16} />Week {String(next.week).padStart(2, '0')}</span>
            <span><Clock3 size={16} />예상 {Math.max(15, Math.round(week.estimatedMinutes / Math.max(week.modules.length + week.labs.length, 1)))}분</span>
            <span><ShieldCheck size={16} />로컬·허가 환경</span>
          </div>
        </div>

        <SectionTitle title="Week 0~4 학습 흐름" description="완료 표시와 개념 숙련도는 별도로 기록됩니다." action="전체 로드맵" onAction={() => navigate({ page: 'learn' })} />
        <div className="week-progress-list">
          {weeks.map((item, index) => (
            <button type="button" key={item.id} onClick={() => navigate({ page: 'week', week: item.index })}>
              <span className="week-index">{String(item.index).padStart(2, '0')}</span>
              <span className="week-list-copy"><strong>{item.title}</strong><small>{item.modules.length}개 개념 · {item.labs.length}개 실습</small></span>
              <ProgressBar value={progressValues[index]} />
              <b>{progressValues[index]}%</b><ChevronRight size={17} />
            </button>
          ))}
        </div>

        <SectionTitle title="최근 피드백" description="다음 제출에 바로 반영할 항목만 표시합니다." />
        <div className="feedback-row"><MessageSquareText size={18} /><div><strong>관찰 결과와 추정을 문장으로 분리하세요.</strong><p>“실행될 수 있다”와 “실습에서 실행을 확인했다”는 증거 수준이 다릅니다. Week 4 Finding의 관찰 결과에서 두 문장을 나눠 쓰세요.</p><small>운영자 · 오늘 09:20</small></div></div>
      </section>
      <aside className="home-rail">
        <section className="rail-section"><h2>이번 과정</h2><dl className="compact-stats"><div><dt>주차 제출</dt><dd>{submitted} / 5</dd></div><div><dt>숙련 이상</dt><dd>{reviewed}개</dd></div><div><dt>열어 본 힌트</dt><dd>{Object.values(progress.labs).reduce((sum, item) => sum + (item.hintLevel || 0), 0)}단계</dd></div></dl></section>
        <section className="rail-section"><h2>복습할 개념</h2><button className="review-item" type="button" onClick={() => navigate({ page: 'week', week: 3 })}><span>HTTP</span><strong>401과 403</strong><small>응답의 인증·인가 상태를 다시 구분</small></button><button className="review-item" type="button" onClick={() => navigate({ page: 'week', week: 4 })}><span>XSS</span><strong>Source와 Sink</strong><small>문자열 반사와 코드 실행을 분리</small></button></section>
        <section className="rail-section due-list"><h2>미제출</h2>{weeks.filter((item) => !progress.submissions[`week-${item.index}`]).slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => navigate({ page: 'week', week: item.index })}><span>W{String(item.index).padStart(2, '0')}</span><strong>{item.deliverables[0]}</strong><ChevronRight size={15} /></button>)}</section>
      </aside>
    </div>
  )
}

function RoadmapPage({ progress, navigate }) {
  return (
    <div className="page-width roadmap-page">
      <div className="orientation-row">
        <span className="orientation-label">사전 준비</span>
        <RoadmapItem item={roadmap[0]} progress={calculateWeekProgress(weekContent[0], progress)} navigate={navigate} />
      </div>
      <div className="roadmap-divider"><span>정규 16주 과정</span></div>
      <div className="roadmap-path">
        {roadmap.slice(1).map((item) => (
          <RoadmapItem key={item.id} item={item} progress={weekContent[item.index] ? calculateWeekProgress(weekContent[item.index], progress) : 0} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}

function RoadmapItem({ item, progress, navigate }) {
  const locked = item.status === 'preview'
  return (
    <button type="button" className={`roadmap-item ${locked ? 'preview' : ''}`} disabled={locked} onClick={() => navigate({ page: 'week', week: item.index })}>
      <span className="roadmap-node">{locked ? <LockKeyhole size={15} /> : progress === 100 ? <Check size={17} /> : String(item.index).padStart(2, '0')}</span>
      <span className="roadmap-copy"><small>{item.index === 0 ? 'ORIENTATION' : `WEEK ${String(item.index).padStart(2, '0')}`} · 약 {formatMinutes(item.estimatedMinutes)}</small><strong>{item.title}</strong><p>{item.summary}</p><span className="concept-tags">{item.keyConcepts.map((tag) => <em key={tag}>{tag}</em>)}</span></span>
      <span className="roadmap-deliverable"><small>대표 제출물</small><strong>{item.deliverable}</strong>{locked ? <span>향후 제공</span> : <ProgressBar value={progress} />}</span>
      {!locked && <ChevronRight size={18} />}
    </button>
  )
}

function WeekPage({ week, progress, updateProgress, navigate, notify }) {
  const [tab, setTab] = useState('overview')
  useEffect(() => setTab('overview'), [week.index])
  const value = calculateWeekProgress(week, progress)
  const completedLabs = week.labs.filter((lab) => progress.labs[lab.id]?.status === 'completed').length
  const readModules = week.modules.filter((module) => progress.modulesRead[module.id]).length
  const tabs = [
    ['overview', '이번 주'], ['concepts', '개념 모듈'], ['labs', `실습 ${completedLabs}/${week.labs.length}`], ['quiz', '이해 확인'], ['submit', '증거 제출'],
  ]
  return (
    <div className="page-width week-page">
      <button className="back-link" type="button" onClick={() => navigate({ page: 'learn' })}><ArrowLeft size={16} />16주 로드맵</button>
      <section className="week-header">
        <div><span className="section-kicker">WEEK {String(week.index).padStart(2, '0')}</span><h2>{week.title}</h2><p>{week.summary}</p></div>
        <div className="week-header-progress"><span><small>현재 진행</small><strong>{value}%</strong></span><ProgressBar value={value} /><small>{readModules}/{week.modules.length}개 개념 · {completedLabs}/{week.labs.length}개 실습</small></div>
      </section>
      <nav className="tab-bar" aria-label="주차 학습 메뉴">{tabs.map(([id, label]) => <button type="button" key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav>
      {tab === 'overview' && <WeekOverview week={week} progress={progress} navigate={navigate} setTab={setTab} />}
      {tab === 'concepts' && <ConceptReader week={week} progress={progress} updateProgress={updateProgress} />}
      {tab === 'labs' && <WeekLabs week={week} progress={progress} navigate={navigate} />}
      {tab === 'quiz' && <QuizView week={week} progress={progress} updateProgress={updateProgress} notify={notify} />}
      {tab === 'submit' && <SubmissionView week={week} progress={progress} updateProgress={updateProgress} notify={notify} />}
    </div>
  )
}

function WeekOverview({ week, progress, navigate, setTab }) {
  return (
    <div className="week-overview">
      <div className="week-overview-main">
        <section className="document-section">
          <SectionTitle title="이번 주에 할 일" />
          <ol className="sequence-list">
            <li><span>01</span><div><strong>개념 모듈 {week.modules.length}개 읽기</strong><p>용어와 데이터 흐름을 먼저 확인합니다.</p></div><button type="button" onClick={() => setTab('concepts')}>열기</button></li>
            <li><span>02</span><div><strong>내부 실습으로 관찰 기록</strong><p>단계형 힌트는 막힌 경우에만 엽니다.</p></div><button type="button" onClick={() => setTab('labs')}>열기</button></li>
            <li><span>03</span><div><strong>공식 외부 실습 또는 심화 과제</strong><p>자격 증명과 토큰을 마스킹해 증거를 남깁니다.</p></div><button type="button" onClick={() => setTab('labs')}>열기</button></li>
            <li><span>04</span><div><strong>이해 확인과 증거 제출</strong><p>80% 미만인 개념은 다시 읽고 재시도합니다.</p></div><button type="button" onClick={() => setTab('quiz')}>열기</button></li>
          </ol>
        </section>
        <section className="document-section"><SectionTitle title="학습 목표" /><ul className="check-list">{week.objectives.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul></section>
        {week.index === 0 && <WeekZeroCareerOverview navigate={navigate} />}
        <section className="document-section"><SectionTitle title="보고서와 연결" /><div className="report-connection"><FileText size={20} /><p>{week.reportConnection}</p>{week.index === 4 && <button className="button secondary" type="button" onClick={() => navigate({ page: 'report-editor', reportId: 'local-xss-draft' })}>Finding 초안 열기<ArrowRight size={15} /></button>}</div></section>
      </div>
      <aside className="week-aside">
        <section><h3>학습 정보</h3><dl><div><dt>예상 시간</dt><dd>{formatMinutes(week.estimatedMinutes)}</dd></div><div><dt>개념 모듈</dt><dd>{week.modules.length}개</dd></div><div><dt>실습</dt><dd>{week.labs.length}개</dd></div><div><dt>이해 확인</dt><dd>{quizzes[week.index].length}문항</dd></div></dl></section>
        <section><h3>선수지식</h3><ul>{week.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h3>제출물</h3><ul>{week.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="next-week"><span>NEXT</span><strong>{week.next}</strong></section>
      </aside>
    </div>
  )
}

function WeekZeroCareerOverview({ navigate }) {
  const [capture, setCapture] = useState(null)
  const maxCount = Math.max(...marketJobs.map(([, count]) => count))
  return (
    <>
      <section className="document-section career-overview">
        <SectionTitle title="기술, 직무, 산업을 구분해서 보기" description="웹·시스템은 공부할 기술이고, 모의해킹·관제는 회사에서 맡는 역할이며, OT·선박·우주는 보호할 산업입니다." />
        <div className="three-layer-flow"><span><small>기술</small><strong>웹 · 시스템 · 네트워크</strong></span><ArrowRight size={17} /><span><small>직무</small><strong>설계 · 검증 · 탐지 · 관리</strong></span><ArrowRight size={17} /><span><small>산업</small><strong>IT · 금융 · OT · 이동체</strong></span></div>
        <div className="work-lane-list">{workLanes.map((lane) => <article key={lane.id}><span>{lane.label}</span><h3>{lane.title}</h3><p>{lane.description}</p><small>결과물</small><strong>{lane.outputs.join(' · ')}</strong></article>)}</div>
        <button className="text-action" type="button" onClick={() => navigate({ page: 'mindmap' })}>전체 인터랙티브 마인드맵 열기<ArrowRight size={15} /></button>
      </section>
      <section className="document-section career-role-section">
        <SectionTitle title="KISA 직무 분류에서 실제 업무 읽기" description="직무명보다 담당 업무와 결과물을 기준으로 비교합니다." />
        <div className="career-role-table"><div className="career-role-head"><span>직무</span><span>주요 업무</span><span>대표 결과물</span></div>{kisaRoles.map((role) => <div key={role.code}><strong>{role.title}</strong><p>{role.does}</p><span>{role.deliverables}</span></div>)}</div>
      </section>
      <section className="document-section job-evidence-section">
        <SectionTitle title="실제 채용 공고에서 확인하기" description="외부 페이지로 이동하지 않고 로컬 캡처를 확대해 요구 기술과 역할을 읽습니다." />
        <div className="job-capture-grid">{jobCaptures.map((item) => <button type="button" key={item.company} onClick={() => setCapture(item)}><img src={publicAsset(item.image)} alt={`${item.company} 정보보호 채용 공고 캡처`} /><span><strong>{item.company}</strong><small>{item.title}</small></span></button>)}</div>
        <div className="market-mini"><h3>2025 KISIA 채용 공고 세부 직무 사례</h3>{marketJobs.slice(0, 8).map(([name, count]) => <div key={name}><span>{name}</span><i><b style={{ width: `${count / maxCount * 100}%` }} /></i><strong>{count}</strong></div>)}</div>
      </section>
      <section className="document-section"><SectionTitle title="산업 보안은 우선순위가 달라진다" /><div className="industry-table">{industryDomains.slice(0, 8).map((item) => <article key={item.title}><strong>{item.title}</strong><span>{item.assets}</span><p>{item.concern}</p></article>)}</div></section>
      {capture && <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`${capture.company} 채용 공고 확대`}><button className="modal-backdrop" type="button" onClick={() => setCapture(null)} aria-label="닫기" /><div className="image-modal"><button className="icon-button" type="button" onClick={() => setCapture(null)} aria-label="닫기"><X size={20} /></button><img src={publicAsset(capture.image)} alt={`${capture.company} 채용 공고 확대`} /></div></div>}
    </>
  )
}

function ConceptReader({ week, progress, updateProgress }) {
  const [selectedId, setSelectedId] = useState(week.modules[0].id)
  useEffect(() => setSelectedId(week.modules[0].id), [week.index])
  const selected = week.modules.find((item) => item.id === selectedId) || week.modules[0]
  const done = Boolean(progress.modulesRead[selected.id])
  const toggleDone = () => updateProgress((current) => ({ ...current, modulesRead: { ...current.modulesRead, [selected.id]: !done } }))
  return (
    <div className="reader-layout">
      <aside className="reader-toc"><span>WEEK {String(week.index).padStart(2, '0')} · CONCEPTS</span><h2>개념 목차</h2>{week.modules.map((module, index) => <button type="button" key={module.id} className={selected.id === module.id ? 'active' : ''} onClick={() => setSelectedId(module.id)}><span>{progress.modulesRead[module.id] ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span><strong>{module.title}</strong><small>{module.duration}분</small></button>)}</aside>
      <article className="reader-document">
        <header><span>MODULE {String(week.modules.indexOf(selected) + 1).padStart(2, '0')}</span><h2>{selected.title}</h2><p>{selected.summary}</p></header>
        {selected.paragraphs?.map((paragraph) => <p className="lead-paragraph" key={paragraph}>{paragraph}</p>)}
        {selected.terms && <dl className="term-table">{selected.terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl>}
        {selected.points && <section className="reader-points"><h3>핵심 내용</h3>{selected.points.map((point, index) => <div key={point}><span>{String(index + 1).padStart(2, '0')}</span><p>{renderInlineCode(point)}</p></div>)}</section>}
        {selected.steps && <section className="process-track"><h3>확인 순서</h3>{selected.steps.map((step, index) => <div key={step}><span>{index + 1}</span><strong>{step}</strong>{index < selected.steps.length - 1 && <i />}</div>)}</section>}
        {week.index === 1 && selected.id === 'w1-navigation' && <LinuxCommandReference />}
        <footer className="reader-footer"><button className={`button ${done ? 'secondary' : 'primary'}`} type="button" onClick={toggleDone}>{done ? <><Check size={16} />읽음 취소</> : <><CheckCircle2 size={16} />읽음으로 표시</>}</button><small>읽음 표시는 새로고침 후에도 유지됩니다.</small></footer>
      </article>
      <aside className="reader-notes"><section><h3>이번 모듈 목표</h3><p>{selected.summary}</p></section><section><h3>학습 메모</h3><textarea aria-label="학습 메모" placeholder="헷갈린 용어와 다시 확인할 문장을 적으세요." defaultValue="" rows="8" /></section><section><h3>관련 흐름</h3><span>{week.index <= 2 ? '명령 → 출력 → 증거' : week.index === 3 ? '요청 → 응답 → DOM' : 'Source → Sink → Context'}</span></section></aside>
    </div>
  )
}

const commandExamples = {
  pwd: ['$ pwd', '/home/student'],
  ls: ['$ ls -lah projects', 'drwxr-xr-x  student student 4.0K api\n-rw-r--r--  student student  921 README.md'],
  cd: ['$ cd projects/api\n$ pwd', '/home/student/projects/api'],
  file: ['$ file README.md', 'README.md: Unicode text, UTF-8 text'],
  cat: ['$ cat README.md', '# Sample project\nRun this project only in the local lab.'],
  'head / tail': ['$ tail -n 2 access.log', '2026-07-10 GET /health 200\n2026-07-10 POST /login 401'],
  man: ['$ man ls', 'LS(1)  User Commands\nNAME\n       ls - list directory contents'],
  find: ['$ find . -type f -name "*.log"', './logs/access.log\n./logs/error.log'],
  grep: ['$ grep -n ERROR logs/error.log', '18:ERROR database connection timed out'],
  파이프: ['$ grep " 404 " access.log | wc -l', '7'],
}

function LinuxCommandReference() {
  const reading = concepts[1]?.reading
  if (!reading) return null
  return <section className="command-manual"><div className="manual-title"><span>COMMAND REFERENCE</span><h3>{reading.title}</h3><p>{reading.summary}</p></div>{reading.groups.map((group) => <div className="manual-group" key={group.title}><header><small>{group.kicker}</small><h4>{group.title}</h4><p>{group.description}</p></header>{group.items.map((item) => { const example = commandExamples[item.command]; return <article className="manual-command" key={item.command}><div><span className="command-level">{item.level}</span><h4>{item.command}</h4><code>{item.syntax || item.command}</code><p>{item.summary}</p><h5>자주 쓰는 옵션·동작</h5><ul>{item.features?.map((feature) => <li key={feature}>{feature}</li>)}</ul></div>{example && <pre aria-label={`${item.command} 실행 예시`}><span>EXAMPLE</span><code><b>{example[0]}</b>{'\n'}{example[1]}</code></pre>}</article>})}</div>)}</section>
}

function WeekLabs({ week, progress, navigate }) {
  return <div className="week-lab-list">{week.labs.map((lab, index) => { const state = progress.labs[lab.id]; return <button type="button" key={lab.id} onClick={() => navigate({ page: 'lab', labId: lab.id })}><span className="lab-sequence">{String(index + 1).padStart(2, '0')}</span><span className="lab-list-copy"><small>{lab.kind === 'external' ? 'OFFICIAL EXTERNAL LAB' : 'LOCAL SAFE LAB'} · {lab.estimatedMinutes}분</small><strong>{lab.title}</strong><p>{lab.objective}</p><span>{lab.requiredTools.join(' · ')}</span></span><Status text={state?.status === 'completed' ? '완료' : state ? '시도함' : '미시작'} tone={state?.status === 'completed' ? 'done' : state ? 'progress' : 'muted'} /><ChevronRight size={18} /></button>})}</div>
}

function QuizView({ week, progress, updateProgress, notify }) {
  const questions = quizzes[week.index]
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const score = questions.filter((question, index) => answers[index] === question.answer).length
  const percent = Math.round(score / questions.length * 100)
  const submit = () => {
    setSubmitted(true)
    updateProgress((current) => ({
      ...current,
      quizScores: { ...current.quizScores, [week.index]: { score, total: questions.length, percent, attemptedAt: new Date().toISOString() } },
      mastery: {
        ...current.mastery,
        ...Object.fromEntries(week.modules.map((module) => [module.id, ['proficient', 'mastered'].includes(current.mastery[module.id]) ? current.mastery[module.id] : percent >= 80 ? 'familiar' : 'attempted'])),
      },
    }))
    notify(percent >= 80 ? '이해 확인을 통과했습니다.' : '80% 미만입니다. 틀린 문항의 설명을 확인하세요.')
  }
  const previous = progress.quizScores[week.index]
  return (
    <section className="quiz-page">
      <header><span>KNOWLEDGE CHECK</span><h2>{week.index}주차 이해 확인</h2><p>실습 결과와 개념을 연결하는 짧은 확인입니다. 다시 풀어도 감점되지 않습니다.</p>{previous && <small>최근 결과 {previous.score}/{previous.total} · {previous.percent}%</small>}</header>
      {questions.map((question, index) => <article className="quiz-card" key={question.id}><div><span>Q{index + 1}</span><h3>{question.question}</h3></div><div className="quiz-options">{question.options.map((option, optionIndex) => <button type="button" key={option} className={answers[index] === optionIndex ? 'selected' : ''} onClick={() => { setAnswers((current) => ({ ...current, [index]: optionIndex })); setSubmitted(false) }}><i>{String.fromCharCode(65 + optionIndex)}</i>{option}</button>)}</div>{submitted && <p className={`quiz-explanation ${answers[index] === question.answer ? 'correct' : 'wrong'}`}><strong>{answers[index] === question.answer ? '정답' : '다시 확인'}</strong>{question.explanation}</p>}</article>)}
      <footer><span>{submitted ? `${score} / ${questions.length} · ${percent}%` : `${Object.keys(answers).length} / ${questions.length} 응답`}</span><button className="button primary" type="button" disabled={Object.keys(answers).length !== questions.length} onClick={submit}>결과 확인<CheckCircle2 size={16} /></button></footer>
    </section>
  )
}

function SubmissionView({ week, progress, updateProgress, notify }) {
  const key = `week-${week.index}`
  const saved = progress.evidence[key] || {}
  const [form, setForm] = useState(saved)
  const [checked, setChecked] = useState(saved.checked || [])
  useEffect(() => { setForm(progress.evidence[key] || {}); setChecked(progress.evidence[key]?.checked || []) }, [week.index])
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const save = (submitted = false) => {
    const evidence = { ...form, checked, updatedAt: new Date().toISOString() }
    updateProgress((current) => ({
      ...current,
      evidence: { ...current.evidence, [key]: evidence },
      submissions: submitted ? { ...current.submissions, [key]: { status: 'submitted', submittedAt: new Date().toISOString() } } : current.submissions,
    }))
    notify(submitted ? '주차 증거를 제출했습니다.' : '초안을 저장했습니다.')
  }
  const ready = checked.length === week.deliverables.length && String(form.summary || '').length >= 80 && String(form.evidence || '').length >= 30
  return (
    <div className="submission-layout">
      <section className="submission-form-panel"><header><span>EVIDENCE PACKAGE</span><h2>{week.index}주차 증거 제출</h2><p>결과만 붙이지 말고 어떤 조건에서 무엇을 관찰했는지 재현 가능한 순서로 남깁니다.</p></header><label><span>학습 요약 <em>필수 · 80자 이상</em></span><textarea rows="6" value={form.summary || ''} onChange={(event) => update('summary', event.target.value)} placeholder="이번 주 핵심 개념과 실습에서 확인한 관계를 본인의 언어로 적으세요." /></label><label><span>명령·요청·DOM 증거 <em>필수</em></span><textarea rows="8" value={form.evidence || ''} onChange={(event) => update('evidence', event.target.value)} placeholder="민감정보를 마스킹한 명령 출력, 요청·응답, DOM 위치를 적으세요." /></label><label><span>막힌 지점과 힌트 사용</span><textarea rows="4" value={form.reflection || ''} onChange={(event) => update('reflection', event.target.value)} placeholder="처음 가설, 막힌 지점, 힌트 뒤 바뀐 판단을 적으세요." /></label><label><span>풀이·블로그 URL <small>선택</small></span><input type="url" value={form.url || ''} onChange={(event) => update('url', event.target.value)} placeholder="https://" /></label><footer><button className="button secondary" type="button" onClick={() => save(false)}>초안 저장</button><button className="button primary" type="button" disabled={!ready} onClick={() => save(true)}>{progress.submissions[key] ? '제출 수정' : '검토 요청'}<ArrowRight size={16} /></button></footer></section>
      <aside className="submission-checklist"><h3>제출물 확인</h3>{week.deliverables.map((item, index) => <label key={item}><input type="checkbox" checked={checked.includes(index)} onChange={(event) => setChecked((current) => event.target.checked ? [...current, index] : current.filter((value) => value !== index))} /><span>{item}</span></label>)}<div className="submission-rule"><ShieldCheck size={18} /><strong>마스킹 확인</strong><p>비밀번호, 다음 레벨 자격 증명, Cookie, Authorization, API Key, 개인정보는 원문 대신 `[REDACTED]`로 표시합니다.</p></div>{progress.submissions[key] && <Status text="검토 요청됨" tone="done" />}</aside>
    </div>
  )
}

function ResourcesPage() {
  const [category, setCategory] = useState('전체')
  const categories = ['전체', ...new Set(officialResources.map((item) => item.category))]
  const visible = category === '전체' ? officialResources : officialResources.filter((item) => item.category === category)
  return (
    <div className="page-width resources-page">
      <section className="local-reference sanitized-reference">
        <div><span>REDACTED FOR PUBLIC DEPLOYMENT</span><h2>학생형 XSS 보고서는 구조화된 사례만 공개합니다</h2><p>업로드된 원본 PDF에는 작성자 식별자와 외부 실습 호스트·공격 링크가 포함되어 있어 공개 배포에서 제외했습니다. Week 4 보고서 화면에는 개인 식별 정보와 원본 URL을 제거한 6개 교육 사례만 제공합니다.</p><span className="sanitized-badge"><ShieldCheck size={16} />원본 파일 비공개 · 메타데이터 미배포</span></div>
        <div className="sanitized-summary"><strong>공개되는 항목</strong><ul><li>Stored·Reflected 유형 구분</li><li>Source·Transform·Sink·Context</li><li>발견 절차와 최소 영향 검증</li><li>근본 원인·수정·재시험 기준</li></ul><strong>제외한 항목</strong><ul><li>작성자·계정 식별 정보</li><li>외부 실습 서버 주소</li><li>공격 링크와 원본 스크린샷</li></ul></div>
      </section>
      <SectionTitle title="공식 문서" description="개념과 방어 기준은 표준·프로젝트 공식 문서를 우선합니다." />
      <div className="resource-filters">{categories.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="resource-list">{visible.map((item) => <a href={item.url} target="_blank" rel="noreferrer" key={item.url}><span>{item.category}</span><div><small>{item.provider}</small><strong>{item.title}</strong><p>{item.note}</p></div><ExternalLink size={17} /></a>)}</div>
      <SectionTitle title="전문 보고서 구조 참고" description="문장을 복사하지 않고 목적·범위·Finding·증거·Fix Note·재시험 배치를 봅니다." />
      <div className="resource-list compact">{publicReportResources.map((item) => <a href={item.url} target="_blank" rel="noreferrer" key={item.url}><span>REPORT</span><div><small>{item.org}</small><strong>{item.title}</strong><p>{item.use}</p></div><ExternalLink size={17} /></a>)}</div>
    </div>
  )
}

function ProgressPage({ progress, navigate }) {
  const weeks = Object.values(weekContent)
  const masteryEntries = Object.entries(progress.mastery)
  return (
    <div className="page-width progress-page">
      <section className="progress-summary"><div><small>완료한 개념</small><strong>{Object.values(progress.modulesRead).filter(Boolean).length}<span> / {weeks.reduce((sum, week) => sum + week.modules.length, 0)}</span></strong></div><div><small>완료한 실습</small><strong>{Object.values(progress.labs).filter((item) => item.status === 'completed').length}<span> / {weeks.reduce((sum, week) => sum + week.labs.length, 0)}</span></strong></div><div><small>제출한 주차</small><strong>{Object.keys(progress.submissions).length}<span> / 5</span></strong></div></section>
      <section className="document-section"><SectionTitle title="주차별 진행" description="실습은 시도와 완료를 나눠 계산하며, 퀴즈 80%와 제출 여부도 반영합니다." /><div className="progress-week-table"><div><span>주차</span><span>개념</span><span>실습</span><span>퀴즈</span><span>제출</span><span>진행</span></div>{weeks.map((week) => { const value = calculateWeekProgress(week, progress); return <button type="button" key={week.id} onClick={() => navigate({ page: 'week', week: week.index })}><strong>W{String(week.index).padStart(2, '0')} · {week.title}</strong><span>{week.modules.filter((item) => progress.modulesRead[item.id]).length}/{week.modules.length}</span><span>{week.labs.filter((item) => progress.labs[item.id]?.status === 'completed').length}/{week.labs.length}</span><span>{progress.quizScores[week.index]?.percent ?? 0}%</span><span>{progress.submissions[`week-${week.index}`] ? '제출' : '미제출'}</span><span><ProgressBar value={value} /><b>{value}%</b></span></button>})}</div></section>
      <section className="document-section"><SectionTitle title="개념 숙련도" description="문제를 한 번 풀었다고 자동으로 마스터가 되지 않습니다." />{masteryEntries.length ? <div className="mastery-list">{masteryEntries.map(([id, level]) => <div key={id}><strong>{id}</strong><Status text={masteryLabels[level] || level} tone="progress" /></div>)}</div> : <EmptyState icon={BookMarked} title="아직 평가된 숙련도가 없습니다." text="퀴즈, 실습 설명, 보고서 검토 결과가 쌓이면 표시됩니다." />}</section>
    </div>
  )
}

function AdminPage({ progress }) {
  const draft = progress.reports['local-xss-draft'] || emptyReport
  const reportChecks = validateReport(draft)
  const missing = reportChecks.filter((item) => !item.pass)
  const labs = Object.entries(progress.labs)
  const highHints = labs.filter(([, item]) => (item.hintLevel || 0) >= 2)
  const conceptFriction = [
    ['Source와 Sink 구분', highHints.filter(([id]) => id.includes('source') || id.includes('xss')).length + 2, 'Week 3·4'],
    ['상대 경로 기준점', progress.labs['w1-path']?.status === 'completed' ? 1 : 3, 'Week 1'],
    ['stdout과 stderr', progress.labs['w2-log-lab']?.status === 'completed' ? 1 : 2, 'Week 2'],
    ['XSS 실행과 영향 구분', missing.some((item) => item.id === 'impact') ? 4 : 1, 'Week 4'],
  ]
  return (
    <div className="page-width admin-page">
      <section className="admin-strip"><div><span>힌트 2단계 이상</span><strong>{highHints.length}개 실습</strong></div><div><span>보고서 누락</span><strong>{missing.length}개 항목</strong></div><div><span>재시험 누락</span><strong>{reportChecks.find((item) => item.id === 'retest')?.pass ? '0건' : '1건'}</strong></div></section>
      <div className="admin-grid"><section className="document-section"><SectionTitle title="많이 막힌 개념" description="완료율보다 오개념과 힌트 사용 지점을 우선 확인합니다." /><div className="friction-table"><div><span>개념</span><span>신호</span><span>위치</span></div>{conceptFriction.sort((a, b) => b[1] - a[1]).map(([name, count, location]) => <div key={name}><strong>{name}</strong><span>{count}회</span><small>{location}</small></div>)}</div></section><section className="document-section"><SectionTitle title="XSS Finding 품질" description="현재 학습자 초안에서 통과하지 못한 규칙입니다." /><div className="quality-missing">{missing.map((item) => <div key={item.id}><span>누락</span><strong>{item.label}</strong>{item.detail && <small>{item.detail}</small>}</div>)}</div></section></div>
      <section className="document-section"><SectionTitle title="운영 메모" /><div className="operator-notes"><ClipboardCheck size={20} /><p>힌트 사용 자체는 감점하지 않습니다. 같은 지점에서 반복해서 막히면 다음 주차 잠금보다 선수 개념 복습을 먼저 배정합니다. 보고서 검토에서는 심각도 숫자보다 Source·Sink·Context와 실제 증거가 이어지는지 확인합니다.</p></div></section>
    </div>
  )
}

function NotFound({ navigate }) {
  return <EmptyState icon={Search} title="해당 주차를 찾을 수 없습니다." text="현재 상세 구현 범위는 Week 0~4입니다." action="로드맵으로" onAction={() => navigate({ page: 'learn' })} />
}

function SectionTitle({ title, description, action, onAction }) {
  return <div className="section-title"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <button type="button" onClick={onAction}>{action}<ChevronRight size={15} /></button>}</div>
}

function ProgressBar({ value }) { return <span className="progress-bar" aria-label={`진행률 ${value}%`}><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></span> }

function Status({ text, tone = 'muted' }) { return <span className={`status status-${tone}`}><i />{text}</span> }

function EmptyState({ icon: Icon, title, text, action, onAction }) { return <div className="empty-state"><Icon size={24} /><strong>{title}</strong>{text && <p>{text}</p>}{action && <button className="button secondary" type="button" onClick={onAction}>{action}</button>}</div> }

function formatMinutes(value) { const hours = Math.floor(value / 60); const minutes = value % 60; return hours ? `${hours}시간${minutes ? ` ${minutes}분` : ''}` : `${minutes}분` }

function publicAsset(path) { return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}` }

function renderInlineCode(text) {
  const parts = String(text).split(/(`[^`]+`)/g)
  return parts.map((part, index) => part.startsWith('`') && part.endsWith('`') ? <code key={`${part}-${index}`}>{part.slice(1, -1)}</code> : part)
}
