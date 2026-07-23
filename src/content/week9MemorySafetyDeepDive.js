const sudoProject = {
  label: 'Sudo · project introduction',
  url: 'https://www.sudo.ws/about/intro/',
  note: '정책에 따라 다른 사용자 권한으로 명령을 실행하게 하는 Sudo의 공식 역할을 확인합니다.',
}

const sudoAdvisory = {
  label: 'Sudo · CVE-2021-3156 공식 권고',
  url: 'https://www.sudo.ws/security/advisories/unescape_overflow/',
  note: '영향 release와 수정 release, local privilege boundary를 설명한 프로젝트 공식 권고입니다.',
}

const sudoOverflowPatch = {
  label: 'Sudo · user_args overflow fix commit 1f86385',
  url: 'https://github.com/sudo-project/sudo/commit/1f8638577d0c80a4ff864a2aad80a0d95488e9a8',
  note: '`MODE_RUN`, NUL, destination capacity를 검사한 CVE-2021-3156 실제 source diff입니다.',
}

const sudoFlagPatch = {
  label: 'Sudo · sudoedit valid flags fix commit b301b46',
  url: 'https://github.com/sudo-project/sudo/commit/b301b46b79c6e2a76d530fa36d05992e74952ee8',
  note: 'sudoedit 진입 경로의 허용 mode flag를 좁힌 실제 수정 일부입니다.',
}

const sudoPluginPatch = {
  label: 'Sudo · plugin flag consistency fix commit c4d3840',
  url: 'https://github.com/sudo-project/sudo/commit/c4d384082fdbc8406cf19e08d05db4cded920a55',
  note: 'front-end와 sudoers plugin의 sudoedit flag 검사를 맞춘 실제 수정 일부입니다.',
}

const nvdSudo = {
  label: 'NVD · CVE-2021-3156',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-3156',
  note: 'off-by-one heap overflow, 로컬 저권한 조건, C·I·A 영향을 확인합니다.',
}

const cwe787 = {
  label: 'MITRE CWE-787 · Out-of-bounds Write',
  url: 'https://cwe.mitre.org/data/definitions/787.html',
  note: '할당된 memory boundary 밖 쓰기의 정의와 방어 원칙입니다.',
}

const gccInstrumentation = {
  label: 'GCC · Instrumentation Options',
  url: 'https://gcc.gnu.org/onlinedocs/gcc/Instrumentation-Options.html',
  note: '`-fstack-protector-strong`, sanitizer 등 compiler instrumentation의 공식 설명입니다.',
}

const gccLinkOptions = {
  label: 'GCC · Link Options',
  url: 'https://gcc.gnu.org/onlinedocs/gcc/Link-Options.html',
  note: 'PIE executable을 만드는 compile·link option의 공식 설명입니다.',
}

const linuxAslr = {
  label: 'Linux kernel · randomize_va_space',
  url: 'https://docs.kernel.org/admin-guide/sysctl/kernel.html#randomize-va-space',
  note: 'process memory layout randomization 설정과 적용 범위를 확인합니다.',
}

