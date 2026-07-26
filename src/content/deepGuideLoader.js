import { enrichCveLearningDossiers } from './cveLearningDossiers.js'
import { applyLoadedModuleArchitecture } from './curriculumArchitecture.js'
import { applyContentOverrides } from './contentOverrides.js'

const guideLoaders = Object.freeze({
  3: () => import('./week3DeepDive.js').then((module) => ({ kind: 'block-map', build: module.buildWeek3DeepGuide })),
  4: () => import('./week4SqlDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek4SqlGuide })),
  5: () => import('./week5CsrfDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek5CsrfGuide })),
  6: () => import('./week6MemoryDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek6MemoryGuide })),
  7: () => import('./week7AssemblyDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek7AssemblyGuide })),
  8: () => import('./week8DebuggerDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek8DebuggerGuide })),
  9: () => import('./week9MemorySafetyDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek9MemorySafetyGuide })),
  10: () => import('./week10AiVerificationDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek10AiVerificationGuide })),
  11: () => import('./week11CryptoForensicsDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek11CryptoForensicsGuide })),
  12: () => import('./week12NetworkDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek12NetworkGuide })),
  13: () => import('./week13FuzzingDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek13FuzzingGuide })),
  14: () => import('./week14CloudIamDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek14CloudIamGuide })),
  15: () => import('./week15AgentSecurityDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek15AgentSecurityGuide })),
})

const moduleCache = new Map()

export function supportsDeepGuide(weekIndex) {
  return Boolean(guideLoaders[weekIndex])
}

export function loadDeepGuideModules(weekIndex, baseModules = []) {
  const load = guideLoaders[weekIndex]
  if (!load) return Promise.resolve(baseModules)
  if (moduleCache.has(weekIndex)) return moduleCache.get(weekIndex)

  const pending = load().then(({ kind, build }) => {
    if (kind === 'modules') return applyContentOverrides(applyLoadedModuleArchitecture(weekIndex, enrichCveLearningDossiers(build(baseModules))))
    const baseBlocks = Object.fromEntries(baseModules.map((module) => [module.id, module.blocks]))
    const blocksByModule = build(baseBlocks)
    return applyContentOverrides(applyLoadedModuleArchitecture(weekIndex, enrichCveLearningDossiers(baseModules.map((module) => ({ ...module, blocks: blocksByModule[module.id] || module.blocks })))))
  }).catch((error) => {
    moduleCache.delete(weekIndex)
    throw error
  })
  moduleCache.set(weekIndex, pending)
  return pending
}
