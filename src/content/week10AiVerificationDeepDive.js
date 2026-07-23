const nistGenAiProfile = {
  label: 'NIST AI 600-1 · Generative AI Profile',
  url: 'https://doi.org/10.6028/NIST.AI.600-1',
  note: '생성형 AI의 confabulation과 정보 무결성 위험을 조직적 검증 대상으로 다루는 공식 지침입니다.',
}

const nistAiRmf = {
  label: 'NIST · AI Risk Management Framework',
  url: 'https://www.nist.gov/itl/ai-risk-management-framework',
  note: 'AI 결과를 맥락·측정·관리 과정과 연결하는 공식 위험관리 기준입니다.',
}

const gdbManual = {
  label: 'GNU GDB · 공식 문서',
  url: 'https://sourceware.org/gdb/current/onlinedocs/gdb.html/',
  note: '로컬 process의 breakpoint, backtrace, frame, variable 관찰 기준입니다.',
}

const cwe125 = {
  label: 'MITRE CWE-125 · Out-of-bounds Read',
  url: 'https://cwe.mitre.org/data/definitions/125.html',
  note: 'source가 제공한 범위를 넘어 읽는 약점의 정의와 방어 원칙입니다.',
}

const xzIncident = {
  label: 'XZ Utils · CVE-2024-3094 사건 공식 정리',
  url: 'https://tukaani.org/xz-backdoor/',
  note: '영향 release tarball, Git source와의 차이, clean release 일정을 설명한 프로젝트 공식 기록입니다.',
}

const xzCleanupPatch = {
  label: 'XZ Utils · 공식 cleanup commit e93e13c',
  url: 'https://github.com/tukaani-project/xz/commit/e93e13c8b3bec925c56e0c0b675d8000a0f7f754',
  note: '관련 여덟 commit을 되돌리고 의심 test artifact를 제거한 실제 upstream diff입니다.',
}

const xzCleanRelease = {
  label: 'XZ Utils · 5.6.2 공식 release',
  url: 'https://github.com/tukaani-project/xz/releases/tag/v5.6.2',
  note: '2024-05-29 공개된 clean release와 CVE-2024-3094 제거 기록입니다.',
}

const nvdXz = {
  label: 'NVD · CVE-2024-3094',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3094',
  note: '영향 version과 supply-chain compromise 분류를 확인합니다.',
}

const redHatXz = {
  label: 'Red Hat · CVE-2024-3094',
  url: 'https://access.redhat.com/security/cve/CVE-2024-3094',
  note: 'downstream package와 system integration에 따른 영향·조치 근거입니다.',
}

const claimMechanism = {
  id: 'w11-ai-claims-verification-mechanism',
  type: 'mechanism',
  title: 'AI 답변은 결론이 아니라 검증 대기 중인 주장 묶음으로 처리한다',
  situation: 'AI 답변 한 문장에는 제품 version, code 동작, 공격 전제, 영향, patch 같은 서로 다른 주장이 섞일 수 있습니다. 문장 전체를 맞다·틀리다로 판정하면 일부만 근거가 있는 상태를 놓치므로 주장별로 필요한 evidence와 확신 수준을 따로 관리해야 합니다.',
  terms: [
    { term: 'Claim · 주장', meaning: '참·거짓 또는 확신 수준을 근거로 판정할 수 있는 하나의 구체적인 문장입니다.', contrast: '여러 원인·조건·영향을 “그래서 위험하다” 한 문장에 묶으면 검증 단위가 너무 큽니다.' },
    { term: 'Evidence · 증거', meaning: '특정 주장을 지지하거나 반박하도록 출처·시간·artifact와 연결된 관찰입니다.', contrast: 'AI가 같은 문장을 반복하거나 자신 있게 말하는 것은 독립 증거가 아닙니다.' },
    { term: 'Inference · 추론', meaning: '관찰된 사실에서 규칙과 전제를 사용해 도출한 해석입니다.', contrast: '직접 관찰과 같지 않으며 사용한 전제와 반대 가능성을 함께 적어야 합니다.' },
    { term: 'Primary Source · 1차 근거', meaning: '제품 공급자의 advisory·release·commit, 표준, 실제 build record처럼 주장 대상에 직접 가까운 자료입니다.', contrast: '검색 요약·AI 설명·재인용 글은 탐색에는 유용해도 patch 사실의 최종 근거가 아닙니다.' },
    { term: 'Provenance · 출처 이력', meaning: 'artifact가 어느 source, builder, signer, digest, 배포 경로를 거쳐 만들어졌는지 연결한 기록입니다.', contrast: '파일명과 version 문자열만으로 동일한 byte·clean build를 보장하지 않습니다.' },
  ],
  stages: [
    { label: '질문·답변 보존', actor: '분석자', input: 'AI 답변, 사용한 질문, 제공한 context, 생성 시각', action: '민감값을 제거하고 어느 정보가 모델에 주어졌는지 함께 기록합니다.', output: '검증 가능한 답변 snapshot' },
    { label: '원자 주장 분해', actor: '분석자', input: '답변의 각 문장', action: '제품·version·원인·조건·영향·patch를 한 row에 하나씩 분리합니다.', output: 'stable claim ID를 가진 ledger' },
    { label: '근거 요구 지정', actor: '검증 계획', input: '각 claim의 종류', action: 'source line, runtime trace, official advisory, patch diff, deployment record 중 필요한 근거를 정합니다.', output: 'claim별 evidence requirement' },
    { label: '독립 대조', actor: '공식 source·로컬 evidence', input: 'primary source와 허가된 local artifact', action: 'AI 표현을 검색어로만 쓰고 실제 문서·diff·trace에서 값을 다시 확인합니다.', output: '지지·반박·미확인 evidence link' },
    { label: '상태·한계 기록', actor: 'analyst review', input: 'claim과 evidence', action: '`verified`, `contradicted`, `unverified`, `out-of-scope` 중 하나를 부여하고 다음 확인을 씁니다.', output: '감사 가능한 제한된 결론' },
  ],
  trustBoundary: {
    before: 'AI가 URL·commit hash·version을 제시해도 존재 여부와 내용 일치가 확인된 것은 아닙니다.',
    decision: '분석자가 primary source를 직접 열고 날짜·revision·본문·diff·artifact identity를 claim과 연결해야 합니다.',
    after: '보안 판단에는 검증된 claim만 사용하고 추론·미확인은 별도 상태로 유지합니다.',
    failure: '답변을 한 덩어리로 승인하면 맞는 제품명 옆의 틀린 version, 실제 commit 옆의 잘못된 patch 의미, crash 옆의 과장된 영향이 함께 통과할 수 있습니다.',
  },
}

const claimLedgerTrace = {
  id: 'w11-ai-claims-ledger-trace',
  type: 'code-trace',
  title: '네 개의 AI 문장을 evidence 상태로 바꾸는 합성 claim ledger',
  evidenceKind: 'educational-model',
  language: 'javascript',
  description: 'AI API를 호출하지 않는 브라우저 로컬 교육 모델입니다. 고정된 문장을 검증 상태로 분류하는 구조만 보여 주며 실제 취약 artifact나 공격 입력을 다루지 않습니다.',
  code: '1  const claims = [\n2    { id: "C1", text: "affected tarballs are 5.6.0 and 5.6.1", need: "project incident page" },\n3    { id: "C2", text: "the trigger was fully present in Git", need: "project incident page + Git diff" },\n4    { id: "C3", text: "5.6.2 records backdoor removal", need: "signed release notes" },\n5    { id: "C4", text: "every host with xz was remotely exposed", need: "package + build + link + service evidence" },\n6  ]\n7  const evidence = { C1: "supports", C2: "contradicts", C3: "supports", C4: "insufficient" }\n8  const status = claims.map(c => ({\n9    id: c.id, status: evidence[c.id] === "supports" ? "verified"\n10      : evidence[c.id] === "contradicts" ? "contradicted" : "unverified"\n11  }))',
  trace: [
    { lines: '1–5', before: 'AI 답변에는 version, source 위치, patch, 영향 범위가 한 문단에 섞여 있습니다.', action: '한 row에 하나의 판정 가능한 주장과 필요한 근거 종류를 둡니다.', after: '어떤 문장이 같은 URL을 써도 서로 다른 확인을 요구하는지 보입니다.' },
    { lines: '7', before: '공식 incident page·release·diff와 deployment evidence를 각각 대조했습니다.', action: '각 claim에 지지, 반박, 근거 부족이라는 evidence 관계만 기록합니다.', after: 'AI의 자신감과 무관한 독립 evidence state가 생깁니다.' },
    { lines: '8–10', before: 'evidence 관계는 analyst가 사용할 최종 status로 아직 정규화되지 않았습니다.', action: '지지는 verified, 반박은 contradicted, 부족은 unverified로 보수적으로 변환합니다.', after: 'C1·C3만 판단 근거로 사용하고 C2는 틀린 주장, C4는 추가 배포 증거가 필요한 주장으로 남습니다.' },
    { lines: '11', before: 'claim status가 정해졌지만 운영 영향은 아직 환경별입니다.', action: 'ledger를 종료하되 unverified claim의 다음 evidence requirement를 보존합니다.', after: '“모름”이 누락이 아니라 추적 가능한 검증 상태가 됩니다.' },
  ],
}