const boundsMechanism = {
  id: 'w10-bounds-capacity-mechanism',
  type: 'mechanism',
  title: '복사 전에 데이터 길이·종료 byte·목적지 용량을 하나의 계약으로 계산한다',
  situation: '고정 크기 배열이나 동적 buffer에 text를 저장하려면 데이터 byte뿐 아니라 문자열 끝을 나타내는 NUL byte까지 들어갈 공간이 필요합니다. 쓰기를 시작한 뒤 넘쳤는지 보는 대신, 첫 write 전에 필요한 전체 크기를 계산해 안전 경로와 오류 경로를 나눠야 합니다.',
  terms: [
    { term: 'Buffer · 버퍼', meaning: '연속된 byte를 담도록 할당된 memory 영역입니다.', contrast: '변수 이름만으로 실제 capacity나 현재 logical length를 알 수는 없습니다.' },
    { term: 'Length · 길이', meaning: '현재 유효한 data가 차지하는 byte 수입니다.', contrast: '할당된 전체 byte 수인 capacity와 구분합니다.' },
    { term: 'Capacity · 용량', meaning: 'buffer에 합법적으로 접근할 수 있도록 할당된 총 byte 수입니다.', contrast: '마지막 유효 index는 capacity 그 자체가 아니라 `capacity - 1`입니다.' },
    { term: 'NUL Terminator · NUL 종료 byte', meaning: 'C 문자열 끝을 나타내는 값 0의 한 byte입니다.', contrast: '화면에 보이는 문자 수에는 포함되지 않지만 destination 공간에는 포함됩니다.' },
    { term: 'Off-by-one · 한 칸 경계 오류', meaning: '경계값을 `<` 대신 `<=`로 처리하거나 종료 byte 공간을 빠뜨려 정확히 한 element 밖에 접근하는 오류입니다.', contrast: '영향이 한 byte라고 해서 결과가 항상 작거나 무해하다는 뜻은 아닙니다.' },
  ],
  stages: [
    { label: '목적지 계약 수신', actor: 'callee API', input: 'destination pointer와 실제 capacity', action: 'pointer와 capacity를 같은 함수 경계에서 받고 0 capacity를 먼저 거절합니다.', output: '유효 index 범위 `0..capacity-1`' },
    { label: 'source 길이 제한 측정', actor: 'bounded length check', input: 'source pointer와 허용 최대치', action: '무제한 scan 대신 capacity 범위 안에서 NUL을 찾거나 명시적 byte length를 받습니다.', output: '검증 후보 length 또는 오류' },
    { label: '필요 크기 계산', actor: 'size arithmetic', input: 'data length와 종료 규칙', action: 'integer overflow를 피하면서 `required = length + 1`을 계산합니다.', output: 'data와 NUL을 포함한 required bytes' },
    { label: '첫 write 전 gate', actor: 'copy function', input: 'required와 capacity', action: '`required <= capacity`일 때만 write 경로로 가고 아니면 destination을 바꾸지 않고 오류를 반환합니다.', output: '검증된 범위 또는 효과 없는 실패' },
    { label: '범위 안 복사·종료', actor: 'copy function', input: '검증된 length와 destination', action: 'data를 index `0..length-1`에 쓰고 NUL을 index `length`에 씁니다.', output: 'capacity 안에서 끝나는 C string' },
  ],
  trustBoundary: {
    before: 'source pointer, 사용자 제공 length, destination pointer만으로 실제 readable·writable 범위가 보장되지는 않습니다.',
    decision: 'API가 source의 측정 범위, destination capacity, 종료 byte, size arithmetic을 write보다 먼저 검증해야 합니다.',
    after: '정상 경로는 검증된 byte 수만 쓰고 오류 경로는 destination state를 바꾸지 않습니다.',
    failure: 'data가 capacity와 정확히 같을 때 NUL 공간을 빠뜨리면 data copy는 끝나도 종료 write가 index `capacity`에서 처음 객체 밖 효과를 만듭니다.',
  },
}

const offByOneTrace = {
  id: 'w10-bounds-off-by-one-trace',
  type: 'code-trace',
  title: '8-byte marker에서 정확히 line 4가 객체 밖 첫 write가 되는 합성 예제',
  evidenceKind: 'educational-model',
  language: 'C',
  description: '실제 Sudo source가 아닌 `char dst[8]` 교육 모델입니다. 고정 marker의 경계 계산만 다루며 memory address, control-flow 전환, exploit data는 제공하지 않습니다.',
  code: '1  bool copy_tag(char dst[8], const char *src) {\n2      size_t length = strlen(src);\n3      memcpy(dst, src, length);\n4      dst[length] = \'\\0\';\n5      return true;\n6  }\n\nfixture: src = "ABCDEFGH"  // data length 8, dst capacity 8',
  trace: [
    { lines: '1–2', before: '`dst`의 유효 index는 0부터 7이고 source에는 고정 ASCII 8 byte와 그 뒤 NUL이 있습니다.', action: '`strlen`이 보이는 data byte만 세어 `length=8`을 만듭니다.', after: 'data length는 capacity와 같지만 종료 byte를 포함한 required size는 9입니다.' },
    { lines: '3', before: '아직 `length + 1 <= capacity` 검사가 없습니다.', action: '8 data byte를 `dst[0]..dst[7]`에 씁니다.', after: '이 fixture에서 line 3의 마지막 write는 객체 안이지만 NUL 공간은 남지 않습니다.' },
    { lines: '4', before: '`length=8`이고 마지막 유효 index는 7입니다.', action: '`dst[8]`에 NUL을 쓰려고 합니다.', after: '이 line이 객체 경계를 처음 벗어난 정확한 실패·효과 지점입니다. 뒤 memory의 의미나 영향은 이 모델로 확정하지 않습니다.' },
    { lines: '5', before: '함수 내부에는 오류 상태가 없고 destination 밖 write가 이미 시도됐습니다.', action: '무조건 `true`를 반환합니다.', after: '호출자는 실패를 알 수 없으므로 root fix는 line 3 이전의 capacity gate와 안전한 오류 반환이어야 합니다.' },
  ],
}

