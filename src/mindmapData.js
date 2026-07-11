const branch = (id, label, description, roles, weeks, nodes) => ({
  id,
  label,
  description,
  roles,
  weeks,
  nodes: nodes.map((node) => {
    const [nodeId, nodeLabel, definition, importance, offensiveExample, defensiveExample, prerequisites = []] = node
    return {
      id: nodeId,
      label: nodeLabel,
      category: label,
      definition,
      importance,
      offensiveExample,
      defensiveExample,
      relatedWeeks: weeks,
      prerequisites,
      relatedRoles: roles,
      references: [],
    }
  }),
})

export const mindmapBranches = [
  branch('governance', '거버넌스·표준·컨설팅', '조직이 보호할 대상과 감당할 위험을 정하고 정책·절차·증거로 운영합니다.', ['정보보호 기획', 'CISO', 'GRC 컨설턴트', '보안 감사자', '개인정보보호 담당자'], [0, 15], [
    ['governance-program', '정보보호 거버넌스', '경영 목표와 보안 의사결정·책임·자원을 연결하는 체계입니다.', '기술 통제를 조직의 우선순위와 예산에 연결합니다.', '조직의 책임 공백과 승인 절차 부재를 악용할 수 있습니다.', '책임자, 의사결정 구조, 보고 지표와 예외 승인 절차를 정합니다.'],
    ['risk-management', '위험 관리', '자산·위협·취약점·가능성·영향을 평가하고 처리 방식을 정하는 과정입니다.', '모든 문제를 같은 우선순위로 다루지 않게 합니다.', '높은 영향과 쉬운 공격 경로가 결합된 지점을 우선 노립니다.', '회피·완화·이전·수용을 결정하고 잔여 위험을 승인합니다.', ['자산', '위협', '취약점']],
    ['security-policy', '보안 정책·절차', '조직의 보안 원칙과 반복 업무의 수행 방법을 문서화한 기준입니다.', '사람마다 다른 판단을 줄이고 감사 가능한 근거를 만듭니다.', '문서와 실제 운영이 다르거나 예외가 누적된 지점을 찾습니다.', '정책, 표준, 절차, 가이드의 위계를 정하고 정기 검토합니다.'],
    ['iso27001', 'ISO/IEC 27001', '정보보호 관리체계의 요구사항을 정의하는 국제 표준입니다.', '위험 기반 통제와 지속 개선을 조직 단위로 운영하는 기준입니다.', '인증 보유 자체가 모든 기술 취약점 제거를 뜻하지는 않습니다.', '적용범위, 위험평가, 통제, 내부심사, 경영검토를 운영합니다.'],
    ['security-audit', '보안 감사', '정책·통제·법적 요구가 설계대로 운영되고 증거가 남는지 독립적으로 확인합니다.', '통제가 존재한다는 주장과 실제 작동을 구분합니다.', '형식적 증적이나 샘플 기간 밖의 운영 공백을 찾습니다.', '표본·증적·인터뷰를 교차 검증하고 개선 조치를 추적합니다.'],
    ['privacy', '개인정보보호', '개인정보의 수집·이용·보관·제공·파기를 전 수명주기에서 관리합니다.', '침해 시 개인 권리와 조직의 법적·평판상 영향이 큽니다.', '과도한 수집, 공개 저장소, 권한 과다, 파기 누락을 악용합니다.', '최소 수집, 목적 제한, 접근 통제, 보유기간, 유출 대응을 적용합니다.'],
    ['security-consulting', '보안 컨설팅', '현재 상태를 진단하고 목표 수준과 실행 가능한 개선 로드맵을 제시합니다.', '기술·관리·사업 제약을 한 문서에서 조정합니다.', '통제 간 연결이 끊긴 경로와 현장 운영의 예외를 검증합니다.', '근거가 있는 갭 분석과 우선순위·담당자·기한을 제시합니다.'],
  ]),
  branch('computer', '컴퓨터·운영체제 기초', '프로그램이 CPU·메모리·파일·네트워크 자원을 사용하는 원리를 다룹니다.', ['시스템 보안 엔지니어', '취약점 연구원', '악성코드 분석가', 'DFIR 분석가'], [1, 2, 7, 8, 9, 10], [
    ['cpu', 'CPU', '메모리의 명령어를 가져와 해석하고 연산과 제어를 수행하는 장치입니다.', '모든 프로그램 실행과 권한 전환의 물리적 기반입니다.', '취약한 명령 흐름을 조작해 원래 의도와 다른 코드를 실행합니다.', '권한 수준, 실행 방지, 제어 흐름 보호를 함께 적용합니다.'],
    ['register', 'Register', 'CPU 내부에서 주소·연산값·실행 상태를 빠르게 보관하는 작은 저장 공간입니다.', '어셈블리와 디버깅에서 현재 실행 상태를 읽는 핵심입니다.', '반환 주소나 함수 인자를 원하는 값으로 바꾸려 합니다.', '호출 규약과 메모리 보호를 이해하고 크래시 상태를 분석합니다.', ['CPU']],
    ['memory', 'Memory·Virtual Memory', '실행 중인 코드와 데이터를 주소로 접근하며, 가상 메모리는 프로세스별 주소 공간을 제공합니다.', '메모리 손상 취약점과 프로세스 격리를 이해하는 기반입니다.', '경계 밖 읽기·쓰기와 Use-after-free 등을 이용합니다.', 'ASLR, NX, 메모리 안전 언어, 경계 검사를 적용합니다.', ['주소', '프로세스']],
    ['process-thread', 'Process·Thread', '프로세스는 자원 격리 단위이고 스레드는 프로세스 안의 실행 흐름입니다.', '권한·메모리·파일 핸들·동시성 문제의 단위가 됩니다.', '높은 권한 프로세스와 경쟁 상태를 노립니다.', '권한 분리, 샌드박스, 동시성 제어, 최소 자원을 적용합니다.'],
    ['kernel-user', 'Kernel·User Space', '사용자 프로그램과 운영체제 핵심 기능을 권한 수준으로 분리합니다.', '파일·네트워크·메모리 접근은 시스템 호출 경계를 통과합니다.', '커널 취약점이나 잘못된 드라이버 인터페이스로 격리를 넘으려 합니다.', '공격 표면을 줄이고 시스템 호출과 드라이버 권한을 제한합니다.'],
    ['filesystem', 'File System', '데이터를 디렉터리·파일·메타데이터와 경로로 조직합니다.', '설정·로그·실행 파일·비밀정보가 모두 파일 시스템에 놓입니다.', '노출된 설정, 임시 파일, 경로 조작, 권한 오류를 찾습니다.', '소유권, 권한, 안전한 임시 파일, 무결성 감시를 적용합니다.'],
    ['permission', 'Permission', '주체가 파일·프로세스·서비스에서 수행할 수 있는 행동을 제한하는 규칙입니다.', '침해가 발생해도 영향 범위를 줄이는 기본 통제입니다.', '과도한 쓰기·실행 권한과 잘못된 서비스 계정을 찾습니다.', '최소 권한, 역할 분리, 정기 검토를 적용합니다.'],
  ]),
  branch('crypto', '암호학·PKI', '기밀성·무결성·인증을 수학적 알고리즘과 키 관리로 제공합니다.', ['암호 연구원', '보안 개발자', 'IAM 엔지니어', 'PKI 운영자'], [3, 12, 13], [
    ['symmetric', '대칭키 암호', '같은 비밀키로 암호화와 복호화를 수행하는 방식입니다.', '대용량 데이터의 기밀성을 효율적으로 보호합니다.', '약한 키·Nonce 재사용·운영 모드 오류를 노립니다.', '검증된 AEAD 알고리즘과 안전한 키·Nonce 관리를 사용합니다.'],
    ['asymmetric', '비대칭키 암호', '서로 다른 공개키와 개인키의 수학적 관계를 사용하는 방식입니다.', '키 교환, 전자서명, 인증서 기반 신뢰에 쓰입니다.', '개인키 노출, 잘못된 패딩, 검증 누락을 노립니다.', '검증된 라이브러리와 키 보호, 올바른 파라미터를 사용합니다.'],
    ['hash', '해시 함수', '임의 길이 입력을 고정 길이 요약으로 변환하는 단방향 함수입니다.', '무결성 확인과 서명·비밀번호 저장 구성 요소로 쓰입니다.', '빠른 일반 해시로 저장된 비밀번호와 충돌 취약 알고리즘을 노립니다.', '용도에 맞는 SHA 계열과 비밀번호 전용 KDF를 구분합니다.'],
    ['signature', '전자서명', '개인키로 서명하고 공개키로 데이터의 출처와 무결성을 검증합니다.', '변조 탐지와 서명자 확인을 제공합니다.', '서명 검증 누락과 잘못된 키 신뢰를 노립니다.', '서명 대상 전체를 명확히 하고 키·인증서 검증을 적용합니다.'],
    ['pki', 'PKI·인증서', '인증기관과 인증서로 공개키와 신원을 연결하는 신뢰 체계입니다.', 'TLS와 조직 인증에서 공개키 신뢰를 확장합니다.', '만료·호스트명·체인 검증 누락을 노립니다.', '인증서 체인, 이름, 유효기간, 폐기 상태를 검증합니다.'],
    ['tls', 'TLS', '네트워크 통신의 기밀성·무결성과 서버 인증을 제공하는 프로토콜입니다.', 'HTTP 등 응용 통신을 도청·변조로부터 보호합니다.', '낡은 버전·약한 설정·인증서 검증 누락을 찾습니다.', '지원 버전·Cipher·인증서와 키 수명주기를 안전하게 운영합니다.'],
  ]),
  branch('network', '네트워크 보안', '장치와 프로세스 사이의 통신 경로, 프로토콜, 경계 통제를 다룹니다.', ['네트워크 보안 엔지니어', 'SOC 분석가', '침해사고 대응가', '네트워크 포렌식 분석가'], [2, 3, 13], [
    ['tcpip', 'OSI·TCP/IP', '통신 기능을 계층으로 나누어 프로토콜과 문제 위치를 설명하는 모델입니다.', '패킷 증거와 통제 위치를 일관되게 설명하게 합니다.', '계층 간 신뢰와 프로토콜 상태 차이를 악용합니다.', '계층별 필터·인증·로깅을 연결합니다.'],
    ['ethernet-arp', 'Ethernet·ARP', '근거리 네트워크의 프레임 전송과 IP-MAC 주소 대응을 담당합니다.', '동일 네트워크 구간의 통신과 스푸핑을 이해하는 기반입니다.', 'ARP 스푸핑으로 중간자 위치를 만들 수 있습니다.', '네트워크 분리, 동적 ARP 검사, 암호화된 상위 프로토콜을 사용합니다.'],
    ['ip', 'IP', '패킷을 출발지에서 목적지 네트워크로 전달하는 주소·라우팅 계층입니다.', '방화벽·라우팅·세그먼테이션 정책의 기반입니다.', '출발지 위조, 잘못된 라우팅과 노출된 관리망을 노립니다.', '필터링, 네트워크 분리, 라우팅 보호를 적용합니다.'],
    ['tcp-udp', 'TCP·UDP', 'TCP는 연결 상태와 신뢰성, UDP는 단순한 데이터그램 전송을 제공합니다.', '포트·세션·서비스 동작을 분석하는 기준입니다.', '상태 고갈, 반사·증폭, 열린 서비스와 구현 오류를 찾습니다.', '상태 기반 방화벽, Rate limit, 최소 서비스 노출을 적용합니다.'],
    ['dns', 'DNS', '도메인 이름을 IP와 다양한 레코드에 연결하는 분산 시스템입니다.', '거의 모든 서비스 연결과 탐지에서 핵심 데이터가 됩니다.', '캐시 오염, 탈취, 터널링과 잘못된 레코드를 노립니다.', 'DNSSEC 검토, 보호된 Resolver, 로깅·필터링을 적용합니다.'],
    ['firewall', '방화벽', '주소·포트·프로토콜·연결 상태·애플리케이션 규칙으로 통신을 허용하거나 차단합니다.', '네트워크 공격 표면을 줄이는 기본 경계 통제입니다.', '과도한 허용 규칙과 우회 경로를 찾습니다.', '기본 거부, 최소 규칙, 변경 검토, 로그 모니터링을 적용합니다.'],
    ['ids-ips', 'IDS·IPS', '네트워크·호스트 활동에서 알려진 패턴과 이상 행동을 탐지하거나 차단합니다.', '침입 시도와 침해 징후의 가시성을 제공합니다.', '탐지 공백, 우회 가능한 규칙, 과도한 오탐을 노립니다.', '환경에 맞는 룰 튜닝, 행위 탐지, 대응 절차를 연결합니다.'],
  ]),
  branch('application', '애플리케이션·SW 보안', '요구사항부터 코드·배포·운영까지 소프트웨어의 신뢰 경계와 입력 처리를 다룹니다.', ['AppSec 엔지니어', 'Product Security 엔지니어', '보안 개발자', '웹 모의해킹 전문가'], [2, 3, 4, 5, 6, 14, 16], [
    ['secure-coding', 'Secure Coding', '언어·프레임워크의 안전한 API와 오류 처리로 결함을 예방하는 개발 원칙입니다.', '운영 통제 전에 취약점의 근본 원인을 코드에서 제거합니다.', '경계 검사와 권한 검증이 빠진 코드를 찾습니다.', '코드 리뷰, 안전한 기본값, 자동 검사와 보안 테스트를 적용합니다.'],
    ['input-output', '입력 검증·출력 처리', '입력의 형식·범위를 검증하고 출력 컨텍스트에 맞게 데이터를 코드와 분리합니다.', 'Injection 계열 취약점의 핵심 경계를 다룹니다.', '파서 차이와 잘못된 컨텍스트 처리를 노립니다.', 'Allowlist 검증, 매개변수화, 컨텍스트 인코딩, Sanitization을 구분합니다.'],
    ['sqli', 'SQL Injection', '사용자 데이터가 SQL 쿼리 구조로 해석되는 취약점입니다.', '데이터 기밀성·무결성과 인증 흐름에 큰 영향을 줄 수 있습니다.', '문자열 결합 쿼리와 과도한 DB 권한을 찾습니다.', 'Prepared Statement와 최소 DB 권한을 사용합니다.'],
    ['xss', 'Cross-Site Scripting', '신뢰할 수 없는 데이터가 브라우저에서 코드로 해석되는 취약점입니다.', '피해자 세션 맥락의 화면·데이터·행동에 영향을 줄 수 있습니다.', '반사·저장·DOM Source에서 위험 Sink까지 흐름을 찾습니다.', '컨텍스트 인코딩, 안전한 Sink, Sanitizer, CSP를 계층적으로 적용합니다.'],
    ['csrf', 'CSRF', '브라우저가 자동으로 포함하는 인증 상태를 이용해 원치 않는 요청을 보내게 하는 취약점입니다.', '사용자 의도 확인이 없는 상태 변경을 보호해야 합니다.', '예측 가능한 요청과 교차 사이트 Cookie 전송 조건을 노립니다.', 'CSRF Token, SameSite, Origin 검증과 재인증을 적용합니다.'],
    ['auth-session', '인증·세션 보안', '로그인, 세션 생성·갱신·종료와 권한 검증을 안전하게 설계합니다.', '대부분의 사용자 기능과 데이터 접근의 신뢰 경계입니다.', '세션 고정·탈취, 객체 인가 누락, 약한 복구 절차를 노립니다.', '강한 인증, 세션 수명주기, 서버 측 인가, 감사 로그를 적용합니다.'],
    ['sdlc', '보안 SDLC', '기획·설계·개발·테스트·배포·운영에 보안 활동을 포함하는 수명주기입니다.', '출시 직전 진단에만 의존하지 않고 결함을 일찍 줄입니다.', '위협 모델과 의존성 검토가 빠진 변경을 찾습니다.', '요구사항, Threat Modeling, SAST·DAST·SCA, 배포 가드레일을 연결합니다.'],
  ]),
  branch('access', '접근제어', '주체를 확인하고 자원에 허용할 행동을 정책으로 결정·집행합니다.', ['IAM 엔지니어', '보안 아키텍트', '애플리케이션 개발자', '감사 담당자'], [0, 2, 3, 15], [
    ['identification', '식별·인증', '주체가 신원을 주장하고 그 주장을 자격 증명으로 확인하는 과정입니다.', '권한 결정을 위한 신뢰 가능한 주체 정보가 됩니다.', '약한 비밀번호, 인증 우회, 계정 복구 결함을 노립니다.', 'MFA, Rate limit, 안전한 복구와 자격 증명 수명주기를 적용합니다.'],
    ['authorization', '인가', '인증된 주체가 특정 자원에서 특정 행동을 할 수 있는지 결정합니다.', '로그인 이후의 데이터 격리와 업무 권한을 보장합니다.', 'IDOR·권한 상승·관리 기능 노출을 찾습니다.', '모든 요청에서 서버 측 객체·기능 권한을 검증합니다.'],
    ['accountability', '책임추적', '누가 언제 어떤 자원에 어떤 행동을 했는지 증거로 남기는 성질입니다.', '사고 조사와 부인 방지, 통제 개선에 필요합니다.', '로그 공백과 공용 계정을 이용해 행위자를 숨깁니다.', '고유 계정, 시간 동기화, 무결성 보호 로그를 운영합니다.'],
    ['rbac-abac', 'RBAC·ABAC', '역할 또는 주체·자원·환경 속성으로 접근 결정을 표현하는 모델입니다.', '복잡한 조직 권한을 일관되게 관리합니다.', '역할 누적과 잘못된 속성 신뢰를 노립니다.', '정책 테스트, 최소 역할, 속성 출처 검증을 적용합니다.'],
    ['least-privilege', '최소 권한·직무 분리', '업무에 필요한 최소 권한만 주고 중요한 작업을 한 사람에게 집중하지 않습니다.', '계정 침해와 내부 오용의 영향 범위를 줄입니다.', '장기간 누적된 권한과 승인·실행 겸직을 찾습니다.', '정기 재검토, 임시 권한, 이중 승인, JIT 접근을 적용합니다.'],
  ]),
  branch('malware', '악성코드', '시스템에 원치 않는 행위를 수행하는 코드의 유형·분석·탐지를 다룹니다.', ['악성코드 분석가', 'Threat Researcher', 'SOC 분석가', 'DFIR 분석가'], [8, 11, 12, 13], [
    ['malware-types', 'Virus·Worm·Trojan', '감염·자가 확산·정상 프로그램 위장 등 전파와 실행 특성이 다른 악성코드 유형입니다.', '초기 분류는 확산 차단과 증거 수집 순서를 정합니다.', '사용자 실행, 취약 서비스, 신뢰된 프로그램 위장을 이용합니다.', '패치, 애플리케이션 제어, 메일·웹 방어, 네트워크 분리를 적용합니다.'],
    ['ransomware', 'Ransomware', '데이터나 시스템 가용성을 제한하고 금전을 요구하는 악성 행위입니다.', '운영 중단과 데이터 유출이 함께 발생할 수 있습니다.', '백업·관리 계정·원격 접속과 내부 이동 경로를 노립니다.', '격리된 백업, MFA, EDR, 세그먼테이션, 복구 훈련을 적용합니다.'],
    ['rootkit', 'Rootkit', '악성 행위와 지속성을 숨기기 위해 시스템의 관찰 결과를 변조하는 도구·기법입니다.', '일반 도구의 출력만 믿기 어려운 상황을 만듭니다.', '커널·부트·관리 도구를 변조해 존재를 숨깁니다.', 'Secure Boot, 무결성 검증, 오프라인 분석을 활용합니다.'],
    ['static-analysis', '정적 분석', '실행하지 않고 파일 구조·문자열·코드·메타데이터를 분석합니다.', '초기 위험을 줄이며 기능 가설과 IOC 후보를 얻습니다.', '패킹·난독화로 분석을 방해합니다.', '해시·헤더·Imports·Disassembly를 교차 확인합니다.'],
    ['dynamic-analysis', '동적 분석', '격리 환경에서 실행 행동, 파일·레지스트리·프로세스·네트워크 변화를 관찰합니다.', '실제 행위와 조건부 동작을 확인합니다.', '샌드박스 탐지와 시간 지연으로 행동을 숨깁니다.', '격리, 스냅샷, 행위 로깅, 다양한 실행 조건을 사용합니다.'],
    ['malware-detection', '시그니처·휴리스틱·행위 탐지', '알려진 패턴, 의심 특성, 실행 행동을 조합해 악성 가능성을 판단합니다.', '한 방식의 회피를 다른 신호로 보완합니다.', '문자열·해시 변경과 정상 도구 악용으로 탐지를 피합니다.', '다중 신호 상관분석, 룰 튜닝, Threat Hunting을 적용합니다.'],
  ]),
  branch('offensive', '취약점 진단·모의침투', '허가된 범위에서 약점을 재현하고 실제 영향과 수정 우선순위를 증명합니다.', ['취약점 분석가', '모의해킹 전문가', 'Red Team', '버그바운티 연구자'], [0, 2, 3, 4, 5, 6, 10, 11, 14, 15, 16], [
    ['scope-roe', 'Scope·Rules of Engagement', '대상·시간·기법·금지 행동·연락·데이터 처리 기준을 정한 테스트 경계입니다.', '합법성과 운영 안전을 보장하는 가장 먼저 확인할 조건입니다.', '범위 안의 자산과 허용 기법만 사용합니다.', '자산 목록, 비상 중단, 증거 보관과 종료 조건을 합의합니다.'],
    ['vulnerability-assessment', '취약점 진단', '자산의 알려진·구성·구현 약점을 체계적으로 식별하고 검증합니다.', '넓은 범위의 개선 항목과 우선순위를 제공합니다.', '공격 표면과 약한 통제를 조건별로 검증합니다.', '오탐 제거, 영향 확인, 구체적인 수정과 재점검을 수행합니다.'],
    ['penetration-test', '모의침투', '현실적인 공격 경로로 여러 약점이 연결될 때의 목표 영향까지 검증합니다.', '개별 취약점 목록보다 실제 방어 효과와 경로를 평가합니다.', '초기 진입부터 권한·내부 이동·목표 접근을 제한된 범위에서 재현합니다.', '탐지·대응과 함께 검증하고 최소 영향 원칙을 지킵니다.'],
    ['reproduction', '재현·PoC', '동일 조건에서 관찰 가능한 결과를 반복해 취약점 주장을 증명합니다.', '보고서의 신뢰성과 수정 검증 가능성을 만듭니다.', '필요한 최소 행동으로 취약 상태를 확인합니다.', '환경·요청·결과를 기록하고 민감정보를 마스킹합니다.'],
    ['impact-remediation', '영향·개선안·재시험', '기술 결과를 사용자·사업 영향과 연결하고 근본 원인 수정 후 다시 검증합니다.', '발견을 실제 위험 감소로 연결합니다.', '권한·노출 범위·사용자 상호작용에 따라 영향 확대 조건을 확인합니다.', '컨텍스트에 맞는 코드·설정 수정과 회귀 테스트를 제안합니다.'],
  ]),
  branch('operations', '침해사고 대응·보안 운영', '로그와 경보를 지속적으로 관찰하고 침해를 분류·제한·복구합니다.', ['SOC 분석가', 'Detection Engineer', 'CERT/CSIRT', 'Incident Responder', 'Threat Hunter'], [2, 3, 12, 13, 15], [
    ['monitoring', '모니터링·로그 분석', '시스템·애플리케이션·네트워크 활동을 수집해 정상 기준과 이상을 관찰합니다.', '사고 전후의 가시성과 재현 가능한 증거를 제공합니다.', '로깅되지 않는 경로와 로그 삭제를 노립니다.', '중앙 수집, 시간 동기화, 무결성, 보존 정책을 적용합니다.'],
    ['triage', '탐지·Triage', '경보의 사실 여부·심각도·범위를 빠르게 판단해 대응 순서를 정합니다.', '제한된 인력으로 중요한 사고를 놓치지 않게 합니다.', '낮은 신호로 분산하거나 오탐에 숨으려 합니다.', '컨텍스트 보강, 우선순위 기준, 에스컬레이션 절차를 운영합니다.'],
    ['containment', '격리·제거·복구', '피해 확산을 제한하고 원인을 제거한 뒤 안전한 상태로 서비스를 복구합니다.', '사고의 실제 피해와 중단 시간을 줄입니다.', '지속성·백도어·자격 증명으로 재진입을 시도합니다.', '단기·장기 격리, 자격 증명 교체, 깨끗한 복구와 모니터링을 수행합니다.'],
    ['siem-soar', 'SIEM·SOAR', '다양한 로그를 검색·상관분석하고 반복 대응 절차를 자동화합니다.', '대규모 환경의 탐지와 대응 일관성을 높입니다.', '수집 공백과 과도한 자동화 권한을 노립니다.', '데이터 품질, 룰 검증, 승인 경계와 실패 처리를 설계합니다.'],
    ['edr', 'EDR', 'Endpoint의 프로세스·파일·네트워크 행위를 수집하고 탐지·조사·대응합니다.', '호스트에서 공격 흐름과 원인을 자세히 볼 수 있습니다.', '센서 우회와 신뢰된 도구 악용을 시도합니다.', 'Tamper protection, 행위 룰, 격리 절차와 조사 역량을 운영합니다.'],
    ['detection-engineering', '탐지 규칙·튜닝', '공격 가설을 로그 조건과 테스트 가능한 탐지 규칙으로 구현합니다.', '위협 정보를 환경에서 실제로 찾을 수 있게 합니다.', '필드 변형·정상 도구·저빈도 행위로 규칙을 피합니다.', '공격 시뮬레이션, 오탐 분석, 커버리지와 버전 관리를 수행합니다.'],
  ]),
  branch('forensics', '디지털 포렌식', '디지털 증거를 식별·보존·분석해 사건의 사실관계와 시간 순서를 재구성합니다.', ['디지털 포렌식 전문가', '침해사고 분석가', '수사관', 'eDiscovery 분석가'], [1, 2, 8, 12, 13], [
    ['evidence-preservation', '증거 보존', '원본 상태를 바꾸지 않도록 수집 절차와 접근을 통제합니다.', '분석 결과의 신뢰성과 법적·내부 절차 적합성을 지킵니다.', '증거 삭제·시간 변경·로그 변조를 시도합니다.', '쓰기 방지, 원본 보존, 작업 사본, 상세 수집 기록을 사용합니다.'],
    ['integrity-hash', '무결성 해시', '수집 시점과 분석 이후의 데이터가 동일한지 해시로 확인합니다.', '증거가 분석 과정에서 변경되지 않았음을 검증합니다.', '해시 기록 누락과 약한 알고리즘 사용을 악용합니다.', '적절한 해시와 수집·이관 단계별 검증을 기록합니다.'],
    ['chain-custody', 'Chain of Custody', '증거를 누가 언제 수집·보관·이관·분석했는지 연속적으로 기록합니다.', '증거의 출처와 통제 상태를 설명합니다.', '관리 공백과 식별 불가능한 복사본을 문제 삼을 수 있습니다.', '고유 ID, 봉인·보관, 인수인계 기록을 유지합니다.'],
    ['disk-memory', '컴퓨터·메모리 포렌식', '파일 시스템과 휘발성 메모리에서 파일·프로세스·연결·자격 증명 흔적을 분석합니다.', '삭제 파일과 실행 중 상태를 함께 재구성합니다.', '암호화·메모리 상주·흔적 삭제로 분석을 어렵게 합니다.', '라이브 대응 우선순위와 오프라인 이미징을 사건에 맞게 선택합니다.'],
    ['network-forensics', '네트워크 포렌식', '패킷·Flow·DNS·Proxy 로그로 통신 대상과 시간·내용을 분석합니다.', '호스트 간 이동과 외부 통신을 재구성합니다.', '암호화·터널링·정상 서비스 악용으로 흔적을 숨깁니다.', '다양한 계층의 메타데이터와 Endpoint 증거를 상관분석합니다.'],
    ['timeline', '타임라인 분석', '서로 다른 증거의 시간을 정규화해 사건 순서와 인과관계를 구성합니다.', '최초 진입·지속성·확산·유출 시점을 설명합니다.', '시간 변경과 로그 공백으로 순서를 흐립니다.', '시간대·Clock skew·수집 지연을 기록하고 여러 출처를 교차 검증합니다.'],
  ]),
  branch('emerging', '콘텐츠·IoT·신규 영역', '소프트웨어 보안 원리를 산업별 자산·안전·규제 제약에 적용합니다.', ['IoT 보안 엔지니어', '클라우드 보안 엔지니어', 'AI Red Teamer', '콘텐츠 보안 연구원'], [12, 13, 15, 16], [
    ['content-security', 'DRM·Watermarking', '콘텐츠의 사용 권한을 제어하고 출처·유출 경로를 식별하는 기술입니다.', '디지털 콘텐츠의 권리와 유통 추적을 지원합니다.', '클라이언트 키와 신뢰 경계를 분석해 우회를 시도합니다.', '서버 권한 검증, 키 보호, 추적 정보와 법적 통제를 함께 적용합니다.'],
    ['iot', 'IoT·Embedded Security', '제한된 장치의 펌웨어·통신·업데이트·물리 접근을 보호합니다.', '장기간 운영되는 대규모 장치의 안전과 개인정보에 연결됩니다.', '기본 자격 증명, 노출된 디버그 포트, 서명 없는 업데이트를 노립니다.', 'Secure Boot, 서명 업데이트, 장치별 키, 최소 서비스를 적용합니다.'],
    ['cloud', 'Cloud Security', '공급자와 고객의 공유 책임 아래 IAM·네트워크·데이터·워크로드 설정을 보호합니다.', 'API와 자동화로 빠르게 변하는 인프라의 경계를 관리합니다.', '과도한 IAM, 공개 저장소, 메타데이터와 비밀 노출을 찾습니다.', '최소 권한, 가드레일, 암호화, 로깅, IaC 검사를 적용합니다.'],
    ['ai-security', 'AI Security', '모델·데이터·프롬프트·도구 연결·권한의 공격 표면을 평가합니다.', 'AI 기능이 기존 시스템과 데이터에 새로운 자동화 경로를 만듭니다.', 'Prompt Injection, 데이터 노출, 과도한 Tool 권한을 노립니다.', '신뢰 경계, 최소 도구 권한, 출력 검증, 모니터링과 평가를 적용합니다.'],
    ['physical', '물리 보안', '시설·장비·매체에 대한 물리적 접근과 환경 위험을 통제합니다.', '논리 보안이 전제로 삼는 장비와 네트워크의 실제 경계를 보호합니다.', '무단 출입, 장비 탈취, 포트 접근과 환경 장애를 노립니다.', '출입 통제, 감시, 자산 관리, 이중화와 안전 절차를 적용합니다.'],
  ]),
  branch('roles', '보안 직무 지도', '기술 분야를 회사에서 반복적으로 맡는 책임과 결과물로 연결합니다.', ['보안 입문자', '채용 준비자', '교육 운영자'], [0], [
    ['role-offensive', 'Offensive·Red Team', '허가된 범위에서 공격자 관점으로 약점과 공격 경로를 검증합니다.', '실제 영향과 방어 공백을 구체적인 증거로 보여줍니다.', '모의해킹, 취약점 연구, 버그바운티 업무를 수행합니다.', 'PoC, 영향 분석, 수정 권고, 재시험 결과를 남깁니다.'],
    ['role-defensive', 'Defensive·Blue Team', '공격을 예방·탐지·분석·대응·복구하는 운영 직무군입니다.', '서비스를 지속적으로 보호하고 사고 피해를 제한합니다.', 'SOC, Detection, CERT, IR, Threat Hunting 업무를 수행합니다.', '탐지 규칙, 사고 타임라인, 대응 플레이북을 남깁니다.'],
    ['role-engineering', 'Security Engineering', '보안 요구를 제품·아키텍처·클라우드·자동화 코드로 구현합니다.', '안전한 기본값과 반복 가능한 통제를 제품에 내장합니다.', 'AppSec, Product Security, Cloud Security, 보안제품 개발 업무를 수행합니다.', '위협 모델, 보안 설계, CI/CD 가드레일을 남깁니다.'],
    ['role-governance', 'Governance·Consulting', '위험·규정·정책·감사와 개선 계획을 조직 운영으로 연결합니다.', '사업 우선순위와 기술 통제를 조정합니다.', 'GRC, 개인정보, 감사, 정보보호 기획 업무를 수행합니다.', '정책, 위험평가, 인증 증적, 개선 로드맵을 남깁니다.'],
    ['role-specialist', '분석 전문 직무', '악성코드·포렌식·암호·위협정보처럼 깊은 분석 역량을 중심으로 일합니다.', '복잡한 원인과 새로운 공격을 조사해 조직의 지식을 확장합니다.', '코드·증거·프로토콜의 세부 구조를 분석합니다.', '분석 보고서, IOC, 도구, 연구 결과를 남깁니다.'],
  ]),
  branch('industry', '산업 보안', '같은 보안 원리를 산업별 자산·운영 제약·안전 영향에 맞게 적용합니다.', ['OT 보안 엔지니어', '자동차 보안 엔지니어', '선박·우주 보안 연구원', '의료기기 보안 전문가'], [0, 13, 15], [
    ['ot-ics', 'OT·ICS', 'PLC·HMI·SCADA와 생산 공정을 보호하는 분야입니다.', '사이버 사고가 물리 공정과 사람의 안전에 영향을 줄 수 있습니다.', '오래된 프로토콜, 평면 네트워크, 원격 유지보수 경로를 노립니다.', '가용성과 안전을 우선해 분리·가시성·변경 관리·복구를 적용합니다.'],
    ['automotive', '자동차·모빌리티', 'ECU·CAN·차량 앱·무선 업데이트·충전 인프라를 보호합니다.', '차량 수명주기와 기능 안전, 대규모 Fleet가 연결됩니다.', '외부 인터페이스에서 내부 차량 네트워크로 이어지는 경로를 찾습니다.', 'Secure Update, ECU 격리, 키 관리, 차량 보안 모니터링을 적용합니다.'],
    ['maritime', '선박·해양', '항해·기관 제어·위성 통신·항만 시스템을 보호합니다.', '연결 제약과 오래된 장비 속에서 운항 안전과 복구를 보장해야 합니다.', '원격 접속, 혼합 IT/OT망, 위치·항법 신호를 노립니다.', '망 분리, 안전 모드, 원격 접근 통제, 선상 대응 절차를 운영합니다.'],
    ['space', '우주·항공', '위성·지상국·관제·비행 소프트웨어와 공급망을 보호합니다.', '원격 복구가 어렵고 임무 지속성과 안전 영향이 큽니다.', '통신 링크, 지상 시스템, 업데이트와 공급망을 노립니다.', '강한 인증, 명령 검증, 이중화, Secure Boot와 장기 키 관리를 적용합니다.'],
    ['medical', '의료·헬스케어', '의료기기·PACS·EMR·환자 데이터와 병원 운영을 보호합니다.', '개인정보와 환자 안전, 장비 가용성을 동시에 다룹니다.', '오래된 장비, 공유 계정, 의료망 연결과 데이터 흐름을 노립니다.', '자산 가시성, 분리, 안전한 업데이트, 비상 운영을 적용합니다.'],
    ['finance', '금융·핀테크', '결제·인증·금융 API·이상거래와 고객 데이터를 보호합니다.', '거래 무결성·사기 방지·고가용성과 규제가 중요합니다.', '계정 탈취, API 인가, 거래 조작과 공급망을 노립니다.', '강한 인증, 거래 검증, Fraud Detection, 감사 로그를 적용합니다.'],
    ['energy-telecom', '에너지·통신', '발전·송배전과 통신 코어망 같은 국가 기반시설을 보호합니다.', '대규모 서비스 연속성과 연쇄 영향이 큽니다.', '관리망, 원격 제어, DDoS와 공급망을 노립니다.', '세그먼테이션, 이중화, 실시간 모니터링, 위기 대응을 적용합니다.'],
  ]),
]

