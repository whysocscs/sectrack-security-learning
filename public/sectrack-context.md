# SecTrack public context

## Product purpose

SecTrack is a Korean information-security learning platform for approximately six learners. It is not a generic lecture dashboard. Its main workflow is:

`concept learning -> safe lab -> evidence -> validation -> progressive feedback -> mastery -> vulnerability report`

The public schedule follows the actual class record. Week 0 remains a pre-course field and career guide. Week 1 is the class orientation, Week 2 is explicitly marked as not taught, Week 5 covers DFIR Case 001, and Week 6 covers network intrusion detection with Suricata.

## Week 0

Learners distinguish technology fields, company roles, and protected industries. The interactive security map supports search, branch folding, zoom, node details, personal understanding state, notes, career interests, custom nodes, and validated JSON import/export. Rules of Engagement cases teach explicit authorization, scope, minimum impact, evidence redaction, and responsible disclosure.

## Week 1 · OT

Learners view security as a field broader than hacking. The lesson distinguishes consulting, governance, incident response, Cloud security, AI security, offensive work, and defensive work by their questions and deliverables. A project-scoping activity connects team size, duration, cost, data boundaries, WBS, tasks, and verifiable outputs.

## Week 2 · no class

No class or assignment was delivered in Week 2. The product exposes this state directly and does not insert substitute curriculum.

## Week 3

The web fundamentals path follows URL parsing, DNS, TCP/TLS, HTTP request and response, application processing, and browser rendering. Interactive labs cover HTTP message labels, request timeline, Cookie attributes, Source-to-Sink classification, and a local search-page threat model.

## Week 4

XSS is taught as an untrusted-data flow rather than a payload list. Four local labs cover Reflected XSS, Stored XSS, DOM-based XSS, and structurally incorrect filtering. Each lab separates Source, transport, transform, Sink, browser context, execution, and impact. Vulnerable and fixed code are shown side by side, followed by a retest step.

The Finding editor supports a staged report structure, autosave, Source/Transform/Sink/Context, HTTP evidence, technical and business impact, root cause, remediation, vulnerable and fixed code, and retest. Rule-based checks detect missing fields and unredacted Cookie, Authorization, API key, and token patterns.

## Week 5 · DFIR Case 001

Learners distinguish Digital Forensics from Incident Response, map Disk, Memory, Network, and Log evidence to investigation questions, and follow Identify, Collect, Preserve, Examine, Analyze, and Report. The Case 001 lesson connects an Autoruns clue, E01 image, partition offset, `fls` and `icat`, MFT and `$DATA` metadata, file identification and hashing, Volatility process and connection evidence, Wireshark filters, RDP traffic, TerminalServices EVTX, and a bounded incident timeline.

Every step states what the evidence proves and what it does not prove. File existence is separated from execution, HTTP response from execution, TCP/3389 from authentication, a session from post-login activity, and external traffic from confirmed data exfiltration. The expanded lesson includes command-by-command interpretation, reconstructed output, common misconceptions, and a 60-minute guided evidence-correlation exercise.

## Week 6 · network intrusion detection

Learners move from manual PCAP inspection to Network Security Monitoring, distinguish IDS from IPS, and follow Suricata from Packet and Flow through protocol Event and Alert. They inspect every Rule header field and option, compare an HTTP URI Rule with a Case-specific RDP 5-Tuple Rule, analyze `fast.log` and EVE JSON with progressively narrower `jq` queries, identify a Case 001 internal-RDP detection gap, validate a local rule, and re-run the same training PCAP.

The lesson explicitly demonstrates the three different claims “Traffic exists,” “Suricata parsed it as RDP,” and “an active Rule generated an Alert.” It then compares default and local outputs, records environment-dependent values such as the 479-alert classroom observation, and adds positive, negative, direction, port, and false-positive retest cases before any operational interpretation.

## Security and privacy

- The application is a static Vite/React build hosted on GitHub Pages with HTTPS enforced.
- A restrictive CSP and `no-referrer` policy are declared in the document.
- There is no backend database, authentication system, telemetry, third-party font request, or secret key.
- Learning state stays in browser localStorage.
- Public course content is reconstructed from source slides without student numbers, personal names, or personal workspace URLs.
- XSS previews use a sandboxed iframe with an additional restrictive CSP and fixed content only.
- Imported mind-map JSON is limited to 512 KB, validated, truncated to safe field lengths, and rendered as React text.
- The original student report PDF contained author metadata and historical training URLs, so it is intentionally absent from the public build.

## Important routes

- `#/` learning home
- `#/learn` actual class roadmap
- `#/learn/week/1` orientation
- `#/learn/week/2` explicit no-class record
- `#/learn/week/5` DFIR Case 001
- `#/learn/week/6` Suricata network intrusion detection
- `#/mindmap` interactive security map
- `#/labs` lab catalog
- `#/labs/w4-reflected` example XSS trace lab
- `#/reports` report examples and student-case analysis
- `#/reports/new` local Finding editor
- `#/resources` official reference library
- `#/progress` local progress and mastery
- `#/admin` learning-friction and report-quality view
