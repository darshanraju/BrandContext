import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getState, setState, updateBrands } from '../shared/storage'
import type { Brand } from '../shared/types'

const mockBrand: Brand = {
  id: '1',
  name: 'Test Brand',
  color: '#F97316',
  shortcuts: [{ key: 'primary', value: '#fff' }],
}

beforeEach(() => {
  vi.mocked(chrome.storage.sync.get).mockReset()
  vi.mocked(chrome.storage.sync.set).mockReset()
})

describe('getState', () => {
  it('returns defaults when storage is empty', async () => {
    vi.mocked(chrome.storage.sync.get).mockImplementation(async () => ({}))
    const state = await getState()
    expect(state.brands).toEqual([])
    expect(state.activeBrandId).toBeNull()
    expect(state.allowedDomains).toEqual([])
  })

  it('returns stored values when present', async () => {
    vi.mocked(chrome.storage.sync.get).mockImplementation(async () => ({
      brands: [mockBrand],
      activeBrandId: '1',
      allowedDomains: ['dream.ai'],
    }))
    const state = await getState()
    expect(state.brands).toEqual([mockBrand])
    expect(state.activeBrandId).toBe('1')
    expect(state.allowedDomains).toEqual(['dream.ai'])
  })
})

describe('setState', () => {
  it('calls chrome.storage.sync.set with the partial', async () => {
    await setState({ activeBrandId: '2' })
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ activeBrandId: '2' })
  })
})

describe('updateBrands', () => {
  it('sets only the brands key', async () => {
    await updateBrands([mockBrand])
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ brands: [mockBrand] })
  })
})
