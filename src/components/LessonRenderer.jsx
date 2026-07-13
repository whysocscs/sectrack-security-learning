import { CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react'
import { weekContent } from '../courseData.js'
import { getConcepts } from '../content/conceptRegistry.js'
import { getLessonBlockAnchor, getLessonBlocks } from '../content/lessonSchema.js'

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

function Checkpoint({ block, value, onChange, readOnly = false, number }) {
  const isChoice = Array.isArray(block.options) && block.options.length > 0
  if (readOnly) {
    const correctOption = isChoice ? block.options[block.answer] : null
    const answerGuide = correctOption && block.answerGuide?.startsWith('정답:')
      ? block.answerGuide.replace(/^정답:\s*/, '')
      : block.answerGuide || block.explanation || '앞의 예시에서 확인한 명령, 대상, 관찰값을 다시 대조해 보세요.'
    return (
      <section className="lesson-checkpoint question-review" aria-labelledby={block.id}>
        <header><span>QUESTION {number}.</span></header>
        <p id={block.id}><InlineCodeText text={block.prompt} /></p>
        <details>
          <summary>정답 보기</summary>
          <div>
            {correctOption && <p><strong>정답: </strong><InlineCodeText text={correctOption} /></p>}
            <p><InlineCodeText text={answerGuide} /></p>
          </div>
        </details>
      </section>
    )
  }
  const isAnswered = value?.answer !== undefined && value?.answer !== ''
  const correct = isChoice && isAnswered ? Number(value.answer) === Number(block.answer) : null
  return (
    <section className="lesson-checkpoint" aria-labelledby={block.id}>
      <header><span>CHECKPOINT</span><BlockHeading block={block} /></header>
      <p id={block.id}><InlineCodeText text={block.prompt} /></p>
      {isChoice ? <div className="checkpoint-options">{block.options.map((option, index) => <label key={option}><input type="radio" name={block.id} checked={Number(value?.answer) === index} onChange={() => onChange({ answer: index, answeredAt: new Date().toISOString() })} /><span>{option}</span></label>)}</div> : <textarea aria-label={block.title || block.prompt} rows="4" value={value?.answer || ''} onChange={(event) => onChange({ answer: event.target.value, answeredAt: new Date().toISOString() })} placeholder={block.placeholder || '근거가 되는 단어나 관찰을 포함해 짧게 적으세요.'} />}
      {correct !== null && <div className={`checkpoint-result ${correct ? 'correct' : 'retry'}`} role="status" aria-live="polite"><strong>{correct ? '확인됨' : '다시 읽기'}</strong><span>{block.explanation || (correct ? '선택한 답이 이 블록의 핵심과 일치합니다.' : '해설과 앞선 예시를 다시 확인한 뒤 답을 바꿔 보세요.')}</span></div>}
      {!isChoice && isAnswered && <small>작성한 답은 이 브라우저에 저장됩니다. 정답 채점 대신 다음 읽기와 실습에 연결할 관찰 기록입니다.</small>}
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

function CveCase({ block }) {
  return <article className="lesson-cve-case">
    <header><span>VERIFIED CVE CASE</span><strong>{block.cve}</strong><small>{block.classification}</small></header>
    <BlockHeading block={block} />
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

export default function LessonRenderer({ module, checkpointResults = {}, onCheckpoint, onOpenLab }) {
  const blocks = getLessonBlocks(module)
  const weekOneLinuxModule = /^(w1|w2)-/.test(module.id)
  return <div className="lesson-blocks">{blocks.map((block, index) => {
    const id = getLessonBlockAnchor(module.id, block, index)
    const questionNumber = blocks.slice(0, index + 1).filter((item) => item.type === 'checkpoint').length
    if (block.type === 'question' && weekOneLinuxModule) return null
    if (block.type === 'question' || block.type === 'prerequisite-check') return <section id={id} key={id} className={`lesson-question ${block.type === 'prerequisite-check' ? 'prerequisite' : ''} ${block.variant ? `variant-${block.variant}` : ''}`}><span>{block.type === 'question' ? 'LEARNING QUESTION' : 'BEFORE YOU CONTINUE'}</span><BlockHeading block={block} /><p><InlineCodeText text={block.body || block.prompt} /></p></section>
    if (block.type === 'explanation') return <section id={id} key={id} className={`lesson-explanation ${block.variant ? `variant-${block.variant}` : ''}`}><BlockHeading block={block} />{(block.paragraphs || [block.body]).filter(Boolean).map((paragraph, paragraphIndex) => <p key={`${id}-${paragraphIndex}`}><InlineCodeText text={paragraph} /></p>)}</section>
    if (block.type === 'diagram') return <section id={id} key={id}><Diagram block={block} /></section>
    if (block.type === 'terminal' || block.type === 'http-message' || block.type === 'code') return <section id={id} key={id} className={`lesson-transcript ${block.type}`}><header><span>{block.type === 'terminal' ? 'TERMINAL' : block.type === 'http-message' ? 'HTTP MESSAGE' : (block.language || 'CODE').toUpperCase()}</span><BlockHeading block={block} /></header>{block.description && <p><InlineCodeText text={block.description} /></p>}<pre tabIndex="0" aria-label={`${block.title || '전사'} 코드 영역`}><code>{block.command || block.message || block.code || ''}{block.output ? `\n${block.output}` : ''}</code></pre>{block.annotations?.length ? <ol>{block.annotations.map((annotation, annotationIndex) => <li key={`${annotation}-${annotationIndex}`}><InlineCodeText text={annotation} /></li>)}</ol> : null}</section>
    if (block.type === 'comparison') return <section id={id} key={id}><Comparison block={block} anchorId={id} /></section>
    if (block.type === 'command-guide') return <section id={id} key={id}><CommandGuide block={block} /></section>
    if (block.type === 'timeline') return <section id={id} key={id} className="lesson-timeline"><BlockHeading block={block} /><ol>{(block.items || block.steps || []).map((item, itemIndex, items) => <li key={`${item}-${itemIndex}`}><span>{String(itemIndex + 1).padStart(2, '0')}</span><div><strong>{typeof item === 'string' ? item : item.title}</strong>{typeof item === 'object' && item.body && <p>{item.body}</p>}</div>{itemIndex < items.length - 1 && <i aria-hidden="true" />}</li>)}</ol></section>
    if (block.type === 'case') return <section id={id} key={id} className="lesson-case"><span>사례</span><BlockHeading block={block} /><p><InlineCodeText text={block.body} /></p>{block.facts?.length ? <ul>{block.facts.map((fact) => <li key={fact}><CheckCircle2 size={15} />{fact}</li>)}</ul> : null}</section>
    if (block.type === 'cve-case') return <section id={id} key={id}><CveCase block={block} /></section>
    if (block.type === 'misconception') return <section id={id} key={id} className="lesson-misconception"><BlockHeading block={block} /><ul>{(block.items || []).map((item) => <li key={item}><span>오해</span><div><InlineCodeText text={item} /></div></li>)}</ul></section>
    if (block.type === 'warning') return <section id={id} key={id} className="lesson-warning"><ShieldAlert size={19} /><div><BlockHeading block={block} /><p><InlineCodeText text={block.body} /></p></div></section>
    if (block.type === 'checkpoint') return <div id={id} key={id}><Checkpoint block={block} value={checkpointResults[block.id]} onChange={(result) => onCheckpoint?.(block.id, result)} readOnly={weekOneLinuxModule} number={questionNumber} /></div>
    if (block.type === 'work-context') return <section id={id} key={id} className="lesson-work-context"><span>WORK CONTEXT</span><BlockHeading block={block} /><p><InlineCodeText text={block.body} /></p></section>
    if (block.type === 'practice-link') return <section id={id} key={id} className="lesson-practice-links"><BlockHeading block={block} /><p>{block.body || '이 개념을 읽은 뒤에는 관찰 결과를 직접 기록해 보세요.'}</p><div>{(block.labIds || []).map((labId) => <button type="button" key={labId} onClick={() => onOpenLab?.(labId)}>실습 열기 · {getLabTitle(labId)}</button>)}</div></section>
    if (block.type === 'sources') return <section id={id} key={id}><Sources block={block} /></section>
    if (block.type === 'concept-ref') return <section id={id} key={id}><ConceptReference block={block} /></section>
    if (block.type === 'evidence-board') return <section id={id} key={id}><EvidenceBoard block={block} /></section>
    if (block.type === 'retest') return <section id={id} key={id}><Retest block={block} /></section>
    if (block.type === 'summary') return <section id={id} key={id} className="lesson-summary"><BlockHeading block={block} /><ul>{(block.bullets || []).map((bullet) => <li key={bullet}><CheckCircle2 size={15} /><InlineCodeText text={bullet} /></li>)}</ul></section>
    return null
  })}</div>
}
