const gdbManual = {
  label: 'GNU GDB · 공식 문서',
  url: 'https://sourceware.org/gdb/current/onlinedocs/gdb.html/',
  note: 'breakpoint, frame, backtrace, register, source-level stepping의 공식 동작을 확인합니다.',
}

const pwntoolsTubeDocs = {
  label: 'pwntools · tubes와 process 공식 문서',
  url: 'https://docs.pwntools.com/en/stable/tubes.html',
  note: '로컬 process 생성과 byte 기반 입출력 API의 공식 문서입니다.',
}

const pythonBytesDocs = {
  label: 'Python · Binary Sequence Types 공식 문서',
  url: 'https://docs.python.org/3/library/stdtypes.html#binary-sequence-types-bytes-bytearray-memoryview',
  note: 'text와 bytes, byte length, binary sequence 동작을 확인합니다.',
}

const xzIncident = {
  label: 'XZ Utils · CVE-2024-3094 사건 공식 정리',
  url: 'https://tukaani.org/xz-backdoor/',
  note: '영향 release tarball, Git 저장소와의 차이, clean release 일정을 정리한 프로젝트 공식 기록입니다.',
}

const xzCleanupPatch = {
  label: 'XZ Utils · 공식 cleanup commit e93e13c',
  url: 'https://github.com/tukaani-project/xz/commit/e93e13c8b3bec925c56e0c0b675d8000a0f7f754',
  note: '5.6.0·5.6.1 backdoor 관련 test artifact를 제거하고 관련 여덟 commit을 되돌린 실제 diff입니다.',
}

const xzCleanRelease = {
  label: 'XZ Utils · 5.6.2 공식 release',
  url: 'https://github.com/tukaani-project/xz/releases/tag/v5.6.2',
  note: '2024-05-29 공개된 clean release와 CVE-2024-3094 제거 기록입니다.',
}

const nvdXz = {
  label: 'NVD · CVE-2024-3094',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3094',
  note: '영향 version과 공급망 compromise 분류를 확인합니다.',
}

const redHatXz = {
  label: 'Red Hat · CVE-2024-3094',
  url: 'https://access.redhat.com/security/cve/CVE-2024-3094',
  note: '배포 package와 system integration에 따른 영향 판정·조치 근거입니다.',
}

