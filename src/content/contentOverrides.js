import localContentOverrides from './localContentOverrides.json' with { type: 'json' }

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cloneBlocks(blocks) {
  return blocks.map((block) => structuredClone(block))
}

export function applyContentOverrides(modules, overrides = localContentOverrides) {
  if (!Array.isArray(modules) || !isRecord(overrides?.modules)) return modules

  return modules.map((module) => {
    const override = overrides.modules[module.id]
    if (!isRecord(override)) return module

    const moduleFields = isRecord(override.module) ? override.module : {}
    const blocks = Array.isArray(override.blocks) ? cloneBlocks(override.blocks) : module.blocks

    return {
      ...module,
      ...moduleFields,
      id: module.id,
      ...(blocks ? { blocks } : {}),
    }
  })
}

export { localContentOverrides }
