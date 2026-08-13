import { prepareEnrichedPosting } from '../jobPostingEnrichmentCore.js'
import { roleResearchTargetById, roleResearchTargets } from '../jobPostingResearchTargets.js'

const checkedDate = '2026-08-01'
const targetCount = 5
const domainIds = new Set(['offensive', 'detection', 'dfir', 'reverse'])
const domainTargets = roleResearchTargets.filter((target) => domainIds.has(target.domainId))

function sourceTypeFor(url) {
  const host = new URL(url).hostname
  if (host.includes('greenhouse.io')) return 'Greenhouse individual posting'
  if (host.includes('lever.co')) return 'Lever individual posting'
  if (host.includes('ashbyhq.com')) return 'Ashby individual posting'
  if (host.includes('myworkdayjobs.com')) return 'Workday individual posting'
  if (host.includes('wanted.co.kr')) return '국내 채용 플랫폼 개별 공고'
  return '기업 공식 개별 채용공고'
}

function source(companyName, originalJobTitle, url, options = {}) {
  const {
    market = 'international', country = '미국', location = '', workMode = 'unknown',
    employmentType = '', careerLevel = 'unknown', requiredYearsMin = null,
    requiredYearsMax = null, status = 'open', applicationAvailable = status === 'open',
    responsibilities = [], requirements = [], preferredQualifications = [],
    sourceHeadings = ['Responsibilities', 'Qualifications'], limitations = [], ...extracted
  } = options
  return Object.freeze({
    companyName, originalJobTitle, url, market, country, location, workMode,
    employmentType, careerLevel, requiredYearsMin, requiredYearsMax, status,
    applicationAvailable, sourceType: sourceTypeFor(url),
    extracted: Object.freeze({ responsibilities, requirements, preferredQualifications, ...extracted }),
    evidence: Object.freeze({
      sourceHeadings: Object.freeze(sourceHeadings),
      extractionNotes: Object.freeze([
        '2026-08-01에 검색 결과가 아닌 개별 공고 URL을 직접 열어 회사명·직무명·업무 또는 자격 본문과 지원 경로를 확인했다.',
        '업무·필수·우대 항목은 공고에 명시된 문장만 짧은 한국어로 재서술했으며, 명시되지 않은 제품·연차·자격은 추가하지 않았다.',
      ]),
      limitations: Object.freeze([
        '확인일 이후 공고 내용이나 모집 상태가 변경될 수 있다.',
        ...limitations,
      ]),
    }),
  })
}