const xzPatchAnalysis = {
  id: 'w11-ai-claims-xz-cleanup-patch',
  type: 'patch-analysis',
  title: '실제 commit으로 “무엇을 고쳤다”는 AI 주장을 검증하기',
  evidenceKind: 'official-patch',
  source: xzCleanupPatch,
  language: 'C',
  description: 'XZ Utils cleanup commit `e93e13c`의 실제 `crc_common.h`·`crc32_fast.c` diff 발췌입니다. AI가 “한 macro 수정이 전체 backdoor를 고쳤다”고 요약하면 공식 incident page와 commit 범위를 함께 보아 반박해야 합니다.',
  before: {
    label: 'cleanup 전 · 실제 저장소 발췌',
    code: '// src/liblzma/check/crc_common.h\n#define lzma_resolver_attributes \\\n    __attribute__((__no_profile_instrument_function__)) \\\n    no_omit_frame_pointer\n\n// src/liblzma/check/crc32_fast.c\nlzma_resolver_attributes\nstatic crc32_func_type\ncrc32_resolve(void)',
  },
  after: {
    label: 'cleanup 후 · 실제 저장소 발췌',
    code: '// src/liblzma/check/crc32_fast.c\n#ifdef CRC_USE_IFUNC\n__attribute__((__no_profile_instrument_function__))\n#endif\nstatic crc32_func_type\ncrc32_resolve(void)',
  },
  changes: [
    '`crc_common.h`에서 공통 `lzma_resolver_attributes`와 `no_omit_frame_pointer` macro block을 제거했습니다.',
    '`crc32_fast.c`와 `crc64_fast.c`에는 필요한 attribute만 `CRC_USE_IFUNC` 조건 아래 직접 남겼습니다.',
    '같은 commit은 공식 message가 executable payload를 포함했다고 밝힌 test artifact를 삭제하고 관련 여덟 commit을 되돌렸습니다.',
    '공식 5.6.2 release가 CVE-2024-3094 제거를 기록하지만, release의 IFUNC 지원 제거는 보안 때문이 아니라고 별도 명시합니다. 따라서 “IFUNC 자체가 CVE이고 제거가 유일한 patch”라는 주장은 틀립니다.',
  ],
  regressionTests: [
    { case: '공식 claim · cleanup commit 범위', expected: 'message에 적힌 여덟 commit·test artifact·resolver 변경이 실제 diff와 일치', reason: 'AI 요약이 commit에 없는 변경을 만들어내지 않았는지 확인합니다.' },
    { case: '공식 claim · 5.6.2 release', expected: 'release note가 backdoor removal을 기록하고 signer·tag가 확인됨', reason: 'fixed version 주장을 프로젝트 release와 연결합니다.' },
    { case: '과정 제안 · archive와 Git 비교', expected: '허용된 차이만 존재하고 승인되지 않은 source-package insertion이 없음', reason: '공식 incident page가 설명한 Git와 release tarball 신뢰 경계를 재검증합니다.' },
    { case: '과정 제안 · package·runtime provenance', expected: 'vendor package digest와 실제 loaded liblzma가 승인한 clean artifact와 일치', reason: 'source patch 확인을 배포 영향 해소와 혼동하지 않습니다.' },
    { case: '과정 제안 · 정상 압축·해제', expected: 'known fixture가 clean build에서 같은 output·exit status를 유지', reason: '보안 정리 뒤 제품의 정상 기능 회귀를 확인합니다.' },
  ],
  limitation: '프로젝트 공식 기록은 활성화에 필요한 작은 trigger code가 source package 생성 때 삽입됐고 Git repository에는 없었다고 설명합니다. 따라서 위 C diff는 전체 trigger source가 아닙니다. commit 자체에는 전용 보안 회귀 test가 추가되지 않았으며 `과정 제안` 행은 교육용 검증 설계입니다. 악성 artifact·trigger·payload·service activation은 재구성하지 않습니다.',
}

const xzImpactMap = {
  id: 'w11-ai-claims-xz-impact',
  type: 'impact-map',
  title: 'AI의 “모든 xz 설치가 위험” 주장을 실제 영향 조건으로 분해한다',
  intro: 'CVE의 높은 잠재 영향과 특정 자산의 실제 노출은 다른 주장입니다. XZ 5.6.0·5.6.1 release tarball, downstream package, build 조건, runtime link, service integration을 하나씩 확인합니다.',
  dimensions: [
    { label: '기밀성', impact: '오염 library의 악성 경로가 특정 privileged service에서 활성화되면 service가 접근하는 정보의 높은 기밀성 영향이 가능합니다.', condition: '영향 tarball에서 build된 binary와 공개 기록의 architecture·build·link·service 조건이 실제 자산에서 모두 이어져야 합니다.' },
    { label: '무결성', impact: '신뢰된 library 경계에서 승인되지 않은 code가 실행되면 system state의 높은 무결성 영향이 가능합니다.', condition: 'package 설치만이 아니라 실제 runtime dependency와 activation path에 들어갔다는 evidence가 필요합니다.' },
    { label: '가용성', impact: '악성 library 동작과 추가 CPU 사용은 service 성능·가용성에 영향을 줄 수 있습니다.', condition: '공식 cleanup message의 일반 설명과 실제 자산의 process·metric evidence를 구분합니다.' },
  ],
  attackerControls: [
    '사건 당시 compromised release 과정에 들어간 승인되지 않은 artifact 내용',
    '5.6.0·5.6.1 source package 생성 단계의 악성 build-time 경로',
  ],
  notControlled: [
    '각 배포판이 영향 version을 package·배포했는지와 vendor backport 상태',
    '대상 architecture·compiler·link setting이 활성화 조건과 맞는지',
    '어떤 service가 해당 liblzma를 실제 runtime에 load하는지',
    '조직의 allowlist·signature gate·isolation·monitoring 적용 상태',
  ],
  access: {
    authentication: '공급망 삽입은 최종 사용자의 application login을 통과하는 일반 입력 취약점이 아닙니다. 최종 영향 범위는 오염 library를 load한 service identity에 묶입니다.',
    interaction: '일반 사용자의 click보다 downstream이 영향 artifact를 build·package·deploy하는 과정이 전제입니다.',
    network: '오염 artifact 유입과 최종 network-facing service 효과를 분리합니다. xz 설치 문자열만으로 remote exposure를 확정하지 않습니다.',
    defaultExposure: '공식 project 기록은 5.6.0·5.6.1 release tarball을 영향 대상으로 지목하고 Git repository source와 구분합니다.',
    protections: '영향 artifact 제거, vendor-approved clean package, signature·digest·source-to-archive 차이, 실제 loaded library, service 정상 동작을 확인해야 합니다. AI 답변·version 문자열·debug output은 이 검증을 대신하지 않습니다.',
  },
}

