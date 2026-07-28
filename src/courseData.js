import { week0LessonBlocks } from './content/week0Blocks.js'
import { week1LessonBlocks } from './content/week1Blocks.js'
import { week2LessonBlocks } from './content/week2Blocks.js'
import { week3LessonBlocks } from './content/week3Blocks.js'
import { week4LessonBlocks, week4LessonMeta, week4ReportEvidenceScenario } from './content/week4Blocks.js'
import { weekZeroDefinition } from './data/week0/weekDefinition.js'
import { weekZeroQuizQuestions, weekZeroQuizRule } from './data/week0/quiz.js'
import { week5to10Content, week5to10Quizzes } from './data/curriculum/week5to10.js'
import { week11to16Content, week11to16Quizzes } from './data/curriculum/week11to16.js'
import { objectiveModuleAlignment } from './objectiveAlignment.js'
import { applyBaseModuleArchitecture, getSupplementalLabs } from './content/curriculumArchitecture.js'
import { applyContentOverrides } from './content/contentOverrides.js'
import { applySystemIntroWeekDesign } from './content/systemIntroSessions.js'
import { web3FuzzingLab, web3FuzzingModules, web3FuzzingQuizQuestions } from './content/week7Web3Blocks.js'
import { supplyChainLab, supplyChainModules, supplyChainQuizQuestions } from './content/week8SupplyChainBlocks.js'
import { otSecurityWeek, otSecurityQuizQuestions } from './data/curriculum/otSecurityWeek.js'

export const masteryLabels = {
  unknown: '아직 모름',
  heard: '들어본 적 있음',
  explain: '설명 가능',
  apply: '기초 적용 가능',
  reproduce: '재현·응용 가능',
  not_started: '미시작',
  attempted: '시도함',
  familiar: '익숙함',
  proficient: '숙련',
  mastered: '마스터',
}

export const activityTypes = Object.freeze([
  'exploration',
  'lesson',
  'practice',
  'investigation',
  'simulation',
  'external',
  'report',
  'assessment',
])

export const learningPaths = Object.freeze(['required', 'extension'])

export const activityTypeMetadata = Object.freeze({
  exploration: { label: '탐색', completionMode: 'reflection' },
  lesson: { label: '개념 학습', completionMode: 'read-and-check' },
  practice: { label: '연습', completionMode: 'result' },
  investigation: { label: '관찰·분석', completionMode: 'analysis' },
  simulation: { label: '시뮬레이션', completionMode: 'state-goal' },
  external: { label: '공식 외부 활동', completionMode: 'learner-confirmed' },
  report: { label: '주차 학습 정리', completionMode: 'submission' },
  assessment: { label: '이해 확인', completionMode: 'explicit-rule' },
})

export const pathMetadata = Object.freeze({
  required: { label: '필수 경로' },
  extension: { label: '확장 경로' },
})

const labActivityTypes = {
  mindmap: 'exploration',
  baseline: 'assessment',
  sequence: 'simulation',
  timeline: 'simulation',
  cookie: 'simulation',
  'http-label': 'investigation',
  'http-baseline': 'investigation',
  'tool-triangle': 'investigation',
  'request-editor': 'investigation',
  'source-sink': 'investigation',
  'threat-model': 'investigation',
  'week0-map': 'exploration',
  'xss-reflected': 'investigation',
  'xss-stored': 'investigation',
  'xss-dom': 'investigation',
  'xss-filtering': 'investigation',
  'report-evidence': 'investigation',
  external: 'external',
}

const week4CveFirstModuleOrder = ['w4-nature', 'w4-types', 'w4-taint', 'w4-context', 'w4-impact', 'w4-defense', 'w4-validation']

function normalizeWeek(week) {
  const normalizedModules = week.modules.map((module) => ({
    ...module,
    ...(week0LessonBlocks[module.id] ? { blocks: week0LessonBlocks[module.id] } : {}),
    ...(week1LessonBlocks[module.id] ? { blocks: week1LessonBlocks[module.id] } : {}),
    ...(week2LessonBlocks[module.id] ? { blocks: week2LessonBlocks[module.id] } : {}),
    ...(week3LessonBlocks[module.id] ? { blocks: week3LessonBlocks[module.id] } : {}),
    ...(week4LessonMeta[module.id] ? { ...week4LessonMeta[module.id], contentLevel: 'deep-guide-v3', blocks: week4LessonBlocks[module.id] } : {}),
    activityType: module.activityType || 'lesson',
    path: module.path || 'required',
    estimatedMinutes: module.estimatedMinutes ?? module.duration,
  }))
  const orderedModules = week.curriculumId === 'week-4'
    ? [...normalizedModules].sort((left, right) => week4CveFirstModuleOrder.indexOf(left.id) - week4CveFirstModuleOrder.indexOf(right.id))
    : normalizedModules
  const architectedModules = week.disableArchitecture ? orderedModules : applyBaseModuleArchitecture(week.index, orderedModules)
  const modules = applyContentOverrides(architectedModules).map((module) => {
    const sessionIndex = week.sessions?.findIndex((session) => session.moduleIds.includes(module.id)) ?? -1
    const session = sessionIndex >= 0 ? week.sessions[sessionIndex] : null
    return session ? { ...module, sessionId: session.id, sessionNumber: sessionIndex + 1, sessionTitle: session.title } : module
  })
  const supplementalLabs = week.disableArchitecture ? [] : getSupplementalLabs(week.index)
  const labs = [...week.labs, ...supplementalLabs].filter((lab) => !week.retiredActivityIds?.includes(lab.id)).map((lab) => ({
    ...lab,
    activityType: lab.activityType || labActivityTypes[lab.kind] || 'practice',
    path: lab.path || (lab.kind === 'external' ? 'extension' : 'required'),
  }))
  const assessment = week.disableAssessment ? null : {
    id: `w${week.index}-quiz`,
    title: `${week.index}주차 이해 확인`,
    activityType: 'assessment',
    path: 'required',
    estimatedMinutes: week.quizMinutes,
  }
  const weeklyRecord = week.disableWeeklyRecord ? null : {
    id: `w${week.index}-record`,
    title: `${week.index}주차 학습 정리`,
    activityType: 'report',
    path: 'required',
    estimatedMinutes: week.recordMinutes,
  }
  const workloadItems = [
    ...modules.map((module) => ({ ...module, source: 'module' })),
    ...labs.map((lab) => ({ ...lab, source: 'lab' })),
    ...(assessment ? [{ ...assessment, source: 'assessment' }] : []),
    ...(weeklyRecord ? [{ ...weeklyRecord, source: 'record' }] : []),
  ]
  const minutesForPath = (path) => workloadItems
    .filter((item) => item.path === path)
    .reduce((total, item) => total + item.estimatedMinutes, 0)
  const requiredMinutes = minutesForPath('required')
  const extensionMinutes = minutesForPath('extension')
  const byActivityType = Object.fromEntries(activityTypes.map((activityType) => [
    activityType,
    workloadItems
      .filter((item) => item.activityType === activityType)
      .reduce((total, item) => total + item.estimatedMinutes, 0),
  ]))

  return {
    ...week,
    modules,
    labs,
    assessment,
    weeklyRecord,
    requiredMinutes,
    extensionMinutes,
    estimatedMinutes: requiredMinutes + extensionMinutes,
    workload: {
      requiredMinutes,
      extensionMinutes,
      totalMinutes: requiredMinutes + extensionMinutes,
      byPath: { required: requiredMinutes, extension: extensionMinutes },
      byActivityType,
      items: workloadItems.map(({ id, title, activityType, path, estimatedMinutes, source }) => ({
        id,
        title,
        activityType,
        path,
        estimatedMinutes,
        source,
      })),
    },
  }
}

const baseLaterWeekContent = { ...week5to10Content, ...week11to16Content }

const commonLabFields = {
  submissionSchema: ['과정 기록', '관찰 결과', '원리 설명', '민감정보 마스킹 확인'],
  rubric: ['재현 가능한 순서', '관찰과 결론의 연결', '안전 범위 준수', '자기 언어로 쓴 설명'],
}

