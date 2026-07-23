const rfc4648 = {
  label: 'RFC 4648 · Base-N Encodings',
  url: 'https://www.rfc-editor.org/rfc/rfc4648',
  note: 'Base64가 byte를 제한된 문자 집합으로 표현하는 encoding임을 확인합니다.',
}

const fips180 = {
  label: 'NIST FIPS 180-4 · Secure Hash Standard',
  url: 'https://csrc.nist.gov/pubs/fips/180-4/upd1/final',
  note: 'SHA 계열 hash의 표준 입력·출력과 무결성 비교 역할을 확인합니다.',
}

const fips197 = {
  label: 'NIST FIPS 197 · Advanced Encryption Standard',
  url: 'https://csrc.nist.gov/pubs/fips/197/final',
  note: 'AES가 key를 사용하는 대칭 block cipher라는 공식 기준입니다.',
}

const nistForensics = {
  label: 'NIST SP 800-86 · Integrating Forensic Techniques',
  url: 'https://csrc.nist.gov/pubs/sp/800/86/final',
  note: '증거 식별·수집·검사·분석·보고의 과정과 보존 원칙입니다.',
}

const nistHashing = {
  label: 'NIST IR 8387 · Digital Evidence Preservation',
  url: 'https://doi.org/10.6028/NIST.IR.8387',
  note: '디지털 증거 보존과 장기 무결성·접근 관리의 공식 지침입니다.',
}

const openSshProject = {
  label: 'OpenSSH portable · 공식 저장소',
  url: 'https://github.com/openssh/openssh-portable',
  note: 'secure remote login, command execution, file transfer를 제공하는 OpenSSH의 공식 source입니다.',
}

const openSsh96 = {
  label: 'OpenSSH 9.6 · 공식 release notes',
  url: 'https://www.openssh.com/txt/release-9.6',
  note: 'Terrapin 대응 strict KEX extension 도입을 설명한 공식 release 기록입니다.',
}

const openSshStrictKexPatch = {
  label: 'OpenSSH · strict KEX commit 1edb00c',
  url: 'https://github.com/openssh/openssh-portable/commit/1edb00c58f8a6875fad6a497aa2bacf37f9e6cd5',
  note: 'KEX 순서 강제와 NEWKEYS 뒤 송·수신 sequence reset을 추가한 실제 source diff입니다.',
}

const openSshProtocol = {
  label: 'OpenSSH 9.6 · strict KEX protocol specification',
  url: 'https://github.com/openssh/openssh-portable/blob/V_9_6_P1/PROTOCOL',
  note: 'strict KEX 광고, 예상 밖 packet 거절, NEWKEYS 뒤 sequence reset 규칙입니다.',
}

const terrapinResearch = {
  label: 'USENIX Security 2024 · Terrapin Attack 연구',
  url: 'https://www.usenix.org/conference/usenixsecurity24/presentation/b%C3%A4umer',
  note: 'SSH prefix truncation 공격 조건과 영향·countermeasure를 제시한 1차 연구입니다.',
}

const nvdTerrapin = {
  label: 'NVD · CVE-2023-48795',
  url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-48795',
  note: 'OpenSSH 9.6 이전, network·high-complexity·integrity 영향 분류를 확인합니다.',
}