export const allMindmapNodes = mindmapBranches.flatMap((item) => item.nodes)

export const mindmapReferences = [
  { title: '보안 분야 마인드맵 원본 참고 1', image: '/reference/week0_mindmap_security_domains.png' },
  { title: '정보보안 마인드맵 원본 참고 2', image: '/reference/week0_mindmap_information_security.png' },
  { title: '보안 전문가 마인드맵 원본 참고 3', image: '/reference/week0_mindmap_security_expert.png' },
  { title: '보안 직무 마인드맵 원본 참고 4', image: '/reference/week0_mindmap_security_roles.png' },
  { title: '컴퓨터 시스템 마인드맵 원본 참고 5', image: '/reference/week0_mindmap_computer_system.png' },
]

export const careerLanes = [
  { id: 'governance', label: 'Governance', title: '기준과 위험을 관리', description: '법·인증·정책을 실제 업무 절차로 바꾸고 경영진이 위험을 판단할 근거를 만듭니다.', roles: ['정보보호 기획', 'CISO', 'GRC', '개인정보', '감사'], outputs: ['정책', '위험평가', '감사 증적', '개선 계획'] },
  { id: 'engineering', label: 'Security Engineering', title: '안전한 제품과 기반을 구현', description: '코드·아키텍처·클라우드 설정·보안 제품과 자동화에 통제를 내장합니다.', roles: ['AppSec', 'Product Security', 'Cloud Security', 'IAM', '보안 개발'], outputs: ['위협 모델', '보안 설계', '가드레일', '운영 자동화'] },
  { id: 'defensive', label: 'Defensive · Blue Team', title: '탐지하고 대응하고 복구', description: '경보와 로그를 분석해 침해를 제한하고 원인과 재발 방지책을 남깁니다.', roles: ['SOC', 'Detection', 'CERT', 'IR', 'Threat Hunting', 'DFIR'], outputs: ['탐지 룰', '사고 타임라인', 'IOC', '플레이북'] },
  { id: 'offensive', label: 'Offensive · Red Team', title: '공격자 관점으로 검증', description: '허가된 범위에서 공격 경로와 실제 영향을 재현하고 수정 우선순위를 제안합니다.', roles: ['모의해킹', 'Red Team', '취약점 연구', '버그바운티'], outputs: ['PoC', '공격 경로', '영향 분석', '재시험'] },
]

