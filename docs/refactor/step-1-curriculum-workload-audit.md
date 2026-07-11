# STEP 1 커리큘럼·시간 감사

현재 데이터에서 module `duration`과 lab `estimatedMinutes`를 자동 합산했다. 퀴즈와 주차 기록 시간은 데이터에 없으므로 아래 합계에는 포함하지 않았다. 필수/확장 표지도 아직 없어 내부/외부 실습으로만 분리했다.

| Week | module | 내부 lab | 외부 lab | 모델링 합계 | 화면 총시간 | 차이 |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 150분 | 60분 | 0분 | 210분 | 150분 | -60분 |
| 1 | 290분 | 90분 | 120분 | 500분 | 360분 | -140분 |
| 2 | 385분 | 110분 | 120분 | 615분 | 420분 | -195분 |
| 3 | 360분 | 175분 | 0분 | 535분 | 360분 | -175분 |
| 4 | 415분 | 185분 | 120분 | 720분 | 480분 | -240분 |

합계는 module 1,600분 + 내부 lab 620분 + 외부 lab 360분 = 2,580분(43시간)이다. 화면 합계는 1,770분(29시간 30분)으로 810분(13시간 30분)이 적게 표시된다. 퀴즈·주차 기록을 더하면 실제 차이는 더 커진다. STEP 3에서 각 항목에 `path: required | extension`과 시간을 부여하고 화면 총시간은 계산값에서 파생한다.

## 주차별 문제

### Week 1

- 보물찾기 선수지식에 `find`, `grep`이 있으나 핵심 module은 탐색 명령을 목록으로만 소개한다.
- 290분 module 전체 + 내부 90분 + Bandit 120분을 360분으로 표시한다.
- Bandit는 기초 완료 조건과 섞지 않고 확장 경로로 분리할 필요가 있다.

### Week 2

- 권한, stream, text processing, encoding, process, network CLI, Git, DevTools, Burp, Bandit를 한 주 필수처럼 배치한다.
- 필수는 권한·stream·핵심 text·encoding 구분·curl 기준선으로 제한한다.
- process/network/Git/Burp 심화/Bandit는 확장으로 옮긴다.

### Week 3

- HTTP·Cookie·SOP·DOM 흐름은 있으나 Percent Encoding, form encoding, multipart, JSON, MIME/Content-Type, fetch/XHR, cache/304, SSR/CSR 비교가 부족하다.
- 내부 실습 175분을 포함한 535분을 360분으로 표시한다.

### Week 4

- 개념은 여러 browser context를 언급하지만 내부 실습은 HTML body와 DOM 흐름에 집중한다.
- Attribute, URL scheme, JavaScript data 전달, Sanitizer 정책, CSP 완화와 원인 제거의 차이를 실제 활동으로 보강해야 한다.
- 내부·외부 lab을 포함한 720분을 480분으로 표시한다.