const baseWeekContent = {
  0: {
    id: 'week-0', index: 0, title: '오리엔테이션·보안 전체 지도',
    summary: '이 과정에서 무엇을, 어디까지, 어떤 증거를 남기며 학습할지 먼저 정합니다.',
    objectives: ['정보보안의 주요 분야를 한 장의 지도에서 구분한다.', '자산·위협·취약점·위험·통제의 관계를 설명한다.', '허가된 범위와 Rules of Engagement를 판단한다.', '관심 직무와 15주 학습 내용을 연결한다.'],
    prerequisites: ['별도 선수지식 없음', '웹 브라우저', '메모를 남길 수 있는 환경'],
    estimatedMinutes: 150, quizMinutes: 15, recordMinutes: 25,
    modules: [
      { id: 'w0-platform', title: '플랫폼 사용법', duration: 12, summary: '개념, 실습 기록, 이해 확인과 숙련 근거가 어떻게 이어지는지 확인합니다.', paragraphs: ['실습 완료와 개념 숙련도는 다릅니다. 플래그를 찾았더라도 사용한 명령과 결과를 설명하지 못하면 숙련 근거가 충분하지 않습니다.', '결과 확인은 정답이나 관찰 조건을 확인할 뿐 설명의 정확성을 대신하지 않습니다. 힌트 사용은 감점이 아니라 막힌 지점을 파악하는 학습 신호입니다.'], points: ['외부 실습은 목표·사용 명령·핵심 원리·막힌 지점·결과 기록을 남긴다.', '보고서는 Week 4에서 갑자기 쓰는 문서가 아니라 Week 1부터 쌓는 관찰 기록에서 출발한다.', '쿠키·토큰·비밀번호·개인정보는 캡처와 코드 블록에서 마스킹한다.'] },
      { id: 'w0-ethics', title: '보안 윤리와 안전한 범위', duration: 25, summary: '허가, 스코프, 최소 영향, 책임 있는 공개의 기준을 배웁니다.', paragraphs: ['보안 테스트의 출발점은 기술이 아니라 명시적 허가입니다. 공개된 서비스라는 사실은 테스트 허가를 뜻하지 않습니다.', 'Rules of Engagement는 대상, 허용 시간, 허용 기법, 금지 기법, 비상 연락, 데이터 처리, 종료 조건을 문서화한 약속입니다. 범위가 애매하면 실행하지 않고 담당자에게 확인합니다.'], points: ['허가 없는 스캔·타인 계정 접근·데이터 탈취·서비스 방해는 금지한다.', '운영 데이터 대신 테스트 계정과 테스트 데이터를 사용한다.', '필요한 최소 증거만 수집하고 테스트가 끝나면 약속된 방식으로 폐기한다.', '취약점은 지정된 보안 연락 채널로 비공개 제보한다.'] },
      { id: 'w0-language', title: '핵심 보안 언어', duration: 30, summary: '같아 보이지만 다른 기본 용어를 사례 중심으로 구분합니다.', terms: [
        ['자산 Asset', '조직이 보호해야 하는 데이터, 시스템, 서비스, 사람과 평판'],
        ['위협 Threat', '자산에 손해를 줄 수 있는 사건이나 조건'],
        ['취약점 Vulnerability', '위협이 이용할 수 있는 설계·구현·운영의 약점'],
        ['익스플로잇 Exploit', '취약점을 실제 동작으로 이용하는 방법이나 코드'],
        ['위험 Risk', '위협이 취약점을 이용할 가능성과 발생했을 때의 영향을 함께 본 값'],
        ['통제 Control', '위험을 예방·탐지·대응·복구하기 위한 기술·절차·조직적 장치'],
        ['잔여 위험', '통제를 적용한 뒤에도 남아 있는 위험'],
        ['오탐·미탐', '정상을 공격으로 판단한 경우와 공격을 놓친 경우'],
        ['근본 원인', '증상이나 우회 문자열이 아니라 취약한 동작을 만든 구조적 이유'],
        ['재시험', '수정 후 동일 조건과 회귀 조건으로 취약점이 제거됐는지 확인하는 절차'],
      ] },
      { id: 'w0-goals', title: '보안의 기본 목표와 설계 원칙', duration: 30, summary: 'CIA와 인증·인가를 실제 통제에 연결합니다.', points: ['기밀성: 허가된 주체만 정보에 접근한다.', '무결성: 정보와 시스템이 허가 없이 변경되지 않으며 변경을 추적할 수 있다.', '가용성: 필요한 사용자가 필요한 시점에 서비스를 사용할 수 있다.', '식별은 누구인지 주장하는 단계, 인증은 그 주장을 확인하는 단계, 인가는 허용 행동을 결정하는 단계다.', '최소 권한, 직무 분리, 심층 방어, 기본 거부, 공격 표면 최소화, 안전한 실패를 함께 적용한다.', 'Zero Trust는 특정 제품이 아니라 요청마다 주체·장치·상황을 검증하고 최소 권한을 적용하는 원칙이다.'] },
      { id: 'w0-flow', title: '공격과 방어의 흐름', duration: 25, summary: '직무 이름보다 실제로 남기는 결과물을 기준으로 구분합니다.', points: ['공격 관점: 정보 수집 → 진입점 식별 → 취약점 검증 → 영향 확인 → 증거 정리', '방어 관점: 예방 → 탐지 → 분석 → 대응 → 복구 → 개선', 'Red Team은 공격 경로를 검증하고 Blue Team은 탐지·대응하며 Purple Team은 둘의 학습을 연결한다.', '취약점 진단은 약점을 찾고, 모의침투는 약점이 연결되는 공격 경로와 영향을 검증한다.', '사고 대응은 진행 중이거나 발생한 침해를 제한·복구하고, 포렌식은 증거를 보존해 사실관계를 재구성한다.'] },
      { id: 'w0-system', title: '컴퓨터 시스템 미리보기', duration: 28, summary: 'Linux와 Pwn 학습 전에 하드웨어·운영체제·프로세스 관계를 한 번 봅니다.', points: ['CPU는 명령어를 가져와 해석하고 실행하며 레지스터는 실행 중인 작은 상태를 보관한다.', '프로세스는 실행 중인 프로그램의 자원 단위이고 스레드는 그 안의 실행 흐름이다.', '가상 메모리는 각 프로세스에 독립된 주소 공간처럼 보이는 추상화를 제공한다.', '사용자 모드 코드는 시스템 호출을 통해 커널에 파일·네트워크·메모리 작업을 요청한다.', '파일 시스템은 데이터를 경로와 메타데이터로 구성하고 권한은 주체별 접근을 제한한다.', '소켓은 프로세스가 네트워크 통신을 다루는 운영체제 인터페이스다.'] },
    ],
    labs: [
      { ...commonLabFields, id: 'w0-map', week: 0, title: '나의 보안 지도 만들기', kind: 'mindmap', estimatedMinutes: 35, objective: '최소 10개 노드의 현재 이해 상태를 기록하고 관심 직무와 필요한 개념을 연결합니다.', prerequisites: ['핵심 보안 언어 읽기'], requiredTools: ['브라우저'], safeScope: '개인 학습 상태와 메모만 저장합니다.', successCriteria: ['노드 10개 이상 상태 지정', '관심 직무 2개 선택', '개인 메모 3개 이상'], hints: ['먼저 들어본 용어부터 상태를 표시하세요.', '관심 직무를 검색하고 연결된 기술 노드를 확인하세요.', '모르는 노드 3개에 궁금한 점을 한 문장씩 적으세요.'], relatedConceptIds: ['w0-language', 'w0-flow'], nextRecommendations: ['Rules of Engagement 판별'] },
      { ...commonLabFields, id: 'w0-roe', week: 0, title: 'Rules of Engagement 판별', kind: 'roe', estimatedMinutes: 20, objective: '실습 전 허가·범위·시간·증거 처리 기준을 판단합니다.', prerequisites: ['보안 윤리와 안전한 범위'], requiredTools: ['브라우저'], safeScope: '문장 분류만 수행하며 외부 요청은 발생하지 않습니다.', successCriteria: ['6개 사례 모두 분류', '5개 이상 판단 일치', '확인 필요와 마스킹 사유 설명'], hints: ['대상이 공개됐는지가 아니라 명시적 허가가 있는지 보세요.', '기술이 허용돼도 시간·계정·중단 조건이 빠졌으면 담당자 확인이 먼저입니다.', '증거 수집에서도 개인정보와 토큰의 최소 수집 원칙을 확인하세요.'], relatedConceptIds: ['w0-ethics'], nextRecommendations: ['베이스라인 진단'] },
      { ...commonLabFields, id: 'w0-baseline', week: 0, title: '베이스라인 진단', kind: 'baseline', estimatedMinutes: 10, objective: '현재 경험과 관심 분야를 기록해 추천 순서를 조정합니다.', prerequisites: [], requiredTools: ['브라우저'], safeScope: '점수는 순위와 성적에 사용하지 않습니다.', successCriteria: ['6개 항목 응답', '관심 분야 선택'], hints: ['잘 보이기 위한 시험이 아닙니다.', '한 번 해본 것과 설명 가능한 것을 구분하세요.', '모르겠다면 경험 없음으로 답해도 됩니다.'], relatedConceptIds: ['w0-platform'], nextRecommendations: ['Week 1 Linux 환경 점검'] },
    ],
    deliverables: ['CodeCureLAB Security Charter: 보호 자산·핵심 위험·통제·검증 방법·허가 범위', '개인 마인드맵 JSON 또는 캡처와 관심 직무 이유', 'Rules of Engagement 판별 기록', '베이스라인 진단 결과'],
    recordBlueprint: { title: 'CodeCureLAB Security Charter', description: '보호 자산, 핵심 위험, 통제·검증, 허가 범위를 한 문서에서 연결합니다.', sections: ['보호 자산과 서비스 기능', '핵심 위험 3개와 근거', '통제와 검증 방법', '교육·테스트 허가 범위'] },
    reportConnection: '증거에 토큰·쿠키·개인정보를 남기지 않는 습관과 테스트 범위를 먼저 기록합니다.',
    next: 'Week 1 · 보안 기초와 Linux 1',
  },
  1: {
    id: 'week-1', index: 1, title: '보안 기초·Linux 1',
    summary: '명령어 이름보다 현재 위치, 대상 경로, 권한, 실제 출력을 읽는 순서를 익힙니다.',
    objectives: ['터미널·셸·운영체제·프로세스의 관계를 설명한다.', '절대 경로와 상대 경로를 구분한다.', '파일 유형·메타데이터와 안전한 파일 변경·버전 기록을 확인한다.', 'SSH 접속 흐름과 호스트 키의 목적을 설명한다.'],
    prerequisites: ['Week 0 윤리·스코프 확인', '키보드로 명령을 입력할 수 있음'], estimatedMinutes: 360, quizMinutes: 15, recordMinutes: 25,
    modules: [
      { id: 'w1-shell', title: '운영체제·터미널·셸', duration: 35, summary: '터미널은 입출력 창이고 셸은 명령을 해석하며 운영체제 커널은 실제 자원 작업을 수행합니다.', points: ['명령은 보통 명령어, 옵션, 인자로 나뉜다.', '프롬프트에는 사용자·호스트·현재 경로 정보가 나타날 수 있다.', '종료 코드 0은 일반적으로 성공, 0이 아닌 값은 오류나 다른 상태를 뜻한다.', '같은 명령도 현재 디렉터리와 사용자 권한에 따라 결과가 달라진다.'] },
      { id: 'w1-filesystem', title: 'Linux 파일 시스템과 경로', duration: 50, summary: '루트에서 시작하는 하나의 디렉터리 트리와 경로 표기법을 읽습니다.', points: ['`/`는 파일 시스템의 시작점, `/home`은 일반 사용자 홈, `/etc`는 시스템 설정, `/var`는 변하는 데이터, `/tmp`는 임시 파일에 주로 쓰인다.', '`~`는 홈, `.`은 현재 디렉터리, `..`은 상위 디렉터리를 뜻한다.', '`/home/student/report.txt`는 절대 경로이고 `notes/report.txt`는 현재 위치를 기준으로 한 상대 경로다.', '점으로 시작하는 이름은 일반 `ls` 출력에서 숨겨지지만 접근 통제가 적용된 것은 아니다.', '확장자는 이름의 일부일 뿐 실제 파일 형식을 보장하지 않는다.'] },
      { id: 'w1-navigation', title: '탐색·검색·읽기·도움말 명령', duration: 80, summary: '`pwd`, `ls`, `cd`, `find`, `grep`, `file`, `cat`, `less`, `head`, `tail`, `stat`, `man`을 실습 전에 예시로 익힙니다.', points: ['먼저 `pwd`와 `ls -la`로 맥락을 확인한다.', '`find . -type f -name "*.log"`처럼 시작 경로와 조건을 지정해 파일을 찾는다.', '`grep -n "ERROR" logs/error.log`처럼 파일 안에서 조건에 맞는 줄과 줄 번호를 찾는다.', '`find`는 파일 시스템 항목을, `grep`은 텍스트 줄을 검색하며 후보 경로를 찾은 뒤 내용을 검색하는 순서로 조합할 수 있다.', '파일을 읽기 전에 `file`과 `stat`으로 형식·크기·권한을 본다.', '짧은 텍스트는 `cat`, 긴 파일은 `less`, 앞뒤 일부는 `head`·`tail`을 사용한다.', '모르는 옵션은 `man` 또는 `--help`의 SYNOPSIS와 OPTIONS에서 확인한다.', '오류 메시지는 실행한 명령, 대상 경로, 권한, 파일 존재 여부 순서로 읽는다.'] },
      { id: 'w1-fileops', title: '파일 조작과 셸 표현', duration: 55, summary: '파일 변경 명령과 따옴표·이스케이프·글로빙을 안전하게 다룹니다.', points: ['`touch`, `mkdir -p`, `cp`, `mv`, `rm`, `rmdir`의 대상과 영향 범위를 실행 전에 확인한다.', '재귀 삭제 옵션은 하위 경로 전체에 영향을 주므로 실습 경계 밖에서 사용하지 않는다.', '공백이 있는 파일명은 작은따옴표·큰따옴표 또는 역슬래시로 한 인자임을 표시한다.', '`*`와 `?`는 셸이 명령 실행 전에 파일명 목록으로 확장할 수 있다.', '하이픈으로 시작하는 파일명 앞에는 `--`를 사용해 옵션 해석을 끝낼 수 있다.'] },
      { id: 'w1-permission', title: '사용자·그룹·권한 미리보기', duration: 35, summary: '소유자·그룹·기타와 r·w·x를 파일과 디렉터리에서 구분합니다.', points: ['파일 r은 내용 읽기, w는 내용 변경, x는 프로그램 실행과 관련된다.', '디렉터리 r은 이름 목록, w는 항목 생성·삭제, x는 경로 진입·탐색과 관련된다.', '디렉터리 x가 없으면 이름을 알아도 하위 파일에 접근하기 어렵다.', '상세 계산과 chmod는 이 주차의 권한 학습에서 이어서 다룬다.'] },
      { id: 'w1-ssh', title: 'SSH 입문', duration: 35, summary: '로컬 터미널에서 암호화된 원격 셸로 연결되는 단계를 이해합니다.', points: ['접속 정보는 사용자명, 호스트, 포트로 구성된다.', '서버 호스트 키는 지금 연결한 서버의 신원을 확인하는 기준이다.', '최초 접속 경고는 호스트 키 지문을 공식 채널의 값과 비교한 뒤 승인한다.', '비밀번호 인증과 키 기반 인증은 사용자 인증 방식이 다르다.', '`exit` 또는 Ctrl+D로 원격 셸을 종료하고 로컬 셸로 돌아온다.'] },
    ],
    labs: [
      { ...commonLabFields, id: 'w1-treasure', week: 1, title: '파일 시스템 보물찾기', kind: 'linux-shell', estimatedMinutes: 45, objective: '읽기 전용 가상 파일 시스템에서 세 개의 FLAG를 찾아 명령 순서를 남깁니다.', prerequisites: ['경로', '`pwd`, `ls`, `cd`, `cat`, `file`, `find`, `grep`'], requiredTools: ['내장 가상 Linux 셸'], safeScope: '브라우저 메모리 안의 읽기 전용 파일 시스템입니다.', successCriteria: ['FLAG 3개 확인', '사용 명령 기록', '각 명령의 목적 설명'], hints: ['보이는 이름부터 목록으로 확인하세요.', '숨김 파일은 일반 목록에 나오지 않습니다.', '파일 경로를 먼저 찾고 그 안의 특정 문자열을 검색하세요.'], relatedConceptIds: ['w1-filesystem', 'w1-navigation'], nextRecommendations: ['경로 오류 고치기', 'Bandit 0~5'] },
      { ...commonLabFields, id: 'w1-path', week: 1, title: '경로 오류 고치기', kind: 'path', estimatedMinutes: 25, objective: '절대·상대 경로를 혼동한 예시를 고치고 오류 원인을 설명합니다.', prerequisites: ['절대 경로와 상대 경로'], requiredTools: ['브라우저'], safeScope: '경로 문자열만 다룹니다.', successCriteria: ['6개 중 5개 이상 수정', '오류 원인 설명'], hints: ['명령 실행 전 현재 위치를 확인하세요.', '`/`로 시작하는지 먼저 보세요.', '현재 위치와 목표 위치 사이의 공통 경로를 찾아보세요.'], relatedConceptIds: ['w1-filesystem'], nextRecommendations: ['SSH 연결 흐름'] },
      { ...commonLabFields, id: 'w1-ssh-flow', week: 1, title: 'SSH 연결 흐름', kind: 'sequence', estimatedMinutes: 20, objective: '사용자·호스트·포트·호스트 키 확인·인증·종료 순서를 배치합니다.', prerequisites: ['SSH 입문'], requiredTools: ['브라우저'], safeScope: '외부 서버에 연결하지 않는 시뮬레이션입니다.', successCriteria: ['연결 6단계 순서 완성'], hints: ['연결 대상 정보가 인증보다 먼저 필요합니다.', '서버 신원 확인과 사용자 인증은 다른 단계입니다.', '세션 종료 후 로컬 셸로 돌아옵니다.'], relatedConceptIds: ['w1-ssh'], nextRecommendations: ['OverTheWire Bandit 0~5'] },
      { ...commonLabFields, id: 'w1-bandit', week: 1, title: 'OverTheWire Bandit 0~5', kind: 'external', estimatedMinutes: 120, objective: '공식 워게임에서 기본 명령과 SSH 흐름을 적용하고 풀이 기록을 남깁니다.', prerequisites: ['파일 탐색', 'SSH'], requiredTools: ['SSH 클라이언트', 'OverTheWire 공식 계정'], safeScope: 'OverTheWire가 제공한 Bandit 서버와 계정 범위만 사용합니다.', successCriteria: ['0~5 레벨 완료', '레벨별 목표·명령·원리·막힌 지점 기록', '다음 레벨 비밀번호 마스킹'], hints: ['레벨 설명에서 필요한 파일 조건을 먼저 표시하세요.', '하나의 명령으로 끝내려 하지 말고 후보를 좁히세요.', '필요한 명령의 man 페이지에서 옵션을 확인하세요.'], relatedConceptIds: ['w1-navigation', 'w1-ssh'], nextRecommendations: ['Week 2 권한과 파이프'] },
    ],
    deliverables: ['Bandit 0~5 풀이 기록', '가상 파일 시스템 보물찾기 로그', 'Linux 명령을 실행하기 전 확인할 것 5개'],
    recordBlueprint: { title: 'Linux Investigation Notebook 01', description: '파일과 텍스트를 찾는 과정에서 실행 맥락, 명령, 관찰, 해석을 분리해 기록합니다.', sections: ['환경·허가 범위', '현재 위치와 대상 경로', '명령·옵션·입력', '출력에서 확인한 사실', '해석·남은 질문·마스킹 확인'] },
    reportConnection: '명령과 출력을 정확히 기록하고, 기대 결과와 실제 결과를 분리하며, 자격 증명을 마스킹합니다.', next: 'Week 2 · Linux 2와 관찰 도구',
  },
  2: {
    id: 'week-2', index: 2, title: 'Linux 2·개발 및 웹 진단 도구',
    summary: '권한과 표준 스트림을 읽고, 명령을 조합해 데이터를 좁힌 뒤 HTTP 요청을 도구별로 비교합니다.',
    objectives: ['Linux 권한을 기호·숫자로 해석한다.', 'stdin·stdout·stderr와 리다이렉션·파이프를 구분한다.', '인코딩·암호화·해싱을 구분한다.', 'DevTools·curl·Burp로 같은 HTTP 요청을 관찰한다.'],
    prerequisites: ['Week 1 경로와 기본 명령', '허가된 대상과 스코프'], estimatedMinutes: 420, quizMinutes: 15, recordMinutes: 25,
    modules: [
      { id: 'w2-permissions', title: '소유권과 권한', duration: 50, summary: '사용자·그룹·기타의 권한을 파일과 디렉터리에서 해석합니다.', points: ['권한 문자열 첫 글자는 파일 유형, 뒤 9글자는 소유자·그룹·기타의 rwx다.', '숫자 권한은 r=4, w=2, x=1을 주체별로 합산한다.', '`chmod`는 권한을, `chown`·`chgrp`는 소유 주체를 바꾼다.', '`umask`는 새 파일·디렉터리의 기본 권한에서 제거할 비트를 지정한다.', '`sudo`는 오류를 피하는 만능 명령이 아니라 승인된 관리 작업에만 사용한다.', 'SUID·SGID·Sticky Bit는 존재와 목적만 식별하며 권한 상승 실습으로 확장하지 않는다.'] },
      { id: 'w2-streams', title: '표준 스트림·리다이렉션·파이프', duration: 55, summary: '프로세스의 입력과 두 종류 출력을 분리해 기록합니다.', points: ['stdin은 기본 입력, stdout은 정상 출력, stderr는 오류 출력 스트림이다.', '`>`는 덮어쓰고 `>>`는 이어 쓰며 `2>`는 stderr만 보낸다.', '`2>&1`은 현재 stdout이 향하는 곳으로 stderr도 보낸다.', '`tee`는 입력을 화면과 파일에 동시에 보낸다.', '파이프 `|`는 앞 명령의 stdout을 뒤 명령의 stdin으로 연결한다.', '긴 파이프는 각 단계의 중간 결과를 검증한 뒤 연결한다.'] },
      { id: 'w2-text', title: '검색과 텍스트 처리', duration: 65, summary: '`grep`, `find`, `sort`, `uniq`, `cut`, `tr`, `wc`, `xargs`를 작은 단계로 조합합니다.', points: ['`grep`은 줄을, `find`는 파일 시스템 항목을 조건으로 찾는다.', '`sort | uniq -c`는 같은 값을 모아 빈도를 센다.', '`cut`은 구분자와 필드를 기준으로 열을 고르고 `tr`은 문자를 치환한다.', '`wc -l`은 줄 수를 세며 파이프 결과의 규모를 확인하는 데 유용하다.', '`xargs`는 표준 입력을 명령 인자로 바꾸므로 공백·개행이 있는 이름과 안전성을 주의한다.'] },
      { id: 'w2-binary', title: '파일·인코딩 관찰', duration: 45, summary: '표현 형식과 보안 기능을 구분합니다.', points: ['`strings`는 바이너리 안의 인쇄 가능한 문자열 후보를 보여줄 뿐 파일 의미를 완전히 분석하지 않는다.', '`xxd`·`hexdump`는 바이트를 16진수와 문자로 나란히 보여준다.', 'Base64는 데이터를 문자 집합으로 표현하는 인코딩이며 비밀을 보호하지 않는다.', '암호화는 키를 사용해 기밀성을 제공하고, 해시는 고정 길이 요약으로 무결성 확인 등에 쓴다.', '`tar`는 묶음, `gzip`은 압축이며 서로 역할이 다르다.'] },
      { id: 'w2-curl', title: 'curl과 HTTP 기준선', duration: 25, summary: '정상 HTTP 요청을 먼저 저장하고 한 요소씩 바꾸며 요청·응답 차이를 관찰합니다.', points: ['`curl -i`로 응답 상태선·헤더·본문을 함께 확인한다.', '`curl -v` 출력에서는 연결 정보와 요청·응답 방향을 구분하고 Authorization·Cookie 값은 기록 전에 마스킹한다.', '정상 요청의 URL, Method, Headers, Body, Status를 기준선으로 저장한다.', '변경은 한 번에 한 요소만 적용해 응답 차이의 원인을 설명한다.', '외부 서비스가 아니라 로컬 또는 명시적으로 허가된 교육 대상만 요청한다.'] },
      { id: 'w2-process', title: '프로세스·환경·기본 네트워크 CLI', duration: 30, path: 'extension', summary: '명령이 어디서 어떤 프로세스로 실행되고 어느 주소에 연결되는지 확장 경로에서 확인합니다.', points: ['`ps`, PID, foreground·background, `jobs`, `bg`, `fg`, `kill`의 관계를 읽는다.', '`PATH`는 셸이 실행 파일을 찾는 디렉터리 순서이며 `which`로 선택된 경로를 확인한다.', '`ip addr`는 인터페이스 주소, `ss`는 소켓, `dig`는 DNS 질의 결과를 확인한다.', '`nc`는 허가된 실습에서 연결 확인 수준으로만 사용한다.'] },
      { id: 'w2-git', title: 'Git 기초와 비밀정보 관리', duration: 40, path: 'extension', summary: '작업 트리·스테이징·커밋을 구분하고 변경 근거를 남깁니다.', points: ['`git status`로 상태를 확인하고 `git diff`로 변경 내용을 검토한 뒤 `git add`와 `git commit`을 수행한다.', '커밋은 의미 있는 변경 단위와 이유를 남긴다.', '비밀번호·API 키·세션 토큰은 `.gitignore`만 믿지 말고 처음부터 저장소에 넣지 않는다.', '이미 커밋한 비밀은 파일 삭제만으로 이력에서 사라지지 않으므로 키를 폐기·교체한다.'] },
      { id: 'w2-http-tools', title: 'DevTools와 Burp Suite 심화', duration: 75, path: 'extension', summary: '브라우저 관찰과 프록시 재현의 역할 차이를 확장 경로에서 익힙니다.', points: ['DevTools Network는 브라우저가 실제로 만든 요청·응답과 타이밍을 관찰한다.', 'Application/Storage는 쿠키와 로컬 저장소를, Elements는 실행 후 DOM을 확인한다.', 'Burp Proxy는 범위 안의 HTTP 기록을 남기고 Repeater는 선택한 요청을 반복 비교한다.', 'Intercept를 켠 채 방치하면 브라우저 요청이 멈춘 것처럼 보일 수 있다.', '클라이언트에서 값이 숨겨졌거나 검증됐더라도 서버는 인증·인가·입력 검증을 다시 수행해야 한다.', 'Burp는 로컬 또는 명시적으로 허가된 교육 대상에서만 사용한다.'] },
    ],
    labs: [
      { ...commonLabFields, id: 'w2-permission-lab', week: 2, title: '권한 해석기', kind: 'permission', estimatedMinutes: 30, objective: '`ls -l` 출력을 읽고 가능한 행동과 최소 권한 수정안을 고릅니다.', prerequisites: ['rwx', '파일과 디렉터리 권한'], requiredTools: ['내장 권한 해석기'], safeScope: '예시 권한 문자열만 분석합니다.', successCriteria: ['기호·숫자 권한 변환', '주체별 행동 설명', '과도한 권한 수정'], hints: ['세 글자씩 소유자·그룹·기타로 나누세요.', 'r=4, w=2, x=1을 주체별로 더하세요.', '업무에 필요한 행동만 남기는 권한을 고르세요.'], relatedConceptIds: ['w2-permissions'], nextRecommendations: ['로그 파이프라인'] },
      { ...commonLabFields, id: 'w2-log-lab', week: 2, title: '로그 파이프라인', kind: 'pipeline', estimatedMinutes: 35, objective: '샘플 접근 로그에서 오류 경로의 빈도를 단계별로 요약합니다.', prerequisites: ['grep', 'cut', 'sort', 'uniq', 'wc'], requiredTools: ['내장 파이프라인 시뮬레이터'], safeScope: '정적 샘플 로그만 처리합니다.', successCriteria: ['각 단계 중간 결과 확인', '최종 요약 완성', '명령별 역할 설명'], hints: ['먼저 상태 코드가 있는 줄만 좁히세요.', '필요한 열 하나를 선택한 뒤 정렬하세요.', '같은 값이 붙은 상태에서 `uniq -c`를 적용하세요.'], relatedConceptIds: ['w2-streams', 'w2-text'], nextRecommendations: ['HTTP 요청 관찰'] },
      { ...commonLabFields, id: 'w2-http-lab', week: 2, title: 'HTTP 정상 요청 기준선', kind: 'http-baseline', estimatedMinutes: 40, objective: '고정된 정상 요청에서 URL·Method·Headers·Body·Status를 분리해 기록하고 Week 3 비교의 기준선을 만듭니다.', prerequisites: ['curl과 HTTP 기준선'], requiredTools: ['내장 HTTP 기준선 뷰어', '선택: curl·DevTools'], safeScope: '고정된 로컬 training 메시지만 관찰하며 요청을 외부로 전송하거나 값을 변조하지 않습니다.', successCriteria: ['URL·Method·Headers·Body·Status 구분', '마스킹 대상 표시', '정상 응답 기준선 저장', 'Week 3 비교 항목 작성'], hints: ['첫 줄에서 method와 path를 확인하세요.', '빈 줄 위는 header, 아래는 body입니다.', 'Cookie·Authorization은 값이 아니라 마스킹 필요 여부를 기록하세요.'], relatedConceptIds: ['w2-curl'], nextRecommendations: ['Week 3 Tool Triangle', 'Bandit 6~10', 'Week 3 HTTP 구조'] },
      { ...commonLabFields, id: 'w2-bandit', week: 2, title: 'OverTheWire Bandit 6~10', kind: 'external', estimatedMinutes: 120, objective: '검색·권한·파이프·인코딩 도구를 공식 워게임에서 적용합니다.', prerequisites: ['Week 1 Bandit 0~5', '권한과 텍스트 도구'], requiredTools: ['SSH 클라이언트'], safeScope: 'OverTheWire가 제공한 Bandit 서버와 계정 범위만 사용합니다.', successCriteria: ['6~10 레벨 완료', '명령별 중간 출력 기록', '비밀번호 마스킹'], hints: ['문제의 파일 조건을 이름·소유자·크기·위치로 나누세요.', '후보 파일을 찾는 명령과 내용을 확인하는 명령을 분리하세요.', '표현 형식이 보이면 인코딩인지 압축인지 먼저 판별하세요.'], relatedConceptIds: ['w2-text', 'w2-binary'], nextRecommendations: ['Week 3 웹 구조'] },
    ],
    deliverables: ['Bandit 6~10 풀이', '권한 분석표', '로그 분석 파이프라인', '정상 HTTP 요청·응답 기준선', 'DevTools와 Burp의 역할 차이 300~500자'],
    recordBlueprint: { title: 'Linux Investigation Notebook 02', description: '권한·스트림·텍스트 처리·표현 형식·정상 HTTP 기준선을 한 조사 기록에서 연결합니다.', sections: ['환경·도구·허가 범위', '원본 데이터와 정상 기준선', '명령·파이프 단계별 출력', '권한·인코딩·HTTP 관찰', '해석·한계·다음 주 비교 항목'] },
    reportConnection: '환경, 도구와 버전, 원본·변경 요청, 원본·변경 응답, 관찰 결과와 마스킹 여부를 실습 기록으로 저장합니다.', next: 'Week 3 · 웹 구조와 HTTP',
  },
  3: {
    id: 'week-3', index: 3, title: '웹 통신·상태·브라우저 보안',
    summary: 'URL에서 HTTP 통신, Cookie·Session, XSS와 Session 취약점까지 한 흐름으로 연결합니다.',
    objectives: ['URL의 구성 요소와 Origin을 구분한다.', 'DNS·TCP/TLS·HTTP 요청·응답·렌더링 흐름을 설명한다.', 'Cookie와 서버 Session의 역할을 구분한다.', 'Reflected·Stored·DOM-based XSS의 데이터 흐름을 구분한다.', 'Cookie·Session 취약점과 필요한 방어를 설명한다.'],
    prerequisites: ['Week 1 Linux 기본 명령', '로컬 또는 명시적으로 허가된 웹 학습 범위'], estimatedMinutes: 170, quizMinutes: 15, recordMinutes: 0, disableWeeklyRecord: true,
    modules: [
      { id: 'w3-url-dns', title: 'URL이란?', duration: 25, displayNumber: '00', summary: 'URL의 scheme, host, port, path, query, fragment를 구분합니다.', objectiveIndexes: [0] },
      { id: 'w3-flow', title: '브라우저와 서버는 어떻게 통신하는가', duration: 35, displayNumber: '01', summary: 'DNS·연결·TLS·HTTP 요청과 응답·렌더링 순서를 따라갑니다.', objectiveIndexes: [1] },
      { id: 'w3-session', title: 'Cookie와 Session은 상태를 어떻게 유지하는가', duration: 30, displayNumber: '02', summary: '브라우저 Cookie와 서버 Session이 로그인 상태를 연결하는 방식을 구분합니다.', objectiveIndexes: [2] },
      { id: 'w3-dom', title: 'XSS란?', duration: 35, displayNumber: '03', summary: '외부 값이 브라우저에서 코드로 해석되는 흐름과 세 XSS 유형을 구분합니다.', objectiveIndexes: [3] },
      { id: 'w3-auth-origin', title: 'Cookie와 Session에서는 어떤 취약점이 발생하는가', duration: 30, displayNumber: '04', summary: 'Cookie 변조, CSRF, Session Hijacking·Fixation·Prediction과 인가 누락을 살펴봅니다.', objectiveIndexes: [4] },
    ],
    retiredActivityIds: ['w3-http-message', 'w3-timeline', 'w3-cookie', 'w3-source-sink', 'w3-tool-triangle', 'w3-threat-model'],
    labs: [
      {
        ...commonLabFields,
        id: 'w3-xss-packet-classifier',
        week: 3,
        title: 'Reflected XSS HTTP 패킷 판별',
        kind: 'xss-packet-classifier',
        packetVariant: 'reflected',
        activityType: 'investigation',
        estimatedMinutes: 35,
        objective: '현재 요청의 입력이 같은 HTTP 응답에 반사되는 흐름에서 Source, HTML Sink와 브라우저 해석 지점을 찾습니다.',
        prerequisites: ['w3-flow', 'w3-dom'],
        requiredTools: ['내장 HTTP 패킷 판별기'],
        safeScope: '브라우저에 포함된 고정 로컬 교육 패킷만 분석합니다. 문자열은 실행하지 않으며 Cookie와 인증 값은 모두 마스킹합니다.',
        successCriteria: ['예제에서 Source·Sink·브라우저 해석 지점 확인', '정상 패킷 2개와 악성 패킷 1개 정확히 판별', '요청 문자열이 아니라 응답 출력 문맥을 근거로 판단'],
        hints: ['요청의 query 값이 응답 어디에 들어갔는지 먼저 찾으세요.', '응답에서 꺾쇠가 엔티티로 남는지 실제 요소 문법으로 돌아오는지 비교하세요.', '값이 innerHTML 같은 HTML Sink로 들어가 브라우저가 요소나 이벤트 속성으로 해석하면 악성 흐름입니다.'],
        relatedConceptIds: ['w3-flow', 'w3-dom'],
        nextRecommendations: ['w3-stored-xss-packet-classifier'],
      },
      {
        ...commonLabFields,
        id: 'w3-stored-xss-packet-classifier',
        week: 3,
        title: 'Stored XSS HTTP 패킷 판별',
        kind: 'xss-packet-classifier',
        packetVariant: 'stored',
        activityType: 'investigation',
        estimatedMinutes: 35,
        objective: '입력이 저장 요청을 거쳐 나중의 조회 응답에 출력되는 흐름에서 저장 지점, Sink와 피해자 요청을 구분합니다.',
        prerequisites: ['w3-flow', 'w3-dom'],
        requiredTools: ['내장 HTTP 패킷 판별기'],
        safeScope: '브라우저에 포함된 고정 로컬 교육 패킷만 분석합니다. 문자열은 실행하지 않으며 Cookie와 인증 값은 모두 마스킹합니다.',
        successCriteria: ['저장 요청과 피해자 조회 요청을 분리해 확인', '정상 패킷 2개와 악성 패킷 1개 정확히 판별', '저장 여부와 최종 출력 문맥을 함께 근거로 판단'],
        hints: ['작성 응답만 보지 말고 값이 나중에 어느 화면으로 다시 나오는지 찾으세요.', 'DB에 저장됐다는 사실만으로 XSS가 되지는 않습니다. 최종 응답의 출력 문맥을 확인하세요.', '저장된 값이 HTML Sink에 들어가 요소나 이벤트 속성으로 해석되는 패킷을 찾으세요.'],
        relatedConceptIds: ['w3-flow', 'w3-dom'],
        nextRecommendations: ['w3-dom-xss-packet-classifier'],
      },
      {
        ...commonLabFields,
        id: 'w3-dom-xss-packet-classifier',
        week: 3,
        title: 'DOM-based XSS 흐름 판별',
        kind: 'xss-packet-classifier',
        packetVariant: 'dom',
        activityType: 'investigation',
        estimatedMinutes: 35,
        objective: 'HTTP 응답 원문에 입력이 없어도 브라우저 JavaScript의 Source가 DOM Sink로 이동해 실행 문맥이 만들어지는 흐름을 찾습니다.',
        prerequisites: ['w3-flow', 'w3-dom'],
        requiredTools: ['내장 HTTP·DOM 흐름 판별기'],
        safeScope: '브라우저에 포함된 고정 로컬 교육 패킷과 코드 문자열만 분석합니다. 스크립트는 sandbox 밖에서 실행하지 않습니다.',
        successCriteria: ['HTTP 응답과 실행 후 DOM을 구분', '정상 흐름 2개와 악성 흐름 1개 정확히 판별', '브라우저 Source와 DOM Sink를 근거로 판단'],
        hints: ['URL fragment는 일반 HTTP 요청에 포함되지 않는다는 점부터 확인하세요.', '서버 응답에 입력이 없더라도 브라우저 코드가 location 값을 읽을 수 있습니다.', '외부 값이 textContent가 아니라 innerHTML 같은 해석 Sink로 들어가는 흐름을 찾으세요.'],
        relatedConceptIds: ['w3-flow', 'w3-dom'],
        nextRecommendations: ['w3-auth-origin'],
      },
      { ...commonLabFields, id: 'w3-http-message', week: 3, title: 'HTTP 메시지 해부', kind: 'http-label', estimatedMinutes: 35, objective: '실제 형식의 요청·응답에서 요청선·헤더·본문·상태선을 표시합니다.', prerequisites: ['HTTP 메시지 구조'], requiredTools: ['내장 HTTP 분석기'], safeScope: '정적 교육용 메시지만 분석합니다.', successCriteria: ['요청·응답 요소 8개 이상 식별', '401·403 차이 설명'], hints: ['첫 줄을 먼저 요청선 또는 상태선으로 구분하세요.', '빈 줄 위는 헤더, 아래는 본문입니다.', '방향에 따라 Cookie와 Set-Cookie를 구분하세요.'], relatedConceptIds: ['w3-http', 'w3-headers'], nextRecommendations: ['요청 타임라인'] },
      { ...commonLabFields, id: 'w3-timeline', week: 3, title: '요청 타임라인', kind: 'timeline', estimatedMinutes: 25, objective: 'URL 입력부터 렌더링까지 단계를 순서대로 배치합니다.', prerequisites: ['URL에서 화면까지'], requiredTools: ['브라우저'], safeScope: '단계 카드만 이동합니다.', successCriteria: ['8단계 순서 완성', '공격·방어 지점 연결'], hints: ['도메인을 IP로 바꿔야 연결할 수 있습니다.', 'HTTPS에서는 HTTP보다 TLS가 먼저입니다.', '응답을 받은 뒤 브라우저가 파싱하고 렌더링합니다.'], relatedConceptIds: ['w3-flow'], nextRecommendations: ['Cookie 속성 실험'] },
      { ...commonLabFields, id: 'w3-cookie', week: 3, title: 'Cookie 속성 실험', kind: 'cookie', estimatedMinutes: 35, objective: 'Secure·HttpOnly·SameSite 조합에 따른 브라우저 동작 차이를 비교합니다.', prerequisites: ['Cookie와 Session'], requiredTools: ['내장 쿠키 시뮬레이터'], safeScope: '실제 인증 쿠키가 아닌 `TRAINING_SESSION`만 사용합니다.', successCriteria: ['세 속성 조합 비교', '각 속성이 막지 못하는 영향 설명'], hints: ['전송 조건과 JavaScript 접근 조건을 나눠 보세요.', 'HttpOnly는 네트워크 전송을 끄는 속성이 아닙니다.', 'SameSite는 same-origin이 아닌 site 기준을 사용합니다.'], relatedConceptIds: ['w3-session'], nextRecommendations: ['Source → Sink 추적'] },
      { ...commonLabFields, id: 'w3-source-sink', week: 3, title: 'Source → Sink 추적', kind: 'source-sink', estimatedMinutes: 45, objective: 'JavaScript 예시에서 Source와 Sink를 고르고 안전한 대안으로 바꿉니다.', prerequisites: ['DOM과 JavaScript 데이터 흐름'], requiredTools: ['내장 코드 분석기'], safeScope: '정적 코드 예시만 분석하며 실행하지 않습니다.', successCriteria: ['5개 흐름 분류', '위험한 Sink 수정', '컨텍스트 표시'], hints: ['외부에서 들어오는 값을 먼저 표시하세요.', '그 값이 마지막에 전달되는 DOM API를 찾으세요.', 'HTML이 필요 없다면 텍스트 전용 API를 고르세요.'], relatedConceptIds: ['w3-dom'], nextRecommendations: ['Week 3 XSS'] },
      { ...commonLabFields, id: 'w3-tool-triangle', week: 3, title: 'HTTP Tool Triangle', kind: 'tool-triangle', estimatedMinutes: 45, objective: '같은 고정 training 요청을 curl·DevTools·Burp 관점에서 비교하고, 각 도구가 답하는 질문과 공통 HTTP 필드를 기록합니다.', prerequisites: ['Week 1 HTTP 정상 요청 기준선', 'HTTP 메시지 구조'], requiredTools: ['내장 Tool Triangle 비교기'], safeScope: '고정된 로컬 training 메시지만 비교합니다. 외부 요청·실제 Cookie·값 변조는 수행하지 않습니다.', successCriteria: ['세 도구의 관찰 지점 구분', 'URL·Method·Headers·Body·Status 대조', '마스킹 항목 표시', 'Week 3에 연결할 Source·Sink 질문 작성'], hints: ['세 도구 모두 같은 요청을 보지만 화면과 목적이 다릅니다.', 'Request URL, method, status, response body는 공통 필드입니다.', 'Cookie·Authorization 값은 “보였는가”가 아니라 “마스킹했는가”를 기록하세요.'], relatedConceptIds: ['w3-http', 'w3-headers', 'w3-browser-runtime'], nextRecommendations: ['Week 3 XSS 선수 체크'] },
      { ...commonLabFields, id: 'w3-threat-model', week: 3, title: '로컬 검색 페이지 미니 위협 모델', kind: 'threat-model', path: 'extension', estimatedMinutes: 35, objective: '자산·입력 지점·신뢰 경계·공격 표면·통제를 한 장에 정리합니다.', prerequisites: ['핵심 보안 언어', '웹 요청 흐름'], requiredTools: ['내장 양식'], safeScope: '가상의 로컬 검색 페이지를 대상으로 합니다.', successCriteria: ['다섯 필드 작성', '통제와 공격 표면 연결'], hints: ['먼저 보호할 데이터와 사용자 행동을 적으세요.', '브라우저와 서버 사이를 신뢰 경계로 표시하세요.', '각 입력 지점이 어느 컨텍스트에 출력되는지 확인하세요.'], relatedConceptIds: ['w3-flow', 'w3-dom'], nextRecommendations: ['Week 3 XSS 선수 체크'] },
    ],
    deliverables: ['URL·HTTP·Cookie·Session·XSS 핵심 정리'],
    recordBlueprint: { title: 'Web Request Flow Report', description: '한 정상 training 요청을 URL, HTTP, Cookie·Session, 브라우저 DOM, 도구별 관찰, Week 3 질문까지 연결합니다.', sections: ['URL·Origin·대상과 허가 범위', '정상 요청·응답 기준선', 'Cookie·Session·객체 인가 질문', 'curl·DevTools·Burp 비교', 'Source·Transform·Sink·Context와 Week 3 handoff'] },
    reportConnection: '자산, Endpoint, Method, Parameter, 인증, Source, Sink, 컨텍스트, 기대·실제 동작, 요청·응답 증거 필드를 연습합니다.', next: 'Week 4 · Cross-Site Scripting',
  },
  4: {
    id: 'week-4', index: 4, title: 'Cross-Site Scripting(XSS)·CVE 사례와 방어',
    summary: 'XSS를 페이로드 모음이 아니라 실제 CVE의 원인·조건·패치와 브라우저 데이터 흐름으로 분석합니다.',
    objectives: ['Reflected·Stored·DOM XSS를 실제 CVE와 데이터 흐름으로 구분한다.', 'Source·Transform·Sink·Context·실행 위치를 추적한다.', '공식 패치와 root defense를 구분하고 안전한 로컬 sandbox로만 확인한다.', '검증되지 않은 우회 관계는 미채택으로 기록하고 재시험 범위를 정한다.'],
    prerequisites: ['Week 2 HTTP·Cookie·DOM', 'HTML 요소·속성·JavaScript 문자열 기초', '안전한 실습 범위'], estimatedMinutes: 480, quizMinutes: 15, recordMinutes: 25,
    contextCoverage: [
      { id: 'html-body', title: 'HTML body', required: true, moduleIds: ['w4-context'], labIds: ['w4-reflected'] },
      { id: 'html-attribute', title: 'HTML attribute', required: true, moduleIds: ['w4-context'], labIds: ['w4-stored'] },
      { id: 'url-scheme', title: 'URL과 허용 scheme', required: true, moduleIds: ['w4-context', 'w4-defense'], labIds: ['w4-dom'] },
      { id: 'javascript-data', title: 'JavaScript string 또는 안전한 데이터 전달', required: true, moduleIds: ['w4-context', 'w4-defense'], labIds: ['w4-stored'] },
      { id: 'dom-flow', title: 'DOM-based flow', required: true, moduleIds: ['w4-types', 'w4-taint'], labIds: ['w4-dom'] },
      { id: 'root-defense', title: '근본 방어와 보완 통제 비교', required: true, moduleIds: ['w4-defense', 'w4-validation'], labIds: ['w4-reflected', 'w4-dom'] },
    ],
    modules: [
      { id: 'w4-nature', title: 'XSS의 본질', duration: 40, summary: '신뢰할 수 없는 데이터가 피해자 브라우저에서 코드로 해석되는 취약점입니다.', paragraphs: ['서버가 입력을 응답에 넣는 과정에서 원인이 생길 수 있지만 최종 실행 지점은 브라우저입니다. 실행 코드는 해당 페이지의 Origin과 로그인한 사용자의 세션 맥락에서 동작할 수 있습니다.', '교육용 검증은 `alert(1)`이나 고정 문자열 표시처럼 무해한 동작으로 제한합니다. 외부 전송, 쿠키 탈취, 키로깅, 피싱 UI는 구현하거나 제출하지 않습니다.'], points: ['문자열 반사와 코드 실행은 서로 다른 주장이다.', '취약점 존재와 실제 영향 확인을 보고서에서 분리한다.', 'SOP를 없애는 것이 아니라 취약한 페이지와 같은 Origin 권한으로 스크립트가 실행되는 효과가 생긴다.'] },
      { id: 'w4-types', title: 'Reflected·Stored·DOM-based XSS', duration: 55, summary: '입력의 수명과 실행 경로를 기준으로 세 유형을 구분합니다.', points: ['Reflected: 현재 요청 입력이 즉시 응답에 포함되며 악성 링크·폼 등 사용자 상호작용이 필요한 경우가 많다.', 'Stored: 입력이 DB·파일 등에 저장됐다가 다른 사용자의 페이지에 반복 출력된다.', 'DOM-based: 취약한 Source와 Sink가 주로 브라우저 JavaScript 안에 있고 서버 응답 원문에는 입력이 없을 수 있다.', 'Stored와 Reflected는 저장 여부만 보지 말고 어떤 응답과 사용자에게 전달되는지 기록한다.', 'DOM-based 여부는 실행 후 DOM과 클라이언트 코드를 함께 확인한다.'] },
      { id: 'w4-taint', title: 'Source·Transform·Sink·Taint Flow', duration: 70, summary: '외부 데이터를 실행 가능한 문맥까지 따라갑니다.', points: ['Source: query·path·form·header·DB record·fragment·localStorage·API response', 'Transform: validation·decoding·template rendering·string concatenation·DOM update', '위험 Sink: unescaped template, innerHTML, outerHTML, document.write, insertAdjacentHTML, eval, 문자열 타이머, 이벤트 속성', '안전한 Sink: textContent, createTextNode, 안전한 속성의 setAttribute, 프레임워크 기본 escaping', '중간에 검증이 있어도 최종 컨텍스트와 디코딩 순서가 맞지 않으면 데이터는 여전히 오염된 상태일 수 있다.'] },
      { id: 'w4-context', title: '브라우저 컨텍스트', duration: 55, summary: '데이터가 놓인 문법에 따라 필요한 방어가 달라집니다.', points: ['HTML body에서는 텍스트가 태그로 해석되지 않도록 HTML 인코딩한다.', 'Attribute에서는 따옴표로 값을 감싸고 속성 컨텍스트에 맞게 인코딩한다.', 'JavaScript 문자열에 직접 데이터를 삽입하지 말고 JSON 직렬화와 안전한 데이터 전달 방식을 사용한다.', 'URL에는 허용할 scheme과 목적지를 검증하고 URL 구성 요소별 인코딩을 적용한다.', 'CSS와 HTML comment처럼 안전하게 다루기 어려운 위치에는 신뢰할 수 없는 데이터를 넣지 않는다.', '공통 문자열 필터 하나로 모든 파서와 컨텍스트를 방어할 수 없다.'] },
      { id: 'w4-validation', title: '안전한 검증 절차', duration: 45, summary: '고유 마커에서 시작해 최소한의 실행 증거만 확인합니다.', steps: ['입력 지점 식별', '고유한 무해한 마커 삽입', '응답 또는 DOM에서 마커 위치 확인', '브라우저 컨텍스트 판별', '로컬·허가 환경에서 무해한 PoC', '실행 지점과 원인 기록', '최소 영향만 확인', '토큰·개인정보 마스킹', '수정 후 같은 절차로 재시험'] },
      { id: 'w4-impact', title: '영향과 심각도', duration: 40, summary: '실행 여부만으로 심각도를 과장하지 않고 사용자 역할과 통제를 함께 봅니다.', points: ['피해자 권한의 요청 수행, 계정 동작 대행, 화면 변조, 민감정보 노출, 피싱·신뢰 악용 가능성을 검토한다.', '관리자나 운영자처럼 권한이 큰 사용자가 노출되면 영향이 확대될 수 있다.', 'HttpOnly가 쿠키 읽기를 줄여도 DOM 데이터 접근과 사용자 행동 대행은 남을 수 있다.', '실제 위험은 노출 대상, 인증 전제, 사용자 상호작용, CSP, 쿠키 속성, 기능 권한을 근거로 평가한다.', 'CVSS 점수와 조직의 비즈니스 영향은 별도 근거로 작성한다.'] },
      { id: 'w4-defense', title: '방어와 재시험', duration: 65, summary: '데이터를 코드와 분리하고 필요한 경우에만 검증된 Sanitizer를 사용합니다.', points: ['컨텍스트별 출력 인코딩과 프레임워크 기본 escaping을 유지한다.', '사용자 HTML이 필요 없으면 textContent 등 안전한 Sink를 사용한다.', '정말 HTML 입력이 필요할 때만 DOMPurify 같은 검증된 Sanitizer를 정책에 맞게 사용한다.', '사용자 데이터를 inline JavaScript에 삽입하지 않고 URL scheme은 allowlist로 제한한다.', 'CSP와 Secure·HttpOnly·SameSite Cookie는 defense-in-depth와 영향 완화 수단이다.', 'WAF는 임시 완화나 탐지에 도움을 줄 수 있지만 취약 코드 수정이 아니다.', '같은 입력·컨텍스트·사용자 역할로 재시험하고 인접 기능 회귀도 확인한다.'] },
    ],
    labs: [
      { ...commonLabFields, id: 'w4-report-evidence', week: 4, title: 'XSS Finding 증거 분류', kind: 'report-evidence', estimatedMinutes: 35, objective: '합성 XSS Finding의 사실·영향·조건·원인·수정·재시험 문장을 분리해 보고서의 근거 구조를 만듭니다.', prerequisites: ['XSS의 본질', '관찰과 추론 구분'], requiredTools: ['내장 보고서 문장 분류기'], safeScope: '실제 서비스·자격 증명·공격 코드는 사용하지 않는 고정 합성 Finding만 다룹니다.', successCriteria: ['여섯 문장을 올바른 보고서 항목으로 분류', '관찰과 영향의 차이를 60자 이상 설명', '근본 원인과 재시험을 분리'], hints: ['직접 보인 변화와 그 영향 해석을 먼저 나누세요.', '원인은 코드·데이터 경로로 적고, 수정은 그 경로를 바꾸는 행동입니다.', '재시험은 같은 결함 경로가 사라졌는지와 정상 기능이 남았는지를 함께 봅니다.'], relatedConceptIds: ['w4-impact', 'w4-validation'], nextRecommendations: ['Reflected XSS 관찰', 'XSS Finding 초안'], scenario: week4ReportEvidenceScenario },
      { ...commonLabFields, id: 'w4-reflected', week: 4, title: 'Reflected XSS · 검색어 반사', kind: 'xss-reflected', contextIds: ['html-body'], estimatedMinutes: 45, objective: 'query `q`가 HTML body에 반사되는 위치와 실행 맥락을 추적합니다.', prerequisites: ['HTTP query', 'HTML body context'], requiredTools: ['내장 격리 시뮬레이터'], safeScope: '고정된 무해한 PoC만 사용하며 외부 요청과 데이터 전송은 차단합니다.', successCriteria: ['고유 마커 반사 확인', 'Source·Sink·Context 표시', '취약·수정 코드 비교', '실습 기록 저장'], hints: ['먼저 실행 문자열이 아닌 고유 마커로 반사 위치를 찾으세요.', '응답에서 마커 주변의 HTML 문법을 확인하세요.', '템플릿의 escaping 설정과 최종 DOM을 비교하세요.'], relatedConceptIds: ['w4-types', 'w4-taint', 'w4-context'], nextRecommendations: ['Stored XSS', 'Finding 초안'] },
      { ...commonLabFields, id: 'w4-stored', week: 4, title: 'Stored XSS · 게시글', kind: 'xss-stored', contextIds: ['html-attribute', 'javascript-data'], estimatedMinutes: 55, objective: '작성 → 저장 → 재조회 → 다른 사용자 렌더링의 시간 차이를 설명합니다.', prerequisites: ['Stored XSS', '저장과 렌더링'], requiredTools: ['내장 격리 게시판'], safeScope: '브라우저의 training 전용 데이터만 사용하며 실제 계정·서버와 분리됩니다.', successCriteria: ['입력·저장·조회·실행 흐름 표시', '작성 시점과 실행 시점 구분', 'auto-escape 재시험'], hints: ['작성 직후가 아니라 목록을 보는 사용자를 기준으로 보세요.', 'DB 값 자체보다 템플릿 출력 방식을 확인하세요.', '제목과 본문이 서로 다른 컨텍스트인지 비교하세요.'], relatedConceptIds: ['w4-types', 'w4-taint', 'w4-context'], nextRecommendations: ['DOM-based XSS'] },
      { ...commonLabFields, id: 'w4-dom', week: 4, title: 'DOM-based XSS · fragment와 innerHTML', kind: 'xss-dom', contextIds: ['url-scheme', 'dom-flow'], estimatedMinutes: 45, objective: 'location.hash에서 innerHTML로 이어지는 클라이언트 데이터 흐름을 찾습니다.', prerequisites: ['URL fragment', 'DOM Source·Sink'], requiredTools: ['내장 DOM 비교기'], safeScope: '고정된 fragment와 격리된 미리보기만 사용합니다.', successCriteria: ['서버 원문·실행 후 DOM 비교', 'Source·Sink 코드 줄 표시', 'textContent 수정 재시험'], hints: ['fragment가 HTTP 요청에 포함되는지 먼저 확인하세요.', '서버 응답 원문과 DevTools Elements의 DOM을 비교하세요.', 'HTML이 필요한지 묻고 필요 없다면 textContent를 사용하세요.'], relatedConceptIds: ['w4-types', 'w4-taint', 'w4-context'], nextRecommendations: ['필터링 원리'] },
      { ...commonLabFields, id: 'w4-filtering', week: 4, title: '잘못된 필터링 원리', kind: 'xss-filtering', contextIds: ['sanitizer-comparison', 'csp-vs-root-cause'], estimatedMinutes: 40, objective: '문자열 블랙리스트와 클라이언트 전용 검증이 구조적으로 실패하는 이유를 설명합니다.', prerequisites: ['브라우저 컨텍스트', '서버·클라이언트 신뢰 경계'], requiredTools: ['내장 필터 비교기'], safeScope: '우회 페이로드 목록을 제공하지 않고 고정된 교육 예시만 비교합니다.', successCriteria: ['두 필터의 검사 위치 표시', '근본 원인 작성', '올바른 방어 선택'], hints: ['검사가 어느 파서보다 먼저 일어나는지 보세요.', '클라이언트 코드는 사용자가 바꿀 수 있습니다.', '차단 문자열을 늘리는 대신 데이터를 코드와 분리하세요.'], relatedConceptIds: ['w4-defense'], nextRecommendations: ['XSS Finding 완성', '외부 공식 Lab'] },
      { ...commonLabFields, id: 'w4-official-xss', week: 4, title: '공식 XSS Lab 연결', kind: 'external', estimatedMinutes: 120, objective: '내부 실습에서 익힌 Source·Sink·Context 추적표를 공식 교육 플랫폼의 XSS Lab에 적용합니다.', prerequisites: ['내부 XSS Lab 3개 이상', '안전한 검증 절차'], requiredTools: ['PortSwigger Web Security Academy 또는 Dreamhack 계정', '브라우저'], safeScope: '각 교육 플랫폼이 제공한 Lab 인스턴스와 계정 범위에서만 수행합니다.', successCriteria: ['공식 Lab 최소 2개 완료', 'Lab별 Source·Sink·Context 제출', '자격 증명·Cookie 마스킹'], hints: ['유형 이름보다 입력이 어디에서 들어오는지 먼저 표시하세요.', '응답 원문과 실행 후 DOM 중 어느 쪽에 값이 있는지 비교하세요.', '플랫폼의 성공 표시와 별도로 취약 원인·수정 방향을 한 문장씩 적으세요.'], relatedConceptIds: ['w4-types', 'w4-taint', 'w4-context', 'w4-defense'], nextRecommendations: ['XSS Finding 완성', 'Week 4 SQL Injection'], provider: 'PortSwigger · Dreamhack', externalLinks: [{ label: 'PortSwigger XSS Academy', url: 'https://portswigger.net/web-security/cross-site-scripting' }, { label: 'Dreamhack XSS 강의·Lab', url: 'https://dreamhack.io/lecture/units/webhacking-xss' }] },
    ],
    retiredActivityIds: ['w4-report-evidence', 'w4-filtering'],
    retiredActivities: [
      { id: 'w4-report-evidence', kind: 'report-evidence', reason: 'CVE-first Week 03 학습 흐름에서는 제외합니다. 기존 localStorage 기록은 삭제하거나 변환하지 않습니다.' },
      { id: 'w4-filtering', kind: 'xss-filtering', reason: 'CVE-first Week 03 학습 흐름에서는 제외합니다. 기존 localStorage 기록은 삭제하거나 변환하지 않습니다.' },
    ],
    deliverables: ['안전한 로컬 reflected·stored·DOM 활동 기록', '세 CVE의 원인·조건·공식 패치 메모', 'Source·Sink·Context 추적표', '2차 재시험 체크 결과'],
    reportConnection: 'CVE, 공식 근거 URL, source, sink, context, 패치, 정상 기능 재시험, 미채택 사유를 하나의 학습 기록으로 연결합니다.', next: 'Week 4 · SQL Injection',
  },
}

