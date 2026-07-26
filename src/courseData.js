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
  const modules = applyContentOverrides(applyBaseModuleArchitecture(week.index, orderedModules))
  const supplementalLabs = getSupplementalLabs(week.index)
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
    id: 'week-3', index: 3, title: '웹 구조·HTTP·브라우저 보안 기초',
    summary: 'URL 입력부터 렌더링까지의 흐름을 따라가며 HTTP 메시지, 인증 상태, 브라우저 데이터 흐름을 읽습니다.',
    objectives: ['URL·DNS·TCP/TLS·HTTP 요청 흐름을 설명한다.', '요청과 응답의 각 부분을 구분한다.', 'Cookie·Session·Token과 인증·인가를 구분한다.', 'DOM에서 Source·Sink와 렌더링 컨텍스트를 찾는다.'],
    prerequisites: ['Week 1 curl과 HTTP 기준선', '허가된 HTTP 실습 범위'], estimatedMinutes: 360, quizMinutes: 15, recordMinutes: 25,
    modules: [
      { id: 'w3-flow', title: 'URL에서 화면까지', duration: 45, summary: '브라우저가 주소를 해석하고 서버 응답을 화면으로 만드는 전체 경로입니다.', points: ['URL 파싱 → DNS 질의 → IP 결정 → TCP 연결 → HTTPS의 TLS 핸드셰이크 → HTTP 요청 순서로 진행된다.', '요청은 Reverse Proxy·Web Server·Application Server를 거쳐 DB나 외부 서비스에 연결될 수 있다.', '응답 뒤 브라우저는 HTML을 파싱해 DOM을 만들고 CSS와 JavaScript를 적용한다.', 'CDN과 캐시는 응답 경로와 재사용에 관여하지만 원본 애플리케이션의 권한 검증을 대신하지 않는다.'] },
      { id: 'w3-url-dns', title: 'URL과 DNS', duration: 40, summary: '주소의 구성 요소와 Origin을 정확히 구분합니다.', points: ['URL은 scheme, host, port, path, query, fragment로 나뉜다.', 'Origin은 scheme + host + port 조합이다.', 'fragment는 기본 HTTP 요청에 포함되지 않고 브라우저 안에서 사용된다.', 'DNS는 도메인을 IP 등 레코드에 연결하지만 통신 내용의 암호화와 서버 인증을 자동 보장하지 않는다.', 'A·AAAA는 주소, CNAME은 별칭, TXT는 텍스트 데이터를 제공한다.'] },
      { id: 'w3-encoding-body', title: 'Percent Encoding·요청 본문 형식', duration: 55, summary: 'URL 구성 요소와 HTTP 본문의 표현 형식을 Content-Type에 맞춰 구분합니다.', points: ['Percent Encoding은 바이트를 `%HH`로 표현하며 URL 전체를 한꺼번에 인코딩하지 않고 path·query 등 구성 요소의 경계를 유지한다.', '`application/x-www-form-urlencoded`는 이름·값 쌍을 `&`로 구분하고 폼 규칙에서 공백을 `+`로 표현할 수 있다.', '`multipart/form-data`는 boundary로 여러 part를 나누며 파일과 각 part의 헤더를 함께 전달할 수 있다.', '`application/json`은 JSON 문법의 구조화된 본문이며 폼 인코딩과 같은 디코더를 사용하지 않는다.', 'MIME type은 데이터의 미디어 형식을 나타내고 HTTP `Content-Type`은 수신자가 현재 본문을 어떤 형식으로 해석할지 알린다.', '같은 문자도 URL 파싱, 폼 디코딩, JSON 파싱 순서에 따라 다른 값이 될 수 있으므로 원문과 디코딩 후 값을 구분한다.'] },
      { id: 'w3-http', title: 'HTTP 요청·응답', duration: 65, summary: '메시지 문법과 메서드·상태 코드를 근거로 동작을 읽습니다.', points: ['요청은 Request line, Headers, 빈 줄, 선택적 Body로 구성된다.', '응답은 Status line, Headers, 빈 줄, 선택적 Body로 구성된다.', 'GET은 조회에 주로 쓰고 POST는 처리를 요청하지만, 메서드 이름만으로 서버의 실제 안전성이 보장되지는 않는다.', 'Safe는 의도된 서버 상태 변경 여부, Idempotent는 같은 요청 반복 시 의도된 효과가 같은지를 나타낸다.', '401은 인증 정보가 필요하거나 유효하지 않은 상태, 403은 서버가 요청 주체를 알지만 권한상 거부한 상태다.', 'Redirect는 3xx 상태와 Location 헤더를 함께 읽는다.'] },
      { id: 'w3-headers', title: '주요 HTTP 헤더', duration: 40, summary: '방향과 역할을 기준으로 헤더를 분류합니다.', points: ['Host, User-Agent, Accept, Authorization, Cookie, Origin, Referer는 요청에서 자주 본다.', 'Content-Type과 Content-Length는 본문의 형식과 길이를 설명한다.', 'Set-Cookie는 응답에서 브라우저에 쿠키 저장을 지시한다.', 'Location은 리다이렉션 목적지를, Cache-Control은 캐시 정책을 전달한다.', 'Content-Security-Policy와 X-Content-Type-Options는 브라우저 해석을 제한하는 보조 통제다.'] },
      { id: 'w3-session', title: 'Cookie·Session·Token', duration: 55, summary: '브라우저 저장 수단과 서버 인증 상태를 같은 것으로 보지 않습니다.', points: ['Cookie는 브라우저가 이름·값과 속성을 저장하고 조건에 맞는 요청에 전송하는 메커니즘이다.', 'Session은 서버가 상태를 저장하고 식별자로 연결하는 방식이며 쿠키는 그 식별자를 운반할 수 있다.', 'Token은 검증 가능한 인증·권한 정보를 담거나 상태 식별자로 쓰일 수 있지만 저장 위치와 만료·폐기 전략이 필요하다.', 'Secure는 HTTPS 전송, HttpOnly는 JavaScript의 쿠키 읽기 제한, SameSite는 교차 사이트 요청 전송 정책에 관여한다.', 'Domain과 Path는 전송 범위, Expires와 Max-Age는 수명을 정한다.', 'HttpOnly는 XSS 자체를 제거하지 않으며 DOM 읽기·사용자 권한 행동 대행 같은 영향은 남을 수 있다.'] },
      { id: 'w3-auth-origin', title: '인증·인가·Same-Origin Policy', duration: 45, summary: '로그인과 권한 검증, 출처 간 읽기 제한을 구분합니다.', points: ['Authentication은 주체 확인, Authorization은 요청한 행동의 허용 여부 결정이다.', '클라이언트 UI에서 버튼을 숨기는 것은 서버 측 인가가 아니다.', 'SOP는 브라우저가 다른 Origin의 응답을 임의로 읽는 것을 제한한다.', 'Same-site와 Same-origin은 기준이 다르다.', 'CORS는 서버가 특정 Origin의 브라우저 읽기를 허용하는 정책이며 서버 간 요청을 막는 방화벽이 아니다.', '복잡한 교차 출처 요청은 Preflight OPTIONS로 허용 여부를 먼저 확인할 수 있다.'] },
      { id: 'w3-browser-runtime', title: 'fetch·XHR·캐시·렌더링', duration: 55, summary: '브라우저가 추가 요청을 만들고 캐시를 재검증하며 응답 원문을 실행 후 DOM으로 바꾸는 과정을 비교합니다.', points: ['`fetch`와 `XMLHttpRequest`는 JavaScript가 HTTP 요청을 만들고 응답 데이터를 처리하는 API이며 SOP와 CORS 정책의 영향을 받는다.', '브라우저 캐시는 Cache-Control과 validator를 사용하며 조건부 요청에서 리소스가 바뀌지 않았으면 `304 Not Modified`로 기존 본문을 재사용할 수 있다.', '304 응답에 새 본문이 없더라도 브라우저 화면에는 캐시된 본문이 나타날 수 있으므로 네트워크 기록과 표시 결과를 함께 본다.', 'SSR은 서버가 초기 HTML을 만들고 CSR은 JavaScript가 브라우저에서 데이터를 가져와 DOM을 구성하는 비중이 크다.', '페이지 소스나 네트워크 응답 원문은 서버가 보낸 HTML이고 Elements의 DOM은 파싱·복구·스크립트 변경이 반영된 현재 트리다.', '보안 분석에서는 raw response, JavaScript가 받은 데이터, 실행 후 DOM을 각각 기록한다.'] },
      { id: 'w3-dom', title: 'HTML·DOM·JavaScript 데이터 흐름', duration: 70, summary: '사용자 데이터가 브라우저에서 어느 문법으로 해석되는지 추적합니다.', points: ['DOM은 브라우저가 HTML을 파싱하고 스크립트 변경을 반영해 만든 객체 트리다.', '원본 응답 HTML과 실행 후 DOM은 다를 수 있다.', 'Source는 query, fragment, form, cookie, localStorage, API response처럼 데이터가 들어오는 지점이다.', 'Sink는 `innerHTML`, `document.write`, `eval`처럼 데이터를 HTML이나 코드로 해석할 수 있는 지점이다.', '`textContent`와 `createTextNode`는 텍스트를 표시할 때 더 안전한 선택이다.', 'HTML body, attribute, JavaScript string, URL, CSS 컨텍스트마다 필요한 출력 처리가 다르다.'] },
    ],
    labs: [
      { ...commonLabFields, id: 'w3-http-message', week: 3, title: 'HTTP 메시지 해부', kind: 'http-label', estimatedMinutes: 35, objective: '실제 형식의 요청·응답에서 요청선·헤더·본문·상태선을 표시합니다.', prerequisites: ['HTTP 메시지 구조'], requiredTools: ['내장 HTTP 분석기'], safeScope: '정적 교육용 메시지만 분석합니다.', successCriteria: ['요청·응답 요소 8개 이상 식별', '401·403 차이 설명'], hints: ['첫 줄을 먼저 요청선 또는 상태선으로 구분하세요.', '빈 줄 위는 헤더, 아래는 본문입니다.', '방향에 따라 Cookie와 Set-Cookie를 구분하세요.'], relatedConceptIds: ['w3-http', 'w3-headers'], nextRecommendations: ['요청 타임라인'] },
      { ...commonLabFields, id: 'w3-timeline', week: 3, title: '요청 타임라인', kind: 'timeline', estimatedMinutes: 25, objective: 'URL 입력부터 렌더링까지 단계를 순서대로 배치합니다.', prerequisites: ['URL에서 화면까지'], requiredTools: ['브라우저'], safeScope: '단계 카드만 이동합니다.', successCriteria: ['8단계 순서 완성', '공격·방어 지점 연결'], hints: ['도메인을 IP로 바꿔야 연결할 수 있습니다.', 'HTTPS에서는 HTTP보다 TLS가 먼저입니다.', '응답을 받은 뒤 브라우저가 파싱하고 렌더링합니다.'], relatedConceptIds: ['w3-flow'], nextRecommendations: ['Cookie 속성 실험'] },
      { ...commonLabFields, id: 'w3-cookie', week: 3, title: 'Cookie 속성 실험', kind: 'cookie', estimatedMinutes: 35, objective: 'Secure·HttpOnly·SameSite 조합에 따른 브라우저 동작 차이를 비교합니다.', prerequisites: ['Cookie와 Session'], requiredTools: ['내장 쿠키 시뮬레이터'], safeScope: '실제 인증 쿠키가 아닌 `TRAINING_SESSION`만 사용합니다.', successCriteria: ['세 속성 조합 비교', '각 속성이 막지 못하는 영향 설명'], hints: ['전송 조건과 JavaScript 접근 조건을 나눠 보세요.', 'HttpOnly는 네트워크 전송을 끄는 속성이 아닙니다.', 'SameSite는 same-origin이 아닌 site 기준을 사용합니다.'], relatedConceptIds: ['w3-session'], nextRecommendations: ['Source → Sink 추적'] },
      { ...commonLabFields, id: 'w3-source-sink', week: 3, title: 'Source → Sink 추적', kind: 'source-sink', estimatedMinutes: 45, objective: 'JavaScript 예시에서 Source와 Sink를 고르고 안전한 대안으로 바꿉니다.', prerequisites: ['DOM과 JavaScript 데이터 흐름'], requiredTools: ['내장 코드 분석기'], safeScope: '정적 코드 예시만 분석하며 실행하지 않습니다.', successCriteria: ['5개 흐름 분류', '위험한 Sink 수정', '컨텍스트 표시'], hints: ['외부에서 들어오는 값을 먼저 표시하세요.', '그 값이 마지막에 전달되는 DOM API를 찾으세요.', 'HTML이 필요 없다면 텍스트 전용 API를 고르세요.'], relatedConceptIds: ['w3-dom'], nextRecommendations: ['Week 3 XSS'] },
      { ...commonLabFields, id: 'w3-tool-triangle', week: 3, title: 'HTTP Tool Triangle', kind: 'tool-triangle', estimatedMinutes: 45, objective: '같은 고정 training 요청을 curl·DevTools·Burp 관점에서 비교하고, 각 도구가 답하는 질문과 공통 HTTP 필드를 기록합니다.', prerequisites: ['Week 1 HTTP 정상 요청 기준선', 'HTTP 메시지 구조'], requiredTools: ['내장 Tool Triangle 비교기'], safeScope: '고정된 로컬 training 메시지만 비교합니다. 외부 요청·실제 Cookie·값 변조는 수행하지 않습니다.', successCriteria: ['세 도구의 관찰 지점 구분', 'URL·Method·Headers·Body·Status 대조', '마스킹 항목 표시', 'Week 3에 연결할 Source·Sink 질문 작성'], hints: ['세 도구 모두 같은 요청을 보지만 화면과 목적이 다릅니다.', 'Request URL, method, status, response body는 공통 필드입니다.', 'Cookie·Authorization 값은 “보였는가”가 아니라 “마스킹했는가”를 기록하세요.'], relatedConceptIds: ['w3-http', 'w3-headers', 'w3-browser-runtime'], nextRecommendations: ['Week 3 XSS 선수 체크'] },
      { ...commonLabFields, id: 'w3-threat-model', week: 3, title: '로컬 검색 페이지 미니 위협 모델', kind: 'threat-model', path: 'extension', estimatedMinutes: 35, objective: '자산·입력 지점·신뢰 경계·공격 표면·통제를 한 장에 정리합니다.', prerequisites: ['핵심 보안 언어', '웹 요청 흐름'], requiredTools: ['내장 양식'], safeScope: '가상의 로컬 검색 페이지를 대상으로 합니다.', successCriteria: ['다섯 필드 작성', '통제와 공격 표면 연결'], hints: ['먼저 보호할 데이터와 사용자 행동을 적으세요.', '브라우저와 서버 사이를 신뢰 경계로 표시하세요.', '각 입력 지점이 어느 컨텍스트에 출력되는지 확인하세요.'], relatedConceptIds: ['w3-flow', 'w3-dom'], nextRecommendations: ['Week 3 XSS 선수 체크'] },
    ],
    deliverables: ['Web Request Flow Report', 'HTTP 메시지 분석', '요청 흐름 다이어그램', 'Cookie·Session 관찰표', 'curl·DevTools·Burp Tool Triangle 비교', 'Source·Transform·Sink·Context 메모'],
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
  const navigation = moduleById('w1-navigation')
  const permission = moduleById('w1-permission')
  const bandit = labById('w1-bandit')

  return {
    ...weekOne,
    title: '보안 기초·Linux·도구',
    summary: '경로·파일·권한·텍스트·HTTP 관찰을 하나의 Linux 학습 흐름으로 익히고 Bandit 0~10에 적용합니다.',
    objectives: [
      ...weekOne.objectives,
      ...weekTwo.objectives.slice(0, 2),
      'Base64 인코딩과 파일 표현 관찰을 암호화와 구분한다.',
      'curl로 정상 HTTP 요청과 응답 기준선을 관찰한다.',
    ],
    prerequisites: weekOne.prerequisites,
    quizMinutes: 25,
    recordMinutes: 35,
    modules: [
      moduleById('w1-shell'),
      moduleById('w1-filesystem'),
      {
        ...navigation,
        title: '파일·탐색·텍스트·형식 관찰 명령',
        duration: 125,
        summary: '`pwd`, `ls`, `cd`, `find`, `grep`, `file`과 텍스트 관찰 명령을 문법과 옵션 중심으로 익힙니다.',
        points: [...navigation.points, ...moduleById('w2-text').points, ...moduleById('w2-binary').points],
      },
      moduleById('w1-fileops'),
      {
        ...permission,
        title: '사용자·그룹·소유권과 권한',
        duration: 75,
        summary: '파일과 디렉터리의 권한을 읽고, `chmod`·`chown`·`chgrp`가 바꾸는 대상을 구분합니다.',
        points: [...permission.points, ...moduleById('w2-permissions').points],
      },
      moduleById('w1-ssh'),
      moduleById('w2-streams'),
      moduleById('w2-curl'),
      moduleById('w2-process'),
      moduleById('w2-git'),
    ].filter(Boolean),
    labs: [
      labById('w1-treasure'),
      {
        ...commonLabFields,
        id: 'w1-command-ctf',
        week: 1,
        title: '명령어 CTF · 사건 기록',
        kind: 'linux-shell',
        scenario: 'command-ctf',
        estimatedMinutes: 40,
        objective: '가상 사건 디렉터리에서 목록, 파일 형식, 경로 검색, 텍스트 검색을 조합해 세 개의 교육용 FLAG를 찾습니다.',
        prerequisites: ['`ls`, `file`, `find`, `grep`의 역할 구분'],
        requiredTools: ['내장 가상 Linux 셸'],
        safeScope: '브라우저 메모리 안의 읽기 전용 교육용 파일 시스템입니다.',
        successCriteria: ['FLAG 3개 확인', '각 FLAG에 사용한 명령 순서 기록', '경로 검색과 내용 검색의 차이 설명'],
        hints: ['먼저 목록으로 보이는 파일과 숨김 파일을 구분하세요.', '확장자보다 `file` 결과를 먼저 읽어 보세요.', '경로는 `find`, 특정 줄은 `grep`으로 나누어 찾으세요.'],
        relatedConceptIds: ['w1-navigation', 'w1-filesystem'],
        nextRecommendations: ['OverTheWire Bandit 0~10'],
      },
      {
        ...bandit,
        title: 'OverTheWire Bandit 0~10',
        estimatedMinutes: 240,
        objective: '공식 워게임에서 Linux 기본 명령·권한·텍스트 처리·SSH 흐름을 적용하고 풀이 기록을 남깁니다.',
        prerequisites: ['파일 탐색', '권한과 텍스트 처리', 'SSH'],
        successCriteria: ['0~10 레벨 완료', '레벨별 목표·명령·원리·막힌 지점 기록', '다음 레벨 비밀번호 마스킹'],
        relatedConceptIds: ['w1-navigation', 'w1-permission', 'w2-streams', 'w2-curl'],
        nextRecommendations: ['Week 2 웹 구조'],
        path: 'extension',
      },
    ].filter(Boolean),
    deliverables: ['가상 파일 시스템 보물찾기 기록', '명령어 CTF 풀이 기록', 'Bandit 0~10 풀이 기록', 'Linux 명령 관찰 노트'],
    recordBlueprint: {
      title: 'Linux 관찰·명령 기록',
      description: '경로·권한·텍스트 처리·HTTP 기준선과 Bandit 풀이를 한 기록에서 연결합니다.',
      sections: ['현재 위치·대상 경로·명령 목적', '권한·스트림·텍스트 처리 관찰', '정상 HTTP 기준선과 마스킹', 'Bandit 0~10 풀이와 막힌 지점', '다음에 재시험할 조건'],
    },
    reportConnection: '명령, 현재 위치, 대상 경로, 중간 출력, 권한·마스킹 여부를 남기는 기록 습관을 만듭니다.',
  }
}

