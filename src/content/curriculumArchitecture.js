const originalLaterWeekArchitectures = Object.freeze({
  6: {
    sourceModuleId: 'w7-c-values', cve: 'CVE-2021-3156', labId: 'w7-patch-review',
    caseId: 'w7-sudo-case', caseTitle: 'Sudo와 sudoedit: 높은 권한 경계의 정상 흐름',
    caseSummary: 'Sudo가 왜 필요한지부터 시작해 사용자 인자, mode, policy plugin, setuid 권한 경계를 CVE-2021-3156의 성립 조건과 연결합니다.',
    patchId: 'w7-sudo-patch', patchTitle: 'Baron Samedit 패치: 길이·mode·plugin 계약 복원',
    patchSummary: '공개된 세 upstream commit을 나란히 읽고 문자열 bounds, 허용 mode, plugin 검증이 왜 하나의 수정 묶음인지 설명합니다.',
    objectiveIndexes: [0, 1, 2],
  },
  7: {
    sourceModuleId: 'w8-instruction-flow', cve: 'CVE-2021-3156', labId: 'w8-patch-review',
    caseId: 'w8-sudo-control-flow', caseTitle: 'C 조건문에서 CPU 분기까지: Sudo mode 읽기',
    caseSummary: '같은 Sudo 사례를 이번에는 mode bit, 조건 분기, 호출 규약 관점에서 읽어 C source와 실행 상태를 연결합니다.',
    patchId: 'w8-sudo-mode-patch', patchTitle: 'sudoedit flag 패치: 잘못된 경로를 입구에서 닫기',
    patchSummary: 'front-end와 policy plugin이 같은 mode 계약을 사용하도록 바뀐 실제 diff를 따라가고 정상 sudoedit 흐름을 재시험합니다.',
    objectiveIndexes: [0, 1, 2],
  },
  8: {
    sourceModuleId: 'w9-debugger-flow', cve: 'CVE-2024-3094', labId: 'w9-patch-review',
    caseId: 'w9-xz-provenance', caseTitle: 'XZ Utils: Git source와 release tarball은 왜 달랐나',
    caseSummary: 'XZ Utils와 liblzma의 역할, release tarball 생성, 배포판 build를 먼저 이해한 뒤 5.6.0·5.6.1 공급망 compromise를 추적합니다.',
    patchId: 'w9-xz-response', patchTitle: 'XZ 대응: 코드 한 줄보다 artifact provenance 복구',
    patchSummary: 'cleanup commit과 clean 5.6.2 release가 무엇을 확인해 주고 무엇은 확인해 주지 못하는지 구분해 incident response 순서를 세웁니다.',
    objectiveIndexes: [0, 1, 2],
  },
  9: {
    sourceModuleId: 'w10-bounds', cve: 'CVE-2021-3156', labId: 'w10-patch-review',
    caseId: 'w10-sudo-overflow', caseTitle: 'Sudo user_args: 객체 밖 첫 write가 생기는 조건',
    caseSummary: '작은 교육용 buffer 모델과 실제 Sudo source를 분리하면서 길이 계산, NUL 종료, unescape가 어긋나는 지점을 확인합니다.',
    patchId: 'w10-sudo-regression', patchTitle: '경계 수정 뒤 무엇을 다시 시험해야 하나',
    patchSummary: '실제 bounds patch가 복원한 불변조건과 정상·경계·mode 회귀 시험을 묶어 “크래시가 사라짐”보다 강한 완료 기준을 만듭니다.',
    objectiveIndexes: [0, 1, 2],
  },
  10: {
    sourceModuleId: 'w11-ai-claims', cve: 'CVE-2024-3094', labId: 'w11-patch-review',
    caseId: 'w11-xz-evidence', caseTitle: 'AI 답변을 XZ 사건의 증거와 대조하기',
    caseSummary: 'AI가 만든 “모든 Linux가 감염됐다”, “Git patch가 backdoor를 제거했다” 같은 문장을 artifact·version·배포 경로 단위로 검증합니다.',
    patchId: 'w11-xz-incident', patchTitle: '패치 적용과 침해 조사는 왜 다른가',
    patchSummary: 'clean package로 교체하는 조치와 이미 오염된 artifact가 실행됐는지 조사하는 절차를 분리하고, 확인되지 않은 결론을 보고서에 남기지 않습니다.',
    objectiveIndexes: [0, 1, 2],
  },
  11: {
    sourceModuleId: 'w12-crypto-boundaries', cve: 'CVE-2023-48795', labId: 'w12-patch-review',
    caseId: 'w12-terrapin-flow', caseTitle: 'SSH는 암호화 뒤에도 상태 무결성이 필요하다',
    caseSummary: 'SSH key exchange, NEWKEYS, packet sequence를 먼저 익히고 Terrapin이 가능한 조건과 가능하지 않은 주장을 분리합니다.',
    patchId: 'w12-strict-kex', patchTitle: 'OpenSSH strict KEX: 상태 경계를 다시 묶는 diff',
    patchSummary: 'OpenSSH 9.6의 실제 protocol·C source 변경을 읽고 message 제한과 sequence reset이 같은 불변조건을 어떻게 복원하는지 확인합니다.',
    objectiveIndexes: [0, 1, 2],
  },
  12: {
    sourceModuleId: 'w13-pcap-scope', cve: 'CVE-2023-44487', labId: 'w13-patch-review',
    caseId: 'w13-http2-rapid-reset', caseTitle: 'HTTP/2 stream과 Rapid Reset 비용 비대칭',
    caseSummary: 'frame, stream, RST_STREAM의 정상 목적을 먼저 익히고 빠른 취소가 server 자원 비용으로 누적되는 조건을 분석합니다.',
    patchId: 'w13-nghttp2-budget', patchTitle: 'nghttp2 패치: reset에도 connection budget을 부과하기',
    patchSummary: '공개된 token·GOAWAY diff를 읽고 정상 취소를 보존하면서 비정상 rate를 제한하는 회귀 기준을 만듭니다.',
    objectiveIndexes: [0, 1, 2], caseMechanismIds: ['w13-pcap-scope-http2-stream-mechanism'],
  },
  13: {
    sourceModuleId: 'w14-fuzzing-model', cve: 'CVE-2024-47763', labId: 'w14-patch-review',
    caseId: 'w14-wasmtime-crash', caseTitle: 'Wasmtime tail call과 빈 stack frame 구간',
    caseSummary: 'WebAssembly runtime, trampoline, tail call, stack trace를 정의한 뒤 OSS-Fuzz가 찾은 process abort의 정확한 조건을 읽습니다.',
    patchId: 'w14-wasmtime-fix', patchTitle: 'Wasmtime 패치: loop 전에 빈 구간을 판정하기',
    patchSummary: '실제 Rust backport diff와 release line을 비교하고 정상 stack trace와 0-frame 경계를 함께 재시험합니다.',
    objectiveIndexes: [0, 1, 2], caseMechanismIds: ['w14-fuzzing-model-wasmtime-stack-mechanism'],
  },
  14: {
    sourceModuleId: 'w15-shared-responsibility', cve: 'CVE-2022-37968', labId: 'w15-patch-review',
    caseId: 'w15-azure-cluster-connect', caseTitle: 'Azure Arc Cluster Connect의 identity 경로',
    caseSummary: 'Azure control plane, Arc agent, reverse connection, Kubernetes API와 RBAC이 이어지는 정상 관리 흐름을 먼저 그립니다.',
    patchId: 'w15-msrc-remediation', patchTitle: '소스가 비공개일 때 MSRC remediation을 검증하는 법',
    patchSummary: '가상의 diff를 만들지 않고 CVRF product ID, fixed build, agent upgrade, 정상·거절 상태를 실제 검증 대상으로 사용합니다.',
    objectiveIndexes: [0, 1, 2], caseMechanismIds: ['w15-shared-responsibility-cluster-connect-mechanism'],
  },
  15: {
    sourceModuleId: 'w16-agent-boundaries', cve: 'CVE-2024-3098', labId: 'w16-patch-review',
    caseId: 'w16-llamaindex-engine', caseTitle: 'LlamaIndex와 PandasQueryEngine은 무엇을 하는가',
    caseSummary: 'Gradio 같은 UI framework와 LlamaIndex 같은 orchestration library를 구분하고 자연어가 Python expression으로 바뀌는 interpreter 경계를 따라갑니다.',
    patchId: 'w16-llamaindex-lineage', patchTitle: '두 보안 commit과 experimental 이동까지 읽기',
    patchSummary: '5fbcb5a, 2c92e88, 35afb6b의 역할을 시간순으로 비교해 0.10.24 수정의 효과와 eval 기반 기능의 남은 한계를 설명합니다.',
    objectiveIndexes: [0, 1, 2], caseMechanismIds: ['w16-agent-boundaries-llamaindex-mechanism'],
  },
})

