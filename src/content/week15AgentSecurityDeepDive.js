const nvdLlamaIndex = {
  label: 'NVD · CVE-2024-3098',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3098',
  note: 'safe_eval 입력 검증 부족, CVE-2023-39662 bypass 관계, < 0.10.24 영향 범위, CNA CVSS를 확인합니다.',
}

const llamaIndexPatch = {
  label: 'LlamaIndex · v0.10.24 merged-PR commit 2c92e88',
  url: 'https://github.com/run-llama/llama_index/commit/2c92e88838a5f481d50840240b1dd3180066c6f5',
  note: 'v0.10.24 release branch에 들어간 실제 exec_utils.py 보안 diff와 수정된 upstream tests입니다.',
}

const llamaIndexReferencedPatch = {
  label: 'LlamaIndex · NVD-linked patch 5fbcb5a',
  url: 'https://github.com/run-llama/llama_index/commit/5fbcb5a8b9f20f81b791c7fc8849e352613ab475',
  note: 'NVD가 직접 연결한 선행 patch commit입니다. release tag에는 보완된 merged-PR commit 2c92e88이 포함됩니다.',
}

const llamaIndexRelease = {
  label: 'LlamaIndex · v0.10.24 source tag',
  url: 'https://github.com/run-llama/llama_index/tree/v0.10.24',
  note: '보호 코드와 PandasQueryEngine tests가 포함된 실제 release source tree입니다.',
}

const pandasQueryEngineSource = {
  label: 'LlamaIndex v0.10.24 · PandasQueryEngine source',
  url: 'https://github.com/run-llama/llama_index/blob/v0.10.24/llama-index-core/llama_index/core/query_engine/pandas/pandas_query_engine.py',
  note: 'table context, LLM-generated pandas instruction, parser, response metadata로 이어지는 정상 product flow입니다.',
}

const pandasOutputParserSource = {
  label: 'LlamaIndex v0.10.24 · pandas output parser source',
  url: 'https://github.com/run-llama/llama_index/blob/v0.10.24/llama-index-core/llama_index/core/query_engine/pandas/output_parser.py',
  note: 'LLM output을 AST로 나누고 safe_exec·safe_eval에 전달하는 실제 interpreter 경계입니다.',
}

const owaspPromptInjection = {
  label: 'OWASP GenAI · LLM01 Prompt Injection',
  url: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/',
  note: '외부 content의 지시를 trusted policy와 분리하고 downstream control을 두어야 하는 공식 위험 설명입니다.',
}

const owaspExcessiveAgency = {
  label: 'OWASP GenAI · LLM06:2025 Excessive Agency',
  url: 'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/',
  note: '최소 extension·function·permission, downstream authorization, human approval, logging의 공식 권고입니다.',
}

const nistAiRmf = {
  label: 'NIST · AI Risk Management Framework',
  url: 'https://www.nist.gov/itl/ai-risk-management-framework',
  note: 'AI risk를 context, measurement, management, governance와 반복 검증으로 연결하는 공식 framework입니다.',
}

const agentSystemMechanism = {
  id: 'w16-agent-boundaries-system-mechanism',
  type: 'mechanism',
  title: 'Agent는 model 답변이 아니라 data·proposal·policy·permission·execution을 잇는 상태 기계다',
  situation: '사용자 목표를 처리하기 위해 검색 문서와 model reasoning을 이용하더라도, 비신뢰 data가 곧 명령이나 실행 권한이 되면 안 됩니다. model은 tool call을 제안할 수 있지만 deterministic policy와 downstream system이 실제 실행 가능 여부를 다시 판단해야 합니다.',
  terms: [
    { term: 'Agent · 에이전트', meaning: '목표를 받아 model, memory, retrieval, tools, policy를 여러 단계로 조정하는 application입니다.', contrast: 'LLM 한 번의 응답이나 자유롭게 행동하는 독립 행위자와 같은 뜻은 아닙니다.' },
    { term: 'Retrieved Context · 검색 문맥', meaning: '질문에 참고하도록 index·document store에서 가져온 data입니다.', contrast: '검색됐다는 이유만으로 system policy나 authorized instruction이 되지 않습니다.' },
    { term: 'Tool Proposal · 도구 제안', meaning: 'model이 어떤 tool과 arguments가 목표에 유용하다고 구조화해 제시한 후보입니다.', contrast: 'proposal state는 실행 완료나 권한 승인 상태가 아닙니다.' },
    { term: 'Policy Enforcement Point · 정책 집행점', meaning: 'allowlist, argument schema, resource scope, user authorization, approval을 deterministic하게 검사하는 component입니다.', contrast: 'prompt 안의 “규칙을 지켜라” 문장만으로 대체할 수 없습니다.' },
    { term: 'Human-in-the-loop · 사람 승인', meaning: '고영향 action의 대상·효과를 사람이 확인하고 특정 proposal을 승인하는 절차입니다.', contrast: '모든 위험을 사람에게 떠넘기거나 이미 실행된 행동을 사후 확인하는 단계가 아닙니다.' },
    { term: 'Audit Event · 감사 사건', meaning: 'request, proposal, policy version, decision, actor, result를 비밀 없이 연결한 record입니다.', contrast: 'model chain-of-thought 전문이나 token·개인정보를 저장해야 한다는 뜻은 아닙니다.' },
  ],
  stages: [
    { label: '목표 수신', actor: 'application·authenticated user', input: 'user identity, declared goal, tenant·resource scope', action: '요청을 data와 action intent로 나누고 request ID를 발급합니다.', output: 'identity-bound goal context' },
    { label: '문맥 검색', actor: 'retriever', input: 'goal과 authorized data scope', action: '허용된 합성 문서를 가져오고 source·trust label을 붙입니다.', output: 'untrusted-or-bounded context records' },
    { label: '후보 생성', actor: 'LLM·planner', input: 'system policy summary, user goal, labeled context', action: '답변 또는 structured tool proposal을 생성합니다.', output: 'untrusted model output in proposed state' },
    { label: '정책 검증', actor: 'policy enforcement point', input: 'principal, tool name, arguments, resource, current policy', action: 'allowlist, schema, scope, rate, conflict, approval requirement를 전부 검사합니다.', output: 'deny 또는 approval-pending·allowed proposal' },
    { label: '권한·승인 확인', actor: 'downstream authorization·human approver', input: 'validated proposal과 user context', action: '실제 resource permission을 다시 확인하고 필요한 고영향 action만 명시적으로 승인합니다.', output: 'time-bound execution grant 또는 deny' },
    { label: '제한 실행', actor: 'least-privilege tool adapter', input: 'one approved action과 scoped credential', action: '지정 resource에 한 번의 bounded operation만 수행하고 timeout·quota를 적용합니다.', output: 'structured result or safe error' },
    { label: '출력 검증·기록', actor: 'output validator·audit service', input: 'tool result, schema, sensitivity rules, decision context', action: 'type·allowed values·source·redaction을 확인하고 decision evidence를 남깁니다.', output: 'validated response and traceable audit event' },
  ],
  trustBoundary: {
    before: 'user text, retrieved document, model output은 모두 application으로 들어오는 data이며 실행 authority가 아닙니다.',
    decision: 'model 밖의 policy enforcement point와 downstream authorization이 identity·tool·argument·resource·approval을 완전히 중재해야 합니다.',
    after: '허용된 proposal 하나만 scoped tool adapter에 전달되고 result는 검증된 뒤 사용자에게 돌아갑니다.',
    failure: '검색 문서의 지시나 model proposal을 곧바로 실행하면 prompt injection이 tool permission으로 변환됩니다. 실패 지점은 “model이 틀린 말을 한 순간”보다 proposal과 execution 사이의 독립 검증이 생략된 선입니다.',
  },
}