function mergeLinuxWeeks(weekOne, weekTwo) {
  const moduleById = (id) => [...weekOne.modules, ...weekTwo.modules].find((module) => module.id === id)
  const labById = (id) => [...weekOne.labs, ...weekTwo.labs].find((lab) => lab.id === id)

  return {
    ...weekOne,
    title: 'Linux',
    summary: '웹 서비스가 동작하는 운영체제 환경을 이해하고, 위치·경로·검색·파일 변경·입출력 흐름을 확인하는 최소 Linux 명령을 익힙니다.',
    objectives: [
      '웹 해킹 전에 운영체제와 Linux CLI를 알아야 하는 이유를 설명한다.',
      '운영체제·터미널·셸·커널의 역할을 구분한다.',
      '절대 경로와 상대 경로를 구분하고 pwd·ls·cd로 위치를 확인한다.',
      'find와 grep으로 경로 검색과 텍스트 검색을 구분한다.',
      'mkdir와 rm의 영향을 이해하고 삭제 전 대상을 확인한다.',
      'stdin·stdout·stderr, 리다이렉션과 파이프를 구분한다.',
    ],
    prerequisites: weekOne.prerequisites,
    quizMinutes: 15,
    recordMinutes: 20,
    modules: [
      {
        id: 'w1-why-linux',
        title: '왜 운영체제와 Linux CLI를 배우는가',
        duration: 15,
        summary: '웹 요청 뒤에서 서버 프로세스와 운영체제가 어떤 역할을 하는지 먼저 확인합니다.',
      },
      {
        ...moduleById('w1-shell'),
        title: '운영체제·터미널·셸·커널',
        duration: 35,
        summary: '터미널과 셸을 구분하고 커널이 프로세스·메모리·파일·네트워크 접근을 관리하는 방식을 살펴봅니다.',
      },
      {
        ...moduleById('w1-filesystem'),
        title: '절대 경로와 상대 경로',
        duration: 25,
        summary: '루트와 현재 작업 디렉터리를 기준으로 두 경로 표기를 구분합니다.',
      },
      {
        ...moduleById('w1-navigation'),
        title: 'pwd·ls·cd·find·grep',
        duration: 45,
        summary: '현재 위치, 목록, 이동, 경로 검색, 텍스트 검색에 필요한 다섯 명령만 익힙니다.',
      },
      {
        ...moduleById('w1-fileops'),
        title: 'mkdir·rm',
        duration: 25,
        summary: '디렉터리를 만들고 파일을 삭제할 때 대상 범위를 확인합니다.',
      },
      {
        id: 'w1-streams',
        title: '표준 스트림·리다이렉션·파이프',
        duration: 35,
        summary: 'stdin·stdout·stderr를 구분하고 출력의 목적지를 파일이나 다음 명령으로 연결합니다.',
      },
    ].filter(Boolean).map((module, index) => ({ ...module, displayNumber: String(index).padStart(2, '0') })),
    labs: [labById('w1-path')].filter(Boolean),
    deliverables: ['절대·상대 경로 구분 기록', 'Linux 최소 명령과 스트림 요약'],
    recordBlueprint: {
      title: 'Linux 최소 명령 기록',
      description: '위치·경로·검색·파일 변경·입출력 흐름을 짧게 정리합니다.',
      sections: ['현재 위치와 경로', '사용한 명령과 목적', 'stdout·stderr와 연결 방식'],
    },
    reportConnection: '명령, 현재 위치, 대상 경로와 출력 흐름을 구분해 기록합니다.',
  }
}

