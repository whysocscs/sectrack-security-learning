const gradioDocs = {
  label: 'Gradio · Interface documentation',
  url: 'https://www.gradio.app/docs/gradio/interface',
  note: 'Python 함수와 입력·출력 component를 웹 UI로 연결하는 Gradio Interface의 공식 역할을 확인합니다.',
}

const gradioPatch = {
  label: 'Gradio · Tighten CORS rules commit 84802ee',
  url: 'https://github.com/gradio-app/gradio/commit/84802ee6a4806c25287344dce581f9548a99834a',
  note: 'wildcard CORSMiddleware 제거, CustomCORSMiddleware 구현, host/origin 판정과 회귀 테스트의 실제 diff입니다.',
}

const gradioRelease = {
  label: 'Gradio · 4.19.2 release',
  url: 'https://github.com/gradio-app/gradio/releases/tag/gradio%404.19.2',
  note: '공식 4.19.2 릴리스에 PR #7503 Tighten CORS rules가 포함된 사실을 확인합니다.',
}

const nvdGradio = {
  label: 'NVD · CVE-2024-1727',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-1727',
  note: '로컬 Gradio upload CSRF의 조건, 가용성 영향, 영향 버전 범위와 upstream patch 참조를 확인합니다.',
}

const owaspCsrf = {
  label: 'OWASP · CSRF Prevention Cheat Sheet',
  url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
  note: 'token, SameSite, origin 검증, Fetch Metadata, 사용자 상호작용 통제의 역할과 한계를 확인합니다.',
}

const rfcOrigin = {
  label: 'RFC 6454 · The Web Origin Concept',
  url: 'https://www.rfc-editor.org/rfc/rfc6454',
  note: 'scheme·host·port로 구성되는 origin과 브라우저 보안 경계의 표준 정의입니다.',
}

const gradioLocalMechanism = {
  id: 'w6-state-change-gradio-mechanism',
  type: 'mechanism',
  title: '로컬 Gradio 화면에서 파일을 올리는 정상 경로',
  situation: '데이터 과학자는 Python 함수나 모델을 브라우저에서 시험하기 위해 Gradio로 로컬 웹 UI를 띄울 수 있습니다. 파일 component가 있으면 사용자가 직접 고른 파일을 로컬 Gradio 서버가 임시 저장한 뒤 함수 입력으로 연결합니다.',
  terms: [
    { term: 'Loopback · 루프백', meaning: '`localhost`나 `127.0.0.1`처럼 현재 컴퓨터 자신에게 돌아오는 네트워크 주소입니다.', contrast: '인터넷에 공개되지 않았더라도 같은 컴퓨터의 브라우저는 외부 페이지와 로컬 서버 양쪽에 요청할 수 있습니다.' },
    { term: 'Origin · 출처', meaning: '웹 문서의 scheme, host, port 조합입니다. 브라우저는 요청을 시작한 문서와 대상 서버의 관계를 origin으로 구분합니다.', contrast: 'URL 전체 경로나 DNS 이름만 비교하는 개념이 아닙니다.' },
    { term: 'CORS', meaning: '서버가 다른 origin의 브라우저 JavaScript에 응답 접근 권한을 줄지 HTTP header로 알리는 메커니즘입니다.', contrast: '사용자를 인증하거나 모든 종류의 CSRF 요청을 서버에서 차단하는 만능 인가 기능은 아닙니다.' },
  ],
  stages: [
    { label: '로컬 앱 실행', actor: '개발자·Gradio', input: 'Python 함수, 파일 component, 로컬 launch 설정', action: '현재 컴퓨터의 HTTP endpoint와 UI를 시작합니다.', output: '`localhost` 계열에서 접근 가능한 Gradio 앱' },
    { label: '신뢰된 UI 열기', actor: '개발자·브라우저', input: '로컬 Gradio URL', action: 'UI 문서와 component 구성을 로드합니다.', output: '로컬 origin에서 실행되는 Gradio frontend' },
    { label: '파일 선택', actor: '사용자', input: '자신이 확인한 로컬 파일과 화면의 file control', action: '브라우저 file picker에서 보낼 파일을 명시적으로 고릅니다.', output: '브라우저가 읽을 수 있는 선택된 파일 객체' },
    { label: '업로드 요청', actor: 'Gradio frontend·브라우저', input: '선택된 파일과 로컬 upload endpoint', action: 'Gradio가 기대하는 요청 형식으로 로컬 서버에 전송합니다.', output: '서버가 검사할 upload request' },
    { label: '임시 저장·함수 연결', actor: 'Gradio server', input: '검증된 upload와 component 상태', action: '파일을 제한된 임시 위치에 저장하고 해당 component 입력으로 연결합니다.', output: '함수가 처리할 file reference와 UI 결과' },
  ],
  trustBoundary: {
    before: '외부 웹 문서도 피해자 브라우저를 통해 `localhost` 주소로 요청을 시도할 수 있으므로, 로컬 주소 자체가 사용자 의도를 증명하지 않습니다.',
    decision: '브라우저와 서버가 요청을 시작한 origin과 대상 host의 관계를 확인하고 허용된 UI 흐름만 API 응답에 접근하게 해야 합니다.',
    after: '신뢰된 로컬 origin은 필요한 Gradio 응답을 읽고 정상 파일 선택 흐름을 완료합니다.',
    failure: '영향 버전의 wildcard CORS 정책은 외부 origin에도 Gradio API 응답 접근 권한을 표시했습니다. 로컬 업로드 동작과 결합되면 사용자가 고르지 않은 파일 데이터가 디스크에 누적될 조건이 생겼습니다.',
  },
}