const agentBoundaryTrace = {
  id: 'w16-agent-boundaries-state-trace',
  type: 'code-trace',
  title: '합성 support agent에서 data와 authority를 분리한 상태 기록',
  evidenceKind: 'educational-model',
  source: owaspExcessiveAgency,
  language: 'yaml',
  description: '실제 model·API·ticket system이 없는 fixed browser record입니다. 정상 read proposal이 어느 검사를 통과해야 하는지만 보여 줍니다.',
  code: '1  request: {id: TRAINING-REQ-15, principal: learner, goal: summarize_ticket}\n2  retrieved: {document: SYNTHETIC-DOC-4, trust: data_only, instructions_authorized: false}\n3  model_output: {state: proposed, tool: ticket.read, args: {id: TRAINING-042}}\n4  policy: {version: v5, allow_tools: [ticket.read], deny_tools: [ticket.write, message.send]}\n5  schema_check: {ticket_id_prefix: TRAINING-, valid: true}\n6  resource_scope: {allowed: TRAINING-042, valid: true}\n7  approval: {required: false, reason: read_only_training_fixture}\n8  execution: {adapter: MOCK_ONLY, state: allowed_once}\n9  output_check: {schema: ticket_summary_v1, secrets: absent, source_attached: true}\n10 audit: {request_id: TRAINING-REQ-15, decision: ALLOW, policy_version: v5}\n11 live_model_api_credentials_network_tools: absent',
  trace: [
    { lines: '1–2', before: '사용자 목표와 검색 문서가 같은 text buffer에 들어가 역할이 섞일 수 있습니다.', action: 'principal·goal과 합성 문서를 분리하고 문서 지시는 authorized가 아니라고 표시합니다.', after: 'retrieved content는 참고 data로 남고 policy를 바꿀 수 없습니다.' },
    { lines: '3–4', before: 'model이 tool과 arguments를 생성했지만 아직 어떤 권한도 없습니다.', action: '상태를 `proposed`로 고정하고 allow·deny tool set을 별도 policy version에서 읽습니다.', after: 'model output과 enforcement decision이 서로 다른 owner·state가 됩니다.' },
    { lines: '5–7', before: 'tool 이름만 허용됐고 argument·resource·approval 조건은 미확인입니다.', action: 'schema, training resource scope, read-only approval rule을 각각 평가합니다.', after: '같은 tool이라도 범위를 벗어난 argument는 실행선에 도달하지 못합니다.' },
    { lines: '8–11', before: '실행 grant 뒤 result와 evidence 처리 상태가 없습니다.', action: 'one-shot mock adapter, output schema·secret·source 검사, 최소 audit fields, live capability 부재를 기록합니다.', after: '정상 결과가 나와도 이 fixture를 실제 agent security 보장으로 확대하지 않습니다.' },
  ],
}

