import { useEffect, useMemo, useRef, useState } from 'react'
import { Crosshair, FilePenLine, RotateCcw, Save, X } from 'lucide-react'
import { getPageTextOverrides, resolvePageTextNode } from '../content/pageTextOverrides'
import './ContentAuthoringPanel.css'

const endpoint = '/__sectrack_authoring/page-text'
const excludedTags = new Set(['HTML', 'BODY', 'SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'SVG', 'PATH'])

function selectorSegment(element) {
  const tag = element.tagName.toLowerCase()
  const siblings = [...element.parentElement.children].filter((item) => item.tagName === element.tagName)
  return siblings.length > 1 ? `${tag}:nth-of-type(${siblings.indexOf(element) + 1})` : tag
}

function selectorFor(element, root) {
  const segments = []
  let current = element
  while (current && current !== root) {
    if (current.id) {
      const escapedId = globalThis.CSS?.escape ? globalThis.CSS.escape(current.id) : current.id
      segments.unshift(`#${escapedId}`)
      return segments.join(' > ')
    }
    segments.unshift(selectorSegment(current))
    current = current.parentElement
  }
  return segments.join(' > ')
}

function canEditTextNode(node, root) {
  const parent = node?.parentElement
  return Boolean(
    node?.nodeType === globalThis.Node.TEXT_NODE
    && node.data.trim()
    && parent
    && root.contains(parent)
    && !excludedTags.has(parent.tagName)
    && !parent.closest('[data-authoring-ui]')
    && !parent.closest('[contenteditable="true"]'),
  )
}

function textTargetFromPointer(event, root) {
  const caret = document.caretPositionFromPoint?.(event.clientX, event.clientY)
  if (canEditTextNode(caret?.offsetNode, root)) {
    const node = caret.offsetNode
    return { element: node.parentElement, node }
  }

  let element = event.target instanceof globalThis.Element ? event.target : null
  while (element && element !== root) {
    const node = [...element.childNodes].find((item) => canEditTextNode(item, root))
    if (node) return { element, node }
    element = element.parentElement
  }
  return null
}

function findMatchingEntry(entries, locator, currentText) {
  return entries.find((entry) => (
    entry.selector === locator.selector
    && entry.nodeIndex === locator.nodeIndex
    && (entry.text === currentText || entry.baseText === currentText)
  ))
}

function shortened(value, maximum = 52) {
  const compact = value.trim().replace(/\s+/gu, ' ')
  return compact.length > maximum ? `${compact.slice(0, maximum)}…` : compact
}

export default function ContentAuthoringPanel({ routeKey }) {
  const [open, setOpen] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState(null)
  const [draftText, setDraftText] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const triggerRef = useRef(null)
  const closeRef = useRef(null)
  const hoveredRef = useRef(null)
  const selectedElementRef = useRef(null)
  const entries = useMemo(() => getPageTextOverrides(routeKey), [routeKey])
  const selectedEntry = selected ? findMatchingEntry(entries, selected, selected.currentText) : null
  const cleanText = selectedEntry?.text ?? selected?.baseText ?? ''
  const dirty = Boolean(selected) && draftText !== cleanText

  const clearElementMarks = () => {
    hoveredRef.current?.classList.remove('authoring-hover-target')
    selectedElementRef.current?.classList.remove('authoring-selected-target')
    hoveredRef.current = null
    selectedElementRef.current = null
  }

  useEffect(() => {
    clearElementMarks()
    setSelected(null)
    setDraftText('')
    setStatus('')
    setSelecting(open)
  }, [routeKey])

  useEffect(() => () => clearElementMarks(), [])

  useEffect(() => {
    if (!open || !selecting) return undefined
    const root = document.getElementById('root')
    if (!root) return undefined

    const onPointerMove = (event) => {
      const target = textTargetFromPointer(event, root)
      if (hoveredRef.current === target?.element) return
      hoveredRef.current?.classList.remove('authoring-hover-target')
      hoveredRef.current = target?.element || null
      hoveredRef.current?.classList.add('authoring-hover-target')
    }
    const onClick = (event) => {
      const target = textTargetFromPointer(event, root)
      if (!target) return
      event.preventDefault()
      event.stopPropagation()
      const locator = {
        selector: selectorFor(target.element, root),
        nodeIndex: [...target.element.childNodes].indexOf(target.node),
      }
      const matching = findMatchingEntry(entries, locator, target.node.data)
      hoveredRef.current?.classList.remove('authoring-hover-target')
      selectedElementRef.current?.classList.remove('authoring-selected-target')
      selectedElementRef.current = target.element
      selectedElementRef.current.classList.add('authoring-selected-target')
      setSelected({
        ...locator,
        baseText: matching?.baseText ?? target.node.data,
        currentText: target.node.data,
      })
      setDraftText(target.node.data)
      setStatus('')
      setSelecting(false)
    }

    document.addEventListener('pointermove', onPointerMove, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('pointermove', onPointerMove, true)
      document.removeEventListener('click', onClick, true)
      hoveredRef.current?.classList.remove('authoring-hover-target')
      hoveredRef.current = null
    }
  }, [entries, open, selecting])

  useEffect(() => {
    if (!open) return undefined
    closeRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      clearElementMarks()
      setOpen(false)
      setSelecting(false)
      window.requestAnimationFrame(() => triggerRef.current?.focus())
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const beginSelection = () => {
    selectedElementRef.current?.classList.remove('authoring-selected-target')
    selectedElementRef.current = null
    setSelected(null)
    setDraftText('')
    setStatus('왼쪽 화면에서 바꿀 문구를 클릭하세요.')
    setSelecting(true)
  }

  const updatePreview = (value) => {
    setDraftText(value)
    if (!selected) return
    const root = document.getElementById('root')
    const node = resolvePageTextNode(root, selected)
    if (node) node.data = value
  }

  const cancelDraft = () => {
    updatePreview(cleanText)
    setStatus('저장 전 수정 내용을 되돌렸습니다.')
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    setStatus('선택한 페이지 문구를 코드 데이터에 저장하고 있습니다.')
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeKey,
          selector: selected.selector,
          nodeIndex: selected.nodeIndex,
          baseText: selected.baseText,
          text: draftText,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '저장하지 못했습니다.')
      setStatus(`${result.changedFile}에 저장했습니다. 화면을 다시 불러옵니다.`)
      window.setTimeout(() => window.location.reload(), 250)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '저장하지 못했습니다.')
      setSaving(false)
    }
  }

  const removeEntry = async (entry) => {
    const confirmed = window.confirm(`이 페이지 문구 수정을 삭제할까요?\n“${shortened(entry.text)}”`)
    if (!confirmed) return
    setSaving(true)
    setStatus('저장된 페이지 문구 수정을 제거하고 있습니다.')
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '되돌리지 못했습니다.')
      window.setTimeout(() => window.location.reload(), 150)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '되돌리지 못했습니다.')
      setSaving(false)
    }
  }

  const close = () => {
    clearElementMarks()
    setOpen(false)
    setSelecting(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div data-authoring-ui>
      <button ref={triggerRef} className="content-authoring-trigger" type="button" onClick={() => { setOpen(true); setSelecting(true) }} aria-haspopup="dialog">
        <FilePenLine size={17} />
        페이지 편집
        {entries.length > 0 && <span aria-label={`이 페이지에 저장된 수정 ${entries.length}개`}>{entries.length}</span>}
      </button>
      {open && (
        <aside className={`content-authoring-panel${selecting ? ' is-selecting' : ''}`} role="dialog" aria-modal="false" aria-labelledby="content-authoring-title">
          <header className="content-authoring-header">
            <div>
              <span>LOCAL VISUAL AUTHORING · 개발 전용</span>
              <h2 id="content-authoring-title">화면 문구 직접 수정</h2>
              <p>{routeKey}</p>
            </div>
            <button ref={closeRef} type="button" onClick={close} aria-label="페이지 편집 패널 닫기"><X size={20} /></button>
          </header>

          <div className="content-authoring-body">
            <section className="content-authoring-guide">
              <header>
                <strong>{selecting ? '수정할 문구를 선택하는 중' : selected ? '선택한 문구 편집' : '수정할 문구 선택'}</strong>
                <small>{selecting ? '왼쪽 기존 화면에서 글자를 클릭하세요. 링크와 버튼은 선택 중에는 실행되지 않습니다.' : '입력하는 즉시 기존 화면에 미리 보입니다.'}</small>
              </header>
              {!selecting && (
                <button type="button" className="content-authoring-pick" onClick={beginSelection}>
                  <Crosshair size={16} />다른 문구 선택
                </button>
              )}
              {selected && !selecting && (
                <>
                  <div className="content-authoring-selection">
                    <small>원문</small>
                    <p>{selected.baseText.trim()}</p>
                  </div>
                  <label>
                    <span>수정 문구</span>
                    <textarea rows={draftText.length > 220 ? 8 : 4} value={draftText} onChange={(event) => updatePreview(event.target.value)} />
                  </label>
                </>
              )}
            </section>

            {entries.length > 0 && (
              <section>
                <header><strong>이 페이지에 저장된 수정</strong><small>원문이 같은 위치에 나타날 때만 적용됩니다.</small></header>
                <div className="content-authoring-saved-list">
                  {entries.map((entry) => (
                    <article key={`${entry.selector}:${entry.nodeIndex}:${entry.baseText}`}>
                      <div><small>원문</small><p>{shortened(entry.baseText)}</p></div>
                      <div><small>수정</small><p>{shortened(entry.text) || '(빈 문구)'}</p></div>
                      <button type="button" disabled={saving} onClick={() => removeEntry(entry)} aria-label={`“${shortened(entry.text)}” 수정 삭제`}><RotateCcw size={15} /></button>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          <footer className="content-authoring-footer">
            <p role="status" aria-live="polite">{status || (selecting ? '화면에서 문구를 선택하세요.' : dirty ? '저장하지 않은 변경이 있습니다.' : '저장 전 미리보기 상태입니다.')}</p>
            <div>
              <button type="button" onClick={cancelDraft} disabled={saving || !dirty}>입력 취소</button>
              <button type="button" onClick={save} disabled={saving || !dirty} className="primary"><Save size={15} />코드에 저장</button>
            </div>
            <small>저장 파일: <code>src/content/localContentOverrides.json</code></small>
          </footer>
        </aside>
      )}
    </div>
  )
}
