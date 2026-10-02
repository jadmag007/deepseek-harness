/**
 * Appearance palettes of the Apelsinka edition and the stylesheet that applies one.
 *
 * The palettes replace the design-platform token ladders rather than adding new
 * tokens, so every stock surface that reads an alias follows the choice. Two
 * selectors carry the same block: the stock dark theme declares those tokens on
 * `body[data-ds-dark-theme]`, and an attribute selector counts as a class-level
 * selector, so a block on `html body` (0,0,2) loses to it (0,1,1) and the palette
 * would apply nowhere. `html body[data-ds-dark-theme]` (0,1,2) wins.
 *
 * The palette is written into one `<style>` element on `document.head` instead of
 * a static bundle: it changes at runtime from the appearance tab, and a built
 * stylesheet could not carry four variants.
 */

/** One appearance choice offered by the appearance tab. */
export type BrandVariant = 'stock' | 'a' | 'b' | 'c'

/** Orange accent ladder published under `--dsw-static-deepseek-*`. */
const ORANGE = {
  50: 'rgb(255, 247, 237)',
  100: 'rgb(255, 234, 211)',
  200: 'rgb(255, 211, 163)',
  300: 'rgb(255, 184, 118)',
  400: 'rgb(255, 158, 77)',
  450: 'rgb(255, 140, 26)',
  500: 'rgb(240, 123, 15)',
  600: 'rgb(214, 104, 8)',
  '700-delete': 'rgb(178, 79, 6)',
  800: 'rgb(124, 58, 8)',
  900: 'rgb(86, 42, 8)',
} as const

/** Warm neutral ladder published under `--dsw-static-neutral-bluish-*`; the menu's own light scale, warmed. */
const WARM = {
  1000: 'rgb(10, 10, 12)',
  950: 'rgb(13, 13, 16)',
  900: 'rgb(18, 18, 22)',
  875: 'rgb(23, 23, 27)',
  850: 'rgb(29, 29, 34)',
  800: 'rgb(38, 38, 44)',
  750: 'rgb(51, 51, 58)',
  700: 'rgb(85, 85, 94)',
  600: 'rgb(124, 124, 134)',
  500: 'rgb(157, 157, 167)',
  400: 'rgb(184, 184, 192)',
  300: 'rgb(214, 214, 220)',
  200: 'rgb(230, 230, 234)',
  150: 'rgb(238, 238, 241)',
  100: 'rgb(244, 244, 245)',
  75: 'rgb(247, 247, 248)',
  60: 'rgb(250, 250, 250)',
  50: 'rgb(252, 252, 253)',
  '00': 'rgb(255, 255, 255)',
} as const

/** Gold used as the secondary brand color in the zest and citrus variants. */
const GOLD = 'rgb(218, 188, 49)'

/** One variant's palette contribution; a null ladder leaves the stock tokens in place. */
interface BrandVariantPalette {
  /** Neutral ladder override, or null to keep the stock neutrals. */
  readonly neutrals: Readonly<Record<string, string>> | null
  /** Accent ladder override, or null for the stock palette. */
  readonly accent: Readonly<Record<string, string>> | null
  /** Secondary brand color expression. */
  readonly secondary: string | null
  /** Whether the primary action button follows the accent. */
  readonly orangeButton: boolean
}

const VARIANTS: Readonly<Record<BrandVariant, BrandVariantPalette>> = {
  stock: { neutrals: null, accent: null, secondary: null, orangeButton: false },
  a: { neutrals: WARM, accent: ORANGE, secondary: 'var(--dsw-static-deepseek-400)', orangeButton: true },
  b: { neutrals: WARM, accent: ORANGE, secondary: GOLD, orangeButton: true },
  c: { neutrals: null, accent: ORANGE, secondary: GOLD, orangeButton: false },
}

/** Tab order of the variants; `a`, `b` and `c` are the ids stored in localStorage since the first release. */
export const BRAND_VARIANT_ORDER: readonly BrandVariant[] = ['stock', 'a', 'b', 'c']

/** Variant applied when nothing is stored: citrus, the edition's own look. */
export const DEFAULT_BRAND_VARIANT: BrandVariant = 'c'

/** Per-browser storage of the chosen variant. */
const STORAGE_KEY = 'apelsinka.brand.variant'

/** Id of the stylesheet element this module owns. */
const STYLE_ID = 'apelsinka-brand-tokens'

