import { prepareEnrichedPosting } from '../jobPostingEnrichmentCore.js'
import { roleResearchTargetById } from '../jobPostingResearchTargets.js'

const checkedDate = '2026-08-01'
const targetCountPerRole = 5

function sourceTypeFor(url) {
  const host = new URL(url).hostname
  if (host.includes('greenhouse.io')) return 'Greenhouse individual posting'
  if (host.includes('lever.co')) return 'Lever individual posting'
  if (host.includes('smartrecruiters.com')) return 'SmartRecruiters individual posting'
  if (host.includes('myworkdayjobs.com')) return 'Workday individual posting'
  if (host.includes('wanted.co.kr') || host.includes('jobkorea.co.kr') || host.includes('careerly.co.kr') || host.includes('bzpp.co.kr')) return '국내 채용 플랫폼 개별 공고'
  return '기업 공식 개별 채용공고'
}

function postingSource({
  companyName,
  originalJobTitle,
  url,
  market = 'international',
  country = '',
  location = '',
  workMode = 'unknown',
  employmentType = '',
  careerLevel = 'unknown',
  requiredYearsMin = null,
  requiredYearsMax = null,
  status = 'open',
  applicationAvailable = status === 'open',
  responsibilities = [],
  requirements = [],
  preferredQualifications = [],
  sourceHeadings = [],
  limitations = [],
  ...extracted
}) {
  return Object.freeze({
    companyName,
    originalJobTitle,
    url,
    market,
    country,
    location,
    workMode,
    employmentType,
    careerLevel,
    requiredYearsMin,
    requiredYearsMax,
    status,
    applicationAvailable,
    sourceType: sourceTypeFor(url),
    extracted: Object.freeze({ responsibilities, requirements, preferredQualifications, ...extracted }),
    evidence: Object.freeze({
      sourceHeadings,
      extractionNotes: Object.freeze([
        '2026-08-01에 개별 공고 URL을 직접 GET하거나 브라우저로 렌더링해 회사명·직무명·본문을 확인했다.',
        '업무·필수·우대 항목은 확인한 공고 문장을 짧은 한국어로 재서술했으며, 본문에 없는 제품명이나 경력 연차는 보충하지 않았다.',
      ]),
      limitations: Object.freeze(limitations),
    }),
  })
}

