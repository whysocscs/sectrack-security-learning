import { prepareEnrichedPosting } from '../jobPostingEnrichmentCore.js'
import { roleResearchTargetById, roleResearchTargets } from '../jobPostingResearchTargets.js'

const checkedDate = '2026-08-01'
const scopeDomainIds = new Set(['ai', 'security-rnd'])

const greenhouseNote = '2026-08-01 공식 Greenhouse 현재 job-board API에서 공고 ID·제목·지역·본문을 확인하고 개별 공고 지원 경로를 재확인했다.'
const ashbyNote = '2026-08-01 공식 Ashby 현재 job-board API에서 공고 ID·제목·지역·descriptionHtml·jobUrl·applyUrl을 함께 확인했다.'

const sources = {
  scopelyAi: {
    companyName: 'Scopely', originalJobTitle: 'Senior AI Security Engineer',
    postingUrl: 'https://job-boards.greenhouse.io/scopely/jobs/5216078008', sourceType: 'greenhouse',
    country: '인도', location: 'Bangalore, India', workMode: 'hybrid', careerLevel: 'senior', requiredYearsMin: 5,
    verificationNotes: [greenhouseNote], sourceHeadings: ['What you will do', 'What We’re Looking For'],
    extracted: {
      responsibilities: ['AI 플랫폼의 감사 추적·도구 호출 로그·상관관계 ID·분산 추적 설계와 운영', 'AI·클라우드 플랫폼의 탐지 결과부터 수정까지 자동화', 'AI 시스템의 경보·상태 확인·롤백·킬 스위치·속도 제한·드리프트 탐지 구현', '정책·탐지·운영 점검을 코드로 관리', '비밀정보·외부 호출·MCP 사용을 포함한 AI 애플리케이션 변경 검토'],
      requirements: ['SRE·프로덕션 엔지니어링·플랫폼 운영 또는 보안 자동화 경력 5년 이상', 'Python과 API·로그 파이프라인 자동화 경험', 'AWS 관측성과 경보 시스템 구축 경험', '사고 대응·롤백·SLA/SLO·사후 분석 경험'],
      preferredQualifications: ['AI 에이전트 런타임과 프롬프트·도구 텔레메트리 경험', '개인정보 보호형 텔레메트리 또는 런타임 보호 경험'],
      tools: ['Terraform', 'Pulumi', 'Wiz', 'CrowdStrike', 'Orca', 'Amazon GuardDuty'], programmingLanguages: ['Python'], cloudPlatforms: ['AWS'], frameworks: ['Model Context Protocol (MCP)'], securityDomains: ['AI Security', 'Security Automation', 'Platform Security'], deliverables: ['AI 플랫폼 관측성 계층', '보안 자동화 워크플로', '운영 플레이북'], partnerTeams: ['Gen AI 조직', '중앙 IT 조직', 'SOC'],
    },
  },
  elasticAi: {
    companyName: 'Elastic', originalJobTitle: 'AI Security - Principal Security Research Engineer I',
    postingUrl: 'https://job-boards.greenhouse.io/elastic/jobs/8079640', sourceType: 'greenhouse',
    country: '미국', location: 'United States', workMode: 'remote', careerLevel: 'principal',
    verificationNotes: [greenhouseNote], sourceHeadings: ['What You Will Be Doing'],
    extracted: {
      responsibilities: ['보호 규칙을 배포하기 위한 내부 규칙 관리 기능 개발', '위협 연구와 탐지 엔지니어링을 위한 Elastic AI 워크플로 개발', '새로운 다중 도메인 위협 벡터와 공격 방법 조사', '보안 동향과 위협 인텔리전스 모니터링', '연구 결과 발표와 지식 공유'],
      requirements: ['생성형 AI 보안과 MITRE ATLAS·ATT&CK 이해', 'EQL·KQL·SQL을 이용한 탐지 작성 또는 검증 경험', 'AI 보조 개발 도구를 이용한 위협 연구와 탐지 엔지니어링 경험', 'ML 프레임워크와 LLM API의 프로덕션 통합 경험'],
      preferredQualifications: [], queryLanguages: ['EQL', 'KQL', 'SQL'], securityProducts: ['Elastic Security'], frameworks: ['MITRE ATLAS', 'MITRE ATT&CK'], securityDomains: ['AI Security', 'Threat Research', 'Detection Engineering'], deliverables: ['탐지 규칙', 'AI 연구 워크플로', '기술 발표'], partnerTeams: ['탐지 엔지니어링 조직', '보안 연구 조직'],
    },
  },
  wizAi: {
    companyName: 'Wiz', originalJobTitle: 'AI Security Researcher',
    postingUrl: 'https://job-boards.greenhouse.io/wizinc/jobs/4659435006', sourceType: 'greenhouse',
    country: '영국', location: 'London, UK', workMode: 'unknown', careerLevel: 'senior', requiredYearsMin: 5,
    verificationNotes: [greenhouseNote], sourceHeadings: ['WHAT YOU’LL DO', 'WHAT YOU’LL BRING'],
    extracted: {
      responsibilities: ['클라우드·AI 네이티브 아키텍처의 새로운 위험과 공격 벡터 연구', '미해결 위험을 제품·엔지니어링 조직과 제품 기능으로 전환', '위험 증명과 기술 PoC 제작', '새롭고 복잡한 제품 범위의 보안 조사 지원'],
      requirements: ['현대 클라우드 환경 보안 또는 보안 연구 경력 5년 이상', 'Python 또는 Go를 이용한 연구 자동화', 'KQL 또는 SQL을 이용한 보안 텔레메트리 분석', '기업 환경에 배포된 AI의 보안 위험 연구 경험'],
      preferredQualifications: ['보안 연구 발표·기술 블로그·논문 경험', '대규모 보안 텔레메트리 기반 연구 경험'], programmingLanguages: ['Python', 'Go'], queryLanguages: ['KQL', 'SQL'], cloudPlatforms: ['AWS', 'GCP', 'Azure'], containerPlatforms: ['Kubernetes'], securityDomains: ['AI Security', 'Cloud Security', 'Security Research'], deliverables: ['위험 증명', '기술 PoC', '보안 연구 결과'], partnerTeams: ['제품 조직', '엔지니어링 조직', '마케팅 조직'],
    },
  },
  isoAi: {
    companyName: 'Isomorphic Labs', originalJobTitle: 'Senior Security Engineer (AI Safety), London, Lausanne',
    postingUrl: 'https://job-boards.greenhouse.io/isomorphiclabs/jobs/6100340004', sourceType: 'greenhouse',
    country: '영국·스위스', location: 'London, UK / Lausanne, Switzerland', workMode: 'hybrid', careerLevel: 'senior',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Your impact', 'Skills and qualifications'],
    extracted: {
      responsibilities: ['AI·ML 취약점 중심의 위협 모델과 위험관리 프레임워크 설계', '모델 가중치·코드·학습 데이터의 목록·분류·보호 체계 수립', 'LLM·MCP·자율 에이전트 워크플로의 가드레일·샌드박스·실시간 모니터링 설계', '데이터 수집부터 학습·추론까지 ML 수명주기 보안 통제 구현', 'AI 보안 사고 대응과 AI 기반 위협 사냥·이상 탐지 자동화', 'EU AI Act 관련 위험 상태와 지속적 컴플라이언스 지표 자동화'],
      requirements: ['JAX·PyTorch·TensorFlow와 대규모 클라우드 학습·추론 인프라 이해', '프롬프트 인젝션·모델 역전·데이터 포이즈닝과 OWASP LLM·MITRE ATLAS 이해', 'ADK·MCP 에이전트 보안과 A2A 인증·인가 경험', 'GCP·컨테이너·네트워크 격리 보안 역량', 'Python 기반 보안 도구와 정책 자동화 역량'],
      preferredQualifications: ['LLM·에이전트·ML 백엔드 대상 AI 레드팀 경험', '바이오·제약·딥테크 규제 환경 경험', 'OSCP 또는 Professional Cloud Security Engineer'], tools: ['JAX', 'PyTorch', 'TensorFlow', 'ADK'], programmingLanguages: ['Python'], cloudPlatforms: ['GCP'], containerPlatforms: ['Containers'], frameworks: ['OWASP Top 10 for LLM Applications', 'MITRE ATLAS', 'Model Context Protocol (MCP)'], lawsAndStandards: ['EU AI Act', 'GxP'], certifications: ['OSCP', 'Professional Cloud Security Engineer'], securityDomains: ['AI Security', 'AI Safety', 'Agent Security', 'ML Platform Security'], deliverables: ['AI 위험관리 프레임워크', '모델 자산 보호 체계', 'LLM·에이전트 가드레일', 'AI 사고 대응 체계'], partnerTeams: ['ML 연구 조직', '플랫폼 엔지니어링 조직', '법무', '컴플라이언스', 'Google DeepMind'], industryKnowledge: ['Life Sciences', 'Drug Discovery'],
    },
  },
  saronicAi: {
    companyName: 'Saronic', originalJobTitle: 'Security Engineer, AI Platform Engineering',
    postingUrl: 'https://jobs.ashbyhq.com/saronic/70d12fb4-31ac-4f7e-a7ab-9e172ee4d1e1', sourceType: 'ashby',
    country: '미국', location: 'Austin, Texas, United States', workMode: 'onsite', careerLevel: 'unknown',
    verificationNotes: [ashbyNote], sourceHeadings: ['Responsibilities', 'Required Qualifications', 'Preferred Qualifications'],
    extracted: {
      responsibilities: ['클라우드에 안전한 AI 애플리케이션·에이전트·자동화 구축', '전사 AI 사용 표준과 안전 교육 수립', 'AI 사용 목록·가시성·모니터링·로깅과 입출력 DLP 운영', '에이전트를 최소 권한 ID로 다루고 모델·에이전트 접근 통제', 'MCP 통합·도구 사용·컨텍스트·메모리와 평가 루프 설계'],
      requirements: ['LLM 기반 에이전트·도구·자동화 출시 경험', 'API·데이터 파이프라인·인증·비밀·컨테이너·IaC·CI/CD 구축 경험', '에이전트 루프·도구 호출·MCP·평가 이해', '프로덕션 시스템 보안과 데이터 처리 판단 역량'],
      preferredQualifications: ['AI 거버넌스·DLP·모니터링·가드레일 경험', '클라우드 AI 솔루션 구축 경험', '애플리케이션·클라우드·데이터 보안 배경'], cloudPlatforms: ['Cloud platforms'], containerPlatforms: ['Containers'], frameworks: ['Model Context Protocol (MCP)'], securityDomains: ['AI Platform Security', 'Agent Security', 'Data Loss Prevention'], deliverables: ['안전한 AI 플랫폼', 'AI 사용 목록', '가드레일', 'AI 사용 표준'], partnerTeams: ['엔지니어링 조직', '보안 조직', '법무', '전사 업무 조직'],
    },
  },
  anthropicOs: {
    companyName: 'Anthropic', originalJobTitle: 'Platform Security Engineering, Operating Systems',
    postingUrl: 'https://job-boards.greenhouse.io/anthropic/jobs/5290426008', sourceType: 'greenhouse',
    country: '미국', location: 'San Francisco / New York City / Seattle', workMode: 'hybrid', careerLevel: 'senior',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Key responsibilities', 'Minimum qualifications', 'Preferred qualifications'],
    extracted: {
      responsibilities: ['AI 워크로드용 강화 운영체제 구성 설계', '커널·사용자 공간 공격 표면 축소', 'SELinux·AppArmor·LSM 기반 커널 보안 정책 구현', 'AI 시스템·연구 환경·프로덕션 서비스용 보안 인프라 구축', '운영체제 증명·무결성 모니터링과 Secure Boot 설계', '컨테이너 팀과 커널 수준 워크로드 격리 설계'],
      requirements: ['Linux 커널과 SELinux·AppArmor·seccomp 이해', '커널 강화와 익스플로잇 완화 경험', 'C와 시스템 프로그래밍 역량', 'eBPF 보안 모니터링·통제 경험', '가상화·컨테이너 보안 이해'],
      preferredQualifications: ['운영체제 보안 또는 커널 개발 경력 5년 이상', '기밀 컴퓨팅·메모리 암호화 경험', '취약점 연구·익스플로잇 개발·퍼징 배경'], programmingLanguages: ['C'], operatingSystems: ['Linux'], tools: ['SELinux', 'AppArmor', 'eBPF'], containerPlatforms: ['Containers'], securityDomains: ['Operating System Security', 'AI Infrastructure Security', 'Kernel Security'], deliverables: ['강화 운영체제 구성', '커널 보안 정책', '무결성 모니터링', 'Secure Boot 체계'], partnerTeams: ['AI 연구 조직', '컨테이너 플랫폼 조직'],
    },
  },
  anthropicHardware: {
    companyName: 'Anthropic', originalJobTitle: 'Platform Hardware Security',
    postingUrl: 'https://job-boards.greenhouse.io/anthropic/jobs/5257689008', sourceType: 'greenhouse',
    country: '미국', location: 'San Francisco / New York City / Seattle', workMode: 'hybrid', careerLevel: 'staff',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Key responsibilities', 'Minimum qualifications', 'Preferred qualifications'],
    extracted: {
      responsibilities: ['AI 모델 학습용 베어메탈 인프라의 보안 아키텍처 설계', '펌웨어부터 운영체제까지 Secure Boot 체인 구현', '하드웨어 신뢰 루트 기반 증명과 런타임 무결성 모니터링 설계', '베어메탈 배포 참조 아키텍처와 보안 요구사항 작성', 'AI 학습 성능을 유지하며 인프라 보안 통제 통합', '펌웨어 취약점 평가와 분석 파이프라인 구축'],
      requirements: ['TPM·Intel TXT·AMD SEV·ARM TrustZone 기반 Secure Boot·증명 경험', 'UEFI·BIOS·부트로더 보안 경험', 'C·Rust·Assembly 시스템 프로그래밍 역량', '복잡한 분산 시스템 보안 아키텍처 설계 경험'],
      preferredQualifications: ['대규모 HPC 또는 클라우드 인프라 보안 경험', 'AI·ML 인프라 보안 경험', 'SLSA와 공급망 보안 경험'], tools: ['TPM', 'Intel TXT', 'AMD SEV', 'ARM TrustZone'], programmingLanguages: ['C', 'Rust', 'Assembly'], frameworks: ['SLSA'], securityDomains: ['Hardware Platform Security', 'AI Infrastructure Security', 'Firmware Security'], deliverables: ['보안 아키텍처', '증명 시스템', '참조 아키텍처', '위협 모델'], partnerTeams: ['AI 인프라 조직', '하드웨어 조직', '소프트웨어 조직', '하드웨어 공급업체'],
    },
  },
  openaiOffensiveAgents: {
    companyName: 'OpenAI', originalJobTitle: 'Offensive Security Engineer, Agent Products',
    postingUrl: 'https://jobs.ashbyhq.com/openai/bb97fffc-cdda-43a3-a6bc-234f9c031720', sourceType: 'ashby',
    country: '미국', location: 'Remote, United States', workMode: 'remote', careerLevel: 'principal', requiredYearsMin: 7,
    verificationNotes: [ashbyNote], sourceHeadings: ['In this role you will', 'You might thrive in this role if'],
    extracted: {
      responsibilities: ['에이전트 제품의 웹·API·클라우드·ID·CI/CD·모델 연결부 침투 테스트', '애플리케이션·인프라·도구·모델 상호작용에서 악용 가능한 취약점 탐색', '코드·아키텍처 검토와 실제 악용으로 위험 검증', '재현 절차·악용 가능성·영향·완화 권고 작성', '에이전트 제품용 테스트 하네스와 자동화 구축'],
      requirements: ['제품·애플리케이션·클라우드 공격 보안 경력 7년 이상', '복잡한 프로덕션 취약점 발견·악용·문서화·완화 경험', 'AI 기반 시스템 설계·개발 또는 평가 경험', '프롬프트 인젝션·Confused Deputy·안전하지 않은 도구 사용 취약점 경험', '보안 테스트 자동화 코딩 역량'],
      preferredQualifications: ['AI 또는 데이터 과학 배경'], programmingLanguages: ['Python', 'React'], cloudPlatforms: ['Azure'], containerPlatforms: ['Kubernetes', 'Containers'], operatingSystems: ['macOS', 'Linux'], securityDomains: ['Agent Security', 'AI Product Security', 'Offensive Security'], deliverables: ['침투 테스트 결과', '악용 가능성 분석', '완화 권고', '테스트 하네스'], partnerTeams: ['제품 엔지니어링 조직', '보안 조직'],
    },
  },
  openaiAgenticResearch: {
    companyName: 'OpenAI', originalJobTitle: 'Security Researcher, Agentic AI Threats',
    postingUrl: 'https://jobs.ashbyhq.com/openai/e0eef869-cd4d-4737-b7af-75c5a1970aeb', sourceType: 'ashby',
    country: '미국', location: 'San Francisco, California, United States', workMode: 'hybrid', careerLevel: 'unknown',
    verificationNotes: [ashbyNote], sourceHeadings: ['In this role, you will', 'You might thrive in this role if'],
    extracted: {
      responsibilities: ['고도화된 내부 AI 에이전트가 조직을 침해할 수 있는 경로 식별', '준비 기간이 긴 에이전트 보안 통제 설계', 'AI 에이전트 평가와 침투 테스트로 방어 체계 스트레스 테스트', '에이전트 위협 대응을 위한 보안 프로토타입 구축'],
      requirements: ['운영체제·클라우드·컨테이너·CI/CD·분산 시스템 보안 역량', '프로토타입을 직접 만드는 소프트웨어 엔지니어링 역량', '기술·비기술 이해관계자 협업 역량'],
      preferredQualifications: ['클라우드 인프라 보안과 AI 스택 경험'], containerPlatforms: ['Containers'], securityDomains: ['Agent Security', 'AI Security Research', 'AI Safety'], deliverables: ['에이전트 위협 경로', '보안 통제 설계', '에이전트 평가 결과', '보안 프로토타입'], partnerTeams: ['Preparedness 조직', 'Safety Research 조직', '인프라 조직'],
    },
  },
  cohereAgents: {
    companyName: 'Cohere', originalJobTitle: 'Senior Software Engineer, Security Agents',
    postingUrl: 'https://jobs.ashbyhq.com/cohere/a5bbd015-65a9-48a1-aab1-b266bdbc9905', sourceType: 'ashby',
    country: '캐나다', location: 'Toronto, Canada', workMode: 'hybrid', careerLevel: 'senior', requiredYearsMin: 5,
    verificationNotes: [ashbyNote], sourceHeadings: ['Your responsibilities will include', 'You may be a good fit if'],
    extracted: {
      responsibilities: ['경보 분류·코드 리뷰·위협 모델링·취약점 평가를 수행하는 자율 보안 에이전트 구축', '보안 업무를 자동화하는 에이전트 오케스트레이션 개발', '민감한 기업 데이터와 상호작용하는 에이전트 보안 통제 설계', '고신뢰 환경에서 에이전트를 운영하는 보안 인프라 구축', 'AI 에이전트 시스템의 새로운 보안 패턴 연구·구현', '에이전트와 실행 플랫폼 보안 테스트'],
      requirements: ['사용자용 보안 기능을 출시한 소프트웨어 엔지니어링 경력 5년 이상', '프로덕션 Python 개발 경험', '자율 시스템·AI 에이전트·지능형 자동화 경험', '세션·인증·인가·안전한 코딩 이해'],
      preferredQualifications: [], programmingLanguages: ['Python'], securityDomains: ['Agent Security', 'AI Product Security', 'Application Security'], deliverables: ['자율 보안 에이전트', '에이전트 오케스트레이션', '에이전트 보안 통제', '보안 인프라'], partnerTeams: ['보안 실무 조직', 'AI 플랫폼 조직'],
    },
  },
  tenARed: {
    companyName: '10a Labs', originalJobTitle: 'AI Red Teamer',
    postingUrl: 'https://job-boards.greenhouse.io/10alabs/jobs/4002005009', sourceType: 'greenhouse',
    country: '미국', location: 'Washington, D.C., United States', workMode: 'remote', careerLevel: 'mid', requiredYearsMin: 2, requiredYearsMax: 4,
    verificationNotes: [greenhouseNote], sourceHeadings: ['In This Role, You Will', 'We’re Looking for Someone Who'],
    extracted: {
      responsibilities: ['LLM과 이미지·비디오 모델의 수동·스크립트 기반 적대적 테스트 스위트 개발·실행', '다국어 프롬프트·탈옥·정책 경계 공격 체인 제작', '실패 출력 분류와 취약점 보고서 작성', '프롬프트 라이브러리·시나리오 생성기·대시보드 개발'],
      requirements: ['레드팀·보안 연구·Trust & Safety 경력 2~4년', 'Python·Bash·Jupyter 기반 테스트 스크립팅', 'AI 안전·적대적 ML·악용 탐지 이해', '취약점 보고서 작성 역량'],
      preferredQualifications: ['Promptfoo·LangChain·Garak 경험', '사이버 위협 인텔리전스 경험', '레드팀 또는 침투 테스트 교육·자격'], tools: ['Jupyter', 'Promptfoo', 'LangChain', 'Garak'], programmingLanguages: ['Python'], scriptingLanguages: ['Bash'], securityDomains: ['AI Red Teaming', 'Adversarial ML', 'AI Safety'], deliverables: ['적대적 테스트 스위트', '탈옥 시나리오', '취약점 보고서'], partnerTeams: ['AI 안전 조직', '보안 조직'],
    },
  },
  anthropicRed: {
    companyName: 'Anthropic', originalJobTitle: 'Red Team Engineer, Safeguards',
    postingUrl: 'https://job-boards.greenhouse.io/anthropic/jobs/5320469008', sourceType: 'greenhouse',
    country: '미국', location: 'Remote-friendly / San Francisco', workMode: 'hybrid', careerLevel: 'senior',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Key responsibilities', 'Minimum qualifications', 'Preferred qualifications'],
    extracted: {
      responsibilities: ['Anthropic 제품 전반의 적대적 테스트와 다중 공격 기법 시나리오 개발', '에이전트·도구 사용 등 새로운 AI 기능의 테스트 방법 연구·구현', '실제 위협 행위자를 모사한 전체 공격 체인 실행', '지속 평가용 자동 테스트 프레임워크 개발', '제품·엔지니어링·정책 조직과 개선 조치 연결'],
      requirements: ['침투 테스트·레드팀·애플리케이션 보안 경험', '모델 탈옥과 대규모 에이전트 워크플로 프롬프트 인젝션 테스트 경험', 'Burp Suite·Metasploit·커스텀 스크립트 기반 웹 보안 테스트', 'LLM 전용 테스트 자동화 경험'],
      preferredQualifications: ['AI·ML 보안 또는 적대적 ML 경험', 'AI 안전과 탈옥 가드레일 이해'], tools: ['Burp Suite', 'Metasploit'], securityDomains: ['AI Red Teaming', 'Agent Security', 'Adversarial ML'], deliverables: ['공격 시나리오', '자동 테스트 프레임워크', '평가 지표', '개선 권고'], partnerTeams: ['제품 조직', '엔지니어링 조직', '정책 조직'],
    },
  },
  anthropicFrontierRed: {
    companyName: 'Anthropic', originalJobTitle: 'Research Engineer / Scientist, Frontier Red Team (Cyber)',
    postingUrl: 'https://job-boards.greenhouse.io/anthropic/jobs/5076477008', sourceType: 'greenhouse',
    country: '미국', location: 'San Francisco, California, United States', workMode: 'hybrid', careerLevel: 'senior',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Responsibilities', 'You May Be a Good Fit If You', 'Strong Candidates May Also Have'],
    extracted: {
      responsibilities: ['자율 취약점 발견·수정·악성코드 탐지·네트워크 강화·침투 테스트용 AI 보안 시스템 개발', '현실적인 환경에서 자율 AI 사이버 역량 실험·평가', '보안 환경용 AI 평가 인프라 설계·구축', 'AI 공격자와 방어자를 이용한 퍼플팀 시뮬레이션', '정책 이해관계자용 기술 시연과 연구 결과 제작'],
      requirements: ['사이버보안 또는 보안 연구 전문성', 'LLM 에이전트 또는 자율 시스템 기술 연구 경험', 'Python 소프트웨어 엔지니어링 역량', '실험 설계와 반복 연구 역량'],
      preferredQualifications: ['공격 보안·취약점 연구·익스플로잇 개발 경험', 'LLM 보안 연구 경험', 'CTF·버그바운티 경험'], programmingLanguages: ['Python'], securityDomains: ['AI Red Teaming', 'Security Research', 'Autonomous Cybersecurity'], deliverables: ['AI 보안 시스템', '자율 AI 사이버 평가', '퍼플팀 시뮬레이션', '기술 시연'], partnerTeams: ['Security', 'Safeguards', 'Policy', '외부 보안 전문가'],
    },
  },
  elasticMac: {
    companyName: 'Elastic', originalJobTitle: 'macOS / Container Security - Senior Security Research Engineer',
    postingUrl: 'https://job-boards.greenhouse.io/elastic/jobs/8079634', sourceType: 'greenhouse',
    country: '미국', location: 'United States', workMode: 'remote', careerLevel: 'senior',
    verificationNotes: [greenhouseNote], sourceHeadings: ['What You Will Be Doing'],
    extracted: {
      responsibilities: ['macOS·Kubernetes·컨테이너 환경의 엔드포인트 탐지 분석 개발', '위협 시나리오 모사와 탐지 규칙 검증·개선', '보안 텔레메트리 공백 조사와 수집·분석 개선', '탐지 전략 기술 블로그와 OSINT 연구 발표', '보안 규칙과 탐지 콘텐츠 저장소 유지'],
      requirements: ['macOS·Kubernetes·컨테이너 탐지 규칙 개발 경험', 'Elastic Security 사용 경험', '오탐을 줄이고 탐지 범위를 개선한 경험', '보안 연구 커뮤니티 발표 또는 기여 경험'],
      preferredQualifications: [], operatingSystems: ['macOS'], containerPlatforms: ['Kubernetes', 'Containers'], securityProducts: ['Elastic Security'], securityDomains: ['Security Research', 'Endpoint Security', 'Container Security'], deliverables: ['탐지 규칙', '위협 시뮬레이션 결과', '보안 연구 글'], partnerTeams: ['엔지니어링 조직', '보안 연구 커뮤니티'],
    },
  },
  elasticMl: {
    companyName: 'Elastic', originalJobTitle: 'Principal Security ML Research Engineer',
    postingUrl: 'https://job-boards.greenhouse.io/elastic/jobs/8079632', sourceType: 'greenhouse',
    country: '미국', location: 'United States', workMode: 'remote', careerLevel: 'principal',
    verificationNotes: [greenhouseNote], sourceHeadings: ['What You Will Be Doing'],
    extracted: {
      responsibilities: ['위협 탐지·대응용 ML 아키텍처와 AI 에이전트 워크플로 설계', '보안 텔레메트리 행동 이상 탐지 모델 개발', '모델 성능 평가·벤치마크 파이프라인과 오탐 가드레일 구축', '적대적 공격·프롬프트 인젝션에 대한 모델 견고성 평가', '보안 ML 연구 결과의 블로그·백서·학회 발표'],
      requirements: ['보안 ML 모델 설계·구현 경력 5년 이상 또는 관련 석사', 'scikit-learn·XGBoost·PyTorch·TensorFlow 경험', '보안 텔레메트리 이상 탐지와 위협 행위자 프로파일링 경험', 'ML 평가 프레임워크와 벤치마크 파이프라인 경험', 'LLM API 프로덕션 통합 경험'],
      preferredQualifications: [], tools: ['scikit-learn', 'XGBoost', 'PyTorch', 'TensorFlow'], securityDomains: ['Security ML Research', 'Detection Engineering', 'AI Security'], deliverables: ['ML 탐지 모델', '평가 프레임워크', '벤치마크 파이프라인', '보안 연구 백서'], partnerTeams: ['제품 관리 조직', '엔지니어링 조직', '보안 연구 커뮤니티'],
    },
  },
  wizApplied: {
    companyName: 'Wiz', originalJobTitle: 'Applied Security Researcher',
    postingUrl: 'https://job-boards.greenhouse.io/wizinc/jobs/4692874006', sourceType: 'greenhouse',
    country: '이스라엘', location: 'Tel Aviv, Israel', workMode: 'hybrid', careerLevel: 'senior', requiredYearsMin: 5,
    verificationNotes: [greenhouseNote], sourceHeadings: ['WHAT YOU’LL DO', 'WHAT YOU’LL BRING'],
    extracted: {
      responsibilities: ['Wiz가 보호하는 코드·클라우드·AI 기술 조사', '추상적인 제품 아이디어를 기능성 프로토타입과 PoC로 구현', '클라우드·AI 네이티브 시스템의 위험과 공격 벡터 모델링', '애플리케이션·클라우드 문맥 분석을 위한 에이전트 워크플로 연구', '연구 결과를 제품 구현으로 전환'],
      requirements: ['보안 또는 보안 연구 경력 5년 이상', '공격자·방어자 관점의 위협 모델링 역량', '저수준·분산·코어 시스템 아키텍처 이해', '연구에서 PoC와 제품 통합까지 수행한 경험'],
      preferredQualifications: ['AWS·GCP·Azure·Kubernetes 보안 연구', 'AI 보안 연구 경험', '정적 코드 분석 또는 프로그래밍 언어 이론 이해'], cloudPlatforms: ['AWS', 'GCP', 'Azure'], containerPlatforms: ['Kubernetes'], queryLanguages: ['KQL', 'SQL'], securityDomains: ['Applied Security Research', 'Cloud Security', 'AI Security'], deliverables: ['기능성 프로토타입', 'PoC', '위험 모델', '제품 연구 결과'], partnerTeams: ['제품 조직', '엔지니어링 조직', '마케팅 조직'],
    },
  },
  wizMalUs: {
    companyName: 'Wiz', originalJobTitle: 'Threat Detection Researcher (Windows/Linux/MacOS)',
    postingUrl: 'https://job-boards.greenhouse.io/wizinc/jobs/4693950006', sourceType: 'greenhouse',
    country: '미국', location: 'New York City, United States', workMode: 'hybrid', careerLevel: 'senior', requiredYearsMin: 6,
    verificationNotes: [greenhouseNote], sourceHeadings: ['WHAT YOU’LL DO', 'WHAT YOU’LL BRING'],
    extracted: {
      responsibilities: ['클라우드 위협 탐지와 분석 도구 개발', '클라우드·AI 워크로드 대상 악성코드 조사', '실제 공격과 새로운 클라우드·AI 위협 사냥·분석', '연구 결과를 제품 기능으로 전환', '연구 기반 보안 정책·기술 글·학회 발표 작성'],
      requirements: ['보안·위협 연구 경력 6년 이상', 'Windows·Linux·macOS 내부 구조와 네트워크 이해', 'Python 도구 개발·자동화 경험', '고객용 보안 탐지 개발 경험'],
      preferredQualifications: ['악성코드 분석·리버싱·취약점 연구 경험', '위협 인텔리전스·IR·레드팀·위협 사냥 경험'], programmingLanguages: ['Python', 'Go', 'Rust', 'C', 'C++'], operatingSystems: ['Windows', 'Linux', 'macOS'], cloudPlatforms: ['AWS', 'GCP', 'Azure'], containerPlatforms: ['Kubernetes'], securityDomains: ['Malware Research', 'Threat Detection Research', 'Cloud Security'], deliverables: ['악성코드 조사 결과', '탐지 도구', '보안 정책', '보안 연구 글'], partnerTeams: ['R&D 조직', '제품 조직', '고객 대응 조직'],
    },
  },
  wizMalIl: {
    companyName: 'Wiz', originalJobTitle: 'Threat Detection Researcher (Windows/Linux/MacOS)',
    postingUrl: 'https://job-boards.greenhouse.io/wizinc/jobs/4670481006', sourceType: 'greenhouse',
    country: '이스라엘', location: 'Tel Aviv, Israel', workMode: 'hybrid', careerLevel: 'senior', requiredYearsMin: 6,
    verificationNotes: [greenhouseNote], sourceHeadings: ['WHAT YOU’LL DO', 'WHAT YOU’LL BRING'],
    extracted: {
      responsibilities: ['클라우드 위협 탐지와 분석 도구 개발', '클라우드·AI 워크로드 대상 악성코드 조사', '실제 공격과 새로운 클라우드·AI 위협 사냥·분석', '연구 결과를 제품 기능으로 전환', '연구 기반 보안 정책과 외부 발표 작성'],
      requirements: ['보안·위협 연구 경력 6년 이상', 'Windows·Linux·macOS 내부 구조와 네트워크 이해', 'Python 도구 개발·자동화 경험', '고객용 보안 탐지 개발 경험'],
      preferredQualifications: ['악성코드 분석·리버싱·취약점 연구 경험', '위협 인텔리전스·IR·레드팀·위협 사냥 경험'], programmingLanguages: ['Python', 'Go', 'Rust', 'C', 'C++'], operatingSystems: ['Windows', 'Linux', 'macOS'], cloudPlatforms: ['AWS', 'GCP', 'Azure'], containerPlatforms: ['Kubernetes'], securityDomains: ['Malware Research', 'Threat Detection Research', 'Cloud Security'], deliverables: ['악성코드 조사 결과', '탐지 도구', '보안 정책', '보안 연구 발표'], partnerTeams: ['R&D 조직', '제품 조직', '고객 대응 조직'],
    },
  },
  anthropicThreatIntel: {
    companyName: 'Anthropic', originalJobTitle: 'Senior/Staff Security Engineer, Threat Intelligence',
    postingUrl: 'https://job-boards.greenhouse.io/anthropic/jobs/5252342008', sourceType: 'greenhouse',
    country: '스위스', location: 'Zürich, Switzerland', workMode: 'hybrid', careerLevel: 'staff',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Responsibilities', 'Minimum qualifications', 'Preferred qualifications'],
    extracted: {
      responsibilities: ['AI 연구소·클라우드 대상 위협 행위자와 캠페인 연구·추적', 'IOC 수집·보강·상관분석·탐지 전환 파이프라인 개발', '엔드포인트·클라우드·ID·SaaS 위협 사냥과 탐지 전환', '악성코드·피싱 인프라·공격자 도구 기술 분석', 'YARA·Sigma·Snort·Suricata 탐지 로직 작성'],
      requirements: ['고도 위협 대상 CTI·위협 사냥·침해 분석 경험', 'Python 자동화·데이터 파이프라인 개발 역량', '악성코드·인프라·로그 분석 경험', 'YARA·Sigma·Snort·Suricata 또는 SIEM 쿼리 작성 경험'],
      preferredQualifications: ['AWS·GCP·Kubernetes·ML 인프라 방어 경험', '공개 CTI 연구·학회 발표·오픈소스 도구 기여'], tools: ['YARA', 'Sigma', 'Snort', 'Suricata'], programmingLanguages: ['Python'], cloudPlatforms: ['AWS', 'GCP'], containerPlatforms: ['Kubernetes'], securityDomains: ['Malware Research', 'Threat Intelligence', 'Threat Hunting'], deliverables: ['악성코드 분석', '위협 인텔리전스', '탐지 규칙', '위협 사냥 가설'], partnerTeams: ['Detection Engineering', 'Incident Response', 'Security Engineering'],
    },
  },
  anthropicCyberRl: {
    companyName: 'Anthropic', originalJobTitle: 'Research Engineer, Cybersecurity RL (Reinforcement Learning)',
    postingUrl: 'https://job-boards.greenhouse.io/anthropic/jobs/5025624008', sourceType: 'greenhouse',
    country: '미국', location: 'San Francisco / New York City', workMode: 'hybrid', careerLevel: 'unknown',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Role', 'You may be a good fit if you', 'Strong candidates may also have'],
    extracted: {
      responsibilities: ['안전한 코딩·취약점 수정 등 방어 보안 AI 능력 연구', '사이버보안 RL 환경 설계·구현', '모델 실험과 평가 수행', '연구 결과를 프로덕션 학습 실행에 적용', '연구자·엔지니어·보안 전문가와 공동 연구'],
      requirements: ['사이버보안 연구 경험', '머신러닝 경험', '강한 소프트웨어 엔지니어링 역량', '연구 탐색과 구현을 함께 수행하는 역량'],
      preferredQualifications: ['보안 엔지니어링·퍼징·탐지 대응 경험', 'CTF·사이버 레인지 구축 경험', 'RL 환경과 LLM 학습 방법론 이해'], programmingLanguages: ['Python'], frameworks: ['Reinforcement Learning'], securityDomains: ['Security Research Engineering', 'AI Security', 'Defensive Security'], deliverables: ['RL 보안 환경', '모델 실험', '평가 결과', '프로덕션 학습 코드'], partnerTeams: ['AI 연구 조직', '보안 전문가', '엔지니어링 조직'],
    },
  },
  saronicThreatIntel: {
    companyName: 'Saronic', originalJobTitle: 'Security Engineer, Cyber Threat Intelligence',
    postingUrl: 'https://jobs.ashbyhq.com/saronic/2e831f46-b2ec-4a43-99a3-1990808224e5', sourceType: 'ashby',
    country: '미국', location: 'Austin, Texas, United States', workMode: 'onsite', careerLevel: 'mid', requiredYearsMin: 4,
    verificationNotes: [ashbyNote], sourceHeadings: ['Responsibilities', 'Qualifications', 'Preferred Qualifications'],
    extracted: {
      responsibilities: ['국가 지원·APT·고도 범죄 행위자의 도구·인프라·전술과 캠페인 추적', 'IOC·TTP를 탐지·위협 사냥·수정 우선순위로 전환', 'Sigma·YARA 탐지와 위협 사냥 작성', '인프라 피벗과 악성코드 분류로 IOC·TTP·귀속 신호 추출', '인텔리전스 보강·분류를 위한 자동화와 AI 에이전트 워크플로 구축'],
      requirements: ['CTI·위협 사냥·탐지 엔지니어링·침해 분석 경력 4년 이상', '인텔리전스 수명주기와 구조화 분석 기법 이해', '자동화·커넥터·데이터 파이프라인 소프트웨어 엔지니어링', 'MITRE ATT&CK·Diamond Model·Cyber Kill Chain 이해'],
      preferredQualifications: ['악성코드 분석과 공격자 귀속 경험', 'MISP 또는 STIX/TAXII 파이프라인 경험', '공개 CTI 연구·발표·오픈소스 기여'], tools: ['Sigma', 'YARA', 'MISP'], frameworks: ['MITRE ATT&CK', 'Diamond Model', 'Cyber Kill Chain'], protocols: ['STIX', 'TAXII'], securityDomains: ['Malware Research', 'Threat Intelligence', 'Detection Engineering'], deliverables: ['악성코드 분류 결과', '탐지 규칙', '위협 인텔리전스', '위협 사냥'], partnerTeams: ['Security Operations', 'Detection Engineering', 'Incident Response', 'Red Team'],
    },
  },
  twoSixVr: {
    companyName: 'Two Six Technologies', originalJobTitle: 'Vulnerability Researcher',
    postingUrl: 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/5819533004', sourceType: 'greenhouse',
    country: '미국', location: 'Dayton, Ohio, United States', workMode: 'onsite', careerLevel: 'mid',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Responsibilities', 'Basic Qualifications', 'Preferred'],
    extracted: {
      responsibilities: ['임베디드 시스템과 소프트웨어 구성요소 표적 리버스 엔지니어링', '정적·동적 분석으로 보안 약점 발견', '발견 취약점의 영향과 연구 진척을 보여주는 PoC 개발', '기술 보고서와 연구 문서 작성', '연구 결과를 고객 솔루션으로 전환'],
      requirements: ['취약점 연구·보안 연구·리버스 엔지니어링 경험', 'Ghidra·IDA Pro·Binary Ninja 중 하나 사용 경험', 'GDB 또는 WinDbg 디버깅 경험', 'C 또는 C++와 Python 역량'],
      preferredQualifications: ['AFL++·LibFuzzer·Boofuzz 경험', 'JTAG·SWD·UART 펌웨어 추출 경험', 'ASLR·DEP·Stack Canary 우회 이해'], tools: ['Ghidra', 'IDA Pro', 'Binary Ninja', 'GDB', 'WinDbg', 'AFL++', 'LibFuzzer', 'Boofuzz'], programmingLanguages: ['C', 'C++', 'Python'], operatingSystems: ['Unix-like'], protocols: ['TCP/IP', 'UDP', 'HTTP'], securityDomains: ['Vulnerability Research', 'Reverse Engineering', 'Embedded Security'], deliverables: ['PoC', '기술 보고서', '취약점 연구 결과'], partnerTeams: ['CNO 개발 조직', '하드웨어 엔지니어링 조직', '고객 조직'],
    },
  },
  twoSixLeadVr: {
    companyName: 'Two Six Technologies', originalJobTitle: 'Lead Vulnerability Researcher',
    postingUrl: 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/5819540004', sourceType: 'greenhouse',
    country: '미국', location: 'Dayton, Ohio, United States', workMode: 'onsite', careerLevel: 'lead',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Responsibilities', 'Basic Qualifications', 'Preferred'],
    extracted: {
      responsibilities: ['대규모 취약점 연구 프로젝트 기술 실행 주도', '문서화되지 않은 임베디드·무선 시스템 연구 전략 설계', '코드 리뷰와 지식 공유를 통한 연구자 멘토링', '임무 요구사항을 기술 요구사항으로 변환하고 연구 결과 발표', '연구 효율을 높이는 도구·자동화·방법론 구현'],
      requirements: ['취약점 연구·리버스 엔지니어링·CNO 개발 경력', 'Ghidra·IDA Pro·Binary Ninja 전문성', 'x86·ARM·MIPS 어셈블리와 운영체제 내부 구조 이해', '복잡한 시스템 취약점 발견 또는 정교한 익스플로잇 개발 실적'],
      preferredQualifications: ['ASLR·DEP·CFG 완화 우회 경험', '공개 연구·학회 발표·CVE 실적'], tools: ['Ghidra', 'IDA Pro', 'Binary Ninja', 'GDB', 'WinDbg'], programmingLanguages: ['Assembly'], protocols: ['TCP/IP', 'UDP', 'HTTP'], securityDomains: ['Vulnerability Research', 'Reverse Engineering', 'Wireless Security'], deliverables: ['연구 전략', '자동화 도구', '취약점 연구 결과', '기술 발표'], partnerTeams: ['무선 연구 조직', '정부 고객'],
    },
  },
  twoSixCyberLead: {
    companyName: 'Two Six Technologies', originalJobTitle: 'Lead Cybersecurity Researcher',
    postingUrl: 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/6113708004', sourceType: 'greenhouse',
    country: '미국', location: 'Linthicum, Maryland, United States', workMode: 'onsite', careerLevel: 'lead',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Responsibilities', 'Basic Qualifications', 'Preferred'],
    extracted: {
      responsibilities: ['하드웨어·소프트웨어·운영 시스템의 취약점과 공격 식별 주도', '확인된 취약점의 PoC 코드 개발', '임베디드 시스템 리버싱과 소스 코드 보안 검토', '취약점의 임무 영향 분석과 대응책 제안', '공격·연구 결과 보고서와 브리핑 작성'],
      requirements: ['리버싱·취약점 분석·침투 테스트·포렌식 또는 시스템 엔지니어링 경력', 'C·C++·Python과 x86·ARM·MIPS 중 하나 역량', 'Linux 명령줄 환경과 디컴파일러 사용 경험', '에뮬레이터·퍼저와 디버거 사용 경험'],
      preferredQualifications: ['임베디드 펌웨어·RTOS·네트워크 시스템 경험', 'TLS·SSH와 하드웨어 디버깅 경험'], tools: ['IDA Pro', 'Binary Ninja', 'Ghidra', 'GDB', 'WinDbg', 'Fuzzers', 'Emulators'], programmingLanguages: ['C', 'C++', 'Python', 'Assembly'], operatingSystems: ['Linux', 'RTOS'], protocols: ['TLS', 'SSH'], securityDomains: ['Systems Security Research', 'Vulnerability Research', 'Exploit Development'], deliverables: ['PoC', '취약점 영향 분석', '대응책', '기술 보고서'], partnerTeams: ['하드웨어 조직', '소프트웨어 조직', '정부 고객'],
    },
  },
  twoSixCyberPrincipal: {
    companyName: 'Two Six Technologies', originalJobTitle: 'Principal Cybersecurity Researcher',
    postingUrl: 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/6113716004', sourceType: 'greenhouse',
    country: '미국', location: 'Linthicum, Maryland, United States', workMode: 'onsite', careerLevel: 'principal',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Responsibilities', 'Basic Qualifications', 'Preferred'],
    extracted: {
      responsibilities: ['하드웨어·소프트웨어·운영 도메인 취약점 연구 프로그램 기술 주도', '확인된 취약점의 PoC 코드 개발', '임베디드 시스템 리버싱과 소스 코드 위험 검토', '취약점·공격의 운영 영향 분석과 대응책 설계', '연구 방법론·PoC 검토와 연구자 멘토링'],
      requirements: ['리버싱·취약점 분석·침투 테스트·포렌식 또는 시스템 엔지니어링 경력', 'C·C++·Python과 x86·ARM·MIPS 중 하나 역량', 'Linux와 디컴파일러·에뮬레이터·퍼저·디버거 경험'],
      preferredQualifications: ['임베디드 펌웨어·RTOS·네트워크 시스템 경험', '하드웨어 디버거와 TLS·SSH 경험'], tools: ['IDA Pro', 'Binary Ninja', 'Ghidra', 'GDB', 'WinDbg', 'Fuzzers', 'Emulators'], programmingLanguages: ['C', 'C++', 'Python', 'Assembly'], operatingSystems: ['Linux', 'RTOS'], protocols: ['TLS', 'SSH'], securityDomains: ['Systems Security Research', 'Vulnerability Research'], deliverables: ['PoC', '공격 영향 분석', '대응책', '연구 방법론'], partnerTeams: ['엔지니어링 조직', '연구 조직', '정부 고객'],
    },
  },
  twoSixEmbeddedResearch: {
    companyName: 'Two Six Technologies', originalJobTitle: 'Senior Cybersecurity Researcher',
    postingUrl: 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/6018909004', sourceType: 'greenhouse',
    country: '미국', location: 'Herndon, Virginia, United States', workMode: 'onsite', careerLevel: 'senior',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Responsibilities', 'Basic Qualifications', 'Preferred'],
    extracted: {
      responsibilities: ['무선·임베디드 시스템과 펌웨어 리버스 엔지니어링', '발견한 취약점의 유지 가능한 PoC 익스플로잇 개발', '펌웨어·소프트웨어 보호·무선 프로토콜 분석', '소프트웨어·펌웨어 바이너리 분석·조작 도구 개발', 'CNO 개발자·취약점 연구자·하드웨어 엔지니어와 공동 연구'],
      requirements: ['C·C++·Python과 Linux 명령줄 역량', 'IDA Pro·Binary Ninja·Ghidra 기반 리버싱·취약점 연구', '펌웨어 분석·재호스팅·퍼징·익스플로잇 개발 중 하나 전문성'],
      preferredQualifications: ['RTOS·Linux 임베디드 개발 경험', 'JTAG·SWD·SDR 경험'], tools: ['IDA Pro', 'Binary Ninja', 'Ghidra', 'QEMU', 'JTAG', 'SWD'], programmingLanguages: ['C', 'C++', 'Python'], operatingSystems: ['Linux', 'RTOS'], securityDomains: ['Systems Security Research', 'Exploit Development', 'Reverse Engineering'], deliverables: ['PoC 익스플로잇', '분석 도구', '취약점 연구 결과'], partnerTeams: ['CNO 개발 조직', '취약점 연구 조직', '하드웨어 엔지니어링 조직'],
    },
  },
  twoSixSeniorPrincipal: {
    companyName: 'Two Six Technologies', originalJobTitle: 'Senior Principal Cybersecurity Researcher',
    postingUrl: 'https://job-boards.greenhouse.io/twosixtechnologies/jobs/5892477004', sourceType: 'greenhouse',
    country: '미국', location: 'Arlington, Virginia, United States', workMode: 'onsite', careerLevel: 'principal',
    verificationNotes: [greenhouseNote], sourceHeadings: ['Responsibilities', 'Basic qualifications', 'Preferred'],
    extracted: {
      responsibilities: ['리버싱·취약점 연구 프로그램 계획과 실행 주도', '해답이 알려지지 않은 저수준 보안 문제 연구', '연구 결과·백서·제안서 작성', '공격 표면 분류와 취약점 식별', '보안 영향을 증명하는 PoC 익스플로잇 개발'],
      requirements: ['C·C++·Assembly와 디컴파일러·리호스팅·커스텀 퍼징 하네스 중 2개 이상 전문성', '공격 표면 분류·취약점 발견·PoC 개발 경험', '리버싱·취약점 연구 또는 R&D 프로젝트 주도 경험', '고품질 기술 문서 작성 경험'],
      preferredQualifications: ['임베디드 ARM·MIPS·PPC·RTOS·Linux·Baremetal 리버싱 경험', '가속화된 리버싱·취약점 연구 도구 경험'], programmingLanguages: ['C', 'C++', 'Assembly'], operatingSystems: ['Linux', 'RTOS', 'Baremetal'], tools: ['Disassemblers', 'Decompilers', 'Binary re-hosting frameworks', 'Custom fuzzing harnesses'], securityDomains: ['Systems Security Research', 'Exploit Development', 'Vulnerability Research'], deliverables: ['PoC 익스플로잇', '기술 보고서', '백서', '연구 프로그램'], partnerTeams: ['연구 조직', '정부 고객'],
    },
  },
  m9Vr: {
    companyName: 'M9 Solutions', originalJobTitle: 'Senior Vulnerability Researcher – Windows / CNE',
    postingUrl: 'https://job-boards.greenhouse.io/m9solutions/jobs/5065180007', sourceType: 'greenhouse',
    country: '미국', location: 'Arlington, Virginia, United States', workMode: 'onsite', careerLevel: 'senior', requiredYearsMin: 3,
    verificationNotes: [greenhouseNote], sourceHeadings: ['Responsibilities', 'Required Skills and Qualifications'],
    extracted: {
      responsibilities: ['Windows 운영체제·커널·드라이버 고급 취약점 연구', '복잡한 취약점 분석과 리버스 엔지니어링', 'PoC와 악용 경로를 이용한 취약점 검증', '현대 Windows에서 새로운 취약점 발견·악용 기법 프로토타입', '연구 결과를 임무용 역량으로 전환'],
      requirements: ['Windows 취약점 연구·익스플로잇 개발·CNE 리버싱 경력 3년 이상', '현대 Windows 완화 환경의 비정상 취약점 발견·악용 실적', 'IDA Pro·Ghidra·Binary Ninja·WinDbg·x64dbg 경험', 'x86·x64 Assembly·C·C++·Python 역량'],
      preferredQualifications: [], tools: ['IDA Pro', 'Ghidra', 'Binary Ninja', 'WinDbg', 'x64dbg'], programmingLanguages: ['Assembly', 'C', 'C++', 'Python'], operatingSystems: ['Windows'], securityDomains: ['Vulnerability Research', 'Exploit Development', 'Windows Security'], deliverables: ['PoC', '악용 경로', '기술 연구 결과', '운영 역량'], partnerTeams: ['임무 조직', '엔지니어링 조직'],
    },
  },
  armFuzz: {
    companyName: 'Arm', originalJobTitle: 'Principal Security Engineer - Fuzzing Specialist',
    postingUrl: 'https://careers.arm.com/job/cambridge/staff-security-engineer-fuzzing-specialist/33099/90518564384', sourceType: 'companyCareer',
    country: '영국', location: 'Cambridge, United Kingdom', workMode: 'hybrid', careerLevel: 'principal', requiredYearsMin: 1,
    verificationNotes: ['2026-08-01 공식 Arm 개별 공고를 GET으로 열어 Job ID 2025-15045·본문·Apply 경로를 확인했다.'], sourceHeadings: ['Job Overview', 'Responsibilities', 'Required Skills and Experience', 'Nice To Have'],
    extracted: {
      responsibilities: ['서비스·라이브러리·API·프로토콜 퍼징 표면과 우선순위 로드맵 관리', 'libFuzzer·AFL++·Honggfuzz 하네스 설계·개발', '시드 코퍼스·변이 전략·계측으로 코드 커버리지 개선', '크래시 분류·근본 원인 분석 자동화와 악용 가능성 판단', '커스텀 Sanitizer 개발과 수정 검증·회귀 코퍼스 관리'],
      requirements: ['커버리지 기반 퍼징 중심 보안 경력 1년 이상', 'libFuzzer·AFL++·Honggfuzz 중 하나 실무 경험', 'C·C++와 Python 역량', '메모리 안전 취약점·Sanitizer·컴파일러 계측 이해', 'GDB·LLDB·IDA·Ghidra 기반 크래시 분석 경험'],
      preferredQualifications: ['분산 퍼징 클러스터 경험', 'Syzkaller·QEMU 기반 커널·펌웨어 퍼징', 'CI/CD 퍼징 통합 경험'], tools: ['libFuzzer', 'AFL++', 'Honggfuzz', 'GDB', 'LLDB', 'IDA', 'Ghidra', 'Syzkaller', 'QEMU'], programmingLanguages: ['C', 'C++', 'Python'], cloudPlatforms: ['AWS', 'GCP'], containerPlatforms: ['Kubernetes'], securityDomains: ['Fuzzing', 'Vulnerability Research', 'Crash Triage'], deliverables: ['퍼징 하네스', '코퍼스', '크래시 보고서', '커버리지 지표', '커스텀 Sanitizer'], partnerTeams: ['제품 엔지니어링 조직'],
    },
  },
  kbrFuzz: {
    companyName: 'KBR', originalJobTitle: 'Vulnerability Researcher',
    postingUrl: 'https://kbr.wd5.myworkdayjobs.com/en-US/KBR_Careers/job/Vulnerability-Researcher_R2121825', sourceType: 'workday',
    country: '미국', location: 'Beavercreek, Ohio, United States', workMode: 'onsite', careerLevel: 'mid', requiredYearsMin: 4, requiredYearsMax: 9,
    verificationNotes: ['2026-08-01 공식 Workday 개별 공고를 GET으로 열어 requisition R2121825·본문·Apply 경로를 확인했다.'], sourceHeadings: ['Job Description', 'Minimum Qualifications'],
    extracted: {
      responsibilities: ['임베디드·펌웨어용 에뮬레이션 기반 테스트 환경 구축', '커버리지 기반 퍼징 워크플로와 퍼징 하네스 개발', '크래시 분류와 근본 원인 분석', '통제된 연구실에서 PoC 익스플로잇 개발 지원', '재현 가능한 발견 결과와 기술 문서 작성'],
      requirements: ['취약점 연구·리버싱·익스플로잇 개발 경력 4~9년', '임베디드 시스템·펌웨어·운영체제·저수준 소프트웨어 이해', 'C·C++·Python·Assembly 역량', '에뮬레이션 환경과 커버리지 퍼징·크래시 분류 경험'],
      preferredQualifications: [], programmingLanguages: ['C', 'C++', 'Python', 'Assembly'], tools: ['Coverage-guided fuzzers', 'Emulators'], securityDomains: ['Fuzzing', 'Vulnerability Research', 'Embedded Security'], deliverables: ['퍼징 워크플로', '퍼징 하네스', '크래시 근본 원인 분석', 'PoC', '기술 문서'], partnerTeams: ['리버스 엔지니어링 조직', '취약점 연구 조직', '정부 고객'],
    },
  },
  nightwingFuzz: {
    companyName: 'Nightwing', originalJobTitle: 'Senior Vulnerability Researcher',
    postingUrl: 'https://nwis.wd12.myworkdayjobs.com/en-US/NW/job/Senior-Vulnerability-Researcher_JR101224', sourceType: 'workday',
    country: '미국', location: 'Annapolis Junction, Maryland, United States', workMode: 'onsite', careerLevel: 'senior', requiredYearsMin: 8,
    verificationNotes: ['2026-08-01 공식 Workday 개별 공고를 GET으로 열어 requisition JR101224·본문·Apply 경로를 확인했다.'], sourceHeadings: ['Job Description Vulnerability Researcher', 'Required Skills'],
    extracted: {
      responsibilities: ['제로데이 취약점 탐색', '프로그램 동작 분석·설계·식별', '소프트웨어 애플리케이션 개발·테스트·디버깅', '새 취약점 연구 기법 설계', '디버깅과 퍼징 기법을 연구에 적용'],
      requirements: ['기술 환경 실무 경력 8년 이상', '본인 명의 제로데이 또는 CVE 발견 실적', 'AFL·LibFuzzer·ClusterFuzz·OSS-Fuzz 작성 또는 사용 경험', 'CodeQL·Joern·Semgrep 사용 경험', '제로데이·원데이 취약점 악용 또는 제품화 경험'],
      preferredQualifications: [], tools: ['AFL', 'LibFuzzer', 'ClusterFuzz', 'OSS-Fuzz', 'CodeQL', 'Joern', 'Semgrep', 'Ghidra', 'IDA Pro', 'Binary Ninja', 'GDB', 'WinDbg'], programmingLanguages: ['C', 'C++', 'Python'], operatingSystems: ['Linux'], securityDomains: ['Fuzzing', 'Vulnerability Research', 'Exploit Development'], deliverables: ['퍼저', '취약점 연구 기법', '제로데이 발견 결과', '연구 코드'], partnerTeams: ['취약점 연구 조직'],
    },
  },
  srlabsFuzz: {
    companyName: 'Security Research Labs', originalJobTitle: 'Security Engineer (m/f/d)',
    postingUrl: 'https://security-research-labs.jobs.personio.com/job/2715800?language=en', sourceType: 'personio',
    country: '독일', location: 'Berlin, Germany', workMode: 'hybrid', careerLevel: 'junior',
    verificationNotes: ['2026-08-01 공식 Personio 개별 공고를 GET으로 열어 제목·본문·Apply now 경로를 확인했다.'], sourceHeadings: ['What will you do', 'What do you bring'],
    extracted: {
      responsibilities: ['사내 퍼징 프레임워크와 정적·동적 분석 파이프라인 개발·유지', '퍼징 프레임워크를 이용한 엔터프라이즈·Web3 코드 감사', 'AI·LLM·에이전트 시스템 취약점 평가', '고품질 기술 보고서와 발표 자료 작성', '발견 이슈 수정과 SDLC 개선 자문'],
      requirements: ['소프트웨어 보안·보안 아키텍처·위협 모델링 이해', 'CTF·버그바운티·침투 테스트·독립 연구 취약점 발견 실적', '정적·동적 분석·퍼징·CI 통합 도구 자동화 역량', '고객에게 위험과 수정 방안을 설명하는 역량'],
      preferredQualifications: ['Rust·C·C++·Go·Solidity 경험', 'AI·LLM 보안 위험 조사 경험'], programmingLanguages: ['Rust', 'C', 'C++', 'Go', 'Solidity'], securityDomains: ['Fuzzing', 'Security Tooling', 'AI Security', 'Web3 Security'], deliverables: ['사내 퍼징 프레임워크', '분석 파이프라인', '코드 감사 결과', '기술 보고서'], partnerTeams: ['고객 개발 조직', 'Security Ambassador 조직'],
    },
  },
  amazonFuzz: {
    companyName: 'Amazon', originalJobTitle: 'Security Engineer SoC, Devices and Services Security',
    postingUrl: 'https://amazon.jobs/en/jobs/10384840/security-engineer-soc-devices-and-services-security', sourceType: 'amazonJobs',
    country: '인도', location: 'Bangalore, Karnataka, India', workMode: 'onsite', careerLevel: 'mid', requiredYearsMin: 3,
    verificationNotes: ['2026-08-01 공식 Amazon.jobs 개별 공고를 GET으로 열어 Job ID 10384840·본문·Apply 경로를 확인했다.'], sourceHeadings: ['DESCRIPTION', 'BASIC QUALIFICATIONS', 'PREFERRED QUALIFICATIONS'],
    extracted: {
      responsibilities: ['디바이스 보안 설계·위협 모델링·코드 리뷰·보안 테스트·퍼징 수행', '대규모 디바이스 보안을 개선할 도구와 기법 연구·개발', '디바이스 제품 조직에 기술 보안 자문 제공', '보안 위험 식별과 제품 엔지니어의 완화 조치 수립 지원', '새 보안 정책·절차 개발'],
      requirements: ['위협 모델링·안전한 코딩·소프트웨어 개발·암호·시스템·네트워크 보안 중 3년 이상', '관련 학사 학위'],
      preferredQualifications: ['디바이스·SoC·Secure Boot·부트로더·펌웨어 보안 경험'], securityDomains: ['Fuzzing', 'SoC Security', 'Device Security'], deliverables: ['보안 테스트 결과', '퍼징 결과', '보안 도구', '위험 완화 방안'], partnerTeams: ['디바이스 제품 조직', '칩 설계 조직', '펌웨어 개발 조직'], industryKnowledge: ['Consumer Devices'],
    },
  },
  googleAgenticRed: {
    companyName: 'Google DeepMind', originalJobTitle: 'Senior Security Engineer, Agentic Red Team',
    postingUrl: 'https://www.google.com/about/careers/applications/jobs/results/139489025168679622-senior-security-engineer-agentic-red-team-deepmind', sourceType: 'googleCareers',
    country: '미국·스위스', location: 'Mountain View, CA / New York, NY / Zürich', workMode: 'unknown', careerLevel: 'senior', requiredYearsMin: 5,
    verificationNotes: ['2026-08-01 Google Careers 개별 공고에서 제목·근무지·Apply·최소/우대 자격·담당업무 본문을 직접 확인했다.'], sourceHeadings: ['Minimum qualifications', 'Preferred qualifications', 'Responsibilities'],
    extracted: {
      responsibilities: ['에이전트 서비스의 생성형 AI 고유 취약점에 대한 보안 평가', '프롬프트 인젝션·도구 사용·에이전트 논리 오류 공격 시퀀스 설계·실행', '모델 행동 기반 발견을 자동 회귀 테스트 프레임워크로 전환', '제품 개발자와 설계·개발 단계에서 보안 피드백 협업', '에이전트 공격 패턴과 익스플로잇 프리미티브 라이브러리 확장'],
      requirements: ['레드팀·오펜시브 보안·적대적 머신러닝 경력 5년 이상', 'LLM 아키텍처·에이전트 워크플로·AI 취약점 이해', '프롬프트 인젝션·적대적 예제·학습 데이터 추출 등 GenAI 익스플로잇 개발 경험'],
      preferredQualifications: ['AI 안전 벤치마크·평가 프레임워크·퍼징 경험', 'Python·Go·C++로 보안 도구·자동화 개발'], programmingLanguages: ['Python', 'Go', 'C++'], frameworks: ['AI safety benchmarks', 'Auto Red Teaming'], securityDomains: ['AI Red Teaming', 'Agent Security', 'Adversarial ML'], deliverables: ['에이전트 보안 평가', '자동 회귀 테스트 프레임워크', '공격 패턴 라이브러리', '보안 설계 피드백'], partnerTeams: ['Google DeepMind Security', '제품 개발 조직', 'AI 연구 조직'],
    },
  },
}

