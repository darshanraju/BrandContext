import { useEffect, useState } from 'react'
import { KeyIcon } from '../../shared/icons'

interface Props {
  allowedDomains: string[]
}

export function Header({ allowedDomains }: Props) {
  const [hostname, setHostname] = useState<string | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const url = tabs[0]?.url
      if (url) {
        try { setHostname(new URL(url).hostname) } catch { /* non-parseable URL */ }
      }
    })
  }, [])

  const isActive = hostname !== null && allowedDomains.some(d => hostname === d || hostname.endsWith('.' + d))

  return (
    <div className="popup-header">
      <div className="popup-logo">
        <KeyIcon size={16} color="var(--accent)" />
        BrandKey
      </div>
      <div className="status-pill">
        <div className={`status-dot ${isActive ? 'active' : 'inactive'}`} aria-hidden="true" />
        {isActive ? 'Active on this site' : 'Not active here'}
      </div>
    </div>
  )
}
