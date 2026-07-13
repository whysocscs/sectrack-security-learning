const sources = Object.freeze({
  dreamhackSqli: { label: 'Dreamhack SQL Injection', url: 'https://dreamhack.io/lecture/units/webhacking-sql-injection', note: '제공된 교육 플랫폼의 SQLi 학습 단원입니다.' },
  dreamhackCsrf: { label: 'Dreamhack CSRF', url: 'https://dreamhack.io/lecture/units/webhacking-csrf', note: '제공된 교육 플랫폼의 CSRF 학습 단원입니다.' },
  owaspSqli: { label: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html', note: 'SQL 문장 구조와 데이터를 분리하는 방어 원칙입니다.' },
  owaspInputValidation: { label: 'OWASP Input Validation Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html', note: '형식·길이·허용값 같은 입력 제약을 보조 통제로 설계하는 방법입니다.' },
  cwe89: { label: 'MITRE CWE-89', url: 'https://cwe.mitre.org/data/definitions/89.html', note: '외부 영향 입력이 SQL 명령의 일부로 해석되는 약점과 완화 전략입니다.' },
  postgresPrepare: { label: 'PostgreSQL · PREPARE', url: 'https://www.postgresql.org/docs/current/sql-prepare.html', note: '준비된 문장과 위치 기반 파라미터의 DB 측 동작을 확인합니다.' },
  postgresGrant: { label: 'PostgreSQL · GRANT', url: 'https://www.postgresql.org/docs/current/sql-grant.html', note: '객체별 권한을 역할에 부여하는 공식 문법과 의미입니다.' },
  owaspCsrf: { label: 'OWASP CSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html', note: '상태 변경 요청의 정당성을 확인하는 방어 원칙입니다.' },
  mdnSetCookie: { label: 'MDN · Set-Cookie', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie', note: '쿠키의 Domain·Path·Secure·HttpOnly·SameSite 속성과 전송 범위를 설명합니다.' },
  mdnFetchSite: { label: 'MDN · Sec-Fetch-Site', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site', note: '요청 시작점과 대상 사이 관계를 나타내는 Fetch Metadata 헤더입니다.' },
  mdnCsrf: { label: 'MDN · Cross-site request forgery', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF', note: 'CSRF의 전제와 웹 애플리케이션 방어의 개요입니다.' },
  gcc: { label: 'GCC online documentation', url: 'https://gcc.gnu.org/onlinedocs/', note: 'C 프로그램의 빌드와 보호 옵션을 확인하는 공식 문서입니다.' },
  abi: { label: 'System V ABI: x86-64', url: 'https://gitlab.com/x86-psABIs/x86-64-ABI', note: 'x86-64 호출 규약과 실행 환경의 공식 ABI 문서입니다.' },
  gdb: { label: 'GNU GDB documentation', url: 'https://sourceware.org/gdb/documentation/', note: '로컬 프로그램의 실행 상태를 관찰하는 공식 문서입니다.' },
  pwntools: { label: 'pwntools documentation', url: 'https://docs.pwntools.com/en/stable/', note: '교육용 로컬 프로세스의 입출력 자동화 문서입니다.' },
  cwe120: { label: 'MITRE CWE-120', url: 'https://cwe.mitre.org/data/definitions/120.html', note: '버퍼 복사에서의 경계 검증 실패와 완화 관점을 확인합니다.' },
  cwe787: { label: 'MITRE CWE-787', url: 'https://cwe.mitre.org/data/definitions/787.html', note: '범위를 벗어난 쓰기와 방어적 설계 관점을 확인합니다.' },
})

const recordSchema = ['관찰 순서와 합성 자료 이름', '선택한 증거와 선택 이유', '사실과 해석을 구분한 설명', '실제 비밀·개인정보·운영 식별자가 없음을 확인']
const rubric = ['관찰이 합성 증거와 연결됨', '원인·영향·통제를 구분함', '방어 또는 재시험 조건을 제시함', '로컬·허가 범위를 준수함']

function lesson({ id, title, duration, summary, question, paragraphs, nodes, details = [], misconception, checkpoints, labId, sourceIds, bullets }) {
  const detailBlocks = details.length ? details : lessonDetailsById[id] || []
  return {
    id,
    title,
    duration,
    summary,
    activityType: 'lesson',
    path: 'required',
    blocks: [
      { id: `${id}-question`, type: 'question', title: '학습 질문', body: question },
      { id: `${id}-explanation`, type: 'explanation', title: '핵심 설명', paragraphs },
      { id: `${id}-diagram`, type: 'diagram', title: '관찰 흐름', body: '값·상태·경계를 순서대로 읽고, 근거보다 큰 결론은 다음 확인 항목으로 남깁니다.', nodes },
      ...detailBlocks,
      { id: `${id}-misconception`, type: 'misconception', title: '흔한 오해', items: misconception },
      ...checkpoints.map((checkpoint, index) => ({ id: `${id}-checkpoint-${index + 1}`, type: 'checkpoint', ...checkpoint })),
      { id: `${id}-practice`, type: 'practice-link', title: '다음 관찰', body: '실제 서비스나 실제 계정에는 요청하지 않습니다. 아래 합성 자료에서 근거와 재시험 조건을 기록합니다.', labIds: [labId] },
      { id: `${id}-sources`, type: 'sources', title: '공식 근거', items: sourceIds.map((sourceId) => sources[sourceId]) },
      { id: `${id}-summary`, type: 'summary', title: '핵심 정리', bullets },
    ],
  }
}

const lessonDetailsById = {
  'w5-query-boundary': [
    {
      type: 'comparison',
      title: '문장 구조와 값은 다른 층이다',
      columns: ['구분', '예시', '검토할 질문'],
      rows: [
        ['SQL 구조', '`SELECT ... FROM catalog WHERE category = ?`', '어떤 테이블·열·조건을 사용할지 코드가 미리 정했는가'],
        ['값', '`blue`', '사용자가 제공한 값이 문법이 아니라 데이터로 전달되는가'],
        ['결과', '검색 결과 1건 또는 안전한 오류', '정상 기준선과 수정 후 결과를 같은 조건에서 비교했는가'],
      ],
    },
    {
      type: 'code',
      title: '합성 코드에서 경계 찾기',
      language: 'javascript',
      description: '아래는 정상 검색값만 쓰는 교육용 비교입니다. 문제의 핵심은 특정 입력이 아니라 값이 SQL 문자열 안으로 들어가는 구조입니다.',
      code: "// 수정 전: 값과 문장 구조를 같은 문자열에 만듦\nconst sql = \"SELECT title FROM catalog WHERE category = '\" + category + \"'\"\n\n// 수정 후: 문장과 값의 전달 경로를 분리함\nconst sql = 'SELECT title FROM catalog WHERE category = $1'\nconst params = [category]\ndb.query(sql, params)",
      annotations: ['첫 예시는 `category`가 문자열 조립에 들어가는 위치를 보여 줍니다.', '둘째 예시는 SQL 문장을 먼저 정하고 값은 별도 목록으로 전달합니다.', '실제 코드 검토에서는 DB 드라이버가 파라미터 API를 실제로 사용하는지까지 확인합니다.'],
    },
    {
      type: 'case',
      title: '코드 리뷰에서 남길 최소 사실',
      body: '검색 화면의 입력값이 서버 핸들러를 거쳐 DB 호출로 전달된다는 사실과, 해당 호출이 문자열 결합인지 파라미터 API인지 분리해 기록합니다. 화면 오류만으로 데이터 접근 범위나 운영 영향을 확정하지 않습니다.',
      facts: ['입력 위치와 DB 호출 위치를 각각 적는다.', '정상 fixture와 수정 후 결과를 함께 보관한다.', '실제 쿼리 로그·연결 문자열·사용자 데이터는 기록하지 않는다.'],
    },
  ],
  'w5-parameterization': [
    {
      type: 'comparison',
      title: '바인딩할 수 있는 값과 설계로 고정할 구조',
      columns: ['항목', '권장 처리', '이유'],
      rows: [
        ['검색어·날짜·수량', '파라미터로 전달', '사용자 값이 문법으로 해석되는 경로를 분리한다.'],
        ['정렬 방향·표시할 열', '코드의 허용 목록으로 매핑', '식별자와 키워드는 일반 값 파라미터 자리에 둘 수 없는 DB·드라이버가 많다.'],
        ['테이블 이름을 사용자가 정함', '기능 재설계가 우선, 불가피하면 좁은 허용 목록', '임의 식별자를 직접 이어 붙이는 구조는 검토 범위를 크게 만든다.'],
      ],
    },
    {
      type: 'code',
      title: '정렬 선택을 안전한 값으로 매핑하기',
      language: 'javascript',
      description: '정렬 구조는 코드가 소유하고, 검색값만 파라미터로 전달하는 합성 예시입니다.',
      code: "const orderBy = { newest: 'created_at DESC', name: 'title ASC' }\nconst safeOrder = orderBy[requestedOrder] ?? orderBy.newest\n\nconst sql = 'SELECT title FROM catalog_public WHERE category = $1 ORDER BY ' + safeOrder\ndb.query(sql, [category])",
      annotations: ['`requestedOrder` 자체를 SQL 문자열에 직접 연결하지 않습니다.', '허용 목록의 값은 코드 검토 대상이며, 추가할 때도 목록과 테스트를 함께 바꿉니다.', '바인딩은 `category` 같은 데이터 값을 위한 통제이고, 객체별 인가·응답 최소화는 별도로 검증합니다.'],
    },
    {
      type: 'timeline',
      title: '리뷰 순서',
      items: [
        { title: 'DB 호출을 찾는다', body: 'ORM, query builder, raw query, stored procedure 호출을 모두 후보로 둡니다.' },
        { title: '문장과 값의 경계를 표시한다', body: '각 사용자·외부 값이 파라미터 API, 허용 목록, 또는 문자열 결합 중 어디로 가는지 표시합니다.' },
        { title: '정상 기능을 재시험한다', body: '수정 대상 값과 정상 검색·정렬 기준선을 같은 합성 조건에서 비교합니다.' },
      ],
    },
    {
      type: 'sources',
      title: '바인딩과 허용 목록의 공식 참고',
      items: [sources.postgresPrepare, sources.owaspInputValidation],
    },
  ],
  'w5-sqli-retest': [
    {
      type: 'comparison',
      title: '관찰과 결론을 분리하는 기록',
      columns: ['기록 항목', '좋은 표현', '피해야 할 표현'],
      rows: [
        ['관찰 사실', '합성 코드에서 `category`가 SQL 문자열에 결합됨', '입력이 수상함'],
        ['근본 원인', '데이터와 SQL 구조를 분리하지 않은 문자열 조립', '필터가 약함'],
        ['영향 범위', '합성 fixture에서 구조 경계 누락을 확인함', '운영 데이터 전체가 노출됨'],
        ['수정 검증', '바인딩 후 정상 검색과 거절 경로를 비교함', '오류가 안 보이므로 해결됨'],
      ],
    },
    {
      type: 'timeline',
      title: '수정 후 재시험 기록 순서',
      items: [
        { title: '정상 기준선을 남긴다', body: '정상 검색 조건, 예상 결과 수, 사용자 역할을 합성 fixture 기준으로 기록합니다.' },
        { title: '수정 전후의 처리 경계를 비교한다', body: '문자열 조립이 제거됐는지와 값 전달 API가 실제로 적용됐는지 확인합니다.' },
        { title: '방어층을 함께 점검한다', body: 'DB 역할, 오류 응답, 로그 마스킹, 객체별 인가가 바인딩과 다른 책임을 수행하는지 확인합니다.' },
        { title: '한계를 적는다', body: '합성 환경에서 확인한 사실과 운영에서 추가 검증할 항목을 분리합니다.' },
      ],
    },
    {
      type: 'case',
      title: '보고서 제목부터 재현 가능하게 쓰기',
      body: '“검색 오류” 대신 “검색 필터 값이 SQL 문자열로 조립되는 구조”처럼 자산·처리 경계·원인을 제목과 첫 문장에 남깁니다. 그 뒤에는 합성 기준선, 수정 코드, 재시험 조건, 남은 한계를 순서대로 붙입니다.',
      facts: ['특정 우회 문자열을 보고서의 원인으로 쓰지 않는다.', '실제 계정·DB 호스트·연결 정보는 포함하지 않는다.', '수정 전과 후에 무엇을 같은 조건으로 비교했는지 적는다.'],
    },
  ],
  'w6-request-credentials': [
    {
      type: 'comparison',
      title: '인증·인가·요청 정당성은 다른 질문이다',
      columns: ['질문', '서버가 확인하는 것', 'CSRF와의 관계'],
      rows: [
        ['인증 Authentication', '이 요청의 사용자가 누구인가', '쿠키·세션이 있으면 인증된 상태일 수 있다.'],
        ['인가 Authorization', '이 사용자가 이 대상·행동을 할 수 있는가', 'CSRF 방어가 있어도 객체별 인가는 매 요청에 필요하다.'],
        ['요청 정당성', '이 상태 변경이 신뢰된 흐름에서 만들어졌는가', '기존 인증 상태가 교차 사이트 요청에 자동으로 실리는 문제를 줄인다.'],
      ],
    },
    {
      type: 'http-message',
      title: '합성 상태 변경 요청 읽기',
      description: 'Cookie와 token 값은 고정된 교육용 표기이며 실제 자격 증명이 아닙니다.',
      message: 'POST /training/profile HTTP/1.1\nHost: app.training.local\nCookie: training_session=local-demo\nOrigin: https://app.training.local\nX-CSRF-Token: fixed-training-token\n\ndisplay_name=student',
      annotations: ['Cookie가 있다는 사실은 인증 상태를 가리킬 수 있지만, 요청 의도를 증명하지는 않습니다.', '서버는 상태 변경 전에 token·출처·인가 등 설계된 통제를 검증합니다.', '합성 응답과 코드 전사만 관찰하며 실제 요청을 만들지 않습니다.'],
    },
    {
      type: 'case',
      title: '먼저 분류할 요청',
      body: '조회 화면, 알림 설정 변경, 배송지 변경, 비밀번호 변경처럼 기능이 다르면 요구되는 보호 강도도 달라집니다. 먼저 상태를 바꾸는 endpoint와 HTTP 메서드를 목록으로 만들고, GET이 상태를 바꾸지 않는지 확인합니다.',
      facts: ['상태 변경 여부를 화면 버튼 이름이 아니라 서버 동작으로 판단한다.', '인증·인가·요청 정당성의 결과를 한 문장에 섞지 않는다.', 'XSS가 있으면 브라우저 안에서 요청을 만들 수 있으므로 별도 수정·검증이 필요하다.'],
    },
  ],
  'w6-csrf-controls': [
    {
      type: 'comparison',
      title: 'CSRF 방어 통제의 역할과 한계',
      columns: ['통제', '서버에서 확인하는 것', '대신하지 않는 것'],
      rows: [
        ['Synchronizer CSRF token', '세션과 연결된 예측 불가능한 값을 요청에서 검증', '객체별 인가와 XSS 수정'],
        ['SameSite Cookie', '교차 사이트 상황의 쿠키 전송 조건', '서버의 token·출처·인가 검증 전체'],
        ['Origin·Referer', '요청 출처가 허용된 origin인지', '구형·특수 클라이언트에 대한 호환성 설계'],
        ['Sec-Fetch-Site', '시작점과 대상의 same-origin/same-site/cross-site 관계', '헤더 미지원 환경의 fallback'],
        ['재인증·명시적 확인', '민감 행동 직전 사용자의 추가 의사 확인', '일반 상태 변경 endpoint 전체의 기본 통제'],
      ],
    },
    {
      type: 'code',
      title: '합성 서버 검증 순서',
      language: 'text',
      description: '교육용 의사 코드입니다. token·origin·session 값은 실제 비밀이나 운영 구현이 아닙니다.',
      code: 'if request.method is not POST: reject\nif session is missing: reject\nif csrf_token does not match session-bound value: reject\nif origin is present and not an allowed origin: reject\nif Sec-Fetch-Site is cross-site: reject or require approved fallback\nif object authorization fails: reject\napply the requested state change',
      annotations: ['검증 순서와 fallback은 프레임워크·인증 방식·클라이언트 범위를 고려해 설계합니다.', 'token을 URL에 넣거나 서버 로그에 그대로 남기지 않습니다.', 'SameSite와 Fetch Metadata는 방어 심층화에 도움이 되지만 서버의 인가 검증을 없애지 않습니다.'],
    },
    {
      type: 'timeline',
      title: '도입·재시험 순서',
      items: [
        { title: '프레임워크 기본 기능을 먼저 확인한다', body: '직접 token을 만들기 전에 현재 프레임워크의 CSRF 보호 설정과 적용 범위를 확인합니다.' },
        { title: '상태 변경 endpoint를 매핑한다', body: '폼·AJAX·API·민감 작업의 요청 형식과 인증 방식을 분리합니다.' },
        { title: '관찰 모드와 fallback을 설계한다', body: 'Fetch Metadata와 Origin 정책은 지원되지 않는 클라이언트와 정상 교차 도메인 흐름을 고려해 단계적으로 도입합니다.' },
        { title: '정상·거절 경로를 함께 재시험한다', body: '정상 요청은 유지되고 token 누락·불일치 또는 허용되지 않은 출처의 합성 fixture는 거절되는지 비교합니다.' },
      ],
    },
    {
      type: 'sources',
      title: 'Cookie·Fetch Metadata 공식 참고',
      items: [sources.owaspCsrf, sources.mdnSetCookie, sources.mdnFetchSite],
    },
  ],
  'w6-web-retest': [
    {
      type: 'comparison',
      title: 'XSS·SQLi·CSRF를 같은 기록 틀로 읽기',
      columns: ['유형', '중요한 경계', '방어·재시험에서 확인할 것'],
      rows: [
        ['XSS', '입력값이 브라우저의 실행·해석 지점으로 가는 경로', '출력 컨텍스트와 안전한 Sink, 정상 렌더링 유지'],
        ['SQLi', '데이터 값이 DB 명령 구조로 해석되는 경로', '파라미터 바인딩·최소 권한, 정상 질의 유지'],
        ['CSRF', '인증된 브라우저 상태가 상태 변경 요청에 쓰이는 경로', 'token·출처·인가, 정상 요청과 거절 요청 비교'],
      ],
    },
    {
      type: 'timeline',
      title: 'CSRF 관찰 보고서의 순서',
      items: [
        { title: '자산과 상태 변경을 적는다', body: '어떤 기능이 무엇을 바꾸는지, 사용자가 인증된 상태인지 합성 흐름으로 정리합니다.' },
        { title: '정상 기준선을 남긴다', body: '정상 요청의 메서드·필수 필드·예상 결과를 비밀 없이 기록합니다.' },
        { title: '빠진 통제와 근본 원인을 분리한다', body: 'Cookie 존재만으로 요청을 승인했는지, token·출처·인가 중 무엇이 빠졌는지 구체화합니다.' },
        { title: '수정과 한계를 함께 재시험한다', body: '정상 요청 성공, token 누락·불일치 거절, 로그 마스킹, 지원되지 않는 헤더의 fallback을 합성 fixture로 비교합니다.' },
      ],
    },
    {
      type: 'case',
      title: '영향을 과장하지 않는 표현',
      body: '합성 상태 변경 흐름에서 token 검증이 빠졌다면 “인증된 브라우저가 의도하지 않은 상태 변경 요청을 보낼 위험을 만드는 통제 누락”으로 기록합니다. 실제 계정의 권한, 실제 금전·개인정보 영향, 외부 서비스의 재현 여부는 허가된 별도 증거 없이는 확정하지 않습니다.',
      facts: ['Cookie·token·Authorization 값을 보고서와 화면 캡처에서 마스킹한다.', 'XSS·객체별 인가·재인증 요구는 별도 통제로 기록한다.', '정상 요청도 성공하는지 확인해야 수정 회귀를 판단할 수 있다.'],
    },
  ],
}

function guidedLab({ week, id, title, objective, concepts, evidenceOptions, correctEvidenceIds, conclusion, artifacts = [] }) {
  const observationArtifacts = artifacts.length ? artifacts : [{
    title: `${title} · 고정 관찰 카드`,
    body: '이 카드는 브라우저 안에서만 읽는 합성 교육 자료입니다. 실제 대상·계정·비밀은 포함하지 않습니다.',
    code: evidenceOptions.map((option) => `관찰 항목: ${option.label}`).join('\n'),
  }]
  return {
    id,
    week,
    title,
    kind: 'guided-observation',
    activityType: 'investigation',
    path: 'required',
    estimatedMinutes: 40,
    objective,
    prerequisites: concepts,
    requiredTools: ['브라우저', 'SecTrack의 로컬 합성 관찰 화면'],
    safeScope: '합성 데이터와 브라우저 로컬 관찰만 사용합니다. 실제 대상·실제 계정·실제 비밀·원격 공격 절차는 사용하지 않습니다.',
    hints: ['먼저 정상 기준선과 바뀐 조건을 나눠 보세요.', '관찰 사실과 영향 추정을 다른 문장으로 적으세요.', '수정 후에는 의심 fixture와 정상 fixture를 함께 비교하세요.'],
    successCriteria: ['합성 증거를 정확히 선택', '방어와 근본 원인을 구분', '정상 경로를 포함한 재시험 조건 기록'],
    submissionSchema: recordSchema,
    rubric,
    relatedConceptIds: concepts,
    scenario: {
      title,
      steps: ['정상 기준선과 합성 관찰 조건을 읽습니다.', '처리 경계와 빠진 통제를 확인합니다.', '수정 후 거절 경로와 정상 경로의 재시험 조건을 기록합니다.'],
      evidenceOptions,
      correctEvidenceIds,
      conclusion,
      artifacts: observationArtifacts,
    },
  }
}

function quiz(week, entries) {
  return entries.map(([conceptId, question, options, answer, explanation], index) => ({
    id: `w${week}q${index + 1}`,
    conceptIds: [conceptId],
    difficulty: index < 2 ? 'foundation' : index < 4 ? 'application' : 'analysis',
    remediationModuleIds: [conceptId],
    question,
    options,
    answer,
    explanation,
  }))
}

const week5Lab = guidedLab({
  week: 5,
  id: 'w5-query-observation',
  title: '합성 쿼리 경계와 바인딩 재시험',
  objective: '합성 검색 요청의 기준선·문자열 결합·바인딩 수정 결과를 비교해 구조적 방어를 기록합니다.',
  concepts: ['w5-query-boundary', 'w5-parameterization', 'w5-sqli-retest'],
  evidenceOptions: [{ id: 'w5-boundary', label: '검색값이 SQL 문자열에 직접 결합됨' }, { id: 'w5-bind', label: '수정 후 값이 바인딩 매개변수로 전달됨' }, { id: 'w5-normal', label: '정상 검색 fixture가 수정 후에도 성공함' }, { id: 'w5-secret', label: '실제 운영 DB 자격 증명' }],
  correctEvidenceIds: ['w5-boundary', 'w5-bind', 'w5-normal'],
  conclusion: '바인딩은 문법과 값의 경계를 지키며, 정상 기준선과 함께 재시험해야 합니다.',
  artifacts: [{ title: '고정 합성 검색 전사', body: '정상 검색값 `blue`만 사용한 교육용 비교입니다. 실제 DB나 계정에는 연결되지 않습니다.', code: '수정 전: sql = "SELECT name FROM catalog WHERE color = \'" + input + "\'"\n입력 fixture: blue\n관찰: 값이 SQL 문자열 안에 이어 붙음\n\n수정 후: sql = "SELECT name FROM catalog WHERE color = ?"\nparams = ["blue"]\n관찰: 값은 별도 매개변수로 전달됨\n재시험: 정상 fixture blue -> 합성 결과 1건 유지' }],
})

const week5ReviewLab = guidedLab({
  week: 5,
  id: 'w5-query-review',
  title: '합성 검색 기능의 방어 설계 검토',
  objective: '정렬 선택, 검색값, DB 역할, 오류 응답이 각각 어떤 방어 책임을 갖는지 분리해 확인합니다.',
  concepts: ['w5-parameterization', 'w5-database-controls', 'w5-sqli-retest'],
  evidenceOptions: [
    { id: 'w5-sort-map', label: '정렬 선택값을 코드에 정의한 허용 목록으로 매핑함' },
    { id: 'w5-bind', label: '검색 category 값은 별도 파라미터 배열로 전달됨' },
    { id: 'w5-view', label: '읽기 전용 역할은 필요한 컬럼만 가진 view에 SELECT 권한을 가짐' },
    { id: 'w5-error', label: '브라우저 응답은 일반 오류와 추적 ID만 표시하고 상세 오류는 내부 기록에 남김' },
    { id: 'w5-secret', label: '운영 DB 연결 문자열과 비밀번호를 관찰 기록에 포함함' },
  ],
  correctEvidenceIds: ['w5-sort-map', 'w5-bind', 'w5-view', 'w5-error'],
  conclusion: '값 바인딩, 식별자 허용 목록, 최소 권한, 안전한 오류 처리와 재시험은 같은 문제를 반복하는 장치가 아니라 서로 다른 경계를 보호합니다.',
  artifacts: [{
    title: '고정 합성 검색 기능 설계 메모',
    body: '표시용 코드와 역할 이름은 교육용 합성 자료입니다. 외부 연결, 실제 쿼리 실행, 실제 자격 증명은 없습니다.',
    code: "const orderBy = { newest: 'created_at DESC', name: 'title ASC' }\\nconst safeOrder = orderBy[requestedOrder] ?? orderBy.newest\\ndb.query(\\n  'SELECT title FROM catalog_public WHERE category = $1 ORDER BY ' + safeOrder,\\n  [category],\\n)\\n\\nGRANT SELECT ON catalog_public TO catalog_reader;\\n브라우저: 요청을 완료할 수 없습니다. reference=training-042\\n내부 기록: reference=training-042 · validation failure · no secret stored",
  }],
})

const week6Lab = guidedLab({
  week: 6,
  id: 'w6-request-origin',
  title: '합성 상태 변경 요청의 정당성 확인',
  objective: '합성 프로필 변경 요청에서 인증 상태, token 검증, SameSite, 정상 재시험 근거를 구분합니다.',
  concepts: ['w6-request-credentials', 'w6-csrf-controls', 'w6-web-retest'],
  evidenceOptions: [{ id: 'w6-session', label: '브라우저에 합성 인증 세션이 있음' }, { id: 'w6-token', label: '정상 요청에 서버 발급 token이 포함됨' }, { id: 'w6-retest', label: '수정 후 정상 요청은 성공하고 token 누락 요청은 거절됨' }, { id: 'w6-password', label: '실제 사용자 비밀번호' }],
  correctEvidenceIds: ['w6-session', 'w6-token', 'w6-retest'],
  conclusion: '인증 상태만으로 요청 정당성이 증명되지 않으며 서버 통제와 재시험이 필요합니다.',
  artifacts: [{ title: '고정 합성 프로필 변경 전사', body: '교육용 세션 식별자와 고정 token만 표시합니다. 실제 Cookie, 계정, 서버 요청은 없습니다.', code: '정상 fixture\nPOST /training/profile\nCookie: training_session=local-demo\nX-CSRF-Token: fixed-training-token\n결과: 200 · 합성 프로필 표시값 변경\n\n수정 후 재시험\ntoken 누락 fixture -> 403 · 합성 상태 변경 없음\n정상 fixture + token -> 200 · 합성 상태 변경 유지' }],
})

const week6ReviewLab = guidedLab({
  week: 6,
  id: 'w6-request-review',
  title: '합성 상태 변경 endpoint의 방어 검토',
  objective: '합성 프로필 변경 endpoint에서 상태 변경 여부, token·출처·인가 검증, SameSite·Fetch Metadata 보조 통제, 정상·거절 재시험을 구분합니다.',
  concepts: ['w6-request-credentials', 'w6-csrf-controls', 'w6-web-retest'],
  evidenceOptions: [
    { id: 'w6-post', label: '프로필 표시값 변경은 POST endpoint에서 처리됨' },
    { id: 'w6-token-check', label: '서버가 세션과 연결된 token 누락·불일치를 403으로 거절함' },
    { id: 'w6-origin-check', label: '허용되지 않은 Origin은 상태 변경 전에 거절함' },
    { id: 'w6-fetch-check', label: 'Sec-Fetch-Site가 cross-site이면 정책에 따라 차단하고 미지원 클라이언트 fallback을 둠' },
    { id: 'w6-authz', label: '인증된 사용자도 자신이 변경할 수 있는 프로필인지 서버에서 인가 확인함' },
    { id: 'w6-cookie-log', label: '실제 Cookie 값을 응답과 운영 로그에 그대로 기록함' },
  ],
  correctEvidenceIds: ['w6-post', 'w6-token-check', 'w6-origin-check', 'w6-fetch-check', 'w6-authz'],
  conclusion: '상태 변경 요청은 인증 상태만으로 승인하지 않습니다. 서버는 token·출처·인가를 확인하고, SameSite와 Fetch Metadata를 환경에 맞는 보조 통제로 사용하며 정상·거절 흐름을 함께 재시험합니다.',
  artifacts: [{
    title: '고정 합성 endpoint 정책 메모',
    body: '값과 도메인은 교육용 표기입니다. 외부 요청, 실제 계정, 실제 Cookie·token은 사용하지 않습니다.',
    code: 'POST /training/profile\nnormal fixture: session + token + allowed Origin + own profile -> 200\nmissing token fixture -> 403 · state unchanged\nunapproved Origin fixture -> 403 · state unchanged\nSec-Fetch-Site: cross-site -> block or compatibility fallback\nserver: verify object authorization before applying display-name change\nresponse/log: redact credentials; retain only training reference ID',
  }],
})

const week7Lab = guidedLab({
  week: 7,
  id: 'w7-memory-map',
  title: '합성 C 프로그램 메모리 지도',
  objective: '합성 C 코드와 실행 지도를 보고 값·주소·스택·힙·정상 수명을 구분합니다.',
  concepts: ['w7-c-values', 'w7-build-flow', 'w7-memory-layout'],
  evidenceOptions: [{ id: 'w7-stack', label: '함수 지역 변수는 호출 프레임과 연결됨' }, { id: 'w7-heap', label: '동적 요청 값은 소유·해제 규칙이 필요함' }, { id: 'w7-address', label: '절대 주소는 모든 환경에서 고정됨' }, { id: 'w7-process', label: '다른 사용자 프로세스의 실제 메모리' }],
  correctEvidenceIds: ['w7-stack', 'w7-heap'],
  conclusion: '메모리 지도는 주소 암기보다 역할·수명·소유 관계를 설명하기 위한 도구입니다.',
  artifacts: [{ title: '고정 합성 C 코드와 실행 지도', body: '주소 숫자는 표시하지 않습니다. 역할과 수명만 읽는 교육용 전사입니다.', code: 'void inspect(void) {\n  int local_count = 7;        // 현재 호출 프레임의 지역 값\n  char *note = alloc_text();  // 동적 요청 값, 해제 책임 필요\n  show(local_count, note);\n  release(note);\n}\n\n호출 중: local_count -> stack frame\n호출 중: note가 가리키는 값 -> heap allocation\n함수 반환: local_count의 호출 프레임 수명 종료' }],
})

const week8Lab = guidedLab({
  week: 8,
  id: 'w8-call-trace',
  title: '합성 C 함수 호출 전사 읽기',
  objective: '합성 C 함수와 x86-64 호출 전사에서 인자 준비·call·지역 상태·반환값 근거를 선택합니다.',
  concepts: ['w8-instruction-flow', 'w8-stack-frame', 'w8-calling-convention'],
  evidenceOptions: [{ id: 'w8-args', label: '호출 전 인자 값이 규약 위치에 준비됨' }, { id: 'w8-call', label: 'call은 함수로 이동하며 복귀 위치를 보관함' }, { id: 'w8-return', label: '반환 뒤 계산 결과가 반환 위치에 표시됨' }, { id: 'w8-remote', label: '실제 원격 프로세스 주소' }],
  correctEvidenceIds: ['w8-args', 'w8-call', 'w8-return'],
  conclusion: '호출 전사에서는 인자·제어 흐름·지역 상태·반환을 분리해 읽습니다.',
  artifacts: [{ title: '고정 합성 x86-64 호출 전사', body: '교육용 의사 전사이며 실제 프로세스 주소나 디버거 연결을 사용하지 않습니다.', code: 'caller: mov edi, 7      ; 첫 번째 정수 인자 준비\ncaller: call add_one    ; 복귀 위치를 보관하고 함수로 이동\nadd_one: push rbp       ; 현재 호출의 지역 상태를 위한 프레임 시작\nadd_one: mov eax, edi\nadd_one: add eax, 1     ; 반환값 위치에 계산 결과\nadd_one: ret            ; 보관한 복귀 위치로 돌아감\n\n반환 뒤: eax = 8' }],
})

const week9Lab = guidedLab({
  week: 9,
  id: 'w9-debug-trace',
  title: '합성 GDB 전사와 로컬 드라이버 기록',
  objective: '합성 정상·오류 fixture 전사에서 중단점·입력 형식·관찰 사실·재시험 기준을 구분합니다.',
  concepts: ['w9-debugger-flow', 'w9-bytes-io', 'w9-local-driver'],
  evidenceOptions: [{ id: 'w9-baseline', label: '정상 fixture의 프롬프트와 성공 반환' }, { id: 'w9-break', label: '합성 breakpoint에서 관찰한 함수 상태' }, { id: 'w9-driver', label: '고정 fixture·입력 순서·예상 출력' }, { id: 'w9-remote', label: '임의 원격 호스트 연결' }],
  correctEvidenceIds: ['w9-baseline', 'w9-break', 'w9-driver'],
  conclusion: '디버거와 드라이버는 로컬 반복 관찰의 근거를 남기는 도구이며, 결론과 허가는 별도로 판단합니다.',
})

const week10Lab = guidedLab({
  week: 10,
  id: 'w10-protection-review',
  title: '합성 경계 검사·보호기법 재시험',
  objective: '합성 코드와 빌드 상태에서 경계 검증·안전 거절·정상 fixture·완화기법의 역할을 구분합니다.',
  concepts: ['w10-bounds', 'w10-mitigations', 'w10-retest'],
  evidenceOptions: [{ id: 'w10-check', label: '복사 전 입력 길이와 대상 용량을 비교함' }, { id: 'w10-reject', label: '경계 초과 fixture가 안전한 오류로 거절됨' }, { id: 'w10-normal', label: '정상 fixture가 수정 후에도 성공함' }, { id: 'w10-shell', label: '실제 셸 획득 절차' }],
  correctEvidenceIds: ['w10-check', 'w10-reject', 'w10-normal'],
  conclusion: '경계 검증은 근본 수정이고, 완화기법은 그 위의 추가 방어층이며, 둘 다 정상 경로 재시험이 필요합니다.',
})

export const week5to10Content = {
  5: {
    id: 'week-5', index: 5, title: 'SQL Injection: 쿼리 경계와 방어',
    summary: '웹 요청에서 DB 호출까지의 경계를 읽고, 파라미터 바인딩·식별자 허용 목록·최소 권한·오류 처리·재시험을 각각의 책임으로 연결합니다.',
    objectives: ['관계형 데이터베이스의 테이블·행·열·쿼리·역할을 구분한다.', '문자열 결합과 파라미터 바인딩의 차이를 코드 흐름에서 설명한다.', '값 바인딩이 어려운 식별자·정렬 구조에는 허용 목록과 기능 재설계가 필요한 이유를 설명한다.', 'DB 최소 권한·응답 최소화·내부 로깅이 바인딩과 다른 방어 계층임을 구분한다.', '합성 쿼리 흐름의 관찰·원인·수정·재시험을 과장 없이 기록한다.'],
    prerequisites: ['Week 3 HTTP 요청·응답과 인증·인가', 'Week 4 Source → Sink와 재시험 기록'],
    quizMinutes: 18,
    recordMinutes: 30,
    modules: [
      lesson({
        id: 'w5-db-basics',
        title: '웹 서비스와 관계형 데이터베이스',
        duration: 48,
        summary: '검색 화면에서 입력한 값이 서버·DB 드라이버·DBMS를 거쳐 결과로 돌아오는 흐름과, 테이블·행·열·쿼리의 역할을 먼저 구분합니다.',
        question: '브라우저의 검색창과 데이터베이스 사이에 어떤 처리 단계가 있으며, 어느 단계에서 데이터와 명령 구조를 분리해야 할까?',
        paragraphs: [
          '관계형 데이터베이스는 테이블에 행과 열의 형태로 데이터를 저장하고, 애플리케이션은 SQL이라는 질의 언어로 필요한 행과 열을 요청합니다. `SELECT`는 읽기, `INSERT`는 추가, `UPDATE`는 변경, `DELETE`는 삭제라는 서로 다른 상태 변화를 뜻합니다.',
          '웹 화면의 입력이 곧바로 DB에 닿는 것이 아닙니다. 일반적으로 브라우저 요청을 서버 라우트가 받고, 애플리케이션 코드가 입력의 의미를 확인한 뒤 DB 드라이버 또는 ORM을 통해 쿼리를 전달합니다. 각 경계에서 데이터가 무엇이며 누가 어떤 권한으로 요청하는지를 나눠 읽어야 합니다.',
          '이 주차는 합성 검색 기능과 고정된 코드 전사만 사용합니다. 실제 서비스, 실제 DB, 실제 계정에 쿼리를 보내거나 취약한 동작을 재현하는 절차는 포함하지 않습니다.',
        ],
        nodes: ['브라우저의 검색 조건', '서버 라우트·입력 의미 확인', '애플리케이션의 쿼리 호출', '권한이 제한된 DB 역할', '결과 최소화·안전한 응답'],
        details: [
          {
            type: 'comparison',
            title: '처음 알아둘 데이터베이스 언어',
            columns: ['용어', '의미', '검색 기능에서의 예'],
            rows: [
              ['테이블', '같은 성격의 데이터를 모은 구조', '`catalog`'],
              ['행 Row', '테이블 안의 한 항목', '상품 한 건'],
              ['열 Column', '항목의 한 속성', '`title`, `category`, `price`'],
              ['쿼리 Query', 'DB에 요청하는 구조화된 문장', '특정 category의 title 조회'],
              ['DB 역할 Role', 'DB가 권한을 판단하는 주체', '읽기 전용 검색 서비스 계정'],
            ],
          },
          {
            type: 'code',
            title: '정상 검색 요청의 합성 흐름',
            language: 'text',
            description: '값 `blue`는 교육용 정상 fixture입니다. 요청을 실제 서버로 보내지 않습니다.',
            code: 'GET /training/catalog?category=blue\n  -> 서버: category는 허용된 카테고리인지 확인\n  -> 애플리케이션: SQL 문장과 category 값을 분리해 전달\n  -> DB 역할: catalog_public view만 읽기\n  -> 응답: 필요한 title 목록만 표시',
            annotations: ['HTTP 요청의 값과 DB 쿼리의 값은 같은 문자열처럼 보일 수 있지만 서로 다른 처리 계층을 지납니다.', '검색 기능이 필요한 데이터 범위와 DB 역할의 권한 범위는 일치해야 합니다.'],
          },
        ],
        misconception: ['SQL은 데이터베이스 관리자만 쓰는 언어라 웹 개발 코드와 무관하다.', '브라우저에서 입력 검사를 했으면 서버와 DB 경계는 다시 확인할 필요가 없다.'],
        checkpoints: [
          { title: '처리 계층', prompt: '웹 검색 기능에서 DB 요청을 만들기 전에 사용자 입력의 의미와 형식을 확인하는 계층은?', options: ['서버 애플리케이션', '브라우저 탭 이름', 'DNS 캐시'], answer: 0, explanation: '서버는 클라이언트의 검사를 신뢰하지 않고 입력 의미·인가·DB 호출을 검토합니다.' },
          { title: '권한 범위', prompt: '검색 기능용 DB 역할의 권한 설계로 가장 적절한 것은?', options: ['필요한 view 또는 열에 대한 읽기 권한만 부여', '모든 테이블의 관리자 권한 부여', '운영자 계정을 모든 기능이 공유'], answer: 0, explanation: '검색 기능에는 필요한 데이터 범위의 읽기 권한만 주어야 합니다.' },
        ],
        labId: week5Lab.id,
        sourceIds: ['cwe89', 'postgresGrant'],
        bullets: ['테이블·행·열·쿼리·역할은 서로 다른 질문에 답한다.', '브라우저 입력부터 DB 응답까지의 경계를 나눠 읽는다.', '검색 기능의 DB 역할은 필요한 읽기 범위로 제한한다.'],
      }),
      lesson({ id: 'w5-query-boundary', title: '데이터와 SQL 문장 구조의 경계', duration: 42, summary: '사용자 값은 데이터로 다뤄야 하며, SQL 문장의 구조를 바꾸는 문자열 결합과 구분해야 합니다.', question: '검색어라는 데이터가 어떻게 쿼리 문장의 일부처럼 해석될 수 있고, 왜 그것이 설계 문제일까?', paragraphs: ['데이터베이스는 SQL 문장을 해석한 뒤 결과를 실행합니다. 애플리케이션이 사용자 값을 문장 문자열에 이어 붙이면 값과 문장 구조의 경계가 사라질 수 있습니다.', '이 과정에서는 읽기 전용 합성 데이터와 고정된 흐름만 관찰합니다. 목표는 우회 문자열을 찾는 것이 아니라 입력 위치, 쿼리 구조, 권한, 오류 처리, 방어적 수정의 관계를 기록하는 것입니다.'], nodes: ['사용자 입력', '입력 형식 확인', '파라미터 바인딩', '권한이 제한된 DB 요청', '결과와 오류 처리'], misconception: ['입력값에 따옴표가 없으면 SQLi 위험도 없다.', '오류 메시지를 숨기기만 하면 문자열 결합 문제도 해결된다.'], checkpoints: [{ title: '경계의 위치', prompt: 'SQL 문장과 사용자 값을 구조적으로 분리하는 방법은?', options: ['문자열을 더 길게 이어 붙이기', '파라미터 바인딩 사용', '오류를 더 많이 표시'], answer: 1, explanation: '바인딩은 값과 문법을 별도로 전달합니다.' }, { title: '교육 범위', prompt: '합성 DB 관찰에서 기록하면 안 되는 것은?', options: ['정상 기준선 응답', '실제 서비스 계정 정보', '수정 전후 코드 차이'], answer: 1, explanation: '실제 계정·실제 데이터는 교육 범위 밖입니다.' }], labId: week5Lab.id, sourceIds: ['owaspSqli', 'dreamhackSqli'], bullets: ['SQL 문법과 데이터 값을 분리한다.', '한 번에 한 조건만 바꿔 관찰한다.', '오류 은닉은 바인딩의 대체물이 아니다.'] }),
      lesson({ id: 'w5-parameterization', title: '파라미터 바인딩과 최소 권한', duration: 38, summary: 'Prepared Statement는 데이터 경계를 지키고, DB 계정 권한과 오류 처리는 피해 범위를 줄이는 별도 통제입니다.', question: '파라미터 바인딩을 적용해도 왜 DB 계정의 권한과 오류 처리를 함께 검토해야 할까?', paragraphs: ['바인딩은 입력을 문법으로 해석하지 않게 하는 주요 통제지만, 과도한 DB 권한·민감한 오류 노출·부족한 로깅은 별도의 위험을 만들 수 있습니다.', '방어 설계는 한 도구에 모든 책임을 주지 않습니다. 입력 경계, 권한 분리, 안전한 오류 응답, 모니터링, 수정 후 재시험을 함께 두면 실패했을 때의 영향도 줄일 수 있습니다.'], nodes: ['문장과 값 분리', 'DB 계정 최소 권한', '안전한 오류 응답', '변경 기록', '정상·의심 fixture 재시험'], misconception: ['Prepared Statement 하나만 있으면 인가와 데이터 노출도 모두 해결된다.', 'DB 계정은 개발 편의를 위해 관리자 권한을 가져도 된다.'], checkpoints: [{ title: '추가 통제', prompt: '바인딩 외에 영향 범위를 줄이는 통제로 알맞은 것은?', options: ['DB 계정 최소 권한', '실제 오류 전문 노출', '공유 관리자 계정'], answer: 0, explanation: '필요한 작업만 허용해 결함 범위를 줄입니다.' }, { title: '재시험', prompt: '수정 후 비교할 조합은?', options: ['합성 의심 입력과 정상 검색 기준선', '임의 외부 서비스와 실제 계정', '오류 메시지만 숨긴 화면'], answer: 0, explanation: '수정 대상과 정상 경로를 함께 비교합니다.' }], labId: week5Lab.id, sourceIds: ['owaspSqli'], bullets: ['바인딩·권한·오류 처리·재시험은 서로 다른 통제다.', '권한은 기능이 필요한 범위로 제한한다.', '정상 기준선을 남긴다.'] }),
      lesson({ id: 'w5-sqli-retest', title: 'SQLi 관찰을 보고서로 바꾸기', duration: 34, summary: '합성 쿼리 흐름에서 관찰 사실, 근본 원인, 영향 한계, 수정, 재시험 결과를 분리해 기록합니다.', question: '“입력값이 이상했다”보다 “값을 쿼리 문자열에 연결했다”가 더 좋은 원인 설명인 이유는 무엇일까?', paragraphs: ['좋은 원인 설명은 특정 문자열이 아니라 데이터가 어떤 처리 경로를 지나 어디서 구조로 해석됐는지 적습니다. 그러면 수정 방향도 바인딩·권한·오류 처리처럼 구조적인 통제로 이어집니다.', '합성 교육 DB의 결과만으로 실제 서비스 영향이나 다른 계정 접근 가능성을 확정하지 않습니다. 관찰 범위, 사용한 fixture, 재시험 조건, 남은 한계를 함께 적는 것이 재현 가능한 기록입니다.'], nodes: ['정상 기준선', '합성 처리 경로', '구조적 원인', '수정 통제', '정상·의심 fixture 재시험'], misconception: ['위험 문자열을 많이 넣으면 원인 설명이 더 정확해진다.', '합성 환경의 관찰만으로 운영 영향도 확정할 수 있다.'], checkpoints: [{ title: '근본 원인', prompt: '가장 재사용 가능한 원인 설명은?', options: ['입력값이 이상함', '값을 SQL 문자열에 결합해 경계가 사라짐', '화면이 느림'], answer: 1, explanation: '구조적 원인이 방어 수정으로 이어집니다.' }, { title: '한계 기록', prompt: '합성 결과만 있을 때 적절한 영향 표현은?', options: ['운영 전체 영향 확정', '합성 fixture 범위에서 구조 경계 문제 관찰', '영향이 전혀 없음'], answer: 1, explanation: '관찰 범위와 한계를 함께 남깁니다.' }], labId: week5Lab.id, sourceIds: ['owaspSqli', 'dreamhackSqli'], bullets: ['원인은 입력 문자열이 아니라 처리 구조로 설명한다.', '합성 관찰을 실제 영향으로 과장하지 않는다.', '의심 fixture와 정상 기준선을 함께 재시험한다.'] }),
      lesson({
        id: 'w5-database-controls',
        title: '최소 권한·오류 처리·로그는 왜 따로 필요한가',
        duration: 52,
        summary: '파라미터 바인딩이 쿼리 구조 경계를 지켜도, DB 역할의 과도한 권한과 상세 오류 노출은 별도의 피해 범위를 만들 수 있습니다.',
        question: '값 바인딩을 적용한 뒤에도 DB 권한, 사용자 응답, 내부 로그를 각각 검토해야 하는 이유는 무엇일까?',
        paragraphs: [
          '파라미터 바인딩은 외부 값을 SQL 문법으로 해석하지 않도록 돕는 핵심 통제입니다. 그러나 애플리케이션이 너무 넓은 테이블·열·변경 권한을 가진다면, 다른 결함이나 승인되지 않은 기능 호출이 생겼을 때 영향이 커질 수 있습니다.',
          '최소 권한은 기능이 실제로 필요한 DB 객체와 동작만 역할에 부여하는 원칙입니다. 읽기 전용 검색이라면 필요한 view나 열에 `SELECT`만 주고, 생성·변경·삭제 권한과 관리자 역할을 기본값처럼 주지 않습니다.',
          '브라우저에는 사용자가 다음 행동을 알 수 있는 일반 오류와 추적 ID만 보여 주고, 상세한 진단 정보는 접근이 통제된 내부 로그에 남깁니다. 단, 오류를 숨기는 일은 문자열 결합을 안전하게 바꾸는 일이 아니며, 두 통제는 함께 필요합니다.',
        ],
        nodes: ['기능별 DB 역할', '필요한 객체·동작만 권한 부여', '값 바인딩과 서버 인가', '사용자용 안전 오류', '접근 제어된 내부 진단 로그'],
        details: [
          {
            type: 'comparison',
            title: '각 통제가 줄이는 위험은 다르다',
            columns: ['통제', '주로 줄이는 위험', '대신하지 않는 것'],
            rows: [
              ['파라미터 바인딩', '값이 SQL 문법으로 해석되는 경로', '객체별 인가, DB 권한 설계'],
              ['최소 권한·view', '허용되지 않은 데이터 범위와 변경 범위', '입력 경계 자체의 수정'],
              ['안전한 오류 응답', '내부 구조·정보의 불필요한 노출', '문자열 결합의 제거'],
              ['내부 로그·추적 ID', '수정·재시험·운영 분석의 근거 부족', '사용자에게 상세 오류를 보여 줄 이유'],
            ],
          },
          {
            type: 'code',
            title: '역할별 권한의 합성 예시',
            language: 'sql',
            description: '권한 이름과 객체는 교육용 예시이며 실제 DB에 실행하지 않습니다.',
            code: 'GRANT SELECT ON catalog_public TO catalog_reader;\n\n-- 검색 기능에는 INSERT, UPDATE, DELETE, 관리자 권한을 부여하지 않음\n-- 화면 응답: 요청을 완료할 수 없습니다. reference=training-042\n-- 내부 로그: reference=training-042 · validation failure · request metadata redacted',
            annotations: ['DB 권한은 역할과 객체 단위로 읽습니다.', '동일한 추적 ID를 사용하면 사용자는 일반 오류만 보고, 운영자는 접근 제어된 기록에서 원인을 찾을 수 있습니다.', '로그에도 비밀번호·연결 문자열·토큰·불필요한 개인정보를 남기지 않습니다.'],
          },
          {
            type: 'warning',
            title: '권한이 넓다고 해서 영향이 자동으로 확정되지는 않는다',
            body: '합성 코드에서 넓은 권한이 보이면 “피해 범위를 키울 수 있는 설계 위험”으로 기록합니다. 실제 접근 가능 데이터나 운영 영향은 허가된 검증과 별도의 증거 없이는 단정하지 않습니다.',
          },
        ],
        misconception: ['Prepared Statement를 쓰면 DB 계정은 관리자 권한이어도 괜찮다.', '오류 화면을 일반 문구로 바꾸면 SQL 문자열 조립 문제도 해결된다.'],
        checkpoints: [
          { title: '최소 권한', prompt: '읽기 전용 검색 기능의 DB 역할에 가장 먼저 필요한 권한 조합은?', options: ['필요한 view 또는 열에 대한 SELECT만', '모든 테이블에 대한 ALL PRIVILEGES', 'DB 관리자와 동일한 권한'], answer: 0, explanation: '기능에 필요한 객체와 동작만 허용해 다른 결함의 영향 범위를 줄입니다.' },
          { title: '오류의 두 경로', prompt: '상세 DB 오류는 어디에 두는 것이 적절한가?', options: ['모든 사용자에게 그대로 표시', '접근이 통제된 내부 로그에 추적 ID와 함께 기록', '클라이언트 JavaScript 주석에 저장'], answer: 1, explanation: '사용자에게는 일반 오류를 제공하고, 운영 진단은 접근 제어된 기록에서 수행합니다.' },
        ],
        labId: week5ReviewLab.id,
        sourceIds: ['owaspSqli', 'cwe89', 'postgresGrant'],
        bullets: ['바인딩·권한·오류 처리·로그는 서로 다른 방어 책임을 가진다.', 'DB 역할은 기능별로 필요한 객체와 동작만 허용한다.', '오류 응답은 최소화하고 상세 진단은 마스킹된 내부 기록으로 분리한다.'],
      }),
    ],
    labs: [week5Lab, week5ReviewLab],
    deliverables: ['합성 Query Flow Note', '값·식별자 처리 경계표', 'DB 역할·오류 응답 방어 설계 메모', '정상 기준선 포함 재시험 기록'],
    recordBlueprint: { title: 'SQLi Observation Record', description: '입력 위치, 쿼리 경계, 값·식별자 처리, DB 권한, 오류 응답, 재시험 한계를 분리해 기록합니다.', sections: ['정상 기준선과 자산 범위', '합성 입력과 처리 경로', '값·SQL 구조·식별자 구분', '근본 원인과 방어 계층', 'DB 역할·오류 응답·로그 처리', '재시험과 남은 한계'] },
    reportConnection: '보고서에는 실제 DB 정보 대신 합성 fixture, 구조적 원인, 값 바인딩·허용 목록·권한·오류 처리의 역할, 정상 경로 재시험만 기록합니다.',
    next: 'Week 6 · CSRF: 브라우저 자격 증명과 상태 변경 요청',
  },
  6: {
    id: 'week-6', index: 6, title: 'CSRF·웹 종합: 요청의 정당성',
    summary: '브라우저 인증 상태와 요청 의도를 구분하고, CSRF token·SameSite·Origin·Fetch Metadata·재인증·객체별 인가를 각각의 역할로 읽은 뒤 합성 흐름에서 재시험합니다.',
    objectives: ['CSRF의 전제와 XSS·인증·인가·요청 정당성의 차이를 구분한다.', '상태 변경 endpoint와 안전하지 않은 GET 사용 여부를 식별한다.', 'CSRF token, SameSite, Origin·Referer, Fetch Metadata, 재인증의 역할과 한계를 설명한다.', '정상 요청·token 누락·허용되지 않은 출처·인가 실패의 합성 재시험을 구분한다.', 'CSRF 관찰을 구조적 원인·방어·한계가 분리된 기록으로 작성한다.'],
    prerequisites: ['Week 3 Cookie·Session·Origin', 'Week 4 XSS 데이터 흐름', 'Week 5의 구조적 방어와 재시험'],
    quizMinutes: 18,
    recordMinutes: 30,
    modules: [
      lesson({
        id: 'w6-state-change',
        title: '상태 변경 요청과 브라우저의 기본 동작',
        duration: 48,
        summary: 'CSRF를 이해하려면 먼저 HTTP 요청이 조회인지 상태 변경인지, 그리고 브라우저가 언제 인증 Cookie를 함께 보내는지 구분해야 합니다.',
        question: '같은 로그인 상태에서 브라우저가 요청을 보낸다는 사실만으로, 사용자가 그 상태 변경을 의도했다고 말할 수 있을까?',
        paragraphs: [
          'HTTP 메서드는 요청의 의미를 표현합니다. `GET`은 안전한 조회를 위해 사용해야 하며, 프로필 변경·송금·비밀번호 변경처럼 서버 상태를 바꾸는 동작은 보통 `POST`, `PUT`, `PATCH`, `DELETE`와 서버 측 검증을 사용합니다. GET으로 상태를 바꾸면 링크·미리보기·캐시 같은 예상하지 못한 경로에서도 동작할 수 있어 위험합니다.',
          '세션 Cookie는 브라우저가 특정 조건에서 요청과 함께 자동 전송할 수 있는 인증 수단입니다. 따라서 서버는 Cookie가 존재한다는 사실과 “이 요청이 사용자가 신뢰된 화면에서 의도한 요청인가”라는 사실을 분리해 검증해야 합니다.',
          '이 학습에는 고정된 합성 요청 전사만 사용합니다. 실제 사이트, 실제 브라우저 세션, 실제 Cookie나 token으로 요청을 보내지 않습니다.',
        ],
        nodes: ['사용자가 보는 기능', '상태 변경 endpoint와 HTTP 메서드', '브라우저의 인증 Cookie 전송 조건', '서버의 요청 정당성·인가 검증', '상태 변경 또는 안전한 거절'],
        details: [
          {
            type: 'comparison',
            title: '조회와 상태 변경을 구분하는 기준',
            columns: ['요청 성격', '예시', '서버에서 먼저 확인할 것'],
            rows: [
              ['조회', '내 프로필 보기', '누가 어떤 범위의 데이터를 읽을 수 있는가'],
              ['낮은 민감도 변경', '알림 수신 설정 변경', '요청 정당성·객체별 인가·정상 재시험'],
              ['높은 민감도 변경', '비밀번호·복구 수단·결제 수단 변경', '기본 통제와 함께 재인증·명시적 확인·감사 기록'],
              ['금지에 가까운 설계', 'GET으로 상태를 변경', '메서드와 서버 동작을 분리하고 안전한 상태 변경 흐름으로 재설계'],
            ],
          },
          {
            type: 'http-message',
            title: '상태 변경의 합성 기준선',
            description: '도메인과 Cookie는 교육용 표기입니다.',
            message: 'POST /training/notification-settings HTTP/1.1\nHost: app.training.local\nCookie: training_session=local-demo\nContent-Type: application/json\n\n{"weekly_digest":true}',
            annotations: ['Cookie는 인증 상태와 연결될 수 있습니다.', '이 요청이 사용자의 의도인지 확인하는 통제와, 대상 설정을 바꿀 권한이 있는지 확인하는 인가는 별도입니다.', '정상 기준선은 수정 뒤에도 기능이 유지되는지 비교하는 기준이 됩니다.'],
          },
        ],
        misconception: ['로그인 Cookie가 붙은 요청이면 사용자가 항상 직접 버튼을 눌렀다는 뜻이다.', 'GET 요청은 화면에서만 열리므로 서버 상태를 바꿔도 문제없다.'],
        checkpoints: [
          { title: '상태 변경', prompt: 'CSRF 관점에서 우선 목록화할 endpoint는?', options: ['서버의 상태를 변경하는 endpoint', '정적 이미지 파일', 'CSS 파일'], answer: 0, explanation: '먼저 상태를 바꾸는 기능과 HTTP 메서드를 식별해야 통제 적용 범위를 정할 수 있습니다.' },
          { title: 'GET의 역할', prompt: 'GET 메서드 사용으로 가장 적절한 것은?', options: ['상태를 바꾸지 않는 조회', '비밀번호 변경', '권한 부여'], answer: 0, explanation: '상태 변경은 GET에 두지 않고 서버 측 정당성 검증이 가능한 흐름으로 설계합니다.' },
        ],
        labId: week6Lab.id,
        sourceIds: ['owaspCsrf', 'mdnSetCookie', 'mdnCsrf'],
        bullets: ['상태 변경 여부는 화면 이름이 아니라 서버 동작과 HTTP 메서드로 판단한다.', '인증 Cookie의 존재와 요청 의도는 다른 검증 대상이다.', 'GET은 상태를 바꾸지 않는 조회에 사용한다.'],
      }),
      lesson({ id: 'w6-request-credentials', title: '브라우저 자격 증명과 상태 변경', duration: 40, summary: 'CSRF는 사용자가 이미 인증된 상태에서 브라우저가 요청에 자격 증명을 붙이는 조건과 연결됩니다.', question: '요청을 만들 수 있다는 사실과 그 요청이 사용자의 의도로 승인됐다는 사실은 왜 다른가?', paragraphs: ['브라우저는 같은 사이트 요청에 쿠키 같은 자격 증명을 자동으로 포함할 수 있습니다. 따라서 서버는 “쿠키가 있다”만으로 민감한 상태 변경 요청이 사용자의 의도라고 판단하면 안 됩니다.', 'CSRF는 인증을 우회한다기보다 이미 존재하는 인증 상태를 악용할 수 있는 요청 정당성 문제입니다. 이 주차는 합성 계정·합성 세션·고정 요청만 다룹니다.'], nodes: ['인증된 브라우저 상태', '상태 변경 요청 생성', '요청 정당성 통제', '서버 검증', '안전 처리 또는 거절'], misconception: ['쿠키가 붙은 요청은 항상 사용자가 직접 누른 요청이다.', 'CSRF token 하나만 있으면 모든 상태 변경 위험이 사라진다.'], checkpoints: [{ title: '전제', prompt: 'CSRF 검토에서 먼저 확인할 조건은?', options: ['인증된 브라우저 상태와 상태 변경 요청', '파일 확장자', 'CPU 온도'], answer: 0, explanation: '기존 인증 상태와 민감 동작의 연결을 봅니다.' }, { title: '구분', prompt: 'CSRF와 인증의 차이로 알맞은 것은?', options: ['CSRF는 기존 인증 상태의 요청 정당성을 검토한다', 'CSRF는 DNS 레코드만 바꾼다', 'CSRF는 파일 형식을 판별한다'], answer: 0, explanation: '인증 여부와 요청의 정당성은 구분해야 합니다.' }], labId: week6Lab.id, sourceIds: ['owaspCsrf', 'dreamhackCsrf'], bullets: ['인증 상태와 요청 의도는 다른 검증 대상이다.', '상태 변경 동작에는 추가 정당성 통제가 필요하다.', '합성 세션만 사용한다.'] }),
      lesson({ id: 'w6-csrf-controls', title: 'Token·SameSite·Origin의 역할', duration: 40, summary: '방어 통제는 같은 목적을 반복하는 하나의 버튼이 아니라 서로 다른 실패 경로를 줄이는 조합입니다.', question: '왜 token, SameSite, Origin 검증, 민감 동작 재인증을 같은 이름의 방어로 묶으면 안 될까?', paragraphs: ['CSRF token은 서버가 발급한 예측하기 어려운 값을 요청 맥락과 연결해 검증하는 방식입니다. SameSite는 쿠키 전송 범위를 조절하는 브라우저 속성이며, Origin·Referer 검증은 요청 출처 확인에 도움을 주는 보조 통제입니다.', '통제마다 적용 범위와 한계가 다릅니다. 민감 동작에는 재인증이나 명시적 확인을 더할 수 있고, 서버는 정상 요청과 거절 요청을 모두 기록해 재시험할 수 있어야 합니다.'], nodes: ['CSRF token 검증', 'SameSite 쿠키 조건', 'Origin·Referer 확인', '민감 동작 재인증', '정상·거절 요청 기록'], misconception: ['SameSite를 설정하면 서버가 token을 검증할 필요가 없다.', 'Origin 헤더가 있으면 객체별 인가도 자동으로 해결된다.'], checkpoints: [{ title: '통제 선택', prompt: '상태 변경 요청의 서버 측 검증으로 적절한 것은?', options: ['CSRF token을 세션·요청과 연결해 검증', '오류 메시지를 길게 출력', '쿠키 값을 화면에 표시'], answer: 0, explanation: '서버는 발급한 token과 요청 맥락을 확인해야 합니다.' }, { title: '한계', prompt: 'SameSite의 올바른 설명은?', options: ['교차 사이트 쿠키 전송 조건을 조절', '인가 정책을 대신하는 DB 기능', '모든 스크립트 실행을 막음'], answer: 0, explanation: 'SameSite는 쿠키 전송 조건을 줄이지만 서버 통제를 대체하지 않습니다.' }], labId: week6Lab.id, sourceIds: ['owaspCsrf'], bullets: ['통제마다 보호 범위와 한계가 다르다.', '서버는 token과 요청 맥락을 검증한다.', '재인증과 인가 검증은 별도 책임이다.'] }),
      lesson({ id: 'w6-web-retest', title: '웹 취약점 관찰을 종합하기', duration: 34, summary: 'XSS·SQLi·CSRF를 유형 이름보다 신뢰 경계, 정상 기준선, 방어·재시험으로 비교합니다.', question: '세 취약점을 같은 보고서 형식으로 비교할 때 공통으로 남겨야 할 근거는 무엇일까?', paragraphs: ['XSS는 브라우저 출력 해석, SQLi는 쿼리 문법과 데이터 경계, CSRF는 인증된 요청의 정당성에 초점을 둡니다. 하지만 모두 신뢰 경계에서 어떤 통제가 빠졌는지, 어떻게 수정·재시험했는지 기록할 수 있습니다.', '종합 기록에서는 공격 성공을 경쟁하지 않습니다. 정상 기준선, 합성 관찰값, 원인, 방어 선택, 수정 뒤 동일 조건의 결과와 한계를 남기면 다음 주차의 시스템 분석에도 같은 사고방식을 적용할 수 있습니다.'], nodes: ['정상 요청 기준선', '합성 처리 경로', '빠진 통제', '구조적 수정', '정상·거절 재시험'], misconception: ['유형 이름만 맞히면 방어를 설명할 수 있다.', '정상 요청을 기록하지 않아도 수정 효과를 비교할 수 있다.'], checkpoints: [{ title: '공통 기록', prompt: 'XSS·SQLi·CSRF 모두에 필요한 재시험 근거는?', options: ['정상 기준선과 수정 후 동일 조건 비교', '실제 사용자 데이터', '우회 문자열 목록'], answer: 0, explanation: '정상 경로와 수정 대상 경로를 같은 범위에서 비교합니다.' }, { title: '영향 표현', prompt: '합성 교육 결과만 있을 때 적절한 표현은?', options: ['운영 전체 영향 확정', '합성 조건에서 통제 누락 관찰', '영향 없음 확정'], answer: 1, explanation: '관찰 범위와 한계를 넘지 않는 표현을 사용합니다.' }], labId: week6Lab.id, sourceIds: ['owaspCsrf', 'owaspSqli'], bullets: ['유형보다 신뢰 경계와 통제 누락을 먼저 본다.', '정상 기준선은 재시험의 비교 대상이다.', '합성 관찰의 한계를 명시한다.'] }),
      lesson({
        id: 'w6-sensitive-actions',
        title: '민감한 상태 변경의 추가 보호',
        duration: 46,
        summary: '비밀번호·복구 수단·결제·권한처럼 영향이 큰 동작에는 기본 CSRF 통제 외에 재인증, 명시적 확인, 변경 알림, 감사 로그 같은 별도 보호가 필요합니다.',
        question: '모든 상태 변경에 같은 통제를 적용하는 대신, 기능의 영향과 사용자의 현재 인증 강도를 함께 고려해야 하는 이유는 무엇일까?',
        paragraphs: [
          'CSRF token과 출처 검증은 상태 변경 요청의 정당성을 확인하는 기본 통제입니다. 그러나 비밀번호 변경, 권한 변경, 결제 수단 등록처럼 계정 탈취·금전·개인정보 위험이 큰 작업은 최근 인증 여부를 다시 확인하거나 사용자의 명시적 확인 단계를 요구하는 것이 적절할 수 있습니다.',
          '추가 확인은 자동화된 모든 위험을 없애는 만능 장치가 아닙니다. 서버는 여전히 token·출처·객체별 인가를 검증해야 하며, 변경 후 알림과 감사 로그는 사용자가 예상하지 못한 상태 변화를 발견하고 대응하는 데 도움을 줍니다.',
          '설계에서는 보안 강도와 사용성·복구 흐름을 함께 검토합니다. 예를 들어 접근성 지원, 여러 도메인에서 동작하는 합법적 결제 흐름, 오래된 클라이언트의 fallback은 무조건 차단하기 전에 명시적으로 모델링하고 재시험합니다.',
        ],
        nodes: ['민감 동작 분류', '기본 CSRF·인가 통제', '최근 인증·명시적 확인', '변경 알림·감사 기록', '정상·거절·복구 흐름 재시험'],
        details: [
          {
            type: 'comparison',
            title: '민감도에 따라 추가할 보호',
            columns: ['기능 예', '기본 통제', '추가 검토'],
            rows: [
              ['프로필 표시 이름 변경', 'token·출처·객체별 인가', '정상·거절 요청 재시험'],
              ['이메일·복구 수단 변경', '기본 통제 + 현재 비밀번호 또는 최근 인증', '기존 연락처 알림·복구 경로'],
              ['권한·관리자 역할 변경', '기본 통제 + 강한 재인증·직무 분리', '감사 로그·승인·변경 검토'],
              ['결제·송금 승인', '기본 통제 + 거래별 명시적 확인', '수취인·금액 재확인·변경 알림'],
            ],
          },
          {
            type: 'case',
            title: '기능 요구사항을 보안 요구사항으로 바꾸기',
            body: '“이메일을 바꿀 수 있다”는 기능 요구를 “현재 로그인 상태, CSRF token, 객체별 인가, 최근 인증, 기존 주소 알림, 변경 이력”으로 분해하면 개발·QA·보안이 같은 조건을 재시험할 수 있습니다.',
            facts: ['재인증은 기본 token 검증을 제거하는 근거가 아니다.', '알림·감사 로그에는 token·Cookie·비밀번호를 남기지 않는다.', '합법적인 cross-site 흐름은 문서화하고 명시적으로 허용한다.'],
          },
        ],
        misconception: ['재인증을 붙이면 token과 객체별 인가를 생략해도 된다.', '사용자 확인 화면이 있으면 서버가 요청 출처를 검증할 필요가 없다.'],
        checkpoints: [
          { title: '추가 보호', prompt: '비밀번호 변경처럼 민감한 작업에 기본 통제와 함께 검토할 보호는?', options: ['최근 인증 또는 명시적 확인과 변경 알림', 'GET 메서드로 변경', 'Cookie 값을 화면에 표시'], answer: 0, explanation: '민감한 동작은 기본 요청 정당성 통제 위에 최근 인증·명시적 확인·알림을 추가로 검토합니다.' },
          { title: '통제 조합', prompt: '재인증을 적용한 뒤에도 필요한 검증은?', options: ['CSRF token·출처·객체별 인가', '서버 검증 없이 클라이언트 확인만', '오류 로그 전체 공개'], answer: 0, explanation: '재인증은 추가 보호이며 요청 정당성 및 인가 검증을 대체하지 않습니다.' },
        ],
        labId: week6ReviewLab.id,
        sourceIds: ['owaspCsrf', 'mdnCsrf'],
        bullets: ['민감도가 높은 변경에는 최근 인증·명시적 확인·알림·감사 기록을 추가로 검토한다.', '추가 보호는 token·출처·인가 검증을 대체하지 않는다.', '정상 변경과 복구 흐름까지 포함해 재시험한다.'],
      }),
    ],
    labs: [week6Lab, week6ReviewLab],
    deliverables: ['상태 변경 endpoint·HTTP 메서드 목록', 'CSRF 통제 역할 매트릭스', '합성 endpoint 방어 설계 검토', '정상·거절 요청 재시험 기록', 'XSS·SQLi·CSRF 경계 비교표'],
    recordBlueprint: { title: 'Web Request Integrity Record', description: '상태 변경, 인증·인가·요청 정당성, 통제 역할, 합성 관찰, 재시험과 한계를 분리합니다.', sections: ['자산·상태 변경 endpoint·HTTP 메서드', '정상 요청 기준선', '인증·인가·요청 정당성 구분', 'token·Cookie·출처·Fetch Metadata 통제', '합성 관찰 사실과 구조적 원인', '정상·거절 재시험과 fallback', '마스킹·한계·다음 확인'] },
    reportConnection: '웹 보고서에는 실제 Cookie·token·계정 대신 합성 요청의 구조, 통제별 역할, 정상·거절 재시험 결과와 지원되지 않는 클라이언트의 fallback만 기록합니다.',
    next: 'Week 7 · C와 컴퓨터 구조: 프로그램이 메모리를 사용하는 방식',
  },
  7: {
    id: 'week-7', index: 7, title: 'C·컴퓨터 구조·메모리 레이아웃',
    summary: '작은 C 프로그램의 소스·컴파일 결과·주소·메모리 영역을 연결해 이후 어셈블리와 디버깅의 기준선을 만듭니다.',
    objectives: ['C의 값·주소·포인터·배열을 구분한다.', '컴파일·링크·실행의 역할을 설명한다.', '코드·데이터·힙·스택 같은 프로세스 메모리 영역을 관찰한다.'],
    prerequisites: ['Week 1~2 Linux 파일·명령 기초', '텍스트 파일과 터미널 출력 읽기'],
    quizMinutes: 18,
    recordMinutes: 30,
    modules: [
      lesson({ id: 'w7-c-values', title: '값·주소·포인터의 구분', duration: 40, summary: '변수의 값, 메모리 위치를 나타내는 주소, 주소를 저장하는 포인터를 서로 다른 층으로 읽습니다.', question: '포인터 변수가 가진 값과 포인터가 가리키는 대상의 값은 왜 구분해야 할까?', paragraphs: ['C에서 변수는 값을 저장하고, 주소 연산자는 그 값이 놓인 위치를 얻으며, 포인터는 그 위치를 값으로 저장합니다. 같은 숫자처럼 보여도 데이터 값·주소 값·배열 인덱스는 의미가 다릅니다.', '이 과정은 합성 C 코드와 고정 출력만 사용합니다. 주소를 계산해 다른 프로세스를 조작하거나 임의 메모리를 읽는 방법은 다루지 않고, 함수 호출 전후에 어떤 값이 어느 영역에 놓이는지 관찰합니다.'], nodes: ['정수 변수의 값', '변수의 메모리 위치', '주소를 담는 포인터', '포인터를 통한 읽기·쓰기의 의미'], misconception: ['포인터는 항상 위험한 문자열이다.', '주소를 출력하면 다른 프로그램의 메모리도 자유롭게 읽을 수 있다.'], checkpoints: [{ title: '포인터의 값', prompt: '포인터 변수에 직접 저장되는 것은?', options: ['가리키는 대상의 복사본', '대상이 있는 메모리 위치', '항상 문자열 길이'], answer: 1, explanation: '포인터는 보통 대상 위치를 나타내는 주소 값을 저장합니다.' }, { title: '안전 범위', prompt: '이 주차에서 허용하는 관찰은?', options: ['제공된 합성 프로그램의 고정 출력 비교', '다른 사용자 프로세스 메모리 읽기', '실제 서비스 메모리 스캔'], answer: 0, explanation: '제공된 합성 자료와 로컬 관찰만 사용합니다.' }], labId: week7Lab.id, sourceIds: ['gcc'], bullets: ['값·주소·포인터는 다른 의미를 가진다.', '관찰은 제공된 합성 프로그램 범위에 한정한다.', '다음 주 호출 흐름을 읽기 위한 기초가 된다.'] }),
      lesson({ id: 'w7-build-flow', title: '컴파일·링크·실행 파일', duration: 38, summary: '소스 코드가 컴파일·링크를 거쳐 실행 파일이 되는 흐름과 디버그 정보의 목적을 구분합니다.', question: '소스 파일과 실행 파일, 라이브러리, 디버그 정보는 각각 어떤 질문에 답할까?', paragraphs: ['컴파일러는 소스 코드를 기계가 실행할 수 있는 형태로 바꾸고, 링커는 필요한 코드와 라이브러리를 연결합니다. 실행 파일 형식은 코드·데이터·메타데이터를 담는 그릇이며, 디버그 정보는 관찰 도구가 소스 수준 이름을 보여 주는 데 도움을 줍니다.', '보안 관점에서는 빌드 옵션과 실행 파일 메타데이터가 보호 기법·관찰 가능성에 영향을 줄 수 있음을 먼저 이해합니다. 이 주차는 컴파일 결과를 읽는 기초이며 우회나 변조 절차가 아닙니다.'], nodes: ['소스 코드', '컴파일', '오브젝트 코드', '라이브러리 링크', '실행 파일·디버그 정보'], misconception: ['컴파일이 끝나면 라이브러리와 실행 파일 구조는 중요하지 않다.', '디버그 정보가 있으면 모든 오류 원인이 자동으로 확정된다.'], checkpoints: [{ title: '링크의 역할', prompt: '링커가 하는 일로 가장 알맞은 것은?', options: ['오브젝트와 라이브러리를 실행 가능한 프로그램으로 연결', '쿠키 발급', '네트워크 패킷 캡처'], answer: 0, explanation: '링커는 여러 코드 조각과 라이브러리 참조를 연결합니다.' }, { title: '디버그 정보', prompt: '디버그 정보의 교육적 가치는?', options: ['관찰 결과를 소스 수준 이름과 연결', '보호 기법을 모두 해제', '실제 계정을 생성'], answer: 0, explanation: '함수·파일·줄 같은 맥락을 보여 주는 데 도움을 줍니다.' }], labId: week7Lab.id, sourceIds: ['gcc', 'abi'], bullets: ['컴파일과 링크는 다른 단계다.', '실행 파일에는 코드 외의 메타데이터도 있다.', '디버그 정보는 관찰을 돕지만 결론을 대신하지 않는다.'] }),
      lesson({ id: 'w7-memory-layout', title: '프로세스 메모리 레이아웃', duration: 40, summary: '코드·전역 데이터·힙·스택의 역할을 작은 함수 호출과 동적 할당 예에서 비교합니다.', question: '스택과 힙을 단순히 위치가 아니라 수명과 소유 관점으로 구분하려면 무엇을 봐야 할까?', paragraphs: ['코드 영역은 실행 명령을, 전역·정적 데이터 영역은 프로그램 동안 유지되는 값을, 스택은 함수 호출과 함께 생기는 지역 상태를, 힙은 동적 요청으로 얻는 저장 공간을 다룹니다. 실제 배치는 운영체제와 빌드 조건에 따라 달라질 수 있습니다.', '학습자는 고정된 메모리 지도에서 변수의 수명과 함수 호출 관계를 읽습니다. 주소 숫자 자체를 외우는 대신 어떤 값이 어느 수명·권한·소유 규칙 아래 있는지 설명하는 것이 목표입니다.'], nodes: ['코드 영역', '전역·정적 데이터', '동적 힙 요청', '함수 스택 프레임', '수명·소유 관계'], misconception: ['스택은 항상 안전하고 힙만 위험하다.', '메모리 영역의 절대 주소는 모든 실행에서 같다.'], checkpoints: [{ title: '수명', prompt: '함수 지역 변수의 수명과 가장 가까운 영역은?', options: ['스택 프레임', 'DNS 캐시', 'HTTP 헤더'], answer: 0, explanation: '지역 상태는 보통 호출 프레임과 연결됩니다.' }, { title: '관찰 태도', prompt: '메모리 지도에서 우선 기록할 것은?', options: ['절대 주소 암기', '값의 역할·수명·호출 관계', '실제 대상 주소 수집'], answer: 1, explanation: '역할과 수명을 이해하면 환경이 바뀌어도 설명할 수 있습니다.' }], labId: week7Lab.id, sourceIds: ['gcc', 'abi'], bullets: ['메모리 영역은 역할과 수명으로 읽는다.', '스택·힙은 소유·수명·검증과 연결된다.', '절대 주소가 아니라 관계를 기록한다.'] }),
    ],
    labs: [week7Lab],
    deliverables: ['C Program Memory Map', '값·주소·포인터 비교 메모', '함수 호출 전후 수명 관찰 기록'],
    recordBlueprint: { title: 'C Memory Observation Note', description: '합성 C 프로그램에서 값·주소·메모리 영역·수명을 구분해 기록합니다.', sections: ['프로그램과 빌드 기준선', '값·주소·포인터 관찰', '메모리 영역과 수명', '합성 범위와 한계', '다음 호출 흐름 질문'] },
    reportConnection: '시스템 분석 기록에는 실제 주소나 다른 프로세스 정보 대신 합성 프로그램의 역할·수명·경계만 남깁니다.',
    next: 'Week 8 · x86-64와 호출 규약: 함수 호출이 상태를 전달하는 방식',
  },
  8: {
    id: 'week-8', index: 8, title: 'x86-64 어셈블리·호출 규약',
    summary: 'C 함수가 x86-64 명령과 레지스터·스택 프레임으로 연결되는 흐름을 합성 전사에서 읽습니다.',
    objectives: ['명령·레지스터·메모리 접근의 역할을 구분한다.', 'call·ret과 스택 프레임의 목적을 설명한다.', 'SysV x86-64 호출 규약에서 인자·반환값 관찰의 기준을 세운다.'],
    prerequisites: ['Week 7 C 함수·주소·메모리 레이아웃', '함수 호출과 지역 변수의 기초'],
    quizMinutes: 18,
    recordMinutes: 30,
    modules: [
      lesson({ id: 'w8-instruction-flow', title: '명령 흐름과 레지스터', duration: 38, summary: '어셈블리는 CPU가 수행할 작은 동작을 표현하며, 레지스터는 실행 중인 짧은 상태를 보관합니다.', question: 'C 코드 한 줄과 어셈블리 여러 줄의 관계를 볼 때 무엇을 대응시켜야 할까?', paragraphs: ['어셈블리는 값 이동, 산술, 비교, 분기, 함수 호출처럼 CPU 수준의 동작을 표현합니다. 레지스터는 함수 인자·중간 계산·반환값·제어 흐름과 연결된 빠른 저장 공간입니다.', '이 주차는 제공된 C 함수와 합성 디스어셈블리의 대응만 읽습니다. 기계어를 수정하거나 보호 기법을 우회하는 절차가 아니라, 명령이 어떤 C 수준 의도를 구현하는지 설명하는 관찰입니다.'], nodes: ['C 함수 입력', '레지스터로 값 전달', '산술·비교 명령', '분기 또는 호출', '반환값 관찰'], misconception: ['명령 하나는 항상 C 코드 한 줄과 정확히 일치한다.', '레지스터 값만 보면 프로그램의 보안 영향도 바로 확정된다.'], checkpoints: [{ title: '레지스터', prompt: '레지스터의 역할로 가장 가까운 것은?', options: ['실행 중인 인자·계산 상태 보관', '영구 파일 저장', 'DB 백업'], answer: 0, explanation: '레지스터는 CPU 실행 상태와 가까운 저장 공간입니다.' }, { title: '관찰 범위', prompt: '이 주차의 합성 디스어셈블리에서 하는 일은?', options: ['제공된 C 함수와 명령 흐름 대응', '임의 바이너리 변조', '실제 서비스 메모리 접근'], answer: 0, explanation: '제공된 교육용 코드와 전사만 관찰합니다.' }], labId: week8Lab.id, sourceIds: ['abi'], bullets: ['명령은 C 수준 의도를 작은 동작으로 나눈다.', '레지스터는 인자·중간값·반환과 연결된다.', '관찰 결과와 영향 판단을 분리한다.'] }),
      lesson({ id: 'w8-stack-frame', title: 'call·ret과 스택 프레임', duration: 40, summary: '함수 호출은 돌아올 위치와 지역 상태를 관리하며, 스택 프레임은 그 호출 맥락을 정리합니다.', question: '함수 호출 전후의 스택 관찰에서 복귀 위치와 지역 상태를 나눠 보는 이유는 무엇일까?', paragraphs: ['call은 다음 실행 위치를 저장하고 함수로 제어를 옮기며, ret은 저장된 위치로 돌아갑니다. 함수는 필요에 따라 스택에 지역 상태와 저장 레지스터를 위한 공간을 만들고, 반환 전 이를 정리합니다.', '스택 프레임의 구체적 모양은 컴파일 옵션과 최적화에 따라 달라질 수 있습니다. 따라서 고정 오프셋을 외우는 대신 호출 전후의 상태 변화와 함수 책임을 합성 전사에서 비교합니다.'], nodes: ['호출자 상태', '인자 준비', 'call과 복귀 위치', '피호출 함수 지역 상태', 'ret과 반환값'], misconception: ['모든 함수는 항상 같은 크기의 스택 프레임을 만든다.', 'ret을 이해하면 취약점 영향도 자동으로 증명된다.'], checkpoints: [{ title: 'call의 목적', prompt: 'call이 하는 역할로 알맞은 것은?', options: ['함수로 제어를 옮기고 복귀 위치 보관', '파일 권한 변경', '쿠키 삭제'], answer: 0, explanation: '함수 호출과 복귀의 제어 흐름을 연결합니다.' }, { title: '프레임 해석', prompt: '스택 프레임 관찰에서 환경에 따라 달라질 수 있는 것은?', options: ['컴파일 최적화에 따른 구체적 배치', '함수 호출의 개념', '합성 자료만 사용한다는 안전 범위'], answer: 0, explanation: '구체적 명령과 배치는 빌드 조건에 따라 달라질 수 있습니다.' }], labId: week8Lab.id, sourceIds: ['abi', 'gdb'], bullets: ['call·ret은 호출과 복귀의 제어 흐름이다.', '스택 프레임은 호출 맥락과 지역 상태를 정리한다.', '고정 숫자보다 상태 변화와 책임을 기록한다.'] }),
      lesson({ id: 'w8-calling-convention', title: 'SysV 호출 규약과 관찰 기록', duration: 38, summary: '호출 규약은 함수 사이에서 인자·반환값·저장 책임을 일관되게 전달하기 위한 약속입니다.', question: '호출 규약을 모르면 C 함수와 레지스터 전사를 연결하기 어려운 이유는 무엇일까?', paragraphs: ['호출 규약은 인자를 어디에 두고, 반환값을 어디에서 읽으며, 호출자와 피호출자 중 누가 어떤 상태를 보존하는지 정합니다. x86-64 SysV 환경에서는 초기 인자와 반환값에 자주 쓰이는 레지스터가 있지만 실제 관찰은 함수 선언·컴파일 조건과 함께 해야 합니다.', '이 주차에서는 제공된 함수 하나의 합성 호출 전사에서 인자와 반환값 표지를 찾습니다. 실제 프로세스에 연결하거나 원격 환경에 값을 보내지 않고, 다음 주 GDB에서 확인할 관찰 질문을 준비합니다.'], nodes: ['함수 선언', '인자 전달 약속', '호출자·피호출자 책임', '반환값 위치', 'GDB 확인 질문'], misconception: ['호출 규약은 CPU 제조사마다 완전히 무작위다.', '인자 위치를 알면 아무 프로그램에나 값을 넣어도 된다.'], checkpoints: [{ title: '약속의 목적', prompt: '호출 규약이 정하는 것으로 알맞은 것은?', options: ['함수 사이 인자·반환·저장 책임', 'DNS 레코드', 'SQL 문법'], answer: 0, explanation: '서로 다른 코드가 일관되게 함수를 호출하도록 돕는 약속입니다.' }, { title: '다음 주 연결', prompt: 'GDB 관찰 전에 남길 좋은 질문은?', options: ['어떤 인자와 반환값이 어느 상태 변화와 연결되는가', '실제 원격 주소는 무엇인가', '어떤 공격 문자열이 가장 긴가'], answer: 0, explanation: '다음 주에는 합성 로컬 실행에서 그 상태 변화를 확인합니다.' }], labId: week8Lab.id, sourceIds: ['abi', 'gdb'], bullets: ['호출 규약은 함수 사이의 공통 언어다.', '인자·반환값은 선언과 빌드 조건 맥락에서 관찰한다.', '다음 디버깅 질문을 구체화한다.'] }),
    ],
    labs: [week8Lab],
    deliverables: ['C-to-Assembly Trace', '함수 호출 상태 표', '다음 GDB 관찰 질문'],
    recordBlueprint: { title: 'Calling Convention Observation Note', description: 'C 함수 선언과 합성 전사를 연결해 인자·제어 흐름·반환값을 기록합니다.', sections: ['함수 선언과 기준선', '인자 준비 관찰', 'call·ret과 스택 상태', '반환값 관찰', 'GDB 확인 질문과 한계'] },
    reportConnection: '시스템 관찰 보고서는 실제 주소나 악용 절차 대신 함수 경계·상태 변화·관찰 한계를 남깁니다.',
    next: 'Week 9 · GDB와 Pwntools: 로컬 실행 기록을 재현 가능하게 만들기',
  },
  9: {
    id: 'week-9', index: 9, title: 'GDB·Pwntools: 로컬 관찰 자동화',
    summary: '제공된 로컬 교육 프로그램의 정상·오류 흐름을 GDB 전사와 작은 입출력 드라이버로 관찰하고 기록합니다.',
    objectives: ['breakpoint·step·backtrace·register 관찰의 역할을 구분한다.', '바이트 순서와 텍스트 입력을 구분한다.', 'Pwntools를 로컬 교육 프로세스의 반복 가능한 입출력 기록 도구로 사용한다.'],
    prerequisites: ['Week 7 C·메모리 레이아웃', 'Week 8 함수 호출·레지스터 관찰'],
    quizMinutes: 18,
    recordMinutes: 30,
    modules: [
      lesson({ id: 'w9-debugger-flow', title: 'GDB로 실행 흐름 관찰하기', duration: 40, summary: '디버거는 프로그램을 멈추고 상태를 관찰하는 도구이며, 관찰 결과와 추론을 분리해 기록해야 합니다.', question: 'breakpoint에서 멈췄다는 사실과 오류 원인을 안다는 사실은 왜 다른가?', paragraphs: ['breakpoint는 특정 위치에서 실행을 멈춰 변수·호출 스택·레지스터 같은 상태를 볼 수 있게 합니다. step 계열 명령은 다음 실행 흐름을 관찰하게 하지만, 한 번의 상태만으로 원인·영향을 확정하지 않습니다.', '이 주차는 제공된 로컬 교육 프로그램의 합성 전사와 제한된 실행 흐름을 다룹니다. 임의 바이너리, 실제 서비스, 원격 연결은 사용하지 않으며 모든 기록은 정상 기준선과 한 조건만 바꾼 fixture를 비교합니다.'], nodes: ['정상 fixture 실행', '중단점에서 상태 관찰', '호출·값·오류 상태 비교', '한 조건만 바꾼 fixture', '가설·한계·재시험 기록'], misconception: ['중단점 하나를 찍으면 원인과 영향이 모두 확정된다.', '디버거는 실제 대상에 먼저 실행해도 되는 안전한 도구다.'], checkpoints: [{ title: 'breakpoint', prompt: 'breakpoint의 목적은?', options: ['특정 위치에서 실행을 멈춰 상태를 관찰', '서버 로그 삭제', '쿠키 암호화'], answer: 0, explanation: '관찰 가능한 지점을 만들지만 원인 판단은 별도 근거가 필요합니다.' }, { title: '비교 기준', prompt: '오류 fixture를 읽기 전에 필요한 것은?', options: ['정상 fixture의 기준선', '실제 사용자 입력', '원격 호스트 목록'], answer: 0, explanation: '정상 기준선이 있어야 달라진 상태를 설명할 수 있습니다.' }], labId: week9Lab.id, sourceIds: ['gdb'], bullets: ['디버거는 상태 관찰 도구다.', '정상 기준선과 한 조건 변경을 비교한다.', '관찰 사실과 원인 가설을 분리한다.'] }),
      lesson({ id: 'w9-bytes-io', title: '바이트·텍스트·입출력 기록', duration: 36, summary: '프로그램 입력은 사람이 읽는 텍스트와 바이트열의 표현이 다를 수 있으며, 길이·인코딩·종료 문자를 함께 관찰합니다.', question: '화면에 같은 문자로 보이는 입력도 프로그램에는 다른 바이트열로 전달될 수 있는 이유는 무엇일까?', paragraphs: ['텍스트는 인코딩을 거쳐 바이트열로 전달되고, 줄바꿈이나 길이 표기는 프로그램의 입력 처리에 영향을 줄 수 있습니다. 따라서 관찰 기록에는 무엇을 입력했는지뿐 아니라 입력 형식·길이·표현·예상 결과를 남깁니다.', '이 과정에서는 고정된 교육용 입력만 사용합니다. 바이트 단위를 이해하는 목적은 원격 서비스에 임의 데이터를 보내는 것이 아니라, 로컬 정상·오류 fixture의 차이와 프로그램 경계를 정확히 설명하는 것입니다.'], nodes: ['텍스트 표현', '인코딩된 바이트열', '길이·종료 조건', '프로그램 입력 처리', '관찰 기록'], misconception: ['문자 수와 바이트 수는 언제나 같다.', '입력 길이를 기록하면 인코딩은 확인하지 않아도 된다.'], checkpoints: [{ title: '관찰 항목', prompt: '로컬 입력 기록에 가장 도움이 되는 조합은?', options: ['텍스트·바이트 길이·종료 조건', '실제 비밀·원격 주소', '브라우저 테마'], answer: 0, explanation: '표현과 경계를 함께 기록해야 재현 가능한 입출력이 됩니다.' }, { title: '한계', prompt: '바이트 표현을 안다고 해서 바로 알 수 없는 것은?', options: ['입력 길이', '원격 대상에 대한 허가', '줄바꿈 존재'], answer: 1, explanation: '기술 지식은 테스트 허가나 범위를 대신하지 않습니다.' }], labId: week9Lab.id, sourceIds: ['gdb', 'pwntools'], bullets: ['텍스트 표현과 바이트열을 구분한다.', '입력 형식·길이·종료 조건을 기록한다.', '기술 관찰은 허가 범위를 대체하지 않는다.'] }),
      lesson({ id: 'w9-local-driver', title: 'Pwntools를 로컬 반복 관찰에 쓰기', duration: 38, summary: 'Pwntools는 반복 가능한 입출력·바이트 처리 도구이며, 이 과정에서는 제공된 로컬 교육 프로세스의 기록 자동화에만 사용합니다.', question: '자동화 스크립트를 관찰 기록 도구로 쓰려면 무엇을 고정해야 할까?', paragraphs: ['반복 관찰에서는 실행 파일, fixture, 입력 순서, 예상 프롬프트, 결과 저장 위치를 고정해야 비교가 가능합니다. Pwntools는 로컬 프로세스와의 입출력, 바이트 단위 처리 같은 작업을 도울 수 있지만, 스크립트가 결과의 의미나 허가 범위를 대신 판정하지는 않습니다.', '이 주차의 드라이버는 네트워크 연결·원격 호스트·실제 비밀을 사용하지 않습니다. 정상 fixture와 오류 fixture를 같은 순서로 실행해 출력 차이를 남기고, 다음 주 메모리 안전성 수정의 재시험 기반을 준비합니다.'], nodes: ['고정 fixture', '로컬 프로세스 실행', '입력 순서 기록', '예상 출력 비교', '재시험 로그 보관'], misconception: ['자동화하면 관찰 근거를 사람이 확인할 필요가 없다.', 'Pwntools를 쓰면 원격 대상도 교육 범위가 된다.'], checkpoints: [{ title: '고정할 것', prompt: '반복 가능한 로컬 관찰에서 고정해야 할 것은?', options: ['fixture·입력 순서·예상 출력', '실제 사용자 계정', '원격 포트 탐색 범위'], answer: 0, explanation: '같은 조건을 유지해야 결과 차이를 비교할 수 있습니다.' }, { title: '도구의 한계', prompt: 'Pwntools가 대신해 주지 않는 것은?', options: ['입출력 자동화', '관찰 결과의 의미와 허가 판단', '바이트 처리 보조'], answer: 1, explanation: '도구는 기록을 돕지만 결론과 범위 판단은 사람이 해야 합니다.' }], labId: week9Lab.id, sourceIds: ['pwntools', 'gdb'], bullets: ['자동화는 같은 조건의 관찰을 돕는다.', '도구 출력과 결론·허가 판단은 분리한다.', '로컬 fixture만 사용한다.'] }),
    ],
    labs: [week9Lab],
    deliverables: ['Debugging Notebook', '정상·오류 fixture 비교표', '로컬 입출력 재현 규격'],
    recordBlueprint: { title: 'Local Debugging Record', description: '정상 기준선, 합성 전사, 입력 형식, 관찰 사실, 가설, 재시험 조건을 분리합니다.', sections: ['로컬 fixture와 안전 범위', '정상 실행 기준선', '중단점·입력 형식 관찰', '가설과 한계', '반복 재시험 조건'] },
    reportConnection: '디버깅 기록에는 실제 주소·실제 대상·자격 증명 대신 합성 fixture와 관찰한 상태 변화만 남깁니다.',
    next: 'Week 10 · 메모리 안전성: 경계 검증과 보호 기법의 역할',
  },
  10: {
    id: 'week-10', index: 10, title: '메모리 안전성·BOF 완화기법',
    summary: '버퍼 경계 검증 실패의 원인과 NX·ASLR·PIE·Canary 같은 완화기법의 역할을 합성 코드·재시험으로 분석합니다.',
    objectives: ['경계 검증 실패와 메모리 손상 가능성을 구분해 설명한다.', 'NX·ASLR·PIE·Canary가 줄이는 위험과 한계를 설명한다.', '합성 취약 코드의 수정·정상 경로 재시험을 기록한다.'],
    prerequisites: ['Week 7 메모리 레이아웃', 'Week 8 함수 호출·스택 프레임', 'Week 9 정상·오류 fixture 관찰'],
    quizMinutes: 18,
    recordMinutes: 30,
    modules: [
      lesson({ id: 'w10-bounds', title: '경계 검증과 메모리 안전성', duration: 42, summary: '입력 길이·버퍼 크기·복사 범위를 맞추지 못하면 프로그램 신뢰성이 깨질 수 있으며, 원인은 경계 검증 설계에서 찾습니다.', question: '버퍼가 작다는 말보다 입력 길이를 검증하지 않은 복사 경로가 더 좋은 원인 설명인 이유는 무엇일까?', paragraphs: ['메모리 안전성 문제는 데이터 크기와 허용된 저장 범위를 확인하지 않은 채 읽기·쓰기·복사를 수행할 때 생길 수 있습니다. 좋은 분석은 특정 입력을 과시하는 대신 어떤 길이·경계·오류 처리가 빠졌는지와 안전한 실패 조건을 설명합니다.', '이 주차의 코드는 브라우저에 표시되는 합성 예제입니다. 실제 셸 획득, 보호 우회, 원격 프로세스 제어는 다루지 않으며, 경계 검사·안전한 API·오류 처리·회귀 테스트의 방어 관점을 학습합니다.'], nodes: ['입력 길이 확인', '대상 용량 비교', '안전한 거절 또는 복사', '오류 기록', '정상 fixture 재시험'], misconception: ['버퍼 크기를 크게 잡으면 모든 경계 검증이 필요 없어지는다.', '크래시가 없으면 메모리 안전성 문제도 없었다.'], checkpoints: [{ title: '원인 설명', prompt: '구조적 원인 설명으로 가장 알맞은 것은?', options: ['입력이 이상함', '복사 전 입력 길이와 대상 경계를 검증하지 않음', '보호 기법 이름을 모름'], answer: 1, explanation: '경계 검증 누락을 설명해야 안전한 수정으로 이어집니다.' }, { title: '안전한 실패', prompt: '입력이 허용 범위를 넘을 때 적절한 동작은?', options: ['경계를 무시하고 계속 복사', '안전한 오류 반환과 기록', '실제 대상에 다시 전송'], answer: 1, explanation: '경계를 확인하고 안전하게 거절한 뒤 재시험합니다.' }], labId: week10Lab.id, sourceIds: ['cwe120', 'cwe787'], bullets: ['원인은 입력 길이와 대상 경계의 검증 누락으로 설명한다.', '안전한 실패·오류 처리·회귀 테스트가 함께 필요하다.', '실제 공격 절차는 교육 범위가 아니다.'] }),
      lesson({ id: 'w10-mitigations', title: 'NX·ASLR·PIE·Canary의 역할과 한계', duration: 40, summary: '완화기법은 피해 가능성을 줄이는 방어층이며, 입력 경계 검증과 안전한 설계를 대체하지 않습니다.', question: '보호 기법이 켜진 빌드에서도 근본 원인 수정이 필요한 이유는 무엇일까?', paragraphs: ['NX는 특정 메모리 영역의 실행을 제한하고, ASLR·PIE는 배치 예측을 어렵게 하며, Canary는 일부 스택 손상 징후를 탐지하는 데 도움을 줍니다. 각각이 줄이는 경로와 적용 조건은 다릅니다.', '하지만 완화기법은 구현 결함이 존재하지 않게 만들지는 않습니다. 경계 검증, 안전한 API, 최소 권한, 오류 처리, 테스트가 근본 원인을 줄이고 완화기법은 그 위의 추가 방어층으로 작동합니다.'], nodes: ['근본 원인 수정', 'Canary 손상 징후', 'NX 실행 제한', 'ASLR·PIE 배치 다양화', '정상·실패 재시험'], misconception: ['Canary가 있으면 어떤 입력도 안전하다.', 'ASLR을 쓰면 버그를 수정하지 않아도 된다.'], checkpoints: [{ title: '방어층', prompt: '근본 원인 수정과 별도로 완화기법을 쓰는 이유는?', options: ['서로 다른 실패 경로를 줄이기 위해', '코드 검토를 없애기 위해', '실제 서비스에 시험하기 위해'], answer: 0, explanation: '여러 통제는 서로 다른 경로와 영향 범위를 줄입니다.' }, { title: '한계', prompt: 'NX의 설명으로 적절한 것은?', options: ['특정 메모리 영역 실행을 제한하는 방어층', '입력 길이를 자동으로 검증하는 함수', 'DB 권한을 관리하는 정책'], answer: 0, explanation: 'NX는 실행 권한을 제한하지만 입력 경계 검증을 대체하지 않습니다.' }], labId: week10Lab.id, sourceIds: ['gcc', 'cwe120'], bullets: ['완화기법은 근본 수정의 대체물이 아니다.', '각 통제는 다른 실패 경로를 줄인다.', '방어층과 재시험을 함께 기록한다.'] }),
      lesson({ id: 'w10-retest', title: '수정과 재시험: 크래시보다 경계 확인', duration: 36, summary: '합성 경계 초과 fixture와 정상 fixture를 비교해 수정이 안전한 거절과 정상 기능 유지를 모두 만족하는지 확인합니다.', question: '수정 후 오류 fixture가 거절된 것만으로 왜 완료라고 할 수 없을까?', paragraphs: ['수정은 경계 초과 입력을 안전하게 거절해야 하고, 정상 입력이 같은 기능을 계속 수행하는지도 확인해야 합니다. 이 두 결과를 함께 남겨야 오류를 숨긴 것이 아니라 동작을 안전하게 바꿨다고 설명할 수 있습니다.', '보고서에서는 보호 기법 상태를 증거로 적을 수 있지만, 그것을 영향 확정이나 근본 원인 해결의 증거로 과장하지 않습니다. 합성 프로그램·합성 fixture·재시험 조건·남은 한계를 분리해 기록합니다.'], nodes: ['수정 전 합성 실패', '경계·오류 처리 수정', '경계 초과 안전 거절', '정상 fixture 성공 유지', '방어층과 한계 기록'], misconception: ['정상 입력이 실패해도 경계 초과가 막혔으면 성공이다.', '보호 기법 상태만 캡처하면 재시험 기록이 된다.'], checkpoints: [{ title: '재시험 조합', prompt: '수정 후 필요한 최소 비교는?', options: ['경계 초과 fixture와 정상 fixture', '실제 운영 대상과 임의 입력', '보호 기법 이름만 확인'], answer: 0, explanation: '안전 거절과 정상 기능 유지가 함께 확인되어야 합니다.' }, { title: '보고 한계', prompt: '합성 코드에서 Canary가 켜진 것을 봤을 때 적절한 표현은?', options: ['모든 메모리 버그 해결 확정', '추가 방어층 상태를 관찰했으며 경계 수정은 별도 확인', '실제 서비스 공격 가능성 확정'], answer: 1, explanation: '완화기법 관찰과 근본 원인 수정은 분리해 기록합니다.' }], labId: week10Lab.id, sourceIds: ['cwe787', 'gcc'], bullets: ['수정은 안전 거절과 정상 경로를 함께 시험한다.', '보호 기법 관찰은 근본 수정 증거가 아니다.', '합성 fixture와 한계를 기록한다.'] }),
    ],
    labs: [week10Lab],
    deliverables: ['Memory-Safety Finding Note', '경계 검사·보호기법 비교표', '정상·실패 fixture 재시험 기록'],
    recordBlueprint: { title: 'Memory Safety Retest Record', description: '합성 코드의 경계, 방어층, 수정, 정상·실패 fixture 재시험과 한계를 분리합니다.', sections: ['수정 전 관찰과 안전 범위', '경계 검증의 근본 원인', '완화기법의 역할과 한계', '실패·정상 fixture 재시험', '남은 위험과 다음 검토'] },
    reportConnection: '메모리 안전성 기록에는 실제 exploit·주소·원격 대상 대신 합성 코드의 경계·수정·방어층·재시험만 기록합니다.',
    next: 'Week 11 · AI 답변 검증형 Pwn 분석',
  },
}

export const week5to10Quizzes = {
  5: quiz(5, [
    ['w5-db-basics', '읽기 전용 검색 기능의 DB 역할에 가장 알맞은 권한은?', ['필요한 view 또는 열에 대한 SELECT만', '모든 테이블의 관리자 권한', '운영자 계정과 같은 권한'], 0, '기능에 필요한 객체와 동작만 허용하는 것이 최소 권한의 출발점입니다.'],
    ['w5-query-boundary', 'SQL 문장과 사용자 값을 구조적으로 분리하는 방법은?', ['문자열 결합', '파라미터 바인딩', '오류 전문 노출'], 1, '파라미터 바인딩은 값과 문법을 별도로 전달합니다.'],
    ['w5-parameterization', '사용자가 고른 정렬 기준을 쿼리에 반영해야 할 때 우선할 방식은?', ['요청값을 SQL 문자열에 바로 연결', '코드에 정의한 허용 목록 값으로 매핑', '입력값을 로그에만 남김'], 1, '식별자·정렬 구조는 코드 소유의 좁은 허용 목록으로 매핑하고 값은 별도 파라미터로 전달합니다.'],
    ['w5-database-controls', '브라우저 오류 응답과 내부 진단 기록의 분리로 적절한 것은?', ['상세 DB 오류를 모든 사용자에게 표시', '일반 오류와 추적 ID는 응답에, 상세 진단은 접근 제어된 내부 기록에 남김', '연결 문자열을 화면 주석에 남김'], 1, '사용자에게는 필요한 최소 정보를 제공하고, 상세 진단은 마스킹된 내부 기록에서 다룹니다.'],
    ['w5-parameterization', 'DB 최소 권한의 목적은?', ['필요한 작업 범위로 영향 제한', '모든 계정 관리자화', '오류 숨기기'], 0, '필요한 작업만 허용해 결함·오작동 범위를 줄입니다.'],
    ['w5-sqli-retest', '수정 후 재시험에 필요한 조합은?', ['의심 fixture와 정상 기준선', '실제 운영 계정', '오류 화면만'], 0, '수정 대상과 정상 경로를 함께 비교합니다.'],
    ['w5-sqli-retest', '좋은 원인 설명은?', ['입력이 이상함', '값을 SQL 문자열에 결합해 경계가 사라짐', '화면이 느림'], 1, '구조적 원인이 방어 수정으로 이어집니다.'],
    ['w5-query-boundary', '합성 교육 DB 관찰의 한계로 적절한 것은?', ['실제 운영 영향 확정', '합성 fixture 범위에서만 관찰', '실제 자격 증명 기록'], 1, '관찰 범위와 한계를 넘지 않습니다.'],
  ]),
  6: quiz(6, [
    ['w6-state-change', 'CSRF 검토에서 우선 목록화할 대상은?', ['상태를 변경하는 endpoint와 HTTP 메서드', '정적 이미지 파일', '브라우저 테마'], 0, '먼저 서버 상태를 바꾸는 기능과 요청 방식을 확인해야 통제 적용 범위를 정할 수 있습니다.'],
    ['w6-request-credentials', 'CSRF 검토의 핵심 전제는?', ['인증된 브라우저 상태와 상태 변경 요청', '파일 확장자', 'CPU 온도'], 0, '기존 인증 상태와 민감 동작의 연결을 봅니다.'],
    ['w6-csrf-controls', 'CSRF token의 서버 측 역할은?', ['요청 맥락과 발급 값을 검증', '인가를 자동 대체', '쿠키 내용을 화면에 표시'], 0, '서버가 발급한 값을 요청과 연결해 확인합니다.'],
    ['w6-sensitive-actions', '비밀번호 변경처럼 민감한 작업에 기본 통제와 함께 검토할 것은?', ['최근 인증·명시적 확인·변경 알림', 'GET 메서드 사용', 'Cookie 값 화면 표시'], 0, '민감한 동작에는 기본 요청 정당성 통제 위에 추가 보호와 복구·알림 흐름을 검토합니다.'],
    ['w6-csrf-controls', 'SameSite는 무엇을 조절하는가?', ['교차 사이트 쿠키 전송 조건', 'DB 권한', '코드 실행 권한'], 0, 'SameSite는 브라우저 쿠키 전송 조건의 통제입니다.'],
    ['w6-web-retest', '수정 후 재시험에 필요한 것은?', ['정상 요청과 거절 요청 비교', '실제 비밀번호', '우회 문자열 목록'], 0, '정상 경로와 방어 경로를 함께 비교합니다.'],
    ['w6-request-credentials', '합성 CSRF 실습에서 금지되는 것은?', ['합성 세션 흐름 관찰', '실제 계정으로 외부 요청 만들기', 'token 역할 기록'], 1, '실제 계정과 외부 대상은 교육 범위 밖입니다.'],
  ]),
  7: quiz(7, [
    ['w7-c-values', '포인터 변수에 저장되는 것은?', ['대상의 주소', '항상 대상의 복사본', 'DNS 이름'], 0, '포인터는 보통 대상 위치를 나타내는 주소를 저장합니다.'],
    ['w7-build-flow', '링커의 역할은?', ['오브젝트·라이브러리 연결', '쿠키 발급', 'HTTP 요청 전송'], 0, '링커는 여러 코드 조각과 참조를 연결합니다.'],
    ['w7-memory-layout', '함수 지역 상태와 가장 가까운 영역은?', ['스택 프레임', 'DNS 캐시', 'TLS 인증서'], 0, '지역 상태는 보통 호출 프레임과 연결됩니다.'],
    ['w7-memory-layout', '힙 관찰에서 중요한 질문은?', ['소유·해제·수명', '실제 주소 암기', '원격 포트'], 0, '동적 요청 값은 소유와 수명 규칙이 중요합니다.'],
    ['w7-c-values', '허용되는 관찰은?', ['제공된 합성 프로그램 출력 비교', '다른 사용자 프로세스 읽기', '실제 서비스 스캔'], 0, '제공된 합성 자료만 사용합니다.'],
  ]),
  8: quiz(8, [
    ['w8-instruction-flow', '레지스터의 역할은?', ['실행 중인 인자·계산 상태 보관', '영구 파일 저장', 'DB 백업'], 0, '레지스터는 CPU 실행 상태와 가까운 저장 공간입니다.'],
    ['w8-stack-frame', 'call의 역할은?', ['함수로 이동하고 복귀 위치 보관', '파일 삭제', '쿠키 암호화'], 0, '호출과 복귀의 제어 흐름을 연결합니다.'],
    ['w8-stack-frame', '스택 프레임에서 관찰할 것은?', ['호출 맥락과 지역 상태', '실제 원격 주소', '비밀번호'], 0, '함수 호출과 지역 상태의 관계를 관찰합니다.'],
    ['w8-calling-convention', '호출 규약이 정하는 것은?', ['인자·반환·저장 책임', 'DNS 레코드', 'SQL 문법'], 0, '함수 사이의 공통 약속입니다.'],
    ['w8-instruction-flow', '합성 전사만으로 확정할 수 없는 것은?', ['명령 흐름', '실제 보안 영향의 최종 등급', '함수 호출 여부'], 1, '영향은 추가 근거가 필요한 별도 판단입니다.'],
  ]),
  9: quiz(9, [
    ['w9-debugger-flow', 'breakpoint의 목적은?', ['상태 관찰을 위해 실행 중단', '로그 삭제', '원격 연결'], 0, '특정 위치에서 상태를 관찰할 수 있게 합니다.'],
    ['w9-debugger-flow', '오류 fixture 전 필요한 기준은?', ['정상 fixture 기준선', '실제 계정', '우회 문자열'], 0, '정상 기준선이 있어야 차이를 설명할 수 있습니다.'],
    ['w9-bytes-io', '입출력 기록에 유용한 것은?', ['텍스트·바이트 길이·종료 조건', '실제 비밀', '테마 색상'], 0, '표현과 경계를 함께 기록합니다.'],
    ['w9-local-driver', '로컬 반복 관찰에서 고정할 것은?', ['fixture·입력 순서·예상 출력', '원격 포트', '실제 토큰'], 0, '같은 조건을 유지해야 비교할 수 있습니다.'],
    ['w9-local-driver', 'Pwntools가 대신하지 않는 것은?', ['입출력 자동화', '허가와 영향 판단', '바이트 처리'], 1, '도구는 판단과 범위 책임을 대신하지 않습니다.'],
  ]),
  10: quiz(10, [
    ['w10-bounds', '구조적 원인 설명으로 알맞은 것은?', ['입력이 이상함', '복사 전 경계 검증 누락', '보호기법 이름 미기억'], 1, '경계 검증 누락을 설명해야 방어 수정으로 이어집니다.'],
    ['w10-bounds', '경계 초과 입력의 안전한 처리로 알맞은 것은?', ['안전한 오류 반환', '계속 복사', '실제 대상 전송'], 0, '경계를 확인하고 안전하게 거절합니다.'],
    ['w10-mitigations', 'NX의 역할은?', ['특정 영역 실행 제한', '입력 길이 자동 검증', 'DB 권한 관리'], 0, 'NX는 실행 권한을 제한하는 방어층입니다.'],
    ['w10-mitigations', '완화기법과 근본 수정의 관계는?', ['서로 다른 방어층으로 함께 필요', '완화기법만 필요', '근본 수정만 하면 재시험 불필요'], 0, '구현 수정과 추가 방어층은 서로 다른 역할입니다.'],
    ['w10-retest', '수정 후 최소 재시험 조합은?', ['경계 초과와 정상 fixture', '실제 운영 대상', '보호기법 이름만'], 0, '안전 거절과 정상 기능 유지를 함께 확인합니다.'],
  ]),
}