const cryptoMechanism = {
  id: 'w12-crypto-boundaries-purpose-mechanism',
  type: 'mechanism',
  title: '같은 byte라도 표현·동일성 비교·기밀성 보호는 서로 다른 변환을 쓴다',
  situation: '파일이나 protocol data를 다른 시스템에 전달하고, 이후 같은 byte인지 확인하고, 권한 없는 사람이 내용을 읽지 못하게 하려면 각각 다른 목적의 기능이 필요합니다. Base64, hash, encryption을 “읽기 어려운 문자열”이라는 외형으로 묶으면 필요한 key·검증·권한 통제를 놓칩니다.',
  terms: [
    { term: 'Encoding · 인코딩', meaning: 'byte를 Base64 같은 제한된 문자 집합으로 표현해 저장·전송 호환성을 얻는 가역 변환입니다.', contrast: '누구나 표준 규칙으로 되돌릴 수 있으므로 confidentiality 통제가 아닙니다.' },
    { term: 'Hash · 해시', meaning: '임의 길이 input을 고정 길이 digest로 바꾸어 동일성·무결성 비교에 쓰는 단방향 함수입니다.', contrast: 'digest 일치만으로 작성자, 안전성, 합법성, 보관 이력을 증명하지 않습니다.' },
    { term: 'Encryption · 암호화', meaning: 'key를 가진 허가된 주체만 plaintext를 복구하도록 ciphertext로 바꾸는 변환입니다.', contrast: 'key 보관·권한·nonce·authentication을 잘못 다루면 algorithm 이름만으로 confidentiality가 보장되지 않습니다.' },
    { term: 'Key · 키', meaning: '암호 연산 결과를 결정하며 접근·생성·rotation·폐기 정책이 필요한 비밀 또는 공개 parameter입니다.', contrast: 'Base64 alphabet이나 공개 hash algorithm 이름은 비밀 key가 아닙니다.' },
    { term: 'Integrity · 무결성', meaning: 'data가 승인되지 않게 변경되지 않았음을 검출·판정하는 보안 속성입니다.', contrast: '단순 hash를 공격자가 함께 바꿀 수 있는 위치에 두면 authenticity까지 자동 보장하지 않습니다.' },
  ],
  stages: [
    { label: '목적 선택', actor: '설계자', input: '원본 bytes와 표현·비교·기밀성 요구', action: '한 변환으로 모든 보안 목표를 해결하려 하지 않고 필요한 속성을 분리합니다.', output: 'encoding, hash, authenticated encryption 중 선택' },
    { label: '정규 byte 만들기', actor: 'serializer·encoder', input: 'text·record와 명시된 charset·format', action: '같은 의미가 같은 bytes가 되도록 encoding·canonicalization을 정합니다.', output: '재현 가능한 input bytes' },
    { label: '표현 또는 digest', actor: 'Base64 encoder·hash function', input: 'input bytes', action: '전송 표현을 만들거나 동일성 비교용 digest를 계산합니다.', output: 'encoded text 또는 digest' },
    { label: '기밀성·무결성 보호', actor: '검증된 AEAD API·key service', input: 'plaintext, key handle, unique nonce, associated context', action: 'ciphertext와 authentication tag를 만들고 key material은 application log에서 제외합니다.', output: '보호된 record와 key metadata ID' },
    { label: '소비 전 검증', actor: 'receiver', input: 'format, digest 또는 ciphertext·tag·context', action: '길이·format·tag·trusted digest source를 확인한 뒤에만 decode·use합니다.', output: '검증된 bytes 또는 효과 없는 오류' },
  ],
  trustBoundary: {
    before: 'Base64처럼 보이는 text, hash-looking string, cipher algorithm 이름만으로 보호 목적이나 진위를 알 수 없습니다.',
    decision: 'algorithm, input bytes, key·nonce source, authentication tag, digest의 trusted reference, access policy를 함께 확인해야 합니다.',
    after: '각 결과는 설계된 한 목적과 확인 범위 안에서만 사용됩니다.',
    failure: 'encoding을 encryption으로 오해하면 secret이 평문으로 노출되고, untrusted hash를 authenticity 증거로 쓰거나 tag 없는 encryption을 integrity 보호로 오판할 수 있습니다.',
  },
}

const cryptoTrace = {
  id: 'w12-crypto-boundaries-transform-trace',
  type: 'code-trace',
  title: '고정 text 한 개를 표현·digest·key 기반 보호로 각각 분리하기',
  evidenceKind: 'educational-model',
  language: 'python',
  description: '실제 cryptographic library API가 아닌 목적 구분용 의사 코드입니다. key bytes 대신 비밀을 노출하지 않는 `training-key-handle`만 표시하고 실제 encryption을 실행하지 않습니다.',
  code: '1  text = "blue"\n2  data = utf8_encode(text)                 # b"blue"\n3  display = base64_encode(data)            # "Ymx1ZQ=="\n4  restored = base64_decode(display)        # b"blue"\n5  digest = sha256(data)                     # 동일성 비교값\n6  key = key_service.handle("training-key") # key byte는 process에 표시하지 않음\n7  sealed = aead_seal(key, unique_nonce(), data, context="record-v1")\n8  assert aead_open(key, sealed, context="record-v1") == data',
  trace: [
    { lines: '1–2', before: '사람이 읽는 Unicode text가 있고 byte 표현은 아직 정하지 않았습니다.', action: 'UTF-8 규칙으로 네 ASCII byte를 만듭니다.', after: '이후 모든 변환이 같은 `b"blue"`를 input으로 사용합니다.' },
    { lines: '3–4', before: 'data를 text-only transport에 넣을 표현이 필요합니다.', action: 'Base64로 표현하고 공개 규칙으로 다시 원래 bytes를 얻습니다.', after: '가역성은 확인되지만 key·confidentiality는 전혀 생기지 않습니다.' },
    { lines: '5', before: '나중에 같은 bytes인지 비교할 reference가 필요합니다.', action: 'SHA-256 digest를 계산합니다.', after: 'digest는 비교값이며 원문 복원·출처·안전성 주장은 별도 evidence가 필요합니다.' },
    { lines: '6–8', before: 'confidentiality와 tamper detection을 요구합니다.', action: 'key service handle과 unique nonce·context를 검증된 AEAD API에 전달하고 open 시 tag를 확인합니다.', after: '올바른 key·context·tag일 때만 data가 나오며 실제 key bytes는 code·log에 나타나지 않습니다.' },
  ],
}

