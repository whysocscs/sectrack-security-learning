const sources = {
  uri: { label: 'RFC 3986 · Uniform Resource Identifier', url: 'https://www.rfc-editor.org/rfc/rfc3986' },
  mdnUrl: { label: 'MDN · What is a URL?', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL' },
  sop: { label: 'MDN · Same-origin policy', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy' },
  http: { label: 'RFC 9110 · HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110' },
  httpOverview: { label: 'MDN · Overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
  httpMessages: { label: 'MDN · HTTP messages', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages' },
  cookies: { label: 'RFC 6265 · HTTP State Management Mechanism', url: 'https://www.rfc-editor.org/rfc/rfc6265' },
  mdnCookies: { label: 'MDN · Using HTTP cookies', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies' },
  session: { label: 'OWASP · Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' },
  csrf: { label: 'OWASP · CSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html' },
  xss: { label: 'OWASP · Cross Site Scripting Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' },
  mdnXss: { label: 'MDN · Cross-site scripting', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS' },
  textContent: { label: 'MDN · Node.textContent', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent' },
}

const dnsImage = {
  type: 'image-carousel',
  title: '주소 입력부터 화면 표시까지',
  description: '브라우저가 URL을 분석한 뒤 DNS, 연결, 요청·응답, 화면 렌더링으로 이어지는 순서입니다.',
  images: [
    { src: 'media/week02/dns-flow.png', width: 1536, height: 818, alt: 'URL 분석부터 추가 리소스 요청까지 웹 통신의 여덟 단계를 나타낸 그림', caption: 'URL 분석 → DNS 조회 → TCP·TLS 연결 → HTTP 요청·응답 → 브라우저 렌더링' },
  ],
}

const cookieCarousel = {
  type: 'image-carousel',
  title: 'Cookie와 Session이 로그인 상태를 잇는 과정',
  description: '화살표를 눌러 로그인부터 로그아웃까지 1번부터 4번 순서로 확인하세요.',
  images: [
    { src: 'media/week02/cookie-1.png', width: 1448, height: 1086, alt: '로그인 요청을 검증한 서버가 세션을 만들고 Set-Cookie 응답을 보내는 1단계 그림', caption: '1단계 · 로그인 검증, 서버 Session 생성, Set-Cookie 응답' },
    { src: 'media/week02/cookie-2.png', width: 1448, height: 1086, alt: '브라우저가 세션 쿠키와 보안 속성을 저장하는 2단계 그림', caption: '2단계 · 브라우저의 Cookie 저장과 속성 적용' },
    { src: 'media/week02/cookie-3.png', width: 1448, height: 1086, alt: '브라우저가 후속 요청에 쿠키를 보내고 서버가 세션을 조회하는 3단계 그림', caption: '3단계 · Cookie 자동 전송과 서버의 Session 조회' },
    { src: 'media/week02/cookie-4.png', width: 1448, height: 1086, alt: '로그아웃이나 만료 때 서버 세션과 브라우저 쿠키를 폐기하는 4단계 그림', caption: '4단계 · 로그아웃·만료와 Session·Cookie 폐기' },
  ],
}

const xssCarousel = {
  type: 'image-carousel',
  title: 'XSS 유형을 흐름으로 비교하기',
  description: '화살표를 눌러 Reflected, Stored, DOM-based XSS를 1번부터 3번 순서로 비교하세요.',
  images: [
    { src: 'media/week02/xss-1.png', width: 1448, height: 1086, alt: '요청의 입력이 서버 응답에 반사되어 브라우저에서 해석되는 Reflected XSS 흐름 그림', caption: '1단계 · Reflected XSS: 현재 요청의 값이 응답에 반사되는 경로' },
    { src: 'media/week02/xss-2.png', width: 1448, height: 1086, alt: '입력값이 서버에 저장된 뒤 다른 사용자의 브라우저에서 해석되는 Stored XSS 흐름 그림', caption: '2단계 · Stored XSS: 저장된 값이 나중의 화면에서 다시 출력되는 경로' },
    { src: 'media/week02/xss-3.png', width: 1448, height: 1086, alt: '브라우저 JavaScript가 클라이언트 입력을 DOM에 넣어 해석하게 하는 DOM-based XSS 흐름 그림', caption: '3단계 · DOM-based XSS: 브라우저 내부 데이터와 DOM API로 이어지는 경로' },
  ],
}

export const week3LessonBlocks = Object.freeze({
  'w3-url-dns': [
    { type: 'explanation', title: 'URL이란?', paragraphs: [
      'URL은 인터넷상에 존재하는 특정 정보 자원의 정확한 위치와 이를 식별할 수 있는 고유한 디지털 경로를 나타냅니다.',
      '웹 브라우저가 해당 리소스에 접근할 수 있도록 통신 규약, 서버 위치, 내부 경로 등의 식별 정보를 표준화된 형식으로 제공합니다.',
    ] },
    { type: 'explanation', title: 'URL은 어떻게 생겼을까?', paragraphs: [
      'URL은 브라우저가 어떤 방식으로, 어느 서버의, 어떤 자원을 요청할지 표현합니다. 다음 주소를 기준으로 구조를 나누어 봅니다.',
    ] },
    { type: 'code', sourceType: 'educational-reconstruction', title: 'URL 예시', language: 'text', code: 'https://shop.example.test:8443/products/42?view=detail&lang=ko#reviews', annotations: [
      '`https`는 사용할 통신 방식입니다.',
      '`shop.example.test`는 연결할 호스트 이름이고 `8443`은 포트입니다.',
      '`/products/42`는 서버에 요청할 경로입니다.',
      '`view=detail&lang=ko`는 query이고 `reviews`는 fragment입니다.',
      'Query는 일반적으로 서버로 전달되지만 Fragment는 일반적인 HTTP 요청에 포함되지 않습니다.',
    ] },
    { type: 'timeline', title: 'URL의 구조를 더 자세하게 알아보자', items: [
      { title: 'Scheme · https', body: '어떤 방식으로 통신할지 나타냅니다.' },
      { title: 'Host · shop.example.test', body: '연결할 서버의 이름을 나타냅니다.' },
      { title: 'Port · 8443', body: '서버의 어느 통신 입구를 사용할지 나타냅니다.' },
      { title: 'Path · /products/42', body: '서버의 어떤 자원을 요청할지 나타냅니다.' },
      { title: 'Query · view=detail&lang=ko', body: '요청에 전달할 추가 값을 나타냅니다.' },
      { title: 'Fragment · reviews', body: '응답을 받은 브라우저가 문서 안에서 가리킬 위치나 상태를 나타냅니다.' },
    ] },
    { type: 'comparison', title: 'URL 구성 요소 비교', columns: ['부분', '예시', '답하는 질문'], rows: [
      ['Scheme', '`https`', '어떤 방식으로 통신하는가?'],
      ['Host', '`shop.example.test`', '어느 서버에 연결하는가?'],
      ['Port', '`8443`', '서버의 어느 통신 입구를 사용하는가?'],
      ['Path', '`/products/42`', '서버의 어떤 자원을 요청하는가?'],
      ['Query', '`view=detail&lang=ko`', '요청에 어떤 추가 값을 전달하는가?'],
      ['Fragment', '`reviews`', '응답을 받은 브라우저가 문서의 어디를 가리키는가?'],
    ] },
    { type: 'misconception', title: '자주 하는 혼동', items: [
      'URL의 `#fragment`도 항상 서버 로그에 남는다 → Fragment는 일반적인 HTTP 요청에 포함되지 않고 브라우저 내부에서 처리됩니다.',
      'Host가 같으면 무조건 같은 Origin이다 → Origin은 scheme, host, port를 함께 비교합니다.',
    ] },
    { type: 'explanation', variant: 'assignment', title: '과제 #1 · Fragment가 서버로 가지 않는 이유', paragraphs: [
      '예시: `https://example.test/search?q=security#result-3`을 주소창에 입력했을 때 브라우저 주소에는 `#result-3`이 보이지만 HTTP request target은 `/search?q=security`입니다.',
      '이 차이를 URL 표준, 브라우저의 처리 위치, 서버 로그에서의 관찰 가능성으로 나누어 조사합니다. 단순히 “서버로 안 간다”로 끝내지 말고 누가 fragment를 읽고 어떤 기능에 사용하는지 설명해야 합니다.',
    ] },
    { type: 'comparison', title: '과제 #1 필수 확인 항목', columns: ['필수 항목', '확인할 내용', '제출 예시'], rows: [
      ['요청 비교', '주소창 URL과 실제 HTTP request target', '`#result-3`은 요청선에 없음'],
      ['처리 주체', '서버와 브라우저 중 누가 fragment를 읽는가', '브라우저 또는 client-side JavaScript'],
      ['사용 목적', '문서 위치·탭 상태·라우팅 등 한 가지 실제 용도', '페이지의 특정 절로 이동'],
      ['근거', 'RFC 또는 MDN 링크와 확인한 문장 요약', '자료 제목·URL·자기 말 요약'],
    ] },
    { type: 'checkpoint', id: 'w3-url-dns-check-01', title: 'URL 구성 요소 확인', prompt: '다음 URL에서 서버로 전달되지 않는 부분은 무엇입니까? `https://example.test/search?q=security#result-3`', options: ['`/search`', '`q=security`', '`result-3`'], answer: 2, explanation: '`#result-3`은 fragment이며 일반적인 HTTP 요청에는 포함되지 않습니다.' },
    { type: 'sources', title: '공식 참고자료', items: [sources.uri, sources.mdnUrl, sources.sop] },
    { type: 'summary', title: '핵심 정리', bullets: [
      'URL은 scheme, host, port, path, query, fragment로 나누어 읽습니다.',
      'Query는 요청에 포함될 수 있지만 fragment는 일반적인 HTTP 요청에 포함되지 않습니다.',
      '브라우저의 Origin은 scheme, host, port의 조합입니다.',
    ] },
  ],

  'w3-flow': [
    { type: 'explanation', title: '브라우저와 서버는 어떻게 통신하는가', paragraphs: ['주소창에 URL을 입력한 뒤 DNS, 연결, TLS, HTTP 요청·응답, 브라우저 렌더링이 어떤 순서로 이어지는지 확인합니다.'] },
    { type: 'explanation', title: 'HTTP 전에 연결할 서버를 찾아야 합니다', paragraphs: [
      '브라우저는 URL의 host를 보고 DNS를 통해 연결할 IP 주소를 찾습니다. 이후 서버와 전송 연결을 만들고, HTTPS라면 TLS를 통해 서버 인증서와 암호화된 통신 조건을 확인합니다. 그다음 HTTP 요청을 전송합니다.',
      'HTTP는 요청과 응답의 의미를 정의합니다. TCP는 데이터를 순서대로 전달하는 연결을 제공하고 TLS는 그 연결 위에서 기밀성과 무결성, 서버 인증을 제공합니다. 각 계층은 역할이 다릅니다.',
    ] },
    { type: 'timeline', title: '주소 입력부터 화면 표시까지', items: [
      '브라우저가 URL을 분석합니다.',
      'DNS로 host에 대응하는 IP 주소를 찾습니다.',
      '서버와 전송 연결을 만듭니다.',
      'HTTPS라면 TLS 연결과 서버 인증을 수행합니다.',
      '브라우저가 HTTP Request를 보냅니다.',
      '서버가 요청을 처리하고 HTTP Response를 보냅니다.',
      '브라우저가 응답 본문을 해석해 화면을 만듭니다.',
      '추가 CSS, JavaScript, 이미지가 필요하면 새로운 요청을 보냅니다.',
    ] },
    dnsImage,
    { type: 'http-message', sourceType: 'educational-reconstruction', title: '예시: 상품 상세 요청', message: 'GET /products/42?lang=ko HTTP/1.1\nHost: shop.example.test\nAccept: text/html\nAccept-Language: ko-KR\nCookie: session_id=[REDACTED]\n', annotations: [
      'Request line에는 Method, 요청 대상, HTTP version이 있습니다.',
      'Header는 Host, 원하는 응답 형식, 언어, 인증 상태 같은 부가 정보를 전달합니다.',
      '빈 줄은 Header와 Body의 경계입니다.',
      '이 GET 요청에는 Body가 없습니다.',
    ] },
    { type: 'http-message', sourceType: 'educational-reconstruction', title: '상품 상세 응답', message: 'HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\nContent-Length: 1480\nCache-Control: no-store\n\n<!doctype html>\n<html lang="ko">\n  <body><h1>상품 42</h1></body>\n</html>', annotations: [
      'Status line에는 HTTP version, status code, reason phrase가 있습니다.',
      'Response Header는 본문의 형식과 처리 조건을 설명합니다.',
      '빈 줄 뒤의 Body가 브라우저에 전달됩니다.',
      '`200 OK`는 요청 처리가 성공했다는 뜻이지 보안상 안전하다는 증명은 아닙니다.',
    ] },
    { type: 'comparison', title: '요청과 응답 구조', columns: ['구분', 'Request', 'Response'], rows: [
      ['시작 줄', 'Method·요청 대상·HTTP version', 'HTTP version·Status code'],
      ['Header', 'Host·Cookie·Content-Type 등', 'Content-Type·Set-Cookie·Cache-Control 등'],
      ['빈 줄', 'Header와 Body 경계', 'Header와 Body 경계'],
      ['Body', '폼·JSON·파일 등의 입력', 'HTML·JSON·이미지 등의 결과'],
    ] },
    { type: 'comparison', title: '주요 Method와 Status', columns: ['항목', '기본 의미', '확인할 점'], rows: [
      ['GET', '자원 조회', '조회가 서버 상태를 바꾸지는 않는가?'],
      ['POST', '데이터 제출 또는 처리 요청', 'Body 형식과 상태 변경 조건은 무엇인가?'],
      ['PUT/PATCH', '자원 전체 또는 일부 변경', '인증된 사용자가 해당 자원을 바꿀 권한이 있는가?'],
      ['DELETE', '자원 삭제 요청', '중요한 변경에 추가 검증이 있는가?'],
      ['200', '요청 처리 성공', '응답 데이터가 요청자에게 허용된 것인가?'],
      ['302', '다른 위치로 이동', '이동 목적지를 신뢰할 수 있는가?'],
      ['401', '인증 필요 또는 실패', '사용자 신원을 확인할 정보가 있는가?'],
      ['403', '요청을 이해했지만 허용하지 않음', '해당 사용자에게 행동 권한이 있는가?'],
      ['404', '자원을 찾을 수 없음', '경로가 틀렸는가, 노출을 줄이기 위한 응답인가?'],
      ['500', '서버 처리 중 오류', '오류 응답에 내부 정보가 노출되는가?'],
    ] },
    { type: 'misconception', title: '자주 하는 혼동', items: [
      'HTTPS를 쓰면 웹 취약점이 모두 사라진다 → HTTPS는 전송 구간을 보호하지만 서버의 인가 누락, XSS, SQL Injection 같은 애플리케이션 문제를 고치지는 않습니다.',
      '응답이 200이면 요청이 보안상 정상이다 → 200은 처리 결과 상태일 뿐 인증·인가·출력 처리의 안전성을 보장하지 않습니다.',
    ] },
    { type: 'checkpoint', id: 'w3-flow-check-01', title: 'Response Header 확인', prompt: 'HTTP Response에서 Body의 형식을 설명하는 Header는 무엇입니까?', options: ['Host', 'Content-Type', 'Cookie'], answer: 1, explanation: '`Content-Type`은 Body가 HTML, JSON 등 어떤 media type인지 설명합니다.' },
    { type: 'sources', title: '공식 참고자료', items: [sources.http, sources.httpOverview, sources.httpMessages] },
    { type: 'summary', title: '핵심 정리', bullets: [
      '브라우저는 DNS와 연결 과정을 거친 뒤 HTTP 요청을 보냅니다.',
      'HTTP 메시지는 시작 줄, Header, 빈 줄, 선택적 Body로 구성됩니다.',
      'HTTPS는 전송을 보호하지만 애플리케이션 취약점을 자동으로 제거하지 않습니다.',
    ] },
  ],

  'w3-session': [
    { type: 'explanation', title: 'Cookie와 Session은 상태를 어떻게 유지하는가', paragraphs: ['HTTP 요청이 서로 독립적인 상황에서 Cookie와 Session이 로그인한 사용자를 어떻게 연결하는지 구분합니다.'] },
    { type: 'explanation', title: 'Cookie는 브라우저에, Session 상태는 보통 서버에 있습니다', paragraphs: [
      'HTTP는 기본적으로 이전 요청을 자동으로 기억하지 않습니다. 서버가 로그인한 사용자를 다음 요청에서도 알아보려면 요청들을 연결할 식별 정보가 필요합니다.',
      'Cookie는 서버가 `Set-Cookie` 응답 Header로 브라우저에 저장을 요청할 수 있는 작은 값입니다. 브라우저는 Domain, Path, Secure, SameSite 같은 조건이 맞는 다음 요청에 Cookie를 자동으로 포함할 수 있습니다.',
      'Session은 여러 요청에 걸쳐 유지해야 하는 서버 측 상태입니다. 서버는 로그인 사용자, 만료 시각, 권한 정보 등을 Session 저장소에 두고 임의성이 충분한 Session ID로 찾을 수 있습니다. 이 Session ID가 Cookie에 담기는 방식이 흔합니다.',
    ] },
    { type: 'timeline', title: '로그인 상태가 이어지는 흐름', items: [
      '사용자가 로그인 정보를 제출합니다.',
      '서버가 정보를 확인합니다.',
      '서버가 새로운 Session을 만들고 Session ID를 생성합니다.',
      '서버가 `Set-Cookie`로 Session ID를 브라우저에 전달합니다.',
      '브라우저가 조건이 맞는 다음 요청에 Cookie를 포함합니다.',
      '서버가 Session ID로 서버 측 Session 상태를 찾습니다.',
      '서버가 사용자와 권한을 확인한 뒤 응답합니다.',
    ] },
    cookieCarousel,
    { type: 'http-message', sourceType: 'educational-reconstruction', title: '로그인 성공 응답', message: 'HTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: session_id=RANDOM_SERVER_VALUE; Path=/; Secure; HttpOnly; SameSite=Lax\nCache-Control: no-store\n\n{"login":"ok"}', annotations: [
      '실제 Session ID는 예측하기 어려운 값이어야 합니다.',
      '`Secure`는 HTTPS 요청에서만 Cookie를 보내도록 제한합니다.',
      '`HttpOnly`는 JavaScript의 Cookie 읽기를 제한합니다.',
      '`SameSite`는 교차 사이트 요청에서 Cookie가 전송되는 조건을 제한합니다.',
    ] },
    { type: 'http-message', sourceType: 'educational-reconstruction', title: '로그인 후 요청', message: 'GET /account HTTP/1.1\nHost: shop.example.test\nCookie: session_id=RANDOM_SERVER_VALUE\nAccept: text/html\n', annotations: ['브라우저는 Cookie를 요청에 포함하지만 서버는 Cookie 값만 믿고 권한을 결정하면 안 됩니다.', '서버가 Session을 조회하고 현재 사용자에게 `/account`를 볼 권한이 있는지 확인해야 합니다.'] },
    { type: 'comparison', title: 'Cookie와 Session 비교', columns: ['구분', 'Cookie', 'Session'], rows: [
      ['주된 저장 위치', '브라우저', '서버의 메모리·캐시·데이터베이스 등'],
      ['전달 방식', '조건에 맞는 HTTP 요청에 포함', '보통 Cookie의 Session ID로 조회'],
      ['담아야 할 값', '최소한의 식별 정보', '사용자·만료·서버 측 상태'],
      ['사용자가 바꿀 수 있는가?', '브라우저 값은 변경 가능', '서버 상태는 클라이언트가 직접 변경할 수 없어야 함'],
      ['핵심 검증', '속성·범위·민감정보 최소화', 'ID 생성·교체·만료·무효화·인가'],
    ] },
    { type: 'comparison', title: 'Cookie 속성의 역할', columns: ['속성', '제한하는 것', '막지 못하는 것'], rows: [
      ['Secure', '평문 HTTP로 Cookie 전송', 'XSS와 서버 측 인가 누락'],
      ['HttpOnly', 'JavaScript의 Cookie 읽기', 'XSS 실행과 로그인 사용자 권한의 요청 수행'],
      ['SameSite', '일부 교차 사이트 요청의 Cookie 전송', '모든 CSRF와 같은 사이트 XSS'],
      ['Domain', 'Cookie를 보낼 host 범위', '해당 범위 내부 애플리케이션의 취약점'],
      ['Path', 'Cookie를 보낼 URL path 범위', '강한 보안 경계나 서버 측 인가'],
    ] },
    { type: 'misconception', title: '자주 하는 혼동', items: [
      'Cookie와 Session은 같은 것이다 → Cookie는 브라우저가 보관·전송하는 값이고 Session은 서버가 여러 요청을 연결하기 위해 관리하는 상태입니다.',
      'Cookie에 `HttpOnly`를 붙이면 XSS가 해결된다 → Cookie 읽기 위험은 줄지만 XSS 원인과 스크립트 실행은 남아 있습니다.',
    ] },
    { type: 'checkpoint', id: 'w3-session-check-01', title: 'Session 식별자 확인', prompt: '일반적인 서버 측 Session 방식에서 브라우저 Cookie에 담는 값으로 가장 적절한 것은 무엇입니까?', options: ['사용자의 전체 개인정보', '예측하기 어려운 Session ID', '서버 데이터베이스 비밀번호'], answer: 1, explanation: '브라우저에는 최소한의 Session 식별자를 두고 실제 상태는 서버에서 관리합니다.' },
    { type: 'sources', title: '공식 참고자료', items: [sources.cookies, sources.mdnCookies, sources.session] },
    { type: 'summary', title: '핵심 정리', bullets: [
      'Cookie는 브라우저가 저장하고 요청에 포함할 수 있는 값입니다.',
      'Session은 서버가 여러 요청에 걸쳐 유지하는 상태입니다.',
      'Session ID는 예측하기 어렵고 로그인 시 교체되며 만료·로그아웃 시 무효화돼야 합니다.',
    ] },
  ],

  'w3-dom': [
    { type: 'explanation', title: 'XSS란?', paragraphs: [
      '교차 사이트 스크립팅(XSS)은 공격자가 합법적인 웹 사이트에 코드를 첨부하여 피해자가 웹 사이트를 로드할 때 이 코드가 실행되도록 하는 취약점입니다.',
      '코드는 URL 끝에 추가되거나 사용자가 생성한 콘텐츠를 표시하는 페이지에 게시되는 등 여러 경로로 들어올 수 있습니다. 기술적으로는 클라이언트 측 코드 삽입 공격입니다.',
    ] },
    { type: 'explanation', title: 'XSS는 어디서 발생하는가?', paragraphs: [
      'XSS는 사용자가 입력한 값이 적절한 검증이나 이스케이프 없이 웹 페이지에 출력될 때 발생합니다. 브라우저가 해당 값을 단순한 텍스트가 아니라 HTML 또는 JavaScript 코드로 해석하면 스크립트가 실행될 수 있습니다.',
      '주요 발생 지점은 검색창과 URL 파라미터, 게시글·댓글·채팅 메시지, 사용자 이름과 프로필, 상품 후기와 문의사항, JavaScript로 동적으로 생성되는 화면, 외부 API 응답이나 파일명입니다.',
      'XSS는 발생 방식에 따라 서버 응답에 즉시 포함되는 반사형 XSS, 데이터베이스에 저장되는 저장형 XSS, 브라우저의 JavaScript 처리 과정에서 발생하는 DOM 기반 XSS로 구분할 수 있습니다.',
      '즉, XSS는 신뢰할 수 없는 데이터가 브라우저에서 실행 가능한 코드로 처리되는 모든 지점에서 발생할 수 있습니다.',
    ] },
    { type: 'comparison', title: 'XSS 유형의 차이', columns: ['유형', '외부 값이 오는 곳', '브라우저까지 오는 경로'], rows: [
      ['Reflected XSS', '현재 요청의 Query·Body 등', '서버 응답에 바로 반사됨'],
      ['Stored XSS', '게시글·프로필처럼 저장된 값', '저장 후 다른 응답에서 다시 출력됨'],
      ['DOM-based XSS', 'URL·브라우저 메시지·저장소 등', '클라이언트 JavaScript가 DOM Sink로 전달함'],
    ] },
    xssCarousel,
    { type: 'explanation', variant: 'assignment', title: '과제 #2 · XSS 유형별 CVE와 데이터 흐름 조사', paragraphs: [
      '예시: 공개 CVE 하나를 골라 “검색 query가 서버 응답의 HTML body에 escaping 없이 들어가 브라우저에서 해석됐다”처럼 Source, 전달 경로, Sink, Context를 한 문장으로 연결합니다.',
      'Reflected·Stored·DOM-based XSS를 각각 하나씩 조사합니다. 공식 advisory나 patch를 우선하고, PoC는 공급자·교육 플랫폼·로컬 재현 자료처럼 허가된 범위의 자료만 분석합니다. 실제 외부 서비스에는 실행하지 않습니다.',
    ] },
    { type: 'comparison', title: '과제 #2 필수 확인 항목', columns: ['필수 항목', '반드시 적을 내용', '판단 기준'], rows: [
      ['사례 식별', 'CVE 번호·제품·영향 버전', '공식 advisory와 일치'],
      ['정상 기능', '취약 기능이 원래 해야 하는 일', '제품 이름만 쓰지 않고 기능 설명'],
      ['데이터 흐름', 'Source → Transform → Sink → Context', '값이 어디서 코드로 해석되는지 표시'],
      ['유형 근거', 'Reflected·Stored·DOM-based로 판단한 이유', '저장 여부와 실행 위치를 증거로 사용'],
      ['공식 수정', 'patch 또는 공급자 완화 내용', '문자열 차단이 아닌 바뀐 처리 경계 확인'],
      ['안전한 PoC', '로컬·sandbox·공식 Lab 범위와 무해한 결과', '쿠키 탈취·외부 전송·실제 대상 사용 금지'],
    ] },
    { type: 'misconception', title: '자주 하는 혼동', items: [
      'XSS는 Cookie가 있을 때만 발생한다 → Cookie가 없어도 외부 값이 브라우저에서 코드로 해석되면 XSS가 발생할 수 있습니다.',
      'Session을 서버에 저장하면 XSS가 사라진다 → Session 저장 위치와 브라우저의 출력 처리 취약점은 서로 다른 문제입니다.',
    ] },
    { type: 'checkpoint', id: 'w3-dom-check-01', title: 'HttpOnly와 XSS 구분', prompt: '`HttpOnly`가 설정된 Session Cookie를 사용하는 페이지에서 XSS가 발견됐습니다. 가장 정확한 판단은 무엇입니까?', options: ['Cookie를 읽지 못하므로 XSS가 완전히 해결됐다.', 'Cookie 직접 읽기는 제한되지만 XSS 원인과 로그인 사용자 권한의 동작 가능성은 남아 있다.', 'Session을 사용하므로 브라우저에서 스크립트가 실행되지 않는다.'], answer: 1, explanation: '`HttpOnly`는 Cookie 읽기를 제한하는 속성이지 XSS 수정책이 아닙니다.' },
    { type: 'sources', title: '공식 참고자료', items: [sources.xss, sources.mdnXss, sources.textContent] },
    { type: 'summary', title: '핵심 정리', bullets: [
      'XSS의 원인은 Cookie가 아니라 외부 값이 코드로 해석되는 Source-to-Sink 흐름입니다.',
      'Session과 HttpOnly는 XSS 실행 자체를 막지 않습니다.',
      '일반 텍스트 기능은 안전한 Sink를 사용하고 필요한 Context에 맞게 출력 처리해야 합니다.',
    ] },
  ],

  'w3-auth-origin': [
    { type: 'explanation', title: 'Cookie와 Session에서는 어떤 취약점이 발생하는가', paragraphs: [
      'Cookie와 Session은 로그인 상태를 유지하는 데 사용됩니다. 하지만 Cookie 값을 그대로 신뢰하거나 Session의 생성·교체·만료를 잘못 관리하면 공격자가 다른 사용자의 권한을 사용할 수 있습니다.',
    ] },
    { type: 'explanation', title: '왜 Cookie와 Session을 함께 사용할까?', paragraphs: [
      'Cookie는 브라우저에 값을 저장하고 요청에 포함하는 전달 수단입니다.',
      'Session은 로그인 사용자와 권한 등의 정보를 관리하는 서버 측 상태입니다.',
      '일반적인 서버 측 Session 방식에서는 Cookie에 실제 사용자 정보를 넣지 않고 Session을 찾기 위한 식별자만 저장합니다.',
    ] },
    { type: 'code', sourceType: 'educational-reconstruction', title: 'Cookie가 Session을 가리키는 구조', language: 'text', code: '브라우저\nCookie: session_id=RANDOM_VALUE\n              │\n              ▼\n서버 Session 저장소\nRANDOM_VALUE → 사용자 1001, 권한 user, 만료 시각' },
    { type: 'explanation', title: 'Cookie 값을 그대로 믿으면 안 됩니다', paragraphs: ['Cookie는 사용자가 확인하거나 변경할 수 있습니다. 서버 측 Session을 사용하면 브라우저에는 의미 없는 Session ID만 두고 실제 사용자와 권한은 서버가 관리할 수 있습니다.'] },
    { type: 'http-message', sourceType: 'educational-reconstruction', title: '서버가 신뢰하면 안 되는 Cookie 예시', message: 'Cookie: user_id=1001; role=admin', annotations: ['공격자는 브라우저에 저장된 값을 변경할 수 있습니다.', '사용자 ID와 권한은 서버 데이터나 서버 Session을 기준으로 다시 확인해야 합니다.'] },
    { type: 'explanation', title: 'Cookie만 사용하면 안 될까?', paragraphs: [
      'Cookie만으로 로그인 상태를 관리하는 것도 가능합니다. 다만 Cookie에 저장한 데이터가 변조되지 않도록 서명이나 암호학적 검증이 필요합니다.',
      '서버 측 Session은 로그아웃 시 즉시 무효화, 비밀번호 변경 시 기존 로그인 종료, 권한 변경 즉시 반영, Session 만료 시간 관리, 브라우저 개인정보 최소화를 관리하기 쉽습니다.',
      '즉, Cookie와 Session 중 하나만 선택하는 것이 아닙니다. 일반적인 구조에서는 Cookie가 Session ID를 전달하고 Session이 로그인 상태를 관리합니다.',
    ] },
    { type: 'explanation', title: 'Cookie 값 변조', paragraphs: ['Cookie는 클라이언트가 보내는 입력입니다. 서버가 가격, 할인율, 사용자 권한을 Cookie 값만 보고 결정하면 공격자가 값을 조작할 수 있습니다. 중요한 정보는 데이터베이스나 서버 Session을 기준으로 다시 확인해야 합니다.'] },
    { type: 'http-message', sourceType: 'educational-reconstruction', title: '변조 가능한 Cookie 값', message: 'Cookie: price=1000; discount=90; role=admin' },
    { type: 'explanation', title: '안전하지 않은 Cookie 속성', paragraphs: [
      'Session Cookie에는 일반적으로 Secure, HttpOnly, SameSite 같은 속성을 적용합니다. Domain을 지나치게 넓게 설정하면 보안 수준이 낮은 다른 하위 도메인이 Session Cookie에 영향을 줄 수 있습니다.',
      'Session Cookie를 특정 host에만 사용한다면 Domain을 생략하는 것이 안전합니다.',
    ] },
    { type: 'http-message', sourceType: 'educational-reconstruction', title: 'Session Cookie 속성', message: 'Set-Cookie: session_id=RANDOM_VALUE; Path=/; Secure; HttpOnly; SameSite=Lax' },
    { type: 'comparison', title: 'Cookie 속성', columns: ['속성', '역할'], rows: [
      ['`Secure`', 'HTTPS 요청에서만 Cookie 전송'],
      ['`HttpOnly`', 'JavaScript의 Cookie 읽기 제한'],
      ['`SameSite`', '일부 교차 사이트 요청에서 Cookie 전송 제한'],
      ['`Domain`', 'Cookie가 전송되는 host 범위'],
      ['`Path`', 'Cookie가 전송되는 URL 경로'],
    ] },
    { type: 'explanation', title: 'CSRF', paragraphs: [
      '브라우저는 조건이 맞으면 Cookie를 요청에 자동으로 포함합니다. 사용자가 로그인한 상태에서 다른 사이트가 상태 변경 요청을 발생시키면 Session Cookie가 함께 전송될 수 있습니다.',
      '서버가 사용자의 의도를 추가로 확인하지 않으면 이메일 변경 같은 작업이 실행될 수 있습니다. 이것이 CSRF입니다.',
      '주요 방어는 CSRF Token 검증, SameSite 설정, Origin Header 검증, 상태 변경 요청에 GET 사용 금지, 중요한 작업의 비밀번호 재확인입니다.',
    ] },
    { type: 'http-message', sourceType: 'educational-reconstruction', title: 'CSRF에서 악용될 수 있는 상태 변경 요청', message: 'POST /account/change-email HTTP/1.1\nHost: shop.example.test\nCookie: session_id=[REDACTED]\n\nemail=attacker@example.test' },
    { type: 'explanation', title: 'Session ID 추측', paragraphs: ['Session ID가 순차적이거나 규칙적이면 다른 사용자의 값을 추측할 수 있습니다. Session ID는 암호학적으로 안전한 난수 생성기를 이용해 예측하기 어렵게 만들어야 합니다.'] },
    { type: 'code', sourceType: 'educational-reconstruction', title: '사용하면 안 되는 규칙적 Session ID', language: 'text', code: 'session_id=10001\nsession_id=10002\nsession_id=10003' },
    { type: 'explanation', title: 'Session Hijacking', paragraphs: [
      'Session Hijacking은 공격자가 다른 사용자의 유효한 Session ID를 획득해 사용하는 공격입니다. 서버는 Session ID를 인증된 사용자의 증명처럼 사용하므로 공격자는 비밀번호 없이 피해자처럼 요청할 수 있습니다.',
      'Session ID는 암호화되지 않은 HTTP 통신, URL, 서버 로그나 브라우저 방문 기록, 공유 컴퓨터의 Cookie, 잘못 공개된 로그와 백업에서 노출될 수 있습니다. Session ID를 URL에 포함하지 않고 HTTPS와 Secure Cookie를 사용해야 합니다.',
    ] },
    { type: 'http-message', sourceType: 'educational-reconstruction', title: '노출된 Session ID의 오용 형태', message: 'Cookie: session_id=[STOLEN_SESSION_REDACTED]' },
    { type: 'explanation', title: 'Session Fixation', paragraphs: ['Session Fixation은 공격자가 알고 있는 Session ID를 피해자가 로그인한 뒤에도 그대로 사용하게 만드는 공격입니다. 로그인 성공 후에는 새로운 Session ID를 발급하고 이전 ID를 폐기해야 합니다. 권한 상승, 비밀번호 변경, 계정 복구, 중요한 보안 설정 변경 때도 Session ID를 교체하거나 무효화해야 합니다.'] },
    { type: 'timeline', title: 'Session Fixation 흐름', items: [
      '공격자가 Session ID A를 준비합니다.',
      '피해자가 Session ID A를 사용합니다.',
      '피해자가 로그인합니다.',
      '서버가 ID A를 그대로 유지합니다.',
      '공격자가 ID A로 피해자 계정에 접근합니다.',
    ] },
    { type: 'http-message', sourceType: 'educational-reconstruction', title: '로그인 뒤 새로 발급해야 하는 Cookie', message: 'Set-Cookie: session_id=NEW_RANDOM_VALUE; Secure; HttpOnly; SameSite=Lax' },
    { type: 'explanation', title: '불완전한 만료와 로그아웃', paragraphs: [
      '브라우저 Cookie만 삭제하고 서버 Session을 남겨 두면 이전 Session ID를 다시 사용할 수 있습니다. 로그아웃할 때는 브라우저의 Session Cookie를 삭제하고 서버의 Session도 삭제하거나 무효화해야 합니다.',
      'Session 만료는 브라우저 Cookie 시간에만 의존하면 안 됩니다. 서버는 일정 시간 요청이 없으면 종료하는 Idle Timeout과 로그인 후 최대 유지 시간을 제한하는 Absolute Timeout을 직접 검사해야 합니다.',
    ] },
    { type: 'comparison', title: 'Session 만료 방식', columns: ['종류', '의미'], rows: [
      ['Idle Timeout', '일정 시간 요청이 없으면 종료'],
      ['Absolute Timeout', '로그인 후 최대 유지 시간 제한'],
    ] },
    { type: 'explanation', title: 'Session과 인가를 혼동하면 안 됩니다', paragraphs: ['Session이 유효하다는 것은 사용자가 로그인했다는 뜻입니다. 모든 자원에 접근할 수 있다는 의미는 아닙니다. 서버는 Session이 유효한지 확인하는 인증과, 현재 사용자가 요청한 자원을 사용할 권한이 있는지 확인하는 인가를 모두 수행해야 합니다.'] },
    { type: 'http-message', sourceType: 'educational-reconstruction', title: '별도 인가가 필요한 요청', message: 'GET /users/2002/orders HTTP/1.1\nCookie: session_id=USER_1001_SESSION', annotations: ['인증: Session이 유효한가?', '인가: 사용자 1001이 사용자 2002의 주문을 볼 권한이 있는가?'] },
    { type: 'comparison', title: '취약점 비교', columns: ['문제', '원인', '주요 방어'], rows: [
      ['Cookie 변조', '클라이언트 값을 그대로 신뢰', '서버 데이터로 재검증'],
      ['CSRF', '브라우저의 자동 Cookie 전송', 'CSRF Token, SameSite'],
      ['Session Hijacking', '유효한 Session ID 탈취', 'HTTPS, Secure, 짧은 만료'],
      ['Session Fixation', '로그인 후 기존 ID 유지', '로그인 시 Session ID 교체'],
      ['Session Prediction', '규칙적인 Session ID', '안전한 난수 생성'],
      ['불완전한 로그아웃', '서버 Session 유지', '서버 Session 무효화'],
      ['인가 누락', '로그인 여부만 확인', '요청별 권한 검사'],
    ] },
    { type: 'misconception', title: '자주 하는 혼동', items: [
      'Cookie와 Session 중 하나만 사용한다 → Cookie가 Session ID를 전달하고 Session이 서버 상태를 관리하는 방식이 일반적입니다.',
      '`HttpOnly`를 설정하면 모든 Cookie 공격이 해결된다 → JavaScript의 Cookie 읽기만 제한하며 CSRF와 Session Fixation은 별도로 방어해야 합니다.',
      'HTTPS를 사용하면 Session 공격이 모두 해결된다 → HTTPS는 전송을 보호하지만 Session ID 생성·교체·만료 문제는 해결하지 않습니다.',
      '로그아웃할 때 Cookie만 삭제하면 된다 → 서버 Session도 함께 무효화해야 합니다.',
    ] },
    { type: 'checkpoint', id: 'w3-auth-origin-check-01', title: 'Session Fixation 확인', prompt: '공격자가 알고 있는 Session ID를 피해자가 로그인한 뒤에도 서버가 유지했습니다. 이 공격은 무엇입니까?', options: ['Session Timeout', 'Session Fixation', 'CSRF'], answer: 1, explanation: '로그인 전과 로그인 후에 같은 Session ID를 유지하면 Session Fixation이 발생할 수 있습니다.' },
    { type: 'checkpoint', id: 'w3-auth-origin-check-02', title: '로그아웃 처리 확인', prompt: '로그아웃할 때 필요한 서버 측 처리는 무엇입니까?', options: ['Cookie 이름 변경', '기존 Session 무효화', '응답 상태를 200으로 변경'], answer: 1, explanation: '브라우저 Cookie만 삭제하면 기존 Session ID가 서버에서 계속 유효할 수 있습니다.' },
    { type: 'sources', title: '공식 참고자료', items: [sources.session, sources.csrf, sources.mdnCookies] },
    { type: 'summary', title: '핵심 정리', bullets: [
      'Cookie는 브라우저가 값을 저장하고 전송하는 수단입니다.',
      'Session은 서버가 로그인 상태를 관리하는 방식입니다.',
      'Cookie의 사용자·권한 값을 서버가 그대로 신뢰하면 안 됩니다.',
      'Session ID는 예측하기 어렵게 생성하고 로그인 후 교체해야 합니다.',
      '로그아웃과 만료는 서버에서 직접 Session을 무효화해야 합니다.',
      'Session이 유효하더라도 요청마다 별도의 인가 검사가 필요합니다.',
    ] },
    { type: 'explanation', variant: 'assignment', title: '과제 #3 · 다음 웹 취약점 조사', paragraphs: [
      '예시: SQL Injection을 고른다면 “검색 입력이 SQL 문자열 구조와 결합되는 경계”, “서버와 DB 중 검증 책임이 있는 위치”, “parameter binding으로 경계를 분리하는 이유”를 정리합니다.',
      '여기에서 다루지 않은 웹 취약점 하나를 골라 정상 기능, 신뢰 경계, 실패 조건, 영향, 근본 방어, 안전한 학습 환경까지 연결합니다. 공개 문서와 허가된 교육 환경만 사용합니다.',
    ] },
    { type: 'comparison', title: '과제 #3 필수 확인 항목', columns: ['필수 항목', '작성할 질문', '예시'], rows: [
      ['취약점 정의', '어떤 보안 경계가 실패하는가?', 'SQL 명령 구조와 입력 데이터 경계'],
      ['정상 흐름', '취약하지 않을 때 요청은 어떻게 처리되는가?', 'HTTP → 애플리케이션 → DB driver'],
      ['성립 조건', '공격자가 정할 수 있는 값과 필요한 권한은?', '검색 parameter·인증 여부'],
      ['영향', '어떤 데이터·행동에 영향을 줄 수 있는가?', '허용되지 않은 데이터 조회 가능성'],
      ['근본 방어', '어떤 코드·설계 변경이 원인을 제거하는가?', 'parameter binding과 최소 권한'],
      ['안전 범위', '어디에서만 확인할 것인가?', '로컬 취약 앱 또는 공식 교육 Lab'],
    ] },
  ],
})
