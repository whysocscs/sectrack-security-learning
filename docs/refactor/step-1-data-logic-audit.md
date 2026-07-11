# STEP 1 데이터·로직 감사

## 저장

- 저장 키: `sectrack-orchestrator-v2`
- 스키마 버전 필드 없음
- `mergeProgress`는 알려진 중첩 객체를 보완하므로 v2 데이터 필드는 대체로 유지된다.
- 손상 JSON은 빈 상태로 fallback한 뒤 App effect가 같은 키를 덮어쓸 수 있다. 원본 복구 경로가 없다.
- module note textarea는 상태와 연결되지 않아 저장되지 않는다.
- sidebar, font, route tab, map view 상태도 저장되지 않는다.

## 다음 할 일

- `platformLogic.js:69-80`: module -> lab -> quiz -> submission 순서는 계산한다.
- `App.jsx:217`: lab 외 유형은 모두 week overview로 이동한다.
- 결과: module, quiz, record의 정확한 위치가 열리지 않는다.

## 진행률과 숙련도

- `platformLogic.js:54-67`: module 1점, lab 시도 1점/완료 2점, quiz 80% 1점, submission 1점의 암묵적 가중치다.
- exploration과 external도 일반 lab과 같은 가중치를 사용한다.
- 숙련도는 진행률과 별도 객체지만 근거 모델이 없다.
- `App.jsx:420-426`: 주차 퀴즈 점수 하나가 해당 주차 모든 module의 숙련도를 `attempted` 또는 `familiar`로 일괄 변경한다.
- 문항에 `conceptIds`, 난이도, 보충 module 정보가 없다.
- `Labs.jsx:71-83`: 실습 완료 시 힌트 3단계 사용 여부로 관련 개념을 `proficient` 또는 `familiar`로 정한다. 이미 `proficient`인 값도 `familiar`로 낮아질 수 있어 힌트가 사실상 숙련도 감점으로 작동한다.
- 힌트는 어느 개념·단계에서 막혔는지 별도 복습 근거로 저장되지 않는다.

## 지도

- built-in node 79개에 semantic `kind`와 `sourceRefs`가 없다.
- jobFamily, role, concept, technology, standard, threat, control, industry를 구분하지 않는다.
- 모든 node와 알 수 없는 custom node에 공격·방어 텍스트를 생성한다.
- 상태 `learn`은 관심, 학습 상태, 숙련 의미가 섞여 있다.
- node 선택, root mode, 확대, 확장 branch는 저장되지 않는다.

## 보고서

- `validateReport`는 공통 검사와 XSS 검사를 한 함수에 혼합한다.
- 제목에 `XSS` 문자열을 강제하고 root cause·fix도 XSS 키워드에 묶여 있다.
- 데이터에는 CWE-79, WSTG, CVSS가 있으나 편집기에서 모든 필드를 노출하지 않는다.
- 샘플 복사는 완성 답안 전체를 초안에 복사한다.
- local-personal인데 Submitted, Reviewed, 운영자 검토 문구를 사용한다.
- 민감정보 검사는 `vulnerableCode`의 API key를 탐지하지만 Markdown export는 해당 코드 블록을 마스킹하지 않는다. 현재 경고가 있어도 내보내기가 가능해 유출 위험이 있다.

## 데이터 무결성

- roadmap, weekContent, quizzes, lab 관련 concept ID의 참조를 자동 검증하는 스키마가 없다.
- `src/data.js`에는 화면에서 쓰이지 않는 가상 멤버·점수·과제 상태가 남아 있다.
- Week 0 분류는 `weekZeroData.js`와 `mindmapData.js`에 중복 정의된다.
- marketJobs 수치에는 URL, 조사일, 방법론이 없다.