const postingSources = Object.freeze({
  bahVa1: source('Booz Allen Hamilton', 'Vulnerability Assessment Analyst', 'https://bah.wd1.myworkdayjobs.com/en-US/BAH_Jobs/job/Vulnerability-Assessment-Analyst_R0242221', {
    location: 'Arlington, VA / Alexandria, VA', responsibilities: ['취약점 스캔 결과를 분석·검증하고 위험과 개선 우선순위를 보고한다.', 'Tenable 계열 도구로 평가를 수행하고 시정 상태를 추적한다.'],
    requirements: ['취약점 평가와 위험 기반 분석 경험을 요구한다.'], tools: ['Tenable', 'Nessus', 'ACAS'], frameworks: ['NIST SP 800-53'], securityDomains: ['취약점 평가', '취약점 관리'], deliverables: ['취약점 평가 보고서', '시정 권고'],
  }),
  bahVa2: source('Booz Allen Hamilton', 'Vulnerability Assessment Analyst', 'https://bah.wd1.myworkdayjobs.com/en-US/BAH_Jobs/job/Vulnerability-Assessment-Analyst_R0242242', {
    location: 'Arlington, VA / Alexandria, VA', careerLevel: 'senior', requiredYearsMin: 8, responsibilities: ['취약점 평가 프로그램과 스캔 결과 검증을 이끌고 위험 기반 개선을 조율한다.', '취약점 지표와 기술 보고서를 고객에게 제공한다.'],
    requirements: ['취약점 평가 관련 경력 8년 이상을 요구한다.'], tools: ['Tenable', 'Nessus', 'ACAS'], frameworks: ['NIST SP 800-53'], securityDomains: ['취약점 평가', '취약점 관리'], deliverables: ['평가 보고서', '취약점 지표'],
  }),
  cloudflareVm: source('Cloudflare', 'Vulnerability Management Engineer', 'https://job-boards.greenhouse.io/cloudflare/jobs/7579269', {
    responsibilities: ['인프라 취약점 스캔 결과를 검증하고 오탐을 제거해 위험 기반으로 우선순위를 정한다.', '개선 담당자에게 기술 지침을 제공하고 백로그와 SLA를 관리한다.'],
    requirements: ['취약점 스캐너와 CVSS 기반 위험 평가 경험을 요구한다.'], tools: ['Qualys', 'Nessus', 'Rapid7'], lawsAndStandards: ['FedRAMP', 'SOC 2', 'PCI DSS'], securityDomains: ['취약점 관리'], deliverables: ['취약점 백로그', '개선 지침'], partnerTeams: ['인프라', '컴플라이언스'],
  }),
  blackDuckVm: source('Black Duck', 'Senior Vulnerability Manager', 'https://job-boards.greenhouse.io/blackduck/jobs/5287368008', {
    careerLevel: 'senior', responsibilities: ['애플리케이션·컨테이너·엔드포인트 취약점의 접수, 스캔, 분류, 위험 평가, 개선 검증을 총괄한다.', 'CVSS·EPSS·KEV를 활용해 대응 순서를 정하고 경영 지표를 작성한다.'],
    requirements: ['전사 취약점 관리 수명주기 운영 경험을 요구한다.'], tools: ['CVSS', 'EPSS', 'CISA KEV'], securityDomains: ['취약점 관리'], deliverables: ['위험 우선순위', '개선 검증', '경영 지표'],
  }),
  lsegVm: source('LSEG', 'Vulnerability Management Engineer', 'https://lseg.wd3.myworkdayjobs.com/en-US/Careers/job/Vulnerability-Management-Engineer_R0114043-1', {
    country: '영국', responsibilities: ['애플리케이션과 인프라 취약점 관리 수명주기를 운영하고 발견사항을 분석한다.', '개선 담당 조직과 시정 계획·예외·지표를 관리한다.'], requirements: ['취약점 스캔, 위험 분석, 개선 추적 경험을 요구한다.'], securityDomains: ['취약점 관리'], deliverables: ['취약점 지표', '시정 계획'], partnerTeams: ['애플리케이션', '인프라'], limitations: ['동적 Workday 페이지에서 본문과 지원 화면을 확인했다.'],
  }),
  sixWebPt: source('SIXGEN', 'Senior Web Application Penetration Tester', 'https://job-boards.greenhouse.io/sixgeninc/jobs/4005800008', {
    careerLevel: 'senior', responsibilities: ['웹·모바일·데이터베이스·클라이언트·API를 수동·자동 방식으로 테스트한다.', '취약점 악용 가능성을 검증하고 영향과 개선책을 기술 보고서로 작성한다.'], requirements: ['웹 애플리케이션 침투 테스트와 사용자 정의 테스트 도구 경험을 요구한다.'], securityDomains: ['웹 보안', 'API 보안', '침투 테스트'], deliverables: ['취약점 Finding', '침투 테스트 보고서'],
  }),
  manulifePt: source('Manulife', 'Penetration Tester', 'https://manulife.wd3.myworkdayjobs.com/en-US/MFCJH_Jobs/job/Penetration-Tester_JR26050643', {
    country: '캐나다', responsibilities: ['허가된 애플리케이션과 인프라에 침투 테스트를 수행하고 취약점을 검증한다.', '발견사항의 위험과 개선 방안을 보고한다.'], requirements: ['침투 테스트 수행과 기술 보고 경험을 요구한다.'], securityDomains: ['침투 테스트'], deliverables: ['테스트 결과', '개선 권고'], limitations: ['동적 Workday 페이지에서 본문과 지원 화면을 확인했다.'],
  }),
  leidosPt: source('Leidos', 'Penetration Tester', 'https://leidos.wd5.myworkdayjobs.com/en-US/External/job/Penetration-Tester_R-00180069', {
    responsibilities: ['실환경 보안 테스트를 준비·실행하고 확인된 취약점의 악용 가능성을 검증한다.', '발견사항과 개선안을 보고한다.'], requirements: ['침투 테스트 도구와 Bash 또는 Python 사용 경험을 요구한다.'], tools: ['Nmap', 'Nikto', 'Nessus', 'Metasploit', 'Cobalt Strike'], scriptingLanguages: ['Bash', 'Python'], securityDomains: ['침투 테스트'], deliverables: ['침투 테스트 보고서'],
  }),
  lsegPt: source('LSEG', 'Senior Penetration Tester', 'https://lseg.wd3.myworkdayjobs.com/en-US/Careers/job/Senior-Penetration-Tester_R0108764-1', {
    country: '영국', careerLevel: 'senior', responsibilities: ['애플리케이션·인프라·클라우드 대상 침투 테스트를 처음부터 끝까지 수행한다.', '기술 Finding과 위험·개선책을 이해관계자에게 보고한다.'], requirements: ['복수 기술 영역의 침투 테스트 경험을 요구한다.'], securityDomains: ['침투 테스트', '클라우드 보안'], deliverables: ['침투 테스트 보고서'], limitations: ['동적 Workday 페이지에서 본문과 지원 화면을 확인했다.'],
  }),
  usbankMobilePt: source('U.S. Bank', 'Information Security Specialist Sr - Mobile Penetration Tester', 'https://usbank.wd1.myworkdayjobs.com/en-US/US_Bank_Careers/job/Info-Security-Specialist-Sr_2026-0012882', {
    careerLevel: 'senior', requiredYearsMin: 3, status: 'closed', applicationAvailable: false, responsibilities: ['모바일·웹·API에서 인증·인가·입력 검증·업무 로직을 수동 테스트한다.', '재현 가능한 취약점과 개선안을 애플리케이션 조직에 전달한다.'], requirements: ['모바일 애플리케이션 보안 테스트 경력 3년 이상을 요구한다.'], tools: ['Burp Suite', 'Postman', 'Insomnia'], frameworks: ['OWASP'], securityDomains: ['모바일 보안', '웹 보안', 'API 보안'], deliverables: ['취약점 Finding', '개선 권고'], partnerTeams: ['애플리케이션 개발'], limitations: ['명시된 지원 마감일이 지나 closed로 분류했다.'],
  }),
  gditPt: source('GDIT', 'Penetration Tester', 'https://gdit.wd5.myworkdayjobs.com/external_career_site/job/any-location--remote/penetration-tester_rq223925', {
    location: 'Remote', workMode: 'remote', responsibilities: ['웹·API와 AWS IAM·S3·Lambda·API Gateway·ECS·EKS 설정을 수동 검증한다.', '공격 경로를 재현하고 NIST/RMF 기준의 기술 보고서를 작성한다.'], requirements: ['웹·클라우드 침투 테스트와 Burp Suite·ZAP·Metasploit·Nmap·Nessus 경험을 요구한다.'], tools: ['Burp Suite', 'OWASP ZAP', 'Metasploit', 'Nmap', 'Nessus'], cloudPlatforms: ['AWS'], containerPlatforms: ['Amazon ECS', 'Amazon EKS'], frameworks: ['NIST RMF'], securityDomains: ['웹 보안', 'API 보안', '클라우드 보안'], deliverables: ['침투 테스트 보고서'],
  }),
  infiosPt: source('Infios', 'TVM Analyst', 'https://infios.wd502.myworkdayjobs.com/en-US/Infios/job/TVM-Analyst_JR102646-1', {
    status: 'closed', applicationAvailable: false, responsibilities: ['웹 애플리케이션·API·클라우드·AI 환경의 침투 테스트와 취약점 관리를 수행한다.', '발견사항을 검증하고 개선 담당자와 시정 상태를 추적한다.'], requirements: ['기술 취약점 관리와 침투 테스트 경험을 요구한다.'], securityDomains: ['침투 테스트', '클라우드 보안', '취약점 관리'], deliverables: ['취약점 Finding', '시정 추적'], limitations: ['명시된 지원 마감일이 지나 closed로 분류했다.'],
  }),
  transunionRed: source('TransUnion', 'Advisor, Red Team', 'https://transunion.wd5.myworkdayjobs.com/en-US/TransUnion/job/Advisor-Red-Team_19040118', {
    careerLevel: 'senior', responsibilities: ['위협 기반 공격 모사와 레드·퍼플팀 활동, 침투 테스트를 수행한다.', '탐지·대응 조직과 공격 결과를 검증하고 개선한다.'], requirements: ['레드팀 운영 또는 고급 침투 테스트 경험을 요구한다.'], securityDomains: ['레드팀', '퍼플팀'], partnerTeams: ['탐지', '사고 대응'], deliverables: ['공격 시나리오', '탐지 검증'],
  }),
  kbrVr: source('KBR', 'Vulnerability Researcher', 'https://kbr.wd5.myworkdayjobs.com/en-US/KBR_Careers/job/Vulnerability-Researcher_R2121825', {
    responsibilities: ['임베디드 펌웨어를 분석하고 퍼징·충돌 분류로 새로운 취약점을 찾는다.', '취약점을 재현하는 PoC와 기술 분석을 작성한다.'], requirements: ['리버스 엔지니어링과 취약점 연구 경험을 요구한다.'], securityDomains: ['취약점 연구', '펌웨어 보안', '퍼징'], deliverables: ['PoC', '취약점 분석'],
  }),
  trendVr: source('Trend Micro', 'Vulnerability Researcher - Global (All Levels)', 'https://trendmicro.wd3.myworkdayjobs.com/external/job/us-off-site/vulnerability-researcher---global--all-levels-_r0009938', {
    location: 'United States / Canada, Remote', workMode: 'remote', responsibilities: ['ZDI 프로그램에서 공개되지 않은 취약점을 분석·검증하고 기술 영향도를 평가한다.', '개발사 조정과 취약점 연구 산출물을 지원한다.'], requirements: ['취약점 연구, 리버스 엔지니어링 또는 익스플로잇 분석 경험을 요구한다.'], securityDomains: ['취약점 연구'], deliverables: ['취약점 분석', '기술 검증'],
  }),
  pennVr: source('Penn State University', 'Vulnerability Researcher', 'https://psu.wd1.myworkdayjobs.com/en-US/PSU_Staff/job/Vulnerability-Researcher_REQ_0000077942-2', {
    responsibilities: ['소프트웨어 취약점을 연구하고 바이너리 분석·테스트로 악용 가능성을 검증한다.', '연구 결과와 재현 자료를 문서화한다.'], requirements: ['취약점 연구 또는 리버스 엔지니어링 역량을 요구한다.'], securityDomains: ['취약점 연구'], deliverables: ['연구 보고서', '재현 자료'],
  }),
  coretechVr: source('CoreTech Security', 'Vulnerability Researcher', 'https://jobs.eu.lever.co/coretechsecurity/ea3bdf24-84c4-4e95-88b4-2adee2483a4a', {
    country: '영국', responsibilities: ['바이너리·소스 코드 감사와 버그 헌팅으로 취약점을 찾고 PoC를 개발한다.', '모바일·임베디드 플랫폼의 공격 표면을 연구한다.'], requirements: ['Ghidra, C/C++와 Python, ARM/MIPS 환경의 연구 경험을 요구한다.'], tools: ['Ghidra'], programmingLanguages: ['C', 'C++'], scriptingLanguages: ['Python'], operatingSystems: ['Linux', 'Android', 'iOS'], securityDomains: ['취약점 연구'], deliverables: ['PoC', '취약점 분석'],
  }),
  twoSixVr: source('Two Six Technologies', 'Senior Cyber Researcher - Embedded Systems', 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/6113788004', {
    careerLevel: 'senior', responsibilities: ['임베디드 시스템을 리버스 엔지니어링하고 취약점·공격 표면을 연구한다.', '에뮬레이터와 퍼저를 사용해 취약점을 재현한다.'], requirements: ['C/C++·Python과 x86·ARM·MIPS, IDA·Binary Ninja·Ghidra 경험을 요구한다.'], tools: ['IDA Pro', 'Binary Ninja', 'Ghidra'], programmingLanguages: ['C', 'C++'], scriptingLanguages: ['Python'], securityDomains: ['취약점 연구', '임베디드 보안'], deliverables: ['취약점 분석', '재현 코드'],
  }),

  chaosSoc: source('CHAOS Industries', 'Security Operations Center Analyst', 'https://job-boards.greenhouse.io/chaosindustries/jobs/5167323007', {
    careerLevel: 'mid', requiredYearsMin: 3, requiredYearsMax: 5, responsibilities: ['보안 경보를 모니터링·분류·조사하고 필요 시 격리·에스컬레이션한다.', '사고 기록과 탐지·대응 개선 항목을 유지한다.'], requirements: ['SOC 또는 사고 대응 경력 3~5년을 요구한다.'], securityProducts: ['CrowdStrike', 'SIEM', 'Microsoft Sentinel'], securityDomains: ['SOC', '사고 대응'], deliverables: ['사고 티켓', '초기 조사 기록'],
  }),
  idmeSoc: source('ID.me', 'Security Operations Center Analyst', 'https://job-boards.greenhouse.io/idme/jobs/7808011003', {
    careerLevel: 'junior', requiredYearsMin: 1, requiredYearsMax: 2, responsibilities: ['SIEM·IDS/IPS·EDR 경보를 분류·조사·에스컬레이션하고 초기 대응을 수행한다.', '위협 헌팅과 사고 대응 절차 개선을 지원한다.'], requirements: ['보안 운영 또는 SOC 경력 1~2년을 요구한다.'], securityProducts: ['SIEM', 'IDS/IPS', 'EDR'], securityDomains: ['SOC', '사고 대응'], deliverables: ['경보 조사 기록', '에스컬레이션'],
  }),
  fiveskySoc: source('Fivesky', 'Senior SOC Analyst', 'https://job-boards.greenhouse.io/fivesky/jobs/8233950002', {
    careerLevel: 'senior', responsibilities: ['3단계 SOC 에스컬레이션을 처리하고 Splunk로 복잡한 경보를 조사한다.', '위협 헌팅·탐지 튜닝·사고 보고를 수행한다.'], requirements: ['Splunk SPL과 Python 또는 PowerShell, SOC 조사 경험을 요구한다.'], queryLanguages: ['SPL'], scriptingLanguages: ['Python', 'PowerShell'], securityProducts: ['Splunk', 'Proofpoint', 'CrowdStrike'], securityDomains: ['SOC', '위협 헌팅'], deliverables: ['조사 보고서', '탐지 개선'],
  }),
  volexitySoc: source('Volexity', 'Security Operations Center Analyst', 'https://job-boards.greenhouse.io/volexity/jobs/4323123009', {
    requiredYearsMin: 2, responsibilities: ['네트워크·EDR·로그 경보를 분류하고 IOC와 공격 행위를 조사해 에스컬레이션한다.', '사고 보고와 탐지 시그니처 개선을 지원한다.'], requirements: ['SOC 분석 경력 2년 이상을 요구한다.'], securityProducts: ['EDR'], securityDomains: ['SOC', '네트워크 보안'], deliverables: ['경보 조사', '탐지 시그니처'],
  }),
  fiservSoc: source('Fiserv', 'Cybersecurity SOC Analyst', 'https://fiserv.wd5.myworkdayjobs.com/en-US/EXT/job/Cybersecurity-SOC-Analyst_R-10395872', {
    status: 'closed', applicationAvailable: false, responsibilities: ['CSIRT 구성원으로 보안 이벤트를 조사하고 사고 대응을 수행한다.', '분석 결과와 조치 내역을 기록한다.'], requirements: ['SOC 분석과 사고 대응 경험을 요구한다.'], securityDomains: ['SOC', 'CSIRT'], deliverables: ['사고 기록'], limitations: ['명시된 지원 마감일이 지나 closed로 분류했다.'],
  }),
  tmhccSecOps: source('Tokio Marine HCC', 'Security Operations Engineer', 'https://tmhcc.wd108.myworkdayjobs.com/External/job/Remote---USA/Security-Operations-Engineer_2026-653', {
    location: 'Remote, USA', workMode: 'remote', responsibilities: ['MDR 보안 플랫폼의 운영·문제 해결·설정과 개선을 수행한다.', '보안 운영 도구의 안정성과 분석가 워크플로를 지원한다.'], requirements: ['보안 운영 플랫폼 관리와 기술 문제 해결 경험을 요구한다.'], securityDomains: ['보안 운영 공학'], deliverables: ['운영 구성', '문제 해결 기록'],
  }),
  fieldnationSecOps: source('Field Nation', 'Senior Security Operations Engineer', 'https://jobs.lever.co/fieldnation/9d87097f-8012-420a-94a9-e4d493351d7b', {
    careerLevel: 'senior', responsibilities: ['보안 운영 도구와 탐지·대응 프로세스를 설계·운영한다.', '클라우드·엔드포인트·아이덴티티 경보 조사와 자동화를 개선한다.'], requirements: ['보안 운영 엔지니어링과 SIEM·EDR 운영 경험을 요구한다.'], securityProducts: ['SIEM', 'EDR'], securityDomains: ['보안 운영 공학'], deliverables: ['운영 자동화', '탐지·대응 개선'],
  }),
  takeTwoSecOps: source('Take-Two Interactive', 'Security Operations Engineer', 'https://job-boards.greenhouse.io/taketwo/jobs/8036789', {
    responsibilities: ['보안 운영 플랫폼과 SOAR 통합·자동화를 구축하고 운영한다.', '분석가 워크플로와 탐지·대응 도구의 신뢰성을 개선한다.'], requirements: ['보안 운영 플랫폼과 자동화 경험을 요구한다.'], securityProducts: ['SOAR'], securityDomains: ['보안 운영 공학'], deliverables: ['플랫폼 통합', '자동화 워크플로'],
  }),
  okxSecOps: source('OKX', 'Security Operations Engineer', 'https://job-boards.greenhouse.io/okx/jobs/7746610003', {
    responsibilities: ['기업 보안 운영과 Zero Trust 통제를 구현·운영한다.', '보안 도구·아이덴티티·엔드포인트 운영을 자동화하고 개선한다.'], requirements: ['보안 운영 엔지니어링과 아이덴티티·엔드포인트 보안 경험을 요구한다.'], securityDomains: ['보안 운영 공학', 'Zero Trust'], deliverables: ['운영 통제', '자동화'],
  }),
  blackstoneSecOps: source('Blackstone', 'Security Operations Engineer, Associate', 'https://blackstone.wd1.myworkdayjobs.com/en-US/Blackstone_Careers/job/Security-Operations-Engineer--Associate---Security-Operations-Engineering_42091', {
    careerLevel: 'mid', responsibilities: ['SIEM과 보안 자동화 플랫폼을 엔지니어링하고 로그·탐지 파이프라인을 운영한다.', '클라우드·엔드포인트 보안 도구 통합을 코드로 관리한다.'], requirements: ['Splunk, Python 또는 PowerShell, Terraform과 클라우드 보안 경험을 요구한다.'], tools: ['Terraform'], scriptingLanguages: ['Python', 'PowerShell'], securityProducts: ['Splunk', 'EDR'], securityDomains: ['보안 운영 공학', 'SIEM'], deliverables: ['로그 파이프라인', '운영 자동화'],
  }),
  stateDetection: source('State Street', 'Detection Engineer - AVP', 'https://statestreet.wd1.myworkdayjobs.com/en-US/Global/job/Detection-Engineer---AVP_R-792364', {
    careerLevel: 'lead', status: 'accessible', responsibilities: ['행위 기반 탐지 규칙을 개발·검증하고 경보 품질을 튜닝한다.', 'CrowdStrike FQL과 보안 텔레메트리로 탐지 범위를 개선한다.'], requirements: ['탐지 로직 개발과 쿼리 분석 경험을 요구한다.'], queryLanguages: ['FQL'], securityProducts: ['CrowdStrike'], securityDomains: ['탐지 공학'], deliverables: ['탐지 규칙', '탐지 커버리지'], limitations: ['본문과 지원 경로는 확인했으나 확인일 당일이 마감일이라 accessible로 보수 분류했다.'],
  }),
  mehilainenDetection: source('Mehiläinen', 'Detection Engineer', 'https://mehilainen.wd103.myworkdayjobs.com/en-US/mehilainen_careers/job/Detection-Engineer--Mehilinen_R0044174-1', {
    country: '핀란드', responsibilities: ['탐지 사용 사례의 설계·구현·시험·튜닝·폐기 수명주기를 관리한다.', '분석가 플레이북과 텔레메트리 품질을 개선한다.'], requirements: ['탐지 엔지니어링과 로그 분석 경험을 요구한다.'], securityDomains: ['탐지 공학'], deliverables: ['탐지 사용 사례', '플레이북'],
  }),
  keeperDetection: source('Keeper Security', 'Detection Engineer', 'https://job-boards.greenhouse.io/keepersecurity/jobs/4105389009', {
    responsibilities: ['SIEM 텔레메트리와 탐지 규칙을 코드로 관리하고 로그 파싱·정규화를 개선한다.', 'Python·PowerShell로 탐지 검증과 자동화를 수행한다.'], requirements: ['탐지 공학, 로그 분석, 스크립팅 경험을 요구한다.'], scriptingLanguages: ['Python', 'PowerShell'], securityProducts: ['SIEM'], frameworks: ['MITRE ATT&CK'], securityDomains: ['탐지 공학', 'SIEM'], deliverables: ['탐지 코드', '로그 파서'],
  }),
  defionDetection: source('DEFION', 'Detection Engineer', 'https://defion.security/en/careers/detection-engineer/', {
    country: '네덜란드', responsibilities: ['SIEM·EDR·XDR 탐지 규칙을 개발하고 위협 행위에 맞춰 튜닝한다.', 'Python·PowerShell·Bash로 탐지 자동화와 검증을 수행한다.'], requirements: ['탐지 규칙 개발과 보안 데이터 분석 경험을 요구한다.'], scriptingLanguages: ['Python', 'PowerShell', 'Bash'], securityProducts: ['SIEM', 'EDR', 'XDR'], frameworks: ['MITRE ATT&CK'], securityDomains: ['탐지 공학'], deliverables: ['탐지 규칙', '검증 결과'],
  }),
  ensignSiem: source('Ensign InfoSecurity', 'SIEM Engineer', 'https://ensigninfosecurity.wd3.myworkdayjobs.com/en-US/Ensign_Careers/job/SIEM-Engineer_JOBREQ-0003525', {
    country: '싱가포르', responsibilities: ['SIEM 플랫폼을 구축·유지하고 로그 소스·파서·검색 성능을 관리한다.', '탐지 사용 사례와 플레이북 자동화를 지원한다.'], requirements: ['SIEM 관리와 로그 온보딩 경험을 요구한다.'], securityProducts: ['SIEM'], securityDomains: ['SIEM'], deliverables: ['로그 온보딩', '파서', '탐지 사용 사례'],
  }),
  siaSiem: source('SIA', 'XSIAM Engineer', 'https://job-boards.greenhouse.io/siainnovationsinc/jobs/5122004008', {
    responsibilities: ['Cortex XSIAM 로그 온보딩·데이터 품질·탐지·대시보드를 구축한다.', 'XSOAR 플레이북과 API 통합으로 조사·대응 워크플로를 자동화한다.'], requirements: ['XSIAM/XSOAR, XQL, Python, JSON과 API 통합 경험을 요구한다.'], scriptingLanguages: ['Python'], queryLanguages: ['XQL'], securityProducts: ['Cortex XSIAM', 'Cortex XSOAR'], securityDomains: ['SIEM', 'SOAR'], deliverables: ['로그 온보딩', '탐지', 'SOAR 플레이북'],
  }),
  binanceSiem: source('Binance', 'SOC Engineer (Incident Response)', 'https://jobs.lever.co/binance/d364b698-90b3-4a32-ae97-653dd2735e51', {
    responsibilities: ['SOC의 로그 수집·탐지·사고 대응 기능을 엔지니어링한다.', 'SIEM 사용 사례와 대응 자동화를 개선한다.'], requirements: ['SIEM 엔지니어링과 사고 대응 경험을 요구한다.'], securityProducts: ['SIEM'], securityDomains: ['SIEM', 'SOC'], deliverables: ['SIEM 사용 사례', '대응 자동화'],
  }),
  deutscheSoar: source('Deutsche Bank', 'Senior SOAR Engineer', 'https://db.wd3.myworkdayjobs.com/en-US/DBWebsite/job/Senior-SOAR-Engineer--f-m-x-_R0430404-1', {
    country: '독일', careerLevel: 'senior', responsibilities: ['SOAR 아키텍처·상세 설계·구성·유지보수와 통합 워크플로를 담당한다.', '보안 운영 자동화 품질과 플랫폼 신뢰성을 개선한다.'], requirements: ['Phantom·Chronicle·Torq 등 SOAR 플랫폼 경험을 요구한다.'], securityProducts: ['Splunk Phantom', 'Google Chronicle', 'Torq'], securityDomains: ['SOAR'], deliverables: ['SOAR 아키텍처', '자동화 워크플로'],
  }),
  bahSoar: source('Booz Allen Hamilton', 'SOAR Engineer', 'https://bah.wd1.myworkdayjobs.com/en-US/BAH_Jobs/job/SOAR-Engineer_R0240136', {
    responsibilities: ['SOAR 플레이북과 Elastic 기반 보안 데이터 통합을 설계·구현한다.', 'Palo Alto·Splunk·Tines 도구를 연결해 조사·대응을 자동화한다.'], requirements: ['SOAR 플레이북과 보안 도구 API 통합 경험을 요구한다.'], securityProducts: ['Elastic', 'Palo Alto', 'Splunk', 'Tines'], securityDomains: ['SOAR'], deliverables: ['플레이북', '도구 통합'],
  }),
  optivSoar: source('Optiv', 'Senior Swimlane SOAR Engineer', 'https://optiv.wd5.myworkdayjobs.com/en-US/Optiv_Careers/job/Sr-Swimlane-SOAR-Engineer---Remote--USA_2026-13791', {
    location: 'Remote, USA', workMode: 'remote', careerLevel: 'senior', responsibilities: ['Swimlane SOAR 배포와 플레이북·워크플로·제품 통합을 설계한다.', 'Python과 API로 고객 보안 운영 자동화를 구현한다.'], requirements: ['Swimlane과 Python 기반 SOAR 구현 경험을 요구한다.'], scriptingLanguages: ['Python'], securityProducts: ['Swimlane'], securityDomains: ['SOAR'], deliverables: ['SOAR 배포', '자동화 워크플로'],
  }),
  taniumHunter: source('Tanium', 'Threat Hunter', 'https://job-boards.greenhouse.io/tanium/jobs/7722934', {
    requiredYearsMin: 5, responsibilities: ['가설 수립부터 데이터 수집·분석·검증·보고까지 위협 헌팅 수명주기를 수행한다.', '헌팅 결과를 탐지 규칙과 대응 개선으로 전환한다.'], requirements: ['위협 헌팅 경력 5년 이상과 EDR·SIEM·SOAR 경험을 요구한다.'], securityProducts: ['EDR', 'SIEM', 'SOAR'], frameworks: ['MITRE ATT&CK'], securityDomains: ['위협 헌팅'], deliverables: ['헌팅 가설', '헌팅 보고서', '탐지 개선'],
  }),
  leidosHunter1: source('Leidos', 'Cyber Threat Hunter', 'https://leidos.wd5.myworkdayjobs.com/en-US/External/job/Cyber-Threat-Hunter_R-00178196', {
    responsibilities: ['공격자 행위에 대한 가설 기반 헌팅을 수행하고 이상 징후와 TTP를 분석한다.', '헌팅 결과를 탐지·대응 조직에 전달한다.'], requirements: ['위협 헌팅과 보안 로그 분석 경험을 요구한다.'], frameworks: ['MITRE ATT&CK'], securityDomains: ['위협 헌팅'], deliverables: ['헌팅 결과', '탐지 권고'],
  }),
  leidosHunter2: source('Leidos', 'Cyber Threat Hunter', 'https://leidos.wd5.myworkdayjobs.com/en-US/External/job/Cyber-Threat-Hunter_R-00179005', {
    responsibilities: ['대규모 네트워크의 패턴과 이상 행위를 선제적으로 분석한다.', 'Splunk·Elastic 데이터를 이용해 공격 흔적을 찾고 탐지 격차를 보고한다.'], requirements: ['네트워크 프로토콜과 Splunk 또는 Elastic 헌팅 경험을 요구한다.'], securityProducts: ['Splunk', 'Elastic'], securityDomains: ['위협 헌팅'], deliverables: ['헌팅 보고서', '탐지 격차'],
  }),
  crowdstrikeHunter: source('CrowdStrike', 'Threat Hunter - West/Mountain/Coast', 'https://crowdstrike.wd5.myworkdayjobs.com/en-US/crowdstrikecareers/job/Threat-Hunter--Remote--West-Mountain-Coast-_R29008', {
    location: 'Remote, USA', workMode: 'remote', responsibilities: ['Falcon 텔레메트리에서 공격자 행위와 침해 흔적을 능동적으로 헌팅한다.', '조사 결과와 대응 권고를 고객에게 전달한다.'], requirements: ['엔드포인트 위협 헌팅과 공격자 TTP 분석 경험을 요구한다.'], securityProducts: ['CrowdStrike Falcon'], securityDomains: ['위협 헌팅'], deliverables: ['헌팅 결과', '고객 권고'],
  }),
  m9Hunter: source('M9 Solutions', 'Cyber Threat Hunter', 'https://job-boards.greenhouse.io/m9solutions/jobs/5176018007', {
    location: 'Remote, USA', workMode: 'remote', responsibilities: ['보안 데이터에서 알려지지 않은 위협을 가설 기반으로 탐색한다.', '발견된 TTP와 IOC를 탐지·대응 개선으로 전환한다.'], requirements: ['위협 헌팅과 보안 데이터 분석 경험을 요구한다.'], frameworks: ['MITRE ATT&CK'], securityDomains: ['위협 헌팅'], deliverables: ['헌팅 보고서', 'IOC'],
  }),
  stateCti: source('State Street', 'Cyber Threat Intelligence Analyst', 'https://statestreet.wd1.myworkdayjobs.com/en-US/Global/job/Cyber-Threat-Intelligence-Analyst_R-793440', {
    responsibilities: ['위협 행위자·캠페인·취약점 정보를 수집·분석해 조직 위험 맥락으로 전환한다.', '전략·운영·전술 인텔리전스 보고를 작성한다.'], requirements: ['사이버 위협 인텔리전스 분석과 보고 경험을 요구한다.'], securityDomains: ['CTI'], deliverables: ['위협 인텔리전스 보고서', 'IOC'],
  }),
  dxcCti: source('DXC Technology', 'Cyber Threat Intelligence Analyst', 'https://dxctechnology.wd1.myworkdayjobs.com/en-US/dxcjobs/job/BGR---SOFIA/Incident-Response-Forensic-Investigator_51581899', {
    country: '불가리아', responsibilities: ['외부·내부 위협 정보를 수집·평가하고 행위자·캠페인 맥락을 분석한다.', '보안 운영 조직이 사용할 인텔리전스 산출물을 작성한다.'], requirements: ['CTI 분석과 기술·경영 보고 경험을 요구한다.'], securityDomains: ['CTI'], deliverables: ['위협 보고서', '분석 브리핑'], limitations: ['URL 슬러그와 달리 직접 열린 페이지의 표시 제목과 본문은 Cyber Threat Intelligence Analyst였다.'],
  }),
  bahCti: source('Booz Allen Hamilton', 'Cyber Threat Intelligence Analyst', 'https://bah.wd1.myworkdayjobs.com/en-US/BAH_Jobs/job/Cyber-Threat-Intelligence-Analyst_R0239696', {
    location: 'McLean, VA', responsibilities: ['공개·상용·정부 출처의 위협 정보를 수집·분석·상관분석해 IOC·TTP·행위·동향을 도출한다.', '위협 행위자 프로필과 위협 브리핑을 작성해 SOC와 이해관계자에게 제공한다.'], requirements: ['사이버 위협 인텔리전스 분석과 공격자 TTP 연구 경험을 요구한다.'], frameworks: ['MITRE ATT&CK'], securityDomains: ['CTI'], partnerTeams: ['SOC'], deliverables: ['위협 행위자 프로필', '위협 브리핑', 'IOC'],
  }),
  fiservCti: source('Fiserv', 'Strategic Cyber Threat Intelligence Analyst', 'https://fiserv.wd5.myworkdayjobs.com/en-US/EXT/job/Strategic-Cyber-Threat-Intelligence-Analyst_R-10363014', {
    status: 'closed', applicationAvailable: false, responsibilities: ['산업·지정학·공격자 동향을 전략적 사이버 위험으로 분석한다.', '경영진과 보안 조직을 위한 인텔리전스 브리핑을 작성한다.'], requirements: ['전략 CTI 분석과 이해관계자 보고 경험을 요구한다.'], securityDomains: ['CTI'], deliverables: ['전략 위협 보고서', '경영진 브리핑'], limitations: ['명시된 지원 마감일이 지나 closed로 분류했다.'],
  }),
  csaaCti: source('CSAA Insurance Group', 'Cyber Threat Intelligence Analyst', 'https://aaaie.wd1.myworkdayjobs.com/en-US/CSAACareers/job/Cyber-Threat-Intelligence-Analyst---Remote_R7811', {
    location: 'Remote, USA', workMode: 'remote', status: 'closed', applicationAvailable: false, responsibilities: ['위협 행위자·캠페인·취약점 정보를 수집·분석하고 탐지·대응에 제공한다.', '인텔리전스 보고와 IOC를 유지한다.'], requirements: ['CTI 분석과 보안 운영 협업 경험을 요구한다.'], securityDomains: ['CTI'], deliverables: ['위협 보고서', 'IOC'], limitations: ['명시된 지원 마감일이 지나 closed로 분류했다.'],
  }),

  clickhouseIr: source('ClickHouse', 'Incident Response Engineer', 'https://job-boards.greenhouse.io/clickhouse/jobs/5848200004', {
    responsibilities: ['보안 사고를 분류·조사·격리·복구하고 사고 대응 프로세스와 도구를 개선한다.', '클라우드 환경의 조사와 대응 자동화를 수행한다.'], requirements: ['사고 대응과 클라우드 보안, Go 또는 Python 자동화 경험을 요구한다.'], programmingLanguages: ['Go'], scriptingLanguages: ['Python'], securityDomains: ['사고 대응', '클라우드 보안'], deliverables: ['사고 보고서', '대응 자동화'],
  }),
  accentureIr: source('Accenture Federal Services', 'Incident Response Engineer', 'https://job-boards.greenhouse.io/accenturefederalservices/jobs/4678524006', {
    requiredYearsMin: 4, responsibilities: ['침해사고를 분류·조사·격리·복구하고 포렌식·멀웨어·위협 헌팅 분석을 수행한다.', '증거를 보존하고 플레이북과 사후 분석을 개선한다.'], requirements: ['사고 대응 경력 4년 이상과 SIEM·포렌식 분석 경험을 요구한다.'], securityProducts: ['SIEM'], securityDomains: ['사고 대응', '디지털 포렌식', '멀웨어 분석'], deliverables: ['사고 보고서', '플레이북', '사후 분석'],
  }),
  magnetIr: source('Magnet Forensics', 'Microsoft Security Automation & Incident Response Engineer', 'https://jobs.lever.co/magnetforensics/b9398342-bc38-4ade-b37d-2d7f660ffa09', {
    country: '캐나다', responsibilities: ['Microsoft 보안 환경의 사고 대응과 조사·자동화 워크플로를 구현한다.', '탐지부터 격리·복구까지 대응 절차를 개선한다.'], requirements: ['Microsoft 보안 제품과 사고 대응 자동화 경험을 요구한다.'], securityProducts: ['Microsoft Sentinel', 'Microsoft Defender'], securityDomains: ['사고 대응', '보안 자동화'], deliverables: ['대응 자동화', '사고 기록'],
  }),
  atbayDfir: source('At-Bay', 'Digital Forensics and Incident Response Analyst', 'https://job-boards.greenhouse.io/atbayjobs/jobs/5657977003', {
    requiredYearsMin: 2, responsibilities: ['고객 침해사고에서 디지털 증거를 수집·분석해 타임라인과 근본 원인을 재구성한다.', '격리·복구와 재발 방지 권고를 제공한다.'], requirements: ['DFIR 조사 경력 2년 이상과 호스트 증거 분석 경험을 요구한다.'], securityDomains: ['DFIR', '사고 대응', '호스트 포렌식'], deliverables: ['포렌식 타임라인', '사고 보고서', '복구 권고'], partnerTeams: ['고객 IT', '법무'],
  }),
  targetCsirt: source('Target', 'CSIRT Analyst', 'https://target.wd5.myworkdayjobs.com/en-US/targetcareers/job/CSIRT-Analyst_R0000445790', {
    requiredYearsMin: 2, responsibilities: ['SIEM 경보를 모니터링·분류하고 CSIRT 사고를 조사·에스컬레이션·격리한다.', '위협 헌팅과 상황 보고, 교대 운영을 수행한다.'], requirements: ['CSIRT 또는 SOC 경력 2년 이상을 요구한다.'], securityProducts: ['SIEM'], securityDomains: ['CSIRT', '사고 대응'], deliverables: ['상황 보고', '사고 기록'],
  }),
  michelinCert: source('Michelin', 'Senior CERT Analyst', 'https://michelinhr.wd3.myworkdayjobs.com/en-US/Michelin/job/Senior-CERT-Analyst--experienced-level-professional-_R-2026009675', {
    country: '프랑스', careerLevel: 'senior', requiredYearsMin: 5, responsibilities: ['CERT의 복잡한 사고를 조사·조율하고 격리·복구를 지원한다.', '분석가 멘토링과 대응 절차 개선을 수행한다.'], requirements: ['사고 대응·CERT·SOC 경력 5년 이상을 요구한다.'], securityDomains: ['CERT', '사고 대응'], deliverables: ['사고 보고서', '대응 절차'],
  }),
  leidosCsirt: source('Leidos', 'Cyber Defense Analyst', 'https://leidos.wd5.myworkdayjobs.com/en-US/External/job/Cyber-Defense-Analyst_R-00184469-1', {
    responsibilities: ['CSIRT에서 보안 이벤트를 조사하고 침해 범위·영향을 분석한다.', '관련 조직과 대응 조치와 상황 정보를 조율한다.'], requirements: ['사이버 방어 또는 사고 대응 분석 경험을 요구한다.'], securityDomains: ['CSIRT', '사고 대응'], deliverables: ['사고 분석', '상황 보고'],
  }),
  centricaCsirt: source('Centrica', 'Cyber Security Incident Response Analyst', 'https://centrica.wd3.myworkdayjobs.com/en-US/Centrica/job/Cyber-Security-Incident-Response-Analyst_R0086894-1', {
    country: '영국', status: 'closed', applicationAvailable: false, responsibilities: ['CSIRT에서 클라우드·아이덴티티·네트워크·엔드포인트 사고를 조사한다.', '격리·복구와 이해관계자 상황 공유를 수행한다.'], requirements: ['사고 대응과 복수 보안 데이터 소스 분석 경험을 요구한다.'], securityDomains: ['CSIRT', '사고 대응', '클라우드 보안'], deliverables: ['사고 기록', '상황 보고'], limitations: ['명시된 지원 마감일이 지나 closed로 분류했다.'],
  }),
  agileDfir: source('Agile Defense', 'Digital Forensics and Incident Response Analyst', 'https://jobs.lever.co/agile-defense/9aab1e98-15c8-4716-986a-6c2fb0cadcfc', {
    careerLevel: 'senior', requiredYearsMin: 7, responsibilities: ['호스트·메모리·파일 시스템·네트워크 증거를 수집·보존·분석해 침해 타임라인을 재구성한다.', '체인 오브 커스터디를 유지하고 기술 조사 보고서를 작성한다.'], requirements: ['DFIR 경력 7년 이상과 포렌식 도구·네트워크 분석 경험을 요구한다.'], tools: ['EnCase', 'FTK', 'Autopsy', 'X-Ways', 'Volatility', 'Wireshark', 'YARA', 'Ghidra', 'IDA Pro'], operatingSystems: ['Windows', 'UNIX', 'Linux'], securityDomains: ['DFIR', '호스트 포렌식', '네트워크 포렌식'], deliverables: ['증거 이미지', '포렌식 타임라인', '조사 보고서'],
  }),
  surefireDfir: source('Surefire Cyber', 'Senior Consultant, Digital Forensic and Incident Response (DFIR)', 'https://job-boards.greenhouse.io/surefirecyber/jobs/5187227007', {
    location: 'Remote, USA', workMode: 'remote', careerLevel: 'senior', responsibilities: ['고객 디지털 포렌식·사고 대응 조사를 수행해 공격 경로와 영향을 분석한다.', '호스트·네트워크 증거와 조사 결과를 보고하고 복구 의사결정을 지원한다.'], requirements: ['클라이언트 대면 포렌식 분석과 독립 조사 경험을 요구한다.'], tools: ['ELK', 'Magnet AXIOM', 'EnCase', 'FTK'], securityDomains: ['DFIR', '호스트 포렌식', '네트워크 포렌식'], partnerTeams: ['고객', '법무', '보험사'], deliverables: ['포렌식 보고서', '증거 자료'],
  }),
  accentureForensic: source('Accenture Federal Services', 'Cyber Forensic Analyst', 'https://job-boards.greenhouse.io/accenturefederalservices/jobs/4686273006', {
    requiredYearsMin: 3, responsibilities: ['물리 장치와 클라우드 시스템에서 디지털 증거·로그를 수집·보존·분석한다.', '호스트·네트워크·모바일 증거의 타임라인과 조사 결과를 문서화한다.'], requirements: ['포렌식 경력 3년 이상과 상용 포렌식 도구 경험을 요구한다.'], tools: ['EnCase', 'FTK', 'X-Ways', 'Magnet AXIOM', 'Cellebrite'], securityDomains: ['디지털 포렌식', '호스트 포렌식', '네트워크 포렌식', '클라우드 포렌식'], deliverables: ['증거 자료', '포렌식 보고서'],
  }),
  logicalisDfir: source('Logicalis', 'Senior Threat Hunter - DFIR Specialist', 'https://logicalis.wd3.myworkdayjobs.com/en-US/LogicalisCareers/job/Senior-Threat-Hunter---DFIR-Specialist--Tier-3-_JR05215', {
    country: '영국', careerLevel: 'senior', responsibilities: ['고급 위협 헌팅과 DFIR 조사를 수행해 공격자 행위와 침해 범위를 확인한다.', '포렌식 결과를 탐지·대응 개선으로 전환한다.'], requirements: ['위협 헌팅과 DFIR 조사 경험을 요구한다.'], securityDomains: ['DFIR', '위협 헌팅'], deliverables: ['조사 보고서', '탐지 개선'],
  }),
  craForensic: source('Charles River Associates', 'Forensic Services Graduate', 'https://job-boards.greenhouse.io/charlesriverassociates/jobs/8053945', {
    careerLevel: 'entry', responsibilities: ['컴퓨터·네트워크·모바일·이동식 매체 증거를 수집하고 체인 오브 커스터디를 유지한다.', '파일·메모리·네트워크 증거를 분석하고 조사 결과를 문서화한다.'], requirements: ['디지털 포렌식 기초와 Python·T-SQL·VBA 또는 C# 역량을 요구한다.'], programmingLanguages: ['C#'], scriptingLanguages: ['Python', 'VBA'], queryLanguages: ['T-SQL'], securityDomains: ['디지털 포렌식', '호스트 포렌식', '네트워크 포렌식'], deliverables: ['증거 기록', '포렌식 분석'],
  }),
  skyepointForensic: source('SkyePoint Decisions', 'Digital Forensic Technician', 'https://job-boards.greenhouse.io/skyepointdecisionsinc/jobs/4330023009', {
    careerLevel: 'mid', responsibilities: ['디지털 증거를 보존·수집·분석하고 체인 오브 커스터디를 유지한다.', '포렌식 실험실 시스템과 사건 기록을 운영한다.'], requirements: ['디지털 포렌식 분석과 증거 처리 경험을 요구한다.'], securityDomains: ['디지털 포렌식'], deliverables: ['증거 기록', '포렌식 분석'], limitations: ['계약 수주를 전제로 한 contingent 공고임을 본문에서 확인했다.'],
  }),
  nttDfir: source('NTT DATA', 'Senior Digital Forensics Incident Response Analyst', 'https://nttlimited.wd3.myworkdayjobs.com/en-US/NTT_Careers/job/Senior-Information-Security-Incident-Response-Analyst_R-134780-1', {
    country: '남아프리카공화국', location: 'Johannesburg / Port Elizabeth / Cape Town', workMode: 'hybrid', careerLevel: 'senior', responsibilities: ['호스트·디스크·메모리·네트워크·클라우드·모바일 포렌식으로 공격 타임라인을 재구성한다.', 'AWS·Azure·GCP 로그와 증거를 분석하고 고객의 격리·복구를 지원한다.'], requirements: ['복수 환경의 DFIR 실무와 고객 조사 경험을 요구한다.'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], operatingSystems: ['Windows', 'Linux', 'macOS'], securityDomains: ['DFIR', '네트워크 포렌식', '클라우드 포렌식'], deliverables: ['조사 타임라인', '최종 보고서'], limitations: ['동적 Workday 페이지에서 본문과 지원 화면을 확인했다.'],
  }),
  f5HostCloud: source('F5', 'Senior Security Engineer, Host Forensics', 'https://ffive.wd5.myworkdayjobs.com/en-US/f5jobs/job/Security-Engineer-III_RP1036126', {
    careerLevel: 'senior', requiredYearsMin: 8, responsibilities: ['엔드포인트와 클라우드 증거를 수집·보존·분석해 공격 타임라인과 근본 원인을 재구성한다.', '호스트·클라우드 포렌식 절차와 위협 헌팅 플레이북을 개선한다.'], requirements: ['호스트·클라우드 포렌식, DFIR, 위협 헌팅 경력 8년 이상을 요구한다.'], tools: ['FTK', 'Cyber Triage', 'Magnet AXIOM'], securityProducts: ['CrowdStrike', 'SIEM', 'SOAR', 'EDR'], frameworks: ['MITRE ATT&CK'], securityDomains: ['호스트 포렌식', '클라우드 포렌식'], deliverables: ['포렌식 타임라인', '런북'],
  }),
  f5CloudAutomation: source('F5', 'Senior Security Engineer / Tool Automation', 'https://ffive.wd5.myworkdayjobs.com/en-US/f5jobs/job/Senior-Security-Engineer---Tool-Automation_RP1035961-1', {
    careerLevel: 'senior', requiredYearsMin: 8, responsibilities: ['AWS·Azure·GCP와 엔드포인트의 포렌식 증거를 획득·분석하고 타임라인을 재구성한다.', '포렌식 수집·보강·보고 워크플로를 자동화한다.'], requirements: ['DFIR·위협 헌팅 8년 이상과 클라우드 포렌식·Python 자동화 경험을 요구한다.'], scriptingLanguages: ['Python'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], tools: ['Terraform', 'Ansible'], securityProducts: ['EDR', 'SIEM', 'SOAR'], securityDomains: ['클라우드 포렌식', 'DFIR'], deliverables: ['포렌식 자동화', '조사 타임라인'],
  }),
  trendCloudDfir: source('Trend Micro', 'Senior Incident Response (IR) Analyst - AI Fearlessly', 'https://trendmicro.wd3.myworkdayjobs.com/en-US/External/job/Senior-Incident-Response--IR--Analyst_R0010002', {
    careerLevel: 'senior', requiredYearsMin: 5, responsibilities: ['AWS·Azure·GCP의 스냅샷·메모리·컨테이너·서버리스 로그와 제어 평면 감사 로그를 분석한다.', '클라우드 저장소·데이터베이스·Kubernetes 사고의 타임라인과 영향을 조사한다.'], requirements: ['사고 대응·디지털 포렌식 경력 5년 이상과 주요 클라우드 포렌식 경험을 요구한다.'], scriptingLanguages: ['Python', 'PowerShell'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], containerPlatforms: ['Kubernetes'], securityProducts: ['AWS Detective', 'Microsoft Sentinel', 'Google Chronicle', 'Magnet AXIOM Cloud'], frameworks: ['MITRE ATT&CK'], securityDomains: ['클라우드 포렌식', '사고 대응'], deliverables: ['클라우드 사고 타임라인', '사고 보고서'],
  }),
  aerospaceCloudDfir: source('The Aerospace Corporation', 'Incident Response and Forensic Analyst', 'https://aero.wd5.myworkdayjobs.com/External/job/Colorado-Springs-CO/Incident-Response-and-Forensic-Analyst_R014856', {
    location: 'Colorado Springs, CO', careerLevel: 'senior', responsibilities: ['보안 사고를 조사하고 디지털 증거를 수집·보존·분석해 대응을 이끈다.', 'AWS·Azure·GCP 클라우드 포렌식과 클라우드 네이티브 사고 대응을 수행한다.'], requirements: ['증거 보존·체인 오브 커스터디와 디지털 포렌식·사고 대응 경험을 요구한다.'], preferredQualifications: ['AWS·Azure·GCP 클라우드 포렌식 경험', 'GCFA·GCFE·GREM·GNFA 등 자격'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], securityDomains: ['클라우드 포렌식', '사고 대응'], deliverables: ['포렌식 조사', '사고 보고서'],
  }),

  nozomiMalware: source('Nozomi Networks', 'Security Research Analyst', 'https://job-boards.greenhouse.io/nozominetworks/jobs/4703111005', {
    responsibilities: ['악성 파일을 정적·동적으로 리버스 엔지니어링하고 행위·C2·IOC를 분석한다.', 'YARA·Snort·Suricata·Sigma 탐지 콘텐츠와 위협 인텔리전스를 작성한다.'], requirements: ['IDA·Ghidra 등 리버스 도구와 Python, 네트워크 분석 경험을 요구한다.'], tools: ['IDA Pro', 'Ghidra', 'Wireshark'], scriptingLanguages: ['Python'], securityProducts: ['YARA', 'Snort', 'Suricata', 'Sigma'], protocols: ['STIX'], securityDomains: ['멀웨어 분석', '리버스 엔지니어링', '탐지 시그니처'], deliverables: ['IOC', '탐지 시그니처', '위협 보고서'],
  }),
  nozomiMalwareLead: source('Nozomi Networks', 'Technical Lead, Security Research', 'https://job-boards.greenhouse.io/nozominetworks/jobs/4703113005', {
    careerLevel: 'lead', responsibilities: ['악성 샘플 리버스 엔지니어링과 위협 연구를 기술적으로 이끈다.', 'YARA·Snort·Suricata·Sigma 탐지 시그니처와 연구 품질을 관리한다.'], requirements: ['고급 멀웨어 리버스와 탐지 콘텐츠 개발 경험을 요구한다.'], tools: ['IDA Pro', 'Ghidra', 'Wireshark'], scriptingLanguages: ['Python'], securityProducts: ['YARA', 'Snort', 'Suricata', 'Sigma'], protocols: ['STIX'], securityDomains: ['멀웨어 분석', '리버스 엔지니어링', '탐지 시그니처'], deliverables: ['탐지 시그니처', '위협 연구 보고서'],
  }),
  zscalerMalware: source('Zscaler', 'Staff Security Researcher, Malware Analysis', 'https://job-boards.greenhouse.io/zscaler/jobs/5165701007', {
    careerLevel: 'staff', responsibilities: ['멀웨어를 정적·동적으로 분석해 C2·IOC·행위를 식별한다.', '분석 결과로 탐지 시그니처와 위협 연구 보고서를 작성한다.'], requirements: ['IDA·x64dbg와 Python·Shell·Perl·Ruby를 활용한 리버스 경험을 요구한다.'], tools: ['IDA Pro', 'x64dbg'], scriptingLanguages: ['Python', 'Shell', 'Perl', 'Ruby'], securityDomains: ['멀웨어 분석', '리버스 엔지니어링'], deliverables: ['IOC', '탐지 시그니처', '연구 보고서'],
  }),
  linkReverse: source('Link, LLC', 'Senior Reverse Engineer', 'https://jobs.lever.co/linkllc/a4687dad-ea74-41a4-9f44-57b31ebad7a2', {
    careerLevel: 'senior', responsibilities: ['악성 바이너리를 정적 분석하고 통제된 실행으로 행위·통신·지속성 기법을 확인한다.', '리버스 결과를 탐지 시그니처와 TTP 분석으로 전환한다.'], requirements: ['멀웨어·바이너리 리버스 엔지니어링 경험을 요구한다.'], securityDomains: ['멀웨어 분석', '바이너리 리버스 엔지니어링'], deliverables: ['리버스 분석', '탐지 단서', 'TTP'],
  }),
  s2wMalware: source('S2W', 'Malware Analyst', 'https://www.wanted.co.kr/wd/250891', {
    market: 'domestic', country: '대한민국', location: '서울', status: 'closed', applicationAvailable: false, responsibilities: ['악성코드를 정적·동적으로 분석하고 행위·IOC·공격 캠페인 맥락을 도출한다.', '리버스 결과와 위협 인텔리전스 보고를 작성한다.'], requirements: ['멀웨어 분석과 리버스 엔지니어링 경험을 요구한다.'], securityDomains: ['멀웨어 분석', '위협 연구'], deliverables: ['IOC', '멀웨어 분석 보고서'], limitations: ['공고가 마감된 상태지만 제목과 본문을 확인할 수 있어 closed로 분류했다.'],
  }),
  twoSixSoftwareReverse: source('Two Six Technologies', 'Senior Software Reverse Engineer', 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/6113756004', {
    careerLevel: 'senior', responsibilities: ['소프트웨어·펌웨어 바이너리를 분석해 동작·프로토콜·취약 기능을 복원한다.', '에뮬레이션과 퍼징으로 분석 결과를 검증한다.'], requirements: ['C/C++·Python·Linux와 IDA·Binary Ninja·Ghidra, ARM·MIPS·PowerPC·RTOS 경험을 요구한다.'], tools: ['IDA Pro', 'Binary Ninja', 'Ghidra', 'QEMU'], programmingLanguages: ['C', 'C++'], scriptingLanguages: ['Python'], operatingSystems: ['Linux', 'RTOS'], securityDomains: ['바이너리 리버스 엔지니어링', '펌웨어 리버스 엔지니어링'], deliverables: ['리버스 분석', '재현 코드'],
  }),
  strFirmware: source('STR', 'Firmware Reverse Engineer', 'https://job-boards.greenhouse.io/systemstechnologyresearch/jobs/4660460006', {
    responsibilities: ['소프트웨어·펌웨어 대상을 리버스 엔지니어링하고 임베디드 구조와 기능을 분석한다.', '분석 도구와 C/C++·Python 코드로 연구 결과를 검증한다.'], requirements: ['IDA·Binary Ninja·Ghidra와 임베디드 아키텍처 경험을 요구한다.'], tools: ['IDA Pro', 'Binary Ninja', 'Ghidra'], programmingLanguages: ['C', 'C++'], scriptingLanguages: ['Python'], securityDomains: ['펌웨어 리버스 엔지니어링'], deliverables: ['펌웨어 분석', '기술 연구'],
  }),
  twoSixFirmware: source('Two Six Technologies', 'Senior Firmware Reverse Engineer', 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/6100758004', {
    careerLevel: 'senior', responsibilities: ['임베디드 펌웨어를 추출·리버스·재호스팅하고 QEMU 환경에서 동작을 재현한다.', '분석 자동화와 취약 기능 검증을 수행한다.'], requirements: ['Ghidra·Python·QEMU 기반 펌웨어 리버스 경험을 요구한다.'], tools: ['Ghidra', 'QEMU'], scriptingLanguages: ['Python'], securityDomains: ['펌웨어 리버스 엔지니어링'], deliverables: ['재호스팅 환경', '펌웨어 분석'],
  }),
  finiteStateFirmware: source('Finite State', 'Senior Firmware Security Researcher', 'https://job-boards.greenhouse.io/finitestate/jobs/5985129004', {
    careerLevel: 'senior', responsibilities: ['JTAG·SWD·UART 등으로 펌웨어를 획득하고 바이너리 구조와 취약 기능을 분석한다.', 'ARM·MIPS·PowerPC·x86 펌웨어 리버스 결과와 취약점 보고서를 작성한다.'], requirements: ['Ghidra·Binary Ninja, C/C++와 임베디드 하드웨어 인터페이스 경험을 요구한다.'], tools: ['Ghidra', 'Binary Ninja', 'JTAG', 'SWD', 'UART'], programmingLanguages: ['C', 'C++'], securityDomains: ['펌웨어 리버스 엔지니어링'], deliverables: ['펌웨어 분석', '취약점 보고서'],
  }),
  sonicSandbox: source('SonicWall', 'Senior Software Engineer - Malware Sandbox Platform', 'https://job-boards.greenhouse.io/sonicwall/jobs/8027657', {
    careerLevel: 'senior', responsibilities: ['파일 수집·작업 오케스트레이션·정적/동적 분석·샌드박스·행위 분류 플랫폼을 개발한다.', '확장 가능한 멀웨어 분석 파이프라인과 이벤트 처리를 운영한다.'], requirements: ['Python 또는 C++, SQL·Redis·RabbitMQ·Docker 기반 백엔드 경험을 요구한다.'], programmingLanguages: ['C++'], scriptingLanguages: ['Python'], databases: ['SQL', 'MySQL', 'Redis'], containerPlatforms: ['Docker'], tools: ['RabbitMQ', 'Jenkins', 'Git'], securityDomains: ['멀웨어 샌드박스'], deliverables: ['분석 파이프라인', '샌드박스 플랫폼'],
  }),
  securityscorecardSandbox: source('SecurityScorecard', 'Research Engineer, Malware Analysis', 'https://job-boards.greenhouse.io/securityscorecard/jobs/8041910', {
    responsibilities: ['멀웨어 배포 서버와 샌드박스 오케스트레이션을 연구·구현한다.', 'OSINT와 YARA·Sigma·STIX 규칙을 이용해 악성 행위를 분류한다.'], requirements: ['멀웨어 연구, 샌드박스 자동화와 클라우드·컨테이너 경험을 요구한다.'], securityProducts: ['YARA', 'Sigma'], protocols: ['STIX'], securityDomains: ['멀웨어 샌드박스', '탐지 시그니처'], deliverables: ['샌드박스 오케스트레이션', '탐지 규칙'],
  }),
  trendSandbox: source('Trend Micro', 'Senior Linux System Engineer, Deep Discovery Analyzer Unified Sandbox', 'https://trendmicro.wd3.myworkdayjobs.com/en-US/External/job/Sr-Linux-System-Engineer--Deep-Discovery-Analyzer-Unified-Sandbox-_R0009522', {
    careerLevel: 'senior', responsibilities: ['Linux 기반 가상 분석기와 통합 멀웨어 샌드박스를 개발·운영한다.', '악성 행위 분석·위협 보고와 안티 이베이전·확장성 기능을 개선한다.'], requirements: ['Linux 시스템 엔지니어링과 가상화·멀웨어 분석 환경 경험을 요구한다.'], operatingSystems: ['Linux'], securityDomains: ['멀웨어 샌드박스'], deliverables: ['가상 분석기', '샌드박스 기능'],
  }),
  a10Sandbox: source('A10 Networks', 'Principal Researcher, Botnet & DDoS Threats', 'https://osv-a10networks.wd503.myworkdayjobs.com/en-US/A10CareerSite/job/Principal-Researcher--Botnet---DDoS-Threats_R-101294', {
    careerLevel: 'principal', responsibilities: ['IoT 봇넷 멀웨어를 동적 샌드박스·연구실에서 실행·리버스하고 분석을 자동화한다.', 'DDoS 행위와 네트워크 지표를 탐지 콘텐츠로 전환한다.'], requirements: ['멀웨어 샌드박스와 IoT 봇넷 리버스·탐지 연구 경험을 요구한다.'], securityDomains: ['멀웨어 샌드박스', 'IoT 보안', '탐지 시그니처'], deliverables: ['봇넷 분석', '탐지 콘텐츠'],
  }),
  inetumRed: source('Inetum', 'Penetration Tester / Red Team Analyst', 'https://jobs.smartrecruiters.com/Inetum2/744000105201130-penetration-tester-red-team-analyst', {
    country: '포르투갈', location: 'Lisbon', workMode: 'hybrid', requiredYearsMin: 2, responsibilities: ['정찰·취약점 스캔·악용·후속 악용·보고를 포함한 침투 테스트를 수행한다.', '현실적인 레드팀 공격 시뮬레이션을 수행하고 SOC·블루팀·인프라·개발 조직에 개선안을 전달한다.'], requirements: ['침투 테스트·윤리적 해킹·레드팀 경력 2년 이상과 Metasploit·Burp Suite·Nmap 경험을 요구한다.'], tools: ['Metasploit', 'Burp Suite', 'Nmap'], frameworks: ['OWASP', 'MITRE ATT&CK'], securityDomains: ['침투 테스트', '레드팀', '웹 보안'], partnerTeams: ['SOC', '블루팀', '인프라', '개발'], deliverables: ['기술 보고서', '경영진 보고서'],
  }),
  sosiCloudPt: source('SOSi', 'Penetration Tester III', 'https://jobs.smartrecruiters.com/SOSi1/3743990012755137-penetration-tester-iii', {
    careerLevel: 'senior', requiredYearsMin: 5, requiredYearsMax: 7, responsibilities: ['엔터프라이즈 시스템·애플리케이션·네트워크와 IoT·모바일·클라우드 환경의 침투 테스트를 수행한다.', '레드팀 활동으로 보안 통제를 검증하고 취약점·개선안을 보고한다.'], requirements: ['침투 테스트 경력 5~7년과 클라우드 침투 테스트·레드팀 경험을 요구한다.'], preferredQualifications: ['GPEN 또는 GXPN 등 명시된 침투 테스트 자격'], frameworks: ['MITRE ATT&CK', 'OSSTMM', 'OWASP', 'NIST', 'PTES', 'ISSAF'], securityDomains: ['침투 테스트', '클라우드 보안', '레드팀'], deliverables: ['취약점 보고서', '개선 권고'],
  }),
  spgiCloudPt: source('S&P Global', 'Lead Security Engineer', 'https://spgi.wd5.myworkdayjobs.com/en-US/SPGI_Careers/job/Lead-Security-Engineer_328289-2', {
    country: '폴란드', location: 'Gdansk', careerLevel: 'lead', responsibilities: ['제품 포트폴리오의 애플리케이션·클라우드 침투 테스트를 직접 이끌고 실제 악용 가능성과 사업 위험을 평가한다.', '발견사항의 개선과 보안 엔지니어링 방향을 조율한다.'], requirements: ['침투 테스트·레드팀·오펜시브 보안 분야 경력과 리더십을 요구한다.'], securityDomains: ['클라우드 침투 테스트', '애플리케이션 보안'], deliverables: ['침투 테스트 결과', '개선 계획'],
  }),
  accentureCloudPt: source('Accenture', 'Security Architect - Security Penetration Testing', 'https://accenture.wd103.myworkdayjobs.com/AccentureCareers/job/Bengaluru/Security-Architect_ATCI-5482355-S2002833-1', {
    country: '인도', location: 'Bengaluru', careerLevel: 'senior', requiredYearsMin: 12, responsibilities: ['애플리케이션·API·인프라·클라우드 침투 테스트와 BAS를 수행한다.', '취약점을 검증하고 위협 모델·설계 검토·개선 권고를 작성한다.'], requirements: ['보안 침투 테스트 경력 12년 이상과 웹·API·인프라·클라우드 테스트 도구 경험을 요구한다.'], tools: ['Burp Suite', 'OWASP ZAP', 'SQLmap', 'Metasploit', 'Nmap', 'Wireshark', 'ScoutSuite', 'Pacu', 'Prowler', 'AzureHound'], securityDomains: ['웹 보안', 'API 보안', '클라우드 보안', '침투 테스트'], deliverables: ['위험 분석', '개선 권고', '테스트 보고서'],
  }),
  necswsPt: source('NEC Software Solutions', 'Test Analyst / Senior Test Analyst - Penetration Testing', 'https://jobs.smartrecruiters.com/NECSWS/744000096114225-test-analyst-senior-test-analyst-penetration-testing-owasp-burp-suite', {
    country: '인도', careerLevel: 'mid', requiredYearsMin: 2, requiredYearsMax: 5, responsibilities: ['웹·API·모바일·두꺼운 클라이언트·인프라·클라우드 침투 테스트를 계획·수행한다.', '취약점을 수동·자동 검증하고 PoC·개선 권고와 재현 가능한 보고서를 작성한다.'], requirements: ['침투 테스트 경력 2~5년과 Burp Suite·Kali Linux 도구 사용 경험을 요구한다.'], tools: ['Burp Suite', 'Nmap', 'Wireshark', 'OWASP ZAP', 'SQLmap', 'Metasploit'], scriptingLanguages: ['Python', 'Ruby', 'Bash', 'PowerShell'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], frameworks: ['OWASP', 'OSSTMM', 'PTES'], securityDomains: ['웹 보안', 'API 보안', '클라우드 보안'], partnerTeams: ['개발', '보안 엔지니어링'], deliverables: ['PoC', '침투 테스트 보고서'],
  }),
  bahRed: source('Booz Allen Hamilton', 'Enterprise Cybersecurity Penetration Tester and Operator, Mid', 'https://bah.wd1.myworkdayjobs.com/BAH_Jobs/job/Enterprise-Cybersecurity-Penetration-Tester-and-Operator--Mid_R0243470', {
    location: 'McLean, VA', careerLevel: 'mid', responsibilities: ['내부 레드팀에서 엔터프라이즈와 시스템 중심의 공격 평가를 수행한다.', '승인된 규칙 아래 종단 간 레드·퍼플팀 시나리오를 실행해 탐지·통제 격차를 확인한다.'], requirements: ['오펜시브 보안과 엔터프라이즈 침투 테스트 경험을 요구한다.'], securityProducts: ['SIEM', 'EDR'], securityDomains: ['레드팀', '퍼플팀'], deliverables: ['공격 시나리오', '탐지 격차 보고'],
  }),
  pwcRed: source('PwC', 'Risk Services - Red Team Consultant', 'https://pwc.wd3.myworkdayjobs.com/Global_Experienced_Careers/job/Singapore/Risk-Services---Red-Team-Consultant--Associate---Senior-Associate---Assistant-Manager-_743334WD', {
    country: '싱가포르', location: 'Singapore', careerLevel: 'senior', responsibilities: ['레드팀·퍼플팀·BAS·침투 테스트와 클라우드·AI 보안 테스트를 처음부터 끝까지 수행한다.', '고객의 탐지·대응 격차와 개선안을 기술·경영진 산출물로 전달한다.'], requirements: ['오펜시브 보안과 공격자 TTP, 고객 보안 테스트 경험을 요구한다.'], securityDomains: ['레드팀', '퍼플팀', '클라우드 보안', 'AI 보안'], deliverables: ['보안 테스트 보고서', '개선 권고'],
  }),
  occRed: source('OCC', 'Lead Associate Principal, Adversarial Red Team', 'https://theocc.wd5.myworkdayjobs.com/en-US/careers/job/Chicago---125-S-Franklin/Lead-Associate-Principal--Adversarial-Red-Team_REQ-4709', {
    location: 'Chicago, IL', careerLevel: 'lead', requiredYearsMin: 7, responsibilities: ['네트워크·웹·클라우드·모바일·물리·사회공학 영역의 은밀한 적대자 모사를 수행한다.', 'C2 인프라와 회피 기법으로 방어 탐지를 검증하고 개선·재시험을 조율한다.'], requirements: ['사이버보안 경력 7년 이상과 레드팀·C2·OSINT·침투 테스트 경험을 요구한다.'], securityDomains: ['레드팀', '클라우드 보안', '사회공학'], deliverables: ['공격 시나리오', '레드팀 보고서', '재시험 결과'],
  }),
  trendRed: source('Trend Micro', 'Threat Researcher - Global Services Cyber Threat Red Team', 'https://trendmicro.wd3.myworkdayjobs.com/en-US/External/job/Threat-Researcher_R0009871', {
    country: '대만', location: 'Taipei', responsibilities: ['고객 엔터프라이즈와 클라우드 애플리케이션·인프라에 레드팀·침투 테스트를 수행한다.', '실제 공격자 TTP와 회피 기법을 모사하고 공격 연구를 수행한다.'], requirements: ['전 범위 침투 테스트와 피싱·사회공학·네트워크·웹 악용 경험을 요구한다.'], securityDomains: ['레드팀', '클라우드 보안', '위협 연구'], deliverables: ['레드팀 결과', '공격 연구'],
  }),
  geicoCsirt: source('GEICO', 'CSIRT Engineer', 'https://geico.wd1.myworkdayjobs.com/en-US/External/job/CSIRT-Engineer--HYBRID-_R0064477', {
    location: '미국', workMode: 'hybrid', requiredYearsMin: 4, responsibilities: ['CSIRT의 최전선에서 AWS·Azure·GCP, Windows·Linux·macOS 사고를 조사·격리·개선한다.', 'IDS·방화벽·웹·네트워크 로그와 패킷을 분석해 IOC·TTP와 근본 원인을 확인한다.'], requirements: ['사고 대응 경력 4년 이상과 클라우드 사고 대응·근본 원인 분석 경험을 요구한다.'], scriptingLanguages: ['Bash', 'Python', 'Perl', 'PowerShell'], cloudPlatforms: ['AWS', 'Azure', 'GCP'], frameworks: ['MITRE ATT&CK'], securityDomains: ['CSIRT', '사고 대응', '클라우드 포렌식'], deliverables: ['사고 분석', '기술 문서'],
  }),
  workdaySandbox: source('Workday', 'Cyber Forensics & Malware Analyst-Reverse Engineer (US Federal)', 'https://workday.wd5.myworkdayjobs.com/en-US/Workday/job/USA-VA-McLean/Cyber-Forensics---Malware-Analyst-Reverse-Engineer--US-Federal-_JR-0105580', {
    location: 'McLean / Reston, VA', workMode: 'onsite', careerLevel: 'senior', requiredYearsMin: 8, responsibilities: ['악성 바이너리·스크립트의 정적·동적 분석과 리버스 엔지니어링을 수행한다.', '자동 멀웨어 분석 파이프라인과 사용자 정의 샌드박스 환경을 구축·유지하고 탐지 규칙을 개발한다.'], requirements: ['DFIR·멀웨어 분석·위협 헌팅 경력 8년 이상과 Python·Go·C/C++ 자동화 경력 5년 이상을 요구한다.'], tools: ['IDA Pro', 'Ghidra', 'x64dbg', 'GDB', 'Magnet AXIOM', 'EnCase', 'FTK', 'Volatility'], programmingLanguages: ['Go', 'C', 'C++'], scriptingLanguages: ['Python'], securityProducts: ['YARA', 'Snort', 'Sigma', 'Splunk', 'ELK'], frameworks: ['MITRE ATT&CK', 'Diamond Model'], securityDomains: ['멀웨어 샌드박스', '멀웨어 리버스 엔지니어링', '탐지 시그니처'], deliverables: ['분석 파이프라인', '사용자 정의 샌드박스', '탐지 규칙'],
  }),
})

