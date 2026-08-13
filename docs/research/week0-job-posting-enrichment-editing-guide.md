# Week 0 채용공고 데이터 수정 작업 노트

이 문서는 Week 0 careers의 채용공고 조사 결과를 사람이 다시 확인하고 수정할 때 사용하는 작업용 안내서다. 실제 페이지 데이터는 이 문서에서 읽지 않으며, 아래 JavaScript 데이터 파일을 source of truth로 사용한다.

## 어디를 수정해야 하는가

- 전체 역할·검색어 생성: `src/data/week0/jobPostingResearchTargets.js`
- 공통 스키마·URL 정규화·집계: `src/data/week0/jobPostingEnrichmentCore.js`
- 거버넌스·컨설팅·AppSec·DevSecOps: `src/data/week0/jobPostings/enrichmentGovernanceAppsec20260801.js`
- 오펜시브·탐지·DFIR·리버싱: `src/data/week0/jobPostings/enrichmentOffensiveDetection20260801.js`
- 인프라·클라우드·암호·OT: `src/data/week0/jobPostings/enrichmentInfrastructureCloud20260801.js`
- IoT·자동차·AI·보안 R&D: `src/data/week0/jobPostings/enrichmentIotAutomotiveAiRnd20260801.js`
- AI·보안 R&D 추가 공식 ATS 표본: `src/data/week0/jobPostings/enrichmentAiRndAdditional20260801.js`
- 기존 감사 자료를 다시 연 파일: `src/data/week0/jobPostings/existingAuditEnrichment20260801.js`
- 최종 통합 조회 API: `src/data/week0/jobPostingEnrichment20260801.js`
- 실제 페이지 컴포넌트: `src/components/week0/RolePostingResearch.jsx`

`jobPostingsAudit20260727.js`는 기존 생성 자료이므로 개별 행을 직접 고치지 않는다. 새로 조사한 내용은 enrichment 파일에 추가한다.

## 공고 하나를 추가하기 전 확인할 것

1. 검색 결과나 회사 채용 목록이 아니라 개별 공고 상세 URL인지 확인한다.
2. URL을 직접 열어 회사명과 원문 직무명을 확인한다.
3. 담당업무 또는 자격요건 본문이 실제로 보이는지 확인한다.
4. 지원 버튼·지원 폼·ATS active 상태를 확인했을 때만 `open`으로 기록한다.
5. 본문은 있으나 접수 여부가 불명확하면 `accessible`, 마감 문구와 본문이 함께 남아 있으면 `closed`로 기록한다.
6. 공고에 쓰인 내용만 `responsibilities`, `requirements`, `preferredQualifications`에 나눠 적는다.
7. 제품명이나 경력 연차를 직무명만 보고 추측하지 않는다.
8. 같은 역할에 같은 canonical URL이 이미 없는지 확인한다.

## 직무 일치도 기록

`exact`는 원문 직무명이 역할명 또는 실제 직무명 변형과 직접 대응하고, 핵심 책임이 공고의 주된 업무일 때 사용한다. 점수는 90~100점이다.

`strong`은 직무명은 다르지만 역할의 핵심 책임이 공고의 주된 업무에서 3개 이상 확인될 때 사용한다. 점수는 75~89점이며, `matchedResponsibilities`에 그 근거를 역할별로 따로 적는다.

`adjacent`와 `reject`는 후보 감사 기록에는 남길 수 있지만 역할당 5개 표본에는 포함하지 않는다.

## 추출 배열 작성 원칙

다음 세 배열은 서로 섞지 않는다.

- `responsibilities`: 입사 후 수행할 업무
- `requirements`: 필수 자격요건
- `preferredQualifications`: 우대사항 또는 bonus 항목

기술 항목도 원문 표현의 구체성을 유지한다. `Cloud`를 임의로 `AWS`로, `SIEM`을 `Splunk`로, `EDR`을 특정 제품으로 바꾸지 않는다.

## 수정 후 감사 문서와 검증 갱신

```bash
node scripts/generate-week0-job-posting-audit.mjs
node scripts/validate-week0-all-role-job-postings.mjs
node --test test/weekZeroJobPostingEnrichment.test.js
npm run lint
npm run build
```

감사 문서는 `docs/research/week0-all-role-job-posting-enrichment-2026-08-01.md`에 다시 생성된다. 생성 문서의 역할별 URL과 데이터가 다르면 validation script가 실패한다.

## 사람이 남길 수정 메모

자동 생성 감사 문서가 아닌 이 절 아래에 재확인할 공고, 역할명 조정 의견, 다음 조사 날짜를 자유롭게 기록한다.

- 다음 전체 URL 재검증 예정일:
- 새로 확인할 국내 채용 플랫폼:
- 역할명 또는 검색어 보완 의견:
- 페이지 표시 문구 보완 의견:
