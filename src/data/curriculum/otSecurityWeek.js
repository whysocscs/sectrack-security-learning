const nistOtGuide = {
  label: 'NIST SP 800-82 Rev. 3 · Guide to OT Security',
  url: 'https://csrc.nist.gov/pubs/sp/800/82/r3/final',
  note: 'OT의 성능·신뢰성·안전 요구를 고려한 보안 지침입니다.',
}

const cisaIcsPractices = {
  label: 'CISA · ICS Recommended Practices',
  url: 'https://www.cisa.gov/resources-tools/resources/ics-recommended-practices',
  note: 'ICS defense-in-depth, 원격 접근, incident response와 포렌식 계획 자료를 제공합니다.',
}

const otBlocks = {
  'w9-ot-foundations': [
    { type: 'explanation', title: 'OT 보안은 무엇을 보호하나', paragraphs: [
      'Operational Technology는 물리 공정과 장비를 감시하거나 제어하는 하드웨어와 소프트웨어입니다. 제조 설비, 전력·수처리, 빌딩 제어처럼 디지털 명령이 물리적 상태 변화로 이어지는 환경을 다룹니다.',
      'IT 보안의 기밀성도 중요하지만 OT에서는 사람과 설비의 안전, 공정 가용성, 결정적인 응답 시간과 복구 가능성을 함께 봐야 합니다. 보안 조치가 공정을 멈추거나 안전 기능을 방해하지 않는지도 변경 전에 확인해야 합니다.',
    ] },
    { type: 'comparison', title: 'IT와 OT에서 달라지는 우선 질문', columns: ['관점', '일반 IT 환경', 'OT 환경에서 추가할 질문'], rows: [
      ['보호 대상', '데이터·계정·서비스', '물리 공정·설비·안전 상태까지 포함하는가'],
      ['가용성', '서비스 중단과 복구 시간', '중단이 안전·생산·환경에 어떤 영향을 주는가'],
      ['변경 관리', '패치와 설정 배포', 'vendor 승인·정비 창·공정 시험이 필요한가'],
      ['관찰 방식', 'agent·active scan 활용 가능', '수동 관찰과 passive telemetry가 더 안전한가'],
    ] },
    { type: 'diagram', title: 'OT 자산의 기본 연결', body: '운영자 화면에서 제어 장치와 물리 공정으로 내려가고, 현장 상태가 다시 위로 보고됩니다.', nodes: ['운영자·HMI', 'SCADA·운영 서버', 'PLC·RTU·제어 장치', 'Sensor·Actuator', '물리 공정'] },
    { type: 'misconception', title: '흔한 오해', items: ['OT는 인터넷과 직접 연결되지 않으면 별도의 보안이 필요 없다.', 'IT에서 안전한 패치라면 공정 시험 없이 OT에도 즉시 적용할 수 있다.', '가용성만 높으면 안전과 무결성 문제는 별도로 보지 않아도 된다.'] },
    { id: 'w9-ot-priority-checkpoint', type: 'checkpoint', title: 'OT 우선순위', prompt: 'OT 변경 전에 IT 환경보다 특히 먼저 확인해야 할 것은?', options: ['공정 안전·가용성·vendor와 정비 창 조건', '화면 테마', '직원 개인 취향'], answer: 0, explanation: 'OT 조치는 물리 공정과 안전 기능에 영향을 줄 수 있어 운영·안전·vendor 조건을 함께 검토해야 합니다.' },
    { type: 'sources', title: '공식 근거', items: [nistOtGuide] },
    { type: 'summary', title: '핵심 정리', bullets: ['OT는 디지털 명령과 물리 공정이 이어지는 환경이다.', '안전·가용성·결정성·복구 가능성을 보안과 함께 본다.', '변경 전에 운영·안전·vendor 조건을 확인한다.'] },
  ],
  'w9-ot-architecture': [
    { type: 'explanation', title: '자산·Zone·Conduit로 연결을 읽기', paragraphs: [
      'OT 네트워크를 단순히 내부망 하나로 보지 않고 업무와 위험이 비슷한 자산을 zone으로 묶고, zone 사이의 승인된 통신 경로를 conduit로 기록합니다. Enterprise IT, DMZ, 운영 관리, 제어, 현장 장치 사이의 데이터 흐름과 원격 접근 경로를 분리합니다.',
      '프로토콜 이름만으로 안전성을 판정하지 않습니다. 누가 어느 자산에서 어떤 명령을 보낼 수 있는지, 인증과 무결성 보호가 있는지, 쓰기 명령이 실제 공정에 어떤 효과를 내는지 함께 확인합니다.',
    ] },
    { type: 'timeline', title: 'OT 통신 경로를 검토하는 순서', items: [
      { title: '자산과 기능 식별', body: 'HMI, historian, engineering workstation, PLC와 field device의 정상 역할을 적습니다.' },
      { title: 'Zone 분리', body: '업무·안전 중요도와 필요한 통신이 비슷한 자산을 묶습니다.' },
      { title: 'Conduit 확인', body: 'zone 사이 source, destination, protocol, 방향과 승인 목적을 기록합니다.' },
      { title: '원격 접근 확인', body: 'vendor 계정, jump host, MFA, 승인 시간과 session 종료 조건을 확인합니다.' },
      { title: '수동 관찰 기준선', body: '실제 장비에 능동 요청을 보내지 않고 제공된 흐름과 허용 목록을 비교합니다.' },
    ] },
    { type: 'code', sourceType: 'educational-reconstruction', title: '합성 OT 통신 허용 목록', language: 'text', description: '실제 IP·설비명·프로토콜 명령을 사용하지 않는 교육용 연결 목록입니다.', code: 'flow-01  historian-zone -> enterprise-reporting  read-only summary  approved\nflow-02  engineering-zone -> controller-zone  config write       maintenance-window only\nflow-03  vendor-remote -> jump-host            support session     ticket + MFA required\nflow-04  office-client -> controller-zone       direct write        not approved', annotations: ['허용 여부만 보지 말고 정상 목적과 시간 조건을 함께 읽습니다.', '제어 명령이나 실제 address는 포함하지 않습니다.', '미승인 흐름은 차단 전에 공정 소유자와 안전 영향·대체 경로를 확인합니다.'] },
    { id: 'w9-ot-zone-checkpoint', type: 'checkpoint', title: 'Zone 경계 확인', prompt: 'OT conduit 기록에 가장 필요한 조합은?', options: ['source·destination·방향·정상 목적·승인 조건', 'IP 하나만', '장비 색상'], answer: 0, explanation: '통신의 양 끝과 방향, 업무 목적, 승인·시간 조건을 함께 기록해야 정상 흐름과 예외를 구분할 수 있습니다.' },
    { type: 'sources', title: '공식 근거', items: [nistOtGuide, cisaIcsPractices] },
    { type: 'summary', title: '핵심 정리', bullets: ['자산을 기능과 위험에 따라 zone으로 묶는다.', 'Conduit에는 통신 양 끝·방향·목적·승인 조건을 기록한다.', '실제 OT 장비에는 임의 active scan이나 제어 요청을 보내지 않는다.'] },
  ],
  'w9-ot-monitoring': [
    { type: 'explanation', title: 'OT 관제와 Incident Response', paragraphs: [
      'OT 관제는 네트워크 이상만 찾는 일이 아니라 공정 상태, 자산 변경, 원격 접근과 안전 알람을 시간순으로 연결하는 작업입니다. 탐지 규칙이 울려도 정비 작업, 공정 전환, vendor 지원 같은 정상 변화일 수 있으므로 운영 맥락을 확인합니다.',
      '대응 과정에서는 즉시 전원을 끄거나 네트워크를 차단하는 조치가 더 큰 안전 문제를 만들 수 있습니다. 공정 운영자, 안전 담당자, OT 엔지니어와 함께 격리·수동 운전·증거 보존·복구 순서를 결정합니다.',
    ] },
    { type: 'comparison', title: 'OT 관제 알림을 분류할 때 확인할 근거', columns: ['관찰', '가능한 정상 맥락', '추가 확인'], rows: [
      ['정비 창의 설정 변경', '승인된 engineering 작업', 'ticket·작업자·대상·전후 checksum'],
      ['정비 창 밖의 원격 접속', '긴급 vendor 지원 또는 미승인 접근', 'MFA·jump host·승인자·session 기록'],
      ['제어 장치와 새로운 통신', '신규 설비 commissioning 또는 비정상 경로', '자산 목록·zone 허용 목록·공정 영향'],
      ['공정 값 급변과 안전 알람', '실제 공정 변화·sensor 오류·명령 변조 후보', '독립 sensor·운영자 확인·변경 이력'],
    ] },
    { type: 'timeline', title: '안전을 우선하는 대응 흐름', items: [
      { title: '알림과 공정 상태 확인', body: '시간, 자산, 사용자, 명령 유형과 안전 알람을 연결합니다.' },
      { title: '운영 맥락 확인', body: '정비 창, change ticket, vendor session과 정상 기준선을 대조합니다.' },
      { title: '안전 영향 평가', body: '격리·중단이 공정과 사람에게 미칠 영향을 운영·안전 담당자와 확인합니다.' },
      { title: '승인된 억제와 보존', body: '안전한 대체 운전·구간 격리·계정 중지 중 승인된 조치를 선택하고 로그를 보존합니다.' },
      { title: '복구와 재시험', body: 'golden configuration, 정상 통신, 안전 기능과 탐지 규칙을 함께 확인합니다.' },
    ] },
    { type: 'misconception', title: '흔한 오해', items: ['OT에서 의심스러운 통신을 보면 공정 영향 확인 없이 장비 전원을 먼저 끈다.', '보안팀 단독으로 제어 장치 설정과 안전 운전 상태를 결정할 수 있다.', '정비 작업표가 있으면 실제 변경 내용과 계정 기록은 확인하지 않아도 된다.'] },
    { id: 'w9-ot-response-checkpoint', type: 'checkpoint', title: '초기 대응 판단', prompt: 'OT 이상 징후의 초기 대응으로 가장 적절한 것은?', options: ['운영·안전 담당자와 공정 영향을 확인하고 승인된 억제·증거 보존 순서를 정한다', '즉시 모든 PLC 전원 차단', '로그 삭제'], answer: 0, explanation: 'OT 대응은 보안 효과와 물리 공정 안전을 함께 고려해 승인된 순서로 수행해야 합니다.' },
    { type: 'sources', title: '공식 근거', items: [nistOtGuide, cisaIcsPractices] },
    { type: 'summary', title: '핵심 정리', bullets: ['알림을 공정 상태·정비·원격 접근 기록과 연결한다.', '격리와 중단 전에 안전 영향을 확인한다.', '운영·안전·OT 엔지니어와 증거 보존·복구 순서를 공동 결정한다.'] },
  ],
}

