/** `apelsinka-brand` namespace dictionaries for the edition's brand surface. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'apelsinka-brand'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'view.appearance': '外观',
  'brand.name': 'Апельсинка',
  'brand.product': 'Harness',
  'appearance.heading': 'Апельсинка 外观',
  'appearance.hint': '配色与强调色。所选方案保存在此浏览器中。',
  'variant.stock': '标准',
  'variant.slice': '果肉',
  'variant.zest': '果皮',
  'variant.citrus': '柑橘',
} as const

/** The brand dictionary key union. */
export type ApelsinkaBrandKey = keyof typeof zh

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The edition's brand, appearance tab, and palette choice copy. */
    'apelsinka-brand': ApelsinkaBrandKey
  }
}

/** Namespace-bound translator threaded through brand presentation code. */
export type BrandTranslate =
  import('@deepseek-ai/dsh-client-ui-slots').TranslateNS<typeof NS>

/** English dictionary, checked complete against the Chinese source of truth. */
export const en: Record<ApelsinkaBrandKey, string> = {
  'view.appearance': 'Appearance',
  'brand.name': 'Apelsinka',
  'brand.product': 'Harness',
  'appearance.heading': 'Apelsinka appearance',
  'appearance.hint': 'Palette and accent. The choice is stored in this browser.',
  'variant.stock': 'Stock',
  'variant.slice': 'Slice',
  'variant.zest': 'Zest',
  'variant.citrus': 'Citrus',
}

/**
 * Russian dictionary: the edition's own language, registered beside the built-in
 * ones through the namespace overload so the owner's interface reads in Russian
 * while the stock surface keeps following its own locale.
 */
export const ru: Record<ApelsinkaBrandKey, string> = {
  'view.appearance': 'Оформление',
  'brand.name': 'Апельсинка',
  'brand.product': 'Harness',
  'appearance.heading': 'Оформление «Апельсинки»',
  'appearance.hint': 'Палитра и акцент. Выбор сохраняется в этом браузере.',
  'variant.stock': 'Стандартная',
  'variant.slice': 'Долька',
  'variant.zest': 'Цедра',
  'variant.citrus': 'Цитрус',
}
