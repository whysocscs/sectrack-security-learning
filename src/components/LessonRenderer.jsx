import { CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react'
import { weekContent } from '../courseData.js'
import { getConcepts } from '../content/conceptRegistry.js'
import {
  EDUCATIONAL_CODE_NOTICE,
  getLessonBlockAnchor,
  getLessonBlocks,
  validateCheckpointAnswer,
  validateLessonBlock,
} from '../content/lessonSchema.js'
import { getLearningTextLength } from '../validation.js'

function InlineCodeText({ text }) {
  return String(text || '').split(/(`[^`]+`)/g).map((part, index) => (
    part.startsWith('`') && part.endsWith('`')
      ? <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>
      : part
  ))
}

function BlockHeading({ block }) {
  return block.title ? <h3>{block.title}</h3> : null
}

function Checkpoint({ block, value, onChange, number }) {
  const isChoice = Array.isArray(block.options) && block.options.length > 0
  const isAnswered = value?.answer !== undefined && value?.answer !== ''
  const correct = isChoice && isAnswered ? Number(value.answer) === Number(block.answer) : null
  const answerValidation = isChoice || !isAnswered ? null : validateCheckpointAnswer(block, value.answer)
  const hintId = `${block.id}-answer-hint`
  const errorId = `${block.id}-answer-error`
  const resultId = `${block.id}-result`
  const selectedRationale = correct !== null ? block.optionRationales?.[Number(value.answer)] : null
  const updateWrittenAnswer = (answer) => {
    const validation = validateCheckpointAnswer(block, answer)
    onChange({ answer, valid: validation.valid, validationError: validation.reason || null, answeredAt: new Date().toISOString() })
  }
  return (
    <section className="lesson-checkpoint" aria-labelledby={block.id}>
      <header><span>CHECKPOINT {number}</span><BlockHeading block={block} /></header>
      <p id={block.id}><InlineCodeText text={block.prompt} /></p>
      {isChoice
        ? <fieldset className="checkpoint-options" aria-describedby={correct !== null ? resultId : undefined}><legend>답 선택</legend>{block.options.map((option, index) => <label key={option}><input type="radio" name={block.id} checked={Number(value?.answer) === index} onChange={() => onChange({ answer: index, valid: index === Number(block.answer), answeredAt: new Date().toISOString() })} /><span>{option}</span></label>)}</fieldset>
        : <><textarea aria-label={block.title || block.prompt} rows="4" minLength={block.minimumLength} aria-invalid={answerValidation && !answerValidation.valid ? 'true' : undefined} aria-describedby={`${hintId}${answerValidation && !answerValidation.valid ? ` ${errorId}` : ''}`} value={value?.answer || ''} onChange={(event) => updateWrittenAnswer(event.target.value)} placeholder={block.placeholder || '근거가 되는 단어나 관찰을 포함해 짧게 적으세요.'} /><small id={hintId}>관찰값과 해석을 포함해 공백 제외 최소 {block.minimumLength}자로 작성하세요. 현재 {getLearningTextLength(value?.answer)} / {block.minimumLength}자</small>{answerValidation && !answerValidation.valid && <p className="checkpoint-answer-error" id={errorId} role="status" aria-live="polite">{answerValidation.reason}</p>}</>}
      {correct !== null && <div id={resultId} className={`checkpoint-result ${correct ? 'correct' : 'retry'}`} role="status" aria-live="polite"><strong>{correct ? '확인됨' : '다시 읽기'}</strong><span>{selectedRationale || block.explanation || (correct ? '선택한 답이 이 블록의 핵심과 일치합니다.' : '선택지의 조건과 앞선 예시를 다시 대조해 보세요.')}</span></div>}
      {!isChoice && answerValidation?.valid && <small>작성한 답은 이 브라우저에 저장됩니다. 정답 채점 대신 다음 읽기와 실습에 연결할 관찰 기록입니다.</small>}
    </section>
  )
}

function CommandGuide({ block }) {
  return <section className="lesson-command-guide"><BlockHeading block={block} />{block.intro && <p className="command-guide-intro"><InlineCodeText text={block.intro} /></p>}<div className="command-guide-list">{(block.commands || []).map((command) => <article key={command.syntax}><header><code>{command.syntax}</code><p>{command.purpose}</p></header><ul>{(command.options || []).map((option) => <li key={`${command.syntax}-${option.flag}`}><code>{option.flag}</code><span><InlineCodeText text={option.description} /></span></li>)}</ul></article>)}</div></section>
}

function Diagram({ block }) {
  const nodes = block.nodes || block.items || []
  return <section className="lesson-diagram"><BlockHeading block={block} />{block.body && <p><InlineCodeText text={block.body} /></p>}<ol aria-label={block.title || '흐름도'}>{nodes.map((node, index) => <li key={`${node}-${index}`}><span>{index + 1}</span><strong>{typeof node === 'string' ? node : node.label}</strong>{index < nodes.length - 1 && <i aria-hidden="true" />}</li>)}</ol></section>
}

function Comparison({ block, anchorId }) {
  const columns = block.columns || []
  const tableTitle = `${block.title || '개념 비교'} 표`
  const hintId = `${anchorId}-scroll-hint`
  return <section className="lesson-comparison"><BlockHeading block={block} /><p className="table-scroll-hint" id={hintId}>표 전체는 좌우로 스크롤해 읽을 수 있습니다.</p><div className="lesson-table-scroll" tabIndex="0" role="region" aria-label={tableTitle} aria-describedby={hintId}><table><caption>{tableTitle}</caption><thead><tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{(block.rows || []).map((row, index) => <tr key={`${row.join('-')}-${index}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}><InlineCodeText text={cell} /></td>)}</tr>)}</tbody></table></div></section>
}