export const industryRows = [
  ['OT·ICS', 'PLC·HMI·SCADA·생산망', '가용성과 물리 안전, 제한적인 패치'],
  ['자동차', 'CAN·ECU·차량 앱·충전', '긴 수명주기와 기능 안전'],
  ['선박·해양', '항해·기관 제어·위성 통신', '해상 연결 제약과 운항 안전'],
  ['우주·항공', '위성·지상국·관제·비행 SW', '원격 복구 제약과 임무 지속성'],
  ['의료', '의료기기·PACS·EMR', '환자 안전·개인정보·가용성'],
  ['금융', '결제·인증·금융 API', '거래 무결성·사기·규제'],
  ['에너지', '발전·송배전·스마트미터', '기반시설 연속성과 연쇄 영향'],
  ['통신·5G', '코어망·기지국·가입자 시스템', '대규모 가용성과 통신 데이터'],
  ['IoT', '펌웨어·센서·게이트웨이', '업데이트·기본 자격 증명·물리 접근'],
  ['공급망', '오픈소스·빌드·업데이트·협력사', '신뢰된 배포 경로의 악용'],
]

/** @typedef {'jobFamily' | 'role' | 'concept' | 'technology' | 'standard' | 'threat' | 'control' | 'industry'} MindmapNodeKind */

