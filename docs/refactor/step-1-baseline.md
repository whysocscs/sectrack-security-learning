# STEP 1 기준선

기준 커밋: `ec27e38`

감사 일시: 2026-07-11 (Asia/Seoul)

## 실행 환경

- 제품 형태: React 18 + Vite 8 정적 SPA
- 패키지 관리자: npm
- lockfile: `package-lock.json`
- 서버/API/인증/다중 사용자 데이터베이스: 없음
- 영속화: 브라우저 `localStorage`의 `sectrack-orchestrator-v2`
- 배포 방식: GitHub Pages, base path `/sectrack-security-learning/`

## 기준 명령 결과

| 명령 | 실제 결과 |
|---|---|
| `npm ci` | 24 packages 설치, 25 packages 감사, 취약점 0 |
| `npm run lint` | 통과. ESLint가 아니라 데이터 파일 4개의 `node --check`만 실행 |
| `npm run test` | 통과. Node test 4개, 실패 0 |
| `npm run build` | 통과. JS 455.61 kB, CSS 89.64 kB, Vite 24.05초 |
| `npm run build -- --base=/sectrack-security-learning/` | 통과. JS 455.66 kB, CSS 89.64 kB, Vite 36.06초 |
| `npm run dev -- --port 5173` | `http://localhost:5173/`에서 기동 확인 |

현재 테스트는 저장·XSS trace·보고서 마스킹·핵심 hash route 로직만 검사한다. 컴포넌트 렌더링, 접근성, 브라우저 흐름, localStorage 마이그레이션은 검사하지 않는다.

## 브라우저 기준선

- Windows Microsoft Edge headless로 현재 화면 21장을 캡처했다.
- 캡처 범위: 홈, 로드맵, Week 0~4, 마인드맵, 실습 목록, 내부·외부 실습, 보고서 목록·편집기, 리소스, 진도, 운영자, 잘못된 경로.
- viewport 표본: 390x844, 1024x768, 1280x720, 1440x900, 1920x1080.
- 저장 위치: `docs/refactor/screenshots/before/`
- 화면에는 8~10px 텍스트가 광범위하고 모바일에서도 일부 텍스트가 더 작아진다.
- 잘못된 일반 route는 오류 화면 없이 홈으로 해석된다.
- reduced-motion용 CSS는 있으나 브라우저 상호작용 회귀 테스트는 없다.
- 125%·200% 확대, 키보드 전용, 기존 localStorage 데이터 상태는 자동화되지 않아 STEP 2 이후 Playwright 인수 대상으로 등록한다.

## 주요 기준선 결론

1. 앱은 동작하는 정적 개인 학습 도구이지만 일부 문구는 다중 사용자 LMS와 운영자 검토 시스템처럼 보인다.
2. 기존 저장 데이터는 느슨한 merge로 읽지만 버전·마이그레이션·실패 복구가 없다.
3. 진행률과 숙련도 규칙이 설명 가능하게 분리되지 않았고 퀴즈 점수가 주차 모듈 전체에 일괄 적용된다.
4. Week 5~16은 disabled 상태라 예정 내용을 열어볼 수 없다.
5. Week 0 지도는 모든 노드를 같은 공격·방어 카드로 렌더링하고 generic lab 틀에도 중복 노출된다.
6. 실습은 유형이 달라도 힌트·자동 검증·증거 패널을 공통으로 강제한다.
7. 보고서 데이터에는 CVSS/CWE/WSTG 필드가 있지만 편집 UI와 검증 모델이 XSS에 고정되어 있다.
