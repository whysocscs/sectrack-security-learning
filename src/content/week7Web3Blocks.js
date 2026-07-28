const ethereumSmartContracts = {
  label: 'ethereum.org · Introduction to smart contracts',
  url: 'https://ethereum.org/developers/docs/smart-contracts/',
  note: '스마트 컨트랙트가 주소에 배포된 코드와 상태이며 트랜잭션으로 호출되는 기본 구조를 확인합니다.',
}

const ethereumTransactions = {
  label: 'ethereum.org · Transactions',
  url: 'https://ethereum.org/developers/docs/transactions/',
  note: '서명된 트랜잭션이 네트워크 상태 변경으로 이어지는 흐름을 확인합니다.',
}

const soliditySecurity = {
  label: 'Solidity · Security Considerations',
  url: 'https://docs.soliditylang.org/en/latest/security-considerations.html',
  note: '스마트 컨트랙트의 공개 실행 환경과 보안 검토 시 고려할 공식 언어 문서입니다.',
}

export const web3FuzzingModules = Object.freeze([
  {
    id: 'w7-web3-foundations',
    title: 'Web3·블록체인과 스마트 컨트랙트의 신뢰 경계',
    duration: 38,
    summary: '계정, 서명된 트랜잭션, 블록체인 상태와 스마트 컨트랙트의 관계를 보안 관점에서 구분합니다.',
    activityType: 'lesson',
    path: 'required',
    blocks: [
      { type: 'explanation', title: 'Web3 보안에서 먼저 구분할 것', paragraphs: [
        '블록체인은 여러 참여자가 공유하는 상태와 그 상태를 바꾸는 트랜잭션 순서를 합의하는 시스템입니다. 스마트 컨트랙트는 체인 위 주소에 배포된 코드와 상태이며, 사용자는 서명된 트랜잭션이나 읽기 호출로 함수와 상호작용합니다.',
        '보안 검토에서는 프론트엔드 화면, 지갑 서명, RPC 제공자, 스마트 컨트랙트 코드, 체인 상태를 한 덩어리로 보지 않습니다. 어느 계층에서 어떤 값과 권한을 신뢰하는지 먼저 표시해야 합니다.',
      ] },
      { type: 'comparison', title: 'Web 애플리케이션과 Web3 애플리케이션의 관찰 지점', columns: ['계층', '주요 상태', '먼저 확인할 질문'], rows: [
        ['프론트엔드·지갑', '사용자가 보게 되는 호출 대상과 서명 내용', '화면과 실제 서명 데이터가 일치하는가'],
        ['RPC·노드', '트랜잭션 전달과 읽기 결과', '어느 네트워크와 contract address를 조회하는가'],
        ['스마트 컨트랙트', '함수·storage·event·권한 규칙', '누가 어떤 상태를 어떤 조건에서 바꿀 수 있는가'],
        ['블록체인 상태', '확정된 transaction과 block', '관찰 시점과 finality 조건은 무엇인가'],
      ] },
      { type: 'timeline', title: '상태 변경 트랜잭션을 읽는 순서', items: [
        { title: '호출 대상 확인', body: 'network, contract address와 function을 고정합니다.' },
        { title: '서명할 값 확인', body: 'sender, value, calldata와 예상 상태 변화를 구분합니다.' },
        { title: '실행 조건 확인', body: 'contract의 권한 검사와 현재 storage 상태를 봅니다.' },
        { title: '결과 확인', body: 'receipt, event와 실제 변경된 상태를 예상값과 비교합니다.' },
      ] },
      { type: 'misconception', title: '흔한 오해', items: ['블록체인에 기록되면 입력 데이터와 스마트 컨트랙트 로직이 자동으로 안전하다.', '프론트엔드 화면에 표시된 함수명만 확인하면 실제 서명 내용도 같다고 볼 수 있다.', '트랜잭션이 성공했다는 사실이 업무 규칙과 권한 검사가 올바르다는 뜻이다.'] },
      { id: 'w7-web3-boundary-checkpoint', type: 'checkpoint', title: '신뢰 경계 확인', prompt: '상태 변경 전에 가장 먼저 함께 고정할 항목은?', options: ['network·contract address·function·sender·value', '토큰 가격 하나', '화면 색상'], answer: 0, explanation: '서명과 실행이 어느 체인·주소·함수·계정에 적용되는지 고정해야 관찰 대상을 혼동하지 않습니다.' },
      { type: 'sources', title: '공식 근거', items: [ethereumSmartContracts, ethereumTransactions] },
      { type: 'summary', title: '핵심 정리', bullets: ['Web3 앱은 화면·지갑·RPC·contract·chain 상태를 분리해 본다.', '스마트 컨트랙트는 코드와 상태가 있는 주소이며 트랜잭션으로 상태가 바뀐다.', '성공 receipt와 보안 규칙의 적절성은 별도 판단이다.'] },
    ],
  },
  {
    id: 'w7-smart-contract-fuzzing',
    title: '스마트 컨트랙트 Invariant Fuzzing 입문',
    duration: 42,
    summary: '실제 자산이나 공개 체인 대신 로컬 합성 상태 모델에서 반드시 유지돼야 할 invariant를 반복 확인합니다.',
    activityType: 'lesson',
    path: 'required',
    blocks: [
      { type: 'explanation', title: '스마트 컨트랙트 Fuzzing은 무엇을 확인하나', paragraphs: [
        '일반 fuzzing이 다양한 입력으로 코드 경로와 실패 신호를 찾는다면, stateful 스마트 컨트랙트 fuzzing은 여러 함수 호출 순서 뒤에도 보안 불변조건이 유지되는지 확인합니다. 예를 들어 전체 공급량과 계정별 잔액 합계가 맞아야 한다는 조건을 oracle로 둘 수 있습니다.',
        '이 과정에서는 실제 지갑, 공개 RPC, 실제 토큰이나 배포 기능을 사용하지 않습니다. 브라우저에 포함된 합성 ledger 상태와 고정 호출 목록만 읽어 seed, 호출 순서, 상태 변화, invariant 결과를 구분합니다.',
      ] },
      { type: 'code', sourceType: 'educational-reconstruction', title: '합성 Ledger의 Invariant', language: 'text', description: '실제 Solidity 배포 코드가 아니라 상태 기반 fuzzing 구조를 설명하기 위한 로컬 모델입니다.', code: 'initialState: totalSupply = 100\n              balances = {alice: 60, bob: 40}\n\nactions: transfer(sender, receiver, amount)\n         pause(admin)\n         unpause(admin)\n\ninvariant A: sum(balances) == totalSupply\ninvariant B: paused 상태에서는 transfer가 상태를 바꾸지 않음\ninvariant C: 승인되지 않은 계정은 pause 상태를 바꾸지 못함', annotations: ['Fuzzer는 고정된 로컬 계정과 범위 안의 amount를 조합합니다.', '한 번의 함수 입력뿐 아니라 여러 action의 순서 뒤 상태를 확인합니다.', 'Invariant 위반은 조사할 단서이며 실제 자산 영향은 별도 근거가 필요합니다.'] },
      { type: 'comparison', title: 'Fuzzing에서 구분할 입력과 판정', columns: ['항목', '합성 예시', '보안상 의미'], rows: [
        ['Seed state', 'alice 60, bob 40, total 100', '반복 실행의 같은 출발점'],
        ['Action sequence', 'pause → transfer → unpause', '상태 전이를 탐색하는 호출 순서'],
        ['Invariant', 'paused일 때 잔액 불변', '실행 뒤 반드시 유지돼야 할 조건'],
        ['Failure artifact', 'sequence ID와 전후 state diff', '로컬 재현과 원인 분석에 필요한 증거'],
      ] },
      { type: 'timeline', title: '로컬 Invariant Fuzzing 흐름', items: [
        { title: '상태와 역할 고정', body: '합성 account, balance, role과 초기 state를 정합니다.' },
        { title: '허용 action 정의', body: '로컬 모델에서 호출할 함수와 값 범위를 제한합니다.' },
        { title: '호출 순서 생성', body: '여러 action 순서를 만들고 매 실행 전 같은 seed로 초기화합니다.' },
        { title: 'Invariant 판정', body: '각 호출 뒤 공급량·권한·pause 조건을 확인합니다.' },
        { title: '최소 재현과 회귀', body: '위반을 만드는 가장 짧은 순서를 보존하고 수정 뒤 정상 순서도 함께 재시험합니다.' },
      ] },
      { type: 'misconception', title: '흔한 오해', items: ['무작위 transaction을 공개 체인에 많이 보내는 것이 스마트 컨트랙트 fuzzing이다.', 'Invariant 위반 하나만으로 실제 자산 손실 규모와 악용 가능성이 확정된다.', '실패 sequence만 통과하면 정상 사용자 흐름은 재시험하지 않아도 된다.'] },
      { id: 'w7-smart-contract-invariant-checkpoint', type: 'checkpoint', title: 'Invariant 확인', prompt: '스마트 컨트랙트의 invariant로 가장 알맞은 것은?', options: ['실행할 때마다 gas 가격이 같다', '모든 상태 전이 뒤에도 총 공급량과 잔액 합계가 일치한다', '공개 체인에 요청을 많이 보낸다'], answer: 1, explanation: 'Invariant는 허용된 여러 상태 전이 뒤에도 반드시 유지돼야 하는 조건입니다.' },
      { type: 'sources', title: '공식 근거', items: [ethereumSmartContracts, soliditySecurity] },
      { type: 'summary', title: '핵심 정리', bullets: ['Web3 fuzzing은 입력 하나뿐 아니라 상태와 호출 순서를 함께 탐색한다.', 'Invariant는 공급량·권한·상태 전이처럼 반드시 유지할 조건이다.', '실습은 로컬 합성 모델로 제한하고 실제 지갑·RPC·자산을 사용하지 않는다.'] },
    ],
  },
])

