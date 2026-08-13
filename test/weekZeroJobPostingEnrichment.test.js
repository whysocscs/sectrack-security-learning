import assert from 'node:assert/strict'
import test from 'node:test'
import { researchDomains, researchRoles } from '../src/data/week0/careerResearch.js'
import {
  aggregatePartnerTeamsForRole,
  aggregatePreferredQualificationsForRole,
  aggregateRequirementsForRole,
  aggregateResponsibilitiesForRole,
  aggregateTechnologiesForRole,
  enrichedJobPostings,
  enrichedPostingsForRole,
  enrichmentCoverageForRole,
  isEnrichedPostingLinkVisible,
  jobPostingEnrichmentSummary,
  rolePostingCoverage,
} from '../src/data/week0/jobPostingEnrichment20260801.js'
import {
  canonicalizePostingUrl,
  completeExtractedFields,
  isMatchScoreConsistent,
  normalizeTechnologyLabel,
  prepareEnrichedPosting,
  validateEnrichedPosting,
} from '../src/data/week0/jobPostingEnrichmentCore.js'
import { roleResearchTargetById, roleResearchTargets } from '../src/data/week0/jobPostingResearchTargets.js'

const roleIds = new Set(roleResearchTargets.map((target) => target.roleId))
const domainIds = new Set(researchDomains.map((domain) => domain.id))

function fixture(overrides = {}) {
  const posting = {
    id: 'fixture-posting',
    roleId: 'catalog-grc',
    domainId: 'governance',
    familyId: 'family-governance',
    companyName: '검증 회사',
    originalJobTitle: 'Security GRC Analyst',
    normalizedRoleTitle: 'GRC Analyst·Engineer',
    market: 'international',
    country: '미국',
    location: 'Remote',
    workMode: 'remote',
    employmentType: 'full-time',
    careerLevel: 'mid',
    requiredYearsMin: null,
    requiredYearsMax: null,
    source: {
      postingUrl: 'https://example.com/jobs/123?utm_source=test',
      sourceType: 'fixture',
      checkedDate: '2026-08-01',
      status: 'open',
      titleVerified: true,
      companyVerified: true,
      bodyVerified: true,
      applicationAvailable: true,
      verificationNotes: ['fixture'],
    },
    match: {
      level: 'exact',
      score: 95,
      titleMatch: true,
      responsibilityMatchCount: 3,
      foundationMatchCount: 1,
      reasons: ['직무명과 업무가 직접 일치한다.'],
      matchedResponsibilities: ['통제 평가', '위험 분석', '감사 증적'],
      unmatchedCoreResponsibilities: [],
    },
    extracted: completeExtractedFields({
      responsibilities: ['통제 평가'],
      requirements: ['위험 관리 경험'],
      preferredQualifications: ['CISA 우대'],
    }),
    evidence: { sourceHeadings: ['Responsibilities'], extractionNotes: [], limitations: [] },
  }
  return prepareEnrichedPosting({
    ...posting,
    ...overrides,
    source: { ...posting.source, ...(overrides.source || {}) },
    match: { ...posting.match, ...(overrides.match || {}) },
    extracted: overrides.extracted || posting.extracted,
  })
}

test('all Week 0 research domains and every catalog or detailed research role have enrichment coverage', () => {
  assert.equal(jobPostingEnrichmentSummary.domainCount, researchDomains.length)
  assert.equal(rolePostingCoverage.length, roleResearchTargets.length)
  assert.deepEqual(new Set(rolePostingCoverage.map((coverage) => coverage.roleId)), roleIds)
  for (const role of researchRoles) {
    assert.ok(
      roleIds.has(role.id) || roleResearchTargets.some((target) => target.detailedRoleId === role.id),
      `${role.id} has enrichment coverage`,
    )
  }
  for (const domain of researchDomains) {
    assert.ok(roleResearchTargets.some((target) => target.domainId === domain.id), `${domain.id} has research roles`)
    assert.ok(rolePostingCoverage.some((coverage) => coverage.domainId === domain.id), `${domain.id} has coverage`)
  }
})

test('every role has five exact/strong postings or an explicit shortage record', () => {
  for (const coverage of rolePostingCoverage) {
    const postings = enrichedPostingsForRole(coverage.roleId)
    assert.equal(postings.length, coverage.verifiedCount)
    assert.ok(postings.every((posting) => ['exact', 'strong'].includes(posting.match.level)))
    if (postings.length < 5) {
      assert.equal(coverage.shortage, true, coverage.roleId)
      assert.ok(coverage.shortageReasons.length, `${coverage.roleId} explains its shortage`)
      assert.ok(Array.isArray(coverage.searchedQueries), `${coverage.roleId} records queries`)
    } else {
      assert.equal(coverage.shortage, false, coverage.roleId)
    }
  }
})

test('role lookup rejects unknown IDs and each posting keeps the target domain and family', () => {
  assert.deepEqual(enrichedPostingsForRole('missing-role'), [])
  assert.equal(enrichmentCoverageForRole('missing-role'), null)
  for (const posting of enrichedJobPostings) {
    const target = roleResearchTargetById[posting.roleId]
    assert.ok(target, posting.roleId)
    assert.equal(posting.domainId, target.domainId)
    assert.equal(posting.familyId, target.familyId)
  }
})

