/** Sidebar brand occupants: the orange-slice mark and the wordmark. */

import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import css from './brand.module.css'

/**
 * The orange-slice mark.
 * @param props - owner data carrying the requested edge.
 * @returns the mark at the owner's size.
 */
export function OrangeMark({ size }: SidebarBrandMarkOwnerProps) {
  return (
    <svg
      className={css.mark}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="presentation"
      aria-hidden="true"
    >
      <path d="M58.42 59.35 A47 47 0 0 0 4.65 5.58 L12 52 Z" fill="#ff8c1a" />
      <path d="M52.50 58.41 A41 41 0 0 0 5.59 11.50 L12 52 Z" fill="#fff0dd" />
      <path d="M48.54 57.79 A37 37 0 0 0 6.21 15.46 L12 52 Z" fill="#ffb266" />
      <g stroke="#ff8c1a" strokeWidth={2.4} strokeLinecap="round">
        <line x1="12" y1="52" x2="48.54" y2="46.21" />
        <line x1="12" y1="52" x2="38.16" y2="25.84" />
        <line x1="12" y1="52" x2="17.79" y2="15.46" />
      </g>
      <circle cx={12} cy={52} r={3} fill="#ff8c1a" />
    </svg>
  )
}

/** Sidebar brand name occupant. */
export type OrangeWordmarkProps = PropsLocale<'apelsinka-brand'>

/**
 * The edition wordmark: the product name in accent ink, the shell beside it.
 * @param props - locale dictionary access.
 * @returns the wordmark.
 */
export function OrangeWordmark({ t }: OrangeWordmarkProps) {
  return (
    <span className={css.name}>
      <b>{t('brand.name')}</b>
      <span>{t('brand.product')}</span>
    </span>
  )
}
