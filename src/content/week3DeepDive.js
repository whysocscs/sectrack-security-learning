const resteasyPullRequest = {
  label: 'RESTEasy · RESTEASY-2519 upstream PR #2320',
  url: 'https://github.com/resteasy/Resteasy/pull/2320/files',
  note: 'StringParameterInjector의 실제 예외 경로와 URL 인코딩 보조 함수 변경을 확인합니다.',
}

const gitlabPatch = {
  label: 'GitLab · contact quick action escaping commit',
  url: 'https://gitlab.com/gitlab-org/gitlab/-/commit/e61e9b9434e2198c4c1d5cf6b4531eb4323c3575',
  note: 'firstName·lastName escaping과 frontend 회귀 테스트가 같은 commit에 포함됩니다.',
}

const jqueryPatch = {
  label: 'jQuery · htmlPrefilter identity commit',
  url: 'https://github.com/jquery/jquery/commit/1d61fd9407e6fbe82fe55cb0b938307aa0791f77',
  note: '정규식 기반 태그 변환을 제거하고 입력 문자열을 그대로 반환한 실제 diff입니다.',
}

const xssRenderingMechanism = {
  id: 'w4-nature-mechanism',
  type: 'mechanism',
  title: '검색 결과가 화면이 되기까지의 정상 계약',
  situation: '검색 서버는 사용자가 입력한 문장을 결과 페이지에 다시 보여 주어야 합니다. 문장에는 상품명뿐 아니라 꺾쇠·따옴표처럼 HTML 문법에도 쓰이는 글자가 들어갈 수 있으므로, “표시할 데이터”와 “페이지 구조”를 전달 단계부터 구분해야 합니다.',
  terms: [
    { term: '파싱 parsing', meaning: '문자열을 문법 규칙에 따라 구조로 나누는 처리입니다. HTML 파서는 태그·속성·텍스트 노드를 만들어 DOM을 구성합니다.', contrast: '인코딩은 표현을 바꾸는 일이고, 파싱은 그 표현을 문법 구조로 해석하는 일입니다.' },
    { term: '출력 지점 sink', meaning: '값이 최종 기능에 전달되는 API 또는 코드 위치입니다. XSS 검토에서는 브라우저가 값을 텍스트로 둘지 HTML로 다시 읽을지가 이 위치에서 갈립니다.', contrast: 'source는 값이 시작된 곳이고 sink는 값이 사용되는 곳입니다.' },
  ],
  stages: [
    { label: '검색어 작성', actor: '사용자·브라우저', input: '사람이 입력한 Unicode 문자', action: '브라우저가 query parameter에 맞게 URL 표현을 만듭니다.', output: 'HTTP 요청 안의 percent-encoded query' },
    { label: '요청 해석', actor: '웹 서버·프레임워크', input: '요청 바이트와 query 문자열', action: '정해진 문자 집합과 URL 규칙으로 값을 한 번 파싱해 애플리케이션 값으로 넘깁니다.', output: '서버 메모리의 검색어 문자열' },
    { label: '결과 구성', actor: '애플리케이션', input: '검색어 문자열과 검색 결과', action: '사용자 값은 데이터로 유지하고 템플릿의 고정 구조와 분리합니다.', output: '텍스트로 처리된 응답 값 또는 구조화된 데이터' },
    { label: '화면 표시', actor: '브라우저', input: '서버 응답과 client-side 데이터', action: '일반 문장은 텍스트 전용 API로 텍스트 노드에 넣습니다.', output: '태그 수는 그대로이고 글자만 달라진 live DOM' },
  ],
  trustBoundary: {
    before: 'query 값은 사용자가 정한 외부 데이터이며 HTML로 신뢰할 수 없습니다.',
    decision: '서버 템플릿과 DOM 출력 API가 값의 목적에 맞는 문맥 처리를 선택해야 합니다.',
    after: '텍스트 전용 경로를 통과한 값은 DOM 구조를 만들 권한 없이 텍스트 노드만 바꿉니다.',
    failure: '외부 값이 `innerHTML` 같은 해석형 API로 가면 브라우저가 데이터 안의 HTML 문법까지 읽습니다.',
  },
}

