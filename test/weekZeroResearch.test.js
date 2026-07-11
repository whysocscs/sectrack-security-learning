import assert from 'node:assert/strict'
import test from 'node:test'
import { securityGlossary } from '../src/data/week0/glossary.js'
import {
  calculateContentCompletenessScore,
  detailedJobPostingSeeds,
  jobMarketResearchSummary,
  jobPostingSeeds,
  metadataOnlyJobPosting,
  partialJobPostingSeeds,
} from '../src/data/week0/jobMarketResearch.js'
import { jobFamilies, roleDetails, rolesForFamily, securityDomains } from '../src/data/week0/jobTaxonomy.js'
import { allowedSharedRepresentativeRoleTitles, representativeRoleCatalog, representativeRoleGroups, representativeRolesForDomain, researchDomainById, researchDomains, researchRoleById, researchRoles } from '../src/data/week0/careerResearch.js'
import { mergeProgress } from '../src/platformLogic.js'

test('Week 0 glossary contains the 30 research-backed concepts with misconceptions', () => {
  assert.equal(securityGlossary.length, 30)
  assert.equal(new Set(securityGlossary.map((term) => term.id)).size, 30)
  for (const term of securityGlossary) {
    assert.ok(term.simpleDefinition)
    assert.ok(term.preciseDefinition)
    assert.ok(term.misconception)
  }
})

test('Week 0 separates 12 domains, 14 job families, Cloud/IAM roles, and DFIR roles', () => {
  assert.equal(securityDomains.length, 12)
  assert.equal(jobFamilies.length, 14)
  assert.equal(rolesForFamily('family-cloud-iam').length, 12)
  assert.equal(rolesForFamily('family-dfir').length, 10)
  for (const role of roleDetails) {
    assert.ok(jobFamilies.some((family) => family.id === role.familyId), `${role.id} has a family`)
    assert.ok(securityDomains.some((domain) => domain.id === role.domainId), `${role.id} has a domain`)
    assert.ok(role.actualWork.length)
    assert.ok(role.deliverables.length)
  }
})

test('operator-supplied career map keeps every field, role group, and evidence boundary intact', () => {
  assert.equal(researchDomains.length, 16)
  assert.equal(representativeRoleCatalog.length, 113)
  assert.equal(researchRoles.length, 33)
  for (const domain of researchDomains) {
    const expectedRoleCount = domain.id === 'governance' ? 8 : 7
    assert.equal(representativeRolesForDomain(domain.id).length, expectedRoleCount, `${domain.id} keeps the supplied representative roles`)
  }
  for (const role of researchRoles) {
    assert.ok(role.linkedDomainIds.every((domainId) => researchDomainById[domainId]), `${role.id} only links to known fields`)
  }
  for (const role of representativeRoleCatalog) {
    if (role.detailRoleId) assert.ok(researchRoleById[role.detailRoleId], `${role.id} points to a known research card`)
    assert.ok(role.relatedDomainIds.every((domainId) => researchDomainById[domainId]), `${role.id} only links to known fields`)
  }
  const catalogIds = new Set(representativeRoleCatalog.map((role) => role.id))
  const catalogTitles = representativeRoleCatalog.map((role) => role.title)
  const duplicateTitles = [...new Set(catalogTitles.filter((title, index) => catalogTitles.indexOf(title) !== index))]
  assert.deepEqual(duplicateTitles, [...allowedSharedRepresentativeRoleTitles], 'only operator-supplied shared roles appear in multiple fields')
  assert.equal(representativeRoleCatalog.filter((role) => /\bTier\s*[123]\b/i.test(role.title)).length, 0, 'SOC tiers are not separate occupations')
  for (const domain of researchDomains) {
    const groupedRoleIds = representativeRoleGroups.filter((group) => group.domainId === domain.id).flatMap((group) => group.roleIds)
    const expectedRoleCount = representativeRolesForDomain(domain.id).length
    assert.equal(groupedRoleIds.length, expectedRoleCount, `${domain.id} groups every supplied role`)
    assert.equal(new Set(groupedRoleIds).size, expectedRoleCount, `${domain.id} has no role duplicated across groups`)
    assert.ok(groupedRoleIds.every((roleId) => catalogIds.has(roleId)), `${domain.id} only references known roles`)
  }
  const siem = representativeRoleCatalog.find((role) => role.id === 'catalog-siem-engineer')
  const soar = representativeRoleCatalog.find((role) => role.id === 'catalog-soar-engineer')
  assert.ok(siem?.relatedDomainIds.includes('security-rnd'))
  assert.ok(soar?.relatedDomainIds.includes('security-rnd'))
  assert.ok(siem?.workContext.includes('보안 제품·플랫폼 개발'))
  assert.ok(soar?.workContext.includes('보안 제품·플랫폼 개발'))
  assert.ok(researchRoles.some((role) => role.evidence.level === 'jobPosting'))
  assert.ok(researchRoles.some((role) => role.evidence.level === 'officialFramework'))
  assert.ok(representativeRoleCatalog.some((role) => role.detailRoleId === null))
})

test('21-job sample preserves detailed, partial, and metadata-only evidence boundaries', () => {
  assert.equal(jobMarketResearchSummary.sampleSize, 21)
  assert.equal(jobMarketResearchSummary.domesticCount, 10)
  assert.equal(jobMarketResearchSummary.internationalCount, 11)
  assert.equal(detailedJobPostingSeeds.length, 13)
  assert.equal(partialJobPostingSeeds.length, 8)
  assert.equal(jobPostingSeeds.length, 21)
  for (const posting of detailedJobPostingSeeds) {
    assert.equal(posting.evidence.bodyVerified, true)
    assert.equal(posting.evidence.contentCompleteness, 'detailed')
    assert.equal(posting.source.isCurrent, null)
    assert.equal(posting.source.postingUrl, null)
    assert.equal(posting.evidence.contentCompletenessScore, calculateContentCompletenessScore(posting))
  }
  for (const posting of partialJobPostingSeeds) {
    assert.equal(posting.evidence.bodyVerified, true)
    assert.equal(posting.evidence.contentCompleteness, 'partial')
    assert.equal(posting.raw.requirements.length, 0)
  }
  assert.equal(metadataOnlyJobPosting.evidence.bodyVerified, false)
  assert.equal(metadataOnlyJobPosting.raw.responsibilities.length, 0)
  assert.ok(metadataOnlyJobPosting.source.postingUrl)
})

test('Week 0 personal-map state merges with existing browser data without deleting legacy map state', () => {
  const progress = mergeProgress({
    mindmap: { notes: { legacy: 'keep this' }, roleInterests: ['role-example'] },
    weekZero: { selectedDomainIds: ['cloud'], selectedRoleIds: ['role-iam-engineer'] },
    legacyWeekZeroData: { 'w0-roe': 'preserved' },
  })
  assert.deepEqual(progress.weekZero.selectedDomainIds, ['cloud'])
  assert.deepEqual(progress.weekZero.selectedRoleIds, ['role-iam-engineer'])
  assert.equal(progress.mindmap.notes.legacy, 'keep this')
  assert.deepEqual(progress.legacyWeekZeroData, { 'w0-roe': 'preserved' })
})