const sudoPatchAnalysis = {
  id: 'w10-bounds-sudo-official-patch',
  type: 'patch-analysis',
  title: '공식 commit: unescape mode·문자열 종료·매 write의 남은 용량을 함께 고치다',
  evidenceKind: 'official-patch',
  source: sudoOverflowPatch,
  language: 'C',
  description: 'Sudo commit `1f86385`의 `plugins/sudoers/sudoers.c` 실제 핵심 diff입니다. 실행 가능한 취약 command line은 제외하고 원인이 있던 조건·copy loop와 수정된 capacity gate만 발췌했습니다.',
  before: {
    label: '수정 전 · 실제 unescape loop 발췌',
    code: 'if (ISSET(sudo_mode, MODE_SHELL|MODE_LOGIN_SHELL)) {\n    ...\n    if (from[0] == \'\\\\\' &&\n        !isspace((unsigned char)from[1]))\n        from++;\n    *to++ = *from++;\n    ...\n}\n*--to = \'\\0\';',
  },
  after: {
    label: '수정 후 · 실제 조건과 write gate',
    code: 'if (ISSET(sudo_mode, MODE_SHELL|MODE_LOGIN_SHELL) &&\n    ISSET(sudo_mode, MODE_RUN)) {\n    ...\n    if (from[0] == \'\\\\\' && from[1] != \'\\0\' &&\n        !isspace((unsigned char)from[1])) {\n        from++;\n    }\n    if (size - (to - user_args) < 1)\n        return NOT_FOUND_ERROR;\n    *to++ = *from++;\n}',
  },
  changes: [
    'unescape 경로를 shell/login-shell flag만이 아니라 실제 command 실행을 뜻하는 `MODE_RUN`까지 만족할 때로 좁혔습니다.',
    '`from[1] != \'\\0\'`를 추가해 마지막 backslash 뒤가 문자열 끝이면 NUL을 건너뛰지 않게 했습니다.',
    '각 `*to++` data write와 argument 사이 공백 write 전에 `size - (to - user_args) < 1`을 검사하고, 공간이 없으면 `NOT_FOUND_ERROR`로 효과를 중단합니다.',
    '별도 공식 commits는 sudoedit 진입 경로의 허용 flag와 sudoers plugin 검사를 일치시켰습니다. 따라서 root fix는 단순히 buffer를 키우는 변경이 아니라 mode 계약·source 종료·destination capacity를 함께 복원한 수정입니다.',
  ],
  regressionTests: [
    { case: '정상 run mode와 일반 argument', expected: '기존 policy matching·logging용 문자열이 같은 의미로 만들어짐', reason: 'root fix가 지원되는 정상 command 흐름을 깨뜨리지 않았는지 확인합니다.' },
    { case: '문자열 끝 바로 앞의 backslash', expected: 'NUL을 건너뛰지 않고 허용 범위 밖 read·write 없이 종료', reason: '공식 diff가 추가한 `from[1] != \'\\0\'` gate를 경계 양쪽에서 확인합니다.' },
    { case: '`user_args`의 마지막 남은 한 byte', expected: '유효 write는 성공하고 다음 write 요구는 내부 오류로 안전 종료', reason: '`size - (to - user_args) < 1`의 off-by-one 동작을 확인합니다.' },
    { case: 'sudoedit·shell flag 조합', expected: '실제 `MODE_RUN`이 아니면 unescape loop에 진입하지 않음', reason: 'front-end와 policy plugin의 state 계약이 같은지 검증합니다.' },
    { case: '수정 release 정상 기능', expected: '1.8.32·1.9.5p2 또는 vendor backport에서 승인된 sudo·sudoedit 동작 유지', reason: 'source 조건 수정과 배포 package 적용을 모두 확인합니다.' },
  ],
  limitation: 'commit `1f86385`는 한 C 파일의 실제 수정이지만 전용 test file을 같은 commit에서 추가하지 않았습니다. 위 행은 diff에서 도출한 과정용 회귀 기준이며 upstream test 이름이라고 주장하지 않습니다. 전체 CVE 수정에는 `b301b46`, `c4d3840` 등 mode·flag 일관성 commits와 vendor backport가 포함될 수 있습니다. 실제 argument payload·heap layout·권한 상승 절차는 재현하지 않습니다.',
}

