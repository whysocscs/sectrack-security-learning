const systemVAbi = {
  label: 'System V AMD64 ABI',
  url: 'https://gitlab.com/x86-psABIs/x86-64-ABI',
  note: 'x86-64 함수 인자·반환값·register 보존·stack alignment의 공식 calling convention 기준입니다.',
}

const intelManual = {
  label: 'Intel · 64 and IA-32 Architectures Software Developer Manuals',
  url: 'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html',
  note: 'instruction, register, flags, call·return 동작의 processor 공식 문서입니다.',
}

const sudoFlagPatch = {
  label: 'Sudo · sudoedit valid flags fix commit b301b46',
  url: 'https://github.com/sudo-project/sudo/commit/b301b46b79c6e2a76d530fa36d05992e74952ee8',
  note: 'CVE-2021-3156 수정의 일부인 `EDIT_VALID_FLAGS`와 sudoedit mode 초기화 실제 diff입니다.',
}

const sudoOverflowPatch = {
  label: 'Sudo · user_args unescape overflow fix commit 1f86385',
  url: 'https://github.com/sudo-project/sudo/commit/1f8638577d0c80a4ff864a2aad80a0d95488e9a8',
  note: 'mode 제한, 문자열 종료 확인, destination capacity 검사를 추가한 핵심 overflow 수정입니다.',
}

const sudoPluginPatch = {
  label: 'Sudo · plugin flag consistency fix commit c4d3840',
  url: 'https://github.com/sudo-project/sudo/commit/c4d384082fdbc8406cf19e08d05db4cded920a55',
  note: 'front-end와 sudoers plugin의 sudoedit flag 검사를 맞춘 수정입니다.',
}

const nvdSudo = {
  label: 'NVD · CVE-2021-3156',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-3156',
  note: 'Sudo off-by-one heap overflow의 로컬 조건·영향·버전 범위를 확인합니다.',
}

const instructionMechanism = {
  id: 'w8-instruction-flow-cpu-mechanism',
  type: 'mechanism',
  title: 'CPU가 비교 결과를 분기로 바꾸는 정상 명령 흐름',
  situation: 'C의 `if (length < capacity)` 한 줄은 값을 불러오고 비교하고 조건에 따라 다음 instruction 주소를 선택하는 여러 CPU 동작으로 바뀝니다. 보안 검토에서는 어떤 값이 비교되고 어느 분기가 상태 변경을 허용하는지 연결해야 합니다.',
  terms: [
    { term: 'Instruction · 명령', meaning: 'CPU가 수행할 값 이동, 산술, 비교, 분기, 호출 같은 하나의 machine-level 동작입니다.', contrast: 'source 한 줄이 instruction 하나와 항상 일대일로 대응하지는 않습니다.' },
    { term: 'Register · 레지스터', meaning: 'CPU가 현재 인자, 주소, 중간 결과, 반환값을 매우 빠르게 보관하는 작은 상태 공간입니다.', contrast: '파일처럼 영구 저장되지 않고 호출 규약과 instruction에 따라 의미가 계속 바뀝니다.' },
    { term: 'Flags · 상태 플래그', meaning: '비교·산술 결과가 0인지, carry가 있었는지 같은 조건을 CPU가 기록하는 bit 상태입니다.', contrast: 'C의 boolean 변수와 같을 수도 있지만 대개 다음 conditional jump가 바로 읽는 CPU 상태입니다.' },
    { term: 'Branch · 분기', meaning: '조건에 따라 다음 instruction 주소를 순차 위치가 아닌 다른 위치로 선택하는 제어 흐름입니다.', contrast: 'data 값을 바꾸는 동작과 다음에 실행할 위치를 바꾸는 동작을 구분해야 합니다.' },
  ],
  stages: [
    { label: '인자 전달', actor: '호출자·ABI', input: '`length`, `capacity` 값과 함수 선언', action: '호출 규약이 정한 register 또는 stack 위치에 인자를 둡니다.', output: 'callee가 읽을 machine state' },
    { label: '값 준비', actor: 'callee instruction', input: '인자 register와 필요한 memory operand', action: '비교할 두 값을 register·operand 형태로 준비합니다.', output: '동일한 bit width로 해석할 피연산자' },
    { label: '비교', actor: '`cmp` 계열 instruction', input: 'length와 capacity', action: '뺄셈과 같은 내부 비교로 flags를 갱신하되 원래 값은 보존합니다.', output: '조건을 나타내는 CPU flags' },
    { label: '조건 분기', actor: 'conditional jump', input: 'signed·unsigned 의미에 맞는 flags', action: '안전 경로 또는 오류 경로의 다음 instruction을 선택합니다.', output: '하나로 결정된 control flow' },
    { label: '효과·반환', actor: '선택된 basic block', input: '검증된 값 또는 실패 상태', action: '범위 안 작업을 수행하거나 효과 없이 오류 code를 만듭니다.', output: 'ABI가 정한 위치의 반환값' },
  ],
  trustBoundary: {
    before: 'register에 값이 있다는 사실만으로 그것이 signed인지, 길이인지, 권한 bit인지 알 수 없습니다.',
    decision: '함수 선언, source 조건, instruction width, signedness, branch target을 함께 읽어야 합니다.',
    after: '정상 경로에서는 검증된 조건을 만족한 값만 memory effect를 만드는 block으로 갑니다.',
    failure: '잘못된 조건, signedness 불일치, 빠진 branch가 있으면 검증되지 않은 값이 효과 instruction에 도달할 수 있습니다.',
  },
}