function getLabTitle(labId) {
  return Object.values(weekContent).flatMap((week) => week.labs).find((lab) => lab.id === labId)?.title || '연결된 실습 열기'
}

function Sources({ block }) {
  return <section className="lesson-sources"><BlockHeading block={block} /><ul>{(block.items || []).map((item) => <li key={item.url || item.label}><a href={item.url} target="_blank" rel="noreferrer"><span>{item.label}</span><ExternalLink size={14} /></a>{item.note && <p>{item.note}</p>}</li>)}</ul></section>
}

function ConceptReference({ block }) {
  const concepts = getConcepts(block.conceptIds)
  return <section className="lesson-concept-ref"><BlockHeading block={block} />{block.intro && <p><InlineCodeText text={block.intro} /></p>}<div>{concepts.map((concept) => <details key={concept.id}><summary><span>{concept.label}</span><small>{concept.english}</small><b>{concept.oneLine}</b></summary><div><p><InlineCodeText text={concept.detail} /></p><a href={concept.coreAnchor}>이 개념이 처음 나오는 곳으로</a></div></details>)}</div></section>
}

function EvidenceBoard({ block }) {
  return <section className="lesson-evidence-board"><BlockHeading block={block} /><div>{(block.sections || []).map((section) => <article key={section.label}><h4>{section.label}</h4><ul>{section.items.map((item) => <li key={item}><InlineCodeText text={item} /></li>)}</ul></article>)}</div></section>
}

function Retest({ block }) {
  return <section className="lesson-retest"><BlockHeading block={block} />{block.intro && <p><InlineCodeText text={block.intro} /></p>}<div role="table" aria-label={block.title || '재시험 표'}><div className="lesson-retest-head" role="row"><span role="columnheader">입력 또는 범위</span><span role="columnheader">확인</span><span role="columnheader">기대 결과</span></div>{(block.rows || []).map((row) => <div key={row.label} role="row"><strong role="cell">{row.label}</strong><span role="cell"><InlineCodeText text={row.check} /></span><span role="cell"><InlineCodeText text={row.expected} /></span></div>)}</div></section>
}

