import localContentOverrides from './localContentOverrides.json' with { type: 'json' }

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function getPageTextOverrides(routeKey, overrides = localContentOverrides) {
  if (!isRecord(overrides?.pageText) || !Array.isArray(overrides.pageText[routeKey])) return []
  return overrides.pageText[routeKey]
}

export function resolvePageTextNode(root, entry) {
  if (!root || !entry || typeof entry.selector !== 'string') return null
  let element
  try {
    element = root.querySelector(entry.selector)
  } catch {
    return null
  }
  const node = element?.childNodes?.[entry.nodeIndex]
  return node?.nodeType === globalThis.Node?.TEXT_NODE ? node : null
}

export function applyPageTextOverrides(root, routeKey, overrides = localContentOverrides) {
  let applied = 0
  for (const entry of getPageTextOverrides(routeKey, overrides)) {
    const node = resolvePageTextNode(root, entry)
    if (!node || (node.data !== entry.baseText && node.data !== entry.text)) continue
    if (node.data !== entry.text) {
      node.data = entry.text
      applied += 1
    }
  }
  return applied
}

export { localContentOverrides }