const triageMechanism = {
  id: 'w11-local-triage-mechanism',
  type: 'mechanism',
  title: 'Crash triage는 종료 신호에서 첫 잘못된 상태 전이까지 거슬러 올라간다',
  situation: 'process가 abort나 segmentation fault로 끝났을 때 마지막 stack frame은 오류가 드러난 곳일 뿐 잘못된 길이가 처음 신뢰된 곳과 다를 수 있습니다. 정상 fixture와 실패 fixture를 같은 build에서 비교해 첫 차이, 실패 line, 실제 effect를 나눠야 합니다.',
  terms: [
    { term: 'Crash · 크래시', meaning: 'process가 예상한 정상 결과 대신 signal·abort·예외 같은 비정상 종료를 한 관찰입니다.', contrast: '원인, memory corruption 종류, 악용 가능성, 사업 영향을 모두 자동으로 설명하지 않습니다.' },
    { term: 'Triage · 초기 분류', meaning: '재현 조건, 실패 위치, 우선순위, 다음 조사 질문을 빠르게 정리하는 단계입니다.', contrast: '최종 root-cause analysis나 exploitability 판정과 범위가 다릅니다.' },
    { term: 'First Divergence · 첫 차이', meaning: '정상 실행과 실패 실행의 state sequence가 처음 달라지는 값·branch·call 지점입니다.', contrast: '마지막 crash line보다 원인에 가까울 수 있지만 여전히 추가 source 검토가 필요합니다.' },
    { term: 'Exploitability · 악용 가능성', meaning: '공격자가 결함을 원하는 보안 효과로 안정적으로 바꿀 수 있는지에 대한 별도 판단입니다.', contrast: 'crash 재현 여부 하나와 같지 않으며 이 수업은 이를 실험하지 않습니다.' },
  ],
  stages: [
    { label: 'Artifact·fixture 고정', actor: 'analyst', input: 'binary hash, source revision, build options, 정상·실패 fixture ID', action: '비교 실행의 모든 입력을 기록합니다.', output: '재현 가능한 local scope' },
    { label: '정상 기준선', actor: 'debugger', input: '정상 fixture', action: '함수 순서, 길이, branch, return을 지정 지점에서 기록합니다.', output: 'expected state sequence' },
    { label: '실패 재현', actor: 'debugger', input: '한 조건만 다른 실패 fixture', action: '같은 breakpoint와 명령 순서로 실행합니다.', output: 'failure state sequence와 종료 신호' },
    { label: '첫 차이·실패 line 구분', actor: 'source review', input: '두 sequence와 source', action: '외부 길이를 신뢰한 line, 범위 밖 접근이 시도된 line, crash가 관찰된 frame을 별도로 표시합니다.', output: '원인 가설과 실제 effect point' },
    { label: '영향 주장 제한', actor: 'reviewer', input: '재현·source·protection evidence', action: '관찰된 crash·read/write와 미확인 confidentiality·control-flow 주장을 나눕니다.', output: '방어 수정과 다음 안전 검증' },
  ],
  trustBoundary: {
    before: 'fixture 내부의 declared length는 그만큼의 byte가 실제 buffer에 있다는 보증이 아닙니다.',
    decision: 'parser가 header 최소 길이와 `declared <= available`을 dereference·copy 전에 검사해야 합니다.',
    after: '검증된 slice만 checksum·decode 함수에 전달되고 실패는 output state를 바꾸지 않습니다.',
    failure: 'declared length를 먼저 신뢰하면 호출된 함수에서 범위 밖 read가 드러나고, AI가 마지막 함수 이름을 root cause로 오해할 수 있습니다.',
  },
}

