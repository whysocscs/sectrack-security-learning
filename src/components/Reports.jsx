import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  LockKeyhole,
  PencilLine,
  Printer,
  Save,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import {
  completedExampleReport,
  emptyReport,
  publicReportResources,
  reportFieldMeta,
  reportSections,
  studentReportCases,
} from '../reportData'
import {
  createDraftFromSample,
  findSensitiveData,
  findingProfiles,
  findingStatuses,
  redactFinding,
  reportQualityScore,
  reportToMarkdown,
  validateFinding,
} from '../reportSchema'

export function ReportsPage({ progress, navigate }) {
  const draft = progress.reports['local-xss-draft'] || emptyReport
  const draftScore = reportQualityScore(draft)
  const [openCase, setOpenCase] = useState(studentReportCases[0].id)
  return (
    <div className="page-width reports-page">
      <section className="report-index-head">
        <div><span>WEEK 04 · FINDING WORKSPACE</span><h2>취약점은 발견보다 설명에서 완성됩니다</h2><p>입력 지점과 실행 위치, 실제 영향, 근본 수정, 재시험을 한 사람이 그대로 따라 할 수 있는 문서로 연결합니다.</p></div>
        <button className="button primary" type="button" onClick={() => navigate({ page: 'report-editor', reportId: 'local-xss-draft' })}><PencilLine size={16} />XSS Finding 작성</button>
      </section>

      <div className="report-file-list">
        <button type="button" onClick={() => navigate({ page: 'report-editor', reportId: 'local-xss-draft' })}><span className="file-icon"><FileText size={20} /></span><span><small>DRAFT · W4-XSS-001</small><strong>{draft.title || '제목을 작성하지 않은 XSS Finding'}</strong><p>최근 저장 {draft.updatedAt ? new Date(draft.updatedAt).toLocaleString('ko-KR') : '아직 저장하지 않음'}</p></span><span className="report-score"><small>품질 점검</small><strong>{draftScore}%</strong></span><ChevronRight size={18} /></button>
        <button type="button" onClick={() => navigate({ page: 'report-editor', reportId: completedExampleReport.id })}><span className="file-icon sample"><FileCheck2 size={20} /></span><span><small>SAMPLE · W4-XSS-001</small><strong>{completedExampleReport.title}</strong><p>로컬 교육용 Route를 사용한 완성 예시</p></span><span className="report-score"><small>상태</small><strong>읽기 전용</strong></span><ChevronRight size={18} /></button>
      </div>

      <section className="student-case-library">
        <header><span>UPLOADED REPORT · RESTRUCTURED</span><h2>학생형 보고서 6개 사례를 Finding 관점으로 다시 읽기</h2><p>업로드된 PDF의 화면별 사례를 원문 복제 없이 Source·Transform·Sink·Context·근본 원인·증거 항목으로 재구성했습니다.</p></header>
        <div className="case-layout"><nav>{studentReportCases.map((item, index) => <button type="button" key={item.id} className={openCase === item.id ? 'active' : ''} onClick={() => setOpenCase(item.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><small>{item.type}</small></button>)}</nav>{studentReportCases.filter((item) => item.id === openCase).map((item) => <article className="case-detail" key={item.id}><header><span>{item.type}</span><h3>{item.title}</h3><p>{item.location}</p></header><div className="case-flow"><FlowBox label="Source" value={item.source} /><ArrowRight size={15} /><FlowBox label="Transform" value={item.transform} /><ArrowRight size={15} /><FlowBox label="Sink" value={item.sink} /><ArrowRight size={15} /><FlowBox label="Context" value={item.context} /></div><section><h4>어떻게 발견하는가</h4><p>{item.discovery}</p></section><section><h4>공격 시나리오를 어떻게 설명하는가</h4><p>{item.scenario}</p></section><section><h4>근본 원인</h4><p>{item.rootCause}</p></section><section><h4>수정과 재시험</h4><p>{item.remediation}</p></section><footer><strong>필요한 증거</strong>{item.evidence.map((evidence) => <span key={evidence}>{evidence}</span>)}</footer></article>)}</div>
      </section>

      <section className="report-reference-list"><header><span>PUBLIC REPORT STRUCTURE</span><h2>전문 보고서에서 볼 항목</h2><p>내용을 복사하는 자료가 아니라 목적·범위·Finding ID·PoC·Fix Note·재시험 배치 방식을 확인하는 자료입니다.</p></header>{publicReportResources.map((item) => <a href={item.url} target="_blank" rel="noreferrer" key={item.url}><span>{item.org}</span><strong>{item.title}</strong><p>{item.use}</p><ExternalLink size={16} /></a>)}</section>
    </div>
  )
}

function FlowBox({ label, value }) { return <div><small>{label}</small><strong>{value}</strong></div> }

export function ReportEditor({ reportId, progress, updateProgress, navigate, notify }) {
  const isSample = reportId === completedExampleReport.id
  const report = isSample ? completedExampleReport : { ...emptyReport, ...(progress.reports[reportId] || {}) }
  const [sectionId, setSectionId] = useState('scope')
  const [preview, setPreview] = useState(false)
  const checks = useMemo(() => validateFinding(report), [report])
  const score = reportQualityScore(report)
  const currentSection = reportSections.find((item) => item.id === sectionId) || reportSections[0]
  const sensitive = findSensitiveData(Object.values(report).filter((value) => typeof value === 'string').join('\n'))
  const passedCount = checks.filter((item) => item.pass).length

  const updateField = (field, value) => {
    if (isSample) return
    updateProgress((current) => ({
      ...current,
      reports: {
        ...current.reports,
        [reportId]: { ...emptyReport, ...(current.reports[reportId] || {}), [field]: value, updatedAt: new Date().toISOString() },
      },
    }))
  }

  const maskEvidence = () => {
    const redacted = redactFinding(report)
    updateProgress((current) => ({
      ...current,
      reports: {
        ...current.reports,
        [reportId]: {
          ...emptyReport,
          ...(current.reports[reportId] || {}),
          ...redacted,
          updatedAt: new Date().toISOString(),
        },
      },
    }))
    notify('Finding의 모든 문자열 필드에서 민감정보 패턴을 `[REDACTED]`로 바꿨습니다.')
  }

  const copySample = () => {
    const next = createDraftFromSample(completedExampleReport, emptyReport)
    updateProgress((current) => ({ ...current, reports: { ...current.reports, 'local-xss-draft': next } }))
    notify('섹션 구조와 분류만 새 초안으로 만들었습니다. 예시의 대상·재현·영향·수정 답안은 복사하지 않았습니다.')
    navigate({ page: 'report-editor', reportId: 'local-xss-draft' })
  }

  const exportMarkdown = () => {
    const content = reportToMarkdown(report)
    const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${report.findingId || 'finding'}.md`
    anchor.click()
    URL.revokeObjectURL(url)
    notify('마스킹을 적용한 Markdown을 내보냈습니다.')
  }

  const submit = () => {
    if (!findingProfiles[report.profile || 'xss']?.implemented) {
      notify('이 Finding 유형은 공통 필드 저장만 지원하며 전용 품질 검사는 아직 제공하지 않습니다.')
      return
    }
    if (score < 70 || sensitive.length) {
      notify('품질 70% 이상과 민감정보 마스킹을 먼저 확인하세요.')
      return
    }
    updateField('status', 'completed')
    notify('Finding을 작성 완료로 표시했습니다.')
  }

  return (
    <div className="report-editor-page">
      <div className="editor-topbar page-width"><button className="back-link" type="button" onClick={() => navigate({ page: 'reports' })}><ArrowLeft size={16} />보고서 목록</button><div className="editor-file-state"><span>{isSample ? '완성 예시 · 읽기 전용' : '이 브라우저에 자동 저장'}</span>{!isSample && <Save size={14} />}</div><div className="editor-actions"><button type="button" onClick={() => setPreview((value) => !value)}>{preview ? '편집 보기' : '전체 미리보기'}</button><button type="button" onClick={exportMarkdown}><Download size={15} />Markdown</button><button type="button" onClick={() => window.print()}><Printer size={15} />인쇄</button>{isSample ? <button className="button primary" type="button" onClick={copySample}><ClipboardCopy size={15} />내 초안으로 복사</button> : <button className="button primary" type="button" onClick={submit}>작성 완료<ArrowRight size={15} /></button>}</div></div>
      {!isSample && sensitive.length > 0 && <div className="editor-redaction-alert page-width"><AlertTriangle size={18} /><div><strong>민감정보 마스킹 필요</strong><p>{sensitive.map((item) => item.label).join(', ')} 패턴이 증거에 남아 있습니다.</p></div><button type="button" onClick={maskEvidence}>자동 마스킹</button></div>}

      {preview ? <ReportPreview report={report} checks={checks} /> : <div className="report-editor-layout">
        <aside className="report-outline"><header><span>{report.findingId}</span><h2>{report.title || '제목 미작성'}</h2><small>{isSample ? 'READ ONLY' : 'DRAFT'}</small></header><nav>{reportSections.map((section, index) => { const sectionChecks = checksForSection(section.id, checks); const complete = sectionChecks.length && sectionChecks.every((item) => item.pass); return <button type="button" key={section.id} className={sectionId === section.id ? 'active' : ''} onClick={() => setSectionId(section.id)}><span>{complete ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span><strong>{section.label.split('. ')[1]}</strong><ChevronRight size={14} /></button> })}</nav><div className="outline-score"><div><span>품질 점검</span><strong>{score}%</strong></div><i><b style={{ width: `${score}%` }} /></i><small>{passedCount} / {checks.length}개 통과</small></div></aside>

        <main className="report-form"><header><span>{currentSection.label}</span><h2>{sectionTitle(currentSection.id)}</h2><p>{sectionDescription(currentSection.id)}</p></header><div className="report-fields">{currentSection.fields.map((field) => <ReportField key={field} field={field} value={report[field] ?? ''} update={updateField} readOnly={isSample} />)}</div>{currentSection.id === 'fix' && <div className="retest-note"><RefreshIcon /><div><strong>수정 완료와 재시험 완료는 다릅니다.</strong><p>개발자가 수정했다고 알려온 상태는 `Retest Required`입니다. 같은 입력·컨텍스트·역할에서 실행되지 않는 증거를 확인한 뒤 `Fixed`로 바꿉니다.</p></div></div>}</main>

        <aside className="quality-panel"><header><div><span>AUTO CHECK</span><h2>품질 체크리스트</h2></div><strong>{score}%</strong></header><div className="quality-checks">{checks.map((item) => <div className={item.pass ? 'pass' : 'fail'} key={item.id}>{item.pass ? <CheckCircle2 size={16} /> : <XCircle size={16} />}<span><strong>{item.label}</strong>{item.detail && !item.pass && <small>{item.detail}</small>}</span></div>)}</div><section><ShieldCheck size={18} /><div><strong>심각도는 초안</strong><p>자동 추천 숫자가 아니라 사용자 역할, 필요한 상호작용, CSP·Cookie 속성, 실제 기능 권한을 근거로 검토합니다.</p></div></section></aside>
      </div>}
    </div>
  )
}

function ReportField({ field, value, update, readOnly }) {
  const [label, placeholder] = reportFieldMeta[field] || [field, '']
  const shortFields = ['findingId', 'title', 'asset', 'endpoint', 'parameter', 'authPrerequisites', 'environment', 'vulnerabilityType', 'source', 'sink', 'context', 'executionLocation', 'cvssVector', 'cwe', 'owaspMapping']
  if (field === 'status') return <label className="report-field"><span>{label}</span><div className="select-wrap"><select value={value} disabled={readOnly} onChange={(event) => update(field, event.target.value)}>{findingStatuses.map(([id, text]) => <option value={id} key={id}>{text}</option>)}{readOnly && value === 'reviewed' && <option value="reviewed">완성 예시</option>}</select><ChevronDown size={14} /></div></label>
  if (field === 'profile') return <label className="report-field"><span>{label}<small>XSS 전용 검증만 구현됨</small></span><div className="select-wrap"><select value={value || 'xss'} disabled={readOnly} onChange={(event) => update(field, event.target.value)}>{Object.values(findingProfiles).map((profile) => <option value={profile.id} key={profile.id}>{profile.label}{profile.implemented ? '' : ' · 검사 준비 중'}</option>)}</select><ChevronDown size={14} /></div></label>
  if (field === 'severity') return <label className="report-field"><span>{label}<small>CVSS와 비즈니스 위험은 별도 근거로 검토</small></span><div className="select-wrap"><select value={value} disabled={readOnly} onChange={(event) => update(field, event.target.value)}><option>Informational</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select><ChevronDown size={14} /></div></label>
  if (field === 'method') return <label className="report-field"><span>{label}</span><div className="select-wrap"><select value={value} disabled={readOnly} onChange={(event) => update(field, event.target.value)}>{['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'DOM only'].map((method) => <option key={method}>{method}</option>)}</select><ChevronDown size={14} /></div></label>
  if (field === 'cvssVersion') return <label className="report-field"><span>{label}</span><div className="select-wrap"><select value={value || '3.1'} disabled={readOnly} onChange={(event) => update(field, event.target.value)}><option value="3.1">CVSS 3.1</option><option value="4.0">CVSS 4.0</option></select><ChevronDown size={14} /></div></label>
  if (field === 'cvssScore') return <label className="report-field"><span>{label}<small>Vector에서 자동 산출하지 않음</small></span><input type="number" min="0" max="10" step="0.1" value={value} readOnly={readOnly} onChange={(event) => update(field, event.target.value)} placeholder={placeholder} /></label>
  const codeField = ['request', 'response', 'vulnerableCode', 'fixedCode', 'poc'].includes(field)
  if (shortFields.includes(field)) return <label className="report-field"><span>{label}</span><input value={value} readOnly={readOnly} onChange={(event) => update(field, event.target.value)} placeholder={placeholder} /></label>
  return <label className={`report-field report-textarea ${codeField ? 'code-field' : ''}`}><span>{label}{field === 'request' && <small>Cookie·Authorization은 `[REDACTED]` 처리</small>}</span><textarea rows={codeField ? 9 : field === 'reproductionSteps' ? 10 : 6} value={value} readOnly={readOnly} onChange={(event) => update(field, event.target.value)} placeholder={placeholder} spellCheck={!codeField} /></label>
}

function ReportPreview({ report, checks }) {
  const safe = redactFinding(report)
  return <article className="report-preview" id="report-print"><header><span>CONFIDENTIAL · TRAINING ONLY</span><h1>{safe.findingId} · {safe.title || '제목 미작성'}</h1><div><strong>{safe.severity}</strong><span>{findingStatuses.find(([id]) => id === safe.status)?.[1] || safe.status}</span></div></header><section className="preview-facts"><div><small>자산</small><strong>{safe.asset}</strong></div><div><small>Endpoint</small><strong>{safe.method} {safe.endpoint}</strong></div><div><small>CVSS</small><strong>{safe.cvssVersion} · {safe.cvssScore || '미평가'}</strong></div><div><small>분류</small><strong>{safe.cwe} · {safe.owaspMapping}</strong></div></section><PreviewSection title="요약" text={safe.summary} /><section><h2>데이터 흐름</h2><div className="preview-flow"><FlowBox label="Source" value={safe.source} /><ArrowRight size={14} /><FlowBox label="Transform" value={safe.transforms} /><ArrowRight size={14} /><FlowBox label="Sink" value={safe.sink} /><ArrowRight size={14} /><FlowBox label="Context" value={safe.context} /></div></section><PreviewSection title="실행 위치" text={safe.executionLocation} /><PreviewSection title="재현 단계" text={safe.reproductionSteps} pre /><section className="preview-evidence"><div><h2>HTTP Request</h2><pre>{safe.request}</pre></div><div><h2>HTTP Response</h2><pre>{safe.response}</pre></div></section><PreviewSection title="관찰된 결과" text={safe.observedResult} /><PreviewSection title="기대되는 안전한 결과" text={safe.expectedResult} /><section className="preview-evidence"><div><PreviewSection title="기술적 영향" text={safe.technicalImpact} /></div><div><PreviewSection title="비즈니스 영향" text={safe.businessImpact} /></div></section><PreviewSection title="근본 원인" text={safe.rootCause} /><PreviewSection title="개선 권고" text={safe.remediation} /><PreviewSection title="보조 통제" text={safe.supportingControls} /><section className="preview-evidence"><div><h2>취약 코드</h2><pre>{safe.vulnerableCode}</pre></div><div><h2>수정 코드</h2><pre>{safe.fixedCode}</pre></div></section><PreviewSection title="재시험" text={`${safe.retestProcedure || '-'}\n\n결과: ${safe.retestResult || '미수행'}`} pre /><footer><span>품질 점검</span><strong>{checks.filter((item) => item.pass).length} / {checks.length} 통과</strong><small>자동 점검은 작성자가 사실관계와 근거를 확인하는 과정을 대신하지 않습니다.</small></footer></article>
}

function PreviewSection({ title, text, pre }) { return <section><h2>{title}</h2>{pre ? <pre className="plain-pre">{text || '-'}</pre> : <p>{text || '-'}</p>}</section> }

function checksForSection(id, checks) {
  const map = { scope: ['title', 'target'], flow: ['xss-flow', 'xss-execution'], reproduce: ['steps', 'observation', 'materials', 'redaction'], impact: ['impact', 'root-cause', 'severity', 'classification', 'cvss'], fix: ['fix', 'retest', 'xss-defense', 'xss-supporting-control'] }
  return checks.filter((item) => (map[id] || []).includes(item.id))
}

function sectionTitle(id) {
  return { scope: '무엇을 어디에서 확인했는가', flow: '입력은 어디에서 코드가 되는가', reproduce: '다른 사람이 같은 결과를 볼 수 있는가', impact: '무엇이 실제로 가능하고 왜 발생했는가', fix: '무엇을 바꾸고 어떻게 다시 확인할 것인가' }[id]
}

function sectionDescription(id) {
  return { scope: '자산·Endpoint·입력·권한·환경을 정확히 고정합니다.', flow: 'Source, 중간 처리, Sink, 브라우저 컨텍스트와 실행 위치를 끊김 없이 적습니다.', reproduce: '번호 순서의 단계와 요청·응답·DOM·코드 증거를 남깁니다.', impact: 'CVSS·CWE·WSTG 분류 근거와 기술·비즈니스 영향을 구분합니다.', fix: '근본 수정, 보조 통제, 같은 조건의 재시험을 연결합니다.' }[id]
}

function RefreshIcon() { return <LockKeyhole size={19} /> }
