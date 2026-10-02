// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { apply, inject } from '../src/client/index.ts'
import { apply as hostApply } from '../src/index.ts'
import { NS, ru } from '../src/client/locales.ts'
import { applyBrandVariant, clearBrandPalette } from '../src/client/palette.ts'

afterEach(() => {
  document.getElementById('apelsinka-brand-tokens')?.remove()
  localStorage.clear()
})

const HOLES = [
  { name: 'sidebar.brand.mark', spec: { kind: 'single', scope: 'root' } },
  { name: 'sidebar.brand.name', spec: { kind: 'single', scope: 'root' } },
  { name: 'conversation.view', spec: { kind: 'list', scope: 'session' } },
] as const

const registered: string[] = []
const disposed: string[] = []

async function bench(declare = true) {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  // The edition's own namespace only: the stock locale catalog is the locale
  // plugin's subject, and this bench asserts the edition's registrations.
  ctx.reflect.provide('locale', {
    register: (_namespace: string, locales: Record<string, Record<string, string>> | string, dict?: Record<string, string>) => {
      registered.push(typeof locales === 'string' ? locales : Object.keys(locales).join(','))
      void dict
      return () => { disposed.push('dictionaries') }
    },
    bind: (namespace: string) => (key: string) => {
      void namespace
      return String(ru[key as keyof typeof ru] ?? key)
    },
  })
  const slots = ctx.get('slots') as SlotRegistry
  const declareHoles = () => slots.register({
    name: 'root',
    children: Object.fromEntries(HOLES.map(hole => [hole.name, hole.spec])),
  } as never, () => null)
  const disposeHoles = declare ? declareHoles() : undefined
  return { ctx, slots, declareHoles, disposeHoles }
}

describe('apelsinka brand plugin', () => {
  it('keeps the host Loader entry inert', () => {
    expect(hostApply).not.toThrow()
  })

  it('declares only the services it reads', () => {
    expect(inject).toEqual(['slots', 'locale'])
  })

  it('publishes built-in dictionaries and the edition language', async () => {
    const subject = await bench()
    await subject.ctx.plugin({ inject: [...inject], apply }).await()

    expect(registered).toContain('zh,en')
    expect(registered).toContain('ru')
    expect(new Set(registered).size).toBe(2)
  })

  it('claims both sidebar brand cells below the official occupant', async () => {
    const subject = await bench()
    await subject.ctx.plugin({ inject: [...inject], apply }).await()

    for (const hole of HOLES.slice(0, 2)) {
      const entries = subject.slots.entries(hole.name)
      expect(entries).toHaveLength(1)
      // A second single-slot registration on an occupied priority throws in the
      // browser; the lowest priority renders in place of the official occupant.
      expect(entries[0]!.options.priority).toBe(-1)
    }
  })

  it('joins the conversation view ring after Chat and Trajectory', async () => {
    const subject = await bench()
    await subject.ctx.plugin({ inject: [...inject], apply }).await()

    const [tab] = subject.slots.entries('conversation.view')
    expect(subject.slots.entries('conversation.view')).toHaveLength(1)
    expect(tab!.options.id).toBe(NS)
    expect(tab!.options.order).toBe(20)
    expect(typeof tab!.options.label === 'function' ? tab!.options.label() : tab!.options.label)
      .toBe('Оформление')
  })

  it('applies the stored palette and leaves the document clean on teardown', async () => {
    applyBrandVariant('a', true)
    const subject = await bench()
    const fiber = subject.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    expect(document.getElementById('apelsinka-brand-tokens')?.textContent).toContain('--dsw-static-deepseek-450')

    await fiber.dispose()
    expect(disposed).toContain('dictionaries')
    expect(document.getElementById('apelsinka-brand-tokens')).toBeNull()
  })

  it('registers after a late declaration and withdraws with the plugin', async () => {
    const late = await bench(false)
    const fiber = late.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    for (const hole of HOLES) expect(late.slots.entries(hole.name)).toHaveLength(0)

    late.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(late.slots.entries(hole.name)).toHaveLength(1)

    await fiber.dispose()
    for (const hole of HOLES) expect(late.slots.entries(hole.name)).toHaveLength(0)
  })
})

describe('palette teardown', () => {
  it('removes the stylesheet it installed', () => {
    applyBrandVariant('c', true)
    clearBrandPalette()

    expect(document.getElementById('apelsinka-brand-tokens')).toBeNull()
  })
})