const strictKexPatchAnalysis = {
  id: 'w12-crypto-boundaries-strict-kex-patch',
  type: 'patch-analysis',
  title: '공식 commit: NEWKEYS 경계에서 packet sequence를 0으로 다시 시작하다',
  evidenceKind: 'official-patch',
  source: openSshStrictKexPatch,
  language: 'C',
  description: 'OpenSSH portable commit `1edb00c`의 `packet.c` 실제 핵심 diff입니다. 전체 patch는 strict KEX pseudo-algorithm 광고, 첫 packet·예상 밖 packet 검사, 송신·수신 sequence reset을 함께 추가합니다.',
  before: {
    label: '수정 전 · 실제 송신 sequence 흐름',
    code: '/* increment sequence number for outgoing packets */\nif (++state->p_send.seqnr == 0)\n    logit("outgoing seqnr wraps around");\n\nif (type == SSH2_MSG_NEWKEYS)\n    r = ssh_set_newkeys(ssh, MODE_OUT);',
  },
  after: {
    label: '수정 후 · 실제 strict KEX reset',
    code: '/* increment sequence number for outgoing packets */\nif (++state->p_send.seqnr == 0) {\n    if ((ssh->kex->flags & KEX_INITIAL) != 0)\n        ssh_packet_disconnect(ssh,\n            "outgoing sequence number wrapped during initial key exchange");\n}\n\nif (type == SSH2_MSG_NEWKEYS && ssh->kex->kex_strict) {\n    debug_f("resetting send seqnr %u", state->p_send.seqnr);\n    state->p_send.seqnr = 0;\n}',
  },
  changes: [
    'client는 `kex-strict-c-v00@openssh.com`, server는 `kex-strict-s-v00@openssh.com`을 initial KEX proposal에 추가해 지원을 알립니다.',
    'peer가 strict KEX를 지원하면 initial `SSH2_MSG_KEXINIT`가 sequence 0의 첫 packet인지 확인하고 아니면 connection을 종료합니다.',
    'initial KEX 중 `SSH2_MSG_DEBUG`·`SSH2_MSG_IGNORE`를 포함한 예상 밖·순서 밖 packet을 묵시적으로 처리하지 않고 protocol error로 종료합니다.',
    '송신 `SSH2_MSG_NEWKEYS` 뒤 outgoing sequence를, 수신 NEWKEYS 뒤 incoming sequence를 각각 0으로 reset합니다. 이 규칙은 이후 rekey에도 유지됩니다.',
  ],
  regressionTests: [
    { case: '정상 양방향 strict KEX negotiation', expected: 'client·server가 pseudo-algorithm을 인식하고 정상 session이 이어짐', reason: '새 extension이 호환되는 endpoint의 정상 login·command 흐름을 깨뜨리지 않는지 확인합니다.' },
    { case: 'initial KEXINIT가 sequence 0이 아님', expected: 'strict KEX violation으로 handshake가 효과 전에 종료됨', reason: '공식 `seq != 0` gate가 prefix packet을 허용하지 않는지 확인합니다.' },
    { case: 'initial KEX 중 예상 밖 packet', expected: 'packet을 묵시적으로 소비하지 않고 protocol disconnect', reason: 'strict ordering의 첫 번째 보안 규칙을 검증합니다.' },
    { case: '송신·수신 NEWKEYS 직후', expected: '각 방향의 다음 packet sequence가 0에서 시작', reason: 'prefix length와 encrypted sequence state를 분리하는 핵심 수정입니다.' },
    { case: '구형 peer와 상호운용', expected: 'extension 미협상 상태를 명시하고 vendor 정책에 따라 연결 또는 거절', reason: '한쪽만 수정된 상태를 strict KEX가 활성화된 것으로 오판하지 않습니다.' },
  ],
  limitation: 'commit `1edb00c`는 PROTOCOL·kex·packet code를 실제로 수정하지만 같은 commit에 전용 regression test file을 추가하지 않았습니다. 위 행은 protocol과 diff에서 도출한 과정용 회귀 기준이며 upstream test 이름을 주장하지 않습니다. 공격 packet 삽입·삭제, MITM proxy, 외부 SSH 연결은 재현하지 않습니다.',
}

