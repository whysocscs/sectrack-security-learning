import test from 'node:test'
import assert from 'node:assert/strict'
import * as weekZeroData from '../src/weekZeroData.js'
import {
  MINDMAP_EDGE_KIND_RULES,
  MINDMAP_NODE_KINDS,
  allMindmapNodes,
  careerLanes,
  cryptoRoleAreas,
  getJobSource,
  getMindmapEdgesForNode,
  getMindmapNode,
  getMindmapNodesByKind,
  getNodeDetailModel,
  individualVacancies,
  jobSources,
  mindmapBranches,
  mindmapEdges,
  mindmapNodes,
  validateMindmapData,
} from '../src/mindmapData.js'

test('canonical IDs are unique and typed edges resolve to allowed node kinds', () => {
  assert.equal(new Set(mindmapNodes.map(({ id }) => id)).size, mindmapNodes.length)
  assert.equal(new Set(mindmapEdges.map(({ id }) => id)).size, mindmapEdges.length)
  const byId = new Map(mindmapNodes.map((node) => [node.id, node]))
  for (const edge of mindmapEdges) {
    const source = byId.get(edge.sourceId)
    const target = byId.get(edge.targetId)
    assert.ok(source, `missing edge source ${edge.sourceId}`)
    assert.ok(target, `missing edge target ${edge.targetId}`)
    assert.ok(MINDMAP_EDGE_KIND_RULES[edge.type]?.some(([from, to]) => from === source.kind && to === target.kind), `invalid ${edge.type}: ${source.kind} -> ${target.kind}`)
  }
  assert.deepEqual(validateMindmapData(), [])
})

test('all eight kinds exist and canonical nodes carry kind-specific required fields', () => {
  assert.deepEqual(new Set(mindmapNodes.map(({ kind }) => kind)), new Set(MINDMAP_NODE_KINDS))
  for (const concept of getMindmapNodesByKind('concept')) {
    assert.equal(typeof concept.definition, 'string')
    assert.ok(Array.isArray(concept.practicalUses))
    assert.ok(Array.isArray(concept.prerequisiteConceptIds))
    assert.equal('offensiveExample' in concept, false)
    assert.equal('defensiveExample' in concept, false)
  }
  for (const threat of getMindmapNodesByKind('threat')) {
    assert.ok(threat.conditions.length)
    assert.ok(threat.attackFlow.length)
    assert.ok(threat.safePractice.length)
  }
  for (const control of getMindmapNodesByKind('control')) {
    assert.ok(control.protectedAssets.length)
    assert.equal(typeof control.mechanism, 'string')
    assert.ok(control.verificationMethods.length)
  }
})

test('all 12 job families expose detailed roles, including eight separate GRC and privacy roles', () => {
  const families = getMindmapNodesByKind('jobFamily')
  const roles = getMindmapNodesByKind('role')
  assert.equal(families.length, 12)
  assert.ok(roles.length >= 19)
  assert.equal(getMindmapNode('family-grc-privacy').representativeRoleIds.length, 8)

  const roleArrayFields = ['actualWork', 'foundationConceptIds', 'skillIds', 'technologyIds', 'standardIds', 'deliverables', 'collaborators', 'entryExpectations', 'preferredExperience', 'learningStages', 'portfolioExamples', 'relatedWeekIds', 'jobSourceIds']
  for (const role of roles) {
    assert.ok(role.projectExample)
    assert.ok(role.sourceStatus)
    for (const field of roleArrayFields) assert.ok(Array.isArray(role[field]) && role[field].length, `${role.id}.${field}`)
    assert.deepEqual(role.learningStages.map(({ title }) => title), ['기초', '직무 핵심', '실무 적용', '포트폴리오'])
    assert.equal(getMindmapNode(role.jobFamilyId)?.kind, 'jobFamily')
    for (const id of [...role.foundationConceptIds, ...role.skillIds]) assert.equal(getMindmapNode(id)?.kind, 'concept', `${role.id} -> ${id}`)
    for (const id of role.technologyIds) assert.equal(getMindmapNode(id)?.kind, 'technology', `${role.id} -> ${id}`)
    for (const id of role.standardIds) assert.equal(getMindmapNode(id)?.kind, 'standard', `${role.id} -> ${id}`)
    for (const id of role.jobSourceIds) assert.ok(getJobSource(id), `${role.id} -> ${id}`)
  }

  for (const concept of getMindmapNodesByKind('concept')) {
    for (const id of [...concept.prerequisiteConceptIds, ...concept.subConceptIds]) assert.equal(getMindmapNode(id)?.kind, 'concept', `${concept.id} -> ${id}`)
  }
})

