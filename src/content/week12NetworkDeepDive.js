const rfc9113 = {
  label: 'RFC 9113 · HTTP/2',
  url: 'https://www.rfc-editor.org/rfc/rfc9113',
  note: 'connection, stream, frame, RST_STREAM, SETTINGS, GOAWAY의 protocol 기준입니다.',
}

const wiresharkGuide = {
  label: 'Wireshark · User’s Guide',
  url: 'https://www.wireshark.org/docs/wsug_html_chunked/',
  note: '저장된 capture file, packet list, display filter, protocol tree 관찰의 공식 안내입니다.',
}

const wiresharkFilters = {
  label: 'Wireshark · Display Filter Reference',
  url: 'https://www.wireshark.org/docs/dfref/',
  note: 'HTTP/2·TCP·DNS field와 display filter 의미를 확인합니다.',
}

const pcapngSpec = {
  label: 'IETF · PCAP Next Generation format draft',
  url: 'https://datatracker.ietf.org/doc/draft-gharris-opsawg-pcap/',
  note: 'capture section, interface, packet timestamp, option metadata의 file-format 기준입니다.',
}

const nvdRapidReset = {
  label: 'NVD · CVE-2023-44487',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-44487',
  note: 'HTTP/2 request cancellation의 resource-consumption 조건과 availability 영향을 확인합니다.',
}

const cisaRapidReset = {
  label: 'CISA · HTTP/2 Rapid Reset alert',
  url: 'https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487',
  note: '여러 HTTP/2 구현에 대한 공급자 update·완화 확인을 안내합니다.',
}

const nghttp2Project = {
  label: 'nghttp2 · 공식 저장소',
  url: 'https://github.com/nghttp2/nghttp2',
  note: 'HTTP/2 framing C library와 client·server·proxy application의 공식 source입니다.',
}

const nghttp2Advisory = {
  label: 'nghttp2 · Rapid Reset 공식 advisory',
  url: 'https://github.com/nghttp2/nghttp2/security/advisories/GHSA-vx74-f528-fxqg',
  note: '영향 version `<1.57.0`, 수정 version `1.57.0`, stream-reset rate limit을 명시합니다.',
}

const nghttp2Patch = {
  label: 'nghttp2 · stream-reset rate-limit commit 72b4af6',
  url: 'https://github.com/nghttp2/nghttp2/commit/72b4af6143681f528f1d237b21a9a7aee1738832',
  note: 'RST_STREAM token bucket, GOAWAY, option API, 실제 unit·session tests를 추가한 upstream diff입니다.',
}

const nghttp2Release = {
  label: 'nghttp2 1.57.0 · 공식 release',
  url: 'https://github.com/nghttp2/nghttp2/releases/tag/v1.57.0',
  note: 'CVE-2023-44487 수정이 포함된 signed release입니다.',
}

const pcapScopeMechanism = {
  id: 'w13-pcap-scope-capture-mechanism',
  type: 'mechanism',
  title: 'PCAP은 특정 관찰 지점이 실제로 본 packet bytes와 capture 조건을 보존한다',
  situation: 'network 문제를 나중에 재검토하려면 packet이 어느 interface, 어느 시간 구간, 어느 길이 제한, 어느 filter에서 관찰됐는지 함께 남겨야 합니다. PCAP은 그 지점의 관찰을 재생 가능하게 하지만 다른 segment·시간·host의 전체 traffic을 자동 포함하지 않습니다.',
  terms: [
    { term: 'Packet · 패킷', meaning: 'network layer에서 전달되는 header와 payload의 byte 단위입니다.', contrast: 'application request 하나가 packet 하나와 항상 일대일로 대응하지는 않습니다.' },
    { term: 'Capture Point · 캡처 지점', meaning: 'sensor가 traffic을 본 interface·host·tap·direction 위치입니다.', contrast: 'client에서 본 packet 집합과 server·load balancer에서 본 집합은 routing·loss·offload 때문에 다를 수 있습니다.' },
    { term: 'Snap Length · snaplen', meaning: 'packet 하나당 file에 보존할 최대 byte 수입니다.', contrast: '원래 packet 길이보다 작으면 뒤 bytes가 capture에서 잘릴 수 있습니다.' },
    { term: 'Capture Filter · 캡처 필터', meaning: 'capture 시점에 file에 넣을 packet을 선택하는 규칙입니다.', contrast: '저장 뒤 화면만 좁히는 display filter와 달리 제외된 packet은 file에 없습니다.' },
    { term: 'Packet Loss · 캡처 손실', meaning: 'traffic은 지나갔지만 sensor·buffer·storage가 packet을 file에 기록하지 못한 상태입니다.', contrast: 'PCAP에 보이지 않는 것과 network에서 전송되지 않은 것은 다를 수 있습니다.' },
  ],
  stages: [
    { label: '관찰 질문·허가', actor: 'analyst·owner', input: 'incident question, approved interface·time range, privacy scope', action: '필요한 protocol·metadata만 수집하도록 범위를 정합니다.', output: 'capture plan과 evidence ID' },
    { label: 'interface 관찰', actor: 'capture sensor', input: '해당 point를 지나는 frame bytes', action: 'kernel·driver가 선택 interface의 packet을 capture tool에 전달합니다.', output: '관찰 가능한 packet stream' },
    { label: 'filter·snaplen 적용', actor: 'capture engine', input: 'packet stream, capture filter, snaplen', action: '범위에 맞는 packet과 보존 길이를 결정합니다.', output: 'file에 기록할 packet records' },
    { label: 'timestamp·metadata 기록', actor: 'PCAP/PCAPNG writer', input: 'packet bytes, interface ID, clock, original/captured length', action: '각 record와 capture section metadata를 file에 기록합니다.', output: '범위가 명시된 immutable capture file' },
    { label: 'hash·read-only 분석', actor: 'evidence custodian·Wireshark', input: 'capture file과 digest baseline', action: '사본 hash를 확인한 뒤 저장된 bytes를 decode·filter합니다.', output: '특정 file 범위에 제한된 observation' },
  ],
  trustBoundary: {
    before: 'PCAP filename과 packet count만으로 capture point, 누락, timezone, snaplen, filter를 알 수 없습니다.',
    decision: 'capture manifest와 interface·time·filter·snaplen·drop counter·digest를 packet observation에 연결해야 합니다.',
    after: '결론은 “이 capture file의 이 범위에서 관찰됨/관찰되지 않음”으로 제한됩니다.',
    failure: 'capture 조건을 버리면 packet 부재를 환경 전체의 통신 부재로, sensor time을 server event time으로, 잘린 payload를 원래 packet 전체로 오판할 수 있습니다.',
  },
}

const captureManifestTrace = {
  id: 'w13-pcap-scope-manifest-trace',
  type: 'code-trace',
  title: 'packet보다 먼저 읽어야 하는 합성 PCAP manifest',
  evidenceKind: 'educational-model',
  language: 'yaml',
  description: '실제 network capture가 아닌 브라우저 로컬 `checkout-training.pcapng` metadata card입니다. IP·payload·credential 없이 범위 판단에 필요한 field만 표시합니다.',
  code: '1  capture_id: CHECKOUT-TRAINING-01\n2  file: checkout-training.pcapng\n3  source: fixed_browser_fixture\n4  capture_point: synthetic_client_side\n5  time_range_utc: 2026-06-14T01:00:00Z/2026-06-14T01:00:30Z\n6  interfaces: [training-if0]\n7  snaplen: 65535\n8  capture_filter: none\n9  packet_records: 18\n10 reported_drops: 0\n11 digest: TRAINING-PCAP-DIGEST-01\n12 scope_limit: no_server_logs_no_other_segments',
  trace: [
    { lines: '1–4', before: 'capture file은 있지만 어느 관찰 지점의 자료인지 아직 모릅니다.', action: 'stable ID, file, 합성 출처, client-side 관찰점을 읽습니다.', after: 'server 내부와 다른 segment가 자료 범위 밖임을 먼저 알 수 있습니다.' },
    { lines: '5–8', before: '시간·interface·truncation·capture-time exclusion 여부가 미확인입니다.', action: 'UTC range, interface, snaplen, capture filter를 확인합니다.', after: '어떤 packet이 file에 들어올 수 있었는지 설명할 capture 조건이 생깁니다.' },
    { lines: '9–11', before: 'record count와 file identity가 아직 검증되지 않았습니다.', action: 'packet record, reported drop, 교육 digest를 manifest에 연결합니다.', after: '같은 analysis copy를 보고 있는지와 sensor가 보고한 loss 상태를 확인할 수 있습니다.' },
    { lines: '12', before: 'packet이 없다는 관찰을 환경 전체 부재로 확대할 위험이 있습니다.', action: 'server log와 다른 network segment가 없다는 scope limit을 명시합니다.', after: '추가 evidence 요청을 남기고 PCAP 범위보다 큰 결론을 차단합니다.' },
  ],
}

const http2Mechanism = {
  id: 'w13-pcap-scope-http2-stream-mechanism',
  type: 'mechanism',
  title: 'HTTP/2는 한 connection 안의 여러 stream을 frame state로 독립 관리한다',
  situation: 'HTTP/1.1 connection을 여러 개 만드는 대신 HTTP/2는 한 connection 안에서 여러 request·response stream을 multiplex합니다. client가 더 이상 결과가 필요 없는 한 stream을 취소하는 정상 기능도 필요하지만, server는 stream 생성에 이미 쓴 resource와 cancellation rate를 connection 단위로 관리해야 합니다.',
  terms: [
    { term: 'Connection · 연결', meaning: '두 endpoint 사이에서 HTTP/2 frame을 주고받는 하나의 transport session입니다.', contrast: '한 connection 안에 여러 독립 stream이 동시에 존재할 수 있습니다.' },
    { term: 'Stream · 스트림', meaning: '한 HTTP request·response 교환에 대응하는 ordered bidirectional frame sequence입니다.', contrast: 'TCP connection 전체를 닫지 않고 stream 하나만 종료할 수 있습니다.' },
    { term: 'Frame · 프레임', meaning: 'HTTP/2의 HEADERS, DATA, RST_STREAM, SETTINGS 같은 protocol message 단위입니다.', contrast: 'network packet boundary와 일치하지 않을 수 있으며 Wireshark가 protocol decode로 재구성합니다.' },
    { term: 'RST_STREAM · stream reset', meaning: '특정 stream을 즉시 종료하고 더 이상 사용하지 않음을 알리는 frame입니다.', contrast: '정상 취소 기능이지만 이미 시작된 server·backend 작업이 즉시 모두 사라진다는 보장은 아닙니다.' },
    { term: 'GOAWAY · 연결 종료 통지', meaning: 'endpoint가 새 stream 수용을 중단하고 connection 종료를 조정하는 control frame입니다.', contrast: 'RST_STREAM처럼 stream 하나가 아니라 connection 수준 상태를 바꿉니다.' },
  ],
  stages: [
    { label: 'connection 설정', actor: 'client·server', input: 'HTTP/2 preface와 SETTINGS', action: 'frame size, concurrent stream 등 connection parameters를 교환합니다.', output: 'frame을 처리할 shared connection state' },
    { label: 'request stream 생성', actor: 'client HEADERS·server parser', input: '사용하지 않은 odd stream ID와 request headers', action: 'server가 stream object와 header decode·routing 작업을 준비합니다.', output: 'open stream과 allocated work' },
    { label: 'response 작업', actor: 'server·upstream', input: 'validated request와 resource budget', action: 'application 또는 proxy backend 작업을 시작하고 DATA·HEADERS response를 만듭니다.', output: 'stream response state' },
    { label: '정상 취소', actor: 'client RST_STREAM·server', input: '더 이상 필요 없는 한 stream ID와 error code', action: '그 stream을 닫고 가능한 local·upstream 작업을 취소·정리합니다.', output: 'closed stream, connection은 계속 사용 가능' },
    { label: 'connection budget 갱신', actor: 'server implementation', input: 'stream create/reset rate, active work, CPU·memory', action: '정상 취소는 허용하되 과도한 reset rate면 GOAWAY·connection close·rate limit을 적용합니다.', output: 'bounded resource use 또는 연결 단위 안전 종료' },
  ],
  trustBoundary: {
    before: 'client가 stream을 reset했다는 protocol 사실은 server가 이미 시작한 header decode·routing·backend work까지 비용 없이 되돌렸다는 뜻이 아닙니다.',
    decision: 'server가 connection별 create/reset rate, active·recent work, backend cancellation, CPU·memory budget을 함께 관리해야 합니다.',
    after: '정상 cancellation은 한 stream을 정리하고 connection의 총 resource 사용은 정한 budget 안에 머뭅니다.',
    failure: 'concurrent open stream 수만 제한하고 즉시 닫힌 stream의 생성 비용·reset rate를 세지 않으면 한 connection이 제한을 우회해 server work를 계속 만들 수 있습니다.',
  },
}