const gradioFailureModel = {
  id: 'w6-state-change-failure-model',
  type: 'code-trace',
  title: '요청 출처 판단보다 디스크 상태가 먼저 바뀌는 교육용 모델',
  evidenceKind: 'educational-model',
  language: 'Python',
  description: 'Gradio의 실제 `routes.py` upload 함수가 아닙니다. 외부 요청이 로컬 endpoint에 닿았을 때 출처 판단 없이 저장 효과에 도달하는 상태 전이만 단순화했습니다.',
  code: "1  async def upload(request):\n2      origin = request.headers.get('origin', '')\n3      incoming_file = await request.form()\n4      stored_path = await temporary_store.save(incoming_file)\n5      return {'path': stored_path}",
  trace: [
    { lines: '1', before: '브라우저가 로컬 upload endpoint로 요청을 보냈습니다.', action: '서버 route가 요청 처리를 시작합니다.', after: '요청이 도달했다는 사실만 확인됐고 사용자 의도는 확인되지 않았습니다.' },
    { lines: '2', before: '요청 header에 origin 정보가 있을 수 있습니다.', action: 'origin 문자열을 읽습니다.', after: '값을 읽기만 했으며 허용 여부를 결정하거나 거절하지 않았습니다.' },
    { lines: '3', before: '출처가 허용됐다는 판정이 없습니다.', action: '요청 본문에서 file 데이터를 파싱합니다.', after: '외부 요청의 데이터가 서버 메모리 객체가 됩니다.' },
    { lines: '4', before: 'origin gate를 통과했다는 증거 없이 file 객체가 있습니다.', action: '임시 저장소에 데이터를 씁니다.', after: '디스크 사용량이 바뀝니다. 이 줄이 교육용 모델의 정확한 보안 효과 지점입니다.' },
    { lines: '5', before: '이미 저장 효과가 발생했습니다.', action: '응답에 저장 경로를 포함합니다.', after: 'CORS 정책은 브라우저가 이 응답을 외부 script에 공개할지 별도로 결정합니다.' },
  ],
}