const postingSources = Object.freeze({
  cisoKeenfinity: postingSource({
    companyName: 'Keenfinity', originalJobTitle: 'Chief Information Security Officer (CISO) (m/f/div.)',
    url: 'https://jobs.smartrecruiters.com/Keenfinity/744000126734989-chief-information-security-officer-ciso-m-f-div-', country: '포르투갈', location: 'Ovar', workMode: 'hybrid', employmentType: 'full-time', careerLevel: 'director', requiredYearsMin: 8,
    responsibilities: ['전사 보안 전략·위험 선호도·거버넌스 체계를 정의하고 위험 등록부를 운영한다.', 'SOC·IAM·ISMS 책임자에게 전략 방향을 제시하고 주요 보안 아키텍처 결정을 승인한다.', '사업 분리 단계의 보안 실사 자료와 보안 승인 절차를 총괄한다.'],
    requirements: ['IT 보안 리더십 8년 이상과 CISO 또는 Head of Security 경력 3년 이상을 요구한다.', 'ISO 27001·IAM·SOC/SIEM·클라우드 보안 중 복수 분야의 깊은 경험을 요구한다.'],
    preferredQualifications: ['CISSP 또는 CISM', 'NIS2 및 산업·제조 환경 경험'],
    cloudPlatforms: ['Azure'], securityProducts: ['SIEM'], frameworks: ['ISMS'], lawsAndStandards: ['ISO 27001', 'GDPR', 'NIS2'], partnerTeams: ['SOC', 'IAM', 'ISMS', '재무', '엔터프라이즈 아키텍처'], deliverables: ['보안 전략', '위험 등록부', '분기 보안 대시보드', '보안 실사 패키지'],
    sourceHeadings: ['Security strategy & governance', 'Security operations oversight', 'ISMS & compliance', 'Qualifications'],
  }),
  cisoDefenseUnicorns: postingSource({
    companyName: 'Defense Unicorns', originalJobTitle: 'Chief Information Security Officer (GAOH164)',
    url: 'https://job-boards.greenhouse.io/defenseunicorns/jobs/5155778007', country: '미국', location: 'Remote, USA', workMode: 'remote', employmentType: 'full-time', careerLevel: 'director',
    responsibilities: ['전사 정보보안 전략·거버넌스·위험 태세와 보안 조직을 총괄한다.', '애플리케이션·클라우드 인프라·사고 대응 프로그램의 경영진 책임을 맡는다.', 'CMMC·DFARS·NIST 기반 규정 준수와 제3자·공급망 위험 프로그램을 감독한다.'],
    requirements: ['고위 보안 리더십과 보안·IT 조직 운영 경험을 요구한다.', 'CMMC Level 2, NIST SP 800-171 및 DoD 계약 컴플라이언스 경험을 요구한다.', '유효한 DoD TS/SCI 보안 인가를 요구한다.'],
    preferredQualifications: ['CISSP, CISM 또는 CCISO', '클라우드 네이티브·AI 거버넌스 경험'],
    cloudPlatforms: ['AWS', 'GCP', 'Azure'], containerPlatforms: ['Kubernetes'], tools: ['Terraform', 'Pulumi'], lawsAndStandards: ['CMMC Level 2', 'NIST SP 800-171', 'DFARS 252.204-7012'], partnerTeams: ['CEO', '법무', 'IT', '보안 컴플라이언스', '제품 엔지니어링'], deliverables: ['전사 보안 전략', 'GRC 프레임워크', '경영진 위험 보고'],
    sourceHeadings: ['Enterprise Security Strategy & Executive Leadership', 'Application Security', 'Infrastructure Security', 'Governance, Risk & Compliance', 'Required Qualifications'],
  }),
  cisoBitsight: postingSource({
    companyName: 'Bitsight', originalJobTitle: 'Chief Information Security Officer (CISO)',
    url: 'https://bitsight.wd1.myworkdayjobs.com/en-US/Bitsight/job/Chief-Information-Security-Officer--CISO-_JR101310-1', country: '미국', location: 'Boston, MA', workMode: 'hybrid', employmentType: 'full-time', careerLevel: 'director', requiredYearsMin: 10,
    responsibilities: ['글로벌 보안 프로그램과 엔드포인트·IAM·클라우드·데이터 보호를 총괄한다.', '전사 위험 평가·제3자 위험·업무연속성과 사고 대응을 이끈다.', 'CEO·CFO·이사회에 기술 위험과 보안 성과 지표를 보고한다.'],
    requirements: ['사이버보안 또는 위험관리 10년 이상과 보안 조직 리더십 5년 이상을 요구한다.', '클라우드 네이티브 환경의 IAM·사고 대응·DLP·취약점 관리 경험을 요구한다.', 'SOC 2·ISO 27001·NIST 거버넌스 경험을 요구한다.'],
    cloudPlatforms: ['AWS', 'Azure'], frameworks: ['NIST'], lawsAndStandards: ['SOC 2', 'ISO 27001'], partnerTeams: ['CEO', 'CFO', '이사회', '제품', '엔지니어링', '법무', 'GRC'], deliverables: ['보안 KPI', '위험 완화 계획', '이사회 위험 보고'],
    sourceHeadings: ['Security Operations, Risk Management & Resilience', 'Security Governance & Executive Leadership', "What We're Looking For"],
  }),
  cisoPcaob: postingSource({
    companyName: 'PCAOB', originalJobTitle: 'Chief Information Security Officer',
    url: 'https://pcaobus.wd503.myworkdayjobs.com/en-US/PCAOB/job/Chief-Information-Security-Officer_R1237', country: '미국', location: 'Washington, DC / New York, NY', workMode: 'hybrid', employmentType: 'full-time', careerLevel: 'director', requiredYearsMin: 15,
    responsibilities: ['기관 정보보안 프로그램의 전략·구현·모니터링·보고와 장기 로드맵을 책임진다.', '보안 통제 평가, SOC 구조, 사고 대응, 제3자 위험과 경영진 보고를 총괄한다.', 'CIO·위험관리 조직·이사회와 보안 투자 및 위험 대응 방향을 조율한다.'],
    requirements: ['사이버보안 15년 이상과 리더십 경력 5년 이상을 요구한다.', 'Microsoft 기술 참조 아키텍처, 클라우드, NIST·ISO·SOX·PCI 프레임워크 경험을 요구한다.'],
    preferredQualifications: ['CISM, CISSP 또는 CRISC'],
    cloudPlatforms: ['Azure'], frameworks: ['NIST'], lawsAndStandards: ['ISO 27001', 'SOX', 'PCI DSS'], partnerTeams: ['CIO', '이사회', '리스크', '법무', '컴플라이언스'], deliverables: ['다년 보안 로드맵', '보안 KPI', '통제 평가', '사고 대응 플레이북'],
    sourceHeadings: ['Responsibilities', 'Qualifications', 'Preferred Qualifications'],
  }),
  cisoUhn: postingSource({
    companyName: 'University Health Network', originalJobTitle: 'Chief Information Security Officer (CISO) – Local Delivery Group (LDG) Cybersecurity Lead',
    url: 'https://jobs.smartrecruiters.com/UniversityHealthNetwork/744000113274227-chief-information-security-officer-ciso-local-delivery-group-ldg-cybersecurity-lead', country: '캐나다', location: 'Toronto, ON', employmentType: 'full-time', careerLevel: 'director', requiredYearsMin: 10, status: 'closed', applicationAvailable: false,
    responsibilities: ['지역 의료기관 공동 보안 전략과 다년 로드맵을 수립하고 프로그램 성과를 관리한다.', '지역 위험관리·사고 대응·공통 정책과 거버넌스 포럼을 운영한다.', '보안 예산·조달·벤더 성과를 감독한다.'],
    requirements: ['IT·사이버보안 10년 이상과 고위 리더십 경력 3년 이상을 요구한다.', 'NIST·ISO 27001·COBIT 및 의료 개인정보 규제 경험을 요구한다.'],
    preferredQualifications: ['CISSP, CISM, CISA 또는 CCISO'], frameworks: ['NIST', 'COBIT'], lawsAndStandards: ['ISO 27001', 'PHIPA', 'PIPEDA'], partnerTeams: ['CIO', '의료기관 경영진', '조달', '벤더'], deliverables: ['지역 보안 전략', '다년 로드맵', '위험 프레임워크', '사고 대응 계획'],
    sourceHeadings: ['Duties', 'Qualifications'], limitations: ['공고 본문은 확인되지만 명시된 마감일이 지나 closed로 분류했다.'],
  }),
  grcProtective: postingSource({
    companyName: 'Protective', originalJobTitle: 'Security GRC Analyst',
    url: 'https://jobs.lever.co/protective/b6f427bc-8d82-440e-b7f8-2310f990524e', country: '미국', location: 'Work From Home', workMode: 'remote', employmentType: 'full-time', careerLevel: 'mid', requiredYearsMin: 1, requiredYearsMax: 3,
    responsibilities: ['규제·통제·정책과 감사 증적을 운영하고 외부 감사 준비를 지원한다.', '벤더 온보딩부터 종료까지 제3자 사이버 위험 평가를 수행한다.', 'GRC 워크플로와 위험·성과 지표를 개선한다.'],
    requirements: ['사이버보안 GRC·위험·컴플라이언스 경력 1~3년을 요구한다.', '규제 프레임워크, 감사, 통제 환경과 TPRM의 기본 이해를 요구한다.'],
    tools: ['ServiceNow', 'Archer', 'SharePoint', 'Power BI'], partnerTeams: ['컴플라이언스', '법무', '기술 조직'], deliverables: ['위험 평가', '감사 증적', '정책·통제 라이브러리', 'GRC 지표'],
    sourceHeadings: ['Responsibilities', 'Required Skills & Expertise'],
  }),
  grcWhoop: postingSource({
    companyName: 'WHOOP', originalJobTitle: 'Manager and Senior Manager: Governance, Risk, & Compliance (GRC)',
    url: 'https://jobs.lever.co/whoop/b948788e-52a9-446b-a982-2cb1430860c8', country: '미국', location: 'Boston, MA', careerLevel: 'manager', requiredYearsMin: 8,
    responsibilities: ['GRC 통제 프레임워크·정책·표준과 위험 등록부를 운영한다.', '제3자 위험 평가와 보안 질의·SDLC 위험 검토의 접수·우선순위를 관리한다.', '평가량·처리시간·백로그·SLA를 대시보드로 보고한다.'],
    requirements: ['GRC 또는 정보보안 경력 8년 이상과 관리 경력 약 4년을 요구한다.'],
    lawsAndStandards: ['ISO 27001', 'SOC 2', 'GDPR'], partnerTeams: ['법무', 'IT', '보안'], deliverables: ['위험 등록부', '통제 프레임워크', '운영 KPI 대시보드'],
    sourceHeadings: ['RESPONSIBILITIES', 'QUALIFICATIONS'],
  }),
  complianceHasbro: postingSource({
    companyName: 'Hasbro', originalJobTitle: 'Sr Security Compliance Analyst',
    url: 'https://job-boards.greenhouse.io/hasbro/jobs/4249813009', country: '미국', location: '미국', careerLevel: 'senior', requiredYearsMin: 5,
    responsibilities: ['보안 정책·표준·통제와 감사 증적을 유지하고 규제 평가를 지원한다.', '통제 격차와 벤더 위험을 검토하고 시정조치를 추적한다.'],
    requirements: ['보안 컴플라이언스·감사·위험 분야 5년 이상의 경험을 요구한다.', 'ISO·NIST·SOX·개인정보 규제의 통제 적용 경험을 요구한다.'],
    lawsAndStandards: ['ISO 27001', 'NIST', 'SOX', 'GDPR', 'HIPAA'], partnerTeams: ['감사', '법무', 'IT', '벤더 담당 조직'], deliverables: ['통제 증적', '감사 대응 자료', '시정조치 기록'],
    sourceHeadings: ['Responsibilities', 'Qualifications'],
  }),
  complianceHeadspace: postingSource({
    companyName: 'Headspace', originalJobTitle: 'Senior Security & Compliance Analyst',
    url: 'https://job-boards.greenhouse.io/hs/jobs/7964877', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['보안 통제 운영, 감사 증적 수집과 고객 보안 질의 대응을 수행한다.', '정책·위험·개인정보 요구를 제품·법무·엔지니어링과 조율한다.'],
    requirements: ['보안 컴플라이언스와 감사 대응 경험을 요구한다.'],
    partnerTeams: ['법무', '개인정보보호', '제품', '엔지니어링'], deliverables: ['통제 증적', '고객 보안 응답', '정책 문서'],
    sourceHeadings: ['What you will do', 'What you will bring'],
  }),
  complianceTeamSparta: postingSource({
    companyName: '팀스파르타', originalJobTitle: 'Security Compliance Engineer',
    url: 'https://www.wanted.co.kr/wd/319841', market: 'domestic', country: '대한민국', location: '서울', status: 'accessible',
    responsibilities: ['정보보호 인증과 규제 요구사항에 맞춰 통제·정책·증적을 운영한다.', '감사 대응과 발견사항 개선을 관련 조직과 조율한다.'],
    requirements: ['정보보호 컴플라이언스 또는 관리체계 운영 경험을 요구한다.'],
    lawsAndStandards: ['ISMS-P'], partnerTeams: ['개발', '인프라', '법무'], deliverables: ['인증 증적', '정책·절차', '개선과제'], limitations: ['페이지는 열렸으나 현재 접수 상태를 별도 문구로 확정하지 못해 accessible로 분류했다.'],
  }),
  complianceHyperconnect: postingSource({
    companyName: '하이퍼커넥트', originalJobTitle: 'Security Compliance Analyst',
    url: 'https://www.wanted.co.kr/wd/176731', market: 'domestic', country: '대한민국', location: '서울', status: 'accessible',
    responsibilities: ['보안·개인정보 컴플라이언스 통제와 국내외 인증 대응을 수행한다.', '감사 증적과 개선 항목을 관계 조직과 관리한다.'],
    requirements: ['보안 인증·감사·컴플라이언스 업무 경험을 요구한다.'],
    partnerTeams: ['법무', '개인정보보호', '기술 조직'], deliverables: ['통제 증적', '감사 대응 자료', '개선 계획'], limitations: ['페이지는 열렸으나 현재 접수 상태를 별도 문구로 확정하지 못해 accessible로 분류했다.'],
  }),
  complianceInetum: postingSource({
    companyName: 'Inetum', originalJobTitle: 'Security Compliance Analyst',
    url: 'https://jobs.smartrecruiters.com/Inetum2/744000060032041-security-compliance-analyst', country: '포르투갈', location: 'Lisbon', employmentType: 'full-time', status: 'accessible',
    responsibilities: ['보안 정책·통제의 준수 여부를 평가하고 감사·인증 활동을 지원한다.', '통제 미비점과 시정조치의 진행 상태를 추적한다.'],
    requirements: ['정보보안 통제·위험·컴플라이언스에 대한 실무 지식을 요구한다.'], deliverables: ['컴플라이언스 평가', '감사 증적', '개선 추적표'], limitations: ['본문과 지원 경로는 확인했지만 현재 접수 중임을 확정할 날짜 정보가 없어 accessible로 분류했다.'],
  }),
  tprmAnthropic: postingSource({
    companyName: 'Anthropic', originalJobTitle: 'Third Party Risk Analyst, Security GRC',
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/5368041008', country: '미국', location: 'San Francisco, CA / Remote-friendly', workMode: 'hybrid', careerLevel: 'senior',
    responsibilities: ['미션 크리티컬·고위험 벤더 포트폴리오의 위험 평가와 잔여위험 결정을 운영한다.', '벤더 통제·증적을 검토하고 발견사항의 담당자·기한·완료를 추적한다.', '벤더 사고 영향 평가와 KPI·KRI 보고를 지원한다.'],
    requirements: ['기술기업에서 제3자 또는 벤더 위험 평가를 처음부터 끝까지 수행한 경험을 요구한다.', '내재·잔여위험, 보완통제, 위험수용과 업무연속성 개념을 요구한다.'],
    preferredQualifications: ['클라우드·데이터센터 벤더 평가 경험', 'SOX·SOC 2·ISO 27001 제3자 통제 경험'], lawsAndStandards: ['SOX', 'SOC 2', 'ISO 27001'], partnerTeams: ['조달', '업무연속성', '개인정보보호', '컴플라이언스'], deliverables: ['벤더 평가', '잔여위험 판단', 'TPRM KPI·KRI', '개선 추적'],
    sourceHeadings: ['Key responsibilities', 'Minimum qualifications', 'Preferred qualifications'],
  }),
  tprmDoorDash: postingSource({
    companyName: 'DoorDash', originalJobTitle: 'Senior Analyst, Third-Party Risk Management (TPRM)',
    url: 'https://job-boards.greenhouse.io/doordashusa/jobs/8056171', country: '미국', location: 'United States / Remote', workMode: 'remote', careerLevel: 'senior',
    responsibilities: ['제3자 위험관리 수명주기와 벤더 보안 실사·평가·개선을 운영한다.', '기술 위험 발견을 비즈니스 영향으로 설명하고 리더십에 보고한다.'],
    requirements: ['기술 중심 제3자 위험관리와 다부서 이해관계자 협업 경험을 요구한다.'],
    preferredQualifications: ['CISA, CISSP 또는 CISM'], partnerTeams: ['조달', '법무', '보안', '경영진'], deliverables: ['벤더 위험 평가', '개선 계획', '경영진 위험 보고'],
    sourceHeadings: ['About the Role', "You're excited about this opportunity because you will", "We're excited about you because"],
  }),
  tprmPayNearMe: postingSource({
    companyName: 'PayNearMe', originalJobTitle: 'Sr. Third Party Risk Specialist',
    url: 'https://job-boards.greenhouse.io/paynearmeinc/jobs/4285410009', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['TPRM 프로그램과 벤더 평가·지속 모니터링·개선 절차를 운영한다.', '조달·법무·사업 조직과 계약 및 벤더 위험 이슈를 조율한다.'],
    requirements: ['제3자 위험 평가와 벤더 통제 검토 경험을 요구한다.'],
    tools: ['Black Kite', 'Responsive', 'Serval', 'n8n'], partnerTeams: ['조달', '법무', '사업 조직'], deliverables: ['벤더 평가', '위험 지표', '개선 추적'],
  }),
  tprmZeta: postingSource({
    companyName: 'Zeta', originalJobTitle: 'Sr Associate - Infosec GRC',
    url: 'https://jobs.lever.co/zeta/8c29bd7b-bbb8-48ad-a601-c425df86ce2f', country: '인도', location: '인도', careerLevel: 'senior', requiredYearsMin: 5, requiredYearsMax: 8,
    responsibilities: ['벤더 온보딩 감사·정기 평가·TPRM 데이터베이스를 포함한 제3자 위험 프로그램을 운영한다.', 'SOC 보고서와 보안 통제를 검토하고 위험·감사 결과를 문서화한다.'],
    requirements: ['정보보안·컴플라이언스 경력 5~8년과 벤더 위험 평가 경험을 요구한다.', 'PCI DSS·ISO 27001·ISO 31000 등 통제 프레임워크 경험을 요구한다.'],
    preferredQualifications: ['CISA, CISM 또는 CISSP'], lawsAndStandards: ['PCI DSS', 'ISO 27001', 'ISO 31000', 'SOC 2'], partnerTeams: ['클라우드 보안', '제품 보안', '사업 조직'], deliverables: ['벤더 온보딩 평가', '정기 벤더 평가', 'TPRM 데이터베이스'],
    sourceHeadings: ['Responsibilities', 'Skills', 'Experience and Qualifications'],
  }),
  privacyAyvens: postingSource({
    companyName: 'Ayvens', originalJobTitle: 'Privacy Officer',
    url: 'https://ayvens.wd3.myworkdayjobs.com/en-US/AyvensCareers/job/Privacy-Officer_JR_10039086-2', country: '네덜란드 / 프랑스', location: 'Amsterdam / Paris', employmentType: 'full-time', careerLevel: 'mid', requiredYearsMin: 1, requiredYearsMax: 5,
    responsibilities: ['개인정보 정책·절차를 설계하고 전사 구현과 통제 효과를 모니터링한다.', '제품·서비스·시스템에 대한 개인정보보호 설계와 고위험 처리 자문을 수행한다.'],
    requirements: ['개인정보보호 실무 1~5년과 EU 개인정보보호 법령 지식을 요구한다.'],
    preferredQualifications: ['IAPP 계열 자격'], lawsAndStandards: ['GDPR'], partnerTeams: ['경영진', '사업 조직', 'IT'], deliverables: ['개인정보 정책', '개인정보 위험 보고', '개인정보보호 설계 자문'],
  }),
  privacyPhs: postingSource({
    companyName: 'Presbyterian Healthcare Services', originalJobTitle: 'Privacy Officer',
    url: 'https://phsorg.wd1.myworkdayjobs.com/en-US/Careers/job/Privacy-Officer_R-3438', country: '미국', location: 'Albuquerque, NM', workMode: 'hybrid', employmentType: 'full-time', careerLevel: 'manager',
    responsibilities: ['의료 개인정보 프로그램의 규제 자문·정책·교육과 위험 전략을 운영한다.', '개인정보 영향평가, 데이터 사고 대응, BAA 검토와 규제기관 대응을 이끈다.'],
    requirements: ['의료 개인정보보호 책임자 또는 동등한 법률·규제 경험을 요구한다.'],
    preferredQualifications: ['CIPP/US'], lawsAndStandards: ['HIPAA'], partnerTeams: ['법무', '계약', '의료', '인사', 'IT', '연구', '컴플라이언스'], deliverables: ['개인정보 영향평가', '개인정보 정책', '사고 대응 기록', '교육 자료'],
  }),
  privacyGdit: postingSource({
    companyName: 'GDIT', originalJobTitle: 'Privacy Officer',
    url: 'https://gdit.wd5.myworkdayjobs.com/External_Career_Site/job/Any-Location--Remote/Privacy-Officer_RQ219273-1', country: '미국', location: 'Remote', workMode: 'remote', employmentType: 'full-time', careerLevel: 'manager', requiredYearsMin: 5,
    responsibilities: ['PHI 보호·정보주체 권리·교육·사고·정책을 포함한 개인정보 컴플라이언스를 총괄한다.', 'IT·법무·컴플라이언스와 기관 개인정보보호 활동을 조율한다.'],
    requirements: ['개인정보 컴플라이언스 5년 이상과 HIPAA 직접 경험 2년 이상을 요구한다.'],
    preferredQualifications: ['CHPS 또는 동등 자격'], lawsAndStandards: ['HIPAA', 'NIST'], partnerTeams: ['IT', '법무', '컴플라이언스'], deliverables: ['개인정보 정책', '사고 기록', '권리 요청 기록'],
  }),
  privacyPipedrive: postingSource({
    companyName: 'Pipedrive', originalJobTitle: 'Data Privacy Officer',
    url: 'https://jobs.lever.co/pipedrive/ae56969e-b2ef-4edd-a2b8-59c1d815a00d', country: '아일랜드', location: 'Dublin', workMode: 'hybrid', employmentType: 'full-time', careerLevel: 'director',
    responsibilities: ['글로벌 개인정보 프로그램과 개인정보·AI 규정 준수 방향을 이끈다.', '제품과 내부 도구의 책임 있는 데이터·AI 사용을 법무·위험·컴플라이언스 조직과 조율한다.'],
    requirements: ['글로벌 개인정보보호와 데이터 보호 책임자 수준의 경험을 요구한다.'],
    lawsAndStandards: ['GDPR'], partnerTeams: ['법무', '리스크', '컴플라이언스', '제품'], deliverables: ['글로벌 개인정보 프로그램', 'AI·개인정보 거버넌스'],
  }),
  privacyFresenius: postingSource({
    companyName: 'Fresenius Medical Care', originalJobTitle: 'HIPAA Privacy Officer',
    url: 'https://freseniusmedicalcare.wd3.myworkdayjobs.com/en-US/fme/job/Waltham-MA-USA/HIPAA-Privacy-Officer_R0258124', country: '미국', location: 'Waltham, MA', workMode: 'remote', employmentType: 'full-time', careerLevel: 'manager', status: 'closed', applicationAvailable: false,
    responsibilities: ['미국 사업의 HIPAA Privacy Officer로서 개인정보 규칙 해석·적용·감독을 담당한다.', 'PHI 처리 자문과 정책·통제 개발을 GRC·의료·IT 조직과 수행한다.'],
    requirements: ['의료 개인정보와 HIPAA 규제에 대한 리더십 경험을 요구한다.'],
    preferredQualifications: ['CIPP/US 또는 CIPP/E'], lawsAndStandards: ['HIPAA'], partnerTeams: ['GRC', '의료', 'IT'], deliverables: ['HIPAA 정책·통제', 'PHI 처리 자문'], limitations: ['공고 본문과 마감일을 확인했으며 2026-07-31 마감으로 closed 처리했다.'],
  }),
  privacyToss: postingSource({
    companyName: '토스페이먼츠', originalJobTitle: 'Privacy Operations Specialist',
    url: 'https://www.wanted.co.kr/wd/355464', market: 'domestic', country: '대한민국', location: '서울', status: 'accessible',
    responsibilities: ['개인정보 처리 절차·정책·점검과 정보주체 요청 대응을 운영한다.', '개인정보 컴플라이언스 개선 과제를 사업·기술 조직과 조율한다.'],
    requirements: ['개인정보보호 운영 또는 컴플라이언스 경험을 요구한다.'], partnerTeams: ['법무', '사업', '개발'], deliverables: ['개인정보 처리 절차', '권리 요청 기록', '점검 결과'], limitations: ['페이지와 본문은 확인했지만 현재 접수 상태를 확정하지 못해 accessible로 분류했다.'],
  }),
  privacyMatch: postingSource({
    companyName: 'Match Group', originalJobTitle: 'Data Privacy Specialist',
    url: 'https://jobs.lever.co/matchgroup/f1248c04-b46b-4641-83a4-1c3bef2c4c19', country: '미국', location: '미국', careerLevel: 'mid',
    responsibilities: ['개인정보 규제 요구와 내부 개인정보 프로세스·문서·요청 처리를 지원한다.', '법무·보안·제품 조직과 개인정보 컴플라이언스 과제를 조율한다.'],
    requirements: ['데이터 개인정보보호 또는 규제 컴플라이언스 경험을 요구한다.'], lawsAndStandards: ['GDPR', 'CCPA'], partnerTeams: ['법무', '보안', '제품'], deliverables: ['개인정보 컴플라이언스 기록', '권리 요청 기록'],
  }),
  privacyMozilla: postingSource({
    companyName: 'Mozilla', originalJobTitle: 'Senior Privacy & Compliance Program Manager',
    url: 'https://job-boards.greenhouse.io/mozilla/jobs/8082547', country: '미국', location: 'Remote', workMode: 'remote', careerLevel: 'senior',
    responsibilities: ['개인정보·컴플라이언스 프로그램의 계획·통제·증적과 개선 과제를 관리한다.', '제품·법무·보안 이해관계자와 개인정보 요구를 실행 가능한 프로그램으로 전환한다.'],
    requirements: ['복수 조직이 참여하는 개인정보 또는 컴플라이언스 프로그램 운영 경험을 요구한다.'], partnerTeams: ['법무', '보안', '제품', '엔지니어링'], deliverables: ['개인정보 프로그램 계획', '통제 증적', '개선 로드맵'],
  }),
})

