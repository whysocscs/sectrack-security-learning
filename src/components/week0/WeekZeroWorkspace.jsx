import { useEffect, useState } from 'react'
import { Background, Controls, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileSearch,
  Filter,
  GitBranch,
  Layers3,
  Search,
  ShieldCheck,
  Target,
  UsersRound,
} from 'lucide-react'
import { cveCweCvssFlow, glossaryCategories, securityGlossary } from '../../data/week0/glossary.js'
import {
  getPostingById,
  jobMarketResearchSummary,
  jobPostingSeeds,
  metadataOnlyJobPosting,
  postingMarket,
} from '../../data/week0/jobMarketResearch.js'
import { domainById, familyById, roleById, roleDetails, rolesForDomain, securityDomains } from '../../data/week0/jobTaxonomy.js'
import {
  researchDomainById,
  researchDomainLinks,
  researchDomains,
  researchEvidenceLabels,
  researchFamilyById,
  researchFamiliesForDomain,
  researchRoleById,
  researchRoles,
  representativeRoleCatalog,
  representativeRoleGroupsForDomain,
  representativeRolesForDomain,
} from '../../data/week0/careerResearch.js'
import { completenessLabels, currentStatusLabels, evidenceTypeLabels } from '../../data/week0/sources.js'

const evidenceSections = [
  ['market', '시장 개요'],
  ['domains', '분야'],
  ['roles', '세부 직무'],
  ['graph', '관계도'],
]

function updateWeekZero(updateProgress, patch) {
  updateProgress((current) => ({
    ...current,
    weekZero: { ...current.weekZero, ...patch },
    lastActivityAt: new Date().toISOString(),
  }))
}

function unique(values) {
  return [...new Set(values)]
}

function useCompactMindmap() {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 720)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px)')
    const sync = () => setCompact(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  return compact
}

function EvidenceBadge({ type }) {
  return <span className={`evidence-badge evidence-${type}`}>{evidenceTypeLabels[type] || type}</span>
}

function ResearchEvidenceBadge({ level }) {
  return <span className={`research-evidence research-evidence-${level}`}>{researchEvidenceLabels[level] || level}</span>
}

function CompletenessBadge({ posting }) {
  return <span className={`completeness-badge completeness-${posting.evidence.contentCompleteness}`}>{completenessLabels[posting.evidence.contentCompleteness]}</span>
}

function PostingStatus({ posting }) {
  const status = posting.source.isCurrent === true ? 'active' : posting.source.isCurrent === false ? 'closed' : 'unknown'
  return <span className={`posting-status status-${status}`}>{currentStatusLabels[status]}</span>
}

function SectionIntro({ kicker, title, body, action }) {
  return <header className="week0-section-intro"><span>{kicker}</span><div><h2>{title}</h2><p>{body}</p></div>{action}</header>
}

