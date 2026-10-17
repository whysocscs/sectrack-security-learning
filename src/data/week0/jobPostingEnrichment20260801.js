import {
  acceptedPosting,
  aggregatePostingField,
  canonicalizePostingUrl,
  completeExtractedFields,
  isEnrichedPostingLinkVisible,
  prepareEnrichedPosting,
} from './jobPostingEnrichmentCore.js'
import {
  jobPostingResearchTargetSummary,
  roleResearchTargetById,
  roleResearchTargets,
} from './jobPostingResearchTargets.js'
import {
  domainEnrichedPostings as governanceAppsecPostings,
  domainRoleResearch as governanceAppsecResearch,
} from './jobPostings/enrichmentGovernanceAppsec20260801.js'
import {
  domainEnrichedPostings as offensiveDetectionPostings,
  domainRoleResearch as offensiveDetectionResearch,
} from './jobPostings/enrichmentOffensiveDetection20260801.js'
import {
  domainEnrichedPostings as infrastructureCloudPostings,
  domainRoleResearch as infrastructureCloudResearch,
} from './jobPostings/enrichmentInfrastructureCloud20260801.js'
import {
  domainEnrichedPostings as iotAutomotiveAiRndPostings,
  domainRoleResearch as iotAutomotiveAiRndResearch,
} from './jobPostings/enrichmentIotAutomotiveAiRnd20260801.js'
import {
  domainEnrichedPostings as aiRndAdditionalPostings,
  domainRoleResearch as aiRndAdditionalResearch,
} from './jobPostings/enrichmentAiRndAdditional20260801.js'
import {
  existingAuditEnrichedPostingsRaw,
  existingAuditRejectedCandidates,
} from './jobPostings/existingAuditEnrichment20260801.js'

const checkedDate = '2026-08-01'
const targetCountPerRole = 5
const acceptedStatuses = new Set(['open', 'accessible', 'closed'])
const failureStatuses = new Set(['inaccessible', 'listingOnly', 'loginRequired', 'redirected'])
const statusNames = ['open', 'accessible', 'closed', 'inaccessible', 'listingOnly', 'loginRequired', 'redirected']
const matchNames = ['exact', 'strong', 'adjacent', 'reject']
const technologyKeys = [
  'tools', 'programmingLanguages', 'queryLanguages', 'scriptingLanguages', 'cloudPlatforms',
  'containerPlatforms', 'operatingSystems', 'databases', 'securityProducts', 'protocols',
  'frameworks', 'lawsAndStandards', 'certifications', 'deliverables',
]

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function frozenCountRecord(names) {
  return Object.fromEntries(names.map((name) => [name, 0]))
}

function hasExtractedEvidence(posting) {
  return ['responsibilities', 'requirements', 'preferredQualifications']
    .some((key) => posting.extracted?.[key]?.length)
}

function normalizedExistingPosting(raw) {
  const target = roleResearchTargetById[raw.roleId]
  if (!target) return null
  return prepareEnrichedPosting({
    ...raw,
    domainId: target.domainId,
    familyId: target.familyId,
    normalizedRoleTitle: target.roleTitle,
    employmentType: raw.employmentType || '',
    extracted: completeExtractedFields(raw.extracted),
  })
}

const incompleteExistingCandidates = []
const usableExistingPostings = []
for (const raw of existingAuditEnrichedPostingsRaw) {
  const posting = normalizedExistingPosting(raw)
  if (!posting || !acceptedPosting(posting) || !acceptedStatuses.has(posting.source.status)) continue
  if (!hasExtractedEvidence(posting)) {
    incompleteExistingCandidates.push(Object.freeze({
      roleId: posting.roleId,
      companyName: posting.companyName,
      originalJobTitle: posting.originalJobTitle,
      postingUrl: posting.source.postingUrl,
      canonicalUrl: posting.source.canonicalUrl,
      status: posting.source.status,
      checkedDate: posting.source.checkedDate,
      reason: '개별 공고 본문은 열렸지만 담당업무·자격요건·우대사항 섹션을 구조화하지 못해 UI 표본에서 제외했다.',
    }))
  } else {
    usableExistingPostings.push(posting)
  }
}

const allPostingCandidates = [
  ...governanceAppsecPostings,
  ...offensiveDetectionPostings,
  ...infrastructureCloudPostings,
  ...iotAutomotiveAiRndPostings,
  ...aiRndAdditionalPostings,
  ...usableExistingPostings,
]

const postingKeys = new Set()
const postingIds = new Set()
const accepted = []
for (const posting of allPostingCandidates) {
  if (!acceptedPosting(posting) || !acceptedStatuses.has(posting.source.status)) continue
  const canonicalUrl = canonicalizePostingUrl(posting.source.canonicalUrl || posting.source.postingUrl)
  const roleUrlKey = `${posting.roleId}::${canonicalUrl}`
  if (postingKeys.has(roleUrlKey)) continue
  if (postingIds.has(posting.id)) throw new Error(`Duplicate enrichment posting id: ${posting.id}`)
  postingKeys.add(roleUrlKey)
  postingIds.add(posting.id)
  accepted.push(posting)
}