const consultingSources = Object.freeze({
  consultantMegazone: postingSource({
    companyName: '메가존클라우드', originalJobTitle: '주니어 보안 컨설턴트(GRC Consultant)',
    url: 'https://careerly.co.kr/job/31655', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'junior', status: 'accessible',
    responsibilities: ['고객의 보안 관리체계와 규제 요구를 진단하고 개선 과제를 정리한다.', '정보보호 인증·감사 준비를 위한 문서와 증적을 지원한다.'],
    requirements: ['정보보호·컴플라이언스 기초와 고객 커뮤니케이션 역량을 요구한다.'],
    lawsAndStandards: ['ISMS-P', 'ISO 27001'], partnerTeams: ['고객 보안팀', '감사', '클라우드 조직'], deliverables: ['Gap 분석', '인증 준비 자료', '개선 과제'], limitations: ['본문과 지원 경로는 확인했지만 접수 종료일을 확인하지 못해 accessible로 분류했다.'],
  }),
  consultantDeloitte: postingSource({
    companyName: 'Deloitte', originalJobTitle: 'Cyber Security Consultant / Senior Consultant',
    url: 'https://jobs.deloitte.lu/job/Luxembourg-Cyber-Security-Consultant-Senior-Consultant/1383037533/', country: '룩셈부르크', location: 'Luxembourg', employmentType: 'full-time', careerLevel: 'mid',
    responsibilities: ['고객의 사이버보안 위험·통제·운영 현황을 평가하고 개선 프로그램을 수행한다.', '분석 결과와 실행 권고를 고객 기술·경영 이해관계자에게 전달한다.'],
    requirements: ['사이버보안 컨설팅, 위험평가 또는 보안 통제 경험을 요구한다.'], partnerTeams: ['고객 IT', '고객 리스크', '경영진'], deliverables: ['보안 진단 보고서', '개선 로드맵'],
  }),
  consultantEySenior: postingSource({
    companyName: 'EY', originalJobTitle: 'Senior Cybersecurity Consultant',
    url: 'https://careers.ey.com/ey/job/Tel-Aviv-Senior-Cybersecurity-Consultant-6706703/1262780301/', country: '이스라엘', location: 'Tel Aviv', careerLevel: 'senior',
    responsibilities: ['고객 사이버보안 프로젝트에서 위험·아키텍처·통제 개선 과제를 수행한다.', '고객 현황을 분석하고 기술·관리 권고와 결과 보고서를 작성한다.'],
    requirements: ['사이버보안 프로젝트와 고객 자문 경험을 요구한다.'], partnerTeams: ['고객 보안팀', 'IT', '리스크'], deliverables: ['고객 보안 평가', '권고 보고서'],
  }),
  consultantEasySec: postingSource({
    companyName: '이지시큐', originalJobTitle: 'ISMS 정보보호 컨설턴트 신입/경력',
    url: 'https://m.jobkorea.co.kr/Recruit/GI_Read/49594256', market: 'domestic', country: '대한민국', location: '대한민국', careerLevel: 'entry', status: 'accessible',
    responsibilities: ['고객의 ISMS 관리체계를 점검하고 인증 준비·개선 활동을 지원한다.', '정책·지침·통제 증적과 진단 결과를 문서화한다.'],
    requirements: ['정보보호 관리체계와 문서 작성에 대한 기본 역량을 요구한다.'], lawsAndStandards: ['ISMS-P'], partnerTeams: ['고객 정보보호 조직', '감사'], deliverables: ['ISMS 진단 결과', '인증 준비 문서'], limitations: ['본문은 확인했지만 현재 모집 여부를 확정하지 못해 accessible로 분류했다.'],
  }),
  consultantEyPrivacy: postingSource({
    companyName: 'EY', originalJobTitle: 'Consulting - Cyber Security and Privacy Protection - Senior Associate',
    url: 'https://careers.ey.com/ey/job/Hong-Kong-Consulting-Cyber-Security-and-Privacy-Protection-Senior-Associate-Hong-Kong-Hong/784669601/', country: '홍콩', location: 'Hong Kong', careerLevel: 'senior',
    responsibilities: ['고객의 사이버보안·개인정보 위험과 통제 현황을 평가한다.', '규제 요구와 기술 환경을 반영한 개선 권고와 실행 지원을 제공한다.'],
    requirements: ['사이버보안 또는 개인정보보호 컨설팅 경험을 요구한다.'], partnerTeams: ['고객 보안팀', '개인정보보호', '법무'], deliverables: ['위험 평가', '개선 권고', '컴플라이언스 로드맵'],
  }),
  architectKalles: postingSource({
    companyName: 'Kalles Group', originalJobTitle: 'Senior Security Architect Consultant - Identity',
    url: 'https://job-boards.greenhouse.io/kallesgroup/jobs/8605155002', country: '미국', location: 'Seattle, WA', workMode: 'onsite', careerLevel: 'senior', requiredYearsMin: 15,
    responsibilities: ['엔터프라이즈 IAM·PAM·클라우드 아이덴티티의 목표·참조 아키텍처와 로드맵을 설계한다.', '아키텍처 표준·통합 패턴·마이그레이션 전략을 정의하고 고객 엔지니어링 팀을 지도한다.'],
    requirements: ['보안·아이덴티티 아키텍처 경력 15년 이상과 대규모 전환 리더십을 요구한다.', 'Entra ID·Active Directory·SailPoint·BeyondTrust·Okta 및 인증 프로토콜 경험을 요구한다.'],
    preferredQualifications: ['CISSP, SABSA, TOGAF 또는 SC-300', 'Terraform·Ansible 경험'], tools: ['Terraform', 'Ansible'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], securityProducts: ['Microsoft Entra ID', 'Active Directory', 'SailPoint', 'BeyondTrust', 'Okta'], protocols: ['SAML', 'OAuth 2.0', 'OIDC', 'SCIM', 'LDAP', 'Kerberos'], partnerTeams: ['고객 보안 리더', '클라우드', '엔지니어링', '프로그램 조직'], deliverables: ['목표 아키텍처', '참조 설계', '구현 로드맵', '아키텍처 표준'],
    sourceHeadings: ['WHAT YOU WILL DO', 'Key Responsibilities', 'Required Qualifications', 'Preferred Qualifications'],
  }),
  architectAccenture: postingSource({
    companyName: 'Accenture Federal Services', originalJobTitle: 'Security Architect',
    url: 'https://job-boards.greenhouse.io/accenturefederalservices/jobs/4692591006', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['고객 요구와 위험을 보안 아키텍처 원칙·패턴·통제 설계로 전환한다.', '기술 팀과 아키텍처 검토를 수행하고 보안 설계 결정을 문서화한다.'],
    requirements: ['보안 아키텍처와 고객 기술 자문 경험을 요구한다.'], partnerTeams: ['고객 아키텍처', '엔지니어링', '프로그램 조직'], deliverables: ['보안 아키텍처', '설계 검토', '통제 권고'],
  }),
  architectSkyePoint: postingSource({
    companyName: 'SkyePoint Decisions', originalJobTitle: 'Solutions Architect',
    url: 'https://job-boards.greenhouse.io/skyepointdecisionsinc/jobs/4274560009', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['고객 시스템의 보안 솔루션 아키텍처와 기술 통합 방안을 설계한다.', '아키텍처 문서·기술 제안과 구현 지침을 고객 이해관계자에게 제공한다.'],
    requirements: ['보안 솔루션 설계와 연방 고객 환경의 아키텍처 경험을 요구한다.'], partnerTeams: ['고객 기술팀', '프로그램 관리', '엔지니어링'], deliverables: ['솔루션 아키텍처', '기술 설계서', '구현 지침'],
  }),
  architectCapco: postingSource({
    companyName: 'Capco', originalJobTitle: 'Consultant, Technology Controls & Cyber Security',
    url: 'https://job-boards.greenhouse.io/capco/jobs/8045742', country: '영국', location: 'London', careerLevel: 'mid',
    responsibilities: ['고객의 기술 통제·사이버 위험과 보안 아키텍처 현황을 평가한다.', '통제 설계·거버넌스·개선 로드맵을 고객과 공동 수립한다.'],
    requirements: ['기술 위험·통제·사이버보안 컨설팅 경험을 요구한다.'], partnerTeams: ['고객 리스크', '감사', '기술 조직'], deliverables: ['통제 평가', '보안 아키텍처 권고', '개선 로드맵'],
  }),
  cloudGuidePoint: postingSource({
    companyName: 'GuidePoint Security', originalJobTitle: 'Principal AWS Cloud Security Consultant',
    url: 'https://job-boards.greenhouse.io/guidepointsecurity/jobs/5891994004', country: '미국', location: 'Remote, USA', workMode: 'remote', careerLevel: 'principal', requiredYearsMin: 5, status: 'accessible',
    responsibilities: ['고객 AWS·멀티클라우드의 보안 아키텍처와 참조 모델을 설계한다.', '클라우드 보안 평가·컴플라이언스 맵핑·가드레일 구현과 고객 워크숍을 수행한다.', '보안 로드맵·Gap 분석·아키텍처 다이어그램을 고객에게 제공한다.'],
    requirements: ['AWS 아키텍처 설계·운영 5년 이상과 IAM·네트워크·데이터 보호·자동화 경험을 요구한다.', 'Terraform·CloudFormation·CDK와 Kubernetes 보안 경험을 요구한다.'],
    preferredQualifications: ['CISSP, CCSP, CCSK 또는 AWS 보안 자격'], tools: ['Terraform', 'CloudFormation', 'AWS CDK'], scriptingLanguages: ['Python', 'Bash', 'PowerShell'], cloudPlatforms: ['AWS'], containerPlatforms: ['Kubernetes', 'Amazon EKS'], partnerTeams: ['고객 클라우드', 'DevOps', '컴플라이언스', '보안 운영'], deliverables: ['참조 아키텍처', 'Gap 분석', '클라우드 보안 로드맵', '아키텍처 다이어그램'], limitations: ['일반 GET은 채용 홈으로 이동했으나 브라우저 렌더링으로 직무 본문과 지원 양식을 직접 확인해 accessible로 분류했다.'],
    sourceHeadings: ['Roles and Responsibilities', 'Requirements', 'Education & Certifications'],
  }),
  cloudCyberOne: postingSource({
    companyName: 'CyberOne Security', originalJobTitle: 'Senior Microsoft Cloud Security Consultant',
    url: 'https://jobs.lever.co/cyberonesecurity/5cf433de-608d-48b2-8bd3-15d04d2c281a', country: '미국', location: 'Plano, TX', workMode: 'hybrid', employmentType: 'full-time', careerLevel: 'senior',
    responsibilities: ['고객 Azure·Microsoft 365 보안 아키텍처를 평가·설계·구현한다.', '고객 워크숍·기술 탐색·구현 계획과 사전 영업 솔루션 설계를 수행한다.'],
    requirements: ['Microsoft 클라우드 보안 아키텍처와 고객 컨설팅 경험을 요구한다.'],
    preferredQualifications: ['Microsoft Azure·DevOps, CKA·CKS, CISSP 또는 CCSP 자격'], cloudPlatforms: ['Azure'], containerPlatforms: ['Kubernetes'], securityProducts: ['Microsoft Entra ID', 'Microsoft Defender', 'Microsoft Sentinel', 'Microsoft Purview', 'Microsoft Intune'], partnerTeams: ['고객', '사전 영업', '구현 팀'], deliverables: ['Azure 보안 아키텍처', '구현 계획', 'Statement of Work'],
    sourceHeadings: ['Essential Functions', 'Skills'],
  }),
  cloudCoalfire: postingSource({
    companyName: 'Coalfire', originalJobTitle: 'Principal Google Cloud Security Consultant',
    url: 'https://jobs.lever.co/coalfire/b70070a4-3f1d-46d2-8be9-2e598575ff62', country: '미국', location: 'Remote, USA', workMode: 'remote', employmentType: 'full-time', careerLevel: 'principal', requiredYearsMin: 8,
    responsibilities: ['고객 GCP 환경의 보안 아키텍처·IAM·네트워크·로깅·데이터 보호를 설계하고 운영 전환한다.', '클라우드 보안 평가·현대화 프로젝트와 경영진·아키텍처 리뷰를 이끈다.'],
    requirements: ['보안 컨설팅 8년 이상과 Google Cloud 컨설팅 4년 이상의 경험을 요구한다.', 'GCP 보안 아키텍처와 규제 환경의 보안 운영 경험을 요구한다.'],
    preferredQualifications: ['Google Professional Cloud Security Engineer 또는 Cloud Architect'], cloudPlatforms: ['GCP'], securityProducts: ['Security Command Center', 'Wiz', 'Chronicle'], lawsAndStandards: ['FedRAMP', 'FISMA', 'HIPAA', 'PCI DSS', 'CMMC'], partnerTeams: ['고객 클라우드', 'DevOps', 'SOC', '컴플라이언스'], deliverables: ['클라우드 아키텍처', '평가 보고서', '로드맵', '구현 계획'],
  }),
  cloudAprio: postingSource({
    companyName: 'Aprio', originalJobTitle: 'Azure Security Consultant',
    url: 'https://jobs.lever.co/Aprio/e009606b-a84a-43b8-94e3-600371e0822d', country: '미국', location: '미국', careerLevel: 'mid',
    responsibilities: ['고객 요구를 Azure 아이덴티티·위협 보호·데이터 보호·클라우드 보안 솔루션으로 설계한다.', '고객 워크숍·아키텍처 세션·데모와 구현 지원을 수행한다.'],
    requirements: ['Microsoft 보안 기술 중 복수 영역의 구현·자문 경험을 요구한다.'], cloudPlatforms: ['Azure'], securityProducts: ['Microsoft Entra ID', 'Microsoft Defender for Cloud', 'Microsoft Sentinel', 'Microsoft Purview'], partnerTeams: ['고객', '구현 팀'], deliverables: ['Azure 보안 설계', '워크숍 결과', '구현 권고'],
    sourceHeadings: ["What You'll Do"],
  }),
  grcMegazoneJunior: postingSource({
    companyName: '메가존클라우드', originalJobTitle: 'Junior GRC Consultant',
    url: 'https://www.bzpp.co.kr/biz/businessDetailView/BR260320A00149', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'junior', status: 'accessible',
    responsibilities: ['고객 GRC·보안 관리체계의 Gap 분석과 인증·감사 준비를 지원한다.', '통제 문서와 증적을 정리하고 개선 과제를 추적한다.'], requirements: ['보안 통제·인증·문서화의 기초를 요구한다.'], lawsAndStandards: ['ISMS-P', 'ISO 27001'], partnerTeams: ['고객 보안팀', '감사'], deliverables: ['Gap 분석 보고서', '인증 준비 자료'], limitations: ['개별 공고 본문은 확인했지만 모집 상태를 확정하지 못해 accessible로 분류했다.'],
  }),
  grcMegazoneSenior: postingSource({
    companyName: '메가존클라우드', originalJobTitle: 'Senior GRC Consultant',
    url: 'https://www.bzpp.co.kr/biz/businessDetailView/BR260320A00157', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'senior', status: 'accessible',
    responsibilities: ['고객 규제·인증 요구와 현재 통제를 맵핑하고 성숙도 개선 과제를 이끈다.', '감사·인증 로드맵과 통제 설계를 고객 경영·실무진에게 제시한다.'], requirements: ['GRC 컨설팅과 보안 인증·감사 대응 경험을 요구한다.'], lawsAndStandards: ['ISMS-P', 'ISO 27001'], partnerTeams: ['고객 보안팀', '경영진', '감사'], deliverables: ['통제 설계서', '인증 로드맵', 'Gap 분석'], limitations: ['개별 공고 본문은 확인했지만 모집 상태를 확정하지 못해 accessible로 분류했다.'],
  }),
  grcEy: postingSource({
    companyName: 'EY', originalJobTitle: 'Cybersecurity GRC Consultant',
    url: 'https://careers.ey.com/ey/job/Lisbon-Cybersecurity-GRC-Consultant-LisboaPorto-Lisb-1349-066/1392244333/', country: '포르투갈', location: 'Lisbon / Porto', careerLevel: 'mid',
    responsibilities: ['고객 보안 거버넌스·위험·컴플라이언스 프레임워크를 평가하고 개선한다.', '규제·통제 맵핑과 감사·인증 준비 산출물을 작성한다.'], requirements: ['GRC·위험평가·보안 통제 컨설팅 경험을 요구한다.'], partnerTeams: ['고객 리스크', '감사', 'IT'], deliverables: ['GRC 평가', '통제 맵핑', '개선 로드맵'],
  }),
  grcAon: postingSource({
    companyName: 'Aon Korea', originalJobTitle: 'Cyber Risk Technical Consultant',
    url: 'https://www.jobkorea.co.kr/Recruit/GI_Read/49354324', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'mid', status: 'accessible',
    responsibilities: ['고객 사이버 위험과 통제 성숙도를 평가하고 위험 완화 방안을 제안한다.', '분석 결과를 고객 의사결정용 보고서와 개선 과제로 정리한다.'], requirements: ['사이버 위험평가·기술 통제·고객 자문 경험을 요구한다.'], partnerTeams: ['고객 리스크', '보안팀', '경영진'], deliverables: ['사이버 위험 평가', '기술 통제 권고'], limitations: ['본문은 확인했지만 현재 접수 중임을 확정하지 못해 accessible로 분류했다.'],
  }),
  grcPwc: postingSource({
    companyName: '삼일PwC', originalJobTitle: 'Risk Assurance 보안전문가',
    url: 'https://www.pwc.com/kr/ko/career/experienced/r260428.html', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'senior',
    responsibilities: ['고객 정보보호 통제·위험·감사 준비 상태를 평가하고 개선을 자문한다.', 'Risk Assurance 프로젝트의 평가 근거와 고객 보고서를 작성한다.'], requirements: ['정보보호·IT 통제·감사 또는 위험 자문 경험을 요구한다.'], partnerTeams: ['고객 감사', '리스크', 'IT'], deliverables: ['통제 평가', '감사 보고서', '개선 권고'],
  }),
  pentestActDigital: postingSource({
    companyName: 'act digital', originalJobTitle: 'Security Testing Consultant (GER)',
    url: 'https://jobs.smartrecruiters.com/AlterSolutions/744000042593811-security-testing-consultant-ger-', country: '독일', location: '독일', careerLevel: 'mid',
    responsibilities: ['애플리케이션·인프라 보안 테스트를 수행하고 재현 가능한 취약점 Finding을 작성한다.', '고객에게 영향·완화책을 설명하고 수정 후 재시험을 수행한다.'], requirements: ['침투 테스트 방법론과 웹·네트워크 취약점 검증 경험을 요구한다.'], securityDomains: ['침투 테스트', '웹 보안', '네트워크 보안'], deliverables: ['취약점 Finding', '완화 권고', '재시험 결과'], partnerTeams: ['고객 개발팀', '인프라팀'],
  }),
  pentestVerSprite: postingSource({
    companyName: 'VerSprite', originalJobTitle: 'Sr. Offensive Security Consultant (Alpha Group)',
    url: 'https://job-boards.greenhouse.io/vertalents/jobs/5841905004', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['고객 시스템·애플리케이션에 대한 침투 테스트와 공격 시나리오 검증을 수행한다.', '기술 Finding·영향·개선책을 보고하고 고객에게 결과를 설명한다.'], requirements: ['오펜시브 보안·침투 테스트와 고객 보고 경험을 요구한다.'], securityDomains: ['침투 테스트', '오펜시브 보안'], deliverables: ['침투 테스트 보고서', '기술 Finding', '개선 권고'], partnerTeams: ['고객 보안팀', '개발팀'],
  }),
  pentestLostar: postingSource({
    companyName: 'Lostar', originalJobTitle: 'Penetration Tester',
    url: 'https://jobs.smartrecruiters.com/Lostar/744000103315881-penetration-tester', country: '튀르키예', location: '튀르키예', careerLevel: 'mid',
    responsibilities: ['웹·모바일·네트워크 대상 침투 테스트와 취약점 재현을 수행한다.', '발견사항의 위험·재현 절차·개선책을 고객 보고서로 제공한다.'], requirements: ['침투 테스트 도구와 웹·네트워크 보안 지식을 요구한다.'], securityDomains: ['침투 테스트', '웹 보안', '모바일 보안'], deliverables: ['침투 테스트 보고서', '재현 절차', '개선 권고'], partnerTeams: ['고객 기술팀'],
  }),
  pentestPhiladelphia: postingSource({
    companyName: 'Philadelphia Company', originalJobTitle: 'Remote Penetration Tester',
    url: 'https://jobs.smartrecruiters.com/PhiladelphiaComapny/743999660908950-remote-penetration-tester', country: '미국', location: 'Remote', workMode: 'remote', careerLevel: 'mid',
    responsibilities: ['원격 침투 테스트를 계획·수행하고 확인된 취약점을 검증한다.', '기술·경영 독자를 위한 결과와 완화 방안을 문서화한다.'], requirements: ['침투 테스트와 보안 평가 경험을 요구한다.'], securityDomains: ['침투 테스트'], deliverables: ['테스트 계획', '취약점 보고서', '완화 권고'], partnerTeams: ['고객 보안팀'],
  }),
  pentestPingWind: postingSource({
    companyName: 'PingWind', originalJobTitle: 'Penetration Tester',
    url: 'https://jobs.lever.co/pingwind/3126f965-7dcc-473c-beb0-673acd4a2d8f', country: '미국', location: '미국', careerLevel: 'mid',
    responsibilities: ['허가된 시스템의 침투 테스트와 취약점 검증을 수행한다.', '발견사항·영향·개선 방안을 보고하고 수정 결과를 확인한다.'], requirements: ['침투 테스트 방법론·도구와 명확한 보고서 작성 역량을 요구한다.'], securityDomains: ['침투 테스트'], deliverables: ['취약점 Finding', '침투 테스트 보고서', '재시험 결과'], partnerTeams: ['고객 시스템팀', '보안팀'],
  }),
  dfirGuidePoint: postingSource({
    companyName: 'GuidePoint Security', originalJobTitle: 'Principal DFIR Consultant',
    url: 'https://job-boards.greenhouse.io/guidepointsecurity/jobs/5998251004', country: '미국', location: 'Remote, USA', workMode: 'remote', careerLevel: 'principal', requiredYearsMin: 8,
    responsibilities: ['랜섬웨어·APT·내부자 위협 등 고심각도 고객 사고 조사를 이끈다.', '호스트·네트워크·클라우드 포렌식과 악성코드 분류를 수행하고 조사 방법론을 개선한다.', '기술 조사 결과를 경영진·법무 고객에게 전달한다.'],
    requirements: ['DFIR 실무 8년 이상과 IT·정보보호 합산 10년 이상을 요구한다.', '호스트·네트워크·로그·악성코드·클라우드 조사 전문성을 요구한다.'],
    preferredQualifications: ['PowerShell·Python·Bash·Go 자동화', 'GREM·GCFA·GCFE·GCIH 등 자격'], scriptingLanguages: ['PowerShell', 'Python', 'Bash'], programmingLanguages: ['Go'], cloudPlatforms: ['AWS', 'Azure'], securityProducts: ['EDR', 'NDR', 'XDR', 'SIEM', 'Velociraptor'], partnerTeams: ['고객 경영진', '법무', '사고 대응팀'], deliverables: ['사고 조사 보고서', '조사 방법론', '플레이북'],
    sourceHeadings: ['Primary Duties & Responsibilities', 'Required Qualifications', 'Preferred Qualifications'],
  }),
  dfirSurefire: postingSource({
    companyName: 'Surefire Cyber', originalJobTitle: 'Senior Consultant, Digital Forensic and Incident Response (DFIR)',
    url: 'https://job-boards.greenhouse.io/surefirecyber/jobs/5187227007', country: '미국', location: 'Remote, USA', workMode: 'remote', careerLevel: 'senior',
    responsibilities: ['고객 디지털 포렌식·사고 대응 조사를 수행하고 공격 경로와 영향을 분석한다.', '포렌식 증거와 조사 결과를 보고서로 정리하고 고객 복구·완화 의사결정을 지원한다.'],
    requirements: ['클라이언트 대면 포렌식 분석과 독립적인 조사 경험을 요구한다.', '디지털 포렌식 도구와 네트워크 분석 경험을 요구한다.'],
    tools: ['ELK', 'Magnet AXIOM', 'EnCase', 'FTK'], partnerTeams: ['고객', '법무', '보험사', '사고 대응팀'], deliverables: ['포렌식 보고서', '증거 자료', '완화 권고'],
  }),
  dfirMoxfive: postingSource({
    companyName: 'MOXFIVE', originalJobTitle: 'Senior Consultant, DFIR (Wed-Sun)',
    url: 'https://jobs.ashbyhq.com/moxfive/d24689a8-a815-4408-a7eb-da721224d527/', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['고객 침해사고의 분류·조사·격리·복구를 조율한다.', '엔드포인트·로그·클라우드 증거를 분석하고 기술·경영진용 결과를 작성한다.'], requirements: ['DFIR 조사와 고객 대응 경험을 요구한다.'], partnerTeams: ['고객 IT', '법무', '복구팀'], deliverables: ['사고 조사 보고서', '격리·복구 계획', '사후 개선 과제'],
  }),
  dfirIdealforce: postingSource({
    companyName: 'IDEALFORCE', originalJobTitle: 'OISP Digital Forensics Consultant (Technical Specialist 4/TS4)',
    url: 'https://jobs.smartrecruiters.com/IDEALFORCELLC/90624791-oisp-digital-forensics-consultant-technical-specialist-4-ts4-39419-', country: '미국', location: 'Columbus, OH', workMode: 'onsite', employmentType: 'contract', careerLevel: 'senior',
    responsibilities: ['컴퓨터·서버·네트워크·모바일 매체의 포렌식 보존·분석을 수행한다.', '침입 원인과 범위를 조사하고 사고 전 준비부터 분류·사후 포렌식까지 대응한다.', '수사 결과와 권고를 상세 보고서로 작성한다.'], requirements: ['사이버 사고 대응·컴퓨터 포렌식·전자증거개시 경험을 요구한다.'], operatingSystems: ['Windows', 'Linux', 'Android', 'macOS', 'iOS'], partnerTeams: ['고객 CISO', '기관 담당자', '법 집행기관'], deliverables: ['포렌식 증거', '조사 보고서', '대응 권고'],
    sourceHeadings: ['Job Description', 'Qualifications'],
  }),
  dfirEndava: postingSource({
    companyName: 'Endava', originalJobTitle: 'Senior Cyber Incident Response Consultant',
    url: 'https://jobs.smartrecruiters.com/Endava/744000113751974-senior-cyber-incident-response-consultant', country: '영국', location: '영국', careerLevel: 'senior', requiredYearsMin: 10,
    responsibilities: ['복잡한 고객 사고의 조사·격리·복구와 SOC·기술 조직의 대응을 조율한다.', '멀웨어·계정 탈취·내부자 위협을 조사하고 탐지·플레이북·자동화를 개선한다.', '사고 기록·감사 추적·사후 검토를 작성한다.'],
    requirements: ['사이버보안 또는 IT 경력 10년 이상과 SOC·사고 대응 경력 6년 이상을 요구한다.', '디지털 포렌식·위협 조사·사고 격리 경험을 요구한다.'],
    preferredQualifications: ['GIAC, CISM, OSCP 또는 CEH'], securityProducts: ['Splunk', 'Microsoft Sentinel', 'CrowdStrike', 'Microsoft Defender', 'SOAR'], frameworks: ['MITRE ATT&CK'], lawsAndStandards: ['GDPR', 'NIS2'], partnerTeams: ['SOC', '위협 인텔리전스', '취약점 관리', 'IT 운영'], deliverables: ['사고 대응 플레이북', '사고 보고서', '사후 검토'],
    sourceHeadings: ['Responsibilities', 'Qualifications', 'Technical Skills'],
  }),
  auditInsight: postingSource({
    companyName: 'Insight Assurance', originalJobTitle: 'SOC 2 Senior Auditor - Philippines',
    url: 'https://job-boards.greenhouse.io/insightassurance/jobs/4414278008', country: '필리핀', location: '필리핀', careerLevel: 'senior',
    responsibilities: ['SOC 2 감사의 계획·통제 테스트·증적 검토와 보고를 수행한다.', '고객 통제 미비점과 시정 권고를 문서화하고 감사 품질을 관리한다.'], requirements: ['IT 통제 또는 SOC 감사 경험과 감사 문서 작성 역량을 요구한다.'], lawsAndStandards: ['SOC 2'], partnerTeams: ['고객 통제 담당자', '감사팀'], deliverables: ['감사 작업지', '통제 테스트', 'SOC 2 보고 자료'],
  }),
  auditImc: postingSource({
    companyName: 'IMC', originalJobTitle: 'Global Senior IT Auditor',
    url: 'https://job-boards.greenhouse.io/imc/jobs/4922844101', country: '네덜란드', location: 'Amsterdam', careerLevel: 'senior',
    responsibilities: ['글로벌 IT 위험 기반 감사의 계획·현장 조사·통제 테스트·보고를 수행한다.', '기술·보안 통제의 설계와 운영 효과를 평가하고 개선을 추적한다.'], requirements: ['IT 감사·위험·통제 평가 경험을 요구한다.'], partnerTeams: ['IT', '보안', '내부감사', '경영진'], deliverables: ['감사 계획', '작업지', '감사 보고서', '개선 추적'],
  }),
  auditSolaris: postingSource({
    companyName: 'Solaris', originalJobTitle: '(Senior) IT Auditor (f/m/d)',
    url: 'https://job-boards.greenhouse.io/solarisbank/jobs/8378932002', country: '독일', location: 'Berlin', careerLevel: 'senior',
    responsibilities: ['IT·정보보호 프로세스의 위험 기반 감사를 수행하고 통제 효과를 평가한다.', '감사 발견사항과 권고를 보고하고 시정조치 이행을 추적한다.'], requirements: ['IT 감사·기술 위험·내부통제 경험을 요구한다.'], partnerTeams: ['IT', '정보보호', '리스크', '경영진'], deliverables: ['IT 감사 보고서', '통제 평가', '시정조치 추적'],
  }),
  auditMedtronic: postingSource({
    companyName: 'Medtronic', originalJobTitle: 'Sr IT Auditor',
    url: 'https://medtronic.wd1.myworkdayjobs.com/en-US/MedtronicCareers/job/Sr-IT-Auditor_R65324', country: '중국', location: 'Shanghai', workMode: 'hybrid', employmentType: 'full-time', careerLevel: 'senior',
    responsibilities: ['IT 감사·자문과 통합 감사 프로젝트를 계획하고 실행한다.', '위험·통제 평가와 감사 근거·결론을 작업지와 보고서로 문서화한다.'], requirements: ['IT 감사 또는 내부통제 평가 경험을 요구한다.'], partnerTeams: ['IT', '재무·운영 감사', '통제 담당자'], deliverables: ['감사 작업지', '통제 평가', '감사 보고서'],
  }),
  auditAptiv: postingSource({
    companyName: 'Aptiv', originalJobTitle: 'IT Auditor',
    url: 'https://aptiv.wd5.myworkdayjobs.com/en-US/APTIV_CAREERS/job/Krakow-Poland/IT-Auditor_J000700096', country: '폴란드', location: 'Krakow', careerLevel: 'mid', requiredYearsMin: 2,
    responsibilities: ['ITGC·애플리케이션 통제·IT SOX와 클라우드·AI·네트워크 보안 감사를 수행한다.', '감사 절차와 발견사항을 문서화하고 관리진 개선 권고를 작성한다.'], requirements: ['IT 감사·IT 보안·정보 위험·IT 거버넌스 경력 2년 이상을 요구한다.'], preferredQualifications: ['CISA, CIA, CISSP, CISM 또는 CIPP'], operatingSystems: ['UNIX', 'Linux', 'Windows'], databases: ['Oracle', 'SQL'], frameworks: ['COBIT', 'ITIL', 'NIST'], lawsAndStandards: ['SOX'], partnerTeams: ['IT', '내부감사', '경영진'], deliverables: ['ITGC 테스트', '감사 작업지', '감사 보고서'],
    sourceHeadings: ['Your Role', 'Your Background', 'Nice to have'],
  }),
})

