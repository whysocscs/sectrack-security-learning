import { writeFile } from 'node:fs/promises'
import { jobPostingAuditRows } from '../src/data/week0/jobPostingsAudit20260727.js'
import { jobPostingSeeds } from '../src/data/week0/jobMarketResearch.js'
import { canonicalizePostingUrl } from '../src/data/week0/jobPostingEnrichmentCore.js'

const checkedDate = '2026-08-01'
const currentDate = new Date(`${checkedDate}T00:00:00+09:00`)

function argumentValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : null
}

const outputPath = argumentValue('--output')
const moduleOutputPath = argumentValue('--module-output')

const acceptedAuditMatches = new Set(['직무명·업무 일치', '업무 일치'])
const candidates = jobPostingAuditRows
  .map((row, index) => ({ row, seed: jobPostingSeeds[index] }))
  .filter(({ row }) => ['직접 공고 페이지 열림', '명시적 마감·기한 경과'].includes(row.finalLinkStatus))
  .filter(({ row }) => acceptedAuditMatches.has(row.matchLevel))

function decodeHtml(value = '') {
  return value
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
}

function cleanText(value = '') {
  return decodeHtml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n')
    .replace(/<\/li\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function metaContent(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return decodeHtml(match[1]).trim()
  }
  return ''
}

function flattenJsonLd(value) {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd)
  if (!value || typeof value !== 'object') return []
  return [value, ...flattenJsonLd(value['@graph'])]
}

function jobPostingJsonLd(html) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const script of scripts) {
    try {
      const items = flattenJsonLd(JSON.parse(decodeHtml(script[1]).trim()))
      const posting = items.find((item) => {
        const type = item['@type']
        return type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))
      })
      if (posting) return posting
    } catch {
      // Some sites embed invalid JSON-LD. The HTML fallback remains conservative.
    }
  }
  return null
}