const branchTrace = {
  id: 'w8-instruction-flow-branch-trace',
  type: 'code-trace',
  title: 'C의 용량 검사가 합성 x86-64 분기로 이어지는 과정',
  evidenceKind: 'educational-model',
  language: 'asm',
  description: '특정 compiler가 만든 실제 binary disassembly가 아닙니다. System V AMD64의 첫 두 정수 인자 register와 일반적인 unsigned 비교를 단순화한 교육용 대응입니다.',
  code: 'C: bool fits(size_t length, size_t capacity)\n   { return length < capacity; }\n\n1  cmp  rsi, rdi      ; length - capacity의 flags\n2  jae  .not_fit      ; length >= capacity이면 분기\n3  mov  eax, 1        ; true 반환값\n4  ret\n5 .not_fit:\n6  xor  eax, eax      ; false 반환값\n7  ret',
  trace: [
    { lines: '1', before: 'SysV 모델에서 `rdi=length`, `rsi=capacity`로 시작합니다.', action: '`cmp rsi, rdi`가 `rdi - rsi`에 해당하는 flags를 갱신합니다.', after: 'register 원래 값은 남고 unsigned 크기 관계가 flags에 표현됩니다.' },
    { lines: '2', before: 'flags에 length와 capacity의 unsigned 비교 결과가 있습니다.', action: '`jae`가 length가 capacity 이상인 경우 오류 block을 선택합니다.', after: '경계값 `length == capacity`도 안전하지 않은 쪽으로 갑니다.' },
    { lines: '3–4', before: 'length가 capacity보다 작다는 분기를 통과했습니다.', action: '반환 register `eax`에 1을 두고 caller로 돌아갑니다.', after: 'caller는 boolean true로 해석할 값을 받습니다.' },
    { lines: '5–7', before: '경계 이상이라는 조건으로 `.not_fit`에 왔습니다.', action: '`eax`를 0으로 만들고 반환합니다.', after: 'memory write 없이 false를 반환하는 안전한 실패 경로입니다.' },
  ],
}

