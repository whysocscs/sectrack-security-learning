# Week 0-3 Content and Design Report

## Scope

This change keeps the 16-week roadmap, the Week 0-3 module and lab IDs, the required or extension paths, and browser-local learning data. It turns the first four learning weeks into a field-manual flow:

1. Read a Technical Reader module.
2. Complete only fixed, local training activities.
3. Record an observation separately from an interpretation.
4. Continue to the existing official external practice when the learner is ready.
5. Use the weekly quiz and record page for a second concept check.

`CodeCureLAB` is the fixed fictional case across these materials. It is not a real host, account, or target.

## Content Delivery

| Week | Modules | Activities | Required / extension time | Main outcome |
| --- | ---: | ---: | --- | --- |
| 0 | 6 | 3 | 255 / 0 min | Security Charter and career map |
| 1 | 6 | 4 | 420 / 120 min | Linux Investigation Notebook 01 |
| 2 | 8 | 4 | 385 / 265 min | Linux Investigation Notebook 02 |
| 3 | 9 | 6 | 695 / 35 min | Web Request Flow Report and Week 4 handoff |

Every Week 0-3 lesson now uses ordered content blocks for a learning question, explanation, realistic fixed output, comparison, misconception or warning, two checkpoints, work context, linked practice, official sources, and a summary. The legacy lesson fields remain available through the renderer fallback.

Week 1 keeps the read-only virtual Linux shell, command history, hidden-file exercise, `find` plus `grep` exercise, and Tab completion. Week 2 frames curl, DevTools, and Burp as normal-request observation tools rather than mutation tools. Week 3 adds the required `w3-tool-triangle` activity; all three panes are fixed training messages with no network request or value mutation.

## Career Evidence

The Career Evidence Explorer shows all 12 job families in React Flow before a learner chooses a family. Selecting a family reveals its roles, and selecting a role adds connected concepts, technologies, and standards. The evidence table separates career guides, fair profiles, and individual vacancies.

No current-job count, active-status claim, or unverified individual vacancy was added. Roles without a verified individual posting use `unavailable` or `unknown` evidence states instead.

## Data Compatibility

- Existing module and lab IDs are protected by the Week 0-3 ID snapshot test.
- Checkpoint answers are stored under the existing local progress structure and are merged without discarding unknown data.
- Existing localStorage migration and malformed-data recovery behavior remain covered by the storage tests.
- A lab color preference is stored only on that lab's local state. It does not alter success, warning, or danger semantics.

## Design and Accessibility

The site now uses different page grammars instead of a universal dashboard card pattern: a command-center home, phased roadmap spine, mission brief, technical reader, security workbench, career evidence explorer, and analyst document editor.

The final accessibility pass raised the sidebar and reader-accent contrast to WCAG AA levels and made horizontally scrollable comparison tables keyboard focusable. The browser test covers desktop and mobile layouts, reduced motion, the 150% in-app font setting, a 200% Chromium visual page scale, keyboard focus on the comparison table, deep links, the required tool-triangle activity, React Flow expansion, and axe serious or critical violations.

## Representative Screens

- `screenshots/after-week0-3/home-1920x1080.png`
- `screenshots/after-week0-3/roadmap-1440x900.png`
- `screenshots/after-week0-3/week2-reader-1280x720.png`
- `screenshots/after-week0-3/tool-triangle-1024x768.png`
- `screenshots/after-week0-3/career-graph-mobile-390x844.png`

## Verification Performed

| Check | Result |
| --- | --- |
| `npm run lint` | passed |
| `npm test` | passed, 38 tests |
| `npm run test:browser` | passed, 12 Playwright checks across desktop and mobile Chromium |
| `npm run build -- --base=/sectrack-security-learning/` | passed |
| Pages-base preview | passed at `/sectrack-security-learning/#/learn/week/3/concepts/w3-http` with base-prefixed asset path |

The Vite build reports one informational chunk-size warning: the initial JavaScript bundle is 860.46 kB minified after React Flow and the expanded lesson content are included. It does not block the build; route-level code splitting is a separate performance follow-up.