function applyFuzzingWeb3Design(week, index) {
  if (index !== 7) return week

  return {
    ...week,
    title: 'Fuzzing·Web3·블록체인 보안',
    summary: '로컬 Fuzzing과 Crash Triage를 스마트 컨트랙트의 상태·호출 순서·Invariant 검증으로 확장합니다.',
    prerequisites: ['W03 리버싱 입문', 'W04 PWN 입문', '로컬·합성 대상만 사용하는 안전 범위'],
    objectives: [
      ...(week.objectives || []),
      'Web3 애플리케이션의 지갑·RPC·스마트 컨트랙트·체인 상태 경계를 구분한다.',
      '로컬 합성 스마트 컨트랙트에서 Stateful Invariant Fuzzing 흐름을 설명한다.',
    ],
    keyConcepts: ['Fuzzing', 'Web3·블록체인', 'Smart Contract Invariant'],
    modules: [...(week.modules || []), ...web3FuzzingModules],
    labs: [...(week.labs || []), { ...web3FuzzingLab, week: index }],
    deliverables: [...(week.deliverables || []), 'Web3 신뢰 경계와 스마트 컨트랙트 Invariant 표'],
  }
}

function applySupplyChainCloudDesign(week, index) {
  if (index !== 8) return week

  return {
    ...week,
    title: '공급망·Cloud/IAM 보안',
    summary: 'Source와 Dependency에서 Build·Artifact·배포까지의 공급망을 추적하고, Cloud 공유 책임과 IAM 최소 권한으로 운영 경계를 확장합니다.',
    prerequisites: ['W05 증거 보존과 관제 판단', 'W07 Fuzzing의 Artifact·재시험 개념', '실제 CI·Registry·Cloud 계정을 사용하지 않는 안전 범위'],
    objectives: [
      'Source·Dependency·Build·Artifact·배포로 이어지는 소프트웨어 공급망과 신뢰 경계를 설명한다.',
      'SBOM·Hash·전자서명·Provenance의 역할과 한계를 구분한다.',
      'CI/CD Runner·Secret·Registry·Release 권한을 최소 권한과 검증 흐름으로 설계한다.',
      ...(week.objectives || []),
    ],
    keyConcepts: ['Software Supply Chain', 'SBOM·Provenance', 'Cloud·IAM'],
    modules: [...supplyChainModules, ...(week.modules || [])],
    labs: [{ ...supplyChainLab, week: index }, ...(week.labs || [])],
    sessions: [
      {
        id: 'w8-supply-chain-security',
        title: '소프트웨어 공급망과 안전한 Release',
        description: '의존성·Build·Artifact·배포 경계를 따라가며 SBOM·서명·Provenance와 CI/CD 권한을 연결합니다.',
        outcome: '승인된 Source에서 실제 배포 Digest까지 필요한 증거와 통제를 설명할 수 있다.',
        moduleIds: ['w8-supply-chain-flow', 'w8-sbom-provenance', 'w8-cicd-controls'],
      },
      {
        id: 'w8-cloud-iam-security',
        title: 'Cloud 공유 책임과 IAM 최소 권한',
        description: '공급자와 고객의 책임을 나누고 IAM 정책·관리 연결·격리된 교육 환경의 권한 경계를 검토합니다.',
        outcome: 'Cloud 자산의 책임 주체와 필요한 최소 권한·승인·재시험 조건을 작성할 수 있다.',
        moduleIds: ['w15-shared-responsibility', 'w15-azure-cluster-connect', 'w15-msrc-remediation', 'w15-iam-least-privilege', 'w15-isolated-cloudgoat'],
      },
    ],
    deliverables: ['공급망 신뢰 경계와 Artifact Provenance 판별 기록', ...(week.deliverables || [])],
    recordBlueprint: {
      title: 'Supply Chain·Cloud IAM Security Note',
      description: 'Source부터 배포 Artifact까지의 근거와 Cloud 권한 경계를 한 기록으로 연결합니다.',
      sections: ['Source·Dependency·Build 경계', 'SBOM·Signer·Provenance·Artifact Digest', 'CI/CD·Registry 권한과 Release 승인', 'Cloud 공유 책임과 IAM 최소 권한', '중단·보존·재검증과 정상 회귀'],
    },
    reportConnection: '공급망·Cloud Finding에는 Source·Builder·Artifact·배포 Inventory, 변경 권한, 고객 책임과 최소 권한 통제를 추적 가능한 근거로 연결합니다.',
  }
}