const laterWeekArchitectures = Object.freeze(Object.fromEntries(
  Object.entries(originalLaterWeekArchitectures)
    .filter(([weekIndex]) => Number(weekIndex) >= 11)
    .map(([weekIndex, architecture]) => {
      const sourceIndex = Number(weekIndex)
      const displayIndex = sourceIndex === 15 ? 10 : sourceIndex - 6
      return [displayIndex, sourceIndex === 14 ? { ...architecture, objectiveIndexes: [3, 4, 5] } : architecture]
    }),
))

function question(id, title, body) {
  return { id, type: 'question', title, body }
}

function explanation(id, title, paragraphs) {
  return { id, type: 'explanation', title, paragraphs }
}

function summary(id, bullets) {
  return { id, type: 'summary', title: '이 모듈을 마치면', bullets }
}

function placeholder(config, kind) {
  const isCase = kind === 'case'
  const id = isCase ? config.caseId : config.patchId
  const title = isCase ? config.caseTitle : config.patchTitle
  const moduleSummary = isCase ? config.caseSummary : config.patchSummary
  return {
    id,
    title,
    summary: moduleSummary,
    duration: isCase ? 38 : 42,
    estimatedMinutes: isCase ? 38 : 42,
    activityType: 'lesson',
    path: 'required',
    contentLevel: isCase ? 'case-dossier-v1' : 'patch-workshop-v1',
    learningQuestion: isCase ? '이 제품의 정상 기능에서 어느 값과 권한이 신뢰 경계를 건너는가?' : '실제 patch는 어떤 불변조건을 코드로 복원했고 무엇은 운영에서 따로 확인해야 하는가?',
    objectiveIndexes: config.objectiveIndexes,
    blocks: [
      question(`${id}-loading-question`, '읽기 질문', isCase ? '제품의 정상 동작, 외부에서 정할 수 있는 값, 취약 조건을 순서대로 구분해 보세요.' : '삭제·추가된 줄을 기능 변화, 보안 불변조건, 정상 회귀 시험과 연결해 보세요.'),
      explanation(`${id}-loading-explanation`, '이 모듈을 불러오는 동안', [moduleSummary]),
      summary(`${id}-loading-summary`, [isCase ? '제품 이름보다 정상 데이터 흐름을 먼저 설명한다.' : 'patch의 줄 변화와 운영 적용을 분리한다.']),
    ],
  }
}

