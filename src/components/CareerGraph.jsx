import { useMemo } from 'react'
import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { getMindmapNode, mindmapEdges, mindmapNodes } from '../mindmapData.js'

const graphKinds = new Set(['jobFamily', 'role', 'concept', 'technology', 'standard', 'industry'])

function familyPosition(index) {
  return { x: 20 + (index % 3) * 250, y: 20 + Math.floor(index / 3) * 135 }
}

function rolePosition(roleIndex) {
  return { x: 810, y: 28 + roleIndex * 68 }
}

function resourcePosition(index) {
  return { x: 1050, y: 28 + index * 76 }
}

export default function CareerGraph({ selectedId, onSelect }) {
  const { nodes, edges } = useMemo(() => {
    const families = mindmapNodes.filter((node) => node.kind === 'jobFamily')
    const roles = mindmapNodes.filter((node) => node.kind === 'role')
    const selectedNode = getMindmapNode(selectedId)
    const selectedRole = selectedNode?.kind === 'role' ? selectedNode : null
    const selectedFamilyId = selectedNode?.kind === 'jobFamily' ? selectedNode.id : selectedRole?.jobFamilyId
    const visibleRoles = selectedFamilyId ? roles.filter((role) => role.jobFamilyId === selectedFamilyId) : []
    const visibleResourceIds = selectedRole
      ? [...new Set([...selectedRole.foundationConceptIds, ...selectedRole.skillIds, ...selectedRole.technologyIds, ...selectedRole.standardIds])]
      : []
    const resources = visibleResourceIds.map(getMindmapNode).filter((node) => node && graphKinds.has(node.kind))
    const rendered = []

    families.forEach((family, familyIndex) => {
      rendered.push({ id: family.id, position: familyPosition(familyIndex), data: { label: family.title, subtitle: '직무군' }, className: `career-flow-node kind-${family.kind}${selectedId === family.id ? ' selected' : ''}`, draggable: false })
    })

    visibleRoles.forEach((role, roleIndex) => {
      rendered.push({ id: role.id, position: rolePosition(roleIndex), data: { label: role.title, subtitle: '세부 직무' }, className: `career-flow-node kind-role${selectedId === role.id ? ' selected' : ''}`, draggable: false })
    })

    resources.forEach((resource, index) => {
      rendered.push({ id: resource.id, position: resourcePosition(index), data: { label: resource.title, subtitle: resource.kind === 'concept' ? '개념' : resource.kind === 'technology' ? '기술·도구' : '표준' }, className: `career-flow-node kind-${resource.kind}${selectedId === resource.id ? ' selected' : ''}`, draggable: false })
    })

    const visibleIds = new Set(rendered.map((node) => node.id))
    const renderedEdges = mindmapEdges.filter((edge) => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId)).map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: 'smoothstep',
      animated: edge.sourceId === selectedId || edge.targetId === selectedId,
      className: `career-flow-edge edge-${edge.type}`,
    }))
    return { nodes: rendered, edges: renderedEdges }
  }, [selectedId])

  return <div className="career-flow" aria-label="직무군과 세부 직무 연결 그래프">
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      minZoom={0.25}
      maxZoom={1.5}
      nodesConnectable={false}
      nodesDraggable={false}
      onNodeClick={(_, node) => onSelect?.(node.id)}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={24} size={1} color="#cbd5d2" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable nodeColor={(node) => node.className?.includes('kind-jobFamily') ? '#147d80' : node.className?.includes('kind-role') ? '#506671' : '#a8b6b3'} />
    </ReactFlow>
  </div>
}
