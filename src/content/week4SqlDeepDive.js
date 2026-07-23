const progress2023Fixed = {
  label: 'Progress · MOVEit Transfer 2023 fixed issues',
  url: 'https://docs.progress.com/bundle/moveit-transfer-release-notes-2023/page/Fixed-Issues-in-2023.html',
  note: 'Issue 69698과 2023.0.1의 CVE-2023-34362 수정 기록을 확인합니다.',
}

const progress2022_1Fixed = {
  label: 'Progress · MOVEit Transfer 2022.1.5 fixed issues',
  url: 'https://docs.progress.com/bundle/moveit-transfer-release-notes-2022_1/page/Fixed-Issues-in-2022.1.5.html',
  note: '2022.1.5 hotfix가 CVE-2023-34362를 수정한 공식 릴리스 기록입니다.',
}

const progress2022Fixed = {
  label: 'Progress · MOVEit Transfer 2022.0.4 fixed issues',
  url: 'https://docs.progress.com/bundle/moveit-transfer-release-notes-2022/page/Fixed-Issues-2022.0.4.html',
  note: '2022.0.4 hotfix가 CVE-2023-34362를 수정한 공식 릴리스 기록입니다.',
}

const cisaMoveitAdvisory = {
  label: 'CISA/FBI · AA23-158A MOVEit advisory',
  url: 'https://www.cisa.gov/sites/default/files/2023-07/aa23-158a-stopransomware-cl0p-ransomware-gang-exploits-moveit-vulnerability_8.pdf',
  note: 'MOVEit의 managed file transfer 역할, 지원 DB 엔진, 영향 버전군과 실제 악용 사실을 확인합니다.',
}

const cisaKev = {
  label: 'CISA · Known Exploited Vulnerabilities Catalog',
  url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
  note: '인증 전 DB 접근, DB 구조·내용 추론 및 DB 엔진에 따른 변경·삭제 가능성과 업데이트 조치를 확인합니다.',
}

const owaspSqlInjection = {
  label: 'OWASP · SQL Injection Prevention Cheat Sheet',
  url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
  note: '준비된 문장, 안전한 stored procedure, 허용 목록, 최소 권한의 역할을 구분합니다.',
}

const moveitNormalMechanism = {
  id: 'w5-db-basics-moveit-mechanism',
  type: 'mechanism',
  title: '파일 전송 웹 화면이 데이터베이스를 사용하는 정상 경로',
  situation: '조직은 큰 파일을 이메일에 붙이는 대신, 누가 어떤 파일을 올리고 받을 수 있는지 통제하고 전송 기록을 남기는 전용 서비스를 사용합니다. MOVEit Transfer는 이런 managed file transfer 제품이며, 웹 화면의 파일·사용자·권한 정보를 데이터베이스와 연결합니다.',
  terms: [
    { term: 'Managed File Transfer · MFT', meaning: '조직의 파일 송수신을 인증, 접근 제어, 기록, 자동화와 함께 관리하는 제품 범주입니다.', contrast: '단순한 파일 폴더와 달리 누가 무엇을 전송할 수 있는지 서버가 정책으로 판단합니다.' },
    { term: 'WebUI', meaning: '브라우저로 로그인해 파일과 사용자 기능을 사용하는 웹 사용자 인터페이스입니다.', contrast: '화면은 DB 자체가 아니며 서버 애플리케이션을 거쳐 데이터와 기능에 접근합니다.' },
    { term: 'DBMS', meaning: 'SQL을 해석하고 테이블의 데이터를 읽거나 바꾸는 데이터베이스 관리 시스템입니다.', contrast: '애플리케이션은 DBMS에 연결된 역할의 권한 범위 안에서만 작업해야 합니다.' },
  ],
  stages: [
    { label: '파일 기능 요청', actor: '사용자·브라우저', input: '로그인 상태, 파일 또는 폴더 선택, 화면 입력값', action: 'HTTPS 요청으로 WebUI 기능을 호출합니다.', output: '서버가 해석할 HTTP 요청' },
    { label: '기능·권한 판단', actor: 'MOVEit WebUI 애플리케이션', input: '요청과 서버가 확인한 사용자 상태', action: '요청 형식과 사용자가 해당 파일·폴더 기능을 사용할 권한이 있는지 판단합니다.', output: '허용된 업무 동작과 DB에 전달할 값' },
    { label: 'DB 호출 구성', actor: '애플리케이션·DB 드라이버', input: '코드가 정한 SQL 구조와 업무 데이터', action: 'SQL 문장 구조와 외부 값을 분리해 DB 역할의 요청으로 전달합니다.', output: '준비된 문장과 별도 parameter 값' },
    { label: '데이터 처리', actor: 'MySQL·Microsoft SQL Server·Azure SQL', input: 'SQL 구조, parameter, 연결 역할의 권한', action: '권한 범위 안에서 필요한 행을 읽거나 승인된 상태를 바꿉니다.', output: '결과 행 또는 통제된 오류' },
    { label: '최소 응답', actor: 'WebUI 애플리케이션', input: 'DB 결과와 내부 처리 상태', action: '화면에 필요한 정보만 응답하고 상세 진단은 접근이 제한된 기록으로 분리합니다.', output: '사용자용 화면과 내부 감사 기록' },
  ],
  trustBoundary: {
    before: 'HTTP 요청의 값은 네트워크 밖 사용자가 정할 수 있는 데이터이며 SQL 문법으로 신뢰할 수 없습니다.',
    decision: '서버 코드와 DB 드라이버가 SQL 구조는 코드가 소유하고 외부 값은 parameter로 전달해야 합니다.',
    after: 'DBMS는 고정된 문장을 먼저 해석하고 별도로 받은 값을 그 문장의 데이터 위치에 사용합니다.',
    failure: '외부 값이 SQL 문자열 조립에 들어가면 데이터와 명령 구조의 경계가 사라질 수 있습니다. 공개 MOVEit 기록은 이 SQL injection 유형을 확인하지만 실제 취약 parameter나 소스 줄은 공개하지 않습니다.',
  },
}

