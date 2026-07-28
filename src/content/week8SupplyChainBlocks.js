const nistSsdf = {
  label: 'NIST SP 800-218 · Secure Software Development Framework',
  url: 'https://csrc.nist.gov/pubs/sp/800/218/final',
  note: '소프트웨어 개발 과정에 보안 활동을 통합하는 공식 프레임워크입니다.',
}

const cisaSbom = {
  label: 'CISA · Software Bill of Materials',
  url: 'https://www.cisa.gov/sbom',
  note: 'SBOM의 목적과 소프트웨어 구성 요소 투명성 자료를 확인합니다.',
}

const slsaSpecification = {
  label: 'SLSA · Supply-chain Levels for Software Artifacts',
  url: 'https://slsa.dev/spec/v1.2/',
  note: '빌드 무결성과 Artifact Provenance를 설명하는 공식 사양입니다.',
}

const xzIncident = {
  label: 'XZ Utils · CVE-2024-3094 사건 공식 정리',
  url: 'https://tukaani.org/xz-backdoor/',
  note: 'Git 저장소의 소스와 배포 Tarball·Downstream Build를 구분해야 했던 공급망 침해 사례입니다.',
}

export const supplyChainModules = Object.freeze([
  {
    id: 'w8-supply-chain-flow',
    title: '소프트웨어 공급망과 신뢰 경계',
    duration: 36,
    summary: '직접 작성한 코드뿐 아니라 의존성·빌드 환경·패키지 저장소·배포 Artifact가 제품에 들어오는 전체 흐름을 읽습니다.',
    activityType: 'lesson',
    path: 'required',
    blocks: [
      { type: 'explanation', title: '공급망 보안은 무엇을 보호하나', paragraphs: [
        '소프트웨어 공급망은 개발자가 작성한 Source Code부터 외부 Dependency, Build Runner, Package Registry, Release Artifact와 실제 배포 환경까지 이어지는 과정입니다. 각 단계에서 다른 사람과 시스템이 만든 결과를 받아들이므로 신뢰 경계가 생깁니다.',
        '취약한 라이브러리를 사용하는 문제뿐 아니라 Maintainer 계정 탈취, Dependency 이름 혼동, Build 환경 변조, 서명 키 노출, Registry 권한 오설정처럼 “정상으로 믿고 받아들이는 경로” 자체가 공격 지점이 될 수 있습니다.',
      ] },
      { type: 'diagram', title: '소스에서 배포까지', body: '각 화살표에서 입력 출처, 변경 권한, 검증 근거와 승인 주체를 확인합니다.', nodes: ['Source·Dependency', 'CI Build Runner', 'Package·Container Artifact', 'Registry·Release Channel', '배포 환경'] },
      { type: 'comparison', title: '단계별 자산과 확인 질문', columns: ['단계', '보호할 자산', '먼저 확인할 질문'], rows: [
        ['Source·Dependency', 'Repository·Lockfile·Maintainer 권한', '어떤 Revision과 Dependency가 승인됐는가'],
        ['Build', 'Runner·Build Script·Secret·Compiler', '누가 어떤 격리 환경에서 만들었는가'],
        ['Artifact', 'Package·Container·Digest·Signature', '승인한 Build 결과와 같은 Byte인가'],
        ['배포', 'Registry·Release 권한·실행 환경', '실제로 어느 Artifact가 어디에 배포됐는가'],
      ] },
      { type: 'misconception', title: '흔한 오해', items: ['Git Repository가 안전하면 같은 이름의 Release 파일도 자동으로 안전하다.', '직접 작성한 코드만 검토하면 Transitive Dependency는 볼 필요가 없다.', '패키지 Version 문자열이 같으면 Build 결과도 반드시 같다.'] },
      { id: 'w8-supply-flow-checkpoint', type: 'checkpoint', title: '공급망 경계 확인', prompt: '배포된 프로그램의 출처를 추적할 때 가장 적절한 연결은?', options: ['Source Revision·Dependency·Build 환경·Artifact Digest·배포 기록', '파일명 하나', '화면에 표시된 Version 문자열만'], answer: 0, explanation: '소스부터 실제 배포 Byte까지 각 단계의 식별값과 변경 주체를 연결해야 합니다.' },
      { type: 'sources', title: '공식 근거', items: [nistSsdf, slsaSpecification] },
      { type: 'summary', title: '핵심 정리', bullets: ['공급망은 Source·Dependency·Build·Artifact·배포 경로 전체다.', '각 단계의 변경 권한과 검증 근거를 분리한다.', '이름과 Version만으로 실제 배포 Byte의 출처를 확정하지 않는다.'] },
    ],
  },
  {
    id: 'w8-sbom-provenance',
    title: 'SBOM·Hash·서명·Provenance',
    duration: 42,
    summary: '구성 요소 목록, Byte 식별, 서명 주체와 Build 이력을 서로 다른 증거로 구분합니다.',
    activityType: 'lesson',
    path: 'required',
    blocks: [
      { type: 'explanation', title: '한 가지 증거로는 공급망을 설명할 수 없다', paragraphs: [
        'SBOM은 제품에 포함된 구성 요소와 Version을 추적하는 재료이지만, 목록에 있다고 안전함을 보장하거나 목록이 완전하다고 자동으로 증명하지는 않습니다. Hash는 비교한 Byte의 식별값이고, 전자서명은 승인한 Signer와 검증한 Byte를 연결합니다.',
        'Provenance는 Artifact가 어떤 Source와 Build 과정에서 만들어졌는지 기록합니다. 조사에서는 SBOM, Digest, Signature, Provenance와 실제 배포 Inventory를 함께 대조하고 각 자료가 없는 부분은 확인되지 않은 범위로 남깁니다.',
      ] },
      { type: 'comparison', title: '공급망 증거의 역할과 한계', columns: ['증거', '직접 확인하는 것', '단독으로 보장하지 않는 것'], rows: [
        ['SBOM', '기록된 구성 요소·Version·관계', '구성 요소의 무해함·목록의 완전성'],
        ['Hash·Digest', '비교한 Byte의 식별값 일치 여부', '제작자 신원·안전성'],
        ['전자서명', '검증된 Byte와 Signer의 연결', 'Signer 계정·키가 안전했다는 사실'],
        ['Provenance', 'Source·Builder·Build 과정과 Artifact 연결', '배포 환경이 그 Artifact를 실제 사용한다는 사실'],
      ] },
      { type: 'case', title: 'XZ Utils에서 Source와 Release Artifact를 분리해 본 이유', body: 'CVE-2024-3094는 일반적인 입력 검증 결함이 아니라 Upstream Release Tarball과 Downstream Build 경로를 함께 확인해야 했던 공급망 침해 사례입니다. 수업에서는 악성 Artifact나 Trigger를 실행하지 않고 공식 사건 정리에서 영향 Version, Git Source와 Tarball의 차이, 실제 배포 조건만 읽습니다.', facts: ['파일명과 Version 문자열만으로 Artifact Provenance를 확정할 수 없습니다.', 'Source 수정 확인과 오염 Artifact가 운영에서 제거됐는지는 별도 증거입니다.', '실제 영향은 Package·Architecture·Build·Link·Service 조건을 확인해야 합니다.'] },
      { id: 'w8-sbom-provenance-checkpoint', type: 'checkpoint', title: '증거의 한계', prompt: 'SBOM에 라이브러리 이름과 Version이 기록돼 있을 때 직접 말할 수 있는 것은?', options: ['기록된 구성 요소 정보를 조사 후보와 영향 Inventory에 사용할 수 있다', '해당 라이브러리가 안전하다', '실제 실행 중인 Binary가 승인된 Build와 일치한다'], answer: 0, explanation: 'SBOM은 구성 요소 투명성을 돕지만 안전성·완전성·실제 배포 Byte는 다른 증거로 검증해야 합니다.' },
      { type: 'sources', title: '공식 근거', items: [cisaSbom, slsaSpecification, xzIncident] },
      { type: 'summary', title: '핵심 정리', bullets: ['SBOM·Digest·Signature·Provenance는 서로 다른 질문에 답한다.', 'Source와 Release Artifact, 실제 배포 Byte를 구분한다.', '없는 증거는 추정으로 채우지 않고 확인되지 않은 범위로 기록한다.'] },
    ],
  },
  {
    id: 'w8-cicd-controls',
    title: 'CI/CD 권한과 안전한 Release',
    duration: 38,
    summary: 'Build Runner, Secret, Registry와 Release 승인을 최소 권한과 재현 가능한 검증으로 연결합니다.',
    activityType: 'lesson',
    path: 'required',
    blocks: [
      { type: 'explanation', title: 'Build Pipeline도 운영 시스템이다', paragraphs: [
        'CI/CD는 Source를 읽고 Dependency를 내려받아 Artifact를 만들며 Registry와 배포 환경에 쓸 수 있습니다. 따라서 Build Runner와 Workflow는 높은 가치의 실행·권한 경계입니다. Pull Request 코드가 어느 Secret과 Network, Release 권한에 접근할 수 있는지 구분해야 합니다.',
        '안전한 기본값은 일회성·격리 Runner, 작업별 최소 권한, 짧은 수명의 자격 증명, 보호된 Branch와 Release 승인, Dependency 고정, Artifact 서명과 검증, 감사 로그입니다. 통제를 바꾼 뒤에는 승인된 Build와 Release가 계속 동작하는지도 재시험합니다.',
      ] },
      { type: 'timeline', title: '안전한 Release 판정 순서', items: [
        { title: '승인 입력 고정', body: 'Source Revision, Dependency Lock과 Build 정의를 기록합니다.' },
        { title: 'Builder 경계 확인', body: 'Runner 격리, Network, Secret과 작업 권한을 확인합니다.' },
        { title: 'Artifact 식별', body: 'Digest, Signer와 Provenance를 Release 기록에 연결합니다.' },
        { title: 'Registry·배포 확인', body: '승인된 Artifact만 승격됐고 실제 환경이 같은 Digest를 사용하는지 봅니다.' },
        { title: '회귀·폐기', body: '정상 Release가 유지되는지 확인하고 임시 권한과 Secret을 폐기합니다.' },
      ] },
      { type: 'code', sourceType: 'educational-reconstruction', title: '합성 Release Gate', language: 'text', description: '실제 CI 공급자 설정이 아닌 검토 순서를 설명하는 로컬 교육 카드입니다.', code: 'require source_revision == approved_revision\nrequire dependency_lock_digest == reviewed_lock_digest\nrequire builder_identity in approved_ephemeral_builders\nrequire artifact_signature == approved_release_signer\nrequire deploy_digest == verified_artifact_digest\ndeny release when any evidence is missing' },
      { type: 'misconception', title: '흔한 오해', items: ['CI가 자동화돼 있으면 사람의 승인과 권한 분리가 필요 없다.', 'Secret을 환경 변수로 넣으면 모든 Workflow에서 읽어도 안전하다.', '검증 자료 하나가 없으면 나머지 값으로 추정해 Release해도 된다.'] },
      { id: 'w8-cicd-controls-checkpoint', type: 'checkpoint', title: 'Pipeline 최소 권한', prompt: 'Pull Request 검증 Job에 Release Registry 쓰기 권한이 필요하지 않다면?', options: ['쓰기 권한을 주지 않고 검증 Job과 Release Job을 분리한다', '항상 관리자 Token을 공유한다', '감사 로그만 끈다'], answer: 0, explanation: '작업 목적별 권한을 분리하면 비신뢰 코드가 Release 권한에 도달하는 범위를 줄일 수 있습니다.' },
      { type: 'sources', title: '공식 근거', items: [nistSsdf, slsaSpecification] },
      { type: 'summary', title: '핵심 정리', bullets: ['CI/CD Runner·Secret·Registry는 별도의 보안 경계다.', '검증과 Release 권한을 분리하고 짧은 수명의 최소 권한을 사용한다.', '승인 Source에서 실제 배포 Digest까지 연결하고 정상 Release도 재시험한다.'] },
    ],
  },
])

