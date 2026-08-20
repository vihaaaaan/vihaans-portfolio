// Adds a clean white "die-cut sticker" outline to transparent PNGs.
//
// Usage:
//   1. Drop transparent-background PNGs into stickers-raw/
//   2. npm run stickers
//   3. Outlined versions land in public/stickers/, same filenames
//
// How it works: the artwork's alpha mask is blurred and re-thresholded to
// grow it outward by `OUTLINE_WIDTH` px, that grown silhouette is filled
// solid white, and the original artwork is composited on top of it.

import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'

const RAW_DIR = path.join(process.cwd(), 'stickers-raw')
const OUT_DIR = path.join(process.cwd(), 'public', 'stickers')

const OUTLINE_WIDTH = 14 // px, at the source image's native resolution
const PADDING = OUTLINE_WIDTH + 6 // headroom so the grown edge isn't clipped

async function addOutline(inputPath, outputPath) {
  const src = sharp(inputPath).ensureAlpha()
  const { width, height } = await src.metadata()

  const canvasW = width + PADDING * 2
  const canvasH = height + PADDING * 2

  const centered = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: await src.toBuffer(), left: PADDING, top: PADDING }])
    .png()
    .toBuffer()

  // Binary alpha mask of the padded artwork.
  const mask = await sharp(centered).ensureAlpha().extractChannel('alpha').threshold(20).toBuffer()

  // Dilate: blurring softens/spreads the mask edge, re-thresholding low turns
  // that spread into a larger solid region. sharp's blur silently upconverts
  // a single-band image to 3 channels, so re-extract band 0 before treating
  // this as raw single-band alpha data below.
  const grownRaw = await sharp(mask)
    .blur(OUTLINE_WIDTH / 2)
    .threshold(10)
    .extractChannel(0)
    .raw()
    .toBuffer()

  // Solid white RGB, with the grown mask joined on as its alpha channel —
  // this is what actually cuts it to the outline's shape (a plain
  // composite/dest-in against a channel-less mask leaves it fully opaque).
  const whiteRaw = await sharp({
    create: { width: canvasW, height: canvasH, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .raw()
    .toBuffer()

  const whiteOutline = await sharp(whiteRaw, { raw: { width: canvasW, height: canvasH, channels: 3 } })
    .joinChannel(grownRaw, { raw: { width: canvasW, height: canvasH, channels: 1 } })
    .png()
    .toBuffer()

  await sharp(whiteOutline)
    .composite([{ input: centered, blend: 'over' }])
    .png()
    .toFile(outputPath)
}

async function main() {
  await fs.mkdir(RAW_DIR, { recursive: true })
  await fs.mkdir(OUT_DIR, { recursive: true })

  const files = (await fs.readdir(RAW_DIR)).filter((f) => /\.png$/i.test(f))
  if (!files.length) {
    console.log(`No PNGs found in stickers-raw/. Drop transparent-background PNGs there and re-run "npm run stickers".`)
    return
  }

  for (const file of files) {
    await addOutline(path.join(RAW_DIR, file), path.join(OUT_DIR, file))
    console.log(`✓ ${file} -> public/stickers/${file}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
