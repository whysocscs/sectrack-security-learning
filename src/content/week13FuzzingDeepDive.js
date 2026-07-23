const libFuzzerDoc = {
  label: 'LLVM · libFuzzer documentation',
  url: 'https://llvm.org/docs/LibFuzzer.html',
  note: 'in-process coverage-guided fuzzer, fuzz target, corpus, artifact의 공식 설명입니다.',
}

const asanDoc = {
  label: 'Clang · AddressSanitizer documentation',
  url: 'https://clang.llvm.org/docs/AddressSanitizer.html',
  note: '메모리 오류 진단 범위, build flag, symbolization, limitation의 공식 설명입니다.',
}

const ossFuzzDoc = {
  label: 'Google · OSS-Fuzz documentation',
  url: 'https://google.github.io/oss-fuzz/',
  note: '오픈소스 프로젝트의 지속 fuzzing, build integration, issue workflow 기준입니다.',
}

const wasmtimeProject = {
  label: 'Bytecode Alliance · Wasmtime 공식 저장소',
  url: 'https://github.com/bytecodealliance/wasmtime',
  note: 'WebAssembly runtime와 embedding API를 구현하는 upstream source입니다.',
}

const wasmtimeAdvisory = {
  label: 'Wasmtime · GHSA-q8hx-mm92-4wvg',
  url: 'https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-q8hx-mm92-4wvg',
  note: 'CVE-2024-47763의 정확한 실행 조건, 영향·수정 version, CVSS, OSS-Fuzz 발견 기록입니다.',
}

const wasmtime25Patch = {
  label: 'Wasmtime 25.0.x · commit de3a581',
  url: 'https://github.com/bytecodealliance/wasmtime/commit/de3a5815d680f31473d8cb0eda9eb09708221480',
  note: '빈 Wasm frame sequence를 먼저 검사하고 네 가지 tail-call regression test를 추가한 공식 backport입니다.',
}

const wasmtime25Release = {
  label: 'Wasmtime 25.0.2 · 공식 release',
  url: 'https://github.com/bytecodealliance/wasmtime/releases/tag/v25.0.2',
  note: 'tail call과 stack trace·trap 결합의 runtime crash 수정과 advisory를 직접 연결합니다.',
}

const tailCallProposal = {
  label: 'WebAssembly · tail-call proposal',
  url: 'https://github.com/WebAssembly/tail-call',
  note: '`return_call`, `return_call_indirect`, `return_call_ref`의 표준화 자료입니다.',
}

const fuzzingMechanism = {
  id: 'w14-fuzzing-model-mechanism',
  type: 'mechanism',
  title: 'Coverage-guided fuzzing은 입력을 바꾸고 관찰 가능한 새 경로를 corpus에 되먹임한다',
  situation: '사람이 모든 byte 조합과 state 경계를 직접 쓰기 어려운 parser·runtime을 반복 시험하려면, 작고 결정적인 harness가 다양한 입력을 같은 함수와 같은 oracle에 공급해야 합니다. 새 coverage와 재현 가능한 실패만 다음 조사 자료로 보존합니다.',
  terms: [
    { term: 'Seed · 시드', meaning: 'fuzzer가 변형을 시작할 때 쓰는 작고 유효한 초기 입력입니다.', contrast: '실패를 일으킨 crash artifact나 모든 과거 입력 전체와 같지 않습니다.' },
    { term: 'Corpus · 코퍼스', meaning: '서로 다른 유용한 code path를 대표하도록 보존한 입력 집합입니다.', contrast: '파일 수가 많다고 coverage나 품질이 자동으로 좋아지는 것은 아닙니다.' },
    { term: 'Mutation · 변형', meaning: 'byte 삽입·삭제·교체처럼 기존 입력에서 새 후보를 만드는 연산입니다.', contrast: '변형 자체는 취약점이나 공격 성공을 뜻하지 않습니다.' },
    { term: 'Harness · 퍼즈 하네스', meaning: '입력 bytes를 어떤 초기 상태와 제한으로 테스트 대상 함수에 전달할지 정하는 작은 adapter입니다.', contrast: 'fuzzer engine은 후보를 만들고, harness는 제품 code와의 호출 계약을 정합니다.' },
    { term: 'Coverage · 커버리지', meaning: '이번 실행이 지나간 edge·block 같은 code path 신호입니다.', contrast: '도달했다는 사실이지 그 경로가 안전하거나 취약하다는 판정은 아닙니다.' },
    { term: 'Oracle · 오라클', meaning: 'crash, sanitizer finding, timeout, invariant 위반처럼 성공·실패를 판정하는 관찰 기준입니다.', contrast: '보안 영향·심각도·악용 가능성 전체를 자동 판정하지는 않습니다.' },
    { term: 'Artifact · 아티팩트', meaning: 'oracle을 만족한 입력과 build·option·진단을 묶은 재현 자료입니다.', contrast: '원본 환경 정보가 빠진 입력 파일 하나만으로는 같은 실패를 보장하지 않습니다.' },
  ],
  stages: [
    { label: '대상·oracle 고정', actor: 'developer·security reviewer', input: '함수 계약, 정상·오류 결과, CPU·memory limit', action: 'network와 운영 resource를 분리한 local target과 실패 판정을 정합니다.', output: '결정적인 harness contract' },
    { label: 'seed 선택', actor: 'corpus manager', input: '작은 정상 fixture와 기존 regression cases', action: '중복을 줄이고 중요한 형식·state를 대표하는 seed를 선택합니다.', output: '초기 corpus와 provenance' },
    { label: '후보 변형', actor: 'fuzzer engine', input: 'seed bytes와 mutation strategy', action: '크기·시간 제한 안에서 새 byte candidates를 만듭니다.', output: '한 번씩 실행할 candidate inputs' },
    { label: 'harness 실행', actor: 'fuzz target·product code', input: 'candidate bytes와 고정 초기 state', action: '같은 API를 호출하고 종료·오류·sanitizer signal을 관찰합니다.', output: 'coverage와 oracle result' },
    { label: '되먹임·보존', actor: 'coverage feedback·artifact store', input: '새 path 여부, failure signal, build ID', action: '새 coverage input은 corpus 후보로, 재현 가능한 failure는 별도 artifact로 보존합니다.', output: '줄어든 corpus와 triage queue' },
    { label: '분류·수정 연결', actor: 'maintainer', input: '재현 artifact, stack, source, 정상 baseline', action: '증상·실패 지점·근본 원인·영향을 분리하고 patch와 regression oracle을 설계합니다.', output: '검토 가능한 finding 또는 비보안 bug 기록' },
  ],
  trustBoundary: {
    before: 'fuzzer가 만든 bytes는 형식·길이·의미를 신뢰할 수 없고, coverage 숫자도 보안 결론이 아닙니다.',
    decision: 'harness가 input size·초기 state·외부 I/O를 제한하고 oracle이 process failure와 허용된 오류를 구분해야 합니다.',
    after: 'target은 격리된 local build에서 실행되고 재현 자료에는 input ID, build, option, 관찰 결과가 연결됩니다.',
    failure: 'harness가 network·시간·random state에 의존하거나 모든 오류를 무시하면 재현 불가능한 noise, 놓친 crash, 운영 대상 오용이 생깁니다.',
  },
}

