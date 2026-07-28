import { representativeRoleCatalog, researchDomains } from './careerResearch.js'
import { jobPostingAuditRows, jobPostingAuditSummary } from './jobPostingsAudit20260727.js'

const completenessFields = [
  'companyName', 'jobTitle', 'responsibilities', 'requirements', 'preferredQualifications',
  'tools', 'lawsAndStandards', 'careerLevel', 'workLocation', 'postingUrl',
]

function filled(value) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value)
}

export function calculateContentCompletenessScore(posting) {
  const raw = posting.raw || {}
  const normalized = posting.normalized || {}
  const source = posting.source || {}
  const valueFor = {
    companyName: raw.companyName,
    jobTitle: raw.jobTitle,
    responsibilities: raw.responsibilities,
    requirements: raw.requirements,
    preferredQualifications: raw.preferredQualifications,
    tools: normalized.tools,
    lawsAndStandards: normalized.lawsAndStandards,
    careerLevel: normalized.careerLevel && normalized.careerLevel !== 'unknown',
    workLocation: raw.workLocation,
    postingUrl: source.postingUrl,
  }
  return Number((completenessFields.filter((key) => filled(valueFor[key])).length / completenessFields.length).toFixed(2))
}

const domainIdByTitle = new Map(researchDomains.map((domain) => [domain.title, domain.id]))
const catalogRoleByDomainAndTitle = new Map(representativeRoleCatalog.map((role) => [`${role.domainId}::${role.title}`, role]))

const roleAliases = Object.freeze({
  'governance::GRC Analyst': 'catalog-grc',
  'governance::Security Compliance Analyst': 'catalog-compliance',
  'governance::Information Security Governance Analyst': 'catalog-security-strategy',
  'governance::Cyber Risk Analyst': 'catalog-cyber-risk',
  'consulting::Information Security Consultant': 'catalog-cybersecurity-consultant',
  'consulting::Cyber Risk Consultant': 'catalog-grc-consultant',
  'appsec::Application Security Architect': 'catalog-product-security-architect',
  'appsec::Software Security Engineer': 'catalog-appsec-engineer',
  'offensive::Offensive Security Engineer': 'catalog-pentester',
  'dfir::Incident Response Analyst': 'catalog-incident-response',
  'dfir::Incident Response Engineer': 'catalog-incident-response',
  'dfir::DFIR·Incident Response Consultant': 'catalog-dfir-consultant',
  'reverse::Malware Researcher': 'catalog-threat-researcher',
  'infrastructure::System Security Engineer': 'catalog-security-infrastructure-engineer',
  'cloud::Identity Security Engineer': 'catalog-iam-engineer',
  'ot::Industrial Cybersecurity Engineer': 'catalog-ot-security-engineer',
})

const representativeRoleById = new Map(representativeRoleCatalog.map((role) => [role.id, role]))

function normalizeCareerLevel(value = '') {
  const text = value.toLocaleLowerCase('ko-KR')
  if (/신입|entry|junior/.test(text)) return 'entry'
  if (/시니어|senior|lead|manager|경력직/.test(text)) return 'senior'
  if (/mid|중급/.test(text)) return 'mid'
  return 'unknown'
}

function roleMappingFor(row, domainId) {
  const exact = catalogRoleByDomainAndTitle.get(`${domainId}::${row.representativeRole}`)
  const aliased = representativeRoleById.get(roleAliases[`${domainId}::${row.representativeRole}`])
  const role = exact || aliased
  const match = row.matchLevel || ''
  const basis = match.includes('직무명') ? 'title' : 'responsibility'
  const confidence = match.includes('인접') || match.includes('부분') ? 'medium' : 'high'
  const weight = match.includes('인접') ? 0.6 : match.includes('부분') ? 0.5 : match === '직무명 일치' ? 0.8 : 1
  return {
    auditRoleId: `audit-role-${String(row.fieldNumber).padStart(2, '0')}-${String(row.roleNumber).padStart(2, '0')}`,
    roleId: role?.id || `audit-role-${row.fieldNumber}-${row.roleNumber}`,
    roleTitle: row.representativeRole,
    catalogRoleTitle: role?.title || null,
    weight,
    basis,
    confidence,
  }
}