const triageTrace = {
  id: 'w11-local-triage-parser-trace',
  type: 'code-trace',
  title: '선언 길이 6·실제 body 4에서 line 5가 첫 범위 밖 read를 요청하는 합성 parser',
  evidenceKind: 'educational-model',
  language: 'C',
  description: '실제 취약 프로젝트가 아닌 `parser-demo` 교육 모델입니다. 고정 fixture의 length contract만 분석하며 memory address, payload, control-flow 전환은 제공하지 않습니다.',
  code: '1  int parse_record(const uint8_t *buf, size_t size) {\n2      if (size < 2) return ERR_HEADER;\n3      uint16_t declared = read_u16_be(buf);\n4      const uint8_t *body = buf + 2;\n5      uint32_t sum = checksum(body, declared);\n6      return store_sum(sum);\n7  }\n\nfixture: size=6, declared=6, available body bytes=size-2=4',
  trace: [
    { lines: '1–2', before: 'fixture 전체에는 6 byte가 있고 parser는 최소 2-byte header를 요구합니다.', action: 'header 존재를 검사해 통과합니다.', after: 'header read 자체는 범위 안이지만 body length는 아직 검증되지 않았습니다.' },
    { lines: '3–4', before: 'header에는 외부가 선언한 값 6이 있고 실제 body는 4 byte입니다.', action: 'declared 값을 읽고 body 시작 pointer를 계산합니다.', after: '`declared=6`, `available=4`라는 첫 의미 차이가 생기지만 code는 아직 비교하지 않습니다.' },
    { lines: '5', before: 'checksum에 전달할 실제 readable body는 4 byte뿐입니다.', action: '`declared=6`을 길이로 전달해 6 byte read를 요청합니다.', after: '이 line이 객체 범위를 넘어선 read를 처음 요청하는 정확한 실패·효과 지점입니다. crash 여부와 추가 영향은 별도입니다.' },
    { lines: '6', before: 'line 5가 안전하게 완료됐다는 보장이 없습니다.', action: '결과를 저장하려고 하지만 정상 contract가 이미 깨졌습니다.', after: 'root fix는 line 5 전에 `declared > size - 2`를 거절하고 line 6의 state effect에 도달하지 않게 하는 것입니다.' },
  ],
}

const retestMechanism = {
  id: 'w11-retest-claim-mechanism',
  type: 'mechanism',
  title: '방어 가설은 같은 artifact의 실패·정상·인접 경로 oracle로 검증한다',
  situation: 'AI가 “length check를 추가하면 해결된다”고 제안해도 어느 비교식, 어느 error code, destination 보존, 정상 record 유지, 배포 artifact까지 명시하지 않으면 검증 가능한 수정 계획이 아닙니다.',
  terms: [
    { term: 'Hypothesis · 가설', meaning: '특정 원인이 특정 관찰을 만들었다는 시험 가능한 설명입니다.', contrast: 'AI가 제안했다는 이유만으로 verified cause가 되지 않습니다.' },
    { term: 'Oracle · 기대 결과', meaning: '각 fixture가 반환값·output·state·log에서 무엇을 만들어야 하는지 미리 정한 판정 기준입니다.', contrast: 'crash가 사라졌다는 한 조건보다 더 구체적이어야 합니다.' },
    { term: 'Adjacent Path · 인접 경로', meaning: '수정 조건 바로 앞·뒤의 정상과 실패 동작입니다.', contrast: '실패 fixture 하나만 보면 지나치게 넓은 거절이나 off-by-one 회귀를 놓칩니다.' },
    { term: 'Negative Evidence · 부재 관찰', meaning: '정해진 범위에서 특정 signal·write·log가 관찰되지 않았다는 결과입니다.', contrast: '모든 환경에서 절대 발생하지 않는다는 보편적 증명이 아닙니다.' },
  ],
  stages: [
    { label: '가설을 code 조건으로 변환', actor: 'reviewer', input: 'AI 제안과 first-divergence evidence', action: '`size >= 2`와 `declared <= size - 2`처럼 write/read 전 gate를 명시합니다.', output: '검토 가능한 root-fix 조건' },
    { label: '실패 oracle', actor: 'test author', input: 'declared가 available보다 큰 fixture', action: 'checksum 호출 없음, `ERR_LENGTH`, state unchanged를 기대값으로 정합니다.', output: '안전한 실패 contract' },
    { label: '경계·정상 oracle', actor: 'test author', input: 'declared 0, available과 동일, 일반 정상 record', action: '마지막 유효 byte와 정상 output이 유지되는지 정합니다.', output: '인접 기능 regression contract' },
    { label: '격리 test 실행', actor: 'CI·local harness', input: 'fixed build와 fixture matrix', action: 'network 없는 비특권 process에서 sanitizer·return·call count·log를 비교합니다.', output: '관찰 evidence' },
    { label: 'claim 상태 갱신', actor: 'analyst', input: 'patch diff와 test evidence', action: 'root-cause claim과 impact claim을 별도로 갱신하고 배포 확인이 필요한 항목을 남깁니다.', output: '검증 이력이 있는 conclusion' },
  ],
  trustBoundary: {
    before: 'AI의 patch suggestion은 실제 codebase API, integer type, error handling, concurrency, deployment state를 알지 못할 수 있습니다.',
    decision: 'maintainer가 실제 source contract와 tests에 맞춰 수정하고 reviewer가 diff·build·artifact를 확인합니다.',
    after: '시험한 code path와 artifact에 한해 실패 거절과 정상 기능 유지가 증명됩니다.',
    failure: '제안 code를 그대로 붙이면 unsigned underflow, 잘못된 error state, 정상 record 거절, test하지 않은 binary 배포가 남을 수 있습니다.',
  },
}

