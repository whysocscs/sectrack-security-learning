# STEP 1 이슈 매트릭스

| ID | 화면/모듈 | 문제 | 원인 | 사용자 영향 | 우선순위 | 수정 STEP | 검증 방법 |
|---|---|---|---|---|---|---|---|
| S1-01 | 전역 | 8~10px 텍스트가 광범위함 | px 기반 밀도 우선 CSS | 읽기·확대 사용성 저하 | P0 | 2 | viewport/150%/200% 스크린샷·axe |
| S1-02 | 전역 | local-personal 앱이 운영자 LMS처럼 보임 | 고정 사용자·피드백·검토 문구 | 제품 신뢰 저하 | P0 | 2 | UI copy 및 adapter 테스트 |
| S1-03 | 저장 | 버전·실패 복구 없는 v2 merge | storage adapter 부재 | 기존 데이터 덮어쓰기 위험 | P0 | 2 | v2 migration·corrupt JSON 테스트 |
| S1-04 | 홈/주차 | 이어서 하기가 정확한 module/tab을 열지 않음 | route에 tab/module이 없음 | 반복 탐색 필요 | P0 | 2 | deep-link E2E |
| S1-05 | 로드맵 | Week 5~16을 열 수 없음 | disabled preview button | 전체 과정 구조 확인 불가 | P1 | 2 | preview route E2E |
| S1-06 | sidebar/modal | 접기·Escape·포커스 복귀 없음 | view state와 dialog 관리 부재 | 키보드/확대 사용성 저하 | P0 | 2 | keyboard E2E·axe |
| S1-07 | quiz/mastery | 주차 점수로 모든 module 숙련도 변경 | 문항 concept 연결 없음 | 숙련 근거 왜곡 | P0 | 3 | concept result unit test |
| S1-07A | labs/mastery | 힌트 3단계 사용이 숙련도를 낮춤 | 완료 시 hintLevel로 mastery 결정 | 도움 요청을 감점으로 인식 | P0 | 3 | hint/mastery unit test |
| S1-08 | progress | 활동 유형과 무관한 단일 가중치 | generic lab 모델 | 탐색·외부 활동 진도 왜곡 | P1 | 3 | breakdown 테스트 |
| S1-09 | Week 0 지도 | semantic node kind/edge/source 없음 | tuple 기반 평면 데이터 | 직무·개념 설명 오류 | P0 | 3 | schema/data integrity 테스트 |
| S1-10 | Week 0 지도 | 모든 node에 공격·방어 카드 | unconditional renderer | 중립 개념·직무 오개념 | P0 | 3 | kind별 panel E2E |
| S1-11 | Week 0 lab | 지도에 generic hint/validation/evidence 적용 | 모든 lab 공통 shell | 탐색 활동 의미 왜곡 | P0 | 3/4 | compatibility route E2E |
| S1-12 | 커리큘럼 | 필수·확장 시간과 화면 총시간 불일치 | 수동 estimated total | 계획 시간 과소 표시 | P0 | 3 | workload data test |
| S1-13 | labs | 모든 활동에 동일한 완료 틀 | kind별 UI 계약 부족 | 관찰·연습·외부 활동 혼동 | P0 | 4 | activity type E2E |
| S1-14 | XSS labs | context coverage 부족 | body/DOM 중심 고정 사례 | 방어 적용 범위 오해 | P1 | 4 | context mode E2E |
| S1-15 | report | validator가 XSS 문자열에 고정 | common/profile 미분리 | 다른 Finding 확장 불가 | P0 | 4 | common/XSS validator test |
| S1-16 | report | CVSS/CWE/WSTG 편집 필드 미노출 | 데이터와 UI 불일치 | 근거 기록 누락 | P1 | 4 | report persistence E2E |
| S1-17 | report | 완성 예시 전체 복사 | sample clone이 값까지 복사 | 학습자 답안 대체 | P1 | 4 | template copy unit test |
| S1-17A | report export | 코드 증거의 API key가 Markdown에 남을 수 있음 | export 마스킹 범위가 HTTP 헤더·토큰 중심 | 로컬 민감정보 유출 | P0 | 4 | Markdown redaction unit test |
| S1-18 | 분석 | 임의 상수로 막힌 개념 집계 | 데모 통계 | 실제 데이터처럼 오인 | P0 | 2/4 | source scan·local event test |
| S1-19 | route | 일반 잘못된 route가 홈 fallback | parseHash default | 오류 인지 불가 | P1 | 2 | invalid route test |
| S1-20 | QA | lint가 실제 ESLint가 아님 | node syntax script | React/a11y 회귀 미검출 | P0 | 5 | ESLint `--max-warnings=0` |
| S1-21 | QA | 컴포넌트/E2E/a11y 테스트 없음 | 테스트 도구 미도입 | 핵심 흐름 검증 불가 | P0 | 5 | Vitest/Playwright/axe |
| S1-22 | 유지보수 | App/Labs/styles가 대형 단일 파일 | 기능 경계 미분리 | 변경 회귀 위험 | P1 | 5 | 기능별 파일 분리·build |