const sudoImpact = {
  id: 'w10-bounds-sudo-impact',
  type: 'impact-map',
  title: '객체 밖 한 byte 관찰과 root 권한 영향 사이에는 여러 성립 조건이 있다',
  intro: 'NVD는 CVE-2021-3156을 AV:L, PR:L, UI:N이며 C·I·A 영향이 높은 취약점으로 평가합니다. 그러나 합성 8-byte code의 out-of-bounds write만으로 실제 Sudo의 권한 상승 성공을 증명할 수는 없습니다.',
  dimensions: [
    { label: '기밀성', impact: '실제 root 권한 상승이 성공하면 root-only file과 credential에 접근할 수 있어 높은 영향입니다.', condition: '영향 Sudo package, privileged 실행 경계, 로컬 저권한 code 실행, 실제 exploitation 성공이 모두 필요합니다.' },
    { label: '무결성', impact: 'root 권한으로 system file·설정·계정 상태를 변경할 수 있어 높은 영향입니다.', condition: '단순 crash나 한 byte write 관찰이 아니라 privilege boundary가 실제로 넘어가야 합니다.' },
    { label: '가용성', impact: 'privileged process 실패나 root 권한의 system 변경은 service 가용성을 크게 해칠 수 있습니다.', condition: 'OS 구성, service dependency, 후속 권한 사용에 따라 실제 범위가 달라집니다.' },
  ],
  attackerControls: [
    '취약 host의 자신의 local process에서 Sudo에 전달하는 command-line argument byte와 길이',
    '허용된 command-line option과 process 실행 시점',
  ],
  notControlled: [
    '설치된 Sudo version과 배포판 backport 상태',
    'Sudo binary의 setuid·file capability와 sudoers policy',
    'heap allocator·주변 object의 runtime layout',
    'compiler hardening, ASLR, MAC, endpoint monitoring의 실제 구성',
  ],
  access: {
    authentication: 'NVD의 PR:L은 먼저 host에서 저권한 사용자 또는 동등한 local code execution 권한이 필요하다는 뜻입니다. Sudo password 인증 성공을 전제로 한 remote flaw가 아닙니다.',
    interaction: 'UI:N으로 다른 사용자가 링크를 열거나 승인 버튼을 누를 필요는 없습니다.',
    network: 'AV:L이며 network packet을 보내는 취약점이 아닙니다. 이 과정도 local 합성 fixture만 사용합니다.',
    defaultExposure: 'Sudo 설치는 흔하지만 영향 version, vendor backport, privileged file mode, local account 접근을 자산별로 확인해야 합니다.',
    protections: '1.8.32·1.9.5p2 이상 또는 vendor backport가 root fix입니다. 최소 local account, 좁은 sudoers policy, MAC, logging, Canary·NX·ASLR·PIE는 피해·탐지의 추가 층이지만 source fix를 대체하지 않습니다.',
  },
}