export const web3FuzzingQuizQuestions = Object.freeze([
  { id: 'w7web3q1', conceptIds: ['w7-web3-foundations'], difficulty: 'foundation', remediationModuleIds: ['w7-web3-foundations'], question: 'Web3 상태 변경을 분석할 때 먼저 함께 고정할 항목은?', options: ['network·contract address·function·sender', '토큰 가격만', '화면에 표시된 버튼 색상'], answer: 0, explanation: '서명과 실행의 실제 대상과 주체를 먼저 고정해야 화면·지갑·contract 상태를 혼동하지 않습니다.' },
  { id: 'w7web3q2', conceptIds: ['w7-smart-contract-fuzzing'], difficulty: 'application', remediationModuleIds: ['w7-smart-contract-fuzzing'], question: 'Stateful smart contract fuzzing에서 invariant의 역할은?', options: ['공개 체인으로 transaction 전송', '여러 호출 순서 뒤에도 유지돼야 할 조건 판정', '실제 자산 손실 규모 자동 확정'], answer: 1, explanation: 'Invariant는 여러 상태 전이 뒤 공급량·권한 같은 필수 조건이 유지되는지 판정하는 oracle입니다.' },
])

export const web3FuzzingLab = Object.freeze({
  id: 'w7-web3-invariant-triage',
  week: 7,
  title: '합성 스마트 컨트랙트 Invariant 판별',
  kind: 'guided-observation',
  activityType: 'investigation',
  path: 'required',
  estimatedMinutes: 30,
  objective: '로컬 합성 ledger 전사에서 호출 순서, 상태 변화와 invariant 위반을 구분합니다.',
  prerequisites: ['w7-web3-foundations', 'w7-smart-contract-fuzzing'],
  requiredTools: ['브라우저', '내장 합성 ledger 전사'],
  safeScope: '실제 지갑·RPC·스마트 컨트랙트·토큰을 사용하지 않고 브라우저의 고정 합성 전사만 읽습니다.',
  successCriteria: ['대상 network·contract·sender 구분', '호출 전후 상태 비교', '직접 확인한 invariant 위반과 미확정 영향을 분리'],
  hints: ['먼저 초기 totalSupply와 balances 합계를 비교하세요.', '각 action 뒤 paused 상태와 balance 변화를 확인하세요.', '합성 상태 위반은 원인 조사 단서이며 실제 자산 피해를 뜻하지 않습니다.'],
  relatedConceptIds: ['w7-web3-foundations', 'w7-smart-contract-fuzzing'],
  nextRecommendations: ['w7-smart-contract-fuzzing'],
  submissionSchema: ['신뢰 경계', 'Action sequence', '전후 상태', 'Invariant 판정과 한계'],
  rubric: ['실제 체인이나 자산을 사용하지 않음', '호출 순서와 상태 변화를 연결함', '직접 관찰과 영향 추정을 구분함', '재시험할 invariant를 명시함'],
  scenario: {
    steps: ['합성 network·contract·sender를 확인합니다.', '초기 상태와 action sequence를 순서대로 읽습니다.', '각 action 뒤 totalSupply·balances·paused 상태를 비교합니다.', '전사에서 직접 확인되는 위반과 과장된 결론을 구분합니다.'],
    artifacts: [
      { title: '합성 Ledger 실행 전사', code: 'network: local-simulated\ncontract: ledger-demo\nsender: learner-a\ninitial: totalSupply=100 balances={learner-a:60, learner-b:40} paused=true\naction: transfer(learner-a, learner-b, 10)\nresult: balances={learner-a:50, learner-b:50} paused=true\ncredentials: [NOT USED]' },
    ],
    evidenceOptions: [
      { id: 'web3-paused-change', label: 'paused 상태에서 잔액이 변경됨', detail: '전사에서 paused=true인데 transfer 뒤 두 잔액이 각각 변경됐습니다.' },
      { id: 'web3-supply-preserved', label: '잔액 합계와 totalSupply는 계속 100', detail: '50+50과 totalSupply 100이 일치합니다.' },
      { id: 'web3-real-loss', label: '실제 자산 10개 탈취 확정', detail: '로컬 합성 전사에는 실제 자산이나 공개 체인 거래가 없습니다.' },
      { id: 'web3-public-exploit', label: '공개 체인 악용 가능성 확정', detail: '합성 상태 위반만으로 실제 배포·도달 가능성·영향을 확정할 수 없습니다.' },
    ],
    correctEvidenceIds: ['web3-paused-change', 'web3-supply-preserved'],
    reflection: { prompt: '어떤 invariant가 깨졌고 어떤 invariant는 유지됐는지 전후 상태를 근거로 설명하세요.', minimumLength: 40 },
    conclusion: 'paused 상태 불변조건 위반을 재현 sequence와 함께 보존하고, 실제 영향은 별도 배포·권한 근거가 없으므로 미확정으로 기록합니다.',
  },
})
