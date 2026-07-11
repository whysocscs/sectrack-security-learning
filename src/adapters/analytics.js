/**
 * Local-personal analytics. Every value is derived from the supplied browser
 * state; this adapter never invents cohort or reviewer data.
 */
export function buildLocalLearningInsights(progress, weeks) {
  const allWeeks = Object.values(weeks)
  const allLabs = allWeeks.flatMap((week) => week.labs.map((lab) => ({ ...lab, week: week.index })))
  const labEntries = Object.entries(progress.labs || {})
  const friction = new Map()

  for (const [labId, state] of labEntries) {
    const hintLevel = Number(state.hintLevel || 0)
    if (hintLevel < 2) continue
    const lab = allLabs.find((item) => item.id === labId)
    for (const conceptId of lab?.relatedConceptIds || []) {
      const current = friction.get(conceptId) || { conceptId, hintSteps: 0, weekIds: new Set(), labIds: new Set() }
      current.hintSteps += hintLevel
      current.weekIds.add(lab.week)
      current.labIds.add(labId)
      friction.set(conceptId, current)
    }
  }

  return {
    attemptedLabs: labEntries.filter(([, state]) => state.status === 'attempted').length,
    completedLabs: labEntries.filter(([, state]) => state.status === 'completed').length,
    moduleNoteCount: Object.values(progress.moduleNotes || {}).filter((note) => String(note).trim()).length,
    weekRecordCount: Object.keys(progress.submissions || {}).length,
    lastActivityAt: progress.lastActivityAt || null,
    conceptFriction: [...friction.values()].map((item) => ({
      conceptId: item.conceptId,
      hintSteps: item.hintSteps,
      weekIds: [...item.weekIds].sort((a, b) => a - b),
      labIds: [...item.labIds],
    })).sort((a, b) => b.hintSteps - a.hintSteps),
  }
}