const debuggerMechanism = {
  id: 'w9-debugger-flow-mechanism',
  type: 'mechanism',
  title: '디버거는 같은 산출물의 실행을 멈춰 상태 전이를 비교한다',
  situation: '프로그램이 예상과 다른 값을 반환할 때 화면의 마지막 오류만 보면 어느 함수와 조건에서 상태가 달라졌는지 알기 어렵습니다. 디버거는 허가된 로컬 산출물을 정한 지점에서 멈추고 정상 fixture와 오류 fixture의 같은 상태를 비교하게 합니다.',
  terms: [
    { term: 'Breakpoint · 중단점', meaning: '실행을 끝내는 것이 아니라 특정 source line·함수·instruction에 도달했을 때 잠시 멈추는 관찰 지점입니다.', contrast: '중단점에 도달했다는 사실만으로 그 줄이 근본 원인이라는 뜻은 아닙니다.' },
    { term: 'Frame · 호출 프레임', meaning: '현재 함수 호출 한 번에 대응하는 인자, 지역 변수, 복귀 위치 같은 실행 문맥입니다.', contrast: 'source 파일 전체나 process 전체 memory와 같은 범위가 아닙니다.' },
    { term: 'Backtrace · 호출 역추적', meaning: '현재 frame에 이르기까지 이어진 함수 호출 순서를 보여 주는 관찰 결과입니다.', contrast: '호출 순서는 보여 주지만 각 호출이 안전했는지 자동 판정하지 않습니다.' },
    { term: 'Register · 레지스터', meaning: 'CPU가 현재 주소·인자·중간값·반환값을 보관하는 작은 실행 상태입니다.', contrast: 'symbol과 build 정보가 없으면 같은 bit 값의 source 의미를 단독으로 확정하기 어렵습니다.' },
    { term: 'Symbol · 심볼', meaning: 'machine address를 함수·변수·source line 이름과 연결하는 build metadata입니다.', contrast: '심볼 이름이 있다고 해서 보고 있는 binary가 공식 배포물과 같은 provenance라는 뜻은 아닙니다.' },
  ],
  stages: [
    { label: '관찰 대상 고정', actor: '학습자·build 기록', input: '허가된 로컬 실행 파일, source revision, symbol, artifact hash', action: '어떤 byte의 program을 어떤 source와 비교하는지 먼저 고정합니다.', output: '식별 가능한 관찰 대상' },
    { label: '정상 기준선 실행', actor: 'GDB·정상 fixture', input: '정상 입력과 예상 출력', action: '중단점, 호출 순서, 핵심 변수, 반환값을 같은 시점에 기록합니다.', output: '비교 가능한 정상 state sequence' },
    { label: '한 조건만 변경', actor: 'GDB·오류 fixture', input: '기준선에서 한 조건만 바꾼 고정 입력', action: '같은 중단점과 명령 순서로 다시 실행합니다.', output: '정상과 직접 대조할 오류 state sequence' },
    { label: '첫 차이 표시', actor: '학습자', input: '두 state sequence', action: '값·branch·return 중 처음 달라진 지점과 실제 효과가 생긴 지점을 따로 표시합니다.', output: '관찰 사실과 원인 가설' },
    { label: '별도 근거 대조', actor: 'source·patch·provenance 기록', input: '디버거 관찰, source line, 공식 patch, artifact 출처', action: '각 결론이 어느 근거로 지지되는지 연결하고 확인 못 한 범위를 남깁니다.', output: '재시험 가능한 제한된 결론' },
  ],
  trustBoundary: {
    before: '디버거가 파일을 열고 함수 이름을 표시했다는 사실은 그 artifact가 안전하거나 공식 배포물과 동일하다는 증명이 아닙니다.',
    decision: '실행 상태는 GDB로, source 의미는 revision과 symbol로, 공급망 신뢰는 signature·digest·vendor advisory·build provenance로 각각 확인해야 합니다.',
    after: '같은 artifact와 fixture에서 관찰한 line·value·branch·return만 사실로 기록합니다.',
    failure: '경로·hash·symbol을 고정하지 않으면 서로 다른 binary의 상태를 비교하거나, 오염된 artifact의 일관된 동작을 정상으로 오판할 수 있습니다.',
  },
}

const debuggerTrace = {
  id: 'w9-debugger-flow-local-trace',
  type: 'code-trace',
  title: '정상값과 범위 밖 값을 같은 중단점에서 비교하는 합성 GDB 전사',
  evidenceKind: 'educational-model',
  language: 'gdb',
  description: '허가된 `training_reader`라는 가상 로컬 프로그램의 고정 전사입니다. 실제 XZ source, backdoor, service, memory address를 재현하지 않습니다.',
  code: '1  (gdb) break accept_level\n2  (gdb) run fixtures/normal.txt\n3  Breakpoint: accept_level (raw=3)\n4  (gdb) next              # raw <= 5 는 true\n5  (gdb) finish            # return value = 3\n6  (gdb) run fixtures/out-of-range.txt\n7  Breakpoint: accept_level (raw=8)\n8  (gdb) next              # raw <= 5 는 false\n9  (gdb) backtrace         # parse_record → accept_level\n10 (gdb) finish            # return value = -1',
  trace: [
    { lines: '1–2', before: 'artifact path·hash와 정상 fixture가 기록되어 있고 process는 시작 전입니다.', action: '`accept_level` 함수에 중단점을 정하고 정상 fixture로 실행합니다.', after: '같은 함수 경계에서 상태를 읽을 준비가 됩니다.' },
    { lines: '3–5', before: '`raw=3`이고 허용 범위는 0부터 5입니다.', action: '조건 분기와 함수 반환까지 한 단계씩 관찰합니다.', after: '정상 경로는 값 3을 반환한다는 기준선이 생깁니다.' },
    { lines: '6–8', before: 'artifact·명령 순서는 같고 fixture의 level만 8로 바뀝니다.', action: '같은 중단점에서 `raw=8`과 false branch를 관찰합니다.', after: '두 실행의 첫 state 차이는 `raw`이고 branch 결과도 달라집니다.' },
    { lines: '9–10', before: '범위 밖 값이 안전한 오류 branch에 있습니다.', action: '호출 순서를 기록하고 함수가 `-1`을 반환할 때까지 실행합니다.', after: '실제 효과는 memory 변경이 아니라 안전한 오류 반환이라는 제한된 결론을 남깁니다.' },
  ],
}

