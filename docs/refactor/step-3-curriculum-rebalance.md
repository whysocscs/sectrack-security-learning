# STEP 3 커리큘럼 재배치

## 시간 변화

기준선의 기존 활동 합계와 화면 표시 시간은 서로 달랐다. 새 시간은 모듈, 내부 활동, 외부 활동, 이해 확인, 주차 정리를 구조화한 뒤 자동 합산한 값이다.

| 주차 | 기존 활동 합계 | 기존 화면 표시 | 새 필수 | 새 확장 | 새 전체 |
|---|---:|---:|---:|---:|---:|
| Week 0 | 210분 | 150분 | 250분 | 0분 | 250분 |
| Week 1 | 500분 | 360분 | 420분 | 120분 | 540분 |
| Week 2 | 615분 | 420분 | 390분 | 265분 | 655분 |
| Week 3 | 535분 | 360분 | 650분 | 35분 | 685분 |
| Week 4 | 720분 | 480분 | 640분 | 120분 | 760분 |

## 범위 조정

- Week 1: 경로, 파일 형식, 오류, SSH를 필수로 두고 `find`·`grep`을 실습 전에 설명한다. Bandit 활동은 확장으로 구분했다.
- Week 2: 권한, 표준 스트림, 리다이렉션·파이프, 텍스트 검색, 인코딩 구분, curl·HTTP를 필수로 두었다. 프로세스, Git, Burp 심화와 추가 외부 문제는 확장이다.
- Week 3: Percent Encoding, form·multipart·JSON body, MIME·Content-Type, fetch·XHR, cache·304, SSR·CSR, 응답 원문과 DOM 차이를 보강했다.
- Week 4: HTML body, attribute, URL scheme, JavaScript 데이터 전달, DOM flow, sanitizer, CSP 범위를 `contextCoverage`로 명시했다. 실제 유형별 화면은 STEP 4에서 연결한다.

## 자동 검사

`validateLearningData`가 활동 유형, 경로, 합산 시간, 퀴즈 concept/module 참조, Week 4 context coverage 참조를 검사한다.