const retestTrace = {
  id: 'w11-retest-ledger-trace',
  type: 'code-trace',
  title: 'AI patch 제안을 검증 가능한 code·log·test 계약으로 바꾸기',
  evidenceKind: 'educational-model',
  language: 'C',
  description: '실제 프로젝트 patch가 아닌 `parser-demo`의 수정·test 의사 코드입니다. local fixed fixture만 사용하며 실제 exploit이나 외부 process를 실행하지 않습니다.',
  code: '1  if (size < 2) return ERR_HEADER;\n2  declared = read_u16_be(buf);\n3  available = size - 2;\n4  if (declared > available) {\n5      log_event(build_id, ERR_LENGTH, fixture_id);\n6      return ERR_LENGTH;\n7  }\n8  return checksum_and_store(buf + 2, declared);\n\n9  expect(failure_fixture, ERR_LENGTH, checksum_calls=0, state="unchanged");\n10 expect(boundary_fixture, OK, checksum_calls=1, state="expected");\n11 expect(normal_fixture, OK, checksum_calls=1, state="expected");',
  trace: [
    { lines: '1–3', before: 'source buffer와 size는 있지만 body의 readable length는 아직 계산되지 않았습니다.', action: 'header가 있음을 확인한 뒤 subtraction을 수행해 unsigned underflow 없이 available을 계산합니다.', after: '외부 declared와 내부 available을 같은 byte 단위로 비교할 수 있습니다.' },
    { lines: '4–7', before: '`declared > available`이면 checksum이 안전하게 읽을 slice가 없습니다.', action: '최소 build·error·fixture ID만 기록하고 checksum·store 전에 오류를 반환합니다.', after: 'raw input·address 없이 안전한 실패와 조사 상관관계를 얻습니다.' },
    { lines: '8', before: 'declared가 actual body 안이라는 gate를 통과했습니다.', action: '검증된 pointer·length만 effect 함수에 전달합니다.', after: '정상 checksum과 store는 범위 안 record에만 일어납니다.' },
    { lines: '9–11', before: '수정 code가 있지만 한 fixture 결과만으로 회귀를 판단할 수 없습니다.', action: '실패, 정확한 경계, 일반 정상 fixture에서 return·call count·state를 함께 비교합니다.', after: 'AI의 “해결됨” claim을 특정 source와 test evidence로 제한해 verified 또는 unverified로 갱신할 수 있습니다.' },
  ],
}