const xzPatchAnalysis = {
  id: 'w9-debugger-flow-xz-cleanup-patch',
  type: 'patch-analysis',
  title: '공식 cleanup commit: 공통 resolver macro와 의심 test artifact를 제거하다',
  evidenceKind: 'official-patch',
  source: xzCleanupPatch,
  language: 'C',
  description: 'XZ Utils commit `e93e13c`의 `crc_common.h`와 `crc32_fast.c` 실제 diff에서 관련 부분만 옮긴 것입니다. 이 diff는 의심 test artifact 삭제와 여덟 commit revert를 포함하지만, 오염된 release tarball을 만들 때 삽입된 전체 trigger 경로를 뜻하지는 않습니다.',
  before: {
    label: '정리 전 · 실제 저장소 발췌',
    code: '// src/liblzma/check/crc_common.h\n#define lzma_resolver_attributes \\\n    __attribute__((__no_profile_instrument_function__)) \\\n    no_omit_frame_pointer\n\n// src/liblzma/check/crc32_fast.c\nlzma_resolver_attributes\nstatic crc32_func_type\ncrc32_resolve(void)',
  },
  after: {
    label: '정리 후 · 실제 저장소 발췌',
    code: '// src/liblzma/check/crc32_fast.c\n#ifdef CRC_USE_IFUNC\n__attribute__((__no_profile_instrument_function__))\n#endif\nstatic crc32_func_type\ncrc32_resolve(void)',
  },
  changes: [
    '`crc_common.h`의 `lzma_resolver_attributes`와 `no_omit_frame_pointer` 공통 macro 묶음을 삭제했습니다.',
    '`crc32_fast.c`와 `crc64_fast.c`의 resolver에는 필요한 attribute 하나만 `CRC_USE_IFUNC` 조건 아래 직접 남겼습니다.',
    '같은 cleanup commit은 executable payload가 들어 있었다고 공식 message가 밝힌 binary test file을 제거하고, 관련 여덟 commit을 다른 변경 없이 되돌렸습니다.',
    '공식 5.6.2 release는 CVE-2024-3094 backdoor 제거를 첫 변경점으로 기록합니다. 같은 release의 IFUNC 지원 제거는 복잡도·성능 판단이며 보안 때문에 한 조치가 아니라고 별도로 명시합니다.',
  ],
  regressionTests: [
    { case: '공식 cleanup 범위 대조', expected: 'commit에 적힌 여덟 변경과 의심 test artifact가 제거됨', reason: '실제 upstream이 무엇을 되돌렸는지 commit message와 diff로 확인합니다.' },
    { case: '과정 제안 · Git tag와 source archive 비교', expected: '허용된 release 파일 목록·내용 차이가 설명되고 승인되지 않은 build 삽입이 없음', reason: '이 사건에서는 Git 저장소와 만들어진 release tarball의 차이가 핵심 신뢰 경계였습니다.' },
    { case: '과정 제안 · signature·digest·vendor package', expected: '조직이 승인한 signer·digest·배포판 advisory와 모두 일치함', reason: '파일명이나 debugger 출력 대신 artifact provenance를 독립적으로 검증합니다.' },
    { case: '과정 제안 · 정상 압축·해제 fixture', expected: '알려진 입력이 clean build에서 같은 bytes와 종료 상태를 만듦', reason: '보안 정리 뒤에도 제품의 정상 기능이 유지되는지 확인합니다.' },
    { case: '과정 제안 · 실제 link graph', expected: '배포 process가 의도한 clean liblzma를 load함', reason: '패키지만 교체하고 오래된 library를 계속 쓰는 상태를 놓치지 않습니다.' },
  ],
  limitation: '공식 project 기록은 작은 trigger code가 source package 생성 때 build system에 삽입됐고 그 code는 Git 저장소에 없었다고 설명합니다. 따라서 위 C diff를 “전체 backdoor source”나 단독 root-cause patch로 부르지 않습니다. cleanup commit 자체에는 전용 보안 회귀 test가 추가되지 않았으며, `과정 제안` 항목은 공급망 재검증 설계이지 upstream test라고 주장하지 않습니다. trigger·payload·서비스 activation 절차는 재구성하지 않습니다.',
}

