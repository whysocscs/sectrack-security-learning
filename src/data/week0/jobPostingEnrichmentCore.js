const visibleStatuses = new Set(['open', 'accessible', 'closed'])
const validStatuses = new Set([...visibleStatuses, 'inaccessible', 'listingOnly', 'loginRequired', 'redirected'])
const validMatchLevels = new Set(['exact', 'strong', 'adjacent', 'reject'])

export const visibleJobPostingStatuses = Object.freeze([...visibleStatuses])
export const validJobPostingStatuses = Object.freeze([...validStatuses])
export const validJobPostingMatchLevels = Object.freeze([...validMatchLevels])

const trackingParameterNames = new Set([
  'ref', 'source', 'tracking', 'session', 'sessionid', 'gh_src', 'lever-source',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'fbclid', 'gclid', 'feedid', 'tcsource', 'in_iframe',
])

export const technologySynonyms = Object.freeze({
  'amazon web services': 'AWS',
  'aws cloud': 'AWS',
  aws: 'AWS',
  'google cloud platform': 'GCP',
  'google cloud': 'GCP',
  gcp: 'GCP',
  'microsoft azure': 'Azure',
  azure: 'Azure',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  'amazon eks': 'Amazon EKS',
})

export const extractionArrayKeys = Object.freeze([
  'responsibilities', 'requirements', 'preferredQualifications', 'tools',
  'programmingLanguages', 'queryLanguages', 'scriptingLanguages', 'cloudPlatforms',
  'containerPlatforms', 'operatingSystems', 'databases', 'securityProducts',
  'protocols', 'frameworks', 'lawsAndStandards', 'certifications', 'securityDomains',
  'deliverables', 'partnerTeams', 'industryKnowledge',
])

export function canonicalizePostingUrl(value) {
  const url = new URL(value)
  url.hash = ''
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLocaleLowerCase('en-US').startsWith('utm_') || trackingParameterNames.has(key.toLocaleLowerCase('en-US'))) {
      url.searchParams.delete(key)
    }
  }
  url.searchParams.sort()
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '')
  return url.toString()
}

export function normalizeTechnologyLabel(value) {
  const label = String(value || '').trim()
  return technologySynonyms[label.toLocaleLowerCase('en-US')] || label
}

function freezeArray(value) {
  return Object.freeze([...(value || [])])
}

export function completeExtractedFields(extracted = {}) {
  return Object.freeze(Object.fromEntries(extractionArrayKeys.map((key) => [key, freezeArray(extracted[key])])))
}

export function isMatchScoreConsistent(level, score) {
  if (!validMatchLevels.has(level) || !Number.isFinite(score)) return false
  if (level === 'exact') return score >= 90 && score <= 100
  if (level === 'strong') return score >= 75 && score <= 89
  if (level === 'adjacent') return score >= 60 && score <= 74
  return score >= 0 && score <= 59
}

export function isValidCheckedDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

export function validateEnrichedPosting(posting, validRoleIds = null, validDomainIds = null) {
  const errors = []
  if (!posting || typeof posting !== 'object') return ['공고 객체가 필요합니다.']
  if (validRoleIds && !validRoleIds.has(posting.roleId)) errors.push(`존재하지 않는 roleId: ${posting.roleId}`)
  if (validDomainIds && !validDomainIds.has(posting.domainId)) errors.push(`존재하지 않는 domainId: ${posting.domainId}`)
  if (!String(posting.companyName || '').trim()) errors.push('회사명이 비어 있습니다.')
  if (!String(posting.originalJobTitle || '').trim()) errors.push('공고 제목이 비어 있습니다.')
  if (!posting.source?.postingUrl?.startsWith('https://')) errors.push('공고 URL은 HTTPS여야 합니다.')
  if (!validStatuses.has(posting.source?.status)) errors.push(`유효하지 않은 source status: ${posting.source?.status}`)
  if (!isValidCheckedDate(posting.source?.checkedDate)) errors.push('checkedDate가 유효하지 않습니다.')
  if (!isMatchScoreConsistent(posting.match?.level, posting.match?.score)) errors.push('match level과 score가 일치하지 않습니다.')
  for (const key of extractionArrayKeys) {
    if (!Array.isArray(posting.extracted?.[key])) errors.push(`extracted.${key}는 배열이어야 합니다.`)
    else if (posting.extracted[key].some((item) => !String(item || '').trim())) errors.push(`extracted.${key}에 빈 문자열이 있습니다.`)
  }
  return errors
}

export function prepareEnrichedPosting(posting) {
  const canonicalUrl = canonicalizePostingUrl(posting.source.canonicalUrl || posting.source.postingUrl)
  return Object.freeze({
    ...posting,
    source: Object.freeze({
      ...posting.source,
      titleVerified: posting.source.titleVerified ?? false,
      companyVerified: posting.source.companyVerified ?? false,
      bodyVerified: posting.source.bodyVerified ?? false,
      applicationAvailable: posting.source.applicationAvailable ?? false,
      canonicalUrl,
      verificationNotes: freezeArray(posting.source.verificationNotes),
    }),
    match: Object.freeze({
      ...posting.match,
      titleMatch: posting.match.titleMatch ?? false,
      responsibilityMatchCount: posting.match.responsibilityMatchCount ?? 0,
      foundationMatchCount: posting.match.foundationMatchCount ?? 0,
      reasons: freezeArray(posting.match.reasons),
      matchedResponsibilities: freezeArray(posting.match.matchedResponsibilities),
      unmatchedCoreResponsibilities: freezeArray(posting.match.unmatchedCoreResponsibilities),
    }),
    extracted: completeExtractedFields(posting.extracted),
    evidence: Object.freeze({
      sourceHeadings: freezeArray(posting.evidence?.sourceHeadings),
      extractionNotes: freezeArray(posting.evidence?.extractionNotes),
      limitations: freezeArray(posting.evidence?.limitations),
    }),
  })
}

export function isEnrichedPostingLinkVisible(posting) {
  return posting?.source?.bodyVerified === true && visibleStatuses.has(posting.source.status)
}

export function acceptedPosting(posting) {
  return posting?.source?.bodyVerified === true && ['exact', 'strong'].includes(posting.match?.level)
}

export function aggregatePostingField(postings, selector) {
  const accepted = postings.filter(acceptedPosting)
  const items = new Map()
  for (const posting of accepted) {
    const uniqueForPosting = new Map()
    for (const rawValue of selector(posting) || []) {
      const label = normalizeTechnologyLabel(rawValue)
      const key = label.toLocaleLowerCase('en-US')
      if (label) uniqueForPosting.set(key, label)
    }
    for (const [key, label] of uniqueForPosting) {
      const current = items.get(key) || { key, label, normalizedLabel: label, postingIds: [], companyNames: [] }
      current.postingIds.push(posting.id)
      current.companyNames.push(posting.companyName)
      items.set(key, current)
    }
  }
  return Object.freeze([...items.values()].map((item) => {
    const count = item.postingIds.length
    const evidenceLevel = count === 1 ? 'single' : count >= Math.ceil(accepted.length / 2) ? 'common' : 'repeated'
    return Object.freeze({
      ...item,
      count,
      postingIds: Object.freeze(item.postingIds),
      companyNames: Object.freeze([...new Set(item.companyNames)]),
      evidenceLevel,
    })
  }).sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, 'ko')))
}

export function statusCountsForPostings(postings) {
  const counts = Object.fromEntries([...validStatuses].map((status) => [status, 0]))
  for (const posting of postings) counts[posting.source.status] += 1
  return Object.freeze(counts)
}