export const MINDMAP_NODE_KINDS = Object.freeze([
  'jobFamily', 'role', 'concept', 'technology', 'standard', 'threat', 'control', 'industry',
])

export const MINDMAP_EDGE_KIND_RULES = Object.freeze({
  containsRole: [['jobFamily', 'role']],
  requiresFoundation: [['role', 'concept']],
  developsSkill: [['role', 'concept']],
  usesTechnology: [['role', 'technology']],
  usesStandard: [['role', 'standard']],
  prerequisiteFor: [['concept', 'concept']],
  mitigates: [['control', 'threat']],
  worksInIndustry: [['role', 'industry']],
})

const NOT_A_DATED_VACANCY = '2026 정보보호 취업박람회 참가기업 프로필이며, 게시일과 마감일이 있는 개별 채용공고가 아닙니다.'

export const jobSources = [
  {
    id: 'source-kisa-career-guide', sourceType: 'careerGuide', sourceCategory: 'occupationalStandard',
    organization: '한국인터넷진흥원 KISA 아카데미', company: null, title: '사이버보안 직무 소개', region: null,
    publishedDate: null, closingDate: null, checkedDate: '2026-07-11',
    url: 'https://academy.kisa.or.kr/cont/job/jobGuide.do', activeStatus: 'notApplicable',
    verificationStatus: 'verified', isIndividualVacancy: false,
    coveredRoleTitles: ['정보보호 기획자', '정보보안 책임자(CISO)', '정보보호 연구원/개발자', '정보보안 엔지니어', '보안 관제·사고대응', '침해사고 분석가', '취약점 분석가/모의해킹', '디지털 포렌식', '정보보안 컨설턴트'],
    note: '직업 분류와 업무 이해를 위한 공식 진로 가이드이며 현재 채용공고가 아닙니다.',
  },
  {
    id: 'source-kisia-fair-notice-2026', sourceType: 'eventNotice', organization: '한국정보보호산업협회',
    company: null, title: '2026 정보보호 취업박람회 개최 안내', region: '서울', publishedDate: '2026-04-28',
    closingDate: null, eventDate: '2026-05-27', checkedDate: '2026-07-11',
    url: 'https://www.kisia.or.kr/announcement/association/816/', activeStatus: 'notApplicable',
    verificationStatus: 'verified', isIndividualVacancy: false, note: '박람회 일정 공지이며 개별 채용공고가 아닙니다.',
  },
  {
    id: 'source-kisia-exhibitor-2', sourceType: 'fairExhibitorProfile', organization: '한국정보보호산업협회',
    company: 'SK쉴더스', title: '2026 정보보호 취업박람회 참가기업 프로필: SK쉴더스', region: null,
    publishedDate: '2026-04-27', closingDate: null, checkedDate: '2026-07-11',
    url: 'https://jobfair.kisia.or.kr/modules/board/bd_view.html?id=exhibitor&no=2', activeStatus: 'unknown',
    verificationStatus: 'verifiedProfile', isIndividualVacancy: false, eventSourceId: 'source-kisia-fair-notice-2026',
    profileCategories: ['정보보안관제', '취약점진단', '모의해킹', '정보보안 컨설팅', '보안구축/운영', 'Cloud보안'],
    recruitingPlanLabel: '상시 채용계획', note: NOT_A_DATED_VACANCY,
    archivedAsset: { type: 'screenshot', path: '/job-postings/kisia-company-2.png' },
  },
  {
    id: 'source-kisia-exhibitor-3', sourceType: 'fairExhibitorProfile', organization: '한국정보보호산업협회',
    company: '글로벌에잇', title: '2026 정보보호 취업박람회 참가기업 프로필: 글로벌에잇', region: null,
    publishedDate: '2026-04-27', closingDate: null, checkedDate: '2026-07-11',
    url: 'https://jobfair.kisia.or.kr/modules/board/bd_view.html?id=exhibitor&no=3', activeStatus: 'unknown',
    verificationStatus: 'verifiedProfile', isIndividualVacancy: false, eventSourceId: 'source-kisia-fair-notice-2026',
    profileCategories: ['보안컨설팅', '보안솔루션개발', '보안교육기획', '사업영업'],
    recruitingPlanLabel: '상시 채용계획', note: NOT_A_DATED_VACANCY,
    archivedAsset: { type: 'screenshot', path: '/job-postings/kisia-global8.png' },
  },
  {
    id: 'source-kisia-exhibitor-4', sourceType: 'fairExhibitorProfile', organization: '한국정보보호산업협회',
    company: '넷맨', title: '2026 정보보호 취업박람회 참가기업 프로필: 넷맨', region: null,
    publishedDate: '2026-04-27', closingDate: null, checkedDate: '2026-07-11',
    url: 'https://jobfair.kisia.or.kr/modules/board/bd_view.html?id=exhibitor&no=4', activeStatus: 'unknown',
    verificationStatus: 'verifiedProfile', isIndividualVacancy: false, eventSourceId: 'source-kisia-fair-notice-2026',
    profileCategories: ['연구개발', '기술지원'], requirements: ['네트워크', 'DB', 'Linux'],
    recruitingPlanLabel: '상시 채용계획', note: NOT_A_DATED_VACANCY,
    archivedAsset: { type: 'screenshot', path: '/job-postings/kisia-company-4.png' },
  },
  {
    id: 'source-crypto-vacancy-audit-2026-07-11', sourceType: 'verificationNote', organization: 'SecTrack source audit',
    company: null, title: '암호·PKI 현재 채용공고 확인 상태', region: null, publishedDate: null, closingDate: null,
    checkedDate: '2026-07-11', url: null, activeStatus: 'unknown', verificationStatus: 'unavailable',
    isIndividualVacancy: false, note: '검증 가능한 현재 암호·PKI 개별 채용공고를 확보하지 못했습니다. 현재 공고가 있다는 근거로 사용하지 않습니다.',
  },
]

const legacyKind = (node) => {
  if (['sqli', 'xss', 'csrf', 'ransomware', 'rootkit'].includes(node.id)) return 'threat'
  if (['permission', 'firewall', 'ids-ips', 'least-privilege', 'monitoring', 'containment'].includes(node.id)) return 'control'
  if (['pki', 'tls', 'siem-soar', 'edr', 'cloud'].includes(node.id)) return 'technology'
  if (node.id === 'iso27001') return 'standard'
  if (node.category === '산업 보안' || node.id === 'iot') return 'industry'
  return 'concept'
}

const legacyNodeByTitle = new Map(allMindmapNodes.map((node) => [node.label, node]))

const canonicalizeLegacyNode = (node) => {
  const kind = legacyKind(node)
  const common = {
    id: node.id, kind, title: node.label, summary: node.importance,
    relatedWeekIds: [...node.relatedWeeks], sourceRefs: [],
  }
  if (kind === 'threat') return {
    ...common, conditions: node.prerequisites.length ? [...node.prerequisites] : ['취약한 입력·신뢰 경계 또는 실행 조건이 존재함'],
    attackFlow: [node.offensiveExample], impact: [node.importance], detectionSignals: ['관련 입력, 실행, 오류와 상태 변화를 함께 확인'],
    mitigationControlIds: [], mitigations: [node.defensiveExample], safePractice: ['로컬 또는 명시적으로 허가된 실습 환경에서만 고정된 예제로 재현'],
  }
  if (kind === 'control') return {
    ...common, protectedAssets: [node.importance], placements: [node.category], mechanism: node.definition,
    operations: [node.defensiveExample], limitations: [node.offensiveExample], verificationMethods: ['정책·로그·테스트 결과를 교차 확인'],
    conceptIds: [], roleIds: [], threatIds: [],
  }
  if (kind === 'technology') return {
    ...common, purpose: node.definition, scenarios: [node.importance], componentsAndFlow: [node.definition], conceptIds: [],
    roleIds: [], operationalCautions: [node.defensiveExample], adjacentTechnologyIds: [],
  }
  if (kind === 'standard') return {
    ...common, purpose: node.definition, scope: node.importance, keyRequirements: [node.defensiveExample],
    roleIds: [], organizationFlow: ['적용범위 결정 → 요구사항 이행 → 증적 검토 → 개선'], conceptIds: [],
  }
  if (kind === 'industry') return {
    ...common, assets: [`${node.label} 관련 서비스·장치·데이터`], operationalConstraints: [node.importance],
    roleIds: [], conceptIds: [],
  }
  const prerequisiteConceptIds = node.prerequisites.map((title) => legacyNodeByTitle.get(title)).filter((item) => item && legacyKind(item) === 'concept').map((item) => item.id)
  return {
    ...common, definition: node.definition, practicalUses: [node.importance], roleIds: [], prerequisiteConceptIds,
    subConceptIds: [], learningChecklist: [`${node.label}의 정의와 적용 경계를 설명한다.`, `${node.label}이 필요한 실제 업무를 한 가지 연결한다.`],
    technologyIds: [], standardIds: [], implementationCautions: [], commonMisconceptions: [], connectedPracticeIds: [],
  }
}

const canonicalLegacyNodes = allMindmapNodes.filter((node) => !node.id.startsWith('role-')).map(canonicalizeLegacyNode)

const technologyNode = (id, title, purpose, relatedWeekIds, conceptIds = []) => ({
  id, kind: 'technology', title, summary: purpose, relatedWeekIds, sourceRefs: [], purpose,
  scenarios: [purpose], componentsAndFlow: ['입력과 정책을 받아 처리하고 결과와 운영 로그를 남깁니다.'],
  conceptIds, roleIds: [], operationalCautions: ['권한·비밀정보·로그 보존 범위를 운영 환경에 맞게 검토합니다.'], adjacentTechnologyIds: [],
})

const standardNode = (id, title, purpose, scope, relatedWeekIds, conceptIds = []) => ({
  id, kind: 'standard', title, summary: purpose, relatedWeekIds, sourceRefs: [], purpose, scope,
  keyRequirements: ['적용범위와 책임을 정하고 구현·운영 증적을 유지합니다.'], roleIds: [],
  organizationFlow: ['요구사항 해석 → 담당자 지정 → 구현·운영 → 검토·개선'], conceptIds,
})

