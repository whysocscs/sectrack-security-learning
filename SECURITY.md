# Security policy

## Training boundary

SecTrack is a static education application. It does not provide an external target scanner, arbitrary request launcher, credential collector, or executable user-supplied XSS payload field. XSS previews use fixed content in a sandboxed `srcdoc` frame.

## Data handling

- Learning progress and report drafts stay in the current browser's `localStorage`.
- There is no account backend, analytics SDK, tracking pixel, or API key.
- The uploaded source XSS report is excluded from the public repository and deployment because it contains author metadata and historical training URLs.
- Examples redact Cookie, Authorization, API keys, passwords, tokens, and personal data.

Do not enter real production credentials or personal information into training evidence.

## Reporting a problem

Use the GitHub repository's private security advisory feature for security reports. Do not include active credentials, personal information, or production exploit data in a public issue.
