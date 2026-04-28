import { useState, useRef, useEffect } from 'react'
import type { Shortcut, Brand } from '../../shared/types'
import { getState, updateBrands } from '../../shared/storage'
import { isHexColor } from '../../shared/colorDetect'
import { PencilIcon, TrashIcon } from '../../shared/icons'

interface Props {
  shortcut: Shortcut
  brand: Brand
}

export function ShortcutRow({ shortcut, brand }: Props) {
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
      <div className="shortcut-edit-row">
        <input ref={keyRef} className="edit-input key-input" value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }} />
        <input className="edit-input val-input" value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
          onBlur={save} />
      </div>
    )
  }

  return (
    <div className="shortcut-row">
      <span className="shortcut-key">@{shortcut.key}</span>
      <span className="shortcut-arrow">→</span>
      {isHexColor(shortcut.value) && <div className="color-swatch" style={{ background: shortcut.value }} />}
      <span className="shortcut-value">{shortcut.value}</span>
      <div className="row-actions">
        <button className="btn-icon" onClick={() => setEditing(true)}><PencilIcon size={14} /></button>
        <button className="btn-icon" onClick={remove}><TrashIcon size={14} /></button>
      </div>
    </div>
  )
}