const xssOutputCodeTrace = {
  id: 'w4-nature-code-trace',
  type: 'code-trace',
  title: '같은 검색어가 텍스트와 HTML로 갈라지는 줄',
  evidenceKind: 'educational-model',
  language: 'JavaScript',
  description: '실제 제품의 취약 코드가 아니라, 일반 텍스트 기능에서 출력 API 선택이 상태를 어떻게 바꾸는지 보여 주는 최소 예제입니다.',
  code: "1  const raw = new URL(location.href).searchParams.get('q') ?? ''\n2  const label = `검색어: ${raw}`\n3  safeResult.textContent = label\n4  riskyResult.innerHTML = label",
  trace: [
    { lines: '1', before: '주소에는 URL 규칙으로 표현된 query가 있습니다.', action: '`URLSearchParams`가 값을 애플리케이션 문자열로 돌려줍니다.', after: '`raw`는 사용자가 정한 문자열이며 아직 신뢰되지 않았습니다.' },
    { lines: '2', before: '`raw`와 고정 접두어가 따로 있습니다.', action: '화면에 보여 줄 한 문장을 만듭니다.', after: '`label`은 여전히 데이터일 뿐 안전한 HTML이 된 것은 아닙니다.' },
    { lines: '3', before: '`safeResult`는 기존 DOM element입니다.', action: '`textContent`가 `label`을 텍스트 노드 값으로 설정합니다.', after: 'DOM 구조는 늘지 않고 문장만 표시됩니다.' },
    { lines: '4', before: '동일한 `label`이 준비되어 있습니다.', action: '`innerHTML`이 문자열을 HTML fragment로 다시 파싱합니다.', after: '외부 데이터가 DOM 구조를 만들 수 있는 권한을 얻습니다. 이 줄이 정상 경로와 실패 경로의 분기입니다.' },
  ],
}

const xssTypeMechanism = {
  id: 'w4-types-lifetime-mechanism',
  type: 'mechanism',
  title: '유형 이름보다 먼저 기록할 데이터 수명',
  situation: '같은 문법 문자가 화면에 보이더라도 현재 요청에서 바로 돌아왔는지, 저장소를 거쳤는지, 브라우저 코드만 읽었는지에 따라 필요한 증거와 피해자 조건이 달라집니다. 유형은 눈에 보이는 결과가 아니라 값의 수명으로 판정합니다.',
  terms: [
    { term: '응답 원문', meaning: '서버가 네트워크 응답 본문으로 보낸 바이트를 사람이 읽을 수 있게 표시한 자료입니다.', contrast: 'Elements 패널의 live DOM은 JavaScript 실행 뒤 상태까지 포함하므로 응답 원문과 다를 수 있습니다.' },
    { term: '지속성 persistence', meaning: '요청이 끝난 뒤에도 데이터가 DB·캐시·문서 등에 남아 나중에 다시 사용되는 성질입니다.', contrast: '현재 요청에 반사된 값은 저장되지 않아도 문제를 만들 수 있습니다.' },
  ],
  stages: [
    { label: 'source 식별', actor: '검토자', input: 'query·form·저장 필드·fragment 후보', action: '값이 처음 외부 신뢰 경계를 넘는 위치를 표시합니다.', output: '값의 출발점과 최초 표현' },
    { label: '수명 추적', actor: '서버 또는 브라우저 코드', input: '외부 값과 호출 경로', action: '현재 응답, 저장 후 재조회, client-side 실행 중 어느 경로인지 구분합니다.', output: 'Reflected·Stored·DOM-based 후보 흐름' },
    { label: '해석 확인', actor: '브라우저', input: '응답 원문과 live DOM', action: '값이 텍스트인지 HTML·URL·JavaScript 문법인지 비교합니다.', output: '유형 판정과 정확한 실패 sink' },
  ],
  trustBoundary: {
    before: '외부 값의 출처와 저장 여부만 확인된 상태입니다.',
    decision: '최종 renderer 또는 DOM API가 값을 어떤 문법으로 해석할지 정합니다.',
    after: '안전한 경로에서는 값이 지정된 데이터 위치에만 남습니다.',
    failure: '유형 이름만 보고 실제 sink와 실행 시점을 확인하지 않으면 잘못된 수정과 재시험을 선택합니다.',
  },
}