test('canonical URLs remove tracking values and are unique inside one role', () => {
  assert.equal(
    canonicalizePostingUrl('https://example.com/jobs/42/?utm_source=x&ref=y&job=7#apply'),
    'https://example.com/jobs/42?job=7',
  )
  for (const target of roleResearchTargets) {
    const urls = enrichedPostingsForRole(target.roleId).map((posting) => posting.source.canonicalUrl)
    assert.equal(new Set(urls).size, urls.length, target.roleId)
  }
})

test('one real posting may map to multiple roles with independent match evidence', () => {
  const groups = new Map()
  for (const posting of enrichedJobPostings) {
    const current = groups.get(posting.source.canonicalUrl) || []
    current.push(posting)
    groups.set(posting.source.canonicalUrl, current)
  }
  const shared = [...groups.values()].find((postings) => new Set(postings.map((posting) => posting.roleId)).size > 1)
  assert.ok(shared, 'at least one strongly matching posting is independently mapped to multiple roles')
  assert.equal(new Set(shared.map((posting) => posting.id)).size, shared.length)
  assert.ok(shared.every((posting) => posting.match.matchedResponsibilities.length >= 3))
  assert.equal(new Set(shared.map((posting) => posting.match)).size, shared.length)
})

test('responsibilities, requirements, and preferred qualifications remain separate arrays', () => {
  const posting = enrichedJobPostings.find((candidate) => (
    candidate.extracted.responsibilities.length
    && candidate.extracted.requirements.length
    && candidate.extracted.preferredQualifications.length
  ))
  assert.ok(posting)
  assert.notEqual(posting.extracted.responsibilities, posting.extracted.requirements)
  assert.notEqual(posting.extracted.requirements, posting.extracted.preferredQualifications)
})

test('technology normalization merges true synonyms but preserves generic and product concepts', () => {
  assert.equal(normalizeTechnologyLabel('amazon web services'), 'AWS')
  assert.equal(normalizeTechnologyLabel('aws cloud'), 'AWS')
  assert.equal(normalizeTechnologyLabel('k8s'), 'Kubernetes')
  assert.equal(normalizeTechnologyLabel('Cloud'), 'Cloud')
  assert.equal(normalizeTechnologyLabel('SIEM'), 'SIEM')
  assert.equal(normalizeTechnologyLabel('Splunk'), 'Splunk')
  assert.notEqual(normalizeTechnologyLabel('Cloud'), normalizeTechnologyLabel('AWS'))
  assert.notEqual(normalizeTechnologyLabel('SIEM'), normalizeTechnologyLabel('Splunk'))
})

test('only verified visible statuses expose a posting link', () => {
  for (const status of ['open', 'accessible', 'closed']) {
    assert.equal(isEnrichedPostingLinkVisible(fixture({ source: { status } })), true)
  }
  for (const status of ['inaccessible', 'listingOnly', 'loginRequired', 'redirected']) {
    assert.equal(isEnrichedPostingLinkVisible(fixture({ source: { status } })), false)
  }
  assert.equal(isEnrichedPostingLinkVisible(fixture({ source: { bodyVerified: false } })), false)
  assert.ok(enrichedJobPostings.every((posting) => isEnrichedPostingLinkVisible(posting)))
})

test('role aggregations reference real postings and calculate frequency exactly', () => {
  const roleId = enrichedJobPostings[0].roleId
  const postings = enrichedPostingsForRole(roleId)
  for (const aggregate of [
    aggregateResponsibilitiesForRole(roleId),
    aggregateRequirementsForRole(roleId),
    aggregatePreferredQualificationsForRole(roleId),
    aggregatePartnerTeamsForRole(roleId),
    ...Object.values(aggregateTechnologiesForRole(roleId)),
  ]) {
    for (const item of aggregate) {
      assert.equal(item.count, item.postingIds.length)
      assert.equal(new Set(item.postingIds).size, item.postingIds.length)
      assert.ok(item.postingIds.every((postingId) => postings.some((posting) => posting.id === postingId)))
      assert.ok(['common', 'repeated', 'single'].includes(item.evidenceLevel))
    }
  }
})

test('score bands and schema reject malformed role, domain, date, company, and title values', () => {
  assert.equal(isMatchScoreConsistent('exact', 90), true)
  assert.equal(isMatchScoreConsistent('exact', 89), false)
  assert.equal(isMatchScoreConsistent('strong', 75), true)
  assert.equal(isMatchScoreConsistent('strong', 90), false)

  assert.match(validateEnrichedPosting(fixture({ roleId: 'missing-role' }), roleIds, domainIds).join(' '), /roleId/)
  assert.match(validateEnrichedPosting(fixture({ domainId: 'missing-domain' }), roleIds, domainIds).join(' '), /domainId/)
  assert.match(validateEnrichedPosting(fixture({ companyName: ' ' }), roleIds, domainIds).join(' '), /회사명/)
  assert.match(validateEnrichedPosting(fixture({ originalJobTitle: '' }), roleIds, domainIds).join(' '), /공고 제목/)
  assert.match(validateEnrichedPosting(fixture({ source: { checkedDate: '2026-02-30' } }), roleIds, domainIds).join(' '), /checkedDate/)
  assert.match(validateEnrichedPosting(fixture({ match: { level: 'strong', score: 95 } }), roleIds, domainIds).join(' '), /match level/)
})

test('every shipped posting passes schema validation and contains no empty extracted strings', () => {
  for (const posting of enrichedJobPostings) {
    assert.deepEqual(validateEnrichedPosting(posting, roleIds, domainIds), [], posting.id)
    for (const values of Object.values(posting.extracted)) {
      assert.ok(values.every((value) => typeof value === 'string' && value.trim()), posting.id)
    }
  }
})