const terrapinImpact = {
  id: 'w12-crypto-boundaries-terrapin-impact',
  type: 'impact-map',
  title: 'Terrapin은 초기 encrypted transport의 제한된 무결성 실패이며 조건 없는 복호화가 아니다',
  intro: 'NVD의 CVSS 3.1 평가는 AV:N, AC:H, PR:N, UI:N, C:N, I:H, A:N입니다. 즉 active network position과 특정 cipher/MAC·protocol 상태가 필요하며, 기밀성 전체 파괴나 SSH key 복구를 의미하지 않습니다.',
  dimensions: [
    { label: '기밀성', impact: 'NVD base 평가는 C:N입니다. 이 CVE 자체가 session plaintext 복호화나 private key 획득을 직접 제공한다고 평가하지 않습니다.', condition: '다른 결함·구성·후속 효과는 별도 evidence가 필요하며 이 카드에서 합치지 않습니다.' },
    { label: '무결성', impact: '초기 encrypted transport의 연속 message 일부를 생략해 협상된 security extension을 downgrade·disable할 수 있어 I:H로 평가됩니다.', condition: 'active MITM, strict KEX 부재, 영향을 받는 cipher/MAC mode, 삭제 가능한 초기 message와 sequence 조정 조건이 필요합니다.' },
    { label: '가용성', impact: 'NVD base 평가는 A:N입니다. protocol disconnect 가능성과 이 CVE의 주된 보안 영향 평가는 구분합니다.', condition: 'strict KEX가 이상 순서를 거절해 connection을 끊는 것은 방어 동작이며 service-wide outage 주장과 같지 않습니다.' },
  ],
  attackerControls: [
    'client와 server 사이 active network position에서 packet 전달 시점·순서에 영향을 주는 능력',
    '암호화 시작 전 추가 transport message와 암호화 직후 대응하는 연속 message 생략 시도',
  ],
  notControlled: [
    'endpoint의 OpenSSH version·vendor backport와 strict KEX 지원 상태',
    'client·server가 실제 협상하는 cipher·MAC·extension 집합',
    'host key·사용자 credential·application authorization',
    '생략 후보 message의 기능과 실제 security consequence',
  ],
  access: {
    authentication: 'PR:N이지만 “아무 network client”와 “active MITM”은 다릅니다. 유효한 SSH account 없이 protocol을 방해할 수 있으나 traffic path에 개입할 조건이 필요합니다.',
    interaction: 'UI:N으로 별도 사용자의 click은 필요하지 않지만 정상 client·server handshake가 진행되어야 합니다.',
    network: 'AV:N·AC:H입니다. 영향을 받는 transport mode와 sequence 상태를 맞추는 active man-in-the-middle 조건이 핵심입니다.',
    defaultExposure: 'NVD는 OpenSSH 9.6 이전을 기록하지만 실제 susceptibility는 vendor backport, 양 끝 version, negotiated algorithms, strict KEX 협상 여부를 확인해야 합니다.',
    protections: 'OpenSSH 9.6 이상 또는 vendor backport를 client와 server 모두에 적용하고 strict KEX negotiation과 정상 session을 재시험합니다. 공급자 권고의 임시 algorithm 제한은 보조 조치이며 protocol state fix를 대체하지 않습니다.',
  },
}

