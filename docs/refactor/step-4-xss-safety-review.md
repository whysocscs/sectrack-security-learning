# STEP 4 XSS 안전성 검토

## 고정된 학습 흐름

모든 내부 XSS 실습은 다음 세 단계를 사용한다.

1. `UNIQUE_MARKER` 위치 확인
2. SecTrack이 만든 고정 `TRAINING_POC` 결과 표시
3. 안전한 Sink로 수정한 뒤 재시험

사용자가 스크립트나 HTML을 입력하는 실행 필드는 없다. 실습 기록 textarea의 값은 React 텍스트로만 저장·표시하며 미리보기에 전달하지 않는다.

## 컨텍스트

- HTML Body
- quoted HTML Attribute
- URL attribute와 scheme allowlist
- JavaScript 코드와 JSON 데이터 분리
- Sanitizer 정책 적용 전·후
- CSP가 실행을 막은 상태와 위험 Sink를 제거한 상태

## iframe 경계

- `sandbox=""`: script, same-origin, form, navigation 권한을 부여하지 않음
- `srcDoc`는 코드에 정의한 고정 문자열로만 생성
- srcDoc CSP: `default-src 'none'`, inline style만 허용
- 네트워크 요청, Cookie·localStorage 접근, 키 입력 수집 코드 없음
- PoC는 실행 코드가 아니라 고정 상태 문구를 렌더링함

## 실제 확인

- 컨텍스트 탭 6개 렌더링
- iframe sandbox 속성은 빈 권한 목록
- Sanitizer 전·후 설명 표시
- CSP PoC에서 실행 차단과 위험 Sink 잔존을 구분
- 페이지 오류와 console error 0