function posting(mapping) {
  const source = sources[mapping.sourceKey]
  const target = roleResearchTargetById[mapping.roleId]
  if (!source || !target) throw new Error(`Unknown AI/R&D enrichment mapping: ${mapping.sourceKey}/${mapping.roleId}`)
  return prepareEnrichedPosting({
    id: `ai-rnd-additional-${mapping.sourceKey}-${mapping.roleId.replace('catalog-', '')}`,
    roleId: mapping.roleId,
    domainId: target.domainId,
    familyId: target.familyId,
    companyName: source.companyName,
    originalJobTitle: source.originalJobTitle,
    normalizedRoleTitle: target.roleTitle,
    market: 'international',
    country: source.country,
    location: source.location,
    workMode: source.workMode,
    employmentType: 'Full-time',
    careerLevel: source.careerLevel,
    requiredYearsMin: source.requiredYearsMin ?? null,
    requiredYearsMax: source.requiredYearsMax ?? null,
    source: {
      postingUrl: source.postingUrl,
      sourceType: source.sourceType,
      checkedDate,
      status: 'open',
      titleVerified: true,
      companyVerified: true,
      bodyVerified: true,
      applicationAvailable: true,
      verificationNotes: source.verificationNotes,
    },
    match: {
      level: mapping.level,
      score: mapping.score,
      titleMatch: mapping.titleMatch ?? false,
      responsibilityMatchCount: mapping.matchedResponsibilities.length,
      foundationMatchCount: Math.min(3, source.extracted.requirements?.length || 0),
      reasons: mapping.reasons,
      matchedResponsibilities: mapping.matchedResponsibilities,
      unmatchedCoreResponsibilities: [],
    },
    extracted: source.extracted,
    evidence: {
      sourceHeadings: source.sourceHeadings,
      extractionNotes: ['공식 개별 공고의 업무·자격요건·우대사항 구분만 사용했으며 역할별 일치 근거를 독립적으로 기록했다.'],
      limitations: ['공고와 지원 상태는 수시로 변경될 수 있다.'],
    },
  })
}