function reindexWeek(week, index) {
  const reindexed = applySystemIntroWeekDesign({
    ...week,
    id: `week-${index}`,
    index,
    displayWeek: index,
    curriculumId: week.curriculumId || week.id,
    legacyPrefix: week.legacyPrefix || `w${week.index}`,
    route: `/learn/week/${index}`,
    labs: (week.labs || []).map((lab) => ({ ...lab, week: index })),
  }, index)

  const designed = applySupplyChainCloudDesign(applyFuzzingWeb3Design(reindexed, index), index)
  return index === 10 ? {
    ...designed,
    prerequisites: ['W00 자산·위협·통제와 허가 범위', 'W07 Fuzzing의 검증·재시험', 'W08 공급망·IAM 최소 권한과 승인 경계'],
  } : designed
}

const mergedWeekOne = mergeLinuxWeeks(baseWeekContent[1], baseWeekContent[2])
function mergeSystemWeeks(weeks, id) {
  const [first] = weeks
  return {
    ...first,
    id,
    curriculumId: id,
    disableArchitecture: true,
    prerequisites: [...new Set(weeks.flatMap((week) => week.prerequisites || []))],
    modules: weeks.flatMap((week) => week.modules || []),
    labs: weeks.flatMap((week) => week.labs || []),
    deliverables: [...new Set(weeks.flatMap((week) => week.deliverables || []))],
    recordBlueprint: {
      title: id === 'reversing-intro' ? '리버싱 관찰 노트' : 'PWN 분석 노트',
      description: '두 세션에서 확인한 실행 흐름, 관찰 근거와 재시험 조건을 하나의 문서로 연결합니다.',
      sections: ['관찰 대상과 허가 범위', '실행 흐름과 상태 변화', '근거·해석·확인하지 못한 범위', '정상·경계 재시험'],
    },
    reportConnection: id === 'reversing-intro'
      ? '바이너리 식별 정보, 함수 흐름, 레지스터·메모리 관찰과 바이트 입출력을 재현 가능한 순서로 연결합니다.'
      : '메모리 경계의 최초 실패 지점, 보호 기법, 크래시 근거, 수정과 정상·경계 재시험을 분리해 기록합니다.',
  }
}

