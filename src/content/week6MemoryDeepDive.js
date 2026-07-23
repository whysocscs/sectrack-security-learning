const sudoProject = {
  label: 'Sudo · project introduction',
  url: 'https://www.sudo.ws/about/intro/',
  note: '정책에 따라 다른 사용자 권한으로 명령을 실행하게 하는 Sudo의 공식 제품 역할을 확인합니다.',
}

const sudoOverflowPatch = {
  label: 'Sudo · user_args unescape overflow fix commit 1f86385',
  url: 'https://github.com/sudo-project/sudo/commit/1f8638577d0c80a4ff864a2aad80a0d95488e9a8',
  note: 'CVE-2021-3156을 수정한 실제 mode 조건, NUL 확인, buffer 여유 검사 diff입니다.',
}

const sudoFlagPatch = {
  label: 'Sudo · sudoedit valid flags fix commit b301b46',
  url: 'https://github.com/sudo-project/sudo/commit/b301b46b79c6e2a76d530fa36d05992e74952ee8',
  note: 'sudoedit의 허용 flag를 MODE_NONINTERACTIVE로 제한한 CVE 수정 일부입니다.',
}

const sudoPluginPatch = {
  label: 'Sudo · plugin flag consistency fix commit c4d3840',
  url: 'https://github.com/sudo-project/sudo/commit/c4d384082fdbc8406cf19e08d05db4cded920a55',
  note: 'front-end와 sudoers plugin의 sudoedit mode 검사를 일치시킨 수정 일부입니다.',
}

const nvdSudo = {
  label: 'NVD · CVE-2021-3156',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-3156',
  note: 'off-by-one heap overflow, 로컬 저권한 조건, 영향·수정 버전 범위를 확인합니다.',
}

const gccStages = {
  label: 'GCC · Overall Options',
  url: 'https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html',
  note: '전처리·컴파일·어셈블·링크 단계와 중간 산출물의 공식 GCC 설명입니다.',
}

const systemVAbi = {
  label: 'System V AMD64 ABI',
  url: 'https://gitlab.com/x86-psABIs/x86-64-ABI',
  note: 'x86-64 object file, process initialization, calling convention의 공식 ABI 기준입니다.',
}

const valuePointerMechanism = {
  id: 'w7-c-values-pointer-mechanism',
  type: 'mechanism',
  title: '값을 저장하고 주소로 다시 읽는 정상 포인터 흐름',
  situation: '함수가 큰 구조체를 매번 복사하지 않고 같은 데이터를 수정하거나, 동적으로 얻은 메모리를 여러 함수가 함께 사용하려면 “데이터가 있는 위치”를 전달할 방법이 필요합니다. C의 포인터는 그 위치를 값으로 보관합니다.',
  terms: [
    { term: 'Byte · 바이트', meaning: '메모리 크기와 주소 이동을 설명할 때 쓰는 기본 단위입니다. 보통 8개의 bit로 구성됩니다.', contrast: '문자 한 개가 항상 한 바이트인 것은 아니며 문자 encoding에 따라 달라집니다.' },
    { term: 'Address · 주소', meaning: '프로세스의 가상 메모리 안에서 한 저장 위치를 식별하는 값입니다.', contrast: '주소 숫자 자체는 데이터의 타입·길이·수명·접근 권한을 설명하지 않습니다.' },
    { term: 'Pointer · 포인터', meaning: '특정 타입의 객체가 있을 것으로 기대하는 주소 값을 저장하는 C 변수입니다.', contrast: '포인터 변수의 값인 주소와 그 주소에서 읽은 대상 값은 서로 다릅니다.' },
    { term: 'Dereference · 역참조', meaning: '포인터가 가리키는 위치의 객체를 읽거나 쓰는 연산입니다.', contrast: '주소만 복사하는 것과 달리 대상 메모리의 수명·범위·정렬이 유효해야 합니다.' },
  ],
  stages: [
    { label: '객체 생성', actor: 'C 함수·실행 환경', input: '`int score = 7` 선언', action: '현재 호출의 저장 공간에 정수 객체와 값 7을 둡니다.', output: '타입·수명·주소를 가진 `score` 객체' },
    { label: '주소 얻기', actor: 'C의 `&` 연산', input: '`score` 객체', action: '객체의 위치를 나타내는 `int *` 호환 주소를 만듭니다.', output: '`&score` 주소 값' },
    { label: '포인터 저장', actor: '`int *cursor` 변수', input: '`&score`', action: '주소 값을 별도 포인터 변수에 복사합니다.', output: '`cursor`는 `score`를 가리키는 상태' },
    { label: '유효성 계약 확인', actor: '호출 코드·검토자', input: '포인터, 대상 타입, 객체 수명, 접근 범위', action: 'NULL 여부만이 아니라 대상이 아직 살아 있고 허용 범위 안인지 확인합니다.', output: '역참조 가능한 포인터 계약' },
    { label: '대상 값 읽기·쓰기', actor: 'C의 `*` 연산', input: '`cursor`와 유효한 대상', action: '`*cursor`로 동일한 정수 객체에 접근합니다.', output: '읽은 값 7 또는 승인된 새 값' },
  ],
  trustBoundary: {
    before: '포인터는 주소만 담고 있으므로 그 숫자만으로 대상의 수명과 범위를 보장하지 않습니다.',
    decision: '코드가 포인터의 출처, 대상 타입, 유효 길이, 소유권, 객체 수명을 함께 지켜야 합니다.',
    after: '유효한 포인터를 통한 접근은 선언된 객체의 바이트 범위 안에서만 상태를 바꿉니다.',
    failure: 'NULL이 아니어도 이미 해제됐거나 배열 끝을 넘거나 잘못된 타입의 위치라면 역참조가 C 객체 경계를 벗어날 수 있습니다.',
  },
}

