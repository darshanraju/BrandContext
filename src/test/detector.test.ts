import { describe, it, expect, afterEach } from 'vitest'
import { startDetector, type DetectedElement } from '../content/detector'

describe('startDetector — MidJourney', () => {
  let stopDetector: () => void

  afterEach(() => {
    stopDetector?.()
    document.body.innerHTML = ''
  })

  it('classifies #desktop_input_bar textarea as midjourney', () => {
    const ta = document.createElement('textarea')
    ta.id = 'desktop_input_bar'
    document.body.appendChild(ta)

    const found: DetectedElement[] = []
    stopDetector = startDetector(
      (d) => found.push(d),
      () => {},
    )

    const mj = found.find(d => (d.el as HTMLTextAreaElement).id === 'desktop_input_bar')
    expect(mj).toBeDefined()
    expect(mj?.type).toBe('midjourney')
  })
})