const appsecSources = Object.freeze({
  architectDaki: postingSource({
    companyName: '다키클라우드코리아', originalJobTitle: 'SW Security Architect (Product Security)',
    url: 'https://www.wanted.co.kr/wd/348707', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'senior', status: 'accessible',
    responsibilities: ['제품의 보안 요구사항·신뢰 경계·보안 아키텍처를 설계하고 설계 검토를 수행한다.', '개발 조직과 위협 모델·취약점 대응·보안 통제를 제품 수명주기에 반영한다.'], requirements: ['소프트웨어 보안 아키텍처와 제품 개발 협업 경험을 요구한다.'], partnerTeams: ['제품', '개발', '클라우드'], deliverables: ['제품 보안 아키텍처', '보안 요구사항', '설계 리뷰'], limitations: ['본문은 확인했지만 현재 접수 상태를 확정하지 못해 accessible로 분류했다.'],
  }),
  architectCoupang: postingSource({
    companyName: '쿠팡', originalJobTitle: 'Staff, Application Security Architecture',
    url: 'https://www.wanted.co.kr/wd/28150', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'staff', status: 'accessible',
    responsibilities: ['대규모 서비스의 애플리케이션 보안 아키텍처와 보안 설계 원칙을 정의한다.', '제품 위협 모델링과 아키텍처 리뷰를 수행하고 엔지니어링 조직의 보안 결정을 지원한다.'], requirements: ['애플리케이션 보안 아키텍처와 분산 서비스 설계 검토 경험을 요구한다.'], partnerTeams: ['제품', '소프트웨어 엔지니어링', '플랫폼'], deliverables: ['보안 아키텍처 원칙', '위협 모델', '설계 리뷰'], limitations: ['본문은 확인했지만 현재 접수 상태를 확정하지 못해 accessible로 분류했다.'],
  }),
  architectEricsson: postingSource({
    companyName: 'Ericsson-LG', originalJobTitle: 'Product & Information Security Architect',
    url: 'https://jobs.ericsson.com/careers/job/563121775385323', market: 'domestic', country: '대한민국', location: '대한민국', careerLevel: 'senior', status: 'accessible',
    responsibilities: ['제품 보안 요구사항·위험·아키텍처 통제를 정의하고 개발 수명주기에 반영한다.', '보안 설계 검토와 제품 보안 평가를 개발·제품 조직과 수행한다.'], requirements: ['제품·정보보안 아키텍처와 소프트웨어 개발 수명주기 경험을 요구한다.'], partnerTeams: ['제품 관리', '개발', '품질'], deliverables: ['제품 보안 요구사항', '보안 아키텍처', '위험 평가'], limitations: ['공식 채용 페이지의 직무 본문은 확인했으나 현재 접수 가능 여부를 확정하지 못해 accessible로 분류했다.'],
  }),
  architectAptiv: postingSource({
    companyName: 'Aptiv', originalJobTitle: 'Product Security Architect',
    url: 'https://aptiv.wd5.myworkdayjobs.com/en-US/APTIV_CAREERS/job/Product-Security-Architect_J000695241', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['제품 보안 아키텍처·요구사항과 위험 기반 설계 결정을 정의한다.', '시스템·소프트웨어 엔지니어와 위협 분석·설계 검토·보안 검증 방향을 조율한다.'], requirements: ['제품 보안·시스템 아키텍처와 개발 수명주기 경험을 요구한다.'], partnerTeams: ['시스템 엔지니어링', '소프트웨어', '제품'], deliverables: ['제품 보안 아키텍처', '보안 요구사항', '위협 분석'],
  }),
  architectSandisk: postingSource({
    companyName: 'Sandisk', originalJobTitle: 'Product Security Assurance Architect',
    url: 'https://jobs.smartrecruiters.com/Sandisk/744000133423759-product-security-assurance-architect', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['제품 보증 관점의 보안 아키텍처·요구사항·검증 기준을 수립한다.', '제품 설계와 개발 수명주기의 보안 위험·통제를 검토한다.'], requirements: ['제품 보안 아키텍처·보안 보증·개발 프로세스 경험을 요구한다.'], partnerTeams: ['제품', '하드웨어', '소프트웨어', '품질'], deliverables: ['보안 보증 아키텍처', '검증 기준', '설계 검토'],
  }),
  appGuidePoint: postingSource({
    companyName: 'GuidePoint Security', originalJobTitle: 'Application Security Engineer',
    url: 'https://job-boards.greenhouse.io/guidepointsecurity/jobs/6009383004', country: '미국', location: 'Remote, USA', workMode: 'remote', careerLevel: 'mid', requiredYearsMin: 3,
    responsibilities: ['SAST·DAST·SCA를 CI/CD 파이프라인에 통합하고 결과 분류·개선 지원을 수행한다.', '개발팀과 보안 테스트·코드 검토·취약점 수정을 협업한다.'], requirements: ['애플리케이션 보안 경력 3년 이상과 보안 분석 도구 운영 경험을 요구한다.'],
    tools: ['Checkmarx', 'Veracode', 'Snyk', 'Invicti', 'Semgrep', 'Black Duck', 'Burp Suite'], programmingLanguages: ['JavaScript', 'Java', 'C++', 'C#', 'PHP'], scriptingLanguages: ['Python'], frameworks: ['OWASP'], partnerTeams: ['개발', 'DevOps'], deliverables: ['스캔 정책', '취약점 분류', '수정 가이드'],
  }),
  appSmartRent: postingSource({
    companyName: 'SmartRent', originalJobTitle: 'Application Security Engineer',
    url: 'https://job-boards.greenhouse.io/smartrent/jobs/5982565004', country: '미국', location: '미국', careerLevel: 'mid',
    responsibilities: ['보안 코드 검토·위협 모델링과 SAST·DAST·SCA 결과 분류를 수행한다.', 'API 인증·인가·JWT·OAuth와 버그바운티·취약점 개선을 개발팀과 운영한다.'], requirements: ['웹·API 애플리케이션 보안과 AWS 환경의 보안 테스트 경험을 요구한다.'],
    tools: ['SAST', 'DAST', 'SCA', 'Burp Suite'], cloudPlatforms: ['AWS'], protocols: ['JWT', 'OAuth'], frameworks: ['OWASP API Security Top 10'], partnerTeams: ['소프트웨어 엔지니어링', '제품'], deliverables: ['위협 모델', '코드 리뷰', '취약점 수정 가이드'],
  }),
  appReltio: postingSource({
    companyName: 'Reltio', originalJobTitle: 'Staff Application Security Engineer',
    url: 'https://job-boards.greenhouse.io/reltio/jobs/6102991004', country: '미국', location: '미국', careerLevel: 'staff', requiredYearsMin: 8,
    responsibilities: ['제품 보안 아키텍처·위협 모델링·API 보안과 보안 코드 리뷰를 이끈다.', 'SAST·SCA·DAST·비밀 탐지를 CI/CD에 통합하고 취약점 수정을 조율한다.', 'Secure SDLC 기준과 개발자 보안 지원 체계를 운영한다.'], requirements: ['애플리케이션·제품 보안 경력 8년 이상과 코드·API·클라우드 보안 경험을 요구한다.'],
    tools: ['SAST', 'SCA', 'DAST', 'Secrets scanning'], cloudPlatforms: ['AWS'], frameworks: ['OWASP'], partnerTeams: ['제품', '개발', 'DevOps'], deliverables: ['위협 모델', '보안 설계 리뷰', 'SDLC 보안 게이트', '취약점 개선 기록'],
  }),
  appArcadia: postingSource({
    companyName: 'Arcadia', originalJobTitle: 'Application Security Engineer',
    url: 'https://job-boards.greenhouse.io/arcadiacareers/jobs/8482105002', country: '미국', location: '미국', careerLevel: 'mid', requiredYearsMin: 3, requiredYearsMax: 5,
    responsibilities: ['SAST·DAST·SCA의 수명주기와 CI/CD 보안 자동화를 운영한다.', '위협 모델링·보안 챔피언·취약점 분류와 개발팀 수정 지원을 수행한다.'], requirements: ['애플리케이션 보안 경력 3~5년과 CI/CD·Docker·Kubernetes·API 경험을 요구한다.'],
    tools: ['SAST', 'DAST', 'SCA'], containerPlatforms: ['Docker', 'Kubernetes'], frameworks: ['OWASP'], partnerTeams: ['개발', 'DevOps', 'Security Champions'], deliverables: ['스캔 정책', '위협 모델', '취약점 개선 기록'],
  }),
  appHeartflow: postingSource({
    companyName: 'Heartflow', originalJobTitle: 'Application Security Engineer',
    url: 'https://job-boards.greenhouse.io/heartflowinc/jobs/6115903004', country: '미국', location: '미국', careerLevel: 'mid', requiredYearsMin: 5,
    responsibilities: ['Secure SDLC·보안 코드 리뷰·위협 모델링과 SAST·DAST·SCA를 운영한다.', '제품 개발팀과 취약점 우선순위·수정·검증을 조율한다.'], requirements: ['애플리케이션 보안 경력 5년 이상과 개발 수명주기 보안 경험을 요구한다.'],
    tools: ['SAST', 'DAST', 'SCA'], partnerTeams: ['제품 개발', '품질'], deliverables: ['위협 모델', '코드 리뷰', 'SDLC 보안 활동', '취약점 개선 기록'],
  }),
  appAlphaSense: postingSource({
    companyName: 'AlphaSense', originalJobTitle: 'Senior Application Security Engineer',
    url: 'https://job-boards.greenhouse.io/alphasense/jobs/8538758002', country: '미국', location: '미국', careerLevel: 'senior', requiredYearsMin: 6,
    responsibilities: ['SAST·SCA·비밀 탐지·SBOM을 개발 파이프라인에 운영한다.', '위협 모델링과 DAST·API 침투 테스트로 설계·실행 위험을 검증한다.'], requirements: ['애플리케이션 보안 경력 6년 이상과 코드·클라우드·컨테이너 보안 경험을 요구한다.'],
    tools: ['SAST', 'SCA', 'DAST', 'Secrets scanning', 'SBOM', 'Terraform'], containerPlatforms: ['Kubernetes'], frameworks: ['OWASP'], partnerTeams: ['개발', '플랫폼', 'AI·ML 조직'], deliverables: ['SBOM', '위협 모델', 'API 테스트 결과', '취약점 개선 기록'],
  }),
  appGlean: postingSource({
    companyName: 'Glean', originalJobTitle: 'Application Security Engineer',
    url: 'https://job-boards.greenhouse.io/gleanwork/jobs/4612849005', country: '미국', location: '미국', careerLevel: 'mid',
    responsibilities: ['오픈소스 의존성과 CVE를 분석하고 SAST·DAST·의존성 검사를 CI/CD에 통합한다.', '검사 결과를 분류하고 개발 조직의 취약점 수정을 지원한다.'], requirements: ['애플리케이션 보안 자동화와 소프트웨어 의존성 분석 경험을 요구한다.'], tools: ['SAST', 'DAST', 'SCA'], partnerTeams: ['개발', 'DevOps'], deliverables: ['스캔 정책', '의존성 위험 목록', '수정 추적'],
  }),
  appTatari: postingSource({
    companyName: 'Tatari', originalJobTitle: 'Senior Application Security Engineer',
    url: 'https://job-boards.greenhouse.io/tatari/jobs/8578827002', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['SAST·DAST·SCA와 CI/CD 보안 통제를 운영하고 애플리케이션 취약점을 개선한다.', 'API·컨테이너·소프트웨어 공급망·LLM 기능의 보안 검토를 수행한다.'], requirements: ['애플리케이션 보안과 현대적 CI/CD·클라우드 환경 경험을 요구한다.'], tools: ['SAST', 'DAST', 'SCA'], containerPlatforms: ['Docker', 'Kubernetes'], securityDomains: ['API 보안', '소프트웨어 공급망 보안', 'AI 보안'], partnerTeams: ['개발', '플랫폼'], deliverables: ['스캔 정책', '보안 리뷰', '취약점 개선 기록'],
  }),
  appConstructor: postingSource({
    companyName: 'Constructor Knowledge', originalJobTitle: 'Application Security Engineer',
    url: 'https://job-boards.greenhouse.io/constructorknowledg/jobs/4847615101', country: '튀르키예 / 유럽', location: 'Remote', workMode: 'remote', careerLevel: 'mid', requiredYearsMin: 3, requiredYearsMax: 5, status: 'accessible',
    responsibilities: ['웹 애플리케이션·API 위협 모델과 아키텍처 검토를 수행한다.', 'SAST·DAST 파이프라인과 SBOM 생성·활용을 SDLC에 통합한다.', '개발팀의 취약점 수정과 OWASP 기반 보안 교육을 지원한다.'], requirements: ['애플리케이션 보안 경력 3~5년과 웹·API 보안 경험을 요구한다.', 'Python·JavaScript·C#·Go 중 한 언어와 ZAP·Burp·Snyk 계열 도구 경험을 요구한다.'], preferredQualifications: ['CycloneDX·SPDX·SCA와 CI/CD 연동 경험'],
    tools: ['OWASP ZAP', 'Burp Suite', 'Snyk', 'SAST', 'DAST', 'SBOM'], programmingLanguages: ['JavaScript', 'C#', 'Go'], scriptingLanguages: ['Python'], frameworks: ['OWASP'], partnerTeams: ['개발', 'DevOps'], deliverables: ['위협 모델', 'SBOM', 'SAST·DAST 파이프라인', '수정 가이드'], limitations: ['브라우저 렌더링으로 본문과 지원 양식을 확인했지만 일반 GET은 채용 목록으로 이동해 accessible로 분류했다.'],
    sourceHeadings: ['Duties and Responsibilities', 'Qualifications and Experience', 'Preferred Qualifications'],
  }),
  appNinjaTrader: postingSource({
    companyName: 'NinjaTrader', originalJobTitle: 'Staff Security Engineer, Application Security',
    url: 'https://job-boards.greenhouse.io/ninjatrader/jobs/4691521006', country: '미국', location: 'Chicago, IL', workMode: 'hybrid', careerLevel: 'staff',
    responsibilities: ['애플리케이션·API·소프트웨어 공급망 보안 영역과 취약점 개선을 책임진다.', '위협 모델·CI/CD·개발자 워크플로에 보안을 통합하고 SAST·SCA·DAST를 운영한다.'], requirements: ['애플리케이션 보안 프로그램과 개발 조직 협업 경험을 요구한다.'], preferredQualifications: ['API 보안·버그바운티·침투 테스트 경험'], tools: ['SAST', 'SCA', 'DAST'], partnerTeams: ['엔지니어링', '보안 리더십'], deliverables: ['보안 설계 리뷰', 'API 보안 기준', '공급망 통제', '스캔 정책'],
  }),
  appDevRev: postingSource({
    companyName: 'DevRev', originalJobTitle: 'Product Security Engineer',
    url: 'https://job-boards.greenhouse.io/devrev/jobs/5820458004', country: '미국', location: '미국', careerLevel: 'senior', requiredYearsMin: 8,
    responsibilities: ['SaaS 웹·API·클라우드의 수동 보안 테스트와 비즈니스 로직·권한 결함 검증을 수행한다.', '취약점을 개발자와 재현·수정하고 위협 모델·보안 설계 리뷰를 개발 과정에 도입한다.'], requirements: ['애플리케이션·오펜시브·침투 테스트 경력 8년 이상과 웹·API 인증·세션·접근통제 지식을 요구한다.'], tools: ['Burp Suite', 'Nuclei'], cloudPlatforms: ['AWS', 'GCP', 'Azure'], frameworks: ['OWASP'], partnerTeams: ['제품', '엔지니어링'], deliverables: ['API 테스트 결과', '취약점 재현', '수정 검증', '위협 모델'],
  }),
  appCanary: postingSource({
    companyName: 'Canary Technologies', originalJobTitle: 'Senior Application Security Engineer',
    url: 'https://jobs.lever.co/canarytechnologies/5ec9b260-6c2e-4706-9c27-c5e7b948d2e0', country: '미국', location: 'Remote, USA', workMode: 'remote', careerLevel: 'senior', requiredYearsMin: 6,
    responsibilities: ['SAST·DAST·SCA를 CI/CD에 통합하고 API 인증·인가·데이터 보호 기준을 구현한다.', '버그바운티·침투 테스트·자동 스캔 결과를 분류하고 개발팀의 수정을 지원한다.'], requirements: ['보안 엔지니어링·DevSecOps 경력 6년 이상과 웹·API 인증 흐름 경험을 요구한다.'],
    tools: ['GitHub Actions', 'Snyk', 'OWASP ZAP', 'Burp Suite', 'SonarQube', 'Checkmarx'], programmingLanguages: ['Go', 'JavaScript'], scriptingLanguages: ['Python'], cloudPlatforms: ['AWS'], containerPlatforms: ['Kubernetes'], frameworks: ['OWASP'], lawsAndStandards: ['SOC 2', 'ISO 27001'], partnerTeams: ['개발', 'SRE', '인프라', '데이터 엔지니어링'], deliverables: ['API 보안 패턴', '스캔 정책', '취약점 개선 기록'],
  }),
  productLunit: postingSource({
    companyName: '루닛', originalJobTitle: 'Product Security Engineer',
    url: 'https://www.wanted.co.kr/wd/277013', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'mid', status: 'accessible',
    responsibilities: ['제품 위협 모델링·보안 설계 리뷰와 취약점 평가를 수행한다.', '개발팀과 제품 취약점 우선순위·수정·검증을 조율한다.'], requirements: ['제품·애플리케이션 보안과 소프트웨어 개발 협업 경험을 요구한다.'], partnerTeams: ['제품', '개발', 'ML 조직'], deliverables: ['위협 모델', '제품 보안 요구사항', '취약점 대응 기록'], limitations: ['본문은 확인했지만 현재 접수 상태를 확정하지 못해 accessible로 분류했다.'],
  }),
  productWabtec: postingSource({
    companyName: 'Wabtec', originalJobTitle: 'Staff Product Security Specialist',
    url: 'https://jobs.smartrecruiters.com/Wabtec/3743990011165576-product-security-analyst', country: '미국', location: '미국', careerLevel: 'staff',
    responsibilities: ['제품 보안 요구·위험·취약점 평가와 보안 설계 지원을 수행한다.', '제품 개발 조직의 보안 활동과 취약점 대응을 조율한다.'], requirements: ['제품 사이버보안·위험평가·개발 수명주기 경험을 요구한다.'], partnerTeams: ['제품', '소프트웨어', '시스템 엔지니어링'], deliverables: ['제품 위험 평가', '보안 요구사항', '취약점 대응 기록'],
  }),
  productMedtronic: postingSource({
    companyName: 'Medtronic', originalJobTitle: 'Sr. Product Security Engineer',
    url: 'https://medtronic.wd1.myworkdayjobs.com/en-US/MedtronicCareers/job/Galway-County-Galway-Ireland/Sr-Product-Security-Engineer_R70876-1', country: '아일랜드', location: 'Galway', careerLevel: 'senior', status: 'closed', applicationAvailable: false,
    responsibilities: ['의료 제품의 위협 모델링·보안 위험 평가와 설계 검토를 수행한다.', '제품 수명주기의 취약점 개선과 보안 문서를 개발·품질 조직과 관리한다.'], requirements: ['제품 보안 엔지니어링과 규제 제품 개발 경험을 요구한다.'], partnerTeams: ['제품 개발', '품질', '규제'], deliverables: ['위협 모델', '제품 보안 위험 평가', '보안 설계 리뷰'], limitations: ['공고 본문은 확인했으며 명시된 2026-07-27 마감일이 지나 closed로 분류했다.'],
  }),
  psirtAdi: postingSource({
    companyName: 'Analog Devices', originalJobTitle: 'Product Security Incident Response Engineer',
    url: 'https://analogdevices.wd1.myworkdayjobs.com/en-US/External/job/Product-Security-Incident-Response-Engineer_R261554', country: '미국', location: '미국', careerLevel: 'mid',
    responsibilities: ['외부·내부 제품 취약점 신고를 접수·분류·분석하고 제품팀 수정을 조율한다.', '제품 보안 권고와 고객 커뮤니케이션·취약점 대응 기록을 작성한다.'], requirements: ['제품 취약점 분석·PSIRT·소프트웨어 또는 하드웨어 보안 경험을 요구한다.'], partnerTeams: ['제품 엔지니어링', '법무', '고객 지원'], deliverables: ['취약점 분류 기록', '제품 보안 권고', '수정 추적'],
  }),
  psirtRollsRoyce: postingSource({
    companyName: 'Rolls-Royce Power Systems', originalJobTitle: 'Product Security Engineer - Vulnerability Reporting',
    url: 'https://rollsroyce.wd3.myworkdayjobs.com/en-US/rrpowersystems/job/Product-Security-Engineer---Vulnerability-Reporting--m-w-d-_JR6143083-1', country: '독일', location: '독일', careerLevel: 'mid',
    responsibilities: ['제품 취약점 신고의 평가·우선순위·수정 상태를 관리한다.', '고객용 보안 권고와 취약점 보고·공개 절차를 제품 조직과 조율한다.'], requirements: ['제품 취약점 관리와 기술 문서·이해관계자 조율 경험을 요구한다.'], partnerTeams: ['제품 개발', '고객 지원', '법무'], deliverables: ['취약점 보고', '보안 권고', '수정 추적'],
  }),
  psirtNxp: postingSource({
    companyName: 'NXP', originalJobTitle: 'Product Security Incident Response Manager (m/f/d)',
    url: 'https://nxp.wd3.myworkdayjobs.com/en-US/careers/job/Product-Security-Incident-Response-Manager--m-f-d-_R-10061457', country: '벨기에 / 루마니아 / 프랑스 / 영국', location: 'Leuven / Bucharest / Toulouse / Gratkorn / Glasgow', careerLevel: 'manager', requiredYearsMin: 3,
    responsibilities: ['제품 취약점과 제3자 사전 통지를 식별·분류하고 수정·고객 안내를 조율한다.', '제품 보안 사고의 영향·심각도·완화 정보를 문서화한다.'], requirements: ['하드웨어·소프트웨어 제품의 PSIRT·조사·취약점 관리 경력 3년 이상을 요구한다.'], partnerTeams: ['제품 엔지니어링', '제품 관리', '보안팀'], deliverables: ['취약점 분류', '제품 보안 권고', '완화 지침'],
  }),
  psirtQualys: postingSource({
    companyName: 'Qualys', originalJobTitle: 'Senior Vulnerability Analyst',
    url: 'https://qualys.wd5.myworkdayjobs.com/en-US/Careers/job/Senior-Vulnerability-Analyst_R0004671', country: '인도', location: 'Pune', careerLevel: 'senior',
    responsibilities: ['PSIRT에서 제품 취약점의 발견·분류·분석·수정 추적을 수행한다.', '소스코드로 악용 가능성을 분석하고 탐지 로직·정확한 보안 권고를 작성한다.'], requirements: ['제품 취약점 분석과 소스코드·악용 가능성 평가 경험을 요구한다.'], preferredQualifications: ['보안 연구·CTF·공개 연구 또는 오픈소스 기여'], partnerTeams: ['제품 엔지니어링', 'PSIRT 리드'], deliverables: ['취약점 분석', '탐지 로직', '보안 권고', '수정 추적'],
  }),
  psirtSensata: postingSource({
    companyName: 'Sensata Technologies', originalJobTitle: 'Product Cyber Security Engineer',
    url: 'https://sensata.wd1.myworkdayjobs.com/en-US/Sensata-Careers/job/Product-Cyber-Security-Engineer_IRC97322', country: '영국', location: 'Swindon', careerLevel: 'mid', status: 'closed', applicationAvailable: false,
    responsibilities: ['PSIRT 구성원으로 제품 사고의 탐지·분석·격리·수정을 조율한다.', '제품의 취약점·위험·위협과 보안 코드 리뷰를 수행한다.'], requirements: ['제품 보안·사고 대응·취약점 평가 경험을 요구한다.'], partnerTeams: ['제품 개발', '고객', '제3자 파트너'], deliverables: ['제품 사고 기록', '취약점 평가', '수정 추적'], limitations: ['공고 본문은 확인했으나 명시된 2026-05-15 마감일이 지나 closed로 분류했다.'],
  }),
})

