// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { en as commonEn } from '@deepseek-ai/dsh-client-locale/src/locales/en.ts'
import { OrangeMark, OrangeWordmark } from '../src/client/Brand.tsx'
import { AppearanceView } from '../src/client/AppearanceView.tsx'
import { applyBrandVariant, resolveBrandVariant } from '../src/client/palette.ts'
import { en, ru } from '../src/client/locales.ts'

afterEach(cleanup)

const t = makeTranslate(ru, commonEn)
const tEn = makeTranslate(en, commonEn)

describe('apelsinka brand slots', () => {
  it('draws the slice at the size the sidebar asks for', () => {
    const { container } = render(<OrangeMark size={32} />)
    const mark = container.querySelector('svg')

    expect(mark?.getAttribute('width')).toBe('32')
    expect(mark?.getAttribute('height')).toBe('32')
    expect(mark?.getAttribute('viewBox')).toBe('0 0 64 64')
    // Presentation only: the shell already names the control around the slot.
    expect(mark?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelectorAll('path')).toHaveLength(3)
  })

  it('names the product in the owner language and the shell beside it', () => {
    render(<OrangeWordmark t={t} />)

    expect(screen.getByText('Апельсинка')).toBeDefined()
    expect(screen.getByText('Harness')).toBeDefined()
  })

  it('keeps an English wordmark for the built-in locale', () => {
    render(<OrangeWordmark t={tEn} />)

    expect(screen.getByText('Apelsinka')).toBeDefined()
  })
})

describe('apelsinka appearance view', () => {
  it('offers every variant and marks the stored one', () => {
    applyBrandVariant('a', true)
    render(<AppearanceView t={t} />)

    const chips = screen.getAllByRole('button')
    expect(chips.map(chip => chip.textContent)).toEqual(['Стандартная', 'Долька', 'Цедра', 'Цитрус'])
    expect(chips.filter(chip => chip.getAttribute('aria-pressed') === 'true').map(chip => chip.textContent))
      .toEqual(['Долька'])
  })

  it('applies and remembers the chosen variant', () => {
    applyBrandVariant('a', true)
    render(<AppearanceView t={t} />)

    fireEvent.click(screen.getByText('Цитрус'))

    expect(resolveBrandVariant()).toBe('c')
    expect(screen.getByText('Цитрус').getAttribute('aria-pressed')).toBe('true')
  })

  it('returns to the stock palette on request', () => {
    applyBrandVariant('c', true)
    render(<AppearanceView t={t} />)

    fireEvent.click(screen.getByText('Стандартная'))

    expect(resolveBrandVariant()).toBe('stock')
    expect(document.getElementById('apelsinka-brand-tokens')).toBeNull()
  })

  it('explains where the choice is stored', () => {
    render(<AppearanceView t={t} />)

    expect(screen.getByText('Палитра и акцент. Выбор сохраняется в этом браузере.')).toBeDefined()
  })
})
