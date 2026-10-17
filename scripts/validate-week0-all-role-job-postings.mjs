import { readFile } from 'node:fs/promises'
import {
  aggregatePartnerTeamsForRole,
  aggregatePreferredQualificationsForRole,
  aggregateRequirementsForRole,
  aggregateResponsibilitiesForRole,
  aggregateTechnologiesForRole,
  enrichedJobPostings,
  enrichedPostingsForRole,
  isEnrichedPostingLinkVisible,
  jobPostingEnrichmentSummary,
  rolePostingCoverage,
} from '../src/data/week0/jobPostingEnrichment20260801.js'
import {
  canonicalizePostingUrl,
  isMatchScoreConsistent,
  isValidCheckedDate,
  validateEnrichedPosting,
} from '../src/data/week0/jobPostingEnrichmentCore.js'
import { researchDomains, researchJobFamilies } from '../src/data/week0/careerResearch.js'
import { roleResearchTargetById, roleResearchTargets } from '../src/data/week0/jobPostingResearchTargets.js'

const auditDocumentPath = new URL('../docs/research/week0-all-role-job-posting-enrichment-2026-08-01.md', import.meta.url)
const visibleStatuses = new Set(['open', 'accessible', 'closed'])
const hiddenStatuses = new Set(['inaccessible', 'listingOnly', 'loginRequired', 'redirected'])
const errors = []

function check(condition, message) {
  if (!condition) errors.push(message)
}

function setEquals(left, right) {
  return left.size === right.size && [...left].every((value) => right.has(value))
}

const roleIds = new Set(roleResearchTargets.map((target) => target.roleId))
const domainIds = new Set(researchDomains.map((domain) => domain.id))
const familyById = new Map(researchJobFamilies.map((family) => [family.id, family]))
const coverageByRoleId = new Map(rolePostingCoverage.map((coverage) => [coverage.roleId, coverage]))
const postingById = new Map(enrichedJobPostings.map((posting) => [posting.id, posting]))

check(rolePostingCoverage.length === roleResearchTargets.length, '모든 역할에 coverage가 생성되어야 한다.')
check(coverageByRoleId.size === roleResearchTargets.length, 'coverage roleId는 중복 없이 전체 역할을 포함해야 한다.')
check(setEquals(new Set(coverageByRoleId.keys()), roleIds), 'coverage 역할 집합이 조사 대상 역할 집합과 일치하지 않는다.')
check(jobPostingEnrichmentSummary.roleCount === roleResearchTargets.length, '요약 역할 수가 실제 대상 수와 다르다.')
check(jobPostingEnrichmentSummary.domainCount === researchDomains.length, '요약 분야 수가 실제 분야 수와 다르다.')
check(jobPostingEnrichmentSummary.familyCount === researchJobFamilies.length, '요약 직무군 수가 실제 직무군 수와 다르다.')

for (const domain of researchDomains) {
  check(roleResearchTargets.some((target) => target.domainId === domain.id), `${domain.id}: 분야에 역할이 하나 이상 있어야 한다.`)
}

const postingIds = new Set()
const roleCanonicalKeys = new Set()
for (const posting of enrichedJobPostings) {
  check(roleIds.has(posting.roleId), `${posting.id}: 존재하지 않는 roleId ${posting.roleId}`)
  check(domainIds.has(posting.domainId), `${posting.id}: 존재하지 않는 domainId ${posting.domainId}`)
  const target = roleResearchTargetById[posting.roleId]
  check(posting.domainId === target?.domainId, `${posting.id}: 역할과 분야 연결이 올바르지 않다.`)
  check(posting.familyId === target?.familyId, `${posting.id}: 역할과 직무군 연결이 올바르지 않다.`)
  check(familyById.get(posting.familyId)?.domainId === posting.domainId, `${posting.id}: 직무군과 분야 연결이 올바르지 않다.`)
  check(!postingIds.has(posting.id), `${posting.id}: 공고 ID가 중복된다.`)
  postingIds.add(posting.id)
  check(posting.source.postingUrl.startsWith('https://'), `${posting.id}: 노출 URL은 HTTPS여야 한다.`)
  check(posting.source.canonicalUrl === canonicalizePostingUrl(posting.source.canonicalUrl), `${posting.id}: canonical URL 정규화가 일치하지 않는다.`)
  const roleCanonicalKey = `${posting.roleId}::${posting.source.canonicalUrl}`
  check(!roleCanonicalKeys.has(roleCanonicalKey), `${posting.id}: 같은 역할 안에서 canonical URL이 중복된다.`)
  roleCanonicalKeys.add(roleCanonicalKey)
  check(Boolean(posting.companyName.trim()), `${posting.id}: 회사명이 비어 있다.`)
  check(Boolean(posting.originalJobTitle.trim()), `${posting.id}: 공고 제목이 비어 있다.`)
  check(isValidCheckedDate(posting.source.checkedDate), `${posting.id}: checkedDate가 유효하지 않다.`)
  check(posting.source.titleVerified, `${posting.id}: 공고 제목을 직접 확인해야 한다.`)
  check(posting.source.companyVerified, `${posting.id}: 회사명을 직접 확인해야 한다.`)
  check(posting.source.bodyVerified, `${posting.id}: 본문 검증이 없는 공고는 채택할 수 없다.`)
  check(visibleStatuses.has(posting.source.status), `${posting.id}: UI 데이터에 숨김 상태 공고가 포함됐다.`)
  check(isEnrichedPostingLinkVisible(posting), `${posting.id}: 노출 조건과 source status가 일치하지 않는다.`)
  check(posting.source.status !== 'open' || posting.source.applicationAvailable, `${posting.id}: open은 지원 경로 확인이 필요하다.`)
  check(isMatchScoreConsistent(posting.match.level, posting.match.score), `${posting.id}: match level과 score가 일치하지 않는다.`)
  check(['exact', 'strong'].includes(posting.match.level), `${posting.id}: 최소 표본에는 exact/strong만 허용한다.`)
  check(posting.match.level !== 'strong' || posting.match.matchedResponsibilities.length >= 3, `${posting.id}: strong은 독립 업무 근거 3개 이상이 필요하다.`)
  check(validateEnrichedPosting(posting, roleIds, domainIds).length === 0, `${posting.id}: 공고 스키마 검증에 실패했다.`)
  for (const [key, values] of Object.entries(posting.extracted)) {
    check(Array.isArray(values), `${posting.id}: extracted.${key}는 배열이어야 한다.`)
    check(values.every((value) => typeof value === 'string' && value.trim()), `${posting.id}: extracted.${key}에 빈 문자열이 있다.`)
  }
}