const gradioPatchAnalysis = {
  id: 'w6-state-change-official-patch',
  type: 'patch-analysis',
  title: '공식 commit: wildcard CORS를 localhost origin 판정으로 바꾸다',
  evidenceKind: 'official-patch',
  source: gradioPatch,
  language: 'Python',
  description: 'commit `84802ee`의 `routes.py` 교체와 새 `CustomCORSMiddleware` 핵심 분기를 함께 발췌했습니다. 아래는 실제 upstream 코드입니다.',
  before: {
    label: '수정 전 · 실제 routes.py middleware',
    code: 'app.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],\n    allow_methods=["*"],\n    allow_headers=["*"],\n)',
  },
  after: {
    label: '수정 후 · 실제 등록과 핵심 분기',
    code: 'app.add_middleware(CustomCORSMiddleware)\n\nlocalhost_aliases = [\n    "localhost", "127.0.0.1", "0.0.0.0", "null"\n]\nif host_name in localhost_aliases and \\\n        origin_name not in localhost_aliases:\n    allow_origin_header = None\nelse:\n    allow_origin_header = origin',
  },
  changes: [
    '`routes.py`에서 FastAPI `CORSMiddleware`의 `allow_origins=["*"]`, 모든 method, 모든 header 설정을 제거하고 자체 middleware 하나를 등록했습니다.',
    '`route_utils.py`는 host와 origin을 hostname으로 파싱하고, 대상 host가 localhost 계열인데 origin이 localhost 계열이 아니면 `Access-Control-Allow-Origin`을 응답에 넣지 않습니다.',
    'preflight 요청은 별도 빈 응답으로 처리하며, 허용된 경우에만 origin과 `GET, POST, PUT, DELETE, OPTIONS`, 제한된 header 목록을 표시합니다.',
    '공식 테스트는 `host: localhost:7860`과 외부 origin 조합에서 allow-origin header가 없고, localhost 계열 origin 조합에서는 해당 header가 있음을 확인합니다.',
  ],
  regressionTests: [
    { case: '공식 test · localhost host + 외부 origin', expected: '`access-control-allow-origin` header가 없음', reason: '외부 문서가 로컬 Gradio API 응답을 읽도록 브라우저 허가를 받지 못하는지 확인합니다.' },
    { case: '공식 test · localhost host + `127.0.0.1` origin', expected: '`Access-Control-Allow-Origin: 127.0.0.1`이 반환됨', reason: '정상 로컬 alias 조합의 UI 동작을 보존합니다.' },
    { case: '제품 회귀 제안 · 정상 파일 선택과 작은 upload', expected: '4.19.2에서 사용자 선택 파일이 한 번 저장되고 UI 결과가 유지됨', reason: 'middleware 변경이 정상 file component를 깨뜨리지 않았는지 확인합니다.' },
    { case: '제품 회귀 제안 · 외부 origin preflight', expected: '브라우저가 후속 비단순 요청을 허용하지 않고 디스크 상태가 바뀌지 않음', reason: 'header 한 개뿐 아니라 최종 보안 효과까지 관찰합니다.' },
  ],
  limitation: '공식 commit의 자동 테스트는 `/config` 응답 header 정책을 직접 검증합니다. 마지막 두 항목은 수업이 제안하는 제품 수준 회귀 기준이며 upstream에 그대로 추가됐다고 주장하지 않습니다. 이 patch는 일반적인 synchronizer CSRF token 구현이 아니고, CORS 하나를 모든 상태 변경의 보편적 CSRF 방어로 확대해서는 안 됩니다.',
}