const llamaIndexMechanism = {
  id: 'w16-agent-boundaries-llamaindex-mechanism',
  type: 'mechanism',
  title: 'PandasQueryEngine은 자연어 질문을 Python 표현식으로 바꾼 뒤 interpreter 경계를 통과시킨다',
  situation: '사용자가 DataFrame을 자연어로 질의하면 LlamaIndex는 table 일부와 질문을 LLM에 보내 pandas instruction을 만들고 그 결과를 평가해 답을 반환합니다. 이 편의 기능에서는 model-generated code와 Python process 사이가 핵심 신뢰 경계입니다.',
  terms: [
    { term: 'DataFrame · 데이터프레임', meaning: '행과 열로 구성된 pandas in-memory table입니다.', contrast: 'database server 전체나 임의 file system과 자동으로 같은 권한 범위는 아닙니다.' },
    { term: 'Pandas Instruction · pandas 명령', meaning: '질문에 답하도록 LLM이 생성한 Python/pandas expression text입니다.', contrast: '사용자가 직접 입력하지 않았어도 신뢰할 수 있는 source code로 간주할 수 없습니다.' },
    { term: 'AST · 추상 구문 트리', meaning: 'Python source를 Name, Attribute, Import, Call 같은 syntax node로 바꾼 구조입니다.', contrast: 'parse 성공은 안전성이나 permission 허용을 뜻하지 않습니다.' },
    { term: 'safe_eval / safe_exec', meaning: '실행 전 source를 검사하고 제한된 globals로 Python expression·statement를 평가하려는 LlamaIndex helper입니다.', contrast: '이름에 safe가 있어도 모든 version·input·host permission에서 완전한 sandbox라는 보장은 아닙니다.' },
    { term: 'Builtin · 내장 이름', meaning: '별도 import 없이 Python runtime이 제공하는 function·type 이름입니다.', contrast: '내장이라는 이유로 model-generated code에 모두 허용해도 안전하다는 뜻은 아닙니다.' },
    { term: 'Process Permission · 프로세스 권한', meaning: 'Python process가 file, network, environment, child process에 실제로 행사할 수 있는 OS 권한입니다.', contrast: 'application-level prompt rule과 별개이며 code execution 영향의 상한을 결정합니다.' },
  ],
  stages: [
    { label: 'table 문맥 구성', actor: '`PandasQueryEngine._get_table_context`', input: 'configured DataFrame', action: '`df.head()`를 string으로 만들어 prompt context를 준비합니다.', output: 'bounded table preview text' },
    { label: 'instruction 생성', actor: '`_llm.predict`', input: 'pandas prompt, table preview, user query', action: '질문에 답할 pandas/Python instruction text를 생성합니다.', output: 'untrusted `pandas_response_str`' },
    { label: 'parser 전달', actor: '`PandasInstructionParser.parse`', input: 'LLM-generated instruction과 DataFrame', action: '`default_output_processor`로 instruction을 넘깁니다.', output: 'candidate Python source at execution boundary' },
    { label: 'AST 분할', actor: '`default_output_processor`', input: 'candidate source', action: '`ast.parse` 뒤 마지막 node 전까지 `safe_exec`, 마지막 expression은 `safe_eval` 대상으로 분리합니다.', output: 'statement source and final expression source' },
    { label: 'source 안전 검사', actor: '`_verify_source_safety`·`DunderVisitor`', input: '각 source fragment', action: 'private·dunder, disallowed builtin, import syntax를 찾아 RuntimeError 또는 evaluation으로 분기합니다.', output: 'blocked error 또는 restricted evaluation candidate' },
    { label: '평가·응답', actor: 'Python evaluator·query engine', input: 'restricted globals, local `df`, accepted source', action: '결과를 string으로 만들고 instruction·raw output을 response metadata에 연결합니다.', output: 'Pandas result or safe error response' },
  ],
  trustBoundary: {
    before: 'LLM이 생성한 `pandas_response_str`은 application source가 아니라 user query와 model behavior에 영향받는 비신뢰 code text입니다.',
    decision: '`_verify_source_safety`와 OS sandbox·process permission이 code가 interpreter에 들어가도 되는지 판단해야 합니다.',
    after: '허용된 DataFrame expression만 제한된 context에서 평가되고 result·error가 response로 돌아갑니다.',
    failure: '0.10.24 전에는 `DunderVisitor`가 private 이름만 flag하고 `_contains_protected_access`가 `return dunder_visitor.has_access_to_private_entity`만 반환했습니다. 동시에 `getattr`, `hasattr`, `iter`, `next`, `setattr`이 allowlist에 남아 있어 NVD가 기록한 method restriction bypass 경계가 생겼습니다.',
  },
}