const evidenceLabels = {
  'official-source': '공식 저장소 실제 소스',
  'official-patch': '공식 수정 diff',
  'official-remediation': '공식 공급자 수정 기록',
  'standards-derived': '공식 표준 기반 모델',
  'educational-model': '교육용 구조 모델',
  'actual-project-source': '실제 프로젝트 소스',
  'official-upstream-patch': '공식 upstream patch',
  'standards-derived-model': 'RFC·표준 기반 모델',
  'educational-reconstruction': '교육용 재구성 예제',
  'author-guidance': '작성자 해설·권장 설계',
}

function EvidenceMeta({ block }) {
  const evidenceType = block.evidenceKind || block.sourceType
  const label = evidenceLabels[evidenceType] || '출처 수준 확인 필요'
  return <div className={`lesson-evidence-meta evidence-${evidenceType || 'unknown'}`} aria-label={`자료 유형: ${label}`}>
    <strong>{label}</strong>
    {block.source && <a href={block.source.url} target="_blank" rel="noreferrer"><span>{block.source.label}</span><ExternalLink size={13} /></a>}
  </div>
}

function TechnologyPrimer({ block }) {
  return <article className="lesson-technology-primer">
    <header><span>TECHNOLOGY PRIMER</span><strong>{block.technology}</strong><EvidenceMeta block={block} /></header>
    <BlockHeading block={block} />
    <p className="technology-primer-lead"><InlineCodeText text={block.oneLine} /></p>
    <dl className="technology-primer-context">
      <div><dt>왜 생겼나</dt><dd><InlineCodeText text={block.whyItExists} /></dd></div>
      <div><dt>어디서 동작하나</dt><dd><InlineCodeText text={block.whereItRuns} /></dd></div>
      <div><dt>이번 주와 무슨 관계인가</dt><dd><InlineCodeText text={block.courseConnection} /></dd></div>
    </dl>
    <section><h4>정상 동작을 먼저 따라가기</h4><ol>{block.normalFlow.map((step, index) => <li key={`${index}-${step}`}><span>{index + 1}</span><InlineCodeText text={step} /></li>)}</ol></section>
    <section><h4>이 글에서 쓰는 말</h4><dl className="technology-primer-terms">{block.terms.map((term) => <div key={term.term}><dt>{term.term}</dt><dd><InlineCodeText text={term.meaning} /></dd></div>)}</dl></section>
    {block.notThis?.length > 0 && <section className="technology-primer-not-this"><h4>여기까지 확대해서 말하지 않는다</h4><ul>{block.notThis.map((item) => <li key={item}><InlineCodeText text={item} /></li>)}</ul></section>}
  </article>
}

function PatchLineage({ block }) {
  const availabilityLabels = { public: '실제 소스·diff 공개', partial: '일부 근거 공개', 'not-public': '소스 diff 비공개' }
  return <article className="lesson-patch-lineage">
    <header><span>PATCH LINEAGE</span><strong>{block.cve}</strong><b className={`availability-${block.codeAvailability.status}`}>{availabilityLabels[block.codeAvailability.status]}</b></header>
    <BlockHeading block={block} />
    <p className="patch-code-availability"><strong>코드 공개 범위</strong><InlineCodeText text={block.codeAvailability.explanation} /></p>
    <ol className="patch-lineage-timeline">{block.milestones.map((milestone, index) => <li key={`${milestone.date}-${milestone.label}`}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{milestone.date}</small><strong>{milestone.label}</strong><p><InlineCodeText text={milestone.summary} /></p>{milestone.source && <a href={milestone.source.url} target="_blank" rel="noreferrer"><span>{milestone.source.label}</span><ExternalLink size={13} /></a>}</div></li>)}</ol>
    <dl className="patch-invariant"><div><dt>수정 전 깨진 불변조건</dt><dd><InlineCodeText text={block.invariant.before} /></dd></div><div><dt>수정 뒤 지켜야 할 불변조건</dt><dd><InlineCodeText text={block.invariant.after} /></dd></div></dl>
    {block.followOn && <p className="patch-follow-on"><strong>후속 패치·우회 관계</strong><InlineCodeText text={block.followOn} /></p>}
    <section className="patch-operations"><h4>운영에서 끝내야 할 일</h4><ul>{block.operationalActions.map((action) => <li key={action}><InlineCodeText text={action} /></li>)}</ul></section>
  </article>
}