const harnessTrace = {
  id: 'w14-fuzzing-model-harness-trace',
  type: 'code-trace',
  title: '고정된 parser 계약만 호출하는 교육용 local harness',
  evidenceKind: 'educational-model',
  language: 'python',
  description: '실제 fuzzer·제품 source가 아닌 구조 모델입니다. network·filesystem을 호출하지 않고 최대 64 bytes의 합성 record가 허용된 두 결과 중 하나로 끝나는지만 검사합니다.',
  code: '1  MAX_INPUT = 64\n2  ALLOWED_RESULTS = {"accepted", "rejected"}\n3  def fuzz_one(input_bytes):\n4      if len(input_bytes) > MAX_INPUT:\n5          return "skipped_by_harness"\n6      result = parse_training_record(input_bytes)\n7      assert result in ALLOWED_RESULTS\n8      return {"input_id": stable_digest(input_bytes), "oracle": result}',
  trace: [
    { lines: '1–2', before: 'candidate의 크기와 정상 종료 집합이 정해지지 않았습니다.', action: 'local resource ceiling과 허용된 parser 결과를 고정합니다.', after: 'timeout·무제한 allocation과 단순 reject를 같은 failure로 세지 않을 기준이 생깁니다.' },
    { lines: '3–5', before: '신뢰할 수 없는 bytes가 harness 경계에 도착합니다.', action: '64 bytes를 넘는 candidate는 product code 전에 건너뜁니다.', after: 'target에는 review한 크기 범위의 immutable bytes만 전달됩니다.' },
    { lines: '6', before: '아직 product contract의 결과가 없습니다.', action: '합성 parser를 같은 초기 state로 한 번 호출합니다.', after: '`accepted`, `rejected`, 예외·중단 중 하나를 관찰할 수 있습니다.' },
    { lines: '7–8', before: 'return value가 contract 안인지와 어떤 input이 만들었는지 분리되어 있습니다.', action: '허용 결과 invariant를 검사하고 원문 대신 stable ID와 oracle만 반환합니다.', after: 'invariant 위반은 triage 후보가 되고 credential·payload를 log에 남기지 않습니다.' },
  ],
}

