import { describe, it, expect } from 'vitest'
import { isHexColor } from '../shared/colorDetect'

describe('isHexColor', () => {
  it('accepts 6-digit hex', () => expect(isHexColor('#FAFDA0')).toBe(true))
  it('accepts 3-digit hex', () => expect(isHexColor('#FFF')).toBe(true))
  it('accepts lowercase hex', () => expect(isHexColor('#abc123')).toBe(true))
  it('rejects plain text', () => expect(isHexColor('cinematic')).toBe(false))
  it('rejects hex without #', () => expect(isHexColor('FAFDA0')).toBe(false))
  it('rejects empty string', () => expect(isHexColor('')).toBe(false))
  it('trims whitespace before checking', () => expect(isHexColor(' #FFF ')).toBe(true))
  it('rejects 4-digit hex', () => expect(isHexColor('#ABCD')).toBe(false))
  it('rejects 5-digit hex', () => expect(isHexColor('#ABCDE')).toBe(false))
})
