---
title: WEEK02 웹 통신·상태·브라우저 보안 3시간 초안
status: review-draft
targetWeek: 2
totalMinutes: 180
contentMinutes: 170
breakMinutes: 10
---

# WEEK02 웹 통신·상태·브라우저 보안

주소창에 URL을 입력한 순간부터 브라우저가 응답을 화면으로 만드는 과정까지 따라갑니다. 그 흐름 위에서 Cookie와 Session이 로그인 상태를 유지하는 방법, XSS가 발생하는 지점, Session 자체에서 생길 수 있는 문제를 구분합니다.

이 문서는 실제 사이트 적용 전 검토용 초안입니다. 아래 구조는 현재 모듈 화면의 순서를 그대로 따릅니다.

- 모듈 헤더
- 설명
- 흐름도 또는 HTTP 메시지
- 비교
- 자주 하는 혼동
- 체크포인트
- 공식 참고자료
- 핵심 정리

제외한 영역:

- 예상 학습 시간
- 이 모듈의 질문
- 일반 사례 카드
- WORK CONTEXT
- 다음 활동
- 자기 설명 저장

## 3시간 편성

| 순서 | 모듈 | 시간 |
|---|---|---:|
| 00 | URL은 무엇을 가리키는가 | 25분 |
| 01 | 브라우저와 서버는 어떻게 통신하는가 | 35분 |
| 02 | Cookie와 Session은 상태를 어떻게 유지하는가 | 30분 |
| - | 휴식 | 10분 |
| 03 | XSS는 어디서 발생하고 Cookie·Session에 어떤 영향을 주는가 | 35분 |
| 04 | Session은 어떻게 탈취·고정·오용되는가 | 30분 |
| 05 | URL부터 로그인 상태까지 한 흐름으로 연결하기 | 15분 |
| 합계 |  | 180분 |

---

MODULE 00

# URL이란?

URL은 인터넷상에 존재하는 특정 정보 자원의 정확한 위치와 이를 식별할 수 있는 고유한 디지털 경로를 나타냅니다.

웹 브라우저가 해당 리소스에 접근할 수 있도록 통신 규약(프로토콜), 서버 위치(도메인 또는 IP), 내부 파일 경로 등의 식별 정보를 표준화된 형식으로 제공합니다.

## URL은 어떻게 생겼을까?

URL은 브라우저가 어떤 방식으로, 어느 서버의, 어떤 자원을 요청할지 표현합니다. 다음 주소를 기준으로 구조를 나누어 봅니다.

```text
https://shop.example.test:8443/products/42?view=detail&lang=ko#reviews
```
`https`는 사용할 통신 방식, `shop.example.test`는 연결할 호스트 이름, `8443`은 포트, `/products/42`는 서버에 요청할 경로입니다. `view=detail&lang=ko`는 query이고 `reviews`는 fragment입니다.

Query는 일반적으로 HTTP 요청의 경로에 포함되어 서버로 전달됩니다. Fragment는 브라우저 내부에서 문서의 위치나 클라이언트 상태를 나타내는 데 사용되며 일반적인 HTTP 요청에는 포함되지 않습니다.

## URL의 구조를 더 자세하게 알아보자

1. Scheme · `https`
2. Host · `shop.example.test`
3. Port · `8443`
4. Path · `/products/42`
5. Query · `view=detail&lang=ko`
6. Fragment · `reviews`

## URL 구성 요소 비교

| 부분 | 예시 | 답하는 질문 |
|---|---|---|
| Scheme | `https` | 어떤 방식으로 통신하는가? |
| Host | `shop.example.test` | 어느 서버에 연결하는가? |
| Port | `8443` | 서버의 어느 통신 입구를 사용하는가? |
| Path | `/products/42` | 서버의 어떤 자원을 요청하는가? |
| Query | `view=detail&lang=ko` | 요청에 어떤 추가 값을 전달하는가? |
| Fragment | `reviews` | 응답을 받은 브라우저가 문서의 어디를 가리키는가? |


