// Renders blog covers from the specs in ./specs to src/assets/blog.
//
//   pnpm cover                     render every spec
//   pnpm cover member-get-member   render one (the spec's file name)
//
// A spec named `foo.mjs` writes `src/assets/blog/foo-capa.png`, at 1200x630.

import { readFile, readdir, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { basename, dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import satori from "satori"
import sharp from "sharp"
import { FONT_MONO, FONT_SANS } from "./kit.mjs"
import { HEIGHT, WIDTH, cover } from "./template.mjs"

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, "../..")
const require = createRequire(import.meta.url)

async function loadFonts() {
  const sets = [
    ["work-sans", FONT_SANS, [400, 700, 800]],
    ["ibm-plex-mono", FONT_MONO, [400, 700]],
  ]
  const fonts = []
  for (const [pkg, name, weights] of sets) {
    const dir = dirname(require.resolve(`@fontsource/${pkg}/package.json`))
    for (const weight of weights) {
      // latin covers Portuguese; latin-ext adds the odd extra character.
      for (const subset of ["latin", "latin-ext"]) {
        const file = join(
          dir,
          "files",
          `${pkg}-${subset}-${weight}-normal.woff`,
        )
        fonts.push({
          name,
          weight,
          style: "normal",
          data: await readFile(file),
        })
      }
    }
  }
  // Fallback for symbols Plex Mono doesn't draw (≥, ≤, →): satori looks in
  // the other loaded fonts when a glyph is missing.
  const dejavu = dirname(
    require.resolve("@fontsource/dejavu-mono/package.json"),
  )
  for (const weight of [400, 700]) {
    const file = join(
      dejavu,
      "files",
      `dejavu-mono-latin-${weight}-normal.woff`,
    )
    fonts.push({
      name: "DejaVu Sans Mono",
      weight,
      style: "normal",
      data: await readFile(file),
    })
  }
  return fonts
}

async function main() {
  const only = process.argv[2]
  const specDir = join(here, "specs")
  const files = (await readdir(specDir))
    .filter((f) => f.endsWith(".mjs"))
    .filter((f) => !only || basename(f, ".mjs") === only)
  if (only && files.length === 0) {
    throw new Error(`No spec named "${only}" in scripts/covers/specs`)
  }

  const fonts = await loadFonts()
  for (const file of files) {
    const slug = basename(file, ".mjs")
    const { default: spec } = await import(join(specDir, file))
    const svgMarkup = await satori(cover(spec), {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    })
    const out = join(root, "src/assets/blog", `${slug}-capa.png`)
    const png = await sharp(Buffer.from(svgMarkup))
      .png({ compressionLevel: 9, palette: true })
      .toBuffer()
    await writeFile(out, png)
    console.log(`✓ src/assets/blog/${slug}-capa.png`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
