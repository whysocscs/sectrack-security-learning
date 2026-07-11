# SecTrack

한국어 정보보안 학습 오케스트레이션 플랫폼입니다. 현재 상세 구현 범위는 사전 오리엔테이션인 Week 0부터 XSS와 취약점 보고서를 다루는 Week 4까지입니다. Week 5~16은 로드맵 미리보기로 노출됩니다.

## 실행

```bash
npm install
npm run dev
```

기본 개발 주소는 `http://localhost:5173/`입니다.

## 검사

```bash
npm run lint
npm run test
npm run build
```

`npm run check`로 세 검사를 순서대로 실행할 수 있습니다.

## 공개 배포

`main` 브랜치가 GitHub에 푸시되면 `.github/workflows/pages.yml`이 잠긴 의존성 설치, 소스 검사, 테스트와 프로덕션 빌드를 통과한 결과만 GitHub Pages에 배포합니다.

AI 브라우저가 SPA 화면을 실행하지 못하는 경우를 위해 `public/llms.txt`와 `public/sectrack-context.md`에 공개 범위와 안전 경계를 정적 텍스트로 제공합니다.

## 데이터 저장

MVP의 학습 진도, 마인드맵 상태, 실습 증거와 보고서 초안은 브라우저 `localStorage`의 `sectrack-orchestrator-v2` 키에 저장됩니다. 서버 계정이나 외부 API 키는 사용하지 않습니다.

## 실습 안전 경계

- 내장 실습은 브라우저 안의 정적 교육 데이터만 사용합니다.
- XSS 미리보기는 `sandbox` iframe과 고정된 무해한 실행 표시를 사용합니다.
- 임의 외부 호스트 입력, 자동 스캔, 쿠키 전송, 키 입력 수집 기능은 없습니다.
- 외부 실습은 OverTheWire, PortSwigger 등 제공 기관이 명시한 대상과 계정 범위에서만 진행합니다.
- 원본 학생 보고서 PDF는 작성자 메타데이터와 과거 실습 URL 때문에 공개 저장소와 배포 결과에서 제외합니다.
- CSP와 `no-referrer` 정책을 적용하고 외부 폰트·분석 스크립트를 사용하지 않습니다.

## 주요 파일

- `src/courseData.js`: Week 0~4 커리큘럼과 Week 5~16 로드맵
- `src/mindmapData.js`: 보안 마인드맵 노드와 직무·산업 연결
- `src/reportData.js`: Finding 스키마, 학생 보고서 6개 교육 사례
- `src/platformLogic.js`: 진도 병합, 보고서 검사, 마스킹, Route 파싱
- `src/components/Labs.jsx`: 로컬 실습과 단계형 힌트
- `src/components/Reports.jsx`: 보고서 목록·편집기·미리보기
- `public/reference/`: 업로드된 마인드맵 이미지와 XSS PDF

별도 환경 변수는 없습니다.
