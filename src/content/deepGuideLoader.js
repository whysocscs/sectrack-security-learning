import { enrichCveLearningDossiers } from './cveLearningDossiers.js'
import { applyLoadedModuleArchitecture } from './curriculumArchitecture.js'
import { applyContentOverrides } from './contentOverrides.js'

const guideLoaders = Object.freeze({
  3: () => Promise.all([
    import('./week6MemoryDeepDive.js'),
    import('./week7AssemblyDeepDive.js'),
    import('./week8DebuggerDeepDive.js'),
  ]).then(([memory, assembly, debuggerGuide]) => ({
    kind: 'modules',
    build: (modules) => debuggerGuide.buildWeek8DebuggerGuide(assembly.buildWeek7AssemblyGuide(memory.buildWeek6MemoryGuide(modules))),
  })),
  4: () => Promise.all([
    import('./week9MemorySafetyDeepDive.js'),
    import('./week10AiVerificationDeepDive.js'),
  ]).then(([memorySafety, aiVerification]) => ({
    kind: 'modules',
    build: (modules) => aiVerification.buildWeek10AiVerificationGuide(memorySafety.buildWeek9MemorySafetyGuide(modules)),
  })),
  5: () => import('./week11CryptoForensicsDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek11CryptoForensicsGuide })),
  6: () => import('./week12NetworkDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek12NetworkGuide })),
  7: () => import('./week13FuzzingDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek13FuzzingGuide })),
  8: () => import('./week14CloudIamDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek14CloudIamGuide })),
  10: () => import('./week15AgentSecurityDeepDive.js').then((module) => ({ kind: 'modules', build: module.buildWeek15AgentSecurityGuide })),
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