const xzImpactMap = {
  id: 'w9-debugger-flow-xz-impact',
  type: 'impact-map',
  title: '오염된 release artifact와 실제 배포 경로가 모두 이어질 때 영향이 성립한다',
  intro: 'CVE-2024-3094는 일반 사용자의 압축 입력 검증 실패가 아니라 release 공급망 compromise입니다. upstream 5.6.0·5.6.1 tarball, downstream build 조건, library를 불러오는 service integration을 한 단계씩 확인해야 합니다.',
  dimensions: [
    { label: '기밀성', impact: '특정 통합 환경에서 악성 동작이 활성화되면 service가 접근 가능한 정보의 노출 가능성이 큽니다.', condition: '영향 tarball에서 build된 binary가 사용되고 공개 기록의 architecture·build·link·service 조건까지 맞아야 하며, 설치 사실만으로 실제 노출을 확정하지 않습니다.' },
    { label: '무결성', impact: '신뢰된 library와 service 경계에서 승인되지 않은 동작이 실행되면 system state의 높은 무결성 영향이 가능합니다.', condition: '오염 artifact가 실제 runtime dependency에 들어가고 activation path에 도달해야 합니다.' },
    { label: '가용성', impact: '악성 library 동작과 추가 CPU 사용은 service 품질·가용성에 영향을 줄 수 있습니다.', condition: '공식 cleanup commit이 언급한 CPU 증가와 조직의 실제 service 지표를 대조해야 하며 모든 설치에서 같은 정도라고 일반화하지 않습니다.' },
  ],
  attackerControls: [
    '사건 당시 compromised maintainer가 source package 생성 과정에 넣은 승인되지 않은 내용',
    '5.6.0·5.6.1 release tarball에 포함된 관련 test artifact와 build-time 경로',
    '오염 release를 정상 release처럼 배포하려 한 공급망 단계',
  ],
  notControlled: [
    '각 배포판이 5.6.0·5.6.1을 실제 package로 채택했는지와 vendor backport 상태',
    '대상 architecture, compiler·link option, build environment가 activation 조건과 맞는지',
    '어떤 service process가 해당 liblzma binary를 runtime에 load하는지',
    '조직의 package allowlist, signature gate, EDR·service isolation이 실제로 적용되는지',
  ],
  access: {
    authentication: '공급망 삽입 자체는 제품 최종 사용자의 로그인이나 application 권한 검사를 통과하는 입력 경로가 아닙니다. 후속 효과는 library를 load한 service의 권한·격리에 제한됩니다.',
    interaction: '일반 사용자의 클릭을 전제로 한 사건이 아닙니다. downstream maintainer가 영향을 받은 artifact를 build·package·deploy하는 과정이 필요했습니다.',
    network: '오염 artifact 유입과 최종 network-facing service 효과를 구분합니다. 공개 기록의 특정 통합 조건을 확인하지 않고 “xz가 있으면 곧바로 원격 노출”이라고 결론 내리지 않습니다.',
    defaultExposure: '공식 project 기록상 영향 대상은 5.6.0·5.6.1 release tarball입니다. Git repository의 같은 시점 파일만 가져온 build나 다른 version까지 자동으로 같은 상태라고 볼 수 없습니다.',
    protections: '영향 artifact를 제거하고 조직·배포판이 확인한 clean package로 교체한 뒤, signature·digest·source-to-archive 차이·실제 loaded library·service 정상 동작을 다시 확인합니다. debugger 한 번 실행한 결과는 이 검증을 대체하지 않습니다.',
  },
}