const nghttp2PatchAnalysis = {
  id: 'w13-pcap-scope-nghttp2-patch',
  type: 'patch-analysis',
  title: '공식 nghttp2 commit: RST_STREAM마다 token을 소비하고 한도를 넘으면 GOAWAY를 보낸다',
  evidenceKind: 'official-patch',
  source: nghttp2Patch,
  language: 'C',
  description: 'nghttp2 commit `72b4af6`의 `lib/nghttp2_session.c` 실제 핵심 diff입니다. CVE-2023-44487은 여러 구현에 걸친 protocol-level 문제이며 이 표는 그중 nghttp2 1.57.0의 실제 product-specific patch입니다.',
  before: {
    label: '수정 전 · 실제 reset 처리 끝',
    code: 'int nghttp2_session_on_rst_stream_received(\n    nghttp2_session *session, nghttp2_frame *frame) {\n  ...\n  if (nghttp2_is_fatal(rv)) {\n    return rv;\n  }\n  return 0;\n}',
  },
  after: {
    label: '수정 후 · 실제 reset rate gate',
    code: 'static int session_update_stream_reset_ratelim(\n    nghttp2_session *session) {\n  nghttp2_ratelim_update(&session->stream_reset_ratelim,\n                         nghttp2_time_now_sec());\n  if (nghttp2_ratelim_drain(\n        &session->stream_reset_ratelim, 1) == 0)\n    return 0;\n  return nghttp2_session_add_goaway(\n      session, session->last_recv_stream_id,\n      NGHTTP2_INTERNAL_ERROR, NULL, 0,\n      NGHTTP2_GOAWAY_AUX_NONE);\n}\n\nreturn session_update_stream_reset_ratelim(session);',
  },
  changes: [
    'server session에 `stream_reset_ratelim` token bucket을 추가하고 기본 burst 1000, 초당 재생 rate 33으로 초기화합니다.',
    'server가 받은 RST_STREAM 하나마다 monotonic time으로 bucket을 갱신한 뒤 token 하나를 소비합니다.',
    'token이 없으면 `nghttp2_session_add_goaway`로 connection-level GOAWAY를 queue하고 `GOAWAY_SUBMITTED` 상태를 기록합니다.',
    '`nghttp2_option_set_stream_reset_rate_limit` API를 추가해 embedding server가 product traffic 기준에 맞는 burst·rate를 정할 수 있게 했습니다.',
    'rate limiter 산술, token drain, session에서 threshold 뒤 GOAWAY가 생기는 실제 CUnit tests를 같은 commit에 추가했습니다.',
  ],
  regressionTests: [
    { case: '실제 upstream `ratelim_update` test', expected: '시간 경과만큼 token이 재생되되 burst를 넘지 않고 clock skew·integer overflow도 안전 처리', reason: 'rate window 계산 자체의 boundary를 공식 test가 검증합니다.' },
    { case: '실제 upstream `ratelim_drain` test', expected: '남은 token 이하는 성공, 초과 소비는 `-1`', reason: '마지막 허용 reset과 첫 거절 reset의 off-by-one을 확인합니다.' },
    { case: '실제 upstream session reset test', expected: '기본 burst 안에서는 GOAWAY가 없고 한도를 넘으면 outbound GOAWAY 하나가 생김', reason: 'RST_STREAM 처리와 connection mitigation이 실제로 연결되는지 검증합니다.' },
    { case: '정상 client cancellation', expected: '검토된 정상 reset pattern에서 stream만 닫히고 connection·정상 request가 유지됨', reason: '보안 limit이 legitimate cancellation과 사용자 경험을 과도하게 깨뜨리지 않는지 product 수준에서 확인합니다.' },
    { case: 'proxy·backend cleanup', expected: 'reset stream의 upstream work가 취소·bounded되고 CPU·memory metric이 회복됨', reason: 'library gate와 전체 service resource 효과 사이를 운영 재시험으로 연결합니다.' },
  ],
  limitation: '이 diff와 `<1.57.0`/`1.57.0` version 범위는 nghttp2에만 적용됩니다. 다른 HTTP/2 server·proxy는 각 공급자의 다른 patch와 version을 확인해야 합니다. 기본 1000/33 값도 모든 workload의 보편적 정답이 아니며 정상 cancellation baseline과 함께 검토합니다. 대량 stream·RST_STREAM 생성 code나 외부 traffic은 제공하지 않습니다.',
}

const rapidResetImpact = {
  id: 'w13-pcap-scope-rapid-reset-impact',
  type: 'impact-map',
  title: 'Rapid Reset의 핵심은 client 비용보다 server 작업 비용이 더 크게 누적되는 비대칭이다',
  intro: 'nghttp2 advisory의 CVSS 3.1은 AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H입니다. 한 PCAP에서 RST_STREAM을 관찰한 사실과 availability impact가 성립했다는 결론은 CPU·memory·latency·backend evidence로 연결해야 합니다.',
  dimensions: [
    { label: '기밀성', impact: 'nghttp2 advisory base 평가는 C:N이며 이 CVE가 response data를 읽게 하는 정보 노출 결함은 아닙니다.', condition: '별도 data exposure claim은 다른 defect와 evidence가 필요합니다.' },
    { label: '무결성', impact: 'base 평가는 I:N이며 저장 data 변경이 주된 효과로 기록되지 않습니다.', condition: 'retry·partial application effect가 있다면 application-specific transaction evidence로 별도 평가합니다.' },
    { label: '가용성', impact: '반복적인 stream 생성·즉시 취소가 header decode, stream allocation, routing, backend work를 누적시켜 높은 availability 영향을 만들 수 있습니다.', condition: '영향 HTTP/2 implementation, remote reachability, rate limit 부재·부족, 요청 비용 비대칭, 실제 resource saturation이 이어져야 합니다.' },
  ],
  attackerControls: [
    '자신의 HTTP/2 connection에서 새 stream을 시작하고 해당 stream을 취소하는 frame의 시점·빈도',
    '허용된 protocol 범위에서 request header·path가 유발하는 server-side work 종류',
    '여러 connection을 열 수 있는 자신의 network 접근 범위',
  ],
  notControlled: [
    'server·proxy의 nghttp2 version과 stream-reset burst·rate 설정',
    'load balancer·CDN·WAF가 connection을 제한하거나 먼저 종료하는지',
    'application routing·cache·backend cancellation이 실제로 소비하는 CPU·memory',
    'autoscaling, queue, circuit breaker, per-tenant quota, monitoring의 실제 구성',
  ],
  access: {
    authentication: 'PR:N입니다. 영향을 받는 HTTP/2 listener에 network 접근할 수 있으면 application login 전에도 request parsing work가 시작될 수 있습니다.',
    interaction: 'UI:N으로 다른 사용자의 행동은 필요하지 않습니다.',
    network: 'AV:N·AC:L입니다. 그러나 한 PCAP의 몇 개 reset은 attack rate나 service saturation을 자동 증명하지 않습니다.',
    defaultExposure: 'nghttp2 `<1.57.0`을 server mode로 사용하는 HTTP/2 endpoint가 구체적 대상입니다. library가 설치만 되어 있거나 client-only 사용이면 같은 exposure로 단정하지 않습니다.',
    protections: 'nghttp2 1.57.0 이상 또는 공급자 patch, connection별 reset·request budget, GOAWAY, proxy/backend cancellation, capacity·rate monitoring을 계층화하고 정상 traffic을 재시험합니다.',
  },
}

