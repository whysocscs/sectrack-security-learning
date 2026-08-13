import { useMemo, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, ExternalLink, RotateCcw } from 'lucide-react'
import {
  aggregatePartnerTeamsForRole,
  aggregatePreferredQualificationsForRole,
  aggregateRequirementsForRole,
  aggregateResponsibilitiesForRole,
  aggregateTechnologiesForRole,
  aggregateWorkProfileForRole,
  enrichedPostingsForRole,
  enrichmentCoverageForRole,
  isEnrichedPostingLinkVisible,
} from '../../data/week0/jobPostingEnrichment20260801.js'

const PAGE_SIZE = 10
const visibleStatuses = new Set(['open', 'accessible', 'closed'])
const visibleMatchLevels = new Set(['exact', 'strong'])

const statusLabels = Object.freeze({
  open: '지원 가능 확인',
  accessible: '본문 확인 · 모집 여부 미확정',
  closed: '마감 공고',
  inaccessible: '접근 실패',
  listingOnly: '채용 목록으로 이동',
  loginRequired: '로그인 필요',
  redirected: '다른 페이지로 이동',
})

const matchLabels = Object.freeze({
  exact: '직무 직접 일치',
  strong: '핵심 업무 강한 일치',
  adjacent: '인접 역할',
  reject: '일치 근거 부족',
})

const careerLevelLabels = Object.freeze({
  entry: '신입',
  junior: '주니어',
  mid: '중급',
  senior: '시니어',
  staff: '스태프',
  principal: '프린시펄',
  lead: '리드',
  manager: '매니저',
  director: '디렉터',
  unknown: '경력 수준 미확인',
})

const workModeLabels = Object.freeze({
  onsite: '현장 근무',
  hybrid: '하이브리드',
  remote: '원격',
  unknown: '근무 방식 미확인',
})

const evidenceLabels = Object.freeze({
  common: '공통',
  repeated: '반복',
  single: '단일 표본',
})

const technologyCategories = Object.freeze([
  ['tools', '도구'],
  ['programmingLanguages', '프로그래밍 언어'],
  ['queryLanguages', '쿼리 언어'],
  ['scriptingLanguages', '스크립트 언어'],
  ['cloudPlatforms', '클라우드'],
  ['containerPlatforms', '컨테이너'],
  ['operatingSystems', '운영체제'],
  ['databases', '데이터베이스'],
  ['securityProducts', '보안 제품'],
  ['protocols', '프로토콜'],
  ['frameworks', '프레임워크'],
  ['lawsAndStandards', '법률 및 표준'],
  ['certifications', '자격증'],
  ['deliverables', '산출물'],
])

const initialFilters = Object.freeze({
  market: 'all',
  status: 'all',
  matchLevel: 'all',
  careerLevel: 'all',
  workMode: 'all',
  country: 'all',
  company: 'all',
  checkedDate: 'all',
})

function textValue(value, fallback = '미확인') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function sortedUnique(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()))]
    .sort((left, right) => left.localeCompare(right, 'ko-KR'))
}

function aggregateItems(value, category = null) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const selected = category ? value[category] : null
  return Array.isArray(selected) ? selected : []
}

function aggregateLabel(item) {
  return item?.label || item?.normalizedLabel || item?.key || '항목 이름 미확인'
}

function yearsLabel(posting) {
  const minimum = posting.requiredYearsMin
  const maximum = posting.requiredYearsMax
  if (Number.isFinite(minimum) && Number.isFinite(maximum)) return `${minimum}~${maximum}년`
  if (Number.isFinite(minimum)) return `${minimum}년 이상`
  if (Number.isFinite(maximum)) return `${maximum}년 이하`
  return '요구 연차 미확인'
}

function FilterSelect({ label, value, options, onChange, allLabel }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="all">{allLabel}</option>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
}