const bytesMechanism = {
  id: 'w9-bytes-io-mechanism',
  type: 'mechanism',
  title: '텍스트는 인코딩과 framing을 거쳐 parser가 읽는 byte가 된다',
  situation: '사람은 화면에서 “가”나 “blue”라는 글자를 보지만 process 입출력은 정해진 encoding의 byte sequence를 주고받습니다. 같은 글자 수라도 byte 수가 다를 수 있고 newline·NUL·길이 field가 record 경계를 결정합니다.',
  terms: [
    { term: 'Text · 텍스트', meaning: '문자와 그 순서라는 추상적인 값입니다.', contrast: '저장·전송되는 구체적인 byte 표현과는 구분합니다.' },
    { term: 'Encoding · 인코딩', meaning: '문자를 UTF-8 같은 규칙으로 byte sequence에 대응시키는 방법입니다.', contrast: '암호화나 접근 통제가 아니며 문자의 표현 규칙입니다.' },
    { term: 'Byte · 바이트', meaning: '보통 8 bit로 이루어져 파일·memory·pipe에서 길이를 세는 기본 단위입니다.', contrast: '문자 하나가 항상 byte 하나인 것은 아닙니다.' },
    { term: 'Delimiter · 구분자', meaning: 'newline처럼 한 record의 끝을 parser에 알리는 약속된 byte입니다.', contrast: '화면에 보이지 않아도 입력 길이와 parser state를 바꿀 수 있습니다.' },
    { term: 'Framing · 프레이밍', meaning: '길이 field나 delimiter로 연속된 byte stream을 record 단위로 나누는 규칙입니다.', contrast: 'encoding이 문자 표현을 정하는 일과 record 경계를 정하는 일은 다릅니다.' },
  ],
  stages: [
    { label: '문자 선택', actor: '고정 fixture', input: 'Unicode text와 기대 의미', action: '허가된 문자 집합과 최대 문자 수를 정합니다.', output: '검증할 text value' },
    { label: '인코딩', actor: 'encoder', input: 'text와 UTF-8 규칙', action: '각 문자를 byte sequence로 변환하고 실패를 처리합니다.', output: '길이가 측정 가능한 bytes' },
    { label: 'record 구성', actor: 'local driver', input: 'bytes와 newline delimiter', action: 'protocol이 기대하는 끝 표시를 한 번 붙입니다.', output: '한 개의 framed record' },
    { label: '경계 검사', actor: 'parser', input: '수신 bytes와 최대 byte length', action: 'delimiter·byte length·허용 encoding을 확인하고 실패하면 효과 전에 거절합니다.', output: '검증된 record body 또는 오류' },
    { label: '해석·효과', actor: 'application', input: '검증된 body', action: 'UTF-8 text로 decode한 뒤 allowlist 같은 기능 규칙을 적용합니다.', output: '정상 값 또는 안전한 기능 오류' },
  ],
  trustBoundary: {
    before: '화면의 글자 수와 process가 받은 byte 수·delimiter 상태는 같다고 가정할 수 없습니다.',
    decision: 'parser가 decode 전에 byte length와 framing을, decode 뒤에는 문자·기능 규칙을 각 단계에서 검사합니다.',
    after: '검증된 한 record만 application 의미로 해석됩니다.',
    failure: 'encoding, byte length, delimiter를 섞어 세면 record가 잘리거나 합쳐지고 parser와 driver가 입력 끝을 다르게 판단할 수 있습니다.',
  },
}