const controlNode = (id, title, summary, threatIds) => ({
  id, kind: 'control', title, summary, relatedWeekIds: [3, 4], sourceRefs: [], protectedAssets: ['애플리케이션 데이터와 사용자 세션'],
  placements: ['입력 경계와 출력 컨텍스트'], mechanism: summary, operations: ['코드 리뷰와 자동·수동 테스트로 적용 상태를 유지합니다.'],
  limitations: ['컨텍스트를 잘못 식별하면 통제가 우회될 수 있습니다.'], verificationMethods: ['고정된 안전 입력으로 처리 전후 결과를 비교합니다.'],
  conceptIds: ['input-output'], roleIds: [], threatIds,
})

const supportingNodes = [
  technologyNode('tech-grc-register', 'GRC 위험·증적 관리 도구', '위험, 통제, 담당자와 감사 증적을 추적합니다.', [0, 15], ['risk-management']),
  technologyNode('tech-appsec-toolchain', 'SAST·DAST·SCA·프록시 도구', '코드, 실행 중 애플리케이션과 의존성의 보안 결함을 검토합니다.', [4, 5, 6, 14], ['secure-coding', 'vulnerability-assessment']),
  technologyNode('tech-dfir-toolchain', '디스크·메모리·네트워크 포렌식 도구', '보존된 증거에서 타임라인과 침해 범위를 분석합니다.', [12, 13], ['evidence-preservation', 'timeline']),
  technologyNode('tech-reverse-toolchain', '디스어셈블러·디버거·샌드박스', '실행 파일의 코드와 격리된 실행 행동을 분석합니다.', [8, 11, 12], ['static-analysis', 'dynamic-analysis']),
  technologyNode('tech-network-platform', '방화벽·NAC·네트워크 관리 플랫폼', '네트워크 연결 정책과 자산 상태를 운영합니다.', [2, 13], ['tcpip', 'dns']),
  technologyNode('tech-hsm-kms', 'HSM·KMS·Secrets 플랫폼', '키 생성·보호·사용·회전과 비밀정보 접근을 중앙에서 통제합니다.', [12, 15], ['symmetric', 'asymmetric']),
  technologyNode('tech-embedded-toolchain', '펌웨어·버스·임베디드 분석 도구', '펌웨어와 장치 통신, 업데이트 경로를 안전하게 분석합니다.', [7, 8, 13], ['cpu', 'memory']),
  technologyNode('tech-ai-evaluation', 'AI 보안 평가 하네스', '모델·데이터·에이전트 경계의 안전성 평가를 반복 실행하고 기록합니다.', [16], ['ai-security']),
  standardNode('standard-isms-p', 'ISMS-P', '정보보호 및 개인정보보호 관리체계의 국내 인증 기준입니다.', '조직의 관리체계와 개인정보 처리 단계', [0, 15], ['risk-management', 'privacy']),
  standardNode('standard-owasp', 'OWASP ASVS·WSTG', '애플리케이션 보안 요구사항과 검증 활동을 구조화합니다.', '웹 애플리케이션 설계와 보안 테스트', [3, 4, 5, 6], ['secure-coding', 'vulnerability-assessment']),
  standardNode('standard-mitre-attack', 'MITRE ATT&CK', '공격자 행동을 전술과 기법으로 정리해 탐지·헌팅 가설을 연결합니다.', '엔터프라이즈 탐지와 위협 분석', [12, 13], ['detection-engineering']),
  standardNode('standard-nist-ir', 'NIST SP 800-61', '침해사고 준비·탐지·대응·복구 흐름을 구조화합니다.', '조직의 사고대응 수명주기', [12, 13], ['triage', 'evidence-preservation']),
  standardNode('standard-x509-pkcs', 'X.509·PKCS 인터페이스', '인증서 구조와 암호키·토큰 인터페이스의 상호운용 기준입니다.', 'PKI, 인증서, HSM 연동', [12], ['asymmetric', 'signature']),
  standardNode('standard-fips-kcmvp', 'FIPS 140-3·KCMVP', '암호모듈의 보안 요구사항과 시험·검증 근거를 정의합니다.', '암호모듈 시험·검증·인증 대응', [12], ['symmetric', 'hash']),
  standardNode('standard-iec-62443', 'IEC 62443', '산업자동화·제어시스템 보안 요구사항을 수명주기와 구역·통신 경로에 적용합니다.', 'OT·ICS 시스템과 제품', [13, 15], ['tcpip']),
  standardNode('standard-iso-sae-21434', 'ISO/SAE 21434', '자동차 사이버보안 위험 관리를 차량 수명주기에 적용합니다.', '차량 E/E 시스템과 공급망', [13, 15], ['risk-management']),
  standardNode('standard-nist-ai-rmf', 'NIST AI RMF', 'AI 위험을 식별·측정·관리·거버넌스 활동에 연결합니다.', 'AI 시스템 수명주기', [16], ['ai-security', 'risk-management']),
  controlNode('control-context-safe-handling', '컨텍스트별 안전한 입력·출력 처리', '입력 검증, 매개변수화, 컨텍스트 인코딩과 안전한 DOM API를 구분해 적용합니다.', ['sqli', 'xss']),
]

export const cryptoRoleAreas = [
  '암호 알고리즘 연구·개발',
  '암호 구현·보안 라이브러리 개발',
  'PKI·인증서 플랫폼 엔지니어링',
  'TLS·VPN·보안 프로토콜 엔지니어링',
  'HSM·KMS·Secrets 엔지니어링',
  '클라우드 암호 적용 엔지니어링',
  '제품·서비스 암호 적용·Product Security',
  '암호 모듈 시험·검증·인증 대응',
  'PQC 전환·Crypto Agility',
].map((title, index) => ({
  id: `crypto-area-${String(index + 1).padStart(2, '0')}`, title, roleId: 'role-crypto-pki',
  currentVacancyEvidence: 'unavailable', checkedDate: '2026-07-11',
  jobSourceIds: ['source-kisa-career-guide', 'source-crypto-vacancy-audit-2026-07-11'],
}))

const fourLearningStages = (foundation, core, practice, portfolio) => [
  { id: 'foundation', title: '기초', outcomes: [foundation] },
  { id: 'roleCore', title: '직무 핵심', outcomes: [core] },
  { id: 'practice', title: '실무 적용', outcomes: [practice] },
  { id: 'portfolio', title: '포트폴리오', outcomes: [portfolio] },
]

const roleNode = ({ jobSourceIds, ...role }) => ({
  kind: 'role', sourceRefs: [...jobSourceIds], sourceCheckedDate: '2026-07-11', jobSourceIds, ...role,
})