function titleTokens(value) {
  return String(value || '').toLocaleLowerCase('en-US').split(/[^\p{L}\p{N}+#.]+/u).filter((token) => token.length >= 3)
}

function textConfirms(value, text) {
  const tokens = titleTokens(value)
  if (!tokens.length) return false
  const haystack = text.toLocaleLowerCase('en-US')
  const matches = tokens.filter((token) => haystack.includes(token)).length
  return matches >= Math.min(2, tokens.length)
}

function structuredCompany(posting) {
  if (typeof posting?.hiringOrganization === 'string') return posting.hiringOrganization
  return posting?.hiringOrganization?.name || ''
}

function structuredLocation(posting) {
  const locations = Array.isArray(posting?.jobLocation) ? posting.jobLocation : posting?.jobLocation ? [posting.jobLocation] : []
  const labels = locations.map((location) => {
    const address = location?.address || location
    return [address?.addressLocality, address?.addressRegion, address?.addressCountry?.name || address?.addressCountry].filter(Boolean).join(', ')
  }).filter(Boolean)
  return labels.join(' / ')
}

function sectionLines(descriptionHtml) {
  const marked = decodeHtml(descriptionHtml)
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, heading) => `\n@@ ${cleanText(heading)}\n`)
    .replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, heading) => `\n@@ ${cleanText(heading)}\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) => `\n- ${cleanText(item)}\n`)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
  return marked.split('\n').map((line) => line.replace(/^[-•]\s*/, '').replace(/\s+/g, ' ').trim()).filter(Boolean)
}

function extractedSections(descriptionHtml) {
  const sections = { responsibilities: [], requirements: [], preferredQualifications: [], sourceHeadings: [] }
  let active = null
  for (const line of sectionLines(descriptionHtml)) {
    if (line.startsWith('@@ ')) {
      const heading = line.slice(3).trim()
      sections.sourceHeadings.push(heading)
      if (/responsibil|what you.ll do|what you will do|the role|key duties|담당업무|주요 업무|your impact/i.test(heading)) active = 'responsibilities'
      else if (/preferred|nice to have|bonus|우대사항|desirable/i.test(heading)) active = 'preferredQualifications'
      else if (/requirements|minimum qualifications|basic qualifications|must have|what you bring|자격요건|what we.re looking for|who you are/i.test(heading)) active = 'requirements'
      else active = null
      continue
    }
    if (active && line.length >= 12 && line.length <= 500) sections[active].push(line)
  }
  for (const key of ['responsibilities', 'requirements', 'preferredQualifications']) sections[key] = [...new Set(sections[key])].slice(0, 30)
  return sections
}

const extractionDictionary = Object.freeze({
  tools: ['Burp Suite', 'Nmap', 'Metasploit', 'Wireshark', 'Terraform', 'Ansible', 'GitHub Actions', 'Jenkins', 'GitLab', 'Semgrep', 'Checkmarx', 'Veracode', 'SonarQube', 'Nessus', 'Qualys'],
  programmingLanguages: ['Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Kotlin', 'Swift'],
  queryLanguages: ['KQL', 'SPL', 'SQL'],
  scriptingLanguages: ['Python', 'PowerShell', 'Bash', 'Shell'],
  cloudPlatforms: ['AWS', 'Amazon Web Services', 'Azure', 'Google Cloud Platform', 'GCP'],
  containerPlatforms: ['Kubernetes', 'Docker', 'Amazon EKS', 'OpenShift'],
  operatingSystems: ['Linux', 'Windows', 'macOS', 'Android', 'iOS'],
  databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch'],
  securityProducts: ['Splunk', 'Microsoft Sentinel', 'CrowdStrike', 'SentinelOne', 'Palo Alto', 'Okta', 'CyberArk', 'Wiz', 'Prisma Cloud'],
  protocols: ['HTTP', 'HTTPS', 'DNS', 'TCP/IP', 'TLS', 'OAuth', 'SAML', 'LDAP', 'Kerberos', 'CAN'],
  frameworks: ['MITRE ATT&CK', 'OWASP', 'NIST CSF', 'CIS Controls', 'NIST 800-53'],
  lawsAndStandards: ['ISO 27001', 'SOC 2', 'PCI DSS', 'GDPR', 'HIPAA', 'FedRAMP', 'ISMS-P', 'ISO/SAE 21434', 'IEC 62443'],
  certifications: ['CISSP', 'CISA', 'CISM', 'Security+', 'OSCP', 'GIAC', 'GCIH', 'GCFA'],
})

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractNamedTerms(text, terms) {
  return terms.filter((term) => new RegExp(`(^|[^\\p{L}\\p{N}])${escaped(term)}([^\\p{L}\\p{N}]|$)`, 'iu').test(text))
}

function careerLevel(title, body) {
  const text = `${title} ${body.slice(0, 3000)}`.toLocaleLowerCase('en-US')
  if (/\bdirector\b/.test(text)) return 'director'
  if (/\bprincipal\b/.test(text)) return 'principal'
  if (/\bstaff\b/.test(text)) return 'staff'
  if (/\bmanager\b/.test(text)) return 'manager'
  if (/\blead\b/.test(text)) return 'lead'
  if (/\bsenior\b|\bsr\.?\b|시니어/.test(text)) return 'senior'
  if (/\bjunior\b|\bjr\.?\b|주니어/.test(text)) return 'junior'
  if (/\bentry\b|신입/.test(text)) return 'entry'
  return 'unknown'
}

function requiredYears(body) {
  const values = [...body.matchAll(/(?:minimum of\s+|at least\s+)?(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\+?\s*(?:years?|년)/gi)]
  if (!values.length) return { min: null, max: null }
  return { min: Number(values[0][1]), max: values[0][2] ? Number(values[0][2]) : null }
}

function statusFor(posting, html) {
  const body = cleanText(html).toLocaleLowerCase('en-US')
  if (/job (?:is )?no longer available|position has been filled|applications? (?:are )?closed|공고가 마감|마감된 공고|채용이 종료/.test(body)) return 'closed'
  if (posting?.validThrough) {
    const validThrough = new Date(posting.validThrough)
    if (!Number.isNaN(validThrough.valueOf()) && validThrough < currentDate) return 'closed'
  }
  // A generic page GET cannot prove that an ATS still accepts submissions.
  // ATS-specific adapters may promote this to `open` after checking an active flag.
  return 'accessible'
}

async function fetchCandidate({ row, seed }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 18_000)
  try {
    const response = await fetch(row.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; SecTrackResearch/1.0; +https://github.com/)' },
    })
    const html = await response.text()
    const finalUrl = response.url || row.url
    if (!response.ok) return { accepted: false, auditNumber: row.number, roleId: seed.normalized.roleMappings[0].roleId, url: row.url, status: 'inaccessible', reason: `HTTP ${response.status}` }
    const redirectedToListing = finalUrl !== row.url && /\/jobs?\/?(?:\?.*)?$/i.test(new URL(finalUrl).pathname)
    if (redirectedToListing) return { accepted: false, auditNumber: row.number, roleId: seed.normalized.roleMappings[0].roleId, url: row.url, status: 'redirected', reason: `채용 목록으로 리디렉션: ${finalUrl}` }

    const structured = jobPostingJsonLd(html)
    const bodyHtml = structured?.description || html
    const body = cleanText(bodyHtml)
    const title = cleanText(structured?.title || metaContent(html, 'og:title') || row.jobTitle)
    const company = cleanText(structuredCompany(structured) || row.company)
    const titleVerified = Boolean(structured?.title) || textConfirms(row.jobTitle, `${title} ${body}`)
    const companyVerified = Boolean(structuredCompany(structured)) || textConfirms(row.company, `${company} ${body}`)
    const bodyVerified = body.length >= 300 && titleVerified && companyVerified
    if (!bodyVerified) return { accepted: false, auditNumber: row.number, roleId: seed.normalized.roleMappings[0].roleId, url: row.url, status: 'inaccessible', reason: `본문 검증 실패(title=${titleVerified}, company=${companyVerified}, body=${body.length})` }

    const applicationAvailable = /apply (?:for this job|now)|지원하기|submit application|application-form|\/apply(?:[/?"'])/i.test(html)
    const sourceStatus = statusFor(structured, html)
    const sections = extractedSections(bodyHtml)
    const years = requiredYears(body)
    const location = structuredLocation(structured) || row.location || ''
    const remote = structured?.jobLocationType === 'TELECOMMUTE' || /\bremote\b|원격/.test(`${location} ${title}`.toLocaleLowerCase('en-US'))
    const hybrid = /\bhybrid\b|하이브리드/i.test(`${location} ${body.slice(0, 1000)}`)
    const market = /korea|대한민국|한국|seoul|서울/i.test(location) ? 'domestic' : 'international'
    const roleId = seed.normalized.roleMappings[0].roleId
    const domainId = seed.normalized.securityDomainId
    const canonicalUrl = canonicalizePostingUrl(finalUrl)
    const matchLevel = row.matchLevel === '직무명·업무 일치' ? 'exact' : 'strong'
    if (matchLevel === 'strong' && sections.responsibilities.length < 3) {
      return {
        accepted: false,
        auditNumber: row.number,
        roleId,
        url: row.url,
        status: sourceStatus,
        reason: `strong 일치 책임 근거 부족(${sections.responsibilities.length}/3)`,
      }
    }
    const score = matchLevel === 'exact' ? 93 : 82
    const extractedTerms = Object.fromEntries(Object.entries(extractionDictionary).map(([key, terms]) => [key, extractNamedTerms(body, terms)]))

    return {
      accepted: true,
      posting: {
        id: `enriched-audit-${String(row.number).padStart(3, '0')}`,
        roleId,
        domainId,
        familyId: null,
        companyName: company,
        originalJobTitle: title,
        normalizedRoleTitle: seed.normalized.roleMappings[0].catalogRoleTitle || seed.normalized.representativeRole,
        market,
        country: structured?.applicantLocationRequirements?.name || (market === 'domestic' ? '대한민국' : ''),
        location,
        workMode: remote ? 'remote' : hybrid ? 'hybrid' : location ? 'onsite' : 'unknown',
        employmentType: Array.isArray(structured?.employmentType) ? structured.employmentType.join(', ') : structured?.employmentType || '',
        careerLevel: careerLevel(title, body),
        requiredYearsMin: years.min,
        requiredYearsMax: years.max,
        source: {
          postingUrl: finalUrl,
          canonicalUrl,
          sourceType: new URL(finalUrl).hostname,
          checkedDate,
          status: sourceStatus,
          titleVerified,
          companyVerified,
          bodyVerified,
          applicationAvailable,
          verificationNotes: [`HTTP ${response.status}`, structured ? 'JobPosting JSON-LD 본문 확인' : 'HTML 본문 확인', row.verificationBasis],
        },
        match: {
          level: matchLevel,
          score,
          titleMatch: matchLevel === 'exact',
          responsibilityMatchCount: sections.responsibilities.length,
          foundationMatchCount: 0,
          reasons: [row.matchLevel, row.notes || row.verificationBasis],
          matchedResponsibilities: sections.responsibilities.slice(0, 5),
          unmatchedCoreResponsibilities: [],
        },
        extracted: {
          ...extractedTerms,
          responsibilities: sections.responsibilities,
          requirements: sections.requirements,
          preferredQualifications: sections.preferredQualifications,
          securityDomains: [],
          deliverables: [],
          partnerTeams: [],
          industryKnowledge: [],
        },
        evidence: {
          sourceHeadings: sections.sourceHeadings,
          extractionNotes: ['공고 원문의 제목 구분과 목록 구조를 기준으로 필수·우대·업무를 분리했습니다.'],
          limitations: structured ? [] : ['구조화 JobPosting 데이터가 없어 HTML 본문을 기준으로 추출했습니다.'],
        },
      },
    }
  } catch (error) {
    return { accepted: false, auditNumber: row.number, roleId: seed.normalized.roleMappings[0].roleId, url: row.url, status: 'inaccessible', reason: error.name === 'AbortError' ? '18초 GET 타임아웃' : error.message }
  } finally {
    clearTimeout(timeout)
  }
}

async function runPool(values, concurrency, task) {
  const results = new Array(values.length)
  let cursor = 0
  async function worker() {
    while (cursor < values.length) {
      const index = cursor
      cursor += 1
      results[index] = await task(values[index])
      process.stderr.write(`\r검증 ${results.filter(Boolean).length}/${values.length}`)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  process.stderr.write('\n')
  return results
}

const results = await runPool(candidates, 12, fetchCandidate)
const accepted = results.filter((result) => result.accepted).map((result) => result.posting)
const rejected = results.filter((result) => !result.accepted)
const payload = {
  checkedDate,
  candidateCount: candidates.length,
  acceptedCount: accepted.length,
  uniqueAcceptedUrlCount: new Set(accepted.map((posting) => posting.source.canonicalUrl)).size,
  rejectedCount: rejected.length,
  postings: accepted,
  rejectedCandidates: rejected,
}

if (outputPath && outputPath !== '--output') await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`)
if (moduleOutputPath && moduleOutputPath !== '--module-output') {
  const moduleSource = `// Generated by scripts/research-week0-existing-job-postings.mjs on ${checkedDate}.\n// Re-run the direct GET research script instead of hand-editing individual rows.\nexport const existingAuditEnrichedPostingsRaw = Object.freeze(${JSON.stringify(accepted, null, 2)})\n\nexport const existingAuditRejectedCandidates = Object.freeze(${JSON.stringify(rejected, null, 2)})\n`
  await writeFile(moduleOutputPath, moduleSource)
}
console.log(JSON.stringify({ ...payload, postings: undefined, rejectedCandidates: undefined }, null, 2))
