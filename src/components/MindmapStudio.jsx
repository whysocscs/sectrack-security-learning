import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Focus,
  Image as ImageIcon,
  LocateFixed,
  Maximize2,
  Minus,
  PanelRightClose,
  Plus,
  Printer,
  Search,
  Upload,
  X,
} from 'lucide-react'
import {
  getJobSource,
  getMindmapEdgesForNode,
  getMindmapNode,
  mindmapNodes,
  mindmapReferences,
} from '../mindmapData'

const viewModes = [
  ['roles', '직무로 보기'],
  ['competencies', '역량 연결 보기'],
  ['concepts', '개념으로 보기'],
]

const masteryOptions = [
  ['unknown', '아직 모름'],
  ['heard', '들어본 적 있음'],
  ['explain', '설명 가능'],
  ['apply', '기초 적용 가능'],
  ['reproduce', '재현·응용 가능'],
]

const confidenceOptions = [['low', '낮음'], ['medium', '보통'], ['high', '높음']]
const reviewOptions = [['now', '지금 복습'], ['later', '나중에 복습'], ['done', '복습 완료']]

const kindLabels = {
  jobFamily: '직무군', role: '세부 직무', concept: '개념', technology: '기술·도구',
  standard: '표준', threat: '위협', control: '통제', industry: '산업', unknown: '개인 노드',
}

const conceptGroupOrder = ['concept', 'technology', 'standard', 'threat', 'control', 'industry']

