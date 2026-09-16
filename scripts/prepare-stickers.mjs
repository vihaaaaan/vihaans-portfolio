// Turns photos or scans of ink-on-paper drawings into web-ready sticker art.
//
// Usage:
//   1. Draw on white paper in dark pen. Photograph it straight-on, good light.
//   2. Put the file in stickers-raw/:
//        stickers-raw/swing.jpg          -> a still drawing
//        stickers-raw/swing/01.jpg, 02.jpg, ...  -> a flipbook, one file per frame
//   3. npm run stickers
//
// Output lands in public/stickers/ (a flipbook becomes one horizontal strip of
// frames) plus src/data/stickers.generated.ts, which the site imports.
//
// The paper knockout works on brightness: dark strokes become opaque black,
// paper becomes transparent, and the grey in between becomes partial alpha so
// the line keeps its soft drawn edge. Art that already has transparency (an
// export from Procreate, say) skips that step and is used as-is.

import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'

const RAW_DIR = path.join(process.cwd(), 'stickers-raw')
const OUT_DIR = path.join(process.cwd(), 'public', 'stickers')
const MANIFEST = path.join(process.cwd(), 'src', 'data', 'stickers.generated.ts')

// Photographed paper is never pure white and ink is never pure black, and every
// photo is lit differently, so the black/white points are measured per image
// rather than fixed. Paper is whatever brightness most of the page sits at;
// ink is the darkest sliver.
const MIN_SEPARATION = 40 // guards a blank or badly blown-out photo
// Anything fainter than this is paper texture, shadow, or JPEG noise. Raise it
// if grey haze survives around the drawing; lower it if fine lines drop out.
const HAZE_FLOOR = 0.14

const PADDING = 8 // px of transparent breathing room around the trimmed art
const MAX_EDGE = 600 // px per frame; stickers render at ~120px, so this is 3-5x

const IMAGE_RE = /\.(png|jpe?g|webp|heic|tiff?)$/i

/** Ink mask from a photo: brightness in, straight alpha out. */
async function knockOutPaper(file) {
  const src = sharp(file).rotate() // honour EXIF, phones rarely shoot upright
  const meta = await src.metadata()

  // Already cut out (Procreate, Figma, a previous run)? Leave the alpha alone.
  // toColourspace pins this at 4 channels — ensureAlpha on a greyscale source
  // otherwise yields 2, and the stride below would be wrong.
  if (meta.hasAlpha) {
    const { data, info } = await src.toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    let transparent = false
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) { transparent = true; break }
    }
    if (transparent) return { data, width: info.width, height: info.height }
  }

  // Note: sharp's own normalise() is not usable here — on a single-band
  // greyscale image it inverts the range rather than stretching it. Levels are
  // measured from the histogram below instead.
  // greyscale() also leaves the image 3-channel on some inputs, so step by the
  // reported channel count rather than assuming one byte per pixel.
  const { data, info } = await src.greyscale().raw().toBuffer({ resolveWithObject: true })
  const pixels = info.width * info.height
  const { ink, paper } = autoLevels(data, info.channels, pixels)

  const out = Buffer.alloc(pixels * 4)
  const range = paper - ink
  for (let i = 0; i < pixels; i++) {
    const lit = (paper - data[i * info.channels]) / range
    const alpha = (Math.max(0, Math.min(1, lit)) - HAZE_FLOOR) / (1 - HAZE_FLOOR)
    const p = i * 4
    out[p] = 0
    out[p + 1] = 0
    out[p + 2] = 0
    out[p + 3] = Math.round(Math.max(0, alpha) * 255)
  }
  return { data: out, width: info.width, height: info.height }
}

/**
 * Where this particular photo's paper and ink actually sit on the scale.
 *
 * Uses Otsu's method — the brightness that best splits the histogram into two
 * groups — then takes each group's mean. A fixed threshold or a low percentile
 * won't do: line art is only a percent or two of a page, so any percentile you
 * would reach for lands in the paper.
 */
function autoLevels(data, channels, pixels) {
  const histogram = new Uint32Array(256)
  for (let i = 0; i < pixels; i++) histogram[data[i * channels]]++

  let weighted = 0
  for (let v = 0; v < 256; v++) weighted += v * histogram[v]

  let darkSum = 0
  let darkCount = 0
  let bestVariance = -1
  let threshold = 0
  for (let v = 0; v < 256; v++) {
    darkCount += histogram[v]
    if (darkCount === 0) continue
    const lightCount = pixels - darkCount
    if (lightCount === 0) break
    darkSum += v * histogram[v]
    const spread = darkSum / darkCount - (weighted - darkSum) / lightCount
    const variance = darkCount * lightCount * spread * spread
    if (variance > bestVariance) {
      bestVariance = variance
      threshold = v
    }
  }

  let inkSum = 0
  let inkCount = 0
  for (let v = 0; v <= threshold; v++) {
    inkSum += v * histogram[v]
    inkCount += histogram[v]
  }
  const lightCount = pixels - inkCount
  const ink = inkCount ? inkSum / inkCount : 0
  const paper = lightCount ? (weighted - inkSum) / lightCount : 255

  return { ink, paper: Math.max(paper, ink + MIN_SEPARATION) }
}

