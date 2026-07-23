import assert from 'node:assert/strict'
import test from 'node:test'
import { weekContent as baseWeekContent } from '../src/courseData.js'
import { codeCureLab } from '../src/content/codeCureLab.js'
import { conceptRegistry } from '../src/content/conceptRegistry.js'
import { loadDeepGuideModules } from '../src/content/deepGuideLoader.js'
import {
  EDUCATIONAL_CODE_NOTICE,
  GENERIC_CODE_SOURCE_TYPES,
  getCheckpointMinimumLength,
  getLessonBlocks,
  validateCheckpointAnswer,
  validateLessonBlock,
  validateLessonModule,
} from '../src/content/lessonSchema.js'
import { LEGACY_WEEK_ZERO_IDS, findMissingSnapshotIds } from '../src/content/week0to3Contract.js'

// Production loads the Week 03–15 deep guides only when the learner enters that
// week. The content-integrity suite deliberately hydrates every guide so its
// evidence and schema assertions remain exhaustive without forcing those guides
// back into the initial browser bundle.
const weekContent = { ...baseWeekContent }
await Promise.all(Array.from({ length: 13 }, (_, offset) => offset + 3).map(async (weekIndex) => {
  weekContent[weekIndex] = {
    ...baseWeekContent[weekIndex],
    modules: await loadDeepGuideModules(weekIndex, baseWeekContent[weekIndex].modules),
  }
}))

function assertSplitGuideModules(week, label) {
  const caseModules = week.modules.filter((module) => module.contentLevel === 'case-dossier-v1')
  const patchModules = week.modules.filter((module) => module.contentLevel === 'patch-workshop-v1')
  const coreModules = week.modules.filter((module) => !['case-dossier-v1', 'patch-workshop-v1'].includes(module.contentLevel))

  assert.equal(caseModules.length, 1, `${label} must expose one dedicated CVE case dossier`)
  assert.equal(patchModules.length, 1, `${label} must expose one dedicated patch workshop`)
  assert.ok(coreModules.every((module) => module.contentLevel === 'concept-code-cve-v1'), `${label} core modules must keep the concept-code-CVE contract`)
}

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