const llamaIndexPatchAnalysis = {
  id: 'w16-agent-boundaries-llamaindex-patch',
  type: 'patch-analysis',
  title: '실제 v0.10.24 patch: private-name 단일 판정을 builtin·import까지 넓힌다',
  evidenceKind: 'official-patch',
  source: llamaIndexPatch,
  language: 'python',
  description: 'release tag에 포함된 merged-PR commit `2c92e888...`의 `exec_utils.py`에서 보안 결정을 담당하는 실제 함수 발췌입니다. 실행 payload는 포함하지 않습니다.',
  before: {
    label: 'v0.10.23 실제 취약 판정 코드',
    code: 'class DunderVisitor(ast.NodeVisitor):\n    def __init__(self) -> None:\n        self.has_access_to_private_entity = False\n\n    def visit_Name(self, node: ast.Name) -> None:\n        if node.id.startswith("_"):\n            self.has_access_to_private_entity = True\n        self.generic_visit(node)\n\n    def visit_Attribute(self, node: ast.Attribute) -> None:\n        if node.attr.startswith("_"):\n            self.has_access_to_private_entity = True\n        self.generic_visit(node)\n\n\ndef _contains_protected_access(code: str) -> bool:\n    tree = ast.parse(code)\n    dunder_visitor = DunderVisitor()\n    dunder_visitor.visit(tree)\n    return dunder_visitor.has_access_to_private_entity',
  },
  after: {
    label: 'v0.10.24 실제 보호 판정 코드',
    code: 'class DunderVisitor(ast.NodeVisitor):\n    def __init__(self) -> None:\n        self.has_access_to_private_entity = False\n        self.has_access_to_disallowed_builtin = False\n\n        builtins = globals()["__builtins__"].keys()\n        self._builtins = builtins\n\n    def visit_Name(self, node: ast.Name) -> None:\n        if node.id.startswith("_"):\n            self.has_access_to_private_entity = True\n        if node.id not in ALLOWED_BUILTINS and node.id in self._builtins:\n            self.has_access_to_disallowed_builtin = True\n        self.generic_visit(node)\n\n    def visit_Attribute(self, node: ast.Attribute) -> None:\n        if node.attr.startswith("_"):\n            self.has_access_to_private_entity = True\n        if node.attr not in ALLOWED_BUILTINS and node.attr in self._builtins:\n            self.has_access_to_disallowed_builtin = True\n        self.generic_visit(node)\n\n\ndef _contains_protected_access(code: str) -> bool:\n    imports_modules = False\n    tree = ast.parse(code)\n    for node in ast.iter_child_nodes(tree):\n        if isinstance(node, ast.Import):\n            imports_modules = True\n        elif isinstance(node, ast.ImportFrom):\n            imports_modules = True\n        else:\n            continue\n\n    dunder_visitor = DunderVisitor()\n    dunder_visitor.visit(tree)\n    return (\n        dunder_visitor.has_access_to_private_entity\n        or dunder_visitor.has_access_to_disallowed_builtin\n        or imports_modules\n    )',
  },
  changes: [
    '실제 allowlist에서 `getattr`, `hasattr`, `iter`, `next`, `setattr`을 제거해 reflection·mutation에 사용할 수 있는 builtin 표면을 줄였습니다.',
    '`DunderVisitor`에 `has_access_to_disallowed_builtin` state와 runtime builtin names를 추가했습니다.',
    '`visit_Name`과 `visit_Attribute`가 allowlist 밖이면서 실제 builtin인 이름·속성을 별도로 flag합니다.',
    '`_contains_protected_access`가 top-level `Import`·`ImportFrom` syntax를 탐지하고 private, disallowed builtin, import 세 조건 중 하나라도 true면 차단합니다.',
    '오류 문구도 private·dunder뿐 아니라 disallowed builtins와 imports를 포함하도록 바뀌었습니다.',
    'NVD-linked `5fbcb5a`는 선행 commit이고 실제 v0.10.24 tag에는 보완된 merged-PR commit `2c92e88`이 들어 있습니다.',
  ],
  regressionTests: [
    { case: 'upstream `test_default_output_processor_rce2`', expected: '기존 안전 regression fixture가 더 넓어진 protected-access 오류 문구로 거절됨', reason: '2c92e88이 실제로 수정한 test assertion입니다. 위험 payload 내용은 화면에 재수록하지 않습니다.' },
    { case: 'upstream `test_default_output_processor_e2e`', expected: '정상 Berlin population query는 scalar 결과를 유지하고 기존 두 negative paths는 file을 만들지 않음', reason: 'patch가 정상 query expected value도 함께 고쳐 security rejection과 useful behavior를 같은 suite에서 확인합니다.' },
    { case: 'upstream `test_default_output_processor_rce` baseline', expected: 'private/import 관련 기존 fixture가 v0.10.24 tree에서도 side effect 없이 거절됨', reason: '새 builtin·import 판정이 이전 dunder protection을 퇴행시키지 않는지 확인하는 기존 test입니다.' },
    { case: '교육용 AST allow fixture', expected: '고정 DataFrame read expression의 Name·Attribute가 approved set에 있을 때만 evaluation candidate', reason: '운영 DataFrame이나 interpreter를 실행하지 않고 정상 oracle을 설계합니다.' },
    { case: '교육용 AST deny fixtures', expected: 'private name, disallowed builtin, import node 각각이 protected state가 되어 evaluation 전 거절', reason: '세 patch branch를 exploit payload 없이 독립적으로 재시험합니다.' },
    { case: 'version·process boundary check', expected: 'installed package가 0.10.24 이상이고 interpreter worker가 network·write·secret permission 없이 격리됨', reason: 'source patch 확인과 실제 deployment blast-radius 제한은 서로 다른 evidence입니다.' },
  ],
  limitation: '이 block의 before·after는 실제 LlamaIndex source이며 교육용 재현 code가 아닙니다. 보안 결정 함수만 발췌했고 allowlist 전체·payload·실행 command는 싣지 않았습니다. 이 과정은 LlamaIndex package, model API, DataFrame, file creation, safe_eval, shell, network를 실행하지 않습니다.',
}

const llamaIndexImpact = {
  id: 'w16-agent-boundaries-llamaindex-impact',
  type: 'impact-map',
  title: 'CVE 영향은 vulnerable evaluation path와 Python process permission이 함께 있을 때 성립한다',
  intro: 'NVD에는 NIST 자체 score가 없고 CNA huntr.dev score가 9.8 CRITICAL, `CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`로 표시됩니다. library의 모든 설치가 곧 network-exposed RCE라는 뜻은 아니며 application data flow를 함께 확인해야 합니다.',
  dimensions: [
    { label: '기밀성', impact: '성공한 arbitrary code execution이 process가 읽을 수 있는 table, file, environment data에 도달할 수 있어 C:H로 평가됩니다.', condition: '취약 <0.10.24 path, attacker-influenced query, generated code bypass, process read permission, 실제 sensitive data가 모두 이어져야 합니다.' },
    { label: '무결성', impact: 'process 권한으로 file·application state를 바꿀 수 있는 deployment에서는 I:H 영향이 가능합니다.', condition: '평가된 code가 side effect API에 도달하고 worker가 write permission을 가져야 합니다.' },
    { label: '가용성', impact: 'process 또는 연결 resource를 중단·소진할 수 있는 권한이 있으면 A:H 영향이 가능합니다.', condition: 'code execution 뒤 resource consumption·termination capability가 있고 isolation·quota가 이를 막지 못해야 합니다.' },
  ],
  attackerControls: [
    'application이 허용한 범위에서 user query 또는 prompt에 넣는 text와 요청 시점',
    '간접 prompt data를 application이 같은 PandasQueryEngine context에 넣는 경우 그 content',
    '공개 service라면 반복 요청 수와 선택한 exposed query route',
  ],
  notControlled: [
    'LLM이 매번 생성하는 exact Python expression과 model configuration',
    '설치된 LlamaIndex version과 v0.10.24 patch 적용 여부',
    'PandasQueryEngine 사용 여부와 safe_eval까지 이어지는 application wiring',
    'Python worker의 file·network·secret·OS permissions와 sandbox·quota',
  ],
  access: {
    authentication: 'CNA vector는 PR:N입니다. 그러나 LlamaIndex는 library이므로 실제 app route가 authentication을 요구하는지는 deployment evidence로 별도 확인해야 합니다.',
    interaction: 'UI:N은 다른 피해 사용자의 별도 동작이 필요 없다는 CNA 평가입니다. model이 code를 생성하는 내부 step은 사용자 상호작용 metric과 다릅니다.',
    network: 'AV:N은 network로 도달 가능한 application 배치를 전제로 한 평가입니다. package import 자체가 network listener를 여는 것은 아닙니다.',
    defaultExposure: '현재 NVD affected record는 `llama_index` 0 이상 0.10.24 미만입니다. 그중 user-controlled input이 PandasQueryEngine의 generated-code evaluation path에 도달하는 application이 구체적 조사 대상입니다.',
    protections: '0.10.24 이상 upgrade가 공식 root remediation입니다. interpreter 제거·분리, read-only worker, network egress deny, secret 부재, schema allowlist, audit는 defense in depth이며 version patch를 대체하지 않습니다.',
  },
}