export function applyBaseModuleArchitecture(weekIndex, modules) {
  const config = laterWeekArchitectures[weekIndex]
  if (!config) return modules
  if (modules.some((module) => module.id === config.caseId || module.id === config.patchId)) return modules
  const sourceIndex = modules.findIndex((module) => module.id === config.sourceModuleId)
  if (sourceIndex < 0) return modules
  return [
    ...modules.slice(0, sourceIndex + 1),
    placeholder(config, 'case'),
    placeholder(config, 'patch'),
    ...modules.slice(sourceIndex + 1),
  ]
}

function buildCaseBlocks(config, sourceBlocks) {
  const primer = sourceBlocks.find((block) => block.type === 'technology-primer')
  const cve = sourceBlocks.find((block) => block.type === 'cve-case' && block.cve === config.cve)
  const impact = sourceBlocks.find((block) => block.type === 'impact-map')
  const mechanisms = sourceBlocks.filter((block) => config.caseMechanismIds?.includes(block.id))
  const sources = sourceBlocks.find((block) => block.type === 'sources')
  return [
    question(`${config.caseId}-question`, '이 사례에서 먼저 답할 질문', '제품은 평소 어떤 일을 하며, 공격자 또는 오류가 통제하는 값은 어느 조건에서 보안 효과 지점에 도달하는가?'),
    explanation(`${config.caseId}-intro`, '사건 이름보다 제품의 정상 동작부터', [config.caseSummary, '아래 순서는 제품 소개 → 정상 흐름 → 성립 조건 → 영향 범위입니다. CVE 번호나 점수를 먼저 외우지 말고 어느 신뢰 경계가 깨졌는지 한 문장으로 설명해 보세요.']),
    primer,
    ...mechanisms,
    cve,
    impact,
    {
      id: `${config.caseId}-checkpoint`, type: 'checkpoint', title: '사례 범위 확인',
      prompt: '이 CVE를 설명할 때 가장 먼저 고정해야 할 것은?',
      options: ['제품의 정상 역할, 영향 버전, 성립 조건, 공격자가 통제하는 값', 'CVSS 숫자 하나', '가장 인상적인 공격 결과'], answer: 0,
      explanation: '정상 역할과 성립 조건을 고정해야 실제 영향과 과장을 구분할 수 있습니다.',
    },
    sources ? { ...sources, id: `${config.caseId}-sources`, title: '이 사례의 1차 근거' } : null,
    summary(`${config.caseId}-summary`, ['기술 이름을 한 문장으로 설명할 수 있다.', '정상 흐름과 실패 흐름이 갈라지는 경계를 지목할 수 있다.', '영향이 성립하려면 필요한 version·권한·사용자 행동을 구분할 수 있다.']),
  ].filter(Boolean)
}

