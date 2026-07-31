const sources = Object.freeze({
  asset: { label: 'NIST CSRC Glossary · asset', url: 'https://csrc.nist.gov/glossary/term/asset' },
  vulnerability: { label: 'NIST CSRC Glossary · vulnerability', url: 'https://csrc.nist.gov/glossary/term/vulnerability' },
  attackSurface: { label: 'NIST CSRC Glossary · attack surface', url: 'https://csrc.nist.gov/glossary/term/attack_surface' },
  cia: { label: 'NIST CSRC Glossary · CIA', url: 'https://csrc.nist.gov/glossary/term/confidentiality_integrity_availability' },
  cve: { label: 'CVE Program · Overview', url: 'https://www.cve.org/About/Overview' },
  redHatCve: { label: 'Red Hat · CVE란?', url: 'https://www.redhat.com/ko/topics/security/what-is-cve' },
  ibmCve: { label: 'IBM · CVE란 무엇인가요?', url: 'https://www.ibm.com/kr-ko/think/topics/cve' },
  fortinetCve: { label: 'Fortinet · CVE란 무엇입니까?', url: 'https://www.fortinet.com/kr/resources/cyberglossary/cve' },
  cwe: { label: 'MITRE CWE · About', url: 'https://cwe.mitre.org/about/' },
  cweTop25: { label: '보안뉴스 · 2024 CWE Top 25', url: 'https://www.boannews.com/media/view.asp?idx=134613' },
  cvss: { label: 'FIRST · CVSS v4.0 Specification', url: 'https://www.first.org/cvss/v4.0/specification-document' },
  cvssExamples: { label: 'FIRST · CVSS v4.0 Examples', url: 'https://www.first.org/cvss/v4.0/examples' },
  cvssArticle: { label: '보안뉴스 · CVSS 4.0 변화', url: 'https://m.boannews.com/html/detail.html?idx=123582' },
  copyFail: { label: 'NVD · CVE-2026-31431', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-31431' },
  zeroDay: { label: 'NIST CSRC Glossary · zero-day attack', url: 'https://csrc.nist.gov/glossary/term/zero_day_attack' },
  bugBounty: { label: 'OWASP · Vulnerability Disclosure', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html' },
  zerodium: { label: 'WIRED · Zerodium의 제로데이 거래 시장', url: 'https://www.wired.com/2015/11/heres-a-spy-firms-price-list-for-secret-hacker-techniques/' },
  crowdfense: { label: 'Crowdfense · Zero-day Acquisition Program', url: 'https://www.crowdfense.com/' },
  kev: { label: 'CISA · Known Exploited Vulnerabilities Catalog', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' },
  patch: { label: 'NIST CSRC Glossary · patch', url: 'https://csrc.nist.gov/glossary/term/patch' },
  exploit: { label: 'NIST SP 800-115 · Technical Guide to Security Testing', url: 'https://csrc.nist.gov/pubs/sp/800/115/final' },
  mitreExploit: { label: 'MITRE ATT&CK · Exploit Public-Facing Application', url: 'https://attack.mitre.org/techniques/T1190/' },
  cisaPoc: { label: 'CISA · SSVC Exploitation Guidance', url: 'https://www.cisa.gov/sites/default/files/publications/cisa-ssvc-guide%20508c.pdf' },
  payload: { label: 'NIST CSRC Glossary · payload', url: 'https://csrc.nist.gov/glossary/term/payload' },
  fuzzing: { label: 'NIST CSRC Glossary · Fuzz Testing', url: 'https://csrc.nist.gov/glossary/term/Fuzz_Testing' },
  googleFuzzing: { label: 'Google · OSS-Fuzz', url: 'https://google.github.io/oss-fuzz/' },
  owaspFuzzing: { label: 'OWASP · Fuzzing', url: 'https://owasp.org/www-community/Fuzzing' },
  nice: { label: 'NIST · NICE Framework Resource Center', url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center' },
  penetrationTest: { label: 'NIST CSRC Glossary · penetration testing', url: 'https://csrc.nist.gov/glossary/term/penetration_testing' },
  malware: { label: 'NIST CSRC Glossary · malware', url: 'https://csrc.nist.gov/glossary/term/malware' },
  phishing: { label: 'CISA · Recognize and Report Phishing', url: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing' },
  socialEngineering: { label: 'NIST CSRC Glossary · social engineering', url: 'https://csrc.nist.gov/glossary/term/social_engineering' },
  commandControl: { label: 'MITRE ATT&CK · Command and Control', url: 'https://attack.mitre.org/tactics/TA0011/' },
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
    detailParagraphs: glossaryDetailParagraphs[id] || [],
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
])

export const glossaryCaseStudies = Object.freeze({
  asset: {
    label: '예시)',
    title: '보안 사고는 미식별 자산에서 시작된다',
    url: 'https://m.boannews.com/html/detail.html?idx=142952&tab_type=1',
    sourceLabel: '보안뉴스 · 2026-04-01',
    excerpt: '보안 사고는 취약점이 아니라 ‘보이지 않는 자산’에서 시작된다.',
    summary: '보안뉴스는 이 기사에서 조직이 보유 사실조차 파악하지 못한 장비, 클라우드 인프라, SaaS, 개인 업무 장비가 보안 점검과 패치, 접근 통제에서 빠질 수 있다고 설명했습니다. 기사에서 실제로 강조한 내용은 보안 제품을 더 설치하기 전에 먼저 어떤 자산이 어디에 있고 누가 관리하는지 알아야 한다는 것입니다. 자산을 모르면 취약점이 발견돼도 어느 시스템에 조치해야 하는지 판단할 수 없으므로, 자산 가시성이 보안 관리의 출발점이 됩니다.',
    emphasis: '자산',
  },
  vulnerability: {
    label: '예시)',
    title: '같은 취약점을 다른 이름으로 관리할 때 생기는 문제',
    url: 'https://www.etnews.com/20250924000259',
    sourceLabel: '전자신문 · 2025-09-24',
    excerpt: '용어의 정확한 정의와 혼동이 왜 위험한지를 명확히 밝힌다.',
    summary: '전자신문은 이 글에서 보안 용어를 모두 같은 의미의 취약점으로 받아들이면 조치 우선순위가 왜곡될 수 있다고 지적했습니다. CVE는 특정 제품에서 확인된 개별 취약점을 공통 번호로 식별하고, CWE는 여러 제품에서 반복되는 약점의 유형을 분류합니다. CVSS는 그 개별 취약점의 기술적 심각도를 비교하는 도구입니다. 따라서 보안 담당자는 번호와 점수만 보지 말고, 우리 조직의 어느 제품과 버전이 영향을 받는지까지 이어서 판단해야 합니다.',
  },
  attackSurface: {
    label: '예시)',
    title: 'Gogs RCE 제로데이 악용과 CISA의 패치 지시',
    url: 'https://www.bleepingcomputer.com/news/security/cisa-orders-feds-to-patch-gogs-rce-flaw-exploited-in-zero-day-attacks/',
    sourceLabel: 'BleepingComputer · 2026-01-12',
    excerpt: 'This type of vulnerability is a frequent attack vector for malicious cyber actors and poses significant risks to the federal enterprise, CISA warned.',
    summary: 'BleepingComputer는 CISA의 표현을 인용해 Gogs의 원격 코드 실행 취약점을 공격자가 시스템에 침투할 때 이용하는 attack vector라고 소개했습니다. 같은 기사에서는 기본으로 열려 있는 공개 가입을 끄고, VPN이나 허용 목록으로 서버 접근을 제한하는 조치를 attack surface를 줄이는 방법으로 제시했습니다. 기사에서 실제로 두 표현을 이렇게 나누어 쓴 이유는 간단합니다. Attack vector는 공격자가 들어오는 구체적인 경로이고, attack surface는 공격자가 접촉할 수 있는 노출 지점 전체이기 때문입니다.',
  },
  cve: {
    label: '예시)',
    title: 'CVSS 4.0은 무엇을 더 보게 되었나',
    url: 'https://m.boannews.com/html/detail.html?idx=123582',
    sourceLabel: '보안뉴스 · 2023-11-09',
    excerpt: 'CVSS는 여러 기준 및 가이드라인 중 하나일 뿐입니다.',
    summary: '보안뉴스는 CVSS 4.0이 취약점의 기본 특성만 보는 데서 더 나아가 실제 위협과 조직 환경을 함께 표현하도록 바뀌었다고 설명했습니다. 기사에서 실제로 강조한 내용은 CVSS 점수 하나가 모든 보안 문제의 답이 될 수 없다는 점입니다. CVSS 4.0은 공격 요구 조건과 취약 시스템·후속 시스템의 영향을 구분하고, 위협과 환경 지표를 더 명확하게 나눴습니다. 따라서 같은 CVE라도 공개된 기본 점수만 복사하는 데 그치지 말고 실제 악용 여부, 시스템 노출 상태, 자산 중요도를 함께 봐야 합니다.',
  },
  cwe: {
    label: '예시)',
    title: '2024년 가장 위험한 소프트웨어 약점 25개',
    url: 'https://www.boannews.com/media/view.asp?idx=134613',
    sourceLabel: '보안뉴스 · 2024-11-25',
    excerpt: '이 목록은 CVE가 아니라 CWE 형식으로 문제를 열거한다.',
    summary: '보안뉴스는 MITRE가 CVE가 부여된 3만 1천여 건의 취약점을 분석해 반복적으로 큰 피해를 만드는 약점 유형을 추렸다고 전했습니다. 기사에서 실제로 설명한 것처럼 CVE가 특정 제품에서 발견된 개별 취약점을 가리킨다면, CWE는 여러 제품에서 되풀이되는 원인과 약점 유형을 가리킵니다. 아래 상위 5개는 2024년 발표 당시 순위와 기사에 실린 KEV 건수를 기준으로 정리한 것입니다.',
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

export const ciaCvssCases = Object.freeze([
  ['C:H/I:N/A:N', '정보를 읽을 수 있지만 변경하거나 서비스를 중단시키지는 않음', 'Heartbleed · CVE-2014-0160', '7.5', { text: '캐나다 국세청 납세자 약 900명의 개인정보가 유출됐다.', url: 'https://www.canada.ca/en/news/archive/2014/04/statement-from-interim-privacy-commissioner-canada-regarding-heartbleed.html' }],
  ['C:H/I:H/A:N', '정보를 읽고 인증서 같은 신뢰 체계를 훼손할 수 있음', 'CurveBall · CVE-2020-0601', '8.1', { text: 'NSA가 Windows 인증서 검증 취약점을 공개했다. 확인된 실제 악용 사례는 아니었다.', url: 'https://www.nsa.gov/Press-Room/News-Highlights/Article/Article/2056772/a-very-important-patch-tuesday/' }],
  ['C:H/I:N/A:H', '정보가 노출되고 서비스가 중단될 수 있음', 'NGINX · CVE-2026-42946', '7.4', { text: '워커 메모리 노출과 프로세스 재시작이 가능한 영향 사례다. NVD에는 실제 악용이 확인되지 않은 것으로 기록돼 있다.', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-42946' }],
  ['C:H/I:H/A:H', '정보 탈취, 변조, 서비스 중단이 모두 가능함', 'Log4Shell · CVE-2021-44228', '10.0', { text: '공개 직후 광범위한 스캔과 원격 코드 실행 공격이 이어져 각국 기관이 긴급 대응 지침을 냈다.', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-356a' }],
  ['C:N/I:H/A:N', '정보 노출보다 보호 경계와 데이터 신뢰성 훼손이 중심임', 'Apple WebKit · CVE-2023-32409', '8.6', { text: '실제 악용이 확인돼 CISA KEV에 포함된 WebKit 샌드박스 탈출 취약점이다.', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext=CVE-2023-32409' }],
  ['C:N/I:H/A:H', '시스템 상태를 변조하고 정상 동작을 중단시킬 수 있음', 'Apple Kernel · CVE-2022-32847', '9.1', { text: '커널 메모리 손상과 예기치 않은 시스템 종료가 가능한 영향 사례다. 실제 악용이 확인된 사례는 아니다.', url: 'https://nvd.nist.gov/vuln/detail/CVE-2022-32847' }],
  ['C:N/I:N/A:H', '정보를 읽거나 바꾸지 않고 서비스 이용만 방해함', 'HTTP/2 Rapid Reset · CVE-2023-44487', '7.5', { text: 'Google 서비스와 고객을 겨냥한 공격은 초당 3억 9,800만 요청을 넘겼지만 방어돼 장애로 이어지지는 않았다.', url: 'https://cloud.google.com/blog/ko/products/identity-security/how-it-works-http2-rapid-reset-ddos?hl=ko' }],
])

export const copyFailCvssComparison = Object.freeze([
  ['공격 위치', 'AV:L · Local', 'AV:L · Local', '공격자가 해당 Linux 시스템에서 코드를 실행할 수 있어야 함'],
  ['공격 복잡도', 'AC:L · Low', 'AC:L · Low', '특별한 우회 기술이나 복잡한 조건이 필요하지 않음'],
  ['별도의 공격 조건', '별도 항목 없음', 'AT:N · None', '레이스 컨디션처럼 공격자 통제 밖의 특정 조건이 필요하지 않음'],
  ['필요한 권한', 'PR:L · Low', 'PR:L · Low', '일반 사용자 수준의 낮은 권한이 필요함'],
  ['사용자 개입', 'UI:N · None', 'UI:N · None', '다른 사용자가 파일을 열거나 링크를 누를 필요가 없음'],
  ['기밀성 영향', 'C:H · High', 'VC:H · High', 'root 권한을 얻으면 시스템의 보호된 정보를 읽을 수 있음'],
  ['무결성 영향', 'I:H · High', 'VI:H · High', 'root 권한으로 시스템 설정과 파일을 변경할 수 있음'],
  ['가용성 영향', 'A:H · High', 'VA:H · High', 'root 권한으로 서비스를 중단하거나 시스템을 손상시킬 수 있음'],
  ['영향 범위', 'S:U · Unchanged', 'SC:N/SI:N/SA:N', '평가된 영향은 취약한 Linux 시스템에 한정되고 후속 시스템 영향은 없음'],
])

export const cweTopFive = Object.freeze([
  ['1위', 'CWE-79', 'Cross-site Scripting', '사용자 입력이 안전하게 처리되지 않아 브라우저에서 공격자 스크립트가 실행되는 약점', '3건'],
  ['2위', 'CWE-787', 'Out-of-bounds Write', '프로그램이 허용된 메모리 범위 밖에 데이터를 써서 충돌이나 코드 실행으로 이어질 수 있는 약점', '18건'],
  ['3위', 'CWE-89', 'SQL Injection', '입력값이 SQL 명령의 일부로 해석돼 데이터 조회·변경이나 인증 우회로 이어지는 약점', '4건'],
  ['4위', 'CWE-352', 'Cross-Site Request Forgery', '로그인된 사용자의 브라우저가 의도하지 않은 요청을 보내게 만드는 약점', '0건'],
  ['5위', 'CWE-22', 'Path Traversal', '경로 입력을 제한하지 않아 허용된 디렉터리 밖의 파일에 접근하게 되는 약점', '4건'],
])

export const zeroDayLifecycle = Object.freeze([
  {
    title: 'Zero-day',
    paragraphs: [
      '제로데이(Zero-day) 취약점은 소프트웨어 개발사나 보안 담당자가 아직 인지하지 못했거나, 문제를 알고 있어도 이를 수정하는 공식 패치가 제공되지 않은 상태의 취약점을 말합니다. 취약점이 공격에 악용되고 있다는 사실이 공개돼도 패치가 없다면 방어자는 취약한 기능을 끄고 접근 범위를 제한하거나 탐지 규칙을 추가하는 임시 완화 조치로 시간을 벌어야 합니다.',
      '보안 연구자가 제로데이를 발견하면 개발사나 버그바운티 프로그램에 제보하고 보상받을 수 있습니다. 버그바운티는 정해진 범위에서 발견한 취약점을 조직에 전달해 수정과 사용자 보호로 연결하는 것이 목적입니다. 반면 취약점과 실제 공격 코드를 비공개로 사고파는 시장도 존재합니다. 과거 대표적인 브로커 Zerodium은 독점적인 제로데이 익스플로잇을 구매해 정부기관과 기업 고객에게 제공했고, 현재도 Crowdfense처럼 제로데이 연구와 익스플로잇을 구매하는 플랫폼이 운영되고 있습니다. 이런 거래는 연구의 경제적 가치를 인정하지만 개발사에 정보가 전달되지 않으면 패치가 늦어지고 공격에 사용될 수 있다는 윤리적 논쟁을 만듭니다.',
    ],
  },
  {
    title: 'Patch',
    paragraphs: [
      '패치(Patch)는 개발사나 운영체제 배포사가 취약점을 수정하기 위해 제공하는 코드 또는 보안 업데이트입니다. 예를 들어 Linux 커널의 Copy-on-Write 처리에서 발생한 Dirty COW(CVE-2016-5195)가 공개됐을 때 사용자는 운영체제 전체를 무조건 새 버전으로 바꾸는 대신 각 배포판이 제공한 수정 커널 패키지나 보안 업데이트를 적용했습니다.',
      '패치가 나오면 먼저 우리 조직에 영향을 받는 제품과 버전이 있는지 확인하고, 시험 환경에서 호환성과 재부팅 여부를 점검한 뒤 운영 환경에 배포해야 합니다. 설치 기록만 남기는 것으로 끝내지 않고 실제 버전이 바뀌었는지, 취약한 동작이 더 이상 재현되지 않는지 다시 확인해야 합니다.',
    ],
  },
  {
    title: 'One-day · N-day',
    paragraphs: [
      '원데이 또는 엔데이 취약점은 취약점의 존재와 기술 정보가 공개되고, 일반적으로 패치나 완화 방법도 알려진 뒤 아직 업데이트하지 않은 시스템을 노리는 상황을 말합니다. CVE 번호가 부여됐다는 사실만으로 곧바로 원데이가 되는 것은 아니며, 공격자가 공개된 분석이나 패치 전후의 코드 차이를 보고 작동 원리를 파악할 수 있는 상태인지가 중요합니다.',
      '공격자는 공개된 PoC를 재현하거나 패치를 역분석해 공격 코드를 만들고, 여전히 취약한 버전을 사용하는 시스템을 찾습니다. 패치가 존재한다는 사실은 안전하다는 뜻이 아니라 방어자가 조치할 수단을 얻었다는 뜻입니다. 조직은 자산과 버전을 신속히 식별하고 패치 적용 여부를 확인해 공개 시점부터 실제 적용까지의 노출 기간을 줄여야 합니다.',
    ],
  },
])

export const cveSourceNotes = Object.freeze([
  { source: sources.redHatCve, text: 'Red Hat은 CVE 항목이 취약점을 구분하는 간략한 기록이며 위험, 영향, 수정 방법 같은 세부 정보는 NVD나 벤더 권고에서 확인해야 한다고 설명합니다.' },
  { source: sources.ibmCve, text: 'IBM은 CVE ID가 서로 다른 플랫폼과 저장소에서 동일한 취약점을 가리키게 하는 공통 언어라고 설명하고, CVSS는 CVE와 별개이지만 함께 사용되는 심각도 평가 체계라고 구분합니다.' },
  { source: sources.fortinetCve, text: 'Fortinet은 CVE 목록이 공개된 결함을 식별하고 공유해 조직의 보안 방어와 취약점 관리를 돕는 참조 체계라는 점을 강조합니다.' },
])

export const glossaryAssignments = Object.freeze({
  malware: {
    title: '과제 #1 · 멀웨어 유형 조사',
    prompt: '멀웨어 유형을 최소 5가지 조사하고, 이름만 나열하지 말고 감염·확산 방식과 주요 목적을 비교하세요.',
    requirements: ['바이러스, 웜, 트로이 목마의 차이 포함', '랜섬웨어와 스파이웨어가 노리는 자산 설명', '각 유형의 대표적인 유입 경로 또는 실행 조건 작성', '하나의 멀웨어가 여러 유형의 행동을 함께 수행할 수 있는 사례 제시', '확인한 출처 URL과 열람 날짜 기록'],
  },
  c2: {
    title: '과제 #2 · C2 서버의 구축 방식과 통신 시작 과정 조사',
    prompt: 'C2 서버가 공격에 활용되기 위해 어떤 방식으로 구축되거나 확보되는지 최소 3가지를 조사하고, 감염된 시스템이 처음 통신을 시작하는 일반적인 과정을 설명하세요.',
    requirements: ['C2 인프라를 직접 구축하거나 확보하는 방식 최소 3가지', '각 방식의 특징과 공격자가 선택하는 이유', '감염된 시스템이 C2 주소를 확인하고 접속하는 과정', '비콘과 아웃바운드 통신의 의미', '정상 클라우드·웹 서비스를 C2로 악용할 때 탐지가 어려운 이유', '조사는 공개 자료만 사용하고 실제 C2 서버를 구축하거나 외부 시스템에 연결하지 않기'],
  },
})

const glossaryDetailParagraphs = Object.freeze({
  asset: [
    '자산을 관리한다는 것은 목록에 이름만 적어 두는 일이 아닙니다. 자산마다 소유자, 위치, 사용 목적, 저장하거나 처리하는 데이터, 외부 공개 여부, 다른 시스템과의 의존 관계를 함께 기록해야 합니다. 그래야 사고가 발생했을 때 무엇이 영향을 받았고 누구에게 연락해야 하며 어떤 순서로 복구해야 하는지 판단할 수 있습니다. 예를 들어 같은 웹 서버라도 개인 연습용 서버와 결제 서비스를 운영하는 서버는 중단됐을 때의 영향이 전혀 다르므로 보호 수준과 대응 우선순위도 달라집니다.',
    '보안 업무는 결국 자산을 기준으로 이어집니다. 취약점 관리는 어떤 자산에 결함이 있는지 찾는 일이고, 접근 통제는 누가 그 자산을 사용할 수 있는지 정하는 일이며, 관제는 자산에서 평소와 다른 행동이 일어나는지 살피는 일입니다. 따라서 자산 목록이 오래됐거나 담당자가 불분명하면 방화벽, EDR, 취약점 스캐너가 있어도 관리 밖에 남는 영역이 생깁니다.',
  ],
  'attack-surface': [
    'Attack surface를 파악할 때는 먼저 외부에서 보이는 도메인, IP, 포트, 웹 화면, API를 찾고, 그 뒤 계정 생성과 비밀번호 재설정, 관리자 기능, 업로드 기능, 협력사 연결, 클라우드 권한처럼 내부로 이어지는 접점을 살펴봅니다. 여기에 퇴사자 계정, 기본 비밀번호, 사용하지 않는 서비스처럼 운영 과정에서 생긴 접점도 포함됩니다. 이 목록이 곧 공격자가 선택할 수 있는 후보 경로 전체입니다.',
    'Attack vector는 그중 실제 공격에 사용되는 하나의 방법이나 경로를 가리킵니다. 피싱 메일의 악성 링크, 인터넷에 공개된 취약한 API, 탈취한 VPN 계정은 각각 공격 벡터가 될 수 있습니다. 사용하지 않는 기능을 끄고, 외부 공개 범위를 줄이고, 강한 인증과 네트워크 분리를 적용하면 공격 표면이 줄어듭니다. 그렇다고 필요한 서비스를 무조건 닫는 것이 목표는 아니며, 업무에 필요한 접점은 남기되 누가 어떤 조건에서 접근할 수 있는지 명확히 통제하는 것이 핵심입니다.',
  ],
  cia: [
    '기밀성은 정보를 볼 수 있는 사람을 제한하고, 무결성은 정보와 시스템이 허가 없이 바뀌지 않았음을 보장하며, 가용성은 필요한 순간에 서비스와 데이터를 사용할 수 있게 하는 목표입니다. 예를 들어 병원 시스템에서는 진료 기록이 외부에 노출되지 않아야 하고, 처방 내용이 임의로 바뀌지 않아야 하며, 응급 상황에도 시스템을 사용할 수 있어야 합니다. 세 목표 중 하나만 지켜서는 안전한 시스템이라고 말하기 어렵습니다.',
    'CIA Triad는 보안 기능의 이름이 아니라 피해를 질문하는 기준입니다. 이 문제가 정보 노출로 이어지는지, 데이터나 설정을 바꿀 수 있게 하는지, 서비스를 멈추게 하는지를 차례로 물으면 기술적 영향이 구체적으로 보입니다. CVSS도 취약점이 악용됐을 때 취약 시스템과 후속 시스템의 기밀성, 무결성, 가용성에 미치는 영향을 점수 계산에 사용합니다. 다만 CVSS는 취약점의 기술적 심각도를 표현하는 도구이므로, 실제 우선순위는 해당 자산의 중요도와 노출 상태, 현재 악용 여부까지 더해 정해야 합니다.',
  ],
  vulnerability: [
    '취약점은 단순히 프로그램이 비정상 종료되는 버그와도 다릅니다. 결함 때문에 권한 없는 사용자가 다른 사람의 정보를 읽거나, 서버에서 명령을 실행하거나, 중요한 기능을 멈출 수 있을 때 보안상 취약점이 됩니다. 같은 코드 결함이라도 공격자가 해당 기능에 도달할 수 있는지, 인증이 필요한지, 다른 통제가 막고 있는지에 따라 실제 악용 가능성은 달라집니다.',
    '현장에서 취약점을 확인할 때는 제품명과 버전, 취약한 기능, 필요한 공격 조건, 성공했을 때의 영향, 수정 방법을 한 묶음으로 봅니다. “CVE가 나왔다”는 말만으로는 대응 대상을 정할 수 없습니다. 우리 조직에 해당 버전이 설치돼 있는지, 외부에서 접근 가능한지, 실제 악용 사례가 있는지, 패치가 어렵다면 기능 비활성화나 접근 제한으로 임시 완화할 수 있는지까지 확인해야 비로소 조치 계획이 됩니다.',
  ],
  cve: [
    '동일한 취약점을 연구자, 개발사, 보안업체가 서로 다른 명칭이나 자체 관리번호로 표현하면 정보 공유와 취약점 관리에 혼란이 생깁니다. CVE는 이런 혼란을 줄이기 위해 공개된 개별 취약점마다 전 세계에서 공통으로 사용할 수 있는 고유 식별번호를 부여하는 체계입니다. 각 기관이 붙인 제품명이나 설명이 달라도 CVE ID가 같다면 같은 취약점을 가리킵니다. CVE-2026-31431처럼 CVE, 연도, 일련번호로 구성되며 CVE 번호 자체에는 심각도나 공격 성공 여부가 담기지 않습니다.',
    'CVSS(Common Vulnerability Scoring System)는 CVE로 식별한 취약점이 기술적으로 얼마나 심각한지를 공통 기준으로 평가하는 점수 체계입니다. CVE가 취약점을 구분하는 이름표라면 CVSS는 공격 위치, 공격 복잡도, 필요한 권한, 사용자 개입, 기밀성·무결성·가용성 영향을 분석해 0.0점부터 10.0점까지 표현합니다. 점수만 보지 말고 어떤 조건과 영향을 선택했는지 나타내는 벡터 문자열까지 함께 읽어야 합니다.',
    'CVSS v4.0은 v3.1의 평가 기준을 더 구체적으로 나눴습니다. 공격 성공에 필요한 별도 조건을 Attack Requirements로 분리하고, 취약한 시스템에 생기는 영향과 그 뒤 다른 시스템에 번지는 영향을 구분합니다. 위협 지표와 조직 환경, 산업제어시스템의 안전 영향도 표현할 수 있습니다. 같은 취약점이라도 버전에 따라 평가 항목과 계산 방식이 달라 점수가 달라질 수 있으며, 실제 공격 여부와 자산 중요도까지 포함한 조직의 최종 위험 점수는 아닙니다.',
  ],
  cwe: [
    '동일한 보안 약점을 연구자와 보안업체마다 서로 다른 명칭으로 표현하면 취약점 분류와 원인 분석에 혼란이 생깁니다. CWE는 소프트웨어와 하드웨어에서 반복적으로 발생하는 약점의 유형마다 공통 식별번호를 부여하는 체계입니다. 서로 다른 제품에서 발견된 여러 CVE라도 발생 원인이나 약점 유형이 같다면 동일한 CWE로 분류될 수 있습니다.',
    '예를 들어 CVE는 특정 브라우저나 웹 애플리케이션에서 발견된 XSS 한 건을 가리키지만, CWE-79는 사용자 입력을 웹 페이지에 안전하게 처리하지 않아 XSS가 생기는 약점 유형 전체를 가리킵니다. 개발자는 CWE를 기준으로 같은 실수가 다른 코드에도 반복됐는지 찾고, 코드 리뷰 규칙과 보안 코딩 교육, 정적 분석 기준을 개선할 수 있습니다.',
  ],
  cvss: [
    'CVSS 벡터에는 공격자가 네트워크를 통해 접근해야 하는지, 특별한 조건이 필요한지, 사전에 권한이 필요한지, 사용자의 행동이 필요한지 같은 특성이 들어갑니다. 여기에 악용 뒤 기밀성·무결성·가용성이 얼마나 영향을 받는지를 더해 기술적 심각도를 표현합니다. 같은 점수라도 벡터가 다르면 공격 조건과 피해 양상이 다르므로 숫자만 보지 말고 벡터 문자열을 함께 읽어야 합니다.',
    'CVSS 점수가 높다고 무조건 가장 먼저 고치는 것은 아닙니다. 외부에 공개된 핵심 서비스에서 실제 악용 중인 중간 점수 취약점이, 격리된 시험 장비의 높은 점수 취약점보다 먼저 처리될 수 있습니다. CVSS는 공통 출발점을 제공하지만 조직의 자산 가치, 노출 정도, 보완 통제, 위협 정보를 포함한 위험 평가는 별도로 해야 합니다.',
  ],
  'zero-day': [
    '제로데이에서 중요한 것은 공개 여부보다 방어 준비가 공격보다 늦었다는 시간 관계입니다. 취약점이 처음 악용될 때 패치가 없을 수도 있고, CVE 번호와 벤더 공지가 나온 뒤에도 탐지 규칙과 수정본이 충분히 배포되지 않았을 수 있습니다. 따라서 CVE 번호가 있느냐 없느냐만으로 제로데이를 판단하면 실제 대응 시점을 놓칠 수 있습니다.',
    '패치가 아직 없다면 취약한 기능을 끄거나 외부 접근을 제한하고, 관련 로그를 늘리고, 알려진 공격 흔적을 탐지하는 임시 조치가 필요합니다. 동시에 영향을 받는 자산과 버전을 확인해 수정본이 나오자마자 적용할 준비를 해야 합니다. 제로데이 대응은 정답 하나를 기다리는 일이 아니라 노출을 줄이고 관찰 범위를 넓히며 시간을 버는 과정입니다.',
  ],
  'one-day': [
    'One-day 또는 N-day라는 말은 취약점과 수정 방법이 공개된 뒤에도 패치되지 않은 시스템을 노리는 상황을 강조합니다. 공격자는 공개된 분석 글이나 패치 전후의 차이를 이용해 공격 코드를 만들 수 있으므로, 시간이 지날수록 방어자만 정보를 갖는 것이 아니라 공격자도 같은 정보를 갖게 됩니다. 오래 알려진 취약점이라고 해서 공격 가능성이 낮아지는 것은 아닙니다.',
    '대응의 핵심은 패치 공지가 나온 날짜보다 우리 자산에 수정이 실제 적용됐는지 확인하는 것입니다. 인터넷 노출 여부와 업무 중요도, CISA KEV 등재 여부, 공격 징후를 함께 보고 우선순위를 정하고, 즉시 패치할 수 없다면 접근 제한이나 기능 비활성화 같은 완화 조치를 기록해야 합니다.',
  ],
  patch: [
    '패치는 코드나 펌웨어를 바꾸기 때문에 보안팀만의 일이 아닙니다. 자산 담당자와 서비스 운영자가 대상 버전, 의존성, 중단 가능성, 적용 시간을 확인하고 실패했을 때 되돌릴 방법을 준비해야 합니다. 특히 운영 서비스에서는 시험 환경에 먼저 적용해 핵심 기능과 연동이 정상인지 확인한 뒤 단계적으로 배포하는 편이 안전합니다.',
    '적용 완료라는 표시만으로는 충분하지 않습니다. 실제 버전이 바뀌었는지, 취약한 기능이 더 이상 재현되지 않는지, 우회 경로는 없는지 확인해야 합니다. 패치를 할 수 없는 장비는 예외 사유와 종료 시점, 네트워크 격리 같은 보완 통제를 남겨 관리되지 않는 예외로 굳어지지 않게 해야 합니다.',
  ],
  exploit: [
    '익스플로잇(Exploit)은 소프트웨어, 하드웨어, 시스템 설정에 존재하는 취약점을 이용해 개발자나 관리자가 의도하지 않은 동작을 일으키는 코드 또는 공격 기법입니다. 취약점이 공격에 이용될 수 있는 약점이라면 익스플로잇은 그 약점을 실제로 작동시켜 시스템 접근, 권한 획득, 임의 코드 실행, 정보 유출, 서비스 중단 같은 결과로 이어지게 하는 수단입니다. MITRE ATT&CK도 공격자가 인터넷에 공개된 시스템의 소프트웨어 버그나 일시적 오류, 잘못된 설정을 악용해 초기 접근을 얻을 수 있다고 설명합니다.',
    'PoC(Proof of Concept, 개념 증명)는 발견한 취약점이 특정 조건에서 실제로 재현되거나 악용될 수 있음을 입증하기 위한 코드나 시연입니다. PoC는 취약점의 존재와 공격 가능성을 확인하는 데 초점을 두기 때문에 모든 환경에서 안정적으로 작동하지 않을 수 있습니다. 실제 공격용 익스플로잇은 더 많은 환경에서 반복 실행되도록 오류 처리와 자동화, payload 전달 기능이 더해질 수 있습니다. 둘은 완전히 분리된 개념이 아니지만 목적과 완성도에서 차이가 있습니다.',
    'PoC와 익스플로잇은 시스템 장애와 정보 유출을 일으킬 수 있으므로 로컬 실습 환경이나 서면으로 허가받은 대상에서만 사용해야 합니다. 검증할 때는 운영 데이터 접근이나 외부 통신 대신 고정 문자열 출력, 임시 파일 생성처럼 영향이 작은 결과를 사용하고 중단 조건과 복구 방법을 먼저 정합니다.',
  ],
  payload: [
    'Exploit이 문을 여는 방법이라면 payload는 문이 열린 뒤 수행할 동작에 가깝습니다. 웹 취약점에서 실행되는 짧은 스크립트, 메모리 손상 뒤 실행되는 코드, 악성 문서가 내려받는 파일처럼 형태는 상황에 따라 달라집니다. 그래서 분석할 때는 취약 조건을 만드는 부분과 최종 행동을 분리해 봐야 공격 흐름이 선명해집니다.',
    '교육용 검증에서는 payload의 위험성을 키울 이유가 없습니다. 실제 쿠키나 파일을 가져오거나 원격 접속을 만드는 대신 화면에 안전한 표시를 남기는 정도로 성공 여부를 확인할 수 있습니다. 이 원칙을 지키면 취약점의 구조는 배우면서도 실습 환경 밖으로 피해가 번지는 것을 막을 수 있습니다.',
  ],
  fuzzing: [
    '퍼징(Fuzzing)은 프로그램에 정상 범위를 벗어나거나 예상하기 어려운 입력을 자동으로 반복해 전달하면서 버그, 보안 취약점, 비정상 동작을 찾는 소프트웨어 테스트 기법입니다. 퍼저(Fuzzer)는 무작위 데이터를 만들거나 기존 입력을 변형해 테스트 대상에 넣고, 충돌과 무한 반복, 메모리 오류, 과도한 자원 사용 같은 반응을 관찰합니다. 파일 파서, 네트워크 프로토콜, 웹 API, 운영체제 구성 요소처럼 외부 입력을 해석하는 코드에서 특히 유용합니다.',
    '커버리지 기반 퍼징(Coverage-guided Fuzzing)은 각 입력이 실행한 코드 경로를 기록하고, 아직 도달하지 못한 경로로 갈 가능성이 높은 입력을 선택해 다시 변형합니다. 단순히 무작위 값을 넣는 것보다 새로운 분기와 깊은 코드 경로를 찾는 데 집중할 수 있습니다. 초기 테스트 데이터인 corpus의 품질, fuzz target 구성, 실행 시간과 코드 커버리지가 결과에 큰 영향을 줍니다.',
    '프로그램이 충돌했다고 해서 바로 공격 가능한 취약점으로 판정할 수는 없습니다. 같은 입력으로 재현되는지 확인하고, 원인 입력을 최소화한 뒤 어떤 메모리 오류나 검증 실패가 발생했는지 분석해야 합니다. 수정 뒤에는 해당 입력을 회귀 테스트에 추가합니다. 퍼징에서 문제가 발견되지 않았다는 결과도 프로그램에 취약점이 없다는 증명이 아니라, 현재 corpus와 실행 시간 안에서 관찰하지 못했다는 의미입니다.',
  ],
  'offensive-security': [
    'Offensive Security는 공격자의 관점으로 실제 공격 경로가 성립하는지 확인하지만, 공격과 가장 크게 다른 점은 권한과 목적이 분명하다는 것입니다. 누가 어떤 시스템을 언제 어떤 방법으로 시험할지 합의하고, 서비스 중단이나 데이터 훼손을 피할 제한을 둡니다. 발견한 약점은 재현 가능한 증거와 함께 방어자가 고칠 수 있는 언어로 전달해야 합니다.',
    '취약점 연구, 모의침투 테스트, Red Team 활동은 모두 공격 관점을 사용하지만 질문은 서로 다릅니다. 새로운 결함을 찾는지, 정해진 범위의 취약점을 검증하는지, 조직의 탐지와 대응 능력까지 시험하는지에 따라 방법과 산출물이 달라집니다. 도구를 실행하는 행위보다 범위 설정, 안전한 검증, 명확한 보고가 업무의 중심입니다.',
  ],
  'defensive-security': [
    'Defensive Security는 공격을 막는 예방 통제만 뜻하지 않습니다. 자산과 계정을 관리하고, 취약점을 줄이고, 로그를 수집해 이상 행동을 탐지하고, 사고가 의심되면 범위를 조사해 격리하고 복구하는 전 과정을 다룹니다. 각 단계에서 발견한 문제를 다음 정책과 시스템 개선에 반영해야 방어 수준이 누적됩니다.',
    '관제 경보 한 건을 처리할 때도 자산 중요도, 사용자 업무, 프로세스 실행 흐름, 네트워크 통신, 과거 이력을 함께 봅니다. 정상과 악성을 구분한 근거를 남기고 탐지 규칙의 오탐과 누락을 조정해야 합니다. 방어 업무의 결과는 경보 건수가 아니라 피해를 줄이고 같은 침해가 반복될 가능성을 낮췄는지로 평가해야 합니다.',
  ],
  'penetration-testing': [
    '모의침투 테스트는 자동 스캐너 결과를 모아 전달하는 작업이 아닙니다. 정해진 목표를 기준으로 정보 수집, 공격 경로 가설, 안전한 검증, 영향 확인을 수행해 실제로 어느 지점까지 접근할 수 있는지 평가합니다. 테스트 전에 Rules of Engagement를 작성해 대상, 제외 대상, 허용 시간, 사용할 계정, 금지 기법, 긴급 연락처와 중단 조건을 합의합니다.',
    '보고서에는 재현 단계만 적는 것이 아니라 공격 전제, 관찰한 증거, 가능한 영향, 수정 방향, 재시험 결과를 함께 담습니다. 공개된 서비스라도 소유자의 명시적 허가가 없으면 시험해서는 안 됩니다. 모의침투의 가치는 화려한 공격 화면이 아니라 조직이 실제로 고칠 수 있는 우선순위와 근거를 제공하는 데 있습니다.',
  ],
  malware: [
    '멀웨어(Malware, 악성 소프트웨어)는 시스템에서 허가되지 않은 동작을 수행해 정보의 기밀성·무결성·가용성에 부정적인 영향을 주도록 만들어진 소프트웨어 또는 펌웨어입니다. 데이터를 훔치거나 변경하고, 시스템을 원격으로 제어하거나 정상적인 서비스 이용을 방해하는 데 사용됩니다. 바이러스, 웜, 트로이 목마, 스파이웨어, 랜섬웨어는 감염 방식과 목적에 따라 구분하는 대표적인 유형입니다.',
    '하나의 멀웨어가 여러 기능을 동시에 수행할 수 있기 때문에 탐지명 하나만 보고 행동을 단정해서는 안 됩니다. 트로이 목마 형태로 설치된 악성코드가 정보를 훔치면서 C2 명령을 받고 추가 멀웨어를 내려받을 수도 있습니다. 분석할 때는 유입 경로, 실행 과정, 지속성 확보 방법, 외부 통신, 시스템과 데이터에 미친 영향을 함께 확인해야 합니다.',
  ],
  phishing: [
    '피싱(Phishing)은 공격자가 신뢰할 수 있는 기관이나 사람을 사칭해 사용자가 계정 정보, 금융 정보, 인증번호 같은 민감한 정보를 제공하거나 악성 링크와 파일을 실행하도록 유도하는 사회공학 공격입니다. 주로 이메일을 이용하지만 문자메시지, 소셜미디어, 협업 서비스, 웹사이트, 음성 통화도 사용됩니다.',
    '불특정 다수에게 같은 메시지를 보내는 일반 피싱과 달리 스피어 피싱(Spearphishing)은 특정 개인이나 조직에 맞춘 이름, 직책, 거래 정보를 사용해 성공 가능성을 높입니다. 목적도 악성코드 감염에만 있지 않습니다. 로그인 정보 탈취, 송금 유도, 원격 관리 프로그램 설치, 추가 공격을 위한 초기 접근 확보가 목적일 수 있습니다. 첨부파일이 없거나 HTTPS가 적용된 사이트라고 해서 피싱이 아니라고 판단할 수는 없습니다.',
  ],
  'social-engineering': [
    '사회공학(Social Engineering)은 기술적 취약점보다 사람의 신뢰, 심리, 업무 절차를 이용해 민감한 정보를 얻거나 비인가 접근을 획득하는 공격 기법입니다. 공격자는 직원, 관리자, 거래처, 공공기관을 사칭하고 긴급함이나 권위를 강조해 비밀번호를 알려주거나 파일을 실행하고 보안 절차를 우회하도록 유도합니다.',
    '사회공학은 이메일과 웹사이트에서만 발생하지 않습니다. 전화, 문자메시지, 대면 접촉, 물리적 출입 과정도 이용됩니다. 피싱은 전자 통신을 이용하는 대표적인 사회공학 수법이지만 모든 사회공학이 피싱인 것은 아닙니다. 소프트웨어에 기술적 취약점이 없어도 성공할 수 있으므로 보안 교육과 함께 중요 요청의 별도 확인, 다중 인증, 최소 권한, 이중 승인 절차를 적용해야 합니다.',
  ],
  'privilege-escalation': [
    '권한 상승은 낮은 권한의 사용자가 관리자나 시스템 권한을 얻는 수직 상승과, 같은 수준의 다른 사용자 자원에 접근하는 수평적 권한 확대를 나누어 볼 수 있습니다. 취약한 서비스, 잘못된 파일 권한, 노출된 토큰, 과도한 역할 부여가 발판이 됩니다. 최초 침입 계정의 권한이 작더라도 상승에 성공하면 보안 설정을 끄고 더 많은 데이터와 시스템에 접근할 수 있습니다.',
    '방어할 때는 운영에 필요한 최소 권한만 주고 관리자 계정의 사용을 분리하며, 서비스 계정과 토큰을 안전하게 관리해야 합니다. 관리자 그룹 변경, 권한 있는 프로세스 실행, 보안 도구 중지처럼 상승 뒤 나타나는 행위를 함께 탐지하면 단일 이벤트보다 정확한 판단이 가능합니다.',
  ],
  'lateral-movement': [
    '공격자는 처음 침해한 PC가 목표가 아닐 때 내부의 다른 시스템으로 이동합니다. 브라우저나 메모리에 남은 자격 증명, 재사용된 비밀번호, 공유 관리자 계정, 원격 관리 기능, 서버 사이의 신뢰 관계가 이동 경로가 될 수 있습니다. 이동을 반복하면서 도메인 관리자, 데이터베이스, 백업 서버처럼 가치가 큰 자산에 접근합니다.',
    '내부 네트워크라는 이유만으로 통신을 모두 신뢰하면 이동을 막기 어렵습니다. 사용자와 관리자 계정을 분리하고, 시스템 사이의 허용 통신을 최소화하며, 원격 로그인과 관리 도구 실행을 기록해야 합니다. 한 호스트의 경보를 조사할 때 같은 계정이 다른 호스트에서 언제 사용됐는지 시간순으로 따라가면 침해 범위를 확인하는 데 도움이 됩니다.',
  ],
  c2: [
    'C2(Command and Control, 명령 및 제어)는 공격자가 초기 침투에 성공한 시스템과 계속 통신하고 원격으로 제어하기 위해 사용하는 서버, 통신 채널, 관련 기술을 말하며 C&C라고도 부릅니다. 공격자는 이 채널로 명령을 보내고 추가 멀웨어와 스크립트를 내려보내며, 실행 결과와 탈취한 데이터를 받습니다. 감염된 시스템이 일정한 간격으로 C2 서버에 접속해 새 명령을 확인하는 행위를 비콘(Beacon)이라고 하며, 탐지를 피하려고 접속 간격을 불규칙하게 만들거나 오랫동안 통신을 지연시키기도 합니다.',
    'C2 구조는 감염된 시스템들이 하나 이상의 서버에 접속하는 중앙 집중식 방식과 감염된 시스템끼리 명령을 전달하는 P2P 방식으로 나눌 수 있습니다. 공격자는 직접 구축하거나 탈취한 서버뿐 아니라 클라우드 저장소, 텍스트 공유 사이트, 소셜미디어 같은 정상 서비스를 C2로 악용해 통신을 정상 트래픽처럼 보이게 만듭니다. 감염된 시스템이 외부 C2로 먼저 연결하는 아웃바운드 방식이 흔하므로 외부 통신 주기, 비정상 DNS 요청, 새로 등록된 도메인, 프록시와 암호화 트래픽의 프로세스 맥락을 함께 분석해야 합니다.',
  ],
  authentication: [
    '인증은 사용자가 입력한 이름을 믿는 과정이 아니라 그 계정과 연결된 인증수단을 실제로 통제하는지 확인하는 과정입니다. 비밀번호는 사용자가 아는 것, 보안키는 사용자가 가진 것, 생체정보는 사용자 자체의 특성에 해당합니다. 서로 다른 종류의 수단을 조합한 다중요소 인증은 비밀번호 하나가 유출됐을 때 계정이 바로 탈취되는 위험을 줄입니다.',
    '로그인에 성공한 뒤에는 세션이나 토큰이 인증 상태를 이어 갑니다. 이 값이 탈취되면 비밀번호를 다시 입력하지 않고도 사용자처럼 행동할 수 있으므로 안전한 저장, 만료, 로그아웃, 중요한 작업 전 재인증이 필요합니다. 인증은 신원을 확인할 뿐이며 무엇을 할 수 있는지는 별도의 인가 단계에서 결정합니다.',
  ],
  authorization: [
    '인가는 인증된 사용자가 특정 자원에 어떤 행동을 할 수 있는지 판단합니다. 같은 학교 시스템에서도 학생은 자신의 성적을 조회하고 교사는 담당 과목의 성적을 입력하며 관리자는 계정을 관리할 수 있습니다. 서버는 요청을 받을 때마다 현재 사용자, 대상 객체, 요청한 행동을 비교해 허용 여부를 결정해야 합니다.',
    '화면에서 관리자 버튼을 숨기거나 URL을 메뉴에 표시하지 않는 것은 인가 통제가 아닙니다. 공격자는 API 요청이나 객체 번호를 직접 바꿀 수 있으므로 실제 데이터와 기능이 있는 서버 경계에서 검증해야 합니다. 다른 사용자의 객체에 접근하는 수평 인가와 관리자 기능을 호출하는 수직 인가를 모두 시험해야 합니다.',
  ],
  'least-privilege': [
    '최소 권한은 처음부터 권한을 적게 주는 것에 그치지 않습니다. 업무가 바뀌거나 프로젝트가 끝났을 때 불필요한 권한을 회수하고, 높은 권한은 필요한 시간에만 승인해 사용하는 방식까지 포함합니다. 사람 계정뿐 아니라 서비스 계정, 데이터베이스 계정, API 키와 자동화 토큰에도 같은 원칙이 적용됩니다.',
    '권한이 과도하면 계정 하나가 탈취됐을 때 피해 범위도 커집니다. 반대로 너무 적으면 업무를 할 수 없어 예외와 공유 계정이 늘 수 있으므로 실제 업무 단위를 기준으로 역할을 설계해야 합니다. 정기 검토에서 누가 왜 이 권한을 갖고 있는지 설명할 수 없으면 회수하거나 다시 승인받게 하는 것이 좋습니다.',
  ],
  firewall: [
    '방화벽 정책은 어디에서 어디로 어떤 통신을 허용할지 적은 규칙입니다. 외부 사용자가 웹 서버의 HTTPS 포트에는 접근할 수 있지만 데이터베이스 포트에는 직접 접근하지 못하게 하는 식으로 경계를 만듭니다. 연결 상태와 애플리케이션 정보를 보거나 허용·차단 기록을 남기는 기능도 제품과 배치 방식에 따라 제공됩니다.',
    '방화벽이 있다고 내부 서비스의 취약점과 잘못된 인가가 사라지는 것은 아닙니다. 허용된 HTTPS 통신 안에서도 공격 요청이 들어올 수 있고, 이미 침해된 내부 호스트에서 허용된 경로를 악용할 수도 있습니다. 규칙은 업무상 필요한 범위로 좁히고, 임시 허용의 종료일과 담당자를 기록하며, 로그를 다른 탐지 정보와 연결해야 합니다.',
  ],
  'ids-ips': [
    'IDS는 네트워크나 시스템 이벤트를 관찰해 알려진 공격 패턴과 이상 행동을 찾고 경보를 냅니다. IPS는 통신 경로에 배치되어 탐지한 패킷이나 연결을 차단할 수 있습니다. 시그니처 기반 탐지는 알려진 패턴을 빠르게 찾고, 행위 기반 탐지는 평소와 다른 흐름을 볼 수 있지만 각각 우회와 오탐의 한계가 있습니다.',
    '탐지 규칙은 설치 뒤 그대로 두는 것이 아니라 실제 네트워크와 서비스에 맞게 조정해야 합니다. 암호화된 트래픽은 내용이 보이지 않을 수 있고, 정상 업무가 공격 패턴과 비슷할 수도 있습니다. 경보가 발생하면 출발지와 목적지, 자산 중요도, 같은 시간의 서버·인증·EDR 로그를 연결해 실제 침해인지 판단해야 합니다.',
  ],
  edr: [
    'EDR은 엔드포인트에서 어떤 프로세스가 무엇을 실행했고 어떤 파일과 계정, 네트워크 연결이 이어졌는지 시간순으로 볼 수 있게 합니다. 예를 들어 문서 프로그램이 명령 셸을 실행하고, 그 셸이 외부 주소에 접속한 흐름을 하나의 프로세스 트리로 확인할 수 있습니다. 조사자는 이 연결을 통해 단일 파일 경보보다 넓은 행위 맥락을 파악합니다.',
    '제품에 따라 프로세스 종료, 파일 격리, 호스트 네트워크 격리 같은 대응도 수행할 수 있습니다. 그러나 에이전트가 설치되지 않은 자산이나 수집되지 않는 이벤트는 볼 수 없고, 정상 관리 도구가 악용되면 판단이 어려울 수 있습니다. EDR 경보는 출발점으로 사용하고 사용자 업무, 인증 로그, 네트워크 정보와 함께 확인해야 합니다.',
  ],
})

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
    id: 'cia', title: 'CIA Triad · CVSS', englishName: 'Confidentiality, Integrity, Availability', koreanName: '기밀성·무결성·가용성', category: 'foundation',
    definitionEnglish: 'Security objectives centered on confidentiality, integrity, and availability.',
    definitionKorean: '기밀성, 무결성, 가용성을 중심으로 시스템이 지켜야 할 보안 목표를 정리한 모델.',
    explanation: 'CIA Triad가 중요한 이유는 “무엇을 막을 것인가”를 침해 결과로 나눠 설명하게 해주기 때문입니다. 같은 취약점이라도 정보 유출, 데이터 변조, 서비스 중단 중 어떤 영향이 발생하는지에 따라 필요한 통제와 우선순위가 달라집니다.',
    source: sources.cia,
    secondarySources: [sources.cvss],
    connectionTable: { headers: ['보안 목표', '의미', '침해 예시', 'CVSS와의 연결'], rows: ciaCvssConnections },
    caseTable: { headers: ['조합', '핵심 의미', '대표 CVE', 'NVD CVSS v3.1', '실제 사례와 침해 영향'], rows: ciaCvssCases },
    note: 'CIA는 조직과 시스템이 지킬 목표이고, CVSS는 특정 취약점이 악용됐을 때의 기술적 영향을 표현합니다. 위 사례표는 실제 공격이 확인된 사례와 공식 취약점 문서에 기록된 가능한 기술적 영향을 구분해 적었습니다. 사례의 C·I·A 조합은 피해 유형을 이해하는 출발점이지, 조직의 최종 대응 우선순위 그 자체는 아닙니다.',
  }),
  term({
    id: 'vulnerability', title: '취약점', englishName: 'Vulnerability', koreanName: '취약점', category: 'foundation',
    definitionEnglish: 'A weakness that can be exploited or triggered to produce an unwanted security outcome.',
    definitionKorean: '악용되거나 촉발됐을 때 원치 않는 보안 결과를 만들 수 있는 약점.',
    explanation: '취약점은 설계, 구현, 설정, 운영 과정의 약점입니다. 취약점의 존재만으로 조직의 최종 위험이 결정되지는 않으며, 실제 설치 여부, 외부 노출, 악용 가능성, 자산 중요도, 기존 통제를 함께 봐야 합니다.',
    source: sources.vulnerability,
    caseStudy: glossaryCaseStudies.vulnerability,
    comparisonTable: { headers: ['용어', '무엇을 가리키나', '표현 예', '관리 주체'], rows: vulnerabilityTermComparison },
    nextTermIds: ['zero-day', 'cve', 'cwe'],
  }),

  term({
    id: 'zero-day', title: 'Zero-day → Patch → One-day', englishName: 'Zero-day, Patch, and One-day', koreanName: '제로데이·패치·원데이', category: 'vulnerability-management',
    definitionEnglish: 'A vulnerability can move from an unpatched zero-day state to a patched but still exploitable one-day state.',
    definitionKorean: '공식 수정본이 없는 제로데이 상태에서 패치 공개를 거쳐, 미적용 시스템이 공격받는 원데이 상태로 이어지는 시간 흐름.',
    explanation: '이 세 용어는 서로 떨어진 개념이 아니라 같은 취약점을 시간에 따라 보는 방법입니다. 방어자는 패치가 없을 때는 노출을 줄이고, 패치가 나온 뒤에는 영향받는 자산을 찾아 적용 여부를 확인해야 합니다.',
    source: sources.zeroDay,
    groupedSections: zeroDayLifecycle,
    secondarySources: [sources.patch, sources.bugBounty, sources.zerodium, sources.crowdfense, sources.kev],
  }),
  term({
    id: 'cve', title: 'CVE · CVSS', englishName: 'Common Vulnerabilities and Exposures · Common Vulnerability Scoring System', koreanName: '공통 취약점 식별자·기술적 심각도 평가', category: 'vulnerability-management',
    definitionEnglish: 'CVE identifies a specific publicly disclosed vulnerability; CVSS describes its technical severity and impact.',
    definitionKorean: 'CVE는 공개된 특정 취약점을 공통 번호로 식별하고, CVSS는 그 취약점의 공격 조건과 기술적 영향을 점수와 벡터로 표현한다.',
    explanation: '동일한 취약점을 연구자, 개발사, 보안업체가 서로 다른 명칭이나 자체 관리번호로 표현하면 정보 공유와 취약점 관리에 혼란이 생깁니다. CVE는 이런 혼란을 줄이기 위해 공개된 개별 취약점에 전 세계에서 공통으로 쓰는 고유 식별번호를 부여합니다. 기관별 설명이 달라도 CVE ID가 같으면 동일한 취약점을 뜻합니다.',
    source: sources.cve,
    sourceNotes: cveSourceNotes,
    caseStudy: glossaryCaseStudies.cve,
    comparisonIntro: 'CVE-2026-31431은 Linux kernel의 Copy Fail 처리 결함으로 일반 사용자가 별도의 사용자 개입이나 복잡한 공격 조건 없이 root 권한을 얻을 수 있는 로컬 권한 상승 취약점입니다. FIRST의 CVSS v4.0 공식 예제에서 v3.1은 7.8, v4.0은 8.5로 평가됩니다. 위험성이 바뀐 것이 아니라 버전별 평가 항목과 계산 방식이 다르기 때문에 점수 차이가 생깁니다.',
    comparisonTable: { headers: ['평가 내용', 'CVSS 3.1', 'CVSS 4.0', '공식 판단 근거'], rows: copyFailCvssComparison },
    secondarySources: [sources.redHatCve, sources.ibmCve, sources.fortinetCve, sources.cvss, sources.cvssExamples, sources.copyFail, sources.cvssArticle],
  }),
  term({
    id: 'cwe', title: 'CWE', englishName: 'Common Weakness Enumeration', koreanName: '공통 약점 열거', category: 'vulnerability-management',
    definitionEnglish: 'A community-developed list of software and hardware weakness types that can become vulnerabilities.',
    definitionKorean: '소프트웨어·하드웨어에서 반복되는 약점 유형에 공통 식별번호를 부여한 분류 체계.',
    explanation: '동일한 보안 약점을 연구자와 보안업체마다 다른 명칭으로 표현하면 취약점 분류와 분석에 혼란이 생깁니다. CWE는 이런 혼란을 줄이기 위해 약점 유형마다 공통 식별번호를 부여합니다. 서로 다른 CVE라도 발생 원인이나 약점 유형이 같다면 동일한 CWE로 분류될 수 있습니다.',
    source: sources.cwe,
    caseStudy: glossaryCaseStudies.cwe,
    comparisonIntro: '이처럼 CWE는 개별 취약점의 이름표가 아니라 반복되는 결함의 종류를 보기 위해 사용됩니다. 2024년 MITRE가 공개한 가장 위험한 소프트웨어 약점 25개 중 상위 5개는 다음과 같습니다. KEV 건수는 해당 기사가 발행된 시점의 값입니다.',
    comparisonTable: { headers: ['순위', 'CWE', '약점 유형', '무슨 문제인가', '기사 발행 당시 KEV'], rows: cweTopFive },
    secondarySources: [sources.cweTop25],
  }),

  term({ id: 'exploit', title: 'Exploit · PoC', englishName: 'Exploit · Proof of Concept', koreanName: '취약점 이용 방법·개념 증명', category: 'discovery-exploitation', definitionEnglish: 'An exploit uses a vulnerability to produce unintended behavior; a proof of concept demonstrates that the behavior can occur.', definitionKorean: '익스플로잇은 취약점을 작동시키는 코드나 기법이고, PoC는 그 취약점이 실제로 재현됨을 보이는 코드나 시연이다.', explanation: '취약점이 공격에 악용될 수 있는 시스템의 약점이라면, 익스플로잇은 그 약점을 실제로 작동시켜 접근, 권한 획득, 코드 실행, 정보 유출이나 서비스 중단 같은 결과를 만드는 수단입니다.', source: sources.exploit, secondarySources: [sources.mitreExploit, sources.cisaPoc] }),
  term({ id: 'payload', title: 'Payload', englishName: 'Payload', koreanName: '실행 내용·전달 데이터', category: 'discovery-exploitation', definitionEnglish: 'The data, command, or code intended to run or take effect after an exploit succeeds.', definitionKorean: 'Exploit이 성공한 뒤 실행되거나 효과를 내도록 의도된 데이터, 명령 또는 코드.', explanation: 'Exploit과 Payload는 같은 말이 아닙니다. Exploit이 취약 조건을 성립시키는 부분이라면 Payload는 그 성공 뒤 수행할 행동입니다. 안전 실습에서는 외부 통신이나 실제 정보 접근 대신 고정된 표시 문자열만 사용합니다.', source: sources.payload }),
  term({ id: 'fuzzing', title: 'Fuzzing', englishName: 'Fuzz Testing', koreanName: '퍼징', category: 'discovery-exploitation', definitionEnglish: 'Testing that repeatedly supplies varied, malformed, or boundary inputs to discover unexpected behavior.', definitionKorean: '정상 범위를 벗어난 입력을 자동으로 반복 전달해 버그와 취약점, 비정상 동작을 찾는 테스트 기법.', explanation: '퍼저는 무작위 데이터를 만들거나 기존 입력을 변형해 테스트 대상에 전달하고, 프로그램의 충돌과 메모리 오류, 무한 반복, 과도한 자원 사용을 관찰합니다.', source: sources.fuzzing, image: { src: '/media/fuzzing-overview.png', alt: '퍼저가 정상·비정상 입력을 대량으로 넣고 충돌을 발견한 뒤 취약점을 분석하는 5단계 퍼징 과정', caption: '다양한 입력 생성부터 이상 동작 탐지와 원인 분석까지의 퍼징 흐름' }, secondarySources: [sources.googleFuzzing, sources.owaspFuzzing] }),

  term({ id: 'offensive-security', title: 'Offensive Security', englishName: 'Offensive Security', koreanName: '공격 관점 보안', category: 'security-work', definitionEnglish: 'Authorized security work that examines systems from an attacker perspective to find and validate weaknesses.', definitionKorean: '허가된 범위에서 공격자 관점으로 시스템을 살펴 약점과 공격 경로를 찾고 검증하는 보안 업무.', explanation: '모의해킹, Red Team, 취약점 연구처럼 목적과 산출물이 다른 활동을 포함할 수 있습니다. 공통 전제는 명시적 허가, 대상·시간·기법 범위, 최소 영향, 재현 가능한 증거와 개선 제안입니다.', source: sources.nice }),
  term({ id: 'defensive-security', title: 'Defensive Security', englishName: 'Defensive Security', koreanName: '방어 관점 보안', category: 'security-work', definitionEnglish: 'Security work focused on prevention, detection, investigation, response, recovery, and improvement.', definitionKorean: '공격의 예방·탐지·조사·대응·복구와 지속적인 개선에 초점을 둔 보안 업무.', explanation: 'Defensive Security는 경보만 보는 일이 아닙니다. 자산·구성·취약점 관리부터 로그와 탐지 규칙, 사고 대응, 복구, 재발 방지까지 여러 역할과 산출물을 연결합니다.', source: sources.nice }),
  term({ id: 'penetration-testing', title: 'Penetration Testing', englishName: 'Penetration Testing', koreanName: '모의침투 테스트', category: 'security-work', definitionEnglish: 'Authorized testing that simulates attacks to evaluate whether vulnerabilities can be exploited and what impact follows.', definitionKorean: '허가된 범위에서 공격을 모의해 취약점의 실제 성립 조건과 영향을 평가하는 테스트.', explanation: 'Rules of Engagement에 대상, 계정, 시간, 허용 기법, 중단 조건을 정하고 수행합니다. 공개된 웹사이트라고 해서 테스트 권한이 생기는 것은 아니며, 결과는 재현 단계·영향·수정·재시험으로 보고합니다.', source: sources.penetrationTest }),

  term({ id: 'malware', title: 'Malware', englishName: 'Malicious Software', koreanName: '멀웨어·악성 소프트웨어', category: 'attack-stages', definitionEnglish: 'Software or firmware intended to perform an unauthorized process that harms confidentiality, integrity, or availability.', definitionKorean: '허가되지 않은 동작을 수행해 정보와 시스템의 기밀성·무결성·가용성을 해치도록 만든 소프트웨어 또는 펌웨어.', explanation: '멀웨어는 데이터를 훔치거나 변경하고, 시스템을 원격으로 제어하거나 정상적인 서비스 이용을 방해하는 목적으로 사용됩니다. 바이러스, 웜, 트로이 목마, 스파이웨어, 랜섬웨어는 전파 방식과 동작, 목적에 따라 나눈 대표적인 유형입니다.', source: sources.malware, assignment: glossaryAssignments.malware }),
  term({ id: 'phishing', title: 'Phishing', englishName: 'Phishing', koreanName: '피싱', category: 'attack-stages', definitionEnglish: 'Messages or sites that impersonate a trusted source to make people reveal information or take unsafe actions.', definitionKorean: '신뢰할 만한 사람·기관·서비스처럼 위장해 정보 제공이나 위험한 행동을 유도하는 수법.', explanation: '피싱은 이메일에만 한정되지 않습니다. 문자, 메신저, 전화, QR 코드, 협업 도구와 가짜 로그인 화면을 통해 자격 증명 입력, 송금, 파일 실행, MFA 승인을 유도할 수 있습니다.', source: sources.phishing }),
  term({ id: 'social-engineering', title: 'Social Engineering', englishName: 'Social Engineering', koreanName: '사회공학', category: 'attack-stages', definitionEnglish: 'Manipulating people and organizational processes to disclose information or bypass security controls.', definitionKorean: '사람의 신뢰와 조직 절차를 조작해 정보를 얻거나 보안 통제를 우회하는 방식.', explanation: '기술적 취약점이 없어도 긴급함, 권위, 호기심, 업무 관행을 이용할 수 있습니다. 교육뿐 아니라 콜백 확인, 이중 승인, 신원 검증, 신고 채널 같은 절차적 통제가 필요합니다.', source: sources.socialEngineering }),
  term({ id: 'c2', title: 'Command & Control, C2', englishName: 'Command and Control', koreanName: '명령 및 제어', category: 'attack-stages', definitionEnglish: 'Infrastructure, channels, and techniques adversaries use to communicate with and control compromised systems.', definitionKorean: '공격자가 침해한 시스템과 지속적으로 통신하며 명령을 전달하고 결과를 받기 위해 사용하는 인프라, 통신 채널, 기술.', explanation: 'C2는 감염된 시스템에 명령을 전달하고, 추가 악성코드와 스크립트를 내려보내며, 실행 결과와 탈취한 데이터를 받는 원격 제어 통신입니다. 감염 시스템이 일정한 간격으로 C2 서버에 접속해 새 명령을 확인하는 행위를 비콘이라고 합니다.', source: sources.commandControl, assignment: glossaryAssignments.c2 }),
])

export const glossarySources = Object.freeze(Object.values(sources))