const devsecopsSources = Object.freeze({
  devHyundai: postingSource({
    companyName: '현대캐피탈', originalJobTitle: 'Cloud DevSecOps Engineer',
    url: 'https://recruit.wanted.co.kr/wd/353113', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'mid', status: 'accessible',
    responsibilities: ['클라우드 개발·배포 파이프라인에 보안 검사와 정책 게이트를 구축한다.', '클라우드·컨테이너·IaC 보안 통제를 자동화하고 발견사항 개선을 개발팀과 조율한다.'], requirements: ['클라우드·CI/CD·DevSecOps 보안 자동화 경험을 요구한다.'], cloudPlatforms: ['AWS'], containerPlatforms: ['Kubernetes'], tools: ['Terraform'], partnerTeams: ['개발', '클라우드 플랫폼', '보안'], deliverables: ['보안 파이프라인', '정책 코드', '취약점 개선 기록'], limitations: ['본문은 확인했지만 현재 접수 상태를 확정하지 못해 accessible로 분류했다.'],
  }),
  devNorric: postingSource({
    companyName: 'Norric', originalJobTitle: 'DevSecOps Engineer',
    url: 'https://kr.linkedin.com/jobs/view/devsecops-engineer-at-norric-4405303325', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'mid', status: 'accessible',
    responsibilities: ['CI/CD 파이프라인의 코드·의존성·이미지·인프라 보안 검사를 자동화한다.', '개발·플랫폼 조직과 보안 게이트와 취약점 수정 절차를 운영한다.'], requirements: ['DevOps·CI/CD와 보안 도구 통합 경험을 요구한다.'], partnerTeams: ['개발', '플랫폼', '보안'], deliverables: ['DevSecOps 파이프라인', '보안 게이트', '개선 추적'], limitations: ['로그인 없이 개별 공고 본문은 확인했지만 플랫폼에서 현재 접수 여부를 확정하지 못해 accessible로 분류했다.'],
  }),
  devAllegiant: postingSource({
    companyName: 'Allegiant Air', originalJobTitle: 'Principal Engineer, DevSecOps',
    url: 'https://jobs.lever.co/allegiantair/288b8451-0f07-4862-93c8-1dd427f89123', country: '미국', location: '미국', careerLevel: 'principal',
    responsibilities: ['기업 CI/CD와 클라우드 개발 환경의 보안 자동화·게이트·표준을 설계한다.', '애플리케이션·인프라·플랫폼 팀이 재사용할 보안 패턴과 도구를 구축한다.'], requirements: ['DevSecOps·소프트웨어 엔지니어링·CI/CD 보안 리더십 경험을 요구한다.'], partnerTeams: ['개발', '플랫폼', '클라우드', '보안'], deliverables: ['보안 파이프라인', '재사용 보안 패턴', '정책 게이트'],
  }),
  devNyt: postingSource({
    companyName: 'The New York Times', originalJobTitle: 'Senior DevSecOps Engineer, Cybersecurity',
    url: 'https://job-boards.greenhouse.io/thenewyorktimes/jobs/4645245005', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['IAM·비밀정보·엔드포인트·네트워크·탐지 등 보안 서비스를 코드와 자동화로 제공한다.', '위협 모델링·보안 리뷰와 개발 배포 과정의 보안 통제를 구축한다.'], requirements: ['소프트웨어·DevOps·보안 엔지니어링과 자동화 경험을 요구한다.'], partnerTeams: ['개발', '플랫폼', 'IT', '보안 운영'], deliverables: ['셀프서비스 보안 기능', '보안 자동화', '위협 모델'],
  }),
  devMwe: postingSource({
    companyName: 'McDermott Will & Schulte', originalJobTitle: 'Senior DevSecOps Engineer',
    url: 'https://mwe.wd5.myworkdayjobs.com/mwe_careers/job/Senior-DevSecOps-Engineer_R-100755', country: '미국', location: '미국', careerLevel: 'senior', requiredYearsMin: 7,
    responsibilities: ['CI/CD에 코드 스캔·의존성 분석·비밀 탐지·정책 집행을 통합한다.', 'IaC·컨테이너·애플리케이션 보안 자동화와 개발자 지원 도구를 구축한다.'], requirements: ['소프트웨어·DevOps·보안 엔지니어링 경력 7년 이상과 CI/CD·IaC 경험을 요구한다.'], preferredQualifications: ['AWS·Azure·GCP 클라우드 보안 경험'], programmingLanguages: ['Python', 'JavaScript', 'TypeScript', 'Go'], queryLanguages: ['SQL'], tools: ['SAST', 'DAST', 'Secrets scanning'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], partnerTeams: ['개발', 'DevOps', '보안'], deliverables: ['CI/CD 보안 게이트', '비밀 탐지', '정책 자동화'],
  }),
  platformNintex: postingSource({
    companyName: 'Nintex', originalJobTitle: 'Platform Security Engineer',
    url: 'https://www.nintex.com/careers/jobs/?gh_jid=7740326&title=platform-security-engineer', country: '미국', location: '미국', careerLevel: 'mid',
    responsibilities: ['개발·플랫폼 팀이 사용할 보안 서비스·도구와 자동화된 가드레일을 구축한다.', 'CI/CD·클라우드 플랫폼의 보안 통제와 취약점 개선 워크플로를 운영한다.'], requirements: ['보안 플랫폼·클라우드·DevOps 자동화 경험을 요구한다.'], partnerTeams: ['플랫폼 엔지니어링', '개발', '클라우드'], deliverables: ['셀프서비스 보안 플랫폼', 'CI/CD 가드레일', '보안 자동화'],
  }),
  platformGemini: postingSource({
    companyName: 'Gemini', originalJobTitle: 'Staff Platform Security Engineer',
    url: 'https://job-boards.greenhouse.io/gemini/jobs/7905050', country: '미국', location: '미국', careerLevel: 'staff',
    responsibilities: ['AWS·Kubernetes·IaC 환경을 위한 재사용 보안 서비스와 플랫폼 가드레일을 구축한다.', 'CI/CD 보안 게이트·정책 코드와 보안 자동화를 개발팀에 제공한다.'], requirements: ['클라우드·컨테이너·IaC 보안과 Python 또는 Go 자동화 경험을 요구한다.'], programmingLanguages: ['Go'], scriptingLanguages: ['Python'], cloudPlatforms: ['AWS'], containerPlatforms: ['Kubernetes'], tools: ['Terraform'], partnerTeams: ['플랫폼', '개발', '클라우드'], deliverables: ['보안 플랫폼 서비스', '정책 코드', 'CI/CD 보안 게이트'],
  }),
  platformTaekus: postingSource({
    companyName: 'Taekus', originalJobTitle: 'Senior Platform & Security Engineer',
    url: 'https://jobs.ashbyhq.com/taekus/f8bf7189-6e1e-4f2c-83b8-6739e6eddb49', country: '미국', location: '미국', careerLevel: 'senior', requiredYearsMin: 6,
    responsibilities: ['개발자가 사용할 플랫폼·CI/CD·릴리스 자동화와 셀프서비스 워크플로를 구축한다.', '비밀정보·IAM·취약점·PCI/PII 처리 가드레일과 감사 준비를 자동화한다.'], requirements: ['플랫폼·인프라·백엔드 엔지니어링 경력 6년 이상과 AWS·Kubernetes·CI/CD 경험을 요구한다.'], programmingLanguages: ['Python'], cloudPlatforms: ['AWS'], containerPlatforms: ['Docker', 'Kubernetes', 'Amazon EKS'], databases: ['PostgreSQL', 'Redis'], lawsAndStandards: ['PCI DSS', 'SOC 2'], partnerTeams: ['개발', '플랫폼', '감사'], deliverables: ['셀프서비스 플랫폼', '릴리스 자동화', '보안 가드레일'],
  }),
  platformIncluded: postingSource({
    companyName: 'Included Health', originalJobTitle: 'Staff Cloud Security Engineer',
    url: 'https://jobs.lever.co/includedhealth/a7f70c18-72a9-4708-ac49-c0ab9acdf537', country: '미국', location: '미국', careerLevel: 'staff',
    responsibilities: ['클라우드·Kubernetes 보안 가드레일과 Terraform 기반 자동 통제를 구축한다.', '개발·플랫폼 팀에 정책 코드와 셀프서비스 보안 기능을 제공한다.'], requirements: ['클라우드 보안·Terraform·Kubernetes와 소프트웨어 자동화 경험을 요구한다.'], tools: ['Terraform'], cloudPlatforms: ['AWS'], containerPlatforms: ['Kubernetes'], partnerTeams: ['플랫폼', '개발', '클라우드'], deliverables: ['클라우드 보안 가드레일', 'IaC 정책', '셀프서비스 보안 기능'],
  }),
  platformXometry: postingSource({
    companyName: 'Xometry', originalJobTitle: 'Staff Cloud Security Engineer',
    url: 'https://job-boards.greenhouse.io/xometry/jobs/5187664007', country: '미국', location: '미국', careerLevel: 'staff',
    responsibilities: ['클라우드 보안 아키텍처·가드레일과 Terraform/OpenTofu 기반 IaC 통제를 구축한다.', '플랫폼·개발 조직과 클라우드 정책·탐지·개선 자동화를 운영한다.'], requirements: ['클라우드 보안과 IaC 정책·자동화 경험을 요구한다.'], tools: ['Terraform', 'OpenTofu'], cloudPlatforms: ['AWS'], partnerTeams: ['클라우드 플랫폼', '개발'], deliverables: ['IaC 보안 정책', '클라우드 가드레일', '보안 자동화'],
  }),
  iacCyara: postingSource({
    companyName: 'Cyara', originalJobTitle: 'Sr. Security Engineer - Cloud Security',
    url: 'https://jobs.lever.co/cyara/d253403e-abbe-44d7-8cbd-be9f7e2d4d32', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['Terraform IaC 스캔과 정책 코드로 클라우드 구성 위험을 배포 전에 차단한다.', 'OPA·Conftest와 조직 정책을 자동화해 클라우드 가드레일을 운영한다.'], requirements: ['클라우드 보안·Terraform·정책 코드와 CI/CD 통합 경험을 요구한다.'], tools: ['Terraform', 'OPA', 'Conftest'], cloudPlatforms: ['AWS'], partnerTeams: ['클라우드', '플랫폼', 'DevOps'], deliverables: ['IaC 검사 정책', '정책 코드', '클라우드 가드레일'],
  }),
  iacDisqo: postingSource({
    companyName: 'DISQO', originalJobTitle: 'Senior Security Engineer',
    url: 'https://jobs.lever.co/disqo/8c707b13-f878-401a-9e4c-cfd6650b4c27', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['Terraform·CDK·CloudFormation 템플릿의 보안 위험과 잘못된 구성을 검토한다.', 'IaC 정책·CI/CD 게이트를 자동화하고 클라우드 구성 개선을 엔지니어링과 수행한다.'], requirements: ['클라우드·IaC 보안과 Terraform·CDK·CloudFormation 경험을 요구한다.'], tools: ['Terraform', 'AWS CDK', 'CloudFormation'], cloudPlatforms: ['AWS'], partnerTeams: ['플랫폼', 'DevOps', '개발'], deliverables: ['IaC 보안 검사', '정책 게이트', '개선 기록'],
  }),
  containerKia: postingSource({
    companyName: '기아', originalJobTitle: 'Infra Security Engineer (Container/Kubernetes)',
    url: 'https://www.bzpp.co.kr/biz/businessDetailView/BR260428A00185', market: 'domestic', country: '대한민국', location: '서울', careerLevel: 'mid', status: 'accessible',
    responsibilities: ['컨테이너 이미지·레지스트리·Kubernetes RBAC·런타임 보안 통제를 운영한다.', '클러스터 구성·워크로드 정책과 취약점 개선을 플랫폼 조직과 수행한다.'], requirements: ['Kubernetes·컨테이너 보안과 클라우드 인프라 경험을 요구한다.'], containerPlatforms: ['Docker', 'Kubernetes'], partnerTeams: ['클라우드 플랫폼', 'DevOps'], deliverables: ['이미지 보안 정책', 'RBAC 정책', '런타임 가드레일'], limitations: ['개별 공고 본문은 확인했지만 현재 접수 상태를 확정하지 못해 accessible로 분류했다.'],
  }),
  containerCapgemini: postingSource({
    companyName: 'Capgemini', originalJobTitle: 'Kubernetes Security Engineer',
    url: 'https://careers.capgemini.com/job/Mississauga-Kubernetes-Security-Engineer-ON/1377172733/', country: '캐나다', location: 'Mississauga, ON', careerLevel: 'mid',
    responsibilities: ['Kubernetes 클러스터·워크로드·RBAC·네트워크 정책과 런타임 보안을 구현한다.', '컨테이너 이미지와 배포 설정의 취약점·구성 위험을 평가한다.'], requirements: ['Kubernetes·컨테이너·클라우드 보안 실무 경험을 요구한다.'], containerPlatforms: ['Docker', 'Kubernetes'], partnerTeams: ['플랫폼', 'DevOps', '클라우드'], deliverables: ['클러스터 보안 설정', 'RBAC·네트워크 정책', '이미지 평가'],
  }),
  supplyRapidfort: postingSource({
    companyName: 'RapidFort', originalJobTitle: 'Senior OS Engineer — Linux Security & Container Supply Chain',
    url: 'https://job-boards.greenhouse.io/rapidfortinc/jobs/4251657009', country: '미국', location: '미국', careerLevel: 'senior',
    responsibilities: ['Linux 패키지·컨테이너 이미지의 의존성·취약점과 공급망 위험을 분석한다.', '최소화·하드닝·빌드 재현성과 패키지·이미지 보안 개선을 수행한다.'], requirements: ['Linux 배포판·패키지·컨테이너 이미지와 소프트웨어 공급망 경험을 요구한다.'], operatingSystems: ['Linux'], containerPlatforms: ['Docker'], partnerTeams: ['플랫폼', '빌드 엔지니어링'], deliverables: ['이미지·패키지 분석', '공급망 개선', '하드닝 결과'],
  }),
  supplyGitlabSenior: postingSource({
    companyName: 'GitLab', originalJobTitle: 'Senior Backend Engineer, SSCS: Supply Chain',
    url: 'https://job-boards.greenhouse.io/gitlab/jobs/8480580002', country: '글로벌', location: 'Remote', workMode: 'remote', careerLevel: 'senior',
    responsibilities: ['패키지 정책·서명·검증·프로비넌스와 악성 패키지 탐지 기능을 개발한다.', 'SLSA·SBOM·Sigstore 기반 소프트웨어 공급망 통제를 제품에 구현한다.'], requirements: ['백엔드 엔지니어링과 패키지·아티팩트·공급망 보안 경험을 요구한다.'], programmingLanguages: ['Ruby', 'Go'], frameworks: ['SLSA'], tools: ['SBOM', 'Sigstore'], partnerTeams: ['제품', '백엔드', '보안'], deliverables: ['패키지 정책', '아티팩트 서명·검증', '프로비넌스'],
  }),
  supplyGitlabStaff: postingSource({
    companyName: 'GitLab', originalJobTitle: 'Staff Backend Engineer, Software Supply Chain Security',
    url: 'https://job-boards.greenhouse.io/gitlab/jobs/8480559002', country: '글로벌', location: 'Remote', workMode: 'remote', careerLevel: 'staff',
    responsibilities: ['소프트웨어 패키지 정책·프로비넌스·아티팩트 서명과 공급망 보안 제품 방향을 설계한다.', 'SLSA·Sigstore 기반 검증 기능을 대규모 개발 플랫폼에 구현한다.'], requirements: ['스태프 수준 백엔드 설계와 소프트웨어 공급망·패키지 보안 경험을 요구한다.'], programmingLanguages: ['Ruby', 'Go'], frameworks: ['SLSA'], tools: ['Sigstore'], partnerTeams: ['제품', '백엔드', '보안'], deliverables: ['공급망 아키텍처', '프로비넌스', '서명·검증 통제'],
  }),
  secretsGm: postingSource({
    companyName: 'General Motors', originalJobTitle: 'Staff Cybersecurity Engineer - PKI/Secrets Management',
    url: 'https://generalmotors.wd5.myworkdayjobs.com/en-US/Careers_GM/job/Staff-Cybersecurity-Engineer_JR-202603684-1', country: '미국', location: 'Warren, MI / Austin, TX', workMode: 'hybrid', careerLevel: 'staff', requiredYearsMin: 7,
    responsibilities: ['전사 PKI·비밀정보 관리 서비스의 전략·설계·구현·고가용성 운영을 책임진다.', '키·인증서·비밀정보의 전체 수명주기 정책과 HSM 아키텍처를 운영한다.'], requirements: ['엔터프라이즈 비밀정보 관리 플랫폼 경력 7년 이상과 PKI·암호 프로토콜 지식을 요구한다.', 'Vault·AWS Secrets Manager·Azure Key Vault·BeyondTrust 운영 경험을 요구한다.'], preferredQualifications: ['HashiCorp Vault 자격 또는 심화 경험'],
    programmingLanguages: ['Go', 'Rust', 'JavaScript'], scriptingLanguages: ['Python'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], containerPlatforms: ['Kubernetes'], tools: ['HashiCorp Vault', 'AWS Secrets Manager', 'Azure Key Vault', 'Terraform', 'HSM'], lawsAndStandards: ['FIPS 140-2', 'FIPS 140-3', 'PCI DSS'], partnerTeams: ['엔지니어링', '인프라', '보안 리더십'], deliverables: ['비밀정보 플랫폼', '키·인증서 정책', '운영 런북'],
    sourceHeadings: ["What You'll Do", 'Required Qualifications', 'Preferred Qualifications'],
  }),
  secretsHpe: postingSource({
    companyName: 'HPE', originalJobTitle: 'IAM Secrets Management Senior Engineer',
    url: 'https://hpe.wd5.myworkdayjobs.com/en-US/ACJobSite/job/IAM-Secrets-Management-Senior-Engineer_1197908', country: '인도', location: '인도', careerLevel: 'senior', requiredYearsMin: 10,
    responsibilities: ['HashiCorp Vault 중심의 전사 비밀정보 관리 솔루션을 설계·배포·운영한다.', 'IAM·PAM·DevSecOps와 통합해 최소권한·정책·로깅·비밀정보 자동화를 구현한다.'], requirements: ['IT·사이버보안 경력 10년 이상과 비밀정보 관리·PAM 경력 6년 이상을 요구한다.', 'Vault Enterprise와 CyberArk·BeyondTrust·CI/CD·Kubernetes 통합 경험을 요구한다.'],
    scriptingLanguages: ['Python', 'PowerShell', 'Bash'], tools: ['HashiCorp Vault', 'CyberArk', 'BeyondTrust', 'Terraform', 'Jenkins', 'GitHub', 'GitLab'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], containerPlatforms: ['Kubernetes'], lawsAndStandards: ['SOX', 'FedRAMP', 'ISO 27001', 'NIST 800-53'], partnerTeams: ['IAM', 'PAM', 'DevSecOps', '감사'], deliverables: ['Vault 플랫폼', '정책·ACL', '운영 런북', '감사 증적'],
  }),
  secretsFactset: postingSource({
    companyName: 'FactSet', originalJobTitle: 'Senior Cybersecurity Engineer - Secrets Management',
    url: 'https://factset.wd108.myworkdayjobs.com/en-US/FactSetCareers/job/Senior-Cybersecurity-Engineer---Secrets-Management_R25227', country: '인도', location: 'Hyderabad', careerLevel: 'senior', requiredYearsMin: 5,
    responsibilities: ['전사 비밀정보 관리 솔루션을 설계·구현·지원하고 애플리케이션 통합을 수행한다.', 'Vault 접근 정책·자동 비밀 조회·플랫폼 상태 모니터링을 운영한다.'], requirements: ['보안·시스템·소프트웨어 엔지니어링 경력 5년 이상과 비밀정보 플랫폼 운영 경력 5년 이상을 요구한다.', 'Python·Bash·Terraform 자동화와 AWS 구현 경험을 요구한다.'],
    scriptingLanguages: ['Python', 'Bash'], tools: ['HashiCorp Vault', 'Conjur', 'AWS Secrets Manager', 'Azure Key Vault', 'Terraform'], cloudPlatforms: ['AWS'], operatingSystems: ['Windows', 'Linux'], partnerTeams: ['GRC', '개발', '벤더'], deliverables: ['비밀정보 플랫폼', '접근 정책', '통합 자동화', '운영 모니터링'],
  }),
  secretsCvs: postingSource({
    companyName: 'CVS Health', originalJobTitle: 'Senior Secrets Management Engineer - Akeyless',
    url: 'https://cvshealth.wd1.myworkdayjobs.com/CVS_Health_Careers/job/CA---Work-from-home/Senior-Secrets-Management-Engineer---Akeyless_R0881583', country: '미국', location: 'Remote, CA', workMode: 'remote', careerLevel: 'senior', requiredYearsMin: 5,
    responsibilities: ['Akeyless·HashiCorp Vault 비밀정보 플랫폼을 운영하고 애플리케이션·머신 아이덴티티의 온보딩·순환을 자동화한다.', 'CI/CD·Kubernetes·클라우드와 비밀정보 관리 솔루션을 통합한다.'], requirements: ['IAM·PAM 중심 보안 엔지니어링 경력 5년 이상과 비밀정보 자동화 경험을 요구한다.'], tools: ['Akeyless', 'HashiCorp Vault'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], containerPlatforms: ['Kubernetes'], partnerTeams: ['IAM', 'PAM', '애플리케이션', 'DevOps'], deliverables: ['비밀정보 온보딩', '자동 순환', '플랫폼 통합'],
  }),
  secretsSpgi: postingSource({
    companyName: 'S&P Global', originalJobTitle: 'Lead Identity Security Engineer',
    url: 'https://spgi.wd5.myworkdayjobs.com/en-US/SPGI_Internal/job/Lead-Identity-Security-Engineer_324189-1', country: '인도', location: 'Hyderabad', careerLevel: 'lead',
    responsibilities: ['비인간 아이덴티티와 전사 비밀정보 플랫폼의 아키텍처·거버넌스·롤아웃을 이끈다.', '정적 자격증명을 동적·단기 비밀정보로 전환하고 하드코딩된 비밀정보를 줄인다.'], requirements: ['Vault·CyberArk 또는 클라우드 비밀정보 서비스와 머신 인증 프로토콜 지식을 요구한다.'], tools: ['HashiCorp Vault', 'CyberArk', 'AWS Secrets Manager', 'Azure Key Vault'], cloudPlatforms: ['AWS', 'Azure'], protocols: ['OAuth 2.0', 'OIDC', 'mTLS', 'JWT', 'SPIFFE', 'SPIRE'], partnerTeams: ['제품', 'DevOps', '데이터 플랫폼'], deliverables: ['비인간 아이덴티티 아키텍처', '비밀정보 플랫폼', '거버넌스 정책'],
  }),
})