const mitigationsMechanism = {
  id: 'w10-mitigations-layer-mechanism',
  type: 'mechanism',
  title: 'Root fix와 compiler·loader·page permission 완화는 서로 다른 실패 단계에 작동한다',
  situation: '경계 검사를 고쳐도 다른 결함이나 배포 실수가 남을 수 있습니다. 그래서 build와 OS는 일부 stack 손상을 탐지하고, code 주소 예측을 어렵게 하고, data page 실행을 제한하는 여러 층을 더하지만 어느 것도 잘못된 write 자체를 올바른 write로 바꾸지는 않습니다.',
  terms: [
    { term: 'Stack Canary · 스택 카나리', meaning: '함수의 일부 stack object와 control data 사이에 검사용 값을 두고 반환 전 변조를 검사하는 compiler 방어입니다.', contrast: 'heap write나 모든 stack corruption을 막는 범용 경계 검사는 아닙니다.' },
    { term: 'NX · No-eXecute', meaning: 'memory page permission에서 data 영역의 instruction 실행을 제한하는 방어입니다.', contrast: '그 영역에 잘못된 data write가 일어나는 것 자체를 막지는 않습니다.' },
    { term: 'ASLR · Address Space Layout Randomization', meaning: 'process를 실행할 때 stack·heap·library 등의 배치 위치를 다양화하는 OS 방어입니다.', contrast: '주소가 절대 알려지지 않게 하거나 memory bug를 제거하는 기능은 아닙니다.' },
    { term: 'PIE · Position Independent Executable', meaning: 'main executable도 다양한 base address에 배치될 수 있게 만든 binary 형태입니다.', contrast: 'PIE로 build해야 main code가 ASLR의 해당 이점을 얻지만 source 경계 검사는 별도로 필요합니다.' },
    { term: 'Sanitizer · 새니타이저', meaning: '시험 build에 instrumentation을 넣어 out-of-bounds, use-after-free, undefined behavior 등을 더 잘 탐지하는 개발 도구입니다.', contrast: '일반적으로 production 권한·성능 환경을 그대로 대신하지 않으며 patch 그 자체도 아닙니다.' },
  ],
  stages: [
    { label: 'Source root fix', actor: '개발자·reviewer', input: '실패 line과 length·capacity 계약', action: '첫 write 전에 범위를 확인하고 오류가 효과 없이 끝나게 수정합니다.', output: 'out-of-bounds write가 없는 code path' },
    { label: 'Compiler instrumentation', actor: 'compiler', input: '수정 source와 hardening flags', action: '해당 함수에 canary·control-flow·검사 code를 적용할 대상을 선택합니다.', output: '추가 runtime check가 있는 object' },
    { label: 'PIE·link hardening', actor: 'linker', input: 'objects와 PIE·RELRO 설정', action: 'relocatable executable과 쓰기 제한 가능한 metadata를 만듭니다.', output: 'hardening 속성을 가진 binary' },
    { label: 'Loader·page policy', actor: 'OS loader·kernel', input: 'binary metadata와 ASLR·page permission 설정', action: '실행마다 허용 범위 안에서 layout을 정하고 data page 실행을 제한합니다.', output: 'runtime memory map' },
    { label: 'Runtime 실패·기록', actor: 'process·monitoring', input: '실행 중 검사가 감지한 손상 또는 안전한 application 거절', action: '정상 효과를 중단하고 build ID·오류 code·context를 최소 정보로 기록합니다.', output: '안전 종료·탐지 evidence' },
  ],
  trustBoundary: {
    before: '“Canary enabled”나 “PIE executable”이라는 build 속성만으로 모든 함수·모든 memory 영역·모든 bug가 보호된다고 볼 수 없습니다.',
    decision: 'source root fix, 실제 compiler·linker flags, produced binary properties, kernel setting, runtime identity를 각자 증거로 확인해야 합니다.',
    after: '근본 원인을 제거한 binary 위에 서로 다른 실패 경로를 줄이는 추가 방어층이 적용됩니다.',
    failure: '완화기법만 켜고 capacity bug를 남기면 잘못된 write는 여전히 발생하며 crash·탐지 여부나 영향 가능성만 달라질 수 있습니다.',
  },
}

