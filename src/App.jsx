import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Gauge,
  GraduationCap,
  Library,
  Map as MapIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Terminal,
  Type,
  Upload,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { masteryLabels, officialResources, quizzes, quizRules, roadmap, weekContent } from './courseData'
import { industryDomains, jobCaptures, kisaRoles, workLanes } from './weekZeroData'
import { getMindmapNode } from './mindmapData'
import { completedExampleReport, emptyReport, publicReportResources } from './reportData'
import {
  calculateWeekProgress,
  getNextTask,
  mergeProgress,
  parseHash,
  routeToHash,
  validateReport,
} from './platformLogic'
import {
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  exportProgress,
  importProgress,
  loadProgress,
  saveProgress,
} from './storage'
import { LabCatalog, LabPage } from './components/Labs'
import LessonRenderer from './components/LessonRenderer'
import { getConcepts } from './content/conceptRegistry'
import { ReportEditor, ReportsPage } from './components/Reports'
import WeekZeroWorkspace, { WeekZeroExplorerPage } from './components/week0/WeekZeroWorkspace'
import { getLessonBlocks } from './content/lessonSchema'
import { buildLocalLearningInsights } from './adapters/analytics'
import { getLocalLearningGuidance } from './adapters/feedback'
import {
  calculateProgressBreakdown,
  evaluateQuizAttempt,
  getConceptTitle,
  getQuizRetryCount,
  recordQuizAttempt,
} from './learningModel'

const regularWeekCount = Object.values(weekContent).filter((week) => week.index > 0).length

const navItems = [
  { page: 'home', label: '홈', icon: BookOpen },
  { page: 'learn', label: `${regularWeekCount}주 로드맵`, icon: GraduationCap },
  { page: 'mindmap', label: '직무 지도', icon: MapIcon },
  { page: 'labs', label: '실습실', icon: Terminal },
  { page: 'reports', label: '보고서', icon: FileCheck2 },
  { page: 'resources', label: '리소스', icon: Library },
  { page: 'progress', label: '내 진도', icon: Gauge },
  { page: 'insights', label: '내 학습 분석', icon: UserRoundCheck },
]

const pageMeta = {
  home: ['내 학습', '오늘 할 항목과 복습할 개념을 확인합니다.'],
  learn: ['학습 로드맵', 'Week 0은 사전 준비이며 이후 주차는 정규 과정입니다.'],
  week: ['주차 학습', '개념, 실습, 이해 확인과 학습 기록을 한 흐름으로 진행합니다.'],
  mindmap: ['정보보안 핵심 용어와 분야·직무 지도', '실제 공개 공고 표본의 근거 범위를 구분하며 분야와 세부 직무를 탐색합니다.'],
  labs: ['실습실', '로컬 또는 명시적으로 허가된 교육 환경만 사용합니다.'],
  lab: ['실습', '활동 유형에 맞게 결과를 확인하고 수행 과정과 관찰을 기록합니다.'],
  reports: ['취약점 보고서', '발견 사실을 재현 가능한 Finding으로 바꿉니다.'],
  'report-editor': ['Finding 편집기', 'Source부터 재시험까지 근거가 이어지는지 점검합니다.'],
  resources: ['리소스', '과정에서 사용한 공식 문서와 로컬 참고 자료입니다.'],
  progress: ['내 진도', '완료 여부와 개념 숙련도를 따로 확인합니다.'],
  insights: ['내 학습 분석', '이 브라우저에 저장된 실제 학습 기록만 계산합니다.'],
  'not-found': ['페이지를 찾을 수 없습니다', '주소를 확인하거나 로드맵에서 다시 이동하세요.'],
}

function getAvailableWeeks() {
  return Object.values(weekContent).sort((left, right) => left.index - right.index)
}

function getRecordableWeeks(weeks) {
  return weeks.filter((week) => Boolean(week.weeklyRecord))
}

function formatWeekRange(weeks) {
  if (!weeks.length) return '학습 과정'
  const first = String(weeks[0].index).padStart(2, '0')
  const last = String(weeks.at(-1).index).padStart(2, '0')
  return first === last ? `Week ${first}` : `Week ${first}~${last}`
}

function getRoadmapItems() {
  const roadmapByIndex = new Map(roadmap.map((item) => [item.index, item]))
  const indexes = new Set([...roadmapByIndex.keys(), ...getAvailableWeeks().map((week) => week.index)])
  return [...indexes].sort((left, right) => left - right).map((index) => {
    const contentWeek = weekContent[index]
    const roadmapWeek = roadmapByIndex.get(index)
    if (!contentWeek) return roadmapWeek
    return {
      ...roadmapWeek,
      id: contentWeek.id,
      index: contentWeek.index,
      title: contentWeek.title,
      summary: contentWeek.summary,
      deliverable: contentWeek.deliverable || contentWeek.deliverables?.[0] || roadmapWeek?.deliverable || '학습 결과 정리',
      keyConcepts: contentWeek.keyConcepts || roadmapWeek?.keyConcepts || contentWeek.modules.slice(0, 3).map((module) => module.title),
      status: roadmapWeek?.status === 'current' ? 'current' : 'available',
    }
  }).filter(Boolean)
}

