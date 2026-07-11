# STEP 3 학습 모델

## 활동 유형

`src/courseData.js`와 `src/learningModel.js`에서 모든 학습 항목을 다음 여덟 유형으로 구분한다.

| 유형 | 화면 의미 | 완료 판단 |
|---|---|---|
| `exploration` | 직무·관심·학습 방향 탐색 | 관심 선택, 노드 탐색, 메모 |
| `lesson` | 개념 학습 | 읽음 표시와 짧은 자기 설명은 별도 기록 |
| `practice` | 결과가 명확한 연습 | 결과 확인 후 완료 |
| `investigation` | 관찰·가설·분석 | 관찰과 결론 기록 |
| `simulation` | 상태와 흐름 조작 | 예상과 실제 비교 |
| `external` | 공식 외부 플랫폼 활동 | 학습자 자기 확인이며 자동 검증으로 부르지 않음 |
| `report` | 주차 정리 또는 전문 문서 | 필수 섹션 작성 |
| `assessment` | 이해 확인 | 명시된 문항 규칙 충족 |

## 진행률

- 필수 경로와 확장 경로를 따로 계산한다.
- 기본 가중치는 lesson/exploration/external 1, practice/investigation/simulation/report/assessment 2다.
- 실습 시도는 해당 가중치의 절반, 완료는 전체를 반영한다.
- 읽음, 실습 시도, 실습 완료, 이해 확인, 주차 기록을 `calculateProgressBreakdown`에서 별도 항목으로 반환한다.
- 진행률 계산은 숙련도, 확신도, 힌트 사용 여부를 읽지 않는다.

## 개념 활동과 퀴즈

- 각 모듈에는 한 문장 자기 설명, 현재 설명 수준, 확신도, 복습 상태가 있다.
- 자기 설명은 `conceptEvidence[conceptId].selfExplanation`에 근거로 저장한다.
- 각 주차 퀴즈는 6문항이며 5문항 이상과 지정 핵심 문항 정답을 함께 요구한다.
- 문항은 `conceptIds`, `difficulty`, `remediationModuleIds`를 갖는다.
- 제출 결과는 문항별·개념별 근거로 누적하고 재시도 횟수를 보존한다.
- 퀴즈 제출은 개념 숙련도를 일괄 변경하지 않는다.

## 확인 결과

- Node 단위 테스트 29개 통과.
- Playwright에서 Week 1 자기 설명·숙련도·확신도·복습 상태를 입력하고 새로고침 후 보존을 확인했다.
- 같은 세션에서 6문항을 제출한 뒤 자기 설명 근거와 퀴즈 근거가 함께 남고, 숙련도는 사용자가 선택한 한 개념만 유지됨을 확인했다.