const preservationMechanism = {
  id: 'w12-evidence-preservation-mechanism',
  type: 'mechanism',
  title: '원본 식별값을 먼저 고정하고 검증된 분석 사본에서만 관찰한다',
  situation: '디지털 파일은 열기·복사·변환·시간대 변경·분석 도구에 따라 metadata나 content가 달라질 수 있습니다. 다른 검토자가 같은 bytes와 도구 조건을 다시 확인하려면 원본, 보관본, 분석 사본, hash, 접근 이력을 처음부터 연결해야 합니다.',
  terms: [
    { term: 'Original · 원본', meaning: '수집 대상에서 처음 식별·보존한 증거 bytes와 그 매체·출처 기록입니다.', contrast: '분석자가 편의를 위해 압축을 풀거나 이름을 바꾼 사본과 구분합니다.' },
    { term: 'Forensic Copy · 분석 사본', meaning: '원본을 직접 변경하지 않도록 만든 검증 가능한 작업용 복제본입니다.', contrast: '단순 복사 파일도 생성 과정·hash·tool 기록이 없으면 원본과 연결되지 않습니다.' },
    { term: 'Chain of Custody · 취급 이력', meaning: '누가 언제 어디서 어떤 evidence를 인수·보관·복사·분석했는지 이어지는 기록입니다.', contrast: '파일 내부 metadata만으로 이 운영 이력을 대신할 수 없습니다.' },
    { term: 'Digest Baseline · 해시 기준선', meaning: '특정 시점의 bytes에서 계산해 이후 copy·보관본과 비교하는 hash 값입니다.', contrast: '같은 digest는 byte 비교 근거이지 파일의 작성자·의도·무해성을 증명하지 않습니다.' },
    { term: 'Write Protection · 쓰기 방지', meaning: '원본 media·mount·storage에 분석 중 변경이 일어나지 않도록 하는 기술·절차 통제입니다.', contrast: 'read-only 표시만 믿지 말고 실제 mount·device·access policy를 기록해야 합니다.' },
  ],
  stages: [
    { label: '범위·권한 확인', actor: 'evidence custodian', input: '수집 승인, 대상 ID, 시간 기준, data minimization 범위', action: '허가된 항목만 수집하고 민감 data 처리·보존 기한을 정합니다.', output: 'scoped evidence ID' },
    { label: '원본 식별·보호', actor: 'collector', input: 'source media/file과 read-only 절차', action: 'source, size, time, tool version, timezone, write-protection 상태를 기록합니다.', output: '변경 전 original record' },
    { label: '기준 digest 계산', actor: 'approved hashing tool', input: '원본 bytes와 algorithm', action: 'SHA-256 같은 승인된 algorithm으로 digest를 계산하고 log를 서명·보호합니다.', output: 'original digest baseline' },
    { label: '분석 사본 생성·검증', actor: 'copy tool·custodian', input: '원본과 destination storage', action: 'copy 후 같은 algorithm으로 digest를 계산해 baseline과 비교합니다.', output: 'original과 연결된 analysis copy' },
    { label: '사본 분석·취급 기록', actor: 'analyst', input: '검증된 copy와 tool manifest', action: '관찰은 사본에서 수행하고 모든 변환·추출·access·output을 evidence ID에 연결합니다.', output: '재현 가능한 observation과 chain record' },
  ],
  trustBoundary: {
    before: '파일명, extension, 생성 시각, “read-only” UI 표시만으로 원본성이나 변경 없음이 증명되지 않습니다.',
    decision: '수집자·tool·time·source·write protection·digest·copy link·access log를 함께 확인해야 합니다.',
    after: '분석 결과는 특정 digest의 copy와 tool version·관찰 시점에 연결됩니다.',
    failure: '원본을 먼저 열거나 copy hash를 비교하지 않으면 관찰된 차이가 사건 당시 상태인지 분석 과정의 변경인지 구분하기 어렵습니다.',
  },
}

const custodyTrace = {
  id: 'w12-evidence-preservation-custody-trace',
  type: 'code-trace',
  title: '합성 archive의 original·copy·digest·access를 연결하는 manifest',
  evidenceKind: 'educational-model',
  language: 'yaml',
  description: '실제 사건 evidence가 아닌 브라우저 로컬 `archive-07` 합성 manifest입니다. digest는 교육 표지이며 실제 개인정보·경로·사용자 이름을 포함하지 않습니다.',
  code: '1  evidence_id: TRAINING-ARCHIVE-07\n2  scope: fixed_browser_fixture\n3  original: { state: read_only_baseline, size: 4096 }\n4  algorithm: SHA-256\n5  original_digest: TRAINING-DIGEST-07-A\n6  copy: { id: ANALYSIS-COPY-01, created_by: training-copy-tool-v1 }\n7  copy_digest: TRAINING-DIGEST-07-A\n8  digest_match: true\n9  observed_on: ANALYSIS-COPY-01\n10 timezone: UTC+09:00\n11 access_log: [custody-received, copy-created, analyst-read]\n12 excludes: [real_name, credential, raw_private_content]',
  trace: [
    { lines: '1–3', before: '브라우저에 하나의 합성 archive card가 있지만 보존 역할이 정해지지 않았습니다.', action: 'stable evidence ID, 허가 scope, original의 read-only 기준 상태와 size를 기록합니다.', after: '이후 모든 copy·observation이 같은 original record를 참조할 수 있습니다.' },
    { lines: '4–5', before: 'original bytes와 비교 방법이 아직 없습니다.', action: 'algorithm과 교육용 digest baseline을 함께 기록합니다.', after: '값만 떼어 쓰지 않고 algorithm·evidence ID·시점에 연결된 비교 기준이 생깁니다.' },
    { lines: '6–8', before: '분석 사본이 original과 같은 bytes인지 미확인입니다.', action: 'copy tool·copy ID와 digest를 기록해 baseline과 비교합니다.', after: '일치가 확인된 사본만 다음 관찰 대상으로 승인됩니다.' },
    { lines: '9–12', before: '사본이 준비됐지만 분석 시점·접근·민감정보 정책이 빠져 있습니다.', action: '관찰 대상, timezone, access event, 제외 field를 manifest에 추가합니다.', after: '관찰을 재현하면서 실제 비밀·신원·private content는 학습 기록에 들어가지 않습니다.' },
  ],
}