function GenericCodeProvenance({ block }) {
  return <><EvidenceMeta block={block} />{block.sourceType === 'educational-reconstruction' && <p className="educational-code-notice">{EDUCATIONAL_CODE_NOTICE}</p>}</>
}

function Mechanism({ block }) {
  return <section className="lesson-mechanism">
    <BlockHeading block={block} />
    <p className="mechanism-situation"><strong>이 기능이 필요한 상황</strong><InlineCodeText text={block.situation} /></p>
    <dl className="mechanism-terms">{block.terms.map((term) => <div key={term.term}><dt>{term.term}</dt><dd><p>{term.meaning}</p><small>{term.contrast}</small></dd></div>)}</dl>
    <ol className="mechanism-stages" aria-label={`${block.title || '정상 동작'} 단계`}>{block.stages.map((stage, index) => <li key={`${stage.label}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><div><header><strong>{stage.label}</strong><small>{stage.actor}</small></header><dl><div><dt>들어오는 값</dt><dd><InlineCodeText text={stage.input} /></dd></div><div><dt>하는 일</dt><dd><InlineCodeText text={stage.action} /></dd></div><div><dt>나가는 값</dt><dd><InlineCodeText text={stage.output} /></dd></div></dl></div></li>)}</ol>
    <div className="mechanism-boundary"><strong>신뢰 경계</strong><dl><div><dt>경계 앞</dt><dd><InlineCodeText text={block.trustBoundary.before} /></dd></div><div><dt>판단 책임</dt><dd><InlineCodeText text={block.trustBoundary.decision} /></dd></div><div><dt>통과 뒤</dt><dd><InlineCodeText text={block.trustBoundary.after} /></dd></div><div><dt>실패하면</dt><dd><InlineCodeText text={block.trustBoundary.failure} /></dd></div></dl></div>
  </section>
}

function CodeTrace({ block }) {
  return <article className="lesson-code-trace">
    <header><EvidenceMeta block={block} /><BlockHeading block={block} /></header>
    {block.evidenceKind === 'educational-model' && <p className="educational-code-notice">{EDUCATIONAL_CODE_NOTICE}</p>}
    {block.description && <p className="code-trace-description"><InlineCodeText text={block.description} /></p>}
    <pre tabIndex="0" aria-label={`${block.title || '코드 추적'} 코드 영역`}><code>{block.code}</code></pre>
    <ol className="code-trace-steps">{block.trace.map((step) => <li key={`${step.lines}-${step.action}`}><strong>줄 {step.lines}</strong><dl><div><dt>실행 전</dt><dd><InlineCodeText text={step.before} /></dd></div><div><dt>이 줄의 동작</dt><dd><InlineCodeText text={step.action} /></dd></div><div><dt>실행 후</dt><dd><InlineCodeText text={step.after} /></dd></div></dl></li>)}</ol>
  </article>
}

function buildLineDiff(beforeCode, afterCode) {
  const before = String(beforeCode || '').split('\n')
  const after = String(afterCode || '').split('\n')
  const table = Array.from({ length: before.length + 1 }, () => Array(after.length + 1).fill(0))
  for (let left = before.length - 1; left >= 0; left -= 1) {
    for (let right = after.length - 1; right >= 0; right -= 1) {
      table[left][right] = before[left] === after[right]
        ? table[left + 1][right + 1] + 1
        : Math.max(table[left + 1][right], table[left][right + 1])
    }
  }
  const rows = []
  let left = 0
  let right = 0
  while (left < before.length || right < after.length) {
    if (left < before.length && right < after.length && before[left] === after[right]) {
      rows.push({ kind: 'context', beforeLine: left + 1, afterLine: right + 1, text: before[left] })
      left += 1
      right += 1
    } else if (right < after.length && (left === before.length || table[left][right + 1] >= table[left + 1][right])) {
      rows.push({ kind: 'add', beforeLine: null, afterLine: right + 1, text: after[right] })
      right += 1
    } else {
      rows.push({ kind: 'remove', beforeLine: left + 1, afterLine: null, text: before[left] })
      left += 1
    }
  }
  return rows
}

function PatchDiff({ block }) {
  const rows = buildLineDiff(block.before.code, block.after.code)
  return <section className="patch-unified-diff"><h4>두 발췌본을 줄 단위로 비교</h4><p>아래 표시는 위의 실제 발췌본을 화면에서 비교한 결과입니다. 원본 commit 전체 범위는 공식 링크에서 확인하세요.</p><div tabIndex="0" role="region" aria-label={`${block.title || '패치'} 줄 단위 비교`}><pre><code>{rows.map((row, index) => <span className={`diff-${row.kind}`} key={`${index}-${row.text}`}><i aria-hidden="true">{row.beforeLine || ''}</i><i aria-hidden="true">{row.afterLine || ''}</i><b aria-label={row.kind === 'add' ? '추가된 줄' : row.kind === 'remove' ? '삭제된 줄' : '변경 없는 줄'}>{row.kind === 'add' ? '+' : row.kind === 'remove' ? '-' : ' '}</b><em>{row.text || ' '}</em>{'\n'}</span>)}</code></pre></div></section>
}

function PatchAnalysis({ block }) {
  return <article className="lesson-patch-analysis">
    <header><EvidenceMeta block={block} /><BlockHeading block={block} /></header>
    {block.evidenceKind === 'educational-model' && <p className="educational-code-notice">{EDUCATIONAL_CODE_NOTICE}</p>}
    {block.description && <p className="patch-description"><InlineCodeText text={block.description} /></p>}
    <div className="patch-code-grid"><section><h4>{block.before.label}</h4><pre tabIndex="0"><code>{block.before.code}</code></pre></section><section><h4>{block.after.label}</h4><pre tabIndex="0"><code>{block.after.code}</code></pre></section></div>
    <PatchDiff block={block} />
    <section className="patch-changes"><h4>처리 흐름에서 달라진 점</h4><ol>{block.changes.map((change) => <li key={change}><InlineCodeText text={change} /></li>)}</ol></section>
    <section className="patch-regression"><h4>회귀 확인</h4><div role="table" aria-label={`${block.title || '패치'} 회귀 확인`}><div role="row" className="patch-regression-head"><span role="columnheader">시험</span><span role="columnheader">기대 결과</span><span role="columnheader">필요한 이유</span></div>{block.regressionTests.map((test) => <div role="row" key={test.case}><strong role="cell">{test.case}</strong><span role="cell"><InlineCodeText text={test.expected} /></span><span role="cell"><InlineCodeText text={test.reason} /></span></div>)}</div></section>
    <p className="patch-limitation"><strong>확인 범위</strong><InlineCodeText text={block.limitation} /></p>
  </article>
}

function ImpactMap({ block }) {
  const accessLabels = { authentication: '인증·권한', interaction: '사용자 행동', network: '네트워크 조건', defaultExposure: '기본 노출', protections: '보호 장치가 있으면' }
  return <section className="lesson-impact-map">
    <BlockHeading block={block} />
    {block.intro && <p><InlineCodeText text={block.intro} /></p>}
    <div className="impact-dimensions">{block.dimensions.map((dimension) => <article key={dimension.label}><strong>{dimension.label}</strong><p><InlineCodeText text={dimension.impact} /></p><small><b>성립 조건</b> {dimension.condition}</small></article>)}</div>
    <div className="impact-control-grid"><section><h4>공격자가 정할 수 있는 값</h4><ul>{block.attackerControls.map((item) => <li key={item}><InlineCodeText text={item} /></li>)}</ul></section><section><h4>공격자가 직접 정할 수 없는 상태</h4><ul>{block.notControlled.map((item) => <li key={item}><InlineCodeText text={item} /></li>)}</ul></section></div>
    <dl className="impact-access">{Object.entries(accessLabels).map(([key, label]) => <div key={key}><dt>{label}</dt><dd><InlineCodeText text={block.access[key]} /></dd></div>)}</dl>
  </section>
}

function CveCase({ block }) {
  return <article className="lesson-cve-case">
    <header><span>VERIFIED CVE CASE</span><strong>{block.cve}</strong><small>{block.classification}</small></header>
    <BlockHeading block={block} />
    {(block.productRole || block.affectedVersions || block.fixedVersions || block.weakness) && <dl className="cve-profile">
      {block.productRole && <div><dt>제품의 역할</dt><dd><InlineCodeText text={block.productRole} /></dd></div>}
      {block.weakness && <div><dt>실패 유형</dt><dd><InlineCodeText text={block.weakness} /></dd></div>}
      {block.affectedVersions && <div><dt>영향 버전</dt><dd><InlineCodeText text={block.affectedVersions} /></dd></div>}
      {block.fixedVersions && <div><dt>수정 버전</dt><dd><InlineCodeText text={block.fixedVersions} /></dd></div>}
    </dl>}
    <dl>
      <div><dt>공식 원인</dt><dd><InlineCodeText text={block.cause} /></dd></div>
      <div><dt>성립 조건</dt><dd><InlineCodeText text={block.condition} /></dd></div>
      <div><dt>공식 패치</dt><dd><InlineCodeText text={block.patch} /></dd></div>
      <div><dt>후속 연결</dt><dd><InlineCodeText text={block.followOn} /></dd></div>
    </dl>
    <ul>{block.facts.map((fact) => <li key={fact}><CheckCircle2 size={15} /><InlineCodeText text={fact} /></li>)}</ul>
    <p className="cve-case-safety">이 카드는 공개된 원인과 패치만 요약합니다. 실제 CVE 재현 코드·외부 대상·자격 증명은 사용하지 않습니다.</p>
    <div className="cve-case-sources" aria-label={`${block.cve} 공식 근거`}>{block.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>{source.label}</span><ExternalLink size={14} /></a>)}</div>
  </article>
}

function ModuleLearningMeta({ module, blocks }) {
  if (['deep-guide-v2', 'deep-guide-v3', 'case-dossier-v1', 'patch-workshop-v1'].includes(module.contentLevel)) return null
  const estimatedMinutes = Number(module.estimatedMinutes ?? module.duration)
  const learningQuestionBlock = blocks.find((block) => ['question', 'prerequisite-check'].includes(block?.type))
  const learningQuestion = module.learningQuestion || learningQuestionBlock?.body || learningQuestionBlock?.prompt
  const prerequisiteConcepts = getConcepts(module.prerequisiteConceptIds || [])
  if (!(estimatedMinutes > 0) && !learningQuestion && !prerequisiteConcepts.length) return null
  return <dl className="lesson-module-meta" aria-label="모듈 학습 정보">
    {estimatedMinutes > 0 && <div><dt>예상 학습 시간</dt><dd>{estimatedMinutes}분</dd></div>}
    {prerequisiteConcepts.length > 0 && <div><dt>선수 개념</dt><dd>{prerequisiteConcepts.map((concept) => <a key={concept.id} href={concept.coreAnchor}>{concept.label}</a>)}</dd></div>}
    {learningQuestion && <div><dt>이 모듈의 질문</dt><dd><InlineCodeText text={learningQuestion} /></dd></div>}
  </dl>
}

function SectionJump({ moduleId, blocks, duplicateBlockIndexes, activeSectionId, onSectionNavigate, sectionHref }) {
  const sections = blocks.map((block, index) => ({ block, index })).filter(({ block, index }) => !duplicateBlockIndexes.has(index) && (block?.title || block?.type === 'checkpoint'))
  if (sections.length < 2) return null
  return <nav className="lesson-section-jump" aria-label="이 모듈 절 바로 가기"><span>이 모듈에서 바로 가기</span><div>{sections.map(({ block, index }, sectionIndex) => {
    const targetId = getLessonBlockAnchor(moduleId, block, index)
    const label = block.title || `중간 확인 ${sectionIndex + 1}`
    return <a href={sectionHref?.(targetId) || `#${targetId}`} aria-current={activeSectionId === targetId ? 'location' : undefined} key={targetId} onClick={(event) => { if (!onSectionNavigate) return; event.preventDefault(); onSectionNavigate(targetId) }}>{label}</a>
  })}</div></nav>
}