function reindexWeek(week, index) {
  return {
    ...week,
    id: `week-${index}`,
    index,
    displayWeek: index,
    curriculumId: week.curriculumId || week.id,
    legacyPrefix: week.legacyPrefix || `w${week.index}`,
    route: `/learn/week/${index}`,
    labs: (week.labs || []).map((lab) => ({ ...lab, week: index })),
  }
}

const mergedWeekOne = mergeLinuxWeeks(baseWeekContent[1], baseWeekContent[2])
const curriculumDefinitions = [
  weekZeroDefinition,
  reindexWeek(mergedWeekOne, 1),
  ...Object.values(baseWeekContent).filter((week) => week.index >= 3).map((week) => reindexWeek(week, week.index - 1)),
  ...Object.values(baseLaterWeekContent).map((week) => reindexWeek(week, week.index - 1)),
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
    { id: 'w2q2', conceptIds: ['w2-streams'], difficulty: 'foundation', remediationModuleIds: ['w2-streams'], question: '`2>`가 보내는 스트림은?', options: ['stdin', 'stdout', 'stderr'], answer: 2, explanation: '파일 설명자 2는 표준 오류입니다.' },
    { id: 'w2q3', conceptIds: ['w1-navigation'], difficulty: 'foundation', remediationModuleIds: ['w1-navigation'], question: 'Base64에 대한 올바른 설명은?', options: ['비밀키 암호화', '복호화 불가능한 해시', '문자 기반 표현을 위한 인코딩'], answer: 2, explanation: 'Base64는 비밀성을 제공하지 않는 인코딩입니다.' },
    { id: 'w2q4', conceptIds: ['w2-curl'], difficulty: 'application', remediationModuleIds: ['w2-curl'], question: '요청 값을 바꾸기 전 가장 먼저 할 일은?', options: ['정상 요청 기준선 저장', '모든 파라미터 동시 변경', '외부 사이트 스캔'], answer: 0, explanation: '원본 기준선이 있어야 변경의 영향을 비교할 수 있습니다.' },
    { id: 'w2q5', conceptIds: ['w1-navigation'], difficulty: 'application', remediationModuleIds: ['w1-navigation'], question: '같은 경로별 발생 횟수를 세기 전에 필요한 순서는?', options: ['uniq 후 sort', 'sort 후 uniq -c', 'cut 후 chmod'], answer: 1, explanation: '같은 값을 붙여 놓도록 정렬한 뒤 `uniq -c`로 빈도를 셉니다.' },
    { id: 'w2q6', conceptIds: ['w2-streams', 'w2-curl'], difficulty: 'analysis', remediationModuleIds: ['w2-streams', 'w2-curl'], question: '`curl -i` 결과와 오류를 서로 다른 파일에 남기려면 구분해야 하는 것은?', options: ['stdout과 stderr', 'stdin과 PATH', 'Base64와 gzip'], answer: 0, explanation: '정상 출력과 진단 오류가 각각 stdout과 stderr 중 어디로 가는지 확인해야 합니다.' },
  ],
  3: [
    { id: 'w3q1', conceptIds: ['w3-url-dns'], difficulty: 'foundation', remediationModuleIds: ['w3-url-dns'], question: 'URL fragment에 대한 설명으로 맞는 것은?', options: ['항상 HTTP 요청 헤더에 포함된다', '기본적으로 서버 요청에 포함되지 않는다', 'DNS 서버에만 전달된다'], answer: 1, explanation: 'fragment는 보통 브라우저 내부에서 처리됩니다.' },
    { id: 'w3q2', conceptIds: ['w3-auth-origin'], difficulty: 'application', remediationModuleIds: ['w3-auth-origin'], question: '로그인은 성공했지만 다른 사용자의 문서를 읽을 수 있다. 빠진 검증은?', options: ['DNS', '인가', 'HTML 파싱'], answer: 1, explanation: '인증 이후에도 객체별 인가 검증이 필요합니다.' },
    { id: 'w3q3', conceptIds: ['w3-session'], difficulty: 'foundation', remediationModuleIds: ['w3-session'], question: 'HttpOnly가 직접 제한하는 것은?', options: ['JavaScript의 쿠키 읽기', '모든 XSS 실행', '서버의 세션 생성'], answer: 0, explanation: 'HttpOnly는 스크립트의 쿠키 접근을 제한하지만 XSS 자체를 막지 않습니다.' },
    { id: 'w3q4', conceptIds: ['w3-dom'], difficulty: 'application', remediationModuleIds: ['w3-dom'], question: '일반 텍스트를 DOM에 표시할 때 더 안전한 Sink는?', options: ['innerHTML', 'eval', 'textContent'], answer: 2, explanation: '`textContent`는 값을 HTML 코드로 해석하지 않습니다.' },
    { id: 'w3q5', conceptIds: ['w3-encoding-body'], difficulty: 'application', remediationModuleIds: ['w3-encoding-body'], question: '파일과 일반 필드를 boundary로 나누어 전송하는 Content-Type은?', options: ['application/json', 'multipart/form-data', 'text/plain'], answer: 1, explanation: '`multipart/form-data`는 boundary로 여러 part를 구분합니다.' },
    { id: 'w3q6', conceptIds: ['w3-browser-runtime'], difficulty: 'analysis', remediationModuleIds: ['w3-browser-runtime'], question: '조건부 요청이 304를 받았는데 화면에 본문이 보이는 이유는?', options: ['304가 새 본문을 포함해서', '브라우저가 검증된 캐시 본문을 재사용해서', 'DNS가 HTML을 생성해서'], answer: 1, explanation: '304는 캐시된 표현이 유효함을 알리고 브라우저는 저장한 본문을 재사용할 수 있습니다.' },
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
  [1, [...baseQuizzes[1], ...baseQuizzes[2]]],
  ...Object.entries(baseQuizzes)
    .filter(([index]) => Number(index) >= 3)
    .map(([index, questions]) => [Number(index) - 1, questions]),
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
  1: ['w1q1', 'w1q3', 'w1q4'],
  2: ['w2q1', 'w2q2', 'w2q4'],
  3: ['w3q1', 'w3q2', 'w3q5'],
  4: ['w4q1', 'w4q2', 'w4q3'],
}

const coreQuizQuestionIds = Object.fromEntries([
  [0, baseCoreQuizQuestionIds[0]],
  [1, [...baseCoreQuizQuestionIds[1], ...baseCoreQuizQuestionIds[2]]],
  ...Object.entries(baseCoreQuizQuestionIds)
    .filter(([index]) => Number(index) >= 3)
    .map(([index, questionIds]) => [Number(index) - 1, questionIds]),
])

const quizMinimumCorrectOverrides = { 1: 10 }

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
