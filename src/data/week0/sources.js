export const weekZeroSources = Object.freeze([
  {
    id: 'source-kisa-job-guide',
    label: 'KISA 아카데미 · 사이버보안 직무 소개',
    url: 'https://academy.kisa.or.kr/cont/job/jobGuide.do',
    sourceType: 'careerGuide',
    note: '직무 분류와 일반 업무 설명을 확인하는 공식 진로 가이드입니다. 개별 채용공고가 아닙니다.',
  },
  {
    id: 'source-nice-framework',
    label: 'NIST NICE Framework Resource Center',
    url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center',
    sourceType: 'framework',
    note: '사이버보안 업무 역할과 역량을 읽는 공개 프레임워크입니다.',
  },
  {
    id: 'source-cve',
    label: 'CVE Program',
    url: 'https://www.cve.org/',
    sourceType: 'standard',
    note: '공개 취약점 식별자 CVE의 공식 프로그램입니다.',
  },
  {
    id: 'source-cwe',
    label: 'MITRE CWE',
    url: 'https://cwe.mitre.org/',
    sourceType: 'standard',
    note: '소프트웨어와 하드웨어 약점 유형을 분류하는 공개 체계입니다.',
  },
  {
    id: 'source-cvss-v4',
    label: 'FIRST · CVSS v4.0',
    url: 'https://www.first.org/cvss/v4.0/',
    sourceType: 'standard',
    note: 'CVSS의 기술적 심각도와 벡터 표현을 확인하는 공식 문서입니다.',
  },
  {
    id: 'source-jobkorea-cyberone',
    label: 'JobKorea · 싸이버원 침해사고 조사 담당자',
    url: 'https://m.jobkorea.co.kr/Recruit/GI_Read/49530641?sc=226',
    sourceType: 'individualVacancy',
    note: '사용자가 제공한 metadata-only 공고입니다. 본문을 재검증하기 전까지 세부 업무·역량을 표시하지 않습니다.',
  },
])

export const evidenceTypeLabels = Object.freeze({
  direct: '공고 직접 확인',
  inferred: '본문 기반 추론',
  normalized: 'SecTrack 분류',
  generic: '직무 일반 설명',
  metadataOnly: '제목·메타데이터만 확인',
})

export const completenessLabels = Object.freeze({
  detailed: '상세 Seed',
  partial: 'Partial Seed',
  metadataOnly: '메타데이터만',
})

export const currentStatusLabels = Object.freeze({
  active: '모집 중 확인',
  closed: '마감 확인',
  unknown: '현재 상태 미확인',
  notApplicable: '해당 없음',
})