const bytesTrace = {
  id: 'w9-bytes-io-encoding-trace',
  type: 'code-trace',
  title: '한 글자가 UTF-8 세 byte와 newline 한 byte가 되는 과정',
  evidenceKind: 'educational-model',
  language: 'python',
  description: '고정 문자열을 local memory에서 변환하는 교육용 예제입니다. socket이나 외부 process에 데이터를 보내지 않습니다.',
  code: '1  text = "가"\n2  body = text.encode("utf-8")\n3  assert len(text) == 1\n4  assert len(body) == 3\n5  record = body + b"\\n"\n6  assert len(record) == 4\n7  parsed = record.removesuffix(b"\\n").decode("utf-8")\n8  assert parsed == text',
  trace: [
    { lines: '1–2', before: '`text`는 Unicode 문자 한 개이고 bytes는 아직 없습니다.', action: 'UTF-8 encoder가 문자를 고정 byte sequence로 바꿉니다.', after: '`body`는 세 byte이며 원래 text와 표현 층이 분리됩니다.' },
    { lines: '3–4', before: '문자 길이와 byte 길이를 각각 셀 수 있습니다.', action: '두 길이를 별도 assertion으로 확인합니다.', after: '문자 1개와 byte 3개가 동시에 참임을 기록합니다.' },
    { lines: '5–6', before: 'body에는 record 끝 표시가 없습니다.', action: 'newline 한 byte를 붙이고 전체 byte length를 확인합니다.', after: 'parser에 전달할 네 byte record가 됩니다.' },
    { lines: '7–8', before: 'framed bytes의 끝에 newline이 있습니다.', action: 'delimiter를 제거한 뒤 UTF-8로 decode하고 원문과 비교합니다.', after: 'text → bytes → framed record → text 상태 전이가 같은 값으로 닫힙니다.' },
  ],
}