const pointerTrace = {
  id: 'w7-c-values-pointer-trace',
  type: 'code-trace',
  title: '포인터 변수와 대상 값이 달라지는 네 줄',
  evidenceKind: 'educational-model',
  language: 'C',
  description: '실제 취약 프로젝트 소스가 아닌 값·주소·역참조 개념용 최소 C 모델입니다. 출력되는 주소 숫자는 실행마다 달라질 수 있으므로 학습 결과로 고정하지 않습니다.',
  code: '1  int score = 7;\n2  int *cursor = &score;\n3  int snapshot = *cursor;\n4  *cursor = 9;',
  trace: [
    { lines: '1', before: '현재 함수에 `score` 객체가 없습니다.', action: '`int` 크기의 저장 공간을 만들고 값 7을 기록합니다.', after: '`score`는 값 7, 고유한 주소, 현재 scope의 수명을 가집니다.' },
    { lines: '2', before: '`score`와 포인터 변수 `cursor`가 별도 객체입니다.', action: '`&score` 주소 값을 `cursor`에 저장합니다.', after: '`cursor`의 값은 주소이고 `score`의 값은 여전히 7입니다.' },
    { lines: '3', before: '`cursor`가 살아 있는 `score`를 가리킵니다.', action: '`*cursor`로 대상 값을 읽어 `snapshot`에 복사합니다.', after: '`snapshot`은 7이라는 독립 값이며 주소가 아닙니다.' },
    { lines: '4', before: '`cursor`와 `score`의 연결이 유효합니다.', action: '포인터를 역참조해 대상 객체에 9를 씁니다.', after: '`cursor`의 주소 값은 그대로이고 `score`의 상태만 9로 바뀝니다.' },
  ],
}

