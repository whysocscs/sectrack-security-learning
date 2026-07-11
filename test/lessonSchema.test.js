import assert from 'node:assert/strict'
import test from 'node:test'
import { weekContent } from '../src/courseData.js'
import { codeCureLab } from '../src/content/codeCureLab.js'
import { getLessonBlocks, validateLessonModule } from '../src/content/lessonSchema.js'
import { findMissingSnapshotIds } from '../src/content/week0to3Contract.js'

test('Week 0 to Week 3 IDs preserve the baseline contract', () => {
  assert.deepEqual(findMissingSnapshotIds(weekContent), { modules: [], labs: [] })
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

test('Week 0 to Week 3 modules use the complete ordered lesson contract', () => {
  const requiredTypes = ['question', 'explanation', 'comparison', 'misconception', 'practice-link', 'sources', 'summary']
  for (const module of [...weekContent[0].modules, ...weekContent[1].modules, ...weekContent[2].modules, ...weekContent[3].modules]) {
    const blocks = getLessonBlocks(module)
    const types = blocks.map((block) => block.type)
    assert.deepEqual(validateLessonModule(module), [], module.id)
    for (const type of requiredTypes) assert.ok(types.includes(type), `${module.id} is missing ${type}`)
    assert.ok(types.includes('terminal') || types.includes('code') || types.includes('http-message'), `${module.id} needs a transcript`)
    assert.ok(blocks.filter((block) => block.type === 'checkpoint').length >= 2, `${module.id} needs two checkpoints`)
  }
})
