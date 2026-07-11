# SecTrack Design Direction

## Product identity

SecTrack is a **Korean Security Field Manual** for students learning to observe systems, document evidence, and connect a technical finding to a real security job. It is a study product, not a marketing site and not a game. The interface should feel like a careful technical guide and a small, accountable piece of security work.

The shared Week 0 to Week 3 case is **CodeCureLAB**: a fictional campus service with student and staff sign-in, profile data, notices and search, assignment upload, an administrator area, Linux application servers, access and error logs, a cookie-based session, and browser JavaScript that updates the DOM. The case only supplies safe, fixed educational data. It must never imply permission to test a real service.

## Principles

1. Put questions, observations, source material, and outputs ahead of feature descriptions or decorative statistics.
2. Show the difference between a fact, an observation, a hypothesis, and a conclusion. A completed task is not automatically mastery.
3. Keep every exercise scoped to supplied data, local simulation, or an explicitly authorized training target.
4. Use status color only for meaning: success, warning, danger, and the learner-selected practice branch. Do not use color as the only indicator.
5. Preserve readability over density. Long lessons are documents, not stacks of cards.
6. Preserve existing routes, module IDs, lab IDs, and browser-stored progress.

## Visual foundations

- Korean UI and prose: `Pretendard`, `Inter`, and a system sans-serif fallback.
- Code, commands, HTTP messages, and paths: `JetBrains Mono`, `SFMono-Regular`, and a monospace fallback.
- Canvas: warm neutral. Document surface: white. Navigation: restrained dark charcoal. Primary accent: teal. Semantic colors remain separate from the accent.
- Baseline tokens: canvas `#f4f5f2`, surface `#ffffff`, ink `#16191d`, muted ink `#5a6169`, line `#d9ddd8`, accent `#147d80`, terminal `#121820`, success `#2f7757`, warning `#a96619`, danger `#a14444`.
- Corners are functional rather than decorative: 5px for compact controls, 8px for contained work surfaces, and 12px only for an elevated overlay.
- Interactive controls need a 44px target where space permits, visible keyboard focus, an accessible name, and a non-color state cue.

## Explicitly avoid

- Cyberpunk neon, hacker stock art, lock illustrations, or terminal noise used as decoration.
- Glass surfaces, gradient blobs, and oversized rounded cards.
- A bento grid used as the default layout for every page.
- Badge, streak, point, or chart decoration with no learning decision behind it.
- Body text smaller than 16px, or dense instructional paragraphs without a heading, example, or checkpoint.

## Page grammars

### Home: Learning Command Center

One next task is primary. Week progress, items to review, and unfinished deliverables support it. The flow is: next action, why it is next, start.

### Roadmap: Learning Spine

Use a vertical sequence with phase markers. A week exposes its key question, deliverable, required time, and extension time before secondary tags. Week 5 to Week 16 use the same reading pattern as Week 0 to Week 4.

### Week overview: Mission Brief

Start with the learning question and the week output. Keep the sequence visible: concepts, activities, understanding check, record. Required and extension work must be visibly distinct without treating extension work as failure.

### Lessons: Technical Reader

On desktop, lessons use a three-part reading layout: a module and section outline on the left (about 220px), a 760-820px reading column in the center, and a 240-280px reference panel on the right. The center column uses 16-18px body text and 1.7-1.85 line height. Section anchors are stable for deep links.

Terminal output and raw HTTP are evidence surfaces, not decorative code cards. Comparison tables retain their structure and scroll horizontally on narrow screens. Checkpoints belong in the reading flow. Reflection and mastery controls are collapsed at the end of a lesson.

On mobile, the outline becomes a selector or drawer and the reference panel moves below the lesson as accordions. Code may scroll horizontally; meaning must not be dropped merely to fit the viewport.

### Labs: Security Workbench

Use the same top-level contract across labs: objective, safe scope, and success criteria. The central area changes with the activity type: terminal, log, permissions, HTTP, DOM, or report evidence. Keep original/changed, expected/observed, and fact/interpretation comparable when applicable. Hints are progressive and never reveal a solution by default.

Learners may choose a branch/type color for a lab where it helps wayfinding. The choice is cosmetic, stored locally, and cannot replace a semantic warning or success state.

### Career map: Career Evidence Explorer

Provide two views. Graph View connects job family, role, concepts, technologies, standards, and industries. Evidence View focuses on actual work, deliverables, and the limits of any job-posting evidence. Graph controls and an inspector are desktop-first; narrow screens use a searchable list and role detail rather than a tiny unreadable graph.

Official career guides, company profiles, and individual vacancies must display different evidence grades. No profile or undated material may be shown as an active vacancy. Unknown or unavailable evidence stays unknown or unavailable.

### Reports: Analyst Document Editor

The report view should feel like a technical document editor: a document outline, working fields, validation and redaction guidance, plus a concise preview. It does not use scoring as decoration; validation should explain the missing evidence or ambiguous conclusion.

## Content and accessibility rules

- Every core lesson uses ordered blocks and retains compatible legacy fields.
- A core lesson explains the mechanism, includes a real-looking but safe fixed transcript or output, compares related ideas, corrects an expected misconception, contains at least two checkpoints, connects to practice, and cites primary sources.
- Text alternatives describe the instructional meaning of a diagram. Do not use images to carry unrepeatable essential text.
- Use real HTML headings in order, labelled controls, semantic tables, and `focus-visible` states. Do not rely on hover for required information.

## Reference influences

The product may learn from the document rhythm of Mintlify, the restrained work surfaces of Linear, the Korean instructional clarity of Codeit and Elice, the explanation-to-lab sequence of PortSwigger Academy, the role and skill maps of roadmap.sh, and the path framing of HTB Academy. SecTrack must not copy their layouts, illustrations, branded assets, or screen captures.