function readInitialProgress() {
  return loadProgress()
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const [initialLoad] = useState(readInitialProgress)
  const [progress, setProgress] = useState(() => initialLoad.progress || mergeProgress())
  const [storageState, setStorageState] = useState(() => ({ source: initialLoad.source, canPersist: initialLoad.canPersist, warning: initialLoad.warning }))
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const menuButtonRef = useRef(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    if (!window.location.hash) window.history.replaceState(null, '', '#/')
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!storageState.canPersist) return
    const result = saveProgress(progress)
    if (!result.ok) {
      setStorageState({ source: result.source, canPersist: false, warning: result.warning })
      setToast(result.warning?.message || '변경 내용을 저장하지 못했습니다.')
    }
  }, [progress, storageState.canPersist])

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', `${progress.settings.fontScale}%`)
  }, [progress.settings.fontScale])

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
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  const updateProgress = (updater) => {
    setProgress((current) => mergeProgress(typeof updater === 'function' ? updater(current) : { ...current, ...updater }))
  }

  const meta = pageMeta[route.page] || pageMeta['not-found']
  const currentWeek = route.page === 'week' ? weekContent[route.week] : null
  const roadmapWeek = route.page === 'week' ? roadmap.find((item) => item.index === route.week) : null
  const invalidModule = Boolean(currentWeek && route.moduleId && !currentWeek.modules.some((module) => module.id === route.moduleId))
  const validReport = route.page !== 'report-editor' || route.reportId === 'local-xss-draft' || route.reportId === completedExampleReport.id || Boolean(progress.reports[route.reportId])
  const pageTitle = currentWeek ? `Week ${String(currentWeek.index).padStart(2, '0')} · ${currentWeek.title}` : roadmapWeek ? `Week ${String(roadmapWeek.index).padStart(2, '0')} · ${roadmapWeek.title}` : meta[0]

  useEffect(() => {
    document.title = `${pageTitle} · SecTrack`
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [pageTitle])

  const setSidebarMode = (sidebarMode) => updateProgress((current) => ({ ...current, settings: { ...current.settings, sidebarMode } }))

  const exportData = () => {
    const result = exportProgress(progress)
    if (!result.ok) { setToast(result.warning?.message || '데이터를 내보내지 못했습니다.'); return }
    const url = URL.createObjectURL(new Blob([result.text], { type: 'application/json;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `sectrack-learning-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setToast('전체 학습 데이터를 내보냈습니다.')
  }

  const importData = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = importProgress(String(reader.result || ''))
      if (result.ok) {
        setProgress(result.progress)
        setStorageState({ source: result.source, canPersist: true, warning: null })
        setToast('전체 학습 데이터를 가져왔습니다.')
      } else setToast(`${result.warning?.message || '가져오기 파일을 확인할 수 없습니다.'} 기존 데이터는 변경하지 않았습니다.`)
    }
    reader.readAsText(file)
  }

  const exportRecoveryData = () => {
    try {
      const key = storageState.source === 'v2' ? LEGACY_STORAGE_KEY : STORAGE_KEY
      const raw = localStorage.getItem(key)
      if (!raw) { setToast('보존된 원본 데이터를 찾을 수 없습니다.'); return }
      const url = URL.createObjectURL(new Blob([raw], { type: 'application/json;charset=utf-8' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `sectrack-recovery-${storageState.source || 'data'}.json`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch { setToast('보존된 원본 데이터를 내보내지 못했습니다.') }
  }

  return (
    <div className={`app-shell ${progress.settings.sidebarMode === 'compact' ? 'sidebar-compact' : ''}`}>
      <Sidebar route={route} navigate={navigate} open={menuOpen} close={closeMenu} progress={progress} mode={progress.settings.sidebarMode} setMode={setSidebarMode} />
      <div className="app-frame">
        <Topbar
          title={pageTitle}
          subtitle={currentWeek ? currentWeek.summary : roadmapWeek ? roadmapWeek.summary : meta[1]}
          onMenu={() => setMenuOpen(true)}
          navigate={navigate}
          menuButtonRef={menuButtonRef}
          menuOpen={menuOpen}
          progress={progress}
          updateProgress={updateProgress}
          onExport={exportData}
          onImport={importData}
        />
        <main className="main-content" id="main-content" tabIndex="-1">
          {storageState.warning && <section className="storage-recovery" role="alert"><AlertTriangle size={20} /><div><strong>자동 저장을 중지했습니다.</strong><p>{storageState.warning.message} 기존 원본은 덮어쓰지 않았습니다.</p></div><button type="button" onClick={exportRecoveryData}>원본 데이터 내보내기</button></section>}
          {route.page === 'home' && <HomePage progress={progress} navigate={navigate} />}
          {route.page === 'learn' && <RoadmapPage progress={progress} navigate={navigate} />}
          {route.page === 'week' && currentWeek && !invalidModule && <WeekPage week={currentWeek} route={route} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={setToast} />}
          {route.page === 'week' && !currentWeek && roadmapWeek?.status === 'preview' && <PreviewWeekPage week={roadmapWeek} navigate={navigate} />}
          {route.page === 'week' && ((!currentWeek && !roadmapWeek) || invalidModule) && <NotFound navigate={navigate} />}
          {route.page === 'mindmap' && <WeekZeroExplorerPage progress={progress} updateProgress={updateProgress} navigate={navigate} notify={setToast} />}
          {route.page === 'labs' && <LabCatalog progress={progress} navigate={navigate} />}
          {route.page === 'lab' && route.labId === 'w0-map' && <WeekZeroExplorerPage progress={progress} updateProgress={updateProgress} navigate={navigate} notify={setToast} initialTab="map" />}
          {route.page === 'lab' && route.labId !== 'w0-map' && <LabPage labId={route.labId} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={setToast} />}
          {route.page === 'reports' && <ReportsPage progress={progress} navigate={navigate} />}
          {route.page === 'report-editor' && validReport && <ReportEditor reportId={route.reportId} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={setToast} />}
          {route.page === 'report-editor' && !validReport && <NotFound navigate={navigate} />}
          {route.page === 'resources' && <ResourcesPage />}
          {route.page === 'progress' && <ProgressPage progress={progress} navigate={navigate} />}
          {route.page === 'insights' && <InsightsPage progress={progress} />}
          {route.page === 'not-found' && <NotFound navigate={navigate} />}
        </main>
      </div>
      {toast && <div className="toast" role="status"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  )
}

function Sidebar({ route, navigate, open, close, progress, mode, setMode }) {
  const availableWeeks = getAvailableWeeks()
  const total = availableWeeks.length ? Math.round(availableWeeks.reduce((sum, week) => sum + calculateWeekProgress(week, progress), 0) / availableWeeks.length) : 0
  const active = route.page === 'week' ? 'learn' : route.page === 'lab' ? 'labs' : route.page === 'report-editor' ? 'reports' : route.page
  const next = getNextTask(availableWeeks, progress)
  const sidebarRef = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { close(); return }
      if (event.key !== 'Tab') return
      const items = [...sidebarRef.current.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')]
      if (!items.length) return
      const first = items[0]; const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    sidebarRef.current?.querySelector('button')?.focus()
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus?.() }
  }, [open, close])
  return (
    <>
      {open && <button className="sidebar-backdrop" type="button" onClick={close} aria-label="메뉴 닫기" />}
      <aside id="primary-sidebar" ref={sidebarRef} className={`sidebar ${open ? 'is-open' : ''} ${mode === 'compact' ? 'is-compact' : ''}`} aria-label="주요 탐색">
        <div className="sidebar-head">
          <button className="brand" type="button" aria-label="SecTrack 홈" onClick={() => navigate({ page: 'home' })}>
            <span className="brand-symbol"><ShieldCheck size={19} /></span>
            <span><strong>SECTRACK</strong><small>{regularWeekCount}주 보안 기초 트랙</small></span>
          </button>
          <button className="icon-button sidebar-close" type="button" onClick={close} aria-label="메뉴 닫기"><PanelLeftClose size={19} /></button>
          <button className="icon-button sidebar-collapse" type="button" onClick={() => setMode(mode === 'compact' ? 'expanded' : 'compact')} aria-label={mode === 'compact' ? '사이드바 펼치기' : '사이드바 접기'} title={mode === 'compact' ? '사이드바 펼치기' : '사이드바 접기'}>{mode === 'compact' ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
        </div>
        <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
        <nav className="primary-nav" aria-label="주요 메뉴">
          <span className="nav-label">LEARNING</span>
          {navItems.slice(0, -1).map(({ page, label, icon: Icon }) => (
            <button type="button" key={page} title={mode === 'compact' ? label : undefined} aria-label={label} aria-current={active === page ? 'page' : undefined} className={active === page ? 'active' : ''} onClick={() => navigate({ page })}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
          <span className="nav-label nav-label-spaced">WEEKS</span>
          <div className="sidebar-week-links" aria-label="학습 주차">
            {availableWeeks.map((week) => <button type="button" key={week.id} title={mode === 'compact' ? `Week ${String(week.index).padStart(2, '0')} · ${week.title}` : undefined} aria-label={`Week ${String(week.index).padStart(2, '0')} · ${week.title}`} aria-current={route.page === 'week' && route.week === week.index ? 'page' : undefined} className={route.page === 'week' && route.week === week.index ? 'active' : ''} onClick={() => navigate({ page: 'week', week: week.index, tab: 'overview' })}><span>W{String(week.index).padStart(2, '0')}</span><strong>{week.title}</strong></button>)}
          </div>
          <span className="nav-label nav-label-spaced">MANAGEMENT</span>
          {navItems.slice(-1).map(({ page, label, icon: Icon }) => <button type="button" key={page} title={mode === 'compact' ? label : undefined} aria-label={label} aria-current={active === page ? 'page' : undefined} className={active === page ? 'active' : ''} onClick={() => navigate({ page })}><Icon size={18} /><span>{label}</span></button>)}
        </nav>
        <section className="sidebar-progress" aria-label={`${formatWeekRange(availableWeeks)} 학습 진행률`}>
          <div><span>{formatWeekRange(availableWeeks)} 진행</span><strong>{total}%</strong></div>
          <ProgressBar value={total} />
          <p>다음 할 일</p>
          {next && <strong>Week {String(next.week).padStart(2, '0')} · {next.label}</strong>}
        </section>
        <div className="sidebar-user"><span className="avatar"><UserRoundCheck size={16} /></span><span><strong>{progress.settings.displayName || '내 학습'}</strong><small>이 브라우저에만 저장</small></span></div>
      </aside>
    </>
  )
}

function Topbar({ title, subtitle, onMenu, navigate, menuButtonRef, menuOpen, progress, updateProgress, onExport, onImport }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef(null)
  const importRef = useRef(null)
  const fontOptions = [['100', '보통'], ['112.5', '크게'], ['125', '더 크게'], ['150', '최대']]
  useEffect(() => {
    if (!settingsOpen) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') setSettingsOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [settingsOpen])
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button ref={menuButtonRef} type="button" className="icon-button mobile-menu" onClick={onMenu} aria-label="메뉴 열기" aria-expanded={menuOpen} aria-controls="primary-sidebar"><Menu size={20} /></button>
        <div><h1>{title}</h1><p>{subtitle}</p></div>
      </div>
      <div className="topbar-actions">
        <div className="accessibility-menu" ref={settingsRef}>
          <button type="button" className="icon-button" aria-label="글자 크기와 데이터 설정" aria-expanded={settingsOpen} onClick={() => setSettingsOpen((value) => !value)}><Type size={18} /></button>
          {settingsOpen && <section className="settings-popover" aria-label="화면과 데이터 설정"><header><strong>글자 크기</strong><span>{progress.settings.fontScale}%</span></header><div className="font-scale-options">{fontOptions.map(([value, label]) => <button type="button" key={value} className={progress.settings.fontScale === value ? 'active' : ''} aria-pressed={progress.settings.fontScale === value} onClick={() => updateProgress((current) => ({ ...current, settings: { ...current.settings, fontScale: value } }))}><span>{label}</span><small>{value}%</small></button>)}</div><label className="display-name-setting"><span>로컬 표시 이름 <small>선택</small></span><input maxLength="30" value={progress.settings.displayName || ''} placeholder="내 학습" onChange={(event) => updateProgress((current) => ({ ...current, settings: { ...current.settings, displayName: event.target.value } }))} /></label><div className="data-settings"><button type="button" onClick={onExport}><Download size={16} />전체 데이터 내보내기</button><button type="button" onClick={() => importRef.current?.click()}><Upload size={16} />전체 데이터 가져오기</button><input ref={importRef} hidden type="file" accept="application/json" onChange={(event) => { if (event.target.files?.[0]) onImport(event.target.files[0]); event.target.value = '' }} /></div><p>학습 데이터는 이 브라우저의 localStorage에 저장됩니다.</p></section>}
        </div>
        <button type="button" className="quiet-command" onClick={() => navigate({ page: 'progress' })}><UserRoundCheck size={16} />내 진도</button>
      </div>
    </header>
  )
}

function HomePage({ progress, navigate }) {
  const weeks = getAvailableWeeks()
  const recordableWeeks = getRecordableWeeks(weeks)
  const next = getNextTask(weeks, progress)
  const week = weekContent[next.week]
  const progressValues = weeks.map((item) => calculateWeekProgress(item, progress))
  const submitted = recordableWeeks.filter((item) => progress.submissions[`week-${item.index}`]).length
  const reviewed = Object.values(progress.conceptMastery).filter((value) => ['apply', 'reproduce'].includes(value)).length
  const reviewModules = weeks.flatMap((item) => item.modules.map((module) => ({ ...module, week: item.index }))).filter((module) => ['now', 'later'].includes(progress.moduleChecks[module.id]?.reviewState) || ['unknown', 'heard'].includes(progress.conceptMastery[module.id])).slice(0, 3)
  const guidance = getLocalLearningGuidance(next)
  const openNext = () => navigate(next.route || { page: 'week', week: next.week, tab: 'overview' })
  return (
    <div className="home-layout page-width">
      <section className="home-main">
        <div className="today-panel">
          <div className="section-kicker"><span>다음 할 일</span><Status text={next.label} tone="progress" /></div>
          <div className="today-copy">
            <div><small>지금 할 항목 하나</small><h2>{next.title}</h2><p>{week.summary}</p></div>
            <button className="button primary" type="button" onClick={openNext}>이어서 하기<ArrowRight size={16} /></button>
          </div>
          <div className="today-meta">
            <span><BookOpen size={16} />Week {String(next.week).padStart(2, '0')}</span>
            <span><ShieldCheck size={16} />로컬·허가 환경</span>
          </div>
        </div>

        <SectionTitle title={`${formatWeekRange(weeks)} 학습 흐름`} description="완료 표시와 개념 숙련도는 별도로 기록됩니다." action="전체 로드맵" onAction={() => navigate({ page: 'learn' })} />
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

        <SectionTitle title="학습 안내" description="현재 다음 활동에 필요한 기준입니다." />
        <div className="feedback-row"><BookMarked size={18} /><div><strong>{guidance.title}</strong><p>{guidance.body}</p><small>자동 학습 안내 · 로컬 규칙</small></div></div>
      </section>
      <aside className="home-rail">
        <section className="rail-section"><h2>이번 과정</h2><dl className="compact-stats"><div><dt>주차 학습 정리</dt><dd>{submitted} / {recordableWeeks.length}</dd></div><div><dt>기초 적용 이상</dt><dd>{reviewed}개</dd></div><div><dt>열어 본 힌트</dt><dd>{Object.values(progress.labs).reduce((sum, item) => sum + (item.hintLevel || 0), 0)}단계</dd></div></dl></section>
        <section className="rail-section"><h2>복습할 개념</h2>{reviewModules.length ? reviewModules.map((module) => <button className="review-item" type="button" key={module.id} onClick={() => navigate({ page: 'week', week: module.week, tab: 'concepts', moduleId: module.id })}><span>W{String(module.week).padStart(2, '0')}</span><strong>{module.title}</strong><small>최근 숙련 근거를 다시 확인</small></button>) : <p className="rail-empty">아직 복습 대상으로 기록된 개념이 없습니다.</p>}</section>
        <section className="rail-section due-list"><h2>정리하지 않은 주차</h2>{recordableWeeks.filter((item) => !progress.submissions[`week-${item.index}`]).slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => navigate({ page: 'week', week: item.index, tab: 'record' })}><span>W{String(item.index).padStart(2, '0')}</span><strong>{item.deliverables[0]}</strong><ChevronRight size={15} /></button>)}</section>
      </aside>
    </div>
  )
}

function RoadmapPage({ progress, navigate }) {
  const roadmapItems = getRoadmapItems()
  const orientation = roadmapItems.find((item) => item.index === 0)
  const formalWeeks = roadmapItems.filter((item) => item.index !== 0)
  const phases = [
    { id: 'foundation', label: 'FOUNDATION', title: 'Linux와 관찰의 기본', matches: (index) => index >= 1 && index <= 2 },
    { id: 'web', label: 'WEB', title: '웹 요청과 브라우저 보안', matches: (index) => index >= 3 && index <= 6 },
    { id: 'system', label: 'SYSTEM · PWN', title: '시스템 구조와 취약점 분석', matches: (index) => index >= 7 && index <= 11 },
    { id: 'applied', label: 'APPLIED SECURITY', title: '분야 확장과 종합', matches: (index) => index >= 12 },
  ]
  return (
    <div className="page-width roadmap-page">
      {orientation && <div className="orientation-row">
        <span className="orientation-label">사전 준비</span>
        <RoadmapItem item={orientation} progress={weekContent[orientation.index] ? calculateWeekProgress(weekContent[orientation.index], progress) : 0} navigate={navigate} />
      </div>}
      <div className="roadmap-divider"><span>정규 {formalWeeks.length}주 과정</span></div>
      {phases.map((phase) => { const items = formalWeeks.filter((item) => phase.matches(item.index)); return items.length ? <section className="roadmap-phase" key={phase.id}><header><span>{phase.label}</span><h2>{phase.title}</h2></header><div className="roadmap-path">{items.map((item) => <RoadmapItem key={item.id} item={item} progress={weekContent[item.index] ? calculateWeekProgress(weekContent[item.index], progress) : 0} navigate={navigate} />)}</div></section> : null })}
    </div>
  )
}

function RoadmapItem({ item, progress, navigate }) {
  const preview = item.status === 'preview'
  return (
    <button type="button" className={`roadmap-item ${preview ? 'preview' : ''}`} onClick={() => navigate({ page: 'week', week: item.index, tab: 'overview' })}>
      <span className="roadmap-node">{preview ? <FileText size={15} /> : progress === 100 ? <Check size={17} /> : String(item.index).padStart(2, '0')}</span>
      <span className="roadmap-copy"><small>{item.index === 0 ? 'ORIENTATION · 필수 핵심' : `WEEK ${String(item.index).padStart(2, '0')} · 필수 핵심`}</small><strong>{item.title}</strong><p>{item.summary}</p><span className="concept-tags">{item.keyConcepts.map((tag) => <em key={tag}>{tag}</em>)}</span></span>
      <span className="roadmap-deliverable"><small>대표 산출물</small><strong>{item.deliverable}</strong>{preview ? <span>미리보기</span> : <ProgressBar value={progress} />}</span>
      <ChevronRight size={18} />
    </button>
  )
}

function PreviewWeekPage({ week, navigate }) {
  return (
    <div className="page-width week-preview-page">
      <button className="back-link" type="button" onClick={() => navigate({ page: 'learn' })}><ArrowLeft size={16} />학습 로드맵</button>
      <header className="preview-week-header"><span>WEEK {String(week.index).padStart(2, '0')} · 미리보기</span><h2>{week.title}</h2><p>{week.summary}</p><Status text="설계 중" tone="muted" /></header>
      <div className="preview-week-grid">
        <section className="document-section"><SectionTitle title="학습 목표" /><ul className="check-list">{week.objectives.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul></section>
        <section className="document-section"><SectionTitle title="선수지식" /><ul>{week.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="document-section"><SectionTitle title="예정 핵심 개념" /><div className="concept-tags">{week.keyConcepts.map((item) => <em key={item}>{item}</em>)}</div></section>
        <section className="document-section"><SectionTitle title="예정 실습" /><ul>{week.plannedLabs.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="document-section"><SectionTitle title="대표 산출물" /><p>{week.deliverable}</p></section>
        <section className="document-section"><SectionTitle title="연결 직무" /><div className="concept-tags">{week.relatedRoles.map((item) => <em key={item}>{item}</em>)}</div></section>
      </div>
    </div>
  )
}

function WeekPage({ week, route, progress, updateProgress, navigate, notify }) {
  if (week.index === 0) return <WeekZeroPage route={route} week={week} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={notify} />
  const tab = route.tab || 'overview'
  const openTab = (nextTab, moduleId) => navigate({ page: 'week', week: week.index, tab: nextTab, ...(moduleId ? { moduleId } : {}) })
  const breakdown = calculateProgressBreakdown(week, progress)
  const value = breakdown.percent
  const requiredLabs = week.labs.filter((lab) => lab.path === 'required')
  const requiredModules = week.modules.filter((module) => module.path === 'required')
  const completedLabs = requiredLabs.filter((lab) => progress.labs[lab.id]?.status === 'completed').length
  const readModules = requiredModules.filter((module) => progress.modulesRead[module.id]).length
  const tabs = [
    ['overview', '이번 주'], ['concepts', '개념 모듈'], ['labs', `필수 활동 ${completedLabs}/${requiredLabs.length}`], ['quiz', '이해 확인'], ['record', '주차 정리'],
  ]
  return (
    <div className="page-width week-page">
      <button className="back-link" type="button" onClick={() => navigate({ page: 'learn' })}><ArrowLeft size={16} />학습 로드맵</button>
      <section className="week-header">
        <div><span className="section-kicker">WEEK {String(week.index).padStart(2, '0')}</span><h2>{week.title}</h2><p>{week.summary}</p></div>
        <div className="week-header-progress"><span><small>필수 경로 진행</small><strong>{value}%</strong></span><ProgressBar value={value} /><small>{readModules}/{requiredModules.length}개 개념 · {completedLabs}/{requiredLabs.length}개 활동</small></div>
      </section>
      <nav className="tab-bar" aria-label="주차 학습 메뉴">{tabs.map(([id, label]) => <button type="button" aria-current={tab === id ? 'page' : undefined} key={id} className={tab === id ? 'active' : ''} onClick={() => openTab(id)}>{label}</button>)}</nav>
      {tab === 'overview' && <WeekOverview week={week} progress={progress} navigate={navigate} setTab={openTab} />}
      {tab === 'concepts' && <ConceptReader week={week} selectedId={route.moduleId} progress={progress} updateProgress={updateProgress} openModule={(moduleId) => openTab('concepts', moduleId)} openLab={(labId) => navigate({ page: 'lab', labId })} />}
      {tab === 'labs' && <WeekLabs week={week} progress={progress} navigate={navigate} />}
      {tab === 'quiz' && <QuizView key={week.index} week={week} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={notify} />}
      {tab === 'record' && <SubmissionView week={week} progress={progress} updateProgress={updateProgress} notify={notify} />}
    </div>
  )
}

function WeekZeroPage({ route, week, progress, updateProgress, navigate, notify }) {
  const supportedTabs = new Set(['overview', 'glossary', 'careers', 'map', 'quiz', 'concepts', 'labs'])
  const legacyTab = route.tab === 'concepts' ? 'glossary' : route.tab === 'labs' ? 'map' : route.tab
  const tab = supportedTabs.has(route.tab || 'overview') ? legacyTab || 'overview' : 'overview'
  const tabs = [['overview', '이번 주'], ['glossary', '보안 용어'], ['careers', '분야·직무 지도'], ['map', '나의 보안 지도'], ['quiz', '이해 확인']]
  const mapCompleted = progress.labs['w0-map']?.status === 'completed'
  const quizScore = progress.quizScores[0]?.percent
  const openTab = (next) => navigate({ page: 'week', week: 0, tab: next })
  return <div className="page-width week-page week0-page">
    <button className="back-link" type="button" onClick={() => navigate({ page: 'learn' })}><ArrowLeft size={16} />학습 로드맵</button>
    <section className="week-header"><div><span className="section-kicker">WEEK 00</span><h2>{week.title}</h2><p>{week.summary}</p></div><div className="week0-header-status"><span><small>나의 보안 지도</small><strong>{mapCompleted ? '완료' : '작성 중'}</strong></span><span><small>이해 확인</small><strong>{quizScore === undefined ? '미응시' : `${quizScore}%`}</strong></span></div></section>
    <nav className="tab-bar week0-tab-bar" aria-label="Week 0 학습 메뉴">{tabs.map(([id, label]) => <button type="button" aria-current={tab === id ? 'page' : undefined} key={id} className={tab === id ? 'active' : ''} onClick={() => openTab(id)}>{label}</button>)}</nav>
    {tab === 'quiz' ? <QuizView key="week-zero" week={week} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={notify} /> : <WeekZeroWorkspace activeTab={tab} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={notify} onTabChange={openTab} onCompleteMap={() => { updateProgress((current) => ({ ...current, labs: { ...current.labs, 'w0-map': { ...(current.labs['w0-map'] || {}), status: 'completed', completedAt: new Date().toISOString() } } })); notify('나의 보안 지도를 완료했습니다.') }} />}
  </div>
}

function WeekOverview({ week, navigate, setTab }) {
  const requiredModuleCount = week.modules.filter((module) => module.path !== 'extension').length
  const extensionModuleCount = week.modules.length - requiredModuleCount
  const hasExtensionLab = week.labs.some((lab) => lab.path === 'extension')
  return (
    <div className="week-overview">
      <div className="week-overview-main">
        <section className="document-section">
          <SectionTitle title="이번 주에 할 일" />
          <ol className="sequence-list">
            <li><span>01</span><div><strong>필수 개념 모듈 {requiredModuleCount}개 읽기</strong><p>용어와 데이터 흐름을 먼저 확인합니다.</p></div><button type="button" onClick={() => setTab('concepts')}>열기</button></li>
            {extensionModuleCount > 0 && <li><span>02</span><div><strong>심화 개념 모듈 {extensionModuleCount}개</strong><p>필수 경로를 마친 뒤 더 깊게 확인합니다.</p></div><button type="button" onClick={() => setTab('concepts')}>열기</button></li>}
            <li><span>{extensionModuleCount > 0 ? '03' : '02'}</span><div><strong>내부 실습으로 관찰 기록</strong><p>단계형 힌트는 막힌 경우에만 엽니다.</p></div><button type="button" onClick={() => setTab('labs')}>열기</button></li>
            {hasExtensionLab && <li><span>{extensionModuleCount > 0 ? '04' : '03'}</span><div><strong>공식 외부 실습 또는 심화 과제</strong><p>자격 증명과 토큰을 마스킹하고 수행 과정을 기록합니다.</p></div><button type="button" onClick={() => setTab('labs')}>열기</button></li>}
            <li><span>{String(3 + Number(extensionModuleCount > 0) + Number(hasExtensionLab)).padStart(2, '0')}</span><div><strong>이해 확인과 주차 학습 정리</strong><p>오답 개념을 다시 확인한 뒤 이번 주 학습을 본인의 문장으로 정리합니다.</p></div><button type="button" onClick={() => setTab('quiz')}>열기</button></li>
          </ol>
        </section>
        <section className="document-section"><SectionTitle title="학습 목표" /><ul className="check-list">{week.objectives.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul></section>
        {week.index === 0 && <WeekZeroCareerOverview navigate={navigate} />}
        <section className="document-section"><SectionTitle title="보고서와 연결" /><div className="report-connection"><FileText size={20} /><p>{week.reportConnection}</p>{week.modules.some((module) => module.id === 'w4-types') && <button className="button secondary" type="button" onClick={() => navigate({ page: 'report-editor', reportId: 'local-xss-draft' })}>Finding 초안 열기<ArrowRight size={15} /></button>}</div></section>
      </div>
      <aside className="week-aside">
        <section><h3>학습 구성</h3><dl><div><dt>핵심 개념</dt><dd>{week.modules.filter((item) => item.path !== 'extension').length}개</dd></div><div><dt>필수 활동</dt><dd>{week.labs.filter((item) => item.path !== 'extension').length}개</dd></div><div><dt>심화 활동</dt><dd>{week.labs.filter((item) => item.path === 'extension').length}개</dd></div><div><dt>이해 확인</dt><dd>{quizzes[week.index].length}문항</dd></div></dl></section>
        <section><h3>선수지식</h3><ul>{week.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h3>제출물</h3><ul>{week.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="next-week"><span>NEXT</span><strong>{week.next}</strong></section>
      </aside>
    </div>
  )
}

function WeekZeroCareerOverview({ navigate }) {
  const [capture, setCapture] = useState(null)
  const closeCapture = useCallback(() => setCapture(null), [])
  return (
    <>
      <section className="document-section career-overview">
        <SectionTitle title="기술, 직무, 산업을 구분해서 보기" description="웹·시스템은 공부할 기술이고, 모의해킹·관제는 회사에서 맡는 역할이며, OT·선박·우주는 보호할 산업입니다." />
        <div className="three-layer-flow"><span><small>기술</small><strong>웹 · 시스템 · 네트워크</strong></span><ArrowRight size={17} /><span><small>직무</small><strong>설계 · 검증 · 탐지 · 관리</strong></span><ArrowRight size={17} /><span><small>산업</small><strong>IT · 금융 · OT · 이동체</strong></span></div>
        <div className="work-lane-list">{workLanes.map((lane) => <article key={lane.id}><span>{lane.label}</span><h3>{lane.title}</h3><p>{lane.description}</p><small>결과물</small><strong>{lane.outputs.join(' · ')}</strong></article>)}</div>
        <button className="text-action" type="button" onClick={() => navigate({ page: 'mindmap' })}>전체 인터랙티브 마인드맵 열기<ArrowRight size={15} /></button>
      </section>
      <section className="document-section career-role-section">
        <SectionTitle title="KISA 공식 직무 가이드에서 업무 읽기" description="현재 채용 여부가 아닌 직무 분류 자료입니다. 직무명보다 담당 업무와 결과물을 기준으로 비교합니다." />
        <div className="career-role-table"><div className="career-role-head"><span>직무</span><span>주요 업무</span><span>대표 결과물</span></div>{kisaRoles.map((role) => <div key={role.code}><strong>{role.title}</strong><p>{role.does}</p><span>{role.deliverables}</span></div>)}</div>
      </section>
      <section className="document-section job-evidence-section">
        <SectionTitle title="참가기업 직무 프로필에서 역할 읽기" description="외부 페이지로 이동하지 않고 로컬 캡처를 확대해 참가기업이 제시한 직무 범위를 읽습니다." />
        <div className="job-capture-grid">{jobCaptures.map((item) => <button type="button" key={item.company} onClick={(event) => setCapture({ item, trigger: event.currentTarget })}><img src={publicAsset(item.image)} alt={`${item.company} 정보보호 취업박람회 참가기업 프로필 캡처`} /><span><strong>{item.company}</strong><small>{item.title}</small></span></button>)}</div>
        <p className="source-status-note">현재 자료는 2026 KISIA 정보보호 취업박람회 참가기업 프로필 캡처입니다. 개별 채용 공고의 모집 중 여부·근무지·마감일은 확인된 정보로 표시하지 않습니다.</p>
      </section>
      <section className="document-section"><SectionTitle title="산업 보안은 우선순위가 달라진다" /><div className="industry-table">{industryDomains.slice(0, 8).map((item) => <article key={item.title}><strong>{item.title}</strong><span>{item.assets}</span><p>{item.concern}</p></article>)}</div></section>
      {capture && <ImageDialog item={capture.item} trigger={capture.trigger} close={closeCapture} />}
    </>
  )
}

function ImageDialog({ item, trigger, close }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    const focusable = () => [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    dialog.querySelector('.image-modal button')?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const first = items[0]; const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); trigger?.focus?.() }
  }, [close, trigger])
  return <div ref={dialogRef} className="modal-layer" role="dialog" aria-modal="true" aria-label={`${item.company} 참가기업 프로필 확대`}><button className="modal-backdrop" type="button" tabIndex="-1" onClick={close} aria-label="확대 화면 닫기" /><div className="image-modal"><button className="icon-button" type="button" onClick={close} aria-label="닫기"><X size={20} /></button><img src={publicAsset(item.image)} alt={`${item.company} 참가기업 프로필 확대`} /></div></div>
}

function ConceptReader({ week, selectedId, progress, updateProgress, openModule, openLab }) {
  const selected = week.modules.find((item) => item.id === selectedId) || week.modules[0]
  const done = Boolean(progress.modulesRead[selected.id])
  const check = progress.moduleChecks[selected.id] || {}
  const sections = getLessonBlocks(selected).filter((block) => block.title || block.type === 'checkpoint')
  const isDeepGuide = selected.contentLevel === 'deep-guide-v2'
  const prerequisiteConcepts = getConcepts(selected.prerequisiteConceptIds || [])
  const toggleDone = () => updateProgress((current) => ({ ...current, modulesRead: { ...current.modulesRead, [selected.id]: !done } }))
  const updateCheckpoint = (checkpointId, result) => updateProgress((current) => ({
    ...current,
    moduleChecks: {
      ...current.moduleChecks,
      [selected.id]: {
        ...(current.moduleChecks[selected.id] || {}),
        checkpoints: {
          ...(current.moduleChecks[selected.id]?.checkpoints || {}),
          [checkpointId]: result,
        },
        updatedAt: new Date().toISOString(),
      },
    },
    lastActivityAt: new Date().toISOString(),
  }))
  const scrollToSection = (block, index) => document.getElementById(`${selected.id}-${block.id || `${block.type}-${index + 1}`}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <div className="reader-layout">
      <aside className="reader-toc"><span>WEEK {String(week.index).padStart(2, '0')} · CONCEPTS</span><h2>개념 목차</h2>{week.modules.map((module, index) => <button type="button" key={module.id} className={selected.id === module.id ? 'active' : ''} onClick={() => openModule(module.id)}><span>{progress.modulesRead[module.id] ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span><strong>{module.title}</strong></button>)}{sections.length > 1 && <nav className="reader-section-toc" aria-label={`${selected.title} 절 목차`}><small>이 모듈</small>{sections.map((block, index) => <button type="button" key={`${block.id || block.type}-${index}`} onClick={() => scrollToSection(block, index)}>{block.title || (week.index === 1 && block.type === 'checkpoint' ? `Question ${sections.slice(0, index + 1).filter((item) => item.type === 'checkpoint').length}.` : '중간 확인')}</button>)}</nav>}</aside>
      <article className="reader-document">
        <header><span>MODULE {String(week.modules.indexOf(selected) + 1).padStart(2, '0')}</span><h2>{selected.title}</h2><p>{selected.summary}</p>{isDeepGuide && <dl className="reader-learning-meta"><div><dt>읽기 시간</dt><dd>{selected.estimatedMinutes}분</dd></div><div><dt>선수 개념</dt><dd>{prerequisiteConcepts.length ? prerequisiteConcepts.map((concept) => <a key={concept.id} href={concept.coreAnchor}>{concept.label}</a>) : '없음'}</dd></div><div><dt>이 모듈의 질문</dt><dd>{selected.learningQuestion}</dd></div></dl>}</header>
        <LessonRenderer module={selected} checkpointResults={check.checkpoints || {}} onCheckpoint={updateCheckpoint} onOpenLab={openLab} />
        <footer className="reader-footer"><button className={`button ${done ? 'secondary' : 'primary'}`} type="button" onClick={toggleDone}>{done ? <><Check size={16} />읽음 취소</> : <><CheckCircle2 size={16} />읽음으로 표시</>}</button><small>읽음 표시는 새로고침 후에도 유지됩니다.</small></footer>
      </article>
    </div>
  )
}

function WeekLabs({ week, progress, navigate }) {
  const groups = [
    { id: 'required', title: '필수 경로', description: '핵심 개념을 적용하고 이번 주 이해 확인에 필요한 활동입니다.', labs: week.labs.filter((lab) => lab.path !== 'extension') },
    { id: 'extension', title: '확장 경로', description: '공식 외부 플랫폼, 심화 도구와 추가 분석 활동입니다.', labs: week.labs.filter((lab) => lab.path === 'extension') },
  ].filter((group) => group.labs.length)
  return <div className="week-lab-groups">{groups.map((group) => <section key={group.id}><header><span>{group.id === 'required' ? 'REQUIRED' : 'EXTENSION'}</span><h2>{group.title}</h2><p>{group.description}</p></header><div className="week-lab-list">{group.labs.map((lab, index) => { const state = progress.labs[lab.id]; return <button type="button" key={lab.id} onClick={() => navigate({ page: 'lab', labId: lab.id })}><span className="lab-sequence">{String(index + 1).padStart(2, '0')}</span><span className="lab-list-copy"><small>{lab.path === 'extension' ? '심화' : lab.kind === 'external' ? '외부 실습' : '필수 핵심'}</small><strong>{lab.title}</strong><p>{lab.objective}</p><span>{lab.requiredTools.join(' · ')}</span></span><Status text={state?.status === 'completed' ? '완료' : state ? '진행 중' : '미시작'} tone={state?.status === 'completed' ? 'done' : state ? 'progress' : 'muted'} /><ChevronRight size={18} /></button>})}</div></section>)}</div>
}

function QuizView({ week, progress, updateProgress, navigate, notify }) {
  const questions = quizzes[week.index]
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const result = evaluateQuizAttempt(week.index, answers, questions)
  const rule = quizRules[week.index]
  const coreQuestionIds = new Set(rule.requiredQuestionIds || [])
  const submit = () => {
    setSubmitted(true)
    updateProgress((current) => recordQuizAttempt(current, { weekIndex: week.index, answers, questions, attemptedAt: new Date().toISOString() }))
    notify(result.passed ? '핵심 문항을 포함한 이해 확인 기준을 충족했습니다.' : '오답 개념과 연결 모듈을 확인한 뒤 다시 시도하세요.')
  }
  const attempts = progress.quizAttempts[week.index] || []
  const previous = attempts.at(-1) || progress.quizScores[week.index]
  const retryCount = getQuizRetryCount(progress, week.index)
  return (
    <section className="quiz-page">
      <header><span>KNOWLEDGE CHECK</span><h2>{week.index}주차 이해 확인</h2><p>{questions.length}문항 중 {rule.minimumCorrect}문항 이상과 <b>핵심 문항</b>을 모두 맞히면 통과합니다. 핵심 문항은 각 질문에 표시됩니다. 재시도와 오답 개념은 기록되지만 감점은 없습니다.</p>{previous && <small>최근 결과 {previous.score}/{previous.total} · {previous.percent}% · 재시도 {retryCount}회</small>}</header>
      {questions.map((question, index) => { const correct = answers[index] === question.answer; const isCore = coreQuestionIds.has(question.id); return <article className="quiz-card" key={question.id}><div><span>Q{index + 1} · {question.difficulty}{isCore && <b className="quiz-core">핵심 문항</b>}</span><h3>{question.question}</h3></div><div className="quiz-options">{question.options.map((option, optionIndex) => <button type="button" aria-pressed={answers[index] === optionIndex} key={option} className={answers[index] === optionIndex ? 'selected' : ''} onClick={() => { setAnswers((current) => ({ ...current, [index]: optionIndex })); setSubmitted(false) }}><i>{String.fromCharCode(65 + optionIndex)}</i>{option}</button>)}</div>{submitted && <div className={`quiz-explanation ${correct ? 'correct' : 'wrong'}`}><strong>{correct ? '정답' : '다시 확인'}</strong><p>{question.explanation}</p>{!correct && <div className="quiz-remediation"><span>복습할 개념</span>{question.remediationModuleIds.map((moduleId) => <button type="button" key={moduleId} onClick={() => navigate({ page: 'week', week: week.index, tab: 'concepts', moduleId })}>{getConceptTitle(moduleId) || '관련 개념 모듈'}<ChevronRight size={14} /></button>)}</div>}</div>}</article> })}
      {submitted && result.passed && <section className="quiz-next-action"><div><strong>이해 확인을 통과했습니다.</strong><p>이번 주에 남긴 관찰과 근거를 주차 학습 정리로 연결하세요.</p></div><button className="button secondary" type="button" onClick={() => navigate({ page: 'week', week: week.index, tab: 'record' })}>주차 정리로<ArrowRight size={16} /></button></section>}
      <footer><span>{submitted ? `${result.score} / ${questions.length} · ${result.percent}% · ${result.passed ? '통과' : '재시도'}` : `${Object.keys(answers).length} / ${questions.length} 응답`}</span><button className="button primary" type="button" disabled={Object.keys(answers).length !== questions.length} onClick={submit}>결과 확인<CheckCircle2 size={16} /></button></footer>
    </section>
  )
}

function SubmissionView({ week, progress, updateProgress, notify }) {
  const key = `week-${week.index}`
  const blueprint = week.recordBlueprint
  const saved = progress.evidence[key] || {}
  const [form, setForm] = useState(saved)
  const [checked, setChecked] = useState(saved.checked || [])
  useEffect(() => { setForm(progress.evidence[key] || {}); setChecked(progress.evidence[key]?.checked || []) }, [week.index])
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const save = (completed = false) => {
    const evidence = { ...form, checked, updatedAt: new Date().toISOString() }
    updateProgress((current) => ({
      ...current,
      evidence: { ...current.evidence, [key]: evidence },
      submissions: completed ? { ...current.submissions, [key]: { status: 'recorded', completedAt: new Date().toISOString() } } : current.submissions,
    }))
    notify(completed ? '주차 학습 정리를 완료했습니다.' : '학습 정리 초안을 저장했습니다.')
  }
  const ready = checked.length === week.deliverables.length && String(form.summary || '').length >= 80 && String(form.evidence || '').length >= 30
  return (
    <div className="submission-layout">
      <section className="submission-form-panel"><header><span>WEEKLY LEARNING RECORD</span><h2>{blueprint?.title || `${week.index}주차 학습 정리`}</h2><p>{blueprint?.description || '결과만 붙이지 말고 어떤 조건에서 무엇을 관찰했고 무엇을 이해했는지 본인의 문장으로 남깁니다.'}</p></header>{blueprint && <section className="record-blueprint"><span>기록 순서</span><ol>{blueprint.sections.map((item, index) => <li key={item}><b>{String(index + 1).padStart(2, '0')}</b>{item}</li>)}</ol></section>}<label><span>학습 요약 <em>필수 · 80자 이상</em></span><textarea rows="6" value={form.summary || ''} onChange={(event) => update('summary', event.target.value)} placeholder="이번 주 핵심 개념과 실습에서 확인한 관계를 본인의 언어로 적으세요." /></label><label><span>수행 순서와 관찰 결과 <em>필수</em></span><textarea rows="8" value={form.evidence || ''} onChange={(event) => update('evidence', event.target.value)} placeholder="민감정보를 마스킹한 명령 출력, 요청·응답, 화면 관찰 내용을 적으세요." /></label><label><span>막힌 지점과 힌트 사용</span><textarea rows="4" value={form.reflection || ''} onChange={(event) => update('reflection', event.target.value)} placeholder="처음 가설, 막힌 지점, 힌트 뒤 바뀐 판단을 적으세요." /></label><label><span>풀이·블로그 URL <small>선택</small></span><input type="url" value={form.url || ''} onChange={(event) => update('url', event.target.value)} placeholder="https://" /></label><footer><button className="button secondary" type="button" onClick={() => save(false)}>초안 저장</button><button className="button primary" type="button" disabled={!ready} onClick={() => save(true)}>{progress.submissions[key] ? '완료 내용 수정' : '작성 완료'}<ArrowRight size={16} /></button></footer></section>
      <aside className="submission-checklist"><h3>학습 정리 항목</h3>{week.deliverables.map((item, index) => <label key={item}><input type="checkbox" checked={checked.includes(index)} onChange={(event) => setChecked((current) => event.target.checked ? [...current, index] : current.filter((value) => value !== index))} /><span>{item}</span></label>)}<div className="submission-rule"><ShieldCheck size={18} /><strong>마스킹 확인</strong><p>비밀번호, 다음 레벨 자격 증명, Cookie, Authorization, API Key, 개인정보는 원문 대신 `[REDACTED]`로 표시합니다.</p></div>{progress.submissions[key] && <Status text="작성 완료" tone="done" />}</aside>
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
  const weeks = getAvailableWeeks()
  const recordableWeeks = getRecordableWeeks(weeks)
  const submittedWeeks = recordableWeeks.filter((week) => progress.submissions[`week-${week.index}`]).length
  const conceptIds = new Set([...Object.keys(progress.conceptMastery), ...Object.keys(progress.conceptEvidence), ...Object.keys(progress.mindmap?.conceptMastery || {})])
  const masteryEntries = [...conceptIds].map((id) => [id, progress.conceptMastery[id] || progress.mindmap?.conceptMastery?.[id] || 'unknown'])
  return (
    <div className="page-width progress-page">
      <section className="progress-summary"><div><small>읽은 개념</small><strong>{Object.values(progress.modulesRead).filter(Boolean).length}<span> / {weeks.reduce((sum, week) => sum + week.modules.length, 0)}</span></strong></div><div><small>완료한 실습</small><strong>{Object.values(progress.labs).filter((item) => item.status === 'completed').length}<span> / {weeks.reduce((sum, week) => sum + week.labs.length, 0)}</span></strong></div><div><small>정리한 주차</small><strong>{submittedWeeks}<span> / {recordableWeeks.length}</span></strong></div></section>
      <section className="document-section"><SectionTitle title="주차별 진행" description="읽음, 실습 시도·완료, 이해 확인, 주차 정리를 별도로 표시합니다." /><div className="progress-week-table"><div><span>주차</span><span>개념</span><span>실습</span><span>이해 확인</span><span>주차 정리</span><span>진행</span></div>{weeks.map((week) => { const value = calculateWeekProgress(week, progress); return <button type="button" key={week.id} onClick={() => navigate({ page: 'week', week: week.index, tab: 'overview' })}><strong>W{String(week.index).padStart(2, '0')} · {week.title}</strong><span>{week.modules.filter((item) => progress.modulesRead[item.id]).length}/{week.modules.length}</span><span>{week.labs.filter((item) => progress.labs[item.id]?.status === 'completed').length}/{week.labs.length}</span><span>{progress.quizScores[week.index]?.percent ?? 0}%</span><span>{progress.submissions[`week-${week.index}`] ? '완료' : '미작성'}</span><span><ProgressBar value={value} /><b>{value}%</b></span></button>})}</div></section>
      <section className="document-section"><SectionTitle title="개념 숙련도" description="읽음과 숙련도는 별도이며, 자기 설명과 퀴즈 결과를 확인 근거로 표시합니다." />{masteryEntries.length ? <div className="mastery-list">{masteryEntries.map(([id, level]) => { const evidence = progress.conceptEvidence[id] || {}; return <div key={id}><span><strong>{getConceptTitle(id) || getMindmapNode(id)?.title || '이름을 확인할 수 없는 이전 개념'}</strong><small>퀴즈 근거 {evidence.quizResults?.length || 0}개 · 자기 설명 {String(evidence.selfExplanation?.text || '').trim() ? '기록' : '미기록'} · 확신도 {progress.confidence[id] || progress.mindmap?.confidence?.[id] || '미기록'}</small></span><Status text={masteryLabels[level] || level} tone="progress" /></div> })}</div> : <EmptyState icon={BookMarked} title="아직 기록한 숙련도가 없습니다." text="개념 모듈이나 직무 지도에서 현재 설명·적용 수준을 선택하고 확인 근거를 함께 기록합니다." />}</section>
    </div>
  )
}

function InsightsPage({ progress }) {
  const draft = progress.reports['local-xss-draft'] || emptyReport
  const reportChecks = validateReport(draft)
  const missing = reportChecks.filter((item) => !item.pass)
  const insights = buildLocalLearningInsights(progress, weekContent)
  return (
    <div className="page-width admin-page">
      <section className="admin-strip"><div><span>진행 중인 실습</span><strong>{insights.attemptedLabs}개</strong></div><div><span>저장한 개념 메모</span><strong>{insights.moduleNoteCount}개</strong></div><div><span>Finding 보완 항목</span><strong>{missing.length}개</strong></div></section>
      <div className="admin-grid"><section className="document-section"><SectionTitle title="힌트를 많이 사용한 개념" description="이 브라우저에서 2단계 이상 연 실습만 집계합니다." />{insights.conceptFriction.length ? <div className="friction-table"><div><span>개념</span><span>힌트 단계</span><span>위치</span></div>{insights.conceptFriction.map(({ conceptId, hintSteps, weekIds }) => <div key={conceptId}><strong>{getModuleMeta(conceptId)?.title || '이전 개념 기록'}</strong><span>{hintSteps}단계</span><small>{weekIds.map((week) => `W${week}`).join(' · ')}</small></div>)}</div> : <EmptyState icon={BookMarked} title="집계할 힌트 기록이 없습니다." text="힌트를 연 실습이 생기면 복습 후보를 표시합니다." />}</section><section className="document-section"><SectionTitle title="XSS Finding 품질" description="현재 로컬 초안에서 통과하지 못한 규칙입니다." /><div className="quality-missing">{missing.map((item) => <div key={item.id}><span>보완</span><strong>{item.label}</strong>{item.detail && <small>{item.detail}</small>}</div>)}</div></section></div>
      <section className="document-section"><SectionTitle title="분석 기준" /><div className="operator-notes"><ClipboardCheck size={20} /><p>이 화면은 서버나 다른 학습자의 데이터가 아니라 현재 브라우저에 저장된 읽음, 메모, 실습, 힌트, 보고서 초안만 계산합니다. 힌트 사용은 감점하지 않고 복습 위치를 찾는 데만 사용합니다.</p></div></section>
    </div>
  )
}

function NotFound({ navigate }) {
  return <EmptyState icon={Search} title="요청한 페이지를 찾을 수 없습니다." text="주소가 바뀌었거나 아직 제공되지 않는 항목입니다." action="로드맵으로" onAction={() => navigate({ page: 'learn' })} />
}

function SectionTitle({ title, description, action, onAction }) {
  return <div className="section-title"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <button type="button" onClick={onAction}>{action}<ChevronRight size={15} /></button>}</div>
}

function ProgressBar({ value }) { return <span className="progress-bar" role="progressbar" aria-label="학습 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></span> }

function Status({ text, tone = 'muted' }) { return <span className={`status status-${tone}`}><i />{text}</span> }

function EmptyState({ icon: Icon, title, text, action, onAction }) { return <div className="empty-state"><Icon size={24} /><strong>{title}</strong>{text && <p>{text}</p>}{action && <button className="button secondary" type="button" onClick={onAction}>{action}</button>}</div> }

function getModuleMeta(id) {
  for (const week of Object.values(weekContent)) {
    const module = week.modules.find((item) => item.id === id)
    if (module) return { ...module, week: week.index }
  }
  return null
}

function publicAsset(path) { return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}` }
