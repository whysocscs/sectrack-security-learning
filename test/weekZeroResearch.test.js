import assert from 'node:assert/strict'
import test from 'node:test'
import { glossaryCaseStudies, glossaryCategories, securityGlossary } from '../src/data/week0/glossary.js'
import {
  auditedRepresentativeRoles,
  calculateContentCompletenessScore,
  jobMarketResearchSummary,
  jobPostingSeeds,
  postingsForAuditedRole,
  postingAuditGroup,
} from '../src/data/week0/jobMarketResearch.js'
import { jobFamilies, roleDetails, rolesForFamily, securityDomains } from '../src/data/week0/jobTaxonomy.js'
import { allowedSharedRepresentativeRoleTitles, representativeRoleCatalog, representativeRoleGroups, representativeRolesForDomain, researchDomainById, researchDomains, researchRoleById, researchRoles } from '../src/data/week0/careerResearch.js'
import { mergeProgress } from '../src/platformLogic.js'

test('Week 0 glossary keeps the requested five groups and combines related terms', () => {
  assert.equal(glossaryCategories.length, 5)
  assert.equal(securityGlossary.length, 17)
  assert.equal(new Set(securityGlossary.map((term) => term.id)).size, 17)
  for (const removedId of ['threat', 'cce', 'cvss', 'one-day', 'patch', 'privilege-escalation', 'lateral-movement', 'authentication', 'authorization', 'least-privilege', 'firewall', 'ids-ips', 'edr']) {
    assert.equal(securityGlossary.some((term) => term.id === removedId), false, `${removedId} is not a separate glossary page`)
  }
  for (const term of securityGlossary) {
    assert.ok(term.definitionEnglish)
    assert.ok(term.definitionKorean)
    assert.ok(term.explanation)
    assert.ok(term.detailParagraphs.length >= 2, `${term.id} has a sustained explanation`)
    assert.ok([term.definitionKorean, term.explanation, ...term.detailParagraphs].join(' ').length >= 350, `${term.id} is explained beyond a short summary`)
    assert.ok(term.sources[0]?.url)
  }
  for (const study of Object.values(glossaryCaseStudies)) {
    assert.equal(study.label, '예시)')
    assert.ok(study.excerpt)
    assert.ok(study.summary.length >= 150)
  }
  const cia = securityGlossary.find((term) => term.id === 'cia')
  const zeroDay = securityGlossary.find((term) => term.id === 'zero-day')
  const cve = securityGlossary.find((term) => term.id === 'cve')
  const cwe = securityGlossary.find((term) => term.id === 'cwe')
  const fuzzing = securityGlossary.find((term) => term.id === 'fuzzing')
  assert.equal(cia.caseTable.rows.length, 7)
  assert.deepEqual(zeroDay.groupedSections.map((section) => section.title), ['Zero-day', 'Patch', 'One-day · N-day'])
  assert.equal(cve.comparisonTable.rows.length, 9)
  assert.equal(cve.sourceNotes.length, 3)
  assert.equal(cwe.comparisonTable.rows.length, 5)
  assert.equal(fuzzing.image.src, '/media/fuzzing-overview.png')
  assert.ok(securityGlossary.find((term) => term.id === 'malware').assignment)
  assert.ok(securityGlossary.find((term) => term.id === 'c2').assignment)
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

test('audited 320-mapping dataset preserves URL verification and non-fabrication boundaries', () => {
  assert.equal(jobMarketResearchSummary.sampleSize, 320)
  assert.equal(jobMarketResearchSummary.uniqueUrlCount, 290)
  assert.equal(jobMarketResearchSummary.fieldCount, 16)
  assert.equal(jobMarketResearchSummary.representativeRoleCount, 80)
  assert.equal(jobMarketResearchSummary.domesticCount, 160)
  assert.equal(jobMarketResearchSummary.internationalCount, 160)
  assert.equal(jobMarketResearchSummary.directOpenMappingCount, 189)
  assert.equal(jobMarketResearchSummary.directOpenUniqueCount, 171)
  assert.equal(jobPostingSeeds.length, 320)
  assert.equal(new Set(jobPostingSeeds.map((posting) => posting.id)).size, 320)
  assert.equal(new Set(jobPostingSeeds.map((posting) => posting.source.auditUrl)).size, 290)
  assert.equal(new Set(jobPostingSeeds.map((posting) => `${posting.normalized.securityDomainTitle}::${posting.normalized.representativeRole}`)).size, 80)
  assert.equal(jobPostingSeeds.filter((posting) => posting.evidence.bodyVerified).length, 189)
  for (const posting of jobPostingSeeds) {
    assert.equal(posting.evidence.contentCompleteness, 'urlAudit')
    assert.equal(posting.source.checkedDate, '2026-07-27')
    assert.equal(posting.normalized.roleMappings.length, 1)
    assert.equal(posting.raw.responsibilities.length, 0, 'the workbook does not provide job-body responsibilities')
    assert.equal(posting.raw.requirements.length, 0, 'the workbook does not provide requirements')
    assert.equal(posting.evidence.contentCompletenessScore, calculateContentCompletenessScore(posting))
    if (['hidden', 'manual'].includes(postingAuditGroup(posting))) assert.equal(posting.source.postingUrl, null)
    if (postingAuditGroup(posting) === 'candidate') assert.ok(posting.source.postingUrl)
  }
})

test('personal security map resolves four audited postings for every representative role', () => {
  assert.equal(auditedRepresentativeRoles.length, 80)
  for (const role of auditedRepresentativeRoles) {
    const postings = postingsForAuditedRole(role.id)
    assert.equal(postings.length, 4, `${role.domainTitle} / ${role.title}`)
    assert.equal(postings.filter((posting) => posting.source.market === 'domestic').length, 2)
    assert.equal(postings.filter((posting) => posting.source.market === 'international').length, 2)
    assert.ok(postings.every((posting) => posting.normalized.roleMappings[0].auditRoleId === role.id))
  }
})

test('Week 0 personal-map state merges with existing browser data without deleting legacy map state', () => {
  const progress = mergeProgress({
    mindmap: { notes: { legacy: 'keep this' }, roleInterests: ['role-example'] },
    weekZero: { selectedDomainIds: ['cloud'], selectedRoleIds: ['role-iam-engineer'], selectedPostingIds: ['audit-posting-001'] },
    legacyWeekZeroData: { 'w0-roe': 'preserved' },
  })
  assert.deepEqual(progress.weekZero.selectedDomainIds, ['cloud'])
  assert.deepEqual(progress.weekZero.selectedRoleIds, ['role-iam-engineer'])
  assert.deepEqual(progress.weekZero.selectedPostingIds, ['audit-posting-001'])
  assert.equal(progress.mindmap.notes.legacy, 'keep this')
  assert.deepEqual(progress.legacyWeekZeroData, { 'w0-roe': 'preserved' })
})