const sudoFlagPatchAnalysis = {
  id: 'w8-instruction-flow-sudo-flag-patch',
  type: 'patch-analysis',
  title: '공식 commit: sudoedit의 허용 mode bit를 좁혀 control flow를 맞추다',
  evidenceKind: 'official-patch',
  source: sudoFlagPatch,
  language: 'C',
  description: 'Sudo commit `b301b46`의 `src/parse_args.c` 핵심 실제 diff입니다. 이 source 조건은 build마다 다른 assembly로 번역될 수 있으므로 특정 opcode나 주소를 공식 패치라고 주장하지 않습니다.',
  before: {
    label: '수정 전 · 실제 sudoedit 초기화',
    code: 'if (strcmp(progname, "sudoedit") == 0) {\n    progname = "sudoedit";\n    mode = MODE_EDIT;\n    sudo_settings[ARG_SUDOEDIT].value = "true";\n}',
  },
  after: {
    label: '수정 후 · 실제 허용 flag 계약',
    code: '#define EDIT_VALID_FLAGS MODE_NONINTERACTIVE\n\nif (strcmp(progname, "sudoedit") == 0) {\n    progname = "sudoedit";\n    mode = MODE_EDIT;\n    sudo_settings[ARG_SUDOEDIT].value = "true";\n    valid_flags = EDIT_VALID_FLAGS;\n}',
  },
  changes: [
    'sudoedit 전용 `EDIT_VALID_FLAGS`를 `MODE_NONINTERACTIVE` 하나로 정의했습니다.',
    '프로그램 이름으로 sudoedit mode가 선택되는 분기에도 `valid_flags = EDIT_VALID_FLAGS`를 설정해 `-e` option 경로와 같은 정책을 사용하게 했습니다.',
    '같은 commit은 허용되지 않은 home·group 관련 flag bit를 명시적으로 설정해 마지막 공통 `flags & ~valid_flags` 검사에서 거절되게 했습니다.',
    '이 control-flow 수정은 CVE 전체 패치의 일부입니다. 실제 overflow loop는 별도 commit `1f86385`가 mode, NUL, capacity를 수정합니다.',
  ],
  regressionTests: [
    { case: '프로그램 이름으로 진입한 sudoedit', expected: '`valid_flags`가 `EDIT_VALID_FLAGS`로 초기화됨', reason: '동일 기능의 두 진입 경로가 같은 mode 계약을 갖는지 확인합니다.' },
    { case: '`-e`로 선택한 edit mode', expected: '같은 허용 flag 집합을 사용함', reason: 'alias·option 경로 사이 policy 불일치를 막습니다.' },
    { case: '허용되지 않은 flag bit 조합', expected: 'policy·argument 처리 전에 usage 오류로 거절됨', reason: '잘못된 state가 후속 unescape control flow에 도달하지 않게 합니다.' },
    { case: '정상 비대화형 edit 요청', expected: '기존 정상 mode와 결과가 유지됨', reason: 'flag 축소가 지원 기능을 깨뜨리지 않았는지 확인합니다.' },
  ],
  limitation: '이 commit은 CVE-2021-3156 수정의 한 부분이고 1개 C 파일의 12줄 추가·6줄 삭제입니다. source의 mode bit와 branch 의미만 분석하며 실제 배포 binary의 instruction, 최적화, address는 해당 artifact를 별도로 build·검증하지 않고 확정하지 않습니다.',
}

const sudoAssemblyImpact = {
  id: 'w8-instruction-flow-sudo-impact',
  type: 'impact-map',
  title: 'ABI는 전달 규칙이고 CVE 영향은 Sudo source·권한 조건에서 나온다',
  intro: '같은 System V ABI로 빌드된 수많은 안전한 프로그램이 있습니다. 이 사례의 원인은 특정 Sudo mode와 `user_args` unescape·capacity 계약이며 ABI 자체가 아닙니다.',
  dimensions: [
    { label: '기밀성', impact: 'root 권한 상승이 성공하면 높은 기밀성 영향이 가능하다는 NVD 평가입니다.', condition: '영향 Sudo, 로컬 저권한, privileged execution 경계, 실제 exploitation 성공이 필요합니다.' },
    { label: '무결성', impact: 'root가 허용된 시스템 상태를 변경할 수 있어 높은 무결성 영향으로 평가됩니다.', condition: 'register 또는 crash 관찰만으로 권한 상승과 변경 범위를 확정할 수 없습니다.' },
    { label: '가용성', impact: 'privileged process·system 설정을 손상시킬 수 있어 높은 가용성 영향으로 평가됩니다.', condition: 'OS 서비스와 후속 권한 사용에 따라 실제 범위가 달라집니다.' },
  ],
  attackerControls: ['로컬 process가 Sudo front-end에 전달하는 argument byte와 허용 option 선택', '자신의 실행 시점과 반복'],
  notControlled: ['compiler가 선택한 실제 instruction·register allocation·최적화', 'Sudo package patch·vendor backport 상태', 'setuid·file capability·policy·MAC 구성', 'heap 주변 객체의 runtime 배치'],
  access: {
    authentication: 'PR:L로, host에서 저권한 code를 실행할 수 있어야 합니다. Sudo password prompt 성공을 전제로 하는 원격 취약점이 아닙니다.',
    interaction: 'UI:N으로 다른 사용자의 행동은 필요하지 않습니다.',
    network: 'AV:L이며 원격 packet이나 protocol parsing과 관계없습니다.',
    defaultExposure: 'Sudo 설치와 setuid mode는 흔할 수 있지만 영향 version과 vendor package patch를 자산별로 대조해야 합니다.',
    protections: '1.8.32·1.9.5p2 이상 또는 vendor backport가 root fix입니다. compiler hardening과 MAC은 추가 방어층이며 source control-flow 수정의 대체물이 아닙니다.',
  },
}

