import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_EDITION_BUILD_SEQUENCE,
  EDITION_BUILD_FIELD,
  EDITION_BUILD_SEQUENCE_ENV,
  EDITION_VERSION_FILENAME,
  editionBuildDate,
  editionBuildVersion,
  readEditionVersion,
  resolvePublishedBuildVersion,
} from '../scripts/desktop-edition-version.mjs'

const PRODUCT_VERSION = '0.2.0-rc.2'
const BUILD_DATE = '20261003'
const NOW = new Date('2026-10-03T12:00:00Z')

let appRoot: string

beforeEach(() => {
  appRoot = mkdtempSync(join(tmpdir(), 'dsh-edition-version-'))
})

afterEach(() => {
  rmSync(appRoot, { force: true, recursive: true })
})

describe('editionBuildDate', () => {
  it('reports the UTC calendar day without separators', () => {
    expect(editionBuildDate(NOW)).toBe(BUILD_DATE)
  })
})

describe('readEditionVersion', () => {
  it('returns null when the file is absent', () => {
    expect(readEditionVersion(appRoot)).toBeNull()
  })

  it('returns null when the file is blank', () => {
    writeFileSync(join(appRoot, EDITION_VERSION_FILENAME), ' \n')
    expect(readEditionVersion(appRoot)).toBeNull()
  })

  it('trims the recorded version', () => {
    writeFileSync(join(appRoot, EDITION_VERSION_FILENAME), '0.1.0\n')
    expect(readEditionVersion(appRoot)).toBe('0.1.0')
  })
})

describe('editionBuildVersion', () => {
  it('extends the product version with the edition field, the day and the sequence', () => {
    expect(editionBuildVersion(PRODUCT_VERSION, BUILD_DATE, 1)).toBe(`${PRODUCT_VERSION}.${EDITION_BUILD_FIELD}.${BUILD_DATE}.1`)
  })

  it('orders above the product version it was cut from', () => {
    expect(editionBuildVersion(PRODUCT_VERSION, BUILD_DATE, 1) > PRODUCT_VERSION).toBe(true)
  })
})

describe('resolvePublishedBuildVersion', () => {
  beforeEach(() => {
    writeFileSync(join(appRoot, EDITION_VERSION_FILENAME), '0.1.0\n')
  })

  it('publishes the edition numbering', () => {
    expect(resolvePublishedBuildVersion({}, PRODUCT_VERSION, appRoot, NOW)).toEqual({
      version: `${PRODUCT_VERSION}.${EDITION_BUILD_FIELD}.${BUILD_DATE}.${DEFAULT_EDITION_BUILD_SEQUENCE}`,
      edition: '0.1.0',
    })
  })

  it('keeps the edition numbering with an explicitly requested build version', () => {
    const env = { DSH_DESKTOP_BUILD_VERSION: `${PRODUCT_VERSION}.${EDITION_BUILD_FIELD}.${BUILD_DATE}.7` }
    expect(resolvePublishedBuildVersion(env, PRODUCT_VERSION, appRoot, NOW)).toEqual({
      version: `${PRODUCT_VERSION}.${EDITION_BUILD_FIELD}.${BUILD_DATE}.7`,
      edition: '0.1.0',
    })
  })

  it('rejects an explicitly requested build version that does not extend the product version', () => {
    const env = { DSH_DESKTOP_BUILD_VERSION: '9.9.9' }
    expect(() => resolvePublishedBuildVersion(env, PRODUCT_VERSION, appRoot, NOW)).toThrow(/must extend product version/)
  })

  it('takes the sequence from the environment', () => {
    const env = { [EDITION_BUILD_SEQUENCE_ENV]: '4' }
    expect(resolvePublishedBuildVersion(env, PRODUCT_VERSION, appRoot, NOW).version)
      .toBe(`${PRODUCT_VERSION}.${EDITION_BUILD_FIELD}.${BUILD_DATE}.4`)
  })

  it('ignores a blank sequence request', () => {
    const env = { [EDITION_BUILD_SEQUENCE_ENV]: '  ' }
    expect(resolvePublishedBuildVersion(env, PRODUCT_VERSION, appRoot, NOW).version)
      .toBe(`${PRODUCT_VERSION}.${EDITION_BUILD_FIELD}.${BUILD_DATE}.${DEFAULT_EDITION_BUILD_SEQUENCE}`)
  })

  it('falls back to the product version when the edition records none', () => {
    rmSync(join(appRoot, EDITION_VERSION_FILENAME))
    expect(resolvePublishedBuildVersion({}, PRODUCT_VERSION, appRoot, NOW)).toEqual({
      version: PRODUCT_VERSION,
      edition: null,
    })
  })

  it('reports no edition alongside an explicitly requested build version', () => {
    rmSync(join(appRoot, EDITION_VERSION_FILENAME))
    const env = { DSH_DESKTOP_BUILD_VERSION: `${PRODUCT_VERSION}.${EDITION_BUILD_FIELD}.${BUILD_DATE}.2` }
    expect(resolvePublishedBuildVersion(env, PRODUCT_VERSION, appRoot, NOW)).toEqual({
      version: `${PRODUCT_VERSION}.${EDITION_BUILD_FIELD}.${BUILD_DATE}.2`,
      edition: null,
    })
  })
})
