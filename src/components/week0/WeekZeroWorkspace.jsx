import { useEffect, useState } from 'react'
import { Background, Controls, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  GitBranch,
  Search,
  ShieldCheck,
} from 'lucide-react'
import {
  glossaryCategories,
  securityGlossary,
} from '../../data/week0/glossary.js'
import {
  auditedRepresentativeRoles,
  jobMarketResearchSummary,
  jobPostingFieldOptions,
  jobPostingSeeds,
  postingsForAuditedRole,
  postingAuditGroup,
  postingMarket,
} from '../../data/week0/jobMarketResearch.js'
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
import { completenessLabels, evidenceTypeLabels } from '../../data/week0/sources.js'

const evidenceSections = [
  ['domains', '분야'],
  ['roles', '세부 직무'],
  ['postings', '채용공고 320건'],
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

const auditedRoleById = new Map(auditedRepresentativeRoles.map((role) => [role.id, role]))
const representativeRoleById = new Map(representativeRoleCatalog.map((role) => [role.id, role]))
const auditedPostingById = new Map(jobPostingSeeds.map((posting) => [posting.id, posting]))

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
  const group = postingAuditGroup(posting)
  return <span className={`posting-status status-${group}`}>{posting.source.finalLinkStatus}</span>
}

function SectionIntro({ kicker, title, body, action }) {
  return <header className="week0-section-intro"><span>{kicker}</span><div><h2>{title}</h2><p>{body}</p></div>{action}</header>
}

