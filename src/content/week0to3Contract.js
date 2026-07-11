export const WEEK_0_TO_3_ID_SNAPSHOT = Object.freeze({
  modules: Object.freeze([
    'w1-shell', 'w1-filesystem', 'w1-navigation', 'w1-fileops', 'w1-permission', 'w1-ssh',
    'w2-permissions', 'w2-streams', 'w2-text', 'w2-binary', 'w2-curl', 'w2-process', 'w2-git', 'w2-http-tools',
    'w3-flow', 'w3-url-dns', 'w3-encoding-body', 'w3-http', 'w3-headers', 'w3-session', 'w3-auth-origin', 'w3-browser-runtime', 'w3-dom',
  ]),
  labs: Object.freeze([
    'w1-treasure', 'w1-path', 'w1-ssh-flow', 'w1-bandit',
    'w2-permission-lab', 'w2-log-lab', 'w2-http-lab', 'w2-bandit',
    'w3-http-message', 'w3-timeline', 'w3-cookie', 'w3-source-sink', 'w3-threat-model',
  ]),
})

export const LEGACY_WEEK_ZERO_IDS = Object.freeze({
  modules: Object.freeze(['w0-platform', 'w0-ethics', 'w0-goals', 'w0-flow', 'w0-system']),
  labs: Object.freeze(['w0-roe', 'w0-baseline']),
})

export function findMissingSnapshotIds(weekContent) {
  const modules = new Set()
  const labs = new Set()
  for (const week of Object.values(weekContent || {})) {
    for (const module of week.modules || []) modules.add(module.id)
    for (const lab of week.labs || []) labs.add(lab.id)
  }
  return {
    modules: WEEK_0_TO_3_ID_SNAPSHOT.modules.filter((id) => !modules.has(id)),
    labs: WEEK_0_TO_3_ID_SNAPSHOT.labs.filter((id) => !labs.has(id)),
  }
}