/** Tightest box containing any non-transparent pixel. */
function inkBounds({ data, width, height }) {
  let left = width, top = height, right = -1, bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 8) continue
      if (x < left) left = x
      if (x > right) right = x
      if (y < top) top = y
      if (y > bottom) bottom = y
    }
  }
  return right < 0 ? null : { left, top, right, bottom }
}

async function build(name, files) {
  const frames = []
  for (const file of files) frames.push(await knockOutPaper(file))

  // Every frame of a flipbook is cropped to the SAME box — the union of all of
  // them. Trimming each frame to its own ink would make the drawing jump around
  // as the outline changes from frame to frame.
  let box = null
  for (const frame of frames) {
    const b = inkBounds(frame)
    if (!b) continue
    box = box
      ? {
          left: Math.min(box.left, b.left),
          top: Math.min(box.top, b.top),
          right: Math.max(box.right, b.right),
          bottom: Math.max(box.bottom, b.bottom),
        }
      : b
  }
  if (!box) throw new Error(`${name}: no ink found — is the drawing too faint, or the photo too dark?`)

  const first = frames[0]
  const left = Math.max(0, box.left - PADDING)
  const top = Math.max(0, box.top - PADDING)
  const width = Math.min(first.width - left, box.right - box.left + PADDING * 2)
  const height = Math.min(first.height - top, box.bottom - box.top + PADDING * 2)

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  const frameW = Math.round(width * scale)
  const frameH = Math.round(height * scale)

  const cropped = []
  for (const frame of frames) {
    cropped.push(
      await sharp(frame.data, { raw: { width: frame.width, height: frame.height, channels: 4 } })
        .extract({ left, top, width, height })
        .resize(frameW, frameH)
        .png()
        .toBuffer()
    )
  }

  // Frames go side by side in one strip so the browser has the whole animation
  // after a single request — no half-loaded flipbook on first play.
  const out = path.join(OUT_DIR, `${name}.png`)
  if (cropped.length === 1) {
    await fs.writeFile(out, cropped[0])
  } else {
    await sharp({
      create: { width: frameW * cropped.length, height: frameH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite(cropped.map((input, i) => ({ input, left: i * frameW, top: 0 })))
      .png()
      .toFile(out)
  }

  return { name, src: `/stickers/${name}.png`, width: frameW, height: frameH, frames: cropped.length }
}

async function main() {
  await fs.mkdir(RAW_DIR, { recursive: true })
  await fs.mkdir(OUT_DIR, { recursive: true })

  const entries = await fs.readdir(RAW_DIR, { withFileTypes: true })
  const jobs = []

  for (const entry of entries) {
    const full = path.join(RAW_DIR, entry.name)
    if (entry.isDirectory()) {
      // A folder is a flipbook. Filenames sort into frame order, so zero-pad
      // them (01, 02, … 10) or frame 10 lands before frame 2.
      const files = (await fs.readdir(full)).filter((f) => IMAGE_RE.test(f)).sort()
      if (files.length) jobs.push([entry.name, files.map((f) => path.join(full, f))])
    } else if (IMAGE_RE.test(entry.name)) {
      jobs.push([entry.name.replace(IMAGE_RE, ''), [full]])
    }
  }

  const art = []
  for (const [name, files] of jobs) {
    const result = await build(name, files)
    art.push(result)
    const kind = result.frames === 1 ? 'still' : `${result.frames} frames`
    console.log(`✓ ${name}  (${kind}, ${result.width}x${result.height})  -> public/stickers/${name}.png`)
  }

  const lines = art
    .map((a) => `  ${a.name}: { src: '${a.src}', width: ${a.width}, height: ${a.height}, frames: ${a.frames} },`)
    .join('\n')

  await fs.writeFile(
    MANIFEST,
    `// Generated by scripts/prepare-stickers.mjs — do not edit by hand.\n` +
      `// Run \`npm run stickers\` after changing anything in stickers-raw/.\n\n` +
      `export interface StickerArt {\n` +
      `  src: string\n` +
      `  /** Size of a single frame, in px. */\n` +
      `  width: number\n` +
      `  height: number\n` +
      `  /** 1 for a still drawing; more means the file is a horizontal strip. */\n` +
      `  frames: number\n` +
      `}\n\n` +
      `export const STICKER_ART = {\n${lines}\n} satisfies Record<string, StickerArt>\n\n` +
      `export type StickerArtName = keyof typeof STICKER_ART\n`
  )
  console.log(`\n✓ src/data/stickers.generated.ts`)

  if (!art.length) {
    console.log('\nNothing in stickers-raw/ yet:')
    console.log('  stickers-raw/swing.jpg        one photo  -> a still drawing')
    console.log('  stickers-raw/swing/01.jpg …   a folder   -> a flipbook, one photo per frame')
  }
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