function RolePostingFilters({ postings, filters, updateFilter, reset }) {
  const optionSets = useMemo(() => ({
    status: sortedUnique(postings.map((posting) => posting.source?.status)).map((value) => ({ value, label: statusLabels[value] || value })),
    matchLevel: sortedUnique(postings.map((posting) => posting.match?.level)).map((value) => ({ value, label: matchLabels[value] || value })),
    careerLevel: sortedUnique(postings.map((posting) => posting.careerLevel)).map((value) => ({ value, label: careerLevelLabels[value] || value })),
    workMode: sortedUnique(postings.map((posting) => posting.workMode)).map((value) => ({ value, label: workModeLabels[value] || value })),
    country: sortedUnique(postings.map((posting) => posting.country)).map((value) => ({ value, label: value })),
    company: sortedUnique(postings.map((posting) => posting.companyName)).map((value) => ({ value, label: value })),
    checkedDate: sortedUnique(postings.map((posting) => posting.source?.checkedDate)).reverse().map((value) => ({ value, label: value })),
  }), [postings])
  return <fieldset className="role-posting-filters">
    <legend>공고 표시 필터</legend>
    <FilterSelect label="국내·해외" value={filters.market} options={[{ value: 'domestic', label: '국내' }, { value: 'international', label: '해외' }]} allLabel="국내·해외 전체" onChange={(value) => updateFilter('market', value)} />
    <FilterSelect label="공고 상태" value={filters.status} options={optionSets.status} allLabel="상태 전체" onChange={(value) => updateFilter('status', value)} />
    <FilterSelect label="직무 일치도" value={filters.matchLevel} options={optionSets.matchLevel} allLabel="일치도 전체" onChange={(value) => updateFilter('matchLevel', value)} />
    <FilterSelect label="경력 수준" value={filters.careerLevel} options={optionSets.careerLevel} allLabel="경력 수준 전체" onChange={(value) => updateFilter('careerLevel', value)} />
    <FilterSelect label="근무 방식" value={filters.workMode} options={optionSets.workMode} allLabel="근무 방식 전체" onChange={(value) => updateFilter('workMode', value)} />
    <FilterSelect label="국가" value={filters.country} options={optionSets.country} allLabel="국가 전체" onChange={(value) => updateFilter('country', value)} />
    <FilterSelect label="회사" value={filters.company} options={optionSets.company} allLabel="회사 전체" onChange={(value) => updateFilter('company', value)} />
    <FilterSelect label="확인 날짜" value={filters.checkedDate} options={optionSets.checkedDate} allLabel="확인 날짜 전체" onChange={(value) => updateFilter('checkedDate', value)} />
    <button type="button" onClick={reset}><RotateCcw size={15} />필터 초기화</button>
  </fieldset>
}

