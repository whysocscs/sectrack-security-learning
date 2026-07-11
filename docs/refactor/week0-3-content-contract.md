# WEEK 0~3 Content Contract

## Compatibility boundary

- Existing Week 0~3 module and lab IDs are snapshotted in `src/content/week0to3Contract.js` and must remain resolvable.
- Existing `summary`, `paragraphs`, `terms`, `points`, and `steps` remain valid lesson content. A lesson renderer uses those fields as a fallback when a module has no ordered `blocks` array.
- New lesson completion evidence is stored under the existing per-module `moduleChecks` record. This is additive; schema v3's progress merge preserves old records and introduces no destructive localStorage migration.
- New content uses `CodeCureLAB` only as a fixed, fictional educational case. It contains no live host, credential, API key, or implication of testing permission.

## Phase 0 checks

1. Parse source files.
2. Confirm every snapshotted module and lab ID remains in `weekContent`.
3. Validate the new lesson block contract and legacy fallback behavior.

Full browser and build checks are deferred until content and the reader are integrated, as required by the master plan.
