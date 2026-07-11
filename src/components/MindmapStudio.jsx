import React, { useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  FileJson,
  Focus,
  Image as ImageIcon,
  Maximize2,
  Minus,
  Plus,
  Printer,
  Search,
  Upload,
  X,
} from 'lucide-react'
import { allMindmapNodes, careerLanes, mindmapBranches, mindmapReferences } from '../mindmapData'

const statusOptions = [
  ['unknown', '모름'], ['heard', '들어봄'], ['explain', '설명 가능'], ['practice', '실습 가능'], ['learn', '더 배우고 싶음'],
]

export default function MindmapStudio({ progress, updateProgress, notify, fullPage = false }) {
  const mapState = progress.mindmap
  const [query, setQuery] = useState('')
  const [zoom, setZoom] = useState(85)
  const [expanded, setExpanded] = useState(() => Object.fromEntries(mindmapBranches.map((item, index) => [item.id, index < 4])))
  const [selectedId, setSelectedId] = useState('xss')
  const [customLabel, setCustomLabel] = useState('')
  const [customBranch, setCustomBranch] = useState('application')
  const [reference, setReference] = useState(null)
  const importRef = useRef(null)

  const allNodes = useMemo(() => [...allMindmapNodes, ...(mapState.customNodes || [])], [mapState.customNodes])
  const selected = allNodes.find((node) => node.id === selectedId) || allNodes[0]
  const normalized = query.trim().toLowerCase()
  const visibleBranches = useMemo(() => mindmapBranches.map((branch) => ({
    ...branch,
    nodes: branch.nodes.filter((node) => !normalized || `${node.label} ${node.definition} ${node.category} ${node.relatedRoles.join(' ')}`.toLowerCase().includes(normalized)),
    customNodes: (mapState.customNodes || []).filter((node) => node.branchId === branch.id && (!normalized || node.label.toLowerCase().includes(normalized))),
  })).filter((branch) => !normalized || branch.nodes.length || branch.customNodes.length || branch.label.toLowerCase().includes(normalized)), [normalized, mapState.customNodes])

  const updateMindmap = (patch) => updateProgress((current) => ({ ...current, mindmap: { ...current.mindmap, ...patch } }))
  const setNodeStatus = (value) => updateMindmap({ statuses: { ...mapState.statuses, [selected.id]: value } })
  const setNodeNote = (value) => updateMindmap({ notes: { ...mapState.notes, [selected.id]: value } })
  const setInterest = (id, checked) => updateMindmap({ interests: checked ? [...new Set([...mapState.interests, id])] : mapState.interests.filter((item) => item !== id) })
  const markedCount = Object.keys(mapState.statuses).filter((id) => mapState.statuses[id]).length
  const noteCount = Object.values(mapState.notes).filter((value) => String(value).trim().length >= 5).length
  const complete = markedCount >= 10 && noteCount >= 3 && mapState.interests.length >= 2

  const addCustomNode = () => {
    const label = customLabel.trim()
    if (!label) return
    const id = `custom-${Date.now()}`
    const branch = mindmapBranches.find((item) => item.id === customBranch)
    const node = {
      id,
      branchId: customBranch,
      label,
      category: branch?.label || '사용자 정의',
      definition: '학습자가 추가한 개인 탐색 노드입니다.',
      importance: '수업 중 발견한 관심 주제를 기존 보안 지도에 연결합니다.',
      offensiveExample: '허가된 환경에서 필요한 검증 관점을 메모로 보완하세요.',
      defensiveExample: '보호할 자산과 적용할 통제를 메모로 보완하세요.',
      relatedWeeks: [], prerequisites: [], relatedRoles: [], references: [], custom: true,
    }
    updateMindmap({ customNodes: [...mapState.customNodes, node] })
    setSelectedId(id)
    setCustomLabel('')
    notify?.('사용자 정의 노드를 추가했습니다.')
  }

  const exportMap = () => {
    const data = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), mindmap: mapState }, null, 2)
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sectrack-week0-mindmap.json'
    anchor.click()
    URL.revokeObjectURL(url)
    notify?.('마인드맵 JSON을 내보냈습니다.')
  }

  const importMap = (file) => {
    if (!file) return
    if (file.size > 512 * 1024) {
      notify?.('마인드맵 JSON은 512KB 이하만 가져올 수 있습니다.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const incoming = parsed.mindmap || parsed
        if (!incoming || typeof incoming !== 'object') throw new Error('invalid')
        const customNodes = (Array.isArray(incoming.customNodes) ? incoming.customNodes : []).slice(0, 50).filter((node) => node && typeof node.label === 'string').map((node, index) => ({
          id: `custom-imported-${index}-${Date.now()}`,
          branchId: mindmapBranches.some((branch) => branch.id === node.branchId) ? node.branchId : 'emerging',
          label: node.label.trim().slice(0, 80),
          category: '사용자 정의',
          definition: '가져온 개인 탐색 노드입니다.',
          importance: '개인 학습 지도에 추가한 관심 주제입니다.',
          offensiveExample: '허가된 환경의 검증 관점을 메모로 보완하세요.',
          defensiveExample: '보호할 자산과 통제를 메모로 보완하세요.',
          relatedWeeks: [], prerequisites: [], relatedRoles: [], references: [], custom: true,
        })).filter((node) => node.label)
        const allowedNodeIds = new Set([...allMindmapNodes.map((node) => node.id), ...customNodes.map((node) => node.id)])
        const allowedStatuses = new Set(statusOptions.map(([value]) => value))
        const statuses = Object.fromEntries(Object.entries(incoming.statuses || {}).filter(([id, value]) => allowedNodeIds.has(id) && allowedStatuses.has(value)))
        const notes = Object.fromEntries(Object.entries(incoming.notes || {}).filter(([id, value]) => allowedNodeIds.has(id) && typeof value === 'string').map(([id, value]) => [id, value.slice(0, 2000)]))
        const roleIds = new Set(careerLanes.map((lane) => lane.id))
        updateMindmap({
          statuses,
          notes,
          customNodes,
          interests: Array.isArray(incoming.interests) ? incoming.interests.filter((id) => roleIds.has(id)).slice(0, 4) : [],
        })
        notify?.('마인드맵 JSON을 가져왔습니다.')
      } catch {
        notify?.('올바른 SecTrack 마인드맵 JSON이 아닙니다.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className={`${fullPage ? 'page-width ' : ''}mindmap-page`}>
      {fullPage && <header className="mindmap-intro"><span>WEEK 00 · INTERACTIVE MAP</span><h2>정보보안 전체 지도</h2><p>기술 이름과 직무 이름, 적용 산업을 같은 층에 놓지 않고 연결 관계로 읽습니다. 검색하거나 노드를 선택하면 정의·공격·방어·관련 주차를 확인할 수 있습니다.</p></header>}

      <section className="mindmap-progress-strip" aria-label="마인드맵 실습 완료 조건">
        <div className={markedCount >= 10 ? 'done' : ''}><span>{markedCount >= 10 && <Check size={14} />}</span><strong>상태 지정</strong><small>{markedCount} / 10개</small></div>
        <div className={mapState.interests.length >= 2 ? 'done' : ''}><span>{mapState.interests.length >= 2 && <Check size={14} />}</span><strong>관심 직무</strong><small>{mapState.interests.length} / 2개</small></div>
        <div className={noteCount >= 3 ? 'done' : ''}><span>{noteCount >= 3 && <Check size={14} />}</span><strong>개인 메모</strong><small>{noteCount} / 3개</small></div>
        <b>{complete ? 'Week 0 지도 완료' : '지도를 살펴보는 중'}</b>
      </section>

      <div className="mindmap-toolbar">
        <label className="map-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="기술·직무·산업 검색" />{query && <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기"><X size={14} /></button>}</label>
        <div className="zoom-control"><button type="button" onClick={() => setZoom((value) => Math.max(60, value - 10))} aria-label="축소"><Minus size={16} /></button><input type="range" min="60" max="120" step="5" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="마인드맵 확대 비율" /><span>{zoom}%</span><button type="button" onClick={() => setZoom((value) => Math.min(120, value + 10))} aria-label="확대"><Plus size={16} /></button><button type="button" onClick={() => setZoom(85)} title="전체 맞춤" aria-label="전체 맞춤"><Focus size={16} /></button></div>
        <div className="map-commands"><button type="button" onClick={exportMap}><Download size={15} />JSON</button><button type="button" onClick={() => importRef.current?.click()}><Upload size={15} />가져오기</button><input ref={importRef} type="file" accept="application/json" hidden onChange={(event) => importMap(event.target.files?.[0])} /><button type="button" onClick={() => window.print()}><Printer size={15} />인쇄</button></div>
      </div>

      <div className="mindmap-workspace">
        <div className="mindmap-canvas" aria-label="인터랙티브 정보보안 마인드맵">
          <div className="mindmap-zoom-layer" style={{ transform: `scale(${zoom / 100})`, width: `${10000 / zoom}%` }}>
            <div className="mindmap-root-node"><ShieldRoot /><span><small>WEEK 00</small><strong>정보보안</strong><em>자산을 보호하고 위험을 관리한다</em></span></div>
            <div className="mindmap-branches">
              {visibleBranches.map((branch) => {
                const isExpanded = expanded[branch.id] || normalized
                const nodes = [...branch.nodes, ...branch.customNodes]
                return <section className={`mindmap-branch branch-${branch.id}`} key={branch.id}><button type="button" className="branch-head" onClick={() => setExpanded((current) => ({ ...current, [branch.id]: !current[branch.id] }))}><span>{isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</span><strong>{branch.label}</strong><small>{branch.nodes.length + branch.customNodes.length}</small></button>{isExpanded && <div className="branch-nodes">{nodes.length ? nodes.map((node) => { const status = mapState.statuses[node.id]; const active = selectedId === node.id; return <button type="button" key={node.id} className={`${active ? 'active' : ''} ${status ? `node-${status}` : ''}`} onClick={() => setSelectedId(node.id)}><span />{node.label}{node.custom && <em>내 노드</em>}</button> }) : <p>검색 결과 없음</p>}</div>}</section>
              })}
            </div>
          </div>
        </div>

        <aside className="node-inspector">
          <header><span>{selected.category}</span><h2>{selected.label}</h2>{selected.custom && <small>사용자 정의 노드</small>}</header>
          <label className="node-status"><span>현재 상태</span><select value={mapState.statuses[selected.id] || ''} onChange={(event) => setNodeStatus(event.target.value)}><option value="">선택 안 함</option>{statusOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><ChevronDown size={14} /></label>
          <section><h3>한 줄 정의</h3><p>{selected.definition}</p></section>
          <section><h3>왜 중요한가</h3><p>{selected.importance}</p></section>
          <section className="dual-example"><div><small>공격 관점</small><p>{selected.offensiveExample}</p></div><div><small>방어 관점</small><p>{selected.defensiveExample}</p></div></section>
          <section><h3>관련 직무</h3><div className="inspector-tags">{selected.relatedRoles.length ? selected.relatedRoles.map((role) => <span key={role}>{role}</span>) : <span>개인 메모에서 연결</span>}</div></section>
          <section><h3>연결 주차</h3><div className="inspector-tags">{selected.relatedWeeks.length ? selected.relatedWeeks.map((week) => <span key={week}>Week {week}</span>) : <span>미지정</span>}</div></section>
          <label className="node-note"><span>개인 메모</span><textarea rows="5" value={mapState.notes[selected.id] || ''} onChange={(event) => setNodeNote(event.target.value)} placeholder="이 용어를 다시 설명할 때 필요한 문장이나 질문을 적으세요." /></label>
        </aside>
      </div>

      <section className="mindmap-below-grid">
        <div className="career-interest"><header><span>CAREER LINK</span><h2>관심 직무 2개 선택</h2><p>직무를 고른 뒤 관련 기술 노드를 검색해 상태와 메모를 남깁니다.</p></header>{careerLanes.map((lane) => <label key={lane.id}><input type="checkbox" checked={mapState.interests.includes(lane.id)} onChange={(event) => setInterest(lane.id, event.target.checked)} /><span><strong>{lane.label}</strong><small>{lane.title}</small><p>{lane.roles.join(' · ')}</p></span></label>)}</div>
        <div className="custom-node-form"><header><span>PERSONAL MAP</span><h2>사용자 노드 추가</h2><p>수업 중 발견한 관심 주제를 기존 큰 가지에 연결합니다.</p></header><label><span>연결할 가지</span><select value={customBranch} onChange={(event) => setCustomBranch(event.target.value)}>{mindmapBranches.map((branch) => <option value={branch.id} key={branch.id}>{branch.label}</option>)}</select></label><label><span>노드 이름</span><input value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} placeholder="예: 위성 통신 보안" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustomNode() } }} /></label><button className="button primary" type="button" onClick={addCustomNode}><Plus size={16} />노드 추가</button></div>
      </section>

      <details className="mindmap-text-view"><summary>스크린리더·텍스트 목록으로 보기</summary>{mindmapBranches.map((branch) => <section key={branch.id}><h3>{branch.label}</h3><p>{branch.description}</p><ul>{branch.nodes.map((node) => <li key={node.id}><strong>{node.label}</strong> · {node.definition}</li>)}</ul></section>)}</details>

      <section className="mindmap-reference-gallery"><header><span>ORIGINAL REFERENCES</span><h2>업로드된 마인드맵 참고 이미지</h2><p>중앙에서 가지가 뻗는 구조만 참고했고, 현재 분류와 설명은 Week 0 교육 목표에 맞게 다시 구성했습니다.</p></header><div>{mindmapReferences.map((item) => <button type="button" key={item.image} onClick={() => setReference(item)}><img src={publicAsset(item.image)} alt={item.title} /><span><ImageIcon size={15} />{item.title}<Maximize2 size={14} /></span></button>)}</div></section>

      {reference && <div className="modal-layer" role="dialog" aria-modal="true" aria-label={reference.title}><button className="modal-backdrop" type="button" onClick={() => setReference(null)} aria-label="닫기" /><div className="image-modal mindmap-reference-modal"><button type="button" className="icon-button" onClick={() => setReference(null)} aria-label="닫기"><X size={20} /></button><img src={publicAsset(reference.image)} alt={reference.title} /></div></div>}
    </div>
  )
}

function ShieldRoot() {
  return <span className="root-glyph"><FileJson size={23} /></span>
}

function publicAsset(path) { return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}` }
