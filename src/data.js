export const tracks = [
  { id: 'orientation', label: 'Orientation', weeks: '0주', color: '#596572' },
  { id: 'foundation', label: 'Foundation', weeks: '1–2주', color: '#23765a' },
  { id: 'web', label: 'Web', weeks: '3–6주', color: '#2f63aa' },
  { id: 'pwn', label: 'Pwn', weeks: '7–11주', color: '#8b5a2b' },
  { id: 'explore', label: 'Explore', weeks: '12–16주', color: '#7b4fa0' },
]

export const weeks = [
  { week: 0, track: 'orientation', title: '보안 분야와 진로', subtitle: '보안 직무의 역할, 채용 공고 읽는 법, 16주 학습 지도', status: 'open', progress: 0, points: 0 },
  { week: 1, track: 'foundation', title: '보안 기초와 Linux', subtitle: '정보보안의 기본 개념, Linux 명령어, Bandit 0–10', status: 'done', progress: 100, points: 110 },
  { week: 2, track: 'foundation', title: '보안 도구 익히기', subtitle: 'Burp Suite, 개발자 도구, 요청과 응답 관찰', status: 'done', progress: 100, points: 90 },
  { week: 3, track: 'web', title: 'Web 기본 구조', subtitle: 'HTTP, 쿠키와 세션, 인증 상태 이해', status: 'done', progress: 100, points: 120 },
  { week: 4, track: 'web', title: 'XSS와 SQL Injection', subtitle: '입력값 검증 실패와 데이터베이스 쿼리 조작', status: 'current', progress: 68, points: 70 },
  { week: 5, track: 'web', title: 'CSRF와 웹 취약점 복습', subtitle: '요청 위조, SameSite 쿠키, 미완료 실습 보충', status: 'open', progress: 0, points: 0 },
  { week: 6, track: 'web', title: 'AI와 웹 문제 풀이', subtitle: 'AI를 보조 도구로 활용해 웹 문제 분석하기', status: 'locked', progress: 0, points: 0 },
  { week: 7, track: 'pwn', title: '컴퓨터 아키텍처', subtitle: '레지스터, 메모리 구조, 프로세스 이해', status: 'locked', progress: 0, points: 0 },
  { week: 8, track: 'pwn', title: 'x86 Assembly와 GDB', subtitle: '어셈블리 읽기와 동적 디버깅', status: 'locked', progress: 0, points: 0 },
  { week: 9, track: 'pwn', title: 'Pwntools와 Shellcode', subtitle: '익스플로잇 자동화와 셸코드 기초', status: 'locked', progress: 0, points: 0 },
  { week: 10, track: 'pwn', title: '호출 규약과 BOF', subtitle: '스택 프레임, 함수 호출, Buffer Overflow', status: 'locked', progress: 0, points: 0 },
  { week: 11, track: 'pwn', title: 'AI와 Pwn 문제 풀이', subtitle: '디버깅 기록을 바탕으로 취약점 분석하기', status: 'locked', progress: 0, points: 0 },
  { week: 12, track: 'explore', title: 'Crypto와 Forensics', subtitle: '암호학과 디지털 포렌식 맛보기', status: 'locked', progress: 0, points: 0 },
  { week: 13, track: 'explore', title: '네트워크 보안', subtitle: 'Wireshark, TCP, UDP, IP, CAN 분석', status: 'locked', progress: 0, points: 0 },
  { week: 14, track: 'explore', title: 'Fuzzing', subtitle: 'Fuzzing 101을 활용한 입력 기반 결함 탐색', status: 'locked', progress: 0, points: 0 },
  { week: 15, track: 'explore', title: '클라우드 보안', subtitle: '클라우드 보안 개념과 CloudGoat 실습', status: 'locked', progress: 0, points: 0 },
  { week: 16, track: 'explore', title: 'AI 보안과 최종 정리', subtitle: 'AI 보안 기초와 미완료 주차 마무리', status: 'locked', progress: 0, points: 0 },
]