const interpretationMechanism = {
  id: 'w12-forensic-interpretation-mechanism',
  type: 'mechanism',
  title: '포렌식 결론은 관찰·가능한 설명·반증 자료·확신 수준을 분리해 만든다',
  situation: '확장자와 file signature가 다르거나 timestamp 순서가 예상과 다를 때 바로 “악성”이나 “변조”라고 부르면 정상 변환·복사·timezone·도구 효과를 놓칩니다. 관찰된 byte·metadata를 먼저 고정한 뒤 대안 설명과 추가 자료를 대조해야 합니다.',
  terms: [
    { term: 'Metadata · 메타데이터', meaning: '파일 size, name, filesystem time, owner ID처럼 data를 설명하는 부가 정보입니다.', contrast: '각 값은 생성·복사·mount·tool·filesystem 정책에 영향을 받을 수 있어 사건 사실 전체와 같지 않습니다.' },
    { term: 'File Signature · 파일 시그니처', meaning: '파일 시작이나 구조에 있는 format 식별 byte pattern입니다.', contrast: 'extension보다 실제 format 판단에 가깝지만 content의 안전성·작성자를 자동 판정하지 않습니다.' },
    { term: 'Timeline · 타임라인', meaning: '서로 다른 source의 event를 timezone과 clock 조건에 맞춰 시간 순으로 정렬한 분석 도구입니다.', contrast: '시간상 먼저라는 사실만으로 원인·행위자 관계가 증명되지는 않습니다.' },
    { term: 'Corroboration · 교차 확인', meaning: '서로 독립적인 log·artifact·custody record가 같은 제한된 주장을 지지하는지 대조하는 과정입니다.', contrast: '같은 원본을 재인용한 세 보고서는 독립 evidence 세 개가 아닙니다.' },
    { term: 'Attribution · 행위자 귀속', meaning: '행위를 특정 사람·계정·조직과 연결하는 높은 증거 요구의 결론입니다.', contrast: 'IP, filename, user-agent, 한 account ID만으로 실제 행위자를 확정하지 않습니다.' },
  ],
  stages: [
    { label: 'Raw observation', actor: 'analysis tool', input: '검증된 copy와 tool version', action: 'byte signature, extension, size, timestamps, digest를 변환 없이 기록합니다.', output: 'source-linked facts' },
    { label: '단위·시간 정규화', actor: 'analyst', input: '각 timestamp와 timezone·clock source', action: '원래 값과 normalized 값을 둘 다 보존하고 변환 규칙을 기록합니다.', output: '비교 가능한 time evidence' },
    { label: '가능한 설명 나열', actor: 'analyst', input: '관찰 fact와 system context', action: '악성·정상 rename, archive, copy, extraction, clock skew 등 서로 다른 설명을 만듭니다.', output: '검증 대기 hypothesis' },
    { label: '독립 evidence 대조', actor: 'logs·owner·baseline', input: 'hypothesis별 필요한 자료', action: 'file system journal, application log, deployment record, custody event를 대조합니다.', output: '지지·반박·미확인 상태' },
    { label: '제한된 결론', actor: 'reviewer', input: 'facts와 corroboration', action: '확신 수준, 반대 가능성, 범위, 다음 보존 요청을 함께 기록합니다.', output: '감사 가능한 forensic statement' },
  ],
  trustBoundary: {
    before: '도구가 “PDF”, “modified”, “user A”라고 표시해도 format·변경 원인·실제 행위자가 자동 확정된 것은 아닙니다.',
    decision: 'raw bytes, tool interpretation, filesystem semantics, timezone, independent logs, custody history를 claim별로 대조해야 합니다.',
    after: '결론은 evidence가 지지하는 가장 좁은 사실과 확신 수준으로 제한됩니다.',
    failure: 'extension·timestamp·account label 하나를 사건 결론으로 올리면 분석 tool의 해석과 실제 system state를 혼동하게 됩니다.',
  },
}