const sudoPatchAnalysis = {
  id: 'w7-c-values-sudo-official-patch',
  type: 'patch-analysis',
  title: '공식 commit: unescape 범위와 쓰기 전 남은 용량을 함께 검사하다',
  evidenceKind: 'official-patch',
  source: sudoOverflowPatch,
  language: 'C',
  description: 'Sudo commit `1f86385`의 `plugins/sudoers/sudoers.c` 핵심 diff입니다. 공격용 인자나 실행 명령은 제외하고 실제 조건문과 buffer 검사만 발췌했습니다.',
  before: {
    label: '수정 전 · 실제 핵심 조건',
    code: 'if (ISSET(sudo_mode, MODE_SHELL|MODE_LOGIN_SHELL)) {\n    ...\n    if (from[0] == \'\\\\\' &&\n        !isspace((unsigned char)from[1]))\n        from++;\n    *to++ = *from++;\n    ...\n}\n*--to = \'\\0\';',
  },
  after: {
    label: '수정 후 · 실제 핵심 조건과 용량 gate',
    code: 'if (ISSET(sudo_mode, MODE_SHELL|MODE_LOGIN_SHELL) &&\n    ISSET(sudo_mode, MODE_RUN)) {\n    ...\n    if (from[0] == \'\\\\\' && from[1] != \'\\0\' &&\n        !isspace((unsigned char)from[1])) {\n        from++;\n    }\n    if (size - (to - user_args) < 1)\n        return NOT_FOUND_ERROR;\n    *to++ = *from++;\n}',
  },
  changes: [
    'backslash unescape는 shell/login-shell이라는 조건뿐 아니라 실제 `MODE_RUN`일 때만 수행하도록 범위를 좁혔습니다.',
    '`from[1] != \'\\0\'`를 추가해 backslash 다음이 문자열 종료라면 종료 byte를 건너뛰지 않습니다.',
    '`*to++`로 한 byte를 쓰기 전과 argument 사이 공백을 쓰기 전에 `size - (to - user_args) < 1`을 확인하고 내부 오류로 안전하게 종료합니다.',
    '별도 공식 commits는 sudoedit의 허용 flag를 좁히고 front-end와 sudoers plugin의 mode 검사를 일치시킵니다. 한 줄만 바꾼 패치가 아니라 입력 mode 계약과 buffer 계약을 함께 복원했습니다.',
  ],
  regressionTests: [
    { case: '일반 명령 argument의 정상 escaping', expected: '기존 정책 매칭과 logging 문자열이 유지됨', reason: 'unescape 조건 변경이 정상 run mode를 깨뜨리지 않았는지 확인합니다.' },
    { case: '문자열 종료 바로 앞의 escape 문자', expected: '종료 byte를 건너뛰지 않고 경계를 벗어난 읽기·쓰기가 없음', reason: '공식 diff가 추가한 `from[1] != \'\\0\'` 조건을 직접 검증합니다.' },
    { case: '계산된 `user_args` 용량의 정확한 경계', expected: '마지막 유효 byte까지는 정상 처리되고 다음 쓰기는 오류로 안전 종료됨', reason: 'off-by-one 경계를 양쪽에서 확인합니다.' },
    { case: 'sudoedit와 run mode 조합', expected: '허용되지 않은 flag·mode 조합이 buffer 처리 전에 거절됨', reason: 'parse layer와 policy plugin 수정이 같은 mode 계약을 사용하는지 확인합니다.' },
  ],
  limitation: '공식 핵심 commit은 한 C 파일의 18줄 추가·5줄 삭제이며 별도 test file 추가는 보이지 않습니다. 위 표는 실제 diff에서 도출한 회귀 기준이고 upstream 자동 테스트 이름을 주장하지 않습니다. 전체 CVE 수정에는 flag·plugin 일관성을 다룬 추가 commits와 배포판 backport가 포함될 수 있습니다.',
}

const sudoImpact = {
  id: 'w7-c-values-sudo-impact',
  type: 'impact-map',
  title: 'CVE-2021-3156은 로컬 계정·setuid 경계·영향 버전이 함께 필요하다',
  intro: 'NVD의 CVSS 3.1은 AV:L, PR:L, UI:N과 기밀성·무결성·가용성의 높은 영향을 기록합니다. “C pointer를 쓴다”는 사실만으로 이 조건이 성립하지 않습니다.',
  dimensions: [
    { label: '기밀성', impact: '성공적으로 root 권한을 얻으면 시스템의 root-only 데이터에 접근할 수 있어 높은 영향으로 평가됩니다.', condition: '영향 버전의 privileged Sudo 실행 경로와 로컬 저권한 실행 권한, 실제 권한 상승 성공이 모두 필요합니다.' },
    { label: '무결성', impact: 'root 권한으로 시스템 파일·설정·계정 상태를 바꿀 수 있어 높은 영향으로 평가됩니다.', condition: '단순 crash가 아니라 권한 경계가 실제로 넘어가야 이 영향이 성립합니다.' },
    { label: '가용성', impact: 'root 권한의 시스템 변경 또는 privileged process 실패로 서비스 가용성이 크게 손상될 수 있습니다.', condition: 'OS·서비스 구성과 공격 성공 뒤 가능한 root 동작에 따라 실제 범위가 달라집니다.' },
  ],
  attackerControls: ['자신의 로컬 process에서 Sudo에 전달하는 command-line argument의 byte 내용과 길이', '허용된 범위에서 선택하는 실행 mode·option 조합'],
  notControlled: ['설치된 Sudo package 버전과 배포판 backport 상태', 'Sudo binary의 setuid·file capability·policy 구성', 'heap allocator와 주변 객체의 실제 배치', 'OS hardening·MAC 정책·감사·탐지 상태'],
  access: {
    authentication: 'NVD의 PR:L은 먼저 로컬 저권한 사용자 또는 동등한 code execution이 필요하다는 뜻입니다. 원격 unauthenticated 취약점이 아닙니다.',
    interaction: 'UI:N입니다. 다른 사용자가 링크를 열거나 승인 버튼을 누를 조건은 평가에 없습니다.',
    network: 'AV:L입니다. 공격자는 취약한 host에서 로컬 process를 실행할 수 있어야 합니다.',
    defaultExposure: 'Sudo는 많은 Unix 계열 시스템에 설치되지만, 영향 버전·vendor backport·privileged file mode를 자산별로 확인해야 합니다.',
    protections: '1.8.32·1.9.5p2 이상 또는 공급자 backport 적용이 우선입니다. 최소 로컬 계정, MAC, monitoring은 피해·탐지를 보조하지만 source fix를 대신하지 않습니다.',
  },
}

