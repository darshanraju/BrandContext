import { useState, useRef, useEffect } from 'react'
import type { Brand } from '../../shared/types'
import { updateBrands, getState } from '../../shared/storage'
import { ShortcutRow } from './ShortcutRow'
import { PlusIcon } from '../../shared/icons'

const MAX_VISIBLE = 6

interface Props { brand: Brand | null }

export function ShortcutList({ brand }: Props) {
  const [adding, setAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')
  const keyRef = useRef<HTMLInputElement>(null)
  const addingRef = useRef(false)

  useEffect(() => { if (adding) keyRef.current?.focus() }, [adding])

  async function addShortcut() {
    if (addingRef.current) return
    addingRef.current = true
    const k = newKey.trim().replace(/^@/, '')
    const v = newVal.trim()
    if (!k || !v || !brand) { addingRef.current = false; cancelAdd(); return }
    const { brands: latest } = await getState()
    const targetBrand = latest.find(b => b.id === brand.id)
    if (!targetBrand) { addingRef.current = false; cancelAdd(); return }
    const updated = latest.map(b =>
      b.id === brand.id ? { ...b, shortcuts: [...b.shortcuts, { key: k, value: v }] } : b
    )
    await updateBrands(updated)
    setNewKey(''); setNewVal(''); setAdding(false)
    addingRef.current = false
  }

  function cancelAdd() { setNewKey(''); setNewVal(''); setAdding(false) }

  if (!brand) {
    return (
      <div className="shortcut-list">
        <div style={{ padding: '8px 0', color: 'var(--subtle)', fontSize: 12, fontStyle: 'italic' }}>
          No brand selected
        </div>
      </div>
    )
  }

  const visible = brand.shortcuts.slice(0, MAX_VISIBLE)
  const extra = brand.shortcuts.length - MAX_VISIBLE

  return (
    <>
      <div className="section-header">
        <span className="section-label">Shortcuts</span>
        <button className="btn-add" onClick={() => setAdding(true)}>
          <PlusIcon size={10} />Add
        </button>
      </div>
      <div className="shortcut-list">
        {visible.map(s => (
          <ShortcutRow key={s.key} shortcut={s} brand={brand} />
        ))}
        {extra > 0 && <div className="more-row">…and {extra} more — open editor to see all</div>}
        {adding && (
          <div className="shortcut-edit-row">
            <input ref={keyRef} className="edit-input key-input" value={newKey} placeholder="key"
              onChange={e => setNewKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addShortcut(); if (e.key === 'Escape') cancelAdd() }} />
            <input className="edit-input val-input" value={newVal} placeholder="value"
              onChange={e => setNewVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addShortcut(); if (e.key === 'Escape') cancelAdd() }}
              onBlur={addShortcut} />
          </div>
        )}
        {brand.shortcuts.length === 0 && !adding && (
          <div style={{ color: 'var(--subtle)', fontSize: 12, fontStyle: 'italic', padding: '4px 0' }}>
            No shortcuts yet — click Add
          </div>
        )}
      </div>
    </>
  )
}