export const challenges = [
  { id: 1, week: 1, track: 'foundation', title: 'Bandit 0–10 풀이 기록', difficulty: '중', points: 20, required: true, type: 'writeup', status: 'graded', description: '각 레벨에서 사용한 명령어와 해결 과정을 자신의 언어로 정리합니다.' },
  { id: 2, week: 2, track: 'foundation', title: 'Burp로 HTTP 요청 관찰하기', difficulty: '하', points: 10, required: true, type: 'report', status: 'graded', description: 'Proxy를 통해 요청을 가로채고 주요 헤더와 파라미터를 표시합니다.' },
  { id: 3, week: 3, track: 'web', title: '쿠키와 세션 흐름 설명', difficulty: '하', points: 10, required: true, type: 'writeup', status: 'graded', description: '로그인부터 세션 종료까지 브라우저와 서버가 주고받는 정보를 설명합니다.' },
  { id: 4, week: 4, track: 'web', title: 'XSS 실행 흐름 분석', difficulty: '하', points: 10, required: true, type: 'writeup', status: 'graded', description: 'Reflected XSS가 브라우저에서 실행되는 과정을 요청과 응답 기준으로 설명합니다.' },
  { id: 5, week: 4, track: 'web', title: '쿠키 탈취 실습 분석', difficulty: '중', points: 20, required: true, type: 'report', status: 'submitted', description: '실습 결과를 캡처하고 공격이 가능한 조건과 HttpOnly의 역할을 정리합니다.' },
  { id: 6, week: 4, track: 'web', title: 'SQLi 인증 우회 분석', difficulty: '중', points: 20, required: true, type: 'report', status: 'in_progress', description: '취약한 로그인 쿼리를 분석하고 Prepared Statement를 사용한 수정안을 작성합니다.' },
  { id: 7, week: 4, track: 'web', title: 'Blind SQLi 자동화', difficulty: '상', points: 40, required: false, type: 'code', status: 'open', description: 'Boolean 기반 Blind SQLi의 반복 요청 과정을 코드 또는 의사 코드로 자동화합니다.' },
  { id: 8, week: 5, track: 'web', title: 'CSRF 요청 위조 분석', difficulty: '중', points: 20, required: true, type: 'report', status: 'open', description: '공격 조건과 SameSite 쿠키 설정에 따른 차이를 비교합니다.' },
  { id: 9, week: 7, track: 'pwn', title: '프로세스 메모리 맵 읽기', difficulty: '하', points: 10, required: true, type: 'writeup', status: 'locked', description: '코드, 데이터, 힙, 스택 영역의 역할과 배치 순서를 설명합니다.' },
  { id: 10, week: 8, track: 'pwn', title: 'GDB로 함수 추적하기', difficulty: '중', points: 20, required: true, type: 'report', status: 'locked', description: '중단점과 레지스터 확인을 사용해 간단한 함수의 실행 흐름을 추적합니다.' },
  { id: 11, week: 10, track: 'pwn', title: 'Stack BOF 원인 분석', difficulty: '상', points: 40, required: true, type: 'report', status: 'locked', description: '스택 프레임 손상 과정을 설명하고 안전한 입력 처리 방법을 제시합니다.' },
  { id: 12, week: 13, track: 'explore', title: 'Wireshark 패킷 분석', difficulty: '중', points: 20, required: true, type: 'report', status: 'locked', description: '제공된 패킷에서 TCP 연결과 비정상 요청을 찾아 근거를 기록합니다.' },
]

export const members = [
  { rank: 1, name: '이보안', initials: '이', points: 412, weekPoints: 92, solved: 18, streak: 4, progress: 94, color: '#315f8b' },
  { rank: 2, name: '박해커', initials: '박', points: 385, weekPoints: 80, solved: 17, streak: 4, progress: 88, color: '#855a42' },
  { rank: 3, name: '김보안', initials: '김', points: 360, weekPoints: 70, solved: 15, streak: 3, progress: 68, color: '#23765a' },
  { rank: 4, name: '최리눅스', initials: '최', points: 310, weekPoints: 60, solved: 13, streak: 2, progress: 61, color: '#68588f' },
  { rank: 5, name: '윤패킷', initials: '윤', points: 285, weekPoints: 55, solved: 12, streak: 4, progress: 58, color: '#956f23' },
  { rank: 6, name: '정루트', initials: '정', points: 240, weekPoints: 40, solved: 10, streak: 1, progress: 42, color: '#596572' },
]