const defenseManifestTrace = {
  id: 'w10-mitigations-defense-manifest-trace',
  type: 'code-trace',
  title: 'Code·build·권한·log·test 통제를 한 manifest에서 분리해 읽기',
  evidenceKind: 'educational-model',
  language: 'ini',
  description: '특정 Sudo build 설정이 아니라 `training_copy`라는 합성 local program의 방어 검토 manifest입니다. option 의미는 공식 GCC·Linux 문서에 별도 연결합니다.',
  code: '1  ROOT_FIX = required_bytes <= destination_capacity\n2  CFLAGS = -O2 -fstack-protector-strong -fPIE\n3  LDFLAGS = -pie -Wl,-z,relro,-z,now -Wl,-z,noexecstack\n4  TEST_CFLAGS = -fsanitize=address,undefined\n5  RUNTIME_IDENTITY = training-unprivileged\n6  LOG_FIELDS = build_id,error_code,fixture_id\n7  LOG_EXCLUDES = raw_input,memory_address,credential\n8  TEST_SET = empty,normal,capacity_minus_one,capacity,over_capacity',
  trace: [
    { lines: '1', before: '복사 함수가 write 경로로 갈지 결정해야 합니다.', action: 'data와 종료 byte를 포함한 필요 크기를 실제 capacity와 비교합니다.', after: '근본 원인은 source 경계에서 제거되고 초과 입력은 효과 없이 거절됩니다.' },
    { lines: '2–3', before: '수정 source가 build 입력입니다.', action: 'stack protector와 PIE·link hardening·non-executable-stack metadata를 요청합니다.', after: 'produced binary에 요청 속성이 실제 생겼는지 별도 검사할 대상이 됩니다.' },
    { lines: '4', before: '경계 test가 source-level assertion만 사용합니다.', action: 'test build에 sanitizer를 추가해 관찰하기 어려운 memory violation을 탐지합니다.', after: 'CI evidence가 강화되지만 production root fix나 권한 격리를 대신하지 않습니다.' },
    { lines: '5', before: 'process가 필요 이상의 OS 권한을 가질 수 있습니다.', action: '교육 program을 비특권 전용 identity로 실행합니다.', after: '다른 실패가 있어도 접근 가능한 system resource 범위가 줄어듭니다.' },
    { lines: '6–7', before: '오류 분석에는 상관관계 정보가 필요하지만 raw data는 민감할 수 있습니다.', action: 'build·오류·fixture ID만 기록하고 입력·주소·credential은 제외합니다.', after: '재시험 가능한 최소 log와 노출 제한을 함께 얻습니다.' },
    { lines: '8', before: '정상 한 건만으로 경계 양쪽을 알 수 없습니다.', action: '0, 정상, 마지막 유효값, 정확한 초과 시작점, 그 다음 값을 고정합니다.', after: 'root fix와 정상 기능을 함께 확인하는 boundary matrix가 됩니다.' },
  ],
}

const defenseLayers = {
  id: 'w10-mitigations-defense-layers',
  type: 'comparison',
  title: '방어층마다 막는 실패와 남는 한계가 다르다',
  columns: ['층', '검증할 실제 상태', '막거나 줄이는 것', '대체하지 못하는 것'],
  rows: [
    ['Code', '모든 destination write 전 `required <= capacity`', '객체 밖 write라는 근본 원인', 'OS 권한·공급망·운영 탐지'],
    ['Build·config', 'produced binary의 Canary·PIE·RELRO·NX 관련 속성', '일부 손상 탐지·layout 예측·쓰기/실행 경로', '빠진 source 경계 검사'],
    ['Permission', '실제 runtime identity, file capability, sudoers·MAC policy', '결함이 닿을 수 있는 resource·권한 범위', 'privileged program 자체의 취약 source'],
    ['Log·monitoring', 'build ID, 오류 code, fixture·request correlation, 민감값 제외', '반복 거절·비정상 종료의 탐지와 조사', '오류 발생 전 예방'],
    ['Test', '0·경계 전·경계·경계 후·정상 기능, sanitizer build', '회귀와 숨은 out-of-bounds 관찰', '배포된 artifact·runtime 설정 자동 보증'],
  ],
}

