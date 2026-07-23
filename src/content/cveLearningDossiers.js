const source = (label, url) => ({ label, url })

const dossiers = Object.freeze({
  'CVE-2020-10688': {
    primer: {
      technology: 'RESTEasy',
      oneLine: 'RESTEasy는 Java 애플리케이션에서 HTTP 요청을 JAX-RS resource method로 연결하고, 반환값을 HTTP 응답으로 바꾸는 웹 프레임워크입니다.',
      whyItExists: '개발자가 socket·HTTP parsing을 직접 구현하지 않고 URL, method, header, body를 Java 객체와 method에 연결하도록 돕습니다.',
      whereItRuns: '주로 WildFly 또는 다른 Java 서버 안에서 애플리케이션의 요청 처리 계층으로 동작합니다. 브라우저 라이브러리가 아닙니다.',
      courseConnection: '오류 메시지에 요청 URI를 넣는 순간에도 RESTEasy는 “데이터를 설명하는 문자열”과 “브라우저가 HTML로 해석할 응답” 사이의 경계를 지켜야 합니다.',
      normalFlow: ['브라우저가 경로와 query를 포함한 HTTP 요청을 보냅니다.', 'RESTEasy가 URL을 resource와 method에 연결하고 요청 값을 Java 객체로 전달합니다.', 'resource가 정상 결과 또는 오류를 반환하면 response writer가 상태·header·body를 만듭니다.', '브라우저는 Content-Type과 문맥에 따라 body를 text 또는 HTML로 표시합니다.'],
      terms: [{ term: 'JAX-RS', meaning: 'Java에서 REST 형태의 HTTP resource를 선언하는 API 규격입니다.' }, { term: 'Exception Mapper', meaning: 'Java 예외를 HTTP 상태와 응답 body로 바꾸는 RESTEasy 구성요소입니다.' }, { term: 'Request URI', meaning: '클라이언트가 요청한 path와 query를 포함하는 식별 문자열이며 외부 입력일 수 있습니다.' }],
      notThis: ['Java 또는 JAX-RS 전체가 XSS에 취약하다는 뜻이 아닙니다.', '오류 응답에 URI가 있다는 사실만으로 script 실행을 확정하지 않습니다. 최종 Content-Type과 출력 문맥이 함께 필요합니다.'],
      source: source('RESTEasy · CVE-2020-10688 fix PR #2320', 'https://github.com/resteasy/Resteasy/pull/2320/files'),
    },
    lineage: {
      codeAvailability: { status: 'public', explanation: 'RESTEasy 공개 저장소의 실제 Java 수정 한 줄과 주변 함수가 공개돼 있습니다. 수업은 PR의 `NotFoundException` 응답 작성 부분만 발췌합니다.' },
      milestones: [
        { date: '수정 전', label: '요청 URI를 HTML 오류 body에 그대로 연결', summary: '외부에서 정할 수 있는 URI가 HTML 문맥의 문자열 결합에 들어가 브라우저 해석 경계가 사라졌습니다.' },
        { date: 'PR #2320', label: 'URI를 HTML escape한 뒤 응답 작성', summary: '실제 patch는 `Encode.encodeHtml(...)`을 적용한 값을 body에 넣어 URI의 문법 문자가 HTML 구조가 되지 않게 했습니다.', source: source('RESTEasy fix PR', 'https://github.com/resteasy/Resteasy/pull/2320/files') },
        { date: '배포 확인', label: '제품·배포판의 수정 릴리스 확인', summary: '애플리케이션이 직접 RESTEasy 버전을 고정하지 않을 수 있으므로 WildFly·Red Hat 배포판 advisory와 실제 package를 함께 확인해야 합니다.', source: source('Red Hat Bugzilla 1814974', 'https://bugzilla.redhat.com/show_bug.cgi?id=1814974') },
      ],
      invariant: { before: '요청자가 정한 URI는 오류 설명에 쓰이더라도 HTML 구조로 해석돼서는 안 됩니다. 수정 전에는 이 조건이 코드로 보장되지 않았습니다.', after: '오류 응답에 삽입되는 URI는 HTML body 문맥에 맞게 encode되며 정상 404 상태와 사람이 읽을 수 있는 설명은 유지됩니다.' },
      followOn: '공식 자료에서 이 수정의 bypass 또는 후속 CVE 계보는 확인되지 않았습니다. 확인되지 않은 취약점을 억지로 연결하지 않습니다.',
      operationalActions: ['영향 RESTEasy 또는 공급자 package를 수정 릴리스로 올립니다.', '정상 경로와 존재하지 않는 경로의 status·body를 함께 회귀 시험합니다.', '오류 body를 HTML로 만들 필요가 없다면 text 또는 구조화된 JSON 오류를 우선 검토합니다.'],
    },
  },
  'CVE-2022-1948': {
    primer: {
      technology: 'GitLab Project Import · Notebook rendering',
      oneLine: 'GitLab은 Git 저장소, issue, CI/CD와 여러 파일 형식의 미리보기를 한 웹 서비스에서 제공하며 project import는 다른 시스템의 데이터를 새 project로 옮기는 기능입니다.',
      whyItExists: '팀이 기존 project 기록과 저장소를 옮기고, browser에서 코드·문서·Jupyter Notebook 결과를 검토할 수 있게 합니다.',
      whereItRuns: 'GitLab server가 import archive를 풀고 project data를 저장한 뒤, 웹 UI가 지원 파일을 HTML로 rendering합니다.',
      courseConnection: '한 사용자가 가져온 Notebook output이 저장됐다가 다른 사용자의 browser에서 HTML로 보일 때 “저장 시점”과 “재출력 시점”이 분리된 stored XSS 경계가 생깁니다.',
      normalFlow: ['권한 있는 사용자가 허용된 project export를 import합니다.', 'GitLab이 archive 구조와 project data를 검증해 저장합니다.', '다른 사용자가 repository의 Notebook 파일을 엽니다.', 'renderer가 Notebook cell과 output을 안전한 HTML로 변환해 browser에 보냅니다.'],
      terms: [{ term: 'Project Import', meaning: '다른 GitLab 또는 지원 형식의 project data를 새 namespace로 가져오는 기능입니다.' }, { term: 'Jupyter Notebook', meaning: '코드 cell, 설명, 실행 output을 JSON 문서 하나에 저장하는 `.ipynb` 형식입니다.' }, { term: 'Stored XSS', meaning: '외부 값이 서버에 저장된 뒤 다른 요청·사용자의 HTML 응답에서 실행 문맥에 들어가는 XSS입니다.' }],
      notThis: ['모든 Notebook 또는 모든 GitLab import가 곧 XSS라는 뜻이 아닙니다.', '수업은 악성 archive나 실행 payload를 만들지 않고 실제 patch의 출력 처리 경계만 읽습니다.'],
      source: source('GitLab · CVE-2022-1948 fix commit', 'https://gitlab.com/gitlab-org/gitlab/-/commit/e61e9b9434e2198c4c1d5cf6b4531eb4323c3575'),
    },
    lineage: {
      codeAvailability: { status: 'public', explanation: 'GitLab 공개 commit에 실제 renderer 변경이 있습니다. 수업은 HTML 속성으로 들어가는 값에 escape를 추가한 줄만 사용합니다.' },
      milestones: [
        { date: '저장 단계', label: '가져온 Notebook output 보관', summary: '문제의 값은 import 때 바로 실행되는 것이 아니라 project artifact에 남아 이후 viewer에게 전달될 수 있습니다.' },
        { date: '표시 단계', label: 'Notebook HTML renderer에서 속성 문맥 형성', summary: '저장된 값이 HTML 속성으로 들어가며 해당 문맥의 escape가 빠진 지점이 실제 취약 경계였습니다.' },
        { date: 'e61e9b9', label: '속성 값 escape 적용', summary: '실제 patch는 출력 속성 값을 `escape(...)`한 뒤 HTML을 구성하도록 바꿨습니다.', source: source('GitLab security fix commit', 'https://gitlab.com/gitlab-org/gitlab/-/commit/e61e9b9434e2198c4c1d5cf6b4531eb4323c3575') },
      ],
      invariant: { before: '저장된 Notebook data는 신뢰된 GitLab UI 코드가 아니며 HTML 속성 문법을 바꿀 수 없어야 합니다.', after: 'renderer는 출력 위치의 HTML 속성 문맥에 맞게 값을 escape하고 정상 Notebook 내용은 계속 표시합니다.' },
      followOn: '공식 commit과 advisory에서 이 수정의 특정 bypass 계보는 확인되지 않았습니다.',
      operationalActions: ['공급자 보안 릴리스로 업그레이드합니다.', 'import 권한과 신뢰 가능한 export 출처를 최소화합니다.', '기존 imported project도 영향을 받는 renderer로 다시 열릴 수 있으므로 수정 전 저장 데이터와 표시 경로를 함께 검토합니다.'],
    },
  },
  'CVE-2020-11022': {
    primer: {
      technology: 'jQuery · htmlPrefilter',
      oneLine: 'jQuery는 DOM 탐색·이벤트·Ajax·HTML 삽입을 여러 browser에서 비슷한 방식으로 쓰게 해 주던 JavaScript library이며, `htmlPrefilter`는 HTML 문자열을 DOM parser에 넘기기 전에 정규화하던 함수입니다.',
      whyItExists: '과거 browser 차이를 줄이고 짧은 API로 화면 요소를 찾고 바꾸기 위해 널리 사용됐습니다.',
      whereItRuns: '사용자의 browser 안에서 애플리케이션 JavaScript와 함께 실행됩니다. server-side sanitizer가 아닙니다.',
      courseConnection: '애플리케이션이 “이미 안전하다”고 본 HTML 문자열도 library 전처리 과정에서 다른 구조로 바뀌면 최종 DOM 해석이 달라질 수 있습니다.',
      normalFlow: ['애플리케이션이 문자열 또는 DOM node를 jQuery API에 전달합니다.', 'jQuery가 입력 종류와 대상 문맥을 판별합니다.', 'HTML 문자열이면 필요한 전처리 뒤 browser DOM parser에 넘깁니다.', 'browser가 만들어 낸 node가 document에 삽입되고 event·script 정책이 적용됩니다.'],
      terms: [{ term: 'DOM', meaning: 'browser가 HTML 문서를 node와 속성의 객체 트리로 표현한 구조입니다.' }, { term: 'Prefilter', meaning: '본 처리 전에 입력을 정규화하거나 변환하는 단계입니다.' }, { term: 'Self-closing syntax', meaning: '`<div/>`처럼 보이는 표기입니다. HTML과 XML에서 해석 규칙이 같지 않습니다.' }],
      notThis: ['jQuery를 사용하는 모든 페이지가 자동으로 취약하다는 뜻이 아닙니다. 신뢰되지 않은 HTML이 영향 API에 도달하는 조건이 필요합니다.', '`htmlPrefilter` 수정은 애플리케이션이 임의 HTML을 안전하게 만드는 sanitizer가 아닙니다.'],
      source: source('jQuery · CVE-2020-11022 security advisory', 'https://github.com/jquery/jquery/security/advisories/GHSA-gxr4-xjj5-5px2'),
    },
    overrides: {
      affectedVersions: '공식 jQuery advisory 기준 1.2 이상 3.5.0 미만. 1.12.0·2.2.0은 workaround를 적용할 수 있는 하한이지 영향 범위의 하한이 아닙니다.',
      fixedVersions: 'jQuery 3.5.0 이상. 즉시 upgrade가 불가능한 1.12.0 이상·3.5.0 미만 환경에는 advisory의 `htmlPrefilter` identity-function workaround를 별도 검토',
    },
    lineage: {
      codeAvailability: { status: 'public', explanation: 'jQuery 공개 commit과 GHSA에 실제 `htmlPrefilter` 변경, 영향 범위, workaround가 공개돼 있습니다.' },
      milestones: [
        { date: '< 3.5.0', label: '정규식으로 self-closing tag를 여는·닫는 tag로 변환', summary: '`htmlPrefilter`가 HTML 문자열을 바꾸며 browser parser가 받는 구조가 원문과 달라질 수 있었습니다.' },
        { date: '1d61fd9', label: '`htmlPrefilter`를 입력 그대로 반환하도록 변경', summary: '실제 patch는 위험한 정규식 변환을 제거해 library가 신뢰 경계에서 새 HTML 구조를 만들지 않게 했습니다.', source: source('jQuery fix commit', 'https://github.com/jquery/jquery/commit/1d61fd9407e6fbe82fe55cb0b938307aa0791f77') },
        { date: '3.5.0', label: '수정 릴리스와 호환성 주의', summary: '기존 코드가 잘못된 self-closing HTML 변환에 의존했다면 표시가 달라질 수 있어 정상 UI 회귀 시험이 필요합니다.', source: source('jQuery 3.5.0 release post', 'https://blog.jquery.com/2020/04/10/jquery-3-5-0-released/') },
      ],
      invariant: { before: 'library 전처리는 안전하다고 전달된 문자열의 보안 의미를 더 위험한 DOM 구조로 바꾸지 않아야 합니다.', after: '`htmlPrefilter`는 입력을 그대로 돌려주며 실제 HTML 허용 여부와 sanitization 책임은 명시적인 애플리케이션 정책에 남습니다.' },
      followOn: '공식 advisory는 별도 CVE 계보보다 upgrade와 제한된 workaround를 제공합니다. workaround 하한과 영향 하한을 혼동하지 않습니다.',
      operationalActions: ['가능하면 jQuery 3.5.0 이상으로 upgrade합니다.', 'HTML을 받는 `.html()`, `$()` 같은 sink에 비신뢰 값이 도달하는지 별도로 추적합니다.', '정상 UI가 옛 self-closing 변환에 의존했는지 component 회귀 시험을 수행합니다.'],
    },
  },
  'CVE-2023-34362': {
    primer: {
      technology: 'Progress MOVEit Transfer',
      oneLine: 'MOVEit Transfer는 조직이 browser, API, SFTP 등을 통해 파일을 주고받고 사용자·폴더·감사 기록을 관리하는 상용 managed file transfer 제품입니다.',
      whyItExists: '민감 파일을 일반 메일 첨부 대신 접근 통제, 전송 정책, 감사 기록이 있는 중앙 서비스로 교환하기 위해 사용합니다.',
      whereItRuns: '조직이 운영하는 MOVEit Transfer server와 database, web interface, API 계층에서 동작합니다.',
      courseConnection: '외부 요청이 web handler를 거쳐 database query와 관리 상태에 닿는 경로를 보되, vendor가 공개하지 않은 parameter·SQL·source line을 추측하지 않는 법을 배웁니다.',
      normalFlow: ['관리자가 사용자·폴더·정책을 구성합니다.', '인증된 사용자가 web·API·SFTP로 허용된 파일 작업을 요청합니다.', 'server가 인증·인가와 metadata 처리를 수행하고 파일·database 상태를 갱신합니다.', '감사 기록과 알림이 해당 작업의 주체·대상·결과를 남깁니다.'],
      terms: [{ term: 'Managed File Transfer', meaning: '파일 전송에 인증, 권한, 암호화, 정책, 감사 기능을 결합한 제품 범주입니다.' }, { term: 'Web Handler', meaning: '특정 URL과 요청을 받아 business logic을 호출하는 server-side 진입점입니다.' }, { term: 'Vendor Remediation', meaning: '공급자가 공개한 수정 버전·설치 절차·점검 조치이며 source diff와 같은 뜻은 아닙니다.' }],
      notThis: ['공개 advisory에 없는 endpoint, parameter, SQL 문장 또는 source code를 실제 취약 코드처럼 만들지 않습니다.', '교육용 parameterized query 예제는 MOVEit 실제 patch가 아니라 방어 원리를 설명하는 별도 모델입니다.'],
      source: source('Progress · MOVEit Transfer critical vulnerability notice', 'https://community.progress.com/s/article/MOVEit-Transfer-Critical-Vulnerability-31May2023'),
    },
    lineage: {
      codeAvailability: { status: 'not-public', explanation: 'MOVEit Transfer는 상용 제품이며 CVE-2023-34362의 실제 취약 source와 line-level patch diff가 공개 공식 자료에서 확인되지 않습니다. 수업은 vendor fixed version과 대응 절차만 “실제”로 표시합니다.' },
      milestones: [
        { date: '2023-05-31', label: 'Progress 보안 공지와 즉시 완화', summary: 'Progress는 영향 제품의 HTTP/HTTPS traffic을 일시 차단하고 patch를 적용하도록 안내했습니다.', source: source('Progress security notice', 'https://community.progress.com/s/article/MOVEit-Transfer-Critical-Vulnerability-31May2023') },
        { date: '제품별 수정', label: '지원 release line별 fixed build 배포', summary: '2023.0.1, 2022.1.5, 2022.0.4 등 제품 line별 release note에서 수정 여부를 확인해야 합니다.', source: source('MOVEit Transfer 2023 fixed issues', 'https://docs.progress.com/bundle/moveit-transfer-release-notes-2023/page/Fixed-Issues-in-2023.html') },
        { date: '적용 뒤', label: '계정·파일·감사 기록 조사', summary: 'patch는 이후 요청을 막는 조치이고 이미 발생한 접근 흔적·계정·파일 상태 점검은 별도의 incident response입니다.', source: source('CISA AA23-158A', 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-158a') },
      ],
      invariant: { before: '외부 요청은 인증·인가와 query 구조 경계를 우회해 database 또는 관리 상태를 바꿀 수 없어야 하지만, 공개 자료만으로 깨진 내부 line을 특정할 수 없습니다.', after: '공급자가 수정했다고 명시한 build를 적용하고 web/API 정상 기능과 비인가 요청의 효과 없음, 감사 증거를 제품 수준에서 확인해야 합니다.' },
      followOn: '동시기 다른 MOVEit CVE가 존재하더라도 공식 자료 없이 모두 같은 patch의 bypass로 묶지 않습니다.',
      operationalActions: ['제품 line에 맞는 fixed build와 vendor 지침을 적용합니다.', '인터넷 노출, 계정, 파일 접근, 감사 로그를 incident response 범위에서 검토합니다.', '공개되지 않은 code를 꾸며내는 대신 vendor remediation과 교육용 query 모델의 라벨을 명확히 분리합니다.'],
    },
  },
  'CVE-2024-1727': {
    primer: {
      technology: 'Gradio',
      oneLine: 'Gradio는 Python 함수나 machine-learning model을 입력 form과 결과 화면이 있는 웹 앱으로 빠르게 감싸 주는 open-source framework입니다.',
      whyItExists: '연구자와 개발자가 별도의 frontend를 처음부터 만들지 않고 text, image, file 같은 입력을 받아 Python 결과를 보여 주기 위해 사용합니다.',
      whereItRuns: 'Python process가 HTTP server를 띄우고 browser가 Gradio UI에 접속합니다. 개발 중에는 흔히 localhost에서 실행하지만 설정에 따라 network에 공개될 수 있습니다.',
      courseConnection: '외부 웹 문서를 연 browser가 localhost 서비스에도 요청을 보낼 수 있다는 점 때문에 “loopback이라 안전하다”와 “origin이 신뢰된다”를 구분해야 합니다.',
      normalFlow: ['개발자가 Python 함수와 입력·출력 component를 정의합니다.', 'Gradio server가 UI, `/config`, upload/API route를 제공합니다.', '사용자가 browser에서 직접 선택한 파일이나 값을 제출합니다.', 'server가 제한된 임시 저장과 Python 함수를 거쳐 결과를 UI에 반환합니다.'],
      terms: [{ term: 'Origin', meaning: 'scheme, host, port로 구분하는 웹 문서의 출처입니다.' }, { term: 'Loopback / localhost', meaning: '현재 컴퓨터 자신을 가리키는 network 주소 범위입니다.' }, { term: 'CORS', meaning: '한 origin의 script가 다른 origin의 응답을 읽을 수 있는지 browser에 알리는 HTTP 정책입니다.' }, { term: 'Preflight', meaning: '특정 cross-origin 요청 전에 browser가 OPTIONS로 허용 여부를 묻는 절차입니다.' }],
      notThis: ['Gradio가 AI model 그 자체이거나 Jupyter Notebook과 같은 도구라는 뜻이 아닙니다.', 'CORS middleware 하나가 모든 CSRF와 상태 변경 인가를 해결한다는 뜻이 아닙니다.'],
      source: source('Gradio · Interface documentation', 'https://www.gradio.app/docs/gradio/interface'),
    },
    overrides: {
      affectedVersions: '공식 Gradio GHSA 기준 4.19.2 미만. 앱에서 과거에 적었던 4.16.0 하한은 vendor advisory와 일치하지 않아 사용하지 않습니다.',
      fixedVersions: 'Gradio 4.19.2 이상',
    },
    lineage: {
      codeAvailability: { status: 'public', explanation: 'Gradio 공개 commit에 CORS middleware 교체와 localhost·origin 조합을 확인하는 실제 tests가 있습니다.' },
      milestones: [
        { date: '< 4.19.2', label: '광범위한 CORS 허용 상태', summary: 'localhost Gradio endpoint가 외부 origin에서 시작된 browser 요청을 충분히 구분하지 못해 사용자 행동과 결합한 disk consumption 조건이 생겼습니다.' },
        { date: '84802ee', label: 'CustomCORSMiddleware로 localhost origin 분리', summary: '실제 patch는 host가 localhost 계열이고 origin이 외부이면 `Access-Control-Allow-Origin`을 주지 않도록 바꿨습니다.', source: source('Gradio fix commit', 'https://github.com/gradio-app/gradio/commit/84802ee6a4806c25287344dce581f9548a99834a') },
        { date: '4.19.2', label: '수정 release와 정상 local UI 회귀', summary: '외부 origin은 거절하면서 localhost alias 사이의 정상 UI와 config 요청은 유지해야 합니다.', source: source('Gradio 4.19.2 release', 'https://github.com/gradio-app/gradio/releases/tag/gradio%404.19.2') },
      ],
      invariant: { before: '외부 origin의 문서는 사용자의 localhost Gradio에 승인된 UI처럼 접근해 저장 상태를 만들 수 없어야 합니다.', after: 'localhost host는 localhost 계열 origin만 CORS로 허용하며 외부 origin 요청은 browser의 cross-origin 허가를 얻지 못합니다.' },
      followOn: '공식 advisory에서 이 patch의 특정 bypass 계보는 확인되지 않았습니다. file size·quota·cleanup은 별도 defense in depth입니다.',
      operationalActions: ['Gradio 4.19.2 이상으로 올립니다.', 'bind 주소, share 설정, 인증, upload 크기·총량, 임시 파일 정리 정책을 함께 점검합니다.', '외부 origin 거절과 정상 localhost UI·작은 file upload를 모두 회귀 시험합니다.'],
    },
  },
  'CVE-2021-3156': {
    primer: {
      technology: 'Sudo · sudoedit',
      oneLine: 'Sudo는 Unix 계열 시스템에서 정책이 허용한 사용자가 다른 사용자 권한으로 제한된 명령을 실행하도록 중재하는 프로그램이며, `sudoedit`는 대상 파일을 직접 root editor로 열지 않고 안전한 편집 workflow를 제공하는 mode입니다.',
      whyItExists: 'root password를 여러 사람과 공유하지 않고 누가 어떤 명령·파일을 어떤 권한으로 다룰지 정책과 로그로 통제하기 위해 사용합니다.',
      whereItRuns: '사용자 process와 운영체제 권한 경계 사이에서 set-user-ID root 프로그램으로 실행되고 policy·I/O plugin과 협력합니다.',
      courseConnection: '문자열 길이 계산, mode flag, plugin 계약 중 하나의 불일치가 높은 권한 process의 heap write로 이어지는 실제 사례입니다.',
      normalFlow: ['사용자가 `sudo` 또는 `sudoedit`에 인자와 환경을 전달합니다.', 'front-end가 mode와 command line을 parse하고 policy plugin에 질의합니다.', 'policy가 사용자·host·command·run-as 권한을 판단합니다.', '허용된 경우에만 제한된 실행 또는 임시 파일 기반 edit workflow가 진행되고 기록이 남습니다.'],
      terms: [{ term: 'setuid', meaning: '실행 파일 소유자의 유효 사용자 권한으로 process를 시작하게 하는 Unix 권한 기능입니다.' }, { term: 'Heap', meaning: '실행 중 동적으로 요청한 객체를 저장하는 memory 영역입니다.' }, { term: 'Unescape', meaning: 'escape 표기를 원래 문자로 되돌리는 문자열 처리입니다.' }, { term: 'Mode flag', meaning: '프로그램이 run, edit 등 어떤 처리 경로를 사용할지 나타내는 bit 상태입니다.' }],
      notThis: ['Sudo가 설치됐다는 사실만으로 권한 상승 성공을 확정하지 않습니다. 영향 version과 local execution 조건이 필요합니다.', '수업은 실제 argument payload, heap 조작 또는 root shell 절차를 제공하지 않습니다.'],
      source: source('Sudo project · Baron Samedit advisory', 'https://www.sudo.ws/security/advisories/unescape_overflow/'),
    },
    overrides: {
      affectedVersions: 'Sudo 공식 advisory 기준 1.7.7–1.7.10p9, 1.8.2–1.8.31p2, 1.9.0–1.9.5p1. 배포판 backport package는 공급자 advisory로 별도 확인',
      fixedVersions: 'upstream 1.8.32, 1.9.5p2 또는 각 OS 공급자의 CVE-2021-3156 backport package',
    },
    lineage: {
      codeAvailability: { status: 'public', explanation: 'Sudo 공개 저장소에 front-end unescape bounds 수정, sudoedit flag 제한, plugin mode 검사를 나눈 실제 commits가 있습니다.' },
      milestones: [
        { date: '취약 계열', label: 'mode·escape 계약과 destination capacity 불일치', summary: '`user_args` 길이 계산과 unescape loop가 특정 mode·종료 조건에서 같은 문자열 계약을 사용하지 않았습니다.' },
        { date: '1f86385', label: 'unescape loop와 매 write의 bounds 수정', summary: '실제 핵심 commit은 mode를 좁히고 NUL과 남은 buffer를 각 write 전에 확인합니다.', source: source('Sudo unescape bounds fix', 'https://github.com/sudo-project/sudo/commit/1f8638577d0c80a4ff864a2aad80a0d95488e9a8') },
        { date: 'b301b46', label: 'sudoedit 유효 flag 제한', summary: 'front-end가 edit mode에 허용할 flag 조합을 좁혀 잘못된 control-flow 상태가 plugin으로 전달되지 않게 했습니다.', source: source('Sudo mode flag fix', 'https://github.com/sudo-project/sudo/commit/b301b46b79c6e2a76d530fa36d05992e74952ee8') },
        { date: 'c4d3840', label: 'plugin mode 계약 일치', summary: 'policy plugin도 동일한 mode 조건을 확인해 한 계층만의 수정에 의존하지 않게 했습니다.', source: source('Sudo plugin mode fix', 'https://github.com/sudo-project/sudo/commit/c4d384082fdbc8406cf19e08d05db4cded920a55') },
      ],
      invariant: { before: '길이 계산, escape 해제, mode 선택, plugin 검증은 목적지에 실제로 쓸 byte 수와 허용 상태에 대해 같은 계약을 사용해야 했습니다.', after: '허용 mode에서만 unescape하고 매 write 전에 용량·종료를 확인하며 front-end와 plugin이 같은 유효 mode를 집행합니다.' },
      followOn: '공식 advisory는 front-end 또는 plugin 한쪽 patch도 알려진 exploit을 막을 수 있다고 설명하지만 complete patch 적용을 권장합니다. “한 commit만 적용하면 영구적으로 충분하다”로 바꾸어 가르치지 않습니다.',
      operationalActions: ['OS 공급자의 수정 package 또는 upstream fixed release를 적용합니다.', '`sudo -V` 문자열만 보지 말고 배포판 backport advisory와 package changelog를 확인합니다.', '정상 허용·거절 policy, sudoedit workflow, 경계 문자열의 안전한 실패를 함께 회귀 시험합니다.'],
    },
  },
  'CVE-2024-3094': {
    primer: {
      technology: 'XZ Utils · liblzma',
      oneLine: 'XZ Utils는 `.xz` 압축 파일을 만들고 푸는 명령줄 도구와 `liblzma` 압축 library를 제공하며, Linux 배포판의 package와 여러 프로그램이 이 library에 의존합니다.',
      whyItExists: '큰 파일과 software package를 효율적으로 저장·전송하고 애플리케이션이 같은 압축 형식을 읽고 쓰게 합니다.',
      whereItRuns: '`xz` command, package build pipeline, 그리고 `liblzma`를 link한 process 안에서 동작합니다. Git source와 배포용 release tarball은 서로 다른 공급망 artifact입니다.',
      courseConnection: '이 사건은 평범한 source bug가 아니라 release tarball과 build 과정에 악성 요소가 추가된 공급망 compromise입니다. 따라서 “취약 줄을 고친 patch”라는 틀만 적용하면 오히려 사실을 틀리게 설명합니다.',
      normalFlow: ['maintainer가 검토된 source와 build metadata로 release artifact를 만듭니다.', '배포판이 source tarball의 출처·signature·내용을 검증하고 package를 build합니다.', '사용자가 신뢰한 repository에서 package를 설치합니다.', '프로그램이 정해진 압축 API만 호출하고 library는 해당 기능만 수행합니다.'],
      terms: [{ term: 'Release tarball', meaning: '배포를 위해 source와 생성된 build 파일을 묶은 archive입니다. Git checkout과 내용이 완전히 같다고 자동 가정할 수 없습니다.' }, { term: 'Autotools / m4', meaning: 'Unix software의 configure·build script를 생성하는 도구와 macro 체계입니다.' }, { term: 'Supply-chain compromise', meaning: '개발·build·배포 경로의 신뢰를 악용해 소비자가 받는 artifact를 오염시키는 사건입니다.' }, { term: 'liblzma', meaning: 'XZ 형식의 압축·해제를 제공하는 library입니다.' }],
      notThis: ['5.6.0·5.6.1의 악성 release tarball 전체가 Git commit 하나로 들어왔다는 뜻이 아닙니다.', 'cleanup commit의 C 파일 삭제만으로 사건의 전체 trigger와 payload를 설명했다고 주장하지 않습니다.'],
      source: source('XZ Utils · official backdoor incident page', 'https://tukaani.org/xz-backdoor/'),
    },
    lineage: {
      codeAvailability: { status: 'partial', explanation: '공식 cleanup commit에는 의심 artifact와 저장소에 있던 관련 변경 제거가 보이지만, 실제 활성화에 필요했던 작은 trigger는 source package 생성 때 삽입돼 Git 저장소에 없었다고 프로젝트가 명시합니다.' },
      milestones: [
        { date: '5.6.0', label: '오염된 upstream release tarball 시작', summary: '악성 build 경로가 공식 release artifact에 포함됐지만 Git source와 tarball 내용이 일치하지 않았습니다.', source: source('NVD · CVE-2024-3094', 'https://nvd.nist.gov/vuln/detail/CVE-2024-3094') },
        { date: '5.6.1', label: '오염 계열이 다음 release에도 이어짐', summary: '일부 배포판의 testing·unstable 경로에 들어갔고 조사 뒤 downgrade·제거 지침이 나왔습니다.', source: source('CISA XZ alert', 'https://www.cisa.gov/news-events/alerts/2024/03/29/reported-supply-chain-compromise-affecting-xz-utils-data-compression-library-cve-2024-3094') },
        { date: 'e93e13c', label: '저장소 cleanup과 의심 artifact 제거', summary: '프로젝트는 공통 resolver macro와 의심 test files 등 관련 변경을 제거했습니다. 이것은 전형적인 취약 조건문 한 줄 patch가 아닙니다.', source: source('XZ cleanup commit', 'https://github.com/tukaani-project/xz/commit/e93e13c8b3bec925c56e0c0b675d8000a0f7f754') },
        { date: '5.6.2', label: 'clean release와 release process 복구', summary: '새 release를 적용하더라도 설치 package가 어느 source와 build pipeline에서 왔는지 확인해야 대응이 끝납니다.', source: source('XZ Utils 5.6.2 release', 'https://github.com/tukaani-project/xz/releases/tag/v5.6.2') },
      ],
      invariant: { before: '검토된 repository source와 사용자가 내려받는 release tarball·최종 package 사이의 provenance가 일치하고 검증 가능해야 했습니다.', after: '악성 계열을 제거한 clean source와 release를 사용하고, tarball 생성·signature·배포판 build·설치 artifact의 연결을 독립적으로 확인합니다.' },
      followOn: '이 사건의 “패치 이후 새 취약점”을 꾸며내지 않습니다. 핵심 후속은 5.6.2 clean release, maintainer·infrastructure 복구, artifact provenance 강화입니다.',
      operationalActions: ['5.6.0·5.6.1 package 사용 여부와 배포판 공지를 확인해 제거·교체합니다.', 'version string뿐 아니라 package origin, checksum/signature, repository channel을 기록합니다.', '이미 오염된 artifact가 실행됐을 가능성이 있으면 단순 upgrade와 별도로 incident response 범위를 결정합니다.'],
    },
  },
  'CVE-2023-48795': {
    primer: {
      technology: 'SSH transport · OpenSSH key exchange',
      oneLine: 'SSH는 신뢰하기 어려운 network 위에서 server 신원을 확인하고 암호화된 원격 shell·파일 전송을 제공하는 protocol이며, OpenSSH는 널리 쓰이는 구현입니다.',
      whyItExists: '평문 terminal protocol 대신 기밀성, 무결성, server·사용자 인증이 있는 관리 채널을 제공하기 위해 사용합니다.',
      whereItRuns: 'SSH client와 server가 TCP connection 위에서 version 교환, key exchange, 암호화 packet, user authentication, channel 순서로 상태를 전환합니다.',
      courseConnection: '암호 primitive 자체가 깨진 사례가 아니라 encrypted transport의 sequence와 key-exchange 경계를 엄격히 묶지 못한 protocol 상태 문제를 읽습니다.',
      normalFlow: ['client와 server가 protocol version과 algorithm 목록을 교환합니다.', 'key exchange로 session key와 server identity를 확인합니다.', 'NEWKEYS 뒤부터 합의한 key로 packet을 보호합니다.', 'user authentication과 channel data가 순서와 무결성 보호 아래 오갑니다.'],
      terms: [{ term: 'Key Exchange · KEX', meaning: '통신 양쪽이 session key를 합의하고 server identity를 연결하는 protocol 단계입니다.' }, { term: 'Sequence Number', meaning: 'packet 순서를 추적해 MAC 또는 cipher 상태와 연결하는 번호입니다.' }, { term: 'Extension Negotiation', meaning: '기본 protocol 뒤 양쪽이 지원 기능을 알리는 메시지 교환입니다.' }, { term: 'Strict KEX', meaning: 'key exchange 중 허용 메시지와 NEWKEYS 전후 sequence reset을 더 엄격히 적용하는 확장입니다.' }],
      notThis: ['Terrapin이 SSH private key를 복호화하거나 모든 session 내용을 임의로 읽는 취약점이라는 뜻이 아닙니다.', 'OpenSSH patch 하나를 모든 SSH 제품에 그대로 적용할 수 있다고 말하지 않습니다.'],
      source: source('OpenSSH 9.6 release notes', 'https://www.openssh.com/txt/release-9.6'),
    },
    lineage: {
      codeAvailability: { status: 'public', explanation: 'OpenSSH portable 공개 commit에 strict KEX negotiation, 허용 메시지 제한, NEWKEYS 뒤 sequence reset의 실제 protocol·C source 변경이 있습니다.' },
      milestones: [
        { date: '수정 전', label: 'KEX 전후 packet sequence 경계가 충분히 엄격하지 않음', summary: '특정 cipher·extension 조건에서 공격자가 초기 encrypted transport message의 의미를 제한적으로 바꿀 수 있는 prefix-truncation 경계가 생겼습니다.' },
        { date: '1edb00c', label: 'strict KEX extension 구현', summary: '양쪽이 확장을 지원하면 KEX 중 허용 message를 제한하고 NEWKEYS 경계에서 sequence number를 0으로 다시 시작합니다.', source: source('OpenSSH strict KEX commit', 'https://github.com/openssh/openssh-portable/commit/1edb00c58f8a6875fad6a497aa2bacf37f9e6cd5') },
        { date: 'OpenSSH 9.6', label: '수정 release 배포', summary: 'strict KEX는 연결 양쪽의 지원과 실제 negotiation을 함께 확인해야 하며 제품별 backport 여부가 다를 수 있습니다.', source: source('OpenSSH 9.6 release', 'https://www.openssh.com/txt/release-9.6') },
      ],
      invariant: { before: 'key exchange가 끝나기 전후의 message 집합과 sequence state는 공격자가 prefix를 조작해도 의미가 달라지지 않게 보호돼야 했습니다.', after: 'strict KEX가 협상되면 KEX 중 허용 message를 제한하고 NEWKEYS에서 sequence state를 초기화해 양 끝 상태를 같은 경계에 묶습니다.' },
      followOn: '공식 자료는 strict KEX와 관련 cipher 완화를 설명합니다. 이를 “SSH 암호 전체 교체” 또는 후속 CVE 해결로 확대하지 않습니다.',
      operationalActions: ['client·server 양쪽의 공급자 수정 version을 적용합니다.', '실제 negotiation에서 strict KEX 지원 여부와 호환성을 확인합니다.', '정상 인증·file transfer·automation이 유지되는지 회귀 시험하고 legacy peer 정책을 문서화합니다.'],
    },
  },
  'CVE-2023-44487': {
    primer: {
      technology: 'HTTP/2 · nghttp2',
      oneLine: 'HTTP/2는 한 TCP connection 안에서 여러 request·response stream을 frame 단위로 동시에 처리하는 protocol이고, nghttp2는 client·server가 이를 구현할 때 쓰는 open-source library와 server 도구를 제공합니다.',
      whyItExists: '여러 요청을 connection 하나에 multiplex해 지연과 connection 비용을 줄이고 header 압축·우선순위 같은 기능을 제공하기 위해 만들어졌습니다.',
      whereItRuns: 'browser·client와 web server·proxy 사이에서 binary frame과 stream state machine으로 동작합니다.',
      courseConnection: 'RST_STREAM 자체는 정상 취소 기능이지만 client가 작은 비용으로 request를 열고 즉시 취소할 때 server가 이미 한 작업이 더 크면 자원 비용 비대칭이 생깁니다.',
      normalFlow: ['client와 server가 HTTP/2 connection 설정을 교환합니다.', 'client가 새 stream ID로 HEADERS를 보내 request를 시작합니다.', 'server가 routing·header 처리·application 작업을 시작하고 response frame을 보냅니다.', '더 이상 필요 없으면 endpoint가 RST_STREAM으로 해당 stream만 취소하고 connection은 다른 stream을 계속 처리합니다.'],
      terms: [{ term: 'Frame', meaning: 'HTTP/2 connection에서 header, data, reset 등 의미를 가진 binary message 단위입니다.' }, { term: 'Stream', meaning: '한 connection 안에서 독립 request·response를 나타내는 논리적 흐름입니다.' }, { term: 'RST_STREAM', meaning: '특정 stream을 즉시 취소하는 정상 protocol frame입니다.' }, { term: 'Cost asymmetry', meaning: '한쪽이 적은 비용으로 요청했지만 상대가 훨씬 큰 parsing·allocation·application 비용을 지는 상태입니다.' }],
      notThis: ['PCAP에서 RST_STREAM 한 개를 봤다고 공격으로 판정하지 않습니다.', 'nghttp2의 숫자와 patch를 모든 HTTP/2 server의 보편 설정값으로 복사하지 않습니다.'],
      source: source('RFC 9113 · HTTP/2', 'https://www.rfc-editor.org/rfc/rfc9113'),
    },
    lineage: {
      codeAvailability: { status: 'public', explanation: 'nghttp2 공개 security advisory와 commit에 reset token budget, limit 초과 시 GOAWAY, 관련 option·tests의 실제 변경이 있습니다.' },
      milestones: [
        { date: '정상 protocol', label: 'RST_STREAM으로 개별 request 취소', summary: '취소 기능은 필요하지만 server가 이미 소비한 자원을 항상 되돌리지는 못합니다.' },
        { date: 'Rapid Reset', label: '많은 stream 생성·즉시 취소로 비용 비대칭 확대', summary: '동시 stream 수만 제한해도 매우 짧게 열린 stream이 빠르게 교체되면 누적 작업을 충분히 제한하지 못할 수 있습니다.', source: source('nghttp2 GHSA', 'https://github.com/nghttp2/nghttp2/security/advisories/GHSA-vx74-f528-fxqg') },
        { date: '72b4af6', label: 'connection별 reset budget 적용', summary: '실제 patch는 RST_STREAM마다 token을 소비하고 기준을 넘으면 GOAWAY로 connection을 종료하는 방어를 넣었습니다.', source: source('nghttp2 fix commit', 'https://github.com/nghttp2/nghttp2/commit/72b4af6143681f528f1d237b21a9a7aee1738832') },
        { date: '1.57.0', label: '수정 release와 정상 취소 회귀', summary: '정상 browser 취소·느린 client·proxy 동작을 보존하면서 비정상 reset rate를 제한해야 합니다.', source: source('nghttp2 1.57.0 release', 'https://github.com/nghttp2/nghttp2/releases/tag/v1.57.0') },
      ],
      invariant: { before: '한 connection의 정상 취소 기능이 server의 request 처리 budget을 무제한으로 새로 얻는 수단이 돼서는 안 됩니다.', after: 'reset도 유한한 connection budget을 소비하며 한도를 넘는 peer는 connection 단위로 중단됩니다.' },
      followOn: '각 공급자는 서로 다른 patch·rate limit·architecture를 사용합니다. nghttp2 구현을 다른 제품의 fixed version으로 오인하지 않습니다.',
      operationalActions: ['사용 중인 HTTP/2 구현과 공급자의 수정 release를 식별해 적용합니다.', 'edge, proxy, application 계층의 stream·request·CPU·memory limit을 함께 확인합니다.', '정상 취소 traffic과 합성된 비정상 rate fixture를 production 밖에서 회귀 시험합니다.'],
    },
  },
  'CVE-2024-47763': {
    primer: {
      technology: 'Wasmtime · WebAssembly runtime',
      oneLine: 'Wasmtime은 WebAssembly module을 native process 안에서 검증·compile·실행하는 Bytecode Alliance의 runtime이며 host application과 Wasm code 사이의 호출·memory·resource 경계를 관리합니다.',
      whyItExists: '여러 언어로 만든 code를 portable binary module로 실행하고 host가 허용한 기능만 import하도록 설계하기 위해 사용합니다.',
      whereItRuns: 'server, CLI 또는 embedded application process 안에서 Wasm engine, JIT/AOT compiler, runtime stack, host function adapter로 동작합니다.',
      courseConnection: 'fuzzer가 찾은 crash를 “바로 원격 코드 실행”으로 과장하지 않고 tail call, stack trace, empty frame range라는 실제 실패 조건과 availability 영향으로 좁혀 읽습니다.',
      normalFlow: ['host가 Wasm bytes를 검증하고 module로 compile합니다.', 'instance가 허용된 import와 resource limit으로 만들어집니다.', 'host 또는 Wasm 함수가 call frame을 만들며 실행합니다.', '오류·trap이 생기면 runtime이 frame을 걸어 stack trace를 만들고 안전하게 host로 반환합니다.'],
      terms: [{ term: 'WebAssembly · Wasm', meaning: '검증 가능한 portable binary instruction format입니다.' }, { term: 'Tail Call', meaning: '현재 함수의 frame을 재사용하거나 제거하며 다음 함수를 호출하는 최적화·proposal 기능입니다.' }, { term: 'Trampoline', meaning: 'host와 Wasm 또는 서로 다른 calling convention 사이를 연결하는 runtime stub입니다.' }, { term: 'OSS-Fuzz', meaning: 'open-source project에 지속적인 fuzzing infrastructure를 제공하는 서비스입니다.' }],
      notThis: ['Wasm sandbox 전체가 무너졌거나 기밀성·무결성 영향이 확인됐다는 뜻이 아닙니다.', '수업은 crash module이나 tail-call trigger를 실행하지 않습니다.'],
      source: source('Wasmtime · GHSA-q8hx-mm92-4wvg', 'https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-q8hx-mm92-4wvg'),
    },
    lineage: {
      codeAvailability: { status: 'public', explanation: 'Wasmtime 공개 advisory와 backport commit에 stack-walk의 empty Wasm frame 구간을 처리하는 실제 Rust source와 regression test가 있습니다.' },
      milestones: [
        { date: 'OSS-Fuzz 발견', label: 'tail call·stack trace 조합에서 process abort', summary: 'routine fuzzing이 특정 frame 경계에서 runtime의 내부 가정이 깨지는 availability 결함을 찾았습니다.', source: source('Wasmtime security advisory', 'https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-q8hx-mm92-4wvg') },
        { date: 'de3a581', label: '0-frame 구간 조기 반환', summary: '실제 patch는 stack walk loop 전에 Wasm frame range가 비었는지 확인해 잘못된 trampoline 경계 접근을 피합니다.', source: source('Wasmtime 25.0.x fix commit', 'https://github.com/bytecodealliance/wasmtime/commit/de3a5815d680f31473d8cb0eda9eb09708221480') },
        { date: 'patched lines', label: '여러 유지 release line에 backport', summary: '21.0.2, 22.0.1, 23.0.3, 24.0.1, 25.0.2처럼 사용 중인 line에 맞는 fixed version을 선택해야 합니다.', source: source('Wasmtime 25.0.2 release', 'https://github.com/bytecodealliance/wasmtime/releases/tag/v25.0.2') },
      ],
      invariant: { before: 'stack trace walker는 tail-call·trampoline 조합에서 Wasm frame이 0개인 구간도 유효한 상태로 처리해야 했습니다.', after: '빈 frame range는 loop와 index 계산 전에 안전하게 반환하고 정상 non-empty stack trace는 그대로 생성합니다.' },
      followOn: 'advisory는 야생 악용 evidence가 없음을 기록합니다. 다른 runtime crash나 Wasm CVE를 이 patch의 bypass로 연결하지 않습니다.',
      operationalActions: ['사용 release line의 fixed version으로 update합니다.', '정상 stack trace, empty frame, 인접 tail-call fixture를 회귀 시험합니다.', 'module 실행 권한, timeout, memory·fuel limit으로 availability blast radius를 추가 제한합니다.'],
    },
  },
  'CVE-2022-37968': {
    primer: {
      technology: 'Azure Arc-enabled Kubernetes · Cluster Connect',
      oneLine: 'Azure Arc-enabled Kubernetes는 Azure 밖이나 여러 cloud에 있는 Kubernetes cluster를 Azure resource로 등록해 정책·관리 기능을 연결하며, Cluster Connect는 inbound firewall port를 직접 열지 않고 Azure identity를 이용해 cluster API에 접근하게 하는 기능입니다.',
      whyItExists: '분산된 cluster를 한 control plane에서 inventory·policy·접근 관리하고 private network의 cluster에도 승인된 관리 경로를 제공하기 위해 사용합니다.',
      whereItRuns: 'Azure control plane, Arc agents, reverse proxy·relay, cluster API server, Kubernetes authorization 사이의 관리 경로에서 동작합니다.',
      courseConnection: '공급자가 고쳐야 할 managed component와 고객이 관리해야 할 identity·RBAC·upgrade 상태를 한 덩어리로 섞지 않고 공유 책임으로 분리합니다.',
      normalFlow: ['고객이 cluster를 Azure Arc resource로 등록하고 agents를 설치합니다.', '사용자가 Azure identity로 Cluster Connect endpoint 접근을 요청합니다.', 'Azure와 Arc connection 계층이 identity·resource·connection을 중재합니다.', 'cluster API server와 Kubernetes RBAC이 실제 operation 권한을 다시 판단하고 audit evidence를 남깁니다.'],
      terms: [{ term: 'Azure Arc', meaning: 'Azure 밖의 server·Kubernetes·data service를 Azure 관리 plane에 연결하는 서비스군입니다.' }, { term: 'Cluster Connect', meaning: '공개 inbound port 없이 Azure identity와 Arc 연결을 통해 Kubernetes API에 접근하는 기능입니다.' }, { term: 'RBAC', meaning: '주체가 어떤 resource에 어떤 action을 할 수 있는지 role과 binding으로 정하는 권한 모델입니다.' }, { term: 'Managed component', meaning: '공급자가 배포·수정 책임을 일부 갖는 service 또는 agent 구성요소입니다.' }],
      notThis: ['공개 MSRC 자료에 없는 내부 source line이나 patch diff를 만들어 내지 않습니다.', '고객 IAM 최소 권한이 vendor security update를 대신한다고 말하지 않습니다.'],
      source: source('Microsoft Learn · Cluster Connect', 'https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-cluster-connect'),
    },
    lineage: {
      codeAvailability: { status: 'not-public', explanation: 'Microsoft는 CVRF에서 제품·fixed build·remediation을 공개했지만 Azure Arc Cluster Connect 내부 source와 line-level diff는 공개하지 않았습니다. 수업은 실제 MSRC record와 교육용 책임 모델을 명확히 분리합니다.' },
      milestones: [
        { date: '영향 build', label: 'Cluster Connect 권한 경계 취약 상태', summary: '공식 기록은 인증되지 않은 사용자가 권한을 높일 수 있는 조건과 제품 build를 제시하지만 내부 취약 line은 공개하지 않습니다.', source: source('MSRC · CVE-2022-37968', 'https://msrc.microsoft.com/update-guide/vulnerability/CVE-2022-37968') },
        { date: '2022-10 CVRF', label: '제품별 fixed build·remediation 공개', summary: '실제 검증 대상은 CVRF의 product ID, fixed version, restart·deployment 안내이며 가상의 code diff가 아닙니다.', source: source('Microsoft CVRF · 2022-Oct', 'https://api.msrc.microsoft.com/cvrf/v3.0/cvrf/2022-Oct') },
        { date: '운영 적용', label: 'agent upgrade와 identity·RBAC 재확인', summary: '공급자 수정 적용 뒤에도 고객은 연결 기능 사용 여부, agent version, Azure role, Kubernetes RBAC, audit를 확인해야 합니다.', source: source('Azure Arc agent upgrades', 'https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/agent-upgrade') },
      ],
      invariant: { before: 'Cluster Connect의 외부 endpoint를 아는 비인증 caller가 managed connection을 통해 관리 권한을 얻어서는 안 됩니다. 공개 자료로 내부 실패 line은 확정할 수 없습니다.', after: 'Microsoft fixed build가 공급자 경계를 복원하고 고객 측 Azure identity·Kubernetes RBAC이 각 요청의 최소 권한을 계속 집행해야 합니다.' },
      followOn: 'CloudGoat이나 다른 cloud 취약점을 이 vendor patch의 exploit chain으로 연결하지 않습니다. 공개되지 않은 구현은 “미확인”으로 남깁니다.',
      operationalActions: ['MSRC CVRF의 제품·fixed build를 실제 agent 상태와 대조합니다.', 'Cluster Connect 사용 여부와 endpoint 노출·Azure role·Kubernetes RBAC을 검토합니다.', '정상 관리자 접근과 비인가 identity의 효과 없는 거절, audit event를 회귀 시험합니다.'],
    },
  },
  'CVE-2024-3098': {
    primer: {
      technology: 'LlamaIndex · PandasQueryEngine',
      oneLine: 'LlamaIndex는 LLM 애플리케이션이 문서·index·data source를 질의하도록 돕는 Python framework이고, `PandasQueryEngine`은 자연어 질문을 pandas/Python 표현식으로 바꿔 DataFrame에서 답을 계산하던 기능입니다.',
      whyItExists: '사용자가 column 이름과 pandas 문법을 몰라도 표 형태 data를 자연어로 탐색하게 하기 위해 만들어졌습니다.',
      whereItRuns: 'Python application process 안에서 DataFrame preview를 prompt에 넣고 LLM output을 parser가 받아 `safe_eval`·`safe_exec` 경계로 전달합니다.',
      courseConnection: 'Gradio처럼 “AI 화면”을 만드는 도구와 LlamaIndex처럼 data·LLM orchestration을 돕는 library는 역할이 다릅니다. 여기서는 model-generated text가 실제 interpreter authority로 바뀌는 선을 봅니다.',
      normalFlow: ['application이 허용된 DataFrame과 user query를 query engine에 전달합니다.', 'engine이 table preview와 질문으로 LLM에 pandas instruction을 요청합니다.', 'parser가 생성된 text를 AST로 읽고 허용 syntax·name을 검사합니다.', '제한된 context에서 expression을 평가해 결과와 source metadata를 반환합니다.'],
      terms: [{ term: 'DataFrame', meaning: 'pandas가 행과 열로 보관하는 in-memory table입니다.' }, { term: 'Query Engine', meaning: '질문을 data 조회·계산 단계로 바꾸고 답을 조립하는 component입니다.' }, { term: 'AST', meaning: 'source code를 Name, Call, Import 같은 syntax node tree로 표현한 구조입니다.' }, { term: 'eval / exec', meaning: '문자열 형태의 Python 표현식 또는 문장을 현재 process에서 실행하는 기능입니다.' }],
      notThis: ['`safe_eval`이라는 이름이 OS 수준 sandbox 또는 production 안전 보장을 뜻하지 않습니다.', '일반적인 prompt injection 방어만으로 취약 dependency update를 대신할 수 없습니다.'],
      source: source('LlamaIndex v0.10.24 · PandasQueryEngine source', 'https://github.com/run-llama/llama_index/blob/v0.10.24/llama-index-core/llama_index/core/query_engine/pandas/pandas_query_engine.py'),
    },
    overrides: {
      followOn: 'NVD는 CVE-2024-3098을 CVE-2023-39662의 bypass로 기록합니다. 2024-04-12 upstream은 PandasQueryEngine을 `llama-index-experimental`로 옮기고 `eval`이 arbitrary code execution을 허용할 수 있으므로 production에서 사용하지 말고 heavy sandboxing 또는 virtual machine이 필요하다고 명시했습니다. 0.10.24는 열거된 우회 경로의 수정이지 일반-purpose security sandbox의 완성이 아닙니다.',
    },
    lineage: {
      codeAvailability: { status: 'public', explanation: '두 공식 commits와 v0.10.24 tag에 실제 allowlist, AST visitor, import 차단, upstream tests가 공개돼 있습니다. 이후 experimental 이동 commit도 공개돼 잔여 설계 위험을 직접 확인할 수 있습니다.' },
      milestones: [
        { date: 'CVE-2023-39662', label: '선행 generated-code restriction 문제', summary: 'PandasQueryEngine의 code evaluation 경계에 대한 선행 수정 뒤에도 method restriction을 우회할 수 있는 경로가 남았습니다.', source: source('NVD · CVE-2024-3098', 'https://nvd.nist.gov/vuln/detail/CVE-2024-3098') },
        { date: '5fbcb5a', label: 'PR head의 builtin 제한 1차 보강', summary: '위험 builtin을 줄이고 AST 검사 범위를 넓히는 선행 commit입니다.', source: source('LlamaIndex patch commit 5fbcb5a', 'https://github.com/run-llama/llama_index/commit/5fbcb5a8b9f20f81b791c7fc8849e352613ab475') },
        { date: '2c92e88', label: 'import 차단·tests를 포함한 merged patch', summary: 'v0.10.24에 들어간 실제 merged commit은 disallowed builtin과 Import·ImportFrom을 함께 차단하고 tests를 보강했습니다.', source: source('LlamaIndex merged patch 2c92e88', 'https://github.com/run-llama/llama_index/commit/2c92e88838a5f481d50840240b1dd3180066c6f5') },
        { date: '35afb6b', label: 'PandasQueryEngine을 experimental package로 이동', summary: 'upstream은 eval 기반 기능이 arbitrary code execution을 허용할 수 있음을 문서화하고 production 비권장·강한 sandbox/VM 필요를 명시했습니다.', source: source('LlamaIndex experimental move commit', 'https://github.com/run-llama/llama_index/commit/35afb6b93476ef4f4d61a48d847cd0b191ac5cb6') },
      ],
      invariant: { before: 'model-generated Python text는 application source 또는 권한이 아니며 allowlist 밖 builtin·import·private access로 process authority를 얻어서는 안 됩니다.', after: '열거된 위험 syntax는 evaluation 전에 거절하고, eval 기반 기능 자체는 experimental·비신뢰 code로 취급해 OS process 격리와 최소 권한을 별도로 적용합니다.' },
      followOn: '0.10.24 patch 뒤 experimental 이동은 “새 CVE가 다시 뚫었다”가 아니라 제한된 AST denylist가 완전한 sandbox가 아니라는 upstream 설계 경고입니다. 이 차이를 유지합니다.',
      operationalActions: ['0.10.24 이상으로 update하되 가능하면 production에서 PandasQueryEngine 사용을 제거·대체합니다.', '기능이 꼭 필요하면 별도 sandbox/VM, network·file·credential 차단, 최소 process 권한을 적용합니다.', '정상 DataFrame query, disallowed builtin, import, output schema, side-effect 부재를 회귀 시험합니다.'],
    },
  },
})

function cloneBlock(block) {
  return typeof structuredClone === 'function' ? structuredClone(block) : JSON.parse(JSON.stringify(block))
}

function buildPrimer(moduleId, cve, dossier) {
  return {
    id: `${moduleId}-${cve.toLowerCase()}-technology-primer`,
    type: 'technology-primer',
    title: `${dossier.primer.technology}, 먼저 이것부터`,
    ...cloneBlock(dossier.primer),
  }
}

function buildLineage(moduleId, cve, dossier) {
  return {
    id: `${moduleId}-${cve.toLowerCase()}-patch-lineage`,
    type: 'patch-lineage',
    title: '발견에서 수정·운영 확인까지',
    cve,
    ...cloneBlock(dossier.lineage),
  }
}

export function enrichCveLearningDossiers(modules) {
  return modules.map((module) => {
    let blocks = [...(module.blocks || [])]
    const cveCases = blocks.filter((block) => block.type === 'cve-case' && dossiers[block.cve])
    cveCases.forEach((originalCase) => {
      const cve = originalCase.cve
      const dossier = dossiers[cve]
      const caseIndex = blocks.indexOf(originalCase)
      const enrichedCase = { ...originalCase, ...(dossier.overrides || {}) }
      blocks[caseIndex] = enrichedCase
      if (!blocks.some((block) => block.type === 'technology-primer' && block.id?.includes(cve.toLowerCase()))) {
        blocks.splice(caseIndex, 0, buildPrimer(module.id, cve, dossier))
      }

      const patchIndex = blocks.findIndex((block, index) => index > caseIndex && block.type === 'patch-analysis')
      const lineageExists = blocks.some((block) => block.type === 'patch-lineage' && block.cve === cve)
      if (!lineageExists) {
        const insertAt = patchIndex >= 0 ? patchIndex + 1 : blocks.indexOf(enrichedCase) + 1
        blocks.splice(insertAt, 0, buildLineage(module.id, cve, dossier))
      }
    })
    return { ...module, blocks }
  })
}

export function getCveDossier(cve) {
  return dossiers[cve] ? cloneBlock(dossiers[cve]) : null
}
