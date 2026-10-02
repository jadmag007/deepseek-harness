/** File that records the edition's own version, one plain version per line. */
export const EDITION_VERSION_FILENAME: 'EDITION_VERSION'

/** Prerelease field that marks a build as published by this edition. */
export const EDITION_BUILD_FIELD: 'apelsinka'

/** Environment variable that overrides the sequence a build publishes. */
export const EDITION_BUILD_SEQUENCE_ENV: 'DSH_DESKTOP_BUILD_SEQUENCE'

/** Sequence a build publishes when nothing requests another one. */
export const DEFAULT_EDITION_BUILD_SEQUENCE: 1

/**
 * The calendar day a build version carries, in UTC.
 * @param now - Moment the build runs.
 * @returns Eight digits, as the desktop build version prefix expects.
 */
export function editionBuildDate(now: Date): string

/**
 * Read the edition version from disk.
 * @param appRoot - Directory that holds `EDITION_VERSION`.
 * @returns The recorded version, or null when the file is absent or blank.
 */
export function readEditionVersion(appRoot: string): string | null

/**
 * Compose the version one packaging run publishes.
 * @param productVersion - Version the manifests declare.
 * @param date - Calendar day the build carries, as returned by `editionBuildDate`.
 * @param sequence - Sequence of the build within that day.
 * @returns The version, in the form `desktop-build-version` validates.
 */
export function editionBuildVersion(productVersion: string, date: string, sequence: number): string

/**
 * Resolve what one packaging run publishes.
 * @param env - Packaging environment.
 * @param productVersion - Version the manifests declare.
 * @param appRoot - Directory that holds `EDITION_VERSION`.
 * @param now - Moment the build runs; tests pin it to a fixed day.
 * @returns The version the artifacts carry, and the edition line behind it, or null when the edition has none.
 */
export function resolvePublishedBuildVersion(
  env: NodeJS.ProcessEnv,
  productVersion: string,
  appRoot: string,
  now?: Date,
): { version: string, edition: string | null }