/** Outline slice used while the agent is working, drawn small enough that the sectors merge. */
const SLICE_MASK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg fill='none' stroke='%23000' stroke-width='1.3' stroke-linejoin='round' stroke-linecap='round'%3E%3Cpath d='M8.00 8.00L1.42 10.39A7.0 7.0 0 0 1 1.38 5.72Z'/%3E%3Cpath d='M8.00 8.00L1.49 5.43A7.0 7.0 0 0 1 4.55 1.91Z'/%3E%3Cpath d='M8.00 8.00L5.10 1.63A7.0 7.0 0 0 1 9.75 1.22Z'/%3E%3Cpath d='M8.00 8.00L10.34 1.40A7.0 7.0 0 0 1 13.97 4.34Z'/%3E%3Cpath d='M8.00 8.00L14.26 4.88A7.0 7.0 0 0 1 14.76 9.81Z'/%3E%3C/g%3E%3C/svg%3E"

function tokenBlock(ladder: Readonly<Record<string, string>>, prefix: string): string {
  return Object.keys(ladder).map(key => `--dsw-static-${prefix}-${key}: ${ladder[key]};`).join(' ')
}

/**
 * Build the stylesheet text for one variant.
 * @param variantKey - selected variant.
 * @returns CSS text, or an empty string when the variant is the stock palette.
 */
export function buildBrandCss(variantKey: BrandVariant): string {
  const variant = VARIANTS[variantKey]
  if (variant.accent === null) return ''

  const shared: string[] = []
  if (variant.neutrals !== null) shared.push(tokenBlock(variant.neutrals, 'neutral-bluish'))
  shared.push(tokenBlock(variant.accent, 'deepseek'))
  shared.push(`--dsw-brand-secondary: ${variant.secondary};`)
  shared.push('--dsw-brand-glow: rgba(255, 140, 26, .34);')

  const dark = [
    '--dsw-specific-sidebar-nav-item-active-accent: var(--dsw-static-deepseek-450);',
    '--dsw-alias-label-deep-diving: color-mix(in srgb, var(--dsw-static-deepseek-450) 55%, var(--dsw-static-neutral-bluish-400));',
  ]
  if (variant.orangeButton) {
    dark.push('--dsw-alias-button-primary-fill: var(--dsw-static-deepseek-450);')
  }

  return [
    `html body { ${shared.join(' ')} }`,
    `html body[data-ds-dark-theme] { ${shared.join(' ')} ${dark.join(' ')} }`,
    [
      'html body [data-chat-running] span[aria-hidden]:has(> svg) > svg, html body [data-chat-running] span[aria-hidden]:has(> svg) > span { display: none; }',
      `html body [data-chat-running] span[aria-hidden]:has(> svg)::after { content: ''; display: block; width: 14px; height: 14px; background: #ff8c1a; -webkit-mask: url("${SLICE_MASK}") center / 100% 100% no-repeat; mask: url("${SLICE_MASK}") center / 100% 100% no-repeat; animation: apel-spin 3.2s linear infinite; }`,
      '@keyframes apel-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
      '@media (prefers-reduced-motion: reduce) { html body [data-chat-running] span[aria-hidden]:has(> svg)::after { animation: none; } }',
      // The send/stop glyph is a currentColor figure inside its <svg>, so the
      // outline belongs on the svg that contains such a figure.
      "html body [data-composer-card] button svg:has([fill='currentColor']) { filter: drop-shadow(0 0 1.5px rgba(20, 10, 1, .78)); }",
    ].join('\n'),
  ].join('\n')
}

/** Listeners notified after a variant change; the appearance tab is their only writer. */
const listeners = new Set<() => void>()

/**
 * Read the stored variant.
 * @returns the stored id when it names a known variant, otherwise the default.
 */
export function resolveBrandVariant(): BrandVariant {
  const stored = globalThis.localStorage?.getItem(STORAGE_KEY)
  if (stored !== null && stored !== undefined && Object.hasOwn(VARIANTS, stored)) return stored as BrandVariant
  return DEFAULT_BRAND_VARIANT
}

/**
 * Subscribe to variant changes.
 * @param listener - called after every applied variant.
 * @returns the unsubscribe operation.
 */
export function onBrandVariant(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function writeBrandStyle(variantKey: BrandVariant): void {
  const css = buildBrandCss(variantKey)
  const existing = document.getElementById(STYLE_ID)
  if (css === '') {
    existing?.remove()
    return
  }
  const style = existing instanceof HTMLStyleElement ? existing : document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  if (!style.isConnected) document.head.append(style)
}

/**
 * Apply one variant to the document and remember it.
 * @param variantKey - selected variant.
 * @param persist - false for a preview that must not outlive the page.
 */
export function applyBrandVariant(variantKey: BrandVariant, persist: boolean): void {
  if (persist) globalThis.localStorage?.setItem(STORAGE_KEY, variantKey)
  writeBrandStyle(variantKey)
  for (const listener of listeners) listener()
}

/** Remove the palette stylesheet when the plugin unloads, leaving the stock tokens. */
export function clearBrandPalette(): void {
  document.getElementById(STYLE_ID)?.remove()
}