const resteasyMechanism = {
  id: 'w4-taint-resteasy-mechanism',
  type: 'mechanism',
  title: 'REST API가 문자열을 Java 값으로 바꾸다 실패하는 정상 경로',
  situation: 'REST endpoint는 주소의 `page=3` 같은 문자열을 Java의 숫자·열거형·사용자 정의 타입으로 바꿔야 합니다. 변환에 실패하면 개발자와 호출자가 원인을 알 수 있는 오류를 주어야 하지만, 오류 메시지에 외부 값을 포함하는 순간 그 값의 출력 문맥도 책임져야 합니다.',
  terms: [
    { term: 'percent encoding', meaning: 'URL에서 그대로 쓰기 어려운 바이트를 `%`와 두 자리 16진수로 나타내는 전송 표현입니다. 예를 들어 공백의 한 표현은 `%20`입니다.', contrast: '암호화가 아니며, 디코딩하면 원래 문자 표현으로 돌아갑니다.' },
    { term: 'parameter conversion', meaning: 'HTTP 요청의 문자열을 endpoint 메서드가 요구하는 Java 타입으로 바꾸는 처리입니다.', contrast: '파싱 성공 여부와 그 값을 사용할 권한이 있는지는 별개의 검사입니다.' },
    { term: '예외 메시지', meaning: '정상 반환 대신 실패 이유와 위치를 전달하는 진단 정보입니다.', contrast: '로그 전용 메시지와 브라우저에 렌더링되는 오류 응답은 노출 범위와 출력 처리가 다릅니다.' },
  ],
  stages: [
    { label: '요청 수신', actor: 'RESTEasy request layer', input: 'URL 규칙으로 표현된 path 또는 query parameter', action: '요청을 파싱하고 parameter 문자열을 추출합니다.', output: '`strVal`로 다룰 애플리케이션 문자열' },
    { label: '타입 변환', actor: 'StringParameterInjector', input: '`strVal`과 목표 Java 타입', action: 'constructor·`valueOf`·converter 중 맞는 경로로 값을 변환합니다.', output: '타입이 지정된 정상 값 또는 변환 예외' },
    { label: '실패 설명', actor: 'RESTEasy exception path', input: '변환 예외와 실패한 외부 문자열', action: '어떤 parameter를 바꾸지 못했는지 오류 메시지를 구성합니다.', output: '진단 메시지를 가진 processing exception' },
    { label: '오류 응답', actor: '서버 오류 renderer', input: 'exception과 진단 메시지', action: '상태 코드와 응답 본문을 만듭니다.', output: '클라이언트가 받을 오류 응답' },
  ],
  trustBoundary: {
    before: '`strVal`은 요청자가 선택한 값이며, 디코딩 뒤에는 URL 문법이 아닌 일반 문자를 포함할 수 있습니다.',
    decision: '예외 경로가 외부 값을 진단 메시지에 어떤 표현으로 넣을지 결정합니다.',
    after: '패치 경로에서는 외부 값이 URL 인코딩된 표현으로 메시지 생성기에 전달됩니다.',
    failure: '취약 버전에서는 원래 문자열이 오류 메시지로 흘러, 오류 응답이 HTML 문맥에서 렌더링될 때 반사형 XSS 조건이 만들어졌습니다.',
  },
}

const resteasyFailureTrace = {
  id: 'w4-taint-failure-trace',
  type: 'code-trace',
  title: '예외 경로에서 신뢰 경계가 바뀌는 교육용 모델',
  evidenceKind: 'educational-model',
  language: 'Java',
  description: 'RESTEasy의 실제 클래스와 메서드를 복제하지 않습니다. 외부 parameter 변환 실패 뒤, 오류 응답에 같은 값을 다시 쓰는 구조만 단순화했습니다.',
  code: '1  String value = request.query("page");\n2  try {\n3      int page = Integer.parseInt(value);\n4      return renderPage(page);\n5  } catch (NumberFormatException error) {\n6      return htmlError("잘못된 page: " + value);\n7  }',
  trace: [
    { lines: '1', before: 'HTTP 요청에 문자열 parameter가 있습니다.', action: '요청 값을 서버 문자열로 읽습니다.', after: '`value`는 요청자가 정한 외부 데이터입니다.' },
    { lines: '3', before: '`value`는 아직 문자열입니다.', action: '정수 변환을 시도합니다.', after: '정상 입력은 숫자가 되고, 형식이 맞지 않으면 예외 제어 흐름으로 이동합니다.' },
    { lines: '5', before: '변환 실패로 정상 renderer가 실행되지 않았습니다.', action: '예외 처리 분기로 제어가 이동합니다.', after: '오류 경로도 별도의 출력 경로가 됩니다.' },
    { lines: '6', before: '외부 문자열이 그대로 남아 있습니다.', action: '문자열을 HTML 오류 본문에 이어 붙입니다.', after: '검증되지 않은 값이 HTML parser에 도달합니다. 이 모델의 실패 지점입니다.' },
  ],
}

const resteasyPatchAnalysis = {
  id: 'w4-taint-official-patch',
  type: 'patch-analysis',
  title: '공식 PR: 오류 메시지에 넘기는 값을 URL 인코딩하다',
  evidenceKind: 'official-patch',
  source: resteasyPullRequest,
  language: 'Java',
  description: 'upstream PR #2320의 `StringParameterInjector.java`에서 반복된 핵심 변경과 새 보조 함수를 발췌했습니다.',
  before: { label: '수정 전 · 실제 호출', code: 'throwProcessingException(\n    Messages.MESSAGES.unableToExtractParameter(\n        getParamSignature(), strVal, target), e);' },
  after: { label: '수정 후 · 실제 호출과 보조 함수', code: 'throwProcessingException(\n    Messages.MESSAGES.unableToExtractParameter(\n        getParamSignature(), _encode(strVal), target), e);\n\nprivate String _encode(String strVal) {\n    return URLEncoder.encode(\n        strVal, StandardCharsets.UTF_8.name());\n}' },
  changes: [
    'constructor·`valueOf`·일반 converter에서 발생하는 여러 예외 분기가 모두 원본 `strVal` 대신 `_encode(strVal)`을 메시지 생성기에 넘깁니다.',
    '`_encode`는 UTF-8 이름을 사용해 Java `URLEncoder` 결과를 만듭니다. 이 PR은 parameter를 두 번 디코딩하는 코드를 제거한 패치가 아닙니다.',
    '패치가 끊는 경로는 “디코딩된 외부 문자열 → 예외 진단 메시지”입니다. 정상적으로 변환된 parameter의 처리 경로는 바꾸지 않습니다.',
  ],
  regressionTests: [
    { case: '정상 숫자 parameter', expected: '기존 endpoint 결과가 그대로 반환됨', reason: '예외 경로 수정이 정상 변환을 깨뜨리지 않았는지 확인합니다.' },
    { case: '문법 문자가 든 잘못된 parameter', expected: '4xx 오류는 유지되며 응답 DOM에 새 구조가 생기지 않음', reason: '변환 실패 값이 오류 출력에서 데이터로 남는지 봅니다.' },
    { case: 'constructor·valueOf·converter 각각의 실패', expected: '세 예외 경로가 동일한 안전 표현을 사용함', reason: 'PR이 여러 catch 분기를 고친 이유를 회귀 범위에 반영합니다.' },
  ],
  limitation: '공개 PR의 변경 파일은 Java 소스 한 개이며 전용 회귀 테스트 추가는 확인되지 않습니다. 위 세 항목은 수업에서 설계한 제품 차원의 회귀 기준이고, 공식 프로젝트에 실제로 추가됐다고 주장하지 않습니다.',
}