const stackFrameMechanism = {
  id: 'w8-stack-frame-call-mechanism',
  type: 'mechanism',
  title: '호출자가 인자를 준비하고 callee가 반환하는 정상 call·ret 흐름',
  situation: '큰 프로그램은 기능을 함수로 나눕니다. caller는 인자를 정해진 위치에 두고 callee로 제어를 넘기며, callee는 필요한 상태만 보존한 뒤 반환값과 복귀 지점을 지켜야 서로 독립적으로 compile된 코드도 함께 동작합니다.',
  terms: [
    { term: 'Caller · 호출자', meaning: '다른 함수를 부르기 위해 인자와 복귀 뒤 필요한 상태를 준비하는 함수입니다.', contrast: 'callee가 보존할 상태와 caller가 스스로 보존할 상태는 ABI가 구분합니다.' },
    { term: 'Callee · 피호출자', meaning: '`call`로 제어를 넘겨받아 함수 계약을 수행하고 결과를 반환하는 함수입니다.', contrast: '함수 내부 구현은 바뀔 수 있어도 외부 ABI 계약은 호출자와 일치해야 합니다.' },
    { term: 'Return Address · 복귀 주소', meaning: 'callee가 끝난 뒤 caller의 어느 instruction부터 계속할지 나타내는 제어 흐름 값입니다.', contrast: '일반 함수 인자나 지역 변수와 달리 call·ret의 다음 실행 위치를 결정합니다.' },
    { term: 'Stack Alignment · 스택 정렬', meaning: '호출 경계에서 stack pointer가 ABI가 요구하는 byte 배수 관계를 만족하는 규칙입니다.', contrast: 'stack frame 크기를 모두 같게 만드는 규칙은 아닙니다.' },
  ],
  stages: [
    { label: '함수 선언 합의', actor: 'source·compiler', input: 'parameter type, return type, target ABI', action: '호출 양쪽이 같은 type·calling convention을 사용하도록 compile합니다.', output: 'machine-level 함수 경계 계약' },
    { label: '인자·보존 준비', actor: 'caller', input: '계산한 인자와 이후에도 필요한 caller-saved 상태', action: '인자 register를 설정하고 필요한 상태를 별도 보존합니다.', output: 'call 직전 ABI state' },
    { label: '`call` 실행', actor: 'CPU', input: 'callee target과 다음 instruction 위치', action: '복귀 위치를 보존하고 callee entry로 제어를 옮깁니다.', output: 'callee가 실행 중인 control state' },
    { label: 'callee frame·작업', actor: 'callee', input: '인자, stack alignment, callee-saved register', action: '필요한 frame을 만들고 계약 범위에서 memory·register를 사용합니다.', output: '반환값과 복원된 보존 상태' },
    { label: '`ret`와 후속 실행', actor: 'CPU·caller', input: '복귀 주소와 return register', action: 'caller의 다음 instruction으로 돌아가 반환값을 사용합니다.', output: '이어지는 caller state' },
  ],
  trustBoundary: {
    before: 'disassembly 한 시점의 stack 값만으로 어느 항목이 인자·saved register·return address인지 자동으로 알 수 없습니다.',
    decision: '함수 경계, ABI, unwind/debug metadata, instruction 흐름을 함께 사용해 각 상태의 의미를 판정해야 합니다.',
    after: '정상 call은 필요한 상태를 보존하고 정해진 반환 위치와 결과로 돌아옵니다.',
    failure: '함수 prototype 불일치, stack misalignment, memory corruption이 있으면 caller와 callee가 같은 byte를 다르게 해석할 수 있습니다.',
  },
}

