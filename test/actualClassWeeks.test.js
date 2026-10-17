import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { quizzes, weekContent } from '../src/courseData.js'
import { validateLessonModule } from '../src/content/lessonSchema.js'

test('the public roadmap follows the actual Week 01, 02, 05, and 06 class record', () => {
  assert.match(weekContent[1].title, /OT/)
  assert.equal(weekContent[2].notTaught, true)
  assert.deepEqual(weekContent[2].modules, [])
  assert.deepEqual(weekContent[2].labs, [])
  assert.equal(weekContent[2].assessment, null)
  assert.equal(weekContent[2].weeklyRecord, null)
  assert.equal(quizzes[2], undefined)
  assert.match(weekContent[5].title, /DFIR/)
  assert.match(weekContent[6].title, /Suricata/)
})

test('PPT-derived class modules satisfy the learner-visible lesson schema', () => {
  for (const weekIndex of [1, 5, 6]) {
    for (const module of weekContent[weekIndex].modules) {
      assert.deepEqual(validateLessonModule(module), [], `${module.id} must be valid`)
    }
  }
})

test('Case 001 connects DFIR evidence to the Week 06 detection handoff', () => {
  const weekFiveText = JSON.stringify(weekContent[5])
  const weekSixText = JSON.stringify(weekContent[6])

  for (const expected of ['coreupdater.exe', 'fls', 'icat', 'Volatility', 'PCAP', 'EVTX', 'RDP']) {
    assert.match(weekFiveText, new RegExp(expected, 'i'))
  }
  for (const expected of ['Suricata', 'EVE JSON', 'Packet', 'Flow', 'Alert', 'sid:1000001', 'jq']) {
    assert.match(weekSixText, new RegExp(expected, 'i'))
  }
})

test('Week 05 and 06 retain the detailed explanations reconstructed from the source slides', () => {
  const weekFiveBlocks = weekContent[5].modules.flatMap((module) => module.blocks)
  const weekSixBlocks = weekContent[6].modules.flatMap((module) => module.blocks)
  const weekFiveText = JSON.stringify(weekFiveBlocks)
  const weekSixText = JSON.stringify(weekSixBlocks)

  assert.ok(weekFiveBlocks.length >= 45)
  assert.ok(weekSixBlocks.length >= 45)
  for (const expected of ['Autoruns', '718848', '87137-128-4', 'MFT', 'PE32+', 'windows.netscan', 'TerminalServices-LocalSessionManager', 'Event ID']) {
    assert.match(weekFiveText, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
  for (const expected of ['False Positive', '411797 packets', 'flow:established,to_server', 'http.uri', 'event_type', 'alerted', 'signature_id', 'Default와 Local']) {
    assert.match(weekSixText, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
})

test('the public PPT-derived source excludes direct personal identifiers and workspace links', async () => {
  const source = await readFile(new URL('../src/data/curriculum/actualClassWeeks.js', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\b(?:19|20)\d{7}\b/u)
  assert.doesNotMatch(source, /notion\.so/iu)
})