const wasmtimeStackMechanism = {
  id: 'w14-fuzzing-model-wasmtime-stack-mechanism',
  type: 'mechanism',
  title: 'Wasmtime은 host와 Wasm 사이 trampoline 경계를 따라 stack trace의 끝을 찾아야 한다',
  situation: 'embedding application이 WebAssembly module을 실행하다 trap이나 host error를 받으면 어떤 Wasm function을 지나왔는지 stack trace로 설명해야 합니다. tail call은 현재 function frame을 재사용·대체할 수 있으므로 “entry와 exit 사이에 항상 Wasm frame이 하나 이상 있다”는 옛 가정은 더 이상 안전하지 않습니다.',
  terms: [
    { term: 'Wasmtime Runtime · 런타임', meaning: 'WebAssembly를 compile·instantiate·execute하고 host API와 연결하는 engine입니다.', contrast: 'Wasm module 자체나 application 전체와는 역할이 다릅니다.' },
    { term: 'Tail Call · 꼬리 호출', meaning: '현재 function이 결과를 직접 반환하는 대신 다음 function 호출을 자신의 마지막 동작으로 넘기는 호출입니다.', contrast: '일반 call처럼 현재 frame을 반드시 보존한 채 새 frame을 쌓지 않을 수 있습니다.' },
    { term: 'Imported Host Function · 호스트 import', meaning: 'Wasm이 호출할 수 있도록 embedding application이 제공한 native function입니다.', contrast: 'Wasm 내부 function이 아니므로 호출은 runtime trampoline 경계를 통과합니다.' },
    { term: 'Trampoline · 트램펄린', meaning: 'host ABI와 Wasm ABI 사이 register·stack state를 바꾸는 runtime 연결 code입니다.', contrast: 'application business function이 아니라 안전한 경계 전환을 담당합니다.' },
    { term: 'Stack Frame · 스택 프레임', meaning: '한 function 호출의 return address, saved frame pointer, local state를 담는 stack 구간입니다.', contrast: 'tail call 뒤에는 논리적 호출이 있었어도 해당 Wasm frame이 남지 않을 수 있습니다.' },
    { term: 'Stack Trace · 스택 추적', meaning: 'frame pointer chain과 code metadata를 따라 활성 호출 경로를 설명한 기록입니다.', contrast: 'source의 근본 원인이나 공격자 의도를 자동 확정하는 보고서는 아닙니다.' },
  ],
  stages: [
    { label: 'host 진입', actor: 'embedder·entry trampoline', input: 'validated module function, arguments, runtime limits', action: 'host ABI를 Wasm ABI로 전환하고 stack-walk 종료 경계를 기록합니다.', output: 'entry trampoline frame과 실행 context' },
    { label: 'Wasm 실행', actor: 'compiled Wasm function', input: 'Wasm values와 runtime context', action: 'instruction을 실행하고 필요하면 import 또는 다른 Wasm function을 호출합니다.', output: 'result, call, tail call, trap 중 하나' },
    { label: 'tail-call 전환', actor: '`return_call`·exit trampoline', input: '현재 Wasm frame과 imported host target', action: '현재 Wasm frame을 대체하고 host 호출 경계로 전환할 수 있습니다.', output: 'entry와 exit 사이 Wasm frame이 0개인 합법적 state 가능' },
    { label: 'host error·trace 요청', actor: 'imported host function·trap handler', input: 'host error 또는 trap과 현재 frame pointers', action: '진단을 위해 Wasm stack trace capture를 요청합니다.', output: 'stack-walk 시작 PC·FP와 entry boundary' },
    { label: '빈 구간 판정', actor: 'Wasmtime stack walker', input: '현재 `fp`, 기록된 `trampoline_sp`', action: '현재 frame pointer가 이미 entry boundary에 도달했는지 먼저 검사합니다.', output: '빈 Wasm sequence 또는 걸어야 할 Wasm frame chain' },
    { label: '안전 반환', actor: 'stack walker·embedder', input: '0개 이상의 decoded Wasm frames와 원래 host error', action: '허용된 빈 trace를 처리하고 error를 process abort 없이 caller에 반환합니다.', output: '정상 error handling과 가용한 process' },
  ],
  trustBoundary: {
    before: 'Wasm module이 정한 tail-call 흐름은 frame 개수와 host import 진입 순서를 바꿀 수 있습니다.',
    decision: 'runtime만이 trampoline boundary와 frame pointer를 알고 있으므로 stack walker가 0-frame state를 합법적으로 판정해야 합니다.',
    after: 'frame이 없으면 walk를 건너뛰고, 있으면 trusted boundary 안에서만 frame pointer를 따라갑니다.',
    failure: '0-frame state를 불가능하다고 가정하고 곧바로 loop에 들어가면 내부 assertion·panic이 발생해 host process가 중단될 수 있습니다.',
  },
}

