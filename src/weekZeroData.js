export const workLanes = [
  {
    id: 'governance', label: 'Governance', title: '기준을 세우고 위험을 관리한다',
    description: '사업이 감당할 수 있는 위험 수준을 정하고, 법·인증·내부 정책을 실제 업무 절차로 바꿉니다.',
    roles: ['정보보호 기획', 'CISO', 'GRC', '개인정보보호', '보안 감사·감리', '인증 대응'],
    outputs: ['정보보호 정책', '위험평가표', 'ISMS-P 증적', '개선 계획', '경영진 보고'],
  },
  {
    id: 'engineering', label: 'Security Engineering', title: '안전한 제품과 기반을 만든다',
    description: '보안 요구사항을 코드, 아키텍처, 클라우드 설정, 탐지 시스템과 보안 제품으로 구현합니다.',
    roles: ['AppSec', 'Product Security', 'Cloud Security', 'Security Architecture', '보안제품 개발', 'IAM'],
    outputs: ['위협 모델', '보안 설계', '보안 모듈', 'CI/CD 검사', '가드레일', '운영 자동화'],
  },
  {
    id: 'defensive', label: 'Defensive · Blue Team', title: '공격을 탐지하고 막고 복구한다',
    description: '로그와 경보를 운영하고 침해 징후를 조사해 피해를 제한합니다. 사고 뒤에는 원인과 재발 방지책을 남깁니다.',
    roles: ['SOC 관제', 'Detection Engineering', 'CERT/CSIRT', 'Incident Response', 'Threat Hunting', 'DFIR'],
    outputs: ['탐지 규칙', '사고 타임라인', 'IOC', '대응 플레이북', '포렌식 보고서'],
  },
  {
    id: 'offensive', label: 'Offensive · Red Team', title: '공격자의 관점으로 약점을 검증한다',
    description: '허가된 범위에서 공격 경로를 재현하고 실제 영향과 수정 우선순위를 증명합니다.',
    roles: ['모의해킹', 'Red Team', '취약점 연구', 'Exploit 개발', '버그바운티', 'Purple Team'],
    outputs: ['재현 절차', '공격 경로', 'PoC', '영향 분석', '수정 권고', '재시험 결과'],
  },
]

export const kisaRoles = [
  { code: '01', title: '정보보호 기획자', does: '조직의 자산·위협·법적 요구를 정리하고 연간 보안 계획, 예산, 정책, 교육과 개선 과제를 설계합니다.', deliverables: '정책·지침, 위험평가, 예산안, 이행계획', basics: '보안 관리체계, 법·규정, 문서화, 사업 이해', track: 'Governance' },
  { code: '02', title: '정보보안 책임자(CISO)', does: '경영 관점에서 보안 전략과 우선순위를 결정하고 사고·감사·규제 위험에 대해 최종 책임과 의사결정을 수행합니다.', deliverables: '보안 전략, 경영진 보고, 위기 의사결정', basics: '거버넌스, 리스크, 조직 운영, 커뮤니케이션', track: 'Leadership' },
  { code: '03', title: '정보보호 연구원·개발자', does: '암호·인증, 탐지, 보안 모듈, 분석 도구와 보안 솔루션을 연구하고 제품 수준의 코드로 구현합니다.', deliverables: '보안 제품, 모듈, 알고리즘, 테스트 결과', basics: '프로그래밍, OS, 네트워크, 자료구조, 테스트', track: 'Engineering' },
  { code: '04', title: '정보보안 엔지니어', does: '방화벽·WAF·EDR·NAC·IAM 같은 보안 시스템을 설계·구축하고 정책 변경, 장애 대응, 성능과 로그를 운영합니다.', deliverables: '구축 설계서, 정책표, 운영 절차, 장애 기록', basics: 'Linux, 네트워크, 클라우드, 시스템 운영', track: 'Engineering' },
  { code: '05', title: '보안 관제·사고대응 담당자', does: 'SIEM·EDR·네트워크 경보를 분류하고 정상·오탐·사고를 판단해 초동 조치와 에스컬레이션을 수행합니다.', deliverables: '경보 분석, 탐지 규칙, 티켓, 대응 플레이북', basics: '로그, TCP/IP, 공격 기법, 스크립팅', track: 'Defensive' },
  { code: '06', title: '침해사고 분석가', does: '침해 시점, 최초 진입점, 공격자의 이동 경로와 영향 범위를 로그·메모리·디스크 증거로 재구성합니다.', deliverables: '사고 타임라인, IOC, 원인·영향·재발 방지 보고서', basics: 'DFIR, Windows/Linux, 네트워크, 악성코드', track: 'Defensive' },
  { code: '07', title: '취약점 분석가·모의해킹 전문가', does: '웹·모바일·인프라·소스코드의 취약점을 허가된 범위에서 검증하고 공격 가능성과 수정 방법을 설명합니다.', deliverables: '취약점 보고서, PoC, 위험도, 재점검 결과', basics: 'HTTP, 웹, 시스템, 네트워크, 보고서 작성', track: 'Offensive' },
  { code: '08', title: '디지털 포렌식 전문가', does: '법적·내부 조사 절차에 맞춰 디지털 증거를 식별·수집·보존·분석하고 행위와 사실관계를 설명합니다.', deliverables: '증거 목록, 해시, 분석 기록, 포렌식 보고서', basics: '파일시스템, OS, 증거 보존, 타임라인 분석', track: 'Defensive' },
  { code: '09', title: '정보보안 컨설턴트', does: '고객의 자산과 업무 흐름을 조사해 기술·관리 취약점을 진단하고 목표 수준에 맞는 개선 로드맵을 제안합니다.', deliverables: '현황 분석, 갭 분석, 개선 과제, 인증·진단 보고서', basics: '진단, 아키텍처, 관리체계, 인터뷰와 문서화', track: 'Consulting' },
]