export default function WeekZeroWorkspace({ activeTab = 'overview', progress, updateProgress, navigate, notify, showPageHeader = false, onTabChange, onCompleteMap }) {
  const pageTabs = [
    ['overview', '이번 주'],
    ['glossary', '보안 용어'],
    ['careers', '분야·직무 지도'],
    ['map', '나의 보안 지도'],
    ['quiz', '이해 확인'],
  ]
  const setTab = (tab) => onTabChange?.(tab)
  const render = () => {
    if (activeTab === 'glossary') return <SecurityGlossary />
    if (activeTab === 'careers') return <CareerEvidenceExplorer progress={progress} updateProgress={updateProgress} navigate={navigate} />
    if (activeTab === 'map') return <PersonalCareerMap progress={progress} updateProgress={updateProgress} notify={notify} onCompleteMap={onCompleteMap} />
    if (activeTab === 'quiz') return null
    return <WeekZeroOverview openTab={setTab} />
  }
  return <div className="week0-workspace">
    {showPageHeader && <header className="week0-page-header"><span>WEEK 00 · SECURITY FIELD GUIDE</span><h1>정보보안 핵심 용어와 분야·직무 지도</h1><p>용어를 읽고, 분야와 직무를 구분하고, 실제 공고 표본의 근거 범위를 확인한 뒤 나의 보안 지도를 만듭니다.</p><nav className="week0-page-tabs" aria-label="Week 0 탐색 메뉴">{pageTabs.map(([id, label]) => <button type="button" key={id} className={activeTab === id ? 'active' : ''} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav></header>}
    {render()}
  </div>
}

export function WeekZeroExplorerPage({ progress, updateProgress, navigate, notify, initialTab = 'careers' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  return <div className="page-width"><WeekZeroWorkspace activeTab={activeTab} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={notify} showPageHeader onTabChange={setActiveTab} onCompleteMap={() => completeMapLab(updateProgress, notify)} /></div>
}

function WeekZeroOverview({ openTab }) {
  return <div className="week0-overview">
    <SectionIntro kicker="WEEK 00 · ORIENTATION" title="용어에서 실제 업무까지, 같은 층으로 섞지 않고 읽기" body="전문 분야는 무엇을 다루는지, 세부 직무는 어떤 책임을 맡는지, 실제 공고는 어떤 업무를 적었는지를 각각 구분합니다." />
    <section className="week0-learning-flow" aria-label="Week 0 학습 순서">
      {[
        ['01', '보안 용어', '자산·위협·취약점부터 CVE·CWE·CVSS와 방어 통제까지 읽습니다.', 'glossary', BookOpen],
        ['02', '분야·직무', '전문 분야, 업무 기능, 세부 직무, 산업을 분리해 비교합니다.', 'careers', Layers3],
        ['03', '공고 근거', '직접 확인한 사실과 SecTrack 정규화, 일반 설명을 구분합니다.', 'careers', FileSearch],
        ['04', '나의 보안 지도', '관심 직무와 대표 산출물, 연결 WEEK, 포트폴리오 후보를 저장합니다.', 'map', Target],
      ].map(([number, title, body, target, Icon]) => <button type="button" key={number} onClick={() => openTab(target)}><span>{number}</span><Icon size={19} /><div><strong>{title}</strong><p>{body}</p></div><ChevronRight size={17} /></button>)}
    </section>
    <section className="research-caveat" aria-label="채용 표본 해석 주의"><BarChart3 size={21} /><div><strong>실제 공개 채용공고 21건을 분석한 1차 표본입니다.</strong><p>{jobMarketResearchSummary.caveat}</p></div></section>
    <div className="week0-layer-grid">
      <article><span>전문 분야</span><strong>웹·클라우드·DFIR·암호처럼 무엇을 다루는가</strong><p>기술과 시스템의 범위입니다.</p></article>
      <article><span>업무 기능</span><strong>기획·설계·진단·탐지·대응·감사처럼 무엇을 하는가</strong><p>조직에서 맡는 행동과 책임입니다.</p></article>
      <article><span>세부 직무</span><strong>IAM Engineer·SOC Tier2·DFIR Investigator처럼 어떤 역할인가</strong><p>실제 업무와 산출물로 비교합니다.</p></article>
      <article><span>산업</span><strong>금융·SaaS·OT·자동차처럼 어떤 제약 안에서 하는가</strong><p>보호 자산과 운영 우선순위가 달라집니다.</p></article>
    </div>
  </div>
}

function SecurityGlossary() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedId, setSelectedId] = useState('asset')
  const normalized = query.trim().toLocaleLowerCase('ko-KR')
  const visible = securityGlossary.filter((item) => (category === 'all' || item.category === category) && (!normalized || [item.title, item.englishName, item.simpleDefinition, item.preciseDefinition, item.example, item.misconception].join(' ').toLocaleLowerCase('ko-KR').includes(normalized)))
  const selected = securityGlossary.find((item) => item.id === selectedId) || visible[0] || securityGlossary[0]
  return <div className="week0-glossary">
    <SectionIntro kicker="SECURITY GLOSSARY · 30 TERMS" title="보안 용어는 정의와 함께, 헷갈리는 경계까지 읽습니다." body="CVE·CWE·CVSS는 각각 무엇을 가리키는지, CVSS가 조직의 최종 위험과 왜 다른지처럼 실제 업무에서 혼동하기 쉬운 지점을 함께 확인합니다." />
    <section className="cve-flow" aria-label="CWE CVE CVSS와 조직 위험 평가의 관계"><h3>CWE · CVE · CVSS를 한 흐름으로 보기</h3><ol>{cveCweCvssFlow.map(([title, body], index) => <li key={title}><span>{index + 1}</span><div><strong>{title}</strong>{body && <p>{body}</p>}</div>{index < cveCweCvssFlow.length - 1 && <i aria-hidden="true" />}</li>)}</ol></section>
    <div className="glossary-toolbar"><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="CVE, 권한, 공격, 탐지 검색" aria-label="보안 용어 검색" /></label><div role="group" aria-label="용어 분류">{glossaryCategories.map((item) => <button type="button" key={item.id} className={category === item.id ? 'active' : ''} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div></div>
    <div className="glossary-layout"><div className="glossary-list" aria-label="보안 용어 목록">{visible.map((item, index) => <button type="button" key={item.id} className={selected.id === item.id ? 'active' : ''} onClick={() => setSelectedId(item.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><small>{item.englishName}</small></button>)}{!visible.length && <p>검색 결과가 없습니다.</p>}</div><article className="glossary-detail"><span>{glossaryCategories.find((item) => item.id === selected.category)?.label}</span><h2>{selected.title}</h2><small>{selected.englishName}</small><section><h3>쉬운 설명</h3><p>{selected.simpleDefinition}</p></section><section><h3>조금 더 정확히</h3><p>{selected.preciseDefinition}</p></section><section><h3>예시</h3><p>{selected.example}</p></section><section className="glossary-misconception"><h3>흔한 오해</h3><p>{selected.misconception}</p></section><section><h3>함께 비교할 용어</h3><div className="tag-list">{selected.compareWith.map((id) => <button type="button" key={id} onClick={() => setSelectedId(id)}>{securityGlossary.find((item) => item.id === id)?.title || id}</button>)}</div></section><section><h3>연결 WEEK</h3><div className="tag-list">{selected.relatedWeekIds.map((week) => <span key={week}>Week {week}</span>)}</div></section></article></div>
  </div>
}

function CareerEvidenceExplorer({ progress, updateProgress, navigate }) {
  const view = progress.weekZero.view || {}
  const initialSection = evidenceSections.some(([id]) => id === view.evidenceSection) ? view.evidenceSection : 'market'
  const [section, setSection] = useState(initialSection)
  const setSectionState = (next) => {
    setSection(next)
    updateWeekZero(updateProgress, { view: { ...view, evidenceSection: next } })
  }
  return <div className="career-evidence-explorer">
    <SectionIntro kicker="CAREER EVIDENCE EXPLORER" title="분야에서 직무군으로, 직무군에서 실제 역할로 내려가는 직무 지도" body={`${researchDomains.length}개 전문 분야와 ${representativeRoleCatalog.length}개 역할을 직무군으로 묶고, 근거가 충분한 역할만 상세 문서와 공고·공식 체계 근거로 확장합니다.`} />
    <section className="market-caveat"><ShieldCheck size={20} /><div><strong>전문 분야 {researchDomains.length}개 · 대표 역할 {representativeRoleCatalog.length}개 · 상세 근거 카드 {researchRoles.length}개</strong><p>대표 역할은 운영자가 제공한 분야·직무군 목록입니다. 독립 공고·공식 직무 체계 근거가 충분한 역할만 상세 문서로 확장하며, 공개 URL이 보존되지 않은 인용에는 링크를 만들지 않습니다.</p></div></section>
    <nav className="career-evidence-tabs" role="tablist" aria-label="직무 근거 탐색 보기">{evidenceSections.map(([id, label]) => <button type="button" role="tab" aria-selected={section === id} className={section === id ? 'active' : ''} key={id} onClick={() => setSectionState(id)}>{id === 'graph' && <GitBranch size={15} />}{label}</button>)}</nav>
    {section === 'market' && <MarketOverview onOpenRoles={() => setSectionState('roles')} />}
    {section === 'domains' && <DomainExplorer progress={progress} updateProgress={updateProgress} onOpenRole={() => setSectionState('roles')} />}
    {section === 'roles' && <RoleExplorer progress={progress} updateProgress={updateProgress} navigate={navigate} />}
    {section === 'postings' && <PostingExplorer progress={progress} updateProgress={updateProgress} />}
    {section === 'graph' && <CareerGraphView progress={progress} updateProgress={updateProgress} />}
  </div>
}

function MarketOverview({ onOpenRoles }) {
  return <div className="market-overview">
    <section className="market-stats" aria-label="직무 지도 개요"><div><small>전문 분야</small><strong>{researchDomains.length}<span>개</span></strong></div><div><small>대표 역할</small><strong>{representativeRoleCatalog.length}<span>개</span></strong></div><div><small>상세 근거 카드</small><strong>{researchRoles.length}<span>개</span></strong></div><div><small>기존 공고 표본</small><strong>{jobMarketResearchSummary.sampleSize}<span>건</span></strong></div></section>
    <section className="competency-frequency"><header><div><span>HOW TO READ THIS MAP</span><h2>역할 수가 아니라 근거 강도를 먼저 봅니다.</h2><p>대표 역할은 운영자가 정한 분야별 직무군 목록입니다. 상세 카드에만 실제 공고 확인, 공식 직무 체계, 공식·산업 자료의 근거 상태를 표시합니다.</p></div><button type="button" onClick={onOpenRoles}>세부 직무 읽기<ArrowRight size={15} /></button></header><div>{[
      { id: 'jobPosting', label: researchEvidenceLabels.jobPosting, count: researchRoles.filter((role) => role.evidence.level === 'jobPosting').length, description: '보고서가 공고 원문 확인으로 분류한 상세 역할입니다.' },
      { id: 'officialFramework', label: researchEvidenceLabels.officialFramework, count: researchRoles.filter((role) => role.evidence.level === 'officialFramework').length, description: 'NIST NICE 같은 공식 체계의 역할 정의가 근거입니다.' },
      { id: 'industryResearch', label: researchEvidenceLabels.industryResearch, count: researchRoles.filter((role) => role.evidence.level === 'industryResearch').length, description: '공식·산업 자료로 업무 실체를 확인한 역할입니다.' },
    ].map((item) => <article key={item.id}><div><strong>{item.label}</strong><span>{item.count}개</span></div><i style={{ width: `${Math.max(22, (item.count / researchRoles.length) * 100)}%` }} /><p>{item.description}</p></article>)}</div></section>
    <section className="industry-insights"><header><span>INDUSTRY INSIGHTS</span><h2>산업이 바뀌면 보안의 우선순위도 달라집니다.</h2></header><div>{jobMarketResearchSummary.industryInsights.map((item) => <article key={item.id}><strong>{item.title}</strong><p>{item.body}</p></article>)}</div></section>
    <section className="market-next"><UsersRound size={20} /><div><strong>가장 자주 등장한 공통 역량은 협업·문서화였습니다.</strong><p>이는 발표를 잘하라는 추상적인 요구가 아니라, 정책·보고서·플레이북·위협 모델·감사 결과·기술 문서를 재현 가능하고 검토 가능한 산출물로 만드는 능력을 뜻합니다.</p></div><button className="button primary" type="button" onClick={onOpenRoles}>세부 직무 비교<ArrowRight size={16} /></button></section>
  </div>
}

function DomainExplorer({ progress, updateProgress, onOpenRole }) {
  const view = progress.weekZero.view || {}
  const openDomain = (domainId) => {
    updateWeekZero(updateProgress, { view: { ...view, researchDomainId: domainId, researchRoleId: representativeRolesForDomain(domainId)[0]?.id || null } })
    onOpenRole()
  }
  return <section className="domain-explorer"><header><div><span>SECURITY DOMAINS · {researchDomains.length} FIELDS</span><h2>분야 하나를 열면 해당 직무군과 역할이 이어집니다.</h2><p>이 목록은 채용 수요의 순위가 아니라, 운영자가 제공한 분야별 역할 구조입니다.</p></div><span>{researchDomains.length}개 분야</span></header><div>{researchDomains.map((domain) => { const roles = representativeRolesForDomain(domain.id); return <article key={domain.id} className={view.researchDomainId === domain.id ? 'selected' : ''}><button type="button" aria-pressed={view.researchDomainId === domain.id} onClick={() => openDomain(domain.id)}><span>{view.researchDomainId === domain.id ? <Check size={16} /> : null}</span><strong>{domain.shortTitle}</strong></button><p>{domain.description}</p><small>대표 역할 {roles.slice(0, 3).map((role) => role.title).join(' · ')}</small><footer><div className="tag-list">{domain.learningAxes.slice(0, 3).map((axis) => <span key={axis}>{axis}</span>)}</div><button type="button" onClick={() => openDomain(domain.id)}>직무 {roles.length}개 보기<ChevronRight size={15} /></button></footer></article>})}</div></section>
}

function RoleExplorer({ progress, updateProgress }) {
  const view = progress.weekZero.view || {}
  const [query, setQuery] = useState('')
  const domainId = researchDomainById[view.researchDomainId] ? view.researchDomainId : 'governance'
  const normalized = query.trim().toLocaleLowerCase('ko-KR')
  const roles = representativeRolesForDomain(domainId).filter((role) => !normalized || [role.title, role.summary].join(' ').toLocaleLowerCase('ko-KR').includes(normalized))
  const selectedId = roles.some((role) => role.id === view.researchRoleId) ? view.researchRoleId : roles[0]?.id
  const selectedCatalogRole = roles.find((role) => role.id === selectedId) || roles[0]
  const selectRole = (catalogRole) => updateWeekZero(updateProgress, {
    viewedRoleIds: unique([...(progress.weekZero.viewedRoleIds || []), catalogRole.id]),
    view: { ...view, researchDomainId: domainId, researchRoleId: catalogRole.id },
  })
  return <div className="research-role-explorer"><header className="research-role-toolbar"><label><Filter size={16} /><select value={domainId} onChange={(event) => updateWeekZero(updateProgress, { view: { ...view, researchDomainId: event.target.value, researchRoleId: representativeRolesForDomain(event.target.value)[0]?.id || null } })} aria-label="전문 분야 선택">{researchDomains.map((domain) => <option key={domain.id} value={domain.id}>{domain.title}</option>)}</select></label><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이 분야의 역할 검색" aria-label="대표 역할 검색" /></label></header><section className="research-role-index" aria-label={`${researchDomainById[domainId].title} 대표 역할`}><header><div><span>{researchDomainById[domainId].shortTitle}</span><h2>대표 역할</h2><p>모든 역할이 독립 채용공고 제목이라는 뜻은 아닙니다. 상세 근거 카드가 연결된 역할은 공고·공식 체계 근거를 더 읽을 수 있습니다.</p></div><span>{roles.length}개 표시</span></header><div>{roles.map((role, index) => <button type="button" key={role.id} className={selectedCatalogRole?.id === role.id ? 'selected' : ''} onClick={() => selectRole(role)}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{role.title}</strong><p>{role.summary}</p></div><small>{role.detailRoleId ? '상세 근거' : '대표 역할'}</small><ChevronRight size={16} /></button>)}{!roles.length && <p className="empty-state-copy">검색과 일치하는 역할이 없습니다.</p>}</div></section>{selectedCatalogRole && <RoleDetail role={researchDocumentForCatalog(selectedCatalogRole)} progress={progress} updateProgress={updateProgress} />}</div>
}

function DetailList({ title, items, label = null }) {
  if (!items?.length) return null
  return <section><h3>{title}{label && <EvidenceBadge type={label} />}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>
}

function researchDocumentForCatalog(catalogRole) {
  const detailed = catalogRole.detailRoleId ? researchRoleById[catalogRole.detailRoleId] : null
  const roleGroup = representativeRoleGroupsForDomain(catalogRole.domainId).find((group) => group.roleIds.includes(catalogRole.id))
  if (detailed) return {
    ...detailed,
    linkedDomainIds: unique([...detailed.linkedDomainIds, ...catalogRole.relatedDomainIds]),
    groupTitle: roleGroup?.title,
    workContext: catalogRole.workContext,
  }
  const domain = researchDomainById[catalogRole.domainId]
  const family = researchFamiliesForDomain(catalogRole.domainId)[0]
  return {
    id: catalogRole.id,
    domainId: catalogRole.domainId,
    linkedDomainIds: catalogRole.relatedDomainIds,
    familyId: family?.id,
    groupTitle: roleGroup?.title,
    workContext: catalogRole.workContext,
    title: catalogRole.title,
    rawTitles: [catalogRole.title],
    summary: catalogRole.summary,
    actualWork: [catalogRole.summary],
    deliverables: [],
    foundations: domain.learningAxes,
    learningAxes: domain.learningAxes,
    evidence: { level: 'industryResearch', label: '리서치 보고서의 대표 역할', sources: ['보고서의 분야별 역할 목록'], limitations: '이 역할은 분야를 넓게 이해하기 위한 대표 목록입니다. 개별 공고·공식 체계 근거가 충분해지면 상세 근거 카드로 승격합니다.' },
  }
}

function RoleDetail({ role, progress, updateProgress }) {
  if (!role) return null
  const domain = researchDomainById[role.domainId]
  const family = researchFamilyById[role.familyId]
  const linkedDomains = role.linkedDomainIds.map((id) => researchDomainById[id]).filter(Boolean)
  const markViewed = () => updateWeekZero(updateProgress, { viewedRoleIds: unique([...(progress.weekZero.viewedRoleIds || []), role.id]) })
  return <article className="research-role-document" aria-label={`${role.title} 상세`} tabIndex="0" onFocus={markViewed}><header><div><span>{domain?.shortTitle}</span><h2>{role.title}</h2><p>{role.summary}</p></div><ResearchEvidenceBadge level={role.evidence.level} /></header><section className="research-role-identity"><div><small>직무군</small><strong>{role.groupTitle || family?.title || '분야 대표 역할'}</strong></div><div><small>공고 원문에서 쓰인 이름</small><p>{role.rawTitles.join(' · ')}</p></div></section><section className="research-role-columns"><DetailList title="이 직무가 하는 일" items={role.actualWork} /><DetailList title="대표 산출물" items={role.deliverables} /></section><DetailList title="준비할 기초" items={role.foundations} /><section><h3>연결되는 분야</h3><div className="tag-list"><span>{domain?.shortTitle}</span>{linkedDomains.map((item) => <span key={item.id}>{item.shortTitle}</span>)}</div></section>{role.workContext && <section className="research-role-context"><h3>조직·제품 개발 맥락</h3><p>{role.workContext}</p></section>}<section><h3>학습 축</h3><div className="tag-list">{role.learningAxes.map((axis) => <span key={axis}>{axis}</span>)}</div></section><section className="research-role-evidence"><h3>실제 공고·직무 체계 근거</h3><ResearchEvidenceBadge level={role.evidence.level} /><ul>{role.evidence.sources.map((source) => <li key={source}>{source}</li>)}</ul><p>{role.evidence.reportSource?.note || '외부 공고 URL이 보존되지 않은 인용은 링크를 표시하지 않습니다. 모집 상태도 별도로 판정하지 않습니다.'}</p></section><section className="research-role-limitations"><h3>근거와 한계</h3><p>{role.evidence.limitations}</p></section></article>
}

function PostingExplorer({ progress, updateProgress }) {
  const view = progress.weekZero.view || {}
  const [market, setMarket] = useState('all')
  const [completeness, setCompleteness] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(view.selectedPostingId || jobPostingSeeds[0].id)
  const normalized = query.trim().toLocaleLowerCase('ko-KR')
  const postings = jobPostingSeeds.filter((posting) => (market === 'all' || postingMarket(posting.id) === market) && (completeness === 'all' || posting.evidence.contentCompleteness === completeness) && (!normalized || [posting.raw.companyName, posting.raw.jobTitle, ...posting.raw.responsibilities, ...posting.raw.requirements, ...posting.normalized.tools, ...posting.normalized.lawsAndStandards].join(' ').toLocaleLowerCase('ko-KR').includes(normalized)))
  const selected = getPostingById(selectedId) || postings[0] || jobPostingSeeds[0]
  const select = (id) => {
    setSelectedId(id)
    updateWeekZero(updateProgress, { view: { ...view, selectedPostingId: id } })
  }
  return <div className="posting-explorer"><div className="posting-filter-bar"><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="회사·직무·기술 검색" aria-label="실제 공고 검색" /></label><select value={market} onChange={(event) => setMarket(event.target.value)} aria-label="국내외 필터"><option value="all">국내·국외 전체</option><option value="domestic">국내 표본</option><option value="international">국외 표본</option></select><select value={completeness} onChange={(event) => setCompleteness(event.target.value)} aria-label="공고 완성도 필터"><option value="all">완성도 전체</option><option value="detailed">상세 Seed</option><option value="partial">Partial Seed</option></select></div><p className="posting-caveat">공고의 공개 URL, 게시일, 마감일, 현재 모집 여부가 handoff에 없는 경우 만들지 않았습니다. 링크가 없는 항목은 버튼을 표시하지 않습니다.</p><div className="posting-explorer-layout"><div className="posting-list">{postings.map((posting) => <button type="button" key={posting.id} className={selected.id === posting.id ? 'selected' : ''} onClick={() => select(posting.id)}><span><CompletenessBadge posting={posting} /><PostingStatus posting={posting} /></span><strong>{posting.raw.companyName}</strong><p>{posting.raw.jobTitle}</p><small>{postingMarket(posting.id) === 'domestic' ? '국내 표본' : '국외 표본'} · 역할 매핑 {posting.normalized.roleMappings.length}개</small></button>)}{!postings.length && <p className="empty-state-copy">필터와 일치하는 공고가 없습니다.</p>}</div><PostingDetail posting={selected} /></div><section className="metadata-only-note"><h3>제목·메타데이터만 확인한 별도 기록</h3><p>{metadataOnlyJobPosting.raw.companyName} · {metadataOnlyJobPosting.raw.jobTitle}</p><EvidenceBadge type="metadataOnly" /><p>{metadataOnlyJobPosting.evidence.notes}</p><a href={metadataOnlyJobPosting.source.postingUrl} target="_blank" rel="noreferrer">제공된 공개 공고 링크<ExternalLink size={14} /></a></section></div>
}

function PostingDetail({ posting }) {
  if (!posting) return null
  const { raw, normalized, source, evidence } = posting
  const roleTitles = normalized.roleMappings.map((item) => roleById[item.roleId]?.title || item.roleId)
  return <article className="posting-detail" aria-label={`${raw.companyName} ${raw.jobTitle} 공고 상세`}><header><div><CompletenessBadge posting={posting} /><PostingStatus posting={posting} /></div><h2>{raw.companyName}</h2><p>{raw.jobTitle}</p><small>{raw.workLocation || '근무지 미확인'}{raw.employmentType && ` · ${raw.employmentType}`}{raw.experience && ` · ${raw.experience}`}</small></header><section><h3>정규화 직무 <EvidenceBadge type="normalized" /></h3><div className="tag-list">{roleTitles.map((title) => <span key={title}>{title}</span>)}</div></section><DetailList title="주요 업무" items={raw.responsibilities} label="direct" /><DetailList title="필수 자격" items={raw.requirements} label="direct" /><DetailList title="우대사항" items={raw.preferredQualifications} label="direct" /><DetailList title="기술·도구" items={[...normalized.tools, ...normalized.platforms, ...normalized.protocols, ...normalized.frameworks]} label="direct" /><DetailList title="법·표준" items={normalized.lawsAndStandards} label="direct" /><DetailList title="대표 산출물" items={normalized.deliverables} label="inferred" /><DetailList title="협업 조직" items={normalized.partnerTeams} label="direct" /><section><h3>출처 상태</h3><dl><div><dt>출처 유형</dt><dd>개별 채용공고</dd></div><div><dt>본문 검증</dt><dd>{evidence.bodyVerified ? '공고 본문 확인' : '미확인'}</dd></div><div><dt>확인일</dt><dd>{source.checkedDate || '미확인'}</dd></div><div><dt>현재 상태</dt><dd>{source.isCurrent === true ? '모집 중 확인' : source.isCurrent === false ? '마감 확인' : '현재 상태 미확인'}</dd></div></dl>{source.postingUrl && <a className="posting-link" href={source.postingUrl} target="_blank" rel="noreferrer">공개 공고 보기<ExternalLink size={15} /></a>}</section></article>
}

function CareerGraphView({ progress, updateProgress }) {
  const view = progress.weekZero.view || {}
  const compact = useCompactMindmap()
  const selectedDomainId = researchDomainById[view.researchDomainId] ? view.researchDomainId : null
  const selectedCatalogRole = representativeRoleCatalog.find((role) => role.id === view.researchRoleId && role.domainId === selectedDomainId) || null
  const selectedRoleResearch = selectedCatalogRole?.detailRoleId ? researchRoleById[selectedCatalogRole.detailRoleId] : null
  const selectedRoleDomainIds = selectedCatalogRole ? unique([selectedCatalogRole.domainId, ...selectedCatalogRole.relatedDomainIds, ...(selectedRoleResearch?.linkedDomainIds || [])]) : []
  const adjacentDomainIds = selectedDomainId ? researchDomainLinks.filter((link) => link.source === selectedDomainId || link.target === selectedDomainId).flatMap((link) => [link.source, link.target]) : []
  const highlightedDomainIds = new Set(selectedCatalogRole ? selectedRoleDomainIds : adjacentDomainIds)
  if (selectedDomainId) highlightedDomainIds.add(selectedDomainId)
  const selectedGroups = selectedDomainId ? representativeRoleGroupsForDomain(selectedDomainId) : []
  const selectedRoleCount = selectedDomainId ? representativeRolesForDomain(selectedDomainId).length : 0
  const treeStart = compact ? 530 : 410
  const otherDomains = researchDomains.filter((domain) => domain.id !== selectedDomainId)
  const groupRows = []
  let nextY = treeStart + (compact ? 88 : 24)
  for (const group of selectedGroups) {
    const roles = group.roleIds.map((roleId) => representativeRoleCatalog.find((role) => role.id === roleId)).filter(Boolean)
    const rolePositions = roles.map((role, index) => ({ role, y: nextY + index * 58 }))
    const groupY = compact ? nextY : rolePositions.length ? rolePositions[0].y + ((rolePositions.length - 1) * 58) / 2 : nextY
    groupRows.push({ group, roles: rolePositions, y: groupY })
    nextY += roles.length * 58 + 22
  }
  const expandedHeight = Math.max(compact ? 1180 : 1060, nextY + 20)
  const baseNodes = !selectedDomainId ? researchDomains.map((domain, index) => ({
    id: `domain-${domain.id}`,
    position: compact ? { x: 16 + (index % 2) * 178, y: 20 + Math.floor(index / 2) * 62 } : { x: 24 + (index % 3) * 270, y: 24 + Math.floor(index / 3) * 110 },
    data: { label: domain.shortTitle },
    className: 'week0-flow-node domain',
    draggable: false,
  })) : [
    ...otherDomains.map((domain, index) => ({
      id: `domain-${domain.id}`,
      position: compact ? { x: 18 + (index % 2) * 180, y: 20 + Math.floor(index / 2) * 62 } : { x: 24 + (index % 3) * 205, y: 24 + Math.floor(index / 3) * 70 },
      data: { label: domain.shortTitle },
      className: `week0-flow-node domain context${highlightedDomainIds.has(domain.id) ? ' related' : ''}`,
      draggable: false,
    })),
    { id: `domain-${selectedDomainId}`, position: compact ? { x: 20, y: treeStart } : { x: 26, y: Math.max(treeStart + 44, expandedHeight / 2 - 25) }, data: { label: researchDomainById[selectedDomainId].title }, className: 'week0-flow-node domain selected', draggable: false },
    ...groupRows.map(({ group, y }) => ({ id: `family-${group.id}`, position: { x: compact ? 20 : 330, y }, data: { label: group.title }, className: 'week0-flow-node family', draggable: false })),
    ...groupRows.flatMap(({ roles }) => roles.map(({ role, y }) => ({ id: `role-${role.id}`, position: { x: compact ? 180 : 640, y }, data: { label: role.title }, className: `week0-flow-node role${selectedCatalogRole?.id === role.id ? ' selected' : ''}`, draggable: false }))),
  ]
  const staticEdges = researchDomainLinks.map((link) => ({
    id: link.id,
    source: `domain-${link.source}`,
    target: `domain-${link.target}`,
    type: 'smoothstep',
    className: `week0-flow-edge cross-domain${selectedDomainId && (link.source === selectedDomainId || link.target === selectedDomainId) ? ' selected' : ''}`,
  }))
  const existingPairs = new Set(researchDomainLinks.map((link) => [link.source, link.target].sort().join(':')))
  const roleContextEdges = selectedCatalogRole ? selectedRoleDomainIds.filter((domainId) => domainId !== selectedCatalogRole.domainId && !existingPairs.has([selectedCatalogRole.domainId, domainId].sort().join(':'))).map((domainId) => ({
    id: `role-context-${selectedCatalogRole.id}-${domainId}`,
    source: `domain-${selectedCatalogRole.domainId}`,
    target: `domain-${domainId}`,
    type: 'smoothstep',
    className: 'week0-flow-edge role-context',
  })) : []
  const treeEdges = selectedDomainId ? [
    ...groupRows.map(({ group }) => ({ id: `tree-domain-family-${group.id}`, source: `domain-${selectedDomainId}`, target: `family-${group.id}`, type: 'smoothstep', className: 'week0-flow-edge' })),
    ...groupRows.flatMap(({ group, roles }) => roles.map(({ role }) => ({ id: `tree-family-role-${group.id}-${role.id}`, source: `family-${group.id}`, target: `role-${role.id}`, type: 'smoothstep', className: 'week0-flow-edge' }))),
  ] : []
  const edges = [...staticEdges, ...roleContextEdges, ...treeEdges]
  const onNodeClick = (_, node) => {
    if (node.id.startsWith('domain-')) {
      const domainId = node.id.replace('domain-', '')
      updateWeekZero(updateProgress, { view: { ...view, researchDomainId: domainId, researchRoleId: null } })
    }
    if (node.id.startsWith('role-')) {
      const role = representativeRoleCatalog.find((item) => item.id === node.id.replace('role-', ''))
      if (role) selectRole(role)
    }
  }
  const selectRole = (role) => updateWeekZero(updateProgress, { viewedRoleIds: unique([...(progress.weekZero.viewedRoleIds || []), role.id]), view: { ...view, researchDomainId: role.domainId, researchRoleId: role.id } })
  return <section className="week0-graph-view"><header><div><span>CAREER MAP · DOMAIN → FAMILY → ROLE</span><h2>{selectedDomainId ? `${researchDomainById[selectedDomainId].title} 마인드맵` : '전문 분야의 연결과 역할 구조'}</h2><p>{selectedDomainId ? `선택한 분야가 같은 지도 안에서 직무군과 역할 ${selectedRoleCount}개로 확장되었습니다. 역할 노드를 누르면 상세 문서가 열립니다.` : '분야를 선택하면 같은 지도 안에서 직무군과 역할로 확장합니다.'}</p></div>{selectedDomainId && <button type="button" className="graph-reset" onClick={() => updateWeekZero(updateProgress, { view: { ...view, researchDomainId: null, researchRoleId: null } })}>선택 해제</button>}</header><div className={`week0-graph-canvas${selectedDomainId ? ' expanded' : ''}`} style={selectedDomainId ? { height: expandedHeight } : undefined}><ReactFlow nodes={baseNodes} edges={edges} fitView fitViewOptions={{ padding: compact && selectedDomainId ? 0.06 : 0.16 }} minZoom={0.2} maxZoom={1.4} nodesConnectable={false} nodesDraggable={false} onNodeClick={onNodeClick} proOptions={{ hideAttribution: true }}><Background gap={22} size={1} color="#d5ddda" /><Controls showInteractive={false} /></ReactFlow></div>{selectedCatalogRole && <RoleDetail role={researchDocumentForCatalog(selectedCatalogRole)} progress={progress} updateProgress={updateProgress} />}</section>
}

function mapConditions(state) {
  const selectedRoles = (state.selectedRoleIds || []).map((id) => roleById[id]).filter(Boolean)
  const portfolioOptions = selectedRoles.flatMap((role) => role.portfolioOptions.map((item) => `${role.id}:${item}`))
  return {
    selectedRoles,
    portfolioOptions,
    entries: [
      { id: 'domains', label: '관심 분야', value: `${state.selectedDomainIds?.length || 0} / 2개`, done: (state.selectedDomainIds?.length || 0) >= 2 },
      { id: 'roles-viewed', label: '세부 직무 열람', value: `${state.viewedRoleIds?.length || 0} / 4개`, done: (state.viewedRoleIds?.length || 0) >= 4 },
      { id: 'roles-selected', label: '관심 직무', value: `${state.selectedRoleIds?.length || 0} / 2개`, done: (state.selectedRoleIds?.length || 0) >= 2 },
      { id: 'portfolio', label: '포트폴리오 후보', value: `${state.selectedPortfolioIds?.length || 0} / 2개`, done: (state.selectedPortfolioIds?.length || 0) >= 2 },
    ],
  }
}

function PersonalCareerMap({ progress, updateProgress, notify, onCompleteMap }) {
  const state = progress.weekZero
  const { entries, selectedRoles, portfolioOptions } = mapConditions(state)
  const done = entries.every((item) => item.done)
  const toggleDomain = (id) => updateWeekZero(updateProgress, { selectedDomainIds: state.selectedDomainIds.includes(id) ? state.selectedDomainIds.filter((item) => item !== id) : [...state.selectedDomainIds, id] })
  const toggleRole = (id) => {
    const current = state.selectedRoleIds || []
    const next = current.includes(id) ? current.filter((item) => item !== id) : current.length >= 2 ? current : [...current, id]
    updateWeekZero(updateProgress, { selectedRoleIds: next, viewedRoleIds: unique([...(state.viewedRoleIds || []), id]) })
  }
  const togglePortfolio = (id) => updateWeekZero(updateProgress, { selectedPortfolioIds: state.selectedPortfolioIds.includes(id) ? state.selectedPortfolioIds.filter((item) => item !== id) : state.selectedPortfolioIds.length >= 2 ? state.selectedPortfolioIds : [...state.selectedPortfolioIds, id] })
  const exportMap = () => {
    const payload = { schema: 'sectrack-week0-personal-map', version: 1, exportedAt: new Date().toISOString(), selectedDomains: state.selectedDomainIds.map((id) => domainById[id]?.title).filter(Boolean), selectedRoles: selectedRoles.map((role) => ({ title: role.title, actualWork: role.actualWork, deliverables: role.deliverables, foundations: role.foundations, relatedWeekIds: role.relatedWeekIds })), portfolioOptions: state.selectedPortfolioIds }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sectrack-week0-personal-security-map.json'
    anchor.click()
    URL.revokeObjectURL(url)
    notify?.('나의 보안 지도 JSON을 내보냈습니다.')
  }
  return <div className="personal-career-map"><SectionIntro kicker="MY SECURITY MAP" title="관심 직무를 두 개 고르고, 실제 업무와 산출물을 비교합니다." body="숙련도나 개인 메모를 채우는 대신, 분야·직무·업무·산출물·연결 WEEK·포트폴리오 후보를 선택합니다." /><section className="map-condition-strip" aria-label="나의 보안 지도 완료 조건">{entries.map((item) => <div key={item.id} className={item.done ? 'done' : ''}><span>{item.done && <Check size={14} />}</span><strong>{item.label}</strong><small>{item.value}</small></div>)}<b>{done ? '나의 보안 지도 완성' : '선택을 이어가는 중'}</b></section><section className="map-step"><header><span>01</span><div><h2>관심 분야 두 개 선택</h2><p>분야는 학습과 업무의 대상 범위입니다. 선택은 언제든 바꿀 수 있습니다.</p></div></header><div className="map-domain-grid">{securityDomains.map((domain) => <button type="button" key={domain.id} className={state.selectedDomainIds.includes(domain.id) ? 'selected' : ''} aria-pressed={state.selectedDomainIds.includes(domain.id)} onClick={() => toggleDomain(domain.id)}><span>{state.selectedDomainIds.includes(domain.id) && <Check size={15} />}</span><strong>{domain.title}</strong><small>{rolesForDomain(domain.id).length}개 세부 직무</small></button>)}</div></section><section className="map-step"><header><span>02</span><div><h2>세부 직무를 열고, 관심 직무 두 개 선택</h2><p>직무를 누르면 열람 기록이 남고, 최대 두 개를 비교 대상으로 선택할 수 있습니다.</p></div></header><div className="map-role-grid">{roleDetails.filter((role) => !state.selectedDomainIds.length || state.selectedDomainIds.includes(role.domainId)).map((role) => <article key={role.id}><button type="button" onClick={() => updateWeekZero(updateProgress, { viewedRoleIds: unique([...(state.viewedRoleIds || []), role.id]) })}><strong>{role.title}</strong><p>{role.actualWork.slice(0, 2).join(' · ')}</p><small>{role.evidence.label}</small></button><label><input type="checkbox" checked={state.selectedRoleIds.includes(role.id)} onChange={() => toggleRole(role.id)} disabled={!state.selectedRoleIds.includes(role.id) && state.selectedRoleIds.length >= 2} /><span>비교할 직무로 선택</span></label></article>)}</div></section><section className="map-step comparison-step"><header><span>03</span><div><h2>두 직무의 실제 업무와 산출물 비교</h2><p>표본 근거가 있는 항목과 일반 직무 설명의 경계를 함께 확인합니다.</p></div></header>{selectedRoles.length ? <div className="personal-role-comparison">{selectedRoles.map((role) => <article key={role.id}><header><span>{familyById[role.familyId]?.title}</span><h3>{role.title}</h3><b className={`role-evidence role-evidence-${role.evidence.kind}`}>{role.evidence.label}</b></header><DetailList title="실제 업무" items={role.actualWork} label="direct" /><DetailList title="대표 산출물" items={role.deliverables} label="inferred" /><DetailList title="필요한 기초" items={role.foundations} /><section><h3>연결 WEEK</h3><div className="tag-list">{role.relatedWeekIds.map((week) => <span key={week}>Week {week}</span>)}</div></section></article>)}</div> : <p className="empty-state-copy">비교할 직무를 하나 이상 선택하세요.</p>}</section><section className="map-step"><header><span>04</span><div><h2>포트폴리오 후보 두 개 선택</h2><p>각 역할의 업무와 연결되는 작은 결과물 후보입니다. 실제 공고의 직접 요구사항으로 표시하지 않습니다.</p></div></header><div className="portfolio-picker">{portfolioOptions.map((item) => <label key={item}><input type="checkbox" checked={state.selectedPortfolioIds.includes(item)} onChange={() => togglePortfolio(item)} disabled={!state.selectedPortfolioIds.includes(item) && state.selectedPortfolioIds.length >= 2} /><span>{item.split(':')[1]}</span><small>{roleById[item.split(':')[0]]?.title}</small></label>)}{!portfolioOptions.length && <p className="empty-state-copy">먼저 관심 직무를 선택하세요.</p>}</div></section><footer className="map-actions"><div><strong>{done ? '완료 조건을 모두 충족했습니다.' : '완료 조건을 채우면 실습 완료를 표시할 수 있습니다.'}</strong><p>선택 내용은 이 브라우저에 저장되며 JSON으로 내보낼 수 있습니다.</p></div><div><button className="button secondary" type="button" onClick={exportMap} disabled={!selectedRoles.length}><Download size={16} />JSON</button><button className="button primary" type="button" onClick={() => { if (done) onCompleteMap?.(); else notify?.('관심 분야 2개, 세부 직무 4개 열람, 관심 직무 2개, 포트폴리오 후보 2개를 선택하세요.') }} disabled={!done}><CheckCircle2 size={16} />완료 표시</button></div></footer></div>
}

function completeMapLab(updateProgress, notify) {
  updateProgress((current) => ({ ...current, labs: { ...current.labs, 'w0-map': { ...(current.labs['w0-map'] || {}), status: 'completed', completedAt: new Date().toISOString() } } }))
  notify?.('나의 보안 지도를 완료했습니다.')
}