const wasmtimePatchAnalysis = {
  id: 'w14-fuzzing-model-wasmtime-patch',
  type: 'patch-analysis',
  title: '공식 Wasmtime 25.0.x patch: stack-walk loop 전에 빈 Wasm frame 구간을 반환한다',
  evidenceKind: 'official-patch',
  source: wasmtime25Patch,
  language: 'rust',
  description: '25.0.2 release가 GHSA-q8hx-mm92-4wvg와 직접 연결한 commit `de3a581`의 `backtrace.rs` 실제 변경 줄입니다. 변경 전에는 alignment 확인 뒤 곧바로 loop에 들어갔고, 변경 후에는 현재 `fp`가 이미 entry boundary인지 먼저 확인합니다.',
  before: {
    label: '수정 전 · 실제 loop 진입 경계',
    code: 'arch::assert_entry_sp_is_aligned(trampoline_sp);\n\nloop {',
  },
  after: {
    label: '수정 후 · 실제 empty-sequence gate',
    code: 'arch::assert_entry_sp_is_aligned(trampoline_sp);\n\nif arch::reached_entry_sp(fp, trampoline_sp) {\n    log::trace!("=== Empty contiguous sequence of Wasm frames ===");\n    return ControlFlow::Continue(());\n}\n\nloop {',
  },
  changes: [
    '현재 `fp`와 entry trampoline의 saved stack pointer를 loop 전에 비교해 Wasm frame이 0개인 합법적 tail-call state를 식별합니다.',
    '경계에 이미 도달했다면 frame pointer를 Wasm frame으로 역참조하거나 기존 assertion을 통과시키려 하지 않고 `ControlFlow::Continue(())`를 반환합니다.',
    '원래 host function의 error·trap 흐름은 유지하면서 stack-trace helper의 panic과 process abort 경로를 제거합니다.',
    '25.0.x commit은 release note에 GHSA를 연결하고 direct, start function, `return_call_ref`, `return_call_indirect` 경로의 regression tests를 함께 추가합니다.',
    '21.0.x–24.0.x에도 각 release branch backport가 있고 advisory는 21.0.2, 22.0.1, 23.0.3, 24.0.1, 25.0.2를 patched versions로 지정합니다.',
  ],
  regressionTests: [
    { case: 'upstream `tail_call_to_imported_function`', expected: 'imported host error가 caller에 반환되고 runtime process는 abort하지 않음', reason: 'exported function의 direct tail call과 empty Wasm sequence를 확인합니다.' },
    { case: 'upstream `tail_call_to_imported_function_in_start_function`', expected: 'start function에서도 host error가 정상 전달됨', reason: 'instantiation 시작 경로가 같은 stack-walk 결함을 다시 만들지 않는지 확인합니다.' },
    { case: 'upstream `return_call_ref_to_imported_function`', expected: 'function reference tail call이 host error로 끝나고 panic하지 않음', reason: 'reference-based 호출 형태도 0-frame state를 안전하게 처리해야 합니다.' },
    { case: 'upstream `return_call_indirect_to_imported_function`', expected: 'table 간접 tail call에서도 원래 error가 유지됨', reason: 'indirect dispatch가 patch gate를 우회하지 않는지 확인합니다.' },
    { case: 'product normal-call regression', expected: 'tail call이 없는 정상 module의 stack frames와 error mapping이 기존 baseline을 유지', reason: '빈 구간 처리가 실제 frame이 있는 trace를 조기에 끊지 않는지 embedder 수준에서 확인합니다.' },
  ],
  limitation: '화면의 실제 diff는 advisory와 직접 연결된 25.0.x backport입니다. 다른 release line은 각 공식 patched release를 적용해야 하며 이 snippet만 복사해 독자 patch로 배포하지 않습니다. 실제 Wasm·crash payload, upstream regression input module, process abort, 외부 target을 재현하거나 실행하지 않습니다. test 이름·기대 state만 읽습니다.',
}

const wasmtimeImpact = {
  id: 'w14-fuzzing-model-wasmtime-impact',
  type: 'impact-map',
  title: 'CVE-2024-47763은 module 실행 권한과 tail-call·trace 조합이 모두 있어야 하는 availability 결함이다',
  intro: 'Wasmtime advisory의 CVSS 3.1은 AV:L/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H, 5.5입니다. routine fuzzing이 crash를 발견했다는 사실은 이 조건과 가용성 영향의 근거이지만 기밀성·무결성 영향이나 야생 악용을 뜻하지 않습니다.',
  dimensions: [
    { label: '기밀성', impact: '공식 평가는 C:N이며 이 결함이 host data를 읽거나 stack contents를 노출한다고 기록하지 않습니다.', condition: '정보 노출 주장은 별도 memory disclosure defect와 관찰 evidence가 필요합니다.' },
    { label: '무결성', impact: '공식 평가는 I:N이며 module이 host state를 변경하는 것이 이 CVE의 검증된 효과가 아닙니다.', condition: 'data·control-flow 변경은 이 process-abort 기록만으로 확장할 수 없습니다.' },
    { label: '가용성', impact: '영향 조합이 stack walker의 internal assertion·panic에 닿으면 embedding host process가 abort해 service instance를 사용할 수 없게 될 수 있습니다.', condition: '영향 Wasmtime version, tail calls enabled, module 실행 권한, exported function의 tail call to host import, host의 stack trace·trap capture가 함께 필요합니다.' },
  ],
  attackerControls: [
    '허용된 module 제출·실행 범위 안에서 Wasm function과 tail-call instruction 흐름',
    'exported entry가 어떤 imported host function을 tail-call하도록 연결하는지',
    'application이 제공한 host import 중 error·trap을 만들 수 있는 호출을 선택하는지',
  ],
  notControlled: [
    'embedder가 사용한 정확한 Wasmtime release line과 patched version',
    'tail-call feature가 disabled인지 default·explicit enabled인지',
    'host import가 stack trace를 capture하는지와 process isolation·restart 정책',
    'Wasmtime을 compile한 Rust version과 운영 service의 blast radius',
  ],
  access: {
    authentication: 'CVSS PR:L입니다. 공격자가 host에서 Wasm module 또는 component를 실행할 수 있는 낮은 권한이 필요합니다. 어떤 application login이 그 권한을 주는지는 deployment별로 다릅니다.',
    interaction: 'UI:N으로 다른 사용자의 추가 행동은 필요하지 않지만 host가 영향 module을 instantiate·call해야 합니다.',
    network: 'AV:L입니다. Wasmtime runtime 자체의 결함을 곧바로 원격 network 취약점으로 부르지 않습니다. remote module upload를 제공하는 서비스라면 그 reachability는 별도 application threat model입니다.',
    defaultExposure: '21.0.0–25.0.1의 advisory 지정 releases는 tail calls가 default-enabled인 범위입니다. 12.0.x–20.0.x는 default disabled라 기본 구성은 영향이 없지만 명시적으로 enabled했다면 disable 또는 upgrade가 필요합니다.',
    protections: '공식 patched version 적용이 root fix입니다. 임시로 `Config::wasm_tail_call(false)`를 사용하고 module admission, process isolation, resource limit, crash monitoring을 보완 통제로 두되 upgrade를 대체하지 않습니다.',
  },
}

