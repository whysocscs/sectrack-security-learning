const sources = Object.freeze({
  asset: { label: 'NIST CSRC Glossary · asset', url: 'https://csrc.nist.gov/glossary/term/asset' },
  vulnerability: { label: 'NIST CSRC Glossary · vulnerability', url: 'https://csrc.nist.gov/glossary/term/vulnerability' },
  attackSurface: { label: 'NIST CSRC Glossary · attack surface', url: 'https://csrc.nist.gov/glossary/term/attack_surface' },
  cia: { label: 'NIST CSRC Glossary · CIA', url: 'https://csrc.nist.gov/glossary/term/confidentiality_integrity_availability' },
  cve: { label: 'CVE Program · Overview', url: 'https://www.cve.org/About/Overview' },
  cwe: { label: 'MITRE CWE · About', url: 'https://cwe.mitre.org/about/' },
  cvss: { label: 'FIRST · CVSS v4.0 Specification', url: 'https://www.first.org/cvss/v4.0/specification-document' },
  cce: { label: 'NIST SCAP · Common Configuration Enumeration', url: 'https://csrc.nist.gov/Projects/Security-Content-Automation-Protocol/SCAP-Releases/scap-1-3' },
  zeroDay: { label: 'NIST CSRC Glossary · zero-day attack', url: 'https://csrc.nist.gov/glossary/term/zero_day_attack' },
  kev: { label: 'CISA · Known Exploited Vulnerabilities Catalog', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' },
  patch: { label: 'NIST CSRC Glossary · patch', url: 'https://csrc.nist.gov/glossary/term/patch' },
  exploit: { label: 'NIST SP 800-115 · Technical Guide to Security Testing', url: 'https://csrc.nist.gov/pubs/sp/800/115/final' },
  payload: { label: 'NIST CSRC Glossary · payload', url: 'https://csrc.nist.gov/glossary/term/payload' },
  fuzzing: { label: 'NIST SP 800-115 · Technical Guide to Security Testing', url: 'https://csrc.nist.gov/pubs/sp/800/115/final' },
  nice: { label: 'NIST · NICE Framework Resource Center', url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center' },
  penetrationTest: { label: 'NIST CSRC Glossary · penetration testing', url: 'https://csrc.nist.gov/glossary/term/penetration_testing' },
  malware: { label: 'NIST CSRC Glossary · malware', url: 'https://csrc.nist.gov/glossary/term/malware' },
  phishing: { label: 'CISA · Recognize and Report Phishing', url: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing' },
  socialEngineering: { label: 'NIST CSRC Glossary · social engineering', url: 'https://csrc.nist.gov/glossary/term/social_engineering' },
  privilegeEscalation: { label: 'MITRE ATT&CK · Exploitation for Privilege Escalation', url: 'https://attack.mitre.org/techniques/T1068/' },
  lateralMovement: { label: 'MITRE ATT&CK · Lateral Movement', url: 'https://attack.mitre.org/tactics/TA0008/' },
  commandControl: { label: 'MITRE ATT&CK · Command and Control', url: 'https://attack.mitre.org/tactics/TA0011/' },
  authentication: { label: 'NIST SP 800-63-4 · Digital Identity Guidelines', url: 'https://csrc.nist.gov/pubs/sp/800/63/4/final' },
  authorization: { label: 'NIST CSRC Glossary · authorization', url: 'https://csrc.nist.gov/glossary/term/authorization' },
  leastPrivilege: { label: 'NIST CSRC Glossary · least privilege', url: 'https://csrc.nist.gov/glossary/term/least_privilege' },
  firewall: { label: 'NIST SP 800-41 Rev. 1 · Firewalls and Firewall Policy', url: 'https://csrc.nist.gov/pubs/sp/800/41/r1/final' },
  idsIps: { label: 'NIST SP 800-94 · Intrusion Detection and Prevention Systems', url: 'https://csrc.nist.gov/pubs/sp/800/94/final' },
  edr: { label: "CISA · Improving the Nation's Cybersecurity", url: 'https://www.cisa.gov/topics/cybersecurity-best-practices/executive-order-improving-nations-cybersecurity' },
})

function term({ id, title, englishName, koreanName, category, definitionEnglish, definitionKorean, explanation, source, ...detail }) {
  return {
    id,
    title,
    englishName,
    koreanName,
    category,
    definitionEnglish,
    definitionKorean,
    explanation,
    sources: [source],
    ...detail,
  }
}

export const glossaryCategories = Object.freeze([
  { id: 'foundation', label: '보안 기본 모델' },
  { id: 'vulnerability-management', label: '취약점 분류·관리' },
  { id: 'discovery-exploitation', label: '취약점 발견·이용 기술' },
  { id: 'security-work', label: '보안 업무 관점·활동' },
  { id: 'attack-stages', label: '공격 수법·침해 단계' },
  { id: 'access-control', label: '접근 통제' },
  { id: 'defense-control', label: '탐지·방어 통제' },
])

export const glossaryCaseStudies = Object.freeze({
  asset: {
    label: '실제 기사로 먼저 보기',
    title: '보안 사고는 미식별 자산에서 시작된다',
    url: 'https://m.boannews.com/html/detail.html?idx=142952&tab_type=1',
    sourceLabel: '보안뉴스 · 2026-04-01',
    summary: '조직이 존재를 파악하지 못한 장비·클라우드 인프라·SaaS·개인 업무 장비는 점검, 패치, 접근 통제에서 빠질 수 있습니다. 기사는 자산 가시성이 확보되지 않으면 취약점 관리도 완전할 수 없다고 설명합니다.',
    emphasis: '자산',
  },
  vulnerability: {
    label: '용어 혼동 사례',
    title: "우리는 무엇을 '취약점'이라 부르는가",
    url: 'https://www.etnews.com/20250924000259',
    sourceLabel: '전자신문 · 2025-09-24',
    summary: '현장에서 CVE, CWE, CCE를 모두 같은 종류의 취약점으로 부르면 실제 제품 취약점, 약점 유형, 보안 설정 식별자를 같은 우선순위로 처리하는 오류가 생길 수 있다는 문제를 제기합니다. 아래 공식 정의를 기준으로 각 용어의 역할을 분리해 읽어야 합니다.',
  },
  attackSurface: {
    label: '기사에서 두 표현 찾기',
    title: 'Gogs RCE 제로데이 악용과 CISA의 패치 지시',
    url: 'https://www.bleepingcomputer.com/news/security/cisa-orders-feds-to-patch-gogs-rce-flaw-exploited-in-zero-day-attacks/',
    sourceLabel: 'BleepingComputer · 2026-01-12',
    summary: '기사에서 취약점은 공격자가 악용하는 attack vector로 설명되고, 공개 가입을 끄고 VPN이나 허용 목록으로 접근을 제한하는 조치는 attack surface를 줄이는 방법으로 제시됩니다.',
  },
})

export const assetTypeExamples = Object.freeze([
  ['정보·데이터', '개인정보, 학사정보, 소스코드, 암호키, 계약서', '유출, 위변조, 삭제'],
  ['하드웨어', '서버, PC, 노트북, 저장장치, 네트워크 장비', '도난, 파손, 장애'],
  ['소프트웨어', '운영체제, 웹 애플리케이션, DBMS, 보안 프로그램', '악성코드 감염, 취약점 악용'],
  ['서비스', '홈페이지, 결제 서비스, 이메일, 클라우드 서비스', '서비스 중단, 성능 저하'],
  ['계정·인증정보', '관리자 계정, API 키, 인증서, 비밀번호', '계정 탈취, 권한 오남용'],
  ['사람·역량', '관리자, 개발자, 보안 담당자의 전문지식', '내부자 위협, 핵심 인력 이탈'],
  ['무형자산', '기업 평판, 신뢰도, 특허, 업무 노하우', '침해사고로 인한 신뢰 하락'],
])

export const vulnerabilityTermComparison = Object.freeze([
  ['CVE', '공개된 특정 제품·버전의 취약점을 식별', 'CVE-연도-번호', 'CVE Program'],
  ['CWE', '취약점으로 이어질 수 있는 소프트웨어·하드웨어 약점 유형을 분류', 'CWE-79, CWE-787', 'MITRE CWE'],
  ['CVSS', '취약점의 기술적 심각도 특성을 점수와 벡터로 표현', 'CVSS:4.0/...', 'FIRST'],
  ['CCE', '제품의 보안 관련 구성 설정을 공통 식별자로 연결', 'CCE-...-...', 'NIST SCAP'],
])

export const attackSurfaceComparison = Object.freeze([
  ['Attack vector · 공격 벡터', '공격자가 목표에 도달하거나 취약점을 악용하는 구체적인 경로·수단', 'Gogs의 취약한 API를 이용해 파일을 덮어쓰는 경로'],
  ['Attack surface · 공격 표면', '공격자가 진입·영향·정보 추출을 시도할 수 있는 모든 노출 지점의 집합', '인터넷에 공개된 Gogs 서버, 공개 가입, API, 계정, 관리 경로 전체'],
])

export const ciaCvssConnections = Object.freeze([
  ['기밀성 · Confidentiality', '허가된 주체만 정보에 접근하고 공개할 수 있게 한다.', '개인정보·암호키가 권한 없는 사람에게 노출됨', 'CVSS v4의 VC·SC가 성공적인 악용 뒤 정보 공개 영향을 표현'],
  ['무결성 · Integrity', '정보와 시스템이 허가 없이 변경되지 않고, 변경을 신뢰할 수 있게 한다.', '성적·결제금액·설정 파일이 임의로 바뀜', 'CVSS v4의 VI·SI가 데이터와 시스템 변경 영향을 표현'],
  ['가용성 · Availability', '필요한 사용자가 필요한 시점에 정보와 서비스를 사용할 수 있게 한다.', '웹·DB·이메일 서비스가 중단되거나 심각하게 느려짐', 'CVSS v4의 VA·SA가 서비스 접근 불가와 성능 저하 영향을 표현'],
])

export const securityGlossary = Object.freeze([
  term({
    id: 'asset', title: '자산', englishName: 'Asset', koreanName: '자산', category: 'foundation',
    definitionEnglish: 'Anything that has value to a person or organization.',
    definitionKorean: '개인이나 조직에 가치가 있는 모든 것.',
    explanation: '보안에서 자산은 서버 같은 물건에만 한정되지 않습니다. 데이터, 계정, 서비스, 사람의 전문지식, 평판처럼 손실되거나 훼손됐을 때 조직과 이해관계자에게 영향을 주는 대상까지 포함합니다.',
    source: sources.asset,
    additionalDefinitions: [
      { english: 'A major application, general support system, high impact program, physical plant, mission critical system, personnel, equipment, or a logically related group of systems.', korean: '주요 애플리케이션, 일반 지원 시스템, 고영향 프로그램, 물리 시설, 핵심 임무 시스템, 인력, 장비 또는 논리적으로 연결된 시스템 그룹.', attribution: 'CNSSI 4009-2015' },
      { english: 'An item of value to stakeholders.', korean: '이해관계자에게 가치가 있는 항목.', attribution: 'NIST SP 800-160 Vol. 2 Rev. 1' },
      { english: 'Resources of value that an organization possesses or employs.', korean: '조직이 소유하거나 활용하는 가치 있는 자원.', attribution: 'NISTIR 8011 Vol. 1' },
    ],
    caseStudy: glossaryCaseStudies.asset,
    exampleTable: { headers: ['자산 유형', '실제 예시', '손실이 발생하는 상황'], rows: assetTypeExamples },
  }),
  term({
    id: 'attack-surface', title: '공격 표면', englishName: 'Attack Surface', koreanName: '공격 표면', category: 'foundation',
    definitionEnglish: 'The complete set of exposed points where an attacker can try to enter, cause an effect, or extract data.',
    definitionKorean: '공격자가 진입하거나 영향을 주거나 데이터를 빼내려 시도할 수 있는 노출 지점 전체.',
    explanation: '공격 표면은 포트 몇 개만 뜻하지 않습니다. 인터넷 공개 서비스, API, 관리자 기능, 계정 복구, 외부 의존성, 사람과 운영 절차까지 공격자가 접촉할 수 있는 경계를 함께 봅니다.',
    source: sources.attackSurface,
    caseStudy: glossaryCaseStudies.attackSurface,
    comparisonTable: { headers: ['구분', '뜻', '기사에 적용한 예'], rows: attackSurfaceComparison },
  }),
  term({
    id: 'cia', title: 'CIA Triad', englishName: 'Confidentiality, Integrity, Availability', koreanName: '기밀성·무결성·가용성', category: 'foundation',
    definitionEnglish: 'Security objectives centered on confidentiality, integrity, and availability.',
    definitionKorean: '기밀성, 무결성, 가용성을 중심으로 시스템이 지켜야 할 보안 목표를 정리한 모델.',
    explanation: 'CIA Triad가 중요한 이유는 “무엇을 막을 것인가”를 침해 결과로 나눠 설명하게 해주기 때문입니다. 같은 취약점이라도 정보 유출, 데이터 변조, 서비스 중단 중 어떤 영향이 발생하는지에 따라 필요한 통제와 우선순위가 달라집니다.',
    source: sources.cia,
    secondarySources: [sources.cvss],
    connectionTable: { headers: ['보안 목표', '의미', '침해 예시', 'CVSS와의 연결'], rows: ciaCvssConnections },
    note: 'CIA는 조직과 시스템이 지킬 목표이고, CVSS는 특정 취약점이 악용됐을 때 기밀성·무결성·가용성에 미치는 기술적 영향을 벡터와 점수에 반영합니다. 둘은 같은 것이 아니라 “보안 목표”와 “취약점 영향 측정”의 관계입니다.',
  }),
  term({
    id: 'vulnerability', title: '취약점', englishName: 'Vulnerability', koreanName: '취약점', category: 'foundation',
    definitionEnglish: 'A weakness that can be exploited or triggered to produce an unwanted security outcome.',
    definitionKorean: '악용되거나 촉발됐을 때 원치 않는 보안 결과를 만들 수 있는 약점.',
    explanation: '취약점은 설계, 구현, 설정, 운영 과정의 약점입니다. 취약점의 존재만으로 조직의 최종 위험이 결정되지는 않으며, 실제 설치 여부, 외부 노출, 악용 가능성, 자산 중요도, 기존 통제를 함께 봐야 합니다.',
    source: sources.vulnerability,
    caseStudy: glossaryCaseStudies.vulnerability,
    comparisonTable: { headers: ['용어', '무엇을 가리키나', '표현 예', '관리 주체'], rows: vulnerabilityTermComparison },
    nextTermIds: ['cve', 'cwe', 'cvss', 'cce'],
  }),

  term({ id: 'cve', title: 'CVE', englishName: 'Common Vulnerabilities and Exposures', koreanName: '공통 취약점 및 노출', category: 'vulnerability-management', definitionEnglish: 'A common identifier for a specific publicly disclosed cybersecurity vulnerability.', definitionKorean: '공개된 특정 사이버보안 취약점을 여러 조직이 같은 이름으로 참조하도록 만든 공통 식별자.', explanation: 'CVE는 취약점 자체의 이름표 역할을 합니다. CVE 번호만으로 심각도, 실제 악용 여부, 우리 조직의 설치 여부까지 알 수는 없으므로 CVSS, 벤더 권고, CISA KEV, 자산 정보를 함께 확인합니다.', source: sources.cve }),
  term({ id: 'cwe', title: 'CWE', englishName: 'Common Weakness Enumeration', koreanName: '공통 약점 열거', category: 'vulnerability-management', definitionEnglish: 'A community-developed list of software and hardware weaknesses that can become vulnerabilities.', definitionKorean: '취약점으로 이어질 수 있는 소프트웨어·하드웨어 약점 유형을 정리한 공동 분류 목록.', explanation: 'CWE는 특정 제품 한 건의 취약점 번호가 아니라 결함의 유형과 근본 원인을 설명합니다. 예를 들어 여러 제품의 서로 다른 CVE가 같은 입력 검증 약점인 CWE-79와 연결될 수 있습니다.', source: sources.cwe }),
  term({ id: 'cvss', title: 'CVSS', englishName: 'Common Vulnerability Scoring System', koreanName: '공통 취약점 평가 시스템', category: 'vulnerability-management', definitionEnglish: 'A framework for describing the technical characteristics and severity of a vulnerability.', definitionKorean: '취약점의 기술적 특성과 심각도를 일관된 벡터와 점수로 표현하는 체계.', explanation: 'CVSS v4는 공격 경로·복잡성·필요 권한·사용자 상호작용과 함께 취약 시스템 및 후속 시스템의 기밀성·무결성·가용성 영향을 표현합니다. CVSS 점수는 조직의 자산 가치와 실제 노출을 포함한 최종 위험 점수가 아닙니다.', source: sources.cvss }),
  term({ id: 'cce', title: 'CCE', englishName: 'Common Configuration Enumeration', koreanName: '공통 구성 설정 열거', category: 'vulnerability-management', definitionEnglish: 'Common identifiers for security-related configuration settings across hardware and software products.', definitionKorean: '하드웨어와 소프트웨어 제품의 보안 관련 구성 설정을 공통으로 식별하기 위한 체계.', explanation: 'CCE는 CVE처럼 특정 제품 취약점을 식별하는 번호가 아닙니다. 계정 잠금 임계값, 서비스 권한처럼 사람이 이해할 수 있는 보안 구성 효과와 구현 설정을 여러 지침·도구 사이에서 연결합니다.', source: sources.cce }),
  term({ id: 'zero-day', title: 'Zero-day', englishName: 'Zero-day Vulnerability / Attack', koreanName: '제로데이 취약점·공격', category: 'vulnerability-management', definitionEnglish: 'A vulnerability or attack used before an effective fix or sufficient defensive preparation is available.', definitionKorean: '효과적인 수정책이나 충분한 방어 준비가 마련되기 전에 악용되는 취약점 또는 공격 상황.', explanation: 'Zero-day는 CVE 번호가 없다는 뜻과 동일하지 않습니다. 핵심은 공격자가 악용하는 시점과 공급자·사용자가 수정·탐지·대응을 준비한 시점 사이의 공백입니다.', source: sources.zeroDay }),
  term({ id: 'one-day', title: 'One-day·N-day', englishName: 'One-day / N-day Vulnerability', koreanName: '원데이·엔데이 취약점', category: 'vulnerability-management', definitionEnglish: 'An industry expression for a known vulnerability whose disclosure or fix is already available.', definitionKorean: '취약점과 수정 정보가 이미 알려졌지만 아직 적용되지 않은 환경을 노리는 상황을 가리키는 현업 표현.', explanation: '공식 식별 체계 이름이 아니라 공개 이후의 시간과 패치 지연을 강조하는 표현입니다. 공개된 CVE가 CISA KEV에 올라 실제 악용이 확인됐다면 자산 노출과 완화 상태를 빠르게 확인해야 합니다.', source: sources.kev }),
  term({ id: 'patch', title: 'Patch', englishName: 'Patch', koreanName: '패치·수정 업데이트', category: 'vulnerability-management', definitionEnglish: 'A change applied to software or firmware to correct a defect or vulnerability.', definitionKorean: '소프트웨어나 펌웨어의 결함 또는 취약점을 바로잡기 위해 적용하는 변경.', explanation: '패치는 설치만으로 끝나지 않습니다. 대상 버전과 자산 범위를 확인하고, 백업·변경 절차를 거쳐 적용한 뒤 취약 경로가 막혔는지와 정상 기능이 유지되는지 재시험해야 합니다.', source: sources.patch }),

  term({ id: 'exploit', title: 'Exploit', englishName: 'Exploit', koreanName: '취약점 이용 방법·코드', category: 'discovery-exploitation', definitionEnglish: 'A method or code that takes advantage of a vulnerability to produce unintended behavior.', definitionKorean: '취약점을 이용해 의도하지 않은 동작을 일으키는 방법이나 코드.', explanation: '취약점은 약점이고 Exploit은 그 약점을 실제 조건에서 이용하는 구체적인 입력·절차·코드입니다. 이 과정에서는 로컬 또는 명시적으로 허가된 실습 환경에서만 무해한 결과로 검증합니다.', source: sources.exploit }),
  term({ id: 'payload', title: 'Payload', englishName: 'Payload', koreanName: '실행 내용·전달 데이터', category: 'discovery-exploitation', definitionEnglish: 'The data, command, or code intended to run or take effect after an exploit succeeds.', definitionKorean: 'Exploit이 성공한 뒤 실행되거나 효과를 내도록 의도된 데이터, 명령 또는 코드.', explanation: 'Exploit과 Payload는 같은 말이 아닙니다. Exploit이 취약 조건을 성립시키는 부분이라면 Payload는 그 성공 뒤 수행할 행동입니다. 안전 실습에서는 외부 통신이나 실제 정보 접근 대신 고정된 표시 문자열만 사용합니다.', source: sources.payload }),
  term({ id: 'fuzzing', title: 'Fuzzing', englishName: 'Fuzz Testing', koreanName: '퍼즈 테스트', category: 'discovery-exploitation', definitionEnglish: 'Testing that supplies varied, malformed, or boundary inputs to discover unexpected behavior.', definitionKorean: '다양한 비정상·경계 입력을 주어 예상하지 못한 동작과 실패를 찾는 테스트 기법.', explanation: 'Fuzzing은 입력 생성에서 끝나지 않습니다. 관찰 가능한 실패를 재현하고, 원인 입력을 축소하고, 도달 가능성과 보안 영향을 판단한 뒤 수정과 재시험으로 연결해야 합니다.', source: sources.fuzzing }),

  term({ id: 'offensive-security', title: 'Offensive Security', englishName: 'Offensive Security', koreanName: '공격 관점 보안', category: 'security-work', definitionEnglish: 'Authorized security work that examines systems from an attacker perspective to find and validate weaknesses.', definitionKorean: '허가된 범위에서 공격자 관점으로 시스템을 살펴 약점과 공격 경로를 찾고 검증하는 보안 업무.', explanation: '모의해킹, Red Team, 취약점 연구처럼 목적과 산출물이 다른 활동을 포함할 수 있습니다. 공통 전제는 명시적 허가, 대상·시간·기법 범위, 최소 영향, 재현 가능한 증거와 개선 제안입니다.', source: sources.nice }),
  term({ id: 'defensive-security', title: 'Defensive Security', englishName: 'Defensive Security', koreanName: '방어 관점 보안', category: 'security-work', definitionEnglish: 'Security work focused on prevention, detection, investigation, response, recovery, and improvement.', definitionKorean: '공격의 예방·탐지·조사·대응·복구와 지속적인 개선에 초점을 둔 보안 업무.', explanation: 'Defensive Security는 경보만 보는 일이 아닙니다. 자산·구성·취약점 관리부터 로그와 탐지 규칙, 사고 대응, 복구, 재발 방지까지 여러 역할과 산출물을 연결합니다.', source: sources.nice }),
  term({ id: 'penetration-testing', title: 'Penetration Testing', englishName: 'Penetration Testing', koreanName: '모의침투 테스트', category: 'security-work', definitionEnglish: 'Authorized testing that simulates attacks to evaluate whether vulnerabilities can be exploited and what impact follows.', definitionKorean: '허가된 범위에서 공격을 모의해 취약점의 실제 성립 조건과 영향을 평가하는 테스트.', explanation: 'Rules of Engagement에 대상, 계정, 시간, 허용 기법, 중단 조건을 정하고 수행합니다. 공개된 웹사이트라고 해서 테스트 권한이 생기는 것은 아니며, 결과는 재현 단계·영향·수정·재시험으로 보고합니다.', source: sources.penetrationTest }),

  term({ id: 'malware', title: 'Malware', englishName: 'Malicious Software', koreanName: '악성 소프트웨어', category: 'attack-stages', definitionEnglish: 'Software or firmware intended to perform an unauthorized process that harms confidentiality, integrity, or availability.', definitionKorean: '기밀성·무결성·가용성을 해치는 비인가 동작을 수행하도록 만들어진 소프트웨어 또는 펌웨어.', explanation: '랜섬웨어, 트로이목마, 웜 등은 전달·실행·지속성·정보 탈취·파괴 목적이 다를 수 있습니다. 의심 파일은 개인 PC에서 실행하지 않고 격리된 분석 환경에서 정적·동적 근거를 함께 봅니다.', source: sources.malware }),
  term({ id: 'phishing', title: 'Phishing', englishName: 'Phishing', koreanName: '피싱', category: 'attack-stages', definitionEnglish: 'Messages or sites that impersonate a trusted source to make people reveal information or take unsafe actions.', definitionKorean: '신뢰할 만한 사람·기관·서비스처럼 위장해 정보 제공이나 위험한 행동을 유도하는 수법.', explanation: '피싱은 이메일에만 한정되지 않습니다. 문자, 메신저, 전화, QR 코드, 협업 도구와 가짜 로그인 화면을 통해 자격 증명 입력, 송금, 파일 실행, MFA 승인을 유도할 수 있습니다.', source: sources.phishing }),
  term({ id: 'social-engineering', title: 'Social Engineering', englishName: 'Social Engineering', koreanName: '사회공학', category: 'attack-stages', definitionEnglish: 'Manipulating people and organizational processes to disclose information or bypass security controls.', definitionKorean: '사람의 신뢰와 조직 절차를 조작해 정보를 얻거나 보안 통제를 우회하는 방식.', explanation: '기술적 취약점이 없어도 긴급함, 권위, 호기심, 업무 관행을 이용할 수 있습니다. 교육뿐 아니라 콜백 확인, 이중 승인, 신원 검증, 신고 채널 같은 절차적 통제가 필요합니다.', source: sources.socialEngineering }),
  term({ id: 'privilege-escalation', title: 'Privilege Escalation', englishName: 'Privilege Escalation', koreanName: '권한 상승', category: 'attack-stages', definitionEnglish: 'Gaining higher permissions than those initially available to an account or process.', definitionKorean: '계정이나 프로세스가 처음 가진 것보다 더 높은 권한을 획득하는 행위.', explanation: '취약한 드라이버, 서비스 설정, 파일 권한, 토큰과 자격 증명 오용 등을 통해 일반 사용자에서 관리자·시스템 권한으로 범위를 넓힐 수 있습니다. 최소 권한과 패치, 권한 변경 탐지가 함께 필요합니다.', source: sources.privilegeEscalation }),
  term({ id: 'lateral-movement', title: 'Lateral Movement', englishName: 'Lateral Movement', koreanName: '측면 이동', category: 'attack-stages', definitionEnglish: 'Moving from an initially compromised position to other accounts, systems, or services inside an environment.', definitionKorean: '처음 침해한 위치에서 내부의 다른 계정·시스템·서비스로 접근 범위를 넓히는 행위.', explanation: '재사용된 자격 증명, 원격 관리 도구, 신뢰 관계와 공유 서비스가 이동 경로가 될 수 있습니다. 내부망도 자동으로 신뢰하지 않고 계정·호스트·네트워크를 분리하며 인증 로그와 원격 실행 맥락을 봅니다.', source: sources.lateralMovement }),
  term({ id: 'c2', title: 'C2', englishName: 'Command and Control', koreanName: '명령 및 제어', category: 'attack-stages', definitionEnglish: 'Techniques adversaries use to communicate with and control compromised systems.', definitionKorean: '공격자가 침해한 시스템과 통신하고 명령을 전달하며 결과를 받는 데 사용하는 기법.', explanation: 'C2는 특정 프로토콜 하나가 아닙니다. 정상 웹·DNS·클라우드 서비스를 가장할 수도 있으므로 목적지뿐 아니라 프로세스, 계정, 주기, 전송량, 앞뒤 행위를 함께 분석해야 합니다.', source: sources.commandControl }),

  term({ id: 'authentication', title: 'Authentication', englishName: 'Authentication', koreanName: '인증', category: 'access-control', definitionEnglish: 'Verifying that a claimant controls one or more authenticators associated with a subscriber account.', definitionKorean: '사용자가 계정과 연결된 인증수단을 실제로 통제하는지 확인하는 과정.', explanation: '비밀번호, OTP, 보안키, 인증서 등을 사용해 주장한 신원을 확인합니다. 인증 성공은 “누구인가”를 확인한 것이며, 특정 데이터와 기능을 사용할 권한까지 자동으로 부여하지는 않습니다.', source: sources.authentication }),
  term({ id: 'authorization', title: 'Authorization', englishName: 'Authorization', koreanName: '인가·권한 부여', category: 'access-control', definitionEnglish: 'Determining whether a subject is permitted to perform an operation on a resource.', definitionKorean: '주체가 특정 자원에서 어떤 작업을 수행하도록 허용됐는지 결정하는 과정.', explanation: '서버는 요청마다 주체, 역할, 대상 객체, 행동의 관계를 검증해야 합니다. 화면에서 버튼을 숨기는 것만으로는 인가가 되지 않으며 API와 데이터 접근 경계에서 실제 허용 여부를 확인해야 합니다.', source: sources.authorization }),
  term({ id: 'least-privilege', title: 'Least Privilege', englishName: 'Principle of Least Privilege', koreanName: '최소 권한 원칙', category: 'access-control', definitionEnglish: 'Granting only the minimum privileges necessary to complete assigned tasks.', definitionKorean: '맡은 작업을 수행하는 데 필요한 최소한의 권한만 부여하는 원칙.', explanation: '사람 계정뿐 아니라 서비스 계정, API 토큰, 애플리케이션 역할에도 적용합니다. 최초 부여 뒤에도 직무 변경, 예외 승인, 미사용 권한, 퇴직과 계정 수명을 정기적으로 검토하고 회수해야 합니다.', source: sources.leastPrivilege }),

  term({ id: 'firewall', title: 'Firewall', englishName: 'Firewall', koreanName: '방화벽', category: 'defense-control', definitionEnglish: 'A device or program that controls network traffic between networks or hosts with different security postures.', definitionKorean: '보안 수준이 다른 네트워크나 호스트 사이의 통신을 정책에 따라 통제하는 장치 또는 프로그램.', explanation: '주소, 포트, 프로토콜, 연결 상태, 애플리케이션 규칙을 사용해 허용·차단하고 기록합니다. 방화벽은 접근 경로를 줄이지만 서버 인가, 안전한 코드, 패치, 엔드포인트 탐지를 대신하지 않습니다.', source: sources.firewall }),
  term({ id: 'ids-ips', title: 'IDS·IPS', englishName: 'Intrusion Detection / Prevention System', koreanName: '침입 탐지·방지 시스템', category: 'defense-control', definitionEnglish: 'Systems that monitor events for signs of incidents and may attempt to stop detected activity.', definitionKorean: '사고 징후를 찾기 위해 이벤트를 관찰하고, 배치 방식에 따라 탐지된 행위를 차단할 수 있는 시스템.', explanation: 'IDS는 주로 탐지와 경보에, IPS는 통신 경로에서 차단까지 수행하는 데 초점을 둡니다. 시그니처·행위 규칙의 범위, 암호화 트래픽, 오탐과 우회 가능성을 고려해 튜닝하고 다른 로그와 상관분석합니다.', source: sources.idsIps }),
  term({ id: 'edr', title: 'EDR', englishName: 'Endpoint Detection and Response', koreanName: '엔드포인트 탐지 및 대응', category: 'defense-control', definitionEnglish: 'Technology that records endpoint activity to support threat detection, investigation, and response.', definitionKorean: '엔드포인트 활동을 기록해 위협 탐지, 조사, 대응을 지원하는 기술.', explanation: 'PC와 서버의 프로세스 트리, 파일, 계정, 레지스트리, 네트워크 연결 등을 연결해 조사하고 필요하면 격리·차단합니다. EDR 경보는 침해 확정이 아니므로 정상 업무 맥락과 다른 증거를 함께 확인해야 합니다.', source: sources.edr }),
])

export const glossarySources = Object.freeze(Object.values(sources))
