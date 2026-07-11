import { useMemo, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, FileSearch, Search } from 'lucide-react'
import { getJobSource, individualVacancies, mindmapNodes } from '../mindmapData.js'

const evidenceLabel = {
  unavailable: '개별 공고 근거 미확보',
  unknown: '확인 상태 미상',
  verified: '검증됨',
}

function sourceTypeLabel(source) {
  if (source.sourceType === 'individualVacancy') return '개별 채용공고'
  if (source.sourceType === 'careerGuide') return '공식 진로 가이드'
  if (source.sourceType === 'fairExhibitorProfile') return '참가기업 프로필'
  return '확인 메모'
}

export default function CareerEvidenceView({ selectedId, onSelect }) {
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLocaleLowerCase('ko-KR')
  const roles = useMemo(() => mindmapNodes.filter((node) => node.kind === 'role').filter((role) => {
    if (!normalized) return true
    return [role.title, role.summary, ...role.actualWork, ...role.deliverables].join(' ').toLocaleLowerCase('ko-KR').includes(normalized)
  }), [normalized])

  return <section className="career-evidence-view">
    <header><div><span>EVIDENCE VIEW</span><h2>직무명보다 실제 업무와 산출물로 비교</h2><p>공식 진로 가이드, 참가기업 프로필, 개별 채용공고를 같은 근거로 취급하지 않습니다. 확인되지 않은 개별 공고는 수치로 집계하지 않습니다.</p></div><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="직무·업무·산출물 검색" aria-label="직무 근거 검색" /></label></header>
    <div className="career-evidence-table" role="table" aria-label="보안 직무 근거 비교표">
      <div role="row" className="career-evidence-head"><span role="columnheader">직무</span><span role="columnheader">실제 업무</span><span role="columnheader">대표 산출물</span><span role="columnheader">채용 근거 상태</span></div>
      {roles.map((role) => {
        const evidence = role.jobEvidence || {}
        const linkedSources = role.jobSourceIds.map(getJobSource).filter(Boolean)
        const vacancySources = linkedSources.filter((source) => source.isIndividualVacancy)
        return <button type="button" role="row" key={role.id} className={selectedId === role.id ? 'selected' : ''} onClick={() => onSelect?.(role.id)}><span role="cell"><BriefcaseBusiness size={16} /><strong>{role.title}</strong><small>{role.summary}</small></span><span role="cell">{role.actualWork.slice(0, 2).map((item) => <em key={item}>{item}</em>)}</span><span role="cell">{role.deliverables.slice(0, 3).map((item) => <em key={item}>{item}</em>)}</span><span role="cell" className="evidence-status"><b className={`status-${evidence.evidenceStatus || 'unavailable'}`}>{evidenceLabel[evidence.evidenceStatus] || '근거 상태 확인 필요'}</b><small>확인일 {evidence.checkedDate || '미확인'} · 개별 공고 {vacancySources.length ? `${vacancySources.length}건 연결` : '연결 없음'}</small><i>{linkedSources.map((source) => sourceTypeLabel(source)).join(' · ') || '출처 없음'}</i></span><ArrowRight size={16} /></button>
      })}
    </div>
    <footer><FileSearch size={18} /><p>개별 채용공고 데이터 {individualVacancies.length}건. 현재 이 화면은 공고가 없다는 시장 결론을 내리지 않으며, 검증된 공고가 추가될 때만 표본 수·반복 요구사항을 표시합니다.</p></footer>
  </section>
}