const moveitFailureModel = {
  id: 'w5-db-basics-failure-model',
  type: 'code-trace',
  title: 'SQL 문자열 조립에서 경계가 사라지는 한 줄',
  evidenceKind: 'educational-model',
  language: 'JavaScript',
  description: 'CVE-2023-34362의 실제 MOVEit 소스가 아닙니다. 공식 기록이 확인한 SQL injection을, 일반 검색 기능의 안전한 값 `blue`만으로 설명하는 최소 구조 모델입니다.',
  code: "1  const category = request.query.category\n2  const sql = \"SELECT title FROM catalog WHERE category = '\"\n3            + category + \"'\"\n4  const rows = await db.query(sql)\n5  return renderTitles(rows)",
  trace: [
    { lines: '1', before: 'HTTP query parameter가 요청 안에 있습니다.', action: '서버가 값을 애플리케이션 문자열로 읽습니다.', after: '`category`는 요청자가 정할 수 있는 외부 데이터입니다.' },
    { lines: '2–3', before: '코드가 정한 SQL 일부와 외부 값이 따로 있습니다.', action: '`+` 연산으로 둘을 하나의 SQL 문자열로 합칩니다.', after: 'DB가 받을 문장 구조 안에 외부 값이 들어갑니다. 이 두 줄이 교육용 모델의 정확한 실패 지점입니다.' },
    { lines: '4', before: '`sql` 하나에 명령 구조와 데이터가 섞여 있습니다.', action: 'DB 드라이버가 완성된 문자열을 DBMS에 넘깁니다.', after: 'DBMS는 어느 글자가 원래 데이터였는지 알 수 없고 전체 문자열을 SQL로 파싱합니다.' },
    { lines: '5', before: 'DB가 허용된 역할 권한으로 결과를 만들었습니다.', action: '애플리케이션이 결과를 화면 데이터로 바꿉니다.', after: '노출·변경 범위는 실제 SQL, DB 엔진, 연결 역할의 권한에 따라 달라집니다.' },
  ],
}