export function postingAuditGroup(posting) {
  const recommendation = posting.source.operatingRecommendation
  if (recommendation === '조건부 후보·모집 여부 재확인') return 'candidate'
  if (recommendation === '수동 확인 전 비노출') return 'manual'
  if (recommendation === '아카이브만') return 'archive'
  return 'hidden'
}

function postingFromAudit(row) {
  const domainId = domainIdByTitle.get(row.field) || null
  const directPageOpened = row.finalLinkStatus === '직접 공고 페이지 열림'
  const archived = row.operatingRecommendation === '아카이브만'
  const linkVisible = directPageOpened || archived
  const item = {
    id: `audit-posting-${String(row.number).padStart(3, '0')}`,
    raw: {
      companyName: row.company,
      jobTitle: row.jobTitle,
      workLocation: row.location || '',
      employmentType: '',
      experience: row.careerLevel || '',
      responsibilities: [],
      requirements: [],
      preferredQualifications: [],
    },
    normalized: {
      industryId: null,
      securityDomainId: domainId,
      securityDomainTitle: row.field,
      representativeRole: row.representativeRole,
      careerLevel: normalizeCareerLevel(row.careerLevel || ''),
      requiredYearsMin: null,
      requiredYearsMax: null,
      roleMappings: [roleMappingFor(row, domainId)],
      competencies: [],
      tools: [],
      platforms: [],
      protocols: [],
      frameworks: [],
      lawsAndStandards: [],
      deliverables: [],
      partnerTeams: [],
    },
    source: {
      sourceType: 'individualVacancy',
      pageSystem: row.sourceType || 'unknown',
      market: row.market === '국내' ? 'domestic' : 'international',
      sourceLabel: row.sourceType,
      postingUrl: linkVisible ? row.url : null,
      auditUrl: row.url,
      applyUrl: null,
      checkedDate: row.finalVerifiedDate,
      initialCheckedDate: row.initialCheckedDate,
      isCurrent: row.finalLinkStatus === '명시적 마감·기한 경과' ? false : null,
      originalStatus: row.originalStatus,
      finalLinkStatus: row.finalLinkStatus,
      operatingRecommendation: row.operatingRecommendation,
      verificationBasis: row.verificationBasis,
      archivedAsset: null,
      replacementTitle: row.replacementTitle,
      replacementUrl: row.replacementUrl,
    },
    evidence: {
      bodyVerified: directPageOpened,
      contentCompleteness: 'urlAudit',
      contentCompletenessScore: 0,
      notes: row.notes || '엑셀에 별도 매칭 비고가 없습니다.',
      fieldEvidence: {
        companyName: { evidenceType: 'direct' },
        jobTitle: { evidenceType: 'direct' },
        roleMappings: { evidenceType: 'normalized' },
        linkStatus: { evidenceType: 'direct' },
      },
    },
    audit: {
      postingNumber: row.number,
      fieldNumber: row.fieldNumber,
      roleNumber: row.roleNumber,
      matchLevel: row.matchLevel,
      urlUseCount: row.urlUseCount,
      duplicateMapping: row.duplicateMapping === '예',
    },
  }
  item.evidence.contentCompletenessScore = calculateContentCompletenessScore(item)
  return Object.freeze(item)
}

export const jobPostingSeeds = Object.freeze(jobPostingAuditRows.map(postingFromAudit))

const postingsByAuditedRoleId = new Map()
for (const posting of jobPostingSeeds) {
  const auditRoleId = posting.normalized.roleMappings[0].auditRoleId
  const current = postingsByAuditedRoleId.get(auditRoleId) || []
  current.push(posting)
  postingsByAuditedRoleId.set(auditRoleId, current)
}