const resteasyImpact = {
  id: 'w4-taint-impact-map',
  type: 'impact-map',
  title: 'CVE-2020-10688의 영향은 어떤 조건에서 성립하는가',
  intro: 'NVD의 CVSS 약어를 그대로 외우지 않고, 오류 경로가 실제 브라우저 문맥에 도달하는 조건으로 풀어 씁니다.',
  dimensions: [
    { label: '기밀성', impact: '취약 페이지 문맥에서 접근 가능한 일부 화면 데이터가 노출될 가능성이 있습니다.', condition: '피해자가 공격자가 만든 요청을 열고, 오류 값이 실행 가능한 브라우저 문맥에 도달해야 합니다.' },
    { label: '무결성', impact: '피해자 화면의 DOM 또는 사용 가능한 기능이 의도와 다르게 동작할 가능성이 있습니다.', condition: '같은 출처 문맥에서 해석이 일어나고 피해자 권한으로 가능한 기능이 있어야 합니다.' },
    { label: '가용성', impact: 'NVD의 v3.1 평가는 직접적인 가용성 영향을 두지 않습니다.', condition: '오류 한 번이 서비스 전체 중단으로 이어진다는 근거는 이 CVE 기록에 없습니다.' },
  ],
  attackerControls: ['변환에 실패하도록 만드는 요청 parameter의 문자열', '피해자에게 전달할 요청 또는 링크의 내용'],
  notControlled: ['서버에 설치된 RESTEasy 버전', '애플리케이션의 오류 응답 renderer와 보안 헤더', '피해자가 가진 권한과 실제로 요청을 여는지 여부'],
  access: {
    authentication: 'NVD 평가는 공격자 사전 권한이 필요하지 않은 네트워크 요청으로 봅니다.',
    interaction: '피해자가 공격 메커니즘과 상호작용해야 한다는 UI:R 조건이 있습니다.',
    network: '취약 REST endpoint와 오류 경로가 네트워크에서 도달 가능해야 합니다.',
    defaultExposure: 'RESTEasy를 쓴다는 사실만으로 노출을 확정할 수 없고, 취약 버전과 해당 parameter 오류 응답이 함께 있어야 합니다.',
    protections: 'CSP·HttpOnly는 일부 결과를 줄일 수 있지만 취약한 오류 출력 경로의 업데이트를 대신하지 않습니다.',
  },
}