const moveitPatchModel = {
  id: 'w5-db-basics-patch-model',
  type: 'patch-analysis',
  title: '공식 수정 버전과 구분해 읽는 SQLi 방어 모델',
  evidenceKind: 'educational-model',
  language: 'JavaScript',
  description: 'Progress는 수정 릴리스와 취약점 유형을 공개했지만 MOVEit의 취약 함수나 소스 diff는 공개 릴리스 노트에서 확인되지 않습니다. 따라서 아래 비교는 CWE-89와 OWASP 방어 원칙을 단순화한 교육용 모델입니다.',
  before: {
    label: '수정 전 구조 모델 · 문자열 조립',
    code: "const sql =\n  \"SELECT title FROM catalog WHERE category = '\"\n  + category + \"'\"\nawait db.query(sql)",
  },
  after: {
    label: '수정 후 구조 모델 · 문장과 값 분리',
    code: "const sql =\n  'SELECT title FROM catalog WHERE category = $1'\nconst params = [category]\nawait db.query(sql, params)",
  },
  changes: [
    'SQL 문장 구조는 코드의 고정 문자열로 남고 외부 `category`는 별도 parameter 배열로 이동합니다.',
    'DB 드라이버가 준비된 문장과 값을 구분해 전달하므로 값이 문장 구조를 소유하지 않습니다.',
    '이 구조 모델을 MOVEit의 실제 변경 내용이라고 부르지 않습니다. 제품 대응의 확인 가능한 사실은 영향 자산을 식별하고 해당 branch의 Progress hotfix 이상으로 업데이트하는 것입니다.',
  ],
  regressionTests: [
    { case: '정상 category `blue`', expected: '수정 전 기준선과 같은 허용된 검색 결과가 나옴', reason: '문장과 값의 분리가 정상 검색 기능을 깨뜨리지 않았는지 확인합니다.' },
    { case: '빈 값·길이 경계·정의되지 않은 category', expected: '제품 규칙에 따른 빈 결과 또는 일반 4xx 오류이며 SQL 상세는 노출되지 않음', reason: '입력 경계와 안전한 오류 동작을 함께 확인합니다.' },
    { case: '쿼리 구조 비교', expected: 'fixture가 달라도 SQL template은 같고 parameter 값만 달라짐', reason: '문자열 필터가 아니라 구조적 분리가 유지되는지 확인합니다.' },
    { case: 'DB 역할 권한', expected: '검색 역할은 필요한 view의 SELECT만 성공하고 변경 동작은 거절됨', reason: '근본 수정이 실패하더라도 피해 범위를 제한하는 별도 계층을 확인합니다.' },
  ],
  limitation: '공개 Progress 자료에서 CVE-2023-34362의 실제 취약 source, endpoint, parameter, query 또는 line-level diff를 확인하지 못했습니다. 이 블록은 실제 패치를 재현하거나 그 내부 구현을 추정하지 않으며, 실제 패치는 공급자의 branch별 수정 릴리스입니다.',
}

const moveitImpact = {
  id: 'w5-db-basics-impact-map',
  type: 'impact-map',
  title: 'CVE-2023-34362의 영향은 DB 엔진과 역할 권한에 따라 달라진다',
  intro: 'CISA가 확인한 범위와 수업에서 추가로 추론할 수 없는 범위를 나눠 읽습니다.',
  dimensions: [
    { label: '기밀성', impact: '공격자가 MOVEit 데이터베이스의 구조와 내용에 관한 정보를 추론하거나 허용되지 않은 데이터에 접근할 수 있습니다.', condition: '취약한 WebUI가 네트워크에서 도달 가능하고, 사용 중인 DB 엔진과 쿼리 실행 문맥이 해당 읽기 효과를 허용해야 합니다.' },
    { label: '무결성', impact: 'DB 요소를 변경하거나 삭제하는 SQL 문장이 실행될 수 있다고 CISA는 설명합니다.', condition: '애플리케이션의 DB 연결 역할과 해당 DB 엔진이 목표 객체에 대한 변경 또는 삭제 권한을 실제로 가져야 합니다.' },
    { label: '가용성', impact: '중요 데이터의 변경·삭제가 업무를 방해할 가능성은 있지만, 서비스 전체 중단 범위는 자산별로 별도 확인해야 합니다.', condition: '업무에 필요한 DB 요소가 영향을 받고 복구·이중화·백업 같은 운영 통제가 그 결과를 막지 못할 때 성립합니다.' },
  ],
  attackerControls: ['네트워크로 WebUI에 보내는 요청의 외부 입력값', '요청을 보내는 시점과 반복 여부'],
  notControlled: ['설치된 MOVEit Transfer 버전과 패치 상태', 'MySQL·Microsoft SQL Server·Azure SQL 중 실제 DB 엔진', '애플리케이션 DB 역할의 객체별 권한', '백업·망 분리·모니터링·사고 대응 상태'],
  access: {
    authentication: 'CISA와 NVD는 이 CVE를 인증되지 않은 공격자의 DB 접근 가능성으로 기록합니다. 사전 로그인 권한이 필요하다고 가정하지 않습니다.',
    interaction: '피해 사용자가 링크를 열거나 버튼을 누르는 조건은 공식 취약점 설명의 전제가 아닙니다.',
    network: '영향 버전의 MOVEit Transfer WebUI가 공격자 네트워크에서 도달 가능해야 합니다.',
    defaultExposure: 'MOVEit 설치만으로 인터넷 노출을 단정할 수 없습니다. 실제 배포의 WebUI 공개 범위, reverse proxy, 방화벽 구성을 확인해야 합니다.',
    protections: 'WAF·망 분리·DB 최소 권한은 노출과 피해 범위를 줄일 수 있지만 Progress 수정 버전 적용을 대신하지 않습니다.',
  },
}

