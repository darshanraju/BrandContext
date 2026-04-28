import { useState, useRef, useEffect } from 'react'
import type { Brand } from '../../shared/types'
import { setState, updateBrands } from '../../shared/storage'
import { BuildingIcon, ChevronDownIcon, PlusIcon } from '../../shared/icons'

const BRAND_COLORS = ['#F97316', '#818cf8', '#34d399', '#fb7185', '#38bdf8', '#a78bfa']

interface Props {
  brands: Brand[]
  activeBrandId: string | null
}

export function BrandSwitcher({ brands, activeBrandId }: Props) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  const rowRef = useRef<HTMLDivElement>(null)
  const activeBrand = brands.find(b => b.id === activeBrandId) ?? brands[0]

  useEffect(() => { if (creating) inputRef.current?.focus() }, [creating])

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function selectBrand(id: string) {
    await setState({ activeBrandId: id })
    setOpen(false)
  }

  async function createBrand() {
    if (submittingRef.current) return
    submittingRef.current = true
    const name = newName.trim()
    if (!name) { submittingRef.current = false; setCreating(false); setNewName(''); return }
    const id = crypto.randomUUID()
    const color = BRAND_COLORS[brands.length % BRAND_COLORS.length]
    const updated = [...brands, { id, name, color, shortcuts: [] }]
    await updateBrands(updated)
    await setState({ activeBrandId: id })
    submittingRef.current = false
    setCreating(false)
    setNewName('')
  }

  return (
    <div className="brand-row" ref={rowRef}>
      {creating ? (
        <input
          ref={inputRef}
          className="new-brand-input"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') createBrand(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
          onBlur={createBrand}
          placeholder="Brand name…"
        />
      ) : (
        <>
          <div className="brand-select" onClick={() => setOpen(o => !o)}>
            <BuildingIcon size={14} color="var(--subtle)" />
            <span className="brand-name">{activeBrand?.name ?? 'No brands'}</span>
            <ChevronDownIcon size={12} color="var(--subtle)" />
          </div>
          {open && (
            <div className="brand-dropdown">
              {brands.map(b => (
                <div key={b.id} className={`brand-option ${b.id === activeBrandId ? 'active' : ''}`} onClick={() => selectBrand(b.id)}>
                  <div className="brand-dot" style={{ background: b.color }} />
                  {b.name}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <button className="btn-new" onClick={() => { setOpen(false); setCreating(true) }}>
        <PlusIcon size={12} />
        New
      </button>
    </div>
  )
}