const retestMechanism = {
  id: 'w10-retest-matrix-mechanism',
  type: 'mechanism',
  title: '회귀 시험은 “초과 입력 거절”과 “정상 상태 보존”을 함께 증명한다',
  situation: '수정 후 program이 더 이상 crash하지 않아도 입력을 전부 거절하거나 destination을 일부 바꾼 뒤 오류를 반환한다면 좋은 수정이 아닙니다. 경계 양쪽 입력, 반환값, destination state, log, 정상 기능을 같은 artifact에서 확인해야 합니다.',
  terms: [
    { term: 'Regression Test · 회귀 시험', meaning: '수정한 결함이 다시 생기지 않고 기존 정상 기능도 유지되는지 반복하는 자동 시험입니다.', contrast: '수정 당시 한 번 수동으로 실행한 기록과 다릅니다.' },
    { term: 'Boundary Value · 경계값', meaning: '허용과 거절이 바뀌는 바로 전·바로 그 지점·바로 다음 값입니다.', contrast: '무작위 큰 값 하나만 시험하는 것보다 실패 조건을 정확히 설명합니다.' },
    { term: 'Oracle · 기대 판정', meaning: '각 fixture의 반환값, output, state change, log가 무엇이어야 하는지 미리 정한 기준입니다.', contrast: '“안 죽었다”는 하나의 관찰만으로 성공을 판정하지 않습니다.' },
    { term: 'Atomic Failure · 원자적 실패', meaning: '오류가 나면 대상 state를 부분 변경하지 않고 호출 전 상태를 유지하는 실패 계약입니다.', contrast: '오류 code만 반환하면서 일부 byte를 이미 쓴 상태와 다릅니다.' },
  ],
  stages: [
    { label: 'Artifact·계약 고정', actor: 'CI manifest', input: 'source revision, binary hash, capacity, API contract', action: '어느 build와 어느 경계를 시험하는지 고정합니다.', output: '비교 가능한 test target' },
    { label: '정상 oracle 기록', actor: 'unit test', input: 'empty·normal·capacity-1 data', action: '성공 반환, 정확한 output, NUL 위치를 확인합니다.', output: '정상 기능 기준선' },
    { label: '실패 oracle 기록', actor: 'unit test', input: 'data length capacity·capacity+1', action: '오류 반환과 destination unchanged를 확인합니다.', output: '효과 없는 안전한 실패 증거' },
    { label: 'Instrumentation 실행', actor: 'sanitizer test build', input: '같은 boundary matrix', action: 'memory violation·undefined behavior가 없는지 별도 관찰합니다.', output: 'source assertion과 다른 탐지 근거' },
    { label: 'Log·배포 재확인', actor: 'CI·운영 검증', input: 'error code, build ID, package version, binary properties', action: '민감값 없이 거절 기록이 남고 실제 배포 artifact가 시험된 build인지 확인합니다.', output: '배포까지 연결된 회귀 기록' },
  ],
  trustBoundary: {
    before: 'test가 통과했다는 문장만으로 어떤 input, artifact, expected state를 비교했는지 알 수 없습니다.',
    decision: '각 row에 입력 길이, expected return, destination before·after, sanitizer 결과, build identity를 명시합니다.',
    after: '시험한 경계와 build에 한해 root fix와 정상 기능 유지가 재현 가능합니다.',
    failure: '거절 반환만 보고 destination 보존·정상 fixture·실제 배포 artifact를 확인하지 않으면 partial write나 잘못된 build를 놓칠 수 있습니다.',
  },
}