export const technicalFields = [
  { title: '시스템 보안', scope: 'Linux·Windows, 계정, 권한, 프로세스, 서비스, 커널', work: '서버 진단, 하드닝, EDR, 침해 분석', weeks: 'Week 1, 7-11' },
  { title: '웹·애플리케이션 보안', scope: 'HTTP, 인증·인가, 세션, API, 프론트엔드·백엔드', work: 'AppSec, 모의해킹, 시큐어코딩, Product Security', weeks: 'Week 3-6' },
  { title: 'Pwnable·Exploit', scope: '메모리, 어셈블리, 디버거, 바이너리 취약점', work: '취약점 연구, Exploit 개발, 제품 보안', weeks: 'Week 7-11' },
  { title: '리버싱·악성코드', scope: '실행 파일, 어셈블리, 정적·동적 분석, 행위 분석', work: 'Malware Analysis, Threat Research, DFIR', weeks: 'Week 8, 11-12' },
  { title: '네트워크 보안', scope: 'TCP/IP, DNS, TLS, 라우팅, 패킷과 네트워크 장비', work: '보안 엔지니어, 관제, 네트워크 포렌식', weeks: 'Week 13' },
  { title: '암호·인증', scope: '암호 알고리즘, 키 관리, PKI, 전자서명, 인증 프로토콜', work: '보안 개발, IAM, 핀테크·인증 제품', weeks: 'Week 12' },
  { title: '클라우드·컨테이너 보안', scope: 'IAM, 네트워크 경계, 워크로드, Kubernetes, CI/CD', work: 'Cloud Security, DevSecOps, Security Architecture', weeks: 'Week 15' },
  { title: '포렌식·사고대응', scope: '디스크·메모리·로그·패킷 증거, 타임라인, IOC', work: 'CERT, IR, Threat Hunting, Digital Forensics', weeks: 'Week 12-13' },
  { title: '퍼징·보안 테스트', scope: '입력 생성, 크래시 분류, 커버리지, 재현과 최소화', work: '제품 보안, 취약점 연구, 보안 QA', weeks: 'Week 14' },
  { title: 'AI 보안', scope: '모델·데이터·에이전트·LLM 앱의 공격면과 안전성 평가', work: 'AI Red Team, AI Product Security, 연구개발', weeks: 'Week 16' },
]

export const industryDomains = [
  { title: 'OT·ICS 보안', assets: 'PLC, HMI, SCADA, 생산망', concern: '가용성과 안전이 최우선이며 패치·중단이 어렵습니다.' },
  { title: '자동차·모빌리티 보안', assets: 'CAN, ECU, 차량 앱, 충전 인프라', concern: '차량 수명주기, 무선 업데이트, 기능 안전과 연결됩니다.' },
  { title: '선박·해양 보안', assets: '항해·기관 제어, 위성 통신, 항만 시스템', concern: '해상 연결 제약과 오래된 OT 장비, 운항 안전을 함께 봅니다.' },
  { title: '우주·항공 보안', assets: '위성, 지상국, 관제, 비행 소프트웨어', concern: '원격 복구가 어렵고 공급망·통신·임무 지속성이 중요합니다.' },
  { title: '의료·헬스케어 보안', assets: '의료기기, PACS, EMR, 환자 데이터', concern: '환자 안전, 개인정보, 장비 가용성을 동시에 보호합니다.' },
  { title: '금융·핀테크 보안', assets: '결제, 인증, 금융 API, 이상거래', concern: '사기 방지, 규제 준수, 거래 무결성과 고가용성이 핵심입니다.' },
  { title: '에너지·스마트그리드', assets: '발전·송배전, 스마트미터, 제어센터', concern: '국가 기반시설의 연속성과 물리적 피해 가능성을 다룹니다.' },
  { title: 'IoT·임베디드 보안', assets: '펌웨어, 센서, 게이트웨이, 무선 프로토콜', concern: '제한된 자원, 기본 비밀번호, 업데이트와 공급망 문제가 큽니다.' },
  { title: '통신·5G 보안', assets: '코어망, 기지국, 가입자·과금 시스템', concern: '대규모 망의 신뢰 경계와 가용성, 통신 데이터 보호가 중심입니다.' },
  { title: '게임·콘텐츠 보안', assets: '게임 클라이언트, 계정, 아이템, CDN', concern: '치팅·봇·계정 탈취·결제 사기와 서비스 공격을 다룹니다.' },
  { title: '공급망 보안', assets: '오픈소스, 빌드 시스템, 업데이트, 협력사', concern: '신뢰된 배포 경로와 구성요소가 공격 통로가 되지 않도록 관리합니다.' },
  { title: '국방·공공 보안', assets: '국가 시스템, 지휘통제, 행정·국민 데이터', concern: '기밀성, 임무 지속성, 규정과 국가 차원의 위협을 함께 고려합니다.' },
]