const gradioImpact = {
  id: 'w6-state-change-impact-map',
  type: 'impact-map',
  title: 'CVE-2024-1727은 로컬 서버와 사용자 행동이 모두 필요하다',
  intro: 'CNA의 CVSS 3.0 vector는 네트워크 경로, 사전 권한 없음, 사용자 상호작용 필요, 기밀성·무결성 영향 없음, 낮은 가용성 영향을 기록합니다.',
  dimensions: [
    { label: '기밀성', impact: '공식 CVSS 평가는 직접적인 기밀성 영향을 두지 않습니다.', condition: '이 CVE 기록만으로 로컬 파일 내용이나 모델 결과가 읽혔다고 확대하지 않습니다.' },
    { label: '무결성', impact: '공식 CVSS 평가는 기존 데이터의 직접적인 무결성 변경을 두지 않습니다.', condition: '승인되지 않은 upload가 새 임시 파일을 만들 수 있다는 사실과 기존 파일 변경을 같은 주장으로 묶지 않습니다.' },
    { label: '가용성', impact: '여러 큰 upload가 피해자 시스템의 디스크 공간을 소진해 서비스 또는 시스템 사용을 방해할 수 있습니다.', condition: '영향 버전의 로컬 Gradio 서버가 실행 중이고 피해자가 외부 페이지를 열며, 충분한 요청과 파일 크기가 실제 저장 한계에 도달해야 합니다.' },
  ],
  attackerControls: ['피해자가 열게 되는 외부 웹 문서의 origin', '브라우저가 로컬 Gradio로 보내도록 시도하는 upload 요청의 크기와 반복'],
  notControlled: ['피해자 컴퓨터에서 Gradio가 실행 중인지 여부', '설치 버전과 4.19.2 patch 적용 상태', '로컬 서버의 bind 주소·upload 제한·임시 저장 위치', '남은 디스크 용량과 quota·정리 정책', '피해자가 외부 페이지를 실제로 여는지 여부'],
  access: {
    authentication: 'CNA vector의 PR:N과 공식 설명은 공격자의 사전 Gradio 계정 권한을 요구하지 않습니다.',
    interaction: 'UI:R입니다. 피해자가 공격자가 준비한 외부 페이지를 브라우저에서 열어야 합니다.',
    network: '공격자 서버가 로컬 Gradio에 직접 접속하는 것이 아니라 피해자 브라우저가 네트워크 요청의 매개가 됩니다.',
    defaultExposure: 'localhost bind는 인터넷 직접 노출을 줄이지만, 브라우저가 외부 origin과 loopback endpoint 양쪽에 접근할 수 있다는 경계는 남습니다.',
    protections: '4.19.2 이상 업데이트가 우선입니다. upload 크기·총량 제한, 임시 파일 quota·정리, 로컬 서비스 접근 통제는 가용성 피해를 줄이는 추가 계층입니다.',
  },
}

const credentialMechanism = {
  id: 'w6-request-credentials-mechanism',
  type: 'mechanism',
  title: '브라우저가 세션 Cookie를 자동으로 붙이는 정상 이유',
  situation: '사용자는 페이지를 이동하거나 폼을 제출할 때마다 비밀번호를 다시 입력하지 않아야 합니다. 서버는 로그인 뒤 세션 식별자를 Cookie로 설정하고 브라우저는 scope 조건이 맞는 요청에 그 Cookie를 자동으로 포함합니다.',
  terms: [
    { term: 'Authentication · 인증', meaning: '요청을 보낸 사용자가 누구인지 확인하는 절차입니다.', contrast: '그 사용자가 특정 객체를 바꿀 수 있는지 판단하는 인가와 다릅니다.' },
    { term: 'Session Cookie · 세션 쿠키', meaning: '서버가 로그인 상태를 이어 가기 위해 브라우저에 저장시키는 작은 식별 데이터입니다.', contrast: 'Cookie가 요청에 있다는 사실은 사용자가 바로 그 변경을 의도했다는 증명이 아닙니다.' },
    { term: 'Request Legitimacy · 요청 정당성', meaning: '상태 변경 요청이 서버가 신뢰하는 UI 흐름과 사용자 의도에서 만들어졌는지 확인하는 질문입니다.', contrast: '인증·인가가 성공해도 요청 정당성 검증은 별도로 실패할 수 있습니다.' },
  ],
  stages: [
    { label: '로그인 성공', actor: '사용자·인증 서버', input: '검증된 로그인 절차', action: '서버가 새 세션을 만들고 제한된 Cookie 속성과 함께 브라우저에 설정합니다.', output: '브라우저의 세션 Cookie와 서버 세션 상태' },
    { label: '정상 화면 사용', actor: '사용자·브라우저', input: 'same-site 페이지의 상태 변경 폼', action: '사용자가 기능과 변경 내용을 확인하고 제출합니다.', output: '상태 변경 HTTP 요청' },
    { label: 'Cookie scope 판정', actor: '브라우저', input: '대상 URL, Cookie Domain·Path·Secure·SameSite', action: '전송 조건이 맞는 Cookie를 요청에 자동으로 붙입니다.', output: '인증 상태가 포함될 수 있는 요청' },
    { label: '세 가지 서버 판단', actor: '서버', input: '세션, 대상 객체, token·origin 같은 정당성 증거', action: '인증, 객체별 인가, 요청 정당성을 각각 검증합니다.', output: '허용된 변경 또는 안전한 거절' },
  ],
  trustBoundary: {
    before: '브라우저는 Cookie scope를 판단하지만 사용자가 현재 외부 페이지의 요청을 의도했는지 알지 못합니다.',
    decision: '서버가 세션 존재 외에 객체 권한과 상태 변경 요청의 정당성 증거를 확인해야 합니다.',
    after: '정상 UI가 만든 요청만 상태 변경 handler에 도달하고 다른 요청은 효과 전에 거절됩니다.',
    failure: '서버가 Cookie만 보고 변경을 승인하면 외부 문서가 만든 요청에도 피해자의 기존 인증 상태가 사용될 수 있습니다.',
  },
}