const crashTriageMechanism = {
  id: 'w14-crash-triage-mechanism',
  type: 'mechanism',
  title: 'Crash triage는 증상 위치에서 시작해 재현 조건·실패 지점·근본 원인·영향을 따로 판정한다',
  situation: 'fuzzer가 process signal이나 sanitizer report를 남기면 같은 build에서 다시 나타나는지, 첫 의미 있는 application frame이 어디인지, 어떤 invariant가 깨졌는지, 운영 보안 영향이 무엇인지 단계별로 좁혀야 합니다.',
  terms: [
    { term: 'Symptom · 증상', meaning: 'abort, exception, sanitizer report, timeout처럼 관찰된 실패 결과입니다.', contrast: '증상이 표시된 마지막 줄이 근본 원인 줄과 같다는 보장은 없습니다.' },
    { term: 'Reproducer · 재현 자료', meaning: '같은 실패를 다시 관찰하게 하는 input, build, option, environment 묶음입니다.', contrast: 'input bytes만 남기고 build ID를 잃으면 같은 자료라고 보기 어렵습니다.' },
    { term: 'Failure Point · 실패 지점', meaning: '안전 invariant가 처음 깨지거나 잘못된 state가 효과로 나타난 정확한 code 경계입니다.', contrast: 'stack top이나 crash address만으로 source cause를 자동 확정하지 않습니다.' },
    { term: 'Root Cause · 근본 원인', meaning: '잘못된 가정·검사 누락·수명·경계 처리처럼 failure state를 가능하게 만든 원인입니다.', contrast: '“프로그램이 죽음”이라는 증상 설명보다 구체적입니다.' },
    { term: 'Deduplication · 중복 제거', meaning: '같은 failure signature로 보이는 artifacts를 한 조사 묶음으로 모으는 과정입니다.', contrast: 'stack hash가 같다고 모든 입력 조건과 영향이 반드시 같은 것은 아닙니다.' },
  ],
  stages: [
    { label: 'artifact 고정', actor: 'fuzzing service·triager', input: 'input ID, target, build, sanitizer, signal, stack', action: 'immutable copy와 provenance를 연결하고 민감 payload를 최소화합니다.', output: '재현 가능한 case ID' },
    { label: '같은 조건 재실행', actor: 'isolated local runner', input: 'case ID와 exact build options', action: '허가된 local fixture를 반복해 deterministic·flaky 여부를 확인합니다.', output: 'reproduction status와 횟수' },
    { label: '첫 관련 frame 찾기', actor: 'symbolizer·maintainer', input: 'symbolized stack와 source revision', action: 'runtime·sanitizer helper를 지나 첫 product frame과 state invariant를 찾습니다.', output: 'failure point 후보' },
    { label: '원인 가설 검증', actor: 'maintainer', input: 'source path, boundary values, nearby normal case', action: '증상 숨기기가 아니라 검사 누락·잘못된 가정이 state를 어떻게 바꾸는지 확인합니다.', output: 'root-cause statement 또는 미확정 질문' },
    { label: '영향 분리', actor: 'security reviewer', input: 'attacker control, prerequisite, resulting state, containment', action: 'crash·memory error를 CIA·권한·reachability 조건과 연결합니다.', output: '보안 finding, 일반 bug, 또는 evidence 부족 판정' },
    { label: 'patch·retest', actor: 'developer·CI', input: 'root fix, reproducer, normal corpus, adjacent cases', action: '실패가 사라지고 정상 behavior·coverage가 유지되는지 같은 build family에서 확인합니다.', output: 'reviewed fix와 regression evidence' },
  ],
  trustBoundary: {
    before: 'fuzzer report와 stack은 관찰 evidence이지만 attacker intent, exploitability, root cause는 아직 미확정입니다.',
    decision: 'triager가 build·input·first bad state를 연결하고 security reviewer가 control·impact prerequisite를 별도로 판단해야 합니다.',
    after: 'finding에는 재현 사실, 정확한 failure point, 원인 confidence, 영향 한계, patch oracle이 각각 구분됩니다.',
    failure: 'stack 첫 줄을 원인으로 복사하거나 sanitizer 종류만으로 severity를 정하면 잘못된 patch와 과장된 보고가 생깁니다.',
  },
}