export default function MindmapStudio({ progress, updateProgress, notify, fullPage = false }) {
  const mapState = progress.mindmap
  const view = mapState.view || {}
  const [query, setQuery] = useState('')
  const [reference, setReference] = useState(null)
  const [customLabel, setCustomLabel] = useState('')
  const importRef = useRef(null)
  const workspaceRef = useRef(null)
  const canvasRef = useRef(null)
  const searchRef = useRef(null)
  const nodeRefs = useRef(new Map())

  const mode = view.mode || 'roles'
  const zoom = Number(view.zoom) || 100
  const selectedId = view.selectedNodeId || null
  const selected = getMindmapNode(selectedId) || (mapState.customNodes || []).find((node) => node.id === selectedId) || null
  const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR')

  const updateMindmap = useCallback((patch) => updateProgress((current) => ({
    ...current,
    mindmap: { ...current.mindmap, ...patch },
    lastActivityAt: new Date().toISOString(),
  })), [updateProgress])

  const updateView = useCallback((patch) => updateProgress((current) => ({
    ...current,
    mindmap: {
      ...current.mindmap,
      view: { ...current.mindmap.view, ...patch },
    },
  })), [updateProgress])

  const groups = useMemo(() => buildGroups(mode, mapState.customNodes || []), [mode, mapState.customNodes])
  const visibleGroups = useMemo(() => groups.map((group) => {
    if (!normalizedQuery) return group
    const groupMatches = matchesQuery(group, normalizedQuery)
    const nodes = group.nodes.filter((node) => matchesQuery(node, normalizedQuery))
    return { ...group, nodes: groupMatches ? group.nodes : nodes }
  }).filter((group) => group.nodes.length), [groups, normalizedQuery])

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return []
    return mindmapNodes.filter((node) => matchesQuery(node, normalizedQuery)).slice(0, 8)
  }, [normalizedQuery])

  const expandedGroups = view.expandedGroups || {}
  const isGroupExpanded = (group) => normalizedQuery || expandedGroups[group.id] !== false
  const setSelectedId = (nodeId) => updateView({ selectedNodeId: nodeId })
  const setZoom = (value) => updateView({ zoom: Math.max(60, Math.min(140, value)) })
  const toggleGroup = (groupId) => updateView({ expandedGroups: { ...expandedGroups, [groupId]: expandedGroups[groupId] === false } })

  const selectAndCenter = useCallback((nodeId) => {
    const node = getMindmapNode(nodeId)
    const targetMode = !node || node.kind === 'role' || node.kind === 'jobFamily' ? 'roles' : 'concepts'
    updateView({ mode: targetMode, selectedNodeId: nodeId })
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const element = nodeRefs.current.get(nodeId)
      element?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center', inline: 'center' })
      element?.focus({ preventScroll: true })
    }))
  }, [updateView])

  const fitMap = useCallback(() => {
    const width = canvasRef.current?.clientWidth || 900
    const target = width < 760 ? 70 : width < 1100 ? 85 : 100
    setZoom(target)
    canvasRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [updateView])

  const centerSelected = () => {
    if (!selectedId) return
    nodeRefs.current.get(selectedId)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await workspaceRef.current?.requestFullscreen()
    } catch {
      notify?.('이 브라우저에서는 전체 화면을 열 수 없습니다.')
    }
  }

  const roleCount = mapState.roleInterests?.length || 0
  const noteCount = Object.values(mapState.notes || {}).filter((value) => String(value).trim().length >= 5).length
  const exploredCount = new Set([
    ...Object.keys(mapState.conceptMastery || {}),
    ...(mapState.roleInterests || []),
    ...Object.keys(mapState.notes || {}).filter((id) => String(mapState.notes[id]).trim()),
  ]).size
  const complete = roleCount >= 2 && noteCount >= 3 && exploredCount >= 8

  const exportMap = () => {
    const data = JSON.stringify({ schema: 'sectrack-mindmap', version: 2, exportedAt: new Date().toISOString(), mindmap: mapState }, null, 2)
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sectrack-week0-career-map.json'
    anchor.click()
    URL.revokeObjectURL(url)
    notify?.('직무 지도 JSON을 내보냈습니다.')
  }

  const importMap = (file) => {
    if (!file) return
    if (file.size > 512 * 1024) { notify?.('직무 지도 JSON은 512KB 이하만 가져올 수 있습니다.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const incoming = parsed.mindmap || parsed
        const imported = sanitizeMapImport(incoming)
        updateMindmap(imported)
        notify?.('검증한 직무 지도 데이터를 가져왔습니다.')
      } catch {
        notify?.('올바른 SecTrack 직무 지도 JSON이 아닙니다. 기존 데이터는 변경하지 않았습니다.')
      } finally {
        if (importRef.current) importRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const addCustomNode = () => {
    const title = customLabel.trim().slice(0, 80)
    if (!title) return
    const node = { id: `custom-${Date.now()}`, kind: 'unknown', title, summary: '개인 탐색 중 추가한 주제입니다.', relatedWeekIds: [], sourceRefs: [], custom: true }
    updateMindmap({ customNodes: [...(mapState.customNodes || []), node] })
    setCustomLabel('')
    selectAndCenter(node.id)
    notify?.('개인 탐색 노드를 추가했습니다.')
  }

  useEffect(() => {
    if (!selectedId) return
    const stillVisible = visibleGroups.some((group) => group.nodes.some((node) => node.id === selectedId))
    if (!stillVisible && normalizedQuery) updateView({ selectedNodeId: null })
  }, [mode, normalizedQuery])

  return (
    <div className={`${fullPage ? 'page-width ' : ''}mindmap-page`}>
      {fullPage && <header className="mindmap-intro"><span>WEEK 00 · CAREER EXPLORATION</span><h2>나의 보안 직무 지도</h2><p>직무군에서 세부 직무를 고르고, 실제 업무에 필요한 개념·기술·표준을 연결해 봅니다. 관심 직무와 메모는 이 브라우저에 저장됩니다.</p></header>}

      <section className="mindmap-progress-strip" aria-label="직무 지도 탐색 완료 조건">
        <ProgressCondition done={roleCount >= 2} label="관심 직무" value={`${roleCount} / 2개`} />
        <ProgressCondition done={exploredCount >= 8} label="노드 탐색" value={`${exploredCount} / 8개`} />
        <ProgressCondition done={noteCount >= 3} label="개인 메모" value={`${noteCount} / 3개`} />
        <b>{complete ? 'Week 0 탐색 완료' : '직무 지도를 탐색하는 중'}</b>
      </section>

      <div className="mindmap-toolbar">
        <div className="map-view-tabs" role="group" aria-label="지도 보기 모드">{viewModes.map(([id, label]) => <button type="button" key={id} className={mode === id ? 'active' : ''} aria-pressed={mode === id} onClick={() => updateView({ mode: id, selectedNodeId: null })}>{label}</button>)}</div>
        <label className="map-search"><Search size={16} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="직무·개념·기술 검색" />{query && <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus() }} aria-label="검색어 지우기"><X size={14} /></button>}</label>
        <div className="zoom-control"><button type="button" onClick={() => setZoom(zoom - 10)} title="축소" aria-label="지도 축소"><Minus size={16} /></button><input type="range" min="60" max="140" step="5" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="지도 확대 비율" /><span>{zoom}%</span><button type="button" onClick={() => setZoom(zoom + 10)} title="확대" aria-label="지도 확대"><Plus size={16} /></button><button type="button" onClick={fitMap} title="전체 맞춤" aria-label="지도 전체 맞춤"><Focus size={16} /></button><button type="button" onClick={centerSelected} disabled={!selectedId} title="선택 노드 중심" aria-label="선택 노드를 화면 중앙으로"><LocateFixed size={16} /></button></div>
        <div className="map-commands"><button type="button" onClick={toggleFullscreen} title="전체 화면"><Maximize2 size={15} /><span>전체 화면</span></button><button type="button" onClick={exportMap}><Download size={15} /><span>JSON</span></button><button type="button" onClick={() => importRef.current?.click()}><Upload size={15} /><span>가져오기</span></button><input ref={importRef} type="file" accept="application/json" hidden onChange={(event) => importMap(event.target.files?.[0])} /><button type="button" onClick={() => window.print()} title="인쇄"><Printer size={15} /><span>인쇄</span></button></div>
      </div>

      {searchResults.length > 0 && <div className="map-search-results" aria-label="검색 결과">{searchResults.map((node) => <button type="button" key={node.id} onClick={() => selectAndCenter(node.id)}><Search size={13} /><strong>{node.title}</strong><span>{kindLabels[node.kind]}</span></button>)}</div>}

      <div ref={workspaceRef} className={`mindmap-workspace ${selected ? 'has-inspector' : 'map-expanded'}`}>
        <div ref={canvasRef} className="mindmap-canvas" aria-label="인터랙티브 정보보안 직무 지도">
          <div className="mindmap-zoom-layer" style={{ transform: `scale(${zoom / 100})`, width: `${10000 / zoom}%` }}>
            <button type="button" className={`mindmap-root-node root-${view.rootMode || 'expanded'}`} onClick={() => updateView({ rootMode: view.rootMode === 'compact' ? 'expanded' : 'compact' })} aria-expanded={view.rootMode !== 'compact'}>
              <span className="root-glyph"><BriefcaseBusiness size={22} /></span><span><small>WEEK 00</small><strong>정보보안 직무 지도</strong>{view.rootMode !== 'compact' && <em>직무와 역량의 연결을 탐색한다</em>}</span>
            </button>
            <div className="mindmap-branches">
              {visibleGroups.map((group) => {
                const expanded = isGroupExpanded(group)
                return <section className={`mindmap-branch branch-kind-${group.kind}`} key={group.id}><button type="button" className="branch-head" aria-expanded={expanded} onClick={() => toggleGroup(group.id)}><span>{expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</span><strong>{group.title}</strong><small>{group.nodes.length}</small></button>{expanded && <div className="branch-nodes">{group.nodes.map((node) => <button ref={(element) => { if (element) nodeRefs.current.set(node.id, element); else nodeRefs.current.delete(node.id) }} type="button" key={node.id} className={`${selectedId === node.id ? 'active' : ''} ${normalizedQuery && matchesQuery(node, normalizedQuery) ? 'search-match' : ''}`} onClick={() => setSelectedId(node.id)}><span /><span>{node.title}</span><em>{kindLabels[node.kind] || kindLabels.unknown}</em></button>)}</div>}</section>
              })}
              {!visibleGroups.length && <p className="map-empty">검색 결과가 없습니다.</p>}
            </div>
          </div>
        </div>

        {selected && <NodeInspector node={selected} mapState={mapState} updateMindmap={updateMindmap} close={() => updateView({ selectedNodeId: null })} openReference={(item, trigger) => setReference({ item, trigger })} />}
      </div>

      <section className="mindmap-below-grid">
        <div className="career-interest"><header><span>MY CAREER MAP</span><h2>관심 직무</h2><p>직무 노드의 상세 패널에서 관심 여부를 저장합니다. 두 개를 고른 뒤 필요한 기초 개념을 비교해 보세요.</p></header>{(mapState.roleInterests || []).length ? (mapState.roleInterests || []).map((id) => { const role = getMindmapNode(id); return role ? <button type="button" key={id} className="saved-role" onClick={() => selectAndCenter(id)}><BriefcaseBusiness size={16} /><span><strong>{role.title}</strong><small>{getMindmapNode(role.jobFamilyId)?.title}</small></span><ChevronRight size={15} /></button> : null }) : <p className="empty-state-copy">아직 고른 직무가 없습니다.</p>}</div>
        <div className="custom-node-form"><header><span>PERSONAL TOPIC</span><h2>개인 탐색 주제 추가</h2><p>수업 중 더 알아보고 싶은 주제를 추가하고 메모를 남길 수 있습니다.</p></header><label><span>주제 이름</span><input value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} placeholder="예: 위성 통신 보안" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustomNode() } }} /></label><button className="button primary" type="button" onClick={addCustomNode}><Plus size={16} />노드 추가</button></div>
      </section>

      <details className="mindmap-text-view"><summary>텍스트 목록으로 보기</summary>{groups.map((group) => <section key={group.id}><h3>{group.title}</h3><ul>{group.nodes.map((node) => <li key={node.id}><button type="button" onClick={() => selectAndCenter(node.id)}><strong>{node.title}</strong> · {node.summary}</button></li>)}</ul></section>)}</details>

      <section className="mindmap-reference-gallery"><header><span>REFERENCE IMAGES</span><h2>분류 구조 참고 이미지</h2><p>업로드된 참고 이미지는 구조 비교용이며, 현재 직무 설명과 출처 상태는 확인 가능한 데이터로 별도 구성했습니다.</p></header><div>{mindmapReferences.map((item) => <button type="button" key={item.image} onClick={(event) => setReference({ item, trigger: event.currentTarget })}><img src={publicAsset(item.image)} alt={item.title} /><span><ImageIcon size={15} />{item.title}<Maximize2 size={14} /></span></button>)}</div></section>

      {reference && <ImageDialog item={reference.item} trigger={reference.trigger} close={() => setReference(null)} />}
    </div>
  )
}