const queryBoundaryMechanism = {
  id: 'w5-query-boundary-mechanism',
  type: 'mechanism',
  title: 'DBMS가 문장을 해석하고 값을 사용하는 두 단계',
  situation: '상품 검색처럼 사용자가 정한 값으로 행을 찾되, 어떤 테이블과 열을 읽을지는 애플리케이션이 통제해야 합니다. 준비된 문장은 “명령 구조를 정하는 주체”와 “검색값을 정하는 주체”를 분리합니다.',
  terms: [
    { term: 'Prepared Statement · 준비된 문장', meaning: 'SQL 구조를 먼저 DBMS가 해석할 수 있게 준비하고 값은 별도 parameter로 전달하는 호출 방식입니다.', contrast: '문자열 결합은 구조와 값을 합친 뒤 한 번에 SQL로 해석하게 합니다.' },
    { term: 'Placeholder · 자리표시자', meaning: '`$1` 또는 `?`처럼 나중에 데이터 값이 들어갈 위치를 표시하는 기호입니다.', contrast: '테이블 이름이나 `ORDER BY` 방향 같은 SQL 구조를 아무 값으로 치환하는 만능 칸은 아닙니다.' },
    { term: 'Binding · 바인딩', meaning: '별도로 받은 값을 준비된 문장의 자리표시자와 연결하는 처리입니다.', contrast: '값을 따옴표로 감싸 문자열에 이어 붙이는 일과 다릅니다.' },
  ],
  stages: [
    { label: '문장 정의', actor: '서버 코드', input: '개발자가 검토한 테이블·열·조건 구조', action: '외부 값 대신 placeholder가 있는 SQL template을 작성합니다.', output: '`... WHERE category = $1`' },
    { label: '구조 해석', actor: 'DB 드라이버·DBMS', input: 'SQL template', action: 'SQL 문법과 실행 계획을 준비합니다.', output: '값이 들어갈 위치가 정해진 준비 상태' },
    { label: '값 바인딩', actor: 'DB 드라이버', input: '외부 `category`와 목표 parameter 위치', action: '값을 해당 DB 타입의 데이터로 연결합니다.', output: '구조와 구분된 parameter' },
    { label: '권한 안에서 실행', actor: 'DBMS', input: '준비된 구조, 값, 연결 역할', action: '역할이 허용된 객체와 동작 범위에서 쿼리를 수행합니다.', output: '결과 행 또는 권한 오류' },
  ],
  trustBoundary: {
    before: '사용자는 검색 category 값은 정할 수 있지만 테이블·열·연산자 구조를 정할 권한은 없습니다.',
    decision: '서버 코드가 외부 값을 parameter 자리에만 연결하고 SQL 식별자는 코드 소유의 구조로 유지해야 합니다.',
    after: 'DBMS는 외부 값을 이미 정해진 비교 연산의 데이터로 사용합니다.',
    failure: '외부 값을 SQL 문자열에 이어 붙이면 DBMS가 값을 받기 전에 이미 문장 구조가 달라질 수 있습니다.',
  },
}