const gitlabMechanism = {
  id: 'w4-context-gitlab-mechanism',
  type: 'mechanism',
  title: '연락처 자동완성은 저장된 이름을 어떻게 목록 HTML로 만드는가',
  situation: '이슈나 설명에 quick action을 입력할 때 연락처 후보를 바로 고르려면, GitLab의 frontend는 저장된 이름과 이메일을 읽어 자동완성 목록 항목을 만들어야 합니다. 저장 시점의 값과 목록을 보는 시점이 다르므로 두 경계를 함께 봐야 합니다.',
  terms: [
    { term: 'quick action', meaning: '텍스트 입력창에서 짧은 명령 형식으로 제품 기능을 실행하는 인터페이스입니다.', contrast: '명령을 누가 사용할 수 있는지와 자동완성 목록이 값을 안전하게 렌더링하는지는 별도 책임입니다.' },
    { term: 'escaping', meaning: '현재 출력 문맥에서 데이터 문자가 문법으로 해석되지 않도록 안전한 표현으로 바꾸는 처리입니다.', contrast: '입력 validation은 허용할 값의 의미·형식을 정하고, escaping은 출력 위치의 문법 경계를 지킵니다.' },
  ],
  stages: [
    { label: '연락처 저장', actor: 'GitLab backend·저장소', input: '사용자가 입력한 first name, last name, email', action: '필드 형식과 권한을 확인하고 계정 데이터로 보관합니다.', output: '나중에 다시 조회할 contact record' },
    { label: '후보 조회', actor: 'quick action autocomplete', input: '저장된 contact record', action: '후보 표시용 세 필드를 frontend 객체로 가져옵니다.', output: '`firstName`, `lastName`, `email` 값' },
    { label: '목록 항목 생성', actor: '`templateFunction`', input: '세 contact field', action: '고정 `<li>` 구조 안에 각 값을 출력용 표현으로 넣습니다.', output: '자동완성 목록에 사용할 HTML 문자열' },
    { label: '목록 렌더링', actor: '브라우저', input: 'template HTML 문자열', action: '문자열을 DOM 목록 항목으로 파싱합니다.', output: '사용자가 보는 contact 후보' },
  ],
  trustBoundary: {
    before: '저장된 이름도 과거 사용자가 정한 외부 데이터입니다. DB에 있다는 이유로 안전한 HTML이 되지 않습니다.',
    decision: '`templateFunction`이 세 필드를 모두 HTML body 데이터로 escape해야 합니다.',
    after: 'escape된 이름과 이메일은 `<small>`과 `<li>` 구조 안의 글자로 남습니다.',
    failure: '수정 전에는 email만 escape하고 firstName·lastName은 그대로 넣어, 저장된 이름이 목록 HTML 구조를 바꿀 수 있었습니다.',
  },
}

const gitlabPatchAnalysis = {
  id: 'w4-context-official-patch',
  type: 'patch-analysis',
  title: '공식 commit: 세 contact field를 같은 출력 계약으로 맞추다',
  evidenceKind: 'official-patch',
  source: gitlabPatch,
  language: 'JavaScript',
  description: 'GitLab commit `e61e9b94`의 `GfmAutoComplete.Contacts.templateFunction` 핵심 한 줄입니다.',
  before: { label: '수정 전 · 실제 template', code: 'return `<li><small>${firstName} ${lastName}</small>\n  ${escape(email)}</li>`;' },
  after: { label: '수정 후 · 실제 template', code: 'return `<li><small>${escape(firstName)}\n  ${escape(lastName)}</small>\n  ${escape(email)}</li>`;' },
  changes: [
    'email에는 이미 적용되던 `escape()`를 firstName과 lastName에도 적용했습니다.',
    '고정된 `<li><small>` 구조는 유지하고, 그 안으로 들어가는 세 외부 값의 출력 계약만 일치시켰습니다.',
    '같은 commit의 frontend spec은 세 필드에 HTML 문법 fixture를 넣고 결과가 escape된 문자열인지 확인합니다. 정상 템플릿 구조도 함께 기대값으로 고정합니다.',
  ],
  regressionTests: [
    { case: '일반 이름과 이메일', expected: '기존 이름·이메일이 같은 순서로 표시됨', reason: '보안 수정 뒤 자동완성 기능의 정상 동작을 보존합니다.' },
    { case: '세 필드의 HTML 문법 문자', expected: '문자가 텍스트 표현으로 남고 새 DOM node가 생기지 않음', reason: 'email만이 아니라 firstName·lastName도 같은 경계를 지키는지 봅니다.' },
    { case: '빈 이름·긴 다국어 이름', expected: '목록 레이아웃이 안전하게 유지되거나 제품 규칙대로 거절됨', reason: '실제 제품의 주변 입력과 표시 회귀를 함께 확인합니다.' },
  ],
  limitation: '보여 준 코드는 공식 commit의 실제 한 줄을 줄바꿈해 읽기 쉽게 만든 것입니다. 마지막 회귀 항목은 제품 차원의 추가 제안이며 공식 commit에 포함된 테스트라고 주장하지 않습니다.',
}

const gitlabImpact = {
  id: 'w4-context-impact-map',
  type: 'impact-map',
  title: 'CVE-2022-1948의 저장·조회·사용자 조건',
  dimensions: [
    { label: '기밀성', impact: '자동완성 화면을 보는 사용자의 페이지 문맥에서 접근 가능한 일부 데이터가 노출될 가능성이 있습니다.', condition: '공격자가 저장한 contact 값이 피해자의 quick action 후보에 나타나고 브라우저가 이를 해석해야 합니다.' },
    { label: '무결성', impact: '자동완성 DOM과 피해자가 사용할 수 있는 페이지 동작이 변할 가능성이 있습니다.', condition: '피해자가 취약 목록을 렌더링하고 해당 출처 문맥에 변경 가능한 기능이 있어야 합니다.' },
    { label: '가용성', impact: '공식 평가는 주된 영향을 화면 문맥의 기밀성·무결성에 두며 서비스 전체 중단을 주장하지 않습니다.', condition: '표시 오류가 있다는 사실만으로 전역 가용성 영향을 확대하지 않습니다.' },
  ],
  attackerControls: ['자신에게 허용된 contact first name·last name·email 값', '저장 시점의 필드 내용'],
  notControlled: ['다른 사용자가 quick action 자동완성을 여는 시점', '피해자 역할과 접근 가능한 프로젝트', 'GitLab 배포 버전과 CSP·Cookie 정책'],
  access: {
    authentication: 'NVD의 PR:L은 공격자가 contact 값을 저장할 수 있는 낮은 수준의 권한이 필요하다는 뜻입니다.',
    interaction: '피해자가 취약한 자동완성 UI를 열어 저장된 값이 렌더링되어야 합니다.',
    network: '영향받는 GitLab 웹 UI에 공격자와 피해자가 모두 접근할 수 있어야 합니다.',
    defaultExposure: 'GitLab 15.0 계열 중 15.0.1 이전이라는 버전과 contact quick action 사용 경로가 함께 필요합니다.',
    protections: 'CSP는 일부 실행을 제한할 수 있으나 세 필드 escaping과 15.0.1 이상 업데이트를 대신하지 않습니다.',
  },
}

