import {
  representativeRoleCatalog,
  representativeRoleGroups,
  researchDomainById,
  researchDomains,
  researchFamiliesForDomain,
  researchFamilyById,
  researchJobFamilies,
  researchRoleById,
  researchRoles,
} from './careerResearch.js'
import { auditedRepresentativeRoles } from './jobMarketResearch.js'

const domainSearchVocabulary = Object.freeze({
  governance: ['governance risk compliance', 'privacy compliance', 'security controls'],
  consulting: ['cybersecurity consulting', 'security advisory', 'security audit'],
  appsec: ['application product security', 'secure software', 'product security review'],
  devsecops: ['DevSecOps pipeline security', 'software supply chain', 'platform security'],
  offensive: ['penetration testing', 'offensive security', 'vulnerability assessment'],
  detection: ['security operations detection', 'threat hunting', 'SIEM SOC'],
  dfir: ['incident response DFIR', 'digital forensics', 'forensic investigation'],
  reverse: ['malware reverse engineering', 'threat research', 'binary analysis'],
  infrastructure: ['infrastructure endpoint security', 'network security', 'identity hardening'],
  cloud: ['cloud security IAM', 'cloud security engineering', 'identity security'],
  crypto: ['cryptography PKI', 'key management security', 'security protocols'],
  ot: ['OT ICS cybersecurity', 'industrial control systems security', 'SCADA security'],
  'iot-embedded': ['IoT embedded security', 'firmware security', 'hardware security'],
  automotive: ['automotive cybersecurity', 'vehicle security', 'ISO 21434'],
  ai: ['AI ML security', 'LLM security', 'AI red team'],
  'security-rnd': ['security research', 'vulnerability research', 'fuzzing exploit research'],
})

const infrastructureFamilyByGroup = Object.freeze({
  'infrastructure-network': 'family-network-infra',
  'infrastructure-endpoint': 'family-endpoint',
  'infrastructure-trust': 'family-network-infra',
})

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function groupForRole(roleId) {
  return representativeRoleGroups.find((group) => group.roleIds.includes(roleId)) || null
}

function familyForRole(catalogRole, detailedRole, group) {
  if (catalogRole.domainId === 'infrastructure') {
    const familyId = detailedRole?.familyId || infrastructureFamilyByGroup[group?.id]
    if (researchFamilyById[familyId]?.domainId === catalogRole.domainId) return researchFamilyById[familyId]
  }

  if (detailedRole && researchFamilyById[detailedRole.familyId]?.domainId === catalogRole.domainId) {
    return researchFamilyById[detailedRole.familyId]
  }

  return researchFamiliesForDomain(catalogRole.domainId)[0] || null
}

function compactPhrase(value, maxWords = 8) {
  return String(value || '')
    .replace(/[·/]/g, ' ')
    .replace(/[(),]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, maxWords)
    .join(' ')
}

function roleSearchQueries(target) {
  const title = compactPhrase(target.roleTitle, 10)
  const rawTitle = compactPhrase(target.rawTitles[0] || target.roleTitle, 10)
  const responsibility = compactPhrase(target.actualWork[0] || target.summary, 9)
  const deliverable = compactPhrase(target.deliverables[0] || target.learningAxes[0], 7)
  const [domainPhrase, alternateDomainPhrase] = domainSearchVocabulary[target.domainId]

  return unique([
    `"${rawTitle}" careers`,
    `"${rawTitle}" jobs`,
    `"${title}" 채용공고`,
    `site:boards.greenhouse.io "${rawTitle}"`,
    `site:jobs.lever.co "${rawTitle}"`,
    `site:jobs.ashbyhq.com "${rawTitle}"`,
    `site:jobs.smartrecruiters.com "${title}"`,
    `site:myworkdayjobs.com "${title}"`,
    `"${responsibility}" "${domainPhrase}" jobs`,
    `"${deliverable}" "${alternateDomainPhrase}" security`,
  ])
}

const catalogRoleIds = new Set(representativeRoleCatalog.map((role) => role.id))
const unlinkedResearchRoles = researchRoles
  .filter((role) => !representativeRoleCatalog.some((catalogRole) => catalogRole.detailRoleId === role.id))
  .map((role) => ({
    id: role.id,
    domainId: role.domainId,
    relatedDomainIds: role.linkedDomainIds,
    detailRoleId: role.id,
    title: role.title,
    summary: role.summary,
  }))

const allRoleEntries = Object.freeze([
  ...representativeRoleCatalog,
  ...unlinkedResearchRoles.filter((role) => !catalogRoleIds.has(role.id)),
])

const auditedRoleIdsByCatalogRole = new Map()
for (const auditedRole of auditedRepresentativeRoles) {
  const current = auditedRoleIdsByCatalogRole.get(auditedRole.catalogRoleId) || []
  current.push(auditedRole.id)
  auditedRoleIdsByCatalogRole.set(auditedRole.catalogRoleId, current)
}

export const roleResearchTargets = Object.freeze(allRoleEntries.map((catalogRole) => {
  const detailedRole = catalogRole.detailRoleId ? researchRoleById[catalogRole.detailRoleId] : null
  const group = groupForRole(catalogRole.id)
  const family = familyForRole(catalogRole, detailedRole, group)
  const domain = researchDomainById[catalogRole.domainId]
  const target = {
    roleId: catalogRole.id,
    detailedRoleId: detailedRole?.id || null,
    roleTitle: catalogRole.title,
    domainId: catalogRole.domainId,
    domainTitle: domain.title,
    familyId: family?.id || null,
    familyTitle: family?.title || '분야 대표 역할',
    groupId: group?.id || null,
    groupTitle: group?.title || '분야 대표 역할',
    rawTitles: unique([catalogRole.title, ...(detailedRole?.rawTitles || [])]),
    summary: catalogRole.summary,
    actualWork: detailedRole?.actualWork?.length ? [...detailedRole.actualWork] : [catalogRole.summary],
    deliverables: [...(detailedRole?.deliverables || [])],
    foundations: detailedRole?.foundations?.length ? [...detailedRole.foundations] : [...domain.learningAxes],
    learningAxes: detailedRole?.learningAxes?.length ? [...detailedRole.learningAxes] : [...domain.learningAxes],
    linkedDomainIds: unique([...(catalogRole.relatedDomainIds || []), ...(detailedRole?.linkedDomainIds || [])]),
    auditedRoleIds: [...(auditedRoleIdsByCatalogRole.get(catalogRole.id) || [])],
  }

  return Object.freeze({ ...target, searchedQueries: Object.freeze(roleSearchQueries(target)) })
}))

export const roleResearchTargetById = Object.freeze(Object.fromEntries(roleResearchTargets.map((target) => [target.roleId, target])))

export const jobPostingResearchTargetSummary = Object.freeze({
  domainCount: researchDomains.length,
  familyCount: researchJobFamilies.length,
  roleCount: roleResearchTargets.length,
  targetPostingCountPerRole: 5,
  targetPostingMappingCount: roleResearchTargets.length * 5,
  auditedRoleCount: auditedRepresentativeRoles.length,
  auditedCatalogRoleCount: auditedRoleIdsByCatalogRole.size,
})

export function researchTargetForRole(roleId) {
  return roleResearchTargetById[roleId] || null
}

export function researchTargetsForDomain(domainId) {
  return roleResearchTargets.filter((target) => target.domainId === domainId)
}
