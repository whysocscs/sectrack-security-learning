# STEP 4 Finding 스키마

## 구조

`src/reportSchema.js`가 공통 필드와 프로필을 소유한다.

- `commonFindingFields`: 식별자, 상태, 심각도, 대상, 입력, 전제, 재현, 자료, 관찰·기대, 영향, 원인, 수정, 재시험, 참고 자료, CVSS, CWE, 표준 매핑
- `xssFindingFields`: 유형, Source, Transform, Sink, Context, 실행 위치, 보조 통제
- `findingStatuses`: 초안, 작성 완료, 재시험 필요, 수정 확인, 부분 수정, 보관
- `findingProfiles`: XSS, SQLi, Binary, Forensics, Cloud

XSS 프로필은 공통 검사와 전용 검사를 모두 구현했다. SQLi·Binary·Forensics·Cloud는 스키마 식별자와 공통 필드 저장 경계만 제공하며 `implemented: false`다. 이 프로필을 선택하면 “전용 검사 준비 중”으로 표시하고 작성 완료로 바꿀 수 없다.

## 편집기

편집기에 다음 필드를 노출했다.

- CVSS Version: 3.1 또는 4.0
- CVSS Vector
- CVSS Score: 자동 계산하지 않는 0.0~10.0 입력
- CWE
- WSTG 또는 OWASP Mapping
- XSS 실행 위치
- CSP·Cookie 등 보조 통제와 한계

local-personal 상태만 제공하며 Submitted·Reviewed 서버 흐름을 사용하지 않는다. 읽기 전용 완성 예시의 과거 `reviewed` 값만 호환 표시한다.

## 샘플 복사

완성 예시를 복사하면 profile, CWE, WSTG 같은 구조·분류만 유지한다. 제목, 자산, Endpoint, Source·Sink, 재현, 요청·응답, PoC, 관찰, 영향, 원인, 수정 코드, 재시험, CVSS Vector·Score는 빈 값으로 만든다.