export const enrichedJobPostings = Object.freeze(accepted)

const postingsByRoleId = new Map(roleResearchTargets.map((target) => [target.roleId, []]))
for (const posting of enrichedJobPostings) postingsByRoleId.get(posting.roleId).push(posting)
for (const [roleId, postings] of postingsByRoleId) postingsByRoleId.set(roleId, Object.freeze(postings))

function normalizeRejectedCandidate(candidate) {
  const postingUrl = candidate.postingUrl || candidate.url || null
  let canonicalUrl = null
  if (postingUrl?.startsWith('https://')) {
    try { canonicalUrl = canonicalizePostingUrl(postingUrl) } catch { canonicalUrl = null }
  }
  return Object.freeze({
    roleId: candidate.roleId,
    companyName: candidate.companyName || '',
    originalJobTitle: candidate.originalJobTitle || '',
    postingUrl,
    canonicalUrl,
    status: statusNames.includes(candidate.status) ? candidate.status : 'inaccessible',
    checkedDate: candidate.checkedDate || checkedDate,
    reason: candidate.reason || '직접 검증 기준을 충족하지 않아 채택하지 않았다.',
  })
}

const researchRecords = [
  ...governanceAppsecResearch,
  ...offensiveDetectionResearch,
  ...infrastructureCloudResearch,
  ...iotAutomotiveAiRndResearch,
  ...aiRndAdditionalResearch,
]
const researchRecordsByRoleId = new Map(roleResearchTargets.map((target) => [target.roleId, []]))
for (const record of researchRecords) {
  if (researchRecordsByRoleId.has(record.roleId)) researchRecordsByRoleId.get(record.roleId).push(record)
}