function ProgressCondition({ done, label, value }) {
  return <div className={done ? 'done' : ''}><span>{done && <Check size={14} />}</span><strong>{label}</strong><small>{value}</small></div>
}

function NodeInspector({ node, mapState, updateMindmap, close, openReference }) {
  const isRole = node.kind === 'role'
  const isConcept = node.kind === 'concept'
  const interested = (mapState.roleInterests || []).includes(node.id)
  const sources = (node.jobSourceIds || node.sourceRefs || []).map(getJobSource).filter(Boolean)

  const updateNodeMap = (key, value) => updateMindmap({ [key]: { ...(mapState[key] || {}), [node.id]: value } })
  const toggleInterest = () => updateMindmap({
    roleInterests: interested ? mapState.roleInterests.filter((id) => id !== node.id) : [...new Set([...(mapState.roleInterests || []), node.id])],
  })

  return <aside className="node-inspector" aria-label={`${node.title} 상세 정보`}>
    <header><div><span>{kindLabels[node.kind] || kindLabels.unknown}</span><h2>{node.title}</h2></div><button type="button" className="icon-button" onClick={close} aria-label="상세 패널 닫기" title="상세 패널 닫기"><PanelRightClose size={18} /></button><p>{node.summary}</p></header>
    {isRole && <button type="button" className={`role-interest-toggle ${interested ? 'selected' : ''}`} aria-pressed={interested} onClick={toggleInterest}><BriefcaseBusiness size={16} />{interested ? '관심 직무에서 빼기' : '관심 직무로 저장'}</button>}
    <NodeDetail node={node} />
    {isConcept && <label className="node-status"><span>개념 숙련도</span><select value={mapState.conceptMastery?.[node.id] || 'unknown'} onChange={(event) => updateNodeMap('conceptMastery', event.target.value)}>{masteryOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><ChevronDown size={14} /></label>}
    {(isRole || isConcept) && <div className="inspector-state-grid"><label><span>자기 확신도</span><select value={mapState.confidence?.[node.id] || ''} onChange={(event) => updateNodeMap('confidence', event.target.value)}><option value="">선택 안 함</option>{confidenceOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label><span>복습 상태</span><select value={mapState.reviewIntent?.[node.id] || ''} onChange={(event) => updateNodeMap('reviewIntent', event.target.value)}><option value="">선택 안 함</option>{reviewOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>}
    {isRole && <SourceCards sources={sources} node={node} openReference={openReference} />}
    <label className="node-note"><span>개인 메모</span><textarea rows="6" value={mapState.notes?.[node.id] || ''} onChange={(event) => updateNodeMap('notes', event.target.value)} placeholder="업무, 필요한 공부, 다시 확인할 질문을 내 문장으로 적어보세요." /></label>
  </aside>
}

function NodeDetail({ node }) {
  switch (node.kind) {
    case 'jobFamily': return <>
      <DetailSection title="직무군 설명" text={node.description} />
      <LinkedNodes title="대표 세부 직무" ids={node.representativeRoleIds} />
      <DetailList title="다루는 자산·시스템" values={node.assets} />
      <DetailList title="협업 관계" values={node.collaborators} />
      <LinkedNodes title="관련 학습 영역" ids={node.learningAreaIds} />
      <WeekTags weeks={node.relatedWeekIds} />
    </>
    case 'role': return <>
      <DetailList title="실제 수행 업무" values={node.actualWork} />
      <DetailSection title="프로젝트 예시" text={node.projectExample} />
      <LinkedNodes title="필수 기초지식" ids={node.foundationConceptIds} />
      <LinkedNodes title="핵심 기술 역량" ids={node.skillIds} />
      <LinkedNodes title="기술·도구" ids={node.technologyIds} />
      <LinkedNodes title="표준" ids={node.standardIds} />
      <DetailList title="주요 산출물" values={node.deliverables} />
      <DetailList title="협업 대상" values={node.collaborators} />
      <DetailList title="신입에게 기대되는 수준" values={node.entryExpectations} />
      <DetailList title="있으면 좋은 경험" values={node.preferredExperience} />
      <LearningStages stages={node.learningStages} />
      <DetailList title="포트폴리오 예시" values={node.portfolioExamples} />
      <WeekTags weeks={node.relatedWeekIds} />
    </>
    case 'concept': return <>
      <DetailSection title="정의" text={node.definition} />
      <DetailList title="실무 사용 위치" values={node.practicalUses} />
      <LinkedNodes title="사용하는 직무" ids={node.roleIds} empty="직무 연결을 확장 중입니다." />
      <LinkedNodes title="선수 개념" ids={node.prerequisiteConceptIds} empty="별도 선수 개념이 없습니다." />
      <LinkedNodes title="반드시 배울 하위 개념" ids={node.subConceptIds} empty="현재 별도 하위 노드가 없습니다." />
      <DetailList title="학습 체크리스트" values={node.learningChecklist} />
      <LinkedNodes title="관련 기술" ids={node.technologyIds} empty="연결 기술을 확장 중입니다." />
      <LinkedNodes title="관련 표준" ids={node.standardIds} empty="연결 표준을 확장 중입니다." />
      <DetailList title="구현·운영 주의점" values={node.implementationCautions} empty="관련 직무 노드에서 적용 범위를 확인하세요." />
      <DetailList title="흔한 오해" values={node.commonMisconceptions} empty="학습 중 발견한 오해를 메모로 남겨보세요." />
      <WeekTags weeks={node.relatedWeekIds} />
    </>
    case 'technology': return <>
      <DetailSection title="목적" text={node.purpose} /><DetailList title="사용 시나리오" values={node.scenarios} /><DetailList title="구성 요소와 동작 흐름" values={node.componentsAndFlow} /><LinkedNodes title="필요한 개념" ids={node.conceptIds} /><LinkedNodes title="관련 직무" ids={node.roleIds} empty="직무 연결을 확장 중입니다." /><DetailList title="운영·구현 주의점" values={node.operationalCautions} /><LinkedNodes title="인접 기술" ids={node.adjacentTechnologyIds} empty="현재 별도 인접 기술이 없습니다." /><WeekTags weeks={node.relatedWeekIds} />
    </>
    case 'standard': return <>
      <DetailSection title="목적" text={node.purpose} /><DetailSection title="적용 범위" text={node.scope} /><DetailList title="주요 요구사항·산출물" values={node.keyRequirements} /><LinkedNodes title="실제 담당 직무" ids={node.roleIds} empty="직무 연결을 확장 중입니다." /><DetailList title="관련 조직 흐름" values={node.organizationFlow} /><LinkedNodes title="관련 개념" ids={node.conceptIds} /><WeekTags weeks={node.relatedWeekIds} />
    </>
    case 'threat': return <>
      <DetailList title="성립 조건" values={node.conditions} /><DetailList title="공격 흐름" values={node.attackFlow} className="threat-flow" /><DetailList title="영향" values={node.impact} /><DetailList title="탐지 단서" values={node.detectionSignals} /><DetailList title="완화 방법" values={node.mitigations} /><DetailList title="안전한 실습" values={node.safePractice} /><WeekTags weeks={node.relatedWeekIds} />
    </>
    case 'control': return <>
      <DetailList title="보호 대상" values={node.protectedAssets} /><DetailList title="적용 위치" values={node.placements} /><DetailSection title="동작 원리" text={node.mechanism} /><DetailList title="운영 방법" values={node.operations} /><DetailList title="한계" values={node.limitations} /><DetailList title="효과 확인 방법" values={node.verificationMethods} /><WeekTags weeks={node.relatedWeekIds} />
    </>
    case 'industry': return <>
      <DetailList title="보호 자산" values={node.assets} /><DetailList title="운영 제약" values={node.operationalConstraints} /><LinkedNodes title="관련 직무" ids={node.roleIds} empty="관련 직무를 지도에서 비교해 보세요." /><LinkedNodes title="관련 개념" ids={node.conceptIds} empty="관련 기초 개념을 확장 중입니다." /><WeekTags weeks={node.relatedWeekIds} />
    </>
    default: return <DetailSection title="개인 탐색 주제" text={node.summary || '개인 메모에서 이 주제의 의미와 학습 방향을 정리하세요.'} />
  }
}

function DetailSection({ title, text }) {
  if (!text) return null
  return <section><h3>{title}</h3><p>{text}</p></section>
}

function DetailList({ title, values = [], empty = null, className = '' }) {
  if (!values.length && !empty) return null
  return <section className={className}><h3>{title}</h3>{values.length ? <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>{empty}</p>}</section>
}

function LinkedNodes({ title, ids = [], empty = null }) {
  const nodes = ids.map(getMindmapNode).filter(Boolean)
  if (!nodes.length && !empty) return null
  return <section><h3>{title}</h3>{nodes.length ? <div className="inspector-tags">{nodes.map((node) => <span key={node.id}>{node.title}</span>)}</div> : <p>{empty}</p>}</section>
}

function WeekTags({ weeks = [] }) {
  if (!weeks.length) return null
  return <section><h3>연결 주차</h3><div className="inspector-tags">{weeks.map((week) => <span key={week}>Week {week}</span>)}</div></section>
}

function LearningStages({ stages = [] }) {
  if (!stages.length) return null
  return <section><h3>학습 순서</h3><ol className="learning-stage-list">{stages.map((stage, index) => <li key={stage.id}><span>{index + 1}</span><div><strong>{stage.title}</strong>{stage.outcomes.map((outcome) => <p key={outcome}>{outcome}</p>)}</div></li>)}</ol></section>
}

function SourceCards({ sources, node, openReference }) {
  return <section className="job-source-section"><h3>채용·직무 근거</h3><p className="source-status-copy">{node.sourceStatusNote}</p>{sources.length ? <div className="job-source-cards">{sources.map((source) => <article key={source.id}><header><strong>{source.company || source.organization}</strong><span>{sourceTypeLabel(source.sourceType)}</span></header><p>{source.title}</p><dl><div><dt>확인일</dt><dd>{source.checkedDate || '미확인'}</dd></div><div><dt>활성 상태</dt><dd>{activeStatusLabel(source.activeStatus)}</dd></div><div><dt>개별 공고</dt><dd>{source.isIndividualVacancy ? '예' : '아니오'}</dd></div></dl>{source.archivedAsset && <button type="button" onClick={(event) => openReference({ title: source.title, image: source.archivedAsset.path }, event.currentTarget)}><ImageIcon size={14} />로컬 캡처 보기</button>}<small>{source.note}</small></article>)}</div> : <p>연결된 출처가 없습니다.</p>}</section>
}

function ImageDialog({ item, trigger, close }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    const focusable = () => [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    focusable()[0]?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return }
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0]; const last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); trigger?.focus?.() }
  }, [close, trigger])
  return <div ref={dialogRef} className="modal-layer" role="dialog" aria-modal="true" aria-label={item.title}><button className="modal-backdrop" type="button" tabIndex="-1" onClick={close} aria-label="확대 화면 닫기" /><div className="image-modal mindmap-reference-modal"><button type="button" className="icon-button" onClick={close} aria-label="닫기"><X size={20} /></button><img src={publicAsset(item.image)} alt={item.title} /></div></div>
}

