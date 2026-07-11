const completenessFields = [
  'companyName', 'jobTitle', 'responsibilities', 'requirements', 'preferredQualifications',
  'tools', 'lawsAndStandards', 'careerLevel', 'workLocation', 'postingUrl',
]

function filled(value) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value)
}

export function calculateContentCompletenessScore(posting) {
  const raw = posting.raw || {}
  const normalized = posting.normalized || {}
  const source = posting.source || {}
  const valueFor = {
    companyName: raw.companyName,
    jobTitle: raw.jobTitle,
    responsibilities: raw.responsibilities,
    requirements: raw.requirements,
    preferredQualifications: raw.preferredQualifications,
    tools: normalized.tools,
    lawsAndStandards: normalized.lawsAndStandards,
    careerLevel: normalized.careerLevel && normalized.careerLevel !== 'unknown',
    workLocation: raw.workLocation,
    postingUrl: source.postingUrl,
  }
  return Number((completenessFields.filter((key) => filled(valueFor[key])).length / completenessFields.length).toFixed(2))
}

function posting({ id, companyName, jobTitle, industryId, careerLevel = 'unknown', experience = '', workLocation = '', employmentType = '', responsibilities = [], requirements = [], preferredQualifications = [], roleMappings = [], competencies = [], tools = [], platforms = [], protocols = [], frameworks = [], lawsAndStandards = [], deliverables = [], partnerTeams = [], contentCompleteness = 'detailed', notes = '', fieldEvidence = {} }) {
  const item = {
    id,
    raw: { companyName, jobTitle, workLocation, employmentType, experience, responsibilities, requirements, preferredQualifications },
    normalized: { industryId, careerLevel, requiredYearsMin: null, requiredYearsMax: null, roleMappings, competencies, tools, platforms, protocols, frameworks, lawsAndStandards, deliverables, partnerTeams },
    source: { sourceType: 'individualVacancy', pageSystem: 'unknown', postingUrl: null, applyUrl: null, checkedDate: null, isCurrent: null, archivedAsset: null },
    evidence: { bodyVerified: true, contentCompleteness, contentCompletenessScore: 0, notes, fieldEvidence },
  }
  item.evidence.contentCompletenessScore = calculateContentCompletenessScore(item)
  return item
}

const direct = { evidenceType: 'direct' }
const inferred = { evidenceType: 'inferred' }