const callTrace = {
  id: 'w8-stack-frame-call-trace',
  type: 'code-trace',
  title: '두 정수 인자와 반환값을 따라가는 표준 기반 합성 전사',
  evidenceKind: 'standards-derived',
  source: systemVAbi,
  language: 'asm',
  description: 'System V AMD64 인자·반환 register 규칙을 사용한 단순 모델입니다. 실제 Sudo binary나 취약 함수의 disassembly가 아닙니다.',
  code: 'C: int add(int left, int right);\n\n1  mov  edi, 4       ; 첫 int 인자\n2  mov  esi, 5       ; 둘째 int 인자\n3  call add\n4  mov  DWORD PTR [result], eax\n\nadd:\n5  lea  eax, [rdi+rsi]\n6  ret',
  trace: [
    { lines: '1–2', before: 'caller에 값 4와 5가 있습니다.', action: '첫 두 정수 인자 위치인 `edi`, `esi`에 값을 둡니다.', after: 'callee가 같은 ABI를 쓰면 두 값의 의미를 일관되게 읽을 수 있습니다.' },
    { lines: '3', before: '인자 register와 정렬된 stack이 준비됐습니다.', action: '`call`이 복귀 위치를 보존하고 `add`로 이동합니다.', after: 'CPU 제어 흐름은 callee에 있고 caller 복귀점은 보존됩니다.' },
    { lines: '5', before: '`rdi`, `rsi`의 낮은 32 bit에 두 인자가 있습니다.', action: '합을 계산해 반환 register `eax`에 둡니다.', after: '`eax`는 9이며 memory write는 아직 없습니다.' },
    { lines: '6', before: '반환값과 복귀 위치가 준비되어 있습니다.', action: '`ret`이 caller의 다음 instruction으로 돌아갑니다.', after: 'line 4가 실행될 control state가 됩니다.' },
    { lines: '4', before: 'caller로 돌아왔고 `eax=9`입니다.', action: '반환값을 caller의 `result` 저장 위치에 기록합니다.', after: 'source의 `result = add(4, 5)` 상태 전이가 완료됩니다.' },
  ],
}