export const auditedRepresentativeRoles = Object.freeze([...postingsByAuditedRoleId.entries()].map(([id, postings]) => {
  const sample = postings[0]
  const mapping = sample.normalized.roleMappings[0]
  return Object.freeze({
    id,
    fieldNumber: sample.audit.fieldNumber,
    roleNumber: sample.audit.roleNumber,
    domainId: sample.normalized.securityDomainId,
    domainTitle: sample.normalized.securityDomainTitle,
    title: sample.normalized.representativeRole,
    catalogRoleId: mapping.roleId,
    catalogRoleTitle: mapping.catalogRoleTitle,
    postingCount: postings.length,
    domesticCount: postings.filter((posting) => posting.source.market === 'domestic').length,
    internationalCount: postings.filter((posting) => posting.source.market === 'international').length,
    directOpenCount: postings.filter((posting) => postingAuditGroup(posting) === 'candidate').length,
  })
}))

export function postingsForAuditedRole(auditRoleId) {
  return postingsByAuditedRoleId.get(auditRoleId) || []
}

export const jobPostingFieldOptions = Object.freeze([...new Map(jobPostingAuditRows
  .map((row) => [row.fieldNumber, { id: domainIdByTitle.get(row.field) || `field-${row.fieldNumber}`, title: row.field, number: row.fieldNumber }]))
  .values()]
  .sort((left, right) => left.number - right.number))

export const jobMarketResearchSummary = Object.freeze({
  sampleLabel: '최종 URL 감사 채용공고 데이터',
  sampleSize: jobPostingAuditSummary.mappingCount,
  uniqueUrlCount: jobPostingAuditSummary.uniqueUrlCount,
  representativeRoleCount: jobPostingAuditSummary.representativeRoleCount,
  fieldCount: jobPostingAuditSummary.fieldCount,
  domesticCount: jobPostingAuditSummary.domesticCount,
  internationalCount: jobPostingAuditSummary.internationalCount,
  directOpenMappingCount: jobPostingAuditSummary.mappingStatusCounts['직접 공고 페이지 열림'],
  directOpenUniqueCount: jobPostingAuditSummary.uniqueStatusCounts['직접 공고 페이지 열림'],
  manualReviewMappingCount: jobPostingAuditSummary.mappingStatusCounts['자동 확인 실패'],
  auditDate: jobPostingAuditSummary.auditDate,
  sourceFile: jobPostingAuditSummary.sourceFile,
  caveat: '320개 직무-공고 매핑과 290개 고유 URL을 2026-07-27 기준으로 감사한 사용자 제공 자료입니다. “직접 공고 페이지 열림”은 제목·본문 또는 지원 화면이 렌더링됐다는 뜻이며 현재 모집 중임을 보장하지 않습니다.',
  industryInsights: [
    { id: 'coverage', title: '16개 분야·80개 대표 직무', body: '각 대표 직무에 국내 2건과 해외 2건을 연결해 직무별 비교가 가능하도록 구성했습니다.' },
    { id: 'mapping', title: '320개 매핑·290개 고유 URL', body: '하나의 공고가 여러 실제 책임을 포함한 경우 복수 대표 직무에 연결되므로 매핑 수와 고유 공고 수를 구분합니다.' },
    { id: 'verified', title: '직접 열린 고유 URL 171개', body: '직접 페이지가 열렸더라도 현재 접수 중인지 공고를 열 때 다시 확인해야 합니다.' },
    { id: 'conservative', title: '자동 확인 실패는 비노출', body: '자동 확인 실패·404·일반 목록은 운영 권장에 따라 링크를 숨기고 검증 상태만 표시합니다.' },
  ],
})

const postingById = new Map(jobPostingSeeds.map((posting) => [posting.id, posting]))

export function postingMarket(postingId) {
  return postingById.get(postingId)?.source.market || 'international'
}

export function getPostingById(id) {
  return postingById.get(id) || null
}