const reversingIntroWeek = mergeSystemWeeks([baseLaterWeekContent[7], baseLaterWeekContent[8], baseLaterWeekContent[9]], 'reversing-intro')
const pwnIntroWeek = mergeSystemWeeks([baseLaterWeekContent[10], baseLaterWeekContent[11]], 'pwn-intro')
const curriculumDefinitions = [
  weekZeroDefinition,
  reindexWeek(mergedWeekOne, 1),
  reindexWeek(baseWeekContent[3], 2),
  reindexWeek(reversingIntroWeek, 3),
  reindexWeek(pwnIntroWeek, 4),
  ...Object.values(baseLaterWeekContent)
    .filter((week) => week.index >= 12 && week.index <= 15)
    .map((week) => reindexWeek(week, week.index - 7)),
  reindexWeek(otSecurityWeek, 9),
  reindexWeek(baseLaterWeekContent[16], 10),
].sort((left, right) => left.index - right.index)

const definitionsWithNext = curriculumDefinitions.map((week, index, weeks) => ({
  ...week,
  next: weeks[index + 1] ? `Week ${weeks[index + 1].index} · ${weeks[index + 1].title}` : '과정 마무리 · 학습 기록과 복습',
}))

export const weekContent = Object.fromEntries(definitionsWithNext.map((week) => [week.index, normalizeWeek(week)]))