const controlsMechanism = {
  id: 'w6-csrf-controls-mechanism',
  type: 'mechanism',
  title: 'Token·SameSite·Origin은 서로 다른 단계에서 판단한다',
  situation: '상태 변경 endpoint는 브라우저 종류, same-site 구조, API client, 민감도에 따라 여러 요청 경로를 가질 수 있습니다. 한 통제에 모든 책임을 주지 않고 브라우저 전송 조건과 서버 검증을 겹쳐 둡니다.',
  terms: [
    { term: 'Synchronizer Token', meaning: '서버 세션과 연결된 예측하기 어려운 값을 정상 UI에 전달하고 상태 변경 요청에서 다시 확인하는 방식입니다.', contrast: 'URL에 넣거나 로그에 남길 일반 식별자가 아니며 객체별 인가를 대신하지 않습니다.' },
    { term: 'SameSite', meaning: 'cross-site 상황에서 Cookie를 보낼지 제한하는 Cookie 속성입니다.', contrast: 'same-origin과 same-site는 범위가 다르며 서버의 모든 정당성 검증을 제거하지 않습니다.' },
    { term: 'Fetch Metadata', meaning: '`Sec-Fetch-Site`처럼 브라우저가 요청의 시작점과 대상 관계를 알려 주는 header 집합입니다.', contrast: '미지원 client와 합법적인 cross-site 흐름을 위한 명시적 fallback이 필요합니다.' },
  ],
  stages: [
    { label: '브라우저 전송 제한', actor: '브라우저', input: 'Cookie SameSite 속성과 요청의 site 관계', action: '정책에 따라 세션 Cookie를 포함하거나 제외합니다.', output: '자격 증명이 있거나 없는 요청' },
    { label: '출처 분류', actor: '서버 edge·middleware', input: 'Origin·Referer·Sec-Fetch-Site와 허용 목록', action: 'same-origin, 허용된 통합, cross-site 후보를 분류합니다.', output: '허용·거절·fallback 후보' },
    { label: 'Token 검증', actor: '상태 변경 handler', input: '세션과 요청의 CSRF token', action: '존재, 일치, 수명, 사용 위치를 확인합니다.', output: '정상 UI 흐름에 관한 추가 증거' },
    { label: '인가·민감도 판단', actor: '업무 로직', input: '인증 주체, 대상 객체, 행동, 최근 인증 상태', action: '객체별 권한과 필요한 재인증을 확인합니다.', output: '상태 변경 또는 효과 없는 거절' },
  ],
  trustBoundary: {
    before: '개별 header나 token 하나는 요청의 일부일 뿐 전체 사용자 의도를 단독으로 증명하지 않습니다.',
    decision: '서버는 지원 client, 허용 origin, token 정책, 객체 권한, 민감도 요구를 명시적인 순서로 판단해야 합니다.',
    after: '허용된 요청은 효과 지점에 도달하고 거절 요청은 상태를 바꾸지 않은 채 일반 오류와 내부 사건 ID를 남깁니다.',
    failure: '어느 한 검증을 클라이언트 코드에만 두거나 오류 뒤에 수행하면 공격자가 정할 수 있는 요청이 먼저 상태를 바꿀 수 있습니다.',
  },
}