const toolControlMechanism = {
  id: 'w16-agent-controls-enforcement-mechanism',
  type: 'mechanism',
  title: '도구 통제는 model proposal을 매번 identity-bound permission으로 다시 계산한다',
  situation: 'agent가 여러 tool 중 하나를 골라도 실제 실행은 tool adapter가 가진 권한과 downstream system의 authorization에 의해 결정됩니다. 같은 tool name이라도 principal, action, resource, arguments, approval, time이 달라지면 결과가 달라져야 합니다.',
  terms: [
    { term: 'Tool Allowlist · 도구 허용 목록', meaning: '특정 workflow에서 model이 제안할 수 있는 좁은 function names 집합입니다.', contrast: 'tool이 목록에 있다는 사실만으로 모든 arguments·resource가 허용되는 것은 아닙니다.' },
    { term: 'Argument Schema · 인자 스키마', meaning: 'tool input의 field, type, length, enum, format, required 값을 검증하는 계약입니다.', contrast: 'JSON parse 성공만 확인하거나 free-form command를 그대로 넘기는 것과 다릅니다.' },
    { term: 'Complete Mediation · 완전한 중재', meaning: '모든 tool request를 실행 직전에 current policy와 권한으로 다시 검사하는 원칙입니다.', contrast: '대화 시작 때 한 번 승인했으므로 이후 action도 자동 허용하는 방식이 아닙니다.' },
    { term: 'Least-Privilege Adapter · 최소 권한 어댑터', meaning: '한 종류의 좁은 action과 resource scope만 downstream에 행사할 수 있는 execution identity입니다.', contrast: '여러 시스템의 관리자 credential을 공유하는 generic shell·HTTP tool과 다릅니다.' },
    { term: 'Approval Binding · 승인 결합', meaning: '사람의 승인을 proposal hash, action, target, expiry와 묶어 다른 action에 재사용하지 못하게 하는 상태입니다.', contrast: '일반적인 “계속” click이나 대화 전체에 대한 포괄 승인과 다릅니다.' },
    { term: 'Fail Closed · 안전한 거부', meaning: 'policy, schema, authorization, approval, output verification이 불확실하면 action을 실행하지 않는 동작입니다.', contrast: '오류가 났을 때 넓은 fallback tool이나 default allow로 바꾸는 것과 반대입니다.' },
  ],
  stages: [
    { label: 'proposal 정규화', actor: 'tool gateway', input: 'model tool name·arguments와 request context', action: 'unknown fields를 거절하고 canonical action·resource를 만듭니다.', output: 'typed proposal or schema deny' },
    { label: '기능 허용 확인', actor: 'workflow policy', input: 'typed proposal과 allowed tool catalog', action: 'workflow에 필요한 최소 function인지 확인합니다.', output: 'candidate tool or function deny' },
    { label: '주체·resource 인가', actor: 'authorization service', input: 'user session, action, target resource, tenant', action: 'user와 adapter 모두 해당 target에 권한이 있는지 검사합니다.', output: 'scoped authorization decision' },
    { label: '위험·승인 판정', actor: 'risk policy·human approver', input: 'side effect, reversibility, sensitivity, proposal digest', action: 'read-only는 policy로 진행하고 write·send·delete는 exact action approval을 요구합니다.', output: 'deny, pending, or bound approval grant' },
    { label: 'one-shot 실행', actor: 'tool-specific adapter', input: 'short-lived grant와 validated arguments', action: 'timeout·rate·resource scope 안에서 action 한 번만 실행합니다.', output: 'structured result and downstream event ID' },
    { label: 'result 검증·회수', actor: 'validator·credential broker', input: 'tool result, schema, grant, credential lease', action: '출처·민감정보·allowed values를 확인하고 credential lease를 회수합니다.', output: 'safe response or quarantined result' },
    { label: '감사·재시험', actor: 'audit·security monitoring', input: 'proposal, decision reason, approval, result metadata', action: 'raw secrets 없이 correlation하고 deny·allow·replay·timeout fixtures와 비교합니다.', output: 'explainable event and regression evidence' },
  ],
  trustBoundary: {
    before: 'model proposal은 정확한 JSON이어도 principal authorization과 user intent를 증명하지 않습니다.',
    decision: 'tool gateway·authorization service·downstream system이 current context를 독립적으로 검사하고 approval grant를 exact proposal에 결합해야 합니다.',
    after: '짧은 수명의 최소 권한 adapter가 한 action만 수행하고 result·credential은 다시 검증·회수됩니다.',
    failure: 'allowlist만 보고 arguments·resource를 확인하지 않거나, 이전 approval을 재사용하거나, generic administrator tool을 연결하면 excessive functionality·permission·autonomy가 한 경계에서 합쳐집니다.',
  },
}