const rejectedByRoleId = new Map(roleResearchTargets.map((target) => [target.roleId, []]))
for (const candidate of [...existingAuditRejectedCandidates, ...incompleteExistingCandidates]) {
  if (!rejectedByRoleId.has(candidate.roleId)) continue
  rejectedByRoleId.get(candidate.roleId).push(normalizeRejectedCandidate(candidate))
}
for (const record of researchRecords) {
  for (const candidate of record.rejectedCandidates || []) {
    if (!rejectedByRoleId.has(record.roleId)) continue
    rejectedByRoleId.get(record.roleId).push(normalizeRejectedCandidate({ ...candidate, roleId: record.roleId }))
  }
}
for (const [roleId, candidates] of rejectedByRoleId) {
  const seen = new Set()
  const acceptedCanonicalUrls = new Set(
    (postingsByRoleId.get(roleId) || []).map((posting) => posting.source.canonicalUrl),
  )
  const deduplicated = candidates.filter((candidate) => {
    if (candidate.canonicalUrl && acceptedCanonicalUrls.has(candidate.canonicalUrl)) return false
    const key = candidate.canonicalUrl || `${candidate.companyName}::${candidate.originalJobTitle}::${candidate.reason}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  rejectedByRoleId.set(roleId, Object.freeze(deduplicated))
}

function coverageForTarget(target) {
  const postings = postingsByRoleId.get(target.roleId) || []
  const rejectedCandidates = rejectedByRoleId.get(target.roleId) || []
  const records = researchRecordsByRoleId.get(target.roleId) || []
  const statusCounts = frozenCountRecord(statusNames)
  const matchLevelCounts = frozenCountRecord(matchNames)
  for (const posting of postings) {
    statusCounts[posting.source.status] += 1
    matchLevelCounts[posting.match.level] += 1
  }
  for (const candidate of rejectedCandidates) statusCounts[candidate.status] += 1
  matchLevelCounts.reject = rejectedCandidates.length
  const shortage = postings.length < targetCountPerRole
  const recordedReasons = unique(records.flatMap((record) => record.shortageReasons || []))
  const shortageReasons = shortage
    ? unique([
        target.detailedRoleId && postings.length === 0
          ? '상세 researchRoles에는 정의되어 있지만 현재 representativeRoleCatalog의 독립 UI 역할로 연결되지 않은 항목이라, 확인 가능한 공고 URL을 추측하지 않고 부족 상태로 기록했다.'
          : '',
        ...recordedReasons,
        `회사·직무명·본문을 직접 확인하고 exact 또는 strong으로 판정한 고유 공고가 ${postings.length}/${targetCountPerRole}건이다.`,
        rejectedCandidates.length ? `검토한 후보 ${rejectedCandidates.length}건은 접근 실패·목록 이동·본문 미추출 또는 직무 근거 부족으로 제외했다.` : '',
      ])
    : []
  return Object.freeze({
    roleId: target.roleId,
    roleTitle: target.roleTitle,
    domainId: target.domainId,
    domainTitle: target.domainTitle,
    familyId: target.familyId,
    familyTitle: target.familyTitle,
    checkedDate,
    targetCount: targetCountPerRole,
    candidateCount: postings.length + rejectedCandidates.length,
    verifiedCount: postings.length,
    acceptedCount: postings.length,
    uniqueUrlCount: new Set(postings.map((posting) => posting.source.canonicalUrl)).size,
    directOpenedCount: postings.filter((posting) => posting.source.titleVerified && posting.source.companyVerified && posting.source.bodyVerified).length,
    currentOpenCount: statusCounts.open,
    accessibleCount: statusCounts.accessible,
    closedCount: statusCounts.closed,
    accessFailureCount: [...failureStatuses].reduce((total, status) => total + statusCounts[status], 0),
    inaccessibleCandidateCount: statusCounts.inaccessible,
    statusCounts: Object.freeze(statusCounts),
    matchLevelCounts: Object.freeze(matchLevelCounts),
    shortage,
    shortageReasons: Object.freeze(shortageReasons),
    searchedQueries: Object.freeze(unique([
      ...(target.searchQueries || []),
      ...records.flatMap((record) => record.searchedQueries || []),
    ])),
    rejectedCandidateCount: rejectedCandidates.length,
    rejectedCandidates,
    postingIds: Object.freeze(postings.map((posting) => posting.id)),
  })
}

export const rolePostingCoverage = Object.freeze(roleResearchTargets.map(coverageForTarget))
const coverageByRoleId = new Map(rolePostingCoverage.map((coverage) => [coverage.roleId, coverage]))

const globalStatusCounts = frozenCountRecord(statusNames)
const globalMatchLevelCounts = frozenCountRecord(matchNames)
for (const posting of enrichedJobPostings) {
  globalStatusCounts[posting.source.status] += 1
  globalMatchLevelCounts[posting.match.level] += 1
}
const allRejectedCandidates = rolePostingCoverage.flatMap((coverage) => coverage.rejectedCandidates)
for (const candidate of allRejectedCandidates) globalStatusCounts[candidate.status] += 1
globalMatchLevelCounts.reject = allRejectedCandidates.length

export const jobPostingEnrichmentSummary = Object.freeze({
  checkedDate,
  domainCount: jobPostingResearchTargetSummary.domainCount,
  familyCount: jobPostingResearchTargetSummary.familyCount,
  roleCount: jobPostingResearchTargetSummary.roleCount,
  targetPostingCount: jobPostingResearchTargetSummary.targetPostingMappingCount,
  postingMappingCount: enrichedJobPostings.length,
  uniqueUrlCount: new Set(enrichedJobPostings.map((posting) => posting.source.canonicalUrl)).size,
  statusCounts: Object.freeze(globalStatusCounts),
  matchLevelCounts: Object.freeze(globalMatchLevelCounts),
  rejectedCandidateCount: allRejectedCandidates.length,
  excludedIncompleteExistingCount: incompleteExistingCandidates.length,
  shortageRoleCount: rolePostingCoverage.filter((coverage) => coverage.shortage).length,
})

export function enrichedPostingsForRole(roleId) {
  return postingsByRoleId.get(roleId) || Object.freeze([])
}

export function enrichmentCoverageForRole(roleId) {
  return coverageByRoleId.get(roleId) || null
}

export function aggregateResponsibilitiesForRole(roleId) {
  return aggregatePostingField(enrichedPostingsForRole(roleId), (posting) => posting.extracted.responsibilities)
}

export function aggregateRequirementsForRole(roleId) {
  return aggregatePostingField(enrichedPostingsForRole(roleId), (posting) => posting.extracted.requirements)
}

export function aggregatePreferredQualificationsForRole(roleId) {
  return aggregatePostingField(enrichedPostingsForRole(roleId), (posting) => posting.extracted.preferredQualifications)
}

export function aggregatePartnerTeamsForRole(roleId) {
  return aggregatePostingField(enrichedPostingsForRole(roleId), (posting) => posting.extracted.partnerTeams)
}

export function aggregateTechnologiesForRole(roleId) {
  const postings = enrichedPostingsForRole(roleId)
  return Object.freeze(Object.fromEntries(technologyKeys.map((key) => [
    key,
    aggregatePostingField(postings, (posting) => posting.extracted[key]),
  ])))
}

export function aggregateWorkProfileForRole(roleId) {
  const postings = enrichedPostingsForRole(roleId)
  return Object.freeze({
    careerLevels: aggregatePostingField(postings, (posting) => [posting.careerLevel]),
    countries: aggregatePostingField(postings, (posting) => [posting.country]),
    locations: aggregatePostingField(postings, (posting) => [posting.location]),
    workModes: aggregatePostingField(postings, (posting) => [posting.workMode]),
    employmentTypes: aggregatePostingField(postings, (posting) => [posting.employmentType]),
  })
}

export { isEnrichedPostingLinkVisible }