function buildGroups(mode, customNodes) {
  const families = mindmapNodes.filter((node) => node.kind === 'jobFamily')
  const roles = mindmapNodes.filter((node) => node.kind === 'role')
  if (mode === 'roles') return [
    ...families.map((family) => ({ ...family, nodes: [family, ...family.representativeRoleIds.map(getMindmapNode).filter(Boolean)] })),
    ...(customNodes.length ? [{ id: 'personal-topics', kind: 'unknown', title: '개인 탐색 주제', summary: '', nodes: customNodes }] : []),
  ]
  if (mode === 'competencies') return roles.map((role) => {
    const ids = [...role.foundationConceptIds, ...role.skillIds, ...role.technologyIds, ...role.standardIds]
    return { id: `competency:${role.id}`, kind: 'role', title: role.title, summary: role.summary, nodes: [role, ...[...new Set(ids)].map(getMindmapNode).filter(Boolean)] }
  })
  return conceptGroupOrder.map((kind) => ({ id: `kind:${kind}`, kind, title: kindLabels[kind], summary: '', nodes: mindmapNodes.filter((node) => node.kind === kind) }))
}

function matchesQuery(node, query) {
  const connectedTitles = getMindmapEdgesForNode(node.id).flatMap((edge) => [getMindmapNode(edge.sourceId)?.title, getMindmapNode(edge.targetId)?.title])
  return [node.title, node.summary, node.description, ...(node.relatedWeekIds || []).map((week) => `week ${week}`), ...connectedTitles]
    .filter(Boolean).join(' ').toLocaleLowerCase('ko-KR').includes(query)
}