const verificationLayers = {
  id: 'w11-retest-defense-layers',
  type: 'comparison',
  title: 'AI 제안을 실제 방어로 바꿀 때 필요한 다섯 증거 층',
  columns: ['층', '검증할 것', '남길 evidence', 'AI 답변이 대신 못 하는 것'],
  rows: [
    ['Code', 'read·write 전 실제 length/capacity gate와 atomic failure', 'source revision·reviewed diff·line-level test', 'codebase의 정확한 API·type·state contract'],
    ['Build·config', 'compiler flags, dependency lock, artifact hash·provenance', 'reproducible build manifest·SBOM·binary properties', '실제로 배포한 byte 식별'],
    ['Permission', 'local-only test, 비특권 identity, network·filesystem allowlist', 'sandbox policy와 denied action log', '테스트 범위 허가와 production 권한 결정'],
    ['Log', 'claim ID, build ID, error code, source link, raw input·credential 제외', '검증 ledger와 최소 진단 event', '민감정보 처리·보존 책임'],
    ['Test', '실패·경계·정상 fixture, state unchanged, sanitizer, deployment smoke test', 'oracle·result·artifact identity', '환경 전체의 exploitability·business impact 확정'],
  ],
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichXzCve(block) {
  const additions = [xzIncident, xzCleanupPatch, xzCleanRelease, nvdXz, redHatXz]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    title: 'AI 검증 사례: XZ release tarball·Git source·clean release를 분리한다',
    productRole: 'XZ Utils는 `.xz`·`.lzma` 압축·해제 도구와 downstream program이 link하는 `liblzma` library를 제공합니다.',
    weakness: '악성 release artifact를 통한 software supply-chain compromise · CWE-506 계열',
    affectedVersions: 'upstream XZ Utils 5.6.0·5.6.1 release tarball. downstream 영향은 package·build·architecture·link·service integration을 별도 확인',
    fixedVersions: 'upstream 5.6.2 clean release 또는 배포판이 명시한 known-clean package. 조직은 실제 artifact digest와 loaded library까지 확인',
    cause: 'XZ 프로젝트는 5.6.0·5.6.1 release tarball에 backdoor가 포함됐고 작은 trigger code는 source package 생성 때 build system에 삽입되어 Git repository에는 없었다고 설명합니다. “upstream tarball 5.6.0부터”라는 불완전한 AI 요약은 5.6.1 범위와 Git/tarball 차이를 빠뜨릴 수 있습니다.',
    condition: '영향 tarball에서 build된 artifact가 downstream package에 들어가고 공개된 build·architecture·link·service 조건까지 이어져야 후속 효과가 성립합니다. 수업은 악성 build artifact, trigger, payload, backdoor, 원격 연결을 재현하지 않고 공식 source와 clean metadata만 검증합니다.',
    patch: '공식 cleanup commit `e93e13c`는 관련 여덟 commit을 되돌리고 의심 test artifact·resolver 변경을 제거했습니다. 공식 5.6.2 release는 backdoor 제거를 기록합니다. 대응은 영향 artifact 제거, clean vendor package 적용, signature·digest·source-to-archive·runtime provenance 재검증입니다.',
    followOn: 'AI의 분석 오류가 CVE 원인이라는 주장, Git diff가 전체 trigger라는 주장, 다른 Pwn 사례가 patch 우회라는 연결은 공식 근거로 검증되지 않아 미채택입니다.',
    facts: [
      'AI 답변은 source 탐색을 도울 수 있지만 version·commit·patch·영향 판정의 primary evidence가 아닙니다.',
      '공식 incident page는 release tarball과 Git repository source를 구분합니다.',
      '5.6.2 release의 IFUNC 제거는 보안 목적이 아니라고 명시되어 있어 CVE root cause와 동일시하지 않습니다.',
      '운영 영향은 package version 문자열뿐 아니라 actual artifact와 runtime integration evidence가 필요합니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichClaims(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichXzCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    claimMechanism,
    claimLedgerTrace,
    cve,
    xzPatchAnalysis,
    xzImpactMap,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [nistGenAiProfile, nistAiRmf, xzIncident, xzCleanupPatch, xzCleanRelease, nvdXz, redHatXz])
    : block)
}

function enrichWithBlocks(blocks, additions, sources) {
  const enriched = addAfter(blocks, (block) => block.type === 'explanation', additions)
  return enriched.map((block) => block.type === 'sources' ? appendUniqueSources(block, sources) : block)
}

export function buildWeek10AiVerificationGuide(modules) {
  const enrichers = {
    'w11-ai-claims': enrichClaims,
    'w11-local-triage': (blocks) => enrichWithBlocks(blocks, [triageMechanism, triageTrace], [gdbManual, cwe125, nistGenAiProfile]),
    'w11-retest': (blocks) => enrichWithBlocks(blocks, [retestMechanism, retestTrace, verificationLayers], [nistAiRmf, nistGenAiProfile, cwe125]),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