function buildPatchBlocks(config, sourceBlocks) {
  const patch = sourceBlocks.find((block) => block.type === 'patch-analysis')
  const lineage = sourceBlocks.find((block) => block.type === 'patch-lineage' && block.cve === config.cve)
  const sources = sourceBlocks.find((block) => block.type === 'sources')
  return [
    question(`${config.patchId}-question`, 'diff를 읽으며 답할 질문', '삭제·추가된 줄은 어떤 잘못된 상태를 더 이상 만들 수 없게 했으며, 정상 기능은 어떤 시험으로 보존해야 하는가?'),
    explanation(`${config.patchId}-intro`, '초록색 줄이 많다고 좋은 patch는 아니다', [config.patchSummary, '먼저 수정 전 불변조건을 적고, 각 변경 줄이 그 조건을 어떻게 복원하는지 확인합니다. 그다음 정상 입력, 경계 입력, 거절 입력을 같은 build에서 비교해야 patch 적용과 문제 해결을 구분할 수 있습니다.']),
    patch,
    lineage,
    { id: `${config.patchId}-practice`, type: 'practice-link', title: '실제 diff를 직접 판정하기', body: '코드 발췌와 patch 계보를 읽은 뒤, 어떤 불변조건이 복원됐는지 실습에서 근거와 함께 고르세요.', labIds: [config.labId] },
    {
      id: `${config.patchId}-checkpoint`, type: 'checkpoint', title: '패치 완료 기준',
      prompt: '공식 patch가 적용된 뒤에도 별도로 해야 할 확인은?',
      options: ['정상 기능 회귀, 거절 상태, 실제 배포 version·artifact 확인', 'commit 제목만 읽기', '오류 화면이 사라졌는지만 확인'], answer: 0,
      explanation: '코드 변경, 정상 회귀, 실제 배포 artifact는 서로 다른 증거입니다.',
    },
    sources ? { ...sources, id: `${config.patchId}-sources`, title: '패치와 운영 확인의 1차 근거' } : null,
    summary(`${config.patchId}-summary`, ['수정 전·후 실제 발췌본에서 달라진 보안 결정을 찾을 수 있다.', '한 commit의 역할과 전체 patch series를 구분할 수 있다.', '공개 source가 없으면 가상의 diff 대신 vendor remediation을 사용한다.', '정상 회귀와 운영 적용 확인까지 완료 기준에 포함한다.']),
  ].filter(Boolean)
}