const queryBoundaryTrace = {
  id: 'w5-query-boundary-code-trace',
  type: 'code-trace',
  title: '문자열 결합과 parameter array가 갈라지는 줄',
  evidenceKind: 'educational-model',
  language: 'JavaScript',
  description: '특정 제품의 소스가 아닌 합성 catalog 검색 코드입니다. 공격 문자열 없이 값 `blue`가 어느 통로로 가는지만 비교합니다.',
  code: "1  const category = request.query.category\n2  const unsafeSql = \"SELECT title FROM catalog WHERE category = '\" + category + \"'\"\n3  await db.query(unsafeSql)\n4\n5  const safeSql = 'SELECT title FROM catalog WHERE category = $1'\n6  await db.query(safeSql, [category])",
  trace: [
    { lines: '1', before: '브라우저 요청에 `category=blue`가 있습니다.', action: '서버가 category 문자열을 읽습니다.', after: '값의 출처가 외부라는 사실은 형식 검사 뒤에도 바뀌지 않습니다.' },
    { lines: '2', before: '고정 SQL 구조와 외부 값이 분리되어 있습니다.', action: '`+`로 한 문자열을 만듭니다.', after: '외부 값이 SQL 문장 안으로 이동합니다. 이 줄이 취약 구조의 정확한 실패 지점입니다.' },
    { lines: '3', before: '명령 구조와 값이 섞인 문자열이 있습니다.', action: 'parameter 목록 없이 DB에 전달합니다.', after: 'DBMS는 전체 문자열을 SQL 문법으로 해석합니다.' },
    { lines: '5', before: '검색 기능에 필요한 구조가 코드에 있습니다.', action: '외부 값 대신 `$1` 자리만 둡니다.', after: 'SQL template은 category 값과 무관하게 일정합니다.' },
    { lines: '6', before: 'template과 외부 값이 따로 있습니다.', action: '드라이버 API의 두 인자로 구조와 값을 전달합니다.', after: '`category`는 문법이 아니라 `$1` 위치의 데이터로 바인딩됩니다.' },
  ],
}

const parameterMechanism = {
  id: 'w5-parameterization-structure-mechanism',
  type: 'mechanism',
  title: '값은 바인딩하고 SQL 구조 선택은 허용 목록으로 제한한다',
  situation: '검색값은 parameter로 전달할 수 있지만, 사용자가 “최신순” 또는 “이름순”을 고르는 기능은 `ORDER BY`의 열과 방향을 정해야 합니다. 이 구조 선택을 그대로 SQL에 넣지 않고 작은 화면 선택값을 코드가 소유한 안전한 구조로 변환합니다.',
  terms: [
    { term: 'Identifier · 식별자', meaning: 'SQL에서 테이블이나 열처럼 구조의 이름을 가리키는 표기입니다.', contrast: '일반 문자열 값과 달리 많은 DB API에서 값 placeholder로 바인딩할 수 없습니다.' },
    { term: 'Allowlist · 허용 목록', meaning: '미리 검토한 선택지만 코드에 두고 외부 입력을 그중 하나의 키로 매핑하는 방식입니다.', contrast: '위험해 보이는 일부 문자를 지우는 차단 목록과 달리 가능한 결과 전체를 코드가 소유합니다.' },
  ],
  stages: [
    { label: '작은 UI 선택', actor: '사용자', input: '`newest` 또는 `name` 같은 화면 선택 키', action: '표시 순서를 고릅니다.', output: 'SQL이 아닌 제품 기능 키' },
    { label: '구조 매핑', actor: '서버 코드', input: '기능 키와 코드의 allowlist', action: '키를 검토된 `created_at DESC` 또는 `title ASC`로 바꿉니다.', output: '코드가 소유한 SQL fragment' },
    { label: '문장 구성', actor: '서버 코드', input: '고정 template, 허용된 정렬 fragment, `$1`', action: '구조는 allowlist로 만들고 검색 category는 placeholder로 남깁니다.', output: '검토 가능한 SQL template' },
    { label: '값 전달', actor: 'DB 드라이버', input: 'SQL template과 category 배열', action: 'category만 데이터 parameter로 바인딩합니다.', output: '구조와 값이 분리된 DB 호출' },
  ],
  trustBoundary: {
    before: '요청자는 화면의 정렬 키와 category 값을 정할 수 있습니다.',
    decision: '정렬 키는 코드 allowlist의 결과만 선택하고 category는 parameter로 전달해야 합니다.',
    after: '요청자가 정한 문자열이 임의의 열·방향·SQL fragment가 되지 않습니다.',
    failure: '요청의 정렬 문자열을 그대로 `ORDER BY` 뒤에 연결하면 값 바인딩만 적용해도 구조 경계가 다시 열립니다.',
  },
}