const jqueryMechanism = {
  id: 'w4-impact-jquery-mechanism',
  type: 'mechanism',
  title: 'jQuery가 HTML 문자열을 DOM으로 바꾸기 전에 했던 호환성 처리',
  situation: '오래된 브라우저와 XHTML식 자기 닫힘 표기를 함께 지원하기 위해 jQuery는 DOM 조작 메서드가 받은 HTML 문자열을 브라우저에 넘기기 전 정규식으로 고쳐 썼습니다. 편의를 위한 중간 변환이 정화 결과를 다시 바꿀 수 있다는 점이 이 사례의 경계입니다.',
  terms: [
    { term: 'prefilter', meaning: '주 처리 전에 입력을 정리하거나 호환 가능한 형태로 바꾸는 중간 함수입니다.', contrast: 'sanitizer는 허용할 HTML 구조를 보안 정책으로 제한하며, 문법 호환 변환과 목적이 다릅니다.' },
    { term: 'identity function', meaning: '받은 값을 변경하지 않고 그대로 돌려주는 함수입니다.', contrast: '필터 함수를 삭제하지 않아 API 호환성은 유지하되, 위험한 정규식 변환만 없앨 수 있습니다.' },
  ],
  stages: [
    { label: 'HTML 기능 입력', actor: '애플리케이션', input: '서식 기능에 필요한 HTML 문자열', action: '신뢰 경계 밖 값이라면 정책화된 sanitizer를 먼저 적용합니다.', output: '허용 구조만 남긴 HTML 문자열' },
    { label: 'jQuery prefilter', actor: '`htmlPrefilter`', input: 'DOM 조작 메서드가 받은 문자열', action: '3.5.0 이전에는 정규식으로 일부 자기 닫힘 표기를 열고 닫는 태그로 바꿨습니다.', output: '변환된 HTML 문자열' },
    { label: 'DOM 조작', actor: '`.html()`·`.append()` 계열', input: 'prefilter 결과', action: '브라우저 HTML parser가 읽을 fragment를 준비합니다.', output: '생성·삽입할 DOM node' },
    { label: 'live DOM', actor: '브라우저', input: 'DOM fragment', action: '현재 문서 트리에 node를 붙입니다.', output: 'JavaScript 실행 뒤 화면 상태' },
  ],
  trustBoundary: {
    before: 'sanitizer를 통과했더라도 그 뒤의 문자열 변환이 결과를 바꾸면 검증한 값과 실제 parser 입력이 달라집니다.',
    decision: '`htmlPrefilter`가 문자열을 보존할지 정규식으로 재작성할지 결정합니다.',
    after: '3.5.0에서는 prefilter가 입력을 그대로 반환해 sanitizer 뒤 예기치 않은 변환을 제거합니다.',
    failure: '취약 버전의 정규식 변환과 브라우저 parser의 조합이 일부 edge case에서 의도하지 않은 DOM 해석을 만들 수 있었습니다.',
  },
}