export function applyLoadedModuleArchitecture(weekIndex, modules) {
  const config = laterWeekArchitectures[weekIndex]
  if (!config) return modules
  const source = modules.find((module) => module.id === config.sourceModuleId)
  const caseModule = modules.find((module) => module.id === config.caseId)
  const patchModule = modules.find((module) => module.id === config.patchId)
  if (!source || !caseModule || !patchModule) return modules

  const movedTypes = new Set(['technology-primer', 'cve-case', 'patch-analysis', 'patch-lineage', 'impact-map'])
  const movedIds = new Set(config.caseMechanismIds || [])
  const sourceBlocks = source.blocks || []
  const retainedBlocks = sourceBlocks.filter((block) => !movedTypes.has(block.type) && !movedIds.has(block.id))
  const rebuilt = new Map([
    [source.id, { ...source, blocks: retainedBlocks }],
    [caseModule.id, { ...caseModule, contentLevel: 'case-dossier-v1', blocks: buildCaseBlocks(config, sourceBlocks) }],
    [patchModule.id, { ...patchModule, contentLevel: 'patch-workshop-v1', blocks: buildPatchBlocks(config, sourceBlocks) }],
  ])
  return modules.map((module) => rebuilt.get(module.id) || module)
}

export function getSupplementalLabs(weekIndex) {
  const config = laterWeekArchitectures[weekIndex]
  if (!config) return []
  return [{
    id: config.labId,
    week: weekIndex,
    title: `${config.cve} 실제 패치 판독 실습`,
    kind: 'patch-review',
    activityType: 'investigation',
    path: 'required',
    estimatedMinutes: 35,
    objective: '공식 source에서 가져온 수정 전·후 발췌본을 비교해 복원된 불변조건, patch 계보, 정상 회귀 시험을 근거와 함께 판정합니다.',
    prerequisites: [config.caseId, config.patchId],
    requiredTools: ['내장 실제 diff 판독기', '공식 upstream 또는 vendor remediation 링크'],
    safeScope: '브라우저에 표시된 공개 source 발췌와 고정 교육 질문만 읽습니다. 코드를 실행하거나 payload·외부 대상·실제 계정·자격 증명을 사용하지 않습니다.',
    successCriteria: ['수정 전·후 코드 비교 열기', '복원된 보안 불변조건 정확히 선택', '줄 변화와 회귀 시험의 관계를 40자 이상 설명'],
    hints: ['먼저 patch 제목이 아니라 수정 전 코드가 허용한 잘못된 상태를 적으세요.', '추가된 조건이 어떤 입력·mode·state를 거절하는지 보세요.', '취약 입력 거절뿐 아니라 정상 기능을 보존하는 시험을 하나 연결하세요.'],
    relatedConceptIds: [config.caseId, config.patchId],
    nextRecommendations: [config.patchId],
    patchReview: { sourceModuleId: config.patchId, cve: config.cve },
    submissionSchema: ['선택한 보안 불변조건', '실제 diff에서 확인한 줄 변화', '정상·거절 회귀 시험', '자료 유형과 확인하지 못한 범위'],
    rubric: ['공식 patch와 교육용 모델을 구분함', '줄 변화가 보안 결정에 미친 영향을 설명함', '정상 회귀와 거절 회귀를 함께 제시함', '공개되지 않은 구현을 추측하지 않음'],
  }]
}

export function getLaterWeekArchitecture(weekIndex) {
  return laterWeekArchitectures[weekIndex] || null
}