const crashRecordTrace = {
  id: 'w14-crash-triage-record-trace',
  type: 'code-trace',
  title: '합성 crash card를 증상·원인 가설·영향 한계로 분리하기',
  evidenceKind: 'educational-model',
  language: 'yaml',
  description: '실제 Wasmtime input이나 sanitizer output이 아닌 fixed browser record입니다. 학생은 payload·address를 다루지 않고 triage field 사이의 관계만 읽습니다.',
  code: '1  case_id: PARSER-TRAINING-017\n2  build: parser-local-17 + asan + symbols\n3  input_ref: fixture-malformed-header-A\n4  reproduction: 3/3 local runs\n5  symptom: out_of_bounds_read_report\n6  first_product_frame: parse_header:boundary_read\n7  failure_state: requested_length_gt_remaining_bytes\n8  root_cause_status: bounds_check_missing_hypothesis\n9  security_impact: unconfirmed\n10 patch_oracle: malformed_rejected_without_sanitizer\n11 regression_oracle: normal_and_adjacent_fixtures_unchanged\n12 excluded: raw_payload, live_address, external_target, identity',
  trace: [
    { lines: '1–4', before: '진단 한 줄만 있고 어느 build·fixture에서 반복되는지 모릅니다.', action: 'case ID, instrumented build, fixture reference, 3회 local 재현을 연결합니다.', after: '같은 symptom을 다시 확인할 최소 provenance가 생깁니다.' },
    { lines: '5–7', before: 'out-of-bounds라는 symptom과 첫 잘못된 state가 섞여 있습니다.', action: 'report 종류, 첫 product frame, `requested_length > remaining_bytes` state를 분리합니다.', after: '문제가 효과를 낸 경계를 source review 질문으로 바꿀 수 있습니다.' },
    { lines: '8–9', before: '검사 누락과 보안 영향은 아직 검증되지 않았습니다.', action: '원인을 hypothesis로, impact를 unconfirmed로 명시합니다.', after: '도구 report만으로 severity를 확정하는 오류를 막습니다.' },
    { lines: '10–12', before: 'patch가 crash만 숨겼는지와 정상 회귀 여부를 판단할 기준이 없습니다.', action: '실패·정상 oracle을 정하고 raw payload·live address·외부 대상을 제외합니다.', after: '안전한 local regression plan과 data-minimized record가 남습니다.' },
  ],
}