const allSources = Object.freeze({
  ...postingSources,
  ...consultingSources,
  ...appsecSources,
  ...devsecopsSources,
})

function exact(sourceKey, score = 95) {
  return Object.freeze({ sourceKey, level: 'exact', score })
}

function strong(sourceKey, score = 83) {
  return Object.freeze({ sourceKey, level: 'strong', score })
}

const rolePostingPlan = Object.freeze({
  'catalog-ciso': Object.freeze([
    exact('cisoKeenfinity', 97), exact('cisoDefenseUnicorns', 97), exact('cisoBitsight', 97), exact('cisoPcaob', 97), exact('cisoUhn', 96),
  ]),
  'catalog-security-strategy': Object.freeze([
    strong('cisoKeenfinity', 88), strong('cisoDefenseUnicorns', 88), strong('cisoBitsight', 88), strong('cisoPcaob', 88), strong('cisoUhn', 87),
  ]),
  'catalog-grc': Object.freeze([
    exact('grcProtective', 95), exact('grcWhoop', 94), strong('tprmAnthropic', 87), strong('complianceHasbro', 84), strong('complianceHeadspace', 82),
  ]),
  'catalog-cyber-risk': Object.freeze([
    strong('grcProtective', 87), strong('grcWhoop', 87), strong('tprmAnthropic', 88), strong('tprmDoorDash', 86), strong('tprmPayNearMe', 84),
  ]),
  'catalog-compliance': Object.freeze([
    exact('complianceTeamSparta', 96), exact('complianceHyperconnect', 96), exact('complianceInetum', 96), exact('complianceHasbro', 95), exact('complianceHeadspace', 93),
  ]),
  'catalog-tprm': Object.freeze([
    exact('tprmAnthropic', 98), exact('tprmDoorDash', 98), exact('tprmPayNearMe', 96), strong('grcProtective', 86), strong('tprmZeta', 87),
  ]),
  'catalog-privacy-officer': Object.freeze([
    exact('privacyAyvens', 98), exact('privacyPhs', 98), exact('privacyGdit', 98), exact('privacyPipedrive', 97), exact('privacyFresenius', 98),
  ]),
  'catalog-privacy-compliance': Object.freeze([
    exact('privacyToss', 96), exact('privacyMatch', 96), strong('privacyMozilla', 88), strong('privacyAyvens', 86), strong('privacyPipedrive', 86),
  ]),

  'catalog-cybersecurity-consultant': Object.freeze([
    strong('consultantMegazone', 86), exact('consultantDeloitte', 97), exact('consultantEySenior', 97), strong('consultantEasySec', 85), strong('consultantEyPrivacy', 87),
  ]),
  'catalog-security-architecture-consultant': Object.freeze([
    exact('architectKalles', 98), strong('architectAccenture', 88), strong('architectSkyePoint', 84), strong('architectCapco', 82), strong('cloudGuidePoint', 89),
  ]),
  'catalog-cloud-security-consultant': Object.freeze([
    exact('cloudCyberOne', 99), exact('cloudCoalfire', 99), exact('cloudAprio', 98), exact('cloudGuidePoint', 99), strong('architectKalles', 86),
  ]),
  'catalog-grc-consultant': Object.freeze([
    exact('grcMegazoneJunior', 98), exact('grcMegazoneSenior', 98), exact('grcEy', 98), strong('grcAon', 88), strong('grcPwc', 85),
  ]),
  'catalog-pentest-consultant': Object.freeze([
    strong('pentestActDigital', 88), strong('pentestVerSprite', 89), exact('pentestLostar', 96), exact('pentestPhiladelphia', 96), exact('pentestPingWind', 96),
  ]),
  'catalog-dfir-consultant': Object.freeze([
    exact('dfirGuidePoint', 99), exact('dfirSurefire', 99), exact('dfirMoxfive', 98), exact('dfirIdealforce', 96), exact('dfirEndava', 98),
  ]),
  'catalog-it-auditor': Object.freeze([
    strong('auditInsight', 88), exact('auditImc', 98), exact('auditSolaris', 98), exact('auditMedtronic', 98), exact('auditAptiv', 98),
  ]),

  'catalog-product-security-architect': Object.freeze([
    exact('architectDaki', 98), strong('architectCoupang', 89), exact('architectEricsson', 98), exact('architectAptiv', 99), exact('architectSandisk', 98),
  ]),
  'catalog-appsec-engineer': Object.freeze([
    exact('appGuidePoint', 98), exact('appSmartRent', 98), exact('appReltio', 98), exact('appArcadia', 98), exact('appHeartflow', 98),
  ]),
  'catalog-product-security-engineer': Object.freeze([
    exact('productLunit', 98), exact('productWabtec', 96), exact('productMedtronic', 98), strong('appReltio', 88), strong('psirtAdi', 87),
  ]),
  'catalog-ssdlc-engineer': Object.freeze([
    strong('appConstructor', 89), strong('appReltio', 89), strong('appHeartflow', 88), strong('appAlphaSense', 88), strong('appArcadia', 87),
  ]),
  'catalog-sast-dast-sca': Object.freeze([
    strong('appGuidePoint', 89), strong('appGlean', 89), strong('appAlphaSense', 89), strong('appArcadia', 89), strong('appTatari', 89),
  ]),
  'catalog-api-security-engineer': Object.freeze([
    strong('appConstructor', 89), strong('appSmartRent', 89), strong('appDevRev', 89), strong('appCanary', 89), strong('appNinjaTrader', 88),
  ]),
  'catalog-psirt': Object.freeze([
    exact('psirtAdi', 99), strong('psirtRollsRoyce', 89), exact('psirtNxp', 99), strong('psirtQualys', 89), strong('psirtSensata', 88),
  ]),

  'catalog-devsecops-engineer': Object.freeze([
    exact('devHyundai', 98), exact('devNorric', 98), exact('devAllegiant', 98), exact('devNyt', 98), exact('devMwe', 98),
  ]),
  'catalog-cicd-security-engineer': Object.freeze([
    strong('platformNintex', 86), strong('devAllegiant', 89), strong('devNyt', 87), strong('appGuidePoint', 88), strong('devMwe', 89),
  ]),
  'catalog-security-platform-engineer': Object.freeze([
    exact('platformNintex', 99), exact('platformGemini', 99), exact('platformTaekus', 93), strong('platformIncluded', 88), strong('platformXometry', 86),
  ]),
  'catalog-iac-security-engineer': Object.freeze([
    strong('platformGemini', 89), strong('iacCyara', 89), strong('iacDisqo', 88), strong('platformIncluded', 89), strong('platformXometry', 89),
  ]),
  'catalog-devsecops-container-kubernetes': Object.freeze([
    exact('containerKia', 99), exact('containerCapgemini', 99), strong('platformGemini', 88), strong('supplyRapidfort', 87), strong('platformIncluded', 88),
  ]),
  'catalog-supply-chain-engineer': Object.freeze([
    exact('supplyGitlabSenior', 99), exact('supplyGitlabStaff', 99), exact('supplyRapidfort', 94), strong('appConstructor', 88), strong('appNinjaTrader', 88),
  ]),
  'catalog-secrets-engineer': Object.freeze([
    exact('secretsGm', 99), exact('secretsHpe', 99), exact('secretsFactset', 99), exact('secretsCvs', 99), strong('secretsSpgi', 89),
  ]),
})