export const otSecurityWeek = Object.freeze({
  id: 'ot-security-week',
  index: 17,
  title: 'OT 보안: 안전·가용성과 산업제어 관제',
  summary: 'OT·ICS 자산과 물리 공정의 관계를 이해하고 Zone·Conduit, 안전 우선 관제와 대응 흐름을 익힙니다.',
  objectives: ['IT와 OT의 보호 대상과 운영 제약을 구분한다.', 'OT 자산·Zone·Conduit와 원격 접근 경로를 설명한다.', '공정 안전을 고려한 관제·격리·증거 보존·복구 순서를 설계한다.'],
  prerequisites: ['W05 블루팀 기초', 'W06 네트워크 관제', '실제 OT 장비에는 요청하지 않는 안전 범위'],
  quizMinutes: 15,
  recordMinutes: 25,
  disableArchitecture: true,
  keyConcepts: ['OT·ICS', 'Zone·Conduit', '안전 우선 대응'],
  modules: [
    { id: 'w9-ot-foundations', title: 'OT·ICS와 물리 공정의 보안 우선순위', duration: 35, summary: 'OT가 물리 공정에 미치는 영향과 안전·가용성·결정성 요구를 구분합니다.', blocks: otBlocks['w9-ot-foundations'] },
    { id: 'w9-ot-architecture', title: '자산·Zone·Conduit와 원격 접근', duration: 40, summary: 'OT 자산을 zone으로 묶고 승인된 통신 경로와 vendor 원격 접근 조건을 읽습니다.', blocks: otBlocks['w9-ot-architecture'] },
    { id: 'w9-ot-monitoring', title: 'OT 관제와 안전 우선 Incident Response', duration: 40, summary: '공정 상태와 보안 알림을 연결하고 안전한 격리·증거 보존·복구 순서를 정합니다.', blocks: otBlocks['w9-ot-monitoring'] },
  ],
  labs: [{
    id: 'w9-ot-alarm-triage',
    week: 17,
    title: '합성 OT 알림과 정비 기록 분류',
    kind: 'guided-observation',
    activityType: 'investigation',
    path: 'required',
    estimatedMinutes: 35,
    objective: '합성 원격 접근·설정 변경·공정 알람 전사에서 직접 확인한 사실과 안전한 다음 행동을 구분합니다.',
    prerequisites: ['w9-ot-architecture', 'w9-ot-monitoring'],
    requiredTools: ['브라우저', '내장 합성 OT 관제 전사'],
    safeScope: '실제 PLC·SCADA·HMI·산업 네트워크에는 연결하거나 요청하지 않습니다. 브라우저에 포함된 합성 자산과 로그만 읽습니다.',
    successCriteria: ['정비 창과 원격 session의 시간 불일치 확인', '미승인 변경 후보와 침해 확정을 구분', '운영·안전 담당자 확인과 증거 보존 순서 작성'],
    hints: ['먼저 change ticket의 승인 시간과 session 시간을 비교하세요.', '알림 하나를 침해 확정으로 쓰지 말고 직접 확인한 사실만 고르세요.', '차단 전에 공정 안전 영향과 승인된 대체 운전 여부를 확인하세요.'],
    relatedConceptIds: ['w9-ot-foundations', 'w9-ot-architecture', 'w9-ot-monitoring'],
    nextRecommendations: ['w9-ot-monitoring'],
    submissionSchema: ['시간·자산·계정', '승인된 정비 조건', '직접 관찰한 차이', '안전 영향 확인과 다음 행동'],
    rubric: ['관찰과 침해 판단을 구분함', '실제 자산·주소·자격 증명을 사용하지 않음', '운영·안전 협업을 포함함', '증거 보존과 복구 확인을 연결함'],
    scenario: {
      steps: ['change ticket의 승인 시간과 대상 자산을 읽습니다.', 'vendor remote session의 시작 시각과 MFA·jump host 기록을 비교합니다.', '설정 checksum 변화와 공정 알람 시각을 연결합니다.', '직접 확인한 사실과 안전한 다음 행동을 선택합니다.'],
      artifacts: [
        { title: 'Change ticket OT-204', body: '승인 창 02:00~02:30 · 대상 mixer-plc-02 · 승인 작업 firmware inventory read-only · 설정 변경 승인 없음' },
        { title: 'Remote access 전사', code: '01:52 vendor-support login via approved jump host\n01:53 MFA success\n01:57 session command category: configuration-write\n02:05 controller checksum changed\n02:06 process deviation alarm\ncredentials: [REDACTED]' },
      ],
      evidenceOptions: [
        { id: 'ot-time-mismatch', label: '승인 창 전 remote session 시작', detail: '승인 창은 02:00부터지만 session은 01:52에 시작했습니다.' },
        { id: 'ot-change-mismatch', label: '읽기 전용 ticket과 설정 쓰기 기록의 불일치', detail: '승인 내용과 관찰된 command category가 다릅니다.' },
        { id: 'ot-confirmed-compromise', label: '외부 공격자가 PLC를 장악했다고 확정', detail: '제공 전사만으로 행위자와 침해 범위를 확정할 수 없습니다.' },
        { id: 'ot-power-off', label: '모든 제어 장치 즉시 전원 차단', detail: '공정 안전 영향과 대체 운전 확인 없이 수행할 수 없습니다.' },
      ],
      correctEvidenceIds: ['ot-time-mismatch', 'ot-change-mismatch'],
      reflection: { prompt: '확인된 두 불일치를 근거로, 공정 안전을 해치지 않는 다음 확인·보존·억제 순서를 설명하세요.', minimumLength: 40 },
      conclusion: '운영·안전 담당자와 공정 상태를 확인하고 remote session과 설정 증거를 보존한 뒤, 승인된 계정 중지·구간 격리·대체 운전 중 안전한 조치를 선택합니다.',
    },
  }],
  deliverables: ['OT 자산·Zone·Conduit 지도', '합성 OT 관제 알림 triage 결과', '안전 우선 incident response 순서'],
  recordBlueprint: { title: 'OT Security Observation Note', description: '공정 안전과 보안 근거를 함께 보존하는 관찰 기록입니다.', sections: ['자산·정상 공정·안전 조건', 'Zone·Conduit·원격 접근', '알림과 직접 관찰', '승인된 억제·증거 보존·복구'] },
  reportConnection: 'OT 보고서에는 보안 이벤트뿐 아니라 자산의 정상 기능, 공정 안전 영향, 운영 승인, 변경 창, 증거 보존과 복구 확인을 함께 기록합니다.',
})

