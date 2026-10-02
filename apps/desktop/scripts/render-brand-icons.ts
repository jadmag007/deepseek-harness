/**
 * Render every Apelsinka edition bitmap from `resources/icon.svg`.
 *
 * One canonical vector — the orange slice — feeds the executable icon, the
 * macOS card, and the Windows tray. Each size is rasterized from that vector
 * separately rather than downscaled from one large bitmap, so edges stay crisp
 * at every scale; the committed files under `resources/` are the output, and
 * this is the only thing that writes them. Rerun after changing the vector.
 *
 * `render-tray-icon.ts` stays the stock whale tool: it expects the upstream
 * `tray-glyph` group, which this edition's artwork replaces.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { packIco, TRAY_ICON_SIZES } from './render-tray-icon.ts'

/** Coordinate space of the vector source; sharp's SVG density is scaled against it. */
const SOURCE_EDGE = 64
const SOURCE_DENSITY = 72

/** Edge of the executable icon and of the macOS card; electron-builder needs at least 512. */
const APPLICATION_ICON_EDGE = 512

/** Card colour behind the macOS artwork, matching the edition's dark surfaces. */
const CARD_COLOR = { r: 30, g: 27, b: 24, alpha: 1 }

/** Vector source and committed outputs of the edition artwork. */
export const BRAND_ICON_PATHS = {
  source: fileURLToPath(new URL('../resources/icon.svg', import.meta.url)),
  outputs: [
    fileURLToPath(new URL('../resources/icon.png', import.meta.url)),
    fileURLToPath(new URL('../resources/icon-windows.png', import.meta.url)),
    fileURLToPath(new URL('../resources/icon-macos.png', import.meta.url)),
  ],
  tray: fileURLToPath(new URL('../resources/tray-windows.ico', import.meta.url)),
} as const

/**
 * Rasterize the vector source at one edge.
 * @param svg - SVG document with a square `SOURCE_EDGE` viewBox.
 * @param size - Bitmap edge to render.
 * @returns the PNG bytes.
 */
export async function renderBrandPng(svg: Buffer, size: number): Promise<Buffer> {
  return sharp(svg, { density: SOURCE_DENSITY * size / SOURCE_EDGE }).resize(size, size).png().toBuffer()
}

/**
 * Render the macOS card: the artwork over the edition's dark tile.
 * @param svg - SVG document with a square `SOURCE_EDGE` viewBox.
 * @param size - Bitmap edge to render.
 * @returns the PNG bytes.
 */
export async function renderBrandCardPng(svg: Buffer, size: number): Promise<Buffer> {
  const artwork = await renderBrandPng(svg, size)
  return sharp({ create: { width: size, height: size, channels: 4, background: CARD_COLOR } })
    .composite([{ input: artwork, top: 0, left: 0 }])
    .png()
    .toBuffer()
}

async function main(): Promise<void> {
  const svg = await readFile(BRAND_ICON_PATHS.source)
  for (const output of BRAND_ICON_PATHS.outputs) {
    const card = output.endsWith('icon-macos.png')
    await writeFile(output, card
      ? await renderBrandCardPng(svg, APPLICATION_ICON_EDGE)
      : await renderBrandPng(svg, APPLICATION_ICON_EDGE))
  }
  const entries = await Promise.all(TRAY_ICON_SIZES.map(async size => ({
    size, png: await renderBrandPng(svg, size),
  })))
  await writeFile(BRAND_ICON_PATHS.tray, packIco(entries))
  console.info(`brand icons: wrote ${String(BRAND_ICON_PATHS.outputs.length + 1)} files from ${BRAND_ICON_PATHS.source}`)
}

if (process.argv[1] !== undefined && import.meta.filename === resolve(process.argv[1])) await main()