export const roadmap = Object.values(weekContent).map((week) => ({
  id: week.id,
  index: week.index,
  title: week.title,
  summary: week.summary,
  deliverable: week.deliverables?.[0] || week.recordBlueprint?.title || `${week.title} 학습 기록`,
  requiredMinutes: week.requiredMinutes,
  extensionMinutes: week.extensionMinutes,
  estimatedMinutes: week.estimatedMinutes,
  status: week.index === 1 ? 'current' : 'available',
  keyConcepts: week.keyConcepts || week.objectives?.slice(0, 3) || [],
}))

const baseQuizzes = {
  0: weekZeroQuizQuestions,
  1: [
    { id: 'w1q1', conceptIds: ['w1-filesystem'], difficulty: 'foundation', remediationModuleIds: ['w1-filesystem'], question: '`/home/student/notes`는 어떤 경로인가?', options: ['상대 경로', '절대 경로', '환경 변수'], answer: 1, explanation: '`/`에서 시작하므로 절대 경로입니다.' },
    { id: 'w1q2', conceptIds: ['w1-navigation'], difficulty: 'foundation', remediationModuleIds: ['w1-navigation'], question: '확장자와 실제 파일 형식이 다를 때 우선 확인할 명령은?', options: ['file', 'echo', 'cd'], answer: 0, explanation: '`file`은 내용의 특징과 매직 값을 바탕으로 형식을 판별합니다.' },
    { id: 'w1q3', conceptIds: ['w1-ssh'], difficulty: 'foundation', remediationModuleIds: ['w1-ssh'], question: 'SSH 최초 접속에서 호스트 키를 확인하는 목적은?', options: ['인터넷 속도 측정', '연결한 서버의 신원 확인', '사용자 파일 권한 변경'], answer: 1, explanation: '호스트 키는 서버 신원 확인에 사용됩니다.' },
    { id: 'w1q4', conceptIds: ['w1-navigation'], difficulty: 'application', remediationModuleIds: ['w1-navigation'], question: '파일 경로를 조건으로 찾은 뒤 그 파일 안의 ERROR 줄을 찾는 순서는?', options: ['grep 후 find', 'find 후 grep', 'cd 후 rm'], answer: 1, explanation: '`find`로 후보 파일을 찾고 `grep`으로 파일 안의 줄을 검색합니다.' },
    { id: 'w1q5', conceptIds: ['w1-shell', 'w1-navigation'], difficulty: 'application', remediationModuleIds: ['w1-shell', 'w1-navigation'], question: '명령이 “No such file or directory”로 실패했을 때 먼저 확인할 조합은?', options: ['현재 위치와 대상 경로', 'CPU 온도와 네트워크 속도', 'SSH 비밀번호 변경'], answer: 0, explanation: '`pwd`와 대상 경로·존재 여부를 먼저 확인해야 오류 원인을 좁힐 수 있습니다.' },
    { id: 'w1q6', conceptIds: ['w1-permission'], difficulty: 'application', remediationModuleIds: ['w1-permission'], question: '디렉터리 이름을 알지만 하위 파일 경로를 탐색할 수 없다. 우선 확인할 권한은?', options: ['디렉터리 실행(x)', '파일 쓰기(w)', '파일 확장자'], answer: 0, explanation: '디렉터리의 x 권한은 해당 경로를 통과하고 탐색하는 데 필요합니다.' },
  ],
  2: [
    { id: 'w2q1', conceptIds: ['w1-permission'], difficulty: 'foundation', remediationModuleIds: ['w1-permission'], question: '`640` 권한에서 그룹이 할 수 있는 일은?', options: ['읽기만', '읽기와 쓰기', '실행만'], answer: 0, explanation: '가운데 숫자 4는 그룹의 읽기 권한입니다.' },
    { id: 'w2q2', conceptIds: ['w1-streams'], difficulty: 'foundation', remediationModuleIds: ['w1-streams'], question: '`2>`가 보내는 스트림은?', options: ['stdin', 'stdout', 'stderr'], answer: 2, explanation: '파일 설명자 2는 표준 오류입니다.' },
    { id: 'w2q3', conceptIds: ['w1-navigation'], difficulty: 'foundation', remediationModuleIds: ['w1-navigation'], question: 'Base64에 대한 올바른 설명은?', options: ['비밀키 암호화', '복호화 불가능한 해시', '문자 기반 표현을 위한 인코딩'], answer: 2, explanation: 'Base64는 비밀성을 제공하지 않는 인코딩입니다.' },
    { id: 'w2q4', conceptIds: ['w2-curl'], difficulty: 'application', remediationModuleIds: ['w2-curl'], question: '요청 값을 바꾸기 전 가장 먼저 할 일은?', options: ['정상 요청 기준선 저장', '모든 파라미터 동시 변경', '외부 사이트 스캔'], answer: 0, explanation: '원본 기준선이 있어야 변경의 영향을 비교할 수 있습니다.' },
    { id: 'w2q5', conceptIds: ['w1-navigation'], difficulty: 'application', remediationModuleIds: ['w1-navigation'], question: '같은 경로별 발생 횟수를 세기 전에 필요한 순서는?', options: ['uniq 후 sort', 'sort 후 uniq -c', 'cut 후 chmod'], answer: 1, explanation: '같은 값을 붙여 놓도록 정렬한 뒤 `uniq -c`로 빈도를 셉니다.' },
    { id: 'w2q6', conceptIds: ['w2-streams', 'w2-curl'], difficulty: 'analysis', remediationModuleIds: ['w2-streams', 'w2-curl'], question: '`curl -i` 결과와 오류를 서로 다른 파일에 남기려면 구분해야 하는 것은?', options: ['stdout과 stderr', 'stdin과 PATH', 'Base64와 gzip'], answer: 0, explanation: '정상 출력과 진단 오류가 각각 stdout과 stderr 중 어디로 가는지 확인해야 합니다.' },
  ],
  3: [
    { id: 'w3q1', conceptIds: ['w3-url-dns'], difficulty: 'foundation', remediationModuleIds: ['w3-url-dns'], question: 'URL fragment에 대한 설명으로 맞는 것은?', options: ['항상 HTTP 요청 헤더에 포함된다', '기본적으로 서버 요청에 포함되지 않는다', 'DNS 서버에만 전달된다'], answer: 1, explanation: 'fragment는 보통 브라우저 내부에서 처리됩니다.' },
    { id: 'w3q2', conceptIds: ['w3-flow'], difficulty: 'foundation', remediationModuleIds: ['w3-flow'], question: 'HTTP Response에서 Body의 형식을 설명하는 Header는?', options: ['Host', 'Content-Type', 'Cookie'], answer: 1, explanation: 'Content-Type은 응답 Body의 media type을 설명합니다.' },
    { id: 'w3q3', conceptIds: ['w3-session'], difficulty: 'foundation', remediationModuleIds: ['w3-session'], question: '일반적인 서버 측 Session 방식에서 Cookie에 담기 가장 적절한 값은?', options: ['전체 개인정보', '예측하기 어려운 Session ID', '데이터베이스 비밀번호'], answer: 1, explanation: 'Cookie에는 최소한의 Session 식별자를 두고 실제 상태는 서버에서 관리합니다.' },
    { id: 'w3q4', conceptIds: ['w3-dom'], difficulty: 'application', remediationModuleIds: ['w3-dom'], question: 'HttpOnly가 설정된 페이지에서 XSS가 발견됐을 때 맞는 설명은?', options: ['XSS가 완전히 해결됐다', 'Cookie 직접 읽기는 제한되지만 XSS 실행 가능성은 남는다', 'Session 때문에 스크립트가 실행되지 않는다'], answer: 1, explanation: 'HttpOnly는 JavaScript의 Cookie 읽기를 제한하지만 XSS 원인을 제거하지 않습니다.' },
    { id: 'w3q5', conceptIds: ['w3-auth-origin'], difficulty: 'application', remediationModuleIds: ['w3-auth-origin'], question: '로그인 전과 로그인 후에 같은 Session ID를 유지해 발생할 수 있는 공격은?', options: ['Session Fixation', 'DNS Spoofing', 'Content Sniffing'], answer: 0, explanation: '로그인 성공 후에는 새 Session ID를 발급하고 이전 ID를 폐기해야 합니다.' },
  ],
  4: [
    { id: 'w4q1', conceptIds: ['w4-types', 'w4-taint'], difficulty: 'application', remediationModuleIds: ['w4-types', 'w4-taint'], question: '서버 응답 원문에 입력이 없지만 실행 후 DOM에서 코드가 만들어졌다. 우선 의심할 유형은?', options: ['Stored XSS', 'DOM-based XSS', 'SQL Injection'], answer: 1, explanation: '브라우저 JavaScript의 Source와 Sink 흐름을 확인해야 합니다.' },
    { id: 'w4q2', conceptIds: ['w4-validation'], difficulty: 'foundation', remediationModuleIds: ['w4-validation'], question: 'XSS 확인의 첫 입력으로 가장 적절한 것은?', options: ['외부 전송 코드', '고유한 무해한 마커', '쿠키 탈취 코드'], answer: 1, explanation: '먼저 마커의 반사·저장 위치와 컨텍스트를 확인합니다.' },
    { id: 'w4q3', conceptIds: ['w4-context', 'w4-defense'], difficulty: 'application', remediationModuleIds: ['w4-context', 'w4-defense'], question: 'HTML이 필요 없는 사용자 입력을 화면에 표시할 때 우선할 수정은?', options: ['블랙리스트 확장', 'textContent 사용', 'WAF만 적용'], answer: 1, explanation: '데이터를 HTML 코드로 해석하지 않는 안전한 Sink를 사용합니다.' },
    { id: 'w4q4', conceptIds: ['w4-taint', 'w4-defense'], difficulty: 'analysis', remediationModuleIds: ['w4-taint', 'w4-defense'], question: '좋은 XSS 보고서의 근본 원인 설명은?', options: ['필터가 약함', '공격 문자열이 강함', 'q 입력을 HTML body에 출력하면서 컨텍스트 인코딩을 적용하지 않음'], answer: 2, explanation: '입력·출력 위치와 빠진 통제를 구체적으로 적어야 합니다.' },
    { id: 'w4q5', conceptIds: ['w4-context', 'w4-defense'], difficulty: 'analysis', remediationModuleIds: ['w4-context', 'w4-defense'], question: '사용자가 제한된 HTML을 작성해야 할 때 가장 적절한 방어 조합은?', options: ['모든 입력에 같은 문자열 치환', '검증된 Sanitizer 정책과 안전한 출력 처리', 'CSP만 적용'], answer: 1, explanation: 'HTML이 꼭 필요한 경우 검증된 Sanitizer를 정책에 맞게 적용하고 최종 컨텍스트도 안전하게 처리합니다.' },
    { id: 'w4q6', conceptIds: ['w4-defense'], difficulty: 'analysis', remediationModuleIds: ['w4-defense'], question: 'CSP가 고정 PoC 실행을 막았지만 innerHTML 데이터 흐름이 남아 있다. 올바른 결론은?', options: ['취약점 원인이 제거됨', '실행은 완화됐지만 취약한 원인은 별도 수정 필요', '모든 브라우저에서 영향이 동일하게 사라짐'], answer: 1, explanation: 'CSP의 실행 제한과 취약한 Source-to-Sink 원인 제거는 별도로 확인해야 합니다.' },
  ],
  ...week5to10Quizzes,
  ...week11to16Quizzes,
}