const buildMechanism = {
  id: 'w7-build-flow-mechanism',
  type: 'mechanism',
  title: '한 C 파일이 실행 가능한 프로세스가 되기까지',
  situation: '사람은 함수와 변수 이름으로 C source를 쓰지만 CPU는 machine instruction을 실행합니다. 다른 파일의 함수와 library를 연결하고 OS가 읽을 수 있는 실행 형식으로 포장하는 단계가 필요합니다.',
  terms: [
    { term: 'Object File · 오브젝트 파일', meaning: '한 source 단위를 machine code와 symbol·relocation 정보로 바꾼 중간 산출물입니다.', contrast: '아직 모든 외부 함수 주소가 결정되지 않아 단독 실행 파일이 아닐 수 있습니다.' },
    { term: 'Symbol · 심볼', meaning: '함수나 전역 객체를 linker와 debugger가 식별하는 이름과 메타데이터입니다.', contrast: 'CPU가 source 변수 이름을 직접 실행하는 것이 아니라 build·debug 도구가 연결에 사용합니다.' },
    { term: 'Linker · 링커', meaning: '여러 object와 library의 symbol 참조를 연결하고 실행 파일 또는 shared object를 만드는 도구입니다.', contrast: 'compiler의 문법·타입 분석 단계와 목적이 다릅니다.' },
    { term: 'Debug Information · 디버그 정보', meaning: 'machine address를 source file·line·type·변수 이름과 대응시키는 선택적 메타데이터입니다.', contrast: '있다고 해서 프로그램 오류 원인이나 안전성이 자동으로 증명되지는 않습니다.' },
  ],
  stages: [
    { label: '전처리', actor: 'C preprocessor', input: 'source, `#include`, macro', action: 'header와 조건부 source를 번역 단위로 구성합니다.', output: '전처리된 C source' },
    { label: '컴파일', actor: 'GCC compiler proper', input: '전처리 source와 언어·optimization option', action: '문법·타입을 분석하고 target assembly 표현을 만듭니다.', output: 'assembly 또는 내부 machine representation' },
    { label: '어셈블', actor: 'assembler', input: 'target instruction과 data directive', action: 'machine code, symbol, relocation을 object file에 기록합니다.', output: '실행 전 object file' },
    { label: '링크', actor: 'linker', input: '여러 object, startup code, library', action: 'symbol 참조와 section 배치를 해결합니다.', output: 'ELF 실행 파일 또는 shared library' },
    { label: '로딩·실행', actor: 'OS loader', input: '실행 파일, shared library, process 설정', action: '가상 메모리에 segment를 매핑하고 entry point로 제어를 옮깁니다.', output: '코드·데이터·스택·힙을 가진 process' },
  ],
  trustBoundary: {
    before: 'source만 보면 실제 포함된 dependency, compile option, target ABI, binary metadata를 모두 알 수 없습니다.',
    decision: '재현 가능한 build가 source revision, compiler·linker version, flags, library provenance를 고정해야 합니다.',
    after: '생성 artifact와 debug 정보가 특정 build 입력에 연결되어 source↔instruction 관찰의 기준선이 됩니다.',
    failure: 'artifact provenance나 build flags가 다르면 같은 source 이름이라도 보호 기법·배치·동작이 달라져 잘못된 결론을 만들 수 있습니다.',
  },
}