const controlsTrace = {
  id: 'w6-csrf-controls-code-trace',
  type: 'code-trace',
  title: '상태 변경 효과 앞에 서버 검증을 배치하는 교육용 코드',
  evidenceKind: 'educational-model',
  language: 'Python',
  description: '특정 framework 구현이 아닌 합성 profile 설정 handler입니다. token 값, origin, 사용자 정보는 실제 비밀이나 계정이 아닙니다.',
  code: "1  async def change_setting(request, session):\n2      require_method(request, 'POST')\n3      require_allowed_origin(request.headers.get('origin'))\n4      require_session_token(request.form['csrf'], session.csrf)\n5      require_object_permission(session.user, request.form['profile_id'])\n6      await settings.update(request.form['profile_id'], request.form['weekly_digest'])\n7      audit.info('setting_changed', actor=session.user.id)",
  trace: [
    { lines: '2', before: 'route에 임의 HTTP method 요청이 도달할 수 있습니다.', action: '설계한 상태 변경 method만 허용합니다.', after: 'GET 같은 다른 method는 효과 전에 거절됩니다.' },
    { lines: '3', before: '요청이 시작된 origin이 외부 값으로 들어왔습니다.', action: '서버의 정확한 허용 origin과 비교합니다.', after: '허용되지 않은 origin은 다음 검증과 효과로 진행하지 않습니다.' },
    { lines: '4', before: '세션과 요청 token이 각각 있습니다.', action: '서버가 세션에 연결한 값과 일정 시간 비교 방식으로 확인합니다.', after: '정상 UI가 받은 정당성 증거가 일치해야 진행합니다.' },
    { lines: '5', before: '요청자는 `profile_id`도 정할 수 있습니다.', action: '현재 사용자가 바로 그 profile을 바꿀 수 있는지 확인합니다.', after: 'CSRF 검증과 객체별 인가가 모두 성공한 대상만 남습니다.' },
    { lines: '6', before: 'method·origin·token·인가가 효과 전에 성공했습니다.', action: 'DB 상태를 실제로 변경합니다.', after: '이 줄이 보안 효과 지점입니다. 앞의 gate 하나라도 빠지면 해당 신뢰 경계를 잃습니다.' },
    { lines: '7', before: '성공한 변경과 actor가 있습니다.', action: '비밀 token이나 Cookie 없이 감사 사건을 기록합니다.', after: '사후 검토와 알림에 사용할 최소 증거가 남습니다.' },
  ],
}

const webRetestMechanism = {
  id: 'w6-web-retest-mechanism',
  type: 'mechanism',
  title: '웹 취약점 세 유형을 같은 증거 순서로 비교한다',
  situation: 'XSS, SQL injection, CSRF는 최종 해석 주체가 각각 브라우저, DBMS, 상태 변경 서버로 다릅니다. 이름을 암기하는 대신 외부 값, 신뢰 경계, 효과 지점, 근본 수정, 정상 회귀를 같은 칸에 놓으면 새 사례도 분석할 수 있습니다.',
  terms: [
    { term: 'Effect Point · 효과 지점', meaning: '데이터가 DOM 구조 생성, DB 명령 실행, 계정 상태 변경처럼 보안상 의미 있는 변화를 만드는 줄이나 단계입니다.', contrast: '입력이 처음 들어온 source와 실제 영향이 생기는 effect point는 여러 함수를 사이에 둘 수 있습니다.' },
    { term: 'Root Fix · 근본 수정', meaning: '누락된 신뢰 경계를 코드나 설정의 구조로 복원하는 변경입니다.', contrast: '오류 숨기기, WAF, 경고 로그처럼 영향이나 탐지를 보조하는 통제와 구분합니다.' },
  ],
  stages: [
    { label: '정상 필요 기록', actor: '검토자', input: '기능 요구와 정상 fixture', action: '왜 데이터·query·상태 변경이 필요한지 먼저 적습니다.', output: '수정 뒤 보존할 baseline' },
    { label: '외부 값 추적', actor: '검토자·코드', input: 'source와 변환 단계', action: '각 단계의 값·표현·권한·주체를 기록합니다.', output: '효과 지점까지의 data/state flow' },
    { label: '경계 실패 판정', actor: '브라우저·DBMS·서버', input: '최종 parser 또는 state-changing handler', action: '데이터가 구조나 승인된 명령으로 바뀌는 정확한 분기를 찾습니다.', output: '유형과 실패 line' },
    { label: '수정·회귀 검증', actor: '개발자·QA', input: 'root fix, 보조 통제, baseline, 거절 fixture', action: '정상 성공, 안전한 거절, 상태 불변, 로그 마스킹을 비교합니다.', output: '근거가 연결된 재시험 기록' },
  ],
  trustBoundary: {
    before: '취약점 이름만 알면 실제 source, sink, effect, 사용자 조건, 권한 범위를 아직 모릅니다.',
    decision: '관찰 증거가 어떤 처리 단계와 결론을 직접 지지하는지 분리해야 합니다.',
    after: '원인·영향·수정·한계가 같은 data/state flow의 위치에 연결됩니다.',
    failure: '공격 문자열이나 화면 결과만 비교하면 구조적 원인과 정상 기능 회귀를 놓칩니다.',
  },
}