## 자주 하는 혼동

- 오해: URL의 `#fragment`도 항상 서버 로그에 남는다.  
  실제: Fragment는 일반적인 HTTP 요청에 포함되지 않고 브라우저 내부에서 처리됩니다.
    그렇다면 왜 처리가 되지 않는 걸까?. (과제#1)

- 오해: Host가 같으면 무조건 같은 Origin이다.  
  실제: Origin은 scheme, host, port를 함께 비교합니다.

### CHECKPOINT 1

다음 URL에서 서버로 전달되지 않는 부분은 무엇입니까?

```text
https://example.test/search?q=security#result-3
```

- [ ] `/search`
- [ ] `q=security`
- [x] `result-3`

확인: `#result-3`은 fragment이며 일반적인 HTTP 요청에는 포함되지 않습니다.

## 공식 참고자료

- [RFC 3986 · Uniform Resource Identifier](https://www.rfc-editor.org/rfc/rfc3986)
- [MDN · What is a URL?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL)
- [MDN · Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)

## 핵심 정리

- URL은 scheme, host, port, path, query, fragment로 나누어 읽습니다.
- Query는 요청에 포함될 수 있지만 fragment는 일반적인 HTTP 요청에 포함되지 않습니다.
- 브라우저의 Origin은 scheme, host, port의 조합입니다.

---

MODULE 01

# 브라우저와 서버는 어떻게 통신하는가

주소창에 URL을 입력한 뒤 DNS, 연결, TLS, HTTP 요청·응답, 브라우저 렌더링이 어떤 순서로 이어지는지 확인합니다.

## HTTP 전에 연결할 서버를 찾아야 합니다

브라우저는 URL의 host를 보고 DNS를 통해 연결할 IP 주소를 찾습니다. 이후 서버와 전송 연결을 만들고, HTTPS라면 TLS를 통해 서버 인증서와 암호화된 통신 조건을 확인합니다. 그다음 HTTP 요청을 전송합니다.

HTTP는 요청과 응답의 의미를 정의합니다. TCP는 데이터를 순서대로 전달하는 연결을 제공하고 TLS는 그 연결 위에서 기밀성과 무결성, 서버 인증을 제공합니다. 각 계층은 역할이 다릅니다.

## 주소 입력부터 화면 표시까지

1. 브라우저가 URL을 분석합니다.
2. DNS로 host에 대응하는 IP 주소를 찾습니다.
3. 서버와 전송 연결을 만듭니다.
4. HTTPS라면 TLS 연결과 서버 인증을 수행합니다.
5. 브라우저가 HTTP Request를 보냅니다.
6. 서버가 요청을 처리하고 HTTP Response를 보냅니다.
7. 브라우저가 응답 본문을 해석해 화면을 만듭니다.
8. 추가 CSS, JavaScript, 이미지가 필요하면 새로운 요청을 보냅니다.

HTTP MESSAGE

## 예시: 상품 상세 요청

```http
GET /products/42?lang=ko HTTP/1.1
Host: shop.example.test
Accept: text/html
Accept-Language: ko-KR
Cookie: session_id=[REDACTED]

```

1. Request line에는 Method, 요청 대상, HTTP version이 있습니다.
2. Header는 Host, 원하는 응답 형식, 언어, 인증 상태 같은 부가 정보를 전달합니다.
3. 빈 줄은 Header와 Body의 경계입니다.
4. 이 GET 요청에는 Body가 없습니다.

HTTP MESSAGE

## 상품 상세 응답

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1480
Cache-Control: no-store

<!doctype html>
<html lang="ko">
  <body><h1>상품 42</h1></body>
</html>
```

1. Status line에는 HTTP version, status code, reason phrase가 있습니다.
2. Response Header는 본문의 형식과 처리 조건을 설명합니다.
3. 빈 줄 뒤의 Body가 브라우저에 전달됩니다.
4. `200 OK`는 요청 처리가 성공했다는 뜻이지 보안상 안전하다는 증명은 아닙니다.

## 요청과 응답 구조

| 구분 | Request | Response |
|---|---|---|
| 시작 줄 | Method·요청 대상·HTTP version | HTTP version·Status code |
| Header | Host·Cookie·Content-Type 등 | Content-Type·Set-Cookie·Cache-Control 등 |
| 빈 줄 | Header와 Body 경계 | Header와 Body 경계 |
| Body | 폼·JSON·파일 등의 입력 | HTML·JSON·이미지 등의 결과 |

## 주요 Method와 Status

| 항목 | 기본 의미 | 확인할 점 |
|---|---|---|
| GET | 자원 조회 | 조회가 서버 상태를 바꾸지는 않는가? |
| POST | 데이터 제출 또는 처리 요청 | Body 형식과 상태 변경 조건은 무엇인가? |
| PUT/PATCH | 자원 전체 또는 일부 변경 | 인증된 사용자가 해당 자원을 바꿀 권한이 있는가? |
| DELETE | 자원 삭제 요청 | 중요한 변경에 추가 검증이 있는가? |
| 200 | 요청 처리 성공 | 응답 데이터가 요청자에게 허용된 것인가? |
| 302 | 다른 위치로 이동 | 이동 목적지를 신뢰할 수 있는가? |
| 401 | 인증 필요 또는 실패 | 사용자 신원을 확인할 정보가 있는가? |
| 403 | 요청을 이해했지만 허용하지 않음 | 해당 사용자에게 행동 권한이 있는가? |
| 404 | 자원을 찾을 수 없음 | 경로가 틀렸는가, 노출을 줄이기 위한 응답인가? |
| 500 | 서버 처리 중 오류 | 오류 응답에 내부 정보가 노출되는가? |

## 자주 하는 혼동

- 오해: HTTPS를 쓰면 웹 취약점이 모두 사라진다.  
  실제: HTTPS는 전송 구간을 보호하지만 서버의 인가 누락, XSS, SQL Injection 같은 애플리케이션 문제를 고치지는 않습니다.

- 오해: 응답이 200이면 요청이 보안상 정상이다.  
  실제: 200은 처리 결과 상태일 뿐 인증·인가·출력 처리의 안전성을 보장하지 않습니다.

### CHECKPOINT 1

HTTP Response에서 Body의 형식을 설명하는 Header는 무엇입니까?

- [ ] Host
- [x] Content-Type
- [ ] Cookie

확인: `Content-Type`은 Body가 HTML, JSON 등 어떤 media type인지 설명합니다.

## 공식 참고자료

- [RFC 9110 · HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [MDN · Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- [MDN · HTTP messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages)

## 핵심 정리

- 브라우저는 DNS와 연결 과정을 거친 뒤 HTTP 요청을 보냅니다.
- HTTP 메시지는 시작 줄, Header, 빈 줄, 선택적 Body로 구성됩니다.
- HTTPS는 전송을 보호하지만 애플리케이션 취약점을 자동으로 제거하지 않습니다.

---

MODULE 02

# Cookie와 Session은 상태를 어떻게 유지하는가

HTTP 요청이 서로 독립적인 상황에서 Cookie와 Session이 로그인한 사용자를 어떻게 연결하는지 구분합니다.

## Cookie는 브라우저에, Session 상태는 보통 서버에 있습니다

HTTP는 기본적으로 이전 요청을 자동으로 기억하지 않습니다. 서버가 로그인한 사용자를 다음 요청에서도 알아보려면 요청들을 연결할 식별 정보가 필요합니다.

Cookie는 서버가 `Set-Cookie` 응답 Header로 브라우저에 저장을 요청할 수 있는 작은 값입니다. 브라우저는 Domain, Path, Secure, SameSite 같은 조건이 맞는 다음 요청에 Cookie를 자동으로 포함할 수 있습니다.

Session은 여러 요청에 걸쳐 유지해야 하는 서버 측 상태입니다. 서버는 로그인 사용자, 만료 시각, 권한 정보 등을 Session 저장소에 두고 임의성이 충분한 Session ID로 찾을 수 있습니다. 이 Session ID가 Cookie에 담기는 방식이 흔합니다.

## 로그인 상태가 이어지는 흐름

1. 사용자가 로그인 정보를 제출합니다.
2. 서버가 정보를 확인합니다.
3. 서버가 새로운 Session을 만들고 Session ID를 생성합니다.
4. 서버가 `Set-Cookie`로 Session ID를 브라우저에 전달합니다.
5. 브라우저가 조건이 맞는 다음 요청에 Cookie를 포함합니다.
6. 서버가 Session ID로 서버 측 Session 상태를 찾습니다.
7. 서버가 사용자와 권한을 확인한 뒤 응답합니다.

HTTP MESSAGE

## 로그인 성공 응답

```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session_id=RANDOM_SERVER_VALUE; Path=/; Secure; HttpOnly; SameSite=Lax
Cache-Control: no-store

{"login":"ok"}
```

1. 실제 Session ID는 예측하기 어려운 값이어야 합니다.
2. `Secure`는 HTTPS 요청에서만 Cookie를 보내도록 제한합니다.
3. `HttpOnly`는 JavaScript의 Cookie 읽기를 제한합니다.
4. `SameSite`는 교차 사이트 요청에서 Cookie가 전송되는 조건을 제한합니다.

HTTP MESSAGE

## 로그인 후 요청

```http
GET /account HTTP/1.1
Host: shop.example.test
Cookie: session_id=RANDOM_SERVER_VALUE
Accept: text/html

```

브라우저는 Cookie를 요청에 포함하지만, 서버는 Cookie 값만 믿고 권한을 결정하면 안 됩니다. 서버가 Session을 조회하고 현재 사용자에게 `/account`를 볼 권한이 있는지 확인해야 합니다.

## Cookie와 Session 비교

| 구분 | Cookie | Session |
|---|---|---|
| 주된 저장 위치 | 브라우저 | 서버의 메모리·캐시·데이터베이스 등 |
| 전달 방식 | 조건에 맞는 HTTP 요청에 포함 | 보통 Cookie의 Session ID로 조회 |
| 담아야 할 값 | 최소한의 식별 정보 | 사용자·만료·서버 측 상태 |
| 사용자가 바꿀 수 있는가? | 브라우저 값은 변경 가능 | 서버 상태는 클라이언트가 직접 변경할 수 없어야 함 |
| 핵심 검증 | 속성·범위·민감정보 최소화 | ID 생성·교체·만료·무효화·인가 |

## Cookie 속성의 역할

| 속성 | 제한하는 것 | 막지 못하는 것 |
|---|---|---|
| Secure | 평문 HTTP로 Cookie 전송 | XSS와 서버 측 인가 누락 |
| HttpOnly | JavaScript의 Cookie 읽기 | XSS 실행과 로그인 사용자 권한의 요청 수행 |
| SameSite | 일부 교차 사이트 요청의 Cookie 전송 | 모든 CSRF와 같은 사이트 XSS |
| Domain | Cookie를 보낼 host 범위 | 해당 범위 내부 애플리케이션의 취약점 |
| Path | Cookie를 보낼 URL path 범위 | 강한 보안 경계나 서버 측 인가 |

## 자주 하는 혼동

- 오해: Cookie와 Session은 같은 것이다.  
  실제: Cookie는 브라우저가 보관·전송하는 값이고 Session은 서버가 여러 요청을 연결하기 위해 관리하는 상태입니다.

- 오해: Cookie에 `HttpOnly`를 붙이면 XSS가 해결된다.  
  실제: Cookie 읽기 위험은 줄지만 XSS 원인과 스크립트 실행은 남아 있습니다.

### CHECKPOINT 1

일반적인 서버 측 Session 방식에서 브라우저 Cookie에 담는 값으로 가장 적절한 것은 무엇입니까?

- [ ] 사용자의 전체 개인정보
- [x] 예측하기 어려운 Session ID
- [ ] 서버 데이터베이스 비밀번호

확인: 브라우저에는 최소한의 Session 식별자를 두고 실제 상태는 서버에서 관리합니다.

## 공식 참고자료

- [RFC 6265 · HTTP State Management Mechanism](https://www.rfc-editor.org/rfc/rfc6265)
- [MDN · Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)
- [OWASP · Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## 핵심 정리

- Cookie는 브라우저가 저장하고 요청에 포함할 수 있는 값입니다.
- Session은 서버가 여러 요청에 걸쳐 유지하는 상태입니다.
- Session ID는 예측하기 어렵고 로그인 시 교체되며 만료·로그아웃 시 무효화돼야 합니다.

---

MODULE 03

# XSS란?

교차 사이트 스크립팅(XSS)은 공격자가 합법적인 웹 사이트에 코드를 첨부하여 피해자가 웹 사이트를 로드할 때 이 코드가 실행되도록 하는 익스플로잇입니다. 이 악성 코드는 여러 가지 방법으로 삽입될 수 있습니다. 가장 많이 사용되는 방법은 URL 끝에 추가하거나 사용자가 생성한 콘텐츠를 표시하는 페이지에 직접 게시하는 것입니다. 교차 사이트 스크립팅은 좀 더 기술적인 용어로는 클라이언트 측 코드 삽입 공격입니다.

## XSS는 어디서 발생하는가?

XSS는 사용자가 입력한 값이 적절한 검증이나 이스케이프 없이 웹 페이지에 출력될 때 발생합니다. 브라우저가 해당 값을 단순한 텍스트가 아니라 HTML 또는 JavaScript 코드로 해석하면 악성 스크립트가 실행될 수 있습니다.

주요 발생 지점은 다음과 같습니다.

검색창과 URL 파라미터
게시글, 댓글, 채팅 메시지
사용자 이름과 프로필
상품 후기와 문의사항
JavaScript로 동적으로 생성되는 화면
외부 API 응답이나 파일명

XSS는 발생 방식에 따라 서버 응답에 즉시 포함되는 반사형 XSS, 데이터베이스에 저장되는 ​저장형 XSS, 브라우저의 JavaScript 처리 과정에서 발생하는 DOM 기반 XSS​로 구분할 수 있습니다.

즉, XSS는 신뢰할 수 없는 데이터가 브라우저에서 실행 가능한 코드로 처리되는 모든 지점에서 발생할 수 있습니다.

## XSS 유형의 차이

| 유형 | 외부 값이 오는 곳 | 브라우저까지 오는 경로 |
|---|---|---|
| Reflected XSS | 현재 요청의 Query·Body 등 | 서버 응답에 바로 반사됨 |
| Stored XSS | 게시글·프로필처럼 저장된 값 | 저장 후 다른 응답에서 다시 출력됨 |
| DOM-based XSS | URL·브라우저 메시지·저장소 등 | 클라이언트 JavaScript가 DOM Sink로 전달함 |

(과제#2) : 각각의 XSS에 대해서 구체적으로 어떻게 발생하고, 어떻게 생기는지 CVE를 찾고 PoC 찾아보기

## 자주 하는 혼동

- 오해: XSS는 Cookie가 있을 때만 발생한다.  
  실제: Cookie가 없어도 외부 값이 브라우저에서 코드로 해석되면 XSS가 발생할 수 있습니다.

- 오해: Session을 서버에 저장하면 XSS가 사라진다.  
  실제: Session 저장 위치와 브라우저의 출력 처리 취약점은 서로 다른 문제입니다.

### CHECKPOINT 1

`HttpOnly`가 설정된 Session Cookie를 사용하는 페이지에서 XSS가 발견됐습니다. 가장 정확한 판단은 무엇입니까?

- [ ] Cookie를 읽지 못하므로 XSS가 완전히 해결됐다.
- [x] Cookie 직접 읽기는 제한되지만 XSS 원인과 로그인 사용자 권한의 동작 가능성은 남아 있다.
- [ ] Session을 사용하므로 브라우저에서 스크립트가 실행되지 않는다.

확인: `HttpOnly`는 Cookie 읽기를 제한하는 속성이지 XSS 수정책이 아닙니다.

## 공식 참고자료

- [OWASP · Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN · Cross-site scripting](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS)
- [MDN · Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)

## 핵심 정리

- XSS의 원인은 Cookie가 아니라 외부 값이 코드로 해석되는 Source-to-Sink 흐름입니다.
- Session과 HttpOnly는 XSS 실행 자체를 막지 않습니다.
- 일반 텍스트 기능은 안전한 Sink를 사용하고, 필요한 Context에 맞게 출력 처리해야 합니다.

---

MODULE 04

# Cookie와 Session에서는 어떤 취약점이 발생하는가

Cookie와 Session은 로그인 상태를 유지하는 데 사용됩니다. 하지만 Cookie 값을 그대로 신뢰하거나 Session의 생성·교체·만료를 잘못 관리하면 공격자가 다른 사용자의 권한을 사용할 수 있습니다.

## 왜 Cookie와 Session을 함께 사용할까?

Cookie는 브라우저에 값을 저장하고 요청에 포함하는 **전달 수단**입니다.

Session은 로그인 사용자와 권한 등의 정보를 관리하는 **서버 측 상태**입니다.

일반적인 서버 측 Session 방식에서는 Cookie에 실제 사용자 정보를 넣지 않고, Session을 찾기 위한 식별자만 저장합니다.

```text
브라우저
Cookie: session_id=RANDOM_VALUE
              │
              ▼
서버 Session 저장소
RANDOM_VALUE → 사용자 1001, 권한 user, 만료 시각
```

Cookie는 사용자가 확인하거나 변경할 수 있습니다. 따라서 다음과 같은 Cookie 값을 서버가 그대로 믿으면 안 됩니다.

```http
Cookie: user_id=1001; role=admin
```

공격자가 `role=user`를 `role=admin`으로 변경할 수 있기 때문입니다.

서버 측 Session을 사용하면 브라우저에는 의미 없는 Session ID만 두고 실제 사용자와 권한은 서버가 관리할 수 있습니다.

## Cookie만 사용하면 안 될까?

Cookie만으로 로그인 상태를 관리하는 것도 가능합니다. 다만 Cookie에 저장한 데이터가 변조되지 않도록 서명이나 암호학적 검증이 필요합니다.

서버 측 Session은 다음 작업을 관리하기 쉽다는 장점이 있습니다.

* 로그아웃 시 즉시 무효화
* 비밀번호 변경 시 기존 로그인 종료
* 권한 변경 내용 즉시 반영
* Session 만료 시간 관리
* 브라우저에 저장하는 개인정보 최소화

즉, Cookie와 Session 중 하나만 선택하는 것이 아닙니다. 일반적인 구조에서는 **Cookie가 Session ID를 전달하고 Session이 로그인 상태를 관리합니다.**

---

## Cookie에서 발생하는 주요 문제

### 1. Cookie 값 변조

Cookie는 클라이언트가 보내는 입력입니다.

```http
Cookie: price=1000; discount=90; role=admin
```

서버가 가격, 할인율, 사용자 권한을 Cookie 값만 보고 결정하면 공격자가 값을 조작할 수 있습니다.

중요한 정보는 데이터베이스나 서버 Session을 기준으로 다시 확인해야 합니다.

### 2. 안전하지 않은 Cookie 속성

Session Cookie에는 일반적으로 다음 속성을 적용합니다.

```http
Set-Cookie: session_id=RANDOM_VALUE; Path=/; Secure; HttpOnly; SameSite=Lax
```

| 속성         | 역할                          |
| ---------- | --------------------------- |
| `Secure`   | HTTPS 요청에서만 Cookie 전송       |
| `HttpOnly` | JavaScript의 Cookie 읽기 제한    |
| `SameSite` | 일부 교차 사이트 요청에서 Cookie 전송 제한 |
| `Domain`   | Cookie가 전송되는 host 범위        |
| `Path`     | Cookie가 전송되는 URL 경로         |

`Domain`을 지나치게 넓게 설정하면 보안 수준이 낮은 다른 하위 도메인이 Session Cookie에 영향을 줄 수 있습니다.

Session Cookie를 특정 host에만 사용한다면 `Domain`을 생략하는 것이 안전합니다.

### 3. CSRF

브라우저는 조건이 맞으면 Cookie를 요청에 자동으로 포함합니다.

사용자가 로그인한 상태에서 공격자 사이트가 다음 요청을 발생시키면 Session Cookie가 함께 전송될 수 있습니다.

```http
POST /account/change-email HTTP/1.1
Host: shop.example.test
Cookie: session_id=VICTIM_SESSION

email=attacker@example.test
```

서버가 사용자의 의도를 추가로 확인하지 않으면 이메일 변경과 같은 작업이 실행될 수 있습니다. 이것이 CSRF입니다.

주요 방어 방법은 다음과 같습니다.

* CSRF Token 검증
* `SameSite` 설정
* `Origin` Header 검증
* 상태 변경 요청에 GET 사용 금지
* 중요한 작업에서 비밀번호 재확인

---

## Session에서 발생하는 주요 문제

### 1. Session ID 추측

Session ID가 순차적이거나 규칙적이면 공격자가 다른 사용자의 값을 추측할 수 있습니다.

```text
session_id=10001
session_id=10002
session_id=10003
```

Session ID는 암호학적으로 안전한 난수 생성기를 이용해 예측하기 어렵게 만들어야 합니다.

### 2. Session Hijacking

Session Hijacking은 공격자가 다른 사용자의 유효한 Session ID를 획득해 사용하는 공격입니다.

```http
Cookie: session_id=STOLEN_SESSION
```

서버는 Session ID를 인증된 사용자의 증명처럼 사용하므로 공격자는 비밀번호 없이 피해자처럼 요청할 수 있습니다.

Session ID는 다음 경로로 노출될 수 있습니다.

* 암호화되지 않은 HTTP 통신
* URL에 포함된 Session ID
* 서버 로그나 브라우저 방문 기록
* 공유 컴퓨터에 남은 Cookie
* 잘못 공개된 로그와 백업

Session ID를 URL에 포함하지 않고 HTTPS와 `Secure` Cookie를 사용해야 합니다.

### 3. Session Fixation

Session Fixation은 공격자가 알고 있는 Session ID를 피해자가 로그인한 뒤에도 그대로 사용하게 만드는 공격입니다.

```text
1. 공격자가 Session ID A를 준비합니다.
2. 피해자가 Session ID A를 사용합니다.
3. 피해자가 로그인합니다.
4. 서버가 ID A를 그대로 유지합니다.
5. 공격자가 ID A로 피해자 계정에 접근합니다.
```

로그인 성공 후에는 새로운 Session ID를 발급하고 이전 ID를 폐기해야 합니다.

```http
Set-Cookie: session_id=NEW_RANDOM_VALUE; Secure; HttpOnly; SameSite=Lax
```

Session ID는 로그인뿐 아니라 다음 상황에서도 교체하거나 무효화해야 합니다.

* 일반 사용자에서 관리자로 권한 상승
* 비밀번호 변경
* 계정 복구
* 중요한 보안 설정 변경

### 4. 불완전한 만료와 로그아웃

브라우저 Cookie만 삭제하고 서버 Session을 남겨 두면 이전 Session ID를 다시 사용할 수 있습니다.

```text
브라우저 Cookie 삭제
        ≠
서버 Session 무효화
```

로그아웃할 때는 다음 두 작업이 모두 필요합니다.

1. 브라우저의 Session Cookie를 삭제합니다.
2. 서버의 Session을 삭제하거나 무효화합니다.

Session 만료도 브라우저 Cookie 시간에만 의존하면 안 됩니다. 서버가 직접 다음 시간을 검사해야 합니다.

| 종류               | 의미                |
| ---------------- | ----------------- |
| Idle Timeout     | 일정 시간 요청이 없으면 종료  |
| Absolute Timeout | 로그인 후 최대 유지 시간 제한 |

### 5. Session과 인가를 혼동

Session이 유효하다는 것은 사용자가 로그인했다는 뜻입니다. 모든 자원에 접근할 수 있다는 의미는 아닙니다.

```http
GET /users/2002/orders HTTP/1.1
Cookie: session_id=USER_1001_SESSION
```

서버는 두 가지를 모두 확인해야 합니다.

```text
인증: Session이 유효한가?
인가: 사용자 1001이 사용자 2002의 주문을 볼 권한이 있는가?
```

Session 확인 후에도 각 요청에 대한 권한 검사가 필요합니다.

---

## 취약점 비교

| 문제                 | 원인                 | 주요 방어                |
| ------------------ | ------------------ | -------------------- |
| Cookie 변조          | 클라이언트 값을 그대로 신뢰    | 서버 데이터로 재검증          |
| CSRF               | 브라우저의 자동 Cookie 전송 | CSRF Token, SameSite |
| Session Hijacking  | 유효한 Session ID 탈취  | HTTPS, Secure, 짧은 만료 |
| Session Fixation   | 로그인 후 기존 ID 유지     | 로그인 시 Session ID 교체  |
| Session Prediction | 규칙적인 Session ID    | 안전한 난수 생성            |
| 불완전한 로그아웃          | 서버 Session 유지      | 서버 Session 무효화       |
| 인가 누락              | 로그인 여부만 확인         | 요청별 권한 검사            |

## 자주 하는 혼동

* 오해: Cookie와 Session 중 하나만 사용한다.
  실제: Cookie가 Session ID를 전달하고 Session이 서버 상태를 관리하는 방식이 일반적입니다.

* 오해: `HttpOnly`를 설정하면 모든 Cookie 공격이 해결된다.
  실제: JavaScript의 Cookie 읽기만 제한하며 CSRF와 Session Fixation은 별도로 방어해야 합니다.

* 오해: HTTPS를 사용하면 Session 공격이 모두 해결된다.
  실제: HTTPS는 전송을 보호하지만 Session ID 생성·교체·만료 문제는 해결하지 않습니다.

* 오해: 로그아웃할 때 Cookie만 삭제하면 된다.
  실제: 서버 Session도 함께 무효화해야 합니다.

### CHECKPOINT 1

공격자가 알고 있는 Session ID를 피해자가 로그인한 뒤에도 서버가 유지했습니다. 이 공격은 무엇입니까?

* [ ] Session Timeout
* [x] Session Fixation
* [ ] CSRF

확인: 로그인 전과 로그인 후에 같은 Session ID를 유지하면 Session Fixation이 발생할 수 있습니다.

### CHECKPOINT 2

로그아웃할 때 필요한 서버 측 처리는 무엇입니까?

* [ ] Cookie 이름 변경
* [x] 기존 Session 무효화
* [ ] 응답 상태를 200으로 변경

확인: 브라우저 Cookie만 삭제하면 기존 Session ID가 서버에서 계속 유효할 수 있습니다.

## 공식 참고자료

* [OWASP · Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
* [OWASP · CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
* [MDN · Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)

## 핵심 정리

* Cookie는 브라우저가 값을 저장하고 전송하는 수단입니다.
* Session은 서버가 로그인 상태를 관리하는 방식입니다.
* Cookie의 사용자·권한 값을 서버가 그대로 신뢰하면 안 됩니다.
* Session ID는 예측하기 어렵게 생성하고 로그인 후 교체해야 합니다.
* 로그아웃과 만료는 서버에서 직접 Session을 무효화해야 합니다.
* Session이 유효하더라도 요청마다 별도의 인가 검사가 필요합니다.

(과제#3) 이것말고 어떤 웹 취약점이 있는지 확인하여 조사하기. 