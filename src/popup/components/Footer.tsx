import { useState, useEffect } from 'react'
import { ExternalLinkIcon, SettingsIcon } from '../../shared/icons'

interface Props { allowedDomains: string[] }

export function Footer({ allowedDomains }: Props) {
  const [hostname, setHostname] = useState<string | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const url = tabs[0]?.url
      if (url) { try { setHostname(new URL(url).hostname) } catch {} }
    })
  }, [])

  const isActive = hostname !== null && allowedDomains.some(d => hostname === d || hostname.endsWith('.' + d))

  return (
    <div className="popup-footer">
      <div>
        {isActive && hostname && (
          <div className="domain-badge">
            <div className="status-dot active" aria-hidden="true" />
            {hostname}
          </div>
        )}
      </div>
      <div className="footer-actions">
        <button className="btn-footer" onClick={() => chrome.runtime.openOptionsPage()}>
          <SettingsIcon size={12} />
          Sites
        </button>
        <button className="btn-footer accent" onClick={() => chrome.runtime.openOptionsPage()}>
          <ExternalLinkIcon size={12} />
          Open editor
        </button>
      </div>
    </div>
  )
}