const displayFilterMechanism = {
  id: 'w13-wireshark-filters-mechanism',
  type: 'mechanism',
  title: 'Display filter는 저장된 packet을 바꾸지 않고 분석 질문에 맞는 row만 선택한다',
  situation: '수백·수천 packet에서 DNS, 특정 HTTP/2 stream, reset frame 같은 관찰을 찾으려면 protocol decoder가 만든 field를 조건으로 화면을 좁힐 필요가 있습니다. display filter는 read-only view이지만 잘못된 field·decode·scope를 쓰면 중요한 주변 packet을 보지 못할 수 있습니다.',
  terms: [
    { term: 'Display Filter · 표시 필터', meaning: '이미 capture된 packet 중 조건에 맞는 항목만 Wireshark 화면에 보이게 하는 식입니다.', contrast: 'file에서 packet을 삭제하거나 network traffic을 차단·생성하지 않습니다.' },
    { term: 'Protocol Dissector · 프로토콜 분석기', meaning: 'packet bytes를 protocol header·field·message 구조로 해석하는 Wireshark component입니다.', contrast: 'port number나 heuristic이 틀리면 실제 bytes와 다른 protocol로 decode될 수 있습니다.' },
    { term: 'Field · 필드', meaning: '`http2.type`, `http2.streamid`처럼 dissector가 추출한 이름 있는 값입니다.', contrast: 'field가 존재하지 않는 packet은 비교식 결과에서 제외될 수 있습니다.' },
    { term: 'Stream Correlation · stream 연결', meaning: '같은 connection·HTTP/2 stream ID의 앞뒤 frame을 시간·방향과 함께 묶는 관찰입니다.', contrast: 'stream ID만 같아도 다른 connection이면 같은 request가 아닙니다.' },
    { term: 'Reassembly · 재조립', meaning: '여러 TCP segment에 나뉜 application bytes를 protocol 분석을 위해 다시 이어 붙이는 과정입니다.', contrast: 'capture loss·truncation이 있으면 완전한 재조립과 decode가 불가능할 수 있습니다.' },
  ],
  stages: [
    { label: '사본 검증', actor: 'analyst', input: 'PCAP analysis copy와 manifest digest', action: 'original baseline과 일치하고 read-only 관찰 대상인지 확인합니다.', output: '승인된 capture bytes' },
    { label: 'decode context 확인', actor: 'Wireshark dissectors', input: 'link·network·transport bytes와 preferences', action: 'protocol stack과 field를 만들고 decode error·reassembly 상태를 표시합니다.', output: 'field가 붙은 packet records' },
    { label: '넓은 filter에서 시작', actor: 'analyst', input: '질문과 protocol field', action: '`http2`처럼 넓은 view로 전체 대화와 방향을 확인합니다.', output: '관련 connection·time range 후보' },
    { label: 'field로 좁히기', actor: 'display engine', input: '예: `http2.type == 3`과 후보 connection', action: 'RST_STREAM으로 decode된 row를 선택하되 앞뒤 frame 링크를 보존합니다.', output: '질문에 맞는 local view' },
    { label: '맥락·한계 기록', actor: 'analyst', input: '선택 row와 주변 stream·TCP·manifest', action: '시간, 방향, stream, reset code, 누락 가능성, server metric 필요를 기록합니다.', output: 'PCAP 범위의 재현 가능한 observation' },
  ],
  trustBoundary: {
    before: '필터 결과 count만으로 connection 수, request cost, server CPU, source identity, attack intent를 알 수 없습니다.',
    decision: 'filter 식, dissector version, connection tuple, stream ID, 앞뒤 frame, capture scope를 함께 검토해야 합니다.',
    after: '“이 file·이 decode·이 filter에서 어떤 frame이 관찰됨”이라는 사실만 확정됩니다.',
    failure: 'RST_STREAM row만 떼어 보면 정상 cancellation을 attack으로, capture loss로 없는 HEADERS를 실제로 없었던 message로 오판할 수 있습니다.',
  },
}