function ContentError({ moduleId, block, index }) {
  const contentId = `${moduleId || 'unknown-module'}:${block?.id || block?.type || `block-${index + 1}`}`
  return <section className="lesson-content-error" role="status" aria-live="polite"><ShieldAlert size={20} /><div><h3>이 학습 항목을 표시할 수 없습니다.</h3><p>콘텐츠 구조를 확인하는 동안 다음 절로 계속할 수 있습니다. 문제가 반복되면 아래 항목 ID를 전달해 주세요.</p><code>{contentId}</code></div></section>
}

export default function LessonRenderer({ module, activeSectionId, onSectionNavigate, sectionHref, checkpointResults = {}, onCheckpoint, onOpenLab }) {
  const blocks = getLessonBlocks(module)
  const moduleId = module?.id || 'unknown-module'
  if (!module || !blocks.length) return <div className="lesson-blocks"><ContentError moduleId={moduleId} block={null} index={0} /></div>
  const seenBlockIds = new Set()
  const duplicateBlockIndexes = new Set()
  blocks.forEach((block, index) => {
    if (!block?.id) return
    if (seenBlockIds.has(block.id)) duplicateBlockIndexes.add(index)
    else seenBlockIds.add(block.id)
  })
  return <div className="lesson-blocks"><ModuleLearningMeta module={module} blocks={blocks} /><SectionJump moduleId={moduleId} blocks={blocks} duplicateBlockIndexes={duplicateBlockIndexes} activeSectionId={activeSectionId} onSectionNavigate={onSectionNavigate} sectionHref={sectionHref} />{blocks.map((block, index) => {
    const baseId = getLessonBlockAnchor(moduleId, block, index)
    const id = duplicateBlockIndexes.has(index) ? `${baseId}-duplicate-${index + 1}` : baseId
    const questionNumber = blocks.slice(0, index + 1).filter((item, itemIndex) => item?.type === 'checkpoint' && !duplicateBlockIndexes.has(itemIndex)).length
    if (duplicateBlockIndexes.has(index) || validateLessonBlock(block, index).length) return <div id={id} key={id}><ContentError moduleId={moduleId} block={block} index={index} /></div>
    if (block.type === 'question' || block.type === 'prerequisite-check') return <section id={id} key={id} className={`lesson-question ${block.type === 'prerequisite-check' ? 'prerequisite' : ''} ${block.variant ? `variant-${block.variant}` : ''}`}><span>{block.type === 'question' ? 'LEARNING QUESTION' : 'BEFORE YOU CONTINUE'}</span><BlockHeading block={block} /><p><InlineCodeText text={block.body || block.prompt} /></p></section>
    if (block.type === 'explanation') return <section id={id} key={id} className={`lesson-explanation ${block.variant ? `variant-${block.variant}` : ''}`}><BlockHeading block={block} />{(block.paragraphs || [block.body]).filter(Boolean).map((paragraph, paragraphIndex) => <p key={`${id}-${paragraphIndex}`}><InlineCodeText text={paragraph} /></p>)}</section>
    if (block.type === 'diagram') return <section id={id} key={id}><Diagram block={block} /></section>
    if (block.type === 'terminal' || block.type === 'http-message' || block.type === 'code') return <section id={id} key={id} className={`lesson-transcript ${block.type}`}><header><span>{block.type === 'terminal' ? 'TERMINAL' : block.type === 'http-message' ? 'HTTP MESSAGE' : (block.language || 'CODE').toUpperCase()}</span><BlockHeading block={block} /></header><GenericCodeProvenance block={block} />{block.description && <p><InlineCodeText text={block.description} /></p>}<pre tabIndex="0" aria-label={`${block.title || '전사'} 코드 영역`}><code>{block.command || block.message || block.code || ''}{block.output ? `\n${block.output}` : ''}</code></pre>{block.annotations?.length ? <ol>{block.annotations.map((annotation, annotationIndex) => <li key={`${annotation}-${annotationIndex}`}><InlineCodeText text={annotation} /></li>)}</ol> : null}</section>
    if (block.type === 'comparison') return <section id={id} key={id}><Comparison block={block} anchorId={id} /></section>
    if (block.type === 'command-guide') return <section id={id} key={id}><CommandGuide block={block} /></section>
    if (block.type === 'timeline') return <section id={id} key={id} className="lesson-timeline"><BlockHeading block={block} /><ol>{(block.items || block.steps || []).map((item, itemIndex, items) => <li key={`${item}-${itemIndex}`}><span>{String(itemIndex + 1).padStart(2, '0')}</span><div><strong>{typeof item === 'string' ? item : item.title}</strong>{typeof item === 'object' && item.body && <p>{item.body}</p>}</div>{itemIndex < items.length - 1 && <i aria-hidden="true" />}</li>)}</ol></section>
    if (block.type === 'case') return <section id={id} key={id} className="lesson-case"><span>사례</span><BlockHeading block={block} /><p><InlineCodeText text={block.body} /></p>{block.facts?.length ? <ul>{block.facts.map((fact) => <li key={fact}><CheckCircle2 size={15} />{fact}</li>)}</ul> : null}</section>
    if (block.type === 'cve-case') return <section id={id} key={id}><CveCase block={block} /></section>
    if (block.type === 'misconception') return <section id={id} key={id} className="lesson-misconception"><BlockHeading block={block} /><ul>{(block.items || []).map((item) => <li key={item}><span>오해</span><div><InlineCodeText text={item} /></div></li>)}</ul></section>
    if (block.type === 'warning') return <section id={id} key={id} className="lesson-warning"><ShieldAlert size={19} /><div><BlockHeading block={block} /><p><InlineCodeText text={block.body} /></p></div></section>
    if (block.type === 'checkpoint') return <div id={id} key={id}><Checkpoint block={block} value={checkpointResults[block.id]} onChange={(result) => onCheckpoint?.(block.id, result)} number={questionNumber} /></div>
    if (block.type === 'work-context') return <section id={id} key={id} className="lesson-work-context"><span>WORK CONTEXT</span><BlockHeading block={block} /><p><InlineCodeText text={block.body} /></p></section>
    if (block.type === 'practice-link') return <section id={id} key={id} className="lesson-practice-links"><BlockHeading block={block} /><p>{block.body || '이 개념을 읽은 뒤에는 관찰 결과를 직접 기록해 보세요.'}</p><div>{(block.labIds || []).map((labId) => <button type="button" key={labId} onClick={() => onOpenLab?.(labId)}>실습 열기 · {getLabTitle(labId)}</button>)}</div></section>
    if (block.type === 'sources') return <section id={id} key={id}><Sources block={block} /></section>
    if (block.type === 'concept-ref') return <section id={id} key={id}><ConceptReference block={block} /></section>
    if (block.type === 'evidence-board') return <section id={id} key={id}><EvidenceBoard block={block} /></section>
    if (block.type === 'retest') return <section id={id} key={id}><Retest block={block} /></section>
    if (block.type === 'mechanism') return <section id={id} key={id}><Mechanism block={block} /></section>
    if (block.type === 'code-trace') return <section id={id} key={id}><CodeTrace block={block} /></section>
    if (block.type === 'patch-analysis') return <section id={id} key={id}><PatchAnalysis block={block} /></section>
    if (block.type === 'impact-map') return <section id={id} key={id}><ImpactMap block={block} /></section>
    if (block.type === 'technology-primer') return <section id={id} key={id}><TechnologyPrimer block={block} /></section>
    if (block.type === 'patch-lineage') return <section id={id} key={id}><PatchLineage block={block} /></section>
    if (block.type === 'summary') return <section id={id} key={id} className="lesson-summary"><BlockHeading block={block} /><ul>{(block.bullets || []).map((bullet) => <li key={bullet}><CheckCircle2 size={15} /><InlineCodeText text={bullet} /></li>)}</ul></section>
    return null
  })}</div>
}