const mappings = [
  // AI·ML Security Engineer: 기존 1건에 4건을 추가한다.
  { sourceKey: 'scopelyAi', roleId: 'catalog-ai-ml-security-engineer', level: 'exact', score: 96, titleMatch: true, reasons: ['공고 제목이 Senior AI Security Engineer로 대표 직무와 직접 대응한다.', 'AI 플랫폼 통제·관측성·자동 수정이 핵심 업무다.'], matchedResponsibilities: ['AI 플랫폼 보안 관측성 설계', 'AI 보안 결과의 자동 수정', 'AI 런타임 하드닝', 'AI 애플리케이션 변경 보안 검토'] },
  { sourceKey: 'elasticAi', roleId: 'catalog-ai-ml-security-engineer', level: 'exact', score: 97, titleMatch: true, reasons: ['공고 제목이 AI Security 연구 엔지니어다.', '생성형 AI 위협 연구와 보안 워크플로 개발이 주요 업무다.'], matchedResponsibilities: ['생성형 AI 공격 방법 연구', 'AI 보안 워크플로 개발', 'AI 위협 탐지 규칙 개발', 'AI 보안 연구 결과 공유'] },
  { sourceKey: 'wizAi', roleId: 'catalog-ai-ml-security-engineer', level: 'exact', score: 98, titleMatch: true, reasons: ['공고 제목이 AI Security Researcher다.', 'AI 네이티브 위험 연구와 보안 제품 통제 전환이 역할의 중심이다.'], matchedResponsibilities: ['AI 네이티브 공격 벡터 연구', 'AI 위험을 제품 통제로 전환', 'AI 위험 PoC 제작', 'AI 보안 텔레메트리 분석'] },
  { sourceKey: 'isoAi', roleId: 'catalog-ai-ml-security-engineer', level: 'strong', score: 89, reasons: ['표시 제목은 AI Safety지만 본문은 Senior AI Security Engineer로 설명한다.', 'AI 수명주기 위협 모델·통제·평가가 핵심 업무다.'], matchedResponsibilities: ['AI·ML 위협 모델링', '모델 자산 보호', 'ML 수명주기 보안 통제', 'AI 보안 사고 대응'] },

  // AI Security Architect: 기존 4건에 1건을 추가한다.
  { sourceKey: 'isoAi', roleId: 'catalog-ai-security-architect', level: 'strong', score: 89, reasons: ['공고 본문이 AI-first 플랫폼을 architect·secure하는 임무를 명시한다.', '모델·LLM·에이전트 신뢰경계와 통제 아키텍처 설계가 주요 업무다.'], matchedResponsibilities: ['AI 위험관리 아키텍처 설계', '모델 자산 보호 아키텍처', 'LLM·에이전트 가드레일 설계', '학습·추론 인프라 보안 통제 설계'] },

  // ML Platform Security Engineer: 기존 표본이 없어 5건을 추가한다.
  { sourceKey: 'scopelyAi', roleId: 'catalog-ml-platform-security-engineer', level: 'strong', score: 88, reasons: ['공고가 AI 플랫폼과 내부 에이전트 시스템의 프로덕션 보안을 전담한다.', '플랫폼 관측성·하드닝·자동화가 부수 업무가 아닌 핵심이다.'], matchedResponsibilities: ['AI 플랫폼 감사·추적 설계', 'AI 플랫폼 자동 수정 워크플로', 'AI 런타임 하드닝', 'AI 플랫폼 운영 준비 검증'] },
  { sourceKey: 'isoAi', roleId: 'catalog-ml-platform-security-engineer', level: 'strong', score: 89, reasons: ['대규모 ML 학습·추론 인프라 보안이 주요 책임에 명시되어 있다.', '모델 레지스트리에 해당하는 모델 자산 목록·보호와 ML 수명주기 통제를 수행한다.'], matchedResponsibilities: ['모델 가중치·코드·학습 데이터 목록과 보호', '학습 파이프라인 무결성', '추론 런타임 통제', '클라우드 학습 인프라 보안'] },
  { sourceKey: 'saronicAi', roleId: 'catalog-ml-platform-security-engineer', level: 'exact', score: 98, titleMatch: true, reasons: ['공고 제목이 Security Engineer, AI Platform Engineering이다.', '안전한 AI 플랫폼·호스팅·가드레일·가시성 구축이 역할의 중심이다.'], matchedResponsibilities: ['안전한 AI 플랫폼 구축', 'AI 사용 모니터링과 로깅', '모델·에이전트 접근 통제', 'AI 플랫폼 백엔드·인프라 보호'] },
  { sourceKey: 'anthropicOs', roleId: 'catalog-ml-platform-security-engineer', level: 'strong', score: 86, reasons: ['공고가 대규모 AI 모델 학습 인프라의 운영체제 계층을 보호한다.', 'AI 연구·학습 워크로드 격리와 무결성 통제가 핵심 업무다.'], matchedResponsibilities: ['AI 학습 워크로드 운영체제 강화', 'AI 연구 환경 보안 인프라', '워크로드 커널 격리', 'AI 플랫폼 무결성 모니터링'] },
  { sourceKey: 'anthropicHardware', roleId: 'catalog-ml-platform-security-engineer', level: 'strong', score: 85, reasons: ['대규모 AI 모델 학습용 베어메탈 플랫폼 보안이 주요 업무다.', '학습 인프라의 Secure Boot·증명·무결성·참조 아키텍처를 설계한다.'], matchedResponsibilities: ['AI 학습 인프라 보안 아키텍처', '플랫폼 Secure Boot 체인', '하드웨어 기반 플랫폼 증명', 'AI 인프라 무결성 모니터링'] },

  // GenAI·LLM Security Engineer: 기존 2건에 3건을 추가한다.
  { sourceKey: 'scopelyAi', roleId: 'catalog-llm-security-engineer', level: 'strong', score: 86, reasons: ['LLM 기반 내부 에이전트의 프롬프트·도구 텔레메트리와 런타임 보호가 명시되어 있다.', '입출력과 외부 연결부 위험을 보안 통제로 전환한다.'], matchedResponsibilities: ['프롬프트·도구 호출 텔레메트리', '위험한 MCP 사용 검토', 'LLM 런타임 보호', 'AI 시스템 외부 호출 보안 검토'] },
  { sourceKey: 'isoAi', roleId: 'catalog-llm-security-engineer', level: 'strong', score: 89, reasons: ['LLM 생태계 가드레일·샌드박스·실시간 모니터링이 주요 업무다.', '프롬프트 인젝션·모델 역전·데이터 포이즈닝 대응이 자격요건에 명시되어 있다.'], matchedResponsibilities: ['LLM 가드레일 설계', 'LLM 샌드박스 구축', 'LLM 실시간 모니터링', '프롬프트 인젝션과 모델 공격 대응'] },
  { sourceKey: 'openaiAgenticResearch', roleId: 'catalog-llm-security-engineer', level: 'strong', score: 84, reasons: ['공고는 고도화된 AI 에이전트와 모델 기반 내부 위협을 연구한다.', 'AI 스택의 보안 통제·평가·침투 테스트가 주요 업무다.'], matchedResponsibilities: ['AI 모델·에이전트 위협 경로 연구', 'AI 시스템 보안 통제 설계', 'AI 평가를 이용한 방어 검증', 'AI 보안 프로토타입 구축'] },

  // Agent Security Engineer: 기존 2건에 3건을 추가한다.
  { sourceKey: 'saronicAi', roleId: 'catalog-agent-security-engineer', level: 'strong', score: 89, reasons: ['AI 에이전트를 ID로 다루는 최소 권한과 접근 통제를 직접 설계한다.', '도구 호출·MCP·컨텍스트·메모리 보안이 핵심 업무다.'], matchedResponsibilities: ['에이전트 최소 권한 ID 설계', '모델·에이전트 접근 통제', 'MCP·도구 호출 보안', '에이전트 평가와 가드레일'] },
  { sourceKey: 'openaiOffensiveAgents', roleId: 'catalog-agent-security-engineer', level: 'strong', score: 88, reasons: ['공고가 Codex·Operator 등 에이전트 제품 보안을 전담한다.', '애플리케이션·인프라·도구·모델 사이 권한 경계를 시험하고 수정한다.'], matchedResponsibilities: ['에이전트 제품 권한 경계 평가', '에이전트 도구·모델 연결부 취약점 탐색', '에이전트 위협 모델 개선', '에이전트 보안 테스트 자동화'] },
  { sourceKey: 'cohereAgents', roleId: 'catalog-agent-security-engineer', level: 'exact', score: 98, titleMatch: true, reasons: ['공고 제목이 Security Agents로 대표 직무와 직접 대응한다.', '에이전트 보안 통제·인프라·시험이 주요 책임이다.'], matchedResponsibilities: ['에이전트 보안 통제 설계', '고신뢰 에이전트 인프라 구축', '에이전트 오케스트레이션 보안', '에이전트와 플랫폼 보안 테스트'] },

  // AI Product Security Engineer: 기존 2건에 3건을 추가한다.
  { sourceKey: 'scopelyAi', roleId: 'catalog-ai-product-security-engineer', level: 'strong', score: 87, reasons: ['AI 제품 변경과 프로덕션 준비 상태 보안 검토가 핵심 업무다.', '출시 후 런타임 통제와 사고 피드백을 제품에 반영한다.'], matchedResponsibilities: ['AI 애플리케이션 변경 보안 검토', 'AI 제품 런타임 하드닝', '롤백·킬 스위치 검증', 'AI 제품 사고 후 개선'] },
  { sourceKey: 'isoAi', roleId: 'catalog-ai-product-security-engineer', level: 'strong', score: 88, reasons: ['AI 제품·ML 수명주기의 설계 통제와 출시 운영 보안이 명시되어 있다.', '위협 모델·가드레일·사고 대응을 제품 조직과 구현한다.'], matchedResponsibilities: ['AI 제품 위협 모델링', 'LLM·에이전트 제품 가드레일', 'ML 수명주기 보안 통제', 'AI 제품 사고 대응'] },
  { sourceKey: 'openaiOffensiveAgents', roleId: 'catalog-ai-product-security-engineer', level: 'strong', score: 89, reasons: ['OpenAI 에이전트 제품의 출시 보안 평가와 수정이 전담 업무다.', '코드·아키텍처·악용 검증을 제품 엔지니어링과 수행한다.'], matchedResponsibilities: ['AI 제품 코드·아키텍처 검토', 'AI 제품 침투 테스트', '악용 가능성·영향 평가', '제품 수정 검증과 안전한 설계 개선'] },

  // AI Red Team Engineer: 기존 2건에 3건을 추가한다.
  { sourceKey: 'tenARed', roleId: 'catalog-ai-red-team-engineer', level: 'exact', score: 98, titleMatch: true, reasons: ['공고 제목이 AI Red Teamer다.', 'LLM 적대적 테스트·탈옥·실패 분류·취약점 보고가 전담 업무다.'], matchedResponsibilities: ['LLM 적대적 테스트', '탈옥·공격 체인 제작', '모델 실패 분류', 'AI 취약점 보고서 작성'] },
  { sourceKey: 'anthropicRed', roleId: 'catalog-ai-red-team-engineer', level: 'exact', score: 98, titleMatch: true, reasons: ['공고 제목이 Red Team Engineer, Safeguards다.', 'AI 제품의 적대적 평가와 자동 테스트 프레임워크가 핵심 업무다.'], matchedResponsibilities: ['AI 제품 적대적 테스트', '에이전트·도구 사용 공격 연구', '전체 공격 체인 시뮬레이션', 'AI 레드팀 자동화'] },
  { sourceKey: 'anthropicFrontierRed', roleId: 'catalog-ai-red-team-engineer', level: 'exact', score: 96, titleMatch: true, reasons: ['공고 제목이 Frontier Red Team (Cyber) 연구 엔지니어다.', '자율 AI 공격·방어 실험과 퍼플팀 평가가 역할의 중심이다.'], matchedResponsibilities: ['자율 AI 사이버 능력 평가', 'AI 공격자·방어자 퍼플팀 시뮬레이션', '현실적 AI 보안 실험', 'AI 보안 평가 인프라 구축'] },

  { sourceKey: 'googleAgenticRed', roleId: 'catalog-ai-red-team-engineer', level: 'exact', score: 99, titleMatch: true, reasons: ['공고 제목이 Senior Security Engineer, Agentic Red Team으로 직접 대응한다.', '생성형 AI·에이전트 공격 시퀀스와 자동 레드팀 회귀 테스트가 전담 업무다.'], matchedResponsibilities: ['에이전트 서비스 보안 평가', 'AI 공격 시퀀스 설계·실행', '자동 레드팀 회귀 테스트', '공격 패턴·익스플로잇 라이브러리 확장'] },

  // Vulnerability Researcher: 기존 2건에 3건을 추가한다.
  { sourceKey: 'twoSixVr', roleId: 'catalog-rnd-vulnerability-researcher', level: 'exact', score: 98, titleMatch: true, reasons: ['공고 제목이 Vulnerability Researcher다.', '임베디드 취약점 발견·PoC·문서화가 전담 업무다.'], matchedResponsibilities: ['임베디드 공격 표면 리버싱', '정적·동적 취약점 발견', '취약점 PoC 개발', '연구 결과 문서화'] },
  { sourceKey: 'twoSixLeadVr', roleId: 'catalog-rnd-vulnerability-researcher', level: 'exact', score: 98, titleMatch: true, reasons: ['공고 제목이 Lead Vulnerability Researcher다.', '복잡한 임베디드·무선 취약점 연구와 방법론 개발을 주도한다.'], matchedResponsibilities: ['대규모 취약점 연구 주도', '임베디드·무선 연구 전략', '취약점 연구 도구·자동화', '연구 결과 발표'] },
  { sourceKey: 'm9Vr', roleId: 'catalog-rnd-vulnerability-researcher', level: 'exact', score: 99, titleMatch: true, reasons: ['공고 제목이 Senior Vulnerability Researcher다.', 'Windows 커널·드라이버 취약점 발견부터 PoC까지 전담한다.'], matchedResponsibilities: ['Windows 취약점 연구', '커널·드라이버 리버싱', '취약점 PoC 검증', '새 취약점 발견 기법 프로토타입'] },

  // Exploit Developer: 기존 1건에 4건을 추가한다.
  { sourceKey: 'm9Vr', roleId: 'catalog-exploit-developer', level: 'strong', score: 89, reasons: ['직무명은 취약점 연구자지만 PoC와 악용 경로 개발이 주요 책임이다.', '현대 Windows 완화 환경의 실제 취약점 악용 역량을 요구한다.'], matchedResponsibilities: ['Windows 취약점 악용 경로 개발', 'PoC 코드 작성', '완화 환경 익스플로잇 기법 프로토타입', '익스플로잇 결과 문서화'] },
  { sourceKey: 'twoSixEmbeddedResearch', roleId: 'catalog-exploit-developer', level: 'strong', score: 89, reasons: ['공고 본문이 발견 취약점의 PoC 익스플로잇 개발을 주요 업무로 명시한다.', '펌웨어·무선 표적의 분석부터 유지 가능한 공격 코드까지 수행한다.'], matchedResponsibilities: ['취약점 PoC 익스플로잇 개발', '펌웨어 보호 분석', '퍼징·익스플로잇 개발', '바이너리 분석·조작 도구 개발'] },
  { sourceKey: 'twoSixSeniorPrincipal', roleId: 'catalog-exploit-developer', level: 'strong', score: 88, reasons: ['PoC 익스플로잇으로 보안 영향을 증명하는 업무가 명시되어 있다.', '저수준 프로그래밍·리호스팅·퍼징 하네스를 이용해 공격 가능성을 검증한다.'], matchedResponsibilities: ['PoC 익스플로잇 개발', '공격 표면 분류', '취약점 영향 검증', '저수준 연구 도구 개발'] },
  { sourceKey: 'twoSixCyberLead', roleId: 'catalog-exploit-developer', level: 'strong', score: 87, reasons: ['사이버보안 연구 직무지만 확인된 취약점의 PoC 코드 개발이 주요 책임이다.', '임베디드 리버싱·공격 영향 분석·대응책 검증까지 연결한다.'], matchedResponsibilities: ['취약점 PoC 코드 개발', '임베디드 표적 리버싱', '공격 기법 비교·검증', '취약점 임무 영향 분석'] },

  // Security Researcher: 기존 1건에 4건을 추가한다.
  { sourceKey: 'elasticAi', roleId: 'catalog-security-researcher', level: 'strong', score: 89, reasons: ['공고 제목과 본문이 AI 보안 연구 엔지니어 역할이다.', '새 공격 방법 연구·탐지 전환·결과 발표가 주요 책임이다.'], matchedResponsibilities: ['새 공격 방법 연구', '보안 동향·위협 인텔리전스 조사', '연구 결과 탐지 전환', '연구 결과 발표'] },
  { sourceKey: 'wizApplied', roleId: 'catalog-security-researcher', level: 'exact', score: 96, titleMatch: true, reasons: ['공고 제목이 Applied Security Researcher다.', '새 공격면 연구에서 PoC와 제품 통합까지 전담한다.'], matchedResponsibilities: ['코드·클라우드·AI 공격면 연구', '위험·공격 벡터 모델링', '보안 PoC 구현', '연구 결과 제품 통합'] },
  { sourceKey: 'openaiAgenticResearch', roleId: 'catalog-security-researcher', level: 'exact', score: 97, titleMatch: true, reasons: ['공고 제목이 Security Researcher다.', '새로운 에이전트 위협 경로·통제·평가 방법 연구가 전담 업무다.'], matchedResponsibilities: ['새 AI 에이전트 공격면 연구', '보안 통제 연구', '방어 스트레스 테스트', '보안 프로토타입 개발'] },
  { sourceKey: 'twoSixCyberLead', roleId: 'catalog-security-researcher', level: 'exact', score: 96, titleMatch: true, reasons: ['공고 제목이 Lead Cybersecurity Researcher다.', '하드웨어·소프트웨어 공격 연구와 PoC·대응책 개발이 핵심이다.'], matchedResponsibilities: ['복합 시스템 공격면 연구', '취약점 PoC 개발', '운영 영향 연구', '대응책 설계'] },

  // Systems Security Researcher: 기존 1건에 4건을 추가한다.
  { sourceKey: 'twoSixCyberLead', roleId: 'catalog-systems-security-researcher', level: 'strong', score: 88, reasons: ['하드웨어·소프트웨어·운영 시스템의 보안 연구가 주 업무다.', '임베디드 시스템 권한·통신 경계를 리버싱하고 공격 영향을 검증한다.'], matchedResponsibilities: ['임베디드 시스템 보안 연구', '하드웨어·소프트웨어 공격 경계 분석', '시스템 취약점 PoC', '운영 영향과 대응책 연구'] },
  { sourceKey: 'twoSixCyberPrincipal', roleId: 'catalog-systems-security-researcher', level: 'strong', score: 88, reasons: ['복합 시스템의 취약점·공격·운영 영향을 연구하는 직무다.', '임베디드 리버싱과 시스템 대응책 설계가 주요 업무다.'], matchedResponsibilities: ['복합 시스템 취약점 연구', '임베디드 시스템 리버싱', '시스템 공격 영향 분석', '시스템 대응책 설계'] },
  { sourceKey: 'twoSixEmbeddedResearch', roleId: 'catalog-systems-security-researcher', level: 'strong', score: 87, reasons: ['운영체제·펌웨어·무선 프로토콜의 저수준 보안 연구가 역할의 중심이다.', '실제 시스템 리버싱·PoC·분석 도구 개발을 수행한다.'], matchedResponsibilities: ['임베디드 운영체제·펌웨어 연구', '무선 프로토콜 보안 분석', '시스템 취약점 PoC', '바이너리 분석 도구 개발'] },
  { sourceKey: 'twoSixSeniorPrincipal', roleId: 'catalog-systems-security-researcher', level: 'strong', score: 89, reasons: ['저수준 시스템 리버싱·취약점 연구 프로그램을 주도한다.', '임베디드 운영체제와 신뢰 컴퓨팅·완화 기법 연구가 명시되어 있다.'], matchedResponsibilities: ['저수준 시스템 보안 연구', '임베디드 운영체제 리버싱', '시스템 공격 표면 연구', '보안 완화·PoC 검증'] },

  // Malware Researcher: 기존 1건에 4건을 추가한다.
  { sourceKey: 'wizMalUs', roleId: 'catalog-malware-researcher', level: 'strong', score: 87, reasons: ['직무명은 위협 탐지 연구자지만 악성코드 조사와 실제 공격 분석이 주요 업무다.', '연구를 탐지 도구와 제품 기능으로 전환한다.'], matchedResponsibilities: ['클라우드·AI 악성코드 조사', '실제 공격 사냥·분석', '악성코드 기반 탐지 개발', '악성코드 연구 결과 발표'] },
  { sourceKey: 'wizMalIl', roleId: 'catalog-malware-researcher', level: 'strong', score: 87, reasons: ['별도 Tel Aviv 포지션으로 악성코드·공격 분석이 주요 업무다.', '운영체제 내부 구조와 Python을 이용해 연구를 제품 탐지로 전환한다.'], matchedResponsibilities: ['악성코드 조사', '실제 공격 분석', '악성코드 탐지 도구 개발', '연구 결과 제품 전환'] },
  { sourceKey: 'anthropicThreatIntel', roleId: 'catalog-malware-researcher', level: 'strong', score: 88, reasons: ['CTI 직무지만 악성코드·피싱 인프라·공격자 도구 기술 분석을 직접 수행한다.', '분석을 자동 파이프라인·YARA·Sigma 탐지로 전환한다.'], matchedResponsibilities: ['악성코드 기술 분석', '공격자 도구·인프라 분석', '악성코드 IOC 자동 보강', 'YARA·Sigma 탐지 개발'] },
  { sourceKey: 'saronicThreatIntel', roleId: 'catalog-malware-researcher', level: 'strong', score: 84, reasons: ['위협 인텔리전스 공고지만 악성코드 분류와 분석 자동화가 주요 책임에 포함된다.', '분석 결과를 YARA 탐지·위협 사냥·귀속 신호로 전환한다.'], matchedResponsibilities: ['악성코드 분류', '악성코드 인프라 피벗', 'YARA 탐지 작성', '악성코드 분석 자동화'] },

  // Security Research Engineer: 기존 표본이 없어 5건을 추가한다.
  { sourceKey: 'elasticAi', roleId: 'catalog-security-research-engineer', level: 'exact', score: 97, titleMatch: true, reasons: ['공고 제목이 Security Research Engineer다.', '보안 연구·AI 워크플로·탐지 기능 구현이 함께 요구된다.'], matchedResponsibilities: ['AI 보안 연구', '연구 워크플로 구현', '탐지 기능 개발', '연구 결과 발표'] },
  { sourceKey: 'elasticMac', roleId: 'catalog-security-research-engineer', level: 'exact', score: 97, titleMatch: true, reasons: ['공고 제목이 Senior Security Research Engineer다.', '위협 시나리오 연구를 탐지 규칙·텔레메트리·콘텐츠로 구현한다.'], matchedResponsibilities: ['엔드포인트·컨테이너 보안 연구', '위협 시나리오 에뮬레이션', '탐지 규칙 구현', '연구 콘텐츠 발행'] },
  { sourceKey: 'elasticMl', roleId: 'catalog-security-research-engineer', level: 'exact', score: 98, titleMatch: true, reasons: ['공고 제목이 Principal Security ML Research Engineer다.', '보안 ML 연구·프로토타입·평가·제품 연계가 핵심이다.'], matchedResponsibilities: ['보안 ML 아키텍처 연구', 'AI 에이전트 워크플로 프로토타입', '모델 견고성 평가', '보안 연구 백서 작성'] },
  { sourceKey: 'anthropicCyberRl', roleId: 'catalog-security-research-engineer', level: 'exact', score: 98, titleMatch: true, reasons: ['공고 제목이 Research Engineer, Cybersecurity RL이다.', '사이버보안 연구를 RL 환경·실험·프로덕션 학습 코드로 구현한다.'], matchedResponsibilities: ['사이버보안 RL 연구', '보안 RL 환경 구현', '보안 모델 실험·평가', '프로덕션 학습 코드 적용'] },
  { sourceKey: 'anthropicFrontierRed', roleId: 'catalog-security-research-engineer', level: 'exact', score: 97, titleMatch: true, reasons: ['공고 제목이 Research Engineer / Scientist, Frontier Red Team (Cyber)다.', '공격자 행위 연구를 시스템·도구·평가 인프라로 구현한다.'], matchedResponsibilities: ['자율 취약점 연구 도구 개발', 'AI 보안 평가 인프라', '사이버 실험 구현', '보안 연구 시연 제작'] },

  // Fuzzing Engineer·Researcher: 기존 표본이 없어 5건을 추가한다.
  { sourceKey: 'armFuzz', roleId: 'catalog-fuzzing-researcher', level: 'exact', score: 100, titleMatch: true, reasons: ['공고 제목이 Fuzzing Specialist이며 커버리지 기반 퍼징 프로그램을 전담한다.', '하네스·코퍼스·변이·크래시 분류·Sanitizer가 모두 핵심 업무다.'], matchedResponsibilities: ['퍼징 하네스 개발', '코퍼스·변이 전략 개발', '크래시 분류·근본 원인 분석', '커버리지와 Sanitizer 개선'] },
  { sourceKey: 'kbrFuzz', roleId: 'catalog-fuzzing-researcher', level: 'strong', score: 89, reasons: ['직무명은 취약점 연구자지만 퍼징 워크플로·하네스·크래시 분류가 주요 업무다.', '에뮬레이션 기반 반복 실행과 재현 가능한 결과를 만든다.'], matchedResponsibilities: ['퍼징 워크플로 개발', '퍼징 하네스 개발', '크래시 분류', '근본 원인 분석'] },
  { sourceKey: 'nightwingFuzz', roleId: 'catalog-fuzzing-researcher', level: 'strong', score: 87, reasons: ['제로데이 연구에 퍼저 작성·사용과 디버깅을 핵심 역량으로 요구한다.', '퍼징을 이용한 동작 분석·취약점 발견·연구 기법 개발이 주 업무다.'], matchedResponsibilities: ['퍼저 작성·운영', '퍼징 기반 제로데이 발견', '크래시·프로그램 동작 디버깅', '새 퍼징·취약점 연구 기법 개발'] },
  { sourceKey: 'srlabsFuzz', roleId: 'catalog-fuzzing-researcher', level: 'strong', score: 88, reasons: ['사내 퍼징 프레임워크를 개발·유지하고 실제 감사에 확장 적용한다.', '정적·동적 분석 파이프라인과 CI 통합 자동화가 주요 업무다.'], matchedResponsibilities: ['사내 퍼징 프레임워크 개발', '퍼징 기반 코드 감사', '정적·동적 분석 파이프라인', '퍼징·CI 도구 자동화'] },
  { sourceKey: 'amazonFuzz', roleId: 'catalog-fuzzing-researcher', level: 'strong', score: 82, reasons: ['SoC·디바이스 보안 테스트와 퍼징이 주요 업무 목록에 직접 포함된다.', '테스트 도구 연구·위험 식별·완화 검증을 제품 조직과 수행한다.'], matchedResponsibilities: ['디바이스·펌웨어 퍼징', '보안 테스트 도구 연구·개발', '퍼징 기반 위험 식별', '발견 이슈 완화 검증'] },
]

