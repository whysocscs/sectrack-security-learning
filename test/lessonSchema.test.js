import assert from 'node:assert/strict'
import test from 'node:test'
import { weekContent } from '../src/courseData.js'
import { codeCureLab } from '../src/content/codeCureLab.js'
import { getLessonBlocks, validateLessonModule } from '../src/content/lessonSchema.js'
import { LEGACY_WEEK_ZERO_IDS, findMissingSnapshotIds } from '../src/content/week0to3Contract.js'

test('Week 1 to Week 3 IDs preserve the baseline contract while archived Week 0 IDs leave the active curriculum', () => {
  assert.deepEqual(findMissingSnapshotIds(weekContent), { modules: [], labs: [] })
  assert.deepEqual(LEGACY_WEEK_ZERO_IDS.modules.filter((id) => weekContent[0].modules.some((module) => module.id === id)), [])
  assert.deepEqual(LEGACY_WEEK_ZERO_IDS.labs.filter((id) => weekContent[0].labs.some((lab) => lab.id === id)), [])
})

test('legacy lesson fields produce a readable fallback', () => {
  const blocks = getLessonBlocks({
    id: 'example',
    title: '예시',
    summary: '요약',
    paragraphs: ['첫 문단'],
    terms: [['용어', '설명']],
    points: ['정리'],
    steps: ['첫 단계'],
  })

  assert.deepEqual(blocks.map((block) => block.type), ['explanation', 'explanation', 'comparison', 'summary', 'timeline'])
})

test('ordered lesson blocks require stable checkpoint identifiers', () => {
  const valid = {
    id: 'w9-example',
    title: '예시 모듈',
    blocks: [
      { type: 'question', title: '질문', body: '무엇을 확인할까?' },
      { type: 'checkpoint', id: 'w9-example-check-01', prompt: '확인 질문' },
      { type: 'sources', items: [{ label: 'IETF', url: 'https://www.ietf.org/' }] },
    ],
  }

  assert.deepEqual(validateLessonModule(valid), [])
  assert.match(validateLessonModule({ ...valid, blocks: [{ type: 'checkpoint', prompt: 'ID 없음' }] })[0], /ID와 질문/)
})

test('CodeCureLAB uses fixed safe training data', () => {
  assert.equal(codeCureLab.name, 'CodeCureLAB')
  assert.match(codeCureLab.boundary, /실제 서비스/)
  assert.match(codeCureLab.safeExamples.sessionCookie, /redacted/)
})

test('the merged Linux week and Week 2 web modules use the complete ordered lesson contract', () => {
  const requiredTypes = ['question', 'explanation', 'comparison', 'misconception', 'practice-link', 'sources', 'summary']
  for (const module of [...weekContent[1].modules, ...weekContent[2].modules]) {
    const blocks = getLessonBlocks(module)
    const types = blocks.map((block) => block.type)
    assert.deepEqual(validateLessonModule(module), [], module.id)
    for (const type of requiredTypes) {
      if (type === 'comparison') assert.ok(types.includes('comparison') || types.includes('command-guide'), `${module.id} is missing comparison or command guide`)
      else assert.ok(types.includes(type), `${module.id} is missing ${type}`)
    }
    assert.ok(types.includes('terminal') || types.includes('code') || types.includes('http-message'), `${module.id} needs a transcript`)
    assert.ok(blocks.filter((block) => block.type === 'checkpoint').length >= 2, `${module.id} needs two checkpoints`)
  }
})

test('Week 0 keeps only its new glossary, domain, career, evidence, and personal-map IDs active', () => {
  assert.deepEqual(weekContent[0].modules.map((module) => module.id), ['w0-language', 'w0-domains', 'w0-careers', 'w0-evidence'])
  assert.deepEqual(weekContent[0].labs.map((lab) => lab.id), ['w0-map'])
})