export const marketJobs = [
  ['정보보호 운영·관리', 278], ['정보보호 컨설팅', 147], ['정보보호 엔지니어링', 134], ['보안사고 대응', 124],
  ['정보보호 개발', 53], ['클라우드보안 관리운영', 43], ['기술영업', 37], ['보안 인증평가', 26],
  ['정보보호 기획', 23], ['보안 품질관리', 21], ['모빌리티 보안', 10], ['정보보호 교육', 7], ['보안감사', 6], ['OT보안', 5],
]

export const jobCaptures = [
  { image: '/job-postings/kisia-company-2.png', company: 'SK쉴더스', title: '관제·취약점진단·모의해킹·컨설팅·구축운영·Cloud 보안', note: '한 회사 안에서도 Defensive, Offensive, Consulting, Engineering 직무가 함께 채용되는 사례입니다.' },
  { image: '/job-postings/kisia-global8.png', company: '글로벌에잇', title: '보안 컨설팅·솔루션 개발·교육 기획', note: '컨설팅 회사에서도 관리체계만이 아니라 취약점 진단, 개발, 교육 기획으로 역할이 갈립니다.' },
  { image: '/job-postings/kisia-company-4.png', company: '넷맨', title: '네트워크 보안 제품 연구개발·기술지원', note: '보안제품 개발은 프로그래밍을, 기술지원은 네트워크·DB·Linux와 구축 경험을 구체적으로 요구합니다.' },
]

export const mindMap = [
  { title: '관리·전략', groups: [['리더십', 'CISO', '보안 전략', '예산·조직'], ['GRC', 'ISMS-P', 'ISO 27001', '위험관리', '감사·감리'], ['Privacy', '개인정보 운영', '영향평가', '컴플라이언스']] },
  { title: '설계·개발', groups: [['AppSec', '위협 모델링', '시큐어코딩', 'SAST·DAST', 'API 보안'], ['Cloud', 'IAM', 'CSPM', '컨테이너', 'DevSecOps'], ['제품', '보안 솔루션', '암호·인증', 'EDR·NAC·WAF', '보안 QA']] },
  { title: '방어·대응', groups: [['SOC', 'SIEM', '경보 분석', '탐지 규칙'], ['IR·CERT', '초동 대응', '범위 조사', '복구', '재발 방지'], ['Threat', '위협 인텔리전스', 'Threat Hunting', '악성코드 분석'], ['DFIR', '디스크', '메모리', '모바일', '네트워크 포렌식']] },
  { title: '공격·검증', groups: [['Pentest', '웹', '모바일', '인프라', '무선'], ['Red Team', '공격 시뮬레이션', '피싱', '내부 이동', 'Purple Team'], ['Vulnerability Research', 'Pwnable', '리버싱', 'Exploit', 'Fuzzing'], ['Bug Bounty', '취약점 제보', 'PoC', '영향·수정 보고']] },
  { title: '기술 기반', groups: [['컴퓨터', 'OS', '아키텍처', '네트워크', '데이터베이스'], ['소프트웨어', 'C·C++', 'Python', 'JavaScript', 'Git'], ['보안 원리', '접근통제', '암호', '인증·인가', '로깅'], ['분석 도구', 'GDB', 'Wireshark', 'Burp Suite', '디스어셈블러']] },
  { title: '융합 산업', groups: [['산업·인프라', 'OT·ICS', '에너지', '통신·5G', '공공'], ['이동체', '자동차', '선박·해양', '항공', '우주'], ['제품·서비스', 'IoT', '의료기기', '금융', '게임'], ['신기술', 'AI 보안', '블록체인', '양자내성암호', '공급망']] },
]