for (const target of roleResearchTargets) {
  const coverage = coverageByRoleId.get(target.roleId)
  const postings = enrichedPostingsForRole(target.roleId)
  check(Boolean(coverage), `${target.roleId}: coverage가 없다.`)
  check(coverage?.verifiedCount === postings.length, `${target.roleId}: coverage count가 실제 공고 수와 다르다.`)
  check(coverage?.uniqueUrlCount === new Set(postings.map((posting) => posting.source.canonicalUrl)).size, `${target.roleId}: unique URL 수가 다르다.`)
  if (postings.length < 5) {
    check(coverage?.shortage === true, `${target.roleId}: 5개 미만이면 shortage가 true여야 한다.`)
    check(coverage?.shortageReasons?.length > 0, `${target.roleId}: 표본 부족 사유가 필요하다.`)
    check(Array.isArray(coverage?.searchedQueries), `${target.roleId}: 사용한 검색어 배열이 필요하다.`)
  } else {
    check(coverage?.shortage === false, `${target.roleId}: 5개 이상인데 shortage가 true다.`)
  }
  check(coverage?.postingIds.length === postings.length, `${target.roleId}: coverage postingIds 수가 다르다.`)
  check(new Set(coverage?.postingIds).size === coverage?.postingIds.length, `${target.roleId}: coverage postingIds가 중복된다.`)
  check(coverage?.postingIds.every((postingId) => postingById.has(postingId)), `${target.roleId}: coverage postingIds가 존재하지 않는 공고를 가리킨다.`)

  const aggregates = [
    aggregateResponsibilitiesForRole(target.roleId),
    aggregateRequirementsForRole(target.roleId),
    aggregatePreferredQualificationsForRole(target.roleId),
    aggregatePartnerTeamsForRole(target.roleId),
    ...Object.values(aggregateTechnologiesForRole(target.roleId)),
  ]
  for (const aggregate of aggregates) {
    for (const item of aggregate) {
      check(item.count === item.postingIds.length, `${target.roleId}/${item.key}: 집계 count와 postingIds 길이가 다르다.`)
      check(new Set(item.postingIds).size === item.postingIds.length, `${target.roleId}/${item.key}: 집계 postingIds가 중복된다.`)
      check(item.postingIds.every((postingId) => postingById.get(postingId)?.roleId === target.roleId), `${target.roleId}/${item.key}: 다른 역할 공고를 참조한다.`)
    }
  }

  for (const candidate of coverage?.rejectedCandidates || []) {
    check(!candidate.postingUrl || !isEnrichedPostingLinkVisible({ source: { postingUrl: candidate.postingUrl, bodyVerified: false, status: candidate.status } }), `${target.roleId}: 제외 후보가 UI 링크 조건을 만족하면 안 된다.`)
    if (hiddenStatuses.has(candidate.status)) check(!postings.some((posting) => posting.source.canonicalUrl === candidate.canonicalUrl), `${target.roleId}: 접근 실패 후보가 정상 공고로 노출된다.`)
  }
}

let auditDocument = ''
try {
  auditDocument = await readFile(auditDocumentPath, 'utf8')
} catch (error) {
  errors.push(`감사 문서를 읽지 못했다: ${error.message}`)
}

if (auditDocument) {
  const startMarker = '<!-- ACCEPTED_URLS_START -->'
  const endMarker = '<!-- ACCEPTED_URLS_END -->'
  const start = auditDocument.indexOf(startMarker)
  const end = auditDocument.indexOf(endMarker)
  check(start >= 0 && end > start, '감사 문서에 채택 URL 경계 마커가 필요하다.')
  if (start >= 0 && end > start) {
    const section = auditDocument.slice(start + startMarker.length, end)
    const documentUrls = new Set([...section.matchAll(/https:\/\/[^\s>]+/g)].map((match) => canonicalizePostingUrl(match[0])))
    const dataUrls = new Set(enrichedJobPostings.map((posting) => posting.source.canonicalUrl))
    check(setEquals(documentUrls, dataUrls), `감사 문서 채택 URL(${documentUrls.size})과 데이터 URL(${dataUrls.size})이 일치하지 않는다.`)
  }
  for (const target of roleResearchTargets) check(auditDocument.includes(`<!-- ROLE:${target.roleId} -->`), `${target.roleId}: 감사 문서 역할 항목이 없다.`)
}

if (errors.length) {
  console.error(`Week 0 전체 역할 채용공고 검증 실패: ${errors.length}건`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Week 0 전체 역할 채용공고 검증 성공')
console.log(JSON.stringify(jobPostingEnrichmentSummary, null, 2))