function sanitizeMapImport(incoming) {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) throw new Error('invalid map')
  const allowedIds = new Set(mindmapNodes.map((node) => node.id))
  const customNodes = (Array.isArray(incoming.customNodes) ? incoming.customNodes : []).slice(0, 50).map((node, index) => ({
    id: `custom-imported-${Date.now()}-${index}`, kind: 'unknown', title: String(node?.title || node?.label || '').trim().slice(0, 80),
    summary: '가져온 개인 탐색 주제입니다.', relatedWeekIds: [], sourceRefs: [], custom: true,
  })).filter((node) => node.title)
  customNodes.forEach((node) => allowedIds.add(node.id))
  const filterMap = (value, allowedValues = null, maxLength = 2000) => Object.fromEntries(Object.entries(value && typeof value === 'object' && !Array.isArray(value) ? value : {}).filter(([id, item]) => allowedIds.has(id) && (!allowedValues || allowedValues.has(item))).map(([id, item]) => [id, typeof item === 'string' ? item.slice(0, maxLength) : item]))
  const roleIds = new Set(mindmapNodes.filter((node) => node.kind === 'role').map((node) => node.id))
  const legacyInterests = Array.isArray(incoming.interests) ? incoming.interests : []
  const roleInterests = [...new Set([...(Array.isArray(incoming.roleInterests) ? incoming.roleInterests : []), ...legacyInterests])].filter((id) => roleIds.has(id)).slice(0, 12)
  const masterySource = incoming.conceptMastery || incoming.statuses || {}
  const conceptMastery = Object.fromEntries(Object.entries(masterySource).filter(([id]) => allowedIds.has(id)).map(([id, value]) => [id, value === 'practice' ? 'apply' : value === 'learn' ? 'heard' : value]).filter(([, value]) => masteryOptions.some(([allowed]) => allowed === value)))
  const legacyReviewIntent = Object.fromEntries(Object.entries(incoming.statuses || {}).filter(([id, value]) => allowedIds.has(id) && value === 'learn').map(([id]) => [id, 'now']))
  const currentView = incoming.view && typeof incoming.view === 'object' && !Array.isArray(incoming.view) ? incoming.view : {}
  return {
    statuses: filterMap(incoming.statuses),
    notes: filterMap(incoming.notes, null, 2000),
    customNodes,
    interests: legacyInterests.filter((id) => typeof id === 'string').slice(0, 20),
    roleInterests,
    conceptMastery,
    confidence: filterMap(incoming.confidence, new Set(confidenceOptions.map(([value]) => value))),
    reviewIntent: { ...legacyReviewIntent, ...filterMap(incoming.reviewIntent, new Set(reviewOptions.map(([value]) => value))) },
    view: {
      mode: viewModes.some(([id]) => id === currentView.mode) ? currentView.mode : 'roles',
      selectedNodeId: allowedIds.has(currentView.selectedNodeId) ? currentView.selectedNodeId : null,
      rootMode: currentView.rootMode === 'compact' ? 'compact' : 'expanded',
      expandedGroups: filterBooleanMap(currentView.expandedGroups),
      zoom: Math.max(60, Math.min(140, Number(currentView.zoom) || 100)),
      inspectorWidth: Math.max(300, Math.min(520, Number(currentView.inspectorWidth) || 360)),
    },
  }
}

function filterBooleanMap(value) {
  return Object.fromEntries(Object.entries(value && typeof value === 'object' && !Array.isArray(value) ? value : {}).filter(([key, item]) => key.length <= 120 && typeof item === 'boolean').slice(0, 200))
}

function sourceTypeLabel(type) {
  return ({ careerGuide: '공식 직무 가이드', eventNotice: '행사 공지', fairExhibitorProfile: '박람회 참가기업 프로필', individualVacancy: '개별 채용공고', verificationNote: '확인 기록' })[type] || '출처'
}

function activeStatusLabel(status) {
  return ({ active: '모집 중 확인', inactive: '마감 확인', unknown: '현재 여부 미확인', notApplicable: '해당 없음' })[status] || '미확인'
}

function publicAsset(path) { return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}` }