const interpretationTrace = {
  id: 'w12-forensic-interpretation-ledger-trace',
  type: 'code-trace',
  title: '확장자·signature 불일치를 “악성 확정”이 아닌 검증 가능한 claim으로 쓰기',
  evidenceKind: 'educational-model',
  language: 'text',
  description: '합성 analysis copy의 고정 관찰 ledger입니다. 실제 파일을 열거나 추출하지 않고, 제공된 metadata card만 분류합니다.',
  code: '1  evidence: TRAINING-ARCHIVE-07 / ANALYSIS-COPY-01\n2  observed_name: report.pdf\n3  observed_signature: ZIP container\n4  observed_mtime: 2026-06-14 02:10:00Z\n5  observation: extension and signature differ\n6  hypothesis_A: normal archive renamed for workflow\n7  hypothesis_B: misleading extension intentionally assigned\n8  not_proven: malware, actor, intent, compromise\n9  next_evidence: creator application log, deployment baseline, custody event\n10 conclusion: format mismatch verified; cause and impact unverified',
  trace: [
    { lines: '1–4', before: '분석자는 검증된 copy와 metadata card를 받았습니다.', action: 'evidence ID, name, byte signature, UTC timestamp를 raw observation으로 기록합니다.', after: 'tool interpretation이 아니라 비교 가능한 네 fact가 생깁니다.' },
    { lines: '5', before: 'extension은 PDF를, signature는 ZIP container를 가리킵니다.', action: '두 값의 불일치만 observation으로 씁니다.', after: '이 문장은 byte·metadata로 재검증 가능하고 원인·의도를 포함하지 않습니다.' },
    { lines: '6–7', before: '불일치를 만들 수 있는 설명이 하나 이상입니다.', action: '정상 workflow와 의도적 위장이라는 상반된 hypothesis를 모두 남깁니다.', after: '한 설명을 사실로 고정하지 않고 필요한 evidence를 설계할 수 있습니다.' },
    { lines: '8–10', before: '제공된 card에는 content 실행·행위자·운영 영향 자료가 없습니다.', action: '미확정 주장을 명시하고 다음 independent evidence를 요청한 뒤 좁은 결론을 냅니다.', after: 'format mismatch만 verified이고 cause·impact는 unverified인 정직한 기록이 됩니다.' },
  ],
}

const cryptoForensicControls = {
  id: 'w12-forensic-interpretation-control-layers',
  type: 'comparison',
  title: 'Code·config·permission·log·test를 암호·증거 경계에 연결하기',
  columns: ['층', 'SSH·암호 측 통제', '증거 측 통제', '검증할 결과'],
  rows: [
    ['Code', 'strict KEX ordering·NEWKEYS sequence reset, 검증된 crypto API', '원본과 copy를 구분하는 immutable evidence ID', '예상 밖 state는 효과 전에 거절'],
    ['Config', 'OpenSSH 9.6/vendor patch, 양 끝 algorithm·extension 정책', 'read-only source, timezone·tool version 고정', '실제 negotiated·collected state가 정책과 일치'],
    ['Permission', 'private key·key service 최소 권한, SSH account authorization', 'custodian·analyst 역할 분리와 최소 evidence access', '허가되지 않은 key·original access 거절'],
    ['Log', 'version·strict KEX 협상·protocol error, key·packet content 제외', 'custody event·copy ID·digest·tool action, private content 제외', '조사 가능성과 data minimization 동시 충족'],
    ['Test', '정상·예상 밖 KEX 순서·NEWKEYS reset·구형 peer 상호운용', 'original/copy digest, read-only 확인, timezone 변환·tool reproducibility', '보안 수정과 정상 기능·보존 상태를 함께 확인'],
  ],
}

function appendUniqueSources(block, additions) {
  const items = [...(block.items || [])]
  additions.forEach((source) => {
    if (!items.some((item) => item.url === source.url)) items.push(source)
  })
  return { ...block, items }
}