const localDriverMechanism = {
  id: 'w9-local-driver-mechanism',
  type: 'mechanism',
  title: '재현 가능한 local driver는 실행 조건과 관찰 결과를 함께 고정한다',
  situation: '사람이 매번 다른 속도와 순서로 입력하면 두 실행의 출력 차이가 program 때문인지 실행 조건 때문인지 구분하기 어렵습니다. local driver는 승인된 교육 process에 같은 bytes를 같은 순서로 보내고 stdout·stderr·exit status를 분리해 남깁니다.',
  terms: [
    { term: 'Fixture · 픽스처', meaning: '시험마다 같은 시작 상태를 만들기 위해 미리 정한 파일·입력·설정 묶음입니다.', contrast: '운영 사용자 data나 그때그때 고른 임의 입력이 아닙니다.' },
    { term: 'Deterministic · 결정적', meaning: '같은 artifact와 조건이면 관찰 가능한 결과가 같도록 time·randomness·input order를 통제한 상태입니다.', contrast: '모든 OS scheduling이 완전히 같다는 뜻은 아닙니다.' },
    { term: 'stdout / stderr', meaning: '정상 결과와 진단·오류를 각각 전달할 수 있는 두 output stream입니다.', contrast: '둘을 합치면 정상 결과와 실패 원인을 구분하기 어려워질 수 있습니다.' },
    { term: 'Exit Status · 종료 상태', meaning: 'process가 성공·실패 종류를 parent process에 전달하는 작은 정수 결과입니다.', contrast: '화면에 text가 출력됐는지와 별개의 관찰 값입니다.' },
    { term: 'Timeout · 시간 제한', meaning: '예상한 시간 안에 output이나 종료가 없을 때 무한 대기 대신 관찰을 중단하는 경계입니다.', contrast: '느린 동작의 근본 원인을 자동으로 설명하는 기능은 아닙니다.' },
  ],
  stages: [
    { label: '실행 계약 기록', actor: 'driver manifest', input: 'artifact path·hash, argv, 환경, fixture ID', action: '비교할 process의 모든 시작 조건을 기록합니다.', output: '재실행 가능한 manifest' },
    { label: '로컬 process 시작', actor: 'pwntools `process`', input: '고정 argv와 최소 환경', action: 'network 연결 없이 child process와 local pipe를 만듭니다.', output: 'stdin·stdout을 가진 local tube' },
    { label: 'prompt 동기화', actor: 'driver', input: '예상 prompt bytes와 timeout', action: '정해진 prompt가 올 때까지 읽고 다르면 즉시 실패합니다.', output: '입력을 보내도 되는 확정 state' },
    { label: '고정 record 전송', actor: 'driver', input: 'fixture bytes와 newline 규칙', action: '기록된 순서대로 한 record만 보냅니다.', output: 'process parser에 전달된 deterministic input' },
    { label: '결과 분리·판정', actor: 'driver·학습자', input: 'stdout, stderr, exit status, elapsed time', action: 'raw evidence를 저장하고 expected value와 비교한 뒤 의미는 별도로 설명합니다.', output: '재시험 가능한 관찰 기록' },
  ],
  trustBoundary: {
    before: '자동화 script가 실행됐다는 사실만으로 대상 경로, binary version, input order가 의도와 같다고 볼 수 없습니다.',
    decision: 'driver는 실행 전에 artifact hash·argv·fixture를, 실행 중에는 prompt·timeout을, 종료 뒤에는 output·exit status를 검증합니다.',
    after: '기록된 로컬 process와 fixture 조합에 대해서만 결과를 재현할 수 있습니다.',
    failure: 'prompt를 확인하지 않고 bytes를 보내거나 timeout·exit status를 버리면 입력 state가 어긋난 실패를 program bug로 오판할 수 있습니다.',
  },
}