const memoryLayoutMechanism = {
  id: 'w7-memory-layout-lifetime-mechanism',
  type: 'mechanism',
  title: '스택과 힙을 주소가 아니라 생성·소유·종료 시점으로 읽기',
  situation: '함수 호출 동안만 필요한 작은 상태와 실행 중 크기가 정해지는 데이터는 수명이 다릅니다. C에서는 자동 storage와 동적 allocation을 구분하고 누가 언제 접근과 해제를 끝낼지 코드가 명시해야 합니다.',
  terms: [
    { term: 'Stack Frame · 스택 프레임', meaning: '한 함수 호출의 지역 상태, 저장해야 할 register, 복귀와 관련된 정보를 담는 실행 문맥입니다.', contrast: '정확한 layout은 compiler와 optimization에 따라 달라지며 모든 지역 변수가 반드시 memory에 놓이는 것은 아닙니다.' },
    { term: 'Heap Allocation · 힙 할당', meaning: '`malloc` 같은 allocator에 runtime 크기의 storage를 요청해 얻는 동적 객체입니다.', contrast: '함수 반환만으로 자동 해제되지 않으며 명시적인 ownership과 `free` 시점이 필요합니다.' },
    { term: 'Lifetime · 수명', meaning: '객체를 읽고 쓸 수 있도록 존재하는 실행 구간입니다.', contrast: 'pointer 값이 남아 있다는 사실과 대상 객체의 수명이 계속된다는 사실은 다릅니다.' },
    { term: 'Capacity · 용량', meaning: '할당된 저장소가 담을 수 있는 byte 수입니다.', contrast: '현재 데이터 길이와 다르며 복사 전에는 길이와 종료 byte를 포함해 비교해야 합니다.' },
  ],
  stages: [
    { label: '호출 진입', actor: 'caller·callee', input: '함수 인자와 ABI 상태', action: 'callee가 필요한 자동 storage와 저장 상태를 준비합니다.', output: '현재 호출의 stack frame·register state' },
    { label: '동적 크기 계산', actor: 'C 함수', input: '검증된 element 수와 element 크기', action: 'overflow가 없는지 확인하고 필요한 byte 수를 계산합니다.', output: 'allocation size 또는 안전한 오류' },
    { label: '힙 객체 생성', actor: 'allocator', input: '요청 byte 수', action: '성공하면 정렬된 storage pointer를, 실패하면 NULL을 반환합니다.', output: 'capacity와 ownership을 가진 동적 객체' },
    { label: '범위 안 사용', actor: '함수들', input: 'pointer, logical length, capacity, lifetime', action: '모든 읽기·쓰기를 객체 범위와 초기화된 구간 안에서 수행합니다.', output: '유효한 상태 또는 효과 없는 오류' },
    { label: '소유 종료', actor: 'owner', input: '더 이상 공유되지 않는 heap pointer', action: '한 번 `free`하고 모든 후속 접근을 중단합니다.', output: '해제된 storage와 사용할 수 없는 이전 pointer 값' },
  ],
  trustBoundary: {
    before: 'pointer는 대상의 logical length, allocation capacity, ownership, lifetime을 자체적으로 보관하지 않습니다.',
    decision: 'API와 호출자가 pointer와 함께 이 네 계약을 전달하고 쓰기 전에 검사해야 합니다.',
    after: '정상 경로의 읽기·쓰기는 살아 있는 객체의 capacity 안에서만 일어납니다.',
    failure: 'capacity보다 많이 쓰거나 free 뒤 접근하거나 두 owner가 중복 해제하면 stack·heap 어느 영역에서도 memory safety가 깨질 수 있습니다.',
  },
}

