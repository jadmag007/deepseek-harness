/**
 * Edition numbering for the Apelsinka build of the harness.
 *
 * Upstream declares one product version for the whole workspace, so an edition
 * cannot raise a manifest without desynchronising the CLI and all 322 packages.
 * Packaging already publishes a build version that extends the product version,
 * and that is where the edition's numbering belongs: `EDITION_VERSION` records the
 * edition line the maintainer bumps, and each build publishes
 * `<product>.apelsinka.<date>.<sequence>`.
 *
 * The published value reaches the packaged manifest, so `app.getVersion()` and
 * the About panel show it, and the artifacts carry it in their names. It extends
 * the product version, so it orders above the release it was cut from and
 * `electron-updater` accepts it.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DESKTOP_BUILD_VERSION_ENV, resolveDesktopBuildVersion, validateDesktopBuildVersion } from './desktop-build-version.mjs'

/** File that records the edition's own version, one plain version per line. */
export const EDITION_VERSION_FILENAME = 'EDITION_VERSION'

/** Prerelease field that marks a build as published by this edition. */
export const EDITION_BUILD_FIELD = 'apelsinka'

/** Environment variable that overrides the sequence a build publishes. */
export const EDITION_BUILD_SEQUENCE_ENV = 'DSH_DESKTOP_BUILD_SEQUENCE'

/** Sequence a build publishes when nothing requests another one. */
export const DEFAULT_EDITION_BUILD_SEQUENCE = 1

/**
 * The calendar day a build version carries, in UTC.
 * @param now - Moment the build runs.
 * @returns Eight digits, as the desktop build version prefix expects.
 */
export function editionBuildDate(now) {
  return now.toISOString().slice(0, 10).replaceAll('-', '')
}

/**
 * Read the edition version from disk.
 * @param appRoot - Directory that holds `EDITION_VERSION`.
 * @returns The recorded version, or null when the file is absent or blank.
 */
export function readEditionVersion(appRoot) {
  let text
  try {
    text = readFileSync(join(appRoot, EDITION_VERSION_FILENAME), 'utf8')
  } catch {
    return null
  }
  const version = text.trim()
  return version === '' ? null : version
}

/**
 * Compose the version one packaging run publishes.
 * @param productVersion - Version the manifests declare.
 * @param date - Calendar day the build carries, as returned by `editionBuildDate`.
 * @param sequence - Sequence of the build within that day.
 * @returns The version, in the form `desktop-build-version` validates.
 */
export function editionBuildVersion(productVersion, date, sequence) {
  return validateDesktopBuildVersion(`${productVersion}.${EDITION_BUILD_FIELD}.${date}.${sequence}`, productVersion)
}

/**
 * Resolve what one packaging run publishes.
 *
 * An explicit request wins, so a maintainer can still publish a chosen build
 * version; then the edition numbering, and the plain product version when the
 * edition has no `EDITION_VERSION` at all. Both callers that need to agree on
 * the published version resolve it here, so the packaged manifest and the build
 * record cannot drift apart.
 * @param env - Packaging environment.
 * @param productVersion - Version the manifests declare.
 * @param appRoot - Directory that holds `EDITION_VERSION`.
 * @param now - Moment the build runs; tests pin it to a fixed day.
 * @returns The version the artifacts carry, and the edition line behind it, or
 * null when the edition has none.
 */
export function resolvePublishedBuildVersion(env, productVersion, appRoot, now = new Date()) {
  const requested = env[DESKTOP_BUILD_VERSION_ENV]?.trim()
  if (requested !== undefined && requested !== '') {
    return { version: resolveDesktopBuildVersion(env, productVersion), edition: readEditionVersion(appRoot) }
  }
  const edition = readEditionVersion(appRoot)
  if (edition === null) return { version: productVersion, edition: null }
  const requestedSequence = env[EDITION_BUILD_SEQUENCE_ENV]?.trim()
  const sequence = requestedSequence === undefined || requestedSequence === ''
    ? DEFAULT_EDITION_BUILD_SEQUENCE
    : Number(requestedSequence)
  return { version: editionBuildVersion(productVersion, editionBuildDate(now), sequence), edition }
}