export interface Shortcut {
  key: string   // stored without @, e.g. "primary"
  value: string // "#FAFDA0"
}

export interface Brand {
  id: string
  name: string
  color: string       // dot color in UI, e.g. "#F97316"
  shortcuts: Shortcut[]
}

export interface StorageState {
  brands: Brand[]
  activeBrandId: string | null
  allowedDomains: string[]
}