export const jobMarketResearchSummary = Object.freeze({
  sampleLabel: '실제 공개 채용공고 1차 표본',
  sampleSize: 21,
  domesticCount: 10,
  internationalCount: 11,
  detailedSeedCount: 13,
  partialSeedCount: 8,
  caveat: '실제 공개 채용공고 21건을 분석한 1차 표본입니다. 아래 빈도와 경향은 전체 채용시장의 공식 통계가 아닙니다.',
  competencyFrequency: [
    { id: 'communication-documentation', label: '협업·문서화·커뮤니케이션', count: 12, description: '정책, 보고서, 플레이북, 위협 모델, 감사 결과처럼 검토 가능한 산출물을 남기는 역량입니다.' },
    { id: 'grc-privacy-compliance', label: '거버넌스·개인정보·컴플라이언스', count: 9, description: '규정, 개인정보, 통제, 감사 증적을 실제 서비스와 운영 절차에 연결합니다.' },
    { id: 'soc-detection-ir', label: '관제·탐지·침해대응', count: 7, description: '경보 판별, 에스컬레이션, 초동대응, 플레이북, 사고 분석으로 이어집니다.' },
    { id: 'programming-automation', label: '프로그래밍·스크립트', count: 7, description: '분석, 통합, 운영 자동화의 수단으로 Python, PowerShell, Java, Go 등이 등장합니다.' },
    { id: 'cloud-infrastructure', label: '클라우드·인프라', count: 6, description: 'IAM, CSPM·CWPP, Kubernetes, 클라우드 모니터링과 연결됩니다.' },
    { id: 'offensive-assessment', label: 'Offensive·취약점진단', count: 4, description: 'AppSec, 모의해킹, 위협 모델링, AI Red Team처럼 역할이 나뉘어 등장합니다.' },
    { id: 'network-system', label: '네트워크·시스템', count: 4, description: '방화벽, IPS, WAF, DNS, 하드닝 같은 운영 기반으로 연결됩니다.' },
    { id: 'reverse-forensics-research', label: '리버싱·포렌식 연구', count: 3, description: '모바일 포렌식, 리버싱, 탐지 연구, PoC 개발에 연결됩니다.' },
    { id: 'crypto-pki', label: '암호·PKI', count: 1, description: '인증서, HSM, 키 관리, PQC 준비처럼 전문성이 높은 영역으로 등장합니다.' },
  ],
  industryInsights: [
    { id: 'finance', title: '금융·핀테크', body: '규제, 내부통제, 개인정보, 서비스 보안 검토, AWS·IAM·WAF가 함께 등장합니다.' },
    { id: 'saas', title: '플랫폼·SaaS', body: '제품 보안 리뷰, 위협 모델링, 공급망 통제, 자동화와 개발 조직 협업이 강하게 나타납니다.' },
    { id: 'ot', title: 'OT·제조·자동차', body: '물리 자산, 세그멘테이션, 하드닝, 산업 표준과 안전 제약을 함께 다룹니다.' },
    { id: 'services', title: '보안 서비스·컨설팅', body: '고객 커뮤니케이션, 인증·진단 프로젝트, 증거 보존, 사후 보고서가 중요한 산출물입니다.' },
  ],
})