const toolPolicyTrace = {
  id: 'w16-agent-controls-policy-trace',
  type: 'code-trace',
  title: '합성 ticket read proposal을 fail-closed로 판정하는 local policy trace',
  evidenceKind: 'educational-model',
  source: owaspExcessiveAgency,
  language: 'javascript',
  description: '실제 tool SDK가 아닌 fixed booleans와 mock result를 이용한 교육용 state transition입니다. network·file·message action은 존재하지 않습니다.',
  code: '1  const proposal = Object.freeze({tool: "ticket.read", resource: "TRAINING-042"})\n2  const context = Object.freeze({principal: "learner", tenant: "TRAINING", policy: "v5"})\n3  const toolAllowed = proposal.tool === "ticket.read"\n4  const argsValid = /^TRAINING-[0-9]{3}$/.test(proposal.resource)\n5  const userAuthorized = context.principal === "learner" && context.tenant === "TRAINING"\n6  const adapterScope = {actions: ["ticket.read"], resources: ["TRAINING-042"]}\n7  const adapterAuthorized = adapterScope.actions.includes(proposal.tool) &&\n8    adapterScope.resources.includes(proposal.resource)\n9  const approvalRequired = false // fixed read-only training rule\n10 const approvalBound = !approvalRequired\n11 const decision = [toolAllowed, argsValid, userAuthorized, adapterAuthorized, approvalBound]\n12   .every(Boolean) ? "ALLOW_ONCE" : "DENY"\n13 const result = decision === "ALLOW_ONCE" ? MOCK_RESULTS["TRAINING-042"] : null\n14 const outputValid = result !== null && result.source === "SYNTHETIC"\n15 const audit = {request: "TRAINING-REQ-15", decision, policy: context.policy, outputValid}',
  trace: [
    { lines: '1–2', before: 'proposal과 caller context가 mutable conversation text에 섞여 있습니다.', action: 'tool·resource와 principal·tenant·policy version을 immutable objects로 분리합니다.', after: '검증할 action tuple과 policy identity가 고정됩니다.' },
    { lines: '3–5', before: 'tool 이름, argument format, user authorization 중 무엇이 실패했는지 모릅니다.', action: 'function allowlist, fixed resource pattern, training tenant authorization을 독립 booleans로 계산합니다.', after: 'deny 원인을 숨기지 않고 각 layer의 책임을 재시험할 수 있습니다.' },
    { lines: '6–10', before: 'user permission만 있고 tool adapter의 실제 downstream scope와 approval state가 없습니다.', action: 'adapter action·resource scope와 read-only approval rule을 다시 확인합니다.', after: 'model이나 user 한쪽만으로 execution grant를 만들 수 없습니다.' },
    { lines: '11–15', before: '부분 통과가 default allow로 이어질 수 있고 result provenance가 없습니다.', action: '모든 gate가 true일 때만 `ALLOW_ONCE`, 아니면 `DENY`; mock result의 synthetic source와 audit fields를 확인합니다.', after: '정상 read는 유지하면서 어떤 누락도 live side effect로 이어지지 않습니다.' },
  ],
}

const agentControlLayers = {
  id: 'w16-agent-controls-layer-comparison',
  type: 'comparison',
  title: 'Code·config·permission·log·test를 agent execution 경계에 연결하기',
  columns: ['층', '구현·운영할 통제', '검증 evidence'],
  rows: [
    ['Code', 'generated code evaluation을 제거·patch하고 proposal parser, schema validator, output validator를 fail-closed로 구현', 'actual source diff, dependency lock, reject branch unit test'],
    ['Config', 'enabled tools, model·prompt version, approval threshold, timeout·rate·egress를 versioned policy로 관리', 'effective config snapshot, drift alert, rollout record'],
    ['Permission', 'user context와 tool adapter를 분리하고 one-tool·one-action·one-resource short-lived grant 사용', 'downstream IAM decision, lease expiry, denied resource test'],
    ['Log', 'request ID, principal ID, data source, proposal, policy version, decision reason, approval ID, result status를 기록하고 secrets·chain-of-thought는 제외', 'correlated audit events, redaction test, alert ticket'],
    ['Test', '정상 read, unknown tool, malformed arguments, wrong resource, missing·replayed approval, output secret, timeout을 고정 fixture로 재시험', 'allow·deny oracle, no side effect, normal workflow 유지'],
  ],
}