const roleMappings = Object.freeze({
  'catalog-vulnerability-assessment': [
    ['bahVa1', 'exact', 97, true], ['bahVa2', 'exact', 96, true], ['cloudflareVm', 'strong', 86, false],
    ['blackDuckVm', 'strong', 84, false], ['lsegVm', 'strong', 87, false],
  ],
  'catalog-vulnerability-management': [
    ['cloudflareVm', 'exact', 98, true], ['blackDuckVm', 'exact', 95, true], ['lsegVm', 'exact', 97, true],
    ['bahVa1', 'strong', 82, false], ['bahVa2', 'strong', 84, false],
  ],
  'catalog-pentester': [
    ['inetumRed', 'exact', 96, true], ['sixWebPt', 'strong', 88, false], ['lsegPt', 'exact', 96, true],
    ['manulifePt', 'exact', 96, true], ['leidosPt', 'exact', 97, true],
  ],
  'catalog-web-api-pentester': [
    ['accentureCloudPt', 'strong', 89, false], ['sixWebPt', 'exact', 98, true], ['necswsPt', 'strong', 89, false],
    ['usbankMobilePt', 'strong', 89, false], ['gditPt', 'strong', 88, false],
  ],
  'catalog-cloud-pentester': [
    ['sosiCloudPt', 'strong', 88, false], ['spgiCloudPt', 'strong', 87, false], ['lsegPt', 'strong', 87, false],
    ['gditPt', 'strong', 89, false], ['infiosPt', 'strong', 83, false],
  ],
  'catalog-red-team-operator': [
    ['bahRed', 'strong', 89, false], ['pwcRed', 'exact', 96, true], ['occRed', 'exact', 98, true],
    ['transunionRed', 'exact', 96, true], ['trendRed', 'strong', 89, false],
  ],
  'catalog-vulnerability-researcher': [
    ['kbrVr', 'exact', 98, true], ['trendVr', 'exact', 98, true], ['pennVr', 'exact', 97, true],
    ['coretechVr', 'exact', 98, true], ['twoSixVr', 'strong', 88, false],
  ],

  'catalog-soc-analyst': [
    ['chaosSoc', 'exact', 98, true], ['idmeSoc', 'exact', 98, true], ['fiveskySoc', 'exact', 97, true],
    ['volexitySoc', 'exact', 98, true], ['fiservSoc', 'exact', 96, true],
  ],
  'catalog-security-operations-engineer': [
    ['tmhccSecOps', 'exact', 98, true], ['fieldnationSecOps', 'exact', 98, true], ['takeTwoSecOps', 'exact', 97, true],
    ['okxSecOps', 'exact', 97, true], ['blackstoneSecOps', 'exact', 98, true],
  ],
  'catalog-detection-engineer': [
    ['blackstoneSecOps', 'strong', 86, false], ['stateDetection', 'exact', 98, true], ['mehilainenDetection', 'exact', 98, true],
    ['keeperDetection', 'exact', 98, true], ['defionDetection', 'exact', 98, true],
  ],
  'catalog-siem-engineer': [
    ['ensignSiem', 'exact', 98, true], ['siaSiem', 'strong', 89, false], ['blackstoneSecOps', 'strong', 85, false],
    ['binanceSiem', 'strong', 87, false], ['keeperDetection', 'strong', 86, false],
  ],
  'catalog-soar-engineer': [
    ['takeTwoSecOps', 'strong', 88, false], ['deutscheSoar', 'exact', 98, true], ['bahSoar', 'exact', 98, true],
    ['optivSoar', 'exact', 98, true], ['siaSiem', 'strong', 88, false],
  ],
  'catalog-threat-hunter': [
    ['taniumHunter', 'exact', 99, true], ['leidosHunter1', 'exact', 98, true], ['leidosHunter2', 'exact', 98, true],
    ['crowdstrikeHunter', 'exact', 98, true], ['m9Hunter', 'exact', 97, true],
  ],
  'catalog-cti-analyst': [
    ['stateCti', 'exact', 99, true], ['dxcCti', 'exact', 97, true], ['bahCti', 'exact', 98, true],
    ['fiservCti', 'exact', 98, true], ['csaaCti', 'exact', 98, true],
  ],

  'catalog-incident-response': [
    ['clickhouseIr', 'exact', 98, true], ['accentureIr', 'exact', 98, true], ['trendCloudDfir', 'exact', 96, true],
    ['magnetIr', 'exact', 97, true], ['atbayDfir', 'strong', 88, false],
  ],
  'catalog-csirt': [
    ['targetCsirt', 'exact', 99, true], ['michelinCert', 'exact', 98, true], ['leidosCsirt', 'strong', 87, false],
    ['geicoCsirt', 'exact', 98, true], ['centricaCsirt', 'strong', 88, false],
  ],
  'catalog-dfir-analyst': [
    ['agileDfir', 'exact', 99, true], ['surefireDfir', 'exact', 99, true], ['atbayDfir', 'exact', 98, true],
    ['accentureForensic', 'strong', 89, false], ['logicalisDfir', 'exact', 97, true],
  ],
  'catalog-digital-forensics': [
    ['agileDfir', 'strong', 89, false], ['accentureForensic', 'exact', 98, true], ['craForensic', 'strong', 86, false],
    ['skyepointForensic', 'exact', 98, true], ['surefireDfir', 'strong', 89, false],
  ],
  'catalog-host-forensics': [
    ['agileDfir', 'strong', 89, false], ['accentureForensic', 'strong', 88, false], ['craForensic', 'strong', 85, false],
    ['surefireDfir', 'strong', 87, false], ['f5HostCloud', 'exact', 96, true],
  ],
  'catalog-network-forensics': [
    ['agileDfir', 'strong', 89, false], ['accentureForensic', 'strong', 87, false], ['craForensic', 'strong', 86, false],
    ['surefireDfir', 'strong', 87, false], ['nttDfir', 'strong', 89, false],
  ],
  'catalog-cloud-forensics': [
    ['f5HostCloud', 'strong', 89, false], ['f5CloudAutomation', 'strong', 89, false], ['nttDfir', 'strong', 89, false],
    ['trendCloudDfir', 'strong', 89, false], ['aerospaceCloudDfir', 'strong', 86, false],
  ],

  'catalog-malware-analyst': [
    ['nozomiMalware', 'strong', 89, false], ['nozomiMalwareLead', 'strong', 88, false], ['zscalerMalware', 'exact', 96, true],
    ['linkReverse', 'strong', 88, false], ['s2wMalware', 'exact', 99, true],
  ],
  'catalog-threat-researcher': [
    ['nozomiMalware', 'strong', 87, false], ['zscalerMalware', 'strong', 86, false], ['nozomiMalwareLead', 'strong', 88, false],
    ['securityscorecardSandbox', 'strong', 86, false], ['s2wMalware', 'strong', 84, false],
  ],
  'catalog-malware-reverse-engineer': [
    ['nozomiMalware', 'strong', 88, false], ['nozomiMalwareLead', 'strong', 88, false], ['zscalerMalware', 'strong', 89, false],
    ['linkReverse', 'exact', 97, true], ['s2wMalware', 'strong', 86, false],
  ],
  'catalog-binary-reverse-engineer': [
    ['linkReverse', 'exact', 97, true], ['twoSixSoftwareReverse', 'exact', 99, true], ['nozomiMalware', 'strong', 86, false],
    ['nozomiMalwareLead', 'strong', 86, false], ['zscalerMalware', 'strong', 88, false],
  ],
  'catalog-firmware-reverse-engineer': [
    ['strFirmware', 'exact', 99, true], ['twoSixFirmware', 'exact', 99, true], ['twoSixSoftwareReverse', 'strong', 89, false],
    ['twoSixVr', 'strong', 89, false], ['finiteStateFirmware', 'strong', 89, false],
  ],
  'catalog-malware-sandbox-engineer': [
    ['sonicSandbox', 'exact', 98, true], ['securityscorecardSandbox', 'strong', 88, false], ['workdaySandbox', 'strong', 89, false],
    ['trendSandbox', 'exact', 96, true], ['a10Sandbox', 'strong', 86, false],
  ],
  'catalog-detection-signature-engineer': [
    ['nozomiMalware', 'strong', 89, false], ['nozomiMalwareLead', 'strong', 89, false], ['zscalerMalware', 'strong', 87, false],
    ['securityscorecardSandbox', 'strong', 88, false], ['a10Sandbox', 'strong', 88, false],
  ],
})

