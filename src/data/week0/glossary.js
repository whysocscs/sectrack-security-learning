import { weekZeroSources } from './sources.js'

const sourceRefs = {
  cve: ['source-cve'],
  cwe: ['source-cwe'],
  cvss: ['source-cvss-v4'],
  general: ['source-kisa-job-guide'],
}

function term(id, title, englishName, category, simpleDefinition, preciseDefinition, example, misconception, compareWith = [], relatedWeekIds = [0]) {
  return { id, title, englishName, category, simpleDefinition, preciseDefinition, example, misconception, compareWith, relatedWeekIds, sourceRefs: sourceRefs.general }
}

export const glossaryCategories = Object.freeze([
  { id: 'all', label: '전체' },
  { id: 'foundation', label: '기본 개념' },
  { id: 'vulnerability', label: '취약점·공격 코드' },
  { id: 'offensive', label: '공격 관점' },
  { id: 'defensive', label: '방어 통제' },
])

export const securityGlossary = Object.freeze([
  term('asset', '자산', 'Asset', 'foundation', '보호해야 하는 데이터, 계정, 서버, 서비스, 사람, 평판입니다.', '조직의 임무·운영·법적 의무에 가치를 가지므로 손실, 훼손, 공개, 중단의 영향을 평가해야 하는 대상입니다.', '학생 정보가 든 서비스 DB와 과제 업로드 기능은 서로 다른 자산입니다.', '자산은 서버 한 대만 뜻한다 → 데이터·계정·서비스 지속성도 자산입니다.', ['threat', 'risk']),
  term('threat', '위협', 'Threat', 'foundation', '자산에 피해를 줄 수 있는 공격자, 사건, 조건입니다.', '취약점을 이용하거나 우연한 장애를 통해 자산의 기밀성·무결성·가용성에 손해를 줄 수 있는 잠재적 원인입니다.', '탈취된 계정으로 다른 학생 정보를 보려는 행위는 위협 시나리오입니다.', '위협이 있으면 곧 취약점이 있다는 뜻이다 → 약점과 위해 원인은 구분합니다.', ['vulnerability', 'risk']),
  term('vulnerability', '취약점', 'Vulnerability', 'foundation', '공격자가 이용할 수 있는 설계, 구현, 설정, 운영의 약점입니다.', '위협이 특정 자산에 영향을 주는 데 이용할 수 있는 보안상 약점입니다. 존재만으로 영향 크기가 정해지지는 않습니다.', '서버가 요청자와 대상 파일의 관계를 확인하지 않는 인가 누락이 예입니다.', '취약점 수가 많으면 항상 더 위험하다 → 노출, 자산, 통제를 함께 봐야 합니다.', ['threat', 'risk', 'exploit']),
  term('risk', '위험', 'Risk', 'foundation', '위협이 약점을 이용할 가능성과 그때의 영향을 함께 본 판단입니다.', '조직의 자산, 위협, 취약점, 노출, 기존 통제와 사업 영향을 결합해 우선순위를 정하는 의사결정 대상입니다.', '공개된 저장소에 개인정보가 있고 외부 접근이 가능하면 영향과 가능성을 함께 평가합니다.', 'CVSS 점수가 곧 조직의 최종 위험도다 → 자산 중요도와 실제 노출, 통제를 추가로 판단합니다.', ['vulnerability', 'cvss']),
  term('attack-surface', '공격 표면', 'Attack Surface', 'foundation', '공격자가 접근하거나 영향을 줄 수 있는 진입점과 경계의 전체입니다.', '네트워크 서비스, API, 관리자 기능, 계정 흐름, 외부 의존성, 운영 절차처럼 공격 경로가 될 수 있는 노출 지점의 집합입니다.', '로그인 API, 파일 업로드, 관리자 콘솔, CI/CD 토큰은 서로 다른 공격 표면입니다.', '포트만 공격 표면이다 → 사람과 공급망, API, 권한 경계도 포함됩니다.', ['asset', 'threat']),
  term('cia', 'CIA Triad', 'Confidentiality, Integrity, Availability', 'foundation', '기밀성, 무결성, 가용성이라는 보안의 세 기본 목표입니다.', '기밀성은 허가되지 않은 공개를, 무결성은 허가되지 않은 변경을, 가용성은 필요한 시점의 사용 불가를 줄이는 목표입니다.', '과제 파일은 다른 학생에게 공개되지 않고, 변경 이력을 남기며, 마감 시간에 사용할 수 있어야 합니다.', 'CIA는 체크리스트 하나면 끝난다 → 서로 충돌할 수 있어 설계와 운영에서 균형을 잡아야 합니다.', ['authentication', 'authorization']),
  { ...term('cve', 'CVE', 'Common Vulnerabilities and Exposures', 'vulnerability', '공개적으로 식별된 특정 취약점에 붙는 공통 식별자입니다.', 'CVE는 특정 취약점을 참조하기 위한 식별자입니다. 심각도, 패치 가능 여부, 실제 악용 여부를 스스로 모두 뜻하지는 않습니다.', 'CVE-YYYY-NNNN 형식의 식별자를 제품 영향 분석의 출발점으로 사용합니다.', 'CVE 번호만 보면 위험도를 알 수 있다 → CVE는 식별자이며 환경별 영향은 별도 확인합니다.', ['cwe', 'cvss']), sourceRefs: sourceRefs.cve },
  { ...term('cwe', 'CWE', 'Common Weakness Enumeration', 'vulnerability', '취약점이 생기는 약점과 근본 원인의 유형을 분류한 체계입니다.', 'CWE는 특정 제품의 한 취약점이 아니라 반복되는 설계·구현·구성 약점의 유형을 설명합니다.', '입력 검증 부족, 인가 누락 같은 약점 유형을 CWE로 분류할 수 있습니다.', 'CWE는 개별 제품의 취약점 번호다 → 특정 사례는 CVE, 약점 유형은 CWE입니다.', ['cve', 'cvss']), sourceRefs: sourceRefs.cwe },
  { ...term('cvss', 'CVSS', 'Common Vulnerability Scoring System', 'vulnerability', '취약점의 기술적 특성과 상대적 심각도를 점수와 벡터로 표현하는 체계입니다.', 'CVSS는 공격 경로, 복잡성, 필요한 권한, 사용자 상호작용, 기밀성·무결성·가용성 영향 같은 기술적 특성을 일관된 벡터로 표현합니다.', '같은 CVSS 점수라도 조직의 자산 중요도와 노출 여부에 따라 처리 우선순위는 달라질 수 있습니다.', 'CVSS 9.8이면 우리 조직의 최고 위험이다 → 기술적 심각도와 조직 위험 평가는 다른 판단입니다.', ['cve', 'cwe', 'risk']), sourceRefs: sourceRefs.cvss },
  term('zero-day', 'Zero-day', 'Zero-day', 'vulnerability', '공개 수정책이나 충분한 대응 준비 전에 악용되는 취약점 또는 공격을 가리킵니다.', '공개 시점과 공급자의 수정·탐지 준비 사이의 공백에서 악용될 수 있는 취약점 또는 공격 상황을 설명하는 표현입니다.', '패치나 탐지 규칙이 준비되기 전 새로운 약점이 악용되는 상황입니다.', 'Zero-day는 CVE가 절대 없는 취약점이다 → CVE 부여 여부와 공개·대응 시점은 별도입니다.', ['one-day', 'patch']),
  term('one-day', 'One-day·N-day', 'One-day / N-day', 'vulnerability', '알려진 취약점과 수정 정보가 나온 뒤에도 패치하지 않은 시스템을 노리는 현업 표현입니다.', '공개된 취약점, 패치, 탐지 정보가 존재하지만 자산 식별·우선순위·변경 절차 문제로 수정이 지연된 상태를 가리킬 때 사용합니다.', '지원되는 버전의 보안 업데이트가 있었지만 적용하지 않은 서버가 해당될 수 있습니다.', 'One-day는 CVE·CVSS 같은 공식 표준명이다 → 널리 쓰이는 현업 표현이지 같은 종류의 표준 체계가 아닙니다.', ['zero-day', 'patch']),
  term('exploit', 'Exploit', 'Exploit', 'vulnerability', '취약한 조건을 실제로 발생시키는 코드, 입력, 절차, 기법입니다.', '취약점을 이용해 의도하지 않은 동작을 만들기 위한 구체적 방법이나 코드입니다. 안전 실습에서는 고정된 무해 마커만 사용합니다.', '인가 검증 누락을 확인하는 재현 절차는 exploit의 일부가 될 수 있습니다.', 'Exploit과 취약점은 같은 말이다 → 취약점은 약점, exploit은 그 약점을 이용하는 방법입니다.', ['payload', 'vulnerability']),
  term('payload', 'Payload', 'Payload', 'vulnerability', 'Exploit 성공 뒤 공격자가 의도한 결과를 수행하는 데이터, 명령, 코드입니다.', '공격 흐름에서 취약 조건을 만들기 위한 부분과, 성공 뒤 실제 행동을 수행하는 부분을 분리해 설명할 때 쓰는 말입니다.', '교육 환경에서는 데이터 유출이나 외부 통신 대신 고정된 표시 문자열만 사용합니다.', 'Payload는 항상 악성코드 파일이다 → 데이터, 명령, 스크립트 등 여러 형태일 수 있습니다.', ['exploit']),
  term('patch', 'Patch', 'Patch', 'vulnerability', '취약점이나 오류를 수정하기 위해 배포하는 코드, 설정, 업데이트입니다.', '약점의 원인을 바꾸거나 안전한 기본값을 적용하기 위한 변경이며, 배포 뒤 재시험과 회귀 확인이 필요합니다.', '서버 객체 인가를 추가한 뒤 다른 역할과 경로에서도 다시 확인합니다.', '패치를 설치하면 위험이 자동으로 0이 된다 → 적용 범위와 우회 경로, 잔여 위험을 확인합니다.', ['one-day', 'risk']),
  term('fuzzing', 'Fuzzing', 'Fuzzing', 'vulnerability', '다양한 비정상·경계 입력을 자동 생성해 오류와 실행 경로를 찾는 테스트 기법입니다.', '입력 생성, 관찰 가능한 실패, 재현, 입력 축소, 원인 분석, 보안 영향 판단을 연결하는 테스트 방식입니다.', '고정된 학습 대상에 긴 문자열과 경계값을 넣어 예외를 재현하는 흐름을 연습할 수 있습니다.', '크래시가 나오면 즉시 취약점이다 → 재현, 원인, 도달 가능성, 영향 분석이 필요합니다.', ['vulnerability'], [0, 14]),
  term('offensive-security', 'Offensive Security', 'Offensive Security', 'offensive', '허가된 범위에서 공격자 관점으로 약점과 공격 경로를 찾고 검증하는 업무 관점입니다.', '계약된 대상·계정·시간·기법 안에서 취약점의 성립 조건과 영향을 검증하고 수정 근거를 남기는 관점입니다.', '웹 진단, Red Team, 취약점 연구는 서로 다른 범위와 산출물을 가질 수 있습니다.', 'Offensive는 허가 없이 공격해 보는 일이다 → 명시된 범위와 최소 영향이 선행 조건입니다.', ['penetration-testing', 'defensive-security']),
  term('penetration-testing', 'Penetration Testing', 'Penetration Testing', 'offensive', '계약과 허가 범위 안에서 실제 공격 기법으로 취약점과 영향을 검증하는 활동입니다.', '정해진 Rules of Engagement 아래에서 재현 가능한 증거를 수집하고 영향과 수정 방법을 보고하는 검증 활동입니다.', '외부 서비스가 아니라 제공된 실습 인스턴스에서만 요청을 비교합니다.', '공개 사이트면 모의침투가 가능하다 → 공개 접근과 테스트 권한은 다릅니다.', ['offensive-security', 'exploit']),
  term('malware', 'Malware', 'Malicious Software', 'offensive', '시스템에서 원치 않는 악성 행위를 수행하도록 만들어진 프로그램이나 코드입니다.', '사용자나 운영자의 의도와 달리 실행, 지속성, 정보 탈취, 파괴, 원격 제어 같은 행위를 수행하도록 설계된 코드의 범주입니다.', '의심 파일은 개인 PC가 아니라 격리된 허가 환경에서 분석해야 합니다.', '모든 탐지 파일이 악성코드다 → 오탐, 도구, 테스트 파일 가능성을 근거와 함께 구분합니다.', ['c2', 'edr']),
  term('phishing', 'Phishing', 'Phishing', 'offensive', '신뢰할 만한 메시지, 사이트, 사람처럼 위장해 행동이나 정보 제공을 유도하는 공격입니다.', '이메일, 메신저, 전화, 웹페이지 등에서 신뢰 신호를 흉내 내 계정 정보나 승인 행동을 유도하는 사회공학 공격 유형입니다.', '로그인 재인증을 가장한 링크가 자격 증명 입력을 유도할 수 있습니다.', '피싱은 이메일만 뜻한다 → 메시지, 전화, 협업 도구, 웹사이트 등 다양한 경로가 있습니다.', ['social-engineering']),
  term('social-engineering', 'Social Engineering', 'Social Engineering', 'offensive', '사람의 신뢰, 심리, 업무 절차, 실수를 이용해 통제를 우회하는 공격 방식입니다.', '기술적 취약점이 없어도 사람과 조직의 의사결정 경로를 악용할 수 있으므로 교육, 절차, 검증이 함께 필요합니다.', '긴급한 요청처럼 보이게 해 송금이나 비밀번호 재설정을 유도합니다.', '보안 도구만 잘 설치하면 막을 수 있다 → 승인 절차와 사람의 확인 과정도 통제입니다.', ['phishing']),
  term('privilege-escalation', 'Privilege Escalation', 'Privilege Escalation', 'offensive', '이미 확보한 낮은 권한을 더 높은 권한으로 올리는 행위입니다.', '권한 모델의 약점, 구성 오류, 취약한 서비스 등을 통해 접근 범위를 넓히는 공격 단계입니다.', '일반 계정이 관리자 전용 설정을 변경할 수 있는지 확인하는 상황을 생각할 수 있습니다.', '관리자 로그인만 권한 상승이다 → 역할, 서비스 계정, 파일 권한 등 다양한 경로가 있습니다.', ['authorization', 'least-privilege']),
  term('lateral-movement', 'Lateral Movement', 'Lateral Movement', 'offensive', '침투한 위치에서 다른 계정, 호스트, 서비스로 이동하는 행위입니다.', '초기 접근 이후 조직 내부의 신뢰 관계, 자격 증명, 원격 관리 경로를 이용해 범위를 넓히는 행동입니다.', '한 서버의 계정 정보가 다른 서버 접근에 재사용될 수 있습니다.', '내부 네트워크면 자동으로 신뢰해도 된다 → 내부에서도 인증, 인가, 분리가 필요합니다.', ['authentication', 'authorization']),
  term('c2', 'C2·Command and Control', 'Command and Control', 'offensive', '공격자가 침해한 시스템에 명령을 전달하고 결과를 받는 통신·제어 체계입니다.', '침해 이후의 통신 채널과 제어 구조를 설명하는 용어로, 탐지에서는 비정상 외부 통신과 프로세스 맥락을 함께 봅니다.', '고정된 교육 로그에서 낯선 외부 통신과 실행 주체를 함께 분석할 수 있습니다.', '외부 통신은 모두 C2다 → 정상 서비스 통신과 실행 맥락, 목적지를 함께 확인해야 합니다.', ['malware', 'edr']),
  term('defensive-security', 'Defensive Security', 'Defensive Security', 'defensive', '공격을 예방, 탐지, 분석, 대응, 복구하는 보안 업무 관점입니다.', '기술·절차·조직 통제를 운영해 사고 가능성과 영향을 낮추고, 발생 시 신속히 제한·복구하는 관점입니다.', 'SOC, Detection Engineering, IR, GRC가 서로 다른 산출물로 방어를 구성합니다.', 'Defensive는 경보만 보는 일이다 → 예방부터 사후 개선까지의 운영을 포함합니다.', ['offensive-security', 'ids-ips']),
  term('authentication', 'Authentication', 'Authentication', 'defensive', '사용자가 주장한 신원이 맞는지 확인하는 과정입니다.', '비밀번호, MFA, 인증서 등으로 요청 주체의 신원을 검증하는 단계이며, 이후 자원별 인가와 분리됩니다.', '로그인 과정에서 사용자가 누구인지 확인합니다.', '로그인에 성공하면 모든 자원 접근이 가능하다 → 자원별 Authorization이 별도로 필요합니다.', ['authorization']),
  term('authorization', 'Authorization', 'Authorization', 'defensive', '인증된 주체가 특정 자원에서 어떤 행동을 할 수 있는지 결정하는 과정입니다.', '요청 주체, 역할, 대상 객체, 행동의 관계를 서버가 검증해 허용 여부를 판단하는 통제입니다.', '학생이 자신의 과제만 읽을 수 있는지 확인하는 것은 Authorization입니다.', 'UI에서 버튼을 숨기면 인가가 끝난다 → 서버가 모든 요청에서 검증해야 합니다.', ['authentication', 'least-privilege']),
  term('least-privilege', 'Least Privilege', 'Least Privilege', 'defensive', '업무에 필요한 최소한의 권한만 부여하고 검토·회수하는 원칙입니다.', '계정, 역할, 서비스, API 권한을 필요한 범위로 제한하고 변경·퇴직·예외 상황에서 다시 검토하는 통제 원칙입니다.', '읽기만 필요한 자동화 계정에 관리자 권한을 주지 않습니다.', '최소 권한은 처음 한 번만 설정하면 된다 → 역할 변경과 예외를 계속 검토해야 합니다.', ['authorization', 'privilege-escalation']),
  term('firewall', 'Firewall', 'Firewall', 'defensive', '통신을 주소, 포트, 프로토콜, 상태, 애플리케이션 규칙으로 허용하거나 차단하는 통제입니다.', '네트워크 경계나 워크로드 사이에서 정의된 규칙에 따라 통신을 제한하고 기록하는 보안 통제입니다.', '관리자 포트는 승인된 관리망에서만 허용할 수 있습니다.', '방화벽 하나면 서버 보안이 끝난다 → 서버 인가, 패치, 로깅 등 다른 통제도 필요합니다.', ['ids-ips']),
  term('ids-ips', 'IDS·IPS', 'Intrusion Detection / Prevention System', 'defensive', 'IDS는 공격 징후를 탐지·알리고, IPS는 통신 경로에서 차단까지 수행할 수 있습니다.', 'IDS와 IPS는 정책과 탐지 로직을 바탕으로 의심 행위를 탐지하고, 배치에 따라 경고 또는 차단을 수행하는 통제입니다.', '같은 시그니처라도 IDS는 알림만, IPS는 차단까지 할 수 있습니다.', 'IPS가 있으면 모든 공격을 막는다 → 탐지 범위, 오탐, 암호화 트래픽, 우회 경로가 있습니다.', ['firewall', 'edr']),
  term('edr', 'EDR', 'Endpoint Detection and Response', 'defensive', 'PC와 서버의 프로세스, 파일, 계정, 네트워크 행동을 수집해 위협을 탐지·조사·대응하는 체계입니다.', '엔드포인트 수준의 telemetry를 바탕으로 경보, 조사, 격리 같은 대응을 지원하는 보안 운영 체계입니다.', '의심 프로세스의 실행 트리와 네트워크 연결을 함께 조사합니다.', 'EDR 경보는 곧 침해 확정이다 → 증거와 정상 업무 맥락을 함께 확인해야 합니다.', ['ids-ips', 'malware']),
])

export const glossarySources = weekZeroSources

export const cveCweCvssFlow = Object.freeze([
  ['CWE', '취약점이 생기는 약점 유형'],
  ['특정 제품·버전에서 실제 취약점 발견', ''],
  ['CVE', '해당 취약점을 가리키는 식별자'],
  ['CVSS', '기술적 특성과 상대적 심각도 표현'],
  ['조직 위험 평가', '자산 중요도·노출·악용·통제·사업 영향을 추가 판단'],
])
