export const WEEK_0_TO_3_ID_SNAPSHOT = Object.freeze({
  modules: Object.freeze([
    'w1-shell', 'w1-filesystem', 'w1-navigation', 'w1-fileops', 'w1-permission', 'w1-ssh',
    'w2-streams', 'w2-curl', 'w2-process', 'w2-git',
    'w3-url-dns', 'w3-flow', 'w3-session', 'w3-dom', 'w3-auth-origin',
  ]),
  labs: Object.freeze([
    'w1-treasure', 'w1-command-ctf', 'w1-bandit',
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