test('display Week 03 XSS guide uses the CVE-first v2 contract without changing legacy learning IDs', () => {
  const week = weekContent[3]
  const expectedModuleIds = ['w4-nature', 'w4-types', 'w4-taint', 'w4-context', 'w4-impact', 'w4-defense', 'w4-validation']

  assert.equal(week.displayWeek, 3)
  assert.equal(week.curriculumId, 'week-4')
  assert.equal(week.legacyPrefix, 'w4')
  assert.equal(week.route, '/learn/week/3')
  assert.deepEqual(week.modules.map((module) => module.id), expectedModuleIds)
  assert.equal(week.modules.some((module) => module.id === 'w4-bypass'), false)
  assert.ok(week.modules.every((module) => module.contentLevel === 'deep-guide-v2'))
  assert.ok(week.modules.every((module) => validateLessonModule(module).length === 0), 'every Week 03 module must satisfy the deep-guide schema')

  const archetypes = new Set(week.modules.map((module) => module.archetype))
  assert.ok(archetypes.size >= 3)
  const blockTypes = week.modules.flatMap((module) => getLessonBlocks(module).map((block) => block.type))
  assert.ok(blockTypes.filter((type) => type === 'code').length >= 3)
  assert.ok(blockTypes.filter((type) => type === 'evidence-board').length >= 3)
  assert.ok(blockTypes.filter((type) => type === 'retest').length >= 3)
  const cveCards = week.modules.flatMap((module) => getLessonBlocks(module).filter((block) => block.type === 'cve-case'))
  assert.deepEqual(cveCards.map((block) => block.cve), ['CVE-2020-10688', 'CVE-2022-1948', 'CVE-2020-11022'])
  assert.ok(cveCards.every((block) => block.sources.length >= 2 && /검증되지 않아 미채택/.test(block.followOn)))
  assert.deepEqual(week.labs.map((lab) => lab.id), ['w4-reflected', 'w4-stored', 'w4-dom', 'w4-official-xss'])
  assert.deepEqual(week.retiredActivities.map((activity) => activity.id), ['w4-report-evidence', 'w4-filtering'])
  assert.equal(week.labs.some((lab) => ['report-evidence', 'xss-filtering'].includes(lab.kind)), false)
})

test('display Week 04 SQLi keeps the safe local query review and adds an official CVE-to-patch case', () => {
  const week = weekContent[4]
  const caseBlock = getLessonBlocks(week.modules.find((module) => module.id === 'w5-db-basics')).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-5')
  assert.deepEqual(validateLessonModule(week.modules.find((module) => module.id === 'w5-db-basics')), [])
  assert.equal(caseBlock?.cve, 'CVE-2023-34362')
  assert.match(caseBlock?.patch || '', /Progress|수정 버전/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.deepEqual(week.labs.map((lab) => lab.id), ['w5-query-observation', 'w5-query-review'])
})

test('display Week 05 CSRF retains only fixed local request data and connects it to the official Gradio patch', () => {
  const week = weekContent[5]
  const module = week.modules.find((entry) => entry.id === 'w6-state-change')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-6')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2024-1727')
  assert.match(caseBlock?.condition || '', /로컬 Gradio 서버/)
  assert.match(caseBlock?.patch || '', /Origin/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.ok(week.labs.every((lab) => /합성|공식/.test(`${lab.title} ${lab.safeScope}`)))
})

test('display Week 06 memory foundations use the sudo record without teaching a privilege-escalation procedure', () => {
  const week = weekContent[6]
  const module = week.modules.find((entry) => entry.id === 'w7-c-values')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-7')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2021-3156')
  assert.match(caseBlock?.classification || '', /Heap buffer overflow/)
  assert.match(caseBlock?.patch || '', /수정 릴리스/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(`${caseBlock?.cause} ${caseBlock?.facts.join(' ')}`, /권한 상승 절차가 없습니다/)
  assert.doesNotMatch(`${caseBlock?.cause} ${caseBlock?.facts.join(' ')}`, /sudoedit|exploit payload/i)
  assert.ok(week.labs.every((lab) => /합성|로컬/.test(`${lab.title} ${lab.safeScope}`)))
})

test('display Week 07 assembly reading keeps ABI as a contract rather than an unverified CVE cause', () => {
  const week = weekContent[7]
  const module = week.modules.find((entry) => entry.id === 'w8-instruction-flow')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-8')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2021-3156')
  assert.match(caseBlock?.condition || '', /ABI.*원인이라는 공식 근거는 없습니다/)
  assert.match(caseBlock?.patch || '', /수정 릴리스/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.facts.join(' ') || '', /return address·offset·payload를 제공하지 않습니다/)
})

test('display Week 08 debugger practice uses the xz record for provenance checks, not compromise reproduction', () => {
  const week = weekContent[8]
  const module = week.modules.find((entry) => entry.id === 'w9-debugger-flow')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-9')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2024-3094')
  assert.match(caseBlock?.condition || '', /artifact provenance/)
  assert.match(caseBlock?.patch || '', /영향 버전 제거.*artifact 재검증/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.condition || '', /backdoor·원격 연결을 재현하지 않습니다/)
})

