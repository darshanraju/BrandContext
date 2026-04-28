const HEX_RE = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

export function isHexColor(value: string): boolean {
  return HEX_RE.test(value.trim())
}