const filterTrace = {
  id: 'w13-wireshark-filters-trace',
  type: 'code-trace',
  title: '한 합성 HTTP/2 stream을 넓은 view에서 reset 맥락까지 좁히기',
  evidenceKind: 'educational-model',
  language: 'text',
  description: 'Wireshark에 실제 command를 보내지 않는 고정 local 결과표입니다. 외부 host·payload는 없고 display filter의 관찰 범위만 설명합니다.',
  code: '1  filter: http2\n2  result: frame 7 HEADERS stream=7 direction=client_to_server\n3          frame 8 RST_STREAM stream=7 direction=client_to_server\n4          frame 9 HEADERS stream=9 direction=client_to_server\n5  filter: http2.type == 3\n6  result: frame 8 RST_STREAM stream=7 error=NO_ERROR\n7  filter: http2.streamid == 7\n8  result: frame 7 HEADERS -> frame 8 RST_STREAM\n9  conclusion: one stream cancellation observed in this capture\n10 not_proven: reset rate, server saturation, attacker identity, CVE impact',
  trace: [
    { lines: '1–4', before: 'HTTP/2 frame의 전체 local view가 아직 없습니다.', action: 'protocol filter로 HEADERS와 RST_STREAM을 시간 순서대로 봅니다.', after: 'stream 7 cancellation 앞의 request 시작과 다른 stream 9가 같은 view에 남습니다.' },
    { lines: '5–6', before: '질문은 RST_STREAM 존재 여부입니다.', action: 'frame type 3으로 decode된 row만 선택합니다.', after: 'frame 8 한 개가 보이지만 rate와 server cost는 알 수 없습니다.' },
    { lines: '7–8', before: 'reset row가 어느 request state에 대응하는지 확인해야 합니다.', action: '같은 connection의 stream 7 frame을 다시 모읍니다.', after: 'HEADERS 뒤 RST_STREAM이라는 합성 state sequence가 관찰됩니다.' },
    { lines: '9–10', before: '한 cancellation을 Rapid Reset impact로 과장할 위험이 있습니다.', action: '직접 관찰과 PCAP이 증명하지 못한 rate·resource·identity 주장을 분리합니다.', after: 'server log·metric·version evidence를 다음 확인으로 요청할 수 있습니다.' },
  ],
}

const reportingMechanism = {
  id: 'w13-network-reporting-mechanism',
  type: 'mechanism',
  title: 'Network finding은 packet fact를 server resource evidence와 상관분석해 만든다',
  situation: 'PCAP에서 error code, reset, retransmission을 찾았더라도 정상 browser cancellation, client timeout, capture artifact일 수 있습니다. asset baseline과 server·proxy metric을 같은 시간 window로 맞춰야 “protocol event가 service availability에 영향을 주었다”는 주장을 검증할 수 있습니다.',
  terms: [
    { term: 'Baseline · 기준선', meaning: '정상 시간대의 connection, stream, reset rate, latency, CPU·memory 분포입니다.', contrast: '고정 임계값 하나보다 workload·release·시간대별로 달라질 수 있습니다.' },
    { term: 'Telemetry · 텔레메트리', meaning: 'packet, access log, protocol counter, process metric, trace처럼 system 상태를 관찰한 data입니다.', contrast: '각 source는 clock·sampling·retention·scope가 달라 먼저 정렬해야 합니다.' },
    { term: 'Correlation · 상관분석', meaning: '공통 time·connection·request·asset ID를 사용해 서로 다른 evidence의 동시 변화를 비교하는 과정입니다.', contrast: '같은 시간에 일어났다는 사실만으로 인과관계가 자동 증명되지는 않습니다.' },
    { term: 'False Positive · 오탐', meaning: '탐지 조건에는 맞지만 의도한 위협이 아닌 정상·다른 원인의 event입니다.', contrast: '오탐 가능성이 있다고 alert와 log를 없애기보다 context field와 threshold를 개선합니다.' },
    { term: 'Rate Window · 비율 구간', meaning: '정한 시간 동안 발생한 reset·new stream 수를 connection·source·tenant 기준으로 집계하는 범위입니다.', contrast: '누적 count만 보면 짧은 burst와 장기간 정상 사용을 구분하기 어렵습니다.' },
  ],
  stages: [
    { label: 'Packet fact 기록', actor: 'PCAP analyst', input: 'manifest, filter, frame·stream·time', action: 'RST_STREAM count·sequence를 capture 범위 안에서 기록합니다.', output: '재현 가능한 network observation' },
    { label: 'Asset·version 연결', actor: 'inventory owner', input: 'listener, proxy chain, library package, build ID', action: '어느 implementation이 packet을 처리했는지와 patch 상태를 확인합니다.', output: 'product-specific exposure 후보' },
    { label: 'Resource evidence 정렬', actor: 'server observability', input: 'reset/new-stream counter, CPU, memory, queue, latency, backend work', action: 'PCAP time window와 clock·sampling을 맞춰 baseline 대비 변화를 계산합니다.', output: 'availability effect evidence' },
    { label: '방어 상태 대조', actor: 'platform owner', input: 'rate limit, GOAWAY, connection limit, proxy cancellation, autoscaling', action: 'control이 어느 layer에서 동작했는지와 bypass gap을 확인합니다.', output: 'root patch·보조 control 상태' },
    { label: '제한된 finding·retest', actor: 'reviewer', input: 'packet·asset·metric·control evidence', action: '확정·미확정 범위를 쓰고 정상 cancellation과 고정 합성 rate test의 expected 결과를 정의합니다.', output: '방어 가능한 report와 회귀 계획' },
  ],
  trustBoundary: {
    before: 'PCAP IP·RST count나 server CPU graph 하나만으로 source identity, request cost, CVE exploitation을 확정할 수 없습니다.',
    decision: 'asset owner가 version·listener·proxy path를, service owner가 metric·baseline을, analyst가 packet scope를 각자 검증해야 합니다.',
    after: 'finding은 동일 asset·time window의 packet event와 resource effect, control 상태에 연결됩니다.',
    failure: '상관관계 없이 reset만 alert하면 정상 cancellation이 오탐이 되고, CPU만 보면 어떤 protocol cost가 원인인지 알 수 없습니다.',
  },
}