const threatModelMechanism = {
  id: 'w16-final-threat-model-mechanism',
  type: 'mechanism',
  title: '위협 모델은 이름 목록이 아니라 자산에서 실패 지점과 재시험까지 이어지는 검증 그래프다',
  situation: 'agent에 prompt injection이나 excessive agency라는 label만 붙이면 어떤 data가 어디서 authority로 바뀌는지, 무엇을 보호하고 어느 control을 시험해야 하는지 알 수 없습니다. 작은 data flow마다 자산·actor·trust boundary·failure point·impact condition·control·evidence를 연결해야 합니다.',
  terms: [
    { term: 'Asset · 자산', meaning: '보호해야 할 data, credential, decision integrity, tool capability, service availability입니다.', contrast: 'server나 model 같은 component 이름만 나열하는 것보다 보호 가치와 owner를 포함합니다.' },
    { term: 'Actor · 행위자', meaning: 'user, operator, external content author, model, service, tool adapter처럼 flow에 값을 넣거나 판단하는 역할입니다.', contrast: 'actor가 곧 attacker라는 뜻은 아니며 정상 역할과 오용 가능성을 함께 봅니다.' },
    { term: 'Data Flow · 데이터 흐름', meaning: 'source에서 destination으로 이동하는 value와 format·identity·state 변화입니다.', contrast: '화살표 하나로 prompt, proposal, approval, result를 모두 같은 값처럼 표현하면 안 됩니다.' },
    { term: 'Security Invariant · 보안 불변식', meaning: '모든 정상·오류 상태에서 반드시 유지돼야 하는 짧고 시험 가능한 rule입니다.', contrast: '“AI를 안전하게 사용” 같은 추상 목표보다 `untrusted document cannot grant tool authority`처럼 판정 가능해야 합니다.' },
    { term: 'Threat Event · 위협 사건', meaning: '특정 actor·input·boundary에서 invariant를 깨뜨릴 수 있는 상태 변화입니다.', contrast: '취약점 이름만 복사한 목록이나 실제 침해가 이미 일어났다는 결론이 아닙니다.' },
    { term: 'Residual Risk · 잔여 위험', meaning: '현재 control과 evidence를 적용한 뒤에도 남는 uncertainty·impact와 owner·review date입니다.', contrast: '통제가 있으므로 위험이 0이라는 표시나 개선 책임을 미루는 칸이 아닙니다.' },
  ],
  stages: [
    { label: 'scope·목적 고정', actor: 'system owner·risk owner', input: 'business goal, environment, users, excluded live capabilities', action: '검토할 agent version과 합성·운영 경계를 명시합니다.', output: 'review scope and accountable owners' },
    { label: '자산·actor 식별', actor: 'product·security teams', input: 'data classes, tool capabilities, identities, dependent systems', action: '보호 가치와 읽기·변경·승인 owner를 연결합니다.', output: 'asset and actor inventory' },
    { label: 'flow·state 작성', actor: 'architect·developer', input: 'request, context, proposal, policy, approval, execution, result', action: '각 화살표의 input·output·trust label과 state transition을 적습니다.', output: 'reviewable data-flow sequence' },
    { label: 'boundary·invariant 지정', actor: 'security reviewer', input: 'flows와 authority changes', action: 'data가 instruction·permission·side effect로 바뀌는 지점마다 유지할 rule을 씁니다.', output: 'trust boundaries and testable invariants' },
    { label: 'threat·영향 조건화', actor: 'cross-functional review', input: 'actor controls, failure state, asset reach, process permission', action: 'failure point와 CIA impact가 성립하는 prerequisite를 분리합니다.', output: 'bounded threat scenarios, not assumed incidents' },
    { label: 'control·evidence 연결', actor: 'control owners', input: 'root fix, config, permission, log, tests', action: '각 invariant를 예방·탐지·회복하는 control과 evidence source를 지정합니다.', output: 'control-to-evidence matrix' },
    { label: '재시험·잔여 위험', actor: 'test owner·risk owner', input: 'normal, deny, boundary, recovery fixtures and gaps', action: '변경 뒤 oracle을 재실행하고 남은 uncertainty·owner·review date를 기록합니다.', output: 'versioned threat model and residual-risk decision' },
  ],
  trustBoundary: {
    before: 'diagram의 component와 threat name만으로는 어떤 value가 authority로 바뀌는지 판정할 수 없습니다.',
    decision: '각 boundary의 owner가 invariant, input state, allowed transition, deny evidence, retest oracle을 승인해야 합니다.',
    after: '한 threat가 특정 failure point·asset impact·Code/Config/Permission/Log/Test controls와 추적 가능하게 연결됩니다.',
    failure: '일반적인 “prompt injection 방지” 통제를 적고 execution path·permission·normal regression을 누락하면 prompt 변경 하나에 의존하는 문서가 되어 실제 architecture 변화와 어긋납니다.',
  },
}