export const detailedJobPostingSeeds = Object.freeze([
  posting({
    id: 'line-pay-information-security', companyName: 'LINE Pay Plus', jobTitle: '정보보안 담당자', industryId: 'finance', careerLevel: 'senior',
    responsibilities: ['정보보호 관리체계 수립', '규제 준수', '서비스 보안 검토'], requirements: ['리스크 식별', '정책 수립·운영'],
    roleMappings: [{ roleId: 'role-grc-operations', weight: 1, basis: 'responsibility', confidence: 'high' }, { roleId: 'role-security-planning', weight: 0.8, basis: 'responsibility', confidence: 'high' }],
    competencies: ['grc-privacy-compliance', 'communication-documentation'], deliverables: ['보안 정책', '리스크 통제', '서비스 보안 검토 결과'], partnerTeams: ['개발', '기획', '법무'],
    fieldEvidence: { responsibilities: direct, requirements: direct, deliverables: inferred, partnerTeams: direct, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'easysec-isms-consulting', companyName: '이지시큐', jobTitle: 'ISMS 정보보호 컨설팅', industryId: 'services', careerLevel: 'unknown',
    responsibilities: ['ISMS-P·ISMS·ISO 27001 관리 컨설팅', '개인정보 컨설팅', 'PM·PL 수행'], requirements: ['인증 컨설팅 수행 능력'],
    roleMappings: [{ roleId: 'role-isms-consultant', weight: 1, basis: 'responsibility', confidence: 'high' }, { roleId: 'role-privacy-consultant', weight: 0.7, basis: 'responsibility', confidence: 'medium' }],
    competencies: ['grc-privacy-compliance', 'communication-documentation'], lawsAndStandards: ['ISMS-P', 'ISMS', 'ISO 27001'], deliverables: ['인증 대응 문서', '개선 과제', '프로젝트 산출물'],
    fieldEvidence: { responsibilities: direct, requirements: direct, deliverables: inferred, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'toss-it-security-audit', companyName: '비바리퍼블리카(토스)', jobTitle: '내부감사 담당자 IT/보안', industryId: 'finance', careerLevel: 'senior', experience: '내부통제 관련 5년 이상',
    responsibilities: ['감사계획 수립', 'IT 시스템 개발·운영·데이터 처리 리스크 식별', '정보보호 관리체계와 IT 인프라 감사', '이상징후 상시 모니터링 체계 구축'],
    requirements: ['전자금융거래법 이해', '신용정보법 이해', '개인정보보호법 이해'], preferredQualifications: ['ITGC', 'CIA', 'CISA'],
    roleMappings: [{ roleId: 'role-it-security-audit', weight: 1, basis: 'responsibility', confidence: 'high' }, { roleId: 'role-risk-internal-control', weight: 0.9, basis: 'responsibility', confidence: 'high' }],
    competencies: ['grc-privacy-compliance', 'communication-documentation'], lawsAndStandards: ['전자금융거래법', '신용정보법', '개인정보보호법', 'ITGC'], deliverables: ['감사계획', '감사 결과', '모니터링 체계'],
    fieldEvidence: { responsibilities: direct, requirements: direct, preferredQualifications: direct, deliverables: inferred, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'travelwallet-cloud-security', companyName: '트래블월렛', jobTitle: '클라우드 보안 엔지니어', industryId: 'finance', careerLevel: 'senior', experience: '5년 이상',
    responsibilities: ['AWS 보안 아키텍처 설계·운영', 'IAM·Network·Compute·Storage 정책', '모니터링·탐지 자동화', 'CSPM·CWPP 운영', '취약점 개선'],
    requirements: ['AWS 설계·운영', 'IAM·VPC·Security Group·WAF', 'Linux·Unix 기초'],
    roleMappings: [{ roleId: 'role-cloud-security-architect', weight: 1, basis: 'responsibility', confidence: 'high' }, { roleId: 'role-cloud-infrastructure-security', weight: 0.9, basis: 'responsibility', confidence: 'high' }, { roleId: 'role-cspm-cnapp', weight: 0.8, basis: 'responsibility', confidence: 'high' }, { roleId: 'role-cloud-detection', weight: 0.8, basis: 'responsibility', confidence: 'high' }],
    competencies: ['cloud-infrastructure', 'programming-automation'], tools: ['WAF', 'CSPM', 'CWPP'], platforms: ['AWS'], deliverables: ['아키텍처 설계안', '모니터링 체계', '취약점 개선 결과'], partnerTeams: ['DevOps', '개발 조직'],
    fieldEvidence: { responsibilities: direct, requirements: direct, deliverables: inferred, partnerTeams: direct, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'coupang-tier2-soc', companyName: '쿠팡', jobTitle: 'Tier2 SOC Analyst', industryId: 'ecommerce', careerLevel: 'senior', experience: '보안관제·사고대응 5년 이상',
    responsibilities: ['24x7 선임 분석', '정오탐 판별', '초동 대응', 'Tier1·Tier3 에스컬레이션', 'Playbook 지원', '초급 분석가 교육'],
    requirements: ['AWS·Azure·GCP 이해', '클라우드 기반 사고 대응', '호스트 기반 분석', 'EDR', 'SIEM·대용량 로그 분석'],
    roleMappings: [{ roleId: 'role-soc-tier2', weight: 1, basis: 'title', confidence: 'high' }, { roleId: 'role-cloud-detection', weight: 0.8, basis: 'requirement', confidence: 'high' }, { roleId: 'role-incident-response', weight: 0.7, basis: 'responsibility', confidence: 'high' }],
    competencies: ['soc-detection-ir', 'cloud-infrastructure'], tools: ['EDR', 'SIEM'], platforms: ['AWS', 'Azure', 'GCP'], deliverables: ['탐지 룰 검증 결과', 'Playbook', '관제 보고서'], partnerTeams: ['DART', 'CSOC Manager', '거버넌스 팀'],
    fieldEvidence: { responsibilities: direct, requirements: direct, deliverables: inferred, partnerTeams: direct, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'autocrypt-automotive-research', companyName: '아우토크립트', jobTitle: '자동차 취약점 연구·모의해킹', industryId: 'automotive', careerLevel: 'entry',
    responsibilities: ['모의해킹', 'Zero-day 발굴·분석', '차량 시스템 진단 방법 연구', '자동 진단 도구 R&D'], requirements: ['보안·해킹 기본 지식'], preferredQualifications: ['CTF·Wargame 경험', '신규 취약점 발견 경험'],
    roleMappings: [{ roleId: 'role-automotive-vulnerability-researcher', weight: 1, basis: 'title', confidence: 'high' }, { roleId: 'role-security-rnd', weight: 0.8, basis: 'responsibility', confidence: 'high' }],
    competencies: ['offensive-assessment', 'reverse-forensics-research'], deliverables: ['진단 방법론', 'PoC', '자동화 도구'],
    fieldEvidence: { responsibilities: direct, requirements: direct, preferredQualifications: direct, deliverables: inferred, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'palantir-appsec', companyName: 'Palantir', jobTitle: 'Application Security Engineer', industryId: 'saas', careerLevel: 'unknown', workLocation: 'London', employmentType: 'Full-time · Hybrid',
    responsibilities: ['제품 보안 리뷰', '위협 모델링', '아키텍처 리뷰', '자동화', '취약점 식별·분석'], requirements: ['소프트웨어 엔지니어링 경험', '취약점 코드 리뷰', '복잡한 아키텍처 이해', 'CodeQL 등 정적 분석', '웹 애플리케이션 Black-box 테스트'],
    roleMappings: [{ roleId: 'role-appsec-engineer', weight: 1, basis: 'title', confidence: 'high' }, { roleId: 'role-threat-modeling', weight: 0.9, basis: 'responsibility', confidence: 'high' }],
    competencies: ['offensive-assessment', 'programming-automation', 'communication-documentation'], tools: ['CodeQL'], platforms: ['Java', 'Go', 'JavaScript', 'Python'], deliverables: ['위협 모델', '보안 리뷰 결과', '자동화 도구'], partnerTeams: ['Engineering', 'Offensive Security', 'InfoSec'],
    fieldEvidence: { responsibilities: direct, requirements: direct, deliverables: inferred, partnerTeams: direct, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'vanguard-supply-chain', companyName: 'Vanguard', jobTitle: 'Software Supply Chain Security Specialist', industryId: 'finance', careerLevel: 'senior', experience: '최소 5년·실무 7~10년 이상 수준',
    responsibilities: ['공급망 보안 전략', 'SBOM', 'artifact signing', 'provenance', 'SDLC·CI/CD·registry 통제', 'SCA·container scan', '위험 지표'], requirements: ['AppSec·DevSecOps·Platform Security 배경', 'SCA·Pipeline Security', 'Python·Java·YAML'], preferredQualifications: ['CISSP', 'CSSLP'],
    roleMappings: [{ roleId: 'role-supply-chain-security', weight: 1, basis: 'title', confidence: 'high' }, { roleId: 'role-devsecops', weight: 0.9, basis: 'responsibility', confidence: 'high' }],
    competencies: ['programming-automation', 'cloud-infrastructure'], tools: ['SCA', 'container scan', 'SBOM'], platforms: ['CI/CD', 'registry'], deliverables: ['SBOM 정책', 'Artifact 무결성 통제', '공급망 위험 지표'], partnerTeams: ['AppSec', 'DevSecOps', 'Platform teams'],
    fieldEvidence: { responsibilities: direct, requirements: direct, preferredQualifications: direct, deliverables: inferred, partnerTeams: direct, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'accenture-ir', companyName: 'Accenture Federal Services', jobTitle: 'Incident Response Engineer', industryId: 'public', careerLevel: 'mid', experience: '4년 이상', workLocation: 'Arlington, VA',
    responsibilities: ['보안 사고 대응', '위협 조사', '디지털 포렌식', '악성코드 분석', '디지털 증거 보존', 'Playbook 개선', 'Threat Hunting', 'SIEM 운영'], requirements: ['IR·DFIR·조사 4년', '관련 학사 또는 DoD 8140 자격', '보안 Clearance'],
    roleMappings: [{ roleId: 'role-incident-response', weight: 1, basis: 'title', confidence: 'high' }, { roleId: 'role-dfir-investigator', weight: 0.9, basis: 'responsibility', confidence: 'high' }, { roleId: 'role-threat-hunter', weight: 0.8, basis: 'responsibility', confidence: 'high' }],
    competencies: ['soc-detection-ir', 'reverse-forensics-research', 'communication-documentation'], tools: ['SIEM'], frameworks: ['DoD 8140'], deliverables: ['Playbook', '사후 분석 보고서', '대응 Metric'],
    fieldEvidence: { responsibilities: direct, requirements: direct, deliverables: inferred, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'comcast-cryptography', companyName: 'Comcast', jobTitle: 'Cryptography Cyber Security Engineer', industryId: 'telecom', careerLevel: 'mid', experience: '2~5년',
    responsibilities: ['PKI 운영', '인증서 수명주기 자동화', 'xPKI 온보딩', 'KMS 지원', 'PQC 준비', 'Thales HSM 지원'], requirements: ['PKI', 'ACME', 'REST API', 'CA Administration', 'ADCS', 'SSH·SSL·TLS', 'KMS'],
    roleMappings: [{ roleId: 'role-pki-engineer', weight: 1, basis: 'title', confidence: 'high' }, { roleId: 'role-hsm-kms', weight: 0.8, basis: 'responsibility', confidence: 'high' }, { roleId: 'role-pqc-readiness', weight: 0.7, basis: 'responsibility', confidence: 'high' }],
    competencies: ['crypto-pki', 'programming-automation'], tools: ['Thales HSM', 'ADCS', 'KMS'], protocols: ['ACME', 'REST API', 'SSH', 'SSL', 'TLS'], lawsAndStandards: ['NIST', 'ISO 27001'], deliverables: ['인증서 인벤토리', 'Metric', '자동화 프로세스'],
    fieldEvidence: { responsibilities: direct, requirements: direct, deliverables: inferred, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'liebherr-iam', companyName: 'Liebherr', jobTitle: 'Identity & Access Management Security Engineer', industryId: 'manufacturing', careerLevel: 'mid', experience: '3년 이상', workLocation: 'Madrid', employmentType: 'Full-time · Hybrid',
    responsibilities: ['RBAC', 'MFA', 'SSO', 'PAM', 'IAM 정책·절차·가이드라인 정렬', 'IAM 보안 사고 대응', 'IAM 보안성 평가'], requirements: ['SAML·Kerberos·OAuth·LDAP·RADIUS', 'Python·PowerShell', 'IAM 플랫폼'], preferredQualifications: ['CISSP', 'CISM'],
    roleMappings: [{ roleId: 'role-iam-engineer', weight: 1, basis: 'title', confidence: 'high' }, { roleId: 'role-enterprise-access', weight: 0.8, basis: 'responsibility', confidence: 'high' }],
    competencies: ['cloud-infrastructure', 'programming-automation', 'grc-privacy-compliance'], platforms: ['IAM platform'], protocols: ['SAML', 'Kerberos', 'OAuth', 'LDAP', 'RADIUS'], lawsAndStandards: ['ISO 27001', 'NIST', 'GDPR'], deliverables: ['권한 모델', 'Role Catalog', 'Access Review'], partnerTeams: ['IT', 'DevOps', 'HRIT', 'IS teams'],
    fieldEvidence: { responsibilities: direct, requirements: direct, preferredQualifications: direct, deliverables: inferred, partnerTeams: direct, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'ethos-ai-red-team', companyName: 'Ethos', jobTitle: 'AI Red Team Security Engineer', industryId: 'insurtech', careerLevel: 'senior', experience: '7년 이상', workLocation: 'Remote US', employmentType: 'Full-time',
    responsibilities: ['LLM Prompt Injection', 'Jailbreaking', 'RAG Data Exfiltration', 'AI Agent 평가', 'Adversarial ML', '웹·API·모바일·클라우드·Kubernetes 침투 테스트', 'APT형 Red Team'], requirements: ['AI·ML 시스템 실전 테스트', 'Red Team', '인증·클라우드·컨테이너', 'OWASP LLM Top 10'], preferredQualifications: ['OSCP', 'OSEP', 'CRTO', 'PNPT', 'CEH', 'GPEN', 'GWAPT', 'Adversarial ML', 'AI Governance Framework'],
    roleMappings: [{ roleId: 'role-ai-red-team', weight: 1, basis: 'title', confidence: 'high' }, { roleId: 'role-llm-appsec', weight: 0.8, basis: 'responsibility', confidence: 'high' }],
    competencies: ['offensive-assessment', 'cloud-infrastructure'], platforms: ['Kubernetes'], frameworks: ['OWASP LLM Top 10', 'AI Governance Framework'], deliverables: ['공격 시나리오', '평가 결과', 'Remediation Recommendation'],
    fieldEvidence: { responsibilities: direct, requirements: direct, preferredQualifications: direct, deliverables: inferred, roleMappings: { evidenceType: 'normalized' } },
  }),
  posting({
    id: 'zimperium-detection-research', companyName: 'Zimperium', jobTitle: 'Detection Researcher / Security Engineer', industryId: 'security-vendor', careerLevel: 'unknown', employmentType: 'Full-time',
    responsibilities: ['iOS 포렌식 기반 탐지 기법 개발', '내부 도구·자동화 유지보수', '고객 포렌식 데이터 해석', '기술 보고서·블로그 작성'], requirements: ['iOS Internals', '포렌식 데이터 분석', 'IDA·Ghidra·Hopper', 'C·Python·Objective-C·Swift', 'Offensive·Defensive 사고'],
    roleMappings: [{ roleId: 'role-detection-researcher', weight: 1, basis: 'title', confidence: 'high' }, { roleId: 'role-mobile-forensics', weight: 0.9, basis: 'responsibility', confidence: 'high' }, { roleId: 'role-reverse-engineer', weight: 0.8, basis: 'requirement', confidence: 'high' }],
    competencies: ['reverse-forensics-research', 'programming-automation', 'communication-documentation'], tools: ['IDA', 'Ghidra', 'Hopper'], platforms: ['iOS', 'C', 'Python', 'Objective-C', 'Swift'], deliverables: ['탐지 알고리즘', '내부 자동화 도구', '고객 기술 보고서', '기술 블로그'],
    fieldEvidence: { responsibilities: direct, requirements: direct, deliverables: inferred, roleMappings: { evidenceType: 'normalized' } },
  }),
])

const partialSeeds = [
  ['grip-privacy', '그립', '개인정보 운영', 'ecommerce', ['개인정보 관리체계', '법령 대응', '수탁사 관리', 'ISMS-P 대응'], ['role-privacy-operations', 'role-third-party-risk']],
  ['elice-junior-security', '엘리스', '신입 정보보안', 'saas', ['보안 시스템 운영', 'ISO 27001·ISMS-P·CSAP 준비'], ['role-security-operations', 'role-grc-operations']],
  ['lotte-junior-soc', '롯데이노베이트', '신입 보안관제', 'services', ['24x365', '침입 이벤트', '차단', 'FW·IPS·WAF', '보고서', 'OS·Network'], ['role-soc-l1']],
  ['withnetworks-junior-soc', '위드네트웍스', '신입 보안관제', 'services', ['24x365', '이벤트 확인', '보안장비·네트워크 기초', '보고서'], ['role-soc-l1']],
  ['cloudflare-ir', 'Cloudflare', 'Incident Response 계열', 'telecom', ['네트워크 프로토콜', '실시간 공격 완화', 'SLA 대응', 'Bash·Python', 'WAF·Wireshark 계열'], ['role-network-forensics', 'role-incident-response']],
  ['ge-vernova-ot', 'GE Vernova', 'OT Security', 'energy', ['Switch·Firewall·SCADA·HMI', 'ISA/IEC 62443', 'NIST', 'Asset Inventory', 'Segmentation', 'Hardening'], ['role-ot-security-engineer']],
  ['ey-data-privacy', 'EY', 'Data Privacy', 'services', ['PIA·DPIA', 'Data Mapping', 'Data Classification', 'OneTrust·BigID·MS Purview'], ['role-privacy-engineer']],
  ['amazon-ai-redteam', 'Amazon', 'AI Red Team', 'saas', ['Python·Go', 'AI 공격 기법 연구', 'Red Team 운영'], ['role-ai-red-team']],
]

export const partialJobPostingSeeds = Object.freeze(partialSeeds.map(([id, companyName, jobTitle, industryId, responsibilities, roleIds]) => posting({
  id, companyName, jobTitle, industryId, careerLevel: id.includes('junior') ? 'entry' : 'unknown', responsibilities,
  roleMappings: roleIds.map((roleId) => ({ roleId, weight: 1, basis: 'responsibility', confidence: 'medium' })),
  contentCompleteness: 'partial', notes: '현재 handoff에 상세 필드가 일부만 남아 있어, 비어 있는 항목은 추정하지 않았습니다.',
  fieldEvidence: { responsibilities: direct, roleMappings: { evidenceType: 'normalized' } },
})))

export const metadataOnlyJobPosting = Object.freeze({
  id: 'jobkorea-49530641',
  raw: { companyName: '㈜싸이버원', jobTitle: '침해사고 조사 담당자 경력 채용(5년 이하)', workLocation: '', employmentType: '', experience: '', responsibilities: [], requirements: [], preferredQualifications: [] },
  normalized: { industryId: null, careerLevel: 'unknown', requiredYearsMin: null, requiredYearsMax: null, roleMappings: [{ roleId: 'role-incident-response', weight: 1, basis: 'title', confidence: 'medium' }, { roleId: 'role-dfir-investigator', weight: 1, basis: 'title', confidence: 'medium' }], competencies: [], tools: [], platforms: [], protocols: [], frameworks: [], lawsAndStandards: [], deliverables: [], partnerTeams: [] },
  source: { sourceType: 'individualVacancy', pageSystem: 'jobBoard', postingUrl: 'https://m.jobkorea.co.kr/Recruit/GI_Read/49530641?sc=226', applyUrl: null, checkedDate: null, isCurrent: null, archivedAsset: null },
  evidence: { bodyVerified: false, contentCompleteness: 'metadataOnly', contentCompletenessScore: 0.3, notes: '제목과 URL만 제공됐습니다. 원문 검증 전에는 상세 업무와 필수 역량을 표시하지 않습니다.', fieldEvidence: { roleMappings: { evidenceType: 'metadataOnly' } } },
})

export const jobPostingSeeds = Object.freeze([...detailedJobPostingSeeds, ...partialJobPostingSeeds])

export const domesticPostingIds = Object.freeze([
  'line-pay-information-security', 'easysec-isms-consulting', 'toss-it-security-audit', 'travelwallet-cloud-security', 'coupang-tier2-soc',
  'autocrypt-automotive-research', 'grip-privacy', 'elice-junior-security', 'lotte-junior-soc', 'withnetworks-junior-soc',
])

export function postingMarket(postingId) {
  return domesticPostingIds.includes(postingId) ? 'domestic' : 'international'
}

export function getPostingById(id) {
  return jobPostingSeeds.find((item) => item.id === id) || (metadataOnlyJobPosting.id === id ? metadataOnlyJobPosting : null)
}