const roleNodes = [
  roleNode({
    id: 'role-grc-privacy', jobFamilyId: 'family-grc-privacy', title: '정보보호 기획·GRC·개인정보 담당자',
    summary: '사업 위험과 법·인증 요구를 정책, 통제, 책임과 증적으로 운영합니다.', relatedWeekIds: [0, 15],
    actualWork: ['자산·위험·법적 요구를 식별하고 처리 계획을 관리합니다.', '정책과 예외 승인 절차를 개정하고 통제 이행 증적을 검토합니다.', '개인정보 처리 수명주기와 감사·인증 개선 과제를 조정합니다.'],
    projectExample: '신규 서비스의 개인정보 흐름과 위험을 분석해 통제 담당자, 완료 기준과 경영진 승인 항목을 정합니다.',
    foundationConceptIds: ['governance-program', 'risk-management', 'privacy'], skillIds: ['security-policy', 'security-audit'],
    technologyIds: ['tech-grc-register'], standardIds: ['iso27001', 'standard-isms-p'],
    deliverables: ['정보보호 정책', '위험평가표', '개인정보 흐름도', '감사 증적과 개선 계획'],
    collaborators: ['서비스 책임자', '법무·개인정보 담당자', '보안 엔지니어', '내부감사와 경영진'],
    entryExpectations: ['위험과 통제의 차이를 설명', '근거가 남는 문서 작성', '요구사항과 실제 운영의 차이 확인'],
    preferredExperience: ['정책·위험평가 sample 작성', 'ISMS-P 또는 ISO 27001 요구사항 매핑'],
    learningStages: fourLearningStages('자산·위협·위험·통제를 구분합니다.', '관리체계와 개인정보 수명주기를 연결합니다.', '한 서비스의 위험·통제·증적을 추적합니다.', '위험평가와 개선 로드맵을 공개 가능한 sample로 정리합니다.'),
    portfolioExamples: ['가상 서비스 위험평가와 통제 매핑', '개인정보 처리 흐름·보유기간 점검표'],
    jobSourceIds: ['source-kisa-career-guide'], sourceStatus: 'career-guide-only', sourceStatusNote: '공식 진로 가이드 근거이며 현재 개별 공고 근거는 아닙니다.',
  }),
  roleNode({
    id: 'role-consulting-audit', jobFamilyId: 'family-consulting-audit', title: '보안 컨설턴트·감사 담당자',
    summary: '고객 환경의 기술·관리 통제를 근거로 평가하고 실행 가능한 개선안을 합의합니다.', relatedWeekIds: [0, 3, 15],
    actualWork: ['인터뷰·문서·설정 표본을 교차 검증합니다.', '요구사항 대비 gap과 위험도를 설명합니다.', '담당자·기한·검증 방법이 있는 개선 로드맵을 작성합니다.'],
    projectExample: '인증 범위의 계정·접근통제 운영을 표본 점검하고 발견사항의 원인과 개선 완료 조건을 합의합니다.',
    foundationConceptIds: ['risk-management', 'security-audit', 'security-consulting'], skillIds: ['security-policy', 'accountability'],
    technologyIds: ['tech-grc-register'], standardIds: ['iso27001', 'standard-isms-p'],
    deliverables: ['현황·gap 분석서', '인터뷰·표본 기록', '발견사항 목록', '개선 로드맵'], collaborators: ['고객 업무 담당자', '시스템 운영자', '개발팀', '법무·감사'],
    entryExpectations: ['질문과 관찰 결과를 구분', '요구사항을 실제 설정에 매핑', '간결한 finding 작성'], preferredExperience: ['가상 조직 gap 분석', '통제 표본 점검 체크리스트'],
    learningStages: fourLearningStages('관리·기술 통제와 감사 증적을 구분합니다.', '표본·인터뷰·문서를 교차 검증합니다.', '발견사항의 위험과 완료 기준을 합의합니다.', '범위·근거·우선순위가 있는 진단 보고서를 만듭니다.'),
    portfolioExamples: ['ISO 27001 gap 분석 sample', '계정 수명주기 통제 감사 기록'],
    jobSourceIds: ['source-kisa-career-guide', 'source-kisia-exhibitor-3'], sourceStatus: 'exhibitor-profile-not-vacancy', sourceStatusNote: NOT_A_DATED_VACANCY,
  }),
  roleNode({
    id: 'role-app-product-security', jobFamilyId: 'family-app-product-devsecops', title: 'AppSec·Product Security·DevSecOps 엔지니어',
    summary: '제품 수명주기에 보안 요구, 위협 모델, 코드·의존성 검사와 배포 가드레일을 넣습니다.', relatedWeekIds: [3, 4, 5, 6, 14, 15],
    actualWork: ['설계 변경의 자산·신뢰 경계와 오용 사례를 검토합니다.', '코드·의존성·실행 결과의 결함을 triage합니다.', '수정 가이드와 CI/CD 보안 가드레일을 개발팀과 운영합니다.'],
    projectExample: '인증 API의 위협 모델을 만들고 SAST·DAST 결과를 재현해 배포 전 차단 기준과 예외 절차를 설계합니다.',
    foundationConceptIds: ['secure-coding', 'sdlc', 'auth-session'], skillIds: ['input-output', 'impact-remediation'], technologyIds: ['tech-appsec-toolchain'],
    standardIds: ['standard-owasp'], deliverables: ['위협 모델', '보안 요구사항', '검사 triage 기록', '수정 가이드와 파이프라인 정책'],
    collaborators: ['제품 관리자', '개발자', 'SRE·플랫폼 팀', '개인정보·GRC'], entryExpectations: ['HTTP와 인증·인가 설명', '작은 코드 변경 리뷰', '도구 결과를 수동 재현'],
    preferredExperience: ['안전한 웹 애플리케이션 개발', 'CI에서 보안 검사 운영'], learningStages: fourLearningStages('HTTP·코드·배포 흐름을 익힙니다.', '위협 모델과 안전한 API를 적용합니다.', '도구 결과를 재현하고 수정과 예외를 운영합니다.', '보안 요구부터 재시험까지 한 변경을 기록합니다.'),
    portfolioExamples: ['인증 API 위협 모델과 수정 PR', 'SAST·SCA triage가 포함된 CI sample'],
    jobSourceIds: ['source-kisa-career-guide', 'source-kisia-exhibitor-3'], sourceStatus: 'exhibitor-profile-not-vacancy', sourceStatusNote: NOT_A_DATED_VACANCY,
  }),
  roleNode({
    id: 'role-vulnerability-redteam', jobFamilyId: 'family-vulnerability-redteam', title: '취약점 진단·모의침투·레드팀 담당자',
    summary: '허가된 범위에서 약점을 안전하게 재현하고 영향과 수정 우선순위를 보고합니다.', relatedWeekIds: [0, 3, 4, 5, 6, 10, 11, 14],
    actualWork: ['Scope와 금지 행동을 확인하고 테스트 계획을 세웁니다.', '웹·인프라·제품의 취약점을 최소 영향으로 검증합니다.', '재현 절차, 영향, 근본 원인과 재시험 결과를 문서화합니다.'],
    projectExample: '로컬 취약 애플리케이션에서 XSS 흐름을 확인하고 컨텍스트별 수정과 재시험 결과를 finding으로 작성합니다.',
    foundationConceptIds: ['scope-roe', 'vulnerability-assessment', 'reproduction'], skillIds: ['impact-remediation', 'input-output'],
    technologyIds: ['tech-appsec-toolchain'], standardIds: ['standard-owasp'], deliverables: ['테스트 계획', '재현 절차·PoC', '취약점 finding', '재시험 결과'],
    collaborators: ['시스템·제품 소유자', '개발자', 'SOC·IR', '법무·GRC'], entryExpectations: ['허가 범위를 최우선으로 확인', 'HTTP·Linux 기초 활용', '재현 가능한 보고서 작성'],
    preferredExperience: ['로컬 CTF·취약 앱 풀이 기록', '수정 전후 비교 보고서'], learningStages: fourLearningStages('HTTP·OS·네트워크와 안전 경계를 익힙니다.', '취약점 원인과 검증 절차를 학습합니다.', '영향을 최소화해 재현하고 수정안을 협의합니다.', '범위·PoC·수정·재시험이 있는 보고서를 만듭니다.'),
    portfolioExamples: ['로컬 웹 취약점 finding 묶음', '허가된 테스트의 공격 경로와 재시험 보고서'],
    jobSourceIds: ['source-kisa-career-guide', 'source-kisia-exhibitor-2'], sourceStatus: 'exhibitor-profile-not-vacancy', sourceStatusNote: NOT_A_DATED_VACANCY,
  }),
  roleNode({
    id: 'role-soc-detection-hunting', jobFamilyId: 'family-soc-detection-hunting', title: '보안 관제·탐지 엔지니어링·위협 헌팅 담당자',
    summary: '로그와 경보를 triage하고 재현 가능한 탐지 논리와 헌팅 가설을 운영합니다.', relatedWeekIds: [2, 3, 12, 13],
    actualWork: ['SIEM·EDR 경보를 정상·오탐·사고 후보로 분류합니다.', '공격 행동을 데이터 소스와 탐지 규칙에 매핑합니다.', '탐지 공백을 헌팅하고 룰의 정확도와 운영 절차를 개선합니다.'],
    projectExample: '인증 실패와 비정상 프로세스 실행 로그를 상관 분석해 탐지 룰, triage 질문과 escalation 기준을 만듭니다.',
    foundationConceptIds: ['tcpip', 'accountability', 'triage'], skillIds: ['detection-engineering', 'timeline'], technologyIds: ['siem-soar', 'edr'],
    standardIds: ['standard-mitre-attack'], deliverables: ['경보 분석 티켓', '탐지 룰과 테스트', '헌팅 쿼리', '운영 플레이북'], collaborators: ['IR·DFIR', '시스템·클라우드 운영자', '위협 인텔리전스', 'Red·Purple Team'],
    entryExpectations: ['로그 필드와 시간 흐름 설명', '기본 쿼리·스크립트 작성', '판단 근거와 불확실성 기록'], preferredExperience: ['로컬 로그 탐지 규칙', '오탐 분석과 튜닝 기록'],
    learningStages: fourLearningStages('OS·네트워크·로그 구조를 익힙니다.', '경보 triage와 탐지 논리를 작성합니다.', '데이터로 룰을 검증하고 헌팅 가설을 반복합니다.', '탐지 룰·테스트 데이터·플레이북을 묶습니다.'),
    portfolioExamples: ['샘플 로그 기반 탐지 룰과 테스트', 'ATT&CK 기반 미니 헌팅 보고서'],
    jobSourceIds: ['source-kisa-career-guide', 'source-kisia-exhibitor-2'], sourceStatus: 'exhibitor-profile-not-vacancy', sourceStatusNote: NOT_A_DATED_VACANCY,
  }),
  roleNode({
    id: 'role-incident-dfir', jobFamilyId: 'family-incident-dfir', title: '침해사고 대응·DFIR·디지털 포렌식 분석가',
    summary: '증거를 보존하고 사고 타임라인·원인·영향을 재구성해 격리와 복구를 지원합니다.', relatedWeekIds: [1, 2, 8, 12, 13],
    actualWork: ['초동 범위와 증거 수집 우선순위를 정합니다.', '디스크·메모리·로그·패킷을 시간순으로 분석합니다.', '격리·복구 의사결정과 재발 방지 근거를 보고합니다.'],
    projectExample: '가상 침해사고의 로그와 디스크 이미지를 보존하고 최초 진입부터 계정 사용, 격리까지 타임라인을 재구성합니다.',
    foundationConceptIds: ['evidence-preservation', 'timeline', 'disk-memory'], skillIds: ['network-forensics', 'triage'], technologyIds: ['tech-dfir-toolchain'],
    standardIds: ['standard-nist-ir'], deliverables: ['증거 목록과 해시', '사고 타임라인', 'IOC·범위 분석', '원인·영향·복구 보고서'], collaborators: ['SOC', '시스템·네트워크 운영자', '법무·개인정보', '경영진·외부기관'],
    entryExpectations: ['원본 보존과 분석본 분리', '시간대·출처가 있는 기록', '사실·가설·미확인을 구분'], preferredExperience: ['공개 이미지 포렌식', '로그 타임라인 분석'],
    learningStages: fourLearningStages('파일시스템·로그·증거 보존을 익힙니다.', '아티팩트와 타임라인 분석을 학습합니다.', '여러 증거를 교차 검증해 범위를 판단합니다.', '재현 가능한 DFIR case report를 만듭니다.'),
    portfolioExamples: ['공개 포렌식 이미지 분석 기록', '가상 사고 타임라인과 대응 보고서'],
    jobSourceIds: ['source-kisa-career-guide'], sourceStatus: 'career-guide-only', sourceStatusNote: '공식 진로 가이드 근거이며 현재 개별 공고 근거는 아닙니다.',
  }),
  roleNode({
    id: 'role-malware-reverse', jobFamilyId: 'family-malware-reverse', title: '악성코드 분석·리버스 엔지니어',
    summary: '격리된 환경에서 실행 파일의 구조와 행동을 분석해 탐지·대응 가능한 결과를 만듭니다.', relatedWeekIds: [7, 8, 11, 12],
    actualWork: ['파일 형식·문자열·imports와 코드를 정적으로 분석합니다.', '격리 환경에서 프로세스·파일·네트워크 행동을 관찰합니다.', '기능 가설, IOC와 탐지·대응 권고를 검증합니다.'],
    projectExample: '무해한 교육용 바이너리를 정적·동적으로 분석해 기능, 조건 분기와 관찰 가능한 지표를 보고합니다.',
    foundationConceptIds: ['cpu', 'memory', 'process-thread'], skillIds: ['static-analysis', 'dynamic-analysis'], technologyIds: ['tech-reverse-toolchain'],
    standardIds: ['standard-mitre-attack'], deliverables: ['분석 노트', '행동·기능 보고서', 'IOC·탐지 아이디어', '분석 자동화 스크립트'], collaborators: ['SOC·Detection', 'IR·DFIR', '위협 인텔리전스', '제품 보안 연구자'],
    entryExpectations: ['OS와 실행 파일 기초', '코드·행동 관찰을 근거로 기록', '격리와 sample 취급 절차 준수'], preferredExperience: ['교육용 crackme 분석', '격리 sandbox 관찰 기록'],
    learningStages: fourLearningStages('CPU·메모리·OS 실행을 익힙니다.', '정적·동적 분석과 어셈블리를 학습합니다.', '가설을 디버거와 행동 로그로 검증합니다.', '무해한 sample의 분석 보고서와 도구를 만듭니다.'),
    portfolioExamples: ['교육용 바이너리 리버싱 보고서', '격리 환경 행동 분석 자동화'],
    jobSourceIds: ['source-kisa-career-guide'], sourceStatus: 'career-guide-only', sourceStatusNote: '공식 진로 가이드 근거이며 현재 개별 공고 근거는 아닙니다.',
  }),
  roleNode({
    id: 'role-network-system-endpoint', jobFamilyId: 'family-network-system-endpoint', title: '네트워크·시스템·엔드포인트 보안 엔지니어',
    summary: '네트워크와 호스트 통제를 설계·구축하고 정책 변경, 장애와 운영 로그를 관리합니다.', relatedWeekIds: [1, 2, 3, 13, 15],
    actualWork: ['방화벽·NAC·EDR 정책과 자산 연결을 설계합니다.', '변경 영향, 장애와 성능을 점검하고 rollback 절차를 유지합니다.', '노출 서비스, 권한과 로그 상태를 정기 점검합니다.'],
    projectExample: '신규 업무망의 통신 요구를 최소 허용 방화벽·NAC 정책으로 변환하고 테스트와 rollback 결과를 기록합니다.',
    foundationConceptIds: ['tcpip', 'filesystem', 'process-thread'], skillIds: ['dns', 'accountability'], technologyIds: ['tech-network-platform', 'edr'],
    standardIds: ['iso27001'], deliverables: ['구축 설계서', '정책표와 변경 기록', '운영 절차', '장애·점검 보고서'], collaborators: ['네트워크·서버 운영자', 'SOC', '클라우드 팀', '서비스 소유자'],
    entryExpectations: ['Linux·네트워크 기본 명령 사용', '통신 흐름과 권한 설명', '변경 전후 검증 기록'], preferredExperience: ['홈랩 네트워크 구성', 'Linux 서비스 hardening'],
    learningStages: fourLearningStages('Linux·TCP/IP·권한을 익힙니다.', '경계·엔드포인트 통제 동작을 학습합니다.', '정책 변경과 장애·로그를 운영합니다.', '소형 네트워크 구축·하드닝 문서를 만듭니다.'),
    portfolioExamples: ['가상 네트워크 정책·검증 문서', 'Linux hardening과 EDR 운영 점검표'],
    jobSourceIds: ['source-kisa-career-guide', 'source-kisia-exhibitor-4'], sourceStatus: 'exhibitor-profile-not-vacancy', sourceStatusNote: NOT_A_DATED_VACANCY,
  }),
  roleNode({
    id: 'role-cloud-iam', jobFamilyId: 'family-cloud-iam', title: '클라우드 보안·IAM·권한 관리 엔지니어',
    summary: '클라우드 자산의 신원, 권한, 네트워크, 비밀정보와 감사 로그를 정책·코드로 운영합니다.', relatedWeekIds: [2, 3, 12, 15],
    actualWork: ['IAM 역할과 서비스 계정 권한을 최소화합니다.', '클라우드 구성·네트워크·로그 가드레일을 코드로 배포합니다.', '권한 변경, 비밀정보와 key rotation을 모니터링합니다.'],
    projectExample: '애플리케이션 배포 역할을 분리하고 임시 권한, KMS 접근, 감사 로그와 정책 테스트를 구성합니다.',
    foundationConceptIds: ['identification', 'authorization', 'rbac-abac'], skillIds: ['accountability', 'risk-management'], technologyIds: ['cloud', 'tech-hsm-kms'],
    standardIds: ['iso27001'], deliverables: ['IAM 정책·권한표', '구성 가드레일 코드', '위협 모델', '감사·rotation 운영 기록'], collaborators: ['클라우드 플랫폼·SRE', '개발팀', 'SOC', 'GRC·감사'],
    entryExpectations: ['IAM 주체·정책·자원 구분', 'CLI·IaC 변경 리뷰', '로그로 정책 결과 확인'], preferredExperience: ['개인 cloud sandbox IAM 구성', 'IaC 정책 테스트'],
    learningStages: fourLearningStages('클라우드 책임공유와 IAM을 익힙니다.', '권한·네트워크·키·로그 가드레일을 학습합니다.', 'IaC와 정책 테스트로 변경을 운영합니다.', '최소 권한 cloud 환경과 검증 기록을 만듭니다.'),
    portfolioExamples: ['최소 권한 IAM·감사 로그 lab', 'IaC 정책 검사와 예외 처리 sample'],
    jobSourceIds: ['source-kisa-career-guide', 'source-kisia-exhibitor-2'], sourceStatus: 'exhibitor-profile-not-vacancy', sourceStatusNote: NOT_A_DATED_VACANCY,
  }),
  roleNode({
    id: 'role-crypto-pki', jobFamilyId: 'family-crypto-pki', title: '암호·PKI·신뢰 기반 기술 엔지니어',
    summary: '검증된 암호 구현, 인증서·프로토콜과 키 수명주기를 제품·클라우드 환경에 안전하게 적용합니다.', relatedWeekIds: [3, 12, 13, 15],
    actualWork: ['알고리즘·라이브러리 선택과 constant-time·난수·키 사용을 검토합니다.', 'CA·RA·X.509 발급·갱신·폐기와 TLS·VPN 상호운용성을 운영합니다.', 'HSM·KMS·Secrets, 암호모듈 검증과 PQC 전환 inventory를 설계합니다.'],
    projectExample: '로컬 CA와 mTLS 서비스를 구축하고 인증서 자동 갱신, key rotation, 실패 상황과 감사 로그를 검증합니다.',
    foundationConceptIds: ['symmetric', 'asymmetric', 'hash'], skillIds: ['signature', 'auth-session'], technologyIds: ['pki', 'tls', 'tech-hsm-kms'],
    standardIds: ['standard-x509-pkcs', 'standard-fips-kcmvp'], deliverables: ['암호 설계·위협 검토', '인증서·키 수명주기 절차', '상호운용·성능 테스트', 'crypto inventory·PQC 전환 계획'],
    collaborators: ['제품·플랫폼 개발자', '클라우드·IAM', '인증·시험기관', '아키텍트·GRC'], entryExpectations: ['대칭키·비대칭키·해시 용도 구분', '직접 암호를 설계하지 않고 검증된 라이브러리 사용', '키와 인증서 수명주기 설명'],
    preferredExperience: ['로컬 CA·mTLS lab', 'KMS envelope encryption', '암호 라이브러리 테스트 벡터 사용'], learningStages: fourLearningStages('현대 암호·난수·키 교환을 익힙니다.', 'PKI·TLS·HSM/KMS와 안전한 구현을 학습합니다.', '수명주기·상호운용·성능·호환성을 검증합니다.', 'mTLS·envelope encryption·crypto inventory 중 하나를 완성합니다.'),
    portfolioExamples: ['로컬 CA와 인증서 수명주기', 'mTLS 갱신 자동화', '클라우드 KMS envelope encryption', 'PQC 전환 crypto inventory'],
    workAreaIds: cryptoRoleAreas.map((area) => area.id), jobSourceIds: ['source-kisa-career-guide', 'source-crypto-vacancy-audit-2026-07-11'],
    sourceStatus: 'current-vacancy-unverified', sourceStatusNote: '2026-07-11 기준 검증 가능한 현재 암호·PKI 개별 채용공고 근거를 확보하지 못했습니다.',
  }),
  roleNode({
    id: 'role-embedded-ot-automotive', jobFamilyId: 'family-embedded-ot-automotive', title: '모바일·IoT·임베디드·OT·자동차 보안 엔지니어',
    summary: '장치·펌웨어·산업 프로토콜과 물리 안전 제약을 제품 수명주기 보안에 반영합니다.', relatedWeekIds: [7, 8, 13, 14, 15],
    actualWork: ['펌웨어·부트·업데이트와 장치 신뢰 경계를 분석합니다.', '버스·무선·IT/OT 통신 경로의 위험을 평가합니다.', '가용성·안전·긴 수명주기를 고려한 통제와 테스트를 설계합니다.'],
    projectExample: '교육용 IoT 장치의 펌웨어 업데이트와 기본 자격 증명 위험을 분석해 secure update 요구와 검증 계획을 작성합니다.',
    foundationConceptIds: ['cpu', 'memory', 'tcpip'], skillIds: ['risk-management', 'static-analysis'], technologyIds: ['tech-embedded-toolchain'],
    standardIds: ['standard-iec-62443', 'standard-iso-sae-21434'], deliverables: ['자산·인터페이스 모델', '위협 분석', '보안 요구·테스트 계획', '업데이트·키 관리 설계'], collaborators: ['펌웨어·하드웨어 개발자', '생산·안전 엔지니어', '품질·인증', 'SOC·운영'],
    entryExpectations: ['C·OS·네트워크 기초', '장치 인터페이스와 안전 영향 구분', '실장비는 명시적 허가 아래 취급'], preferredExperience: ['교육용 보드·펌웨어 분석', '프로토콜 trace 읽기'],
    learningStages: fourLearningStages('컴퓨터 구조·펌웨어·네트워크를 익힙니다.', 'secure boot·update·산업 위험을 학습합니다.', '장치 흐름을 모델링하고 안전한 테스트를 수행합니다.', '교육용 장치 위협 모델과 검증 계획을 만듭니다.'),
    portfolioExamples: ['교육용 IoT secure update 설계', '가상 OT zone·conduit 위협 모델'],
    jobSourceIds: ['source-kisa-career-guide'], sourceStatus: 'career-guide-only', sourceStatusNote: '공식 진로 가이드의 연구·개발·엔지니어 범주를 참고했으며 현재 개별 공고 근거는 아닙니다.',
  }),
  roleNode({
    id: 'role-ai-security-rnd', jobFamilyId: 'family-ai-security-rnd', title: 'AI 보안·보안 연구개발 담당자',
    summary: 'AI 시스템과 새 보안 기술의 가설을 재현 가능한 평가·코드·연구 결과로 검증합니다.', relatedWeekIds: [4, 14, 16],
    actualWork: ['모델·데이터·도구·에이전트 신뢰 경계를 위협 모델링합니다.', '고정된 안전 평가셋과 지표로 공격·오용·통제 가설을 시험합니다.', '재현 가능한 코드, 제한사항과 제품 적용 권고를 작성합니다.'],
    projectExample: '로컬 LLM 애플리케이션의 도구 호출 경계를 모델링하고 고정 평가셋으로 입력 처리와 권한 통제를 비교합니다.',
    foundationConceptIds: ['ai-security', 'risk-management', 'secure-coding'], skillIds: ['reproduction', 'impact-remediation'], technologyIds: ['tech-ai-evaluation'],
    standardIds: ['standard-nist-ai-rmf'], deliverables: ['위협 모델', '평가 데이터·하네스', '실험 결과와 제한사항', '제품 적용 권고·연구 코드'], collaborators: ['ML 연구자·엔지니어', '제품 보안·개발팀', '데이터·개인정보 담당자', 'GRC·안전 평가자'],
    entryExpectations: ['Python·데이터·모델 기초', '통제된 실험과 재현성', '결과의 범위와 불확실성 명시'], preferredExperience: ['작은 평가 하네스 구현', '논문·공식 문서 재현'],
    learningStages: fourLearningStages('ML 시스템·소프트웨어 보안 기초를 익힙니다.', 'AI 위협 모델과 평가 방법을 학습합니다.', '고정 데이터와 지표로 가설을 재현합니다.', '평가 코드·데이터·제한사항을 함께 공개합니다.'),
    portfolioExamples: ['로컬 AI 앱 위협 모델과 평가셋', '보안 연구 재현 notebook과 제한사항 보고서'],
    jobSourceIds: ['source-kisa-career-guide'], sourceStatus: 'career-guide-only', sourceStatusNote: '공식 진로 가이드의 연구·개발 범주를 참고했으며 현재 개별 공고 근거는 아닙니다.',
  }),
]

