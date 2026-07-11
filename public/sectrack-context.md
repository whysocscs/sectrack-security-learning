# SecTrack public context

## Product purpose

SecTrack is a Korean information-security learning platform for approximately six learners. It is not a generic lecture dashboard. Its main workflow is:

`concept learning -> safe lab -> evidence -> validation -> progressive feedback -> mastery -> vulnerability report`

Week 0 is an orientation outside the formal 16-week track. Week 1 through Week 4 are fully implemented. Week 5 through Week 16 appear only as roadmap previews.

## Week 0

Learners distinguish technology fields, company roles, and protected industries. The interactive security map supports search, branch folding, zoom, node details, personal understanding state, notes, career interests, custom nodes, and validated JSON import/export. Rules of Engagement cases teach explicit authorization, scope, minimum impact, evidence redaction, and responsible disclosure.

## Week 1

The Linux section explains the relationship between terminal, shell, user space, kernel, file system, paths, users, groups, permissions, and SSH. A read-only simulated shell supports basic observation commands and Tab completion. Learners find three training flags and submit the command sequence and explanation without exposing external credentials.

## Week 2

Learners interpret symbolic and numeric Linux permissions, separate stdin/stdout/stderr, build a log pipeline one verified stage at a time, distinguish encoding from encryption and hashing, and compare browser DevTools with Burp Proxy and Repeater. The request editor accepts only a fixed local training request and demonstrates why server-side validation is required.

## Week 3

The web fundamentals path follows URL parsing, DNS, TCP/TLS, HTTP request and response, application processing, and browser rendering. Interactive labs cover HTTP message labels, request timeline, Cookie attributes, Source-to-Sink classification, and a local search-page threat model.

## Week 4

XSS is taught as an untrusted-data flow rather than a payload list. Four local labs cover Reflected XSS, Stored XSS, DOM-based XSS, and structurally incorrect filtering. Each lab separates Source, transport, transform, Sink, browser context, execution, and impact. Vulnerable and fixed code are shown side by side, followed by a retest step.

The Finding editor supports a staged report structure, autosave, Source/Transform/Sink/Context, HTTP evidence, technical and business impact, root cause, remediation, vulnerable and fixed code, and retest. Rule-based checks detect missing fields and unredacted Cookie, Authorization, API key, and token patterns.

## Security and privacy

- The application is a static Vite/React build hosted on GitHub Pages with HTTPS enforced.
- A restrictive CSP and `no-referrer` policy are declared in the document.
- There is no backend database, authentication system, telemetry, third-party font request, or secret key.
- Learning state stays in browser localStorage.
- XSS previews use a sandboxed iframe with an additional restrictive CSP and fixed content only.
- Imported mind-map JSON is limited to 512 KB, validated, truncated to safe field lengths, and rendered as React text.
- The original student report PDF contained author metadata and historical training URLs, so it is intentionally absent from the public build.

## Important routes

- `#/` learning home
- `#/learn` 16-week roadmap
- `#/learn/week/0` through `#/learn/week/4` implemented weekly material
- `#/mindmap` interactive security map
- `#/labs` lab catalog
- `#/labs/w4-reflected` example XSS trace lab
- `#/reports` report examples and student-case analysis
- `#/reports/new` local Finding editor
- `#/resources` official reference library
- `#/progress` local progress and mastery
- `#/admin` learning-friction and report-quality view
