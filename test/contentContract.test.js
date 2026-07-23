import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EXPECTED_CONTENT_INVENTORY,
  buildContentInventory,
  buildRouteManifest,
  formatContentValidation,
  loadContractWeeks,
  validateContentContracts,
} from '../scripts/content-contract.mjs'
import { weekContent } from '../src/courseData.js'

test('the learner-visible curriculum satisfies the exhaustive content contract', async () => {
  const result = await validateContentContracts()
  assert.equal(result.valid, true, formatContentValidation(result, { maxErrors: 40 }))
  assert.deepEqual(
    Object.fromEntries(Object.keys(EXPECTED_CONTENT_INVENTORY).map((key) => [key, result.stats[key]])),
    EXPECTED_CONTENT_INVENTORY,
  )
})

test('the generated direct-route manifest covers every module, lab, quiz, and record once', async () => {
  const weeks = await loadContractWeeks()
  const inventory = buildContentInventory({ weeks })
  const manifest = buildRouteManifest({ weeks })

  assert.equal(manifest.weeks.length, EXPECTED_CONTENT_INVENTORY.weeks)
  assert.equal(manifest.modules.length, EXPECTED_CONTENT_INVENTORY.modules)
  assert.equal(manifest.labs.length, EXPECTED_CONTENT_INVENTORY.labs)
  assert.equal(manifest.quizzes.length, EXPECTED_CONTENT_INVENTORY.quizRoutes)
  assert.equal(manifest.records.length, EXPECTED_CONTENT_INVENTORY.recordRoutes)
  assert.equal(new Set(manifest.modules.map((route) => route.hash)).size, manifest.modules.length)
  assert.equal(new Set(manifest.labs.map((route) => route.hash)).size, manifest.labs.length)
  assert.equal(inventory.checkpoints.length, EXPECTED_CONTENT_INVENTORY.checkpoints)
})

test('an authored generic code block without sourceType fails the build contract before normalization', async () => {
  const targetWeek = weekContent[0]
  const targetModule = targetWeek.modules.find((module) => module.id === 'w0-language')
  const targetBlock = targetModule.blocks.find((block) => block.type === 'terminal')
  const unclassifiedBlock = { ...targetBlock }
  delete unclassifiedBlock.sourceType
  const weeks = {
    ...weekContent,
    0: {
      ...targetWeek,
      modules: targetWeek.modules.map((module) => module.id === targetModule.id
        ? { ...module, blocks: module.blocks.map((block) => block === targetBlock ? unclassifiedBlock : block) }
        : module),
    },
  }
  const result = await validateContentContracts({ weeks })
  assert.equal(result.valid, false)
  assert.ok(result.errors.some((error) => error.code === 'RAW_CODE_PROVENANCE' && error.path.includes('w0-language')))
})