export const domainEnrichedPostings = Object.freeze(mappings.map(posting))

const executedQueries = Object.freeze({
  'catalog-ai-ml-security-engineer': ['"AI Security Engineer" official careers', 'site:job-boards.greenhouse.io "AI Security Researcher"'],
  'catalog-ai-security-architect': ['"AI Security Architect" official careers', '"architect secure AI-first platform" security job'],
  'catalog-ml-platform-security-engineer': ['"ML Platform Security Engineer" careers', '"Security Engineer, AI Platform Engineering"', 'AI training infrastructure platform security jobs'],
  'catalog-llm-security-engineer': ['"LLM Security Engineer" careers', 'LLM guardrails sandbox monitoring security job'],
  'catalog-agent-security-engineer': ['"Agent Security Engineer" careers', '"Security Agents" engineer jobs', 'agent tool use MCP security jobs'],
  'catalog-ai-product-security-engineer': ['"AI Product Security Engineer" careers', 'agent products offensive security careers'],
  'catalog-ai-red-team-engineer': ['"AI Red Teamer" official careers', '"Frontier Red Team" cyber jobs', 'site:job-boards.greenhouse.io AI red team'],
  'catalog-rnd-vulnerability-researcher': ['"Vulnerability Researcher" official careers', 'site:job-boards.greenhouse.io vulnerability researcher reverse PoC'],
  'catalog-exploit-developer': ['"Exploit Developer" official careers', '"exploit development" "Vulnerability Researcher" careers', 'site:job-boards.greenhouse.io PoC exploit vulnerability researcher'],
  'catalog-security-researcher': ['"Security Researcher" official careers', 'site:job-boards.greenhouse.io "Applied Security Researcher"'],
  'catalog-systems-security-researcher': ['"Systems Security Researcher" careers', 'embedded systems cybersecurity researcher vulnerability research'],
  'catalog-malware-researcher': ['"Malware Researcher" official careers', 'threat detection researcher malware analysis careers', 'site:job-boards.greenhouse.io malware research'],
  'catalog-security-research-engineer': ['"Security Research Engineer" official careers', 'site:job-boards.greenhouse.io security research engineer'],
  'catalog-fuzzing-researcher': ['"Fuzzing Engineer" careers', '"Fuzzing Specialist" security job', '"fuzzing harness" "crash triage" careers', 'site:myworkdayjobs.com vulnerability researcher fuzzing'],
})

export const domainRoleResearch = Object.freeze(roleResearchTargets
  .filter((target) => scopeDomainIds.has(target.domainId))
  .map((target) => Object.freeze({
    roleId: target.roleId,
    targetCount: 5,
    searchedQueries: Object.freeze(executedQueries[target.roleId] || []),
    rejectedCandidates: Object.freeze([]),
    rejectedCandidateCount: 0,
    shortageReasons: Object.freeze([]),
  })))