const familyNode = (id, title, summary, roleId, assets, collaborators, learningAreaIds, relatedWeekIds) => ({
  id, kind: 'jobFamily', title, summary, description: summary, relatedWeekIds, sourceRefs: ['source-kisa-career-guide'],
  representativeRoleIds: [roleId], assets, collaborators, learningAreaIds,
})

const jobFamilyNodes = [
  familyNode('family-grc-privacy', '보안 기획·GRC·개인정보', '위험·규정·정책을 조직의 책임과 통제로 운영합니다.', 'role-grc-privacy', ['정보자산', '개인정보 처리 흐름', '정책·증적'], ['경영진', '법무·감사', '기술 조직'], ['risk-management', 'privacy'], [0, 15]),
  familyNode('family-consulting-audit', '보안 컨설팅·감사', '요구사항과 실제 운영을 근거로 비교해 개선 방향을 제시합니다.', 'role-consulting-audit', ['고객 시스템', '관리체계', '감사 증적'], ['고객 담당자', '운영자', '감사·인증기관'], ['security-audit', 'security-consulting'], [0, 15]),
  familyNode('family-app-product-devsecops', '애플리케이션·제품 보안·DevSecOps', '소프트웨어 수명주기에 예방·검증·배포 통제를 내장합니다.', 'role-app-product-security', ['소스코드', 'API', '빌드·배포 파이프라인'], ['개발자', '제품 관리자', 'SRE'], ['secure-coding', 'sdlc'], [3, 4, 5, 6, 14, 15]),
  familyNode('family-vulnerability-redteam', '취약점 진단·모의침투·레드팀', '허가된 범위에서 공격 가능성과 영향을 안전하게 검증합니다.', 'role-vulnerability-redteam', ['애플리케이션', '인프라', '제품 인터페이스'], ['자산 소유자', '개발팀', 'Blue·Purple Team'], ['scope-roe', 'vulnerability-assessment'], [0, 3, 4, 5, 6, 10, 11, 14]),
  familyNode('family-soc-detection-hunting', '보안 관제·탐지 엔지니어링·위협 헌팅', '로그·경보에서 침해 징후를 찾고 탐지 품질을 개선합니다.', 'role-soc-detection-hunting', ['로그', '경보', '네트워크·엔드포인트 telemetry'], ['IR·DFIR', 'IT 운영', 'Red·Purple Team'], ['detection-engineering', 'triage'], [2, 3, 12, 13]),
  familyNode('family-incident-dfir', '침해사고 대응·DFIR·디지털 포렌식', '증거를 보존하고 사고 원인·범위·복구 근거를 재구성합니다.', 'role-incident-dfir', ['디스크·메모리', '로그·패킷', '사고 업무 기록'], ['SOC', 'IT 운영', '법무·개인정보'], ['evidence-preservation', 'timeline'], [1, 2, 8, 12, 13]),
  familyNode('family-malware-reverse', '악성코드 분석·리버스 엔지니어링', '코드와 실행 행동을 분석해 기능·지표·대응 지식을 만듭니다.', 'role-malware-reverse', ['실행 파일', '프로세스·메모리', '행동 로그'], ['SOC·IR', '위협 연구', '제품 보안'], ['static-analysis', 'dynamic-analysis'], [7, 8, 11, 12]),
  familyNode('family-network-system-endpoint', '네트워크·시스템·엔드포인트 보안', '통신·호스트 경계의 보안 시스템과 운영 정책을 구축합니다.', 'role-network-system-endpoint', ['네트워크', '서버·엔드포인트', '보안 장비'], ['IT 운영', 'SOC', '서비스 소유자'], ['tcpip', 'filesystem'], [1, 2, 3, 13, 15]),
  familyNode('family-cloud-iam', '클라우드 보안·IAM·권한 관리', '클라우드 신원·권한·구성·키와 로그를 정책·코드로 관리합니다.', 'role-cloud-iam', ['클라우드 계정', 'IAM 정책', '워크로드·비밀정보'], ['플랫폼·SRE', '개발팀', 'SOC·GRC'], ['identification', 'authorization'], [2, 3, 12, 15]),
  familyNode('family-crypto-pki', '암호·PKI·신뢰 기반 기술', '암호 구현, 인증서·프로토콜과 키 수명주기를 안전하게 적용합니다.', 'role-crypto-pki', ['암호키', '인증서·신뢰 체인', '암호모듈·프로토콜'], ['제품·플랫폼 개발자', 'IAM·클라우드', '시험·인증기관'], ['symmetric', 'asymmetric', 'signature'], [3, 12, 13, 15]),
  familyNode('family-embedded-ot-automotive', '모바일·IoT·임베디드·OT·자동차 보안', '장치와 물리 공정의 안전·가용성 제약을 보안 수명주기에 반영합니다.', 'role-embedded-ot-automotive', ['펌웨어·장치', '산업 제어·차량 네트워크', '업데이트 인프라'], ['하드웨어·펌웨어', '안전·품질', '생산·운영'], ['cpu', 'memory', 'tcpip'], [7, 8, 13, 14, 15]),
  familyNode('family-ai-security-rnd', 'AI 보안·보안 연구개발', '새 보안 가설과 AI 시스템 위험을 재현 가능한 연구·평가로 검증합니다.', 'role-ai-security-rnd', ['모델·데이터', 'AI 애플리케이션·도구', '연구 코드·평가셋'], ['ML·제품 개발자', 'Product Security', '데이터·GRC'], ['ai-security', 'reproduction'], [4, 14, 16]),
]