export const otSecurityQuizQuestions = Object.freeze([
  { id: 'w9otq1', conceptIds: ['w9-ot-foundations'], difficulty: 'foundation', remediationModuleIds: ['w9-ot-foundations'], question: 'OT 보안 변경 전에 특히 먼저 확인할 것은?', options: ['공정 안전·가용성·운영 제약', '화면 색상', '개인 브라우저 기록'], answer: 0, explanation: 'OT 변경은 물리 공정과 안전 기능에 영향을 줄 수 있어 운영 제약을 함께 확인해야 합니다.' },
  { id: 'w9otq2', conceptIds: ['w9-ot-architecture'], difficulty: 'foundation', remediationModuleIds: ['w9-ot-architecture'], question: 'OT에서 Conduit를 기록할 때 필요한 항목은?', options: ['통신 양 끝·방향·목적·승인 조건', '장비 이름 하나만', '담당자 취미'], answer: 0, explanation: 'Zone 사이 통신의 source, destination, 방향, 정상 목적과 승인 조건이 필요합니다.' },
  { id: 'w9otq3', conceptIds: ['w9-ot-monitoring'], difficulty: 'application', remediationModuleIds: ['w9-ot-monitoring'], question: '정비 창 밖의 설정 변경 알림을 봤을 때 적절한 첫 판단은?', options: ['침해 확정', '변경 기록·계정·공정 상태를 대조할 조사 후보', '즉시 모든 설비 전원 차단'], answer: 1, explanation: '알림은 조사 시작점이며 운영 맥락과 안전 영향을 확인한 뒤 대응해야 합니다.' },
  { id: 'w9otq4', conceptIds: ['w9-ot-monitoring'], difficulty: 'application', remediationModuleIds: ['w9-ot-monitoring'], question: 'OT 격리 조치 전에 필요한 확인은?', options: ['공정 안전 영향과 승인된 대체 운전', '인터넷 검색 횟수', '로그 삭제 여부'], answer: 0, explanation: '격리나 중단이 더 큰 안전 문제를 만들 수 있어 운영·안전 담당자와 영향을 확인해야 합니다.' },
  { id: 'w9otq5', conceptIds: ['w9-ot-foundations', 'w9-ot-monitoring'], difficulty: 'analysis', remediationModuleIds: ['w9-ot-monitoring'], question: 'OT incident 기록에 함께 포함할 조합은?', options: ['보안 이벤트만', '공정 상태·안전 영향·운영 승인·증거 보존·복구 확인', '추정한 공격자 이름만'], answer: 1, explanation: 'OT incident는 사이버 증거와 물리 공정·안전·운영 판단을 함께 기록해야 합니다.' },
])
