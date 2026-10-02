/**
 * Browser plugin body of the Apelsinka edition brand layer.
 *
 * It owns three contributions: the sidebar mark and name slots, the appearance
 * tab in the conversation view strip, and the palette stylesheet those tabs
 * switch. The mark and name register at priority -1 because the stock
 * `ui-brand-official` package claims both slots at the default priority, and a
 * second single-slot registration on an occupied priority throws in the
 * browser. Slot entries sort ascending by priority and the cell renders its
 * first live entry, so the lowest priority wins.
 */
import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: the 'conversation.view' and 'sidebar.brand.*' SlotMap rows declared
// by their owning packages must be in the program for the register calls to type.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { OrangeMark, OrangeWordmark } from './Brand.tsx'
import { AppearanceView } from './AppearanceView.tsx'
import { en, NS, ru, zh } from './locales.ts'
import { applyBrandVariant, clearBrandPalette, resolveBrandVariant } from './palette.ts'

/** Lowest priority: the edition's brand renders in place of the stock occupant. */
const BRAND_PRIORITY = -1

/** Required services: the UI slot registry and the locale service. */
export const inject = ['slots', 'locale']

/**
 * Register the edition's brand and apply its stored palette.
 * @param ctx - Client root context.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => {
    const disposeBuiltIn = ctx.locale.register(NS, { zh, en })
    const disposeRussian = ctx.locale.register(NS, 'ru', ru)
    return () => {
      disposeBuiltIn()
      disposeRussian()
    }
  }, 'apelsinka-brand: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.effect(() => {
    applyBrandVariant(resolveBrandVariant(), false)
    return clearBrandPalette
  }, 'apelsinka-brand: palette')
  ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.inject('sidebar.brand.name',
    function* () {
      yield ctx.slots.register({
        name: 'sidebar.brand.mark', priority: BRAND_PRIORITY, locale: NS,
      }, OrangeMark)
      yield ctx.slots.register({
        name: 'sidebar.brand.name', priority: BRAND_PRIORITY, locale: NS,
      }, OrangeWordmark)
    }))
  // Sits after Chat (order 0) and Trajectory (order 10).
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: NS,
    order: 20,
    locale: NS,
    label: () => t('view.appearance'),
  }, AppearanceView))
}