export const mindmapNodes = [...jobFamilyNodes, ...roleNodes, ...canonicalLegacyNodes, ...supportingNodes]

const edge = (type, sourceId, targetId) => ({ id: `edge:${type}:${sourceId}:${targetId}`, type, sourceId, targetId })

const industryRoleLinks = [
  ['role-app-product-security', 'finance'],
  ['role-network-system-endpoint', 'energy-telecom'],
  ['role-cloud-iam', 'finance'],
  ['role-crypto-pki', 'finance'],
  ['role-embedded-ot-automotive', 'iot'],
  ['role-embedded-ot-automotive', 'ot-ics'],
  ['role-embedded-ot-automotive', 'automotive'],
]

export const mindmapEdges = [
  ...jobFamilyNodes.flatMap((family) => family.representativeRoleIds.map((roleId) => edge('containsRole', family.id, roleId))),
  ...roleNodes.flatMap((role) => [
    ...role.foundationConceptIds.map((conceptId) => edge('requiresFoundation', role.id, conceptId)),
    ...role.skillIds.map((conceptId) => edge('developsSkill', role.id, conceptId)),
    ...role.technologyIds.map((technologyId) => edge('usesTechnology', role.id, technologyId)),
    ...role.standardIds.map((standardId) => edge('usesStandard', role.id, standardId)),
  ]),
  ...canonicalLegacyNodes.filter((node) => node.kind === 'concept').flatMap((node) => node.prerequisiteConceptIds.map((prerequisiteId) => edge('prerequisiteFor', prerequisiteId, node.id))),
  ...mindmapNodes.filter((node) => node.kind === 'control').flatMap((node) => node.threatIds.map((threatId) => edge('mitigates', node.id, threatId))),
  ...industryRoleLinks.map(([roleId, industryId]) => edge('worksInIndustry', roleId, industryId)),
]

const nodeIndex = new Map(mindmapNodes.map((node) => [node.id, node]))
const sourceIndex = new Map(jobSources.map((source) => [source.id, source]))

export const getMindmapNode = (id) => nodeIndex.get(id) ?? null
export const getJobSource = (id) => sourceIndex.get(id) ?? null
export const getMindmapNodesByKind = (kind) => mindmapNodes.filter((node) => node.kind === kind)
export const getMindmapEdgesForNode = (id) => mindmapEdges.filter((item) => item.sourceId === id || item.targetId === id)

export function getNodeDetailModel(nodeOrId) {
  const node = typeof nodeOrId === 'string' ? getMindmapNode(nodeOrId) : nodeOrId
  if (!node || !MINDMAP_NODE_KINDS.includes(node.kind)) return {
    kind: 'unknown', perspective: 'neutral', title: node?.title ?? '알 수 없는 노드', summary: node?.summary ?? '', sections: [],
  }
  if (node.kind === 'threat') return {
    kind: node.kind, perspective: 'threat', title: node.title, summary: node.summary,
    sections: ['conditions', 'attackFlow', 'impact', 'detectionSignals', 'mitigations', 'safePractice'],
  }
  if (node.kind === 'control') return {
    kind: node.kind, perspective: 'control', title: node.title, summary: node.summary,
    sections: ['protectedAssets', 'placements', 'mechanism', 'operations', 'limitations', 'verificationMethods'],
  }
  return { kind: node.kind, perspective: 'neutral', title: node.title, summary: node.summary, sections: [] }
}

const REQUIRED_KIND_FIELDS = {
  jobFamily: ['description', 'representativeRoleIds', 'assets', 'collaborators', 'learningAreaIds'],
  role: ['jobFamilyId', 'actualWork', 'projectExample', 'foundationConceptIds', 'skillIds', 'technologyIds', 'standardIds', 'deliverables', 'collaborators', 'entryExpectations', 'preferredExperience', 'learningStages', 'portfolioExamples', 'jobSourceIds', 'sourceStatus', 'sourceStatusNote', 'sourceCheckedDate'],
  concept: ['definition', 'practicalUses', 'roleIds', 'prerequisiteConceptIds', 'subConceptIds', 'learningChecklist', 'technologyIds', 'standardIds', 'implementationCautions', 'commonMisconceptions', 'connectedPracticeIds'],
  technology: ['purpose', 'scenarios', 'componentsAndFlow', 'conceptIds', 'roleIds', 'operationalCautions', 'adjacentTechnologyIds'],
  standard: ['purpose', 'scope', 'keyRequirements', 'roleIds', 'organizationFlow', 'conceptIds'],
  threat: ['conditions', 'attackFlow', 'impact', 'detectionSignals', 'mitigationControlIds', 'mitigations', 'safePractice'],
  control: ['protectedAssets', 'placements', 'mechanism', 'operations', 'limitations', 'verificationMethods', 'conceptIds', 'roleIds', 'threatIds'],
  industry: ['assets', 'operationalConstraints', 'roleIds', 'conceptIds'],
}

const NONEMPTY_ROLE_FIELDS = ['actualWork', 'projectExample', 'foundationConceptIds', 'skillIds', 'technologyIds', 'standardIds', 'deliverables', 'collaborators', 'entryExpectations', 'preferredExperience', 'learningStages', 'portfolioExamples', 'jobSourceIds', 'sourceStatusNote']

const hasContent = (value) => Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value != null

export function validateMindmapData({ nodes = mindmapNodes, edges = mindmapEdges, sources = jobSources } = {}) {
  const issues = []
  const nodesById = new Map()
  const sourcesById = new Map()
  const edgeIds = new Set()
  const add = (code, id, message) => issues.push({ code, id, message })

  for (const source of sources) {
    if (!source?.id || sourcesById.has(source.id)) add('duplicate-source-id', source?.id ?? '', 'Source IDs must be unique and non-empty.')
    else sourcesById.set(source.id, source)
    for (const field of ['sourceType', 'organization', 'company', 'title', 'region', 'publishedDate', 'closingDate', 'checkedDate', 'url', 'activeStatus', 'verificationStatus', 'isIndividualVacancy', 'note']) {
      if (!(field in source)) add('missing-source-field', source.id, `Missing source field: ${field}`)
    }
    if (source.sourceType === 'fairExhibitorProfile' && (source.activeStatus !== 'unknown' || source.isIndividualVacancy !== false)) {
      add('invalid-exhibitor-status', source.id, 'Fair exhibitor profiles must remain non-vacancy records with unknown active status.')
    }
    if (source.activeStatus === 'active' && (source.sourceType !== 'individualVacancy' || source.verificationStatus !== 'verifiedCurrent')) {
      add('unsupported-active-status', source.id, 'Active status requires a verified current individual vacancy.')
    }
  }

  for (const node of nodes) {
    if (!node?.id || nodesById.has(node.id)) add('duplicate-node-id', node?.id ?? '', 'Node IDs must be unique and non-empty.')
    else nodesById.set(node.id, node)
    if (!MINDMAP_NODE_KINDS.includes(node.kind)) { add('unknown-node-kind', node.id, `Unknown node kind: ${node.kind}`); continue }
    for (const field of ['title', 'summary', 'relatedWeekIds', 'sourceRefs', ...REQUIRED_KIND_FIELDS[node.kind]]) {
      if (!(field in node)) add('missing-node-field', node.id, `Missing ${node.kind} field: ${field}`)
    }
    if ('offensiveExample' in node || 'defensiveExample' in node) add('legacy-perspective-field', node.id, 'Canonical nodes must not use generic attack/defense fallback fields.')
    for (const sourceId of node.sourceRefs ?? []) if (!sourcesById.has(sourceId)) add('missing-source-ref', node.id, `Unknown source: ${sourceId}`)
    if (node.kind === 'role') for (const field of NONEMPTY_ROLE_FIELDS) if (!hasContent(node[field])) add('empty-role-field', node.id, `Role field must not be empty: ${field}`)
  }

  const expectRefs = (node, field, expectedKind) => {
    for (const targetId of node[field] ?? []) {
      const target = nodesById.get(targetId)
      if (!target) add('missing-node-ref', node.id, `Unknown ${field} reference: ${targetId}`)
      else if (target.kind !== expectedKind) add('wrong-node-kind-ref', node.id, `${field} must reference ${expectedKind}: ${targetId}`)
    }
  }

  for (const node of nodes) {
    if (node.kind === 'jobFamily') { expectRefs(node, 'representativeRoleIds', 'role'); expectRefs(node, 'learningAreaIds', 'concept') }
    if (node.kind === 'role') {
      const family = nodesById.get(node.jobFamilyId)
      if (!family || family.kind !== 'jobFamily') add('invalid-family-ref', node.id, `Invalid job family: ${node.jobFamilyId}`)
      expectRefs(node, 'foundationConceptIds', 'concept'); expectRefs(node, 'skillIds', 'concept')
      expectRefs(node, 'technologyIds', 'technology'); expectRefs(node, 'standardIds', 'standard')
      for (const sourceId of node.jobSourceIds) if (!sourcesById.has(sourceId)) add('missing-job-source', node.id, `Unknown job source: ${sourceId}`)
      if (node.learningStages?.length !== 4 || node.learningStages?.map((stage) => stage.title).join('|') !== '기초|직무 핵심|실무 적용|포트폴리오') add('invalid-learning-stages', node.id, 'Roles require the four ordered learning stages.')
    }
    if (node.kind === 'concept') {
      expectRefs(node, 'roleIds', 'role'); expectRefs(node, 'prerequisiteConceptIds', 'concept'); expectRefs(node, 'subConceptIds', 'concept')
      expectRefs(node, 'technologyIds', 'technology'); expectRefs(node, 'standardIds', 'standard')
    }
    if (node.kind === 'technology') { expectRefs(node, 'conceptIds', 'concept'); expectRefs(node, 'roleIds', 'role'); expectRefs(node, 'adjacentTechnologyIds', 'technology') }
    if (node.kind === 'standard') { expectRefs(node, 'conceptIds', 'concept'); expectRefs(node, 'roleIds', 'role') }
    if (node.kind === 'threat') expectRefs(node, 'mitigationControlIds', 'control')
    if (node.kind === 'control') { expectRefs(node, 'conceptIds', 'concept'); expectRefs(node, 'roleIds', 'role'); expectRefs(node, 'threatIds', 'threat') }
    if (node.kind === 'industry') { expectRefs(node, 'roleIds', 'role'); expectRefs(node, 'conceptIds', 'concept') }
  }

  for (const item of edges) {
    if (!item?.id || edgeIds.has(item.id)) add('duplicate-edge-id', item?.id ?? '', 'Edge IDs must be unique and non-empty.')
    else edgeIds.add(item.id)
    const source = nodesById.get(item.sourceId)
    const target = nodesById.get(item.targetId)
    if (!source || !target) { add('missing-edge-ref', item.id, 'Edge endpoints must reference canonical nodes.'); continue }
    const allowedPairs = MINDMAP_EDGE_KIND_RULES[item.type]
    if (!allowedPairs || !allowedPairs.some(([sourceKind, targetKind]) => source.kind === sourceKind && target.kind === targetKind)) {
      add('invalid-edge-kinds', item.id, `Invalid ${item.type} edge: ${source.kind} -> ${target.kind}`)
    }
  }

  for (const area of cryptoRoleAreas) {
    if (area.roleId !== 'role-crypto-pki' || !nodesById.has(area.roleId)) add('invalid-crypto-area-role', area.id, 'Crypto areas must resolve to the canonical crypto role.')
    for (const sourceId of area.jobSourceIds) if (!sourcesById.has(sourceId)) add('missing-crypto-area-source', area.id, `Unknown source: ${sourceId}`)
  }
  return issues
}

export function assertValidMindmapData(data) {
  const issues = validateMindmapData(data)
  if (issues.length) throw new Error(`Invalid mind-map data:\n${issues.map((issue) => `${issue.code} ${issue.id}: ${issue.message}`).join('\n')}`)
  return true
}
