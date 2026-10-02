// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyBrandVariant, BRAND_VARIANT_ORDER, buildBrandCss, clearBrandPalette, DEFAULT_BRAND_VARIANT,
  onBrandVariant, resolveBrandVariant,
} from '../src/client/palette.ts'

const STYLE_ID = 'apelsinka-brand-tokens'

describe('apelsinka brand palette', () => {
  beforeEach(() => {
    document.getElementById(STYLE_ID)?.remove()
    localStorage.clear()
  })

  it('keeps the stock palette for the stock variant', () => {
    expect(buildBrandCss('stock')).toBe('')
  })

  it('carries one token block under both the base and the dark-theme selector', () => {
    const css = buildBrandCss('c')

    // The stock dark theme declares these tokens on `body[data-ds-dark-theme]`,
    // which counts as a class-level selector and would beat a block on
    // `html body` (0,0,2); only `html body[data-ds-dark-theme]` (0,1,2) wins.
    const [base, dark] = css.split('html body[data-ds-dark-theme]')
    expect(base).toMatch(/^html body \{[^}]*--dsw-static-deepseek-450: rgb\(255, 140, 26\);/)
    expect(dark).toMatch(/--dsw-static-deepseek-450: rgb\(255, 140, 26\);/)
    expect(css).toContain('--dsw-brand-secondary: rgb(218, 188, 49);')
  })

  it('replaces the neutrals only in the variants that declare them', () => {
    expect(buildBrandCss('a')).toContain('--dsw-static-neutral-bluish-100: rgb(244, 244, 245);')
    expect(buildBrandCss('c')).not.toContain('--dsw-static-neutral-bluish-100:')
  })

  it('paints the primary button only in the variants that ask for it', () => {
    expect(buildBrandCss('b')).toContain('--dsw-alias-button-primary-fill: var(--dsw-static-deepseek-450);')
    expect(buildBrandCss('c')).not.toContain('--dsw-alias-button-primary-fill')
  })

  it('outlines the send glyph through the figure inside its svg', () => {
    const css = buildBrandCss('c')

    expect(css).toContain("svg:has([fill='currentColor'])")
    expect(css).toContain('drop-shadow(0 0 1.5px rgba(20, 10, 1, .78))')
  })

  it('replaces the running whale with the slice silhouette', () => {
    const css = buildBrandCss('c')

    expect(css).toContain('[data-chat-running] span[aria-hidden]:has(> svg) > svg')
    expect(css).toContain('@keyframes apel-spin')
    expect(css).toContain('prefers-reduced-motion')
  })

  it('falls back to the edition default when nothing valid is stored', () => {
    expect(resolveBrandVariant()).toBe(DEFAULT_BRAND_VARIANT)
    localStorage.setItem('apelsinka.brand.variant', 'nonsense')
    expect(resolveBrandVariant()).toBe(DEFAULT_BRAND_VARIANT)
  })

  it('reads back a stored variant id', () => {
    for (const variant of BRAND_VARIANT_ORDER) {
      localStorage.setItem('apelsinka.brand.variant', variant)
      expect(resolveBrandVariant()).toBe(variant)
    }
  })

  it('installs one stylesheet, remembers the choice, and notifies subscribers', () => {
    const listener = vi.fn()
    const unsubscribe = onBrandVariant(listener)

    applyBrandVariant('a', true)

    const style = document.getElementById(STYLE_ID)
    expect(style?.textContent).toBe(buildBrandCss('a'))
    expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1)
    expect(localStorage.getItem('apelsinka.brand.variant')).toBe('a')
    expect(resolveBrandVariant()).toBe('a')
    expect(listener).toHaveBeenCalledOnce()

    unsubscribe()
    applyBrandVariant('b', true)
    expect(listener).toHaveBeenCalledOnce()
  })

  it('keeps a preview out of storage', () => {
    applyBrandVariant('b', false)

    expect(localStorage.getItem('apelsinka.brand.variant')).toBeNull()
    expect(document.getElementById(STYLE_ID)?.textContent).toBe(buildBrandCss('b'))
  })

  it('reuses one stylesheet element across switches', () => {
    applyBrandVariant('a', true)
    const first = document.getElementById(STYLE_ID)
    applyBrandVariant('c', true)

    expect(document.getElementById(STYLE_ID)).toBe(first)
  })

  it('drops the stylesheet when the stock palette or plugin unload wins', () => {
    applyBrandVariant('a', true)
    applyBrandVariant('stock', true)

    expect(document.getElementById(STYLE_ID)).toBeNull()

    applyBrandVariant('c', true)
    clearBrandPalette()
    expect(document.getElementById(STYLE_ID)).toBeNull()
  })
})