const minimizeMechanism = {
  id: 'w14-minimize-retest-mechanism',
  type: 'mechanism',
  title: 'Input minimization은 같은 oracle을 유지하는 불필요한 조각만 제거한다',
  situation: '큰 fuzz artifact에는 failure와 무관한 bytes·records·options가 섞일 수 있습니다. 조사자는 원본을 보존한 채 candidate를 작게 만들고 매 단계 같은 build와 같은 oracle에서 실패가 유지되는지 확인해야 정확한 condition과 regression fixture를 만들 수 있습니다.',
  terms: [
    { term: 'Minimization · 최소화', meaning: '같은 failure oracle을 유지하면서 input의 byte·구조 요소를 줄이는 과정입니다.', contrast: 'payload를 더 강하게 만들거나 exploit reliability를 높이는 작업이 아닙니다.' },
    { term: 'Predicate · 판정식', meaning: 'candidate가 원래와 같은 failure인지 yes/no로 결정하는 재현 조건입니다.', contrast: '단순히 non-zero exit이면 서로 다른 crash까지 같은 것으로 섞을 수 있습니다.' },
    { term: 'Delta Debugging · 델타 디버깅', meaning: 'input 일부를 나누어 제거하고 predicate를 반복 검사하는 축소 전략입니다.', contrast: '한 번의 삭제 결과가 최소임을 보장하지 않아 반복과 기록이 필요합니다.' },
    { term: 'Regression Fixture · 회귀 fixture', meaning: '수정 뒤 같은 bug가 돌아오지 않았는지 자동 확인하도록 보존한 작은 test input입니다.', contrast: '원본 crash artifact를 삭제하거나 정상 corpus를 대체하지 않습니다.' },
    { term: 'Adjacent Case · 인접 사례', meaning: 'failure boundary 바로 아래·위 또는 비슷한 형식의 정상·오류 입력입니다.', contrast: '원래 failure 하나만 통과하는 과도한 special-case patch를 찾는 데 필요합니다.' },
  ],
  stages: [
    { label: '원본 보존', actor: 'artifact store', input: 'original reproducer와 digest', action: '원본은 immutable하게 두고 working copy를 만듭니다.', output: 'baseline artifact와 minimization copy' },
    { label: 'predicate 고정', actor: 'triager', input: 'build ID, sanitizer·error type, relevant frame·state', action: '같은 bug를 판정할 oracle과 timeout·repeat 수를 정합니다.', output: 'deterministic minimization test' },
    { label: 'candidate 축소', actor: 'minimizer', input: 'working copy와 removable chunks', action: '한 조각을 제거한 candidate를 만듭니다.', output: '더 작은 candidate' },
    { label: 'oracle 재확인', actor: 'isolated runner', input: 'candidate와 exact predicate', action: '같은 failure면 축소를 채택하고 다르면 되돌립니다.', output: 'accepted reduction과 decision log' },
    { label: '경계 사례 생성', actor: 'developer', input: 'minimal fixture와 parsed structure', action: '정상, 실패, 인접 length·state fixtures를 명시적으로 만듭니다.', output: 'regression matrix' },
    { label: 'patch 전후 비교', actor: 'CI·reviewer', input: 'vulnerable baseline, patched build, matrix', action: '실패 fixture 안전 처리와 정상·인접 behavior 보존을 비교합니다.', output: 'root fix evidence와 remaining limits' },
  ],
  trustBoundary: {
    before: '원본 artifact는 evidence이고 working candidate는 변형 중인 분석 자료입니다.',
    decision: '같은 build·oracle이 failure identity를 확인할 때만 reduction을 채택해야 합니다.',
    after: 'minimal fixture는 original ID와 연결되고 patch test에는 정상·실패·인접 기대값이 함께 있습니다.',
    failure: 'exit code만 비교하거나 원본을 덮어쓰면 다른 crash로 바뀐 사실, flaky state, evidence provenance를 잃을 수 있습니다.',
  },
}

const minimizationTrace = {
  id: 'w14-minimize-retest-decision-trace',
  type: 'code-trace',
  title: '원본을 보존하고 같은 oracle일 때만 축소를 채택하는 합성 기록',
  evidenceKind: 'educational-model',
  language: 'text',
  description: '실제 crash bytes가 없는 decision log입니다. 각 candidate는 내용 대신 합성 ID와 길이만 표시합니다.',
  code: '1  original: FIXTURE-A bytes=48 digest=TRAINING-ORIGINAL-01\n2  predicate: build=parser-local-17 state=requested_length_gt_remaining\n3  candidate-1: bytes=32 same_oracle=true  decision=keep_reduction\n4  candidate-2: bytes=16 same_oracle=false decision=restore_candidate-1\n5  candidate-3: bytes=24 same_oracle=true  decision=keep_reduction\n6  minimal_ref: FIXTURE-A-MIN bytes=24 parent=FIXTURE-A\n7  vulnerable: minimal=oracle_hit normal=accepted adjacent=rejected\n8  patched:    minimal=safe_reject normal=accepted adjacent=rejected\n9  result: root_failure_removed_and_baseline_preserved',
  trace: [
    { lines: '1–2', before: '원본과 failure identity를 판정할 기준이 없습니다.', action: 'immutable digest와 build·state predicate를 고정합니다.', after: 'working copy가 바뀌어도 어떤 원본·bug와 비교하는지 유지됩니다.' },
    { lines: '3–5', before: '각 축소가 같은 failure를 유지하는지 모릅니다.', action: 'same-oracle일 때만 reduction을 채택하고 다른 결과는 직전 candidate로 되돌립니다.', after: '단순히 가장 작은 exit failure가 아니라 같은 state를 만드는 작은 fixture가 남습니다.' },
    { lines: '6', before: '축소본과 원본의 provenance가 분리되어 있습니다.', action: 'minimal ID에 parent original을 연결합니다.', after: '회귀 test와 조사 evidence를 양방향으로 추적할 수 있습니다.' },
    { lines: '7–9', before: 'patch가 failure만 숨기거나 정상 동작을 깨뜨렸을 수 있습니다.', action: 'vulnerable·patched build에서 minimal, normal, adjacent oracle을 비교합니다.', after: 'root failure 제거와 baseline 보존을 동시에 주장할 evidence가 생깁니다.' },
  ],
}