function enrichQuizQuestion(question) {
  const optionIds = question.options.map((_, index) => `${question.id}-option-${index + 1}`)
  return {
    ...question,
    optionIds,
    answerId: optionIds[question.answer],
    optionRationales: question.options.map((option, index) => index === question.answer
      ? `정답 근거: ${question.explanation}`
      : `“${option}” 선택지는 이 문항의 조건과 맞지 않습니다. ${question.explanation}`),
  }
}

export const quizzes = Object.fromEntries([
  [0, baseQuizzes[0]],
  [1, [...baseQuizzes[1], ...baseQuizzes[2]].filter((question) => ['w1q1', 'w1q4', 'w1q5', 'w2q2'].includes(question.id))],
  [3, [...baseQuizzes[7], ...baseQuizzes[8], ...baseQuizzes[9]].filter((question) => ['w7q1', 'w7q2', 'w8q1', 'w8q2', 'w9q1', 'w9q5'].includes(question.id))],
  [4, [...baseQuizzes[10], ...baseQuizzes[11]].filter((question) => ['w10q1', 'w10q3', 'w10q4', 'w10q5', 'w11q2', 'w11q5'].includes(question.id))],
  [7, [...baseQuizzes[14], ...web3FuzzingQuizQuestions]],
  [8, [...baseQuizzes[15], ...supplyChainQuizQuestions]],
  [9, otSecurityQuizQuestions],
  ...Object.entries(baseQuizzes)
    .filter(([index]) => [3, 12, 13, 16].includes(Number(index)))
    .map(([index, questions]) => {
      const sourceIndex = Number(index)
      if (sourceIndex === 3) return [2, questions]
      if (sourceIndex === 16) return [10, questions]
      return [sourceIndex - 7, questions]
    }),
].map(([weekIndex, questions]) => [weekIndex, questions.map(enrichQuizQuestion)]))

function unique(values) {
  return [...new Set(values)]
}

export const objectiveEvidence = Object.freeze(Object.fromEntries(Object.values(weekContent).map((week) => {
  const mappings = objectiveModuleAlignment[week.index] || []
  const entries = week.objectives.map((objective, index) => {
    const explanationModuleIds = [...new Set([
      ...(mappings[index] || []),
      ...week.modules.filter((module) => module.objectiveIndexes?.includes(index)).map((module) => module.id),
    ])]
    const moduleSet = new Set(explanationModuleIds)
    const checkpointIds = week.modules
      .filter((module) => moduleSet.has(module.id))
      .flatMap((module) => (module.blocks || []).filter((block) => block.type === 'checkpoint').map((block) => block.id))
      .filter(Boolean)
    const labIds = week.labs
      .filter((lab) => (lab.relatedConceptIds || []).some((moduleId) => moduleSet.has(moduleId)))
      .map((lab) => lab.id)
    const assessmentQuestionIds = (quizzes[week.index] || [])
      .filter((question) => (question.conceptIds || []).some((moduleId) => moduleSet.has(moduleId)))
      .map((question) => question.id)

    return Object.freeze({
      id: `w${week.index}-objective-${index + 1}`,
      objective,
      explanationModuleIds: Object.freeze([...explanationModuleIds]),
      practiceEvidenceIds: Object.freeze(unique([...labIds, ...checkpointIds])),
      assessmentQuestionIds: Object.freeze(assessmentQuestionIds),
    })
  })
  return [week.index, Object.freeze(entries)]
})))

const baseCoreQuizQuestionIds = {
  0: ['w0q2', 'w0q3', 'w0q6', 'w0q7', 'w0q8', 'w0q12'],
  1: ['w1q1', 'w1q4', 'w1q5'],
  2: ['w2q2'],
  3: ['w3q1', 'w3q2', 'w3q5'],
  4: ['w4q1', 'w4q2', 'w4q3'],
}

const coreQuizQuestionIds = Object.fromEntries([
  [0, baseCoreQuizQuestionIds[0]],
  [1, [...baseCoreQuizQuestionIds[1], ...baseCoreQuizQuestionIds[2]]],
  [2, baseCoreQuizQuestionIds[3]],
  [3, ['w7q1', 'w8q2', 'w9q1']],
  [4, ['w10q1', 'w10q4', 'w11q5']],
  [7, ['w14q1', 'w14q2', 'w7web3q2']],
  [8, ['w8supplyq1', 'w8supplyq2', 'w15q2']],
  [9, ['w9otq1', 'w9otq3', 'w9otq4']],
  [10, ['w16q1', 'w16q2', 'w16q4']],
])

const quizMinimumCorrectOverrides = { 1: 3 }

export const quizRules = Object.fromEntries(Object.entries(quizzes).map(([weekIndex, questionPool]) => [
  weekIndex,
  Number(weekIndex) === 0 ? weekZeroQuizRule : {
    id: `w${weekIndex}-quiz-rule`,
    poolQuestionIds: questionPool.map((question) => question.id),
    questionsPerAttempt: questionPool.length,
    selection: 'all-pool',
    minimumCorrect: quizMinimumCorrectOverrides[weekIndex] || questionPool.length - 1,
    requiredQuestionIds: coreQuizQuestionIds[weekIndex] || questionPool.slice(0, 3).map((question) => question.id),
    passingRule: 'minimum-correct-and-all-core',
    allowRetry: true,
  },
]))

export const officialResources = [
  { category: 'Linux', title: 'OverTheWire Bandit', provider: 'OverTheWire', url: 'https://overthewire.org/wargames/bandit/', note: '공식 SSH 워게임. 제공 계정과 레벨 범위에서만 실습합니다.' },
  { category: 'HTTP', title: 'HTTP Semantics', provider: 'IETF · RFC 9110', url: 'https://www.rfc-editor.org/rfc/rfc9110', note: 'HTTP 메서드·상태·의미의 표준 문서입니다.' },
  { category: 'Browser', title: 'HTTP cookies', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies', note: '쿠키 생성, 전송 범위, 보안 속성을 설명합니다.' },
  { category: 'Tool', title: 'Burp Suite documentation', provider: 'PortSwigger', url: 'https://portswigger.net/burp/documentation/desktop/getting-started', note: 'Proxy와 Repeater의 공식 사용 문서입니다.' },
  { category: 'XSS', title: 'XSS Prevention Cheat Sheet', provider: 'OWASP', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html', note: '컨텍스트별 출력 인코딩, Sanitization, 안전한 Sink 기준입니다.' },
  { category: 'XSS', title: 'Cross-site scripting', provider: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security/cross-site-scripting', note: '개념 읽기와 허가된 Lab을 연결합니다.' },
  { category: 'Report', title: 'Web Security Testing Guide', provider: 'OWASP', url: 'https://owasp.org/www-project-web-security-testing-guide/', note: '테스트 절차와 증거·보고 구조를 확인합니다.' },
  { category: 'Severity', title: 'CVSS v4.0 Specification', provider: 'FIRST', url: 'https://www.first.org/cvss/v4.0/specification-document', note: 'Vector 각 항목과 점수 계산 기준의 원문입니다.' },
]