const reportingTrace = {
  id: 'w13-network-reporting-correlation-trace',
  type: 'code-trace',
  title: 'PCAP fact와 server metric을 같은 window에서 연결하는 합성 기록',
  evidenceKind: 'educational-model',
  language: 'yaml',
  description: '실제 IP·traffic·service가 아닌 fixed observation card입니다. 탐지 요구사항을 보여 줄 뿐 request generator나 차단 명령을 제공하지 않습니다.',
  code: '1  window_utc: 2026-06-14T01:00:10Z/2026-06-14T01:00:20Z\n2  capture_scope: CHECKOUT-TRAINING-01\n3  packet_fact: { rst_stream_observed: 1, stream_id: 7 }\n4  asset_fact: { component: nghttp2-training-server, version: 1.57.0 }\n5  server_metric: { reset_rate: baseline_range, cpu: baseline_range }\n6  control_fact: { reset_limiter: enabled, goaway: not_triggered }\n7  conclusion: normal cancellation consistent with available evidence\n8  alert_rule_input: reset_rate + new_stream_rate + cpu_or_queue\n9  log_fields: time,connection_id,reset_count,goaway,build_id\n10 excluded_fields: payload,cookie,authorization,client_identity_claim\n11 retest: normal_cancel_allowed / reviewed_excess_causes_goaway / normal_request_ok',
  trace: [
    { lines: '1–3', before: 'PCAP에서 stream 7 reset 하나가 관찰됐습니다.', action: 'UTC window, capture ID, packet fact를 고정합니다.', after: '다른 log·metric과 대조할 최소 time·scope key가 생깁니다.' },
    { lines: '4–6', before: 'packet만으로 처리 implementation과 resource effect를 알 수 없습니다.', action: 'training asset version, reset rate·CPU baseline, limiter·GOAWAY 상태를 같은 window에 연결합니다.', after: 'patched product에서 control threshold에 닿지 않은 정상 범위라는 evidence가 생깁니다.' },
    { lines: '7–8', before: '한 reset을 attack으로 부를 근거가 없습니다.', action: '제한된 정상 cancellation 결론을 쓰고 future alert에는 rate·work·resource 신호를 결합하도록 요구합니다.', after: '단일 packet 기반 오탐을 줄이는 방어 질문이 됩니다.' },
    { lines: '9–11', before: '탐지·retest에 필요한 log와 privacy 범위가 미정입니다.', action: '최소 protocol·build field만 남기고 payload·credential·identity 단정을 제외한 뒤 정상·제한·회귀 oracle을 정합니다.', after: 'data 최소화와 운영 검증을 함께 만족하는 기록이 됩니다.' },
  ],
}