test('official source metadata distinguishes career guidance and fair profiles from vacancies', () => {
  const guide = getJobSource('source-kisa-career-guide')
  assert.equal(guide.sourceType, 'careerGuide')
  assert.equal(guide.sourceCategory, 'occupationalStandard')
  assert.equal(guide.url, 'https://academy.kisa.or.kr/cont/job/jobGuide.do')
  assert.equal(guide.coveredRoleTitles.length, 9)

  const profiles = jobSources.filter(({ sourceType }) => sourceType === 'fairExhibitorProfile')
  assert.equal(profiles.length, 3)
  assert.deepEqual(profiles.map(({ url }) => url), [
    'https://jobfair.kisia.or.kr/modules/board/bd_view.html?id=exhibitor&no=2',
    'https://jobfair.kisia.or.kr/modules/board/bd_view.html?id=exhibitor&no=3',
    'https://jobfair.kisia.or.kr/modules/board/bd_view.html?id=exhibitor&no=4',
  ])
  for (const source of profiles) {
    assert.equal(source.publishedDate, '2026-04-27')
    assert.equal(source.checkedDate, '2026-07-11')
    assert.equal(source.activeStatus, 'unknown')
    assert.equal(source.isIndividualVacancy, false)
    assert.match(source.note, /개별 채용공고가 아닙니다/)
    assert.equal(source.archivedAsset.type, 'screenshot')
  }
  assert.equal(getJobSource('source-kisia-fair-notice-2026').eventDate, '2026-05-27')
})

test('crypto areas are normalized without claiming verified current postings', () => {
  const cryptoRole = getMindmapNode('role-crypto-pki')
  assert.equal(cryptoRole.sourceStatus, 'current-vacancy-unverified')
  assert.match(cryptoRole.sourceStatusNote, /확보하지 못했습니다/)
  assert.equal(cryptoRole.workAreaIds.length, 9)
  assert.deepEqual(cryptoRole.workAreaIds, cryptoRoleAreas.map(({ id }) => id))
  assert.ok(cryptoRoleAreas.every(({ currentVacancyEvidence }) => currentVacancyEvidence === 'unavailable'))
  assert.equal(getJobSource('source-crypto-vacancy-audit-2026-07-11').verificationStatus, 'unavailable')
})

test('unknown kinds and neutral concepts never receive attack or defense fallback', () => {
  const unknown = getNodeDetailModel({ kind: 'futureKind', title: '미분류', summary: '분류 대기' })
  assert.equal(unknown.kind, 'unknown')
  assert.equal(unknown.perspective, 'neutral')
  assert.deepEqual(unknown.sections, [])
  assert.equal(getNodeDetailModel('asymmetric').perspective, 'neutral')
  assert.equal(getNodeDetailModel('xss').perspective, 'threat')
  assert.equal(getNodeDetailModel('firewall').perspective, 'control')
})

test('no source fabricates active vacancy status and unsupported market counts are gone', () => {
  assert.ok(jobSources.every(({ activeStatus }) => activeStatus !== 'active'))
  assert.deepEqual(individualVacancies, [])
  for (const role of getMindmapNodesByKind('role')) {
    assert.equal(role.jobEvidence.evidenceStatus, 'unavailable')
    assert.equal(role.jobEvidence.totalPostings, null)
    assert.equal(role.jobEvidence.activePostingCount, null)
    assert.match(role.jobEvidence.limitations, /개별 채용공고/)
  }
  assert.equal('marketJobs' in weekZeroData, false)
  assert.equal(weekZeroData.jobCaptures.length, 3)
  assert.ok(weekZeroData.jobCaptures.every(({ activeStatus, isIndividualVacancy }) => activeStatus === 'unknown' && isIndividualVacancy === false))
})

test('legacy exports consumed by App and MindmapStudio remain available', () => {
  assert.ok(mindmapBranches.length)
  assert.ok(allMindmapNodes.length)
  assert.ok(careerLanes.length)
  assert.ok(weekZeroData.workLanes.length)
  assert.equal(weekZeroData.kisaRoles.length, 9)
  assert.ok(weekZeroData.industryDomains.length)
  assert.ok(getMindmapEdgesForNode('role-crypto-pki').length)
})