function enrichTerrapinCve(block) {
  const additions = [openSshProject, openSsh96, openSshStrictKexPatch, openSshProtocol, terrapinResearch, nvdTerrapin]
  const sources = [...(block.sources || [])]
  additions.forEach((source) => {
    if (!sources.some((item) => item.url === source.url)) sources.push(source)
  })
  return {
    ...block,
    title: '프로토콜 무결성 사례: OpenSSH strict KEX가 복원한 상태 경계',
    productRole: 'OpenSSH는 SSH protocol을 구현해 secure remote login, command execution, `scp`·`sftp` file transfer를 제공하는 client·server software입니다.',
    weakness: 'SSH Binary Packet Protocol의 initial KEX message ordering·sequence state 무결성 부족 · CWE-345/CWE-354',
    affectedVersions: 'OpenSSH 9.6 이전 및 strict KEX countermeasure가 없는 영향 SSH implementation. 실제 susceptibility는 vendor backport와 negotiated cipher/MAC·양 끝 지원을 확인',
    fixedVersions: 'OpenSSH 9.6 또는 strict KEX가 backport된 vendor release. client와 server 양 끝의 지원·협상 상태를 확인',
    cause: '공식 release와 patch는 initial key exchange 중 허용되는 message 순서가 느슨하고 pre-encryption packet까지 누적된 sequence number가 NEWKEYS 뒤에도 이어지는 상태를 강화 대상으로 설명합니다. active MITM이 암호화 전 prefix message 수와 암호화 직후 생략 수를 맞출 수 있는 특정 mode에서 초기 encrypted message의 무결성 검사가 우회될 수 있습니다.',
    condition: 'client·server 사이 active man-in-the-middle 위치, strict KEX 부재, 영향을 받는 cipher/MAC mode, 조작 가능한 initial handshake·sequence 상태, security effect가 있는 생략 대상이 필요합니다. 실습은 packet 변조·삽입·삭제, MITM traffic, 외부 SSH 연결을 포함하지 않고 합성 state card만 읽습니다.',
    patch: 'OpenSSH 9.6의 strict KEX extension은 initial KEXINIT가 첫 packet인지 확인하고 예상 밖 message를 거절하며, 각 방향의 SSH2_MSG_NEWKEYS 뒤 packet sequence를 0으로 reset합니다. 실제 commit은 `1edb00c`이며 양 끝 vendor patch와 정상 상호운용 재시험이 필요합니다.',
    followOn: 'Terrapin을 “SSH 암호 해독”, private key 노출, 모든 session message 임의 변경 또는 다른 암호 CVE의 우회로 연결할 공식 근거는 검증되지 않아 미채택입니다.',
    facts: [
      'NVD CVSS 3.1은 AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:H/A:N으로 평가합니다.',
      'strict KEX는 암호 algorithm 교체만이 아니라 initial packet ordering과 sequence-number state contract를 추가합니다.',
      'OpenSSH version 문자열만으로 strict KEX 협상·vendor backport·양 끝 적용을 모두 증명할 수 없습니다.',
      '교육 활동은 합성 state transition과 공식 diff만 사용하며 공격 traffic을 생성하지 않습니다.',
    ],
    sources,
  }
}

function addAfter(blocks, predicate, additions) {
  const index = blocks.findIndex(predicate)
  if (index < 0) return [...blocks, ...additions]
  return [...blocks.slice(0, index + 1), ...additions, ...blocks.slice(index + 1)]
}

function enrichCrypto(blocks) {
  const cveIndex = blocks.findIndex((block) => block.type === 'cve-case')
  const cve = enrichTerrapinCve(blocks[cveIndex])
  const withoutCve = blocks.filter((_, index) => index !== cveIndex)
  const enriched = addAfter(withoutCve, (block) => block.type === 'explanation', [
    cryptoMechanism,
    cryptoTrace,
    cve,
    strictKexPatchAnalysis,
    terrapinImpact,
  ])
  return enriched.map((block) => block.type === 'sources'
    ? appendUniqueSources(block, [rfc4648, fips180, fips197, openSshProject, openSsh96, openSshStrictKexPatch, openSshProtocol, terrapinResearch, nvdTerrapin])
    : block)
}

function enrichWithBlocks(blocks, additions, sources) {
  const enriched = addAfter(blocks, (block) => block.type === 'explanation', additions)
  return enriched.map((block) => block.type === 'sources' ? appendUniqueSources(block, sources) : block)
}

export function buildWeek11CryptoForensicsGuide(modules) {
  const enrichers = {
    'w12-crypto-boundaries': enrichCrypto,
    'w12-evidence-preservation': (blocks) => enrichWithBlocks(blocks, [preservationMechanism, custodyTrace], [nistForensics, nistHashing, fips180]),
    'w12-forensic-interpretation': (blocks) => enrichWithBlocks(blocks, [interpretationMechanism, interpretationTrace, cryptoForensicControls], [nistForensics, nistHashing]),
  }

  return modules.map((module) => ({
    ...module,
    contentLevel: 'concept-code-cve-v1',
    blocks: enrichers[module.id] ? enrichers[module.id](module.blocks) : module.blocks,
  }))
}