const networkControls = {
  id: 'w13-network-reporting-control-layers',
  type: 'comparison',
  title: 'Rapid Reset 방어를 code·config·permission·log·test로 나누기',
  columns: ['층', '구현·운영 통제', '확인 evidence', '한계'],
  rows: [
    ['Code', 'nghttp2 1.57.0 token bucket·GOAWAY 또는 각 공급자 실제 patch', 'package/build ID와 reviewed source diff', '모든 HTTP/2 제품에 같은 diff를 적용할 수 없음'],
    ['Config', 'connection별 reset·request budget, concurrency, timeout, proxy/backend cancellation', 'effective config와 정상 baseline', '임계값이 너무 낮으면 정상 취소·latency를 해칠 수 있음'],
    ['Permission', 'edge proxy를 비특권 identity로 실행하고 backend route·quota를 최소화', 'runtime identity, network policy, tenant quota', 'protocol DoS 자체의 root patch는 아님'],
    ['Log', 'new stream·reset rate, GOAWAY, connection ID, build ID, CPU·queue; payload·credential 제외', '동일 UTC window의 counter·metric', 'sampling·clock·retention 차이를 보정해야 함'],
    ['Test', '정상 cancel, 마지막 token, 첫 초과, GOAWAY, normal request, backend cleanup', 'official unit tests와 service-level fixed fixture', '외부 부하·공격 traffic 없이 허가된 staging에서만 수행'],
  ],
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichRapidResetCve(block) {
  const additions = [nvdRapidReset, cisaRapidReset, rfc9113, nghttp2Project, nghttp2Advisory, nghttp2Patch, nghttp2Release]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    title: '구현 사례: nghttp2가 Rapid Reset 비용 비대칭을 connection budget으로 제한하다',
    productRole: 'nghttp2는 HTTP/2 framing을 구현하는 C library이며 그 위에 client, server, reverse proxy application을 제공합니다.',
    weakness: 'HTTP/2 stream의 빠른 생성·취소에 대한 connection-level resource accounting 부족 · denial of service',
    affectedVersions: 'nghttp2 1.57.0 미만(`<1.57.0`)의 server use. CVE-2023-44487 전체는 여러 HTTP/2 구현에 걸치므로 다른 제품은 각 vendor 범위를 확인',
    fixedVersions: 'nghttp2 1.57.0. 다른 HTTP/2 server·proxy는 해당 공급자의 patch release와 backport 확인',
    cause: 'HTTP/2는 client가 RST_STREAM으로 stream을 일방적으로 취소하게 합니다. nghttp2 advisory는 HEADERS 직후 RST_STREAM을 제한 없이 빠르게 반복하면 server가 stream 생성·header 처리 등에 비용을 쓰지만 concurrent open-stream 제한에는 오래 머물지 않아 availability가 손상될 수 있다고 설명합니다.',
    condition: 'remote unauthenticated client가 영향을 받는 nghttp2 server-mode endpoint에 HTTP/2 connection을 만들고, connection별 stream-reset rate limit보다 빠르게 server work를 유발·취소할 수 있어야 합니다. 수업은 대량 요청, RST_STREAM 전송, 부하 생성, 외부 network 관찰을 하지 않고 고정 PCAP state와 공식 patch만 읽습니다.',
    patch: 'nghttp2 commit `72b4af6`은 incoming RST_STREAM token bucket, 기본 burst 1000·rate 33/s, 초과 시 GOAWAY, 조정 API와 실제 CUnit regression tests를 추가했습니다. signed 1.57.0 release가 CVE-2023-44487 수정을 기록합니다.',
    followOn: 'PCAP의 reset 한 건을 attack으로 보거나 nghttp2의 숫자·diff를 모든 HTTP/2 제품의 보편 patch로 연결하는 주장은 공식 근거로 검증되지 않아 미채택입니다.',
    facts: [
      'nghttp2 advisory CVSS 3.1은 AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H입니다.',
      '정상 stream cancellation은 protocol 기능이므로 reset 존재가 아니라 rate·server work·resource effect를 함께 봐야 합니다.',
      '공식 patch는 stream concurrency만 낮추는 것이 아니라 reset rate를 connection state로 계수합니다.',
      '실습은 저장된 합성 capture view와 source diff만 사용하며 network traffic을 생성하지 않습니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichPcapScope(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichRapidResetCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    pcapScopeMechanism,
    captureManifestTrace,
    http2Mechanism,
    cve,
    nghttp2PatchAnalysis,
    rapidResetImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [pcapngSpec, wiresharkGuide, rfc9113, nvdRapidReset, cisaRapidReset, nghttp2Project, nghttp2Advisory, nghttp2Patch, nghttp2Release])
    : block)
}

function enrichWithBlocks(blocks, additions, sources) {
  const enriched = addAfter(blocks, (block) => block.type === 'explanation', additions)
  return enriched.map((block) => block.type === 'sources' ? appendUniqueSources(block, sources) : block)
}

export function buildWeek12NetworkGuide(modules) {
  const enrichers = {
    'w13-pcap-scope': enrichPcapScope,
    'w13-wireshark-filters': (blocks) => enrichWithBlocks(blocks, [displayFilterMechanism, filterTrace], [wiresharkGuide, wiresharkFilters, rfc9113]),
    'w13-network-reporting': (blocks) => enrichWithBlocks(blocks, [reportingMechanism, reportingTrace, networkControls], [wiresharkGuide, nvdRapidReset, cisaRapidReset, nghttp2Advisory]),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
