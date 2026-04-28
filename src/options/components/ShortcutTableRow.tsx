import { useState, useRef, useEffect } from 'react'
import type { Shortcut, Brand } from '../../shared/types'
import { getState, updateBrands } from '../../shared/storage'
import { isHexColor } from '../../shared/colorDetect'
import { PencilIcon, TrashIcon, DragHandleIcon } from '../../shared/icons'

interface Props {
  shortcut: Shortcut
  brand: Brand
  dragIndex: number
  isDragOver: boolean
  onDragStart: () => void
  onDragEnter: () => void
  onDragLeave: () => void
  onDrop: () => void
  onDragEnd: () => void
}

export function ShortcutTableRow({ shortcut, brand, isDragOver, onDragStart, onDragEnter, onDragLeave, onDrop, onDragEnd }: Props) {
  const [editing, setEditing] = useState(false)
  const [key, setKey] = useState(shortcut.key)
  const [value, setValue] = useState(shortcut.value)
  const keyRef = useRef<HTMLInputElement>(null)
  const committingRef = useRef(false)

  useEffect(() => { if (editing) keyRef.current?.focus() }, [editing])

  async function save() {
    if (committingRef.current) return
    committingRef.current = true
    const k = key.trim().replace(/^@/, '')
    const v = value.trim()
    if (!k || !v) { committingRef.current = false; cancel(); return }
    const { brands: latest } = await getState()
    const updated = latest.map(b =>
      b.id === brand.id
        ? { ...b, shortcuts: b.shortcuts.map(s => s.key === shortcut.key ? { key: k, value: v } : s) }
        : b
    )
    await updateBrands(updated)
    committingRef.current = false
    setEditing(false)
  }

  function cancel() {
    committingRef.current = false
    setKey(shortcut.key)
    setValue(shortcut.value)
    setEditing(false)
  }

  async function remove() {
    const { brands: latest } = await getState()
    await updateBrands(latest.map(b =>
      b.id === brand.id
        ? { ...b, shortcuts: b.shortcuts.filter(s => s.key !== shortcut.key) }
        : b
    ))
  }

  if (editing) {
    return (
      <div className="table-row editing" style={{ gridTemplateColumns: '1fr auto' }}>
        <div className="cell" style={{ gap: 6 }}>
          <input ref={keyRef} className="table-edit-input key" value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }} />
          <input className="table-edit-input val" value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
            onBlur={save} />
        </div>
        <div className="cell cell-actions">
          <button className="btn-save" onClick={save}>Save</button>
          <button className="btn-cancel" onClick={cancel}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`table-row${isDragOver ? ' drag-over' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className="cell cell-key">
        <span className="drag-handle"><DragHandleIcon size={14} color="var(--border)" /></span>
        <span className="key-chip">@{shortcut.key}</span>
      </div>
      <div className="cell cell-val">
        {isHexColor(shortcut.value) && <div className="opt-color-swatch" style={{ background: shortcut.value }} />}
        <span className="val-text">{shortcut.value}</span>
      </div>
      <div className="cell cell-actions">
        <button className="btn-icon" onClick={() => setEditing(true)}><PencilIcon size={14} /></button>
        <button className="btn-icon" onClick={remove}><TrashIcon size={14} /></button>
      </div>
    </div>
  )
}
