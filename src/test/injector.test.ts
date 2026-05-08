import { describe, it, expect } from 'vitest'
import { inject } from '../content/injector'
import type { DetectedElement } from '../content/detector'

describe('inject — midjourney', () => {
  it('uses native setter so React picks up the change', () => {
    const ta = document.createElement('textarea')
    ta.id = 'desktop_input_bar'
    ta.value = '@tone some text'
    document.body.appendChild(ta)

    const detected: DetectedElement = { el: ta, type: 'midjourney' }

    let inputFired = false
    ta.addEventListener('input', () => { inputFired = true })

    inject(detected, 0, 5, 'cinematic, minimal, editorial')

    expect(ta.value).toBe('cinematic, minimal, editorial some text')
    expect(inputFired).toBe(true)

    document.body.removeChild(ta)
  })
})