const localDriverTrace = {
  id: 'w9-local-driver-pwntools-trace',
  type: 'code-trace',
  title: '고정 prompt·입력·종료 상태를 기록하는 local-only driver',
  evidenceKind: 'educational-model',
  language: 'python',
  description: '교육용 `training_reader` process의 정상 fixture만 자동화합니다. `remote()`나 host·port, 실제 credential, exploit data는 포함하지 않습니다.',
  code: '1  from pwn import process\n2  artifact = "./training_reader"\n3  fixture = b"blue"\n4  io = process([artifact, "--fixture", "normal"], env={"LANG": "C"})\n5  prompt = io.recvuntil(b"> ", timeout=1)\n6  assert prompt == b"color> "\n7  io.sendline(fixture)\n8  result = io.recvall(timeout=1)\n9  status = io.poll(block=True)\n10 assert result == b"accepted: blue\\n" and status == 0',
  trace: [
    { lines: '1–4', before: 'artifact·fixture·환경이 아직 process state에 적용되지 않았습니다.', action: '고정된 argv와 최소 환경으로 local child process를 시작합니다.', after: 'network 없이 driver와 교육 process 사이 local pipe가 생깁니다.' },
    { lines: '5–6', before: 'process가 어느 입력 단계인지 아직 확정할 수 없습니다.', action: '1초 timeout 안에 정확한 prompt bytes를 읽고 비교합니다.', after: '정상 prompt일 때만 입력 단계로 진행합니다.' },
    { lines: '7', before: 'fixture는 newline 없는 `b"blue"` 네 byte입니다.', action: '`sendline`이 fixture 뒤에 newline을 한 번 붙여 전달합니다.', after: 'parser는 한 개의 완성된 record를 받습니다.' },
    { lines: '8–10', before: 'process가 결과를 만들고 종료하는 중입니다.', action: 'output과 exit status를 따로 수집해 둘 다 expected value와 비교합니다.', after: '정상 text만 우연히 보인 상태가 아니라 output·종료 계약이 모두 확인됩니다.' },
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
    title: '공급망 사례: XZ Utils release tarball과 Git source의 불일치',
    productRole: 'XZ Utils는 `.xz`·`.lzma` 형식의 압축·해제를 제공하고 `liblzma` library를 downstream program이 link해 사용하는 기반 software입니다.',
    weakness: '악성 release artifact를 통한 software supply-chain compromise · CWE-506 계열',
    affectedVersions: 'upstream XZ Utils 5.6.0·5.6.1 release tarball. 실제 downstream 영향은 배포판 package, build·architecture·link·service integration 조건을 별도로 확인',
    fixedVersions: 'upstream 5.6.2 clean release 또는 배포판이 명시한 known-clean package. 사건 대응 당시 안전한 5.4.x 복귀 지침도 각 vendor advisory로 확인',
    cause: 'XZ 프로젝트의 공식 사건 정리는 5.6.0·5.6.1 release tarball에 backdoor가 포함됐고, 활성화에 필요한 작은 trigger code는 source package 생성 때 build system에 삽입되어 Git 저장소에는 없었다고 설명합니다. 따라서 “Git의 특정 C 한 줄만 고치면 끝난 일반 구현 버그”로 설명하면 사실과 다릅니다.',
    condition: '영향 release tarball에서 만들어진 artifact가 downstream package에 들어가고 공개된 build·architecture·link·service 조건까지 이어져야 후속 효과가 성립합니다. 이 수업은 악성 artifact, trigger, payload, backdoor activation, 외부 연결을 재현하지 않고 version·signature·digest·provenance와 clean artifact만 대조합니다.',
    patch: '공식 cleanup commit `e93e13c`는 관련 여덟 commit을 되돌리고 의심 test artifact·resolver attribute 변경을 제거했습니다. 공식 5.6.2 release는 backdoor 제거를 기록합니다. 운영 대응은 5.6.0·5.6.1 artifact 제거, vendor가 확인한 clean package 적용, 실제 loaded library와 source-to-archive provenance 재검증입니다.',
    followOn: 'Git 저장소 diff를 전체 tarball trigger라고 보거나 다른 debugger·memory 사례를 이 사건의 우회로 연결할 공식 근거는 검증되지 않아 미채택입니다.',
    facts: [
      '파일명, version 문자열, symbol, 일관된 debugger output은 artifact provenance를 단독으로 증명하지 않습니다.',
      '공식 project 기록은 영향을 받은 release tarball과 Git repository source를 명시적으로 구분합니다.',
      '5.6.2의 IFUNC 제거는 release note가 보안 목적이 아니라고 밝히므로 CVE root fix와 같은 뜻으로 과장하지 않습니다.',
      '로컬 학습은 정상 fixture·clean artifact metadata·공식 patch만 사용하며 backdoor 동작을 재구성하지 않습니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichDebugger(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichXzCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    debuggerMechanism,
    debuggerTrace,
    cve,
    xzPatchAnalysis,
    xzImpactMap,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [gdbManual, xzIncident, xzCleanupPatch, xzCleanRelease, nvdXz, redHatXz])
    : block)
}

function enrichWithBlocks(blocks, additions, sources) {
  const enriched = addAfter(blocks, (block) => block.type === 'explanation', additions)
  return enriched.map((block) => block.type === 'sources' ? appendUniqueSources(block, sources) : block)
}

export function buildWeek8DebuggerGuide(modules) {
  const enrichers = {
    'w9-debugger-flow': enrichDebugger,
    'w9-bytes-io': (blocks) => enrichWithBlocks(blocks, [bytesMechanism, bytesTrace], [pythonBytesDocs, pwntoolsTubeDocs]),
    'w9-local-driver': (blocks) => enrichWithBlocks(blocks, [localDriverMechanism, localDriverTrace], [pwntoolsTubeDocs, gdbManual]),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