test('display Week 09 memory safety connects the sudo patch to root-cause boundary checks and retests', () => {
  const week = weekContent[9]
  const module = week.modules.find((entry) => entry.id === 'w10-bounds')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-10')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2021-3156')
  assert.match(caseBlock?.cause || '', /길이·용량·안전한 실패 처리/)
  assert.match(caseBlock?.patch || '', /canary·NX·ASLR·PIE는 root fix의 대체물이 아닙니다/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.facts.join(' ') || '', /경계값·경계 초과 marker/)
})

test('display Week 10 checks AI claims against the official xz supply-chain record', () => {
  const week = weekContent[10]
  const module = week.modules.find((entry) => entry.id === 'w11-ai-claims')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-11')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2024-3094')
  assert.match(caseBlock?.cause || '', /upstream tarball 5\.6\.0/)
  assert.match(caseBlock?.patch || '', /artifact provenance/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.condition || '', /악성 build artifact.*재현하지 않습니다/)
})

test('display Week 11 connects SSH integrity boundaries to Terrapin and the OpenSSH 9.6 fix', () => {
  const week = weekContent[11]
  const module = week.modules.find((entry) => entry.id === 'w12-crypto-boundaries')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-12')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2023-48795')
  assert.match(caseBlock?.cause || '', /handshake·sequence number/)
  assert.match(caseBlock?.patch || '', /OpenSSH 9\.6.*strict KEX/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.facts.join(' ') || '', /중간자 트래픽.*포함하지 않습니다/)
})

test('display Week 12 limits HTTP/2 Rapid Reset learning to PCAP evidence, patch guidance, and resource controls', () => {
  const week = weekContent[12]
  const module = week.modules.find((entry) => entry.id === 'w13-pcap-scope')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-13')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2023-44487')
  assert.match(caseBlock?.cause || '', /요청 취소가 많은 stream을 빠르게 reset/)
  assert.match(caseBlock?.patch || '', /stream·요청 자원 제한.*정상 트래픽 재시험/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.facts.join(' ') || '', /대량 요청·reset 전송.*하지 않습니다/)
})

test('display Week 13 uses the Wasmtime fuzzing record with its explicit patch releases and evidence limit', () => {
  const week = weekContent[13]
  const module = week.modules.find((entry) => entry.id === 'w14-fuzzing-model')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-14')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2024-47763')
  assert.match(caseBlock?.cause || '', /OSS-Fuzz routine fuzzing/)
  assert.match(caseBlock?.condition || '', /야생 악용 증거가 없다고 명시/)
  assert.match(caseBlock?.patch || '', /21\.0\.2, 22\.0\.1, 23\.0\.3, 24\.0\.1, 25\.0\.2/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
})

test('display Week 14 separates Azure Arc patching from customer IAM responsibilities', () => {
  const week = weekContent[14]
  const module = week.modules.find((entry) => entry.id === 'w15-shared-responsibility')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-15')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2022-37968')
  assert.match(caseBlock?.cause || '', /Cluster Connect.*인증되지 않은 사용자.*권한을 높여/)
  assert.match(caseBlock?.patch || '', /MSRC.*업데이트 안내.*IAM 최소 권한.*대체물이 아닙니다/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.facts.join(' ') || '', /실제 cloud 계정·cluster·자격 증명을 사용하지 않습니다/)
})

test('display Week 15 preserves the NVD-verified LlamaIndex CVE relationship without reproducing safe_eval', () => {
  const week = weekContent[15]
  const module = week.modules.find((entry) => entry.id === 'w16-agent-boundaries')
  const caseBlock = getLessonBlocks(module).find((block) => block.type === 'cve-case')

  assert.equal(week.curriculumId, 'week-16')
  assert.deepEqual(validateLessonModule(module), [])
  assert.equal(caseBlock?.cve, 'CVE-2024-3098')
  assert.match(caseBlock?.cause || '', /safe_eval.*입력 검증이 부족/)
  assert.match(caseBlock?.patch || '', /LlamaIndex 수정 commit.*도구 허용 목록.*사용자 승인/)
  assert.match(caseBlock?.followOn || '', /CVE-2023-39662의 bypass라고 명시/)
  assert.match(caseBlock?.condition || '', /safe_eval, 실제 파일 생성, 코드 실행은 재현하지 않습니다/)
})