const boundedCopyTrace = {
  id: 'w7-memory-layout-bounded-copy-trace',
  type: 'code-trace',
  title: '길이·용량·종료 byte를 한 계약으로 묶는 복사',
  evidenceKind: 'educational-model',
  language: 'C',
  description: '실제 Sudo 코드가 아닌 8-byte 합성 label buffer입니다. 공격 입력 없이 정상 문자열과 경계값에서 복사 전 상태가 어떻게 판정되는지 보여 줍니다.',
  code: '1  bool copy_label(char dst[8], const char *src) {\n2      const size_t capacity = 8;\n3      const size_t length = strnlen(src, capacity);\n4      if (length >= capacity) return false;\n5      memcpy(dst, src, length + 1);\n6      return true;\n7  }',
  trace: [
    { lines: '1–2', before: '호출자가 대상 배열과 source pointer를 넘겼습니다.', action: '함수가 목적지의 실제 byte capacity를 계약으로 고정합니다.', after: '유효한 index는 0부터 7까지입니다.' },
    { lines: '3', before: '`src` 길이를 무제한으로 읽어서는 안 됩니다.', action: '최대 8 byte까지만 NUL 종료를 찾습니다.', after: '`length < 8`이면 종료 위치가 범위 안에 있고, 8이면 범위 안 종료를 찾지 못했습니다.' },
    { lines: '4', before: '복사에 필요한 데이터 길이와 종료 byte 공간을 판단할 수 있습니다.', action: '범위 안 NUL이 없으면 어떤 쓰기도 하기 전에 `false`로 종료합니다.', after: '`dst` 상태가 바뀌지 않는 안전한 실패가 됩니다.' },
    { lines: '5', before: '`length`는 0~7이고 `length + 1`은 1~8입니다.', action: '문자와 NUL 종료 byte를 함께 복사합니다.', after: '모든 쓰기가 `dst[0]`부터 `dst[7]` 안에 머뭅니다.' },
    { lines: '6', before: '목적지에 종료된 문자열이 있습니다.', action: '호출자에게 성공 상태를 반환합니다.', after: '호출자는 buffer 내용과 성공 여부를 함께 사용할 수 있습니다.' },
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
  const additions = [sudoProject, sudoOverflowPatch, sudoFlagPatch, sudoPluginPatch, nvdSudo]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    productRole: 'Sudo는 시스템 정책이 허용한 사용자에게 다른 사용자(일반적으로 root)의 권한으로 특정 명령을 실행하거나 파일을 편집하게 하는 Unix 권한 경계 프로그램입니다.',
    weakness: 'command-line argument unescape의 off-by-one · heap-based buffer overflow · CWE-122',
    affectedVersions: 'Sudo 1.8.2 이상 1.8.32 미만, 1.9.0 이상 1.9.5p2 미만(1.9.5와 1.9.5p1 포함). 배포판 backport 여부는 package advisory로 별도 확인',
    fixedVersions: 'upstream 1.8.32, 1.9.5p2 또는 각 OS 공급자의 CVE-2021-3156 backport package',
    cause: '공식 commit은 `user_args`를 만들며 backslash를 unescape하는 loop가 특정 mode에서 문자열 종료 byte를 건너뛸 수 있었고 쓰기 전 남은 buffer capacity를 재확인하지 않았음을 보여 줍니다. Sudo의 parse layer와 policy plugin 사이 mode·flag 계약 불일치도 수정 범위에 포함됐습니다.',
    condition: '영향 버전의 privileged Sudo가 설치된 host에서 저권한 로컬 사용자가 자신의 process로 영향을 받는 sudoedit mode와 끝 경계의 command-line argument 상태를 만들 수 있어야 합니다. 수업은 실제 실행 명령, argument payload, 권한 상승 절차를 제공하지 않습니다.',
    patch: 'upstream은 unescape를 `MODE_RUN`으로 제한하고, backslash 다음 byte가 NUL인지 확인하며, 각 destination write 전에 남은 `user_args` capacity를 검사했습니다. 별도 commits는 sudoedit의 유효 flag와 plugin mode 검사를 일치시켰고 수정 releases는 1.8.32와 1.9.5p2입니다.',
    facts: [
      'NVD는 로컬 저권한·사용자 상호작용 없음·높은 C/I/A 영향으로 평가합니다.',
      '단순한 crash는 memory corruption 관찰 증거일 수 있지만 root 권한 상승 성공을 단독으로 증명하지 않습니다.',
      '실제 patch 분석은 공식 source diff에 한정하고, 수업의 작은 pointer·copy 코드는 별도 교육용 모델로 표시합니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichValues(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichSudoCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    valuePointerMechanism,
    pointerTrace,
    cve,
    sudoPatchAnalysis,
    sudoImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [sudoProject, sudoOverflowPatch, sudoFlagPatch, sudoPluginPatch, nvdSudo])
    : block)
}

function enrichWithBlocks(blocks, additions) {
  return addAfter(blocks, (block) => block.type === 'explanation', additions)
}

export function buildWeek6MemoryGuide(modules) {
  const enrichers = {
    'w7-c-values': enrichValues,
    'w7-build-flow': (blocks) => enrichWithBlocks(blocks, [buildMechanism]),
    'w7-memory-layout': (blocks) => enrichWithBlocks(blocks, [memoryLayoutMechanism, boundedCopyTrace]),
  }

  return modules.map((module) => {
    let blocks = enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks
    if (module.id === 'w7-build-flow') {
      blocks = blocks.map((block) => block.type === 'sources' ? appendUniqueSources(block, [gccStages, systemVAbi]) : block)
    }
    return { ...module, contentLevel: 'concept-code-cve-v1', blocks }
  })
}