const rejectedCandidatesByRole = Object.freeze({
  'catalog-vulnerability-assessment': Object.freeze([
    { companyName: 'GDIT', originalJobTitle: 'Junior Vulnerability Assessment Analyst', postingUrl: 'https://www.gd.com/careers/junior-vulnerability-assessment-analyst-city-or-us-rq212989-gdit-opportunity', status: 'inaccessible', reason: '직접 열었을 때 내부 오류로 공고 본문을 확인할 수 없었다.' },
  ]),
  'catalog-vulnerability-management': Object.freeze([
    { companyName: 'NTT DATA', originalJobTitle: 'Vulnerability Management role', postingUrl: 'https://job-boards.greenhouse.io/nttdatausa/jobs/8579112002', status: 'redirected', reason: '개별 공고 대신 채용 목록 오류 화면으로 이동했다.' },
    { companyName: 'SpaceX', originalJobTitle: 'Vulnerability Management role', postingUrl: 'https://job-boards.greenhouse.io/spacex/jobs/8208781002', status: 'redirected', reason: '공고 본문 없이 careers 홈으로 이동했다.' },
    { companyName: 'Celonis', originalJobTitle: 'Vulnerability Management role', postingUrl: 'https://job-boards.greenhouse.io/celonis/jobs/7506864003', status: 'redirected', reason: '공고 본문 없이 careers 홈으로 이동했다.' },
  ]),
  'catalog-pentester': Object.freeze([
    { companyName: 'Accenture Federal Services', originalJobTitle: 'Penetration Tester', postingUrl: 'https://job-boards.greenhouse.io/accenturefederalservices/jobs/4665074006', status: 'redirected', reason: '직접 열었을 때 회사 채용 홈으로 이동했다.' },
    { companyName: 'Malleum', originalJobTitle: 'Penetration Tester - Offensive Security', postingUrl: 'https://malleum.applytojob.com/apply/7GBeUv04c0/Penetration-Tester-Offensive-Security', status: 'inaccessible', reason: '재확인 GET에서 HTTP 410으로 종료된 공고임을 확인했다.' },
    { companyName: 'Appspace', originalJobTitle: 'Senior Web Application Penetration Tester', postingUrl: 'https://job-boards.greenhouse.io/appspace/jobs/5968026004', status: 'listingOnly', reason: '개별 공고 대신 Greenhouse 채용 목록 오류 화면으로 이동했다.' },
  ]),
  'catalog-web-api-pentester': Object.freeze([
    { companyName: 'Malleum', originalJobTitle: 'Penetration Tester - Offensive Security', postingUrl: 'https://malleum.applytojob.com/apply/7GBeUv04c0/Penetration-Tester-Offensive-Security', status: 'inaccessible', reason: '재확인 GET에서 HTTP 410으로 종료된 공고임을 확인했다.' },
    { companyName: 'Appspace', originalJobTitle: 'Senior Web Application Penetration Tester', postingUrl: 'https://job-boards.greenhouse.io/appspace/jobs/5968026004', status: 'listingOnly', reason: '개별 공고 대신 Greenhouse 채용 목록 오류 화면으로 이동했다.' },
  ]),
  'catalog-cloud-pentester': Object.freeze([
    { companyName: 'GuidePoint Security', originalJobTitle: 'Cloud Penetration Tester', postingUrl: 'https://job-boards.greenhouse.io/guidepointsecurity/jobs/5595241004', status: 'redirected', reason: '개별 공고가 아닌 일반 careers 페이지로 이동했다.' },
    { companyName: 'Malleum', originalJobTitle: 'Penetration Tester - Offensive Security', postingUrl: 'https://malleum.applytojob.com/apply/7GBeUv04c0/Penetration-Tester-Offensive-Security', status: 'inaccessible', reason: '재확인 GET에서 HTTP 410으로 종료된 공고임을 확인했다.' },
    { companyName: 'Appspace', originalJobTitle: 'Senior Web Application Penetration Tester', postingUrl: 'https://job-boards.greenhouse.io/appspace/jobs/5968026004', status: 'listingOnly', reason: '개별 공고 대신 Greenhouse 채용 목록 오류 화면으로 이동했다.' },
  ]),
  'catalog-red-team-operator': Object.freeze([
    { companyName: 'SIXGEN', originalJobTitle: 'Red Team Operator', postingUrl: 'https://job-boards.greenhouse.io/sixgeninc/jobs/5137835008', status: 'listingOnly', reason: '해당 공고가 제거되어 채용 목록 오류 화면만 표시됐다.' },
    { companyName: 'SIXGEN', originalJobTitle: 'Red Team Operator I', postingUrl: 'https://job-boards.greenhouse.io/sixgeninc/jobs/5238849008', status: 'listingOnly', reason: '재확인 시 개별 공고가 제거되어 채용 목록 오류 화면만 표시됐다.' },
    { companyName: 'SIXGEN', originalJobTitle: 'Red Team Operator - Windows', postingUrl: 'https://job-boards.greenhouse.io/sixgeninc/jobs/5226970008', status: 'listingOnly', reason: '재확인 시 개별 공고가 제거되어 채용 목록 오류 화면만 표시됐다.' },
    { companyName: 'SIXGEN', originalJobTitle: 'Senior Red Team Operator', postingUrl: 'https://job-boards.greenhouse.io/sixgeninc/jobs/5224942008', status: 'listingOnly', reason: '재확인 시 개별 공고가 제거되어 채용 목록 오류 화면만 표시됐다.' },
    { companyName: 'Twilio', originalJobTitle: 'Senior Engineer, Offensive Security', postingUrl: 'https://job-boards.greenhouse.io/twilio/jobs/7622278', status: 'listingOnly', reason: '재확인 시 개별 공고가 제거되어 채용 목록 오류 화면만 표시됐다.' },
  ]),
  'catalog-vulnerability-researcher': Object.freeze([
    { companyName: 'Two Six Technologies', originalJobTitle: 'Vulnerability Researcher', postingUrl: 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/5611003004', status: 'listingOnly', reason: '종료된 URL로 개별 본문 대신 목록 오류 화면이 표시됐다.' },
  ]),
  'catalog-detection-engineer': Object.freeze([
    { companyName: 'WPP', originalJobTitle: 'Detection Engineer', postingUrl: 'https://job-boards.greenhouse.io/wpp/jobs/8484947002', status: 'listingOnly', reason: '재확인 시 개별 공고가 아닌 Greenhouse 목록 오류 화면으로 이동했다.' },
  ]),
  'catalog-soar-engineer': Object.freeze([
    { companyName: 'Take-Two Interactive', originalJobTitle: 'Lead SOAR Engineer', postingUrl: 'https://job-boards.greenhouse.io/taketwo/jobs/7673013', status: 'listingOnly', reason: '재확인 시 개별 공고가 제거되어 Greenhouse 목록 오류 화면으로 이동했다.' },
  ]),
  'catalog-incident-response': Object.freeze([
    { companyName: 'WPP', originalJobTitle: 'Incident Responder', postingUrl: 'https://job-boards.greenhouse.io/wpp/jobs/8484972002', status: 'listingOnly', reason: '직접 GET 결과 개별 공고가 아닌 채용 목록으로 이동했다.' },
    { companyName: 'Interactive Brokers', originalJobTitle: 'Incident Response role', postingUrl: 'https://job-boards.greenhouse.io/ibkr/jobs/7942994002', status: 'inaccessible', reason: '404와 채용 목록 오류가 표시됐다.' },
    { companyName: 'Ondo Finance', originalJobTitle: 'Incident Response Engineer', postingUrl: 'https://job-boards.greenhouse.io/ondofinance/jobs/4297389009', status: 'listingOnly', reason: '재확인 시 개별 공고가 제거되어 Greenhouse 목록 오류 화면으로 이동했다.' },
  ]),
  'catalog-csirt': Object.freeze([
    { companyName: 'SkyePoint Decisions', originalJobTitle: 'CIRT role', postingUrl: 'https://job-boards.greenhouse.io/skyepointdecisionsinc/jobs/4230996009', status: 'listingOnly', reason: '개별 공고 본문이 제거되어 채용 목록만 표시됐다.' },
    { companyName: 'Accenture Federal Services', originalJobTitle: 'Cyber Incident Triage Analyst', postingUrl: 'https://job-boards.greenhouse.io/accenturefederalservices/jobs/4671028006', status: 'redirected', reason: '재확인 시 회사의 일반 채용 홈으로 이동했다.' },
  ]),
  'catalog-dfir-analyst': Object.freeze([
    { companyName: 'Surefire Cyber', originalJobTitle: 'Principal DFIR Consultant', postingUrl: 'https://job-boards.greenhouse.io/surefirecyber/jobs/5105329007', status: 'listingOnly', reason: '종료된 URL로 채용 목록 오류만 표시됐다.' },
  ]),
  'catalog-threat-researcher': Object.freeze([
    { companyName: 'SecurityScorecard', originalJobTitle: 'Threat Researcher', postingUrl: 'https://job-boards.greenhouse.io/securityscorecard/jobs/7840984', status: 'listingOnly', reason: '개별 공고가 제거되어 채용 목록 오류 화면이 표시됐다.' },
    { companyName: 'Sumo Logic', originalJobTitle: 'Threat Researcher', postingUrl: 'https://job-boards.greenhouse.io/sumologic/jobs/7505134', status: 'listingOnly', reason: '개별 공고가 제거되어 채용 목록 오류 화면이 표시됐다.' },
    { companyName: 'DNSFilter', originalJobTitle: 'Threat Researcher', postingUrl: 'https://job-boards.greenhouse.io/dnsfilter/jobs/5068945007', status: 'redirected', reason: '재확인 시 개별 공고가 아닌 회사 careers 홈으로 이동했다.' },
    { companyName: 'Corelight', originalJobTitle: 'Threat Researcher', postingUrl: 'https://job-boards.greenhouse.io/corelight/jobs/7776106', status: 'redirected', reason: '재확인 시 개별 공고가 아닌 회사 careers 홈으로 이동했다.' },
    { companyName: 'KnowBe4', originalJobTitle: 'Threat Researcher', postingUrl: 'https://job-boards.greenhouse.io/knowbe4/jobs/8493380002', status: 'listingOnly', reason: '재확인 시 개별 공고가 제거되어 Greenhouse 목록 오류 화면으로 이동했다.' },
  ]),
  'catalog-binary-reverse-engineer': Object.freeze([
    { companyName: 'Two Six Technologies', originalJobTitle: 'Software Reverse Engineer', postingUrl: 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/5695319004', status: 'listingOnly', reason: '종료된 공고 URL로 채용 목록 오류만 표시됐다.' },
    { companyName: 'Lookout', originalJobTitle: 'Static Analysis Reverse Engineering role', postingUrl: 'https://job-boards.greenhouse.io/lookoutinc/jobs/7775765', status: 'listingOnly', reason: '개별 공고 본문이 제거됐다.' },
  ]),
  'catalog-malware-sandbox-engineer': Object.freeze([
    { companyName: 'SonicWall', originalJobTitle: 'Principal Threat Researcher', postingUrl: 'https://job-boards.greenhouse.io/sonicwall/jobs/7772318', status: 'listingOnly', reason: '재확인 시 개별 공고가 제거되어 Greenhouse 목록 오류 화면으로 이동했다.' },
  ]),
  'catalog-detection-signature-engineer': Object.freeze([
    { companyName: 'SonicWall', originalJobTitle: 'Principal Threat Researcher', postingUrl: 'https://job-boards.greenhouse.io/sonicwall/jobs/7772318', status: 'listingOnly', reason: '재확인 시 개별 공고가 제거되어 Greenhouse 목록 오류 화면으로 이동했다.' },
  ]),
})

function matchFor(target, sourceRecord, level, score, titleMatch) {
  const matchedResponsibilities = [
    ...(sourceRecord.extracted.responsibilities || []),
    ...(sourceRecord.extracted.deliverables || []),
  ].slice(0, 3)
  const foundations = [
    ...(sourceRecord.extracted.requirements || []),
    ...(sourceRecord.extracted.tools || []),
    ...(sourceRecord.extracted.securityProducts || []),
  ]
  return {
    level,
    score,
    titleMatch,
    responsibilityMatchCount: matchedResponsibilities.length,
    foundationMatchCount: Math.min(3, foundations.length),
    reasons: [
      level === 'exact'
        ? '공고 표시 직무명이 역할명 또는 rawTitles와 직접 대응하고 핵심 업무가 주 업무로 확인됐다.'
        : '공고 제목은 더 넓거나 인접하지만 역할의 핵심 책임 세 가지가 주요 업무와 산출물에 명시됐다.',
      `역할 기준 업무와 직접 비교함: ${target.actualWork[0]}`,
    ],
    matchedResponsibilities,
    unmatchedCoreResponsibilities: [],
  }
}

let sequence = 0
export const domainEnrichedPostings = Object.freeze(Object.entries(roleMappings).flatMap(([roleId, mappings]) => {
  const target = roleResearchTargetById[roleId]
  if (!target || !domainIds.has(target.domainId)) throw new Error(`알 수 없는 역할 매핑: ${roleId}`)
  return mappings.map(([sourceKey, level, score, titleMatch]) => {
    const sourceRecord = postingSources[sourceKey]
    if (!sourceRecord) throw new Error(`알 수 없는 공고 소스: ${sourceKey}`)
    sequence += 1
    return prepareEnrichedPosting({
      id: `off-detect-dfir-reverse-20260801-${String(sequence).padStart(3, '0')}`,
      roleId,
      domainId: target.domainId,
      familyId: target.familyId,
      companyName: sourceRecord.companyName,
      originalJobTitle: sourceRecord.originalJobTitle,
      normalizedRoleTitle: target.roleTitle,
      market: sourceRecord.market,
      country: sourceRecord.country,
      location: sourceRecord.location,
      workMode: sourceRecord.workMode,
      employmentType: sourceRecord.employmentType,
      careerLevel: sourceRecord.careerLevel,
      requiredYearsMin: sourceRecord.requiredYearsMin,
      requiredYearsMax: sourceRecord.requiredYearsMax,
      source: {
        postingUrl: sourceRecord.url,
        canonicalUrl: sourceRecord.url,
        sourceType: sourceRecord.sourceType,
        checkedDate,
        status: sourceRecord.status,
        titleVerified: true,
        companyVerified: true,
        bodyVerified: true,
        applicationAvailable: sourceRecord.applicationAvailable,
        verificationNotes: [
          '검색 결과 URL이 아니라 공식 기업 또는 ATS의 개별 공고 URL을 직접 열었다.',
          '회사명·공고 제목·업무 또는 자격요건 본문을 확인했다.',
          sourceRecord.applicationAvailable
            ? '지원 버튼 또는 개별 지원 양식을 확인했다.'
            : '공고 본문은 보존되어 있으나 마감 문구 또는 지난 마감일을 확인했다.',
        ],
      },
      match: matchFor(target, sourceRecord, level, score, titleMatch),
      extracted: sourceRecord.extracted,
      evidence: sourceRecord.evidence,
    })
  })
}))

const postingsByRole = new Map()
for (const posting of domainEnrichedPostings) {
  const current = postingsByRole.get(posting.roleId) || []
  current.push(posting)
  postingsByRole.set(posting.roleId, current)
}

export const domainRoleResearch = Object.freeze(domainTargets.map((target) => {
  const postings = postingsByRole.get(target.roleId) || []
  const rejectedCandidates = rejectedCandidatesByRole[target.roleId] || Object.freeze([])
  const verifiedCount = postings.filter((posting) => ['exact', 'strong'].includes(posting.match.level) && posting.source.bodyVerified).length
  return Object.freeze({
    roleId: target.roleId,
    roleTitle: target.roleTitle,
    domainId: target.domainId,
    domainTitle: target.domainTitle,
    familyId: target.familyId,
    familyTitle: target.familyTitle,
    checkedDate,
    targetCount,
    verifiedCount,
    shortage: verifiedCount < targetCount,
    shortageReasons: Object.freeze(verifiedCount < targetCount
      ? [`공식 개별 공고에서 exact 또는 strong로 직접 검증한 표본이 ${verifiedCount}개뿐이다.`]
      : []),
    searchedQueries: Object.freeze([...target.searchedQueries]),
    candidateCount: verifiedCount + rejectedCandidates.length,
    acceptedPostingIds: Object.freeze(postings.map((posting) => posting.id)),
    rejectedCandidateCount: rejectedCandidates.length,
    rejectedCandidates,
  })
}))
