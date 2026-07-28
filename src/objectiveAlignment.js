// Each entry maps one learner-visible objective, in display order, to the
// modules that teach it. courseData expands these stable mappings into concrete
// lab/checkpoint and quiz evidence IDs; the content contract verifies every
// reference and rejects objectives with a missing evidence layer.
const originalObjectiveModuleAlignment = Object.freeze({
  0: [
    ['w0-language'],
    ['w0-domains', 'w0-careers'],
    ['w0-evidence'],
    ['w0-careers', 'w0-evidence'],
  ],
  1: [
    ['w1-shell', 'w2-process'],
    ['w1-filesystem'],
    ['w1-navigation', 'w1-fileops', 'w2-git'],
    ['w1-ssh'],
    ['w1-permission'],
    ['w2-streams'],
    ['w1-navigation'],
    ['w2-curl'],
  ],
  2: [
    ['w3-url-dns'],
    ['w3-flow'],
    ['w3-session'],
    ['w3-dom'],
    ['w3-auth-origin'],
  ],
  3: [
    ['w4-nature', 'w4-types', 'w4-taint', 'w4-context', 'w4-impact'],
    ['w4-taint', 'w4-context', 'w4-impact'],
    ['w4-defense', 'w4-validation'],
    ['w4-validation'],
  ],
  4: [
    ['w5-db-basics'],
    ['w5-query-boundary', 'w5-parameterization'],
    ['w5-parameterization'],
    ['w5-database-controls'],
    ['w5-sqli-retest'],
  ],
  5: [
    ['w6-request-credentials'],
    ['w6-state-change'],
    ['w6-csrf-controls', 'w6-sensitive-actions'],
    ['w6-web-retest'],
    ['w6-web-retest'],
  ],
  6: [['w7-c-values'], ['w7-build-flow'], ['w7-memory-layout']],
  7: [['w8-instruction-flow'], ['w8-stack-frame'], ['w8-calling-convention']],
  8: [['w9-debugger-flow'], ['w9-bytes-io'], ['w9-local-driver']],
  9: [['w10-bounds'], ['w10-mitigations'], ['w10-retest']],
  10: [['w11-ai-claims'], ['w11-local-triage'], ['w11-retest']],
  11: [['w12-crypto-boundaries'], ['w12-forensic-interpretation'], ['w12-evidence-preservation']],
  12: [['w13-pcap-scope'], ['w13-wireshark-filters'], ['w13-wireshark-filters', 'w13-network-reporting']],
  13: [['w14-fuzzing-model'], ['w14-crash-triage'], ['w14-minimize-retest']],
  14: [['w15-shared-responsibility'], ['w15-iam-least-privilege'], ['w15-isolated-cloudgoat']],
  15: [['w16-agent-boundaries'], ['w16-agent-controls'], ['w16-final-threat-model']],
})

export const objectiveModuleAlignment = Object.freeze({
  ...Object.fromEntries(Object.entries(originalObjectiveModuleAlignment)
    .filter(([weekIndex]) => Number(weekIndex) <= 2 || Number(weekIndex) >= 11)
    .map(([weekIndex, mappings]) => {
      const sourceIndex = Number(weekIndex)
      if (sourceIndex <= 2) return [sourceIndex, mappings]
      return [sourceIndex === 15 ? 10 : sourceIndex - 6, mappings]
    })),
  3: [
    ['w7-c-values', 'w7-build-flow', 'w7-memory-layout'],
    ['w8-instruction-flow', 'w8-stack-frame', 'w8-calling-convention'],
    ['w9-debugger-flow', 'w9-bytes-io', 'w9-local-driver'],
  ],
  4: [
    ['w10-bounds'],
    ['w10-mitigations'],
    ['w10-retest', 'w11-ai-claims', 'w11-local-triage', 'w11-retest'],
  ],
  7: [
    ['w14-fuzzing-model'],
    ['w14-crash-triage'],
    ['w14-minimize-retest'],
    ['w7-web3-foundations'],
    ['w7-smart-contract-fuzzing'],
  ],
  8: [
    ['w8-supply-chain-flow'],
    ['w8-sbom-provenance'],
    ['w8-cicd-controls'],
    ['w15-shared-responsibility'],
    ['w15-iam-least-privilege'],
    ['w15-isolated-cloudgoat'],
  ],
  9: [
    ['w9-ot-foundations'],
    ['w9-ot-architecture'],
    ['w9-ot-monitoring'],
  ],
})