function RolePostingCard({ posting }) {
  const source = posting.source || {}
  const match = posting.match || {}
  const linkVisible = isEnrichedPostingLinkVisible(posting)
  return <article className="role-posting-card">
    <header>
      <div><span className={`enrichment-status enrichment-status-${source.status}`}>{statusLabels[source.status] || source.status}</span><span className={`enrichment-match enrichment-match-${match.level}`}>{matchLabels[match.level] || match.level} · {Number.isFinite(match.score) ? `${match.score}점` : '점수 미확인'}</span></div>
      <h4>{textValue(posting.companyName, '회사명 미확인')}</h4>
      <p>{textValue(posting.originalJobTitle, '공고 제목 미확인')}</p>
    </header>
    <dl className="role-posting-meta">
      <div><dt>시장</dt><dd>{posting.market === 'domestic' ? '국내' : posting.market === 'international' ? '해외' : '미확인'}</dd></div>
      <div><dt>국가</dt><dd>{textValue(posting.country)}</dd></div>
      <div><dt>근무 위치</dt><dd>{textValue(posting.location)}</dd></div>
      <div><dt>근무 방식</dt><dd>{workModeLabels[posting.workMode] || textValue(posting.workMode)}</dd></div>
      <div><dt>고용 형태</dt><dd>{textValue(posting.employmentType)}</dd></div>
      <div><dt>경력 수준</dt><dd>{careerLevelLabels[posting.careerLevel] || textValue(posting.careerLevel)}</dd></div>
      <div><dt>요구 연차</dt><dd>{yearsLabel(posting)}</dd></div>
      <div><dt>확인 날짜</dt><dd>{textValue(source.checkedDate)}</dd></div>
    </dl>
    {match.reasons?.length ? <div className="role-posting-match-reasons"><strong>이 역할과 연결한 근거</strong><ul>{match.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div> : null}
    <footer>{linkVisible && source.postingUrl ? <a href={source.postingUrl} target="_blank" rel="noreferrer">공고 원문 열기<ExternalLink size={14} /></a> : <span>본문 검증과 상태 조건을 충족한 원문 링크가 없습니다.</span>}</footer>
  </article>
}

function FrequencyList({ title, items, postingCount, emptyText }) {
  const rows = aggregateItems(items)
  return <section className="role-requirement-frequency"><h3>{title}</h3>{rows.length ? <ul>{rows.map((item) => <li key={`${item.key || aggregateLabel(item)}-${item.count}`}><div><strong>{aggregateLabel(item)}</strong><span>{item.count}/{postingCount}개 공고</span></div><small className={`aggregate-evidence aggregate-evidence-${item.evidenceLevel}`}>{evidenceLabels[item.evidenceLevel] || item.evidenceLevel}</small></li>)}</ul> : <p>{emptyText}</p>}</section>
}

function TechnologyGroups({ technologies, postingCount }) {
  const groups = technologyCategories.map(([key, label]) => ({ key, label, items: aggregateItems(technologies, key) })).filter((group) => group.items.length)
  return <section className="role-technology-section"><h3>기술 및 도구</h3>{groups.length ? <div className="role-technology-groups">{groups.map((group) => <article key={group.key}><h4>{group.label}</h4><ul>{group.items.map((item) => <li key={`${item.key || aggregateLabel(item)}-${item.count}`}><strong>{aggregateLabel(item)}</strong><span>{item.count}/{postingCount}개</span><small>{evidenceLabels[item.evidenceLevel] || item.evidenceLevel}</small></li>)}</ul></article>)}</div> : <p>검증된 공고 본문에서 구체적인 기술·도구 항목을 확인하지 못했습니다.</p>}</section>
}

const workProfileCategories = Object.freeze([
  ['careerLevels', '경력 수준', careerLevelLabels],
  ['workModes', '근무 방식', workModeLabels],
  ['countries', '국가', null],
  ['locations', '근무 지역', null],
  ['employmentTypes', '고용 형태', null],
])

function WorkProfileGroups({ profile, postingCount }) {
  const groups = workProfileCategories
    .map(([key, label, labels]) => ({ key, label, labels, items: aggregateItems(profile, key) }))
    .filter((group) => group.items.length)
  return <section className="role-work-profile-section"><h3>경력·지역·근무 방식</h3>{groups.length ? <div className="role-technology-groups">{groups.map((group) => <article key={group.key}><h4>{group.label}</h4><ul>{group.items.map((item) => <li key={`${item.key || aggregateLabel(item)}-${item.count}`}><strong>{group.labels?.[aggregateLabel(item)] || aggregateLabel(item)}</strong><span>{item.count}/{postingCount}개</span><small>{evidenceLabels[item.evidenceLevel] || item.evidenceLevel}</small></li>)}</ul></article>)}</div> : <p>검증된 공고 본문에서 경력·지역·근무 방식 정보를 집계하지 못했습니다.</p>}</section>
}

function RoleCoveragePanel({ coverage, postings }) {
  const targetCount = coverage?.targetCount ?? 5
  const verifiedCount = coverage?.verifiedCount ?? postings.length
  const statusCounts = coverage?.statusCounts || {}
  const directOpenedCount = coverage?.directOpenedCount ?? postings.filter((posting) => posting.source?.titleVerified && posting.source?.companyVerified && posting.source?.bodyVerified).length
  const accessFailureCount = coverage?.accessFailureCount ?? ['inaccessible', 'listingOnly', 'loginRequired', 'redirected'].reduce((total, status) => total + Number(statusCounts[status] || 0), 0)
  const rejectedCandidateCount = coverage?.rejectedCandidateCount ?? 0
  const checkedDate = coverage?.checkedDate || sortedUnique(postings.map((posting) => posting.source?.checkedDate)).at(-1) || '미확인'
  const shortage = coverage?.shortage ?? verifiedCount < targetCount
  const shortageReasons = Array.isArray(coverage?.shortageReasons) ? coverage.shortageReasons : []
  return <section className={`role-coverage-panel${shortage ? ' shortage' : ''}`}><header><div><h3>채용공고 조사 근거와 한계</h3><p>{checkedDate} 기준으로 직접 확인한 결과입니다.</p></div>{shortage && <span><AlertTriangle size={15} />표본 부족</span>}</header><dl><div><dt>목표 표본</dt><dd>{targetCount}건</dd></div><div><dt>검증 완료</dt><dd>{verifiedCount}건</dd></div><div><dt>직접 열린 공고</dt><dd>{directOpenedCount}건</dd></div><div><dt>지원 가능 확인</dt><dd>{statusCounts.open || 0}건</dd></div><div><dt>모집 여부 미확정</dt><dd>{statusCounts.accessible || 0}건</dd></div><div><dt>마감 공고</dt><dd>{statusCounts.closed || 0}건</dd></div><div><dt>접근 실패 후보</dt><dd>{accessFailureCount}건</dd></div><div><dt>제외 후보</dt><dd>{rejectedCandidateCount}건</dd></div></dl>{shortage && <div className="role-coverage-shortage"><strong>표본 부족 사유</strong>{shortageReasons.length ? <ul>{shortageReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : <p>검증 기준을 충족하는 공고가 목표 수보다 적습니다.</p>}</div>}<div className="role-coverage-notice"><p>공고 페이지가 열린다는 사실은 현재 모집 중임을 보장하지 않습니다.</p><p>채용공고는 수시로 변경되거나 종료될 수 있습니다.</p></div></section>
}

function Pagination({ page, pageCount, setPage }) {
  if (pageCount <= 1) return null
  return <nav className="role-posting-pagination" aria-label="채용공고 표본 페이지"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={15} />이전 공고</button><span aria-current="page">{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>다음 공고<ChevronRight size={15} /></button></nav>
}

export default function RolePostingResearch({ roleId }) {
  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const allPostings = useMemo(() => enrichedPostingsForRole(roleId), [roleId])
  const postings = useMemo(() => allPostings.filter((posting) => (
    posting.source?.bodyVerified === true
    && visibleStatuses.has(posting.source?.status)
    && visibleMatchLevels.has(posting.match?.level)
  )), [allPostings])
  const coverage = useMemo(() => enrichmentCoverageForRole(roleId), [roleId])
  const responsibilities = useMemo(() => aggregateResponsibilitiesForRole(roleId), [roleId])
  const requirements = useMemo(() => aggregateRequirementsForRole(roleId), [roleId])
  const preferredQualifications = useMemo(() => aggregatePreferredQualificationsForRole(roleId), [roleId])
  const technologies = useMemo(() => aggregateTechnologiesForRole(roleId), [roleId])
  const workProfile = useMemo(() => aggregateWorkProfileForRole(roleId), [roleId])
  const partnerTeams = useMemo(() => aggregatePartnerTeamsForRole(roleId), [roleId])
  const filteredPostings = useMemo(() => postings.filter((posting) => (
    (filters.market === 'all' || posting.market === filters.market)
    && (filters.status === 'all' || posting.source?.status === filters.status)
    && (filters.matchLevel === 'all' || posting.match?.level === filters.matchLevel)
    && (filters.careerLevel === 'all' || posting.careerLevel === filters.careerLevel)
    && (filters.workMode === 'all' || posting.workMode === filters.workMode)
    && (filters.country === 'all' || posting.country === filters.country)
    && (filters.company === 'all' || posting.companyName === filters.company)
    && (filters.checkedDate === 'all' || posting.source?.checkedDate === filters.checkedDate)
  )), [filters, postings])
  const pageCount = Math.max(1, Math.ceil(filteredPostings.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visiblePostings = filteredPostings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }
  const reset = () => {
    setFilters(initialFilters)
    setPage(1)
  }
  return <>
    <section className="role-posting-research" aria-labelledby={`role-posting-title-${roleId}`}>
      <header><div><h3 id={`role-posting-title-${roleId}`}>실제 채용공고 표본</h3><p>공고 제목과 본문을 직접 확인하고 이 역할과 exact 또는 strong 수준으로 연결한 표본만 표시합니다.</p></div><strong>{filteredPostings.length}/{postings.length}건 표시</strong></header>
      <RolePostingFilters postings={postings} filters={filters} updateFilter={updateFilter} reset={reset} />
      <p className="role-posting-result-count" role="status">필터 조건에 맞는 공고 {filteredPostings.length}건</p>
      {visiblePostings.length ? <div className="role-posting-results">{visiblePostings.map((posting) => <RolePostingCard key={posting.id} posting={posting} />)}</div> : <p className="role-posting-empty">현재 필터 조건에 맞는 검증 공고가 없습니다.</p>}
      <Pagination page={currentPage} pageCount={pageCount} setPage={setPage} />
    </section>
    <div className="role-aggregate-grid">
      <FrequencyList title="여러 공고에서 반복된 주요 업무" items={responsibilities} postingCount={postings.length} emptyText="검증된 공고 본문에서 주요 업무를 집계하지 못했습니다." />
      <FrequencyList title="필수 역량" items={requirements} postingCount={postings.length} emptyText="검증된 공고 본문에서 필수 자격요건을 확인하지 못했습니다." />
      <FrequencyList title="우대 역량" items={preferredQualifications} postingCount={postings.length} emptyText="검증된 공고 본문에서 별도 우대사항을 확인하지 못했습니다." />
      <FrequencyList title="협업 조직" items={partnerTeams} postingCount={postings.length} emptyText="검증된 공고 본문에서 구체적인 협업 조직을 확인하지 못했습니다." />
    </div>
    <TechnologyGroups technologies={technologies} postingCount={postings.length} />
    <WorkProfileGroups profile={workProfile} postingCount={postings.length} />
    <RoleCoveragePanel coverage={coverage} postings={postings} />
  </>
}
