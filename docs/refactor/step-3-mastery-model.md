# STEP 3 숙련도 모델

## 분리된 상태

| 상태 | 저장 위치 | 값 |
|---|---|---|
| 완료 | `modulesRead`, `labs`, `submissions` | 미시작·진행 중·완료 |
| 개념 숙련도 | `conceptMastery`, `mindmap.conceptMastery` | 아직 모름·들어봄·설명 가능·기초 적용·재현·응용 |
| 확신도 | `confidence`, `mindmap.confidence` | 낮음·보통·높음 |
| 복습 상태 | `reviewStates`, `mindmap.reviewIntent` | 지금·나중·완료 |
| 힌트 사용 | `hintUsage` | 활동, 단계, 횟수, 최근 시각 |
| 확인 근거 | `conceptEvidence` | 자기 설명과 문항별 퀴즈 결과 |

## 변경 규칙

- 모듈 읽음은 숙련도를 바꾸지 않는다.
- 실습 완료는 숙련도를 자동으로 `mastered`로 만들지 않는다.
- 힌트 사용은 숙련도를 낮추지 않으며 복습 위치를 찾는 기록으로만 사용한다.
- 퀴즈는 관련 개념에 정답·오답 근거를 추가하지만 사용자 자기 평가를 덮어쓰지 않는다.
- 자기 설명 뒤 퀴즈를 수행해도 기존 `selfExplanation`을 보존하도록 병합한다.
- 내 진도 화면은 내부 ID 대신 과정 모듈 또는 직무 지도의 한글 제목을 조회한다.

## 기존 데이터

- 기존 `mastery`, `mindmap.statuses`, `mindmap.interests`는 삭제하지 않는다.
- 지도 JSON을 가져올 때 이전 `practice`는 `apply`, 학습 의도였던 `learn`은 숙련도 `heard`와 복습 의도 `now`로 분리해 읽는다.
- 이 변환은 지도 가져오기 경계에만 적용하며 기존 localStorage 원문은 변경하지 않는다.