export const supplyChainLab = Object.freeze({
  id: 'w8-artifact-provenance-triage',
  week: 8,
  title: '합성 Artifact Provenance 판별',
  kind: 'guided-observation',
  activityType: 'investigation',
  path: 'required',
  estimatedMinutes: 35,
  objective: '합성 Release 기록에서 Source, Builder, SBOM, Signer, Digest와 실제 배포 Artifact의 불일치를 찾습니다.',
  prerequisites: ['w8-supply-chain-flow', 'w8-sbom-provenance', 'w8-cicd-controls'],
  requiredTools: ['브라우저', '내장 합성 Release 기록'],
  safeScope: '실제 Package·Registry·CI 계정·Secret을 사용하지 않고 브라우저의 고정 합성 기록만 읽습니다.',
  successCriteria: ['승인 기준과 관찰 Artifact 비교', 'Builder·Digest·SBOM 불일치 확인', '직접 관찰과 침해 확정을 구분'],
  hints: ['Source Revision이 같다는 사실과 Build Artifact가 같다는 사실을 분리하세요.', '승인 Builder와 실제 Builder Identity를 비교하세요.', 'Digest와 SBOM 누락을 확인하되 행위자와 실제 피해는 추정하지 마세요.'],
  relatedConceptIds: ['w8-supply-chain-flow', 'w8-sbom-provenance', 'w8-cicd-controls'],
  nextRecommendations: ['w15-shared-responsibility', 'w15-iam-least-privilege'],
  submissionSchema: ['승인 Source·Builder', 'SBOM·Signer·Digest', '관찰한 불일치', '추가 확인·격리·재검증'],
  rubric: ['Source와 Artifact를 구분함', '각 증거의 역할과 한계를 설명함', '실제 비밀이나 운영 대상을 사용하지 않음', '정상 Release 회귀 확인을 포함함'],
  scenario: {
    steps: ['승인된 Release 기준을 읽습니다.', '전달받은 Artifact Manifest를 같은 항목끼리 비교합니다.', '직접 확인되는 불일치만 선택합니다.', 'Release 중단·증거 보존·재검증 순서를 작성합니다.'],
    artifacts: [
      { title: '승인된 Release 기준', code: 'source_revision: a1b2c3\nbuilder: isolated-runner-04\nsbom: required\nsigner: release-bot\nartifact_digest: sha256:91ab...\nsecret: [REDACTED]' },
      { title: '전달받은 Artifact Manifest', code: 'source_revision: a1b2c3\nbuilder: unrecorded-runner\nsbom: missing\nsigner: release-bot\nartifact_digest: sha256:e004...\nsecret: [NOT INCLUDED]' },
    ],
    evidenceOptions: [
      { id: 'supply-builder-mismatch', label: '승인되지 않은 Builder Identity', detail: '승인 기준과 전달 Manifest의 Builder가 다릅니다.' },
      { id: 'supply-artifact-mismatch', label: 'Digest가 다르고 필수 SBOM이 없음', detail: '승인 Digest와 다르며 필수 구성 요소 목록이 누락됐습니다.' },
      { id: 'supply-safe-by-source', label: 'Source Revision이 같으므로 안전 확정', detail: '같은 Source라도 Build 환경과 Artifact Byte가 다를 수 있습니다.' },
      { id: 'supply-attacker-confirmed', label: '외부 공격자 침해 확정', detail: '현재 기록은 불일치를 보여주지만 행위자와 원인을 확정하지 않습니다.' },
    ],
    correctEvidenceIds: ['supply-builder-mismatch', 'supply-artifact-mismatch'],
    reflection: { prompt: 'Release를 멈춘 뒤 어떤 기록을 보존하고 무엇을 재검증할지 Source부터 배포 Digest까지 연결해 설명하세요.', minimumLength: 50 },
    conclusion: '불일치 Artifact의 승격을 중단하고 Manifest와 감사 기록을 보존한 뒤, 승인 Source·격리 Builder·Signer·Digest·SBOM과 실제 배포 Inventory를 다시 연결합니다.',
  },
})