const jqueryPatchAnalysis = {
  id: 'w4-impact-official-patch',
  type: 'patch-analysis',
  title: '공식 commit: 정규식 재작성 대신 입력을 그대로 반환하다',
  evidenceKind: 'official-patch',
  source: jqueryPatch,
  language: 'JavaScript',
  description: 'jQuery commit `1d61fd94`의 `src/manipulation.js` 핵심 변경입니다. 실제 위험 문자열은 수업에 포함하지 않습니다.',
  before: { label: '수정 전 · 실제 htmlPrefilter', code: 'htmlPrefilter: function( html ) {\n  return html.replace(\n    rxhtmlTag, "<$1></$2>"\n  );\n}' },
  after: { label: '수정 후 · 실제 htmlPrefilter', code: 'htmlPrefilter: function( html ) {\n  return html;\n}' },
  changes: [
    '자기 닫힘 태그를 찾던 `rxhtmlTag` 정규식 선언과 `replace` 호출을 제거했습니다.',
    '`htmlPrefilter` API는 남겨 두되 identity function으로 바꿔 호출자의 호환 지점을 유지했습니다.',
    '공식 3.5.0 릴리스는 기존 변환에 의존한 애플리케이션 코드가 깨질 수 있다고 설명합니다. 보안 수정의 회귀 시험에는 정상 HTML 기능도 포함되어야 합니다.',
  ],
  regressionTests: [
    { case: '일반 텍스트 전용 화면', expected: 'jQuery HTML API 대신 텍스트 API로 같은 문장이 표시됨', reason: 'HTML이 필요 없는 경로에서는 해석 권한 자체를 줄입니다.' },
    { case: '제품이 허용한 정상 HTML fixture', expected: '3.5.0에서 의도한 node 구조가 유지됨', reason: 'legacy 자기 닫힘 변환 제거로 생길 수 있는 호환성 회귀를 찾습니다.' },
    { case: 'sanitizer 뒤 DOM 삽입 fixture', expected: 'prefilter가 문자열을 다시 쓰지 않고 정책 결과가 parser로 전달됨', reason: '검증한 값과 실제 사용 값이 일치하는지 확인합니다.' },
  ],
  limitation: 'commit은 보안 변경과 함께 다수의 기존 테스트 fixture를 명시적 닫는 태그로 고쳤습니다. 이 블록은 핵심 함수 diff만 발췌했으며 특정 sanitizer가 모든 HTML 요구에 적합하다고 주장하지 않습니다.',
}

const jqueryImpact = {
  id: 'w4-impact-impact-map',
  type: 'impact-map',
  title: 'CVE-2020-11022가 모든 jQuery 사용처에 자동으로 성립하지 않는 이유',
  dimensions: [
    { label: '기밀성', impact: '취약 페이지 문맥에서 접근 가능한 데이터가 노출될 가능성이 있습니다.', condition: '신뢰할 수 없는 HTML이 영향 버전의 DOM 조작 API에 실제로 전달되고 의도하지 않은 해석이 일어나야 합니다.' },
    { label: '무결성', impact: 'live DOM과 페이지 동작이 애플리케이션 의도와 다르게 바뀔 가능성이 있습니다.', condition: '문자열 변환 결과가 브라우저 parser에서 새 구조 또는 동작으로 해석되어야 합니다.' },
    { label: '가용성', impact: '이 CVE의 중심은 DOM XSS이며 서비스 전체 가용성 저하를 자동으로 뜻하지 않습니다.', condition: '별도의 자원 소진이나 중단 근거 없이 가용성 영향을 확대하지 않습니다.' },
  ],
  attackerControls: ['애플리케이션이 받아들이는 신뢰 경계 밖 HTML 문자열 또는 그 일부', 'client-side source에 들어가는 외부 데이터'],
  notControlled: ['사이트가 사용하는 jQuery 버전', '해당 값이 `.html()`·`.append()` 같은 API로 가는지 여부', 'sanitizer 정책·CSP·피해자 화면의 기능'],
  access: {
    authentication: '필요 권한은 취약 애플리케이션이 외부 HTML을 어디서 받는지에 따라 달라집니다.',
    interaction: '피해자가 해당 DOM 조작 경로가 실행되는 화면을 열어야 실제 브라우저 영향이 생깁니다.',
    network: 'jQuery 자체가 원격 endpoint는 아니며, 외부 값이 취약한 웹 애플리케이션까지 도달할 경로가 필요합니다.',
    defaultExposure: 'jQuery 1.12.0 이상 3.5.0 미만이라는 버전만으로 충분하지 않고 신뢰 밖 HTML을 DOM API에 넘기는 사용법이 함께 있어야 합니다.',
    protections: '3.5.0 이상 업데이트, HTML 불필요 경로의 텍스트 API, 필요한 경우 정책화된 sanitizer를 함께 확인합니다.',
  },
}

function profileCve(block, profile, extraSource) {
  return {
    ...block,
    ...profile,
    sources: block.sources.some((source) => source.url === extraSource.url) ? block.sources : [...block.sources, extraSource],
  }
}

function enrichNature(blocks) {
  return [blocks[0], blocks[1], blocks[2], xssRenderingMechanism, blocks[3], xssOutputCodeTrace, ...blocks.slice(5)]
}

function enrichTypes(blocks) {
  return [blocks[0], blocks[1], blocks[2], xssTypeMechanism, ...blocks.slice(3)]
}

