# STEP 2 전역 UX

## 구현 내용

- 전역 글자 크기: 보통 100%, 크게 112.5%, 더 크게 125%, 최대 150%
- 적용 방식: `html`의 `--app-font-scale`과 전체 `rem` 글자 체계. `transform: scale()` 미사용
- 기존 7~10px 글자 선언을 최소 12~13px 상당의 rem으로 교체
- desktop sidebar: expanded/compact 전환, icon accessible name과 tooltip, 상태 저장
- mobile drawer: 화면 밖 focus 제거, 열 때 내부 focus, Escape/배경 클릭 닫기, Tab 순환, trigger focus 복귀
- 상단 설정: 글자 크기, 로컬 표시 이름, 전체 데이터 export/import
- 고정 사용자 `김보안`, 가짜 알림, 운영자 피드백, 고정 Week 04, 임의 분석 상수 제거
- `운영자`를 `내 학습 분석`으로 변경하고 `#/admin`은 호환 route로 유지
- 홈의 `다음 할 일`을 module/lab/quiz/record의 정확한 route와 실제 활동 시간으로 연결
- 주차 tab과 module을 hash route에 포함
- concept module note 자동 저장
- Week 5~16 preview를 열 수 있게 변경
- 일반 주차 화면의 `증거 제출`을 `주차 학습 정리`로 변경
- 없는 일반 route와 잘못된 week/module/report에 명시적인 Not Found 제공

## route 계약

- `#/learn/week/:week/overview`
- `#/learn/week/:week/concepts/:moduleId`
- `#/learn/week/:week/labs`
- `#/learn/week/:week/quiz`
- `#/learn/week/:week/record`
- 기존 `#/learn/week/:week`는 overview로 호환
- 기존 `#/labs/w0-map`은 `#/mindmap` workspace로 호환
- 기존 `#/admin`은 `#/insights` 의미로 호환

## 브라우저 검증

Playwright Chromium에서 홈, Week 1 module deep-link, Week 5 preview, report editor, Not Found를 390x844, 1024x768, 1280x720, 1440x900, 1920x1080으로 열었다.

- 25개 viewport/route 조합: document 가로 overflow 0
- uncaught page error/console error: 0
- 150% 설정 후 root font-size: 24px
- module note 저장 후 reload: 동일 문자열 복원
- drawer open focus: sidebar 내부
- Escape 후 `aria-expanded=false`, menu trigger focus 복귀
- compact sidebar reload 후 `.sidebar-compact` 유지
- 640x450 + app 150% + CSS zoom 200% reflow proxy에서 report editor document overflow 0
- Chromium CDP page scale 2.0 + app 150%에서 홈, Week 1 concept, report editor의 visual viewport scale 2와 document overflow 0 확인

실제 브라우저 chrome의 200% 확대는 Playwright가 직접 제어하지 못하므로 최종 단계에서 Edge 수동 확인과 512px CSS viewport 대체 검사를 함께 기록한다. 이 proxy를 실제 browser zoom 결과라고 부르지 않는다.

## 스크린샷

- `docs/refactor/screenshots/after-step-2/home-final-390x844.png`
- `docs/refactor/screenshots/after-step-2/home-1440x900.png`
- `docs/refactor/screenshots/after-step-2/week1-1440x900.png`
- `docs/refactor/screenshots/after-step-2/week5-preview-1440x900.png`
- `docs/refactor/screenshots/after-step-2/report-new-390x844.png`
- `docs/refactor/screenshots/after-step-2/not-found-1440x900.png`