function matchedEvidenceFor(source) {
  return [
    ...(source.extracted.responsibilities || []),
    ...(source.extracted.deliverables || []).map((label) => `${label} 산출물을 작성하거나 운영한다.`),
  ].slice(0, 4)
}

function foundationMatchCountFor(source) {
  const keys = [
    'tools', 'programmingLanguages', 'scriptingLanguages', 'cloudPlatforms', 'containerPlatforms',
    'operatingSystems', 'securityProducts', 'protocols', 'frameworks', 'lawsAndStandards',
  ]
  return keys.filter((key) => source.extracted[key]?.length).length
}

function enrichedPostingFor(roleId, descriptor, index) {
  const target = roleResearchTargetById[roleId]
  const source = allSources[descriptor.sourceKey]
  if (!target) throw new Error(`Unknown roleId in governance/appsec enrichment: ${roleId}`)
  if (!source) throw new Error(`Unknown source key in governance/appsec enrichment: ${descriptor.sourceKey}`)

  const matchedResponsibilities = matchedEvidenceFor(source)
  return prepareEnrichedPosting({
    id: `enrichment-ga-${roleId.replace(/^catalog-/, '')}-${String(index + 1).padStart(2, '0')}`,
    roleId,
    domainId: target.domainId,
    familyId: target.familyId,
    companyName: source.companyName,
    originalJobTitle: source.originalJobTitle,
    normalizedRoleTitle: target.roleTitle,
    market: source.market,
    country: source.country,
    location: source.location,
    workMode: source.workMode,
    employmentType: source.employmentType,
    careerLevel: source.careerLevel,
    requiredYearsMin: source.requiredYearsMin,
    requiredYearsMax: source.requiredYearsMax,
    source: {
      postingUrl: source.url,
      canonicalUrl: source.url,
      sourceType: source.sourceType,
      checkedDate,
      status: source.status,
      titleVerified: true,
      companyVerified: true,
      bodyVerified: true,
      applicationAvailable: source.applicationAvailable,
      verificationNotes: [
        '개별 공고 URL에서 회사명·직무명·업무 또는 자격요건 본문을 직접 확인했다.',
        source.status === 'closed'
          ? '본문은 남아 있으나 명시된 마감일이 지나 closed로 분류했다.'
          : source.status === 'accessible'
            ? '본문과 지원 경로는 확인했지만 현재 접수 중임을 확정하지 않아 accessible로 분류했다.'
            : '지원 버튼 또는 지원 양식을 확인해 open으로 분류했다.',
      ],
    },
    match: {
      level: descriptor.level,
      score: descriptor.score,
      titleMatch: descriptor.level === 'exact',
      responsibilityMatchCount: matchedResponsibilities.length,
      foundationMatchCount: foundationMatchCountFor(source),
      reasons: descriptor.level === 'exact'
        ? [
            `공고 직무명 “${source.originalJobTitle}”이 대표 역할 “${target.roleTitle}” 또는 원문 직무명 변형과 직접 대응한다.`,
            '공고 본문의 주요 업무가 역할의 실제 업무와 직접 일치한다.',
          ]
        : [
            `공고 직무명은 다르지만 “${target.roleTitle}”의 핵심 업무가 공고의 주요 책임으로 확인된다.`,
            `업무·산출물 근거 ${matchedResponsibilities.length}개를 역할별로 독립 확인했다.`,
          ],
      matchedResponsibilities,
      unmatchedCoreResponsibilities: [],
    },
    extracted: source.extracted,
    evidence: source.evidence,
  })
}