const callingConventionMechanism = {
  id: 'w8-calling-convention-contract-mechanism',
  type: 'mechanism',
  title: '호출 규약은 register 이름 암기가 아니라 책임 분담 계약이다',
  situation: '서로 다른 source 파일과 library가 각자 compile되어도 함수를 호출하려면 인자 위치, 반환 위치, register 보존, stack 정렬, aggregate 전달 규칙이 같아야 합니다. 이 공통 계약이 ABI의 calling convention입니다.',
  terms: [
    { term: 'ABI · Application Binary Interface', meaning: 'compile된 program과 library가 binary 수준에서 함께 동작하도록 data layout, calling convention, object format 등을 정한 계약입니다.', contrast: 'source 언어 문법인 API와 범위가 다르며 OS·architecture 조합에 따라 달라질 수 있습니다.' },
    { term: 'Caller-saved Register', meaning: '호출 뒤 값이 바뀔 수 있어 caller가 필요하면 call 전에 보존해야 하는 register입니다.', contrast: 'callee가 원래 값으로 복구할 의무가 있는 callee-saved register와 다릅니다.' },
    { term: 'Callee-saved Register', meaning: 'callee가 사용했다면 caller로 돌아가기 전에 원래 값을 복원해야 하는 register입니다.', contrast: '함수 호출 동안 절대 사용할 수 없는 register라는 뜻은 아닙니다.' },
  ],
  stages: [
    { label: 'type 분류', actor: 'compiler', input: '함수 prototype과 parameter·return type', action: 'ABI 규칙으로 integer, vector, memory 전달 class를 결정합니다.', output: '각 값의 전달 위치 계획' },
    { label: 'caller 책임', actor: 'caller code', input: '인자와 live register·stack state', action: '인자를 배치하고 caller-saved 값과 alignment를 관리합니다.', output: '유효한 entry state' },
    { label: 'callee 책임', actor: 'callee code', input: 'entry state와 함수 본문', action: 'callee-saved 상태, local storage, return value를 계약에 맞게 관리합니다.', output: '유효한 return state' },
    { label: '경계 검증', actor: 'debugger·reviewer', input: 'prototype, binary, build target, register·stack trace', action: '실제 artifact가 어느 ABI를 따르는지와 호출 양쪽 해석이 맞는지 비교합니다.', output: '근거가 연결된 함수 상태 기록' },
  ],
  trustBoundary: {
    before: 'register 이름 목록만 외우면 type width, signedness, stack argument, variadic·aggregate 예외를 놓칩니다.',
    decision: '함수 prototype과 실제 target ABI 문서를 먼저 정하고 trace를 그 계약에 대조해야 합니다.',
    after: '각 register·stack slot은 특정 함수 경계와 시점에서만 의미가 부여됩니다.',
    failure: '잘못된 ABI 가정은 안전한 함수도 취약해 보이게 하거나 실제 argument·return 불일치를 놓치게 합니다.',
  },
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichSudoCve(block) {
  const additions = [sudoFlagPatch, sudoOverflowPatch, sudoPluginPatch, nvdSudo, systemVAbi]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    productRole: 'Sudo는 policy가 허용한 사용자에게 다른 사용자 권한으로 명령 실행·편집을 중개하는 privileged Unix 프로그램이며, front-end argument parser와 sudoers policy plugin이 mode state를 전달합니다.',
    weakness: 'sudoedit mode·flag 계약과 user_args unescape 경계 실패 · heap-based buffer overflow · CWE-122',
    affectedVersions: 'Sudo 1.8.2 이상 1.8.32 미만, 1.9.0 이상 1.9.5p2 미만. OS 공급자 backport 여부는 package advisory로 확인',
    fixedVersions: 'upstream 1.8.32·1.9.5p2 또는 CVE-2021-3156 수정이 backport된 vendor package',
    cause: '공식 source commits는 sudoedit 진입 경로의 `valid_flags` 초기화와 plugin 검사를 일치시키고, `user_args` unescape를 실제 run mode로 제한하며 문자열 종료와 destination capacity를 확인하도록 바꿨습니다. 특정 x86-64 ABI, register, `call` 또는 `ret`가 원인이라는 공식 근거는 없습니다.',
    condition: '영향 Sudo가 privileged 상태로 설치된 host에서 저권한 로컬 process가 취약한 mode·argument 경계에 도달해야 합니다. 이 수업은 실행 가능한 명령 조합, overflow data, 권한 상승 단계, 실제 address를 제공하지 않습니다.',
    patch: '수정은 `EDIT_VALID_FLAGS`와 진입 경로 초기화, front-end/plugin 검사 일치, unescape의 `MODE_RUN` 제한, `from[1] != \'\\0\'`, 각 destination write 전 capacity gate를 포함합니다. source 수정 releases는 1.8.32와 1.9.5p2입니다.',
    facts: [
      'ABI는 compile된 함수 사이 값 전달 계약이며 CVE 원인이나 exploitability를 단독으로 설명하지 않습니다.',
      'source patch는 portable C이고 실제 instruction sequence는 compiler·version·flags·target에 따라 달라집니다.',
      '합성 assembly는 calling convention 학습 자료이며 공식 Sudo binary disassembly로 표시하지 않습니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichInstruction(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichSudoCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    instructionMechanism,
    branchTrace,
    cve,
    sudoFlagPatchAnalysis,
    sudoAssemblyImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [sudoFlagPatch, sudoOverflowPatch, sudoPluginPatch, nvdSudo, systemVAbi, intelManual])
    : block)
}

function enrichWithBlocks(blocks, additions, sources) {
  const enriched = addAfter(blocks, (block) => block.type === 'explanation', additions)
  return enriched.map((block) => block.type === 'sources' ? appendUniqueSources(block, sources) : block)
}

export function buildWeek7AssemblyGuide(modules) {
  const enrichers = {
    'w8-instruction-flow': enrichInstruction,
    'w8-stack-frame': (blocks) => enrichWithBlocks(blocks, [stackFrameMechanism, callTrace], [systemVAbi, intelManual]),
    'w8-calling-convention': (blocks) => enrichWithBlocks(blocks, [callingConventionMechanism], [systemVAbi]),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