test('generic code blocks receive an explicit conservative provenance contract', () => {
  const allowedSourceTypes = new Set(GENERIC_CODE_SOURCE_TYPES)
  const genericBlocks = Object.values(weekContent).flatMap((week) => week.modules).flatMap((module) => getLessonBlocks(module)).filter((block) => ['terminal', 'http-message', 'code'].includes(block.type))
  const normalized = getLessonBlocks({ id: 'provenance-example', title: '예시', blocks: [{ type: 'code', code: 'safe_training_value = true' }] })

  assert.equal(EDUCATIONAL_CODE_NOTICE, '아래 코드는 실제 프로젝트 소스 코드가 아니라, 공식 취약점 설명과 패치 구조를 단순화한 재현용 예제이다.')
  assert.equal(normalized[0].sourceType, 'educational-reconstruction')
  assert.ok(genericBlocks.length > 0)
  assert.ok(genericBlocks.every((block) => allowedSourceTypes.has(block.sourceType)))
  assert.ok(genericBlocks.filter((block) => ['actual-project-source', 'official-upstream-patch', 'official-remediation', 'standards-derived-model'].includes(block.sourceType)).every((block) => block.source?.label && /^https:\/\//.test(block.source.url)))
})

test('nested lesson structures fail closed with recoverable block-level validation errors', () => {
  assert.match(validateLessonBlock({ type: 'code', code: '' })[0], /표시할 code/)
  assert.match(validateLessonBlock({ type: 'sources', items: [null] })[0], /sources/)
  assert.match(validateLessonBlock({ type: 'comparison', columns: ['A'], rows: ['flat row'] })[0], /2차원 rows/)
  assert.match(validateLessonBlock({ type: 'summary', bullets: [] })[0], /summary/)
  assert.match(validateLessonBlock({ type: 'not-supported' })[0], /지원되지/)
})

test('written checkpoints reject short or low-information answers and expose option rationales', () => {
  const defaultCheckpoint = { type: 'checkpoint', id: 'free-default', prompt: '관찰과 해석을 적으세요.' }
  const explicitCheckpoint = { ...defaultCheckpoint, id: 'free-explicit', prompt: '관찰과 해석을 80자 이상 적으세요.' }

  assert.equal(getCheckpointMinimumLength(defaultCheckpoint), 20)
  assert.equal(getCheckpointMinimumLength(explicitCheckpoint), 80)
  assert.equal(validateCheckpointAnswer(defaultCheckpoint, '짧은 답').valid, false)
  assert.equal(validateCheckpointAnswer(defaultCheckpoint, '가'.repeat(25)).valid, false)
  assert.equal(validateCheckpointAnswer(defaultCheckpoint, '응답 상태 코드가 200이고 헤더와 본문 구조가 정상 기준과 일치합니다.').valid, true)

  const weekOneCheckpoints = weekContent[1].modules.flatMap((module) => getLessonBlocks(module).filter((block) => block.type === 'checkpoint'))
  assert.ok(weekOneCheckpoints.length > 0)
  weekOneCheckpoints.forEach((block) => {
    if (block.options?.length) assert.equal(block.optionRationales.length, block.options.length)
    else assert.ok(Number.isInteger(block.minimumLength) && block.minimumLength > 0)
  })
})

test('concept registry anchors use canonical learner-facing concept routes', () => {
  const anchors = Object.values(conceptRegistry).map((concept) => concept.coreAnchor)
  assert.ok(anchors.length > 0)
  assert.ok(anchors.every((anchor) => /^#\/learn\/week\/3\/concepts\/w4-/.test(anchor)))
  assert.ok(anchors.every((anchor) => !anchor.includes('/module/')))
})

test('audited official evidence links and CVRF representation wording stay current', () => {
  const serializedContent = JSON.stringify(weekContent)
  assert.doesNotMatch(serializedContent, /sudo\.ws\/security\/advisories\/heap_based_overflow/)
  assert.match(serializedContent, /sudo\.ws\/security\/advisories\/unescape_overflow/)
  assert.doesNotMatch(serializedContent, /csrc\.nist\.gov\/pubs\/ir\/8387\/final/)
  assert.match(serializedContent, /doi\.org\/10\.6028\/NIST\.IR\.8387/)
  assert.doesNotMatch(serializedContent, /usenixsecurity24\/presentation\/baumer/)
  assert.match(serializedContent, /usenixsecurity24\/presentation\/b%C3%A4umer/)
  assert.match(serializedContent, /일반 브라우저는 기본 XML representation/)
  assert.match(serializedContent, /Accept: application\/json/)
  assert.doesNotMatch(serializedContent, /필요 없어지는다/)
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

test('display Week 03 XSS guide uses the concept-to-patch v3 contract without changing legacy learning IDs', () => {
  const week = weekContent[3]
  const expectedModuleIds = ['w4-nature', 'w4-types', 'w4-taint', 'w4-context', 'w4-impact', 'w4-defense', 'w4-validation']

  assert.equal(week.displayWeek, 3)
  assert.equal(week.curriculumId, 'week-4')
  assert.equal(week.legacyPrefix, 'w4')
  assert.equal(week.route, '/learn/week/3')
  assert.deepEqual(week.modules.map((module) => module.id), expectedModuleIds)
  assert.equal(week.modules.some((module) => module.id === 'w4-bypass'), false)
  assert.ok(week.modules.every((module) => module.contentLevel === 'deep-guide-v3'))
  assert.ok(week.modules.every((module) => validateLessonModule(module).length === 0), 'every Week 03 module must satisfy the deep-guide schema')

  const archetypes = new Set(week.modules.map((module) => module.archetype))
  assert.ok(archetypes.size >= 3)
  const blockTypes = week.modules.flatMap((module) => getLessonBlocks(module).map((block) => block.type))
  assert.ok(blockTypes.filter((type) => ['code', 'code-trace'].includes(type)).length >= 3)
  assert.ok(blockTypes.filter((type) => type === 'evidence-board').length >= 3)
  assert.ok(blockTypes.filter((type) => type === 'retest').length >= 3)
  assert.ok(blockTypes.filter((type) => type === 'mechanism').length >= 5)
  assert.equal(blockTypes.filter((type) => type === 'patch-analysis').length, 3)
  assert.equal(blockTypes.filter((type) => type === 'impact-map').length, 3)
  const cveCards = week.modules.flatMap((module) => getLessonBlocks(module).filter((block) => block.type === 'cve-case'))
  assert.deepEqual(cveCards.map((block) => block.cve), ['CVE-2020-10688', 'CVE-2022-1948', 'CVE-2020-11022'])
  assert.ok(cveCards.every((block) => block.sources.length >= 2 && /검증되지 않아 미채택/.test(block.followOn)))
  assert.ok(cveCards.every((block) => block.productRole && block.affectedVersions && block.fixedVersions && block.weakness))
  const evidenceKinds = week.modules.flatMap((module) => getLessonBlocks(module).filter((block) => ['code-trace', 'patch-analysis'].includes(block.type)).map((block) => block.evidenceKind))
  assert.ok(evidenceKinds.includes('educational-model'))
  assert.equal(evidenceKinds.filter((kind) => kind === 'official-patch').length, 3)
  assert.deepEqual(week.labs.map((lab) => lab.id), ['w4-reflected', 'w4-stored', 'w4-dom', 'w4-official-xss'])
  assert.deepEqual(week.retiredActivities.map((activity) => activity.id), ['w4-report-evidence', 'w4-filtering'])
  assert.equal(week.labs.some((lab) => ['report-evidence', 'xss-filtering'].includes(lab.kind)), false)
})

test('display Week 04 SQLi keeps the safe local query review and adds an official CVE-to-patch case', () => {
  const week = weekContent[4]
  const dbBasics = week.modules.find((module) => module.id === 'w5-db-basics')
  const blocks = week.modules.flatMap((module) => getLessonBlocks(module))
  const caseBlock = getLessonBlocks(dbBasics).find((block) => block.type === 'cve-case')
  const patchBlock = getLessonBlocks(dbBasics).find((block) => block.type === 'patch-analysis')

  assert.equal(week.curriculumId, 'week-5')
  assert.ok(week.modules.every((module) => module.contentLevel === 'concept-code-cve-v1'))
  assert.ok(week.modules.every((module) => validateLessonModule(module).length === 0), 'every Week 04 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 5)
  assert.ok(blocks.filter((block) => block.type === 'code-trace').length >= 3)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2023-34362')
  assert.match(caseBlock?.patch || '', /Progress|수정 버전/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.productRole || '', /managed file transfer/)
  assert.match(caseBlock?.affectedVersions || '', /2023\.0\.0/)
  assert.match(caseBlock?.fixedVersions || '', /2023\.0\.1/)
  assert.equal(patchBlock?.evidenceKind, 'educational-model')
  assert.match(patchBlock?.limitation || '', /실제 취약 source|실제 패치/)
  assert.match(patchBlock?.after?.code || '', /db\.query\(sql, params\)/)
  assert.deepEqual(week.labs.map((lab) => lab.id), ['w5-query-observation', 'w5-query-review'])
})

test('display Week 05 CSRF retains only fixed local request data and connects it to the official Gradio patch', () => {
  const week = weekContent[5]
  const module = week.modules.find((entry) => entry.id === 'w6-state-change')
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const moduleBlocks = getLessonBlocks(module)
  const caseBlock = moduleBlocks.find((block) => block.type === 'cve-case')
  const patchBlock = moduleBlocks.find((block) => block.type === 'patch-analysis')

  assert.equal(week.curriculumId, 'week-6')
  assert.ok(week.modules.every((entry) => entry.contentLevel === 'concept-code-cve-v1'))
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 05 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 5)
  assert.ok(blocks.filter((block) => block.type === 'code-trace').length >= 2)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2024-1727')
  assert.match(caseBlock?.condition || '', /로컬 Gradio 서버/)
  assert.match(caseBlock?.patch || '', /CustomCORSMiddleware/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.productRole || '', /Python/)
  assert.match(caseBlock?.affectedVersions || '', /4\.16\.0/)
  assert.match(caseBlock?.fixedVersions || '', /4\.19\.2/)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.before?.code || '', /allow_origins=\["\*"\]/)
  assert.match(patchBlock?.after?.code || '', /origin_name not in localhost_aliases/)
  assert.match(patchBlock?.limitation || '', /일반적인 synchronizer CSRF token 구현이 아니/)
  assert.ok(week.labs.every((lab) => /합성|공식/.test(`${lab.title} ${lab.safeScope}`)))
})

test('display Week 06 memory foundations use the sudo record without teaching a privilege-escalation procedure', () => {
  const week = weekContent[6]
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')

  assert.equal(week.curriculumId, 'week-7')
  assertSplitGuideModules(week, 'Week 06')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 06 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 3)
  assert.ok(blocks.filter((block) => block.type === 'code-trace').length >= 2)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2021-3156')
  assert.match(caseBlock?.classification || '', /Heap buffer overflow/)
  assert.match(caseBlock?.patch || '', /MODE_RUN/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.productRole || '', /권한 경계/)
  assert.match(caseBlock?.affectedVersions || '', /1\.8\.2/)
  assert.match(caseBlock?.fixedVersions || '', /1\.9\.5p2/)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.after?.code || '', /from\[1\] != '\\0'/)
  assert.match(patchBlock?.after?.code || '', /size - \(to - user_args\) < 1/)
  assert.match(`${caseBlock?.condition} ${caseBlock?.facts.join(' ')}`, /권한 상승 절차를 제공하지 않습니다/)
  assert.doesNotMatch(`${caseBlock?.cause} ${caseBlock?.condition} ${caseBlock?.facts.join(' ')}`, /sudoedit\s+-s|exploit payload/i)
  assert.ok(week.labs.every((lab) => /합성|로컬|공개 source/.test(`${lab.title} ${lab.safeScope}`)))
})

test('display Week 07 assembly reading keeps ABI as a contract rather than an unverified CVE cause', () => {
  const week = weekContent[7]
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')

  assert.equal(week.curriculumId, 'week-8')
  assertSplitGuideModules(week, 'Week 07')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 07 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 3)
  assert.ok(blocks.filter((block) => block.type === 'code-trace').length >= 2)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2021-3156')
  assert.match(caseBlock?.cause || '', /특정 x86-64 ABI.*원인이라는 공식 근거는 없습니다/)
  assert.match(caseBlock?.affectedVersions || '', /1\.8\.2.*1\.8\.31p2.*1\.9\.5p1/)
  assert.match(caseBlock?.fixedVersions || '', /1\.9\.5p2/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.after?.code || '', /EDIT_VALID_FLAGS MODE_NONINTERACTIVE/)
  assert.match(patchBlock?.after?.code || '', /valid_flags = EDIT_VALID_FLAGS/)
  assert.match(patchBlock?.limitation || '', /실제 배포 binary의 instruction/)
  assert.doesNotMatch(`${caseBlock?.condition} ${caseBlock?.facts.join(' ')}`, /sudoedit\s+-s|shellcode/i)
})

test('display Week 08 debugger practice uses the xz record for provenance checks, not compromise reproduction', () => {
  const week = weekContent[8]
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')
  const impactBlock = blocks.find((block) => block.type === 'impact-map')

  assert.equal(week.curriculumId, 'week-9')
  assertSplitGuideModules(week, 'Week 08')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 08 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'code-trace').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2024-3094')
  assert.match(caseBlock?.productRole || '', /압축·해제.*liblzma/)
  assert.match(caseBlock?.affectedVersions || '', /5\.6\.0·5\.6\.1 release tarball/)
  assert.match(caseBlock?.fixedVersions || '', /5\.6\.2 clean release/)
  assert.match(caseBlock?.cause || '', /source package 생성.*Git 저장소에는 없었다/)
  assert.match(caseBlock?.condition || '', /trigger, payload, backdoor activation, 외부 연결을 재현하지 않고/)
  assert.match(caseBlock?.patch || '', /cleanup commit `e93e13c`.*5\.6\.2 release/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.before?.code || '', /lzma_resolver_attributes/)
  assert.match(patchBlock?.after?.code || '', /#ifdef CRC_USE_IFUNC/)
  assert.match(patchBlock?.after?.code || '', /__no_profile_instrument_function__/)
  assert.match(patchBlock?.limitation || '', /trigger code.*Git 저장소에 없었다/)
  assert.match(patchBlock?.limitation || '', /전용 보안 회귀 test가 추가되지 않았/)
  assert.match(impactBlock?.access?.defaultExposure || '', /release tarball.*Git repository/)
  assert.doesNotMatch(`${caseBlock?.condition} ${patchBlock?.limitation}`, /trigger code:\s|payload\s*=|remote\(/i)
})

test('display Week 09 memory safety connects the sudo patch to root-cause boundary checks and retests', () => {
  const week = weekContent[9]
  const module = week.modules.find((entry) => entry.id === 'w10-bounds')
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const moduleBlocks = getLessonBlocks(module)
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const traceBlock = moduleBlocks.find((block) => block.type === 'code-trace')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')
  const mitigationBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w10-mitigations'))
  const defenseTable = mitigationBlocks.find((block) => block.id === 'w10-mitigations-defense-layers')
  const retestBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w10-retest'))
  const retestTrace = retestBlocks.find((block) => block.type === 'code-trace')

  assert.equal(week.curriculumId, 'week-10')
  assertSplitGuideModules(week, 'Week 09')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 09 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'code-trace').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2021-3156')
  assert.match(caseBlock?.productRole || '', /privileged Unix 프로그램/)
  assert.match(caseBlock?.affectedVersions || '', /1\.8\.2.*1\.8\.31p2.*1\.9\.5p1/)
  assert.match(caseBlock?.fixedVersions || '', /1\.8\.32.*1\.9\.5p2/)
  assert.match(caseBlock?.cause || '', /길이·용량·안전한 실패 처리/)
  assert.match(caseBlock?.cause || '', /`\*to\+\+` write 전에.*capacity/)
  assert.match(caseBlock?.patch || '', /Canary·NX·ASLR·PIE는 root fix의 대체물이 아닙니다/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(traceBlock?.code || '', /dst\[length\] = '\\0'/)
  assert.match(traceBlock?.trace?.[2]?.after || '', /객체 경계를 처음 벗어난 정확한 실패·효과 지점/)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.after?.code || '', /ISSET\(sudo_mode, MODE_RUN\)/)
  assert.match(patchBlock?.after?.code || '', /from\[1\] != '\\0'/)
  assert.match(patchBlock?.after?.code || '', /size - \(to - user_args\) < 1/)
  assert.match(patchBlock?.limitation || '', /실제 argument payload.*권한 상승 절차는 재현하지 않습니다/)
  assert.deepEqual(defenseTable?.rows?.map((row) => row[0]), ['Code', 'Build·config', 'Permission', 'Log·monitoring', 'Test'])
  assert.match(retestTrace?.code || '', /ERR_TOO_LONG/)
  assert.match(retestTrace?.code || '', /raw_input == ABSENT/)
  assert.doesNotMatch(`${caseBlock?.condition} ${patchBlock?.limitation}`, /sudoedit\s+-s|shellcode|heap grooming 절차/i)
})

test('display Week 10 checks AI claims against the official xz supply-chain record', () => {
  const week = weekContent[10]
  const module = week.modules.find((entry) => entry.id === 'w11-ai-claims')
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const moduleBlocks = getLessonBlocks(module)
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const claimTrace = moduleBlocks.find((block) => block.type === 'code-trace')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')
  const triageBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w11-local-triage'))
  const triageTrace = triageBlocks.find((block) => block.type === 'code-trace')
  const retestBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w11-retest'))
  const verificationTable = retestBlocks.find((block) => block.id === 'w11-retest-defense-layers')

  assert.equal(week.curriculumId, 'week-11')
  assertSplitGuideModules(week, 'Week 10')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 10 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'code-trace').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2024-3094')
  assert.match(caseBlock?.productRole || '', /liblzma/)
  assert.match(caseBlock?.affectedVersions || '', /5\.6\.0·5\.6\.1 release tarball/)
  assert.match(caseBlock?.fixedVersions || '', /5\.6\.2 clean release/)
  assert.match(caseBlock?.cause || '', /source package 생성.*Git repository에는 없었다/)
  assert.match(caseBlock?.patch || '', /cleanup commit `e93e13c`.*5\.6\.2 release/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.match(caseBlock?.condition || '', /악성 build artifact, trigger, payload, backdoor, 원격 연결을 재현하지 않고/)
  assert.match(claimTrace?.code || '', /C2.*trigger was fully present in Git/)
  assert.match(claimTrace?.code || '', /C4.*every host with xz was remotely exposed/)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.before?.code || '', /lzma_resolver_attributes/)
  assert.match(patchBlock?.after?.code || '', /#ifdef CRC_USE_IFUNC/)
  assert.match(patchBlock?.limitation || '', /전체 trigger source가 아닙니다/)
  assert.match(triageTrace?.code || '', /checksum\(body, declared\)/)
  assert.match(triageTrace?.trace?.[2]?.after || '', /정확한 실패·효과 지점/)
  assert.deepEqual(verificationTable?.rows?.map((row) => row[0]), ['Code', 'Build·config', 'Permission', 'Log', 'Test'])
  assert.doesNotMatch(`${caseBlock?.condition} ${patchBlock?.limitation}`, /payload\s*=|remote\(|service activation 절차/i)
})

test('display Week 11 connects SSH integrity boundaries to Terrapin and the OpenSSH 9.6 fix', () => {
  const week = weekContent[11]
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')
  const impactBlock = blocks.find((block) => block.type === 'impact-map')
  const preservationBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w12-evidence-preservation'))
  const custodyTrace = preservationBlocks.find((block) => block.type === 'code-trace')
  const interpretationBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w12-forensic-interpretation'))
  const controlTable = interpretationBlocks.find((block) => block.id === 'w12-forensic-interpretation-control-layers')

  assert.equal(week.curriculumId, 'week-12')
  assertSplitGuideModules(week, 'Week 11')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 11 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'code-trace').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2023-48795')
  assert.match(caseBlock?.productRole || '', /secure remote login.*command execution.*file transfer/)
  assert.match(caseBlock?.affectedVersions || '', /OpenSSH 9\.6 이전.*strict KEX/)
  assert.match(caseBlock?.fixedVersions || '', /OpenSSH 9\.6.*양 끝/)
  assert.match(caseBlock?.cause || '', /sequence number.*NEWKEYS/)
  assert.match(caseBlock?.cause || '', /active MITM/)
  assert.match(caseBlock?.condition || '', /packet 변조·삽입·삭제.*MITM traffic.*포함하지 않고/)
  assert.match(caseBlock?.patch || '', /OpenSSH 9\.6.*initial KEXINIT.*sequence를 0으로 reset/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.before?.code || '', /\+\+state->p_send\.seqnr/)
  assert.match(patchBlock?.after?.code || '', /type == SSH2_MSG_NEWKEYS && ssh->kex->kex_strict/)
  assert.match(patchBlock?.after?.code || '', /state->p_send\.seqnr = 0/)
  assert.match(patchBlock?.limitation || '', /전용 regression test file을 추가하지 않았/)
  assert.match(impactBlock?.intro || '', /C:N, I:H, A:N/)
  assert.match(custodyTrace?.code || '', /original_digest.*copy_digest.*digest_match/s)
  assert.deepEqual(controlTable?.rows?.map((row) => row[0]), ['Code', 'Config', 'Permission', 'Log', 'Test'])
  assert.doesNotMatch(`${caseBlock?.condition} ${patchBlock?.limitation}`, /mitmproxy|packet payload|private key value/i)
})

test('display Week 12 limits HTTP/2 Rapid Reset learning to PCAP evidence, patch guidance, and resource controls', () => {
  const week = weekContent[12]
  const module = week.modules.find((entry) => entry.id === 'w13-pcap-scope')
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const moduleBlocks = getLessonBlocks(module)
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')
  const impactBlock = blocks.find((block) => block.type === 'impact-map')
  const manifestTrace = moduleBlocks.find((block) => block.id === 'w13-pcap-scope-manifest-trace')
  const reportingBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w13-network-reporting'))
  const controlTable = reportingBlocks.find((block) => block.id === 'w13-network-reporting-control-layers')

  assert.equal(week.curriculumId, 'week-13')
  assertSplitGuideModules(week, 'Week 12')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 12 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 4)
  assert.equal(blocks.filter((block) => block.type === 'code-trace').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2023-44487')
  assert.match(caseBlock?.productRole || '', /HTTP\/2 framing.*C library.*server.*reverse proxy/)
  assert.match(caseBlock?.affectedVersions || '', /1\.57\.0 미만.*<1\.57\.0.*server use/)
  assert.match(caseBlock?.fixedVersions || '', /nghttp2 1\.57\.0.*공급자.*patch release/)
  assert.match(caseBlock?.cause || '', /HEADERS 직후 RST_STREAM.*concurrent open-stream 제한/)
  assert.match(caseBlock?.condition || '', /remote unauthenticated client.*대량 요청.*하지 않고/)
  assert.match(caseBlock?.patch || '', /commit `72b4af6`.*token bucket.*GOAWAY.*CUnit regression tests/)
  assert.match(caseBlock?.followOn || '', /검증되지 않아 미채택/)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.before?.code || '', /return 0/)
  assert.match(patchBlock?.after?.code || '', /session_update_stream_reset_ratelim/)
  assert.match(patchBlock?.after?.code || '', /nghttp2_ratelim_drain/)
  assert.match(patchBlock?.after?.code || '', /NGHTTP2_GOAWAY/)
  assert.match(patchBlock?.regressionTests?.map((entry) => entry.case).join(' ') || '', /ratelim_update.*ratelim_drain.*session reset test/)
  assert.match(patchBlock?.limitation || '', /nghttp2에만 적용.*대량 stream·RST_STREAM 생성 code.*제공하지 않습니다/s)
  assert.match(impactBlock?.intro || '', /AV:N\/AC:L\/PR:N\/UI:N\/S:U\/C:N\/I:N\/A:H/)
  assert.match(manifestTrace?.code || '', /capture_point: synthetic_client_side.*scope_limit: no_server_logs_no_other_segments/s)
  assert.deepEqual(controlTable?.rows?.map((row) => row[0]), ['Code', 'Config', 'Permission', 'Log', 'Test'])
  assert.doesNotMatch(`${caseBlock?.condition} ${patchBlock?.limitation}`, /request generator|exploit payload|external target|credential/i)
})

test('display Week 13 uses the Wasmtime fuzzing record with its explicit patch releases and evidence limit', () => {
  const week = weekContent[13]
  const module = week.modules.find((entry) => entry.id === 'w14-fuzzing-model')
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const moduleBlocks = getLessonBlocks(module)
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')
  const impactBlock = blocks.find((block) => block.type === 'impact-map')
  const harnessTrace = moduleBlocks.find((block) => block.id === 'w14-fuzzing-model-harness-trace')
  const minimizeBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w14-minimize-retest'))
  const controlTable = minimizeBlocks.find((block) => block.id === 'w14-minimize-retest-control-layers')

  assert.equal(week.curriculumId, 'week-14')
  assertSplitGuideModules(week, 'Week 13')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 13 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 4)
  assert.equal(blocks.filter((block) => block.type === 'code-trace').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2024-47763')
  assert.match(caseBlock?.productRole || '', /WebAssembly module·component.*host application.*runtime/)
  assert.match(caseBlock?.affectedVersions || '', /21\.0\.0.*25\.0\.1.*12\.0\.x–20\.0\.x.*명시적으로 enabled/)
  assert.match(caseBlock?.fixedVersions || '', /21\.0\.2, 22\.0\.1, 23\.0\.3, 24\.0\.1, 25\.0\.2/)
  assert.match(caseBlock?.cause || '', /return_call.*entry·exit trampoline.*Wasm frame이 0개.*loop/s)
  assert.match(caseBlock?.condition || '', /module·component를 실행할 권한.*tail calls가 enabled.*실행하지 않고/s)
  assert.match(caseBlock?.patch || '', /reached_entry_sp.*ControlFlow::Continue.*de3a581.*네 tail-call regression tests/s)
  assert.match(caseBlock?.followOn || '', /routine OSS-Fuzz.*야생 악용 evidence가 없음.*검증되지 않아 미채택/s)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.source?.url || '', /de3a5815d680f31473d8cb0eda9eb09708221480/)
  assert.match(patchBlock?.before?.code || '', /assert_entry_sp_is_aligned\(trampoline_sp\);\n\nloop \{/)
  assert.match(patchBlock?.after?.code || '', /reached_entry_sp\(fp, trampoline_sp\).*ControlFlow::Continue\(\(\)\)/s)
  assert.match(patchBlock?.regressionTests?.map((entry) => entry.case).join(' ') || '', /tail_call_to_imported_function.*tail_call_to_imported_function_in_start_function.*return_call_ref_to_imported_function.*return_call_indirect_to_imported_function/)
  assert.match(patchBlock?.limitation || '', /25\.0\.x backport.*실제 Wasm·crash payload.*실행하지 않습니다/s)
  assert.match(impactBlock?.intro || '', /AV:L\/AC:L\/PR:L\/UI:N\/S:U\/C:N\/I:N\/A:H, 5\.5/)
  assert.match(harnessTrace?.code || '', /MAX_INPUT = 64.*parse_training_record.*stable_digest/s)
  assert.deepEqual(controlTable?.rows?.map((row) => row[0]), ['Code', 'Config', 'Permission', 'Log', 'Test'])
  assert.doesNotMatch(`${caseBlock?.condition} ${patchBlock?.limitation}`, /curl|wasmtime run|base64 payload|external host|credential value/i)
})

test('display Week 14 separates Azure Arc patching from customer IAM responsibilities', () => {
  const week = weekContent[14]
  const module = week.modules.find((entry) => entry.id === 'w15-shared-responsibility')
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const moduleBlocks = getLessonBlocks(module)
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')
  const impactBlock = blocks.find((block) => block.type === 'impact-map')
  const responsibilityTrace = moduleBlocks.find((block) => block.id === 'w15-shared-responsibility-card-trace')
  const iamBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w15-iam-least-privilege'))
  const iamTrace = iamBlocks.find((block) => block.id === 'w15-iam-least-privilege-evaluator-trace')
  const controlTable = iamBlocks.find((block) => block.id === 'w15-iam-least-privilege-control-layers')
  const cloudGoatBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w15-isolated-cloudgoat'))
  const cloudGoatTrace = cloudGoatBlocks.find((block) => block.id === 'w15-isolated-cloudgoat-scope-trace')

  assert.equal(week.curriculumId, 'week-15')
  assertSplitGuideModules(week, 'Week 14')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 14 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 4)
  assert.equal(blocks.filter((block) => block.type === 'code-trace').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2022-37968')
  assert.match(caseBlock?.productRole || '', /Cluster Connect.*local proxy.*in-cluster agents.*Kubernetes apiserver/s)
  assert.match(caseBlock?.affectedVersions || '', /1\.5\.8.*1\.6\.19.*1\.7\.18.*1\.8\.11.*2\.2\.2088\.5593/s)
  assert.match(caseBlock?.fixedVersions || '', /1\.5\.8\+.*1\.6\.19\+.*1\.7\.18\+.*1\.8\.11\+.*2209.*2\.2\.2088\.5593\+/s)
  assert.match(caseBlock?.cause || '', /unauthenticated user.*cluster-admin.*source line을 공개하지 않았으므로.*추정하지 않습니다/s)
  assert.match(caseBlock?.condition || '', /randomly generated external DNS endpoint.*영향 agent.*endpoint discovery.*live cluster/s)
  assert.match(caseBlock?.patch || '', /1\.5\.8, 1\.6\.19, 1\.7\.18, 1\.8\.11.*2\.2\.2088\.5593.*auto-upgrade.*effective version/s)
  assert.match(caseBlock?.followOn || '', /RBAC 최소 권한·logging.*vendor security update의 대체가 아닙니다.*검증되지 않아 미채택/s)
  assert.equal(patchBlock?.evidenceKind, 'official-remediation')
  assert.match(patchBlock?.source?.url || '', /api\.msrc\.microsoft\.com\/cvrf\/v3\.0\/cvrf\/2022-Oct/)
  assert.match(patchBlock?.before?.code || '', /12092.*12091.*12089.*12090.*12093.*"Type": 3/s)
  assert.match(patchBlock?.after?.code || '', /"FixedBuild":"1\.5\.8".*"FixedBuild":"1\.6\.19".*"FixedBuild":"1\.7\.18".*"FixedBuild":"1\.8\.11".*"FixedBuild":"2\.2\.2088\.5593"/s)
  assert.match(patchBlock?.changes?.join(' ') || '', /auto-upgrade.*effective agent version.*내부 source code.*공개하지 않았으므로/s)
  assert.match(patchBlock?.regressionTests?.map((entry) => entry.case).join(' ') || '', /공개 vendor test corpus 확인.*Arc agent version threshold.*unauthenticated negative authorization.*authorized operator baseline.*Azure Stack Edge build threshold/s)
  assert.match(patchBlock?.limitation || '', /source-code diff가 아닙니다.*내부 root cause.*live endpoint discovery.*upgrade command 실행을 제공하지 않으며/s)
  assert.match(impactBlock?.intro || '', /AV:N\/AC:L\/PR:N\/UI:N\/S:C\/C:H\/I:H\/A:H, 10\.0/)
  assert.match(responsibilityTrace?.code || '', /TRAINING-REPORT-STORE.*provider:.*customer:.*shared:.*no_live_account_no_provider_audit_conclusion/s)
  assert.match(iamTrace?.code || '', /identity_allow.*resource_allow.*boundary_allow.*organization_allow.*explicit_deny.*decision = "Deny"/s)
  assert.deepEqual(controlTable?.rows?.map((row) => row[0]), ['Code', 'Config', 'Permission', 'Log', 'Test'])
  assert.match(cloudGoatTrace?.code || '', /isolated_training_account: not_provided_by_this_course.*decision: DO_NOT_EXECUTE.*read_official_scope_and_write_checklist_only/s)
  assert.doesNotMatch(`${caseBlock?.condition} ${patchBlock?.limitation} ${cloudGoatTrace?.code}`, /curl|kubectl|aws configure|terraform apply|credential value|external target/i)
})

test('display Week 15 connects agent state boundaries to the release LlamaIndex patch without reproducing the payload', () => {
  const week = weekContent[15]
  const module = week.modules.find((entry) => entry.id === 'w16-agent-boundaries')
  const blocks = week.modules.flatMap((entry) => getLessonBlocks(entry))
  const moduleBlocks = getLessonBlocks(module)
  const caseBlock = blocks.find((block) => block.type === 'cve-case')
  const patchBlock = blocks.find((block) => block.type === 'patch-analysis')
  const impactBlock = blocks.find((block) => block.type === 'impact-map')
  const boundaryTrace = moduleBlocks.find((block) => block.id === 'w16-agent-boundaries-state-trace')
  const controlBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w16-agent-controls'))
  const policyTrace = controlBlocks.find((block) => block.id === 'w16-agent-controls-policy-trace')
  const controlTable = controlBlocks.find((block) => block.id === 'w16-agent-controls-layer-comparison')
  const threatModelBlocks = getLessonBlocks(week.modules.find((entry) => entry.id === 'w16-final-threat-model'))
  const threatModelTrace = threatModelBlocks.find((block) => block.id === 'w16-final-threat-model-record-trace')

  assert.equal(week.curriculumId, 'week-16')
  assertSplitGuideModules(week, 'Week 15')
  assert.ok(week.modules.every((entry) => validateLessonModule(entry).length === 0), 'every Week 15 module must satisfy the concept-code-CVE schema')
  assert.equal(blocks.filter((block) => block.type === 'mechanism').length, 4)
  assert.equal(blocks.filter((block) => block.type === 'code-trace').length, 3)
  assert.equal(blocks.filter((block) => block.type === 'patch-analysis').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'impact-map').length, 1)
  assert.equal(caseBlock?.cve, 'CVE-2024-3098')
  assert.match(caseBlock?.productRole || '', /PandasQueryEngine.*DataFrame preview.*LLM.*PandasInstructionParser.*Python text/s)
  assert.match(caseBlock?.affectedVersions || '', /0\.10\.24 미만.*PandasQueryEngine.*user-controlled input/s)
  assert.match(caseBlock?.fixedVersions || '', /0\.10\.24 이상.*2c92e88838a5f481d50840240b1dd3180066c6f5/s)
  assert.match(caseBlock?.cause || '', /return dunder_visitor\.has_access_to_private_entity.*getattr.*hasattr.*iter.*next.*setattr.*method restriction bypass/s)
  assert.match(caseBlock?.condition || '', /vulnerable <0\.10\.24.*safe_eval.*Python process permissions.*실행하지 않습니다/s)
  assert.match(caseBlock?.patch || '', /2c92e88.*위험 builtin 다섯 개.*Import·ImportFrom.*v0\.10\.24 upgrade/s)
  assert.match(caseBlock?.followOn || '', /CVE-2023-39662의 bypass.*arbitrary code execution.*production.*sandboxing.*0\.10\.24.*security sandbox/s)
  assert.equal(patchBlock?.evidenceKind, 'official-patch')
  assert.match(patchBlock?.source?.url || '', /commit\/2c92e88838a5f481d50840240b1dd3180066c6f5/)
  assert.match(patchBlock?.before?.code || '', /class DunderVisitor.*return dunder_visitor\.has_access_to_private_entity/s)
  assert.match(patchBlock?.after?.code || '', /has_access_to_disallowed_builtin.*globals\(\)\["__builtins__"\].*ast\.ImportFrom.*or imports_modules/s)
  assert.match(patchBlock?.changes?.join(' ') || '', /getattr.*hasattr.*iter.*next.*setattr.*NVD-linked `5fbcb5a`.*`2c92e88`/s)
  assert.match(patchBlock?.regressionTests?.map((entry) => entry.case).join(' ') || '', /test_default_output_processor_rce2.*test_default_output_processor_e2e.*test_default_output_processor_rce.*교육용 AST allow fixture.*교육용 AST deny fixtures/s)
  assert.match(patchBlock?.limitation || '', /실제 LlamaIndex source.*payload·실행 command는 싣지 않았습니다.*safe_eval.*실행하지 않습니다/s)
  assert.match(impactBlock?.intro || '', /CVSS:3\.0\/AV:N\/AC:L\/PR:N\/UI:N\/S:U\/C:H\/I:H\/A:H/)
  assert.match(boundaryTrace?.code || '', /instructions_authorized: false.*state: proposed.*adapter: MOCK_ONLY.*live_model_api_credentials_network_tools: absent/s)
  assert.match(policyTrace?.code || '', /toolAllowed.*argsValid.*userAuthorized.*adapterAuthorized.*ALLOW_ONCE.*MOCK_RESULTS/s)
  assert.deepEqual(controlTable?.rows?.map((row) => row[0]), ['Code', 'Config', 'Permission', 'Log', 'Test'])
  assert.match(threatModelTrace?.code || '', /data_cannot_grant_authority.*proposal_executed_without_allowlist_scope_or_approval.*all_negative_fixtures: DENY.*educational_fixture_not_production_assurance/s)
  assert.doesNotMatch(`${patchBlock?.before?.code} ${patchBlock?.after?.code} ${boundaryTrace?.code} ${policyTrace?.code}`, /__import__\(|os\.system|subclasses__|touch \/|curl |requests\.get|OPENAI_API_KEY/i)
})

test('display Week 03 through Week 15 satisfy the complete evidence, CVE, patch, and safe-code contract', () => {
  const displayWeeks = Array.from({ length: 13 }, (_, index) => index + 3)
  const moduleIds = []
  const blockIds = []
  const allowedLevels = new Set(['deep-guide-v3', 'concept-code-cve-v1', 'case-dossier-v1', 'patch-workshop-v1'])
  const allowedEvidenceKinds = new Set(['official-source', 'official-patch', 'official-remediation', 'standards-derived', 'educational-model'])
  const riskyEducationalCode = /curl\s+https?:|wget\s+https?:|nc\s+-|nmap\s|shellcode|AKIA[0-9A-Z]{16}|BEGIN PRIVATE KEY|os\.system\(|__import__\(/i

  assert.equal(EDUCATIONAL_CODE_NOTICE, '아래 코드는 실제 프로젝트 소스 코드가 아니라, 공식 취약점 설명과 패치 구조를 단순화한 재현용 예제이다.')

  displayWeeks.forEach((weekIndex) => {
    const week = weekContent[weekIndex]
    const weekBlocks = week.modules.flatMap((module) => getLessonBlocks(module))

    assert.ok(week, `display Week ${weekIndex} must exist`)
    assert.ok(week.modules.length > 0, `display Week ${weekIndex} must have modules`)
    assert.ok(week.modules.every((module) => allowedLevels.has(module.contentLevel)), `display Week ${weekIndex} must use an audited deep content level`)
    assert.ok(week.modules.every((module) => validateLessonModule(module).length === 0), `display Week ${weekIndex} modules must validate`)
    ;['mechanism', 'code-trace', 'cve-case', 'patch-analysis', 'impact-map'].forEach((type) => {
      assert.ok(weekBlocks.some((block) => block.type === type), `display Week ${weekIndex} must contain ${type}`)
    })

    week.modules.forEach((module) => {
      moduleIds.push(module.id)
      const blocks = getLessonBlocks(module)
      blocks.forEach((block) => {
        if (block.id) blockIds.push(block.id)
        if (['code-trace', 'patch-analysis'].includes(block.type)) {
          assert.ok(allowedEvidenceKinds.has(block.evidenceKind), `${module.id}/${block.id || block.title} must declare its evidence kind`)
          if (block.evidenceKind !== 'educational-model') {
            assert.match(block.source?.url || '', /^https:\/\//, `${module.id}/${block.id || block.title} must link its official evidence`)
          }
          if (block.evidenceKind === 'educational-model') {
            const code = [block.code, block.before?.code, block.after?.code].filter(Boolean).join('\n')
            assert.doesNotMatch(code, riskyEducationalCode, `${module.id}/${block.id || block.title} must remain a non-operational local model`)
          }
        }
      })

      const cveBlocks = blocks.filter((block) => block.type === 'cve-case')
      cveBlocks.forEach((block) => {
        assert.match(block.cve, /^CVE-\d{4}-\d+$/)
        assert.ok(block.productRole && block.weakness && block.affectedVersions && block.fixedVersions, `${module.id}/${block.cve} must state product role, weakness, affected, and fixed versions`)
        assert.ok(block.sources.every((source) => /^https:\/\//.test(source.url)), `${module.id}/${block.cve} must use linked public evidence`)
      })
      if (cveBlocks.length) {
        const hasLocalPatch = blocks.some((block) => block.type === 'patch-analysis')
        const hasLinkedPatchWorkshop = module.contentLevel === 'case-dossier-v1' && week.modules.some((candidate) => {
          const candidateBlocks = getLessonBlocks(candidate)
          const lineageCves = new Set(candidateBlocks.filter((block) => block.type === 'patch-lineage').map((block) => block.cve))
          return candidate.contentLevel === 'patch-workshop-v1'
            && candidateBlocks.some((block) => block.type === 'patch-analysis')
            && cveBlocks.every((block) => lineageCves.has(block.cve))
        })
        assert.ok(hasLocalPatch || hasLinkedPatchWorkshop, `${module.id} CVE case must include or link to a patch or explicit remediation analysis`)
        assert.ok(blocks.some((block) => block.type === 'impact-map'), `${module.id} CVE case must include conditional CIA impact`)
      }
    })
  })

  assert.equal(new Set(moduleIds).size, moduleIds.length, 'display Week 03–15 module IDs must remain unique')
  assert.equal(new Set(blockIds).size, blockIds.length, 'display Week 03–15 block IDs must remain unique')
})
