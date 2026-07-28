const systemIntroWeekDesigns = Object.freeze({
  3: {
    title: '리버싱 입문: 바이너리 구조와 실행 흐름',
    summary: 'C 코드가 바이너리가 되는 과정부터 x86-64 제어 흐름과 GDB 관찰까지, 리버싱에 필요한 전체 지도를 두 세션으로 익힙니다.',
    objectives: ['C 소스·실행 파일·프로세스 메모리의 관계를 설명한다.', 'x86-64 명령, 레지스터, 스택과 호출 규약으로 함수 흐름을 읽는다.', 'GDB와 Pwntools로 허가된 로컬 바이너리의 상태와 바이트 입출력을 반복 관찰한다.'],
    prerequisites: ['W01 Linux의 파일·명령 기초', '텍스트 파일과 터미널 출력 읽기', '허가된 로컬 바이너리만 사용하는 안전 범위'],
    keyConcepts: ['바이너리 구조', 'x86-64', 'GDB·Pwntools'],
    sessions: [
      {
        id: 'w3-binary-foundation',
        title: '바이너리가 만들어지고 메모리에 놓이는 과정',
        description: '값·주소·포인터, 컴파일·링크, 프로세스 메모리 배치를 연결해 리버싱 대상의 기본 구조를 만듭니다.',
        outcome: '소스 코드의 값과 함수가 실행 파일과 프로세스 메모리에서 어떤 형태로 이어지는지 설명할 수 있다.',
        moduleIds: ['w7-c-values', 'w7-build-flow', 'w7-memory-layout'],
      },
      {
        id: 'w3-reversing-observation',
        title: '어셈블리와 GDB로 실행 흐름 읽기',
        description: '레지스터·분기·스택 프레임·호출 규약을 읽고 GDB와 Pwntools로 고정된 로컬 실행 상태를 확인합니다.',
        outcome: '짧은 함수의 입력, 분기, 반환과 실행 전후 상태를 근거와 함께 추적할 수 있다.',
        moduleIds: ['w8-instruction-flow', 'w8-stack-frame', 'w8-calling-convention', 'w9-debugger-flow', 'w9-bytes-io', 'w9-local-driver'],
      },
    ],
  },
  4: {
    title: 'PWN 입문: 메모리 손상에서 재시험까지',
    summary: '버퍼 경계 실패, 보호 기법, 로컬 크래시 분석과 주장 검증을 연결해 안전한 PWN 분석 흐름을 두 세션으로 익힙니다.',
    objectives: ['길이와 용량 불일치가 메모리 손상으로 이어지는 첫 지점을 찾는다.', 'NX·ASLR·PIE·Canary와 근본 수정의 역할을 구분한다.', '크래시·메모리 손상·악용 가능성을 분리하고 수정 뒤 정상·경계 조건을 재시험한다.'],
    prerequisites: ['W03 리버싱 입문', '함수 호출·스택·메모리 배치 기초', '허가된 로컬 합성 크래시만 사용하는 안전 범위'],
    keyConcepts: ['메모리 경계', 'BOF 완화기법', '크래시 분석·재시험'],
    sessions: [
      {
        id: 'w4-memory-safety',
        title: '메모리 손상과 보호 기법',
        description: '객체의 길이·용량·종료 조건을 따라가며 경계 위반 원인을 찾고 보호 기법별 역할과 한계를 비교합니다.',
        outcome: '최초 경계 위반, 크래시 결과, 보호 기법을 서로 다른 층으로 설명할 수 있다.',
        moduleIds: ['w10-bounds', 'w10-mitigations', 'w10-retest'],
      },
      {
        id: 'w4-pwn-triage',
        title: '크래시 분석, 주장 검증과 재시험',
        description: '도구나 AI의 결론을 그대로 쓰지 않고 로컬 합성 크래시의 신호·위치·상태를 확인한 뒤 수정 전후를 재시험합니다.',
        outcome: '확인한 사실, 아직 확인하지 못한 영향, 재시험 결과를 재현 가능한 분석 메모로 남길 수 있다.',
        moduleIds: ['w11-ai-claims', 'w11-local-triage', 'w11-retest'],
      },
    ],
  },
  5: {
    title: '블루팀 기초: 암호·포렌식·관제',
    summary: '암호화·인코딩·해시를 구분하고 증거 보존과 관제 판단을 연결해 블루팀 분석의 기본 언어를 익힙니다.',
    objectives: ['인코딩·암호화·해시의 목적과 관찰 가능한 흔적을 구분한다.', '원본 증거를 보존하면서 분석 사본과 시간 정보를 관리한다.', '관제에서 직접 관찰한 사실과 침해 판단을 분리한다.'],
    prerequisites: ['W01 Linux의 파일·명령 기초', 'W02 HTTP 통신 기초', '제공된 합성 증거만 사용하는 안전 범위'],
    keyConcepts: ['암호 경계', '증거 보존', '관제 판단'],
    sessions: [
      {
        id: 'w5-crypto-signal',
        title: '암호·인코딩·해시를 관제 신호로 읽기',
        description: '데이터 표현과 보호 목적을 구분하고 암호 프로토콜 사례에서 상태 무결성과 수정 근거를 읽습니다.',
        outcome: 'Base64·암호화·해시를 혼동하지 않고 로그와 증거에서 확인 가능한 범위를 설명할 수 있다.',
        moduleIds: ['w12-crypto-boundaries', 'w12-terrapin-flow', 'w12-strict-kex'],
      },
      {
        id: 'w5-forensic-monitoring',
        title: '포렌식 증거 보존과 관제 판단',
        description: '원본·분석 사본·해시·시간 정보를 관리하고 관찰과 해석을 분리해 초기 분석 메모를 만듭니다.',
        outcome: '관제 알림을 침해 확정으로 과장하지 않고 보존할 증거와 다음 확인 항목을 정할 수 있다.',
        moduleIds: ['w12-evidence-preservation', 'w12-forensic-interpretation'],
      },
    ],
  },
  6: {
    title: '블루팀 실전: 네트워크 관제와 패킷 분석',
    summary: '제공된 PCAP과 Wireshark로 통신 흐름을 좁히고 탐지 근거, 오탐 가능성, 대응 우선순위를 정하는 블루팀 흐름을 익힙니다.',
    objectives: ['PCAP의 수집 범위와 한계를 먼저 확인한다.', 'Wireshark 표시 필터로 대화와 이상 징후 후보를 좁힌다.', '패킷 근거를 관제 타임라인과 대응·추가 수집 계획으로 연결한다.'],
    prerequisites: ['W05 블루팀 기초', 'HTTP 요청·응답과 DNS 기초', '제공된 PCAP 또는 공식 샘플만 사용하는 안전 범위'],
    keyConcepts: ['PCAP', 'Wireshark', '탐지·대응'],
    sessions: [
      {
        id: 'w6-packet-monitoring',
        title: 'PCAP에서 관제 신호 좁히기',
        description: '캡처 범위를 확인한 뒤 endpoint·protocol·stream과 표시 필터로 조사할 대화를 좁힙니다.',
        outcome: '필터 결과를 침해 확정으로 쓰지 않고 직접 관찰한 패킷 사실을 정리할 수 있다.',
        moduleIds: ['w13-pcap-scope', 'w13-wireshark-filters'],
      },
      {
        id: 'w6-blue-team-response',
        title: '탐지 근거에서 대응 타임라인까지',
        description: '프로토콜 이상 사례와 방어 변경을 읽고 관제 타임라인, 오탐 확인, 추가 수집과 대응 우선순위를 작성합니다.',
        outcome: '패킷 근거·탐지 가설·대응 조치·확인하지 못한 범위를 블루팀 기록으로 연결할 수 있다.',
        moduleIds: ['w13-http2-rapid-reset', 'w13-nghttp2-budget', 'w13-network-reporting'],
      },
    ],
  },
})

export function applySystemIntroWeekDesign(week, weekIndex) {
  const design = systemIntroWeekDesigns[weekIndex]
  return design ? { ...week, ...design, sessions: design.sessions } : week
}