const threatModelTrace = {
  id: 'w16-final-threat-model-record-trace',
  type: 'code-trace',
  title: '합성 support-summary agent의 최종 위협 모델 record',
  evidenceKind: 'educational-model',
  source: nistAiRmf,
  language: 'yaml',
  description: '실제 production risk assessment가 아니라 이 과정의 fixed mock flow를 한 장으로 연결한 교육용 record입니다.',
  code: '1  scope: {system: support-summary-mock, environment: browser_local, live_capabilities: none}\n2  asset: {id: A1, value: synthetic_ticket_confidentiality_and_decision_integrity}\n3  actors: [learner, synthetic_document_author, mock_model, policy_engine, mock_tool]\n4  flow: user_goal -> retrieved_data -> model_proposal -> policy_decision -> mock_result\n5  boundary: {from: retrieved_data, to: model_context, invariant: data_cannot_grant_authority}\n6  boundary: {from: model_proposal, to: mock_tool, invariant: policy_and_scope_required}\n7  threat: {id: T1, event: untrusted_text_requests_forbidden_tool, state: proposed_only}\n8  failure_point: proposal_executed_without_allowlist_scope_or_approval\n9  impact_condition: live_write_tool_and_permission_and_unmediated_execution\n10 controls: {Code: schema_validator, Config: tool_catalog_v5, Permission: mock_read_only}\n11 evidence: {Log: decision_reason, Test: [normal_read, forbidden_write, wrong_resource, approval_replay]}\n12 expected: {normal_read: ALLOW_ONCE, all_negative_fixtures: DENY, side_effects: none}\n13 residual_risk: {model_summary_error: human_review_required, owner: course_operator}\n14 review_trigger: [model_change, tool_change, policy_change, data_source_change]\n15 claim_limit: educational_fixture_not_production_assurance',
  trace: [
    { lines: '1–4', before: 'system 이름과 prompt injection label만 있고 무엇을 보호하며 어떤 state가 움직이는지 없습니다.', action: 'local-only scope, asset, actors, request-to-result flow를 고정합니다.', after: '위협과 통제가 붙을 구체적인 합성 system boundary가 생깁니다.' },
    { lines: '5–9', before: 'retrieved data와 proposal이 authority로 바뀌는 경계·실패 조건이 모호합니다.', action: '두 invariants, proposed-only threat state, exact missing checks, live impact prerequisite를 분리합니다.', after: '위협 관찰과 실제 impact 성립을 과장 없이 구분할 수 있습니다.' },
    { lines: '10–12', before: '통제 이름은 있지만 구현 위치·evidence·정상 oracle이 연결되지 않았습니다.', action: 'Code/Config/Permission controls와 Log/Test evidence, allow·deny expected states를 한 record에 연결합니다.', after: '통제를 바꾸면 어떤 fixture가 실패해야 하는지 추적할 수 있습니다.' },
    { lines: '13–15', before: '모든 test가 통과하면 risk가 0이라는 오해가 남습니다.', action: 'summary error의 human review, 변경 trigger, production assurance 금지를 기록합니다.', after: '잔여 위험과 재검토 조건을 가진 정직한 최종 산출물이 됩니다.' },
  ],
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichLlamaIndexCve(block) {
  const additions = [nvdLlamaIndex, llamaIndexPatch, llamaIndexReferencedPatch, llamaIndexRelease, pandasQueryEngineSource, pandasOutputParserSource]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    title: 'Generated-code 경계 사례: LlamaIndex PandasQueryEngine safe_eval',
    productRole: 'LlamaIndex `PandasQueryEngine`은 DataFrame preview와 user query를 LLM에 보내 pandas instruction을 생성하고, `PandasInstructionParser`가 그 Python text를 평가해 table answer를 반환하는 library path입니다.',
    weakness: 'CWE-94 · generated Python code validation bypass before `safe_eval` / `safe_exec`',
    affectedVersions: 'NVD current affected record: `llama_index` 0 이상 0.10.24 미만. 실제 위험 판정에는 PandasQueryEngine generated-code evaluation path 사용 여부와 user-controlled input 도달 여부가 추가로 필요',
    fixedVersions: 'LlamaIndex 0.10.24 이상. v0.10.24 tag에는 보완된 merged-PR commit `2c92e88838a5f481d50840240b1dd3180066c6f5` 포함',
    cause: 'v0.10.23 실제 `_contains_protected_access`는 `return dunder_visitor.has_access_to_private_entity`만 사용해 private·dunder 여부만 최종 판단했습니다. allowlist에는 `getattr`, `hasattr`, `iter`, `next`, `setattr`이 있었고 import·disallowed builtin state가 별도로 차단되지 않아 NVD가 기록한 method restriction bypass와 arbitrary code execution 경계가 생겼습니다.',
    condition: 'vulnerable <0.10.24 package, PandasQueryEngine 또는 같은 `safe_eval`·`safe_exec` path, attacker가 영향 줄 수 있는 query/context, LLM-generated expression의 bypass, Python process permissions가 이어져야 합니다. 이 과정은 safe_eval, model API, DataFrame, file·shell·network action을 실행하지 않습니다.',
    patch: 'release의 merged-PR commit `2c92e88`은 위험 builtin 다섯 개를 allowlist에서 제거하고, AST Name·Attribute의 disallowed builtin과 Import·ImportFrom을 flag한 뒤 private·builtin·import 중 하나라도 true면 evaluation 전에 거절합니다. v0.10.24 upgrade와 upstream security·normal-flow tests가 실제 수정 근거입니다.',
    followOn: 'NVD는 CVE-2024-3098이 CVE-2023-39662의 bypass라고 명시합니다. 이는 공식 관계이므로 기록하지만, bypass payload·file creation·후속 공격 chain은 이 수업에 재현하지 않습니다. 일반 agent의 allowlist·approval은 defense in depth이며 이 dependency patch를 대신하지 않습니다.',
    facts: [
      'NVD에는 NIST score가 없고 CNA huntr.dev score 9.8, CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H가 표시됩니다.',
      'NVD-linked 5fbcb5a와 release tag의 2c92e88은 구분합니다. 후자가 v0.10.24 branch에 포함된 실제 merged-PR commit입니다.',
      '실습은 합성 proposal·policy·audit state만 읽으며 실제 LlamaIndex, model, interpreter, credential, file system, network tool에 연결하지 않습니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichAgentBoundaries(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichLlamaIndexCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    agentSystemMechanism,
    agentBoundaryTrace,
    llamaIndexMechanism,
    cve,
    llamaIndexPatchAnalysis,
    llamaIndexImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [owaspPromptInjection, owaspExcessiveAgency, nvdLlamaIndex, llamaIndexPatch, llamaIndexReferencedPatch, llamaIndexRelease, pandasQueryEngineSource, pandasOutputParserSource])
    : block)
}

function enrichWithBlocks(blocks, additions, sources) {
  const enriched = addAfter(blocks, (block) => block.type === 'explanation', additions)
  return enriched.map((block) => block.type === 'sources' ? appendUniqueSources(block, sources) : block)
}

export function buildWeek15AgentSecurityGuide(modules) {
  const enrichers = {
    'w16-agent-boundaries': enrichAgentBoundaries,
    'w16-agent-controls': (blocks) => enrichWithBlocks(blocks, [toolControlMechanism, toolPolicyTrace, agentControlLayers], [owaspExcessiveAgency, owaspPromptInjection, nistAiRmf]),
    'w16-final-threat-model': (blocks) => enrichWithBlocks(blocks, [threatModelMechanism, threatModelTrace], [nistAiRmf, owaspPromptInjection, owaspExcessiveAgency]),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