export const domainEnrichedPostings = Object.freeze(Object.entries(rolePostingPlan).flatMap(([roleId, descriptors]) =>
  descriptors.map((descriptor, index) => enrichedPostingFor(roleId, descriptor, index))))

const postingsByRoleId = new Map()
for (const posting of domainEnrichedPostings) {
  const current = postingsByRoleId.get(posting.roleId) || []
  current.push(posting)
  postingsByRoleId.set(posting.roleId, current)
}

function countBy(values, selector, allowed) {
  const counts = Object.fromEntries(allowed.map((value) => [value, 0]))
  for (const item of values) counts[selector(item)] += 1
  return Object.freeze(counts)
}

export const domainRoleResearch = Object.freeze(Object.keys(rolePostingPlan).map((roleId) => {
  const target = roleResearchTargetById[roleId]
  const postings = postingsByRoleId.get(roleId) || []
  const accepted = postings.filter((posting) => posting.source.bodyVerified && ['exact', 'strong'].includes(posting.match.level))
  const verifiedCount = accepted.length
  return Object.freeze({
    ...target,
    checkedDate,
    targetCount: targetCountPerRole,
    candidateCount: postings.length,
    verifiedCount,
    acceptedCount: verifiedCount,
    uniqueUrlCount: new Set(accepted.map((posting) => posting.source.canonicalUrl)).size,
    directOpenedCount: postings.filter((posting) => posting.source.bodyVerified).length,
    currentOpenCount: postings.filter((posting) => posting.source.status === 'open').length,
    accessibleCount: postings.filter((posting) => posting.source.status === 'accessible').length,
    closedCount: postings.filter((posting) => posting.source.status === 'closed').length,
    inaccessibleCandidateCount: 0,
    statusCounts: countBy(postings, (posting) => posting.source.status, ['open', 'accessible', 'closed', 'inaccessible', 'listingOnly', 'loginRequired', 'redirected']),
    matchLevelCounts: countBy(postings, (posting) => posting.match.level, ['exact', 'strong', 'adjacent', 'reject']),
    shortage: verifiedCount < targetCountPerRole,
    shortageReasons: Object.freeze(verifiedCount < targetCountPerRole
      ? [`직접 본문을 확인하고 exact 또는 strong으로 판정한 공고가 ${verifiedCount}/${targetCountPerRole}건이다.`]
      : []),
    searchedQueries: target.searchedQueries,
    rejectedCandidateCount: 0,
    rejectedCandidates: Object.freeze([]),
    postingIds: Object.freeze(accepted.map((posting) => posting.id)),
  })
}))