function enrichResteasy(blocks) {
  const cve = profileCve(blocks[1], {
    productRole: 'RESTEasy는 Java 애플리케이션이 HTTP 요청을 JAX-RS resource 메서드와 Java parameter로 연결하도록 돕는 프레임워크입니다.',
    weakness: '오류 응답 경로의 reflected XSS · CWE-79',
    affectedVersions: '3.11.1.Final 이전, 4.5.0.Final 이상 4.5.3.Final 이전',
    fixedVersions: '3.11.1.Final, 4.5.3.Final',
    cause: '공식 upstream PR에서 `StringParameterInjector`의 여러 변환 예외 분기가 외부 `strVal`을 그대로 진단 메시지 생성기에 넘긴 사실을 확인할 수 있습니다. Red Hat은 RESTEASY003870 오류에서 URL encoding 처리가 부적절해 reflected XSS로 이어질 수 있었다고 설명합니다.',
    patch: '공식 PR #2320은 예외 메시지에 넘기는 값을 `_encode(strVal)`로 바꾸고 UTF-8 `URLEncoder` 보조 함수를 추가했습니다. 수정 경계는 3.11.1.Final과 4.5.3.Final입니다.',
    facts: [...blocks[1].facts, '공개 upstream diff는 `StringParameterInjector.java` 한 파일의 17줄 추가·6줄 삭제이며, 실제 변경과 교육용 실패 모델을 별도 블록으로 구분합니다.'],
  }, resteasyPullRequest)
  return [
    blocks[0],
    blocks[5],
    resteasyMechanism,
    resteasyFailureTrace,
    blocks[3],
    cve,
    resteasyPatchAnalysis,
    resteasyImpact,
    blocks[4],
    blocks[6],
    blocks[7],
    blocks[8],
    blocks[9],
  ]
}

function enrichGitlab(blocks) {
  const cve = profileCve(blocks[1], {
    productRole: 'GitLab의 quick action 자동완성은 이슈·설명 편집 중 저장된 contact 정보를 후보 목록으로 보여 주는 frontend 기능입니다.',
    weakness: '저장된 이름의 HTML body escaping 누락 · stored XSS · CWE-79',
    affectedVersions: 'GitLab 15.0부터 15.0.1 이전',
    fixedVersions: 'GitLab 15.0.1',
    cause: '공식 commit에서 `templateFunction`이 email에는 `escape()`를 적용했지만 firstName과 lastName은 template HTML에 그대로 넣었던 실제 줄을 확인할 수 있습니다. 저장된 이름이 나중의 자동완성 렌더링 경계를 다시 넘은 것이 문제였습니다.',
    patch: '공식 commit `e61e9b94`는 firstName·lastName에도 `escape()`를 적용하고 세 필드의 HTML 문법 fixture가 escape되는 frontend spec을 추가했습니다. 완화 버전은 15.0.1입니다.',
    facts: [...blocks[1].facts, '실제 패치는 입력 저장 코드를 바꾼 것이 아니라 자동완성 HTML을 만드는 출력 지점과 그 회귀 테스트를 바꿨습니다.'],
  }, gitlabPatch)
  return [
    blocks[0],
    blocks[2],
    gitlabMechanism,
    cve,
    gitlabPatchAnalysis,
    gitlabImpact,
    ...blocks.slice(3),
  ]
}

function enrichJquery(blocks) {
  const cve = profileCve(blocks[0], {
    productRole: 'jQuery의 DOM manipulation 계층은 애플리케이션이 HTML 문자열로 node를 만들거나 기존 문서에 삽입하도록 돕습니다. `htmlPrefilter`는 그 문자열을 parser 전에 전처리했습니다.',
    weakness: 'DOM manipulation 전 정규식 변환으로 생긴 DOM-based XSS · CWE-79',
    affectedVersions: 'jQuery 1.12.0 이상 3.5.0 미만',
    fixedVersions: 'jQuery 3.5.0',
    cause: '공식 3.5.0 릴리스와 commit은 `htmlPrefilter`의 자기 닫힘 태그 정규식 변환이 edge case에서 XSS를 만들 수 있었다고 설명합니다. 정화된 문자열도 그 뒤에 다시 변환되면 검증한 값과 browser parser가 받은 값이 달라질 수 있었습니다.',
    patch: '공식 commit `1d61fd94`는 `rxhtmlTag` 정규식과 `replace`를 제거하고 `htmlPrefilter`를 입력을 그대로 돌려주는 identity function으로 바꿨습니다. 수정 버전은 3.5.0입니다.',
    facts: [...blocks[0].facts, '공식 commit은 함수 한 줄만이 아니라 기존 자기 닫힘 표기에 의존한 여러 test fixture도 명시적 닫는 태그로 바꿔 호환성 변화를 드러냅니다.'],
  }, jqueryPatch)
  return [
    blocks[1],
    blocks[3],
    jqueryMechanism,
    blocks[2],
    cve,
    jqueryPatchAnalysis,
    jqueryImpact,
    blocks[4],
    blocks[5],
    blocks[6],
  ]
}

export function buildWeek3DeepGuide(baseBlocks) {
  return {
    ...baseBlocks,
    'w4-nature': enrichNature(baseBlocks['w4-nature']),
    'w4-types': enrichTypes(baseBlocks['w4-types']),
    'w4-taint': enrichResteasy(baseBlocks['w4-taint']),
    'w4-context': enrichGitlab(baseBlocks['w4-context']),
    'w4-impact': enrichJquery(baseBlocks['w4-impact']),
  }
}