const retestTrace = {
  id: 'w10-retest-unit-trace',
  type: 'code-trace',
  title: '마지막 정상값과 첫 거절값에서 반환·상태·log를 함께 확인하기',
  evidenceKind: 'educational-model',
  language: 'C',
  description: '실제 Sudo test가 아니라 8-byte 합성 `copy_tag` 수정본의 과정용 unit-test 의사 코드입니다. 입력은 고정 marker이며 crash나 exploitation을 유도하지 않습니다.',
  code: '1  char dst[8] = "KEEP";\n2  assert(copy_tag(dst, 8, "ABCDEFG", 7) == OK);\n3  assert(memcmp(dst, "ABCDEFG\\0", 8) == 0);\n4  memcpy(dst, "KEEP\\0\\0\\0", 8);\n5  assert(copy_tag(dst, 8, "ABCDEFGH", 8) == ERR_TOO_LONG);\n6  assert(memcmp(dst, "KEEP\\0\\0\\0", 8) == 0);\n7  assert(last_log.error_code == ERR_TOO_LONG);\n8  assert(last_log.raw_input == ABSENT);',
  trace: [
    { lines: '1–3', before: 'capacity 8에는 data 7 byte와 NUL 1 byte가 들어갈 수 있습니다.', action: '마지막 정상 길이를 복사하고 반환값과 8-byte destination 전체를 비교합니다.', after: '정상 기능과 정확한 종료 위치가 함께 확인됩니다.' },
    { lines: '4–5', before: 'destination을 알려진 `KEEP` state로 되돌렸고 data 8 byte는 NUL까지 9 byte가 필요합니다.', action: '첫 거절 경계에서 수정 함수를 호출해 `ERR_TOO_LONG`을 확인합니다.', after: 'write 경로에 들어가기 전에 오류가 선택됩니다.' },
    { lines: '6', before: '오류 반환은 확인했지만 partial write 여부는 아직 모릅니다.', action: '호출 전 8-byte snapshot과 호출 후 destination을 전부 비교합니다.', after: '오류 경로가 state를 바꾸지 않았다는 atomic failure 근거가 생깁니다.' },
    { lines: '7–8', before: '조사에는 거절 이유가 필요하지만 raw marker를 보관할 필요는 없습니다.', action: '오류 code는 남고 raw input field는 없음을 확인합니다.', after: '재시험·탐지 가능성과 data 최소화를 함께 검증합니다.' },
  ],
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichSudoCve(block) {
  const additions = [sudoProject, sudoAdvisory, sudoOverflowPatch, sudoFlagPatch, sudoPluginPatch, nvdSudo, cwe787]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    title: '메모리 안전성 사례: Sudo `user_args` unescape의 실제 경계 실패',
    productRole: 'Sudo는 sudoers policy가 허용한 사용자에게 다른 사용자(보통 root)의 권한으로 명령 실행·편집을 중개하는 privileged Unix 프로그램입니다.',
    weakness: 'command-line argument unescape의 off-by-one · heap-based buffer overflow · CWE-122/CWE-787',
    affectedVersions: 'Sudo legacy 1.8.2 이상 1.8.32 미만, stable 1.9.0 이상 1.9.5p2 미만. 배포판 backport 여부는 package advisory로 별도 확인',
    fixedVersions: 'upstream 1.8.32·1.9.5p2 또는 CVE-2021-3156 수정이 backport된 OS 공급자 package',
    cause: '공식 source diff는 `user_args`를 만드는 unescape loop가 잘못된 mode 조합에서 실행될 수 있었고, 마지막 backslash가 문자열 종료 byte를 건너뛸 수 있었으며, `*to++` write 전에 남은 destination capacity를 확인하지 않았음을 보여 줍니다. 길이·용량·안전한 실패 처리와 parse layer의 mode 계약이 함께 깨진 사례입니다.',
    condition: '영향 Sudo가 privileged 상태로 설치된 host에서 저권한 local process가 취약한 sudoedit mode·argument 경계에 도달해야 합니다. 이 수업은 실제 sudo command line, argument payload, heap grooming, 권한 상승, 보호 우회 절차를 제공하지 않습니다.',
    patch: '공식 patch는 unescape를 `MODE_RUN`으로 제한하고, `from[1] != \'\\0\'`로 source 종료를 지키며, 각 destination write 전에 `size - (to - user_args) < 1`을 검사합니다. 별도 commits는 sudoedit flag와 plugin 검사를 맞췄고 수정 releases는 1.8.32·1.9.5p2입니다. Canary·NX·ASLR·PIE는 root fix의 대체물이 아닙니다.',
    followOn: '완화기법 관찰, crash, 합성 8-byte 예제를 실제 권한 상승이나 공식 patch 우회로 연결할 근거는 검증되지 않아 미채택입니다.',
    facts: [
      '공식 diff의 정확한 실패 지점은 capacity check 없이 실행되던 `*to++ = *from++` write 경로이며 source NUL·mode 조건도 함께 수정됐습니다.',
      'NVD는 AV:L·PR:L·UI:N과 높은 C·I·A 영향을 기록하지만 crash 하나가 권한 상승 성공을 증명하지는 않습니다.',
      '합성 fixture는 0, 정상값, 경계 전, 경계값, 경계 초과 marker만 사용합니다.',
      '실제 Sudo code와 과정용 `copy_tag` 모델은 source badge와 설명에서 명확히 구분합니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichBounds(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichSudoCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    boundsMechanism,
    offByOneTrace,
    cve,
    sudoPatchAnalysis,
    sudoImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [sudoProject, sudoAdvisory, sudoOverflowPatch, sudoFlagPatch, sudoPluginPatch, nvdSudo, cwe787])
    : block)
}

function enrichWithBlocks(blocks, additions, sources) {
  const enriched = addAfter(blocks, (block) => block.type === 'explanation', additions)
  return enriched.map((block) => block.type === 'sources' ? appendUniqueSources(block, sources) : block)
}

export function buildWeek9MemorySafetyGuide(modules) {
  const enrichers = {
    'w10-bounds': enrichBounds,
    'w10-mitigations': (blocks) => enrichWithBlocks(blocks, [mitigationsMechanism, defenseManifestTrace, defenseLayers], [gccInstrumentation, gccLinkOptions, linuxAslr, cwe787]),
    'w10-retest': (blocks) => enrichWithBlocks(blocks, [retestMechanism, retestTrace], [cwe787, gccInstrumentation]),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
