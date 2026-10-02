/** Electron single-instance ownership before any Desktop profile lifecycle begins. */

/** Arguments a later launch carries, as Electron passes them to the primary process. */
export type DesktopLaunchArguments = readonly string[]

/** Minimal Electron application operations needed for instance ownership. */
export interface DesktopSingleInstanceApplication {
  requestSingleInstanceLock(): boolean
  quit(): void
  on(event: 'second-instance', listener: (event: unknown, argv: string[]) => void): unknown
}

/**
 * Claim the process-lifetime Desktop lock and route later launches to the owner.
 * A jump-list entry reaches the running instance as a later launch carrying its
 * command in `argv`, so the route takes the arguments instead of assuming one.
 * @param application - Electron application singleton.
 * @param routeLaterLaunch - focus, recreate, or act on the arguments of a later launch.
 * @returns true only in the process that may access the Desktop profile.
 */
export function claimDesktopSingleInstance(
  application: DesktopSingleInstanceApplication,
  routeLaterLaunch: (argv: DesktopLaunchArguments) => void,
): boolean {
  if (!application.requestSingleInstanceLock()) {
    application.quit()
    return false
  }
  application.on('second-instance', (_event, argv) => { routeLaterLaunch(argv) })
  return true
}
