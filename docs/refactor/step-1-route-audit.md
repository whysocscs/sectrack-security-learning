# STEP 1 Route 감사

## 현재 route 동작

| 화면 | route | 기준선 결과 |
|---|---|---|
| 홈 | `#/` | 열림 |
| 16주 로드맵 | `#/learn` | 열림 |
| Week 0~4 | `#/learn/week/{0..4}` | overview로 열림. 탭과 module은 URL에 없음 |
| Week 5~16 | 로드맵 항목 | disabled라 상세 내용을 열 수 없음 |
| 마인드맵 | `#/mindmap` | 열림 |
| 실습 목록 | `#/labs` | 열림 |
| 대표 내부 실습 | `#/labs/w1-treasure` | 열림 |
| 공식 외부 실습 | `#/labs/w4-official-xss` | 열림 |
| Week 0 지도 호환 route | `#/labs/w0-map` | generic lab header·힌트·검증·증거 틀 안에 지도 표시 |
| 보고서 목록 | `#/reports` | 열림 |
| 새 보고서 | `#/reports/new` | XSS 초안 편집기로 열림 |
| 리소스 | `#/resources` | 열림 |
| 내 진도 | `#/progress` | 열림. 개념 내부 ID가 표시될 수 있음 |
| 운영자 | `#/admin` | 열림. local-personal 의미와 불일치 |
| 없는 주차 | `#/learn/week/99` | 제한된 Not Found 표시 |
| 없는 실습 | `#/labs/not-found` | Lab 컴포넌트의 Not Found 표시 |
| 없는 보고서 ID | `#/reports/not-found` | 새 빈 초안처럼 열려 잘못된 ID를 구분하지 못함 |
| 일반 잘못된 route | `#/not-a-real-route` | 홈으로 조용히 fallback |

## 이어서 하기 기준선

`getNextTask`는 module, lab, quiz, submission 유형을 계산하지만 홈의 열기 동작은 lab만 실습 route로 보내고 나머지는 주차 overview로 보낸다. module ID, quiz tab, record tab으로 직접 이동하지 않는다.

## 접근성·반응형 기준선

- 모바일 drawer는 배경 클릭 닫기를 지원하지만 Escape, 포커스 트랩, 닫은 뒤 트리거로 포커스 복귀가 없다.
- 데스크톱 sidebar는 접을 수 없다.
- modal은 배경 클릭 닫기가 있으나 Escape와 포커스 관리가 없다.
- 탭은 button 모음이며 `role=tablist`, `aria-selected`, 연결 panel 정보가 없다.
- 390px 화면에서 주요 콘텐츠는 한 열로 보이나 mindmap과 진행 표는 760px 최소 폭으로 국소 스크롤된다.
- 8~10px 본문과 제어 텍스트가 많아 확대에 의존하게 된다.

## STEP 2 route 계약

- `#/learn/week/:week/:tab`
- `#/learn/week/:week/concepts/:moduleId`
- 기존 `#/learn/week/:week`는 overview 호환
- 기존 `#/admin`은 개인 분석 화면 호환
- `#/labs/w0-map`은 generic lab을 거치지 않고 `#/mindmap`과 같은 탐색 workspace
- 잘못된 week, tab, module, lab, report ID는 명확한 Not Found
