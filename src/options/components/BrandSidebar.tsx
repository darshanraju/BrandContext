import { useState, useRef, useEffect } from 'react'
import type { Brand } from '../../shared/types'
import { setState, updateBrands } from '../../shared/storage'
import { PlusIcon, SettingsIcon } from '../../shared/icons'

const BRAND_COLORS = ['#F97316', '#818cf8', '#34d399', '#fb7185', '#38bdf8', '#a78bfa']

interface Props {
  brands: Brand[]
  activeBrandId: string | null
  onSelectSites: () => void
  onSelectBrand: () => void
}

export function BrandSidebar({ brands, activeBrandId, onSelectSites, onSelectBrand }: Props) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (creating) inputRef.current?.focus() }, [creating])

  async function selectBrand(id: string) {
    await setState({ activeBrandId: id })
    onSelectBrand()
  }

  async function createBrand() {
    const name = newName.trim()
    if (!name) { setCreating(false); setNewName(''); return }
    const id = crypto.randomUUID()
    const color = BRAND_COLORS[brands.length % BRAND_COLORS.length]
    await updateBrands([...brands, { id, name, color, shortcuts: [] }])
    await setState({ activeBrandId: id })
    setCreating(false); setNewName('')
  }

  return (
    <div className="options-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Brands</span>
      </div>
      <div className="sidebar-list">
        {brands.map(b => (
          <div key={b.id} className={`sidebar-item ${b.id === activeBrandId ? 'active' : ''}`} onClick={() => selectBrand(b.id)}>
            <div className="sidebar-dot" style={{ background: b.color }} />
            {b.name}
          </div>
        ))}
      </div>
      {creating ? (
        <div style={{ padding: '6px 8px' }}>
          <input
            ref={inputRef}
            className="sidebar-name-input"
            style={{ width: '100%' }}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createBrand(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
            onBlur={createBrand}
            placeholder="Brand name…"
          />
        </div>
      ) : (
        <button className="sidebar-add" onClick={() => setCreating(true)}>
          <PlusIcon size={13} />
          New brand
        </button>
      )}
      <div className="sidebar-divider" />
      <button className="sidebar-settings" onClick={onSelectSites}>
        <SettingsIcon size={13} />
        Allowed sites
      </button>
    </div>
  )
}
