import test from 'node:test'
import assert from 'node:assert/strict'
import { applyContentOverrides } from '../src/content/contentOverrides.js'
import {
  removeModuleOverride,
  removePageTextOverride,
  updateOverrideDocument,
  updatePageTextOverrideDocument,
} from '../scripts/local-content-authoring.mjs'

test('content overrides replace editable module content without changing the base module id', () => {
  const baseModules = [{
    id: 'w1-example',
    title: '원래 제목',
    summary: '원래 요약',
    blocks: [{ id: 'intro', type: 'explanation', paragraphs: ['원래 문단'] }],
  }]
  const overrides = {
    version: 1,
    modules: {
      'w1-example': {
        module: { id: 'changed-id', title: '수정 제목', summary: '수정 요약' },
        blocks: [{ id: 'intro', type: 'explanation', paragraphs: ['수정 문단'] }],
      },
    },
  }

  const [result] = applyContentOverrides(baseModules, overrides)

  assert.equal(result.id, 'w1-example')
  assert.equal(result.title, '수정 제목')
  assert.deepEqual(result.blocks[0].paragraphs, ['수정 문단'])
  result.blocks[0].paragraphs[0] = '별도 변경'
  assert.equal(overrides.modules['w1-example'].blocks[0].paragraphs[0], '수정 문단')
  assert.equal(baseModules[0].title, '원래 제목')
})

test('local authoring document keeps only supported module fields and removes one explicit module', () => {
  const emptyDocument = { version: 1, modules: {} }
  const updated = updateOverrideDocument(emptyDocument, {
    moduleId: 'w1-example',
    module: {
      title: '화면에서 수정한 제목',
      summary: '화면에서 수정한 요약',
      learningQuestion: '',
      id: 'ignored',
    },
    blocks: [{ id: 'intro', type: 'explanation', paragraphs: ['수정 문단'] }],
  })

  assert.deepEqual(updated.modules['w1-example'].module, {
    title: '화면에서 수정한 제목',
    summary: '화면에서 수정한 요약',
    learningQuestion: '',
  })
  assert.deepEqual(removeModuleOverride(updated, 'w1-example'), { version: 1, modules: {} })
  assert.deepEqual(emptyDocument, { version: 1, modules: {} })
})

test('local authoring rejects invalid targets and blocks without a type', () => {
  const document = { version: 1, modules: {} }
  assert.throws(() => updateOverrideDocument(document, {
    moduleId: '../outside',
    module: { title: '제목', summary: '요약' },
    blocks: [{ type: 'explanation', paragraphs: ['본문'] }],
  }), /모듈 ID/)
  assert.throws(() => updateOverrideDocument(document, {
    moduleId: 'w1-example',
    module: { title: '제목', summary: '요약' },
    blocks: [{ paragraphs: ['본문'] }],
  }), /학습 블록/)
})

test('page text overrides are route-scoped and keep separate base text at one dynamic location', () => {
  const document = { version: 1, modules: {}, pageText: {} }
  const asset = {
    routeKey: '#/learn/week/0/glossary',
    selector: '#main-content > div > article > h2',
    nodeIndex: 0,
    baseText: '자산',
    text: '보호 자산',
  }
  const threat = {
    ...asset,
    baseText: '위협',
    text: '보안 위협',
  }

  const withAsset = updatePageTextOverrideDocument(document, asset)
  const withBoth = updatePageTextOverrideDocument(withAsset, threat)

  assert.equal(withBoth.pageText['#/learn/week/0/glossary'].length, 2)
  assert.equal(withBoth.pageText['#/learn/week/0/glossary'][0].text, '보호 자산')
  assert.equal(withBoth.pageText['#/learn/week/0/glossary'][1].text, '보안 위협')
  assert.deepEqual(removePageTextOverride(withBoth, asset).pageText['#/learn/week/0/glossary'], [threat])
  assert.deepEqual(document, { version: 1, modules: {}, pageText: {} })
})

test('page text overrides reject non-route keys and multi-target selectors', () => {
  const document = { version: 1, modules: {}, pageText: {} }
  const candidate = {
    routeKey: '#/learn/week/0/glossary',
    selector: '#main-content h2',
    nodeIndex: 0,
    baseText: '자산',
    text: '보호 자산',
  }
  assert.throws(() => updatePageTextOverrideDocument(document, { ...candidate, routeKey: 'https://example.com' }), /페이지 경로/)
  assert.throws(() => updatePageTextOverrideDocument(document, { ...candidate, selector: 'h2, p' }), /선택자/)
})