const allowlistTrace = {
  id: 'w5-parameterization-allowlist-trace',
  type: 'code-trace',
  title: '정렬 구조와 검색값을 서로 다른 통제로 처리하는 코드',
  evidenceKind: 'educational-model',
  language: 'JavaScript',
  description: '합성 catalog 기능입니다. `requestedOrder`와 `category`가 같은 HTTP 요청에서 와도 서로 다른 SQL 역할을 가지므로 처리법이 다릅니다.',
  code: "1  const orderBy = { newest: 'created_at DESC', name: 'title ASC' }\n2  const safeOrder = orderBy[requestedOrder] ?? orderBy.newest\n3  const sql = 'SELECT title FROM catalog_public WHERE category = $1 ORDER BY ' + safeOrder\n4  await db.query(sql, [category])",
  trace: [
    { lines: '1', before: '제품이 지원할 정렬 기능이 정해져 있습니다.', action: '각 UI 키를 검토된 SQL fragment에 매핑합니다.', after: 'SQL 구조 후보 전체를 코드가 소유합니다.' },
    { lines: '2', before: '요청자가 선택한 키는 아직 신뢰되지 않았습니다.', action: '객체의 정확한 키만 조회하고 없는 키는 기본값으로 바꿉니다.', after: '`safeOrder`는 요청 원문이 아니라 allowlist 안의 두 값 중 하나입니다.' },
    { lines: '3', before: '고정 query와 검토된 정렬 fragment가 있습니다.', action: '구조끼리 문장을 만들고 category 자리는 `$1`로 남깁니다.', after: '문장은 코드가 소유하고 외부 데이터 위치가 명시됩니다.' },
    { lines: '4', before: 'SQL template과 category가 따로 있습니다.', action: 'category만 parameter array로 전달합니다.', after: '식별자 선택은 allowlist, 데이터 값은 binding이라는 두 통제가 함께 적용됩니다.' },
  ],
}

const retestMechanism = {
  id: 'w5-sqli-retest-mechanism',
  type: 'mechanism',
  title: '패치를 “코드 변경”에서 “검증된 수정”으로 만드는 순서',
  situation: '문자열 결합을 parameter API로 바꿨다는 코드 리뷰만으로는 정상 기능 보존, 빠뜨린 DB 호출, DB 권한, 오류 노출까지 확인할 수 없습니다. 같은 기준선과 경계 조건을 반복해 수정이 실제 처리 경로에 적용됐는지 확인해야 합니다.',
  terms: [
    { term: 'Baseline · 기준선', meaning: '수정 전 정상 기능이 어떤 입력에서 어떤 결과를 냈는지 기록한 비교점입니다.', contrast: '취약 동작만 기록하면 수정이 정상 기능을 깨뜨렸는지 판단할 수 없습니다.' },
    { term: 'Regression Test · 회귀 테스트', meaning: '수정한 문제가 다시 생기지 않고 기존 정상 기능도 유지되는지 반복 확인하는 시험입니다.', contrast: '한 번 화면이 성공했다는 수동 확인보다 입력, 상태, 기대 결과가 고정되어야 합니다.' },
    { term: 'Negative Test · 거절 시험', meaning: '허용하지 않아야 할 입력·권한·상태가 안전하게 실패하는지 확인하는 시험입니다.', contrast: '서버가 단순히 오류를 냈다는 것보다 상태가 바뀌지 않고 상세 정보가 새지 않는지 함께 봅니다.' },
  ],
  stages: [
    { label: '정상 기준선 고정', actor: '개발자·검토자', input: '허용된 category와 기대 결과', action: 'fixture, DB 상태, 결과 행을 합성 자료로 기록합니다.', output: '수정 전후에 재사용할 baseline' },
    { label: '모든 DB 호출 확인', actor: '코드 리뷰·정적 검사', input: 'route부터 ORM·raw query까지의 호출 그래프', action: '외부 값이 문자열 구조에 들어가는 지점을 찾습니다.', output: '수정 대상과 제외 근거 목록' },
    { label: '구조 수정', actor: '개발자', input: '고정 SQL template과 외부 값', action: '값 binding과 식별자 allowlist를 각 위치에 적용합니다.', output: '문장과 값이 분리된 코드' },
    { label: '정상·거절·권한 재시험', actor: '테스트 환경', input: 'baseline, 경계 fixture, 최소 권한 역할', action: '결과, DB 상태, 사용자 오류, 내부 로그를 함께 비교합니다.', output: '수정 효과와 남은 한계가 분리된 증거' },
  ],
  trustBoundary: {
    before: '수정 diff는 개발자의 의도를 보여 주지만 실제 모든 실행 경로가 안전하다는 증명은 아닙니다.',
    decision: '테스트가 동일한 상태에서 정상 기능, 안전한 거절, query 구조, 권한 결과를 함께 확인해야 합니다.',
    after: '재현 가능한 fixture와 기대 결과가 남아 다음 변경에서도 같은 경계를 검사할 수 있습니다.',
    failure: '특정 문자열 하나가 더 이상 동작하지 않는지만 보면 다른 호출 경로와 정상 기능 회귀를 놓칠 수 있습니다.',
  },
}

