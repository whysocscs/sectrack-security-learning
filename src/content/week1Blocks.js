const sources = {
  bash: { label: 'GNU Bash Reference Manual', url: 'https://www.gnu.org/software/bash/manual/', note: '셸, 표준 스트림, 리다이렉션과 파이프의 동작을 확인합니다.' },
  coreutils: { label: 'GNU Coreutils Manual', url: 'https://www.gnu.org/software/coreutils/manual/html_node/', note: 'pwd, ls, mkdir, rm의 공식 설명입니다.' },
  findutils: { label: 'GNU Findutils Manual', url: 'https://www.gnu.org/software/findutils/manual/', note: 'find와 grep의 공식 설명입니다.' },
  fhs: { label: 'Filesystem Hierarchy Standard 3.0', url: 'https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html', note: 'Linux 디렉터리 구조의 기본 기준입니다.' },
}

const answer = (id, prompt, answerGuide, options, correct, explanation) => ({
  type: 'checkpoint', id, prompt, answerGuide, ...(options ? { options, answer: correct, explanation } : {}),
})

export const week1LessonBlocks = Object.freeze({
  'w1-why-linux': [
    {
      type: 'explanation',
      title: '웹 서비스도 결국 운영체제 위에서 동작합니다',
      paragraphs: [
        '웹 해킹에서 보는 요청과 응답은 브라우저에서 끝나지 않습니다. 서버에서는 웹 서버와 애플리케이션이 프로세스로 실행되고, 설정 파일과 로그를 읽으며, 네트워크 연결을 통해 데이터를 주고받습니다. 이 동작을 받쳐 주는 바닥이 운영체제입니다.',
        'Linux 명령을 배우는 목적은 명령어를 많이 외우는 데 있지 않습니다. 서버에서 지금 어느 위치에 있는지, 어떤 파일이 있는지, 입력과 출력이 어디로 흐르는지를 직접 확인하기 위해 최소한의 공통 언어를 익히는 것입니다.',
      ],
    },
    { type: 'diagram', title: '웹 요청 뒤에서 일어나는 일', nodes: ['브라우저가 요청 전송', '웹 서버 프로세스가 요청 수신', '애플리케이션이 파일·데이터 사용', '운영체제 커널이 자원 접근 처리', '응답이 브라우저로 돌아감'] },
    { type: 'comparison', title: 'WEEK01에서 확인할 최소 질문', columns: ['질문', '필요한 기초'], rows: [['지금 어디에 있는가?', '`pwd`, 절대 경로, 상대 경로'], ['무엇이 있는가?', '`ls`'], ['어떻게 이동하는가?', '`cd`'], ['어디에 있는가?', '`find`, `grep`'], ['입력과 출력은 어디로 가는가?', '표준 스트림, 리다이렉션, 파이프']] },
    { type: 'summary', title: '핵심 정리', bullets: ['웹 서버와 애플리케이션은 운영체제 위의 프로세스로 동작한다.', 'Linux CLI는 서버 상태와 데이터 흐름을 확인하는 공통 관찰 도구다.', 'WEEK01은 웹 해킹에 필요한 최소 명령과 경로·스트림만 다룬다.'] },
  ],
  'w1-shell': [
    {
      type: 'explanation',
      title: '운영체제, 터미널, 셸은 역할이 다릅니다',
      paragraphs: [
        '운영체제는 프로그램이 CPU, 메모리, 파일, 장치, 네트워크 같은 자원을 사용할 수 있게 관리합니다. 터미널은 사용자가 글자로 입력하고 결과를 보는 화면이며, 셸은 그 입력을 명령과 인자로 해석해 프로그램을 실행합니다.',
        '따라서 터미널 창에 `ls`를 입력하면 터미널이 입력을 셸에 전달하고, 셸이 `ls` 프로그램을 실행합니다. 프로그램이 요청한 파일 목록은 커널을 거쳐 읽히고 결과가 다시 터미널에 표시됩니다.',
      ],
    },
    {
      type: 'explanation',
      title: '커널은 프로그램과 하드웨어 사이의 핵심 관리자입니다',
      paragraphs: [
        '커널은 운영체제의 중심 부분입니다. 실행 중인 프로세스를 배치하고, 각 프로세스의 메모리를 분리하며, 파일과 디렉터리 접근, 네트워크 송수신, 장치 사용을 중재합니다. 일반 프로그램은 디스크나 네트워크 장치를 마음대로 직접 조작하지 않고 시스템 호출을 통해 커널에 작업을 요청합니다.',
        '이 구분이 보안에서 중요한 이유는 권한 경계 때문입니다. 사용자 공간의 프로그램이 잘못되더라도 커널과 다른 프로세스의 자원에 바로 접근하지 못하도록 경계를 두며, 파일 권한과 프로세스 권한도 커널이 검사합니다. 커널 취약점은 이 경계 자체에 영향을 줄 수 있으므로 일반 애플리케이션 취약점과 영향 범위가 다릅니다.',
      ],
    },
    { type: 'diagram', title: '명령 한 줄이 처리되는 흐름', nodes: ['터미널 입력', '셸이 명령 해석', '프로그램 실행', '시스템 호출로 커널에 요청', '커널이 파일·메모리·네트워크 처리', '결과를 터미널에 출력'] },
    { type: 'comparison', title: '역할 구분', columns: ['구성 요소', '하는 일', '예시'], rows: [['터미널', '문자 입력과 출력 화면 제공', '명령을 입력하고 결과를 봄'], ['셸', '명령·옵션·인자를 해석하고 프로그램 실행', 'Bash'], ['커널', '프로세스와 시스템 자원 접근 관리', '파일 읽기와 네트워크 송수신 처리'], ['운영체제', '커널과 사용자 도구를 포함한 실행 환경 제공', 'Linux']] },
    answer('w1-shell-check-01', '프로그램의 파일·메모리·네트워크 요청을 중재하는 구성 요소는?', '정답: 커널. 프로그램은 시스템 호출을 통해 커널에 자원 작업을 요청합니다.', ['터미널', '커널', '파일 확장자'], 1, '커널은 프로세스와 시스템 자원 사이의 접근을 관리합니다.'),
    { type: 'sources', title: '공식 참고자료', items: [sources.bash] },
    { type: 'summary', title: '핵심 정리', bullets: ['터미널은 입출력 화면이고 셸은 명령 해석기다.', '커널은 프로세스·메모리·파일·네트워크 접근을 관리한다.', '프로그램은 시스템 호출을 통해 커널에 자원 작업을 요청한다.'] },
  ],
  'w1-filesystem': [
    { type: 'explanation', title: '절대 경로와 상대 경로만 먼저 구분합니다', paragraphs: ['Linux 파일 시스템은 `/`에서 시작하는 하나의 디렉터리 트리로 표현됩니다. 절대 경로는 `/`부터 전체 위치를 적고, 상대 경로는 현재 작업 디렉터리를 기준으로 적습니다.', '`pwd`는 현재 위치를 보여 줍니다. `.`은 현재 디렉터리, `..`은 상위 디렉터리이며, `cd`로 이동한 뒤에는 `pwd`로 바뀐 기준을 다시 확인합니다.'] },
    { type: 'terminal', sourceType: 'educational-reconstruction', title: '현재 위치와 경로 확인', command: '$ pwd\n/home/student\n$ cd logs\n$ pwd\n/home/student/logs\n$ cd /tmp\n$ pwd', output: '/tmp', annotations: ['`logs`는 현재 위치를 기준으로 한 상대 경로입니다.', '`/tmp`는 루트 `/`에서 시작하는 절대 경로입니다.', '`cd` 뒤에는 `pwd`로 현재 위치를 확인할 수 있습니다.'] },
    { type: 'comparison', title: '경로 표기 비교', columns: ['표기', '기준', '의미'], rows: [['`/home/student/logs`', '루트 `/`', '절대 경로'], ['`logs`', '현재 작업 디렉터리', '상대 경로'], ['`.`', '현재 작업 디렉터리', '현재 위치'], ['`..`', '현재 작업 디렉터리', '상위 위치']] },
    answer('w1-filesystem-check-01', '`/var/log`처럼 `/`로 시작하는 경로는?', '정답: 절대 경로입니다.', ['절대 경로', '상대 경로', '표준 오류'], 0, '`/`부터 시작하면 현재 위치와 관계없이 루트 기준으로 읽습니다.'),
    { type: 'sources', title: '공식 참고자료', items: [sources.fhs, sources.coreutils] },
    { type: 'summary', title: '핵심 정리', bullets: ['절대 경로는 `/`부터 시작한다.', '상대 경로는 현재 작업 디렉터리를 기준으로 한다.', '`cd`로 이동한 뒤 `pwd`로 현재 위치를 확인한다.'] },
  ],
  'w1-navigation': [
    { type: 'explanation', title: '위치 확인, 목록, 이동, 검색 순서로 봅니다', paragraphs: ['먼저 `pwd`로 현재 위치를 확인하고 `ls`로 목록을 봅니다. 다른 디렉터리로 이동할 때는 `cd`를 사용합니다.', '`find`는 이름과 종류 같은 조건으로 파일이나 디렉터리의 경로를 찾고, `grep`은 텍스트에서 원하는 패턴이 있는 줄을 찾습니다. 경로 검색과 내용 검색은 서로 다른 질문입니다.'] },
    { type: 'command-guide', title: 'WEEK01에서 사용할 다섯 명령', intro: '옵션을 전부 외우지 말고 각 명령이 어떤 질문에 답하는지 먼저 익힙니다.', commands: [
      { syntax: 'pwd', purpose: '현재 작업 디렉터리를 출력합니다.', options: [{ flag: '인자 없음', description: '상대 경로의 기준을 확인합니다.' }] },
      { syntax: 'ls [옵션] [경로]', purpose: '파일과 디렉터리 이름을 표시합니다.', options: [{ flag: '-a', description: '숨김 이름을 포함합니다.' }, { flag: '-l', description: '목록을 상세 형식으로 표시합니다.' }] },
      { syntax: 'cd [경로]', purpose: '현재 작업 디렉터리를 바꿉니다.', options: [{ flag: '..', description: '상위 디렉터리로 이동합니다.' }, { flag: '-', description: '직전 위치로 돌아갑니다.' }] },
      { syntax: 'find [시작 경로] [조건]', purpose: '조건에 맞는 파일이나 디렉터리의 경로를 찾습니다.', options: [{ flag: '-type f', description: '일반 파일만 찾습니다.' }, { flag: '-name "패턴"', description: '이름 패턴으로 찾습니다.' }] },
      { syntax: 'grep [옵션] 패턴 [파일]', purpose: '텍스트에서 패턴이 있는 줄을 찾습니다.', options: [{ flag: '-n', description: '줄 번호를 함께 표시합니다.' }, { flag: '-r', description: '디렉터리 아래 텍스트를 재귀적으로 검색합니다.' }] },
    ] },
    { type: 'terminal', sourceType: 'educational-reconstruction', title: '경로를 찾은 뒤 필요한 줄 찾기', command: '$ pwd\n/home/student\n$ find . -type f -name "*.log"\n./logs/access.log\n./logs/error.log\n$ grep -n "ERROR" ./logs/error.log', output: '18:ERROR invalid request format', annotations: ['`find`는 조건에 맞는 경로를 찾습니다.', '`grep`은 지정한 텍스트에서 패턴이 있는 줄을 찾습니다.'] },
    answer('w1-navigation-check-01', '파일 이름과 위치를 조건으로 찾을 때 사용하는 명령은?', '정답: find입니다.', ['grep', 'find', 'pwd'], 1, '`find`는 파일 시스템의 경로를 조건으로 검색합니다.'),
    { type: 'sources', title: '공식 참고자료', items: [sources.coreutils, sources.findutils] },
    { type: 'summary', title: '핵심 정리', bullets: ['`pwd`는 현재 위치, `ls`는 목록, `cd`는 이동에 사용한다.', '`find`는 경로를 찾고 `grep`은 텍스트 줄을 찾는다.', '검색 전에 시작 경로와 대상을 확인한다.'] },
  ],
  'w1-fileops': [
    { type: 'explanation', title: '디렉터리를 만들고 파일을 삭제하는 두 명령', paragraphs: ['`mkdir`는 디렉터리를 만듭니다. `-p`를 사용하면 필요한 중간 디렉터리도 함께 만들 수 있습니다.', '`rm`은 파일을 삭제하며 일반적으로 휴지통을 거치지 않습니다. 삭제 전에는 `pwd`와 `ls`로 현재 위치와 정확한 대상을 확인하고, 처음에는 `-i`로 확인을 받는 습관이 안전합니다.'] },
    { type: 'command-guide', title: 'mkdir와 rm', intro: '삭제 명령은 연습용 디렉터리와 파일에서만 사용합니다.', commands: [
      { syntax: 'mkdir [옵션] 디렉터리', purpose: '새 디렉터리를 만듭니다.', options: [{ flag: '-p', description: '필요한 중간 디렉터리를 함께 만듭니다.' }] },
      { syntax: 'rm [옵션] 파일', purpose: '파일을 삭제합니다.', options: [{ flag: '-i', description: '삭제 전에 확인을 요청합니다.' }, { flag: '-r', description: '디렉터리와 하위 항목을 재귀 삭제하므로 대상 범위를 반드시 확인합니다.' }] },
    ] },
    { type: 'terminal', sourceType: 'educational-reconstruction', title: '생성과 삭제 전 대상 확인', command: '$ mkdir -p practice/logs\n$ pwd\n/home/student\n$ ls\nnotes.txt  practice\n$ rm -i notes.txt', output: "rm: remove regular file 'notes.txt'?", annotations: ['`mkdir -p`는 중간 경로를 함께 만듭니다.', '`rm -i`는 삭제 전에 대상 확인을 요청합니다.', '재귀 삭제는 현재 위치와 하위 목록을 확인한 뒤에만 사용합니다.'] },
    { type: 'warning', title: 'rm은 되돌리기 어렵습니다', body: '의미를 모르는 삭제 명령을 복사해 실행하지 마세요. `/`, 홈 디렉터리, 작업공간 루트처럼 넓은 경로를 재귀 삭제 대상으로 사용하지 않습니다.' },
    answer('w1-fileops-check-01', '삭제 전에 매번 확인을 요청하는 rm 옵션은?', '정답: -i입니다.', ['-i', '-a', '-n'], 0, '`rm -i`는 각 삭제 전에 확인을 요청합니다.'),
    { type: 'sources', title: '공식 참고자료', items: [sources.coreutils] },
    { type: 'summary', title: '핵심 정리', bullets: ['`mkdir`는 디렉터리를 만든다.', '`rm`은 휴지통을 거치지 않고 삭제할 수 있다.', '삭제 전에는 `pwd`와 `ls`로 대상 범위를 확인한다.'] },
  ],
  'w1-streams': [
    { type: 'explanation', title: '프로그램에는 입력 하나와 출력 두 종류가 있습니다', paragraphs: ['표준 입력(stdin)은 프로그램이 기본으로 읽는 입력이고, 표준 출력(stdout)은 정상 결과, 표준 오류(stderr)는 오류와 진단 메시지입니다.', '`>`는 표준 출력을 파일에 새로 쓰고 `>>`는 이어 씁니다. `2>`는 표준 오류를 파일로 보냅니다. 파이프 `|`는 앞 명령의 표준 출력을 다음 명령의 표준 입력으로 연결합니다.'] },
    { type: 'diagram', title: '표준 스트림의 방향', nodes: ['키보드 또는 앞 명령', 'stdin', '프로그램', 'stdout 또는 stderr', '화면·파일·다음 명령'] },
    { type: 'terminal', sourceType: 'educational-reconstruction', title: '출력을 저장하고 다음 명령으로 연결하기', command: '$ grep "ERROR" app.log > errors.txt\n$ find . -type f 2> find-errors.txt\n$ find . -type f | grep "\\.log$"', output: './logs/access.log\n./logs/error.log', annotations: ['`>`는 grep의 stdout을 파일로 보냅니다.', '`2>`는 find의 stderr만 별도 파일로 보냅니다.', '`|`는 find의 stdout을 grep의 stdin으로 연결합니다.'] },
    { type: 'comparison', title: '리다이렉션과 파이프', columns: ['표기', '흐름', '의미'], rows: [['`cmd > out.txt`', 'stdout → 파일', '정상 출력을 새로 저장'], ['`cmd >> out.txt`', 'stdout → 파일', '정상 출력을 이어서 저장'], ['`cmd 2> err.txt`', 'stderr → 파일', '오류 출력을 저장'], ['`cmd | next`', 'stdout → 다음 stdin', '두 명령을 연결']] },
    answer('w1-streams-check-01', '앞 명령의 정상 출력을 다음 명령의 입력으로 연결하는 표기는?', '정답: 파이프 | 입니다.', ['>', '|', '2>'], 1, '파이프는 앞 명령의 stdout을 다음 명령의 stdin으로 연결합니다.'),
    { type: 'sources', title: '공식 참고자료', items: [sources.bash, sources.coreutils] },
    { type: 'summary', title: '핵심 정리', bullets: ['stdin·stdout·stderr는 역할이 다른 기본 스트림이다.', '리다이렉션은 출력의 목적지를 화면에서 파일로 바꾼다.', '파이프는 앞 명령의 stdout을 다음 명령의 stdin에 연결한다.'] },
  ],
})
