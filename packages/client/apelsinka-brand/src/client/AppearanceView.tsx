/** Appearance tab: the variant choice for the edition's palette. */

import { useEffect, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import {
  applyBrandVariant, BRAND_VARIANT_ORDER, onBrandVariant, resolveBrandVariant, type BrandVariant,
} from './palette.ts'
import css from './brand.module.css'

/** Locale dictionary key of one variant's label. */
const VARIANT_LABEL = {
  stock: 'variant.stock',
  a: 'variant.slice',
  b: 'variant.zest',
  c: 'variant.citrus',
} as const satisfies Record<BrandVariant, 'variant.stock' | 'variant.slice' | 'variant.zest' | 'variant.citrus'>

/** Sidebar brand name occupant. */
export type AppearanceViewProps = PropsLocale<'apelsinka-brand'>

/**
 * The appearance tab body: one button per variant, the chosen one marked.
 * @param props - locale dictionary access.
 * @returns the variant row.
 */
export function AppearanceView({ t }: AppearanceViewProps) {
  const [variant, setVariant] = useState<BrandVariant>(resolveBrandVariant)
  useEffect(() => onBrandVariant(() => { setVariant(resolveBrandVariant()) }), [])
  return (
    <div className={css.view}>
      <h2 className={css.heading}>{t('appearance.heading')}</h2>
      <div className={css.row} role="group" aria-label={t('appearance.heading')}>
        {BRAND_VARIANT_ORDER.map(key => (
          <button
            key={key}
            type="button"
            className={key === variant ? css.chipSelected : css.chip}
            aria-pressed={key === variant}
            onClick={() => { applyBrandVariant(key, true) }}
          >
            {t(VARIANT_LABEL[key])}
          </button>
        ))}
      </div>
      <p className={css.hint}>{t('appearance.hint')}</p>
    </div>
  )
}