const defenseLayersMechanism = {
  id: 'w5-database-controls-mechanism',
  type: 'mechanism',
  title: '같은 DB 오류를 사용자 응답과 내부 증거로 나누는 방어 구조',
  situation: '검색 기능은 실패했을 때 사용자에게 다음 행동을 알려야 하고 운영자는 원인을 찾아야 합니다. 상세 SQL·schema·연결 정보까지 브라우저에 보내지 않으면서도, 수정과 사고 분석에 필요한 내부 증거는 남겨야 합니다.',
  terms: [
    { term: 'Least Privilege · 최소 권한', meaning: '기능이 필요한 객체와 동작만 서비스 역할에 허용하는 원칙입니다.', contrast: '모든 기능이 공유 관리자 역할을 쓰면 한 결함의 영향 범위가 DB 전체로 넓어질 수 있습니다.' },
    { term: 'View · 뷰', meaning: '기본 테이블에서 허용할 행·열을 골라 쿼리처럼 정의한 DB 객체입니다.', contrast: '원본 테이블 전체 권한을 주지 않고 검색 기능에 필요한 표현만 노출할 수 있습니다.' },
    { term: 'Redaction · 마스킹', meaning: '로그의 비밀번호·token·연결 문자열·불필요한 개인정보를 기록하지 않거나 가리는 처리입니다.', contrast: '로그 전체를 없애는 것이 아니라 조사에 필요한 사건 ID와 안전한 메타데이터는 보존합니다.' },
  ],
  stages: [
    { label: '기능 역할 연결', actor: '애플리케이션 설정', input: '검색 기능과 전용 DB identity', action: '검색 전용 역할로 connection pool을 구성합니다.', output: '관리자와 분리된 `catalog_reader` 문맥' },
    { label: '객체 권한 판단', actor: 'DBMS', input: 'query, 역할, `catalog_public` view', action: '필요한 view의 SELECT만 허용하고 변경 동작을 거절합니다.', output: '최소 결과 또는 권한 오류' },
    { label: '사용자 응답 분리', actor: '오류 handler', input: '내부 오류와 생성한 추적 ID', action: '브라우저에는 일반 문구와 추적 ID만 보냅니다.', output: '내부 구조가 없는 사용자 응답' },
    { label: '내부 증거 기록', actor: '접근 제어된 logging', input: '추적 ID, route, 결과 분류, 마스킹된 메타데이터', action: '비밀값 없이 진단·탐지에 필요한 사실을 남깁니다.', output: '권한이 제한된 audit·application log' },
  ],
  trustBoundary: {
    before: 'DB 오류 객체에는 사용자에게 필요 없는 schema·driver·호출 정보가 포함될 수 있습니다.',
    decision: '오류 handler가 사용자용 최소 응답과 내부용 마스킹 기록을 서로 다른 sink로 보내야 합니다.',
    after: '사용자는 사건을 문의할 ID를 받고 운영자는 같은 ID로 통제된 기록을 찾습니다.',
    failure: '상세 오류를 그대로 응답하면 내부 정보가 외부 경계를 넘고, 로그에 비밀을 그대로 남기면 내부 접근자에게 새 노출을 만듭니다.',
  },
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichMoveitCve(block) {
  const additions = [progress2023Fixed, progress2022_1Fixed, progress2022Fixed, cisaMoveitAdvisory, cisaKev]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    productRole: 'MOVEit Transfer는 조직의 파일 송수신을 인증·접근 제어·기록과 함께 운영하는 managed file transfer 제품입니다. CISA는 WebUI가 MySQL, Microsoft SQL Server, Azure SQL을 지원한다고 설명합니다.',
    weakness: '인증 전 SQL Injection · CWE-89 · Server/WebUI',
    affectedVersions: 'CISA가 열거한 2023.0.0, 2022.1.x, 2022.0.x, 2021.1.x, 2021.0.x, 2020.1.x, 2020.0.x의 당시 미수정 배포',
    fixedVersions: 'branch별 2023-05-31 Progress hotfix 이상. 공개 릴리스 노트에서 직접 확인되는 예: 2023.0.1, 2022.1.5, 2022.0.4. 다른 branch는 공급자 버전 표와 지원 상태를 대조해야 합니다.',
    cause: 'Progress는 Server/WebUI의 SQL injection이 MOVEit Transfer 데이터베이스에 대한 인증되지 않은 접근을 허용할 수 있었다고 기록합니다. 공개 공식 자료에는 취약 endpoint, parameter, SQL 문장, 실제 source line이 없어 그 내부 원인을 더 구체적으로 추정하지 않습니다.',
    condition: '영향받는 미수정 MOVEit Transfer WebUI가 네트워크에서 도달 가능해야 합니다. 공격자는 사전 인증이 필요하지 않으며, 구체적인 읽기·변경·삭제 결과는 MySQL·Microsoft SQL Server·Azure SQL 중 사용 엔진과 애플리케이션 DB 역할의 권한에 따라 달라집니다.',
    patch: 'Progress가 각 지원 branch에 배포한 2023-05-31 hotfix 이상으로 업데이트합니다. 공식 release note는 issue 69698과 CVE-2023-34362 수정 사실을 확인하지만 line-level source diff는 제공하지 않습니다. 적용 뒤 제품 버전, 정상 전송, DB 역할, 오류·감사 기록을 재시험해야 합니다.',
    facts: [
      'CISA KEV는 이 CVE가 실제 악용되었음을 기록하며 대응을 공급자 지침에 따른 업데이트로 지정합니다.',
      '공식 기록은 DB 구조·내용 추론과 DB 요소 변경·삭제 가능성을 설명하지만 모든 배포에서 같은 영향이 자동으로 성립한다고 말하지 않습니다.',
      '수업의 SQL 코드는 MOVEit 실제 소스가 아니라 parameter binding과 최소 권한을 설명하는 교육용 모델입니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function replaceTitledBlock(blocks, title, replacement) {
  const index = blocks.findIndex((block) => block.title === title)
  if (index < 0) return addAfter(blocks, (block) => block.type === 'explanation', [replacement])
  return [...blocks.slice(0, index), replacement, ...blocks.slice(index + 1)]
}

function enrichDbBasics(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichMoveitCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    moveitNormalMechanism,
    moveitFailureModel,
    cve,
    moveitPatchModel,
    moveitImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [progress2023Fixed, progress2022_1Fixed, progress2022Fixed, cisaMoveitAdvisory, cisaKev, owaspSqlInjection])
    : block)
}

function enrichQueryBoundary(blocks) {
  let enriched = addAfter(blocks, (block) => block.type === 'explanation', [queryBoundaryMechanism])
  enriched = replaceTitledBlock(enriched, '합성 코드에서 경계 찾기', queryBoundaryTrace)
  return enriched
}

function enrichParameterization(blocks) {
  let enriched = addAfter(blocks, (block) => block.type === 'explanation', [parameterMechanism])
  enriched = replaceTitledBlock(enriched, '정렬 선택을 안전한 값으로 매핑하기', allowlistTrace)
  return enriched
}

function enrichWithMechanism(blocks, mechanism) {
  return addAfter(blocks, (block) => block.type === 'explanation', [mechanism])
}

export function buildWeek4SqlGuide(modules) {
  const enrichers = {
    'w5-db-basics': enrichDbBasics,
    'w5-query-boundary': enrichQueryBoundary,
    'w5-parameterization': enrichParameterization,
    'w5-sqli-retest': (blocks) => enrichWithMechanism(blocks, retestMechanism),
    'w5-database-controls': (blocks) => enrichWithMechanism(blocks, defenseLayersMechanism),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
