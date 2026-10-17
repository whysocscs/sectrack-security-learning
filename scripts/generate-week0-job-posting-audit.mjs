import { writeFile } from 'node:fs/promises'
import {
  enrichedPostingsForRole,
  jobPostingEnrichmentSummary,
  rolePostingCoverage,
} from '../src/data/week0/jobPostingEnrichment20260801.js'
import { researchDomains } from '../src/data/week0/careerResearch.js'
import { roleResearchTargets } from '../src/data/week0/jobPostingResearchTargets.js'

const outputUrl = new URL('../docs/research/week0-all-role-job-posting-enrichment-2026-08-01.md', import.meta.url)
const coverageByRoleId = new Map(rolePostingCoverage.map((coverage) => [coverage.roleId, coverage]))

function escapeCell(value) {
  return String(value || '').replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function linesForList(values, empty = '- 없음') {
  return values.length ? values.map((value) => `- ${value}`).join('\n') : empty
}

function domainSummary(domain) {
  const targets = roleResearchTargets.filter((target) => target.domainId === domain.id)
  const coverage = targets.map((target) => coverageByRoleId.get(target.roleId))
  const postings = targets.flatMap((target) => enrichedPostingsForRole(target.roleId))
  return {
    domain,
    roleCount: targets.length,
    targetCount: targets.length * 5,
    acceptedCount: postings.length,
    uniqueUrlCount: new Set(postings.map((posting) => posting.source.canonicalUrl)).size,
    shortageRoles: coverage.filter((item) => item.shortage),
    rejectedCount: coverage.reduce((total, item) => total + item.rejectedCandidateCount, 0),
  }
}

const domainSummaries = researchDomains.map(domainSummary)
const acceptedUrls = [...new Set(roleResearchTargets
  .flatMap((target) => enrichedPostingsForRole(target.roleId))
  .map((posting) => posting.source.canonicalUrl))].sort()

const document = []
document.push('# Week 0 전체 보안 분야·전체 직무 채용공고 enrichment 감사')
document.push('')
document.push('이 문서는 `2026-08-01`에 개별 공고 원문을 직접 열어 확인한 결과와 제외 내역을 데이터에서 생성한 감사 기록이다. 채용공고는 이후 변경되거나 삭제될 수 있으며, 페이지가 열린다는 사실만으로 현재 모집 중이라고 판단하지 않았다.')
document.push('')
document.push('## 전체 요약')
document.push('')
document.push(`- 조사 날짜: ${jobPostingEnrichmentSummary.checkedDate}`)
document.push(`- 전체 분야 수: ${jobPostingEnrichmentSummary.domainCount}`)
document.push(`- 전체 직무군 수: ${jobPostingEnrichmentSummary.familyCount}`)
document.push(`- 전체 대표 직무 수: ${jobPostingEnrichmentSummary.roleCount}`)
document.push(`- 목표 직무-공고 매핑 수: ${jobPostingEnrichmentSummary.targetPostingCount}`)
document.push(`- 실제 채택 매핑 수: ${jobPostingEnrichmentSummary.postingMappingCount}`)
document.push(`- 고유 URL 수: ${jobPostingEnrichmentSummary.uniqueUrlCount}`)
document.push(`- 표본 부족 역할 수: ${jobPostingEnrichmentSummary.shortageRoleCount}`)
document.push(`- 제외 후보 수: ${jobPostingEnrichmentSummary.rejectedCandidateCount}`)
document.push('')
document.push('### 상태별 결과')
document.push('')
for (const [status, count] of Object.entries(jobPostingEnrichmentSummary.statusCounts)) document.push(`- ${status}: ${count}`)
document.push('')
document.push('### 일치도별 결과')
document.push('')
for (const [level, count] of Object.entries(jobPostingEnrichmentSummary.matchLevelCounts)) document.push(`- ${level}: ${count}`)
document.push('')
document.push('## 분야별 결과')
document.push('')
document.push('| 분야 | 역할 수 | 목표 공고 수 | 채택 매핑 수 | 고유 URL 수 | 표본 부족 역할 수 | 제외 후보 수 |')
document.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: |')
for (const summary of domainSummaries) {
  document.push(`| ${escapeCell(summary.domain.title)} | ${summary.roleCount} | ${summary.targetCount} | ${summary.acceptedCount} | ${summary.uniqueUrlCount} | ${summary.shortageRoles.length} | ${summary.rejectedCount} |`)
}
document.push('')
for (const summary of domainSummaries) {
  document.push(`### ${summary.domain.title}`)
  document.push('')
  document.push(`- 역할 수: ${summary.roleCount}`)
  document.push(`- 목표 공고 수: ${summary.targetCount}`)
  document.push(`- 실제 채택 공고 수: ${summary.acceptedCount}`)
  document.push(`- 고유 URL 수: ${summary.uniqueUrlCount}`)
  document.push(`- 표본 부족 역할: ${summary.shortageRoles.length ? summary.shortageRoles.map((coverage) => coverage.roleTitle).join(', ') : '없음'}`)
  document.push(`- 주요 제외 사유: ${summary.rejectedCount ? '404·429·본문 미확인·목록/홈 리디렉션·로그인 요구·역할 핵심 업무 근거 부족·구조화 섹션 미추출' : '없음'}`)
  document.push('')
}
document.push('## 역할별 결과')
document.push('')
for (const target of roleResearchTargets) {
  const coverage = coverageByRoleId.get(target.roleId)
  const postings = enrichedPostingsForRole(target.roleId)
  document.push(`<!-- ROLE:${target.roleId} -->`)
  document.push(`### ${target.domainTitle} / ${target.roleTitle}`)
  document.push('')
  document.push(`- 역할 ID: \`${target.roleId}\``)
  document.push(`- 직무군: ${target.familyTitle}`)
  document.push(`- 사용한 검색어 수: ${coverage.searchedQueries.length}`)
  document.push(`- 조사한 후보 수: ${coverage.candidateCount}`)
  document.push(`- 채택 공고 수: ${coverage.verifiedCount}`)
  document.push(`- 제외 공고 수: ${coverage.rejectedCandidateCount}`)
  document.push(`- 표본 부족 여부: ${coverage.shortage ? '예' : '아니요'}`)
  document.push(`- 알려진 한계: ${coverage.shortage ? coverage.shortageReasons.join(' / ') : '현재 검증 표본 5건 이상을 확보했지만 공고가 변경·종료될 수 있다.'}`)
  document.push('')
  document.push('#### 사용한 검색어')
  document.push('')
  document.push(linesForList(coverage.searchedQueries.map((query) => `\`${query}\``)))
  document.push('')
  document.push('#### 채택 URL')
  document.push('')
  document.push(linesForList(postings.map((posting) => `<${posting.source.canonicalUrl}> — ${posting.companyName} / ${posting.originalJobTitle} / ${posting.match.level} ${posting.match.score}점 / ${posting.source.status}`)))
  document.push('')
  document.push('#### 제외 URL과 이유')
  document.push('')
  document.push(linesForList(coverage.rejectedCandidates.map((candidate) => {
    const label = candidate.postingUrl ? `<${candidate.postingUrl}>` : `${candidate.companyName || '회사 미확인'} / ${candidate.originalJobTitle || '제목 미확인'}`
    return `${label} — ${candidate.status}: ${candidate.reason}`
  })))
  document.push('')
}
document.push('## 검증 방법')
document.push('')
document.push('- URL 확인: 검색 결과에서 찾은 후보를 기업 공식 채용 사이트 또는 Greenhouse·Lever·Ashby·Workday·SmartRecruiters 등 공식 ATS의 개별 공고 URL로 다시 열었다. HEAD 성공만으로 채택하지 않고 GET 본문 또는 공식 ATS API의 상세 본문을 확인했다.')
document.push('- 본문 확인: 회사명, 원문 직무명, 업무 또는 자격요건 본문을 확인한 경우에만 `bodyVerified`를 true로 기록했다. 원문에 명시되지 않은 도구·자격증·경력 연차는 추가하지 않았다.')
document.push('- 모집 상태: 지원 버튼·지원 폼·ATS active 상태를 직접 확인한 경우만 `open`, 본문은 있으나 접수 여부가 불명확하면 `accessible`, 마감 문구와 본문이 함께 남아 있으면 `closed`로 분류했다.')
document.push('- canonical URL: fragment와 `utm_*`, `ref`, `source`, `tracking`, `gh_src`, `lever-source`, 세션·광고 파라미터를 제거했다. 경로 또는 공고 식별에 필요한 파라미터는 유지했다.')
document.push('- 직무 일치도: 제목과 역할 원문 직무명이 직접 대응하고 핵심 업무가 일치하면 exact, 제목이 다르더라도 역할 핵심 책임을 주요 업무에서 3개 이상 확인하면 strong으로 분류했다. adjacent와 reject는 5개 표본에 포함하지 않았다.')
document.push('- 중복 제거: 같은 역할 안에서 canonical URL이 같은 공고는 한 번만 채택했다. 하나의 공고를 복수 역할에 연결한 경우 역할별 matchedResponsibilities와 점수를 별도로 기록했다.')
document.push('- 데이터 정규화: AWS·GCP·Kubernetes처럼 같은 제품을 의미하는 명백한 동의어만 통합했다. Cloud와 AWS, SIEM과 Splunk, EDR과 특정 제품처럼 상위 개념과 제품명은 합치지 않았다.')
document.push('')
document.push('## 접근 실패 목록')
document.push('')
document.push('| 역할 | 회사명 | 공고 제목 | URL | 실패 유형 | 확인 날짜 | 비고 |')
document.push('| --- | --- | --- | --- | --- | --- | --- |')
const failureStatuses = new Set(['inaccessible', 'listingOnly', 'loginRequired', 'redirected'])
for (const coverage of rolePostingCoverage) {
  for (const candidate of coverage.rejectedCandidates.filter((item) => failureStatuses.has(item.status))) {
    document.push(`| ${escapeCell(coverage.roleTitle)} | ${escapeCell(candidate.companyName || '미확인')} | ${escapeCell(candidate.originalJobTitle || '미확인')} | ${candidate.postingUrl ? `<${candidate.postingUrl}>` : 'URL 없음'} | ${candidate.status} | ${candidate.checkedDate} | ${escapeCell(candidate.reason)} |`)
  }
}
document.push('')
document.push('## 변경 가능성 안내')
document.push('')
document.push('채용공고는 수시로 수정·마감·삭제되거나 다른 URL로 이동할 수 있다. `open`은 조사 기준일에 지원 경로를 직접 확인했다는 뜻이며 이후에도 계속 모집 중임을 보장하지 않는다. `accessible`은 제목과 본문을 확인했지만 현재 접수 중인지 확정하지 못한 상태다. `closed`는 마감됐지만 직무 연구를 위한 제목과 본문 근거가 남아 있던 공고다.')
document.push('')
document.push('## 데이터와 대조하는 채택 canonical URL')
document.push('')
document.push('아래 경계 안의 URL 집합은 자동 검증 스크립트가 enrichment 데이터의 고유 canonical URL 집합과 정확히 대조한다.')
document.push('')
document.push('<!-- ACCEPTED_URLS_START -->')
for (const url of acceptedUrls) document.push(`- <${url}>`)
document.push('<!-- ACCEPTED_URLS_END -->')
document.push('')

await writeFile(outputUrl, `${document.join('\n')}\n`, 'utf8')
console.log(`감사 문서 생성: ${outputUrl.pathname}`)
console.log(JSON.stringify({ roles: roleResearchTargets.length, mappings: jobPostingEnrichmentSummary.postingMappingCount, uniqueUrls: acceptedUrls.length }, null, 2))