export default function WeekZeroWorkspace({ activeTab = 'glossary', moduleId, initialCareerSection, progress, updateProgress, navigate, notify, showPageHeader = false, onTabChange, onCompleteMap }) {
  const pageTabs = [
    ['glossary', '보안 용어'],
    ['careers', '분야·직무 지도'],
    ['map', '나의 보안 지도'],
    ['quiz', '이해 확인'],
  ]
  const setTab = (tab) => onTabChange?.(tab)
  const render = () => {
    if (activeTab === 'glossary') return <SecurityGlossary />
    if (activeTab === 'careers') return <CareerEvidenceExplorer key={initialCareerSection || 'saved-view'} moduleId={moduleId} initialSection={initialCareerSection} progress={progress} updateProgress={updateProgress} navigate={navigate} />
    if (activeTab === 'map') return <PersonalCareerMap progress={progress} updateProgress={updateProgress} notify={notify} onCompleteMap={onCompleteMap} />
    if (activeTab === 'quiz') return null
    return <SecurityGlossary />
  }
  return <div className="week0-workspace">
    {showPageHeader && <header className="week0-page-header"><span>WEEK 00 · SECURITY FIELD GUIDE</span><h2>정보보안 핵심 용어와 분야·직무 지도</h2><p>용어를 읽고, 분야와 직무를 구분하고, 실제 공고 표본의 근거 범위를 확인한 뒤 나의 보안 지도를 만듭니다.</p><nav className="week0-page-tabs" aria-label="Week 0 탐색 메뉴">{pageTabs.map(([id, label]) => <button type="button" key={id} className={activeTab === id ? 'active' : ''} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav></header>}
    {render()}
  </div>
}

export function WeekZeroExplorerPage({ progress, updateProgress, navigate, notify, initialTab = 'careers' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  return <div className="page-width"><WeekZeroWorkspace activeTab={activeTab} progress={progress} updateProgress={updateProgress} navigate={navigate} notify={notify} showPageHeader onTabChange={setActiveTab} onCompleteMap={() => completeMapLab(updateProgress, notify)} /></div>
}

function GlossarySourceLink({ source }) {
  return <a className="glossary-source-link" href={source.url} target="_blank" rel="noreferrer">출처: {source.label}<ExternalLink size={14} /></a>
}

function GlossaryTableCell({ cell }) {
  if (cell && typeof cell === 'object' && cell.url) {
    return <a className="glossary-table-link" href={cell.url} target="_blank" rel="noreferrer">{cell.text}<ExternalLink size={13} /></a>
  }
  return cell
}

function GlossaryTable({ table, label }) {
  return <div className="glossary-table-scroll" role="region" aria-label={label} tabIndex="0"><table><thead><tr>{table.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => {
    const rowKey = row.map((cell) => typeof cell === 'object' ? cell.text : cell).join('-')
    return <tr key={rowKey}>{row.map((cell, index) => <td key={`${index}-${typeof cell === 'object' ? cell.text : cell}`}><GlossaryTableCell cell={cell} /></td>)}</tr>
  })}</tbody></table></div>
}

function GlossaryCaseStudy({ study }) {
  if (!study) return null
  const summary = study.emphasis
    ? study.summary.split(study.emphasis).map((part, index, parts) => <span key={`${part}-${index}`}>{part}{index < parts.length - 1 && <strong>{study.emphasis}</strong>}</span>)
    : study.summary
  return <aside className="glossary-case-study"><span>{study.label}</span><h3>{study.title}</h3><blockquote><p>{study.excerpt}</p></blockquote><p>{summary}</p><a href={study.url} target="_blank" rel="noreferrer">{study.sourceLabel} 원문 보기<ExternalLink size={14} /></a></aside>
}

function GlossaryDefinition({ term: selected }) {
  return <div className="glossary-official-definition"><p lang="en">{selected.definitionEnglish}</p><p>{selected.definitionKorean}</p><GlossarySourceLink source={selected.sources[0]} />{selected.additionalDefinitions?.map((definition) => <blockquote key={definition.attribution}><p lang="en">{definition.english}</p><p>{definition.korean}</p><cite>{definition.attribution}</cite></blockquote>)}</div>
}

function GlossaryGroupedSections({ sections }) {
  if (!sections) return null
  return <div className="glossary-subsections">{sections.map((section) => <div key={section.title}><h4>{section.title}</h4>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>)}</div>
}

function GlossarySourceNotes({ notes }) {
  if (!notes) return null
  return <div className="glossary-source-notes">{notes.map((note) => <article key={note.source.url}><p>{note.text}</p><GlossarySourceLink source={note.source} /></article>)}</div>
}

function GlossaryAssignment({ assignment }) {
  if (!assignment) return null
  return <aside className="glossary-assignment"><h4>{assignment.title}</h4><p>{assignment.prompt}</p><strong>반드시 포함할 내용</strong><ol>{assignment.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ol></aside>
}

function GlossaryExplanation({ term: selected, selectTerm }) {
  return <>
    {selected.id === 'attack-surface' && <GlossaryCaseStudy study={selected.caseStudy} />}
    <GlossaryDefinition term={selected} />
    <div className="glossary-prose"><p>{selected.explanation}</p>{selected.detailParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    {selected.image && <figure className="glossary-figure"><img src={selected.image.src} alt={selected.image.alt} /><figcaption>{selected.image.caption}</figcaption></figure>}
    <GlossaryGroupedSections sections={selected.groupedSections} />
    <GlossarySourceNotes notes={selected.sourceNotes} />
    {selected.exampleTable && <GlossaryTable table={selected.exampleTable} label={`${selected.title} 유형별 실제 예시`} />}
    {selected.caseStudy && selected.id !== 'attack-surface' && <GlossaryCaseStudy study={selected.caseStudy} />}
    {selected.comparisonIntro && <p className="glossary-comparison-intro">{selected.comparisonIntro}</p>}
    {selected.comparisonTable && <GlossaryTable table={selected.comparisonTable} label={`${selected.title} 관련 용어 비교`} />}
    {selected.connectionTable && <GlossaryTable table={selected.connectionTable} label="CIA Triad와 CVSS 영향 지표 연결" />}
    {selected.caseTable && <GlossaryTable table={selected.caseTable} label="CIA와 CVSS 영향 조합별 취약점 사례" />}
    {selected.note && <p className="glossary-note">{selected.note}</p>}
    <GlossaryAssignment assignment={selected.assignment} />
    {selected.nextTermIds && <div className="glossary-next-terms"><strong>공식 정의를 차례로 확인하기</strong><div>{selected.nextTermIds.map((id) => { const target = securityGlossary.find((item) => item.id === id); return <button type="button" key={id} onClick={() => selectTerm(target)}>{target.title}<ChevronRight size={14} /></button> })}</div></div>}
    {selected.secondarySources?.map((source) => <GlossarySourceLink key={source.url} source={source} />)}
  </>
}

function SecurityGlossary() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('asset')
  const [openCategories, setOpenCategories] = useState(() => new Set(['foundation']))
  const normalized = query.trim().toLocaleLowerCase('ko-KR')
  const matches = (item) => !normalized || [item.title, item.englishName, item.koreanName, item.definitionEnglish, item.definitionKorean, item.explanation, ...item.detailParagraphs].join(' ').toLocaleLowerCase('ko-KR').includes(normalized)
  const visible = securityGlossary.filter(matches)
  const selected = securityGlossary.find((item) => item.id === selectedId) || securityGlossary[0]
  const selectTerm = (term) => {
    if (!term) return
    setSelectedId(term.id)
    setOpenCategories((current) => new Set([...current, term.category]))
  }
  const toggleCategory = (id) => setOpenCategories((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  return <div className="week0-glossary">
    <div className="glossary-layout">
      <aside className="glossary-navigation" aria-label="보안 용어 분류와 검색">
        <label className="glossary-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="CVE, 권한, 공격, 탐지 검색" aria-label="보안 용어 검색" /></label>
        <div className="glossary-category-toggles">{glossaryCategories.map((category, categoryIndex) => {
          const terms = visible.filter((item) => item.category === category.id)
          const expanded = Boolean(normalized) || openCategories.has(category.id)
          return <section key={category.id}><button type="button" aria-expanded={expanded} aria-controls={`glossary-category-${category.id}`} onClick={() => toggleCategory(category.id)}><span>{String(categoryIndex + 1).padStart(2, '0')}</span><strong>{category.label}</strong><small>{terms.length}개</small><ChevronDown size={16} /></button><div id={`glossary-category-${category.id}`} hidden={!expanded}>{terms.map((item) => <button type="button" key={item.id} className={selected.id === item.id ? 'active' : ''} aria-current={selected.id === item.id ? 'true' : undefined} onClick={() => selectTerm(item)}><strong>{item.title}</strong><small lang="en">{item.englishName}</small></button>)}{!terms.length && <p>검색 결과가 없습니다.</p>}</div></section>
        })}</div>
      </aside>
      <article className="glossary-detail">
        <header><span>{glossaryCategories.find((item) => item.id === selected.category)?.label}</span><h2>{selected.title}</h2><div><span lang="en">{selected.englishName}</span></div></header>
        <section><h3>설명</h3><GlossaryExplanation term={selected} selectTerm={selectTerm} /></section>
      </article>
    </div>
  </div>
}

function CareerEvidenceExplorer({ moduleId, initialSection, progress, updateProgress, navigate }) {
  const view = progress.weekZero.view || {}
  const requestedSection = evidenceSections.some(([id]) => id === initialSection) ? initialSection : null
  const savedSection = evidenceSections.some(([id]) => id === view.evidenceSection) ? view.evidenceSection : 'domains'
  const [section, setSection] = useState(requestedSection || savedSection)
  const moduleTitles = {
    'w0-domains': '정보보안 분야 전체 지도',
    'w0-careers': '분야별 세부 직무',
    'w0-evidence': '실제 채용공고로 직무 읽기',
  }
  const setSectionState = (next) => {
    setSection(next)
    updateWeekZero(updateProgress, { view: { ...view, evidenceSection: next } })
  }
  return <div className="career-evidence-explorer">
    <SectionIntro kicker="CAREER EVIDENCE EXPLORER" title={moduleTitles[moduleId] || '분야에서 직무군으로, 직무군에서 실제 역할로 내려가는 직무 지도'} body={`${researchDomains.length}개 전문 분야와 ${representativeRoleCatalog.length}개 역할을 직무군으로 묶고, 근거가 충분한 역할만 상세 문서와 공고·공식 체계 근거로 확장합니다.`} />
    <section className="market-caveat"><ShieldCheck size={20} /><div><strong>전문 분야 {researchDomains.length}개 · 대표 역할 {representativeRoleCatalog.length}개 · 상세 근거 카드 {researchRoles.length}개</strong><p>대표 역할은 운영자가 제공한 분야·직무군 목록입니다. 독립 공고·공식 직무 체계 근거가 충분한 역할만 상세 문서로 확장하며, 공개 URL이 보존되지 않은 인용에는 링크를 만들지 않습니다.</p></div></section>
    <nav className="career-evidence-tabs" aria-label="직무 근거 탐색 보기">{evidenceSections.map(([id, label]) => <button type="button" aria-pressed={section === id} className={section === id ? 'active' : ''} key={id} onClick={() => setSectionState(id)}>{id === 'graph' && <GitBranch size={15} />}{label}</button>)}</nav>
    {section === 'domains' && <DomainExplorer progress={progress} updateProgress={updateProgress} onOpenRole={() => setSectionState('roles')} />}
    {section === 'roles' && <RoleExplorer progress={progress} updateProgress={updateProgress} navigate={navigate} />}
    {section === 'postings' && <PostingExplorer progress={progress} updateProgress={updateProgress} />}
    {section === 'graph' && <CareerGraphView progress={progress} updateProgress={updateProgress} />}
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
  const [field, setField] = useState('all')
  const [auditGroup, setAuditGroup] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(view.selectedPostingId || jobPostingSeeds[0].id)
  const normalized = query.trim().toLocaleLowerCase('ko-KR')
  const postings = jobPostingSeeds.filter((posting) => (
    (market === 'all' || postingMarket(posting.id) === market)
    && (field === 'all' || posting.normalized.securityDomainId === field)
    && (auditGroup === 'all' || postingAuditGroup(posting) === auditGroup)
    && (!normalized || [posting.raw.companyName, posting.raw.jobTitle, posting.normalized.securityDomainTitle, posting.normalized.representativeRole, posting.source.finalLinkStatus].join(' ').toLocaleLowerCase('ko-KR').includes(normalized))
  ))
  const selected = postings.find((posting) => posting.id === selectedId) || postings[0] || null
  const select = (id) => {
    setSelectedId(id)
    updateWeekZero(updateProgress, { view: { ...view, selectedPostingId: id } })
  }
  return <div className="posting-explorer">
    <div className="posting-filter-bar">
      <label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="회사·공고·대표 직무 검색" aria-label="실제 공고 검색" /></label>
      <select value={market} onChange={(event) => setMarket(event.target.value)} aria-label="국내외 필터"><option value="all">국내·국외 전체</option><option value="domestic">국내 160개</option><option value="international">해외 160개</option></select>
      <select value={field} onChange={(event) => setField(event.target.value)} aria-label="보안 분야 필터"><option value="all">16개 분야 전체</option>{jobPostingFieldOptions.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select>
      <select value={auditGroup} onChange={(event) => setAuditGroup(event.target.value)} aria-label="URL 감사 상태 필터"><option value="all">URL 감사 상태 전체</option><option value="candidate">직접 페이지 열림</option><option value="manual">수동 확인 필요</option><option value="archive">마감·아카이브</option><option value="hidden">404·일반 목록·비노출</option></select>
    </div>
    <p className="posting-caveat">{jobMarketResearchSummary.auditDate} 기준 320개 매핑입니다. 직접 페이지가 열렸다는 사실은 현재 모집 중임을 보장하지 않으며, 비노출 권장 URL은 링크 버튼을 표시하지 않습니다.</p>
    <div className="posting-explorer-layout">
      <div className="posting-list">{postings.map((posting) => <button type="button" key={posting.id} className={selected?.id === posting.id ? 'selected' : ''} onClick={() => select(posting.id)}><span><CompletenessBadge posting={posting} /><PostingStatus posting={posting} /></span><strong>{posting.raw.companyName}</strong><p>{posting.raw.jobTitle}</p><small>{postingMarket(posting.id) === 'domestic' ? '국내' : '해외'} · {posting.normalized.securityDomainTitle} · {posting.normalized.representativeRole}</small></button>)}{!postings.length && <p className="empty-state-copy">필터와 일치하는 공고가 없습니다.</p>}</div>
      <PostingDetail posting={selected} />
    </div>
  </div>
}

function PostingDetail({ posting }) {
  if (!posting) return null
  const { raw, normalized, source, evidence } = posting
  const roleTitles = normalized.roleMappings.map((item) => item.roleTitle || item.catalogRoleTitle || item.roleId)
  const group = postingAuditGroup(posting)
  return <article className="posting-detail" aria-label={`${raw.companyName} ${raw.jobTitle} 공고 상세`}>
    <header><div><CompletenessBadge posting={posting} /><PostingStatus posting={posting} /></div><h2>{raw.companyName}</h2><p>{raw.jobTitle}</p><small>{raw.workLocation || '근무지 미확인'}{raw.experience && ` · ${raw.experience}`}</small></header>
    <section><h3>분야·대표 직무 매핑 <EvidenceBadge type="normalized" /></h3><div className="tag-list"><span>{normalized.securityDomainTitle}</span>{roleTitles.map((title) => <span key={title}>{title}</span>)}</div><dl><div><dt>대응 수준</dt><dd>{posting.audit.matchLevel}</dd></div><div><dt>매핑 근거</dt><dd>{evidence.notes}</dd></div><div><dt>URL 사용 횟수</dt><dd>{posting.audit.urlUseCount}회{posting.audit.duplicateMapping ? ' · 복수 직무 연결' : ''}</dd></div></dl></section>
    <section><h3>URL 최종 감사 상태</h3><dl><div><dt>원 조사 상태</dt><dd>{source.originalStatus || '미확인'}</dd></div><div><dt>최종 링크 상태</dt><dd>{source.finalLinkStatus}</dd></div><div><dt>운영 권장</dt><dd>{source.operatingRecommendation}</dd></div><div><dt>최종 검증일</dt><dd>{source.checkedDate || '미확인'}</dd></div><div><dt>출처 경로</dt><dd>{source.sourceLabel || source.pageSystem}</dd></div></dl><p className="posting-verification-basis">{source.verificationBasis}</p>{source.postingUrl && <a className="posting-link" href={source.postingUrl} target="_blank" rel="noreferrer">{group === 'archive' ? '마감 공고 아카이브 보기' : '공고 페이지 열기·모집 여부 재확인'}<ExternalLink size={15} /></a>}{!source.postingUrl && <p className="posting-link-hidden">운영 권장에 따라 원 URL 링크를 표시하지 않습니다.</p>}{source.replacementTitle && <p className="posting-replacement-candidate"><strong>교체 후보</strong> {source.replacementTitle} · 재검증 전 링크 비노출</p>}</section>
  </article>
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
  const selectedDomainIds = (state.selectedDomainIds || []).filter((id) => researchDomainById[id])
  const viewedRoleIds = unique((state.viewedRoleIds || []).filter((id) => auditedRoleById.has(id)))
  const selectedRoles = unique(state.selectedRoleIds || []).map((id) => auditedRoleById.get(id)).filter(Boolean).map(personalRoleModel)
  const availablePostingIds = new Set(selectedRoles.flatMap((role) => role.postings.map((posting) => posting.id)))
  const selectedPostings = unique(state.selectedPostingIds || []).filter((id) => availablePostingIds.has(id)).map((id) => auditedPostingById.get(id)).filter(Boolean)
  return {
    selectedDomainIds,
    selectedRoles,
    selectedPostings,
    postingOptions: selectedRoles.flatMap((role) => role.postings),
    entries: [
      { id: 'domains', label: '관심 분야', value: `${selectedDomainIds.length} / 2개`, done: selectedDomainIds.length >= 2 },
      { id: 'roles-viewed', label: '대표 직무 열람', value: `${viewedRoleIds.length} / 4개`, done: viewedRoleIds.length >= 4 },
      { id: 'roles-selected', label: '관심 직무', value: `${selectedRoles.length} / 2개`, done: selectedRoles.length >= 2 },
      { id: 'postings', label: '비교할 공고', value: `${selectedPostings.length} / 2개`, done: selectedPostings.length >= 2 },
    ],
  }
}

function personalRoleModel(auditedRole) {
  const catalogRole = representativeRoleById.get(auditedRole.catalogRoleId) || null
  const document = catalogRole ? researchDocumentForCatalog(catalogRole) : null
  const group = catalogRole ? representativeRoleGroupsForDomain(catalogRole.domainId).find((item) => item.roleIds.includes(catalogRole.id)) : null
  return {
    ...auditedRole,
    catalogRole,
    document,
    groupTitle: group?.title || '분야 대표 직무',
    postings: postingsForAuditedRole(auditedRole.id),
  }
}

function PersonalCareerMap({ progress, updateProgress, notify, onCompleteMap }) {
  const state = progress.weekZero
  const { entries, selectedDomainIds, selectedRoles, selectedPostings, postingOptions } = mapConditions(state)
  const selectedRoleIds = selectedRoles.map((role) => role.id)
  const selectedPostingIds = selectedPostings.map((posting) => posting.id)
  const visibleRoles = auditedRepresentativeRoles.filter((role) => selectedDomainIds.includes(role.domainId) || selectedRoleIds.includes(role.id))
  const done = entries.every((item) => item.done)
  const toggleDomain = (id) => {
    const next = selectedDomainIds.includes(id) ? selectedDomainIds.filter((item) => item !== id) : selectedDomainIds.length >= 2 ? selectedDomainIds : [...selectedDomainIds, id]
    updateWeekZero(updateProgress, { selectedDomainIds: next })
  }
  const markRoleViewed = (id) => updateWeekZero(updateProgress, { viewedRoleIds: unique([...(state.viewedRoleIds || []), id]) })
  const toggleRole = (id) => {
    const next = selectedRoleIds.includes(id) ? selectedRoleIds.filter((item) => item !== id) : selectedRoleIds.length >= 2 ? selectedRoleIds : [...selectedRoleIds, id]
    const remainingPostingIds = new Set(next.flatMap((roleId) => postingsForAuditedRole(roleId).map((posting) => posting.id)))
    updateWeekZero(updateProgress, {
      selectedRoleIds: next,
      selectedPostingIds: selectedPostingIds.filter((postingId) => remainingPostingIds.has(postingId)),
      viewedRoleIds: unique([...(state.viewedRoleIds || []), id]),
    })
  }
  const togglePosting = (id) => {
    const next = selectedPostingIds.includes(id) ? selectedPostingIds.filter((item) => item !== id) : selectedPostingIds.length >= 2 ? selectedPostingIds : [...selectedPostingIds, id]
    updateWeekZero(updateProgress, { selectedPostingIds: next })
  }
  const exportMap = () => {
    const payload = {
      schema: 'sectrack-week0-personal-map',
      version: 2,
      exportedAt: new Date().toISOString(),
      dataset: { auditDate: jobMarketResearchSummary.auditDate, mappingCount: jobMarketResearchSummary.sampleSize, uniqueUrlCount: jobMarketResearchSummary.uniqueUrlCount },
      selectedDomains: selectedDomainIds.map((id) => researchDomainById[id]?.title).filter(Boolean),
      selectedRoles: selectedRoles.map((role) => ({ id: role.id, title: role.title, domain: role.domainTitle, summary: role.catalogRole?.summary || '', mappedPostingCount: role.postingCount })),
      selectedPostings: selectedPostings.map((posting) => ({ company: posting.raw.companyName, title: posting.raw.jobTitle, market: posting.source.market, finalLinkStatus: posting.source.finalLinkStatus, checkedDate: posting.source.checkedDate, url: posting.source.postingUrl })),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sectrack-week0-personal-security-map.json'
    anchor.click()
    URL.revokeObjectURL(url)
    notify?.('나의 보안 지도 JSON을 내보냈습니다.')
  }
  return <div className="personal-career-map">
    <SectionIntro kicker="MY SECURITY MAP · 2026-07-27 AUDIT" title="관심 분야와 직무를 고르면 실제 감사 공고가 함께 연결됩니다." body="WEEK 0과 같은 16개 분야·80개 대표 직무를 사용합니다. 각 대표 직무에는 엑셀에서 감사한 국내 2건과 해외 2건이 연결됩니다." />
    <section className="map-condition-strip" aria-label="나의 보안 지도 완료 조건">{entries.map((item) => <div key={item.id} className={item.done ? 'done' : ''}><span>{item.done && <Check size={14} />}</span><strong>{item.label}</strong><small>{item.value}</small></div>)}<b>{done ? '나의 보안 지도 완성' : '선택을 이어가는 중'}</b></section>
    <section className="map-step"><header><span>01</span><div><h2>관심 분야 두 개 선택</h2><p>채용공고 감사표와 동일한 16개 분야입니다. 최대 두 개를 선택할 수 있습니다.</p></div></header><div className="map-domain-grid">{researchDomains.map((domain) => <button type="button" key={domain.id} className={selectedDomainIds.includes(domain.id) ? 'selected' : ''} aria-pressed={selectedDomainIds.includes(domain.id)} onClick={() => toggleDomain(domain.id)} disabled={!selectedDomainIds.includes(domain.id) && selectedDomainIds.length >= 2}><span>{selectedDomainIds.includes(domain.id) && <Check size={15} />}</span><strong>{domain.title}</strong><small>감사 대표 직무 {auditedRepresentativeRoles.filter((role) => role.domainId === domain.id).length}개</small></button>)}</div></section>
    <section className="map-step"><header><span>02</span><div><h2>대표 직무를 열고, 관심 직무 두 개 선택</h2><p>카드를 열면 열람 기록이 남습니다. 각 직무에는 공고 매핑 4건이 연결되어 있습니다.</p></div></header>{visibleRoles.length ? <div className="map-role-grid">{visibleRoles.map((role) => <article key={role.id} className={selectedRoleIds.includes(role.id) ? 'selected' : ''}><button type="button" onClick={() => markRoleViewed(role.id)}><strong>{role.title}</strong><p>{representativeRoleById.get(role.catalogRoleId)?.summary || `${role.domainTitle} 분야의 대표 직무입니다.`}</p><small>{role.domainTitle} · 국내 2건 · 해외 2건</small></button><label><input type="checkbox" checked={selectedRoleIds.includes(role.id)} onChange={() => toggleRole(role.id)} disabled={!selectedRoleIds.includes(role.id) && selectedRoleIds.length >= 2} /><span>비교할 직무로 선택</span></label></article>)}</div> : <p className="empty-state-copy">먼저 관심 분야를 하나 이상 선택하세요.</p>}</section>
    <section className="map-step comparison-step"><header><span>03</span><div><h2>직무 설명과 공고 감사 범위를 함께 비교</h2><p>업무 설명은 직무 리서치에서, 공고 수와 링크 상태는 새 엑셀 감사표에서 가져옵니다. 엑셀에 없는 공고 본문 요구사항은 만들지 않습니다.</p></div></header>{selectedRoles.length ? <div className="personal-role-comparison">{selectedRoles.map((role) => <PersonalRoleComparison role={role} key={role.id} />)}</div> : <p className="empty-state-copy">비교할 직무를 하나 이상 선택하세요.</p>}</section>
    <section className="map-step"><header><span>04</span><div><h2>직접 비교할 공고 매핑 두 개 선택</h2><p>선택한 두 직무에 연결된 공고만 표시합니다. 링크는 엑셀의 운영 권장에 따라 허용된 경우에만 열립니다.</p></div></header><div className="posting-picker">{postingOptions.map((posting) => <PersonalPostingOption posting={posting} checked={selectedPostingIds.includes(posting.id)} disabled={!selectedPostingIds.includes(posting.id) && selectedPostingIds.length >= 2} onToggle={() => togglePosting(posting.id)} key={posting.id} />)}{!postingOptions.length && <p className="empty-state-copy">먼저 관심 직무를 선택하세요.</p>}</div></section>
    <footer className="map-actions"><div><strong>{done ? '완료 조건을 모두 충족했습니다.' : '완료 조건을 채우면 실습 완료를 표시할 수 있습니다.'}</strong><p>16개 분야·80개 대표 직무·320개 공고 매핑 기준이며, 선택 내용은 이 브라우저에 저장됩니다.</p></div><div><button className="button secondary" type="button" onClick={exportMap} disabled={!selectedRoles.length}><Download size={16} />JSON</button><button className="button primary" type="button" onClick={() => { if (done) onCompleteMap?.(); else notify?.('관심 분야 2개, 대표 직무 4개 열람, 관심 직무 2개, 비교할 공고 2개를 선택하세요.') }} disabled={!done}><CheckCircle2 size={16} />완료 표시</button></div></footer>
  </div>
}

function PersonalRoleComparison({ role }) {
  const statusCounts = role.postings.reduce((counts, posting) => ({ ...counts, [postingAuditGroup(posting)]: (counts[postingAuditGroup(posting)] || 0) + 1 }), {})
  return <article><header><span>{role.domainTitle} · {role.groupTitle}</span><h3>{role.title}</h3><b className="role-evidence role-evidence-direct">감사 공고 {role.postingCount}개 매핑</b></header><section><h3>직무 이해</h3><p className="personal-role-summary">{role.catalogRole?.summary}</p>{role.document?.actualWork?.length ? <DetailList title="직무 리서치에서 정리한 업무" items={role.document.actualWork} /> : null}{role.document?.foundations?.length ? <DetailList title="준비할 기초" items={role.document.foundations} /> : null}</section><section><h3>URL 감사 범위</h3><dl className="personal-role-audit-stats"><div><dt>국내·해외</dt><dd>{role.domesticCount}건 · {role.internationalCount}건</dd></div><div><dt>직접 페이지 열림</dt><dd>{role.directOpenCount} / {role.postingCount}건</dd></div><div><dt>수동 확인</dt><dd>{statusCounts.manual || 0}건</dd></div><div><dt>아카이브·비노출</dt><dd>{(statusCounts.archive || 0) + (statusCounts.hidden || 0)}건</dd></div></dl></section></article>
}

function PersonalPostingOption({ posting, checked, disabled, onToggle }) {
  return <article className={checked ? 'selected' : ''}><label><input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} /><span><strong>{posting.raw.companyName}</strong><small>{posting.raw.jobTitle}</small></span></label><div><span>{posting.source.market === 'domestic' ? '국내' : '해외'} · {posting.normalized.representativeRole}</span><PostingStatus posting={posting} /></div>{posting.source.postingUrl ? <a href={posting.source.postingUrl} target="_blank" rel="noreferrer">공고 페이지 열기·모집 여부 재확인<ExternalLink size={14} /></a> : <p>운영 권장에 따라 원 URL 링크 비노출</p>}</article>
}

function completeMapLab(updateProgress, notify) {
  updateProgress((current) => ({ ...current, labs: { ...current.labs, 'w0-map': { ...(current.labs['w0-map'] || {}), status: 'activity-recorded', recordedAt: new Date().toISOString() } } }))
  notify?.('나의 보안 지도 활동을 기록했습니다. 사람의 검토 전에는 숙련 승인으로 표시하지 않습니다.')
}