const fuzzingControls = {
  id: 'w14-minimize-retest-control-layers',
  type: 'comparison',
  title: 'Code·config·permission·log·test를 fuzzing pipeline에 연결하기',
  columns: ['층', '무엇을 제한·수정하는가', '검증 evidence'],
  rows: [
    ['Code', 'root cause의 boundary·state invariant를 product source에서 수정하고 error를 명시적으로 반환', 'actual diff, source review, minimal fixture의 oracle 변화'],
    ['Config', 'input size, timeout, memory, sanitizer, tail-call 같은 feature flag를 review한 profile로 고정', 'versioned build manifest와 effective option snapshot'],
    ['Permission', 'fuzz worker를 network·production data·credential 없이 격리하고 artifact 접근을 최소화', 'sandbox policy, service account scope, egress·secret absence 확인'],
    ['Log', 'raw input 대신 case ID, build, sanitizer, first frame, repeat count, patch status를 보존', 'triage card와 artifact digest; payload·identity 최소화'],
    ['Test', 'upstream regression과 product 정상·실패·인접 corpus를 vulnerable·patched build에서 비교', 'expected error 유지, process availability, baseline behavior, 새 sanitizer finding 없음'],
  ],
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichWasmtimeCve(block) {
  const additions = [wasmtimeProject, wasmtimeAdvisory, wasmtime25Patch, wasmtime25Release, tailCallProposal, ossFuzzDoc]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    title: 'Fuzzing 발견 사례: Wasmtime의 0-frame stack-walk 가정이 process abort로 이어지다',
    productRole: 'Wasmtime은 WebAssembly module·component를 compile·instantiate·execute하고 host application의 imported functions와 연결하는 runtime입니다.',
    weakness: 'tail call 뒤 빈 Wasm frame sequence 처리 누락 · internal assertion/panic · denial of service',
    affectedVersions: 'default tail-call 범위: 21.0.0, 21.0.1, 22.0.0, 23.0.0–23.0.2, 24.0.0, 25.0.0–25.0.1. 12.0.x–20.0.x는 default disabled지만 tail calls를 명시적으로 enabled했다면 영향 가능',
    fixedVersions: '21.0.2, 22.0.1, 23.0.3, 24.0.1, 25.0.2. 또는 공식 workaround로 tail calls disable 후 patched release로 upgrade',
    cause: 'exported Wasm function이 `return_call`, `return_call_indirect`, 또는 `return_call_ref`로 imported host function을 tail-call하면 entry·exit trampoline 사이 Wasm frame이 0개일 수 있습니다. 기존 stack walker는 frame이 항상 하나 이상 있다고 보고 loop에 들어가 내부 assertion·panic을 일으켰습니다.',
    condition: '공격자가 영향을 받는 Wasmtime embedder에서 module·component를 실행할 권한이 있고 tail calls가 enabled되어야 합니다. 선택한 host import가 stack trace를 capture하거나 trap을 만들 때 조합이 성립합니다. 수업은 Wasm module·crash input·process abort를 실행하지 않고 official diff와 고정 state card만 읽습니다.',
    patch: 'release branch의 실제 backports는 stack-walk loop 전에 `arch::reached_entry_sp(fp, trampoline_sp)`로 현재 `fp`가 entry boundary에 이미 도달했는지 검사하고 빈 sequence면 `ControlFlow::Continue(())`를 반환합니다. 대표 25.0.x commit `de3a581`은 25.0.2 release note와 네 tail-call regression tests도 함께 추가했습니다.',
    followOn: 'advisory는 routine OSS-Fuzz 발견과 야생 악용 evidence가 없음을 기록합니다. 다른 Wasmtime crash, sanitizer finding, WebAssembly runtime의 기밀성·무결성 문제로의 연결은 검증되지 않아 미채택입니다.',
    facts: [
      'Rust 1.80 이하는 panic이 `extern "C"` 경계를 unwind하며 undefined behavior가 될 수 있고, Rust 1.81 이상은 deterministic process abort로 설명됩니다.',
      '공식 영향은 availability뿐이며 CVSS는 AV:L/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H입니다.',
      'coverage와 crash 발견은 triage 시작점이고 정확한 조건·patch·regression은 source와 release evidence로 별도 확인합니다.',
      'local 활동은 fixed synthetic logs만 사용하며 실제 Wasm·crash payload·외부 service를 실행하지 않습니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichFuzzingModel(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichWasmtimeCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    fuzzingMechanism,
    harnessTrace,
    wasmtimeStackMechanism,
    cve,
    wasmtimePatchAnalysis,
    wasmtimeImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [libFuzzerDoc, ossFuzzDoc, wasmtimeProject, wasmtimeAdvisory, wasmtime25Patch, wasmtime25Release, tailCallProposal])
    : block)
}

function enrichWithBlocks(blocks, additions, sources) {
  const enriched = addAfter(blocks, (block) => block.type === 'explanation', additions)
  return enriched.map((block) => block.type === 'sources' ? appendUniqueSources(block, sources) : block)
}

export function buildWeek13FuzzingGuide(modules) {
  const enrichers = {
    'w14-fuzzing-model': enrichFuzzingModel,
    'w14-crash-triage': (blocks) => enrichWithBlocks(blocks, [crashTriageMechanism, crashRecordTrace], [asanDoc, libFuzzerDoc, ossFuzzDoc]),
    'w14-minimize-retest': (blocks) => enrichWithBlocks(blocks, [minimizeMechanism, minimizationTrace, fuzzingControls], [libFuzzerDoc, asanDoc, ossFuzzDoc]),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
