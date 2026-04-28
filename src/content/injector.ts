import type { DetectedElement } from './detector'

export function getCurrentText(detected: DetectedElement): string {
  if (detected.type === 'slate') {
    const spans = (detected.el as HTMLElement).querySelectorAll<HTMLElement>('[data-slate-string="true"]')
    // Fall back to textContent if Slate string spans are absent (newer Slate versions)
    const slateText = Array.from(spans).map(s => s.textContent ?? '').join('')
    return slateText || (detected.el as HTMLElement).textContent || ''
  }
  if (detected.type === 'contenteditable') {
    return (detected.el as HTMLElement).textContent ?? ''
  }
  return (detected.el as HTMLInputElement | HTMLTextAreaElement).value
}

export function getCaretIndex(detected: DetectedElement): number {
  if (detected.type === 'slate' || detected.type === 'contenteditable') {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return 0
    const range = sel.getRangeAt(0)
    // Measure chars from start of element to caret
    const preRange = document.createRange()
    preRange.selectNodeContents(detected.el)
    preRange.setEnd(range.startContainer, range.startOffset)
    return preRange.toString().length
  }
  return (detected.el as HTMLInputElement | HTMLTextAreaElement).selectionStart ?? 0
}

export function getCaretRect(detected: DetectedElement): DOMRect {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0 && detected.type !== 'generic') {
    return sel.getRangeAt(0).getBoundingClientRect()
  }
  return detected.el.getBoundingClientRect()
}

export function inject(
  detected: DetectedElement,
  atIndex: number,
  caretIndex: number,
  value: string,
): void {
  if (detected.type === 'slate') {
    injectSlate(detected.el as HTMLElement, atIndex, caretIndex, value)
  } else if (detected.type === 'contenteditable') {
    injectContentEditable(detected.el as HTMLElement, atIndex, caretIndex, value)
  } else if (detected.type === 'react-textarea') {
    injectReactTextarea(detected.el as HTMLTextAreaElement, atIndex, caretIndex, value)
  } else {
    injectGeneric(detected.el as HTMLInputElement | HTMLTextAreaElement, atIndex, caretIndex, value)
  }
}

// Build a DOM Range spanning [startChar, endChar) within a contenteditable element.
function buildRange(el: HTMLElement, startChar: number, endChar: number): Range | null {
  const range = document.createRange()
  let charCount = 0
  let startNode: Node | null = null
  let startOffset = 0
  let endNode: Node | null = null
  let endOffset = 0

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const len = (node.textContent ?? '').length
    if (!startNode && charCount + len >= startChar) {
      startNode = node
      startOffset = startChar - charCount
    }
    if (!endNode && charCount + len >= endChar) {
      endNode = node
      endOffset = endChar - charCount
    }
    charCount += len
    if (startNode && endNode) break
  }

  if (!startNode || !endNode) return null
  range.setStart(startNode, startOffset)
  range.setEnd(endNode, endOffset)
  return range
}

function injectSlate(el: HTMLElement, atIndex: number, caretIndex: number, value: string) {
  const sel = window.getSelection()
  if (!sel) return

  const range = buildRange(el, atIndex, caretIndex)
  if (!range) return
  sel.removeAllRanges()
  sel.addRange(range)

  // The native selectionchange fired by addRange() is queued (async). Dispatch
  // it manually now so Slate syncs editor.selection *synchronously* before the
  // beforeinput event fires — otherwise Slate inserts at its old collapsed cursor
  // instead of replacing the @trigger span.
  document.dispatchEvent(new Event('selectionchange'))

  // With editor.selection now spanning @trigger, insertText will delete the
  // selection then insert the replacement, updating React state permanently.
  el.dispatchEvent(new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: value,
  }))
}

function injectContentEditable(el: HTMLElement, atIndex: number, caretIndex: number, value: string) {
  const sel = window.getSelection()
  if (!sel) return

  const range = buildRange(el, atIndex, caretIndex)
  if (!range) return
  sel.removeAllRanges()
  sel.addRange(range)
  // Plain contenteditable (not React-controlled) — execCommand works correctly here.
  document.execCommand('insertText', false, value)
}

function injectReactTextarea(el: HTMLTextAreaElement, atIndex: number, caretIndex: number, value: string) {
  const current = el.value
  const next = current.slice(0, atIndex) + value + current.slice(caretIndex)
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
  nativeSetter?.call(el, next)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  const pos = atIndex + value.length
  el.setSelectionRange(pos, pos)
}

function injectGeneric(el: HTMLInputElement | HTMLTextAreaElement, atIndex: number, caretIndex: number, value: string) {
  const current = el.value
  el.value = current.slice(0, atIndex) + value + current.slice(caretIndex)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  const pos = atIndex + value.length
  el.setSelectionRange(pos, pos)
}