const sensitiveActionMechanism = {
  id: 'w6-sensitive-actions-mechanism',
  type: 'mechanism',
  title: '비밀번호·복구 수단 변경은 최근 인증을 한 번 더 묻는다',
  situation: '로그인 세션이 오래 유지되는 동안 사용자가 자리를 비웠거나 세션이 노출될 수 있습니다. 계정 복구 수단, 관리자 권한, 결제처럼 영향이 큰 변경은 일반 설정 변경보다 강한 사용자 확인과 복구 증거가 필요합니다.',
  terms: [
    { term: 'Step-up Authentication · 추가 인증', meaning: '민감 동작 직전에 현재 세션보다 강하거나 최근의 인증 증거를 다시 요구하는 절차입니다.', contrast: '최초 로그인 전체를 반복한다는 뜻만은 아니며 위험과 인증 수단에 맞게 설계합니다.' },
    { term: 'Audit Log · 감사 로그', meaning: '누가 언제 어떤 중요 동작을 승인·거절받았는지 변경 불가능성과 접근 통제를 고려해 남긴 기록입니다.', contrast: '비밀번호·token·전체 개인정보를 그대로 저장하는 디버그 로그가 아닙니다.' },
    { term: 'Recovery Path · 복구 경로', meaning: '예상하지 못한 변경을 사용자가 발견했을 때 계정과 설정을 안전하게 되돌릴 절차입니다.', contrast: '변경 알림만 보내고 실제 복구 수단이 없는 상태와 다릅니다.' },
  ],
  stages: [
    { label: '민감도 분류', actor: '제품·보안 설계', input: '변경 대상과 가능한 계정·금전·개인정보 영향', action: '일반 설정과 민감 동작을 구분합니다.', output: '동작별 요구 통제 표' },
    { label: '기본 요청 검증', actor: '서버', input: 'session, origin, CSRF token, 객체 ID', action: '인증·정당성·객체별 인가를 확인합니다.', output: '기본 gate를 통과한 요청' },
    { label: '최근 인증·명시적 확인', actor: '사용자·인증 서비스', input: '동작 요약, 최근 인증 시간, 추가 인증 수단', action: '사용자에게 대상과 결과를 다시 보여 주고 필요한 증거를 확인합니다.', output: '해당 동작에 한정된 승인' },
    { label: '변경·알림·감사', actor: '업무 서버', input: '승인된 동작과 actor·target', action: '상태를 바꾸고 기존 연락처 알림과 마스킹된 감사 사건을 남깁니다.', output: '변경 상태와 탐지·복구 근거' },
    { label: '회귀·복구 시험', actor: 'QA·운영', input: '정상, token 실패, 권한 실패, 오래된 인증, 알림 실패 fixture', action: '상태 불변과 안전한 recovery를 확인합니다.', output: '사용성과 보안을 함께 검증한 결과' },
  ],
  trustBoundary: {
    before: '기존 세션만으로는 사용자가 지금 이 고위험 변경을 이해하고 승인했는지 충분하지 않을 수 있습니다.',
    decision: '서버가 동작의 민감도와 최근 인증 정책을 평가하고 추가 증거를 효과 전에 요구해야 합니다.',
    after: '특정 대상과 동작에 관한 최신 사용자 확인이 남고, 예상하지 못한 변경은 알림과 복구 절차로 이어집니다.',
    failure: '확인 화면만 client-side에 두거나 상태 변경 뒤 인증을 물으면 요청 위조와 권한 오용을 막지 못합니다.',
  },
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichGradioCve(block) {
  const additions = [gradioDocs, gradioPatch, gradioRelease, nvdGradio, owaspCsrf, rfcOrigin]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    productRole: 'Gradio는 Python 함수·모델과 input/output component를 브라우저용 웹 UI로 연결하는 오픈소스 Python library입니다. 로컬 개발 환경에서도 file component와 HTTP route가 동작할 수 있습니다.',
    weakness: '로컬 file upload 흐름의 Cross-Site Request Forgery · CWE-352 · 가용성 영향',
    affectedVersions: 'Gradio 4.16.0 이상 4.19.2 미만',
    fixedVersions: 'Gradio 4.19.2 · upstream commit 84802ee · release의 PR #7503',
    cause: '공식 patch에서 `routes.py`가 FastAPI `CORSMiddleware`를 `allow_origins=["*"]`, 모든 method·header 허용으로 등록했던 실제 설정을 확인할 수 있습니다. 이 정책은 로컬 Gradio host와 외부 origin을 구분하지 않았습니다.',
    condition: '영향 버전의 로컬 Gradio 서버에서 file upload 기능이 실행 중이고, 피해자가 공격자가 준비한 외부 웹 문서를 열어 브라우저가 그 로컬 server와 상호작용해야 합니다. 사전 Gradio 인증 권한은 요구되지 않습니다.',
    patch: '공식 commit `84802ee`는 wildcard CORS를 제거하고 host와 origin의 hostname을 비교하는 `CustomCORSMiddleware`를 추가했습니다. localhost 계열 host에 외부 origin이 오면 allow-origin header를 내보내지 않으며, 이 변경은 Gradio 4.19.2 릴리스에 포함됐습니다.',
    facts: [
      'CNA CVSS 3.0 vector는 UI:R, C:N, I:N, A:L로 기록되어 피해자 상호작용과 제한된 가용성 영향을 분명히 합니다.',
      'localhost는 인터넷에서 직접 들어오는 연결을 줄이지만 브라우저가 외부 문서와 loopback server 사이의 매개가 될 가능성까지 제거하지 않습니다.',
      '공식 수정은 이 제품 흐름에 맞춘 CORS 강화 사례이며, CORS만으로 모든 애플리케이션의 일반 CSRF 방어가 완성된다는 뜻이 아닙니다.',
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

function enrichStateChange(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichGradioCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    gradioLocalMechanism,
    gradioFailureModel,
    cve,
    gradioPatchAnalysis,
    gradioImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [gradioDocs, gradioPatch, gradioRelease, nvdGradio, owaspCsrf, rfcOrigin])
    : block)
}

function enrichWithMechanism(blocks, mechanism) {
  return addAfter(blocks, (block) => block.type === 'explanation', [mechanism])
}

function enrichControls(blocks) {
  let enriched = addAfter(blocks, (block) => block.type === 'explanation', [controlsMechanism])
  enriched = replaceTitledBlock(enriched, '합성 서버 검증 순서', controlsTrace)
  return enriched
}

export function buildWeek5CsrfGuide(modules) {
  const enrichers = {
    'w6-state-change': enrichStateChange,
    'w6-request-credentials': (blocks) => enrichWithMechanism(blocks, credentialMechanism),
    'w6-csrf-controls': enrichControls,
    'w6-web-retest': (blocks) => enrichWithMechanism(blocks, webRetestMechanism),
    'w6-sensitive-actions': (blocks) => enrichWithMechanism(blocks, sensitiveActionMechanism),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