export const supplyChainQuizQuestions = Object.freeze([
  { id: 'w8supplyq1', conceptIds: ['w8-supply-chain-flow'], difficulty: 'foundation', remediationModuleIds: ['w8-supply-chain-flow'], question: '배포 Artifact의 공급망을 추적할 때 필요한 연결은?', options: ['Source·Dependency·Builder·Digest·배포 기록', '파일명 하나', '화면 Version만'], answer: 0, explanation: '각 단계의 식별값과 변경 주체를 연결해야 실제 배포 Byte의 출처를 추적할 수 있습니다.' },
  { id: 'w8supplyq2', conceptIds: ['w8-sbom-provenance'], difficulty: 'application', remediationModuleIds: ['w8-sbom-provenance'], question: 'SBOM만으로 직접 확정할 수 없는 것은?', options: ['기록된 구성 요소와 Version', '제품이 안전하고 목록이 완전하다는 사실', '영향 Inventory의 조사 후보'], answer: 1, explanation: 'SBOM은 구성 요소 투명성을 제공하지만 안전성·완전성·실제 배포 Byte는 별도 검증이 필요합니다.' },
  { id: 'w8supplyq3', conceptIds: ['w8-cicd-controls'], difficulty: 'application', remediationModuleIds: ['w8-cicd-controls'], question: 'Pull Request 검증과 Release Job의 권한을 분리하는 이유는?', options: ['비신뢰 코드가 Release 권한에 도달하는 범위를 줄이기 위해', '모든 Secret을 공유하기 위해', '감사 기록을 없애기 위해'], answer: 0, explanation: '작업별 최소 권한과 승인 경계를 두면 검증 단계의 코드가 Artifact 배포 권한을 직접 사용하지 못하게 할 수 있습니다.' },
])
