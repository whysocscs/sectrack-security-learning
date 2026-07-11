export const codeCureLab = Object.freeze({
  id: 'codecurelab',
  name: 'CodeCureLAB',
  description: '학생과 교직원이 공지, 과제, 프로필을 사용하는 가상 캠퍼스 서비스입니다. Week 0~3의 안전한 고정 사례로만 사용합니다.',
  boundary: '제공된 화면과 고정 예시 데이터만 관찰합니다. 실제 서비스, 실제 계정, 외부 호스트에는 요청하지 않습니다.',
  actors: [
    { id: 'student', label: '학생', purpose: '공지 확인, 과제 제출, 자신의 프로필 조회' },
    { id: 'staff', label: '교직원', purpose: '공지 작성, 과제 피드백, 담당 학생 관리' },
    { id: 'administrator', label: '관리자', purpose: '권한과 서비스 운영 설정 관리' },
  ],
  assets: [
    { id: 'profiles', label: '학생·교직원 프로필', classification: '개인정보' },
    { id: 'assignments', label: '과제 파일과 피드백', classification: '교육 데이터' },
    { id: 'sessions', label: '로그인 세션 식별자', classification: '인증 보조 정보' },
    { id: 'audit-logs', label: '접근·오류 로그', classification: '운영 증적' },
    { id: 'availability', label: '공지·과제 서비스 가용성', classification: '서비스 자산' },
  ],
  components: [
    { id: 'browser', label: '브라우저', detail: 'JavaScript가 화면의 DOM을 갱신합니다.' },
    { id: 'reverse-proxy', label: 'Reverse proxy', detail: '요청을 Linux 애플리케이션 서버로 전달합니다.' },
    { id: 'app-server', label: 'Linux 애플리케이션 서버', detail: '로그인, 검색, 업로드 같은 업무 규칙을 처리합니다.' },
    { id: 'database', label: '데이터 저장소', detail: '프로필, 공지, 과제 메타데이터를 보관합니다.' },
    { id: 'logs', label: '접근·오류 로그', detail: '운영 관찰과 분석에 필요한 기록을 남깁니다.' },
  ],
  samplePaths: [
    '/srv/codecurelab/app',
    '/etc/codecurelab/app.conf',
    '/var/log/codecurelab/access.log',
    '/var/log/codecurelab/error.log',
  ],
  safeExamples: {
    sessionCookie: 'cc_session=demo-session-redacted; Path=/; HttpOnly; Secure; SameSite=Lax',
    accessLog: '2026-07-12T10:14:22+09:00 student-102 GET /notices 200 1432',
    errorLog: '2026-07-12T10:15:04+09:00 request_id=req-demo-42 upload validation failed: unsupported media type',
  },
})
