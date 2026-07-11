# AGENTS.md

## Mission

Build and maintain a Korean information-security learning orchestration platform. The active MVP scope is WEEK0 through WEEK4, while the data model and roadmap must support WEEK1 through WEEK16.

## Working agreements

- Inspect the repository before editing. Preserve existing architecture and user work.
- Do not replace the framework or force major-version upgrades without a concrete compatibility reason.
- Prefer the repository's current package manager. If the repository is empty, prefer `pnpm`.
- Keep TypeScript strict and avoid `any` unless there is a documented boundary.
- Keep curriculum content in structured data or MDX, not inside page components.
- Reuse components only when semantics are truly shared; do not create abstract wrappers that hide simple UI.
- Run typecheck, lint, tests, and a production build after meaningful changes.
- Document new environment variables and setup steps.

## Product and UX rules

- This is not a generic dashboard LMS. It connects concepts, safe labs, evidence, feedback, progress, and vulnerability reporting.
- UI copy is natural Korean. Code identifiers and comments may be English.
- Avoid neon gradients, glassmorphism, generic hacker imagery, excessive rounded cards, fake metrics, and large marketing hero sections.
- Use document-like hierarchy, compact developer-tool layouts, 1px borders, restrained shadows, and one primary accent color.
- All screens must work with keyboard navigation and on 360px-wide mobile screens.
- Do not use color alone to communicate state.

## Security education rules

- All offensive content must stay inside local, deliberately vulnerable, or explicitly authorized training environments.
- Never add a generic external target scanner or attack launcher.
- Isolate intentionally vulnerable training code from the main application and user data.
- Use sandboxed previews for XSS demonstrations.
- Redact cookies, authorization headers, API keys, tokens, and personal data in evidence and sample reports.
- The AI coach provides progressive hints: concept reminder, observation target, next action, validation. It must not reveal flags or complete reports immediately.

## Quality gates

- No Lorem Ipsum or empty placeholder cards in completed WEEK0-WEEK4 flows.
- Persist progress and report drafts across reloads.
- Add tests for mind-map persistence, XSS source/sink visualization, report validation, and core navigation.
- Before finishing, report the exact checks run and their results.
